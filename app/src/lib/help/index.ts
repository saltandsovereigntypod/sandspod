// The "How to" guide: its sections and topics, and search across them. Pure.

import { HELP } from './topics.ts';
import type { HelpSection, HelpTopic } from './types.ts';

export type { HelpSection, HelpTopic } from './types.ts';
export { HELP };

/** Lower case, accents and punctuation gone, so "Book of Shadows" finds "book-of-shadows". */
export const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Topics matching every word of the query, best first: title matches, then keywords, then the rest. */
export function searchHelp(query: string, sections: HelpSection[] = HELP): { topic: HelpTopic; section: HelpSection }[] {
  const words = fold(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  const scored: { topic: HelpTopic; section: HelpSection; score: number }[] = [];
  for (const section of sections) {
    for (const topic of section.topics) {
      const title = fold(topic.title);
      const keys = fold((topic.keywords ?? []).join(' '));
      const rest = fold([topic.summary, ...topic.steps, ...(topic.tips ?? []), section.title].join(' '));
      if (!words.every((w) => title.includes(w) || keys.includes(w) || rest.includes(w))) continue;
      const score = words.reduce((sum, w) => sum + (title.includes(w) ? 3 : keys.includes(w) ? 2 : 1), 0);
      scored.push({ topic, section, score });
    }
  }
  return scored.sort((a, b) => b.score - a.score).map(({ topic, section }) => ({ topic, section }));
}
