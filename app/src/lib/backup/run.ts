// The backup and restore steps behind More → Backup, mirroring the website's
// js/sanctuary-backup-ui.js: gather → create → save; pick → validate →
// safety backup → plan → merge (never replace).

import AsyncStorage from '@react-native-async-storage/async-storage';

import { collectAssets } from './assets';
import { cloudRestoreDb, collectCloud } from './cloud';
import { pickBackupFile, saveBackupFile } from './fileIO';
import {
  applyCloudMergePlan,
  backupFileName,
  bookOnlyData,
  buildCloudMergePlan,
  buildGuestMergePlan,
  collectGuest,
  createBackup,
  guestWrites,
  MAX_FILE_BYTES,
  validateBackup,
  type Backup,
  type CloudPlan,
  type GuestPlan,
  type Validation,
} from './format';
import { readGuestStorage, writeGuestStorage } from './guest';

export const LAST_EXPORT_KEY = 'saltAndSovereigntyLastBackupAt';
// The website writes its deployment name here; the app says where it came from.
const ENVIRONMENT = 'app';

export type Progress = (message: string) => void;

export async function gatherBackup(userId: string | null, onProgress: Progress, bookOnly = false): Promise<Backup> {
  let data: Record<string, unknown>;
  let complete = true;
  let failures: string[] = [];
  if (!userId) data = collectGuest(await readGuestStorage());
  else {
    const result = await collectCloud(userId, { onProgress });
    data = result.data;
    complete = result.complete;
    failures = result.failures.map((failure) => `${failure.table} could not be collected.`);
  }
  if (bookOnly) data = bookOnlyData(data, !!userId);
  onProgress('Preparing uploaded images…');
  const { assets, warnings } = await collectAssets(data);
  return createBackup(data, {
    scope: userId ? 'authenticated-user' : 'guest-browser',
    environment: ENVIRONMENT,
    assets,
    warnings: [...warnings, ...failures],
    complete,
  });
}

export type ExportResult = { ok: true; backup: Backup } | { ok: false; message: string };

export async function exportBackup(
  userId: string | null,
  onProgress: Progress,
  kind: 'complete' | 'book' | 'safety' = 'complete',
): Promise<ExportResult> {
  try {
    onProgress(kind === 'book' ? 'Gathering Book of Shadows pages…' : 'Gathering your Sanctuary…');
    const backup = await gatherBackup(userId, onProgress, kind === 'book');
    if (!backup.manifest.complete)
      return { ok: false, message: `The backup is partial and was not saved. ${backup.manifest.warnings.join(' ')}` };
    const prefix =
      kind === 'book'
        ? 'salt-and-sovereignty-book-of-shadows'
        : kind === 'safety'
          ? 'salt-and-sovereignty-before-restore'
          : 'salt-and-sovereignty-backup';
    onProgress('Saving the file…');
    await saveBackupFile(JSON.stringify(backup, null, 2), backupFileName(prefix));
    AsyncStorage.setItem(LAST_EXPORT_KEY, backup.createdAt).catch(() => {});
    return { ok: true, backup };
  } catch (error) {
    console.warn('Sanctuary backup failed', error instanceof Error ? error.message : 'unknown');
    return { ok: false, message: 'Your backup could not be completed. Nothing was changed.' };
  }
}

export type PickResult =
  | { kind: 'cancelled' }
  | { kind: 'too-large' }
  | { kind: 'checked'; name: string; validation: Validation };

export async function pickAndValidate(): Promise<PickResult> {
  const file = await pickBackupFile(MAX_FILE_BYTES);
  if (!file) return { kind: 'cancelled' };
  if (file.size != null && file.size > MAX_FILE_BYTES) return { kind: 'too-large' };
  return { kind: 'checked', name: file.name, validation: await validateBackup(file.text) };
}

export type Plan = { scope: 'guest'; plan: GuestPlan } | { scope: 'account'; plan: CloudPlan };

export async function planRestore(backup: Backup, userId: string | null): Promise<Plan> {
  if (!userId) return { scope: 'guest', plan: buildGuestMergePlan(backup, await readGuestStorage()) };
  return { scope: 'account', plan: await buildCloudMergePlan(backup, cloudRestoreDb, userId) };
}

export const planConflicts = (plan: Plan) => plan.plan.conflicts.length;
export const planAdditions = (plan: Plan) =>
  plan.scope === 'guest'
    ? plan.plan.operations.length
    : plan.plan.operations.reduce((sum, operation) => sum + operation.rows.length, 0);

const checkpointKey = (digest: string, userId: string) => `saltAndSovereigntyRestore:${digest}:${userId}`;

export async function applyRestore(
  plan: Plan,
  backup: Backup,
  currentUserId: string | null,
  onProgress: Progress,
): Promise<{ ok: boolean; message: string }> {
  if (plan.scope === 'guest') {
    if (currentUserId) return { ok: false, message: 'You signed in after checking this backup. Choose the file again.' };
    await writeGuestStorage(guestWrites(plan.plan));
    return {
      ok: true,
      message: `Restore complete. ${plan.plan.operations.length} sections merged; ${plan.plan.conflicts.length} matching records were kept.`,
    };
  }
  if (plan.plan.userId !== currentUserId)
    return { ok: false, message: 'The signed-in account changed after checking this backup. Nothing was restored.' };
  const key = checkpointKey(backup.integrity.digest, currentUserId);
  let completedStages: string[] = [];
  try {
    completedStages = JSON.parse((await AsyncStorage.getItem(key)) || '[]');
  } catch {
    completedStages = [];
  }
  const result = await applyCloudMergePlan(plan.plan, cloudRestoreDb, {
    completedStages,
    onProgress,
    onStageComplete: (_table, stages) => AsyncStorage.setItem(key, JSON.stringify(stages)).catch(() => {}),
  });
  if (result.error)
    return {
      ok: false,
      message: `${result.error} Choose the same backup again to resume after ${result.completedStages.length} completed stages.`,
    };
  await AsyncStorage.removeItem(key).catch(() => {});
  return {
    ok: true,
    message: `Restore complete. ${result.completedStages.length} stages merged; ${result.conflicts.length} matching records were kept.`,
  };
}
