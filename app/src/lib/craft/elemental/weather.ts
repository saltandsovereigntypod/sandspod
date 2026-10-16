// Weather for working: the next three days from Open-Meteo (free, no key),
// read for the elemental work each kind of weather has long been used for.
// Rain for water, wind for air, storm for its charge (watched from indoors),
// a clear night for the moon and stars, frost for earth and rest.
// Pure (no fetch, no storage), so it can be tested.

import type { Element } from './balance.ts';

export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const DAILY = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'sunset',
] as const;

/** Rounded to two decimals (about a kilometre), as the app keeps it. */
export function forecastUrl(latitude: number, longitude: number, days = 4): string {
  const params = [
    `latitude=${latitude.toFixed(2)}`,
    `longitude=${longitude.toFixed(2)}`,
    `daily=${DAILY.join(',')}`,
    'hourly=cloud_cover',
    'timezone=auto',
    `forecast_days=${days}`,
    'wind_speed_unit=kmh',
  ];
  return `${FORECAST_URL}?${params.join('&')}`;
}

export type DayWeather = {
  /** Local date at the place, YYYY-MM-DD. */
  date: string;
  code: number;
  tempMax: number | null;
  tempMin: number | null;
  rainMm: number;
  rainChance: number | null;
  windMax: number;
  gustMax: number;
  /** Average cloud from 9pm to 3am that night, 0–100, if known. */
  nightCloud: number | null;
};

type Raw = {
  daily?: Record<string, unknown[] | undefined>;
  hourly?: { time?: unknown[]; cloud_cover?: unknown[] };
};

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Open-Meteo's response as days; throws if it isn't one. */
export function parseForecast(json: unknown): DayWeather[] {
  const raw = json as Raw;
  const daily = raw?.daily;
  const times = daily?.time;
  if (!Array.isArray(times) || !times.length) throw new Error('No forecast in the reply');
  const at = (key: string, i: number) => num(daily?.[key]?.[i]);

  // Hourly cloud, keyed "YYYY-MM-DDTHH".
  const cloud = new Map<string, number>();
  const hours = raw.hourly?.time ?? [];
  const covers = raw.hourly?.cloud_cover ?? [];
  hours.forEach((t, i) => {
    const c = num(covers[i]);
    if (typeof t === 'string' && c !== null) cloud.set(t.slice(0, 13), c);
  });

  return times.map((t, i) => {
    const date = String(t).slice(0, 10);
    const next = typeof times[i + 1] === 'string' ? String(times[i + 1]).slice(0, 10) : null;
    const night = [21, 22, 23].map((h) => cloud.get(`${date}T${h}`));
    if (next) night.push(...[0, 1, 2, 3].map((h) => cloud.get(`${next}T0${h}`)));
    const known = night.filter((c): c is number => c !== undefined);
    return {
      date,
      code: at('weather_code', i) ?? 0,
      tempMax: at('temperature_2m_max', i),
      tempMin: at('temperature_2m_min', i),
      rainMm: at('precipitation_sum', i) ?? 0,
      rainChance: at('precipitation_probability_max', i),
      windMax: at('wind_speed_10m_max', i) ?? 0,
      gustMax: at('wind_gusts_10m_max', i) ?? 0,
      nightCloud: known.length >= 3 ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : null,
    };
  });
}

/** WMO weather codes as Open-Meteo uses them, in plain words. */
export function describeCode(code: number): string {
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code === 56 || code === 57) return 'Freezing drizzle';
  if (code >= 61 && code <= 65) return code === 65 ? 'Heavy rain' : 'Rain';
  if (code === 66 || code === 67) return 'Freezing rain';
  if (code >= 71 && code <= 75) return 'Snow';
  if (code === 77) return 'Snow grains';
  if (code >= 80 && code <= 82) return code === 82 ? 'Violent showers' : 'Showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if (code === 96 || code === 99) return 'Thunderstorm with hail';
  return 'Mixed weather';
}

export type WorkingSign = 'storm' | 'gale' | 'wind' | 'rain' | 'snow' | 'frost' | 'fog' | 'clear-night';

export type WeatherWorking = {
  sign: WorkingSign;
  element: Element;
  title: string;
  detail: string;
  /** Safety to show with it. */
  care?: string;
  /** A premade working that fits, when there is one. */
  premadeId?: string;
};

const isStorm = (code: number) => code === 95 || code === 96 || code === 99;
const isRain = (code: number) => (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
const isSnow = (code: number) => (code >= 71 && code <= 77) || code === 85 || code === 86;

// Thresholds in km/h. 50 km/h gusts move whole branches (Beaufort 6–7);
// 75 km/h and up is a gale, when going out to work is unwise.
export const WINDY_GUSTS = 50;
export const WINDY_MEAN = 30;
export const GALE_GUSTS = 75;

/** What a day's weather is good for, strongest sign first. */
export function workingsFor(day: DayWeather): WeatherWorking[] {
  const out: WeatherWorking[] = [];
  if (isStorm(day.code)) {
    out.push({
      sign: 'storm',
      element: 'Fire',
      title: 'Storm energy, from indoors',
      detail: 'Thunder is the old sky-fire: raw power for breaking stuck things and charging a working. Watch and work from behind a window, and set out a jar for storm water only before it arrives.',
      care: 'Stay indoors during thunder and lightning. If you can hear thunder you are close enough to be struck. Keep away from windows in hail, and don’t go out to fetch anything until 30 minutes after the last thunder.',
      premadeId: 'green-storm-energy-working',
    });
  }
  if (day.gustMax >= GALE_GUSTS) {
    out.push({
      sign: 'gale',
      element: 'Air',
      title: 'A gale: air at its fiercest',
      detail: 'Work with the wind from indoors: name what you want carried off and let it go through an open crack of window, or tie knots in a cord to hold the wind for later.',
      care: 'Strong gusts break branches and throw debris. Don’t work under trees or near the sea’s edge, and keep candles away from draughts.',
      premadeId: 'sea-wind-knots',
    });
  } else if (day.gustMax >= WINDY_GUSTS || day.windMax >= WINDY_MEAN) {
    out.push({
      sign: 'wind',
      element: 'Air',
      title: 'Wind for air work',
      detail: 'Tie wind knots in a cord, send words or a feather out on the breeze, or let it blow through the house to clear it.',
      care: 'Wind and open flame don’t mix: keep fire work indoors and sheltered today.',
      premadeId: 'green-air-feather-wind-knot',
    });
  }
  if (isRain(day.code) || day.rainMm >= 2) {
    out.push({
      sign: 'rain',
      element: 'Water',
      title: 'Rain to collect',
      detail: 'Set out a clean bowl or jar, away from roofs and gutters, to catch rain water for cleansing, blessing and the garden. Gentle rain suits healing and washing away; heavy rain suits clearing.',
      care: 'Rain water is for washing, offerings and plants, not for drinking.',
      premadeId: 'green-water-rainwater-wash',
    });
  }
  if (isSnow(day.code)) {
    out.push({
      sign: 'snow',
      element: 'Water',
      title: 'Snow: water at rest',
      detail: 'Melt a bowl of fresh snow for quiet, slow water work, or write in the snow what you want to melt away.',
      care: 'Dress warmly and mind ice underfoot.',
    });
  }
  if (day.tempMin !== null && day.tempMin <= 0) {
    out.push({
      sign: 'frost',
      element: 'Earth',
      title: 'Frost: the earth resting',
      detail: 'A night for stillness, grounding and the long view. Tend what is dormant, plan, and let the work settle like seed under cold ground.',
      care: 'Bring in tender plants and water bowls left outside. Mind black ice.',
      premadeId: 'green-earth-stone-soil-grounding',
    });
  } else if (day.code === 45 || day.code === 48) {
    out.push({
      sign: 'fog',
      element: 'Water',
      title: 'Fog: the in-between',
      detail: 'Mist has always marked a thin place. A fine night for quiet divination and listening, close to home.',
      care: 'Visibility is poor: stay off roads and cliff paths for outdoor work.',
    });
  }
  if (day.nightCloud !== null && day.nightCloud <= 30 && !isStorm(day.code)) {
    out.push({
      sign: 'clear-night',
      element: 'Water',
      title: 'A clear night for moon and stars',
      detail: 'Clear skies after dark: moon water, star gazing, charging stones in moonlight, or simply sitting under the sky.',
      premadeId: 'cosmic-full-moon-charging-moon-water',
    });
  }
  return out;
}

/** One headline for the day: its strongest working, or a quiet word. */
export function headline(day: DayWeather): string {
  const first = workingsFor(day)[0];
  return first ? first.title : `${describeCode(day.code)}: an ordinary day, good for any work`;
}

export type CachedForecast = { fetchedAt: string; latitude: number; longitude: number; days: DayWeather[] };

/** A cache is good for the same place (to the kilometre) and three hours. */
export function cacheFresh(cache: CachedForecast | null, latitude: number, longitude: number, now: Date, maxAgeMs = 3 * 3_600_000): boolean {
  if (!cache) return false;
  if (Math.abs(cache.latitude - latitude) > 0.011 || Math.abs(cache.longitude - longitude) > 0.011) return false;
  const age = now.getTime() - new Date(cache.fetchedAt).getTime();
  return age >= 0 && age < maxAgeMs;
}

/** The days still ahead from a cached forecast (today onward), up to `count`. */
export function daysAhead(days: DayWeather[], todayKey: string, count = 3): DayWeather[] {
  return days.filter((d) => d.date >= todayKey).slice(0, count);
}
