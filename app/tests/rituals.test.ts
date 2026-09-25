import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  appendEvent,
  blankAnswers,
  completeStep,
  createSession,
  currentStep,
  draftFromTemplate,
  finishSession,
  formatClock,
  journalPayload,
  minutesToSeconds,
  pauseSession,
  resumeSession,
  sessionElapsed,
  skipStep,
  timedStepDue,
  validateDraft,
} from '../src/lib/rituals/lifecycle.ts';
import { INTENTIONS, intentionByKey, scoreNight, suggestIngredients, suggestNights, tideOf } from '../src/lib/rituals/planner.ts';
import { journalConnections, nextPlan, planStart, sortJournal, upcomingPlans } from '../src/lib/rituals/plans.ts';
import {
  journalLibraryEntry,
  journalLinks,
  journalRow,
  sessionFromRows,
  sessionRow,
  sessionStepRows,
  templateLinks,
  templatePayload,
  uniqueLinks,
} from '../src/lib/rituals/rows.ts';
import { buildSpell, toIngredient } from '../src/lib/rituals/spell.ts';
import { LIBRARY_ITEMS } from '../src/lib/rituals/libraryData.ts';
import type { JournalRow, RitualPlan, TemplateRow } from '../src/lib/rituals/types.ts';

const ids = () => {
  let n = 0;
  return () => `id-${++n}`;
};

const template: TemplateRow = {
  id: 'tpl-1',
  title: 'Full moon offering',
  intention: 'Gratitude',
  description: null,
  preparation: 'Gather milk and honey',
  closing: 'Pour the offering outside',
  linked_altar_id: 'altar-1',
  grimoire_page_id: 'page-9',
  estimated_duration_seconds: 300,
  status: 'active',
  settings: {},
  metadata: {},
  ritual_template_steps: [
    // Out of order on purpose: steps run by sort_order.
    { id: 'ts-2', template_id: 'tpl-1', sort_order: 1, title: 'Speak', instructions: null, spoken_text: 'Thank you', duration_seconds: 120, completion_mode: 'timed', actions: [], linked_entities: [], metadata: {} },
    { id: 'ts-1', template_id: 'tpl-1', sort_order: 0, title: 'Open', instructions: 'Breathe', spoken_text: null, duration_seconds: null, completion_mode: 'manual', actions: [{ type: 'light_all', when: 'start' }], linked_entities: [], metadata: {} },
    { id: 'ts-3', template_id: 'tpl-1', sort_order: 2, title: 'Close', instructions: null, spoken_text: null, duration_seconds: null, completion_mode: 'manual', actions: [], linked_entities: [], metadata: {} },
  ],
};

const T0 = new Date('2026-09-25T20:00:00');
const at = (seconds: number) => new Date(T0.getTime() + seconds * 1000);

test('a template session copies steps in order and starts the first', () => {
  const s = createSession({ kind: 'template', template }, { userId: 'u1', now: T0, idFactory: ids() });
  assert.equal(s.source, 'template');
  assert.equal(s.template_id, 'tpl-1');
  assert.equal(s.linked_altar_id, 'altar-1');
  assert.deepEqual(s.session_steps.map((x) => x.title), ['Open', 'Speak', 'Close']);
  assert.deepEqual(s.session_steps.map((x) => x.status), ['active', 'pending', 'pending']);
  assert.equal(s.session_steps[0].template_step_id, 'ts-1');
  assert.equal(s.session_steps[0].started_at, T0.toISOString());
  assert.equal(s.event_log[0].type, 'template_session_started');
  assert.equal((s.metadata.templateSnapshot as { steps: unknown[] }).steps.length, 3);
  assert.equal(s.context_snapshot.dayOfWeek, 'Friday');
  assert.equal(s.context_snapshot.timeOfDay, 'Evening');
});

test('stepping through: complete, skip, pause and resume keep honest times', () => {
  let s = createSession({ kind: 'template', template }, { userId: 'u1', now: T0, idFactory: ids() });
  s = completeStep(s, at(60));
  assert.equal(s.session_steps[0].status, 'completed');
  assert.equal(s.session_steps[0].elapsed_seconds, 60);
  assert.equal(currentStep(s)?.title, 'Speak');
  assert.equal(s.current_step_order, 1);

  s = pauseSession(s, at(90));
  assert.equal(s.status, 'paused');
  assert.equal(currentStep(s)?.elapsed_seconds, 30);
  assert.equal(timedStepDue(s, at(10_000)), false, 'paused timers never fire');

  s = resumeSession(s, at(150));
  assert.equal(s.paused_seconds, 60);
  assert.equal(timedStepDue(s, at(200)), false);
  assert.equal(timedStepDue(s, at(240)), true, '30s before + 90s after the pause = 120s timer');

  s = skipStep(s, at(240));
  assert.equal(s.session_steps[1].status, 'skipped');
  assert.equal(currentStep(s)?.title, 'Close');

  s = finishSession(s, 'completed', at(300));
  assert.equal(s.status, 'completed');
  assert.equal(s.ended_at, at(300).toISOString());
  assert.equal(sessionElapsed(s, at(9999)), 240, 'five minutes minus the one-minute pause');
  assert.deepEqual(
    s.event_log.map((e) => e.type),
    ['template_session_started', 'step_completed', 'session_paused', 'session_resumed', 'step_skipped', 'session_completed'],
  );
  assert.equal(finishSession(s, 'abandoned', at(400)), s, 'finishing twice changes nothing');
});

test('events with the same idempotency key are only logged once', () => {
  const s = createSession({ kind: 'free', title: 'Quiet', intention: '' }, { userId: null, now: T0, idFactory: ids() });
  const once = appendEvent(s, { type: 'note', idempotencyKey: 'k' }, at(1));
  const twice = appendEvent(once, { type: 'note', idempotencyKey: 'k' }, at(2));
  assert.equal(twice.event_log.length, 2);
  assert.equal(s.source, 'manual');
  assert.equal(s.session_steps.length, 0);
});

test('session rows carry only real columns and round-trip', () => {
  const s = createSession({ kind: 'template', template }, { userId: null, now: T0, idFactory: ids() });
  const row = sessionRow(s, 'u1');
  assert.equal(row.user_id, 'u1');
  assert.equal('session_steps' in row, false);
  const steps = sessionStepRows(s, 'u1');
  assert.ok(steps.every((x) => x.user_id === 'u1' && x.session_id === s.id));
  const back = sessionFromRows(row, [...steps].reverse());
  assert.deepEqual(back.session_steps.map((x) => x.sort_order), [0, 1, 2]);
});

test('journal payload matches the website’s user_rituals fields', () => {
  let s = createSession({ kind: 'template', template }, { userId: 'u1', now: T0, idFactory: ids() });
  s = finishSession(completeStep(s, at(60)), 'completed', at(600));
  const answers = { ...blankAnswers(s, T0), what_happened_during: '  Candle flickered ', notes: '' };
  const j = journalPayload({ session: s, answers, userId: 'u1', id: 'j1', now: at(700) });
  assert.equal(j.title, 'Full moon offering');
  assert.equal(j.source, 'template');
  assert.equal(j.session_id, s.id);
  assert.equal(j.template_id, 'tpl-1');
  assert.equal(j.ritual_date, '2026-09-25');
  assert.equal(j.duration_seconds, 600);
  assert.equal(j.day_of_week, 'Friday');
  assert.equal(j.time_of_day, 'Evening');
  assert.equal(j.what_happened_during, 'Candle flickered');
  assert.equal(j.notes, null);
  assert.equal(j.moon_phase, answers.moon_phase);
  assert.equal((j.metadata.completedSteps as unknown[]).length, 3);

  const row = journalRow(j, 'u1');
  assert.equal('created_at' in row, false, 'the database sets timestamps');
  assert.equal(row.user_id, 'u1');
});

test('a hand-recorded ritual uses the typed date and minutes', () => {
  const answers = { ...blankAnswers(null, T0), title: 'Salt bath', ritual_date: '2026-09-01', manual_minutes: '20' };
  const j = journalPayload({ session: null, answers, userId: null, id: 'j2', now: T0 });
  assert.equal(j.source, 'manual');
  assert.equal(j.ritual_date, '2026-09-01');
  assert.equal(j.duration_seconds, 1200);
  assert.equal(j.day_of_week, 'Tuesday');
  assert.equal(j.session_id, null);
});

test('template payload replaces steps and totals the timers', () => {
  const draft = draftFromTemplate(template);
  assert.deepEqual(draft.steps.map((s) => s.minutes), ['', '2', '']);
  draft.steps[2].minutes = '1.5';
  draft.steps[2].completion_mode = 'timed';
  draft.steps[0].completion_mode = 'timed'; // no timer, so it stays manual
  const { template: row, steps } = templatePayload(draft, { userId: 'u1', id: 'tpl-1', stepIds: ['a', 'b', 'c'] });
  assert.equal(row.estimated_duration_seconds, 210);
  assert.equal(row.status, 'active');
  assert.equal(row.grimoire_page_id, 'page-9');
  assert.deepEqual(steps.map((s) => [s.id, s.sort_order, s.completion_mode, s.duration_seconds]), [
    ['a', 0, 'manual', null],
    ['b', 1, 'timed', 120],
    ['c', 2, 'timed', 90],
  ]);
  assert.deepEqual(steps[0].actions, [{ type: 'light_all', when: 'start' }]);
});

test('drafts need a name and titled steps, as on the website', () => {
  const draft = draftFromTemplate(null);
  assert.equal(validateDraft(draft), 'Name the ritual first.');
  draft.title = 'X';
  assert.equal(validateDraft(draft), 'Each ritual step needs a title.');
  draft.steps[0].title = 'Begin';
  assert.equal(validateDraft(draft), null);
});

test('links are unique by the website’s identity', () => {
  const j = { id: 'j1', linked_altar_id: 'altar-1' } as JournalRow;
  const basil = { ref: 'traditional/herb/basil', name: 'Basil', type: 'herb' };
  const links = journalLinks(j, 'u1', [basil, basil]);
  assert.deepEqual(links.map((l) => l.link_type), ['used_entity', 'altar']);
  assert.equal(uniqueLinks(links, links).length, 0);
  assert.equal(templateLinks('t', 'u1', [basil])[0].template_id, 't');
  const entry = journalLibraryEntry({ ...j, title: 'Rite', ritual_date: '2026-09-25' } as JournalRow, 'u1', T0);
  assert.equal(entry.entity_id, 'ritual:j1');
  assert.equal(entry.my_practice.Date, '2026-09-25');
});

test('minutes and clocks', () => {
  assert.equal(minutesToSeconds(''), null);
  assert.equal(minutesToSeconds('0'), null);
  assert.equal(minutesToSeconds('2,5'), 150);
  assert.equal(formatClock(65), '01:05');
  assert.equal(formatClock(3723), '1:02:03');
});

// ---------------------------------------------------------------- planner

test('tides: new and full only on the nights around the exact phase', () => {
  assert.equal(tideOf('Full Moon', 0.5), 'full');
  assert.equal(tideOf('Waxing Gibbous', 0.4), 'waxing');
  assert.equal(tideOf('Last Quarter', 0.75), 'waning');
});

test('love on a waxing Friday beats a waxing Tuesday; waning never suits it', () => {
  const love = intentionByKey('love')!;
  // Full moon Sept 26 2026 16:49 UTC; Sept 18 and 22 are waxing.
  const friday = scoreNight(love, new Date(2026, 8, 18, 21));
  const tuesday = scoreNight(love, new Date(2026, 8, 22, 21));
  assert.equal(friday.tide, 'waxing');
  assert.equal(friday.planet, 'Venus');
  assert.ok(friday.score > tuesday.score);
  assert.match(friday.reason, /Waxing moon · Venus's day/);
  const waning = scoreNight(love, new Date(2026, 9, 2, 21));
  assert.equal(waning.tide, 'waning');
  assert.equal(waning.score, 0);
});

test('suggested nights are in date order, qualify on the moon, and mark one best', () => {
  const from = new Date(2026, 8, 25, 10);
  for (const intention of INTENTIONS) {
    const nights = suggestNights(intention, from);
    assert.ok(nights.length > 0 && nights.length <= 5, intention.key);
    assert.equal(nights.filter((n) => n.best).length, 1);
    for (let i = 1; i < nights.length; i += 1) assert.ok(nights[i].date > nights[i - 1].date);
    assert.ok(nights.every((n) => intention.tides.includes(n.tide)));
    assert.ok(nights.every((n) => n.date.getHours() === 21));
  }
  const banishing = suggestNights(intentionByKey('banishing')!, from);
  const best = banishing.find((n) => n.best)!;
  assert.ok(best.planet === 'Saturn' || best.tide === 'new', 'best banishing night is a Saturday or the dark moon');
});

test('tonight is skipped once the evening has passed', () => {
  const late = new Date(2026, 8, 18, 23, 30);
  const nights = suggestNights(intentionByKey('love')!, late, { days: 3, count: 3 });
  assert.ok(nights.every((n) => n.date.getDate() !== 18));
});

test('ingredients come from the Library and fit the intention', () => {
  const s = suggestIngredients(intentionByKey('prosperity')!);
  assert.ok(s.herb.some((i) => i.name === 'Basil' || i.name === 'Cinnamon'));
  assert.ok(s.crystal.some((i) => i.name === 'Citrine' || i.name === 'Pyrite'));
  assert.ok(s.candle.some((i) => i.name === 'Green Candle' || i.name === 'Gold Candle'));
  assert.ok(s.herb.length <= 4 && s.crystal.length <= 3 && s.candle.length <= 2);
  assert.ok(LIBRARY_ITEMS.every((i) => i.ref.startsWith(`traditional/${i.type}/`)));
});

test('the spell builder turns choices into a runnable template', () => {
  const pick = (name: string) => toIngredient(LIBRARY_ITEMS.find((i) => i.name === name)!);
  const draft = buildSpell({
    name: '',
    intention: intentionByKey('prosperity'),
    purpose: 'steady work',
    petition: 'Let abundance find its way to me.',
    ingredients: [pick('Green Candle'), pick('Basil'), pick('Cinnamon'), pick('Citrine')],
    focusMinutes: '10',
  });
  assert.equal(draft.title, 'Prosperity spell');
  assert.equal(draft.kind, 'spell');
  assert.equal(validateDraft(draft), null);
  assert.match(draft.steps[1].instructions, /green candle with basil and cinnamon/);
  assert.match(draft.steps[1].instructions, /citrine/);
  assert.equal(draft.steps[2].spoken_text, 'Let abundance find its way to me.');
  assert.equal(draft.steps[3].completion_mode, 'timed');
  assert.equal(draft.steps[3].minutes, '10');
  assert.match(draft.preparation, /Green Candle, Basil, Cinnamon and Citrine/);

  const session = createSession({ kind: 'draft', draft }, { userId: null, now: T0, idFactory: ids() });
  assert.equal(session.session_steps.length, 5);
  assert.equal(session.session_steps[3].duration_seconds, 600);
  assert.equal((session.metadata.ingredients as unknown[]).length, 4);
  assert.equal(session.template_id, null);
});

// ---------------------------------------------------------------- plans and journal

const plan = (id: string, date: string, time = '21:00'): RitualPlan => ({
  id,
  date,
  time,
  title: id,
  intention: null,
  intentionKey: null,
  templateId: null,
  draft: null,
  ingredients: [],
  createdAt: '',
});

test('the next working is the soonest plan from today on', () => {
  const now = new Date(2026, 8, 25, 22);
  const plans = [plan('later', '2026-10-02'), plan('past', '2026-09-20'), plan('tonight', '2026-09-25', '20:00')];
  assert.deepEqual(upcomingPlans(plans, now).map((p) => p.id), ['tonight', 'later']);
  assert.equal(nextPlan(plans, now)?.id, 'tonight');
  assert.equal(nextPlan([plan('past', '2026-09-20')], now), null);
  assert.equal(planStart(plan('x', '2026-10-02', '7:30'))?.getHours(), 7);
});

test('journal order and one-tap connections', () => {
  const entries = [
    { id: 'a', ritual_date: '2026-09-01', created_at: '2026-09-01T10:00:00Z' },
    { id: 'b', ritual_date: '2026-09-20', created_at: '2026-09-20T10:00:00Z' },
  ] as JournalRow[];
  assert.deepEqual(sortJournal(entries).map((e) => e.id), ['b', 'a']);

  const entry = { id: 'b', ritual_date: '2026-09-20', template_id: 'tpl-1', grimoire_page_id: null, linked_altar_id: null, metadata: {} } as unknown as JournalRow;
  const links = [
    { user_id: 'u', ritual_id: 'b', link_type: 'grimoire_page', grimoire_page_id: 'page-1', metadata: {} },
    { user_id: 'u', ritual_id: 'b', link_type: 'used_entity', entity_id: 'traditional/herb/bay', label: 'Bay', metadata: {} },
    { user_id: 'u', ritual_id: 'other', link_type: 'altar', saved_altar_id: 'nope', metadata: {} },
  ];
  const c = journalConnections(entry, links, [template]);
  assert.equal(c.grimoirePageId, 'page-1');
  assert.equal(c.altarId, 'altar-1', 'falls back to the template’s altar');
  assert.equal(c.templateId, 'tpl-1');
  assert.deepEqual(c.ingredients, [{ ref: 'traditional/herb/bay', name: 'Bay' }]);
});
