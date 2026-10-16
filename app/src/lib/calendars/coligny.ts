// The Gaulish calendar of the Coligny bronze, as a reconstruction.
//
// The bronze (found at Coligny, Ain, in 1897; late 2nd century CE) lays out
// a five-year cycle of 62 lunar months: twelve named months a year, each
// split in two halves by the word ATENOVX, marked MAT (good, 30 days) or ANM
// (not good, 29 days), with an intercalary month before Samonios in the first
// year and another before Giamonios in the third.
//
// What the bronze does not say is where its months and years sit against the
// sky. So this is a reconstruction, built in the bronze's own pattern:
// - each month begins on the local day of a real moon phase (first quarter by
//   default — Pliny's “sixth day of the moon”, as McKay reads it — or new or
//   full moon), so months run 29 or 30 days as the moon does, not by the
//   bronze's MAT/ANM pattern;
// - Samonios is anchored to a seasonal point: by default it begins at the
//   first month-start on or after Beltane (the sun at 45°, early May), as in
//   McKay's reconstruction and Bonsing's; or on or after the June solstice
//   (Le Contel & Verdier); or it is the month holding the Samhain
//   cross-quarter (the older, popular reading);
// - the year has 12 or 13 months as the moon and sun require, and the extra
//   month goes where the bronze puts one: mid-year before Giamonios when
//   Giamonios would otherwise start a month before its own seasonal point
//   (six months on), otherwise before Samonios.
// This keeps the two intercalary positions and the roughly 2½-year rhythm of
// the bronze, but it is not any one scholar's fixed epoch. Pure; no React.

import { julianDayToDate, lunationNear, phaseJde, sunLongitude, type PrincipalPhase } from '../moon.ts';
import type { CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarMark } from './types.ts';

const DAY_MS = 86_400_000;

type MonthInfo = { name: string; status: 'MAT' | 'ANM' | 'intercalary'; meaning: string };

/** The twelve months in order from Samonios. Meanings are proposals, not certainties. */
export const COLIGNY_MONTHS: MonthInfo[] = [
  { name: 'Samonios', status: 'MAT', meaning: 'from samo-, summer (compare Irish Samain): whether it opened the summer or closed it is the great question of the calendar' },
  { name: 'Dumannios', status: 'ANM', meaning: 'meaning uncertain; perhaps “dark” or “smoky”' },
  { name: 'Riuros', status: 'MAT', meaning: 'meaning uncertain; perhaps “frost”, or “fat” as in the fatness of the year' },
  { name: 'Anagantios', status: 'ANM', meaning: 'perhaps “not travelling”: the time of staying at home' },
  { name: 'Ogronnios', status: 'MAT', meaning: 'perhaps “cold” (compare Welsh oer)' },
  { name: 'Cutios', status: 'MAT', meaning: 'meaning uncertain; perhaps “winds” or “invocations”' },
  { name: 'Giamonios', status: 'ANM', meaning: 'from giamo-, winter (compare Irish gem-): it opens the second half of the year' },
  { name: 'Simivisonnios', status: 'MAT', meaning: 'perhaps “half-spring”, from simi- (half) and a word for spring' },
  { name: 'Equos', status: 'ANM', meaning: 'perhaps the horse; though marked ANM, it has 30 days in some years of the bronze and fewer in others, as if it were the month that kept pace with the moon' },
  { name: 'Elembivios', status: 'ANM', meaning: 'perhaps the month of deer, like the Greek Elaphebolion, “deer-shooting”' },
  { name: 'Aedrinios', status: 'MAT', meaning: 'perhaps “fiery, hot”, from aidu-, fire' },
  { name: 'Cantlos', status: 'ANM', meaning: 'perhaps “song”, or the closing of the circle' },
];

export const QUIMONIOS: MonthInfo = { name: 'Quimonios', status: 'intercalary', meaning: 'the intercalary month set before Samonios at the start of the bronze’s five-year cycle; the name is read from the damaged QVIMON…, and its meaning is unknown' };
export const RANTARANOS: MonthInfo = { name: 'Rantaranos', status: 'intercalary', meaning: 'the intercalary month set between Cutios and Giamonios in the third year of the bronze’s cycle; only …ANTARAN… survives, its first letter read as R, B or S, and its meaning is unknown (some modern calendars call it Ciallos, a word in its heading)' };

// ─── Choices ─────────────────────────────────────────────────────────────

const PHASES: Record<string, { phase: PrincipalPhase; offset: number; label: string }> = {
  'first-quarter': { phase: 'firstQuarter', offset: 0.25, label: 'first quarter' },
  new: { phase: 'new', offset: 0, label: 'new moon' },
  full: { phase: 'full', offset: 0.5, label: 'full moon' },
};

// Where Samonios (and, six months on, Giamonios) sits against the sun: a
// tropical solar longitude, and whether the month begins on or after it
// ('from') or merely holds it ('holds').
type Anchor = 'from' | 'holds';
const SEASONS: Record<string, { samonios: number; giamonios: number; anchor: Anchor; label: string }> = {
  beltane: { samonios: 45, giamonios: 225, anchor: 'from', label: 'Samonios begins at the first such moon on or after Beltane (early May)' },
  summer: { samonios: 90, giamonios: 270, anchor: 'from', label: 'Samonios begins at the first such moon on or after the June solstice' },
  autumn: { samonios: 225, giamonios: 45, anchor: 'holds', label: 'Samonios holds the Samhain cross-quarter (early November)' },
};

function settings(ctx: CalendarContext) {
  const phase = PHASES[ctx.options.colignyPhase ?? ''] ?? PHASES['first-quarter'];
  const season = SEASONS[ctx.options.colignySeason ?? ''] ?? SEASONS.beltane;
  // In the southern hemisphere the seasons the names describe come six months later.
  const shift = ctx.hemisphere === 'south' && ctx.options.colignyHemisphere !== 'north' ? 180 : 0;
  return { phase, anchor: season.anchor, samonios: (season.samonios + shift) % 360, giamonios: (season.giamonios + shift) % 360, seasonLabel: season.label, south: shift !== 0 };
}

// ─── Astronomy ───────────────────────────────────────────────────────────

const localDay = (t: number) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);

/** Local start day of lunation k's month (the day of the chosen phase). */
function monthStart(k: number, phase: { phase: PrincipalPhase; offset: number }): Date {
  return localDay(julianDayToDate(phaseJde(k + phase.offset, phase.phase)).getTime());
}

/** The lunation index whose month contains the local day `day`. */
function lunationOf(day: Date, phase: { phase: PrincipalPhase; offset: number }): number {
  let k = lunationNear(day) + 1;
  while (monthStart(k, phase).getTime() > day.getTime()) k -= 1;
  return k;
}

/** When the Sun reaches tropical longitude `longitude`, searching forward from `from`. */
function sunAt(longitude: number, from: number): number {
  const ahead = (t: number) => (((longitude - sunLongitude(new Date(t))) % 360) + 360) % 360;
  let low = from;
  let high = from + (ahead(from) / 0.9 + 3) * DAY_MS;
  while (ahead(high) < 180 && ahead(high) > 0) high += 5 * DAY_MS;
  // Now the Sun has passed `longitude` at `high` and not yet at `low`.
  while (high - low > 60_000) {
    const mid = (low + high) / 2;
    if (ahead(mid) < 180 && ahead(mid) > 0) low = mid;
    else high = mid;
  }
  return high;
}

/** The lunation anchored to the Sun's reaching `longitude` after `from`: the month holding that day, or the first to begin on or after it. */
function anchoredLunation(longitude: number, from: number, s: ReturnType<typeof settings>): number {
  const day = localDay(sunAt(longitude, from));
  const k = lunationOf(day, s.phase);
  return s.anchor === 'from' && monthStart(k, s.phase).getTime() < day.getTime() ? k + 1 : k;
}

/** Lunation index of Samonios for the Samonios point falling in Gregorian `year` (south shifts it). */
function samoniosLunation(year: number, s: ReturnType<typeof settings>): number {
  return anchoredLunation(s.samonios, Date.UTC(year, 0, 1), s);
}

export type ColignyMonth = {
  info: MonthInfo;
  start: Date;
  days: number;
  /** 0-based place among the twelve named months, or -1 for an intercalary month. */
  index: number;
  /** The Samonios this month follows, and the next one. */
  yearStart: Date;
  nextYearStart: Date;
  intercalary: boolean;
};

/** The reconstructed Coligny month holding `day`. */
export function colignyMonth(day: Date, ctx: CalendarContext): ColignyMonth {
  const s = settings(ctx);
  const target = localDay(day.getTime());
  const k = lunationOf(target, s.phase);
  let kSam = samoniosLunation(target.getFullYear(), s);
  if (kSam > k) kSam = samoniosLunation(target.getFullYear() - 1, s);
  else {
    const following = samoniosLunation(target.getFullYear() + 1, s);
    if (following <= k) kSam = following;
  }
  const kNext = samoniosLunation(monthStart(kSam, s.phase).getFullYear() + 1, s);
  const length = kNext - kSam;
  const i = k - kSam;
  let info: MonthInfo;
  if (length === 13) {
    const midYear = anchoredLunation(s.giamonios, monthStart(kSam, s.phase).getTime(), s) - kSam === 7;
    if (midYear) info = i === 6 ? RANTARANOS : COLIGNY_MONTHS[i < 6 ? i : i - 1];
    else info = i === 12 ? QUIMONIOS : COLIGNY_MONTHS[i];
  } else {
    info = COLIGNY_MONTHS[i];
  }
  const start = monthStart(k, s.phase);
  const days = daysBetween(start, monthStart(k + 1, s.phase));
  const ordinalIndex = info.status === 'intercalary' ? -1 : COLIGNY_MONTHS.indexOf(info);
  return { info, start, days, index: ordinalIndex, yearStart: monthStart(kSam, s.phase), nextYearStart: monthStart(kNext, s.phase), intercalary: info.status === 'intercalary' };
}

// ─── Text ────────────────────────────────────────────────────────────────

const RECON = 'reconstructed';
const TRINVX_MEANING =
  'TRINVX SAMONI, usually read as “the three nights of Samonios”, is written on the bronze against the 17th day of Samonios, the second after ATENOVX. It is often linked to the Irish Samain, though where Samonios fell in the year is itself disputed. Here the three nights are taken as the 16th to the 18th, around the inscription’s own day. A reconstruction.';

function statusText(info: MonthInfo): string {
  if (info === COLIGNY_MONTHS[8]) return 'ANM, “not good”, though Equos has 30 days in some years of the bronze';
  if (info.status === 'MAT') return 'MAT, a “good” month (30 days on the bronze)';
  if (info.status === 'ANM') return 'ANM, “not good” (29 days on the bronze)';
  if (info === QUIMONIOS) return 'an intercalary month (29 or 30 days; the bronze is broken here)';
  return 'an intercalary month (30 days on the bronze)';
}

function marksFor(m: ColignyMonth, n: number): CalendarMark[] {
  const marks: CalendarMark[] = [];
  if (n === 1) {
    marks.push({
      name: `${m.info.name} begins`,
      meaning: `The first day of ${m.info.name}, ${statusText(m.info)}: ${m.info.meaning}. A reconstruction.`,
    });
  }
  if (n === 16) {
    marks.push({
      name: 'ATENOVX',
      meaning: 'ATENOVX, “returning (night)” or “renewal”: the word on the bronze that divides every month into two halves. The second half begins, its days counted from one again. A reconstruction.',
    });
  }
  if (m.info.name === 'Samonios' && n >= 16 && n <= 18) marks.push({ name: 'TRINVX SAMONI (Three Nights of Samonios)', meaning: TRINVX_MEANING });
  return marks;
}

function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return `${n}${n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'}`;
}

// ─── The calendar ────────────────────────────────────────────────────────

export const COLIGNY_CALENDAR: CalendarDef = {
  id: 'coligny',
  name: 'Coligny calendar (Gaulish)',
  path: 'celtic',
  confidence: 'reconstructed',
  about:
    'The Coligny calendar is a bronze tablet from the late 2nd century CE, found in 1897 in pieces at Coligny, near Lyon in eastern France: the longest surviving text in the Gaulish language. It sets out five years of 62 lunar months: Samonios, Dumannios, Riuros, Anagantios, Ogronnios, Cutios, Giamonios, Simivisonnios, Equos, Elembivios, Aedrinios and Cantlos, with an intercalary month (Quimonios) before Samonios in the first year and another (…antaranos, often given as Rantaranos) before Giamonios in the third. Months are marked MAT (“good”, 30 days) or ANM (“not good”, 29), and each is split by ATENOVX (“returning” or “renewal”) into halves of 15 and 14 or 15 days. That much is on the bronze, though even the meanings of most month names are guesses. What is not on it is where the months sat against the moon, or the year against the sun. Scholars disagree whether months began at the new moon, the full moon or the first quarter (Pliny says the Gauls began their months and years on the sixth day of the moon); whether Samonios opened the year in late spring (McKay; Bonsing), at midsummer (Le Contel and Verdier), or around Samhain in autumn (the older, popular reading); and whether the five-year cycle sat within a 19-year or a 30-year one (Pliny speaks of a thirty-year age). No ancient date ties the cycle to ours, so every modern date given for it, these included, is a reconstruction. This one follows the real moon (months of 29 or 30 days as it gives them) and the seasons in the bronze’s own pattern, not any one scholar’s fixed cycle, and the choices below let you follow the main readings.',
  choices: [
    {
      key: 'colignyPhase',
      label: 'Months begin at',
      options: [
        { value: 'first-quarter', label: 'First quarter', note: 'Pliny: Gaulish months began on the sixth day of the moon, about the first quarter counting from the first crescent. McKay’s reconstruction.' },
        { value: 'new', label: 'New moon', note: 'The usual start for lunar months elsewhere; held by some earlier scholars.' },
        { value: 'full', label: 'Full moon', note: 'Taking ATENOVX, the “returning”, as the dark moon at mid-month. McKay argues against it.' },
      ],
      default: 'first-quarter',
    },
    {
      key: 'colignySeason',
      label: 'The year begins',
      options: [
        { value: 'beltane', label: 'In late spring', note: 'Samonios (“summer”) begins at the first such moon on or after Beltane, early May, so Dumannios comes about midsummer and Giamonios (“winter”) about Samhain. McKay’s and Bonsing’s reading.' },
        { value: 'summer', label: 'At midsummer', note: 'Samonios begins at the first such moon on or after the June solstice (Le Contel and Verdier).' },
        { value: 'autumn', label: 'At Samhain', note: 'Samonios is the month holding the early-November cross-quarter, linking it to the Irish Samain: the older and still popular reading, though it puts Giamonios, “winter”, in spring.' },
      ],
      default: 'beltane',
    },
    {
      key: 'colignyHemisphere',
      label: 'In the southern hemisphere',
      options: [
        { value: 'local', label: 'Follow my seasons', note: 'Samonios and Giamonios move six months, so “summer” and “winter” are yours.' },
        { value: 'north', label: 'Keep Gaul’s seasons', note: 'The months fall as they would in Gaul.' },
      ],
      default: 'local',
    },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Coligny_calendar',
    'G. S. Olmsted, The Gaulish Calendar: A Reconstruction from the Bronze Fragments from Coligny (Bonn: Habelt, 1992)',
    'P.-M. Duval and G. Pinault, Recueil des inscriptions gauloises III: Les calendriers (Coligny, Villards d’Héria) (Paris: CNRS, 1986)',
    'H. McKay, “The Coligny calendar as a Metonic lunar calendar”, Études Celtiques 42 (2016) 95–121: https://codecs.vanhamel.nl/McKay_(Helen)_2016_42awe',
    'Y. Le Contel and P. Verdier, Un calendrier celtique: le calendrier gaulois de Coligny (Paris: Errance, 1997)',
    'Pliny the Elder, Natural History 16.95 (the sixth day of the moon)',
    'https://nouiogalatis.org/2025/10/30/when-the-year-was-born/',
  ],

  dateOf(day: Date, ctx: CalendarContext): CalendarDate {
    const m = colignyMonth(day, ctx);
    const s = settings(ctx);
    const n = daysBetween(m.start, localDay(day.getTime())) + 1;
    const second = n > 15;
    const half = second ? `${n - 15} after ATENOVX` : `${n}`;
    const intercalaryNote = m.intercalary ? ' This year needs an extra month to keep the moon months in step with the sun.' : '';
    const year = m.info === QUIMONIOS ? null : m.yearStart.getFullYear();
    return {
      calendar: 'coligny',
      short: `${m.info.name} ${half} · ${RECON}`,
      long:
        `The ${ordinal(n)} day of ${m.info.name} (${second ? `day ${n - 15} of the second half, after ATENOVX` : 'in the first half, before ATENOVX'}), ${statusText(m.info)}: ${m.info.meaning}.${intercalaryNote} ` +
        `Reconstructed: months here begin at the ${s.phase.label}, and ${s.seasonLabel}${s.south ? ', shifted six months for the southern hemisphere' : ''}. No ancient date fixes the calendar to ours.`,
      month: { name: m.info.name, index: m.index, days: m.days, meaning: m.info.meaning },
      day: n,
      year: { label: year === null ? `Intercalary month before Samonios ${m.nextYearStart.getFullYear()} (reconstructed)` : `Gaulish year from Samonios ${year} (reconstructed)` },
      marks: marksFor(m, n),
    };
  },

  eventsBetween(from: Date, to: Date, ctx: CalendarContext): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const first = localDay(from.getTime());
    const last = localDay(to.getTime());
    let cursor = addDays(first, -3);
    while (cursor.getTime() <= last.getTime()) {
      const m = colignyMonth(cursor, ctx);
      if (m.start.getTime() >= first.getTime() && m.start.getTime() <= last.getTime()) {
        events.push({
          calendar: 'coligny',
          id: `coligny-${m.info.name.toLowerCase()}`,
          name: `${m.info.name} begins`,
          meaning: `${m.info.name}, ${statusText(m.info)}: ${m.info.meaning}. A reconstruction.`,
          date: m.start,
          days: 1,
        });
      }
      if (m.info.name === 'Samonios') {
        const trinox = addDays(m.start, 15);
        if (trinox.getTime() <= last.getTime() && addDays(trinox, 2).getTime() >= first.getTime()) {
          events.push({ calendar: 'coligny', id: 'coligny-trinvx-samoni', name: 'TRINVX SAMONI (Three Nights of Samonios)', meaning: TRINVX_MEANING, date: trinox, days: 3 });
        }
      }
      cursor = addDays(m.start, m.days);
    }
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  },
};
