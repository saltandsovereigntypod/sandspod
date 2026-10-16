/*
 * Rituals pages: the small pure pieces that sit between the app's own logic
 * (window.SaltCore.rituals, built from app/src/lib) and the website's pages.
 * Nothing here touches the DOM or storage, so tests/rituals.test.js can run it.
 */
(function (global) {
  "use strict";

  const MOON_WORDS = {
    new: "New moon",
    waxing: "Waxing moon",
    full: "Full moon",
    waning: "Waning moon",
    dark: "Dark moon",
    blue: "Blue moon",
    eclipse: "Eclipse"
  };
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /** The planner's quick times, as the app offers them. */
  const TIMES = ["07:00", "12:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:30"];

  /** Where the site keeps things for guests, and the hand-offs between pages. */
  const KEYS = {
    plans: "rituals.plans.v1",
    planDeletes: "rituals.plans.deleted.v1",
    spellDraft: "salt.rituals.spellDraft",
    begin: "saltRitualBegin",
    guestRituals: "saltAndSovereigntyRitualLifecycle:guest",
    myRituals: "saltAndSovereigntyUserRituals",
    savedAltars: "saltAndSovereigntySavedAltars",
    apothecary: "saltAndSovereigntyApothecaryItems",
    customItems: "saltAndSovereigntyCustomCabinetItems"
  };

  /** Where "Begin" goes: the altar's Ritual Companion, which starts what it is handed. */
  const BEGIN_URL = "/altar/?ritual=1&beginRitual=1";

  const timeMinutes = (time) => {
    const [h, m] = String(time || "").split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const timeKey = (minutes) => {
    const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  /** Minutes as typed ("2.5") to whole seconds, or 0 for no timer (lifecycle.minutesToSeconds). */
  function minutesToSeconds(minutes) {
    const raw = String(minutes ?? "").trim();
    const value = Number(raw.replace(",", "."));
    if (!raw || !Number.isFinite(value) || value <= 0) return 0;
    return Math.round(value * 60);
  }

  /**
   * A spell or premade working (the app's TemplateDraft) in the shape the
   * altar's createTemplateRitualSession takes: a template with its steps.
   */
  function draftAsTemplate(draft) {
    const steps = (draft?.steps || []).map((step, index) => {
      const seconds = minutesToSeconds(step.minutes);
      return {
        id: null,
        sort_order: index,
        title: String(step.title || "").trim() || `Step ${index + 1}`,
        instructions: String(step.instructions || "").trim() || null,
        spoken_text: String(step.spoken_text || "").trim() || null,
        duration_seconds: seconds,
        completion_mode: step.completion_mode === "timed" && seconds ? "timed" : "manual",
        actions: Array.isArray(step.actions) ? step.actions : [],
        linked_entities: [],
        metadata: {}
      };
    });
    return {
      id: draft?.id || null,
      title: String(draft?.title || "").trim() || "Untitled Ritual",
      intention: String(draft?.intention || "").trim() || null,
      description: "",
      preparation: String(draft?.preparation || "").trim() || null,
      closing: String(draft?.closing || "").trim() || null,
      linked_altar_id: draft?.linked_altar_id || null,
      estimated_duration_seconds: steps.reduce((sum, s) => sum + (s.duration_seconds || 0), 0),
      settings: {},
      metadata: Array.isArray(draft?.ingredients) && draft.ingredients.length ? { ingredients: draft.ingredients } : {},
      ritual_template_steps: steps
    };
  }

  /**
   * What the Rituals pages hand the altar to begin: one of your templates (by
   * id), a spell or premade working (as a template), or a working of your own.
   */
  function beginHandoff(source, options = {}) {
    const base = {
      version: 1,
      createdAt: options.now ? new Date(options.now).getTime() : Date.now(),
      altarId: options.altarId || null,
      planId: options.planId || null,
      premadeId: options.premadeId || null
    };
    if (source.kind === "template") return { ...base, kind: "template", templateId: source.templateId };
    if (source.kind === "draft") {
      return {
        ...base,
        kind: "draft",
        template: draftAsTemplate(source.draft),
        ingredients: Array.isArray(source.draft?.ingredients) ? source.draft.ingredients : [],
        closing: String(source.draft?.closing || "")
      };
    }
    return { ...base, kind: "free", title: String(source.title || "").trim(), intention: String(source.intention || "").trim() };
  }

  /** "Ritual · 20 min · Green, Kitchen & hearth" (premade/index.tsx premadeDetail). */
  function premadeDetail(p, practiceName) {
    return [p.kind === "spell" ? "Spell" : "Ritual", `${p.minutes} min`, p.practices.map(practiceName).slice(0, 2).join(", ")]
      .filter(Boolean)
      .join(" · ");
  }

  /** "Ritual · about 20 min · Beginner · Alone" */
  function premadeFacts(p) {
    return [
      p.kind === "spell" ? "Spell" : "Ritual",
      `about ${p.minutes} min`,
      p.level === "beginner" ? "Beginner" : "Some experience",
      p.solo ? "Alone" : "With others"
    ].join(" · ");
  }

  /** "Full moon, Friday" for when a working is best. */
  function premadeWhen(p) {
    return [...(p.moon || []).map((m) => MOON_WORDS[m]), p.weekday !== undefined && p.weekday !== null ? WEEKDAYS[p.weekday] : null].filter(Boolean);
  }

  /** "traditional/herb/rosemary" → the Library entry id "traditional:herb:rosemary". */
  const entryIdOf = (ref) => String(ref || "").replace(/\//g, ":");
  /** The Library entry, on its public Library page. */
  const libraryHref = (ref) => `/library/entry/?entity=${encodeURIComponent(entryIdOf(ref))}`;
  /** The app's short ingredient card: "traditional/herb/basil" → "herb.basil". */
  const ingredientHref = (ref) => `/rituals/ingredient/?ref=${encodeURIComponent(String(ref || "").replace(/^traditional\//, "").replace("/", "."))}`;

  /** A plan as the planner saves it (planner.tsx save). */
  function buildPlan(input) {
    const { editing, id, date, time, name, defaultName, intention, template, attach, draft, picked, toCalendar, now } = input;
    return {
      ...(editing || {}),
      id: editing?.id || id,
      date,
      time,
      title: String(name || "").trim() || defaultName,
      intention: intention?.label ?? (template?.intention || draft?.intention || null),
      intentionKey: intention?.key ?? null,
      templateId: attach.kind === "template" ? attach.id : null,
      draft: attach.kind === "draft" ? draft : null,
      ingredients: picked || [],
      createdAt: editing?.createdAt || new Date(now || Date.now()).toISOString(),
      addToCalendar: !!toCalendar
    };
  }

  /** The planner's default name for the working. */
  function planDefaultName({ attach, draft, template, intention }) {
    return (attach.kind === "draft" && draft?.title) || template?.title || (intention ? `${intention.label} working` : "A working");
  }

  /**
   * A guest's journal: entries kept by the Ritual Companion (the lifecycle
   * store, which the app reads too) and the Completed Rituals list, once each.
   */
  function mergeGuestJournal(lifecycleJournals, myRituals) {
    const out = [];
    const ids = new Set();
    const sessions = new Set();
    for (const entry of [...(lifecycleJournals || []), ...(myRituals || [])]) {
      if (!entry || typeof entry !== "object") continue;
      const session = entry.session_id || entry.lifecycle_session_id || null;
      if ((entry.id && ids.has(entry.id)) || (session && sessions.has(session))) continue;
      if (entry.id) ids.add(entry.id);
      if (session) sessions.add(session);
      out.push({ tags: [], metadata: {}, ...entry, title: entry.title || "Untitled Ritual" });
    }
    return out;
  }

  /** A file name for a plan's calendar file (calendarStore.slug). */
  function icsFileName(title) {
    const slug = String(title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ritual";
    return `${slug}.ics`;
  }

  /** "2 moon phases and planned rituals", the home row's detail (index.tsx). */
  function journalCountLabel(count) {
    return `${count} ${count === 1 ? "ritual" : "rituals"}`;
  }

  /**
   * The lit part of a moon disc as an SVG path, for illumination 0–1.
   * Waxing moons are lit on the right, waning on the left.
   */
  function moonPath(illumination, waxing, r = 10, c = 12) {
    const k = Math.max(0, Math.min(1, Number(illumination) || 0));
    if (k <= 0.01) return "";
    const top = `${c} ${c - r}`;
    const bottom = `${c} ${c + r}`;
    const rx = Math.abs(1 - 2 * k) * r;
    const outer = waxing ? 1 : 0;
    // The terminator bulges toward the lit side before half, away from it after.
    const inner = k < 0.5 ? (waxing ? 0 : 1) : waxing ? 1 : 0;
    return `M${top} A${r} ${r} 0 0 ${outer} ${bottom} A${rx.toFixed(2)} ${r} 0 0 ${inner} ${top} Z`;
  }

  const api = {
    MOON_WORDS,
    WEEKDAYS,
    TIMES,
    KEYS,
    BEGIN_URL,
    timeMinutes,
    timeKey,
    minutesToSeconds,
    draftAsTemplate,
    beginHandoff,
    premadeDetail,
    premadeFacts,
    premadeWhen,
    entryIdOf,
    libraryHref,
    ingredientHref,
    buildPlan,
    planDefaultName,
    mergeGuestJournal,
    icsFileName,
    journalCountLabel,
    moonPath
  };
  global.RitualsLogic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
