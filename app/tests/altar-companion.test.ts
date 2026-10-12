import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AltarDocument } from '../src/lib/altar/snapshot.ts';

import { glanceLine, resolveAltarEntry, stateRows, traditionalSplit } from '../src/lib/altar/companion.ts';
import { buildLibrary } from '../src/lib/library/model.ts';

const entries = buildLibrary([
  { entity_id: 'mine-1', name: 'Lavender', type: 'herb', image: null, my_practice: { Notes: 'Sleep sachet' }, community: null, updated_at: null },
]);

test('altar objects find their Living Library entry like the website', () => {
  assert.equal(resolveAltarEntry(entries, { type: 'oil', herb: 'lavender', form: 'oil' })?.id, 'traditional:herb:lavender');
  assert.equal(resolveAltarEntry(entries, { type: 'candle', color: 'red' })?.id, 'traditional:candle:red');
  assert.equal(resolveAltarEntry(entries, { type: 'crystal', crystal: 'clear_quartz' })?.id, 'traditional:crystal:clear_quartz');
  assert.equal(resolveAltarEntry(entries, { type: 'vessel', vessel: 'offering_bowl' })?.id, 'traditional:vessel:offering_bowl');
  // A practice entity folded into a traditional entry resolves to that entry.
  assert.equal(resolveAltarEntry(entries, { type: 'herb', entityId: 'mine-1' })?.id, 'traditional:herb:lavender');
  assert.equal(resolveAltarEntry(entries, { type: 'cloth', label: 'Green cloth' }), null);
});

test('the glance line gives element, planet and a few uses, and respects settings', () => {
  const red = resolveAltarEntry(entries, { type: 'candle', color: 'red' })!;
  assert.match(glanceLine(red), /^Fire · Mars · \w/);
  assert.doesNotMatch(glanceLine(red, { library_traditional_correspondences: false } as never), /Fire/);
});

test('warnings stay in view and the rest folds away', () => {
  const lavender = resolveAltarEntry(entries, { herb: 'lavender' })!;
  const split = traditionalSplit(lavender);
  assert.equal(split.lead.length, 2);
  assert.ok(split.warnings.some((field) => field.key === 'SafetyAndRespect'));
  assert.ok(split.rest.length > 0);
  assert.ok(![...split.lead, ...split.rest].some((field) => field.key === 'Element'));
});

test('state rows describe a candle and a jar', () => {
  const now = new Date(2026, 9, 11, 12);
  const candle = {
    type: 'candle',
    apothecaryIngredients: '[]',
    livingState: JSON.stringify({ candle: { totalBurnMs: 5_400_000, lastLitAt: new Date(2026, 9, 10, 20).toISOString(), dressings: [{ label: 'Rosemary oil' }] } }),
  };
  assert.deepEqual(stateRows(candle, now), [
    { label: 'Burning time', value: '1 hr 30 min' },
    { label: 'Last burned', value: `Yesterday, ${new Date(2026, 9, 10, 20).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` },
    { label: 'Dressed with', value: 'Rosemary' },
  ]);
  const jar = { type: 'apothecary', apothecaryType: 'Spell jar', apothecaryIntention: 'Protection', apothecaryIngredients: JSON.stringify(['Salt', { name: 'Rosemary' }]) };
  assert.deepEqual(stateRows(jar, now).slice(0, 3), [
    { label: 'Kind', value: 'Spell jar' },
    { label: 'Intention', value: 'Protection' },
    { label: 'Inside', value: 'Salt, Rosemary' },
  ]);
});

test('the cabinet shows each item’s two best-known uses', async () => {
  const { cabinetEntry, topUses } = await import('../src/lib/altar/companion.ts');
  const { builtInCabinet } = await import('../src/lib/altar/cabinet.ts');
  const red = builtInCabinet.find((item) => item.name === 'Red Candle')!;
  assert.equal(topUses(cabinetEntry(entries, red, red.forms[0])), 'passion · courage');
  const lavender = builtInCabinet.find((item) => item.name === 'Lavender')!;
  assert.equal(topUses(cabinetEntry(entries, lavender, lavender.forms[0])), 'peace · sleep');
  assert.equal(topUses(null), '');
});

test('a candle can be carved, shows it, and the carving can be smoothed away', async () => {
  const { carveCandle, carvingsOf, uncarveCandle } = await import('../src/lib/altar/livingState.ts');
  const now = new Date(2026, 9, 11, 12).toISOString();
  let candle: import('../src/lib/altar/types.ts').SavedObject = { type: 'candle', label: 'Green Candle' };
  candle = carveCandle(candle, '  Abundance ', now);
  candle = carveCandle(candle, 'abundance', now);
  candle = carveCandle(candle, 'Ash', now);
  assert.deepEqual(carvingsOf(candle).map((c) => c.text), ['Abundance', 'Ash']);
  assert.ok(stateRows(candle, new Date(now)).some((r) => r.label === 'Carved with' && r.value === '“Abundance”, “Ash”'));
  assert.deepEqual(carvingsOf(uncarveCandle(candle, now, 0)).map((c) => c.text), ['Ash']);
  assert.equal(carvingsOf(uncarveCandle(candle, now)).length, 0);
  // Only candles take carvings, and nothing blank is carved.
  assert.equal(carveCandle({ type: 'crystal' }, 'Calm', now).livingState, undefined);
  assert.equal(carveCandle(candle, '   ', now), candle);
});

test('a lit candle counts its current burn, and its kind has a typical burn time', async () => {
  const { burnedSoFar, typicalBurn, burnHistory, burnDuration } = await import('../src/lib/altar/companion.ts');
  const now = new Date(2026, 9, 11, 21);
  const lit = {
    type: 'candle',
    form: 'tea-light',
    lit: 'true',
    livingState: JSON.stringify({
      candle: {
        totalBurnMs: 600_000,
        currentBurnStartedAt: new Date(2026, 9, 11, 20).toISOString(),
        burnHistory: [{ startedAt: new Date(2026, 9, 10, 20).toISOString(), endedAt: new Date(2026, 9, 10, 20, 10).toISOString(), durationMs: 600_000 }],
      },
    }),
  };
  assert.equal(burnDuration(burnedSoFar(lit, now)), '1 hr 10 min');
  assert.equal(burnDuration(20_000), 'Less than 1 minute');
  assert.match(typicalBurn(lit), /hour/);
  assert.equal(burnHistory(lit, now)[0].label, 'Burned 10 min');
});

test('crystal care and offerings are recorded in the website’s shape', async () => {
  const { careForCrystal, dedicateCrystal, recordOffering, updateOffering, setPresenceReason, crystalIntention, offeringsOf } = await import('../src/lib/altar/devotion.ts');
  const now = '2026-10-11T20:00:00.000Z';
  let crystal: Record<string, unknown> = { type: 'crystal', label: 'Amethyst' };
  crystal = dedicateCrystal(crystal, { type: 'Deity', entityId: '', dedicatedTo: 'Hekate', intention: 'Guidance at the crossroads', duration: 'Until manually removed', reviewAt: '', notes: '' }, now);
  assert.equal(crystalIntention(crystal, now), 'Guidance at the crossroads');
  crystal = careForCrystal(crystal, 'cleanse', { decision: 'Cleanse and remove all current intentions', purpose: 'Routine care', methods: ['Moonlight', 'Sound'], supports: [], occurredAt: now }, now);
  const state = JSON.parse(String(crystal.livingState)).crystal;
  assert.equal(state.lastCleansedAt, now);
  assert.deepEqual(state.cleansingHistory[0].methods, ['moonlight', 'sound']);
  assert.equal(state.cleansingHistory[0].purpose, 'routine-care');
  assert.equal(state.dedication, '');

  let deity: Record<string, unknown> = { type: 'deity', label: 'Brigid' };
  deity = recordOffering(deity, { types: ['Flowers'], supports: [], customItems: 'milk, bread', intention: 'Gratitude', message: '', status: 'Present on altar', customStatus: '', response: '', responseNotes: '', occurredAt: now }, now);
  const offering = offeringsOf(deity, now)[0];
  assert.deepEqual(offering.items, [{ label: 'milk', custom: true }, { label: 'bread', custom: true }]);
  assert.equal(offering.status, 'present-on-altar');
  deity = updateOffering(deity, offering.id, { status: 'Returned to nature', customStatus: '', response: 'Accepted', responseNotes: '', followUpNotes: '', completedAt: now }, now);
  const after = JSON.parse(String(deity.livingState)).deity;
  assert.equal(after.offeringStatus, 'returned-to-nature');
  assert.equal(after.offeringStatusHistory.length, 1);
  deity = setPresenceReason(deity, 'Devotional focus', 'Imbolc to Beltane', now);
  assert.equal(JSON.parse(String(deity.livingState)).deity.reasonForPresence, 'devotional focus: Imbolc to Beltane');
});

test('altar-wide edits: light all, snuff all, group, ungroup, rename, clear', async () => {
  const { lightAll, snuffAll, groupObjects, ungroup, renameObject, clearAltar, groupIndices } = await import('../src/lib/altar/editor.ts');
  const now = '2026-10-11T20:00:00.000Z';
  const later = '2026-10-11T21:00:00.000Z';
  let doc: AltarDocument = { background: '', backgroundName: '', groups: [], activeGroupId: null, extra: {}, objects: [{ type: 'candle', label: 'Red' }, { type: 'candle', label: 'White' }, { type: 'crystal', label: 'Jet' }] };
  doc = lightAll(doc, now);
  assert.ok(doc.objects.slice(0, 2).every((o) => o.lit === 'true'));
  doc = snuffAll(doc, later);
  assert.equal(JSON.parse(String(doc.objects[0].livingState)).candle.totalBurnMs, 3_600_000);
  doc = groupObjects(doc, [0, 2], 'Protection', now);
  assert.deepEqual(groupIndices(doc, 0), [0, 2]);
  doc = ungroup(doc, doc.groups[0].id);
  assert.deepEqual(groupIndices(doc, 0), [0]);
  doc = renameObject(doc, 2, 'Grandmother’s jet');
  assert.equal(doc.objects[2].label, 'Grandmother’s jet');
  assert.equal(clearAltar(doc).objects.length, 0);
});
