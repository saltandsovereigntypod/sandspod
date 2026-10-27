// Coven meetings on the website, level with the app: the same rules from the
// app's own logic (js/core/covens.js, lib/covens/meetings.ts), and the pages
// calling the same database functions with the same shapes.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/core/covens.js"));
const { meetings: M, builder: B, templates: T, stepActions: A, script: S } = global.SaltCore.covens;

const nameOf = (id) => ({ sage: "Sage", oak: "Oak", rowan: "Rowan", willow: "Willow" })[id] || "Someone";
const plan = B.cleanPlan({ sections: [{ id: "b", name: "Business" }], roles: [{ id: "c", name: "Chair", cast: [{ kind: "user", id: "sage" }] }, { id: "s", name: "Secretary", cast: [{ kind: "user", id: "willow" }] }] }, "meeting");
const meeting = (patch) => Object.assign({ id: "m", kind: "meeting", status: "scheduled", scheduled_for: "2026-12-05T19:00:00Z", plan, audience: [{ kind: "rank", id: "elder" }], created_by: "head" }, patch);
const v = (userId, rank, extra) => Object.assign({ userId, membership: { status: "active", rank_id: rank }, standing: true }, extra || {});

test("the website has the app's meeting rules", () => {
  for (const fn of ["inAudience", "meetingPowers", "chatWindow", "chatAccess", "chatLine", "historyKeys", "historyLabel", "historyEntries", "readsHistory", "motionResult", "electionResult", "stepResult", "itemTimer", "floorState", "maySecond", "voteCalled", "outstandingActions", "actionDueLine", "actionTasks", "composeMinutes", "minutesPageBlocks", "cleanState"]) assert.equal(typeof M[fn], "function", fn);
  assert.equal(typeof A.groupsFor, "function");
});

test("a restricted meeting, its chat and its history read the same as in the app", () => {
  const start = Date.parse("2026-12-05T19:00:00Z");
  assert.equal(M.inAudience(meeting(), v("rowan", "initiate")), false);
  assert.equal(M.inAudience(meeting(), v("willow", "initiate")), true);
  assert.equal(M.chatWindow(meeting(), null, start - 10 * 60000).open, true, "fifteen minutes before by default");
  const done = meeting({ status: "done", started_at: new Date(start).toISOString(), ended_at: new Date(start + 3600000).toISOString() });
  const keys = M.historyKeys(null, null);
  assert.equal(M.chatAccess(done, null, keys, v("oak", "elder"), start + 2 * 3600000).read, false);
  assert.equal(M.chatAccess(done, null, keys, v("sage", "elder"), start + 2 * 3600000).read, true);
});

test("motions, elections, actions and minutes", () => {
  const tally = S.tallyVotes(["For", "Against", "Abstain"], [{ choice: "For" }, { choice: "For" }, { choice: "Against" }]);
  assert.equal(M.motionResult(tally, { threshold: "two_thirds" }).outcome, "carried");
  assert.equal(M.motionResult(tally, { threshold: "unanimous" }).outcome, "failed");
  const d = T.draftFromTemplate(T.templateOf("officials_meeting"));
  assert.equal(d.plan.meeting.series, "officials");
  assert.ok(A.searchActions("", "meeting").some((a) => a.id === "election"));
  assert.ok(!A.searchActions("", "rite").some((a) => a.id === "election"));
  const minutes = M.composeMinutes({ ritual: Object.assign(meeting({ status: "done" }), { title: "Elders" }), steps: [], attendees: ["oak"], apologies: [], state: null, votes: [], actions: [], ranks: [], nameOf });
  assert.match(M.minutesText(minutes), /PRESENT\nOak/);
  assert.equal(M.minutesPageBlocks(minutes.blocks)[0].block_type, "text");
});

test("the website's meeting page calls the database functions the app calls", () => {
  const page = read("covens/coven/meeting.js");
  const api = read("app/src/lib/covens/meetingApi.ts");
  for (const fn of ["set_coven_meeting_chat", "set_coven_meeting_floor", "raise_coven_meeting_hand", "set_coven_meeting_notes", "second_coven_meeting_motion", "propose_coven_meeting_amendment", "decide_coven_meeting_amendment", "call_coven_meeting_vote", "extend_coven_meeting_item", "add_coven_meeting_action", "set_coven_meeting_action", "set_coven_meeting_chat_readers", "save_coven_meeting_minutes", "remove_coven_meeting_message"]) {
    assert.ok(page.includes(`"${fn}"`), `website: ${fn}`);
    assert.ok(api.includes(`'${fn}'`), `app: ${fn}`);
  }
  for (const table of ["coven_meeting_messages", "coven_meeting_state", "coven_meeting_actions"]) {
    assert.ok(page.includes(table), `website reads ${table}`);
    assert.ok(api.includes(table), `app reads ${table}`);
  }
});
