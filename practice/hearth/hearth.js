/*
 * Hearth & land (/practice/hearth/…): the land journal, foraging & garden,
 * and kitchen witchery, as the app's rituals/craft/hearth/ screens. One
 * script for every page; the page's data-view says which. The logic is the
 * app's own (js/core/hearth.js); places, notes, patches, harvests and recipes
 * are craft_entries (land.places, land.notes, land.growing, land.harvests,
 * kitchen.recipes) through SaltCraft, so they're the same in the app. A
 * place's rough location stays in this browser (localStorage "land.where"),
 * never sent anywhere. A recipe kept in the Grimoire is written as the app's
 * saveHolyPage writes it, tagged so it's found again.
 */
(function (global) {
  "use strict";
  const kit = global.PracticeKit;
  const H = global.SaltCore && global.SaltCore.hearth;
  const root = kit && kit.root();
  if (!kit || !root) return;
  if (!H) {
    root.innerHTML = '<p class="sp-notice">This page could not load. Check your connection and refresh the page.</p>';
    return;
  }
  const { land: L, forage: F, recipes: R, season: S, garden: G, moonGarden: MG, holidays: HD } = H;
  const esc = kit.esc;
  const view = root.dataset.view || "hearth";
  const params = new URLSearchParams(global.location.search);
  const param = (k) => params.get(k) || null;

  // ── Links ──────────────────────────────────────────────────────────────
  const url = (path, query) => {
    const q = new URLSearchParams(Object.entries(query || {}).filter(([, v]) => v));
    return `/practice/hearth/${path ? `${path}/` : ""}${q.toString() ? `?${q}` : ""}`;
  };
  const libraryUrl = (herb) => kit.href.library(`traditional:herb:${herb}`);
  const holyUrl = (ref) => `/today/holy/?ref=${encodeURIComponent(ref)}`;
  const timingUrl = (intent, title) => `/practice/cosmic/timing/?${new URLSearchParams(Object.entries({ intent, title }).filter(([, v]) => v))}`;
  const APOTHECARY_URL = "/rituals/journal/insights/#did-it-work-made";

  // ── State ──────────────────────────────────────────────────────────────
  const state = { user: null, settings: {}, place: null, places: [], notes: [], patches: [], harvests: [], recipes: [], plants: [], potted: [], draft: null, typed: {}, filter: {}, message: "", saving: false, kept: null };
  const ctx = () => {
    const choice = HD.holidayChoice(state.settings);
    return { choice, south: L.keepsSouthWheel(choice, state.place?.latitude), hemisphere: S.hemisphereOf(state.place?.latitude) };
  };
  const names = () => Object.fromEntries(state.places.map((p) => [p.id, p.data.name]));
  const short = (key) => kit.dayMonth(key);
  const plural = kit.plural;

  // The rough location of each place, only in this browser.
  const WHERE_KEY = "land.where";
  const readWhere = () => {
    try {
      const all = JSON.parse(global.localStorage.getItem(WHERE_KEY) || "{}");
      return all && typeof all === "object" && !Array.isArray(all) ? all : {};
    } catch {
      return {};
    }
  };
  const saveWhere = (id, text) => {
    const all = readWhere();
    const clean = L.cleanWhere(text || "");
    if (clean) all[id] = clean;
    else delete all[id];
    try {
      global.localStorage.setItem(WHERE_KEY, JSON.stringify(all));
    } catch {
      /* not kept */
    }
  };

  async function load() {
    const [places, notes, patches, harvests, recipes, plants] = await Promise.all(
      [L.LAND_PLACES, L.LAND_NOTES, F.LAND_GROWING, F.LAND_HARVESTS, R.RECIPES, "green.plants"].map((c) => kit.entries(c))
    );
    state.places = places.map((e) => ({ ...e, data: L.normalizePlace(e.data) }));
    state.notes = notes.map((e) => ({ ...e, data: L.normalizeNote(e.data) }));
    state.patches = patches.map((e) => ({ ...e, data: F.normalizePatch(e.data) }));
    state.harvests = harvests.map((e) => ({ ...e, data: F.normalizeHarvest(e.data) }));
    state.recipes = recipes;
    state.plants = plants.map((e) => ({ id: e.id, plant: G.asPlant(e.data) })).filter((p) => G.isGrowing(p.plant));
  }

  async function loadPotted() {
    const A = global.SaltCore && global.SaltCore["hearth-altar"];
    if (!A) return [];
    try {
      let altars;
      if (state.user && global.db) {
        const { data } = await global.db.from("saved_altars").select("id,name,altar_data,created_at,updated_at").eq("user_id", state.user.id);
        altars = (data || []).map(A.snapshot.altarFromRow);
      } else altars = A.snapshot.parseLocalAltars(global.localStorage.getItem(A.snapshot.LOCAL_ALTARS_KEY));
      return A.potted.pottedRefs(altars);
    } catch (error) {
      console.warn("Your altars' potted plants couldn't be read.", error);
      return [];
    }
  }

  // ── Shared pieces ──────────────────────────────────────────────────────
  const savedLine = (what) => kit.caption(kit.savedLine(state.user, what));
  const backTo = (path, label) => kit.back(url(path), label);

  function dayLine(on) {
    const { choice, south } = ctx();
    const day = L.readDay(on, choice, south);
    return `${kit.muted(kit.join([kit.fullDate(on), day.moon, day.wheel]))}${day.holy.length ? kit.muted(`In your calendars: ${day.holy.map((h) => h.name).join(", ")}`) : ""}`;
  }

  function forageFirst() {
    return kit.card(
      `${kit.big(F.FORAGE_FIRST, "h3")}${kit.muted("Take a little, ask permission, and learn the deadly look-alikes first. This site is never a field guide, and it gives no help with fungi.")}${kit.list([
        kit.row({ url: url("forage/safety"), title: "Safety, law and taking with care", detail: "Read the whole list" })
      ])}`,
      { gold: true, label: "Before you gather" }
    );
  }

  /** Library herbs chosen by typing: name the field; acts herb-add / herb-remove with data-field. */
  function herbPicker(name, label, keys) {
    const typed = state.typed[name] || "";
    const found = G.matchHerbs(typed, 6).filter((h) => !keys.includes(h.key));
    return `<div class="sp-section">${kit.field({ id: `herb-${name}`, label, value: typed, input: "herb-typed", placeholder: "Elder, hawthorn, oak, nettle…" })}${kit.chips(
      found.map((h) => kit.chip({ label: `+ ${h.name}`, act: "herb-add", value: h.key, data: { field: name }, a11y: `Add ${h.name}` })),
      "Matching herbs and trees"
    )}${kit.chips(
      keys.map((k) => kit.chip({ label: `${G.herbName(k) || k} ✕`, act: "herb-remove", value: k, data: { field: name }, pressed: true, a11y: `Remove ${G.herbName(k) || k}` })),
      "Chosen"
    )}</div>`;
  }

  const textField = (field, label, opts = {}) => kit.field({ id: `f-${field}`, label, value: state.draft?.[field] ?? "", input: "draft", ...opts });

  // ── Home ───────────────────────────────────────────────────────────────
  function homeView() {
    const now = new Date();
    const { choice, hemisphere } = ctx();
    const all = R.allRecipes(state.recipes);
    const feast = R.festivalFoodsAhead(now, choice, 21, all)[0];
    const gather = F.forageInMonth(now.getMonth() + 1, hemisphere).map((p) => p.name);
    const lastYear = L.thisTimeLastYear(state.notes, now)[0];
    const when = (d) => (d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`);
    return [
      kit.back(kit.href.hub, "Craft"),
      kit.head({ eyebrow: "Craft", title: "Hearth & land", lede: "The places you know and what they do through the year, what grows there to gather, and what the kitchen makes of it." }),
      feast || gather.length
        ? kit.card(
            `${feast ? kit.big(`${feast.name} ${when(feast.inDays)}: ${feast.recipes.map((r) => r.recipe.title).join(", ")}`, "h2") : ""}${gather.length ? kit.p(`In the hedgerow: ${gather.slice(0, 5).join(", ")}.`) : ""}${
              lastYear ? kit.muted(`This time ${lastYear.yearsAgo === 1 ? "last year" : `${lastYear.yearsAgo} years ago`} you noted ${plural(lastYear.notes.length, "thing", "things")}.`) : ""
            }`,
            { gold: true, label: "This season" }
          )
        : "",
      kit.section(
        "The land",
        kit.list([
          kit.row({ url: url("land"), title: "Land journal", detail: state.places.length ? `${plural(state.places.length, "place", "places")} · ${plural(state.notes.length, "note", "notes")}` : "Your places and what they do through the year" }),
          kit.row({ url: url("land/last-year"), title: "This time last year", detail: "What you noticed in these weeks of earlier years" }),
          kit.row({ url: url("land/note-edit"), title: "Note what you see today", detail: "Weather, frost, birdsong, blooms, water, an offering" })
        ])
      ),
      kit.section(
        "Foraging & garden",
        kit.list([
          kit.row({ url: url("forage"), title: "Foraging & garden", detail: "What grows where, and what to gather this month" }),
          kit.row({ url: url("forage/harvests"), title: "Harvests & store cupboard", detail: "What you’ve gathered and kept" }),
          kit.row({ url: kit.href.tool("green", "moon"), title: "Planting by the moon", detail: "On Green · folk tradition, offered as a rhythm, not a rule" }),
          kit.row({ url: kit.href.tool("green", "garden"), title: "My garden", detail: "On Green · your plants, sowings and harvests" })
        ])
      ),
      kit.section(
        "Kitchen witchery",
        kit.list([
          kit.row({ url: url("recipes"), title: "Recipes with intent", detail: "Festival foods, offerings and your own, kept in your Grimoire" }),
          kit.row({ url: url("recipes/edit"), title: "Write a recipe", detail: "Your own, with its intent and correspondences" }),
          kit.row({ url: kit.href.tool("kitchen", "pantry"), title: "Pantry correspondences", detail: "On Kitchen & hearth · salt, honey and the cupboard" }),
          kit.row({ url: timingUrl(null, "Kitchen witchery"), title: "Find a good time to cook", detail: "The spell timing advisor" })
        ])
      ),
      kit.section(
        "Elsewhere",
        kit.list([
          kit.row({ url: "/altar/", title: "Offerings on the altar", detail: "The cabinet’s Offerings drawer: bread, milk, honey and the rest" }),
          kit.row({ url: APOTHECARY_URL, title: "Apothecary", detail: "Jars, sachets and oils made from what you gather" }),
          kit.row({ url: "/rituals/cycle/", title: "Cycle & Moon", detail: "The moon tonight, and your own cycle beside it" }),
          kit.row({ url: kit.href.tool("folk", "lore"), title: "Local lore", detail: "On Traditional & folk · the stories and spirits of your places" })
        ])
      ),
      kit.landCard()
    ].join("");
  }

  // ── Land journal ───────────────────────────────────────────────────────
  const noteRow = (n, withPlace = true) =>
    kit.row({
      url: url("land/note", { id: n.id }),
      title: L.noteTitle(n.data),
      detail: kit.join([short(n.data.on), withPlace ? names()[n.data.placeId || ""] : null, L.moonOnDay(n.data.on), L.kindsOf(n.data).map(L.noteKindLabel).join(", ")])
    });
  const markLine = (m) =>
    kit.join([m.lastFrost ? `Last frost ${short(m.lastFrost)}` : "", m.firstFrost ? `First frost ${short(m.firstFrost)}` : "", ...Object.entries(m.firsts).map(([k, d]) => `First ${L.noteKindLabel(k).toLowerCase()} ${short(d)}`)]);

  function landView() {
    const f = state.filter;
    const shown = L.filterNotes(state.notes, f, names());
    const counts = L.placeCounts(state.notes);
    const markers = L.yearMarkers(state.notes);
    const seen = L.herbsSeen(state.notes).slice(0, 12);
    const kinds = L.NOTE_KINDS.filter((k) => state.notes.some((n) => L.kindsOf(n.data).includes(k.id)));
    return [
      backTo("", "Hearth & land"),
      kit.head({ eyebrow: "Hearth & land", title: "Land journal", lede: "The places you know, and what they do through the year. Each note is read against its day: the moon that evening, the Wheel of the Year and the holy days of the calendars you keep." }),
      kit.actions([kit.button({ label: "Note what you see", url: url("land/note-edit", { place: f.placeId, herb: f.herb }), primary: true }), kit.button({ label: "This time last year", url: url("land/last-year"), ghost: true })]),
      kit.section(
        "Your places",
        `${
          state.places.length
            ? kit.list(
                L.sortPlaces(state.places).map((p) =>
                  kit.row({ url: url("land/place", { id: p.id }), title: p.data.archived ? `${p.data.name} (resting)` : p.data.name, detail: kit.join([L.placeKindLabel(p.data.kind), counts[p.id] ? `${counts[p.id].count} notes, last ${short(counts[p.id].last)}` : "No notes yet"]) })
                )
              )
            : kit.card(kit.p("Add the places you know: your home, a garden, a wood you walk, a shore. Notes can be made without one too."))
        }${kit.actions([kit.button({ label: "Add a place", url: url("land/place-edit"), ghost: true })])}`
      ),
      state.notes.length
        ? kit.card(
            `${kit.field({ id: "note-search", label: "Search your notes", value: f.query || "", input: "note-search", placeholder: "Frost, swifts, blackthorn…" })}${kit.chips(
              [kit.chip({ label: "Any kind", act: "filter-kind", value: "", pressed: !f.kind }), ...kinds.map((k) => kit.chip({ label: k.label, act: "filter-kind", value: k.id, pressed: f.kind === k.id }))],
              "Kind"
            )}${
              state.places.length > 1
                ? kit.chips([kit.chip({ label: "Every place", act: "filter-place", value: "", pressed: !f.placeId }), ...state.places.map((p) => kit.chip({ label: p.data.name, act: "filter-place", value: p.id, pressed: f.placeId === p.id }))], "Place")
                : ""
            }${f.herb ? kit.chips([kit.chip({ label: `Seen: ${G.herbName(f.herb) || f.herb} ✕`, act: "filter-herb", value: "", pressed: true })]) : ""}`
          )
        : "",
      kit.section(
        state.notes.length ? plural(shown.length, "note", "notes") : "Notes",
        shown.length
          ? kit.list(shown.slice(0, 60).map((n) => noteRow(n)))
          : kit.card(kit.p(state.notes.length ? "No note matches all of that." : "Nothing noted yet. The first frost, the first swallow, the day the river came up: small things, kept year on year, become a calendar of your own place.")),
        { id: "notes" }
      ),
      markers.length ? kit.section("Frosts and firsts, year by year", kit.list(markers.map((m) => kit.row({ act: "filter-year", data: { year: m.year }, title: String(m.year), detail: markLine(m) })))) : "",
      seen.length
        ? kit.section("Herbs and trees you’ve seen", `${kit.chips(seen.map((h) => kit.chip({ label: `${h.name} · ${h.count}`, act: "filter-herb", value: h.key, pressed: f.herb === h.key })))}${kit.caption("Choose one to see your notes of it. Each opens in the Living Library from its note.")}`)
        : "",
      state.user ? "" : kit.caption("Kept in this browser. Sign in to keep your land journal with your account and the app.")
    ].join("");
  }

  function placeView() {
    const id = param("id");
    const place = state.places.find((p) => p.id === id);
    if (!place) return `${backTo("land", "Land journal")}${kit.head({ title: "A place" })}${kit.p("This place couldn’t be found. It may have been deleted on another device.")}`;
    const p = place.data;
    const where = readWhere()[id];
    const here = L.filterNotes(state.notes, { placeId: id });
    const marks = L.yearMarkers(state.notes, id)[0];
    const offerings = here.filter((n) => n.data.offering.trim());
    const patches = state.patches.filter((x) => x.data.placeId === id);
    const garden = p.kind === "garden" || p.kind === "home" ? state.plants.slice(0, 8) : [];
    return [
      backTo("land", "Land journal"),
      kit.head({ eyebrow: L.placeKindLabel(p.kind), title: p.name, lede: p.about }),
      where ? kit.muted(`Roughly: ${where} (kept only in this browser)`) : "",
      p.since ? kit.muted(`Known since ${kit.fullDate(p.since)}`) : "",
      kit.actions([kit.button({ label: "Note something here", url: url("land/note-edit", { place: id }), primary: true }), kit.button({ label: "Edit this place", url: url("land/place-edit", { id }), ghost: true })]),
      kit.card(
        `<h2 class="sp-label">The spirit of the place</h2>${kit.p(p.spirit || "Nothing written yet. What do you sense here? Is there a name, a feeling, a way you greet it?")}<h2 class="sp-label">What you give here</h2>${kit.p(
          p.offerings || "Nothing written yet. Water, bread, song, a little tidying, or simply attention."
        )}${offerings.length ? kit.muted(`Last offering ${short(offerings[0].data.on)}: ${offerings[0].data.offering}`) : ""}${kit.muted(
          "Leave offerings that won’t harm the place or the creatures who live there: no plastic, nothing that won’t rot, no bread for the ducks."
        )}${kit.list([
          kit.row({ url: "/altar/", title: "Set out an offering on your altar", detail: "The cabinet’s Offerings drawer, for the spirit of this place" }),
          kit.row({ url: kit.href.tool("folk", "lore"), title: "Its lore", detail: "Local lore: the stories, spirits and sayings of your places" })
        ])}`
      ),
      p.access ? kit.card(kit.p(p.access), { label: "Access and care" }) : "",
      kit.section(
        "What grows here",
        `${kit.list(
          patches.map((x) =>
            kit.row({ url: url("forage/patch-edit", { id: x.id }), title: x.data.name, detail: kit.join([F.PATCH_KINDS.find((k) => k.id === x.data.kind)?.label, x.data.spot, F.forageByKey(x.data.forage) ? "Foraging notes" : ""]) })
          )
        )}${kit.list(garden.map((g) => kit.row({ url: kit.href.tool("green", "plant", `id=${encodeURIComponent(g.id)}`), title: g.plant.name, detail: `My garden${g.plant.place ? ` · ${g.plant.place}` : ""}` })))}${kit.actions([
          kit.button({ label: "Add something that grows here", url: url("forage/patch-edit", { place: id }), ghost: true })
        ])}`
      ),
      marks ? kit.card(kit.p(markLine(marks)), { label: `Here in ${marks.year}` }) : "",
      kit.section(`${plural(here.length, "note", "notes")} here`, kit.list(here.slice(0, 40).map((n) => noteRow(n, false)))),
      kit.landCard()
    ].join("");
  }

  function placeEditView() {
    const id = param("id");
    const existing = id ? state.places.find((p) => p.id === id) : null;
    if (id && !existing) return `${backTo("land", "Land journal")}${kit.p("This place couldn’t be found.")}`;
    if (!state.draft) state.draft = { ...(existing ? existing.data : L.blankPlace()), where: existing ? readWhere()[id] || "" : "" };
    const d = state.draft;
    return [
      backTo("land", "Land journal"),
      kit.head({ eyebrow: existing ? "Edit" : "Land journal", title: existing ? d.name || "A place" : "Add a place" }),
      kit.section(
        "What kind of place?",
        `${kit.chips(L.PLACE_KINDS.map((k) => kit.chip({ label: k.label, act: "set", value: k.id, data: { field: "kind" }, pressed: d.kind === k.id })), "Kind")}${kit.muted(L.PLACE_KINDS.find((k) => k.id === d.kind)?.hint || "")}`
      ),
      textField("name", "Name", { placeholder: "The back garden, Hob’s Wood, the north shore" }),
      textField("about", "What it’s like", { multiline: true, placeholder: "How you come to it, what grows, the feel of it" }),
      textField("spirit", "The spirit of the place", { multiline: true, placeholder: "What you sense there, a name, how you greet it" }),
      textField("offerings", "What you give here", { multiline: true, placeholder: "Water, bread, a song, picking up litter" }),
      textField("access", "Access and care", { multiline: true, placeholder: "Whose land it is, permission, what’s fragile" }),
      textField("since", "Known since (YYYY-MM-DD, optional)", { placeholder: "2019-04-01" }),
      textField("where", "Rough location (optional, kept only in this browser)", { placeholder: "Near the old mill, or 51.5, -0.1", maxlength: 80 }),
      kit.caption("The rough location is never saved to your account or sent anywhere. A nearby landmark is plenty."),
      existing ? kit.toggle({ id: "f-archived", label: "Resting", detail: "You don’t go there now; it stays in your journal, last in the list.", checked: d.archived, change: "toggle-draft" }) : "",
      kit.notice("Some places are private land, sacred to others, or fragile. Note what you know of whose they are; the card “Whose land are you on?” on the place’s page is a start."),
      savedLine("your places"),
      kit.notice(state.message, { live: true }),
      kit.actions([kit.button({ label: state.saving ? "Saving…" : existing ? "Save changes" : "Add this place", act: "save-place", primary: true, disabled: state.saving }), existing ? kit.textButton({ label: "Delete this place", act: "delete-place", quiet: true }) : ""])
    ].join("");
  }

  function noteView() {
    const id = param("id");
    const entry = state.notes.find((n) => n.id === id);
    if (!entry) return `${backTo("land", "Land journal")}${kit.head({ title: "A note" })}${kit.p("This note couldn’t be found. It may have been deleted on another device.")}`;
    const n = entry.data;
    const { choice, south } = ctx();
    const day = L.readDay(n.on, choice, south);
    const day0 = kit.fromKey(n.on);
    const moon = H.moon.moonState(new Date(day0.getFullYear(), day0.getMonth(), day0.getDate(), 21));
    const placeName = names()[n.placeId || ""];
    return [
      backTo("land", "Land journal"),
      kit.head({ eyebrow: L.kindsOf(n).map(L.noteKindLabel).join(" · ") || "Land journal", title: L.noteTitle(n) }),
      dayLine(n.on),
      placeName ? kit.actions([`<a class="sp-chip" href="${esc(url("land/place", { id: n.placeId }))}">${esc(placeName)}</a>`]) : "",
      kit.card(
        `${kit.p(n.text)}${n.weather ? kit.muted(`Weather: ${n.weather}`) : ""}${n.frost ? kit.p(L.FROST_MARKS.find((f) => f.id === n.frost).label) : ""}${n.water ? kit.muted(`Water: ${L.WATER_LEVELS.find((w) => w.id === n.water).label}`) : ""}${
          n.offering ? kit.p(`Offered: ${n.offering}`) : ""
        }`
      ),
      n.herbs.length ? kit.section("Herbs and trees seen", kit.actions(n.herbs.map((h) => `<a class="sp-chip" href="${esc(libraryUrl(h))}">${esc(G.herbName(h) || h)}</a>`))) : "",
      n.plants.length || n.potted.length
        ? kit.section(
            "Your plants",
            kit.actions([
              ...n.plants.map((pid) => {
                const g = state.plants.find((x) => x.id === pid);
                return g ? `<a class="sp-chip" href="${esc(kit.href.tool("green", "plant", `id=${encodeURIComponent(pid)}`))}">${esc(g.plant.name)}</a>` : kit.chip({ label: "A garden plant" });
              }),
              ...n.potted.map((p) => `<a class="sp-chip" href="/altar/">${esc(p.name)}</a>`)
            ])
          )
        : "",
      kit.section(
        "The day",
        kit.list([
          kit.row({ url: holyUrl(H.holyRefs.moonRef(moon)), title: `${day.moon} that evening`, detail: "What this phase of the moon means" }),
          ...day.holy.map((h) => kit.row({ url: `/today/holy/?ref=${encodeURIComponent(H.holyRefs.holyRef(h.id))}&from=today`, title: h.name, detail: h.traditions.join(", ") })),
          kit.row({ url: kit.href.settings, title: day.wheel || "The Wheel of the Year", detail: `Your calendars · ${kit.fullDate(n.on)}` })
        ])
      ),
      kit.actions([kit.button({ label: "Edit this note", url: url("land/note-edit", { id }), ghost: true }), kit.button({ label: "Make a note today", url: url("land/note-edit", { place: n.placeId }), ghost: true })])
    ].join("");
  }

  function noteEditView() {
    const id = param("id");
    const existing = id ? state.notes.find((n) => n.id === id) : null;
    if (id && !existing) return `${backTo("land", "Land journal")}${kit.p("This note couldn’t be found.")}`;
    if (!state.draft) state.draft = existing ? { ...existing.data } : { ...L.blankNote(new Date(), param("place")), herbs: param("herb") ? [param("herb")] : [] };
    const d = state.draft;
    const place = state.places.find((p) => p.id === d.placeId);
    const showWater = d.kinds.includes("water") || ["water", "shore"].includes(place?.data.kind);
    return [
      backTo("land", "Land journal"),
      kit.head({ eyebrow: existing ? "Edit" : "Land journal", title: existing ? "Edit this note" : "What do you see?" }),
      kit.dayPicker({ name: "on", label: "The day", value: d.on, typed: state.typed.on || "" }),
      dayLine(d.on),
      kit.section(
        "Where",
        kit.chips(
          [kit.chip({ label: "Out and about", act: "set", value: "", data: { field: "placeId" }, pressed: !d.placeId }), ...state.places.filter((p) => !p.data.archived || p.id === d.placeId).map((p) => kit.chip({ label: p.data.name, act: "set", value: p.id, data: { field: "placeId" }, pressed: d.placeId === p.id }))],
          "Where"
        )
      ),
      kit.section("What kind of note?", kit.chips(L.NOTE_KINDS.map((k) => kit.chip({ label: k.label, act: "toggle-list", value: k.id, data: { field: "kinds" }, pressed: d.kinds.includes(k.id), a11y: k.hint ? `${k.label}: ${k.hint}` : k.label })), "Kinds")),
      textField("text", "What you noticed", { multiline: true, placeholder: "The first blackbird singing at dawn; sloes thick on the blackthorn" }),
      textField("weather", "The weather", { placeholder: "Still and cold, a hard white frost" }),
      d.kinds.includes("frost") || d.frost
        ? kit.section(
            "Mark a frost",
            `${kit.chips([kit.chip({ label: "Just a frost", act: "set", value: "", data: { field: "frost" }, pressed: !d.frost }), ...L.FROST_MARKS.map((f) => kit.chip({ label: f.label, act: "set", value: f.id, data: { field: "frost" }, pressed: d.frost === f.id }))])}${kit.muted(
              "Marked frosts make your own frost dates, year by year: the gardener’s safe-to-sow day, from your own ground."
            )}`
          )
        : "",
      showWater ? kit.section("The water", kit.chips(L.WATER_LEVELS.map((w) => kit.chip({ label: w.label, act: "set", value: d.water === w.id ? "" : w.id, data: { field: "water" }, pressed: d.water === w.id })))) : "",
      herbPicker("herbs", "Herbs and trees from the Living Library", d.herbs),
      state.plants.length ? kit.section("From My garden", kit.chips(state.plants.map((g) => kit.chip({ label: g.plant.name, act: "toggle-list", value: g.id, data: { field: "plants" }, pressed: d.plants.includes(g.id) })))) : "",
      state.potted.length || d.potted.length
        ? kit.section(
            "Potted plants on your altars",
            kit.chips(
              [...state.potted, ...d.potted.filter((p) => !state.potted.some((x) => x.id === p.id))].map((p) =>
                kit.chip({ label: p.name, act: "toggle-potted", value: p.id, data: { name: p.name }, pressed: d.potted.some((x) => x.id === p.id) })
              )
            )
          )
        : "",
      kit.section("An offering", `${textField("offering", "What you gave, and to whom", { placeholder: "Milk at the old thorn, for the good neighbours" })}${kit.muted("Give what won’t harm the place: no plastic, nothing that won’t rot.")}`),
      savedLine("your land journal"),
      kit.notice(state.message, { live: true }),
      kit.actions([kit.button({ label: state.saving ? "Saving…" : existing ? "Save changes" : "Keep this note", act: "save-note", primary: true, disabled: state.saving }), existing ? kit.textButton({ label: "Delete this note", act: "delete-note", quiet: true }) : ""])
    ].join("");
  }

  function lastYearView() {
    const years = L.thisTimeLastYear(state.notes, new Date());
    return [
      backTo("land", "Land journal"),
      kit.head({ eyebrow: "Land journal", title: "This time last year", lede: "What you noticed in the two weeks either side of today, in every year before this one." }),
      years.length
        ? years.map((y) => kit.section(`${y.year} · ${y.yearsAgo === 1 ? "a year ago" : `${y.yearsAgo} years ago`}`, kit.list(y.notes.map((n) => noteRow(n))))).join("")
        : kit.card(kit.p("Nothing yet from these weeks of an earlier year. Keep noting what the land does, and next year this page will show you.")),
      kit.actions([kit.button({ label: "Note what you see today", url: url("land/note-edit"), primary: true })])
    ].join("");
  }

  // ── Foraging & garden ──────────────────────────────────────────────────
  function forageView() {
    const now = new Date();
    const { hemisphere } = ctx();
    const month = Number(state.filter.month) || now.getMonth() + 1;
    const plants = F.forageInMonth(month, hemisphere);
    const groups = F.patchesByPlace(state.patches, state.places.map((p) => p.id));
    const ready = F.patchesInSeason(state.patches, now.getMonth() + 1, hemisphere);
    const cupboard = F.storeCupboard(state.harvests);
    const night = MG.gardenNight(MG.eveningOf(now));
    const n = names();
    return [
      backTo("", "Hearth & land"),
      kit.head({ eyebrow: "Hearth & land", title: "Foraging & garden", lede: `What the hedgerow and the garden give through the year, as it comes ${hemisphere === "south" ? "south" : "north"} of the equator. Weather, height and the year move everything by weeks.` }),
      S.isTropical(state.place?.latitude) ? kit.muted("Near the equator the year runs by wet and dry seasons rather than these; take the months loosely.") : "",
      kit.placeForm(state.place, state.message),
      forageFirst(),
      ready.length ? kit.card(kit.p(ready.map((p) => `${p.data.name}${p.data.placeId && n[p.data.placeId] ? ` (${n[p.data.placeId]})` : ""}`).join(", ")), { gold: true, label: "Ready on your places now" }) : "",
      kit.section(
        `To gather in ${S.MONTH_NAMES[month - 1]}`,
        `${kit.chips(S.MONTH_NAMES.map((m, i) => kit.chip({ label: m.slice(0, 3), act: "month", value: i + 1, pressed: month === i + 1, a11y: m })), "Month")}${
          plants.length
            ? kit.list(
                plants.map((p) => {
                  const worst = F.worstLookAlike(p);
                  return kit.row({
                    url: url("forage/plant", { key: p.key }),
                    title: p.name,
                    detail: kit.join([p.parts, F.forageSpan(p, hemisphere), F.USE_LABELS[p.use], worst && worst.danger !== "mild" ? `${F.DANGER_LABELS[worst.danger]} look-alike: ${worst.name}` : ""])
                  });
                })
              )
            : kit.card(kit.p("Little to gather this month. A good time to read about next season’s plants and their look-alikes."))
        }`,
        { id: "month" }
      ),
      kit.section(
        "What grows where",
        `${
          groups.length
            ? groups
                .map(
                  (g) =>
                    `${kit.caption(g.placeId ? n[g.placeId] : "No place given")}${kit.list(
                      g.patches.map((x) => {
                        const f = F.forageByKey(x.data.forage);
                        return kit.row({ url: url("forage/patch-edit", { id: x.id }), title: x.data.name, detail: kit.join([F.PATCH_KINDS.find((k) => k.id === x.data.kind)?.label, x.data.spot, f ? `Gather ${F.forageSpan(f, hemisphere)}` : ""]) });
                      })
                    )}`
                )
                .join("")
            : kit.card(kit.p(state.places.length ? "Note what grows on your places: the elder by the gate, the sloes along the lane, the mint by the back door." : "Add your places in the land journal first, then note what grows on each."))
        }${kit.actions([kit.button({ label: "Add something that grows", url: url("forage/patch-edit"), ghost: true }), state.places.length ? "" : kit.button({ label: "Add a place", url: url("land/place-edit"), ghost: true })])}`
      ),
      kit.section(
        "Harvests",
        kit.list([
          kit.row({ url: url("forage/harvests"), title: "Harvest log", detail: state.harvests.length ? `${state.harvests.length} gathered · ${cupboard.length} in the store cupboard` : "What you gather, with the moon it was gathered under" }),
          kit.row({ url: url("forage/harvest-edit"), title: "Log a harvest", detail: "From a hedgerow, the garden or a pot on the windowsill" })
        ])
      ),
      kit.card(
        `${kit.big(MG.QUARTERS[night.quarter].headline, "h3")}${kit.muted(F.MOON_PLANTING_NOTE)}${kit.list([
          kit.row({ url: kit.href.tool("green", "moon"), title: "Tonight in the garden", detail: `On Green · ${night.phase}, moon in ${night.sign}` }),
          kit.row({ url: kit.href.tool("green", "season"), title: "In season to sow and gather", detail: "On Green · garden herbs month by month" }),
          kit.row({ url: kit.href.tool("green", "garden"), title: "My garden", detail: "On Green · your plants and their history" })
        ])}`,
        { label: "Planting by the moon" }
      )
    ].join("");
  }

  function plantView() {
    const plant = F.forageByKey(param("key"));
    if (!plant) return `${backTo("forage", "Foraging & garden")}${kit.p("This plant isn’t in the foraging notes.")}`;
    const { hemisphere } = ctx();
    return [
      backTo("forage", "Foraging & garden"),
      kit.head({ eyebrow: plant.latin, title: plant.name, lede: `${plant.parts} · ${F.forageSpan(plant, hemisphere)} · ${F.USE_LABELS[plant.use]}` }),
      kit.muted(plant.when),
      forageFirst(),
      kit.card(`<h2 class="sp-label">Where it grows</h2>${kit.p(plant.where)}<h2 class="sp-label">How to know it</h2>${kit.p(plant.know)}${kit.muted("Never enough on its own: check it against a field guide for your region, every time.")}`),
      plant.lookAlikes.length
        ? kit.section(
            "Look-alikes",
            plant.lookAlikes
              .map((l) =>
                kit.card(`${kit.big(l.name, "h3")}${kit.p(l.tell)}${l.library ? kit.actions([kit.button({ label: `${G.herbName(l.library) || l.name} in the Living Library`, url: libraryUrl(l.library), ghost: true, small: true })]) : ""}`, { gold: l.danger === "deadly", label: F.DANGER_LABELS[l.danger] })
              )
              .join("")
          )
        : "",
      kit.card(`<h2 class="sp-label">Taking it with care</h2>${kit.p(plant.care)}<h2 class="sp-label">Safety</h2>${kit.p(plant.caution)}`),
      kit.list(
        [
          plant.library ? kit.row({ url: libraryUrl(plant.library), title: `${G.herbName(plant.library)} in the Living Library`, detail: "Its lore, correspondences and how it’s used" }) : "",
          ...(plant.recipes || []).map((id) => kit.row({ url: url("recipes/recipe", { id }), title: `Recipe: ${R.starterRecipe(id)?.title}`, detail: "Kitchen witchery" })),
          kit.row({ url: url("forage/patch-edit", { forage: plant.key }), title: "It grows on one of my places", detail: "Note the patch, to know when to go back" }),
          kit.row({ url: url("forage/harvest-edit", { forage: plant.key }), title: "Log a harvest of it", detail: "With the moon it was gathered under" }),
          kit.row({ url: url("land/note-edit", { herb: plant.library }), title: "Note it on the land", detail: "In bloom, in fruit, or first seen this year" })
        ].filter(Boolean)
      )
    ].join("");
  }

  function safetyView() {
    return [
      backTo("forage", "Foraging & garden"),
      kit.head({ eyebrow: "Foraging & garden", title: "Safety, law and care" }),
      kit.card(kit.big(F.FORAGE_FIRST, "h2"), { gold: true }),
      ...F.FORAGE_RULES.map((r) => kit.card(`${kit.big(r.title, "h2")}${kit.p(r.text)}`)),
      kit.card(`${kit.big("In the kitchen", "h2")}${kit.p(R.KITCHEN_SAFETY)}`),
      kit.list([kit.row({ url: "/library/sourcing/", title: "Sourcing with care", detail: "In the Living Library · plants and resins that need care to buy" }), kit.row({ url: kit.href.support, title: "Support", detail: "Crisis lines and help, if something is heavy" })])
    ].join("");
  }

  function patchEditView() {
    const id = param("id");
    const existing = id ? state.patches.find((p) => p.id === id) : null;
    if (id && !existing) return `${backTo("forage", "Foraging & garden")}${kit.p("This couldn’t be found.")}`;
    if (!state.draft) {
      const f = F.forageByKey(param("forage"));
      state.draft = existing ? { ...existing.data } : { ...F.blankPatch(param("place")), ...(f ? { name: f.name, forage: f.key, herb: f.library } : {}) };
    }
    const d = state.draft;
    const forage = F.forageByKey(d.forage);
    return [
      backTo("forage", "Foraging & garden"),
      kit.head({ eyebrow: "What grows where", title: existing ? d.name : "Something that grows" }),
      kit.section("A wild plant from the foraging notes", kit.chips(F.FORAGE_PLANTS.map((f) => kit.chip({ label: f.name, act: "pick-forage", value: f.key, pressed: d.forage === f.key })))),
      textField("name", "What it is", { placeholder: "Elder by the gate, mint by the back door" }),
      herbPicker("herb", "Its Living Library entry (optional)", d.herb ? [d.herb] : []),
      kit.section(
        "Where",
        `${kit.chips(state.places.map((p) => kit.chip({ label: p.data.name, act: "set", value: d.placeId === p.id ? "" : p.id, data: { field: "placeId" }, pressed: d.placeId === p.id })))}${
          state.places.length ? "" : kit.muted("Add your places in the land journal to file what grows by place.")
        }${textField("spot", "Exactly where", { placeholder: "North edge, by the stile" })}`
      ),
      kit.chips(F.PATCH_KINDS.map((k) => kit.chip({ label: k.label, act: "set", value: k.id, data: { field: "kind" }, pressed: d.kind === k.id }))),
      textField("note", "Notes", { multiline: true, placeholder: "Heavy with fruit most years; the owner is happy for us to pick" }),
      forage ? kit.list([kit.row({ url: url("forage/plant", { key: forage.key }), title: `Foraging notes: ${forage.name}`, detail: "When, look-alikes and care" })]) : "",
      kit.notice(state.message, { live: true }),
      kit.actions([
        kit.button({ label: state.saving ? "Saving…" : existing ? "Save changes" : "Keep it", act: "save-patch", primary: true, disabled: state.saving }),
        existing ? kit.button({ label: "Log a harvest from it", url: url("forage/harvest-edit", { patch: existing.id }), ghost: true }) : "",
        existing ? kit.textButton({ label: "Delete", act: "delete-patch", quiet: true }) : ""
      ])
    ].join("");
  }

  function harvestsView() {
    const now = new Date();
    const cupboard = F.storeCupboard(state.harvests);
    const all = F.sortHarvests(state.harvests);
    const n = names();
    return [
      backTo("forage", "Foraging & garden"),
      kit.head({ eyebrow: "Foraging & garden", title: "Harvests", lede: "What you’ve gathered, from the hedgerow, the garden or a pot, with the moon it came in under." }),
      kit.actions([kit.button({ label: "Log a harvest", url: url("forage/harvest-edit"), primary: true })]),
      kit.section(
        "The store cupboard",
        `${
          cupboard.length
            ? kit.list(
                cupboard.map((h) => {
                  const months = F.monthsKept(h.data, now) || 0;
                  return kit.row({
                    url: url("forage/harvest-edit", { id: h.id }),
                    title: h.data.name,
                    detail: kit.join([h.data.amount, `kept since ${kit.fullDate(h.data.storedOn || h.data.on)}`, months >= 12 ? "past its best year: use or return to the earth" : months >= 9 ? "use it soon" : ""])
                  });
                })
              )
            : kit.card(kit.p("Nothing kept yet. Mark a harvest “still in the store cupboard” when you dry or jar it."))
        }${kit.list([
          kit.row({ url: "/altar/", title: "Make something in the Apothecary", detail: "At the altar: a spell jar, sachet, oil or blend from what you’ve kept" }),
          kit.row({ url: APOTHECARY_URL, title: "Your Apothecary workings", detail: "Jars and sachets you’ve made, and whether they worked" })
        ])}`
      ),
      kit.section(
        plural(all.length, "harvest", "harvests"),
        all.length ? kit.list(all.map((h) => kit.row({ url: url("forage/harvest-edit", { id: h.id }), title: h.data.name, detail: kit.join([kit.fullDate(h.data.on), n[h.data.placeId || ""], F.harvestLine(h.data)]) }))) : kit.card(kit.p("Nothing logged yet."))
      )
    ].join("");
  }

  function harvestEditView() {
    const id = param("id");
    const existing = id ? state.harvests.find((h) => h.id === id) : null;
    if (id && !existing) return `${backTo("forage/harvests", "Harvests")}${kit.p("This harvest couldn’t be found.")}`;
    if (!state.draft) {
      if (existing) state.draft = { ...existing.data };
      else {
        const patchEntry = state.patches.find((p) => p.id === param("patch"));
        const patch = patchEntry ? patchEntry.data : null;
        const f = F.forageByKey(param("forage") || patch?.forage);
        const herb = param("herb") || patch?.herb || f?.library || null;
        state.draft = F.blankHarvest(new Date(), { name: patch?.name || f?.name || (herb ? G.herbName(herb) || "" : ""), herb, forage: f?.key || null, placeId: patch?.placeId || null, patchId: patchEntry?.id || null, part: f?.parts || "" });
      }
    }
    const d = state.draft;
    const forage = F.forageByKey(d.forage) || F.matchForage(d.name, d.herb);
    return [
      backTo("forage/harvests", "Harvests"),
      kit.head({ eyebrow: "Harvests", title: existing ? d.name : "Log a harvest" }),
      !existing && forage ? forageFirst() : "",
      kit.dayPicker({ name: "on", label: "Gathered on", value: d.on, typed: state.typed.on || "" }),
      dayLine(d.on),
      textField("name", "What you gathered", { placeholder: "Elderflowers, rose hips, rosemary from the pot" }),
      herbPicker("herb", "Its Living Library entry (optional)", d.herb ? [d.herb] : []),
      textField("part", "The part", { placeholder: "Flowers, berries, leaves" }),
      textField("amount", "How much", { placeholder: "A basket, 40 g, three bundles" }),
      kit.section(
        "Where from",
        kit.chips([kit.chip({ label: "Not one of my places", act: "set", value: "", data: { field: "placeId" }, pressed: !d.placeId }), ...state.places.map((p) => kit.chip({ label: p.data.name, act: "set", value: p.id, data: { field: "placeId" }, pressed: d.placeId === p.id }))])
      ),
      kit.section("For", kit.chips(F.HARVEST_USES.map((u) => kit.chip({ label: u.label, act: "harvest-use", value: u.id, pressed: d.use === u.id })))),
      kit.toggle({ id: "f-kept", label: "Still in the store cupboard", detail: "Dried, jarred or kept to use later", checked: d.kept, change: "toggle-draft" }),
      textField("note", "Notes", { multiline: true, placeholder: "Dried on the rack for a week; smelled of honey" }),
      forage ? kit.list([kit.row({ url: url("forage/plant", { key: forage.key }), title: `Foraging notes: ${forage.name}`, detail: "Look-alikes and safety" })]) : "",
      savedLine("your harvests"),
      kit.notice(state.message, { live: true }),
      kit.actions([kit.button({ label: state.saving ? "Saving…" : existing ? "Save changes" : "Keep this harvest", act: "save-harvest", primary: true, disabled: state.saving }), existing ? kit.textButton({ label: "Delete", act: "delete-harvest", quiet: true }) : ""])
    ].join("");
  }

  // ── Kitchen witchery ───────────────────────────────────────────────────
  const findRecipe = (id) => {
    const starter = R.starterRecipe(id);
    if (starter) return { id, recipe: starter, starter: true };
    const own = state.recipes.find((e) => e.id === id);
    return own ? { id, recipe: R.normalizeRecipe(own.data), starter: false } : null;
  };

  function recipesView() {
    const all = R.allRecipes(state.recipes);
    const f = state.filter;
    if (f.festival === undefined) f.festival = param("festival");
    if (f.herb === undefined) f.herb = param("herb");
    const shown = R.filterRecipes(all, f);
    const feasts = R.festivalFoodsAhead(new Date(), ctx().choice, 45, all);
    const offered = R.INTENT_CHOICES.filter((i) => all.some((r) => r.recipe.intent === i.key));
    return [
      backTo("", "Hearth & land"),
      kit.head({ eyebrow: "Hearth & land", title: "Kitchen witchery", lede: "Recipes cooked with an intent: festival foods, offerings, and your own. Each says honestly whether it’s traditional or modern, and links its ingredients to their correspondences." }),
      feasts.length
        ? kit.section(
            "For the festivals ahead",
            kit.list(feasts.map((x) => kit.row({ act: "filter-festival", data: { value: x.ref }, title: `${x.name} ${x.inDays === 0 ? "today" : x.inDays === 1 ? "tomorrow" : `in ${x.inDays} days`}`, detail: x.recipes.map((r) => r.recipe.title).join(" · ") })))
          )
        : "",
      kit.card(
        `${kit.field({ id: "recipe-search", label: "Search recipes", value: f.query || "", input: "recipe-search", placeholder: "Bread, honey, Samhain…" })}${kit.chips(
          [kit.chip({ label: "Any intent", act: "filter-intent", value: "", pressed: !f.intent }), ...offered.map((i) => kit.chip({ label: i.label, act: "filter-intent", value: i.key, pressed: f.intent === i.key }))],
          "Intent"
        )}${kit.chips(
          [f.festival ? kit.chip({ label: `${R.festivalName(f.festival)} ✕`, act: "filter-festival", value: "", pressed: true }) : "", f.herb ? kit.chip({ label: `With ${G.herbName(f.herb) || f.herb} ✕`, act: "filter-recipe-herb", value: "", pressed: true }) : ""].filter(Boolean)
        )}`
      ),
      kit.section(
        plural(shown.length, "recipe", "recipes"),
        shown.length
          ? kit.list(shown.map((r) => kit.row({ url: url("recipes/recipe", { id: r.id }), title: r.recipe.title, detail: kit.join([R.ORIGIN_LABELS[r.recipe.origin], R.intentLabel(r.recipe.intent), r.recipe.festivals.slice(0, 2).map(R.festivalName).join(", "), r.recipe.time]) })))
          : kit.card(kit.p("No recipe matches all of that yet.")),
        { id: "recipes" }
      ),
      kit.actions([kit.button({ label: "Write your own recipe", url: url("recipes/edit"), primary: true })]),
      kit.list([
        kit.row({ url: kit.href.tool("kitchen", "spells"), title: "Kitchen spell book", detail: "On Kitchen & hearth · the premade kitchen workings" }),
        kit.row({ url: kit.href.tool("kitchen", "pantry"), title: "Pantry correspondences", detail: "Salt, honey, cinnamon and the rest" }),
        kit.row({ url: kit.href.tool("kitchen", "simmer"), title: "Simmer pot", detail: "A pot for your home from what you have" })
      ])
    ].join("");
  }

  function recipeView() {
    const id = param("id");
    const found = findRecipe(id);
    if (!found) return `${backTo("recipes", "Kitchen witchery")}${kit.head({ title: "A recipe" })}${kit.p("This recipe couldn’t be found. It may have been deleted on another device.")}`;
    const r = found.recipe;
    const intent = R.intentLabel(r.intent);
    const elements = R.recipeElements(r);
    const ingredient = (ing) => {
      const link = R.ingredientLink(ing);
      if (!link) return `<li>${esc(ing.text)}</li>`;
      const href = link.kind === "herb" ? libraryUrl(link.key) : kit.href.tool("kitchen", "pantry/item", `key=${encodeURIComponent(link.key)}`);
      return `<li><a class="pr-link" href="${esc(href)}">${esc(ing.text)}</a><span class="sp-caption"> · ${esc(kit.join([link.name, link.element, link.planet, link.uses]))}</span></li>`;
    };
    const warnings = r.ingredients.map(R.ingredientLink).filter((l) => l && l.warning);
    return [
      backTo("recipes", "Kitchen witchery"),
      kit.head({ eyebrow: R.ORIGIN_LABELS[r.origin], title: r.title, lede: kit.join([intent ? `For ${intent.toLowerCase()}` : "", r.serves, r.time]) }),
      elements.length ? kit.muted(`Leans to ${elements.map((e) => e.element.toLowerCase()).join(", ")}`) : "",
      r.festivals.length ? kit.section("For the festivals", kit.actions(r.festivals.map((ref) => `<a class="sp-chip" href="${esc(holyUrl(ref))}">${esc(R.festivalName(ref))}</a>`))) : "",
      r.seasonal.length || r.offering
        ? kit.section(
            "On the altar with it",
            `${kit.actions([...r.seasonal.map((s) => `<a class="sp-chip" href="/altar/">${esc(R.SEASONAL_NAMES[s])}</a>`), r.offering ? `<a class="sp-chip" href="/altar/">Offer it: ${esc(R.OFFERING_NAMES[r.offering])}</a>` : ""])}${kit.caption("In the altar’s cabinet: the Seasonal drawer and the Offerings drawer.")}`
          )
        : "",
      kit.section("Ingredients", `<ul class="pr-bullets">${r.ingredients.map(ingredient).join("")}</ul>`),
      kit.card(`<ol>${r.method.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`, { label: "Method" }),
      r.words ? kit.card(`<p><em>${esc(r.words)}</em></p>`, { gold: true, label: "Words to say" }) : "",
      kit.card(
        `${r.allergens.length ? r.allergens.map((a) => { const x = R.ALLERGENS.find((y) => y.id === a); return kit.p(`${x.label}: ${x.note}`); }).join("") : kit.p("No common allergens listed. Check every ingredient you use.")}${r.safety ? kit.p(r.safety) : ""}${warnings
          .map((l) => kit.muted(`${l.name}: ${l.warning}`))
          .join("")}${kit.muted(R.KITCHEN_SAFETY)}`,
        { label: "Allergies and safety" }
      ),
      r.about ? kit.card(kit.p(r.about), { label: "Where it comes from" }) : "",
      r.notes ? kit.card(kit.p(r.notes), { label: "Notes" }) : "",
      kit.notice(state.message, { live: true }),
      kit.actions([
        state.user ? kit.button({ label: state.kept ? "Open my Grimoire" : "Keep it in my Grimoire", act: state.kept ? undefined : "keep-recipe", url: state.kept ? "/grimoire/" : undefined, primary: true, disabled: state.saving }) : kit.caption("Sign in to keep recipes in your Grimoire, under Kitchen witchery."),
        kit.button({ label: "Find a good time to cook it", url: timingUrl(r.intent, r.title), ghost: true }),
        found.starter ? kit.button({ label: "Make my own version", url: url("recipes/edit", { from: id }), ghost: true }) : kit.button({ label: "Edit this recipe", url: url("recipes/edit", { id }), ghost: true })
      ])
    ].join("");
  }

  function recipeEditView() {
    const id = param("id");
    const existing = id ? state.recipes.find((e) => e.id === id) : null;
    if (id && !existing) return `${backTo("recipes", "Kitchen witchery")}${kit.p("This recipe couldn’t be found.")}`;
    if (!state.draft) {
      const from = R.starterRecipe(param("from"));
      const r = existing ? R.normalizeRecipe(existing.data) : from ? { ...R.normalizeRecipe(from), title: `${from.title} (my version)`, origin: "mine" } : R.blankRecipe();
      state.draft = { ...r, ingredientsText: r.ingredients.map((x) => x.text).join("\n"), methodText: r.method.join("\n") };
    }
    const d = state.draft;
    const toggleChips = (field, entries) => kit.chips(entries.map(([value, label]) => kit.chip({ label, act: "toggle-list", value, data: { field }, pressed: d[field].includes(value) })));
    return [
      backTo("recipes", "Kitchen witchery"),
      kit.head({ eyebrow: "Kitchen witchery", title: existing ? "Edit your recipe" : "Write a recipe" }),
      textField("title", "Title", { placeholder: "Grandmother’s seed cake" }),
      kit.section("What it’s for", kit.chips([kit.chip({ label: "Just good food", act: "set", value: "", data: { field: "intent" }, pressed: !d.intent }), ...R.INTENT_CHOICES.map((i) => kit.chip({ label: i.label, act: "set", value: i.key, data: { field: "intent" }, pressed: d.intent === i.key }))])),
      textField("serves", "Serves", { placeholder: "4" }),
      textField("time", "Time", { placeholder: "1 hour" }),
      textField("ingredientsText", "Ingredients, one to a line", { multiline: true, placeholder: "250 g flour\n3 sprigs of rosemary\nA pinch of sea salt" }),
      kit.caption("Herbs and pantry things are linked to the Living Library and their correspondences by name."),
      textField("methodText", "Method, one step to a line", { multiline: true, placeholder: "Rub the butter into the flour.\nStir clockwise, thinking of…" }),
      textField("words", "Words to say (optional)", { multiline: true }),
      kit.section("For the festivals", toggleChips("festivals", Object.entries(R.FESTIVAL_NAMES))),
      kit.section("On the altar with it", toggleChips("seasonal", Object.entries(R.SEASONAL_NAMES))),
      kit.section("As an offering", kit.chips([kit.chip({ label: "Not an offering", act: "set", value: "", data: { field: "offering" }, pressed: !d.offering }), ...Object.entries(R.OFFERING_NAMES).map(([v, l]) => kit.chip({ label: l, act: "set", value: v, data: { field: "offering" }, pressed: d.offering === v }))])),
      kit.section("Allergens", toggleChips("allergens", R.ALLERGENS.map((a) => [a.id, a.label]))),
      textField("safety", "Safety notes", { multiline: true, placeholder: "Anything to take care with" }),
      textField("about", "Where it comes from", { multiline: true, placeholder: "Your family, a book, your own making" }),
      textField("notes", "Your notes", { multiline: true }),
      savedLine("your recipes"),
      kit.notice(state.message, { live: true }),
      kit.actions([kit.button({ label: state.saving ? "Saving…" : existing ? "Save changes" : "Keep this recipe", act: "save-recipe", primary: true, disabled: state.saving }), existing ? kit.textButton({ label: "Delete this recipe", act: "delete-recipe", quiet: true }) : ""])
    ].join("");
  }

  // ── Drawing ────────────────────────────────────────────────────────────
  const VIEWS = {
    hearth: [homeView, "Hearth & land"],
    "hearth-land": [landView, "Land journal"],
    "hearth-land-place": [placeView, "A place"],
    "hearth-land-place-edit": [placeEditView, "A place"],
    "hearth-land-note": [noteView, "A note"],
    "hearth-land-note-edit": [noteEditView, "Note what you see"],
    "hearth-land-last-year": [lastYearView, "This time last year"],
    "hearth-forage": [forageView, "Foraging & garden"],
    "hearth-forage-plant": [plantView, "A wild plant"],
    "hearth-forage-safety": [safetyView, "Safety, law and care"],
    "hearth-forage-patch-edit": [patchEditView, "What grows where"],
    "hearth-forage-harvests": [harvestsView, "Harvests"],
    "hearth-forage-harvest-edit": [harvestEditView, "A harvest"],
    "hearth-recipes": [recipesView, "Kitchen witchery"],
    "hearth-recipes-recipe": [recipeView, "A recipe"],
    "hearth-recipes-edit": [recipeEditView, "Write a recipe"]
  };
  function draw() {
    const [fn, title] = VIEWS[view] || VIEWS.hearth;
    kit.render(root, fn());
    const named = view === "hearth-forage-plant" ? F.forageByKey(param("key"))?.name : view === "hearth-recipes-recipe" ? findRecipe(param("id"))?.recipe.title : view === "hearth-land-place" ? names()[param("id")] : null;
    global.document.title = `${named || title} | Salt & Sovereignty`;
  }
  const redraw = (message = "") => {
    state.message = message;
    draw();
  };

  // ── Saving ─────────────────────────────────────────────────────────────
  async function attempt(work) {
    if (state.saving) return;
    state.saving = true;
    draw();
    try {
      await work();
    } catch (error) {
      console.error(error);
      state.message = error?.message || "That couldn’t be saved. Please try again.";
    } finally {
      state.saving = false;
      draw();
    }
  }
  const back = (fallback) => (global.history.length > 1 ? global.history.back() : kit.go(fallback));

  /** Keep a recipe as a Grimoire page, the rows the app's saveHolyPage writes (once; found again by its tag). */
  async function keepRecipe(id, recipe) {
    const db = global.db;
    if (!db || !state.user) throw new Error("Sign in to keep it in your Grimoire.");
    const [books, sections, pages] = await Promise.all([
      db.from("grimoire_books").select("id,title,created_at,updated_at").eq("user_id", state.user.id).order("created_at"),
      db.from("grimoire_sections").select("id,book_id,title,sort_order,created_at").eq("user_id", state.user.id),
      db.from("grimoire_pages").select("id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at").eq("user_id", state.user.id)
    ]);
    if (books.error || sections.error || pages.error) throw new Error("Your Grimoire couldn’t be opened just now.");
    const existing = R.findRecipePage(pages.data || [], id);
    if (existing) return existing;
    const snapshot = { fetchedAt: new Date().toISOString(), books: books.data || [], sections: sections.data || [], pages: pages.data || [], blocks: [], links: [] };
    const { id: pageId, ops } = H.holyOps.holyPageOps(snapshot, { userId: state.user.id, now: new Date().toISOString() }, { ref: R.recipeRef(id), title: recipe.title, sectionTitle: R.RECIPE_SECTION, blocks: R.recipeBlocks(recipe) }, H.newId);
    for (const op of ops) {
      if (op.kind !== "insert") continue;
      const { error } = await db.from(op.table).insert(op.row);
      if (error && error.code !== "23505") throw new Error("It couldn’t be kept in your Grimoire just now.");
    }
    return { id: pageId };
  }

  const draftValue = (el) => el.id.replace(/^f-/, "");

  kit.delegate(root, {
    ...kit.placeHandlers(root, (message) => {
      state.place = kit.readPlace();
      redraw(message);
    }),
    draft(el) {
      if (state.draft) state.draft[draftValue(el)] = el.value;
    },
    "toggle-draft"(el) {
      if (state.draft) state.draft[draftValue(el)] = el.checked;
    },
    set(el) {
      const field = el.dataset.field;
      state.draft[field] = el.dataset.value || null;
      if (field === "frost" && el.dataset.value && !state.draft.kinds.includes("frost")) state.draft.kinds = [...state.draft.kinds, "frost"];
      draw();
    },
    "toggle-list"(el) {
      const field = el.dataset.field;
      const v = el.dataset.value;
      const list = state.draft[field] || [];
      state.draft[field] = list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
      draw();
    },
    "toggle-potted"(el) {
      const v = el.dataset.value;
      const list = state.draft.potted;
      state.draft.potted = list.some((p) => p.id === v) ? list.filter((p) => p.id !== v) : [...list, { id: v, name: el.dataset.name }];
      draw();
    },
    "on-day"(el) {
      if (el.dataset.value) state.draft.on = el.dataset.value;
      state.typed.on = "";
      draw();
    },
    "on-typed"(el) {
      state.typed.on = el.value;
      const key = kit.typedDay(el.value);
      if (key) state.draft.on = key;
      draw();
    },
    "herb-typed"(el) {
      state.typed[el.id.replace(/^herb-/, "")] = el.value;
      draw();
    },
    "herb-add"(el) {
      const field = el.dataset.field;
      if (field === "herbs") state.draft.herbs = [...state.draft.herbs, el.dataset.value];
      else state.draft.herb = el.dataset.value;
      state.typed[field] = "";
      draw();
    },
    "herb-remove"(el) {
      const field = el.dataset.field;
      if (field === "herbs") state.draft.herbs = state.draft.herbs.filter((k) => k !== el.dataset.value);
      else state.draft.herb = null;
      draw();
    },
    "pick-forage"(el) {
      const d = state.draft;
      const f = F.forageByKey(el.dataset.value);
      if (d.forage === f.key) d.forage = null;
      else Object.assign(d, { forage: f.key, name: d.name || f.name, herb: f.library || d.herb });
      draw();
    },
    "harvest-use"(el) {
      const use = el.dataset.value;
      state.draft.use = use;
      if (use === "drying" || use === "apothecary") state.draft.kept = true;
      draw();
    },
    month(el) {
      state.filter.month = el.dataset.value;
      draw();
    },
    "filter-kind"(el) {
      state.filter.kind = el.dataset.value || null;
      draw();
    },
    "filter-place"(el) {
      state.filter.placeId = el.dataset.value || null;
      draw();
    },
    "filter-herb"(el) {
      state.filter.herb = state.filter.herb === el.dataset.value ? null : el.dataset.value || null;
      draw();
    },
    "filter-year"(el) {
      state.filter.query = el.dataset.year;
      draw();
    },
    "note-search"(el) {
      state.filter.query = el.value;
      draw();
    },
    "recipe-search"(el) {
      state.filter.query = el.value;
      draw();
    },
    "filter-intent"(el) {
      state.filter.intent = el.dataset.value || null;
      draw();
    },
    "filter-festival"(el) {
      state.filter.festival = el.dataset.value || null;
      draw();
    },
    "filter-recipe-herb"() {
      state.filter.herb = null;
      draw();
    },
    "save-place"() {
      const d = state.draft;
      const data = { ...L.normalizePlace({ ...d, name: d.name.trim() }), since: kit.fromKey((d.since || "").trim()) ? d.since.trim() : "" };
      if (!d.name.trim()) return redraw("Give the place a name you’ll know it by: “the back garden”, “Hob’s Wood”.");
      attempt(async () => {
        const id = param("id");
        if (id) await kit.update(L.LAND_PLACES, id, data);
        const saved = id ? { id } : await kit.add(L.LAND_PLACES, data);
        saveWhere(saved.id, d.where);
        kit.go(url("land/place", { id: saved.id }));
      });
    },
    "delete-place"() {
      if (!kit.confirm("Delete this place? Its notes stay in your journal, without a place.")) return;
      attempt(async () => {
        await kit.remove(L.LAND_PLACES, param("id"));
        saveWhere(param("id"), "");
        kit.go(url("land"));
      });
    },
    "save-note"() {
      const d = state.draft;
      const data = L.normalizeNote({ ...d, text: d.text.trim(), weather: d.weather.trim(), offering: d.offering.trim() });
      if (!L.noteHasContent(data)) return redraw("Write what you noticed, or choose what kind of note it is.");
      attempt(async () => {
        const id = param("id");
        if (id) await kit.update(L.LAND_NOTES, id, data);
        const saved = id ? { id } : await kit.add(L.LAND_NOTES, data);
        kit.go(url("land/note", { id: saved.id }));
      });
    },
    "delete-note"() {
      if (!kit.confirm("Delete this note? It will be removed on every device.")) return;
      attempt(async () => {
        await kit.remove(L.LAND_NOTES, param("id"));
        kit.go(url("land"));
      });
    },
    "save-patch"() {
      const d = state.draft;
      const name = (d.name || "").trim() || (d.herb ? G.herbName(d.herb) || "" : "");
      if (!name) return redraw("What grows there? Choose a wild plant, or type its name.");
      const data = F.normalizePatch({ ...d, name, forage: d.forage || F.matchForage(name, d.herb)?.key || null });
      attempt(async () => {
        if (param("id")) await kit.update(F.LAND_GROWING, param("id"), data);
        else await kit.add(F.LAND_GROWING, data);
        back(url("forage"));
      });
    },
    "delete-patch"() {
      if (!kit.confirm("Delete this? It will be removed on every device.")) return;
      attempt(async () => {
        await kit.remove(F.LAND_GROWING, param("id"));
        kit.go(url("forage"));
      });
    },
    "save-harvest"() {
      const d = state.draft;
      if (!(d.name || "").trim()) return redraw("What did you gather?");
      const forage = F.forageByKey(d.forage) || F.matchForage(d.name, d.herb);
      const data = F.normalizeHarvest({ ...d, name: d.name.trim(), forage: d.forage || forage?.key || null, storedOn: d.kept && !d.storedOn ? kit.dateKey(new Date()) : d.storedOn });
      attempt(async () => {
        if (param("id")) await kit.update(F.LAND_HARVESTS, param("id"), data);
        else await kit.add(F.LAND_HARVESTS, data);
        kit.go(url("forage/harvests"));
      });
    },
    "delete-harvest"() {
      if (!kit.confirm("Delete this harvest? It will be removed on every device.")) return;
      attempt(async () => {
        await kit.remove(F.LAND_HARVESTS, param("id"));
        kit.go(url("forage/harvests"));
      });
    },
    "save-recipe"() {
      const d = state.draft;
      if (!(d.title || "").trim()) return redraw("Give your recipe a title.");
      const { ingredientsText, methodText, ...rest } = d;
      const ingredients = R.linesOf(ingredientsText).map((text) => d.ingredients.find((x) => x.text === text) || R.linkIngredient(text));
      const data = R.normalizeRecipe({ ...rest, title: d.title.trim(), ingredients, method: R.linesOf(methodText) });
      attempt(async () => {
        const id = param("id");
        if (id) await kit.update(R.RECIPES, id, data);
        const saved = id ? { id } : await kit.add(R.RECIPES, data);
        kit.go(url("recipes/recipe", { id: saved.id }));
      });
    },
    "delete-recipe"() {
      if (!kit.confirm("Delete this recipe? A copy kept in your Grimoire stays there.")) return;
      attempt(async () => {
        await kit.remove(R.RECIPES, param("id"));
        kit.go(url("recipes"));
      });
    },
    "keep-recipe"() {
      const found = findRecipe(param("id"));
      if (!found) return;
      attempt(async () => {
        state.kept = await keepRecipe(found.id, found.recipe);
        state.message = "Kept in your Grimoire, under Kitchen witchery.";
      });
    }
  });

  kit.start(async (user) => {
    state.user = user;
    state.settings = await kit.settings();
    state.place = kit.readPlace();
    await load();
    if (view === "hearth-land-note-edit") state.potted = await loadPotted();
    if (view === "hearth-land" && state.filter.herb === undefined) {
      state.filter.herb = param("herb");
      state.filter.placeId = param("place");
    }
    draw();
  });

  global.HearthPages = { url };
})(window);
