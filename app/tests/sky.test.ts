import assert from 'node:assert/strict';
import { test } from 'node:test';

import { eclipsesBetween, eclipseLabel } from '../src/lib/astro/eclipses.ts';
import { planetaryHours } from '../src/lib/astro/hours.ts';
import { nextIngress, planetSign, retrogradesBetween } from '../src/lib/astro/planets.ts';
import { sunTimes } from '../src/lib/astro/rise.ts';
import { voidOfCourse } from '../src/lib/astro/voidOfCourse.ts';
import { correspondencesFor, goodForToday, journalPrompt } from '../src/lib/dayInfo.ts';
import { moonLongitude } from '../src/lib/moon.ts';
import { fullMoonName, icelandicMonth, primaryTradition, romanDate, traditionDay } from '../src/lib/traditionDay.ts';
import { nextPhase } from '../src/lib/moon.ts';

const near = (date: Date, iso: string, hours: number) =>
  assert.ok(Math.abs(date.getTime() - Date.parse(iso)) < hours * 3_600_000, `${date.toISOString()} vs ${iso}`);

test('retrogrades match published dates (within a day)', () => {
  const mercury = retrogradesBetween('Mercury', new Date('2026-01-01'), new Date('2026-12-31'));
  assert.equal(mercury.length, 3);
  near(mercury[0].start, '2026-02-26T00:00Z', 24);
  near(mercury[0].end, '2026-03-20T00:00Z', 24);
  near(mercury[1].start, '2026-06-29T00:00Z', 24);
  near(mercury[1].end, '2026-07-23T00:00Z', 24);
  near(mercury[2].start, '2026-10-24T00:00Z', 24);
  near(mercury[2].end, '2026-11-13T00:00Z', 24);
  const venus = retrogradesBetween('Venus', new Date('2026-01-01'), new Date('2026-12-31'));
  near(venus[0].start, '2026-10-03T00:00Z', 24);
  near(venus[0].end, '2026-11-14T00:00Z', 24);
  const mars = retrogradesBetween('Mars', new Date('2027-01-01'), new Date('2027-12-31'));
  near(mars[0].start, '2027-01-10T00:00Z', 24);
  near(mars[0].end, '2027-04-01T00:00Z', 24);
});

test('outer planets change sign on the published days', () => {
  near(nextIngress('Saturn', new Date('2026-01-01'))!.date, '2026-02-13T12:00Z', 30);
  near(nextIngress('Neptune', new Date('2026-01-01'))!.date, '2026-01-26T12:00Z', 30);
  near(nextIngress('Uranus', new Date('2026-01-01'))!.date, '2026-04-26T00:00Z', 30);
  near(nextIngress('Jupiter', new Date('2026-01-01'))!.date, '2026-06-30T00:00Z', 30);
  assert.equal(planetSign('Pluto', new Date('2026-10-11')), 'Aquarius');
});

test('eclipses of 2026 and 2027', () => {
  const list = eclipsesBetween(new Date('2026-01-01'), new Date('2027-12-31')).map((e) => `${e.date.toISOString().slice(0, 10)} ${eclipseLabel(e)}`);
  assert.deepEqual(list.slice(0, 4), [
    '2026-02-17 Annular solar eclipse in Aquarius',
    '2026-03-03 Total lunar eclipse in Virgo',
    '2026-08-12 Total solar eclipse in Leo',
    '2026-08-28 Partial lunar eclipse in Pisces',
  ]);
  assert.ok(list.includes('2027-08-02 Total solar eclipse in Leo'));
});

test('the void-of-course Moon ends as it changes sign, after its last aspect', () => {
  const now = new Date('2026-10-11T06:00:00Z');
  const voc = voidOfCourse(now);
  assert.equal(voc.nextSign, 'Scorpio');
  assert.ok(voc.start.getTime() < voc.end.getTime());
  assert.ok(voc.end.getTime() - voc.start.getTime() < 2.6 * 86_400_000);
  assert.equal(Math.floor(moonLongitude(new Date(voc.end.getTime() + 120_000)) / 30), 7); // Scorpio
});

test('sunrise, sunset and planetary hours (New York, Oct 11 2026)', () => {
  const nyc = { latitude: 40.7128, longitude: -74.006 };
  const { rise, set } = sunTimes(new Date(2026, 9, 11, 12), nyc);
  near(rise!, '2026-10-11T11:03:00Z', 0.1); // 7:03 AM EDT
  near(set!, '2026-10-11T22:21:00Z', 0.1); // 6:21 PM EDT
  const hours = planetaryHours(new Date(Date.UTC(2026, 9, 11, 17)), nyc)!;
  assert.equal(hours.length, 24);
  assert.deepEqual(hours.slice(0, 3).map((h) => h.planet), ['Sun', 'Venus', 'Mercury']); // a Sunday
  assert.equal(hours[12].planet, 'Jupiter');
  assert.equal(hours[12].night, true);
  // Near the poles there may be no sunrise.
  assert.equal(planetaryHours(new Date(Date.UTC(2026, 11, 21, 12)), { latitude: 89, longitude: 0 }), null);
});

test('the day as each calendar names it', () => {
  const day = new Date(2026, 9, 11, 12);
  assert.equal(romanDate(new Date(2026, 2, 15)), 'the Ides of March');
  assert.equal(romanDate(new Date(2026, 2, 14)), 'the day before the Ides of March');
  assert.equal(romanDate(new Date(2026, 9, 1)), 'the Kalends of October');
  assert.equal(romanDate(new Date(2026, 9, 11)), '5 days before the Ides of October (a.d. V)');
  assert.equal(romanDate(new Date(2026, 1, 20)), '10 days before the Kalends of March (a.d. X)');
  assert.equal(icelandicMonth(new Date(2026, 9, 11)).name, 'Haustmánuður');
  assert.equal(icelandicMonth(new Date(2026, 9, 30)).name, 'Gormánuður');
  assert.equal(icelandicMonth(new Date(2027, 0, 25)).name, 'Þorri');
  assert.equal(icelandicMonth(new Date(2027, 3, 25)).half, 'summer');
  assert.match(traditionDay(day, 'norse')!.line, /^Sunna’s day/);
  assert.match(traditionDay(day, 'celtic')!.line, /^Dé Domhnaigh · 11 Deireadh Fómhair$/);
  assert.equal(traditionDay(day, 'wheel')!.line, 'Between Mabon and Samhain');
  assert.equal(traditionDay(day, 'wheel_south')!.line, 'Between Ostara and Beltane');
  const hellenic = traditionDay(day, 'hellenic')!;
  assert.match(hellenic.line, /^(1 Pyanepsion|30 Boedromion) · Helios’s day$/);
  assert.equal(primaryTradition({}, { traditions: ['norse', 'wheel'], custom: [] }), 'norse');
  assert.equal(primaryTradition({ calendar_primary: 'wheel' }, { traditions: ['norse', 'wheel'], custom: [] }), 'wheel');
  assert.equal(primaryTradition({ calendar_primary: 'roman' }, { traditions: ['norse'], custom: [] }), 'norse');
});

test('folk full moon names, with Harvest, Hunter’s and Blue moons', () => {
  const names: string[] = [];
  let from = new Date(2026, 0, 1);
  for (let i = 0; i < 13; i++) {
    const full = nextPhase(from, 'full');
    names.push(fullMoonName(full));
    from = new Date(full.getTime() + 86_400_000);
  }
  assert.deepEqual(names, ['Wolf Moon', 'Snow Moon', 'Worm Moon', 'Pink Moon', 'Flower Moon', 'Blue Moon', 'Strawberry Moon', 'Buck Moon', 'Sturgeon Moon', 'Harvest Moon', 'Hunter’s Moon', 'Beaver Moon', 'Cold Moon']);
});

test('what the day is good for, its correspondences and a prompt', () => {
  assert.equal(
    goodForToday('New Moon', 'Libra'),
    'The New Moon in Libra is good for rest, setting intentions and planting seeds in the dark, and for love and friendship, harmony, justice, beauty and partnership.',
  );
  assert.equal(correspondencesFor(new Date(2026, 9, 10)).planet, 'Saturn');
  assert.ok(journalPrompt(new Date(2026, 9, 11), 'New Moon').endsWith('?'));
});
