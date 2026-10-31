import assert from 'node:assert/strict';
import { test } from 'node:test';

import { normalizeReading, type ReadingEntry } from '../src/lib/craft/hedge/readings.ts';
import { normalizeDream, type DreamEntry } from '../src/lib/craft/hedge/dreams.ts';
import type { CycleData } from '../src/lib/cycle/types.ts';
import { holidayChoice } from '../src/lib/holidays.ts';
import type { JournalRow, RitualPlan } from '../src/lib/rituals/types.ts';
import { recordOffering } from '../src/lib/altar/devotion.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { altarRecords, covenRecords, cycleSummary, reflectionPrompts, shareCard, shareText, yearLines, yearPage, yearReview, type YearInput } from '../src/lib/grimoire/yearReview.ts';
import { nextSpan, previousSpan, resolvedStart, yearSpanAt, yearTurn, YEAR_START_KEY } from '../src/lib/grimoire/yearSpan.ts';

test('the year follows the person’s own new year', () => {
  const at = new Date(2026, 9, 31);
  const jan = yearSpanAt(at, {});
  assert.equal(jan.kind, 'january');
  assert.equal(jan.startKey, '2026-01-01');
  assert.equal(jan.lastKey, '2026-12-31');
  assert.equal(jan.label, '2026');

  const samhain = yearSpanAt(at, { [YEAR_START_KEY]: 'samhain' });
  assert.equal(samhain.startKey, '2025-11-01');
  assert.equal(samhain.lastKey, '2026-10-31');
  assert.equal(samhain.label, 'Samhain 2025 to Samhain 2026');
  assert.equal(nextSpan(samhain, { [YEAR_START_KEY]: 'samhain' }).startKey, '2026-11-01');
  assert.equal(previousSpan(samhain, { [YEAR_START_KEY]: 'samhain' }).startKey, '2024-11-01');

  // South of the equator, Samhain is 1 May on the turned Wheel.
  const south = yearSpanAt(at, { [YEAR_START_KEY]: 'samhain', calendar_hemisphere: 'south' });
  assert.equal(south.startKey, '2026-05-01');

  // Counting by the moon: the lunar year from the first new moon on or after the winter solstice.
  assert.equal(resolvedStart({ calendar_count_by: 'moon' }), 'moon');
  const moon = yearSpanAt(at, { calendar_count_by: 'moon' });
  assert.equal(moon.kind, 'moon');
  assert.ok(moon.startKey >= '2025-12-21' && moon.startKey <= '2026-01-20', moon.startKey);
  assert.ok(moon.lastKey >= '2026-12-10' && moon.lastKey <= '2027-01-20', moon.lastKey);
  // The moon calendar's year set to begin at Samhain carries over.
  assert.equal(resolvedStart({ calendar_opt_moon_yearStart: 'samhain' }), 'samhain');
});

test('Today offers the look back around the year’s turn', () => {
  const settings = { [YEAR_START_KEY]: 'samhain' };
  const ending = yearTurn(new Date(2026, 9, 31), settings)!;
  assert.equal(ending.when, 'ending');
  assert.equal(ending.days, 0);
  assert.equal(ending.span.startKey, '2025-11-01');
  const begun = yearTurn(new Date(2026, 10, 5), settings)!;
  assert.equal(begun.when, 'begun');
  assert.equal(begun.span.startKey, '2025-11-01');
  assert.equal(yearTurn(new Date(2026, 6, 1), settings), null);
});

const journal = (id: string, ritual_date: string, extra: Partial<JournalRow> = {}) => ({ id, title: `Rite ${id}`, intention: null, ritual_date, metadata: {}, moon_phase: null, ...extra }) as unknown as JournalRow;
const reading = (id: string, date: string, drawn: string[]): ReadingEntry => ({ id, createdAt: `${date}T20:00:00Z`, data: normalizeReading({ date, method: 'tarot', drawn }) });
const dream = (id: string, date: string, symbols: string[]): DreamEntry => ({ id, createdAt: `${date}T07:00:00Z`, data: normalizeDream({ date, title: 'A dream', symbols }) });

const base = (): YearInput => ({
  journal: [],
  plans: [],
  readings: [],
  dreams: [],
  pages: [],
  holidayChoice: holidayChoice({}),
  offerings: [],
  gatherings: [],
  altarChanges: [],
  journeys: [],
  courses: [],
  cycle: null,
});

test('gathers the year: rituals, workings, moons, holidays, cards, dreams', () => {
  const span = yearSpanAt(new Date(2026, 5, 1), {});
  const input: YearInput = {
    ...base(),
    journal: [
      // 26 August 2026 is not a full moon; 28 August is (the Sturgeon Moon, 04:18 UTC).
      journal('a', '2026-08-28', { intention: 'protection' }),
      journal('b', '2026-05-01', { metadata: { lookBack: { when: 'week', date: '2026-05-08', answer: 'yes', outcome: '', answeredAt: '2026-05-09' } } }),
      journal('c', '2026-03-03', { metadata: { lookBack: { when: 'week', date: '2026-03-10', answer: 'no', outcome: '', answeredAt: '2026-03-11' } } }),
      journal('old', '2025-06-01'),
    ],
    plans: [{ id: 'p1', date: '2026-12-21', time: '20:00', title: 'Yule', intention: null, intentionKey: null, templateId: null, draft: null, ingredients: [], createdAt: '2026-10-01' } as RitualPlan],
    readings: [reading('r1', '2026-02-02', ['The Star']), reading('r2', '2026-04-04', ['The Star', 'The Moon']), reading('r3', '2026-07-07', ['The Star'])],
    dreams: [dream('d1', '2026-01-10', ['water', 'owl']), dream('d2', '2026-02-10', ['water'])],
    pages: [{ id: 'g1', title: 'Rosemary', created_at: '2026-03-01T10:00:00Z' }],
    offerings: [{ at: '2026-06-21T12:00:00Z', label: 'Bread', detail: 'Brigid' }],
    gatherings: [{ at: '2026-09-22T19:00:00Z', label: 'Mabon circle' }],
  };
  const r = yearReview(input, span, new Date(2026, 9, 31));
  assert.equal(r.rituals.done, 3);
  assert.equal(r.rituals.byMonth.length, 12);
  assert.equal(r.rituals.byMonth[7].count, 1);
  assert.deepEqual(r.rituals.themes[0], { label: 'Protection', count: 1 });
  assert.equal(r.plans.planned, 1);
  assert.equal(r.plans.ahead, 1);
  assert.equal(r.workings.lookedBack, 2);
  assert.equal(r.workings.worked, 1);
  assert.equal(r.workings.no, 1);
  assert.deepEqual(
    r.workings.boreOut.map((w) => w.id),
    ['b'],
  );
  assert.ok(r.moons.fullKept >= 1);
  const august = r.moons.list.find((m) => m.kind === 'full' && m.date === '2026-08-28')!;
  assert.equal(august.kept, true);
  assert.ok(r.moons.full >= 10);
  // Litha (21 June) was kept with an offering; Beltane (1 May) with a ritual.
  const litha = r.holidays.list.find((h) => h.ref === 'wheel-litha');
  assert.equal(litha?.kept, true);
  const beltane = r.holidays.list.find((h) => h.ref === 'wheel-beltane');
  assert.equal(beltane?.kept, true);
  const yule = r.holidays.list.find((h) => h.ref === 'wheel-yule');
  assert.equal(yule?.planned, true);
  assert.equal(yule?.past, false);
  assert.equal(r.readings.count, 3);
  assert.equal(r.readings.top[0].name, 'The Star');
  assert.deepEqual(r.dreams.symbols, [{ symbol: 'water', count: 2 }]);
  assert.equal(r.pages.made, 1);
  assert.deepEqual(r.offerings.to, [{ label: 'Brigid', count: 1 }]);
  assert.equal(r.gatherings.count, 1);
  assert.equal(r.empty, false);
  assert.equal(r.ongoing, true);

  const lines = yearLines(r);
  assert.ok(lines[0].startsWith('You kept 3 rituals'));
  const prompts = reflectionPrompts(r);
  assert.ok(prompts.some((p) => p.startsWith('The Star came to you 3 times')));
  assert.ok(prompts.some((p) => p.startsWith('Water came in 2 of your dreams')));
  assert.ok(prompts[prompts.length - 1].startsWith('What will you carry'));

  const page = yearPage(r);
  assert.equal(page.ref, 'year-review-january-2026-01-01');
  assert.equal(page.sectionTitle, 'Year in review');
  assert.equal(page.blocks.filter((b) => b.type === 'heading').length, prompts.length + 1);
});

test('the shareable card holds counts only, never anything sensitive', () => {
  const span = yearSpanAt(new Date(2026, 5, 1), {});
  const cycle: CycleData = { version: 2, bleeds: [{ id: 'b1', start: '2026-01-05', end: null, flow: {}, updatedAt: '' }], notes: [], settings: {} as CycleData['settings'], removed: {} };
  const r = yearReview(
    {
      ...base(),
      cycle,
      // Away from the new and full moons and the holidays, so only the counts below show.
      readings: [reading('r1', '2026-02-10', ['The Tower'])],
      dreams: [dream('d1', '2026-01-10', ['snake'])],
      journal: [journal('a', '2026-03-12', { title: 'Secret uncrossing' })],
    },
    span,
    new Date(2026, 9, 31),
  );
  assert.equal(r.cycle?.bleeds, 1);
  const text = shareText(r);
  for (const secret of ['Tower', 'snake', 'Secret', 'uncrossing', 'bleed', 'Cycle']) assert.ok(!text.includes(secret), secret);
  assert.deepEqual(shareCard(r).lines, ['1 ritual', '1 reading', '1 dream written down']);
});

test('cycle summary: bleeds begun, average length, noted days', () => {
  const span = yearSpanAt(new Date(2026, 5, 1), {});
  const bleed = (start: string) => ({ id: start, start, end: null, flow: {}, updatedAt: '' });
  const data = {
    version: 2,
    bleeds: [bleed('2025-12-04'), bleed('2026-01-01'), bleed('2026-01-29'), bleed('2026-02-28')],
    notes: [{ date: '2026-01-02' }, { date: '2026-01-02' }, { date: '2025-12-30' }],
    settings: {},
    removed: {},
  } as unknown as CycleData;
  assert.deepEqual(cycleSummary(data, span), { bleeds: 3, averageLength: 29, notedDays: 1 });
});

test('offerings and changes at the altar, from saved altars', () => {
  const deity = recordOffering(
    { type: 'deity', label: 'Brigid' } as SavedObject,
    { types: ['Food'], supports: [], customItems: 'Bread, Milk', intention: '', message: '', status: 'Offered', customStatus: '', response: '', responseNotes: '', occurredAt: '2026-02-01T18:00:00.000Z' },
    '2026-02-01T18:00:00.000Z',
  );
  const { offerings, changes } = altarRecords([{ id: 'a1', name: 'Hearth', savedAt: '2026-01-15T10:00:00.000Z', objects: [deity] }], new Date(2026, 9, 31));
  assert.deepEqual(offerings, [{ at: '2026-02-01T18:00:00.000Z', label: 'Bread, Milk', detail: 'Brigid', id: 'a1' }]);
  assert.ok(changes.some((c) => c.label === 'Hearth first saved'));
  assert.ok(changes.some((c) => c.label === 'Brigid placed on Hearth'));
});

test('coven gatherings you were at, and programs as courses', () => {
  const { gatherings, courses } = covenRecords({
    attendance: [
      { ritual_id: 'x', present: true, joined_at: null },
      { ritual_id: 'y', present: false, joined_at: '2026-03-01T20:00:00Z' },
      { ritual_id: 'z', present: null, joined_at: '2026-04-01T20:00:00Z' },
    ],
    rituals: [
      { id: 'x', coven_id: 'c', title: 'Imbolc', scheduled_for: '2026-02-01T19:00:00Z', ended_at: null },
      { id: 'y', coven_id: 'c', title: 'Missed', scheduled_for: '2026-03-01T19:00:00Z', ended_at: null },
      { id: 'z', coven_id: 'c', title: 'Ostara', scheduled_for: '2026-03-20T19:00:00Z', ended_at: null },
    ],
    covens: [{ id: 'c', name: 'Hollow Oak' }],
    enrollments: [{ id: 'e', program_id: 'p', started_at: '2026-01-05T10:00:00Z', completed_at: null }],
    programs: [{ id: 'p', title: 'First Degree' }],
    progress: [{ enrollment_id: 'e', submitted_at: '2026-02-02T10:00:00Z', checked_at: null }],
  });
  assert.deepEqual(
    gatherings.map((g) => [g.label, g.detail]),
    [
      ['Imbolc', 'Hollow Oak'],
      ['Ostara', 'Hollow Oak'],
    ],
  );
  assert.deepEqual(courses[0], { id: 'e', title: 'First Degree', startedAt: '2026-01-05T10:00:00Z', completedAt: null, steps: ['2026-02-02T10:00:00Z'] });
  const r = yearReview({ ...base(), gatherings, courses }, yearSpanAt(new Date(2026, 5, 1), {}), new Date(2026, 9, 31));
  assert.equal(r.gatherings.count, 2);
  assert.deepEqual(r.courses, [{ id: 'e', title: 'First Degree', started: true, completed: false, steps: 1 }]);
});

test('an empty year says so', () => {
  const r = yearReview(base(), yearSpanAt(new Date(2026, 5, 1), {}), new Date(2026, 9, 31));
  assert.equal(r.empty, true);
  assert.deepEqual(shareCard(r).lines, []);
});
