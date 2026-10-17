const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// The app's logic as the site loads it (js/core/guides.js sets window.SaltCore.guides).
global.window = globalThis;
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/core/guides.js"), "utf8"));
const G = globalThis.SaltCore.guides;
const Notes = require("../help/web-notes.js");
const Reminders = require("../reminders/reminders-logic.js");
const SettingsMore = require("../js/settings-more.js");
if (!global.CustomEvent) global.CustomEvent = class CustomEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } };
const Backup = require("../js/sanctuary-backup.js");
global.SanctuaryBackup = Backup;
const Migration = require("../js/guest-account-migration.js");

function storage(initial = {}) {
  const values = new Map(Object.entries(initial).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    key: (index) => [...values.keys()][index] ?? null,
    get length() { return values.size; }
  };
}

test("the guides bundle carries the app's guides, lines and practices", () => {
  assert.ok(G.closed.CLOSED_TRADITIONS.length > 0);
  assert.ok(G.closed.SOURCING_NOTES.length > 0);
  assert.ok(G.help.HELP.some((section) => section.id === "getting-started"));
  assert.ok(G.support.SUPPORT_LINES.some((line) => line.number === "988"));
  assert.equal(G.PRACTICES.length, 10);
  assert.equal(G.practicesValue(["sea", "green", "nope"]), "green,sea");
  // A website Library reference finds its note, as the app's does.
  assert.equal(G.closed.sourcingForEntry({ traditionalRef: "traditional/herb/sandalwood", name: "Sandalwood" })?.ref, "traditional/herb/sandalwood");
  assert.match(G.closed.correctionUrl({ id: "vodou", name: "Vodou" }), /^mailto:.+subject=Correction%3A%20Vodou/);
});

test("How to: app screens map to the website's pages", () => {
  assert.equal(Notes.siteHref("/rituals/craft/green/moon"), "/practice/green/moon/");
  assert.equal(Notes.siteHref("/rituals/craft"), "/practice/");
  assert.equal(Notes.siteHref("/more/settings/calendar"), "/today/calendar/");
  assert.equal(Notes.siteHref("/more/settings/practice"), "/practice/#choose");
  assert.equal(Notes.siteHref("/more/settings/identity"), "/?sanctuary=settings");
  assert.equal(Notes.siteHref("/today/reminders"), "/reminders/");
  assert.equal(Notes.siteHref("/more/library/closed"), "/library/closed/");
  assert.equal(Notes.siteHref("/today/sky"), "/today/sky/");
  assert.equal(Notes.siteHref("/altar"), "/altar/");
  // Every note belongs to a real topic or section of the app's guide.
  const topics = new Set(G.help.HELP.flatMap((s) => s.topics.map((t) => t.id)));
  Object.keys(Notes.TOPIC_NOTES).forEach((id) => assert.ok(topics.has(id), `unknown topic ${id}`));
  const sections = new Set(G.help.HELP.map((s) => s.id));
  Object.keys(Notes.SECTION_NOTES).forEach((id) => assert.ok(sections.has(id), `unknown section ${id}`));
});

test("moon reminders become all-day events with an alert for each heads-up", () => {
  const now = new Date(2026, 9, 16, 12, 0);
  const settings = G.schedule.normalizeSettings({ phases: { full: true }, phaseHour: 19, phaseMinute: 30, dayBefore: true, daysAhead: [3], atExact: true, notes: { full: "Charge the stones" } });
  const events = Reminders.moonReminderEvents(settings, now, G);
  assert.ok(events.length >= 5 && events.length <= 8, `${events.length} full moons in six months`);
  const first = events[0];
  assert.equal(first.allDay, true);
  assert.match(first.title, /^Full Moon in /);
  assert.match(first.notes, /Charge the stones/);
  assert.ok(first.alarms.includes(19 * 60 + 30));
  assert.ok(first.alarms.includes(19 * 60 + 30 - 1440));
  assert.ok(first.alarms.includes(19 * 60 + 30 - 3 * 1440));
  assert.equal(first.alarms.length, 4);
  const ics = G.calendarEvent.toIcs(events, now);
  assert.match(ics, /BEGIN:VALARM\r\nACTION:DISPLAY/);
  assert.match(ics, /TRIGGER:-PT3150M/);
  assert.equal(Reminders.alarmLabel(-1440 + 19 * 60, true), "The day before, 7:00 pm");
  assert.equal(Reminders.alarmLabel(-60, false), "An hour before");
});

test("planned rituals, devotions and sacred days join the reminders file", () => {
  const now = new Date(2026, 9, 16, 12, 0);
  const plans = [
    { id: "p1", date: "2026-10-31", time: "21:00", title: "Samhain rite", ingredients: [{ name: "Apple" }] },
    { id: "p2", date: "2026-10-01", time: "21:00", title: "Already past", ingredients: [] },
    { id: "p3", date: "2026-11-01", time: "21:00", title: "Done early", ingredients: [], doneAt: "2026-10-10T00:00:00Z" }
  ];
  const settings = G.schedule.normalizeSettings({ rituals: true, ritualLeadMinutes: 180, devotionMorning: true, devotionMorningAt: 420, sacredDays: true });
  const appSettings = { my_deities: JSON.stringify([{ key: "traditional:deity:hekate", name: "Hekate", level: "patron" }]) };
  const events = Reminders.reminderEvents({ settings, plans, appSettings, now }, G);
  const ritual = events.find((e) => e.title === "Samhain rite");
  assert.ok(ritual);
  assert.deepEqual(ritual.alarms, [-180]);
  assert.match(ritual.notes, /Bring: Apple/);
  assert.ok(!events.some((e) => /Already past|Done early/.test(e.title)));
  assert.ok(events.filter((e) => e.title === "Morning devotion").length >= 14);
  for (let i = 1; i < events.length; i += 1) assert.ok(events[i - 1].start <= events[i].start);
  const off = Reminders.reminderEvents({ settings: G.schedule.normalizeSettings({ rituals: false }), plans, appSettings: {}, now }, G);
  assert.equal(off.length, 0);
});

test("reminder and calendar choices keep the app's shapes in this browser", () => {
  const local = storage();
  const settings = Reminders.saveReminders(local, G, Reminders.loadReminders(local, G), { phases: { new: true }, phaseMinute: 7 });
  assert.equal(settings.phases.new, true);
  assert.equal(settings.phaseMinute, 0, "quarter hours only, as in the app");
  assert.equal(JSON.parse(local.getItem("reminders.settings.v1")).version, 1);
  const calendar = Reminders.saveCalendar(local, G, Reminders.loadCalendar(local, G), { astro: false, styles: { moon: { timing: "exact", alert: -15 } } });
  assert.equal(calendar.styles.moon.timing, "exact");
  assert.equal(calendar.styles.moon.alert, -15);
  assert.equal(calendar.styles.holiday.timing, "allDay");
  const now = new Date(2026, 9, 16);
  const sky = Reminders.skyEvents({ calendar, phases: settings.phases, appSettings: { calendar_traditions: "wheel" }, now }, G);
  assert.ok(sky.some((e) => e.key.startsWith("holiday-samhain")));
  assert.ok(!sky.some((e) => e.key.startsWith("astro-")));
  assert.ok(sky.filter((e) => e.key.startsWith("moon-new")).every((e) => e.allDay === false));
});

test("plans come from ritual_plans rows when signed in", () => {
  const rows = [{ id: "a", user_id: "u", planned_date: "2026-10-31", planned_time: "21:00", title: "Rite", intention: null, intention_key: null, template_id: null, draft: null, ingredients: [], done_at: null, created_at: "x", updated_at: "x" }];
  assert.equal(Reminders.plansFrom({ rows }, G)[0].date, "2026-10-31");
  assert.deepEqual(Reminders.plansFrom({ local: [{ id: "b" }, null, { nope: 1 }] }, G).map((p) => p.id), ["b"]);
});

test("Calendar & holidays: hiding a calendar turns it off and drops its picked holidays", () => {
  const changes = SettingsMore.hideChanges({ calendar_traditions: "wheel,christian", calendar_picked_holidays: "christian/christmas,norse/yule", calendar_primary: "christian" }, "christian", true, G.holidays);
  assert.deepEqual(changes, { calendar_hidden_traditions: "christian", calendar_traditions: "wheel", calendar_picked_holidays: "norse/yule", calendar_primary: "" });
  assert.deepEqual(SettingsMore.hideChanges({ calendar_hidden_traditions: "christian" }, "christian", false, G.holidays), { calendar_hidden_traditions: "" });
});

test("Calendar & holidays: your own events are checked as the app checks them", () => {
  assert.equal(SettingsMore.customFromForm({ name: " ", month: "0", day: "1", repeat: "yearly" }).error, "Give the event a name.");
  assert.equal(SettingsMore.customFromForm({ name: "Day", month: "1", day: "30", repeat: "yearly" }).error, "Choose a day from 1 to 29.");
  assert.equal(SettingsMore.customFromForm({ name: "Day", month: "1", day: "29", year: "2027", repeat: "once" }).error, "Choose a day from 1 to 28.");
  const { holiday } = SettingsMore.customFromForm({ name: "Dedication", month: "9", day: "31", year: "2026", repeat: "weekly", meaning: " mine " });
  assert.deepEqual({ ...holiday, id: "x" }, { id: "x", name: "Dedication", month: 9, day: 31, meaning: "mine", year: 2026, repeat: "weekly" });
  assert.equal(SettingsMore.repeatLabel({ ...holiday, repeat: "monthly" }, G.holidays), "the 31st of every month");
  // Saved as the app saves it, and read back by the app's own logic.
  const choice = G.holidays.holidayChoice({ calendar_traditions: "custom", calendar_custom_holidays: JSON.stringify([holiday]) });
  assert.equal(choice.custom[0].name, "Dedication");
});

test("website backups gather craft_entries and ritual_plans, and a guest's own practice entries", async () => {
  assert.ok(Backup.CLOUD_SECTIONS.practice.includes("craft_entries"));
  assert.ok(Backup.CLOUD_SECTIONS.rituals.includes("ritual_plans"));
  assert.ok(Backup.RESTORE_ORDER.indexOf("ritual_plans") > Backup.RESTORE_ORDER.indexOf("ritual_templates"));
  const local = storage({
    "salt.craft.hedge.dreams": [{ id: "d1", createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z", deletedAt: null, data: { text: "A river" } }],
    "salt.craft.empty": [],
    "rituals.plans.v1": [{ id: "p1", date: "2026-10-31", time: "21:00", title: "Samhain" }, { id: "p2", date: "2026-11-01", title: "Theirs", syncedTo: "acct" }],
    other: "not mine"
  });
  const data = Backup.collectGuest(local);
  assert.deepEqual(Object.keys(data.craftEntries), ["hedge.dreams"]);
  assert.deepEqual(data.ritualPlans.map((p) => p.id), ["p1"]);
  const backup = await Backup.createBackup(data, { scope: "guest-browser" });
  assert.equal((await Backup.validateBackup(JSON.stringify(backup))).valid, true);
  // Restoring into an empty browser writes the collection back under its own key.
  const empty = storage();
  const plan = Backup.buildGuestMergePlan((await Backup.validateBackup(JSON.stringify(backup))).backup, empty);
  Backup.applyGuestMergePlan(plan, empty);
  assert.equal(JSON.parse(empty.getItem("salt.craft.hedge.dreams"))[0].id, "d1");
  assert.equal(JSON.parse(empty.getItem("rituals.plans.v1"))[0].id, "p1");
});

test("guest migration moves practice entries and plans as the app stores them", async () => {
  const local = storage({
    saltAndSovereigntyGuestScope: "true",
    "salt.craft.green.plants": [{ id: "garden-1", createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-02T00:00:00Z", deletedAt: null, data: { name: "Rosemary", photo: "data:image/png;base64,AAAA" } }],
    "rituals.plans.v1": [
      { id: "6f1c2f9e-1d2b-4c3a-9b8e-7a6d5c4b3a21", date: "2026-10-31", time: "9pm", title: " Samhain ", templateId: "not-moved", ingredients: [] },
      { id: "no-date", date: "", title: "Someday" }
    ]
  });
  assert.equal(Migration.hasGuestData(local), true);
  const preview = await Migration.createPreview(local);
  assert.equal(preview.counts.practice, 3);
  assert.ok(preview.categories.find((c) => c.id === "practice").selected);
  const { rows, warnings } = await Migration.rowsByTable(preview, ["practice"], "user-1");
  assert.equal(rows.craft_entries.length, 1);
  const craft = rows.craft_entries[0];
  assert.match(craft.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4/);
  assert.equal(craft.collection, "green.plants");
  assert.equal(craft.user_id, "user-1");
  assert.equal(craft.data.photo, "", "browser-only pictures stay behind");
  assert.equal(craft.updated_at, "2026-10-02T00:00:00Z");
  assert.equal(rows.ritual_plans.length, 1, "a plan needs a date and a title");
  const planRow = rows.ritual_plans[0];
  assert.equal(planRow.planned_time, "21:00");
  assert.equal(planRow.title, "Samhain");
  assert.equal(planRow.template_id, null);
  assert.ok(warnings.some((w) => /template stays/.test(w)));
  const database = { from(table) { const b = { select() { return b; }, eq() { return b; }, then(resolve) { return Promise.resolve(resolve({ data: [], error: null })); } }; return b; } };
  const plan = await Migration.buildPlan(preview, ["practice"], database, { id: "user-1" });
  assert.deepEqual(plan.stages.map((s) => s.table), ["ritual_plans", "craft_entries"]);
});
