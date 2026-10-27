import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  agoLabel,
  attendanceLine,
  attendedAs,
  checkinOverdue,
  cleanCheckinDate,
  memberFlags,
  mentorLine,
  overviewRows,
  recordFlags,
  recordRituals,
  ritualPartLine,
  seesRecord,
  sinceFor,
  studiesLine,
  studyLine,
  studyStalled,
  summarizeAttendance,
  summarizeMember,
  type MemberRecord,
  type RecordOverview,
  type StudyRow,
} from '../src/lib/covens/record.ts';

const NOW = Date.parse('2026-11-20T12:00:00Z');
const day = (n: number) => new Date(NOW - n * 86400000).toISOString();
const SINCE = day(60); // attendance began to be kept 60 days ago

const study = (over: Partial<StudyRow> = {}): StudyRow => ({
  id: 'e1',
  user_id: 'u1',
  program_id: 'p1',
  title: 'First Degree',
  kind: 'initiation',
  status: 'active',
  started_at: day(100),
  completed_at: null,
  stage_started_at: day(50),
  stage_title: 'Dedication',
  stage_index: 1,
  stage_count: 4,
  tasks_required: 12,
  tasks_approved: 5,
  waiting: 1,
  returned: 0,
  last_activity: day(5),
  ...over,
});

const overview = (): RecordOverview => ({
  since: day(90),
  attendance_since: SINCE,
  now: new Date(NOW).toISOString(),
  members: [
    { user_id: 'u1', joined_at: day(200), rank_id: 'r1', muted_until: null },
    { user_id: 'u2', joined_at: day(200), rank_id: 'r2', muted_until: null },
    { user_id: 'u3', joined_at: day(10), rank_id: 'r1', muted_until: null },
  ],
  rituals: [
    { id: 'old', title: 'Old moon', held_at: day(80), status: 'done' },
    { id: 'a', title: 'Esbat', held_at: day(40), status: 'done' },
    { id: 'b', title: 'Samhain', held_at: day(20), status: 'done' },
    { id: 'c', title: 'Dark moon', held_at: day(8), status: 'done' },
    { id: 'd', title: 'Full moon', held_at: day(3), status: 'done' },
  ],
  attendance: [
    { ritual_id: 'a', user_id: 'u1', present: true, excused: false, apology: false },
    { ritual_id: 'old', user_id: 'u2', present: true, excused: false, apology: false },
    { ritual_id: 'a', user_id: 'u2', present: true, excused: false, apology: false },
    { ritual_id: 'b', user_id: 'u2', present: null, excused: true, apology: true },
    { ritual_id: 'c', user_id: 'u2', present: true, excused: false, apology: false },
    { ritual_id: 'd', user_id: 'u2', present: true, excused: false, apology: false },
    { ritual_id: 'd', user_id: 'u3', present: true, excused: false, apology: false },
  ],
  rsvps: [],
  marks: [{ ritual_id: 'd', user_id: 'u2', count: 2 }],
  contributions: [{ ritual_id: 'c', user_id: 'u2', count: 1 }],
  studies: [study({ last_activity: day(45) }), study({ id: 'e2', user_id: 'u2', last_activity: day(2) })],
  mentors: [
    { user_id: 'u1', mentor_id: 'u2', assigned_at: day(150) },
    { user_id: 'u3', mentor_id: 'u2', assigned_at: day(9) },
  ],
  checkins: [{ user_id: 'u1', mentor_id: 'u2', count: 2, last: day(60).slice(0, 10) }],
  activity: [
    { user_id: 'u1', tendings: 0, messages: 1, last_tending: null, last_message: day(39), last_present: day(40), last_mark: null, last_contribution: null, last_rsvp: null, last_study: day(45) },
    { user_id: 'u2', tendings: 4, messages: 30, last_tending: day(1), last_message: day(1), last_present: day(3), last_mark: day(3), last_contribution: day(8), last_rsvp: day(4), last_study: day(2) },
    { user_id: 'u3', tendings: 0, messages: 0, last_tending: null, last_message: null, last_present: day(3), last_mark: null, last_contribution: null, last_rsvp: null, last_study: null },
  ],
});

test('a ritual stands as there, excused, not there, or not recorded before attendance was kept', () => {
  assert.equal(attendedAs({ status: 'done', held_at: day(10) }, { present: true, excused: false }, SINCE), 'present');
  assert.equal(attendedAs({ status: 'done', held_at: day(10) }, { present: null, excused: true }, SINCE), 'excused');
  assert.equal(attendedAs({ status: 'done', held_at: day(10) }, null, SINCE), 'missed');
  assert.equal(attendedAs({ status: 'done', held_at: day(90) }, null, SINCE), 'not_recorded');
  // A leader's word counts even before attendance was kept.
  assert.equal(attendedAs({ status: 'done', held_at: day(90) }, { present: true, excused: false }, SINCE), 'present');
  assert.equal(attendedAs({ status: 'live', held_at: day(0) }, null, SINCE), 'under_way');
  assert.equal(attendedAs({ status: 'scheduled', held_at: day(-3) }, null, SINCE), 'coming');
});

test('attendance sums up with the run of rituals missed most recently', () => {
  const s = summarizeAttendance(
    [
      { status: 'done', held_at: day(80), row: null },
      { status: 'done', held_at: day(40), row: { present: true, excused: false } },
      { status: 'done', held_at: day(20), row: null },
      { status: 'done', held_at: day(8), row: null },
      { status: 'done', held_at: day(3), row: null },
      { status: 'live', held_at: day(0), row: null },
    ],
    SINCE,
  );
  assert.deepEqual(s, { held: 5, recorded: 4, attended: 1, excused: 0, missed: 3, unrecorded: 1, missedRun: 3 });
  assert.equal(attendanceLine(s, 'in the last 90 days'), '1 of 4 rituals in the last 90 days · 1 before attendance was kept');
  assert.equal(attendanceLine({ held: 0, recorded: 0, attended: 0, excused: 0, missed: 0, unrecorded: 0, missedRun: 0 }, 'in the last 30 days'), 'No rituals in the last 30 days');
});

test('an excused absence breaks a run of missed rituals', () => {
  const s = summarizeAttendance(
    [
      { status: 'done', held_at: day(20), row: null },
      { status: 'done', held_at: day(8), row: { present: null, excused: true } },
      { status: 'done', held_at: day(3), row: null },
    ],
    SINCE,
  );
  assert.equal(s.missedRun, 1);
  assert.equal(s.excused, 1);
});

test('studies stall after thirty days without moving, and read as a line', () => {
  assert.equal(studyStalled(study({ last_activity: day(31) }), NOW), true);
  assert.equal(studyStalled(study({ last_activity: day(5) }), NOW), false);
  assert.equal(studyStalled(study({ status: 'paused', last_activity: day(90) }), NOW), false);
  assert.equal(studyLine(study()), 'Stage 2 of 4, Dedication · 5 of 12 tasks done · 1 waiting for sign-off');
  assert.equal(studyLine(study({ status: 'completed', tasks_approved: 12, waiting: 0 })), 'Completed · 12 of 12 tasks done');
  assert.equal(studiesLine([{ ...study(), stalled: true }]), 'In First Degree, stalled');
  assert.equal(studiesLine([]), 'Not in a study');
});

test('mentor check-ins are overdue after six weeks, counted from the mentor being given when there are none', () => {
  assert.equal(checkinOverdue(day(100), day(43), NOW), true);
  assert.equal(checkinOverdue(day(100), day(10), NOW), false);
  assert.equal(checkinOverdue(day(20), null, NOW), false);
  assert.equal(checkinOverdue(day(50), null, NOW), true);
});

test('the overview flags gently and lists the least active first', () => {
  const rows = overviewRows(overview(), [], NOW);
  assert.deepEqual(rows.map((r) => r.userId), ['u1', 'u3', 'u2']);
  const u1 = rows[0];
  assert.equal(u1.attendance.attended, 1);
  assert.equal(u1.attendance.missedRun, 3);
  assert.deepEqual(u1.flags, ['Missed the last 3 rituals', 'First Degree hasn’t moved in 45 days', 'No mentor check-in in 9 weeks', 'Not active in 39 days']);
  assert.equal(mentorLine(u1, (id) => (id === 'u2' ? 'Rowan' : '?'), NOW), 'Mentored by Rowan · last check-in 9 weeks ago');
  // Joined ten days ago: only the rituals since count, and a new mentor isn't overdue yet.
  const u3 = rows[1];
  assert.equal(u3.attendance.held, 2);
  assert.deepEqual(u3.flags, []);
  const u2 = summarizeMember(overview(), 'u2', NOW);
  assert.equal(attendanceLine(u2.attendance, 'in the last 90 days'), '4 of 5 rituals in the last 90 days · 1 excused');
  assert.equal(u2.stepsTaken, 2);
  assert.equal(u2.contributions, 1);
  assert.deepEqual(u2.flags, []);
});

test('the WHO picker narrows the overview to positions and people', () => {
  assert.deepEqual(overviewRows(overview(), [{ kind: 'rank', id: 'r1' }], NOW).map((r) => r.userId).sort(), ['u1', 'u3']);
  assert.deepEqual(overviewRows(overview(), [{ kind: 'user', id: 'u2' }], NOW).map((r) => r.userId), ['u2']);
});

test('who sees the record: the head, site moderators, and those the head chose', () => {
  const settings = { record_viewers: [{ kind: 'rank', id: 'r9' }] };
  assert.equal(seesRecord({ founder: true, site: false, settings: null, membership: null, userId: 'u1' }), true);
  assert.equal(seesRecord({ founder: false, site: true, settings: null, membership: null, userId: 'u1' }), true);
  assert.equal(seesRecord({ founder: false, site: false, settings, membership: { status: 'active', rank_id: 'r9' }, userId: 'u1' }), true);
  assert.equal(seesRecord({ founder: false, site: false, settings, membership: { status: 'active', rank_id: 'r1' }, userId: 'u1' }), false);
  // No one chosen means only the head, not everyone.
  assert.equal(seesRecord({ founder: false, site: false, settings: { record_viewers: [] }, membership: { status: 'active', rank_id: 'r1' }, userId: 'u1' }), false);
});

const record = (over: Partial<MemberRecord> = {}): MemberRecord => ({
  user_id: 'u1',
  joined_at: day(200),
  rank_id: 'r1',
  status: 'active',
  muted_until: null,
  attendance_since: SINCE,
  now: new Date(NOW).toISOString(),
  own: false,
  keeper: true,
  marks_attendance: true,
  rituals: [
    { id: 'n', title: 'New moon', status: 'scheduled', occasion: null, scheduled_for: day(-2), held_at: day(-2), rsvp: 'not_going', present: null, joined_at: null, corrected: false, excused: false, apology: 'Working late', apology_sent: true, steps: [], finished: 0, contributions: [] },
    { id: 'd', title: 'Full moon', status: 'done', occasion: null, scheduled_for: day(3), held_at: day(3), rsvp: 'going', present: true, joined_at: day(3), corrected: false, excused: false, apology: null, apology_sent: false, steps: ['Call the quarters', 'Light a candle'], finished: 1, contributions: [{ step: 'Petitions', kind: 'petition', sealed: false, status: 'offered' }, { step: 'Silence', kind: null, sealed: true, status: 'offered' }] },
    { id: 'old', title: 'Old moon', status: 'done', occasion: null, scheduled_for: day(80), held_at: day(80), rsvp: null, present: null, joined_at: null, corrected: false, excused: false, apology: null, apology_sent: false, steps: [], finished: 0, contributions: [] },
  ],
  studies: [study()],
  mentor: { mentor_id: 'u2', assigned_at: day(150) },
  checkins_hidden: false,
  checkins: [{ id: 'k1', mentor_id: 'u2', met_on: day(10).slice(0, 10), note: 'Talked through the work', created_at: day(10) }],
  mentees: [],
  activity: { tendings: 2, last_tending: day(4), messages: 12, last_message: day(2) },
  notes: [],
  removals: [],
  ...over,
});

test('a member’s page: each ritual with how they stood and what they did, never what they wrote', () => {
  const { rows, summary } = recordRituals(record());
  assert.deepEqual(rows.map((r) => r.attended), ['coming', 'present', 'not_recorded']);
  assert.equal(summary.attended, 1);
  assert.equal(summary.unrecorded, 1);
  assert.equal(ritualPartLine(record().rituals[1]), 'Took part in 2 steps (Call the quarters, Light a candle) · led a step · brought a petition, something sealed');
  assert.equal(ritualPartLine(record().rituals[2]), '');
  assert.deepEqual(recordFlags(record(), NOW), []);
  // Hidden check-ins aren't guessed at.
  assert.deepEqual(recordFlags(record({ checkins_hidden: true, checkins: [] }), NOW), []);
  assert.deepEqual(recordFlags(record({ checkins: [] }), NOW), ['No mentor check-in yet']);
});

test('flags read plainly, and dates are checked', () => {
  assert.deepEqual(memberFlags({ attendance: { held: 0, recorded: 0, attended: 0, excused: 0, missed: 0, unrecorded: 0, missedRun: 0 }, studies: [], mentorId: null, mentorSince: null, lastCheckin: null, lastActive: null, joinedAt: day(40) }, NOW), ['Nothing yet since joining']);
  assert.equal(agoLabel(day(0), NOW), 'today');
  assert.equal(agoLabel(day(1), NOW), 'yesterday');
  assert.equal(agoLabel(day(35), NOW), '5 weeks ago');
  assert.equal(agoLabel(null, NOW), 'never');
  assert.equal(cleanCheckinDate('2026-11-02', NOW), '2026-11-02');
  assert.equal(cleanCheckinDate('2026-02-30', NOW), null);
  assert.equal(cleanCheckinDate('2027-01-01', NOW), null);
  assert.equal(sinceFor('all', NOW), null);
  assert.equal(sinceFor('30', NOW), day(30));
});
