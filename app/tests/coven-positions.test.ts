// Open positions: places and the status chip, taking applications (open,
// closed, past the date, full), requirements as the editor cleans them (as
// the database does), checklists and ticks, the overview members read, the
// phone note (coven-notify positions.ts) and who wants it (reminders_v2.positions).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { openedNote, placesAndDate, wantsPosition } from '../../supabase/functions/coven-notify/positions.ts';
import { advancementOptions, permissions, type Rank } from '../src/lib/covens/model.ts';
import {
  cleanRequirements,
  closeAtFromDate,
  dateOfCloseAt,
  daysWords,
  deadlineWords,
  newRequirement,
  openLine,
  openPositions,
  placesLeft,
  placesLine,
  positionStatus,
  rankQuestions,
  readAnswers,
  readChecks,
  readOverview,
  readPlaces,
  readyToApply,
  requirementItems,
  requirementLabel,
  takingApplications,
  untickedLabels,
  withTicks,
} from '../src/lib/covens/positions.ts';
import { DEFAULT_PREFS, normalizePrefs, positionsOn, setPositionsFor } from '../src/lib/reminders/prefs.ts';

const NOW = Date.parse('2026-10-28T12:00:00Z');
const R = (over: Partial<Rank>): Rank => ({ id: 'r', coven_id: 'c', name: 'Initiate', description: null, requirements: null, level: 3, ...over });
const seeker = R({ id: '11111111-1111-4111-8111-111111111111', name: 'Seeker', level: 1, is_default: true });
const dedicant = R({ id: '22222222-2222-4222-8222-222222222222', name: 'Dedicant', level: 2 });
const initiate = R({ id: '33333333-3333-4333-8333-333333333333', name: 'Initiate', level: 3 });
const elder = R({ id: '44444444-4444-4444-8444-444444444444', name: 'Elder', level: 4 });

test('places left, over the limit, and the status chip', () => {
  const open = { ...initiate, applications_open: true, seat_limit: 3 };
  assert.equal(placesLeft(open, 1), 2);
  assert.equal(placesLeft({ seat_limit: null }, 9), null);
  assert.equal(positionStatus(open, 1, NOW).label, 'Open · 2 of 3 places');
  assert.equal(positionStatus({ ...open, seat_limit: 1 }, 0, NOW).label, 'Open · 1 of 1 place');
  assert.equal(positionStatus({ ...open, seat_limit: null }, 5, NOW).label, 'Open');
  assert.equal(positionStatus(open, 3, NOW).label, 'Full');
  assert.equal(positionStatus(open, 4, NOW).label, 'Full · over the limit');
  assert.equal(positionStatus({ ...open, applications_open: false }, 1, NOW).label, 'Closed');
  assert.equal(positionStatus({ ...open, applications_close_at: '2026-10-27T00:00:00Z' }, 1, NOW).label, 'Closed', 'past its date');
  assert.equal(positionStatus(seeker, 10, NOW).key, 'start');
  assert.equal(placesLine(open, 1), '1 holds it · 2 places left of 3');
  assert.equal(placesLine(open, 0), 'No one holds it · 3 places left of 3');
  assert.equal(placesLine(open, 3), '3 hold it · no places left of 3');
  assert.equal(placesLine(open, 4), '4 hold it · over the limit of 3');
  assert.equal(placesLine({ seat_limit: null }, 2), '2 hold it · no limit');
});

test('taking applications: open, its date to come, a place left; the old checkbox still counts', () => {
  assert.ok(takingApplications({ ...initiate, open_to_applications: true }, 0, NOW), 'old checkbox, before the migration');
  assert.ok(!takingApplications({ ...initiate, applications_open: false, open_to_applications: true }, 0, NOW), 'the new column wins');
  assert.ok(!takingApplications({ ...initiate, applications_open: true, seat_limit: 2 }, 2, NOW), 'full');
  assert.ok(!takingApplications({ ...initiate, applications_open: true, applications_close_at: '2026-10-28T11:59:00Z' }, 0, NOW), 'closed by date');
  assert.ok(!takingApplications({ ...seeker, applications_open: true }, 0, NOW), 'never the first position');
  const perms = permissions({ coven: { founder_id: 'x', status: 'active' } as never, membership: { coven_id: 'c', user_id: 'me', rank_id: dedicant.id, status: 'active', muted_until: null, joined_at: '' }, ranks: [seeker, dedicant, initiate, elder], userId: 'me' });
  const options = advancementOptions([{ ...seeker, applications_open: true }, { ...initiate, applications_open: true }, { ...elder, applications_open: true, applications_close_at: '2026-10-01T00:00:00Z' }, dedicant], perms, NOW);
  assert.deepEqual(options.map((r) => r.name), ['Initiate']);
});

test('requirements are cleaned as the database cleans them, with the editor’s words', () => {
  const ctx = { rank: initiate, ranks: [seeker, dedicant, initiate, elder], programs: [{ id: 'p1', title: 'First Degree' }], documents: [{ id: 'd1', title: 'Oath' }] };
  const { items, error } = cleanRequirements(
    [
      { id: 'days', kind: 'min_days_in_coven', days: 30 },
      { kind: 'min_days_in_position', rank_id: dedicant.id, days: 366 },
      { kind: 'holds_position', rank_id: dedicant.id },
      { kind: 'min_rites_attended', count: 2 },
      { kind: 'program_completed', program_id: 'p1' },
      { kind: 'document_signed', document_id: 'd1' },
      { kind: 'mentor_approval' },
      { kind: 'mentor_approval' },
      { kind: 'custom', text: '  Has led   a rite ' },
      { kind: 'custom', text: '  ' },
    ],
    ctx,
  );
  assert.equal(error, null);
  assert.equal(items.length, 8, 'one mentor approval; empty words left out');
  assert.deepEqual(items[1], { id: 'req-2', kind: 'min_days_in_position', rank_id: dedicant.id, days: 366 });
  assert.equal(items[7].text, 'Has led a rite');
  assert.equal(cleanRequirements([{ kind: 'holds_position', rank_id: elder.id }], ctx).error, 'Choose a position below Initiate for that requirement.');
  assert.equal(cleanRequirements([{ kind: 'min_days_in_coven', days: 0 }], ctx).error, 'Choose how many days in the coven: 1 to 3,650.');
  assert.equal(cleanRequirements([{ kind: 'program_completed', program_id: 'nope' }], ctx).error, 'Choose one of the coven’s programs for that requirement.');
  assert.equal(cleanRequirements([{ kind: 'document_signed' }], ctx).error, 'Choose one of the coven’s pages for that requirement.');
  assert.equal(cleanRequirements([{ kind: 'spells' as never }], ctx).error, 'That kind of requirement isn’t known.');
  // Words for the editor.
  assert.equal(requirementLabel(items[1], ctx), 'Dedicant for a year and a day');
  assert.equal(requirementLabel(items[3], ctx), 'Has come to 2 rites');
  assert.equal(requirementLabel(items[4], ctx), 'Completed First Degree');
  assert.equal(daysWords(365), 'a year');
  assert.equal(daysWords(1), '1 day');
  // A new one names the nearest position below, and a fresh id.
  assert.deepEqual(newRequirement('min_days_in_position', ctx, ['req-1']), { id: 'req-2', kind: 'min_days_in_position', rank_id: dedicant.id, days: 366 });
  assert.deepEqual(requirementItems({ requirement_items: [{ id: 'a', kind: 'custom', text: 'x' }, { kind: 'custom' }, 'junk'] }), [{ id: 'a', kind: 'custom', text: 'x' }]);
});

test('checklists: ready when nothing is unmet; ticks in review', () => {
  const checks = readChecks([
    { id: 'days', kind: 'min_days_in_coven', status: 'met', auto: true, label: 'In the coven for 30 days', line: 'a year in the coven' },
    { id: 'rites', kind: 'min_rites_attended', status: 'unmet', auto: true, label: 'Has come to 30 rites', line: '21 of 30 rites attended' },
    { id: 'mentor', kind: 'mentor_approval', status: 'needs_review', auto: false, label: 'Their mentor’s approval', line: '' },
    { id: 'c', kind: 'custom', status: 'needs_review', auto: false, label: 'Has led a rite', line: '' },
    { status: 'bogus', label: 'x' },
  ]);
  assert.equal(checks.length, 4);
  assert.equal(readyToApply(checks), false);
  assert.equal(readyToApply(checks.filter((c) => c.status !== 'unmet')), true, 'needs_review never blocks applying');
  const ticked = withTicks(checks, ['c']);
  assert.equal(ticked[3].status, 'met');
  assert.equal(ticked[3].line, 'Confirmed');
  assert.deepEqual(untickedLabels(checks, ['c']), ['Their mentor’s approval']);
});

test('the overview members read, and the open positions card', () => {
  const ranks = [seeker, dedicant, { ...initiate, applications_open: true, seat_limit: 3, applications_close_at: '2026-11-30T12:00:00Z' }, { ...elder, applications_open: true, seat_limit: 1 }];
  const overview = readOverview({
    now: '2026-10-28T12:00:00Z',
    holders: { [initiate.id]: 1, [elder.id]: 1 },
    open: [
      { rank_id: elder.id, requirements: [] },
      { rank_id: initiate.id, requirements: [{ id: 'a', kind: 'min_rites_attended', status: 'met', auto: true, label: 'x', line: 'y' }] },
      { rank_id: 'gone', requirements: [] },
    ],
  });
  const open = openPositions(ranks, overview, NOW);
  assert.deepEqual(open.map((p) => p.rank.name), ['Initiate'], 'Elder is full; an unknown position is left out');
  assert.equal(open[0].left, 2);
  assert.ok(open[0].ready);
  assert.match(openLine(open[0]), /^2 places left · Applications close \w+day 30 November$/);
  assert.deepEqual(openPositions(ranks, null, NOW), []);
});

test('dates, places typed in, and answers', () => {
  const at = closeAtFromDate('2026-12-21');
  assert.ok(at && dateOfCloseAt(at) === '2026-12-21');
  assert.equal(closeAtFromDate('21/12/2026'), null);
  assert.equal(deadlineWords(null), '');
  assert.match(deadlineWords('2026-10-01T12:00:00Z', NOW), /^Applications closed /);
  assert.deepEqual(readPlaces(''), { value: null, error: null });
  assert.deepEqual(readPlaces('3'), { value: 3, error: null });
  assert.ok(readPlaces('0').error);
  const questions = rankQuestions({ application_questions: [{ id: 'why', prompt: 'Why now?', required: true }, { id: 'more', prompt: 'Anything else?' }] });
  assert.equal(readAnswers(questions, { more: 'x' }).missing?.id, 'why');
  assert.deepEqual(readAnswers(questions, { why: ' Because ', more: '' }), { answers: { why: 'Because' }, missing: null });
});

test('the phone note when a position opens, and who wants it', () => {
  const now = new Date(NOW);
  assert.deepEqual(
    openedNote({ rankName: 'Initiate', covenName: 'Moon Circle', covenSlug: 'moon-circle', placesLeft: 2, closeAt: '2026-10-30T23:59:00Z', note: ' We need two  to tend the hearth. ', zone: 'Europe/London', now }),
    { title: 'Initiate is open in Moon Circle', body: '2 places · applications close Friday 30 October\nWe need two to tend the hearth.', url: '/coven/c/moon-circle/path' },
  );
  assert.equal(placesAndDate(1, null), '1 place');
  assert.equal(placesAndDate(null, '2027-01-02T12:00:00Z', 'UTC', now), 'Applications close Saturday 2 January 2027');
  assert.equal(openedNote({ rankName: 'Maiden', covenName: 'Moon Circle', covenSlug: 'm', now }).body, 'Tap to see what it asks.');
  // On by default, off for one coven, off for all, quiet while paused.
  assert.deepEqual(DEFAULT_PREFS.positions, { on: true, off: [] });
  assert.ok(wantsPosition(null, 'c1', now));
  let prefs = setPositionsFor(normalizePrefs({}), 'c1', false, ['c1', 'c2']);
  assert.ok(!positionsOn(prefs, 'c1') && positionsOn(prefs, 'c2'));
  assert.ok(!wantsPosition(JSON.stringify(prefs), 'c1', now) && wantsPosition(JSON.stringify(prefs), 'c2', now));
  prefs = normalizePrefs({ ...prefs, positions: { on: false, off: [] } });
  assert.ok(!wantsPosition(JSON.stringify(prefs), 'c2', now));
  // Turning one coven back on while all are off keeps the others off.
  prefs = setPositionsFor(prefs, 'c2', true, ['c1', 'c2']);
  assert.ok(positionsOn(prefs, 'c2') && !positionsOn(prefs, 'c1'));
  assert.ok(!wantsPosition(JSON.stringify({ paused: true, pausedUntil: '' }), 'c1', now));
  assert.ok(wantsPosition(JSON.stringify({ paused: true, pausedUntil: '2026-10-01' }), 'c1', now));
});
