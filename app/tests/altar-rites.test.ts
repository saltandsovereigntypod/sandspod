// Casting the circle, calling the quarters, the singing bowl, the chalice,
// the besom and lighting by hand (lib/altar/circle.ts, bowl.ts, toolRites.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  callQuarter,
  castCircle,
  circleOf,
  circleReminder,
  cleanColor,
  isCircleTool,
  nextToCall,
  nextToRelease,
  perfectCircle,
  quarterAt,
  quartersOf,
  readTrace,
  releaseCircle,
  releaseQuarter,
  setQuarterColor,
} from '../src/lib/altar/circle.ts';
import { BOWL_TONES, clampEvery, nextStrikeAt, strikesBy, toneOf } from '../src/lib/altar/bowl.ts';
import { lightCandle } from '../src/lib/altar/livingState.ts';
import { offeringOf } from '../src/lib/altar/offerings.ts';
import {
  chaliceLevel,
  debrisOf,
  drinkChalice,
  dropDebris,
  fillChalice,
  libationBowlIndex,
  nearTarget,
  pourLibation,
  readRite,
  sweepAlong,
  sweepLine,
} from '../src/lib/altar/toolRites.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const NOW = '2026-11-03T20:00:00.000Z';

test('athames and wands cast, by their kind, including new ones', () => {
  assert.ok(isCircleTool({ type: 'tool', tool: 'athame' }));
  assert.ok(isCircleTool({ type: 'tool', tool: 'wand' }));
  assert.ok(isCircleTool({ type: 'tool', tool: 'selenite-athame' }));
  assert.ok(isCircleTool({ type: 'tool', tool: 'crystal-wand' }));
  assert.ok(!isCircleTool({ type: 'tool', tool: 'bell' }));
  assert.ok(!isCircleTool({ type: 'crystal', tool: 'wand' }));
});

test('a trace reads sunwise or widdershins, and closes past 300°', () => {
  const c = { x: 200, y: 120 };
  const full = perfectCircle(c, 80, 48, true);
  const r = readTrace(full);
  assert.equal(r.direction, 'deosil');
  assert.ok(r.closes && r.degrees >= 355, String(r.degrees));
  assert.ok(Math.abs(r.radius - 80) < 3);
  const back = readTrace(perfectCircle(c, 80, 48, false));
  assert.equal(back.direction, 'widdershins');
  assert.ok(back.closes);
  // Most of the way round (270°) isn't enough; 320° is.
  assert.equal(readTrace(full.slice(0, 37)).closes, false);
  assert.equal(readTrace(full.slice(0, 44)).closes, true);
  // A scribble in one spot is not a circle.
  assert.equal(readTrace([{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }], 10).direction, null);
  assert.equal(readTrace([{ x: 0, y: 0 }]).direction, null);
});

test('the circle is kept with the altar and released', () => {
  const extra = castCircle({ cords: [] }, { cx: 0.5, cy: 0.5, r: 0.3 }, 'ff0000', NOW, 'me');
  const circle = circleOf(extra)!;
  assert.equal(circle.color, '#ff0000');
  assert.equal(circle.castAt, NOW);
  assert.deepEqual(Object.keys(releaseCircle(extra)), ['cords']);
  assert.equal(circleOf({}), null);
  assert.equal(cleanColor('#ABC'), '#aabbcc');
  assert.equal(cleanColor('nonsense'), '#f0c96a');
});

test('quarters are called in any order and released only in reverse', () => {
  let extra: Record<string, unknown> = {};
  assert.equal(nextToCall(quartersOf(extra)), 'east');
  for (const id of ['east', 'south', 'west'] as const) extra = callQuarter(extra, id).extra;
  assert.equal(nextToCall(quartersOf(extra)), 'north');
  assert.equal(callQuarter(extra, 'east').ok, false);
  extra = callQuarter(extra, 'north').extra;
  assert.equal(nextToCall(quartersOf(extra)), null);
  assert.equal(nextToRelease(quartersOf(extra)), 'north');
  const wrong = releaseQuarter(extra, 'east');
  assert.equal(wrong.ok, false);
  assert.match(wrong.line, /North first/);
  for (const id of ['north', 'west', 'south', 'east'] as const) {
    const r = releaseQuarter(extra, id);
    assert.ok(r.ok, id);
    extra = r.extra;
  }
  assert.equal('quarters' in extra, false);
  extra = setQuarterColor(extra, 'east', '#ffffff');
  assert.equal(quartersOf(extra).colors.east, '#ffffff');
  assert.equal(quartersOf(setQuarterColor(extra, 'east', null)).colors.east, undefined);
});

test('the edges are the quarters: north at the back, east to the right', () => {
  assert.equal(quarterAt(0.95, 0.5), 'east');
  assert.equal(quarterAt(0.5, 0.95), 'south');
  assert.equal(quarterAt(0.04, 0.4), 'west');
  assert.equal(quarterAt(0.5, 0.05), 'north');
  assert.equal(quarterAt(0.5, 0.5), null);
});

test('the circle panel reminds you to close everything, in reverse', () => {
  assert.equal(circleReminder({}), null);
  let extra = castCircle({}, { cx: 0.5, cy: 0.5, r: 0.3 }, '#ffffff', NOW);
  extra = callQuarter(callQuarter(extra, 'east').extra, 'south').extra;
  assert.equal(circleReminder(extra), 'Before you end, release the South, East, then release the circle.');
});

test('the bowl rings on a schedule of 1 to 10 minutes', () => {
  assert.equal(BOWL_TONES.length, 8);
  assert.equal(BOWL_TONES[0].note, 'C');
  assert.equal(BOWL_TONES[6].note, 'B');
  assert.equal(toneOf({ bowlTone: '432' }).hz, 432);
  assert.equal(toneOf({}).id, 'heart');
  assert.equal(clampEvery(0), 1);
  assert.equal(clampEvery(30), 10);
  assert.equal(clampEvery('3'), 3);
  const start = 1_000_000;
  assert.equal(nextStrikeAt(start, 2, start), start);
  assert.equal(nextStrikeAt(start, 2, start + 1), start + 120_000);
  assert.equal(nextStrikeAt(start, 2, start + 120_000), start + 120_000);
  assert.equal(strikesBy(start, 2, start + 250_000), 3);
  assert.equal(strikesBy(start, 2, start - 1), 0);
});

const chalice: SavedObject = { type: 'tool', tool: 'chalice', imagePath: '../assets/altar/objects/tools/chalice/chalice.png', leftPercent: 0.3, topPercent: 0.5, sizePercent: 0.1 };
const bowl: SavedObject = { type: 'vessel', vessel: 'offering-bowl', imagePath: '../assets/altar/objects/vessels/offering-bowl/offering-bowl.png', leftPercent: 0.6, topPercent: 0.5, sizePercent: 0.1 };

test('the chalice fills, pours a libation into the bowl, and is drunk', () => {
  assert.equal(chaliceLevel(chalice), 0);
  const full = fillChalice(chalice, 'mead', NOW);
  assert.equal(chaliceLevel(full), 1);
  assert.equal(offeringOf(full)?.label, 'mead');
  assert.equal(libationBowlIndex([full, bowl], 0), 1);
  assert.equal(libationBowlIndex([full], 0), -1);
  const poured = pourLibation(full, bowl, NOW)!;
  assert.equal(chaliceLevel(poured.chalice), 0.75);
  assert.equal(offeringOf(poured.bowl!)?.label, 'mead');
  assert.match(poured.line, /into the bowl/);
  let cup = poured.chalice;
  for (let i = 0; i < 3; i++) cup = pourLibation(cup, null, NOW)!.chalice;
  assert.equal(chaliceLevel(cup), 0);
  assert.equal(pourLibation(cup, null, NOW), null);
  assert.equal(chaliceLevel(drinkChalice(full, NOW)), 0);
});

const candle = (x: number, lit = false): SavedObject => {
  const c: SavedObject = { type: 'candle', form: 'taper', color: 'white', imagePath: '../assets/altar/objects/candles/taper/white.png', leftPercent: x, topPercent: 0.5, sizePercent: 0.06 };
  return lit ? lightCandle(c, NOW) : c;
};

test('a match near an unlit candle offers to light it; a snuffer near a lit one, to snuff it', () => {
  const match: SavedObject = { type: 'tool', tool: 'matches', leftPercent: 0.5, topPercent: 0.5, sizePercent: 0.06 };
  const now = Date.parse(NOW) + 1000;
  assert.equal(nearTarget([match, candle(0.9)], 0, 'light', now), -1, 'far away');
  assert.equal(nearTarget([match, candle(0.9), candle(0.55)], 0, 'light', now), 2);
  assert.equal(nearTarget([match, candle(0.55, true)], 0, 'light', now), -1, 'already lit');
  const snuffer: SavedObject = { type: 'tool', tool: 'candle-snuffer', leftPercent: 0.5, topPercent: 0.5, sizePercent: 0.06 };
  assert.equal(nearTarget([snuffer, candle(0.55, true)], 0, 'snuff', now), 1);
  assert.equal(nearTarget([snuffer, candle(0.55)], 0, 'snuff', now), -1);
});

test('the besom sweeps what its path passes, and says what it cleared', () => {
  let extra: Record<string, unknown> = {};
  extra = dropDebris(extra, 'match', candle(0.2), NOW, 1);
  extra = dropDebris(extra, 'ash', null, NOW, 2);
  assert.equal(debrisOf(extra).length, 2);
  const [m] = debrisOf(extra);
  const part = sweepAlong([], extra, [{ x: m.x, y: m.y }]);
  assert.equal(part.matches, 1);
  assert.equal(part.ashes, 0);
  assert.equal(debrisOf(part.extra).length, 1);
  const all = sweepAlong([], extra, [], [{ id: 'c1', x: 0.5, y: 0.5 }], true);
  assert.equal(debrisOf(all.extra).length, 0);
  assert.equal(sweepLine(all), 'Swept the altar: cleared away the ash of a burned petition, a spent match and a burned cord.');
  assert.equal(sweepLine({ ash: [], matches: 0, ashes: 0, cords: [] }), null);
});

test('rites heard from others are read off the channel', () => {
  assert.deepEqual(readRite({ from: 'u2', kind: 'bowl', tone: 'root' }, 'u1'), { from: 'u2', kind: 'bowl', tone: 'root' });
  assert.equal(readRite({ from: 'u1', kind: 'bowl' }, 'u1'), null);
  assert.equal(readRite({ from: 'u2', kind: 'nonsense' }, 'u1'), null);
});
