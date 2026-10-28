const test = require("node:test");
const assert = require("node:assert/strict");
const Settings = require("../js/settings-view.js");

test("categorizes every preserved settings family", () => {
  assert.equal(Settings.categoryForName("preferred_name"), "identity");
  assert.equal(Settings.categoryForName("library_traditional_uses"), "library");
  assert.equal(Settings.categoryForName("companion_my_notes"), "companion");
  assert.equal(Settings.categoryForName("living_state_show_status"), "objects");
});

test("category restore preserves settings outside that category", () => {
  const restored = Settings.categoryDefaults({ preferred_name: "Changed", library_myPractice_enabled: false }, "identity", { preferred_name: "", library_myPractice_enabled: true });
  assert.equal(restored.preferred_name, "");
  assert.equal(restored.library_myPractice_enabled, false);
});

test("background options preserve unknown saved values and remove duplicates", () => {
  assert.deepEqual(Settings.backgroundOptions([{ name: "Forest" }, { name: "Forest" }], "Legacy"), ["Legacy", "Forest"]);
});

test("background options use definition names and automatically include future definitions", () => {
  assert.deepEqual(Settings.backgroundOptions([
    { id: "forest-path", name: "Forest Altar", background: "/forest.png" },
    { id: "shelf", name: "Deity Shelf Altar", background: "/shelf.png" },
    { id: "future", name: "Moon Garden", background: "/moon.png" }
  ]), ["Forest Altar", "Deity Shelf Altar", "Moon Garden"]);
  assert.ok(Settings.CATEGORIES.includes("account"));
});

test("stale settings responses are rejected after edits", () => {
  assert.equal(Settings.isStale(1, 2, false), true);
  assert.equal(Settings.isStale(2, 2, true), true);
  assert.equal(Settings.isStale(2, 2, false), false);
});

test("Settings is grouped as the app's: seven groups, with the older panels and links leading to their new homes", () => {
  assert.deepEqual(Settings.GROUPS.map(([name]) => name), ["You", "Your practice", "Screens", "Notifications & reminders", "Accessibility", "Covens & privacy", "Account & data"]);
  assert.equal(Settings.panelOf(Settings.categoryForName("default_altar_background")), "altar");
  assert.equal(Settings.panelOf(Settings.categoryForName("companion_my_notes")), "altar");
  assert.equal(Settings.panelOf(Settings.categoryForName("living_state_show_status")), "altar");
  for (const name of ["appearance", "companion", "objects"]) assert.equal(Settings.panelFor(name), "altar");
  assert.equal(Settings.panelFor("today"), "today");
  assert.equal(Settings.panelFor("reminders"), "notifications");
  assert.equal(Settings.panelFor("nonsense"), null);
  assert.equal(Settings.LABELS.calendar, "Calendars & holidays");
});

test("Today's choices moved out of the calendar panel, with the same keys, and the dream prompt beside them", () => {
  const More = require("../js/settings-more.js");
  const html = More.todayHtml({ today_show: "both", today_draw: false, today_dream_prompt: false });
  assert.match(html, /data-more-chip="todayShow"/);
  assert.match(html, /data-more-chip="todayLayout"/);
  assert.match(html, /data-today-draw\s+\/>/);
  assert.match(html, /data-today-deipnon checked/);
  assert.match(html, /data-today-dream\s+\/>/);
  const source = require("node:fs").readFileSync("js/settings-more.js", "utf8");
  assert.match(source, /save\(\{ today_dream_prompt: t\.checked \}, "today"\)/);
  assert.match(source, /save\(\{ \[G\.calendars\.HEMISPHERE_KEY\]: value \}, "location"\)/);
});
