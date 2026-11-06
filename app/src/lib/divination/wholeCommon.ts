// Small pieces the whole readings share: tarot (wholeReading.ts) and
// Lenormand, Kipper and playing cards (wholeOracle.ts). Pure.

import type { Lean, ReadTopic } from './readings/index.ts';
import type { WholeSection } from './wholeReading.ts';
import type { Topic } from './wholeReadingText.ts';

export const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
};
export const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
export const tidy = (s: string) => s.trim().replace(/[.\s]+$/, '');
export const firstSentence = (s: string) => {
  const m = s.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : s).trim();
};

export const YES_NO = /^\s*(is|are|will|should|can|do|does|am|did|has|have|could|would)\b|\bor not\b/i;
export const looksYesNo = (q: string) => YES_NO.test(q);

export const LEAN_SCORE: Record<Lean, number> = { yes: 1, 'not-yet': -0.5, no: -1, depends: 0 };

export const TONE: Record<Lean, string> = {
  yes: 'Overall the cards lean hopeful.',
  'not-yet': 'Overall the cards counsel patience.',
  no: 'Overall the cards ask for a change of course.',
  depends: 'Overall the cards are mixed, and much rests on your choices.',
};

export const CLOSE: Record<Lean, (t: ReadTopic) => string> = {
  yes: (t) => (t === 'spirit' ? 'Act on it, and keep a note of what changes.' : 'Act on it, and notice how it feels as you go.'),
  'not-yet': (t) => (t === 'spirit' ? 'Ask again after a moon cycle of practice.' : t === 'health' ? 'Ask again after a few weeks of gentle change.' : 'Ask again after a moon cycle, once you have acted on this.'),
  no: () => 'Let this one go for now, and ask a different question when you are ready.',
  depends: () => 'The cards hand this back to you. Decide, then see how it sits.',
};

export const render = (sections: WholeSection[]) =>
  ['The whole reading', ...sections.map((sec) => `${sec.title}\n${sec.lines.join(sec.title === 'The story' ? '\n\n' : '\n')}`)].join('\n\n');

/** Plain first line from the cards' weighted lean. Outcome-like places count double, the last card one and a half. */
export function answerLine(reads: { r: { lean: Lean }; w: number }[]): { line: string; lean: Lean } {
  let sum = 0;
  let tot = 0;
  for (const x of reads) {
    sum += x.w * LEAN_SCORE[x.r.lean];
    tot += x.w;
  }
  const a = sum / tot;
  if (a >= 0.6) return { line: 'Yes.', lean: 'yes' };
  if (a >= 0.2) return { line: 'Yes, with care.', lean: 'yes' };
  if (a > -0.2) return { line: 'It depends on you.', lean: 'depends' };
  if (a > -0.6) return { line: 'Not quite yet.', lean: 'not-yet' };
  return { line: 'No, not as things stand.', lean: 'no' };
}

export function readTopicOf(topic: Topic): ReadTopic {
  return topic === 'love' || topic === 'person' ? 'love' : topic === 'decision' || topic === 'timing' ? 'general' : topic;
}
