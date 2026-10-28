import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  canCheck,
  canPass,
  canSignDirectly,
  covenCalendarNames,
  covenHolidayChoice,
  covenHolidaysBetween,
  daysLeft,
  enrollmentSummary,
  holidayName,
  programOutline,
  programPermissions,
  signedOffWords,
  signsOffAsHead,
  stagesPayload,
  taskState,
  templatesFor,
  trainingToSignOff,
  validateProgram,
  waitingForMe,
  type Enrollment,
  type ProgramStage,
  type ProgramTask,
  type ProgramTemplate,
  type TaskProgress,
} from '../src/lib/covens/programs.ts';
import { covenTodayItems } from '../src/lib/covens/today.ts';
import { permissions } from '../src/lib/covens/model.ts';

const stage = (id: string, position: number, over: Partial<ProgramStage> = {}): ProgramStage => ({ id, program_id: 'p1', coven_id: 'c1', position, title: `Stage ${position}`, intro: null, min_days: null, passed_by: 'mentor', ...over });
const task = (id: string, stageId: string, position: number, over: Partial<ProgramTask> = {}): ProgramTask => ({
  id,
  stage_id: stageId,
  program_id: 'p1',
  coven_id: 'c1',
  position,
  title: `Task ${id}`,
  kind: 'practice',
  instructions: null,
  resources: null,
  times: 1,
  response: 'none',
  checked_by: 'mentor',
  holiday: null,
  minutes: null,
  optional: false,
  ...over,
});
const enrollment = (over: Partial<Enrollment> = {}): Enrollment => ({ id: 'e1', program_id: 'p1', coven_id: 'c1', user_id: 'rowan', status: 'active', stage_id: 's1', stage_started_at: '2026-10-01T00:00:00Z', started_at: '2026-10-01T00:00:00Z', completed_at: null, ...over });
const row = (taskId: string, status: TaskProgress['status'], over: Partial<TaskProgress> = {}): TaskProgress => ({
  id: `r-${taskId}`,
  enrollment_id: 'e1',
  task_id: taskId,
  program_id: 'p1',
  coven_id: 'c1',
  user_id: 'rowan',
  times_done: 1,
  status,
  response: null,
  submitted_at: null,
  checked_by: null,
  checked_at: null,
  feedback: null,
  ...over,
});

const stages = [stage('s1', 1, { min_days: 30 }), stage('s2', 2, { passed_by: 'manager' })];
const tasks = [task('t1', 's1', 1, { checked_by: 'self', times: 3 }), task('t2', 's1', 2, { response: 'text' }), task('t3', 's1', 3, { optional: true }), task('t4', 's2', 1, { checked_by: 'manager' })];
const outline = programOutline('p1', stages, tasks);

test('a program outline puts stages and their tasks in order', () => {
  assert.deepEqual(outline.map((s) => [s.id, s.tasks.map((t) => t.id)]), [['s1', ['t1', 't2', 't3']], ['s2', ['t4']]]);
});

test('progress counts required tasks, the stage’s least time, and what comes next', () => {
  const now = Date.parse('2026-10-15T00:00:00Z');
  let s = enrollmentSummary(enrollment(), outline, [row('t1', 'in_progress', { times_done: 2 })], now);
  assert.equal(s.stage?.id, 's1');
  assert.equal(s.required, 3);
  assert.equal(s.approved, 0);
  assert.equal(s.tasksLeft, 2);
  assert.equal(s.daysLeft, 16);
  assert.equal(s.next?.id, 't1');
  assert.equal(s.ready, false);

  s = enrollmentSummary(enrollment(), outline, [row('t1', 'approved'), row('t2', 'submitted')], now);
  assert.equal(s.waiting, 1);
  assert.equal(s.percent, 33);
  assert.equal(s.next, undefined === s.next ? undefined : s.next);

  s = enrollmentSummary(enrollment(), outline, [row('t1', 'approved'), row('t2', 'approved')], Date.parse('2026-11-05T00:00:00Z'));
  assert.equal(s.tasksLeft, 0);
  assert.equal(s.daysLeft, 0);
  assert.equal(s.ready, true);

  s = enrollmentSummary(enrollment({ status: 'completed', stage_id: null }), outline, [], now);
  assert.equal(s.percent, 100);
  assert.equal(s.ready, false);
  assert.equal(daysLeft(undefined, enrollment(), now), 0);
});

test('task states read as people see them', () => {
  assert.equal(taskState(tasks[0], undefined).label, '0 of 3');
  assert.equal(taskState(tasks[0], row('t1', 'in_progress', { times_done: 2 })).label, 'Begun · 2 of 3');
  assert.equal(taskState(tasks[1], row('t2', 'submitted')).label, 'Waiting for sign-off');
  assert.equal(taskState(tasks[1], row('t2', 'returned')).state, 'returned');
});

test('who signs off and who passes a stage', () => {
  const mentor = { self: false, mentor: true, programs: false };
  const manager = { self: false, mentor: false, programs: true };
  const person = { self: true, mentor: false, programs: false };
  assert.equal(canCheck({ checked_by: 'mentor' }, mentor), true);
  assert.equal(canCheck({ checked_by: 'manager' }, mentor), false);
  assert.equal(canCheck({ checked_by: 'manager' }, manager), true);
  assert.equal(canCheck({ checked_by: 'mentor' }, person), false);
  assert.equal(canCheck({ checked_by: 'mentor' }, { ...manager, self: true }), false);
  assert.equal(canPass({ passed_by: 'mentor' }, mentor), true);
  assert.equal(canPass({ passed_by: 'manager' }, mentor), false);
  assert.equal(canPass({ passed_by: 'self' }, person), true);
  assert.equal(canPass({ passed_by: 'self' }, mentor), false);
  assert.equal(canPass({ passed_by: 'manager' }, manager), true);
});

test('the coven’s head signs off anyone’s training, her own too; no one else signs their own', () => {
  const head = { self: true, mentor: false, programs: true, head: true };
  for (const checked_by of ['self', 'mentor', 'manager'] as const) assert.equal(canCheck({ checked_by }, head), true);
  for (const passed_by of ['self', 'mentor', 'manager'] as const) assert.equal(canPass({ passed_by }, head), true);
  assert.equal(canCheck({ checked_by: 'manager' }, { ...head, self: false }), true);
  // A manager or mentor on their own work: still no.
  assert.equal(canCheck({ checked_by: 'mentor' }, { self: true, mentor: true, programs: true }), false);
  assert.equal(canPass({ passed_by: 'manager' }, { self: true, mentor: false, programs: true }), false);
  assert.equal(canPass({ passed_by: 'mentor' }, { self: true, mentor: true, programs: false }), false);
  // Who counts as the head: the founder or a mother coven's head, in good standing.
  assert.equal(signsOffAsHead({ founder: true }, true), true);
  assert.equal(signsOffAsHead({ founder: false, ancestor: true }, true), true);
  assert.equal(signsOffAsHead({ founder: true }, false), false);
  assert.equal(signsOffAsHead({ founder: false }, true), false);
  // Her own waiting work shows for her, and only as head.
  const progress = [row('t2', 'submitted', { id: 'mine', user_id: 'me' }), row('t2', 'submitted')];
  assert.deepEqual(waitingForMe(progress, tasks, { userId: 'me', mentees: [], programs: true, head: true }).map((p) => p.id), ['mine', 'r-t2']);
  assert.deepEqual(waitingForMe(progress, tasks, { userId: 'me', mentees: [], programs: true }).map((p) => p.id), ['r-t2']);
  // Said honestly.
  const nameOf = (id: string) => ({ hazel: 'Hazel', rowan: 'Rowan' })[id] ?? 'A witch';
  assert.equal(signedOffWords('hazel', 'hazel', nameOf, false), 'Hazel, the coven’s head (their own training)');
  assert.equal(signedOffWords('hazel', 'rowan', nameOf, false), 'Hazel');
  assert.equal(signedOffWords('rowan', 'rowan', nameOf, true), 'Rowan');
  assert.equal(signedOffWords(null, 'rowan', nameOf, false), '');
});

test('signing off directly: any unfinished step in a stage reached, for those who may sign it', () => {
  const head = { self: true, mentor: false, programs: true, head: true };
  const manager = { self: false, mentor: false, programs: true };
  const e = enrollment();
  assert.equal(canSignDirectly(tasks[1], undefined, e, false, head), true);
  assert.equal(canSignDirectly(tasks[1], row('t2', 'in_progress'), e, false, manager), true);
  assert.equal(canSignDirectly(tasks[1], row('t2', 'approved'), e, false, manager), false);
  assert.equal(canSignDirectly(tasks[3], undefined, e, true, head), false);
  assert.equal(canSignDirectly(tasks[1], undefined, enrollment({ status: 'paused' }), false, head), false);
  assert.equal(canSignDirectly(tasks[1], undefined, e, false, { ...manager, self: true }), false);
});

test('training to sign off: work sent, stages ready, the head’s own too', () => {
  const at = Date.parse('2026-12-01T00:00:00Z');
  const ready = enrollment({ id: 'e2', user_id: 'me', stage_started_at: '2026-01-01T00:00:00Z' });
  const theirs = enrollment({ stage_started_at: '2026-01-01T00:00:00Z' });
  const done = [row('t1', 'approved'), row('t2', 'approved')];
  const mine = done.map((r) => ({ ...r, id: `${r.id}-me`, enrollment_id: 'e2', user_id: 'me' }));
  const input = { enrollments: [theirs, ready], stages, tasks, progress: [...done, ...mine] };
  const asHead = trainingToSignOff(input, { userId: 'me', mentees: [], programs: true, head: true }, at);
  assert.deepEqual(asHead.stages.map((s) => [s.enrollment.id, s.stage.id, s.last]), [['e1', 's1', false], ['e2', 's1', false]]);
  const asManager = trainingToSignOff(input, { userId: 'me', mentees: [], programs: true }, at);
  assert.deepEqual(asManager.stages.map((s) => s.enrollment.id), ['e1'], 'a manager’s own stage isn’t theirs to pass');
  const asOther = trainingToSignOff(input, { userId: 'x', mentees: [], programs: false }, at);
  assert.deepEqual(asOther, { tasks: [], stages: [] });
  // Not ready yet (days left): not listed.
  assert.deepEqual(trainingToSignOff({ ...input, enrollments: [enrollment({ stage_started_at: '2026-11-20T00:00:00Z' })] }, { userId: 'me', mentees: [], programs: true }, at).stages, []);
});

test('work waiting for sign-off: mentees’ for mentors, everyone’s for managers', () => {
  const progress = [row('t2', 'submitted'), row('t4', 'submitted', { id: 'r2' }), row('t2', 'submitted', { id: 'r3', user_id: 'me' })];
  assert.deepEqual(waitingForMe(progress, tasks, { userId: 'me', mentees: ['rowan'], programs: false }).map((p) => p.id), ['r-t2']);
  assert.deepEqual(waitingForMe(progress, tasks, { userId: 'me', mentees: [], programs: true }).map((p) => p.id), ['r-t2', 'r2']);
  assert.deepEqual(waitingForMe(progress, tasks, { userId: 'other', mentees: [], programs: false }), []);
});

test('program powers come from positions, names, or founding', () => {
  const base = { member: true, founder: false, open: true, grants: [], userId: 'u' };
  assert.deepEqual(programPermissions({ ...base, rank: { can_manage_programs: true } }), { programs: true, progress: true });
  assert.deepEqual(programPermissions({ ...base, rank: { can_view_progress: true } }), { programs: false, progress: true });
  assert.deepEqual(programPermissions({ ...base, rank: null, grants: [{ coven_id: 'c1', user_id: 'u', power: 'view_progress' }] }), { programs: false, progress: true });
  assert.deepEqual(programPermissions({ ...base, rank: null }), { programs: false, progress: false });
  assert.deepEqual(programPermissions({ ...base, rank: null, founder: true }), { programs: true, progress: true });
  assert.deepEqual(programPermissions({ ...base, rank: { can_manage_programs: true }, open: false }), { programs: false, progress: false });
  // The coven model's permissions agree.
  const perms = permissions({
    coven: { id: 'c1', slug: 'c', name: 'C', tagline: null, description: null, tradition: null, tags: [], meeting_rhythm: null, joining: 'open', visibility: 'listed', status: 'active', moderation_note: null, application_questions: [], altar_background: null, founder_id: 'f', created_at: '' },
    membership: { coven_id: 'c1', user_id: 'u', rank_id: null, status: 'active', muted_until: null, joined_at: '' },
    ranks: [],
    userId: 'u',
    grants: [{ user_id: 'u', power: 'manage_programs' }],
  });
  assert.equal(perms.programs, true);
  assert.equal(perms.progress, true);
});

test('validating and sending a program', () => {
  assert.deepEqual(validateProgram({ title: ' ' }, []), ['Give the program a title.']);
  assert.deepEqual(validateProgram({ title: 'X', status: 'open' }, []), ['Add a stage before opening the program.']);
  const draft = [{ title: 'S', intro: ' Hi ', min_days: 366, passed_by: 'mentor' as const, tasks: [{ title: ' Read ', kind: 'study' as const, instructions: '', resources: '', times: 2, response: 'none' as const, checked_by: 'self' as const, holiday: '', minutes: null, optional: false }] }];
  assert.deepEqual(validateProgram({ title: 'X', status: 'open' }, draft), []);
  const payload = stagesPayload(draft);
  assert.equal(payload[0].intro, 'Hi');
  assert.equal(payload[0].tasks[0].title, 'Read');
  assert.equal(payload[0].tasks[0].holiday, null);
  assert.equal(payload[0].tasks[0].instructions, null);
  assert.equal(validateProgram({ title: 'X' }, [{ ...draft[0], tasks: [{ ...draft[0].tasks[0], times: 0 }] }]).length, 1);
});

test('the coven calendar: its holidays, names and ready-made programs', () => {
  const coven = { practice_traditions: ['wheel'], practice_holidays: ['wheel/samhain'], practice_custom: [{ id: 'f', name: 'Founding day', month: 2, day: 1 }] };
  assert.deepEqual(covenHolidayChoice(coven).picked, ['wheel/samhain']);
  const year = covenHolidaysBetween(coven, new Date(2026, 0, 1), new Date(2026, 11, 31));
  assert.deepEqual(year.map((h) => h.name).sort(), ['Founding day', 'Samhain']);
  assert.deepEqual(covenHolidaysBetween({}, new Date(2026, 0, 1), new Date(2026, 11, 31)), []);
  assert.deepEqual(covenCalendarNames(coven), ['Wheel of the Year', 'the coven’s own days']);
  assert.equal(holidayName('wheel/samhain'), 'Samhain');
  assert.equal(holidayName('nope/x'), '');
  const t = (id: string, tradition: string, position: number) => ({ id, kind: 'initiation', tradition, title: id, summary: null, description: null, stages: [], position }) as ProgramTemplate;
  const { suggested, others } = templatesFor([t('b', 'norse', 2), t('a', 'wheel', 1), t('c', 'hellenic', 3)], coven);
  assert.deepEqual(suggested.map((x) => x.id), ['a']);
  assert.deepEqual(others.map((x) => x.id), ['b', 'c']);
});

test('Today: your turn first, then rites, your next task and sign-offs', () => {
  const now = new Date('2026-10-24T12:00:00Z');
  const items = covenTodayItems(
    {
      userId: 'rowan',
      covens: [{ id: 'c1', slug: 'moon', name: 'Moon Circle', founder_id: 'f' }],
      memberships: [{ coven_id: 'c1', user_id: 'rowan', rank_id: 'r1', status: 'active' }],
      programCovens: [],
      rituals: [
        { id: 'live', coven_id: 'c1', title: 'Candle circle', status: 'live', scheduled_for: null, current_step_id: 'st' },
        { id: 'soon', coven_id: 'c1', title: 'Full moon rite', status: 'scheduled', scheduled_for: '2026-10-26T20:00:00Z', current_step_id: null },
        { id: 'far', coven_id: 'c1', title: 'Yule', status: 'scheduled', scheduled_for: '2026-12-21T20:00:00Z', current_step_id: null },
      ],
      steps: [{ id: 'st', ritual_id: 'live', assigned_user_id: null, assigned_rank_id: 'r1', title: 'Light together' }],
      rsvps: [{ ritual_id: 'soon', user_id: 'rowan', response: 'going' }],
      programs: [{ id: 'p1', coven_id: 'c1', kind: 'initiation', title: 'First Degree', summary: null, description: null, template_id: null, award_rank_id: null, self_enroll: false, status: 'open', position: 0 }],
      stages,
      tasks,
      enrollments: [enrollment()],
      progress: [],
      mentors: [{ coven_id: 'c1', user_id: 'sage', mentor_id: 'rowan', assigned_at: '' }],
    },
    now,
  );
  assert.deepEqual(items.map((i) => i.kind), ['turn', 'rite', 'task']);
  assert.equal(items[0].title, 'It’s your turn: Light together');
  assert.match(items[1].detail, /You’re going\./);
  assert.match(items[2].detail, /^Stage 1 · Next: Task t1$/);
});
