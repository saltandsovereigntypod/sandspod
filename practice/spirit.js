/*
 * Spirit practice on the website, as the app has it: the family tree
 * (Hedge → Ancestors), spirits of place (the land journal), familiars
 * (Hearth & land), spirit sessions (Divination), practice challenges (beside
 * A Year and a Day), numerology (Cosmic) and the printable Book of Shadows
 * (Grimoire). One script for every page; the page's data-view says which.
 * The logic is the app's own (js/core/spirit.js, window.SaltCore.spirit);
 * everything kept is a craft entry through SaltCraft, in the same
 * collections the app uses (land.spirits, hearth.familiars,
 * hedge.spiritSessions, yearday.challenges), so it is the same on both.
 * Numerology keeps nothing. The book is read from your Grimoire and printed
 * by the browser (print, or save as PDF).
 */
(function (global) {
  "use strict";
  const kit = global.PracticeKit;
  const S = global.SaltCore && global.SaltCore.spirit;
  const root = kit && kit.root();
  if (!kit || !root) return;
  if (!S) {
    root.innerHTML = '<p class="sp-notice">This page could not load. Check your connection and refresh the page.</p>';
    return;
  }
  const { ancestors: A, familyTree: T, land: L, spirits: SP, familiars: F, sessions: SS, challenges: C, numerology: N, printBook: PB, lifecycle: LC, calendar: CAL } = S;
  const esc = kit.esc;
  const view = root.dataset.view;
  const params = new URLSearchParams(global.location.search);
  const id = params.get("id");
  const today = () => LC.localDateKey(new Date());
  const full = (key) => CAL.fullDate(key) || key;
  const qs = (o) => {
    const q = new URLSearchParams(Object.entries(o || {}).filter(([, v]) => v));
    return q.toString() ? `?${q}` : "";
  };
  const href = {
    ancestors: "/practice/hedge/ancestors/",
    person: (x) => `/practice/hedge/ancestors/person/?id=${encodeURIComponent(x)}`,
    personEdit: "/practice/hedge/ancestors/edit/",
    tree: "/practice/hedge/ancestors/tree/",
    land: "/practice/hearth/land/",
    place: (x) => `/practice/hearth/land/place/?id=${encodeURIComponent(x)}`,
    note: (x) => `/practice/hearth/land/note/?id=${encodeURIComponent(x)}`,
    noteEdit: (place) => `/practice/hearth/land/note-edit/${qs({ place })}`,
    spirits: (place) => `/practice/hearth/land/spirits/${qs({ place })}`,
    spirit: (x) => `/practice/hearth/land/spirit/?id=${encodeURIComponent(x)}`,
    spiritEdit: (o) => `/practice/hearth/land/spirit-edit/${qs(o)}`,
    familiars: "/practice/hearth/familiars/",
    familiar: (x) => `/practice/hearth/familiars/familiar/?id=${encodeURIComponent(x)}`,
    familiarEdit: (x) => `/practice/hearth/familiars/edit/${qs({ id: x })}`,
    sessions: "/divination/sessions/",
    session: (x) => `/divination/sessions/session/?id=${encodeURIComponent(x)}`,
    sessionEdit: (o) => `/divination/sessions/edit/${qs(o)}`,
    challenges: "/rituals/year/challenges/",
    challenge: (x) => `/rituals/year/challenges/challenge/?id=${encodeURIComponent(x)}`,
    hours: (planet) => `/practice/cosmic/hours/${qs({ planet })}`
  };
  const state = { user: null, loaded: false, form: null, saving: false, problem: "", extra: {} };
  const data = { people: [], places: [], notes: [], spirits: [], familiars: [], sessions: [], challenges: [] };

  async function load() {
    const want = {
      "hedge-ancestors-tree": ["people"],
      "hearth-land-spirits": ["places", "spirits"],
      "hearth-land-spirit": ["places", "notes", "spirits"],
      "hearth-land-spirit-edit": ["places", "spirits"],
      "hearth-familiars": ["familiars"],
      "hearth-familiars-familiar": ["familiars"],
      "hearth-familiars-edit": ["familiars"],
      "spirit-sessions": ["sessions"],
      "spirit-session": ["sessions"],
      "spirit-session-edit": ["sessions", "people"],
      challenges: ["challenges"]
    }[view] || [];
    const sources = {
      people: [A.ANCESTORS, (e) => ({ ...e, data: A.normalizeAncestor(e.data) })],
      places: [L.LAND_PLACES, (e) => ({ ...e, data: L.normalizePlace(e.data) })],
      notes: [L.LAND_NOTES, (e) => ({ ...e, data: L.normalizeNote(e.data) })],
      spirits: [SP.LAND_SPIRITS, (e) => ({ ...e, data: SP.normalizeSpirit(e.data) })],
      familiars: [F.FAMILIARS, (e) => ({ ...e, data: F.normalizeFamiliar(e.data) })],
      sessions: [SS.SPIRIT_SESSIONS, (e) => ({ ...e, data: SS.normalizeSession(e.data) })],
      challenges: [C.CHALLENGES, (e) => ({ ...e, data: C.normalizeChallenge(e.data) })]
    };
    await Promise.all(
      want.map(async (key) => {
        const [collection, read] = sources[key];
        data[key] = (await kit.entries(collection)).map(read).filter((e) => e.data);
      })
    );
    state.loaded = true;
  }

  // ── Small helpers for forms ────────────────────────────────────────────
  // Fields are named "f-<path>" ("f-name", "f-exchanges.0.q"); chips carry data-path and data-value.
  function getPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function setPath(obj, path, value) {
    const keys = path.split(".");
    let o = obj;
    for (const k of keys.slice(0, -1)) o = o[k];
    o[keys[keys.length - 1]] = value;
  }
  const f = (path, label, opts = {}) => kit.field({ id: `f-${path}`, label, value: String(getPath(state.form, path) ?? ""), input: "f", ...opts });
  /** Chips for one choice (mode "one", tap again to clear when `clear`), or many ("many"). */
  function pick(path, items, mode = "one", clear = false) {
    const cur = getPath(state.form, path);
    return kit.chips(
      items.map((it) =>
        kit.chip({
          label: it.label,
          act: "pick",
          value: it.id,
          data: { path, mode, clear: clear ? "1" : "" },
          pressed: mode === "many" ? (cur || []).includes(it.id) : cur === it.id,
          a11y: it.hint ? `${it.label}: ${it.hint}` : undefined
        })
      )
    );
  }
  const okDay = (s) => (LC.dateFromKey(String(s || "").trim()) ? String(s).trim() : "");
  const notFound = (back, title) => [back, kit.head({ title }), kit.p(state.loaded ? "This page couldn’t be found. It may have been deleted on another device." : "Opening…")].join("");
  const saveLine = (what) => kit.muted(kit.savedLine(state.user, what));
  async function saveEntry(collection, existingId, value, after) {
    if (state.saving) return;
    state.saving = true;
    state.problem = "";
    draw();
    try {
      if (existingId) {
        await kit.update(collection, existingId, value);
        kit.go(after(existingId));
      } else {
        const e = await kit.add(collection, value);
        kit.go(after(e.id));
      }
    } catch (error) {
      console.error(error);
      state.saving = false;
      state.problem = "It couldn’t be saved. Your words are still here; try again.";
      draw();
    }
  }
  async function deleteEntry(collection, existingId, question, after) {
    if (!kit.confirm(question)) return;
    try {
      await kit.remove(collection, existingId);
      kit.go(after);
    } catch (error) {
      console.error(error);
      state.problem = "It couldn’t be deleted just now.";
      draw();
    }
  }

  // ── The family tree ────────────────────────────────────────────────────
  function personCard(entry) {
    const detail = T.treeDetail(entry.data);
    const chosen = entry.data.kin && entry.data.kin !== "blood";
    return `<a class="sx-person${chosen ? " sx-person--chosen" : ""}" href="${esc(href.person(entry.id))}"><span class="sx-person__name">${esc(entry.data.name || "Unnamed")}</span>${detail ? `<span class="sp-caption">${esc(detail)}</span>` : ""}</a>`;
  }
  function treeView() {
    const people = data.people;
    const tree = T.buildTree(people);
    const byId = (x) => people.find((p) => p.id === x);
    const linked = people.some((p) => p.data.myParent || (p.data.parents || []).length || (p.data.partners || []).length);
    const gens = tree.generations
      .map(
        (g) =>
          `<section class="sp-section" aria-label="${esc(g.label)}"><h2 class="sp-label">${esc(g.label)}</h2><div class="sx-gen">${T.couplesIn(people, g.ids)
            .map((c) => `<div class="sx-couple${c.length > 1 ? " sx-couple--joined" : ""}">${c.map((x) => personCard(byId(x))).join("")}</div>`)
            .join("")}</div></section>`
      )
      .join('<p class="sx-down" aria-hidden="true">│</p>');
    return [
      kit.back(href.ancestors, "Ancestors"),
      kit.head({ eyebrow: "Ancestors", title: "The family tree", lede: "Built from the people you remember: mark who were your parents, and give each person their parents and partners on their page. Tap anyone to open their page and their days." }),
      !state.loaded
        ? kit.muted("Opening…")
        : !people.length
          ? kit.card(kit.p("No one is here yet. Add the people you remember, then link them to draw the tree."))
          : [
              !linked ? kit.card(kit.p("Nobody is linked yet, so everyone stands together below. Open someone, choose Edit, and under “In the family tree” mark them as one of your parents or pick their parents and partners.")) : "",
              gens,
              tree.unplaced.length
                ? kit.section(tree.generations.length ? "Beside the tree" : "Your people", kit.muted("Chosen family, teachers, friends and the beloved dead not linked by blood: kin all the same.") + `<div class="sx-gen">${tree.unplaced.map((x) => personCard(byId(x))).join("")}</div>`)
                : ""
            ].join(""),
      kit.muted("Bloodlines are only one way of belonging. Adopted, fostered and step-family, chosen family, teachers and the beloved dead without a line are kin here; those not linked by blood are drawn with a dashed edge."),
      kit.actions([kit.button({ label: "Add someone", url: href.personEdit, ghost: true })]),
      kit.list([kit.row({ url: "/grimoire/journals/journal/?j=ancestors", title: "Ancestor journal", detail: "Offerings, dreams of them, family recipes and stories" })])
    ].join("");
  }

  // ── Spirits of place ───────────────────────────────────────────────────
  const placeName = (x) => data.places.find((p) => p.id === x)?.data.name || null;
  function spiritsView() {
    const place = params.get("place");
    const here = place ? data.places.find((p) => p.id === place) : null;
    const shown = SP.spiritsAt(data.spirits, here ? here.id : null);
    return [
      kit.back(here ? href.place(here.id) : href.land, here ? here.data.name : "Land journal"),
      kit.head({
        eyebrow: here ? here.data.name : "Land journal",
        title: "Spirits of place",
        lede: "The presences you come to know on your land: an old tree, a spring, the house itself, the dead of a hill. What you’ve sensed of them, where, what you gave and how it seemed to be received. Offerings you note in the land journal at the same place appear with them."
      }),
      kit.actions([kit.button({ label: "Add a spirit of place", url: href.spiritEdit({ place: here?.id }), primary: true })]),
      !state.loaded
        ? kit.muted("Opening…")
        : shown.length
          ? kit.section(here ? "Here" : "Known to you", kit.list(shown.map((s) => kit.row({ url: href.spirit(s.id), title: s.data.resting ? `${s.data.name} (resting)` : s.data.name, detail: SP.spiritLine(s.data, placeName(s.data.placeId)) }))))
          : kit.card(kit.p(`${here ? "No spirits noted here yet." : "No spirits noted yet."} Most begin as “not yet known”: a feeling at a gate, a tree you always greet. Note it, and visit again.`)),
      kit.card(
        `<h2 class="pr-big">Whose land, and with what care</h2>${SP.LAND_RESPECT.map((t) => kit.p(t)).join("")}${kit.details(
          "Finding out whose land you’re on",
          kit.p("Native Land Digital maps the territories, treaties and languages of Indigenous peoples across much of the world. It is a place to start and says itself that it isn’t authoritative; local histories, place-name records and the people of the land are better still.") +
            kit.list([kit.row({ url: kit.href.nativeLand, title: "native-land.ca", detail: "Native Land Digital" })])
        )}`
      ),
      kit.list([
        kit.row({ url: "/practice/folk/lore/", title: "Local lore", detail: "On Traditional & folk · the stories, spirits and sayings of your places" }),
        kit.row({ url: href.sessions, title: "Spirit sessions", detail: "When you sit to listen, by pendulum, scrying or trance" })
      ]),
      saveLine("them")
    ].join("");
  }
  function spiritEditView() {
    const existing = id ? data.spirits.find((s) => s.id === id) : null;
    const back = kit.back(existing ? href.spirit(existing.id) : href.spirits(), existing ? existing.data.name : "Spirits of place");
    if (id && !existing) return notFound(back, "A spirit of place");
    if (!state.form) state.form = existing ? structuredClone(existing.data) : SP.blankSpirit(params.get("place"));
    const s = state.form;
    const hint = SP.SPIRIT_KINDS.find((k) => k.id === s.kind)?.hint;
    return [
      back,
      kit.head({ eyebrow: existing ? "Edit" : "Spirits of place", title: existing ? s.name || "A spirit of place" : "Add a spirit of place" }),
      kit.section("What kind of presence?", pick("kind", SP.SPIRIT_KINDS) + (hint ? kit.muted(hint) : "")),
      kit.section("Where", data.places.length ? pick("placeId", data.places.map((p) => ({ id: p.id, label: p.data.name })), "one", true) : kit.muted("Add places in the land journal to link them.")),
      `<div class="sp-section">${[
        f("name", "What you call it", { placeholder: "The thorn at the gate, the house, the one in the well" }),
        f("spot", "Where in the place", { placeholder: "The field corner, under the stairs, the spring’s lip" }),
        f("sensed", "How it shows itself", { multiline: true, placeholder: "A coolness, a watchfulness, birds going quiet, a scent of earth" }),
        f("greeting", "How you greet it", { multiline: true, placeholder: "A nod and its name, a hand on the bark, a few words" }),
        f("likes", "What seems welcome", { multiline: true, placeholder: "Clean water, song, litter picked up" }),
        f("avoid", "What to avoid there", { multiline: true, placeholder: "Cutting the thorn, loud voices, taking stones" }),
        f("since", "Known since (YYYY-MM-DD, optional)", { placeholder: "2024-04-30", inputmode: "numeric" })
      ].join("")}</div>`,
      existing ? kit.toggle({ id: "f-resting", label: "Resting", detail: "You don’t visit now; it stays here, last in the list.", checked: s.resting, change: "f-check" }) : "",
      kit.notice("Write what you notice, not what you hope. A place’s spirit is learned slowly, over seasons."),
      kit.notice(state.problem, { live: true }),
      kit.actions([
        kit.button({ label: state.saving ? "Saving…" : existing ? "Save changes" : "Add", act: "spirit-save", primary: true, disabled: state.saving }),
        existing ? kit.textButton({ label: "Delete", act: "spirit-delete", quiet: true }) : ""
      ]),
      saveLine("it")
    ].join("");
  }
  function spiritView() {
    const entry = data.spirits.find((s) => s.id === id);
    const back = kit.back(href.spirits(), "Spirits of place");
    if (!entry) return notFound(back, "A spirit of place");
    const s = entry.data;
    const timeline = SP.spiritTimeline(s, data.notes);
    const counts = SP.receptionCounts(s);
    const received = SP.RECEPTIONS.filter((r) => counts[r.id]).map((r) => `${r.label.toLowerCase()} ${counts[r.id]}`);
    const welcome = SP.welcomeOfferings(s);
    const v = state.extra.visit;
    let visitHtml;
    if (v) {
      state.form = v.e;
      visitHtml = kit.card(
        `<h2 class="pr-big">${v.index === null ? "A visit" : "Edit this visit"}</h2>${f("on", "Day (YYYY-MM-DD)", { inputmode: "numeric" })}${kit.muted("How you sensed it")}${pick("senses", SP.SENSES, "many")}${f("sensed", "What you sensed", {
          multiline: true,
          placeholder: "Stillness, a wren that stayed, a feeling of being watched kindly"
        })}${f("offering", "What you gave", { placeholder: "Water, a song, an hour’s litter-picking" })}${kit.muted("How it was received")}${pick("received", SP.RECEPTIONS, "one", true)}${f("notes", "Notes", { multiline: true })}${kit.actions([
          kit.button({ label: "Keep this visit", act: "visit-save", primary: true }),
          kit.textButton({ label: "Cancel", act: "visit-cancel" }),
          v.index !== null ? kit.textButton({ label: "Delete", act: "visit-delete", quiet: true }) : ""
        ])}`,
        { gold: true }
      );
    } else {
      visitHtml = kit.actions([kit.button({ label: "Note a visit", act: "visit-new", primary: true }), kit.button({ label: "Edit", url: href.spiritEdit({ id: entry.id }), ghost: true })]);
    }
    return [
      back,
      kit.head({ eyebrow: kit.join([SP.spiritKindLabel(s.kind), placeName(s.placeId)]), title: s.name }),
      s.spot ? kit.muted(s.spot) : "",
      kit.p(s.sensed),
      s.greeting || s.likes || s.avoid
        ? kit.card([s.greeting ? `<h3 class="sp-label">How you greet it</h3>${kit.p(s.greeting)}` : "", s.likes ? `<h3 class="sp-label">What seems welcome</h3>${kit.p(s.likes)}` : "", s.avoid ? `<h3 class="sp-label">What to avoid</h3>${kit.p(s.avoid)}` : ""].join(""))
        : "",
      received.length ? kit.muted(`How offerings were received: ${received.join(", ")}.${welcome.length ? ` Welcomed most: ${welcome.slice(0, 3).join(", ")}.` : ""}`) : "",
      kit.notice(state.problem, { live: true }),
      visitHtml,
      kit.section(
        timeline.length ? "Visits and offerings" : "No visits yet",
        kit.list(
          timeline.map((t) =>
            t.kind === "note"
              ? kit.row({ url: href.note(t.noteId), title: t.title, detail: kit.join([full(t.on), "From the land journal", t.detail]) })
              : kit.row({ act: "visit-open", data: { index: t.index }, title: t.title, detail: kit.join([full(t.on), t.detail]) })
          )
        )
      ),
      kit.list(
        [
          s.placeId ? kit.row({ url: href.place(s.placeId), title: placeName(s.placeId) || "Its place", detail: "The place in your land journal" }) : "",
          kit.row({ url: href.noteEdit(s.placeId), title: "Note an offering in the land journal", detail: "With the weather, the moon and the day" }),
          kit.row({ url: href.sessionEdit({ link: "place-spirit", ref: entry.id, title: s.name }), title: "Sit with it in a spirit session", detail: "Pendulum, scrying, trance: with protections and a closing" })
        ].filter(Boolean)
      )
    ].join("");
  }

  // ── Familiars ──────────────────────────────────────────────────────────
  const dueWords = (d) => (d.inDays < 0 ? `${-d.inDays} ${d.inDays === -1 ? "day" : "days"} overdue` : d.inDays === 0 ? "Due today" : `Due in ${d.inDays} ${d.inDays === 1 ? "day" : "days"}`);
  function familiarsView() {
    const now = new Date();
    const all = [...data.familiars].sort((a, b) => a.data.name.localeCompare(b.data.name));
    const due = all.flatMap((x) => F.careDue(x.data, now).filter((d) => d.inDays <= 2).map((d) => ({ ...d, id: x.id, name: x.data.name })));
    const groups = [
      ["Living with you", "living"],
      ["Spirit familiars", "spirit"],
      ["Remembered", "remembered"]
    ];
    return [
      kit.back("/practice/hearth/", "Hearth & land"),
      kit.head({ eyebrow: "Hearth & land", title: "Familiars", lede: "The animals you share your home with, the spirit companions you work beside, and the ones who have gone before. Their care days, the work they join, the signs you notice, and a place to remember them." }),
      kit.actions([kit.button({ label: "Add a familiar", url: href.familiarEdit(), primary: true })]),
      due.length ? kit.section("Care coming due", kit.list(due.map((d) => kit.row({ url: href.familiar(d.id), title: `${d.name}: ${d.what}`, detail: dueWords(d) })))) : "",
      !state.loaded
        ? kit.muted("Opening…")
        : !all.length
          ? kit.card(kit.p("No one here yet. Add the cat on the altar cloth, the dog who walks the bounds with you, the hare you meet in trance, or the old friend you still miss."))
          : groups
              .map(([title, kind]) => {
                const list = all.filter((x) => x.data.kind === kind);
                return list.length ? kit.section(title, kit.list(list.map((x) => kit.row({ url: href.familiar(x.id), title: x.data.name, detail: F.familiarLine(x.data, now) })))) : "";
              })
              .join(""),
      kit.details("Where the familiar comes from", kit.p(F.FAMILIAR_HISTORY)),
      kit.list([
        kit.row({ url: "/rituals/craft/kitchen/blend", title: "Blending lab", detail: "Incense, oils and teas, with pet-safety notes for cats and dogs" }),
        kit.row({ url: href.ancestors, title: "Ancestors", detail: "Your beloved dead, people and their days" })
      ]),
      saveLine("them")
    ].join("");
  }
  function familiarView() {
    const entry = data.familiars.find((x) => x.id === id);
    const back = kit.back(href.familiars, "Familiars");
    if (!entry) return notFound(back, "A familiar");
    const x = entry.data;
    const now = new Date();
    const due = F.careDue(x, now);
    const cautions = F.petCautions(x);
    const mem = F.memorialDay(x, now);
    const note = state.extra.note;
    if (note) state.form = note;
    return [
      back,
      kit.head({ eyebrow: x.kind === "remembered" ? "Remembered" : x.kind === "spirit" ? "Spirit familiar" : F.animalLabel(x.animal), title: x.name }),
      kit.muted(F.familiarLine(x, now)),
      kit.p(x.about),
      x.kind === "remembered"
        ? kit.card(
            `<h2 class="pr-big">In memory</h2>${x.died ? kit.p(`${x.born ? `${full(x.born)} – ` : ""}${full(x.died)}`) : ""}${x.came && x.died ? kit.muted(`With you for ${F.spanWords(x.came, x.died) || "a little while"}.`) : ""}${kit.p(x.memorial.words)}${
              x.memorial.resting ? kit.muted(`Resting: ${x.memorial.resting}`) : ""
            }${x.memorial.keepsake ? kit.muted(`Kept: ${x.memorial.keepsake}`) : ""}${mem ? kit.muted(`Their day comes round ${CAL.relativeDay(now, mem.date)}, ${CAL.longDate(mem.date)}: ${mem.years === 1 ? "one year" : `${mem.years} years`}. Light a candle, or tell a story about them.`) : ""}`,
            { gold: true }
          )
        : "",
      due.length
        ? kit.section(
            "Care days",
            due.map((d) => kit.card(`<h3 class="pr-big">${esc(d.what)}</h3>${kit.muted(dueWords(d))}${kit.actions([kit.button({ label: "Done today", act: "care-done", value: d.index, small: true, ghost: true })])}`)).join("") +
              kit.muted("Rhythms are reminders, not veterinary advice. Your vet’s word comes first.")
          )
        : "",
      x.work.length
        ? kit.section(
            "The work they join",
            kit.chips(x.work.map((w) => kit.chip({ label: F.WORK_KINDS.find((k) => k.id === w)?.label || w }))) +
              kit.muted("An animal joins the work on their own terms. If they leave the room, let them; never confine an animal to a ritual, and keep them clear of smoke and flame.")
          )
        : "",
      cautions.length ? kit.section("Keeping them safe around the craft", cautions.map((c) => kit.card(`<h3 class="pr-big">${esc(c.title)}</h3>${kit.p(c.text)}`)).join("")) : "",
      kit.section(
        "Signs and notes",
        (note
          ? kit.card(`${pick("kind", F.NOTE_KINDS)}${f("text", "What happened", { multiline: true, placeholder: "Sat on the cards and wouldn’t move; watched the corner all evening" })}${kit.actions([kit.button({ label: "Keep it", act: "note-save", primary: true }), kit.textButton({ label: "Cancel", act: "note-cancel" })])}`)
          : kit.actions([kit.button({ label: "Note a sign or a moment", act: "note-new", ghost: true })])) +
          x.notes
            .slice(0, 30)
            .map((n) => kit.p(`${full(n.on)} · ${F.NOTE_KINDS.find((k) => k.id === n.kind)?.label}: ${n.text}`))
            .join("")
      ),
      kit.notice(state.problem, { live: true }),
      kit.actions([kit.button({ label: "Edit", url: href.familiarEdit(entry.id), ghost: true })]),
      kit.list([
        kit.row({ url: "/rituals/craft/kitchen/blend", title: "Blending lab", detail: "Check a blend before you burn it near them" }),
        kit.row({ url: href.sessionEdit({ link: "familiar", ref: entry.id, title: x.name }), title: "Sit with them in a spirit session", detail: "For a spirit familiar, or one remembered" })
      ])
    ].join("");
  }
  function familiarEditView() {
    const existing = id ? data.familiars.find((x) => x.id === id) : null;
    const back = kit.back(existing ? href.familiar(existing.id) : href.familiars, existing ? existing.data.name : "Familiars");
    if (id && !existing) return notFound(back, "A familiar");
    if (!state.form) state.form = existing ? structuredClone(existing.data) : F.blankFamiliar();
    const x = state.form;
    const suggestions = F.careSuggestions(x.animal).filter((s) => !x.care.some((c) => c.what === s.what));
    return [
      back,
      kit.head({ eyebrow: existing ? "Edit" : "Familiars", title: existing ? x.name || "A familiar" : "Add a familiar" }),
      pick("kind", F.FAMILIAR_KINDS),
      `<div class="sp-section">${f("name", "Name", { placeholder: "What you call them" })}</div>`,
      x.kind !== "spirit" ? kit.section("Animal", pick("animal", F.ANIMALS)) : "",
      `<div class="sp-section">${[
        f("form", x.kind === "spirit" ? "Their form" : "Breed or kind", { placeholder: x.kind === "spirit" ? "A grey hare, a raven, a shape of light" : "Tabby, collie cross, African grey" }),
        x.kind !== "spirit" ? f("born", "Born (YYYY-MM-DD, optional)", { placeholder: "2019-05-01", inputmode: "numeric" }) : "",
        f("came", x.kind === "spirit" ? "First met (YYYY-MM-DD)" : "Came to you (YYYY-MM-DD)", { placeholder: "2020-09-12", inputmode: "numeric" }),
        x.kind === "remembered" ? f("died", "Died (YYYY-MM-DD)", { placeholder: "2025-02-03", inputmode: "numeric" }) : "",
        f("about", "About them", { multiline: true, placeholder: "Their ways, what they love, how they came to you" })
      ].join("")}</div>`,
      kit.section("The work they join", pick("work", F.WORK_KINDS, "many")),
      x.kind === "living"
        ? kit.section(
            "Care days",
            x.care
              .map((c, i) => `<div class="sp-grid-2">${f(`care.${i}.what`, "What")}${f(`care.${i}.every`, "Every how many days", { inputmode: "numeric" })}</div>${kit.textButton({ label: "Remove", act: "care-remove", value: i, quiet: true })}`)
              .join("") +
              (suggestions.length ? kit.chips(suggestions.map((s, i) => kit.chip({ label: `+ ${s.what}`, act: "care-suggest", value: i }))) : "") +
              kit.actions([kit.button({ label: "Add a care day of your own", act: "care-add", ghost: true, small: true })]) +
              f("around", "Herbs, oils, incense and stones used around them", { multiline: true, placeholder: "Lavender oil\nFrankincense\nRosemary" }) +
              kit.muted("One to a line. Their page checks these against the blending lab’s pet-safety notes.")
          )
        : "",
      x.kind === "remembered"
        ? kit.section(
            "Their memorial",
            f("memorial.words", "Words for them", { multiline: true, placeholder: "What they were to you" }) +
              f("memorial.resting", "Where they rest", { placeholder: "Under the apple tree, their ashes on the shelf" }) +
              f("memorial.keepsake", "What you keep of them", { placeholder: "Their collar, a whisker in a locket, a paw print" })
          )
        : "",
      kit.notice(state.problem, { live: true }),
      kit.actions([
        kit.button({ label: state.saving ? "Saving…" : existing ? "Save changes" : "Add", act: "familiar-save", primary: true, disabled: state.saving }),
        existing ? kit.textButton({ label: "Delete", act: "familiar-delete", quiet: true }) : ""
      ]),
      saveLine("them")
    ].join("");
  }

  // ── Spirit sessions ────────────────────────────────────────────────────
  const LINK_URL = { ancestor: href.person, "place-spirit": href.spirit, familiar: href.familiar };
  function sessionsView() {
    const sessions = [...data.sessions].sort((a, b) => b.data.date.localeCompare(a.data.date));
    const pending = SS.toVerify(sessions);
    const tally = SS.verifyTally(sessions);
    return [
      kit.back("/divination/", "Divination"),
      kit.head({
        eyebrow: "Divination · Hedge",
        title: "Spirit sessions",
        lede: "A record of the times you sit to speak with an ancestor, a deity, a spirit of place or a guide: by pendulum, spirit board, scrying, mediumship or trance. Who came, how you opened and closed, what protected you, what was asked and answered, and later, whether it bore out."
      }),
      kit.actions([kit.button({ label: "Log a session", url: href.sessionEdit(), primary: true })]),
      pending.length ? kit.section("Waiting to be checked", kit.list(pending.slice(0, 5).map((p) => kit.row({ url: href.session(p.id), title: p.q || "An answer", detail: `${p.who || "Whoever came"}, ${full(p.date)}: “${p.a.slice(0, 60)}”` })))) : "",
      tally.checked ? kit.muted(`Of ${tally.checked} answers checked: ${tally.yes} bore out, ${tally.partly} partly, ${tally.no} didn’t.${tally.checked >= 10 ? ` About ${tally.rate}% overall.` : " A pattern needs more than ten to mean much."}`) : "",
      !state.loaded
        ? kit.muted("Opening…")
        : sessions.length
          ? kit.section("Your sessions", kit.list(sessions.map((s) => kit.row({ url: href.session(s.id), title: SS.sessionTitle(s.data), detail: kit.join([full(s.data.date), s.data.moonPhase, s.data.closed ? "" : "not closed"]) }))))
          : kit.card(kit.p("No sessions yet. Before your first, read the safety notes below, and decide how you’ll open and close.")),
      kit.card(`<h2 class="pr-big">Safety</h2>${SS.SESSION_SAFETY.map((s) => `<h3 class="sp-label">${esc(s.title)}</h3>${kit.p(s.text)}`).join("")}`),
      kit.list([
        kit.row({ url: href.ancestors, title: "Ancestors", detail: "Your beloved dead and their days" }),
        kit.row({ url: href.spirits(), title: "Spirits of place", detail: "The presences of your land" }),
        kit.row({ url: "/grimoire/journals/", title: "Deity & spirit journal", detail: "In your Grimoire" }),
        kit.row({ url: kit.href.support, title: "Support", detail: "If anything has frightened or unsettled you" })
      ]),
      saveLine("them")
    ].join("");
  }
  function sessionView() {
    const entry = data.sessions.find((s) => s.id === id);
    const back = kit.back(href.sessions, "Spirit sessions");
    if (!entry) return notFound(back, "A session");
    const s = entry.data;
    const method = SS.SESSION_METHODS.find((m) => m.id === s.method);
    const link = s.link && LINK_URL[s.link.kind] ? LINK_URL[s.link.kind](s.link.id) : null;
    return [
      back,
      kit.head({ eyebrow: `${full(s.date)} · ${s.moonPhase}`, title: SS.sessionTitle(s) }),
      kit.muted(kit.join([SS.WHO_KINDS.find((w) => w.id === s.whoKind)?.label, method?.label])),
      kit.p(s.intention),
      SS.sessionCautions(s)
        .map((c) => kit.card(kit.p(c), { gold: true }))
        .join(""),
      s.protections.length ? kit.section("Protections", kit.chips(s.protections.map((p) => kit.chip({ label: SS.PROTECTIONS.find((x) => x.id === p)?.label || p })))) : "",
      s.opening ? kit.section("Opening", kit.p(s.opening)) : "",
      s.exchanges.length
        ? kit.section(
            "Questions and answers",
            s.exchanges
              .map((x, i) =>
                kit.card(
                  `${x.q ? `<h3 class="pr-big">${esc(x.q)}</h3>` : ""}${kit.p(x.a || "(no answer)")}${kit.muted("Did it bear out?")}${kit.chips(
                    SS.CHECKS.map((c) => kit.chip({ label: c.label, act: "check", value: c.id, data: { index: i }, pressed: x.check === c.id }))
                  )}${x.checkNote ? kit.muted(x.checkNote) : ""}`
                )
              )
              .join("")
          )
        : "",
      s.impressions ? kit.section("Impressions", kit.p(s.impressions)) : "",
      s.closing ? kit.section(s.closed ? "Closing" : "Closing (not completed)", kit.p(s.closing)) : "",
      s.after || s.aftercare ? kit.muted([s.after ? `Afterwards: ${SS.AFTERS.find((a) => a.id === s.after)?.label.toLowerCase()}` : "", s.aftercare].filter(Boolean).join(". ")) : "",
      kit.notice(state.problem, { live: true }),
      kit.actions([kit.button({ label: "Edit", url: href.sessionEdit({ id: entry.id }), ghost: true })]),
      kit.list(
        [
          link ? kit.row({ url: link, title: s.link.title || "Who came", detail: "Their page" }) : "",
          s.method === "cards" ? kit.row({ url: "/divination/edit/", title: "Log the cards drawn", detail: "As a reading in Divination" }) : "",
          kit.row({ url: href.sessions, title: "All sessions" })
        ].filter(Boolean)
      ),
      method?.history ? kit.muted(method.history) : ""
    ].join("");
  }
  function sessionEditView() {
    const existing = id ? data.sessions.find((s) => s.id === id) : null;
    const back = kit.back(existing ? href.session(existing.id) : href.sessions, existing ? "Session" : "Spirit sessions");
    if (id && !existing) return notFound(back, "A session");
    if (!state.form) {
      state.form = existing ? structuredClone(existing.data) : SS.blankSession(new Date());
      const link = params.get("link");
      if (!existing && params.get("ref") && ["ancestor", "place-spirit", "familiar"].includes(link)) {
        state.form.link = { kind: link, id: params.get("ref"), title: params.get("title") || "" };
        state.form.who = state.form.link.title;
        state.form.whoKind = link === "place-spirit" ? "place" : link;
      }
    }
    const s = state.form;
    const method = SS.SESSION_METHODS.find((m) => m.id === s.method);
    return [
      back,
      kit.head({ eyebrow: existing ? "Edit" : "Spirit sessions", title: existing ? "Edit the session" : "Log a session" }),
      `<div class="sp-section">${f("date", "Day (YYYY-MM-DD)", { inputmode: "numeric" })}</div>`,
      kit.section("How", `${kit.chips(SS.SESSION_METHODS.map((m) => kit.chip({ label: m.label, act: "method", value: m.id, pressed: s.method === m.id })))}${kit.muted(method.how)}${method.care ? kit.muted(`Take care: ${method.care}`) : ""}`),
      kit.section(
        "With whom",
        pick("whoKind", SS.WHO_KINDS) +
          (s.whoKind === "ancestor" && data.people.length
            ? kit.chips(data.people.map((p) => kit.chip({ label: p.data.name || "Unnamed", act: "who-person", value: p.id, pressed: s.link?.id === p.id })))
            : "") +
          f("who", "Their name, or how they came", { placeholder: "Nan, Hekate, the spirit of the well, unknown" }) +
          f("intention", "Why you sat", { multiline: true, placeholder: "To ask about the ring; to say goodbye; to listen" })
      ),
      kit.section("Protections", pick("protections", SS.PROTECTIONS, "many") + f("opening", "Opening", { multiline: true })),
      kit.section(
        "Questions and answers",
        s.exchanges
          .map((x, i) =>
            kit.card(`${f(`exchanges.${i}.q`, "Asked")}${f(`exchanges.${i}.a`, "Answer", { multiline: true })}${f(`exchanges.${i}.checkNote`, "Checked later (what you found)", { multiline: true })}${kit.textButton({ label: "Remove", act: "qa-remove", value: i, quiet: true })}`)
          )
          .join("") +
          kit.actions([kit.button({ label: "Add a question", act: "qa-add", ghost: true, small: true })]) +
          kit.muted("Write answers down as they came, before interpreting. Whether they bore out is marked on the session’s page.")
      ),
      `<div class="sp-section">${f("impressions", "Impressions", { multiline: true, placeholder: "Images, feelings, a temperature change, a scent, nothing at all" })}</div>`,
      kit.section(
        "Closing",
        f("closing", "How you closed", { multiline: true }) +
          kit.toggle({ id: "f-closed", label: "Closed fully", detail: "Thanked them, said it was over, put the tools away", checked: s.closed, change: "f-check" }) +
          pick("after", SS.AFTERS, "one", true) +
          f("aftercare", "Aftercare", { placeholder: "Tea and toast, a walk, an early night" })
      ),
      kit.notice("Stop at once if anything turns threatening, cruel or demanding, or tells you to harm yourself or anyone. If voices or presences carry on outside your sessions, see a doctor: that is care, not failure."),
      kit.notice(state.problem, { live: true }),
      kit.actions([
        kit.button({ label: state.saving ? "Saving…" : existing ? "Save changes" : "Keep this session", act: "session-save", primary: true, disabled: state.saving }),
        existing ? kit.textButton({ label: "Delete", act: "session-delete", quiet: true }) : ""
      ]),
      saveLine("it")
    ].join("");
  }

  // ── Practice challenges ────────────────────────────────────────────────
  function challengesView() {
    if (id) return challengeView();
    const now = new Date();
    const all = [...data.challenges].sort((a, b) => b.data.start.localeCompare(a.data.start));
    const active = all.filter((x) => !x.data.finished && !C.progressOf(x.data, now).over);
    const past = all.filter((x) => !active.includes(x));
    const begin = state.extra.begin || (state.extra.begin = { theme: "tarot", length: 13 });
    const theme = C.themeById(begin.theme);
    return [
      kit.back("/rituals/year/", "A Year and a Day"),
      kit.head({
        eyebrow: "Beside A Year and a Day",
        title: "Practice challenges",
        lede: "Seven, thirteen, twenty-one or thirty days of one small practice. Each day has its own prompt; check in with a line or two, keep a streak if you like, and write a reflection at the end. A missed day is just a missed day: carry on."
      }),
      active.length
        ? kit.section(
            "Under way",
            kit.list(
              active.map((x) => {
                const p = C.progressOf(x.data, now);
                return kit.row({ url: href.challenge(x.id), title: C.challengeTitle(x.data), detail: `Day ${Math.max(1, p.day)} of ${x.data.length} · ${p.done} checked in${p.streak > 1 ? ` · ${p.streak}-day streak` : ""}${p.todayDone ? " · done today" : ""}` });
              })
            )
          )
        : "",
      kit.card(
        `<h2 class="pr-big">Begin a challenge</h2>${kit.chips(C.THEMES.map((t) => kit.chip({ label: t.title, act: "begin-theme", value: t.id, pressed: begin.theme === t.id })))}${kit.p(theme.about)}${kit.muted(`You’ll need: ${theme.need}`)}${kit.chips(
          C.LENGTHS.map((n) => kit.chip({ label: `${n} days`, act: "begin-length", value: n, pressed: begin.length === n }))
        )}${kit.muted(`Day one: ${theme.prompts[0]}`)}${kit.actions([kit.button({ label: state.saving ? "Beginning…" : "Begin today", act: "begin", primary: true, disabled: state.saving })])}`,
        { gold: true }
      ),
      past.length
        ? kit.section(
            "Finished",
            kit.list(
              past.map((x) => {
                const p = C.progressOf(x.data, now);
                return kit.row({ url: href.challenge(x.id), title: C.challengeTitle(x.data), detail: `${p.done} of ${x.data.length} days · best streak ${p.best}${x.data.finished ? " · reflected" : ""}` });
              })
            )
          )
        : "",
      kit.notice(state.problem, { live: true }),
      kit.list([kit.row({ url: "/rituals/year/", title: "A Year and a Day", detail: "Thirteen moons of study and practice" }), kit.row({ url: "/practice/solitary/", title: "Solitary practice", detail: "Daily devotion, and workings for practising alone" })]),
      saveLine("them")
    ].join("");
  }
  function challengeView() {
    const entry = data.challenges.find((x) => x.id === id);
    const back = kit.back(href.challenges, "Challenges");
    if (!entry) return notFound(back, "A challenge");
    const c = entry.data;
    const theme = C.themeById(c.theme);
    const prompts = C.promptsFor(theme, c.length);
    const now = new Date();
    const p = C.progressOf(c, now);
    const todayN = Math.min(Math.max(p.day, 1), c.length);
    const day = state.extra.day || todayN;
    const date = LC.dateFromKey(C.dateOfDay(c, day));
    const existing = c.checkins[String(day)];
    if (state.extra.note === undefined) state.extra.note = existing?.note || "";
    const grid = `<div class="sx-days" role="group" aria-label="Days">${prompts
      .map((_, i) => {
        const n = i + 1;
        const done = !!c.checkins[String(n)];
        return `<button type="button" class="sx-day${done ? " is-done" : ""}${n === day ? " is-current" : ""}" data-act="day" data-value="${n}" aria-pressed="${n === day}" aria-label="Day ${n}${done ? ", checked in" : ""}">${n}</button>`;
      })
      .join("")}</div>`;
    return [
      back,
      kit.head({ eyebrow: `Day ${todayN} of ${c.length}`, title: C.challengeTitle(c) }),
      kit.muted(`${p.done} checked in · streak ${p.streak} · best ${p.best}`),
      grid,
      kit.card(
        `<h2 class="sp-label">Day ${day} · ${esc(full(C.dateOfDay(c, day)))}</h2><p class="pr-big">${esc(C.promptOn(prompts[day - 1], date))}</p>${
          day > p.day
            ? kit.muted("This day hasn’t come yet.")
            : `${kit.field({ id: "checkin", label: "Your check-in", value: state.extra.note, input: "checkin-note", multiline: true, placeholder: "A line or two: what you did, what you noticed" })}${kit.actions([
                kit.button({ label: existing ? "Update" : "Check in", act: "check-in", primary: true }),
                existing ? kit.textButton({ label: "Undo", act: "uncheck" }) : ""
              ])}`
        }`,
        { gold: true }
      ),
      C.readyToFinish(c, now) || c.finished
        ? kit.card(
            `<h2 class="pr-big">${c.finished ? "Your reflection" : "The finish"}</h2>${c.finished ? "" : C.FINISH_QUESTIONS.map((q) => kit.muted(q)).join("")}${kit.field({
              id: "reflection",
              label: "Reflection",
              value: state.extra.reflection ?? c.reflection,
              input: "reflection",
              multiline: true
            })}${kit.actions([kit.button({ label: c.finished ? "Save" : "Finish the challenge", act: "finish", primary: true })])}${c.finished ? kit.muted(`Finished ${full(c.finished)}.`) : ""}`
          )
        : "",
      kit.notice(state.problem, { live: true }),
      kit.list(theme.links.map((l) => kit.row({ url: l.web, title: l.label }))),
      kit.actions([kit.textButton({ label: "Delete this challenge", act: "challenge-delete", quiet: true })])
    ].join("");
  }

  // ── Numerology ─────────────────────────────────────────────────────────
  function numberCard(label, line, reading) {
    const m = N.meaningOf(reading.number);
    const planet = N.NUMBER_PLANETS[N.reduce(reading.number, false)];
    const hour = N.hourFor(reading.number);
    return kit.card(
      `<h2 class="sp-label">${esc(label)}</h2><p class="pr-big">${esc(`${reading.number} · ${m.title}`)}</p>${kit.muted(m.keywords)}${reading.steps ? kit.muted(reading.steps) : ""}${kit.muted(line)}${kit.details(
        `Read ${reading.number} in depth`,
        `${m.essay.map((t) => kit.p(t)).join("")}${kit.muted(`Shadow: ${m.shadow}`)}${kit.p(`In the craft: ${m.work}`)}${planet ? kit.muted(`Its planet: ${planet.planet}.${planet.note ? ` ${planet.note}` : ""}`) : ""}${kit.actions([
          kit.button({ label: `${hour} hours`, url: href.hours(hour), ghost: true, small: true })
        ])}`
      )}`,
      { gold: N.MASTERS.includes(reading.number) }
    );
  }
  function numerologyView() {
    const n = state.extra.num || (state.extra.num = { name: "", d: "", m: "", y: "", system: "pythagorean" });
    const birth = N.readBirth(n.d, n.m, n.y);
    const core = N.coreNumbers(n.name, birth, n.system, new Date());
    const hasName = /[a-z]/i.test(n.name);
    const field = (key, label, extra) => kit.field({ id: `num-${key}`, label, value: n[key], input: "num", ...extra });
    return [
      kit.back("/practice/cosmic/", "Cosmic"),
      kit.head({ eyebrow: "Cosmic", title: "Numerology", lede: "Your life path from your birth date; your expression, soul urge and personality from your name; and the personal year, month and day for timing. Nothing you type here is saved or sent anywhere." }),
      `<div class="sp-section">${field("name", "Full name at birth (or the name you go by)", { placeholder: "As on your birth certificate, for the classic reading", autocomplete: "name" })}<div class="sx-date">${field("d", "Day", { inputmode: "numeric", placeholder: "29" })}${field("m", "Month", {
        inputmode: "numeric",
        placeholder: "12"
      })}${field("y", "Year", { inputmode: "numeric", placeholder: "1987" })}</div>${kit.chips(N.SYSTEMS.map((s) => kit.chip({ label: s.label, act: "num-system", value: s.id, pressed: n.system === s.id })))}${kit.muted(N.SYSTEMS.find((s) => s.id === n.system).about)}</div>`,
      `<div data-num-results>${numResults(core, hasName, n)}</div>`,
      kit.details("Where numerology comes from", N.NUMEROLOGY_ORIGINS.map((t) => kit.p(t)).join("")),
      kit.list([
        kit.row({ url: href.hours(), title: "Planetary hours", detail: "Time a working by the planet of its number" }),
        kit.row({ url: "/practice/cosmic/timing/", title: "Find a good time", detail: "The spell timing advisor" }),
        kit.row({ url: "/practice/eclectic/sigil/", title: "Sigils on the planetary squares", detail: "Kameas and the planets’ seals" })
      ])
    ].join("");
  }
  function numResults(core, hasName, n) {
    if (!core) return kit.card(kit.p(n.d || n.m || n.y ? "That date doesn’t look right: check the day, month and four-figure year." : "Put in your birth date to begin; add your name for the name numbers."));
    return [
      kit.section(
        "Now",
        kit.card(
          `<p class="pr-big">${esc(`Personal year ${core.personalYear} · month ${core.personalMonth} · day ${core.personalDay}`)}</p>${kit.p(N.meaningOf(core.personalYear).year)}${kit.muted(
            `This month (${core.personalMonth}): ${N.meaningOf(core.personalMonth).keywords.toLowerCase()}. Today (${core.personalDay}): ${N.meaningOf(core.personalDay).day}`
          )}${kit.actions([kit.button({ label: `Today suits ${N.hourFor(core.personalDay)} hours`, url: href.hours(N.hourFor(core.personalDay)), ghost: true, small: true })])}`
        )
      ),
      N.NUMBER_ROLES.filter((r) => hasName || r.key === "lifePath" || r.key === "birthday")
        .map((r) => numberCard(r.label, r.line, core[r.key]))
        .join(""),
      n.system === "chaldean" && hasName ? kit.muted(`Chaldean readers keep the compound before it’s reduced: your name totals ${core.expression.compound}.`) : ""
    ].join("");
  }

  // ── The printable Book of Shadows ──────────────────────────────────────
  async function loadGrimoire() {
    if (!state.user || !global.db) return null;
    const db = global.db;
    const [books, sections, pages, blocks] = await Promise.all([
      db.from("grimoire_books").select("id,title,created_at,updated_at").order("created_at"),
      db.from("grimoire_sections").select("id,book_id,title,sort_order,created_at"),
      db.from("grimoire_pages").select("id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at"),
      db.from("grimoire_blocks").select("id,page_id,block_type,content,rich_content,metadata,sort_order,created_at")
    ]);
    const failed = [books, sections, pages, blocks].find((r) => r.error);
    if (failed) throw failed.error;
    return { fetchedAt: new Date().toISOString(), books: books.data || [], sections: sections.data || [], pages: pages.data || [], blocks: blocks.data || [], links: [] };
  }
  function printView() {
    const g = state.extra.grimoire;
    const back = kit.back("/grimoire/", "Grimoire");
    const head = kit.head({ eyebrow: "Grimoire", title: "Print your Book of Shadows", lede: "Choose the pages to print. They come out in the Grimoire’s own order, with a title page, a contents list, and each page on a fresh sheet." });
    if (!state.user) return [back, head, kit.card(kit.p("Sign in to print your Book of Shadows: its pages are kept with your account.")), kit.actions([kit.button({ label: "Open the Grimoire to sign in", url: "/grimoire/", primary: true })])].join("");
    if (!g) return [back, head, kit.muted(state.problem || "Opening your Grimoire…")].join("");
    const all = PB.printablePages(g);
    if (!state.extra.picked) state.extra.picked = new Set(all.map((p) => p.page.id));
    if (!state.form) state.form = { title: "Book of Shadows", subtitle: "", owner: "", contents: true };
    const picked = state.extra.picked;
    const groups = [];
    for (const p of all) {
      const key = `${p.book}|${p.section || ""}`;
      let grp = groups.find((x) => x.key === key);
      if (!grp) groups.push((grp = { key, label: kit.join([g.books.length > 1 ? p.book : "", p.section || "Not in a section"]), pages: [] }));
      grp.pages.push(p.page);
    }
    if (!all.length) return [back, head, kit.card(kit.p("There are no pages to print yet."))].join("");
    return [
      back,
      head,
      `<div class="sp-section">${f("title", "Title")}${f("subtitle", "Under the title (optional)", { placeholder: "The workings of the hearth, 2026" })}${f("owner", "Whose book (optional)", { placeholder: "Your name or craft name" })}${kit.toggle({
        id: "f-contents",
        label: "A contents list",
        checked: state.form.contents,
        change: "f-check"
      })}</div>`,
      kit.actions([kit.button({ label: "Every page", act: "print-all", ghost: true, small: true }), kit.textButton({ label: "None", act: "print-none" })]),
      groups
        .map((grp, gi) => {
          const on = grp.pages.filter((pg) => picked.has(pg.id)).length;
          return kit.section(
            `${grp.label} · ${on} of ${grp.pages.length}`,
            kit.chips([
              kit.chip({ label: "All in this section", act: "print-group", value: gi, pressed: on === grp.pages.length }),
              ...grp.pages.map((pg) => kit.chip({ label: pg.title || "Untitled page", act: "print-page", value: pg.id, pressed: picked.has(pg.id) }))
            ])
          );
        })
        .join(""),
      kit.actions([kit.button({ label: `Print or save as PDF (${picked.size})`, act: "print", primary: true, disabled: !picked.size }), kit.button({ label: "Download the page", act: "print-download", ghost: true, disabled: !picked.size })]),
      kit.notice(state.problem, { live: true }),
      kit.muted("Your browser’s print window opens with the book: choose a printer, or “Save as PDF”. Sigils drawn in the app stay out of print; images print when they’re online.")
    ].join("");
  }
  function printHtml() {
    const g = state.extra.grimoire;
    return PB.printableHtml(g, [...state.extra.picked], { ...state.form, printedOn: `Printed ${full(today())}` });
  }
  function groupsOfPrint() {
    const g = state.extra.grimoire;
    const out = [];
    for (const p of PB.printablePages(g)) {
      const key = `${p.book}|${p.section || ""}`;
      let grp = out.find((x) => x.key === key);
      if (!grp) out.push((grp = { key, ids: [] }));
      grp.ids.push(p.page.id);
    }
    return out;
  }

  // ── Wiring ─────────────────────────────────────────────────────────────
  const VIEWS = {
    "hedge-ancestors-tree": treeView,
    "hearth-land-spirits": spiritsView,
    "hearth-land-spirit": spiritView,
    "hearth-land-spirit-edit": spiritEditView,
    "hearth-familiars": familiarsView,
    "hearth-familiars-familiar": familiarView,
    "hearth-familiars-edit": familiarEditView,
    "spirit-sessions": sessionsView,
    "spirit-session": sessionView,
    "spirit-session-edit": sessionEditView,
    challenges: challengesView,
    numerology: numerologyView,
    "grimoire-print": printView
  };
  const draw = () => kit.render(root, (VIEWS[view] || treeView)());

  const familiarEntry = () => data.familiars.find((x) => x.id === id);
  const spiritEntry = () => data.spirits.find((x) => x.id === id);
  const sessionEntry = () => data.sessions.find((x) => x.id === id);
  const challengeEntry = () => data.challenges.find((x) => x.id === id);
  async function keep(collection, entry, next) {
    try {
      await kit.update(collection, entry.id, next);
      entry.data = next;
      state.problem = "";
    } catch (error) {
      console.error(error);
      state.problem = "It couldn’t be saved just now.";
    }
    draw();
  }

  kit.delegate(root, {
    f(el) {
      const path = el.id.slice(2);
      const cur = getPath(state.form, path);
      setPath(state.form, path, typeof cur === "number" ? Number(el.value.replace(/\D/g, "")) || 1 : el.value);
    },
    "f-check"(el) {
      setPath(state.form, el.id.slice(2), el.checked);
    },
    pick(el) {
      const { path, mode, clear } = el.dataset;
      const value = el.dataset.value;
      const cur = getPath(state.form, path);
      if (mode === "many") setPath(state.form, path, (cur || []).includes(value) ? cur.filter((x) => x !== value) : [...(cur || []), value]);
      else setPath(state.form, path, clear && cur === value ? (path === "after" ? "" : null) : value);
      draw();
    },
    // Spirits of place
    "spirit-save"() {
      const s = { ...state.form, name: (state.form.name || "").trim(), since: okDay(state.form.since) };
      if (!s.name) {
        state.problem = "Name it first: what you call it, or a few words, “the thorn at the gate”.";
        return draw();
      }
      saveEntry(SP.LAND_SPIRITS, id, SP.normalizeSpirit(s), href.spirit);
    },
    "spirit-delete"() {
      deleteEntry(SP.LAND_SPIRITS, id, "Delete this spirit? Its visits will be deleted on every device. Notes in the land journal stay.", href.spirits());
    },
    "visit-new"() {
      state.extra.visit = { index: null, e: SP.blankEncounter(today()) };
      draw();
    },
    "visit-open"(el) {
      const entry = spiritEntry();
      const i = Number(el.dataset.index);
      state.extra.visit = { index: i, e: structuredClone(entry.data.encounters[i]) };
      draw();
    },
    "visit-cancel"() {
      state.extra.visit = null;
      state.form = null;
      draw();
    },
    async "visit-save"() {
      const v = state.extra.visit;
      if (!okDay(v.e.on)) {
        state.problem = "The day needs to be a date: YYYY-MM-DD.";
        return draw();
      }
      const entry = spiritEntry();
      state.extra.visit = null;
      state.form = null;
      await keep(SP.LAND_SPIRITS, entry, SP.withEncounter(entry.data, v.e, v.index));
    },
    async "visit-delete"() {
      const v = state.extra.visit;
      if (!kit.confirm("Delete this visit? It will be deleted on every device.")) return;
      const entry = spiritEntry();
      state.extra.visit = null;
      state.form = null;
      await keep(SP.LAND_SPIRITS, entry, SP.withoutEncounter(entry.data, v.index));
    },
    // Familiars
    "familiar-save"() {
      const x = state.form;
      if (!(x.name || "").trim()) {
        state.problem = "A name first: their name, or what you call them.";
        return draw();
      }
      saveEntry(F.FAMILIARS, id, F.normalizeFamiliar({ ...x, born: okDay(x.born), came: okDay(x.came), died: okDay(x.died) }), href.familiar);
    },
    "familiar-delete"() {
      deleteEntry(F.FAMILIARS, id, `Delete ${state.form?.name || "this familiar"}? Their page and notes will be deleted on every device. To keep them in memory instead, choose Remembered.`, href.familiars);
    },
    "care-add"() {
      state.form.care.push({ what: "Care", every: 7, last: "" });
      draw();
    },
    "care-suggest"(el) {
      const s = F.careSuggestions(state.form.animal).filter((x) => !state.form.care.some((c) => c.what === x.what))[Number(el.dataset.value)];
      if (s) state.form.care.push({ ...s, last: "" });
      draw();
    },
    "care-remove"(el) {
      state.form.care.splice(Number(el.dataset.value), 1);
      draw();
    },
    async "care-done"(el) {
      const entry = familiarEntry();
      await keep(F.FAMILIARS, entry, F.markCareDone(entry.data, Number(el.dataset.value), today()));
    },
    "note-new"() {
      state.extra.note = { kind: "sign", text: "" };
      draw();
    },
    "note-cancel"() {
      state.extra.note = null;
      state.form = null;
      draw();
    },
    async "note-save"() {
      const note = state.extra.note;
      if (!note.text.trim()) return;
      const entry = familiarEntry();
      state.extra.note = null;
      state.form = null;
      await keep(F.FAMILIARS, entry, { ...entry.data, notes: [{ on: today(), kind: note.kind, text: note.text.trim() }, ...entry.data.notes] });
    },
    // Spirit sessions
    method(el) {
      const s = state.form;
      const m = el.dataset.value;
      if (s.opening === SS.defaultOpening(s.method)) s.opening = SS.defaultOpening(m);
      if (s.closing === SS.defaultClosing(s.method)) s.closing = SS.defaultClosing(m);
      s.method = m;
      draw();
    },
    "who-person"(el) {
      const p = data.people.find((x) => x.id === el.dataset.value);
      if (state.form.link?.id === p.id) state.form.link = null;
      else {
        state.form.link = { kind: "ancestor", id: p.id, title: p.data.name };
        state.form.who = p.data.name;
      }
      draw();
    },
    "qa-add"() {
      state.form.exchanges.push({ q: "", a: "", check: "pending", checkNote: "" });
      draw();
    },
    "qa-remove"(el) {
      state.form.exchanges.splice(Number(el.dataset.value), 1);
      draw();
    },
    "session-save"() {
      const s = state.form;
      saveEntry(SS.SPIRIT_SESSIONS, id, SS.normalizeSession({ ...s, date: okDay(s.date) || today() }), href.session);
    },
    "session-delete"() {
      deleteEntry(SS.SPIRIT_SESSIONS, id, "Delete this session? It will be deleted on every device.", href.sessions);
    },
    async check(el) {
      const entry = sessionEntry();
      const i = Number(el.dataset.index);
      await keep(SS.SPIRIT_SESSIONS, entry, { ...entry.data, exchanges: entry.data.exchanges.map((x, j) => (j === i ? { ...x, check: el.dataset.value } : x)) });
    },
    // Challenges
    "begin-theme"(el) {
      state.extra.begin.theme = el.dataset.value;
      draw();
    },
    "begin-length"(el) {
      state.extra.begin.length = Number(el.dataset.value);
      draw();
    },
    async begin() {
      if (state.saving) return;
      state.saving = true;
      draw();
      try {
        const e = await kit.add(C.CHALLENGES, C.newChallenge(state.extra.begin.theme, state.extra.begin.length, today()));
        kit.go(href.challenge(e.id));
      } catch (error) {
        console.error(error);
        state.saving = false;
        state.problem = "It couldn’t be begun just now.";
        draw();
      }
    },
    day(el) {
      state.extra.day = Number(el.dataset.value);
      state.extra.note = undefined;
      draw();
    },
    "checkin-note"(el) {
      state.extra.note = el.value;
    },
    reflection(el) {
      state.extra.reflection = el.value;
    },
    async "check-in"() {
      const entry = challengeEntry();
      const p = C.progressOf(entry.data, new Date());
      const day = state.extra.day || Math.min(Math.max(p.day, 1), entry.data.length);
      await keep(C.CHALLENGES, entry, C.checkIn(entry.data, day, (state.extra.note || "").trim(), today()));
    },
    async uncheck() {
      const entry = challengeEntry();
      const p = C.progressOf(entry.data, new Date());
      const day = state.extra.day || Math.min(Math.max(p.day, 1), entry.data.length);
      state.extra.note = "";
      await keep(C.CHALLENGES, entry, C.uncheck(entry.data, day));
    },
    async finish() {
      const entry = challengeEntry();
      const c = entry.data;
      await keep(C.CHALLENGES, entry, { ...c, reflection: (state.extra.reflection ?? c.reflection).trim(), finished: c.finished || today() });
    },
    "challenge-delete"() {
      deleteEntry(C.CHALLENGES, id, "Delete this challenge? Its check-ins will be deleted on every device.", href.challenges);
    },
    // Numerology: only the results redraw, so typing is never interrupted.
    num(el) {
      const n = state.extra.num;
      n[el.id.slice(4)] = el.value;
      const box = root.querySelector("[data-num-results]");
      if (box) kit.render(box, numResults(N.coreNumbers(n.name, N.readBirth(n.d, n.m, n.y), n.system, new Date()), /[a-z]/i.test(n.name), n));
    },
    "num-system"(el) {
      state.extra.num.system = el.dataset.value;
      draw();
    },
    // Print
    "print-all"() {
      state.extra.picked = new Set(PB.printablePages(state.extra.grimoire).map((p) => p.page.id));
      draw();
    },
    "print-none"() {
      state.extra.picked = new Set();
      draw();
    },
    "print-group"(el) {
      const grp = groupsOfPrint()[Number(el.dataset.value)];
      const all = grp.ids.every((x) => state.extra.picked.has(x));
      grp.ids.forEach((x) => (all ? state.extra.picked.delete(x) : state.extra.picked.add(x)));
      draw();
    },
    "print-page"(el) {
      const x = el.dataset.value;
      if (state.extra.picked.has(x)) state.extra.picked.delete(x);
      else state.extra.picked.add(x);
      draw();
    },
    print() {
      const w = global.open("", "_blank");
      if (!w) {
        state.problem = "Your browser blocked the print window. Use “Download the page” and print it from there.";
        return draw();
      }
      w.document.open();
      w.document.write(printHtml());
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 600);
    },
    "print-download"() {
      kit.downloadFile(PB.printFileName(state.form.title, today()), printHtml(), "text/html");
    }
  });

  kit.start(async (who) => {
    state.user = who;
    await load();
    if (view === "grimoire-print") {
      draw();
      try {
        state.extra.grimoire = await loadGrimoire();
      } catch (error) {
        console.error(error);
        state.problem = "Your Grimoire couldn’t be opened just now. Check your connection and try again.";
      }
    }
    draw();
  });
})(window);
