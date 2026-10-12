const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Normalization = require("../js/apothecary-normalization.js");
const Search = require("../js/sanctuary-search.js");

test("legacy and current Apothecary records normalize to one searchable shape", () => {
  const legacy = Normalization.normalize({ id: "old-1", recipe_name: "Manifestation Blend", type_id: "herb-mix", ingredient_list: [{ name: "Sage" }], description: "For abundance", tags: ["prosperity"] });
  const current = Normalization.normalize({ id: "new-1", name: "Protection Jar", type: "spell-jar", typeLabel: "Spell Jar", ingredients: [{ label: "Rosemary" }] });
  assert.equal(legacy.name, "Manifestation Blend");
  assert.equal(legacy.typeLabel, "Herb Mix");
  assert.equal(current.name, "Protection Jar");
  Search.buildIndex({ apothecary: [Search.createApothecaryResult(legacy), Search.createApothecaryResult(current)] });
  assert.equal(Search.search("manifestation blend")[0].id, "old-1");
  assert.ok(Search.search("sage").some((record) => record.id === "old-1"));
  assert.ok(Search.search("spell jar").some((record) => record.id === "new-1"));
});

test("Apothecary hydration has stale-response and completion-event guards", () => {
  const source = fs.readFileSync("altar/js/features/apothecary.js", "utf8");
  assert.match(source, /revision !== apothecaryHydrationRevision/);
  assert.match(source, /apothecary:hydrated/);
  assert.match(source, /\.map\(normalizeApothecaryItem\)/);
});

test("guests can save My Apothecary in this browser, and deleting cleans up everywhere", () => {
  const source = fs.readFileSync("altar/js/features/apothecary.js", "utf8");
  const save = source.slice(source.indexOf("async function saveApothecaryItems"), source.indexOf("async function migrateLocalApothecaryToCloud"));
  assert.match(save, /localStorage\.setItem\(APOTHECARY_STORAGE_KEY/, "guests write the key the loader reads");
  assert.doesNotMatch(save, /Please sign in again/);
  const remove = source.slice(source.indexOf("async function deleteApothecaryItem"));
  const cleanup = remove.slice(remove.indexOf("} else {"));
  assert.match(cleanup, /deleteLinkedApothecaryLibraryEntity[\s\S]*removePlacedApothecaryObjects[\s\S]*renderApothecaryItems/, "cleanup runs after both branches");
  assert.doesNotMatch(source, /createGrimoireHandoffForApothecaryItem/, "the handoff that could never run is gone");
});
