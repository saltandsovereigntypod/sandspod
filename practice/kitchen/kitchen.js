/*
 * Kitchen & hearth (/practice/kitchen/…): home by the moon, pantry
 * correspondences, the simmer pot and the kitchen spell book. The app's
 * screens in app/src/app/(tabs)/rituals/craft/kitchen; logic from
 * js/core/practice-a.js. Ticks are kept in craft_entries, collection
 * `kitchen.tasks` ({ lunation, tide, done }), as the app keeps them.
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.["practice-a"];
  const root = kit?.root();
  if (!kit || !core || !root) return;

  const { moonhome: H, pantry: P, simmer: S, premade, planner, practices, moon } = core;
  const view = root.dataset.view;
  const COLLECTION = "kitchen.tasks";
  const TIDE_INTENTION = { waxing: "prosperity", full: "protection", waning: "cleansing", dark: "peace" };
  const ELEMENTS = ["Earth", "Water", "Fire", "Air"];
  const practice = premade.PRACTICES.find((p) => p.id === "kitchen");
  const backToKitchen = kit.back(kit.href.practice("kitchen"), "Kitchen & hearth");
  const params = new URLSearchParams(global.location.search);
  const dayWords = (d) => d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const workingRow = (p) => kit.row({ url: kit.href.premade(p.id), title: p.title, detail: `${p.kind === "spell" ? "Spell" : "Ritual"} · ${p.minutes} min` });
  let user = null;

  // ------------------------------------------------------------------ hub

  function hubView() {
    const guide = H.TIDE_GUIDES[H.homeTide(new Date())];
    const paths = { "Pantry correspondences": "pantry", "Simmer pot": "simmer", "Home by the moon": "moon", "Kitchen spell book": "spells" };
    return [
      kit.back(kit.href.hub, "My practice"),
      kit.head({ eyebrow: "My practice", title: practice?.name ?? "Kitchen & hearth", lede: practice?.about }),
      kit.card(kit.p(guide.summary), { gold: true, label: `In the house tonight · ${guide.label}` }),
      kit.section("Tools", kit.list(practices.CRAFT_TOOLS.kitchen.map((t) => kit.row({ url: kit.href.tool("kitchen", paths[t.title]), title: t.title, detail: t.detail }))), { id: "tools" }),
      kit.list([kit.row({ url: kit.href.premadeList("kitchen"), title: "Premade workings", detail: "Every ritual and spell, filter by Kitchen & hearth" })])
    ].join("");
  }

  // ------------------------------------------------------------------ home by the moon

  const ticks = { entries: [], ready: false, saving: false, problem: "" };

  function moonView() {
    const now = new Date();
    const m = moon.moonState(now);
    const tide = H.homeTide(now);
    const lunation = H.lunationKey(now);
    const turn = H.nextTurn(now);
    const guide = H.TIDE_GUIDES[tide];
    const tasks = H.tasksFor(tide, lunation);
    const entry = ticks.entries.find((e) => e.data?.lunation === lunation && e.data?.tide === tide);
    const done = entry?.data.done ?? [];
    const kept = tasks.filter((t) => done.includes(t.id)).length;
    const workings = premade.filterPremade(premade.PREMADE, { practice: "kitchen", intention: TIDE_INTENTION[tide] }).slice(0, 3);
    const items = tasks
      .map((task) => {
        const on = done.includes(task.id);
        return `<button type="button" class="pr-tick" role="checkbox" aria-checked="${on}" data-act="tick" data-value="${kit.esc(task.id)}"${!ticks.ready ? " disabled" : ""}${ticks.saving ? ' aria-busy="true"' : ""}><span class="pr-tick__box" aria-hidden="true">${
          on ? "✓" : ""
        }</span><span class="pr-tick__text"><span class="pr-tick__title">${kit.esc(task.title)}</span><span class="sp-caption">${kit.esc(task.detail)}</span></span></button>`;
      })
      .join("");
    return [
      backToKitchen,
      kit.head({ eyebrow: `${m.name} · ${Math.round(m.illumination * 100)}% lit`, title: "Home by the moon" }),
      kit.card(
        `${kit.p(guide.summary)}${kit.chips(guide.suits.map((s) => kit.chip({ label: s })))}${kit.muted(`Next: ${turn.phase === "full" ? "full moon" : "new moon"} on ${dayWords(turn.date)}.`)}`,
        { gold: true, label: guide.label }
      ),
      kit.section(
        `For this ${guide.label.toLowerCase()} · ${kept} of ${tasks.length} done`,
        `<div class="pr-ticks">${items}</div>${kit.notice(ticks.problem, { live: true })}${kit.muted("A new list comes with each part of the moon’s month. Do what suits you; none of it is required.")}${kit.caption(
          kit.savedLine(user, "your ticks")
        )}`,
        { id: "tasks" }
      ),
      workings.length ? kit.section("Workings that suit tonight", kit.list(workings.map(workingRow)), { id: "workings" }) : "",
      kit.details(
        "Through the month",
        `${H.TIDE_ORDER.map((t) => `<div class="sp-section"><h3>${kit.esc(`${H.TIDE_GUIDES[t].label}${t === tide ? " · now" : ""}`)}</h3>${kit.p(H.TIDE_GUIDES[t].summary)}</div>`).join("")}${kit.muted(
          "Drawing in on the growing moon and clearing out on the waning one is a widely kept modern rhythm, built on older farming and household lore about the moon’s pull."
        )}`
      )
    ].join("");
  }

  async function tick(id) {
    if (ticks.saving) return;
    const now = new Date();
    const tide = H.homeTide(now);
    const lunation = H.lunationKey(now);
    const entry = ticks.entries.find((e) => e.data?.lunation === lunation && e.data?.tide === tide);
    const next = H.toggleTick(entry?.data.done ?? [], id);
    ticks.saving = true;
    ticks.problem = "";
    draw();
    try {
      if (entry) {
        await kit.update(COLLECTION, entry.id, { ...entry.data, done: next });
        entry.data = { ...entry.data, done: next };
      } else {
        const made = await kit.add(COLLECTION, { lunation, tide, done: next });
        ticks.entries.unshift(made);
      }
    } catch (error) {
      console.error(error);
      ticks.problem = "Couldn’t save. Please try again.";
    } finally {
      ticks.saving = false;
      draw();
    }
  }

  // ------------------------------------------------------------------ pantry

  const shelf = { query: "", group: null, element: null, intention: null };
  const pantryDetail = (p) => kit.join([`${p.element} · ${p.planet}`, p.uses.slice(0, 3).join(", "), p.library ? "in the Library" : null]);

  function pantryResults() {
    const shown = P.filterPantry(P.PANTRY, shelf);
    const filtering = !!(shelf.query.trim() || shelf.group || shelf.element || shelf.intention);
    return kit.section(
      filtering ? kit.plural(shown.length, "item", "items") : `All ${P.PANTRY.length} items`,
      shown.length
        ? kit.list(shown.map((p) => kit.row({ url: kit.href.tool("kitchen", "pantry/item", `key=${encodeURIComponent(p.key)}`), title: p.name, detail: pantryDetail(p) })))
        : kit.card(kit.p("Nothing on the shelf matches all of that. Try fewer filters.")),
      { id: "pantry-results" }
    );
  }

  function pantryView() {
    return [
      backToKitchen,
      kit.head({
        eyebrow: "Kitchen & hearth",
        title: "Pantry correspondences",
        lede: "The everyday cupboard as the old kitchen read it: each thing’s element and planet, what it’s used for, a way to cook or clean with it, and what to take care with."
      }),
      kit.card(
        [
          kit.field({ id: "pantry-search", label: "Search the pantry", value: shelf.query, input: "pantry-search", placeholder: "Honey, protection, Venus…", type: "search" }),
          `<p class="sp-label--plain">Shelf</p>`,
          kit.chips(
            [kit.chip({ label: "All", act: "group", value: "", pressed: !shelf.group }), ...P.PANTRY_GROUPS.map((g) => kit.chip({ label: g.label, act: "group", value: g.key, pressed: shelf.group === g.key }))],
            "Shelf"
          ),
          `<p class="sp-label--plain">Element</p>`,
          kit.chips(
            [kit.chip({ label: "Any", act: "element", value: "", pressed: !shelf.element }), ...ELEMENTS.map((e) => kit.chip({ label: e, act: "element", value: e, pressed: shelf.element === e }))],
            "Element"
          ),
          kit.details(
            "Good for…",
            kit.chips(
              [
                kit.chip({ label: "Anything", act: "intention", value: "", pressed: !shelf.intention }),
                ...planner.INTENTIONS.map((i) => kit.chip({ label: i.label, act: "intention", value: i.key, pressed: shelf.intention === i.key }))
              ],
              "Good for"
            ),
            { open: !!shelf.intention, id: "good-for" }
          )
        ].join("")
      ),
      `<div data-results>${pantryResults()}</div>`,
      kit.section(
        "Kitchen herbs in the Living Library",
        `${kit.muted("These have full entries of their own, with their lore across traditions.")}${kit.list(
          P.LIBRARY_KITCHEN_HERBS.map((key) => kit.row({ url: kit.href.library(`traditional:herb:${key}`), title: P.libraryHerbName(key), detail: "Open in the Library" }))
        )}`,
        { id: "library-herbs" }
      )
    ].join("");
  }

  function pantryItemView() {
    const item = P.pantryItem(params.get("key"));
    const backToPantry = kit.back(kit.href.tool("kitchen", "pantry"), "Pantry correspondences");
    if (!item) return [backToPantry, kit.head({ title: "Not found" }), kit.p("That isn’t on the pantry shelf any more.")].join("");
    const libraryId = P.pantryLibraryId(item);
    const group = P.PANTRY_GROUPS.find((g) => g.key === item.group)?.label;
    const words = [item.name.split(/[ (&]/)[0], ...(item.aliases ?? []).slice(0, 2)];
    const seen = new Set();
    const workings = words
      .flatMap((w) => premade.filterPremade(premade.PREMADE, { practice: "kitchen", query: w }))
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .slice(0, 4);
    return [
      backToPantry,
      kit.head({ eyebrow: group, title: item.name }),
      kit.chips([kit.chip({ label: `Element: ${item.element}` }), kit.chip({ label: `Planet: ${item.planet}` })]),
      item.also ? kit.muted(item.also) : "",
      kit.p(`${item.uses.map((u, i) => (i === 0 ? kit.cap(u) : u)).join(", ")}.`),
      libraryId
        ? kit.card(
            `${kit.p(`${item.name} has a full entry in the Library, with its meaning, how to use it, what it pairs with and its place in each tradition.`)}${kit.actions([
              kit.button({ label: `Open ${item.name} in the Library`, url: kit.href.library(libraryId), primary: true })
            ])}`,
            { gold: true, label: "In the Living Library" }
          )
        : kit.card(kit.p(item.about), { label: "Lore and meaning" }),
      kit.card(kit.p(item.kitchen), { label: "In the kitchen" }),
      kit.card(kit.p(item.safety), { gold: true, label: "Take care" }),
      kit.section(
        "Make a simmer pot for",
        kit.chips(
          item.intentions.map(
            (key) =>
              `<a class="sp-chip" href="${kit.esc(kit.href.tool("kitchen", "simmer", `intention=${encodeURIComponent(key)}`))}">${kit.esc(planner.intentionByKey(key)?.label ?? key)}<span class="pr-visually-hidden"> (opens the simmer pot)</span></a>`
          )
        ),
        { id: "simmer-for" }
      ),
      workings.length ? kit.section("In the kitchen spell book", kit.list(workings.map(workingRow)), { id: "spell-book" }) : "",
      kit.muted("Correspondences follow the common modern lists; traditions differ, and your own experience of a thing counts too.")
    ].join("");
  }

  // ------------------------------------------------------------------ simmer pot

  const pot = { intention: planner.intentionByKey(params.get("intention"))?.key ?? "peace", picked: null, placeMessage: "" };

  function simmerView() {
    const place = kit.readPlace();
    const guess = S.seasonAt(new Date(), place?.latitude);
    const season = pot.picked ?? guess.season;
    const pots = S.suggestSimmer(pot.intention, season);
    const label = planner.intentionByKey(pot.intention)?.label ?? "Peace & rest";
    const potCard = (p) => {
      const parts = p.parts
        .map((part) => {
          const id = S.partLibraryId(part);
          const text = `${part.amount} ${part.name}${part.optional ? " (optional)" : ""}`;
          return `<li>${id ? `<a class="pr-link" href="${kit.esc(kit.href.library(id))}">${kit.esc(text)}<span class="pr-visually-hidden">, open in the Library</span></a>` : kit.esc(text)}</li>`;
        })
        .join("");
      return kit.card(
        `<h3 class="pr-big">${kit.esc(p.name)}</h3>${kit.muted(p.why)}<ul class="pr-bullets">${parts}</ul>${kit.muted(
          "A medium pan two-thirds full of water. Bring to the boil, then down to the lowest simmer."
        )}${kit.actions([kit.button({ label: "Begin as a ritual", act: "begin", value: p.id, primary: true, hint: "Starts a short guided working for this pot" })])}`
      );
    };
    return [
      backToKitchen,
      kit.head({
        eyebrow: "Kitchen & hearth",
        title: "Simmer pot",
        lede: "A pan of water, peel, spice and herbs kept barely simmering to scent and bless the house. Choose what it’s for and the season, and use what’s in the cupboard."
      }),
      kit.card(
        [
          `<p class="sp-label--plain">What’s it for?</p>`,
          kit.chips(planner.INTENTIONS.map((i) => kit.chip({ label: i.label, act: "pot-intention", value: i.key, pressed: pot.intention === i.key })), "What it’s for"),
          `<p class="sp-label--plain">Season</p>`,
          kit.chips(S.SEASONS.map((s) => kit.chip({ label: s.label, act: "pot-season", value: s.key, pressed: season === s.key })), "Season"),
          guess.assumed
            ? kit.muted("No place is saved, so the season assumes the northern hemisphere. Pick another above, or set your place.")
            : !pot.picked
            ? kit.muted(`It’s ${guess.season} where you are (${guess.hemisphere === "south" ? "southern" : "northern"} hemisphere).`)
            : "",
          kit.placeForm(place, pot.placeMessage)
        ].join("")
      ),
      kit.section(`For ${label.toLowerCase()} in ${season}`, pots.map(potCard).join(""), { id: "pots" }),
      kit.card(kit.bullets(S.SIMMER_SAFETY), { gold: true, label: "At the stove" })
    ].join("");
  }

  // ------------------------------------------------------------------ kitchen spell book

  const book = { intention: null, query: "" };
  const kitchenBook = premade.filterPremade(premade.PREMADE, { practice: "kitchen" });
  const recipeDetail = (p) =>
    kit.join([p.kind === "spell" ? "Spell" : "Ritual", `${p.minutes} min`, planner.intentionByKey(p.intention)?.label, kit.plural(p.ingredients.length, "thing", "things") + " to gather"]);

  function bookResults() {
    const shown = premade.filterPremade(kitchenBook, { intention: book.intention, query: book.query });
    return kit.section(
      kit.plural(shown.length, "recipe", "recipes"),
      shown.length ? kit.list(shown.map((p) => kit.row({ url: kit.href.premade(p.id), title: p.title, detail: recipeDetail(p) }))) : kit.card(kit.p("No recipe matches all of that yet. Try another intention.")),
      { id: "recipes" }
    );
  }

  function spellsView() {
    const offered = planner.INTENTIONS.filter((i) => kitchenBook.some((p) => p.intention === i.key || p.alsoFor?.includes(i.key)));
    return [
      backToKitchen,
      kit.head({
        eyebrow: "Kitchen & hearth",
        title: "Kitchen spell book",
        lede: "Recipes as workings: breads, broths, washes and blessings for the home, each with its ingredients, method and the words to say."
      }),
      kit.card(
        [
          kit.field({ id: "book-search", label: "Search the book", value: book.query, input: "book-search", placeholder: "Bread, salt, honey…", type: "search" }),
          `<p class="sp-label--plain">For</p>`,
          kit.chips(
            [kit.chip({ label: "Anything", act: "book-intention", value: "", pressed: !book.intention }), ...offered.map((i) => kit.chip({ label: i.label, act: "book-intention", value: i.key, pressed: book.intention === i.key }))],
            "For"
          )
        ].join("")
      ),
      `<div data-results>${bookResults()}</div>`,
      kit.list([kit.row({ url: kit.href.premadeList(null), title: "All premade workings", detail: "Rituals & spells for every practice" })])
    ].join("");
  }

  // ------------------------------------------------------------------ wiring

  const VIEWS = { kitchen: hubView, "kitchen-moon": moonView, "kitchen-pantry": pantryView, "kitchen-pantry-item": pantryItemView, "kitchen-simmer": simmerView, "kitchen-spells": spellsView };
  const draw = () => kit.render(root, (VIEWS[view] || hubView)());
  const redrawResults = (html) => {
    const box = root.querySelector("[data-results]");
    if (box) box.innerHTML = html;
  };

  kit.delegate(root, {
    ...kit.placeHandlers(root, (message) => {
      pot.placeMessage = message;
      pot.picked = null;
      draw();
    }),
    tick(el) {
      void tick(el.dataset.value);
    },
    "pantry-search"(el) {
      shelf.query = el.value;
      redrawResults(pantryResults());
    },
    group(el) {
      shelf.group = shelf.group === el.dataset.value ? null : el.dataset.value || null;
      draw();
    },
    element(el) {
      shelf.element = shelf.element === el.dataset.value ? null : el.dataset.value || null;
      draw();
    },
    intention(el) {
      shelf.intention = shelf.intention === el.dataset.value ? null : el.dataset.value || null;
      draw();
    },
    "pot-intention"(el) {
      pot.intention = el.dataset.value;
      draw();
    },
    "pot-season"(el) {
      pot.picked = el.dataset.value;
      draw();
    },
    begin(el) {
      const chosen = S.simmerPot(el.dataset.value);
      if (!chosen) return;
      const label = planner.intentionByKey(pot.intention)?.label ?? "Peace & rest";
      kit.runDraft(S.simmerDraft(chosen, pot.intention, label));
    },
    "book-search"(el) {
      book.query = el.value;
      redrawResults(bookResults());
    },
    "book-intention"(el) {
      book.intention = book.intention === el.dataset.value ? null : el.dataset.value || null;
      draw();
    }
  });

  kit.start(async (who) => {
    user = who;
    if (view === "kitchen-moon") {
      ticks.entries = await kit.entries(COLLECTION);
      ticks.ready = true;
    }
    draw();
  });
})(window);
