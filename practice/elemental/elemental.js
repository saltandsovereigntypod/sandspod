/*
 * Elemental: the practice page, Elements in your work and Weather for
 * working, as the app has them (app/src/app/(tabs)/rituals/craft/elemental).
 * The forecast comes from Open-Meteo (free, no key, open to browsers); only
 * the place rounded to about a kilometre is sent, and the last good reply is
 * kept in this browser so it still shows offline.
 */
(function () {
  const PB = window.PracticeB;
  const { h, links } = PB;
  const B = window.SaltCore && window.SaltCore["practice-b"];
  const HUB = { href: "/practice/elemental/", label: "Elemental" };
  const WEATHER_KEY = "salt.craft.elemental.weather";
  const sunOrMoon = (planet) => planet === "Sun" || planet === "Moon";

  // ── The practice page ─────────────────────────────────────────────────────
  async function hub(root) {
    const about = B.premade.PRACTICES.find((p) => p.id === "elemental")?.about;
    const tools = B.practices.CRAFT_TOOLS.elemental;
    const today = B.balance.dayElement(new Date());
    const guide = B.balance.ELEMENT_GUIDES[today.element];
    const routes = ["/practice/elemental/balance/", "/practice/elemental/weather/"];
    root.innerHTML = [
      h.head("My practice", "Elemental", { href: links.hub, label: "My practice" }),
      about ? h.muted(about) : "",
      h.card(`${h.label(`Today · ${sunOrMoon(today.planet) ? `the ${today.planet}’s` : `${today.planet}’s`} day`)}${h.cardTitle(`A ${today.element.toLowerCase()} day`)}${h.muted(guide.qualities)}`, { gold: true }),
      h.section("Tools", h.list(tools.map((tool, i) => h.row({ href: routes[i], title: tool.title, detail: tool.detail })), "Elemental tools")),
      h.list([h.row({ href: links.premadeFor("elemental"), title: "Elemental workings", detail: "Premade rituals and spells; filter by Elemental" })])
    ].join("");
  }

  // ── Elements in your work ─────────────────────────────────────────────────

  const readJson = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  /** The altars, rituals and templates the app reads, from this browser (guests) or the account. */
  async function workSources() {
    const user = typeof window.getCurrentSaltUser === "function" ? window.getCurrentSaltUser() : null;
    if (!user || !window.db) {
      let journal = [];
      try {
        const device = JSON.parse(readJson("saltAndSovereigntyRitualLifecycle:guest") || "{}");
        journal = Array.isArray(device.journals) ? device.journals : [];
      } catch {
        journal = [];
      }
      return { altars: B.altarSnapshot.parseLocalAltars(readJson(B.altarSnapshot.LOCAL_ALTARS_KEY)), links: [], templates: [], journal };
    }
    // Row-level security limits each of these to the signed-in person's rows.
    const [altars, journal, ritualLinks, templates] = await Promise.all([
      window.db.from("saved_altars").select("id,name,altar_data,created_at,updated_at"),
      window.db.from("user_rituals").select("*"),
      window.db.from("ritual_links").select("*"),
      window.db.from("ritual_templates").select("id,metadata,status").neq("status", "archived")
    ]);
    const failed = [altars, journal, ritualLinks, templates].find((r) => r.error);
    if (failed) throw failed.error;
    return {
      altars: (altars.data || []).map(B.altarSnapshot.altarFromRow),
      journal: journal.data || [],
      links: ritualLinks.data || [],
      templates: templates.data || []
    };
  }

  function bar(element, count, share, max, names, low) {
    const pct = Math.round(share * 100);
    const width = max > 0 ? Math.max(share / max, count ? 0.04 : 0) : 0;
    const label = `${element}: ${count}, ${pct} percent.${names.length ? ` Mostly ${names.join(", ")}.` : ""}${low ? " The least used." : ""}`;
    return `<div class="pb-bar${low ? " is-low" : ""}" role="group" aria-label="${h.esc(label)}"><div class="pb-bar__head" aria-hidden="true"><span class="pb-bar__name">${h.esc(element)}</span><span class="sp-caption">${h.esc(
      `${count} · ${pct}%`
    )}</span></div><div class="pb-bar__track" aria-hidden="true"><div class="pb-bar__fill" style="width:${(width * 100).toFixed(1)}%"></div></div>${names.length ? `<p class="sp-caption" aria-hidden="true">${h.esc(names.join(", "))}</p>` : ""}</div>`;
  }

  async function balancePage(root) {
    const E = B.balance;
    let problem = null;
    let sources = { altars: [], links: [], templates: [], journal: [] };
    try {
      sources = await workSources();
    } catch (error) {
      console.warn("[practice]", error);
      problem = "Couldn’t reach your account just now, so your altars and rituals aren’t counted yet. Check your connection and refresh.";
    }
    const uses = E.gatherUses(sources);
    const balance = E.balanceOf(uses);
    const low = E.leastUsed(balance);
    const even = E.isBalanced(balance);
    const today = E.dayElement(new Date());
    const from = {
      altar: uses.filter((u) => u.source === "altar").length,
      ritual: uses.filter((u) => u.source === "ritual").length,
      template: uses.filter((u) => u.source === "template").length
    };

    const suggest = (element, why) => {
      const guide = E.ELEMENT_GUIDES[element];
      const premade = B.premade.premadeById(guide.premadeId);
      return h.card(
        [
          h.label(why),
          h.cardTitle(`Bring in ${element.toLowerCase()}`),
          h.p(guide.invite),
          h.muted(guide.small),
          `<div class="sp-chips" role="group" aria-label="In the Living Library">${guide.examples
            .map((ex) => `<a class="sp-chip" href="${h.esc(links.library(ex.id))}" aria-label="${h.esc(`${ex.name}: opens its Living Library page`)}">${h.esc(ex.name)}</a>`)
            .join("")}</div>`,
          premade
            ? h.actions([
                h.button(`Begin ${premade.title}`, { attrs: { "data-action": "begin", "data-id": premade.id } }),
                h.button("Read it first", { variant: "ghost", href: links.premade(premade.id) })
              ])
            : ""
        ].join(""),
        { gold: true }
      );
    };

    const head = h.head("Earth, air, fire and water", "Elements in your work", HUB);
    if (balance.total === 0) {
      root.innerHTML = [
        head,
        h.notice(problem),
        h.card(
          `${h.label("Nothing to read yet")}${h.p(
            "This reads the element of each herb, stone, candle colour and tool you place on your altars, and of the Living Library ingredients in your rituals and templates. Once there are a few, you’ll see which elements you lean on and which you leave out."
          )}${h.muted("Objects of your own, deities and plain vessels have no element in the Library, so they aren’t counted.")}`
        ),
        suggest(today.element, `Today’s element: ${sunOrMoon(today.planet) ? `the ${today.planet}` : today.planet} rules the day`)
      ].join("");
    } else {
      const max = Math.max(...E.ELEMENTS.map((x) => balance.share[x]));
      const fromLine =
        [from.altar ? `${from.altar} on your altars` : null, from.ritual ? `${from.ritual} in rituals you’ve done` : null, from.template ? `${from.template} in your templates` : null].filter(Boolean).join(", ") +
        (balance.spirit ? `. ${balance.spirit} more belong to spirit, the fifth, and sit outside the four.` : ".");
      root.innerHTML = [
        head,
        h.notice(problem),
        h.card(`${h.label("Your balance")}${E.ELEMENTS.map((e) => bar(e, balance.counts[e], balance.share[e], max, balance.top[e], !even && e === low)).join("")}${h.muted(fromLine)}`),
        even
          ? h.card(
              `${h.label("In balance")}${h.cardTitle("All four are with you")}${h.p("No element is far behind the others in your work. A rite that honours all four together keeps it so.")}${h.actions([
                h.button("Read the balancing rite", { variant: "ghost", href: links.premade(E.ALL_FOUR_PREMADE) })
              ])}`,
              { gold: true }
            )
          : low
            ? suggest(low, "The quietest element")
            : "",
        balance.total < 8 ? h.muted("This is drawn from only a few things so far; it grows truer the more you record.") : "",
        h.details(
          "How this is worked out",
          `${h.p(
            "Each object on your saved altars counts once, and so does each Living Library ingredient on your journal entries and active templates. Its element is the one the Living Library gives it."
          )}${h.muted("Lean is not wrong: many practitioners work mostly with one element on purpose. This is only a mirror, for when you want all four in your practice.")}`
        )
      ].join("");
    }

    PB.bind(root, {
      click: {
        begin: (el) => {
          const premade = B.premade.premadeById(el.getAttribute("data-id"));
          if (!PB.beginPremade(premade)) window.location.href = links.premade(premade.id);
        }
      }
    });
  }

  // ── Weather for working ───────────────────────────────────────────────────
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function dayName(key, todayKey) {
    const L = B.lifecycle;
    const date = L.dateFromKey(key);
    if (!date) return key;
    if (key === todayKey) return "Today";
    const tomorrow = L.dateFromKey(todayKey);
    if (tomorrow) {
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (L.localDateKey(tomorrow) === key) return "Tomorrow";
    }
    return WEEKDAYS[date.getDay()];
  }

  const readCache = () => {
    const cached = PB.store.get(WEATHER_KEY);
    return cached && Array.isArray(cached.days) ? cached : null;
  };

  /** The forecast for a place: Open-Meteo, or the copy kept in this browser when offline. */
  async function download(place) {
    const W = B.weather;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(W.forecastUrl(place.latitude, place.longitude), { signal: controller.signal, credentials: "omit", referrerPolicy: "no-referrer" });
      if (!response.ok) throw new Error(`The weather service answered ${response.status}`);
      const days = W.parseForecast(await response.json());
      const next = { fetchedAt: new Date().toISOString(), latitude: place.latitude, longitude: place.longitude, days };
      PB.store.set(WEATHER_KEY, next);
      return { forecast: next, problem: null };
    } catch {
      const cached = readCache();
      const samePlace = !!cached && Math.abs(cached.latitude - place.latitude) < 0.011 && Math.abs(cached.longitude - place.longitude) < 0.011;
      return {
        forecast: samePlace ? cached : null,
        problem: samePlace
          ? "Couldn’t reach the weather service, so this is the last forecast saved in this browser."
          : "Couldn’t reach the weather service. Check your connection and refresh to try again."
      };
    } finally {
      clearTimeout(timer);
    }
  }

  function working(w) {
    const premade = B.premade.premadeById(w.premadeId);
    return `<div class="pb-working"><h3>${h.esc(`${w.title} · ${w.element}`)}</h3>${h.p(w.detail)}${w.care ? `<p class="pb-care">${h.esc(`Take care: ${w.care}`)}</p>` : ""}${
      premade ? h.actions([h.button(premade.title, { variant: "ghost", href: links.premade(premade.id), attrs: { "aria-label": `${premade.title}: opens this premade working` } })]) : ""
    }</div>`;
  }

  function dayCard(day, label) {
    const W = B.weather;
    const workings = W.workingsFor(day);
    const facts = [
      day.tempMin !== null && day.tempMax !== null ? `${Math.round(day.tempMin)}° to ${Math.round(day.tempMax)}°C` : null,
      day.rainMm >= 0.2 ? `${day.rainMm.toFixed(1)} mm rain${day.rainChance !== null ? ` (${day.rainChance}%)` : ""}` : "Dry",
      `gusts ${Math.round(day.gustMax)} km/h`,
      day.nightCloud !== null ? (day.nightCloud <= 30 ? "clear night" : day.nightCloud >= 75 ? "cloudy night" : "some cloud tonight") : null
    ].filter(Boolean);
    return h.card(
      `${h.label(label)}${h.cardTitle(W.describeCode(day.code))}${h.muted(facts.join(" · "))}${
        workings.length ? workings.map(working).join("") : h.p("Settled weather with nothing strong in it: a good day for whatever work is in front of you.")
      }`,
      { gold: workings.length > 0 }
    );
  }

  async function weatherPage(root) {
    const W = B.weather;
    let state = { forecast: null, problem: null, loading: false };

    root.innerHTML = [h.head("The next three days", "Weather for working", HUB), '<div class="pb-stack" data-part="body" aria-live="polite"></div>', '<div data-part="place"></div>'].join("");
    const body = root.querySelector('[data-part="body"]');
    const placeBox = root.querySelector('[data-part="place"]');

    const draw = () => {
      const place = PB.getPlace();
      if (!place) {
        body.innerHTML = "";
        placeBox.innerHTML = h.card(
          `${h.label("Where are you?")}${PB.placeForm("wx", {
            intro: "The forecast needs your location. It stays in this browser, rounded to about a kilometre, and only that is sent to the free weather service."
          })}`
        );
        return;
      }
      const todayKey = B.lifecycle.localDateKey(new Date());
      const days = state.forecast ? W.daysAhead(state.forecast.days, todayKey, 3) : [];
      PB.paint(
        body,
        [
          h.notice(state.problem),
          !state.forecast && state.loading ? h.muted("Reading the sky ahead…") : "",
          days.map((d) => dayCard(d, dayName(d.date, todayKey))).join(""),
          state.forecast && !days.length ? h.muted("The saved forecast has run out. Refresh to fetch a new one when you’re online.") : "",
          state.forecast
            ? h.muted(`Forecast by Open-Meteo.com, fetched ${B.calendar.timeOfDay(new Date(state.forecast.fetchedAt))}. Only your rounded location is sent.`)
            : "",
          h.actions([h.button(state.loading ? "Refreshing…" : "Refresh the forecast", { variant: "ghost", attrs: { "data-action": "refresh", "data-focus": "refresh", disabled: state.loading } })]),
          h.details(
            "Weather and the elements",
            `${h.p(
              "Weather was the first elemental teacher: rain and river for water, wind for air, lightning and the sun for fire, frost and stone for earth. Working with the weather you actually have is one of the oldest ways to keep a practice tied to the land."
            )}${h.muted(
              "Safety comes first. Thunder means stay indoors; gales mean stay away from trees and the shore; flame and wind don’t mix. Rain water is for washing, offerings and plants, never for drinking."
            )}`
          )
        ].join("")
      );
      if (!placeBox.querySelector("details")) {
        placeBox.innerHTML = h.details("Change my location", PB.placeForm("wx", { intro: "Your place stays in this browser, rounded to about a kilometre.", place }));
      }
    };

    const fetchNow = async () => {
      const place = PB.getPlace();
      if (!place) return draw();
      state.loading = true;
      draw();
      const result = await download(place);
      state = { ...result, loading: false };
      draw();
    };

    const load = () => {
      placeBox.innerHTML = "";
      const place = PB.getPlace();
      state = { forecast: null, problem: null, loading: false };
      if (!place) return draw();
      // Show the saved forecast at once (if it's for this place), then fetch a new one if it's stale.
      const cached = readCache();
      if (cached && W.cacheFresh(cached, place.latitude, place.longitude, new Date(), 7 * 86400000)) state.forecast = cached;
      if (!W.cacheFresh(cached, place.latitude, place.longitude, new Date())) fetchNow();
      else draw();
    };

    PB.bind(root, { click: { refresh: fetchNow, ...PB.placeHandlers(root, "wx", load) } });
    load();
  }

  const VIEWS = { "elemental-hub": hub, "elemental-balance": balancePage, "elemental-weather": weatherPage };
  const view = document.querySelector("[data-page-root]")?.getAttribute("data-view");
  if (VIEWS[view]) PB.start((root) => VIEWS[view](root));
})();
