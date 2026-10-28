/*
 * PracticeKit: shared pieces for the Craft tools pages (/practice/…), the
 * website's copy of the app's Rituals → Craft tools. Every practice's pages
 * use it, whichever bundle of app logic they load.
 *
 *   PracticeKit.start(async (user) => { … draw the page … })
 *   PracticeKit.render(root, html)        keeps focus and caret across redraws
 *   PracticeKit.delegate(root, { act(el, event) { … } })
 *   PracticeKit.entries / add / update / remove   craft_entries via SaltCraft
 *   PracticeKit.row / chip / field / card / …     HTML in the app's shapes
 *   PracticeKit.runDraft(draft)           a guided working, step by step
 *   PracticeKit.downloadFile(name, text)  e.g. an .ics of reminders
 *
 * Needs js/salt-store.js (SaltPage, SaltCraft, SaltSettings). Nothing here
 * sends anything about the person anywhere; the place, if given, stays in
 * this browser.
 */
(function (global, factory) {
  const kit = factory(global);
  if (typeof module === "object" && module.exports) module.exports = kit;
  else global.PracticeKit = kit;
})(typeof window !== "undefined" ? window : globalThis, function (global) {
  "use strict";

  // ------------------------------------------------------------------ text

  const esc = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const join = (parts, sep = " · ") => parts.filter((p) => p !== null && p !== undefined && p !== false && String(p).trim() !== "").join(sep);

  // ------------------------------------------------------------------ links

  const enc = encodeURIComponent;
  const href = {
    hub: "/practice/",
    practice: (id) => `/practice/${id}/`,
    tool: (id, path, query) => `/practice/${id}/${path ? `${path}/` : ""}${query ? `?${query}` : ""}`,
    /** A premade ritual or spell, and the list filtered by a practice. */
    premade: (id) => `/rituals/premade/?id=${enc(id)}`,
    premadeList: (practice) => `/rituals/premade/${practice ? `?practice=${enc(practice)}` : ""}`,
    /** A Living Library entry ("traditional:herb:rosemary"), on its public Library page. */
    library: (id) => `/library/entry/?entity=${enc(String(id || "").replace(/:/g, "/"))}`,
    /** Settings in the Sanctuary panel (calendars, My practice). */
    settings: "/today/calendar/",
    /** Crisis and support lines (the app's More → Support). */
    support: "/more/support/",
    nativeLand: "https://native-land.ca"
  };

  // ------------------------------------------------------------------ place

  // The person's place for seasons and hemispheres, as the app keeps it:
  // only in this browser, rounded to about a kilometre, never synced or sent.
  // The app's own key, which /today/sky/ and the altar use too; the older practice-page key is still read.
  const PLACE_KEY = "sky.place";
  const OLD_PLACE_KEY = "salt.sky.place";
  const round = (n) => Math.round(n * 100) / 100;
  function validPlace(latitude, longitude) {
    return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  }
  function readPlace(storage = global.localStorage) {
    try {
      const raw = JSON.parse(storage.getItem(PLACE_KEY) || storage.getItem(OLD_PLACE_KEY) || "null");
      return raw && validPlace(raw.latitude, raw.longitude) ? raw : null;
    } catch {
      return null;
    }
  }
  function savePlace(latitude, longitude, label, storage = global.localStorage) {
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!validPlace(lat, lon)) return null;
    const place = { latitude: round(lat), longitude: round(lon), source: "manual", ...(label ? { label: String(label).slice(0, 60) } : {}) };
    try {
      storage.setItem(PLACE_KEY, JSON.stringify(place));
    } catch {
      return null;
    }
    return place;
  }
  function clearPlace(storage = global.localStorage) {
    try {
      storage.removeItem(PLACE_KEY);
      storage.removeItem(OLD_PLACE_KEY);
    } catch {
      /* nothing saved */
    }
  }

  /**
   * "Your place" in a few fields, kept only in this browser (the same place
   * the Today and other practice pages read). Acts: place-save, place-clear,
   * place-locate; wire them with placeHandlers(root, redraw).
   */
  function placeForm(place, message = "") {
    return details(
      place ? `Your place: ${place.label || `${place.latitude}, ${place.longitude}`}` : "Set my place",
      `${caption(
        "Your place sets the hemisphere and season. It’s kept only in this browser, rounded to about a kilometre, and never sent anywhere. A rough latitude is plenty: a nearby town’s will do."
      )}<div class="sp-grid-2">${field({ id: "place-lat", label: "Latitude (south is negative)", value: place ? String(place.latitude) : "", inputmode: "decimal", placeholder: "51.5" })}${field({
        id: "place-lon",
        label: "Longitude (west is negative)",
        value: place ? String(place.longitude) : "",
        inputmode: "decimal",
        placeholder: "-0.12"
      })}</div>${actions([
        button({ label: "Save my place", act: "place-save", small: true }),
        "geolocation" in (global.navigator || {}) ? button({ label: "Use this device’s location", act: "place-locate", small: true, ghost: true }) : "",
        place ? textButton({ label: "Forget my place", act: "place-clear", quiet: true }) : ""
      ])}${notice(message, { live: true })}`,
      { id: "place" }
    );
  }
  function placeHandlers(rootEl, redraw) {
    return {
      "place-save"() {
        const lat = parseFloat(rootEl.querySelector("#place-lat")?.value ?? "");
        const lon = parseFloat(rootEl.querySelector("#place-lon")?.value ?? "");
        const saved = savePlace(lat, lon);
        redraw(saved ? "Saved in this browser." : "Those don’t look like a latitude (−90 to 90) and longitude (−180 to 180).");
      },
      "place-clear"() {
        clearPlace();
        redraw("Forgotten.");
      },
      "place-locate"() {
        redraw("Asking your browser…");
        global.navigator.geolocation.getCurrentPosition(
          (pos) => {
            savePlace(pos.coords.latitude, pos.coords.longitude);
            redraw("Saved in this browser, rounded to about a kilometre.");
          },
          () => redraw("Your browser didn’t share a location. You can type it in instead."),
          { maximumAge: 6 * 3_600_000, timeout: 15000 }
        );
      }
    };
  }

  // ------------------------------------------------------------------ dates

  const pad = (n) => String(n).padStart(2, "0");
  const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function fromKey(key) {
    const m = key ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key).trim()) : null;
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return Number.isNaN(d.getTime()) || d.getMonth() !== +m[2] - 1 ? null : d;
  }
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  /** "October 16, 2026" (the app's fullDate). */
  function fullDate(value) {
    const d = value instanceof Date ? value : fromKey(value);
    return d ? `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : null;
  }
  /** "October 16" (the app's fullDate without the year). */
  const dayMonth = (value) => fullDate(value)?.replace(/, \d{4}$/, "") ?? String(value ?? "");
  /** The last `count` days, today first, as keys. */
  function recentDays(now = new Date(), count = 7) {
    return Array.from({ length: count }, (_, i) => dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)));
  }

  // ------------------------------------------------------------------ html

  const attrs = (data = {}) =>
    Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== null && v !== false)
      .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
      .join("");
  const dataAttrs = (data = {}) => attrs(Object.fromEntries(Object.entries(data).map(([k, v]) => [`data-${k}`, v])));

  const back = (url, label) => `<a class="sp-back pr-back" href="${esc(url)}">← ${esc(label)}</a>`;

  function head({ eyebrow, title, lede }) {
    return `<header class="pr-head">${eyebrow ? `<p class="sp-eyebrow">${esc(eyebrow)}</p>` : ""}<h1>${esc(title)}</h1>${
      lede ? `<p class="pr-lede">${esc(lede)}</p>` : ""
    }</header>`;
  }

  const section = (label, inner, { id, level = "h2" } = {}) =>
    `<section class="sp-section"${id ? ` aria-labelledby="${esc(id)}"` : ""}>${
      label ? `<${level} class="sp-label"${id ? ` id="${esc(id)}"` : ""}>${esc(label)}</${level}>` : ""
    }${inner}</section>`;

  const card = (inner, { gold = false, label, tag = "div" } = {}) =>
    `<${tag} class="sp-card${gold ? " sp-card--gold" : ""}">${label ? `<p class="sp-label--plain">${esc(label)}</p>` : ""}${inner}</${tag}>`;

  const p = (text, cls) => (text ? `<p${cls ? ` class="${cls}"` : ""}>${esc(text)}</p>` : "");
  const muted = (text) => p(text, "sp-muted");
  const caption = (text) => p(text, "sp-caption");
  const notice = (text, { live = false } = {}) => (text ? `<p class="sp-notice"${live ? ' role="status"' : ""}>${esc(text)}</p>` : "");
  const empty = (text) => p(text, "sp-empty");
  const big = (text, tag = "h2") => `<${tag} class="pr-big">${esc(text)}</${tag}>`;
  const bullets = (items) => `<ul class="pr-bullets">${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

  /** A row in a list: a link with `url`, otherwise a button with `act`. */
  function row({ url, act, data, title, detail, id, label }) {
    const inner = `<span class="sp-row__text"><span class="sp-row__title">${esc(title)}</span>${
      detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""
    }</span><span class="sp-row__chevron" aria-hidden="true">›</span>`;
    if (url) return `<a class="sp-row" href="${esc(url)}"${id ? ` id="${esc(id)}"` : ""}${label ? ` aria-label="${esc(label)}"` : ""}>${inner}</a>`;
    return `<button type="button" class="sp-row"${id ? ` id="${esc(id)}"` : ""}${act ? ` data-act="${esc(act)}"` : ""}${dataAttrs(data)}${
      label ? ` aria-label="${esc(label)}"` : ""
    }>${inner}</button>`;
  }
  const list = (rows, label) => (rows.length ? `<div class="sp-list"${label ? ` role="group" aria-label="${esc(label)}"` : ""}>${rows.join("")}</div>` : "");

  /** A chip: pressable (with `act`; `pressed` gives aria-pressed) or a plain label. */
  function chip({ label, act, data, pressed, a11y, value }) {
    if (!act) return `<span class="sp-chip sp-chip--static">${esc(label)}</span>`;
    return `<button type="button" class="sp-chip" data-act="${esc(act)}"${value !== undefined ? ` data-value="${esc(value)}"` : ""}${dataAttrs(data)}${
      pressed === undefined ? "" : ` aria-pressed="${pressed ? "true" : "false"}"`
    }${a11y ? ` aria-label="${esc(a11y)}"` : ""}>${esc(label)}</button>`;
  }
  const chips = (items, label) => (items.length ? `<div class="sp-chips"${label ? ` role="group" aria-label="${esc(label)}"` : ""}>${items.join("")}</div>` : "");

  /** A labelled text field. `input` names the handler for typing; `change` for a finished edit. */
  function field({ id, label, value = "", placeholder, multiline, type = "text", input, change, inputmode, hint, maxlength, autocomplete = "off" }) {
    const common = `id="${esc(id)}" name="${esc(id)}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ""}${input ? ` data-input="${esc(input)}"` : ""}${
      change ? ` data-change="${esc(change)}"` : ""
    }${inputmode ? ` inputmode="${esc(inputmode)}"` : ""}${maxlength ? ` maxlength="${maxlength}"` : ""}${hint ? ` aria-describedby="${esc(id)}-hint"` : ""}`;
    const control = multiline
      ? `<textarea ${common}>${esc(value)}</textarea>`
      : `<input type="${esc(type)}" autocomplete="${esc(autocomplete)}" value="${esc(value)}" ${common} />`;
    return `<div class="sp-field"><label for="${esc(id)}">${esc(label)}</label>${control}${hint ? `<p class="sp-caption" id="${esc(id)}-hint">${esc(hint)}</p>` : ""}</div>`;
  }

  function button({ label, act, url, primary, ghost, small, disabled, data, hint, id, value }) {
    const cls = `button${primary ? " button--primary" : ""}${ghost ? " button--ghost" : ""}${small ? " button--small" : ""}`;
    if (url) return `<a class="${cls}" href="${esc(url)}"${id ? ` id="${esc(id)}"` : ""}${hint ? ` aria-describedby="${esc(id)}-hint"` : ""}>${esc(label)}</a>`;
    return `<button type="button" class="${cls}"${id ? ` id="${esc(id)}"` : ""}${act ? ` data-act="${esc(act)}"` : ""}${value !== undefined ? ` data-value="${esc(value)}"` : ""}${dataAttrs(data)}${
      disabled ? " disabled" : ""
    }${hint ? ` title="${esc(hint)}"` : ""}>${esc(label)}</button>`;
  }
  const textButton = ({ label, act, data, disabled, quiet, a11y, value }) =>
    `<button type="button" class="pr-textbtn${quiet ? " pr-textbtn--quiet" : ""}" data-act="${esc(act)}"${value !== undefined ? ` data-value="${esc(value)}"` : ""}${dataAttrs(data)}${disabled ? " disabled" : ""}${
      a11y ? ` aria-label="${esc(a11y)}"` : ""
    }>${esc(label)}</button>`;
  const actions = (items) => `<div class="sp-actions">${items.filter(Boolean).join("")}</div>`;

  /** A labelled on/off switch (a checkbox). */
  function toggle({ id, label, detail, checked, change }) {
    return `<label class="pr-switch" for="${esc(id)}"><input type="checkbox" role="switch" id="${esc(id)}" data-change="${esc(change)}"${checked ? " checked" : ""} /><span class="pr-switch__text"><span class="pr-switch__title">${esc(
      label
    )}</span>${detail ? `<span class="sp-caption">${esc(detail)}</span>` : ""}</span></label>`;
  }

  const details = (summary, inner, { open = false, id } = {}) =>
    `<details class="sp-details"${open ? " open" : ""}${id ? ` id="${esc(id)}"` : ""}><summary>${esc(summary)}</summary><div class="sp-section">${inner}</div></details>`;

  /** "Saved in this browser…" or "…and to your account", as the app words it. */
  function savedLine(user, what) {
    return user ? "Saved to your account, so it’s on the app too." : `Saved in this browser. Sign in to keep ${what} with your account.`;
  }

  /**
   * The last week as chips, or any date typed in (the app's DayPicker).
   * Acts: `${name}-day` (data-value = key or ""), input: `${name}-typed`.
   */
  function dayPicker({ name, label, value, typed = "", allowNone = false, now = new Date(), labels = ["Today", "Yesterday"] }) {
    const keys = recentDays(now, 7);
    const items = keys.map((key, i) =>
      chip({ label: i === 0 ? labels[0] : i === 1 ? labels[1] : dayMonth(key), act: `${name}-day`, value: key, pressed: value === key })
    );
    if (value && !keys.includes(value) && !typed) items.push(chip({ label: fullDate(value) ?? value, act: `${name}-day`, value, pressed: true }));
    if (allowNone) items.push(chip({ label: "Not sure", act: `${name}-day`, value: "", pressed: value === null }));
    const t = typed.trim();
    const typedOk = !!fromKey(t) && t <= dateKey(now);
    return `<div class="sp-section"><p class="sp-muted">${esc(label)}</p>${chips(items, label)}${field({
      id: `${name}-typed`,
      label: "Or another date (YYYY-MM-DD)",
      value: typed,
      input: `${name}-typed`,
      placeholder: "e.g. 2026-04-21",
      inputmode: "numeric"
    })}${t && !typedOk ? muted("Write the date as year-month-day, and not in the future.") : ""}</div>`;
  }
  /** Reads a typed date for the picker: the key when it's whole and not in the future, else null. */
  function typedDay(text, now = new Date()) {
    const t = String(text || "").trim();
    return fromKey(t) && t <= dateKey(now) ? t : null;
  }

  /** "Whose land are you on?" (the app's LandCard). Opened as a plain link; nothing is added to it. */
  function landCard() {
    return card(
      `${big("Every place has a longer story", "h3")}<p>The ground you garden, walk and gather on has Indigenous history, and often living Nations who still care for it. Learning whose land it is, its names and its stories is part of knowing a place well. Where you can, support Indigenous-led land and language work there.</p>${muted(
        "Native Land is a map of Indigenous territories, languages and treaties, run by Native Land Digital, an Indigenous-led not-for-profit. Its lines are a starting point, not legal borders; the Nations themselves are the best source. This site sends nothing about you; you search the map yourself."
      )}${actions([`<a class="button button--ghost" href="${href.nativeLand}" target="_blank" rel="noopener noreferrer">Open the Native Land map<span class="pr-visually-hidden"> (opens native-land.ca in a new tab)</span></a>`])}`,
      { label: "Whose land are you on?" }
    );
  }

  // ------------------------------------------------------------------ support

  /**
   * "If this stirs up something heavy, support is here." (the app's
   * SupportLink), opening the site's Support page with its crisis lines.
   */
  function support(label = "If this stirs up something heavy, support is here.") {
    return `<p class="pr-support"><a class="pr-link sp-caption" href="${href.support}">${esc(label)}</a></p>`;
  }

  // ------------------------------------------------------------------ drawing

  /** Replace a region's HTML, keeping focus, caret and open <details> where they were. */
  function render(el, html) {
    if (!el) return;
    const doc = el.ownerDocument;
    const active = doc.activeElement && el.contains(doc.activeElement) ? doc.activeElement : null;
    let selector = null;
    let caret = null;
    if (active) {
      if (active.id) selector = `#${CSS.escape(active.id)}`;
      else if (active.dataset.act) selector = `[data-act="${CSS.escape(active.dataset.act)}"]${active.dataset.value !== undefined ? `[data-value="${CSS.escape(active.dataset.value)}"]` : ""}`;
      if ("selectionStart" in active) {
        try {
          caret = [active.selectionStart, active.selectionEnd];
        } catch {
          caret = null;
        }
      }
    }
    const open = [...el.querySelectorAll("details[open]")].map((d) => d.id || d.querySelector("summary")?.textContent || "");
    el.innerHTML = html;
    el.querySelectorAll("details").forEach((d) => {
      if (open.includes(d.id || d.querySelector("summary")?.textContent || "")) d.open = true;
    });
    if (selector) {
      const next = el.querySelector(selector);
      if (next) {
        next.focus({ preventScroll: true });
        if (caret && "setSelectionRange" in next) {
          try {
            next.setSelectionRange(caret[0], caret[1]);
          } catch {
            /* not a text field */
          }
        }
      }
    }
  }

  /**
   * One listener per event for a page: clicks on [data-act], typing in
   * [data-input], finished edits on [data-change]. Handlers get (el, event).
   */
  function delegate(root, handlers) {
    root.addEventListener("click", (event) => {
      const el = event.target.closest?.("[data-act]");
      if (!el || !root.contains(el) || el.disabled) return;
      const fn = handlers[el.dataset.act];
      if (fn) {
        event.preventDefault();
        fn(el, event);
      }
    });
    root.addEventListener("input", (event) => {
      const el = event.target.closest?.("[data-input]");
      const fn = el && handlers[el.dataset.input];
      if (fn) fn(el, event);
    });
    root.addEventListener("change", (event) => {
      const el = event.target.closest?.("[data-change]");
      const fn = el && handlers[el.dataset.change];
      if (fn) fn(el, event);
    });
  }

  const root = () => global.document.querySelector("[data-page-root]");

  /**
   * Run `draw(user)` once the site knows who's here, and again when someone
   * signs in or out, or settings change. Errors show as a quiet notice.
   */
  function start(draw) {
    const run = async (user) => {
      try {
        await draw(user ?? null);
      } catch (error) {
        console.error(error);
        const el = root();
        if (el && !el.querySelector("[data-kit-error]")) {
          el.insertAdjacentHTML("afterbegin", `<p class="sp-notice" role="alert" data-kit-error>Something went wrong opening this page. Please reload and try again.</p>`);
        }
      }
    };
    const page = global.SaltPage;
    const ready = page?.ready ? page.ready() : Promise.resolve(null);
    // Draw straight away for a guest view, then again once sign-in is known.
    ready.then((user) => run(user));
    page?.onUserChange?.((user) => run(user));
    global.addEventListener?.("saltSettingsChanged", () => run(currentUser()));
  }
  const currentUser = () => (typeof global.getCurrentSaltUser === "function" ? global.getCurrentSaltUser() : null);

  // ------------------------------------------------------------------ data

  async function entries(collection) {
    if (!global.SaltCraft) return [];
    try {
      return await global.SaltCraft.list(collection);
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async function add(collection, data) {
    return global.SaltCraft.add(collection, data);
  }
  async function update(collection, id, data) {
    return global.SaltCraft.update(collection, id, data);
  }
  async function remove(collection, id) {
    return global.SaltCraft.remove(collection, id);
  }
  async function settings() {
    try {
      return (await global.SaltSettings?.get()) || {};
    } catch {
      return {};
    }
  }
  const confirm = (message) => (typeof global.confirm === "function" ? global.confirm(message) : true);
  const go = (url) => {
    global.location.href = url;
  };

  // ------------------------------------------------------------------ files

  /** Hand the person a file to save (an .ics of reminders, say). Nothing is uploaded. */
  function downloadFile(name, text, type = "text/calendar;charset=utf-8") {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = global.document.createElement("a");
    a.href = url;
    a.download = name;
    global.document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // ------------------------------------------------------------------ guided working

  /** The screens of a guided working: what it's for, each step, and the close. Pure. */
  function draftScreens(draft) {
    const screens = [];
    const prep = [draft.intention, ...(String(draft.preparation || "").split(/\n\n+/))].filter((t) => String(t || "").trim());
    screens.push({ kind: "begin", title: draft.title || "Your working", paragraphs: prep });
    (draft.steps || []).forEach((step, i) => {
      const minutes = Number(step.minutes) || 0;
      screens.push({
        kind: "step",
        number: i + 1,
        title: step.title || `Step ${i + 1}`,
        paragraphs: [step.instructions].filter(Boolean),
        spoken: step.spoken_text || "",
        seconds: minutes > 0 ? Math.round(minutes * 60) : 0
      });
    });
    screens.push({ kind: "close", title: "Closing", paragraphs: [draft.closing || "When you’re ready, close as feels right."].filter(Boolean) });
    return screens;
  }

  /**
   * Open a guided working (the app's TemplateDraft) in a dialog: what it's
   * for and what to gather, then each step with its words and timer. Nothing
   * is saved; it's the website's take on Begin as a ritual.
   */
  function runDraft(draft, { onFinish } = {}) {
    const doc = global.document;
    const screens = draftScreens(draft);
    const steps = screens.filter((s) => s.kind === "step").length;
    const dialog = doc.createElement("dialog");
    dialog.className = "pr-run";
    dialog.setAttribute("aria-labelledby", "pr-run-title");
    doc.body.append(dialog);
    let at = 0;
    let left = 0;
    let timer = null;
    const opener = doc.activeElement;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const clock = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;
    const draw = () => {
      const s = screens[at];
      const progress = s.kind === "step" ? `Step ${s.number} of ${steps}` : s.kind === "begin" ? "Before you begin" : "To close";
      dialog.innerHTML = `<div class="pr-run__inner"><p class="pr-run__progress">${esc(progress)}</p><h2 id="pr-run-title" tabindex="-1">${esc(s.title)}</h2>${s.paragraphs
        .map((t) => `<p>${esc(t)}</p>`)
        .join("")}${s.spoken ? `<p class="pr-run__spoken"><span class="pr-visually-hidden">Say: </span><em>${esc(s.spoken)}</em></p>` : ""}${
        s.seconds
          ? `<div class="sp-actions" style="align-items:center"><span class="pr-run__timer" role="timer" aria-live="off" data-run-clock>${clock(left)}</span><button type="button" class="button button--small" data-run="timer">${
              timer ? "Pause" : left < s.seconds ? "Carry on" : "Start the timer"
            }</button></div><p class="pr-visually-hidden" aria-live="polite" data-run-done></p>`
          : ""
      }<div class="sp-actions">${at > 0 ? `<button type="button" class="button button--ghost" data-run="back">Back</button>` : ""}${
        at < screens.length - 1
          ? `<button type="button" class="button button--primary" data-run="next">${at === 0 ? "Begin" : "Next"}</button>`
          : `<button type="button" class="button button--primary" data-run="finish">Finish</button>`
      }<button type="button" class="button button--ghost" data-run="close">${at === screens.length - 1 ? "Close" : "Stop here"}</button></div></div>`;
      dialog.querySelector("#pr-run-title").focus();
    };
    const goTo = (i) => {
      stop();
      at = Math.max(0, Math.min(screens.length - 1, i));
      left = screens[at].seconds || 0;
      draw();
    };
    const close = () => {
      stop();
      dialog.close();
      dialog.remove();
      opener?.focus?.();
    };
    dialog.addEventListener("click", (event) => {
      const which = event.target.closest?.("[data-run]")?.dataset.run;
      if (!which) return;
      if (which === "next") goTo(at + 1);
      if (which === "back") goTo(at - 1);
      if (which === "close") close();
      if (which === "finish") {
        close();
        onFinish?.();
      }
      if (which === "timer") {
        if (timer) {
          stop();
        } else {
          if (left <= 0) left = screens[at].seconds;
          timer = setInterval(() => {
            left -= 1;
            const el = dialog.querySelector("[data-run-clock]");
            if (el) el.textContent = clock(Math.max(0, left));
            if (left <= 0) {
              stop();
              const done = dialog.querySelector("[data-run-done]");
              if (done) done.textContent = "Time’s up.";
              const btn = dialog.querySelector('[data-run="timer"]');
              if (btn) btn.textContent = "Start again";
            }
          }, 1000);
        }
        const btn = dialog.querySelector('[data-run="timer"]');
        if (btn) btn.textContent = timer ? "Pause" : "Carry on";
      }
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    goTo(0);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    return dialog;
  }

  /**
   * Begin a guided working in the altar's Ritual Companion, as the app's
   * startRitual does: hand it the draft (rituals/js/rituals-logic.js
   * beginHandoff, stored in sessionStorage) and go there, where the session
   * is saved. Pages without the Rituals logic fall back to runDraft.
   */
  function beginRitual(draft) {
    const L = global.RitualsLogic;
    if (!L?.beginHandoff) return runDraft(draft);
    try {
      global.sessionStorage.setItem(L.KEYS?.begin || "saltRitualBegin", JSON.stringify(L.beginHandoff({ kind: "draft", draft })));
    } catch {
      return runDraft(draft);
    }
    global.location.href = L.BEGIN_URL || "/altar/?ritual=1&beginRitual=1";
    return null;
  }

  return {
    beginRitual,
    esc,
    plural,
    cap,
    join,
    href,
    PLACE_KEY,
    readPlace,
    savePlace,
    clearPlace,
    validPlace,
    placeForm,
    placeHandlers,
    dateKey,
    fromKey,
    fullDate,
    dayMonth,
    recentDays,
    back,
    head,
    section,
    card,
    p,
    muted,
    caption,
    notice,
    empty,
    big,
    bullets,
    row,
    list,
    chip,
    chips,
    field,
    button,
    textButton,
    actions,
    toggle,
    details,
    savedLine,
    dayPicker,
    typedDay,
    landCard,
    support,
    render,
    delegate,
    root,
    start,
    currentUser,
    entries,
    add,
    update,
    remove,
    settings,
    confirm,
    go,
    downloadFile,
    draftScreens,
    runDraft
  };
});
