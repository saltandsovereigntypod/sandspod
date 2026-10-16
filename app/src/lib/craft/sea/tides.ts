// Tides for the sea practice. Two layers:
//
// 1. Everywhere: spring and neap tides read from the moon. Springs (the
//    biggest range, highest highs and lowest lows) follow the new and full
//    moon by a day or two; neaps (the smallest range) follow the quarters.
//    Near perigee the springs run larger still ("king tides").
// 2. US coasts: real high and low water from NOAA CO-OPS predictions. The
//    parsing, grouping and station-finding here are pure; the fetching and
//    caching live in noaa.ts.

import { dateToJulianDay, upcomingPhases, type PhaseEvent, type PrincipalPhase } from '../../moon.ts';

const DAY_MS = 86_400_000;
const RAD = Math.PI / 180;

// ---------------------------------------------------------------------------
// Springs and neaps

export type TideRange = 'spring' | 'neap';

/** Where the fortnightly cycle stands: in springs, easing to neaps, in neaps, or building to springs. */
export type RangeStage = 'spring' | 'easing' | 'neap' | 'building';

/** How long after the phase the springs or neaps are counted to last. */
const WINDOW_MS = 3 * DAY_MS;
/** The tides lag the moon: the biggest (or smallest) range comes a day or two after the phase. */
const PEAK_LAG_MS = 1.5 * DAY_MS;

const rangeOf = (phase: PrincipalPhase): TideRange => (phase === 'new' || phase === 'full' ? 'spring' : 'neap');

/** Principal phases around a moment: a little before it and well after. */
function phasesAround(at: Date, count = 10): PhaseEvent[] {
  return upcomingPhases(new Date(at.getTime() - 9 * DAY_MS), count);
}

export type RangeNow = {
  stage: RangeStage;
  /** The phase that set this stage going. */
  phase: PhaseEvent;
  /** Roughly when this stage's tides are at their most (springs or neaps), or the next ones are. */
  peak: Date;
};

/** The spring–neap stage at a moment. */
export function rangeStage(at: Date): RangeNow {
  const phases = phasesAround(at);
  let last = phases[0];
  for (const p of phases) if (p.date.getTime() <= at.getTime()) last = p;
  const since = at.getTime() - last.date.getTime();
  const range = rangeOf(last.phase);
  if (since <= WINDOW_MS) return { stage: range, phase: last, peak: new Date(last.date.getTime() + PEAK_LAG_MS) };
  const next = phases.find((p) => p.date.getTime() > at.getTime()) ?? last;
  return { stage: range === 'spring' ? 'easing' : 'building', phase: last, peak: new Date(next.date.getTime() + PEAK_LAG_MS) };
}

/** Spring or neap for a day, if that day falls in either window; otherwise null (in between). */
export function rangeOnDay(day: Date): TideRange | null {
  const noon = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);
  const stage = rangeStage(noon).stage;
  return stage === 'spring' || stage === 'neap' ? stage : null;
}

export type RangeEvent = {
  range: TideRange;
  /** The new, full or quarter moon behind it. */
  phase: PhaseEvent;
  /** Window: from the phase to three days after. */
  from: Date;
  to: Date;
  /** Roughly the biggest (or smallest) day. */
  peak: Date;
  /** Moon near perigee at the peak: springs larger than usual (king tides). */
  perigean: boolean;
};

/** The next springs and neaps that haven't ended yet, in order. */
export function upcomingRanges(from: Date, count = 4): RangeEvent[] {
  return phasesAround(from, count + 8)
    .map((phase): RangeEvent => {
      const peak = new Date(phase.date.getTime() + PEAK_LAG_MS);
      const range = rangeOf(phase.phase);
      return {
        range,
        phase,
        from: phase.date,
        to: new Date(phase.date.getTime() + WINDOW_MS),
        peak,
        perigean: range === 'spring' && moonDistanceKm(peak) < PERIGEAN_KM,
      };
    })
    .filter((e) => e.to.getTime() > from.getTime())
    .slice(0, count);
}

export function nextRange(from: Date, range: TideRange): RangeEvent {
  return upcomingRanges(from, 6).find((e) => e.range === range)!;
}

/**
 * The Moon's distance from Earth in km: Meeus, "Astronomical Algorithms"
 * ch. 47, with the larger periodic terms (good to a few hundred km, enough
 * to tell a close moon from a far one).
 */
export function moonDistanceKm(date: Date): number {
  const T = (dateToJulianDay(date) - 2451545) / 36525;
  const D = (297.8501921 + 445267.1114034 * T) * RAD;
  const M = (357.5291092 + 35999.0502909 * T) * RAD;
  const Mp = (134.9633964 + 477198.8675055 * T) * RAD;
  const F = (93.272095 + 483202.0175233 * T) * RAD;
  const E = 1 - 0.002516 * T;
  const c = Math.cos;
  const sum =
    -20905355 * c(Mp) -
    3699111 * c(2 * D - Mp) -
    2955968 * c(2 * D) -
    569925 * c(2 * Mp) +
    48888 * E * c(M) -
    3149 * c(2 * F) +
    246158 * c(2 * D - 2 * Mp) -
    152138 * E * c(2 * D - M - Mp) -
    170733 * c(2 * D + Mp) -
    204586 * E * c(2 * D - M) -
    129620 * E * c(M - Mp) +
    108743 * c(D) +
    104755 * E * c(M + Mp) +
    10321 * c(2 * D - 2 * F) +
    79661 * c(Mp - 2 * F) -
    34782 * c(4 * D - Mp) -
    23210 * c(3 * Mp) -
    21636 * c(4 * D - 2 * Mp) +
    24208 * E * c(2 * D + M - Mp) +
    30824 * E * c(2 * D + M);
  return 385000.56 + sum / 1000;
}

/** Closer than this at a spring peak and the springs run noticeably large. */
export const PERIGEAN_KM = 362_000;

export const RANGE_WORDS: Record<RangeStage, { title: string; body: string }> = {
  spring: {
    title: 'Spring tides',
    body: 'The sun and moon pull in line, so the sea climbs highest and falls furthest. The strongest draw and the strongest release: a time for big workings, deep cleansing, bold calling-in and clean endings.',
  },
  easing: {
    title: 'Easing toward neaps',
    body: 'The great range is softening day by day. Good for finishing what the springs began and letting things settle.',
  },
  neap: {
    title: 'Neap tides',
    body: 'Sun and moon pull at right angles, so the water barely rises and barely falls. Gentle, steady work: tending, maintaining, patient habits, quiet devotion.',
  },
  building: {
    title: 'Building toward springs',
    body: 'Each tide reaches a little further than the last. Gather what you’ll need and build the working you mean to make at the springs.',
  },
};

export const TIDE_TIMING: { title: string; body: string }[] = [
  { title: 'Rising tide (flood)', body: 'The water comes in and draws with it. Work to bring in: money, love, health, new friends, a fresh start.' },
  { title: 'High water', body: 'The sea at its fullest. Culmination, blessing, charging water and tools, giving thanks.' },
  { title: 'Ebbing tide', body: 'The water goes out and carries away. Release, banishing, cord-cutting, cleansing, letting grief move.' },
  { title: 'Low water', body: 'The shore laid bare. Rest, reflection, seeing what is hidden, and the best hour for beachcombing.' },
  { title: 'The turn (slack water)', body: 'The pause between flood and ebb. A threshold time, for divination and for choosing what to begin or end.' },
];

export const SEA_SAFETY: string[] = [
  'Check the local tide table before you go and again on the day; app times are a guide, and wind and pressure can push the sea higher than predicted.',
  'Know your way off the beach. Rising water can cut off bays, sandbars, causeways and the foot of cliffs fast; turn back with time to spare.',
  'Rip currents look like calm, darker gaps between breaking waves. If caught, don’t fight it: float, raise a hand, and swim parallel to the shore once it eases.',
  'Spring tides and king tides bring the biggest range and the strongest currents; take extra care then.',
  'Mud and quicksand flats can trap you at low water. Stay off them unless you know them well.',
  'Never work alone at the water’s edge at night or in rough weather, and keep candles and charcoal well above the strandline.',
];

// ---------------------------------------------------------------------------
// NOAA predictions

/** One NOAA high/low, as the API sends it: "2026-10-16 05:32", value in feet or metres, H or L. */
export type NoaaPrediction = { t: string; v: string; type: 'H' | 'L' };

export type TideEvent = {
  /** Station local time, as the API gives it. */
  time: string;
  /** "YYYY-MM-DD", station local. */
  day: string;
  /** "HH:MM", station local. */
  clock: string;
  height: number;
  kind: 'high' | 'low';
};

/** Read a NOAA predictions response. Throws with NOAA's own message when it sends an error. */
export function parsePredictions(json: unknown): TideEvent[] {
  const body = json as { predictions?: unknown; error?: { message?: string } } | null;
  if (!body || typeof body !== 'object') throw new Error('No tide data came back.');
  if (body.error) throw new Error(String(body.error.message ?? 'NOAA could not give predictions for that station.').trim());
  if (!Array.isArray(body.predictions)) throw new Error('No tide data came back.');
  const out: TideEvent[] = [];
  for (const p of body.predictions as Partial<NoaaPrediction>[]) {
    if (!p || typeof p.t !== 'string') continue;
    const m = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/.exec(p.t);
    const height = Number(p.v);
    const kind = p.type === 'H' ? 'high' : p.type === 'L' ? 'low' : null;
    if (!m || !kind || !Number.isFinite(height)) continue;
    out.push({ time: p.t, day: m[1], clock: m[2], height, kind });
  }
  return out.sort((a, b) => (a.time < b.time ? -1 : 1));
}

/** Events grouped by station-local day, in order. */
export function eventsByDay(events: TideEvent[]): { day: string; events: TideEvent[] }[] {
  const groups: { day: string; events: TideEvent[] }[] = [];
  for (const e of events) {
    const last = groups[groups.length - 1];
    if (last && last.day === e.day) last.events.push(e);
    else groups.push({ day: e.day, events: [e] });
  }
  return groups;
}

/** "YYYYMMDD" for a local date, as NOAA's begin_date and end_date want it. */
export function noaaDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

/** "YYYY-MM-DD" for a local date. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type Units = 'english' | 'metric';

export const NOAA_DATA = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
export const NOAA_STATIONS = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions';

/** Today and the next two days of highs and lows for a station. */
export function predictionsUrl(stationId: string, units: Units, today: Date): string {
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
  const params = [
    ['product', 'predictions'],
    ['application', 'SaltAndSovereignty'],
    ['begin_date', noaaDate(today)],
    ['end_date', noaaDate(end)],
    ['datum', 'MLLW'],
    ['station', stationId],
    ['time_zone', 'lst_ldt'],
    ['units', units],
    ['interval', 'hilo'],
    ['format', 'json'],
  ];
  return `${NOAA_DATA}?${params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
}

/** Parse "YYYY-MM-DD HH:MM" as a time on this phone's clock. */
export function localTime(stamp: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(stamp);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
}

export type TideNow = {
  state: 'rising' | 'falling' | 'high' | 'low';
  /** The event the water is heading for (or at, when slack). */
  next: TideEvent;
  /** Minutes until it. Negative or small when it's at the turn. */
  minutes: number;
};

/** What the water is doing now, from the day's events. Times are read on the phone's clock, so only use it when the station shares the phone's time zone. */
export function tideNow(events: TideEvent[], now: Date): TideNow | null {
  const timed = events.map((e) => ({ e, at: localTime(e.time) })).filter((x): x is { e: TideEvent; at: Date } => !!x.at);
  const slack = 30 * 60_000;
  for (const { e, at } of timed) {
    const diff = at.getTime() - now.getTime();
    if (Math.abs(diff) <= slack) return { state: e.kind, next: e, minutes: Math.round(diff / 60_000) };
  }
  const next = timed.find((x) => x.at.getTime() > now.getTime());
  if (!next) return null;
  // Without an event before now we can still say which way it's going.
  return { state: next.e.kind === 'high' ? 'rising' : 'falling', next: next.e, minutes: Math.round((next.at.getTime() - now.getTime()) / 60_000) };
}

/** Does the station keep the same clock as the phone? NOAA gives the station's standard offset; daylight time adds an hour. */
export function sameClock(stationOffsetHours: number | null | undefined, phoneOffsetMinutes: number): boolean {
  if (stationOffsetHours == null || !Number.isFinite(stationOffsetHours)) return false;
  const phone = -phoneOffsetMinutes / 60;
  return phone === stationOffsetHours || phone === stationOffsetHours + 1;
}

// ---------------------------------------------------------------------------
// Stations

export type Station = { id: string; name: string; state: string; lat: number; lng: number; /** Standard UTC offset, hours. */ tz: number | null };

/** Keep just what we need from NOAA's station list (it's 2 MB as sent). */
export function slimStations(json: unknown): Station[] {
  const list = (json as { stations?: unknown })?.stations;
  if (!Array.isArray(list)) throw new Error('The station list didn’t come back as expected.');
  const out: Station[] = [];
  for (const s of list as Record<string, unknown>[]) {
    if (!s || typeof s.id !== 'string' || typeof s.name !== 'string') continue;
    const lat = Number(s.lat);
    const lng = Number(s.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const tz = Number(s.timezonecorr);
    out.push({ id: s.id, name: s.name.trim(), state: typeof s.state === 'string' ? s.state : '', lat, lng, tz: Number.isFinite(tz) ? tz : null });
  }
  return out;
}

/** Great-circle distance in km. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * RAD;
  const dLng = (lng2 - lng1) * RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function nearestStations(stations: Station[], lat: number, lng: number, count = 5): (Station & { km: number })[] {
  return stations
    .map((s) => ({ ...s, km: distanceKm(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}

/** Further than this from the nearest station and NOAA's predictions don't describe your shore. */
export const NEAR_ENOUGH_KM = 100;

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ');

/** Stations matching every word of a search, by name, state or id. Names that start with it come first. */
export function searchStations(stations: Station[], query: string, limit = 30): Station[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const phrase = words.join(' ');
  return stations
    .map((s) => ({ s, text: fold(`${s.name} ${s.state} ${s.id}`), name: fold(s.name).trim() }))
    .filter((x) => words.every((w) => x.text.includes(w)))
    .sort((a, b) => Number(!a.name.startsWith(phrase)) - Number(!b.name.startsWith(phrase)) || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((x) => x.s);
}

export const stationLabel = (s: Pick<Station, 'name' | 'state'>) => (s.state ? `${s.name}, ${s.state}` : s.name);

/** Hours and minutes, "2 h 10 min". */
export function inWords(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

