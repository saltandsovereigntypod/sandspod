// Potted plants: the Plants drawer (only kinds with a picture), the stage she
// chooses, its details and photo, watering due dates and how far it droops
// (gently, never gone), harvests and the care journal with the moon, the
// notes, moon gardening, the Tending note and watering reminders, and the
// same saved shape through a save.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, cabinetSearchAliases, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { appHistoryOf } from '../src/lib/altar/livingState.ts';
import { offeringArt } from '../src/lib/altar/offeringArt.ts';
import { isFreshSprig, offeringOf, perishableItself } from '../src/lib/altar/offerings.ts';
import {
  addJournal,
  canHarvest,
  firstStage,
  harvestPlant,
  isPottedPlant,
  journalOf,
  kindOf,
  moonGardenHint,
  plantNotes,
  plantTitle,
  POTTED_KINDS,
  pottedCabinetItems,
  pottedKind,
  pottedOf,
  removeJournal,
  removePlantPhoto,
  setPlantDetails,
  setPlantPhoto,
  setPlantStage,
  stagesOf,
  thirstLine,
  thirstLook,
  thirstOf,
  waterPlant,
  wateringDue,
  wateringNote,
} from '../src/lib/altar/pottedPlants.ts';
import { harvestSprig } from '../src/lib/altar/pottedSprig.ts';
import { altarDataFromDocument, documentFromAltar, emptyDocument } from '../src/lib/altar/snapshot.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { moonOn } from '../src/lib/craft/green/garden.ts';
import { moonState } from '../src/lib/moon.ts';
import { buildSchedule, DEFAULT_SETTINGS, normalizeSettings } from '../src/lib/reminders/schedule.ts';

const pic = (id: string, stage: string) => `../assets/altar/objects/plants/${id}/${id}-${stage}.png`;
const IMAGES = {
  basil: { young: pic('basil', 'young'), established: pic('basil', 'established'), lush: pic('basil', 'lush') },
  pothos: { young: pic('pothos', 'young'), lush: pic('pothos', 'lush') },
  'snake-plant': { established: pic('snake-plant', 'established') },
  ...Object.fromEntries(['rosemary', 'mint', 'lavender', 'sage', 'thyme'].map((id) => [id, { established: pic(id, 'established') }])),
};

/** Local noon on a day, as an ISO moment. */
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString();
const ms = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

function placed(kind: string, now = at(2026, 10, 1)): SavedObject {
  const item = pottedCabinetItems(IMAGES).find((i) => i.id === `plants:${kind}`)!;
  return objectFromForm(item, item.forms[0], [], now);
}

test('the Plants drawer offers each kind that has a picture, set down at its established stage', () => {
  const items = pottedCabinetItems(IMAGES);
  assert.deepEqual(items.map((i) => i.id), ['plants:snake-plant', 'plants:pothos', 'plants:basil', 'plants:rosemary', 'plants:mint', 'plants:lavender', 'plants:sage', 'plants:thyme']);
  assert.deepEqual(pottedCabinetItems({ basil: IMAGES.basil }).map((i) => i.id), ['plants:basil']);
  assert.ok(items.every((i) => i.category === 'plants'));
  // Pothos has no established picture: the nearest, lush.
  assert.equal(firstStage('pothos', IMAGES), 'lush');
  assert.equal(items.find((i) => i.id === 'plants:pothos')!.forms[0].image, pic('pothos', 'lush'));
  assert.deepEqual(stagesOf('basil', IMAGES), ['young', 'established', 'lush']);
  // Without pictures, none (as the built cabinet is until the painter's pictures land).
  assert.deepEqual(pottedCabinetItems({}), []);
  assert.equal(builtInCabinet.filter((i) => i.category === 'plants').length, pottedCabinetItems().length);
  // Found by "houseplant" and by what it's kept for.
  assert.ok(cabinetSearchAliases(items[0]).includes('houseplant'));
  assert.ok(items[0].keywords.includes('protection'));
  assert.match(items[0].description ?? '', /protection/);
  assert.match(items.find((i) => i.id === 'plants:basil')!.description ?? '', /Living Library: protection, prosperity/);
});

test('a pot is a plant: its herb links its Living Library page, and it is never an offering', () => {
  const basil = placed('basil');
  assert.equal(basil.type, 'plant');
  assert.equal(basil.form, 'basil');
  assert.equal(basil.herb, 'basil');
  assert.equal(basil.label, 'Basil');
  assert.ok(isPottedPlant(basil));
  const snake = placed('snake-plant');
  assert.equal(snake.herb, '');
  assert.equal(kindOf(snake)?.name, 'Snake Plant');
  // A plant named Rose is still a plant.
  const rose = setPlantDetails(placed('pothos'), { name: 'Rose', place: '', light: '', waterEvery: 7 }, at(2026, 10, 1));
  assert.equal(perishableItself(rose), null);
  assert.equal(offeringOf(rose), null);
  // Two basil pots are two plants.
  const second = placed('basil');
  assert.notEqual(second.altarObjectId, basil.altarObjectId);
});

test('each kind waters by its own default', () => {
  const every = Object.fromEntries(POTTED_KINDS.map((k) => [k.id, k.waterEvery]));
  assert.deepEqual(every, { 'snake-plant': 18, pothos: 7, basil: 2, rosemary: 5, mint: 2, lavender: 7, sage: 5, thyme: 5 });
  assert.equal(pottedOf(placed('snake-plant')).waterEvery, 18);
  assert.deepEqual(POTTED_KINDS.filter(canHarvest).map((k) => k.id), ['basil', 'rosemary', 'mint', 'lavender', 'sage', 'thyme']);
});

test('details: name, place, light, how often, and the label it carries', () => {
  let plant = placed('pothos');
  plant = setPlantDetails(plant, { name: ' Margaret ', place: 'the landing', light: 'Medium light', waterEvery: 9, lastWatered: '2026-09-30' }, at(2026, 10, 1));
  const p = pottedOf(plant);
  assert.equal(p.name, 'Margaret');
  assert.equal(p.place, 'the landing');
  assert.equal(p.light, 'Medium light');
  assert.equal(p.waterEvery, 9);
  assert.equal(p.lastWatered, '2026-09-30');
  assert.equal(plant.label, 'Margaret the pothos');
  assert.equal(plantTitle(plant), 'Margaret the pothos');
  // Out-of-range intervals are kept to 1–60 days; a bad date is dropped.
  const odd = setPlantDetails(plant, { name: 'Margaret', place: '', light: '', waterEvery: 400, lastWatered: 'last week' }, at(2026, 10, 2));
  assert.equal(pottedOf(odd).waterEvery, 60);
  assert.equal(pottedOf(odd).lastWatered, '');
  assert.ok(appHistoryOf(plant).some((e) => e.text === 'Named it Margaret.'));
});

test('she chooses the stage, and its picture follows', () => {
  let plant = placed('basil');
  assert.equal(pottedOf(plant).stage, 'established');
  plant = setPlantStage(plant, 'lush', at(2026, 10, 2), IMAGES);
  assert.equal(pottedOf(plant).stage, 'lush');
  assert.equal(plant.imagePath, pic('basil', 'lush'));
  // A stage with no picture changes nothing.
  const pothos = placed('pothos');
  assert.equal(setPlantStage(pothos, 'established', at(2026, 10, 2), IMAGES), pothos);
  // Read from the picture when nothing is saved.
  assert.equal(pottedOf({ ...placed('basil'), imagePath: pic('basil', 'young') }).stage, 'young');
});

test('a photo of the real plant, and taking it away', () => {
  let plant = setPlantPhoto(placed('mint'), 'https://example.test/u/plant-photos/mint.jpg', 'u/plant-photos/mint.jpg', at(2026, 10, 1));
  assert.equal(pottedOf(plant).photo, 'https://example.test/u/plant-photos/mint.jpg');
  assert.equal(pottedOf(plant).storagePath, 'u/plant-photos/mint.jpg');
  plant = removePlantPhoto(plant, at(2026, 10, 2));
  assert.equal(pottedOf(plant).photo, '');
});

test('watering: due on its day, drooping gradually after, never gone, perking up when watered', () => {
  let plant = placed('pothos');
  // Not known yet: nothing droops, nothing nags.
  assert.equal(thirstOf(plant, ms(2026, 10, 20)).level, 'unknown');
  assert.match(thirstLine(plant, ms(2026, 10, 20)), /Mark it watered/);
  plant = waterPlant(plant, at(2026, 10, 1, 9));
  assert.equal(pottedOf(plant).lastWatered, '2026-10-01');
  const fine = thirstOf(plant, ms(2026, 10, 5));
  assert.equal(fine.level, 'fine');
  assert.equal(fine.dueOn, '2026-10-08');
  assert.equal(fine.inDays, 3);
  assert.equal(fine.droop, 0);
  assert.equal(thirstLine(plant, ms(2026, 10, 7)), 'Would like water tomorrow (every 7 days).');
  // On its day it would like water, and begins, just, to droop.
  const due = thirstOf(plant, ms(2026, 10, 8, 0) + 60_000);
  assert.equal(due.level, 'due');
  assert.equal(due.inDays, 0);
  // Pothos (7 days) droops over four days past its day.
  const half = thirstOf(plant, ms(2026, 10, 10, 0));
  assert.equal(half.level, 'thirsty');
  assert.equal(half.droop, 0.5);
  const later = thirstOf(plant, ms(2026, 10, 30));
  assert.equal(later.level, 'drooping');
  assert.equal(later.droop, 1);
  // Drawn gently: a little duller and lower, never more than this.
  const look = thirstLook(plant, ms(2027, 1, 1))!;
  assert.deepEqual(look, { tint: { sepia: 0.22, saturate: 0.68, brightness: 0.92 }, sag: 0.93, widen: 1.03 });
  assert.equal(thirstLook(plant, ms(2026, 10, 5)), null);
  // Watered, it perks up.
  const watered = waterPlant(plant, at(2026, 10, 30, 18));
  assert.equal(thirstOf(watered, ms(2026, 10, 30, 19)).level, 'fine');
  assert.equal(thirstLook(watered, ms(2026, 10, 30, 19)), null);
});

test('a thirsty plant is drawn sagging and dulled through the offering art; a watered one is not', () => {
  const plant = waterPlant(placed('basil'), at(2026, 10, 1, 9));
  assert.equal(offeringArt(plant, 80, 120, ms(2026, 10, 2)), null);
  const art = offeringArt(plant, 80, 120, ms(2026, 10, 6))!;
  assert.ok(art.tint && art.tint.saturate < 1);
  assert.equal(art.bend!.rotate, 0);
  assert.ok(art.bend!.scaleY < 1 && art.bend!.scaleY >= 0.93);
  assert.equal(art.liquid, null);
  assert.deepEqual(art.petals, []);
});

test('a watering logged for an earlier day never moves "last watered" back', () => {
  let plant = waterPlant(placed('sage'), at(2026, 10, 10));
  plant = addJournal(plant, { kind: 'watered', on: '2026-10-05' }, at(2026, 10, 10, 13));
  assert.equal(pottedOf(plant).lastWatered, '2026-10-10');
  plant = addJournal(plant, { kind: 'watered', on: '2026-10-12' }, at(2026, 10, 12));
  assert.equal(pottedOf(plant).lastWatered, '2026-10-12');
});

test('which plants would like water, and the note that says so', () => {
  const margaret = setPlantDetails(waterPlant(placed('pothos'), at(2026, 10, 1)), { name: 'Margaret', place: '', light: '', waterEvery: 7 }, at(2026, 10, 1));
  const basil = waterPlant(placed('basil'), at(2026, 10, 1));
  const unknown = placed('thyme');
  const altars = [{ id: 'a1', name: 'Kitchen', objects: [margaret, unknown] }, { id: 'a2', name: 'Hearth Altar', objects: [basil] }];
  assert.deepEqual(wateringDue(altars, ms(2026, 10, 2)), []);
  const due = wateringDue(altars, ms(2026, 10, 9));
  assert.deepEqual(due.map((d) => d.who), ['basil', 'Margaret the pothos']);
  assert.equal(wateringNote(due), 'The basil on Hearth Altar would like water. One more plant would too.');
  assert.equal(wateringNote(due.slice(1)), 'Margaret the pothos would like water.');
  assert.equal(wateringNote(due.slice(0, 1), { oneAltar: true }), 'The basil would like water.');
  assert.equal(wateringNote([]), null);
  // Looking ahead, for reminders.
  assert.equal(wateringDue(altars, ms(2026, 10, 2), ms(2026, 10, 9)).length, 2);
});

test('watering reminders are off by default, and come on their day when chosen', () => {
  assert.equal(DEFAULT_SETTINGS.watering, false);
  assert.equal(normalizeSettings({}).watering, false);
  assert.equal(normalizeSettings({ watering: true, wateringAt: 8 * 60 + 30 }).wateringAt, 510);
  const margaret = setPlantDetails(waterPlant(placed('pothos'), at(2026, 10, 1)), { name: 'Margaret', place: '', light: '', waterEvery: 7 }, at(2026, 10, 1));
  const due = wateringDue([{ id: 'a1', name: 'Kitchen', objects: [margaret] }], ms(2026, 10, 2), ms(2026, 10, 20));
  const now = new Date(2026, 9, 2, 12);
  assert.equal(buildSchedule(DEFAULT_SETTINGS, [], now, 60, [], [], [], due).length, 0);
  const on = buildSchedule({ ...DEFAULT_SETTINGS, rituals: false, lookBacks: false, watering: true }, [], now, 60, [], [], [], due);
  assert.equal(on.length, 1);
  assert.equal(on[0].kind, 'watering');
  assert.equal(on[0].body, 'Margaret the pothos would like water.');
  assert.equal(on[0].url, '/altar/a1');
  assert.equal(on[0].at.getTime(), new Date(2026, 9, 8, 9, 0).getTime());
  // Already past its day: the next morning comes round.
  const late = buildSchedule({ ...DEFAULT_SETTINGS, rituals: false, lookBacks: false, watering: true }, [], new Date(2026, 9, 9, 12), 60, [], [], [], due);
  assert.equal(late[0].at.getTime(), new Date(2026, 9, 10, 9, 0).getTime());
});

test('a harvest is logged with its amount, where it went, and the moon', () => {
  const now = at(2026, 10, 24, 20);
  let basil = setPlantDetails(placed('basil'), { name: 'Bramble', place: '', light: '', waterEvery: 2 }, now);
  basil = harvestPlant(basil, { amount: ' a handful ', to: 'working', note: 'For the prosperity jar' }, now);
  const [entry] = journalOf(basil);
  assert.equal(entry.kind, 'harvested');
  assert.equal(entry.amount, 'a handful');
  assert.equal(entry.to, 'working');
  assert.equal(entry.note, 'For the prosperity jar');
  assert.equal(entry.on, '2026-10-24');
  assert.equal(entry.moon, moonState(new Date(now)).name);
  // The houseplants aren't harvested.
  const snake = placed('snake-plant');
  assert.equal(harvestPlant(snake, { to: 'altar' }, now), snake);
});

test('a harvest set on the altar is a fresh sprig of that herb, beside the pot, ageing as a sprig does', () => {
  const now = at(2026, 10, 24, 20);
  const basil = { ...setPlantDetails(placed('basil'), { name: 'Bramble', place: '', light: '', waterEvery: 2 }, now), leftPercent: 0.4, topPercent: 0.6 };
  const sprig = harvestSprig(basil, [basil], now)!;
  assert.equal(sprig.type, 'herb');
  assert.equal(sprig.herb, 'basil');
  assert.equal(sprig.form, 'sprig');
  assert.equal(sprig.imagePath, '../assets/altar/objects/herbs/basil/basil-sprig.png');
  assert.ok(isFreshSprig(sprig));
  assert.equal(offeringOf(sprig)?.kind, 'flowers');
  assert.ok(Number(sprig.zIndex) > Number(basil.zIndex));
  assert.equal(harvestSprig(placed('pothos'), [], now), null);
});

test('the care journal: dated entries with that day’s moon, newest first, and removable', () => {
  const now = new Date(2026, 9, 24, 20);
  let plant = placed('rosemary');
  plant = addJournal(plant, { kind: 'repotted', on: '2026-10-03', note: 'Into the terracotta pot' }, now.toISOString());
  plant = addJournal(plant, { kind: 'new-leaf', on: '2026-10-20' }, now.toISOString());
  plant = addJournal(plant, { kind: 'fed', on: '2026-10-20' }, now.toISOString());
  plant = addJournal(plant, { kind: 'cutting', on: 'not a date' }, now.toISOString());
  const list = journalOf(plant);
  assert.deepEqual(list.map((e) => [e.on, e.kind]), [['2026-10-24', 'cutting'], ['2026-10-20', 'fed'], ['2026-10-20', 'new-leaf'], ['2026-10-03', 'repotted']]);
  // A past day keeps that evening's moon; today keeps the moment's.
  assert.equal(list[3].moon, moonOn('2026-10-03', now));
  assert.equal(list[0].moon, moonState(now).name);
  assert.equal(list[3].note, 'Into the terracotta pot');
  assert.equal(list[3].amount, undefined);
  plant = removeJournal(plant, list[1].id, now.toISOString());
  assert.equal(journalOf(plant).length, 3);
});

test('notes: folk lore for the houseplants, the Library for the herbs, and honest pet safety', () => {
  const snake = plantNotes(placed('snake-plant'))!;
  assert.match(snake.folk, /protection/);
  assert.ok(snake.toxic);
  assert.match(snake.pets, /cats and dogs/);
  assert.match(snake.pets, /saponins/);
  const pothos = plantNotes(placed('pothos'))!;
  assert.match(pothos.folk, /prosperity and steady growth/);
  assert.match(pothos.pets, /calcium oxalate/);
  assert.ok(pothos.toxic);
  const basil = plantNotes(placed('basil'))!;
  assert.equal(basil.herb, 'basil');
  assert.match(basil.folk, /Living Library/);
  assert.equal(basil.toxic, false);
  assert.ok(pottedKind('lavender')!.toxic);
  assert.ok(pottedKind('mint')!.toxic);
  for (const kind of POTTED_KINDS) assert.ok(!/!/.test(kind.pets + kind.folk + kind.waterNote), kind.id);
});

test('moon gardening: one line from Green’s four quarters, when the quarter has a task for a pot', () => {
  const basil = placed('basil');
  const snake = placed('snake-plant');
  let rest = null;
  let leaf = null;
  for (let d = 0; d < 30 && (!rest || !leaf); d++) {
    const day = new Date(2026, 9, 1 + d, 21);
    const f = moonState(day).fraction;
    if (f >= 0.8 && f < 0.95 && !rest) rest = day;
    if (f >= 0.05 && f < 0.2 && !leaf) leaf = day;
  }
  assert.match(moonGardenHint(basil, rest!) ?? '', /^Moon gardening: last quarter to new moon, by the old rule a time to harvest herbs and roots to dry or store\.$/);
  assert.match(moonGardenHint(snake, rest!) ?? '', /prune and cut back/);
  assert.match(moonGardenHint(snake, leaf!) ?? '', /take softwood cuttings/);
});

test('the saved shape survives a save and load, and fields it doesn’t know are kept', () => {
  const now = at(2026, 10, 24);
  let plant = setPlantDetails(waterPlant(placed('lavender'), now), { name: 'Hazel', place: 'Bedroom sill', light: 'Bright, direct sun', waterEvery: 6 }, now);
  // Something newer code added, inside and beside the plant's state.
  const state = JSON.parse(String(plant.livingState));
  state.app.potted.repottedInto = 'clay';
  state.app.potted.journal[0].weather = 'rain';
  state.app.other = { kept: true };
  plant = { ...plant, livingState: JSON.stringify(state) };
  plant = harvestPlant(plant, { amount: 'a bundle', to: 'altar' }, now);
  const doc = { ...emptyDocument(), objects: [plant] };
  const back = documentFromAltar({ id: 'x', name: 'Bedroom', ...altarDataFromDocument(doc, 'Bedroom', now) }).objects[0];
  const saved = JSON.parse(String(back.livingState));
  assert.equal(saved.app.potted.repottedInto, 'clay');
  assert.equal(saved.app.potted.journal[0].weather, 'rain');
  assert.deepEqual(saved.app.other, { kept: true });
  assert.deepEqual(
    Object.keys(saved.app.potted).sort(),
    ['journal', 'kind', 'lastWatered', 'light', 'name', 'place', 'repottedInto', 'waterEvery'].sort(),
  );
  assert.equal(saved.app.potted.kind, 'lavender');
  assert.equal(pottedOf(back).name, 'Hazel');
  assert.equal(journalOf(back)[0].kind, 'harvested');
  assert.equal(journalOf(back)[0].to, 'altar');
  assert.equal(back.type, 'plant');
  assert.equal(back.form, 'lavender');
});
