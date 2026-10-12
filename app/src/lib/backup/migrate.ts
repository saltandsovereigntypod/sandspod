// Moving guest work on this device into the signed-in account: the steps
// behind More → Account → Guest work on this device. The rows come from
// migration.ts (the website's guest-account migration); this file reads the
// device, uploads the pictures a guest added, writes, verifies and only then
// clears the guest copy of what moved.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadWorkshop } from '../altar/workshop';
import { uploadImage, type PickedImage } from '../altar/images';
import { reloadLibrary } from '../library/store';
import { bringDeviceRitualsToAccount, getRituals } from '../rituals/store';
import { reloadMySettings } from '../settings/store';
import { supabase } from '../supabase';
import { trackSave } from '../sync/store';
import { GUEST_KEYS, type Row } from './format';
import { readGuestStorage } from './guest';
import {
  APP_CATEGORIES,
  applyPlan,
  buildPlan,
  checkpointKey,
  createPreview,
  dismissalKey,
  keysToClear,
  readGuestData,
  sourceDigest,
  type MigrationDb,
  type Preview,
} from './migration';

const migrationDb: MigrationDb = {
  async existingKeys(table, key, userId, values) {
    const { data, error } = await supabase.from(table).select(key).eq('user_id', userId).in(key, values);
    if (error) throw error;
    return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => String(row[key]));
  },
  async relationKeys(userId) {
    const keys: string[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase
        .from('library_relations')
        .select('from_entity_id,relation,to_entity_id')
        .eq('user_id', userId)
        .range(from, from + 999);
      if (error) throw error;
      const rows = (data ?? []) as Row[];
      rows.forEach((row) => keys.push(`${row.from_entity_id}|${row.relation}|${row.to_entity_id}`));
      if (rows.length < 1000) return keys;
    }
  },
  async insert(table, rows) {
    for (let index = 0; index < rows.length; index += 500) {
      const { error } = await supabase.from(table).insert(rows.slice(index, index + 500));
      if (error) return { error };
    }
    return { error: null };
  },
};

/** What's on this device as a guest, or null when there's nothing readable. */
export async function guestPreview(): Promise<Preview | null> {
  try {
    return await createPreview(await readGuestStorage());
  } catch {
    return null;
  }
}

export async function isDismissed(userId: string, fingerprint: string): Promise<boolean> {
  return (await AsyncStorage.getItem(dismissalKey(userId, fingerprint)).catch(() => null)) === 'true';
}

export async function dismiss(userId: string, fingerprint: string): Promise<void> {
  await AsyncStorage.setItem(dismissalKey(userId, fingerprint), 'true').catch(() => {});
}

const isLocalPicture = (value: unknown): value is string => typeof value === 'string' && /^(?:file:|data:image\/)/i.test(value);

function mimeOf(uri: string): string {
  const data = /^data:(image\/[a-z]+);/i.exec(uri);
  if (data) return data[1].toLowerCase();
  if (/\.png$/i.test(uri)) return 'image/png';
  if (/\.webp$/i.test(uri)) return 'image/webp';
  return 'image/jpeg';
}

async function upload(userId: string, uri: string, folder: string) {
  const picked: PickedImage = { uri, mimeType: mimeOf(uri) };
  return uploadImage(userId, picked, folder);
}

/**
 * Uploads the pictures guests keep on the phone (their own cabinet items'
 * forms and apothecary workings) to `user-assets`, as the app does for
 * signed-in people, and points the guest records at them. Returns the guest
 * keys that still hold a picture that couldn't be uploaded.
 */
async function uploadGuestPictures(userId: string, onProgress: (message: string) => void): Promise<Set<string>> {
  const unsent = new Set<string>();
  const parse = async (key: string): Promise<Record<string, unknown>[] | null> => {
    try {
      const value = JSON.parse((await AsyncStorage.getItem(key)) ?? 'null');
      return Array.isArray(value) ? value : null;
    } catch {
      return null;
    }
  };

  const items = await parse(GUEST_KEYS.customCabinet);
  if (items?.some((item) => Array.isArray(item.forms) && item.forms.some((form: Record<string, unknown>) => isLocalPicture(form?.image)))) {
    onProgress('Uploading your cabinet pictures…');
    for (const item of items) {
      if (!Array.isArray(item.forms)) continue;
      item.forms = await Promise.all(
        (item.forms as Record<string, unknown>[]).map(async (form) => {
          if (!isLocalPicture(form?.image)) return form;
          try {
            const { url, storagePath } = await upload(userId, form.image as string, 'custom-cabinet-items');
            return { ...form, image: url, storagePath };
          } catch {
            unsent.add(GUEST_KEYS.customCabinet);
            return form;
          }
        }),
      );
    }
    await AsyncStorage.setItem(GUEST_KEYS.customCabinet, JSON.stringify(items));
  }

  const workings = await parse(GUEST_KEYS.apothecary);
  if (workings?.some((item) => isLocalPicture(item.imagePath))) {
    onProgress('Uploading your apothecary pictures…');
    for (const item of workings) {
      if (!isLocalPicture(item.imagePath)) continue;
      try {
        item.imagePath = (await upload(userId, item.imagePath, 'apothecary')).url;
      } catch {
        unsent.add(GUEST_KEYS.apothecary);
      }
    }
    await AsyncStorage.setItem(GUEST_KEYS.apothecary, JSON.stringify(workings));
  }
  return unsent;
}

export type MoveResult = { ok: boolean; message: string; kept: number; notes: string[] };

/**
 * Moves everything the app can move into the account. Records the account
 * already has are kept as they are. The guest copy is cleared only after
 * every row is verified in the account; on any failure it stays untouched.
 */
export async function moveGuestData(
  userId: string,
  currentUserId: () => string | null,
  onProgress: (message: string) => void,
): Promise<MoveResult> {
  return trackSave(userId, async () => {
    onProgress('Reading what’s on this device…');
    const unsent = await uploadGuestPictures(userId, onProgress);
    const preview = await createPreview(await readGuestStorage());
    const selected = APP_CATEGORIES.filter((id) => preview.counts[id] > 0);
    const notes: string[] = [];
    let kept = 0;

    if (selected.length) {
      onProgress('Comparing with your account…');
      const plan = await buildPlan(preview, selected, migrationDb, userId);
      kept = plan.conflicts.length;
      notes.push(...plan.warnings.filter((warning) => !/Book of Shadows/.test(warning)));
      const checkpoint = checkpointKey(plan);
      let completedStages: string[] = [];
      try {
        completedStages = JSON.parse((await AsyncStorage.getItem(checkpoint)) ?? '[]');
      } catch {
        completedStages = [];
      }
      const result = await applyPlan(plan, migrationDb, {
        currentDigest: async () => sourceDigest(readGuestData(await readGuestStorage())),
        currentUserId,
        completedStages,
        onStageComplete: (stages) => AsyncStorage.setItem(checkpoint, JSON.stringify(stages)).catch(() => {}),
        onProgress,
      });
      if (!result.complete) throw new Error(result.message || 'Migration stopped safely. Your guest data is unchanged.');
      await AsyncStorage.removeItem(checkpoint).catch(() => {});
      const clear = keysToClear(selected).filter((key) => !unsent.has(key));
      if (clear.length) await AsyncStorage.multiRemove(clear);
      if (unsent.size) notes.push('Some pictures couldn’t be uploaded, so the guest copy of those items stays on this device.');
    }

    // Rituals have their own bring-over, the same one the Rituals tab offers.
    if (getRituals().userId === userId && getRituals().deviceCount > 0) {
      onProgress('Bringing over your rituals…');
      await bringDeviceRitualsToAccount();
    }

    reloadMySettings();
    await Promise.all([reloadLibrary(userId), loadWorkshop(userId, true)]).catch(() => {});
    return {
      ok: true,
      kept,
      notes,
      message: kept
        ? `Your guest work is in your account. ${kept} record${kept === 1 ? ' was' : 's were'} already there and kept as they are.`
        : 'Your guest work is in your account.',
    };
  }).catch((error: unknown) => ({
    ok: false,
    kept: 0,
    notes: [],
    message:
      error instanceof Error && /^(?:The signed-in account changed|Guest data changed|Migration stopped|Migration verification)/.test(error.message)
        ? error.message
        : 'Migration stopped safely. Your guest data is unchanged.',
  }));
}
