// The Offerings drawer on the website: the same items as the app's cabinet
// (from the app's own logic in js/core/altar.js), tiles that carry a filled
// vessel's offering to placeObject, and the same saved shapes.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const Catalog = require("../js/sanctuary-asset-catalog.js");
const Artwork = require("../js/altar-artwork.js");

function core() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("js/core/altar.js", "utf8"), sandbox);
  return sandbox.SaltCore.altar;
}

function cabinetApi(artwork) {
  const sandbox = { location: { search: "" }, dispatchEvent() {}, CustomEvent: class {}, URLSearchParams, console, SanctuaryAssetCatalog: Catalog, AltarArtwork: artwork, SaltCore: { altar: core() } };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("altar/js/features/cabinet.js", "utf8"), sandbox);
  return sandbox.AltarCabinet;
}

test("the website's cabinet has an Offerings drawer of foods and filled vessels", () => {
  const records = cabinetApi(Artwork).getSearchRecords().filter((r) => r.source === "altar-cabinet" && r.destination.category === "offerings");
  const titles = records.map((r) => r.title);
  for (const name of ["Bread", "Fruit", "Honey Cakes and Sweets", "A Cooked Meal", "Cut Flowers", "Honeycomb", "Bowl of Water", "Chalice of Wine", "Dish of Milk", "Honey Dish"]) {
    assert.ok(titles.includes(name), name);
  }
  // The same ids as the app's.
  const A = core();
  const app = JSON.parse(JSON.stringify(A.offeringDrawer.offeringCabinetItems(Artwork.offeringFoods, Artwork.items).map((i) => i.id).sort()));
  assert.equal(records.map((r) => r.destination.itemId).sort().join(" "), app.join(" "));
  // A new folder of pictures (once the artwork is rebuilt) joins it; without one, it's absent.
  assert.ok(!titles.includes("Stones and Shells"));
  const more = { ...Artwork, offeringFoods: { ...Artwork.offeringFoods, stones: { image: "../assets/altar/objects/offerings/stones/stones.png", ratio: 1 } } };
  assert.ok(cabinetApi(more).getSearchRecords().some((r) => r.title === "Stones and Shells" && r.destination.category === "offerings"));
});

test("cabinet tiles carry a filled vessel's offering, and placing passes it on", () => {
  const cabinet = fs.readFileSync("altar/js/features/cabinet.js", "utf8");
  assert.match(cabinet, /data-offering="\$\{form\.offering \|\| ""\}"/);
  assert.match(cabinet, /offering: form\.offering \|\| "", offeringLabel: form\.offeringLabel \|\| ""/);
  assert.match(fs.readFileSync("altar/js/core/events.js", "utf8"), /offering: item\.dataset\.offering \|\| ""/);
  assert.match(fs.readFileSync("altar/js/features/objects.js", "utf8"), /offerings\.setOffering\(saved, offering, offeringLabel/);
});

test("the website's core writes the same shapes as the app for the drawer", () => {
  const A = core();
  const items = A.offeringDrawer.offeringCabinetItems(Artwork.offeringFoods, Artwork.items);
  const t0 = Date.UTC(2026, 9, 1, 12);
  const bread = items.find((i) => i.id === "offerings:bread");
  const placed = A.cabinet.objectFromForm(bread, bread.forms[0], [], new Date(t0).toISOString());
  assert.equal(placed.type, "offering");
  assert.equal(placed.form, "bread");
  assert.equal(A.offerings.offeringFreshness(placed, t0).stage.name, "Fresh");
  assert.equal(A.offerings.offeringFreshness(placed, t0 + 3 * 86_400_000).stage.name, "Stale");
  // As the website does it: the vessel placed, then its offering set out.
  const water = items.find((i) => i.id === "offerings:bowl-of-water");
  const form = water.forms[0];
  assert.equal(form.offering, "water");
  const plain = A.cabinet.objectFromForm({ ...water, forms: [{ ...form, offering: undefined }] }, { ...form, offering: undefined }, [], new Date(t0).toISOString());
  const filled = A.offerings.setOffering(plain, form.offering, form.offeringLabel, new Date(t0).toISOString());
  assert.deepEqual(JSON.parse(filled.livingState).app.offering, { kind: "water", label: "water", since: new Date(t0).toISOString() });
  assert.deepEqual(A.offerings.offeringOf(A.cabinet.objectFromForm(water, form, [], new Date(t0).toISOString())), A.offerings.offeringOf(filled));
});
