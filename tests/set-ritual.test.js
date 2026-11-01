const test = require("node:test");
const assert = require("node:assert/strict");

const SR = require("../rituals/js/set-ritual.js");
const L = require("../rituals/js/rituals-logic.js");

const set = { date: "2026-11-07", time: "21:15", hour: "Venus", intent: "love", plannerKey: "love", label: "Love", why: "A waxing moon in Taurus, in Venus’s hour." };

test("a chosen time goes out and comes back through the URL", () => {
  const query = SR.toQuery(set);
  assert.match(query, /setDate=2026-11-07/);
  assert.match(query, /setTime=21%3A15/);
  assert.deepEqual(SR.read(`?${query}&c=our-coven`), set);
  assert.equal(SR.read("?setDate=2026-11-07"), null);
  assert.equal(SR.read("?setDate=7%2F11&setTime=21%3A15"), null);
  assert.equal(SR.toQuery({ date: "2026-11-07", time: "21:15", hour: null }), "setDate=2026-11-07&setTime=21%3A15");
});

test("a plan for the chosen time has the planner's shape, linked to the template", () => {
  const now = new Date("2026-11-01T10:00:00Z");
  const plan = SR.plan({ id: "p1", set, title: "Rose jar", templateId: "t1", now });
  const planner = L.buildPlan({ id: "p1", date: set.date, time: set.time, name: "Rose jar", defaultName: "", intention: { key: "love", label: "Love" }, attach: { kind: "template", id: "t1" }, picked: [], now });
  assert.deepEqual(plan, planner);
  assert.equal(SR.plan({ id: "p2", set, title: " " }).title, "Love working");
  assert.equal(SR.planHref(plan), "/rituals/plan/?id=p1");
});

test("keeping a plan adds it to this browser's plans, unsaved to an account", () => {
  const store = new Map([[SR.PLANS_KEY, JSON.stringify([{ id: "old" }, { id: "p1", title: "Before" }])]]);
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  SR.keep(SR.plan({ id: "p1", set, title: "Rose jar", templateId: "t1" }), storage);
  const plans = JSON.parse(store.get(SR.PLANS_KEY));
  assert.deepEqual(plans.map((p) => p.id), ["old", "p1"]);
  assert.equal(plans[1].title, "Rose jar");
  assert.equal(plans[1].syncedTo, null);
});
