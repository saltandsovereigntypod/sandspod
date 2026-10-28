/*
 * Small pure helpers shared by the Today pages (/today/, /today/sky/,
 * /today/calendar/, /today/holy/): the saved place, links from the app's
 * routes to the website's pages, the sky card's lines and the moon disc.
 * Everything that is the app's own logic comes from js/core/today.js; this
 * file only holds what the app keeps in its screens. Tested in
 * tests/today.test.js.
 */
(function (global) {
  "use strict";

  // ── Where you are ──────────────────────────────────────────────────────
  // The same key and shape the app keeps (lib/location.ts), only ever in this
  // browser, rounded to about a kilometre and never sent anywhere.
  const PLACE_KEY = "sky.place";
  const round = (n) => Math.round(n * 100) / 100;

  function validPlace(latitude, longitude) {
    return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  }

  function readPlace(storage) {
    try {
      const saved = JSON.parse(storage.getItem(PLACE_KEY) || "null");
      if (saved && validPlace(Number(saved.latitude), Number(saved.longitude))) {
        const place = { latitude: Number(saved.latitude), longitude: Number(saved.longitude), source: saved.source === "device" ? "device" : "manual" };
        if (typeof saved.label === "string" && saved.label) place.label = saved.label;
        return place;
      }
    } catch {
      /* nothing saved, or storage blocked */
    }
    return null;
  }

  function savePlace(storage, latitude, longitude, source) {
    if (!validPlace(latitude, longitude)) return null;
    const place = { latitude: round(latitude), longitude: round(longitude), source: source === "device" ? "device" : "manual" };
    try {
      storage.setItem(PLACE_KEY, JSON.stringify(place));
    } catch {
      /* storage blocked: the place still works on this page */
    }
    return place;
  }

  function clearPlace(storage) {
    try {
      storage.removeItem(PLACE_KEY);
    } catch {
      /* nothing to clear */
    }
  }

  /**
   * Asks this browser for its location once, only when the person asks
   * ("Use my location"). Resolves 'ok', 'denied' or 'unavailable'.
   */
  function askBrowserLocation(storage, geolocation) {
    return new Promise((resolve) => {
      if (!geolocation || typeof geolocation.getCurrentPosition !== "function") return resolve({ result: "unavailable" });
      geolocation.getCurrentPosition(
        (position) => {
          const place = savePlace(storage, position.coords.latitude, position.coords.longitude, "device");
          resolve(place ? { result: "ok", place } : { result: "unavailable" });
        },
        (error) => resolve({ result: error && error.code === 1 ? "denied" : "unavailable" }),
        { enableHighAccuracy: false, maximumAge: 6 * 3600000, timeout: 20000 }
      );
    });
  }

  /** "52.5" or "-13,4" typed by hand, as a number (the app accepts a comma too). */
  const parseCoordinate = (text) => (String(text ?? "").trim() === "" ? NaN : Number(String(text).trim().replace(",", ".")));

  // ── Links ──────────────────────────────────────────────────────────────
  /** A Living Library entry's public page on the website. */
  function libraryHref(entry) {
    if (!entry) return null;
    if (entry.traditionalRef) return `/library/entry/?entity=${encodeURIComponent(entry.traditionalRef)}`;
    return null;
  }

  /** "traditional:deity:hekate" (an app library id) as the Grimoire's "traditional/deity/hekate". */
  function libraryIdToRef(id) {
    const [layer, type, key] = String(id || "").split(":");
    if (layer !== "traditional" || !type || !key) return null;
    return `traditional/${type}/${key.split(".")[0]}`;
  }

  const DETAIL_ROUTES = {
    "/rituals/premade/": "id",
    "/rituals/plan/": "id",
    "/rituals/journal/": "id"
  };

  /**
   * The website's page for one of the app's routes. The site mirrors the app's
   * routes as folders and puts ids in the query string ("/rituals/premade/?id=x").
   * Library entries open on the public Library page.
   */
  function siteHref(appHref) {
    let path = typeof appHref === "string" ? appHref : appHref?.pathname || "/";
    const params = typeof appHref === "string" ? {} : { ...(appHref?.params || {}) };
    // Route params written into the path: /rituals/premade/[id] with params.
    path = path.replace(/\[(\w+)\]/g, (_, name) => {
      const value = params[name];
      delete params[name];
      return value == null ? "" : String(value);
    });

    const library = path.match(/^\/(?:today|rituals|grimoire|more)\/library\/([^/?#]+)/);
    if (library) {
      const id = decodeURIComponent(library[1]);
      const ref = libraryIdToRef(id);
      // A candle style ("traditional:candle:styles.tea_light") shares its parent's reference, so it goes by its id.
      return ref ? `/library/entry/?entity=${encodeURIComponent(id.split(":")[2].includes(".") ? id : ref)}` : "/library/";
    }
    // Pages the website keeps somewhere else (as help/web-notes.js maps them).
    // Divination and the sigil maker, open to every practice (as help/web-notes.js maps them).
    const divination = path.replace(/\/$/, "").match(/^\/rituals\/divination(?:\/([^/]+))?$/);
    if (divination) {
      const page = divination[1] ? decodeURIComponent(divination[1]) : "";
      if (page && !["draw", "edit", "spread"].includes(page)) params.id = page;
      path = page ? `/divination/${["draw", "edit", "spread"].includes(page) ? page : "reading"}/` : "/divination/";
    } else if (path.replace(/\/$/, "") === "/rituals/sigil") path = "/sigil/";
    if (path === "/rituals/craft") return "/practice/";
    if (path.startsWith("/rituals/craft/")) return `/practice/${path.slice("/rituals/craft/".length).replace(/\/$/, "")}/`;
    if (path === "/today/reminders" || path === "/rituals/reminders" || path === "/more/reminders") return "/reminders/";
    // A settings page opened inside a tab (the app's <tab>/settings/<page>) is the same page as under More.
    const tabSettings = path.match(/^\/(?:today|altar|grimoire|rituals|coven)\/settings\/([^/]+)\/?$/);
    if (tabSettings) path = `/more/settings/${tabSettings[1]}`;
    if (path.replace(/\/$/, "") === "/more/settings/notifications") return "/reminders/";
    if (path.replace(/\/$/, "") === "/more/settings/location") return "/today/sky/";
    if (path.replace(/\/$/, "") === "/more/settings/today") return "/?sanctuary=settings&settings=today";
    if (path.replace(/\/$/, "") === "/more/settings/practice") return "/practice/#choose";
    if (path.replace(/\/$/, "") === "/more/settings/calendar") return "/today/calendar/";
    if (path.startsWith("/more/settings") && path.replace(/\/$/, "") !== "/more/settings/deities") return "/?sanctuary=settings";
    if (path === "/today/journal" || path.startsWith("/today/journal/")) path = path.replace("/today/journal", "/rituals/journal");
    if (path.startsWith("/today/holy/")) {
      const ref = path.slice("/today/holy/".length);
      return ref ? `/today/holy/?ref=${encodeURIComponent(ref)}` : "/today/";
    }
    if (path.startsWith("/altar/")) {
      const altar = path.slice("/altar/".length);
      return altar === "tonight" ? "/altar/?tonight=1" : "/altar/";
    }

    for (const [base, key] of Object.entries(DETAIL_ROUTES)) {
      if (path.startsWith(base) && path.length > base.length) {
        const id = path.slice(base.length).replace(/\/$/, "");
        params[key] = decodeURIComponent(id);
        path = base;
        break;
      }
    }
    if (!path.endsWith("/")) path += "/";
    const query = Object.entries(params)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
    return query ? `${path}?${query}` : path;
  }

  /** A holy day or moon page; from Today, a holiday without a page opens the calendars instead (as the app does). */
  const holyHref = (ref, fromToday = false) => `/today/holy/?ref=${encodeURIComponent(ref)}${fromToday ? "&from=today" : ""}`;

  // ── The sky card ───────────────────────────────────────────────────────
  const PERSONAL = ["Mercury", "Venus", "Mars"];

  /** "today at 4:10 PM", "tomorrow at 9:02 AM", "Oct 18 at 1:00 AM". */
  function relativeTime(C, now, date) {
    const days = C.calendar.daysBetween(now, date);
    const day = days === 0 ? "today" : days === 1 ? "tomorrow" : C.calendar.shortDate(date);
    return `${day} at ${C.calendar.timeOfDay(date)}`;
  }

  /** What the sky is doing that matters today: void of course, personal retrogrades, the sun's season. */
  function daySkyLines(C, sky, now) {
    const cal = C.calendar;
    const lines = [];
    if (sky.vocNow) {
      lines.push(`Moon void of course until ${relativeTime(C, now, sky.voc.end)}: rest and finish things rather than begin.`);
    } else if (cal.daysBetween(now, sky.voc.start) === 0) {
      lines.push(`Moon void of course from ${cal.timeOfDay(sky.voc.start)} until ${relativeTime(C, now, sky.voc.end)}.`);
    }
    for (const r of sky.retrogrades.filter((x) => PERSONAL.includes(x.planet))) {
      const days = cal.daysBetween(now, r.date);
      lines.push(
        r.when === "now"
          ? `${r.planet} retrograde until ${cal.dateFrom(now, r.date)}.`
          : `${r.planet} turns retrograde ${days <= 1 ? relativeTime(C, now, r.date) : `in ${days} days (${cal.shortDate(r.date)})`}.`
      );
    }
    lines.push(`${sky.sunSign} season${sky.sunSignEnds ? ` until ${cal.dateFrom(now, sky.sunSignEnds)}` : ""}: ${sky.sunSeason}.`);
    return lines;
  }

  /** "Sunrise 7:41 AM · sunset 6:22 PM · moonrise …" for the places that have them. */
  function riseSetLine(C, here) {
    const t = C.calendar.timeOfDay;
    return [
      here.sun.rise && `Sunrise ${t(here.sun.rise)}`,
      here.sun.set && `sunset ${t(here.sun.set)}`,
      here.moon.rise && `moonrise ${t(here.moon.rise)}`,
      here.moon.set && `moonset ${t(here.moon.set)}`
    ]
      .filter(Boolean)
      .join(" · ");
  }

  // ── The moon disc (components/MoonDisc.tsx) ────────────────────────────
  /** The moon as seen from the north: waxing light grows from the right. */
  function moonDiscSvg(size, illumination, waxing, halo = true, label = "") {
    const c = size / 2;
    const r = halo ? size * 0.352 : size / 2;
    const top = c - r;
    const bottom = c + r;
    const rx = r * Math.abs(1 - 2 * illumination);
    const gibbous = illumination > 0.5;
    const outerSweep = waxing ? 1 : 0;
    const terminatorSweep = waxing === gibbous ? 1 : 0;
    const lit = `M ${c} ${top} A ${r} ${r} 0 0 ${outerSweep} ${c} ${bottom} A ${rx} ${r} 0 0 ${terminatorSweep} ${c} ${top} Z`;
    const a11y = label ? `role="img" aria-label="${String(label).replace(/"/g, "&quot;")}"` : 'aria-hidden="true"';
    return (
      `<svg class="td-moon-disc" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" ${a11y} focusable="false">` +
      (halo
        ? `<circle cx="${c}" cy="${c}" r="${size * 0.489}" fill="none" stroke="rgba(226,195,109,0.12)" stroke-width="1"/>` +
          `<circle cx="${c}" cy="${c}" r="${size * 0.42}" fill="none" stroke="rgba(226,195,109,0.22)" stroke-width="1"/>`
        : "") +
      `<circle cx="${c}" cy="${c}" r="${r - 0.5}" fill="#1c2e22" stroke="#6b675a" stroke-width="${halo ? 0 : 1}"/>` +
      (illumination > 0.005 ? `<path d="${lit}" fill="#f4ecd8"/>` : "") +
      "</svg>"
    );
  }

  const PHASE_DISC = {
    new: { illumination: 0, waxing: true },
    firstQuarter: { illumination: 0.5, waxing: true },
    full: { illumination: 1, waxing: true },
    lastQuarter: { illumination: 0.5, waxing: false }
  };

  const ICONS = {
    wheel:
      '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8" stroke-width="1.6"/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" stroke-width="1.2"/></svg>',
    samhain:
      '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"><path d="M12 3c-2 3-6 5-6 10a6 6 0 0 0 12 0c0-5-4-7-6-10z"/><path d="M9 14h.01M15 14h.01M10 17.5c1.2.7 2.8.7 4 0"/></svg>',
    chevron:
      '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>'
  };

  // ── Rituals kept in this browser (guests) ──────────────────────────────
  // The same keys the app and the website use for guests.
  const PLANS_KEY = "rituals.plans.v1";
  const DEVICE_KEY = "saltAndSovereigntyRitualLifecycle:guest";

  function readJson(storage, key, fallback) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  /** Plans kept in this browser. */
  function guestPlans(storage) {
    const plans = readJson(storage, PLANS_KEY, []);
    return Array.isArray(plans) ? plans.filter((p) => p && typeof p.id === "string") : [];
  }

  /** The ritual under way and the journal kept in this browser (js/ritual-lifecycle.js). */
  function guestRituals(storage) {
    const device = readJson(storage, DEVICE_KEY, {}) || {};
    const sessions = Array.isArray(device.sessions) ? device.sessions : [];
    const active = sessions.find((s) => s && s.id === device.activeSessionId && (s.status === "active" || s.status === "paused")) || null;
    return { active, journal: Array.isArray(device.journals) ? device.journals : [] };
  }

  // ── The other calendars' lines (components/CalendarLines.tsx) ──────────
  const CONFIDENCE_NOTE = {
    historical: "Kept historically and known from good sources.",
    reconstructed: "Rebuilt by scholars from partial evidence.",
    modern: "A modern creation."
  };
  const CONFIDENCE_LABEL = { historical: "Historical", reconstructed: "Reconstructed", modern: "Modern" };

  function confidenceChip(confidence, esc) {
    const label = CONFIDENCE_LABEL[confidence] || confidence;
    return `<span class="td-conf td-conf--${esc(confidence)}" title="${esc(CONFIDENCE_NOTE[confidence] || "")}">${esc(label)}<span class="sr-only">. ${esc(CONFIDENCE_NOTE[confidence] || "")}</span></span>`;
  }

  function lineDetails(line, esc) {
    return (
      `<p>${esc(line.long)}</p>` +
      line.marks.map((m) => `<p class="sp-caption"><span class="td-gold">${esc(m.name)}</span>${m.meaning ? ` · ${esc(m.meaning)}` : ""}</p>`).join("") +
      (line.date?.year?.label ? `<p class="sp-caption sp-muted">${esc(line.date.year.label)}</p>` : "") +
      `<div class="td-chip-row"><span class="sp-caption">${esc(line.name)}</span>${confidenceChip(line.confidence, esc)}</div>`
    );
  }

  /** The moon's date at the top, when it leads: tap for the full date and the day's marks. */
  function leadLineHtml(line, esc, id) {
    const marks = line.marks.length ? `<span class="sp-caption td-gold" data-collapsed-only>${esc(line.marks.map((m) => m.name).join(" · "))}</span>` : "";
    return (
      `<button type="button" class="td-plain td-lead" aria-expanded="false" aria-controls="${id}" data-td-toggle>` +
      `<span class="td-lead__text">${esc(line.short)}</span>${marks}<span class="sr-only">. ${esc(line.name)}. Shows the full date and the day’s marks.</span></button>` +
      `<div class="td-line-details" id="${id}" hidden>${lineDetails(line, esc)}</div>`
    );
  }

  /** One short line per calendar shown beside the date. */
  function lineListHtml(lines, esc, prefix) {
    if (!lines.length) return "";
    return (
      `<div class="td-lines">` +
      lines
        .map((line, i) => {
          const id = `${prefix}-${i}`;
          const mark = line.marks.length ? `<span class="td-gold" data-collapsed-only> · ${esc(line.marks[0].name)}</span>` : "";
          return (
            `<div><button type="button" class="td-plain td-line sp-caption" aria-expanded="false" aria-controls="${id}" data-td-toggle>` +
            `<span class="sr-only">${esc(line.name)}: </span><span style="color:var(--cream)">${esc(line.short)}</span>${mark}<span class="td-line__chev" aria-hidden="true" data-chev>  ▸</span></button>` +
            `<div class="td-line-details" id="${id}" hidden>${lineDetails(line, esc)}</div></div>`
          );
        })
        .join("") +
      `</div>`
    );
  }

  /** Open and close the calendar lines (and anything else marked data-td-toggle). */
  function bindToggles(root) {
    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-td-toggle]");
      if (!button || !root.contains(button)) return;
      const target = root.ownerDocument.getElementById(button.getAttribute("aria-controls"));
      if (!target) return;
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      target.hidden = !open;
      button.querySelectorAll("[data-collapsed-only]").forEach((el) => (el.hidden = open));
      const chev = button.querySelector("[data-chev]");
      if (chev) chev.textContent = open ? "  ▾" : "  ▸";
    });
  }

  /** Whether any moon phase reminder is on (the website's /reminders/ page keeps them under this key). */
  function moonRemindersOn(storage) {
    const saved = readJson(storage, "reminders.settings.v1", null);
    const phases = saved && typeof saved === "object" ? saved.phases || {} : {};
    return ["new", "firstQuarter", "full", "lastQuarter"].some((p) => phases[p] === true);
  }

  /** The morning dream reminder (the app's Grimoire → Dreams; /reminders/ here), as this browser keeps it. */
  function dreamReminderOn(storage) {
    const saved = readJson(storage, "reminders.settings.v1", null);
    return Boolean(saved && typeof saved === "object" && saved.dreamMorning === true);
  }

  const api = {
    dreamReminderOn,
    PLACE_KEY,
    moonRemindersOn,
    CONFIDENCE_LABEL,
    CONFIDENCE_NOTE,
    confidenceChip,
    leadLineHtml,
    lineListHtml,
    bindToggles,
    PLANS_KEY,
    DEVICE_KEY,
    validPlace,
    readPlace,
    savePlace,
    clearPlace,
    askBrowserLocation,
    parseCoordinate,
    libraryHref,
    libraryIdToRef,
    siteHref,
    holyHref,
    relativeTime,
    daySkyLines,
    riseSetLine,
    moonDiscSvg,
    PHASE_DISC,
    ICONS,
    guestPlans,
    guestRituals
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else global.SaltToday = api;
})(typeof window !== "undefined" ? window : globalThis);
