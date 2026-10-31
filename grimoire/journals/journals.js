/*
 * The practice journals on the website: Shadow work, Deity & spirit,
 * Ancestors, and Omens & signs, as the app keeps them
 * (app/src/components/journals). The same entries: craft_entries, one
 * collection each (journal.shadow, journal.devotion, journal.ancestors,
 * journal.omens), so an entry written here shows in the app and the other way
 * round. Logic from js/core/practice-a.js (app/src/lib/journals/journals.ts).
 *
 * The same pages live under /grimoire/journals/ and /rituals/journals/; the
 * person chooses, for each journal, which is its home (a setting, moved
 * without touching any entry).
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.["practice-a"];
  const root = kit?.root();
  if (!kit || !core || !root) return;

  const J = core.journals;
  const { calendar, ancestors: A, dreams: D, dreamSymbols: DS, libraryModel: LM, patronMine: PM, journeyCatalog: JC, journeyLookup: JL, journeyProgress: JP, hours: H } = core;
  const view = root.dataset.view;
  const params = new URLSearchParams(global.location.search);
  const kind = J.isJournalKind(params.get("j")) ? params.get("j") : null;
  const id = params.get("id");
  const tab = global.location.pathname.startsWith("/rituals/") ? "journal" : "grimoire";
  const def = kind ? J.journalDef(kind) : null;
  const routes = kind ? J.journalWebRoutes(kind, tab) : null;
  const fullDate = (key) => calendar.fullDate(key) ?? key;
  const enc = encodeURIComponent;
  const url = {
    hub: tab === "journal" ? "/rituals/journals/" : "/grimoire/journals/",
    home: tab === "journal" ? "/rituals/" : "/grimoire/",
    page: (x) => `/grimoire/?page=${enc(x)}`,
    dream: (x) => `/grimoire/dreams/dream/?id=${enc(x)}`,
    person: (x) => kit.href.tool("hedge", "ancestors/person", `id=${enc(x)}`),
    personNew: kit.href.tool("hedge", "ancestors/edit"),
    library: (x) => kit.href.library(x),
    journey: (x) => `/rituals/journeys/?id=${enc(x)}`,
    holy: (ref) => `/today/holy/?ref=${enc(ref)}`
  };

  let user = null;
  let settings = {};
  let entries = [];
  let people = [];
  let names = {};
  let dreams = [];
  let pages = [];
  let altars = [];
  let progress = [];
  let loaded = false;
  const counts = {};

  const norm = (list) => list.map((e) => ({ id: e.id, createdAt: e.createdAt, data: J.normalizeEntry(e.data) }));

  async function load() {
    settings = await kit.settings();
    const tasks = [kit.entries(A.ANCESTORS), kit.entries(D.DREAMS)];
    if (kind) tasks.push(kit.entries(def.collection));
    const [p, d, mine] = await Promise.all(tasks);
    people = p.map((e) => ({ id: e.id, createdAt: e.createdAt, data: A.normalizeAncestor(e.data) })).sort((a, b) => a.data.name.localeCompare(b.data.name));
    names = Object.fromEntries(people.map((x) => [x.id, x.data.name || "Unnamed"]));
    dreams = D.sortDreams(d.map((e) => ({ ...e, data: D.normalizeDream(e.data) })));
    entries = kind ? norm(mine) : [];
    if (view === "journals-hub") {
      for (const j of J.JOURNALS) counts[j.kind] = norm(await kit.entries(j.collection));
    }
    if (kind === "devotion") progress = await kit.entries(JP.PROGRESS_COLLECTION);
    const account = kit.currentUser();
    if (account && global.db) {
      if (view === "journal-edit") {
        const res = await global.db.from("grimoire_pages").select("id,title").eq("user_id", account.id);
        pages = res.error ? [] : res.data || [];
      }
      if (kind === "ancestors") {
        const res = await global.db.from("saved_altars").select("id,name,altar_data").eq("user_id", account.id);
        altars = res.error ? [] : res.data || [];
      }
    }
    loaded = true;
  }

  const photoOf = (personId) => J.framesFor(altars, personId)[0] || null;
  const libraryDeities = () =>
    LM.traditionalEntries()
      .filter((e) => e.type === "deity")
      .map((e) => ({ id: e.id, key: e.id.split(":").pop(), name: e.name, pantheon: String(e.traditional?.Pantheon ?? "") }))
      .sort((a, b) => a.name.localeCompare(b.name));
  const entryRow = (e, k = kind) =>
    kit.row({ url: J.journalWebRoutes(k, tab).entry(e.id), title: J.entryTitle(k, e.data, { people: names }), detail: J.entryDetail(k, e.data) });
  const placeOf = (k) => J.journalPlace(settings, k);

  function placeChooser() {
    const place = placeOf(kind);
    return kit.section(
      "Where this journal lives",
      `${kit.chips(J.PLACE_OPTIONS.map((o) => kit.chip({ label: o.label, act: "place", value: o.value, pressed: place === o.value })), "Where this journal lives")}${kit.caption(
        `${J.PLACE_OPTIONS.find((o) => o.value === place)?.note ?? ""} Moving it keeps every entry.`
      )}`,
      { id: "place" }
    );
  }

  // ------------------------------------------------------------------ the hub

  function hubView() {
    return [
      kit.back(url.home, tab === "journal" ? "Rituals" : "Grimoire"),
      kit.head({ eyebrow: "Your practice", title: "Journals", lede: "Four journals for the inner work of the craft. Each is private to you, kept with your account, and can be a section of your Grimoire or a journal of its own." }),
      J.JOURNALS.map((j) => {
        const home = J.journalWebRoutes(j.kind, placeOf(j.kind));
        const list = counts[j.kind] || [];
        return kit.card(
          `${kit.big(j.title, "h2")}${kit.muted(J.shelfLine(j.kind, list, { people: names }))}${kit.actions([
            kit.button({ label: list.length ? "Open" : "Begin", url: home.list, ghost: true }),
            kit.button({ label: j.write, url: home.write(), ghost: true, small: true })
          ])}${kit.caption(placeOf(j.kind) === "grimoire" ? "Kept in your Grimoire" : "Kept as its own journal, under Rituals → Journal")}`
        );
      }).join(""),
      kit.list([
        kit.row({ url: "/grimoire/dreams/", title: "Dreams", detail: "Your dream journal, in the Grimoire" }),
        kit.row({ url: "/?sanctuary=rituals", title: "Ritual journal", detail: "Every ritual you’ve kept, and what worked" }),
        kit.row({ url: "/rituals/journal/insights/", title: "Your moon", detail: "Patterns in your practice" })
      ]),
      kit.support()
    ].join("");
  }

  // ------------------------------------------------------------------ a journal

  const filter = { query: params.get("q") || "", tag: params.get("tag") || "", deity: params.get("deity") || "", person: params.get("person") || "" };

  function shownEntries() {
    let out = J.searchEntries(kind, entries, filter.query, { people: names });
    if (filter.tag) out = J.withTag(out, filter.tag);
    if (filter.deity) out = out.filter((e) => (e.data.deityKey || `name:${e.data.deityName.toLowerCase()}`) === filter.deity);
    if (filter.person) out = J.entriesAbout(out, filter.person);
    return out;
  }
  function results() {
    const groups = J.groupEntries(shownEntries());
    if (!groups.length) return kit.muted("Nothing matches that.");
    return groups.map((g) => kit.section(g.month, kit.list(g.entries.map((e) => entryRow(e))))).join("");
  }

  function linksFor() {
    const rows = {
      shadow: [
        { url: "/rituals/cycle/", title: "Cycle & Moon", detail: "Your inner seasons beside the moon’s" },
        { url: url.holy("moon-dark"), title: "The dark moon", detail: "What the dark of the moon is for" },
        { url: "/grimoire/dreams/", title: "Dreams", detail: "What your dreams have been showing you" }
      ],
      devotion: [
        { url: "/more/settings/deities/", title: "My deities", detail: "The gods you explore, are dedicated to, or keep as patron" },
        { url: "/rituals/journeys/", title: "Dedication journeys", detail: "Study, practice and a rite of dedication" },
        { url: "/altar/", title: "Your altars", detail: "Set out an offering from the cabinet’s Offerings drawer" }
      ],
      ancestors: [
        { url: kit.href.tool("hedge", "ancestors"), title: "Ancestors in Hedge", detail: "Your people, their dates and places, and a candle for each" },
        { url: kit.href.premade("hedge-ancestor-candle-evening"), title: "Ancestor Altar & Candle Evening", detail: "A longer evening with all your dead" },
        { url: url.holy("wheel-samhain"), title: "Samhain", detail: "The old festival of the dead" },
        { url: url.holy("hellenic_monthly-deipnon"), title: "Hekate’s Deipnon", detail: "The meal for Hekate and the restless dead at the month’s end" },
        { url: "/altar/", title: "Your altars", detail: "An ancestor frame with their photo, a candle, an offering" }
      ],
      omens: [
        { url: kit.href.tool("cosmic", "hours"), title: "Planetary hours", detail: "Which planet rules the hour now" },
        { url: "/grimoire/dreams/symbols/", title: "Dream symbols", detail: "Common associations, as starting points" },
        { url: kit.href.tool("folk", "lore"), title: "Local lore", detail: "What’s said of the creatures and places near you" }
      ]
    }[kind];
    return kit.list(rows.map((r) => kit.row(r)));
  }

  function personCard(pid) {
    const p = people.find((x) => x.id === pid);
    if (!p) return "";
    const born = A.formatPartial(p.data.born);
    const died = A.formatPartial(p.data.died);
    const photo = photoOf(pid);
    const line = kit.join([
      p.data.relation,
      born || p.data.bornPlace ? `born ${kit.join([born, p.data.bornPlace], ", ")}` : null,
      died || p.data.diedPlace ? `died ${kit.join([died, p.data.diedPlace], ", ")}` : null
    ]);
    return kit.card(
      `${photo ? `<img class="jr-photo${photo.aged ? " jr-photo--aged" : ""}" src="${kit.esc(photo.photo)}" alt="${kit.esc(`A photo of ${p.data.name}, from your altar`)}" />` : ""}${kit.big(p.data.name, "h3")}${kit.muted(line)}${kit.actions([
        kit.button({ label: "Their page in Hedge", url: url.person(pid), ghost: true, small: true })
      ])}`
    );
  }

  function listView() {
    const now = new Date();
    const prompt = J.promptOfDay(kind, now);
    const due = kind === "omens" ? J.omensToCheck(entries, now) : [];
    const tags = J.tagCounts(entries).slice(0, 16);
    const parts = [
      kit.back(tab === "journal" ? "/rituals/" : "/grimoire/", tab === "journal" ? "Rituals" : "Grimoire"),
      kit.head({ eyebrow: kit.plural(entries.length, def.noun, def.nouns), title: def.title, lede: def.intro }),
      kind === "shadow" ? kit.card(`${kit.p(J.SHADOW_NOTE)}${kit.support("Support and crisis lines")}`) : "",
      kit.actions([kit.button({ label: def.write, url: routes.write(), primary: true })]),
      kit.card(`${kit.p(prompt.text)}${kit.actions([kit.button({ label: "Write to this prompt", url: routes.write({ prompt: prompt.id }), ghost: true })])}`, { gold: true, label: "A prompt, if you want one" }),
      due.length ? kit.section("Did it come to pass?", kit.list(due.map((e) => entryRow(e))), { id: "due" }) : ""
    ];
    if (kind === "devotion") {
      const log = J.deityLog(entries);
      if (log.length)
        parts.push(
          kit.section(
            "By god or spirit",
            kit.chips(log.map((d) => {
              const key = d.key || `name:${d.name.toLowerCase()}`;
              return kit.chip({ label: `${d.name} · ${d.count}`, act: "deity", value: key, pressed: filter.deity === key });
            })),
            { id: "deities" }
          )
        );
    }
    if (kind === "ancestors") {
      parts.push(
        kit.section(
          "Your people",
          `${
            people.length
              ? kit.chips(people.map((p) => kit.chip({ label: `${p.data.name || "Unnamed"} · ${J.entriesAbout(entries, p.id).length}`, act: "person", value: p.id, pressed: filter.person === p.id })))
              : kit.muted("The people you remember are kept in Hedge → Ancestors, with their dates and places. Add someone, then write about them here.")
          }${filter.person ? personCard(filter.person) : ""}${kit.actions([kit.button({ label: "Add someone", url: url.personNew, ghost: true, small: true })])}`,
          { id: "people" }
        )
      );
      const days = A.ancestorDays(core.holidays.holidayChoice(settings), now, 30);
      const anniversaries = A.upcomingAnniversaries(people, now, 30);
      if (days.length || anniversaries.length)
        parts.push(
          kit.card(
            [
              ...anniversaries.map((a) => kit.p(`${a.name}: ${a.kind === "birth" ? "their birthday" : "the day they died"}, ${calendar.relativeDay(now, a.date)}`)),
              ...days.map((d) => kit.p(`${d.name}, ${calendar.relativeDay(now, d.date)}`))
            ].join(""),
            { label: "In the next 30 days" }
          )
        );
    }
    if (kind === "omens" && entries.some((e) => e.data.outcome !== "waiting")) {
      parts.push(kit.muted(`Looked back on: ${J.outcomeCounts(entries).filter((o) => o.value !== "waiting").map((o) => `${o.label.toLowerCase()} ${o.count}`).join(" · ")}`));
    }
    if (!loaded) parts.push(kit.muted("Opening…"));
    else if (!entries.length) parts.push(kit.card(kit.p(def.empty)));
    else
      parts.push(
        kit.field({ id: "journal-search", label: `Search your ${def.title.toLowerCase()} journal`, value: filter.query, input: "search", placeholder: def.search, type: "search" }),
        tags.length ? kit.chips(tags.map((t) => kit.chip({ label: `${t.tag} · ${t.count}`, act: "tag", value: t.tag, pressed: filter.tag === t.tag, a11y: `Only entries tagged ${t.tag}` })), "Tags") : "",
        `<div data-results>${results()}</div>`
      );
    parts.push(linksFor(), placeChooser(), kit.muted(kit.savedLine(user, "this journal")), kit.support());
    return parts.join("");
  }

  // ------------------------------------------------------------------ an entry

  function entryView() {
    const back = kit.back(routes.list, def.title);
    const entry = entries.find((e) => e.id === id);
    if (!entry) return [back, kit.p(loaded ? "This entry couldn’t be found. It may have been deleted on another device." : "Opening…")].join("");
    const d = entry.data;
    const prompt = d.prompt ? J.promptById(kind, d.prompt) : null;
    const parts = [
      back,
      kit.head({ eyebrow: kit.join([def.title, fullDate(d.date), d.time || null]), title: J.entryTitle(kind, d, { people: names }) }),
      kit.card(
        `${kit.big(`${d.moonPhase} in ${d.moonSign}`)}${kit.muted(kind === "shadow" ? `The moon’s season: ${J.moonSeasonOn(d.date)}` : d.hour ? `In the planetary hour of ${d.hour}` : "The moon then")}`,
        { gold: true, label: "The moon then" }
      ),
      prompt ? kit.muted(prompt.text) : ""
    ];
    if (kind === "devotion") {
      const mine = PM.myDeities(settings).find((m) => (d.deityKey ? m.key === d.deityKey : m.name.toLowerCase() === d.deityName.toLowerCase()));
      parts.push(
        kit.section(
          d.deityName || "A god or spirit",
          `${kit.muted(kit.join([mine ? PM.levelLabel(mine.level) : null, d.acts.map((a) => J.choiceLabel(J.DEVOTION_ACTS, a)).join(", ") || null]))}${d.offerings.length ? kit.p(`Offered: ${d.offerings.join(", ")}`) : ""}${d.response ? kit.p(`Response: ${d.response}`) : ""}`,
          { id: "deity" }
        )
      );
    }
    if (kind === "ancestors") {
      parts.push(kit.section(J.choiceLabel(J.ANCESTOR_TOPICS, d.about) || "Ancestors", d.people.map((pid) => personCard(pid) || kit.muted("Someone since removed from Ancestors.")).join(""), { id: "who" }));
    }
    if (kind === "omens") parts.push(kit.muted(kit.join([J.choiceLabel(J.OMEN_KINDS, d.seen), d.where || null])));
    J.fieldsFor(kind, d)
      .filter((f) => !(kind === "omens" && f.key === "where"))
      .forEach((f) => {
        if (d[f.key]) parts.push(kit.section(f.label, kit.p(d[f.key]), { id: `f-${f.key}` }));
      });
    if (d.tags.length) parts.push(kit.chips(d.tags.map((t) => `<a class="sp-chip" href="${kit.esc(`${routes.list}&tag=${enc(t)}`)}">${kit.esc(t)}</a>`), "Tags"));
    if (kind === "omens") {
      parts.push(
        kit.card(
          `${d.checkOn && d.outcome === "waiting" ? kit.muted(`You asked to look back on ${fullDate(d.checkOn)}.`) : ""}${kit.chips(J.OUTCOMES.map((o) => kit.chip({ label: o.label, act: "outcome", value: o.value, pressed: d.outcome === o.value })), "Did it come to pass")}${d.outcomeNote ? kit.p(d.outcomeNote) : ""}`,
          { label: "Did it come to pass?" }
        )
      );
      const text = `${d.what} ${d.meaning}`;
      const symbols = J.matchingNames(text, DS.DREAM_SYMBOLS, (x) => [x.symbol, ...x.also]);
      const lib = J.matchingNames(text, LM.traditionalEntries(), (x) => [x.name]);
      if (symbols.length || lib.length)
        parts.push(
          kit.section(
            "Places to start",
            `${symbols.map((x) => kit.card(`<h3 class="pr-big">${kit.esc(x.symbol)}</h3>${kit.p(x.notes)}${kit.muted(x.ask)}`)).join("")}${kit.list(
              lib.map((x) => kit.row({ url: url.library(x.id), title: x.name, detail: `In the Living Library · ${x.category}` }))
            )}${kit.muted("Your own sense of it matters most: what does it mean to you?")}`,
            { id: "start" }
          )
        );
    }
    if (kind === "devotion") {
      const journey = d.deityKey ? JL.journeyForDeityRefIn(JC.JOURNEY_CATALOG, `traditional/deity/${d.deityKey}`) : null;
      const prog = journey ? JP.progressFor(progress, journey.id) : null;
      const status = prog ? JP.journeyStatus(JP.normalizeProgress({ ...prog.data, journeyId: journey.id })) : null;
      parts.push(
        kit.list(
          [
            d.deityKey ? kit.row({ url: url.library(`traditional:deity:${d.deityKey}`), title: `${d.deityName} in the Living Library`, detail: "Who they are, their symbols and offerings" }) : "",
            journey
              ? kit.row({
                  url: url.journey(journey.id),
                  title: journey.title,
                  detail: status ? { dedicated: "Dedicated · see your journey", paused: "Paused · pick it up when you’re ready", stopped: "Set down" }[status] || "Under way · see where you are" : "A dedication journey: study, practice and a rite"
                })
              : "",
            kit.row({ url: `${routes.list}&deity=${enc(d.deityKey || `name:${d.deityName.toLowerCase()}`)}`, title: `Everything with ${d.deityName}`, detail: "This god or spirit’s log" }),
            kit.row({ url: "/altar/", title: "Your altars", detail: "Set out an offering from the Offerings drawer" })
          ].filter(Boolean)
        )
      );
    }
    if (d.links.length)
      parts.push(
        kit.section(
          "Linked",
          kit.list(
            d.links.map((l) =>
              kit.row({
                url: l.type === "page" ? url.page(l.id) : l.type === "dream" ? url.dream(l.id) : J.journalWebRoutes(l.kind || kind, tab).entry(l.id),
                title: l.title || "Untitled",
                detail: l.type === "page" ? "Grimoire page" : l.type === "dream" ? "Dream" : J.journalDef(l.kind || kind).title
              })
            )
          ),
          { id: "linked" }
        )
      );
    if (kind === "shadow") parts.push(kit.list([kit.row({ url: "/rituals/cycle/?view=history", title: "Cycle & Moon", detail: "Your own cycle that day, beside the moon’s season" })]));
    parts.push(kit.actions([kit.button({ label: "Edit", url: routes.edit(entry.id), ghost: true })]), kit.support());
    return parts.join("");
  }

  // ------------------------------------------------------------------ the form

  const form = { ready: false, entry: null, tagText: "", typedDate: "", deityQuery: "", pageQuery: "", prompts: false, saving: false, problem: "" };
  let choices = [];

  function startForm() {
    if (form.ready) return;
    form.ready = true;
    choices = J.deityChoices(PM.myDeities(settings), libraryDeities());
    const existing = id ? entries.find((e) => e.id === id) : null;
    if (existing) {
      form.entry = { ...existing.data };
      return;
    }
    const extra = {};
    const p = (k) => params.get(k) || "";
    if (p("prompt") && J.promptById(kind, p("prompt"))) extra.prompt = p("prompt");
    if (p("deity")) {
      extra.deityKey = p("deity");
      extra.deityName = choices.find((c) => c.key === p("deity"))?.name || p("deityName");
    } else if (p("deityName")) extra.deityName = p("deityName");
    if (p("person")) extra.people = [p("person")];
    if (J.ANCESTOR_TOPICS.some((t) => t.id === p("about"))) extra.about = p("about");
    if (J.OMEN_KINDS.some((t) => t.id === p("seen"))) extra.seen = p("seen");
    if (p("what")) extra.what = p("what");
    const links = [];
    if (p("page")) links.push({ type: "page", id: p("page"), title: p("pageTitle") });
    if (p("dream")) links.push({ type: "dream", id: p("dream"), title: p("dreamTitle") });
    if (links.length) extra.links = links;
    const now = new Date();
    if (kind === "omens") extra.checkOn = J.checkOnChoices(kit.dateKey(now))[1].value;
    form.entry = J.blankEntry(kind, now, extra);
  }

  function editView() {
    const existing = id ? entries.find((e) => e.id === id) : null;
    const back = kit.back(existing ? routes.entry(id) : routes.list, existing ? "Entry" : def.title);
    if (id && !existing) return [back, kit.p(loaded ? "This entry couldn’t be found. It may have been deleted on another device." : "Opening…")].join("");
    startForm();
    const e = form.entry;
    const now = new Date();
    const prompt = e.prompt ? J.promptById(kind, e.prompt) : null;
    const known = J.tagCounts(entries).map((t) => t.tag).filter((t) => !e.tags.includes(t)).slice(0, 12);
    const place = kit.readPlace();
    const parts = [back, kit.head({ eyebrow: existing ? "Edit" : def.eyebrow, title: existing ? "Your entry" : def.write })];
    if (kind === "shadow" && !existing) parts.push(kit.muted(J.SHADOW_NOTE));
    parts.push(
      kit.section(
        "Prompt",
        `${kit.p(prompt ? prompt.text : "No prompt: write whatever is with you.")}${kit.chips(
          [
            !prompt ? kit.chip({ label: "Today’s prompt", act: "prompt-today" }) : "",
            kit.chip({ label: form.prompts ? "Hide prompts" : "Choose a prompt", act: "prompts" }),
            prompt ? kit.chip({ label: "No prompt", act: "prompt", value: "" }) : ""
          ].filter(Boolean)
        )}${form.prompts ? kit.chips(J.PROMPTS[kind].map((p) => kit.chip({ label: `${p.group}: ${p.text}`, act: "prompt", value: p.id, pressed: e.prompt === p.id })), "Prompts") : ""}`,
        { id: "prompt" }
      )
    );
    if (kind === "devotion") {
      const q = form.deityQuery.trim().toLowerCase();
      const matches = q ? choices.filter((c) => c.name.toLowerCase().includes(q) || c.note.toLowerCase().includes(q)).slice(0, 8) : choices.filter((c) => ["Your patron", "Dedicated", "Exploring"].includes(c.note)).slice(0, 8);
      const own = form.deityQuery.trim() && !choices.some((c) => c.name.toLowerCase() === q);
      parts.push(
        kit.section(
          e.deityName ? `For ${e.deityName}` : "Which god or spirit?",
          [
            kit.field({ id: "deity-query", label: "Find a deity, or name one in your own words", value: form.deityQuery, input: "deity-query", placeholder: "Hekate, Brigid, the spirit of the river" }),
            `<div data-deity-matches>${deityMatchesHtml(matches, own)}</div>`,
            kit.muted("What it was"),
            kit.chips(J.DEVOTION_ACTS.map((a) => kit.chip({ label: a.label, act: "act", value: a.id, pressed: e.acts.includes(a.id) })), "What it was"),
            e.acts.includes("offering") ? `${kit.muted("Offerings")}${kit.chips(J.OFFERING_TYPES.map((o) => kit.chip({ label: o, act: "offering", value: o, pressed: e.offerings.includes(o) })), "Offerings")}` : "",
            e.acts.includes("offering") || e.acts.includes("sign") ? `${kit.muted("How it was received")}${kit.chips(J.RESPONSES.map((r) => kit.chip({ label: r, act: "response", value: r, pressed: e.response === r })), "How it was received")}` : ""
          ].join(""),
          { id: "deity" }
        )
      );
    }
    if (kind === "ancestors") {
      parts.push(
        kit.section(
          "What it’s about",
          `${kit.chips(J.ANCESTOR_TOPICS.map((t) => kit.chip({ label: t.label, act: "about", value: t.id, pressed: e.about === t.id })), "What it’s about")}${kit.muted("Who")}${
            people.length ? kit.chips(people.map((p) => kit.chip({ label: p.data.name || "Unnamed", act: "who", value: p.id, pressed: e.people.includes(p.id) })), "Who") : kit.muted("Nobody added yet. Your people are kept in Hedge → Ancestors.")
          }${kit.actions([kit.button({ label: "Add someone", url: url.personNew, ghost: true, small: true })])}`,
          { id: "about" }
        )
      );
    }
    if (kind === "omens") parts.push(kit.section("What kind of sign", kit.chips(J.OMEN_KINDS.map((t) => kit.chip({ label: t.label, act: "seen", value: t.id, pressed: e.seen === t.id })), "What kind of sign"), { id: "seen" }));
    parts.push(
      `<div class="sp-section">${J.fieldsFor(kind, e)
        .map((f) => kit.field({ id: `jf-${f.key}`, label: f.label, value: e[f.key], input: "field", multiline: f.multiline, placeholder: f.placeholder }))
        .join("")}${kit.field({ id: "jf-title", label: "Title (optional)", value: e.title, input: "field", placeholder: "A few words to find it by" })}</div>`
    );
    parts.push(
      kit.section(
        "When",
        `${kit.dayPicker({ name: "when", label: "The day", value: e.date, typed: form.typedDate, now })}${kit.field({ id: "jf-time", label: "Time (HH:MM, optional)", value: e.time, input: "time", placeholder: "21:30" })}${kit.muted(
          `The moon then: ${e.moonPhase}, in ${e.moonSign}.${kind === "shadow" ? ` Its season: ${J.moonSeasonOn(e.date)}.` : ""}${kind === "omens" ? (place ? " The planetary hour is worked out from your place when you keep it." : " Set your place on The sky today to have the planetary hour noted too.") : ""}`
        )}`,
        { id: "when" }
      )
    );
    if (kind === "omens") {
      parts.push(
        kit.section(
          "Look back",
          `${kit.chips(J.checkOnChoices(e.date).map((c) => kit.chip({ label: c.label, act: "check", value: c.value, pressed: e.checkOn === c.value })), "Look back")}${
            existing
              ? `${kit.muted("Did it come to pass?")}${kit.chips(J.OUTCOMES.map((o) => kit.chip({ label: o.label, act: "form-outcome", value: o.value, pressed: e.outcome === o.value })), "Did it come to pass")}${kit.field({ id: "jf-outcomeNote", label: "What happened", value: e.outcomeNote, input: "field", multiline: true, placeholder: "How it turned out, if it did" })}`
              : ""
          }`,
          { id: "look-back" }
        )
      );
    }
    parts.push(
      kit.section(
        "Tags",
        [
          e.tags.length ? kit.chips(e.tags.map((t) => kit.chip({ label: `${t}  ×`, act: "tag-remove", value: t, a11y: `Remove ${t}` })), "Tags") : "",
          kit.field({ id: "tag-text", label: "Add tags", value: form.tagText, input: "tag-text", placeholder: "grief, mother, protection (commas between)" }),
          kit.actions([kit.button({ label: "Add", act: "tag-add", small: true, ghost: true, id: "tag-add" })]),
          known.length ? kit.chips(known.map((t) => kit.chip({ label: t, act: "tag-known", value: t, a11y: `Add ${t}` })), "Your other tags") : ""
        ].join(""),
        { id: "tags" }
      )
    );
    const pq = form.pageQuery.trim().toLowerCase();
    const pageMatches = pq ? pages.filter((p) => (p.title || "").toLowerCase().includes(pq)).slice(0, 6) : [];
    parts.push(
      kit.section(
        "Link to your Grimoire",
        [
          e.links.length ? kit.chips(e.links.map((l) => kit.chip({ label: `${l.title || "Untitled"}  ×`, act: "unlink", value: `${l.type}:${l.id}`, a11y: `Unlink ${l.title}` })), "Linked") : "",
          user ? kit.field({ id: "page-query", label: "Find a Grimoire page", value: form.pageQuery, input: "page-query", placeholder: "A page title" }) : kit.muted("Sign in to link Grimoire pages."),
          `<div data-page-matches>${pageMatches.length ? kit.chips(pageMatches.map((p) => kit.chip({ label: p.title || "Untitled page", act: "link-page", value: p.id }))) : ""}</div>`,
          dreams.length ? `${kit.muted("Or a recent dream")}${kit.chips(dreams.slice(0, 5).map((dr) => kit.chip({ label: dr.data.title || "Untitled dream", act: "link-dream", value: dr.id, pressed: e.links.some((l) => l.type === "dream" && l.id === dr.id) })), "Recent dreams")}` : ""
        ].join(""),
        { id: "links" }
      )
    );
    parts.push(
      !user ? kit.notice("Saved in this browser. Sign in to keep this journal with your account.") : "",
      kit.notice(form.problem, { live: true }),
      kit.actions([
        kit.button({ label: form.saving ? "Keeping it…" : existing ? "Save changes" : "Keep this", act: "save", primary: true, disabled: form.saving, id: "journal-save" }),
        existing ? kit.textButton({ label: "Delete this entry", act: "delete", quiet: true }) : ""
      ]),
      kind === "shadow" ? kit.muted(J.SHADOW_SOURCE) : "",
      kit.support()
    );
    return parts.join("");
  }

  function deityMatchesHtml(matches, own) {
    const e = form.entry;
    return kit.chips(
      [
        ...matches.map((c) => kit.chip({ label: c.note ? `${c.name} · ${c.note}` : c.name, act: "deity-pick", value: `${c.key}|${c.name}`, pressed: e.deityName === c.name })),
        own ? kit.chip({ label: `“${form.deityQuery.trim()}”, in my own words`, act: "deity-pick", value: `|${form.deityQuery.trim()}`, pressed: e.deityName === form.deityQuery.trim() }) : ""
      ].filter(Boolean),
      "Deities"
    );
  }

  // ------------------------------------------------------------------ wiring

  const VIEWS = { "journals-hub": hubView, "journal-list": listView, "journal-entry": entryView, "journal-edit": editView };
  const draw = () => {
    if (view !== "journals-hub" && !kind) {
      kit.render(root, [kit.back(url.hub, "Journals"), kit.head({ title: "Journals" }), kit.p("That journal couldn’t be found.")].join(""));
      return;
    }
    if (def) global.document.title = `${def.title} | ${tab === "journal" ? "Rituals" : "Grimoire"} | Salt & Sovereignty`;
    kit.render(root, VIEWS[view]());
  };
  const setWhen = (date, time) => {
    form.entry = { ...form.entry, date, time, ...J.journalMoon(date, time) };
  };
  const toggleIn = (key, value) => {
    const list = form.entry[key];
    form.entry = { ...form.entry, [key]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value] };
  };
  const failed = (error, words) => {
    console.error(error);
    return `${words}${error?.message ? ` (${error.message})` : ""}. Your words are still here.`;
  };

  kit.delegate(root, {
    search(el) {
      filter.query = el.value;
      const box = root.querySelector("[data-results]");
      if (box) box.innerHTML = results();
    },
    tag(el) {
      filter.tag = filter.tag === el.dataset.value ? "" : el.dataset.value;
      draw();
    },
    deity(el) {
      filter.deity = filter.deity === el.dataset.value ? "" : el.dataset.value;
      draw();
    },
    person(el) {
      filter.person = filter.person === el.dataset.value ? "" : el.dataset.value;
      draw();
    },
    async place(el) {
      const value = el.dataset.value;
      if (value === placeOf(kind)) return;
      try {
        await global.SaltSettings.patch({ [def.setting]: value });
        kit.go(J.journalWebRoutes(kind, value).list);
      } catch (error) {
        console.error(error);
      }
    },
    async outcome(el) {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      entry.data = { ...entry.data, outcome: el.dataset.value };
      draw();
      try {
        await kit.update(def.collection, id, entry.data);
      } catch (error) {
        console.error(error);
      }
    },
    "prompt-today"() {
      form.entry.prompt = J.promptOfDay(kind, new Date()).id;
      draw();
    },
    prompts() {
      form.prompts = !form.prompts;
      draw();
    },
    prompt(el) {
      form.entry.prompt = el.dataset.value;
      form.prompts = false;
      draw();
    },
    "deity-query"(el) {
      form.deityQuery = el.value;
      const q = el.value.trim().toLowerCase();
      const matches = q ? choices.filter((c) => c.name.toLowerCase().includes(q) || c.note.toLowerCase().includes(q)).slice(0, 8) : [];
      const box = root.querySelector("[data-deity-matches]");
      if (box) box.innerHTML = deityMatchesHtml(matches, el.value.trim() && !choices.some((c) => c.name.toLowerCase() === q));
    },
    "deity-pick"(el) {
      const [key, ...rest] = el.dataset.value.split("|");
      form.entry = { ...form.entry, deityKey: key, deityName: rest.join("|") };
      draw();
    },
    act(el) {
      toggleIn("acts", el.dataset.value);
      draw();
    },
    offering(el) {
      toggleIn("offerings", el.dataset.value);
      draw();
    },
    response(el) {
      form.entry.response = form.entry.response === el.dataset.value ? "" : el.dataset.value;
      draw();
    },
    about(el) {
      form.entry.about = el.dataset.value;
      draw();
    },
    who(el) {
      toggleIn("people", el.dataset.value);
      draw();
    },
    seen(el) {
      form.entry.seen = el.dataset.value;
      draw();
    },
    field(el) {
      form.entry[el.id.slice(3)] = el.value;
    },
    "when-day"(el) {
      setWhen(el.dataset.value || kit.dateKey(new Date()), form.entry.time);
      form.typedDate = "";
      draw();
    },
    "when-typed"(el) {
      form.typedDate = el.value;
      const key = kit.typedDay(el.value);
      if (key) {
        setWhen(key, form.entry.time);
        draw();
      }
    },
    time(el) {
      const t = el.value.trim();
      if (/^\d{1,2}:\d{2}$/.test(t)) setWhen(form.entry.date, t);
      else form.entry.time = t;
    },
    check(el) {
      form.entry.checkOn = el.dataset.value;
      draw();
    },
    "form-outcome"(el) {
      form.entry.outcome = el.dataset.value;
      draw();
    },
    "tag-text"(el) {
      form.tagText = el.value;
    },
    "tag-add"() {
      form.entry.tags = J.withTags(form.entry.tags, form.tagText);
      form.tagText = "";
      draw();
      root.querySelector("#tag-text")?.focus();
    },
    "tag-known"(el) {
      form.entry.tags = J.withTags(form.entry.tags, el.dataset.value);
      draw();
    },
    "tag-remove"(el) {
      form.entry.tags = form.entry.tags.filter((t) => t !== el.dataset.value);
      draw();
    },
    "page-query"(el) {
      form.pageQuery = el.value;
      const pq = el.value.trim().toLowerCase();
      const matches = pq ? pages.filter((p) => (p.title || "").toLowerCase().includes(pq)).slice(0, 6) : [];
      const box = root.querySelector("[data-page-matches]");
      if (box) box.innerHTML = matches.length ? kit.chips(matches.map((p) => kit.chip({ label: p.title || "Untitled page", act: "link-page", value: p.id }))) : "";
    },
    "link-page"(el) {
      const page = pages.find((p) => p.id === el.dataset.value);
      form.entry.links = J.withLink(form.entry.links, { type: "page", id: el.dataset.value, title: page?.title || "Untitled page" });
      form.pageQuery = "";
      draw();
    },
    "link-dream"(el) {
      const dream = dreams.find((x) => x.id === el.dataset.value);
      const link = { type: "dream", id: el.dataset.value, title: dream?.data.title || "Untitled dream" };
      form.entry.links = form.entry.links.some((l) => l.type === "dream" && l.id === link.id) ? J.withoutLink(form.entry.links, link) : J.withLink(form.entry.links, link);
      draw();
    },
    unlink(el) {
      const [type, ...rest] = el.dataset.value.split(":");
      form.entry.links = J.withoutLink(form.entry.links, { type, id: rest.join(":") });
      draw();
    },
    async save() {
      if (form.saving) return;
      const place = kit.readPlace();
      const hour = kind === "omens" && place ? H.currentHour(J.momentOf(form.entry.date, form.entry.time), place)?.planet || "" : form.entry.hour;
      const data = J.readyToKeep(kind, { ...form.entry, hour, tags: J.withTags(form.entry.tags, form.tagText) });
      if (!data) {
        form.problem = `Nothing to keep yet. ${J.notReadyWords(kind, form.entry)}`;
        draw();
        return;
      }
      form.saving = true;
      form.problem = "";
      draw();
      try {
        if (id) {
          await kit.update(def.collection, id, data);
          kit.go(routes.entry(id));
        } else {
          const added = await kit.add(def.collection, data);
          kit.go(routes.entry(added.id));
        }
      } catch (error) {
        form.saving = false;
        form.problem = failed(error, "It couldn’t be kept");
        draw();
      }
    },
    async delete() {
      if (!kit.confirm("Delete this entry? It will be removed from your journal on every device.")) return;
      try {
        await kit.remove(def.collection, id);
        kit.go(routes.list);
      } catch (error) {
        form.problem = failed(error, "It couldn’t be deleted");
        draw();
      }
    }
  });

  kit.start(async (who) => {
    user = who;
    await load();
    draw();
  });
})(window);
