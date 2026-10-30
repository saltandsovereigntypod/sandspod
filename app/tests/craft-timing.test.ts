import assert from 'node:assert/strict';
import { test } from 'node:test';

import { natalChart } from '../src/lib/craft/cosmic/chart.ts';
import {
  adviseTiming,
  anyIntent,
  deityPlanets,
  FACTORS,
  intentFromPlanner,
  intentsForPlanet,
  keepingFrom,
  levelsFromText,
  levelsToText,
  scoreWord,
  shapeIntent,
  TIMING_INTENTS,
  timingIntent,
  transitFit,
  voidSpells,
  whyLine,
  pointsText,
  windowPlanFields,
  windowWhen,
} from '../src/lib/craft/cosmic/timing.ts';
import { INTENTIONS } from '../src/lib/rituals/planner.ts';

const LONDON = { latitude: 51.51, longitude: -0.13 };
const FROM = new Date(2026, 9, 30, 14, 0); // Friday 30 October 2026, the Moon waning

test('every intent is complete, and every planner intention has one', () => {
  const keys = new Set<string>();
  for (const i of TIMING_INTENTS) {
    assert.ok(!keys.has(i.key), `duplicate ${i.key}`);
    keys.add(i.key);
    assert.ok(i.tides.length && i.planets.length && i.signs.length && i.words.length, i.key);
    assert.ok(!/!/.test(i.why), `${i.key}: no exclamation marks`);
  }
  for (const p of INTENTIONS) assert.ok(intentFromPlanner(p.key), `planner intention ${p.key} has no timing intent`);
  assert.equal(intentFromPlanner('prosperity')!.key, 'money');
  assert.equal(intentFromPlanner('study')!.key, 'communication');
  assert.equal(anyIntent('intuition')!.key, 'divination');
  assert.equal(anyIntent('money')!.key, 'money');
  assert.equal(anyIntent('nonsense'), null);
  for (const key of ['love', 'money', 'protection', 'banishing', 'healing', 'divination', 'communication', 'courage', 'ancestors', 'endings', 'beginnings']) {
    assert.ok(timingIntent(key), key);
  }
});

test('a premade working shapes the intent with its own moon and weekday', () => {
  const love = timingIntent('love')!;
  const shaped = shapeIntent(love, { moon: ['full', 'blue'], weekday: 1 });
  assert.deepEqual(shaped.tides, ['full', 'waxing']);
  assert.equal(shaped.planets[0], 'Moon');
  assert.equal(shaped.planets.filter((p) => p === 'Moon').length, 1);
  assert.deepEqual(shapeIntent(love, { moon: ['dark'] }).tides[0], 'new');
  assert.deepEqual(shapeIntent(love, {}), love);
});

test('levels survive a round trip through text, and only changed ones are written', () => {
  assert.equal(levelsToText({}), '');
  assert.equal(levelsToText({ phase: 2 }), '');
  const text = levelsToText({ hour: 0, phase: 3 });
  assert.equal(text, 'phase:3,hour:0');
  assert.deepEqual(levelsFromText(text), { phase: 3, hour: 0 });
  assert.deepEqual(levelsFromText('nope:1,phase:9,voc:1'), { voc: 1 });
  assert.equal(FACTORS.length, 9);
});

test('windows are one a day, best first, scored 0–100 with reasons', () => {
  const advice = adviseTiming(timingIntent('love')!, { from: FROM, days: 30, place: LONDON });
  assert.ok(advice.usedHours);
  assert.equal(advice.usedChart, false);
  assert.ok(advice.windows.length > 0 && advice.windows.length <= 6);
  const days = new Set(advice.windows.map((w) => w.start.toDateString()));
  assert.equal(days.size, advice.windows.length, 'one window a day');
  for (let i = 1; i < advice.windows.length; i++) assert.ok(advice.windows[i - 1].raw >= advice.windows[i].raw, 'best first');
  for (const w of advice.windows) {
    assert.ok(w.score >= 0 && w.score <= 100);
    assert.ok(w.end.getTime() > FROM.getTime());
    assert.ok(w.start.getTime() < FROM.getTime() + 30 * 86_400_000);
    assert.ok(w.parts.some((p) => p.factor === 'phase'));
    assert.ok(w.why.length > 0);
    // Love wants a growing or full moon.
    assert.ok(w.moon.tide === 'waxing' || w.moon.tide === 'full', `${w.start}: ${w.moon.tide}`);
    // Small hours are left out unless asked for.
    assert.ok(w.start.getHours() >= 6, `${w.start} is in the small hours`);
  }
  assert.ok(advice.now, 'the hour you are in is scored');
  assert.ok(advice.now!.start.getTime() <= FROM.getTime() && advice.now!.end.getTime() > FROM.getTime());
});

test('banishing prefers the waning moon and Saturn', () => {
  const advice = adviseTiming(timingIntent('banishing')!, { from: FROM, days: 30, place: LONDON });
  const top = advice.windows[0];
  assert.ok(top.moon.tide === 'waning' || top.moon.tide === 'new');
  assert.ok(top.dayPlanet === 'Saturn' || top.dayPlanet === 'Mars' || top.hourPlanet === 'Saturn' || top.hourPlanet === 'Mars');
});

test('without a place (or with hours off) it judges three-hour blocks', () => {
  const noPlace = adviseTiming(timingIntent('healing')!, { from: FROM, days: 7 });
  assert.equal(noPlace.usedHours, false);
  for (const w of noPlace.windows) {
    assert.equal(w.hourPlanet, null);
    assert.equal(w.end.getTime() - w.start.getTime(), 3 * 3_600_000);
    assert.ok(!w.parts.some((p) => p.factor === 'hour'));
  }
  const hoursOff = adviseTiming(timingIntent('healing')!, { from: FROM, days: 7, place: LONDON, levels: { hour: 0 } });
  assert.equal(hoursOff.usedHours, false);
});

test('turning a factor off removes it from every window', () => {
  const advice = adviseTiming(timingIntent('communication')!, { from: FROM, days: 30, place: LONDON, levels: { voc: 0, moonSign: 0, retrograde: 0 } });
  for (const w of advice.windows) assert.ok(!w.parts.some((p) => p.factor === 'voc' || p.factor === 'moonSign' || p.factor === 'retrograde'));
});

test('Mercury retrograde counts against communication while it lasts', () => {
  // Mercury is retrograde from 24 October to 13 November 2026.
  const advice = adviseTiming(timingIntent('communication')!, { from: FROM, days: 7, place: LONDON, count: 7 });
  const retro = advice.windows.flatMap((w) => w.parts).filter((p) => p.factor === 'retrograde');
  assert.ok(retro.length > 0, 'Mercury retrograde shows');
  assert.ok(retro.every((p) => p.points < 0 && p.label === 'Mercury retrograde'));
  assert.ok(advice.windows.some((w) => /but .*Mercury retrograde/.test(w.why)));
  // Love doesn't mind Mercury.
  const love = adviseTiming(timingIntent('love')!, { from: FROM, days: 7, place: LONDON });
  assert.ok(!love.windows.some((w) => w.parts.some((p) => p.label === 'Mercury retrograde')));
});

test('void-of-course spells are found across the window and count against new work', () => {
  const spells = voidSpells(FROM, new Date(FROM.getTime() + 10 * 86_400_000));
  assert.ok(spells.length >= 3, `found ${spells.length}`);
  for (const v of spells) assert.ok(v.end.getTime() > v.start.getTime());
  const advice = adviseTiming(timingIntent('beginnings')!, { from: FROM, days: 30, place: LONDON, count: 30 });
  const voc = advice.windows.flatMap((w) => w.parts).filter((p) => p.factor === 'voc');
  for (const p of voc) assert.equal(p.fit, -1);
  const release = adviseTiming(timingIntent('endings')!, { from: FROM, days: 30, place: LONDON, count: 30 });
  for (const p of release.windows.flatMap((w) => w.parts).filter((p) => p.factor === 'voc')) assert.equal(p.fit, -0.3);
});

test('festivals, the Deipnon and patron days come from settings', () => {
  const settings = {
    calendar_traditions: 'wheel',
    my_deities: JSON.stringify([{ key: 'hekate', name: 'Hekate', level: 'patron', since: '2024-01-01' }]),
  };
  const keeping = keepingFrom(settings, FROM, 30);
  assert.ok(keeping.festivals.some((f) => f.name === 'Samhain'));
  assert.ok(keeping.festivals.some((f) => f.deipnon), 'Hekate as patron brings the Deipnon');
  assert.equal(keeping.deities.length, 1);
  assert.equal(keeping.deities[0].name, 'Hekate');
  assert.equal(keepingFrom({ calendar_traditions: 'wheel', deipnon_prompt: false, my_deities: settings.my_deities }, FROM, 30).festivals.some((f) => f.deipnon), false);
  assert.deepEqual(keepingFrom({}, FROM, 30).deities, []);

  const advice = adviseTiming(timingIntent('ancestors')!, { from: FROM, days: 30, place: LONDON, keeping });
  const samhain = advice.windows.find((w) => w.start.getMonth() === 9 && w.start.getDate() === 31);
  assert.ok(samhain, 'Samhain is among the best times for ancestor work');
  assert.ok(samhain!.parts.some((p) => p.factor === 'festival' && p.fit === 1));
  assert.ok(advice.windows.some((w) => w.parts.some((p) => p.factor === 'festival' && p.label === 'The Deipnon')));
  // A festival that doesn't fit still shows, gently.
  const money = adviseTiming(timingIntent('money')!, { from: new Date(2026, 9, 31, 7), days: 1, place: LONDON, keeping });
  const part = [...money.windows, money.now].flatMap((w) => w?.parts ?? []).find((p) => p.factor === 'festival');
  if (part) assert.equal(part.fit, 0.3);
});

test('deities are tied to planets by the planet guides', () => {
  assert.ok(deityPlanets('Venus').includes('Venus'));
  assert.ok(deityPlanets('thor').includes('Jupiter'));
  assert.deepEqual(deityPlanets('Nobody at all'), []);
});

test('a natal chart adds the sky’s touch, only when one is given', () => {
  const chart = natalChart({ date: '1990-06-15', time: '12:00', utcOffsetMinutes: 60, latitude: 51.5, longitude: -0.13, place: 'London', name: 'Me' } as never);
  assert.ok(chart);
  const advice = adviseTiming(timingIntent('love')!, { from: FROM, days: 30, place: LONDON, chart, count: 30 });
  assert.equal(advice.usedChart, true);
  const off = adviseTiming(timingIntent('love')!, { from: FROM, days: 30, place: LONDON, chart, levels: { transits: 0 } });
  assert.equal(off.usedChart, false);
  assert.ok(!off.windows.some((w) => w.parts.some((p) => p.factor === 'transits')));
});

test('transit fit: kind planets help, Saturn on the lights hinders', () => {
  const love = timingIntent('love')!;
  const good = transitFit([{ transiting: 'Venus', natal: 'Sun', aspect: 'trine', off: 1, applying: true }], love);
  assert.equal(good.fit, 0.5);
  assert.equal(good.lines[0], 'Venus trines your natal Sun');
  const bad = transitFit([{ transiting: 'Saturn', natal: 'Moon', aspect: 'square', off: 1, applying: true }], love);
  assert.equal(bad.fit, -0.5);
  assert.equal(transitFit([{ transiting: 'Moon', natal: 'Sun', aspect: 'trine', off: 1, applying: true }], love).lines.length, 0);
});

test('words and plan fields', () => {
  assert.equal(scoreWord(90), 'Very well suited');
  assert.equal(scoreWord(10), 'Not much in its favour');
  assert.equal(whyLine([]), 'Little in its favour');
  assert.equal(
    whyLine([
      { factor: 'phase', label: 'Full Moon', fit: 1, points: 3, note: '' },
      { factor: 'retrograde', label: 'Venus retrograde', fit: -1, points: -1.5, note: '' },
    ]),
    'Full Moon; but Venus retrograde',
  );
  assert.deepEqual(windowPlanFields({ start: new Date(2026, 10, 6, 15, 12) }, FROM), { date: '2026-11-06', time: '15:12' });
  // A window already under way is planned from a few minutes on.
  assert.deepEqual(windowPlanFields({ start: new Date(2026, 9, 30, 13, 0) }, new Date(2026, 9, 30, 14, 2)), { date: '2026-10-30', time: '14:10' });
});

test('good enough now only when now is close to the best', () => {
  const advice = adviseTiming(timingIntent('banishing')!, { from: FROM, days: 7, place: LONDON });
  if (advice.goodEnoughNow) {
    assert.ok(advice.now!.score >= 55);
    assert.ok(advice.now!.score >= advice.windows[0].score - 15);
  }
  const far = adviseTiming(timingIntent('love')!, { from: FROM, days: 30, place: LONDON });
  if (far.now && far.now.score < 55) assert.equal(far.goodEnoughNow, false);
});

test('window labels', () => {
  const now = new Date(2026, 9, 30, 14, 0);
  assert.equal(windowWhen({ start: new Date(2026, 9, 30, 15, 0), end: new Date(2026, 9, 30, 16, 5) }, now), 'Today · 3:00 PM – 4:05 PM');
  assert.equal(windowWhen({ start: new Date(2026, 9, 31, 7, 0), end: new Date(2026, 9, 31, 8, 0) }, now), 'Tomorrow · 7:00 AM – 8:00 AM');
  assert.equal(windowWhen({ start: new Date(2026, 10, 6, 21, 0), end: new Date(2026, 10, 6, 22, 0) }, now), 'Friday, Nov 6 · 9:00 PM – 10:00 PM');
  assert.equal(pointsText(2), '+2');
  assert.equal(pointsText(-1.5), '−1.5');
  assert.equal(pointsText(0), '0');
});

test('each of the seven planets leads somewhere', () => {
  for (const planet of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) assert.ok(intentsForPlanet(planet).length > 0, planet);
  assert.equal(intentsForPlanet('Venus')[0].key, 'love');
  assert.equal(intentsForPlanet('Saturn')[0].key, 'banishing');
  assert.deepEqual(intentsForPlanet('Pluto'), []);
});

test('without hours, equal blocks go to the evening', () => {
  const advice = adviseTiming(timingIntent('love')!, { from: FROM, days: 30, levels: { voc: 0 } });
  assert.ok(advice.windows.some((w) => w.start.getHours() >= 18), 'an evening block is offered');
});
