/*
 * Reminders (the app's Rituals → Moon reminders, also opened from Today and
 * More): moon phases, planned rituals, daily devotions and your deities'
 * sacred days. A browser can't ring at a set time, so the website hands
 * them to your own calendar: one .ics file, or Google Calendar links one by
 * one. Choices stay in this browser, as the app keeps them on the phone.
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

  function sacredHtml() {
    const sources = G.patron.sacredSources(appSettings);
    return `<section class="sp-section" aria-labelledby="gd-sacred"><h2 class="sp-label" id="gd-sacred">Your deities’ sacred days</h2>
      <div class="sp-card">
        ${toggle("gd-sacred-on", "Remind me of their sacred days", "For your patron and dedicated deities", settings.sacredDays, "data-sacred")}
        ${settings.sacredDays ? timeField("gd-sacred-at", "On the day at", settings.sacredAt, 'data-minutes="sacredAt"') : ""}
        <p class="sp-caption">${
          sources.length
            ? `For ${esc(sources.map((s) => s.name).join(", "))}, over the next three months.`
            : "Add a patron or dedicated deity in Settings → My deities and their days will come here."
        } <a class="gd-link" href="/more/settings/deities/">My deities</a></p>
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
    const events = L.reminderEvents({ settings, plans, appSettings, now: now() }, G);
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
    root.innerHTML = `${header({ title: "Reminders", eyebrow: "Kept in this browser", back: "/today/", backLabel: "Back to Today" })}
      <p class="sp-muted">No account needed. Choose the phases you want to hear about, and we’ll remind you before planned rituals.</p>
      <div class="sp-card sp-card--gold"><p>A browser can’t ring at a set time, so here your reminders go into your own calendar, which does the reminding. The Salt &amp; Sovereignty app can remind you on your phone instead.</p></div>
      ${moonHtml()}${ritualsHtml()}${devotionHtml()}${sacredHtml()}${yourCalendarHtml()}${skyHtml()}`;
    if (focus) root.querySelector(focus)?.focus({ preventScroll: true });
  }

  function update(change) {
    settings = L.saveReminders(store, G, settings, change);
    render();
  }

  function updateCalendar(change) {
    calendar = L.saveCalendar(store, G, calendar, change);
    render();
  }

  function download(kind) {
    const at = now();
    const events = kind === "sky" ? L.skyEvents({ calendar, phases: settings.phases, appSettings, now: at }, G) : L.reminderEvents({ settings, plans, appSettings, now: at }, G);
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
    if (t.dataset.phase) return update({ phases: { ...settings.phases, [t.dataset.phase]: t.checked } });
    if (t.hasAttribute("data-rituals")) return update({ rituals: t.checked });
    if (t.dataset.devotion) return update({ [t.dataset.devotion]: t.checked });
    if (t.hasAttribute("data-sacred")) return update({ sacredDays: t.checked });
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
    const phase = event.target.dataset.note;
    if (!phase) return;
    clearTimeout(noteTimer);
    const value = event.target.value.slice(0, G.schedule.NOTE_MAX);
    noteTimer = setTimeout(() => {
      settings = L.saveReminders(store, G, settings, { notes: { ...settings.notes, [phase]: value } });
    }, 700);
  });

  root.addEventListener("toggle", (event) => {
    const kind = event.target.dataset?.styleKind;
    if (!kind) return;
    if (event.target.open) openStyles.add(kind);
    else openStyles.delete(kind);
  }, true);

  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.download) return download(button.dataset.download);
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

  async function loadPlans(user) {
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
    render();
  }

  render();
  (global.SaltPage?.ready?.() || Promise.resolve(null)).then(refresh);
  global.SaltPage?.onUserChange?.((user) => refresh(user));
})(window);
