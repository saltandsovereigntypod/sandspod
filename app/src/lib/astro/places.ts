// Finding a birthplace without any outside service: a bundled list of the
// world's towns and cities of more than 15,000 people (GeoNames
// "cities15000", CC BY 4.0, geonames.org), each with its region, country,
// latitude, longitude and IANA time zone. The app loads the file only when
// the place search is first used (lib/astro/placesData.ts); the website
// fetches /js/core/cities.json. Pure: the data is handed in.

export type CityData = {
  v: 1;
  source: string;
  license: string;
  countries: Record<string, string>;
  admins: string[];
  zones: string[];
  /** One city per line: name|ascii|CC|admin|lat|lon|zone|pop (admin, zone and pop in base 36; pop in thousands). */
  rows: string;
};

export type Place = {
  name: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  zone: string;
  /** Population in thousands, for ordering. */
  population: number;
};

export const PLACES_CREDIT = 'Places: GeoNames (geonames.org), licensed CC BY 4.0.';

type Row = { key: string; alt: string; place: Place };
let index: Row[] | null = null;
let indexedFrom: CityData | null = null;

/** Lower case, accents removed, so "Zürich", "zurich" and "ZURICH" match. */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function build(data: CityData): Row[] {
  const rows: Row[] = [];
  for (const line of data.rows.split('\n')) {
    const [name, ascii, cc, admin, lat, lon, zone, pop] = line.split('|');
    if (!name) continue;
    const place: Place = {
      name,
      region: data.admins[parseInt(admin, 36)] ?? '',
      country: data.countries[cc] ?? cc,
      countryCode: cc,
      latitude: Number(lat),
      longitude: Number(lon),
      zone: data.zones[parseInt(zone, 36)] ?? 'UTC',
      population: parseInt(pop, 36) || 0,
    };
    rows.push({ key: fold(name), alt: ascii ? fold(ascii) : '', place });
  }
  return rows;
}

export function cityCount(data: CityData): number {
  return data.rows.split('\n').length;
}

/**
 * Places matching what was typed, biggest first among equally good
 * matches. "Paris", "paris france", "springfield, il" and "São Paulo" all
 * work: the first word or words match the town, any after a comma (or
 * left over) narrow by region or country.
 */
export function searchPlaces(data: CityData, query: string, limit = 8): Place[] {
  if (indexedFrom !== data) {
    index = build(data);
    indexedFrom = data;
  }
  const [townPart, ...rest] = query.split(',');
  const town = fold(townPart);
  if (!town) return [];
  const narrow = fold(rest.join(' '));
  const scored: { score: number; place: Place }[] = [];
  for (const row of index!) {
    let score = -1;
    for (const key of [row.key, row.alt]) {
      if (!key) continue;
      if (key === town) score = Math.max(score, 3);
      else if (key.startsWith(town)) score = Math.max(score, 2);
      else if (key.includes(` ${town}`)) score = Math.max(score, 1);
    }
    let extra = narrow;
    if (score < 0 && !narrow) {
      // "paris france": try the words before the last as the town.
      const words = town.split(' ');
      for (let cut = words.length - 1; cut > 0 && score < 0; cut--) {
        const t = words.slice(0, cut).join(' ');
        if (row.key === t || row.alt === t) {
          score = 3;
          extra = words.slice(cut).join(' ');
        } else if (row.key.startsWith(t) || row.alt.startsWith(t)) {
          score = 2;
          extra = words.slice(cut).join(' ');
        }
      }
    }
    if (score < 0) continue;
    if (extra) {
      const where = fold(`${row.place.region} ${row.place.country} ${row.place.countryCode}`);
      if (!extra.split(' ').every((w) => where.split(' ').some((x) => x.startsWith(w)))) continue;
    }
    scored.push({ score: score * 1e7 + row.place.population, place: row.place });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.place);
}

export const placeLabel = (p: Pick<Place, 'name' | 'region' | 'country'>) => [p.name, p.region && p.region !== p.name ? p.region : null, p.country].filter(Boolean).join(', ');
