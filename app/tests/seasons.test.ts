import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { hemisphereOf } from '../src/lib/calendars/index.ts';
import { seasonAt } from '../src/lib/craft/kitchen/simmer.ts';
import { festivalSeasonLine, hemisphereFrom, seasonCounting, seasonEnds, seasonLine, seasonOfYear, SEASON_COUNT_KEY, SEASON_COUNTINGS, yearSeasonLine } from '../src/lib/seasons.ts';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

test('three ways of counting the seasons, astronomical unless chosen', () => {
  assert.equal(SEASON_COUNT_KEY, 'season_count_by');
  assert.deepEqual(SEASON_COUNTINGS.map((c) => c.value), ['astronomical', 'meteorological', 'celtic']);
  assert.equal(seasonCounting({}), 'astronomical');
  assert.equal(seasonCounting({ season_count_by: 'celtic' }), 'celtic');
  assert.equal(seasonCounting({ season_count_by: 'nonsense' }), 'astronomical');
  // 31 October: astronomically and by months autumn; by the cross-quarters still autumn until Samhain.
  assert.equal(seasonOfYear(day(2026, 10, 31), 'north', 'astronomical'), 'autumn');
  assert.equal(seasonOfYear(day(2026, 10, 31), 'north', 'meteorological'), 'autumn');
  assert.equal(seasonOfYear(day(2026, 10, 31), 'north', 'celtic'), 'autumn');
  assert.equal(seasonOfYear(day(2026, 11, 2), 'north', 'celtic'), 'winter');
  assert.equal(seasonOfYear(day(2026, 11, 2), 'north', 'astronomical'), 'autumn');
  // 1 March: spring by months, winter astronomically, spring by the cross-quarters (since Imbolc).
  assert.equal(seasonOfYear(day(2027, 3, 1), 'north', 'meteorological'), 'spring');
  assert.equal(seasonOfYear(day(2027, 3, 1), 'north', 'astronomical'), 'winter');
  assert.equal(seasonOfYear(day(2027, 3, 1), 'north', 'celtic'), 'spring');
  assert.equal(seasonOfYear(day(2027, 3, 25), 'north', 'astronomical'), 'spring');
  // Turned round in the south.
  assert.equal(seasonOfYear(day(2026, 10, 31), 'south', 'astronomical'), 'spring');
  assert.equal(seasonOfYear(day(2026, 7, 1), 'south', 'meteorological'), 'winter');
});

test('when the season ends, and the line that says so', () => {
  const ends = seasonEnds(day(2026, 10, 31), 'north', 'astronomical');
  assert.equal(ends.getMonth(), 11);
  assert.ok(ends.getDate() >= 20 && ends.getDate() <= 22, `${ends.getDate()} December`);
  assert.equal(seasonEnds(day(2026, 10, 31), 'north', 'meteorological').getTime(), new Date(2026, 11, 1).getTime());
  assert.equal(seasonEnds(day(2026, 10, 31), 'north', 'celtic').getTime(), new Date(2026, 10, 1).getTime());
  assert.equal(seasonLine(day(2026, 10, 31), 'north', 'meteorological'), 'Autumn until 1 December, by whole months.');
  assert.equal(seasonLine(day(2026, 10, 31), 'south', 'celtic'), 'Spring until 1 November, by the Celtic cross-quarters.');
  assert.match(seasonLine(day(2026, 10, 31), 'north'), /^Autumn until 2\d December, by the solstices and equinoxes\.$/);
  assert.doesNotMatch(SEASON_COUNTINGS.map((c) => c.about + c.label).join(' '), /!/);
});

test('one hemisphere rule everywhere: your choice, your place, then a southern Wheel', () => {
  assert.equal(hemisphereFrom({ calendar_hemisphere: 'south' }, 51), 'south');
  assert.equal(hemisphereFrom({}, -33.9), 'south');
  assert.equal(hemisphereFrom({ calendar_traditions: 'wheel_south' }, null), 'south');
  assert.equal(hemisphereFrom({}, null), 'north');
  assert.equal(hemisphereOf({}, { latitude: -33.9, longitude: 151.2 }), 'south');
  assert.equal(yearSeasonLine(day(2026, 10, 31), { season_count_by: 'meteorological' }, -33.9), 'Spring until 1 December, by whole months.');
});

test('the Wheel’s festivals in their seasons, by each counting', () => {
  assert.equal(festivalSeasonLine('wheel/ostara', 'Ostara', 'astronomical'), 'By the solstices and equinoxes, Ostara begins spring.');
  assert.equal(festivalSeasonLine('wheel-imbolc', 'Imbolc', 'astronomical'), 'By the solstices and equinoxes, Imbolc falls halfway through winter, as it turns towards spring.');
  assert.equal(festivalSeasonLine('wheel_south/samhain', 'Samhain', 'celtic'), 'By the Celtic cross-quarters, Samhain begins winter.');
  assert.equal(festivalSeasonLine('wheel/yule', 'Yule', 'celtic'), 'By the Celtic cross-quarters, Yule is midwinter.');
  assert.equal(festivalSeasonLine('wheel/mabon', 'Mabon', 'celtic'), 'By the Celtic cross-quarters, Mabon is mid-autumn.');
  assert.equal(festivalSeasonLine('celtic/bealtaine', 'Bealtaine', 'meteorological'), 'By whole months, Bealtaine falls in the last month of spring, before summer begins.');
  assert.equal(festivalSeasonLine('wheel/litha', 'Litha', 'meteorological'), 'By whole months, Litha falls about three weeks into summer.');
  assert.equal(festivalSeasonLine('norse/jol', 'Jól', 'celtic'), null);
  assert.equal(festivalSeasonLine('moon-full', 'Full moon', 'celtic'), null);
});

test('the simmer pots and every page count the seasons as chosen', () => {
  assert.equal(seasonAt(day(2027, 3, 1), 51).season, 'spring', 'whole months unless told otherwise');
  assert.equal(seasonAt(day(2027, 3, 1), 51, 'astronomical').season, 'winter');
  assert.equal(seasonAt(day(2027, 3, 1), -33, 'celtic').season, 'autumn');
  const read = (p: string) => readFileSync(p, 'utf8');
  assert.match(read('src/app/(tabs)/today/index.tsx'), /seasonLine\(clock, hemisphereOf\(settings, place\), seasonCounting\(settings\)\)/);
  assert.match(read('src/components/holy/HolyDayScreen.tsx'), /festivalSeasonLine\(holyRef, name, seasonCounting\(settings\)\)/);
  assert.match(read('src/app/(tabs)/rituals/cycle/index.tsx'), /seasonLine\(now, hemisphereOf\(settings, place\), seasonCounting\(settings\)\)/);
  assert.match(read('src/app/(tabs)/more/settings/location.tsx'), /set\(SEASON_COUNT_KEY, v\)/);
  // The website, the same.
  assert.match(read('../js/settings-more.js'), /chipGroup === "seasonCount"\) return save\(\{ \[G\.seasons\.SEASON_COUNT_KEY\]: value \}/);
  assert.match(read('../today/today.js'), /C\.seasons\.seasonLine\(now, C\.calendars\.hemisphereOf\(settings, state\.place\), C\.seasons\.seasonCounting\(settings\)\)/);
  assert.match(read('../today/holy/holy.js'), /data-festival-season/);
  assert.match(read('../rituals/cycle/cycle.js'), /data-year-season/);
  assert.match(read('../practice/kitchen/kitchen.js'), /S\.seasonAt\(new Date\(\), place\?\.latitude, pot\.counting\)/);
  for (const page of ['../today/holy/index.html', '../rituals/cycle/index.html']) assert.match(read(page), /\/js\/year-season\.js/, page);
});
