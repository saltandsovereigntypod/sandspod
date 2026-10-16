// My practice pages, part one (/practice/): the shared kit's pure helpers,
// the devotion reminders calendar file, and the app logic bundle they use.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const kit = require("../practice/practice.js");
const solitary = require("../practice/solitary/solitary.js");

function loadCore() {
  const sandbox = { window: {}, console, TextEncoder, Intl, Date, Math };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  const code = fs.readFileSync(path.join(__dirname, "../js/core/practice-a.js"), "utf8");
  vm.runInContext(code, sandbox);
  return sandbox.SaltCore["practice-a"];
}
const core = loadCore();

function memoryStorage() {
  const map = new Map();
  return { getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, String(v)), removeItem: (k) => map.delete(k) };
}

test("dates: keys read back only when they are real calendar days", () => {
  assert.equal(kit.dateKey(new Date(2026, 9, 6)), "2026-10-06");
  assert.equal(kit.fromKey("2026-02-30"), null);
  assert.equal(kit.fromKey("nonsense"), null);
  assert.equal(kit.fromKey("2024-02-29").getDate(), 29);
  assert.equal(kit.fullDate("2026-10-16"), "October 16, 2026");
  assert.equal(kit.dayMonth("2026-10-16"), "October 16");
  assert.deepEqual(kit.recentDays(new Date(2026, 0, 2), 3), ["2026-01-02", "2026-01-01", "2025-12-31"]);
});

test("typed day: whole dates not in the future only", () => {
  const now = new Date(2026, 9, 16, 12);
  assert.equal(kit.typedDay("2026-10-01", now), "2026-10-01");
  assert.equal(kit.typedDay("2026-10-17", now), null);
  assert.equal(kit.typedDay("2026-10", now), null);
});

test("place: kept rounded in this browser, and rejected when out of range", () => {
  const storage = memoryStorage();
  assert.equal(kit.readPlace(storage), null);
  const saved = kit.savePlace(51.50735, -0.12776, "", storage);
  assert.deepEqual(saved, { latitude: 51.51, longitude: -0.13, source: "manual" });
  assert.deepEqual(kit.readPlace(storage), saved);
  assert.equal(kit.savePlace(120, 0, "", storage), null);
  kit.clearPlace(storage);
  assert.equal(kit.readPlace(storage), null);
});

test("html helpers escape what people write and mark chips pressed", () => {
  assert.equal(kit.esc(`<b>"Nan's" & me</b>`), "&lt;b&gt;&quot;Nan&#39;s&quot; &amp; me&lt;/b&gt;");
  const chip = kit.chip({ label: "Tarot", act: "method", value: "tarot", pressed: true });
  assert.match(chip, /aria-pressed="true"/);
  assert.match(chip, /data-value="tarot"/);
  assert.doesNotMatch(kit.chip({ label: "Plain" }), /button/);
  const row = kit.row({ url: "/practice/green/", title: "Green <3", detail: "Garden" });
  assert.match(row, /href="\/practice\/green\/"/);
  assert.match(row, /Green &lt;3/);
  assert.equal(kit.join(["a", null, "", "b"]), "a · b");
  assert.equal(kit.plural(1, "dream", "dreams"), "1 dream");
});

test("links: premade and Library ids become site addresses", () => {
  assert.equal(kit.href.premade("hedge-ancestor-candle-evening"), "/rituals/premade/?id=hedge-ancestor-candle-evening");
  assert.equal(kit.href.library("traditional:herb:rosemary"), "/grimoire/?entity=traditional%2Fherb%2Frosemary");
  assert.equal(kit.href.tool("green", "plant", "id=x"), "/practice/green/plant/?id=x");
});

test("a guided working reads as before, each step, and the close", () => {
  const draft = core.ancestors.candleDraft({ name: "Nan", relation: "grandmother", born: {}, died: {}, loved: "roses", memory: "" });
  const screens = kit.draftScreens(draft);
  assert.equal(screens[0].kind, "begin");
  assert.equal(screens.at(-1).kind, "close");
  assert.equal(screens.filter((s) => s.kind === "step").length, draft.steps.length);
  const timed = screens.find((s) => s.title === "Remember them");
  assert.equal(timed.seconds, 180);
  assert.match(screens.find((s) => s.title === "Light the candle").spoken, /Nan, my grandmother/);
});

test("devotion reminders: one event a day per nudge, worded as the app's notifications", () => {
  const now = new Date(2026, 9, 16, 8, 0);
  const events = solitary.devotionEvents(core.devotion, { morning: true, morningAt: 7 * 60, evening: true, eveningAt: 21 * 60, days: 3 }, now);
  // Today's 7am has passed, so: tonight, then two more mornings and evenings.
  assert.equal(events.length, 5);
  assert.equal(events[0].title, "Evening devotion");
  assert.equal(events[0].start.getHours(), 21);
  const key = core.devotion.dateKey(events[0].start);
  assert.ok(events[0].notes.startsWith(core.devotion.devotionFor(key).evening.title));
  assert.deepEqual(events[0].alarms, [0]);
  const ics = core.calendarEvent.toIcs(events, now);
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 5);
  assert.match(ics, /UID:devotion-evening-2026-10-16@/);
  assert.equal(solitary.devotionEvents(core.devotion, { morning: false, evening: false, days: 30 }, now).length, 0);
});

test("devotion reminder times read back from the time field", () => {
  assert.equal(solitary.toClock(7 * 60 + 5), "07:05");
  assert.equal(solitary.fromClock("21:30", 0), 21 * 60 + 30);
  assert.equal(solitary.fromClock("25:00", 42), 42);
  const storage = memoryStorage();
  assert.deepEqual(solitary.readReminders(storage), solitary.DEFAULT_REMINDERS);
  solitary.saveReminders(storage, { ...solitary.DEFAULT_REMINDERS, evening: false });
  assert.equal(solitary.readReminders(storage).evening, false);
});

test("the bundle carries the app's practices, collections and My practice choice", () => {
  assert.equal(core.premade.PRACTICES.length, 10);
  assert.deepEqual([...core.premade.myPractices({ my_practice: "hedge, green,nonsense" })], ["green", "hedge"]);
  assert.equal(core.premade.practicesValue(["hedge", "green"]), "green,hedge");
  assert.equal(core.garden.PLANTS, "green.plants");
  assert.equal(core.dreams.DREAMS, "hedge.dreams");
  assert.equal(core.readings.READINGS, "hedge.readings");
  assert.equal(core.ancestors.ANCESTORS, "hedge.ancestors");
  assert.equal(core.correspondences.CORRESPONDENCES, "eclectic.correspondences");
  for (const id of ["green", "kitchen", "hedge", "solitary", "eclectic"]) assert.ok(core.practices.CRAFT_TOOLS[id].length > 0);
});
