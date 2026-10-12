// Your own things: custom cabinet items and apothecary workings, shared by the
// altar, the spell builder and anywhere else that lists ingredients. Signed
// in they live in `custom_cabinet_items` and `apothecary_items` (with a copy
// on the device for offline use); guests keep them on the device under the
// website's guest keys. No provider: any screen can call useWorkshop().

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { ingredientRelationRows } from '../library/connections';
import { connectRelations, ingredientEntityIds, putLibraryEntry, removeLibraryEntry } from '../library/store';
import { useSession } from '../session';
import { supabase } from '../supabase';
import { trackSave } from '../sync/store';
import { apothecaryPractice, apothecaryRow, ingredientLibraryRef, normalizeApothecary, type ApothecaryItem } from './apothecary';
import { customItemFromLocal, customItemFromRow, type CustomCabinetRow } from './cabinet';
import {
  customForms,
  customItemLocal,
  customItemPractice,
  customItemRow,
  customItemProblem,
  ITEM_TYPE,
  type ChosenForm,
  type CustomCategory,
} from './custom';
import { keepImageOnDevice, removeUploaded, uploadImage, type PickedImage } from './images';
import { addObjectInstanceEvent, createObjectInstance } from './instanceStore';
import { apothecaryInstanceInput, createdEvent, recipeUpdatedEvent, TENDING_BLEND_LIVING } from './instances';
import { LOCAL_CUSTOM_CABINET_KEY } from './snapshot';
import type { CabinetItem } from './types';
import { newId } from './uid';

export const LOCAL_APOTHECARY_KEY = 'saltAndSovereigntyApothecaryItems';
const cacheKey = (userId: string) => `workshop.${userId}`;

type State = { owner: string | null | undefined; customItems: CabinetItem[]; apothecary: ApothecaryItem[]; status: 'idle' | 'loading' | 'ready' | 'offline' };
let state: State = { owner: undefined, customItems: [], apothecary: [], status: 'idle' };
const listeners = new Set<() => void>();
let loadingFor: string | null | undefined;

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function parseList(raw: string | null): Record<string, unknown>[] {
  try {
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x) => x && typeof x === 'object') : [];
  } catch {
    return [];
  }
}

export async function loadWorkshop(userId: string | null, force = false) {
  if (!force && loadingFor === userId && state.owner === userId) return;
  loadingFor = userId;
  if (state.owner !== userId) set({ owner: userId, customItems: [], apothecary: [], status: 'loading' });

  if (!userId) {
    const [items, apothecary] = await Promise.all([AsyncStorage.getItem(LOCAL_CUSTOM_CABINET_KEY), AsyncStorage.getItem(LOCAL_APOTHECARY_KEY)]);
    if (state.owner !== null) return;
    set({
      customItems: parseList(items).map(customItemFromLocal).filter((i): i is CabinetItem => !!i),
      apothecary: parseList(apothecary).map(normalizeApothecary),
      status: 'ready',
    });
    return;
  }

  try {
    const cached = await AsyncStorage.getItem(cacheKey(userId));
    if (cached && state.owner === userId && state.status !== 'ready') {
      const parsed = JSON.parse(cached) as { items: CustomCabinetRow[]; apothecary: Record<string, unknown>[] };
      set({ customItems: parsed.items.map(customItemFromRow), apothecary: parsed.apothecary.map(normalizeApothecary) });
    }
  } catch {
    // No copy yet.
  }
  try {
    const [items, apothecary] = await Promise.all([
      supabase.from('custom_cabinet_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('apothecary_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    if (items.error) throw items.error;
    if (apothecary.error) throw apothecary.error;
    if (state.owner !== userId) return;
    const rows = (items.data ?? []) as CustomCabinetRow[];
    const made = (apothecary.data ?? []) as Record<string, unknown>[];
    set({ customItems: rows.map(customItemFromRow), apothecary: made.map(normalizeApothecary), status: 'ready' });
    AsyncStorage.setItem(cacheKey(userId), JSON.stringify({ items: rows, apothecary: made })).catch(() => {});
  } catch {
    if (state.owner === userId) set({ status: 'offline' });
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useWorkshop() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const snap = useSyncExternalStore(subscribe, () => state, () => state);
  useEffect(() => {
    void loadWorkshop(userId);
  }, [userId]);
  const mine = snap.owner === userId;
  return {
    userId,
    customItems: mine ? snap.customItems : [],
    apothecary: mine ? snap.apothecary : [],
    status: mine ? snap.status : 'loading',
    refresh: () => loadWorkshop(userId, true),
  };
}

// ---------------------------------------------------------------- custom items

/** A form being edited: an existing picture, a newly picked one, or none. */
export type FormDraft = { label: string; enabled: boolean; image?: string; storagePath?: string; picked?: PickedImage | null };

export type CustomItemDraft = {
  editing: CabinetItem | null;
  category: CustomCategory;
  name: string;
  keywords: string[];
  /** Link to an existing Library entry, or make a new My Practice entry with these notes. */
  link: { mode: 'existing'; entityId: string } | { mode: 'new'; notes: string };
  forms: FormDraft[];
};

export function saveCustomItem(userId: string | null, draft: CustomItemDraft): Promise<CabinetItem> {
  return trackSave(userId, () => saveCustomItemNow(userId, draft));
}

async function saveCustomItemNow(userId: string | null, draft: CustomItemDraft): Promise<CabinetItem> {
  const now = new Date().toISOString();
  const wanted = draft.forms.filter((f) => f.enabled && (f.picked || f.image));
  if (!draft.name.trim()) throw new Error('Add a name first.');
  if (!wanted.length) throw new Error('Choose at least one form and add a picture.');
  if (draft.link.mode === 'existing' && !draft.link.entityId) throw new Error('Choose a Living Library entry or create a new one.');

  // Pictures first: nothing is written until they're all safely stored.
  const id = draft.editing?.customCabinetItemId || newId();
  const chosen: ChosenForm[] = [];
  for (const form of wanted) {
    if (form.picked) {
      if (userId) {
        const { url, storagePath } = await uploadImage(userId, form.picked, 'custom-cabinet-items');
        chosen.push({ label: form.label, image: url, storagePath });
      } else {
        chosen.push({ label: form.label, image: await keepImageOnDevice(form.picked, 'custom-cabinet-items') });
      }
    } else if (form.image) {
      chosen.push({ label: form.label, image: form.image, storagePath: form.storagePath });
    }
  }

  const entityId =
    draft.link.mode === 'existing'
      ? draft.link.entityId
      : draft.editing?.entityId ||
        (await putLibraryEntry({ userId, name: draft.name, type: ITEM_TYPE[draft.category], myPractice: customItemPractice(draft.category, draft.link.notes) }));

  const forms = customForms(draft.category, chosen, entityId);
  const input = { category: draft.category, name: draft.name, keywords: draft.keywords, entityId, forms, libraryMode: draft.link.mode };
  const problem = customItemProblem(input);
  if (problem) throw new Error(problem);

  if (userId) {
    const row = customItemRow(userId, input, now);
    const result = draft.editing
      ? await supabase.from('custom_cabinet_items').update(row).eq('user_id', userId).eq('id', id)
      : await supabase.from('custom_cabinet_items').insert({ id, ...row });
    if (result.error) throw new Error(result.error.message);
    // Pictures that were replaced or removed.
    const kept = new Set(chosen.map((c) => c.storagePath).filter(Boolean));
    const before = (draft.editing?.forms ?? []).map((f) => (f as { storagePath?: string }).storagePath).filter((p): p is string => !!p);
    await removeUploaded(before.filter((p) => !kept.has(p)));
  } else {
    const list = parseList(await AsyncStorage.getItem(LOCAL_CUSTOM_CABINET_KEY));
    const local = customItemLocal(id, input, (list.find((x) => x.id === id)?.createdAt as string) ?? now);
    const next = draft.editing ? list.map((x) => (x.id === id ? local : x)) : [local, ...list];
    await AsyncStorage.setItem(LOCAL_CUSTOM_CABINET_KEY, JSON.stringify(next));
  }
  await loadWorkshop(userId, true);
  return state.customItems.find((i) => i.customCabinetItemId === id) ?? customItemFromLocal(customItemLocal(id, input, now))!;
}

/** Delete an item (its Living Library entry stays, as on the website). */
export async function deleteCustomItem(userId: string | null, item: CabinetItem): Promise<void> {
  const id = item.customCabinetItemId;
  if (!id) return;
  if (userId) {
    const { error } = await supabase.from('custom_cabinet_items').delete().eq('user_id', userId).eq('id', id);
    if (error) throw new Error(error.message);
    await removeUploaded(item.forms.map((f) => (f as { storagePath?: string }).storagePath).filter((p): p is string => !!p));
  } else {
    const list = parseList(await AsyncStorage.getItem(LOCAL_CUSTOM_CABINET_KEY));
    await AsyncStorage.setItem(LOCAL_CUSTOM_CABINET_KEY, JSON.stringify(list.filter((x) => x.id !== id)));
  }
  await loadWorkshop(userId, true);
}

// ---------------------------------------------------------------- apothecary

/** Save a working (new or edited) with its Living Library entry. Returns it as saved. */
export function saveApothecary(userId: string | null, item: ApothecaryItem, picked: PickedImage | null): Promise<ApothecaryItem> {
  return trackSave(userId, () => saveApothecaryNow(userId, item, picked));
}

async function saveApothecaryNow(userId: string | null, item: ApothecaryItem, picked: PickedImage | null): Promise<ApothecaryItem> {
  const now = new Date().toISOString();
  let next: ApothecaryItem = { ...item, id: item.id || newId(), createdAt: item.createdAt || now, updatedAt: now };
  if (picked) {
    next.imagePath = userId
      ? (await uploadImage(userId, picked, 'apothecary')).url
      : await keepImageOnDevice(picked, 'apothecary');
  }
  next = await withLibraryEntry(userId, next);
  const existed = !!item.id && state.apothecary.some((a) => a.id === item.id);

  if (userId) {
    // A new working is tracked as an object instance from the start, with a "created" event (apothecary.js).
    if (!existed && !next.instanceId) {
      const instance = await createObjectInstance(userId, apothecaryInstanceInput(next));
      if (instance?.id) {
        next.instanceId = instance.id;
        await addObjectInstanceEvent(userId, instance, createdEvent(next));
      }
    }
    const { error } = await supabase.from('apothecary_items').upsert(apothecaryRow(userId, next, now), { onConflict: 'id' });
    if (error) throw new Error(error.message);
    if (existed && next.instanceId) await addObjectInstanceEvent(userId, next.instanceId, recipeUpdatedEvent(next));
  } else {
    const list = parseList(await AsyncStorage.getItem(LOCAL_APOTHECARY_KEY));
    const rest = list.filter((x) => x.id !== next.id);
    await AsyncStorage.setItem(LOCAL_APOTHECARY_KEY, JSON.stringify([next, ...rest]));
  }
  await loadWorkshop(userId, true);
  return state.apothecary.find((a) => a.id === next.id) ?? next;
}

/**
 * Each ingredient tied to its Library entry, and the working's own entry that
 * "contains" them, as the website's createOrUpdateApothecaryLibraryEntity does.
 */
async function withLibraryEntry(userId: string | null, item: ApothecaryItem): Promise<ApothecaryItem> {
  const next = { ...item };
  const refs = next.ingredients.map((i) => ({ entityId: i.entityId, ...ingredientLibraryRef(i) }));
  const ingredientIds = await ingredientEntityIds(userId, refs).catch(() => refs.map((r) => r.entityId || ''));
  next.ingredients = next.ingredients.map((i, index) => ({ ...i, ...refs[index], entityId: ingredientIds[index] || i.entityId || '' }));
  next.entityId = await putLibraryEntry({ userId, entityId: next.entityId || null, name: next.name, type: 'apothecary', myPractice: (existing) => apothecaryPractice(next, existing) });
  try {
    await connectRelations(userId, ingredientRelationRows(next.entityId, ingredientIds));
  } catch (e) {
    // A connection that can't be saved doesn't undo the working, as on the website.
    console.warn('Apothecary connections were not saved', e);
  }
  return next;
}

/**
 * Save a tending as a reusable blend (createApothecaryItemFromTending): into My
 * Apothecary with its Living Library entry, but, as on the website, with no
 * object instance of its own and a living_state that never asks for tending.
 */
export async function saveTendingBlend(userId: string | null, blend: ApothecaryItem): Promise<ApothecaryItem> {
  const next = await withLibraryEntry(userId, blend);
  if (userId) {
    const row = { ...apothecaryRow(userId, next, next.updatedAt), living_state: TENDING_BLEND_LIVING };
    const { error } = await supabase.from('apothecary_items').upsert(row, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  } else {
    const list = parseList(await AsyncStorage.getItem(LOCAL_APOTHECARY_KEY));
    await AsyncStorage.setItem(LOCAL_APOTHECARY_KEY, JSON.stringify([{ ...next, livingState: TENDING_BLEND_LIVING }, ...list.filter((x) => x.id !== next.id)]));
  }
  await loadWorkshop(userId, true);
  return next;
}

export async function deleteApothecary(userId: string | null, item: ApothecaryItem): Promise<void> {
  if (userId) {
    const { error } = await supabase.from('apothecary_items').delete().eq('user_id', userId).eq('id', item.id);
    if (error) throw new Error(error.message);
  } else {
    const list = parseList(await AsyncStorage.getItem(LOCAL_APOTHECARY_KEY));
    await AsyncStorage.setItem(LOCAL_APOTHECARY_KEY, JSON.stringify(list.filter((x) => x.id !== item.id)));
  }
  await removeLibraryEntry(userId, item.entityId);
  await loadWorkshop(userId, true);
}
