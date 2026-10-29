// The coven's moon calendar on the website, level with the app: the app's own
// rules (lib/covens/moonCalendar.ts and lib/calendars, through
// js/core/covens.js and js/core/today.js), the page that shows and sets it,
// and the migration.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

process.env.TZ = "UTC";
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/core/covens.js"));
const M = global.SaltCore.covens.moonCalendar;
const K = global.SaltCore.covens.calendars;

test("the website reads the coven's calendar as the app does, and follows the Attic new year", () => {
  const coven = { id: "c1", name: "Oak", practice_calendars: ["attic"], moon_calendar: { calendar_count_by: "moon", calendar_opt_moon_yearStart: "attic", calendar_opt_moon_names: "attic" } };
  assert.ok(M.covenFollowsLines(coven).includes("The year begins at the first new moon after the summer solstice (Attic)."));
  assert.equal(M.covenMoonLine(coven, new Date(2026, 6, 20, 12), null), "Hekatombaion · day 7");
  // Missing column (before the migration): nothing set.
  assert.deepEqual(M.covenFollowsLines({ id: "c1", moon_calendar: undefined }), []);
  const mine = { calendar_count_by: "standard" };
  const taken = { ...mine, ...M.takeCovenCalendar(mine, coven) };
  assert.equal(K.leadLine(new Date(2026, 6, 20, 12), taken, null), "Hekatombaion · day 7");
  assert.equal({ ...taken, ...M.restoreMyCalendar(taken) }.calendar_count_by, "standard");
});

test("Settings offers following a calendar only while it is shown, on the website too", () => {
  const year = (settings) => K.choiceViews(settings, "moon").find((c) => c.key === "yearStart");
  assert.ok(year({ calendar_extra: "attic" }).options.some((o) => o.value === "attic"));
  assert.ok(!year({}).options.some((o) => o.value === "attic"));
  assert.match(year({}).hint, /Also show/);
  assert.match(read("js/settings-more.js"), /K\.choiceViews\(settings, def\.id\)/);
  const today = read("js/core/today.js");
  assert.ok(today.includes("As the Attic calendar"), "Today's bundle carries the new choices");
});

test("the coven page shows and sets it, and the migration is additive", () => {
  const html = read("covens/coven/index.html");
  for (const src of ["/js/my-settings.js", "/covens/coven/moon-calendar.js"]) assert.ok(html.includes(`src="${src}"`), src);
  assert.ok(html.indexOf("/js/core/covens.js") < html.indexOf("/covens/coven/moon-calendar.js"));
  const page = read("covens/coven/moon-calendar.js");
  for (const needle of ["What the coven follows", "Use the coven’s calendar for my own", "Keep my own", "Put back my own calendar", "Update mine", "Save how the coven counts", "saveMySettings"]) assert.ok(page.includes(needle), needle);
  assert.match(read("covens/coven/coven.js"), /CovenMoonCalendar\?\.card/);
  assert.match(read("covens/coven/manage.js"), /CovenMoonCalendar\?\.form/);
  assert.match(read("covens/coven-data.js"), /select\("moon_calendar"\)/);
  const sql = read("supabase/migrations/20261114000000_coven_moon_calendar.sql");
  assert.match(sql, /add column if not exists moon_calendar jsonb not null default '\{\}'::jsonb/);
  assert.match(sql, /jsonb_typeof\(moon_calendar\) = 'object'/);
  assert.match(sql, /moon_calendar = src\.moon_calendar/);
});
