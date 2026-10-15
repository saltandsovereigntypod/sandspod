import assert from 'node:assert/strict';
import { test } from 'node:test';

import { apothecaryObject, normalizeApothecary, refreshPlaced } from '../src/lib/altar/apothecary.ts';
import { builtInCabinet, cabinetItemsFor } from '../src/lib/altar/cabinet.ts';
import {
  activityRecord,
  apothecaryInstanceInput,
  dateFromInput,
  dateToInput,
  defaultLifecycle,
  eventHistory,
  eventRow,
  filterTendChoices,
  instanceRow,
  instanceTendState,
  instanceTendUpdates,
  isCrafted,
  lifecycleRows,
  recipeUpdatedEvent,
  relativeDue,
  tendChoices,
  tendingBlendItem,
  tendRecord,
  TENDING_BLEND_LIVING,
} from '../src/lib/altar/instances.ts';
import { altarRitualBlocks, altarRitualItem, altarRitualOps, groupAltarItems } from '../src/lib/grimoire/altarImport.ts';
import { openSectionIn } from '../src/lib/grimoire/structure.ts';
import type { GrimoireSnapshot } from '../src/lib/grimoire/types.ts';

const now = new Date('2026-10-12T15:00:00.000Z');

test('cabinet search finds candles by form names and catalogue aliases', () => {
  const names = (search: string) => cabinetItemsFor(builtInCabinet, 'candles', search).map((item) => item.name);
  for (const word of ['seven day', 'vigil', 'tealight', 'tea light', 'chime', 'spell candle', 'pillar', 'taper']) {
    assert.equal(names(word).length, builtInCabinet.filter((i) => i.category === 'candles').length, word);
  }
  assert.deepEqual(cabinetItemsFor(builtInCabinet, 'vessels', 'spell jar').map((i) => i.name), ['Spell Jar']);
  assert.deepEqual(cabinetItemsFor(builtInCabinet, 'herbs', 'incense').length, builtInCabinet.filter((i) => i.category === 'herbs').length);
  assert.deepEqual(names('nothing like this'), []);
});

test('crafted actions reach cabinet oils and kinds of made things, not plain objects', () => {
  assert.equal(isCrafted({ type: 'apothecary' }), true);
  assert.equal(isCrafted({ type: 'oil', herb: 'basil' }), true);
  assert.equal(isCrafted({ type: 'vessel', apothecaryType: 'Spell Jar' }), true);
  assert.equal(isCrafted({ type: 'herb', form: 'loose' }), false);
  assert.equal(isCrafted({ type: 'candle' }), false);
  assert.equal(isCrafted(null), false);
});

test('new instances get the website default lifecycle for their kind', () => {
  assert.equal(defaultLifecycle('apothecary', 'Oil / Tincture', now).expiration_enabled, true);
  const jar = defaultLifecycle('apothecary', 'Spell Jar', now);
  assert.equal(jar.tending_enabled, true);
  assert.equal(jar.tending_interval_days, 30);
  assert.equal(defaultLifecycle('candle', 'Spell Jar', now).tending_enabled, false);

  const item = normalizeApothecary({ id: 'a1', name: 'Dream Jar', type: 'spell-jar', entityId: 'e1', livingState: { tending_enabled: false, expiration_enabled: false } });
  const row = instanceRow('u1', apothecaryInstanceInput(item), now);
  assert.equal(row.user_id, 'u1');
  assert.equal(row.source, 'apothecary');
  assert.equal(row.instance_type, 'apothecary_item');
  assert.equal(row.object_type, 'apothecary');
  assert.equal(row.subtype, 'Spell Jar');
  assert.equal(row.apothecary_item_id, 'a1');
  assert.equal(row.entity_id, 'e1');
  // Switched off on the recipe: no dates, whatever the kind's default.
  assert.equal(row.tending_enabled, false);
  assert.equal(row.tending_due_at, null);
  assert.equal(row.tending_interval_days, null);
  assert.equal(row.expires_at, null);

  const event = eventRow('u1', { id: 'i1', entity_id: 'e1' }, recipeUpdatedEvent(item), now);
  assert.deepEqual(event, {
    user_id: 'u1',
    instance_id: 'i1',
    entity_id: 'e1',
    event_type: 'recipe_updated',
    event_label: 'Apothecary Recipe Updated',
    event_notes: 'Dream Jar · 0 ingredients',
    occurred_at: now.toISOString(),
    metadata: { apothecaryItemId: 'a1' },
  });
});

test('placed apothecary objects carry the item instance', () => {
  const item = normalizeApothecary({ id: 'a1', name: 'Dream Jar', type: 'spell-jar', instanceId: 'i1' });
  const placed = apothecaryObject(item, [], now.toISOString());
  assert.equal(placed.instanceId, 'i1');
  assert.equal(refreshPlaced({ ...placed, instanceId: '' }, item).instanceId, 'i1');
});

test('the lifecycle block reads status, created, tending and review with relative days', () => {
  const rows = lifecycleRows(
    {
      id: 'i1',
      status: 'active',
      started_at: '2026-10-01T12:00:00.000Z',
      tending_enabled: true,
      tending_due_at: '2026-10-15T12:00:00.000Z',
      expiration_enabled: true,
      expires_at: '2026-10-10T12:00:00.000Z',
      remaining_amount: '3',
      amount_unit: 'ml',
      remaining_burn_seconds: 5400,
    },
    now,
  );
  assert.deepEqual(rows.map((r) => r.label), ['Status', 'Created', 'Next tending', 'Review or replace', 'Current state', 'Current state']);
  assert.equal(rows[0].value, 'Active');
  assert.match(rows[2].value, / · in 3 days$/);
  assert.match(rows[3].value, / · 2 days overdue$/);
  assert.equal(rows[4].value, '3 ml remaining');
  assert.equal(rows[5].value, '1h 30m burn remaining');
  assert.equal(relativeDue(now.toISOString(), now), 'due today');
  assert.deepEqual(lifecycleRows({ id: 'i1', tending_enabled: false, tending_due_at: '2026-10-15T12:00:00.000Z' }, now).map((r) => r.label), ['Status']);
});

test('Review and Remaining write the instance columns the website writes', () => {
  assert.deepEqual(instanceTendUpdates({ nextTendingAt: '2026-11-01T00:00:00.000Z' }), {
    tending_due_at: '2026-11-01T00:00:00.000Z',
    tending_enabled: true,
  });
  assert.deepEqual(instanceTendUpdates({ reviewAt: '' }), { expires_at: null, expiration_enabled: false });
  assert.deepEqual(instanceTendUpdates({ remainingAmount: '' }), { remaining_amount: null });
  assert.equal(instanceTendUpdates({ activationState: 'sealed' }), null);
  const state = instanceTendState(
    { activationState: 'sealed', remainingAmount: 'old', reviewAt: '', status: 'active', nextTendingAt: 'old' },
    { id: 'i1', remaining_amount: 2, tending_enabled: false, tending_due_at: '2026-11-01T00:00:00.000Z' },
  );
  assert.equal(state.activationState, 'sealed');
  assert.equal(state.remainingAmount, '2');
  assert.equal(state.nextTendingAt, '');
});

test('typed dates are local calendar days', () => {
  const iso = dateFromInput('2026-11-03')!;
  assert.equal(dateToInput(iso), '2026-11-03');
  assert.equal(dateFromInput('2026-02-30'), null);
  assert.equal(dateFromInput('soon'), null);
});

test("Today's Tending records the event and moves the next tending", () => {
  const choices = tendChoices(builtInCabinet, [normalizeApothecary({ id: 'a1', name: 'Moon Oil', type: 'oil-tincture', instanceId: 'i9' })]);
  const oils = filterTendChoices(choices, ['oil'], '');
  assert.ok(oils.some((c) => c.label === 'Basil Oil' && c.source === 'cabinet'));
  assert.ok(oils.every((c) => c.type === 'oil' || c.form === 'oil'));
  assert.deepEqual(filterTendChoices(choices, ['moon-charge'], ''), []);
  const moon = filterTendChoices(choices, [], 'moon oil');
  assert.equal(moon[0].itemId, 'a1');

  const basil = oils.find((c) => c.label === 'Basil Oil')!;
  const { event, updates } = tendRecord(
    { id: 'i1', tending_enabled: true, tending_interval_days: 14, metadata: { keep: 1 } },
    { choices: [basil], methods: ['oil', 'moon-charge'], notes: ' felt calm ', resetReminder: true, nextDays: 0 },
    now,
  );
  assert.equal(event.type, 'tended');
  assert.equal(event.label, 'Manifestation Tended');
  assert.equal(event.notes, 'Methods: Oil, Moon Charge. Supports: Basil Oil\n\nfelt calm');
  assert.equal(updates.tending_interval_days, 14);
  assert.equal(Date.parse(String(updates.tending_due_at)) - now.getTime(), 14 * 86_400_000);
  assert.equal((updates.metadata as Record<string, unknown>).keep, 1);
  assert.equal((updates.metadata as Record<string, unknown>).last_tended_at, now.toISOString());

  const off = tendRecord({ id: 'i1', tending_enabled: false }, { choices: [], methods: [], notes: '', resetReminder: true, nextDays: 5 }, now);
  assert.equal(off.event.notes, 'Manifestation tended.');
  assert.equal('tending_due_at' in off.updates, false);

  assert.deepEqual(activityRecord('charge', ['Moon charge'], ''), {
    type: 'charged',
    label: 'Manifestation Charged',
    notes: 'Type: Moon charge',
    metadata: { activityType: 'charge', options: ['Moon charge'], notes: '' },
  });
  assert.equal(activityRecord('journal', [], '').notes, "Today's Journal");

  const history = eventHistory([{ instance_id: 'i1', event_type: 'charged', event_label: 'Manifestation Charged', event_notes: 'Type: Moon charge', occurred_at: '2026-10-12T10:00:00.000Z' }], now);
  assert.equal(history[0].label, 'Manifestation Charged');
  assert.match(history[0].detail, /^Type: Moon charge · /);
});

test('a group sent to the Grimoire becomes the website ritual page', () => {
  const items = [
    altarRitualItem({ altarObjectId: 'o1', label: 'Red Candle Vigil Candle', type: 'candle', color: 'red', form: 'vigil' }),
    altarRitualItem({ altarObjectId: 'o2', label: 'Basil Loose', type: 'herb', herb: 'basil', form: 'loose' }),
    altarRitualItem({ altarObjectId: 'o3', label: 'Key', type: 'tool', form: 'standard' }),
    altarRitualItem({ altarObjectId: 'o4', label: 'Dream Jar', type: 'apothecary', form: 'spell-jar' }),
  ];
  assert.deepEqual(groupAltarItems(items), [
    { groupLabel: 'Candles', content: 'Red Candle Vigil Candle · Color: red · Form: vigil' },
    { groupLabel: 'Herbs', content: 'Basil Loose · Form: loose' },
    { groupLabel: 'Tools', content: 'Key · Form: standard' },
    { groupLabel: 'Other Items', content: 'Dream Jar · Form: spell-jar' },
  ]);
  const blocks = altarRitualBlocks(items.slice(0, 1), 'Protection', 'October 12, 2026');
  assert.deepEqual(blocks.map((b) => `${b.type}:${b.content}`), [
    'heading:Date',
    'text:October 12, 2026',
    'heading:Intention',
    'text:Protection',
    'heading:Items from the Altar',
    'heading:Candles',
    'ingredient_list:Red Candle Vigil Candle · Color: red · Form: vigil',
    'heading:What I Did',
    'numbered_list:',
    'heading:Results',
    'text:',
    'heading:Reflection',
    'text:',
  ]);

  // A fuller working: only what was filled in, in the website's order.
  const full = altarRitualBlocks(
    items.slice(0, 1),
    {
      intention: 'Protection',
      kind: 'Spell',
      time: 'Dusk',
      moonPhase: 'Waning Gibbous',
      day: 'Saturday',
      deities: 'Hekate',
      extraItems: 'Black salt',
      steps: 'Cast the circle\nLit the candle',
      words: 'By the crossroads',
      signs: '  ',
      results: 'Calm house',
    },
    'October 12, 2026',
  );
  assert.deepEqual(full.map((b) => `${b.type}:${b.content}`), [
    'heading:Date',
    'text:October 12, 2026 · Dusk',
    'heading:Type of Working',
    'text:Spell',
    'heading:Intention',
    'text:Protection',
    'heading:Timing',
    'correspondence:Moon phase: Waning Gibbous\nDay: Saturday',
    'heading:Deities and Spirits',
    'text:Hekate',
    'heading:Items from the Altar',
    'heading:Candles',
    'ingredient_list:Red Candle Vigil Candle · Color: red · Form: vigil',
    'heading:Also Used',
    'ingredient_list:Black salt',
    'heading:What I Did',
    'numbered_list:Cast the circle\nLit the candle',
    'heading:Words Spoken',
    'quote:By the crossroads',
    'heading:Results',
    'text:Calm house',
    'heading:Reflection',
    'text:',
  ]);

  let n = 0;
  const ops = altarRitualOps(
    { fetchedAt: '', books: [], sections: [], pages: [], blocks: [], links: [] },
    { userId: 'u1', now: now.toISOString() },
    { id: 'p1', bookId: 'b1', title: '', purpose: '', items, dateText: 'October 12, 2026' },
    () => `id${++n}`,
  );
  assert.equal(ops[0].table, 'grimoire_pages');
  assert.deepEqual(ops[0].row, { id: 'p1', user_id: 'u1', book_id: 'b1', section_id: null, title: 'Ritual Working', icon: '', page_type: 'ritual', sort_order: 0 });
  assert.deepEqual(ops[1].row, {
    id: 'id1',
    user_id: 'u1',
    book_id: 'b1',
    page_id: 'p1',
    block_type: 'heading',
    content: 'Date',
    metadata: {},
    rich_content: null,
    sort_order: 0,
  });
  assert.equal(ops.length, 1 + 5 + 8 + 6);
});

test('an altar ritual page is filed under the open Grimoire section, or the top level once it is gone', () => {
  const snapshot: GrimoireSnapshot = {
    fetchedAt: '',
    books: [{ id: 'b1', title: 'Book', created_at: null, updated_at: null }],
    sections: [{ id: 's1', book_id: 'b1', title: 'Spells', sort_order: 0, created_at: null }],
    pages: [
      { id: 'top', book_id: 'b1', section_id: null, title: 'Top', page_type: 'blank', sort_order: 0, metadata: null, created_at: null, updated_at: null },
      { id: 'in1', book_id: 'b1', section_id: 's1', title: 'A', page_type: 'blank', sort_order: 0, metadata: null, created_at: null, updated_at: null },
      { id: 'in2', book_id: 'b1', section_id: 's1', title: 'B', page_type: 'blank', sort_order: 1, metadata: null, created_at: null, updated_at: null },
    ],
    blocks: [],
    links: [],
  };
  assert.equal(openSectionIn(snapshot, 'b1', 's1')?.title, 'Spells');
  assert.equal(openSectionIn(snapshot, 'b1', 'deleted'), null);
  assert.equal(openSectionIn(snapshot, 'b1', null), null);
  assert.equal(openSectionIn(snapshot, 'other-book', 's1'), null);

  const page = (sectionId: string | null) =>
    altarRitualOps(snapshot, { userId: 'u1', now: now.toISOString() }, { id: 'p', bookId: 'b1', sectionId, title: 'Working', purpose: '', items: [], dateText: '' }, () => 'x')[0].row;
  assert.equal(page('s1').section_id, 's1');
  assert.equal(page('s1').sort_order, 2);
  assert.equal(page(null).section_id, null);
  assert.equal(page(null).sort_order, 1);
});

test('a tending saved as a reusable blend is the website tending-blend item, and the tending names it', () => {
  const basil = { source: 'cabinet', label: 'Basil Oil', type: 'oil', form: 'oil', entityId: '', instanceId: '', itemId: '' };
  const input = { choices: [basil], methods: ['oil', 'moon-charge'], notes: '', resetReminder: false, nextDays: 0, saveAsBlend: true, blendName: '  ' };
  const blend = tendingBlendItem({ name: 'Protection Jar' }, input, 'b1', now)!;
  assert.equal(blend.name, 'Protection Jar Tending Blend');
  assert.equal(blend.type, 'tending-blend');
  assert.equal(blend.typeLabel, 'Tending Blend');
  assert.equal(blend.imagePath, '../assets/altar/objects/vessels/spell-jar/spell-jar.png');
  assert.equal(blend.intention, 'Tending for Protection Jar');
  assert.equal(blend.notes, 'Methods: Oil, Moon Charge');
  assert.equal(blend.logToGrimoire, true);
  assert.equal(blend.grimoireStatus, 'linked to Living Library');
  assert.deepEqual(blend.ingredients, [{ label: 'Basil Oil', type: 'oil', form: 'oil', entityId: '', libraryName: 'Basil Oil', libraryType: 'oil', amount: '' }]);
  assert.equal(blend.createdAt, now.toISOString());
  assert.deepEqual(TENDING_BLEND_LIVING, { tending_enabled: false, tending_interval_days: null, expiration_enabled: false, expiration_days: null });

  assert.equal(tendingBlendItem(null, { ...input, blendName: 'Feeding Oil' }, 'b1', now)!.name, 'Feeding Oil');
  assert.equal(tendingBlendItem(null, input, 'b1', now)!.intention, 'Tending for manifestation');
  assert.equal(tendingBlendItem(null, { ...input, saveAsBlend: false }, 'b1', now), null);
  assert.equal(tendingBlendItem(null, { ...input, choices: [] }, 'b1', now), null);

  const { event, updates } = tendRecord({ id: 'i1', metadata: { saved_tending_apothecary_item_id: 'old' } }, input, now, blend);
  assert.equal(event.notes, 'Methods: Oil, Moon Charge. Supports: Basil Oil\n\nSaved for future tending as Protection Jar Tending Blend.');
  assert.equal((event.metadata as Record<string, unknown>).savedApothecaryItemId, 'b1');
  assert.equal((updates.metadata as Record<string, unknown>).saved_tending_apothecary_item_id, 'b1');
  const kept = tendRecord({ id: 'i1', metadata: { saved_tending_apothecary_item_id: 'old' } }, input, now);
  assert.equal((kept.updates.metadata as Record<string, unknown>).saved_tending_apothecary_item_id, 'old');

  // Read back, it stays a tending blend rather than becoming a spell jar.
  const back = normalizeApothecary({ ...blend, living_state: TENDING_BLEND_LIVING });
  assert.equal(back.type, 'tending-blend');
  assert.equal(back.typeLabel, 'Tending Blend');
  assert.equal(back.livingState.tending_enabled, false);
});
