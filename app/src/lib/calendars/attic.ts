// The Attic (Athenian) lunar calendar, as modern Hellenic polytheists keep it.
// Months run from new moon to new moon; the month starts at the Noumenia,
// the day after the astronomical new moon, when the first crescent can be
// seen. The year begins with Hekatombaion, at the first new moon after the
// summer solstice. When thirteen new moons fall before the next one, a
// second Poseideon is added after the first. The month structure itself is
// worked out by atticYear() in holidays.ts and reused here. Pure.

import { startOfDay } from '../calendar.ts';
import { atticYear, holidaysBetween } from '../holidays.ts';
import type { CalendarDate, CalendarDef, CalendarEvent, CalendarMark } from './types.ts';

const DAY_MS = 86_400_000;
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const daysApart = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);

const MEANINGS: Record<string, string> = {
  Hekatombaion: 'The month of the hekatomb, the great sacrifice of a hundred oxen; the Panathenaia for Athena falls in it.',
  Metageitnion: 'The month of Apollo Metageitnios, who presides over moving and new neighbors.',
  Boedromion: 'The month of Apollo Boedromios, who runs to help at the battle cry; the Eleusinian Mysteries fall in it.',
  Pyanepsion: 'The month of the bean-boiling, the Pyanepsia for Apollo; the Thesmophoria for Demeter falls in it.',
  Maimakterion: 'The month of Zeus Maimaktes, the blustering god of storms, as winter comes on.',
  Poseideon: 'Poseidon’s month, in the winter storms; the Haloa falls in it.',
  'Poseideon II': 'The second Poseideon, an extra month added in some years so that the lunar months keep pace with the seasons.',
  Gamelion: 'The month of marriages, sacred to Hera and Zeus; the Lenaia for Dionysus falls in it.',
  Anthesterion: 'The month of flowers, with the Anthesteria for Dionysus and the new wine.',
  Elaphebolion: 'The month of Artemis Elaphebolos, the deer-shooter; the City Dionysia falls in it.',
  Mounichion: 'The month of Artemis Mounichia, with cakes ringed by torches at the full moon.',
  Thargelion: 'The month of the Thargelia, the birthdays of Apollo and Artemis and the first fruits.',
  Skirophorion: 'The month of the Skira, a women’s festival of Demeter and Persephone, as the year ends.',
};

// Monthly holy days, from Mikalson, "The Sacred and Festival Calendar of
// Athens", and the scholia on Hesiod's Works and Days. The 1st, 2nd and last
// days are already holidays in holidays.ts (hellenic_monthly), so they are
// marks only, not events.
type MonthlyDay = { day: number; id: string; name: string; meaning: string; event: boolean };

const MONTHLY: MonthlyDay[] = [
  { day: 1, id: 'noumenia', name: 'Noumenia', meaning: 'The new month, with the first crescent: offerings to the household gods, Hestia and Apollo Noumenios, for a good month.', event: false },
  { day: 2, id: 'agathos-daimon', name: 'Agathos Daimon', meaning: 'The Good Spirit of the household, honored with a libation of unmixed wine.', event: false },
  { day: 3, id: 'athena', name: 'Athena’s day (Tritomenis)', meaning: 'The third of the month, Athena’s birthday each month: she was called Tritogeneia, “third-born”.', event: true },
  { day: 4, id: 'tetras', name: 'The Fourth (Tetras)', meaning: 'Sacred to Hermes, Aphrodite, Herakles and Eros. Herakles and Hermes were said to be born on a fourth; Hesiod calls it a good day to wed.', event: true },
  { day: 6, id: 'artemis', name: 'Artemis’s day', meaning: 'The sixth of the month, the birthday of Artemis, sacred to her.', event: true },
  { day: 7, id: 'apollo', name: 'Apollo’s day (Hebdomē)', meaning: 'The seventh of the month, the birthday of Apollo, holy to him; Hesiod calls it “the holy seventh”.', event: true },
  { day: 8, id: 'poseidon-theseus', name: 'Poseidon and Theseus', meaning: 'The eighth of the month, sacred to Poseidon and to his son Theseus, the hero of Athens.', event: true },
];

const DEIPNON = { name: 'Hekate’s Deipnon', meaning: 'Hekate’s supper on the last day of the month, “old and new” (henē kai nea): the house is cleansed and food left for Hekate at a crossroads.' };

const ORDINALS = ['', 'prōtē', 'deutera', 'tritē', 'tetartē', 'pemptē', 'hektē', 'hebdomē', 'ogdoē', 'enatē', 'dekatē'];
const ENGLISH_ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

type AtticDay = { name: string; index: number; day: number; length: number; start: Date; year: number; months: number };

/** The Attic month and day of an ordinary date. */
export function atticDay(date: Date): AtticDay {
  const day = startOfDay(date);
  let year = day.getFullYear();
  let spans = atticYear(year);
  if (day.getTime() < spans[0].start.getTime()) spans = atticYear((year -= 1));
  const i = spans.findIndex((s) => day.getTime() >= s.start.getTime() && day.getTime() < s.next.getTime());
  const span = spans[i];
  return {
    name: span.name,
    index: i + 1,
    day: daysApart(span.start, day) + 1,
    length: daysApart(span.start, span.next),
    start: span.start,
    year,
    months: spans.length,
  };
}

/**
 * The traditional name of the day. The month was counted in three decades:
 * the waxing (histamenou) days 1–10, the middle days 11–20, and the waning
 * (phthinontos) days counted backwards towards the month's end. In a hollow
 * (29-day) month, the "second of the waning" was left out, by the usual
 * modern reading of the evidence.
 */
export function traditionalDay(day: number, length: number): { greek: string; english: string } {
  if (day === 1) return { greek: 'Noumenia', english: 'the new moon day' };
  if (day === length) return { greek: 'henē kai nea', english: '“old and new”, the last day' };
  if (day <= 10) return { greek: `${ORDINALS[day]} histamenou`, english: `the ${ENGLISH_ORD[day]} of the waxing month` };
  if (day === 11) return { greek: 'hendekatē', english: 'the 11th' };
  if (day === 12) return { greek: 'dōdekatē', english: 'the 12th' };
  if (day < 20) return { greek: `${ORDINALS[day - 10]} epi deka`, english: `the ${day}th, “${ENGLISH_ORD[day - 10]} after ten”` };
  if (day === 20) return { greek: 'eikas', english: 'the 20th' };
  const back = 31 - day;
  return { greek: `${ORDINALS[back]} phthinontos`, english: `the ${ENGLISH_ORD[back]} of the waning month, counting down` };
}

/** Olympiad and year within it: the first Olympiad began in the summer of 776 BCE. */
export function olympiad(summerYear: number): { olympiad: number; year: number } {
  const n = summerYear + 775;
  return { olympiad: Math.floor(n / 4) + 1, year: (n % 4) + 1 };
}

function marksOf(a: AtticDay): CalendarMark[] {
  const marks: CalendarMark[] = MONTHLY.filter((m) => m.day === a.day).map((m) => ({ name: m.name, meaning: m.meaning }));
  if (a.day === a.length) marks.push(DEIPNON);
  return marks;
}

function dateOf(date: Date): CalendarDate {
  const day = startOfDay(date);
  const a = atticDay(day);
  const t = traditionalDay(a.day, a.length);
  const o = olympiad(a.year);
  const festivals = holidaysBetween(day, new Date(day.getTime() + DAY_MS - 1), { traditions: ['hellenic'], custom: [] }).map((h) => ({ name: h.name, meaning: h.meaning }));
  const meaning = MEANINGS[a.name];
  const hollow = a.length === 29 ? 'a hollow month of 29 days' : 'a full month of 30 days';
  return {
    calendar: 'attic',
    short: `${a.name} ${a.day}`,
    long: `Day ${a.day} of ${a.name} (${t.greek}, ${t.english}), ${hollow}. ${meaning}`,
    month: { name: a.name, index: a.index, days: a.length, meaning },
    day: a.day,
    year: { label: `Attic year ${a.year}/${String((a.year + 1) % 100).padStart(2, '0')} · Ol. ${o.olympiad}.${o.year}${a.months === 13 ? ' · 13 months' : ''}` },
    marks: [...marksOf(a), ...festivals],
  };
}

function eventsBetween(from: Date, to: Date): CalendarEvent[] {
  const start = startOfDay(from).getTime();
  const end = to.getTime();
  const out: CalendarEvent[] = [];
  for (let year = from.getFullYear() - 1; year <= to.getFullYear(); year++) {
    for (const span of atticYear(year)) {
      if (span.next.getTime() <= start || span.start.getTime() > end) continue;
      for (const m of MONTHLY) {
        if (!m.event) continue;
        const date = addDays(span.start, m.day - 1);
        if (date.getTime() < start || date.getTime() > end) continue;
        out.push({ calendar: 'attic', id: `attic-${m.id}`, name: m.name, meaning: `${m.meaning} (${span.name} ${m.day})`, date, days: 1, recurs: 'monthly' });
      }
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const ATTIC_CALENDAR: CalendarDef = {
  id: 'attic',
  name: 'Attic (Athenian) calendar',
  path: 'hellenic',
  confidence: 'historical',
  about:
    'The festival calendar of ancient Athens: twelve lunar months from Hekatombaion to Skirophorion, each beginning at the Noumenia, the first crescent after the new moon. Months were full (30 days) or hollow (29), and days were counted in three tens, the last ten counted down towards the month’s end, so day 23 of a month was “the 8th of the waning”. The month names, the festivals and the monthly holy days are well known from inscriptions and writers. What is reconstructed is the mechanism: Athens had no fixed rule. The archons decided when to add a month (usually a second Poseideon) and sometimes even inserted or skipped days, and days ran from sunset to sunset. Most modern Hellenists start the year at the first new moon after the summer solstice, begin each month the day after the astronomical new moon, and add Poseideon II whenever thirteen new moons fall in a year, which is what is done here, with days from midnight. Groups differ by a day on this: some (Hellenion, for one) keep Hekate’s Deipnon on the day after the dark moon and the Noumenia the day after that, when the crescent is more surely visible, so their months often begin a day later than these. Years are also shown by Olympiad, as some Hellenists count them (Ol. 701.2 from the summer of 2026).',
  sources: [
    'J. D. Mikalson, The Sacred and Festival Calendar of Athens (1975)',
    'W. K. Pritchett & O. Neugebauer, The Calendars of Athens (1947)',
    'Hesiod, Works and Days 765–828',
    'https://en.wikipedia.org/wiki/Attic_calendar',
    'Hellenion, 2026 calendar: https://www.hellenion.org/wp-content/uploads/2025/11/HellenionCalendar2026.html',
  ],
  dateOf: (day) => dateOf(day),
  eventsBetween: (from, to) => eventsBetween(from, to),
};
