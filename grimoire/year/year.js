/*
 * Grimoire → Your year in review (/grimoire/year/): a year of your practice
 * by your own new year, as the app's Grimoire has it
 * (app/src/app/(tabs)/grimoire/year.tsx), with the same logic
 * (js/core/year.js, built from app/src/lib/grimoire/yearReview.ts and
 * yearSpan.ts). Read from what the site already keeps: the ritual journal
 * (user_rituals, or this browser's), planned workings (ritual_plans and this
 * browser's copy), craft_entries (readings, dreams, journeys, the astrology
 * course), Grimoire pages, saved altars, coven gatherings and programs, and
 * Cycle & Moon only when it is open in this browser. Private: nothing is sent
 * anywhere; the year-end page is written to your own Grimoire only when you ask.
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.year;
  const H = global.SaltCore?.holy || null;
  const B = global.SaltBars;
  const root = kit?.root();
  if (!kit || !core || !B || !root) return;

  const { yearSpan: YS, yearReview: YR, readings: R, dreams: D, holidays: HD, calendars: CAL, links: LK } = core;
  const esc = kit.esc;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const shortDay = (value) => kit.dayMonth(String(value || "").slice(0, 10));
  const db = () => global.db || null;
  const params = new URLSearchParams(global.location.search);

  let user = null;
  let settings = {};
  let place = null;
  let at = kit.fromKey(params.get("start")) || new Date();
  let data = null;
  let cycle = { phase: "new", data: null };
  let notice = "";
  let saving = false;
  let pageId = null;

  const readJson = (key, fallback) => {
    try {
      const raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const list = (v) => (Array.isArray(v) ? v : []);
  const safe = async (fn, fallback) => {
    try {
      return await fn();
    } catch (error) {
      console.warn("Part of your year couldn’t be read just now.", error);
      return fallback;
    }
  };

  /** The ritual journal: the account's rows, or this browser's for a guest (rituals/js/rituals-store.js journal). */
  async function loadJournal() {
    if (user && db()) {
      const { data: rows, error } = await db().from("user_rituals").select("*").eq("user_id", user.id);
      if (error) throw error;
      return rows || [];
    }
    const device = readJson("saltAndSovereigntyRitualLifecycle:guest", {});
    const seen = new Set();
    return [...list(device?.journals), ...list(readJson("saltAndSovereigntyUserRituals", []))].filter((e) => e && e.id && !seen.has(e.id) && seen.add(e.id));
  }

  /** Planned workings: this browser's and, signed in, the account's (as the app's RitualPlan). */
  async function loadPlans() {
    const local = list(readJson("rituals.plans.v1", [])).filter((p) => p && p.id && (!p.syncedTo || p.syncedTo === user?.id));
    if (!user || !db()) return local;
    const { data: rows } = await db().from("ritual_plans").select("id,planned_date,planned_time,title,done_at,created_at").eq("user_id", user.id);
    const out = [...local];
    for (const row of rows || []) {
      if (!out.some((p) => p.id === row.id)) out.push({ id: row.id, date: row.planned_date, time: row.planned_time || "", title: row.title || "", doneAt: row.done_at || null, createdAt: row.created_at });
    }
    return out;
  }

  async function loadAltars() {
    if (user && db()) {
      const { data: rows } = await db().from("saved_altars").select("id,name,altar_data,created_at,updated_at").eq("user_id", user.id);
      return (rows || []).map(core.altarFromRow);
    }
    try {
      return core.parseLocalAltars(global.localStorage.getItem(core.LOCAL_ALTARS_KEY));
    } catch {
      return [];
    }
  }

  async function loadCovens() {
    if (!user || !db()) return { gatherings: [], courses: [] };
    const [attendance, enrollments, progress] = await Promise.all([
      db().from("coven_ritual_attendance").select("ritual_id,present,joined_at").eq("user_id", user.id),
      db().from("coven_program_enrollments").select("id,program_id,started_at,completed_at,status").eq("user_id", user.id),
      db().from("coven_program_progress").select("enrollment_id,submitted_at,checked_at,updated_at").eq("user_id", user.id)
    ]);
    const ritualIds = (attendance.data || []).map((a) => a.ritual_id);
    const programIds = [...new Set((enrollments.data || []).map((e) => e.program_id))];
    const [rituals, programs] = await Promise.all([
      ritualIds.length ? db().from("coven_rituals").select("id,coven_id,title,scheduled_for,ended_at").in("id", ritualIds) : { data: [] },
      programIds.length ? db().from("coven_programs").select("id,title").in("id", programIds) : { data: [] }
    ]);
    const covenIds = [...new Set((rituals.data || []).map((r) => r.coven_id))];
    const covens = covenIds.length ? await db().from("covens").select("id,name").in("id", covenIds) : { data: [] };
    return YR.covenRecords({
      attendance: attendance.data || [],
      rituals: rituals.data || [],
      covens: covens.data || [],
      enrollments: enrollments.data || [],
      programs: programs.data || [],
      progress: progress.data || []
    });
  }

  async function loadPages() {
    if (!user || !db()) return [];
    const { data: rows } = await db().from("grimoire_pages").select("id,title,created_at,metadata").eq("user_id", user.id);
    return rows || [];
  }

  /** Cycle & Moon, only when this browser holds its key (today/cycle-today.js), so nothing loads otherwise. */
  function hasCycleKey(scope) {
    const name = `cycleMoon.key.${scope}`;
    try {
      if (global.localStorage.getItem(name)) return true;
    } catch {
      /* blocked */
    }
    try {
      return !!global.sessionStorage.getItem(name);
    } catch {
      return false;
    }
  }
  function script(src, ready) {
    if (ready()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const el = global.document.createElement("script");
      el.src = global.SaltEnvironment?.resolvePath?.(src) || src;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error(`${src} didn’t load`));
      global.document.head.appendChild(el);
    });
  }
  async function loadCycle() {
    const scope = user?.id || "device";
    if (!hasCycleKey(scope)) return { phase: readJson(`cycleMoon.vault.${scope}`, null) ? "locked" : "new", data: null };
    await script("/js/core/cycle.js", () => !!global.SaltCore?.cycle);
    await script("/rituals/cycle/cycle-store.js", () => !!global.CycleMoonStore);
    await global.CycleMoonStore.load(user?.id || null);
    const st = global.CycleMoonStore.state;
    return { phase: st.phase, data: st.phase === "open" ? st.data : null };
  }

  async function load() {
    const [journal, plans, readings, dreams, journeys, course, pages, altars, covens, cyc] = await Promise.all([
      safe(loadJournal, []),
      safe(loadPlans, []),
      kit.entries(R.READINGS),
      kit.entries(D.DREAMS),
      kit.entries("journeys.progress"),
      kit.entries("astro.course"),
      safe(loadPages, []),
      safe(loadAltars, []),
      safe(loadCovens, { gatherings: [], courses: [] }),
      safe(loadCycle, { phase: "new", data: null })
    ]);
    const fromAltars = YR.altarRecords(altars, new Date());
    const latestCourse = [...course].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0];
    const astro = YR.astroCourse(latestCourse?.data, YR.COURSE_TITLE);
    cycle = cyc;
    data = {
      journal,
      plans,
      readings: readings.map((e) => ({ ...e, data: R.normalizeReading(e.data) })),
      dreams: dreams.map((e) => ({ ...e, data: D.normalizeDream(e.data) })),
      pages,
      offerings: fromAltars.offerings,
      altarChanges: fromAltars.changes,
      gatherings: covens.gatherings,
      journeys: journeys
        .filter((e) => e.data && typeof e.data.journeyId === "string")
        .map((e) => ({ id: e.data.journeyId, title: core.JOURNEY_CATALOG.find((j) => j.id === e.data.journeyId)?.title || "A journey", progress: e.data })),
      courses: [...(astro ? [astro] : []), ...covens.courses]
    };
  }

  function spanNow() {
    return YS.yearSpanAt(at, settings, place);
  }

  function reviewOf(span) {
    return YR.yearReview(
      {
        ...data,
        holidayChoice: HD.holidayChoice(settings),
        cycle: cycle.phase === "open" ? cycle.data : null,
        south: CAL.hemisphereOf(settings, place) === "south"
      },
      span,
      new Date()
    );
  }

  const holyHref = (h) => (H?.holy?.hasHolyPage?.(h.id) ? `/today/holy/?ref=${encodeURIComponent(h.ref)}` : "/today/calendar/");

  function view() {
    const span = spanNow();
    if (!data) return [kit.back("/grimoire/", "Grimoire"), kit.head({ eyebrow: span.label, title: "Your year in review" }), kit.muted("Opening…")].join("");
    const r = reviewOf(span);
    const lines = YR.yearLines(r);
    const prompts = YR.reflectionPrompts(r);
    const card = YR.shareCard(r);
    const ref = YR.yearPageRef(span);
    const kept = data.pages.find((p) => p.metadata?.holyRef === ref) || (pageId ? { id: pageId } : null);
    const out = [
      kit.back("/grimoire/", "Grimoire"),
      kit.head({ eyebrow: r.span.label, title: "Your year in review", lede: `${r.span.range}${r.ongoing ? ", still going" : ""}. Only you see this.` }),
      kit.actions([kit.button({ label: "‹ The year before", act: "earlier", ghost: true }), r.ongoing ? "" : kit.button({ label: "The year after ›", act: "later", ghost: true })])
    ];
    if (r.empty) out.push(kit.card(kit.p("Nothing kept in this year yet. As you journal rituals, draw cards, write down dreams and tend your altar, your year gathers here.")));
    else if (lines.length) out.push(kit.card(lines.map((l) => kit.p(l)).join(""), { gold: true }));

    if (r.rituals.done || r.plans.planned) {
      out.push(
        kit.section(
          "Rituals",
          kit.card(
            kit.p(`${plural(r.rituals.done, "ritual", "rituals")} journaled · ${plural(r.plans.planned, "working", "workings")} planned${r.plans.ahead ? `, ${r.plans.ahead} still ahead` : ""}`) +
              (r.rituals.done ? B.bars(r.rituals.byMonth.map((m) => ({ label: m.label, count: m.count })), ["ritual", "rituals"]) : "") +
              kit.chips(r.rituals.themes.map((t) => kit.chip({ label: `${t.label} · ${t.count}` }))) +
              kit.list([
                kit.row({ url: "/?sanctuary=rituals", title: "Your ritual journal" }),
                kit.row({ url: "/rituals/journal/insights/", title: "Your moon", detail: "Which moons you work under, and what works for you" }),
                kit.row({ url: "/rituals/planner/", title: "Plan a working" })
              ])
          )
        )
      );
    }

    if (r.workings.lookedBack || r.workings.waiting) {
      out.push(
        kit.section(
          "Did it work?",
          kit.card(
            B.bars(
              [
                { label: "It worked", count: r.workings.worked },
                { label: "Partly", count: r.workings.partly },
                { label: "Not yet", count: r.workings.notYet },
                { label: "It didn’t", count: r.workings.no }
              ],
              ["working", "workings"]
            ) +
              (r.workings.waiting ? kit.muted(`${plural(r.workings.waiting, "working is", "workings are")} still waiting for you to look back.`) : "") +
              (r.workings.boreOut.length
                ? kit.list(r.workings.boreOut.slice(0, 6).map((w) => kit.row({ url: "/rituals/journal/insights/", title: w.title, detail: w.outcome === "yes" ? "It worked" : "Partly" })))
                : "")
          )
        )
      );
    }

    const fullMoons = r.moons.list.filter((m) => m.kind === "full");
    out.push(
      kit.section(
        "Moons and holidays",
        kit.card(
          (r.moons.full ? B.meter(r.moons.fullKept / r.moons.full, `Full moons met: ${r.moons.fullKept} of ${r.moons.full}`) : "") +
            (r.moons.new ? B.meter(r.moons.newKept / r.moons.new, `New moons met: ${r.moons.newKept} of ${r.moons.new}`) : "") +
            kit.details(
              "The full moons",
              `<div class="sp-chips">${fullMoons
                .map((m) => `<a class="sp-chip" href="/today/holy/?ref=moon-full" aria-label="${esc(`${m.name}, ${shortDay(m.date)}${m.kept ? ", kept" : ""}. Opens the full moon’s page`)}">${esc(`${m.name}, ${shortDay(m.date)}${m.kept ? " · kept" : ""}`)}</a>`)
                .join("")}</div>`
            ) +
            (r.holidays.list.length
              ? B.meter(r.holidays.total ? r.holidays.kept / r.holidays.total : 0, `Holidays kept: ${r.holidays.kept} of ${r.holidays.total} so far`) +
                kit.details(
                  "Your holidays this year",
                  kit.list(r.holidays.list.map((h) => kit.row({ url: holyHref(h), title: h.name, detail: kit.join([shortDay(h.date), h.kept ? "kept" : h.planned ? "planned" : h.past ? null : "ahead"]) })))
                )
              : "") +
            kit.muted("A moon or holiday counts as met when a ritual, a reading or an offering falls on it, or the day either side.")
        )
      )
    );

    if (r.readings.count) {
      out.push(
        kit.section(
          "Cards drawn most",
          kit.card(
            kit.p(`${plural(r.readings.count, "reading", "readings")}, ${plural(r.readings.draws, "card, rune or stave", "cards, runes and staves")} drawn.`) +
              B.bars(r.readings.top.map((c) => ({ label: c.name, count: c.count, detail: c.title, url: c.ref ? LK.divinationWebPath(c.ref, c.deck) : null })), ["time", "times"]) +
              kit.list([kit.row({ url: "/divination/patterns/", title: "Your divination patterns", detail: "Suits, moons, days, and the cards you haven’t met" })])
          )
        )
      );
    }

    if (r.pages.made || r.dreams.count) {
      out.push(
        kit.section(
          "Grimoire and dreams",
          kit.card(
            (r.pages.made ? kit.p(`${plural(r.pages.made, "new page", "new pages")}: ${r.pages.titles.slice(0, 5).map((p) => p.title).join(", ")}${r.pages.made > 5 ? ", …" : ""}`) : "") +
              (r.dreams.count ? kit.p(`${plural(r.dreams.count, "dream", "dreams")} written down${r.dreams.lucid ? `, ${r.dreams.lucid} lucid` : ""}${r.dreams.recurring ? `, ${r.dreams.recurring} recurring` : ""}.`) : "") +
              (r.dreams.symbols.length ? `<div class="sp-chips">${r.dreams.symbols.map((d) => `<a class="sp-chip" href="/grimoire/dreams/symbols/">${esc(`${d.symbol} · ${d.count}`)}</a>`).join("")}</div>` : "") +
              (r.dreams.count ? kit.list([kit.row({ url: "/grimoire/dreams/symbols/", title: "Your dreams and their symbols" })]) : "")
          )
        )
      );
    }

    if (r.cycle && r.cycle.bleeds) {
      out.push(
        kit.section(
          "Cycle & Moon",
          kit.card(
            kit.p(`${plural(r.cycle.bleeds, "bleed", "bleeds")} began this year${r.cycle.averageLength ? `, about ${r.cycle.averageLength} days apart` : ""}${r.cycle.notedDays ? `; ${plural(r.cycle.notedDays, "day", "days")} with notes` : ""}.`) +
              kit.muted("Private to you, read in this browser only, and never on the shareable card.") +
              kit.list([kit.row({ url: "/rituals/cycle/?view=history", title: "Cycle & Moon" })])
          )
        )
      );
    }
    if (cycle.phase === "locked") out.push(kit.muted("Cycle & Moon is locked in this browser, so it isn’t included. Open it to see it here; it stays private."));

    if (r.journeys.length || r.courses.length) {
      out.push(
        kit.section(
          "Journeys and courses",
          kit.list([
            ...r.journeys.map((j) =>
              kit.row({
                url: `/rituals/journeys/?id=${encodeURIComponent(j.id)}`,
                title: j.title,
                detail: kit.join([j.started ? "begun" : null, j.dedicated ? "dedicated" : null, j.stages ? plural(j.stages, "stage finished", "stages finished") : null, j.lessons ? plural(j.lessons, "lesson", "lessons") : null, j.practices ? plural(j.practices, "practice", "practices") : null])
              })
            ),
            ...r.courses.map((c) =>
              kit.row({
                url: c.id === "astro-course" ? "/practice/cosmic/course/" : "/covens/",
                title: c.title,
                detail: kit.join([c.started ? "begun" : null, c.completed ? "completed" : null, c.steps ? `${c.steps} steps this year` : null])
              })
            )
          ])
        )
      );
    }

    if (r.offerings.count || r.gatherings.count || r.altar.count) {
      out.push(
        kit.section(
          "Altar, offerings and coven",
          kit.card(
            (r.offerings.count ? kit.p(`${plural(r.offerings.count, "offering", "offerings")}${r.offerings.to.length ? `, most to ${r.offerings.to.map((o) => o.label).slice(0, 3).join(", ")}` : ""}.`) : "") +
              (r.altar.count ? kit.p(`${plural(r.altar.count, "change", "changes")} at your altars.`) : "") +
              (r.gatherings.count ? kit.details(plural(r.gatherings.count, "coven gathering", "coven gatherings"), r.gatherings.list.map((g) => kit.p(`${shortDay(g.at)}: ${g.label}${g.detail ? `, ${g.detail}` : ""}`)).join("")) : "") +
              kit.list([kit.row({ url: "/altar/", title: "Your altars" }), kit.row({ url: "/covens/", title: "Your covens" })])
          )
        )
      );
    }

    out.push(
      kit.section(
        "Reflect",
        kit.card(
          prompts.map((p) => `<p class="sp-prompt">${esc(p)}</p>`).join("") +
            (user
              ? kit.actions([kit.button({ label: kept ? "Open your year-end page" : saving ? "Writing…" : "Write a year-end page in my Grimoire", act: "write-page", primary: true, disabled: saving })])
              : kit.muted("Sign in to keep a year-end page in your Grimoire."))
        )
      )
    );

    if (card.lines.length) {
      out.push(
        kit.section(
          "A card to share",
          `<div class="sp-sharecard" role="group" aria-label="${esc(`${card.title}. ${card.lines.join(", ")}`)}"><h3>${esc(card.title)}</h3>${card.lines.map((l) => `<p>${esc(l)}</p>`).join("")}<p class="sp-caption">Salt &amp; Sovereignty</p></div>` +
            kit.muted("Counts only: no questions, cards, dreams, workings, names or Cycle & Moon. Nothing is shared unless you choose to.") +
            kit.actions([kit.button({ label: "Copy the card’s words", act: "copy-card", ghost: true })])
        )
      );
    }
    if (notice) out.push(kit.notice(notice, { live: true }));

    const chosen = YS.yearStartChoice(settings);
    out.push(
      kit.section(
        "Where your year begins",
        kit.chips(YS.YEAR_STARTS.map((o) => kit.chip({ label: o.label, act: "year-start", value: o.id, pressed: chosen === o.id, a11y: `${o.label}: ${o.detail}` })), "Where your year begins") +
          kit.list([kit.row({ url: "/today/calendar/", title: "Your calendars", detail: "Counting by the moon, and where the moon’s year begins" }), kit.row({ url: "/help/#grimoire-year-review", title: "How to: your year in review" })])
      )
    );
    return out.join("");
  }

  const draw = () => kit.render(root, view());

  /** The year-end page, written as the holy pages write theirs (grimoire/holyOps.ts): the book if there's none, the section, the page. */
  async function writePage() {
    const span = spanNow();
    const ref = YR.yearPageRef(span);
    const existing = data.pages.find((p) => p.metadata?.holyRef === ref);
    if (existing || pageId) return kit.go(`/grimoire/?page=${encodeURIComponent(existing?.id || pageId)}`);
    if (!user || !db() || !H?.holyOps) throw new Error("Sign in to keep it in your Grimoire.");
    const [books, sections, pages] = await Promise.all([
      db().from("grimoire_books").select("id,title,created_at,updated_at").eq("user_id", user.id).order("created_at"),
      db().from("grimoire_sections").select("id,book_id,title,sort_order,created_at").eq("user_id", user.id),
      db().from("grimoire_pages").select("id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at").eq("user_id", user.id)
    ]);
    if (books.error || sections.error || pages.error) throw new Error("Your Grimoire couldn’t be opened just now.");
    const found = (pages.data || []).find((p) => p.metadata?.holyRef === ref);
    if (found) return kit.go(`/grimoire/?page=${encodeURIComponent(found.id)}`);
    const snapshot = { fetchedAt: new Date().toISOString(), books: books.data || [], sections: sections.data || [], pages: pages.data || [], blocks: [], links: [] };
    const r = reviewOf(span);
    const { id, ops } = H.holyOps.holyPageOps(snapshot, { userId: user.id, now: new Date().toISOString() }, YR.yearPage(r, YR.reflectionPrompts(r)), H.newId);
    for (const op of ops) {
      if (op.kind !== "insert") continue;
      const { error } = await db().from(op.table).insert(op.row);
      if (error && error.code !== "23505") throw new Error("It couldn’t be kept in your Grimoire just now.");
    }
    pageId = id;
    kit.go(`/grimoire/?page=${encodeURIComponent(id)}`);
  }

  kit.delegate(root, {
    earlier() {
      at = YS.previousSpan(spanNow(), settings, place).start;
      notice = "";
      draw();
    },
    later() {
      at = YS.nextSpan(spanNow(), settings, place).start;
      notice = "";
      draw();
    },
    async "year-start"(el) {
      const value = el.dataset.value;
      if (!YS.YEAR_STARTS.some((o) => o.id === value)) return;
      settings = { ...settings, [YS.YEAR_START_KEY]: value };
      at = new Date();
      draw();
      try {
        await global.SaltSettings?.patch({ [YS.YEAR_START_KEY]: value });
      } catch (error) {
        console.warn(error);
        notice = "Your choice couldn’t be saved just now; it holds for this visit.";
        draw();
      }
    },
    async "copy-card"() {
      const text = YR.shareText(reviewOf(spanNow()));
      try {
        await global.navigator.clipboard.writeText(text);
        notice = "Copied. Paste it wherever you like.";
      } catch {
        notice = "It couldn’t be copied here.";
      }
      draw();
    },
    async "write-page"() {
      if (saving) return;
      saving = true;
      draw();
      try {
        await writePage();
      } catch (error) {
        saving = false;
        notice = error?.message || "It couldn’t be kept in your Grimoire just now.";
        draw();
      }
    }
  });

  kit.start(async (who) => {
    user = who;
    settings = (await kit.settings()) || {};
    place = kit.readPlace();
    data = null;
    draw();
    await load();
    draw();
  });
})(window);
