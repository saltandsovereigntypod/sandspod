// Slavic month names and the Old Style (Julian) folk year.
//
// The native month names (Ukrainian Січень, Polish Styczeń, Czech Leden…)
// are names of the season: cutting wood, ice, birch sap, blossom, grass, red
// dye, linden, sickle, heather, leaf-fall. Today they name the ordinary
// Gregorian months, and that is how they are shown here.
//
// Many Orthodox and Greek Catholic communities still keep their feasts by the
// Julian calendar (Old Style), now 13 days behind, and much village custom —
// carols, the Kupala fires, the blessing of water, poppies and apples — is tied
// to those feasts. These are Christian feasts carrying older folk customs;
// how much of them is "pre-Christian" is often guessed at, and the notes say so.
// Pure; no React.

import type { CalendarContext, CalendarDate, CalendarDef, CalendarEvent, CalendarMark } from './types.ts';

export type SlavicLanguage = 'uk' | 'pl' | 'cs' | 'hr' | 'be';

type MonthName = { native: string; latin: string; meaning: string };

// Meanings follow the etymologies in Wiktionary and the Slavic calendar
// article (see sources); where scholars give two explanations, both are given.
export const SLAVIC_MONTHS: Record<SlavicLanguage, { label: string; months: MonthName[] }> = {
  uk: {
    label: 'Ukrainian',
    months: [
      { native: 'Січень', latin: 'Sichen', meaning: 'cutting: the month of felling trees and clearing land' },
      { native: 'Лютий', latin: 'Liutyi', meaning: 'fierce: the month of bitter cold' },
      { native: 'Березень', latin: 'Berezen', meaning: 'birch: when birch sap rises and is gathered' },
      { native: 'Квітень', latin: 'Kviten', meaning: 'blossom: the month of flowering' },
      { native: 'Травень', latin: 'Traven', meaning: 'grass: when the land turns green' },
      { native: 'Червень', latin: 'Cherven', meaning: 'red: from červec, the cochineal insect gathered for red dye in early summer' },
      { native: 'Липень', latin: 'Lypen', meaning: 'linden: when the lindens flower and give their honey' },
      { native: 'Серпень', latin: 'Serpen', meaning: 'sickle: the grain harvest begins' },
      { native: 'Вересень', latin: 'Veresen', meaning: 'heather: when the heather blooms' },
      { native: 'Жовтень', latin: 'Zhovten', meaning: 'yellowing: the leaves turn' },
      { native: 'Листопад', latin: 'Lystopad', meaning: 'leaf-fall' },
      { native: 'Грудень', latin: 'Hruden', meaning: 'clods: when the earth freezes into lumps' },
    ],
  },
  pl: {
    label: 'Polish',
    months: [
      { native: 'Styczeń', latin: 'Styczeń', meaning: 'cutting: from Old Polish sieczeń, the winter month of cutting wood' },
      { native: 'Luty', latin: 'Luty', meaning: 'fierce, harsh: the cruel cold' },
      { native: 'Marzec', latin: 'Marzec', meaning: 'of Mars: borrowed from Latin Martius, not a native name' },
      { native: 'Kwiecień', latin: 'Kwiecień', meaning: 'flowering: from kwiat, flower' },
      { native: 'Maj', latin: 'Maj', meaning: 'of Maia: borrowed from Latin Maius, not a native name' },
      { native: 'Czerwiec', latin: 'Czerwiec', meaning: 'red: from czerw, the grubs of the Polish cochineal, gathered in June for red dye' },
      { native: 'Lipiec', latin: 'Lipiec', meaning: 'linden: when the lindens flower' },
      { native: 'Sierpień', latin: 'Sierpień', meaning: 'sickle: the month of reaping' },
      { native: 'Wrzesień', latin: 'Wrzesień', meaning: 'heather: from wrzos, when the heather blooms' },
      { native: 'Październik', latin: 'Październik', meaning: 'shives: from paździerz, the woody waste left when flax and hemp are broken' },
      { native: 'Listopad', latin: 'Listopad', meaning: 'leaf-fall' },
      { native: 'Grudzień', latin: 'Grudzień', meaning: 'clods: from gruda, frozen lumps of earth' },
    ],
  },
  cs: {
    label: 'Czech',
    months: [
      { native: 'Leden', latin: 'Leden', meaning: 'ice: from led' },
      { native: 'Únor', latin: 'Únor', meaning: 'plunging: probably from nořit, as the ice sinks and breaks on the water' },
      { native: 'Březen', latin: 'Březen', meaning: 'birch (bříza), or “with young” (březí), when animals are pregnant' },
      { native: 'Duben', latin: 'Duben', meaning: 'oak: from dub' },
      { native: 'Květen', latin: 'Květen', meaning: 'blossom: from květ' },
      { native: 'Červen', latin: 'Červen', meaning: 'red (červený) or worm (červ), both tied to ripening fruit' },
      { native: 'Červenec', latin: 'Červenec', meaning: 'the little red month, after Červen' },
      { native: 'Srpen', latin: 'Srpen', meaning: 'sickle: the month of harvest' },
      { native: 'Září', latin: 'Září', meaning: 'before the rut: from Old Czech za říje (folk etymology links it to zářit, to glow)' },
      { native: 'Říjen', latin: 'Říjen', meaning: 'the rut: when the stags call' },
      { native: 'Listopad', latin: 'Listopad', meaning: 'leaf-fall' },
      { native: 'Prosinec', latin: 'Prosinec', meaning: 'uncertain: from prosit, to ask or pray, or from siný, the pale blue-grey of winter light' },
    ],
  },
  hr: {
    label: 'Croatian',
    months: [
      { native: 'Siječanj', latin: 'Siječanj', meaning: 'cutting: the month of hewing wood' },
      { native: 'Veljača', latin: 'Veljača', meaning: 'uncertain: the days growing longer, or valjati, for the changeable weather' },
      { native: 'Ožujak', latin: 'Ožujak', meaning: 'the lying month: from laž, a lie, for its deceptive weather' },
      { native: 'Travanj', latin: 'Travanj', meaning: 'grass: from trava' },
      { native: 'Svibanj', latin: 'Svibanj', meaning: 'dogwood: from svib, the budding cornel tree' },
      { native: 'Lipanj', latin: 'Lipanj', meaning: 'linden: from lipa' },
      { native: 'Srpanj', latin: 'Srpanj', meaning: 'sickle: the month of reaping' },
      { native: 'Kolovoz', latin: 'Kolovoz', meaning: 'wheel-drive: the harvest wagons on the roads' },
      { native: 'Rujan', latin: 'Rujan', meaning: 'the roaring of the stags, or rosy, blushing' },
      { native: 'Listopad', latin: 'Listopad', meaning: 'leaf-fall (October in Croatian, November in Polish, Czech and Ukrainian)' },
      { native: 'Studeni', latin: 'Studeni', meaning: 'cold: from studen' },
      { native: 'Prosinac', latin: 'Prosinac', meaning: 'the sun beginning to shine through (sinuti), or sinji, grey-blue' },
    ],
  },
  be: {
    label: 'Belarusian',
    months: [
      { native: 'Студзень', latin: 'Studzień', meaning: 'cold: from studzieny' },
      { native: 'Люты', latin: 'Liuty', meaning: 'fierce: the bitter cold' },
      { native: 'Сакавік', latin: 'Sakavik', meaning: 'sap: from sok, when birch and maple sap run' },
      { native: 'Красавік', latin: 'Krasavik', meaning: 'flowering, beauty: from krasa' },
      { native: 'Травень', latin: 'Travień', meaning: 'grass: from trava' },
      { native: 'Чэрвень', latin: 'Červień', meaning: 'red: from the cochineal grubs (červiec) gathered for dye' },
      { native: 'Ліпень', latin: 'Lipień', meaning: 'linden: from lipa' },
      { native: 'Жнівень', latin: 'Žnivień', meaning: 'reaping: from žniva, the harvest' },
      { native: 'Верасень', latin: 'Vierasień', meaning: 'heather: from vieras' },
      { native: 'Кастрычнік', latin: 'Kastryčnik', meaning: 'shives: from kastryca, the broken stalks left from working flax' },
      { native: 'Лістапад', latin: 'Listapad', meaning: 'leaf-fall' },
      { native: 'Снежань', latin: 'Sniežań', meaning: 'snow: from snieh' },
    ],
  },
};

const ENGLISH_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ─── Julian ↔ Gregorian, through the Julian Day Number ────────────────────

export function gregorianToJdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function julianToJdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - 32083;
}

export function jdnToJulian(jdn: number): { year: number; month: number; day: number } {
  const c = jdn + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return { day: e - Math.floor((153 * m + 2) / 5) + 1, month: m + 3 - 12 * Math.floor(m / 10), year: d - 4800 + Math.floor(m / 10) };
}

export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return { day: e - Math.floor((153 * m + 2) / 5) + 1, month: m + 3 - 12 * Math.floor(m / 10), year: 100 * b + d - 4800 + Math.floor(m / 10) };
}

/** The Julian (Old Style) date of an ordinary local day. */
export function julianDateOf(day: Date): { year: number; month: number; day: number } {
  return jdnToJulian(gregorianToJdn(day.getFullYear(), day.getMonth() + 1, day.getDate()));
}

/** Local midnight of the ordinary day that is Julian `y-m-d`. */
export function julianToLocal(y: number, m: number, d: number): Date {
  const g = jdnToGregorian(julianToJdn(y, m, d));
  return new Date(g.year, g.month - 1, g.day);
}

/** Orthodox Pascha (Julian computus, Meeus ch. 8) as a local ordinary date. */
export function orthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return julianToLocal(year, month, day);
}

// ─── Feasts kept by the Old Style ─────────────────────────────────────────

const OS = 'Kept on the Old Style (Julian) date by many Orthodox and Greek Catholic communities; since 2023 the Orthodox Church of Ukraine and the Ukrainian Greek Catholic Church keep it 13 days earlier, on the New Style date.';

type FixedFeast = { id: string; name: string; meaning: string; month: number; day: number; days?: number };

/** Fixed feasts by their Julian month and day. */
const FIXED: FixedFeast[] = [
  { id: 'slavic-sviatvechir', name: 'Sviatvechir (Holy Evening)', month: 12, day: 24, meaning: `Christmas Eve by the Old Style. Twelve meatless dishes are served at the first star, kutia (wheat with poppy seed and honey) first; a sheaf (didukh) stands in the corner for the ancestors, and hay lies under the tablecloth. A Christian feast carrying much older household customs. ${OS}` },
  { id: 'slavic-rizdvo', name: 'Rizdvo / Koliada (Old Style Christmas)', month: 12, day: 25, meaning: `The Nativity by the Old Style, when carollers (koliadnyky) go from house to house with the star, singing koliadky for the household’s luck. ${OS}` },
  { id: 'slavic-shchedryi-vechir', name: 'Shchedryi Vechir / Malanka', month: 12, day: 31, meaning: `The Generous Evening, St Melania’s eve: New Year’s Eve by the Old Style, with shchedrivky (well-wishing songs) and masked mummers playing Malanka and the goat. ${OS}` },
  { id: 'slavic-old-new-year', name: 'Old New Year (St Basil’s Day)', month: 1, day: 1, meaning: `New Year by the Old Style, the feast of St Basil. Boys go sowing (posivannia), throwing grain into homes for a fruitful year. ${OS}` },
  { id: 'slavic-vodokhreshche', name: 'Vodokhreshche / Jordan (Theophany)', month: 1, day: 6, meaning: `The Baptism of Christ by the Old Style: rivers and springs are blessed, crosses are cut in the ice, and the blessed water is carried home and kept all year. The end of the winter feasts. ${OS}` },
  { id: 'slavic-stritennia', name: 'Stritennia (the Meeting)', month: 2, day: 2, meaning: `Candlemas by the Old Style, said to be when winter meets spring. Candles blessed today (hromnychni svichky) are lit against storms and illness. ${OS}` },
  { id: 'slavic-yuri', name: 'Yuriy’s Day (St George, spring)', month: 4, day: 23, meaning: `St George’s Day by the Old Style, when cattle were first driven to pasture through dew and the fields were walked and blessed. ${OS}` },
  { id: 'slavic-kupala-old-style', name: 'Ivan Kupala (Old Style)', month: 6, day: 23, days: 2, meaning: `The Kupala night and St John’s Day by the Old Style, the night of 6–7 July: bonfires, wreaths floated on the water, and the search for the fern flower. The app’s Slavic festivals also show Kupala Night on 23 June (the New Style date); both are kept, by different communities. ${OS}` },
  { id: 'slavic-illia', name: 'Illia’s Day (Elijah the Thunderer)', month: 7, day: 20, meaning: `The prophet Elijah, who rides the thunder, by the Old Style. Scholars have long linked his thunder and the harvest’s end to the old god Perun, but that link is argued over, and the feast itself is Christian. No swimming after today, as the water grows cold. ${OS}` },
  { id: 'slavic-makovei', name: 'Makovei (Honey Saviour)', month: 8, day: 1, meaning: `The first of the three Saviours’ feasts by the Old Style: poppies, honey and flowers are blessed, and wells are cleaned and blessed. ${OS}` },
  { id: 'slavic-apple-spas', name: 'Yablichnyi Spas (Apple Saviour)', month: 8, day: 6, meaning: `The Transfiguration by the Old Style. The first apples, pears and grapes are blessed in church before they are eaten. ${OS}` },
  { id: 'slavic-pokrova', name: 'Pokrova (the Protecting Veil)', month: 10, day: 1, meaning: `The feast of the Protecting Veil of the Mother of God by the Old Style, at the turn to winter: the season of weddings begins, and girls asked Pokrova for a husband. ${OS}` },
  { id: 'slavic-andrii', name: 'Andrii’s Eve (St Andrew’s Night)', month: 11, day: 29, meaning: `The eve of St Andrew by the Old Style, the great night of girls’ fortune-telling: wax poured into water, dumplings fed to the dog, names asked of passers-by, and the game of biting the kalyta loaf. ${OS}` },
  { id: 'slavic-mykolai', name: 'St Mykolai’s Day', month: 12, day: 6, meaning: `St Nicholas by the Old Style, the protector of children, travellers and the poor: gifts are left under pillows overnight. ${OS}` },
];

type MovableFeast = { id: string; name: string; meaning: string; offset: number; days?: number };

const PASCHA_NOTE = 'Pascha is reckoned by the Julian computus and the Old Style even by churches that keep fixed feasts on the New Style date.';

const MOVABLE: MovableFeast[] = [
  { id: 'slavic-pascha', name: 'Velykden (Orthodox Easter)', offset: 0, meaning: `Pascha, the Resurrection, the “Great Day”. Baskets of paska bread, pysanky eggs, butter and salt are blessed at dawn, and the greeting is “Khrystos voskres!” ${PASCHA_NOTE}` },
  { id: 'slavic-radunytsia', name: 'Radunytsia (Remembrance of the Dead)', offset: 9, meaning: `The Tuesday after Thomas Sunday, when families go to the graves of their dead with eggs and bread, eat with them and share the Easter joy. A Christian remembrance holding one of the oldest ancestral customs. ${PASCHA_NOTE}` },
  { id: 'slavic-zeleni-sviata', name: 'Zeleni Sviata (Green Holidays, Trinity)', offset: 49, meaning: `Pentecost by the Orthodox reckoning: houses and churches are decked with green branches, herbs and sweet flag. The week around it is the old Rusalii, when the rusalky were said to walk. ${PASCHA_NOTE}` },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function language(ctx: CalendarContext): SlavicLanguage {
  const value = ctx.options.slavicLanguage;
  return value === 'pl' || value === 'cs' || value === 'hr' || value === 'be' ? value : 'uk';
}

function allFeasts(from: Date, to: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  for (let year = from.getFullYear() - 1; year <= to.getFullYear(); year += 1) {
    for (const f of FIXED) {
      const date = julianToLocal(year, f.month, f.day);
      const days = f.days ?? 1;
      if (date.getTime() <= end && addDays(date, days - 1).getTime() >= start) {
        events.push({ calendar: 'slavic', id: f.id, name: f.name, meaning: f.meaning, date, days });
      }
    }
  }
  for (let year = from.getFullYear(); year <= to.getFullYear(); year += 1) {
    const pascha = orthodoxEaster(year);
    for (const f of MOVABLE) {
      const date = addDays(pascha, f.offset);
      if (date.getTime() <= end && date.getTime() >= start) {
        events.push({ calendar: 'slavic', id: f.id, name: f.name, meaning: f.meaning, date, days: f.days ?? 1 });
      }
    }
  }
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ─── The calendar ────────────────────────────────────────────────────────

export const SLAVIC_CALENDAR: CalendarDef = {
  id: 'slavic',
  name: 'Slavic months and the Old Style',
  path: 'slavic',
  confidence: 'historical',
  about:
    'The Slavic languages kept their own names for the months, names of the working and growing year: cutting wood, fierce cold, birch sap, blossom, grass, red dye, linden, sickle, heather, leaf-fall, frozen clods. Once they named shifting seasonal stretches and differed from village to village; today they are simply the names of the ordinary months, and the same word can mean different months in different languages (listopad is November in Polish, Czech and Ukrainian but October in Croatian). Polish took Marzec and Maj from Latin. Beside the month, the Julian date is shown: the Old Style calendar, now 13 days behind, by which many Orthodox and Greek Catholic communities keep their feasts. The folk year of carols, Kupala fires, blessed water, poppies and apples grew up around those Christian feasts; how much of it is older than Christianity is often guessed and seldom known. Since 2023 the main churches of Ukraine keep fixed feasts on the New Style date, while Russia, Belarus, Serbia and many diaspora parishes keep the Old Style.',
  choices: [
    {
      key: 'slavicLanguage',
      label: 'Month names',
      options: [
        { value: 'uk', label: 'Ukrainian', note: 'Січень, Лютий, Березень… with transliteration.' },
        { value: 'pl', label: 'Polish', note: 'Styczeń, Luty, Marzec…' },
        { value: 'cs', label: 'Czech', note: 'Leden, Únor, Březen…' },
        { value: 'hr', label: 'Croatian', note: 'Siječanj, Veljača, Ožujak…' },
        { value: 'be', label: 'Belarusian', note: 'Студзень, Люты, Сакавік… with Łacinka transliteration.' },
      ],
      default: 'uk',
    },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Slavic_calendar',
    'https://en.wiktionary.org/wiki/січень',
    'https://en.wiktionary.org/wiki/czerwiec',
    'https://en.wiktionary.org/wiki/leden',
    'https://en.wiktionary.org/wiki/listopad',
    'https://en.wikipedia.org/wiki/Old_Style_and_New_Style_dates',
    'https://en.wikipedia.org/wiki/Revised_Julian_calendar',
    'https://en.wikipedia.org/wiki/Kupala_Night',
    'https://en.wikipedia.org/wiki/Radonitsa',
    'J. Meeus, Astronomical Algorithms, ch. 7–8 (Julian Day, the Julian computus for Easter)',
  ],

  dateOf(day: Date, ctx: CalendarContext): CalendarDate {
    const lang = language(ctx);
    const month = SLAVIC_MONTHS[lang].months[day.getMonth()];
    const julian = julianDateOf(day);
    const julianText = `${julian.day} ${ENGLISH_MONTHS[julian.month - 1]}`;
    const named = month.native === month.latin ? month.native : `${month.native} (${month.latin})`;
    const marks: CalendarMark[] = allFeasts(addDays(day, -1), day)
      .filter((e) => sameDay(e.date, day) || (e.days > 1 && day.getTime() >= e.date.getTime() && day.getTime() < addDays(e.date, e.days).getTime()))
      .map((e) => ({ name: e.name, meaning: e.meaning }));
    return {
      calendar: 'slavic',
      short: `${named} ${day.getDate()} · ${julianText} Old Style`,
      long: `${day.getDate()} ${named}, ${SLAVIC_MONTHS[lang].label} for ${ENGLISH_MONTHS[day.getMonth()]}: “${month.meaning}”. By the Julian calendar (Old Style), kept by many Orthodox churches for their feasts, it is ${julianText} ${julian.year}.`,
      month: { name: month.native, index: day.getMonth(), meaning: month.meaning },
      day: day.getDate(),
      year: { label: `${julian.year} Old Style` },
      marks,
    };
  },

  eventsBetween(from: Date, to: Date): CalendarEvent[] {
    return allFeasts(from, to);
  },
};
