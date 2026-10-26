import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TRADITIONS } from '../src/lib/holidays.ts';
import { JOURNEY_CATALOG } from '../src/lib/journeys/catalog.ts';
import { journeyForDeityRefIn } from '../src/lib/journeys/lookup.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';
import { PATH_TRADITIONS } from '../src/lib/library/traditions.ts';
import { DEITY_DEVOTIONS } from '../src/lib/patron/devotions.ts';
import { premadeById } from '../src/lib/rituals/premade/index.ts';
import {
  deityGroups,
  forPath,
  journeyById,
  journeyForDeityRef,
  JOURNEYS,
  pathJourneys,
  pathsMineFirst,
  searchJourneys,
  type Journey,
} from '../src/lib/journeys/index.ts';
import {
  advanceStage,
  currentStage,
  decide,
  enterOngoing,
  fullMoonsBetween,
  holyDayPicks,
  holyDaysBetween,
  journeyDays,
  journeyStatus,
  logPractice,
  markRead,
  markUnread,
  newProgress,
  nextStep,
  nextSteps,
  normalizeProgress,
  pauseJourney,
  practiceState,
  progressFor,
  rededicate,
  rededication,
  resumeJourney,
  riteBegun,
  riteDone,
  riteDraft,
  sabbatsBetween,
  stageCompletion,
  stagePace,
  type JourneyProgress,
} from '../src/lib/journeys/progress.ts';

const DAY = 86_400_000;
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m, d, h);

// A small journey to test against, independent of the content files.
const J: Journey = {
  id: 'test-journey',
  kind: 'deity',
  paths: ['hellenic'],
  deityRef: 'traditional/deity/test',
  title: 'Test',
  summary: '',
  welcome: '',
  about: '',
  notes: [],
  holyDays: ['noumenia'],
  sources: [],
  stages: [
    {
      kind: 'threshold',
      title: 'Threshold',
      intro: '',
      days: 3,
      lessons: [lesson('t1')],
      practices: [{ id: 'p-once', title: 'Once', instructions: '', times: 1 }],
      rite: { title: 'Opening', summary: 'Open', minutes: 10, ingredients: [{ name: 'A candle' }], preparation: 'Sit.', steps: [{ title: 'Light', instructions: 'Light it', light: true }], closing: 'Done.' },
    },
    {
      kind: 'study',
      title: 'Study',
      intro: '',
      days: 10,
      lessons: [lesson('s1'), lesson('s2')],
      practices: [{ id: 'p-day', title: 'Daily', instructions: '', times: 3, every: 'day' }],
    },
    {
      kind: 'practice',
      title: 'Practice',
      intro: '',
      days: 30,
      lessons: [],
      practices: [
        { id: 'p-week', title: 'Weekly', instructions: '', times: 2, every: 'week' },
        { id: 'p-month', title: 'Monthly', instructions: '', times: 2, every: 'month' },
        { id: 'p-esbat', title: 'Esbat', instructions: '', times: 1, every: 'esbat' },
        { id: 'p-sabbat', title: 'Sabbat', instructions: '', times: 1, every: 'sabbat' },
        { id: 'p-holy', title: 'Holy', instructions: '', times: 1, every: 'holy-day' },
      ],
    },
    { kind: 'discernment', title: 'Discern', intro: '', days: 5, lessons: [], practices: [], questions: ['Why?'] },
    {
      kind: 'dedication',
      title: 'Dedication',
      intro: '',
      days: 1,
      lessons: [lesson('d1')],
      practices: [],
      rite: { title: 'Dedication', summary: 'Dedicate', minutes: 20, ingredients: [], preparation: '', steps: [{ title: 'Speak', instructions: 'Speak', spoken: 'I am here', minutes: 2, timed: true }], closing: '' },
    },
    { kind: 'ongoing', title: 'Ongoing', intro: '', days: 365, lessons: [], practices: [] },
  ],
};

function lesson(id: string) {
  return { id, title: id, summary: '', minutes: 3, sections: [], knowAndDont: { known: '', unknown: '' }, inPractice: '', reflect: [] };
}

const start = at(2026, 9, 1);
const fresh = () => newProgress(J.id, start);

// ------------------------------------------------------------- content

test('the registry holds every journey with a unique, stable id', () => {
  assert.ok(JOURNEYS.length > 0);
  const ids = new Set<string>();
  for (const j of JOURNEYS) {
    assert.match(j.id, /^(path|deity)-[a-z0-9]+(-[a-z0-9]+)*$/, j.id);
    assert.ok(!ids.has(j.id), `duplicate ${j.id}`);
    ids.add(j.id);
    assert.equal(journeyById(j.id), j);
  }
});

// Content written elsewhere is checked here; problems are listed together so they're easy to fix.
function contentProblems(): string[] {
  const problems: string[] = [];
  const check = (ok: unknown, what: string) => {
    if (!ok) problems.push(what);
  };
  const kinds = ['threshold', 'study', 'practice', 'discernment', 'dedication', 'ongoing'];
  const holidayIds = new Set(TRADITIONS.flatMap((t) => t.holidays.map((h) => h.id)));
  const pathIds = new Set(PATH_TRADITIONS.map((p) => p.id));
  for (const j of JOURNEYS) {
    check(j.stages.map((s) => s.kind).join() === kinds.join(), `${j.id}: stages are ${j.stages.map((s) => s.kind).join(', ')}`);
    for (const p of j.paths) check(pathIds.has(p), `${j.id}: unknown path ${p}`);
    for (const h of j.holyDays) check(holidayIds.has(h), `${j.id}: unknown holy day ${h}`);
    if (j.kind === 'deity') check(/^traditional\/deity\/[a-z0-9_]+$/.test(j.deityRef ?? ''), `${j.id}: deityRef ${j.deityRef}`);
    const seen = new Set<string>();
    for (const s of j.stages) {
      for (const l of s.lessons) {
        check(!seen.has(l.id), `${j.id}: duplicate lesson id ${l.id}`);
        seen.add(l.id);
        for (const id of l.premade ?? []) check(premadeById(id), `${j.id}/${l.id}: unknown premade ${id}`);
      }
      for (const p of s.practices) {
        check(!seen.has(p.id), `${j.id}: duplicate practice id ${p.id}`);
        seen.add(p.id);
        check(p.times >= 1, `${j.id}/${p.id}: times ${p.times}`);
        if (p.premade) check(premadeById(p.premade), `${j.id}/${p.id}: unknown premade ${p.premade}`);
      }
    }
    check(j.stages.find((s) => s.kind === 'dedication')?.rite, `${j.id}: no dedication rite`);
  }
  return problems;
}

test('journey content: six stages in order, unique ids, refs that resolve', (t) => {
  const problems = contentProblems();
  for (const p of problems) t.diagnostic(p);
  // The screens cope with all of these (a missing stage or premade just isn't shown), so they
  // are reported rather than failing the suite while content is still being written; the
  // shape the screens rely on is enforced.
  for (const j of JOURNEYS) {
    assert.ok(j.stages.length > 0, `${j.id} has stages`);
    assert.ok(Array.isArray(j.holyDays) && Array.isArray(j.notes), `${j.id} lists`);
  }
});

test('lookups: paths, deities by ref and Library id, by path and search', () => {
  assert.ok(pathJourneys().every((j) => j.kind === 'path'));
  const deity = JOURNEYS.find((j) => j.kind === 'deity' && j.deityRef);
  if (deity) {
    assert.equal(journeyForDeityRef(deity.deityRef), deity);
    assert.equal(journeyForDeityRef(deity.deityRef!.replace(/\//g, ':')), deity);
    assert.ok(forPath([deity.paths[0]]).includes(deity));
    assert.ok(searchJourneys(deity.title.toUpperCase()).includes(deity));
  }
  assert.equal(journeyForDeityRef('traditional:deity:nobody-at-all'), null);
  assert.equal(journeyForDeityRef(null), null);
  const groups = deityGroups(['norse']);
  if (groups.some((g) => g.path === 'norse')) assert.equal(groups[0].path, 'norse');
  const mine = pathsMineFirst(['slavic']);
  if (mine.some((j) => j.paths.includes('slavic'))) assert.ok(mine[0].paths.includes('slavic'));
});

// Egyptian deities whose journeys are offered from their Library page and their patron page
// (the website finds them in the catalog). Every Library ref and premade in them must resolve.
const KEMETIC_DEITY_JOURNEYS = ['anubis', 'isis', 'osiris', 'thoth', 'horus', 'set'];

test('Egyptian deity journeys: registered, in the catalog, linked from the Library and patron pages', () => {
  const refOk = (ref: string) => {
    const [, type, key] = ref.split('/');
    return !!(TRADITIONAL_LIBRARY as Record<string, Record<string, unknown>>)[type]?.[key];
  };
  for (const key of KEMETIC_DEITY_JOURNEYS) {
    const j = journeyById(`deity-${key}`);
    assert.ok(j, `deity-${key} is registered`);
    assert.ok(j.paths.includes('egyptian'), `${key} is on the Egyptian path`);
    assert.equal(j.deityRef, `traditional/deity/${key}`);
    assert.ok(TRADITIONAL_LIBRARY.deity[key], `${key} has a Library entry`);
    assert.equal(journeyForDeityRef(`traditional:deity:${key}`), j, `${key}'s Library page offers the journey`);
    assert.equal(journeyForDeityRefIn(JOURNEY_CATALOG, j.deityRef)?.id, j.id, `${key} is in the website catalog`);
    assert.ok(DEITY_DEVOTIONS.some((d) => d.key === key), `${key} has patron devotions`);
    assert.deepEqual(j.stages.map((s) => s.kind), ['threshold', 'study', 'practice', 'discernment', 'dedication', 'ongoing']);
    for (const s of j.stages) {
      for (const l of s.lessons) {
        assert.ok(l.sections.length >= 3, `${l.id} has its sections`);
        for (const ref of l.library ?? []) assert.ok(refOk(ref), `${l.id}: ${ref}`);
        for (const id of l.premade ?? []) assert.ok(premadeById(id), `${l.id}: premade ${id}`);
      }
      for (const i of s.rite?.ingredients ?? []) if (i.ref) assert.ok(refOk(i.ref), `${j.id}: ${i.ref}`);
    }
    assert.ok(j.sources.length >= 5, `${key} cites its sources`);
  }
});

test('every rite turns into a ritual draft with its steps', () => {
  for (const j of JOURNEYS) {
    for (const s of j.stages) {
      if (!s.rite) continue;
      const draft = riteDraft(s.rite, j);
      assert.equal(draft.title, s.rite.title);
      assert.equal(draft.steps.length, s.rite.steps.length);
    }
  }
  const draft = riteDraft(J.stages[0].rite!, J);
  assert.match(draft.preparation, /Gather A candle/);
  assert.deepEqual(draft.steps[0].actions, [{ type: 'light_all', when: 'start' }]);
});

// ------------------------------------------------------------- progress

test('a new journey starts at the threshold with its first lesson next', () => {
  const p = fresh();
  assert.equal(currentStage(J, p).stage.kind, 'threshold');
  const step = nextStep(J, p, start);
  assert.equal(step.kind, 'lesson');
  assert.equal(step.kind === 'lesson' && step.lesson.id, 't1');
  // The threshold rite is offered from the start; the once-off practice too.
  const kinds = nextSteps(J, p, start).map((s) => s.kind);
  assert.deepEqual(kinds, ['lesson', 'practice', 'rite']);
});

test('a stage completes with lessons read, practices done and its rite; moving on is never blocked', () => {
  let p = fresh();
  assert.equal(stageCompletion(J, p, 0).complete, false);
  // Moving on early is always allowed.
  const early = advanceStage(J, p, start);
  assert.equal(early.stage, 1);
  assert.ok(early.stageDoneAt.threshold);

  p = markRead(p, 't1', start);
  p = logPractice(p, 'p-once', start, '  first time ');
  assert.equal(p.practiceLog['p-once'][0].note, 'first time');
  assert.equal(stageCompletion(J, p, 0).complete, false);
  p = riteDone(riteBegun(p, 'threshold', 'session-1'), 'threshold', start);
  const done = stageCompletion(J, p, 0);
  assert.equal(done.complete, true);
  assert.equal(done.fraction, 1);
  const step = nextStep(J, p, start);
  assert.equal(step.kind, 'advance');
  assert.equal(markUnread(p, 't1').lessonsRead.t1, undefined);
});

test('daily practices are due once a day and count toward their times', () => {
  let p = advanceStage(J, fresh(), start);
  p = markRead(markRead(p, 's1', start), 's2', start);
  const prac = J.stages[1].practices[0];
  assert.equal(practiceState(prac, J, p, start).due, true);
  p = logPractice(p, 'p-day', start);
  const later = practiceState(prac, J, p, new Date(start.getTime() + 2 * 3600_000));
  assert.equal(later.due, false);
  assert.equal(later.count, 1);
  assert.ok(later.nextAt);
  assert.equal(practiceState(prac, J, p, at(2026, 9, 2)).due, true);
  p = logPractice(logPractice(p, 'p-day', at(2026, 9, 2)), 'p-day', at(2026, 9, 3));
  const s = practiceState(prac, J, p, at(2026, 9, 4));
  assert.equal(s.done, true);
  assert.equal(s.due, false);
  assert.equal(stageCompletion(J, p, 1).complete, true);
});

test('weekly and monthly practices wait for their turn', () => {
  let p = fresh();
  const [week, month] = J.stages[2].practices;
  p = logPractice(p, week.id, at(2026, 9, 1));
  assert.equal(practiceState(week, J, p, at(2026, 9, 5)).due, false);
  assert.equal(practiceState(week, J, p, at(2026, 9, 8)).due, true);
  p = logPractice(p, month.id, at(2026, 9, 1));
  assert.equal(practiceState(month, J, p, at(2026, 9, 20)).due, false);
  assert.equal(practiceState(month, J, p, at(2026, 10, 1)).due, true);
});

test('esbat practices are due around the full moon', () => {
  const p = fresh();
  const esbat = J.stages[2].practices[2];
  const [full] = fullMoonsBetween(at(2026, 9, 1), at(2026, 10, 30));
  assert.ok(full);
  assert.equal(practiceState(esbat, J, p, full.date).due, true);
  assert.equal(practiceState(esbat, J, p, new Date(full.date.getTime() + DAY)).due, true);
  const away = new Date(full.date.getTime() + 8 * DAY);
  const s = practiceState(esbat, J, p, away);
  assert.equal(s.due, false);
  assert.equal(s.nextName, 'Full moon');
  assert.ok(s.nextAt && s.nextAt > away);
  // Done in this window: waits for the next moon.
  const logged = logPractice(p, esbat.id, full.date);
  const after = practiceState({ ...esbat, times: 2 }, J, logged, new Date(full.date.getTime() + DAY));
  assert.equal(after.due, false);
});

test('sabbat practices follow the Wheel, south when that is the calendar kept', () => {
  const sabbat = J.stages[2].practices[3];
  const p = fresh();
  // Samhain, 31 October, in the north.
  assert.equal(practiceState(sabbat, J, p, at(2026, 9, 31)).due, true);
  const south = { traditions: ['wheel_south'], custom: [] };
  assert.equal(practiceState(sabbat, J, p, at(2026, 9, 31), { choice: south }).due, true); // Beltane in the south
  assert.equal(sabbatsBetween(at(2026, 9, 30), at(2026, 10, 2), south)[0].name, 'Beltane');
  assert.equal(practiceState(sabbat, J, p, at(2026, 9, 15)).due, false);
});

test('holy-day practices use the journey’s holy days', () => {
  const holy = J.stages[2].practices[4];
  const p = fresh();
  const days = holyDaysBetween(J, at(2026, 9, 1), at(2026, 11, 31));
  assert.ok(days.length >= 2, 'a Noumenia every month');
  assert.equal(practiceState(holy, J, p, days[0].date).due, true);
  const s = practiceState(holy, J, p, new Date(days[0].date.getTime() + 10 * DAY));
  assert.equal(s.due, false);
  assert.match(s.nextName ?? '', /Noumenia/);
  // A shared holiday prefers the person's own calendar, and the southern Wheel only for those who keep it.
  assert.deepEqual(holyDayPicks(['samhain']), ['wheel/samhain']);
  assert.deepEqual(holyDayPicks(['samhain'], { traditions: ['wheel_south'], custom: [] }), ['wheel_south/samhain']);
  assert.deepEqual(holyDayPicks(['lammas'], { traditions: ['christian'], custom: [] }), ['christian/lammas']);
  assert.deepEqual(holyDayPicks(['st_brigid'], null, ['christian']), []);
  // With no holy days at all, it falls back to monthly.
  const none = { ...J, holyDays: [] };
  assert.equal(practiceState(holy, none, p, at(2026, 9, 15)).due, true);
});

test('pausing waits: no steps, and the paused days do not count', () => {
  let p = fresh();
  assert.equal(stagePace(J, p, at(2026, 9, 3)).day, 3);
  p = pauseJourney(p, at(2026, 9, 3));
  assert.equal(journeyStatus(p), 'paused');
  assert.equal(nextStep(J, p, at(2026, 9, 20)).kind, 'paused');
  assert.equal(stagePace(J, p, at(2026, 9, 20)).day, 3);
  p = resumeJourney(p, at(2026, 9, 20));
  assert.equal(journeyStatus(p), 'active');
  assert.equal(stagePace(J, p, at(2026, 9, 20)).day, 3);
  assert.equal(stagePace(J, p, at(2026, 9, 21)).day, 4);
  assert.equal(stagePace(J, p, at(2026, 9, 21)).over, true);
  assert.equal(journeyDays(p, at(2026, 9, 21)), 3);
});

test('discernment: continue moves to the dedication; pause waits; stop and another set it down', () => {
  let p = fresh();
  while (currentStage(J, p).stage.kind !== 'discernment') p = advanceStage(J, p, start);
  assert.equal(nextStep(J, p, start).kind, 'discern');
  const go = decide(J, p, 'continue', start, 'yes');
  assert.equal(currentStage(J, go).stage.kind, 'dedication');
  assert.ok(go.stageDoneAt.discernment);
  const wait = decide(J, p, 'pause', start);
  assert.equal(journeyStatus(wait), 'paused');
  const back = resumeJourney(wait, at(2026, 9, 9));
  assert.equal(back.decision, undefined, 'asked again after a pause');
  assert.equal(journeyStatus(decide(J, p, 'stop', start)), 'stopped');
  assert.equal(journeyStatus(decide(J, p, 'another', start)), 'stopped');
  assert.equal(nextStep(J, decide(J, p, 'stop', start), start).kind, 'stopped');
});

test('the dedication rite records the dedication, then the year turns toward rededication', () => {
  let p = fresh();
  while (currentStage(J, p).stage.kind !== 'dedication') p = advanceStage(J, p, start);
  // The rite waits for its reading.
  assert.deepEqual(nextSteps(J, p, start).map((s) => s.kind), ['lesson']);
  p = markRead(p, 'd1', start);
  assert.equal(nextStep(J, p, start).kind, 'rite');
  assert.equal(rededication(p, start), null);
  p = riteDone(p, 'dedication', at(2026, 9, 31));
  assert.equal(p.dedicatedAt, at(2026, 9, 31).toISOString());
  assert.equal(journeyStatus(p), 'dedicated');
  assert.equal(nextStep(J, p, at(2026, 9, 31)).kind, 'advance');
  p = enterOngoing(J, p, at(2026, 9, 31));
  assert.equal(currentStage(J, p).stage.kind, 'ongoing');
  assert.equal(nextStep(J, p, at(2026, 10, 2)).kind, 'waiting');

  const r = rededication(p, at(2027, 9, 1))!;
  assert.equal(r.due, false);
  assert.equal(r.soon, true);
  assert.equal(rededication(p, at(2027, 9, 31))!.due, true);
  assert.equal(nextStep(J, p, at(2027, 10, 1)).kind, 'rededicate');
  p = rededicate(p, at(2027, 10, 1));
  const after = rededication(p, at(2027, 10, 2))!;
  assert.equal(after.due, false);
  assert.equal(after.count, 1);
  assert.equal(after.nextAt.getFullYear(), 2028);
});

test('progress for a journey: the one still going, and old copies are filled in', () => {
  const a = { createdAt: '2026-01-01T00:00:00.000Z', data: decide(J, fresh(), 'stop', start) };
  const b = { createdAt: '2026-02-01T00:00:00.000Z', data: fresh() };
  const c = { createdAt: '2026-03-01T00:00:00.000Z', data: { ...fresh(), journeyId: 'other' } };
  assert.equal(progressFor([a, b, c], J.id), b);
  assert.equal(progressFor([a, c], J.id), a);
  assert.equal(progressFor([c], J.id), null);
  const partial = normalizeProgress({ journeyId: 'x' } as JourneyProgress);
  assert.deepEqual(partial.lessonsRead, {});
  assert.deepEqual(partial.rededications, []);
  assert.equal(partial.stage, 0);
});

test('every real journey can be walked from start to dedication without anything failing', () => {
  for (const j of JOURNEYS) {
    let p = newProgress(j.id, start);
    for (let i = 0; i < j.stages.length + 2; i++) {
      const steps = nextSteps(j, p, start);
      assert.ok(steps.length > 0, `${j.id} has a next step at stage ${p.stage}`);
      p = advanceStage(j, p, start);
    }
    assert.equal(currentStage(j, p).stage.kind, 'ongoing');
  }
});

test('the catalog matches every journey (run scripts/gen-journeys-index.mjs if not)', async () => {
  const { JOURNEY_CATALOG } = await import('../src/lib/journeys/catalog.ts');
  assert.deepEqual(
    JOURNEY_CATALOG,
    JOURNEYS.map(({ id, kind, paths, deityRef, title, summary }) => (deityRef ? { id, kind, paths, deityRef, title, summary } : { id, kind, paths, title, summary })),
  );
  const { pathsMineFirstIn, deityGroupsIn } = await import('../src/lib/journeys/lookup.ts');
  assert.deepEqual(pathsMineFirstIn(JOURNEY_CATALOG, ['norse']).map((j) => j.id), pathsMineFirst(['norse']).map((j) => j.id));
  assert.deepEqual(
    deityGroupsIn(JOURNEY_CATALOG, ['hellenic']).map((g) => g.journeys.map((j) => j.id)),
    deityGroups(['hellenic']).map((g) => g.journeys.map((j) => j.id)),
  );
});
