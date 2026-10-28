const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const L = require("../library/library-logic.js");

// The app's own logic and the website's own data, as the pages load them.
const sandbox = { window: {}, TextEncoder, Intl };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(`${fs.readFileSync(path.join(__dirname, "../js/traditional-library.js"), "utf8")}\nglobalThis.TraditionalLibrary = TraditionalLibrary;`, sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/core/library.js"), "utf8"), sandbox);
const core = sandbox.SaltCore.library;
const DATA = sandbox.TraditionalLibrary;
const plain = (value) => JSON.parse(JSON.stringify(value));
const entries = L.buildEntries(core, DATA, [], {});

test("the bundle carries the app's logic but not a second copy of the Library", () => {
  const source = fs.readFileSync(path.join(__dirname, "../js/core/library.js"), "utf8");
  assert.ok(source.length < 150000, `js/core/library.js is ${source.length} bytes`);
  assert.ok(!source.includes("Basil is a leafy green kitchen herb"));
  assert.ok(entries.length > 100);
});

test("links to an entry open its public Library page", () => {
  assert.equal(L.entryHref("traditional:herb:rosemary"), "/library/entry/?entity=traditional%2Fherb%2Frosemary");
  assert.equal(L.entryHref("traditional/deity/hekate"), "/library/entry/?entity=traditional%2Fdeity%2Fhekate");
  const rosemary = entries.find((e) => e.id === "traditional:herb:rosemary");
  assert.equal(L.entryHref(rosemary), "/library/entry/?entity=traditional%2Fherb%2Frosemary");
  // Candle styles share their parent's reference, so they go by their own id.
  const style = entries.find((e) => e.id.startsWith("traditional:candle:") && e.id.includes("."));
  if (style) assert.equal(L.entryHref(style), `/library/entry/?entity=${encodeURIComponent(style.id)}`);
  assert.equal(L.grimoireHref(rosemary), "/grimoire/?entity=traditional%2Fherb%2Frosemary");
});

test("an address finds its entry however it is spelt", () => {
  for (const ref of ["traditional/herb/rosemary", "traditional:herb:rosemary", " traditional/herb/rosemary "]) {
    assert.equal(L.findEntry(core, entries, ref)?.id, "traditional:herb:rosemary", ref);
  }
  assert.equal(L.findEntry(core, entries, "traditional/herb/not-a-herb"), null);
  assert.equal(L.findEntry(core, entries, ""), null);
});

test("a guest's own notes from this browser are laid over the Traditional entry", () => {
  const stored = {
    entities: {
      "abc-1": { id: "abc-1", name: "Rosemary", type: "herb", myPractice: { Notes: "From my garden" } },
      "abc-2": { id: "abc-2", name: "Moon Water", type: "apothecary", myPractice: { Notes: "Full moon only" } }
    },
    relations: [{ id: "r1", from: "abc-1", relation: "used_in", to: "abc-2", metadata: {} }]
  };
  const storage = { getItem: (key) => (key === L.GUEST_LIBRARY_KEY ? JSON.stringify(stored) : null) };
  return L.load({ core, user: null, db: null, traditionalData: DATA, storage, getSettings: () => ({}) }).then(({ entries: mine, relations }) => {
    const rosemary = L.findEntry(core, mine, "abc-1");
    assert.equal(rosemary.id, "traditional:herb:rosemary");
    assert.equal(rosemary.myPractice.Notes, "From my garden");
    const model = L.entryModel(core, rosemary, mine, relations, {});
    assert.equal(model.layers[0].layer, "myPractice");
    assert.equal(model.layers[0].fields[0].text, "From my garden");
    assert.deepEqual(plain(model.connections.find((g) => g.label === "Used In").entries), [{ label: "Moon Water", href: "/library/entry/?entity=practice%3Aabc-2" }]);
    assert.equal(model.grimoireHref, null);
    const index = L.indexModel(core, mine, {}, { filter: L.MINE });
    assert.ok(index.options.some((o) => o.value === L.MINE));
    assert.deepEqual(plain(index.results.map((r) => r.name).sort()), ["Moon Water", "Rosemary"]);
  });
});

test("signed in, notes and connections come from the person's own rows", async () => {
  const calls = [];
  const query = (table, data) => {
    const q = {
      select: () => q,
      eq: (col, value) => (calls.push([table, col, value]), q),
      order: () => q,
      then: (resolve) => resolve({ data, error: null })
    };
    return q;
  };
  const db = {
    from: (table) =>
      table === "living_library_entries"
        ? query(table, [{ entity_id: "u1", name: "Hekate", type: "deity", image: null, my_practice: { Notes: "My patron" }, community: null, updated_at: "2026-01-01" }])
        : query(table, [])
  };
  const result = await L.load({ core, user: { id: "me" }, db, traditionalData: DATA, storage: null, getSettings: async () => ({}) });
  assert.deepEqual(calls, [["living_library_entries", "user_id", "me"], ["library_relations", "user_id", "me"]]);
  const hekate = L.findEntry(core, result.entries, "traditional/deity/hekate");
  const model = L.entryModel(core, hekate, result.entries, result.relations, result.settings, { signedIn: true });
  assert.equal(model.deityKey, "hekate");
  assert.ok(model.hasMyPractice);
  assert.equal(model.grimoireHref, "/grimoire/?entity=traditional%2Fdeity%2Fhekate");
});

test("an entry's page follows the app: intro, quick facts, layers and chips that open other entries", () => {
  const basil = L.findEntry(core, entries, "traditional/herb/basil");
  const model = L.entryModel(core, basil, entries, [], {});
  assert.equal(model.name, "Basil");
  assert.match(model.intro, /^Traditionally associated with protection/);
  assert.deepEqual(plain(model.facts).map((f) => f.label), ["Element", "Planet"]);
  const traditional = model.layers.find((l) => l.layer === "traditional");
  assert.equal(traditional.label, "Traditional Information");
  assert.ok(!traditional.fields.some((f) => f.key === "Element"), "quick facts aren't repeated");
  const pairs = traditional.fields.find((f) => f.key === "PairsWith");
  assert.equal(pairs.label, "Pairs Well With");
  assert.equal(pairs.chips.find((c) => c.label === "Rosemary").href, "/library/entry/?entity=traditional%2Fherb%2Frosemary");
  assert.ok(model.connections.some((g) => g.label === "Pairs With"));
  assert.equal(model.sourcingQuery.traditionalReference, "traditional/herb/basil");
});

test("Living Library settings shape the page", () => {
  const basil = L.findEntry(core, entries, "traditional/herb/basil");
  const off = L.entryModel(core, basil, entries, [], { library_traditional_enabled: false, library_traditional_correspondences: false });
  assert.equal(off.layers.length, 0);
  assert.equal(off.facts.length, 0);
  assert.ok(off.empty);
  const noWarnings = L.entryModel(core, basil, entries, [], { library_traditional_warnings: false });
  assert.ok(!noWarnings.layers[0].fields.some((f) => f.key === "TraditionalWarnings"));
});

test("browse and search work like the app's list", () => {
  const all = L.indexModel(core, entries, {}, {});
  assert.equal(all.filter, "all");
  assert.equal(all.options[0].value, "all");
  for (const type of ["herb", "crystal", "candle", "deity", "tool", "vessel"]) assert.ok(all.options.some((o) => o.value === type), type);
  assert.ok(!all.options.some((o) => o.value === L.MINE), "no My Practice filter without notes");
  const herbs = L.indexModel(core, entries, {}, { filter: "herb" });
  assert.ok(herbs.results.every((r) => r.id.startsWith("traditional:herb:")));
  const rosemary = L.indexModel(core, entries, {}, { query: "rosemary" });
  assert.equal(rosemary.results[0].name, "Rosemary");
  assert.equal(rosemary.results[0].href, "/library/entry/?entity=traditional%2Fherb%2Frosemary");
  assert.equal(L.indexModel(core, entries, {}, { query: "zzzzqqq" }).caption, "Nothing in the Library matches that yet.");
  assert.equal(L.indexModel(core, entries, {}, { filter: "nonsense" }).filter, "all");
});

test("the new pages' Library links open the public Library, not the Book of Shadows", () => {
  const W = require("../help/web-notes.js");
  assert.equal(W.siteHref("/more/library"), "/library/");
  assert.equal(W.siteHref("/more/library/traditional:herb:rosemary"), "/library/entry/?entity=traditional%3Aherb%3Arosemary");
  assert.equal(W.siteHref("/more/library/sourcing"), "/library/sourcing/");
  const sources = ["practice/practice.js", "practice/practice-b.js", "today/today-logic.js", "rituals/js/rituals-logic.js", "rituals/journeys/journeys-logic.js", "library/sourcing/sourcing.js", "help/web-notes.js"];
  for (const file of sources) {
    assert.ok(!fs.readFileSync(path.join(__dirname, "..", file), "utf8").includes("/grimoire/?entity"), file);
  }
  // Every link form those pages write finds its entry.
  for (const ref of ["traditional/crystal/rose_quartz", "traditional:herb:rosemary", "traditional/deity/hekate", "traditional/candle/red"]) {
    const value = new URL(L.entryHref(ref), "https://example.org").searchParams.get("entity");
    assert.ok(L.findEntry(core, entries, value), ref);
  }
});
