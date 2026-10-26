// Applications and requests to advance waiting for you: the counts on the
// Coven tab, each coven's Review row, and the website's Review tab and
// coven list. Only covens you review count (the head, or a position that
// reviews or leads), and never your own request. Pure, so the website
// (js/core/covens.js, SaltCore.covens.requests) counts the same way.
// requestsBadge.ts keeps the app's counts live; the coven-notify edge
// function sends the phone notes.

export type Waiting = { coven_id: string; user_id: string | null; status?: string };
export type PendingCounts = Record<string, { applications: number; advancements: number }>;

/** Waiting requests in each coven you review, leaving out your own. */
export function countPending(applications: Waiting[], advancements: Waiting[], reviewing: string[], me: string | null): PendingCounts {
  const out: PendingCounts = {};
  for (const id of reviewing) out[id] = { applications: 0, advancements: 0 };
  const add = (rows: Waiting[], key: 'applications' | 'advancements') => {
    for (const row of rows) {
      if (!out[row.coven_id] || (row.status && row.status !== 'pending') || (me && row.user_id === me)) continue;
      out[row.coven_id][key] += 1;
    }
  };
  add(applications, 'applications');
  add(advancements, 'advancements');
  return out;
}

/** All waiting in one coven, or across them all. */
export function pendingIn(counts: PendingCounts, covenId?: string | null): number {
  if (covenId) return (counts[covenId]?.applications ?? 0) + (counts[covenId]?.advancements ?? 0);
  return Object.values(counts).reduce((sum, c) => sum + c.applications + c.advancements, 0);
}

/** "2 applications and a request to advance waiting". */
export function pendingLabel(c: { applications: number; advancements: number } | undefined): string {
  if (!c || !(c.applications + c.advancements)) return '';
  const parts = [
    c.applications ? (c.applications === 1 ? 'an application' : `${c.applications} applications`) : '',
    c.advancements ? (c.advancements === 1 ? 'a request to advance' : `${c.advancements} requests to advance`) : '',
  ].filter(Boolean);
  const text = parts.join(' and ');
  return `${text[0].toUpperCase()}${text.slice(1)} waiting`;
}

/** The Coven tab's count: unread messages and requests waiting, together. */
export function covenTabCount(unread: number, pending: number): { count: number; label: string } {
  const parts = [
    unread ? `${unread} unread ${unread === 1 ? 'message' : 'messages'}` : '',
    pending ? `${pending} ${pending === 1 ? 'request' : 'requests'} to review` : '',
  ].filter(Boolean);
  return { count: unread + pending, label: parts.join(', ') };
}

/**
 * Whether new requests in this coven ring your phone, read straight from the
 * saved Reminders choices (`reminders_v2`), for pages that show it without
 * the whole Reminders logic (the website's Review tab). Same answer as
 * reminders/prefs.ts requestsOn; on when nothing is saved.
 */
export function requestsWanted(saved: unknown, covenId: string): boolean {
  let raw: unknown = saved;
  if (typeof saved === 'string') {
    try {
      raw = saved.trim() ? JSON.parse(saved) : {};
    } catch {
      raw = {};
    }
  }
  const requests = raw && typeof raw === 'object' ? (raw as { requests?: { on?: unknown; off?: unknown } }).requests : undefined;
  if (!requests || typeof requests !== 'object') return true;
  if (requests.on === false) return false;
  return !(Array.isArray(requests.off) && requests.off.includes(covenId));
}
