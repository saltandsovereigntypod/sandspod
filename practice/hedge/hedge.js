/*
 * Hedge (/practice/hedge/…): the dream journal with its symbols, a log of
 * readings, and the beloved dead. The app's screens in
 * app/src/app/(tabs)/rituals/craft/hedge; logic from js/core/practice-a.js.
 * Kept in craft_entries as the app keeps them: `hedge.dreams`,
 * `hedge.readings` and `hedge.ancestors`.
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.["practice-a"];
  const root = kit?.root();
  if (!kit || !core || !root) return;

  const { dreams: D, dreamSymbols: DS, readings: R, ancestors: A, calendar, holidays, meanings, premade, practices } = core;
  const view = root.dataset.view;
  const params = new URLSearchParams(global.location.search);
  const id = params.get("id");
  const fullDate = (key) => calendar.fullDate(key) ?? key;
  const shortDay = (key) => calendar.fullDate(key)?.replace(/, \d{4}$/, "") ?? key;
  const url = {
    dreams: kit.href.tool("hedge", "dreams"),
    dream: (x) => kit.href.tool("hedge", "dreams/dream", `id=${encodeURIComponent(x)}`),
    dreamEdit: (x) => kit.href.tool("hedge", "dreams/edit", x ? `id=${encodeURIComponent(x)}` : ""),
    symbols: kit.href.tool("hedge", "dreams/symbols"),
    readings: kit.href.tool("hedge", "readings"),
    reading: (x) => kit.href.tool("hedge", "readings/reading", `id=${encodeURIComponent(x)}`),
    readingEdit: (x) => kit.href.tool("hedge", "readings/edit", x ? `id=${encodeURIComponent(x)}` : ""),
    ancestors: kit.href.tool("hedge", "ancestors"),
    person: (x) => kit.href.tool("hedge", "ancestors/person", `id=${encodeURIComponent(x)}`),
    personEdit: (x) => kit.href.tool("hedge", "ancestors/edit", x ? `id=${encodeURIComponent(x)}` : "")
  };
  const supportLink = () => kit.support(core.support);
  let user = null;
  let settings = {};
  let dreams = [];
  let readings = [];
  let people = [];
  let loaded = false;

  async function load() {
    const [d, r, a] = await Promise.all([kit.entries(D.DREAMS), kit.entries(R.READINGS), kit.entries(A.ANCESTORS)]);
    dreams = d.map((e) => ({ ...e, data: D.normalizeDream(e.data) }));
    readings = R.sortReadings(r.map((e) => ({ ...e, data: R.normalizeReading(e.data) })));
    people = a.map((e) => ({ ...e, data: A.normalizeAncestor(e.data) })).sort((x, y) => x.data.name.localeCompare(y.data.name));
    loaded = true;
  }
  const notFound = (backHtml, title, text) => [backHtml, kit.head({ title }), kit.p(loaded ? text : "Opening…")].join("");

  /** Anniversaries and ancestor days together, soonest first (the hub's "Coming up for the dead"). Pure. */
  function comingForTheDead(anniversaries, days, now) {
    return [
      ...anniversaries.map((a) => ({ key: `${a.id}-${a.kind}`, title: a.name, detail: `${A.anniversaryWords(a)} · ${calendar.relativeDay(now, a.date)}`, id: a.id, inDays: a.inDays })),
      ...days.map((d) => ({ key: `day-${d.name}`, title: d.name, detail: `An ancestor day · ${calendar.relativeDay(now, d.date)}`, id: null, inDays: d.inDays }))
    ].sort((a, b) => a.inDays - b.inDays);
  }

  // ------------------------------------------------------------------ hub

  function hubView() {
    const now = new Date();
    const about = premade.PRACTICES.find((p) => p.id === "hedge")?.about;
    const tonight = D.dreamMoon(kit.dateKey(new Date(now.getTime() + 86_400_000)));
    const due = R.comeBackTo(readings, now);
    const anniversaries = A.upcomingAnniversaries(people, now, 30);
    const days = A.ancestorDays(holidays.holidayChoice(settings), now, 30);
    const lastDream = D.sortDreams(dreams)[0]?.data;
    const details = [
      dreams.length ? `${kit.plural(dreams.length, "dream", "dreams")}${lastDream?.title ? ` · last: ${lastDream.title}` : ""}` : null,
      due.length ? `${due.length} to come back to` : readings.length ? kit.plural(readings.length, "reading", "readings") : null,
      people.length ? `${people.length} remembered` : null
    ];
    const paths = [url.dreams, url.readings, url.ancestors];
    const coming = comingForTheDead(anniversaries, days, now);
    return [
      kit.back(kit.href.hub, "My practice"),
      kit.head({ eyebrow: "My practice", title: "Hedge", lede: about }),
      kit.card(
        `${kit.big(`${tonight.moonPhase} in ${tonight.moonSign}`)}${kit.muted(
          "Keep a notebook by the bed. Write as soon as you wake, before you move or check your phone; dreams fade within minutes."
        )}`,
        { gold: true, label: "Tonight’s dreaming moon" }
      ),
      kit.section("Tools", kit.list(practices.CRAFT_TOOLS.hedge.map((t, i) => kit.row({ url: paths[i], title: t.title, detail: details[i] ?? t.detail }))), { id: "tools" }),
      due.length
        ? kit.section("Come back to", kit.list(due.slice(0, 3).map((e) => kit.row({ url: url.reading(e.id), title: e.data.question || "A reading", detail: "Its look-back day has come: what happened?" }))), { id: "due" })
        : "",
      coming.length
        ? kit.section("Coming up for the dead", kit.list(coming.slice(0, 5).map((c) => kit.row({ url: c.id ? url.person(c.id) : url.ancestors, title: c.title, detail: c.detail }))), { id: "coming" })
        : "",
      kit.landCard(),
      kit.list([kit.row({ url: kit.href.premadeList("hedge"), title: "Hedge workings", detail: "Premade rituals and spells; filter by Hedge" })])
    ].join("");
  }

  // ------------------------------------------------------------------ dream journal

  const journal = { query: "" };
  function dreamDetail(e) {
    const d = e.data;
    const marks = [d.lucid ? "lucid" : null, d.recurring ? "recurring" : null].filter(Boolean).join(", ");
    return kit.join([shortDay(d.date), d.moonPhase, marks || null, d.symbols.slice(0, 3).join(" · ") || null]);
  }
  function dreamResults() {
    const groups = D.groupByMonth(D.searchDreams(dreams, journal.query));
    if (!groups.length) return kit.muted("No dreams match that.");
    return groups.map((g) => kit.section(g.month, kit.list(g.entries.map((e) => kit.row({ url: url.dream(e.id), title: e.data.title || "Untitled dream", detail: dreamDetail(e) }))))).join("");
  }
  function dreamsView() {
    return [
      kit.back(kit.href.practice("hedge"), "Hedge"),
      kit.head({ eyebrow: kit.plural(dreams.length, "dream", "dreams"), title: "Dream journal" }),
      kit.actions([kit.button({ label: "Write down a dream", url: url.dreamEdit(), primary: true })]),
      !dreams.length
        ? kit.card(
            kit.p(
              "Nothing written yet. The first dream you catch, write it here: the moon it came under is noted for you, and over the months your symbols and patterns begin to show."
            )
          )
        : [
            kit.field({ id: "dream-search", label: "Search your dreams", value: journal.query, input: "dream-search", placeholder: "A word, a symbol, a feeling", type: "search" }),
            dreams.length >= 3 ? kit.list([kit.row({ url: url.symbols, title: "Symbols and moons", detail: "What keeps returning, and the phases your dreams cluster in" })]) : "",
            `<div data-results>${dreamResults()}</div>`
          ].join(""),
      dreams.length < 3 ? kit.list([kit.row({ url: url.symbols, title: "Dream symbols", detail: "Common associations, as starting points" })]) : "",
      kit.muted(kit.savedLine(user, "your dreams")),
      supportLink()
    ].join("");
  }

  function dreamView() {
    const back = kit.back(url.dreams, "Dream journal");
    const entry = dreams.find((e) => e.id === id);
    if (!entry) return notFound(back, "Dream", "This dream couldn’t be found. It may have been deleted on another device.");
    const d = entry.data;
    const returning = D.returningSymbols(dreams, entry);
    const refs = d.symbols.map((s) => ({ s, ref: DS.symbolReference(s) })).filter((x) => x.ref);
    const marks = [d.lucid ? "Lucid" : null, d.recurring ? "Recurring" : null, `Vividness ${d.vividness} · ${D.VIVIDNESS[d.vividness - 1]?.label ?? ""}`].filter(Boolean);
    const mood = meanings.MOON_IN_SIGN[d.moonSign]?.mood;
    return [
      back,
      kit.head({ eyebrow: fullDate(d.date), title: d.title || "Untitled dream" }),
      kit.card(`${kit.big(`${d.moonPhase} in ${d.moonSign}`)}${mood ? kit.muted(mood) : ""}`, { gold: true, label: "The moon that night" }),
      d.dream ? kit.section("The dream", kit.p(d.dream), { id: "the-dream" }) : "",
      d.feelings ? kit.section("Feelings", kit.p(d.feelings), { id: "feelings" }) : "",
      kit.chips(marks.map((m) => kit.chip({ label: m }))),
      d.symbols.length
        ? kit.section("Symbols", `${kit.chips(d.symbols.map((s) => kit.chip({ label: s })))}${returning.length ? kit.muted(`Returning from other dreams: ${returning.join(", ")}.`) : ""}`, { id: "symbols" })
        : "",
      refs.length
        ? kit.section(
            "Places to start",
            `${refs.map(({ s, ref }) => kit.card(`<h3 class="pr-big">${kit.esc(s)}</h3>${kit.p(ref.notes)}${kit.muted(ref.ask)}`)).join("")}${kit.muted("Your own associations matter most: what does this mean to you?")}`,
            { id: "places" }
          )
        : "",
      kit.actions([kit.button({ label: "Edit", url: url.dreamEdit(entry.id), ghost: true })]),
      supportLink()
    ].join("");
  }

  // Writing a dream
  const dreamForm = { ready: false, dream: null, symbolText: "", typedDate: "", saving: false, problem: "" };
  function dreamEditView() {
    const back = kit.back(id ? url.dream(id) : url.dreams, id ? "Dream" : "Dream journal");
    const existing = id ? dreams.find((e) => e.id === id) : null;
    if (id && !existing) return notFound(back, "Dream", "This dream couldn’t be found. It may have been deleted on another device.");
    if (!dreamForm.ready) {
      dreamForm.ready = true;
      dreamForm.dream = existing ? { ...existing.data } : D.blankDream(new Date());
    }
    const dream = dreamForm.dream;
    const known = D.symbolCounts(dreams)
      .map((s) => s.symbol)
      .filter((s) => !dream.symbols.includes(s))
      .slice(0, 12);
    const recent = kit.recentDays(new Date(), 7);
    const dayChips = recent.map((key, i) => kit.chip({ label: i === 0 ? "This morning" : i === 1 ? "Yesterday" : shortDay(key), act: "dream-day", value: key, pressed: dream.date === key }));
    if (!recent.includes(dream.date)) dayChips.push(kit.chip({ label: fullDate(dream.date), act: "dream-day", value: dream.date, pressed: true }));
    return [
      back,
      kit.head({ eyebrow: existing ? "Edit dream" : "Before it fades", title: existing ? "Your dream" : "Write down a dream" }),
      `<div class="sp-section">${kit.field({ id: "dream-text", label: "The dream", value: dream.dream, input: "dream-field", multiline: true, placeholder: "Everything you remember, even fragments. Present tense helps." })}${kit.field({
        id: "dream-title",
        label: "Title",
        value: dream.title,
        input: "dream-field",
        placeholder: "A few words to find it by"
      })}${kit.field({ id: "dream-feelings", label: "Feelings", value: dream.feelings, input: "dream-field", multiline: true, placeholder: "In the dream, and on waking" })}</div>`,
      kit.section(
        "Which morning?",
        `${kit.chips(dayChips, "Which morning")}${kit.field({
          id: "dream-typed-date",
          label: "Or another date (YYYY-MM-DD)",
          value: dreamForm.typedDate,
          input: "dream-typed-date",
          placeholder: "2026-03-14",
          inputmode: "numeric"
        })}${kit.muted(`The moon that night: ${dream.moonPhase}, in ${dream.moonSign}.`)}`,
        { id: "morning" }
      ),
      kit.section(
        "Symbols",
        [
          dream.symbols.length ? kit.chips(dream.symbols.map((s) => kit.chip({ label: `${s}  ×`, act: "symbol-remove", value: s, a11y: `Remove ${s}` })), "Symbols in this dream") : "",
          kit.field({ id: "symbol-text", label: "Add symbols", value: dreamForm.symbolText, input: "symbol-text", placeholder: "river, black dog, a key (commas between)" }),
          kit.actions([kit.button({ label: "Add", act: "symbol-add", small: true, ghost: true, id: "symbol-add" })]),
          known.length ? `${kit.muted("From your other dreams")}${kit.chips(known.map((s) => kit.chip({ label: s, act: "symbol-known", value: s, a11y: `Add ${s}` })), "From your other dreams")}` : ""
        ].join(""),
        { id: "symbols" }
      ),
      kit.section("How vivid?", kit.chips(D.VIVIDNESS.map((v) => kit.chip({ label: `${v.value} · ${v.label}`, act: "vivid", value: v.value, pressed: dream.vividness === v.value })), "How vivid"), {
        id: "vivid"
      }),
      `<div>${kit.toggle({ id: "dream-lucid", label: "Lucid", detail: "You knew you were dreaming", checked: dream.lucid, change: "dream-flag" })}${kit.toggle({
        id: "dream-recurring",
        label: "Recurring",
        detail: "You’ve had this dream before",
        checked: dream.recurring,
        change: "dream-flag"
      })}</div>`,
      !user ? kit.notice("Saved in this browser. Sign in to keep your dreams with your account.") : "",
      kit.notice(dreamForm.problem, { live: true }),
      kit.actions([
        kit.button({ label: dreamForm.saving ? "Keeping it…" : existing ? "Save changes" : "Keep this dream", act: "dream-save", primary: true, disabled: dreamForm.saving, id: "dream-save" }),
        existing ? kit.textButton({ label: "Delete this dream", act: "dream-delete", quiet: true }) : ""
      ])
    ].join("");
  }

  function symbolsView() {
    const symbols = D.symbolCounts(dreams).slice(0, 15);
    const phases = D.phaseCounts(dreams);
    const stats = D.dreamStats(dreams);
    const note = D.phaseClusterNote(dreams);
    const most = Math.max(1, ...phases.map((p) => p.count));
    return [
      kit.back(url.dreams, "Dream journal"),
      kit.head({ eyebrow: "Your dreams", title: "Symbols and moons" }),
      stats.total
        ? kit.card(
            kit.p(
              kit.join([
                kit.plural(stats.total, "dream", "dreams"),
                stats.lucid ? `${stats.lucid} lucid` : null,
                stats.recurring ? `${stats.recurring} recurring` : null,
                stats.vividness ? `vividness ${stats.vividness} on average` : null
              ])
            )
          )
        : "",
      symbols.length
        ? kit.section(
            "What keeps returning",
            `<ul class="sp-chips" style="list-style:none;margin:0;padding:0">${symbols
              .map((s) => {
                const last = kit.fromKey(s.last);
                return `<li class="sp-chip sp-chip--static" aria-label="${kit.esc(`${s.symbol}, in ${kit.plural(s.count, "dream", "dreams")}${last ? `, last on ${calendar.shortDate(last)}` : ""}`)}">${kit.esc(`${s.symbol} · ${s.count}`)}</li>`;
              })
              .join("")}</ul>`,
            { id: "returning" }
          )
        : "",
      stats.total
        ? kit.section(
            "The moons you dream under",
            `${kit.card(
              `<ul class="pr-bars">${phases
                .map(
                  (p) =>
                    `<li class="pr-bar"><span>${kit.esc(p.phase)}</span><span class="pr-bar__track" aria-hidden="true"><span class="pr-bar__fill" style="display:block;width:${(p.count / most) * 100}%"></span></span><span class="pr-bar__count">${p.count}</span></li>`
                )
                .join("")}</ul>`
            )}${
              note
                ? kit.muted(`${note} The crescents and gibbous moons last about a week each and the four main phases only a day or so, so that’s taken into account.`)
                : kit.muted("After a few more dreams you’ll see whether they gather around a phase.")
            }`,
            { id: "moons" }
          )
        : "",
      kit.section(
        "Common symbols",
        `${kit.muted(DS.DREAM_SYMBOL_INTRO)}${DS.DREAM_SYMBOLS.map((s) =>
          kit.details(kit.cap(s.symbol), `${kit.p(s.notes)}${kit.muted(`Ask yourself: ${s.ask}`)}${s.also.length ? kit.muted(`Also: ${s.also.join(", ")}`) : ""}`)
        ).join("")}${kit.muted("Your own associations matter most.")}`,
        { id: "common" }
      )
    ].join("");
  }

  // ------------------------------------------------------------------ readings

  const filter = { query: "", method: null };
  const readingDetail = (e) => kit.join([R.methodLabel(e.data.method), shortDay(e.data.date), e.data.drawn.slice(0, 3).join(", ") || null, e.data.outcome ? "looked back" : null]);
  function readingResults() {
    const found = R.searchReadings(readings, filter.query, filter.method);
    return found.length ? kit.list(found.map((e) => kit.row({ url: url.reading(e.id), title: e.data.question || "A reading", detail: readingDetail(e) }))) : kit.muted("No readings match that.");
  }
  function readingsView() {
    const now = new Date();
    const due = R.comeBackTo(readings, now);
    const later = R.waiting(readings, now);
    const repeats = R.frequentDraws(readings, 6);
    const used = R.METHODS.filter((m) => readings.some((e) => e.data.method === m.id));
    return [
      kit.back(kit.href.practice("hedge"), "Hedge"),
      kit.head({ eyebrow: kit.plural(readings.length, "reading", "readings"), title: "Readings" }),
      kit.actions([kit.button({ label: "Log a reading", url: url.readingEdit(), primary: true })]),
      !readings.length
        ? kit.card(
            kit.p(
              "Log what you asked, what came up and what you made of it, and choose a day to come back. When that day comes, the reading waits here for you to write what really happened: the best way to learn your own cards, runes and cup."
            )
          )
        : [
            due.length
              ? kit.section("Come back to", `${kit.muted("Their look-back day has come. What happened?")}${kit.list(due.map((e) => kit.row({ url: url.reading(e.id), title: e.data.question || "A reading", detail: readingDetail(e) })))}`, {
                  id: "due"
                })
              : "",
            later.length
              ? kit.section(
                  "Waiting",
                  kit.list(
                    later.slice(0, 5).map((e) => {
                      const day = kit.fromKey(e.data.lookBack);
                      return kit.row({ url: url.reading(e.id), title: e.data.question || "A reading", detail: `${R.methodLabel(e.data.method)} · look back ${day ? calendar.relativeDay(now, day) : e.data.lookBack}` });
                    })
                  ),
                  { id: "waiting" }
                )
              : "",
            repeats.length
              ? kit.section(
                  "Turning up again",
                  kit.chips(repeats.map((r) => kit.chip({ label: `${r.name} · ${r.count}`, act: "search-for", value: r.name, a11y: `${r.name}, in ${r.count} readings. Search for it` }))),
                  { id: "repeats" }
                )
              : "",
            kit.section(
              "All readings",
              [
                kit.field({ id: "reading-search", label: "Search readings", value: filter.query, input: "reading-search", placeholder: "A question, a card, a word", type: "search" }),
                used.length > 1
                  ? kit.chips(
                      [kit.chip({ label: "All", act: "method-filter", value: "", pressed: filter.method === null }), ...used.map((m) => kit.chip({ label: m.label, act: "method-filter", value: m.id, pressed: filter.method === m.id }))],
                      "Method"
                    )
                  : "",
                `<div data-results>${readingResults()}</div>`
              ].join(""),
              { id: "all" }
            )
          ].join(""),
      kit.muted(kit.savedLine(user, "your readings"))
    ].join("");
  }

  const outcome = { text: null, saving: false };
  function readingView() {
    const back = kit.back(url.readings, "Readings");
    const entry = readings.find((e) => e.id === id);
    if (!entry) return notFound(back, "Reading", "This reading couldn’t be found. It may have been deleted on another device.");
    const r = entry.data;
    const today = kit.dateKey(new Date());
    const due = !!r.lookBack && r.lookBack <= today && !r.outcome.trim();
    const writing = outcome.text !== null || due;
    const text = outcome.text ?? r.outcome;
    let looking;
    if (writing) {
      looking = `${due ? kit.p(`You said you’d come back to this on ${fullDate(r.lookBack)}. What happened? Was the reading right, wrong, or right in a way you didn’t expect?`) : ""}${kit.field({
        id: "outcome",
        label: "What happened",
        value: text,
        input: "outcome",
        multiline: true,
        placeholder: "In your own words"
      })}${kit.actions([kit.button({ label: outcome.saving ? "Saving…" : "Save what happened", act: "outcome-save", primary: true, disabled: outcome.saving || !text.trim(), id: "outcome-save" })])}`;
    } else if (r.outcome) {
      looking = `${kit.p(r.outcome)}${r.outcomeDate ? kit.muted(`Written ${fullDate(r.outcomeDate)}`) : ""}${kit.textButton({ label: "Add to this", act: "outcome-open", value: "add" })}`;
    } else if (r.lookBack) {
      looking = `${kit.p(`It will come back to you on ${fullDate(r.lookBack)}.`)}${kit.textButton({ label: "Write what happened now", act: "outcome-open", value: "" })}`;
    } else {
      looking = kit.textButton({ label: "Write what happened", act: "outcome-open", value: "" });
    }
    return [
      back,
      kit.head({ eyebrow: `${R.methodLabel(r.method)} · ${fullDate(r.date)}`, title: r.question || "A reading" }),
      kit.muted(`Under a ${r.moonPhase}`),
      r.drawn.length
        ? kit.section(
            "Drawn",
            kit.chips(
              r.drawn.map((n, i) => {
                const gloss = R.glossOf(n);
                return kit.chip({ label: `${i + 1}. ${n}${gloss ? ` · ${gloss}` : ""}` });
              })
            ),
            { id: "drawn" }
          )
        : "",
      r.cameUp ? kit.section("What came up", kit.p(r.cameUp), { id: "came-up" }) : "",
      r.interpretation ? kit.section("What you made of it", kit.p(r.interpretation), { id: "made-of" }) : "",
      kit.card(looking, { gold: due, label: "Looking back" }),
      kit.actions([kit.button({ label: "Edit", url: url.readingEdit(entry.id), ghost: true })])
    ].join("");
  }

  const CAME_UP_HINT = {
    tarot: "The spread, positions, reversals, what struck you",
    oracle: "The deck, the cards, the words or images",
    runes: "How they fell, which landed face up, reversed (merkstave)",
    tea: "Shapes near the rim (soon) or the bottom (later), and where the handle points",
    scrying: "What you saw in the water, mirror, glass or flame",
    pendulum: "The questions you asked and how it swung",
    ogham: "The staves drawn, and how they lay",
    other: "What came up"
  };
  const readingForm = { ready: false, r: null, cardQuery: "", typedLookBack: "", saving: false, problem: "" };
  function readingEditView() {
    const back = kit.back(id ? url.reading(id) : url.readings, id ? "Reading" : "Readings");
    const existing = id ? readings.find((e) => e.id === id) : null;
    if (id && !existing) return notFound(back, "Reading", "This reading couldn’t be found. It may have been deleted on another device.");
    if (!readingForm.ready) {
      readingForm.ready = true;
      readingForm.r = existing ? { ...existing.data, drawn: [...existing.data.drawn] } : R.blankReading(new Date());
    }
    const r = readingForm.r;
    const recent = kit.recentDays(new Date(), 7);
    const dayChips = recent.map((key, i) => kit.chip({ label: i === 0 ? "Today" : i === 1 ? "Yesterday" : shortDay(key), act: "reading-day", value: key, pressed: r.date === key }));
    if (!recent.includes(r.date)) dayChips.push(kit.chip({ label: fullDate(r.date), act: "reading-day", value: r.date, pressed: true }));
    const q = readingForm.cardQuery.trim();
    const cards = q ? R.searchTarot(q).slice(0, 14) : R.MAJOR_ARCANA;
    let picks = "";
    if (["runes", "ogham", "tarot"].includes(r.method)) {
      const drawn = r.drawn.length
        ? `${kit.muted("In the order drawn. Tap one to take it out.")}${kit.chips(r.drawn.map((n, i) => kit.chip({ label: `${i + 1}. ${n}`, act: "drawn-toggle", value: n, pressed: true, a11y: `${n}, drawn ${i + 1}. Remove` })), "Drawn")}`
        : "";
      let choose = "";
      if (r.method === "tarot") {
        choose = `${kit.field({ id: "card-query", label: "Find a card", value: readingForm.cardQuery, input: "card-query", placeholder: "queen cups, 3 swords, tower" })}${
          !q ? kit.muted("The Major Arcana; type to find the minor cards.") : ""
        }${kit.chips(cards.filter((c) => !r.drawn.includes(c)).map((c) => kit.chip({ label: c, act: "drawn-toggle", value: c, a11y: `Add ${c}` })), "Cards")}${q && !cards.length ? kit.muted("No card by that name.") : ""}`;
      } else if (r.method === "runes") {
        choose = kit.chips(R.ELDER_FUTHARK.filter((x) => !r.drawn.includes(x.name)).map((x) => kit.chip({ label: x.name, act: "drawn-toggle", value: x.name, a11y: `Add ${x.name}, ${x.gloss}` })), "Runes");
      } else {
        choose = kit.chips(R.OGHAM.filter((x) => !r.drawn.includes(x.name)).map((x) => kit.chip({ label: x.name, act: "drawn-toggle", value: x.name, a11y: `Add ${x.name}, ${x.gloss}` })), "Staves");
      }
      picks = kit.section(r.method === "tarot" ? "Cards drawn" : r.method === "runes" ? "Runes drawn" : "Staves drawn", drawn + choose, { id: "drawn" });
    }
    return [
      back,
      kit.head({ eyebrow: existing ? "Edit reading" : "Log a reading", title: existing ? "Your reading" : "What did you ask?" }),
      kit.section("Method", kit.chips(R.METHODS.map((m) => kit.chip({ label: m.label, act: "method", value: m.id, pressed: r.method === m.id })), "Method"), { id: "method" }),
      kit.field({ id: "question", label: "The question", value: r.question, input: "reading-field", multiline: true, placeholder: "What you asked, as you asked it" }),
      kit.section("When?", `${kit.chips(dayChips, "When")}${kit.muted(`Moon: ${r.moonPhase}`)}`, { id: "when" }),
      picks,
      kit.field({ id: "came-up", label: "What came up", value: r.cameUp, input: "reading-field", multiline: true, placeholder: CAME_UP_HINT[r.method] }),
      kit.field({ id: "interpretation", label: "What you make of it", value: r.interpretation, input: "reading-field", multiline: true, placeholder: "Your reading of the reading" }),
      kit.section(
        "Come back to it",
        `${kit.chips(
          [
            ...R.LOOK_BACK_CHOICES.map((c) => {
              const key = R.lookBackFrom(r.date, c.days);
              return kit.chip({ label: c.label, act: "look-back", value: key, pressed: r.lookBack === key });
            }),
            kit.chip({ label: "Not needed", act: "look-back", value: "", pressed: !r.lookBack })
          ],
          "Come back to it"
        )}${kit.field({ id: "look-back-typed", label: "Or a date (YYYY-MM-DD)", value: readingForm.typedLookBack, input: "look-back-typed", placeholder: "2027-01-01", inputmode: "numeric" })}${
          r.lookBack ? kit.muted(`It will wait for you in Come back to from ${fullDate(r.lookBack)}.`) : ""
        }`,
        { id: "look-back" }
      ),
      !user ? kit.notice("Saved in this browser. Sign in to keep your readings with your account.") : "",
      kit.notice(readingForm.problem, { live: true }),
      kit.actions([
        kit.button({ label: readingForm.saving ? "Keeping it…" : existing ? "Save changes" : "Keep this reading", act: "reading-save", primary: true, disabled: readingForm.saving, id: "reading-save" }),
        existing ? kit.textButton({ label: "Delete this reading", act: "reading-delete", quiet: true }) : ""
      ])
    ].join("");
  }

  // ------------------------------------------------------------------ ancestors

  function ancestorsView() {
    const now = new Date();
    const anniversaries = A.upcomingAnniversaries(people, now, 30);
    const days = A.ancestorDays(holidays.holidayChoice(settings), now, 30);
    return [
      kit.back(kit.href.practice("hedge"), "Hedge"),
      kit.head({ eyebrow: "The beloved dead", title: "Ancestors", lede: "Your blood family, the family you chose, teachers, friends, and those whose names are lost. Anyone you carry." }),
      anniversaries.length || days.length
        ? kit.section(
            "In the next 30 days",
            `${kit.list(anniversaries.map((a) => kit.row({ url: url.person(a.id), title: a.name, detail: `${A.anniversaryWords(a)} · ${calendar.relativeDay(now, a.date)}` })))}${days
              .map((d) => kit.card(`<h3 class="pr-big">${kit.esc(d.name)}</h3>${kit.muted(`${calendar.longDate(d.date)}${d.days > 1 ? ` · ${d.days} days` : ""} · ${calendar.relativeDay(now, d.date)}`)}${kit.p(d.meaning)}`))
              .join("")}`,
            { id: "soon" }
          )
        : "",
      kit.actions([kit.button({ label: "Add someone", url: url.personEdit(), primary: true })]),
      !people.length
        ? kit.card(kit.p("Add the people you remember. Dates can be as much as you know, even a year alone. Their birth and death days will be here when they come round, with a candle to light for them."))
        : kit.section("Remembered", kit.list(people.map((p) => kit.row({ url: url.person(p.id), title: p.data.name || "Unnamed", detail: kit.join([p.data.relation, A.lifespan(p.data)]) || null }))), { id: "remembered" }),
      kit.list([kit.row({ url: kit.href.premade("hedge-ancestor-candle-evening"), title: "Ancestor Altar & Candle Evening", detail: "A longer evening with all your dead" })]),
      kit.list([
        kit.row({
          url: kit.href.settings,
          title: "Ancestor days",
          detail: "Samhain, Dziady, All Souls, Parentalia and Winter Nights come from the calendars you keep: Settings → Calendar"
        })
      ]),
      kit.muted(kit.savedLine(user, "them")),
      supportLink()
    ].join("");
  }

  function ancestorView() {
    const back = kit.back(url.ancestors, "Ancestors");
    const entry = people.find((e) => e.id === id);
    if (!entry) return notFound(back, "Ancestor", "This page couldn’t be found. It may have been removed on another device.");
    const person = entry.data;
    const now = new Date();
    const days = A.upcomingAnniversaries([entry], now, 366);
    const born = A.formatPartial(person.born);
    const died = A.formatPartial(person.died);
    return [
      back,
      kit.head({ eyebrow: person.relation || "Remembered", title: person.name || "Unnamed" }),
      born || died ? kit.muted(kit.join([born ? `Born ${born}` : null, died ? `Died ${died}` : null])) : "",
      kit.card(
        `<h2 class="pr-big">Light a candle for them</h2>${kit.p("A short guided rite of about ten minutes: light a candle, say their name, remember, and tell them what you need to.")}${kit.actions([
          kit.button({ label: "Light a candle", act: "candle", primary: true })
        ])}${kit.muted("Never leave a flame unattended.")}`,
        { gold: true }
      ),
      days.length ? kit.section("Their days", days.map((a) => kit.p(`${A.anniversaryWords(a)}: ${calendar.relativeDay(now, a.date)}`)).join(""), { id: "days" }) : "",
      person.loved ? kit.section("What they loved", kit.p(person.loved), { id: "loved" }) : "",
      person.memory ? kit.section("A memory", kit.p(person.memory), { id: "memory" }) : "",
      kit.actions([kit.button({ label: "Edit", url: url.personEdit(entry.id), ghost: true })]),
      supportLink()
    ].join("");
  }

  const personForm = { ready: false, person: null, born: null, died: null, saving: false, problem: "" };
  const boxesOf = (d) => ({ day: d.day ? String(d.day) : "", month: d.month ? String(d.month) : "", year: d.year ? String(d.year) : "" });
  function dateBoxes(which, label, value) {
    const read = A.partialDate(value.day, value.month, value.year);
    const typed = value.day || value.month || value.year;
    const shown = A.formatPartial(read);
    return `<fieldset class="sp-section" style="border:0;padding:0;margin:0"><legend class="sp-label">${kit.esc(label)}</legend><div class="pr-datebox">${kit.field({
      id: `${which}-day`,
      label: "Day",
      value: value.day,
      input: "date-box",
      inputmode: "numeric",
      placeholder: "14"
    })}${kit.field({ id: `${which}-month`, label: "Month", value: value.month, input: "date-box", inputmode: "numeric", placeholder: "5" })}${kit.field({
      id: `${which}-year`,
      label: "Year",
      value: value.year,
      input: "date-box",
      inputmode: "numeric",
      placeholder: "1932"
    })}</div>${typed ? `<p class="sp-muted" aria-live="polite">${kit.esc(shown ? `Kept as ${shown}` : "That date doesn’t look right; check the day and month.")}</p>` : ""}</fieldset>`;
  }
  function ancestorEditView() {
    const existing = id ? people.find((e) => e.id === id) : null;
    const back = kit.back(existing ? url.person(existing.id) : url.ancestors, existing ? existing.data.name || "Ancestor" : "Ancestors");
    if (id && !existing) return notFound(back, "Ancestor", "This page couldn’t be found. It may have been removed on another device.");
    if (!personForm.ready) {
      personForm.ready = true;
      const start = existing ? existing.data : A.blankAncestor();
      personForm.person = { ...start };
      personForm.born = boxesOf(start.born);
      personForm.died = boxesOf(start.died);
    }
    const p = personForm.person;
    return [
      back,
      kit.head({ eyebrow: existing ? "Edit" : "Remember someone", title: existing ? p.name || "Ancestor" : "Who are you remembering?" }),
      `<div class="sp-section">${kit.field({ id: "name", label: "Name", value: p.name, input: "person-field", placeholder: "As you knew them" })}${kit.field({
        id: "relation",
        label: "Who they are to you",
        value: p.relation,
        input: "person-field",
        placeholder: "Grandmother, great-uncle, teacher, friend"
      })}</div>`,
      `<div data-boxes="born">${dateBoxes("born", "Born", personForm.born)}</div>`,
      `<div data-boxes="died">${dateBoxes("died", "Died", personForm.died)}</div>`,
      kit.muted("Put in as much as you know. A year alone is fine; a day and month bring their anniversary round each year."),
      `<div class="sp-section">${kit.field({
        id: "loved",
        label: "What they loved, and what you offer them",
        value: p.loved,
        input: "person-field",
        multiline: true,
        placeholder: "Strong tea, roses, a song, a nip of whisky"
      })}${kit.field({ id: "memory", label: "A memory", value: p.memory, input: "person-field", multiline: true, placeholder: "Something you want to keep" })}</div>`,
      !user ? kit.notice("Saved in this browser. Sign in to keep them with your account.") : "",
      kit.notice(personForm.problem, { live: true }),
      kit.actions([
        kit.button({ label: personForm.saving ? "Saving…" : existing ? "Save changes" : "Remember them", act: "person-save", primary: true, disabled: personForm.saving, id: "person-save" }),
        existing ? kit.textButton({ label: "Remove this person", act: "person-delete", quiet: true }) : ""
      ])
    ].join("");
  }

  // ------------------------------------------------------------------ wiring

  const VIEWS = {
    hedge: hubView,
    "hedge-dreams": dreamsView,
    "hedge-dream": dreamView,
    "hedge-dream-edit": dreamEditView,
    "hedge-symbols": symbolsView,
    "hedge-readings": readingsView,
    "hedge-reading": readingView,
    "hedge-reading-edit": readingEditView,
    "hedge-ancestors": ancestorsView,
    "hedge-ancestor": ancestorView,
    "hedge-ancestor-edit": ancestorEditView
  };
  const draw = () => kit.render(root, (VIEWS[view] || hubView)());
  const results = (html) => {
    const box = root.querySelector("[data-results]");
    if (box) box.innerHTML = html;
  };
  const failed = (error, words) => {
    console.error(error);
    return `${words}${error?.message ? ` (${error.message})` : ""}. Your words are still here.`;
  };

  kit.bindSupport(root, core.support);
  kit.delegate(root, {
    // Dream journal
    "dream-search"(el) {
      journal.query = el.value;
      results(dreamResults());
    },
    "dream-field"(el) {
      const key = { "dream-text": "dream", "dream-title": "title", "dream-feelings": "feelings" }[el.id];
      if (key) dreamForm.dream[key] = el.value;
    },
    "dream-day"(el) {
      const date = el.dataset.value;
      dreamForm.dream = { ...dreamForm.dream, date, ...D.dreamMoon(date) };
      dreamForm.typedDate = "";
      draw();
    },
    "dream-typed-date"(el) {
      dreamForm.typedDate = el.value;
      const key = kit.fromKey(el.value.trim()) ? el.value.trim() : null;
      if (key) {
        dreamForm.dream = { ...dreamForm.dream, date: key, ...D.dreamMoon(key) };
        draw();
      }
    },
    "symbol-text"(el) {
      dreamForm.symbolText = el.value;
    },
    "symbol-add"() {
      let next = dreamForm.dream.symbols;
      for (const s of D.parseSymbols(dreamForm.symbolText)) next = D.addSymbol(next, s);
      dreamForm.dream.symbols = next;
      dreamForm.symbolText = "";
      draw();
      root.querySelector("#symbol-text")?.focus();
    },
    "symbol-known"(el) {
      dreamForm.dream.symbols = D.addSymbol(dreamForm.dream.symbols, el.dataset.value);
      draw();
    },
    "symbol-remove"(el) {
      dreamForm.dream.symbols = dreamForm.dream.symbols.filter((s) => s !== el.dataset.value);
      draw();
      root.querySelector("#symbol-text")?.focus();
    },
    vivid(el) {
      dreamForm.dream.vividness = Number(el.dataset.value);
      draw();
    },
    "dream-flag"(el) {
      dreamForm.dream[el.id === "dream-lucid" ? "lucid" : "recurring"] = el.checked;
    },
    async "dream-save"() {
      if (dreamForm.saving) return;
      let symbols = dreamForm.dream.symbols;
      for (const s of D.parseSymbols(dreamForm.symbolText)) symbols = D.addSymbol(symbols, s);
      const d = dreamForm.dream;
      const data = { ...d, symbols, title: d.title.trim(), dream: d.dream.trim(), feelings: d.feelings.trim() };
      if (!data.title && !data.dream) {
        dreamForm.problem = "Nothing to keep yet. Give the dream a title or write a little of it first.";
        draw();
        return;
      }
      dreamForm.saving = true;
      dreamForm.problem = "";
      draw();
      try {
        if (id) {
          await kit.update(D.DREAMS, id, data);
          kit.go(url.dream(id));
        } else {
          const entry = await kit.add(D.DREAMS, data);
          kit.go(url.dream(entry.id));
        }
      } catch (error) {
        dreamForm.saving = false;
        dreamForm.problem = failed(error, "It couldn’t be kept");
        draw();
      }
    },
    async "dream-delete"() {
      if (!kit.confirm("Delete this dream? It will be removed from your journal on every device.")) return;
      try {
        await kit.remove(D.DREAMS, id);
        kit.go(url.dreams);
      } catch (error) {
        dreamForm.problem = failed(error, "It couldn’t be deleted");
        draw();
      }
    },
    // Readings
    "reading-search"(el) {
      filter.query = el.value;
      results(readingResults());
    },
    "search-for"(el) {
      filter.query = el.dataset.value;
      draw();
      root.querySelector("#reading-search")?.focus();
    },
    "method-filter"(el) {
      const m = el.dataset.value || null;
      filter.method = filter.method === m ? null : m;
      draw();
    },
    outcome(el) {
      outcome.text = el.value;
      const btn = root.querySelector("#outcome-save");
      if (btn) btn.disabled = outcome.saving || !el.value.trim();
    },
    "outcome-open"(el) {
      const entry = readings.find((e) => e.id === id);
      outcome.text = el.dataset.value === "add" ? entry?.data.outcome ?? "" : "";
      draw();
      root.querySelector("#outcome")?.focus();
    },
    async "outcome-save"() {
      const entry = readings.find((e) => e.id === id);
      if (!entry || outcome.saving) return;
      const text = (outcome.text ?? entry.data.outcome).trim();
      outcome.saving = true;
      draw();
      try {
        const next = { ...entry.data, outcome: text, outcomeDate: text ? kit.dateKey(new Date()) : "" };
        await kit.update(R.READINGS, entry.id, next);
        entry.data = next;
        outcome.text = null;
      } catch (error) {
        console.error(error);
      } finally {
        outcome.saving = false;
        draw();
      }
    },
    method(el) {
      readingForm.r.method = el.dataset.value;
      draw();
    },
    "reading-field"(el) {
      const key = { question: "question", "came-up": "cameUp", interpretation: "interpretation" }[el.id];
      if (key) readingForm.r[key] = el.value;
    },
    "reading-day"(el) {
      const r = readingForm.r;
      const date = el.dataset.value;
      // Keep the look-back the same distance away when the reading's date moves.
      const from = kit.fromKey(r.date);
      const to = kit.fromKey(r.lookBack);
      const gap = from && to ? Math.round((to.getTime() - from.getTime()) / 86_400_000) : null;
      readingForm.r = { ...r, date, moonPhase: R.moonForReading(date), ...(gap !== null && !r.outcome ? { lookBack: R.lookBackFrom(date, gap) } : {}) };
      draw();
    },
    "card-query"(el) {
      readingForm.cardQuery = el.value;
      draw();
    },
    "drawn-toggle"(el) {
      const r = readingForm.r;
      const name = el.dataset.value;
      r.drawn = r.drawn.includes(name) ? r.drawn.filter((n) => n !== name) : [...r.drawn, name];
      draw();
    },
    "look-back"(el) {
      readingForm.r.lookBack = el.dataset.value;
      readingForm.typedLookBack = "";
      draw();
    },
    "look-back-typed"(el) {
      readingForm.typedLookBack = el.value;
      if (kit.fromKey(el.value.trim())) {
        readingForm.r.lookBack = el.value.trim();
        draw();
      }
    },
    async "reading-save"() {
      if (readingForm.saving) return;
      const r = readingForm.r;
      const data = { ...r, question: r.question.trim(), cameUp: r.cameUp.trim(), interpretation: r.interpretation.trim() };
      if (!data.question && !data.cameUp && !data.drawn.length) {
        readingForm.problem = "Nothing to keep yet. Write the question, or what came up.";
        draw();
        return;
      }
      readingForm.saving = true;
      readingForm.problem = "";
      draw();
      try {
        if (id) {
          await kit.update(R.READINGS, id, data);
          kit.go(url.reading(id));
        } else {
          const entry = await kit.add(R.READINGS, data);
          kit.go(url.reading(entry.id));
        }
      } catch (error) {
        readingForm.saving = false;
        readingForm.problem = failed(error, "It couldn’t be kept");
        draw();
      }
    },
    async "reading-delete"() {
      if (!kit.confirm("Delete this reading? It will be removed on every device.")) return;
      try {
        await kit.remove(R.READINGS, id);
        kit.go(url.readings);
      } catch (error) {
        readingForm.problem = failed(error, "It couldn’t be deleted");
        draw();
      }
    },
    // Ancestors
    candle() {
      const entry = people.find((e) => e.id === id);
      if (entry) kit.runDraft(A.candleDraft(entry.data));
    },
    "person-field"(el) {
      personForm.person[el.id] = el.value;
    },
    "date-box"(el) {
      const [which, part] = el.id.split("-");
      personForm[which][part] = el.value;
      // Only the words under the boxes change, so typing is never interrupted.
      const box = root.querySelector(`[data-boxes="${which}"] [aria-live]`);
      const v = personForm[which];
      const shown = A.formatPartial(A.partialDate(v.day, v.month, v.year));
      const words = v.day || v.month || v.year ? (shown ? `Kept as ${shown}` : "That date doesn’t look right; check the day and month.") : "";
      if (box) box.textContent = words;
      else if (words) root.querySelector(`[data-boxes="${which}"] fieldset`)?.insertAdjacentHTML("beforeend", `<p class="sp-muted" aria-live="polite">${kit.esc(words)}</p>`);
    },
    async "person-save"() {
      if (personForm.saving) return;
      const p = personForm.person;
      const data = {
        ...p,
        name: p.name.trim(),
        relation: p.relation.trim(),
        loved: p.loved.trim(),
        memory: p.memory.trim(),
        born: A.partialDate(personForm.born.day, personForm.born.month, personForm.born.year),
        died: A.partialDate(personForm.died.day, personForm.died.month, personForm.died.year)
      };
      if (!data.name) {
        personForm.problem = "A name first. Write their name, or how you think of them: “Nan”, “the grandfather I never met”.";
        draw();
        root.querySelector("#name")?.focus();
        return;
      }
      personForm.saving = true;
      personForm.problem = "";
      draw();
      try {
        if (id) {
          await kit.update(A.ANCESTORS, id, data);
          kit.go(url.person(id));
        } else {
          const entry = await kit.add(A.ANCESTORS, data);
          kit.go(url.person(entry.id));
        }
      } catch (error) {
        personForm.saving = false;
        personForm.problem = failed(error, "They couldn’t be saved");
        draw();
      }
    },
    async "person-delete"() {
      const name = personForm.person?.name || "this person";
      if (!kit.confirm(`Remove ${name}? Their page and memories will be removed on every device.`)) return;
      try {
        await kit.remove(A.ANCESTORS, id);
        kit.go(url.ancestors);
      } catch (error) {
        personForm.problem = failed(error, "They couldn’t be removed");
        draw();
      }
    }
  });

  kit.start(async (who) => {
    user = who;
    settings = await kit.settings();
    await load();
    draw();
  });

  global.PracticeHedge = { comingForTheDead };
})(window);
