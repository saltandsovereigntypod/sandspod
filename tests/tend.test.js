// To tend on the website, level with the app: the app's own gathering,
// rhythms and endings (lib/tend, through js/core/tend.js), the same saved
// shapes (craft `tend.rhythms`, the altar's own changes) and database calls,
// the page and Today's card wired in, reminders joining the calendar file,
// and Find mine on a coven altar that never names an unnamed paper.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/traditional-library.js"));
vm.runInThisContext(read("js/core/tend.js"));
const T = global.SaltCore.tend;

const NOW = new Date(2026, 9, 27, 10);

test("the website gathers and orders the list as the app does", () => {
  const items = T.gather.gatherTendables({
    now: NOW,
    journal: [{ id: "j1", title: "Money jar", metadata: { lookBack: { date: "2026-10-25", when: "week" } } }],
    apothecary: [{ id: "ap1", name: "Sachet", metadata: { lookBack: { date: "2026-11-05", when: "full_moon" } } }]
  });
  const list = T.model.tendList(items, [], NOW);
  assert.deepEqual(list.today.map((i) => i.key), ["lookback:j1"]);
  assert.deepEqual(list.ongoing.map((i) => i.key), ["lookback:apothecary:ap1"]);
  assert.equal(T.model.todaySummary(list).line, "1 look-back wants tending today.");
  assert.equal(T.model.TEND_COLLECTION, "tend.rhythms");
  assert.deepEqual(T.model.filterList(items, "sachet").map((i) => i.key), ["lookback:apothecary:ap1"]);
});

test("rhythms and endings keep the app's shapes", () => {
  const item = { key: "petition:p1", kind: "petition", title: "For a new home", source: "Your altar · Hearth", href: "/altar/a" };
  const record = T.model.recordTended(T.model.newRecord(item), NOW, "Lit for it");
  assert.deepEqual(Object.keys(record).sort(), ["at", "ended", "href", "key", "kind", "remind", "rhythm", "source", "tendedAt", "times", "title", "words"]);
  assert.equal(record.times, 1);
  assert.equal(T.model.dueOf({ ...item, dueAt: null, tendedAt: null }, record, NOW).state, "later");
  const page = T.model.endingPage(item, record, "answered", "We found it.", NOW);
  assert.equal(page.sectionTitle, "How it went");
  const { ops } = T.holyOps.holyPageOps({ fetchedAt: "", books: [], sections: [], pages: [], blocks: [], links: [] }, { userId: "u", now: NOW.toISOString() }, page, (() => { let n = 0; return () => `id${n++}`; })());
  assert.deepEqual(ops.map((o) => o.table), ["grimoire_books", "grimoire_sections", "grimoire_pages", "grimoire_blocks", "grimoire_blocks", "grimoire_blocks", "grimoire_blocks", "grimoire_blocks"]);
  assert.equal(ops[2].row.metadata.holyRef, "tend:petition:p1");
});

function fakeDb(calls, tables = {}) {
  const query = (table) => {
    const q = {
      _table: table,
      select: () => q,
      eq: () => q,
      in: () => q,
      order: () => q,
      limit: () => q,
      update: (row) => (calls.push(["update", table, row]), q),
      insert: (row) => (calls.push(["insert", table, row]), Promise.resolve({ error: null })),
      maybeSingle: () => q,
      then: (resolve) => resolve({ data: tables[table] || [], error: null })
    };
    return q;
  };
  return { from: query, rpc: (name, args) => (calls.push(["rpc", name, args]), Promise.resolve({ data: {}, error: null })) };
}

function loadData() {
  delete global.TendData;
  vm.runInThisContext(read("today/tend/tend-data.js"));
  return global.TendData;
}

test("tending from the website calls the same database functions as the app", async () => {
  const calls = [];
  const saved = [];
  global.getCurrentSaltUser = () => ({ id: "me" });
  global.db = fakeDb(calls);
  global.SaltCraft = {
    list: async () => [],
    add: async (collection, data) => (saved.push(["add", collection, data]), { id: "x", data }),
    update: async (collection, id, data) => (saved.push(["update", collection, id, data]), { id, data })
  };
  const D = loadData();
  const state = { account: { id: "me" }, entries: [], altars: [], petitions: [], covens: { petitions: [], myName: "Sage" }, journal: [], apothecary: [], journeys: [] };
  const petition = { key: "coven-petition:p1", kind: "coven-petition", group: "coven", title: "For my sister", source: "Coven", href: "/coven/c/m/petitions", ref: { petitionId: "p1" } };
  await D.tend(state, petition, "tend", "Holding you");
  assert.deepEqual(calls[0], ["rpc", "tend_coven_petition", { p_petition: "p1", p_note: "Holding you" }]);
  assert.equal(saved[0][1], "tend.rhythms");
  assert.equal(saved[0][2].words[0].text, "Holding you");
  await D.end(state, petition, "answered", "She is well", false);
  assert.deepEqual(calls[1], ["rpc", "close_coven_petition", { p_petition: "p1", p_status: "answered", p_note: "She is well" }]);
  assert.equal(saved[1][2].ended.how, "answered");
  const held = { key: "contribution:k1", kind: "contribution", group: "coven", title: "x", source: "", href: "", ref: { contributionId: "k1" } };
  await D.end(state, held, "closed", "", false);
  assert.deepEqual(calls[2], ["rpc", "tend_coven_ritual_contribution", { p_contribution: "k1", p_status: "closed", p_note: null }]);
  await D.write(state, { ref: { stepId: "s1" } }, "My petition", true);
  assert.deepEqual(calls[3], ["rpc", "save_coven_ritual_contribution", { p_step: "s1", p_body: "My petition", p_items: [], p_private: true, p_anonymous: false }]);
  await D.checkin(state, { key: "checkin:c:w", kind: "checkin", title: "Check in with Wren", source: "", href: "", ref: { covenId: "c", userId: "w" } }, "");
  assert.equal(calls[4][1], "log_coven_mentor_checkin");
  assert.match(calls[4][2].p_met_on, /^\d{4}-\d{2}-\d{2}$/);
});

test("tending your own altar from the website saves the altar as the altar page does", async () => {
  const calls = [];
  global.getCurrentSaltUser = () => ({ id: "me" });
  global.db = fakeDb(calls);
  global.SaltCraft = { list: async () => [], add: async () => ({}), update: async () => ({}) };
  const D = loadData();
  const pot = { type: "plant", form: "basil", altarObjectId: "p1", label: "Basil", livingState: "" };
  const state = { account: { id: "me" }, entries: [], altars: [{ id: "a1", name: "Kitchen", objects: [pot] }], petitions: [] };
  await D.tend(state, { key: "plant:a1:p1", kind: "plant", group: "altar", title: "Basil", source: "", href: "", ref: { altarId: "a1", objectId: "p1" } }, "water", "");
  const update = calls.find((c) => c[0] === "update" && c[1] === "saved_altars");
  assert.ok(update, "saved to saved_altars");
  assert.equal(update[2].name, "Kitchen");
  assert.ok(Array.isArray(update[2].altar_data.objects));
});

test("the page and Today's card are wired in", () => {
  const page = read("today/tend/index.html");
  for (const src of ["/js/salt-store.js", "/js/core/tend.js", "/today/tend/tend-data.js", "/today/tend/tend.js"]) assert.ok(page.includes(`src="${src}"`), src);
  const today = read("today/index.html");
  assert.ok(today.includes('src="/today/tend/tend-data.js"') && today.includes('src="/today/tend-today.js"'));
  assert.ok(read("today/today.js").includes("data-tend-today"));
  assert.ok(fs.existsSync(path.join(root, "js/core/tend.js")));
});

test("reminders asked for on the list join the website's calendar file", () => {
  vm.runInThisContext(read("js/core/guides.js"));
  const G = global.SaltCore.guides;
  assert.ok(G.tendModel, "guides carries the list's model");
  const record = { ...G.tendModel.newRecord({ key: "petition:p1", kind: "petition", title: "For a new home", source: "Your altar · Hearth", href: "" }), remind: true };
  const list = G.reminderPlan.calendarReminders({ appSettings: {}, legacy: {}, tend: [record], now: NOW, horizonDays: 3 });
  assert.ok(list.some((r) => r.kind === "tend" && r.title === "For a new home"));
  assert.ok(read("reminders/reminders.js").includes("tend.rhythms") || read("reminders/reminders.js").includes("TEND_COLLECTION"));
  assert.ok(read("reminders/reminders-logic.js").includes("tend: tend || []"));
});

test("find mine on the website's coven altar never names an unnamed paper", () => {
  vm.runInThisContext(read("js/core/altar.js"));
  const A = global.SaltCore.altar;
  assert.ok(A.tendAltar && A.tendAltar.altarListing);
  let doc = { background: "", backgroundName: "", groups: [], activeGroupId: null, objects: [], extra: {} };
  doc = A.ritualAltar.offerPaper({ id: "theirs", fate: "burn" }, "A petition", 0, NOW.toISOString())(doc);
  doc = A.ritualAltar.offerPaper({ id: "mine", fate: "keep" }, "Your petition", 1, NOW.toISOString())(doc);
  const rows = A.tendAltar.altarListing(doc, { userId: "me", myName: "Sage", myContributions: ["mine"], petitions: {}, nameOf: () => "Rowan" });
  assert.equal(rows[0].mine, true);
  assert.equal(rows.find((r) => !r.mine).whose, "");
  const page = read("altar/js/features/coven-altar.js");
  assert.ok(page.includes("data-coven-altar-mine") && page.includes("altarListing"));
});
