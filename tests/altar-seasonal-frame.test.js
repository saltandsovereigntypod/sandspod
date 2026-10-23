// The website's cabinet offers the seasonal things, the new tools and the
// natural finds (from the app's own logic in js/core/altar.js) once their
// pictures are in js/altar-artwork.js, and the ancestor frame and food in a
// vessel come from the same core as the app's.
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

test("seasonal things with a picture join the website's cabinet, found by their sabbat", () => {
  const artwork = { ...Artwork, seasonal: { "pumpkin-lantern": "../assets/altar/objects/seasonal/pumpkin-lantern/pumpkin-lantern.png", apples: "../assets/altar/objects/seasonal/apples/apples.png" } };
  const records = cabinetApi(artwork).getSearchRecords();
  const lantern = records.find((r) => r.title === "Pumpkin Lantern");
  assert.ok(lantern);
  assert.ok(lantern.aliases.includes("Samhain"));
  assert.equal(lantern.destination.category, "seasonal");
  assert.ok(records.some((r) => r.title === "Apples"));
  // Without pictures, none.
  assert.ok(!cabinetApi({ ...Artwork, seasonal: {} }).getSearchRecords().some((r) => r.destination.category === "seasonal"));
});

test("the new tools and natural finds with a picture join the website's cabinet", () => {
  const artwork = { ...Artwork, shelfTools: { "singing-bowl": "../assets/altar/objects/tools/singing-bowl/singing-bowl.png" }, natural: { "hag-stone": "../assets/altar/objects/natural/hag-stone/hag-stone.png" } };
  const records = cabinetApi(artwork).getSearchRecords();
  const bowl = records.find((r) => r.title === "Singing Bowl");
  assert.equal(bowl.destination.category, "tools");
  const stone = records.find((r) => r.title === "Hag Stone");
  assert.equal(stone.destination.category, "natural");
  assert.ok(stone.aliases.includes("protection"));
  assert.ok(core().shelf.glowsWhenPlaced({ type: "tool", tool: "lantern" }));
});

test("the website's core reads and writes the same frame and offering shapes as the app", () => {
  const A = core();
  const frame = { type: "tool", tool: "ancestor-frame", form: "gilt", label: "Ancestor Frame Gilt", imagePath: "../assets/altar/objects/tools/ancestor-frame/ancestor-frame-gilt.png", livingState: "" };
  const now = "2026-10-23T19:00:00.000Z";
  let next = A.frame.setFramePhoto(frame, "data:image/jpeg;base64,AAAA", "", now);
  next = A.frame.setFrameAged(next, true, now);
  next = A.frame.setFrameCaption(next, { name: "Nan", dates: "1932–2019" }, now);
  const state = JSON.parse(next.livingState);
  assert.deepEqual(JSON.parse(JSON.stringify(state.app.frame)), { photo: "data:image/jpeg;base64,AAAA", storagePath: "", aged: true, name: "Nan", dates: "1932–2019" });
  assert.equal(next.label, "In memory of Nan");
  assert.deepEqual(JSON.parse(JSON.stringify(A.frame.frameCaption(next))), { title: "In memory of Nan", dates: "1932–2019" });
  // A sabbat a week away brings the seasonal drawer forward.
  assert.equal(A.seasonal.sabbatNear(new Date(2026, 9, 25), null).id, "samhain");
  // Apples placed from the Seasonal drawer go over as whole fruit.
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "apples", label: "Apples" }), "harvest");
  assert.equal(A.offeringArt.foodHeapOf("cooked", "stew"), "meal");
});
