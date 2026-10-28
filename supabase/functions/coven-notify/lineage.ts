// Daughter covens and leadership: who hears, and what the note says. Pure (no
// Deno or Supabase), so the app's tests check it (app/tests/coven-lineage.test.ts).
//
// Lineage (coven_lineage_events, supabase/migrations/20261112000000_coven_lineage.sql):
//   'requested'          → the mother coven's head (and heads above it)
//   'approved'           → whoever asked, the new head, and the mother's leaders
//   'declined'           → whoever asked
//   'founded'            → the daughter's members (they're told up front whose final say it's under)
//   'release_requested'  → the mother coven's head
//   'released'           → the daughter's members, and the mother's leaders
//   'release_declined'   → the daughter's head
//   'pushed', 'head_appointed', overrides → the daughter's head (head_appointed: its members too)
// Leadership (coven_leadership_events): a hand-on, an appointment by the mother
// coven, a site moderator's transfer, a transfer or archiving when a head
// closes their account → the coven's members; a successor named → those named.
//
// Everyone's choices come from Notifications & reminders → Covens → Requests
// (user_settings.reminders_v2 `requests`, read by requests.ts wantsNotice):
// notes about your own request are 'answer' notes; everything else about a
// coven is a 'new' note for that coven, so turning a coven's requests off
// turns these off too.

export type Note = { title: string; body: string; url: string };

const clip = (text: string, n = 140) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);
const quoted = (note?: string | null) => (note?.trim() ? ` “${clip(note.trim())}”` : '');

export type LineageEventKind = 'requested' | 'approved' | 'declined' | 'withdrawn' | 'founded' | 'released' | 'release_requested' | 'release_declined' | 'copied' | 'pushed' | 'override' | 'head_appointed';

/** Whether a lineage event rings anyone's phone, and whether it's an answer to their own request. */
export function lineageAudience(event: LineageEventKind): { rings: boolean; kind: 'new' | 'answer' } {
  switch (event) {
    case 'approved':
    case 'declined':
    case 'release_declined':
      return { rings: true, kind: 'answer' };
    case 'requested':
    case 'founded':
    case 'released':
    case 'release_requested':
    case 'pushed':
    case 'head_appointed':
      return { rings: true, kind: 'new' };
    default:
      return { rings: false, kind: 'new' };
  }
}

export function lineageNote(args: {
  event: LineageEventKind;
  who: string;
  coven: { name: string; slug: string };
  other?: { name: string; slug: string } | null;
  daughterName?: string | null;
  headName?: string | null;
  title?: string | null;
  note?: string | null;
}): Note {
  const here = `/coven/c/${args.coven.slug}`;
  const other = args.other?.name ?? 'the other coven';
  switch (args.event) {
    case 'requested':
      return { title: `Daughter coven · ${args.coven.name}`, body: `${args.who} asked to found ${args.daughterName ? `${args.daughterName}, ` : ''}a daughter coven.${quoted(args.note)}`, url: `${here}/lineage` };
    case 'approved':
      return { title: args.coven.name, body: `${args.who} approved founding ${other}${args.headName ? `, led by ${args.headName}` : ''}.${quoted(args.note)}`, url: args.other ? `/coven/c/${args.other.slug}` : `${here}/lineage` };
    case 'declined':
      return { title: args.coven.name, body: `Your request to found ${args.daughterName ?? 'a daughter coven'} wasn’t approved.${quoted(args.note)}`, url: `${here}/lineage` };
    case 'founded':
      return { title: args.coven.name, body: `${args.coven.name} is founded, a daughter coven of ${other}. ${other}’s head has final say over it.`, url: here };
    case 'release_requested':
      return { title: `Daughter coven · ${args.other?.name ?? args.coven.name}`, body: `${args.who} asked for ${args.daughterName ?? 'a daughter coven'} to be released.${quoted(args.note)}`, url: `/coven/c/${(args.other ?? args.coven).slug}/lineage` };
    case 'released':
      return { title: args.coven.name, body: `${args.coven.name} and ${other} are no longer linked. ${other}’s head no longer has a say here.`, url: `${here}/lineage` };
    case 'release_declined':
      return { title: args.coven.name, body: `${args.who} didn’t release ${args.coven.name} from ${other}.${quoted(args.note)}`, url: `${here}/lineage` };
    case 'pushed':
      return { title: args.coven.name, body: `${args.who}, head of ${other}, updated ${args.title ? `“${clip(args.title, 80)}”` : 'something'} in ${args.coven.name}.`, url: `${here}/lineage` };
    case 'head_appointed':
      return { title: args.coven.name, body: `${args.who}, head of ${other}, made ${args.headName ?? 'someone new'} the head of ${args.coven.name}.`, url: `${here}/members` };
    default:
      return { title: args.coven.name, body: `${args.who} changed the coven’s lineage.`, url: `${here}/lineage` };
  }
}

const TABLE_WORDS: Record<string, string> = {
  covens: 'the coven’s details',
  coven_ranks: 'a position',
  coven_members: 'a member’s place',
  coven_documents: 'a page',
  coven_applications: 'an application',
  coven_advancement_requests: 'a request to advance',
  coven_programs: 'a program',
  coven_rituals: 'a rite or meeting',
  coven_grimoire_pages: 'a Book page',
  coven_ritual_library: 'a ritual template',
  coven_succession: 'the succession plan',
  coven_program_documents: 'a lesson',
  coven_program_quizzes: 'a test',
};
const OP_WORDS: Record<string, string> = { insert: 'added', update: 'changed', delete: 'removed' };

/** What a mother coven's head did (an 'override' line's detail). The same words as the app's lib/covens/lineage.ts overrideWords. */
export function overrideWords(detail: Record<string, unknown>): string {
  const table = String(detail.table ?? '');
  const op = String(detail.op ?? 'update');
  const label = typeof detail.label === 'string' && detail.label ? ` “${detail.label}”` : '';
  const status = typeof detail.status === 'string' ? detail.status : '';
  if (table === 'coven_applications' && op === 'update' && (status === 'approved' || status === 'declined')) return `${status} an application${label}`;
  if (table === 'coven_advancement_requests' && op === 'update' && (status === 'approved' || status === 'declined')) return `${status} a request to advance${label}`;
  if (table === 'coven_members' && (status === 'removed' || status === 'banned')) return `${status === 'banned' ? 'banned' : 'removed'}${label || ' a member'}`;
  return `${OP_WORDS[op] ?? 'changed'} ${TABLE_WORDS[table] ?? 'something'}${label}`;
}

/** The note to a daughter's head after a mother coven's head changed things there: "Hazel, head of Moon Circle, changed a position and a page". */
export function overridesNote(args: { who: string; mother: string; coven: { name: string; slug: string }; changes: string[] }): Note {
  const uniq = [...new Set(args.changes)].slice(0, 3);
  const more = args.changes.length > uniq.length ? ` and ${args.changes.length - uniq.length} more` : '';
  const list = uniq.length <= 1 ? uniq.join('') : `${uniq.slice(0, -1).join(', ')} and ${uniq[uniq.length - 1]}`;
  return { title: args.coven.name, body: clip(`${args.who}, head of ${args.mother}, ${list || 'made changes'}${more}.`, 180), url: `/coven/c/${args.coven.slug}/lineage` };
}

export type LeadershipEventKind = 'handed_on' | 'appointed_by_mother' | 'moderator_transfer' | 'account_transfer' | 'archived_no_head' | 'successor_named' | 'head_reported';

/** The note about a change of leadership (to the coven's members), or a successor named (to them). */
export function leadershipNote(args: { event: LeadershipEventKind; coven: { name: string; slug: string }; from?: string | null; to?: string | null }): Note | null {
  const here = `/coven/c/${args.coven.slug}`;
  const to = args.to ?? 'Someone';
  switch (args.event) {
    case 'handed_on':
      return { title: args.coven.name, body: `${args.from ?? 'The head'} handed on leadership to ${to}.`, url: `${here}/members` };
    case 'appointed_by_mother':
      return { title: args.coven.name, body: `${to} now leads the coven, appointed by the head of its mother coven.`, url: `${here}/members` };
    case 'moderator_transfer':
      return { title: args.coven.name, body: `The site moderators handed the coven to ${to}, as its head couldn’t be reached.`, url: `${here}/members` };
    case 'account_transfer':
      return { title: args.coven.name, body: `${to} now leads the coven. Its head closed their account.`, url: `${here}/members` };
    case 'archived_no_head':
      return { title: args.coven.name, body: 'The coven is archived: its head closed their account and no one was named to lead it. Its pages stay readable to you.', url: here };
    case 'successor_named':
      return { title: args.coven.name, body: 'You’re named to lead the coven next, if its head steps away.', url: `${here}/manage/leadership` };
    default:
      return null;
  }
}
