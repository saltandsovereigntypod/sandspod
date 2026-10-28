// Waiting lists for full positions on the website, level with the app: the
// same logic and phone-note words (SaltCore.covens.queue / queueNotes), the
// same calls (coven-data.js), ringing the notes a change made due, the pages
// carrying the tools, and a test's answers only once passed.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
global.CovenLogic = require("../covens/coven-logic.js");
vm.runInThisContext(read("js/core/covens.js"));
const Q = global.SaltCore.covens.queue;
const N = global.SaltCore.covens.queueNotes;
const K = global.SaltCore.covens.quiz;

function fakeDb(answers = {}) {
  const calls = [];
  return {
    calls,
    from: () => ({}),
    rpc: (name, args) => {
      calls.push({ rpc: name, args });
      return Promise.resolve(answers[`rpc:${name}`] ?? { data: null, error: null });
    },
    functions: {
      invoke: (name, options) => {
        calls.push({ invoke: name, options });
        return Promise.resolve({ data: null, error: null });
      }
    }
  };
}

function loadCovenData(db) {
  global.db = db;
  delete global.CovenData;
  vm.runInThisContext(read("covens/coven-data.js"));
  return global.CovenData;
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

test("the line and its words read as in the app", () => {
  const list = Q.readEntries([
    { id: "b", name: "Bramble", queued_at: "2026-10-02T00:00:00Z", status: "waiting", source: "application", place: 2 },
    { id: "c", name: "Clover", queued_at: "2026-10-03T00:00:00Z", status: "proposed", source: "program", place: 1 }
  ]);
  assert.deepEqual(list.map((e) => e.id), ["c", "b"]);
  assert.equal(Q.myPlaceLine(list[1], "Initiate"), "You’re 2nd in line for Initiate.");
  assert.equal(Q.proposalLine("Initiate", "Clover"), "A place is free in Initiate. Clover is next in line.");
  assert.deepEqual(Q.moved(["a", "b", "c"], "c", -1), ["a", "c", "b"]);
  assert.deepEqual(Q.proposals(list).map((e) => e.id), ["c"]);
});

test("the phone notes read as in the app", () => {
  assert.equal(N.queuedNote({ source: "program", rankName: "Initiate", covenName: "Moon Circle", covenSlug: "moon-circle", place: 2 }).body, "Your training is complete. Initiate is full, so you’re #2 on its waiting list.");
  assert.equal(N.proposedNote({ rankName: "Initiate", who: "Rowan", covenName: "Moon Circle", covenSlug: "moon-circle" }).body, "A place is free in Initiate. Rowan is next in line.");
  assert.equal(N.promotedNote({ rankName: "Initiate", covenName: "Moon Circle", covenSlug: "moon-circle" }).body, "You’re now Initiate in Moon Circle.");
});

test("the website makes the app's calls, and rings what a change made due", async () => {
  const db = fakeDb({
    "rpc:coven_queue_fresh_notes": { data: [{ queue_id: "q1", event: "proposed" }], error: null },
    "rpc:queue_coven_advancement": { data: { request: { id: "r1", coven_id: "c1" }, queue: { id: "q2" }, place: 1 }, error: null }
  });
  const D = loadCovenData(db);
  await D.leave("c1");
  await settle();
  assert.deepEqual(db.calls.find((c) => c.rpc === "coven_queue_fresh_notes").args, { p_coven: "c1" });
  assert.deepEqual(db.calls.filter((c) => c.invoke).map((c) => c.options.body), [{ queue_id: "q1", event: "proposed" }], "leaving rings the proposal for the next in line");

  await D.queueAdvancement("r1", "Welcome.", ["custom-1"]);
  assert.deepEqual(db.calls.find((c) => c.rpc === "queue_coven_advancement").args, { p_request: "r1", p_note: "Welcome.", p_checked: ["custom-1"] });
  await D.fillPosition("c1", "rank", "u1", "  ", true);
  assert.deepEqual(db.calls.find((c) => c.rpc === "fill_coven_position").args, { p_rank: "rank", p_user: "u1", p_note: null, p_pass_over: true });
  await D.reorderQueue("rank", ["b", "a"], "");
  assert.deepEqual(db.calls.find((c) => c.rpc === "reorder_coven_position_queue").args, { p_rank: "rank", p_order: ["b", "a"], p_reason: null });
  await D.removeFromQueue("c1", "q1", " Stepped back ");
  assert.equal(db.calls.find((c) => c.rpc === "remove_from_coven_position_queue").args.p_reason, "Stepped back");
  await D.attempts("c1");
  assert.deepEqual(db.calls.find((c) => c.rpc === "coven_quiz_attempts_seen").args, { p_coven: "c1" }, "attempts as this person may see them");

  const api = read("app/src/lib/covens/api.ts");
  const site = read("covens/coven-data.js");
  for (const name of [
    "coven_queue_fresh_notes", "coven_position_queues", "coven_position_queue_list", "coven_my_queue", "fill_coven_position", "hold_coven_queue_proposal",
    "add_to_coven_position_queue", "remove_from_coven_position_queue", "reorder_coven_position_queue", "withdraw_from_coven_position_queue",
    "queue_coven_advancement", "coven_quiz_attempts_seen"
  ]) {
    assert.match(api, new RegExp(`'${name}'`), `app calls ${name}`);
    assert.match(site, new RegExp(`"${name}"`), `website calls ${name}`);
  }
});

test("the pages carry the waiting lists: My standing, Manage → Positions, Review", () => {
  assert.match(read("covens/coven/index.html"), /<script src="\/covens\/coven\/queue\.js"><\/script>/);
  assert.match(read("covens/coven/coven.js"), /CovenQueue\.myPlaces\(/);
  const manage = read("covens/coven/manage.js");
  assert.match(manage, /CovenQueue\.leaderPanel\(/);
  assert.match(manage, /CovenQueue\.proposals\(/);
  assert.match(manage, /D\.queueAdvancement\(/);
  assert.match(read("covens/coven/positions.js"), /Approve: add to the waiting list/);
  const queue = read("covens/coven/queue.js");
  for (const words of ["Promote ", "Choose someone else", "Not now", "Leave the waiting list", "Move up", "Move down", "Take off the list", "Add someone to the list", "What happened"]) assert.ok(queue.includes(words), words);
});

test("a result without the key still says which questions were right", () => {
  const a = {
    questions: [{ id: "q1", type: "single", prompt: "?", options: ["a", "b"], points: 1 }],
    answers: { q1: [0] },
    manual_scores: {},
    status: "failed",
    marks: { q1: false }
  };
  assert.equal(K.hasKey(a), false);
  assert.equal(K.attemptLines(a)[0].right, false);
  assert.match(K.keyLine(a, true), /once you’ve passed this test/);
  assert.match(read("covens/coven/course.js"), /Q\.keyLine\(a, Boolean\(self\)\)/);
});

test("the migration keeps the key and the lists on the server", () => {
  const sql = read("supabase/migrations/20261111000100_coven_test_keys_and_waiting_lists.sql");
  assert.match(sql, /create policy "Attempts with their key are seen by those scoring them"[\s\S]*?user_id <> auth\.uid\(\)/, "no trainee reads their own raw attempts");
  assert.match(sql, /drop policy if exists "Attempts are seen by the person, their mentor and program managers"/);
  assert.match(sql, /return public\.coven_quiz_attempt_shown\(saved\);[\s\S]*return public\.coven_quiz_attempt_shown\(saved\);/, "submitting and scoring hand back the attempt as the caller may see it");
  assert.match(sql, /revoke insert, update, delete on public\.coven_position_queue, public\.coven_position_queue_events from anon, authenticated;/);
  assert.match(sql, /create unique index if not exists coven_position_queue_one_proposed on public\.coven_position_queue \(rank_id\) where status = 'proposed';/);
  assert.match(sql, /create trigger coven_members_queue after update of status, rank_id or delete on public\.coven_members/);
  assert.match(sql, /create trigger coven_ranks_queue after update of seat_limit on public\.coven_ranks/);
  assert.ok(!/create table (?!if not exists)/.test(sql) && !/create index (?!if not exists)/.test(sql), "safe to run again");
});
