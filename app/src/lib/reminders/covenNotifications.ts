// Settings → Notifications & reminders → Covens: for each coven you're in,
// what reaches your phone (its chat, your conversations there, its
// gatherings, positions opening there, and new applications where you review them), gathered from
// where each is kept: the coven's chat settings (`coven_chat_settings`) and
// the synced reminder choices (`reminders_v2` gatherings, positions and requests).
// Nothing new is stored. Pure.

import { gatheringsOn, positionsOn, requestsOn, type ReminderPrefs } from './prefs.ts';

export type CovenNotifySource = { id: string; slug: string; name: string; reviewer?: boolean };
export type ChatChoice = { notify_coven: boolean; notify_direct: boolean };

export type CovenNotifyRow = {
  id: string;
  slug: string;
  name: string;
  /** Null while the coven's chat settings are still loading. */
  chat: boolean | null;
  conversations: boolean | null;
  gatherings: boolean;
  /** A position opening there for applications. */
  positions: boolean;
  /** Null where you don't review applications. */
  applications: boolean | null;
  /** One line: what's on, or "Nothing". */
  summary: string;
};

/** A row per coven, in name order. */
export function covenNotifyRows(covens: CovenNotifySource[], prefs: ReminderPrefs, chat: Record<string, ChatChoice | undefined>): CovenNotifyRow[] {
  return [...covens]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((coven) => {
      const own = chat[coven.id];
      const row = {
        id: coven.id,
        slug: coven.slug,
        name: coven.name,
        chat: own ? own.notify_coven : null,
        conversations: own ? own.notify_direct : null,
        gatherings: gatheringsOn(prefs, coven.id),
        positions: positionsOn(prefs, coven.id),
        applications: coven.reviewer ? requestsOn(prefs, coven.id) : null,
      };
      return { ...row, summary: covenNotifySummary(row) };
    });
}

export function covenNotifySummary(row: Pick<CovenNotifyRow, 'chat' | 'conversations' | 'gatherings' | 'applications'> & { positions?: boolean }): string {
  const on = [row.chat && 'Chat', row.conversations && 'conversations', row.gatherings && 'gatherings', row.positions && 'positions', row.applications && 'applications'].filter((x): x is string => !!x);
  if (!on.length) return row.chat === null ? 'Gatherings off' : 'Nothing';
  return `${on[0][0].toUpperCase()}${on.join(', ').slice(1)}`;
}

/** Whether any coven wants this phone signed up for coven notifications. */
export function wantsCovenPush(rows: CovenNotifyRow[], prefs: ReminderPrefs): boolean {
  return prefs.requests.answers || prefs.invitations.on || rows.some((r) => r.chat || r.conversations || r.gatherings || r.positions || r.applications);
}

/** The line on the Notifications & reminders home for Covens. */
export function covensLine(rows: CovenNotifyRow[], device: boolean | null, signedIn: boolean): string {
  if (!signedIn) return 'Sign in to hear from your covens';
  if (!rows.length) return 'Chat, gatherings and applications, for each coven';
  const phone = device === null ? '' : device ? ' · on this phone' : ' · off on this phone';
  return `${rows.length === 1 ? rows[0].name : `${rows.length} covens`}${phone}`;
}
