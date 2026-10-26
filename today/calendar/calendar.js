/*
 * Calendar & holidays, as the app has it (Settings → Calendar & holidays, also
 * opened from Today: app/src/app/(tabs)/more/settings/calendar.tsx and
 * components/more/CalendarCounting.tsx): how the days are counted, the other
 * calendars shown beside the date, the holiday calendars you keep, what Today
 * shows, your own events, single holidays from other calendars, and the year
 * ahead. Changes are a draft until "Save changes", which keeps every other
 * setting (the website's and the app's) as it is.
 */
(function () {
  "use strict";

  const C = window.SaltCore && window.SaltCore.today;
  const T = window.SaltToday;
  const root = document.querySelector("[data-page-root]");
  const esc = (text) => (window.SaltPage ? window.SaltPage.esc(text) : String(text ?? ""));
  if (!root) return;
  if (!C || !T) {
    root.innerHTML = '<p class="sp-notice">Calendars could not load. Check your connection and refresh the page.</p>';
    return;
  }
  const storage = (() => {
    try {
      return window.localStorage;
    } catch {
      return { getItem: () => null, setItem() {}, removeItem() {} };
    }
  })();

  const H = C.holidays;
  const K = C.calendars;

  const SHOW_OPTIONS = [
    { value: "both", label: "Moon and holiday" },
    { value: "moon", label: "Moon only" },
    { value: "holiday", label: "Holiday only" }
  ];
  const LAYOUT_OPTIONS = [
    { value: "stacked", label: "One above the other" },
    { value: "side", label: "Side by side" }
  ];
  const REPEAT_OPTIONS = [
    { value: "yearly", label: "Every year" },
    { value: "monthly", label: "Every month" },
    { value: "weekly", label: "Every week" },
    { value: "once", label: "Once" }
  ];
  const COUNT_OPTIONS = [
    { value: "standard", label: "Standard" },
    { value: "moon", label: "The moon" }
  ];
  const HEMISPHERE_OPTIONS = [
    { value: "auto", label: "From my place" },
    { value: "north", label: "Northern" },
    { value: "south", label: "Southern" }
  ];
  const WEEKDAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((label, i) => ({ value: String(i), label }));
  const ordinal = (n) => (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th");

  function repeatLabel(holiday) {
    const date = `${MONTHS[holiday.month].label} ${holiday.day}`;
    switch (H.customRepeat(holiday)) {
      case "once":
        return `${date}, ${holiday.year}`;
      case "monthly":
        return `the ${holiday.day}${ordinal(holiday.day)} of every month`;
      case "weekly":
        return `${WEEKDAYS[new Date(holiday.year ?? new Date().getFullYear(), holiday.month, holiday.day).getDay()]}, from ${date}${holiday.year ? `, ${holiday.year}` : ""}`;
      default:
        return `${date} · every year`;
    }
  }

  const state = {
    saved: initialSettings(),
    draft: null,
    changed: new Set(),
    dirty: false,
    saving: false,
    notice: "",
    user: null,
    place: T.readPlace(storage),
    add: { name: "", month: String(new Date().getMonth()), day: "", meaning: "", repeat: "yearly", year: String(new Date().getFullYear()), message: "" },
    openPick: null
  };
  state.draft = { ...state.saved };

  function initialSettings() {
    try {
      return typeof window.getLocalMySettings === "function" ? window.getLocalMySettings() : {};
    } catch {
      return {};
    }
  }

  function set(key, value) {
    state.draft = { ...state.draft, [key]: value };
    state.changed.add(key);
    state.dirty = true;
    state.notice = "Unsaved changes.";
  }

  // ── Pieces ─────────────────────────────────────────────────────────────
  let uid = 0;
  function chips(label, options, value, key) {
    return (
      `<div class="sp-chips" role="group" aria-label="${esc(label)}">` +
      options
        .map((o) => `<button type="button" class="sp-chip" id="chip-${esc(key)}-${esc(o.value)}" aria-pressed="${o.value === value}" data-set="${esc(key)}" data-value="${esc(o.value)}">${esc(o.label)}</button>`)
        .join("") +
      `</div>`
    );
  }

  function checkRow(id, label, detail, checked, data, accessory = "") {
    return (
      `<div class="td-check-row"><input type="checkbox" id="${esc(id)}" ${checked ? "checked" : ""} ${data} />` +
      `<label class="td-check-row__text" for="${esc(id)}"><span class="sp-row__title">${esc(label)}</span>${detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""}</label>${accessory}</div>`
    );
  }

  function choiceList(def) {
    const values = K.calendarChoices(state.draft, def.id);
    return (def.choices || [])
      .map((choice) => {
        const value = values[choice.key];
        const note = choice.options.find((o) => o.value === value)?.note;
        return (
          `<div class="td-choice"><span class="td-choice__label">${esc(choice.label)}</span>` +
          chips(choice.label, choice.options, value, K.optionKey(def.id, choice.key)) +
          (note ? `<p class="sp-caption">${esc(note)}</p>` : "") +
          `</div>`
        );
      })
      .join("");
  }

  const about = (def) => `<details class="td-about"><summary class="td-link sp-caption">About this calendar</summary><p class="sp-caption">${esc(def.about)}</p></details>`;

  function calendarCounting() {
    const draft = state.draft;
    const place = state.place;
    const lead = K.primaryCalendar(draft);
    const shown = new Set(K.shownCalendars(draft));
    const path = C.traditions.myPath(draft).traditions;
    const list = K.calendarsForSettings(draft, path);
    const hemisphere = draft[K.HEMISPHERE_KEY] || "auto";
    const lines = K.todayLines(new Date(), draft, place);
    const leadLine = lines.find((l) => l.lead);

    const preview = lines.length
      ? `<div class="td-card td-header">` +
        (leadLine ? T.leadLineHtml(leadLine, esc, "cal-lead") : "") +
        `<p class="sp-eyebrow td-date"${leadLine ? "" : ' style="color:var(--cream)"'}>${esc(C.calendar.longDate(new Date()))}</p>` +
        T.lineListHtml(lines.filter((l) => !l.lead), esc, "cal-line") +
        `</div>`
      : "";

    const count =
      `<section class="sp-section"><h2 class="sp-label">Count my days by</h2>` +
      chips("Count my days by", COUNT_OPTIONS, lead, K.COUNT_KEY) +
      `<p class="sp-caption">${esc(
        lead === "moon"
          ? "Today leads with the moon’s date: its month, from new moon to new moon, and the day of it. The ordinary date shows beneath."
          : "Today leads with the ordinary date. You can still show the moon’s months beside it below."
      )}</p>` +
      (lead === "moon"
        ? `<div class="td-card"><div class="td-cal__meta"><span class="td-cal__name">${esc(K.MOON_CALENDAR.name)}</span>${T.confidenceChip(K.MOON_CALENDAR.confidence, esc)}</div>${about(K.MOON_CALENDAR)}${choiceList(K.MOON_CALENDAR)}</div>`
        : "") +
      `<span class="td-choice__label">Hemisphere</span>` +
      chips("Hemisphere", HEMISPHERE_OPTIONS, hemisphere, K.HEMISPHERE_KEY) +
      `<p class="sp-caption">${esc(
        `Seasons and moon names follow the ${K.hemisphereOf(draft, place)}ern hemisphere${hemisphere === "auto" ? (place ? ", from your place" : "; add your place on the Sky page to set it") : ""}.`
      )}</p></section>`;

    const also =
      `<section class="sp-section"><h2 class="sp-label">Also show</h2>` +
      `<p class="sp-caption">Other ways of counting the day, shown under the date on Today. Tap a line there for more. Calendars of your path come first.</p>` +
      `<div class="sp-list">` +
      list
        .map((def) => {
          const on = shown.has(def.id);
          const pathName = K.calendarPathName(def);
          return (
            `<div class="td-cal"><div class="td-cal__head"><input type="checkbox" id="cal-${esc(def.id)}" ${on ? "checked" : ""} data-extra="${esc(def.id)}" style="width:22px;height:22px;accent-color:#e2c36d;flex:none;margin:0" />` +
            `<label for="cal-${esc(def.id)}" style="flex:1;display:grid;gap:4px;cursor:pointer"><span class="td-cal__name">${esc(def.name)}</span>` +
            `<span class="td-cal__meta">${T.confidenceChip(def.confidence, esc)}${pathName ? `<span class="sp-caption">${esc(pathName)}</span>` : ""}</span></label></div>` +
            about(def) +
            (on ? choiceList(def) : "") +
            `</div>`
          );
        })
        .join("") +
      `</div></section>`;

    return preview + count + also;
  }

  function calendarForm() {
    const draft = state.draft;
    const choice = H.holidayChoice(draft);
    const chosen = new Set(choice.traditions);
    const hidden = H.hiddenTraditions(draft);
    const shown = H.TRADITIONS.filter((t) => !hidden.includes(t.id));
    const show = draft.today_show || "both";
    const mainOptions = shown.filter((t) => chosen.has(t.id)).map((t) => ({ value: t.id, label: t.name }));

    const yours =
      `<section class="sp-section"><h2 class="sp-label">Your calendars</h2><div class="sp-list">` +
      shown
        .map((t) =>
          checkRow(
            `trad-${t.id}`,
            t.name,
            t.description,
            chosen.has(t.id),
            `data-tradition="${esc(t.id)}"`,
            H.HIDEABLE_TRADITIONS.includes(t.id)
              ? `<button type="button" class="td-small-button" data-hide="${esc(t.id)}" aria-label="Hide the ${esc(t.name)} calendar" title="Removes it from view everywhere. You can show it again here.">Hide</button>`
              : ""
          )
        )
        .join("") +
      checkRow("trad-custom", "Your own calendar", "Your own events, plus single holidays picked from any calendar.", chosen.has("custom"), 'data-tradition="custom"') +
      `</div>` +
      (hidden.length
        ? `<div class="sp-actions"><button type="button" class="td-small-button" data-show-hidden>${hidden.length > 1 ? "Show hidden calendars" : "Show hidden calendar"}</button></div>`
        : "") +
      `</section>`;

    const main =
      mainOptions.length > 1
        ? `<section class="sp-section"><h2 class="sp-label">Main calendar</h2><p class="sp-caption">Names the day at the top of Today: the Athenian date, the Norse weekday gods, the Roman date and so on.</p>` +
          chips("Main calendar", mainOptions, C.traditionDay.primaryTradition(draft, choice), "calendar_primary") +
          `</section>`
        : "";

    const onToday =
      `<section class="sp-section"><h2 class="sp-label">On Today</h2>` +
      `<span class="td-choice__label">Show on Today</span>` +
      chips("Show on Today", SHOW_OPTIONS, show, "today_show") +
      (show === "both" ? `<span class="td-choice__label">Layout</span>` + chips("Layout", LAYOUT_OPTIONS, draft.today_layout || "stacked", "today_layout") : "") +
      `<p class="sp-caption">On the horizon always shows the next moon phase and the next holiday.</p>` +
      `<div class="sp-list">` +
      checkRow("today-draw", "A card for the day", "A small “Draw a card for the day” line, and the card once you’ve kept it.", draft.today_draw !== false, 'data-today-draw="1"') +
      checkRow("today-deipnon", "Hekate’s Deipnon", "On the last day of each Attic month, if you keep the Hellenic monthly days or Hekate is your patron: a gentle note on Today, and a reminder in the phone app (a website can’t ring).", draft.deipnon_prompt !== false, 'data-today-deipnon="1"') +
      `</div></section>`;

    const custom = chosen.has("custom") ? customHolidays(choice.custom) + pickHolidays(choice.picked || [], chosen, hidden) : "";

    return (
      `<p>Choose the calendars you keep. Their holidays show on Today on the day, with what they mean, and On the horizon shows the next one.</p>` +
      (K.CALENDARS_LIVE ? calendarCounting() : "") +
      yours +
      main +
      onToday +
      custom
    );
  }

  function customHolidays(list) {
    const a = state.add;
    const needsYear = a.repeat === "once" || a.repeat === "weekly";
    return (
      `<section class="sp-section"><h2 class="sp-label">Your own events</h2>` +
      (list.length
        ? `<div class="td-year">` +
          list
            .map(
              (h) =>
                `<div class="td-custom"><div><span class="td-year__name">${esc(h.name)}</span><span class="sp-caption">${esc(`${repeatLabel(h)}${h.meaning ? ` · ${h.meaning}` : ""}`)}</span></div>` +
                `<button type="button" class="td-small-button" data-remove-custom="${esc(h.id)}" aria-label="Remove ${esc(h.name)}">Remove</button></div>`
            )
            .join("") +
          `</div>`
        : "") +
      `<form class="td-card" data-add-form novalidate><h3 class="td-card__title">Add an event</h3>` +
      `<div class="sp-field"><label for="add-name">Name</label><input id="add-name" data-add="name" value="${esc(a.name)}" placeholder="My dedication day, a coven gathering…" /></div>` +
      `<span class="td-choice__label">Repeats</span>` +
      chips("Repeats", REPEAT_OPTIONS, a.repeat, "add:repeat") +
      (a.repeat !== "monthly" ? `<span class="td-choice__label">Month</span>` + chips("Month", MONTHS, a.month, "add:month") : "") +
      `<div class="sp-field"><label for="add-day">Day of the month</label><input id="add-day" data-add="day" inputmode="numeric" maxlength="2" value="${esc(a.day)}" placeholder="1–31" /></div>` +
      (needsYear
        ? `<div class="sp-field"><label for="add-year">${a.repeat === "weekly" ? "Year it starts" : "Year"}</label><input id="add-year" data-add="year" inputmode="numeric" maxlength="4" value="${esc(a.year)}" /></div>`
        : "") +
      `<p class="sp-caption">${esc(
        a.repeat === "yearly"
          ? "Comes round on this date every year."
          : a.repeat === "monthly"
            ? "Comes round on this day of every month (skipping months too short for it)."
            : a.repeat === "weekly"
              ? "Comes round every week on the weekday of this date, starting from it."
              : "Happens once, on this date."
      )}</p>` +
      `<div class="sp-field"><label for="add-meaning">What it means to you (optional)</label><textarea id="add-meaning" data-add="meaning">${esc(a.meaning)}</textarea></div>` +
      (a.message ? `<p class="sp-notice" role="status">${esc(a.message)}</p>` : "") +
      `<div class="sp-actions"><button type="submit" class="button button--ghost">Add event</button></div></form></section>`
    );
  }

  function pickHolidays(picked, whole, hidden) {
    const chosen = new Set(picked);
    return (
      `<section class="sp-section"><h2 class="sp-label">Holidays from other calendars</h2>` +
      `<p class="sp-caption">Add single holidays to your own calendar without turning on the whole calendar.</p>` +
      H.TRADITIONS.filter((t) => !hidden.includes(t.id))
        .map((t) => {
          const count = t.holidays.filter((h) => chosen.has(H.pickId(t.id, h.id))).length;
          const all = whole.has(t.id);
          const expanded = state.openPick === t.id;
          return (
            `<div class="sp-section" style="gap:8px"><button type="button" class="td-plain td-cal__head" id="pick-${esc(t.id)}" aria-expanded="${expanded}" data-open-pick="${esc(t.id)}">` +
            `<span class="td-cal__name" style="flex:1">${esc(t.name)}</span><span class="sp-caption">${all ? "All on" : count ? `${count} added` : ""}</span><span class="sp-muted" aria-hidden="true">${expanded ? "▾" : "▸"}</span></button>` +
            (expanded
              ? all
                ? `<p class="sp-caption">This whole calendar is on above, so all its holidays already show.</p>`
                : `<div class="sp-list">` +
                  t.holidays.map((h) => checkRow(`pick-${t.id}-${h.id}`, h.name, h.meaning, chosen.has(H.pickId(t.id, h.id)), `data-pick="${esc(H.pickId(t.id, h.id))}"`)).join("") +
                  `</div>`
              : "") +
            `</div>`
          );
        })
        .join("") +
      `</section>`
    );
  }

  /** Every holiday from the chosen calendars for the next twelve months (below Save). */
  function yearAhead() {
    const draft = state.draft;
    const now = new Date();
    const end = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const events = (K.CALENDARS_LIVE ? K.calendarEventsBetween(now, end, draft, state.place) : []).filter((e) => e.calendar !== "moon" || e.id.startsWith("moon-new-"));
    const year = K.mergeCalendarEvents(H.holidaysBetween(now, end, H.holidayChoice(draft)), events);
    return (
      `<section class="sp-section"><h2 class="sp-label">The year ahead</h2>` +
      (year.length === 0
        ? `<p class="sp-caption">Choose a calendar above to see its holidays.</p>`
        : `<div class="td-year">` +
          year
            .map(
              (h) =>
                `<div class="td-year__row"><p class="td-year__date">${esc(C.calendar.shortDate(h.date))}${h.days > 1 ? ` · ${h.days} days` : ""}</p>` +
                `<h3 class="td-year__name">${esc(h.name)}</h3><span class="sp-caption">${esc(h.traditions.join(" · "))}</span>` +
                (h.meaning ? `<span class="td-year__meaning">${esc(h.meaning)}</span>` : "") +
                `</div>`
            )
            .join("") +
          `</div>`) +
      `</section>`
    );
  }

  function render() {
    const focusId = document.activeElement && root.contains(document.activeElement) ? document.activeElement.id : null;
    root.innerHTML =
      `<p><a class="sp-back" href="/today/">‹ Back to Today</a></p>` +
      `<header><p class="sp-eyebrow">Settings</p><h1>Calendar &amp; holidays</h1></header>` +
      calendarForm() +
      `<div class="td-save${state.dirty || state.saving ? " td-save--sticky" : ""}">` +
      (state.notice ? `<p class="sp-caption${state.dirty ? " td-gold" : ""}" role="status">${esc(state.notice)}</p>` : `<p class="sr-only" role="status"></p>`) +
      `<button type="button" class="button button--primary" id="save-settings" data-save ${!state.dirty || state.saving ? "disabled" : ""}>${state.saving ? "Saving…" : "Save changes"}</button>` +
      (!state.user ? `<p class="sp-caption">You’re a guest, so these stay in this browser. Sign in to use them everywhere.</p>` : "") +
      `</div>` +
      yearAhead();
    if (focusId) document.getElementById(focusId)?.focus();
  }

  // ── Events ─────────────────────────────────────────────────────────────
  T.bindToggles(root);

  root.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-set]");
    if (chip) {
      const key = chip.dataset.set;
      if (key.startsWith("add:")) state.add = { ...state.add, [key.slice(4)]: chip.dataset.value, message: "" };
      else set(key, chip.dataset.value);
      return render();
    }
    const hide = event.target.closest("[data-hide]");
    if (hide) return hideTradition(hide.dataset.hide);
    if (event.target.closest("[data-show-hidden]")) {
      set("calendar_hidden_traditions", "");
      return render();
    }
    const remove = event.target.closest("[data-remove-custom]");
    if (remove) {
      const list = H.holidayChoice(state.draft).custom.filter((h) => h.id !== remove.dataset.removeCustom);
      set("calendar_custom_holidays", JSON.stringify(list));
      return render();
    }
    const pick = event.target.closest("[data-open-pick]");
    if (pick) {
      state.openPick = state.openPick === pick.dataset.openPick ? null : pick.dataset.openPick;
      return render();
    }
    if (event.target.closest("[data-save]")) save();
  });

  root.addEventListener("change", (event) => {
    const input = event.target;
    if (input.dataset.tradition) {
      const next = new Set(H.holidayChoice(state.draft).traditions);
      if (input.checked) next.add(input.dataset.tradition);
      else next.delete(input.dataset.tradition);
      set("calendar_traditions", [...next].join(","));
      return render();
    }
    if (input.dataset.todayDraw) {
      set("today_draw", input.checked);
      return render();
    }
    if (input.dataset.todayDeipnon) {
      set("deipnon_prompt", input.checked);
      return render();
    }
    if (input.dataset.extra) {
      set(K.EXTRA_KEY, K.withShown(state.draft, input.dataset.extra, input.checked));
      return render();
    }
    if (input.dataset.pick) {
      const next = new Set(H.holidayChoice(state.draft).picked || []);
      if (input.checked) next.add(input.dataset.pick);
      else next.delete(input.dataset.pick);
      set("calendar_picked_holidays", [...next].join(","));
      return render();
    }
  });

  root.addEventListener("input", (event) => {
    const field = event.target.dataset.add;
    if (field) state.add = { ...state.add, [field]: event.target.value };
  });

  root.addEventListener("submit", (event) => {
    if (!event.target.matches("[data-add-form]")) return;
    event.preventDefault();
    addCustom();
  });

  /** Hiding a calendar turns it off too, and drops any holidays picked from it. */
  function hideTradition(id) {
    const draft = state.draft;
    const hidden = H.hiddenTraditions(draft);
    set("calendar_hidden_traditions", [...new Set([...hidden, id])].join(","));
    if (typeof draft.calendar_traditions === "string") set("calendar_traditions", draft.calendar_traditions.split(",").filter((t) => t.trim() !== id).join(","));
    if (typeof draft.calendar_picked_holidays === "string")
      set("calendar_picked_holidays", draft.calendar_picked_holidays.split(",").filter((p) => p.split("/")[0] !== id).join(","));
    if (draft.calendar_primary === id) set("calendar_primary", "");
    render();
  }

  function addCustom() {
    const a = state.add;
    const dayNumber = Number(a.day);
    const yearNumber = Number(a.year);
    const fail = (message) => {
      state.add = { ...a, message };
      render();
      document.getElementById("add-name")?.closest("form")?.querySelector("[role=status]")?.scrollIntoView({ block: "nearest" });
    };
    if (!a.name.trim()) return fail("Give the event a name.");
    const needsYear = a.repeat === "once" || a.repeat === "weekly";
    if (needsYear && (!Number.isInteger(yearNumber) || yearNumber < 1900 || yearNumber > 2200)) return fail("Enter the year, such as 2027.");
    // Yearly events may fall on Feb 29 (leap years); monthly ones on any day up to 31.
    const daysInMonth = a.repeat === "monthly" ? 31 : new Date(needsYear ? yearNumber : 2024, Number(a.month) + 1, 0).getDate();
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > daysInMonth) return fail(`Choose a day from 1 to ${daysInMonth}.`);
    const list = H.holidayChoice(state.draft).custom;
    const id = window.SaltCraft?.uuid ? window.SaltCraft.uuid() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
    set(
      "calendar_custom_holidays",
      JSON.stringify([...list, { id, name: a.name.trim(), month: Number(a.month), day: dayNumber, meaning: a.meaning.trim(), year: needsYear ? yearNumber : null, repeat: a.repeat }])
    );
    state.add = { ...a, name: "", day: "", meaning: "", message: "Added. Save changes to keep it." };
    render();
  }

  async function save() {
    if (!state.dirty || state.saving) return;
    state.saving = true;
    render();
    const changes = {};
    state.changed.forEach((key) => (changes[key] = state.draft[key]));
    try {
      const next = await window.SaltSettings.patch(changes);
      state.saved = next;
      state.draft = { ...next };
      state.changed.clear();
      state.dirty = false;
      state.notice = state.user ? "Settings saved to your account." : "Settings saved in this browser.";
    } catch {
      state.notice = "Settings could not be saved. Check your connection and try again.";
    } finally {
      state.saving = false;
      render();
      document.getElementById("save-settings")?.focus();
    }
  }

  window.addEventListener("beforeunload", (event) => {
    if (state.dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  async function load(user) {
    state.user = user;
    try {
      const settings = (await window.SaltSettings.get()) || {};
      state.saved = settings;
      if (!state.dirty) state.draft = { ...settings };
    } catch {
      /* keep this browser's copy */
    }
    render();
  }

  render();
  if (window.SaltPage) {
    window.SaltPage.ready().then(load);
    window.SaltPage.onUserChange((user) => {
      if ((user && user.id) !== (state.user && state.user.id)) load(user);
    });
  }
})();
