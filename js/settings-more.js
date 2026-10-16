/*
 * The app's settings the website's Settings view was missing: My practice,
 * Calendar & holidays (with what Today shows), and My path in Living
 * Library. Loaded by js/settings-view.js when Settings opens, with the
 * app's own logic (js/core/guides.js).
 *
 * These controls have no `name`, so the Settings form's own Save never
 * touches them; each change is saved straight away, keeping every other
 * setting (the website's and the app's) as it is. Keys and values are the
 * app's: my_practice, calendar_*, today_show, today_layout, library_path*.
 */
(function (global) {
  "use strict";

  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const ROW_ONLY = new Set(["id", "user_id", "created_at", "updated_at", "settings"]);
  const MY_DEITIES_HREF = "/more/settings/deities/";

  const SHOW_OPTIONS = [
    { value: "both", label: "Moon and holiday" },
    { value: "moon", label: "Moon only" },
    { value: "holiday", label: "Holiday only" },
  ];
  const LAYOUT_OPTIONS = [
    { value: "stacked", label: "One above the other" },
    { value: "side", label: "Side by side" },
  ];
  const REPEAT_OPTIONS = [
    { value: "yearly", label: "Every year" },
    { value: "monthly", label: "Every month" },
    { value: "weekly", label: "Every week" },
    { value: "once", label: "Once" },
  ];
  const COUNT_OPTIONS = [
    { value: "standard", label: "Standard" },
    { value: "moon", label: "The moon" },
  ];
  const HEMISPHERE_OPTIONS = [
    { value: "auto", label: "From my place" },
    { value: "north", label: "Northern" },
    { value: "south", label: "Southern" },
  ];
  const PATH_MODES = [
    { value: "calendars", label: "Follow my calendars" },
    { value: "custom", label: "Choose my own" },
    { value: "off", label: "Off" },
  ];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WEEKDAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
  const ordinal = (n) => (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");
  const csv = (value) => (typeof value === "string" ? value.split(",").map((v) => v.trim()).filter(Boolean) : []);
  const newId = () => (global.crypto?.randomUUID ? global.crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

  /** The changes a calendar being hidden brings: it's turned off, and any holidays picked from it go. */
  function hideChanges(settings, id, hide, H) {
    const hidden = H.hiddenTraditions(settings);
    const next = hide ? [...new Set([...hidden, id])] : hidden.filter((h) => h !== id);
    const changes = { calendar_hidden_traditions: next.join(",") };
    if (!hide) return changes;
    if (typeof settings.calendar_traditions === "string") changes.calendar_traditions = csv(settings.calendar_traditions).filter((t) => t !== id).join(",");
    if (typeof settings.calendar_picked_holidays === "string") changes.calendar_picked_holidays = csv(settings.calendar_picked_holidays).filter((p) => p.split("/")[0] !== id).join(",");
    if (settings.calendar_primary === id) changes.calendar_primary = "";
    return changes;
  }

  /** A custom event from the form, or the words saying what's missing (the app's own checks). */
  function customFromForm({ name, month, day, year, repeat, meaning }) {
    const dayNumber = Number(day);
    const yearNumber = Number(year);
    if (!String(name || "").trim()) return { error: "Give the event a name." };
    const needsYear = repeat === "once" || repeat === "weekly";
    if (needsYear && (!Number.isInteger(yearNumber) || yearNumber < 1900 || yearNumber > 2200)) return { error: "Enter the year, such as 2027." };
    // Yearly events may fall on Feb 29 (leap years); monthly ones on any day up to 31.
    const daysInMonth = repeat === "monthly" ? 31 : new Date(needsYear ? yearNumber : 2024, Number(month) + 1, 0).getDate();
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > daysInMonth) return { error: `Choose a day from 1 to ${daysInMonth}.` };
    return { holiday: { id: newId(), name: String(name).trim(), month: Number(month), day: dayNumber, meaning: String(meaning || "").trim(), year: needsYear ? yearNumber : null, repeat } };
  }

  function repeatLabel(holiday, H) {
    const date = `${MONTHS[holiday.month]} ${holiday.day}`;
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

  // ------------------------------------------------------------- saving

  async function storedSettings() {
    if (typeof global.getMySettings === "function") return global.getMySettings();
    return {};
  }

  /** Change some keys, keeping every other setting (SaltSettings.patch where the page has it). */
  async function patch(changes) {
    if (global.SaltSettings?.patch) return global.SaltSettings.patch(changes);
    const stored = await storedSettings();
    const next = {};
    Object.entries(stored || {}).forEach(([key, value]) => {
      if (!ROW_ONLY.has(key)) next[key] = value;
    });
    Object.assign(next, changes);
    await global.saveMySettings(next);
    global.dispatchEvent(new CustomEvent("saltSettingsChanged"));
    return next;
  }

  // ------------------------------------------------------------- pieces

  const chips = (group, options, value, label) =>
    `<div class="sp-chips settings-more-chips" role="group" aria-label="${esc(label)}">${options
      .map((o) => `<button type="button" class="button button--small button--pill" data-more-chip="${esc(group)}" data-value="${esc(o.value)}" aria-pressed="${String(o.value) === String(value)}">${esc(o.label)}</button>`)
      .join("")}</div>`;

  const check = (attrs, label, detail, on) => `<label class="my-sanctuary-check settings-more-check">
      <input type="checkbox" ${attrs} ${on ? "checked" : ""} />
      <span><span class="settings-more-check__label">${esc(label)}</span>${detail ? `<small class="settings-more-detail">${esc(detail)}</small>` : ""}</span>
    </label>`;

  const group = (title, body, intro = "") =>
    `<div class="my-sanctuary-settings-group settings-more-group"><h4 class="settings-more-heading">${esc(title)}</h4>${intro ? `<p class="my-sanctuary-intro">${esc(intro)}</p>` : ""}${body}</div>`;

  // ------------------------------------------------------------- My practice

  function practiceHtml(settings, G) {
    const chosen = G.myPractices(settings);
    return `<p class="my-sanctuary-intro">What kind of witch you are, alongside My path (the traditions you keep). Choose as many as fit. Rituals &amp; spells puts workings for your practice first, and your path (Living Library) adds the traditions you keep.</p>
      ${group("How you practise", G.PRACTICES.map((p) => check(`data-practice="${esc(p.id)}"`, p.name, p.about, chosen.includes(p.id))).join(""))}
      ${group("My deities", `<p class="my-sanctuary-intro">Your patron, the gods you’ve dedicated to, and those you’re getting to know.</p><p><a class="button button--ghost" href="${MY_DEITIES_HREF}">Open My deities</a></p>`)}`;
  }

  // ------------------------------------------------------------- My path (Living Library)

  function pathHtml(settings, G) {
    const T = G.traditions;
    const mode = T.pathMode(settings);
    const path = T.myPath(settings);
    const fromCalendars = T.calendarPath(settings).filter((id) => !path.hidden.includes(id) && T.PATH_CHOICES.some((t) => t.id === id));
    const choices = T.PATH_CHOICES.filter((t) => !path.hidden.includes(t.id));
    return group(
      "My path",
      `${chips("pathMode", PATH_MODES, mode, "My path")}
      ${mode === "calendars" ? `<p class="settings-more-detail">${esc(fromCalendars.length ? `From your calendars: ${fromCalendars.map(T.pathName).join(", ")}.` : "None of your calendars match a tradition yet. Turn some on in Calendar & holidays, or choose your own.")}</p>` : ""}
      ${mode === "custom" ? choices.map((t) => check(`data-path="${esc(t.id)}"`, t.name, "", path.traditions.includes(t.id))).join("") : ""}
      ${mode !== "off" ? check("data-other-deities", "Hide deities from other traditions", "Only deities from your path show. Any you’ve written your own notes for always stay.", settings.library_path_other_deities === "hide") : ""}`,
      "Puts the traditions you keep first in the Library: their deities, and the herbs, crystals and candles they use, ahead of everything else.",
    );
  }

  // ------------------------------------------------------------- Calendar & holidays

  function readPlace() {
    try {
      const place = JSON.parse(global.localStorage.getItem("sky.place") || "null");
      return place && Number.isFinite(place.latitude) && Number.isFinite(place.longitude) ? place : null;
    } catch {
      return null;
    }
  }

  function countingHtml(settings, G, open) {
    const K = G.calendars;
    const place = readPlace();
    const lead = K.primaryCalendar(settings);
    const shown = new Set(K.shownCalendars(settings));
    const list = K.calendarsForSettings(settings, G.traditions.myPath(settings).traditions);
    const hemisphere = settings[K.HEMISPHERE_KEY] || "auto";
    const lines = K.todayLines(new Date(), settings, place);
    const choiceList = (def) =>
      (def.choices || [])
        .map((choice) => {
          const value = K.calendarChoices(settings, def.id)[choice.key];
          const note = choice.options.find((o) => o.value === value)?.note;
          return `<div class="settings-more-choice"><p class="settings-more-check__label">${esc(choice.label)}</p>${chips(`opt:${def.id}:${choice.key}`, choice.options, value, choice.label)}${note ? `<p class="settings-more-detail">${esc(note)}</p>` : ""}</div>`;
        })
        .join("");
    const about = (def) => `<details class="settings-more-about" data-more-about="${esc(def.id)}" ${open.has(def.id) ? "open" : ""}><summary>About this calendar</summary><p class="settings-more-detail">${esc(def.about)}</p></details>`;
    const meta = (def) => `${esc(K.CONFIDENCE_LABEL[def.confidence] || "")}${K.calendarPathName(def) ? ` · ${esc(K.calendarPathName(def))}` : ""}`;
    return `${lines.length ? `<div class="settings-more-preview" aria-label="Today, as these calendars count it"><p class="settings-more-detail">${esc(G.calendar.longDate(new Date()))}</p>${lines.map((l) => `<p><strong>${esc(l.name)}:</strong> ${esc(l.long || l.short)}</p>`).join("")}</div>` : ""}
      ${group(
        "Count my days by",
        `${chips("count", COUNT_OPTIONS, lead, "Count my days by")}
        <p class="settings-more-detail">${esc(lead === "moon" ? "Today leads with the moon’s date: its month, from new moon to new moon, and the day of it. The ordinary date shows beneath." : "Today leads with the ordinary date. You can still show the moon’s months beside it below.")}</p>
        ${lead === "moon" ? `<div class="settings-more-calendar"><p class="settings-more-check__label">${esc(K.MOON_CALENDAR.name)} <small class="settings-more-detail">${meta(K.MOON_CALENDAR)}</small></p>${about(K.MOON_CALENDAR)}${choiceList(K.MOON_CALENDAR)}</div>` : ""}
        <p class="settings-more-check__label">Hemisphere</p>
        ${chips("hemisphere", HEMISPHERE_OPTIONS, hemisphere, "Hemisphere")}
        <p class="settings-more-detail">${esc(`Seasons and moon names follow the ${K.hemisphereOf(settings, place)}ern hemisphere${hemisphere === "auto" ? (place ? ", from your place" : "; add your place on Today’s sky page, or choose Northern or Southern here") : ""}.`)}</p>`,
      )}
      ${group(
        "Also show",
        list
          .map(
            (def) => `<div class="settings-more-calendar">${check(`data-extra="${esc(def.id)}"`, def.name, "", shown.has(def.id))}<p class="settings-more-detail">${meta(def)}</p>${about(def)}${shown.has(def.id) ? choiceList(def) : ""}</div>`,
          )
          .join(""),
        "Other ways of counting the day, shown under the date on Today. Calendars of your path come first.",
      )}`;
  }

  function customHtml(choice, G, form) {
    const H = G.holidays;
    const list = choice.custom;
    const repeat = form.repeat || "yearly";
    const needsYear = repeat === "once" || repeat === "weekly";
    return group(
      "Your own events",
      `${list.length ? `<ul class="settings-more-list">${list
        .map(
          (h) => `<li><span><span class="settings-more-check__label">${esc(h.name)}</span><small class="settings-more-detail">${esc(`${repeatLabel(h, H)}${h.meaning ? ` · ${h.meaning}` : ""}`)}</small></span>
          <button type="button" class="button button--small button--ghost" data-remove-custom="${esc(h.id)}" aria-label="Remove ${esc(h.name)}">Remove</button></li>`,
        )
        .join("")}</ul>` : ""}
      <div class="settings-more-add" data-custom-form>
        <p class="settings-more-check__label">Add an event</p>
        <label>Name<input type="text" data-custom="name" value="${esc(form.name || "")}" placeholder="My dedication day, a coven gathering…" /></label>
        <p class="settings-more-check__label">Repeats</p>
        ${chips("repeat", REPEAT_OPTIONS, repeat, "Repeats")}
        ${repeat !== "monthly" ? `<label>Month<select data-custom="month">${MONTH_NAMES.map((m, i) => `<option value="${i}" ${String(form.month ?? new Date().getMonth()) === String(i) ? "selected" : ""}>${m}</option>`).join("")}</select></label>` : ""}
        <label>Day of the month<input type="number" inputmode="numeric" min="1" max="31" data-custom="day" value="${esc(form.day || "")}" placeholder="1–31" /></label>
        ${needsYear ? `<label>${repeat === "weekly" ? "Year it starts" : "Year"}<input type="number" inputmode="numeric" min="1900" max="2200" data-custom="year" value="${esc(form.year || new Date().getFullYear())}" /></label>` : ""}
        <p class="settings-more-detail">${esc(repeat === "yearly" ? "Comes round on this date every year." : repeat === "monthly" ? "Comes round on this day of every month (skipping months too short for it)." : repeat === "weekly" ? "Comes round every week on the weekday of this date, starting from it." : "Happens once, on this date.")}</p>
        <label>What it means to you (optional)<textarea data-custom="meaning" rows="2">${esc(form.meaning || "")}</textarea></label>
        <p class="settings-more-detail" role="status" aria-live="polite" data-custom-message>${esc(form.message || "")}</p>
        <button type="button" class="button button--ghost" data-add-custom>Add event</button>
      </div>`,
    );
  }

  function pickHtml(choice, chosen, hidden, G, open) {
    const H = G.holidays;
    const picked = new Set(choice.picked || []);
    return group(
      "Holidays from other calendars",
      H.TRADITIONS.filter((t) => !hidden.includes(t.id))
        .map((t) => {
          const count = t.holidays.filter((h) => picked.has(H.pickId(t.id, h.id))).length;
          const all = chosen.has(t.id);
          return `<details class="my-settings-drawer" data-more-pick="${esc(t.id)}" ${open.has(`pick:${t.id}`) ? "open" : ""}>
            <summary>${esc(t.name)}${all ? " · all on" : count ? ` · ${count} added` : ""}</summary>
            <div class="my-settings-drawer-panel">${
              all
                ? `<p class="settings-more-detail">This whole calendar is on above, so all its holidays already show.</p>`
                : t.holidays.map((h) => check(`data-pick="${esc(H.pickId(t.id, h.id))}"`, h.name, h.meaning, picked.has(H.pickId(t.id, h.id)))).join("")
            }</div>
          </details>`;
        })
        .join(""),
      "Add single holidays to your own calendar without turning on the whole calendar.",
    );
  }

  function yearAheadHtml(settings, G) {
    const now = new Date();
    const end = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const K = G.calendars;
    // The other calendars' observances too; of the moon's, just each month's first day.
    const events = (K.CALENDARS_LIVE ? K.calendarEventsBetween(now, end, settings, readPlace()) : []).filter((e) => e.calendar !== "moon" || e.id.startsWith("moon-new-"));
    const year = K.mergeCalendarEvents(G.holidays.holidaysBetween(now, end, G.holidays.holidayChoice(settings)), events);
    return group(
      "The year ahead",
      year.length
        ? `<ul class="settings-more-year">${year
            .map((h) => `<li><span class="settings-more-date">${esc(G.calendar.shortDate(h.date))}${h.days > 1 ? ` · ${h.days} days` : ""}</span><span class="settings-more-check__label">${esc(h.name)}</span><small class="settings-more-detail">${esc(h.traditions.join(" · "))}</small>${h.meaning ? `<small class="settings-more-detail">${esc(h.meaning)}</small>` : ""}</li>`)
            .join("")}</ul>`
        : `<p class="settings-more-detail">Choose a calendar above to see its holidays.</p>`,
    );
  }

  function calendarHtml(settings, G, ui) {
    const H = G.holidays;
    const choice = H.holidayChoice(settings);
    const chosen = new Set(choice.traditions);
    const hidden = H.hiddenTraditions(settings);
    const shownTraditions = H.TRADITIONS.filter((t) => !hidden.includes(t.id));
    const mainOptions = shownTraditions.filter((t) => chosen.has(t.id)).map((t) => ({ value: t.id, label: t.name }));
    const show = settings.today_show || "both";
    return `<p class="my-sanctuary-intro">Choose the calendars you keep. Their holidays show on Today on the day, with what they mean, and On the horizon shows the next one.</p>
      ${G.calendars.CALENDARS_LIVE ? countingHtml(settings, G, ui.open) : ""}
      ${group(
        "Your calendars",
        `${shownTraditions
          .map(
            (t) => `<div class="settings-more-row">${check(`data-tradition="${esc(t.id)}"`, t.name, t.description, chosen.has(t.id))}${
              H.HIDEABLE_TRADITIONS.includes(t.id)
                ? `<button type="button" class="button button--small button--ghost" data-hide-tradition="${esc(t.id)}" aria-label="Hide the ${esc(t.name)} calendar" title="Removes it from view everywhere. You can show it again here.">Hide</button>`
                : ""
            }</div>`,
          )
          .join("")}
        ${check('data-tradition="custom"', "Your own calendar", "Your own events, plus single holidays picked from any calendar.", chosen.has("custom"))}
        ${hidden.length ? `<p><button type="button" class="button button--small button--ghost" data-show-hidden>${hidden.length > 1 ? "Show hidden calendars" : "Show hidden calendar"}</button></p>` : ""}`,
      )}
      ${mainOptions.length > 1 ? group("Main calendar", chips("primary", mainOptions, G.traditionDay.primaryTradition(settings, choice), "Main calendar"), "Names the day at the top of Today: the Athenian date, the Norse weekday gods, the Roman date and so on.") : ""}
      ${group(
        "On Today",
        `${chips("todayShow", SHOW_OPTIONS, show, "Show on Today")}
        ${show === "both" ? `<p class="settings-more-check__label">Layout</p>${chips("todayLayout", LAYOUT_OPTIONS, settings.today_layout || "stacked", "Layout")}` : ""}
        <p class="settings-more-detail">On the horizon always shows the next moon phase and the next holiday.</p>`,
      )}
      ${chosen.has("custom") ? customHtml(choice, G, ui.form) + pickHtml(choice, chosen, hidden, G, ui.open) : ""}
      ${yearAheadHtml(settings, G)}`;
  }

  // ------------------------------------------------------------- mounting

  const STYLE = `.settings-more-group{display:grid;gap:8px;margin-top:14px}.settings-more-heading{font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted,#cabf9d);margin:0}.settings-more-chips{display:flex;flex-wrap:wrap;gap:8px}.settings-more-chips [aria-pressed="true"]{background:var(--gold,#b9a05d);color:var(--charcoal,#111512);border-color:var(--gold,#b9a05d)}.settings-more-check{align-items:flex-start}.settings-more-check>span{display:grid;gap:2px}.settings-more-detail{display:block;color:var(--muted,#cabf9d);font-size:.88rem;line-height:1.45;margin:0}.settings-more-check__label{font-weight:600;margin:0}.settings-more-row{display:flex;gap:10px;align-items:flex-start;justify-content:space-between}.settings-more-row>label{flex:1}.settings-more-calendar{display:grid;gap:4px;padding:8px 0;border-bottom:1px solid var(--line,rgba(194,200,196,.24))}.settings-more-about summary{cursor:pointer;color:var(--gold,#b9a05d);font-size:.88rem}.settings-more-choice{display:grid;gap:4px;padding-top:4px}.settings-more-list,.settings-more-year{list-style:none;margin:0;padding:0;display:grid;gap:10px}.settings-more-list li{display:flex;gap:10px;align-items:center;justify-content:space-between}.settings-more-list li>span{display:grid;gap:2px}.settings-more-year li{display:grid;gap:2px;padding-bottom:10px;border-bottom:1px solid var(--line,rgba(194,200,196,.24))}.settings-more-date{color:var(--gold,#b9a05d);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase}.settings-more-add{display:grid;gap:8px;padding:12px;border:1px solid var(--line,rgba(194,200,196,.24));border-radius:14px}.settings-more-preview{display:grid;gap:4px;padding:12px;border:1px solid rgba(226,195,109,.4);border-radius:14px}.settings-more-preview p{margin:0}.settings-more-status{color:var(--muted,#cabf9d);font-size:.88rem;min-height:1.2em}`;

  function addStyles(doc) {
    if (doc.querySelector("style[data-settings-more]")) return;
    const style = doc.createElement("style");
    style.dataset.settingsMore = "";
    style.textContent = STYLE;
    doc.head.append(style);
  }

  /**
   * Fill the My practice and Calendar & holidays panels, and add My path to
   * the Living Library panel. `panels` are the Settings view's fieldsets.
   */
  async function mount(panels, G = global.SaltCore?.guides) {
    if (!G?.holidays || !panels) return;
    const doc = panels.practice?.ownerDocument || global.document;
    addStyles(doc);
    let settings = (await storedSettings().catch(() => null)) || {};
    const ui = { open: new Set(), form: {} };

    const targets = {
      practice: panels.practice && placeholder(panels.practice, "practice"),
      calendar: panels.calendar && placeholder(panels.calendar, "calendar"),
      path: panels.library && placeholder(panels.library, "path", true),
    };

    function placeholder(panel, key, first = false) {
      let node = panel.querySelector(`[data-settings-more="${key}"]`);
      if (!node) {
        node = doc.createElement("div");
        node.dataset.settingsMore = key;
        const legend = panel.querySelector(":scope > legend");
        if (first && legend) legend.after(node);
        else panel.append(node);
        const status = doc.createElement("p");
        status.className = "settings-more-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        status.dataset.settingsMoreStatus = key;
        node.after(status);
        // These controls save themselves; keep them from marking the form unsaved.
        ["input", "change"].forEach((type) => node.addEventListener(type, (event) => event.stopPropagation()));
      }
      return node;
    }

    function draw(which = ["practice", "calendar", "path"]) {
      const active = doc.activeElement;
      const focusKey = active && Object.values(targets).some((t) => t?.contains(active)) ? [...active.attributes].filter((a) => a.name.startsWith("data-")).map((a) => `[${a.name}="${CSS.escape(a.value)}"]`).join("") : "";
      if (which.includes("practice") && targets.practice) targets.practice.innerHTML = practiceHtml(settings, G);
      if (which.includes("calendar") && targets.calendar) targets.calendar.innerHTML = calendarHtml(settings, G, ui);
      if (which.includes("path") && targets.path) targets.path.innerHTML = pathHtml(settings, G);
      if (focusKey) Object.values(targets).find((t) => t?.querySelector(focusKey))?.querySelector(focusKey)?.focus({ preventScroll: true });
    }

    let saving = Promise.resolve();
    function save(changes, where) {
      settings = { ...settings, ...changes };
      draw();
      const status = doc.querySelector(`[data-settings-more-status="${where}"]`);
      if (status) status.textContent = "Saving…";
      saving = saving
        .then(() => patch(changes))
        .then(() => {
          if (status) status.textContent = "Saved.";
        })
        .catch((error) => {
          console.error(error);
          if (status) status.textContent = "That change couldn’t be saved. Please try again.";
        });
      return saving;
    }

    function onChange(event) {
      const t = event.target;
      if (t.dataset.practice) {
        const chosen = G.myPractices(settings);
        return save({ my_practice: G.practicesValue(t.checked ? [...chosen, t.dataset.practice] : chosen.filter((p) => p !== t.dataset.practice)) }, "practice");
      }
      if (t.dataset.path) {
        const next = new Set(G.traditions.myPath(settings).traditions);
        if (t.checked) next.add(t.dataset.path);
        else next.delete(t.dataset.path);
        return save({ library_path: G.traditions.PATH_CHOICES.map((c) => c.id).filter((id) => next.has(id)).join(",") }, "path");
      }
      if (t.hasAttribute("data-other-deities")) return save({ library_path_other_deities: t.checked ? "hide" : "show" }, "path");
      if (t.dataset.tradition) {
        const next = new Set(G.holidays.holidayChoice(settings).traditions);
        if (t.checked) next.add(t.dataset.tradition);
        else next.delete(t.dataset.tradition);
        return save({ calendar_traditions: [...next].join(",") }, "calendar");
      }
      if (t.dataset.extra) return save({ [G.calendars.EXTRA_KEY]: G.calendars.withShown(settings, t.dataset.extra, t.checked) }, "calendar");
      if (t.dataset.pick) {
        const next = new Set(G.holidays.holidayChoice(settings).picked || []);
        if (t.checked) next.add(t.dataset.pick);
        else next.delete(t.dataset.pick);
        return save({ calendar_picked_holidays: [...next].join(",") }, "calendar");
      }
      if (t.dataset.custom) ui.form[t.dataset.custom] = t.value;
      return undefined;
    }

    function onInput(event) {
      const t = event.target;
      if (t.dataset.custom) ui.form[t.dataset.custom] = t.value;
    }

    function onClick(event) {
      const button = event.target.closest("button");
      if (!button) return undefined;
      const chipGroup = button.dataset.moreChip;
      if (chipGroup) {
        const value = button.dataset.value;
        if (chipGroup === "pathMode") {
          // Starting your own list from what your calendars already say.
          const changes = { library_path_mode: value };
          if (value === "custom" && typeof settings.library_path !== "string") {
            const hidden = G.holidays.hiddenTraditions(settings);
            changes.library_path = G.traditions.calendarPath(settings).filter((id) => !hidden.includes(id) && G.traditions.PATH_CHOICES.some((t) => t.id === id)).join(",");
          }
          return save(changes, "path");
        }
        if (chipGroup === "count") return save({ [G.calendars.COUNT_KEY]: value }, "calendar");
        if (chipGroup === "hemisphere") return save({ [G.calendars.HEMISPHERE_KEY]: value }, "calendar");
        if (chipGroup === "primary") return save({ calendar_primary: value }, "calendar");
        if (chipGroup === "todayShow") return save({ today_show: value }, "calendar");
        if (chipGroup === "todayLayout") return save({ today_layout: value }, "calendar");
        if (chipGroup === "repeat") {
          ui.form.repeat = value;
          ui.form.message = "";
          return draw(["calendar"]);
        }
        if (chipGroup.startsWith("opt:")) {
          const [, id, key] = chipGroup.split(":");
          return save({ [G.calendars.optionKey(id, key)]: value }, "calendar");
        }
      }
      if (button.dataset.hideTradition) return save(hideChanges(settings, button.dataset.hideTradition, true, G.holidays), "calendar");
      if (button.hasAttribute("data-show-hidden")) return save({ calendar_hidden_traditions: "" }, "calendar");
      if (button.dataset.removeCustom) {
        const list = G.holidays.holidayChoice(settings).custom.filter((h) => h.id !== button.dataset.removeCustom);
        return save({ calendar_custom_holidays: JSON.stringify(list) }, "calendar");
      }
      if (button.hasAttribute("data-add-custom")) {
        const result = customFromForm({ ...ui.form, repeat: ui.form.repeat || "yearly", month: ui.form.month ?? String(new Date().getMonth()), year: ui.form.year ?? String(new Date().getFullYear()) });
        if (result.error) {
          ui.form.message = result.error;
          const message = targets.calendar.querySelector("[data-custom-message]");
          if (message) message.textContent = result.error;
          return undefined;
        }
        const list = [...G.holidays.holidayChoice(settings).custom, result.holiday];
        ui.form = { repeat: ui.form.repeat, month: ui.form.month, message: "Added." };
        return save({ calendar_custom_holidays: JSON.stringify(list) }, "calendar");
      }
      return undefined;
    }

    function onToggle(event) {
      const about = event.target.dataset?.moreAbout;
      const pick = event.target.dataset?.morePick;
      const key = about || (pick ? `pick:${pick}` : null);
      if (!key) return;
      if (event.target.open) ui.open.add(key);
      else ui.open.delete(key);
    }

    Object.values(targets).forEach((node) => {
      if (!node || node.dataset.settingsMoreReady) return;
      node.dataset.settingsMoreReady = "true";
      node.addEventListener("change", onChange);
      node.addEventListener("input", onInput);
      node.addEventListener("click", onClick);
      node.addEventListener("toggle", onToggle, true);
    });

    draw();

    // When settings change elsewhere (a restore, another tab's save), read them again.
    global.addEventListener("saltSettingsChanged", () => {
      saving.then(() => storedSettings()).then((fresh) => {
        if (fresh) {
          settings = fresh;
          draw();
        }
      }).catch(() => {});
    });
  }

  const api = { MY_DEITIES_HREF, hideChanges, customFromForm, repeatLabel, mount };
  global.SettingsMore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
