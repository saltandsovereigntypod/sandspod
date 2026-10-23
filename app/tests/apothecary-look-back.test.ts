import assert from 'node:assert/strict';
import { test } from 'node:test';

import { apothecaryRow, normalizeApothecary } from '../src/lib/altar/apothecary.ts';
import {
  answerItemLookBack,
  answeredItems,
  apothecaryWorking,
  chooseItemLookBack,
  dueItems,
  isItemDue,
  itemLookBack,
  itemLookBackChoices,
  itemLookBackReminder,
  itemMaterials,
  itemSuggestedWhen,
  lookBackWorkings,
  reopenItemLookBack,
  startItemLookBack,
  waitingItems,
} from '../src/lib/altar/apothecaryLookBack.ts';
import { nextPhase } from '../src/lib/moon.ts';
import { buildSchedule, DEFAULT_SETTINGS } from '../src/lib/reminders/schedule.ts';
import { localDateKey } from '../src/lib/rituals/lifecycle.ts';
import { lookBackReminder, readLookBack } from '../src/lib/rituals/lookBack.ts';
import type { JournalRow } from '../src/lib/rituals/types.ts';
import { whatWorks } from '../src/lib/rituals/whatWorks.ts';

const made = '2026-10-18T19:00:00.000Z';
const jar = (extra: Record<string, unknown> = {}) =>
  normalizeApothecary({
    id: 'a1',
    name: 'Money Jar',
    type: 'spell-jar',
    intention: 'prosperity',
    created_at: made,
    ingredients: [
      { label: 'Basil Loose', type: 'herb', herb: 'basil' },
      { label: 'Green Candle', type: 'candle', color: 'green' },
      { label: 'Citrine', type: 'crystal', crystal: 'citrine' },
      'Rice',
    ],
    metadata: { source: 'altar-apothecary', keepMe: { a: 1 } },
    ...extra,
  });

test('a working keeps its metadata, and writes it back with the source', () => {
  const item = jar();
  assert.deepEqual(item.metadata, { source: 'altar-apothecary', keepMe: { a: 1 } });
  const row = apothecaryRow('u', startItemLookBack(item, 'week', new Date(2026, 9, 18)), '2026-10-18T20:00:00.000Z');
  assert.deepEqual(row.metadata.keepMe, { a: 1 });
  assert.equal(row.metadata.source, 'altar-apothecary');
  assert.deepEqual(row.metadata.lookBack, { date: '2026-10-25', when: 'week' });
  // A row with no metadata, or something odd there, reads as none.
  assert.deepEqual(normalizeApothecary({ id: 'b', name: 'B', metadata: null }).metadata, {});
  assert.deepEqual(normalizeApothecary({ id: 'b', name: 'B', metadata: [1] }).metadata, {});
});

test('the same default by intention as a ritual: growing work looks back at the full moon, releasing at the new', () => {
  assert.equal(itemSuggestedWhen(jar()), 'full_moon');
  assert.equal(itemSuggestedWhen(jar({ name: 'Banishing salt sachet', intention: 'let go' })), 'new_moon');
  const now = new Date(2026, 9, 18, 21);
  const started = startItemLookBack(jar(), 'suggested', now);
  assert.equal(itemLookBack(started)?.date, localDateKey(nextPhase(new Date(2026, 9, 21), 'full')));
  assert.equal(itemLookBack(started)?.when, 'full_moon');
  assert.equal(itemLookBackChoices(jar(), now)[0].when, 'full_moon');
  // Not needed: none, unless it's already been answered.
  assert.equal(itemLookBack(startItemLookBack(started, null, now)), null);
  const answered = answerItemLookBack(started, { answer: 'yes', outcome: 'A raise' }, now);
  assert.equal(itemLookBack(startItemLookBack(answered, null, now))?.answer, 'yes');
});

test('a look-back on an item is the very shape a journal entry keeps', () => {
  const now = new Date(2026, 9, 18, 21);
  const item = startItemLookBack(jar(), 'month', now);
  const entry = { id: 'j', title: 'Money candle', intention: 'prosperity', ritual_date: '2026-10-18', moon_phase: null, metadata: { lookBack: item.metadata!.lookBack } } as unknown as JournalRow;
  assert.deepEqual(readLookBack(entry), itemLookBack(item));
});

test('due, waiting and answered, and answers keep every other part of the metadata', () => {
  const now = new Date(2026, 9, 18, 21);
  const item = startItemLookBack(jar(), 'week', now);
  const later = new Date(2026, 9, 26, 9);
  assert.equal(isItemDue(item, now), false);
  assert.equal(isItemDue(item, later), true);
  assert.deepEqual(dueItems([item, jar({ id: 'none' })], later).map((i) => i.id), ['a1']);
  assert.deepEqual(waitingItems([item], now).map((i) => i.id), ['a1']);

  const waited = answerItemLookBack(item, { answer: 'not_yet', outcome: 'Slow', keepWaiting: { when: 'week' } }, later);
  assert.equal(itemLookBack(waited)?.waited?.length, 1);
  assert.equal(itemLookBack(waited)?.date, '2026-11-02');
  const answered = answerItemLookBack(waited, { answer: 'partly', outcome: 'Some money came' }, new Date(2026, 10, 2, 9));
  assert.equal(itemLookBack(answered)?.answer, 'partly');
  assert.equal(itemLookBack(answered)?.outcomeDate, '2026-11-02');
  assert.deepEqual(answered.metadata?.keepMe, { a: 1 });
  assert.equal('ingredients' in (answered.metadata ?? {}), false);
  assert.deepEqual(answeredItems([answered, item]).map((i) => i.id), ['a1']);
  assert.equal(itemLookBack(reopenItemLookBack(answered, later))?.answer, undefined);
  // Changing the day keeps an answer.
  assert.equal(itemLookBack(chooseItemLookBack(answered, 'month', later))?.answer, 'partly');
});

test('the reminder opens the item, and the reminder switch schedules it', () => {
  const item = startItemLookBack(jar(), 'week', new Date(2026, 9, 18, 21));
  const reminder = itemLookBackReminder(item)!;
  assert.equal(reminder.key, 'lookback:apothecary:a1:2026-10-25');
  assert.equal(reminder.url, '/rituals/apothecary/a1');
  assert.match(reminder.body, /spell jar, “Money Jar”/);
  const settings = { ...DEFAULT_SETTINGS, lookBacks: true };
  const schedule = buildSchedule(settings, [], new Date(2026, 9, 19), 30, [], [reminder]);
  const asked = schedule.find((r) => r.kind === 'lookback');
  assert.equal(asked?.url, '/rituals/apothecary/a1');
  // Journal entries still open in the journal.
  const entry = { id: 'j1', title: 'Rite', metadata: { lookBack: { date: '2026-10-25', when: 'week' } } } as unknown as JournalRow;
  const journal = buildSchedule(settings, [], new Date(2026, 9, 19), 30, [], [lookBackReminder(entry)!]);
  assert.equal(journal.find((r) => r.kind === 'lookback')?.url, '/rituals/journal/j1');
  assert.equal(buildSchedule({ ...settings, lookBacks: false }, [], new Date(2026, 9, 19), 30, [], [reminder]).filter((r) => r.kind === 'lookback').length, 0);
  assert.equal(itemLookBackReminder(answerItemLookBack(item, { answer: 'yes', outcome: '' }, new Date(2026, 9, 25))), null);
});

test('answers count in What works for you, with the intention and ingredients from the item', () => {
  assert.deepEqual(itemMaterials(jar()), [
    { name: 'basil', type: 'herb' },
    { name: 'green candle', type: 'candle' },
    { name: 'citrine', type: 'crystal' },
  ]);
  const working = apothecaryWorking(jar());
  assert.equal(working.title, 'Money Jar');
  assert.equal(working.ritual_date, localDateKey(new Date(made)));

  const now = new Date(2026, 9, 18, 21);
  const items = ['a', 'b', 'c'].map((id) => answerItemLookBack(startItemLookBack(jar({ id }), 'week', now), { answer: 'yes', outcome: '' }, new Date(2026, 9, 25)));
  const none = jar({ id: 'n' });
  assert.equal(lookBackWorkings([...items, none]).length, 3);
  const works = whatWorks(lookBackWorkings([...items, none]));
  assert.equal(works.answered, 3);
  assert.equal(works.byIntention.find((t) => t.label === 'Prosperity')?.yes, 3);
  assert.equal(works.byHerb.find((t) => t.label === 'Basil')?.total, 3);
  assert.equal(works.byCandle.find((t) => t.label === 'Green')?.total, 3);
  assert.equal(works.byCrystal.find((t) => t.label === 'Citrine')?.total, 3);
});
