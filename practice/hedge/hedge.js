/*
 * Hedge (/practice/hedge/…): a log of readings and the beloved dead, with
 * the dream journal a link away as a section of the Grimoire
 * (grimoire/dreams/, the same `hedge.dreams`). The app's screens in
 * app/src/app/(tabs)/rituals/craft/hedge; logic from js/core/practice-a.js.
 * Kept in craft_entries as the app keeps them: `hedge.readings` and
 * `hedge.ancestors`; dreams are read here for the hub's count.
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.["practice-a"];
  const root = kit?.root();
  if (!kit || !core || !root) return;

  const { dreams: D, dreamSymbols: DS, readings: R, ancestors: A, calendar, holidays, meanings, premade, practices } = core;
  // The draws (js/core/divination.js), on the pages that load it: the draw page and a reading's page.
  const Dv = global.SaltCore?.divination || null;
  const view = root.dataset.view;
  const params = new URLSearchParams(global.location.search);
  const id = params.get("id");
  const fullDate = (key) => calendar.fullDate(key) ?? key;
  const shortDay = (key) => calendar.fullDate(key)?.replace(/, \d{4}$/, "") ?? key;
  const url = {
    // The dream journal is a section of the Grimoire now (grimoire/dreams/).
    dreams: "/grimoire/dreams/",
    readings: kit.href.tool("hedge", "readings"),
    reading: (x) => kit.href.tool("hedge", "readings/reading", `id=${encodeURIComponent(x)}`),
    readingEdit: (x) => kit.href.tool("hedge", "readings/edit", x ? `id=${encodeURIComponent(x)}` : ""),
    draw: (spread) => kit.href.tool("hedge", "readings/draw", spread ? `spread=${encodeURIComponent(spread)}` : ""),
    spreadEdit: (x, kind) => kit.href.tool("hedge", "readings/spread", x ? `id=${encodeURIComponent(x)}` : kind ? `kind=${encodeURIComponent(kind)}` : ""),
    ancestors: kit.href.tool("hedge", "ancestors"),
    person: (x) => kit.href.tool("hedge", "ancestors/person", `id=${encodeURIComponent(x)}`),
    personEdit: (x) => kit.href.tool("hedge", "ancestors/edit", x ? `id=${encodeURIComponent(x)}` : "")
  };
  const supportLink = () => kit.support();
  let user = null;
  let settings = {};
  let dreams = [];
  let readings = [];
  let people = [];
  // Spreads of your own (`hedge.spreads`), on the pages that draw.
  let mySpreads = [];
  let loaded = false;

  async function load() {
    const [d, r, a, s] = await Promise.all([kit.entries(D.DREAMS), kit.entries(R.READINGS), kit.entries(A.ANCESTORS), Dv ? kit.entries(Dv.custom.SPREADS_COLLECTION) : []]);
    mySpreads = s;
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
      kit.section(
        "Tools",
        `${kit.list(practices.CRAFT_TOOLS.hedge.map((t, i) => kit.row({ url: paths[i], title: t.title, detail: details[i] ?? t.detail })))}${kit.list([
          kit.row({ url: url.draw(), title: "Draw cards, runes or ogham", detail: "A card for the day, the Celtic Cross and many more spreads, or one of your own" })
        ])}`,
        { id: "tools" }
      ),
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
      kit.actions([kit.button({ label: "Draw cards, runes or ogham", url: url.draw(), primary: true }), kit.button({ label: "Log a reading", url: url.readingEdit(), ghost: true })]),
      !readings.length
        ? kit.card(
            kit.p(
              "Draw cards, runes or ogham here, or log a reading you did by hand: what you asked, what came up and what you made of it, and a day to come back. When that day comes, the reading waits here for you to write what really happened: the best way to learn your own cards, runes and cup."
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
      laidOutHtml(r),
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


  // ------------------------------------------------------------------ draws

  // The back of a card: deep green, a gold border, the moon between two stars (as the app's CardBack).
  const CARD_BACK =
    '<svg viewBox="0 0 58 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="3" width="52" height="94" rx="3" fill="none" stroke="#b9a05d" stroke-width="0.8"/>' +
    '<rect x="5.5" y="5.5" width="47" height="89" rx="2" fill="none" stroke="rgba(226,195,109,0.28)" stroke-width="0.5"/>' +
    '<path d="M29 14 L44 50 L29 86 L14 50 Z" fill="none" stroke="rgba(226,195,109,0.28)" stroke-width="0.6"/>' +
    '<g transform="translate(19 40) scale(0.85)"><path d="M15.5 4.5a7.5 7.5 0 1 0 4 13.6A6 6 0 0 1 15.5 4.5z" fill="none" stroke="#e2c36d" stroke-width="1.3"/>' +
    '<circle cx="5" cy="4" r="0.9" fill="#e2c36d"/><circle cx="20" cy="21" r="0.9" fill="#e2c36d"/></g></svg>';

  const itemName = (item) => `${item.name}${item.reversed ? ", reversed" : ""}`;
  function placeLabel(spread, d, i, shown) {
    const place = spread.positions.length > 1 ? `${i + 1}, ${Dv.draw.placeOf(spread, d, i)?.name}: ` : "";
    return shown ? `${place}${itemName(d.items[i])}` : `${place}face down`;
  }

  /** One card, rune or stave that turns over (`act` on press, value = its place). */
  function flipHtml(spread, d, i, shown, selected, act) {
    const item = d.items[i];
    const m = Dv.draw.meaningOf(item);
    let back;
    let front;
    let shape = "";
    if (spread.kind === "tarot") {
      const card = Dv.tarot.tarotCard(item.name);
      back = `<span class="dv-face dv-back">${CARD_BACK}</span>`;
      front = `<span class="dv-face dv-front dv-card${item.reversed ? " dv-card--reversed" : ""}"><img src="/assets/divination/tarot/${kit.esc(card?.id || "")}.webp" alt="" loading="lazy" /></span>`;
    } else {
      const cls = spread.kind === "runes" ? "dv-stone" : "dv-stave";
      shape = spread.kind === "runes" ? " dv-flip--stone" : " dv-flip--stave";
      back = `<span class="dv-face ${cls}"></span>`;
      front = `<span class="dv-face dv-front ${cls}">${m?.glyph ? `<span class="dv-glyph" aria-hidden="true">${kit.esc(m.glyph)}</span>` : ""}</span>`;
    }
    return `<button type="button" class="dv-flip${shape}${shown ? " is-turned" : ""}" data-act="${act}" data-value="${i}" aria-label="${kit.esc(placeLabel(spread, d, i, shown))}"${
      selected ? ' aria-current="true"' : ""
    } title="${shown ? "Shows its meaning" : "Turns it over"}"><span class="dv-inner">${back}${front}</span></button>`;
  }

  /** An item's width in pixels: the most it grows to, and the least before the table scrolls (as the app's). */
  const ITEM_PX = { tarot: { max: 110, min: 44 }, runes: { max: 96, min: 36 }, ogham: { max: 52, min: 18 } };

  /**
   * The draw laid out in its spread's shape (js/core/divination.js `layout`,
   * the app's own model): a short row with each place's name beneath, or
   * every place where the layout puts it, the crossing card turned, the cast
   * on its cloth. Too wide for the page, it scrolls sideways.
   */
  function tableHtml(spread, d, revealed, selected, act) {
    const one = (i) => flipHtml(spread, d, i, revealed[i], selected === i, act);
    const l = Dv.draw.layoutOfDraw(spread, d);
    if (Dv.layout.isSimpleRow(l)) {
      const n = d.items.length;
      const size = spread.kind === "tarot" ? `dv-tarot-${n}` : spread.kind === "runes" ? `dv-rune-${n}` : "";
      return `<div class="dv-table">${d.items
        .map((_, i) => {
          const name = n > 1 ? `<p class="dv-place__name">${kit.esc(spread.positions[i]?.name)}</p>` : "";
          if (spread.kind === "ogham") return `<div class="dv-place dv-place--ogham"><div class="dv-ogham-${n}">${one(i)}</div>${name}</div>`;
          return `<div class="dv-place ${size}">${one(i)}${name}</div>`;
        })
        .join("")}</div>`;
    }
    const W = l.width;
    const H = l.height;
    const px = ITEM_PX[spread.kind];
    const pc = (n, of) => `${((n / of) * 100).toFixed(3)}%`;
    const rings = l.cloth
      ? [...l.cloth.rings]
          .reverse()
          .map(
            (r, k) =>
              `<div class="dv-ring${k === 0 ? " dv-ring--cloth" : ""}" style="left:${pc(l.cloth.cx - r, W)};top:${pc(l.cloth.cy - r, H)};width:${pc(r * 2, W)};height:${pc(r * 2, H)}"></div>`
          )
          .join("")
      : "";
    const places = l.slots
      .map((s, i) => {
        const down = spread.cast && d.items[i]?.fall?.up === false;
        const across = l.crossings.some(([, b]) => b === i);
        return `<div class="dv-at${across ? " dv-at--over" : ""}${down ? " dv-at--down" : ""}" style="left:${pc(s.left, W)};top:${pc(s.top, H)};width:${pc(l.item.w, W)}${
          s.rot ? `;transform:rotate(${s.rot}deg)` : ""
        }">${one(i)}<span class="dv-num" aria-hidden="true">${i + 1}</span></div>`;
      })
      .join("");
    const legend = `<ol class="dv-legend">${d.items.map((_, i) => `<li>${kit.esc(Dv.draw.placeOf(spread, d, i)?.name ?? "")}</li>`).join("")}</ol>`;
    const big = W * px.max > 640;
    return `<div class="dv-scroll"><div class="dv-lay dv-lay--${spread.kind}" style="aspect-ratio:${W} / ${H};--dv-max:${Math.round(W * px.max)}px;--dv-min:${Math.round(
      W * px.min
    )}px">${rings}${places}</div></div>${legend}${big ? `<p class="dv-zoom">${kit.textButton({ label: "Look closer (scrolls sideways)", act: "dv-zoom" })}</p>` : ""}`;
  }

  /** A little picture of a spread's shape. */
  const diagram = (spread, size = 56, numbers = false) => Dv.layout.diagramSvg(Dv.layout.diagramOf(Dv.layout.layoutOf(spread)), size, { numbers });

  /** The spread chosen, and the rest in their groups with a picture of each (the app's SpreadPicker). */
  function pickerHtml(spread) {
    const base = baseOf(spread);
    const n = spread.positions.length;
    const current = `<button type="button" class="dv-current" data-act="draw-picker" aria-expanded="${drawState.picking ? "true" : "false"}"><span class="dv-current__pic">${diagram(
      spread
    )}</span><span class="dv-current__text"><span class="dv-current__label">${kit.esc(base.label)}</span><span class="dv-current__more">${
      drawState.picking ? "Hide the other spreads ▴" : `${n === 1 ? "One place" : `${n} places`} · Choose another ▾`
    }</span></span></button>`;
    if (!drawState.picking) return `<div class="dv-picker">${current}</div>`;
    const groups = Dv.draw.groupedSpreads(spread.kind, custom());
    const make = `<a class="dv-tile dv-tile--make" href="${kit.esc(url.spreadEdit(null, spread.kind))}"><span class="dv-tile__pic dv-plus" aria-hidden="true">+</span><span class="dv-tile__label">Make your own</span></a>`;
    const tiles = (list) =>
      list
        .map(
          (s) =>
            `<button type="button" class="dv-tile" data-act="draw-spread" data-value="${kit.esc(s.id)}" aria-pressed="${s.id === base.id ? "true" : "false"}" aria-label="${kit.esc(
              `${s.label}, ${s.positions.length === 1 ? "one place" : `${s.positions.length} places`}`
            )}"><span class="dv-tile__pic">${diagram(s, 52)}</span><span class="dv-tile__label">${kit.esc(s.label)}</span></button>`
        )
        .join("");
    const sections = groups.map(({ group, spreads }) => `<h3 class="sp-eyebrow dv-group">${kit.esc(group.label)}</h3><div class="dv-tiles">${tiles(spreads)}${group.id === "yours" ? make : ""}</div>`);
    if (!groups.some((g) => g.group.id === "yours")) sections.push(`<h3 class="sp-eyebrow dv-group">Your spreads</h3><div class="dv-tiles">${make}</div>`);
    return `<div class="dv-picker">${current}${sections.join("")}</div>`;
  }

  /** What one card, rune or stave means, in its place. */
  function meaningHtml(spread, d, i) {
    if (i === null || i === undefined || !d.items[i]) return "";
    const m = Dv.draw.meaningOf(d.items[i]);
    if (!m) return "";
    const place = spread.positions.length > 1 ? Dv.draw.placeOf(spread, d, i) : null;
    // Its page in the Book of Shadows' Traditional Information, unless that's turned off.
    const more = settings.library_traditional_enabled !== false ? Dv.links?.readMoreHref(m.name) : null;
    return kit.card(
      `${place ? kit.muted(place.about) : ""}<p class="dv-meaning__name">${m.glyph ? `<span class="dv-glyph" aria-hidden="true">${kit.esc(m.glyph)}</span>  ` : ""}${kit.esc(
        itemName(m)
      )}</p>${m.gloss ? kit.muted(m.gloss) : ""}<p class="dv-meaning__words">${kit.esc(m.meaning.keywords)}</p>${kit.p(m.meaning.text)}${
        more ? `<p class="dv-meaning__more"><a href="${kit.esc(more)}">Read more</a></p>` : ""
      }`,
      { gold: true, label: place ? `${i + 1} · ${place.name}` : spread.label }
    );
  }

  /** A kept draw on its reading's page, laid out again; tap one for its meaning. */
  const laid = { pick: null };
  function laidOutHtml(r) {
    const found = Dv ? Dv.draw.drawOfReading(r, custom()) : null;
    if (!found) return "";
    const { spread, draw: d } = found;
    return `<section class="sp-section" aria-label="The draw">${tableHtml(
      spread,
      d,
      d.items.map(() => true),
      laid.pick,
      "laid-pick"
    )}<div data-laid-meaning>${laid.pick === null ? kit.muted("Tap one for its meaning.") : meaningHtml(spread, d, laid.pick)}</div></section>`;
  }

  const drawState = { spreadId: null, question: "", draw: null, revealed: [], selected: null, interpretation: "", lookBack: null, saving: false, problem: "", local: {}, picking: false };
  const custom = () => (Dv ? Dv.custom.customSpreads(mySpreads) : []);
  function currentSpread() {
    if (!drawState.spreadId) {
      const kind = Dv.draw.KINDS.find((k) => k.id === params.get("kind"))?.id || "tarot";
      drawState.spreadId = (Dv.draw.spreadById(params.get("spread"), custom()) || Dv.draw.spreadsFor(kind)[0]).id;
    }
    return Dv.draw.spreadById(drawState.spreadId, custom()) || Dv.draw.spreadsFor("tarot")[0];
  }
  /** The wheel's card in the middle is a choice on the wheel, not a spread of its own. */
  const baseOf = (spread) => (spread.hidden ? Dv.draw.SPREADS.find((s) => s.variant?.id === spread.id) || spread : spread);
  const drawOptions = () => Dv.draw.drawOptions({ ...settings, ...drawState.local });
  const chosenLookBack = (spread) => drawState.lookBack ?? R.lookBackFrom(kit.dateKey(new Date()), spread.lookBackDays);

  function drawHintHtml(d) {
    if (d.items.every((_, i) => drawState.revealed[i])) return "";
    return `${kit.muted(d.items.length === 1 ? "Tap it to turn it over." : "Tap each one to turn it over, in your own time.")}${
      d.items.length > 1 ? kit.actions([kit.button({ label: "Turn them all over", act: "draw-turn-all", ghost: true })]) : ""
    }`;
  }

  function drawAfterHtml(spread, d) {
    if (!d.items.every((_, i) => drawState.revealed[i])) return "";
    const today = kit.dateKey(new Date());
    const lookBack = chosenLookBack(spread);
    return [
      d.items.length > 1
        ? kit.list(
            d.items.map((item, i) =>
              kit.row({ act: "draw-pick", data: { value: i }, title: `${i + 1}. ${itemName(item)}`, detail: `${Dv.draw.placeOf(spread, d, i)?.name} · ${Dv.draw.meaningOf(item)?.meaning.keywords ?? ""}` })
            ),
            "What was drawn"
          )
        : "",
      spread.cast ? kit.muted(Dv.draw.CAST_NOTE) : "",
      spread.kind !== "tarot" ? kit.muted(Dv.staves.STAVE_NOTES[spread.kind]) : "",
      kit.field({ id: "draw-interpretation", label: "What you make of it", value: drawState.interpretation, input: "draw-interpretation", multiline: true, placeholder: "Your reading of the reading" }),
      kit.section(
        "Come back to it",
        `${kit.chips(
          [
            ...Dv.draw.DRAW_LOOK_BACK.map((c) => {
              const key = R.lookBackFrom(today, c.days);
              return kit.chip({ label: c.label, act: "draw-look-back", value: key, pressed: lookBack === key });
            }),
            kit.chip({ label: "Not needed", act: "draw-look-back", value: "", pressed: !lookBack })
          ],
          "Come back to it"
        )}${lookBack ? kit.muted(`It will wait for you in Come back to from ${fullDate(lookBack)}.`) : ""}`,
        { id: "draw-look-back" }
      ),
      !user ? kit.notice("Saved in this browser. Sign in to keep your readings with your account.") : "",
      kit.notice(drawState.problem, { live: true }),
      kit.actions([
        kit.button({ label: drawState.saving ? "Keeping it…" : "Keep this reading", act: "draw-save", primary: true, disabled: drawState.saving, id: "draw-save" }),
        kit.textButton({ label: "Draw again", act: "draw-start" })
      ])
    ].join("");
  }

  function drawView() {
    const back = kit.back(url.readings, "Readings");
    if (!Dv) return [back, kit.head({ title: "Draw" }), kit.notice("The draws couldn’t load. Check your connection and refresh the page.")].join("");
    const spread = currentSpread();
    const kind = Dv.draw.KINDS.find((k) => k.id === spread.kind);
    const opts = drawOptions();
    const d = drawState.draw;
    const kept = spread.id === "daily" && !d ? Dv.daily.todaysCard(readings, new Date()) : null;
    const question = drawState.question.trim();
    const base = baseOf(spread);
    const seasonal = spread.kind === "tarot" && !d ? Dv.seasonal.seasonalSpreads(new Date(), { south: Dv.seasonal.keepsSouthernWheel(settings) }).filter((s) => s.spread !== spread.id) : [];
    const editing = Dv.custom.entryIdOfSpread(spread.id);
    return [
      back,
      kit.head({ eyebrow: "Draw · Hedge readings", title: kind.label }),
      kit.section(
        "What to draw",
        `${kit.chips(
          Dv.draw.KINDS.map((k) => kit.chip({ label: k.label, act: "draw-kind", value: k.id, pressed: spread.kind === k.id })),
          "What to draw"
        )}${pickerHtml(spread)}${kit.muted(spread.detail)}${editing && !d ? kit.actions([kit.button({ label: "Change this spread", url: url.spreadEdit(editing), ghost: true })]) : ""}`,
        { id: "what" }
      ),
      seasonal.length
        ? kit.list(seasonal.map((s) => kit.row({ act: "draw-spread", data: { value: s.spread }, title: `${s.why}: ${s.label}`, detail: "A spread for the time. Tap to choose it." })))
        : "",
      kept
        ? kit.list([
            kit.row({
              url: url.reading(kept.id),
              title: `Today’s card: ${itemName(kept)}`,
              detail: "You’ve kept a card for today already. Open it, or draw another."
            })
          ])
        : "",
      !d
        ? [
            kit.field({
              id: "draw-question",
              label: "Your question (if you have one)",
              value: drawState.question,
              input: "draw-question",
              multiline: true,
              placeholder: spread.id === "daily" ? "What do I need today?" : "What you want to ask, as you’d ask it"
            }),
            spread.kind === "tarot"
              ? kit.toggle({ id: "draw-reversals", label: "Reversed cards", detail: "Some cards come up upside down, with their reversed meaning.", checked: opts.reversals, change: "draw-option" })
              : "",
            base.variant ? kit.toggle({ id: "draw-variant", label: base.variant.label, checked: spread.id === base.variant.id, change: "draw-variant" }) : "",
            spread.kind === "runes"
              ? kit.toggle({ id: "draw-blank-rune", label: "The blank rune", detail: "A modern addition to the set, standing for the unknown.", checked: opts.blankRune, change: "draw-option" })
              : "",
            kit.actions([kit.button({ label: kind.action, act: "draw-start", primary: true })])
          ].join("")
        : `<section class="sp-section" aria-label="The draw">${question ? `<p class="dv-question">${kit.esc(question)}</p>` : ""}${tableHtml(
            spread,
            d,
            drawState.revealed,
            drawState.selected,
            "draw-turn"
          )}<div data-draw-hint>${drawHintHtml(d)}</div></section><div data-draw-meaning>${meaningHtml(spread, d, drawState.selected)}</div><div data-draw-after>${drawAfterHtml(spread, d)}</div>`
    ].join("");
  }

  /** After turning or picking: the flips change in place (so they animate), and the words below are redrawn. */
  function refreshDraw({ after = false } = {}) {
    const spread = currentSpread();
    const d = drawState.draw;
    root.querySelectorAll('[data-act="draw-turn"]').forEach((el) => {
      const i = Number(el.dataset.value);
      el.classList.toggle("is-turned", !!drawState.revealed[i]);
      el.setAttribute("aria-label", placeLabel(spread, d, i, !!drawState.revealed[i]));
      el.title = drawState.revealed[i] ? "Shows its meaning" : "Turns it over";
      if (drawState.selected === i) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    kit.render(root.querySelector("[data-draw-hint]"), drawHintHtml(d));
    kit.render(root.querySelector("[data-draw-meaning]"), meaningHtml(spread, d, drawState.selected));
    if (after) kit.render(root.querySelector("[data-draw-after]"), drawAfterHtml(spread, d));
  }

  function chooseSpread(spreadId) {
    if (spreadId === drawState.spreadId) {
      drawState.picking = false;
      draw();
      return;
    }
    Object.assign(drawState, { spreadId, draw: null, revealed: [], selected: null, lookBack: null, problem: "", picking: false });
    draw();
    root.querySelector('[data-act="draw-picker"]')?.focus();
  }

  // ------------------------------------------------------------------ your own spreads

  /** Make or change a spread of your own (the app's readings/spread screen), kept in `hedge.spreads`. */
  const spreadForm = { data: null, saving: false, problem: "" };
  function spreadEditView() {
    const back = kit.back(url.draw(id ? Dv?.custom.customSpreadId(id) : ""), "Draw");
    if (!Dv) return [back, kit.head({ title: "Your spread" }), kit.notice("The draws couldn’t load. Check your connection and refresh the page.")].join("");
    const existing = id ? mySpreads.find((e) => e.id === id) : null;
    if (id && !existing) return notFound(back, "Your spread", "This spread couldn’t be found. It may have been deleted on another device.");
    if (!spreadForm.data) {
      const kind = Dv.draw.KINDS.find((k) => k.id === params.get("kind"))?.id || "tarot";
      spreadForm.data = existing ? Dv.custom.normalizeCustomSpread(existing.data) : Dv.custom.blankCustomSpread(kind);
    }
    const data = spreadForm.data;
    const word = Dv.custom.placeWord(data.kind);
    const places = data.positions
      .map((p, i) =>
        kit.card(
          `${kit.field({ id: `place-name-${i}`, label: `${i + 1}. What this place means`, value: p.name, input: "spread-place", placeholder: `${word} ${i + 1}` })}${kit.field({
            id: `place-about-${i}`,
            label: "A line on how to read it (if you like)",
            value: p.about,
            input: "spread-place",
            placeholder: "What it asks, or shows"
          })}${data.positions.length > 1 ? kit.textButton({ label: "Take this place out", act: "spread-place-remove", value: String(i) }) : ""}`
        )
      )
      .join("");
    return [
      back,
      kit.head({ eyebrow: existing ? "Change your spread" : "Make your own spread", title: data.name.trim() || "Your spread" }),
      kit.field({ id: "spread-name", label: "Its name", value: data.name, input: "spread-field", placeholder: "Crossroads, Monday morning, The garden…" }),
      kit.field({ id: "spread-detail", label: "What it’s for (if you like)", value: data.detail, input: "spread-field", placeholder: "One line on when you’d use it" }),
      kit.section("What to draw", kit.chips(Dv.draw.KINDS.map((k) => kit.chip({ label: k.label, act: "spread-kind", value: k.id, pressed: data.kind === k.id })), "What to draw"), { id: "spread-kind" }),
      kit.section(
        "Its shape",
        `${kit.chips(Dv.layout.SHAPES.map((s) => kit.chip({ label: s.label, act: "spread-shape", value: s.id, pressed: data.shape === s.id })), "Its shape")}${kit.card(
          `<div class="dv-preview">${diagram(Dv.custom.customSpread({ id: "preview", data }), 180, true)}</div>${kit.muted(
            "The numbers are the order they’re laid down in, and match the places below."
          )}`
        )}`,
        { id: "spread-shape" }
      ),
      kit.section(
        `The places (${data.positions.length})`,
        `${places}${
          data.positions.length < Dv.custom.MAX_PLACES
            ? kit.actions([kit.button({ label: "Add a place", act: "spread-place-add", ghost: true })])
            : kit.muted(`${Dv.custom.MAX_PLACES} places is the most a spread can hold here.`)
        }`,
        { id: "spread-places" }
      ),
      !user ? kit.notice("Saved in this browser. Sign in to keep your spreads with your account, and in the app.") : "",
      kit.notice(spreadForm.problem, { live: true }),
      kit.actions([
        kit.button({ label: spreadForm.saving ? "Keeping it…" : "Keep this spread", act: "spread-save", primary: true, disabled: spreadForm.saving }),
        existing ? kit.textButton({ label: "Delete this spread", act: "spread-delete" }) : ""
      ])
    ].join("");
  }



  // ------------------------------------------------------------------ wiring

  const VIEWS = {
    hedge: hubView,
    "hedge-readings": readingsView,
    "hedge-reading": readingView,
    "hedge-reading-edit": readingEditView,
    "hedge-draw": drawView,
    "hedge-spread": spreadEditView,
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

  kit.delegate(root, {
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
    // Draws
    "draw-kind"(el) {
      chooseSpread(Dv.draw.spreadsFor(el.dataset.value)[0].id);
    },
    "draw-spread"(el) {
      chooseSpread(el.dataset.value);
    },
    "draw-picker"() {
      drawState.picking = !drawState.picking;
      draw();
      root.querySelector('[data-act="draw-picker"]')?.focus();
    },
    "draw-variant"(el) {
      const base = baseOf(currentSpread());
      chooseSpread(el.checked ? base.variant.id : base.id);
    },
    "dv-zoom"(el) {
      const lay = el.closest("section, [data-laid]")?.querySelector(".dv-lay");
      if (!lay) return;
      const close = lay.classList.toggle("is-close");
      el.textContent = close ? "See it all at once" : "Look closer (scrolls sideways)";
    },
    // Your own spreads
    "spread-field"(el) {
      spreadForm.data[el.id === "spread-name" ? "name" : "detail"] = el.value;
    },
    "spread-place"(el) {
      const [, which, i] = el.id.split("-");
      const p = spreadForm.data.positions[Number(i)];
      if (p) p[which === "name" ? "name" : "about"] = el.value;
    },
    "spread-kind"(el) {
      spreadForm.data.kind = el.dataset.value;
      draw();
    },
    "spread-shape"(el) {
      spreadForm.data.shape = el.dataset.value;
      draw();
    },
    "spread-place-add"() {
      if (spreadForm.data.positions.length >= Dv.custom.MAX_PLACES) return;
      spreadForm.data.positions.push({ name: "", about: "" });
      draw();
      root.querySelector(`#place-name-${spreadForm.data.positions.length - 1}`)?.focus();
    },
    "spread-place-remove"(el) {
      spreadForm.data.positions.splice(Number(el.dataset.value), 1);
      draw();
    },
    async "spread-save"() {
      if (spreadForm.saving) return;
      const data = Dv.custom.tidyCustomSpread(spreadForm.data);
      spreadForm.saving = true;
      spreadForm.problem = "";
      draw();
      try {
        if (id) {
          await kit.update(Dv.custom.SPREADS_COLLECTION, id, data);
          kit.go(url.draw(Dv.custom.customSpreadId(id)));
        } else {
          const entry = await kit.add(Dv.custom.SPREADS_COLLECTION, data);
          kit.go(url.draw(Dv.custom.customSpreadId(entry.id)));
        }
      } catch (error) {
        spreadForm.saving = false;
        spreadForm.problem = failed(error, "It couldn’t be kept");
        draw();
      }
    },
    async "spread-delete"() {
      if (!kit.confirm("Delete this spread? It will be removed on every device. Readings you drew with it are kept.")) return;
      try {
        await kit.remove(Dv.custom.SPREADS_COLLECTION, id);
        kit.go(url.draw());
      } catch (error) {
        spreadForm.problem = failed(error, "It couldn’t be deleted");
        draw();
      }
    },
    "draw-question"(el) {
      drawState.question = el.value;
    },
    "draw-option"(el) {
      const key = el.id === "draw-reversals" ? "divination_reversals" : "divination_blank_rune";
      drawState.local[key] = el.checked;
      settings = { ...settings, [key]: el.checked };
      // Kept with your settings, so the app draws the same way.
      global.SaltSettings?.patch({ [key]: el.checked }).catch((error) => console.error(error));
    },
    "draw-start"() {
      const d = Dv.draw.drawSpread(currentSpread(), drawOptions());
      Object.assign(drawState, { draw: d, revealed: d.items.map(() => false), selected: null, interpretation: "", problem: "" });
      draw();
      root.querySelector('[data-act="draw-turn"]')?.focus();
    },
    "draw-turn"(el) {
      const i = Number(el.dataset.value);
      const was = drawState.revealed.every(Boolean);
      drawState.revealed[i] = true;
      drawState.selected = i;
      refreshDraw({ after: !was && drawState.revealed.every(Boolean) });
    },
    "draw-turn-all"() {
      drawState.revealed = drawState.revealed.map(() => true);
      if (drawState.selected === null) drawState.selected = 0;
      refreshDraw({ after: true });
      root.querySelector('[data-act="draw-turn"]')?.focus();
    },
    "draw-pick"(el) {
      drawState.selected = Number(el.dataset.value);
      refreshDraw();
      root.querySelector("[data-draw-meaning]")?.scrollIntoView?.({ block: "nearest" });
    },
    "draw-interpretation"(el) {
      drawState.interpretation = el.value;
    },
    "draw-look-back"(el) {
      drawState.lookBack = el.dataset.value;
      refreshDraw({ after: true });
    },
    async "draw-save"() {
      if (drawState.saving || !drawState.draw) return;
      const spread = currentSpread();
      const data = Dv.draw.readingFromDraw(spread, drawState.draw, {
        question: drawState.question,
        interpretation: drawState.interpretation,
        lookBack: chosenLookBack(spread),
        now: new Date()
      });
      drawState.saving = true;
      drawState.problem = "";
      refreshDraw({ after: true });
      try {
        const entry = await kit.add(R.READINGS, data);
        kit.go(url.reading(entry.id));
      } catch (error) {
        drawState.saving = false;
        drawState.problem = failed(error, "It couldn’t be kept");
        refreshDraw({ after: true });
      }
    },
    "laid-pick"(el) {
      const i = Number(el.dataset.value);
      laid.pick = laid.pick === i ? null : i;
      const entry = readings.find((e) => e.id === id);
      const found = entry && Dv ? Dv.draw.drawOfReading(entry.data, custom()) : null;
      if (!found) return;
      root.querySelectorAll('[data-act="laid-pick"]').forEach((b) => (Number(b.dataset.value) === laid.pick ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
      kit.render(root.querySelector("[data-laid-meaning]"), laid.pick === null ? kit.muted("Tap one for its meaning.") : meaningHtml(found.spread, found.draw, laid.pick));
    },
    // Ancestors
    candle() {
      const entry = people.find((e) => e.id === id);
      if (entry) kit.beginRitual(A.candleDraft(entry.data));
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
