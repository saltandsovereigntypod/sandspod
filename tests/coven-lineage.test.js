// Daughter covens on the website, level with the app: the same rules
// (SaltCore.covens.lineage from app/src/lib/covens/lineage.ts), the same calls
// (covens/lineage-data.js, as app/src/lib/covens/lineageApi.ts), and the
// pages that carry them: the Daughter covens tab, the disclosure on About,
// Join and invitations, the hand-on choice in Members, Manage → Leadership,
// "The head can't be reached" and the moderators' Heads gone.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/core/covens.js"));
const X = global.SaltCore.covens.lineage;

test("the shared rules are the app's", () => {
  assert.equal(
    X.disclosureText({ coven: "Willow Hollow", mother: "Moon Circle", head: { id: "a", name: "Hazel", title: "High Priestess" } }),
    "Willow Hollow is a daughter coven of Moon Circle. Moon Circle’s High Priestess, Hazel, has final say over this coven."
  );
  const p = X.withAncestor({ member: false, founder: false, manage: false, review: false, level: 0 }, true);
  assert.ok(p.ancestor && p.member && p.founder && p.manage && p.review);
  assert.equal(p.level, 1001);
  assert.equal(X.handOnDefault([{ id: "e", name: "Elder", level: 4 }, { id: "h", name: "High Priestess", level: 5, can_manage: true }], { id: "h", name: "High Priestess", level: 5, can_manage: true }).rank.id, "e");
  assert.deepEqual(X.COPY_CHOICES.map((c) => c.key), ["documents", "positions", "programs", "book", "rituals", "calendar"]);
});

test("the website makes the app's calls", async () => {
  const calls = [];
  global.db = {
    rpc: (name, args) => {
      calls.push([name, args]);
      return Promise.resolve({ data: name === "request_daughter_coven" ? { id: "r", status: "pending" } : null, error: null });
    },
    functions: { invoke: (fn, opts) => (calls.push([fn, opts.body]), Promise.resolve({})) }
  };
  vm.runInThisContext(read("covens/lineage-data.js"));
  const LD = global.CovenLineageData;
  await LD.requestDaughter("m", { name: "Willow Hollow", slug: "willow-hollow" }, { documents: true }, "visiting", " Ready ");
  assert.deepEqual(calls[0], ["request_daughter_coven", { p_mother: "m", p_draft: { name: "Willow Hollow", slug: "willow-hollow" }, p_copy: { documents: true }, p_membership: "visiting", p_note: "Ready" }]);
  assert.deepEqual(calls[1], ["coven-notify", { lineage_coven_id: "m" }]);
  await LD.handOn("c", "u", "step_down", "rank-1");
  assert.deepEqual(calls[2], ["hand_on_coven", { p_coven: "c", p_user: "u", p_old: "step_down", p_old_rank: "rank-1" }]);
  assert.deepEqual(calls.slice(3).map((c) => c[1]), [{ leadership_coven_id: "c" }, { lineage_coven_id: "c" }]);
  const app = read("app/src/lib/covens/lineageApi.ts");
  for (const fn of ["request_daughter_coven", "decide_daughter_request", "withdraw_daughter_request", "coven_lineage", "coven_disclosure", "set_coven_shared_with_daughters", "coven_mother_library", "copy_from_mother_coven", "coven_push_preview", "push_to_daughter_coven", "release_daughter_coven", "ask_to_release_daughter_coven", "decide_release_request", "hand_on_coven", "set_coven_successors", "report_coven_head_unreachable", "coven_head_reports_queue", "resolve_coven_head_report", "set_coven_daughter_founder"]) {
    assert.ok(app.includes(`'${fn}'`), `app calls ${fn}`);
    assert.ok(read("covens/lineage-data.js").includes(`"${fn}"`), `website calls ${fn}`);
  }
});

test("the pages carry daughter covens and the leadership fixes", () => {
  const page = read("covens/coven/index.html");
  assert.match(page, /<script src="\/covens\/lineage-data\.js"><\/script>\s*<script src="\/covens\/coven\/lineage\.js"><\/script>/);
  const coven = read("covens/coven/coven.js");
  assert.match(coven, /key: "lineage", label: "Daughter covens"/);
  assert.match(coven, /Lx\.withAncestor\(state\.perms, state\.ancestor\)/);
  assert.match(coven, /disclosureHtml\(state\.disclosure\?\.text/);
  assert.match(coven, /To leave, hand on leadership first/);
  const manage = read("covens/coven/manage.js");
  assert.match(manage, /LU\.handOnFields\(state, m\)/);
  assert.match(manage, /leadershipPanel/);
  assert.match(read("covens/join/join.js"), /mountDisclosure/);
  assert.match(read("covens/moderation/moderation.js"), /\["heads", "Heads gone"\]/);
  assert.match(read("covens/coven/book.js"), /bookAttribution\(p\.metadata\)/);
  // The help no longer sends people to Manage for Members.
  assert.doesNotMatch(read("app/src/lib/help/topics.ts"), /Manage", then "Members"|Manage → "Members’ record"/);
});
