const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function createLibraryContext() {
  const values = new Map();
  const context = {
    console,
    crypto,
    structuredClone,
    TraditionalLibrary: {
      herb: {
        basil: {
          DisplayName: "Basil",
          Uses: "Protection"
        }
      },
      crystal: {
        clear_quartz: { DisplayName: "Clear Quartz", Uses: "Amplification" }
      },
      candle: {
        white: { DisplayName: "White Candle", Uses: "Cleansing" }
      },
      tool: {
        cauldron: { DisplayName: "Cauldron", Uses: "Transformation" }
      },
      vessel: {
        spell_jar: { DisplayName: "Spell Jar", Uses: "Containment" }
      }
    },
    localStorage: {
      getItem(key) {
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        values.set(key, String(value));
      },
      removeItem(key) {
        values.delete(key);
      }
    }
  };

  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, "../js/library.js"), "utf8");
  vm.runInContext(`${source}\nglobalThis.__Library = Library;`, context);
  return context;
}

test("Traditional references attach to one stable canonical entity", () => {
  const context = createLibraryContext();
  const library = context.__Library;

  library.importTraditionalLibrary();
  const basil = library.findEntityByTraditionalReference("traditional/herb/basil");
  assert.ok(basil);
  assert.equal(basil.name, "Basil");
  assert.equal(basil.metadata.traditionalReference, "traditional/herb/basil");

  library.importTraditionalLibrary();
  assert.equal(
    library.findEntityByTraditionalReference("traditional/herb/basil").id,
    basil.id
  );
  assert.equal(library.searchTraditionalEntries("herb", "bas")[0].reference, "traditional/herb/basil");
});

test("Explicit custom entities remain unlinked when Traditional content grows", () => {
  const context = createLibraryContext();
  const library = context.__Library;
  const custom = library.createEntity({
    name: "Dream Herb",
    type: "herb",
    metadata: { traditionalReference: null }
  });

  context.TraditionalLibrary.herb.dream_herb = {
    DisplayName: "Dream Herb",
    Uses: "Dream work"
  };
  library.importTraditionalLibrary();

  const canonical = library.findEntityByTraditionalReference("traditional/herb/dream_herb");
  assert.ok(canonical);
  assert.notEqual(canonical.id, custom.id);
  assert.equal(library.getEntity(custom.id).metadata.traditionalReference, null);
});

test("Living Library prevents duplicate canonical relationship edges", () => {
  const context = createLibraryContext();
  const library = context.__Library;
  const first = library.createEntity({ name: "First", type: "herb" });
  const second = library.createEntity({ name: "Second", type: "herb" });

  library.connect(first.id, "pairs_with", second.id);
  library.connect(first.id, "pairs_with", second.id);

  const matches = library.exportLibrary().relations.filter((relation) => {
    return relation.from === first.id && relation.relation === "pairs_with" && relation.to === second.id;
  });
  assert.equal(matches.length, 1);
});

test("altar identities resolve only to canonical Traditional entities", () => {
  const context = createLibraryContext();
  const library = context.__Library;
  library.importTraditionalLibrary();

  assert.equal(
    library.resolveObjectEntity({ crystal: "clear_quartz", type: "crystal" }).id,
    library.findEntityByTraditionalReference("traditional/crystal/clear_quartz").id
  );
  assert.equal(
    library.resolveObjectEntity({ color: "white", type: "candle" }).id,
    library.findEntityByTraditionalReference("traditional/candle/white").id
  );
  assert.equal(
    library.resolveObjectEntity({ vessel: "cauldron", type: "vessel" }).id,
    library.findEntityByTraditionalReference("traditional/tool/cauldron").id
  );
  assert.equal(library.resolveCanonicalEntityId("clear_quartz"), null);
  assert.equal(library.resolveCanonicalEntityId("Clear Quartz"), null);
  assert.equal(library.resolveCanonicalEntityId("clear-quartz.png"), null);
});

test("legacy duplicate content and relationships merge without losing authored values", () => {
  const context = createLibraryContext();
  const library = context.__Library;
  const duplicate = library.createEntity({
    id: "legacy-clear-quartz",
    name: "clear_quartz",
    type: "crystal",
    myPractice: { Notes: "Legacy note", Uses: ["Meditation"] },
    community: { Notes: "Community note" }
  });
  const related = library.createEntity({ name: "Related Entry", type: "note", metadata: { traditionalReference: null } });
  library.connect(duplicate.id, "pairs_with", related.id);

  library.importTraditionalLibrary();
  const canonical = library.findEntityByTraditionalReference("traditional/crystal/clear_quartz");

  assert.equal(library.getEntity(duplicate.id), null);
  assert.equal(library.resolveCanonicalEntityId(duplicate.id), canonical.id);
  assert.equal(canonical.myPractice.Notes, "Legacy note");
  assert.deepEqual(canonical.myPractice.Uses, ["Meditation"]);
  assert.equal(canonical.community.Notes, "Community note");
  assert.ok(library.getConnections(canonical.id).some((relation) => relation.to === related.id));
  assert.equal(library.importTraditionalLibrary().length, 0);
  assert.equal(canonical.myPractice.Notes, "Legacy note");
});

test("explicit custom entities are never merged by normalized names", () => {
  const context = createLibraryContext();
  const library = context.__Library;
  const custom = library.createEntity({
    id: "custom-quartz",
    name: "Clear Quartz",
    type: "crystal",
    metadata: { traditionalReference: null },
    myPractice: { Notes: "Intentionally custom" }
  });

  library.importTraditionalLibrary();
  assert.ok(library.getEntity(custom.id));
  assert.notEqual(custom.id, library.findEntityByTraditionalReference("traditional/crystal/clear_quartz").id);
  assert.equal(library.resolveObjectEntity({ entityId: custom.id, crystal: "clear_quartz" }).id, custom.id);
});

test("an older legacy cloud duplicate cannot restore deleted canonical practice", () => {
  const context = createLibraryContext();
  const library = context.__Library;
  const canonical = library.createEntity({
    id: "canonical-quartz",
    name: "Clear Quartz",
    type: "crystal",
    metadata: {
      traditionalReference: "traditional/crystal/clear_quartz",
      cloudUpdatedAt: "2026-07-28T12:00:00Z"
    },
    traditional: context.TraditionalLibrary.crystal.clear_quartz,
    myPractice: {}
  });
  library.createEntity({
    id: "old-quartz-row",
    name: "clear_quartz",
    type: "crystal",
    metadata: { cloudUpdatedAt: "2026-07-20T12:00:00Z" },
    myPractice: { Notes: "Deleted old content" }
  });

  const merges = library.importTraditionalLibrary();
  assert.deepEqual(canonical.myPractice, {});
  assert.equal(library.getEntity("old-quartz-row"), null);
  assert.equal(library.resolveCanonicalEntityId("old-quartz-row"), canonical.id);
  assert.ok(merges.some((merge) => merge.canonicalEntityId === canonical.id));
});

test("a My Practice save replaces only the relations it generated", () => {
  const context = createLibraryContext();
  const library = context.__Library;
  library.importTraditionalLibrary();
  const entity = library.createEntity({ name: "Dream Herb", type: "herb" });
  const basil = library.findEntityByTraditionalReference("traditional/herb/basil");
  const quartz = library.findEntityByTraditionalReference("traditional/crystal/clear_quartz");
  const white = library.findEntityByTraditionalReference("traditional/candle/white");

  library.connect(entity.id, "pairs_with", white.id, { source: "manual" });
  library.connect(entity.id, "substitutes", quartz.id);

  library.updateEntitySection(entity.id, "myPractice", { PairsWith: "Basil, White Candle", Substitutions: "Clear Quartz" });
  const first = library.syncMyPracticeConnections(entity.id);
  const links = () => library.exportLibrary().relations.filter((link) => link.from === entity.id || link.to === entity.id);
  const find = (from, relation, to) => links().find((link) => link.from === from && link.relation === relation && link.to === to);

  assert.equal(find(entity.id, "pairs_with", basil.id).metadata.source, "my-practice");
  assert.equal(find(basil.id, "pairs_with", entity.id).metadata.source, "my-practice");
  assert.equal(find(quartz.id, "substitute_for", entity.id).metadata.source, "my-practice");
  // Hand-added rows keep their source and are not taken over by the generated ones.
  assert.equal(find(entity.id, "pairs_with", white.id).metadata.source, "manual");
  assert.equal(find(entity.id, "substitutes", quartz.id).metadata, undefined);
  assert.equal(first.removed.length, 0);
  assert.ok(first.generated.every((link) => link.metadata.source === "my-practice"));
  assert.ok(!first.generated.some((link) => link.from === entity.id && link.to === white.id));

  library.updateEntitySection(entity.id, "myPractice", { PairsWith: "", Substitutions: "" });
  const second = library.syncMyPracticeConnections(entity.id);

  assert.equal(find(entity.id, "pairs_with", basil.id), undefined);
  assert.deepEqual([...second.removed.map((link) => link.to)], [basil.id]);
  assert.ok(find(entity.id, "pairs_with", white.id));
  assert.ok(find(entity.id, "substitutes", quartz.id));
  assert.equal(second.generated.length, 0);
});

function createSyncedLibraryContext() {
  const context = createLibraryContext();
  const calls = [];
  context.window = context;
  context.performance = { now: () => 0 };
  context.document = { dispatchEvent() {} };
  context.CustomEvent = class { constructor(type, init) { this.type = type; this.detail = init?.detail; } };
  context.setTimeout = () => 0;
  context.clearTimeout = () => {};
  context.getUser = () => ({ id: "user-1" });
  context.db = {
    from(table) {
      const call = { table, ops: [] };
      calls.push(call);
      const builder = {
        then(resolve, reject) {
          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        }
      };
      ["select", "eq", "in", "order", "upsert", "delete", "insert", "update"].forEach((method) => {
        builder[method] = (...args) => {
          call.ops.push([method, ...args]);
          return builder;
        };
      });
      return builder;
    }
  };
  const source = fs.readFileSync(path.join(__dirname, "../js/living-library-sync.js"), "utf8");
  vm.runInContext(source, context);
  return { context, calls };
}

async function settle() {
  for (let index = 0; index < 10; index += 1) await new Promise((resolve) => setImmediate(resolve));
}

test("signed in, My Practice relations are saved to library_relations as the app saves them", async () => {
  const { context, calls } = createSyncedLibraryContext();
  await context.initLivingLibrarySupabaseSync();
  const library = context.__Library;
  const entity = library.createEntity({ name: "Dream Herb", type: "herb" });
  const basil = library.findEntityByTraditionalReference("traditional/herb/basil");
  calls.length = 0;

  library.updateEntitySection(entity.id, "myPractice", { PairsWith: "Basil" });
  library.syncMyPracticeConnections(entity.id);
  await settle();

  const upserts = calls.filter((call) => call.table === "library_relations" && call.ops[0][0] === "upsert");
  assert.equal(upserts.length, 1);
  const [, rows, options] = upserts[0].ops[0];
  assert.equal(options.onConflict, "user_id,from_entity_id,relation,to_entity_id");
  assert.deepEqual(
    JSON.parse(JSON.stringify(rows.map(({ user_id, from_entity_id, relation, to_entity_id, metadata }) => ({ user_id, from_entity_id, relation, to_entity_id, metadata })))),
    [
      { user_id: "user-1", from_entity_id: entity.id, relation: "pairs_with", to_entity_id: basil.id, metadata: { source: "my-practice" } },
      { user_id: "user-1", from_entity_id: basil.id, relation: "pairs_with", to_entity_id: entity.id, metadata: { source: "my-practice" } }
    ]
  );
  assert.ok(rows.every((row) => typeof row.updated_at === "string"));

  calls.length = 0;
  library.updateEntitySection(entity.id, "myPractice", { PairsWith: "" });
  library.syncMyPracticeConnections(entity.id);
  await settle();

  const deletes = calls.filter((call) => call.table === "library_relations" && call.ops[0][0] === "delete");
  assert.equal(deletes.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(deletes[0].ops.slice(1))), [
    ["eq", "user_id", "user-1"],
    ["eq", "from_entity_id", entity.id],
    ["eq", "relation", "pairs_with"],
    ["eq", "to_entity_id", basil.id]
  ]);
  assert.equal(calls.filter((call) => call.table === "library_relations" && call.ops[0][0] === "upsert").length, 0);
});

test("for guests, My Practice relations stay on the device", async () => {
  const { context, calls } = createSyncedLibraryContext();
  context.getUser = () => null;
  await context.initLivingLibrarySupabaseSync();
  const library = context.__Library;
  library.importTraditionalLibrary();
  const entity = library.createEntity({ name: "Dream Herb", type: "herb" });

  library.updateEntitySection(entity.id, "myPractice", { PairsWith: "Basil" });
  library.syncMyPracticeConnections(entity.id);
  await settle();

  assert.equal(calls.length, 0);
  assert.ok(library.exportLibrary().relations.some((link) => link.from === entity.id && link.metadata?.source === "my-practice"));
});
