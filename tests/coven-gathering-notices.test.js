// Coven gathering notes on the website, level with the app: who hears (the
// coven's rules and a gathering's own choice), the words, what changed since
// the last note, sending one by hand, each member's "Coven gatherings"
// choice, and the calls that ring phones after a gathering is saved.
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
vm.runInThisContext(read("js/traditional-library.js"));
vm.runInThisContext(read("js/core/guides.js"));
const N = global.SaltCore.covens.notices;
const G = global.SaltCore.covens.gatheringNotes;
const B = global.SaltCore.covens.builder;
const P = global.SaltCore.guides.reminderPrefs;
const L = global.CovenLogic;

const NOW = new Date("2026-10-27T12:00:00Z");

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
        return Promise.resolve(answers[`invoke:${name}`] ?? { data: null, error: null });
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

test("the closest rule decides, after a gathering's own choice", () => {
  const rules = [
    { scope: "rite", who: ["rank:elder"] },
    { scope: "name:deipnon", who: ["user:rowan"] }
  ];
  assert.deepEqual(N.effectiveNotice({ kind: "rite", occasion: "new_moon", occasion_name: "Deipnon" }, rules), { who: ["user:rowan"], source: "name:deipnon" });
  assert.deepEqual(N.effectiveNotice({ kind: "rite", occasion: "esbat" }, rules), { who: ["rank:elder"], source: "rite" });
  assert.deepEqual(N.effectiveNotice({ kind: "meeting", plan: {} }, rules), { who: null, source: "default" });
  assert.deepEqual(N.effectiveNotice({ kind: "rite", plan: { notify: ["parts"] } }, rules), { who: ["parts"], source: "gathering" });
  assert.deepEqual(N.noticeScopes({ kind: "meeting", plan: { meeting: { series: "Officials" } } }), ["series:officials", "meeting"]);
  const words = { ranks: [{ id: "elder", name: "Elder" }], nameOf: () => "Rowan" };
  assert.equal(N.noticeLine({ kind: "rite", occasion: "esbat" }, rules, words), "Every Elder · from the coven’s rule for rites");
});

test("the plan keeps who hears, as the app's does", () => {
  const plan = B.cleanPlan({ roles: [{ id: "lead", name: "Lead", cast: [] }], notify: ["role:lead", "role:gone", "coven"] });
  assert.deepEqual(plan.notify, ["coven"]);
  assert.deepEqual(B.cleanPlan({ roles: [{ id: "lead", name: "Lead", cast: [] }], notify: ["role:lead", "none"] }).notify, ["role:lead"]);
});

test("what changed, and the notes' words", () => {
  const at = "2026-10-30T19:00:00Z";
  assert.equal(G.gatheringEvent({ status: "scheduled", scheduled_for: at }, [], NOW).event, "scheduled");
  assert.equal(G.gatheringEvent({ status: "scheduled", scheduled_for: "2026-10-31T19:00:00Z" }, [{ seq: 1, event: "scheduled", scheduled_for: at, recipients: ["a"] }], NOW).event, "moved");
  assert.equal(G.gatheringEvent(null, [{ seq: 1, event: "scheduled", scheduled_for: at, recipients: ["a"] }], NOW).event, "cancelled");
  assert.equal(G.gatheringEvent({ status: "draft", scheduled_for: at }, [], NOW), null);
  assert.equal(G.manualEvent({ status: "scheduled", scheduled_for: at }, [], NOW).event, "scheduled");
  assert.equal(G.manualEvent({ status: "scheduled", scheduled_for: at }, [{ seq: 1, event: "scheduled", scheduled_for: at }], NOW).event, "reminder");
  const base = { kind: "rite", title: "Deipnon", covenName: "Salt & Sovereignty", covenSlug: "salt", ritualId: "r1", scheduledFor: at, zones: { planner: "Europe/London" }, now: NOW };
  assert.equal(G.gatheringNote({ ...base, event: "scheduled" }).body, "Deipnon is on Salt & Sovereignty’s calendar for Friday 30 October. Tap to RSVP.");
  assert.equal(G.gatheringNote({ ...base, event: "reminder", note: "Bring a candle." }).body, "Reminder: Deipnon with Salt & Sovereignty is Friday 30 October. Tap to see it.\nBring a candle.");
  assert.equal(G.gatheringNote({ ...base, kind: "meeting", title: "Officials’ meeting", event: "moved" }).body, "Officials’ meeting has moved to Friday 30 October. Tap to see the details.");
  assert.equal(G.cleanNote("<script>hi</script>\u0000"), "scripthi/script");
});

test("the Coven gatherings choice, read by the edge function the same way", () => {
  const prefs = P.normalizePrefs({});
  assert.equal(P.gatheringsOn(prefs, "c1"), true);
  const off = P.setGatheringsFor(prefs, "c1", false);
  assert.equal(P.gatheringsOn(off, "c1"), false);
  assert.equal(G.wantsGathering(P.prefsValue(off), "c1", NOW), false);
  assert.equal(G.wantsGathering(P.prefsValue(off), "c2", NOW), true);
  // The Reminders page shows it.
  const page = read("reminders/reminders.js");
  assert.match(page, /gatheringsHtml\(\)/);
  assert.match(page, /setGatheringsFor/);
});

test("the notices power is a position's power on the website too", () => {
  assert.ok(L.RANK_POWERS.some((p) => p.key === "can_set_gathering_notices"));
  const coven = { id: "c", status: "active", founder_id: "head" };
  const ranks = [{ id: "r1", level: 3, can_set_gathering_notices: true }, { id: "r2", level: 5, can_schedule_rites: true }];
  const perms = (user, rank) => L.permissions({ coven, membership: { user_id: user, rank_id: rank, status: "active" }, ranks, userId: user });
  assert.equal(perms("head", null).notices, true);
  assert.equal(perms("a", "r1").notices, true);
  assert.equal(perms("b", "r2").notices, false);
  assert.equal(N.maySendNotice({ status: "scheduled", scheduled_for: "2026-10-30T19:00:00Z", created_by: "b" }, perms("b", "r2"), "b", NOW.getTime()), true, "whoever planned it");
});

test("saving or changing a gathering tells coven-notify, as the app does", async () => {
  const db = fakeDb({
    "rpc:save_coven_ritual": { data: { id: "rit1" }, error: null },
    "rpc:set_coven_ritual_status": { data: { id: "rit1" }, error: null }
  });
  const D = loadCovenData(db);
  await D.saveRitual("c1", null, { title: "Deipnon" }, []);
  await D.setRitualStatus("rit1", "deleted");
  const bodies = db.calls.filter((c) => c.invoke).map((c) => c.options.body.ritual_id);
  assert.deepEqual(bodies, ["rit1", "rit1"]);
  const api = read("app/src/lib/covens/api.ts");
  assert.match(api, /notifyGathering\(saved\?\.id\)/);
  assert.match(api, /notifyGathering\(ritualId\)/);
});

test("a failed save rings no one", async () => {
  const db = fakeDb({ "rpc:save_coven_ritual": { data: null, error: { message: "No." } } });
  const D = loadCovenData(db);
  await assert.rejects(D.saveRitual("c1", null, {}, []));
  assert.equal(db.calls.filter((c) => c.invoke).length, 0);
});

test("sending one by hand: the note, a one-off who, and a refusal read back", async () => {
  const db = fakeDb({ "invoke:coven-notify": { data: null, error: { context: { json: async () => ({ error: "too_soon" }) } } } });
  const D = loadCovenData(db);
  const result = await D.sendNotice("rit1", "Bring a candle.", ["rank:elder"]);
  assert.deepEqual(result, { error: "too_soon" });
  const body = db.calls.find((c) => c.invoke).options.body;
  assert.equal(body.manual, true);
  assert.equal(body.note, "Bring a candle.");
  assert.deepEqual(body.who, ["rank:elder"]);
  assert.match(N.sentLine(result), /half hour/);
  await D.previewNotice("rit1", []);
  assert.deepEqual(db.calls.find((c) => c.rpc === "coven_gathering_notice_preview").args, { p_ritual: "rit1", p_who: null });
});
