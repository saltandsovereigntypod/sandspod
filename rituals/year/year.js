/*
 * A Year and a Day on the website (/rituals/year/…), as the app has it
 * (app/src/app/(tabs)/rituals/year): thirteen moons of study and practice
 * alone, ending in a self-dedication. The rules are the app's own
 * (window.SaltCore.yearday, built from app/src/lib/yearday); the lessons are
 * the coven courses', loaded on demand (js/core/course-programs.json).
 *
 * Views, as query strings on one page:
 *   (none)               the chooser, or the year's moons
 *   ?moon=<n>            one moon
 *   ?lesson=<id>[&moon=<n>]  a lesson
 *   ?view=day            the day of dedication
 *
 * Progress: one craft entry in `craft_entries`, collection
 * "yearday.progress", data exactly as app/src/lib/yearday/progress.ts keeps
 * it (window.SaltCraft; guests keep it in this browser). A website can't
 * nudge you, so the reminders come as a calendar file (.ics).
 */
(function (global, factory) {
  const pure = factory();
  if (typeof module === "object" && module.exports) module.exports = pure;
  else pure.mount(global);
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const BASE = "/rituals/year/";
  const enc = encodeURIComponent;
  const href = {
    home: () => BASE,
    moon: (n) => `${BASE}?moon=${Number(n)}`,
    lesson: (id, moon) => `${BASE}?lesson=${enc(id)}${moon ? `&moon=${Number(moon)}` : ""}`,
    day: () => `${BASE}?view=day`,
    journey: (id) => `/rituals/journeys/?id=${enc(id)}`,
    rite: (id, stage) => `/rituals/journeys/?id=${enc(id)}&rite=${Number(stage)}`
  };

  /** Which view a URL asks for. Pure. */
  function route(search) {
    const q = new URLSearchParams(search || "");
    const moon = /^\d+$/.test(q.get("moon") || "") ? Number(q.get("moon")) : null;
    if (q.get("lesson")) return { view: "lesson", lesson: q.get("lesson"), moon };
    if (q.get("view") === "day") return { view: "day" };
    if (moon) return { view: "moon", moon };
    return { view: "home" };
  }

  /** Calendar events for the year's reminders (the app's notifications), each with an alert at its start. Pure. */
  function reminderEvents(Y, progress, now) {
    return Y.yearReminders(Y.config(progress), now, 400).map((r) => ({
      key: r.key.replace(/[^\w.-]+/g, "-"),
      title: r.title,
      start: r.at,
      end: new Date(r.at.getTime() + 30 * 60000),
      allDay: false,
      notes: `${r.body}\n\nhttps://saltandsovereignty.com${r.url.replace(/^\/rituals\/year\/moon\/(\d+)$/, "/rituals/year/?moon=$1").replace(/^\/rituals\/year\/day$/, "/rituals/year/?view=day").replace(/^\/rituals\/year$/, "/rituals/year/")}`,
      alarms: [0]
    }));
  }

  function mount(global) {
    const kit = global.PracticeKit;
    const core = global.SaltCore?.yearday;
    const root = kit?.root();
    if (!kit || !core || !root) return;
    const Y = core.year;
    const COLLECTION = Y.YEAR_COLLECTION;
    const where = route(global.location.search);
    const dayWords = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    const fullWords = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
    const shortWords = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    let user = null;
    let entry = null;
    let ready = false;
    let catalog = null;
    let catalogFailed = false;
    let settings = {};
    const state = {
      busy: false,
      problem: "",
      track: "eclectic",
      south: false,
      date: null,
      typed: "",
      move: "",
      drafts: {},
      note: "",
      icsMessage: ""
    };

    const progress = () => entry?.data || null;
    const today = () => Y.dayKey(new Date());

    function links(list) {
      const items = list
        .map((l) => ({ l, url: core.courseLinkSiteHref(l) }))
        .filter((x) => x.url)
        .map(({ l, url }) => `<a class="sp-chip" href="${kit.esc(url)}">${kit.esc(Y.linkLabel(l))} ›</a>`);
      return items.length ? `<div class="sp-chips">${items.join("")}</div>` : "";
    }
    const bar = (value, label) =>
      `<div class="yr-bar" role="progressbar" aria-label="${kit.esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value * 100)}"><span style="width:${Math.round(
        Math.max(0, Math.min(1, value)) * 100
      )}%"></span></div>`;
    const footerRows = () =>
      kit.list([
        kit.row({ url: "/rituals/journeys/", title: "Dedication journeys", detail: "The guided paths whose rite closes the year" }),
        kit.row({ url: "/practice/solitary/", title: "Solitary practice", detail: "Daily devotion, and workings for practising alone" })
      ]);

    // ------------------------------------------------------------ home

    function beginView() {
      const now = new Date();
      const track = Y.trackById(state.track);
      const choices = Y.startChoices(now, track.id, state.south);
      const chosen = state.date || choices.find((c) => c.key === "new-moon")?.date || Y.dayKey(now);
      const typedOk = Y.isDayKey(state.typed.trim());
      return [
        kit.p(
          "A year and a day is an old span for learning a craft, and many modern paths keep it before a dedication. This is one for practising alone: thirteen moons of readings from the courses, practice with the moon, the festivals of your calendar, meditation, divination, your altar, offerings and spellcraft, a reflection each moon, and at the end a rite of self-dedication if you choose it."
        ),
        kit.muted("Nothing is graded or locked. The self-checks are for you alone, you can read ahead or fall behind, and a dedication is a promise to yourself, not an initiation."),
        kit.section(
          "Your track",
          kit.chips(Y.TRACKS.map((t) => kit.chip({ label: t.name, act: "track", value: t.id, pressed: t.id === track.id })), "Your track") +
            kit.card(`${kit.p(track.about)}${track.note ? kit.muted(track.note) : ""}${track.noteLink ? links([track.noteLink]) : ""}`) +
            (track.south ? kit.toggle({ id: "yr-south", label: "Southern hemisphere", detail: "Keep the Wheel’s festivals by the southern seasons", checked: state.south, change: "south" }) : "")
        ),
        kit.section(
          "When to begin",
          kit.chips(
            choices.map((c) => kit.chip({ label: `${c.label} · ${shortWords(c.date)}`, act: "date", value: c.date, pressed: chosen === c.date && !typedOk })),
            "When to begin"
          ) +
            kit.muted(choices.find((c) => c.date === chosen)?.detail || dayWords(chosen)) +
            kit.field({ id: "yr-typed", label: "Or another day", type: "date", value: state.typed, change: "typed" }) +
            kit.actions([kit.button({ label: state.busy ? "Beginning…" : "Begin my year and a day", act: "begin", primary: true, disabled: state.busy || !ready })]) +
            kit.caption(kit.savedLine(user, "your year"))
        )
      ].join("");
    }

    function yearView(p) {
      const t = today();
      const s = Y.yearSchedule(p.startDate);
      const pos = Y.positionOn(s, t);
      const status = Y.yearStatus(p, t);
      const line = Y.todayLine(p, t);
      const track = Y.trackById(p.track);
      const rows = s.windows.map((w) => {
        const view = Y.moonView(Y.config(p), w.n);
        const sum = Y.moonSummary(p, view);
        const now = pos.phase === "moon" && pos.n === w.n;
        return kit.row({ url: href.moon(w.n), title: `Moon ${w.n}: ${view.moon.title}${now ? " · now" : ""}`, detail: `${shortWords(w.start)} · ${view.moon.theme} · ${Y.summaryLine(sum)}` });
      });
      rows.push(kit.row({ url: href.day(), title: "The day of dedication", detail: `${dayWords(s.day)} · a year and a day` }));
      return [
        kit.card(
          `${kit.p(status === "dedicated" ? `Dedicated on ${dayWords(Y.dayKey(new Date(p.dedicatedAt)))}.` : line?.line || "")}${line?.detail ? kit.muted(line.detail) : ""}${bar(
            Y.yearFraction(p, t),
            "How far through the year"
          )}${pos.phase === "moon" ? kit.actions([kit.button({ label: `Open moon ${pos.n}`, url: href.moon(pos.n) })]) : ""}`,
          { gold: true, label: `${track.name} · ${fullWords(s.start)} to ${fullWords(s.day)}` }
        ),
        kit.section("The thirteen moons", kit.list(rows, "The thirteen moons")),
        s.aligned ? kit.muted("You began at a new moon, so each moon begins at the next new moon.") : "",
        kit.caption(kit.savedLine(user, "your year"))
      ].join("");
    }

    function settingsView(p) {
      const moveOk = Y.isDayKey(state.move.trim());
      return kit.section(
        "Your year",
        [
          kit.toggle({ id: "yr-remind", label: "Remind me", detail: "When each moon begins, a nudge to reflect before it ends, and the day of dedication", checked: p.remind, change: "remind" }),
          p.remind
            ? `${kit.muted("A website can’t nudge you, so the reminders come as a calendar file: add it to your phone’s or computer’s calendar. The app sends them as notifications.")}${kit.actions([
                kit.button({ label: "Download calendar file (.ics)", act: "ics" })
              ])}${kit.notice(state.icsMessage, { live: true })}`
            : "",
          kit.chips(Y.TRACKS.map((t) => kit.chip({ label: t.name, act: "set-track", value: t.id, pressed: t.id === p.track, a11y: `Track: ${t.name}` })), "Your track"),
          kit.field({ id: "yr-move", label: "Move the first day", type: "date", value: state.move, change: "move" }),
          moveOk ? kit.actions([kit.button({ label: `Begin on ${dayWords(state.move.trim())} instead`, act: "move-go" })]) : "",
          kit.actions([kit.textButton({ label: "Set this year aside", act: "stop" })])
        ].join("")
      );
    }

    function homeView() {
      const p = progress();
      return [
        kit.back("/rituals/", "Rituals"),
        kit.head({ eyebrow: "Thirteen moons · study · practice · self-dedication", title: "A Year and a Day" }),
        kit.notice(state.problem, { live: true }),
        !ready ? kit.muted("Opening…") : p ? yearView(p) + settingsView(p) : beginView(),
        footerRows()
      ].join("");
    }

    // ------------------------------------------------------------ a moon

    function moonPage(n) {
      n = Math.max(1, Math.min(Y.MOONS.length, n));
      const now = new Date();
      const p = progress() || Y.newYear("eclectic", Y.dayKey(now), now);
      const begun = !!progress();
      const view = Y.moonView(Y.config(p), n);
      const sum = Y.moonSummary(p, view);
      const t = today();
      const saved = p.reflections[view.moon.id]?.text || "";
      const draft = state.drafts[view.moon.id] ?? saved;
      const readings = view.readings.map((r) =>
        kit.row({ url: href.lesson(r.id, n), title: r.title, detail: kit.join([r.festival ? `For ${r.festival}` : null, `${r.minutes} min`, p.done[Y.readKey(r.id)] ? "Read" : null]) })
      );
      const practices = view.practices.map((item) =>
        kit.card(
          `${kit.p(item.title)}${kit.muted(item.detail)}${links(item.links)}${
            begun ? kit.toggle({ id: `yr-done-${item.key.replace(/[^\w-]/g, "_")}`, label: "Done", checked: !!p.done[item.key], change: "done" }).replace("<input ", `<input data-key="${kit.esc(item.key)}" `) : ""
          }`,
          { gold: !!item.date && item.date >= t && !p.done[item.key], label: Y.PRACTICE_WORD[item.kind] }
        )
      );
      const checks = view.moon.milestones.map((m, i) =>
        begun ? kit.toggle({ id: `yr-check-${view.moon.id}-${i}`, label: m, checked: !!p.checks[Y.checkKey(view.moon.id, i)], change: "check" }).replace("<input ", `<input data-key="${kit.esc(Y.checkKey(view.moon.id, i))}" `) : kit.p(m)
      );
      const nav = [];
      if (n > 1) nav.push(kit.row({ url: href.moon(n - 1), title: `Moon ${n - 1}: ${Y.MOONS[n - 2].title}`, detail: "The moon before" }));
      nav.push(n < Y.MOONS.length ? kit.row({ url: href.moon(n + 1), title: `Moon ${n + 1}: ${Y.MOONS[n].title}`, detail: "The next moon" }) : kit.row({ url: href.day(), title: "The day of dedication", detail: "A year and a day" }));
      nav.push(kit.row({ url: href.home(), title: "All thirteen moons" }));
      return [
        kit.back(href.home(), "A Year and a Day"),
        kit.head({ eyebrow: `Moon ${n} of ${Y.MOONS.length} · ${dayWords(view.window.start)}`, title: view.moon.title, lede: view.moon.intro }),
        begun ? kit.muted(Y.summaryLine(sum)) : kit.muted("Begin your year to keep your progress here. You can read ahead either way."),
        kit.notice(state.problem, { live: true }),
        kit.section("Read", kit.list(readings, "Read")),
        kit.section("Practise", practices.join("")),
        kit.section(
          "Reflect",
          view.moon.reflect.map((q) => kit.p(q)).join("") +
            (begun
              ? kit.field({ id: `yr-reflect-${view.moon.id}`, label: "Your reflection (private)", value: draft, multiline: true, input: "reflect", maxlength: Y.REFLECTION_MAX, placeholder: "A few lines, as long or short as you like" }) +
                kit.actions([kit.button({ label: draft === saved && saved ? "Saved" : "Save reflection", act: "save-reflection", value: view.moon.id, disabled: state.busy || draft === saved })])
              : "")
        ),
        kit.section("Self-check", kit.muted("For you alone. Nobody sees these, and there is no score.") + checks.join("")),
        kit.list(nav)
      ].join("");
    }

    // ------------------------------------------------------------ a lesson

    function lessonPage(id, moon) {
      const p = progress();
      const known = Y.READINGS[id];
      const doc = catalog ? catalog.find((d) => d.id === id) || null : undefined;
      const read = !!p?.done[Y.readKey(id)];
      const back = moon ? href.moon(moon) : href.home();
      return [
        kit.back(back, moon ? `Moon ${moon}` : "A Year and a Day"),
        kit.head({ eyebrow: doc ? core.readingTime(doc) : known ? `About ${known.minutes} minutes` : "A lesson from the courses", title: doc?.title || known?.title || "Lesson", lede: doc?.summary }),
        doc === undefined ? kit.muted(catalogFailed ? "" : "Fetching the lesson…") : "",
        doc === null || catalogFailed ? kit.notice("This lesson couldn’t be fetched. Please check your connection and try again.") : "",
        doc ? `<div class="sp-card yr-lesson">${core.lessonHtml(doc.body)}</div>${doc.links?.length ? links(doc.links) : ""}` : "",
        doc ? kit.caption("From the coven courses, read here for practising alone. Where a lesson speaks of a coven, a mentor or a test, take what helps you.") : "",
        p ? kit.toggle({ id: "yr-read", label: "I’ve read this", checked: read, change: "read" }) : "",
        kit.list([kit.row({ url: back, title: moon ? `Back to moon ${moon}` : "A Year and a Day" })])
      ].join("");
    }

    async function loadCatalog() {
      try {
        const res = await fetch("/js/core/course-programs.json");
        const json = res.ok ? await res.json() : null;
        catalog = (json?.programs || []).flatMap((pr) => pr.docs || []);
      } catch (error) {
        console.error(error);
        catalogFailed = true;
      }
      draw();
    }

    // ------------------------------------------------------------ the day

    function dayPage() {
      const now = new Date();
      const p = progress() || Y.newYear("eclectic", Y.dayKey(now), now);
      const begun = !!progress();
      const track = Y.trackById(p.track);
      const s = Y.yearSchedule(p.startDate);
      const last = Y.moonView(Y.config(p), Y.MOONS.length);
      const D = Y.THE_DAY;
      return [
        kit.back(href.home(), "A Year and a Day"),
        kit.head({ eyebrow: begun ? dayWords(s.day) : "A year and a day", title: D.title, lede: D.intro }),
        kit.muted(D.wait),
        kit.section(
          "The rite",
          kit.card(
            `${kit.p(`Your ${track.name} dedication journey holds a full rite of self-dedication, with its discernment before it. Begin it at the altar’s Ritual Companion, or keep the ready-made one.`)}${kit.actions([
              kit.button({ label: "Open the dedication rite", url: href.rite(track.journey, Y.DEDICATION_STAGE), primary: true }),
              kit.button({ label: Y.linkLabel({ kind: "journey", id: track.journey }), url: href.journey(track.journey) })
            ])}${links([{ kind: "premade", id: track.dedication }, { kind: "page", id: "journal" }])}`,
            { gold: true }
          )
        ),
        kit.section("Read before", kit.list(last.readings.map((r) => kit.row({ url: href.lesson(r.id, Y.MOONS.length), title: r.title, detail: `${r.minutes} min${p.done[Y.readKey(r.id)] ? " · Read" : ""}` })))),
        kit.notice(state.problem, { live: true }),
        begun
          ? p.dedicatedAt
            ? kit.card(
                `${kit.p(`Dedicated on ${dayWords(Y.dayKey(new Date(p.dedicatedAt)))}.`)}${p.dedicationNote ? kit.muted(p.dedicationNote) : ""}${kit.muted(D.after)}${kit.actions([kit.textButton({ label: "Undo", act: "undedicate" })])}`
              )
            : kit.section(
                "Once you have kept it",
                kit.field({ id: "yr-note", label: "A line about the day (optional, private)", value: state.note, multiline: true, input: "note", maxlength: Y.REFLECTION_MAX }) +
                  kit.actions([kit.button({ label: "I have made my dedication", act: "dedicate", primary: true, disabled: state.busy })])
              )
          : "",
        kit.list([kit.row({ url: href.moon(Y.MOONS.length), title: `Moon ${Y.MOONS.length}: ${Y.MOONS[Y.MOONS.length - 1].title}`, detail: "Preparing your words, token and day" })])
      ].join("");
    }

    // ------------------------------------------------------------ saving

    async function reload() {
      const entries = await kit.entries(COLLECTION);
      entry = Y.currentYear(entries);
    }

    async function change(fn) {
      if (!entry) return;
      const next = fn(entry.data);
      if (next === entry.data) return;
      state.busy = true;
      state.problem = "";
      try {
        await kit.update(COLLECTION, entry.id, next);
        entry = { ...entry, data: next };
      } catch (error) {
        console.error(error);
        state.problem = "Couldn’t save. Please try again.";
      } finally {
        state.busy = false;
        draw();
      }
    }

    function draw() {
      const v = where.view;
      const html = v === "moon" ? moonPage(where.moon) : v === "lesson" ? lessonPage(where.lesson, where.moon) : v === "day" ? dayPage() : homeView();
      kit.render(root, html);
    }

    kit.delegate(root, {
      track(el) {
        state.track = el.dataset.value;
        state.date = null;
        draw();
      },
      south(el) {
        state.south = el.checked;
        state.date = null;
        draw();
      },
      date(el) {
        state.date = el.dataset.value;
        state.typed = "";
        draw();
      },
      typed(el) {
        state.typed = el.value;
        draw();
      },
      async begin() {
        const now = new Date();
        const track = Y.trackById(state.track);
        const choices = Y.startChoices(now, track.id, state.south);
        const start = Y.isDayKey(state.typed.trim()) ? state.typed.trim() : state.date || choices.find((c) => c.key === "new-moon")?.date || Y.dayKey(now);
        state.busy = true;
        draw();
        try {
          await kit.add(COLLECTION, Y.newYear(track.id, start, now, !!track.south && state.south));
          await reload();
        } catch (error) {
          console.error(error);
          state.problem = "Couldn’t begin. Please try again.";
        }
        state.busy = false;
        draw();
      },
      remind(el) {
        void change((p) => Y.setRemind(p, el.checked));
      },
      ics() {
        const p = progress();
        if (!p) return;
        const events = reminderEvents(Y, p, new Date());
        if (!events.length) return;
        kit.downloadFile("a-year-and-a-day.ics", core.toIcs(events, new Date()));
        state.icsMessage = `Made ${kit.plural(events.length, "reminder", "reminders")}. Open the file to add them to your calendar.`;
        draw();
      },
      "set-track"(el) {
        void change((p) => Y.setTrack(p, el.dataset.value));
      },
      move(el) {
        state.move = el.value;
        draw();
      },
      "move-go"() {
        const date = state.move.trim();
        state.move = "";
        void change((p) => Y.setStart(p, date));
      },
      stop() {
        if (!kit.confirm("Set your year aside? What you have done and written is kept. You can begin a new year whenever you like.")) return;
        void change((p) => Y.stopYear(p, new Date())).then(async () => {
          await reload();
          draw();
        });
      },
      done(el) {
        void change((p) => Y.setDone(p, el.dataset.key, el.checked, new Date()));
      },
      check(el) {
        void change((p) => Y.setCheck(p, el.dataset.key, el.checked, new Date()));
      },
      reflect(el) {
        const id = el.id.replace("yr-reflect-", "");
        state.drafts[id] = el.value;
        const btn = root.querySelector('[data-act="save-reflection"]');
        if (btn) btn.disabled = state.busy || el.value === (progress()?.reflections[id]?.text || "");
      },
      "save-reflection"(el) {
        const id = el.dataset.value;
        const text = state.drafts[id] ?? "";
        void change((p) => Y.setReflection(p, id, text, new Date())).then(() => {
          delete state.drafts[id];
          draw();
        });
      },
      read(el) {
        void change((p) => Y.setDone(p, Y.readKey(where.lesson), el.checked, new Date()));
      },
      note(el) {
        state.note = el.value;
      },
      dedicate() {
        void change((p) => Y.dedicate(p, new Date(), state.note));
      },
      undedicate() {
        if (!kit.confirm("Unmark your dedication? Your year will show as not yet dedicated.")) return;
        void change((p) => Y.undedicate(p));
      }
    });

    kit.start(async (who) => {
      user = who;
      settings = await kit.settings();
      if (!entry) state.south = core.keepsSouthernWheel(settings);
      await reload();
      ready = true;
      draw();
      if (where.view === "lesson" && !catalog && !catalogFailed) void loadCatalog();
    });
  }

  return { route, href, reminderEvents, mount };
});
