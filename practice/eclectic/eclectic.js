/*
 * Eclectic (/practice/eclectic/…): My correspondences, your own meanings for
 * things beside the Library's, and the sampler, one tool from every path.
 * The app's screens in app/src/app/(tabs)/rituals/craft/eclectic; logic from
 * js/core/practice-a.js. Kept in craft_entries, collection
 * `eclectic.correspondences`, as the app keeps them.
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.["practice-a"];
  const root = kit?.root();
  if (!kit || !core || !root) return;

  const { correspondences: C, libraryModel: L, premade, practices } = core;
  const view = root.dataset.view;
  const id = new URLSearchParams(global.location.search).get("id");
  const url = {
    list: kit.href.tool("eclectic", "correspondences"),
    entry: (x) => kit.href.tool("eclectic", "correspondences/entry", `id=${encodeURIComponent(x)}`),
    edit: (x) => kit.href.tool("eclectic", "correspondences/edit", x ? `id=${encodeURIComponent(x)}` : "")
  };
  let user = null;
  let entries = [];
  let loaded = false;
  let all = null;
  const pickable = () => (all ??= C.pickableEntries());

  // ------------------------------------------------------------------ hub

  function hubView() {
    const about = premade.PRACTICES.find((p) => p.id === "eclectic")?.about;
    const picks = C.sampler(new Date());
    const workings = premade.PREMADE.filter((p) => p.practices.includes("eclectic"));
    return [
      kit.back(kit.href.hub, "My practice"),
      kit.head({ eyebrow: "My practice", title: "Eclectic", lede: about }),
      kit.section(
        "Tools",
        kit.list(practices.CRAFT_TOOLS.eclectic.map((t, i) => kit.row({ url: i === 0 ? url.list : "/sigil/", title: t.title, detail: i === 0 && entries.length ? `${entries.length} of your own · ${t.detail.toLowerCase()}` : t.detail }))),
        { id: "tools" }
      ),
      kit.section(
        "From every path",
        `${kit.muted("One tool from each practice, changing day by day. Borrow freely; the whole kit is yours.")}${kit.list(
          picks.map((p) => kit.row({ url: kit.href.practice(p.practice), title: p.tool.title, detail: `${p.practiceName} · ${p.tool.detail}` }))
        )}`,
        { id: "sampler" }
      ),
      workings.length
        ? kit.section(
            "Eclectic workings",
            kit.list(workings.map((p) => kit.row({ url: kit.href.premade(p.id), title: p.title, detail: `${p.kind === "spell" ? "Spell" : "Ritual"} · ${p.minutes} min` }))),
            { id: "workings" }
          )
        : "",
      kit.list([kit.row({ url: kit.href.premadeList("eclectic"), title: "All premade workings", detail: "Rituals and spells from every practice · filter by Eclectic" })])
    ].join("");
  }

  // ------------------------------------------------------------------ the list

  const filter = { query: "", source: null, element: null };
  function listResults() {
    const shown = C.byName(C.filterCorrespondences(entries, filter));
    const filtering = !!(filter.query.trim() || filter.source || filter.element);
    if (!shown.length) return kit.muted("Nothing matches. Clear a filter to see more.");
    return kit.section(
      filtering ? `${shown.length} of ${entries.length}` : kit.plural(entries.length, "entry", "entries"),
      kit.list(shown.map((e) => kit.row({ url: url.entry(e.id), title: e.data.name || "Untitled", detail: C.correspondenceDetail(e.data) || null }))),
      { id: "entries" }
    );
  }
  function listView() {
    const sourcesUsed = C.SOURCES.filter((s) => entries.some((e) => e.data.source === s.id));
    const elementsUsed = C.ELEMENTS.filter((el) => entries.some((e) => (e.data.element || "").toLowerCase().includes(el.toLowerCase())));
    return [
      kit.back(kit.href.practice("eclectic"), "Eclectic"),
      kit.head({
        eyebrow: "Eclectic",
        title: "My correspondences",
        lede: "What things mean to you: from a tradition, a teacher, a hunch, or years of working with them. Beside the Library’s meanings, never beneath them."
      }),
      kit.actions([kit.button({ label: "Add a correspondence", url: url.edit(), primary: true })]),
      entries.length
        ? kit.card(
            [
              kit.field({ id: "c-search", label: "Search your correspondences", value: filter.query, input: "c-search", placeholder: "Rosemary, Mars, protection…", type: "search" }),
              elementsUsed.length > 1
                ? `<p class="sp-label--plain">Element</p>${kit.chips(
                    [kit.chip({ label: "Any", act: "f-element", value: "", pressed: !filter.element }), ...elementsUsed.map((el) => kit.chip({ label: el, act: "f-element", value: el, pressed: filter.element === el }))],
                    "Element"
                  )}`
                : "",
              sourcesUsed.length > 1
                ? `<p class="sp-label--plain">Where it came from</p>${kit.chips(
                    [kit.chip({ label: "Anywhere", act: "f-source", value: "", pressed: !filter.source }), ...sourcesUsed.map((s) => kit.chip({ label: s.label, act: "f-source", value: s.id, pressed: filter.source === s.id }))],
                    "Where it came from"
                  )}`
                : ""
            ].join("")
          )
        : "",
      !loaded
        ? kit.muted("Gathering your correspondences…")
        : !entries.length
        ? kit.card(
            `<h2 class="pr-big">Your own book of meanings</h2>${kit.p(
              "Start with one thing you reach for often, a herb, a stone, a colour, a goddess, and write what it means to you. Pick it from the Library to see the traditional view beside yours."
            )}`
          )
        : `<div data-results>${listResults()}</div>`,
      kit.muted(kit.savedLine(user, "your correspondences"))
    ].join("");
  }

  // ------------------------------------------------------------------ one entry

  const pairs = (list) => `<dl class="pr-pairs">${list.map((p) => `<div class="pr-pair"><dt>${kit.esc(p.label)}</dt><dd>${kit.esc(p.value)}</dd></div>`).join("")}</dl>`;

  function entryView() {
    const back = kit.back(url.list, "My correspondences");
    const entry = entries.find((e) => e.id === id);
    if (!entry) return [back, kit.head({ eyebrow: "My correspondences", title: loaded ? "Not found" : "…" }), loaded ? kit.p("This entry may have been removed on another device.") : ""].join("");
    const c = { ...C.blankCorrespondence(), ...entry.data };
    const library = C.entryById(c.ref, pickable());
    const mine = C.mySide(c);
    const theirs = library ? C.traditionalSide(library) : [];
    const matches = library ? C.agreement(c, library) : [];
    const source = C.sourceLabel(c.source);
    return [
      back,
      kit.head({ eyebrow: library ? L.typeSingular(library.type) : "My correspondence", title: c.name || "Untitled" }),
      kit.card(
        `<h2 class="pr-big">To me</h2>${mine.length ? pairs(mine) : kit.muted("Nothing written yet.")}${
          source || c.sourceNote.trim() ? kit.muted(`From ${[source?.toLowerCase(), c.sourceNote.trim()].filter(Boolean).join(": ")}`) : ""
        }`,
        { gold: true }
      ),
      library
        ? kit.card(
            `<h2 class="pr-big">In the Library</h2>${theirs.length ? pairs(theirs) : kit.muted("The Library lists no correspondences for this entry.")}${matches
              .map((m) => kit.muted(m.same ? `Your ${m.label.toLowerCase()} agrees with tradition.` : `Your ${m.label.toLowerCase()} (${m.mine}) is your own; tradition gives ${m.theirs}.`))
              .join("")}`
          )
        : "",
      library ? kit.list([kit.row({ url: kit.href.library(library.id), title: `${library.name} in the Library`, detail: "Lore, uses, pairings and safety" })]) : "",
      kit.actions([kit.button({ label: "Edit", url: url.edit(entry.id), ghost: true }), kit.textButton({ label: "Remove", act: "remove", quiet: true })])
    ].join("");
  }

  // ------------------------------------------------------------------ add or edit

  const form = { ready: false, c: null, shelf: null, search: "", saving: false, problem: "" };

  function picked(label, key, options) {
    const value = form.c[key];
    return `<div class="sp-section">${kit.field({ id: `c-${key}`, label, value, input: "c-field" })}${kit.chips(
      options.map((o) => kit.chip({ label: o, act: "c-pick", value: o, data: { key }, pressed: value === o, a11y: `${label}: ${o}` })),
      label
    )}</div>`;
  }

  function pickerResults() {
    const results = form.search.trim() || form.shelf ? C.searchPickable(pickable(), form.search, form.shelf, 12) : [];
    if (results.length)
      return kit.list(
        results.map((e) =>
          kit.row({
            act: "c-link",
            data: { ref: e.id },
            title: e.name,
            detail: kit.join([
              L.typeSingular(e.type),
              C.traditionalSide(e)
                .filter((p) => p.label === "Element" || p.label === "Planet" || p.label === "Pantheon")
                .map((p) => p.value)
                .join(" · ")
            ])
          })
        )
      );
    return form.search.trim() || form.shelf ? kit.muted("Nothing in the Library by that name. Keep your own name for it; that’s just as good.") : "";
  }

  function editView() {
    const existing = id ? entries.find((e) => e.id === id) : null;
    const back = kit.back(existing ? url.entry(existing.id) : url.list, existing ? existing.data.name || "My correspondences" : "My correspondences");
    if (id && !existing) return [back, kit.head({ eyebrow: "My correspondences", title: loaded ? "Not found" : "Edit" }), kit.p(loaded ? "This entry may have been removed on another device." : "Gathering your entry…")].join("");
    if (!form.ready) {
      form.ready = true;
      form.c = existing ? { ...C.blankCorrespondence(), ...existing.data } : C.blankCorrespondence();
    }
    const c = form.c;
    const library = C.entryById(c.ref, pickable());
    const theirs = library ? C.traditionalSide(library) : [];
    const meaning = theirs.find((p) => p.label === "Meaning");
    const libraryPart = library
      ? kit.card(
          `<p class="sp-label--plain">From the Library · ${kit.esc(L.typeSingular(library.type))}</p><h3 class="pr-big">${kit.esc(library.name)}</h3>${
            theirs.length > (meaning ? 1 : 0)
              ? kit.muted(`Traditionally: ${theirs.filter((p) => p.label !== "Meaning").map((p) => `${p.label.toLowerCase()} ${p.value}`).join("; ")}.`)
              : ""
          }${meaning ? kit.muted(meaning.value) : ""}${kit.actions([kit.button({ label: "Open in the Library", url: kit.href.library(library.id), ghost: true }), kit.textButton({ label: "Unlink from the Library", act: "c-unlink" })])}`
        )
      : kit.details(
          "Pick it from the Library",
          `${kit.muted("Link a herb, crystal, candle, deity or tool to see its traditional correspondences beside yours.")}${kit.chips(
            C.PICK_TYPES.map((t) => kit.chip({ label: t.label, act: "c-shelf", value: t.id, pressed: form.shelf === t.id })),
            "Library shelf"
          )}${kit.field({ id: "c-library-search", label: "Search the Library", value: form.search, input: "c-library-search", placeholder: "Basil, amethyst, Brigid…", type: "search" })}<div data-results>${pickerResults()}</div>`,
          { open: !existing, id: "pick" }
        );
    const noteLabel = c.source === "tradition" ? "Which tradition?" : c.source === "teacher" ? "Which teacher or book?" : c.source === "experience" ? "What happened?" : "A note on its source";
    return [
      back,
      kit.head({ eyebrow: "My correspondences", title: existing ? "Edit" : "A new correspondence" }),
      kit.section("The thing", `${kit.field({ id: "c-name", label: "Name", value: c.name, input: "c-field", placeholder: "Rosemary, a robin’s feather, the colour teal…" })}${libraryPart}`, { id: "thing" }),
      kit.section(
        "What it means to you",
        kit.field({ id: "c-meaning", label: "Meaning", value: c.meaning, input: "c-field", multiline: true, placeholder: "What it does in your work, what it calls up, when you reach for it" }),
        { id: "meaning" }
      ),
      kit.details(
        "Element, planet, day and colour",
        `${kit.muted("All optional, and all yours: write your own or tap a suggestion.")}${picked("Element", "element", C.ELEMENTS)}${picked("Planet", "planet", C.PLANETS)}${picked("Day", "day", C.DAYS)}${picked(
          "Colour",
          "colour",
          C.COLOURS
        )}`,
        { open: !!(c.element || c.planet || c.day || c.colour), id: "tags" }
      ),
      kit.section(
        "Where it came from",
        `${kit.chips(C.SOURCES.map((s) => kit.chip({ label: s.label, act: "c-source", value: s.id, pressed: c.source === s.id })), "Where it came from")}${kit.field({
          id: "c-sourceNote",
          label: noteLabel,
          value: c.sourceNote,
          input: "c-field",
          placeholder: "Optional"
        })}`,
        { id: "source" }
      ),
      kit.notice(form.problem, { live: true }),
      kit.actions([
        kit.button({ label: form.saving ? "Saving…" : existing ? "Save changes" : "Save", act: "c-save", primary: true, disabled: form.saving, id: "c-save" }),
        existing ? kit.textButton({ label: "Remove", act: "remove", quiet: true }) : ""
      ]),
      kit.muted(kit.savedLine(user, "your correspondences"))
    ].join("");
  }

  // ------------------------------------------------------------------ wiring

  const VIEWS = { eclectic: hubView, "eclectic-list": listView, "eclectic-entry": entryView, "eclectic-edit": editView };
  const draw = () => kit.render(root, (VIEWS[view] || hubView)());
  const results = (html) => {
    const box = root.querySelector("[data-results]");
    if (box) box.innerHTML = html;
  };

  kit.delegate(root, {
    "c-search"(el) {
      filter.query = el.value;
      results(listResults());
    },
    "f-element"(el) {
      const v = el.dataset.value || null;
      filter.element = filter.element === v ? null : v;
      draw();
    },
    "f-source"(el) {
      const v = el.dataset.value || null;
      filter.source = filter.source === v ? null : v;
      draw();
    },
    "c-field"(el) {
      form.c[el.id.slice(2)] = el.value;
      // Typing a tag: keep its chips' pressed state in step without redrawing.
      root.querySelectorAll(`[data-act="c-pick"][data-key="${el.id.slice(2)}"]`).forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.value === el.value)));
    },
    "c-pick"(el) {
      const key = el.dataset.key;
      form.c[key] = form.c[key] === el.dataset.value ? "" : el.dataset.value;
      draw();
    },
    "c-shelf"(el) {
      form.shelf = form.shelf === el.dataset.value ? null : el.dataset.value;
      draw();
    },
    "c-library-search"(el) {
      form.search = el.value;
      results(pickerResults());
    },
    "c-link"(el) {
      const ref = el.dataset.ref;
      const entry = C.entryById(ref, pickable());
      if (!entry) return;
      const before = C.entryById(form.c.ref, pickable());
      // Take the Library's name unless you've already named it yourself.
      form.c = { ...form.c, ref, name: !form.c.name.trim() || form.c.name === before?.name ? entry.name : form.c.name };
      form.search = "";
      form.shelf = null;
      draw();
      root.querySelector("#c-name")?.focus();
    },
    "c-unlink"() {
      form.c.ref = null;
      draw();
    },
    "c-source"(el) {
      form.c.source = form.c.source === el.dataset.value ? null : el.dataset.value;
      draw();
    },
    async "c-save"() {
      if (form.saving) return;
      const c = form.c;
      if (!c.name.trim()) {
        form.problem = "Name the thing first, or pick it from the Library.";
        draw();
        root.querySelector("#c-name")?.focus();
        return;
      }
      const data = {
        ...c,
        name: c.name.trim(),
        meaning: c.meaning.trim(),
        element: c.element.trim(),
        planet: c.planet.trim(),
        day: c.day.trim(),
        colour: c.colour.trim(),
        sourceNote: c.sourceNote.trim()
      };
      form.saving = true;
      form.problem = "";
      draw();
      try {
        if (id) {
          await kit.update(C.CORRESPONDENCES, id, data);
          kit.go(url.entry(id));
        } else {
          const made = await kit.add(C.CORRESPONDENCES, data);
          kit.go(url.entry(made.id));
        }
      } catch (error) {
        console.error(error);
        form.saving = false;
        form.problem = "This couldn’t be saved. Your words are still here, so you can try again.";
        draw();
      }
    },
    async remove() {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      if (!kit.confirm(`Remove ${entry.data.name || "this entry"}? It will be taken out of your correspondences on every device.`)) return;
      try {
        await kit.remove(C.CORRESPONDENCES, entry.id);
        kit.go(url.list);
      } catch (error) {
        console.error(error);
      }
    }
  });

  kit.start(async (who) => {
    user = who;
    entries = (await kit.entries(C.CORRESPONDENCES)).map((e) => ({ ...e, data: { ...C.blankCorrespondence(), ...(e.data || {}) } }));
    loaded = true;
    draw();
  });
})(window);
