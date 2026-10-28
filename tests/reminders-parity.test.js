// The website's Reminders page and the app give the same reminders from the
// same choices: holidays, tending, ritual planning and covens come from the
// app's own plan (js/core/guides.js), saved under the same settings key in
// the same JSON, and turned into calendar events one for one.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

global.window = globalThis;
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/traditional-library.js"), "utf8"));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/core/guides.js"), "utf8"));
const G = globalThis.SaltCore.guides;
const R = require("../reminders/reminders-logic.js");
const P = G.reminderPrefs;

const NOW = new Date(2026, 9, 26, 8, 0);
const legacy = G.schedule.normalizeSettings({ rituals: false, lookBacks: false });
const DEVICE_KINDS = new Set(["moon", "ritual", "devotion", "dream", "lookback"]);

function choices() {
  let prefs = P.normalizePrefs({ holidays: { on: true, leads: [0, 1] } });
  prefs = P.withChange(prefs, "holidays.leadsFor", { "wheel-yule": [7] });
  prefs = P.setHoliday(prefs, "hellenic_monthly", "hellenic_monthly-noumenia", false);
  prefs = P.withChange(prefs, "tending.crystals.on", true);
  prefs = P.withChange(prefs, "tending.plants.on", true);
  prefs = P.withChange(prefs, "tending.altars.on", true);
  prefs = P.withChange(prefs, "tending.altars.weekdays", [0]);
  prefs = P.withChange(prefs, "tending.offerings.refresh", true);
  prefs = P.withChange(prefs, "tending.candles.daily", true);
  prefs = P.withChange(prefs, "planning.holidays", true);
  prefs = P.withChange(prefs, "quiet.on", true);
  prefs = P.withChange(prefs, "quiet.start", 21 * 60);
  prefs = P.withChange(prefs, "quiet.end", 10 * 60);
  return prefs;
}

const appSettings = (prefs) => ({
  calendar_traditions: "wheel,hellenic_monthly",
  calendar_extra: "hindu",
  my_deities: JSON.stringify([{ key: "hekate", name: "Hekate", level: "patron" }]),
  ...R.prefsPatch(prefs, G),
});

const sources = {
  altars: [{ id: "a1", name: "Brigid" }],
  plants: [{ id: "a1:p1", altarId: "a1", altarName: "Brigid", who: "Margaret the pothos", named: true, waterEvery: 7, lastWatered: "2026-10-24", dueAt: new Date(2026, 9, 31).getTime() }],
  offerings: [],
  crystals: [{ id: "stone:1", name: "Selenite", key: "selenite", where: "My stones" }],
  candles: [],
};

const covens = [
  {
    id: "c1",
    slug: "moon-circle",
    name: "Moon Circle",
    leader: true,
    holidays: [{ baseId: "wheel-yule", name: "Yule", date: new Date(2026, 11, 21), days: 1 }],
    rites: [{ ritual: { id: "r1", title: "Full moon rite", status: "scheduled", scheduled_for: new Date(2026, 10, 24, 20).toISOString(), occasion: "full_moon", occasion_name: null }, response: "going" }],
  },
];

test("the same choices make the same reminders in the app and in the calendar file", () => {
  const prefs = choices();
  const settings = appSettings(prefs);
  const app = G.reminderPlan
    .planReminders({ appSettings: settings, legacy, prefs, sources, covens, now: NOW, horizonDays: R.HORIZON.sacred }, { gather: false, cap: Infinity })
    .filter((r) => !DEVICE_KINDS.has(r.kind));
  const web = R.reminderEvents({ settings: legacy, plans: [], appSettings: settings, now: NOW, sources, covens }, G);
  assert.ok(app.length > 40, `${app.length} reminders`);
  assert.deepEqual(web.map((e) => e.key), app.map((r) => `reminder-${r.key}`.replace(/[^a-z0-9-]+/gi, "-")));
  web.forEach((e, i) => {
    assert.equal(e.start.getTime(), app[i].at.getTime(), e.key);
    assert.equal(e.title, app[i].title);
    assert.deepEqual(e.alarms, [0]);
  });
  // Every kind is there: holidays, the Deipnon, sacred days, tending, planning, coven rites.
  const kinds = new Set(web.map((e) => e.kind));
  for (const kind of ["holiday", "deipnon", "sacred", "watering", "altar", "offering", "crystal", "candle", "planning", "coven"]) assert.ok(kinds.has(kind), kind);
  // Quiet hours hold in the file too: nothing between 9 pm and 10 am but a rite (which comes before quiet begins).
  assert.ok(web.every((e) => e.start.getHours() >= 10 && (e.start.getHours() < 21 || (e.start.getHours() === 20 && e.start.getMinutes() === 45))));
  // The file holds them all.
  const ics = G.calendarEvent.toIcs(web, NOW);
  assert.equal(ics.match(/BEGIN:VEVENT/g).length, web.length);
  assert.ok(web.some((e) => /Selenite: moonlight or smoke, and keep it dry\./.test(e.notes)));
});

test("the website saves the same JSON the app saves, under the same key, and reads it back the same", () => {
  const prefs = choices();
  const patch = R.prefsPatch(prefs, G);
  assert.deepEqual(Object.keys(patch), ["reminders_v2"]);
  assert.equal(patch.reminders_v2, P.prefsValue(prefs));
  assert.deepEqual(R.loadPrefs({ ...patch }, legacy, G), prefs);
  // Before anything is saved, both work them out from the older choices the same way.
  const older = { calendar_traditions: "wheel,hellenic_monthly" };
  assert.deepEqual(R.loadPrefs(older, { ...legacy, offerings: true }, G), P.migratePrefs(older, { offerings: true }));
  // The website's settings defaults know the key, as the app's do.
  const mySettings = fs.readFileSync(path.join(__dirname, "../js/my-settings.js"), "utf8");
  assert.match(mySettings, /reminders_v2: ""/);
});

test("the pause empties the whole file, or holds it until the day it ends", () => {
  const moon = G.schedule.normalizeSettings({ phases: { full: true }, rituals: false, lookBacks: false });
  const paused = P.withChange(choices(), "paused", true);
  assert.equal(R.reminderEvents({ settings: moon, plans: [], appSettings: appSettings(paused), now: NOW, sources }, G).length, 0);
  const until = P.withChange(paused, "pausedUntil", "2026-12-01");
  const events = R.reminderEvents({ settings: moon, plans: [], appSettings: appSettings(until), now: NOW, sources }, G);
  assert.ok(events.length > 0);
  assert.ok(events.every((e) => e.start.getTime() >= new Date(2026, 11, 1).getTime()));
});

test("the Reminders page offers the app's choices", () => {
  const page = fs.readFileSync(path.join(__dirname, "../reminders/reminders.js"), "utf8");
  for (const path of ["holidays.on", "holidays.leads", "holidays.at", "tending.plants.on", "tending.plants.mode", "tending.plants.at", "tending.altars.on", "tending.offerings.on", "tending.offerings.lead", "tending.offerings.refresh", "tending.crystals.on", "tending.crystals.cadence", "tending.candles.nearEnd", "tending.candles.relight", "tending.candles.daily", "planning.holidays", "planning.days", "planning.covens", "planning.leaderDays", "quiet.on", "quiet.start", "quiet.end", "bundle.on", "bundle.max"]) {
    assert.ok(page.includes(`"${path}"`), path);
  }
  for (const control of ["data-hol-search", "data-cal-all", "data-hol=", "data-cal=", "data-crystal=", "data-coven=", "data-altar=", "data-pause", "holidays.leadsFor.", "tending.plants.per."]) assert.ok(page.includes(control), control);
  // The pick list is the app's own catalogue.
  const catalog = G.reminderHolidays.holidayCatalog({ calendar_traditions: "wheel,norse", calendar_extra: "kemetic" }, NOW);
  assert.deepEqual(catalog.map((g) => g.id), ["wheel", "norse", "calendar:kemetic"]);
  assert.ok(catalog[0].items.some((i) => i.baseId === "wheel-samhain"));
});

test("tending sources and covens read the same on the website as in the app", () => {
  const altars = G.altarSnapshot.parseLocalAltars(JSON.stringify([{ id: "a1", name: "Brigid", objects: [{ type: "crystal", crystal: "selenite", label: "", altarObjectId: "o1" }] }]));
  const src = G.reminderSources.tendingSources(altars, [{ id: "s1", data: { name: "Rose quartz", key: null } }], NOW);
  assert.deepEqual(src.crystals.map((c) => [c.id, c.name, c.key]), [["a1:o1", "Selenite", "selenite"], ["stone:s1", "Rose quartz", "rose_quartz"]]);
  const standing = { coven: { id: "c1", slug: "s", name: "C", status: "active", founder_id: "me", practice_traditions: ["wheel"] }, membership: { coven_id: "c1", user_id: "me", rank_id: null, status: "active", muted_until: null, joined_at: "" }, ranks: [] };
  const [c] = G.reminderCovens.covenSources([standing], [], "me", NOW);
  assert.equal(c.leader, true);
  assert.equal(G.reminderPlan.covenPlanning(P.normalizePrefs({}), c).days, 14);
});
