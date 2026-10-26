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

test("the website's Library has the new deities, field for field like Jupiter", () => {
  assert.equal(Object.keys(DATA.deity).length, 78);
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
