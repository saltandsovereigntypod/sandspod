const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");

// A tiny localStorage and window for the page helpers.
function fakeWindow() {
  const data = new Map();
  const events = [];
  return {
    localStorage: {
      getItem: (k) => (data.has(k) ? data.get(k) : null),
      setItem: (k, v) => data.set(k, String(v)),
      removeItem: (k) => data.delete(k)
    },
    dispatchEvent: (e) => events.push(e.type),
    addEventListener() {},
    location: { search: "?id=abc&key=amethyst" },
    events,
    data
  };
}

function loadHelpers(win) {
  const context = vm.createContext({ window: win, CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } }, URLSearchParams, console });
  vm.runInContext(fs.readFileSync(path.join(root, "practice/practice-b.js"), "utf8"), context);
  return win.PracticeB;
}

function loadBundle() {
  const context = vm.createContext({ console });
  context.window = context;
  vm.runInContext(fs.readFileSync(path.join(root, "js/traditional-library.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(root, "js/core/practice-b.js"), "utf8"), context);
  return context.SaltCore["practice-b"];
}

test("the place is validated, rounded to about a kilometre and kept under the shared key", () => {
  const win = fakeWindow();
  const PB = loadHelpers(win);
  assert.equal(PB.PLACE_KEY, "sky.place"); // the app's key, shared with /today/sky/ and the altar
  assert.equal(PB.validPlace(91, 0), false);
  assert.equal(PB.validPlace(-33.8, 151.2), true);
  assert.equal(PB.setManualPlace(200, 0), false);
  assert.equal(PB.getPlace(), null);
  assert.equal(PB.setManualPlace(51.50735, -0.12776), true);
  assert.deepEqual({ ...PB.getPlace() }, { latitude: 51.51, longitude: -0.13, source: "manual" });
  assert.ok(win.events.includes("saltPlaceChanged"));
  PB.clearPlace();
  assert.equal(PB.getPlace(), null);
});

test("a place saved under the practice pages' older key is still found", () => {
  const win = fakeWindow();
  win.data.set("salt.sky.place", JSON.stringify({ latitude: 51.5, longitude: -0.13, source: "manual" }));
  assert.equal(loadHelpers(win).getPlace().latitude, 51.5);
});

test("typed numbers accept commas and the minus sign, and blanks are not zero", () => {
  const PB = loadHelpers(fakeWindow());
  assert.equal(PB.parseNumber("51,5"), 51.5);
  assert.equal(PB.parseNumber(" −0.13 "), -0.13);
  assert.ok(Number.isNaN(PB.parseNumber("")));
  assert.ok(Number.isNaN(PB.parseNumber("north")));
});

test("a broken saved place is ignored rather than trusted", () => {
  const win = fakeWindow();
  win.data.set("salt.sky.place", "{not json");
  assert.equal(loadHelpers(win).getPlace(), null);
  win.data.set("salt.sky.place", JSON.stringify({ latitude: 100, longitude: 0 }));
  assert.equal(loadHelpers(win).getPlace(), null);
});

test("HTML builders escape text and give chips their pressed state", () => {
  const { h } = loadHelpers(fakeWindow());
  assert.equal(h.p("<b>&"), "<p>&lt;b&gt;&amp;</p>");
  assert.match(h.chip("Venus", { pressed: true, attrs: { "data-action": "pick" } }), /aria-pressed="true"[^>]*data-action="pick"/);
  assert.doesNotMatch(h.chip("Badge"), /aria-pressed/);
  assert.match(h.field({ id: "x", label: "Name", value: '"quoted"' }), /<label for="x">Name<\/label><input type="text" id="x" name="x" value="&quot;quoted&quot;" \/>/);
});

test("query strings are read for detail pages", () => {
  const PB = loadHelpers(fakeWindow());
  assert.equal(PB.query("id"), "abc");
  assert.equal(PB.query("missing"), null);
});

test("the bundle carries the app's collection names and logic", () => {
  const B = loadBundle();
  assert.equal(B.cosmicCollections.CHART, "cosmic.chart");
  assert.equal(B.crystalCollections.STONES, "crystal.stones");
  assert.equal(B.crystalCollections.SETTINGS, "crystal.settings");
  assert.equal(B.finds.FINDS, "sea.finds");
  assert.equal(B.lore.LORE, "folk.lore");
  const chart = B.chart.natalChart({ date: "1990-06-15", time: "14:30", utcOffsetMinutes: 60, latitude: 51.51, longitude: -0.13 });
  assert.equal(B.chart.natalOf(chart, "Sun").sign, "Gemini");
  assert.match(B.weather.forecastUrl(51.507, -0.128), /latitude=51\.51&longitude=-0\.13/);
  assert.match(B.tides.predictionsUrl("9413450", "metric", new Date(2026, 9, 16)), /station=9413450/);
});

test("every page loads the bundle, the shared kit and its practice script", () => {
  const pages = [];
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) walk(full);
      else if (d.name === "index.html") pages.push(full);
    });
  for (const practice of ["cosmic", "crystal", "elemental", "sea", "folk"]) walk(path.join(root, "practice", practice));
  assert.equal(pages.length, 28);
  for (const page of pages) {
    const html = fs.readFileSync(page, "utf8");
    const practice = path.relative(path.join(root, "practice"), page).split(path.sep)[0];
    assert.match(html, /\/js\/core\/practice-b\.js/, page);
    assert.match(html, /\/practice\/practice-b\.js/, page);
    assert.match(html, new RegExp(`/practice/${practice}/${practice}\\.js`), page);
    assert.match(html, /data-page-root data-view="[a-z-]+"/, page);
    for (const ref of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) assert.ok(fs.existsSync(path.join(root, ref[1])), `${page}: ${ref[1]}`);
  }
});
