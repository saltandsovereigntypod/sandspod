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
  vm.runInNewContext(fs.readFileSync("js/traditional-library.js", "utf8") + "\n" + fs.readFileSync("js/core/altar.js", "utf8"), sandbox);
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

test("the Greek festivals' things join the website's cabinet once painted, found by festival and god, near only for the calendars kept", () => {
  const A = core();
  const artwork = { ...Artwork, seasonal: { ...Artwork.seasonal, thyrsus: "../assets/altar/objects/seasonal/thyrsus/thyrsus.png" } };
  const records = cabinetApi(artwork).getSearchRecords();
  const thyrsus = records.find((r) => r.title === "Thyrsus");
  assert.ok(thyrsus);
  assert.ok(thyrsus.aliases.includes("Dionysus"));
  assert.ok(thyrsus.aliases.includes("City Dionysia"));
  // Not offered until its picture is painted.
  assert.ok(!cabinetApi({ ...Artwork, seasonal: {} }).getSearchRecords().some((r) => r.title === "Thyrsus"));
  // The Pyanepsia (17 October 2026) is near a week before, for those who keep the Greek calendar.
  const keys = (choice) => [...A.seasonal.festivalsNear(new Date(2026, 9, 10, 12), choice).map((n) => n.key)];
  assert.deepEqual(keys({ traditions: ["hellenic", "hellenic_monthly"], custom: [] }), ["hellenic/deipnon", "hellenic/noumenia", "hellenic/pyanepsia"]);
  assert.deepEqual(keys(null), []);
  // The drawer's sections and the tile's festivals, from the same core as the app's.
  const items = A.seasonal.seasonalCabinetItems({ thyrsus: "t.png", apples: "a.png" });
  assert.deepEqual([...A.seasonal.seasonalSections(items, []).map((s) => s.title)], ["Wheel of the Year", "Greek festivals"]);
  assert.equal(items.find((i) => i.id === "seasonal:thyrsus").description, "Lenaia · City Dionysia");
  assert.ok(A.offerings.holdsOfferings({ type: "seasonal", form: "phiale" }));
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "kykeon", label: "Kykeon" }), "drink");
});

test("the Norse, Celtic and seasonal things join the website's cabinet once painted, with the season after any festival near", () => {
  const A = core();
  const pic = (id) => `../assets/altar/objects/seasonal/${id}/${id}.png`;
  const artwork = { ...Artwork, seasonal: { ...Artwork.seasonal, "drinking-horn": pic("drinking-horn"), "may-bush": pic("may-bush"), "autumn-leaves": pic("autumn-leaves") } };
  const records = cabinetApi(artwork).getSearchRecords();
  assert.ok(records.find((r) => r.title === "Drinking Horn").aliases.includes("Odin"));
  assert.ok(records.find((r) => r.title === "May Bush").aliases.includes("Bealtaine"));
  assert.ok(records.find((r) => r.title === "Fallen Leaves" && r.destination.category === "seasonal").aliases.includes("Autumn"));
  // Not offered until painted.
  assert.ok(!cabinetApi({ ...Artwork, seasonal: {} }).getSearchRecords().some((r) => r.title === "May Bush"));
  // Near: the Celtic year's Bealtaine with the Wheel's Beltane things; Jól only for those who keep the Norse year.
  const bealtaine = A.seasonal.festivalsNear(new Date(2026, 3, 28, 12), { traditions: ["celtic"], custom: [] });
  assert.equal(bealtaine[0].name, "Bealtaine");
  assert.deepEqual([...bealtaine[0].keys], ["celtic/bealtaine", "wheel/beltane"]);
  assert.deepEqual([...A.seasonal.festivalsNear(new Date(2026, 11, 18), { traditions: ["norse"], custom: [] }).map((n) => n.key)], ["norse/jol"]);
  // The season, by the date and the hemisphere, after the festival.
  const items = A.seasonal.seasonalCabinetItems({ "autumn-leaves": "l.png", "pumpkin-lantern": "p.png", "drinking-horn": "h.png" });
  const near = A.seasonal.seasonalNear(new Date(2026, 9, 27), null);
  assert.deepEqual([...A.seasonal.seasonalSections(items, near).map((s) => s.title)], ["For Samhain", "This season", "Norse & Heathen"]);
  assert.equal(A.seasonal.festivalWhen(near[1]), "Autumn, until the end of November.");
  assert.equal(A.seasonal.seasonNow(new Date(2026, 9, 27), { traditions: ["wheel_south"], custom: [] }).key, "seasons/spring");
  assert.equal(A.seasonal.nearWithThings(A.seasonal.seasonalNear(new Date(2026, 9, 10), null), items).length, 0);
  assert.ok(A.offerings.holdsOfferings({ type: "seasonal", form: "drinking-horn" }));
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "may-bush", label: "May Bush" }), "flowers");
});

test("the Roman festivals' things join the website's cabinet once painted, near only for those who keep the Roman year", () => {
  const A = core();
  const pic = (id) => `../assets/altar/objects/seasonal/${id}/${id}.png`;
  const artwork = { ...Artwork, seasonal: { ...Artwork.seasonal, pileus: pic("pileus"), "mola-salsa": pic("mola-salsa"), "radiate-crown": pic("radiate-crown") } };
  const records = cabinetApi(artwork).getSearchRecords();
  assert.ok(records.find((r) => r.title === "Pileus").aliases.includes("Saturnalia"));
  assert.ok(records.find((r) => r.title === "Mola Salsa").aliases.includes("Vesta"));
  assert.ok(records.find((r) => r.title === "Radiate Crown").aliases.includes("Sol Invictus"));
  // Not offered until painted.
  assert.ok(!cabinetApi({ ...Artwork, seasonal: {} }).getSearchRecords().some((r) => r.title === "Pileus"));
  // Near only for the Roman calendar, in its own section after the Celtic festivals.
  const roman = { traditions: ["roman"], custom: [] };
  const near = A.seasonal.seasonalNear(new Date(2026, 11, 18, 12), roman);
  assert.deepEqual([...near.map((n) => n.key)], ["roman/saturnalia", "roman/sol_invictus"]);
  assert.equal(A.seasonal.festivalWhen(near[0]), "Saturnalia, day 2 of 7.");
  assert.ok(!A.seasonal.festivalsNear(new Date(2026, 11, 18, 12), null).some((n) => n.key.startsWith("roman/")));
  const items = A.seasonal.seasonalCabinetItems({ pileus: "p.png", "may-bush": "m.png", "autumn-leaves": "l.png" });
  assert.deepEqual([...A.seasonal.seasonalSections(items, []).map((s) => s.title)], ["Celtic festivals", "Roman festivals", "The turning seasons"]);
  assert.equal(A.seasonal.seasonalSections(items, near)[0].title, "For Saturnalia");
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "mola-salsa", label: "Mola Salsa" }), "bread");
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "floralia-flowers", label: "Flowers and Beans of Flora" }), "flowers");
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "lemuria-beans", label: "Black Beans" }), null);
});

test("the Christian and folk things join the website's cabinet once painted, near only for those who keep the Christian year", () => {
  const A = core();
  const pic = (id) => `../assets/altar/objects/seasonal/${id}/${id}.png`;
  const artwork = { ...Artwork, seasonal: { ...Artwork.seasonal, "advent-wreath": pic("advent-wreath"), "herb-bundle": pic("herb-bundle"), "holly-and-ivy": pic("holly-and-ivy") } };
  const records = cabinetApi(artwork).getSearchRecords();
  assert.ok(records.find((r) => r.title === "Advent Wreath").aliases.includes("Advent Sunday"));
  assert.ok(records.find((r) => r.title === "Assumption Herb Bundle").aliases.includes("Our Lady"));
  // Not offered until painted.
  assert.ok(!cabinetApi({ ...Artwork, seasonal: {} }).getSearchRecords().some((r) => r.title === "Advent Wreath"));
  // Near only for the Christian calendar, in its own section after the Roman festivals.
  const christian = { traditions: ["christian"], custom: [] };
  const near = A.seasonal.seasonalNear(new Date(2026, 11, 20, 12), christian);
  assert.equal(near[0].key, "christian/christmas");
  assert.ok(!A.seasonal.festivalsNear(new Date(2026, 11, 20, 12), null).some((n) => n.key.startsWith("christian/")));
  const items = A.seasonal.seasonalCabinetItems({ pileus: "p.png", "advent-wreath": "a.png", "autumn-leaves": "l.png" });
  assert.deepEqual([...A.seasonal.seasonalSections(items, []).map((s) => s.title)], ["Roman festivals", "Christian & folk calendar", "The turning seasons"]);
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "lammas-loaf", label: "Lammas Loaf" }), "bread");
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "holly-and-ivy", label: "Holly and Ivy" }), "flowers");
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "advent-wreath", label: "Advent Wreath" }), null);
});

test("hiding the Christian calendar in settings takes its things out of the website's cabinet, the Lammas loaf staying for the Wheel", async () => {
  const pic = (id) => `../assets/altar/objects/seasonal/${id}/${id}.png`;
  const settings = { calendar_traditions: "wheel,christian", calendar_hidden_traditions: "christian" };
  const sandbox = {
    location: { search: "" }, dispatchEvent() {}, CustomEvent: class {}, URLSearchParams, console, setTimeout,
    document: { readyState: "complete", addEventListener() {} }, addEventListener() {}, cabinetTabs: null, cabinetContent: null, activeCabinetCategory: "candles",
    SaltSettings: { get: async () => settings },
    SanctuaryAssetCatalog: Catalog,
    AltarArtwork: { ...Artwork, seasonal: { ...Artwork.seasonal, "advent-wreath": pic("advent-wreath"), "lammas-loaf": pic("lammas-loaf"), pileus: pic("pileus") } },
    SaltCore: { altar: core() },
  };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("altar/js/features/cabinet.js", "utf8"), sandbox);
  await new Promise((resolve) => setTimeout(resolve, 20));
  const records = sandbox.AltarCabinet.getSearchRecords();
  assert.ok(!records.some((r) => r.title === "Advent Wreath"));
  assert.ok(records.some((r) => r.title === "Pileus"));
  const loaf = records.find((r) => r.title === "Lammas Loaf");
  assert.ok(loaf && loaf.aliases.includes("Lammas") && !loaf.aliases.includes("Christian"));
});

test("the Slavic, Hindu and Kemetic things join the website's cabinet once painted, the Hindu and Kemetic near only while their calendar is shown", () => {
  const A = core();
  const pic = (id) => `../assets/altar/objects/seasonal/${id}/${id}.png`;
  const artwork = { ...Artwork, seasonal: { ...Artwork.seasonal, didukh: pic("didukh"), "diya-lamps": pic("diya-lamps"), "osiris-bed": pic("osiris-bed") } };
  const records = cabinetApi(artwork).getSearchRecords();
  assert.ok(records.find((r) => r.title === "Didukh").aliases.includes("Koliada"));
  assert.ok(records.find((r) => r.title === "Diya Lamps").aliases.includes("Lakshmi"));
  assert.ok(records.find((r) => r.title === "Osiris Bed").aliases.includes("Birthday of Osiris"));
  // Not offered until painted.
  assert.ok(!cabinetApi({ ...Artwork, seasonal: {} }).getSearchRecords().some((r) => r.title === "Didukh"));
  // In their own sections, after the Christian & folk calendar.
  const items = A.seasonal.seasonalCabinetItems({ "advent-wreath": "a.png", didukh: "d.png", "diya-lamps": "l.png", "osiris-bed": "o.png", "autumn-leaves": "x.png" });
  assert.deepEqual([...A.seasonal.seasonalSections(items, []).map((s) => s.title)], ["Christian & folk calendar", "Slavic festivals", "Hindu festivals", "Kemetic (Egyptian) festivals", "The turning seasons"]);
  // Diwali (8 November 2026) only for someone who shows the Hindu calendar; the days upon the year as one span.
  const diwali = new Date(2026, 10, 3, 12);
  assert.equal(A.seasonal.seasonalNear(diwali, null, { settings: { calendar_extra: "hindu" }, place: null })[0].key, "hindu/diwali");
  assert.ok(!A.seasonal.seasonalNear(diwali, null, { settings: { calendar_extra: "kemetic" }, place: null }).some((n) => n.key.startsWith("hindu/")));
  assert.ok(!A.seasonal.seasonalNear(diwali, null).some((n) => n.key.startsWith("hindu/")));
  const span = A.seasonal.festivalsNear(new Date(2026, 6, 25, 12), null, { settings: { calendar_extra: "kemetic" }, place: null })[0];
  assert.equal(span.key, "kemetic/epagomenal");
  assert.equal(span.days, 5);
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "kutia", label: "Kutia" }), "cooked");
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "modak", label: "Modak" }), "sweets");
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "blue-lotus", label: "Blue Lotus" }), "flowers");
  assert.equal(A.offerings.perishableItself({ type: "seasonal", form: "sistrum", label: "Sistrum" }), null);
});

test("the website's cabinet reads the calendars shown and the saved place for the near festivals", async () => {
  const pic = (id) => `../assets/altar/objects/seasonal/${id}/${id}.png`;
  const asked = [];
  const A = core();
  const seasonal = { ...A.seasonal, seasonalNear: (now, choice, calendars) => (asked.push(calendars), A.seasonal.seasonalNear(now, choice, calendars)) };
  const sandbox = {
    location: { search: "" }, dispatchEvent() {}, CustomEvent: class {}, URLSearchParams, console, setTimeout,
    document: { readyState: "complete", addEventListener() {} }, addEventListener() {}, cabinetTabs: null, cabinetContent: null, activeCabinetCategory: "candles",
    localStorage: { getItem: (key) => (key === "sky.place" ? JSON.stringify({ latitude: 19.08, longitude: 72.88, source: "manual" }) : null) },
    SaltSettings: { get: async () => ({ calendar_traditions: "wheel", calendar_extra: "hindu,kemetic" }) },
    SanctuaryAssetCatalog: Catalog,
    AltarArtwork: { ...Artwork, seasonal: { ...Artwork.seasonal, "diya-lamps": pic("diya-lamps") } },
    SaltCore: { altar: { ...A, seasonal } },
  };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("altar/js/features/cabinet.js", "utf8"), sandbox);
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(asked.length, 1);
  assert.equal(asked[0].settings.calendar_extra, "hindu,kemetic");
  assert.deepEqual({ ...asked[0].place }, { latitude: 19.08, longitude: 72.88 });
  assert.ok(sandbox.AltarCabinet.getSearchRecords().some((r) => r.title === "Diya Lamps"));
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
