// Offering what's on the altar to a presence, and the altar written down for the Grimoire.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { altarRecordBlocks, describeObject, lastRecordedAt, petitionsToRecord, recordGroupOf } from '../src/lib/altar/altarRecord.ts';
import { offeringsOf, OFFERING_TYPES, type OfferingInput } from '../src/lib/altar/devotion.ts';
import { carveCandle, appHistoryOf } from '../src/lib/altar/livingState.ts';
import { altarGifts, giftKind, giveFromAltar, offeredToOf, offeringItemNames, offeringLine, withGiftTypes } from '../src/lib/altar/offerFromAltar.ts';
import { agingDeityOffering, deityOfferingKind } from '../src/lib/altar/offerings.ts';
import { finishPetition, newPetition, petitionObject, type Petition } from '../src/lib/altar/petitions.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { recordTended, newRecord, normalizeRecord } from '../src/lib/tend/model.ts';

const placed = '2026-10-20T09:00:00.000Z';
const state = (extra: Record<string, unknown> = {}) => JSON.stringify({ version: 1, createdAt: placed, updatedAt: placed, ...extra });
const obj = (o: SavedObject): SavedObject => ({ leftPercent: 0.5, topPercent: 0.5, sizePercent: 0.09, zIndex: '3', livingState: state(), ...o });

const apollo = obj({ type: 'deity', deity: 'apollo', label: 'Apollo Statue', altarObjectId: 'apollo', leftPercent: 0.5, topPercent: 0.6, sizePercent: 0.15 });
const honeycomb = obj({ type: 'offering', form: 'honeycomb', label: 'Honeycomb', imagePath: '../assets/altar/objects/offerings/honeycomb/honeycomb.png', altarObjectId: 'comb', leftPercent: 0.2 });
const candle = obj({ type: 'candle', form: 'taper', color: 'gold', label: 'Gold Taper Candle', altarObjectId: 'gold', lit: 'true' });
const crystal = obj({ type: 'crystal', label: 'Citrine', altarObjectId: 'citrine' });
const cloth = obj({ type: 'cloth', label: 'Altar Cloth', altarObjectId: 'cloth' });
const wine = obj({
  type: 'vessel',
  vessel: 'chalice',
  label: 'Chalice',
  altarObjectId: 'chalice',
  livingState: state({ app: { offering: { kind: 'drink', label: 'red wine', since: placed } } }),
});
const altar = [cloth, apollo, honeycomb, candle, crystal, wine];

const input = (over: Partial<OfferingInput> = {}): OfferingInput => ({
  types: [],
  supports: [],
  customItems: '',
  intention: 'Thanks for the light returning',
  message: 'Phoebus, take this sweetness.',
  status: 'Offered',
  customStatus: '',
  response: '',
  responseNotes: '',
  occurredAt: '2026-10-27T10:00:00.000Z',
  ...over,
});

test('everything on the altar but the presence itself and its cloth can be given, by its picture', () => {
  const gifts = altarGifts(altar, apollo);
  assert.deepEqual(gifts.map((g) => g.id), ['comb', 'gold', 'citrine', 'chalice']);
  const comb = gifts[0];
  assert.equal(comb.label, 'Honeycomb');
  assert.equal(comb.imagePath, honeycomb.imagePath);
  assert.equal(comb.kind, 'honey');
  assert.equal(comb.offeringType, 'Food');
  assert.equal(gifts[1].offeringType, 'Candles');
  assert.equal(gifts[2].offeringType, 'Crystals');
  // A vessel is named with what it holds, and counts as a drink.
  assert.equal(gifts[3].label, 'Chalice of red wine');
  assert.equal(gifts[3].offeringType, 'Drink');
  assert.equal(giftKind(honeycomb), 'honey');
});

test('choosing things fills in the kinds of offering, keeping what was picked', () => {
  const gifts = altarGifts(altar, apollo);
  assert.deepEqual(withGiftTypes(['Song or music'], [gifts[0], gifts[3]], OFFERING_TYPES), ['Food', 'Drink', 'Song or music']);
});

test('an offering from the altar keeps the real things, marks them offered, and can set them at the feet', () => {
  const gifts = altarGifts(altar, apollo).filter((g) => g.id === 'comb');
  const at = '2026-10-27T10:00:00.000Z';
  const { objects, line } = giveFromAltar(altar, 1, input({ id: 'o1' }), gifts, { atFeet: true }, at);
  assert.equal(line, 'Honeycomb, offered to Apollo.');
  const [offering] = offeringsOf(objects[1], at);
  assert.equal(offering.id, 'o1');
  assert.deepEqual(offering.items[0], { id: 'comb', label: 'Honeycomb', fromAltar: true, imagePath: honeycomb.imagePath, form: 'honeycomb', objectType: 'offering', kind: 'honey' });
  assert.deepEqual(offeringItemNames(offering), ['Honeycomb']);
  // The honeycomb remembers whom it was given to, in its own story.
  assert.deepEqual(offeredToOf(objects[2]), { name: 'Apollo', at, presenceId: 'apollo', offeringId: 'o1' });
  assert.equal(appHistoryOf(objects[2]).at(-1)?.text, 'Offered to Apollo.');
  // At the statue's feet: under it, in front of it.
  assert.ok(Math.abs(Number(objects[2].leftPercent) - Number(apollo.leftPercent)) < 0.1);
  assert.ok(Number(objects[2].zIndex) > Number(apollo.zIndex));
  // Nothing else moved.
  assert.equal(objects[3], candle);
  // A honeycomb ages as honey does, whatever its name says.
  assert.equal(deityOfferingKind(offering), 'honey');
  assert.equal(agingDeityOffering([offering], Date.parse(at) + 3 * 86_400_000)?.kind, 'honey');
});

test('without "at the feet" the things stay where they are', () => {
  const gifts = altarGifts(altar, apollo).filter((g) => g.id === 'comb' || g.id === 'chalice');
  const { objects, line } = giveFromAltar(altar, 1, input({ customItems: 'a song' }), gifts, {}, '2026-10-27T10:00:00.000Z');
  assert.equal(objects[2].leftPercent, honeycomb.leftPercent);
  assert.equal(line, 'Honeycomb, Chalice of red wine and a song, offered to Apollo.');
  assert.equal(offeringLine([], 'Hekate'), 'An offering, offered to Hekate');
});

test('every thing on the altar is grouped and written down with its words', () => {
  const now = new Date('2026-10-27T12:00:00.000Z');
  const carved = carveCandle(candle, 'Sol Invictus', '2026-10-21T20:00:00.000Z');
  const given = giveFromAltar(altar, 1, input({ id: 'o1' }), altarGifts(altar, apollo).filter((g) => g.id === 'comb'), {}, '2026-10-27T10:00:00.000Z').objects;
  assert.equal(recordGroupOf(apollo), 'presences');
  assert.equal(recordGroupOf(honeycomb), 'offerings');
  assert.equal(recordGroupOf(wine), 'offerings');
  assert.equal(recordGroupOf(crystal), 'natural');
  assert.equal(recordGroupOf(cloth), 'other');
  const date = (iso: string) => iso.slice(0, 10);
  const c = describeObject(carved, now, date);
  assert.match(c.line, /^Gold Taper Candle · Color: gold · Form: taper · Lit/);
  assert.match(c.line, /Placed 2026-10-20/);
  assert.deepEqual(c.writing, ['Carved 2026-10-21: “Sol Invictus”']);
  const statue = describeObject(given[1], now, date);
  assert.match(statue.line, /1 offering/);
  assert.match(statue.writing[0], /^Offered 2026-10-27: Honeycomb · for Thanks for the light returning · Offered · “Phoebus, take this sweetness.”/);
  const comb = describeObject(given[2], now, date);
  assert.match(comb.line, /Offered to Apollo 2026-10-27/);

  const blocks = altarRecordBlocks([...given.slice(0, 3), carved, ...given.slice(4)], { now, altarId: null, formatDate: date });
  const headings = blocks.filter((b) => b.type === 'heading').map((b) => b.content);
  assert.deepEqual(headings, ['Deities and Statues', 'Candles', 'Offerings', 'Crystals and Herbs', 'Other Items']);
  assert.equal(blocks[1].type, 'ingredient_list');
});

test('the petitions go in: open ones and those finished since the last record, with their words and how they went', () => {
  const now = new Date('2026-10-27T12:00:00.000Z');
  const date = (iso: string) => iso.slice(0, 10);
  const written = new Date('2026-10-10T20:00:00.000Z');
  const open: Petition = { ...newPetition('alt1', { title: 'Steady work', words: 'Let the right work find me.', intention: 'Money', timing: 'now' }, written), place: 'candle', candleId: 'gold' };
  const burned = finishPetition(newPetition('alt1', { title: 'Old grief', words: 'I let it go.', intention: '', timing: 'now' }, written), 'burned', new Date('2026-10-25T21:00:00.000Z'));
  const longAgo = finishPetition(newPetition('alt1', { title: 'Long ago', words: '', intention: '', timing: 'now' }, written), 'buried', new Date('2026-10-12T21:00:00.000Z'));
  const other = newPetition('alt2', { title: 'Elsewhere', words: '', intention: '', timing: 'now' }, written);
  const entries = [
    { id: 'p1', data: open },
    { id: 'p2', data: burned },
    { id: 'p3', data: longAgo },
    { id: 'p4', data: other },
  ];
  assert.deepEqual(petitionsToRecord(entries, 'alt1', now, '2026-10-20T00:00:00.000Z').map((e) => e.id), ['p1', 'p2']);
  // Without a record before, the last month.
  assert.deepEqual(petitionsToRecord(entries, 'alt1', now).map((e) => e.id), ['p1', 'p2', 'p3']);

  let tending = recordTended(newRecord({ key: 'petition:p1', kind: 'petition', title: 'Steady work', source: '', href: '' }), new Date('2026-10-15T20:00:00.000Z'), 'Still holding it.');
  tending = recordTended(tending, new Date('2026-10-22T20:00:00.000Z'));
  assert.equal(tending.times, 2);
  assert.equal(normalizeRecord(tending)?.times, 2);

  const paper = petitionObject(open, 'p1', altar, written.toISOString(), candle);
  const history = [{ data: { altarId: 'alt1', text: 'Recorded in your Grimoire.', at: '2026-10-20T00:00:00.000Z', recorded: true } }, { data: { altarId: 'alt1', text: 'x', at: '2026-10-26T00:00:00.000Z' } }];
  const since = lastRecordedAt(history, 'alt1');
  assert.equal(since, '2026-10-20T00:00:00.000Z');
  const blocks = altarRecordBlocks([...altar, paper], { now, altarId: 'alt1', petitions: entries, tendings: [tending], since, formatDate: date });
  const at = blocks.findIndex((b) => b.type === 'heading' && b.content === 'Petitions');
  assert.ok(at > 0);
  const [first, words, second, secondWords] = blocks.slice(at + 1);
  assert.equal(first.type, 'text');
  assert.equal(
    first.content,
    ['Steady work', 'Folded under Gold Taper Candle', 'Written 2026-10-10', 'For: Money', 'Candle: Gold Taper Candle · Color: gold · lit', 'Tended 2 times, last 2026-10-22', '2026-10-15: Still holding it.'].join('\n'),
  );
  assert.deepEqual(words, { type: 'quote', content: 'Let the right work find me.' });
  assert.match(second.content, /^Old grief\nBurned 2026-10-25/);
  assert.deepEqual(secondWords, { type: 'quote', content: 'I let it go.' });
  // The paper itself isn't listed twice.
  assert.ok(!blocks.some((b) => b.type === 'ingredient_list' && b.content.includes('Petition: Steady work')));
});
