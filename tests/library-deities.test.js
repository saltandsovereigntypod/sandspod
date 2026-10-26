const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const L = require("../library/library-logic.js");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
function sandboxWith(files, extra = "") {
  const box = { window: {}, TextEncoder, Intl };
  box.window = box;
  vm.createContext(box);
  for (const file of files) vm.runInContext(read(file), box);
  if (extra) vm.runInContext(extra, box);
  return box;
}

const box = sandboxWith(["js/core/library.js", "js/traditional-library.js"], "globalThis.TraditionalLibrary = TraditionalLibrary;");
const core = box.SaltCore.library;
const DATA = box.TraditionalLibrary;

// The deities the festivals name that had no Library entry. None has a statue picture yet.
const NEW_DEITIES = ["saturn", "flora", "neptune", "faunus", "sol", "zeus", "hera", "poseidon", "horus", "set", "nephthys", "maat", "lakshmi", "shiva", "saraswati", "kali", "krishna"];
// The rest of the gods people ask for, from the existing pantheons and new traditions. No pictures either.
const MORE_DEITIES = [
  "ares", "hephaestus", "pan", "gaia", "helios", "eros", "asclepius",
  "fortuna", "bacchus", "pluto", "proserpina", "vulcan", "pomona", "bona_dea", "lares_penates", "mithras",
  "amun", "ptah", "bes", "nut", "neith", "sobek", "khonsu", "taweret",
  "njord", "heimdall", "sif", "bragi", "ullr", "eir", "sunna", "mani", "norns",
  "danu", "aine", "aengus", "boann", "ogma", "nuada", "cailleach",
  "gwydion", "blodeuwedd", "lleu", "bran",
  "taranis", "sucellos", "belenus", "sulis",
  "svarog", "stribog", "jarilo", "zorya", "rod",
  "vishnu", "parvati", "hanuman", "rama", "brahma", "surya",
];

test("the website's Library has the new deities, field for field like Jupiter", () => {
  assert.equal(Object.keys(DATA.deity).length, 78 + MORE_DEITIES.length);
  const fields = Object.keys(DATA.deity.jupiter).sort();
  for (const key of NEW_DEITIES) {
    const deity = DATA.deity[key];
    assert.ok(deity, key);
    assert.deepEqual(Object.keys(deity).sort(), fields, key);
    for (const field of fields) assert.ok(String(deity[field]).trim(), `${key} ${field}`);
    assert.equal(deity.image, undefined, `${key} has no picture of its own`);
  }
});

test("the new deities show as Library entries and open by reference", () => {
  const entries = L.buildEntries(core, DATA, [], {});
  for (const key of NEW_DEITIES) {
    assert.equal(L.findEntry(core, entries, `traditional/deity/${key}`)?.id, `traditional:deity:${key}`, key);
  }
});

test("the website's cabinet has no statue tile for them", () => {
  const artwork = read("js/altar-artwork.js");
  for (const key of NEW_DEITIES) assert.doesNotMatch(artwork, new RegExp(`"deity": "${key}"`), key);
});

test("the website's patron page and holy days know them", () => {
  const today = sandboxWith(["js/core/today.js"]).SaltCore.today;
  const keys = new Set(today.patron.DEITY_DEVOTIONS.map((d) => d.key));
  for (const key of NEW_DEITIES) assert.ok(keys.has(key), key);
  const holy = sandboxWith(["js/core/holy.js"]).SaltCore.holy.holy;
  assert.ok(holy.holyPage("roman-floralia").correspondences.deities.includes("Flora"));
  assert.ok(holy.holyPage("kemetic-birth-set").correspondences.deities.includes("Set"));
});

test("the rest of the gods: every field, unique ids and names, and no picture", () => {
  const fields = Object.keys(DATA.deity.jupiter).sort();
  for (const key of MORE_DEITIES) {
    const deity = DATA.deity[key];
    assert.ok(deity, key);
    assert.deepEqual(Object.keys(deity).sort(), fields, key);
    for (const field of fields) assert.ok(String(deity[field]).trim(), `${key} ${field}`);
    assert.equal(deity.image, undefined, key);
    assert.doesNotMatch(JSON.stringify(deity), /!/, key);
  }
  // A key written twice in the source would silently replace the first entry.
  const source = read("js/traditional-library.js");
  const block = source.slice(source.indexOf("\n    deity: {"), source.indexOf("\n    tool: {"));
  const keys = [...block.matchAll(/^ {8}([a-z_]+): \{$/gm)].map((m) => m[1]);
  assert.equal(keys.length, Object.keys(DATA.deity).length);
  assert.equal(new Set(keys).size, keys.length);
  const names = Object.values(DATA.deity).map((d) => d.DisplayName.toLowerCase());
  assert.equal(new Set(names).size, names.length);
});

test("the rest of the gods: Library entries, no statue tile, and patron days on the website", () => {
  const entries = L.buildEntries(core, DATA, [], {});
  const artwork = read("js/altar-artwork.js");
  const today = sandboxWith(["js/core/today.js"]).SaltCore.today;
  const devotions = new Map(today.patron.DEITY_DEVOTIONS.map((d) => [d.key, d]));
  for (const key of MORE_DEITIES) {
    assert.equal(L.findEntry(core, entries, `traditional/deity/${key}`)?.id, `traditional:deity:${key}`, key);
    assert.doesNotMatch(artwork, new RegExp(`"deity": "${key}"`), key);
    const d = devotions.get(key);
    assert.ok(d && d.sacred.length && d.devotions.length, key);
    assert.ok(today.patron.upcomingSacred(d, new Date(2026, 0, 1), 400).length > 0, key);
  }
});
