// Cycle & Moon: "What am I?" Read from the bleeds logged: the average cycle
// and how much it varies, how long the bleeds last, where each began in the
// lunar month, and the moon pattern they lean to (White, Pink, Red or
// Purple Moon: folk and modern-spiritual names, not biology) with how sure
// that is and how it has shifted. Pure.

import { PATTERN_INFO } from './content.ts';
import { bleedDays, bleedMoon, cycleStats, PATTERN_NAMES, SYNODIC_DAYS, sortedBleeds, type BleedMoon } from './model.ts';
import type { CycleData, MoonPattern } from './types.ts';

/** How many of the latest bleeds the moon pattern is read from. */
const MOON_RECENT = 12;
const PATTERNS: MoonPattern[] = ['white', 'pink', 'red', 'purple'];

export type MoonType = {
  pattern: MoonPattern;
  /** The second pattern, when it's "mixed between" two. */
  second: MoonPattern | null;
  /** 'early' with fewer than three bleeds; then strongly, mostly, mixed (between two) or moving (no clear one). */
  strength: 'early' | 'strongly' | 'mostly' | 'mixed' | 'moving';
  /** How many bleeds it is read from, and how many of them began under the leading pattern. */
  count: number;
  leading: number;
  /** "Based on 6 cycles: Red Moon, strongly". */
  headline: string;
  /** What that means, in plain words. */
  explain: string;
};

export type HistoryReading = {
  /** Cycle lengths read (gaps between bleeds that look like a cycle). */
  cycles: number;
  average: number | null;
  /** The middle length, the shortest and the longest. */
  typical: number | null;
  shortest: number | null;
  longest: number | null;
  /** Standard deviation in days, to one decimal. */
  spread: number | null;
  steadiness: 'very steady' | 'fairly steady' | 'varies' | null;
  /** Average bleed length, from the bleeds with an end marked (or flow logged). */
  bleedAverage: number | null;
  bleedCount: number;
  /** Each bleed and the moon it began under, newest first, with its day of the lunar month (1 at the new moon). */
  moons: (BleedMoon & { lunarDay: number })[];
  type: MoonType | null;
  /** How the pattern has moved over time, or null with too few bleeds to say. */
  shift: string | null;
  /** The plain-words explanation, a few short paragraphs. */
  lines: string[];
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const short = (p: MoonPattern) => PATTERN_NAMES[p].replace(' Moon', '');

function tally(moons: BleedMoon[]): { pattern: MoonPattern; n: number }[] {
  return PATTERNS.map((pattern) => ({ pattern, n: moons.filter((m) => m.pattern === pattern).length })).sort((a, b) => b.n - a.n);
}

/** The moon pattern a list of bleeds leans to, and how strongly. */
export function classifyMoonType(moons: BleedMoon[]): MoonType | null {
  const recent = moons.slice(0, MOON_RECENT);
  const count = recent.length;
  if (!count) return null;
  const [top, second] = tally(recent);
  const share = top.n / count;
  const tied = second.n === top.n;
  const cycles = plural(count, 'cycle');
  let strength: MoonType['strength'];
  if (count < 3) strength = 'early';
  else if (!tied && (share >= 0.75 || (count === 3 && share === 1))) strength = 'strongly';
  else if (!tied && share >= 0.5) strength = 'mostly';
  else if (second.n >= 2 && top.n + second.n >= 0.75 * count) strength = 'mixed';
  else strength = 'moving';
  const name = PATTERN_NAMES[top.pattern];
  const headline =
    strength === 'early'
      ? `Based on ${cycles}: leaning ${tied && count === 2 ? `${short(top.pattern)} and ${short(second.pattern)}` : name}, too early to say`
      : strength === 'strongly'
        ? `Based on ${cycles}: ${name}, strongly`
        : strength === 'mostly'
          ? `Based on ${cycles}: mostly ${name}`
          : strength === 'mixed'
            ? `Based on ${cycles}: mixed between ${short(top.pattern)} and ${short(second.pattern)} Moon`
            : `Based on ${cycles}: moving between the patterns`;
  const explain =
    strength === 'early'
      ? `With ${count === 1 ? 'one bleed' : 'two bleeds'} logged there isn’t a pattern yet. Add a few past periods and it will grow clearer.`
      : strength === 'strongly'
        ? `${top.n} of your last ${count} bleeds began ${PATTERN_INFO[top.pattern].when.replace(/^A bleed that begins /, '').replace(/\.$/, '')}. ${PATTERN_INFO[top.pattern].line}`
        : strength === 'mostly'
          ? `${top.n} of your last ${count} bleeds began as the ${name} does, with the rest elsewhere in the lunar month. ${PATTERN_INFO[top.pattern].line}`
          : strength === 'mixed'
            ? `Your bleeds have begun as the ${name} (${top.n}) and the ${PATTERN_NAMES[second.pattern]} (${second.n}) about as often as each other. Many people move between two patterns for a while.`
            : 'Your bleeds have begun in different parts of the lunar month, with no one pattern leading. That’s common, and as it should be: people move between them.';
  return { pattern: top.pattern, second: strength === 'mixed' || (strength === 'early' && tied && count === 2) ? second.pattern : null, strength, count, leading: top.n, headline, explain };
}

/** How the leading pattern has moved: the older half of the bleeds against the newer half (six or more). */
function shiftOf(moons: BleedMoon[]): string | null {
  const recent = moons.slice(0, MOON_RECENT);
  if (recent.length < 6) return null;
  const half = Math.floor(recent.length / 2);
  const newer = tally(recent.slice(0, half));
  const older = tally(recent.slice(recent.length - half));
  const lead = (t: { pattern: MoonPattern; n: number }[]) => (t[0].n > t[1].n && t[0].n >= half / 2 ? t[0].pattern : null);
  const a = lead(older);
  const b = lead(newer);
  if (a && b && a === b) return `It has held steady: your earlier and your more recent bleeds both lean ${PATTERN_NAMES[a]}.`;
  if (a && b) return `It has shifted: your earlier bleeds leaned ${PATTERN_NAMES[a]}, your more recent ones lean ${PATTERN_NAMES[b]}.`;
  if (b) return `Your earlier bleeds moved between patterns; your more recent ones lean ${PATTERN_NAMES[b]}.`;
  if (a) return `Your earlier bleeds leaned ${PATTERN_NAMES[a]}; recently they’ve moved between patterns.`;
  return 'Your bleeds have moved between patterns all along.';
}

/** Everything "What am I?" shows. */
export function historyReading(data: CycleData): HistoryReading {
  const stats = cycleStats(data);
  const lengths = stats.lengths;
  const average = lengths.length ? round1(lengths.reduce((a, b) => a + b, 0) / lengths.length) : null;
  const spread = lengths.length >= 2 ? round1(Math.sqrt(lengths.reduce((a, b) => a + (b - average!) ** 2, 0) / (lengths.length - 1))) : null;
  const range = stats.longest != null && stats.shortest != null ? stats.longest - stats.shortest : null;
  const steadiness = lengths.length < 2 || range == null ? null : range <= 3 ? 'very steady' : range <= 7 ? 'fairly steady' : 'varies';
  const bleeds = sortedBleeds(data);
  const known = bleeds.filter((b) => b.end || Object.keys(b.flow).length >= 2).slice(-6);
  const bleedAverage = known.length ? round1(known.reduce((a, b) => a + bleedDays(b), 0) / known.length) : null;
  const moons = [...bleeds].reverse().map((b) => {
    const m = bleedMoon(b);
    return { ...m, lunarDay: Math.floor(m.fraction * SYNODIC_DAYS) + 1 };
  });
  const type = classifyMoonType(moons);
  const shift = shiftOf(moons);

  const lines: string[] = [];
  if (average != null) {
    const body = `Your cycles average ${average} days, from ${plural(lengths.length, 'cycle')}${stats.shortest !== stats.longest ? ` (shortest ${stats.shortest}, longest ${stats.longest})` : ''}`;
    lines.push(
      steadiness === 'very steady'
        ? `${body}: a very steady rhythm.`
        : steadiness === 'fairly steady'
          ? `${body}: a fairly steady rhythm, moving by a few days, as most do.`
          : steadiness === 'varies'
            ? `${body}. They vary by more than a week, so any estimate is a wide one.`
            : `${body}.`,
    );
    const drift = round1(average - SYNODIC_DAYS);
    lines.push(
      Math.abs(drift) <= 1
        ? 'That’s close to the moon’s own month of 29.5 days, so your bleed tends to stay near the same moon phase from one cycle to the next.'
        : drift < 0
          ? `The moon’s month is 29.5 days, so each bleed tends to arrive about ${Math.abs(Math.round(drift))} ${Math.abs(Math.round(drift)) === 1 ? 'day' : 'days'} earlier in the lunar month than the last, moving slowly back through the phases.`
          : `The moon’s month is 29.5 days, so each bleed tends to arrive about ${Math.round(drift)} ${Math.round(drift) === 1 ? 'day' : 'days'} later in the lunar month than the last, moving slowly on through the phases.`,
    );
  } else if (bleeds.length === 1) lines.push('One bleed is logged. Add the ones before it and your average cycle will show here.');
  else lines.push('Log your past periods and your average cycle, how much it varies and your moon pattern will show here.');
  if (bleedAverage != null) lines.push(`Your bleeds last about ${bleedAverage} days${known.length < bleeds.length ? `, from the ${plural(known.length, 'bleed')} with an end marked` : ''}.`);
  return { cycles: lengths.length, average, typical: stats.typical, shortest: stats.shortest, longest: stats.longest, spread, steadiness, bleedAverage, bleedCount: bleeds.length, moons, type, shift, lines };
}

export const HISTORY_NOTE =
  'The averages are simple arithmetic from what you’ve logged. The moon patterns are a modern, folk and spiritual way of noticing, not biology: studies haven’t found that cycles follow the moon, and many people move between patterns over the years. Let it mean what it means to you.';
