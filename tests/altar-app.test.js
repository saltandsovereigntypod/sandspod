// The app's altar on the website: the shared bundle (js/core/altar.js), the
// living art drawn from it, and that the website's own candle lifecycle and
// the app's logic read and keep each other's fields (livingState.candle.*,
// livingState.app, carvings).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join(root, "js/traditional-library.js"), "utf8"));
vm.runInThisContext(fs.readFileSync(path.join(root, "js/core/altar.js"), "utf8"));
const A = global.SaltCore.altar;
const Candle = require("../altar/js/features/candle-lifecycle.js");
const ratios = { "candles/taper/red-taper.png": 1536 / 500 };
global.AltarApp = { ratioOf: (p) => Object.entries(ratios).find(([k]) => String(p).includes(k))?.[1] ?? null };
const LivingArt = require("../altar/js/features/living-art.js");

const HOUR = 3_600_000;
const iso = (t) => new Date(t).toISOString();
const taper = (state = {}, extra = {}) => ({
  type: "candle", form: "taper", color: "red", lit: "false", altarObjectId: "c1",
  imagePath: "../assets/altar/objects/candles/taper/red-taper.png",
  livingState: JSON.stringify({ version: 2, candle: { form: "taper", ...state } }),
  ...extra
});

test("the bundle has every module the altar page uses", () => {
  for (const name of ["livingState", "wax", "flame", "ceromancy", "incense", "offerings", "offeringArt", "petitions", "charge", "moonCharge", "attunement", "story", "devotion", "relationship", "companion", "arrange", "tonight", "cabinet", "editor", "geometry", "altarOptions", "ambient", "colors", "dressing", "spellJar", "sachet", "spells", "scrying", "gratitude", "correspondence", "intention", "reading", "layouts", "tonightExplained", "shareCard", "ancestor", "practice", "history", "moon", "holidays", "ritualLifecycle", "ritualRows"]) {
    assert.ok(A[name], `SaltCore.altar.${name}`);
  }
  assert.equal(typeof A.searchLibrary, "function");
  assert.ok(A.TRADITIONAL_LIBRARY.deity);
});

test("the website's lifecycle keeps the app's carvings and app state through lighting and snuffing", () => {
  const now = Date.parse("2026-10-16T20:00:00Z");
  const carved = A.livingState.carveCandle(taper(), "Courage", iso(now - HOUR));
  const withLog = A.livingState.logAppEvent(carved, { kind: "note", text: "Dressed by moonlight." }, iso(now - HOUR));
  const state = JSON.parse(withLog.livingState);
  const lit = Candle.light(state.candle, now, { form: "taper" }).candle;
  const out = Candle.extinguish(lit, now + HOUR, "manual_extinguish", { form: "taper" }).candle;
  assert.deepEqual(out.carvings.map((c) => c.text), ["Courage"]);
  // The site saves the rest of the state as it is (living-object-state.js mergeState spreads it).
  const saved = { ...state, candle: out };
  const back = { ...withLog, livingState: JSON.stringify(saved), lit: "false" };
  assert.deepEqual(A.livingState.carvingsOf(back).map((c) => c.text), ["Courage"]);
  assert.equal(A.livingState.appHistoryOf(back).at(-1).text, "Dressed by moonlight.");
  assert.equal(A.livingState.candleLife(back, now + HOUR).burnedMs, HOUR);
});

test("a candle the app lit reads the same on the website", () => {
  const now = Date.parse("2026-10-16T20:00:00Z");
  const lit = A.livingState.lightCandle(taper(), iso(now));
  const site = Candle.normalize(JSON.parse(lit.livingState).candle, { form: "taper" });
  assert.equal(site.status, "burning");
  assert.equal(Candle.remainingMs(site, now + 2 * HOUR), 6 * HOUR);
});

test("the living art burns a taper down, with its carving, a melt pool and drips", () => {
  const now = Date.parse("2026-10-16T20:00:00Z");
  const object = A.livingState.carveCandle(
    { ...taper({ currentBurnStartedAt: iso(now - 3 * HOUR), status: "burning", durationLocked: true }), lit: "true" },
    "Luna",
    iso(now - 4 * HOUR)
  );
  const width = 80;
  const height = 211;
  const geo = LivingArt.candleGeometry(object, width, height, now);
  assert.equal(geo.burn.mode, "cap");
  assert.ok(geo.dropPx > 10, "it has burned shorter");
  assert.ok(LivingArt.drawsBurnedDown(geo));
  assert.ok(geo.flame.flameTop > -5, "the flame moves down with the wax");
  const svg = LivingArt.marksSvg(object, width, height, now, "t", geo);
  assert.match(svg, />Luna</);
  assert.match(svg, /url\(#pool-t\)/);
  assert.match(svg, /<path d="M [^"]+ A /, "a drip ends in a bead");
  const picture = LivingArt.burnedPictureHtml("red-taper.png", geo, false);
  assert.equal((picture.match(/living-art__clip/g) || []).length, 2, "the top is kept and set down on the shorter body");
});

test("an unlit, unburned candle has nothing drawn on it", () => {
  const object = taper();
  const geo = LivingArt.candleGeometry(object, 80, 211, Date.now());
  assert.equal(LivingArt.marksSvg(object, 80, 211, Date.now(), "u", geo), "");
  assert.equal(LivingArt.drawsBurnedDown(geo), false);
});

test("tonight's altar and a shrine are built from the app's own builders", () => {
  const night = new Date("2026-10-16T20:00:00Z");
  const tonight = A.tonight.tonightAltar(night, [], A.moon.moonState(night).name);
  assert.ok(tonight.doc.objects.length >= 8);
  assert.match(tonight.reason, /day/);
  const why = A.tonightExplained.explainTonight(tonight, night, null);
  assert.equal(why.length, tonight.doc.objects.length);
  const record = A.TRADITIONAL_LIBRARY.deity.hecate || null;
  const shrine = A.tonight.shrineAltar("hecate", "Hecate", record, night);
  assert.match(shrine.reason, /Hecate/);
});

test("tonight's altar sets out a Hindu or Kemetic festival's thing when that calendar is shown, as the app does", () => {
  const choice = A.holidays.holidayChoice(null);
  const open = (date, extra) => {
    const calendars = { settings: { calendar_extra: extra }, place: null };
    return A.tonight.tonightAltar(date, A.holidays.holidaysToday(date, choice), "x", A.seasonal.festivalsTonight(date, choice, calendars));
  };
  const seasonal = (altar) => altar.doc.objects.filter((o) => o.type === "seasonal").map((o) => o.form);
  const diwali = new Date(2026, 10, 8, 20);
  const lit = open(diwali, "hindu");
  assert.deepEqual(seasonal(lit), ["diya-lamps"]);
  assert.match(lit.reason, /, on Diwali$/);
  assert.ok(A.tonightExplained.explainTonight(lit, diwali, null).some((p) => /kept at Diwali\.$/.test(p.why)));
  assert.deepEqual(seasonal(open(diwali, "")), []);
  assert.deepEqual(seasonal(open(new Date(2026, 6, 31, 20), "kemetic")), ["epagomenal-lamps"]);
  assert.deepEqual(seasonal(open(new Date(2026, 7, 4, 20), "kemetic")), ["hetep-table"]);
});

test("the altar page loads the app's altar after the altar it builds on", () => {
  const html = fs.readFileSync(path.join(root, "altar/index.html"), "utf8");
  const order = ["js/core/storage.js", "../js/core/altar.js", "js/features/app-altar-bridge.js", "js/features/living-art.js", "js/features/altar-living.js", "js/features/altar-workings.js", "js/features/altar-reading.js"].map((src) => html.indexOf(`src="${src}"`));
  order.forEach((at) => assert.ok(at > 0));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(html, /href="app-altar\.css"/);
});

// ── Panels that reach the rest of your practice ──────────────────────────
const Logic = require("../rituals/js/rituals-logic.js");

test("a cleansing done on the altar goes into the stone's own log, once", () => {
  // The record the site's Companion keeps (object-actions.js baseRecord).
  const crystal = {
    type: "crystal", altarObjectId: "s1", label: "Amethyst",
    livingState: JSON.stringify({ version: 2, crystal: { cleansingHistory: [{ occurredAt: "2026-10-15T20:00:00.000Z", methods: ["Moonlight", "Smoke"], purpose: "Routine care" }], chargingHistory: [] } })
  };
  const care = A.altarCare.lastAltarCareOf(crystal);
  assert.equal(care.kind, "cleansed");
  assert.deepEqual(care.methods, ["Moonlight", "Smoke"]);
  const stone = A.stones.normaliseStone({ name: "Amethyst", care: [] });
  const logged = A.practice.stoneCareFromAltar(stone, { ...care, altarName: "Hearth" });
  assert.equal(logged.care.length, 1);
  assert.equal(logged.care[0].at, care.at);
  assert.match(logged.care[0].note || "", /Hearth/);
  assert.equal(A.practice.stoneCareFromAltar(logged, care).care.length, 1, "the same cleansing isn't logged twice");
});

test("an ancestor's candle rite is handed to the Ritual Companion linked to the altar", () => {
  const entry = { id: "a1", data: { name: "Nan", relation: "grandmother", born: { year: 1931, month: 3, day: 2 }, died: { year: 2019, month: 11, day: 1 }, loved: "roses", memory: "" } };
  const draft = A.ancestor.ancestorRite(entry, "altar-1");
  assert.equal(draft.linked_altar_id, "altar-1");
  assert.ok(draft.steps.length > 0);
  const handoff = Logic.beginHandoff({ kind: "draft", draft }, { altarId: "altar-1", now: 5 });
  assert.equal(handoff.kind, "draft");
  assert.equal(handoff.altarId, "altar-1");
  assert.equal(handoff.template.linked_altar_id, "altar-1");
  assert.equal(handoff.template.ritual_template_steps.length, draft.steps.length);
  assert.equal(handoff.closing, String(draft.closing || ""));
});

test("an object can be linked to a page in your Book of Shadows, kept in its own living state", () => {
  const sprig = { type: "herb", label: "Rosemary sprig", altarObjectId: "h1", livingState: "" };
  const snapshot = { sections: [{ id: "sec", title: "Herbs" }], pages: [{ id: "p1", title: "Rosemary", section_id: "sec", page_type: "blank" }, { id: "p2", title: "Moon water", section_id: null, page_type: "blank" }] };
  const choices = A.grimoire.pageChoices(snapshot, "Rosemary sprig");
  assert.equal(choices[0].id, "p1");
  assert.equal(choices[0].suggested, true);
  const linked = A.grimoire.withPageLink(sprig, { id: "p1", title: "Rosemary" }, "2026-10-16T20:00:00.000Z");
  assert.deepEqual(A.grimoire.pageLinkOf(linked), { pageId: "p1", title: "Rosemary" });
  assert.deepEqual(A.grimoire.resolvePageLink(A.grimoire.pageLinkOf(linked), { ...snapshot, pages: [] }), { title: "Rosemary", exists: false });
  assert.equal(A.grimoire.pageLinkOf(A.grimoire.withoutPageLink(linked, "2026-10-16T21:00:00.000Z")), null);
});

test("your own Library notes reach the altar's correspondences", () => {
  // A guest's Library as the website keeps it (js/library.js saltAndSovereigntyLibrary).
  const stored = { entities: { e1: { id: "e1", name: "Hawthorn", type: "herb", myPractice: { Element: "Fire", Planet: "Mars", Uses: "Protection, Heart" } } } };
  const entries = A.buildLibrary(A.guestPracticeRows(stored));
  const c = A.correspondence.objectCorrespondence({ type: "herb", label: "Hawthorn", herb: "hawthorn" }, entries);
  assert.equal(c.element, "Fire");
  assert.equal(c.planet, "Mars");
  assert.ok(c.uses.includes("protection"));
});

test("the altar's sky reads the place saved in this browser", () => {
  const ctx = { console, Map, Set, Promise, JSON, Number, Math, String, Object, Array, URL, CustomEvent: class {} };
  ctx.window = ctx;
  ctx.document = { readyState: "loading", addEventListener() {}, querySelector: () => null };
  ctx.addEventListener = () => {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, "altar/js/features/app-altar-bridge.js"), "utf8"), ctx);
  const store = (values) => ({ getItem: (k) => (k in values ? values[k] : null) });
  assert.deepEqual({ ...ctx.AltarApp.place(store({ "sky.place": JSON.stringify({ latitude: -33.87, longitude: 151.21, source: "manual" }) })) }, { latitude: -33.87, longitude: 151.21, source: "manual" });
  assert.equal(ctx.AltarApp.place(store({ "salt.sky.place": JSON.stringify({ latitude: 51.5, longitude: -0.13 }) })).latitude, 51.5);
  assert.equal(ctx.AltarApp.place(store({ "sky.place": "{bad" })), null);
  assert.equal(ctx.AltarApp.place(store({})), null);
  const south = ctx.AltarApp.place(store({ "sky.place": JSON.stringify({ latitude: -33.87, longitude: 151.21 }) }));
  assert.equal(A.ambient.moonMirrored(south), true);
  assert.ok(A.ambient.ambientAt(new Date("2026-10-16T09:00:00Z"), south).label);
});

test("living offerings: what the app sets out and tends is drawn and kept the same on the website", () => {
  const T0 = Date.parse("2026-10-16T20:00:00Z");
  const DAY = 24 * HOUR;
  const bowl = {
    type: "vessel", vessel: "offering-bowl", altarObjectId: "b1", label: "Offering Bowl",
    imagePath: "../assets/altar/objects/vessels/offering-bowl/offering-bowl.png",
    livingState: JSON.stringify({ version: 1, createdAt: iso(T0) })
  };
  const water = A.offerings.setOffering(bowl, "water", "Moon water", iso(T0));
  // The app's state rides in livingState.app, which the site keeps as it is.
  assert.equal(JSON.parse(water.livingState).app.offering.kind, "water");
  const left = A.offerings.leaveOffering(water, iso(T0 + 2 * DAY));
  assert.equal(JSON.parse(left.livingState).app.offering.leftAt, iso(T0 + 2 * DAY));
  // Drawn: the water lower in the bowl with its tide line, then dried to a ring and a stain.
  const svg = LivingArt.offeringSvg(A.offeringArt.offeringArt(water, 80, 54, T0 + 2 * DAY), 80, 54, "t");
  assert.match(svg, /radialGradient id="liquid-t"/);
  assert.match(svg, /stroke-opacity/);
  const dry = LivingArt.offeringSvg(A.offeringArt.offeringArt(water, 80, 54, T0 + 6 * DAY), 80, 54, "t");
  assert.match(dry, /stain-t/);
  assert.doesNotMatch(dry, /liquid-t/);
  // The gentle note, and quiet once it's left as it is.
  const due = A.offerings.offeringsDue([{ id: "a", name: "Brigid", objects: [water] }], T0 + 2 * DAY);
  assert.equal(A.offerings.tendingNote(due), "The moon water on your Brigid altar is low.");
  assert.deepEqual(A.offerings.offeringsDue([{ id: "a", name: "Brigid", objects: [left] }], T0 + 3 * DAY), []);
});
