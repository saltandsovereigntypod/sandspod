// Open positions on the website, level with the app: the same logic
// (SaltCore.covens.positions), the same calls (open, close, places, what it
// asks, applying with answers, deciding with ticks), a new opening ringing
// phones once through coven-notify, the same synced choice on Reminders, and
// the pages carrying the same tools.
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
const S = global.SaltCore.covens.positions;
const N = global.SaltCore.covens.positionNotes;
const P = global.SaltCore.guides.reminderPrefs;

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

const NOW = Date.parse("2026-10-28T12:00:00Z");

test("places, the status chip and taking applications read as in the app", () => {
  const rank = { id: "r", name: "Initiate", level: 3, applications_open: true, seat_limit: 3 };
  assert.equal(S.positionStatus(rank, 1, NOW).label, "Open · 2 of 3 places");
  assert.equal(S.positionStatus(rank, 3, NOW).label, "Full");
  assert.equal(S.positionStatus({ ...rank, applications_open: false }, 0, NOW).label, "Closed");
  assert.equal(S.placesLine(rank, 4), "4 hold it · over the limit of 3");
  assert.ok(S.takingApplications({ id: "r", name: "x", level: 2, open_to_applications: true }, 0, NOW), "the old checkbox still counts");
  assert.ok(!S.takingApplications({ ...rank, applications_close_at: "2026-10-01T00:00:00Z" }, 0, NOW), "past its date");
  // The website's own list of positions to apply for leaves out closed-by-date ones and the first position, as the app's.
  const options = global.CovenLogic.advancementOptions(
    [
      { id: "s", level: 1, is_default: true, applications_open: true },
      { id: "i", level: 3, applications_open: true },
      { id: "e", level: 4, applications_open: true, applications_close_at: "2026-10-01T00:00:00Z" }
    ],
    { level: 2 },
    NOW
  );
  assert.deepEqual(options.map((r) => r.id), ["i"]);
});

test("requirements are cleaned and worded as in the app", () => {
  const ranks = [
    { id: "11111111-1111-4111-8111-111111111111", name: "Dedicant", level: 2 },
    { id: "33333333-3333-4333-8333-333333333333", name: "Initiate", level: 3 }
  ];
  const ctx = { rank: ranks[1], ranks, programs: [], documents: [] };
  const out = S.cleanRequirements([{ kind: "min_days_in_position", rank_id: ranks[0].id, days: 366 }, { kind: "custom", text: " Led a rite " }], ctx);
  assert.equal(out.error, null);
  assert.equal(S.requirementLabel(out.items[0], ctx), "Dedicant for a year and a day");
  assert.equal(S.cleanRequirements([{ kind: "program_completed", program_id: "x" }], ctx).error, "Choose one of the coven’s programs for that requirement.");
  const checks = S.readChecks([{ id: "a", kind: "min_rites_attended", status: "unmet", label: "Has come to 30 rites", line: "21 of 30 rites attended" }]);
  assert.equal(S.readyToApply(checks), false);
  assert.equal(S.statusMark("unmet"), "✗");
});

test("opening a position rings phones once, through coven-notify, only for a new opening with someone to tell", async () => {
  const db = fakeDb({ "rpc:open_coven_position": { data: { rank: {}, opening_id: "o1", notify: true, closed_full: false }, error: null } });
  const D = loadCovenData(db);
  await D.openPosition("r1", 2, " Two wanted ", "2026-11-30T23:59:00Z", "eligible");
  assert.deepEqual(db.calls[0], { rpc: "open_coven_position", args: { p_rank: "r1", p_seat_limit: 2, p_note: "Two wanted", p_close_at: "2026-11-30T23:59:00Z", p_notify: "eligible" } });
  const invoke = db.calls.find((c) => c.invoke);
  assert.equal(invoke.invoke, "coven-notify");
  assert.equal(invoke.options.body.rank_id, "r1");
  assert.equal(invoke.options.body.event, "opened");

  const quiet = fakeDb({ "rpc:open_coven_position": { data: { rank: {}, opening_id: null, notify: false }, error: null } });
  await loadCovenData(quiet).openPosition("r1", null, "", null, "none");
  assert.ok(!quiet.calls.some((c) => c.invoke), "changing an open one, or telling no one, rings nothing");
});

test("applying sends answers, deciding sends ticks, and the leaders' calls are the app's", async () => {
  const db = fakeDb({
    "rpc:request_coven_advancement": { data: { id: "a1" }, error: null },
    "rpc:decide_coven_advancement": { data: { id: "a1" }, error: null }
  });
  const D = loadCovenData(db);
  await D.requestAdvancement("c1", "r1", "Ready", { why: "Because" });
  assert.deepEqual(db.calls[0].args, { p_coven: "c1", p_rank: "r1", p_statement: "Ready", p_answers: { why: "Because" } });
  await D.requestAdvancement("c1", "r1", "Ready", {});
  assert.ok(!("p_answers" in db.calls.filter((c) => c.rpc)[1].args), "no answers, no p_answers (works before the migration)");
  await D.decideAdvancement("a1", true, "", ["mentor", "req-3"]);
  assert.deepEqual(db.calls.filter((c) => c.rpc === "decide_coven_advancement")[0].args, { p_request: "a1", p_approve: true, p_note: null, p_checked: ["mentor", "req-3"] });
  await D.closePosition("r1");
  await D.setPositionPlaces("r1", null);
  await D.saveRankRequirements("r1", [], []);
  assert.deepEqual(
    db.calls.filter((c) => c.rpc).slice(-3).map((c) => c.rpc),
    ["close_coven_position", "set_coven_position_places", "save_coven_rank_requirements"]
  );
  // Before the migration, the overview is null and the page keeps its older form.
  const missing = fakeDb({ "rpc:coven_positions_overview": { data: null, error: { message: "function not found" } } });
  assert.equal(await loadCovenData(missing).positionsOverview("c1"), null);
});

test("the phone note and the synced choice match the app's", () => {
  const note = N.openedNote({ rankName: "Initiate", covenName: "Moon Circle", covenSlug: "moon-circle", placesLeft: 1, now: new Date(NOW) });
  assert.deepEqual(note, { title: "Initiate is open in Moon Circle", body: "1 place", url: "/coven/c/moon-circle/path" });
  assert.deepEqual(P.DEFAULT_PREFS.positions, { on: true, off: [] });
  const prefs = P.setPositionsFor(P.normalizePrefs({}), "c1", false, ["c1"]);
  assert.equal(N.wantsPosition(JSON.stringify(prefs), "c1"), false);
  assert.equal(N.wantsPosition(JSON.stringify(prefs), "c2"), true);
});

test("the pages carry the same tools", () => {
  const html = read("covens/coven/index.html");
  assert.ok(html.indexOf("/covens/coven/positions.js") > html.indexOf("/js/core/covens.js"), "positions.js after the core");
  assert.ok(html.indexOf("/covens/coven/positions.js") < html.indexOf("/covens/coven/manage.js"), "and before Manage");
  const manage = read("covens/coven/manage.js");
  assert.ok(!manage.includes('check("open_to_applications"'), "opening is its own section, not the old checkbox");
  assert.match(manage, /CovenPositions\.leaderPanel/);
  assert.match(manage, /CovenPositions\.reviewPanel/);
  const coven = read("covens/coven/coven.js");
  assert.match(coven, /CovenPositions\?\.card/);
  assert.match(read("reminders/reminders.js"), /data-pos-coven/);
  const fn = read("supabase/functions/coven-notify/index.ts");
  assert.match(fn, /payload\.rank_id && payload\.event === "opened"/);
  assert.match(fn, /coven_position_opening_recipients/);
  assert.match(fn, /\.is\("notified_at", null\)/, "claimed once");
  const guidelines = read("covens/guidelines/index.html");
  assert.match(guidelines, /Positions and advancement/);
});
