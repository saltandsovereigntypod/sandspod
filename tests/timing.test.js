// The spell timing advisor on the website: the app's scoring, built into
// js/core/timing.js, and the links to it from everywhere that times a working.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function loadTiming() {
  const context = vm.createContext({ console });
  context.window = context;
  vm.runInContext(read("js/core/timing.js"), context);
  return context.SaltCore.timing;
}

test("the bundle scores times as the app does", () => {
  const { timing: X, chart, calendar } = loadTiming();
  assert.ok(calendar.timeOfDay && chart.natalChart);
  const from = new Date(2026, 9, 30, 14, 0);
  const keeping = X.keepingFrom({ calendar_traditions: "wheel" }, from, 30);
  assert.ok(keeping.festivals.some((f) => f.name === "Samhain"));
  const advice = X.adviseTiming(X.timingIntent("ancestors"), { from, days: 30, place: { latitude: 51.51, longitude: -0.13 }, keeping });
  assert.ok(advice.usedHours);
  assert.ok(advice.windows.length > 0);
  assert.ok(advice.windows.some((w) => w.start.getMonth() === 9 && w.start.getDate() === 31), "Samhain is among the best times for ancestor work");
  for (const w of advice.windows) assert.ok(w.score >= 0 && w.score <= 100 && w.why);
  assert.equal(X.anyIntent("prosperity").key, "money");
  assert.match(X.TIMING_FRAMING, /traditional correspondences, not rules/);
  assert.ok(!/!/.test(X.TIMING_FRAMING));
});

test("the page loads the advisor and is a Cosmic & celestial view", () => {
  const html = read("practice/cosmic/timing/index.html");
  for (const src of ["/js/core/timing.js", "/js/core/astro.js", "/practice/cosmic/astro-store.js", "/practice/cosmic/timing.js", "/practice/cosmic/cosmic.js"]) assert.ok(html.includes(src), src);
  assert.ok(html.indexOf("/practice/cosmic/timing.js") < html.indexOf("/practice/cosmic/cosmic.js"));
  assert.match(html, /data-view="cosmic-timing"/);
  assert.match(read("practice/cosmic/cosmic.js"), /"cosmic-timing": \(root, user\) => window\.SaltTiming/);
});

test("everything that times a working links to the advisor, as in the app", () => {
  const web = {
    "practice/hub.js": "/practice/cosmic/timing/",
    "practice/cosmic/cosmic.js": "/practice/cosmic/timing/",
    "rituals/js/planner.js": "/practice/cosmic/timing/",
    "rituals/js/spell.js": "/practice/cosmic/timing/",
    "rituals/js/premade.js": "/practice/cosmic/timing/",
    "rituals/js/plan.js": "/practice/cosmic/timing/",
    "today/sky/sky.js": "/practice/cosmic/timing/"
  };
  for (const [file, href] of Object.entries(web)) assert.ok(read(file).includes(href), file);
  const app = [
    "app/src/app/(tabs)/rituals/craft/index.tsx",
    "app/src/app/(tabs)/rituals/craft/cosmic/index.tsx",
    "app/src/app/(tabs)/rituals/craft/cosmic/hours.tsx",
    "app/src/app/(tabs)/rituals/craft/cosmic/planet.tsx",
    "app/src/app/(tabs)/rituals/planner.tsx",
    "app/src/app/(tabs)/rituals/spell.tsx",
    "app/src/app/(tabs)/rituals/premade/[id].tsx",
    "app/src/app/(tabs)/rituals/plan/[id].tsx",
    "app/src/app/(tabs)/today/sky.tsx"
  ];
  for (const file of app) assert.ok(read(file).includes("/rituals/craft/cosmic/timing"), file);
  // The planners take the chosen time when changing a plan.
  assert.match(read("rituals/js/planner.js"), /begins && !fixedDay/);
  assert.match(read("app/src/app/(tabs)/rituals/planner.tsx"), /start && !fixedDay/);
});
