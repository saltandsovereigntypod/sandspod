// Potted plants on the website: the Plants drawer (from the app's own logic
// in js/core/altar.js) once their pictures are in js/altar-artwork.js, the
// same saved shape in livingState.app.potted as the app writes, and the
// living panel's section for a plant (altar/js/features/altar-plants.js).
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

const pic = (id, stage) => `../assets/altar/objects/plants/${id}/${id}-${stage}.png`;
const PLANTS = { basil: { young: pic("basil", "young"), established: pic("basil", "established") }, pothos: { lush: pic("pothos", "lush") } };

function placedPothos(A, now) {
  const item = A.pottedPlants.pottedCabinetItems(PLANTS).find((i) => i.id === "plants:pothos");
  return A.cabinet.objectFromForm(item, item.forms[0], [], now);
}

test("plants with a picture join the website's cabinet, in a Plants drawer", () => {
  const records = cabinetApi({ ...Artwork, plants: PLANTS }).getSearchRecords();
  const basil = records.find((r) => r.title === "Basil" && r.destination.category === "plants");
  assert.ok(basil);
  assert.ok(basil.aliases.includes("houseplant"));
  assert.ok(records.some((r) => r.title === "Pothos" && r.destination.category === "plants"));
  // Without pictures, none.
  assert.ok(!cabinetApi({ ...Artwork, plants: {} }).getSearchRecords().some((r) => r.destination.category === "plants"));
});

test("the website's core writes the same potted plant shape as the app", () => {
  const A = core();
  const now = new Date(2026, 9, 1, 12).toISOString();
  let plant = placedPothos(A, now);
  assert.equal(plant.type, "plant");
  assert.equal(plant.form, "pothos");
  plant = A.pottedPlants.setPlantDetails(plant, { name: "Margaret", place: "the landing", light: "Medium light", waterEvery: 7 }, now);
  plant = A.pottedPlants.waterPlant(plant, now);
  const state = JSON.parse(plant.livingState).app.potted;
  assert.deepEqual(Object.keys(state).sort(), ["journal", "kind", "lastWatered", "light", "name", "place", "waterEvery"]);
  assert.equal(state.kind, "pothos");
  assert.equal(state.lastWatered, "2026-10-01");
  assert.equal(state.journal[0].kind, "watered");
  assert.ok(state.journal[0].moon);
  assert.equal(plant.label, "Margaret the pothos");
  // It droops after its day, gently, through the same offering art.
  const later = new Date(2026, 9, 12).getTime();
  assert.equal(A.pottedPlants.thirstOf(plant, later).level, "drooping");
  const art = A.offeringArt.offeringArt(plant, 80, 120, later);
  assert.ok(art.bend.scaleY < 1 && art.tint.saturate < 1);
  const due = A.pottedPlants.wateringDue([{ id: "a", name: "Hall", objects: [plant] }], later);
  assert.equal(A.pottedPlants.wateringNote(due), "Margaret the pothos would like water.");
  // Not an offering, whatever it's called.
  assert.equal(A.offerings.offeringOf(plant), null);
});

test("a basil harvest is logged with the moon, and a fresh sprig is set beside it", () => {
  const A = core();
  const now = new Date(2026, 9, 24, 20).toISOString();
  const item = A.pottedPlants.pottedCabinetItems(PLANTS).find((i) => i.id === "plants:basil");
  let basil = A.cabinet.objectFromForm(item, item.forms[0], [], now);
  basil = A.pottedPlants.harvestPlant(basil, { amount: "a handful", to: "altar" }, now);
  const [entry] = A.pottedPlants.journalOf(basil);
  assert.equal(entry.kind, "harvested");
  assert.equal(entry.to, "altar");
  assert.equal(entry.moon, A.moon.moonState(new Date(now)).name);
  const sprig = A.pottedSprig.harvestSprig(basil, [basil], now);
  assert.equal(sprig.type, "herb");
  assert.equal(sprig.form, "sprig");
  assert.equal(sprig.herb, "basil");
});

test("the living panel shows a plant's water, notes and journal", () => {
  const A = core();
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const chips = (list) => list.filter(Boolean).map((c) => `<button data-app-action="${esc(c.action)}">${esc(c.label)}</button>`).join("");
  const sandbox = { console, SaltCore: { altar: A }, AltarApp: { esc, chips } };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("altar/js/features/altar-plants.js", "utf8"), sandbox);
  const now = new Date(2026, 9, 1, 12);
  let plant = placedPothos(A, now.toISOString());
  plant = A.pottedPlants.addJournal(plant, { kind: "repotted", on: "2026-09-20", note: "Into the blue pot" }, now.toISOString());
  const html = sandbox.AltarPlants.panelHtml(plant, now);
  assert.match(html, /Your pothos/);
  assert.match(html, /data-app-action="plant-water"/);
  assert.match(html, /Pets: Toxic to cats and dogs/);
  assert.match(html, /prosperity and steady growth/);
  assert.match(html, /Repotted\. Into the blue pot/);
  // A pothos isn't harvested.
  assert.doesNotMatch(html, /plant-harvest/);
  assert.equal(sandbox.AltarPlants.panelHtml({ type: "herb", form: "sprig" }, now), "");
  assert.equal(typeof sandbox.AltarPlants.actions["plant-journal"], "function");
});
