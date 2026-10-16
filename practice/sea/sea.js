/*
 * Sea: the practice page, Tides, choosing a tide station, and Shore finds,
 * as the app has them (app/src/app/(tabs)/rituals/craft/sea). Springs and
 * neaps come from the moon; high and low water from NOAA CO-OPS (free,
 * keyless, open to browsers), for US coasts. The station list, the chosen
 * station, the units and the last predictions stay in this browser, as the
 * app keeps them on the phone. Shore finds live in craft_entries "sea.finds".
 */
(function () {
  const PB = window.PracticeB;
  const { h, links } = PB;
  const B = window.SaltCore && window.SaltCore["practice-b"];
  const HUB = { href: "/practice/sea/", label: "Sea" };
  const TIDES_URL = "/practice/sea/tides/";
  const STATION_URL = "/practice/sea/station/";
  const FINDS_URL = "/practice/sea/finds/";
  const findUrl = (id) => `/practice/sea/finds/edit/${id ? `?id=${encodeURIComponent(id)}` : ""}`;
  const PHASE_WORDS = { new: "new moon", full: "full moon", firstQuarter: "first quarter", lastQuarter: "last quarter" };

  // ── NOAA, kept in this browser (the app's noaa.ts) ────────────────────────
  const STATIONS_KEY = "salt.sea.noaaStations.v1";
  const CHOSEN_KEY = "salt.sea.station";
  const UNITS_KEY = "salt.sea.tideUnits";
  const TIDES_KEY = "salt.sea.tideCache.v1";
  const MONTH_MS = 30 * 86400000;
  const FRESH_MS = 6 * 3600000;

  class OfflineError extends Error {
    constructor() {
      super("Couldn’t reach NOAA. You may be offline.");
    }
  }

  async function getJson(url, timeoutMs = 20000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal, credentials: "omit", referrerPolicy: "no-referrer" });
      if (!res.ok) throw new Error(`NOAA answered ${res.status}.`);
      return await res.json();
    } catch (e) {
      if (e instanceof Error && /NOAA/.test(e.message)) throw e;
      throw new OfflineError();
    } finally {
      clearTimeout(timer);
    }
  }

  let stationsMemo = null;
  async function loadStations() {
    if (stationsMemo) return stationsMemo;
    const saved = PB.store.get(STATIONS_KEY);
    if (saved && Array.isArray(saved.stations) && Date.now() - saved.at < MONTH_MS) return (stationsMemo = saved.stations);
    try {
      const stations = B.tides.slimStations(await getJson(B.tides.NOAA_STATIONS, 45000));
      PB.store.set(STATIONS_KEY, { at: Date.now(), stations });
      return (stationsMemo = stations);
    } catch (e) {
      // An old list is better than none.
      if (saved && Array.isArray(saved.stations)) return (stationsMemo = saved.stations);
      throw e;
    }
  }

  const loadChosenStation = () => {
    const s = PB.store.get(CHOSEN_KEY);
    return s && typeof s.id === "string" ? s : null;
  };
  const saveChosenStation = (s) => (s ? PB.store.set(CHOSEN_KEY, s) : PB.store.remove(CHOSEN_KEY));
  const loadUnits = () => (PB.store.get(UNITS_KEY) === "metric" ? "metric" : "english");
  const saveUnits = (u) => PB.store.set(UNITS_KEY, u);

  async function loadTides(station, units, now = new Date(), force = false) {
    const T = B.tides;
    const today = T.dayKey(now);
    const cache = PB.store.get(TIDES_KEY, []) || [];
    const hit = Array.isArray(cache) ? cache.find((c) => c.station === station.id && c.units === units) : null;
    if (!force && hit && hit.day === today && Date.now() - hit.at < FRESH_MS) return { events: hit.events, fetchedAt: new Date(hit.at), offline: false };
    try {
      const events = T.parsePredictions(await getJson(T.predictionsUrl(station.id, units, now)));
      const entry = { station: station.id, units, day: today, at: Date.now(), events };
      PB.store.set(TIDES_KEY, [entry, ...(Array.isArray(cache) ? cache : []).filter((c) => !(c.station === station.id && c.units === units))].slice(0, 6));
      return { events, fetchedAt: new Date(entry.at), offline: false };
    } catch (e) {
      if (e instanceof OfflineError && hit) {
        const events = hit.events.filter((ev) => ev.day >= today);
        if (events.length) return { events, fetchedAt: new Date(hit.at), offline: true };
      }
      throw e;
    }
  }

  // ── The practice page ─────────────────────────────────────────────────────
  async function hub(root) {
    const T = B.tides;
    const about = B.premade.PRACTICES.find((p) => p.id === "sea")?.about;
    const { entries, problem } = await PB.listEntries(B.finds.FINDS);
    const now = new Date();
    const stage = T.rangeStage(now);
    const springs = T.nextRange(now, "spring");
    const neaps = T.nextRange(now, "neap");
    const words = T.RANGE_WORDS[stage.stage];
    const workings = B.premade.PREMADE.filter((p) => p.practices.includes("sea")).length;
    const routes = { Tides: TIDES_URL, "Shore finds": FINDS_URL };
    const detail = (title, fallback) => {
      if (title === "Shore finds" && entries.length) return `${entries.length} logged · latest ${B.finds.findTitle(entries[0].data).toLowerCase()}`;
      if (title === "Tides") return `${words.title} now · ${fallback}`;
      return fallback;
    };
    const { shortDate } = B.calendar;

    root.innerHTML = [
      h.head("My practice", "Sea", { href: links.hub, label: "My practice" }),
      about ? h.muted(about) : "",
      h.notice(problem),
      h.card(
        `${h.label("The sea this week")}${h.cardTitle(words.title)}${h.p(words.body)}${h.muted(
          `${stage.stage === "spring" ? "These springs" : "Next springs"} around ${shortDate(springs.peak)}${springs.perigean ? ", with the moon close: king tides" : ""}. ${
            stage.stage === "neap" ? "These neaps" : "Next neaps"
          } around ${shortDate(neaps.peak)}.`
        )}`,
        { gold: true }
      ),
      h.section("Tools", h.list(B.practices.CRAFT_TOOLS.sea.map((tool) => h.row({ href: routes[tool.title], title: tool.title, detail: detail(tool.title, tool.detail) })), "Sea tools")),
      h.list([
        h.row({
          href: links.premadeFor("sea"),
          title: "Premade sea workings",
          detail: workings ? `${workings} rituals and spells · filter by Sea` : "Rituals and spells for every practice"
        })
      ])
    ].join("");
  }

  // ── Tides ─────────────────────────────────────────────────────────────────
  function dayHeading(day, now) {
    const T = B.tides;
    const today = T.dayKey(now);
    const tomorrow = T.dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    if (day === today) return "Today";
    if (day === tomorrow) return "Tomorrow";
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
  }
  const height = (e, units) => `${e.height < 0 ? "−" : ""}${Math.abs(e.height).toFixed(1)} ${units === "metric" ? "m" : "ft"}`;
  const NOW_WORDS = { rising: "Rising", falling: "Falling", high: "High water", low: "Low water" };

  async function tidesPage(root) {
    const T = B.tides;
    const { shortDate } = B.calendar;
    const now = new Date();
    const stage = T.rangeStage(now);
    const ranges = T.upcomingRanges(now, 4);
    const words = T.RANGE_WORDS[stage.stage];
    const station = loadChosenStation();
    let units = loadUnits();
    let result = null;
    let problem = null;
    let loading = false;

    const top = [
      h.head("Sea", "Tides", HUB),
      h.muted("The moon sets the rhythm of every shore. Springs and neaps hold anywhere in the world; high and low water times come from NOAA for US coasts."),
      h.card(`${h.label("By the moon, everywhere")}${h.cardTitle(words.title)}${h.p(words.body)}${h.muted(`Since the ${PHASE_WORDS[stage.phase.phase]} on ${shortDate(stage.phase.date)}.`)}`, { gold: true }),
      h.section(
        "Springs and neaps ahead",
        h.card(
          `${ranges
            .map((r) => {
              const live = r.from <= now;
              return `<div class="pb-range"><h3>${r.range === "spring" ? "Springs" : "Neaps"}${live ? " · now" : ""}</h3>${h.p(
                `${r.range === "spring" ? "Biggest" : "Smallest"} around ${shortDate(r.peak)}, after the ${PHASE_WORDS[r.phase.phase]} on ${shortDate(r.phase.date)}.`
              )}${r.perigean ? h.notice("The moon is near its closest too: expect king tides, higher and lower than usual.") : ""}</div>`;
            })
            .join("")}${h.muted("Springs come a day or two after the new and full moon, neaps a day or two after the quarters. The exact day shifts a little from shore to shore.")}`
        )
      ),
      h.details(
        "Working with the tide",
        `${T.TIDE_TIMING.map((t) => `<div class="pb-range"><h3>${h.esc(t.title)}</h3>${h.p(t.body)}</div>`).join("")}${h.muted(
          "Pair the two rhythms: a rising spring tide for the strongest drawing-in, an ebbing spring for the deepest release, and the neaps for slow, steady work."
        )}`
      )
    ].join("");

    const safety = h.card(`${h.cardTitle("Safe at the water")}${h.bullets(T.SEA_SAFETY)}`);

    root.innerHTML = `${top}<section class="sp-section"><h2 class="sp-label">High and low water</h2><div class="pb-stack" data-part="water" aria-live="polite"></div></section>${safety}`;
    const water = root.querySelector('[data-part="water"]');

    const draw = () => {
      if (!station) {
        water.innerHTML = h.card(
          `${h.cardTitle("Choose a tide station")}${h.p(
            `Pick the NOAA station nearest your shore to see today’s and the next two days’ highs and lows.${PB.getPlace() ? "" : " Add your place and we’ll suggest the closest."}`
          )}${h.muted(
            "NOAA predictions cover US coasts and territories for now. Elsewhere, the moon guide above still applies: check your national tide service or harbour office for times."
          )}${h.actions([h.button("Choose a station", { href: STATION_URL })])}`
        );
        return;
      }
      const days = result ? T.eventsByDay(result.events).slice(0, 3) : [];
      const clockMatches = T.sameClock(station.tz, new Date().getTimezoneOffset());
      const tideNow = result && clockMatches ? T.tideNow(result.events, new Date()) : null;
      PB.paint(
        water,
        [
          h.list([h.row({ href: STATION_URL, title: T.stationLabel(station), detail: `NOAA station ${station.id} · change` })]),
          h.chips(
            [
              h.chip("Feet", { pressed: units === "english", attrs: { "data-action": "units", "data-units": "english", "data-focus": "units-english" } }),
              h.chip("Metres", { pressed: units === "metric", attrs: { "data-action": "units", "data-units": "metric", "data-focus": "units-metric" } })
            ],
            "Units"
          ),
          tideNow
            ? h.card(
                `${h.label("Now")}${h.cardTitle(NOW_WORDS[tideNow.state])}${h.p(
                  tideNow.state === "rising" || tideNow.state === "falling"
                    ? `${tideNow.next.kind === "high" ? "High" : "Low"} water at ${tideNow.next.clock}, in ${T.inWords(tideNow.minutes)}. ${tideNow.state === "rising" ? "A time to draw in." : "A time to let go."}`
                    : `The water is turning (${tideNow.next.clock}). A threshold hour.`
                )}`,
                { gold: true }
              )
            : "",
          loading && !result ? h.muted("Asking NOAA for the tides…") : "",
          h.notice(problem),
          result?.offline ? h.notice(`Offline: showing the copy saved ${shortDate(result.fetchedAt)}. Refresh to try again.`) : "",
          days
            .map((d) =>
              h.card(
                `${h.label(dayHeading(d.day, now))}${d.events
                  .map(
                    (e) =>
                      `<div class="pb-tide" role="group" aria-label="${h.esc(`${e.kind === "high" ? "High" : "Low"} water at ${e.clock}, ${height(e, units)}`)}"><span class="pb-tide__clock" aria-hidden="true">${h.esc(
                        e.clock
                      )}</span><span class="pb-tide__kind${e.kind === "high" ? " is-high" : ""}" aria-hidden="true">${e.kind === "high" ? "High" : "Low"}</span><span class="pb-tide__height" aria-hidden="true">${h.esc(
                        height(e, units)
                      )}</span></div>`
                  )
                  .join("")}`
              )
            )
            .join(""),
          result
            ? h.muted(
                `Times are local to the station${clockMatches ? "" : ", which keeps a different clock from your device"}. Heights are above mean lower low water, the usual chart zero; a minus tide uncovers more shore than usual. NOAA predictions don’t include wind or storm surge.`
              )
            : "",
          h.actions([h.button(loading ? "Refreshing…" : "Refresh the tides", { variant: "ghost", attrs: { "data-action": "refresh", "data-focus": "refresh", disabled: loading } })])
        ].join("")
      );
    };

    const fetchFor = async (force = false) => {
      if (!station) return draw();
      loading = true;
      problem = null;
      draw();
      try {
        result = await loadTides(station, units, new Date(), force);
      } catch (e) {
        result = null;
        problem =
          e instanceof OfflineError
            ? "Couldn’t reach NOAA, and there’s no saved copy for this station yet. The moon guide above still holds; try again when you’re online."
            : `NOAA couldn’t give predictions for this station${e instanceof Error && e.message ? `: ${e.message}` : "."}`;
      } finally {
        loading = false;
      }
      draw();
    };

    PB.bind(root, {
      click: {
        units: (el) => {
          const u = el.getAttribute("data-units");
          if (u === units) return;
          units = u;
          saveUnits(u);
          fetchFor();
        },
        refresh: () => fetchFor(true)
      }
    });
    fetchFor();
  }

  // ── Tide station ──────────────────────────────────────────────────────────
  const kmWords = (km) => (km < 1 ? "under 1 km away" : `${Math.round(km)} km away`);

  async function stationPage(root) {
    const T = B.tides;
    let stations = null;
    let problem = null;
    let query = "";
    let chosen = loadChosenStation();
    let locateNote = null;
    let locating = false;

    root.innerHTML = [
      h.head("Tides", "Tide station", { href: TIDES_URL, label: "Tides" }),
      h.muted("NOAA predicts the tides at about 3,500 places on US coasts, islands and territories. Choose the one nearest the shore you work at."),
      '<div class="pb-stack" data-part="body"></div>',
      `<section class="sp-section" data-part="search" hidden><h2 class="sp-label">Search by name</h2>${h.field({
        id: "station-find",
        label: "Station, bay or town",
        placeholder: "Monterey, The Battery, Bar Harbor…",
        type: "search",
        attrs: { "data-input": "find", autocomplete: "off" }
      })}<div data-part="results" aria-live="polite"></div></section>`,
      '<div data-part="foot"></div>'
    ].join("");
    const part = (name) => root.querySelector(`[data-part="${name}"]`);

    const pick = (s) => {
      const { id, name, state, lat, lng, tz } = stations.find((x) => x.id === s) || {};
      if (!id) return;
      saveChosenStation({ id, name, state, lat, lng, tz });
      window.location.href = TIDES_URL;
    };

    const drawResults = () => {
      if (!stations || !query.trim()) return PB.paint(part("results"), "");
      const results = T.searchStations(stations, query);
      PB.paint(
        part("results"),
        results.length
          ? h.list(results.map((s) => `<button type="button" class="sp-row" data-action="pick" data-id="${h.esc(s.id)}"><span class="sp-row__text"><span class="sp-row__title">${h.esc(T.stationLabel(s))}</span><span class="sp-row__detail">${h.esc(`Station ${s.id}${chosen?.id === s.id ? " · chosen" : ""}`)}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></button>`), "Stations found")
          : h.muted("No NOAA station by that name. Try a nearby town or bay.")
      );
    };

    const draw = () => {
      const place = PB.getPlace();
      const out = [chosen ? h.muted(`Now using ${T.stationLabel(chosen)}.`) : ""];
      if (!stations && !problem) out.push(h.muted("Fetching NOAA’s station list…"));
      if (problem) out.push(h.card(`${h.notice(problem)}${h.actions([h.button("Try again", { variant: "ghost", attrs: { "data-action": "retry" } })])}`));
      if (stations) {
        if (place) {
          const nearest = T.nearestStations(stations, place.latitude, place.longitude, 6);
          const farAway = nearest.length > 0 && nearest[0].km > T.NEAR_ENOUGH_KM;
          out.push(
            h.section(
              "Nearest to you",
              `${
                farAway
                  ? h.notice(
                      `The closest NOAA station is ${Math.round(nearest[0].km)} km away, so its times won’t match your shore. Predictions are US-only for now; the springs and neaps on the Tides page still hold wherever you are, and your national tide service or harbour office will have local times.`
                    )
                  : ""
              }${h.list(
                nearest.map(
                  (s) =>
                    `<button type="button" class="sp-row" data-action="pick" data-id="${h.esc(s.id)}"><span class="sp-row__text"><span class="sp-row__title">${h.esc(T.stationLabel(s))}</span><span class="sp-row__detail">${h.esc(
                      `${kmWords(s.km)}${chosen?.id === s.id ? " · chosen" : ""}`
                    )}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></button>`
                ),
                "Nearest stations"
              )}`
            )
          );
        } else {
          out.push(
            h.card(
              `${h.p("Share your location to see the stations nearest you. It stays in this browser, rounded to about a kilometre.")}${h.actions([
                h.button(locating ? "Finding you…" : "Use my location", { attrs: { "data-action": "locate", disabled: locating } })
              ])}${h.notice(locateNote)}`
            )
          );
        }
      }
      PB.paint(part("body"), out.join(""));
      part("search").hidden = !stations;
      part("foot").innerHTML = chosen && stations ? h.actions([h.button("Stop using a station", { variant: "text", attrs: { "data-action": "stop" } })]) : "";
      drawResults();
    };

    const fetchList = () =>
      loadStations().then(
        (list) => {
          stations = list;
          problem = null;
          draw();
        },
        (e) => {
          problem =
            e instanceof OfflineError
              ? "Couldn’t reach NOAA for the station list. Check your connection and try again; once it’s fetched it stays in this browser."
              : "NOAA’s station list didn’t come back as expected. Try again in a little while.";
          draw();
        }
      );

    PB.bind(root, {
      input: {
        find: (el) => {
          query = el.value;
          drawResults();
        }
      },
      click: {
        pick: (el) => pick(el.getAttribute("data-id")),
        retry: () => {
          problem = null;
          draw();
          fetchList();
        },
        locate: async () => {
          locating = true;
          locateNote = null;
          draw();
          const r = await PB.askLocation();
          locating = false;
          if (r === "denied") locateNote = "Location wasn’t allowed. You can search by name instead.";
          if (r === "unavailable") locateNote = "Your browser’s location isn’t available here. Search by name instead.";
          draw();
        },
        stop: () => {
          saveChosenStation(null);
          chosen = null;
          draw();
        }
      }
    });
    draw();
    fetchList();
  }

  // ── Shore finds ───────────────────────────────────────────────────────────
  function findDetail(f) {
    const F = B.finds;
    const tide = [F.tideLabel(f.tide), f.range === "spring" ? "springs" : f.range === "neap" ? "neaps" : null].filter(Boolean).join(" ");
    return [F.kindLabel(f.kind), f.where.trim(), B.calendar.fullDate(f.date)?.replace(/, \d{4}$/, ""), tide && `${tide} tide`].filter(Boolean).join(" · ");
  }

  async function findsPage(root) {
    const F = B.finds;
    const { entries, problem } = await PB.listEntries(F.FINDS);
    let kind = null;
    let where = null;
    let query = "";
    const places = F.beaches(entries);
    const kindsUsed = F.FIND_KINDS.filter((k) => entries.some((e) => e.data.kind === k.id));

    const filtersHtml = () =>
      [
        kindsUsed.length > 1
          ? `${h.label("Kind")}${h.chips(
              [
                h.chip("All", { pressed: !kind, attrs: { "data-action": "kind", "data-kind": "", "data-focus": "kind-all" } }),
                ...kindsUsed.map((k) => h.chip(k.label, { pressed: kind === k.id, attrs: { "data-action": "kind", "data-kind": k.id, "data-focus": `kind-${k.id}` } }))
              ],
              "Kind"
            )}`
          : "",
        places.length > 1
          ? `${h.label("Shore")}${h.chips(
              [
                h.chip("Anywhere", { pressed: !where, attrs: { "data-action": "where", "data-where": "", "data-focus": "where-any" } }),
                ...places.slice(0, 12).map((p, i) => h.chip(p, { pressed: where === p, attrs: { "data-action": "where", "data-where": p, "data-focus": `where-${i}` } }))
              ],
              "Shore"
            )}`
          : ""
      ].join("");

    const listHtml = () => {
      const shown = F.byFound(F.filterFinds(entries, { kind, where, query }));
      const filtering = !!(kind || where || query.trim());
      if (!entries.length)
        return h.card(`${h.cardTitle("Nothing logged yet")}${h.p("Next time you walk the strandline, note what you bring home: the beach, the tide, and why it called to you.")}`);
      if (!shown.length) return h.muted("No finds match. Clear a filter to see more.");
      return h.section(
        filtering ? `${shown.length} of ${entries.length}` : `${entries.length} ${entries.length === 1 ? "find" : "finds"}`,
        h.list(shown.map((e) => h.row({ href: findUrl(e.id), title: F.findTitle(e.data), detail: findDetail(e.data) })), "Your finds")
      );
    };

    root.innerHTML = [
      h.head("Sea", "Shore finds", HUB),
      h.muted("Shells, sea glass, hagstones and driftwood: where the tide left them, and what you’ll ask of them."),
      h.actions([h.button("Log a find", { href: findUrl() })]),
      h.notice(problem),
      entries.length
        ? h.card(
            `${h.field({ id: "finds-find", label: "Search your finds", placeholder: "Cobalt, cowrie, protection…", type: "search", attrs: { "data-input": "find", autocomplete: "off" } })}<div class="pb-stack" data-part="filters">${filtersHtml()}</div>`
          )
        : "",
      `<div data-part="list" aria-live="polite">${listHtml()}</div>`,
      h.details(
        "Collecting kindly and legally",
        F.COLLECTING.map((c) => `<div class="pb-range"><h3>${h.esc(c.title)}</h3>${h.p(c.body)}</div>`).join("")
      ),
      h.details(
        "Sea glass by rarity",
        `${F.SEA_GLASS_RARITY.map((r) => `<div class="pb-range"><p class="sp-eyebrow">${h.esc(r.level)}</p>${h.p(r.colours)}${h.muted(r.note)}</div>`).join("")}${h.muted(
          "Rarity varies by shore: a beach below an old glassworks can be thick with colours that are rare elsewhere."
        )}`
      )
    ].join("");

    const redraw = () => {
      PB.paint(root.querySelector('[data-part="filters"]'), filtersHtml());
      PB.paint(root.querySelector('[data-part="list"]'), listHtml());
    };
    PB.bind(root, {
      input: {
        find: (el) => {
          query = el.value;
          PB.paint(root.querySelector('[data-part="list"]'), listHtml());
        }
      },
      click: {
        kind: (el) => {
          const k = el.getAttribute("data-kind") || null;
          kind = k && kind !== k ? k : null;
          redraw();
        },
        where: (el) => {
          const w = el.getAttribute("data-where") || null;
          where = w && where !== w ? w : null;
          redraw();
        }
      }
    });
  }

  const RANGES = [
    { id: "spring", label: "Spring tide" },
    { id: "neap", label: "Neap tide" }
  ];

  async function findEdit(root) {
    const F = B.finds;
    const { fullDate } = B.calendar;
    const id = PB.query("id");
    const { entries, problem: loadProblem } = await PB.listEntries(F.FINDS);
    const existing = id ? entries.find((e) => e.id === id) ?? null : null;
    if (id && !existing) {
      root.innerHTML = [h.head("Shore finds", "Not found", { href: FINDS_URL, label: "Shore finds" }), h.notice(loadProblem), h.p("This find may have been removed on another device.")].join("");
      return;
    }
    const today = new Date();
    const find = existing ? { ...F.blankFind(today), ...existing.data } : F.blankFind(today);
    const places = F.beaches(entries);
    const recentDays = Array.from({ length: 5 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - i));

    const kindHtml = () =>
      `${h.chips(F.FIND_KINDS.map((k) => h.chip(k.label, { pressed: find.kind === k.id, attrs: { "data-action": "kind", "data-kind": k.id, "data-focus": `kind-${k.id}` } })), "What it is")}${h.muted(F.FIND_USES[find.kind])}`;
    const colourHtml = () => {
      const hints = F.COLOUR_HINTS[find.kind] ?? [];
      return hints.length ? h.chips(hints.map((c) => h.chip(c, { pressed: find.colour === c, attrs: { "data-action": "colour", "data-colour": c, "data-focus": `colour-${c}` } })), "Colours") : "";
    };
    const whereHtml = () =>
      places.length ? h.chips(places.slice(0, 8).map((p, i) => h.chip(p, { pressed: find.where === p, attrs: { "data-action": "where", "data-where": p, "data-focus": `where-${i}` } })), "Your shores") : "";
    const dayHtml = () =>
      h.chips(
        recentDays.map((d, i) => {
          const key = F.isoDay(d);
          return h.chip(i === 0 ? "Today" : i === 1 ? "Yesterday" : fullDate(d)?.replace(/, \d{4}$/, "") ?? key, { pressed: find.date === key, attrs: { "data-action": "day", "data-day": key, "data-focus": `day-${i}` } });
        }),
        "Day found"
      );
    const tideHtml = () => {
      const suggested = F.suggestRange(find.date);
      return `${h.chips(F.TIDE_STATES.map((t) => h.chip(t.label, { pressed: find.tide === t.id, attrs: { "data-action": "tide", "data-tide": t.id, "data-focus": `tide-${t.id}` } })), "The tide")}${h.chips(
        RANGES.map((r) =>
          h.chip(r.label, {
            pressed: find.range === r.id,
            a11y: suggested === r.id ? `${r.label}, suggested from the moon on that day` : undefined,
            attrs: { "data-action": "range", "data-range": r.id, "data-focus": `range-${r.id}` }
          })
        ),
        "Springs or neaps"
      )}${h.muted(
        suggested
          ? `By the moon, ${fullDate(find.date) ?? "that day"} fell in the ${suggested === "spring" ? "springs" : "neaps"}.`
          : F.parseDay(find.date)
            ? "By the moon, that day fell between springs and neaps."
            : "Add the date and the moon will suggest springs or neaps."
      )}`;
    };

    root.innerHTML = [
      h.head("Shore finds", existing ? "Edit find" : "Log a find", { href: FINDS_URL, label: "Shore finds" }),
      h.notice(loadProblem),
      h.section(
        "What it is",
        `<div class="pb-stack" data-part="kind">${kindHtml()}</div>${h.field({ id: "find-name", label: "A name of its own (optional)", value: find.name ?? "", placeholder: "The little cowrie", attrs: { "data-input": "name" } })}${h.field({
          id: "find-colour",
          label: "Colour",
          value: find.colour,
          placeholder: "Its colour",
          attrs: { "data-input": "colour" }
        })}<div data-part="colours">${colourHtml()}</div>`
      ),
      h.section(
        "Where and when",
        `${h.field({ id: "find-where", label: "Beach or shore", value: find.where, placeholder: "Where the tide left it", attrs: { "data-input": "where" } })}<div data-part="where">${whereHtml()}</div><div data-part="day">${dayHtml()}</div>${h.field({
          id: "find-date",
          label: "Date found (year-month-day)",
          value: find.date,
          placeholder: "2026-10-16",
          attrs: { "data-input": "date", autocomplete: "off" }
        })}<p class="sp-eyebrow">The tide (optional)</p><div class="pb-stack" data-part="tide">${tideHtml()}</div>`
      ),
      h.section(
        "What it’s for",
        `${h.field({ id: "find-purpose", label: "What it’s for", value: find.purpose, placeholder: "Protection by the door, a gift for the sea altar…", attrs: { "data-input": "purpose" } })}${h.field({
          id: "find-notes",
          label: "Notes",
          value: find.notes,
          placeholder: "The weather, who you were with, how it felt in your hand",
          multiline: true,
          attrs: { "data-input": "notes" }
        })}`
      ),
      h.card(h.muted("Only take what’s no longer alive and what the beach allows. Leave occupied shells, and photograph anything you aren’t sure of.")),
      PB.signedIn() ? "" : h.muted("Saved in this browser. Sign in to keep your finds with your account."),
      '<div data-part="problem" aria-live="assertive"></div>',
      h.actions([
        h.button(existing ? "Save changes" : "Save find", { attrs: { "data-action": "save" } }),
        existing ? h.button("Remove this find", { variant: "text", attrs: { "data-action": "remove" } }) : ""
      ])
    ].join("");

    const part = (name) => root.querySelector(`[data-part="${name}"]`);
    const colourPlaceholder = () => (F.COLOUR_HINTS[find.kind] ?? []).slice(0, 3).join(", ") || "Its colour";
    root.querySelector("#find-colour").placeholder = colourPlaceholder();
    // Re-suggest springs or neaps when the day changes and the old value was the moon's suggestion.
    const setDate = (date) => {
      find.range = find.range === F.suggestRange(find.date) ? F.suggestRange(date) : find.range;
      find.date = date;
    };
    let saving = false;

    PB.bind(root, {
      input: {
        name: (el) => (find.name = el.value),
        colour: (el) => {
          find.colour = el.value;
          PB.paint(part("colours"), colourHtml());
        },
        where: (el) => {
          find.where = el.value;
          PB.paint(part("where"), whereHtml());
        },
        date: (el) => {
          setDate(el.value.trim());
          PB.paint(part("day"), dayHtml());
          PB.paint(part("tide"), tideHtml());
        },
        purpose: (el) => (find.purpose = el.value),
        notes: (el) => (find.notes = el.value)
      },
      click: {
        kind: (el) => {
          find.kind = el.getAttribute("data-kind");
          PB.paint(part("kind"), kindHtml());
          PB.paint(part("colours"), colourHtml());
          root.querySelector("#find-colour").placeholder = colourPlaceholder();
        },
        colour: (el) => {
          const c = el.getAttribute("data-colour");
          find.colour = find.colour === c ? "" : c;
          root.querySelector("#find-colour").value = find.colour;
          PB.paint(part("colours"), colourHtml());
        },
        where: (el) => {
          find.where = el.getAttribute("data-where");
          root.querySelector("#find-where").value = find.where;
          PB.paint(part("where"), whereHtml());
        },
        day: (el) => {
          setDate(el.getAttribute("data-day"));
          root.querySelector("#find-date").value = find.date;
          PB.paint(part("day"), dayHtml());
          PB.paint(part("tide"), tideHtml());
        },
        tide: (el) => {
          const t = el.getAttribute("data-tide");
          find.tide = find.tide === t ? null : t;
          PB.paint(part("tide"), tideHtml());
        },
        range: (el) => {
          const r = el.getAttribute("data-range");
          find.range = find.range === r ? null : r;
          PB.paint(part("tide"), tideHtml());
        },
        save: async (el) => {
          const say = (text) => (part("problem").innerHTML = h.notice(text));
          if (!F.parseDay(find.date)) return say("Write the date as year-month-day, like 2026-10-16.");
          if (saving) return;
          saving = true;
          el.disabled = true;
          say("");
          const name = (find.name || "").trim();
          const data = { ...find, colour: find.colour.trim(), where: find.where.trim(), purpose: find.purpose.trim(), notes: find.notes.trim() };
          if (name) data.name = name;
          else delete data.name;
          try {
            if (existing) await window.SaltCraft.update(F.FINDS, existing.id, data);
            else await window.SaltCraft.add(F.FINDS, data);
            window.location.href = FINDS_URL;
          } catch {
            say("Your find couldn’t be saved. It’s still here, so you can try again.");
          } finally {
            saving = false;
            el.disabled = false;
          }
        },
        remove: async () => {
          if (!existing) return;
          if (!PB.confirmAction("Remove this find?", "It will be taken out of your shore finds on every device.")) return;
          try {
            await window.SaltCraft.remove(F.FINDS, existing.id);
            window.location.href = FINDS_URL;
          } catch {
            part("problem").innerHTML = h.notice("That couldn’t be removed just now. Please try again.");
          }
        }
      }
    });
  }

  const VIEWS = { "sea-hub": hub, "sea-tides": tidesPage, "sea-station": stationPage, "sea-finds": findsPage, "sea-find-edit": findEdit };
  const view = document.querySelector("[data-page-root]")?.getAttribute("data-view");
  if (VIEWS[view]) PB.start((root) => VIEWS[view](root));
})();
