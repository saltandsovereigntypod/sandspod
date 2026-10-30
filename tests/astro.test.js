// The website's astrology: js/core/astro.js (the app's engine and glossary),
// js/astro-terms.js (tappable terms), the chart and hour wheels, the chart
// vault store, the cosmic pages, and parity with the app's settings.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

function loadAstro() {
  const context = vm.createContext({ console, TextEncoder, TextDecoder, crypto: globalThis.crypto, Intl, Date });
  context.window = context;
  context.globalThis = context;
  vm.runInContext(read("js/core/astro.js"), context);
  return context;
}

/** astro.js and the readings beside it, as the chart pages load them. */
function loadReadings() {
  const context = loadAstro();
  vm.runInContext(read("js/core/astro-readings.js"), context);
  return context;
}

test("the astro bundle casts the same chart as the app", () => {
  const ctx = loadReadings();
  const A = ctx.SaltCore.astro;
  const R = ctx.SaltCore["astro-readings"];
  const chart = A.natal.castChart({ date: "1990-06-15", time: "14:30", utcOffsetMinutes: 60, latitude: 51.5074, longitude: -0.1278 });
  assert.equal(A.natal.positionOf(chart, "Sun").sign, "Gemini");
  assert.equal(A.natal.positionOf(chart, "Ascendant").sign, "Libra");
  assert.equal(chart.houses.system, "placidus");
  assert.ok(A.forecast.transitsTo(chart, new Date("2026-10-30T12:00:00Z")).length > 0);
  assert.ok(R.compose.composeReading(chart).length >= 6);
  assert.ok(R.interpret.houseMeaning(1).name);
  assert.equal(A.glossary.term("void-of-course").term, "Void of course");
  assert.equal(A.time.zoneOffsetAt("America/New_York", new Date("1975-07-01T12:00:00Z")), -240);
});

test("the cities file the website fetches is the app's, and searches", () => {
  const A = loadAstro().SaltCore.astro;
  assert.equal(read("js/core/cities.json"), read("app/src/lib/astro/data/cities.json"));
  const data = JSON.parse(read("js/core/cities.json"));
  assert.equal(A.places.searchPlaces(data, "Reykjavik")[0].zone, "Atlantic/Reykjavik");
});

test("terms become buttons that open the explanation", () => {
  const ctx = loadAstro();
  const listeners = [];
  ctx.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  ctx.document = { addEventListener: (type, fn) => listeners.push([type, fn]), createElement: () => ({}), body: { appendChild() {} } };
  ctx.CustomEvent = class {};
  ctx.dispatchEvent = () => {};
  vm.runInContext(read("js/astro-terms.js"), ctx);
  const html = ctx.SaltAstroTerms.html("Mercury retrograde in Scorpio <b>");
  assert.match(html, /<button type="button" class="astro-term" data-astro-term="mercury"/);
  assert.match(html, /data-astro-term="retrograde"/);
  assert.match(html, /data-astro-term="scorpio"/);
  assert.match(html, /&lt;b&gt;/);
  assert.ok(listeners.some(([t]) => t === "click"));
});

test("the wheels draw buttons for every planet, sign, house and hour", () => {
  const ctx = loadAstro();
  vm.runInContext(read("practice/cosmic/wheel.js"), ctx);
  const A = ctx.SaltCore.astro;
  const chart = A.natal.castChart({ date: "1990-06-15", time: "14:30", utcOffsetMinutes: 60, latitude: 51.5074, longitude: -0.1278 });
  const svg = ctx.SaltAstroWheel.chart(A, chart, { size: 400 });
  assert.equal((svg.match(/data-wheel-sign=/g) || []).length, 12);
  assert.equal((svg.match(/data-wheel-house=/g) || []).length, 12);
  assert.ok((svg.match(/data-wheel-point=/g) || []).length >= 14);
  assert.match(svg, /role="button" tabindex="0"/);
  const hours = A.hours.planetaryHours(new Date("2026-06-21T12:00:00Z"), { latitude: 51.5, longitude: 0 });
  const hsvg = ctx.SaltAstroWheel.hours(A, hours, new Date("2026-06-21T12:00:00Z"));
  assert.equal((hsvg.match(/data-wheel-hour=/g) || []).length, 24);
});

test("the chart store keeps charts encrypted in the browser and merges like the app", async () => {
  const ctx = loadAstro();
  const storage = new Map();
  ctx.localStorage = { getItem: (k) => (storage.has(k) ? storage.get(k) : null), setItem: (k, v) => storage.set(k, String(v)), removeItem: (k) => storage.delete(k) };
  vm.runInContext(read("practice/cosmic/astro-store.js"), ctx);
  const ST = ctx.SaltAstroStore;
  await ST.load(null);
  assert.equal(ST.state.phase, "empty");
  const id = await ST.save({ name: "Me", relation: "me", input: { date: "1990-06-15", time: "14:30", utcOffsetMinutes: 60, latitude: 51.5, longitude: -0.13 } });
  assert.equal(ST.myChart().id, id);
  const stored = storage.get("astroVault.vault.device");
  assert.ok(stored && !stored.includes("1990-06-15"), "the birth date is never stored in plain form");
  await ST.load(null);
  assert.equal(ST.state.phase, "open");
  assert.equal(ST.myChart().input.date, "1990-06-15");
  await ST.remove(id);
  assert.equal(ST.state.data.charts.length, 0);
});

test("astro settings match the app's defaults", () => {
  const web = read("js/my-settings.js");
  const app = read("app/src/lib/settings/defaults.ts");
  for (const [key, value] of [["astro_explanations", "simple"], ["astro_house_system", "placidus"], ["astro_zodiac", "tropical"], ["astro_nodes", "true"], ["astro_orbs", ""]]) {
    assert.match(web, new RegExp(`${key}: "${value}"`));
    assert.match(app, new RegExp(`${key}: '${value}'`));
  }
});

test("the readings are their own bundle, loaded by every page that reads a chart", () => {
  const A = loadAstro().SaltCore.astro;
  // The light bundle (Today, the sky, the planner) has no reading tables.
  assert.equal(A.interpret, undefined);
  assert.equal(A.compose, undefined);
  assert.ok(fs.statSync(path.join(root, "js/core/astro.js")).size < 400 * 1024, "js/core/astro.js stays light");
  for (const file of ["today/today.js", "today/sky/sky.js", "today/holy/holy.js", "rituals/js/planner.js", "js/astro-terms.js", "practice/cosmic/course.js"]) {
    assert.doesNotMatch(read(file), /\b(interpret|compose)\.|astro-readings/, file);
  }
  // cosmic.js reads them only through R(), and only on the chart and synastry views.
  const cosmic = read("practice/cosmic/cosmic.js");
  assert.doesNotMatch(cosmic, /\bA\.(interpret|compose)\b/);
  for (const page of ["chart", "synastry"]) {
    const html = read(path.join("practice/cosmic", page, "index.html"));
    assert.ok(html.indexOf("/js/core/astro-readings.js") > html.indexOf("/js/core/astro.js"), page);
    assert.ok(html.indexOf("/js/core/astro-readings.js") < html.indexOf("/practice/cosmic/cosmic.js"), page);
  }
});

test("chart deities carry their link and put the person's patrons first, as the app does", () => {
  const A = loadAstro().SaltCore.astro;
  for (const g of Object.values(A.guides.PLANET_GUIDES)) for (const d of g.deities) assert.ok(d.link === "ancient" || d.link === "modern", d.name);
  const chart = A.natal.castChart({ date: "1990-06-15", time: "14:30", utcOffsetMinutes: 60, latitude: 51.5074, longitude: -0.1278 });
  assert.equal(A.craftLinks.patronsFromSettings(null).length, 0);
  const patrons = A.craftLinks.patronsFromSettings({ my_deities: JSON.stringify([{ key: "aphrodite", name: "Aphrodite", level: "patron", since: "" }]) });
  const [first] = A.craftLinks.deitiesForChart(chart, patrons);
  assert.equal(first.name, "Aphrodite");
  assert.equal(first.patronLine, "Aphrodite, your patron, links to your chart ruler, Venus.");
  const cosmic = read("practice/cosmic/cosmic.js");
  assert.match(cosmic, /deitiesForChart\(chart, patrons\)/);
  assert.match(cosmic, /patronPlanets\(chart, patrons\)/);
  assert.match(cosmic, /DEITY_LINK_LABEL/);
});

test("the cosmic pages load the astrology and its store", () => {
  for (const page of ["", "charts", "chart", "chart-edit", "synastry", "hours", "planet", "learn", "keep"]) {
    const html = read(path.join("practice/cosmic", page, "index.html"));
    for (const src of ["/js/core/astro.js", "/js/astro-terms.js", "/practice/cosmic/astro-store.js", "/practice/cosmic/wheel.js", "/css/astro.css"]) assert.ok(html.includes(src), `${page}: ${src}`);
  }
});
