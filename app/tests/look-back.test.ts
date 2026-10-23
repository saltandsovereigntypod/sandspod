import assert from 'node:assert/strict';
import { test } from 'node:test';

import { moonState, nextPhase } from '../src/lib/moon.ts';
import { buildSchedule, DEFAULT_SETTINGS, normalizeSettings } from '../src/lib/reminders/schedule.ts';
import { closeSpell, newSpell, spellJournalAnswers, tickSpell } from '../src/lib/altar/workings/spells.ts';
import { localDateKey } from '../src/lib/rituals/lifecycle.ts';
import {
  answerLookBack,
  chooseLookBack,
  dueLookBacks,
  dueQuestion,
  isDue,
  lookBackChoices,
  lookBackDate,
  lookBackReminder,
  newLookBack,
  readLookBack,
  reopenLookBack,
  suggestedWhen,
  waitingLookBacks,
  withLookBack,
} from '../src/lib/rituals/lookBack.ts';
import { entryMaterials, MIN_PATTERN, tallyWords, whatWorks } from '../src/lib/rituals/whatWorks.ts';
import type { JournalRow } from '../src/lib/rituals/types.ts';

let n = 0;
const entry = (date: string, title: string, extra: Partial<JournalRow> = {}): JournalRow =>
  ({ id: `j${++n}`, title, intention: null, ritual_date: date, moon_phase: null, results: null, metadata: { journalVersion: 1 }, altar_snapshot: {}, ...extra }) as JournalRow;

test('a waxing working looks back at the full moon, a banishing at the new moon', () => {
  // 18 October 2026 is a waxing crescent; the full moon is on the 26th.
  assert.equal(suggestedWhen(entry('2026-10-18', 'Money candle', { intention: 'prosperity' })), 'full_moon');
  assert.equal(suggestedWhen(entry('2026-10-18', 'Banishing salt', { intention: 'let go' })), 'new_moon');
  // No intention the planner knows: the tide it was done under decides.
  assert.equal(suggestedWhen(entry('2026-10-18', 'A quiet rite')), 'full_moon');
  assert.equal(suggestedWhen(entry('2026-10-30', 'A quiet rite')), 'new_moon');
  const full = localDateKey(nextPhase(new Date(2026, 9, 21), 'full'));
  assert.equal(newLookBack(entry('2026-10-18', 'Money candle', { intention: 'prosperity' }), new Date(2026, 9, 18)).date, full);
  assert.equal(moonState(new Date(`${full}T21:00:00`)).name, 'Full Moon');
});

test('a moon look-back is never within three days of the working', () => {
  const full = nextPhase(new Date(2026, 9, 1), 'full');
  const dayBefore = new Date(full.getFullYear(), full.getMonth(), full.getDate() - 1);
  const date = lookBackDate('full_moon', dayBefore);
  assert.ok(date > localDateKey(new Date(full.getFullYear(), full.getMonth(), full.getDate() + 20)), date);
  assert.equal(lookBackDate('week', new Date(2026, 9, 28)), '2026-11-04');
  assert.equal(lookBackDate('month', new Date(2026, 9, 1)), '2026-10-31');
  assert.equal(lookBackDate('custom', new Date(2026, 9, 1), '2026-12-25'), '2026-12-25');
});

test('choices put the suggested moon first', () => {
  const choices = lookBackChoices(entry('2026-10-30', 'Cord cutting', { intention: 'banishing' }), new Date(2026, 9, 30));
  assert.deepEqual(choices.map((c) => c.when), ['new_moon', 'full_moon', 'week', 'month']);
  assert.equal(choices[0].suggested, true);
  assert.equal(choices[2].date, '2026-11-06');
});

test('old entries have no look-back; setting one keeps the rest of metadata', () => {
  const old = entry('2026-01-01', 'Old', { metadata: { journalVersion: 1, completedSteps: [1] } });
  assert.equal(readLookBack(old), null);
  assert.equal(readLookBack({ metadata: null } as unknown as JournalRow), null);
  const set = chooseLookBack(old, 'week', new Date());
  assert.deepEqual(readLookBack(set), { date: '2026-01-08', when: 'week' });
  assert.deepEqual(set.metadata.completedSteps, [1]);
  assert.equal(readLookBack(chooseLookBack(set, null, new Date())), null);
  assert.equal(old.metadata.lookBack, undefined, 'the original is untouched');
});

test('due on the day, answered once, and answers survive changing the day', () => {
  const working = withLookBack(entry('2026-10-10', 'Job spell'), { date: '2026-10-20', when: 'custom' });
  assert.equal(isDue(working, new Date(2026, 9, 19, 23)), false);
  assert.equal(isDue(working, new Date(2026, 9, 20, 8)), true);
  const answered = answerLookBack(working, { answer: 'partly', outcome: '  An interview, no offer yet ' }, new Date(2026, 9, 21));
  assert.deepEqual(readLookBack(answered), { date: '2026-10-20', when: 'custom', answer: 'partly', outcome: 'An interview, no offer yet', outcomeDate: '2026-10-21' });
  assert.equal(isDue(answered, new Date(2026, 9, 22)), false);
  // Turning the look-back off never throws an answer away.
  assert.equal(readLookBack(chooseLookBack(answered, null, new Date()))?.answer, 'partly');
  assert.equal(readLookBack(reopenLookBack(answered, new Date()))?.answer, undefined);
});

test('still waiting moves the look-back on and keeps what you wrote', () => {
  const working = withLookBack(entry('2026-10-01', 'Healing jar'), { date: '2026-10-08', when: 'week' });
  const later = answerLookBack(working, { answer: 'not_yet', outcome: 'Sleeping better', keepWaiting: { when: 'week' } }, new Date(2026, 9, 9));
  const lb = readLookBack(later)!;
  assert.equal(lb.date, '2026-10-16');
  assert.equal(lb.answer, undefined);
  assert.deepEqual(lb.waited, [{ date: '2026-10-09', answer: 'not_yet', outcome: 'Sleeping better', until: '2026-10-16' }]);
  const done = answerLookBack(later, { answer: 'yes', outcome: 'Fully well' }, new Date(2026, 9, 16));
  assert.equal(readLookBack(done)!.waited!.length, 1);
  assert.equal(readLookBack(done)!.answer, 'yes');
});

test('an entry without a look-back can still be answered', () => {
  const answered = answerLookBack(entry('2026-09-01', 'Old candle'), { answer: 'yes', outcome: '' }, new Date(2026, 9, 2));
  assert.deepEqual(readLookBack(answered), { date: '2026-10-02', when: 'custom', answer: 'yes', outcome: '', outcomeDate: '2026-10-02' });
  assert.equal(answerLookBack(entry('2026-09-01', 'x'), { answer: null, outcome: 'hm' }, new Date()).metadata.lookBack, undefined);
});

test('due and waiting lists, the question and the reminder', () => {
  const now = new Date(2026, 9, 23);
  const a = withLookBack(entry('2026-10-01', 'A'), { date: '2026-10-20', when: 'custom' });
  const b = withLookBack(entry('2026-10-01', 'B'), { date: '2026-10-05', when: 'full_moon' });
  const c = withLookBack(entry('2026-10-01', 'C'), { date: '2026-11-05', when: 'week' });
  const d = withLookBack(entry('2026-10-01', 'D'), { date: '2026-10-05', when: 'week', answer: 'no', outcome: '', outcomeDate: '2026-10-06' });
  assert.deepEqual(dueLookBacks([a, b, c, d, entry('2026-10-01', 'E')], now).map((e) => e.title), ['B', 'A']);
  assert.deepEqual(waitingLookBacks([a, b, c, d], now).map((e) => e.title), ['C']);
  assert.equal(dueQuestion(b, (k) => k), 'You said you’d look back on “B” at the full moon (2026-10-05). Did it work? It may have worked in a way you didn’t expect.');
  assert.match(dueQuestion(a, (k) => k), /look back on “A” on 2026-10-20\./);
  assert.deepEqual(lookBackReminder(c), { key: `lookback:${c.id}:2026-11-05`, id: c.id, date: '2026-11-05', title: 'Did it work?', body: 'Time to look back on “C”. Did it work, partly, or not yet?' });
  assert.equal(lookBackReminder(d), null);
});

test('materials come from spell ingredients and the altar', () => {
  const m = entryMaterials({
    metadata: { ingredients: [{ ref: 'r', name: 'Green Candle', type: 'candle' }, { ref: 'b', name: 'basil', type: 'herb' }, { ref: 'c', name: 'Citrine', type: 'crystal' }] },
    altar_snapshot: { objects: [{ type: 'candle', color: 'green', label: 'Candle' }, { type: 'candle', color: '#fff', label: 'White Candle' }, { type: 'herb', herb: 'Bay Leaf' }, { type: 'deity', label: 'Hekate' }] },
  });
  assert.deepEqual(m, { candles: ['Green', 'White'], herbs: ['Basil', 'Bay Leaf'], crystals: ['Citrine'] });
});

test('what works: rates by phase, intention, day and materials, with honest caveats', () => {
  const answer = (e: JournalRow, a: 'yes' | 'partly' | 'not_yet' | 'no') => answerLookBack(e, { answer: a, outcome: '' }, new Date(2026, 9, 23));
  const money = (date: string, a: 'yes' | 'partly' | 'not_yet' | 'no') =>
    answer(entry(date, 'Money candle', { intention: 'prosperity', moon_phase: 'Waxing Crescent', day_of_week: 'Thursday', metadata: { ingredients: [{ name: 'Green Candle', type: 'candle' }] } }), a);
  const banish = (date: string, a: 'yes' | 'partly' | 'not_yet' | 'no') => answer(entry(date, 'Banishing', { intention: 'banishing', moon_phase: 'Waning Crescent', day_of_week: 'Saturday' }), a);

  const few = whatWorks([money('2026-09-03', 'yes'), banish('2026-09-12', 'no')]);
  assert.equal(few.answered, 2);
  assert.equal(few.caveat, 'Only 2 workings so far, so read these as early notes rather than patterns.');
  assert.equal(few.byPhase[0].caveat, 'only 1 so far');
  assert.equal(few.lines.length, 1, 'no pattern lines from one each');
  assert.equal(tallyWords(whatWorks([money('2026-09-03', 'partly')]).byPhase[0]), '1 of 1 partly worked');

  const entries = [
    money('2026-09-03', 'yes'),
    money('2026-09-10', 'yes'),
    money('2026-09-17', 'partly'),
    banish('2026-09-12', 'no'),
    banish('2026-09-19', 'not_yet'),
    banish('2026-09-26', 'yes'),
    withLookBack(entry('2026-10-20', 'Waiting'), { date: '2026-11-05', when: 'full_moon' }),
    entry('2026-01-01', 'Never asked'),
  ];
  const works = whatWorks(entries);
  assert.equal(works.answered, 6);
  assert.equal(works.waiting, 1);
  assert.equal(works.caveat, null);
  assert.equal(works.lines[0], 'Of 6 workings you’ve looked back on, 3 worked, 1 partly, 1 not yet and 1 didn’t.');
  assert.deepEqual(works.byPhase.map((t) => t.label), ['Waxing Crescent', 'Waning Crescent']);
  const prosperity = works.byIntention.find((t) => t.label === 'Prosperity')!;
  assert.equal(tallyWords(prosperity), '2 of 3 worked, 1 partly');
  assert.ok(Math.abs(prosperity.rate - 2.5 / 3) < 1e-9);
  assert.match(works.lines.join(' '), /Prosperity workings have worked best for you \(2 of 3 worked, 1 partly\); banishing workings least \(1 of 3 worked\)\./);
  assert.deepEqual(works.byDay.map((t) => t.label), ['Thursday · Jupiter', 'Saturday · Saturn']);
  assert.equal(works.byCandle[0].label, 'Green');
  assert.match(works.lines.join(' '), /Green candles have worked for you: 2 of 3 worked, 1 partly\./);
  assert.equal(MIN_PATTERN, 3);
  assert.equal(whatWorks([]).overall, null);
});

test('a closed multi-day spell becomes a journal entry to look back on', () => {
  const now = new Date(2026, 9, 23, 20);
  let spell = newSpell({ altarId: 'a', kind: 'seven-day-candle', title: 'Steady work', intention: 'prosperity' }, new Date(2026, 9, 16).toISOString());
  spell = tickSpell(spell, new Date(2026, 9, 16, 21), 'Bright flame');
  spell = closeSpell(spell, 'A call back about the job', now);
  const answers = spellJournalAnswers(spell, now);
  assert.equal(answers.title, 'Steady work');
  assert.equal(answers.intention, 'prosperity');
  assert.equal(answers.ritual_date, '2026-10-23');
  assert.equal(answers.what_happened_during, 'Seven-day candle, tended 1 of 7 days.\nDay 1: Bright flame');
  assert.equal(answers.feelings_after, 'A call back about the job');
  assert.equal(suggestedWhen({ title: answers.title, intention: answers.intention, moon_phase: null, ritual_date: answers.ritual_date }), 'full_moon');
});

test('a look-back day becomes a reminder at the moon-reminder time, unless turned off', () => {
  const working = withLookBack(entry('2026-10-20', 'Job spell'), { date: '2026-10-30', when: 'custom' });
  const source = lookBackReminder(working)!;
  const now = new Date(2026, 9, 23, 12);
  const settings = normalizeSettings({ ...DEFAULT_SETTINGS, rituals: false });
  assert.equal(settings.lookBacks, true);
  const [reminder] = buildSchedule(settings, [], now, 60, [], [source]);
  assert.equal(reminder.kind, 'lookback');
  assert.equal(reminder.title, 'Did it work?');
  assert.equal(reminder.url, `/rituals/journal/${working.id}`);
  assert.deepEqual(reminder.at, new Date(2026, 9, 30, 19, 0));
  assert.equal(buildSchedule(normalizeSettings({ ...settings, lookBacks: false }), [], now, 60, [], [source]).length, 0);
  // A day already past is left to Today and the journal.
  assert.equal(buildSchedule(settings, [], new Date(2026, 10, 1), 60, [], [source]).length, 0);
});
