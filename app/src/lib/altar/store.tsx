import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useSession } from '../session';
import { supabase } from '../supabase';
// Registers the artwork sizes the geometry needs.
import './assets';
import {
  customBackgroundFromRow,
  customItemFromLocal,
  customItemFromRow,
  type CustomBackgroundRow,
  type CustomCabinetRow,
} from './cabinet';
import {
  altarDataFromDocument,
  altarFromRow,
  draftFromDocument,
  LOCAL_ALTARS_KEY,
  LOCAL_CUSTOM_CABINET_KEY,
  localSave,
  parseLocalAltars,
  sortAltars,
  WORKING_DRAFT_KEY,
  type AltarDocument,
} from './snapshot';
import type { AltarBackground, CabinetItem, SavedAltar, SavedAltarRow } from './types';

// Signed in: saved_altars, custom_cabinet_items, custom_altar_backgrounds and
// custom_cabinet_image_overrides from Supabase, with an offline copy on the
// device (the same pattern as the grimoire store).
// Guest: the same localStorage keys and shapes the website uses for guests.

type Status = 'idle' | 'loading' | 'ready' | 'offline' | 'error';

type AltarSnapshot = {
  fetchedAt: string;
  altars: SavedAltar[];
  customItems: CabinetItem[];
  backgrounds: AltarBackground[];
  overrides: Record<string, string>;
};

type SaveRequest = { id: string | null; name: string; doc: AltarDocument };

type AltarState = {
  signedIn: boolean;
  status: Status;
  error: string | null;
  altars: SavedAltar[];
  customItems: CabinetItem[];
  backgrounds: AltarBackground[];
  overrides: Record<string, string>;
  draft: SavedAltar | null;
  refresh: () => Promise<void>;
  /** Save to an existing altar (id) or as a new one (id null). Returns the saved altar's id. */
  save: (request: SaveRequest) => Promise<string>;
  remove: (id: string) => Promise<void>;
  saveDraft: (doc: AltarDocument, sourceId: string | null) => void;
  clearDraft: () => Promise<void>;
  draftSourceId: string | null;
};

const AltarContext = createContext<AltarState | null>(null);

const cacheKey = (userId: string) => `altar.snapshot.${userId}`;
/** App-only: which saved altar the working draft came from. */
const DRAFT_SOURCE_KEY = 'altar.app.draftSource';

async function fetchSnapshot(): Promise<AltarSnapshot> {
  // Row-level security limits every query to the signed-in person's rows.
  const [altars, items, backgrounds, overrides] = await Promise.all([
    supabase.from('saved_altars').select('id,name,altar_data,created_at,updated_at').order('created_at', { ascending: false }),
    supabase
      .from('custom_cabinet_items')
      .select('id,category,name,keywords,entity_id,image_url,item_type,form_label,forms')
      .order('created_at', { ascending: false }),
    supabase.from('custom_altar_backgrounds').select('id,name,image_url').order('created_at', { ascending: false }),
    supabase.from('custom_cabinet_image_overrides').select('override_key,image_url'),
  ]);
  const failed = [altars, items, backgrounds, overrides].find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  return {
    fetchedAt: new Date().toISOString(),
    altars: ((altars.data ?? []) as SavedAltarRow[]).map(altarFromRow),
    customItems: ((items.data ?? []) as CustomCabinetRow[]).map(customItemFromRow),
    backgrounds: ((backgrounds.data ?? []) as CustomBackgroundRow[]).map(customBackgroundFromRow),
    overrides: Object.fromEntries(
      ((overrides.data ?? []) as { override_key: string; image_url: string }[]).map((r) => [r.override_key, r.image_url]),
    ),
  };
}

async function readLocal(): Promise<AltarSnapshot> {
  const [altarsRaw, itemsRaw] = await Promise.all([
    AsyncStorage.getItem(LOCAL_ALTARS_KEY),
    AsyncStorage.getItem(LOCAL_CUSTOM_CABINET_KEY),
  ]);
  let items: CabinetItem[] = [];
  try {
    const parsed = itemsRaw ? JSON.parse(itemsRaw) : [];
    items = Array.isArray(parsed) ? parsed.map(customItemFromLocal).filter((i): i is CabinetItem => !!i) : [];
  } catch {
    items = [];
  }
  return { fetchedAt: new Date().toISOString(), altars: parseLocalAltars(altarsRaw), customItems: items, backgrounds: [], overrides: {} };
}

export function AltarProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [snapshot, setSnapshot] = useState<AltarSnapshot | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<SavedAltar | null>(null);
  const [draftSourceId, setDraftSourceId] = useState<string | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      if (!userId) {
        setSnapshot(await readLocal());
        setStatus('ready');
        return;
      }
      const fresh = await fetchSnapshot();
      setSnapshot(fresh);
      setStatus('ready');
      await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(fresh));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('offline');
    }
  }, [userId]);

  useEffect(() => {
    setSnapshot(null);
    setStatus('idle');
    let active = true;
    const cached = userId ? AsyncStorage.getItem(cacheKey(userId)) : Promise.resolve(null);
    Promise.all([cached, AsyncStorage.getItem(WORKING_DRAFT_KEY), AsyncStorage.getItem(DRAFT_SOURCE_KEY)])
      .then(([cachedSnapshot, draftRaw, source]) => {
        if (!active) return;
        if (cachedSnapshot) setSnapshot(JSON.parse(cachedSnapshot) as AltarSnapshot);
        try {
          const parsed = draftRaw ? JSON.parse(draftRaw) : null;
          setDraft(parsed && Array.isArray(parsed.objects) ? (parsed as SavedAltar) : null);
        } catch {
          setDraft(null);
        }
        setDraftSourceId(source || null);
      })
      .catch(() => {})
      .finally(() => {
        if (active) refresh();
      });
    return () => {
      active = false;
    };
  }, [userId, refresh]);

  const writeLocalAltars = useCallback(async (altars: SavedAltar[]) => {
    await AsyncStorage.setItem(LOCAL_ALTARS_KEY, JSON.stringify(altars));
    setSnapshot((prev) => ({ ...(prev ?? { fetchedAt: '', customItems: [], backgrounds: [], overrides: {} }), altars }));
  }, []);

  const save = useCallback(
    async ({ id, name, doc }: SaveRequest) => {
      const now = new Date().toISOString();
      const cleanName = name.trim() || 'My Altar';
      const data = altarDataFromDocument(doc, cleanName, now);

      if (!userId) {
        // Guest: storage.js saveAltar/renameSavedAltar on localStorage.
        const altars = parseLocalAltars(await AsyncStorage.getItem(LOCAL_ALTARS_KEY));
        const index = id ? altars.findIndex((a) => a.id === id) : -1;
        if (index >= 0) {
          altars[index] = { ...altars[index], ...data, id: altars[index].id, name: cleanName, updatedAt: now };
          await writeLocalAltars(altars);
          return altars[index].id;
        }
        const created = localSave(data);
        await writeLocalAltars([created, ...altars]);
        return created.id;
      }

      if (id) {
        const { data: row, error: updateError } = await supabase
          .from('saved_altars')
          .update({ name: cleanName, altar_data: data, updated_at: now })
          .eq('id', id)
          .eq('user_id', userId)
          .select('id,name,altar_data,created_at,updated_at')
          .single();
        if (updateError) throw new Error(updateError.message);
        const saved = altarFromRow(row as SavedAltarRow);
        setSnapshot((prev) => prev && { ...prev, altars: prev.altars.map((a) => (a.id === id ? saved : a)) });
        return saved.id;
      }

      const { data: row, error: insertError } = await supabase
        .from('saved_altars')
        .insert({ user_id: userId, name: cleanName, altar_data: data })
        .select('id,name,altar_data,created_at,updated_at')
        .single();
      if (insertError) throw new Error(insertError.message);
      const saved = altarFromRow(row as SavedAltarRow);
      setSnapshot((prev) => prev && { ...prev, altars: [saved, ...prev.altars] });
      return saved.id;
    },
    [userId, writeLocalAltars],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!userId) {
        const altars = parseLocalAltars(await AsyncStorage.getItem(LOCAL_ALTARS_KEY));
        await writeLocalAltars(altars.filter((a) => a.id !== id));
        return;
      }
      const { error: deleteError } = await supabase.from('saved_altars').delete().eq('id', id).eq('user_id', userId);
      if (deleteError) throw new Error(deleteError.message);
      setSnapshot((prev) => prev && { ...prev, altars: prev.altars.filter((a) => a.id !== id) });
    },
    [userId, writeLocalAltars],
  );

  // The website keeps one working draft, saved 250 ms after each change.
  const saveDraft = useCallback((doc: AltarDocument, sourceId: string | null) => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      const next = draftFromDocument(doc, new Date().toISOString());
      setDraft(next);
      setDraftSourceId(sourceId);
      AsyncStorage.setItem(WORKING_DRAFT_KEY, JSON.stringify(next)).catch(() => {});
      if (sourceId) AsyncStorage.setItem(DRAFT_SOURCE_KEY, sourceId).catch(() => {});
      else AsyncStorage.removeItem(DRAFT_SOURCE_KEY).catch(() => {});
    }, 250);
  }, []);

  const clearDraft = useCallback(async () => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    setDraft(null);
    setDraftSourceId(null);
    await AsyncStorage.multiRemove([WORKING_DRAFT_KEY, DRAFT_SOURCE_KEY]);
  }, []);

  const value = useMemo<AltarState>(
    () => ({
      signedIn: !!userId,
      status,
      error,
      altars: sortAltars(snapshot?.altars ?? []),
      customItems: snapshot?.customItems ?? [],
      backgrounds: snapshot?.backgrounds ?? [],
      overrides: snapshot?.overrides ?? {},
      draft,
      draftSourceId,
      refresh,
      save,
      remove,
      saveDraft,
      clearDraft,
    }),
    [userId, status, error, snapshot, draft, draftSourceId, refresh, save, remove, saveDraft, clearDraft],
  );

  return <AltarContext.Provider value={value}>{children}</AltarContext.Provider>;
}

export function useAltars(): AltarState {
  const value = useContext(AltarContext);
  if (!value) throw new Error('useAltars must be used inside AltarProvider');
  return value;
}
