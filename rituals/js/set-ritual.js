/*
 * "Set a ritual for then": the time a page chose (Find a good time,
 * practice/cosmic/timing.js) carried to the builders that make it a real set
 * ritual, as the app does.
 *
 * The time travels in the URL: setDate (YYYY-MM-DD), setTime (HH:MM),
 * setHour (the planetary hour), setIntent (the advisor's intent key),
 * setKey (the planner's intention key), setLabel (the intent's name) and
 * setWhy (the reason the time was chosen). Your template editor at the altar
 * (/altar/?setDate=…) and a coven's ritual builder
 * (/covens/coven/?c=…&tab=rituals&edit=new&setDate=…) read it back.
 *
 * A plan made from it has the planner's shape (rituals/js/rituals-logic.js
 * buildPlan) and is kept in this browser's plans; the plan page sends it on
 * to your account when you're signed in (RitualsStore.loadPlans), as it does
 * any plan not saved there yet.
 */
(function (global) {
  "use strict";

  const PLANS_KEY = "rituals.plans.v1";
  const DATE = /^\d{4}-\d{2}-\d{2}$/;
  const TIME = /^\d{2}:\d{2}$/;
  const FIELDS = { date: "setDate", time: "setTime", hour: "setHour", intent: "setIntent", plannerKey: "setKey", label: "setLabel", why: "setWhy" };

  /** The URL parameters for a chosen time (only those with a value). */
  function toQuery(set) {
    const params = new URLSearchParams();
    for (const [field, name] of Object.entries(FIELDS)) if (set[field]) params.set(name, String(set[field]));
    return params.toString();
  }

  /** The chosen time from a URL's search, or null without a real date and time. */
  function read(search) {
    const params = new URLSearchParams(search || "");
    const set = {};
    for (const [field, name] of Object.entries(FIELDS)) set[field] = params.get(name) || null;
    return set.date && DATE.test(set.date) && set.time && TIME.test(set.time) ? set : null;
  }

  /** "Sat, 7 Nov, 21:00" in the reader's own way of writing dates. */
  function whenText(set) {
    const [y, mo, d] = set.date.split("-").map(Number);
    const [hh, mm] = set.time.split(":").map(Number);
    return new Date(y, mo - 1, d, hh, mm).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  }

  /** A plan for that time, linked to one of your templates (the planner's shape). */
  function plan({ id, set, title, templateId, now = new Date() }) {
    return {
      id,
      date: set.date,
      time: set.time,
      title: String(title || "").trim() || (set.label ? `${set.label} working` : "A working"),
      intention: set.label || null,
      intentionKey: set.plannerKey || null,
      templateId: templateId || null,
      draft: null,
      ingredients: [],
      createdAt: new Date(now).toISOString(),
      addToCalendar: false
    };
  }

  /** Keep the plan in this browser's plans, unsaved to an account as yet. */
  function keep(item, storage = global.localStorage) {
    let plans = [];
    try {
      const parsed = JSON.parse(storage.getItem(PLANS_KEY) || "[]");
      if (Array.isArray(parsed)) plans = parsed;
    } catch {
      plans = [];
    }
    storage.setItem(PLANS_KEY, JSON.stringify([...plans.filter((p) => p && p.id !== item.id), { ...item, syncedTo: null }]));
    return item;
  }

  const newId = () => (global.crypto && global.crypto.randomUUID ? global.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const planHref = (item) => `/rituals/plan/?id=${encodeURIComponent(item.id)}`;

  const api = { toQuery, read, whenText, plan, keep, newId, planHref, PLANS_KEY };
  global.SaltSetRitual = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
