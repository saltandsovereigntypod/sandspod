// The spell timing advisor: for what a working is for, the best times over the
// next week, month or three months, each with a score and the reasons behind
// it. These are traditional correspondences, offered as a guide and never as
// rules: the Moon's phase and sign, whether she is void of course, the
// planetary day and hour, retrogrades, the festivals of the calendars you keep,
// your patron deities' days and, if you have a birth chart open, the sky's
// touch on it.
//
// Pure, so it can be tested and shared with the website (js/core/timing.js).
// It reuses the app's own sky: moon.ts, astro/hours.ts, astro/voidOfCourse.ts,
// astro/planets.ts, holidays.ts, deipnon.ts, patron/ and craft/cosmic/transits.ts.

import { dayRuler, daysBetween, shortDate, timeOfDay } from '../../calendar.ts';
import { offersDeipnon, deipnonDays, hekateIsPatron } from '../../deipnon.ts';
import { holidayChoice, holidaysBetween } from '../../holidays.ts';
import { moonSign, moonState, type PhaseName, type ZodiacSign } from '../../moon.ts';
import { MOON_IN_SIGN } from '../../astro/meanings.ts';
import { planetaryHours, type HourPlanet } from '../../astro/hours.ts';
import { PLANET_GUIDES } from '../../astro/planetGuides.ts';
import { retrogradesBetween, type OrbitingPlanet } from '../../astro/planets.ts';
import type { Place } from '../../astro/rise.ts';
import { voidOfCourse, type VoidOfCourse } from '../../astro/voidOfCourse.ts';
import { devotionOf, myDeities, upcomingSacred } from '../../patron/index.ts';
import { EVENING_HOUR, tideOf, type MoonTide } from '../../rituals/planner.ts';
import type { NatalChart } from './chart.ts';
import { transitsAt, type Transit } from './transits.ts';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

// ── What a working is for ───────────────────────────────────────────────────

export type TimingIntent = {
  key: string;
  label: string;
  /** The ritual planner's intention for the same work (lib/rituals/planner.ts), to pre-fill it. */
  plannerKey: string | null;
  /** Moon tides that suit it, best first. 'new' is the dark and new moon. */
  tides: MoonTide[];
  /** Planets of the day and hour that suit it, best first. */
  planets: HourPlanet[];
  /** Moon signs traditionally kind to it. */
  signs: ZodiacSign[];
  /** Planets whose retrograde is traditionally a poor time for it. */
  retro: OrbitingPlanet[];
  /** Words looked for in a festival's name and meaning. */
  words: string[];
  /** Work that suits the Deipnon (Hekate's supper at the dark moon), for those who keep it. */
  deipnon?: boolean;
  /** Release work, which many find fine while the Moon is void of course. */
  voidKind?: boolean;
  /** One plain line on why these timings. */
  why: string;
};

export const TIMING_INTENTS: TimingIntent[] = [
  {
    key: 'love',
    label: 'Love',
    plannerKey: 'love',
    tides: ['waxing', 'full'],
    planets: ['Venus', 'Moon'],
    signs: ['Libra', 'Taurus', 'Cancer', 'Pisces'],
    retro: ['Venus'],
    words: ['love', 'union', 'passion', 'beltane', 'marriage', 'friendship', 'venus', 'aphrodite', 'fertility'],
    why: 'Love is usually drawn in: a growing or full moon, Venus’s day and hour, and the Moon in a Venus sign or a tender water sign.',
  },
  {
    key: 'money',
    label: 'Money & luck',
    plannerKey: 'prosperity',
    tides: ['waxing', 'full'],
    planets: ['Jupiter', 'Sun', 'Venus'],
    signs: ['Taurus', 'Capricorn', 'Virgo', 'Sagittarius'],
    retro: ['Mercury', 'Jupiter'],
    words: ['abundance', 'prosperity', 'harvest', 'wealth', 'plenty', 'luck', 'bounty', 'first fruits'],
    why: 'Work for growth while the moon grows. Jupiter rules abundance, and an earthy Moon keeps the money practical.',
  },
  {
    key: 'protection',
    label: 'Protection',
    plannerKey: 'protection',
    tides: ['full', 'waxing', 'waning'],
    planets: ['Mars', 'Saturn', 'Sun'],
    signs: ['Capricorn', 'Scorpio', 'Aries', 'Cancer'],
    retro: [],
    words: ['protect', 'guard', 'ward', 'bonfire', 'threshold', 'averting'],
    deipnon: true,
    why: 'A strong moon lends power to wards; Mars defends and Saturn sets limits. Protection can be done in almost any tide.',
  },
  {
    key: 'banishing',
    label: 'Banishing',
    plannerKey: 'banishing',
    tides: ['waning', 'new'],
    planets: ['Saturn', 'Mars'],
    signs: ['Scorpio', 'Capricorn', 'Aries', 'Virgo'],
    retro: [],
    words: ['banish', 'driving out', 'averting', 'purif', 'cleans', 'evil'],
    deipnon: true,
    voidKind: true,
    why: 'Let things go as the moon shrinks toward dark. Saturn ends and binds; Mars cuts.',
  },
  {
    key: 'healing',
    label: 'Healing',
    plannerKey: 'healing',
    tides: ['waxing', 'full'],
    planets: ['Sun', 'Moon', 'Jupiter'],
    signs: ['Virgo', 'Pisces', 'Cancer', 'Taurus'],
    retro: [],
    words: ['heal', 'health', 'well', 'renewal', 'brigid', 'spring'],
    why: 'Build strength with the growing moon; the Sun restores vitality and a Virgo or Pisces Moon tends the body and spirit.',
  },
  {
    key: 'cleansing',
    label: 'Cleansing',
    plannerKey: 'cleansing',
    tides: ['waning', 'full'],
    planets: ['Saturn', 'Moon'],
    signs: ['Virgo', 'Pisces', 'Scorpio', 'Cancer'],
    retro: [],
    words: ['cleans', 'purif', 'wash', 'sweep', 'well'],
    deipnon: true,
    voidKind: true,
    why: 'Wash away as the moon wanes. Saturday clears the slate; Monday belongs to water.',
  },
  {
    key: 'divination',
    label: 'Divination & dreams',
    plannerKey: 'intuition',
    tides: ['full', 'new', 'waxing'],
    planets: ['Moon', 'Mercury'],
    signs: ['Pisces', 'Cancer', 'Scorpio'],
    retro: [],
    words: ['divin', 'oracle', 'veil', 'dream', 'prophe', 'vision', 'omen'],
    why: 'The full and the dark moon both open the inner eye. The Moon and Mercury rule seeing and messages; the water signs deepen it.',
  },
  {
    key: 'communication',
    label: 'Communication & study',
    plannerKey: 'study',
    tides: ['waxing', 'full'],
    planets: ['Mercury', 'Jupiter'],
    signs: ['Gemini', 'Virgo', 'Aquarius', 'Libra'],
    retro: ['Mercury'],
    words: ['word', 'poetry', 'inspiration', 'learning', 'wisdom', 'speech', 'writing'],
    why: 'Mercury rules words, study and messages: its day and hour, an airy Moon, and Mercury moving forward.',
  },
  {
    key: 'courage',
    label: 'Courage',
    plannerKey: 'courage',
    tides: ['waxing', 'full'],
    planets: ['Mars', 'Sun'],
    signs: ['Aries', 'Leo', 'Sagittarius'],
    retro: ['Mars'],
    words: ['courage', 'strength', 'victory', 'warrior', 'fire', 'battle'],
    why: 'Grow boldness with the waxing moon. Tuesday is ruled by Mars, and a fiery Moon lends nerve.',
  },
  {
    key: 'ancestors',
    label: 'Ancestors & the dead',
    plannerKey: null,
    tides: ['waning', 'new', 'full'],
    planets: ['Saturn', 'Moon'],
    signs: ['Scorpio', 'Capricorn', 'Cancer'],
    retro: [],
    words: ['ancestor', 'the dead', 'veil', 'remember', 'forebear', 'departed', 'spirits', 'graves'],
    deipnon: true,
    voidKind: true,
    why: 'The dark of the moon and Saturn, lord of the old and the gone, are the traditional companions of ancestor work.',
  },
  {
    key: 'endings',
    label: 'Endings & release',
    plannerKey: 'banishing',
    tides: ['waning', 'new'],
    planets: ['Saturn', 'Moon'],
    signs: ['Scorpio', 'Capricorn', 'Pisces'],
    retro: [],
    words: ['ending', 'release', 'letting go', 'dark half', 'rest', 'death', 'close'],
    deipnon: true,
    voidKind: true,
    why: 'Close what is finished as the moon wanes to dark. Saturn ends things kindly when they are ready to end.',
  },
  {
    key: 'beginnings',
    label: 'New beginnings',
    plannerKey: 'beginnings',
    tides: ['new', 'waxing'],
    planets: ['Sun', 'Moon', 'Mercury'],
    signs: ['Aries', 'Taurus', 'Leo'],
    retro: ['Mercury'],
    words: ['beginning', 'new year', 'seed', 'spring', 'renewal', 'rebirth', 'first'],
    why: 'Plant seeds at the new moon and let them grow with her. The Sun brings things to light; an Aries Moon gives the first push.',
  },
  {
    key: 'peace',
    label: 'Peace & rest',
    plannerKey: 'peace',
    tides: ['waning', 'full'],
    planets: ['Moon', 'Venus'],
    signs: ['Libra', 'Pisces', 'Taurus', 'Cancer'],
    retro: [],
    words: ['peace', 'rest', 'balance', 'harmony', 'gratitude', 'quiet'],
    voidKind: true,
    why: 'Release tension as the moon wanes. Monday and Friday are gentle days, and a soft Moon sign helps.',
  },
];

export const timingIntent = (key: string | null | undefined): TimingIntent | null => TIMING_INTENTS.find((i) => i.key === key) ?? null;

/** The advisor's intent for a planner intention ("prosperity" is money, "study" is communication …). */
export function intentFromPlanner(plannerKey: string | null | undefined): TimingIntent | null {
  if (!plannerKey) return null;
  return timingIntent(plannerKey) ?? TIMING_INTENTS.find((i) => i.plannerKey === plannerKey) ?? null;
}

/** Either kind of key: the advisor's own ("money") or the planner's ("prosperity"). */
export const anyIntent = (key: string | null | undefined): TimingIntent | null => timingIntent(key) ?? intentFromPlanner(key);

/** The intents a planet serves (for its guide's "Find a good time"), the ones it leads first. */
export function intentsForPlanet(planet: string): TimingIntent[] {
  return TIMING_INTENTS.filter((i) => (i.planets as string[]).includes(planet)).sort((a, b) => (a.planets as string[]).indexOf(planet) - (b.planets as string[]).indexOf(planet));
}

const DAY_RULERS: HourPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const PREMADE_TIDE: Record<string, MoonTide> = { new: 'new', dark: 'new', waxing: 'waxing', full: 'full', waning: 'waning' };

/**
 * An intent shaped by a particular working: its own moon (a premade's "new",
 * "full", "dark" …) put first, and its weekday's planet put first.
 */
export function shapeIntent(intent: TimingIntent, options: { moon?: string[] | null; weekday?: number | null } = {}): TimingIntent {
  const tides = [...new Set((options.moon ?? []).map((m) => PREMADE_TIDE[m]).filter(Boolean))];
  const day = options.weekday != null && options.weekday >= 0 && options.weekday < 7 ? DAY_RULERS[options.weekday] : null;
  return {
    ...intent,
    tides: tides.length ? [...tides, ...intent.tides.filter((t) => !tides.includes(t))] : intent.tides,
    planets: day ? [day, ...intent.planets.filter((p) => p !== day)] : intent.planets,
  };
}

// ── The factors and their weights ───────────────────────────────────────────

export type TimingFactor = 'phase' | 'moonSign' | 'voc' | 'day' | 'hour' | 'retrograde' | 'festival' | 'patron' | 'transits';

export const FACTORS: { key: TimingFactor; label: string; detail: string; weight: number; personal?: boolean }[] = [
  { key: 'phase', label: 'Moon phase', detail: 'Waxing to draw in, full to charge, waning to release, dark to rest', weight: 3 },
  { key: 'moonSign', label: 'Moon sign', detail: 'The sign the Moon is passing through', weight: 1.5 },
  { key: 'voc', label: 'Void-of-course Moon', detail: 'Her quiet spell before she changes sign', weight: 2 },
  { key: 'day', label: 'Planetary day', detail: 'The planet that rules the day', weight: 2 },
  { key: 'hour', label: 'Planetary hour', detail: 'The planet that rules the hour, from your sunrise and sunset', weight: 2 },
  { key: 'retrograde', label: 'Retrogrades', detail: 'Mercury retrograde for words, Venus for love, Mars for courage …', weight: 1.5 },
  { key: 'festival', label: 'Your festivals', detail: 'Holy days from the calendars you keep, and the Deipnon', weight: 1.5, personal: true },
  { key: 'patron', label: 'Your deities', detail: 'The sacred days and planets of your patron and dedicated deities', weight: 1, personal: true },
  { key: 'transits', label: 'Your chart', detail: 'The sky’s touch on your birth chart, when it is open', weight: 1.5, personal: true },
];

/** How much a factor counts: 0 off, 1 a little, 2 as usual, 3 a lot. */
export type FactorLevel = 0 | 1 | 2 | 3;
export const LEVEL_LABELS: Record<FactorLevel, string> = { 0: 'Off', 1: 'A little', 2: 'Usual', 3: 'A lot' };
const LEVEL_SCALE: Record<FactorLevel, number> = { 0: 0, 1: 0.5, 2: 1, 3: 1.75 };
export type FactorLevels = Partial<Record<TimingFactor, FactorLevel>>;

export const levelOf = (levels: FactorLevels | null | undefined, factor: TimingFactor): FactorLevel => {
  const v = levels?.[factor];
  return v === 0 || v === 1 || v === 2 || v === 3 ? v : 2;
};
const weightOf = (levels: FactorLevels | null | undefined, factor: TimingFactor) =>
  FACTORS.find((f) => f.key === factor)!.weight * LEVEL_SCALE[levelOf(levels, factor)];

/** Levels as a short string for a link or storage ("phase:3,hour:0"), only those changed. */
export function levelsToText(levels: FactorLevels): string {
  return FACTORS.filter((f) => levelOf(levels, f.key) !== 2)
    .map((f) => `${f.key}:${levelOf(levels, f.key)}`)
    .join(',');
}
export function levelsFromText(text: string | null | undefined): FactorLevels {
  const out: FactorLevels = {};
  for (const part of String(text ?? '').split(',')) {
    const [k, v] = part.split(':');
    const n = Number(v);
    if (FACTORS.some((f) => f.key === k) && (n === 0 || n === 1 || n === 2 || n === 3)) out[k as TimingFactor] = n as FactorLevel;
  }
  return out;
}

// ── What the person keeps ───────────────────────────────────────────────────

type SettingsLike = Record<string, unknown> | null | undefined;

export type KeptDay = { date: Date; days: number; name: string; meaning: string; deipnon?: boolean };
export type KeptDeity = { name: string; level: 'patron' | 'dedicated'; planets: HourPlanet[]; sacred: { date: Date; name: string }[] };
export type Keeping = { festivals: KeptDay[]; deities: KeptDeity[] };

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The planets a deity is tied to in the planet guides (lib/astro/planetGuides.ts). */
export function deityPlanets(name: string): HourPlanet[] {
  return DAY_RULERS.filter((p) => PLANET_GUIDES[p].deities.some((d) => sameName(d.name, name) || d.name.toLowerCase().split(/[\s/,()]+/).includes(name.trim().toLowerCase())));
}

/**
 * The festivals, Deipna and deities from settings that matter for timing over
 * [from, from + days]: the calendars chosen in Settings → Calendars, the
 * Deipnon for those who keep it, and the patron and dedicated deities (My deities).
 */
export function keepingFrom(settings: SettingsLike, from: Date, days: number): Keeping {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(start.getTime() + (days + 1) * DAY);
  const festivals: KeptDay[] = holidaysBetween(start, end, holidayChoice(settings))
    .filter((h) => !h.id.startsWith('hellenic_monthly-deipnon-'))
    .map((h) => ({ date: h.date, days: h.days, name: h.name, meaning: h.meaning }));
  if (offersDeipnon(settings)) {
    const hekate = hekateIsPatron(settings);
    for (const date of deipnonDays(start, days + 1)) {
      festivals.push({
        date,
        days: 1,
        name: 'The Deipnon',
        meaning: `Hekate’s supper at the dark of the moon: cleansing the house, clearing what is done, and remembering the restless dead${hekate ? ', kept for your patron' : ''}.`,
        deipnon: true,
      });
    }
  }
  const deities: KeptDeity[] = myDeities(settings)
    .filter((d) => d.level === 'patron' || d.level === 'dedicated')
    .map((d) => {
      const devotion = devotionOf(d.key);
      const sacred = devotion ? upcomingSacred(devotion, start, days + 1).map((s) => ({ date: s.date, name: s.day.name })) : [];
      return { name: d.name, level: d.level as 'patron' | 'dedicated', planets: deityPlanets(d.name), sacred };
    });
  return { festivals: festivals.sort((a, b) => a.date.getTime() - b.date.getTime()), deities };
}

// ── Scoring ─────────────────────────────────────────────────────────────────

export type ScorePart = {
  factor: TimingFactor;
  label: string;
  /** -1 (works against) to 1 (fits well), before the weight. */
  fit: number;
  /** fit × weight: what it adds to the score. */
  points: number;
  /** A plain line on why. */
  note: string;
};

export type TimingWindow = {
  start: Date;
  end: Date;
  /** 0–100. */
  score: number;
  /** The unrounded, uncapped total, for ranking windows that all score 100. */
  raw: number;
  parts: ScorePart[];
  /** One line: the main reasons, then anything against it. */
  why: string;
  moon: { phase: PhaseName; tide: MoonTide; sign: ZodiacSign; illumination: number; waxing: boolean };
  dayPlanet: HourPlanet;
  hourPlanet: HourPlanet | null;
  night: boolean;
};

export type TimingOptions = {
  from: Date;
  /** How far ahead to look: 7, 30 or 90 days. */
  days: number;
  place?: Place | null;
  levels?: FactorLevels | null;
  /** Include the small hours (midnight to six); off by default. */
  smallHours?: boolean;
  keeping?: Keeping | null;
  /** The person's natal chart, only when their charts are open. */
  chart?: NatalChart | null;
  /** How many windows to suggest (default 6). */
  count?: number;
};

export type TimingAdvice = {
  windows: TimingWindow[];
  /** The time you're in now, scored the same way, if it's a time worth judging. */
  now: TimingWindow | null;
  /** True when now is close enough to the best that waiting isn't needed. */
  goodEnoughNow: boolean;
  /** Whether planetary hours were used (they need a place). */
  usedHours: boolean;
  /** Whether a birth chart was used. */
  usedChart: boolean;
};

const TIDE_WORDS: Record<MoonTide, string> = {
  new: 'the dark and new moon',
  waxing: 'the waxing moon',
  full: 'the full moon',
  waning: 'the waning moon',
};
const TIDE_USE: Record<MoonTide, string> = {
  new: 'rest, seeds and fresh starts, and quiet release',
  waxing: 'drawing things in and growing them',
  full: 'charging, seeing clearly and work at full strength',
  waning: 'releasing, banishing and clearing away',
};
const of = (planet: HourPlanet) => (planet === 'Sun' || planet === 'Moon' ? `the ${planet}` : planet);
const possessive = (planet: HourPlanet) => (planet === 'Sun' || planet === 'Moon' ? `the ${planet}’s` : `${planet}’s`);
const round1 = (n: number) => Math.round(n * 100) / 100;

type Slot = { start: Date; end: Date; hourPlanet: HourPlanet | null; dayPlanet: HourPlanet; night: boolean };

/** The planetary day's ruler for a moment: from sunrise if hours are known, else the calendar day. */
const calendarRuler = (d: Date) => dayRuler(d).planet as HourPlanet;

/** The slots to judge: each planetary hour (with a place) or three-hour blocks, from `from` for `days` days. */
function slotsFor(from: Date, days: number, place: Place | null, useHours: boolean, smallHours: boolean): Slot[] {
  const end = from.getTime() + days * DAY;
  const out: Slot[] = [];
  const awake = (d: Date) => smallHours || d.getHours() >= 6;
  if (place && useHours) {
    const seen = new Set<number>();
    for (let k = -1; k <= days + 1; k++) {
      const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + k, 12);
      const hours = planetaryHours(day, place);
      if (!hours) continue;
      for (const h of hours) {
        const t = h.start.getTime();
        if (seen.has(t) || h.end.getTime() <= from.getTime() || t >= end) continue;
        seen.add(t);
        if (!awake(h.start) && !(h.start.getTime() <= from.getTime())) continue;
        out.push({ start: h.start, end: h.end, hourPlanet: h.planet, dayPlanet: hours[0].planet, night: h.night });
      }
    }
    if (out.length) return out.sort((a, b) => a.start.getTime() - b.start.getTime());
  }
  for (let k = 0; k <= days; k++) {
    for (let block = 0; block < 8; block++) {
      const start = new Date(from.getFullYear(), from.getMonth(), from.getDate() + k, block * 3);
      const stop = new Date(start.getFullYear(), start.getMonth(), start.getDate(), block * 3 + 3);
      if (stop.getTime() <= from.getTime() || start.getTime() >= end) continue;
      if (!awake(start) && start.getTime() > from.getTime()) continue;
      out.push({ start, end: stop, hourPlanet: null, dayPlanet: calendarRuler(start), night: start.getHours() >= 18 || start.getHours() < 6 });
    }
  }
  return out;
}

/** Every void-of-course spell overlapping [from, to]. */
export function voidSpells(from: Date, to: Date): VoidOfCourse[] {
  const out: VoidOfCourse[] = [];
  let t = from;
  for (let guard = 0; guard < 80 && t.getTime() < to.getTime(); guard++) {
    const v = voidOfCourse(t);
    if (v.end.getTime() > from.getTime() && v.start.getTime() < to.getTime()) out.push(v);
    t = new Date(v.end.getTime() + 60_000);
  }
  return out;
}

const ASPECT_VERB: Record<string, string> = { conjunction: 'joins', sextile: 'sextiles', square: 'squares', trine: 'trines', opposition: 'opposes' };
const KIND = new Set(['Venus', 'Jupiter', 'Sun']);
const HARD = new Set(['Saturn', 'Mars', 'Pluto']);

/** How the day's sky meets a natal chart for this work: -1 to 1, with the transits that count. */
export function transitFit(hits: Transit[], intent: TimingIntent): { fit: number; lines: string[] } {
  let fit = 0;
  const lines: string[] = [];
  for (const t of hits) {
    if (t.transiting === 'Moon') continue;
    const easy = t.aspect === 'trine' || t.aspect === 'sextile' || (t.aspect === 'conjunction' && !HARD.has(t.transiting));
    const hard = t.aspect === 'square' || t.aspect === 'opposition' || (t.aspect === 'conjunction' && HARD.has(t.transiting));
    const fits = intent.planets.includes(t.transiting as HourPlanet) || KIND.has(t.transiting);
    const line = `${t.transiting} ${ASPECT_VERB[t.aspect]} your natal ${t.natal === 'Ascendant' ? 'rising sign' : t.natal}`;
    if (easy && fits) {
      fit += 0.5;
      lines.push(line);
    } else if (hard && HARD.has(t.transiting) && (t.natal === 'Sun' || t.natal === 'Moon')) {
      fit -= 0.5;
      lines.push(line);
    }
  }
  return { fit: Math.max(-1, Math.min(1, fit)), lines: lines.slice(0, 2) };
}

const matchesWords = (text: string, words: string[]) => {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
};
const onDay = (date: Date, start: Date, days: number) => {
  const d0 = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return d >= d0 && d < d0 + days * DAY - HOUR;
};

/**
 * Score one slot. `ctx` carries what's shared across slots (void spells,
 * retrogrades, what you keep, transits by day).
 */
function scoreSlot(slot: Slot, intent: TimingIntent, ctx: ScoreContext): TimingWindow {
  const mid = new Date((slot.start.getTime() + slot.end.getTime()) / 2);
  const moon = moonState(mid);
  const tide = tideOf(moon.name, moon.fraction);
  const sign = moonSign(mid);
  const parts: ScorePart[] = [];
  const add = (factor: TimingFactor, label: string, fit: number, note: string) => {
    const w = weightOf(ctx.levels, factor);
    if (!w) return;
    parts.push({ factor, label, fit: round1(fit), points: round1(fit * w), note });
  };

  // The Moon's phase.
  const tideRank = intent.tides.indexOf(tide);
  const phaseFit = tideRank === 0 ? 1 : tideRank === 1 ? 0.6 : tideRank === 2 ? 0.3 : -0.5;
  add(
    'phase',
    moon.name,
    phaseFit,
    tideRank >= 0
      ? `${moon.name}: ${TIDE_WORDS[tide]} is a traditional time for ${TIDE_USE[tide]}.`
      : `${moon.name}: ${TIDE_WORDS[tide]} is usually kept for ${TIDE_USE[tide]}, not this.`,
  );

  // The Moon's sign.
  const signRank = intent.signs.indexOf(sign);
  add('moonSign', `Moon in ${sign}`, signRank === 0 ? 1 : signRank > 0 ? 0.8 : 0, signRank >= 0 ? `Moon in ${sign}, long tied to ${MOON_IN_SIGN[sign].goodFor}.` : `Moon in ${sign}: ${MOON_IN_SIGN[sign].mood}.`);

  // Void of course.
  const voc = ctx.voids.find((v) => v.start.getTime() < slot.end.getTime() && v.end.getTime() > slot.start.getTime());
  if (voc) {
    add(
      'voc',
      'Void-of-course Moon',
      intent.voidKind ? -0.3 : -1,
      intent.voidKind
        ? `The Moon is void of course until she enters ${voc.nextSign}. Tradition says what is begun now comes to little, though many find it a fair time for letting go.`
        : `The Moon is void of course until she enters ${voc.nextSign}. Tradition says what is begun now tends to come to little.`,
    );
  }

  // The day and the hour.
  const dayRank = intent.planets.indexOf(slot.dayPlanet);
  add('day', `${possessive(slot.dayPlanet)} day`, dayRank === 0 ? 1 : dayRank > 0 ? 0.6 : 0, dayRank >= 0 ? `${PLANET_GUIDES[slot.dayPlanet].day}, ${possessive(slot.dayPlanet)} day, suits it.` : `${PLANET_GUIDES[slot.dayPlanet].day} belongs to ${of(slot.dayPlanet)}.`);
  if (slot.hourPlanet) {
    const hourRank = intent.planets.indexOf(slot.hourPlanet);
    add('hour', `Hour of ${of(slot.hourPlanet)}`, hourRank === 0 ? 1 : hourRank > 0 ? 0.6 : 0, hourRank >= 0 ? `The hour of ${of(slot.hourPlanet)}, a planet of this work.` : `The hour of ${of(slot.hourPlanet)}.`);
  }

  // Retrogrades.
  for (const r of ctx.retros) {
    if (r.start.getTime() < slot.end.getTime() && r.end.getTime() > slot.start.getTime()) {
      add('retrograde', `${r.planet} retrograde`, -1, `${r.planet} is retrograde until ${shortDate(r.end)}: traditionally a time to review and redo rather than begin this kind of work.`);
    }
  }

  // Festivals you keep, and the Deipnon.
  const festivals = ctx.keeping.festivals.filter((f) => onDay(slot.start, f.date, f.days));
  if (festivals.length) {
    const fitting = festivals.find((f) => (f.deipnon ? !!intent.deipnon : matchesWords(`${f.name} ${f.meaning}`, intent.words)));
    const f = fitting ?? festivals[0];
    add('festival', f.name, fitting ? 1 : 0.3, fitting ? `${f.name}, kept in your calendars: ${f.meaning}` : `${f.name} falls on this day in your calendars.`);
  }

  // Your deities.
  const sacred = ctx.keeping.deities.flatMap((d) => d.sacred.filter((s) => onDay(slot.start, s.date, 1)).map((s) => ({ d, s })));
  if (sacred.length) {
    const { d, s } = sacred[0];
    add('patron', d.name, 1, `${s.name}: a sacred day of ${d.name}, your ${d.level === 'patron' ? 'patron' : 'dedicated deity'}.`);
  } else {
    const tied = ctx.keeping.deities.find((d) => d.planets.includes(slot.dayPlanet) || (slot.hourPlanet && d.planets.includes(slot.hourPlanet)));
    if (tied) {
      const planet = tied.planets.includes(slot.dayPlanet) ? slot.dayPlanet : slot.hourPlanet!;
      add('patron', tied.name, 0.5, `${tied.name} is tied to ${of(planet)}, whose ${planet === slot.dayPlanet ? 'day' : 'hour'} this is.`);
    }
  }

  // Your chart.
  if (ctx.chart) {
    const key = new Date(slot.start.getFullYear(), slot.start.getMonth(), slot.start.getDate()).getTime();
    let day = ctx.transits.get(key);
    if (!day) {
      day = transitFit(transitsAt(ctx.chart, new Date(key + 12 * HOUR)), intent);
      ctx.transits.set(key, day);
    }
    if (day.lines.length) add('transits', 'Your chart', day.fit, `${day.lines.join('; ')}.`);
  }

  // Score: the moon, sign, day and hour make the whole; the rest add or take away.
  const core = (['phase', 'moonSign', 'day', 'hour'] as TimingFactor[]).filter((f) => f !== 'hour' || slot.hourPlanet).reduce((sum, f) => sum + weightOf(ctx.levels, f), 0);
  const total = parts.reduce((sum, p) => sum + p.points, 0);
  const score = core > 0 ? Math.max(0, Math.min(100, Math.round((total / core) * 100))) : 0;

  return {
    start: slot.start,
    end: slot.end,
    score,
    raw: core > 0 ? total / core : 0,
    parts,
    why: whyLine(parts),
    moon: { phase: moon.name, tide, sign, illumination: moon.illumination, waxing: moon.waxing },
    dayPlanet: slot.dayPlanet,
    hourPlanet: slot.hourPlanet,
    night: slot.night,
  };
}

/** "Waxing Gibbous · Moon in Taurus · Venus’s day; but Mercury retrograde" */
export function whyLine(parts: ScorePart[]): string {
  const good = parts.filter((p) => p.points > 0).sort((a, b) => b.points - a.points).map((p) => p.label);
  const bad = parts.filter((p) => p.points < 0).sort((a, b) => a.points - b.points).map((p) => p.label);
  const lead = good.slice(0, 4).join(' · ') || 'Little in its favour';
  return bad.length ? `${lead}; but ${bad.slice(0, 2).join(' and ')}` : lead;
}

type ScoreContext = {
  levels: FactorLevels | null | undefined;
  voids: VoidOfCourse[];
  retros: { planet: OrbitingPlanet; start: Date; end: Date }[];
  keeping: Keeping;
  chart: NatalChart | null;
  transits: Map<number, { fit: number; lines: string[] }>;
};

/** Hours from nine in the evening (the planner's evening hour). */
const eveningDistance = (d: Date) => Math.abs(d.getHours() + d.getMinutes() / 60 - EVENING_HOUR);

const EMPTY_KEEPING: Keeping = { festivals: [], deities: [] };

/**
 * The best times for a working over the coming days, best first: one window
 * per day at most, so the list offers real choices. Ties go to the sooner.
 */
export function adviseTiming(intent: TimingIntent, options: TimingOptions): TimingAdvice {
  const days = Math.max(1, Math.min(120, Math.round(options.days)));
  const from = options.from;
  const to = new Date(from.getTime() + days * DAY);
  const levels = options.levels ?? null;
  const useHours = levelOf(levels, 'hour') > 0;
  const slots = slotsFor(from, days, options.place ?? null, useHours, !!options.smallHours);
  const usedHours = slots.some((s) => s.hourPlanet);
  const ctx: ScoreContext = {
    levels,
    voids: levelOf(levels, 'voc') > 0 ? voidSpells(new Date(from.getTime() - DAY), new Date(to.getTime() + DAY)) : [],
    retros: levelOf(levels, 'retrograde') > 0 ? intent.retro.flatMap((planet) => retrogradesBetween(planet, from, to).map((r) => ({ planet, ...r }))) : [],
    keeping: {
      festivals: levelOf(levels, 'festival') > 0 ? (options.keeping?.festivals ?? []) : [],
      deities: levelOf(levels, 'patron') > 0 ? (options.keeping?.deities ?? []) : [],
    },
    chart: levelOf(levels, 'transits') > 0 ? (options.chart ?? null) : null,
    transits: new Map(),
  };
  if (!options.keeping) ctx.keeping = EMPTY_KEEPING;

  const scored = slots.map((slot) => scoreSlot(slot, intent, ctx));
  const nowSlot = scored.find((w) => w.start.getTime() <= from.getTime() && w.end.getTime() > from.getTime()) ?? null;

  // The best window of each day.
  const byDay = new Map<string, TimingWindow>();
  for (const w of scored) {
    if (w.end.getTime() <= from.getTime()) continue;
    const key = `${w.start.getFullYear()}-${w.start.getMonth()}-${w.start.getDate()}`;
    const have = byDay.get(key);
    // Equal times go to the one nearest the evening, when most workings are done.
    if (!have || w.raw > have.raw + 1e-9 || (Math.abs(w.raw - have.raw) <= 1e-9 && eveningDistance(w.start) < eveningDistance(have.start))) byDay.set(key, w);
  }
  const windows = [...byDay.values()]
    .filter((w) => w.score > 0)
    .sort((a, b) => b.raw - a.raw || a.start.getTime() - b.start.getTime())
    .slice(0, options.count ?? 6);
  const best = windows[0]?.score ?? 0;
  const goodEnoughNow = !!nowSlot && nowSlot.score >= 55 && nowSlot.score >= best - 15;
  return { windows, now: nowSlot, goodEnoughNow, usedHours, usedChart: !!ctx.chart };
}

/** A word for a score, for people who'd rather not read numbers. */
export function scoreWord(score: number): string {
  if (score >= 85) return 'Very well suited';
  if (score >= 65) return 'Well suited';
  if (score >= 45) return 'Fair';
  if (score >= 25) return 'Mixed';
  return 'Not much in its favour';
}

/** What the advisor says about itself, wherever it appears. */
export const TIMING_FRAMING =
  'These are traditional correspondences, not rules. Many witches work whenever the need is real, and a working done with care at a fair time is better than one put off while waiting for a perfect one.';

/** The planner link for a window: "2026-11-06" and "15:12" in local time. */
export function windowPlanFields(w: Pick<TimingWindow, 'start'>, now: Date = new Date()): { date: string; time: string } {
  // A window already running is planned from a few minutes ahead.
  const at = w.start.getTime() < now.getTime() ? new Date(Math.ceil((now.getTime() + 5 * 60_000) / (5 * 60_000)) * 5 * 60_000) : w.start;
  const p = (n: number) => String(n).padStart(2, '0');
  return { date: `${at.getFullYear()}-${p(at.getMonth() + 1)}-${p(at.getDate())}`, time: `${p(at.getHours())}:${p(at.getMinutes())}` };
}

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "Today · 2:59 PM – 4:04 PM", "Tomorrow · …", "Saturday, Oct 31 · …". */
export function windowWhen(w: Pick<TimingWindow, 'start' | 'end'>, now: Date): string {
  const d = daysBetween(now, w.start);
  const day = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${WEEKDAY[w.start.getDay()]}, ${shortDate(w.start)}`;
  return `${day} · ${timeOfDay(w.start)} – ${timeOfDay(w.end)}`;
}

/** "+2", "−1.5" for a part's points. */
export const pointsText = (points: number) => `${points > 0 ? '+' : points < 0 ? '−' : ''}${String(Math.abs(Math.round(points * 10) / 10))}`;

/** The advisor's window lengths. */
export const TIMING_SPANS = [7, 30, 90] as const;
