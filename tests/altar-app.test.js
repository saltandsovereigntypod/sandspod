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
  for (const name of ["livingState", "wax", "flame", "ceromancy", "incense", "offerings", "petitions", "charge", "moonCharge", "attunement", "story", "devotion", "relationship", "companion", "arrange", "tonight", "cabinet", "editor", "geometry", "altarOptions", "ambient", "colors", "dressing", "spellJar", "sachet", "spells", "scrying", "gratitude", "correspondence", "intention", "reading", "layouts", "tonightExplained", "shareCard", "ancestor", "practice", "history", "moon", "holidays", "ritualLifecycle", "ritualRows"]) {
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

test("the altar page loads the app's altar after the altar it builds on", () => {
  const html = fs.readFileSync(path.join(root, "altar/index.html"), "utf8");
  const order = ["js/core/storage.js", "../js/core/altar.js", "js/features/app-altar-bridge.js", "js/features/living-art.js", "js/features/altar-living.js", "js/features/altar-workings.js", "js/features/altar-reading.js"].map((src) => html.indexOf(`src="${src}"`));
  order.forEach((at) => assert.ok(at > 0));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(html, /href="app-altar\.css"/);
});
