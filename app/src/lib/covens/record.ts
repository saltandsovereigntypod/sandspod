// The members' record: who has been taking part in a coven and who hasn't
// (supabase/migrations/20261102000000_coven_member_record.sql). The database
// gives the raw counts (coven_member_record_overview, coven_member_record);
// this sums them up the same way in the app and on the website (through
// js/core/covens.js): attendance, how studies are going, mentoring, and the
// gentle flags that say someone may need a word.
//
// Pure: no React, no Supabase.

import { cleanAssignees, includesMember, membersAmong, type Assignee } from './picker.ts';

/** How long a study can sit still, a mentee go without a check-in, or a member stay quiet, before it's flagged. */
export const STALL_DAYS = 30;
export const CHECKIN_DAYS = 42;
export const QUIET_DAYS = 30;
/** Missing this many rituals in a row is flagged. */
export const MISSED_RUN = 3;

const DAY = 86400000;

export const RANGES = [
  { value: '30', label: '30 days', phrase: 'in the last 30 days' },
  { value: '90', label: '90 days', phrase: 'in the last 90 days' },
  { value: '180', label: '6 months', phrase: 'in the last 6 months' },
  { value: '365', label: 'A year', phrase: 'in the last year' },
  { value: 'all', label: 'All', phrase: 'since they joined' },
] as const;
export type RangeValue = (typeof RANGES)[number]['value'];
export const DEFAULT_RANGE: RangeValue = '90';

/** The start of a range, as the overview asks for it (null: ever). */
export function sinceFor(range: string, now = Date.now()): string | null {
  const days = Number(range);
  return Number.isFinite(days) && days > 0 ? new Date(now - days * DAY).toISOString() : null;
}

export function rangePhrase(range: string): string {
  return RANGES.find((r) => r.value === range)?.phrase ?? 'since they joined';
}

// ─── What the database sends ─────────────────────────────────────────────

export type RecordSettings = { coven_id: string; record_viewers: Assignee[] | unknown; mentees_see_checkins: boolean };

export type StudyRow = {
  id: string;
  user_id: string;
  program_id: string;
  title: string;
  kind: 'initiation' | 'training';
  status: 'active' | 'paused' | 'completed' | 'withdrawn';
  started_at: string;
  completed_at: string | null;
  stage_started_at: string | null;
  stage_title: string | null;
  stage_index: number | null;
  stage_count: number;
  tasks_required: number;
  tasks_approved: number;
  waiting: number;
  returned: number;
  last_activity: string | null;
};

export type OverviewRitual = { id: string; title: string; held_at: string; status: 'done' | 'live' };
export type OverviewAttendance = { ritual_id: string; user_id: string; present: boolean | null; excused: boolean; apology: boolean };
export type Checkin = { id: string; mentor_id: string; met_on: string; note: string | null; created_at: string };

/** One person's attendance row for one ritual (read straight from the table: your own, or everyone's for those who lead rituals or see the record). */
export type AttendanceRow = {
  ritual_id: string;
  coven_id: string;
  user_id: string;
  present: boolean | null;
  joined_at: string | null;
  marked_by: string | null;
  apology: string | null;
  apology_at: string | null;
  excused: boolean;
};

export type RecordOverview = {
  since: string | null;
  attendance_since: string;
  now: string;
  members: { user_id: string; joined_at: string; rank_id: string | null; muted_until: string | null }[];
  rituals: OverviewRitual[];
  attendance: OverviewAttendance[];
  rsvps: { ritual_id: string; user_id: string; response: 'going' | 'maybe' | 'not_going' }[];
  marks: { ritual_id: string; user_id: string; count: number }[];
  contributions: { ritual_id: string; user_id: string; count: number }[];
  studies: StudyRow[];
  mentors: { user_id: string; mentor_id: string; assigned_at: string }[];
  checkins: { user_id: string; mentor_id: string; count: number; last: string }[];
  activity: {
    user_id: string;
    tendings: number;
    messages: number;
    last_tending: string | null;
    last_message: string | null;
    last_present: string | null;
    last_mark: string | null;
    last_contribution: string | null;
    last_rsvp: string | null;
    last_study: string | null;
  }[];
};

export type RecordRitual = {
  id: string;
  title: string;
  status: 'done' | 'live' | 'scheduled';
  occasion: string | null;
  scheduled_for: string | null;
  held_at: string;
  rsvp: 'going' | 'maybe' | 'not_going' | null;
  present: boolean | null;
  joined_at: string | null;
  corrected: boolean;
  excused: boolean;
  apology: string | null;
  apology_sent: boolean;
  steps: string[];
  finished: number;
  contributions: { step: string; kind: string | null; sealed: boolean; status: string }[];
};

export type MemberRecord = {
  user_id: string;
  joined_at: string;
  rank_id: string | null;
  status: 'active' | 'left' | 'removed' | 'banned';
  muted_until: string | null;
  attendance_since: string;
  now: string;
  own: boolean;
  keeper: boolean;
  marks_attendance: boolean;
  rituals: RecordRitual[];
  studies: StudyRow[];
  mentor: { mentor_id: string; assigned_at: string } | null;
  checkins_hidden: boolean;
  checkins: Checkin[];
  mentees: { user_id: string; assigned_at: string; checkins: Checkin[]; studies: StudyRow[] }[];
  activity: { tendings: number; last_tending: string | null; messages: number; last_message: string | null };
  notes: { id: string; author_id: string | null; body: string; created_at: string }[];
  removals: { status: 'removed' | 'banned'; reason: string | null; removed_by: string | null; created_at: string }[];
};

// ─── Who sees it ─────────────────────────────────────────────────────────

/** Whether this person sees the record: the coven's head, a site moderator, or one the head chose. */
export function seesRecord(args: {
  founder: boolean;
  site: boolean;
  settings: Pick<RecordSettings, 'record_viewers'> | null | undefined;
  membership: { status: string; rank_id: string | null } | null | undefined;
  userId: string | null | undefined;
}): boolean {
  if (args.founder || args.site) return true;
  const viewers = cleanAssignees(args.settings?.record_viewers ?? []);
  return viewers.length > 0 && includesMember(viewers, args.membership, args.userId);
}

// ─── Attendance ──────────────────────────────────────────────────────────

export type Attended = 'present' | 'excused' | 'missed' | 'not_recorded' | 'under_way' | 'coming';

/** How one ritual stands for one member. A leader's word (present true or false, or excused) counts even before attendance was kept. */
export function attendedAs(
  ritual: { status: string; held_at: string },
  row: { present: boolean | null; excused: boolean } | null | undefined,
  attendanceSince: string,
): Attended {
  if (ritual.status === 'scheduled') return row?.excused ? 'excused' : 'coming';
  if (row?.present === true) return 'present';
  if (row?.excused) return 'excused';
  if (ritual.status === 'live') return 'under_way';
  if (row?.present === false) return 'missed';
  if (new Date(ritual.held_at).getTime() < new Date(attendanceSince).getTime()) return 'not_recorded';
  return 'missed';
}

export const ATTENDED_LABEL: Record<Attended, string> = {
  present: 'There',
  excused: 'Excused',
  missed: 'Not there',
  not_recorded: 'Not recorded',
  under_way: 'Under way',
  coming: 'Coming up',
};

export const RSVP_LABEL: Record<string, string> = { going: 'Said going', maybe: 'Said maybe', not_going: 'Said they couldn’t make it' };

export type AttendanceSummary = {
  /** Rituals held since they joined (in the range). */
  held: number;
  /** Of those, the ones attendance was kept for (or a leader marked). */
  recorded: number;
  attended: number;
  excused: number;
  missed: number;
  unrecorded: number;
  /** Rituals missed in a row, most recent first, without an excuse. */
  missedRun: number;
};

/** Attendance for a list of rituals, newest last or in any order. */
export function summarizeAttendance(list: { status: string; held_at: string; row: { present: boolean | null; excused: boolean } | null | undefined }[], attendanceSince: string): AttendanceSummary {
  const out: AttendanceSummary = { held: 0, recorded: 0, attended: 0, excused: 0, missed: 0, unrecorded: 0, missedRun: 0 };
  const states = [...list]
    .filter((r) => r.status === 'done' || r.status === 'live')
    .sort((a, b) => new Date(b.held_at).getTime() - new Date(a.held_at).getTime())
    .map((r) => attendedAs(r, r.row, attendanceSince));
  let run = true;
  for (const state of states) {
    if (state === 'under_way') continue;
    out.held += 1;
    if (state === 'not_recorded') out.unrecorded += 1;
    else out.recorded += 1;
    if (state === 'present') out.attended += 1;
    if (state === 'excused') out.excused += 1;
    if (state === 'missed') out.missed += 1;
    if (run && state === 'missed') out.missedRun += 1;
    else run = false;
  }
  return out;
}

/** "6 of 9 rituals in the last 90 days", with what was excused or not recorded. */
export function attendanceLine(s: AttendanceSummary, phrase: string): string {
  if (!s.held) return `No rituals ${phrase}`;
  const parts: string[] = [];
  if (s.recorded) parts.push(`${s.attended} of ${s.recorded} ${s.recorded === 1 ? 'ritual' : 'rituals'} ${phrase}`);
  if (s.excused) parts.push(`${s.excused} excused`);
  if (s.unrecorded) parts.push(`${s.unrecorded} before attendance was kept`);
  return parts.join(' · ');
}

// ─── Studies ─────────────────────────────────────────────────────────────

export function studyStalled(study: Pick<StudyRow, 'status' | 'last_activity' | 'started_at'>, now = Date.now(), days = STALL_DAYS): boolean {
  if (study.status !== 'active') return false;
  const last = new Date(study.last_activity ?? study.started_at).getTime();
  return now - last >= days * DAY;
}

/** Whole days since a moment (0 today). */
export function daysSince(value: string | null | undefined, now = Date.now()): number | null {
  if (!value) return null;
  return Math.max(0, Math.floor((now - new Date(value).getTime()) / DAY));
}

/** "today", "yesterday", "12 days ago", "5 weeks ago", "3 months ago". */
export function agoLabel(value: string | null | undefined, now = Date.now()): string {
  const days = daysSince(value, now);
  if (days == null) return 'never';
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 21) return `${days} days ago`;
  if (days < 70) return `${Math.round(days / 7)} weeks ago`;
  if (days < 730) return `${Math.round(days / 30)} months ago`;
  return `${Math.round(days / 365)} years ago`;
}

const STUDY_STATUS: Record<StudyRow['status'], string> = { active: 'Under way', paused: 'Paused', completed: 'Completed', withdrawn: 'Withdrawn' };

/** "Stage 2 of 4, Dedication · 5 of 12 tasks done · 1 waiting for sign-off". */
export function studyLine(study: StudyRow): string {
  const parts: string[] = [];
  if (study.status === 'completed') parts.push('Completed');
  else if (study.status !== 'active') parts.push(STUDY_STATUS[study.status]);
  if (study.status !== 'completed' && study.stage_index != null && study.stage_count) parts.push(`Stage ${study.stage_index + 1} of ${study.stage_count}${study.stage_title ? `, ${study.stage_title}` : ''}`);
  if (study.tasks_required) parts.push(`${study.tasks_approved} of ${study.tasks_required} tasks done`);
  if (study.waiting) parts.push(`${study.waiting} waiting for sign-off`);
  if (study.returned) parts.push(`${study.returned} sent back`);
  return parts.join(' · ');
}

// ─── Mentoring ───────────────────────────────────────────────────────────

/** Whether a mentorship has gone too long without a check-in (counted from the last one, or from when the mentor was given). */
export function checkinOverdue(assignedAt: string, lastCheckin: string | null | undefined, now = Date.now(), days = CHECKIN_DAYS): boolean {
  const from = lastCheckin ? new Date(lastCheckin).getTime() : new Date(assignedAt).getTime();
  return now - from >= days * DAY;
}

// ─── One member in the overview ──────────────────────────────────────────

export type MemberSummary = {
  userId: string;
  joinedAt: string;
  rankId: string | null;
  attendance: AttendanceSummary;
  lastActive: string | null;
  studies: (StudyRow & { stalled: boolean })[];
  mentorId: string | null;
  mentorSince: string | null;
  lastCheckin: string | null;
  checkins: number;
  tendings: number;
  messages: number;
  stepsTaken: number;
  contributions: number;
  flags: string[];
};

const latest = (values: (string | null | undefined)[]): string | null =>
  values.filter((v): v is string => !!v).reduce<string | null>((a, b) => (!a || new Date(b).getTime() > new Date(a).getTime() ? b : a), null);

export function summarizeMember(overview: RecordOverview, userId: string, now = Date.now()): MemberSummary {
  const member = overview.members.find((m) => m.user_id === userId);
  const joinedAt = member?.joined_at ?? overview.now;
  const joined = new Date(joinedAt).getTime();
  const rows = new Map(overview.attendance.filter((a) => a.user_id === userId).map((a) => [a.ritual_id, a]));
  const theirs = overview.rituals.filter((r) => new Date(r.held_at).getTime() >= joined);
  const attendance = summarizeAttendance(
    theirs.map((r) => ({ status: r.status, held_at: r.held_at, row: rows.get(r.id) })),
    overview.attendance_since,
  );
  const activity = overview.activity.find((a) => a.user_id === userId);
  const studies = overview.studies.filter((s) => s.user_id === userId).map((s) => ({ ...s, stalled: studyStalled(s, now) }));
  const mentor = overview.mentors.find((m) => m.user_id === userId) ?? null;
  const checkin = mentor ? overview.checkins.find((c) => c.user_id === userId && c.mentor_id === mentor.mentor_id) : undefined;
  const lastActive = latest([
    activity?.last_present,
    activity?.last_mark,
    activity?.last_contribution,
    activity?.last_rsvp,
    activity?.last_message,
    activity?.last_tending,
    activity?.last_study,
    ...studies.map((s) => s.last_activity),
  ]);
  const summary: MemberSummary = {
    userId,
    joinedAt,
    rankId: member?.rank_id ?? null,
    attendance,
    lastActive,
    studies,
    mentorId: mentor?.mentor_id ?? null,
    mentorSince: mentor?.assigned_at ?? null,
    lastCheckin: checkin?.last ?? null,
    checkins: checkin?.count ?? 0,
    tendings: activity?.tendings ?? 0,
    messages: activity?.messages ?? 0,
    stepsTaken: overview.marks.filter((m) => m.user_id === userId).reduce((n, m) => n + Number(m.count), 0),
    contributions: overview.contributions.filter((c) => c.user_id === userId).reduce((n, c) => n + Number(c.count), 0),
    flags: [],
  };
  summary.flags = memberFlags(summary, now);
  return summary;
}

/** The gentle flags: what may need a word with them. */
export function memberFlags(s: Pick<MemberSummary, 'attendance' | 'studies' | 'mentorId' | 'mentorSince' | 'lastCheckin' | 'lastActive' | 'joinedAt'>, now = Date.now()): string[] {
  const flags: string[] = [];
  if (s.attendance.missedRun >= MISSED_RUN) flags.push(`Missed the last ${s.attendance.missedRun} rituals`);
  for (const study of s.studies) {
    if (!studyStalled(study, now)) continue;
    const days = daysSince(study.last_activity ?? study.started_at, now) ?? STALL_DAYS;
    flags.push(`${study.title} hasn’t moved in ${days} days`);
  }
  if (s.mentorId && s.mentorSince && checkinOverdue(s.mentorSince, s.lastCheckin, now)) {
    flags.push(s.lastCheckin ? `No mentor check-in in ${Math.round((daysSince(s.lastCheckin, now) ?? 0) / 7)} weeks` : 'No mentor check-in yet');
  }
  const quietFrom = s.lastActive ?? s.joinedAt;
  if ((daysSince(quietFrom, now) ?? 0) >= QUIET_DAYS) flags.push(s.lastActive ? `Not active in ${daysSince(quietFrom, now)} days` : 'Nothing yet since joining');
  return flags;
}

/** How taking part someone is, for sorting (lower is less): rituals attended or excused, then how lately they were active. */
export function activityScore(s: MemberSummary, now = Date.now()): number {
  const rate = s.attendance.recorded ? (s.attendance.attended + s.attendance.excused) / s.attendance.recorded : 0.5;
  const quiet = Math.min(daysSince(s.lastActive ?? s.joinedAt, now) ?? 0, 365) / 365;
  return rate - quiet * 0.5 - s.flags.length * 0.1;
}

/** Everyone, least active first. */
export function leastActiveFirst(list: MemberSummary[], now = Date.now()): MemberSummary[] {
  return [...list].sort((a, b) => activityScore(a, now) - activityScore(b, now) || (a.lastActive ?? '').localeCompare(b.lastActive ?? ''));
}

/** The overview summed up for everyone, filtered to those chosen in the WHO picker (none chosen: everyone), least active first. */
export function overviewRows(overview: RecordOverview, who: Assignee[], now = Date.now()): MemberSummary[] {
  const members = overview.members.map((m) => ({ ...m, status: 'active' }));
  const chosen = who.length ? new Set(membersAmong(who, members)) : null;
  return leastActiveFirst(
    overview.members.filter((m) => !chosen || chosen.has(m.user_id)).map((m) => summarizeMember(overview, m.user_id, now)),
    now,
  );
}

/** "Mentored by Rowan · last check-in 3 weeks ago", or that they have no mentor. */
export function mentorLine(s: Pick<MemberSummary, 'mentorId' | 'lastCheckin'>, nameOf: (id: string) => string, now = Date.now()): string {
  if (!s.mentorId) return 'No mentor';
  return `Mentored by ${nameOf(s.mentorId)} · ${s.lastCheckin ? `last check-in ${agoLabel(s.lastCheckin, now)}` : 'no check-ins yet'}`;
}

/** "In 2 studies, 1 stalled", or none. */
export function studiesLine(studies: (StudyRow & { stalled?: boolean })[]): string {
  const going = studies.filter((s) => s.status === 'active' || s.status === 'paused');
  const done = studies.filter((s) => s.status === 'completed').length;
  if (!going.length) return done ? `Completed ${done} ${done === 1 ? 'study' : 'studies'}` : 'Not in a study';
  const stalled = going.filter((s) => s.stalled).length;
  return `In ${going.length === 1 ? going[0].title : `${going.length} studies`}${stalled ? `, ${stalled === 1 && going.length === 1 ? 'stalled' : `${stalled} stalled`}` : ''}`;
}

// ─── One member's page ───────────────────────────────────────────────────

/** A member's rituals, each with how they stood, and the attendance sum (all held since they joined). */
export function recordRituals(record: Pick<MemberRecord, 'rituals' | 'attendance_since'>) {
  const rows = record.rituals.map((r) => ({ ...r, attended: attendedAs(r, r, record.attendance_since) }));
  return { rows, summary: summarizeAttendance(record.rituals.map((r) => ({ status: r.status, held_at: r.held_at, row: r })), record.attendance_since) };
}

/** What they did in one ritual, in a line: "Took part in 2 steps · wrote 1 (sealed)". */
export function ritualPartLine(r: Pick<RecordRitual, 'steps' | 'finished' | 'contributions'>): string {
  const parts: string[] = [];
  if (r.steps.length) parts.push(`Took part in ${r.steps.length === 1 ? 'a step' : `${r.steps.length} steps`} (${r.steps.join(', ')})`);
  if (r.finished) parts.push(`led ${r.finished === 1 ? 'a step' : `${r.finished} steps`}`);
  if (r.contributions.length) {
    const sealed = r.contributions.filter((c) => c.sealed).length;
    const kinds = [...new Set(r.contributions.filter((c) => !c.sealed && c.kind).map((c) => KIND_LABEL[c.kind!] ?? c.kind!))];
    parts.push(`brought ${[...kinds, sealed ? (sealed === 1 ? 'something sealed' : `${sealed} sealed`) : ''].filter(Boolean).join(', ')}`);
  }
  if (!parts.length) return '';
  const line = parts.join(' · ');
  return line[0].toUpperCase() + line.slice(1);
}

const KIND_LABEL: Record<string, string> = {
  petition: 'a petition',
  intention: 'an intention',
  gratitude: 'a gratitude',
  vow: 'a vow',
  ancestor: 'words for an ancestor',
  question: 'a question',
  reflection: 'a reflection',
  offering: 'an offering',
  candle: 'a candle',
  light_candle: 'a lit candle',
  libation: 'a libation',
  card: 'a card',
};

/** The flags for one member's page, from the record itself. */
export function recordFlags(record: MemberRecord, now = Date.now()): string[] {
  const { summary } = recordRituals(record);
  const studies = record.studies.map((s) => ({ ...s, stalled: studyStalled(s, now) }));
  const lastCheckin = record.checkins[0]?.met_on ?? null;
  const lastActive = latest([
    ...record.rituals.filter((r) => r.present).map((r) => r.joined_at ?? r.held_at),
    record.activity.last_message,
    record.activity.last_tending,
    ...studies.map((s) => s.last_activity),
  ]);
  return memberFlags(
    {
      attendance: summary,
      studies,
      mentorId: record.mentor?.mentor_id ?? null,
      mentorSince: record.mentor?.assigned_at ?? null,
      // When check-ins are hidden from this reader, don't guess at them.
      lastCheckin: record.checkins_hidden ? new Date(now).toISOString() : lastCheckin,
      lastActive,
      joinedAt: record.joined_at,
    },
    now,
  );
}

/** A check-in as a line: "12 Oct · Talked through the first moon's work". */
export function checkinDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Today as the date a check-in is logged for (local, YYYY-MM-DD). */
export function todayIso(now = Date.now()): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** A typed date for a check-in, if it's a real day not in the future. */
export function cleanCheckinDate(value: string, now = Date.now()): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  if (date.getTime() > now + DAY) return null;
  return value.trim();
}

export const APOLOGY_MAX = 280;
export const NOTE_MAX = 2000;
export const REASON_MAX = 1000;
