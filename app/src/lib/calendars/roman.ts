// The Roman way of naming days, applied to the ordinary (Gregorian) date as
// modern Roman polytheists (Religio Romana) do. Each month has three fixed
// points, the Kalends (1st), the Nones (5th, or 7th in March, May, July and
// October) and the Ides (13th, or 15th in those months), and every other day
// is counted down, inclusively, to the next of them: 16 October is
// "a.d. XVII Kal. Nov.", the seventeenth day before the Kalends of November,
// counting both ends. The day before one is "pridie". Festivals are those of
// the Fasti (the inscribed calendars, Ovid's Fasti, Varro, Macrobius), as
// gathered by Scullard, "Festivals and Ceremonies of the Roman Republic".
// Festivals already in holidays.ts (Parentalia, Lupercalia, Matronalia,
// Floralia, Lemuria, Vestalia, Neptunalia, Saturnalia, Sol Invictus) are not
// repeated here. Pure.

import { startOfDay } from '../calendar.ts';
import type { CalendarDate, CalendarDef, CalendarEvent, CalendarMark } from './types.ts';

type RomanMonth = {
  /** The month's Latin name. */
  latin: string;
  /** Its usual abbreviation in dates. */
  abbr: string;
  /** The adjective with Kalendae/Nonae/Idus (nominative). */
  nom: string;
  /** The adjective after "ante diem … Kalendas" (accusative). */
  acc: string;
  meaning: string;
};

const MONTHS: RomanMonth[] = [
  { latin: 'Ianuarius', abbr: 'Ian.', nom: 'Ianuariae', acc: 'Ianuarias', meaning: 'Janus’s month, the god of doors, gates and beginnings, who looks both ways.' },
  { latin: 'Februarius', abbr: 'Feb.', nom: 'Februariae', acc: 'Februarias', meaning: 'The month of the februa, the means of purification: the old year’s cleansing and the honoring of the dead.' },
  { latin: 'Martius', abbr: 'Mart.', nom: 'Martiae', acc: 'Martias', meaning: 'Mars’s month, once the first of the year, when farming and the season of campaigns began.' },
  { latin: 'Aprilis', abbr: 'Apr.', nom: 'Apriles', acc: 'Apriles', meaning: 'A name of uncertain origin: the Romans linked it to aperire, “to open”, as buds open, or to Aphrodite, Venus.' },
  { latin: 'Maius', abbr: 'Mai.', nom: 'Maiae', acc: 'Maias', meaning: 'Named, the Romans said, for Maia, a goddess of growth (or for the maiores, the elders).' },
  { latin: 'Iunius', abbr: 'Iun.', nom: 'Iuniae', acc: 'Iunias', meaning: 'Juno’s month (or, some said, the month of the iuniores, the young).' },
  { latin: 'Iulius', abbr: 'Iul.', nom: 'Iuliae', acc: 'Iulias', meaning: 'Named for Julius Caesar in 44 BCE; before that Quintilis, the fifth month counting from March.' },
  { latin: 'Augustus', abbr: 'Aug.', nom: 'Augustae', acc: 'Augustas', meaning: 'Named for the emperor Augustus in 8 BCE; before that Sextilis, the sixth month from March.' },
  { latin: 'September', abbr: 'Sept.', nom: 'Septembres', acc: 'Septembres', meaning: 'The seventh month, counting from March as the old year did.' },
  { latin: 'October', abbr: 'Oct.', nom: 'Octobres', acc: 'Octobres', meaning: 'The eighth month, counting from March.' },
  { latin: 'November', abbr: 'Nov.', nom: 'Novembres', acc: 'Novembres', meaning: 'The ninth month, counting from March.' },
  { latin: 'December', abbr: 'Dec.', nom: 'Decembres', acc: 'Decembres', meaning: 'The tenth month, counting from March.' },
];

const ENGLISH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** The Nones fall on the 7th in March, May, July and October, else the 5th; the Ides eight days later. */
export const nonesOf = (month: number) => ([2, 4, 6, 9].includes(month) ? 7 : 5);
export const idesOf = (month: number) => nonesOf(month) + 8;

const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
const monthLength = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export function roman(n: number): string {
  const table: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [value, letters] of table) while (n >= value) { out += letters; n -= value; }
  return out;
}

const ORDINAL = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;

type Reckoning =
  | { kind: 'point'; point: 'Kalends' | 'Nones' | 'Ides'; month: number }
  | { kind: 'before'; point: 'Kalends' | 'Nones' | 'Ides'; month: number; count: number; bis?: boolean };

/** How a Roman would name the day: a fixed point, or a count down to the next one. */
export function reckon(day: Date): Reckoning {
  const y = day.getFullYear();
  const m = day.getMonth();
  const d = day.getDate();
  const nones = nonesOf(m);
  const ides = idesOf(m);
  if (d === 1) return { kind: 'point', point: 'Kalends', month: m };
  if (d < nones) return { kind: 'before', point: 'Nones', month: m, count: nones - d + 1 };
  if (d === nones) return { kind: 'point', point: 'Nones', month: m };
  if (d < ides) return { kind: 'before', point: 'Ides', month: m, count: ides - d + 1 };
  if (d === ides) return { kind: 'point', point: 'Ides', month: m };
  const next = (m + 1) % 12;
  if (m === 1 && isLeap(y)) {
    // The leap day: the Romans counted February as 28 days and said the
    // sixth day before the March Kalends twice. Following Celsus (Digest
    // 50.16.98), the second of the pair (our 25th) is the added one.
    if (d <= 24) return { kind: 'before', point: 'Kalends', month: next, count: 28 - d + 2 };
    if (d === 25) return { kind: 'before', point: 'Kalends', month: next, count: 6, bis: true };
    return { kind: 'before', point: 'Kalends', month: next, count: 31 - d };
  }
  return { kind: 'before', point: 'Kalends', month: next, count: monthLength(y, m) - d + 2 };
}

const POINT_ABBR = { Kalends: 'Kal.', Nones: 'Non.', Ides: 'Id.' } as const;
const POINT_LATIN_NOM = { Kalends: 'Kalendae', Nones: 'Nonae', Ides: 'Idus' } as const;
const POINT_LATIN_ACC = { Kalends: 'Kalendas', Nones: 'Nonas', Ides: 'Idus' } as const;

/** The usual abbreviated form: "a.d. XVII Kal. Nov.", "pridie Id. Mart.", "Kal. Oct.". */
export function romanAbbreviation(day: Date): string {
  const r = reckon(day);
  const month = MONTHS[r.month].abbr;
  if (r.kind === 'point') return `${POINT_ABBR[r.point]} ${month}`;
  if (r.count === 2) return `prid. ${POINT_ABBR[r.point]} ${month}`;
  return `a.d. ${r.bis ? 'bis ' : ''}${roman(r.count)} ${POINT_ABBR[r.point]} ${month}`;
}

function latinPhrase(r: Reckoning): string {
  const month = MONTHS[r.month];
  if (r.kind === 'point') return `${POINT_LATIN_NOM[r.point]} ${month.nom}`;
  if (r.count === 2) return `pridie ${POINT_LATIN_ACC[r.point]} ${month.acc}`;
  return `ante diem ${r.bis ? 'bis ' : ''}${roman(r.count)} ${POINT_LATIN_ACC[r.point]} ${month.acc}`;
}

function englishPhrase(r: Reckoning): string {
  const month = ENGLISH[r.month];
  if (r.kind === 'point') return `the ${r.point} of ${month}`;
  if (r.count === 2) return `the day before the ${r.point} of ${month}`;
  if (r.bis) return `the second “sixth day” before the Kalends of March, the Roman leap day`;
  return `the ${ORDINAL(r.count)} day before the ${r.point} of ${month}, counting both ends as the Romans did`;
}

// ─── Festivals ───────────────────────────────────────────────────────────

type Festival = { id: string; name: string; month: number; day: number; days?: number; meaning: string };

const FESTIVALS: Festival[] = [
  { id: 'compitalia', name: 'Compitalia', month: 0, day: 3, days: 3, meaning: 'Festival of the Lares of the crossroads, kept at the shrines where neighborhood paths meet. It was movable, announced each year by the praetor for a day between the Saturnalia and 5 January; under the Empire it settled on 3–5 January, which is the date given here.' },
  { id: 'agonalia', name: 'Agonalia (Agonium of Janus)', month: 0, day: 9, meaning: 'The rex sacrorum offered a ram to Janus, god of beginnings, at the start of the year. (Agonia also fell on 17 March, 21 May and 11 December.)' },
  { id: 'carmentalia', name: 'Carmentalia', month: 0, day: 11, meaning: 'First day of the feast of Carmenta, goddess of prophecy and childbirth, who sings the fates of those being born. Leather was kept out of her shrine.' },
  { id: 'carmentalia-2', name: 'Carmentalia (second day)', month: 0, day: 15, meaning: 'The second day of Carmenta’s feast, four days after the first, honoring her as Porrima and Postverta, who look forward and back at a birth.' },
  { id: 'quirinalia', name: 'Quirinalia', month: 1, day: 17, meaning: 'Festival of Quirinus, the deified Romulus, also called the Feast of Fools: those who had missed their own curia’s Fornacalia, the oven festival, made it up today.' },
  { id: 'terminalia', name: 'Terminalia', month: 1, day: 23, meaning: 'Festival of Terminus, god of boundary stones. Neighbors met at the stone between their fields, garlanded it and shared an offering of cakes, honey and wine.' },
  { id: 'equirria', name: 'Equirria', month: 1, day: 27, meaning: 'Horse races for Mars on the Campus Martius, as the season of war drew near.' },
  { id: 'equirria-2', name: 'Equirria (second)', month: 2, day: 14, meaning: 'The second horse races for Mars, on the Campus Martius (or on the Caelian when the Tiber flooded).' },
  { id: 'liberalia', name: 'Liberalia', month: 2, day: 17, meaning: 'Festival of Liber Pater and Libera, gods of wine, growth and freedom. Old women sold honey cakes (liba), and boys often put on the toga of manhood today.' },
  { id: 'quinquatrus', name: 'Quinquatrus', month: 2, day: 19, days: 5, meaning: 'Minerva’s festival of crafts, learning and healing, kept by artisans, teachers and doctors. It began as one day for Mars (the Salii danced), and grew to five.' },
  { id: 'tubilustrium', name: 'Tubilustrium', month: 2, day: 23, meaning: 'The purifying of the sacred trumpets used in ritual, at the close of the Quinquatrus. (Repeated on 23 May.)' },
  { id: 'veneralia', name: 'Veneralia', month: 3, day: 1, meaning: 'Festival of Venus Verticordia, “turner of hearts”, and Fortuna Virilis. Women washed her statue, decked it with flowers, and bathed crowned with myrtle.' },
  { id: 'cerialia', name: 'Cerialia (Ludi Ceriales)', month: 3, day: 12, days: 8, meaning: 'Games and festival of Ceres, goddess of grain and growing things, ending with the Cerialia proper on 19 April, when foxes with torches were loosed in the Circus.' },
  { id: 'fordicidia', name: 'Fordicidia', month: 3, day: 15, meaning: 'A pregnant cow was offered to Tellus, Mother Earth, in each curia, for the fertility of fields and herds; the Vestals kept the ashes of the calves for the Parilia.' },
  { id: 'parilia', name: 'Parilia', month: 3, day: 21, meaning: 'Festival of Pales, protector of shepherds and flocks, and Rome’s birthday: flocks and people leapt through bonfires of straw to be purified.' },
  { id: 'vinalia', name: 'Vinalia (Priora)', month: 3, day: 23, meaning: 'The wine festival of Jupiter (and Venus): last year’s wine was opened and its first draught poured for Jupiter.' },
  { id: 'robigalia', name: 'Robigalia', month: 3, day: 25, meaning: 'Offerings to Robigus, to keep blight and mildew from the young wheat, at a grove on the Via Claudia.' },
  { id: 'mercuralia', name: 'Mercuralia', month: 4, day: 15, meaning: 'Festival of Mercury on the Ides of May, the anniversary of his temple: merchants sprinkled themselves and their goods with water from his spring for luck in trade.' },
  { id: 'matralia', name: 'Matralia', month: 5, day: 11, meaning: 'Festival of Mater Matuta, goddess of dawn and of mothers, kept by women in their first marriage, who prayed for their sisters’ children.' },
  { id: 'diana', name: 'Ides of August (Diana)', month: 7, day: 13, meaning: 'Birthday of Diana’s temple on the Aventine, a holiday for the enslaved; women washed their hair and went to her grove at Nemi with torches (the Nemoralia).' },
  { id: 'portunalia', name: 'Portunalia', month: 7, day: 17, meaning: 'Festival of Portunus, god of harbors, doors and keys.' },
  { id: 'vinalia-rustica', name: 'Vinalia Rustica', month: 7, day: 19, meaning: 'The country wine festival: the priest of Jupiter opened the grape harvest with the first cut grapes, praying for the vintage.' },
  { id: 'consualia', name: 'Consualia', month: 7, day: 21, meaning: 'Festival of Consus, god of the stored harvest, whose altar under the Circus was uncovered today; horses and mules rested and were garlanded. (Kept again on 15 December.)' },
  { id: 'volcanalia', name: 'Volcanalia', month: 7, day: 23, meaning: 'Festival of Vulcan, god of fire, in the dry season when fires threatened the granaries; small fish were thrown into his fire as offerings.' },
  { id: 'opiconsivia', name: 'Opiconsivia', month: 7, day: 25, meaning: 'Festival of Ops Consiva, goddess of plenty and the harvest stored away, in her shrine in the Regia, entered only by the Vestals and the pontifex.' },
  { id: 'ludi-romani', name: 'Ludi Romani', month: 8, day: 4, days: 16, meaning: 'The Roman Games for Jupiter Optimus Maximus, the city’s oldest games, with the Epulum Iovis, a feast for the Capitoline gods, on the Ides. They ran 5–19 September in Cicero’s day; a day was added after Caesar’s death.' },
  { id: 'meditrinalia', name: 'Meditrinalia', month: 9, day: 11, meaning: 'The new wine was first tasted, mixed with old, with the words “I drink new and old wine; I am healed of new and old illness.”' },
  { id: 'fontinalia', name: 'Fontinalia', month: 9, day: 13, meaning: 'Festival of Fons, god of springs: garlands were thrown into springs and wells.' },
  { id: 'october-horse', name: 'October Horse (Equus October)', month: 9, day: 15, meaning: 'A chariot race for Mars on the Ides of October; the right-hand horse of the winning team was offered to him, at the end of the season of war.' },
  { id: 'armilustrium', name: 'Armilustrium', month: 9, day: 19, meaning: 'The purifying of arms on the Aventine, as the campaigning season closed and the Salii danced for Mars.' },
  { id: 'faunalia', name: 'Faunalia (country feast of Faunus)', month: 11, day: 5, meaning: 'Country people honored Faunus, god of woods and flocks, with wine, a kid and dancing in the fields (Horace, Odes 3.18).' },
  { id: 'consualia-2', name: 'Consualia (December)', month: 11, day: 15, meaning: 'The second festival of Consus, god of the stored harvest, as the sowing ended.' },
  { id: 'opalia', name: 'Opalia', month: 11, day: 19, meaning: 'The winter festival of Ops, goddess of plenty and the earth’s riches, during the Saturnalia.' },
  { id: 'larentalia', name: 'Larentalia', month: 11, day: 23, meaning: 'Offerings for the dead at the tomb of Acca Larentia, foster-mother of Romulus and Remus.' },
];

const DAY_MS = 86_400_000;
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

function eventsBetween(from: Date, to: Date): CalendarEvent[] {
  const start = startOfDay(from).getTime();
  const end = to.getTime();
  const out: CalendarEvent[] = [];
  for (let year = from.getFullYear() - 1; year <= to.getFullYear(); year++) {
    for (const f of FESTIVALS) {
      const date = new Date(year, f.month, f.day);
      const days = f.days ?? 1;
      if (addDays(date, days - 1).getTime() < start || date.getTime() > end) continue;
      out.push({ calendar: 'roman', id: `roman-${f.id}`, name: f.name, meaning: f.meaning, date, days });
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime() || a.name.localeCompare(b.name));
}

// Days the Romans held unlucky for beginning anything (dies atri), as given by
// Varro, Livy 6.1, Gellius 5.17 and Macrobius 1.16: every day after a Kalends,
// Nones or Ides, the anniversary of the Allia (18 July), and the three days
// the mundus, the pit to the underworld, stood open.
const MUNDUS = [[7, 24], [9, 5], [10, 8]];

function marksOf(day: Date): CalendarMark[] {
  const marks: CalendarMark[] = [];
  const m = day.getMonth();
  const d = day.getDate();
  const r = reckon(day);
  if (r.kind === 'point' && r.point === 'Kalends') marks.push({ name: 'Kalends', meaning: 'The first of the month, sacred to Juno. Once the pontiffs watched for the new crescent and called out (calare) the days to the Nones; offerings to the household Lares were made.' });
  if (r.kind === 'point' && r.point === 'Nones') marks.push({ name: 'Nones', meaning: 'Nine days before the Ides, counting inclusively, when the month’s festivals were once announced; from the first quarter moon of the old lunar month.' });
  if (r.kind === 'point' && r.point === 'Ides') marks.push({ name: 'Ides', meaning: 'The middle of the month, once the full moon, sacred to Jupiter: a white sheep was led up the Capitol for him.' });
  if (d === 2 || d === nonesOf(m) + 1 || d === idesOf(m) + 1) {
    marks.push({ name: 'Dies ater', meaning: 'A “black day”: the day after a Kalends, Nones or Ides, held unlucky for beginning anything new, after defeats that followed sacrifices on such days (Livy, Gellius, Macrobius).' });
  }
  if (m === 6 && d === 18) marks.push({ name: 'Dies Alliensis', meaning: 'The anniversary of the defeat at the Allia (390 BCE), the blackest day of the year, when nothing public was begun.' });
  if (MUNDUS.some(([mm, dd]) => mm === m && dd === d)) marks.push({ name: 'Mundus patet', meaning: '“The pit is open”: one of three days when the mundus, the passage to the underworld, was uncovered and the spirits of the dead could pass. No battles, marriages or business were begun.' });
  return marks;
}

function dateOf(day: Date): CalendarDate {
  const noon = startOfDay(day);
  const r = reckon(noon);
  const m = noon.getMonth();
  const month = MONTHS[m];
  const abbr = romanAbbreviation(noon);
  const short = r.kind === 'point' ? `${r.point} of ${ENGLISH[r.month]}` : abbr;
  const festivals = eventsBetween(noon, new Date(noon.getTime() + DAY_MS - 1)).map((e) => ({ name: e.name, meaning: e.meaning }));
  const marks = [...marksOf(noon), ...festivals];
  const long = `${latinPhrase(r)[0].toUpperCase()}${latinPhrase(r).slice(1)}: ${englishPhrase(r)}. This is ${month.latin}, ${month.meaning[0].toLowerCase()}${month.meaning.slice(1)}`;
  return {
    calendar: 'roman',
    short,
    long,
    month: { name: month.latin, index: m + 1, days: monthLength(noon.getFullYear(), m), meaning: month.meaning },
    day: noon.getDate(),
    year: { label: `${noon.getFullYear() + 753} AUC` },
    marks,
  };
}

export const ROMAN_CALENDAR: CalendarDef = {
  id: 'roman',
  name: 'Roman days',
  path: 'roman',
  confidence: 'historical',
  about:
    'The Romans named each day by counting down to the next Kalends (the 1st), Nones (the 5th, or 7th in March, May, July and October) or Ides (the 13th or 15th), counting both ends: so 16 October is “a.d. XVII Kal. Nov.”, the seventeenth day before the Kalends of November. Here that reckoning is applied to today’s ordinary date, as modern Roman polytheists do; the Julian calendar the Romans used now runs 13 days behind ours, so these are not the dates an ancient Roman would have seen on the same day. The festivals are those of the inscribed calendars, Ovid and Varro, kept on their traditional dates. A few were movable (the Compitalia, the Feriae Latinae) or changed length over the centuries, and the meaning of some old rites was already uncertain to the Romans themselves. The year is counted from the founding of Rome (AUC), as Romans later sometimes did; ordinarily they named the year by its consuls.',
  sources: [
    'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (1981)',
    'Ovid, Fasti; Macrobius, Saturnalia 1.12–16; Varro, De Lingua Latina 6',
    'A. K. Michels, The Calendar of the Roman Republic (1967)',
    'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Calendarium.html',
    'https://en.wikipedia.org/wiki/Roman_festivals',
    'https://en.wikipedia.org/wiki/Roman_calendar',
  ],
  dateOf: (day) => dateOf(day),
  eventsBetween: (from, to) => eventsBetween(from, to),
};
