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
 * With a sit, as the app: what you bring to it (an intention, how you feel
 * before and after), written guidance a line at a time, something to look
 * at (full screen if you like), sound layers made in the browser with Web
 * Audio (SaltCore.meditation.webSound, the beds from
 * /assets/sounds/meditation/), presets before a ritual, suggestions for
 * today; and the mala counter (mala), programmes (programmes) and Listen
 * (listen: the sound layers on their own, with a stop timer; its last mix
 * kept apart from the sit's, under meditation.listen) pages.
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
  const { timer: T, log: L, patterns: P, extras: X, scripts: SC, focus: F, sound: S, mala: MA, programmes: PG, listen: LI } = M;
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
  const MIX_KEY = view === "listen" ? LI.LISTEN_KEY : "meditation.sound";

  const state = {
    user: null,
    sits: [],
    ready: false,
    plan: readPlan(),
    custom: "",
    draft: null,
    message: "",
    keep: false,
    kept: null,
    breathId: "box",
    custom478: null,
    done: null,
    marked: 0,
    extras: { ...X.NO_EXTRAS },
    withSound: false,
    mix: readMix(),
    sigils: [],
    settings: {},
    after: null,
    shape: "circle",
    mala: MA.startMala(108),
    mantra: ""
  };

  function readMix() {
    try {
      return (view === "listen" ? LI.cleanListen : S.cleanMix)(JSON.parse(global.localStorage.getItem(MIX_KEY) || "{}"));
    } catch {
      return view === "listen" ? LI.DEFAULT_LISTEN_MIX : S.cleanMix({});
    }
  }
  function saveMix() {
    try {
      global.localStorage.setItem(MIX_KEY, JSON.stringify(state.mix));
    } catch {
      /* kept for this visit only */
    }
  }
  /** Your saved sigils, for the sigil focus. */
  async function loadSigils() {
    try {
      const rows = await kit.entries(M.SIGILS);
      state.sigils = rows.flatMap((e) => {
        const s = M.readSigil(e.data?.sigil);
        return s ? [{ id: e.id, name: e.data?.name || s.intent || "A sigil", d: s.d, ring: s.ring, weight: s.weight }] : [];
      });
    } catch {
      state.sigils = [];
    }
  }
  const moodChips = (act, value, label) =>
    kit.chips(
      [1, 2, 3, 4, 5].map((n) => kit.chip({ label: String(n), act, value: n, pressed: value === n, a11y: `${label}: ${n}, ${L.MOOD_WORDS[n]}` })),
      label
    );

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

  // ── What goes with a sit (extras.ts) ───────────────────────────────────
  const chosen = () => ({ ...state.extras, sound: state.withSound && S.mixOn(state.mix) ? state.mix : null });
  function extrasHtml() {
    const e = state.extras;
    const bring = kit.details(
      "What you bring to it",
      kit.field({ id: "md-intention-before", label: "An intention (optional)", value: e.intention, input: "intention", maxlength: 300 }) +
        kit.muted("How you feel now") +
        moodChips("before", e.before, "How you feel now") +
        kit.muted(e.before ? L.MOOD_WORDS[e.before] : "1 low, 5 bright. You’ll be asked again afterwards.") +
        kit.muted("The kind of practice") +
        kit.chips(L.SIT_KINDS.filter((k) => k.value !== "other").map((k) => kit.chip({ label: k.label, act: "sit-kind", value: k.value, pressed: e.kind === k.value })), "The kind of practice") +
        (e.kind === "walking" ? kit.muted("Steps are counted in the app, on a phone with a step counter. Here the walk is simply timed.") : ""),
      { id: "md-bring" }
    );
    const script = SC.scriptOf(e.script);
    const guide = kit.details(
      "Guidance on screen",
      kit.muted("One line at a time, paced to the length of your sit.") +
        kit.chips([kit.chip({ label: "None", act: "script", value: "", pressed: !e.script }), ...SC.SCRIPTS.map((x) => kit.chip({ label: x.title, act: "script", value: x.id, pressed: e.script === x.id }))], "Guidance") +
        (script ? kit.muted(script.source) : ""),
      { id: "md-guide" }
    );
    const look = kit.details(
      "Something to look at",
      kit.chips(F.FOCUSES.map((f) => kit.chip({ label: f.label, act: "focus", value: f.value, pressed: e.focus === f.value })), "Something to look at") +
        kit.muted(F.FOCUSES.find((f) => f.value === e.focus).line) +
        (e.focus === "sigil"
          ? state.sigils.length
            ? kit.chips(state.sigils.map((x) => kit.chip({ label: x.name, act: "sigil", value: x.id, pressed: (e.sigil || state.sigils[0].id) === x.id })), "Your sigils")
            : kit.muted("You haven’t saved a sigil yet. Make one in Craft → Sigils.")
          : ""),
      { id: "md-look" }
    );
    const sound = kit.details(
      "Sound",
      kit.toggle({ id: "md-with-sound", label: "Play sound with the sit", detail: state.withSound && S.mixOn(state.mix) ? S.mixLine(state.mix) : "Layers you mix yourself, faded in and out, stopping with the timer.", checked: state.withSound, change: "with-sound" }) +
        (state.withSound ? kit.actions([kit.button({ label: "Use my last Listen mix", act: "listen-mix", ghost: true, small: true })]) + soundHtml() : ""),
      { id: "md-sound" }
    );
    return bring + guide + look + sound;
  }
  function soundHtml() {
    const m = state.mix;
    const opt = (field, value, label, pressed) => kit.chip({ label, act: "mix", value, data: { field }, pressed });
    return S.LAYERS.map((l) => {
      const level = S.levelOf(m, l.id);
      let more = "";
      if (level && l.id === "drone") more = kit.chips(S.KEYS.map((k) => opt("key", k.id, k.id, m.key === k.id)), "Key");
      if (level && l.id === "drum") more = kit.muted("Beats a second") + kit.chips(S.TEMPOS.map((t) => opt("tempo", t, String(t), m.tempo === t)), "Beats a second");
      if (level && l.id === "bowls")
        more =
          kit.chips(S.BOWL_SETS.map((b) => opt("bowlSet", b.value, b.label, m.bowlSet === b.value)), "Bowls") +
          kit.chips(S.BOWL_GAPS.map((g) => opt("bowlEvery", g, `Every ${g} s`, m.bowlEvery === g)), "How often") +
          kit.muted("The tones given to the chakras here (C to B, root to crown) are a modern crystal-bowl convention.");
      if (level && l.id === "binaural")
        more =
          kit.notice(S.BINAURAL_NOTE) +
          kit.chips(S.BINAURAL_PRESETS.map((b) => opt("binaural", b.value, b.label, m.binaural === b.value)), "Binaural layers") +
          kit.muted(S.BINAURAL_PRESETS.find((b) => b.value === m.binaural).line) +
          (m.binaural === "custom" ? kit.muted("The beat (Hz)") + kit.chips(S.BEATS.map((b) => opt("beat", b, String(b), m.beat === b)), "The beat") : "") +
          kit.muted("The carrier tone (Hz)") +
          kit.chips(S.CARRIERS.map((c) => opt("carrier", c, String(c), m.carrier === c)), "The carrier tone");
      return `<div class="md-layer">${kit.p(l.label)}${kit.muted(l.line)}${kit.chips(
        S.LEVELS.map((v) => kit.chip({ label: v.label, act: "level", value: v.value, data: { layer: l.id }, pressed: level === v.value, a11y: `${l.label}: ${v.label}` })),
        l.label
      )}${more}</div>`;
    }).join("");
  }
  const extrasHandlers = {
    intention(el) {
      state.extras.intention = el.value;
    },
    before(el) {
      const n = Number(el.dataset.value);
      state.extras.before = state.extras.before === n ? null : n;
      draw();
    },
    "sit-kind"(el) {
      state.extras.kind = state.extras.kind === el.dataset.value ? null : el.dataset.value;
      draw();
    },
    script(el) {
      state.extras.script = el.dataset.value || null;
      draw();
    },
    focus(el) {
      state.extras.focus = el.dataset.value;
      draw();
    },
    sigil(el) {
      state.extras.sigil = el.dataset.value;
      draw();
    },
    "listen-mix"() {
      try {
        const raw = global.localStorage.getItem(LI.LISTEN_KEY);
        if (raw) state.mix = LI.cleanListen(JSON.parse(raw));
      } catch {
        return;
      }
      saveMix();
      draw();
    },
    "with-sound"(el) {
      state.withSound = el.checked;
      draw();
    },
    level(el) {
      state.mix = S.cleanMix({ ...state.mix, levels: { ...state.mix.levels, [el.dataset.layer]: Number(el.dataset.value) } });
      saveMix();
      if (view === "listen") listenRemix();
      draw();
    },
    mix(el) {
      state.mix = S.cleanMix({ ...state.mix, [el.dataset.field]: el.dataset.value });
      saveMix();
      if (view === "listen") listenRemix();
      draw();
    },
    preset(el) {
      kit.go(url("sit", SC.presetParams(el.dataset.value)));
    },
    suggest(el) {
      const x = state.suggestions[Number(el.dataset.value)];
      if (!x) return;
      const e = { ...chosen(), kind: x.kind, script: x.script, intention: x.intention || state.extras.intention, programme: x.programme || "", step: x.step || "" };
      kit.go(url("sit", { ...T.planParams(state.plan), ...X.extrasParams(e) }));
    },
    walk() {
      kit.go(url("sit", { ...T.planParams(state.plan), ...X.extrasParams({ ...chosen(), kind: "walking" }) }));
    }
  };
  function suggestionsOf() {
    const now = new Date();
    const today = PG.yearFestivals(now, M.holidayChoice(state.settings)).filter((f) => f.date === kit.dateKey(now));
    return PG.suggestionsFor(now, today, M.myDeities(state.settings));
  }

  // ── Home ───────────────────────────────────────────────────────────────
  function homeHtml() {
    state.suggestions = suggestionsOf();
    const stats = P.sitStats(state.sits, new Date());
    const summary = state.sits.length
      ? kit.card(kit.p([stats.streak.current > 1 ? `${stats.streak.current} days in a row` : null, `${P.minutesWords(stats.minutes.week)} this week`, `${P.minutesWords(stats.minutes.month)} this month`].filter(Boolean).join(" · ")))
      : "";
    const sits = !state.ready
      ? kit.muted("Opening…")
      : state.sits.length
        ? kit.list(state.sits.slice(0, 30).map((s) => kit.row({ url: url("log", { id: s.id }), title: L.kindLabel(s.data), detail: `${L.sitLine(s.data)}${s.data.settled ? ` · settled ${s.data.settled} of 5` : ""}` })))
        : kit.muted("None yet. When you finish a sit, you can note how it went here.");
    const c = chosen();
    return `${kit.back("/practice/", "Craft")}${kit.head({ eyebrow: "Craft", title: "Meditation", lede: "A timer with gentle bells, guidance, sound and something to rest your eyes on, breath pacing, a mala, and a log of your sits: how you felt and what came up. Private to you, and kept with your account when you’re signed in." })}
      ${summary}
      ${kit.section("Sit", kit.card(`${planHtml(state.plan)}${extrasHtml()}<p class="sp-muted" data-plan-line>${esc([T.planLine(state.plan), c.sound ? S.mixLine(c.sound) : ""].filter(Boolean).join(" · "))}</p>${kit.actions([kit.button({ label: "Begin", act: "begin", primary: true })])}`))}
      ${kit.section("Before a ritual", kit.list(SC.PRESETS.map((x) => kit.row({ act: "preset", data: { value: x.id }, title: x.label, detail: x.line }))))}
      ${kit.section("For today", kit.list(state.suggestions.map((x, i) => kit.row({ act: "suggest", data: { value: i }, title: x.title, detail: x.line }))))}
      ${kit.section(
        "More ways in",
        kit.list([
          kit.row({ url: url("listen"), title: "Listen", detail: "Binaural beats, noise, rain, fire, a drone, drum or bowls on their own, with a stop timer" }),
          kit.row({ url: url("breath"), title: "Breath pacing", detail: "A circle, wave or square path to breathe with: box breathing, 4-7-8 or your own count" }),
          kit.row({ url: url("mala"), title: "Mala and mantra", detail: "Count beads with a tap: 27, 54 or 108, and keep the mantra in your log" }),
          kit.row({ act: "walk", title: "Walking meditation", detail: "A timed walk; steps are counted in the app" }),
          kit.row({ url: url("programmes"), title: "Programmes", detail: "7 days of grounding, a 28-day moon cycle, and Sabbat sits" }),
          kit.row({ url: url("log"), title: "Log a sit", detail: "One you sat without the timer" }),
          kit.row({ url: "/altar/", title: "Meditate at your altar", detail: "Open an altar, then Workings → Meditate here" }),
          kit.row({ url: "/rituals/together/?sit=1", title: "Sit together", detail: "With your coven or friends: everyone’s timer starts at once, with a shared drum or bowls if you like" }),
          kit.row({ url: "/reminders/#gd-meditation", title: "A daily reminder to sit", detail: "In Reminders, under Meditation" })
        ])
      )}
      ${kit.section("Your sits", sits + (state.sits.length ? kit.list([kit.row({ url: url("patterns"), title: "Your patterns", detail: "Streaks, minutes, before and after, the kinds you come back to, and the moon, weekday and time of day" })]) : ""))}
      ${kit.section(
        "Elsewhere",
        kit.list([
          kit.row({ url: "/today/tend/", title: "To tend", detail: "Turn on “Count my meditations” on a thing of your own, and each sit marks it done" }),
          kit.row({ url: "/grimoire/", title: "Your Grimoire", detail: "Sits you keep there are under Meditation" }),
          kit.row({ url: "/practice/eclectic/sigil/", title: "Sigils", detail: "Make a sigil to gaze on as you sit" }),
          kit.row({ url: "/rituals/cycle/", title: "Cycle & Moon", detail: "The moon tonight" })
        ])
      )}`;
  }

  // ── The sit ────────────────────────────────────────────────────────────
  const sit = { plan: null, clock: null, endedAt: null, last: null, timer: 0, guideTimer: 0, bells: [], extras: null, sound: null, strikes: [], soundLast: null };
  function sitStart() {
    if (sit.clock) return;
    sit.plan = T.cleanPlan(Object.fromEntries(params));
    sit.extras = X.cleanExtras(Object.fromEntries(params));
    sit.bells = T.bellsOf(sit.plan);
    sit.clock = T.startClock(Date.now());
    if (sit.extras.sound) {
      sit.sound = M.webSound.createWebSound((bed) => (["rain", "fire"].includes(bed) ? `/assets/sounds/nature/${bed}.m4a` : `/assets/sounds/meditation/${bed}.wav`));
      sit.strikes = S.bowlStrikes(sit.extras.sound, sit.plan);
    }
    sit.timer = setInterval(tick, 500);
    const moving = ["candle", "mandala", "sigil"].includes(sit.extras.focus);
    if (moving || sit.extras.script) sit.guideTimer = setInterval(drawGuide, moving ? 100 : 500);
    global.document.addEventListener("visibilitychange", tick);
  }
  function soundTick(elapsed) {
    if (!sit.sound) return;
    if (sit.clock.pausedAt !== null) return sit.sound.pause();
    sit.sound.resume();
    const r = S.soundTick(sit.extras.sound, sit.plan, sit.strikes, sit.soundLast ?? -1, elapsed, sit.endedAt);
    sit.soundLast = elapsed;
    sit.sound.update(r.voices);
    if (r.strike) sit.sound.strike(r.strike.key, r.strike.volume);
    const tap = root.querySelector("[data-sound-tap]");
    if (tap) tap.hidden = !sit.sound.needsTap();
  }
  function tick() {
    if (!sit.clock || state.done) return;
    const elapsed = T.elapsedOf(sit.clock, Date.now());
    if (sit.clock.pausedAt === null) {
      for (const b of T.bellsDue(sit.bells, sit.last ?? -1, elapsed)) ring(b.times, sit.plan);
      sit.last = elapsed;
    }
    soundTick(elapsed);
    const s = T.sitStateAt(sit.plan, elapsed, sit.endedAt);
    if (s.phase === "done") return finish(s.sitMs);
    const face = root.querySelector("[data-face]");
    if (face) face.innerHTML = faceHtml(s);
  }
  /** The focus picture and the guidance's line, from the sit's clock. */
  function focusSvg(elapsed) {
    const e = sit.extras;
    if (e.focus === "candle") return F.candleSvg(elapsed);
    if (e.focus === "moon") return F.moonSvg(new Date());
    if (e.focus === "mandala") return F.mandalaSvg(elapsed);
    const sg = e.focus === "sigil" ? state.sigils.find((x) => x.id === e.sigil) || state.sigils[0] : null;
    return sg ? F.sigilFocusSvg(sg, elapsed) : "";
  }
  function lineNow(elapsed) {
    const script = SC.scriptOf(sit.extras.script);
    const st = T.sitStateAt(sit.plan, elapsed, sit.endedAt);
    const at = script && st.phase === "sit" ? SC.lineAt(script, st.sitMs, sit.plan.minutes === null ? null : sit.plan.minutes * 60000) : null;
    return at ? { text: script.lines[at.index], opacity: at.opacity } : { text: script && st.phase === "settle" ? "The guidance begins with the sit." : "", opacity: 1 };
  }
  function drawGuide() {
    if (!sit.clock || state.done) return;
    const elapsed = T.elapsedOf(sit.clock, Date.now());
    const svg = focusSvg(elapsed);
    const line = lineNow(elapsed);
    for (const el of root.querySelectorAll("[data-focus]")) el.innerHTML = svg;
    for (const el of root.querySelectorAll("[data-line]")) {
      if (el.textContent !== line.text) el.textContent = line.text;
      el.style.opacity = String(line.opacity);
    }
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
    clearInterval(sit.guideTimer);
    sit.sound?.stop();
    sit.sound = null;
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
      }${kit.muted("How do you feel now?")}${moodChips("after", state.after, "How do you feel now")}${kit.muted(
        state.after ? `${L.MOOD_WORDS[state.after]}${sit.extras.before ? ` (before: ${L.MOOD_WORDS[sit.extras.before]})` : ""}` : "1 low, 5 bright. Leave it if you’d rather not say."
      )}${kit.actions([kit.button({ label: "Keep it in your log", url: url("log", X.logParams(d, sit.extras, { after: state.after, altar: params.get("altar") || undefined })), primary: true }), kit.button({ label: "Leave it unlogged", url: BASE, ghost: true })])}`;
    }
    const elapsed = T.elapsedOf(sit.clock, Date.now());
    const s = T.sitStateAt(sit.plan, elapsed, sit.endedAt);
    const paused = sit.clock.pausedAt !== null;
    const e = sit.extras;
    const script = SC.scriptOf(e.script);
    const svg = focusSvg(elapsed);
    const line = lineNow(elapsed);
    const guide = `${svg ? `<div class="md-focus" data-focus>${svg}</div>${kit.actions([kit.button({ label: "Fill the screen", act: "full", ghost: true, small: true })])}` : ""}${
      e.focus === "sigil" && !svg ? kit.muted("You haven’t saved a sigil yet. Make one in Craft → Sigils.") : ""
    }${script ? `<p class="md-line" data-line aria-live="polite" style="opacity:${line.opacity}">${esc(line.text)}</p>` : ""}`;
    const full = svg || script ? `<div class="md-full" data-full hidden role="dialog" aria-label="Full screen" tabindex="-1"><div class="md-full__focus" data-focus>${svg}</div>${script ? `<p class="md-line" data-line>${esc(line.text)}</p>` : ""}<p class="sp-caption">Tap to close</p></div>` : "";
    return `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: script ? script.title : "Sit", lede: [T.planLine(sit.plan), e.sound ? S.mixLine(e.sound) : ""].filter(Boolean).join(" · ") })}${e.intention ? kit.p(e.intention) : ""}${guide}<div class="md-face" data-face>${faceHtml(s)}</div>${
      sit.sound ? `<div data-sound-tap${sit.sound.needsTap() ? "" : " hidden"}>${kit.actions([kit.button({ label: "Let the sound play", act: "unlock", ghost: true })])}</div>` : ""
    }${e.kind === "walking" ? kit.muted("Steps are counted in the app, on a phone with a step counter. Here the walk is simply timed.") : ""}${full}${kit.actions([
      kit.button({ label: paused ? "Carry on" : "Pause", act: "pause", ghost: true }),
      sit.plan.minutes === null ? kit.button({ label: "End the sit", act: "end", primary: true }) : kit.button({ label: "Stop here", act: "stop", ghost: true })
    ])}${kit.muted("The time keeps if you switch tabs. Some browsers hold back sound in a hidden tab, so keep this page open to hear the bells.")}${
      e.sound && S.levelOf(e.sound, "binaural") ? kit.muted(S.BINAURAL_NOTE) : ""
    }`;
  }
  const sitHandlers = {
    unlock() {
      sit.sound?.unlock();
      const tap = root.querySelector("[data-sound-tap]");
      if (tap) tap.hidden = true;
    },
    full() {
      const el = root.querySelector("[data-full]");
      if (!el) return;
      el.hidden = false;
      el.focus();
      el.addEventListener("click", () => (el.hidden = true), { once: true });
      el.addEventListener("keydown", (ev) => ev.key === "Escape" && (el.hidden = true), { once: true });
    },
    after(el) {
      const n = Number(el.dataset.value);
      state.after = state.after === n ? null : n;
      draw();
    },
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
    const shape = root.querySelector("[data-shape]");
    if (shape) shape.innerHTML = (state.shape === "wave" ? F.breathWaveSvg : F.breathSquareSvg)(patternOf(), Date.now() - breath.startedAt);
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
      ${kit.chips(F.BREATH_SHAPES.map((x) => kit.chip({ label: x.label, act: "shape", value: x.value, pressed: state.shape === x.value })), "Shape")}
      <div class="md-stage" aria-live="polite">${state.shape === "circle" ? '<div class="md-circle" data-circle></div>' : `<div class="md-shape" data-shape>${(state.shape === "wave" ? F.breathWaveSvg : F.breathSquareSvg)(patternOf(), 0)}</div>`}<p class="md-word" data-word>${running ? "" : "Ready"}</p><p class="sp-caption" data-count></p></div>
      ${kit.actions([kit.button({ label: running ? "Stop" : "Begin", act: "breathe", primary: true })])}
      ${kit.muted("Breathe gently and never strain. If you feel light-headed, stop and breathe normally. Long holds aren’t for everyone; shorten them, or leave them out.")}`;
  }
  const breathHandlers = {
    shape(el) {
      state.shape = el.dataset.value;
      draw();
    },
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
      : L.newSit({
          at,
          minutes: Number(params.get("minutes")) || 10,
          kind: params.get("kind") || "breath",
          timed: params.get("timed") === "1",
          altar: params.get("altar") || undefined,
          together: params.get("together") || undefined,
          ...Object.fromEntries(["intention", "before", "after", "mantra", "count", "steps", "programme", "step", "script"].filter((k) => params.get(k)).map((k) => [k, params.get(k)]))
        });
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
      ${
        s.kind === "mantra" || s.mantra || s.count
          ? kit.section("Mantra or chant", kit.field({ id: "md-mantra", label: "The words", value: s.mantra || "", input: "sit-field", maxlength: 120 }) + (s.count ? kit.muted(`${s.count} counted on the mala`) : ""))
          : ""
      }${s.steps ? kit.muted(`${s.steps} steps`) : ""}
      ${kit.section(
        "Before and after",
        kit.field({ id: "md-intention", label: "Your intention", value: s.intention || "", input: "sit-field", maxlength: 300 }) +
          kit.muted("How you felt before") +
          moodChips("mood-before", s.before, "Before") +
          kit.muted("How you feel after") +
          moodChips("mood-after", s.after, "After") +
          kit.muted("1 low, 5 bright.")
      )}
      ${kit.section(
        "How settled",
        kit.chips([1, 2, 3, 4, 5].map((n) => kit.chip({ label: String(n), act: "settled", value: n, pressed: s.settled === n, a11y: `${n}, ${L.SETTLED_WORDS[n]}` })), "How settled") +
          kit.muted(s.settled ? L.SETTLED_WORDS[s.settled] : "1 restless, 5 deeply settled. Leave it if you’d rather not say.")
      )}
      ${kit.section(
        "What came up",
        L.promptsFor(s.kind).map((q) => kit.muted(q)).join("") +
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
    "mood-before"(el) {
      const n = Number(el.dataset.value);
      state.draft.sit.before = state.draft.sit.before === n ? undefined : n;
      draw();
    },
    "mood-after"(el) {
      const n = Number(el.dataset.value);
      state.draft.sit.after = state.draft.sit.after === n ? undefined : n;
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
    )}${s.lines.length ? kit.card(s.lines.map((l) => kit.p(l)).join(""), { gold: true }) : ""}${(() => {
      const b = P.beforeAfter(state.sits);
      const lines = P.beforeAfterLines(b);
      return kit.section(
        "Before and after",
        kit.card(
          lines.length
            ? lines.map((l) => kit.p(l)).join("")
            : kit.muted(`Say how you feel before you begin and again afterwards, and once ${P.MIN_FOR_PATTERN} sits have both, the change shows here.${b.pairs ? ` ${b.pairs} so far.` : ""}`)
        )
      );
    })()}${kit.section(
      "The kinds you come back to",
      kit.card(s.kinds.slice(0, 6).map((k) => kit.p(`${k.label}: ${plural(k.sits, "sit", "sits")}, ${P.minutesWords(k.minutes)}`)).join(""))
    )}${groupsHtml("Time of day", s.byTime)}${groupsHtml("Day of the week", s.byWeekday)}${groupsHtml("The moon’s phase", s.byPhase)}${kit.muted(
      `These are patterns in your own log, not rules. A comparison is only drawn once a group has ${P.MIN_FOR_PATTERN} sits that say how settled you felt.`
    )}`;
  }

  // ── The mala ───────────────────────────────────────────────────────────
  function malaHtml() {
    const m = state.mala;
    return `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: "Mala and mantra" })}${kit.field({ id: "md-mantra-words", label: "Your mantra or chant (optional)", value: state.mantra, input: "mantra", maxlength: 120 })}${
      m.total ? "" : kit.chips(MA.MALA_SIZES.map((n) => kit.chip({ label: `${n} beads`, act: "mala-size", value: n, pressed: m.size === n })), "Beads")
    }<button type="button" class="md-mala" data-mala aria-label="${esc(`Count a bead. ${MA.malaLine(m)}`)}"><span class="md-mala__count">${m.bead}</span><span class="sp-caption">${esc(MA.malaLine(m))}</span>${
      state.mantra.trim() ? `<span class="md-mala__mantra">${esc(state.mantra.trim())}</span>` : ""
    }<span class="sp-caption">Tap anywhere here for each bead · hold for the guru bead</span></button>${kit.actions([
      kit.button({ label: "Guru bead", act: "guru", ghost: true, small: true }),
      m.total ? kit.button({ label: "Keep it in your log", act: "mala-keep", primary: true }) : "",
      m.total ? kit.button({ label: "One back", act: "mala-undo", ghost: true, small: true }) : "",
      m.total ? kit.button({ label: "Begin again", act: "mala-reset", ghost: true, small: true }) : ""
    ])}${kit.muted("By custom the guru bead, the larger one where the mala’s ends meet, isn’t counted: you turn back there rather than crossing it. Customs differ between traditions; keep your own teacher’s way if you have one.")}`;
  }
  function buzz(event) {
    if (!prefs().haptics || typeof navigator.vibrate !== "function" || event === "none") return;
    try {
      navigator.vibrate(event === "round" ? [40, 60, 40] : event === "guru" ? 120 : 12);
    } catch {
      /* no vibration here */
    }
  }
  const malaHandlers = {
    mantra(el) {
      state.mantra = el.value;
    },
    "mala-size"(el) {
      state.mala = MA.startMala(Number(el.dataset.value));
      draw();
    },
    guru() {
      const r = MA.guruBead(state.mala);
      state.mala = r.mala;
      buzz(r.event);
      draw();
    },
    "mala-undo"() {
      state.mala = MA.undoBead(state.mala);
      draw();
    },
    "mala-reset"() {
      state.mala = MA.startMala(state.mala.size);
      draw();
    },
    "mala-keep"() {
      const m = state.mala;
      kit.go(url("log", { at: new Date(m.startedAt ?? Date.now()).toISOString(), minutes: MA.malaMinutes(m, Date.now()), timed: 1, kind: "mantra", mantra: state.mantra.trim(), count: m.total }));
    }
  };
  // A tap counts a bead; a long press is the guru bead (and the tap after it is let go).
  let press = { timer: 0, long: false };
  root.addEventListener("pointerdown", (ev) => {
    if (!ev.target.closest?.("[data-mala]")) return;
    press.long = false;
    clearTimeout(press.timer);
    press.timer = setTimeout(() => {
      press.long = true;
      malaHandlers.guru();
    }, 600);
  });
  for (const type of ["pointerup", "pointerleave", "pointercancel"]) root.addEventListener(type, () => clearTimeout(press.timer));
  root.addEventListener("click", (ev) => {
    if (!ev.target.closest?.("[data-mala]")) return;
    if (press.long) {
      press.long = false;
      return;
    }
    const r = MA.tapBead(state.mala, Date.now());
    state.mala = r.mala;
    buzz(r.event);
    draw();
  });
  root.addEventListener("contextmenu", (ev) => ev.target.closest?.("[data-mala]") && ev.preventDefault());

  // ── Listen ─────────────────────────────────────────────────────────────
  // As the app's meditation/listen: the sound layers on their own (the
  // sit's sound engine against an open-ended plan, its end the timer's or
  // Stop's fade), with a stop timer and play, pause and stop.
  const lis = { minutes: 30, run: null, done: null, sound: null, strikes: [], last: null, timer: 0 };
  function listenElapsed() {
    return lis.run ? T.elapsedOf(lis.run.clock, Date.now()) : 0;
  }
  function listenTick() {
    const r = lis.run;
    if (!r) return;
    const elapsed = listenElapsed();
    const st = LI.listenState(elapsed, r.endMs);
    if (st.done) {
      lis.done = { startedAt: r.clock.startedAt, ms: elapsed };
      listenQuiet();
      return draw();
    }
    if (r.clock.pausedAt !== null) {
      lis.sound.pause();
    } else {
      lis.sound.resume();
      const plan = LI.listenPlan(r.minutes);
      const x = S.soundTick(state.mix, plan, lis.strikes, lis.last ?? -1, elapsed, r.endMs);
      lis.last = elapsed;
      lis.sound.update(x.voices);
      if (x.strike) lis.sound.strike(x.strike.key, x.strike.volume);
    }
    const face = root.querySelector("[data-listen-clock]");
    if (face) face.textContent = T.clockLabel(st.leftMs ?? elapsed);
    const tap = root.querySelector("[data-sound-tap]");
    if (tap) tap.hidden = !lis.sound.needsTap();
  }
  function listenQuiet() {
    clearInterval(lis.timer);
    if (lis.sound) lis.sound.stop();
    lis.sound = null;
    lis.run = null;
    lis.last = null;
  }
  /** A new mix while playing: the voices follow it at the next tick; the bowls are worked out again. */
  function listenRemix() {
    if (lis.run) lis.strikes = S.bowlStrikes(state.mix, LI.listenPlan(lis.run.minutes));
  }
  function listenHtml() {
    const r = lis.run;
    const m = state.mix;
    const on = S.mixOn(m);
    const paused = !!r && r.clock.pausedAt !== null;
    const elapsed = listenElapsed();
    const st = r ? LI.listenState(elapsed, r.endMs) : null;
    const line = r ? (paused ? "Paused" : r.stopping ? "Fading out" : S.mixLine(m)) : on ? S.mixLine(m) : "Choose at least one layer below.";
    const done = lis.done ? kit.p(`You listened for ${T.clockLabel(lis.done.ms)}.`) + kit.actions([kit.button({ label: "Keep it in your log", url: url("log", LI.listenLogParams(lis.done.startedAt, lis.done.ms)), ghost: true })]) : "";
    return `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: "Listen", lede: "Binaural beats, noise, rain, fire, a drone, a drum or bowls, on their own: to rest, read, work or fall quiet to. The same layers you can play with a sit." })}
      ${kit.card(
        `<p class="md-listen__clock" data-listen-clock>${esc(r ? T.clockLabel(st.leftMs ?? elapsed) : LI.timerLabel(lis.minutes))}</p>${kit.muted(line)}${kit.actions([
          !r || paused ? kit.button({ label: paused ? "Play on" : "Play", act: "listen-play", primary: true, disabled: !on }) : "",
          r && !paused && !r.stopping ? kit.button({ label: "Pause", act: "listen-pause", ghost: true }) : "",
          r && !r.stopping ? kit.button({ label: "Stop", act: "listen-stop", ghost: true }) : ""
        ])}${lis.sound ? `<div data-sound-tap${lis.sound.needsTap() ? "" : " hidden"}>${kit.actions([kit.button({ label: "Let the sound play", act: "listen-unlock", ghost: true })])}</div>` : ""}${done}`
      )}
      ${kit.section(
        "Stop after",
        kit.chips(LI.LISTEN_TIMERS.map((x) => kit.chip({ label: LI.timerLabel(x), act: "listen-timer", value: x === null ? "" : x, pressed: lis.minutes === x })), "Stop after") +
          kit.muted(`It fades in as it begins and out as it ends. The binaural slow descent spans the time you choose, or 30 minutes if it plays until you stop it.${r ? " A new time applies when you next press Play." : ""}`)
      )}
      ${kit.section("Your mix", kit.card(soundHtml()) + kit.muted("Kept on this device for next time, and you can use it for a sit too (Meditation → Sound → Use my last Listen mix). Binaural layers come with soft pink noise under them unless you choose another noise."))}
      ${kit.notice(LI.LISTEN_NOTE)}`;
  }
  const listenHandlers = {
    "listen-timer"(el) {
      lis.minutes = LI.cleanTimer(el.dataset.value);
      draw();
    },
    "listen-play"() {
      if (!S.mixOn(state.mix)) return;
      lis.done = null;
      if (lis.run) {
        lis.run.clock = T.resumeClock(lis.run.clock, Date.now());
      } else {
        lis.sound = M.webSound.createWebSound((bed) => (["rain", "fire"].includes(bed) ? `/assets/sounds/nature/${bed}.m4a` : `/assets/sounds/meditation/${bed}.wav`));
        if (!lis.sound) return;
        lis.sound.unlock();
        lis.run = { clock: T.startClock(Date.now()), minutes: lis.minutes, endMs: LI.listenEnd(lis.minutes), stopping: false };
        lis.strikes = S.bowlStrikes(state.mix, LI.listenPlan(lis.minutes));
        lis.timer = setInterval(listenTick, 500);
      }
      draw();
      listenTick();
    },
    "listen-pause"() {
      if (lis.run) lis.run.clock = T.pauseClock(lis.run.clock, Date.now());
      listenTick();
      draw();
    },
    "listen-stop"() {
      const r = lis.run;
      if (!r) return;
      r.clock = T.resumeClock(r.clock, Date.now());
      r.endMs = LI.stopAt(T.elapsedOf(r.clock, Date.now()), r.endMs);
      r.stopping = true;
      draw();
    },
    "listen-unlock"() {
      if (lis.sound) lis.sound.unlock();
      listenTick();
    }
  };

  // ── Programmes ─────────────────────────────────────────────────────────
  function programmesHtml() {
    const head = `${kit.back(BASE, "Meditation")}${kit.head({ eyebrow: "Meditation", title: "Programmes", lede: "A sit a day with a focus for each. Progress comes from your log, so a sit logged for a programme counts wherever you sat it." })}`;
    if (!state.ready) return head + kit.muted("Opening…");
    const now = new Date();
    const runs = PG.PROGRAMMES.filter((p) => p.days !== null).map((p) => {
      const run = PG.programmeRun(state.sits, p.id, now);
      const day = run.complete ? 1 : run.next;
      const f = PG.focusFor(p.id, day, now);
      const go =
        !run.started || run.complete
          ? kit.button({ label: run.complete ? "Begin again" : "Begin day 1", act: "prog-begin", data: { id: p.id, day: 1 }, primary: true })
          : run.today
            ? ""
            : kit.button({ label: `Sit day ${day}`, act: "prog-begin", data: { id: p.id, day }, primary: true });
      return kit.section(
        p.title,
        kit.card(
          kit.muted(p.line) +
            kit.p(PG.runLine(run)) +
            (run.complete ? "" : kit.p(`${run.today ? "Today’s" : `Day ${day}`}: ${f.title}. ${f.line}`)) +
            (run.today && !run.complete ? kit.muted("Today’s sit is done. Come back tomorrow for the next.") : "") +
            kit.actions([
              go,
              run.started && !run.complete && !run.today ? kit.button({ label: "Begin again from day 1", act: "prog-begin", data: { id: p.id, day: 1 }, ghost: true }) : "",
              kit.button({ label: "Add to To tend", act: "prog-tend", data: { title: p.title, daily: 1 }, ghost: true })
            ])
        )
      );
    });
    const festivals = PG.yearFestivals(now, M.holidayChoice(state.settings));
    const sb = PG.sabbatProgress(state.sits, festivals, now);
    const sabbats = kit.section(
      "Sabbat sits",
      kit.card(
        kit.muted("A sit for each festival in your calendars this year, sat on the day. Your calendars are chosen in Settings.") +
          kit.p(sb.total ? `${sb.done.length} of ${sb.total} sat this year` : "No yearly festivals in your calendars yet.") +
          (sb.today ? "" : sb.next ? kit.muted(`Next: ${sb.next.name}, ${kit.fullDate(sb.next.date)}`) : "") +
          kit.actions([
            sb.today ? kit.button({ label: `Sit for ${sb.today.name}`, act: "prog-begin", data: { id: "sabbats", day: 1, step: sb.today.id, intention: `For ${sb.today.name}` }, primary: true }) : "",
            kit.button({ label: "Add to To tend", act: "prog-tend", data: { title: "Sabbat sits", daily: 0 }, ghost: true })
          ])
      )
    );
    return `${head}${kit.notice(state.message, { live: true })}${runs.join("")}${sabbats}`;
  }
  const programmeHandlers = {
    "prog-begin"(el) {
      const { id, day, step, intention } = el.dataset;
      const f = PG.focusFor(id, Number(day), new Date());
      const plan = T.cleanPlan({ ...state.plan, minutes: state.plan.minutes === null || state.plan.minutes < 10 ? 10 : state.plan.minutes });
      const e = { ...X.NO_EXTRAS, kind: f.kind, script: f.script, intention: intention || f.line, programme: id, step: step || String(day) };
      kit.go(url("sit", { ...T.planParams(plan), ...X.extrasParams(e) }));
    },
    async "prog-tend"(el) {
      const title = el.dataset.title;
      try {
        await kit.add(M.TEND_COLLECTION, M.newOwnRecord({ name: title, type: "other", other: "Meditation", rhythm: { kind: el.dataset.daily === "1" ? "daily" : "asks" }, meditations: true }, M.newId()));
        say(`${title} is on your To tend list, and each sit you finish marks it done for the day.`);
      } catch {
        say("That couldn’t be added just now. Please try again.");
      }
    }
  };

  // ── Drawing ────────────────────────────────────────────────────────────
  function draw() {
    const html =
      view === "sit"
        ? sitHtml()
        : view === "breath"
          ? breathHtml()
          : view === "log"
            ? logHtml()
            : view === "patterns"
              ? patternsHtml()
              : view === "mala"
                ? malaHtml()
                : view === "programmes"
                  ? programmesHtml()
                  : view === "listen"
                    ? listenHtml()
                    : homeHtml();
    // Keep open what was open (the plan's sections) across a redraw.
    const open = [...root.querySelectorAll("details[id]")].filter((d) => d.open).map((d) => d.id);
    kit.render(root, html);
    for (const id of open) {
      const d = root.querySelector(`#${CSS.escape(id)}`);
      if (d) d.open = true;
    }
  }

  kit.delegate(root, {
    ...planHandlers,
    ...sitHandlers,
    ...breathHandlers,
    ...logHandlers,
    ...extrasHandlers,
    ...malaHandlers,
    ...programmeHandlers,
    ...listenHandlers,
    begin() {
      kit.go(url("sit", { ...T.planParams(state.plan), ...X.extrasParams(chosen()) }));
    }
  });

  kit.start(async (user) => {
    state.user = user;
    if (view === "sit") {
      if (params.get("focus") === "sigil") await loadSigils();
      sitStart();
    }
    if (view === "home" || view === "programmes") state.settings = await kit.settings();
    if (view === "home") await loadSigils();
    if (view !== "sit" && view !== "breath" && view !== "mala" && view !== "listen") await load();
    if (view === "log") await findKept().catch(() => undefined);
    draw();
  });
})(window);
