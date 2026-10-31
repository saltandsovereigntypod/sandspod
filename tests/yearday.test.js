// A Year and a Day on the website (/rituals/year/): its views, its calendar
// file, Today's card, and the app's logic bundle they use (js/core/yearday.js).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const year = require("../rituals/year/year.js");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

function loadCore() {
  const sandbox = { window: {}, console, TextEncoder, Intl, Date, Math };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(read("js/core/yearday.js"), sandbox);
  return sandbox.SaltCore.yearday;
}
const core = loadCore();
const Y = core.year;

test("the website's views are the app's screens, as query strings", () => {
  assert.deepEqual(year.route(""), { view: "home" });
  assert.deepEqual(year.route("?moon=3"), { view: "moon", moon: 3 });
  assert.deepEqual(year.route("?lesson=core-energy-body-scan&moon=2"), { view: "lesson", lesson: "core-energy-body-scan", moon: 2 });
  assert.deepEqual(year.route("?view=day"), { view: "day" });
  assert.equal(year.href.rite("path-wheel", Y.DEDICATION_STAGE), "/rituals/journeys/?id=path-wheel&rite=4");
});

test("the bundle carries the app's plan, schedule and progress", () => {
  assert.equal(Y.MOONS.length, 13);
  const s = Y.yearSchedule("2026-11-09");
  assert.equal(s.day, "2027-11-10");
  const p = Y.newYear("norse", "2026-11-09", new Date(2026, 10, 1));
  assert.match(Y.todayLine(p, s.windows[2].start).line, /^Moon 3 of 13/);
  assert.equal(core.courseLinkSiteHref({ kind: "page", id: "year-and-a-day" }), "/rituals/year/");
  assert.equal(core.courseLinkSiteHref({ kind: "page", id: "timing" }), "/practice/cosmic/timing/");
  assert.match(core.lessonHtml("## A heading\n\nWords."), /A heading.*<p>Words/);
});

test("the reminders calendar file has the year's notes, opening the website's pages", () => {
  const p = Y.newYear("eclectic", "2026-11-09", new Date(2026, 10, 1));
  const events = year.reminderEvents(Y, p, new Date(2026, 10, 1));
  assert.equal(events.filter((e) => /begins:/.test(e.title)).length, 13);
  assert.ok(events.every((e) => /^[\w.-]+$/.test(e.key) && e.alarms[0] === 0));
  assert.ok(events.some((e) => e.notes.includes("/rituals/year/?moon=1")));
  assert.ok(events.some((e) => e.notes.includes("/rituals/year/?view=day")));
  const ics = core.toIcs(events, new Date(2026, 10, 1));
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, events.length);
});

test("the page, Today's card and the links into it are in place", () => {
  const page = read("rituals/year/index.html");
  for (const src of ["/js/core/yearday.js", "/practice/practice.js", "/rituals/year/year.js", "/js/salt-store.js"]) assert.ok(page.includes(src), src);
  assert.ok(read("today/index.html").includes("/today/year-today.js"));
  assert.ok(read("today/today.js").includes("data-year-today"));
  for (const file of ["rituals/js/home.js", "rituals/journeys/journeys.js", "practice/solitary/solitary.js", "grimoire/index.html", "js/settings-more.js"]) assert.ok(read(file).includes("/rituals/year/"), file);
});
