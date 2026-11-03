/*
 * Meditation (/practice/meditation/…): the timer with its bells, breath
 * pacing, the log of sits and their patterns, as the app's
 * rituals/craft/meditation/ screens. One script for every page; the page's
 * data-view says which (home, sit, breath, log, patterns). The logic is the
 * app's own (js/core/meditation.js). Sits are craft_entries
 * (meditation.sits) through SaltCraft, so they're the same in the app.
 * The time is read from when the sit began, so it stays true when the tab
 * is hidden. The bell is the altar bell's chime (/assets/sounds/bell-chime.mp3),
 * under Candle sounds and Vibration in Accessibility. A finished sit marks
 * done the To tend things you asked to "Count my meditations". A sit kept in
 * the Grimoire is written as the app's saveHolyPage writes it.
 */
(function (global) {
  "use strict";
  const kit = global.PracticeKit;
  const M = global.SaltCore && global.SaltCore.meditation;
  const root = kit && kit.root();
  if (!kit || !root) return;
  if (!M) {
    root.innerHTML = '<p class="sp-notice">This page could not load. Check your connection and refresh the page.</p>';
    return;
  }
  const { timer: T, log: L, patterns: P } = M;
  const esc = kit.esc;
  const view = root.dataset.view || "home";
  const params = new URLSearchParams(global.location.search);
  const BASE = "/practice/meditation/";
  const url = (path, query) => {
    const q = new URLSearchParams(Object.entries(query || {}).filter(([, v]) => v !== undefined && v !== null && v !== ""));
    return `${BASE}${path ? `${path}/` : ""}${q.toString() ? `?${q}` : ""}`;
  };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const PLAN_KEY = "meditation.plan";

  const state = { user: null, sits: [], ready: false, plan: readPlan(), custom: "", draft: null, message: "", keep: false, kept: null, breathId: "box", custom478: null, done: null, marked: 0 };

  function readPlan() {
    try {
      return T.cleanPlan(JSON.parse(global.localStorage.getItem(PLAN_KEY) || "{}"));
    } catch {
      return T.cleanPlan({});
    }
  }
  function savePlan() {
    try {
      global.localStorage.setItem(PLAN_KEY, JSON.stringify(state.plan));
    } catch {
      /* kept for this visit only */
    }
  }

  async function load() {
    const rows = await kit.entries(L.SITS);
    state.sits = rows.map((e) => ({ id: e.id, data: L.normalizeSit(e.data) })).sort((a, b) => b.data.at.localeCompare(a.data.at));
    state.ready = true;
  }

  // ── Bells ──────────────────────────────────────────────────────────────
  const prefs = () => global.SaltAccessibility?.getState?.() || { candleSounds: true, haptics: true };
  const players = [];
  let next = 0;
  function chime() {
    try {
      const i = next++ % 3;
      if (!players[i]) players[i] = new Audio("/assets/sounds/bell-chime.mp3");
      players[i].volume = 0.8;
      players[i].currentTime = 0;
      void players[i].play()?.catch?.(() => {});
    } catch {
      /* a bell that can't sound is simply not heard */
    }
  }
  function ring(times, plan) {
    const { candleSounds, haptics } = prefs();
    for (let i = 0; i < times; i++) {
      setTimeout(() => {
        if (plan.signal === "bell" && candleSounds) chime();
        if (haptics && typeof navigator.vibrate === "function") {
          try {
            navigator.vibrate(plan.signal === "vibrate" ? 400 : 12);
          } catch {
            /* no vibration here */
          }
        }
      }, i * 2600);
    }
  }

  // ── Plan form ──────────────────────────────────────────────────────────
  function planHtml(plan, { brief = false } = {}) {
    const lengths = T.LENGTHS.map((m) => kit.chip({ label: `${m} min`, act: "minutes", value: m, pressed: plan.minutes === m && !state.custom }));
    lengths.push(kit.chip({ label: "Open-ended", act: "minutes", value: "open", pressed: plan.minutes === null }));
    const mins = (act, value) => T.SETTLE_CHOICES.map((m) => kit.chip({ label: m ? `${m} min` : "None", act, value: m, pressed: value === m }));
    return `${kit.muted("How long")}${kit.chips(lengths, "How long")}${kit.field({ id: "md-custom", label: "Or your own length, in minutes", value: state.custom, input: "custom", inputmode: "numeric" })}${
      brief ? "" : `${kit.muted("Settle in first")}${kit.chips(mins("settle", plan.settle), "Settle in first")}${kit.muted("Come back slowly after")}${kit.chips(mins("warm", plan.warm), "Come back slowly after")}`
    }${kit.toggle({ id: "md-start-bell", label: "A bell to begin", checked: plan.startBell, change: "startBell" })}${kit.toggle({ id: "md-end-bell", label: "Three bells to end", checked: plan.endBell, change: "endBell" })}${kit.muted(
      "A bell along the way"
    )}${kit.chips(
      T.INTERVAL_CHOICES.map((m) => kit.chip({ label: m ? `Every ${m} min` : "None", act: "every", value: m, pressed: plan.every === m })),
      "A bell along the way"
    )}${kit.toggle({
      id: "md-vibrate",
      label: "Vibrate instead of a bell",
      detail: "Where the browser can. Candle sounds and Vibration in Accessibility still apply.",
      checked: plan.signal === "vibrate",
      change: "signal"
    })}`;
  }
  const planHandlers = {
    minutes(el) {
      state.custom = "";
      state.plan = { ...state.plan, minutes: el.dataset.value === "open" ? null : Number(el.dataset.value) };
      savePlan();
      draw();
    },
    custom(el) {
      state.custom = el.value;
      const n = T.cleanPlan({ minutes: el.value }).minutes;
      if (el.value.trim() && String(n) === el.value.trim()) {
        state.plan = { ...state.plan, minutes: n };
        savePlan();
        const line = root.querySelector("[data-plan-line]");
        if (line) line.textContent = T.planLine(state.plan);
      }
    },
    settle(el) {
      state.plan = { ...state.plan, settle: Number(el.dataset.value) };
      savePlan();
      draw();
    },
    warm(el) {
      state.plan = { ...state.plan, warm: Number(el.dataset.value) };
      savePlan();
      draw();
    },
    every(el) {
      state.plan = { ...state.plan, every: Number(el.dataset.value) };
      savePlan();
      draw();
    },
    startBell(el) {
      state.plan = { ...state.plan, startBell: el.checked };
      savePlan();
      draw();
    },
    endBell(el) {
      state.plan = { ...state.plan, endBell: el.checked };
      savePlan();
      draw();
    },
    signal(el) {
      state.plan = { ...state.plan, signal: el.checked ? "vibrate" : "bell" };
      savePlan();
      draw();
    }
  };

  // ── Home ───────────────────────────────────────────────────────────────
  function homeHtml() {
    const stats = P.sitStats(state.sits, new Date());
    const summary = state.sits.length
      ? kit.card(kit.p([stats.streak.current > 1 ? `${stats.streak.current} days in a row` : null, `${P.minutesWords(stats.minutes.week)} this week`, `${P.minutesWords(stats.minutes.month)} this month`].filter(Boolean).join(" · ")))
      : "";
    const sits = !state.ready
      ? kit.muted("Opening…")
      : state.sits.length
        ? kit.list(state.sits.slice(0, 30).map((s) => kit.row({ url: url("log", { id: s.id }), title: L.kindLabel(s.data), detail: `${L.sitLine(s.data)}${s.data.settled ? ` · settled ${s.data.settled} of 5` : ""}` })))
        : kit.muted("None yet. When you finish a sit, you can note how it went here.");
    return `${kit.back("/practice/", "Craft")}${kit.head({ eyebrow: "Craft", title: "Meditation", lede: "A timer with gentle bells, breath pacing, and a log of your sits: how settled you felt and what came up. Private to you, and kept with your account when you’re signed in." })}
      ${summary}
      ${kit.section("Sit", kit.card(`${planHtml(state.plan)}<p class="sp-muted" data-plan-line>${esc(T.planLine(state.plan))}</p>${kit.actions([kit.button({ label: "Begin", act: "begin", primary: true })])}`))}
      ${kit.section(
        "More ways in",
        kit.list([
          kit.row({ url: url("breath"), title: "Breath pacing", detail: "A circle to breathe with: box breathing, 4-7-8 or your own count" }),
          kit.row({ url: url("log"), title: "Log a sit", detail: "One you sat without the timer" }),
          kit.row({ url: "/altar/", title: "Meditate at your altar", detail: "Open an altar, then Workings → Meditate here" }),
          kit.row({ url: "/rituals/together/?sit=1", title: "Sit together", detail: "With your coven or friends: everyone’s timer starts at once" }),
          kit.row({ url: "/reminders/#gd-meditation", title: "A daily reminder to sit", detail: "In Reminders, under Meditation" })
        ])
      )}
      ${kit.section("Your sits", sits + (state.sits.length ? kit.list([kit.row({ url: url("patterns"), title: "Your patterns", detail: "Streaks, minutes, the kinds you come back to, and the moon, weekday and time of day" })]) : ""))}
      ${kit.section(
        "Elsewhere",
        kit.list([
          kit.row({ url: "/today/tend/", title: "To tend", detail: "Turn on “Count my meditations” on a thing of your own, and each sit marks it done" }),
          kit.row({ url: "/grimoire/", title: "Your Grimoire", detail: "Sits you keep there are under Meditation" }),
          kit.row({ url: "/rituals/cycle/", title: "Cycle & Moon", detail: "The moon tonight" })
        ])
      )}`;
  }

  // ── The sit ────────────────────────────────────────────────────────────
  const sit = { plan: null, clock: null, endedAt: null, last: null, timer: 0, bells: [] };
  function sitStart() {
    if (sit.clock) return;
    sit.plan = T.cleanPlan(Object.fromEntries(params));
    sit.bells = T.bellsOf(sit.plan);
    sit.clock = T.startClock(Date.now());
    sit.timer = setInterval(tick, 500);
    global.document.addEventListener("visibilitychange", tick);
  }
  function tick() {
    if (!sit.clock || state.done) return;
    const elapsed = T.elapsedOf(sit.clock, Date.now());
    if (sit.clock.pausedAt === null) {
      for (const b of T.bellsDue(sit.bells, sit.last ?? -1, elapsed)) ring(b.times, sit.plan);
      sit.last = elapsed;
    }
    const s = T.sitStateAt(sit.plan, elapsed, sit.endedAt);
    if (s.phase === "done") return finish(s.sitMs);
    const face = root.querySelector("[data-face]");
    if (face) face.innerHTML = faceHtml(s);
  }
  function faceHtml(s) {
    const paused = sit.clock.pausedAt !== null;
    const time = s.phaseLeftMs === null ? T.clockLabel(s.sitMs) : T.clockLabel(s.phaseLeftMs);
    return `<p class="md-phase">${esc(paused ? "Paused" : T.PHASE_WORDS[s.phase])}</p><p class="md-clock" role="timer" aria-live="off">${esc(time)}</p>${
      s.leftMs !== null && s.phase !== "sit" ? kit.caption(`${T.clockLabel(s.leftMs)} in all`) : ""
    }${s.phaseLeftMs === null ? kit.caption("Open-ended: end when you’re ready") : ""}`;
  }
  async function finish(sitMs) {
    if (state.done) return;
    clearInterval(sit.timer);
    state.done = L.fromTimer(sit.clock.startedAt, sitMs, sit.plan);
    draw();
    state.marked = await markTend(new Date());
    if (state.marked) draw();
  }
  function sitHtml() {
    if (state.done) {
      const d = state.done;
      return `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: "Your sit" })}${kit.p(`${plural(d.minutes, "minute", "minutes")}. Take a breath or two before you get up.`)}${
        state.marked ? kit.muted(`Marked done on your To tend list: ${state.marked === 1 ? "one thing" : `${state.marked} things`} you asked to count your meditations.`) : ""
      }${kit.actions([kit.button({ label: "Keep it in your log", url: url("log", { at: d.at, minutes: d.minutes, timed: 1, kind: params.get("kind"), altar: params.get("altar") }), primary: true }), kit.button({ label: "Leave it unlogged", url: BASE, ghost: true })])}`;
    }
    const s = T.sitStateAt(sit.plan, T.elapsedOf(sit.clock, Date.now()), sit.endedAt);
    const paused = sit.clock.pausedAt !== null;
    return `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: "Sit", lede: T.planLine(sit.plan) })}<div class="md-face" data-face>${faceHtml(s)}</div>${kit.actions([
      kit.button({ label: paused ? "Carry on" : "Pause", act: "pause", ghost: true }),
      sit.plan.minutes === null ? kit.button({ label: "End the sit", act: "end", primary: true }) : kit.button({ label: "Stop here", act: "stop", ghost: true })
    ])}${kit.muted("The time keeps if you switch tabs. Some browsers hold back sound in a hidden tab, so keep this page open to hear the bells.")}`;
  }
  const sitHandlers = {
    pause() {
      const now = Date.now();
      sit.clock = sit.clock.pausedAt === null ? T.pauseClock(sit.clock, now) : T.resumeClock(sit.clock, now);
      draw();
    },
    end() {
      if (sit.plan.endBell) ring(3, sit.plan);
      sit.endedAt = T.elapsedOf(sit.clock, Date.now());
      tick();
      draw();
    },
    stop() {
      const elapsed = T.elapsedOf(sit.clock, Date.now());
      finish(T.sitStateAt(sit.plan, elapsed).sitMs);
    }
  };

  /** Mark done the To tend things of your own you asked to count your meditations. */
  async function markTend(at) {
    try {
      const rows = await kit.entries(M.TEND_COLLECTION);
      const list = [];
      for (const e of [...rows].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))) {
        const record = M.normalizeRecord(e.data);
        if (record && !list.some((x) => x.record.key === record.key)) list.push({ id: e.id, record });
      }
      const changed = M.meditationDone(list.map((x) => x.record), at);
      for (const record of changed) {
        const entry = list.find((x) => x.record.key === record.key);
        if (entry) await kit.update(M.TEND_COLLECTION, entry.id, record);
      }
      return changed.length;
    } catch {
      return 0;
    }
  }

  // ── Breath pacing ──────────────────────────────────────────────────────
  const breath = { startedAt: null, frame: 0, custom: { ...T.BREATHS[2].pattern } };
  const patternOf = () => (state.breathId === "custom" ? breath.custom : T.BREATHS.find((b) => b.id === state.breathId).pattern);
  function breathFrame() {
    const b = T.breathAt(patternOf(), Date.now() - breath.startedAt);
    const circle = root.querySelector("[data-circle]");
    if (circle) circle.style.transform = `scale(${0.35 + 0.65 * b.scale})`;
    const word = root.querySelector("[data-word]");
    if (word && word.textContent !== T.BREATH_WORDS[b.stage]) word.textContent = T.BREATH_WORDS[b.stage];
    const count = root.querySelector("[data-count]");
    if (count) count.textContent = `${b.left} · ${plural(b.cycle, "breath", "breaths")}`;
    breath.frame = global.requestAnimationFrame(breathFrame);
  }
  function breathHtml() {
    const def = T.BREATHS.find((b) => b.id === state.breathId);
    const running = breath.startedAt !== null;
    const field = (key, label) => kit.field({ id: `md-b-${key}`, label, value: String(breath.custom[key]), change: "breath-part", inputmode: "numeric" });
    return `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: "Breath pacing" })}${kit.chips(
      T.BREATHS.map((b) => kit.chip({ label: b.label, act: "breath", value: b.id, pressed: state.breathId === b.id })),
      "Pattern"
    )}${kit.muted(def.line)}${state.breathId === "custom" && !running ? `${field("inhale", "Breathe in (seconds)")}${field("hold", "Hold, full (seconds)")}${field("exhale", "Breathe out (seconds)")}${field("rest", "Hold, empty (seconds)")}` : ""}
      <div class="md-stage" aria-live="polite"><div class="md-circle" data-circle></div><p class="md-word" data-word>${running ? "" : "Ready"}</p><p class="sp-caption" data-count></p></div>
      ${kit.actions([kit.button({ label: running ? "Stop" : "Begin", act: "breathe", primary: true })])}
      ${kit.muted("Breathe gently and never strain. If you feel light-headed, stop and breathe normally. Long holds aren’t for everyone; shorten them, or leave them out.")}`;
  }
  const breathHandlers = {
    breath(el) {
      state.breathId = el.dataset.value;
      draw();
    },
    "breath-part"(el) {
      breath.custom = T.cleanBreath({ ...breath.custom, [el.id.replace("md-b-", "")]: el.value });
    },
    breathe() {
      if (breath.startedAt === null) {
        breath.startedAt = Date.now();
        draw();
        breathFrame();
      } else {
        global.cancelAnimationFrame(breath.frame);
        breath.startedAt = null;
        draw();
      }
    }
  };

  // ── The log ────────────────────────────────────────────────────────────
  const pad = (n) => String(n).padStart(2, "0");
  function startDraft() {
    if (state.draft) return;
    const id = params.get("id");
    const existing = id ? state.sits.find((s) => s.id === id) : null;
    if (id && !existing) return;
    const at = params.get("at") && Number.isFinite(Date.parse(params.get("at"))) ? params.get("at") : new Date().toISOString();
    const data = existing
      ? existing.data
      : L.newSit({ at, minutes: Number(params.get("minutes")) || 10, kind: params.get("kind") || "breath", timed: params.get("timed") === "1", altar: params.get("altar") || undefined, together: params.get("together") || undefined });
    const d = new Date(data.at);
    state.draft = { id: existing ? existing.id : null, sit: { ...data }, day: kit.dateKey(d), time: `${pad(d.getHours())}:${pad(d.getMinutes())}`, minutes: String(data.minutes) };
  }
  function moment(day, time) {
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day).trim());
    const t = /^(\d{1,2}):(\d{2})$/.exec(String(time).trim());
    if (!d || !t || +t[1] > 23 || +t[2] > 59) return null;
    const at = new Date(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
    return Number.isNaN(at.getTime()) ? null : at;
  }
  function logHtml() {
    if (!state.ready) return kit.muted("Opening…");
    startDraft();
    if (!state.draft) return `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: "A sit" })}${kit.p("This sit couldn’t be found. It may have been deleted on another device.")}`;
    const { sit: s, id } = state.draft;
    const keep = state.kept
      ? kit.actions([kit.button({ label: "Open it in my Grimoire", url: `/grimoire/?page=${encodeURIComponent(state.kept)}`, ghost: true })])
      : state.user
        ? kit.toggle({ id: "md-keep", label: "Save to my Grimoire", detail: "A page under Meditation. Later changes here aren’t copied over.", checked: state.keep, change: "keep" })
        : kit.muted("Signed in, a sit can also be kept in your Grimoire.");
    return `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: id ? "Your sit" : "Log a sit" })}
      ${kit.card(`${kit.field({ id: "md-day", label: "Date (year-month-day)", value: state.draft.day, input: "draft-field" })}${kit.field({ id: "md-time", label: "Time began (hours:minutes)", value: state.draft.time, input: "draft-field" })}${kit.field({ id: "md-minutes", label: "Minutes", value: state.draft.minutes, input: "draft-field", inputmode: "numeric" })}`)}
      ${kit.section(
        "What kind of practice",
        kit.chips(L.SIT_KINDS.map((k) => kit.chip({ label: k.label, act: "kind", value: k.value, pressed: s.kind === k.value })), "What kind of practice") +
          (s.kind === "other" ? kit.field({ id: "md-other", label: "In your own words", value: s.other, input: "sit-field", maxlength: 80 }) : "")
      )}
      ${kit.section(
        "How settled",
        kit.chips([1, 2, 3, 4, 5].map((n) => kit.chip({ label: String(n), act: "settled", value: n, pressed: s.settled === n, a11y: `${n}, ${L.SETTLED_WORDS[n]}` })), "How settled") +
          kit.muted(s.settled ? L.SETTLED_WORDS[s.settled] : "1 restless, 5 deeply settled. Leave it if you’d rather not say.")
      )}
      ${kit.section(
        "What came up",
        kit.field({ id: "md-cameUp", label: "Anything that came: images, words, feelings", value: s.cameUp, input: "sit-field", multiline: true }) +
          kit.chips(L.CAME_UP_TAGS.map((t) => kit.chip({ label: t.label, act: "tag", value: t.value, pressed: s.tags.includes(t.value) })), "Tags") +
          kit.field({ id: "md-note", label: "A note", value: s.note, input: "sit-field", multiline: true })
      )}
      ${keep}
      ${kit.notice(state.message, { live: true })}
      ${kit.actions([kit.button({ label: "Save", act: "save", primary: true }), id ? kit.button({ label: "Delete this sit", act: "delete", ghost: true }) : ""])}`;
  }
  const logHandlers = {
    "draft-field"(el) {
      const key = { "md-day": "day", "md-time": "time", "md-minutes": "minutes" }[el.id];
      state.draft[key] = el.value;
    },
    "sit-field"(el) {
      state.draft.sit[el.id.replace("md-", "")] = el.value;
    },
    kind(el) {
      state.draft.sit.kind = el.dataset.value;
      draw();
    },
    settled(el) {
      const n = Number(el.dataset.value);
      state.draft.sit.settled = state.draft.sit.settled === n ? null : n;
      draw();
    },
    tag(el) {
      const t = el.dataset.value;
      const tags = state.draft.sit.tags;
      state.draft.sit.tags = tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t];
      draw();
    },
    keep(el) {
      state.keep = el.checked;
    },
    async save() {
      const at = moment(state.draft.day, state.draft.time);
      const mins = Math.round(Number(state.draft.minutes));
      if (!at || at.getTime() > Date.now() + 60000) return say("Write the date as year-month-day and the time as hours:minutes, and not in the future.");
      if (!(mins > 0)) return say("How many minutes did you sit?");
      const sitData = L.newSit({ ...state.draft.sit, at: at.toISOString(), minutes: mins });
      try {
        let id = state.draft.id;
        if (id) await kit.update(L.SITS, id, sitData);
        else id = (await kit.add(L.SITS, sitData))?.id;
        if (state.keep && state.user && id) await keepSit(id, sitData).catch(() => undefined);
        kit.go(BASE);
      } catch (error) {
        say(error?.message || "That couldn’t be saved. Please try again.");
      }
    },
    async delete() {
      if (!kit.confirm("Delete this sit? It goes from your log on every device. A copy kept in your Grimoire stays there.")) return;
      await kit.remove(L.SITS, state.draft.id);
      kit.go(BASE);
    }
  };
  function say(message) {
    state.message = message;
    draw();
  }

  /** Keep a sit as a Grimoire page, the rows the app's saveHolyPage writes (once; found again by its tag). */
  async function keepSit(id, sitData) {
    const db = global.db;
    if (!db || !state.user) return null;
    const [books, sections, pages] = await Promise.all([
      db.from("grimoire_books").select("id,title,created_at,updated_at").eq("user_id", state.user.id).order("created_at"),
      db.from("grimoire_sections").select("id,book_id,title,sort_order,created_at").eq("user_id", state.user.id),
      db.from("grimoire_pages").select("id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at").eq("user_id", state.user.id)
    ]);
    if (books.error || sections.error || pages.error) throw new Error("Your Grimoire couldn’t be opened just now.");
    const existing = L.findSitPage(pages.data || [], id);
    if (existing) return existing;
    const snapshot = { fetchedAt: new Date().toISOString(), books: books.data || [], sections: sections.data || [], pages: pages.data || [], blocks: [], links: [] };
    const { id: pageId, ops } = M.holyOps.holyPageOps(snapshot, { userId: state.user.id, now: new Date().toISOString() }, L.sitPage(id, sitData), M.newId);
    for (const op of ops) {
      if (op.kind !== "insert") continue;
      const { error } = await db.from(op.table).insert(op.row);
      if (error && error.code !== "23505") throw new Error("It couldn’t be kept in your Grimoire just now.");
    }
    return { id: pageId };
  }
  async function findKept() {
    const db = global.db;
    const id = params.get("id");
    if (!db || !state.user || !id) return;
    const { data } = await db.from("grimoire_pages").select("id,metadata").eq("user_id", state.user.id);
    state.kept = L.findSitPage(data || [], id)?.id || null;
  }

  // ── Patterns ───────────────────────────────────────────────────────────
  function groupsHtml(label, groups) {
    const shown = groups.filter((g) => g.sits > 0);
    if (!shown.length) return "";
    return kit.section(label, kit.card(shown.map((g) => kit.p(`${g.label}: ${plural(g.sits, "sit", "sits")}, ${P.minutesWords(g.minutes)}${g.settled !== null ? ` · settled ${g.settled} of 5` : ""}`)).join("")));
  }
  function patternsHtml() {
    const head = `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: "Your patterns" })}`;
    if (!state.ready) return head + kit.muted("Opening…");
    const s = P.sitStats(state.sits, new Date());
    if (!s.sits) return head + kit.muted("Once you’ve logged a few sits, what they have in common gathers here.");
    return `${head}${kit.card(
      kit.p(`${plural(s.streak.current, "day", "days")} in a row now · longest ${s.streak.longest}`) +
        kit.p(`This week ${P.minutesWords(s.minutes.week)} · this month ${P.minutesWords(s.minutes.month)} · this year ${P.minutesWords(s.minutes.year)}`) +
        kit.muted(`${plural(s.sits, "sit", "sits")} on ${plural(s.streak.days, "day", "days")}, ${P.minutesWords(s.minutes.all)} in all.`)
    )}${s.lines.length ? kit.card(s.lines.map((l) => kit.p(l)).join(""), { gold: true }) : ""}${kit.section(
      "The kinds you come back to",
      kit.card(s.kinds.slice(0, 6).map((k) => kit.p(`${k.label}: ${plural(k.sits, "sit", "sits")}, ${P.minutesWords(k.minutes)}`)).join(""))
    )}${groupsHtml("Time of day", s.byTime)}${groupsHtml("Day of the week", s.byWeekday)}${groupsHtml("The moon’s phase", s.byPhase)}${kit.muted(
      `These are patterns in your own log, not rules. A comparison is only drawn once a group has ${P.MIN_FOR_PATTERN} sits that say how settled you felt.`
    )}`;
  }

  // ── Drawing ────────────────────────────────────────────────────────────
  function draw() {
    const html = view === "sit" ? sitHtml() : view === "breath" ? breathHtml() : view === "log" ? logHtml() : view === "patterns" ? patternsHtml() : homeHtml();
    kit.render(root, html);
  }

  kit.delegate(root, {
    ...planHandlers,
    ...sitHandlers,
    ...breathHandlers,
    ...logHandlers,
    begin() {
      kit.go(url("sit", Object.fromEntries(Object.entries(T.planParams(state.plan)))));
    }
  });

  kit.start(async (user) => {
    state.user = user;
    if (view === "sit") sitStart();
    if (view !== "sit" && view !== "breath") await load();
    if (view === "log") await findKept().catch(() => undefined);
    draw();
  });
})(window);
