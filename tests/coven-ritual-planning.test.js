// Coven ritual planning on the website, level with the app: the one search
// picker (WHO and ITEMS) from the app's own logic (js/core), the step actions,
// what steps ask of people and who may read it, the planner saving the app's
// shapes, the database calls, and the cabinet searching every drawer.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
const L = require("../covens/coven-logic.js");
vm.runInThisContext(read("js/core/covens.js"));
vm.runInThisContext(read("js/core/altar.js"));
const { picker: P, stepActions: A, contributions: C } = global.SaltCore.covens;
const I = global.SaltCore.altar.itemIndex;

test("the shared picker finds positions, people and the whole coven, and only suggests when empty", () => {
  const entries = P.whoEntries([{ id: "r1", name: "Initiate", level: 1 }, { id: "r2", name: "High Priestess", level: 9 }], [{ id: "u1", name: "Rowan", eligible: true }]);
  assert.equal(P.searchEntries(entries, "priestess")[0].key, "rank:r2");
  assert.equal(P.searchEntries(entries, "row")[0].key, "user:u1");
  assert.deepEqual(P.searchEntries(entries, ""), []);
  assert.equal(P.assigneesLabel([{ kind: "rank", id: "r1" }, { kind: "user", id: "u1" }], [{ id: "r1", name: "Initiate" }], () => "Rowan"), "Every Initiate and Rowan");
});

test("ITEMS searches everything the altar knows, with pictures", () => {
  const index = I.itemIndex();
  const red = I.searchItems(index, "red taper")[0];
  assert.match(red.label, /Red Taper/);
  assert.ok(red.image.startsWith("/assets/altar/"));
  assert.ok(I.searchItems(index, "hekate", { categories: ["deities"] }).length > 0);
  assert.deepEqual(I.stepCandle([I.stepItemOf(red)]), { color: "red", form: "taper" });
});

test("about fifty actions; the website's logic reads steps for several people as the app does", () => {
  assert.ok(A.STEP_ACTIONS.length >= 48);
  assert.equal(A.applyAction(A.actionOf("write_gratitude")).contribution.visibility, "me");
  const membership = { status: "active", rank_id: "r1" };
  const step = { assignees: [{ kind: "rank", id: "r1" }, { kind: "user", id: "u9" }] };
  assert.equal(L.stepIsMine(step, membership, "me"), true);
  assert.equal(L.stepIsMine(step, { status: "active", rank_id: "r2" }, "u9"), true);
  assert.equal(L.stepIsMine(step, { status: "active", rank_id: "r2" }, "me"), false);
  assert.equal(L.stepAssignee(step, [{ id: "r1", name: "Initiate" }], () => "Rowan").label, "Every Initiate and Rowan");
  assert.match(L.unassignablePart({ assignees: [{ kind: "user", id: "u9" }] }, [{ id: "u9", eligible: false }], () => "Sage"), /Sage hasn’t signed/);
  assert.equal(L.stepIsMine({ assigned_rank_id: "r1" }, membership, "me"), true, "older steps still work");
  assert.equal(L.altarActionButton({ altar_action: "place_item", items: [{ name: "Bread" }, { name: "Honey" }] }), "Place Bread and Honey on the altar");
  assert.equal(L.altarActionButton({ altar_action: "release_papers" }), "Release the papers");
});

test("who may read what, as the database decides", () => {
  const reader = { userId: "u3", member: true, leads: true };
  assert.equal(C.canRead({ user_id: "u1", private: true, anonymous: false, visibility: "coven" }, reader), false, "sealed to the leaders too");
  assert.equal(C.isListed({ user_id: "u1", private: false, anonymous: false, visibility: "me" }, reader), false);
  assert.equal(C.contributionLabel({ kind: "petition", private: true, mine: false, user_id: null }, () => ""), "A private petition");
});

test("the planner, the ritual and the coven page use the shared logic and the same calls as the app", () => {
  const html = read("covens/coven/index.html");
  assert.ok(html.indexOf("/covens/coven/picker.js") < html.indexOf("/covens/coven/rituals.js"), "the picker loads before the rituals tab");
  const rituals = read("covens/coven/rituals.js");
  for (const needle of ["CovenPicker.create", "applyAction", "assignees", "contribution: askOf(s)", "altar_tenders", "D.saveContribution", "D.offerContribution", "D.supportContribution", "D.tendContribution", "offerPaper", "seedPetitionAltar", "Before the rite"]) {
    assert.ok(rituals.includes(needle), needle);
  }
  const data = read("covens/coven-data.js");
  for (const rpc of ["coven_ritual_contributions_for", "save_coven_ritual_contribution", "offer_coven_ritual_contribution", "support_coven_ritual_contribution", "tend_coven_ritual_contribution", "coven_ritual_participation", "set_coven_participation_viewers", "coven_ritual_settings"]) {
    assert.ok(data.includes(rpc), rpc);
  }
  const app = read("app/src/lib/covens/api.ts");
  for (const rpc of ["coven_ritual_contributions_for", "save_coven_ritual_contribution", "offer_coven_ritual_contribution", "coven_ritual_participation", "set_coven_participation_viewers"]) {
    assert.ok(app.includes(rpc), `app: ${rpc}`);
  }
  assert.match(read("covens/coven/manage.js"), /Ritual participation/);
  assert.match(read("covens/coven/coven.js"), /tasksBanner/);
});

test("a petition a ritual made gets its altar set when anyone opens the petitions or tends it", () => {
  const P = global.SaltCore.altar.petitionAltar;
  assert.equal(typeof P.tendWithSeed, "function");
  assert.deepEqual(P.petitionsToSeed([{ id: "a", status: "open", altar_id: "x", source_ritual_id: "r" }, { id: "b", status: "open", altar_id: "y" }]).map((p) => p.id), ["a"]);
  const source = read("covens/coven/petitions.js");
  assert.match(source, /seedBare\(\)/);
  // With who tended it, so "Find mine" knows the candle is theirs.
  assert.match(source, /P\.tendWithSeed\(p, name, now, me\(\) \|\| ""\)/);
  assert.match(read("app/src/app/(tabs)/coven/c/[slug]/petitions.tsx"), /petitionsToSeed\(list\)/);
});

test("the cabinet's search looks in every drawer", () => {
  const source = read("altar/js/features/cabinet.js");
  assert.match(source, /A search looks in every drawer/);
  assert.match(source, /words\.every\(\(word\) => searchable\.includes\(word\)\)/);
  assert.match(read("altar/index.html"), /Search every drawer/);
});
