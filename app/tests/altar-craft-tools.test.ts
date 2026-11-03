// The pendulum, the mortar and pestle, the bolline, the cauldron, crystals
// charging and the crystal grid, and drawing from a deck on the altar
// (lib/altar/craftTools.ts), and scrying in the mirror (workings/scrying.ts).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { chargeOf } from '../src/lib/altar/charge.ts';
import { cordsOf, cordState, tieCord } from '../src/lib/altar/cord.ts';
import {
  activateGrid,
  addToMortar,
  askPendulum,
  blendItem,
  blendName,
  calibrationProblem,
  chargingGlow,
  chargingOf,
  cutCord,
  cuttableCords,
  deckKindOf,
  drawSpot,
  emptyMortar,
  encodeCalibration,
  fillForScrying,
  finishCharging,
  gridLines,
  gridOf,
  gridProblem,
  grindMortar,
  hasCraftTools,
  isBolline,
  isCauldron,
  isMortar,
  isPendulum,
  mortarChoices,
  mortarOf,
  pendulumLine,
  pendulumReading,
  readCalibration,
  releaseGrid,
  SIMMER_MS,
  simmeredDry,
  simmerOf,
  simmerSteam,
  startCharging,
  startSimmer,
  stopSimmer,
  swingAt,
  takeFromMortar,
  USUAL_CALIBRATION,
} from '../src/lib/altar/craftTools.ts';
import { offeringOf } from '../src/lib/altar/offerings.ts';
import { readRite } from '../src/lib/altar/toolRites.ts';
import { scryingEntry, scryingJournalAnswers, scryLine, scryVessel } from '../src/lib/altar/workings/scrying.ts';
import { emptyDocument, type AltarDocument } from '../src/lib/altar/snapshot.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { AT_ALTAR } from '../src/lib/covens/altarActions.ts';
import { actionOf } from '../src/lib/covens/stepActions.ts';

const NOW = '2026-11-03T20:00:00.000Z';
const T = Date.parse(NOW);
const at = (ms: number) => new Date(T + ms).toISOString();
const tool = (name: string, x = 0.5, y = 0.5): SavedObject => ({ type: 'tool', tool: name, imagePath: `../assets/altar/objects/tools/${name}/${name}.png`, leftPercent: x, topPercent: y, sizePercent: 0.08 });
const stone = (id: string, x: number, y: number): SavedObject => ({ type: 'crystal', crystal: 'clear-quartz', label: 'Clear Quartz', altarObjectId: id, leftPercent: x, topPercent: y, sizePercent: 0.06 });
const cauldron = (): SavedObject => ({ type: 'vessel', vessel: 'cauldron', imagePath: '../assets/altar/objects/vessels/cauldron/cauldron.png', altarObjectId: 'pot', leftPercent: 0.5, topPercent: 0.6, sizePercent: 0.12 });

test('the tools are known by their art or name', () => {
  assert.ok(isPendulum(tool('pendulum')));
  assert.ok(isMortar(tool('mortar-and-pestle')));
  assert.ok(isBolline(tool('boline')));
  assert.ok(isCauldron(cauldron()));
  assert.equal(deckKindOf(tool('tarot-deck')), 'tarot');
  assert.equal(deckKindOf(tool('rune-bag')), 'runes');
  assert.equal(deckKindOf(tool('ogham-staves')), 'ogham');
  assert.equal(deckKindOf(tool('chalice')), null);
  assert.ok(hasCraftTools(tool('scrying-mirror')));
  assert.ok(!hasCraftTools(tool('chalice')));
});

test('the pendulum is calibrated once, each answer its own swing, and kept as a string', () => {
  assert.equal(calibrationProblem({ yes: 'clockwise' }), 'Choose a swing for yes, no and maybe.');
  assert.equal(calibrationProblem({ yes: 'clockwise', no: 'clockwise', maybe: 'side-to-side' }), 'Give each answer a swing of its own.');
  assert.equal(calibrationProblem(USUAL_CALIBRATION), null);
  assert.deepEqual(readCalibration(encodeCalibration(USUAL_CALIBRATION)), USUAL_CALIBRATION);
  assert.deepEqual(readCalibration(USUAL_CALIBRATION), USUAL_CALIBRATION);
  assert.equal(readCalibration('{"yes":"clockwise","no":"clockwise","maybe":"to-and-fro"}'), null);
  assert.equal(readCalibration('not json'), null);
  assert.equal(readCalibration(null), null);
});

test('the pendulum answers in the swing calibrated for it, and is kept as a reading', () => {
  assert.deepEqual(askPendulum(USUAL_CALIBRATION, () => 0.1), { answer: 'yes', swing: 'to-and-fro' });
  assert.deepEqual(askPendulum(USUAL_CALIBRATION, () => 0.5), { answer: 'no', swing: 'side-to-side' });
  assert.deepEqual(askPendulum(USUAL_CALIBRATION, () => 0.9), { answer: 'maybe', swing: 'clockwise' });
  assert.equal(pendulumLine(' Should I go? ', 'no', 'side-to-side'), 'Asked the pendulum “Should I go?”: it swung side to side, no.');
  const r = pendulumReading('Should I go?', 'yes', 'to-and-fro', new Date(T));
  assert.equal(r.method, 'pendulum');
  assert.deepEqual(r.drawn, ['Yes']);
  assert.match(r.cameUp, /towards and away from you: Yes/);
  assert.ok(r.lookBack > r.date);
  // A clockwise swing goes round one way, anticlockwise the other.
  assert.ok(swingAt('clockwise', 0.25).x > 0 && swingAt('anticlockwise', 0.25).x < 0);
  assert.equal(swingAt('to-and-fro', 0.3).x, 0);
});

test('the mortar takes herbs once each, grinds them, and the blend becomes an apothecary item', () => {
  let m = tool('mortar-and-pestle');
  m = addToMortar(m, { label: 'Rosemary', herb: 'rosemary' }, NOW);
  m = addToMortar(m, { label: 'rosemary' }, NOW);
  m = addToMortar(m, { label: 'Frankincense', type: 'incense' }, NOW);
  m = addToMortar(m, { label: 'Bay' }, NOW);
  assert.deepEqual(mortarOf(m).items.map((i) => i.label), ['Rosemary', 'Frankincense', 'Bay']);
  assert.equal(grindMortar(tool('mortar-and-pestle'), NOW).livingState, undefined, 'nothing to grind');
  m = grindMortar(m, at(1000));
  assert.equal(mortarOf(m).ground, true);
  assert.equal(mortarOf(takeFromMortar(m, 'bay', NOW)).ground, false, 'changed, so not ground');
  assert.equal(blendName(mortarOf(m).items), 'Rosemary, frankincense and bay blend');
  const loose = blendItem(mortarOf(m).items, 'loose');
  assert.equal(loose.type, 'herb-mix');
  assert.equal(loose.ingredients.length, 3);
  assert.equal(blendItem(mortarOf(m).items, 'sachet', 'Sleep', 'Rest').type, 'sachet');
  assert.equal(mortarOf(emptyMortar(m, NOW)).items.length, 0);
  const choices = mortarChoices([{ type: 'herb', label: 'Sage', herb: 'sage' }, tool('chalice')], [{ name: 'Sage' }, { name: 'Lavender' }]);
  assert.deepEqual(choices.map((c) => c.label), ['Sage', 'Lavender']);
});

test('the bolline cuts a tied cord by hand', () => {
  const item = builtInCabinet.find((i) => i.id === 'candles:purple-candle')!;
  const form = item.forms.find((f) => f.form === 'chime-spell')!;
  const chime = (id: string, left: number): SavedObject => ({ ...objectFromForm(item, form, [], NOW), altarObjectId: id, leftPercent: left, topPercent: 0.7 });
  const doc: AltarDocument = tieCord({ ...emptyDocument(), objects: [chime('a', 0.4), chime('b', 0.6)] }, 'a', 'b', { height: 0.5 }, NOW);
  const id = cordsOf(doc)[0].id;
  assert.equal(cuttableCords(doc, T).length, 1);
  const cut = cutCord(doc, id, at(1000));
  assert.equal(cordState(cut, cordsOf(cut)[0], T + 2000).status, 'cut');
  assert.equal(cuttableCords(cut, T + 2000).length, 0);
  assert.equal(cutCord(cut, id, at(3000)), cut, 'already cut');
});

test('the cauldron simmers for a while and goes dry, or is filled with water to scry', () => {
  const pot = startSimmer(cauldron(), ['Orange peel', 'Cinnamon', 'Cinnamon'], NOW);
  assert.deepEqual(simmerOf(pot)?.items, ['Orange peel', 'Cinnamon']);
  assert.ok(simmerSteam(pot, T + 10_000) > 0.25 && simmerSteam(pot, T + 10_000) < 1);
  assert.equal(simmerSteam(pot, T + 120_000), 1);
  assert.equal(simmerSteam(pot, T + SIMMER_MS + 1), 0);
  assert.ok(simmeredDry(pot, T + SIMMER_MS + 1));
  assert.equal(simmerOf(stopSimmer(pot, NOW)), null);
  assert.equal(offeringOf(fillForScrying(cauldron(), NOW))?.kind, 'water');
});

test('a crystal set to charge glows more as it sits, and is kept as a charge when taken up', () => {
  const s = startCharging(stone('q', 0.5, 0.5), 'sun', NOW);
  assert.equal(chargingOf(s)?.how, 'sun');
  assert.equal(chargingGlow(s, T), 0);
  assert.ok(Math.abs(chargingGlow(s, T + 30 * 60_000) - 0.5) < 1e-9);
  assert.equal(chargingGlow(s, T + 3 * 3_600_000), 1);
  const cup = tool('chalice');
  assert.equal(startCharging(cup, 'sun', NOW), cup, 'only crystals');
  const done = finishCharging(s, at(3_600_000));
  assert.equal(chargingOf(done), null);
  assert.ok((chargeOf(done, T + 3_600_000)?.strength ?? 0) > 0.9);
});

test('a crystal grid needs three stones, joins them with lines, and rests', () => {
  const stones = [stone('a', 0.3, 0.4), stone('b', 0.7, 0.4), stone('c', 0.5, 0.8)];
  assert.ok(gridProblem(stones.slice(0, 2)));
  assert.equal(gridProblem(stones), null);
  const extra = activateGrid({}, [...stones, tool('wand')], NOW, 'me');
  assert.deepEqual(gridOf(extra)?.ids, ['a', 'b', 'c']);
  const doc = { objects: stones, extra };
  assert.equal(gridLines(doc).length, 3, 'a triangle');
  const five = [...stones, stone('d', 0.5, 0.2), stone('e', 0.5, 0.5)];
  const lines5 = gridLines({ objects: five, extra: activateGrid({}, five, NOW) });
  assert.equal(lines5.length, 8, 'a ring of four and four spokes from the middle stone');
  assert.equal(gridOf(releaseGrid(extra)), null);
  assert.equal(activateGrid({}, stones.slice(0, 2), NOW).grid, undefined);
});

test('a card is laid beside its deck', () => {
  const deck = tool('tarot-deck', 0.3, 0.5);
  const spot = drawSpot(deck);
  assert.ok(spot.cx > 0.3);
  assert.ok(drawSpot(deck, 1).cx > spot.cx);
  assert.ok(drawSpot(tool('tarot-deck', 0.8, 0.5)).cx < 0.8);
});

test('scrying in the mirror or the cauldron is kept as such', () => {
  assert.equal(scryVessel('mirror'), 'mirror');
  assert.equal(scryVessel('nonsense'), 'bowl');
  assert.equal(scryLine('mirror', 9.6), 'Scried with the scrying mirror for 10 minutes.');
  assert.equal(scryLine('bowl', 0.2), 'Scried with the water bowl for 1 minute.');
  const notes = { saw: 'A road', symbols: '', feelings: '' };
  assert.equal(scryingJournalAnswers(notes, { minutes: 5, moonPhase: 'Full Moon', date: new Date(T), vessel: 'mirror' }).title, 'Mirror scrying');
  assert.equal(scryingJournalAnswers(notes, { minutes: 5, moonPhase: 'Full Moon', date: new Date(T) }).title, 'Water-bowl scrying');
  assert.equal(scryingEntry(notes, { altarId: 'x', minutes: 5, satMinutes: 5, moonPhase: '', at: NOW, vessel: 'cauldron' }).vessel, 'cauldron');
  assert.equal(scryingEntry(notes, { altarId: 'x', minutes: 5, satMinutes: 5, moonPhase: '', at: NOW }).vessel, undefined);
});

test('the new tools travel on the rite broadcast and have their rows in the ritual builder', () => {
  assert.equal(readRite({ from: 'them', kind: 'grind', key: 'm' }, 'me')?.kind, 'grind');
  assert.equal(readRite({ from: 'them', kind: 'nonsense' }, 'me'), null);
  for (const deed of ['pendulum', 'scry_mirror', 'grind', 'cut_cord', 'simmer', 'grid', 'draw_deck']) {
    const row = AT_ALTAR.find((a) => a.deed === deed);
    assert.ok(row, deed);
    assert.ok(actionOf(row!.action), row!.action);
  }
});
