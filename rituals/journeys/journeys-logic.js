/*
 * Dedication journeys on the website: the small pure pieces between the
 * app's own logic (window.SaltCore.journeys, built from app/src/lib) and the
 * pages. Where each view lives, the words the app's screens use
 * (components/journeys/parts.tsx), and how a rite begun here is matched to
 * the ritual the altar's Ritual Companion runs. No DOM or storage, so
 * tests/journeys.test.js can run it.
 */
(function (global) {
  "use strict";

  const BASE = "/rituals/journeys/";
  const enc = encodeURIComponent;

  /** Where each view lives (the app's journeyHref, stageHref…), as query strings on one page. */
  const href = {
    home: () => BASE,
    journey: (id) => `${BASE}?id=${enc(id)}`,
    stage: (id, stage) => `${BASE}?id=${enc(id)}&stage=${Number(stage)}`,
    lesson: (id, lessonId) => `${BASE}?id=${enc(id)}&lesson=${enc(lessonId)}`,
    practice: (id, practiceId) => `${BASE}?id=${enc(id)}&practice=${enc(practiceId)}`,
    rite: (id, stage) => `${BASE}?id=${enc(id)}&rite=${Number(stage)}`,
    discern: (id) => `${BASE}?id=${enc(id)}&view=discern`,
    ongoing: (id) => `${BASE}?id=${enc(id)}&view=ongoing`,
    patron: () => `${BASE}patron/`,
    deities: () => "/more/settings/deities/",
    library: (ref) => `/library/entry/?entity=${enc(String(ref || "").replace(/:/g, "/"))}`,
    premade: (id) => `/rituals/premade/?id=${enc(id)}`,
    support: () => "/more/support/",
    ritual: () => "/altar/?ritual=1",
    journal: () => "/rituals/journal/"
  };

  /** Which view a URL asks for. */
  function route(search) {
    const q = new URLSearchParams(search || "");
    const id = q.get("id");
    const num = (name) => {
      const raw = q.get(name);
      return raw !== null && /^\d+$/.test(raw) ? Number(raw) : null;
    };
    if (!id) return { view: "home" };
    if (q.get("lesson")) return { view: "lesson", id, lesson: q.get("lesson") };
    if (q.get("practice")) return { view: "practice", id, practice: q.get("practice") };
    if (num("rite") !== null) return { view: "rite", id, stage: num("rite") };
    if (num("stage") !== null) return { view: "stage", id, stage: num("stage") };
    if (q.get("view") === "discern") return { view: "discern", id };
    if (q.get("view") === "ongoing") return { view: "ongoing", id };
    return { view: "journey", id };
  }

  const STAGE_WORDS = {
    threshold: "Threshold",
    study: "Study",
    practice: "Practice",
    discernment: "Discernment",
    dedication: "Dedication",
    ongoing: "The year after"
  };

  /** "about 3 days", "about 2 weeks", "a year". */
  function lengthWords(days) {
    if (days >= 360) return "a year";
    if (days >= 14 && days % 7 === 0) return `about ${days / 7} weeks`;
    if (days === 1) return "a day";
    return `about ${days} days`;
  }

  function everyWords(every) {
    switch (every) {
      case "day": return "once a day";
      case "week": return "once a week";
      case "month": return "once a month";
      case "esbat": return "at the full moon";
      case "sabbat": return "at the sabbats";
      case "holy-day": return "on the holy days";
      default: return "when you choose";
    }
  }

  const stageIndexOf = (journey, kind) => journey.stages.findIndex((s) => s.kind === kind);

  /** Where a next step leads (parts.tsx stepHref). */
  function stepHref(journey, step) {
    switch (step.kind) {
      case "lesson": return href.lesson(journey.id, step.lesson.id);
      case "practice": return href.practice(journey.id, step.practice.id);
      case "rite": return href.rite(journey.id, stageIndexOf(journey, step.stage.kind));
      case "discern": return href.discern(journey.id);
      case "rededicate": return href.ongoing(journey.id);
      case "advance":
      case "waiting": return href.stage(journey.id, stageIndexOf(journey, step.stage.kind));
      default: return href.journey(journey.id);
    }
  }

  const STEP_ACTION = {
    paused: "Open the journey",
    stopped: "Open the journey",
    lesson: "Read it",
    practice: "Do it today",
    rite: "See the rite",
    discern: "Sit with the questions",
    rededicate: "Rededicate",
    advance: "See what’s next",
    waiting: "Open this stage"
  };

  /** The line under today's step (parts.tsx StepCard). */
  function stepDetail(step, shortDate) {
    switch (step.kind) {
      case "lesson": return `${step.lesson.summary}${step.lesson.minutes ? ` · about ${step.lesson.minutes} min` : ""}`;
      case "practice": return `${step.state.count} of ${step.state.times} done${step.practice.every ? ` · ${everyWords(step.practice.every)}` : ""}`;
      case "rite": return `${step.rite.summary} · about ${step.rite.minutes} min`;
      case "waiting": return "Nothing is asked of you today. Rest is part of it.";
      case "paused": return `Paused since ${shortDate(step.since)}. It waits for you, as long as you like.`;
      default: return "";
    }
  }

  /** Paragraphs separated by blank lines. */
  const paragraphs = (text) => String(text || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  /** "traditional/deity/hekate" → a name to show (the lesson screen's libraryLink). */
  function libraryName(ref, libraryItem) {
    const known = typeof libraryItem === "function" ? libraryItem(ref) : null;
    return known?.name ?? (String(ref).split("/").pop() || String(ref)).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /** Your journeys under way: one per journey, newest first, none set down, none unknown. */
  function journeysUnderWay(entries, status, known) {
    const seen = new Set();
    return entries.filter((e) => {
      const id = e.data.journeyId;
      if (seen.has(id) || status(e.data) === "stopped" || !known(id)) return false;
      seen.add(id);
      return true;
    });
  }

  /** The discernment choices (discern/[journeyId].tsx), any of which is a good one. */
  const CHOICES = [
    {
      kind: "continue",
      title: "Continue to the dedication",
      body: "This feels true, and you’d like to make the promise. The next stage prepares the rite.",
      action: "Continue"
    },
    {
      kind: "pause",
      title: "Pause for now",
      body: "Not yet, or not now. Life is full, or the answer isn’t clear. The journey waits exactly as it is, for as long as you like.",
      action: "Pause"
    },
    {
      kind: "stop",
      title: "Set it down with grace",
      body: "You’ve learned what you came to learn, and a dedication isn’t right. That is a good outcome, not a failure. Give thanks and close it kindly.",
      action: "Set it down"
    },
    {
      kind: "another",
      title: "Choose another path or god",
      body: "Something else has been calling. Everything here stays as it is; you can begin a different journey.",
      action: "Look at other journeys"
    }
  ];

  /** Discernment answers, kept in the journal: each answered question and its answer. */
  function answersText(questions, answers) {
    return questions
      .map((q, i) => (String(answers[String(i)] || "").trim() ? `${q}\n${String(answers[String(i)]).trim()}` : ""))
      .filter(Boolean)
      .join("\n\n");
  }

  // ---------------------------------------------------------------- rites

  /**
   * A rite begun here is started by the altar's Ritual Companion, which makes
   * the session. What we remember is which rite, its title and when; the
   * session is the newest one with that title begun from then on.
   */
  const PENDING_SLACK_MS = 2 * 60 * 1000;
  function matchPendingSession(pending, sessions) {
    if (!pending || !Array.isArray(sessions)) return null;
    const from = Number(pending.at) - PENDING_SLACK_MS;
    const title = String(pending.title || "").trim();
    return (
      sessions
        .filter((s) => s && s.id && String(s.title || "").trim() === title && Date.parse(s.started_at || s.created_at || 0) >= from)
        .sort((a, b) => Date.parse(b.started_at || b.created_at) - Date.parse(a.started_at || a.created_at))[0] || null
    );
  }

  /** Rites begun from a journey that aren't marked done yet: [[stageKind, sessionId]]. */
  function waitingRites(progress) {
    if (!progress) return [];
    return Object.entries(progress.riteSessions || {}).filter(([kind, id]) => id && !(progress.ritesDoneAt || {})[kind]);
  }

  /**
   * When a waiting rite was finished, from its journal entry or its session:
   * an ISO date, or null while it's still going (or never finished).
   */
  function riteFinishedAt(sessionId, { journals = [], sessions = [], activeId = null } = {}) {
    if (!sessionId || sessionId === activeId) return null;
    const journaled = journals.find((j) => j && (j.session_id === sessionId || j.lifecycle_session_id === sessionId));
    if (journaled) return journaled.started_at || journaled.ritual_date || new Date().toISOString();
    const session = sessions.find((s) => s && s.id === sessionId);
    if (session && session.status === "completed") return session.ended_at || session.completed_at || new Date().toISOString();
    return null;
  }

  // ---------------------------------------------------------------- deities

  /** Today as YYYY-MM-DD (deities.tsx today()). */
  function todayKey(now = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  const fold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  /** The My deities search: Library deities not kept yet, and a name in your own words. */
  function deitySearch(library, list, query) {
    const q = fold(String(query || "").trim());
    const kept = new Set(list.filter((d) => d.key).map((d) => d.key));
    const matches = q ? library.filter((d) => !kept.has(d.key) && (fold(d.name).includes(q) || fold(d.pantheon).includes(q))).slice(0, 8) : [];
    const custom = String(query || "").trim() && !library.some((d) => fold(d.name) === q) && !list.some((d) => fold(d.name) === q) ? String(query).trim() : null;
    return { matches, custom };
  }

  /** Every Living Library deity, by name: [{ key, name, pantheon }]. */
  function libraryDeities(traditional) {
    return Object.entries((traditional && traditional.deity) || {})
      .map(([key, record]) => ({ key, name: String(record?.DisplayName || key).replace(/_/g, " "), pantheon: String(record?.Pantheon || "") }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * After a dedication rite (DeityYours.tsx KeepDedicated): what to show for
   * the deity, and the list to save to keep them as Dedicated from that day.
   */
  function keepDedicated(mine, settings, deityRef, name, since) {
    const key = String(deityRef || "").split("/").pop() || "";
    if (!key) return null;
    const list = mine.myDeities(settings);
    const found = mine.findDeity(list, key, name);
    if (found && found.level !== "exploring") return { key, name, kept: true, level: found.level };
    const deity = { key, name, level: "dedicated", since: (found && found.since) || String(since || "").slice(0, 10) };
    if (found && found.note) deity.note = found.note;
    return { key, name, kept: false, value: mine.deitiesValue(mine.withDeity(list, deity)) };
  }

  const api = {
    BASE,
    href,
    route,
    STAGE_WORDS,
    lengthWords,
    everyWords,
    stageIndexOf,
    stepHref,
    STEP_ACTION,
    stepDetail,
    paragraphs,
    libraryName,
    journeysUnderWay,
    CHOICES,
    answersText,
    matchPendingSession,
    waitingRites,
    riteFinishedAt,
    todayKey,
    deitySearch,
    libraryDeities,
    keepDedicated
  };
  global.JourneysLogic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
