/*
 * Cosmic & celestial on the website, as the app has it
 * (app/src/app/(tabs)/rituals/craft/cosmic): the practice page, your charts
 * (kept in the encrypted chart vault, practice/cosmic/astro-store.js), a
 * chart (wheel, placements, aspects, balance, the reading in full,
 * transits, returns, progressions, and where it meets the craft), birth
 * details with the place search, synastry, planetary days and hours, the
 * planet guides, Learn astrology, and how charts are kept.
 *
 * The astrology is the app's own (js/core/astro.js, with the readings in
 * js/core/astro-readings.js on the chart and synastry pages); terms anywhere are
 * tappable (js/astro-terms.js); the wheels are practice/cosmic/wheel.js.
 */
(function () {
  "use strict";

  const PB = window.PracticeB;
  const { h, links } = PB;
  const B = window.SaltCore && window.SaltCore["practice-b"];
  const A = window.SaltCore && window.SaltCore.astro;
  // The readings (js/core/astro-readings.js), loaded only by the pages that read a chart: chart/ and synastry/.
  const R = () => window.SaltCore && window.SaltCore["astro-readings"];
  const ST = window.SaltAstroStore;
  const T = window.SaltAstroTerms;
  const W = window.SaltAstroWheel;
  const esc = h.esc;
  const HUB = { href: "/practice/cosmic/", label: "Cosmic & celestial" };
  const CHARTS = { href: "/practice/cosmic/charts/", label: "Charts" };
  const url = {
    chart: (id, tab) => `/practice/cosmic/chart/?${new URLSearchParams({ ...(id ? { id } : {}), ...(tab ? { tab } : {}) })}`,
    edit: (params = {}) => `/practice/cosmic/chart-edit/?${new URLSearchParams(params)}`,
    planet: (p) => `/practice/cosmic/planet/?planet=${encodeURIComponent(p)}`,
    hours: (p) => `/practice/cosmic/hours/${p ? `?planet=${encodeURIComponent(p)}` : ""}`,
    planner: (d, planet) => `/rituals/planner/?${new URLSearchParams({ date: A.cosmicHours.planFields(d).date, time: A.cosmicHours.planFields(d).time, hour: planet })}`
  };
  const tx = (text, skip) => (T ? T.html(text, skip ? { skip } : {}) : esc(text));
  const ptx = (text, cls = "", skip) => `<p${cls ? ` class="${cls}"` : ""}>${tx(text, skip)}</p>`;
  const termChips = (ids, label = "What these mean") => {
    const entries = ids.map((id) => A.glossary.term(id)).filter(Boolean);
    return entries.length ? `<p class="sp-caption">${esc(label)}</p>${h.chips(entries.map((e) => `<button type="button" class="sp-chip" data-astro-term="${esc(e.id)}">${esc(`${e.symbol ? `${e.symbol} ` : ""}${e.term}`)}</button>`))}` : "";
  };
  const { timeOfDay, shortDate, relativeDay } = A ? A.calendar : {};
  const termId = (name) => A.glossary.termIdFor(name);
  const ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];
  const ordinal = (n) => `${ORD[n - 1]} house`;
  /** "Ancient link" or "Modern link": how a god came to be tied to a planet. */
  const deityLinkTag = (d) => (d.link ? `<p class="astro-deity-link${d.link === "modern" ? " astro-deity-link--modern" : ""}">${esc(A.guides.DEITY_LINK_LABEL[d.link])}</p>` : "");

  // ── Settings ──────────────────────────────────────────────────────────────

  let settingsCache = null;
  async function settings() {
    if (settingsCache) return settingsCache;
    try {
      settingsCache = typeof window.getMySettings === "function" ? await window.getMySettings() : {};
    } catch {
      settingsCache = {};
    }
    return settingsCache;
  }
  async function patchSettings(changes) {
    settingsCache = { ...(settingsCache || {}), ...changes };
    try {
      if (window.SaltSettings?.patch) await window.SaltSettings.patch(changes);
      else if (typeof window.getMySettings === "function" && typeof window.saveMySettings === "function") {
        const s = { ...(await window.getMySettings()) };
        ["settings", "user_id", "updated_at"].forEach((k) => delete s[k]);
        await window.saveMySettings({ ...s, ...changes });
      }
    } catch (error) {
      console.warn("[astro] settings", error);
    }
  }

  async function ready(user) {
    await ST.load(user?.id ?? null);
    const s = await settings();
    if (s && T && (s.astro_explanations === "simple" || s.astro_explanations === "detailed") && T.level !== s.astro_explanations) T.setLevel(s.astro_explanations);
    return s;
  }

  const castAll = (s, extra = {}) => ST.state.data.charts.map((saved) => ({ saved, chart: A.natal.castChart(saved.input, A.prefs.chartOptionsFrom(s, extra)) }));

  // ── Explained cards (own Simple · Detailed switch) ────────────────────────

  let cardSeq = 0;
  /** A card for a reading ({simple, detailed, magic, shadow}) or a glossary entry, with its own switch. */
  function explainCard({ title, eyebrow, reading, entry, terms = [], extra = "" }) {
    const id = `ac${++cardSeq}`;
    const level = T ? T.level : "simple";
    const body = (lv) => {
      if (reading) {
        if (lv === "simple") return ptx(reading.simple, "", terms);
        return `${reading.detailed.split(/\n\s*\n/).map((p) => ptx(p.trim(), "", terms)).join("")}${reading.shadow ? `<div class="astro-part"><p class="astro-part__head">The harder side</p>${ptx(reading.shadow)}</div>` : ""}`;
      }
      if (entry) return lv === "simple" ? ptx(entry.simple, "", [entry.id]) : T.detailHtml(entry);
      return "";
    };
    /** The craft text: the fuller one at Detailed, where a reading has it. */
    const magic = (lv) => (lv === "detailed" && reading.magicDetailed ? reading.magicDetailed.split(/\n\s*\n/).map((p) => ptx(p.trim(), "", terms)).join("") : ptx(reading.magic, "", terms));
    return h.card(
      `${eyebrow ? `<p class="sp-eyebrow">${esc(eyebrow)}</p>` : ""}${h.cardTitle(title)}
      <div data-explain-body="${id}" data-simple="${esc(body("simple"))}" data-detailed="${esc(body("detailed"))}">${body(level)}</div>
      ${reading ? `<div class="astro-magic"><p class="astro-part__head">In the craft</p><div data-explain-magic="${id}" data-simple="${esc(magic("simple"))}" data-detailed="${esc(magic("detailed"))}">${magic(level)}</div>${T && T.linksHtml ? T.linksHtml(reading.links) : ""}</div>` : ""}
      ${extra}
      ${reading || entry ? `<div class="astro-level" role="group" aria-label="How much to explain ${esc(title)}" data-explain-switch="${id}">${["simple", "detailed"].map((l) => `<button type="button" data-action="explain" data-card="${id}" data-level="${l}" aria-pressed="${level === l}">${l === "simple" ? "Simple" : "Detailed"}</button>`).join("")}</div>` : ""}
      ${termChips(terms)}`
    );
  }
  function explainToggle(el, root) {
    const id = el.getAttribute("data-card");
    const lv = el.getAttribute("data-level");
    const box = root.querySelector(`[data-explain-body="${id}"]`);
    if (box) box.innerHTML = box.getAttribute(`data-${lv}`);
    const craft = root.querySelector(`[data-explain-magic="${id}"]`);
    if (craft) craft.innerHTML = craft.getAttribute(`data-${lv}`);
    root.querySelectorAll(`[data-card="${id}"]`).forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-level") === lv)));
  }

  function positionCard(p, chart) {
    const reading = R().interpret.inSign(p.point, p.sign);
    const words = A.meanings.PLANET_RULES[p.point];
    const decan = A.signs.decanOf(p.longitude);
    const facts = [A.natal.formatDegree(p), p.house ? ordinal(p.house) : null, p.retrograde ? "retrograde" : null, p.dignity ? A.signs.DIGNITY_LABEL[p.dignity] : null, `decan ${decan.decan} (${decan.ruler})`].filter(Boolean).join(" · ");
    const terms = [termId(p.point), termId(p.sign), p.house ? `house-${p.house}` : null, p.dignity, p.retrograde ? "retrograde" : null].filter((x) => x && A.glossary.term(x));
    const coming = "The full reading for this placement is still being written. Meanwhile, tap the words below to learn what each part means.";
    let out = explainCard({
      eyebrow: facts,
      title: p.point === "Ascendant" ? `${p.sign} rising` : `${p.point} in ${p.sign}`,
      reading,
      entry: reading ? null : A.glossary.term(termId(p.point)),
      terms,
      extra: reading ? "" : ptx(words ? `${p.point} (${words}) works ${A.meanings.SIGN_STYLE[p.sign]} in ${p.sign}. ${coming}` : coming, "sp-caption")
    });
    if (p.house && p.point !== "Ascendant") {
      const hr = R().interpret.inHouse(p.point, p.house);
      out += explainCard({ title: `In the ${ordinal(p.house)}`, reading: hr, entry: hr ? null : A.glossary.term(`house-${p.house}`), terms: [`house-${p.house}`], extra: hr ? "" : ptx(`${p.point} brings its themes into ${R().interpret.houseMeaning(p.house).keywords.slice(0, 4).join(", ")}.`, "sp-caption") });
    }
    return out;
  }

  function houseCard(n, chart) {
    const hm = R().interpret.houseMeaning(n);
    const cusps = chart.houses ? chart.houses.cusps : chart.solarCusps;
    const sign = cusps ? A.signs.SIGNS[Math.floor(cusps[n - 1] / 30) % 12] : null;
    const inside = chart.positions.filter((p) => p.house === n && !["Ascendant", "Midheaven", "Descendant", "IC"].includes(p.point)).map((p) => p.point);
    const ruler = sign ? A.signs.TRADITIONAL_RULER[sign] : null;
    const at = ruler ? A.natal.positionOf(chart, ruler) : null;
    return explainCard({
      eyebrow: `House ${n}${sign ? ` · ${sign} on the cusp · ruled by ${ruler}${inside.length ? ` · ${inside.join(", ")}` : ""}` : ""}`,
      title: hm.name,
      reading: R().interpret.houseReading(n, sign ? { sign, inside, rulerAt: at ? { sign: at.sign, house: at.house } : null } : null),
      terms: [`house-${n}`, ...(sign ? [termId(sign)] : [])]
    });
  }

  function aspectCard(a, transit) {
    const def = A.aspects.aspectDef(a.aspect);
    const reading = transit ? R().interpret.transitReading(a.a, a.aspect, a.b) : R().interpret.aspectReading(a.a, a.aspect, a.b);
    const tone = def.tone === "soft" ? "an easy flow between them" : def.tone === "hard" ? "friction that asks for effort and grows strength" : def.tone === "blend" ? "the two acting as one" : "a subtle link";
    const w = A.meanings.PLANET_RULES;
    return explainCard({
      eyebrow: `${a.orb.toFixed(1)}° from exact${a.applying == null ? "" : a.applying ? ", applying" : ", separating"}`,
      title: `${transit ? "Transiting " : ""}${a.a} ${def.symbol} ${transit ? "natal " : ""}${a.b}`,
      reading,
      entry: reading ? null : A.glossary.term(a.aspect),
      terms: [termId(a.a), a.aspect, termId(a.b), "orb"].filter((x) => A.glossary.term(x)),
      extra: reading ? "" : ptx(`${a.a} (${w[a.a] || a.a}) and ${a.b} (${w[a.b] || a.b}) make a ${a.aspect} (${def.angle}°): ${tone}.`, "sp-caption")
    });
  }

  const NOTE = {
    "no-time": "No birth time: the planets are for local noon, so the Moon may be a few degrees out. There is no rising sign and no houses.",
    "no-place": "No birthplace: there is no rising sign and no houses.",
    "polar-fallback": "Born inside the polar circle, where Placidus houses can’t be drawn: Porphyry houses are shown instead.",
    "outside-range": "The planet tables are tuned for 1800 to 2050, so positions for this date are rougher.",
    "chiron-range": "Chiron’s table covers 1800 to 2100, so it isn’t shown for this date.",
    sidereal: "Sidereal zodiac (Lahiri): the signs are measured from the stars, about 24° behind the tropical ones."
  };

  const row = ({ glyph, title, detail, attrs = {} }) =>
    `<button type="button" class="astro-row"${h.attr(attrs)}><span class="astro-row__glyph" aria-hidden="true">${esc(glyph || "✦")}</span><span class="astro-row__text"><span class="astro-row__title">${tx(title)}</span>${detail ? `<span class="astro-row__detail">${esc(detail)}</span>` : ""}</span></button>`;

  const locked = () =>
    h.card(`${h.label("Your charts are locked")}${h.p("They’re kept with your account under a passphrase. Enter it once in this browser to open them.")}${h.actions([h.button("Open my charts", { href: "/practice/cosmic/keep/" })])}`, { gold: true });

  // ── The practice page ─────────────────────────────────────────────────────

  async function hub(root, user) {
    const s = await ready(user);
    const about = B.premade.PRACTICES.find((p) => p.id === "cosmic")?.about;
    const tools = B.practices.CRAFT_TOOLS.cosmic;
    const mine = ST.myChart();
    const chart = mine ? A.natal.castChart(mine.input, A.prefs.chartOptionsFrom(s)) : null;
    const place = PB.getPlace();
    const now = new Date();
    const hour = place ? A.hours.currentHour(now, place) : null;
    const line = chart ? A.craftLinks.todayLine(chart, now) : null;
    const details = [chart ? A.natal.bigThreeLine(chart) : null, hour ? `${hour.planet} hour until ${timeOfDay(hour.end)}` : null, null];
    const routes = ["/practice/cosmic/chart/", "/practice/cosmic/hours/", "/practice/cosmic/course/"];
    root.innerHTML = [
      h.head("Craft tools", "Cosmic & celestial", { href: links.hub, label: "Craft tools" }),
      about ? h.muted(about) : "",
      hour ? h.card(`${h.label("This hour")}<h2 class="pb-card-title">${tx(`The hour of ${hour.planet}`)}</h2>${h.muted(`Until ${timeOfDay(hour.end)}. Good for ${A.cosmicHours.HOUR_SUITS[hour.planet].short}.`)}`, { gold: true }) : "",
      line ? h.card(`${h.label("The sky on your chart today")}${ptx(line.line)}<a class="astro-link" href="${esc(url.chart(null, "transits"))}">All your transits ›</a>`) : "",
      h.section("Tools", h.list([...tools.map((tool, i) => h.row({ href: routes[i], title: tool.title, detail: details[i] ?? tool.detail })), h.row({ href: "/practice/cosmic/timing/", title: "Find a good time", detail: "The best hours ahead for a working, from the moon, the planets and your chart" }), h.row({ href: "/practice/cosmic/learn/", title: "Astrology glossary", detail: "Every term explained, simply or in depth" }), h.row({ href: "/practice/cosmic/charts/", title: "All charts", detail: ST.state.data.charts.length ? `${ST.state.data.charts.length} kept, privately · synastry` : "Yours and others’, kept privately" })], "Cosmic tools")),
      h.list([
        h.row({ href: "/today/sky/", title: "The sky today", detail: "Planets, retrogrades and eclipses" }),
        h.row({ href: links.premadeFor("cosmic"), title: "Cosmic workings", detail: "Premade rituals and spells; filter by Cosmic & celestial" })
      ])
    ].join("");
  }

  // ── Charts ────────────────────────────────────────────────────────────────

  const SYNC = {
    device: "Kept in this browser only, encrypted.",
    "signed-out": "Kept in this browser only, encrypted.",
    synced: "Encrypted and kept with your account under your passphrase.",
    saving: "Saving to your account…",
    offline: "Kept here; your account’s copy will catch up when you’re online.",
    unavailable: "Kept in this browser; keeping charts with your account isn’t ready on the server yet."
  };

  async function chartsPage(root, user) {
    const s = await ready(user);
    const draw = () => {
      const charts = castAll(s);
      const orbs = A.aspects.parseOrbs(s.astro_orbs || "");
      const st = ST.state;
      const chip = (label, pressed, action, value) => h.chip(label, { pressed, attrs: { "data-action": action, "data-value": value, "data-focus": `${action}-${value}` } });
      PB.paint(
        root,
        [
          h.head("Cosmic & celestial", "Birth charts", HUB),
          ptx("A birth chart is the sky at the moment you were born: the Sun, Moon and planets in the zodiac, the rising sign and the houses. Tap any underlined word to learn what it means. These are traditional meanings for reflection, not destiny.", "sp-caption"),
          st.phase === "locked"
            ? locked()
            : h.section(
                "Charts",
                charts.length
                  ? `${h.list(charts.map(({ saved, chart }) => h.row({ href: url.chart(saved.id), title: saved.relation === "me" ? `${saved.name} (you)` : saved.name, detail: chart ? A.natal.bigThreeLine(chart) : "Its birth date couldn’t be read" })), "Your charts")}${h.actions([
                      h.button("Add someone’s chart", { variant: "ghost", href: url.edit({ relation: charts.some((c) => c.saved.relation === "me") ? "other" : "me" }) }),
                      charts.length > 1 ? h.button("Compare two charts (synastry)", { variant: "ghost", href: "/practice/cosmic/synastry/" }) : ""
                    ])}`
                  : h.card(`${h.p("Start with your own: your birth date is enough, and a time and place add your rising sign and houses.")}${h.actions([h.button("Add my chart", { href: url.edit({ relation: "me" }) })])}`, { gold: true })
              ),
          h.card(`${h.label("How your charts are kept")}${h.p(SYNC[st.sync] || SYNC.device)}${h.notice(st.error)}${h.actions([h.button("Privacy and syncing", { variant: "ghost", href: "/practice/cosmic/keep/" })])}`),
          h.card(`${h.label("Explanations")}${h.muted("Simple gives a sentence or two; Detailed adds the astronomy, history, traditions, the craft and cautions. Each card can be switched on its own too.")}${h.chips([chip("Simple", (T ? T.level : "simple") === "simple", "level", "simple"), chip("Detailed", T && T.level === "detailed", "level", "detailed")], "Explanations everywhere")}`),
          h.card(
            `${h.label("How charts are drawn")}${ptx("House systems: Placidus is the most common; Whole Sign is the oldest; Equal works everywhere.", "sp-caption")}
            ${h.chips(["placidus", "whole-sign", "equal"].map((x) => chip(A.houses.HOUSE_SYSTEM_LABEL[x], (s.astro_house_system || "placidus") === x, "house", x)))}
            ${ptx("Zodiac: tropical (Western, by the seasons) or sidereal (by the stars, Lahiri ayanamsa).", "sp-caption")}
            ${h.chips([chip("Tropical", s.astro_zodiac !== "sidereal", "zodiac", "tropical"), chip("Sidereal", s.astro_zodiac === "sidereal", "zodiac", "sidereal")])}
            ${ptx("The Moon’s nodes: true (osculating) or mean (smoothed).", "sp-caption")}
            ${h.chips([chip("True node", s.astro_nodes !== "mean", "nodes", "true"), chip("Mean node", s.astro_nodes === "mean", "nodes", "mean")])}
            ${h.toggle({ id: "astro-minors", label: "Show minor aspects", detail: "Quincunx, semisextile, semisquare, sesquiquadrate, quintile and biquintile", checked: orbs.minors, attrs: { "data-change": "minors" } })}
            ${h.toggle({ id: "astro-wide", label: "Wider orbs", detail: "Two degrees more on the major aspects", checked: (orbs.orbs.conjunction ?? 8) > 8, attrs: { "data-change": "wide" } })}`
          ),
          h.list([h.row({ href: "/practice/cosmic/learn/", title: "Learn astrology", detail: "Every term explained, simply or in depth" }), h.row({ href: "/practice/cosmic/hours/", title: "Planetary days and hours", detail: "The seven planets, their hours where you are, and their guides" })])
        ].join("")
      );
    };
    const save = async (patch) => {
      await patchSettings(patch);
      Object.assign(s, patch);
      draw();
    };
    PB.bind(root, {
      click: {
        level: (el) => {
          T?.setLevel(el.dataset.value);
          s.astro_explanations = el.dataset.value;
          draw();
        },
        house: (el) => save({ astro_house_system: el.dataset.value }),
        zodiac: (el) => save({ astro_zodiac: el.dataset.value }),
        nodes: (el) => save({ astro_nodes: el.dataset.value })
      },
      change: {
        minors: (el) => save({ astro_orbs: JSON.stringify({ ...A.aspects.parseOrbs(s.astro_orbs || ""), minors: el.checked }) }),
        wide: (el) =>
          save({ astro_orbs: JSON.stringify({ ...A.aspects.parseOrbs(s.astro_orbs || ""), orbs: el.checked ? { conjunction: 10, opposition: 10, trine: 9, square: 9, sextile: 6 } : {} }) })
      }
    });
    draw();
    ST.subscribe(draw);
  }

  // ── One chart ─────────────────────────────────────────────────────────────

  const TABS = [
    ["wheel", "Wheel"], ["placements", "Placements"], ["aspects", "Aspects"], ["balance", "Balance"], ["reading", "Read in full"],
    ["transits", "Transits"], ["returns", "Returns"], ["progressions", "Progressions"], ["craft", "In your craft"]
  ];

  async function chartPage(root, user) {
    const s = await ready(user);
    const view = { tab: TABS.some(([k]) => k === PB.query("tab")) ? PB.query("tab") : "wheel", solar: false, picked: null, when: new Date(), year: new Date().getFullYear(), atHere: false, open: null };
    const id = PB.query("id");
    const current = () => {
      const saved = id ? ST.state.data.charts.find((c) => c.id === id) : ST.myChart();
      if (!saved) return null;
      return { saved, chart: A.natal.castChart(saved.input, A.prefs.chartOptionsFrom(s, { solarChart: view.solar })) };
    };
    let lastAspects = [];
    const wheelSize = () => Math.min((root.clientWidth || 360) - 8, 460);

    const draw = () => {
      cardSeq = 0;
      const cast = current();
      if (ST.state.phase === "locked") return PB.paint(root, `${h.head("Charts", "My chart", CHARTS)}${locked()}`);
      if (!cast || !cast.chart) {
        return PB.paint(
          root,
          `${h.head("Cosmic & celestial", "My chart", CHARTS)}${h.card(`${h.cardTitle("Your sun, moon and rising")}${ptx("Add your birth date to see where the Sun, Moon and planets stood when you arrived. With a birth time and place you’ll see your rising sign, houses and Midheaven too, and each day which planets are touching them.")}${h.actions([h.button("Add my birth details", { href: url.edit({ relation: "me" }) })])}`, { gold: true })}${h.actions([h.button("All charts", { variant: "ghost", href: CHARTS.href })])}`
        );
      }
      const { saved, chart } = cast;
      const tabs = h.chips(TABS.map(([k, label]) => h.chip(label, { pressed: view.tab === k, attrs: { "data-action": "tab", "data-tab": k, "data-focus": `tab-${k}` } })), "Chart sections");
      const notes = chart.notes.map((n) => h.notice(NOTE[n])).join("");
      const solar = !chart.timeKnown ? h.chips([h.chip(view.solar ? "Solar chart houses: on" : "Show solar chart houses", { pressed: view.solar, attrs: { "data-action": "solar" } }), `<button type="button" class="sp-chip" data-astro-term="houses">What is a solar chart?</button>`]) : "";
      const s2 = view.tab;
      const body =
        s2 === "wheel" ? wheelTab(chart) : s2 === "placements" ? placementsTab(chart) : s2 === "aspects" ? aspectsTab(chart) : s2 === "balance" ? balanceTab(chart) : s2 === "reading" ? readingTab(chart) : s2 === "transits" ? transitsTab(chart) : s2 === "returns" ? returnsTab(chart) : s2 === "progressions" ? progressionsTab(chart) : craftTab(chart);
      const i = saved.input;
      PB.paint(
        root,
        [
          h.head(saved.relation === "me" ? "Your chart" : "A chart", saved.name, CHARTS),
          ptx(A.natal.bigThreeLine(chart), "sp-muted"),
          tabs,
          notes,
          solar,
          `<div data-tab-body>${body}</div>`,
          h.card(
            `${h.label("Birth details")}${h.p([i.date, chart.timeKnown ? i.time : "time unknown", `${A.birth.offsetLabel(i.utcOffsetMinutes)}${i.offsetOverridden ? " (set by hand)" : i.zone ? ` (${i.zone})` : ""}`].join(" · "))}${h.muted(i.placeLabel || "No birthplace")}${h.muted(`${chart.options.zodiac === "sidereal" ? "Sidereal (Lahiri)" : "Tropical"} zodiac · ${chart.houses ? `${A.houses.HOUSE_SYSTEM_LABEL[chart.houses.system]} houses` : "no houses"} · ${chart.options.nodes} node`)}${h.actions([h.button("Edit birth details", { variant: "ghost", href: url.edit({ id: saved.id }) }), h.button("All charts and settings", { variant: "text", href: CHARTS.href })])}`
          )
        ].join("")
      );
    };

    const wheelTab = (chart) => {
      lastAspects = chart.aspects;
      const picked = view.picked ? pickedHtml(view.picked, chart) : bigThree(chart);
      return `<div class="astro-wheel-wrap">${W.chart(A, chart, { size: wheelSize() })}</div>${ptx("Tap a planet, a house number, a sign or an aspect line. The Ascendant is on the left; the houses run counter-clockwise from it. Blue lines are trines and sextiles, red are squares and oppositions, gold are conjunctions.", "sp-caption")}<div data-picked>${picked}</div>`;
    };
    const bigThree = (chart) =>
      h.section(
        "Your big three",
        `<div class="astro-rows">${["Sun", "Moon", "Ascendant"]
          .map((n) => A.natal.positionOf(chart, n))
          .filter(Boolean)
          .map((p) => row({ glyph: A.signs.POINT_GLYPH[p.point], title: p.point === "Ascendant" ? `${p.sign} rising` : `${p.point} in ${p.sign}`, detail: `${A.natal.formatDegree(p)}${p.house ? ` · ${ordinal(p.house)}` : ""}${p.orSign ? ` · or ${p.orSign}, depending on the time` : ""}`, attrs: { "data-action": "pick-point", "data-point": p.point } }))
          .join("")}</div>${A.natal.positionOf(chart, "Ascendant") ? "" : ptx("The rising sign (Ascendant) needs a birth time and place.", "sp-caption")}`
      );
    const pickedHtml = (pick, chart) => {
      if (pick.kind === "point") {
        const p = (pick.outer ? pick.outer : chart.positions).find((x) => x.point === pick.point);
        return p ? positionCard(p, chart) : "";
      }
      if (pick.kind === "house") return houseCard(pick.house, chart);
      if (pick.kind === "aspect") return aspectCard(pick.aspect, pick.transit);
      return "";
    };

    const placementsTab = (chart) =>
      `<div class="astro-rows">${chart.positions
        .filter((p) => p.point !== "Descendant" && p.point !== "IC")
        .map(
          (p) =>
            `${row({ glyph: A.signs.POINT_GLYPH[p.point], title: p.point, detail: [A.natal.formatDegree(p), p.house ? `house ${p.house}` : null, p.retrograde ? "℞ retrograde" : null, p.dignity, p.orSign ? `or ${p.orSign}` : null].filter(Boolean).join(" · "), attrs: { "data-action": "open-row", "data-point": p.point, "aria-expanded": String(view.open === p.point) } })}${view.open === p.point ? positionCard(p, chart) : ""}`
        )
        .join("")}</div>${termChips(["dignity", "retrograde", "decans", "house-systems"], "Words in this list")}`;

    const GRID = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron", "North Node", "Ascendant", "Midheaven"];
    const aspectsTab = (chart) => {
      lastAspects = chart.aspects;
      const pts = GRID.filter((p) => A.natal.positionOf(chart, p));
      const find = (a, b) => chart.aspects.findIndex((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
      const grid = pts
        .map((r, i) => `<div class="astro-grid__row">${pts
          .slice(0, i)
          .map((c) => {
            const k = find(r, c);
            if (k < 0) return `<span class="astro-grid__cell"></span>`;
            const a = chart.aspects[k];
            const def = A.aspects.aspectDef(a.aspect);
            return `<button type="button" class="astro-grid__cell" style="color:${def.tone === "hard" ? "#d9826a" : def.tone === "soft" ? "#7fb0c9" : "#e2c36d"}" data-action="pick-aspect" data-index="${k}" aria-label="${esc(`${r} ${a.aspect} ${c}, ${a.orb.toFixed(1)} degrees`)}">${def.symbol}</button>`;
          })
          .join("")}<span class="astro-grid__cell astro-grid__cell--head" aria-hidden="true">${A.signs.POINT_GLYPH[r]}</span></div>`)
        .join("");
      const list = chart.aspects
        .slice(0, 30)
        .map((a, k) => row({ glyph: A.aspects.aspectDef(a.aspect).symbol, title: `${a.a} ${a.aspect} ${a.b}`, detail: `${a.orb.toFixed(1)}°${a.applying == null ? "" : a.applying ? " · applying" : " · separating"}`, attrs: { "data-action": "pick-aspect", "data-index": k } }))
        .join("");
      const patterns = chart.patterns.length
        ? h.section("Patterns", `<div class="astro-rows">${chart.patterns.map((p) => `<button type="button" class="astro-row" data-astro-term="${esc(p.name)}"><span class="astro-row__text"><span class="astro-row__title">${esc(A.aspects.PATTERN_LABEL[p.name])}</span><span class="astro-row__detail">${esc(`${p.points.join(", ")}${p.apex ? ` · focus ${p.apex}` : ""}${p.sign ? ` · in ${p.sign}` : p.house ? ` · ${ordinal(p.house)}` : ""}`)}</span></span></button>`).join("")}</div>`)
        : "";
      return `<div class="astro-grid" aria-label="Aspect grid">${grid}</div><div data-picked>${view.picked && view.picked.kind === "aspect" ? aspectCard(view.picked.aspect) : ""}</div>${h.section("Tightest first", `<div class="astro-rows">${list}</div>`)}${patterns}${termChips(["aspects", "orb", "applying-separating", "aspect-patterns", "conjunction", "opposition", "trine", "square", "sextile", "quincunx"])}`;
    };

    const bar = (label, score, max, points, id2) =>
      `<div class="astro-bar"><div class="pb-head"><button type="button" class="astro-term" data-astro-term="${id2}">${esc(label)}</button><span class="sp-caption">${score}</span></div><div class="astro-bar__track"><div class="astro-bar__fill" style="width:${max ? (score / max) * 100 : 0}%"></div></div><p class="sp-caption">${esc(points.length ? points.join(", ") : "none")}</p></div>`;
    const balanceTab = (chart) => {
      const b = chart.balance;
      const maxE = Math.max(...Object.values(b.elements).map((e) => e.score));
      const maxM = Math.max(...Object.values(b.modalities).map((e) => e.score));
      const cap = (x) => x[0].toUpperCase() + x.slice(1);
      return [
        h.card(`${h.label("Elements")}${["fire", "earth", "air", "water"].map((e) => bar(cap(e), b.elements[e].score, maxE, b.elements[e].points, e)).join("")}${ptx(`Mostly ${b.dominantElement}${b.missingElements.length ? `, with no ${b.missingElements.join(" or ")}` : ""}. The Sun, Moon and Ascendant count twice.`)}`),
        h.card(`${h.label("Modalities")}${["cardinal", "fixed", "mutable"].map((m) => bar(cap(m), b.modalities[m].score, maxM, b.modalities[m].points, m)).join("")}`),
        h.card(`${h.label("Polarity")}${ptx(`Yang (fire and air): ${b.polarity.yang.score}. Yin (earth and water): ${b.polarity.yin.score}. See Polarity.`)}`),
        b.hemispheres
          ? h.card(`${h.label("Hemispheres and quadrants")}${h.p(`Above the horizon (houses 7–12): ${b.hemispheres.above.join(", ") || "none"}`)}${h.p(`Below the horizon (houses 1–6): ${b.hemispheres.below.join(", ") || "none"}`)}${h.p(`East, the rising side (houses 10–3): ${b.hemispheres.east.join(", ") || "none"}`)}${h.p(`West, the setting side (houses 4–9): ${b.hemispheres.west.join(", ") || "none"}`)}${b.quadrants.map((q, i) => h.muted(`Quadrant ${i + 1} (houses ${i * 3 + 1}–${i * 3 + 3}): ${q.join(", ") || "none"}`)).join("")}${h.muted("Many astrologers read a chart heavy above the horizon as outward and public, below as inward and private; east as self-directed, west as shaped through others.")}`)
          : h.muted("Hemispheres and quadrants need the houses, so a birth time and place."),
        chart.ruler ? ptx(`Chart ruler: ${chart.ruler.traditional}${chart.ruler.modern !== chart.ruler.traditional ? ` (modern: ${chart.ruler.modern})` : ""}. ${chart.sect === "day" ? "A day chart: the Sun was above the horizon." : "A night chart: the Sun was below the horizon."} See Sect.`) : ""
      ].join("");
    };

    const pieceHtml = (p) => (p.status === "ready" ? explainCard({ title: p.title, reading: p.reading, terms: p.terms }) : h.card(`${h.cardTitle(p.title)}${ptx(p.sketch)}${h.caption("Full reading coming soon.")}${termChips(p.terms)}`));

    const readingTab = (chart) => {
      const sections = R().compose.composeReading(chart);
      const progress = R().compose.readingProgress(sections);
      return `${ptx(`Your chart read in full, section by section. ${progress.ready} of ${progress.total} pieces are written so far; the rest show a short sketch and the terms to read while their full readings are being written.`, "sp-caption")}${sections
        .map((sec) =>
          h.section(
            sec.title,
            `${sec.intro ? ptx(sec.intro) : ""}${sec.pieces
              .map(pieceHtml)
              .join("")}`
          )
        )
        .join("")}`;
    };

    const DAY = 86400000;
    const transitsTab = (chart) => {
      const hits = A.forecast.transitsTo(chart, view.when);
      lastAspects = hits;
      const sky = A.forecast.transitHouses(chart, view.when);
      const retros = ["Mercury", "Venus", "Mars"].flatMap((p) => A.forecast.retrogradePeriods(p, new Date(view.when.getTime() - 30 * DAY), new Date(view.when.getTime() + 300 * DAY)));
      const today = new Date();
      const chip = (label, d, pressed) => h.chip(label, { pressed, attrs: { "data-action": "when", "data-when": String(d.getTime()) } });
      view.outer = sky.map((x) => x.position);
      return [
        h.chips([chip("Now", today, Math.abs(view.when - today) < 3600000), chip("Tomorrow", new Date(today.getTime() + DAY)), chip("In a week", new Date(today.getTime() + 7 * DAY)), chip("In a month", new Date(today.getTime() + 30 * DAY))]),
        `<div class="sp-grid-2">${h.field({ id: "astro-date", label: "Or a date", type: "date", value: "" })}<div class="sp-actions">${h.button("Show", { variant: "ghost", attrs: { "data-action": "when-date" } })}</div></div>`,
        h.muted(`The sky on ${shortDate(view.when)} at ${timeOfDay(view.when)}, in the outer ring, against the chart.`),
        `<div class="astro-wheel-wrap">${W.chart(A, chart, { size: wheelSize(), outer: view.outer, aspects: hits, outerLabel: "Transiting" })}</div>`,
        `<div data-picked>${view.picked ? pickedHtml(view.picked, chart) : ""}</div>`,
        h.section(
          "What touches the chart",
          hits.length
            ? `<div class="astro-rows">${hits
                .slice(0, 14)
                .map((x, k) => row({ glyph: A.aspects.aspectDef(x.aspect).symbol, title: A.craftLinks.transitLineFor(x), detail: `${x.orb.toFixed(1)}° ${x.applying ? "and closing" : "and parting"}${x.house ? ` · moving through your ${ordinal(x.house)}` : ""}`, attrs: { "data-action": "pick-transit", "data-index": k } }))
                .join("")}</div>`
            : ptx("No planet is in close aspect to this chart at this moment: a quiet sky, good for steady, ordinary work.")
        ),
        h.section(
          "Retrogrades around this date",
          retros
            .map((r) => {
              const phase = A.forecast.retroPhaseAt(r, view.when);
              return h.card(`<h2 class="pb-card-title">${tx(`${r.planet} retrograde`)}</h2>${h.p(`Pre-shadow from ${shortDate(r.shadowStart)} · retrograde ${shortDate(r.start)} – ${shortDate(r.end)} · post-shadow until ${shortDate(r.shadowEnd)}`)}${h.muted(`Between ${Math.floor(r.endLongitude % 30)}° and ${Math.floor(r.startLongitude % 30)}° of its signs.${phase ? ` On this date: ${phase.replace("-", " ")}.` : ""}`)}`);
            })
            .join("")
        ),
        termChips(["transit", "retrograde", "shadow-period", "station", "applying-separating"])
      ].join("");
    };

    const returnsTab = (chart) => {
      const here = PB.getPlace();
      const place = view.atHere && here ? { latitude: here.latitude, longitude: here.longitude, label: "where you are now" } : null;
      const solar = A.forecast.returnChart(chart, "solar", new Date(Date.UTC(view.year, 0, 1)), place);
      const lunar = A.forecast.returnChart(chart, "lunar", new Date(), place);
      const size = Math.min(wheelSize(), 340);
      return [
        ptx("A solar return is the moment each year the Sun comes back to its birth degree; a lunar return, each month, the Moon. Their charts are read for the year or month ahead."),
        h.chips([h.chip(String(view.year - 1), { attrs: { "data-action": "year", "data-year": view.year - 1 } }), h.chip(String(view.year), { pressed: true }), h.chip(String(view.year + 1), { attrs: { "data-action": "year", "data-year": view.year + 1 } })]),
        here ? h.chips([h.chip(view.atHere ? "Cast for where you are now" : "Cast for the birthplace", { pressed: view.atHere, attrs: { "data-action": "here" } })]) : "",
        ...[solar, lunar].map((r) => {
          const lit = A.natal.positionOf(r.chart, r.kind === "solar" ? "Sun" : "Moon");
          return h.card(
            `${h.label(r.kind === "solar" ? `Solar return ${view.year}` : "Next lunar return")}${h.cardTitle(`${shortDate(r.when)} ${r.when.getFullYear()}, ${timeOfDay(r.when)}`)}${ptx(A.natal.bigThreeLine(r.chart))}${r.chart.houses && lit?.house ? ptx(`${r.kind === "solar" ? "The Sun" : "The Moon"} falls in the return's ${ordinal(lit.house)}: ${r.kind === "solar" ? "a focus for the year" : "a focus for the month"}.`) : ""}<div class="astro-wheel-wrap">${W.chart(A, r.chart, { size, noAspects: true })}</div>${h.muted(`Cast for ${r.placeLabel || (chart.placeKnown ? "the birthplace" : "no place (no houses)")}. Times are in this browser’s time zone.`)}`
          ) + R().compose.returnPieces(r).map(pieceHtml).join("");
        }),
        termChips(["returns", "solar-return", "lunar-return"])
      ].join("");
    };

    const progressionsTab = (chart) => {
      const p = A.forecast.progressionsFor(chart, new Date());
      const m = p.moon;
      return [
        ptx(`Secondary progressions: the sky ${Math.floor(p.age)} days after birth stands for this year of life (age ${Math.floor(p.age)}).`),
        h.card(
          `${h.label("The progressed Moon")}<h2 class="pb-card-title">${tx(`Progressed Moon in ${m.position.sign}`)}</h2>${h.p(`${A.natal.formatDegree(m.position)}${m.natalHouse ? ` · in your natal ${ordinal(m.natalHouse)}` : ""}`)}${m.nextSign ? ptx(`It enters ${m.nextSign.sign} around ${shortDate(m.nextSign.date)} ${m.nextSign.date.getFullYear()}: a new emotional chapter, about every two and a half years.`) : ""}${ptx(`Progressed lunar phase: ${p.phase} (${Math.round(p.phaseAngle)}° from the progressed Sun), part of a thirty-year cycle.`)}`,
          { gold: true }
        ),
        R().compose.progressedPieces(p).map(pieceHtml).join(""),
        p.ascendant && p.midheaven ? ptx(`By solar arc, the progressed Ascendant is in ${p.ascendant.sign} and the progressed Midheaven in ${p.midheaven.sign}.`) : "",
        p.changedSign.length ? h.card(`${h.label("Changed sign since birth")}${p.changedSign.map((c) => ptx(`${c.point}: ${c.from} → ${c.to}`)).join("")}`) : "",
        p.stationed.length ? ptx(`Turned direction by progression: ${p.stationed.join(", ")}.`) : "",
        h.section("Progressed positions", `<div class="astro-rows">${p.positions.map((x) => `<div class="astro-row"><span class="astro-row__glyph" aria-hidden="true">${A.signs.POINT_GLYPH[x.point]}</span><span class="astro-row__text"><span class="astro-row__title">${esc(x.point)}</span><span class="astro-row__detail">${esc(`${A.natal.formatDegree(x)}${x.retrograde ? " ℞" : ""}`)}</span></span></div>`).join("")}</div>`),
        termChips(["progressions", "moon-phases", "transit"])
      ].join("");
    };

    const libHref = (name) => {
      const lib = window.TraditionalLibrary || {};
      for (const type of ["herb", "crystal", "deity"]) {
        const hit = Object.entries(lib[type] || {}).find(([, v]) => v && v.DisplayName === name);
        if (hit) return links.library(`traditional:${type}:${hit[0]}`);
      }
      return null;
    };
    const libChips = (names) => h.chips(names.map((n) => (libHref(n) ? `<a class="sp-chip" href="${esc(libHref(n))}">${esc(n)}</a>` : h.tag(n))));
    const journeyFor = (name) => {
      const slug = name.toLowerCase().replace(/[^a-z]/g, "");
      return ["anubis", "aphrodite", "apollo", "artemis", "bastet", "brigid", "freyja", "frigg", "hekate", "hermes", "isis", "jupiter", "mars", "mercury", "odin", "ra", "saturn", "selene", "sol", "thor", "thoth", "tyr", "venus", "zeus", "diana", "sekhmet", "perun"].includes(slug) ? `/rituals/journeys/?id=deity-${slug}` : null;
    };
    const craftTab = (chart) => {
      const allies = A.craftLinks.personalAllies(chart);
      const patrons = A.craftLinks.patronsFromSettings(s);
      const deities = A.craftLinks.deitiesForChart(chart, patrons);
      const patronElsewhere = A.craftLinks.patronPlanets(chart, patrons);
      const altar = A.craftLinks.natalAltarPlanet(chart);
      const place = PB.getPlace();
      const ruler = allies[0];
      const next = ruler && place ? A.cosmicHours.nextHourOnItsDay(ruler.planet, new Date(), place) : null;
      return [
        ptx("Your chart ruler and the rulers of your Sun and Moon signs make a natural set of planetary allies: their days, hours, colours, herbs, stones and gods."),
        ...allies.map((a, i) =>
          h.card(`${h.label(a.why)}<h2 class="pb-card-title">${tx(`${A.signs.POINT_GLYPH[a.planet]} ${a.planet}`)}</h2>${h.p(`${a.guide.day} · ${a.guide.metal.split(".")[0]} · ${a.guide.colours.join(", ")}`)}${h.caption("Herbs")}${libChips(a.guide.herbs.slice(0, 6))}${h.caption("Stones")}${libChips(a.guide.stones.slice(0, 6))}${h.actions([h.button(`${a.planet}: the full guide`, { variant: "text", href: url.planet(a.planet) })])}`, { gold: i === 0 })
        ),
        h.card(`${h.label("A natal altar")}${ptx(`A starter altar for ${altar}, ${chart.ruler ? "your chart ruler" : "the ruler of your Sun sign"}: its colours, stones, herbs and incense. Open the altar and choose ${altar}’s day from the cabinet’s planetary pieces, or set tonight’s altar on ${A.guides.PLANET_GUIDES[altar].day}.`)}${h.actions([h.button("Open the altar", { href: `/altar/?natal=${encodeURIComponent(altar)}` }), h.button(`${altar}: colours, stones and herbs`, { variant: "ghost", href: url.planet(altar) })])}`),
        ruler
          ? h.card(`${h.label("Your ruler’s time")}${next ? ptx(`The next hour of ${ruler.planet} on its own day: ${shortDate(next.start)}, ${timeOfDay(next.start)} – ${timeOfDay(next.end)}.`) : h.muted("Add your place (The sky today) to find your ruler’s planetary hours.")}${h.actions([h.button("Planetary days and hours", { variant: "ghost", href: url.hours(ruler.planet) }), next ? h.button("Plan a working then", { variant: "text", href: url.planner(next.start, ruler.planet) }) : ""])}`)
          : "",
        h.section(
          "Deities tied to your strongest planets",
          `${h.muted("The gods whom the planets were named for, or whom their own traditions tie to that light. A place to start, never an assignment; each is approached through their own tradition.")}${deities
            .map((d) => h.card(`${d.patron ? h.label("Your patron") : ""}${h.cardTitle(d.name)}${h.muted(`${d.tradition} · ${d.planet} (${d.why})`)}${deityLinkTag(d)}${d.patronLine ? ptx(d.patronLine) : ""}${h.p(d.note)}${h.actions([libHref(d.name) ? h.button("In the Living Library", { variant: "ghost", href: libHref(d.name) }) : "", journeyFor(d.name) ? h.button("Dedication journey", { variant: "text", href: journeyFor(d.name) }) : ""])}`, { gold: !!d.patron }))
            .join("")}${patronElsewhere.map((p) => h.card(`${h.label("Your patron in your chart")}${ptx(p.line)}${h.actions([h.button(`${p.planet}: the full guide`, { variant: "text", href: url.planet(p.planet) })])}`)).join("")}`
        ),
        termChips(["chart-ruler", "planetary-days", "planetary-hours", "dignity"])
      ].join("");
    };

    const showPicked = () => {
      const cast = current();
      const box = root.querySelector("[data-picked]");
      if (box && cast) {
        box.innerHTML = view.tab === "wheel" && !view.picked ? bigThree(cast.chart) : view.picked ? pickedHtml(view.picked, cast.chart) : "";
        box.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      }
    };
    root.addEventListener("click", (event) => {
      const el = event.target.closest("[data-wheel-point],[data-wheel-outer],[data-wheel-sign],[data-wheel-house],[data-wheel-aspect]");
      if (!el || !root.contains(el)) return;
      event.preventDefault();
      wheelPick(el);
    });
    root.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const el = event.target.closest("[data-wheel-point],[data-wheel-outer],[data-wheel-sign],[data-wheel-house],[data-wheel-aspect]");
      if (!el) return;
      event.preventDefault();
      wheelPick(el);
    });
    function wheelPick(el) {
      if (el.dataset.wheelSign) return T?.open(termId(el.dataset.wheelSign));
      if (el.dataset.wheelPoint) view.picked = { kind: "point", point: el.dataset.wheelPoint };
      else if (el.dataset.wheelOuter) view.picked = { kind: "point", point: el.dataset.wheelOuter, outer: view.outer };
      else if (el.dataset.wheelHouse) view.picked = { kind: "house", house: Number(el.dataset.wheelHouse) };
      else if (el.dataset.wheelAspect) view.picked = { kind: "aspect", aspect: lastAspects[Number(el.dataset.wheelAspect)], transit: view.tab === "transits" };
      showPicked();
    }
    PB.bind(root, {
      click: {
        tab: (el) => {
          view.tab = el.dataset.tab;
          view.picked = null;
          draw();
        },
        solar: () => {
          view.solar = !view.solar;
          draw();
        },
        explain: (el) => explainToggle(el, root),
        "pick-point": (el) => {
          view.picked = { kind: "point", point: el.dataset.point };
          showPicked();
        },
        "open-row": (el) => {
          view.open = view.open === el.dataset.point ? null : el.dataset.point;
          draw();
        },
        "pick-aspect": (el) => {
          view.picked = { kind: "aspect", aspect: current().chart.aspects[Number(el.dataset.index)] };
          showPicked();
        },
        "pick-transit": (el) => {
          view.picked = { kind: "aspect", aspect: lastAspects[Number(el.dataset.index)], transit: true };
          showPicked();
        },
        when: (el) => {
          view.when = new Date(Number(el.dataset.when));
          view.picked = null;
          draw();
        },
        "when-date": () => {
          const v = root.querySelector("#astro-date")?.value;
          const d = v ? A.chartInput.parseDate(v) : null;
          if (d) {
            view.when = new Date(d.year, d.month - 1, d.day, 12);
            view.picked = null;
            draw();
          }
        },
        year: (el) => {
          view.year = Number(el.dataset.year);
          draw();
        },
        here: () => {
          view.atHere = !view.atHere;
          draw();
        }
      }
    });
    draw();
    ST.subscribe(draw);
  }

  // ── Birth details ─────────────────────────────────────────────────────────

  let cityData = null;
  async function cities() {
    if (cityData) return cityData;
    const res = await fetch("/js/core/cities.json");
    if (!res.ok) throw new Error("The place list couldn’t load.");
    cityData = await res.json();
    return cityData;
  }

  async function chartEdit(root, user) {
    await ready(user);
    const id = PB.query("id");
    if (ST.state.phase === "locked") return PB.paint(root, `${h.head("Charts", "Birth details", CHARTS)}${locked()}`);
    const existing = id ? ST.state.data.charts.find((c) => c.id === id) : null;
    const hasMe = ST.state.data.charts.some((c) => c.relation === "me" && c.id !== id);
    const i = existing?.input;
    const st = {
      name: existing?.name ?? (PB.query("relation") === "other" || (hasMe && PB.query("relation") !== "me") ? "" : "Me"),
      me: existing ? existing.relation === "me" : PB.query("relation") === "me" || (!hasMe && PB.query("relation") !== "other"),
      date: i?.date ?? "",
      time: i?.time ?? "",
      noTime: !!i && !i.time,
      query: "",
      results: [],
      place: i && typeof i.latitude === "number" ? { label: i.placeLabel || `${i.latitude.toFixed(2)}°, ${i.longitude.toFixed(2)}°`, latitude: i.latitude, longitude: i.longitude, zone: i.zone || null, country: i.country || null } : null,
      override: !!i?.offsetOverridden || (!!i && !i.zone),
      offset: i ? A.birth.offsetLabel(i.utcOffsetMinutes).replace("UTC", "").replace("−", "-") : "",
      problem: null,
      saving: false
    };
    const zonesOk = A.time.zonesWork();
    const fromZone = () => {
      if (!st.place?.zone || !zonesOk || !A.chartInput.parseDate(st.date)) return null;
      const t = st.noTime ? null : A.chartInput.parseTime(st.time);
      return A.birth.offsetForBirth(st.date, t ? A.chartInput.formatTime(t) : null, st.place.zone);
    };
    const part = (name) => root.querySelector(`[data-part="${name}"]`);
    const zoneHtml = () => {
      const z = fromZone();
      const note = z ? A.birth.offsetNote(z) : null;
      const d = A.chartInput.parseDate(st.date);
      return `${z && !st.override ? `${h.cardTitle(A.birth.offsetLabel(z.offsetMinutes))}${h.muted(`Worked out from ${st.place.zone} for that date${!st.noTime && A.chartInput.parseTime(st.time) ? " and time" : ""}, summer time included.`)}${h.notice(note)}` : `${h.field({ id: "astro-offset", label: "UTC offset at the birth", value: st.offset, placeholder: "e.g. +1, -5 or +5:30", attrs: { "data-input": "offset" } })}${zonesOk ? "" : h.notice("This browser can’t look up historical time zones, so enter the offset by hand.")}`}
        ${z ? h.toggle({ id: "astro-override", label: "Set the offset myself", detail: "If the record shows a different clock time (wartime or local time), enter it by hand", checked: st.override, attrs: { "data-change": "override" } }) : ""}
        ${d && d.year < 1890 && st.place ? h.muted(`Before standard time zones, most places kept local mean time. Here that is about ${A.birth.offsetLabel(A.time.localMeanTimeOffset(st.place.longitude))}.`) : ""}
        ${ptx("An hour out moves the rising sign about 15°, often a whole sign. The offset comes from the world time-zone database, which is very good from 1970 and good before; if a family record says otherwise, trust the record.", "sp-caption")}`;
    };
    const placeHtml = () =>
      st.place
        ? `${h.cardTitle(st.place.label)}${h.muted(`${st.place.latitude.toFixed(3)}°, ${st.place.longitude.toFixed(3)}°${st.place.zone ? ` · ${st.place.zone}` : ""}`)}${h.actions([h.button("Choose another place", { variant: "text", attrs: { "data-action": "clear-place" } })])}`
        : `${h.field({ id: "astro-place", label: "Search for the town or city", value: st.query, placeholder: "e.g. Manchester, or Springfield, Illinois", attrs: { "data-input": "query", autocomplete: "off" } })}
          <div data-part="results">${resultsHtml()}</div>
          ${h.details(
            "Enter coordinates instead",
            `<div class="sp-grid-2">${h.field({ id: "astro-lat", label: "Latitude", placeholder: "e.g. 51.51 (south is negative)" })}${h.field({ id: "astro-lon", label: "Longitude", placeholder: "e.g. -0.13 (west is negative)" })}</div>${h.actions([h.button("Use these coordinates", { variant: "ghost", attrs: { "data-action": "coords" } })])}${h.muted("With coordinates you’ll need to enter the UTC offset at the birth yourself.")}`
          )}`;
    const resultsHtml = () =>
      st.results.length
        ? `<div class="astro-rows">${st.results.map((p, k) => row({ glyph: "⌖", title: p.name, detail: [p.region, p.country].filter(Boolean).join(", "), attrs: { "data-action": "choose", "data-index": k } })).join("")}</div>`
        : st.query.trim().length >= 2
          ? h.muted("No town by that name in the list (towns of 15,000 people or more). Try the nearest larger town, or enter the coordinates.")
          : "";
    const draw = () => {
      PB.paint(
        root,
        [
          h.head("Charts", existing ? `${existing.name}’s birth details` : "A new chart", CHARTS),
          h.muted("Birth details are private: encrypted in this browser, and only sent to your account if you choose a passphrase (see How your charts are kept)."),
          h.card(`${h.label("Whose chart")}${h.field({ id: "astro-name", label: "Name", value: st.name, placeholder: "e.g. Me, or a friend’s name", attrs: { "data-input": "name" } })}${h.chips([h.chip("Mine", { pressed: st.me, attrs: { "data-action": "me", "data-value": "1" } }), h.chip("Someone else’s", { pressed: !st.me, attrs: { "data-action": "me", "data-value": "0" } })])}${st.me ? "" : h.muted("Only add someone’s chart with their blessing. It stays with you; nobody else can see it.")}`),
          h.card(`${h.label("When")}${h.field({ id: "astro-date", label: "Birth date", type: "date", value: st.date, attrs: { "data-input": "date", min: "1800-01-01", max: "2050-12-31" } })}${h.toggle({ id: "astro-notime", label: "I don’t know the time", detail: "The planets will still be right; there are no houses or rising sign", checked: st.noTime, attrs: { "data-change": "notime" } })}${st.noTime ? "" : `${h.field({ id: "astro-time", label: "Birth time", type: "time", value: st.time, attrs: { "data-input": "time" } })}${ptx("Use the clock time on the birth certificate if you can. Four minutes of clock time move the Ascendant about a degree.", "sp-caption")}`}`),
          h.card(`${h.label("Where")}<div data-part="place">${placeHtml()}</div>${h.caption("Places: GeoNames (geonames.org), licensed CC BY 4.0.")}`),
          h.card(`${h.label("Time zone at the birth")}<div data-part="zone">${zoneHtml()}</div>`),
          `<div data-part="problem">${h.notice(st.problem)}</div>`,
          h.actions([h.button(st.saving ? "Saving…" : "Save", { attrs: { "data-action": "save", disabled: st.saving } }), existing ? h.button("Delete this chart", { variant: "text", attrs: { "data-action": "remove" } }) : ""])
        ].join("")
      );
    };
    let searchToken = 0;
    PB.bind(root, {
      input: {
        name: (el) => (st.name = el.value),
        date: (el) => {
          st.date = el.value;
          part("zone").innerHTML = zoneHtml();
        },
        time: (el) => {
          st.time = el.value;
          part("zone").innerHTML = zoneHtml();
        },
        offset: (el) => (st.offset = el.value),
        query: async (el) => {
          st.query = el.value;
          const mine = ++searchToken;
          if (st.query.trim().length < 2) {
            st.results = [];
            part("results").innerHTML = resultsHtml();
            return;
          }
          try {
            const data = await cities();
            if (mine !== searchToken) return;
            st.results = A.places.searchPlaces(data, st.query, 8);
          } catch (error) {
            st.results = [];
            part("results").innerHTML = h.notice(error.message);
            return;
          }
          part("results").innerHTML = resultsHtml();
        }
      },
      change: {
        notime: (el) => {
          st.noTime = el.checked;
          draw();
        },
        override: (el) => {
          st.override = el.checked;
          const z = fromZone();
          if (st.override && z) st.offset = A.birth.offsetLabel(z.offsetMinutes).replace("UTC", "").replace("−", "-");
          part("zone").innerHTML = zoneHtml();
        }
      },
      click: {
        me: (el) => {
          st.me = el.dataset.value === "1";
          draw();
        },
        choose: (el) => {
          const p = st.results[Number(el.dataset.index)];
          st.place = { label: A.places.placeLabel(p), latitude: p.latitude, longitude: p.longitude, zone: p.zone, country: p.countryCode };
          st.query = "";
          st.results = [];
          draw();
        },
        "clear-place": () => {
          st.place = null;
          draw();
        },
        coords: () => {
          const la = PB.parseNumber(root.querySelector("#astro-lat")?.value);
          const lo = PB.parseNumber(root.querySelector("#astro-lon")?.value);
          if (!PB.validPlace(la, lo)) {
            st.problem = "Latitude runs from -90 to 90 and longitude from -180 to 180. South and west are negative.";
            part("problem").innerHTML = h.notice(st.problem);
            return;
          }
          st.place = { label: `${la.toFixed(2)}°, ${lo.toFixed(2)}°`, latitude: la, longitude: lo, zone: null, country: null };
          st.override = true;
          draw();
        },
        save: async () => {
          const fail = (text) => {
            st.problem = text;
            part("problem").innerHTML = h.notice(text);
          };
          const d = A.chartInput.parseDate(st.date);
          if (!d) return fail("Enter the birth date.");
          if (d.year < 1800 || d.year > 2050) return fail("Birth dates from 1800 to 2050 work with these planet tables.");
          const t = st.noTime || !st.time.trim() ? null : A.chartInput.parseTime(st.time);
          if (!st.noTime && st.time.trim() && !t) return fail("Enter the time as hours and minutes, or choose “I don’t know the time”.");
          const z = fromZone();
          const minutes = st.override || !z ? A.chartInput.parseOffset(st.offset) : z.offsetMinutes;
          if (minutes === null) return fail(st.place ? "Enter the UTC offset at the birth, like +1, -5 or +5:30." : "Choose the birthplace, or enter the UTC offset at the birth, like +1 or -5.");
          const input = {
            date: `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`,
            time: t ? A.chartInput.formatTime(t) : "",
            utcOffsetMinutes: minutes,
            offsetFromDevice: false,
            zone: st.place?.zone ?? null,
            offsetOverridden: st.override,
            country: st.place?.country ?? null,
            latitude: st.place?.latitude ?? null,
            longitude: st.place?.longitude ?? null,
            placeLabel: st.place?.label ?? null
          };
          try {
            const newId = await ST.save({ id: existing?.id, name: st.name.trim() || (st.me ? "Me" : "A chart"), relation: st.me ? "me" : "other", input, note: existing?.note });
            window.location.href = url.chart(newId);
          } catch (error) {
            fail(error.message || "Couldn’t save just now.");
          }
        },
        remove: async () => {
          if (!existing || !PB.confirmAction(`Delete ${existing.name}’s chart?`, "The birth details are deleted from this browser, and from your account if you keep your charts there.")) return;
          await ST.remove(existing.id);
          window.location.href = CHARTS.href;
        }
      }
    });
    draw();
  }

  // ── Synastry ──────────────────────────────────────────────────────────────

  async function synastryPage(root, user) {
    const s = await ready(user);
    const st = { a: null, b: null, picked: null };
    const draw = () => {
      cardSeq = 0;
      const usable = castAll(s).filter((c) => c.chart);
      const a = usable.find((c) => c.saved.id === st.a) || usable[0] || null;
      const b = usable.find((c) => c.saved.id === st.b && c.saved.id !== a?.saved.id) || usable.find((c) => c.saved.id !== a?.saved.id) || null;
      const res = a && b ? A.forecast.synastry(a.chart, b.chart) : null;
      const outer = b ? b.chart.positions.filter((p) => !["Descendant", "IC", "South Node", "Part of Fortune", "Lilith"].includes(p.point)) : null;
      const flipped = res ? res.aspects.map((x) => ({ ...x, a: x.b, b: x.a })) : [];
      st.flipped = flipped;
      PB.paint(
        root,
        [
          h.head("Charts", "Synastry", CHARTS),
          ptx("Synastry compares two charts: the aspects one person’s planets make to the other’s, and where each falls in the other’s houses. It describes dynamics, not destiny."),
          usable.length < 2
            ? h.card(h.p("Add a second chart to compare. Only add someone’s chart with their blessing."))
            : [
                h.label("First chart (inner wheel)"),
                h.chips(usable.map((c) => h.chip(c.saved.name, { pressed: a?.saved.id === c.saved.id, attrs: { "data-action": "a", "data-id": c.saved.id } }))),
                h.label("Second chart (outer ring)"),
                h.chips(usable.filter((c) => c.saved.id !== a?.saved.id).map((c) => h.chip(c.saved.name, { pressed: b?.saved.id === c.saved.id, attrs: { "data-action": "b", "data-id": c.saved.id } }))),
                res ? `<div class="astro-wheel-wrap">${W.chart(A, a.chart, { size: Math.min((root.clientWidth || 360) - 8, 440), outer, aspects: flipped, outerLabel: b.saved.name })}</div>` : "",
                res ? h.muted(`${a.saved.name} inside, ${b.saved.name} in the outer ring. ${res.tally.soft} easy contacts, ${res.tally.hard} challenging, ${res.tally.blend} conjunctions.`) : "",
                `<div data-picked>${st.picked ? aspectCard(st.picked) : ""}</div>`,
                res ? h.section("Contacts, closest first", `<div class="astro-rows">${res.aspects.slice(0, 25).map((x, k) => row({ glyph: A.aspects.aspectDef(x.aspect).symbol, title: `${a.saved.name}’s ${x.a} ${x.aspect} ${b.saved.name}’s ${x.b}`, detail: `${x.orb.toFixed(1)}°`, attrs: { "data-action": "pick", "data-index": k } })).join("")}</div>`) : "",
                res && res.aInB.length ? h.card(`${h.label(`${a.saved.name}’s planets in ${b.saved.name}’s houses`)}${res.aInB.map((o) => ptx(`${o.point} in the ${ordinal(o.house)}`)).join("")}`) : "",
                res && res.bInA.length ? h.card(`${h.label(`${b.saved.name}’s planets in ${a.saved.name}’s houses`)}${res.bInA.map((o) => ptx(`${o.point} in the ${ordinal(o.house)}`)).join("")}`) : ""
              ].join(""),
          termChips(["synastry", "aspects", "house-7", "venus", "mars"])
        ].join("")
      );
      st.res = res;
    };
    root.addEventListener("click", (event) => {
      const el = event.target.closest("[data-wheel-point],[data-wheel-outer],[data-wheel-sign],[data-wheel-house],[data-wheel-aspect]");
      if (!el) return;
      if (el.dataset.wheelSign) T?.open(termId(el.dataset.wheelSign));
      else if (el.dataset.wheelPoint || el.dataset.wheelOuter) T?.open(termId(el.dataset.wheelPoint || el.dataset.wheelOuter));
      else if (el.dataset.wheelHouse) T?.open(`house-${el.dataset.wheelHouse}`);
      else if (el.dataset.wheelAspect) {
        const x = st.flipped[Number(el.dataset.wheelAspect)];
        st.picked = { ...x, a: x.b, b: x.a };
        draw();
      }
    });
    PB.bind(root, {
      click: {
        a: (el) => {
          st.a = el.dataset.id;
          draw();
        },
        b: (el) => {
          st.b = el.dataset.id;
          draw();
        },
        pick: (el) => {
          st.picked = st.res.aspects[Number(el.dataset.index)];
          draw();
        },
        explain: (el) => explainToggle(el, root)
      }
    });
    draw();
  }

  // ── Planetary hours ───────────────────────────────────────────────────────

  async function hoursPage(root) {
    const span = (a, b) => `${timeOfDay(a)} – ${timeOfDay(b)}`;
    const H = A.cosmicHours;
    const G = A.guides.PLANET_GUIDES;
    const DAY_RULER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const st = { pick: H.HOUR_PLANETS.includes(PB.query("planet")) ? PB.query("planet") : null, tapped: null };
    const mins = (ms) => {
      const m = Math.max(0, Math.round(ms / 60000));
      return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
    };
    const draw = () => {
      const now = new Date();
      const place = PB.getPlace();
      const hours = place ? A.hours.planetaryHours(now, place) : null;
      const cur = hours ? hours.find((x) => H.isNow(x, now)) : null;
      const next = cur ? hours[hours.indexOf(cur) + 1] : null;
      const ruler = hours ? hours[0].planet : DAY_RULER[now.getDay()];
      const voc = H.vocForDay(H.startOfLocalDay(now));
      const nextVoc = voc.length ? null : B.voidOfCourse.voidOfCourse(H.startOfLocalDay(now));
      const picked = st.pick && place ? H.nextHoursOf(st.pick, now, place, 3) : [];
      const onDay = st.pick && place ? H.nextHourOnItsDay(st.pick, now, place) : null;
      const tapped = st.tapped != null && hours ? hours[st.tapped] : null;
      PB.paint(
        root,
        [
          h.head("Cosmic & celestial", "Planetary days and hours", HUB),
          ptx("Each day of the week belongs to one of the seven classical planets, and day and night are each split into twelve planetary hours, longer or shorter with the seasons, ruled in turn in the Chaldean order from the planet of the day.", "sp-caption"),
          !place ? h.card(PB.placeForm("hours", { intro: "Planetary hours run from your sunrise and sunset, so they need your place. It stays in this browser, rounded to about a kilometre." })) : "",
          place && !hours ? h.card(h.p("The sun doesn’t rise and set today where you are, so there are no planetary hours. They return when sunrise does.")) : "",
          h.card(`${h.label(`Today is ${G[ruler].day}`)}<h2 class="pb-card-title">${tx(`${A.signs.POINT_GLYPH[ruler]} The day of ${ruler === "Sun" || ruler === "Moon" ? `the ${ruler}` : ruler}`)}</h2>${h.p(G[ruler].suits)}${h.actions([h.button(`${ruler}: the full guide`, { variant: "text", href: url.planet(ruler) })])}`, { gold: true }),
          hours ? `<div class="astro-wheel-wrap">${W.hours(A, hours, now, { size: Math.min((root.clientWidth || 340) - 8, 360) })}</div>` : "",
          tapped
            ? h.card(`<h2 class="pb-card-title">${tx(`The hour of ${tapped.planet}`)}</h2>${h.muted(`${span(tapped.start, tapped.end)}${tapped.night ? " · night" : " · day"}${H.isNow(tapped, now) ? ` · ${mins(tapped.end - now)} left` : tapped.start > now ? ` · in ${mins(tapped.start - now)}` : ""}`)}${h.p(H.HOUR_SUITS[tapped.planet].suits)}${tapped.start > now ? h.actions([h.button("Plan a working then (with a reminder)", { variant: "ghost", href: url.planner(tapped.start, tapped.planet) })]) : ""}`)
            : "",
          cur ? h.card(`${h.label("Now")}<h2 class="pb-card-title">${tx(`The hour of ${cur.planet}`)}</h2>${h.muted(`${span(cur.start, cur.end)}${cur.night ? " · night" : ""} · ${mins(cur.end - now)} left`)}${h.p(H.HOUR_SUITS[cur.planet].suits)}${next ? h.muted(`Next: ${next.planet}, for ${H.HOUR_SUITS[next.planet].short}, in ${mins(next.start - now)}.`) : ""}`, { gold: true }) : "",
          place
            ? h.section(
                "Find the next hour of",
                `${h.chips(H.HOUR_PLANETS.map((p) => h.chip(`${A.signs.POINT_GLYPH[p]} ${p}`, { pressed: st.pick === p, a11y: `Next hours of ${p}`, attrs: { "data-action": "pick", "data-planet": p, "data-focus": `pick-${p}` } })))}${
                  st.pick
                    ? h.card(
                        `<h2 class="pb-card-title">${tx(`${st.pick} hours`)}</h2>${h.muted(H.HOUR_SUITS[st.pick].suits)}${picked.length ? picked.map((x) => `<p class="${H.isNow(x, now) ? "pb-gold" : ""}">${esc(`${H.isNow(x, now) ? "Now" : relativeDay(now, x.start)}: ${span(x.start, x.end)}`)}</p>`).join("") : h.muted("None in the coming week where you are.")}${
                          onDay ? `${ptx(`On its own day (${G[st.pick].day}), the strongest time the old books give: ${H.isNow(onDay, now) ? "now" : relativeDay(now, onDay.start)}, ${span(onDay.start, onDay.end)}.`)}${onDay.start > now ? h.actions([h.button(`Plan a working at the next ${st.pick} hour on ${G[st.pick].day} (with a reminder)`, { variant: "ghost", href: url.planner(onDay.start, st.pick) })]) : ""}` : ""
                        }${h.actions([h.button(`${st.pick}: the full guide`, { variant: "text", href: url.planet(st.pick) })])}`
                      )
                    : ""
                }`
              )
            : "",
          h.section(
            "The Moon today",
            h.card(
              `${voc.length ? voc.map((v) => ptx(`${now >= v.start && now < v.end ? "Void of course now" : "Void of course"}: ${relativeDay(now, v.start)} ${timeOfDay(v.start)} until ${relativeDay(now, v.end)} ${timeOfDay(v.end)}, when it enters ${v.nextSign}.`)).join("") : ptx(nextVoc ? `The Moon isn’t void of course today. Next: ${relativeDay(now, nextVoc.start)} at ${timeOfDay(nextVoc.start)}, until it enters ${nextVoc.nextSign} at ${timeOfDay(nextVoc.end)}.` : "The Moon isn’t void of course today.")}${h.muted(A.meanings.VOID_OF_COURSE_MEANING)}`
            )
          ),
          hours
            ? [false, true]
                .map((night) =>
                  h.section(
                    night ? "Night hours, sunset to sunrise" : "Day hours, sunrise to sunset",
                    `<ul class="pb-timeline">${hours
                      .filter((x) => x.night === night)
                      .map((x) => {
                        const on = H.isNow(x, now);
                        const tone = on ? "pb-gold" : x.end <= now ? "pb-past" : "";
                        return `<li class="${on ? "is-now" : ""}" aria-label="${esc(`${on ? "Now. " : ""}${x.planet} hour, ${span(x.start, x.end)}. Good for ${H.HOUR_SUITS[x.planet].short}.`)}"><span class="pb-time ${tone}" aria-hidden="true">${esc(timeOfDay(x.start))}</span><span class="pb-what" aria-hidden="true"><span class="pb-planet ${tone}">${esc(`${A.signs.POINT_GLYPH[x.planet]} ${x.planet}`)}</span><span class="sp-caption">${esc(H.HOUR_SUITS[x.planet].short)}</span></span>${on ? '<span class="pb-now" aria-hidden="true">Now</span>' : ""}</li>`;
                      })
                      .join("")}</ul>`
                  )
                )
                .join("") + h.muted(`Worked out for ${place.latitude.toFixed(2)}°, ${place.longitude.toFixed(2)}° from your real sunrise and sunset.`)
            : "",
          place ? h.details("Change your place", PB.placeForm("hours", { place })) : "",
          h.section("The seven planets", h.list(H.HOUR_PLANETS.map((p) => h.row({ href: url.planet(p), title: `${A.signs.POINT_GLYPH[p]} ${p} · ${G[p].day}`, detail: H.HOUR_SUITS[p].short })))),
          termChips(["planetary-days", "planetary-hours", "chaldean-order", "void-of-course"]),
          h.list([h.row({ href: "/practice/cosmic/timing/", title: "Find a good time", detail: "The spell timing advisor: the best hours ahead for a working, and why" }), h.row({ href: "/rituals/planner/", title: "The ritual planner", detail: "Find the night, then the hour" }), h.row({ href: "/today/sky/", title: "The sky today", detail: "Planets, retrogrades, eclipses and your place" })])
        ].join("")
      );
    };
    const pickHour = (el) => {
      st.tapped = Number(el.dataset.wheelHour);
      draw();
    };
    root.addEventListener("click", (event) => {
      const el = event.target.closest("[data-wheel-hour]");
      if (el) pickHour(el);
    });
    root.addEventListener("keydown", (event) => {
      const el = event.target.closest("[data-wheel-hour]");
      if (el && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        pickHour(el);
      }
    });
    PB.bind(root, {
      click: {
        pick: (el) => {
          st.pick = st.pick === el.dataset.planet ? null : el.dataset.planet;
          draw();
        },
        ...PB.placeHandlers(root, "hours", draw)
      }
    });
    draw();
    setInterval(draw, 60000);
  }

  // ── A planet's guide ──────────────────────────────────────────────────────

  async function planetPage(root) {
    const ORDER = A.guides.GUIDE_ORDER;
    const planet = ORDER.includes(PB.query("planet")) ? PB.query("planet") : "Sun";
    const g = A.guides.PLANET_GUIDES[planet];
    const place = PB.getPlace();
    const next = place ? A.cosmicHours.nextHourOnItsDay(planet, new Date(), place) : null;
    const lib = window.TraditionalLibrary || {};
    const libHref = (name) => {
      for (const type of ["herb", "crystal", "deity"]) {
        const hit = Object.entries(lib[type] || {}).find(([, v]) => v && v.DisplayName === name);
        if (hit) return links.library(`traditional:${type}:${hit[0]}`);
      }
      return null;
    };
    const chip = (n) => (libHref(n) ? `<a class="sp-chip" href="${esc(libHref(n))}">${esc(n)}</a>` : h.tag(n));
    const fromLibrary = [];
    for (const type of ["herb", "crystal", "candle"]) for (const v of Object.values(lib[type] || {})) if (v && String(v.Planet || "").includes(planet)) fromLibrary.push(v.DisplayName);
    const exalt = A.signs.EXALTATION[planet];
    const journeys = ["aphrodite", "apollo", "artemis", "freyja", "frigg", "hekate", "hermes", "jupiter", "mars", "mercury", "odin", "ra", "saturn", "selene", "sol", "thor", "thoth", "tyr", "venus", "zeus", "diana", "sekhmet", "perun"];
    cardSeq = 0;
    root.innerHTML = [
      h.head("The seven planets", `${A.signs.POINT_GLYPH[planet]} ${planet}`, { href: "/practice/cosmic/hours/", label: "Planetary hours" }),
      h.chips(ORDER.map((p) => `<a class="sp-chip" href="${esc(url.planet(p))}"${p === planet ? ' aria-current="page"' : ""}>${esc(p)}</a>`)),
      explainCard({ title: `${planet} in astrology`, entry: A.glossary.term(termId(planet)), terms: [termId(planet), "planetary-days", "planetary-hours"] }),
      h.card(`${h.label("Its nature")}${ptx(g.nature)}${ptx(`Rules ${A.signs.domiciles(planet).join(" and ")}${exalt ? `; exalted in ${exalt}` : ""}. ${g.rules}`)}${h.muted(`The body: ${g.body}`)}`, { gold: true }),
      h.card(`${h.label(`Its day: ${g.day}`)}${h.p(g.dayNames)}${next ? ptx(`Next hour of ${planet} on ${g.day}: ${shortDate(next.start)}, ${timeOfDay(next.start)} – ${timeOfDay(next.end)}.`) : h.muted("Add your place (The sky today) to see its hours where you are.")}${h.actions([h.button(`Find a ${planet} hour`, { variant: "ghost", href: url.hours(planet) }), next ? h.button("Plan a working then", { variant: "text", href: url.planner(next.start, planet) }) : ""])}`),
      h.card(
        `${h.label("What it suits")}${h.p(g.suits)}${h.muted(`Less suited to: ${g.avoid}`)}${
          // The spell timing advisor for this planet's work (js/core/timing.js, where the page loads it).
          window.SaltCore.timing
            ? `${h.muted("Find a good time for")}${h.chips(window.SaltCore.timing.timing.intentsForPlanet(planet).map((i) => `<a class="sp-chip" href="/practice/cosmic/timing/?intent=${encodeURIComponent(i.key)}" aria-label="${esc(`Find a good time for ${i.label.toLowerCase()}`)}">${esc(i.label)}</a>`))}`
            : ""
        }${h.actions([
          // The spell builder, set for this planet's day (app: planet.tsx "Build a spell for …").
          h.button(`Build a spell for ${g.day}`, {
            variant: "ghost",
            href: `/rituals/spell/?planet=${encodeURIComponent(planet)}${window.SaltCore.timing && window.SaltCore.timing.timing.intentsForPlanet(planet)[0] ? `&intent=${encodeURIComponent(window.SaltCore.timing.timing.intentsForPlanet(planet)[0].key)}` : ""}`
          })
        ])}`
      ),
      h.card(
        `${h.label("Correspondences")}${h.p(`Metal: ${g.metal}`)}${h.p(`Colours: ${g.colours.join(", ")}`)}${h.p(`Incense: ${g.incense.join(", ")}`)}${h.p(`Number and square: ${g.square}`)}${h.p(`Angel: ${g.angel.name} (${g.angel.source}). Intelligence: ${g.intelligence} (Agrippa).`)}${h.label("Herbs")}${h.chips(g.herbs.map(chip))}${h.label("Stones")}${h.chips(g.stones.map(chip))}${fromLibrary.length ? `${h.label(`Everything in the Living Library under ${planet}`)}${h.chips(fromLibrary.slice(0, 24).map(chip))}` : ""}`
      ),
      h.section(
        "Gods tied to it",
        g.deities
          .map((d) => {
            const slug = d.name.toLowerCase().replace(/[^a-z]/g, "");
            return h.card(`${h.cardTitle(d.name)}${h.muted(d.tradition)}${deityLinkTag(d)}${h.p(d.note)}${h.actions([libHref(d.name) ? h.button("In the Living Library", { variant: "ghost", href: libHref(d.name) }) : "", journeys.includes(slug) ? h.button("Dedication journey", { variant: "text", href: `/rituals/journeys/?id=deity-${slug}` }) : ""])}`);
          })
          .join("")
      ),
      h.muted(`Sources: ${g.sourcing} The gods are not interchangeable: each has their own tradition and is approached through it. An ancient link is attested in antiquity or the tradition’s own sources; a modern link was made in modern practice.`),
      termChips(["planetary-days", "planetary-hours", "chaldean-order", "rulership", "dignity"]),
      h.list([h.row({ href: links.premadeFor("cosmic"), title: "Cosmic workings", detail: "Premade rituals and spells for the planets" })])
    ].join("");
    PB.bind(root, { click: { explain: (el) => explainToggle(el, root) } });
  }

  // ── Learn astrology ───────────────────────────────────────────────────────

  async function learnPage(root, user) {
    await ready(user);
    const G = A.glossary;
    const st = { query: "" };
    const focus = PB.query("term") ? G.term(PB.query("term")) : null;
    const termRow = (e) => `<button type="button" class="astro-row" data-astro-term="${esc(e.id)}"><span class="astro-row__glyph" aria-hidden="true">${esc(e.symbol || "✦")}</span><span class="astro-row__text"><span class="astro-row__title">${esc(e.term)}</span><span class="astro-row__detail">${esc(e.simple)}</span></span></button>`;
    const listHtml = () =>
      st.query.trim()
        ? `<div class="astro-rows">${G.searchTerms(st.query).slice(0, 20).map(termRow).join("") || h.muted("Nothing by that name yet.")}</div>`
        : G.CATEGORY_ORDER.map((c, i) => h.details(G.CATEGORY_LABEL[c], `<div class="astro-rows">${G.termsIn(c).map(termRow).join("")}</div>`, { open: i === 0 && !focus })).join("");
    const draw = () => {
      cardSeq = 0;
      PB.paint(
        root,
        [
          h.head("Cosmic & celestial", "Astrology glossary", HUB),
          `<a class="astro-link" href="/practice/cosmic/course/">New to astrology? Take the course, from the very beginning ›</a>`,
          ptx("Everything in a birth chart, explained from the beginning. Start with The basics, then the planets, signs and houses; every underlined word anywhere opens its own explanation."),
          h.muted("Simple gives a sentence or two. Detailed adds the astronomy, the history, how different traditions read it, its use in the craft, and what to take care over."),
          h.chips(["simple", "detailed"].map((l) => h.chip(l === "simple" ? "Simple" : "Detailed", { pressed: (T ? T.level : "simple") === l, attrs: { "data-action": "level", "data-value": l } })), "Explanations everywhere"),
          h.field({ id: "astro-search", label: "Search", value: st.query, placeholder: "e.g. retrograde, Placidus, Scorpio", attrs: { "data-input": "search", autocomplete: "off" } }),
          focus && !st.query ? explainCard({ eyebrow: G.CATEGORY_LABEL[focus.category], title: `${focus.symbol ? `${focus.symbol} ` : ""}${focus.term}`, entry: focus, terms: focus.related || [] }) : "",
          `<div data-part="list">${listHtml()}</div>`,
          `<a class="astro-link" href="/practice/cosmic/charts/">See it all in your own chart ›</a>`,
          h.muted("These are traditional meanings and tools for reflection, not destiny. Astrology has many schools; where they differ, the Detailed explanations say so.")
        ].join("")
      );
    };
    PB.bind(root, {
      input: {
        search: (el) => {
          st.query = el.value;
          root.querySelector('[data-part="list"]').innerHTML = listHtml();
        }
      },
      click: {
        level: async (el) => {
          await T?.setLevel(el.dataset.value);
          draw();
        },
        explain: (el) => explainToggle(el, root)
      }
    });
    draw();
  }

  // ── How charts are kept ───────────────────────────────────────────────────

  async function keepPage(root, user) {
    await ready(user);
    const st = { recovery: null, problem: null, busy: false, progress: null };
    const draw = () => {
      const s = ST.state;
      PB.paint(
        root,
        [
          h.head("Charts", "How your charts are kept", CHARTS),
          h.p("A birth date, time and place are personal: together they can identify someone. So charts are encrypted in your browser before they are stored, with the same encryption as Cycle & Moon (XChaCha20-Poly1305, with a key from your passphrase by scrypt). Charts you add for other people are kept the same way, and are never shared with anyone."),
          st.recovery ? h.card(`${h.label("Your recovery key")}<p class="pb-card-title" style="user-select:all">${esc(st.recovery)}</p>${h.p("Write it down and keep it somewhere safe. If you forget your passphrase, it is the only other way to open your charts. It won’t be shown again.")}${h.actions([h.button("I’ve written it down", { attrs: { "data-action": "done" } })])}`, { gold: true }) : "",
          s.phase === "locked"
            ? h.card(`${h.label("Open your charts in this browser")}${h.field({ id: "astro-pass", label: "Passphrase", type: "password", attrs: { autocomplete: "current-password" } })}${h.actions([h.button(st.busy ? `Opening…${st.progress != null ? ` ${Math.round(st.progress * 100)}%` : ""}` : "Open", { attrs: { "data-action": "unlock", disabled: st.busy } })])}${h.field({ id: "astro-recovery", label: "Or your recovery key", placeholder: "XXXX-XXXX-…" })}${h.actions([h.button("Open with the recovery key", { variant: "ghost", attrs: { "data-action": "recover", disabled: st.busy } })])}`, { gold: true })
            : s.synced
              ? h.card(`${h.label("Kept with your account")}${h.p("Encrypted under your passphrase. Only the encrypted text reaches the server; nobody there can read it. Enter the passphrase once in each browser and on each device.")}${s.sync === "unavailable" ? h.notice("Keeping charts with your account isn’t ready on the server yet. They’re safe in this browser meanwhile.") : ""}${h.actions([h.button("Keep them in this browser only", { variant: "ghost", attrs: { "data-action": "device", disabled: st.busy } })])}`)
              : h.card(
                  `${h.label("In this browser only")}${h.p("Encrypted and kept in this browser. Nothing is sent. Clearing the site’s data deletes them.")}${
                    PB.signedIn()
                      ? `${h.p("To have them in the app and other browsers too, choose a passphrase. It isn’t your account password, and it is never sent.")}${h.field({ id: "astro-new", label: "Passphrase (at least 10 characters)", type: "password", attrs: { autocomplete: "new-password" } })}${h.field({ id: "astro-again", label: "The same again", type: "password", attrs: { autocomplete: "new-password" } })}${h.actions([h.button(st.busy ? `Protecting…${st.progress != null ? ` ${Math.round(st.progress * 100)}%` : ""}` : "Keep with my account", { attrs: { "data-action": "protect", disabled: st.busy } })])}`
                      : h.muted("Sign in to keep them with an account as well.")
                  }`
                ),
          h.notice(st.problem),
          h.section("Delete", h.actions([h.button("Delete all my charts", { variant: "text", attrs: { "data-action": "delete", disabled: st.busy } })])),
          h.muted("Settings like your house system and explanation level are ordinary settings, not birth details, and sync as usual.")
        ].join("")
      );
    };
    const run = async (work) => {
      st.problem = null;
      st.busy = true;
      draw();
      try {
        await work();
      } catch (error) {
        st.problem = error.message || "That didn’t work just now.";
      }
      st.busy = false;
      st.progress = null;
      draw();
    };
    const progress = (p) => {
      st.progress = p;
    };
    PB.bind(root, {
      click: {
        done: () => {
          st.recovery = null;
          draw();
        },
        unlock: () => run(() => ST.unlock(root.querySelector("#astro-pass").value, progress)),
        recover: () => run(() => ST.unlockRecovery(root.querySelector("#astro-recovery").value)),
        protect: () =>
          run(async () => {
            const a = root.querySelector("#astro-new").value;
            if (a !== root.querySelector("#astro-again").value) throw new Error("The two passphrases don’t match.");
            st.recovery = await ST.protect(a, progress);
          }),
        device: () => run(async () => {
          if (PB.confirmAction("Keep charts in this browser only?", "Your account’s encrypted copy is deleted. Other devices keep what they have but stop syncing.")) await ST.keepOnDevice();
        }),
        delete: () => run(async () => {
          if (!PB.confirmAction("Delete every chart?", "All birth details are deleted from this browser and from your account. This can’t be undone.")) return;
          await ST.deleteAll();
          window.location.href = CHARTS.href;
        })
      }
    });
    draw();
    ST.subscribe(draw);
  }

  const VIEWS = {
    "cosmic-hub": hub,
    "cosmic-charts": chartsPage,
    "cosmic-chart": chartPage,
    "cosmic-chart-edit": chartEdit,
    "cosmic-synastry": synastryPage,
    "cosmic-hours": hoursPage,
    "cosmic-planet": planetPage,
    "cosmic-learn": learnPage,
    "cosmic-course": (root, user) => window.SaltAstroCourse && window.SaltAstroCourse.page(root, user),
    "cosmic-timing": (root, user) => window.SaltTiming && window.SaltTiming.page(root, user),
    "cosmic-keep": keepPage
  };
  const view = document.querySelector("[data-page-root]")?.getAttribute("data-view");
  if (VIEWS[view]) {
    if (!A || !ST) {
      const root = document.querySelector("[data-page-root]");
      if (root) root.innerHTML = '<p class="sp-notice">This page couldn’t load its tools. Check your connection and refresh.</p>';
    } else PB.start((root, user) => VIEWS[view](root, user));
  }
})();
