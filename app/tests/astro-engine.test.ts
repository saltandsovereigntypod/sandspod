// The birth-chart engine against published and independent positions.
//
// Sources:
// * fixtures/astro-swiss-ephemeris.json: the Swiss Ephemeris 2.10.03
//   (pyswisseph, Moshier ephemeris, about 1″ for the planets), swe_calc_ut
//   for the Sun to Pluto, the mean and true nodes and the mean lunar apogee
//   (Lilith); swe_houses for Placidus cusps; swe_get_ayanamsa_ut (Lahiri).
// * Meeus, "Astronomical Algorithms" (2nd ed.): example 25.a (the Sun,
//   1992 Oct 13.0 TD) and 47.a (the Moon, 1992 Apr 12.0 TD).
// * JPL Horizons, 2060 Chiron, observer quantity 31 (apparent ecliptic
//   longitude of date), geocentric, 1850–2050.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { aspectBetween, aspectsAmong, DEFAULT_ORBS, findPatterns, parseOrbs } from '../src/lib/astro/aspects.ts';
import { offsetForBirth } from '../src/lib/astro/birth.ts';
import { deitiesForChart, natalAltarPlanet, personalAllies, todayLine } from '../src/lib/astro/craftLinks.ts';
import { bodyLongitude, chironLongitude, diff, lahiriAyanamsa } from '../src/lib/astro/ephemeris.ts';
import { progressionsFor, retrogradePeriods, returnChart, synastry, transitsTo } from '../src/lib/astro/forecast.ts';
import { houseOf, housesFor } from '../src/lib/astro/houses.ts';
import { castChart, DEFAULT_CHART_OPTIONS, positionOf } from '../src/lib/astro/natal.ts';
import { cityCount, searchPlaces, type CityData } from '../src/lib/astro/places.ts';
import { dignityOf, decanOf } from '../src/lib/astro/signs.ts';
import { deltaT, localToUtc, zoneOffsetAt, zonesWork } from '../src/lib/astro/time.ts';
import {
  decryptAstro,
  deviceAstroVault,
  emptyAstroData,
  mergeAstroData,
  newAstroKey,
  protectAstroVault,
  unlockAstro,
  unlockAstroRecovery,
} from '../src/lib/astro/vault.ts';
import { decryptData } from '../src/lib/cycle/vault.ts';
import { sunLongitude, moonLongitude } from '../src/lib/moon.ts';

const ref = JSON.parse(readFileSync(new URL('./fixtures/astro-swiss-ephemeris.json', import.meta.url), 'utf8'));
const arcmin = (a: number, b: number) => Math.abs(diff(a, b)) * 60;

// Largest error allowed per body, in arcminutes (well under a degree for planets; a few minutes for the Sun and Moon).
const LIMIT: Record<string, number> = {
  Sun: 1, Moon: 2, Mercury: 3, Venus: 3, Mars: 3, Jupiter: 12, Saturn: 15, Uranus: 4, Neptune: 3, Pluto: 3, MeanNode: 1, TrueNode: 15, Lilith: 10,
};

test('planets, nodes and Lilith match the Swiss Ephemeris, 1850–2045', () => {
  const worst: Record<string, number> = {};
  for (const row of ref.positions) {
    const at = new Date(row.at);
    for (const body of Object.keys(LIMIT)) {
      const ours =
        body === 'MeanNode' ? bodyLongitude('North Node', at, 'mean')! : body === 'TrueNode' ? bodyLongitude('North Node', at, 'true')! : bodyLongitude(body as 'Sun', at)!;
      const err = arcmin(ours, row[body]);
      worst[body] = Math.max(worst[body] ?? 0, err);
      assert.ok(err < LIMIT[body], `${body} ${row.at}: ${err.toFixed(2)}′ off (${ours.toFixed(4)} vs ${row[body]})`);
    }
  }
  // The Sun and Moon to well under a few arcminutes.
  assert.ok(worst.Sun < 0.5 && worst.Moon < 1, JSON.stringify(worst));
});

test('the Sun and Moon match Meeus’s worked examples', () => {
  // Example 25.a: 1992 Oct 13.0 TD, apparent λ = 199.90895 (low precision); TD − UT ≈ 59 s.
  const sun = sunLongitude(new Date(Date.UTC(1992, 9, 13, 0, 0, 0)));
  assert.ok(arcmin(sun, 199.90895) < 0.5, `Sun ${sun}`);
  // Example 47.a: 1992 Apr 12.0 TD, apparent λ = 133.167265.
  const moon = moonLongitude(new Date(Date.UTC(1992, 3, 12, 0, 0, 0)));
  assert.ok(arcmin(moon, 133.167265) < 1.5, `Moon ${moon}`);
});

test('Chiron matches JPL Horizons to about a minute of arc', () => {
  // Horizons quantity 31, geocentric apparent ecliptic longitude of date (0h UT).
  const horizons: [string, number][] = [
    ['1850-01-01', 245.7798975], ['1898-08-27', 234.0489974], ['1937-07-30', 88.1008969], ['1976-07-01', 31.3815555],
    ['1995-12-17', 192.5753401], ['2010-07-22', 329.9354272], ['2025-02-24', 20.3759448], ['2049-06-23', 231.9166881],
  ];
  for (const [day, lon] of horizons) {
    const ours = chironLongitude(new Date(`${day}T00:00:00Z`))!;
    assert.ok(arcmin(ours, lon) < 1.5, `Chiron ${day}: ${arcmin(ours, lon).toFixed(2)}′`);
  }
  assert.equal(chironLongitude(new Date('1700-01-01T00:00:00Z')), null);
});

test('Lahiri ayanamsa matches the Swiss Ephemeris to a second of arc', () => {
  for (const row of ref.ayanamsa) assert.ok(Math.abs(lahiriAyanamsa(new Date(row.at)) - row.lahiri) * 3600 < 1.5, row.at);
});

test('Placidus cusps, Ascendant and Midheaven match swe_houses', () => {
  for (const h of ref.houses) {
    const ours = housesFor('placidus', new Date(h.at), h.lat, h.lon);
    assert.equal(ours.system, 'placidus');
    assert.ok(arcmin(ours.ascendant, h.asc) < 0.2, `ASC ${h.at}`);
    assert.ok(arcmin(ours.midheaven, h.mc) < 0.2, `MC ${h.at}`);
    ours.cusps.forEach((c, i) => assert.ok(arcmin(c, h.placidus[i]) < 0.2, `cusp ${i + 1} ${h.at}: ${c} vs ${h.placidus[i]}`));
  }
});

test('Placidus falls back to Porphyry inside the polar circle; Whole Sign and Equal work anywhere', () => {
  const at = new Date('1985-12-24T02:00:00Z');
  const polar = housesFor('placidus', at, 69.65, 18.96);
  assert.equal(polar.system, 'porphyry');
  assert.equal(polar.asked, 'placidus');
  const whole = housesFor('whole-sign', at, 69.65, 18.96);
  assert.equal(whole.cusps[0] % 30, 0);
  assert.equal(Math.floor(whole.cusps[0] / 30), Math.floor(whole.ascendant / 30));
  const equal = housesFor('equal', at, 51.5, 0);
  assert.ok(Math.abs(diff(equal.cusps[3], equal.ascendant + 90)) < 1e-9);
  assert.equal(houseOf(equal.ascendant + 1, equal.cusps), 1);
  assert.equal(houseOf(equal.ascendant - 1, equal.cusps), 12);
});

test('ΔT is about a minute now and about 45 seconds in 1975', () => {
  assert.ok(Math.abs(deltaT(1975) - 45.5) < 2);
  assert.ok(Math.abs(deltaT(2020) - 70) < 3);
});

test('historical UTC offsets from IANA time zones: 1970s US, Europe, southern hemisphere, local mean time', () => {
  assert.ok(zonesWork(), 'this engine has the IANA database');
  // New York, summer 1975 (EDT) and winter 1975 (EST).
  assert.equal(zoneOffsetAt('America/New_York', new Date('1975-07-01T12:00:00Z')), -240);
  assert.equal(zoneOffsetAt('America/New_York', new Date('1975-01-15T12:00:00Z')), -300);
  // 1974: the US year-round daylight time (energy crisis), from 6 January.
  assert.equal(zoneOffsetAt('America/New_York', new Date('1974-02-15T12:00:00Z')), -240);
  // Britain kept UTC+1 all year from 1968 to 1971 (British Standard Time).
  assert.equal(zoneOffsetAt('Europe/London', new Date('1970-01-15T12:00:00Z')), 60);
  assert.equal(zoneOffsetAt('Europe/London', new Date('1975-01-15T12:00:00Z')), 0);
  // Sydney's summer is in January.
  assert.equal(zoneOffsetAt('Australia/Sydney', new Date('1980-01-15T12:00:00Z')), 660);
  assert.equal(zoneOffsetAt('Australia/Sydney', new Date('1980-07-15T12:00:00Z')), 600);
  // Before standard time: New York kept local mean time, 4h56m02s behind Greenwich.
  assert.ok(Math.abs(zoneOffsetAt('America/New_York', new Date('1850-01-01T12:00:00Z'))! - -(4 * 60 + 56 + 2 / 60)) < 0.02);
  // India: one offset with a half hour.
  assert.equal(zoneOffsetAt('Asia/Kolkata', new Date('1990-01-01T12:00:00Z')), 330);
});

test('local birth times to UTC, through summer-time gaps and overlaps', () => {
  const plain = offsetForBirth('1975-07-04', '09:30', 'America/New_York')!;
  assert.equal(plain.utc.toISOString(), '1975-07-04T13:30:00.000Z');
  assert.equal(plain.note, null);
  const gap = localToUtc(Date.UTC(2021, 2, 14, 2, 30), 'America/New_York')!;
  assert.equal(gap.note, 'gap');
  const overlap = localToUtc(Date.UTC(2021, 10, 7, 1, 30), 'America/New_York')!;
  assert.equal(overlap.note, 'overlap');
  assert.equal(overlap.offsetMinutes, -240);
  assert.equal(overlap.otherOffset, -300);
  const unknownTime = offsetForBirth('1990-06-15', null, 'Europe/Berlin')!;
  assert.equal(unknownTime.offsetMinutes, 120);
});

const LONDON_1990 = { date: '1990-06-15', time: '14:30', utcOffsetMinutes: 60, latitude: 51.5074, longitude: -0.1278 };

test('a full chart: positions, houses, sect, Part of Fortune, ruler, balance', () => {
  const chart = castChart(LONDON_1990)!;
  assert.ok(chart.timeKnown && chart.placeKnown && chart.houses);
  assert.equal(positionOf(chart, 'Sun')!.sign, 'Gemini');
  assert.equal(positionOf(chart, 'Moon')!.sign, 'Pisces');
  assert.equal(positionOf(chart, 'Ascendant')!.sign, 'Libra');
  assert.equal(chart.sect, 'day');
  assert.equal(chart.ruler!.traditional, 'Venus');
  const sun = positionOf(chart, 'Sun')!.longitude;
  const moon = positionOf(chart, 'Moon')!.longitude;
  const asc = positionOf(chart, 'Ascendant')!.longitude;
  assert.ok(Math.abs(diff(positionOf(chart, 'Part of Fortune')!.longitude, asc + moon - sun)) < 1e-9);
  assert.equal(positionOf(chart, 'Saturn')!.retrograde, true);
  assert.equal(positionOf(chart, 'Venus')!.dignity, 'domicile');
  assert.ok(Math.abs(diff(positionOf(chart, 'South Node')!.longitude, positionOf(chart, 'North Node')!.longitude + 180)) < 1e-9);
  const total = Object.values(chart.balance.elements).reduce((a, e) => a + e.score, 0);
  assert.equal(total, 10 + 2 + 2 + 1); // Sun to Pluto, the lights and Ascendant twice, the Midheaven once
  assert.ok(chart.balance.hemispheres);
});

test('without a birth time: noon planets, no houses or Ascendant, a note, and the other possible sign', () => {
  const chart = castChart({ date: '1988-03-20', time: '', utcOffsetMinutes: -300, latitude: 40.7, longitude: -74 })!;
  assert.equal(chart.timeKnown, false);
  assert.equal(chart.houses, null);
  assert.equal(positionOf(chart, 'Ascendant'), null);
  assert.equal(positionOf(chart, 'Part of Fortune'), null);
  assert.ok(chart.notes.includes('no-time'));
  // The equinox fell that morning (09:39 UT): by noon the Sun was in Aries, but early that day it was in Pisces.
  assert.equal(positionOf(chart, 'Sun')!.sign, 'Aries');
  assert.equal(positionOf(chart, 'Sun')!.orSign, 'Pisces');
  const solar = castChart({ date: '1988-03-20', time: '', utcOffsetMinutes: -300 }, { ...DEFAULT_CHART_OPTIONS, solarChart: true })!;
  assert.ok(solar.solarCusps);
  assert.ok(Math.abs(diff(solar.solarCusps![0], positionOf(solar, 'Sun')!.longitude)) < 1e-9);
  assert.equal(positionOf(solar, 'Sun')!.house, 1);
});

test('the sidereal zodiac shifts every position back by the ayanamsa', () => {
  const t = castChart(LONDON_1990)!;
  const s = castChart(LONDON_1990, { ...DEFAULT_CHART_OPTIONS, zodiac: 'sidereal' })!;
  assert.ok(s.ayanamsa > 23.6 && s.ayanamsa < 23.8);
  for (const point of ['Sun', 'Moon', 'Mars', 'Ascendant'] as const) {
    assert.ok(Math.abs(diff(positionOf(t, point)!.longitude - s.ayanamsa, positionOf(s, point)!.longitude)) < 1e-6, point);
  }
  assert.equal(positionOf(s, 'Moon')!.sign, 'Aquarius'); // tropical 16° Pisces → sidereal 22° Aquarius
  assert.ok(s.notes.includes('sidereal'));
});

test('aspects with orbs, applying and separating, and orb settings', () => {
  assert.equal(aspectBetween({ point: 'Mars', longitude: 10 }, { point: 'Saturn', longitude: 100 }, DEFAULT_ORBS)!.aspect, 'square');
  assert.equal(aspectBetween({ point: 'Mars', longitude: 10 }, { point: 'Saturn', longitude: 108 }, DEFAULT_ORBS), null);
  // The Sun gets 2° more.
  assert.equal(aspectBetween({ point: 'Sun', longitude: 10 }, { point: 'Saturn', longitude: 108.5 }, DEFAULT_ORBS)!.aspect, 'square');
  // Minors only when asked.
  const quinc = { point: 'Venus' as const, longitude: 0 };
  assert.equal(aspectBetween(quinc, { point: 'Mars', longitude: 150.5 }, DEFAULT_ORBS)!.aspect, 'quincunx');
  assert.equal(aspectBetween(quinc, { point: 'Mars', longitude: 150.5 }, parseOrbs('{"minors":false}')), null);
  // Faster Moon closing on Venus: applying.
  const hit = aspectBetween({ point: 'Moon', longitude: 55, speed: 13 }, { point: 'Venus', longitude: 0, speed: 1 }, DEFAULT_ORBS)!;
  assert.equal(hit.aspect, 'sextile');
  assert.equal(hit.applying, true);
  assert.deepEqual(parseOrbs('not json'), { orbs: {}, luminaryBonus: 2, minors: true });
});

test('aspect patterns: grand trine, T-square, grand cross, yod, kite, stellium', () => {
  const pts = (list: [string, number][]) => list.map(([point, longitude]) => ({ point: point as 'Sun', longitude }));
  const find = (list: [string, number][], placed: { point: string; sign: string; house: number | null }[] = []) => {
    const points = pts(list);
    return findPatterns(points.map((p) => p.point), aspectsAmong(points, DEFAULT_ORBS), placed as never);
  };
  const names = (ps: { name: string }[]) => ps.map((p) => p.name).sort();
  assert.deepEqual(names(find([['Sun', 0], ['Moon', 120], ['Mars', 240]])), ['grand-trine']);
  assert.deepEqual(names(find([['Sun', 0], ['Moon', 120], ['Mars', 240], ['Venus', 180]])), ['grand-trine', 'kite']);
  const t = find([['Sun', 0], ['Moon', 180], ['Mars', 90]]);
  assert.deepEqual(names(t), ['t-square']);
  assert.equal(t[0].apex, 'Mars');
  assert.deepEqual(names(find([['Sun', 0], ['Moon', 180], ['Mars', 90], ['Saturn', 270]])), ['grand-cross']);
  const yod = find([['Sun', 0], ['Moon', 60], ['Pluto', 210]]);
  assert.deepEqual(names(yod), ['yod']);
  assert.equal(yod[0].apex, 'Pluto');
  const st = find([['Sun', 1], ['Mercury', 12], ['Venus', 25]], [
    { point: 'Sun', sign: 'Aries', house: 1 },
    { point: 'Mercury', sign: 'Aries', house: 1 },
    { point: 'Venus', sign: 'Aries', house: 2 },
  ]);
  assert.ok(st.some((p) => p.name === 'stellium' && p.sign === 'Aries'));
});

test('dignities and decans', () => {
  assert.equal(dignityOf('Venus', 'Taurus'), 'domicile');
  assert.equal(dignityOf('Sun', 'Aries'), 'exaltation');
  assert.equal(dignityOf('Mars', 'Libra'), 'detriment');
  assert.equal(dignityOf('Saturn', 'Aries'), 'fall');
  assert.equal(dignityOf('Pluto', 'Scorpio'), 'domicile');
  assert.equal(dignityOf('Jupiter', 'Aries'), null);
  assert.deepEqual(decanOf(5), { decan: 1, ruler: 'Mars', triplicityRuler: 'Mars' });
  assert.equal(decanOf(15).ruler, 'Sun');
  assert.equal(decanOf(35).ruler, 'Mercury'); // 1st decan of Taurus
});

test('transits, solar and lunar returns, progressions', () => {
  const chart = castChart(LONDON_1990)!;
  const hits = transitsTo(chart, new Date('2026-10-30T12:00:00Z'));
  assert.ok(hits.length > 0 && hits.every((h) => h.orb <= 3));
  const sr = returnChart(chart, 'solar', new Date('2026-01-01T00:00:00Z'), null);
  assert.ok(arcmin(bodyLongitude('Sun', sr.when)!, positionOf(chart, 'Sun')!.longitude) < 0.05);
  assert.equal(sr.when.getUTCMonth(), 5);
  const lr = returnChart(chart, 'lunar', new Date('2026-10-30T00:00:00Z'), null);
  assert.ok(arcmin(bodyLongitude('Moon', lr.when)!, positionOf(chart, 'Moon')!.longitude) < 0.5);
  assert.ok(lr.when.getTime() - Date.parse('2026-10-30') < 28 * 86_400_000);
  const p = progressionsFor(chart, new Date('2026-10-30T00:00:00Z'));
  assert.ok(Math.abs(p.age - 36.37) < 0.02);
  // A day for a year: the progressed Sun about 35° on from natal.
  const arc = diff(p.positions[0].longitude, positionOf(chart, 'Sun')!.longitude);
  assert.ok(arc > 33 && arc < 37, String(arc));
  assert.ok(p.moon.nextSign && p.ascendant && p.midheaven);
  assert.ok(Math.abs(diff(p.midheaven!.longitude, positionOf(chart, 'Midheaven')!.longitude + arc)) < 0.01);
});

test('retrogrades with shadows (Mercury, autumn 2026)', () => {
  const [r] = retrogradePeriods('Mercury', new Date('2026-10-01'), new Date('2026-12-31'));
  assert.equal(r.start.toISOString().slice(0, 10), '2026-10-24');
  assert.equal(r.end.toISOString().slice(0, 10), '2026-11-13');
  assert.ok(r.shadowStart < r.start && r.shadowEnd > r.end);
  assert.ok(Math.abs(diff(bodyLongitude('Mercury', r.shadowStart)!, r.endLongitude)) < 0.05);
});

test('synastry: inter-aspects, house overlays and the tally', () => {
  const a = castChart(LONDON_1990)!;
  const b = castChart({ date: '1988-02-02', time: '07:15', utcOffsetMinutes: -300, latitude: 40.7, longitude: -74 })!;
  const s = synastry(a, b);
  assert.ok(s.aspects.length > 5);
  assert.equal(s.aInB.length, 10);
  assert.equal(s.bInA.length, 10);
  assert.equal(s.tally.soft + s.tally.hard + s.tally.blend, s.aspects.length);
});

test('craft links: allies, deities, natal altar, Today line', () => {
  const chart = castChart(LONDON_1990)!;
  const allies = personalAllies(chart);
  assert.equal(allies[0].planet, 'Venus');
  assert.match(allies[0].why, /chart ruler/);
  assert.ok(deitiesForChart(chart).some((d) => d.name === 'Aphrodite'));
  assert.equal(natalAltarPlanet(chart), 'Venus');
  const line = todayLine(chart, new Date('2026-10-30T12:00:00Z'));
  assert.ok(line && /your/.test(line.line));
});

test('the chart vault: device and passphrase, recovery, and merging', async () => {
  const key = newAstroKey();
  const data = { version: 1 as const, charts: [{ id: 'a', name: 'Me', relation: 'me' as const, input: LONDON_1990, updatedAt: '2026-01-01T00:00:00Z' }], removed: [] };
  const device = deviceAstroVault(key, data, new Date());
  assert.equal(device.kdf, null);
  assert.deepEqual(decryptAstro(key, device.data).charts[0].input.date, '1990-06-15');
  const { vault, recovery } = await protectAstroVault(key, data, 'a long quiet passphrase', new Date(), { cost: { N: 2 ** 10, r: 8, p: 1 } });
  assert.deepEqual(await unlockAstro(vault, 'a long quiet passphrase'), key);
  await assert.rejects(() => unlockAstro(vault, 'the wrong passphrase!'));
  assert.deepEqual(unlockAstroRecovery(vault, recovery), key);
  // Never opens as Cycle & Moon notes, nor the other way round.
  assert.throws(() => decryptData(key, vault.data));
  // A deletion wins over an older edit; a later edit wins over a deletion.
  const later = { ...data.charts[0], name: 'Me again', updatedAt: '2026-02-01T00:00:00Z' };
  const removed = { version: 1 as const, charts: [], removed: [{ id: 'a', at: '2026-01-15T00:00:00Z' }] };
  assert.equal(mergeAstroData(data, removed).charts.length, 0);
  assert.equal(mergeAstroData({ ...data, charts: [later] }, removed).charts[0].name, 'Me again');
  assert.equal(mergeAstroData(emptyAstroData(), emptyAstroData()).charts.length, 0);
});

test('birthplace search over the bundled GeoNames list', () => {
  const data = JSON.parse(readFileSync(new URL('../src/lib/astro/data/cities.json', import.meta.url), 'utf8')) as CityData;
  assert.ok(cityCount(data) > 30000);
  assert.match(data.license, /CC BY/);
  const london = searchPlaces(data, 'London')[0];
  assert.equal(london.countryCode, 'GB');
  assert.equal(london.zone, 'Europe/London');
  assert.equal(searchPlaces(data, 'zurich')[0].name, 'Zürich');
  assert.equal(searchPlaces(data, 'springfield, illinois')[0].region, 'Illinois');
  assert.equal(searchPlaces(data, 'paris france')[0].countryCode, 'FR');
  assert.equal(searchPlaces(data, 'sydney')[0].zone, 'Australia/Sydney');
  assert.deepEqual(searchPlaces(data, ' '), []);
});
