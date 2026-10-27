// The members' record on the website, level with the app: the app's own
// summing-up (lib/covens/record.ts, through js/core/covens.js), the same
// database calls and shapes, the pages wired in, and a migration that checks
// who is asking and never hands over what anyone wrote.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/core/covens.js"));
const R = global.SaltCore.covens.record;

const NOW = Date.parse("2026-11-20T12:00:00Z");
const day = (n) => new Date(NOW - n * 86400000).toISOString();

test("the website sums up attendance and flags as the app does", () => {
  const overview = {
    since: day(90),
    attendance_since: day(60),
    now: new Date(NOW).toISOString(),
    members: [
      { user_id: "u1", joined_at: day(200), rank_id: "r1", muted_until: null },
      { user_id: "u2", joined_at: day(200), rank_id: "r2", muted_until: null }
    ],
    rituals: [
      { id: "a", title: "Esbat", held_at: day(40), status: "done" },
      { id: "b", title: "Samhain", held_at: day(20), status: "done" },
      { id: "c", title: "Dark moon", held_at: day(8), status: "done" },
      { id: "d", title: "Full moon", held_at: day(3), status: "done" }
    ],
    attendance: ["a", "b", "c", "d"].map((id) => ({ ritual_id: id, user_id: "u2", present: true, excused: false, apology: false })),
    rsvps: [],
    marks: [],
    contributions: [],
    studies: [],
    mentors: [{ user_id: "u1", mentor_id: "u2", assigned_at: day(100) }],
    checkins: [],
    activity: [
      { user_id: "u1", tendings: 0, messages: 0, last_tending: null, last_message: day(50), last_present: null, last_mark: null, last_contribution: null, last_rsvp: null, last_study: null },
      { user_id: "u2", tendings: 1, messages: 9, last_tending: day(2), last_message: day(1), last_present: day(3), last_mark: null, last_contribution: null, last_rsvp: null, last_study: null }
    ]
  };
  const rows = R.overviewRows(overview, [], NOW);
  assert.deepEqual(rows.map((r) => r.userId), ["u1", "u2"]);
  assert.equal(R.attendanceLine(rows[0].attendance, R.rangePhrase("90")), "0 of 4 rituals in the last 90 days");
  assert.deepEqual(rows[0].flags, ["Missed the last 4 rituals", "No mentor check-in yet", "Not active in 50 days"]);
  assert.equal(R.attendanceLine(rows[1].attendance, R.rangePhrase("90")), "4 of 4 rituals in the last 90 days");
  assert.deepEqual(R.overviewRows(overview, [{ kind: "rank", id: "r2" }], NOW).map((r) => r.userId), ["u2"]);
  assert.equal(R.seesRecord({ founder: false, site: false, settings: { record_viewers: [{ kind: "user", id: "u2" }] }, membership: { status: "active", rank_id: "r2" }, userId: "u2" }), true);
});

test("the website asks the database for the record with the app's calls and shapes", async () => {
  const calls = [];
  global.db = { rpc: (name, args) => (calls.push([name, args]), Promise.resolve({ data: { ok: true }, error: null })) };
  delete global.CovenData;
  vm.runInThisContext(read("covens/coven-data.js"));
  const D = global.CovenData;
  await D.recordOverview("c1", null);
  await D.memberRecord("c1", "u1");
  await D.recordPresence("r1");
  await D.markAttendance("r1", "u1", null);
  await D.sendApology("r1", "  Working late ");
  await D.excuseAbsence("r1", "u1", true);
  await D.logCheckin("c1", "u1", "2026-11-01", "");
  await D.addMemberNote("c1", "u1", " Quiet lately ");
  await D.removeMember("c1", "u1", "removed", "");
  await D.setRecordViewers("c1", [{ kind: "rank", id: "r1" }], false);
  assert.deepEqual(calls, [
    ["coven_member_record_overview", { p_coven: "c1", p_since: null }],
    ["coven_member_record", { p_coven: "c1", p_user: "u1" }],
    ["record_coven_ritual_presence", { p_ritual: "r1" }],
    ["mark_coven_ritual_attendance", { p_ritual: "r1", p_user: "u1", p_present: null }],
    ["send_coven_ritual_apology", { p_ritual: "r1", p_note: "Working late" }],
    ["excuse_coven_ritual_absence", { p_ritual: "r1", p_user: "u1", p_excused: true }],
    ["log_coven_mentor_checkin", { p_coven: "c1", p_user: "u1", p_met_on: "2026-11-01", p_note: null }],
    ["add_coven_member_note", { p_coven: "c1", p_user: "u1", p_body: "Quiet lately" }],
    ["remove_coven_member", { p_coven: "c1", p_user: "u1", p_status: "removed", p_reason: null }],
    ["set_coven_record_viewers", { p_coven: "c1", p_viewers: [{ kind: "rank", id: "r1" }], p_mentees_see_checkins: false }]
  ]);
  // The app calls the same functions with the same arguments.
  const api = read("app/src/lib/covens/api.ts");
  for (const [name] of calls) assert.ok(api.includes(`'${name}'`), name);
});

test("the coven page loads the record, its tab, My standing and attendance on the ritual page", () => {
  const page = read("covens/coven/index.html");
  assert.ok(page.indexOf('"/covens/coven/picker.js"') < page.indexOf('"/covens/coven/record.js"'));
  assert.ok(page.indexOf('"/covens/coven/record.js"') < page.indexOf('"/covens/coven/coven.js"'));
  const coven = read("covens/coven/coven.js");
  assert.match(coven, /key: "record"/);
  assert.match(coven, /CovenStanding/);
  assert.match(read("covens/coven/rituals.js"), /D\.recordPresence\(ritual\.id\)/);
  assert.match(read("covens/coven/record.js"), /D\.removeMember\(coven\.id, userId, act, reason\)/);
  assert.match(read("covens/guidelines/index.html"), /leaders keep track of how its members take part/);
});

test("the migration checks who is asking and gives counts and kinds, never words", () => {
  const sql = read("supabase/migrations/20261102000000_coven_member_record.sql");
  for (const fn of ["coven_member_record_overview", "coven_member_record", "record_coven_ritual_presence", "mark_coven_ritual_attendance", "send_coven_ritual_apology", "excuse_coven_ritual_absence", "log_coven_mentor_checkin", "add_coven_member_note", "remove_coven_member", "set_coven_record_viewers"]) {
    assert.match(sql, new RegExp(`create or replace function public\\.${fn}\\(`), fn);
  }
  assert.match(sql, /if not public\.coven_sees_record\(p_coven\) then/);
  assert.match(sql, /'kind', case when c\.private or c\.visibility = 'me' then null else c\.kind end/);
  assert.doesNotMatch(sql, /'body', c\.body/, "never what anyone wrote for a ritual");
  assert.match(sql, /g\.conversation_id is null/, "only the whole coven's chat is counted");
  assert.match(sql, /create policy "Record keepers see notes about others"[\s\S]*?user_id <> auth\.uid\(\)/);
  for (const table of ["coven_ritual_attendance", "coven_mentor_checkins", "coven_member_notes", "coven_member_removals"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`), table);
  }
});
