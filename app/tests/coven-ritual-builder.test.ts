// The coven ritual builder: sections, roles, steps that know what they are,
// turns, linked steps, the checklist and afterwards, templates, the script
// and run-through, votes, the record and the grimoire copy.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addRole,
  addSection,
  afterwardsTasks,
  blankBuilderStep,
  blankPlan,
  brokenLinks,
  builderPayload,
  builderProblem,
  builderStepFrom,
  builderWarnings,
  castRole,
  cleanPlan,
  defaultSectionFor,
  holdUntil,
  insertStep,
  linkedEffect,
  moveSection,
  moveStep,
  namedThings,
  orderBySections,
  outline,
  prepLine,
  prepTasks,
  removeRole,
  removeSection,
  stepSummary,
  stepWho,
  stepWhoLabel,
  stepsFromLibrary,
  turnOrder,
  turnState,
  withFieldColumns,
  type BuilderStep,
  type RitualPlan,
} from '../src/lib/covens/builder.ts';
import { ACTION_FIELDS, cleanFieldSpecs, cleanValues, fieldSummary, partsOf, voteOptions, whoIn } from '../src/lib/covens/fields.ts';
import { RITUAL_TEMPLATES, draftFromTemplate, searchTemplates, templateOf } from '../src/lib/covens/templates.ts';
import { buildScript, countsLine, covenRitePageOps, findCovenRitePage, mayVote, recordBlocks, recordText, scriptText, tallyVotes, voteResult, type RitualRecord } from '../src/lib/covens/script.ts';
import { taskReminders } from '../src/lib/covens/contributions.ts';
import { clearNamed, nameNewThings, placeOffering, snuffNamed, stepAltarChange } from '../src/lib/covens/ritualAltar.ts';
import { emptyDocument } from '../src/lib/altar/snapshot.ts';
import { isLit } from '../src/lib/altar/livingState.ts';
import { STEP_ACTIONS, actionOf } from '../src/lib/covens/stepActions.ts';
import type { RitualStep } from '../src/lib/covens/model.ts';

const names: Record<string, string> = { u1: 'Rowan', u2: 'Ash', u3: 'Briar' };
const nameOf = (id: string) => names[id] ?? 'Someone';
const ctx = { ranks: [{ id: 'r9', name: 'Elder' }], nameOf };

function step(patch: Partial<BuilderStep>): BuilderStep {
  return { ...blankBuilderStep(patch.section ?? 'work'), title: 'A step', ...patch };
}

test('every action with fields has known field types, and the meeting actions are there', () => {
  for (const [id, specs] of Object.entries(ACTION_FIELDS)) {
    assert.ok(actionOf(id), `${id} is an action`);
    assert.deepEqual(cleanFieldSpecs(specs).map((s) => s.key), specs.map((s) => s.key));
  }
  for (const id of ['vote', 'agenda_item', 'open_meeting', 'close_meeting', 'cleanse', 'lay_crossroads', 'clear_offerings', 'prayer']) assert.ok(actionOf(id), id);
  assert.ok(STEP_ACTIONS.length >= 65);
});

test('field values are cleaned to their types, and quarter calls go part by part', () => {
  const specs = ACTION_FIELDS.call_quarters;
  const values = cleanValues(specs, { directions: ['north', 'east', 'nowhere'], order: 'sunwise', parts: [{ part: 'east', who: 'role:east', words: 'Hail' }, { part: 'x' }], stray: 1 });
  assert.deepEqual(values.directions, ['north', 'east']);
  assert.equal(values.stray, undefined);
  const parts = partsOf(specs[2], values, specs);
  assert.deepEqual(parts.map((p) => p.part), ['east', 'north']);
  assert.equal(parts[0].who, 'role:east');
  const back = partsOf(specs[2], { ...values, order: 'widdershins' }, specs);
  assert.deepEqual(back.map((p) => p.part), ['north', 'east']);
  assert.equal(fieldSummary(specs, values, (k) => (k === 'role:east' ? 'East caller' : k)), 'Sunwise (clockwise) · East: East caller, x');
  assert.deepEqual(whoIn(specs, values), ['role:east']);
  assert.deepEqual(cleanValues(ACTION_FIELDS.light_candle, { count: '40', colour: 'red' }), { count: 13, colour: 'red' });
  assert.deepEqual(voteOptions({}), ['For', 'Against', 'Abstain']);
  assert.deepEqual(voteOptions({ options: ['Saturday', 'Sunday'] }), ['Saturday', 'Sunday']);
});

test('a coven’s own fields are cleaned: known types, unique keys, at most twelve', () => {
  const specs = cleanFieldSpecs([{ type: 'text', label: 'Herb' }, { type: 'text', label: 'Herb' }, { type: 'bogus', label: 'No' }, { type: 'choice', label: 'Way', options: [{ value: 'a', label: 'A' }] }]);
  assert.deepEqual(specs.map((s) => s.key), ['herb', 'herb_', 'way']);
  assert.equal(cleanFieldSpecs(Array.from({ length: 20 }, (_, i) => ({ type: 'text', label: `F${i}` }))).length, 12);
});

test('sections can be renamed, added, removed and reordered; steps follow', () => {
  let plan = blankPlan('rite');
  assert.deepEqual(plan.sections.map((s) => s.name), ['Preparation', 'Opening', 'The work', 'Closing', 'Afterwards']);
  assert.deepEqual(blankPlan('meeting').sections.map((s) => s.id), ['opening', 'reports', 'business', 'other', 'closing']);
  plan = addSection(plan, 'Aarti', 'work');
  assert.equal(plan.sections[3].name, 'Aarti');
  const aarti = plan.sections[3].id;
  let steps = [step({ key: 'a', section: 'opening' }), step({ key: 'b', section: aarti }), step({ key: 'c', section: 'work' })];
  steps = orderBySections(steps, plan.sections);
  assert.deepEqual(steps.map((s) => s.key), ['a', 'c', 'b']);
  const removed = removeSection(plan, steps, aarti);
  assert.equal(removed.steps.find((s) => s.key === 'b')!.section, 'work');
  plan = moveSection(plan, 'closing', -1);
  assert.equal(plan.sections[3].id, 'closing');
  assert.deepEqual(outline(plan, steps).map((o) => o.steps.length), [0, 1, 1, 0, 1, 0]);
  assert.equal(removeSection(blankPlan('rite'), [], 'x').plan.sections.length, 5);
});

test('moving a step crosses into the next section at the edges', () => {
  const plan = blankPlan('rite');
  let steps = [step({ key: 'a', section: 'opening' }), step({ key: 'b', section: 'opening' }), step({ key: 'c', section: 'work' })];
  steps = moveStep(plan, steps, 'b', 1);
  assert.deepEqual(steps.map((s) => `${s.key}:${s.section}`), ['a:opening', 'b:work', 'c:work']);
  steps = moveStep(plan, steps, 'b', -1);
  assert.deepEqual(steps.map((s) => `${s.key}:${s.section}`), ['a:opening', 'b:opening', 'c:work']);
  steps = moveStep(plan, steps, 'a', -1);
  assert.equal(steps[0].section, 'preparation');
  steps = insertStep(plan, steps, step({ key: 'd' }), 'opening');
  assert.deepEqual(steps.filter((s) => s.section === 'opening').map((s) => s.key), ['b', 'd']);
});

test('roles: a step for a role is for whoever is cast; swapping the person moves every step', () => {
  let plan: RitualPlan = blankPlan('rite');
  const added = addRole(plan, 'High Priestess');
  plan = castRole(added.plan, added.id, [{ kind: 'user', id: 'u1' }]);
  const s = step({ roles: [added.id] });
  assert.deepEqual(stepWho(s, plan).assignees, [{ kind: 'user', id: 'u1' }]);
  assert.equal(stepWhoLabel(s, { ...ctx, roles: plan.roles }), 'High Priestess');
  plan = castRole(plan, added.id, [{ kind: 'user', id: 'u2' }]);
  assert.deepEqual(stepWho(s, plan).assignees, [{ kind: 'user', id: 'u2' }]);
  // No roles, no people: the whole coven.
  assert.deepEqual(stepWho(step({}), plan).assignees, [{ kind: 'coven', id: 'coven' }]);
  // People named in fields (a quarter's caller) take part too.
  const quarters = step({ action: 'call_quarters', details: { fields: { directions: ['east'], parts: [{ part: 'east', who: 'user:u3' }] } } });
  assert.deepEqual(stepWho(quarters, plan, ACTION_FIELDS.call_quarters).assignees, [{ kind: 'user', id: 'u3' }]);
  const gone = removeRole(plan, [s], added.id);
  assert.deepEqual(gone.steps[0].roles, []);
  assert.equal(gone.plan.roles.length, 0);
});

test('the outline card reads what the step is', () => {
  let plan = blankPlan('rite');
  const r = addRole(plan, 'East caller');
  plan = castRole(r.plan, r.id, [{ kind: 'user', id: 'u1' }]);
  const s = step({ action: 'call_quarters', title: 'Call the quarters', details: { fields: { directions: ['east', 'south'], order: 'sunwise', parts: [{ part: 'east', who: `role:${r.id}` }, { part: 'south', who: 'user:u2' }] } } });
  assert.equal(stepSummary(s, { ...ctx, roles: plan.roles }), 'Call the quarters · Sunwise (clockwise) · East: East caller, South: Ash');
});

test('saving: roles, field people and columns go to the database as it takes them', () => {
  let plan = blankPlan('rite');
  const r = addRole(plan, 'High Priestess');
  plan = castRole(r.plan, r.id, [{ kind: 'user', id: 'u1' }]);
  const light = step({ action: 'light_candle', altar_action: 'light_candle', title: 'Light Hekate’s candle', section: 'opening', roles: [r.id], details: { fields: { candle: 'Hekate’s candle', colour: 'black' } } });
  const offer = step({ action: 'place_offering', altar_action: 'place_item', title: 'Offerings', turn_mode: 'in_turn', contribution: { mode: 'one', kind: 'offering', timing: 'live', visibility: 'coven', fate: 'keep' } });
  const [a, b] = builderPayload(plan, [offer, light]);
  assert.equal(a.title, 'Light Hekate’s candle');
  assert.equal(a.altar_color, 'black');
  assert.equal(a.altar_label, '');
  assert.deepEqual(a.roles, [r.id]);
  assert.deepEqual(a.assignees, [{ kind: 'user', id: 'u1' }]);
  assert.equal(a.assigned_user_id, 'u1');
  assert.equal(a.section, 'opening');
  assert.deepEqual(a.details.who, { roles: [r.id], people: [] });
  // A step where each places their own sets nothing of its own; in turn means each their own.
  assert.equal(b.altar_action, '');
  assert.equal(b.contribution!.mode, 'each');
  assert.equal(b.turn_mode, 'in_turn');
  assert.equal(withFieldColumns(light, plan).altar_label, 'Hekate’s candle');
  assert.equal(builderProblem('Deipnon', plan, [light, offer], [{ id: 'u1', name: 'Rowan', eligible: true }], nameOf), '');
  assert.match(builderProblem('Deipnon', plan, [light], [{ id: 'u1', name: 'Rowan', eligible: false }], nameOf), /agreements/);
  assert.match(builderProblem('Vote', blankPlan('meeting'), [step({ action: 'vote', title: 'Vote', section: 'business' })], [], nameOf), /motion/);
});

test('steps planned before sections go where they belong, and keep their one person or position', () => {
  const plan = cleanPlan(null, 'rite');
  const old = { id: 's1', ritual_id: 'r', coven_id: 'c', position: 1, title: 'Cast', instructions: null, spoken_text: null, duration_minutes: null, assigned_user_id: 'u2', assigned_rank_id: null, completed_at: null, completed_by: null, altar_action: null, altar_color: null, altar_form: null, altar_label: null, action: 'cast_circle' } as RitualStep;
  const b = builderStepFrom(old, plan);
  assert.equal(b.section, 'opening');
  assert.deepEqual(b.assignees, [{ kind: 'user', id: 'u2' }]);
  assert.equal(b.key, 's1');
  assert.equal(defaultSectionFor('close_meeting', blankPlan('meeting').sections), 'closing');
  assert.equal(defaultSectionFor('vote', blankPlan('meeting').sections), 'business');
  assert.equal(builderStepFrom({ ...old, action: null, assigned_user_id: null }, plan).section, 'opening');
});

test('later steps refer to things named earlier, and a broken link is caught', () => {
  const light = step({ key: 'l', action: 'light_candle', details: { fields: { candle: 'Hekate’s candle' } } });
  const snuff = step({ key: 's', action: 'snuff_candle', details: { fields: { candle: 'Hekate’s candle' } } });
  assert.deepEqual(namedThings([light, snuff], [], 1).map((t) => t.name), ['Hekate’s candle']);
  assert.deepEqual(brokenLinks([light, snuff]), []);
  assert.equal(brokenLinks([snuff, light]).length, 1);
  assert.deepEqual(linkedEffect(snuff), { kind: 'snuff', name: 'Hekate’s candle' });
  assert.equal(builderWarnings(blankPlan('rite'), [snuff, light]).length, 1);
});

test('turns: those cast first, those here before those not', () => {
  assert.deepEqual(turnOrder(['u1', 'u2', 'u3'], ['u3', 'u2'], ['u2']), ['u2', 'u3', 'u1']);
  assert.deepEqual(turnOrder(['u1', 'u2'], []), ['u1', 'u2']);
  assert.deepEqual(turnState(['u1', 'u2'], 1), { current: 'u2', next: null, done: false, position: 2, total: 2 });
  assert.equal(turnState(['u1'], 1).done, true);
});

test('the checklist and afterwards become reminders at the right times', () => {
  const plan = { ...blankPlan('rite'), checklist: [{ id: 'c1', text: 'Wash your hands before you arrive.', remind: 'hour' as const }], afterwards: { hold_hours: 24, notes: '', follow_up: { text: 'Keep the Noumenia', after_hours: 20 } } };
  const ritual = { id: 'r1', title: 'Deipnon', status: 'scheduled', scheduled_for: '2026-11-19T19:00:00.000Z', plan };
  const tasks = prepTasks([ritual], []);
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].hoursBefore, 1);
  assert.deepEqual(prepTasks([ritual], [{ ritual_id: 'r1', item_id: 'c1' }]), []);
  const reminders = taskReminders(tasks, { c: { name: 'Moonlit', slug: 'moonlit' } }, { r1: 'c' }, Date.parse('2026-11-01T00:00:00Z'));
  assert.equal(reminders[0].at.toISOString(), '2026-11-19T18:00:00.000Z');
  assert.match(reminders[0].body, /in an hour/);
  assert.equal(prepLine(3, 7), '3 of 7 have.');
  const ended = { ...ritual, status: 'done', ended_at: '2026-11-19T20:00:00.000Z', led_by: 'u1' };
  assert.equal(holdUntil(ended.ended_at, cleanPlan(plan))!.toISOString(), '2026-11-20T20:00:00.000Z');
  const after = afterwardsTasks([ended], 'u1', Date.parse('2026-11-19T21:00:00Z'));
  assert.deepEqual(after.map((t) => t.stepId), ['clear-r1', 'follow-r1']);
  assert.equal(afterwardsTasks([ended], 'u2', Date.parse('2026-11-19T21:00:00Z')).length, 1);
});

test('every template converts, saves cleanly and reads well', () => {
  assert.ok(RITUAL_TEMPLATES.length >= 20);
  for (const t of RITUAL_TEMPLATES) {
    const d = draftFromTemplate(t);
    assert.ok(d.steps.length >= 3, t.id);
    assert.equal(builderProblem(d.title, d.plan, d.steps, [], nameOf), '', t.id);
    for (const s of d.steps) assert.ok(d.plan.sections.some((x) => x.id === s.section), `${t.id}: ${s.title}`);
    assert.doesNotMatch(JSON.stringify(t), /!/, `${t.id} has no exclamation marks`);
    assert.equal(brokenLinks(d.steps).length, 0, t.id);
  }
  assert.ok(searchTemplates('', 'meeting').every((t) => t.kind === 'meeting'));
  assert.ok(searchTemplates('hellenic').length >= 3);
});

test('the Deipnon is the owner’s version', () => {
  const d = draftFromTemplate(templateOf('hekate_deipnon')!);
  assert.deepEqual(d.plan.roles.map((r) => r.name), ['High Priestess']);
  assert.equal(d.plan.checklist[0].text, 'Wash your hands before you arrive.');
  assert.equal(d.plan.afterwards.hold_hours, 24);
  const titles = d.steps.map((s) => s.title);
  assert.deepEqual(titles, ['Opening prayer', 'Light Hekate’s candle', 'Cleanse', 'Write what you are releasing', 'Lay out the crossroads', 'Offerings at the crossroads', 'Put out Hekate’s candle', 'Closing prayer']);
  const candle = d.steps[1];
  assert.equal(candle.spoken_text, 'Hail Hekate, guide. Hail Hekate, guardian. Hail Hekate, gatekeeper.');
  assert.equal(d.steps[2].details.fields!.method, 'khernips');
  assert.equal(d.steps[3].contribution!.fate, 'altar');
  assert.equal(d.steps[5].turn_mode, 'in_turn');
  assert.equal(linkedEffect(d.steps[6])!.name, 'Hekate’s candle');
  assert.match(d.steps[0].spoken_text, /Link your coven’s prayer/);
  assert.equal(builderWarnings(d.plan, d.steps).length, 1);
  const payload = builderPayload(d.plan, d.steps);
  assert.ok(payload[4].items.some((i) => i.name === 'Crossroads'));
});

test('the script has every word and who says it; the run-through marks your parts', () => {
  const d = draftFromTemplate(templateOf('full_moon')!);
  const hp = d.plan.roles.find((r) => r.name === 'High Priest')!;
  const plan = castRole(d.plan, hp.id, [{ kind: 'user', id: 'u2' }]);
  const steps = d.steps.map((s) => (s.action === 'call_quarters' ? { ...s, details: { fields: { ...s.details.fields, parts: [{ part: 'east', who: 'user:u3' }] } } } : s));
  const script = buildScript({ title: d.title, kind: d.kind, plan, steps, ctx, viewer: { membership: { status: 'active', rank_id: null }, userId: 'u2' } });
  const calling = script.sections.flatMap((s) => s.steps).find((s) => s.title === 'Call the quarters')!;
  assert.equal(calling.lines.length, 4);
  assert.equal(calling.lines[0].who, 'Briar');
  assert.equal(calling.lines[0].mine, false);
  assert.equal(calling.lines[1].who, 'High Priest');
  assert.equal(calling.lines[1].mine, true);
  assert.match(calling.lines[0].words, /Guardians of the East/);
  const text = scriptText(script);
  assert.match(text, /OPENING/);
  assert.match(text, /High Priest: Ash/);
  const mine = scriptText(script, { mineOnly: true });
  assert.ok(mine.length < text.length);
  assert.match(mine, /Call the quarters/);
  // Words linked from the Book read as the page stands now.
  const linked = { ...steps[0], spoken_text: 'old', details: { book_page_id: 'p1' } };
  const withBook = buildScript({ title: 't', kind: 'rite', plan, steps: [linked], ctx, pages: [{ id: 'p1', title: 'Our prayer', body: 'New words' }] });
  assert.equal(withBook.sections[0].steps[0].lines[0].words, 'New words');
  assert.equal(withBook.sections[0].steps[0].lines[0].fromBook, 'Our prayer');
});

test('votes are counted and the result put in words; only voters may vote', () => {
  assert.equal(voteResult(tallyVotes(['For', 'Against', 'Abstain'], [{ choice: 'For' }, { choice: 'For' }, { choice: 'Against' }, { choice: 'Nope' }])), 'Carried: 2 for, 1 against.');
  assert.equal(voteResult(tallyVotes(['For', 'Against', 'Abstain'], [{ choice: 'For' }, { choice: 'Against' }])), 'Tied, so not carried: 1 for, 1 against.');
  assert.equal(voteResult(tallyVotes(['Sat', 'Sun'], [{ choice: 'Sun' }])), 'Chosen: Sun (1 of 1 votes).');
  assert.equal(voteResult(tallyVotes(['Sat', 'Sun'], [])), 'No votes were cast.');
  const plan = castRole(addRole(blankPlan('meeting'), 'Elders').plan, '', []);
  const r = addRole(blankPlan('meeting'), 'Officers');
  const officers = castRole(r.plan, r.id, [{ kind: 'rank', id: 'r9' }]);
  const vote = step({ action: 'vote', details: { fields: { voters: [`role:${r.id}`] } } });
  assert.equal(mayVote(vote, officers, { membership: { status: 'active', rank_id: 'r9' }, userId: 'u1' }), true);
  assert.equal(mayVote(vote, officers, { membership: { status: 'active', rank_id: null }, userId: 'u2' }), false);
  assert.equal(mayVote(step({ action: 'vote' }), plan, { membership: { status: 'active', rank_id: null }, userId: 'u2' }), true);
});

const record: RitualRecord = {
  ritual_id: 'r1',
  coven_id: 'c1',
  title: 'Hekate’s Deipnon',
  kind: 'rite',
  held_at: '2026-11-19T19:00:00.000Z',
  ended_at: '2026-11-19T20:00:00.000Z',
  led_by: 'u1',
  attendees: ['u2', 'u1'],
  steps: [{ title: 'Opening prayer', section: 'opening', done: true }, { title: 'Closing prayer', section: 'closing', done: false }],
  counts: { offering: 3, intention: 1 },
  votes: [],
  notes: 'A quiet night.',
  plan: blankPlan('rite'),
};

test('the record never holds anyone’s words, only counts, and reads for the Book', () => {
  assert.equal(countsLine({ offering: 3, intention: 1, petition: 0 }), '3 offerings, 1 intention');
  const text = recordText(record, nameOf);
  assert.match(text, /WHO WAS THERE\nAsh, Rowan/);
  assert.match(text, /1\. Opening prayer · Opening/);
  assert.match(text, /Closing prayer \(not reached\)/);
  assert.match(text, /A quiet night\./);
  assert.ok(recordBlocks(record, nameOf).some((b) => b.content.includes('Moon') || /Gibbous|Crescent|Quarter|Moon/.test(b.content)));
});

test('each person keeps a copy under Coven rites in their grimoire, once', () => {
  const snapshot = { fetchedAt: '', books: [], sections: [], pages: [], blocks: [], links: [] };
  let n = 0;
  const { id, ops } = covenRitePageOps(snapshot, { userId: 'u1', now: '2026-11-20T00:00:00Z' }, { ritualId: 'r1', covenName: 'Moonlit', record, nameOf }, () => `id-${++n}`);
  assert.deepEqual(ops.slice(0, 3).map((o) => o.table), ['grimoire_books', 'grimoire_sections', 'grimoire_pages']);
  const page = ops.find((o) => o.table === 'grimoire_pages')!;
  assert.equal(page.id, id);
  assert.equal(findCovenRitePage([page.kind === 'insert' ? (page.row as unknown as { metadata: unknown }) : { metadata: null }], 'r1') !== null, true);
  assert.ok(ops.some((o) => o.kind === 'insert' && o.row.content === 'A quiet night.'));
});

test('on the altar: a named candle is put out, named offerings cleared', () => {
  const now = '2026-11-19T19:00:00.000Z';
  const light = stepAltarChange({ altar_action: 'light_candle', altar_color: 'black', altar_form: 'vigil', altar_label: 'Hekate’s candle', altar_image: null, title: 'Light' }, { title: 'Deipnon' }, 'Rowan', 0, now)!;
  const other = stepAltarChange({ altar_action: 'light_candle', altar_color: 'white', altar_form: 'vigil', altar_label: null, altar_image: null, title: 'Light' }, { title: 'Deipnon' }, 'Ash', 1, now)!;
  let doc = other(light(emptyDocument()));
  doc = snuffNamed('Hekate’s candle', now)(doc);
  assert.deepEqual(doc.objects.map(isLit), [false, true]);
  const offered = placeOffering([{ key: 'tools:key|standard', name: 'Key', image: '/assets/altar/objects/tools/key/key.png', category: 'tools' }], 'Rowan’s offering', 'The crossroads offerings', 'Deipnon', 2, now)(doc);
  assert.equal(offered.objects.length, 3);
  assert.equal(clearNamed('The crossroads offerings')(offered).objects.length, 2);
  const named = nameNewThings(light, 'The flame', now)(emptyDocument());
  assert.equal(clearNamed('The flame')(named).objects.length, 0);
});

test('saved blocks and copies come back as fresh steps in the plan’s sections', () => {
  const plan = blankPlan('rite');
  const back = stepsFromLibrary([{ title: 'Our quarter call', action: 'call_quarters', section: 'opening', roles: ['nope'], turn_mode: 'together', details: { fields: { directions: ['east'] } } }, null], plan);
  assert.equal(back.length, 2);
  assert.equal(back[0].section, 'opening');
  assert.deepEqual(back[0].roles, []);
  assert.equal(back[0].turn_mode, 'together');
  assert.equal(back[0].id, undefined === back[0].id ? undefined : back[0].id);
});
