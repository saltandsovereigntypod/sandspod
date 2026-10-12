// Whether a signed-in person's work is reaching their account, as the
// website's SaltSyncStatus (js/account-data.js) and Account panel
// (js/account-data-ui.js) show it. The app has more than one thing saving at
// once (the altar and grimoire queues, settings, Library entries), so each
// reports here and the Account screen shows them as one. Pure, so it can be
// tested.

/** The website's statuses, plus `error`: the account refused a queued change. */
export type CloudStatus = 'guest' | 'connected' | 'saving' | 'saved' | 'offline' | 'unavailable' | 'error';
/** What a save queue reports (the altar and grimoire stores' SyncState). */
export type SourceState = 'idle' | 'saving' | 'offline' | 'error';

export type SyncModel = {
  userId: string | null;
  sources: Record<string, SourceState>;
  /** One-off saves still on their way. */
  pending: number;
  /** How the most recent save ended. */
  last: 'saved' | 'unavailable' | 'offline' | null;
  lastSuccess: string | null;
};

export const emptySync = (userId: string | null = null, lastSuccess: string | null = null): SyncModel => ({
  userId,
  sources: {},
  pending: 0,
  last: null,
  lastSuccess,
});

/** The website keeps the time of the last successful save per account, on the device. */
export const lastSyncKey = (userId: string) => `saltAndSovereigntyLastCloudSync:${userId}`;

const succeeded = (model: SyncModel, now: string): SyncModel => ({ ...model, last: 'saved', lastSuccess: now });

/** A save queue's new state. Finishing a round of saving counts as a successful sync. */
export function reportSource(model: SyncModel, source: string, next: SourceState, now: string): SyncModel {
  const before = model.sources[source] ?? 'idle';
  if (before === next) return model;
  const sources = { ...model.sources, [source]: next };
  const moved = { ...model, sources };
  return before === 'saving' && next === 'idle' ? succeeded(moved, now) : moved;
}

export const beginSave = (model: SyncModel): SyncModel => ({ ...model, pending: model.pending + 1 });

/** A one-off save finished: `ok`, or how it failed. */
export function endSave(model: SyncModel, outcome: 'ok' | 'offline' | 'unavailable', now: string): SyncModel {
  const done = { ...model, pending: Math.max(0, model.pending - 1) };
  return outcome === 'ok' ? succeeded(done, now) : { ...done, last: outcome };
}

/** Network trouble rather than the account saying no. */
export function isOfflineMessage(message: string): boolean {
  return /network|fetch|offline|timed? ?out|connection|internet/i.test(message);
}

/** One status for everything: a problem first, then work in progress, then how the last save went. */
export function cloudStatus(model: SyncModel): CloudStatus {
  if (!model.userId) return 'guest';
  const states = Object.values(model.sources);
  if (states.includes('offline')) return 'offline';
  if (states.includes('error')) return 'error';
  if (model.pending > 0 || states.includes('saving')) return 'saving';
  return model.last ?? 'connected';
}

/** The website's wording (account-data-ui.js statusLabel), and the app's own for refused changes. */
export function statusLabel(status: CloudStatus): string {
  return (
    {
      connected: 'Connected',
      saving: 'Saving…',
      saved: 'Saved',
      offline: 'Offline',
      unavailable: 'Cloud unavailable',
      guest: 'Guest data only',
      error: 'Some changes weren’t saved',
    } as Record<CloudStatus, string>
  )[status];
}

/** A line under the status saying what it means for the person. */
export function statusDetail(status: CloudStatus): string {
  switch (status) {
    case 'offline':
      return 'Changes are kept on this device and sent when you’re back online.';
    case 'error':
      return 'Your account didn’t accept a change. Open the altar or grimoire to retry or discard it.';
    case 'unavailable':
      return 'The last save didn’t reach your account. Try again in a moment.';
    case 'saving':
      return 'Sending your changes to your account.';
    default:
      return 'Your Sanctuary is saved to your account.';
  }
}

/** account-data-ui.js formatSync. */
export function formatLastSync(value: string | null, locale?: string): string {
  if (!value) return 'No successful cloud save recorded on this device';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No successful cloud save recorded on this device';
  return date.toLocaleString(locale ?? [], { dateStyle: 'medium', timeStyle: 'short' });
}
