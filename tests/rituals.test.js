const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const L = require("../rituals/js/rituals-logic.js");

// The app's own logic, as the pages load it (js/core/rituals.js).
const sandbox = { window: {}, TextEncoder, Intl, crypto: globalThis.crypto };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/traditional-library.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/core/rituals.js"), "utf8"), sandbox);
const R = sandbox.SaltCore.rituals;
// Objects made in the sandbox have its prototypes; compare them as plain data.
const plain = (value) => JSON.parse(JSON.stringify(value));

test("a premade working becomes a template the altar can begin", () => {
  const premade = R.premade.PREMADE.find((p) => p.steps.some((s) => s.minutes && s.timed)) || R.premade.PREMADE[0];
  const draft = R.premade.premadeDraft(premade);
  const template = L.draftAsTemplate(draft);
  assert.equal(template.id, null);
  assert.equal(template.title, premade.title);
  assert.equal(template.ritual_template_steps.length, premade.steps.length);
  template.ritual_template_steps.forEach((step, index) => {
    assert.equal(step.sort_order, index);
    assert.equal(step.title, premade.steps[index].title);
    assert.equal(step.duration_seconds, (premade.steps[index].minutes || 0) * 60);
    assert.equal(step.completion_mode, premade.steps[index].timed && premade.steps[index].minutes ? "timed" : "manual");
  });
  assert.equal(
    template.estimated_duration_seconds,
    premade.steps.reduce((sum, s) => sum + (s.minutes || 0) * 60, 0)
  );
});

test("a spell keeps its candle actions and ingredients for the altar", () => {
  const love = R.planner.intentionByKey("love");
  const picks = R.planner.suggestIngredients(love);
  const ingredients = [...picks.candle, ...picks.herb].map(R.spell.toIngredient);
  const draft = R.spell.buildSpell({ name: "", intention: love, purpose: "", petition: "Come home", ingredients, focusMinutes: "10" });
  const handoff = L.beginHandoff({ kind: "draft", draft }, { now: 1000, planId: "p1" });
  assert.equal(handoff.kind, "draft");
  assert.equal(handoff.planId, "p1");
  assert.equal(handoff.createdAt, 1000);
  assert.deepEqual(plain(handoff.ingredients), plain(ingredients));
  const steps = handoff.template.ritual_template_steps;
  assert.deepEqual(plain(steps.find((s) => s.title === "Light the flame and speak").actions), [{ type: "light_all", when: "start" }]);
  assert.equal(steps.find((s) => s.title === "Light the flame and speak").spoken_text, "Come home");
  const sit = steps.find((s) => s.title === "Sit with the working");
  assert.equal(sit.duration_seconds, 600);
  assert.equal(sit.completion_mode, "timed");
});

test("hand-offs for a template and a working of your own", () => {
  assert.deepEqual(
    { ...L.beginHandoff({ kind: "template", templateId: "t1" }, { now: 5, altarId: "a1" }) },
    { version: 1, createdAt: 5, altarId: "a1", planId: null, premadeId: null, kind: "template", templateId: "t1" }
  );
  const free = L.beginHandoff({ kind: "free", title: " Full moon ", intention: "" }, { now: 5 });
  assert.equal(free.kind, "free");
  assert.equal(free.title, "Full moon");
});

test("the planner saves plans in the app's shape, and they sync to ritual_plans", () => {
  const intention = R.planner.intentionByKey("protection");
  const attach = { kind: "none" };
  const name = L.planDefaultName({ attach, draft: null, template: null, intention });
  assert.equal(name, "Protection working");
  const plan = L.buildPlan({
    editing: null,
    id: "11111111-1111-4111-8111-111111111111",
    date: "2026-10-24",
    time: "21:00",
    name: "",
    defaultName: name,
    intention,
    template: null,
    attach,
    draft: null,
    picked: [{ ref: "traditional/herb/rosemary", name: "Rosemary", type: "herb" }],
    toCalendar: true,
    now: new Date("2026-10-16T12:00:00Z")
  });
  assert.equal(plan.title, "Protection working");
  assert.equal(plan.intentionKey, "protection");
  assert.equal(plan.addToCalendar, true);
  const row = R.planSync.planRow(plan, "user-1", new Date("2026-10-16T12:00:00Z"));
  assert.equal(row.planned_date, "2026-10-24");
  assert.equal(row.planned_time, "21:00");
  assert.equal(row.intention, "Protection");
  assert.deepEqual(plain(R.planSync.planFromRow(row).ingredients), plan.ingredients);
});

test("changing a plan keeps its id and when it was made", () => {
  const editing = { id: "keep", createdAt: "2026-01-01T00:00:00.000Z", syncedTo: "user-1", title: "Old" };
  const plan = L.buildPlan({
    editing,
    id: "new",
    date: "2026-11-01",
    time: "07:00",
    name: "Dawn",
    defaultName: "x",
    intention: null,
    template: { id: "t", intention: "From the template" },
    attach: { kind: "template", id: "t" },
    draft: null,
    picked: [],
    toCalendar: false
  });
  assert.equal(plan.id, "keep");
  assert.equal(plan.createdAt, editing.createdAt);
  assert.equal(plan.templateId, "t");
  assert.equal(plan.intention, "From the template");
});

test("a guest journal counts each ritual once", () => {
  const merged = L.mergeGuestJournal(
    [{ id: "j1", session_id: "s1", title: "Moon" }],
    [
      { id: "j1", title: "Moon" },
      { id: "j2", lifecycle_session_id: "s1", title: "Moon again" },
      { id: "j3", title: "" },
      null
    ]
  );
  assert.deepEqual(merged.map((e) => e.id), ["j1", "j3"]);
  assert.equal(merged[1].title, "Untitled Ritual");
});

test("premade wording matches the app", () => {
  const p = { kind: "spell", minutes: 15, practices: ["green", "kitchen", "hedge"], level: "beginner", solo: true, moon: ["full", "dark"], weekday: 5 };
  assert.equal(L.premadeDetail(p, R.premade.practiceName), "Spell · 15 min · Green, Kitchen & hearth");
  assert.equal(L.premadeFacts(p), "Spell · about 15 min · Beginner · Alone");
  assert.deepEqual(L.premadeWhen(p), ["Full moon", "Dark moon", "Friday"]);
});

test("links to the Library and ingredient cards", () => {
  assert.equal(L.libraryHref("traditional/herb/rosemary"), "/library/entry/?entity=traditional%3Aherb%3Arosemary");
  assert.equal(L.ingredientHref("traditional/herb/rosemary"), "/rituals/ingredient/?ref=herb.rosemary");
  assert.equal(R.format.paramToRef("herb.rosemary"), "traditional/herb/rosemary");
});

test("times and calendar file names", () => {
  assert.equal(L.timeKey(L.timeMinutes("23:30") + 45), "00:15");
  assert.equal(L.minutesToSeconds("2,5"), 150);
  assert.equal(L.minutesToSeconds(""), 0);
  assert.equal(L.icsFileName("Full Moon: Release!"), "full-moon-release.ics");
  assert.equal(L.icsFileName("✨"), "ritual.ics");
});

test("a plan's calendar event and Google link", () => {
  const plan = {
    id: "p1",
    date: "2026-10-24",
    time: "21:00",
    title: "Protection working",
    intention: "Protection",
    intentionKey: "protection",
    templateId: null,
    draft: null,
    ingredients: [{ ref: "traditional/herb/rosemary", name: "Rosemary", type: "herb" }],
    createdAt: "2026-10-16T00:00:00Z"
  };
  const event = R.calendarEvent.planEvent(plan, null);
  const ics = R.calendarEvent.toIcs([event], new Date("2026-10-16T00:00:00Z"));
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /SUMMARY:Protection working/);
  assert.match(ics, /UID:plan-p1@/);
  assert.match(R.calendarEvent.googleCalendarUrl(event), /^https:\/\/calendar\.google\.com\/calendar\/render\?action=TEMPLATE&text=Protection%20working/);
});

test("moon discs light the right side", () => {
  assert.equal(L.moonPath(0, true), "");
  assert.match(L.moonPath(0.25, true), / 0 0 1 12 22 /);
  assert.match(L.moonPath(0.25, false), / 0 0 0 12 22 /);
});
