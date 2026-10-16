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
//   default — Pliny's “sixth day of the moon” — or new or full moon);
// - Samonios is the month in which a seasonal turning point falls (the June
//   solstice, or the Samhain cross-quarter);
// - the year has 12 or 13 months as the moon and sun require, and the extra
//   month goes where the bronze puts one: mid-year before Giamonios when
//   Giamonios would otherwise start a month early, otherwise before Samonios.
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
  { name: 'Equos', status: 'ANM', meaning: 'the horse; its length changes from year to year on the bronze, as if to keep pace with the moon' },
  { name: 'Elembivios', status: 'ANM', meaning: 'perhaps the month of deer, like the Greek Elaphebolion, “deer-shooting”' },
  { name: 'Aedrinios', status: 'MAT', meaning: 'perhaps “fiery, hot”, from aidu-, fire' },
  { name: 'Cantlos', status: 'ANM', meaning: 'perhaps “song”, or the closing of the circle' },
];

export const QUIMONIOS: MonthInfo = { name: 'Quimonios', status: 'intercalary', meaning: 'the intercalary month set before Samonios in the first year of the bronze’s cycle; the name is read from a damaged line, and its meaning is unknown' };
export const CIALLOS: MonthInfo = { name: 'Ciallos', status: 'intercalary', meaning: 'the intercalary month set before Giamonios in the third year of the bronze’s cycle; Ciallos is a word in its heading, and others read its name as …antaranos (Rantaranos); its meaning is unknown' };

// ─── Choices ─────────────────────────────────────────────────────────────

const PHASES: Record<string, { phase: PrincipalPhase; offset: number; label: string }> = {
  'first-quarter': { phase: 'firstQuarter', offset: 0.25, label: 'first quarter' },
  new: { phase: 'new', offset: 0, label: 'new moon' },
  full: { phase: 'full', offset: 0.5, label: 'full moon' },
};

// Solar longitudes (tropical) for the month that holds Samonios and the month that holds Giamonios.
const SEASONS: Record<string, { samonios: number; giamonios: number; label: string }> = {
  summer: { samonios: 90, giamonios: 270, label: 'the June solstice' },
  autumn: { samonios: 225, giamonios: 45, label: 'the Samhain cross-quarter (early November)' },
};

function settings(ctx: CalendarContext) {
  const phase = PHASES[ctx.options.colignyPhase ?? ''] ?? PHASES['first-quarter'];
  const season = SEASONS[ctx.options.colignySeason ?? ''] ?? SEASONS.summer;
  // In the southern hemisphere, the seasons the names describe come six months later.
  const shift = ctx.hemisphere === 'south' && ctx.options.colignyHemisphere !== 'north' ? 180 : 0;
  return { phase, samonios: (season.samonios + shift) % 360, giamonios: (season.giamonios + shift) % 360, seasonLabel: season.label, south: shift !== 0 };
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

/** Lunation index of Samonios for the Samonios point falling in Gregorian `year` (south shifts it). */
function samoniosLunation(year: number, s: ReturnType<typeof settings>): number {
  const point = sunAt(s.samonios, Date.UTC(year, 0, 1));
  return lunationOf(localDay(point), s.phase);
}

export type ColignyMonth = { info: MonthInfo; start: Date; days: number; index: number; yearStart: Date; intercalary: boolean };

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
    const giamoniosPoint = sunAt(s.giamonios, monthStart(kSam, s.phase).getTime());
    const midYear = lunationOf(localDay(giamoniosPoint), s.phase) - kSam === 7;
    if (midYear) info = i === 6 ? CIALLOS : COLIGNY_MONTHS[i < 6 ? i : i - 1];
    else info = i === 12 ? QUIMONIOS : COLIGNY_MONTHS[i];
  } else {
    info = COLIGNY_MONTHS[i];
  }
  const start = monthStart(k, s.phase);
  const days = daysBetween(start, monthStart(k + 1, s.phase));
  const ordinalIndex = info.status === 'intercalary' ? -1 : COLIGNY_MONTHS.indexOf(info);
  return { info, start, days, index: ordinalIndex, yearStart: monthStart(kSam, s.phase), intercalary: info.status === 'intercalary' };
}

// ─── Text ────────────────────────────────────────────────────────────────

const RECON = 'reconstructed';
const TRINOX_MEANING =
  'TRINOX SAMONI SINDIV, “the three nights of Samonios (are) today”, is written on the bronze in the second half of Samonios. It is often linked to the Irish Samain, though where Samonios fell in the year is itself unknown. Here it is placed on days 16–18 (the first three nights after ATENOVX), with the inscription’s own day the 17th. A reconstruction.';

function statusText(info: MonthInfo): string {
  if (info.status === 'MAT') return 'MAT, a “good” month (30 days on the bronze)';
  if (info.status === 'ANM') return 'ANM, “not good” (29 days on the bronze)';
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
  if (m.info.name === 'Samonios' && n >= 16 && n <= 18) marks.push({ name: 'TRINOX SAMONI (Three Nights of Samonios)', meaning: TRINOX_MEANING });
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
    'The Coligny calendar is a bronze tablet from the late 2nd century CE, found in pieces at Coligny in eastern France in 1897: the longest surviving text in the Gaulish language. It sets out five years of 62 lunar months — Samonios, Dumannios, Riuros, Anagantios, Ogronnios, Cutios, Giamonios, Simivisonnios, Equos, Elembivios, Aedrinios, Cantlos, with an intercalary month before Samonios in the first year and another before Giamonios in the third. Months are MAT (“good”, 30 days) or ANM (“not good”, 29), and each is split by ATENOVX (“returning” or “renewal”) into halves of 15 and 14–15 days. That much is on the bronze. What is not: where the months sat against the moon, and the year against the sun. Scholars disagree whether months began at the new moon, the full moon or the first quarter (Pliny says the Gauls began months on the sixth day of the moon), and whether Samonios fell in early summer or around Samhain in autumn. No ancient date ties the cycle to ours, so every modern date given for it — here included — is a reconstruction. This one follows real moon phases and the seasons in the bronze’s own pattern rather than any single scholar’s fixed cycle (Olmsted’s 1992 reconstruction and McKay’s, among others, differ in detail).',
  choices: [
    {
      key: 'colignyPhase',
      label: 'Months begin at',
      options: [
        { value: 'first-quarter', label: 'First quarter', note: 'Pliny: Gaulish months began on the sixth day of the moon. Followed by McKay and many recent readings.' },
        { value: 'new', label: 'New moon', note: 'The most common start for lunar months elsewhere; held by some earlier scholars.' },
        { value: 'full', label: 'Full moon', note: 'Taking ATENOVX, the “returning”, as the dark moon at mid-month.' },
      ],
      default: 'first-quarter',
    },
    {
      key: 'colignySeason',
      label: 'Samonios falls',
      options: [
        { value: 'summer', label: 'At midsummer', note: 'Samonios holds the June solstice and Giamonios (“winter”) the December one, matching the names samo- “summer” and giamo- “winter”.' },
        { value: 'autumn', label: 'At Samhain', note: 'Samonios holds the early-November cross-quarter, linking it to the Irish Samain: the older and still popular reading, though it puts Giamonios in May.' },
      ],
      default: 'summer',
    },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Coligny_calendar',
    'G. S. Olmsted, The Gaulish Calendar: A Reconstruction from the Bronze Fragments from Coligny (Bonn: Habelt, 1992)',
    'P.-M. Duval and G. Pinault, Recueil des inscriptions gauloises III: Les calendriers (Coligny, Villards d’Héria) (Paris: CNRS, 1986)',
    'H. McKay, “The Coligny Calendar as a Metonic Lunar Calendar”, Études Celtiques 42 (2016)',
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
    const year = m.yearStart.getFullYear();
    return {
      calendar: 'coligny',
      short: `${m.info.name} ${half} · ${RECON}`,
      long:
        `The ${ordinal(n)} day of ${m.info.name} (${second ? `day ${n - 15} of the second half, after ATENOVX` : 'in the first half, before ATENOVX'}), ${statusText(m.info)}: ${m.info.meaning}.${intercalaryNote} ` +
        `Reconstructed: months here begin at the ${s.phase.label}, and Samonios holds ${s.seasonLabel}${s.south ? ', shifted six months for the southern hemisphere' : ''}. No ancient date fixes the calendar to ours.`,
      month: { name: m.info.name, index: m.index, days: m.days, meaning: m.info.meaning },
      day: n,
      year: { label: `Gaulish year from Samonios ${year} (reconstructed)` },
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
          events.push({ calendar: 'coligny', id: 'coligny-trinox-samoni', name: 'TRINOX SAMONI (Three Nights of Samonios)', meaning: TRINOX_MEANING, date: trinox, days: 3 });
        }
      }
      cursor = addDays(m.start, m.days);
    }
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  },
};
