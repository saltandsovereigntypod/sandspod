// Waiting lists for full positions: the phone notes' words. Pure (no Deno or
// Supabase), so the app's and the website's tests check them
// (app/tests/coven-queue.test.ts, tests/coven-queue.test.js, through
// js/core/covens.js).
//
// The database keeps the lists (supabase/migrations/
// 20261111000100_coven_test_keys_and_waiting_lists.sql). Three notes:
// 'queued' to the member (their training is complete, or their request
// approved, but the position is full, so they're #n on its list), 'proposed'
// to the coven's head and those with the manage power (a place is free and
// someone is next in line), 'promoted' to the member. Each person's own
// choices are the "Coven requests" ones (requests.ts wantsNotice): 'new' for
// the leaders' note, 'answer' for the member's.

export type Note = { title: string; body: string; url: string };
export type QueueSource = 'program' | 'application' | 'leader';

/** "1st", "2nd", "3rd", "4th", "11th", "22nd". */
export function ordinal(n: number): string {
  const v = Math.abs(Math.trunc(n));
  const teen = v % 100 >= 11 && v % 100 <= 13;
  const suffix = teen ? 'th' : v % 10 === 1 ? 'st' : v % 10 === 2 ? 'nd' : v % 10 === 3 ? 'rd' : 'th';
  return `${v}${suffix}`;
}

/** To the member who joined a list: "Your training is complete. Initiate is full, so you're #2 on its waiting list." */
export function queuedNote(args: { source: QueueSource; rankName: string; covenName: string; covenSlug: string; place: number | null }): Note {
  const where = args.place ? `you’re #${args.place} on its waiting list` : 'you’re on its waiting list';
  const full = `${args.rankName} is full, so ${where}.`;
  const body =
    args.source === 'program'
      ? `Your training is complete. ${full}`
      : args.source === 'application'
        ? `Your request to become ${args.rankName} was approved. ${full}`
        : args.place
          ? `You’re #${args.place} on the waiting list for ${args.rankName}.`
          : `You’re on the waiting list for ${args.rankName}.`;
  return { title: args.covenName, body, url: `/coven/c/${args.covenSlug}/standing` };
}

/** To the coven's head and leaders: "A place is free in Initiate. Rowan is next in line." */
export function proposedNote(args: { rankName: string; who: string; covenName: string; covenSlug: string }): Note {
  return { title: `Waiting list · ${args.covenName}`, body: `A place is free in ${args.rankName}. ${args.who} is next in line.`, url: `/coven/c/${args.covenSlug}/review` };
}

/** To the member moved up: "You're now Initiate in Moon Circle." */
export function promotedNote(args: { rankName: string; covenName: string; covenSlug: string }): Note {
  return { title: args.covenName, body: `You’re now ${args.rankName} in ${args.covenName}.`, url: `/coven/c/${args.covenSlug}` };
}
