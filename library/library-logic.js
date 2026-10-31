/*
 * The public Living Library (the app's More → Living Library): browse and
 * search every entry, and read one entry's page, as a guest or signed in.
 *
 * The logic is the app's own (app/src/lib/library via js/core/library.js,
 * window.SaltCore.library). The data is the website's: the Traditional
 * Library in js/traditional-library.js, guests' own notes in this browser's
 * Living Library ("saltAndSovereigntyLibrary", js/library.js), and a
 * signed-in person's living_library_entries and library_relations, read the
 * way the app reads them (app/src/lib/library/store.ts). This page only
 * reads; My Practice is written in the Book of Shadows.
 *
 * Pure apart from `load`, so it can be tested (tests/library.test.js).
 */
(function (global) {
  "use strict";

  const GUEST_LIBRARY_KEY = "saltAndSovereigntyLibrary";
  const MINE = "__mine";
  const PATH = "__path";

  const enc = encodeURIComponent;
  const isNested = (entry) => (String(entry?.id || "").split(":")[2] || "").includes(".");

  /** "traditional:herb:rosemary" (an app id, as rituals and practice pages write it) → "traditional/herb/rosemary". */
  function normalizeRef(value) {
    const text = String(value ?? "").trim();
    const colon = text.match(/^traditional:([^:/]+):([^:/]+)$/);
    if (colon && !colon[2].includes(".")) return `traditional/${colon[1]}/${colon[2]}`;
    return text;
  }

  /** What a link to an entry carries: its Traditional reference, else its app id. */
  function entryRef(entry) {
    if (!entry) return "";
    if (typeof entry === "string") return normalizeRef(entry);
    return entry.traditionalRef && !isNested(entry) ? entry.traditionalRef : entry.id;
  }

  /** The public page for an entry (an entry, a Traditional reference or an app id). */
  function entryHref(entry) {
    const ref = entryRef(entry);
    return ref ? `/library/entry/?entity=${enc(ref)}` : "/library/";
  }

  /** The same entry in the Book of Shadows, where My Practice is written (signed in). */
  function grimoireHref(entry) {
    if (!entry) return "/grimoire/";
    const ref = entry.traditionalRef && !isNested(entry) ? entry.traditionalRef : entry.practiceSourceId || entry.practiceEntityIds?.[0] || null;
    return ref ? `/grimoire/?entity=${enc(ref)}` : "/grimoire/";
  }

  /**
   * The entry an address names: a Traditional reference (either spelling), an
   * app id ("traditional:candle:styles.tea_light", "practice:<id>"), or a
   * Living Library entity id from the Book of Shadows.
   */
  function findEntry(core, entries, value) {
    const wanted = String(value ?? "").trim();
    if (!wanted) return null;
    const resolve = core.entryResolver(entries);
    const slash = wanted.match(/^traditional\/([^/]+)\/([^/]+)$/);
    return (
      resolve(wanted) ||
      resolve(normalizeRef(wanted)) ||
      (slash ? resolve(`traditional:${slash[1]}:${slash[2]}`) : null) ||
      resolve(`practice:${wanted}`) ||
      null
    );
  }

  /** The Library as this person sees it: Traditional entries, their own notes over them, hidden traditions gone. */
  function buildEntries(core, traditionalData, rows, settings) {
    const traditional = core.entriesFromData(traditionalData || {});
    return core.hideTraditions(core.libraryFrom(traditional, rows || []), core.hiddenTraditions(settings || null));
  }

  // ── Browse and search (app/src/app/(tabs)/more/library/index.tsx) ────────
  function indexModel(core, entries, settings, { query = "", filter = "all" } = {}) {
    const path = core.myPath(settings || null);
    const visible = entries.filter((entry) => core.entryVisible(entry, path));
    const onPath = core.pathEntryIds(entries, settings || null);
    const hasMine = entries.some(core.hasMyPractice);
    const options = [
      { value: "all", label: "All" },
      ...(onPath.size ? [{ value: PATH, label: path.traditions.length ? `My path (${path.traditions.map(core.pathName).join(", ")})` : "My path" }] : []),
      ...(hasMine ? [{ value: MINE, label: "My Practice" }] : []),
      ...core.LIBRARY_TYPES.map((value) => ({ value, label: core.typeLabel(value) }))
    ];
    const chosen = options.some((option) => option.value === filter) ? filter : "all";
    const results = core
      .searchLibrary(visible, query, {
        type: chosen === "all" || chosen === MINE || chosen === PATH ? null : chosen,
        mine: chosen === MINE
      })
      .filter((entry) => chosen !== PATH || onPath.has(entry.id));
    const caption = results.length === 0 ? "Nothing in the Library matches that yet." : `${results.length} ${results.length === 1 ? "entry" : "entries"}`;
    return {
      options,
      filter: chosen,
      caption,
      results: results.map((entry) => ({
        id: entry.id,
        name: entry.name,
        detail: [entry.category, core.hasMyPractice(entry) ? "My Practice" : null].filter(Boolean).join(" · "),
        href: entryHref(entry)
      }))
    };
  }

  // ── One entry (app/src/components/library/LibraryEntryView.tsx) ──────────
  const QUICK_FACTS = ["Element", "Planet", "Chakra", "Pantheon"];

  function layerData(entry, layer) {
    if (layer === "traditional") return entry.traditional;
    if (layer === "myPractice") return entry.myPractice;
    return entry.community;
  }

  function entryModel(core, entry, entries, relations, settings, { signedIn = false } = {}) {
    if (!entry) return null;
    const s = settings || null;
    const linkFor = (name) => {
      const target = core.findByName(entries, name);
      return target && target.id !== entry.id ? entryHref(target) : null;
    };
    const chipsOf = (field) =>
      field.chips
        ? field.chips.map((label, index) => ({ label, href: linkFor(field.chipNames?.[index] ?? label) }))
        : null;

    const facts = s?.library_traditional_correspondences === false ? [] : core.correspondences(entry);
    const record = entry.myPractice ? core.ritualRecord(entry.type, entry.myPractice) : null;
    const layers = core
      .visibleLayers(s)
      .map((layer) => ({
        layer,
        label: core.LAYER_LABELS[layer] || layer,
        fields: core
          .layerFields(layerData(entry, layer), layer, s, entry.layout)
          // The quick facts at the top already show these.
          .filter((field) => !(layer === "traditional" && QUICK_FACTS.includes(field.key)))
          .map((field) => ({ key: field.key, label: field.label, text: field.text, chips: chipsOf(field) }))
      }))
      .filter(({ fields }) => fields.length > 0);

    return {
      id: entry.id,
      name: entry.name,
      category: entry.category,
      type: entry.type,
      image: entry.image && /^https?:\/\//.test(entry.image) ? entry.image : null,
      intro: core.entryIntro(entry),
      facts,
      // Herbs, stones, candle colours and deities open the spell builder with them chosen (app: LibraryEntryView "Use in a spell").
      spellHref: (() => {
        const m = String(entry.traditionalRef || "").match(/^traditional\/(herb|crystal|candle|deity)\/(.+)$/);
        if (!m) return null;
        return `/rituals/spell/?${m[1] === "deity" ? `deity=${encodeURIComponent(m[2])}` : `add=${encodeURIComponent(entry.traditionalRef)}`}`;
      })(),
      deityKey: entry.type === "deity" ? (String(entry.traditionalRef || "").match(/^traditional\/deity\/([^/]+)$/) || [])[1] || null : null,
      record: record
        ? {
            facts: record.facts,
            sections: record.sections.map((section) => ({
              title: section.title,
              text: section.text,
              chips: section.chips ? section.chips.map((label) => ({ label, href: linkFor(label) })) : null
            }))
          }
        : null,
      layers: record ? [] : layers,
      empty: !record && layers.length === 0,
      connections: core.connectionGroups(entry, entries, relations || []).map((group) => ({
        label: group.label,
        entries: group.entries.map((other) => ({ label: other.name, href: entryHref(other) }))
      })),
      tags: entry.tags || [],
      hasMyPractice: core.hasMyPractice(entry),
      grimoireHref: signedIn ? grimoireHref(entry) : null,
      sourcingQuery: entry.type === "ritual" || entry.type === "ritual_template" ? null : { traditionalReference: entry.traditionalRef || null, name: entry.name }
    };
  }

  // ── Loading (browser only) ────────────────────────────────────────────────
  function readGuestLibrary(storage) {
    try {
      const raw = storage?.getItem(GUEST_LIBRARY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Everything a Library page needs. Guests: this browser's Living Library.
   * Signed in: their own living_library_entries and library_relations (read
   * only; connections are extra, so the entries load without them).
   * Resolves { entries, relations, settings, user, offline }.
   */
  async function load({ core, user, db, traditionalData, storage, getSettings }) {
    const settings = (await Promise.resolve(getSettings ? getSettings() : {}).catch(() => ({}))) || {};
    let rows = [];
    let relations = [];
    let offline = false;
    if (user && db) {
      try {
        const [practice, links] = await Promise.all([
          db
            .from("living_library_entries")
            .select("entity_id,name,type,image,my_practice,community,layout,updated_at")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false }),
          Promise.resolve(
            db.from("library_relations").select("from_entity_id,relation,to_entity_id,metadata").eq("user_id", user.id)
          ).catch(() => ({ data: null }))
        ]);
        if (practice.error) throw practice.error;
        rows = practice.data || [];
        relations = core.uniqueRelations(links?.error ? [] : links?.data || []);
      } catch {
        offline = true;
      }
    } else {
      const stored = readGuestLibrary(storage);
      rows = stored ? core.guestPracticeRows(stored) : [];
      relations = stored ? core.uniqueRelations(core.guestRelationRows(stored)) : [];
    }
    return { entries: buildEntries(core, traditionalData, rows, settings), relations, settings, user: user || null, offline };
  }

  const api = { GUEST_LIBRARY_KEY, MINE, PATH, normalizeRef, entryRef, entryHref, grimoireHref, findEntry, buildEntries, indexModel, entryModel, readGuestLibrary, load };
  global.LibraryLogic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
