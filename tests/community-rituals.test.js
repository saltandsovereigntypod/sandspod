const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const L = require("../rituals/js/rituals-logic.js");

// Community Rituals' logic as rituals/community/ loads it (js/core/community-rituals.js),
// with js/core/rituals.js for saving templates the app's way.
const sandbox = { window: {}, TextEncoder, Intl, crypto: globalThis.crypto };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/traditional-library.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/core/rituals.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/core/community-rituals.js"), "utf8"), sandbox);
const C = sandbox.SaltCore["community-rituals"];
const R = sandbox.SaltCore.rituals;
const plain = (value) => JSON.parse(JSON.stringify(value));

const row = {
  id: "r1",
  sharer_id: null,
  coven_id: "cv",
  share_as: "coven",
  display_name: "Moon Circle",
  title: "Samhain supper",
  kind: "seasonal",
  summary: "A dumb supper for the beloved dead.",
  tradition: "Wicca",
  deities: ["Hekate"],
  occasion: "Samhain",
  moon_phase: null,
  duration_minutes: 45,
  difficulty: "beginner",
  materials: ["A black candle", "Apples"],
  preparation: "Lay a place for the dead.",
  steps: [
    { title: "Open", instructions: "Light the candle.", spoken_text: "", minutes: 2 },
    { title: "Eat in silence", instructions: "", spoken_text: "", minutes: null }
  ],
  closing: "Leave the plate out overnight.",
  notes: null,
  safety_notes: "Never leave a candle burning unattended.",
  cultural_note: null,
  tags: [],
  version: 1,
  save_count: 4,
  published_at: "2026-10-20T00:00:00Z",
  created_at: null,
  updated_at: null
};

test("the page's bundle searches and credits shared rituals as the app does", () => {
  assert.deepEqual(plain(C.filterCommunity([row], { query: "moon circle hekate" }).map((r) => r.id)), ["r1"]);
  assert.deepEqual(plain(C.filterCommunity([row], { query: "", kind: "spell" })), []);
  assert.equal(C.creditLine(row), "From Moon Circle in Community Rituals");
  assert.equal(C.sharerKey(row), "coven:cv");
  assert.equal(typeof C.closedMentions, "function");
});

test("Add to my rituals: the copy saves with the app's template payload, credited", () => {
  const draft = C.draftFromCommunity(row);
  const { template, steps } = R.rows.templatePayload({ ...draft, id: null }, { userId: "me", id: "t1", stepIds: ["a", "b"] });
  assert.equal(template.metadata.from.credit, "From Moon Circle in Community Rituals");
  assert.equal(steps.length, 2);
  assert.match(template.preparation, /^Gather: A black candle, Apples\./);
});

test("Do it once: the altar's hand-off carries the shared ritual, so the end can offer to keep it", () => {
  const draft = C.draftFromCommunity(row);
  const handoff = L.beginHandoff({ kind: "draft", draft }, { now: 5, community: { id: row.id, credit: C.creditLine(row) } });
  assert.deepEqual(handoff.community, { id: "r1", credit: "From Moon Circle in Community Rituals" });
  assert.equal(handoff.template.ritual_template_steps.length, 2);
  // Other hand-offs are unchanged.
  assert.equal("community" in L.beginHandoff({ kind: "draft", draft }, { now: 5 }), false);
});

test("the website's Community Rituals page loads its scripts in order", () => {
  const html = fs.readFileSync(path.join(__dirname, "../rituals/community/index.html"), "utf8");
  const order = ["/js/traditional-library.js", "/js/core/rituals.js", "/js/core/community-rituals.js", "/rituals/js/rituals-store.js", "/rituals/js/rituals-ui.js", "/rituals/js/community.js"];
  const at = order.map((src) => html.indexOf(`src="${src}"`));
  assert.ok(at.every((i) => i > 0));
  assert.deepEqual([...at].sort((a, b) => a - b), at);
});
