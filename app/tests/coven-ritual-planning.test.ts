// Coven ritual planning, second pass: the one search picker (WHO and ITEMS),
// the step actions, what a step asks of people and who may read it,
// participation, and steps planned before any of this.
import test from 'node:test';
import assert from 'node:assert/strict';

import { itemIndex, itemSuggestions, searchItems, stepCandle, stepItemOf, cleanStepItems, cabinetFormOf } from '../src/lib/altar/itemIndex.ts';
import {
  canName,
  canRead,
  canSupport,
  cleanContribution,
  contributionLabel,
  contributionNote,
  contributionProblem,
  contributionTask,
  defaultContribution,
  isListed,
  ownerActions,
  participationLine,
  participationNames,
  ritualTasks,
  seesParticipation,
  summarise,
  taskReminders,
} from '../src/lib/covens/contributions.ts';
import { stepAssignee, stepIsMine, type Member } from '../src/lib/covens/model.ts';
import {
  assigneeFromKey,
  assigneesLabel,
  assigneesOf,
  cleanAssignees,
  includesMember,
  legacyColumns,
  normalize,
  searchEntries,
  whoEntries,
  whoSuggestions,
  WHOLE_COVEN,
} from '../src/lib/covens/picker.ts';
import { blankStep, deityName, draftFromStep, plannerProblem, stepsPayload } from '../src/lib/covens/planner.ts';
import { offerPaper, paperCount, releasePapers, stepAltarChange } from '../src/lib/covens/ritualAltar.ts';
import { ACTION_GROUPS, actionForStep, actionOf, actionsByGroup, applyAction, refillDeity, searchActions, STEP_ACTIONS } from '../src/lib/covens/stepActions.ts';
import type { AltarDocument } from '../src/lib/altar/snapshot.ts';

const ranks = [
  { id: 'r1', name: 'Initiate', level: 1 },
  { id: 'r2', name: 'High Priestess', level: 9 },
];
const people = [
  { id: 'u1', name: 'Rowan', eligible: true },
  { id: 'u2', name: 'Sage', eligible: false },
  { id: 'u3', name: 'Ash', eligible: true },
];
const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? 'Wren';
const member = (rank: string | null, status: Member['status'] = 'active') => ({ coven_id: 'c', user_id: 'x', rank_id: rank, status, muted_until: null, joined_at: '' }) as Member;

test('the search picker ranks names first, needs every word, and shows only suggestions when empty', () => {
  const entries = whoEntries(ranks, people);
  assert.deepEqual(entries.map((e) => e.key), ['coven', 'rank:r2', 'rank:r1', 'user:u1', 'user:u3'], 'positions highest first; people who can’t take a part are left out');
  assert.equal(searchEntries(entries, 'high')[0].key, 'rank:r2');
  assert.equal(searchEntries(entries, 'priestess')[0].key, 'rank:r2', 'a word inside the title');
  assert.equal(searchEntries(entries, 'everyone')[0].key, 'coven', 'keywords find the whole coven');
  assert.deepEqual(searchEntries(entries, 'row').map((e) => e.key), ['user:u1']);
  assert.deepEqual(searchEntries(entries, 'rowan priestess'), [], 'every word must fit');
  assert.deepEqual(searchEntries(entries, ''), [], 'no giant lists');
  assert.deepEqual(searchEntries(entries, '', { suggestions: whoSuggestions(entries) }).map((e) => e.key), ['coven', 'rank:r2', 'rank:r1']);
  assert.deepEqual(searchEntries(entries, 'r', { picked: ['user:u1'] }).some((e) => e.key === 'user:u1'), false, 'picked ones are left out');
  assert.equal(normalize('Brigid’s Crós'), "brigid's cros");
});

test('WHO: any mix of positions and people, the whole coven alone, and older steps read the same', () => {
  const mix = cleanAssignees([{ kind: 'rank', id: 'r1' }, { kind: 'rank', id: 'r2' }, { kind: 'user', id: 'u1' }, { kind: 'user', id: 'u1' }, { kind: 'bogus' }]);
  assert.equal(mix.length, 3);
  assert.equal(assigneesLabel(mix, ranks, nameOf), 'Every Initiate, Every High Priestess and Rowan');
  assert.deepEqual(cleanAssignees([{ kind: 'user', id: 'u1' }, { kind: 'coven' }]), [WHOLE_COVEN]);
  assert.deepEqual(assigneeFromKey('rank:r2'), { kind: 'rank', id: 'r2' });
  assert.deepEqual(assigneesOf({ assigned_user_id: 'u1' }), [{ kind: 'user', id: 'u1' }]);
  assert.deepEqual(assigneesOf({}), [WHOLE_COVEN]);
  assert.deepEqual(legacyColumns(mix), { assigned_user_id: null, assigned_rank_id: null });
  assert.deepEqual(legacyColumns([{ kind: 'rank', id: 'r1' }]), { assigned_user_id: null, assigned_rank_id: 'r1' });
  assert.equal(includesMember(mix, member('r1'), 'x'), true, 'an Initiate');
  assert.equal(includesMember(mix, member(null), 'u1'), true, 'Rowan by name');
  assert.equal(includesMember(mix, member(null), 'x'), false);
  assert.equal(includesMember(mix, member('r1', 'left'), 'x'), false, 'former members have no steps');
  assert.equal(stepIsMine({ assignees: mix, assigned_user_id: null, assigned_rank_id: null }, member('r2'), 'x'), true);
  assert.equal(stepIsMine({ assignees: [], assigned_user_id: 'u1', assigned_rank_id: null }, member(null), 'u1'), true, 'older steps still work');
  assert.deepEqual(stepAssignee({ assignees: mix, assigned_user_id: null, assigned_rank_id: null }, ranks as never, nameOf), { kind: 'several', label: 'Every Initiate, Every High Priestess and Rowan' });
});

test('ITEMS: the whole cabinet is searchable, with pictures, and steps keep what they need', () => {
  const entries = itemIndex({ petitions: [{ id: 'p1', title: 'For Mara’s healing' }] });
  assert.ok(entries.length > 800, 'every form of everything');
  const red = searchItems(entries, 'red taper')[0];
  assert.match(red.label, /Red Taper/);
  assert.equal(red.category, 'candles');
  assert.equal(red.color, 'red');
  assert.ok(red.image?.startsWith('/assets/altar/'), 'pictures as the site serves them');
  assert.ok(searchItems(entries, 'hekate').some((e) => e.category === 'deities'));
  assert.ok(searchItems(entries, 'rosemary').some((e) => e.category === 'herbs'));
  assert.ok(searchItems(entries, 'amethyst').some((e) => e.category === 'crystals'));
  assert.ok(searchItems(entries, 'samhain').some((e) => e.category === 'seasonal'), 'festival things by festival');
  assert.ok(searchItems(entries, 'ancestor frame').length > 0);
  assert.equal(searchItems(entries, 'healing', { categories: ['petitions'] })[0].key, 'petition:p1');
  assert.ok(searchItems(entries, 'candle', { categories: ['deities'] }).every((e) => e.category === 'deities'));
  assert.equal(itemSuggestions(entries).length, 4);
  const own = itemIndex({ own: [{ id: 'custom:1', category: 'tools', name: 'Grandmother’s Bell', keywords: [], customCabinetItemId: '1', forms: [{ label: 'Place', image: 'https://x.supabase.co/storage/v1/object/public/user-assets/a/bell.png' }] }] });
  assert.equal(searchItems(own, 'grandmother')[0].source, 'own');

  const kept = stepItemOf(red);
  assert.deepEqual(Object.keys(kept).sort(), ['category', 'color', 'form', 'image', 'key', 'name']);
  assert.deepEqual(stepCandle([kept]), { color: 'red', form: 'taper' });
  assert.deepEqual(stepCandle([], { color: 'green', form: 'chime' }), { color: 'green', form: 'chime' });
  assert.ok(cabinetFormOf(kept.key), 'it can be placed again');
  assert.deepEqual(cleanStepItems([{ key: 'a', name: 'A' }, { key: 'a', name: 'A' }, null, { name: 'no key' }]).length, 1);
});

test('about fifty actions in six groups, each with a name and directions; choosing one fills the step', () => {
  assert.ok(STEP_ACTIONS.length >= 48);
  assert.equal(new Set(STEP_ACTIONS.map((a) => a.id)).size, STEP_ACTIONS.length, 'ids are unique');
  assert.deepEqual(actionsByGroup().map((g) => g.group.id), ACTION_GROUPS.map((g) => g.id));
  for (const a of STEP_ACTIONS) {
    assert.ok(a.name && a.directions, a.id);
    assert.doesNotMatch(`${a.name} ${a.directions} ${a.words ?? ''}`, /!/, `${a.id}: no exclamation marks`);
  }
  for (const q of ['Air', 'Fire', 'Water', 'Earth']) assert.ok(searchActions(q.toLowerCase()).some((a) => a.name === `Call ${q}`));
  const petition = applyAction(actionOf('write_petition')!);
  assert.equal(petition.contribution?.kind, 'petition');
  assert.equal(petition.contribution?.visibility, 'coven');
  assert.equal(petition.contribution?.fate, 'petition');
  assert.equal(applyAction(actionOf('write_gratitude')!).contribution?.visibility, 'me', 'gratitude is personal');
  assert.equal(applyAction(actionOf('burn_petitions')!).altar_action, 'release_papers');
  const deity = applyAction(actionOf('welcome_deity')!, { deity: 'Hekate' });
  assert.equal(deity.title, 'Welcome Hekate');
  assert.match(deity.spoken_text, /^Hekate, we welcome you/);
  const changed = refillDeity({ ...deity, instructions: 'My own words' }, actionOf('welcome_deity')!, 'Hekate', 'Brigid');
  assert.equal(changed.title, 'Welcome Brigid');
  assert.equal(changed.instructions, 'My own words', 'hand-written text is kept');
  assert.equal(deityName('Hekate Statue'), 'Hekate');
  assert.equal(actionForStep({ action: null, altar_action: 'light_candle' })?.id, 'light_candle', 'older steps map to an action');
  assert.equal(actionForStep({ action: null, altar_action: null }), null);
});

test('what a step asks: kinds, defaults, cleaning and the words people see', () => {
  assert.deepEqual(defaultContribution('gratitude'), { mode: 'each', kind: 'gratitude', timing: 'ahead', visibility: 'me', fate: 'burn' });
  assert.equal(defaultContribution('libation').timing, 'live');
  assert.equal(cleanContribution({ kind: 'intention', fate: 'petition' })?.fate, 'keep', 'only petitions become coven petitions');
  assert.equal(cleanContribution({ kind: 'card', fate: 'burn' })?.fate, 'keep', 'a card isn’t burned');
  assert.equal(cleanContribution({ kind: 'nope' }), null);
  assert.equal(contributionTask({ kind: 'petition', mode: 'each' }), 'Write your petition');
  assert.equal(contributionTask({ kind: 'petition', mode: 'one' }), 'Write the coven’s petition');
  assert.equal(contributionTask({ kind: 'libation', mode: 'each' }), 'Pour your own libation');
  assert.match(contributionNote(defaultContribution('gratitude')), /Only you will read it.*burned/);
  assert.equal(contributionProblem(defaultContribution('petition'), '  ', []), 'Write your petition first.');
  assert.equal(contributionProblem(defaultContribution('offering'), '', [{}]), '');
});

test('who may read what: only me, the leaders, the coven, without names, and private seals', () => {
  const rowan = { userId: 'u1', member: true, leads: false };
  const leader = { userId: 'u9', member: true, leads: true };
  const other = { userId: 'u3', member: true, leads: false };
  const outsider = { userId: 'zz', member: false, leads: false };
  const row = (over: object) => ({ user_id: 'u1', private: false, anonymous: false, visibility: 'coven' as const, ...over });
  assert.equal(canRead(row({}), other), true);
  assert.equal(canName(row({}), other), true);
  assert.equal(isListed(row({}), outsider), false);
  assert.equal(isListed(row({ visibility: 'me' }), leader), false, 'only me: not even the leader');
  assert.equal(isListed(row({ visibility: 'me' }), rowan), true);
  assert.equal(canRead(row({ visibility: 'leader' }), leader), true);
  assert.equal(isListed(row({ visibility: 'leader' }), other), false);
  assert.equal(canName(row({ visibility: 'coven_unnamed' }), other), false);
  assert.equal(canRead(row({ visibility: 'coven_unnamed' }), other), true);
  assert.equal(canRead(row({ private: true }), leader), false, 'private is sealed to the leaders too');
  assert.equal(isListed(row({ private: true }), other), true, 'but still takes part');
  assert.equal(canName(row({ private: true }), other), true);
  assert.equal(canRead(row({ private: true }), rowan), true);
  const sealed = { kind: 'petition' as const, private: true, mine: false, user_id: 'u1' };
  assert.equal(contributionLabel(sealed, nameOf), 'Rowan’s petition (private)');
  assert.equal(contributionLabel({ ...sealed, user_id: null }, nameOf), 'A private petition');
  assert.equal(contributionLabel({ ...sealed, private: false, user_id: null, kind: 'intention' }, nameOf), 'An intention');
  assert.equal(contributionLabel({ ...sealed, mine: true }, nameOf), 'Your petition (private)');
  assert.deepEqual(ownerActions({ mine: true, status: 'held', petition_id: null }), ['answered', 'closed']);
  assert.deepEqual(ownerActions({ mine: false, status: 'held', petition_id: null }), [], 'only the writer tends it');
  assert.equal(canSupport({ ...row({ private: true }), mine: false, status: 'offered' }, other), true, 'held without being read');
  assert.equal(canSupport({ ...row({}), mine: true, status: 'offered' }, rowan), false);
});

test('participation: counts and names for those allowed, and the one-person step', () => {
  const members = [
    { user_id: 'u1', rank_id: 'r1', status: 'active' },
    { user_id: 'u3', rank_id: 'r1', status: 'active' },
    { user_id: 'u4', rank_id: 'r2', status: 'active' },
    { user_id: 'u5', rank_id: 'r1', status: 'left' },
  ];
  const row = summarise({ id: 's1', assignees: [{ kind: 'rank', id: 'r1' }] }, members, [{ step_id: 's1', user_id: 'u1' }, { step_id: 's1', user_id: 'u4' }]);
  assert.deepEqual([row.expected, row.done], [2, 1]);
  assert.equal(participationLine(row, { kind: 'petition', mode: 'each' }), '1 of 2 have written.');
  assert.deepEqual(participationNames(row, nameOf), { done: 'Rowan', waiting: 'Ash' });
  assert.equal(participationLine({ expected: 3, done: 0 }, { kind: 'card', mode: 'one' }), 'No one has done it yet.');
  assert.equal(participationLine({ expected: 3, done: 3 }, { kind: 'offering', mode: 'each' }), 'All 3 have placed theirs.');
  assert.equal(seesParticipation([], member(null), 'x', true), true, 'the head always sees it');
  assert.equal(seesParticipation([{ kind: 'rank', id: 'r2' }], member('r2'), 'x', false), true);
  assert.equal(seesParticipation([], member('r2'), 'x', false), false);
});

test('tasks ahead of time and their reminders', () => {
  const rituals = [{ id: 'rt', title: 'Samhain', status: 'scheduled', scheduled_for: '2030-10-31T20:00:00Z' }];
  const steps = [
    { id: 's1', ritual_id: 'rt', title: 'Petitions', contribution: defaultContribution('petition'), assignees: [WHOLE_COVEN] },
    { id: 's2', ritual_id: 'rt', title: 'Draw', contribution: defaultContribution('card', { mode: 'one', timing: 'ahead' }), assignees: [{ kind: 'user' as const, id: 'u1' }] },
    { id: 's3', ritual_id: 'rt', title: 'Light', contribution: defaultContribution('light_candle'), assignees: [WHOLE_COVEN] },
  ];
  const tasks = ritualTasks(rituals, steps, [], member(null), 'u1', assigneesOf);
  assert.deepEqual(tasks.map((t) => t.title), ['Write your petition for Samhain', 'Pull a card for the coven for Samhain']);
  assert.equal(ritualTasks(rituals, steps, [{ step_id: 's1', mine: true }, { step_id: 's2', mine: false }], member(null), 'u1', assigneesOf).length, 0, 'done, or done by someone for the coven');
  const reminders = taskReminders(tasks, { c: { name: 'Oak', slug: 'oak' } }, { rt: 'c' }, Date.parse('2030-10-01'));
  assert.equal(reminders.length, 2);
  assert.equal(reminders[0].url, '/coven/c/oak/ritual/rt');
  assert.equal(reminders[0].at.toISOString(), '2030-10-29T20:00:00.000Z');
});

test('the planner saves people, items and asks alongside the older columns', () => {
  const step = { ...blankStep(), title: 'Call the quarters', assignees: [{ kind: 'rank' as const, id: 'r1' }, { kind: 'user' as const, id: 'u1' }], altar_action: 'light_candle' as const, items: [{ key: 'candles:red-candle|taper', name: 'Red Taper Candle', image: '/assets/x.png', category: 'candles', color: 'red', form: 'taper' }] };
  const [p] = stepsPayload([step]);
  assert.equal(p.assigned_user_id, null);
  assert.equal(p.assignees.length, 2);
  assert.equal(p.altar_color, 'red');
  assert.equal(p.altar_form, 'taper');
  const placing = stepsPayload([{ ...blankStep(), title: 'Offer', altar_action: 'place_item', items: [{ key: 'k', name: 'Bread', image: '/assets/altar/bread.png', category: 'offerings' }, { key: 'k2', name: 'Honey', image: '/assets/altar/honey.png', category: 'offerings' }] }])[0];
  assert.equal(placing.altar_image, '/assets/altar/bread.png');
  assert.equal(placing.altar_label, 'Bread and Honey');
  assert.equal(plannerProblem('Rite', [{ ...blankStep(), title: 'x', assignees: [{ kind: 'user', id: 'u2' }] }], people, nameOf).includes('Sage hasn’t signed'), true);
  assert.equal(plannerProblem('Rite', [{ ...blankStep(), title: 'x', altar_access: 'chosen' }], people, nameOf), 'Step 1: choose who tends the altar during it.');
  const old = draftFromStep({ id: 's', ritual_id: 'r', coven_id: 'c', position: 1, title: 'Light', instructions: 'Do it', spoken_text: null, duration_minutes: 2, assigned_user_id: null, assigned_rank_id: 'r1', completed_at: null, completed_by: null, altar_action: 'light_candle', altar_color: 'green', altar_form: 'votive', altar_label: null });
  assert.deepEqual(old.assignees, [{ kind: 'rank', id: 'r1' }]);
  assert.equal(old.contribution, null);
  assert.equal(stepsPayload([old])[0].altar_color, 'green', 'an older step saves as it was');
});

test('the altar: several items set down, sealed papers, and the papers released', () => {
  const now = '2026-10-31T20:00:00.000Z';
  const doc = { objects: [], background: '', backgroundName: '', groups: [], activeGroupId: null } as unknown as AltarDocument;
  const items = searchItems(itemIndex(), 'apple', { limit: 1 }).concat(searchItems(itemIndex(), 'rosemary', { limit: 1 })).map(stepItemOf);
  const place = stepAltarChange({ altar_action: 'place_item', altar_color: null, altar_form: null, altar_label: null, altar_image: null, title: 'Offer', items }, { title: 'Samhain' }, 'Ash', 0, now)!;
  const placed = place(doc);
  assert.equal(placed.objects.length, 2);
  assert.equal(placed.objects[0].label, items[0].name);
  const withPapers = [
    offerPaper({ id: 'c1', fate: 'burn' }, 'A private petition', 0, now),
    offerPaper({ id: 'c2', fate: 'keep' }, 'Rowan’s intention', 1, now),
    offerPaper({ id: 'c1', fate: 'burn' }, 'A private petition', 2, now),
  ].reduce((d, change) => change(d), placed);
  assert.equal(paperCount(withPapers), 2, 'each paper once');
  assert.ok(withPapers.objects.some((o) => o.label === 'A private petition'), 'sealed and nameless as it should be');
  assert.ok(!JSON.stringify(withPapers).includes('Healing'), 'no words on the altar');
  const released = releasePapers(withPapers);
  assert.equal(paperCount(released), 1, 'the kept one stays');
  assert.ok(stepAltarChange({ altar_action: 'release_papers', altar_color: null, altar_form: null, altar_label: null, altar_image: null, title: 'Burn' }, { title: 'S' }, 'A', 0, now));
});
