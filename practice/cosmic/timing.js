/*
 * The spell timing advisor on the website (/practice/cosmic/timing/), as the
 * app's rituals/craft/cosmic/timing.tsx: say what a working is for, and see
 * the best times over the next week, month or three months, each with a score
 * and the reasons behind it. The scoring is the app's own
 * (app/src/lib/craft/cosmic/timing.ts, built into js/core/timing.js); your
 * calendars and deities come from settings, your place from this browser, and
 * your birth chart (optional) from the chart vault while it is open here
 * (practice/cosmic/astro-store.js). Choosing a time sets a ritual for then:
 * a new one in your template editor, one of your own rituals, or a gathering
 * in a coven you lead rituals in (rituals/js/set-ritual.js carries the time),
 * or just the ritual planner with it filled in. Opened for a plan, a template
 * or a working, it moves or plans that one in the planner instead.
 *
 * Links in: ?intent= (the advisor's or the planner's key), &moon= and
 * &weekday= (a premade working's own), &title=, &days=, and &planId=,
 * &templateId=, &fromSpell=, &premade= passed on to the planner.
 */
(function (global) {
  "use strict";

  const PB = global.PracticeB;
  const HUB = { href: "/practice/cosmic/", label: "Cosmic & celestial" };
  const SPAN_WORDS = { 7: "the next week", 30: "the next month", 90: "the next three months" };

  /** Draws the page into `root` (practice/cosmic/cosmic.js calls it, as the "cosmic-timing" view). */
  async function page(root, user) {
    const C = global.SaltCore && global.SaltCore.timing;
    const ST = global.SaltAstroStore;
    const T = global.SaltAstroTerms;
    if (!PB || !C) {
      root.innerHTML = '<p class="sp-notice">This page couldn’t load its tools. Check your connection and refresh.</p>';
      return;
    }
    const { h } = PB;
    const esc = h.esc;
    const X = C.timing;
    const tx = (text) => (T ? T.html(text) : esc(text));
    const termChips = (ids) => {
      const A = global.SaltCore.astro;
      if (!A || !A.glossary) return "";
      const entries = ids.map((id) => A.glossary.term(id)).filter(Boolean);
      return entries.length
        ? `<p class="sp-caption">What these mean</p>${h.chips(entries.map((e) => `<button type="button" class="sp-chip" data-astro-term="${esc(e.id)}">${esc(`${e.symbol ? `${e.symbol} ` : ""}${e.term}`)}</button>`))}`
        : "";
    };

    const q = (name) => PB.query(name);
    const passOn = ["planId", "templateId", "fromSpell", "premade"].filter((k) => q(k));
    const st = {
      intentKey: X.anyIntent(q("intent"))?.key ?? null,
      days: [7, 30, 90].includes(Number(q("days"))) ? Number(q("days")) : 30,
      levels: {},
      smallHours: false,
      now: new Date(),
      settings: {},
      advice: null,
      key: "",
      open: null,
      mine: null
    };
    // Opened for a particular plan, template or working: plan that one, as before.
    const SR = global.SaltSetRitual;
    const setting = !!SR && !["planId", "templateId", "fromSpell", "premade"].some((k) => q(k));
    const windows = new Map();

    function intent() {
      const base = X.anyIntent(st.intentKey);
      if (!base) return null;
      // A working's own moon and weekday shape the intent it came with.
      if (base.key !== X.anyIntent(q("intent"))?.key) return base;
      const weekday = q("weekday");
      return X.shapeIntent(base, { moon: q("moon") ? q("moon").split(",") : null, weekday: weekday != null && weekday !== "" ? Number(weekday) : null });
    }

    function myChart() {
      if (!ST || ST.state.phase !== "open") return null;
      const saved = ST.myChart();
      return saved ? { saved, chart: C.chart.natalChart(saved.input) } : null;
    }

    function plannerHref(w) {
      const { date, time } = X.windowPlanFields(w, new Date());
      const i = intent();
      const params = new URLSearchParams({ date, time });
      if (w.hourPlanet) params.set("hour", w.hourPlanet);
      if (i && i.plannerKey) params.set("intention", i.plannerKey);
      for (const k of passOn) params.set(k, q(k));
      return `/rituals/planner/?${params}`;
    }

    const partsHtml = (w) =>
      `<ul class="pb-parts">${w.parts
        .map(
          (p) =>
            `<li><span class="pb-points${p.points < 0 ? " is-against" : ""}" aria-hidden="true">${esc(X.pointsText(p.points))}</span><span><span class="pb-part__label">${esc(p.label)}</span><span class="sp-caption">${tx(p.note)}</span></span><span class="pr-visually-hidden">${esc(`${p.label}, ${X.pointsText(p.points)}.`)}</span></li>`
        )
        .join("")}</ul>`;

    // "Set a ritual for then": the time, its reason and the intent, for the builders.
    function setFor(w) {
      const { date, time } = X.windowPlanFields(w, new Date());
      const i = intent();
      return { date, time, hour: w.hourPlanet || null, intent: i ? i.key : null, plannerKey: i ? i.plannerKey : null, label: i ? i.label : null, why: w.why };
    }

    function chooserHtml(w) {
      const set = setFor(w);
      const query = SR.toQuery(set);
      const mine = st.mine;
      const own = !user
        ? h.caption("Your own rituals appear here once you sign in.")
        : !mine
          ? h.caption("Looking for your rituals…")
          : mine.templates.length
            ? h.actions(mine.templates.map((t) => h.button(t.title || "Untitled ritual", { variant: "ghost", attrs: { "data-action": "use-template", "data-window": `${w.start.getTime()}`, "data-id": t.id } })))
            : h.caption("You haven’t kept any rituals of your own yet. Build a new ritual for then, and it will be kept for next time.");
      const covens = user && mine ? mine.covens : [];
      return `<div class="pb-set" role="group" aria-label="Set a ritual for then">${h.label("Set a ritual for then")}${h.actions([h.button("Build a new ritual for then", { variant: "primary", href: `/altar/?${query}` })])}<p class="sp-caption">Use one of my rituals</p>${own}${
        covens.length ? h.actions(covens.map((c) => h.button(`Plan it with ${c.name}`, { variant: "ghost", href: `/covens/coven/?c=${encodeURIComponent(c.slug)}&tab=rituals&edit=new&${query}` }))) : ""
      }${h.actions([h.button("Just pick the time in the planner", { variant: "text", href: plannerHref(w) })])}</div>`;
    }

    // Your templates and the covens you lead rituals in, once, when a chooser first opens.
    async function loadMine() {
      if (st.mine || !user || !global.db) return;
      const [templates, covens] = await Promise.all([
        global.db
          .from("ritual_templates")
          .select("id,title")
          .eq("user_id", user.id)
          .neq("status", "archived")
          .order("updated_at", { ascending: false })
          .then((r) => (r.error ? [] : r.data || []), () => []),
        global.CovenData?.covensILead ? global.CovenData.covensILead(user.id).catch(() => []) : Promise.resolve([])
      ]);
      st.mine = { templates, covens };
    }

    function windowCard(w, best) {
      const key = String(w.start.getTime());
      windows.set(key, w);
      const moon = `${w.moon.phase}, ${Math.round(w.moon.illumination * 100)}% lit`;
      return h.card(
        `<h3 class="pb-card-title">${esc(X.windowWhen(w, st.now))}</h3>${h.caption(`${X.scoreWord(w.score)} · ${w.score}${best ? " · the best" : ""} · ${moon}`)}${h.p(w.why)}${h.details("Why", partsHtml(w))}${
          !setting
            ? h.actions([h.button(q("planId") ? "Move the plan to then" : "Plan it then", { variant: "ghost", href: plannerHref(w) })])
            : st.open === key
              ? chooserHtml(w)
              : h.actions([h.button("Set a ritual for then", { variant: "ghost", attrs: { "data-action": "set", "data-window": key, "aria-expanded": "false" } })])
        }`,
        { gold: best }
      );
    }

    function compute() {
      const i = intent();
      if (!i) return null;
      const mine = myChart();
      const key = JSON.stringify([i, st.days, st.levels, st.smallHours, st.now.getTime(), PB.getPlace(), mine && mine.saved.id, st.settings]);
      if (key === st.key) return st.advice;
      st.key = key;
      const keeping = X.keepingFrom(st.settings, st.now, st.days);
      st.advice = { advice: X.adviseTiming(i, { from: st.now, days: st.days, place: PB.getPlace(), levels: st.levels, smallHours: st.smallHours, keeping, chart: mine && mine.chart }), keeping, mine };
      return st.advice;
    }

    function draw() {
      const i = intent();
      const place = PB.getPlace();
      const result = compute();
      const advice = result && result.advice;
      const what = q("title");
      const changed = X.FACTORS.some((f) => X.levelOf(st.levels, f.key) !== 2) || st.smallHours;
      const keeping = result ? result.keeping : X.keepingFrom(st.settings, st.now, st.days);
      const mine = result ? result.mine : myChart();
      const festivals = [...new Set(keeping.festivals.map((f) => f.name))].slice(0, 4);
      const phase = ST ? ST.state.phase : "empty";

      const nowCard =
        advice && advice.now
          ? h.card(
              `${h.label(advice.goodEnoughNow ? "Good enough now" : "Right now")}<h2 class="pb-card-title">${esc(`${X.scoreWord(advice.now.score)} · ${advice.now.score}`)}</h2>${h.p(advice.now.why)}${h.muted(
                advice.goodEnoughNow
                  ? "Now is close to the best in this span. If the need is real, there’s no need to wait."
                  : advice.windows[0]
                    ? `The best time in this span scores ${advice.windows[0].score}. Now will do if it has to, but waiting gives the working more behind it.`
                    : "Now will do if it has to."
              )}${h.details("Why", partsHtml(advice.now))}`,
              { gold: advice.goodEnoughNow }
            )
          : "";

      PB.paint(
        root,
        [
          h.head("Cosmic & celestial", "Find a good time", HUB),
          h.muted(what ? `For “${what}”: the best times ahead from the moon, the planets, and what you keep.` : "Say what a working is for, and see the best times ahead from the moon, the planets, and what you keep."),
          h.section(
            "What is it for?",
            `${h.chips(X.TIMING_INTENTS.map((x) => h.chip(x.label, { pressed: st.intentKey === x.key, attrs: { "data-action": "intent", "data-key": x.key, "data-focus": `intent-${x.key}` } })), "What is it for?")}${i ? h.muted(i.why) : ""}`
          ),
          h.section(
            "How far ahead?",
            h.chips(
              X.TIMING_SPANS.map((d) => h.chip(d === 7 ? "The next week" : d === 30 ? "The next month" : "The next three months", { pressed: st.days === d, attrs: { "data-action": "days", "data-days": String(d), "data-focus": `days-${d}` } })),
              "How far ahead?"
            )
          ),
          !place ? h.card(PB.placeForm("timing", { intro: "Planetary hours run from your sunrise and sunset, so they need your place. It stays in this browser, rounded to about a kilometre. Without it, the advisor judges three-hour stretches of each day." })) : "",
          !i ? h.muted("Choose what the working is for to see the best times.") : "",
          nowCard,
          advice
            ? h.section(
                `The best times in ${SPAN_WORDS[st.days]}`,
                (advice.windows.length ? advice.windows.map((w, n) => windowCard(w, n === 0)).join("") : h.muted("Nothing stands out in this span. Try a longer one, or turn a factor down.")) +
                  // Not already timing a spell or plan: build one for this intent (app: timing.tsx).
                  (!q("fromSpell") && !q("templateId") && !q("planId") ? h.actions([h.button(`Build a spell for ${i.label.toLowerCase()}`, { variant: "text", href: `/rituals/spell/?intent=${encodeURIComponent(i.key)}` })]) : "")
              )
            : "",
          h.section(
            "What counts",
            `${h.muted(
              `${X.levelOf(st.levels, "hour") === 0 ? "Planetary hours turned off" : place && (!advice || advice.usedHours) ? "Planetary hours from your place" : "No planetary hours (they need your place)"} · ${mine && mine.chart ? `your chart (${mine.saved.name || "yours"})` : "no birth chart"}${festivals.length ? ` · ${festivals.join(", ")}` : ""}${keeping.deities.length ? ` · ${keeping.deities.map((d) => d.name).join(", ")}` : ""}`
            )}${
              phase === "locked"
                ? h.card(`${h.p("Your charts are locked in this browser. Open them to weigh the sky’s touch on your own chart too (optional).")}${h.actions([h.button("Open your charts", { variant: "ghost", href: "/practice/cosmic/charts/" })])}`)
                : phase === "empty"
                  ? h.muted("Add your birth chart under Astrology to weigh transits to it as well. It is optional.")
                  : ""
            }${h.details(
              "Weigh the factors",
              `${h.muted("Turn a factor up, down or off. Nothing is kept: the next visit starts from the usual weights.")}${X.FACTORS.map(
                (f) =>
                  `<div class="pb-factor"><p class="pb-part__label">${esc(f.label)}</p>${h.caption(f.detail)}${h.chips(
                    [0, 1, 2, 3].map((lv) => h.chip(X.LEVEL_LABELS[lv], { pressed: X.levelOf(st.levels, f.key) === lv, a11y: `${f.label}: ${X.LEVEL_LABELS[lv]}`, attrs: { "data-action": "level", "data-factor": f.key, "data-level": String(lv), "data-focus": `lv-${f.key}-${lv}` } })),
                    f.label
                  )}</div>`
              ).join("")}${h.toggle({ id: "timing-small", label: "Include the small hours", detail: "Midnight to six in the morning", checked: st.smallHours, attrs: { "data-change": "small" } })}${
                changed ? h.actions([h.button("Back to the usual weights", { variant: "text", attrs: { "data-action": "reset" } })]) : ""
              }`,
              { open: changed }
            )}${h.actions([h.button("Look again from now", { variant: "text", attrs: { "data-action": "again" } })])}${place ? h.details("Change your place", PB.placeForm("timing", { place })) : ""}`
          ),
          h.card(h.muted(X.TIMING_FRAMING)),
          termChips(["moon-phases", "void-of-course", "planetary-days", "planetary-hours", "retrograde"]),
          h.list([
            h.row({ href: "/practice/cosmic/hours/", title: "Planetary hours", detail: "This hour, and the hours today" }),
            h.row({ href: "/rituals/planner/", title: "The ritual planner", detail: "Find the night, then the hour" }),
            h.row({ href: "/today/sky/", title: "The sky today", detail: "Planets, retrogrades, eclipses and your place" }),
            h.row({ href: "/practice/cosmic/course/?l=astro-magic-timing", title: "Choosing a time", detail: "Learn astrology · electional astrology made simple" })
          ])
        ].join("")
      );
    }

    // Working it out takes a moment over three months, so the page says so first.
    function redraw() {
      if (intent() && st.days === 90) {
        const list = root.querySelector("[data-working]");
        if (!list) root.insertAdjacentHTML("afterbegin", '<p class="sp-muted" data-working role="status">Working it out…</p>');
        setTimeout(draw, 20);
      } else draw();
    }

    PB.bind(root, {
      click: {
        intent: (el) => {
          st.intentKey = st.intentKey === el.dataset.key ? null : el.dataset.key;
          redraw();
        },
        days: (el) => {
          st.days = Number(el.dataset.days);
          redraw();
        },
        level: (el) => {
          st.levels = { ...st.levels, [el.dataset.factor]: Number(el.dataset.level) };
          redraw();
        },
        reset: () => {
          st.levels = {};
          st.smallHours = false;
          redraw();
        },
        again: () => {
          st.now = new Date();
          redraw();
        },
        set: (el) => {
          st.open = el.dataset.window;
          draw();
          root.querySelector(".pb-set a, .pb-set button")?.focus();
          if (!st.mine && user)
            loadMine()
              .catch(() => (st.mine = { templates: [], covens: [] }))
              .then(() => st.open && draw());
        },
        "use-template": (el) => {
          const w = windows.get(el.dataset.window);
          const t = st.mine && st.mine.templates.find((x) => x.id === el.dataset.id);
          if (!w || !t) return;
          const plan = SR.keep(SR.plan({ id: SR.newId(), set: setFor(w), title: t.title, templateId: t.id }));
          global.location.href = SR.planHref(plan);
        },
        ...PB.placeHandlers(root, "timing", redraw)
      },
      change: {
        small: (el) => {
          st.smallHours = el.checked;
          redraw();
        }
      }
    });

    try {
      st.settings = (await global.SaltSettings?.get?.()) || {};
    } catch {
      st.settings = {};
    }
    if (ST) {
      try {
        await ST.load(user?.id ?? null);
      } catch (error) {
        console.warn("[timing] charts", error);
      }
      if (!root._timingSubscribed) {
        root._timingSubscribed = true;
        ST.subscribe(() => root._timingRedraw && root._timingRedraw());
      }
    }
    root._timingRedraw = redraw;
    redraw();
  }

  global.SaltTiming = { page };
})(window);
