(function initializeSanctuarySearch(global) {
  const GROUP_LABELS = {
    library: "Living Library",
    pages: "Book of Shadows",
    dreams: "Dreams",
    journals: "Your journals",
    divination: "Divination",
    rituals: "Rituals",
    templates: "Ritual Templates",
    apothecary: "Apothecary",
    currentAltar: "Current Altar",
    cabinet: "Altar Cabinet"
  };
  const sourceRecords = new Map();

  function text(value) {
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join(" ");
    if (value && typeof value === "object") {
      return Object.entries(value)
        .filter(([key]) => !/(^|_)(id|ids|user|image|asset|path|url)(_|$)|^(linkedEntities|linked_entities|entityIds)$/i.test(key))
        .map(([, item]) => text(item)).filter(Boolean).join(" ");
    }
    if (typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value)) return "";
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  }

  function normalize(value) {
    return String(value || "").trim().toLocaleLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  }

  function createResult(record = {}) {
    if (!record.id || !record.title || !GROUP_LABELS[record.group]) return null;
    return {
      id: String(record.id),
      group: record.group,
      source: record.source || record.group,
      type: record.type || "entry",
      entityId: record.entityId || null,
      title: String(record.title),
      aliases: (record.aliases || []).filter(Boolean).map(String),
      subtitle: record.subtitle || GROUP_LABELS[record.group],
      fields: text(record.fields),
      relationshipText: text(record.relationshipText),
      relationshipContext: record.relationshipContext || "",
      href: record.href || null,
      action: record.action || null,
      destination: record.destination ? { ...record.destination } : null,
      timestamp: record.timestamp || null,
      metadata: { ...(record.metadata || {}) }
    };
  }

  function createApothecaryResult(item = {}) {
    const typeLabel = item.typeLabel || item.type_label || item.type || "Apothecary Item";
    const title = item.name || item.title || item.displayName || item.customName || "Untitled Apothecary Item";
    const ingredientNames = (item.ingredients || []).map((ingredient) => ingredient.label || ingredient.name || ingredient.libraryName).filter(Boolean);
    const typeAliases = [typeLabel, item.type, `${typeLabel}s`, typeLabel.replaceAll("-", " ")].filter(Boolean);
    return createResult({
      id: item.id, group: "apothecary", source: "apothecary", type: item.type || "recipe", title,
      subtitle: `${typeLabel} · Apothecary`, aliases: typeAliases,
      fields: [title, item.intention, item.notes, item.tags, item.details, item.formName, ingredientNames],
      relationshipText: ingredientNames, relationshipContext: ingredientNames.length ? `Contains ${ingredientNames.slice(0, 3).join(", ")}` : "",
      action: item.action || null,
      destination: item.destination || { kind: "place-apothecary-item", itemId: item.id, href: `/altar/?placeApothecaryItem=${encodeURIComponent(item.id)}` },
      timestamp: item.updatedAt || item.updated_at || item.createdAt || item.created_at
    });
  }

  const JOURNAL_TITLES = { shadow: "Shadow work", devotion: "Deity & spirit", ancestors: "Ancestors", omens: "Omens & signs" };

  /** A practice journal entry (craft_entries `journal.<kind>`) as a result, opened on /grimoire/journals/. */
  function createJournalResult(kind, entry = {}) {
    const d = entry.data || {};
    const first = (s) => String(s || "").trim().split(/\n/)[0].slice(0, 60);
    const title = d.title || (kind === "devotion" ? d.deityName : kind === "omens" ? first(d.what) : first(d.text)) || JOURNAL_TITLES[kind] || "Journal entry";
    return createResult({
      id: `${kind}/${entry.id}`, group: "journals", source: "journals", type: "journal", title,
      subtitle: [JOURNAL_TITLES[kind], d.date, d.moonPhase].filter(Boolean).join(" · "),
      aliases: Array.isArray(d.tags) ? d.tags : [],
      fields: [d.text, d.feelings, d.trigger, d.pattern, d.integration, d.deityName, d.offered, d.signs, d.prayer, d.recipe, d.what, d.where, d.meaning, d.outcomeNote, d.tags],
      href: `/grimoire/journals/entry/?j=${encodeURIComponent(kind)}&id=${encodeURIComponent(entry.id || "")}`,
      timestamp: entry.updatedAt || entry.createdAt
    });
  }

  /** A dream (craft_entries `hedge.dreams`) as a result: its words, symbols and the moon it came under. */
  function createDreamResult(entry = {}) {
    const dream = entry.data || {};
    const moon = [dream.moonPhase, dream.moonSign].filter(Boolean).join(" in ");
    return createResult({
      id: entry.id, group: "dreams", source: "dreams", type: "dream", title: dream.title || "Untitled dream",
      subtitle: [dream.date, moon].filter(Boolean).join(" · ") || "Dream",
      aliases: Array.isArray(dream.symbols) ? dream.symbols : [],
      fields: [dream.dream, dream.feelings, dream.symbols, moon, dream.lucid ? "lucid" : "", dream.recurring ? "recurring" : ""],
      href: `/grimoire/dreams/dream/?id=${encodeURIComponent(entry.id || "")}`,
      timestamp: entry.updatedAt || entry.createdAt
    });
  }

  /**
   * Every tarot card, rune and ogham stave in the Grimoire's Traditional
   * Information, from the app's own pages (js/core/divination-library.js):
   * found by name, by its three words, and by its page.
   */
  function createDivinationResults(core) {
    if (!core || typeof core.allDivinationEntries !== "function") return [];
    return core.allDivinationEntries().map((entry) => {
      const page = core.divinationPage(entry);
      return createResult({
        id: `${entry.kind}/${entry.id}`, group: "divination", source: "divination", type: entry.kind, title: entry.name,
        subtitle: `${page.eyebrow} · ${core.wordsLine(entry.words)}`,
        aliases: [...entry.words, page.gloss].filter(Boolean),
        fields: page.sections.map((section) => section.text),
        href: core.divinationWebPath(entry)
      });
    }).filter(Boolean);
  }

  function dedupe(records = []) {
    const results = new Map();
    records.map(createResult).filter(Boolean).forEach((record) => {
      const key = `${record.group}:${record.id}`;
      if (!results.has(key)) results.set(key, record);
    });
    return [...results.values()];
  }

  function updateSource(name, records = []) {
    sourceRecords.set(name, dedupe(records));
    return getIndex();
  }

  function buildIndex(sources = {}) {
    sourceRecords.clear();
    Object.entries(sources).forEach(([name, records]) => updateSource(name, records || []));
    return getIndex();
  }

  function getIndex() {
    return dedupe([...sourceRecords.values()].flat());
  }

  function matchScore(record, query) {
    const term = normalize(query);
    if (!term) return 0;
    const title = normalize(record.title);
    const aliases = record.aliases.map(normalize);
    const fields = normalize(record.fields);
    const relationships = normalize(record.relationshipText);
    const all = normalize([record.title, ...record.aliases, record.fields, record.relationshipText].join(" "));
    if (title === term) return { score: 1000, context: "Exact title" };
    if (aliases.includes(term)) return { score: 900, context: "Alias" };
    if (title.startsWith(term)) return { score: 800, context: "Title begins with this" };
    if (new RegExp(`(^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(title)) return { score: 700, context: "Title match" };
    if (fields.includes(term)) return { score: 500, context: "Structured information" };
    if (relationships.includes(term)) return { score: 350, context: record.relationshipContext || "Connected record" };
    if (all.includes(term)) return { score: 200, context: "Related text" };
    return null;
  }

  function search(query, options = {}) {
    const filter = options.group || "all";
    return getIndex()
      .filter((record) => filter === "all" || record.group === filter)
      .map((record) => {
        const match = matchScore(record, query);
        return match ? { ...record, score: match.score, matchContext: match.context } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  }

  function rankRecords(records = [], query, options = {}) {
    const filter = options.group || "all";
    return dedupe(records).filter((record) => filter === "all" || record.group === filter).map((record) => {
      const match = matchScore(record, query);
      return match ? { ...record, score: match.score, matchContext: match.context } : null;
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  }

  function groupResults(results = []) {
    return Object.entries(GROUP_LABELS).map(([key, label]) => ({
      key, label, results: results.filter((result) => result.group === key)
    })).filter((group) => group.results.length);
  }

  function resolveDestination(result, library = global.Library) {
    if (!result) return null;
    if (result.entityId) {
      const canonicalId = library?.resolveCanonicalEntityId?.(result.entityId);
      return canonicalId ? `/grimoire/?entity=${encodeURIComponent(canonicalId)}` : null;
    }
    return result.href || null;
  }

  function getRecent(options = {}) {
    return getIndex().filter((record) => record.timestamp)
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp) || a.id.localeCompare(b.id))
      .slice(0, options.limit || 5);
  }

  function isCurrentRequest(requestId, currentRequestId, isOpen = true) {
    return Boolean(isOpen) && requestId === currentRequestId;
  }

  const api = { GROUP_LABELS, buildIndex, updateSource, getIndex, search, rankRecords, groupResults, resolveDestination, getRecent, isCurrentRequest, createResult, createApothecaryResult, createDreamResult, createJournalResult, createDivinationResults };
  global.SanctuarySearch = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
