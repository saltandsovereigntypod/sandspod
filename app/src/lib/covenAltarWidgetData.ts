// The coven altars on the Altar widget: fetched as the coven keeps them
// (lib/covens/altarSync.ts), kept on the phone so the widget still shows them
// offline, and changed by what was tapped on the widget through the coven's
// own save (changeAltarOnce), so everyone in the coven sees it. The rules for
// which altar sits where, and when taps may change it, are in covenAltarWidget.ts.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { SavedAltar, SavedObject } from './altar/types';
import type { WidgetAction } from './altarWidget';
import { applyWidgetAction } from './altarWidget';
import { canTendFromWidget, covenSavedAltar, mergeCovenFetch, type CovenWidgetEntry } from './covenAltarWidget';
import { ALTAR_FIELDS, altarAccess, changeAltarOnce, documentFromRows, type CovenAltar } from './covens/altarSync';
import { supabase } from './supabase';

const KEY = 'altar.widgetCovenAltars';
/** A fetch this recent is good enough when nothing asked for a fresh one. */
const FRESH_MS = 60_000;

let kept: Record<string, CovenWidgetEntry> = {};
let keptList: SavedAltar[] = [];
let loaded: Promise<void> | null = null;
let lastFetch = 0;
const listeners = new Set<() => void>();

function keep(next: Record<string, CovenWidgetEntry>) {
  kept = next;
  keptList = Object.values(next).map(covenSavedAltar);
  listeners.forEach((l) => l());
  AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
}

function load(): Promise<void> {
  loaded ??= AsyncStorage.getItem(KEY)
    .then((raw) => {
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object' && !Object.keys(kept).length) {
        kept = parsed as Record<string, CovenWidgetEntry>;
        keptList = Object.values(kept).map(covenSavedAltar);
        listeners.forEach((l) => l());
      }
    })
    .catch(() => {});
  return loaded;
}

/** The coven altars kept for the widget, shaped like your own (for the Home screen sheet). */
export function useCovenWidgetAltars(): SavedAltar[] {
  return useSyncExternalStore(
    (listener) => {
      void load();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => keptList,
  );
}

export const covenWidgetEntry = (altarId: string): CovenWidgetEntry | undefined => kept[altarId];

/** Fetch the altars, their coven's name and whether taps may change them. Throws when the database can't be reached. */
async function fetchEntries(ids: string[]): Promise<CovenWidgetEntry[]> {
  const [{ data: altars, error: altarError }, { data: rows, error: rowError }] = await Promise.all([
    supabase.from('coven_altars').select(ALTAR_FIELDS).in('id', ids),
    supabase.from('coven_altar_objects').select('altar_id,object_key,position,data').in('altar_id', ids),
  ]);
  if (altarError || rowError) throw new Error((altarError ?? rowError)!.message);
  const found = (altars ?? []) as CovenAltar[];
  if (!found.length) return [];
  const covenIds = [...new Set(found.map((a) => a.coven_id))];
  const { data: covens, error: covenError } = await supabase.from('covens').select('id,name,slug').in('id', covenIds);
  if (covenError) throw new Error(covenError.message);
  const covenOf = new Map(((covens ?? []) as { id: string; name: string; slug: string }[]).map((c) => [c.id, c]));
  const now = new Date().toISOString();
  return Promise.all(
    found.map(async (altar) => {
      const access = await altarAccess(altar.id).catch(() => null);
      const coven = covenOf.get(altar.coven_id);
      const mine = ((rows ?? []) as { altar_id: string; object_key: string; position: number; data: SavedObject }[]).filter((r) => r.altar_id === altar.id);
      return {
        altarId: altar.id,
        covenId: altar.coven_id,
        covenName: coven?.name ?? '',
        covenSlug: coven?.slug ?? '',
        altarName: altar.name,
        archived: !!altar.archived_at,
        doc: documentFromRows(altar, mine),
        tendable: canTendFromWidget(access),
        updatedAt: altar.updated_at,
        fetchedAt: now,
      };
    }),
  );
}

/**
 * The coven altars in the widget's places, fresh from the coven when it can be
 * reached (or when `fresh` isn't asked and the last fetch was moments ago), else
 * as kept. `onGone` hears of altars that are gone for good (deleted, or you've
 * left the coven), so their places can be emptied.
 */
export async function loadCovenWidgetAltars(ids: string[], fresh: boolean, onGone: (altarId: string) => void): Promise<CovenWidgetEntry[]> {
  await load();
  if (!ids.length) {
    if (Object.keys(kept).length) keep({});
    return [];
  }
  const { data: session } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
  // Signed out: show nothing of the coven's, but keep the places for when you're back.
  if (!session.session) return [];
  const known = ids.every((id) => kept[id]);
  if (!fresh && known && Date.now() - lastFetch < FRESH_MS) return ids.map((id) => kept[id]);
  let fetched: { ok: true; entries: CovenWidgetEntry[] } | { ok: false };
  try {
    fetched = { ok: true, entries: await fetchEntries(ids) };
    lastFetch = Date.now();
  } catch {
    fetched = { ok: false };
  }
  const { entries, gone } = mergeCovenFetch(ids, kept, fetched);
  keep(entries);
  gone.forEach(onGone);
  return ids.map((id) => entries[id]).filter((e): e is CovenWidgetEntry => !!e);
}

/**
 * Carry out what was tapped on the widget for one coven altar, through the
 * coven's own save. Returns true when the taps are done with (carried out, or
 * refused because you can't tend it now), false to try again later (offline).
 */
export async function applyCovenWidgetActions(altarId: string, actions: WidgetAction[]): Promise<boolean> {
  let access;
  try {
    access = await altarAccess(altarId);
  } catch {
    return false;
  }
  // Asked again now: a ritual may have begun, or the keeper locked it, since the tap.
  if (!canTendFromWidget(access)) return true;
  const now = new Date().toISOString();
  const ordered = [...actions].sort((a, b) => a.at.localeCompare(b.at));
  try {
    await changeAltarOnce(altarId, (doc) => ordered.reduce((d, action) => applyWidgetAction(d, action, now), doc));
    lastFetch = 0;
    return true;
  } catch (e) {
    const code = (e as { code?: string }).code;
    // Refused by the coven's rules, or the altar is gone: let them go.
    if (code === '42501' || code === 'P0001' || code === '23514' || /not found/i.test(e instanceof Error ? e.message : '')) return true;
    return false;
  }
}
