/*
 * Reminders (the app's Reminders, opened from Today, Rituals and More): moon
 * phases, planned rituals, daily devotions, the morning dream nudge; and
 * holidays from your calendars (Hekate's Deipnon and your deities' sacred
 * days among them), tending (plants, altars, offerings, crystals, candles),
 * ritual planning for your holidays and covens, quiet hours and a pause. A
 * browser can't ring at a set time, so the website hands them to your own
 * calendar: one .ics file, or Google Calendar links one by one. The moon,
 * ritual, devotion and dream choices stay in this browser, as the app keeps
 * them on the phone; the rest are Sanctuary settings (`reminders_v2`), the
 * same choices as in the app, and give the same reminders.
 *
 * Needs: js/core/guides.js, js/guides-ui.js, reminders/reminders-logic.js,
 * js/salt-store.js (SaltPage, SaltSettings) and window.db when signed in.
 */
(function (global) {
  const root = global.document.querySelector("[data-page-root]");
  const G = global.SaltCore?.guides;
  const L = global.RemindersLogic;
  const { esc, header, unavailable } = global.GuidesUI;
  if (!G?.schedule || !L) return unavailable(root, "Reminders");
  const store = (() => {
    try {
      return global.localStorage;
    } catch {
      return null;
    }
  })();

  const NOTE_EXAMPLES = {
    new: "e.g. Write your intentions",
    firstQuarter: "e.g. Check in on your intention",
    full: "e.g. Charge your crystals in the moonlight",
    lastQuarter: "e.g. Clear out what you’re done with",
  };
  const LEAD_LABELS = { 15: "15 minutes before", 60: "An hour before", 180: "Three hours before" };
  const KIND_NAMES = {
    moon: { title: "Moon phase events", plural: "moon phase" },
    holiday: { title: "Holiday events", plural: "holiday" },
    astro: { title: "Eclipse & retrograde events", plural: "eclipse and retrograde" },
  };
  const DURATION_LABELS = { 30: "30 minutes", 60: "1 hour", 120: "2 hours" };
  const SHOWN_EVENTS = 12;

  let settings = L.loadReminders(store, G);
  let calendar = L.loadCalendar(store, G);
  let plans = [];
  let appSettings = {};
  let signedIn = false;
  let prefs = L.loadPrefs({}, settings, G);
  let sources = null;
  let covens = [];
  const P = G.reminderPrefs;

  const now = () => new Date();
  const dayLabel = (date) => date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const timeValue = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  const fromTime = (value) => {
    const [h, m] = String(value || "").split(":").map(Number);
    return Number.isInteger(h) && Number.isInteger(m) ? h * 60 + m : null;
  };

  const toggle = (id, label, detail, on, attrs = "") => `<label class="gd-toggle" for="${id}">
      <input type="checkbox" id="${id}" ${on ? "checked" : ""} ${attrs} />
      <span class="gd-toggle__text"><span class="sp-row__title">${esc(label)}</span>${detail ? `<span class="sp-caption">${esc(detail)}</span>` : ""}</span>
    </label>`;
  const chip = (attrs, label, pressed) => `<button type="button" class="sp-chip" ${attrs} aria-pressed="${pressed}">${esc(label)}</button>`;

  function moonHtml() {
    const anyPhase = G.schedule.PHASE_ORDER.some((p) => settings.phases[p]);
    const phases = G.schedule.PHASE_ORDER.map((phase) => {
      const name = G.moon.PRINCIPAL_NAMES[phase];
      const note = settings.phases[phase]
        ? `<div class="sp-field"><label for="gd-note-${phase}">Your note for the ${esc(name)}</label>
           <input id="gd-note-${phase}" type="text" maxlength="${G.schedule.NOTE_MAX}" data-note="${phase}" value="${esc(settings.notes[phase])}" placeholder="${esc(NOTE_EXAMPLES[phase])}" /></div>`
        : "";
      return `${toggle(`gd-phase-${phase}`, name, `Next: ${dayLabel(G.moon.nextPhase(now(), phase))}`, settings.phases[phase], `data-phase="${phase}"`)}${note}`;
    }).join("");
    const also = anyPhase
      ? `<section class="sp-section" aria-labelledby="gd-also"><h2 class="sp-label" id="gd-also">Also remind me</h2>
        <p class="sp-caption">You’ll always hear on the day itself. Add earlier heads-ups if you’d like time to prepare.</p>
        <div class="sp-chips" role="group" aria-label="Also remind me">
          ${chip('data-also="dayBefore"', "The day before", settings.dayBefore)}
          ${G.schedule.DAYS_AHEAD_CHOICES.map((d) => chip(`data-ahead="${d}"`, d === 7 ? "A week before" : `${d} days before`, settings.daysAhead.includes(d))).join("")}
          ${chip('data-also="atExact"', "At the exact moment", settings.atExact)}
        </div></section>
        <section class="sp-section" aria-labelledby="gd-at"><h2 class="sp-label" id="gd-at">At</h2>
        <div class="gd-time"><label class="sr-only" for="gd-phase-time">Time for moon reminders</label>
          <input id="gd-phase-time" type="time" step="900" value="${timeValue(settings.phaseHour * 60 + settings.phaseMinute)}" data-phase-time /></div>
        <p class="sp-caption">Every reminder but the exact-moment one comes at this time, to the quarter hour.</p></section>`
      : "";
    return `<section class="sp-section" aria-labelledby="gd-moon"><h2 class="sp-label" id="gd-moon">Moon phases</h2>
      <div class="sp-card">${phases}</div></section>${also}`;
  }

  function ritualsHtml() {
    return `<section class="sp-section" aria-labelledby="gd-rituals"><h2 class="sp-label" id="gd-rituals">Planned rituals</h2>
      <div class="sp-card">
        ${toggle("gd-rituals-on", "Remind me before a planned ritual", signedIn ? "Your plans from your account" : "Plans kept in this browser", settings.rituals, "data-rituals")}
        ${settings.rituals ? `<div class="sp-chips" role="group" aria-label="How long before">${G.schedule.LEAD_CHOICES.map((m) => chip(`data-lead="${m}"`, LEAD_LABELS[m], settings.ritualLeadMinutes === m)).join("")}</div>` : ""}
        <p class="sp-caption">${plans.length ? `${plans.filter((p) => !p.doneAt).length} planned ${plans.filter((p) => !p.doneAt).length === 1 ? "ritual" : "rituals"} found.` : "No planned rituals yet."} Plan one under <a class="gd-link" href="/altar/?ritual=1">Rituals</a>, then come back for a fresh file.</p>
      </div></section>`;
  }

  const timeField = (id, label, minutes, attr) =>
    `<div class="gd-time"><label for="${id}">${esc(label)}</label><input id="${id}" type="time" value="${timeValue(minutes)}" ${attr} /></div>`;

  function devotionHtml() {
    return `<section class="sp-section" aria-labelledby="gd-devotion"><h2 class="sp-label" id="gd-devotion">Daily devotion</h2>
      <div class="sp-card">
        ${toggle("gd-dev-morning", "Morning devotion", "A short prompt to begin the day", settings.devotionMorning, 'data-devotion="devotionMorning"')}
        ${settings.devotionMorning ? timeField("gd-dev-morning-at", "Morning at", settings.devotionMorningAt, 'data-minutes="devotionMorningAt"') : ""}
        ${toggle("gd-dev-evening", "Evening devotion", "A short prompt to close the day", settings.devotionEvening, 'data-devotion="devotionEvening"')}
        ${settings.devotionEvening ? timeField("gd-dev-evening-at", "Evening at", settings.devotionEveningAt, 'data-minutes="devotionEveningAt"') : ""}
        <p class="sp-caption">Two weeks of prompts at a time, from <a class="gd-link" href="/practice/solitary/devotion/">Daily devotion</a>.</p>
      </div></section>`;
  }

  function dreamsHtml() {
    return `<section class="sp-section" id="gd-dreams" aria-labelledby="gd-dreams-label"><h2 class="sp-label" id="gd-dreams-label">Dreams</h2>
      <div class="sp-card">
        ${toggle("gd-dream-morning", "Last night’s dream", "A gentle morning nudge: write down last night’s dream", settings.dreamMorning, 'data-dream-morning')}
        ${settings.dreamMorning ? timeField("gd-dream-morning-at", "Each morning at", settings.dreamMorningAt, 'data-minutes="dreamMorningAt"') : ""}
        <p class="sp-caption">Two weeks of mornings at a time, for the <a class="gd-link" href="/grimoire/dreams/">Dreams</a> in your Grimoire.</p>
      </div></section>`;
  }

  // ── Holidays, tending, planning, quiet hours: the synced choices ─────────

  const get = (path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), prefs);
  const timeLabel = (m) => P.timeLabel(m);
  const slug = (text) => String(text).replace(/[^a-z0-9-]+/gi, "-");
  const leadChips = (path, value) =>
    `<div class="sp-chips" role="group" aria-label="How far ahead">${P.LEAD_DAY_CHOICES.map((d) => chip(`data-leads="${esc(path)}" data-day="${d}"`, P.leadLabel(d), (value || []).includes(d))).join("")}</div>`;
  const prefTime = (id, label, path) => timeField(id, label, get(path), `data-pt="${esc(path)}"`);
  const prefToggle = (id, label, detail, path) => toggle(id, label, detail, !!get(path), `data-p="${esc(path)}"`);
  const valueChip = (path, value, label, pressed) => chip(`data-pv="${esc(path)}" data-v="${esc(JSON.stringify(value))}"`, label, pressed);

  /** How often: every few days, or on chosen weekdays. `path` holds { every, weekdays }; `fallback` fills in what it doesn't. */
  function repeatHtml(path, fallback) {
    const own = get(path) || {};
    const every = own.every ?? fallback?.every ?? 7;
    const weekdays = own.weekdays ?? fallback?.weekdays ?? [];
    const byDay = weekdays.length > 0;
    return `<div class="sp-chips" role="group" aria-label="How often">
        ${chip(`data-rep="${esc(path)}" data-mode="days"`, "Every few days", !byDay)}${chip(`data-rep="${esc(path)}" data-mode="weekdays"`, "On chosen days", byDay)}
      </div>
      <div class="sp-chips" role="group" aria-label="${byDay ? "Which days" : "How many days"}">${
        byDay
          ? P.WEEKDAY_NAMES.map((name, d) => chip(`data-rep="${esc(path)}" data-wd="${d}" aria-label="${name}"`, name.slice(0, 3), weekdays.includes(d))).join("")
          : P.EVERY_CHOICES.map((n) => chip(`data-rep="${esc(path)}" data-every="${n}"`, P.repeatLabel({ every: n, weekdays: [] }), every === n)).join("")
      }</div>`;
  }

  function overviewHtml() {
    const lines = P.summaries(prefs, appSettings, now());
    const row = (href, title, line) => `<li><a class="gd-link" href="${href}">${esc(title)}</a> <span class="sp-caption">${esc(line)}</span></li>`;
    return `<section class="sp-section" aria-labelledby="gd-overview"><h2 class="sp-label" id="gd-overview">Your reminders</h2>
      <div class="sp-card"><ul class="gd-events">
        ${row("#gd-holidays", "Holidays", lines.holidays)}
        ${row("#gd-tending", "Tending", lines.tending)}
        ${row("#gd-planning", "Ritual planning", lines.planning)}
        ${row("#gd-quiet", "Quiet hours and pause", lines.quiet)}
      </ul>
      <p class="sp-caption">${signedIn ? "These follow you to the app on your phone, where they ring." : "Kept in this browser. Sign in and they follow you to the app."} The moon, rituals, devotion and dreams below are kept in this browser.</p></div></section>`;
  }

  const fold = (text) => String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const openCalendars = new Set();
  const openTimings = new Set();

  function holidayRow(group, item) {
    const h = prefs.holidays;
    const itemOn = P.holidayOn(prefs, group.id, item.baseId);
    const ownLeads = h.leadsFor[item.baseId];
    const next = item.next.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    const detail = `Next: ${next}${item.recurs === "monthly" ? " · every month" : ""}${itemOn ? ` · ${P.leadsLabel(P.leadsOf(prefs, group.id, item.baseId))}` : ""}`;
    const timing = itemOn
      ? `<details class="sp-details" data-timing="${esc(item.baseId)}" ${openTimings.has(item.baseId) ? "open" : ""}><summary>${ownLeads ? "Its own timing" : "Change its timing"}</summary>
          <div class="sp-chips">${chip(`data-unset="holidays.leadsFor.${esc(item.baseId)}"`, "As its calendar", !ownLeads)}</div>
          ${leadChips(`holidays.leadsFor.${item.baseId}`, ownLeads)}</details>`
      : "";
    return `<li data-hol-row="${esc(group.id)}" data-name="${esc(fold(item.name))}">${toggle(slug(`gd-hol-${group.id}-${item.baseId}`), item.name, detail, itemOn, `data-hol="${esc(group.id)}|${esc(item.baseId)}"`)}${timing}</li>`;
  }

  function calendarHtml(group) {
    const h = prefs.holidays;
    const on = P.calendarOn(prefs, group.id);
    const own = h.calendars[group.id]?.leads;
    const ids = group.items.map((i) => i.baseId).join(",");
    const chosen = group.items.filter((i) => P.holidayOn(prefs, group.id, i.baseId)).length;
    return `<details class="sp-details" data-cal-open="${esc(group.id)}" ${openCalendars.has(group.id) ? "open" : ""}>
      <summary>${esc(group.name)} <span class="sp-caption">${on ? `${chosen} of ${group.items.length} · ${esc(P.leadsLabel(own || h.leads))}` : "Off"}</span></summary>
      <p class="sp-caption">${esc(group.detail)}</p>
      ${toggle(slug(`gd-cal-${group.id}`), `Remind me of the ${group.name}`, "", on, `data-cal="${esc(group.id)}"`)}
      ${on ? `<fieldset class="gd-fieldset"><legend>How far ahead</legend><div class="sp-chips">${valueChip(`holidays.calendars.${group.id}`, { on: true }, `As all calendars (${P.leadsLabel(h.leads)})`, !own)}</div>${leadChips(`holidays.calendars.${group.id}.leads`, own)}</fieldset>` : ""}
      <div class="sp-chips" role="group" aria-label="All or none">${chip(`data-cal-all="${esc(group.id)}" data-on="1" data-ids="${esc(ids)}"`, "All", false)}${chip(`data-cal-all="${esc(group.id)}" data-on="0" data-ids="${esc(ids)}"`, "None", false)}</div>
      ${group.items.length > 8 ? `<div class="sp-field"><label for="${slug(`gd-find-${group.id}`)}">Find a holiday</label><input id="${slug(`gd-find-${group.id}`)}" type="search" data-hol-search="${esc(group.id)}" placeholder="e.g. Samhain" /></div>` : ""}
      <ul class="gd-events" data-hol-list="${esc(group.id)}">${group.items.map((item) => holidayRow(group, item)).join("")}</ul>
    </details>`;
  }

  function holidaysHtml() {
    const h = prefs.holidays;
    const catalog = G.reminderHolidays.holidayCatalog(appSettings, now());
    return `<section class="sp-section" id="gd-holidays" aria-labelledby="gd-holidays-label"><h2 class="sp-label" id="gd-holidays-label">Holidays</h2>
      <div class="sp-card">
        ${prefToggle("gd-hol-on", "Remind me of my holidays", "From the calendars you keep and show in Settings → Calendar & holidays, Hekate’s Deipnon, and your deities’ sacred days", "holidays.on")}
        ${
          h.on
            ? `<fieldset class="gd-fieldset"><legend>How far ahead</legend>${leadChips("holidays.leads", h.leads)}</fieldset>
              ${prefTime("gd-hol-at", "At", "holidays.at")}
              ${catalog.length ? catalog.map(calendarHtml).join("") : `<p class="sp-caption">No calendars yet. Choose the ones you keep in <a class="gd-link" href="/today/calendar/">Calendar & holidays</a>.</p>`}`
            : ""
        }
        <p class="sp-caption">Your deities come from <a class="gd-link" href="/more/settings/deities/">My deities</a>; Hekate’s Deipnon can be turned off in <a class="gd-link" href="/today/calendar/">Calendar & holidays</a>.</p>
      </div></section>`;
  }

  function plantRows(t, src) {
    return src.plants
      .map((plant) => {
        const own = t.plants.per[plant.id] || {};
        const mode = own.mode || t.plants.mode;
        const name = plant.who[0].toUpperCase() + plant.who.slice(1);
        const base = `tending.plants.per.${plant.id}`;
        const detail =
          own.on === false
            ? "No reminders"
            : `${mode === "thirsty" ? `When thirsty (every ${plant.waterEvery} ${plant.waterEvery === 1 ? "day" : "days"})` : P.repeatLabel({ every: own.every ?? t.plants.every, weekdays: own.weekdays ?? t.plants.weekdays })} at ${timeLabel(own.at ?? t.plants.at)}`;
        const ownWay =
          own.on !== false
            ? `<details class="sp-details"><summary>Its own way</summary>
                <div class="sp-chips">${valueChip(`${base}.mode`, "thirsty", "When it’s thirsty", mode === "thirsty")}${valueChip(`${base}.mode`, "schedule", "On a schedule", mode === "schedule")}${valueChip(base, { on: true }, "As the others", false)}</div>
                ${mode === "schedule" ? repeatHtml(base, t.plants) : ""}
                ${timeField(slug(`gd-plant-at-${plant.id}`), "At", own.at ?? t.plants.at, `data-pt="${esc(base)}.at"`)}</details>`
            : "";
        return `${toggle(slug(`gd-plant-${plant.id}`), name, detail, own.on !== false, `data-p="${esc(base)}.on"`)}${ownWay}`;
      })
      .join("");
  }

  function tendingHtml() {
    const t = prefs.tending;
    const src = sources || { altars: [], plants: [], offerings: [], crystals: [], candles: [] };
    const plants = t.plants.on
      ? `<div class="sp-chips">${valueChip("tending.plants.mode", "thirsty", "When it’s thirsty", t.plants.mode === "thirsty")}${valueChip("tending.plants.mode", "schedule", "On a schedule", t.plants.mode === "schedule")}</div>
        <p class="sp-caption">${t.plants.mode === "thirsty" ? "Each plant asks on the day it comes due, by how often you water it and when you last did." : "On a fixed schedule, whether or not it was watered lately."}</p>
        ${t.plants.mode === "schedule" ? repeatHtml("tending.plants") : ""}
        ${prefTime("gd-plants-at", "At", "tending.plants.at")}
        ${plantRows(t, src)}
        ${sources && !src.plants.length ? `<p class="sp-caption">No potted plants on your altars yet.</p>` : ""}`
      : "";
    const altars = t.altars.on
      ? `${repeatHtml("tending.altars")}${prefTime("gd-altars-at", "At", "tending.altars.at")}
        ${src.altars.length > 1 ? `<fieldset class="gd-fieldset"><legend>Which altars (none chosen means all of them)</legend><div class="sp-chips">${src.altars.map((a) => chip(`data-altar="${esc(a.id)}"`, a.name || "Unnamed altar", t.altars.ids.includes(a.id))).join("")}</div></fieldset>` : ""}`
      : "";
    const offerings = `${t.offerings.on ? `<div class="sp-chips">${valueChip("tending.offerings.lead", 0, "On the day", t.offerings.lead === 0)}${valueChip("tending.offerings.lead", 1, "The day before", t.offerings.lead === 1)}</div>${prefTime("gd-off-at", "At", "tending.offerings.at")}` : ""}
      ${prefToggle("gd-off-refresh", "A regular refresh", "Fresh water, a flower or a little food, on a rhythm you choose", "tending.offerings.refresh")}
      ${t.offerings.refresh ? `${repeatHtml("tending.offerings")}${prefTime("gd-off-refresh-at", "At", "tending.offerings.refreshAt")}` : ""}`;
    const crystals = t.crystals.on
      ? `<div class="sp-chips">${P.CRYSTAL_CADENCES.map((c) => valueChip("tending.crystals.cadence", c.value, c.label, t.crystals.cadence === c.value)).join("")}</div>
        ${t.crystals.cadence === "weeks" ? `<div class="sp-chips">${[1, 2, 4, 6, 8].map((w) => valueChip("tending.crystals.weeks", w, w === 1 ? "Every week" : `Every ${w} weeks`, t.crystals.weeks === w)).join("")}</div>` : ""}
        ${prefTime("gd-crystals-at", "At", "tending.crystals.at")}
        ${src.crystals.map((c) => toggle(slug(`gd-crystal-${c.id}`), c.name, `${c.where} · ${G.reminderPlan.crystalAdvice(c, t.crystals.cadence !== "weeks").replace(/^[^:]+: /, "")}`, !t.crystals.off.includes(c.id), `data-crystal="${esc(c.id)}"`)).join("")}`
      : "";
    const candles = `${prefToggle("gd-candle-end", "When a candle is nearly burned down", "A candle burning on one of your altars, so you can be there at the end", "tending.candles.nearEnd")}
      ${t.candles.nearEnd ? `<div class="sp-chips">${P.NEAR_END_CHOICES.map((m) => valueChip("tending.candles.nearEndMinutes", m, m === 60 ? "An hour before" : `${m} minutes before`, t.candles.nearEndMinutes === m)).join("")}</div>` : ""}
      ${prefToggle("gd-candle-relight", "To light a candle working again", "A candle you’ve burned part-way, a day at a time", "tending.candles.relight")}
      ${t.candles.relight ? prefTime("gd-candle-relight-at", "At", "tending.candles.relightAt") : ""}
      ${prefToggle("gd-candle-daily", "A daily candle practice", "Each day, a nudge to light a candle and sit with its flame", "tending.candles.daily")}
      ${t.candles.daily ? prefTime("gd-candle-daily-at", "At", "tending.candles.dailyAt") : ""}`;
    return `<section class="sp-section" id="gd-tending" aria-labelledby="gd-tending-label"><h2 class="sp-label" id="gd-tending-label">Tending</h2>
      ${sources ? "" : `<p class="sp-caption">Reading your altars…</p>`}
      <div class="sp-card"><h3>Plants</h3>${prefToggle("gd-plants-on", "Remind me to water my plants", "The potted plants on your altars. A plant taken off its altar stops asking.", "tending.plants.on")}${plants}</div>
      <div class="sp-card"><h3>Altars</h3>${prefToggle("gd-altars-on", "Remind me to tend my altar", "Dust it, refresh its water, light what wants lighting", "tending.altars.on")}${altars}</div>
      <div class="sp-card"><h3>Offerings</h3>${prefToggle("gd-off-on", "When an offering is going over", "Water drying, flowers wilting, bread going stale", "tending.offerings.on")}${offerings}</div>
      <div class="sp-card"><h3>Crystals</h3>${prefToggle("gd-crystals-on", "Remind me to cleanse and charge my crystals", "With how to care for each: no water for soft stones, no sun for those that fade", "tending.crystals.on")}${crystals}</div>
      <div class="sp-card"><h3>Candles</h3>${candles}</div>
    </section>`;
  }

  const daysWord = (d) => (d === 7 ? "A week" : d === 14 ? "Two weeks" : d === 21 ? "Three weeks" : d === 30 ? "A month" : `${d} days`);

  function planningHtml() {
    const p = prefs.planning;
    const covenRows = covens
      .map((coven) => {
        const own = G.reminderPlan.covenPlanning(prefs, coven);
        return `${toggle(slug(`gd-coven-${coven.id}`), coven.name, `${coven.leader ? "You lead it" : "A member"} · ${own.on ? `${daysWord(own.days).toLowerCase()} ahead` : "off"}`, own.on, `data-coven="${esc(coven.id)}"`)}
          ${own.on ? `<div class="sp-chips">${P.PLAN_DAY_CHOICES.map((d) => valueChip(`planning.perCoven.${coven.id}.days`, d, daysWord(d), own.days === d)).join("")}</div>` : ""}`;
      })
      .join("");
    return `<section class="sp-section" id="gd-planning" aria-labelledby="gd-planning-label"><h2 class="sp-label" id="gd-planning-label">Ritual planning</h2>
      <div class="sp-card"><h3>Your holidays</h3>
        ${prefToggle("gd-plan-on", "Remind me to plan a ritual", "Before each yearly holiday you’ve chosen above, unless you’ve already planned one for it", "planning.holidays")}
        ${p.holidays ? `<div class="sp-chips">${P.PLAN_DAY_CHOICES.map((d) => valueChip("planning.days", d, `${daysWord(d)} before`, p.days === d)).join("")}</div>` : ""}
        ${prefTime("gd-plan-at", "At", "planning.at")}
      </div>
      <div class="sp-card"><h3>Your covens</h3>
        ${prefToggle("gd-plan-covens", "For my covens’ holidays and rites", "On for covens you lead (as head of the coven, or in a position that leads or schedules rites), and earlier; for others, only if you turn it on", "planning.covens")}
        ${
          p.covens
            ? `<fieldset class="gd-fieldset"><legend>For covens you lead</legend><div class="sp-chips">${P.PLAN_DAY_CHOICES.map((d) => valueChip("planning.leaderDays", d, `${daysWord(d)} before`, p.leaderDays === d)).join("")}</div></fieldset>
              ${covenRows || `<p class="sp-caption">${signedIn ? "No covens yet." : "Sign in to hear about your covens."}</p>`}
              <p class="sp-caption">Rites you’ve said you’ll come to are reminded the day before and an hour before.</p>`
            : ""
        }
      </div></section>`;
  }

  /** Coven requests: new applications and requests to advance in covens you review, and the answer to your own (as the app's Reminders shows them). */
  function requestsHtml() {
    const r = prefs.requests;
    const reviewing = covens.filter((c) => c.reviewer);
    const rows = r.on
      ? reviewing.map((coven) => toggle(slug(`gd-req-${coven.id}`), coven.name, `You review it · ${P.requestsOn(prefs, coven.id) ? "on" : "off"}`, P.requestsOn(prefs, coven.id), `data-req-coven="${esc(coven.id)}"`)).join("") ||
        (signedIn ? `<p class="sp-caption">Covens where you review applications will be listed here.</p>` : "")
      : "";
    return `<section class="sp-section" id="gd-requests" aria-labelledby="gd-requests-label"><h2 class="sp-label" id="gd-requests-label">Coven requests</h2>
      <div class="sp-card">
        ${prefToggle("gd-req-on", "Tell me about new applications", "A note on your phone when someone asks to join, or to advance, in a coven you review", "requests.on")}
        ${rows}
        ${prefToggle("gd-req-answers", "When my own is answered", "Your application to a coven, or your request to advance", "requests.answers")}
        <p class="sp-caption">These ring phones with the Salt &amp; Sovereignty app and coven notifications turned on. On the website, a coven’s Review tab and your covens list show what’s waiting while the page is open.</p>
      </div></section>`;
  }

  const PAUSES = [
    ["Until I turn them back on", null],
    ["A day", 1],
    ["Three days", 3],
    ["A week", 7],
    ["Two weeks", 14],
    ["A month", 30],
  ];
  const pauseUntil = (days) => {
    if (days == null) return "";
    const t = now();
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  function quietHtml() {
    const paused = P.isPaused(prefs, now());
    const back = prefs.pausedUntil ? `Back on ${new Date(`${prefs.pausedUntil}T00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}` : "Until you turn them back on";
    return `<section class="sp-section" id="gd-quiet" aria-labelledby="gd-quiet-label"><h2 class="sp-label" id="gd-quiet-label">Quiet hours and pause</h2>
      <div class="sp-card">
        ${toggle("gd-pause", "Pause all reminders", paused ? back : "Nothing goes into the calendar file while paused; your choices are kept", paused, "data-pause-on")}
        ${paused ? `<div class="sp-chips">${PAUSES.map(([label, days]) => chip(`data-pause="${days == null ? "" : days}"`, label, prefs.pausedUntil === pauseUntil(days))).join("")}</div>` : ""}
        ${prefToggle("gd-quiet-on", "Keep quiet at night", `Reminders between ${timeLabel(prefs.quiet.start)} and ${timeLabel(prefs.quiet.end)} move to when quiet hours end; one about a set time comes just before they begin`, "quiet.on")}
        ${prefs.quiet.on ? `${prefTime("gd-quiet-start", "From", "quiet.start")}${prefTime("gd-quiet-end", "Until", "quiet.end")}` : ""}
        ${prefToggle("gd-bundle", "Gather a busy day into one note", "In the app: holidays, planning and tending on the same day come together in the morning. A calendar file keeps each as its own event.", "bundle.on")}
        ${prefs.bundle.on ? `<div class="sp-chips">${P.BUNDLE_CHOICES.map((n) => valueChip("bundle.max", n, `More than ${n}`, prefs.bundle.max === n)).join("")}</div>` : ""}
      </div></section>`;
  }

  function eventRow(event) {
    const alarms = (event.alarms || []).map((a) => L.alarmLabel(a, event.allDay));
    return `<li><span class="gd-events__text"><span class="gd-events__when">${esc(L.whenLabel(event))}</span>
        <span class="gd-events__title">${esc(event.title)}</span>
        ${alarms.length ? `<span class="sp-caption">Alert: ${esc(alarms.join(" · "))}</span>` : ""}</span>
      <a class="gd-link" href="${esc(G.calendarEvent.googleCalendarUrl(event))}" target="_blank" rel="noopener noreferrer">Add to Google Calendar<span class="sr-only">: ${esc(event.title)} (opens in a new tab)</span></a></li>`;
  }

  function yourCalendarHtml() {
    const events = L.reminderEvents({ settings, plans, appSettings, now: now(), templateFor, prefs, sources, covens }, G);
    return `<section class="sp-section" aria-labelledby="gd-file"><h2 class="sp-label" id="gd-file">Into your calendar</h2>
      <div class="sp-card sp-card--gold">
        <p role="status" aria-live="polite">${events.length ? `${events.length} ${events.length === 1 ? "reminder is" : "reminders are"} ready for your calendar, each with its alerts.` : "Choose something above and its reminders will gather here."}</p>
        ${events.length ? `<div class="sp-actions"><button type="button" class="button button--primary" data-download="reminders">Download my reminders (.ics)</button></div>` : ""}
        <p class="sp-caption">Open the file with Apple Calendar, Outlook or another calendar app, or import it into Google Calendar. It’s a copy, not a live feed: download it again after you change your choices or plan a new ritual. Some calendars, Google Calendar among them, use their own notification settings instead of the file’s alerts.</p>
      </div>
      ${events.length ? `<div class="sp-card"><h3>Coming up</h3><ul class="gd-events">${events.slice(0, SHOWN_EVENTS).map(eventRow).join("")}</ul>${events.length > SHOWN_EVENTS ? `<p class="sp-caption">And ${events.length - SHOWN_EVENTS} more in the file.</p>` : ""}</div>` : ""}
    </section>`;
  }

  function styleForm(kind) {
    const style = calendar.styles[kind];
    const names = KIND_NAMES[kind];
    const timings = [["allDay", "All day"], ...(kind !== "holiday" ? [["exact", "At the exact moment"]] : []), ["time", "At a set time"]];
    const sample = L.sampleEvent(kind, style, { phases: settings.phases, appSettings, now: now() }, G);
    const alertLabel = G.calendarEvent.alertChoices(style.timing).find((c) => c.offset === style.alert)?.label;
    return `<details class="sp-details" data-style-kind="${kind}" ${openStyles.has(kind) ? "open" : ""}>
      <summary>${esc(names.title)}</summary>
      <div class="gd-topic__body" style="padding:0">
        <p class="sp-caption">Set it up once and every ${esc(names.plural)} event goes into your calendar the same way.</p>
        <fieldset class="gd-fieldset"><legend>When</legend><div class="sp-chips">${timings.map(([v, l]) => chip(`data-style="timing" data-value="${v}"`, l, style.timing === v)).join("")}</div>
          ${style.timing === "time" ? timeField(`gd-style-${kind}-time`, "At", style.minutes, 'data-style-time') : ""}</fieldset>
        ${style.timing !== "allDay" ? `<fieldset class="gd-fieldset"><legend>How long</legend><div class="sp-chips">${G.calendarEvent.DURATION_CHOICES.map((m) => chip(`data-style="duration" data-value="${m}"`, DURATION_LABELS[m], style.duration === m)).join("")}</div></fieldset>` : ""}
        <fieldset class="gd-fieldset"><legend>Alert</legend><div class="sp-chips">${chip('data-style="alert" data-value="none"', "None", style.alert == null)}${G.calendarEvent.alertChoices(style.timing).map((c) => chip(`data-style="alert" data-value="${c.offset}"`, c.label, style.alert === c.offset)).join("")}</div></fieldset>
        ${toggle(`gd-style-${kind}-details`, "Include what it means", "The meaning and exact time go in the event’s notes", style.details, "data-style-details")}
        ${sample ? `<div class="sp-card"><p class="sp-label">How the next one will look</p><p class="sp-row__title">${esc(sample.title)}</p><p class="gd-events__when">${esc(L.whenLabel(sample))}</p>${alertLabel ? `<p class="sp-caption">Alert: ${esc(alertLabel)}</p>` : ""}<p class="sp-caption">${esc(sample.notes).replace(/\n/g, "<br />")}</p></div>` : ""}
      </div>
    </details>`;
  }

  const openStyles = new Set();

  function skyHtml() {
    const count = L.skyEvents({ calendar, phases: settings.phases, appSettings, now: now() }, G).length;
    const anyPhase = G.schedule.PHASE_ORDER.some((p) => settings.phases[p]);
    return `<section class="sp-section" aria-labelledby="gd-sky"><h2 class="sp-label" id="gd-sky">Holidays, eclipses and moon phases</h2>
      <div class="sp-card">
        <p class="sp-caption">Optional. A year of the sky and your holidays as calendar events, without reminders of their own unless you add an alert.</p>
        ${toggle("gd-sky-moon", "Moon phases you chose above", anyPhase ? "For the next six months" : "Choose a phase above first", calendar.phases, 'data-sky="phases"')}
        ${toggle("gd-sky-holidays", "Holidays", "From your calendars in Settings → Calendar & holidays, for the next twelve months", calendar.sabbats, 'data-sky="sabbats"')}
        ${toggle("gd-sky-astro", "Eclipses & retrogrades", "Eclipses, and when Mercury through Saturn turn retrograde or direct", calendar.astro, 'data-sky="astro"')}
        ${L.SKY_KINDS.map(styleForm).join("")}
        <div class="sp-actions"><button type="button" class="button button--ghost" data-download="sky" ${count ? "" : "disabled"}>Download holidays, eclipses and moon phases (.ics)</button></div>
        <p class="sp-caption">${count ? `${count} events.` : "Nothing chosen yet."} If your reminders file already holds the moon phases, leave them out here so they don’t show twice.</p>
      </div></section>`;
  }

  /** A selector that finds the focused control again after the page redraws. */
  function focusKey(el) {
    if (!el || el === global.document.body || !root.contains(el)) return null;
    if (el.id) return `#${CSS.escape(el.id)}`;
    const data = [...el.attributes].filter((a) => a.name.startsWith("data-")).map((a) => `[${a.name}="${CSS.escape(a.value)}"]`).join("");
    if (!data) return null;
    const kind = el.closest("[data-style-kind]")?.dataset.styleKind;
    return `${kind ? `[data-style-kind="${kind}"] ` : ""}${el.tagName.toLowerCase()}${data}`;
  }

  function render() {
    const focus = focusKey(global.document.activeElement);
    root.innerHTML = `${header({ title: "Reminders", eyebrow: "Your reminders", back: "/today/", backLabel: "Back to Today" })}
      <p class="sp-muted">No account needed. Choose what you’d like to hear about, and when: the moon, your rituals, your holidays, tending, and planning.</p>
      <div class="sp-card sp-card--gold"><p>A browser can’t ring at a set time, so here your reminders go into your own calendar, which does the reminding. The Salt &amp; Sovereignty app can remind you on your phone instead.</p></div>
      ${overviewHtml()}${moonHtml()}${ritualsHtml()}${devotionHtml()}${dreamsHtml()}${holidaysHtml()}${tendingHtml()}${planningHtml()}${requestsHtml()}${quietHtml()}${yourCalendarHtml()}${skyHtml()}`;
    if (focus) root.querySelector(focus)?.focus({ preventScroll: true });
  }

  function update(change) {
    settings = L.saveReminders(store, G, settings, change);
    render();
  }

  /** Save the synced choices with the rest of Sanctuary settings (the same JSON the app writes), and redraw. */
  function updatePrefs(next) {
    prefs = P.normalizePrefs(next);
    const patch = L.prefsPatch(prefs, G);
    appSettings = { ...appSettings, ...patch };
    render();
    Promise.resolve(global.SaltSettings?.patch?.(patch)).catch(() => {});
  }
  const setPref = (path, value) => updatePrefs(P.withChange(prefs, path, value));

  function updateCalendar(change) {
    calendar = L.saveCalendar(store, G, calendar, change);
    render();
  }

  function download(kind) {
    const at = now();
    const events = kind === "sky" ? L.skyEvents({ calendar, phases: settings.phases, appSettings, now: at }, G) : L.reminderEvents({ settings, plans, appSettings, now: at, templateFor, prefs, sources, covens }, G);
    if (!events.length) return;
    const blob = new Blob([G.calendarEvent.toIcs(events, at)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = global.document.createElement("a");
    link.href = url;
    link.download = kind === "sky" ? "moon-holidays-and-sky.ics" : "salt-and-sovereignty-reminders.ics";
    global.document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  root.addEventListener("change", (event) => {
    const t = event.target;
    if (t.dataset.p) return setPref(t.dataset.p, t.checked);
    if (t.dataset.pt) {
      const minutes = fromTime(t.value);
      if (minutes != null) setPref(t.dataset.pt, minutes);
      return undefined;
    }
    if (t.dataset.hol) {
      const [group, baseId] = t.dataset.hol.split("|");
      const ids = [...root.querySelectorAll(`[data-hol^="${CSS.escape(group)}|"]`)].map((el) => el.dataset.hol.split("|")[1]);
      return updatePrefs(P.setHoliday(prefs, group, baseId, t.checked, ids));
    }
    if (t.dataset.cal) return updatePrefs(P.setCalendar(P.withChange(prefs, "holidays.on", prefs.holidays.on || t.checked), t.dataset.cal, [], t.checked));
    if (t.dataset.crystal) {
      const off = prefs.tending.crystals.off;
      return setPref("tending.crystals.off", t.checked ? off.filter((id) => id !== t.dataset.crystal) : [...off, t.dataset.crystal]);
    }
    if (t.dataset.coven) return setPref(`planning.perCoven.${t.dataset.coven}.on`, t.checked);
    if (t.dataset.reqCoven) return updatePrefs(P.setRequestsFor(prefs, t.dataset.reqCoven, t.checked, covens.filter((c) => c.reviewer).map((c) => c.id)));
    if (t.hasAttribute("data-pause-on")) return updatePrefs(P.withChange(P.withChange(prefs, "paused", t.checked), "pausedUntil", t.checked ? pauseUntil(7) : ""));
    if (t.dataset.phase) return update({ phases: { ...settings.phases, [t.dataset.phase]: t.checked } });
    if (t.hasAttribute("data-rituals")) return update({ rituals: t.checked });
    if (t.dataset.devotion) return update({ [t.dataset.devotion]: t.checked });
    if (t.hasAttribute("data-dream-morning")) return update({ dreamMorning: t.checked });
    if (t.hasAttribute("data-phase-time")) {
      const minutes = fromTime(t.value);
      if (minutes == null) return undefined;
      const quarter = Math.round(minutes / 15) * 15;
      return update({ phaseHour: Math.floor(quarter / 60) % 24, phaseMinute: quarter % 60 });
    }
    if (t.dataset.minutes) {
      const minutes = fromTime(t.value);
      if (minutes != null) update({ [t.dataset.minutes]: minutes });
      return undefined;
    }
    if (t.dataset.sky) return updateCalendar({ [t.dataset.sky]: t.checked });
    const kind = t.closest("[data-style-kind]")?.dataset.styleKind;
    if (kind && t.hasAttribute("data-style-details")) return updateCalendar({ styles: { ...calendar.styles, [kind]: { ...calendar.styles[kind], details: t.checked } } });
    if (kind && t.hasAttribute("data-style-time")) {
      const minutes = fromTime(t.value);
      if (minutes != null) updateCalendar({ styles: { ...calendar.styles, [kind]: { ...calendar.styles[kind], minutes } } });
    }
    return undefined;
  });

  // Notes save a moment after typing stops, as in the app.
  let noteTimer = null;
  root.addEventListener("input", (event) => {
    const group = event.target.dataset.holSearch;
    if (group) {
      const query = fold(event.target.value.trim());
      root.querySelectorAll(`[data-hol-row="${CSS.escape(group)}"]`).forEach((row) => {
        row.hidden = !!query && !row.dataset.name.includes(query);
      });
      return;
    }
    const phase = event.target.dataset.note;
    if (!phase) return;
    clearTimeout(noteTimer);
    const value = event.target.value.slice(0, G.schedule.NOTE_MAX);
    noteTimer = setTimeout(() => {
      settings = L.saveReminders(store, G, settings, { notes: { ...settings.notes, [phase]: value } });
    }, 700);
  });

  root.addEventListener("toggle", (event) => {
    // Calendars and holidays opened stay open when the page redraws.
    for (const [attr, set] of [["calOpen", openCalendars], ["timing", openTimings]]) {
      const id = event.target.dataset?.[attr];
      if (!id) continue;
      if (event.target.open) set.add(id);
      else set.delete(id);
      return;
    }
    const kind = event.target.dataset?.styleKind;
    if (!kind) return;
    if (event.target.open) openStyles.add(kind);
    else openStyles.delete(kind);
  }, true);

  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.download) return download(button.dataset.download);
    if (button.dataset.pv) return setPref(button.dataset.pv, JSON.parse(button.dataset.v));
    if (button.dataset.unset) {
      const parts = button.dataset.unset.split(".");
      const key = parts.pop();
      const parent = { ...(get(parts.join(".")) || {}) };
      delete parent[key];
      return setPref(parts.join("."), parent);
    }
    if (button.dataset.leads) {
      const day = Number(button.dataset.day);
      const current = get(button.dataset.leads) || [];
      const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
      return next.length ? setPref(button.dataset.leads, next.sort((a, b) => a - b)) : undefined;
    }
    if (button.dataset.rep) {
      const path = button.dataset.rep;
      const weekdays = (get(path) || {}).weekdays ?? [];
      if (button.dataset.mode) return setPref(`${path}.weekdays`, button.dataset.mode === "weekdays" ? (weekdays.length ? weekdays : [0]) : []);
      if (button.dataset.every) return updatePrefs(P.withChange(P.withChange(prefs, `${path}.every`, Number(button.dataset.every)), `${path}.weekdays`, []));
      if (button.dataset.wd) {
        const d = Number(button.dataset.wd);
        const next = weekdays.includes(d) ? weekdays.filter((x) => x !== d) : [...weekdays, d];
        return next.length ? setPref(`${path}.weekdays`, next) : undefined;
      }
    }
    if (button.dataset.calAll) return updatePrefs(P.setCalendar(prefs, button.dataset.calAll, button.dataset.ids.split(","), button.dataset.on === "1"));
    if (button.dataset.altar) {
      const ids = prefs.tending.altars.ids;
      return setPref("tending.altars.ids", ids.includes(button.dataset.altar) ? ids.filter((id) => id !== button.dataset.altar) : [...ids, button.dataset.altar]);
    }
    if (button.hasAttribute("data-pause")) return setPref("pausedUntil", pauseUntil(button.dataset.pause === "" ? null : Number(button.dataset.pause)));
    if (button.dataset.also) return update({ [button.dataset.also]: !settings[button.dataset.also] });
    if (button.dataset.ahead) {
      const days = Number(button.dataset.ahead);
      return update({ daysAhead: settings.daysAhead.includes(days) ? settings.daysAhead.filter((d) => d !== days) : [...settings.daysAhead, days] });
    }
    if (button.dataset.lead) return update({ ritualLeadMinutes: Number(button.dataset.lead) });
    const kind = button.closest("[data-style-kind]")?.dataset.styleKind;
    if (kind && button.dataset.style) {
      const style = { ...calendar.styles[kind] };
      const value = button.dataset.value;
      if (button.dataset.style === "timing") {
        // An alert from the other kind of timing doesn't carry over.
        if ((value === "allDay") !== (style.timing === "allDay")) style.alert = null;
        style.timing = value;
      } else if (button.dataset.style === "duration") style.duration = Number(value);
      else if (button.dataset.style === "alert") style.alert = value === "none" ? null : Number(value);
      return updateCalendar({ styles: { ...calendar.styles, [kind]: style } });
    }
    return undefined;
  });

  // Plans and templates come through the Rituals pages' own store (rituals/js/rituals-store.js),
  // so plans made offline are sent first and a template's timers set each event's length.
  let templates = [];
  const templateFor = (plan) => (global.SaltCore?.rituals?.plans?.planTemplate ? global.SaltCore.rituals.plans.planTemplate(plan, templates) : null);

  async function loadPlans(user) {
    if (global.RitualsStore?.loadPlans) {
      try {
        const [list, found] = await Promise.all([global.RitualsStore.loadPlans(), global.RitualsStore.templates().catch(() => [])]);
        templates = found || [];
        return list || [];
      } catch {
        /* fall back to reading them here */
      }
    }
    if (user && global.db) {
      try {
        const { data, error } = await global.db.from("ritual_plans").select("*").eq("user_id", user.id);
        if (!error) return L.plansFrom({ rows: data || [] }, G);
      } catch {
        /* fall back to this browser's copy */
      }
    }
    return L.plansFrom({ local: L.readJson(store, L.KEYS.plans) }, G);
  }

  async function refresh(user) {
    signedIn = !!user;
    try {
      appSettings = (await global.SaltSettings?.get?.()) || {};
    } catch {
      appSettings = {};
    }
    plans = await loadPlans(user);
    prefs = L.loadPrefs(appSettings, settings, G);
    render();
    const [found, mine] = await Promise.all([loadSources(user).catch(() => null), loadCovens(user).catch(() => [])]);
    sources = found || { altars: [], plants: [], offerings: [], crystals: [], candles: [] };
    covens = mine || [];
    render();
  }

  /** Your altars (signed in: your account's; otherwise this browser's) and My stones, for the tending reminders. */
  async function loadSources(user) {
    let altars = [];
    try {
      if (user && global.db) {
        const { data, error } = await global.db.from("saved_altars").select("*").eq("user_id", user.id);
        if (!error) altars = (data || []).map((row) => G.altarSnapshot.altarFromRow(row));
      } else {
        altars = G.altarSnapshot.parseLocalAltars(store?.getItem(G.altarSnapshot.LOCAL_ALTARS_KEY) ?? null);
      }
    } catch {
      altars = [];
    }
    let stones = [];
    try {
      stones = (await global.SaltCraft?.list?.("crystal.stones")) || [];
    } catch {
      stones = [];
    }
    return G.reminderSources.tendingSources(altars, stones, now());
  }

  /** Your covens, your place in each, their holidays and rites (signed in), for ritual planning and rite reminders. */
  async function loadCovens(user) {
    if (!user || !global.db) return [];
    const db = global.db;
    const fields = "id,slug,name,status,founder_id,practice_traditions,practice_holidays,practice_custom,practice_calendars";
    const { data: rows, error } = await db.from("coven_members").select(`coven_id,user_id,rank_id,status,muted_until,joined_at,covens(${fields})`).eq("user_id", user.id).eq("status", "active");
    if (error) return [];
    const mine = (rows || []).filter((r) => r.covens);
    if (!mine.length) return [];
    const ids = mine.map((r) => r.coven_id);
    const [ranks, rituals, answers] = await Promise.all([
      db.from("coven_ranks").select("*").in("coven_id", ids),
      db.from("coven_rituals").select("*").in("coven_id", ids).eq("status", "scheduled").gte("scheduled_for", new Date().toISOString()).limit(200),
      db.from("coven_ritual_rsvps").select("*").eq("user_id", user.id),
    ]);
    const standings = mine.map(({ covens: coven, ...membership }) => ({ coven, membership, ranks: (ranks.data || []).filter((k) => k.coven_id === membership.coven_id) }));
    const rites = (rituals.data || []).map((ritual) => ({ coven: { id: ritual.coven_id }, ritual, response: (answers.data || []).find((a) => a.ritual_id === ritual.id)?.response ?? null }));
    return G.reminderCovens.covenSources(standings, rites, user.id, now());
  }

  render();
  (global.SaltPage?.ready?.() || Promise.resolve(null)).then(refresh);
  global.SaltPage?.onUserChange?.((user) => refresh(user));
})(window);
