/*
 * Today, as the app's Today tab has it (app/src/app/(tabs)/today/index.tsx),
 * in two tabs (js/segmented-switch.js). "Today": the date and the other
 * calendars, the moon and the day's holidays, your next working, your covens,
 * what wants tending, Did it work?, last night's dream, the Deipnon, a card
 * for the day, Set tonight's altar, Reflect and Last time. "Sky & Lore": the
 * day's sky, correspondences, On the horizon and For your practice. The last
 * tab used is kept in this browser; a link with ?tab= or ?section= (or a
 * section's #name) opens the tab holding it. Everything is worked out by the
 * app's own logic (js/core/today.js); the place stays in this browser and is
 * only asked for when you press "Use my location".
 */
(function () {
  "use strict";

  const C = window.SaltCore && window.SaltCore.today;
  const T = window.SaltToday;
  const SW = window.SaltSwitch;
  const root = document.querySelector("[data-page-root]");
  const esc = (text) => (window.SaltPage ? window.SaltPage.esc(text) : String(text ?? ""));
  if (!root) return;
  if (!C || !T || !SW || !C.screenTabs) {
    root.innerHTML = '<p class="sp-notice">Today could not load. Check your connection and refresh the page.</p>';
    return;
  }

  const storage = (() => {
    try {
      return window.localStorage;
    } catch {
      return { getItem: () => null, setItem() {}, removeItem() {} };
    }
  })();

  const state = {
    settings: initialSettings(),
    place: T.readPlace(storage),
    user: null,
    rituals: { plans: T.guestPlans(storage), ...T.guestRituals(storage) },
    // The dream journal (craft_entries `hedge.dreams`), for the morning prompt.
    dreams: [],
    dreamKept: null,
    dreamProblem: "",
    readings: [],
    // My Apothecary's workings (spell jars, sachets…), for "Did it work?".
    apothecary: [],
    message: "",
    tab: firstTab()
  };

  /** The tab a link asks for (?tab=, ?section= or #section), else the one used last, else Today. */
  function firstTab() {
    const tabs = C.screenTabs;
    let linked = null;
    try {
      const params = new URLSearchParams(window.location.search);
      linked = tabs.todayTabFor({ tab: params.get("tab"), section: params.get("section") || window.location.hash });
      if (linked && (params.has("tab") || params.has("section"))) {
        params.delete("tab");
        params.delete("section");
        const search = params.toString();
        window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
      }
    } catch {
      linked = null;
    }
    if (linked) {
      SW.remember(tabs.TODAY_TAB_KEY, linked);
      return linked;
    }
    return SW.remembered(tabs.TODAY_TAB_KEY, tabs.asTodayTab) || "today";
  }

  function setTab(tab, { focus = false } = {}) {
    state.tab = tab;
    SW.remember(C.screenTabs.TODAY_TAB_KEY, tab);
    render();
    if (focus) SW.focus(root, "td-tabs");
  }

  async function loadDreams() {
    if (!window.SaltCraft || !C.dreams) return;
    try {
      state.dreams = (await window.SaltCraft.list(C.dreams.DREAMS)).map((e) => ({ ...e, data: C.dreams.normalizeDream(e.data) }));
    } catch {
      state.dreams = [];
    }
  }

  function initialSettings() {
    try {
      return typeof window.getLocalMySettings === "function" ? window.getLocalMySettings() : {};
    } catch {
      return {};
    }
  }

  // ── Loading what's yours ───────────────────────────────────────────────
  async function loadSettings() {
    try {
      state.settings = (await window.SaltSettings.get()) || {};
    } catch {
      /* keep what this browser has */
    }
    chartSettings = state.settings || {};
  }

  /** Your birth chart's vault (practice/cosmic/astro-store.js), for the line from today's sky to your chart. */
  async function loadChart(user) {
    try {
      if (window.SaltAstroStore) await window.SaltAstroStore.load(user ? user.id : null);
    } catch {
      /* the line is left out */
    }
  }

  /** Plans, the ritual under way and the journal: your account's, or this browser's for guests. */
  async function loadRituals(user) {
    if (!user || !window.db) {
      state.rituals = { plans: T.guestPlans(storage), ...T.guestRituals(storage) };
      return;
    }
    const db = window.db;
    try {
      const [plans, journal, open] = await Promise.all([
        db.from("ritual_plans").select("*").eq("user_id", user.id),
        db.from("user_rituals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        db.from("ritual_sessions").select("*").eq("user_id", user.id).in("status", ["active", "paused"]).order("updated_at", { ascending: false }).limit(1)
      ]);
      let active = null;
      const openRow = !open.error && open.data && open.data[0];
      if (openRow) {
        const steps = await db.from("ritual_session_steps").select("*").eq("session_id", openRow.id).order("sort_order");
        if (!steps.error) active = C.ritualRows.sessionFromRows(openRow, steps.data || []);
      }
      state.rituals = {
        plans: plans.error ? [] : C.planSync.mergePlans([], plans.data || [], user.id),
        journal: journal.error ? [] : journal.data || [],
        active
      };
    } catch {
      state.rituals = { plans: [], journal: [], active: null };
    }
  }

  /** Spell jars, sachets and other workings from My Apothecary, for their look-back days (apothecary_items.metadata.lookBack). */
  async function loadApothecary(user) {
    const shape = (r) => ({ id: r.id, name: r.name || "", typeLabel: r.typeLabel || r.type_label || "", intention: r.intention || "", createdAt: r.createdAt || r.created_at || "", metadata: r.metadata || {} });
    try {
      if (!user || !window.db) {
        const raw = JSON.parse(storage.getItem("saltAndSovereigntyApothecaryItems") || "[]");
        state.apothecary = (Array.isArray(raw) ? raw : []).filter((r) => r && r.id).map(shape);
        return;
      }
      const result = await window.db.from("apothecary_items").select("id,name,type_label,intention,created_at,metadata").eq("user_id", user.id);
      state.apothecary = result.error ? [] : (result.data || []).map(shape);
    } catch {
      state.apothecary = [];
    }
  }

  /** The Hedge reading log (for today's card), as the practice pages read it. */
  async function loadReadings() {
    try {
      const list = window.SaltCraft ? await window.SaltCraft.list(C.readings.READINGS) : [];
      state.readings = list.map((e) => ({ ...e, data: C.readings.normalizeReading(e.data) }));
    } catch {
      state.readings = [];
    }
  }

  // ── The page ───────────────────────────────────────────────────────────
  function compute(now) {
    const raw = state.settings || {};
    // With no calendars chosen, Today follows My path.
    const settings = C.traditions.todaySettings(raw);
    const choice = C.holidays.holidayChoice(settings);
    const primary = C.traditionDay.primaryTradition(settings, choice);
    const place = state.place;
    const lines = C.calendars.todayLines(now, settings, place);
    const events = C.calendars.calendarEventsBetween(now, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60), settings, place);
    const today = C.today.buildToday(now, choice, primary, events);
    const sky = C.sky.skyNow(now, { planets: false });
    const here = place ? C.sky.placeSky(now, place) : null;
    return { settings, choice, lines, today, sky, here, now };
  }

  function render() {
    const now = new Date();
    const m = compute(now);
    const { today, settings } = m;
    const show = settings.today_show || "both";
    const side = show === "both" && settings.today_layout === "side";

    const lead = m.lines.find((l) => l.lead);
    const beside = m.lines.filter((l) => !l.lead);

    const header =
      `<header class="td-header">` +
      (lead ? T.leadLineHtml(lead, esc, "td-lead-details") : "") +
      `<p class="sp-eyebrow td-date">${esc(today.dateLine)}</p>` +
      `<p class="td-ruler">${esc(today.rulerLine)}</p>` +
      (today.tradition ? `<p class="sp-caption td-center">${esc(today.tradition.line)}</p>` : "") +
      (today.tradition && today.tradition.detail ? `<p class="sp-caption td-center sp-muted">${esc(today.tradition.detail)}</p>` : "") +
      T.lineListHtml(beside, esc, "td-line") +
      `</header>`;

    let panels = "";
    const moon = show !== "holiday" ? moonPanel(today, side) : "";
    let holiday = "";
    if (show !== "moon") {
      if (side) holiday = `<div>${today.holidaysToday.length ? holidayPanel(today, true) : ""}</div>`;
      else if (today.holidaysToday.length) holiday = holidayPanel(today, false);
      else if (show === "holiday") holiday = `<p class="sp-caption td-center">No holiday today</p>`;
    }
    // Under the moon when stacked; below the row when side by side, where a half is too narrow.
    const on = T.moonRemindersOn(storage);
    const reminder = `<div class="sp-actions td-reminder"><a class="sp-chip" href="${esc(T.siteHref("/today/reminders"))}" title="Choose which moon phases to be reminded of">${on ? "Moon reminders on" : "Remind me of the moon"}</a></div>`;
    const moonBlock = moon ? (side ? `<div>${moon}</div>` : `<div class="td-panels">${moon}${reminder}</div>`) : "";
    panels = `<section class="td-panels${side ? " td-panels--side" : ""}" aria-label="The moon and today’s holidays">${moonBlock}${holiday}</section>${side ? reminder : ""}`;

    const tabs = { id: "td-tabs", label: "Today", options: C.screenTabs.TODAY_TABS, value: state.tab };
    const content =
      state.tab === "today"
        ? header +
          panels +
          workingCard(m) +
          `<div data-coven-today>${window.CovenToday?.html?.() || ""}</div>` +
          `<div data-tend-today>${window.TendToday?.html?.() || ""}</div>` +
          `<div data-year-today>${window.YearToday?.html?.() || ""}</div>` +
          `<div data-cycle-today>${window.CycleToday?.html?.() || ""}</div>` +
          lookBackCard(m) +
          dreamCard(m) +
          deipnonCard(m) +
          cardOfTheDay(m) +
          `<div class="sp-actions"><a class="button button--ghost" href="${esc(T.siteHref({ pathname: "/altar/[altarId]", params: { altarId: "tonight" } }))}">Set tonight’s altar</a></div>` +
          `<section class="td-prompt" aria-label="Reflect"><p class="sp-eyebrow td-gold">Reflect</p><p class="td-prompt__text">${esc(today.prompt)}</p></section>` +
          lastTimeLine(m) +
          `<p class="td-customise"><a class="td-gold" href="/?sanctuary=settings&amp;settings=today">Customise Today ›</a></p>`
        : daySkyCard(m) + correspondencesCard(today) + horizonSection(today) + practiceCard(m);

    root.innerHTML =
      `<h1 class="sr-only">Today</h1>` +
      SW.html(tabs) +
      SW.panel(tabs, `<div class="td-tab">${content}</div>`) +
      (state.message ? `<p class="sp-notice" role="status">${esc(state.message)}</p>` : "");
  }

  function moonPanel(today, compact) {
    const ref = C.holyRefs.moonRef(today.moon);
    return (
      `<a class="td-moon${compact ? " td-moon--compact" : ""}" href="${esc(T.holyHref(ref))}" aria-label="${esc(`${today.moon.name}. ${today.signLine}. ${today.illuminationLine}. Opens what this phase of the moon means and what it’s good for.`)}">` +
      T.moonDiscSvg(compact ? 80 : 136, today.moon.illumination, today.moon.waxing) +
      `<h2 class="td-moon__phase">${esc(today.moon.name)}</h2>` +
      `<span class="td-moon__sign">${esc(today.signLine)}</span>` +
      `<span class="sp-caption td-center">${esc(today.illuminationLine)}</span>` +
      `</a>`
    );
  }

  function holidayPanel(today, compact) {
    return (
      `<div class="td-holiday${compact ? " td-holiday--compact" : ""}">` +
      today.holidaysToday
        .map(
          (holiday, i) =>
            `<a class="td-holiday__item" href="${esc(T.holyHref(C.holyRefs.holyRef(holiday.id), true))}">` +
            `<span class="sp-eyebrow td-gold">${esc(`${today.holidayWhen[i]} · ${today.holidayTerms[i]}`)}</span>` +
            `<h2 class="td-holiday__name">${esc(holiday.name)}</h2>` +
            `<span class="sp-caption">${esc(holiday.traditions.join(" · "))}</span>` +
            `<span class="td-holiday__meaning">${esc(holiday.meaning)}</span>` +
            `</a>`
        )
        .join("") +
      `</div>`
    );
  }

  function workingCard(m) {
    const { active, plans } = state.rituals;
    const next = C.plans.nextPlan(plans, new Date());
    // A coven's rite or meeting counts as your next working too, whichever comes first.
    const rite = window.CovenToday?.nextRite?.(m.now) || null;
    const covenToday = window.SaltCore?.covens?.today;
    const first = covenToday ? covenToday.nextWorkingFirst(next ? C.plans.planStart(next) : null, rite) : next ? "plan" : null;
    const step = active ? C.lifecycle.currentStep(active) : null;
    let text;
    let button;
    if (active) {
      text =
        `<p class="sp-eyebrow td-gold">${active.status === "paused" ? "Paused" : "Under way"}</p>` +
        `<h2 class="td-card__title">${esc(active.title || "Your ritual")}</h2>` +
        `<p class="sp-caption">${esc(step ? step.title : "Finish and journal it when you are ready.")}</p>`;
      button = `<a class="button button--primary" href="${esc(T.siteHref("/rituals/run"))}">Continue the ritual</a>`;
    } else if (first === "rite") {
      text =
        `<p class="sp-eyebrow td-gold">Your next working</p>` +
        `<h2 class="td-card__title">${esc(rite.title)}</h2>` +
        `<p class="sp-caption">${esc(rite.detail)}</p>` +
        (next ? `<p class="sp-caption">${esc(`Then your own: ${next.title}, ${C.ritualFormat.planWhen(next, m.now)}`)}</p>` : "");
      button = `<a class="button button--primary" href="${esc(rite.href)}">${rite.meeting ? "See the meeting" : "See the rite"}</a>`;
    } else if (next) {
      text =
        `<p class="sp-eyebrow td-gold">Your next working</p>` +
        `<h2 class="td-card__title">${esc(next.title)}</h2>` +
        `<p class="sp-caption">${esc(`${C.ritualFormat.planWhen(next, m.now)} · ${C.ritualFormat.planSky(next)}`)}</p>` +
        (rite ? `<p class="sp-caption">${esc(`Then with ${rite.covenName}: ${rite.title}`)}</p>` : "");
      button = `<a class="button button--primary" href="${esc(T.siteHref({ pathname: "/rituals/plan/[id]", params: { id: next.id } }))}">Open the plan</a>`;
    } else {
      text =
        `<p class="sp-eyebrow td-gold">Your next working</p>` +
        `<h2 class="td-card__title">Nothing planned yet</h2>` +
        `<p class="sp-caption">Choose an intention and we’ll find the right night.</p>`;
      button = `<a class="button button--primary" href="${esc(T.siteHref("/rituals/planner"))}">Plan a ritual</a>`;
    }
    return `<section class="td-card td-card--working" aria-label="Your next working"><div class="td-working-text">${text}</div>${button}</section>`;
  }

  function horizonSection(today) {
    const tiles = today.horizon
      .map((item) => {
        const href = item.kind === "holiday" ? T.holyHref(C.holyRefs.holyRef(item.id), true) : T.holyHref(C.holyRefs.principalRef(item.phase));
        const icon =
          item.kind === "holiday"
            ? T.ICONS[item.title.startsWith("Samhain") ? "samhain" : "wheel"]
            : T.moonDiscSvg(26, T.PHASE_DISC[item.phase].illumination, T.PHASE_DISC[item.phase].waxing, false);
        return (
          `<a class="td-tile" href="${esc(href)}" aria-label="${esc(`${item.title}, ${item.detail}`)}">${icon}` +
          `<span class="td-tile__text"><span class="td-tile__title">${esc(item.title)}</span><span class="sp-caption">${esc(item.detail)}</span></span></a>`
        );
      })
      .join("");
    return (
      `<section class="td-horizon" aria-labelledby="td-horizon-label"><h2 class="sp-eyebrow" id="td-horizon-label" style="color:var(--muted)">On the horizon</h2>` +
      `<div class="td-tiles">${tiles}</div>` +
      `<p class="sp-caption td-center">${esc(today.nextSyzygyLine)}</p>` +
      (today.eclipseLine ? `<p class="sp-caption td-center td-gold">${esc(today.eclipseLine)}</p>` : "") +
      `</section>`
    );
  }

  function practiceRow(label, line, detail, href, gold) {
    return (
      `<a class="td-practice-row" href="${esc(href)}">` +
      `<span class="td-practice-row__text"><span class="td-practice-label">${esc(label)}</span>` +
      `<span class="td-practice-row__line${gold ? " td-gold" : ""}">${esc(line)}</span>` +
      (detail ? `<span class="sp-caption">${esc(detail)}</span>` : "") +
      `</span><span class="td-chev">${T.ICONS.chevron}</span></a>`
    );
  }

  /**
   * In the morning hours, for someone who keeps a dream journal: catch last
   * night's dream in a line or two. It goes into the Grimoire's Dreams.
   */
  function dreamCard(m) {
    if (!C.dreams || !window.SaltCraft) return "";
    // Turned off in Settings → Today (the app's today_dream_prompt; on unless false).
    if (!state.dreamKept && (m.settings?.today_dream_prompt === false || m.settings?.today_dream_prompt === "false")) return "";
    if (state.dreamKept) {
      return (
        `<section class="td-card td-card--working" aria-labelledby="td-dream-label"><h2 class="sp-eyebrow td-gold" id="td-dream-label">Last night’s dream</h2>` +
        `<p>Kept in your Grimoire, with the moon it came under.</p>` +
        `<div class="sp-actions"><a class="button button--ghost" href="/grimoire/dreams/edit/?id=${encodeURIComponent(state.dreamKept)}">Add symbols and feelings</a></div></section>`
      );
    }
    const prompt = C.dreams.morningDreamPrompt(m.now, {
      keepsHedge: C.premade.myPractices(m.settings).includes("hedge"),
      reminderOn: T.dreamReminderOn(storage),
      dreams: state.dreams
    });
    if (!prompt) return "";
    return (
      `<section class="td-card td-card--working" aria-labelledby="td-dream-label"><h2 class="sp-eyebrow td-gold" id="td-dream-label">${esc(prompt.title)}</h2>` +
      `<p class="sp-caption">${esc(prompt.detail)}</p>` +
      `<div class="sp-field"><label for="td-dream-text">What you remember</label><textarea id="td-dream-text" rows="3" placeholder="Even a fragment: a place, a face, a feeling" data-dream-text></textarea></div>` +
      (state.dreamProblem ? `<p class="sp-notice" role="status">${esc(state.dreamProblem)}</p>` : "") +
      `<div class="sp-actions"><button type="button" class="button button--primary" data-dream-keep>Keep it</button>` +
      `<a class="button button--ghost" href="/grimoire/dreams/edit/">Write it in full</a></div></section>`
    );
  }

  /**
   * On Hekate's Deipnon, the last day of the Attic month, for those who keep the
   * Hellenic monthly days or hold Hekate as patron (the app's DeipnonCard).
   * Turned off in Today's calendar settings.
   */
  function deipnonCard(m) {
    const prompt = C.deipnon ? C.deipnon.deipnonToday(m.now, m.settings) : null;
    if (!prompt) return "";
    return (
      `<section class="td-card td-card--working" aria-labelledby="td-deipnon-label"><p class="sp-eyebrow td-gold">Tonight</p>` +
      `<h2 class="td-card__title" id="td-deipnon-label">${esc(prompt.title)}</h2>` +
      `<p class="sp-caption">${esc(prompt.detail)}</p>` +
      `<ul class="td-steps">${prompt.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ul>` +
      `<div class="sp-actions"><a class="button button--primary" href="/divination/draw/?spread=${encodeURIComponent(prompt.spread)}">Draw the Crossroads spread</a></div></section>`
    );
  }

  /** For your practice: a line from each practice kept, your deities, and a working that suits tonight. */
  function practiceCard(m) {
    const { settings, now } = m;
    const practices = C.premade.myPractices(settings);
    const deities = C.patron.deityLines(settings, now);
    if (!practices.length && !deities.length) {
      return (
        `<a class="td-card td-card--working td-card--link" href="${esc(T.siteHref("/more/settings/practice"))}">` +
        `<span class="sp-eyebrow td-gold">For your practice</span>` +
        `<span>Choose the practices you keep, green, kitchen, hedge, cosmic and more, and Today will offer something from each.</span></a>`
      );
    }
    const lines = C.practiceDay.practiceToday(practices, now, { place: state.place, choice: C.holidays.holidayChoice(settings) });
    const working = C.premade.forYou(C.premade.forYouContext(settings, now), undefined, 1)[0] || null;
    return (
      `<section class="td-card td-card--working" aria-labelledby="td-practice-label"><h2 class="sp-eyebrow td-gold" id="td-practice-label">For your practice</h2>` +
      deities.map((line) => practiceRow(line.label, line.line, line.detail, T.siteHref(line.href), line.holyToday)).join("") +
      lines.map((line) => practiceRow(line.label, line.line, line.detail, T.siteHref(line.href), false)).join("") +
      (working
        ? practiceRow("A working for tonight", working.title, working.summary, T.siteHref({ pathname: "/rituals/premade/[id]", params: { id: working.id } }), false)
        : "") +
      `</section>`
    );
  }

  /** A card for the day: one to draw, or the one kept today (the app's CardOfTheDay). Turned off in Today's calendar settings. */
  function cardOfTheDay(m) {
    if (!C.daily.drawOnToday(state.settings)) return "";
    const kept = C.daily.todaysCard(state.readings, m.now);
    // A spread for the time: the new or full moon, or Samhain (the app's CardOfTheDay too).
    const time = C.seasonal ? C.seasonal.seasonalSpreads(m.now, { south: C.seasonal.keepsSouthernWheel(state.settings) })[0] : null;
    const seasonal = time
      ? `<a class="td-last sp-caption" href="/divination/draw/?spread=${encodeURIComponent(time.spread)}" aria-label="${esc(`${time.why}. Draw the ${time.label} spread.`)}"><span>${esc(
          time.why
        )}: <span class="td-gold">${esc(time.label)}</span> ›</span></a>`
      : "";
    if (!kept) return `<a class="td-last sp-caption td-gold" href="/divination/draw/?spread=daily">Draw a card for the day ›</a>${seasonal}`;
    const name = C.daily.todaysCardLabel(kept);
    return (
      `<a class="td-last sp-caption" href="/divination/reading/?id=${encodeURIComponent(kept.id)}" aria-label="${esc(`Today’s card: ${name}. Opens the reading.`)}">` +
      `<span>Today’s card: <span class="td-gold">${esc(name)}</span> ›</span></a>${seasonal}`
    );
  }

  /** Astrology terms tappable (js/astro-terms.js) where the page loads them. */
  const astroText = (text) => (window.SaltAstroTerms ? window.SaltAstroTerms.html(text) : esc(text));

  /** One line from today's sky to your own birth chart (kept privately by practice/cosmic/astro-store.js), when you've entered it. */
  function chartTodayLine(now) {
    const A = window.SaltCore && window.SaltCore.astro;
    const ST = window.SaltAstroStore;
    const saved = ST && ST.state.phase === "open" ? ST.myChart() : null;
    if (!A || !saved) return "";
    try {
      const chart = A.natal.castChart(saved.input, A.prefs.chartOptionsFrom(chartSettings));
      const line = chart && A.craftLinks.todayLine(chart, now);
      return line ? `<p class="sp-caption"><a class="td-link td-gold" href="/practice/cosmic/chart/?tab=transits">Your chart today ›</a></p><p class="sp-caption">${astroText(line.line)}</p>` : "";
    } catch {
      return "";
    }
  }
  let chartSettings = {};

  /** What today is good for, and what the sky is doing that matters for it. */
  function daySkyCard(m) {
    const { today, sky, here, now } = m;
    const lines = T.daySkyLines(C, sky, now);
    let where;
    if (here) {
      where =
        `<p class="sp-caption">${esc(T.riseSetLine(C, here))}</p>` +
        (here.hour ? `<p class="sp-caption"><a class="td-link td-gold" href="/practice/cosmic/hours/?planet=${encodeURIComponent(here.hour.planet)}">${esc(`Planetary hour of ${here.hour.planet} until ${C.calendar.timeOfDay(here.hour.end)}`)} ›</a></p>` : "");
    } else {
      where =
        `<p class="sp-caption">Add your location on the <a class="td-link" href="/today/sky/">Sky page</a> for sunrise, moonrise and planetary hours. It stays in this browser and is never sent anywhere.</p>` +
        `<div class="sp-actions"><button type="button" class="button button--ghost" data-use-location>Use my location</button></div>`;
    }
    return (
      `<section class="td-card" aria-labelledby="td-sky-label"><h2 class="sp-eyebrow td-gold" id="td-sky-label">Today’s sky</h2>` +
      `<p class="td-good-for">${astroText(today.goodFor)}</p>` +
      lines.map((line) => `<p class="sp-caption">${astroText(line)}</p>`).join("") +
      chartTodayLine(now) +
      where +
      `<a class="button button--ghost" href="/today/sky/">The sky today</a></section>`
    );
  }

  let libraryEntries = null;
  function libraryLink(name) {
    try {
      if (!libraryEntries) libraryEntries = C.library.traditionalEntries();
      return T.libraryHref(C.library.findByName(libraryEntries, name));
    } catch {
      return null;
    }
  }

  function tags(items) {
    return (
      `<div class="td-tags">` +
      items
        .map((name) => {
          const href = libraryLink(name);
          return href ? `<a class="td-tag" href="${esc(href)}">${esc(name)}</a>` : `<span class="td-tag">${esc(name)}</span>`;
        })
        .join("") +
      `</div>`
    );
  }

  /** The weekday's traditional correspondences, linked to the Living Library where it has them. */
  function correspondencesCard(today) {
    const c = today.correspondences;
    const planet = c.planet === "Sun" || c.planet === "Moon" ? `the ${c.planet}` : c.planet;
    const row = (label, text) => `<div class="td-corr"><span class="td-corr__label">${esc(label)}</span><span>${esc(text)}</span></div>`;
    return (
      `<section class="td-card" aria-labelledby="td-corr-label"><h2 class="sp-eyebrow td-gold" id="td-corr-label">${esc(`Correspondences · ${planet}`)}</h2>` +
      `<p class="sp-caption"><a class="td-link td-gold" href="/practice/cosmic/planet/?planet=${encodeURIComponent(c.planet)}">${esc(`${c.planet}: its day, hours, gods and full guide`)} ›</a></p>` +
      row("Colors", c.colors.join(", ")) +
      `<div class="td-corr"><span class="td-corr__label">Crystals</span>${tags(c.crystals)}</div>` +
      `<div class="td-corr"><span class="td-corr__label">Herbs</span>${tags(c.herbs)}</div>` +
      row("Metal", c.metal) +
      row("Incense", c.incense) +
      row("Candle", c.candle) +
      `</section>`
    );
  }

  /** "Did it work?" once a ritual, spell, spell jar or sachet's look-back day has come; answered on the journal page. */
  function lookBackCard(m) {
    let due = [];
    try {
      due = [
        ...C.lookBack.dueLookBacks(state.rituals.journal || [], m.now).map((e) => e.title || "Untitled Ritual"),
        ...C.apothecaryLookBack.dueItems(state.apothecary || [], m.now).map((i) => i.name || i.typeLabel || "Your working")
      ];
    } catch {
      due = [];
    }
    if (!due.length) return "";
    const first = due[0];
    return (
      `<section class="td-card td-card--working" aria-label="Did it work?"><div class="td-working-text">` +
      `<p class="sp-eyebrow td-gold">Did it work?</p>` +
      `<h2 class="td-card__title">${esc(first)}</h2>` +
      `<p class="sp-caption">${esc(due.length > 1 ? `Its look-back day has come, and ${due.length - 1} more are waiting.` : "Its look-back day has come. Yes, partly, not yet or no?")}</p>` +
      `</div><a class="button button--primary" href="/rituals/journal/insights/#did-it-work">Look back</a></section>`
    );
  }

  const PRINCIPAL = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"];

  /** On a new, quarter or full moon: what you did last time the moon looked like this. */
  function lastTimeLine(m) {
    let last = null;
    try {
      last = C.insights.journalInsights(state.rituals.journal || [], m.now).lastThisPhase;
    } catch {
      last = null;
    }
    if (!last || !PRINCIPAL.includes(last.phase)) return "";
    const title = last.entry.title || "a ritual";
    return (
      `<a class="td-last sp-caption" href="${esc(T.siteHref({ pathname: "/today/journal/[id]", params: { id: last.entry.id } }))}" aria-label="${esc(`Last ${last.phase} you kept ${title}. Opens your journal.`)}">` +
      `<span>${esc(`Last ${last.phase} you kept `)}<span class="td-gold">“${esc(title)}”</span> ›</span></a>`
    );
  }

  // ── Events ─────────────────────────────────────────────────────────────
  T.bindToggles(root);
  SW.bind(root, "td-tabs", (tab, how) => setTab(tab, how));
  // The Today tab in the site's bar, pressed while already here, goes back to the first tab.
  document.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest('a[data-site-tab="today"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (state.tab !== "today") setTab("today");
    window.scrollTo({ top: 0 });
  });
  root.addEventListener("click", async (event) => {
    const keep = event.target.closest("[data-dream-keep]");
    if (keep) {
      const text = root.querySelector("[data-dream-text]")?.value || "";
      if (!text.trim()) return;
      keep.disabled = true;
      keep.textContent = "Keeping it…";
      try {
        const entry = await window.SaltCraft.add(C.dreams.DREAMS, C.dreams.quickDream(text, new Date()));
        state.dreamKept = entry.id;
        state.dreamProblem = "";
        await loadDreams();
      } catch (error) {
        console.error(error);
        state.dreamProblem = "It couldn’t be kept just now. Your words are still here; try again in a moment.";
        render();
        const box = root.querySelector("[data-dream-text]");
        if (box) box.value = text;
        return;
      }
      render();
      return;
    }
    const button = event.target.closest("[data-use-location]");
    if (!button) return;
    button.disabled = true;
    button.textContent = "Finding where you are…";
    const { result, place } = await T.askBrowserLocation(storage, navigator.geolocation);
    if (result === "ok") {
      state.place = place;
      state.message = "Location set. It stays in this browser.";
    } else {
      state.message =
        result === "denied"
          ? "Location wasn’t allowed. You can allow it in your browser’s settings, or enter it on the Sky page."
          : "This browser couldn’t find your location. You can enter it on the Sky page.";
    }
    render();
  });

  let refreshing = false;
  async function refresh(user) {
    if (refreshing) return;
    refreshing = true;
    try {
      state.user = user;
      await Promise.all([loadSettings(), loadRituals(user), loadDreams(), loadReadings(), loadApothecary(user), loadChart(user)]);
    } finally {
      refreshing = false;
    }
    render();
  }

  render();
  if (window.SaltPage) {
    window.SaltPage.ready().then(refresh);
    window.SaltPage.onUserChange((user) => {
      if ((user && user.id) !== (state.user && state.user.id)) refresh(user);
    });
  }
  window.addEventListener("saltSettingsChanged", () => loadSettings().then(render));
  window.addEventListener("covenTodayLoaded", () => render());
  window.addEventListener("storage", (event) => {
    if (event.key === T.PLACE_KEY) {
      state.place = T.readPlace(storage);
      render();
    }
  });

  // A quarter-hourly clock for the void-of-course Moon and planetary hours,
  // and a fresh day after midnight. Keep any open calendar line open.
  setInterval(() => {
    if (!root.querySelector('[data-td-toggle][aria-expanded="true"]') && !root.contains(document.activeElement)) render();
  }, 15 * 60000);
})();
