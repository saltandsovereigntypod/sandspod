// The seasons of the year, counted as you choose (Settings → Location &
// hemisphere, `season_count_by`):
//
//   astronomical    (default) from the solstices and equinoxes: spring from the
//                   March equinox in the north, by the sun's longitude
//   meteorological  whole months, as weather services count them: spring is
//                   March, April and May in the north
//   celtic          from the cross-quarter days of the Gaelic year, kept on
//                   fixed dates: winter from Samhain (1 November), spring from
//                   Imbolc (1 February), summer from Beltane (1 May), autumn
//                   from Lughnasadh (1 August), so the solstices and equinoxes
//                   fall at each season's middle (midwinter, midsummer)
//
// South of the equator each is turned round by half a year. Used wherever the
// current season of the year is shown: Today's sky, the Wheel's festival pages
// (where a festival falls in its season), Cycle & Moon's season card (beside
// the inner season) and the kitchen's simmer pots. Shared with the website.
// Pure.

import { sunLongitude } from './moon.ts';

export type YearSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type SeasonCounting = 'astronomical' | 'meteorological' | 'celtic';

export const SEASON_COUNT_KEY = 'season_count_by';

export const SEASON_COUNTINGS: { value: SeasonCounting; label: string; about: string }[] = [
  { value: 'astronomical', label: 'Solstices & equinoxes', about: 'Each season begins at a solstice or an equinox, as astronomers count them: spring at the March equinox in the north.' },
  { value: 'meteorological', label: 'Whole months', about: 'Each season is three whole months, as weather services count them: spring is March, April and May in the north.' },
  { value: 'celtic', label: 'Celtic cross-quarters', about: 'Each season begins at a cross-quarter day of the Gaelic year: winter at Samhain, spring at Imbolc, summer at Beltane and autumn at Lughnasadh, so midwinter and midsummer fall at the solstices.' },
];

type SettingsLike = Record<string, unknown> | null | undefined;

/**
 * North or south (calendars/index.ts hemisphereOf, which uses this): the
 * person's choice (`calendar_hemisphere`), else the place's latitude, else a
 * southern Wheel of the Year chosen on its own, else north.
 */
export function hemisphereFrom(settings: SettingsLike, latitude: number | null | undefined): 'north' | 'south' {
  const chosen = settings?.calendar_hemisphere;
  if (chosen === 'north' || chosen === 'south') return chosen;
  if (typeof latitude === 'number' && Number.isFinite(latitude)) return latitude < 0 ? 'south' : 'north';
  const traditions = typeof settings?.calendar_traditions === 'string' ? settings.calendar_traditions.split(',').map((t) => t.trim()) : [];
  return traditions.includes('wheel_south') && !traditions.includes('wheel') ? 'south' : 'north';
}

/** The season of the year now, for someone's settings and place: "Autumn until 21 December, by the solstices and equinoxes." */
export const yearSeasonLine = (date: Date, settings: SettingsLike, latitude: number | null | undefined): string => seasonLine(date, hemisphereFrom(settings, latitude), seasonCounting(settings));

/** The chosen way of counting, astronomical unless another is chosen. */
export function seasonCounting(settings: SettingsLike): SeasonCounting {
  const v = settings?.[SEASON_COUNT_KEY];
  return v === 'meteorological' || v === 'celtic' ? v : 'astronomical';
}

const ORDER: YearSeason[] = ['spring', 'summer', 'autumn', 'winter'];
const FLIP: Record<YearSeason, YearSeason> = { spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' };
const NAMES: Record<YearSeason, string> = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };
export const seasonName = (s: YearSeason) => NAMES[s];

/** The northern season on a day, for the month-based countings. */
function northByMonth(date: Date, counting: 'meteorological' | 'celtic'): YearSeason {
  const m = date.getMonth();
  // Meteorological: Mar–May spring, Jun–Aug summer, Sep–Nov autumn, Dec–Feb winter.
  // Celtic: Feb–Apr spring, May–Jul summer, Aug–Oct autumn, Nov–Jan winter.
  const shifted = counting === 'meteorological' ? (m + 10) % 12 : (m + 11) % 12;
  return ORDER[Math.floor(shifted / 3)];
}

function northByLongitude(date: Date): YearSeason {
  return ORDER[Math.floor(sunLongitude(date) / 90) % 4];
}

const northSeason = (date: Date, counting: SeasonCounting): YearSeason => (counting === 'astronomical' ? northByLongitude(date) : northByMonth(date, counting));

/** The season of the year on a day. */
export function seasonOfYear(date: Date, hemisphere: 'north' | 'south', counting: SeasonCounting = 'astronomical'): YearSeason {
  const north = northSeason(date, counting);
  return hemisphere === 'south' ? FLIP[north] : north;
}

/** The day the current season ends (the first day of the next), found a day at a time within four months. */
export function seasonEnds(date: Date, hemisphere: 'north' | 'south', counting: SeasonCounting = 'astronomical'): Date {
  const now = seasonOfYear(date, hemisphere, counting);
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  for (let i = 1; i <= 125; i++) {
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate() + i, 12);
    if (seasonOfYear(next, hemisphere, counting) !== now) return new Date(next.getFullYear(), next.getMonth(), next.getDate());
  }
  return day;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const BY: Record<SeasonCounting, string> = { astronomical: 'by the solstices and equinoxes', meteorological: 'by whole months', celtic: 'by the Celtic cross-quarters' };

/** "Autumn until 21 December, by the solstices and equinoxes." */
export function seasonLine(date: Date, hemisphere: 'north' | 'south', counting: SeasonCounting = 'astronomical'): string {
  const ends = seasonEnds(date, hemisphere, counting);
  return `${NAMES[seasonOfYear(date, hemisphere, counting)]} until ${ends.getDate()} ${MONTHS[ends.getMonth()]}, ${BY[counting]}.`;
}

// ─── The Wheel's festivals in their seasons ─────────────────────────────

/** The Wheel's eight festivals (and the Gaelic four), as the turning points they are: solstice or equinox, or cross-quarter. */
const FESTIVAL_KIND: Record<string, { kind: 'quarter' | 'cross'; season: YearSeason }> = {
  yule: { kind: 'quarter', season: 'winter' },
  ostara: { kind: 'quarter', season: 'spring' },
  litha: { kind: 'quarter', season: 'summer' },
  mabon: { kind: 'quarter', season: 'autumn' },
  samhain: { kind: 'cross', season: 'winter' },
  samhain_gaelic: { kind: 'cross', season: 'winter' },
  imbolc: { kind: 'cross', season: 'spring' },
  la_fheile_bride: { kind: 'cross', season: 'spring' },
  beltane: { kind: 'cross', season: 'summer' },
  bealtaine: { kind: 'cross', season: 'summer' },
  lammas: { kind: 'cross', season: 'autumn' },
  lughnasadh: { kind: 'cross', season: 'autumn' },
};

const before = (s: YearSeason) => ORDER[(ORDER.indexOf(s) + 3) % 4];

/**
 * Where a festival of the Wheel (or the Gaelic year) falls in its season, by
 * the chosen counting: "By the solstices and equinoxes, Ostara begins spring."
 * Takes a holiday id ('wheel/ostara', 'wheel_south/samhain', 'celtic/bealtaine'
 * or the bare id); null for any other day. The festival's own season is the
 * same either side of the equator, as the southern Wheel keeps each festival
 * in its season.
 */
export function festivalSeasonLine(holidayId: string, name: string, counting: SeasonCounting): string | null {
  const id = holidayId.includes('/') ? holidayId.split('/')[1] : holidayId.replace(/^(wheel_south|wheel|celtic)-/, '');
  const f = FESTIVAL_KIND[id];
  if (!f) return null;
  const by = BY[counting].charAt(0).toUpperCase() + BY[counting].slice(1);
  const s = f.season.toLowerCase();
  if (counting === 'astronomical') return f.kind === 'quarter' ? `${by}, ${name} begins ${s}.` : `${by}, ${name} falls halfway through ${before(f.season)}, as it turns towards ${s}.`;
  if (counting === 'celtic') return f.kind === 'cross' ? `${by}, ${name} begins ${s}.` : `${by}, ${name} is mid${s === 'autumn' || s === 'spring' ? `-${s}` : s}.`;
  // Whole months: the solstices and equinoxes fall about three weeks into a season, the cross-quarters in its last month.
  return f.kind === 'quarter' ? `${by}, ${name} falls about three weeks into ${s}.` : `${by}, ${name} falls in the last month of ${before(f.season)}, before ${s} begins.`;
}
