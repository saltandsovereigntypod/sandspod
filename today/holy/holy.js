/*
 * A holy day or a moon phase, opened from Today, as the app has it
 * (app/src/app/(tabs)/today/holy/[ref].tsx): what it is, who is honoured,
 * what we know and don't, how to keep it, a working, and its correspondences.
 * Signed in, it's kept in your Grimoire the first time you open it (the same
 * rows the app's saveHolyPage writes), or linked if you already have it.
 */
(function () {
  "use strict";

  const C = window.SaltCore && window.SaltCore.today;
  const H = window.SaltCore && window.SaltCore.holy;
  const T = window.SaltToday;
  const root = document.querySelector("[data-page-root]");
  const esc = (text) => (window.SaltPage ? window.SaltPage.esc(text) : String(text ?? ""));
  if (!root) return;
  if (!C || !H || !T) {
    root.innerHTML = '<p><a class="sp-back" href="/today/">‹ Back to Today</a></p><p class="sp-notice">This page could not load. Check your connection and refresh the page.</p>';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref") || "";
  const fromToday = params.get("from") === "today";
  const page = (() => {
    try {
      return H.holy.holyPage(ref);
    } catch {
      return null;
    }
  })();

  const back = `<p><a class="sp-back" href="/today/">‹ Back to Today</a></p>`;

  if (!page) {
    // From Today, a holiday without its own page opens the calendars, as the app does.
    if (fromToday && ref && !ref.startsWith("moon-")) {
      window.location.replace("/today/calendar/");
      return;
    }
    document.title = "Not found | Salt & Sovereignty";
    root.innerHTML =
      back +
      `<header><p class="sp-eyebrow">Holy days</p><h1>Not found</h1></header>` +
      `<p>There isn’t a page for this day yet.</p>` +
      `<p class="sp-caption">See every holiday ahead in <a class="td-link" href="/today/calendar/">Calendar &amp; holidays</a>.</p>`;
    return;
  }

  document.title = `${page.title} | Salt & Sovereignty`;
  const premade = (() => {
    try {
      return page.ritual.premade ? C.premade.premadeById(page.ritual.premade) : null;
    } catch {
      return null;
    }
  })();

  let libraryEntries = null;
  function libraryLink(name) {
    try {
      if (!libraryEntries) libraryEntries = C.library.traditionalEntries();
      return T.libraryHref(C.library.findByName(libraryEntries, name));
    } catch {
      return null;
    }
  }

  const paras = (text) =>
    `<div class="td-paras">` +
    String(text || "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${esc(p)}</p>`)
      .join("") +
    `</div>`;
  const section = (label, body) => `<section class="sp-section"><h2 class="sp-label">${esc(label)}</h2>${body}</section>`;

  /** A source, with any web address in it made a link. */
  function source(text) {
    return esc(text).replace(/https?:\/\/[^\s<]+[^\s<.,;:)]/g, (url) => `<a href="${url}" rel="noopener noreferrer" target="_blank">${url}</a>`);
  }

  /** The moon as it is now: phase, sign, its name this month, and any void-of-course time today. */
  const tx = (text, skip) => (window.SaltAstroTerms ? window.SaltAstroTerms.html(text, skip ? { skip } : {}) : esc(text));
  function astroChips(ids, label) {
    const G = window.SaltCore && window.SaltCore.astro && window.SaltCore.astro.glossary;
    if (!G || !window.SaltAstroTerms) return "";
    const chips = ids.map((id) => G.term(id)).filter(Boolean).map((e) => `<button type="button" class="sp-chip" data-astro-term="${esc(e.id)}">${esc(e.term)}</button>`);
    return `<p class="sp-caption">${esc(label)}</p><div class="sp-chips">${chips.join("")}</div>`;
  }

  function moonTonight() {
    const now = new Date();
    const moon = C.moon.moonState(now);
    let name = null;
    try {
      name = C.calendars.MOON_CALENDAR.dateOf(now, { place: null, hemisphere: "north", options: {} }).long;
    } catch {
      name = null;
    }
    const voc = C.cosmicHours.vocForDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    const t = C.calendar.timeOfDay;
    return (
      `<div class="td-card"><p class="td-practice-label">Tonight</p>` +
      `<p>${tx(`${moon.name} in ${C.moon.moonSign(now)}, ${Math.round(moon.illumination * 100)}% lit`)}</p>` +
      (name ? `<p class="sp-caption">${esc(name)}</p>` : "") +
      (voc.length
        ? voc.map((v) => `<p class="sp-caption">${tx(`Void of course ${t(v.start)}–${t(v.end)}, until it enters ${v.nextSign}: traditionally a time to finish things, not begin them.`)}</p>`).join("")
        : `<p class="sp-caption">No void-of-course time today.</p>`) +
      `</div>`
    );
  }

  // Days for the dead (app/src/lib/craft/hedge/ancestors.ts ANCESTOR_HOLIDAYS, and the Deipnon) open the
  // ancestor journal; the waning and dark moon, the shadow work journal (grimoire/journals/journals.js).
  const ANCESTOR_REFS = ["wheel-samhain", "wheel_south-samhain", "celtic-samhain_gaelic", "slavic-dziady", "christian-all_hallows_eve", "christian-all_souls", "roman-parentalia", "roman-lemuria", "hellenic-anthesteria", "norse-vetrnaetur", "norse-disablot", "hellenic_monthly-deipnon"];
  function journalLinks(ref) {
    const row = (href, title, detail) => `<a class="sp-row" href="${esc(href)}"><span class="sp-row__text"><span class="sp-row__title">${esc(title)}</span><span class="sp-row__detail">${esc(detail)}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;
    if (ANCESTOR_REFS.includes(ref)) return `<div class="sp-list">${row("/grimoire/journals/journal/?j=ancestors", "Your ancestor journal", "Offerings, dreams of them, family recipes and stories")}${row("/grimoire/journals/edit/?j=ancestors&about=offering", "Write in your ancestor journal", "An offering, a dream, a recipe or a story")}</div>`;
    if (ref === "moon-dark" || ref.startsWith("moon-waning")) return `<div class="sp-list">${row("/grimoire/journals/journal/?j=shadow", "Shadow work journal", "Gentle prompts for the waning and dark moon")}</div>`;
    return "";
  }

  function render(grimoireHtml) {
    const c = page.correspondences || {};
    const groups = [
      ["Deities", c.deities],
      ["Herbs", c.herbs],
      ["Crystals", c.crystals],
      ["Colours", c.colors],
      ["Foods", c.foods],
      ["Symbols", c.symbols]
    ];
    const tags = (items) =>
      `<div class="td-tags">` +
      items
        .map((name) => {
          const href = libraryLink(name);
          return href ? `<a class="td-tag" href="${esc(href)}">${esc(name)}</a>` : `<span class="td-tag">${esc(name)}</span>`;
        })
        .join("") +
      `</div>`;

    const working =
      premade || page.ritual.outline?.length
        ? section(
            "A working",
            `<div class="td-card"><h3 class="td-card__title">${esc(page.ritual.title ?? premade?.title ?? "A working for the day")}</h3>` +
              (premade ? `<p class="sp-caption">${esc(premade.summary)}</p>` : "") +
              (page.ritual.outline?.length ? `<ol class="td-bullets">${page.ritual.outline.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : "") +
              `<div class="sp-actions">` +
              (premade ? `<a class="button button--primary" href="${esc(T.siteHref({ pathname: "/rituals/premade/[id]", params: { id: premade.id } }))}">Open the working</a>` : "") +
              `<a class="button button--ghost" href="${esc(T.siteHref("/rituals/planner"))}">Plan a ritual</a></div></div>`
          )
        : "";

    root.innerHTML =
      back +
      `<header><p class="sp-eyebrow">${esc(page.tradition)}</p><h1>${esc(page.title)}</h1></header>` +
      // Moon pages and the Wheel's solar festivals speak astrology; their terms are tappable (js/astro-terms.js).
      `<p class="td-summary">${page.ref.startsWith("moon-") || page.ref.startsWith("wheel-") ? tx(page.summary, ["venus", "mars", "mercury", "jupiter", "saturn"]) : esc(page.summary)}</p>` +
      (page.ref.startsWith("moon-") ? moonTonight() : "") +
      (page.ref.startsWith("moon-") ? astroChips(["moon-phases", "lunation", "void-of-course", "eclipse", "moon"], "The astrology behind it") : "") +
      `<p class="sp-caption" data-festival-season data-ref="${esc(page.ref)}" data-name="${esc(page.title)}" hidden></p>` +
      (page.ref.startsWith("wheel-") ? astroChips(["solstice-equinox", "sun", "cardinal", "fixed", "zodiac"], "The sky behind the Wheel") : "") +
      journalLinks(page.ref) +
      `<div data-grimoire aria-live="polite">${grimoireHtml || ""}</div>` +
      section("Who is honoured, and why", paras(page.honours)) +
      section("History", paras(page.history)) +
      (page.respect ? `<div class="sp-card sp-card--gold"><p class="td-practice-label">With respect</p>${paras(page.respect)}</div>` : "") +
      (page.celebrate.length ? section("Keeping it today", `<ul class="td-bullets">${page.celebrate.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`) : "") +
      working +
      `<div data-hearth-kitchen></div>` +
      (groups.some(([, items]) => items?.length)
        ? section(
            "Correspondences",
            groups
              .filter(([, items]) => items?.length)
              .map(([label, items]) => `<div class="td-corr"><span class="td-practice-label">${esc(label)}</span>${tags(items)}</div>`)
              .join("") + `<p class="sp-caption">Tap one the Living Library has to open it.</p>`
          )
        : "") +
      section("What we know", paras(page.knowAndDont.known)) +
      section("What we don’t", paras(page.knowAndDont.unknown)) +
      (page.sources.length ? section("Sources", `<ul class="td-sources">${page.sources.map((s) => `<li>${source(s)}</li>`).join("")}</ul>`) : "") +
      (window.ResearchNote ? window.ResearchNote.footerHtml(page.title, page.tradition || "Holy day") : "");
    // Kitchen witchery's recipes for the day (js/hearth-links.js), yours and the starters.
    window.SaltHearthLinks?.mountHoly(root.querySelector("[data-hearth-kitchen]"), page.ref);
  }

  function setGrimoire(html) {
    const slot = root.querySelector("[data-grimoire]");
    if (slot) slot.innerHTML = html;
  }

  const section_ = () => H.holy.grimoireSection(page);
  const keptCard = (pageId, savedNow) =>
    `<div class="td-card"><p class="td-practice-label">${savedNow ? "Saved to your Grimoire" : "In your Grimoire"}</p>` +
    `<p class="sp-caption">${esc(`Under ${section_()}, with room for your own notes.`)}</p>` +
    `<div class="sp-actions"><a class="button button--ghost" href="/grimoire/?page=${encodeURIComponent(pageId)}">Open the page</a></div></div>`;

  /** Kept in your Grimoire: linked if you already have it, saved the first time you open it. */
  let keeping = false;
  async function keepInGrimoire(user) {
    if (!user || !window.db) {
      setGrimoire(`<p class="sp-caption">Sign in to keep pages like this in your Grimoire, with room for your own notes.</p>`);
      return;
    }
    if (keeping) return;
    keeping = true;
    const db = window.db;
    try {
      // Row-level security limits these to your own rows.
      const [books, sections, pages] = await Promise.all([
        db.from("grimoire_books").select("id,title,created_at,updated_at").eq("user_id", user.id).order("created_at"),
        db.from("grimoire_sections").select("id,book_id,title,sort_order,created_at").eq("user_id", user.id),
        db.from("grimoire_pages").select("id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at").eq("user_id", user.id)
      ]);
      const failed = [books, sections, pages].find((r) => r.error);
      if (failed) throw failed.error;
      const existing = H.holy.findHolyGrimoirePage(pages.data || [], sections.data || [], page);
      if (existing) {
        setGrimoire(keptCard(existing.id, false));
        return;
      }
      const snapshot = { fetchedAt: new Date().toISOString(), books: books.data || [], sections: sections.data || [], pages: pages.data || [], blocks: [], links: [] };
      const { id, ops } = H.holyOps.holyPageOps(
        snapshot,
        { userId: user.id, now: new Date().toISOString() },
        { ref: page.ref, title: page.title, sectionTitle: section_(), blocks: H.holy.holyBlocks(page, premade?.title) },
        H.newId
      );
      // In order: the book, the section, the page, then its blocks.
      for (const op of ops) {
        if (op.kind !== "insert") continue;
        const { error } = await db.from(op.table).insert(op.row);
        if (error && error.code !== "23505") throw error;
      }
      setGrimoire(keptCard(id, true));
    } catch {
      setGrimoire(`<p class="sp-caption">This page couldn’t be kept in your Grimoire just now. It will try again next time you open it.</p>`);
    } finally {
      keeping = false;
    }
  }

  render("");
  window.SaltYearSeason?.fill(root, C && C.seasons);
  if (window.SaltPage) {
    window.SaltPage.ready().then(keepInGrimoire);
    window.SaltPage.onUserChange((user) => keepInGrimoire(user));
  } else {
    keepInGrimoire(null);
  }
})();
