// The real sky over the altar, and petition papers.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ambientAt, dayPhase, nextAmbientCheck, seasonAt } from '../src/lib/altar/ambient.ts';
import { altarOptionsFor } from '../src/lib/altar/altarOptions.ts';
import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { displayBox } from '../src/lib/altar/geometry.ts';
import { layerOf } from '../src/lib/altar/layers.ts';
import {
  finishPetition,
  isPetitionPaper,
  newPetition,
  petitionBox,
  petitionEntryOf,
  petitionObject,
  releaseDue,
  releaseNights,
  schedulePetition,
  timingDate,
} from '../src/lib/altar/petitions.ts';

const london = { latitude: 51.5, longitude: -0.13 };
const sydney = { latitude: -33.87, longitude: 151.21 };

test('the light follows the real sun: dawn, day, dusk and night in London', () => {
  // 16 Oct 2026: sunrise about 06:30 UTC, sunset about 17:00 UTC.
  assert.equal(dayPhase(new Date('2026-10-16T06:30:00Z'), london), 'dawn');
  assert.equal(dayPhase(new Date('2026-10-16T12:00:00Z'), london), 'day');
  assert.equal(dayPhase(new Date('2026-10-16T17:05:00Z'), london), 'dusk');
  assert.equal(dayPhase(new Date('2026-10-16T22:00:00Z'), london), 'night');
  assert.equal(dayPhase(new Date('2026-10-16T02:00:00Z'), london), 'night');
  assert.equal(ambientAt(new Date('2026-10-16T12:00:00Z'), london).tint.opacity, 0, 'daylight adds nothing');
});

test('without a place the clock decides', () => {
  const noon = new Date(2026, 9, 16, 12);
  const midnight = new Date(2026, 9, 16, 0, 30);
  assert.equal(dayPhase(noon, null), 'day');
  assert.equal(dayPhase(midnight, null), 'night');
});

test('the season turns round south of the equator', () => {
  const october = new Date('2026-10-16T12:00:00Z');
  assert.equal(seasonAt(october, london.latitude), 'autumn');
  assert.equal(seasonAt(october, sydney.latitude), 'spring');
  assert.equal(seasonAt(new Date('2026-07-01T12:00:00Z'), null), 'summer');
});

test('the next check is never more than a quarter hour away, nor less than a minute', () => {
  const ms = nextAmbientCheck(new Date('2026-10-16T12:00:00Z'), london);
  assert.ok(ms >= 60_000 && ms <= 15 * 60_000);
});

test('altar options default on (except New Moon charging), per altar', () => {
  const none = altarOptionsFor([], 'a');
  assert.deepEqual(none.options, { altarId: 'a', sky: true, moonWindow: true, newMoonCharging: false });
  const saved = altarOptionsFor([{ id: 'e1', data: { altarId: 'a', sky: false } }, { id: 'e2', data: { altarId: 'b', moonWindow: false } }], 'a');
  assert.equal(saved.entryId, 'e1');
  assert.equal(saved.options.sky, false);
  assert.equal(saved.options.moonWindow, true);
});

const now = new Date('2026-10-16T12:00:00Z');

test('a petition is written with its moon timing', () => {
  const p = newPetition('altar-1', { title: '  Open   roads ', words: 'Let the way open.', intention: 'Work', timing: 'full-moon' }, now);
  assert.equal(p.title, 'Open roads');
  assert.equal(p.status, 'waiting');
  assert.ok(p.timingAt.startsWith('2026-10-26'));
  assert.equal(newPetition('a', { title: '', words: '', intention: '', timing: 'now' }, now).title, 'My petition');
  assert.equal(timingDate('now', now), null);
  const waning = timingDate('waning', now)!;
  assert.ok(waning.getTime() > Date.parse('2026-10-26T00:00:00Z'));
});

test('the paper sits at a candle’s foot, under it', () => {
  const item = builtInCabinet.find((i) => i.id === 'candles:red-candle')!;
  const candle = objectFromForm(item, item.forms.find((f) => f.form === 'taper')!, [], now.toISOString());
  const p = newPetition('altar-1', { title: 'Open roads', words: '', intention: '', timing: 'now' }, now);
  const paper = petitionObject(p, 'entry-1', [candle], now.toISOString(), candle);
  assert.ok(isPetitionPaper(paper));
  assert.equal(petitionEntryOf(paper), 'entry-1');
  assert.ok(layerOf(paper) < layerOf(candle));
  assert.ok(displayBox(paper).cy > displayBox(candle).cy);
  assert.equal(paper.fallbackSymbol, '📜');
  assert.equal(paper.imagePath, '');
  const loose = petitionObject(p, 'entry-1', [candle], now.toISOString());
  assert.ok(layerOf(loose) > layerOf(candle));
});

test('burned, buried and released petitions leave the box for its history', () => {
  const p = newPetition('altar-1', { title: 'One', words: '', intention: '', timing: 'now' }, now);
  const q = { ...newPetition('altar-1', { title: 'Two', words: '', intention: '', timing: 'now' }, new Date(now.getTime() + 1000)) };
  const night = releaseNights(now, london.latitude).find((n) => n.id === 'samhain')!;
  assert.ok(night, 'Samhain is near in October');
  const scheduled = schedulePetition(q, night.date, night.why);
  assert.equal(releaseDue(scheduled, now), false);
  assert.equal(releaseDue(scheduled, night.date), true);
  const entries = [
    { id: '1', data: finishPetition(p, 'burned', now) },
    { id: '2', data: scheduled },
    { id: '3', data: { ...p, altarId: 'other' } },
  ];
  const box = petitionBox(entries, 'altar-1');
  assert.deepEqual(box.open.map((e) => e.id), ['2']);
  assert.deepEqual(box.history.map((e) => e.id), ['1']);
  assert.equal(box.history[0].data.status, 'burned');
});

test('release nights: tonight first, the waning and dark moons, Samhain by hemisphere', () => {
  const north = releaseNights(now, london.latitude);
  assert.equal(north[0].id, 'tonight');
  assert.ok(north.some((n) => n.id === 'waning'));
  assert.ok(north.some((n) => n.id === 'dark'));
  assert.equal(north.find((n) => n.id === 'samhain')!.date.getMonth(), 9);
  assert.ok(!releaseNights(now, sydney.latitude).some((n) => n.id === 'samhain'), 'Samhain is in April down south');
  for (let i = 1; i < north.length; i++) assert.ok(north[i].date >= north[i - 1].date);
});
