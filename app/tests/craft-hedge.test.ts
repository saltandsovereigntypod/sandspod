import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TRADITIONS } from '../src/lib/holidays.ts';
import {
  ANCESTOR_HOLIDAYS,
  ancestorDays,
  anniversaryWords,
  candleDraft,
  formatPartial,
  lifespan,
  nextOccurrence,
  normalizeAncestor,
  partialDate,
  upcomingAnniversaries,
  type Ancestor,
  type AncestorEntry,
} from '../src/lib/craft/hedge/ancestors.ts';
import { DREAM_SYMBOLS, symbolReference } from '../src/lib/craft/hedge/dreamSymbols.ts';
import {
  addSymbol,
  blankDream,
  dreamMoon,
  groupByMonth,
  normalizeDream,
  parseSymbols,
  phaseClusterNote,
  phaseCounts,
  searchDreams,
  symbolCounts,
  type Dream,
  type DreamEntry,
} from '../src/lib/craft/hedge/dreams.ts';
import {
  comeBackTo,
  ELDER_FUTHARK,
  frequentDraws,
  lookBackFrom,
  normalizeReading,
  OGHAM,
  searchReadings,
  searchTarot,
  TAROT,
  waiting,
  type Reading,
  type ReadingEntry,
} from '../src/lib/craft/hedge/readings.ts';

const dream = (id: string, data: Partial<Dream>, createdAt = '2026-10-01T08:00:00.000Z'): DreamEntry => ({
  id,
  createdAt,
  data: { ...blankDream(new Date(2026, 9, 1)), ...data },
});

test('a dream remembers the moon of the night before its morning', () => {
  // Full moon on 2026-10-26 04:12 UTC; the small hours of the 26th are full.
  assert.equal(dreamMoon('2026-10-26').moonPhase, 'Full Moon');
  assert.equal(dreamMoon('2026-10-10').moonPhase, 'New Moon');
  assert.ok(dreamMoon('2026-10-26').moonSign);
});

test('symbols are tidied, split and kept without repeats', () => {
  assert.deepEqual(parseSymbols(' Black Dog, river; the  MOON\nriver'), ['black dog', 'river', 'the moon']);
  assert.deepEqual(addSymbol(['river'], 'River!'), ['river']);
  assert.deepEqual(addSymbol(['river'], 'hare'), ['river', 'hare']);
});

test('dreams group by month, newest first, and search every field', () => {
  const list = [
    dream('a', { date: '2026-09-03', title: 'The flooded house', symbols: ['water', 'house'] }),
    dream('b', { date: '2026-10-12', title: 'Grandmother', dream: 'She gave me a key', symbols: ['the dead', 'key'] }),
    dream('c', { date: '2026-10-02', title: 'Hares', symbols: ['hare', 'water'] }),
  ];
  const groups = groupByMonth(list);
  assert.deepEqual(groups.map((g) => g.month), ['October 2026', 'September 2026']);
  assert.deepEqual(groups[0].entries.map((e) => e.id), ['b', 'c']);
  assert.deepEqual(searchDreams(list, 'key grandmother').map((e) => e.id), ['b']);
  assert.deepEqual(searchDreams(list, 'water').map((e) => e.id).sort(), ['a', 'c']);
  assert.equal(searchDreams(list, '  ').length, 3);
});

test('symbol and phase counts', () => {
  const list = [
    dream('a', { symbols: ['water', 'house'], moonPhase: 'Full Moon' }),
    dream('b', { symbols: ['water'], moonPhase: 'Full Moon' }),
    dream('c', { symbols: ['hare'], moonPhase: 'Waning Crescent' }),
  ];
  assert.deepEqual(symbolCounts(list).map((s) => [s.symbol, s.count]), [['water', 2], ['hare', 1], ['house', 1]]);
  const phases = phaseCounts(list);
  assert.equal(phases.length, 8);
  assert.equal(phases.find((p) => p.phase === 'Full Moon')!.count, 2);
  assert.equal(phaseClusterNote(list), null, 'too few to say');
  const many = [...list, dream('d', { moonPhase: 'Full Moon' }), dream('e', { moonPhase: 'Waxing Gibbous' })];
  assert.match(phaseClusterNote(many)!, /Full Moon/);
});

test('older or partial dream copies still read', () => {
  const d = normalizeDream({ title: 'x', vividness: 9, symbols: ['A', 3] });
  assert.equal(d.vividness, 5);
  assert.deepEqual(d.symbols, ['a']);
  assert.equal(d.lucid, false);
});

test('the dream symbol reference finds entries by name or other words', () => {
  assert.ok(DREAM_SYMBOLS.length >= 20);
  for (const s of DREAM_SYMBOLS) assert.ok(s.notes && s.ask, s.symbol);
  assert.equal(symbolReference('Raven')?.symbol, 'bird');
  assert.equal(symbolReference('black dog')?.symbol, 'dog');
  assert.equal(symbolReference('old locked door')?.symbol, 'door');
  assert.equal(symbolReference('spreadsheet'), null);
});

const reading = (id: string, data: Partial<Reading>): ReadingEntry => ({ id, createdAt: '2026-10-01T08:00:00.000Z', data: { ...normalizeReading({}), ...data } });

test('there are 78 tarot cards, 24 runes and 20 ogham, and the card search is forgiving', () => {
  assert.equal(TAROT.length, 78);
  assert.equal(new Set(TAROT).size, 78);
  assert.equal(ELDER_FUTHARK.length, 24);
  assert.equal(OGHAM.length, 20);
  assert.deepEqual(searchTarot('queen cups'), ['Queen of Cups']);
  assert.deepEqual(searchTarot('3 swords'), ['Three of Swords']);
  assert.deepEqual(searchTarot('the tower'), ['The Tower']);
  assert.equal(searchTarot('').length, 78);
});

test('readings come back once their look-back day arrives, until you say what happened', () => {
  const now = new Date(2026, 9, 16, 12);
  const list = [
    reading('due', { lookBack: '2026-10-10' }),
    reading('today', { lookBack: '2026-10-16' }),
    reading('done', { lookBack: '2026-10-01', outcome: 'It came true' }),
    reading('later', { lookBack: '2026-11-01' }),
    reading('none', { lookBack: '' }),
  ];
  assert.deepEqual(comeBackTo(list, now).map((e) => e.id), ['due', 'today']);
  assert.deepEqual(waiting(list, now).map((e) => e.id), ['later']);
  assert.equal(lookBackFrom('2026-12-25', 30), '2027-01-24');
});

test('reading search and repeated draws', () => {
  const list = [
    reading('a', { method: 'tarot', question: 'The move?', drawn: ['The Tower', 'The Star'] }),
    reading('b', { method: 'runes', drawn: ['Fehu'] }),
    reading('c', { method: 'tarot', drawn: ['The Tower'] }),
  ];
  assert.deepEqual(searchReadings(list, 'tower').map((e) => e.id), ['a', 'c']);
  assert.deepEqual(searchReadings(list, '', 'runes').map((e) => e.id), ['b']);
  assert.deepEqual(frequentDraws(list), [{ name: 'The Tower', count: 2 }]);
});

test('partial dates: year only, month and year, day and month', () => {
  assert.deepEqual(partialDate('', '', '1932'), { year: 1932, month: null, day: null });
  assert.deepEqual(partialDate('14', '5', ''), { year: null, month: 5, day: 14 });
  assert.deepEqual(partialDate('31', '4', '1950'), { year: 1950, month: 4, day: null }, 'no 31 April');
  assert.deepEqual(partialDate('29', '2', '1931'), { year: 1931, month: 2, day: null }, 'not a leap year');
  assert.deepEqual(partialDate('29', '2', '1932'), { year: 1932, month: 2, day: 29 });
  assert.deepEqual(partialDate('5', '', '1932'), { year: 1932, month: null, day: null }, 'a day needs a month');
  assert.equal(formatPartial({ year: 1932, month: 5, day: 14 }), '14 May 1932');
  assert.equal(formatPartial({ year: 1932, month: 5, day: null }), 'May 1932');
  assert.equal(formatPartial({ year: null, month: null, day: null }), '');
});

const person = (id: string, data: Partial<Ancestor>): AncestorEntry => ({ id, createdAt: '2026-01-01T00:00:00.000Z', data: { ...normalizeAncestor({ name: id }), ...data } });

test('anniversaries in the next 30 days, with the years since', () => {
  const now = new Date(2026, 9, 16, 15);
  const list = [
    person('Nan', { born: { year: 1932, month: 10, day: 20 }, died: { year: 2019, month: 3, day: 2 } }),
    person('Grandad', { died: { year: 2023, month: 10, day: 16 } }),
    person('Aunt May', { born: { year: null, month: 11, day: 14 } }),
    person('Great-uncle', { born: { year: 1901, month: null, day: null } }),
  ];
  const coming = upcomingAnniversaries(list, now);
  assert.deepEqual(coming.map((a) => [a.name, a.kind, a.inDays]), [
    ['Grandad', 'death', 0],
    ['Nan', 'birth', 4],
    ['Aunt May', 'birth', 29],
  ]);
  assert.equal(anniversaryWords(coming[0]), '3 years since they died');
  assert.equal(anniversaryWords(coming[1]), 'Born 94 years ago');
  assert.equal(anniversaryWords(coming[2]), 'Birthday');
  assert.equal(lifespan(list[0].data), '1932–2019');
});

test('a 29 February anniversary falls on the 28th in other years', () => {
  assert.equal(nextOccurrence(2, 29, new Date(2027, 1, 1)).getDate(), 28);
  assert.equal(nextOccurrence(2, 29, new Date(2028, 1, 1)).getDate(), 29);
});

test('ancestor days come from the calendars you keep', () => {
  const ids = new Set(TRADITIONS.flatMap((t) => t.holidays.map((h) => `${t.id}-${h.id}`)));
  for (const id of ANCESTOR_HOLIDAYS) assert.ok(ids.has(id), id);
  const now = new Date(2026, 9, 16);
  const wheel = ancestorDays({ traditions: ['wheel'], custom: [] }, now);
  assert.deepEqual(wheel.map((d) => d.name), ['Samhain']);
  const more = ancestorDays({ traditions: ['wheel', 'slavic', 'christian'], custom: [] }, now).map((d) => d.name);
  assert.ok(more.includes('Dziady') && more.includes('All Souls’ Day'), more.join());
  assert.deepEqual(ancestorDays({ traditions: ['roman'], custom: [] }, now), [], 'Parentalia is in February');
  assert.equal(ancestorDays({ traditions: ['roman'], custom: [] }, new Date(2027, 1, 1))[0].name, 'Parentalia');
});

test('the candle rite is personal and lights and snuffs the candle', () => {
  const draft = candleDraft({ ...normalizeAncestor({}), name: 'Nan', relation: 'grandmother', loved: 'strong tea and roses', memory: 'Her hands shelling peas.' });
  assert.equal(draft.title, 'A candle for Nan');
  assert.ok(draft.steps.length >= 4);
  assert.ok(draft.steps.some((s) => s.actions.some((a) => a.type === 'light_all')));
  assert.ok(draft.steps.at(-1)!.actions.some((a) => a.type === 'extinguish_all'));
  assert.match(draft.steps[0].instructions, /strong tea and roses/);
  assert.match(draft.steps[2].instructions, /shelling peas/);
  assert.match(draft.steps[1].spoken_text, /Nan, my grandmother/);
  assert.match(draft.preparation, /never leave a flame unattended/);
  const anon = candleDraft(normalizeAncestor({}));
  assert.ok(anon.title.length > 0 && !anon.steps[2].instructions.includes('undefined'));
});
