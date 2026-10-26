/*
 * Dreams (/grimoire/dreams/…): the dream journal as a section of the
 * Grimoire, as the app keeps it (app/src/app/(tabs)/grimoire/dreams).
 * The same dreams the Hedge practice counts: craft_entries, collection
 * `hedge.dreams`, so a dream written here shows in the app and the other
 * way round. Logic from js/core/practice-a.js (craft/hedge/dreams.ts).
 * The old /practice/hedge/dreams/ pages send people here.
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.["practice-a"];
  const root = kit?.root();
  if (!kit || !core || !root) return;

  const { dreams: D, dreamSymbols: DS, calendar, meanings, readings: R, linked: L } = core;
  const view = root.dataset.view;
  const params = new URLSearchParams(global.location.search);
  const id = params.get("id");
  const fullDate = (key) => calendar.fullDate(key) ?? key;
  const shortDay = (key) => calendar.fullDate(key)?.replace(/, \d{4}$/, "") ?? key;
  const url = {
    grimoire: "/grimoire/",
    dreams: "/grimoire/dreams/",
    dream: (x) => `/grimoire/dreams/dream/?id=${encodeURIComponent(x)}`,
    dreamEdit: (x) => `/grimoire/dreams/edit/${x ? `?id=${encodeURIComponent(x)}` : ""}`,
    symbols: "/grimoire/dreams/symbols/",
    reminders: "/reminders/"
  };
  const supportLink = () => kit.support();
  let user = null;
  let dreams = [];
  // Readings drawn for a dream (Dream reading, hedge.readings with linkedTo), shown on its page and in the patterns.
  let readings = [];
  let loaded = false;

  async function load() {
    const [d, r] = await Promise.all([kit.entries(D.DREAMS), R && L ? kit.entries(R.READINGS) : []]);
    dreams = d.map((e) => ({ ...e, data: D.normalizeDream(e.data) }));
    readings = R ? r.map((e) => ({ ...e, data: R.normalizeReading(e.data) })) : [];
    loaded = true;
  }

  /** A dream's readings, and the button to draw one (the app's LinkedReadings). */
  function dreamReadingsHtml(entry) {
    if (!L) return "";
    const link = { kind: "dream", id: entry.id, title: entry.data.title };
    const mine = L.linkedReadings(readings, "dream", entry.id);
    return kit.section(
      "Readings of this dream",
      `${
        mine.length
          ? kit.list(
              mine.map((e) =>
                kit.row({
                  url: `/divination/reading/?id=${encodeURIComponent(e.id)}`,
                  title: e.data.question || L.cardsLine(e.data).split("\n")[0] || "A reading",
                  detail: kit.join([shortDay(e.data.date), e.data.drawn.join(", ")])
                })
              )
            )
          : kit.muted("Three cards for a dream that stays with you: what it shows, what it stirs in you, and what it asks of you.")
      }${kit.actions([kit.button({ label: "Read this dream", url: `/divination/draw/${L.drawQuery(link)}`, ghost: true })])}`,
      { id: "readings" }
    );
  }
  const notFound = (backHtml, title, text) => [backHtml, kit.head({ title }), kit.p(loaded ? text : "Opening…")].join("");

  // ------------------------------------------------------------------ the journal

  const journal = { query: "" };
  function dreamDetail(e) {
    const d = e.data;
    const marks = [d.lucid ? "lucid" : null, d.recurring ? "recurring" : null].filter(Boolean).join(", ");
    return kit.join([shortDay(d.date), `${d.moonPhase} in ${d.moonSign}`, marks || null, d.symbols.slice(0, 3).join(" · ") || null]);
  }
  function dreamResults() {
    const groups = D.groupByMonth(D.searchDreams(dreams, journal.query));
    if (!groups.length) return kit.muted("No dreams match that.");
    return groups.map((g) => kit.section(g.month, kit.list(g.entries.map((e) => kit.row({ url: url.dream(e.id), title: e.data.title || "Untitled dream", detail: dreamDetail(e) }))))).join("");
  }
  function dreamsView() {
    return [
      kit.back(url.grimoire, "Grimoire"),
      kit.head({ eyebrow: kit.plural(dreams.length, "dream", "dreams"), title: "Dreams" }),
      kit.actions([kit.button({ label: "Write down a dream", url: url.dreamEdit(), primary: true })]),
      !dreams.length
        ? kit.card(
            kit.p(
              "Nothing written yet. The first dream you catch, write it here: the moon it came under is noted for you, and over the months your symbols and patterns begin to show."
            )
          )
        : [
            kit.field({ id: "dream-search", label: "Search your dreams", value: journal.query, input: "dream-search", placeholder: "A word, a symbol, a feeling, a moon", type: "search" }),
            dreams.length >= 3 ? kit.list([kit.row({ url: url.symbols, title: "Symbols and moons", detail: "What keeps returning, and the phases your dreams cluster in" })]) : "",
            `<div data-results>${dreamResults()}</div>`
          ].join(""),
      dreams.length < 3 ? kit.list([kit.row({ url: url.symbols, title: "Dream symbols", detail: "Common associations, as starting points" })]) : "",
      kit.card(
        `${kit.p("A gentle morning nudge to write down last night’s dream. A website can’t ring, so it goes into your own calendar instead; the app can remind you on your phone.")}${kit.actions([
          kit.button({ label: "Morning dream reminder", url: `${url.reminders}#gd-dreams`, ghost: true, small: true })
        ])}`,
        { label: "Remind me" }
      ),
      kit.muted(kit.savedLine(user, "your dreams")),
      supportLink()
    ].join("");
  }

  function dreamView() {
    const back = kit.back(url.dreams, "Dreams");
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
      dreamReadingsHtml(entry),
      supportLink()
    ].join("");
  }

  // Writing a dream
  const dreamForm = { ready: false, dream: null, symbolText: "", typedDate: "", saving: false, problem: "" };
  function dreamEditView() {
    const back = kit.back(id ? url.dream(id) : url.dreams, id ? "Dream" : "Dreams");
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
    const cards = L ? L.dreamReadingDraws(readings) : [];
    return [
      kit.back(url.dreams, "Dreams"),
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
      cards.length
        ? kit.section(
            "Cards that keep coming up",
            `${kit.muted("Across the readings of your dreams (Read this dream, on a dream’s page).")}${kit.chips(
              cards.map((c) => kit.chip({ label: `${c.name} · ${c.count}`, a11y: `${c.name}, in ${c.count} dream readings` }))
            )}`,
            { id: "cards" }
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


  // ------------------------------------------------------------------ wiring

  const VIEWS = {
    "grimoire-dreams": dreamsView,
    "grimoire-dream": dreamView,
    "grimoire-dream-edit": dreamEditView,
    "grimoire-dream-symbols": symbolsView
  };
  const draw = () => kit.render(root, (VIEWS[view] || dreamsView)());
  const results = (html) => {
    const box = root.querySelector("[data-results]");
    if (box) box.innerHTML = html;
  };
  const failed = (error, words) => {
    console.error(error);
    return `${words}${error?.message ? ` (${error.message})` : ""}. Your words are still here.`;
  };

  kit.delegate(root, {
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
  });

  // A search carried over from the Book of Shadows ("All dreams that match").
  if (params.get("q")) journal.query = params.get("q");

  kit.start(async (who) => {
    user = who;
    await load();
    draw();
  });
})(window);
