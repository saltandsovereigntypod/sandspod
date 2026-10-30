// Closed and initiatory traditions a shared ritual names, so the share form
// can ask the sharer to think again and the ritual's page can say so, in the
// words of the Closed & living traditions guide. Pure.

import { CLOSED_GUIDE_TITLE, CLOSED_TRADITIONS, fold, OPENNESS_DETAIL, OPENNESS_LABELS, type ClosedTradition } from '../library/closed/index.ts';
import type { CommunityContent } from './community.ts';

export { CLOSED_GUIDE_TITLE };

/** From the guide's "What closed means and why it matters". */
export const GOOD_GUEST =
  'Being a good guest is simple: listen to the people themselves, buy from them, come when you’re invited, don’t claim a title you weren’t given, and take no as a full answer.';

export type ClosedMention = { id: string; name: string; openness: string; detail: string };

type Fields = Pick<CommunityContent, 'title' | 'summary' | 'tradition' | 'deities' | 'occasion' | 'materials' | 'preparation' | 'closing' | 'notes'> & {
  steps: { title: string; instructions: string; spoken_text: string }[];
};

// Other names that are everyday words too (kale, science, conjure) or name
// something else (Roma, the goddess of Rome): never matched on their own.
const EVERYDAY = new Set(['roma', 'kale', 'science', 'conjure', 'serving the spirits', 'shaman']);

/** Names of four letters or more, matched as whole words, so short words don't misfire. */
function namesOf(t: ClosedTradition): string[] {
  return [t.name.replace(/\([^)]*\)/g, ' '), ...t.aka].map(fold).filter((n) => n.length >= 4 && !EVERYDAY.has(n));
}

export function closedMentions(content: Fields, list: ClosedTradition[] = CLOSED_TRADITIONS): ClosedMention[] {
  const text = ` ${fold(
    [
      content.title,
      content.summary,
      content.tradition,
      ...(content.deities ?? []),
      content.occasion,
      ...(content.materials ?? []),
      content.preparation,
      content.closing,
      content.notes,
      ...(content.steps ?? []).flatMap((s) => [s.title, s.instructions, s.spoken_text]),
    ]
      .filter(Boolean)
      .join(' '),
  )} `;
  return list
    .filter((t) => namesOf(t).some((name) => text.includes(` ${name} `)))
    .map((t) => ({ id: t.id, name: t.name, openness: OPENNESS_LABELS[t.openness], detail: OPENNESS_DETAIL[t.openness] }));
}

/** "Hoodoo · Closed: held by a people or nation; outsiders are guests". */
export const mentionLine = (m: ClosedMention) => `${m.name} · ${m.openness}: ${m.detail.charAt(0).toLowerCase()}${m.detail.slice(1)}`;
