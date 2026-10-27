// The coven ritual builder on the website, level with the app: the builder's
// rules from the app's own logic (js/core/covens.js), the templates, the
// script and record, and the pages calling the same database functions as
// the app (lib/covens/api.ts) with the same shapes.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/core/covens.js"));
const { builder: B, fields: F, templates: T, script: S, newId } = global.SaltCore.covens;

const nameOf = (id) => ({ u1: "Rowan", u2: "Ash" })[id] || "Someone";

test("the website has the app's builder, fields, templates and script", () => {
  for (const fn of ["cleanPlan", "builderStepFrom", "builderPayload", "ritualPayload", "builderProblem", "outline", "moveStep", "castRole", "stepSummary", "namedThings", "linkedEffect", "turnState", "holdUntil", "prepLine"]) assert.equal(typeof B[fn], "function", fn);
  for (const fn of ["cleanValues", "partsOf", "fieldSummary", "optionsFromLines"]) assert.equal(typeof F[fn], "function", fn);
  for (const fn of ["buildScript", "scriptText", "tallyVotes", "voteResult", "recordText", "covenRitePageOps", "findCovenRitePage", "mayVote"]) assert.equal(typeof S[fn], "function", fn);
  assert.equal(typeof newId(), "string");
  assert.ok(T.RITUAL_TEMPLATES.length >= 20);
});

test("a template becomes a plan and steps, saved in the shapes the app saves", () => {
  const d = T.draftFromTemplate(T.templateOf("hekate_deipnon"));
  const hps = d.plan.roles[0];
  const plan = B.castRole(d.plan, hps.id, [{ kind: "user", id: "u1" }]);
  assert.equal(B.builderProblem(d.title, plan, d.steps, [{ id: "u1", name: "Rowan", eligible: true }], nameOf), "");
  const payload = B.builderPayload(plan, d.steps);
  const candle = payload.find((s) => s.title === "Light Hekate’s candle");
  assert.deepEqual(candle.assignees, [{ kind: "user", id: "u1" }]);
  assert.deepEqual(candle.roles, [hps.id]);
  assert.equal(candle.section, "opening");
  assert.equal(candle.details.fields.candle, "Hekate’s candle");
  const ritual = B.ritualPayload({ title: d.title, intention: "", description: "", scheduled_for: null, status: "draft", occasion: d.occasion, occasion_name: d.occasionName }, d.kind, plan);
  assert.equal(ritual.kind, "rite");
  assert.equal(ritual.plan.afterwards.hold_hours, 24);
  // And read back as the app reads it.
  const saved = payload.map((s, i) => ({ ...s, id: `s${i}`, ritual_id: "r", coven_id: "c", position: i + 1, completed_at: null, completed_by: null }));
  const back = saved.map((s) => B.builderStepFrom(s, ritual.plan));
  assert.deepEqual(back.map((s) => s.section), payload.map((s) => s.section));
  assert.deepEqual(back[1].roles, [hps.id]);
});

test("a meeting votes and keeps minutes", () => {
  const d = T.draftFromTemplate(T.templateOf("business_meeting"));
  assert.equal(d.kind, "meeting");
  assert.deepEqual(d.plan.sections.map((s) => s.name), ["Opening", "Reports", "Business", "Any other business", "Closing"]);
  const vote = d.steps.find((s) => s.action === "vote");
  assert.deepEqual(S.voteOptions(vote.details.fields), ["For", "Against", "Abstain"]);
  assert.equal(S.voteResult(S.tallyVotes(["For", "Against", "Abstain"], [{ choice: "For" }, { choice: "Abstain" }])), "Carried: 1 for, 0 against, 1 abstaining.");
  const text = S.recordText({ ritual_id: "r", coven_id: "c", title: "Meeting", kind: "meeting", held_at: "2026-11-01T19:00:00Z", ended_at: "2026-11-01T20:00:00Z", led_by: "u1", attendees: ["u1"], steps: [], counts: {}, votes: [{ title: "Vote", motion: "Meet monthly", options: ["For", "Against", "Abstain"], counts: { For: 3 }, total: 3 }], notes: "Agreed.", plan: d.plan }, nameOf);
  assert.match(text, /MINUTES AND NOTES\nAgreed\./);
  assert.match(text, /Carried: 3 for, 0 against\./);
});

test("the pages call the same functions as the app, and the builder loads before the rituals tab", () => {
  const html = read("covens/coven/index.html");
  assert.ok(html.indexOf("/covens/coven/builder.js") > html.indexOf("/covens/coven/picker.js"));
  assert.ok(html.indexOf("/covens/coven/builder.js") < html.indexOf("/covens/coven/rituals.js"));
  const data = read("covens/coven-data.js");
  const app = read("app/src/lib/covens/api.ts");
  for (const rpc of ["save_coven_ritual_library", "remove_coven_ritual_library", "coven_ritual_prep", "tick_coven_ritual_prep", "coven_ritual_votes_for", "cast_coven_ritual_vote", "close_coven_ritual_vote", "next_coven_ritual_turn", "set_coven_ritual_turns", "release_coven_altar_hold", "set_coven_ritual_record_notes", "coven_ritual_records", "coven_ritual_library"]) {
    assert.ok(data.includes(rpc), `website: ${rpc}`);
    assert.ok(app.includes(rpc), `app: ${rpc}`);
  }
  const builder = read("covens/coven/builder.js");
  for (const needle of ["builderPayload", "ritualPayload", "draftFromTemplate", "stepsFromLibrary", "global.CovenPicker", "partsOf", 'btn("Save as a draft", "save"', "scriptHtml"]) assert.ok(builder.includes(needle), needle);
  const rituals = read("covens/coven/rituals.js");
  for (const needle of ["CovenBuilder.open", "covenRitePageOps", "D.tickPrep", "D.castVote", "D.nextTurn", "snuffNamed", "placeOffering", "D.setRecordNotes", "D.saveGathering"]) assert.ok(rituals.includes(needle), needle);
  assert.match(read("covens/coven/book.js"), /Ritual records/);
  assert.match(read("covens/covens.css"), /@media print/);
  // The migration the app and the website both rely on.
  const migration = read("supabase/migrations/20261103000000_coven_ritual_builder.sql");
  for (const fn of ["save_coven_ritual", "coven_ritual_move", "cast_coven_ritual_vote", "coven_ritual_write_record", "coven_altar_can_edit"]) assert.match(migration, new RegExp(`function public\\.${fn}\\(`));
});
