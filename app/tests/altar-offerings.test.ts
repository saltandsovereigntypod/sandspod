// Living offerings: each kind goes through its stages in real time, is drawn
// going over (offeringArt), can be refreshed, given back or left, and asks
// gently to be tended.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { lightIncense } from '../src/lib/altar/incense.ts';
import { appHistoryOf, readLivingState } from '../src/lib/altar/livingState.ts';
import { incenseStickArt, liquidOf, offeringArt, petalColor, tintFilter, tintMatrix } from '../src/lib/altar/offeringArt.ts';
import {
  agingLook,
  altarPhrase,
  endOffering,
  freshness,
  freshnessLine,
  freshnessWord,
  kindFromWords,
  leaveOffering,
  offeringFreshness,
  offeringOf,
  offeringsDue,
  offeringStage,
  perishableItself,
  refreshOffering,
  setOffering,
  tendingNote,
} from '../src/lib/altar/offerings.ts';
import { altarDataFromDocument, emptyDocument } from '../src/lib/altar/snapshot.ts';
import { altarOfferingsDue } from '../src/lib/altar/burnout.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { buildSchedule, DEFAULT_SETTINGS, normalizeSettings } from '../src/lib/reminders/schedule.ts';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const T0 = Date.UTC(2026, 9, 1, 20);
const at = (ms: number) => new Date(T0 + ms).toISOString();

const place = (id: string, formId?: string, when = at(0)): SavedObject => {
  const item = builtInCabinet.find((i) => i.id === id);
  assert.ok(item, id);
  const form = formId ? item.forms.find((f) => f.form === formId) : item.forms[0];
  assert.ok(form, `${id} ${formId}`);
  return objectFromForm(item, form, [], when);
};

test('stages in real time: flowers droop in days, wilt in a week and fade after', () => {
  assert.equal(offeringStage('flowers', 2 * DAY).name, 'Fresh');
  assert.equal(offeringStage('flowers', 4 * DAY).name, 'Drooping');
  assert.equal(offeringStage('flowers', 7 * DAY).name, 'Wilting');
  assert.equal(offeringStage('flowers', 10 * DAY).name, 'Faded');
  assert.equal(offeringStage('water', 6 * HOUR).index, 0);
  assert.equal(offeringStage('water', 30 * HOUR).name, 'A little lower');
  assert.equal(offeringStage('water', 2 * DAY).name, 'Low');
  assert.equal(offeringStage('water', 5 * DAY).name, 'Dried up');
  assert.equal(offeringStage('milk', 20 * HOUR).name, 'Turning');
  assert.equal(offeringStage('milk', 30 * HOUR).name, 'Sour');
  assert.equal(offeringStage('honey', 3 * DAY).name, 'Gathering dust');
  assert.equal(offeringStage('bread', 6 * DAY).name, 'Hard and dry');
  assert.equal(offeringStage('fruit', 5 * DAY).name, 'Browning');
  assert.equal(offeringStage('stones', 300 * DAY).name, 'Keeps');
  // Progress runs 0 → 1 over its whole life, and never past it.
  assert.equal(offeringStage('flowers', 0).progress, 0);
  assert.equal(offeringStage('flowers', 30 * DAY).progress, 1);
});

test('the stages agree with the levels the panel and the tending chips use', () => {
  for (const kind of ['water', 'drink', 'milk', 'honey', 'bread', 'fruit', 'sweets', 'cooked', 'flowers'] as const) {
    for (let h = 0; h < 12 * 24; h += 3) {
      const f = freshness(kind, T0, T0 + h * HOUR);
      const expected = f.level === 'fresh' ? 0 : f.level === 'fading' ? 1 : f.stage.index >= 2 ? f.stage.index : -1;
      assert.equal(f.stage.index, expected, `${kind} at ${h}h`);
    }
  }
  assert.equal(freshnessWord(freshness('flowers', T0, T0 + 7 * DAY)), 'Wilting');
  assert.equal(freshnessWord(freshness('coins', T0, T0 + 7 * DAY)), 'Keeps');
  assert.match(freshnessLine('water', freshness('water', T0, T0 + 5 * DAY)), /^Dried up: .*Wipe the vessel/);
  assert.match(freshnessLine('flowers', freshness('flowers', T0, T0 + 4 * DAY)), /^Drooping\. Set out 4 days ago\.$/);
});

test('honey, dried flowers and words that name what perishes', () => {
  assert.equal(kindFromWords('a spoon of honey'), 'honey');
  assert.equal(kindFromWords('honey cakes'), 'sweets');
  assert.equal(kindFromWords('dried rose petals'), 'dried');
  assert.equal(kindFromWords('three apples'), 'fruit');
});

test('the look goes over gently: little change at first, most near the end', () => {
  const look = (kind: 'flowers' | 'water' | 'fruit', ms: number) => agingLook(kind, freshness(kind, T0, T0 + ms));
  assert.deepEqual(look('flowers', HOUR).tint, { sepia: 0, saturate: 1, brightness: 1 });
  assert.equal(look('flowers', HOUR).droop, 0);
  const wilting = look('flowers', 7 * DAY);
  const faded = look('flowers', 10 * DAY);
  assert.ok(wilting.droop > 0 && faded.droop > wilting.droop && faded.droop <= 14);
  assert.equal(wilting.petals, 1);
  assert.equal(faded.petals, 2);
  assert.ok(faded.tint.saturate < wilting.tint.saturate);
  // Water falls evenly and leaves a tide line, then dries.
  assert.ok(look('water', DAY).level > look('water', 2 * DAY).level);
  assert.equal(look('water', 5 * DAY).level, 0);
  assert.equal(look('water', 5 * DAY).ring, true);
  assert.ok(look('fruit', 6 * DAY).tint.brightness < 0.9);
});

test('a perishable picture of your own is the offering itself; likenesses and tools are not', () => {
  const own = (label: string, type = 'tool'): SavedObject => ({ ...place('tools:key'), type, tool: 'custom', label });
  assert.equal(perishableItself(own('Apples')), 'fruit');
  assert.equal(perishableItself(own('Fresh Bread')), 'bread');
  assert.equal(perishableItself(own('Silk Roses')), null);
  assert.equal(perishableItself(own('Dried Roses')), null);
  assert.equal(perishableItself(own('Black Salt')), null);
  assert.equal(perishableItself(own('Lemon Balm', 'herb')), null);
  assert.equal(perishableItself(place('tools:key')), null);
  const apples = own('Apples');
  assert.equal(offeringOf(apples)?.kind, 'fruit');
  assert.equal(offeringFreshness(apples, Date.parse(String(readLivingState(apples, '').createdAt)) + 5 * DAY)?.stage.name, 'Browning');
});

test('refresh, give back or leave it: each is logged with the stage it had reached', () => {
  const bowl = setOffering(place('vessels:offering-bowl'), 'water', '', at(0));
  const left = leaveOffering(bowl, at(2 * DAY));
  assert.equal(offeringOf(left)?.leftAt, at(2 * DAY));
  assert.equal(leaveOffering(left, at(3 * DAY)), left);
  const refreshed = refreshOffering(left, at(3 * DAY));
  assert.equal(offeringOf(refreshed)?.leftAt, undefined);
  assert.equal(offeringOf(refreshed)?.since, at(3 * DAY));
  const given = endOffering(refreshed, 'returned', at(8 * DAY));
  const history = appHistoryOf(given).filter((e) => e.kind === 'offering');
  assert.deepEqual(
    history.map((e) => [e.action, e.stage ?? '', e.text]),
    [
      ['set', '', 'Set out water.'],
      ['left', 'low', 'Left the water as it is.'],
      ['refreshed', 'low', 'Refreshed the water.'],
      ['returned', 'dried up', 'Returned the water to nature.'],
    ],
  );
  // What the website keeps: the same JSON in livingState.app.
  const saved = JSON.parse(String(given.livingState));
  assert.equal(saved.app.offering, null);
});

test('offerings that want tending, and the gentle note about them', () => {
  const roses = { ...place('herbs:rose', 'sprig', at(0)), altarObjectId: 'r1' };
  const water = { ...setOffering(place('vessels:bowl', undefined, at(0)), 'water', '', at(6 * DAY)), altarObjectId: 'w1' };
  const altars = [{ id: 'a1', name: 'Brigid', objects: [roses, water] }];
  assert.deepEqual(offeringsDue(altars, T0 + 2 * DAY), []);
  const due = offeringsDue(altars, T0 + 7 * DAY);
  assert.equal(due.length, 1);
  assert.equal(due[0].what, 'rose sprig');
  assert.equal(tendingNote(due), 'The rose sprig on your Brigid altar is wilting.');
  assert.equal(tendingNote(due, { oneAltar: true }), 'The rose sprig is wilting.');
  // Coming up, for a reminder: the water is due a day and a half after it was poured.
  const soon = offeringsDue(altars, T0 + 7 * DAY, T0 + 8 * DAY);
  assert.equal(soon.length, 2);
  assert.equal(tendingNote(soon), 'The rose sprig on your Brigid altar is wilting. One more offering wants tending too.');
  // Left as it is: no longer asks.
  const quiet = [{ id: 'a1', name: 'Brigid', objects: [leaveOffering(roses, at(7 * DAY)), water] }];
  assert.deepEqual(offeringsDue(quiet, T0 + 7 * DAY), []);
  const many = [{ id: 'a2', name: 'Hearth Altar', objects: [setOffering(place('vessels:dish'), 'flowers', 'Roses', at(0))] }];
  assert.equal(tendingNote(offeringsDue(many, T0 + 7 * DAY)), 'The roses on Hearth Altar are wilting.');
  assert.equal(altarPhrase(''), 'your altar');
});

test('drawn going over: wine sinks in the chalice, water leaves a ring in the bowl, a sprig bows and drops petals', () => {
  const W = 80;
  const bowl = setOffering(place('vessels:offering-bowl'), 'water', '', at(0));
  const fresh = offeringArt(bowl, W, W / 1.5, T0 + HOUR);
  // Fresh: nothing drawn yet (the level hasn't moved).
  assert.ok(!fresh || (!fresh.tide && !fresh.stain));
  const half = offeringArt(bowl, W, W / 1.5, T0 + 2 * DAY);
  assert.ok(half?.liquid && half.tide && !half.stain && !half.tint);
  const dry = offeringArt(bowl, W, W / 1.5, T0 + 5 * DAY);
  assert.ok(dry && !dry.liquid && dry.stain && dry.tide);
  // The surface sinks and narrows as it goes.
  const early = offeringArt(bowl, W, W / 1.5, T0 + 20 * HOUR)!;
  assert.ok(early.liquid!.cy < half!.liquid!.cy && early.liquid!.rx > half!.liquid!.rx);

  const chalice = setOffering(place('tools:chalice'), 'drink', 'red wine', at(0));
  const wine = offeringArt(chalice, W, W * 1.5, T0 + 20 * HOUR)!;
  assert.equal(wine.liquid?.color, liquidOf('drink', 'red wine', 1)!.color);
  // Low in a chalice it's behind the rim.
  assert.equal(offeringArt(chalice, W, W * 1.5, T0 + 4.8 * DAY)?.liquid ?? null, null);

  // Bread in a bowl has no picture of its own to change.
  assert.equal(offeringArt(setOffering(place('vessels:bowl'), 'bread', '', at(0)), W, W / 1.5, T0 + 4 * DAY), null);

  const sprig = { ...place('herbs:rose', 'sprig'), altarObjectId: 'rose-1' };
  const wilted = offeringArt(sprig, W, W * 1.5, T0 + 10 * DAY, 1.5)!;
  assert.ok(wilted.tint && wilted.bend && wilted.bend.rotate > 0 && wilted.bend.scaleY < 1);
  assert.equal(wilted.petals.length, 2);
  assert.equal(wilted.petals[0].color, petalColor('rose'));
  // The same object always drops its petals in the same places.
  assert.deepEqual(offeringArt(sprig, W, W * 1.5, T0 + 10 * DAY, 1.5)!.petals, wilted.petals);
  assert.equal(offeringArt(place('crystals:amethyst'), W, W, T0 + 10 * DAY), null);
});

test('the phone’s colour matrix is the web’s filter', () => {
  const tint = { sepia: 0.4, saturate: 0.5, brightness: 0.86 };
  assert.equal(tintFilter(tint), 'sepia(0.4) saturate(0.5) brightness(0.86)');
  const m = tintMatrix(tint);
  assert.equal(m.length, 20);
  assert.deepEqual(tintMatrix({ sepia: 0, saturate: 1, brightness: 1 }), [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]);
  // White browns: red stays above blue.
  const white = [0, 5, 10].map((r) => m[r] + m[r + 1] + m[r + 2]);
  assert.ok(white[0] > white[2] && white[0] <= 1);
});

test('a stick of incense burns down from its tip and leaves ash at its foot', () => {
  const herb = builtInCabinet.find((i) => i.forms.some((f) => f.form === 'incense' && /herbs\/incense\/incense\.png$/.test(String(f.image))));
  assert.ok(herb);
  const form = herb.forms.find((f) => f.form === 'incense')!;
  const stick = objectFromForm(herb, form, [], at(0));
  assert.equal(incenseStickArt(stick, 30, 90, T0)?.pile, null);
  const lit = lightIncense(stick, at(0));
  const half = incenseStickArt(lit, 30, 90, T0 + 20 * 60_000)!;
  const later = incenseStickArt(lit, 30, 90, T0 + 35 * 60_000)!;
  assert.ok(half.cutPx > 0 && later.cutPx > half.cutPx);
  assert.ok(later.pile && half.pile && later.pile.rx > half.pile.rx);
  assert.ok(later.origin.y > half.origin.y);
  // Not a stick: a burner keeps its own drawing.
  assert.equal(incenseStickArt(place('tools:incense-burner'), 30, 30, T0), null);
});

test('offering reminders are off unless chosen, then one a day at the chosen time', () => {
  assert.equal(DEFAULT_SETTINGS.offerings, false);
  assert.equal(normalizeSettings({}).offerings, false);
  const now = new Date(T0);
  const roses = { ...place('herbs:rose', 'sprig', at(0)), altarObjectId: 'r1' };
  const water = { ...setOffering(place('vessels:bowl'), 'water', 'Moon water', at(0)), altarObjectId: 'w1' };
  const doc = { ...emptyDocument(), objects: [roses, water] };
  const altar = { ...altarDataFromDocument(doc, 'Brigid', at(0)), id: 'alt-1', name: 'Brigid' };
  const due = altarOfferingsDue([altar], now);
  assert.deepEqual(due.map((d) => d.objectId), ['w1', 'r1']);
  const off = { ...DEFAULT_SETTINGS, rituals: false };
  assert.equal(buildSchedule(off, [], now, 60, [], due).length, 0);
  const on = buildSchedule({ ...off, offerings: true, offeringsAt: 18 * 60 }, [], now, 60, [], due);
  assert.equal(on.length, 2);
  assert.ok(on.every((r) => r.kind === 'offering' && r.at.getHours() === 18 && r.url === '/altar/alt-1'));
  assert.equal(on[0].body, 'The moon water on your Brigid altar is low.');
  assert.ok(on[0].at.getTime() >= due[0].dueAt);
});
