/*
 * Shared helpers for the practice hubs built from the app's second set of
 * craft tools: Cosmic & celestial, Crystal, Elemental, Sea, and Traditional &
 * folk (/practice/<id>/…). The logic itself is the app's, from
 * js/core/practice-b.js (window.SaltCore["practice-b"]); this file holds the
 * page plumbing: your place, small HTML builders, and starting a page once
 * sign-in is known.
 *
 * Your place (for planetary hours, weather, tides and the southern year) is
 * kept only in this browser, rounded to about a kilometre, as the app keeps it
 * on the phone. Location is only ever asked for when you press a button.
 */
(function (global) {
  const PLACE_KEY = "salt.sky.place";

  const store = {
    get(key, fallback = null) {
      try {
        const raw = global.localStorage?.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        global.localStorage?.setItem(key, JSON.stringify(value));
      } catch {
        /* storage full or blocked: this visit still works */
      }
    },
    remove(key) {
      try {
        global.localStorage?.removeItem(key);
      } catch {
        /* nothing saved */
      }
    }
  };

  // ── Your place ────────────────────────────────────────────────────────────

  const round = (n) => Math.round(n * 100) / 100;

  function validPlace(latitude, longitude) {
    return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  }

  /** "51,5" or " -0.13 " → a number; NaN for blanks. */
  function parseNumber(text) {
    const clean = String(text ?? "").trim().replace(",", ".").replace(/^−/, "-");
    return clean ? Number(clean) : NaN;
  }

  function getPlace() {
    const saved = store.get(PLACE_KEY);
    if (!saved || !validPlace(Number(saved.latitude), Number(saved.longitude))) return null;
    return { ...saved, latitude: Number(saved.latitude), longitude: Number(saved.longitude) };
  }

  function setPlace(next) {
    if (next) store.set(PLACE_KEY, next);
    else store.remove(PLACE_KEY);
    global.dispatchEvent?.(new CustomEvent("saltPlaceChanged", { detail: next }));
  }

  function setManualPlace(latitude, longitude, label) {
    if (!validPlace(latitude, longitude)) return false;
    setPlace({ latitude: round(latitude), longitude: round(longitude), source: "manual", ...(label ? { label } : {}) });
    return true;
  }

  const clearPlace = () => setPlace(null);

  /** Asks the browser for its location once. Only call it from a button press. */
  function askLocation() {
    const geo = global.navigator?.geolocation;
    if (!geo) return Promise.resolve("unavailable");
    return new Promise((resolve) => {
      geo.getCurrentPosition(
        (position) => {
          setPlace({ latitude: round(position.coords.latitude), longitude: round(position.coords.longitude), source: "device" });
          resolve("ok");
        },
        (error) => resolve(error && error.code === 1 ? "denied" : "unavailable"),
        { enableHighAccuracy: false, maximumAge: 6 * 3600000, timeout: 20000 }
      );
    });
  }

  const onPlaceChange = (fn) => global.addEventListener?.("saltPlaceChanged", () => fn(getPlace()));

  // ── HTML builders ─────────────────────────────────────────────────────────

  const esc = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const attr = (attrs = {}) =>
    Object.entries(attrs)
      .filter(([, v]) => v !== undefined && v !== null && v !== false)
      .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
      .join("");

  const h = {
    esc,
    attr,
    head(eyebrow, title, back) {
      return `${back ? `<a class="sp-back pr-back" href="${esc(back.href)}">← ${esc(back.label)}</a>` : ""}<div class="pr-head pb-title">${eyebrow ? `<p class="sp-eyebrow">${esc(eyebrow)}</p>` : ""}<h1>${esc(title)}</h1></div>`;
    },
    p(text, cls = "") {
      return text ? `<p${cls ? ` class="${cls}"` : ""}>${esc(text)}</p>` : "";
    },
    muted(text) {
      return h.p(text, "sp-muted");
    },
    caption(text) {
      return h.p(text, "sp-caption");
    },
    label(text) {
      return `<p class="sp-label">${esc(text)}</p>`;
    },
    cardTitle(text, cls = "") {
      return `<h2 class="pb-card-title${cls ? ` ${cls}` : ""}">${esc(text)}</h2>`;
    },
    card(inner, { gold = false, cls = "", tag = "section", attrs } = {}) {
      return `<${tag} class="sp-card${gold ? " sp-card--gold" : ""}${cls ? ` ${cls}` : ""}"${attr(attrs)}>${inner}</${tag}>`;
    },
    section(label, inner, cls = "") {
      return `<section class="sp-section${cls ? ` ${cls}` : ""}">${label ? `<h2 class="sp-label">${esc(label)}</h2>` : ""}${inner}</section>`;
    },
    notice(text, { live = false } = {}) {
      return text ? `<p class="sp-notice"${live ? ' role="status"' : ""}>${esc(text)}</p>` : "";
    },
    row({ href, title, detail, attrs }) {
      return `<a class="sp-row" href="${esc(href)}"${attr(attrs)}><span class="sp-row__text"><span class="sp-row__title">${esc(title)}</span>${detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""}</span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;
    },
    list(rows, label) {
      return rows.length ? `<nav class="sp-list"${label ? ` aria-label="${esc(label)}"` : ""}>${rows.join("")}</nav>` : "";
    },
    /** A pressable chip: `pressed` true/false gives it aria-pressed. */
    chip(label, { pressed, attrs = {}, a11y } = {}) {
      return `<button type="button" class="sp-chip"${pressed === undefined ? "" : ` aria-pressed="${pressed ? "true" : "false"}"`}${a11y ? ` aria-label="${esc(a11y)}"` : ""}${attr(attrs)}>${esc(label)}</button>`;
    },
    /** A plain label that looks like a chip but does nothing. */
    tag(label) {
      return `<span class="pb-tag">${esc(label)}</span>`;
    },
    chips(items, label) {
      return items.length ? `<div class="sp-chips"${label ? ` role="group" aria-label="${esc(label)}"` : ""}>${items.join("")}</div>` : "";
    },
    tags(items, hidden = false) {
      return items.length ? `<div class="sp-chips"${hidden ? ' aria-hidden="true"' : ""}>${items.map((t) => h.tag(t)).join("")}</div>` : "";
    },
    details(title, inner, { open = false, cls = "" } = {}) {
      return `<details class="sp-details${cls ? ` ${cls}` : ""}"${open ? " open" : ""}><summary>${esc(title)}</summary><div class="pb-details-body">${inner}</div></details>`;
    },
    field({ id, label, value = "", placeholder = "", multiline = false, type = "text", attrs = {} }) {
      const common = `id="${esc(id)}" name="${esc(id)}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ""}${attr(attrs)}`;
      const input = multiline ? `<textarea ${common}>${esc(value)}</textarea>` : `<input type="${esc(type)}" ${common} value="${esc(value)}" />`;
      return `<div class="sp-field"><label for="${esc(id)}">${esc(label)}</label>${input}</div>`;
    },
    toggle({ id, label, detail, checked, attrs = {} }) {
      return `<label class="pb-toggle" for="${esc(id)}"><input type="checkbox" id="${esc(id)}"${checked ? " checked" : ""}${attr(attrs)} /><span><span class="pb-toggle__label">${esc(label)}</span>${detail ? `<span class="sp-caption">${esc(detail)}</span>` : ""}</span></label>`;
    },
    button(label, { variant = "primary", attrs = {}, href } = {}) {
      const cls = variant === "primary" ? "button button--primary" : variant === "text" ? "pb-text-button" : "button button--ghost";
      return href ? `<a class="${cls}" href="${esc(href)}"${attr(attrs)}>${esc(label)}</a>` : `<button type="button" class="${cls}"${attr(attrs)}>${esc(label)}</button>`;
    },
    actions(items) {
      return `<div class="sp-actions">${items.filter(Boolean).join("")}</div>`;
    },
    bullets(lines) {
      return `<ul class="pb-bullets">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
    }
  };

  // ── Where things live on the website ──────────────────────────────────────

  // The shared PracticeKit (practice/practice.js) knows the site's addresses;
  // these fall back to the same ones if it hasn't loaded.
  const kit = () => global.PracticeKit;
  const links = {
    hub: "/practice/",
    practice: (id) => `/practice/${id}/`,
    premade: (id) => kit()?.href?.premade?.(id) ?? `/rituals/premade/?id=${encodeURIComponent(id)}`,
    premadeFor: (practice) => kit()?.href?.premadeList?.(practice) ?? `/rituals/premade/?practice=${encodeURIComponent(practice)}`,
    /** A Living Library entry ("traditional:crystal:amethyst"), opened in the Grimoire. */
    library: (id) => kit()?.href?.library?.(id) ?? `/grimoire/?entity=${encodeURIComponent(String(id || "").replace(/:/g, "/"))}`,
    nativeLand: "https://native-land.ca"
  };

  /** "Whose land are you on?", the app's LandCard, from the shared kit. */
  const landCard = () => kit()?.landCard?.() ?? "";

  /** Begin a premade working as a guided ritual (the kit's dialog); false when it can't. */
  function beginPremade(premade) {
    const core = global.SaltCore && global.SaltCore["practice-b"];
    if (!premade || !core || typeof kit()?.runDraft !== "function") return false;
    kit().runDraft(core.premade.premadeDraft(premade));
    return true;
  }

  // ── Page plumbing ─────────────────────────────────────────────────────────

  const query = (name) => new URLSearchParams(global.location?.search || "").get(name);

  /** Replace a container's HTML, keeping keyboard focus on the same control. */
  function paint(el, html) {
    if (!el) return;
    const active = global.document.activeElement;
    const key = active && el.contains(active) ? active.getAttribute("data-focus") || (active.id ? `#${active.id}` : null) : null;
    const caret = active && typeof active.selectionStart === "number" ? [active.selectionStart, active.selectionEnd] : null;
    el.innerHTML = html;
    if (!key) return;
    const next = key.startsWith("#") ? el.querySelector(key) : el.querySelector(`[data-focus="${CSS.escape(key)}"]`);
    if (!next) return;
    next.focus({ preventScroll: true });
    if (caret && typeof next.setSelectionRange === "function") {
      try {
        next.setSelectionRange(caret[0], caret[1]);
      } catch {
        /* not a text field */
      }
    }
  }

  /**
   * Delegate events inside root: clicks on [data-action], typing in
   * [data-input] and changes on [data-change], each to handlers by name.
   * Calling it again (on a re-render) swaps the handlers; listeners are added once.
   */
  function bind(root, { click = {}, input = {}, change = {} } = {}) {
    root._pb = { click, input, change };
    if (root._pbBound) return;
    root._pbBound = true;
    const route = (kind, selector, prevent) => (event) => {
      const el = event.target.closest(selector);
      if (!el || !root.contains(el)) return;
      const name = el.getAttribute(selector.slice(1, -1));
      const fn = root._pb[kind][name];
      if (!fn) return;
      if (prevent) event.preventDefault();
      fn(el, event);
    };
    root.addEventListener("click", route("click", "[data-action]", true));
    root.addEventListener("input", route("input", "[data-input]", false));
    root.addEventListener("change", route("change", "[data-change]", false));
  }

  /** A collection's live entries, or [] with a problem when the account can't be reached. */
  async function listEntries(collection) {
    try {
      return { entries: await global.SaltCraft.list(collection), problem: null };
    } catch (error) {
      console.warn("[practice]", collection, error);
      return { entries: [], problem: "Couldn’t reach your account just now, so your saved entries aren’t showing. Check your connection and refresh." };
    }
  }

  /**
   * Run a page once sign-in is known, and again when someone signs in or out.
   * `render(root, user)` draws it; the bundle must have loaded.
   */
  function start(render) {
    const root = global.document.querySelector("[data-page-root]");
    if (!root) return;
    const core = global.SaltCore && global.SaltCore["practice-b"];
    if (!core) {
      root.innerHTML = `<p class="sp-notice">This page couldn’t load its tools. Check your connection and refresh.</p>`;
      return;
    }
    let token = 0;
    const run = async (user) => {
      const mine = ++token;
      try {
        await render(root, user ?? null, () => mine === token);
      } catch (error) {
        console.warn("[practice]", error);
        if (mine === token) root.insertAdjacentHTML("beforeend", h.notice("Something went wrong loading this page. Please refresh to try again."));
      }
    };
    const ready = global.SaltPage?.ready ? global.SaltPage.ready() : Promise.resolve(null);
    ready.then(run);
    global.SaltPage?.onUserChange?.((user) => run(user));
  }

  const signedIn = () => (typeof global.getCurrentSaltUser === "function" ? !!global.getCurrentSaltUser() : false);
  const confirmAction = (title, detail) => global.confirm(`${title}\n\n${detail}`);

  /** The place form shared by hours, weather, station and weather lore. */
  function placeForm(prefix, { intro, place, showClear = true } = {}) {
    return `${intro ? h.p(intro) : ""}
      ${h.actions([h.button("Use my location", { variant: "ghost", attrs: { "data-action": `${prefix}-locate` } })])}
      <div class="sp-grid-2">
        ${h.field({ id: `${prefix}-lat`, label: "Latitude", value: place ? String(place.latitude) : "", placeholder: "e.g. 51.51 (south is negative)", attrs: { inputmode: "decimal", autocomplete: "off" } })}
        ${h.field({ id: `${prefix}-lon`, label: "Longitude", value: place ? String(place.longitude) : "", placeholder: "e.g. -0.13 (west is negative)", attrs: { inputmode: "decimal", autocomplete: "off" } })}
      </div>
      ${h.actions([
        h.button("Save place", { variant: "ghost", attrs: { "data-action": `${prefix}-save` } }),
        showClear && place ? h.button("Forget my place", { variant: "text", attrs: { "data-action": `${prefix}-clear` } }) : ""
      ])}
      <div data-place-message="${prefix}" aria-live="polite"></div>`;
  }

  const LOCATE_WORDS = {
    denied: "Location wasn’t allowed. You can allow it in your browser’s site settings, or enter it below.",
    unavailable: "Your browser’s location isn’t available here. Enter it below instead."
  };

  /** Wire the place form's buttons. `after()` runs once the place has changed. */
  function placeHandlers(root, prefix, after) {
    const say = (text) => {
      const box = root.querySelector(`[data-place-message="${prefix}"]`);
      if (box) box.innerHTML = h.notice(text);
    };
    return {
      [`${prefix}-locate`]: async () => {
        say("Finding where you are…");
        const result = await askLocation();
        if (result === "ok") after();
        else say(LOCATE_WORDS[result]);
      },
      [`${prefix}-save`]: () => {
        const lat = parseNumber(root.querySelector(`#${prefix}-lat`)?.value);
        const lon = parseNumber(root.querySelector(`#${prefix}-lon`)?.value);
        if (setManualPlace(lat, lon)) after();
        else say("Enter a latitude from -90 to 90 and a longitude from -180 to 180 (south and west are negative).");
      },
      [`${prefix}-clear`]: () => {
        clearPlace();
        after();
      }
    };
  }

  /** "YYYY-MM-DD" today in local time. */
  const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const api = {
    PLACE_KEY,
    store,
    round,
    validPlace,
    parseNumber,
    getPlace,
    setManualPlace,
    clearPlace,
    askLocation,
    onPlaceChange,
    h,
    links,
    landCard,
    beginPremade,
    query,
    paint,
    bind,
    listEntries,
    start,
    signedIn,
    confirmAction,
    placeForm,
    placeHandlers,
    LOCATE_WORDS,
    todayKey
  };
  global.PracticeB = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
