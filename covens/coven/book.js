/*
 * A coven's Book of Shadows, on the same model as a personal grimoire: a
 * book of sections and pages written in the grimoire's own elements
 * (paragraphs, headings, lists, correspondences, images, links to other
 * pages) and templates, with the coven's own shelves (Rites, Ritual records,
 * Meeting minutes, Study material). Who may open, write in and approve each
 * part is set per book, section and page; pages someone can't open never
 * reach them. Writers edit pages directly, and each save is kept in the
 * page's history; others suggest pages and changes (or a page of their own
 * grimoire) for those who approve. The app's coven book/ screens are the
 * twin; both use the app's own rules through SaltCore.grimoire, and the
 * database decides (supabase/migrations/20261106000000_coven_grimoire.sql).
 *
 * Views, by address: ?tab=book (the contents), &page=<id> (&edit=1),
 * &new=1 (&section=<id>), &access=<kind>:<id>, &history=<page id>,
 * &queue=1 (suggestions), &suggest=1 (&for=<page id> | &section=<id> |
 * &submission=<id>) and &record=<ritual id>.
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;
  const G = () => global.SaltCore.grimoire;
  const S = () => global.SaltCore?.covens?.script;

  let pane = null;
  let state = null;
  let api = null;
  let snap = null;
  let records = [];
  let submissions = [];
  let customising = false;
  let localLayout = null;
  let sending = Promise.resolve();
  let loadedFor = null;
  let loadedAt = 0;

  const params = () => new URLSearchParams(global.location.search);
  const bookHref = (extra = "") => `${api.covenHref("book")}${extra}`;
  const nameOf = (id) => UI.nameOf(state.context, id);
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const me = () => state.context.user?.id || null;
  const viewer = () => G().coven.covenViewer({ userId: me(), perms: state.perms, standingOk: !!state.standing?.ok });
  const allows = (chain, what) => G().access.allows(viewer(), chain, what);
  const sectionOf = (id) => (id ? snap.sections.find((s) => s.id === id) || null : null);
  const canPage = (page, what) => !!page && allows(G().coven.pageChain(snap, page), what);
  const canSection = (section, what) => allows(section ? G().coven.sectionChain(snap, section) : G().coven.bookChain(snap), what);
  const canBook = (what) => allows(G().coven.bookChain(snap), what);
  const ctx = () => ({ userId: me() || "", now: new Date().toISOString() });
  const back = (label = "The coven’s book") => `<p><a class="sp-back" href="${esc(bookHref())}" data-tab="book">← ${esc(label)}</a></p>`;
  const openKey = () => `covenBook.open.${state.coven.id}`;

  async function load() {
    const [book, r, subs] = await Promise.all([D.grimoire(state.coven.id), D.ritualRecords(state.coven.id), D.bookSubmissions(state.coven.id)]);
    snap = book;
    loadedFor = state.coven.id;
    loadedAt = Date.now();
    records = r || [];
    submissions = subs || [];
    localLayout = null;
    await UI.loadNames(state.context, [
      ...snap.pages.flatMap((p) => [p.user_id, p.shared_by, p.updated_by]),
      ...records.flatMap((x) => [...(x.attendees || []), x.led_by]),
      ...submissions.flatMap((s) => [s.submitted_by, s.reviewer_id])
    ]);
  }

  // --- changes: the grimoire's operations, applied here at once and sent in order ---

  function commit(ops, status) {
    if (!ops.length) return Promise.resolve(true);
    snap = G().edits.applyOps(snap, ops);
    const run = sending.then(async () => {
      for (const op of ops) await D.grimoireOp(state.coven.id, op);
      return true;
    });
    sending = run.catch(() => {});
    return run.catch(async (error) => {
      UI.setStatus(status || pane?.querySelector("[data-status]"), L.errorMessage(error), true);
      await load();
      return false;
    });
  }

  // --- reading a page --------------------------------------------------------------

  function runsHtml(source) {
    return G()
      .richText.parseRichText(source)
      .map((run) => {
        let html = esc(run.text).replace(/\n/g, "<br />");
        if (run.bold) html = `<strong>${html}</strong>`;
        if (run.italic) html = `<em>${html}</em>`;
        if (run.underline) html = `<u>${html}</u>`;
        if (run.href && /^https?:\/\//.test(run.href)) html = `<a href="${esc(run.href)}" rel="noopener noreferrer" target="_blank">${html}</a>`;
        return html;
      })
      .join("");
  }

  function blockHtml(block) {
    const St = G().structure;
    const R = G().richText;
    const source = St.blockSource(block);
    const meta = St.blockMetadata(block);
    switch (block.block_type) {
      case "heading":
        return `<h3>${esc(R.plainText(source) || "Untitled")}</h3>`;
      case "quote":
        return `<blockquote>${runsHtml(source)}</blockquote>`;
      case "callout":
      case "correspondence":
        return `<div class="cv-grimoire-callout">${runsHtml(source)}</div>`;
      case "divider":
        return `<p class="cv-grimoire-ornament" aria-hidden="true">✦ ☽ ✦ ☾ ✦</p>`;
      case "bulleted_list":
      case "checklist":
      case "ingredient_list": {
        const items = R.listItems(source);
        return items.length ? `${block.block_type === "ingredient_list" ? "<h4>Ingredients</h4>" : ""}<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
      }
      case "numbered_list": {
        const items = R.listItems(source);
        return items.length ? `<ol>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>` : "";
      }
      case "image": {
        const url = typeof meta.url === "string" ? meta.url : R.plainText(source);
        if (!/^https:\/\//.test(url)) return "";
        return `<figure><img src="${esc(url)}" alt="${esc(meta.alt || meta.caption || "An image")}" loading="lazy" />${meta.caption ? `<figcaption>${esc(meta.caption)}</figcaption>` : ""}</figure>`;
      }
      case "page_link": {
        const target = snap.pages.find((p) => p.id === meta.target_page_id);
        if (!target) return meta.target_page_id ? `<p class="sp-caption">${esc(G().access.HIDDEN_PAGE)}</p>` : "";
        return `<p><a class="button button--ghost button--small" href="${esc(bookHref(`&page=${encodeURIComponent(target.id)}`))}" data-tab="book">Turn to ${esc(meta.label || target.title)}</a></p>`;
      }
      default:
        return R.plainText(source).trim() ? `<p>${runsHtml(source)}</p>` : "";
    }
  }

  function page(id) {
    const p = snap.pages.find((x) => x.id === id);
    if (!p) return (pane.innerHTML = `${back()}<p class="sp-notice">That page isn’t in the coven’s book, or isn’t open to you.</p>`);
    const blocks = G().structure.pageBlocks(snap, p.id);
    const links = snap.links.filter((l) => l.source_page_id === p.id);
    const section = sectionOf(p.section_id);
    const credit = G().submissions.shareCredit(p, nameOf);
    const ranks = state.ranks || [];
    const write = canPage(p, "write");
    const approve = canPage(p, "approve");
    // Where it's used: pages that link here (that you can open) and rites that read its words.
    const linkedFrom = snap.pages.filter((x) => x.id !== p.id && (snap.links.some((l) => l.source_page_id === x.id && l.target_page_id === p.id) || snap.blocks.some((b) => b.page_id === x.id && b.block_type === "page_link" && G().structure.blockMetadata(b).target_page_id === p.id)));
    const rites = (state.rituals || []).filter((r) => (state.ritualSteps || []).some((s) => s.ritual_id === r.id && s.details?.book_page_id === p.id));
    pane.innerHTML = `${back()}
      <article class="sp-section cv-grimoire-paper">
        <p class="sp-eyebrow">${esc([section?.title, G().structure.pageTypeLabel(p)].filter(Boolean).join(" · "))}</p>
        <h2>${esc(p.title)}</h2>
        <div class="cv-grimoire-page">${blocks.map(blockHtml).join("") || `<p class="sp-empty">This page is waiting for its words.</p>`}</div>
        ${links.length ? `<h4>Linked pages</h4><div class="sp-actions">${links.map((l) => {
          const t = snap.pages.find((x) => x.id === l.target_page_id);
          return t ? `<a class="button button--ghost button--small" href="${esc(bookHref(`&page=${encodeURIComponent(t.id)}`))}" data-tab="book">${esc(l.link_label || t.title)}</a>` : "";
        }).join("")}</div>` : ""}
      </article>
      <section class="sp-card">
        ${credit ? `<p>${esc(credit)}</p>` : p.user_id ? `<p class="sp-caption">Begun by ${esc(nameOf(p.user_id))}</p>` : ""}
        <p class="sp-caption">${esc(G().access.accessSummary(G().coven.pageChain(snap, p), ranks, nameOf))}${p.updated_by ? ` · last changed by ${esc(nameOf(p.updated_by))} ${esc(L.relativeTime(p.updated_at))}` : ""}</p>
        <div class="sp-actions">
          ${write ? `<a class="button button--primary button--small" href="${esc(bookHref(`&page=${encodeURIComponent(p.id)}&edit=1`))}" data-tab="book">Edit</a>` : ""}
          ${approve ? `<a class="button button--ghost button--small" href="${esc(bookHref(`&access=page:${encodeURIComponent(p.id)}`))}" data-tab="book">Who can open it</a>` : ""}
          ${write ? `<a class="button button--ghost button--small" href="${esc(bookHref(`&history=${encodeURIComponent(p.id)}`))}" data-tab="book">History</a>` : ""}
          ${!write && state.standing?.ok ? `<a class="button button--ghost button--small" href="${esc(bookHref(`&suggest=1&for=${encodeURIComponent(p.id)}`))}" data-tab="book">Suggest changes</a>` : ""}
          ${p.user_id && p.user_id !== me() ? `<button class="button button--ghost button--small" type="button" data-report-page>Report</button>` : ""}
        </div>
      </section>
      ${linkedFrom.length || rites.length ? `<section class="sp-section"><h3>Where it’s used</h3><nav class="sp-list" aria-label="Where it’s used">
        ${linkedFrom.map((x) => row(bookHref(`&page=${encodeURIComponent(x.id)}`), x.title, "A page that links here", "book")).join("")}
        ${rites.map((r) => row(`${api.covenHref("rituals")}&ritual=${encodeURIComponent(r.id)}`, r.title, r.kind === "meeting" ? "A meeting that reads its words" : "A rite that reads its words", "rituals")).join("")}
      </nav></section>` : ""}`;
    pane.querySelector("[data-report-page]")?.addEventListener("click", () => UI.report({ target_type: "book_page", target_id: p.id, coven_id: state.coven.id, target_user_id: p.user_id, label: "this page" }));
  }

  const row = (href, title, detail, tab) =>
    `<a class="sp-row" href="${esc(href)}" data-tab="${tab}"><span class="sp-row__text"><span class="sp-row__title">${esc(title)}</span>${detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""}</span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;

  // --- writing on a page: the grimoire's own elements ---------------------------------

  function editor(id) {
    const p = snap.pages.find((x) => x.id === id);
    if (!p || !canPage(p, "write")) return page(id);
    const E = G().elements;
    const M = G().markup;
    const blocks = G().structure.pageBlocks(snap, p.id);
    const links = snap.links.filter((l) => l.source_page_id === p.id);
    const others = snap.pages.filter((x) => x.id !== p.id).sort((a, b) => a.title.localeCompare(b.title));
    const field = (b) => {
      const kind = E.editorKind(b.block_type);
      const meta = G().structure.blockMetadata(b);
      if (kind === "divider") return `<p class="cv-grimoire-ornament" aria-hidden="true">✦ ☽ ✦ ☾ ✦</p>`;
      if (kind === "image")
        return `<div class="sp-grid-2"><div class="sp-field"><label>Picture address (https://)</label><input data-meta="url" value="${esc(meta.url || "")}" /></div><div class="sp-field"><label>Caption</label><input data-meta="caption" value="${esc(meta.caption || "")}" /></div></div>`;
      if (kind === "page_link")
        return `<div class="sp-field"><label>Turn to</label><select data-link-target><option value="">Choose a page</option>${others.map((o) => `<option value="${esc(o.id)}" ${meta.target_page_id === o.id ? "selected" : ""}>${esc(o.title)}</option>`).join("")}</select></div>`;
      const value = kind === "rich" ? M.htmlToMarkup(G().structure.blockSource(b)) : b.content || "";
      return `<textarea data-text rows="${Math.min(12, Math.max(2, value.split("\n").length + 1))}" aria-label="${esc(E.elementLabel(b.block_type))}">${esc(value)}</textarea>`;
    };
    pane.innerHTML = `${back("Back to the page").replace(esc(bookHref()), esc(bookHref(`&page=${encodeURIComponent(p.id)}`)))}
      <section class="sp-section cv-grimoire-editor" data-editor>
        <div class="sp-field"><label for="gp-title">Title</label><input id="gp-title" data-title maxlength="200" value="${esc(p.title)}" /></div>
        <p class="sp-caption">Write **bold**, *italic*, __underline__ and [a link](https://…) in paragraphs. Changes are saved as you go, and each save is kept in the page’s history.</p>
        ${blocks
          .map(
            (b, i) => `<div class="sp-card cv-grimoire-block" data-block="${esc(b.id)}">
              <div class="cv-inline-form"><span class="sp-eyebrow">${esc(E.elementLabel(b.block_type))}</span><span class="cv-grow"></span>
                <button type="button" class="button button--ghost button--small" data-move="up" ${i === 0 ? "disabled" : ""} aria-label="Move up">↑</button>
                <button type="button" class="button button--ghost button--small" data-move="down" ${i === blocks.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button>
                <button type="button" class="button button--ghost button--small" data-remove ${blocks.length <= 1 ? "disabled" : ""}>Remove</button>
              </div>${field(b)}</div>`
          )
          .join("")}
        <div class="sp-grid-2">
          <div class="sp-field"><label for="gp-add">Add to the page</label><select id="gp-add" data-add><option value="">Choose an element</option>${E.ELEMENT_GROUPS.map((g) => `<optgroup label="${esc(g)}">${E.ELEMENT_TYPES.filter((t) => t.group === g).map((t) => `<option value="${esc(t.type)}">${esc(t.label)}</option>`).join("")}</optgroup>`).join("")}</select></div>
          <div class="sp-field"><label for="gp-template">Add a template</label><select id="gp-template" data-template><option value="">Choose a template</option>${E.PAGE_TEMPLATES.filter((t) => t.key !== "blank").map((t) => `<option value="${esc(t.key)}">${esc(t.label)}</option>`).join("")}</select></div>
        </div>
        <h4>Linked pages</h4>
        ${links.length ? `<ul>${links.map((l) => `<li>${esc(l.link_label || snap.pages.find((x) => x.id === l.target_page_id)?.title || "A page")} <button type="button" class="button button--ghost button--small" data-unlink="${esc(l.id)}">Unlink</button></li>`).join("")}</ul>` : `<p class="sp-caption">Link pages that belong together, like a rite and the prayer it uses.</p>`}
        ${others.length ? `<div class="sp-field"><label for="gp-link">Link a page</label><select id="gp-link" data-link-page><option value="">Choose a page</option>${others.map((o) => `<option value="${esc(o.id)}">${esc(o.title)}</option>`).join("")}</select></div>` : ""}
        <div class="sp-actions">
          <a class="button button--primary" href="${esc(bookHref(`&page=${encodeURIComponent(p.id)}`))}" data-tab="book">Done</a>
          ${canPage(p, "approve") ? `<button type="button" class="button button--ghost" data-delete-page>Take it out of the book</button>` : ""}
        </div>
        ${statusLine()}
      </section>`;
    const status = pane.querySelector("[data-status]");
    const E2 = G().edits;
    const blockOf = (el) => snap.blocks.find((b) => b.id === el.closest("[data-block]")?.dataset.block);
    const redraw = () => editor(p.id);
    pane.querySelector("[data-title]").addEventListener("change", (event) => {
      const op = E2.pageTitlePatch(ctx(), snap.pages.find((x) => x.id === p.id), event.target.value);
      if (op) commit([op], status).then((ok) => ok && UI.setStatus(status, "Saved."));
    });
    pane.querySelectorAll("[data-text]").forEach((el) =>
      el.addEventListener("change", () => {
        const b = blockOf(el);
        if (b) commit([E2.blockTextPatch(ctx(), b, el.value)], status).then((ok) => ok && UI.setStatus(status, "Saved."));
      })
    );
    pane.querySelectorAll("[data-meta]").forEach((el) =>
      el.addEventListener("change", () => {
        const b = blockOf(el);
        if (b) commit([E2.blockMetadataPatch(ctx(), b, { [el.dataset.meta]: el.value.trim() })], status).then((ok) => ok && UI.setStatus(status, "Saved."));
      })
    );
    pane.querySelectorAll("[data-link-target]").forEach((el) =>
      el.addEventListener("change", () => {
        const b = blockOf(el);
        const target = snap.pages.find((x) => x.id === el.value);
        if (b && target) commit([E2.blockMetadataPatch(ctx(), b, { target_page_id: target.id, label: target.title })], status).then((ok) => ok && UI.setStatus(status, "Saved."));
      })
    );
    pane.querySelectorAll("[data-move]").forEach((el) =>
      el.addEventListener("click", async () => {
        const b = blockOf(el);
        if (!b) return;
        await commit(E2.sortOrderOps("grimoire_blocks", E2.reorder(G().structure.pageBlocks(snap, p.id), b.id, el.dataset.move)), status);
        redraw();
      })
    );
    pane.querySelectorAll("[data-remove]").forEach((el) =>
      el.addEventListener("click", async () => {
        const b = blockOf(el);
        if (!b || !(await UI.confirmAction(`Remove this ${E.elementLabel(b.block_type).toLowerCase()}?`, "It will be taken off the page.", "Remove"))) return;
        await commit([E2.deleteOp("grimoire_blocks", b.id)], status);
        redraw();
      })
    );
    pane.querySelector("[data-add]").addEventListener("change", async (event) => {
      if (!event.target.value) return;
      await commit([E2.blockInsert(snap, ctx(), { id: G().newId(), page: snap.pages.find((x) => x.id === p.id), type: event.target.value })], status);
      redraw();
    });
    pane.querySelector("[data-template]").addEventListener("change", async (event) => {
      const t = E.PAGE_TEMPLATES.find((x) => x.key === event.target.value);
      if (!t || !(await UI.confirmAction(`Add the ${t.label} template?`, "Its sections will be added to the end of this page. Nothing already here is removed.", "Add template"))) return;
      await commit(E2.templateAppend(snap, ctx(), { page: snap.pages.find((x) => x.id === p.id), templateKey: t.key }, G().newId), status);
      redraw();
    });
    pane.querySelector("[data-link-page]")?.addEventListener("change", async (event) => {
      const target = snap.pages.find((x) => x.id === event.target.value);
      if (!target) return;
      await commit([E2.pageLinkInsert(ctx(), { id: G().newId(), source: snap.pages.find((x) => x.id === p.id), target })], status);
      redraw();
    });
    pane.querySelectorAll("[data-unlink]").forEach((el) =>
      el.addEventListener("click", async () => {
        await commit([E2.deleteOp("grimoire_page_links", el.dataset.unlink)], status);
        redraw();
      })
    );
    pane.querySelector("[data-delete-page]")?.addEventListener("click", async () => {
      if (!(await UI.confirmAction(`Take “${p.title}” out of the book?`, "It’s removed for everyone, with its history.", "Take it out"))) return;
      if (await commit([E2.deleteOp("grimoire_pages", p.id)], status)) navigate(bookHref());
    });
  }

  function newPage(sectionId) {
    const E = G().elements;
    const places = snap.sections.filter((s) => canSection(s, "write"));
    const loose = canBook("write");
    if (!places.length && !loose) return suggest({ sectionId });
    pane.innerHTML = `${back()}
      <form class="sp-section" data-new-page>
        <h2>A new page</h2>
        <div class="sp-card">
          <div class="sp-field"><label for="np-title">Name</label><input id="np-title" name="title" maxlength="200" placeholder="Untitled Page" required /></div>
          <div class="sp-field"><label for="np-section">Section</label><select id="np-section" name="section">${loose ? `<option value="">No section</option>` : ""}${places.map((s) => `<option value="${esc(s.id)}" ${s.id === sectionId ? "selected" : ""}>${esc(s.title)}</option>`).join("")}</select></div>
          <div class="sp-field"><label for="np-template">Begin with</label><select id="np-template" name="template">${E.PAGE_TEMPLATES.map((t) => `<option value="${esc(t.key)}">${esc(t.label)}</option>`).join("")}</select></div>
          <div class="sp-actions"><button class="button button--primary" type="submit">Create page</button></div>
          ${statusLine()}
        </div>
      </form>`;
    const form = pane.querySelector("[data-new-page]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = G().newId();
      const ops = G().edits.pageInsert(snap, ctx(), { id, bookId: snap.books[0].id, sectionId: form.elements.section.value || null, title: form.elements.title.value, templateKey: form.elements.template.value }, G().newId);
      if (await commit(ops, form.querySelector("[data-status]"))) navigate(bookHref(`&page=${encodeURIComponent(id)}&edit=1`));
    });
  }

  // --- the contents: arranged for everyone, open and closed for you ------------------

  function readOpen() {
    try {
      return JSON.parse(global.localStorage.getItem(openKey()) || "{}") || {};
    } catch {
      return {};
    }
  }

  function contents() {
    const Lt = G().layout;
    const C = G().coven;
    const layout = localLayout || Lt.parseLayout(snap.books[0]?.layout);
    const open = readOpen();
    const known = new Set(snap.sections.map((s) => s.id));
    const loose = snap.pages.filter((p) => !p.section_id || !known.has(p.section_id));
    const parts = C.covenParts({ sections: snap.sections, loose: loose.length > 0 });
    const items = Lt.arrangeHome({ ...layout, open: { ...layout.open, ...open } }, parts, { withHidden: customising });
    const arrange = canBook("approve");
    const writeSomewhere = canBook("write") || snap.sections.some((s) => canSection(s, "write"));
    const waiting = submissions.filter((s) => s.status === "pending" && s.submitted_by !== me()).length;
    const mine = submissions.filter((s) => s.submitted_by === me() && s.status !== "approved").length;
    const unsavedRites = C.unsavedRecords(records, snap.pages, "rite");
    const unsavedMeetings = C.unsavedRecords(records, snap.pages, "meeting");
    const kinds = Lt.pageKinds(snap.pages);
    const recordRow = (r) => {
      const date = r.held_at || r.ended_at;
      const detail = [date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "", S() ? S().recordMoon(r) : "", `${(r.attendees || []).length} there`].filter(Boolean).join(" · ");
      return row(bookHref(`&record=${encodeURIComponent(r.ritual_id)}`), r.title, detail, "book");
    };
    const partHtml = (item, index) => {
      const sectionId = Lt.sectionIdOf(item.key);
      const section = sectionOf(sectionId);
      const shelf = C.shelfOf(section);
      const list = Lt.shownPages(section ? snap.pages.filter((p) => p.section_id === section.id) : loose, layout);
      const extra = shelf === "records" ? unsavedRites : shelf === "minutes" ? unsavedMeetings : [];
      const writeHere = canSection(section, "write");
      const approveHere = canSection(section, "approve");
      const note = shelf ? C.COVEN_SHELVES.find((s) => s.shelf === shelf)?.note : "";
      const custom = layout.sort === "custom" && !layout.kind;
      return `<section class="sp-section cv-grimoire-part ${item.hidden ? "is-layout-hidden" : ""}" data-part="${esc(item.key)}">
        <button type="button" class="cv-grimoire-part__title" data-toggle-part aria-expanded="${item.open}"><span>${item.open ? "▾" : "▸"} ${esc(item.title)}${item.hidden ? " · hidden" : ""}</span><span class="sp-caption">${list.length + extra.length}</span></button>
        ${customising ? `<div class="sp-actions cv-grimoire-controls">
          ${arrange ? `<button type="button" class="button button--ghost button--small" data-part-move="up" ${index === 0 ? "disabled" : ""} aria-label="Move ${esc(item.title)} up">↑</button>
          <button type="button" class="button button--ghost button--small" data-part-move="down" ${index === items.length - 1 ? "disabled" : ""} aria-label="Move ${esc(item.title)} down">↓</button>
          <button type="button" class="button button--ghost button--small" data-part-hide>${item.hidden ? "Show" : "Hide"}</button>` : ""}
          ${(section && writeHere) || (!section && arrange) ? `<button type="button" class="button button--ghost button--small" data-part-rename>Rename</button>` : ""}
          ${section && approveHere ? `<a class="button button--ghost button--small" href="${esc(bookHref(`&access=section:${encodeURIComponent(section.id)}`))}" data-tab="book">Who can open it</a>` : ""}
          ${writeHere ? `<a class="button button--ghost button--small" href="${esc(bookHref(`&new=1${section ? `&section=${encodeURIComponent(section.id)}` : ""}`))}" data-tab="book">Add a page</a>` : ""}
          ${section && approveHere && !shelf ? `<button type="button" class="button button--ghost button--small" data-part-remove>Remove section</button>` : ""}
        </div>` : ""}
        ${item.open ? `${note ? `<p class="sp-caption">${esc(note)}</p>` : ""}
          ${list.length ? `<nav class="sp-list" aria-label="${esc(item.title)}">${list.map((p) => `<div class="cv-grimoire-row">${row(bookHref(`&page=${encodeURIComponent(p.id)}`), p.title, [G().structure.pageTypeLabel(p), p.shared_by ? `shared by ${nameOf(p.shared_by)}` : ""].filter(Boolean).join(" · "), "book")}
            ${customising && writeHere && custom ? `<span class="cv-grimoire-row__moves"><button type="button" data-page-move="up" data-page="${esc(p.id)}" aria-label="Move ${esc(p.title)} up">↑</button><button type="button" data-page-move="down" data-page="${esc(p.id)}" aria-label="Move ${esc(p.title)} down">↓</button></span>` : ""}
            ${customising && canPage(p, "write") ? `<select class="cv-grimoire-file" data-file-page="${esc(p.id)}" aria-label="File ${esc(p.title)} in a section">${canBook("write") ? `<option value="">No section</option>` : ""}${snap.sections.filter((s) => canSection(s, "write")).map((s) => `<option value="${esc(s.id)}" ${p.section_id === s.id ? "selected" : ""}>${esc(s.title)}</option>`).join("")}</select>` : ""}
          </div>`).join("")}</nav>` : !extra.length ? `<p class="sp-empty">No pages here yet.${writeHere ? "" : " You can suggest one."}</p>` : ""}
          ${extra.length ? `<p class="sp-caption">${shelf === "minutes" ? "Meetings kept by the coven, not yet written up here" : "Rites kept by the coven, not yet written up here"}</p><nav class="sp-list">${extra.slice(0, 40).map(recordRow).join("")}</nav>` : ""}` : ""}
      </section>`;
    };
    pane.innerHTML = `<p>The coven’s shared grimoire, written with the same pages, templates and links as your own. Your own grimoire stays private.</p>
      <div class="sp-actions">
        ${writeSomewhere ? `<a class="button button--primary" href="${esc(bookHref("&new=1"))}" data-tab="book">✦ New page</a>` : state.standing?.ok ? `<a class="button button--primary" href="${esc(bookHref("&suggest=1"))}" data-tab="book">Suggest a page</a>` : ""}
        ${waiting || mine ? `<a class="button button--ghost" href="${esc(bookHref("&queue=1"))}" data-tab="book">${[waiting ? `Waiting for approval (${waiting})` : "", mine ? `Your suggestions (${mine})` : ""].filter(Boolean).join(" · ")}</a>` : ""}
        <button type="button" class="button button--ghost" data-customise>${customising ? "Done" : "Customise"}</button>
      </div>
      ${customising ? `<div class="sp-card">
        <p class="sp-caption">${arrange ? "Move, hide and rename the parts of the coven’s book, for everyone. What’s open or closed is yours." : "Only those who approve for the whole book arrange it. You can file and order pages where you write."}</p>
        <div class="sp-grid-2">
          <div class="sp-field"><label for="cg-sort">Pages in order of</label><select id="cg-sort" data-sort>${Lt.PAGE_SORTS.map((s) => `<option value="${s.value}" ${layout.sort === s.value ? "selected" : ""}>${esc(s.label)}</option>`).join("")}</select></div>
          ${kinds.length > 1 ? `<div class="sp-field"><label for="cg-kind">Show</label><select id="cg-kind" data-kind><option value="">Every page</option>${kinds.map((k) => `<option value="${esc(k.kind)}" ${layout.kind === k.kind ? "selected" : ""}>${esc(k.label)} (${k.count})</option>`).join("")}</select></div>` : ""}
        </div>
        <div class="sp-actions">
          ${arrange ? `<button type="button" class="button button--ghost button--small" data-reset>Back to the default</button>
          <a class="button button--ghost button--small" href="${esc(bookHref(`&access=book:${encodeURIComponent(snap.books[0].id)}`))}" data-tab="book">Who can open the whole book</a>` : ""}
        </div>
        ${canBook("write") ? `<form class="cv-inline-form" data-new-section><div class="sp-field cv-grow"><label for="cg-section">A new section</label><input id="cg-section" name="title" maxlength="120" placeholder="Hekate, Herbal lore, Initiation…" /></div><button class="button button--ghost button--small" type="submit">Add</button></form>` : ""}
      </div>` : ""}
      <div class="sp-field"><label for="cg-search">Search the coven’s book</label><input id="cg-search" type="search" data-search placeholder="Opening prayer, Beltane, minutes…" /></div>
      <div data-parts>${items.map(partHtml).join("")}</div>
      ${statusLine()}`;
    wireContents(layout, parts, items);
  }

  function wireContents(layout, parts, items) {
    const Lt = G().layout;
    const status = pane.querySelector("[data-status]");
    const arrange = canBook("approve");
    const save = (next) => {
      localLayout = next;
      contents();
      if (arrange) D.setBookLayout(snap.books[0].id, next).catch((error) => UI.setStatus(pane.querySelector("[data-status]"), L.errorMessage(error), true));
    };
    pane.querySelector("[data-customise]").addEventListener("click", () => {
      customising = !customising;
      contents();
    });
    pane.querySelector("[data-sort]")?.addEventListener("change", (e) => save(Lt.setPageSort(layout, e.target.value)));
    pane.querySelector("[data-kind]")?.addEventListener("change", (e) => save(Lt.setPageKind(layout, e.target.value || null)));
    pane.querySelector("[data-reset]")?.addEventListener("click", () => save(Lt.resetHome(layout)));
    pane.querySelector("[data-new-section]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const title = event.currentTarget.elements.title.value.trim();
      if (!title) return;
      if (await commit([G().edits.sectionInsert(snap, ctx(), { id: G().newId(), bookId: snap.books[0].id, title })], status)) contents();
    });
    pane.querySelector("[data-search]").addEventListener("input", (event) => {
      const q = event.target.value.trim().toLowerCase();
      pane.querySelectorAll("[data-part]").forEach((part) => {
        let any = false;
        part.querySelectorAll(".sp-row").forEach((r) => {
          const hit = !q || r.textContent.toLowerCase().includes(q);
          (r.closest(".cv-grimoire-row") || r).hidden = !hit;
          any = any || hit;
        });
        part.hidden = Boolean(q) && !any;
      });
    });
    pane.querySelectorAll("[data-part]").forEach((el) => {
      const key = el.dataset.part;
      const item = items.find((i) => i.key === key);
      const section = sectionOf(Lt.sectionIdOf(key));
      el.querySelector("[data-toggle-part]").addEventListener("click", () => {
        const open = readOpen();
        open[key] = !item.open;
        try {
          global.localStorage.setItem(openKey(), JSON.stringify(open));
        } catch {
          // Private browsing: open for now only.
        }
        contents();
      });
      el.querySelectorAll("[data-part-move]").forEach((b) => b.addEventListener("click", () => save(Lt.moveHomePart(layout, parts, key, b.dataset.partMove))));
      el.querySelector("[data-part-hide]")?.addEventListener("click", () => save(Lt.setPartHidden(layout, key, !item.hidden)));
      el.querySelector("[data-part-rename]")?.addEventListener("click", async () => {
        const name = await UI.askText("A new name", "Name", "Rename");
        if (!name) return;
        if (section) {
          const op = G().edits.sectionRename(ctx(), section, name);
          if (op && (await commit([op], status))) contents();
        } else save(Lt.renamePart(layout, key, name, item.defaultTitle));
      });
      el.querySelector("[data-part-remove]")?.addEventListener("click", async () => {
        if (!(await UI.confirmAction(`Remove “${section.title}”?`, "Its pages stay in the book, without a section.", "Remove section"))) return;
        if (await commit([G().edits.deleteOp("grimoire_sections", section.id)], status)) contents();
      });
      el.querySelectorAll("[data-page-move]").forEach((b) =>
        b.addEventListener("click", async () => {
          const p = snap.pages.find((x) => x.id === b.dataset.page);
          const siblings = snap.pages.filter((x) => (x.section_id || null) === (p.section_id || null)).sort((a, c) => (a.sort_order || 0) - (c.sort_order || 0) || String(a.created_at).localeCompare(String(c.created_at)));
          if (await commit(G().edits.sortOrderOps("grimoire_pages", G().edits.reorder(siblings, p.id, b.dataset.pageMove)), status)) contents();
        })
      );
      el.querySelectorAll("[data-file-page]").forEach((s) =>
        s.addEventListener("change", async () => {
          const p = snap.pages.find((x) => x.id === s.dataset.filePage);
          const op = G().edits.pageSectionPatch(snap, ctx(), p, s.value || null);
          if (op && (await commit([op], status))) contents();
        })
      );
    });
  }

  // --- who can open it ------------------------------------------------------------------

  async function accessView(spec) {
    const A = G().access;
    const [kind, id] = String(spec).split(":");
    const target = kind === "book" ? snap.books[0] : kind === "section" ? sectionOf(id) : snap.pages.find((p) => p.id === id);
    if (!target) return (pane.innerHTML = `${back()}<p class="sp-notice">That part of the book isn’t here, or isn’t open to you.</p>`);
    const chain = kind === "page" ? G().coven.pageChain(snap, target) : kind === "section" ? G().coven.sectionChain(snap, target) : G().coven.bookChain(snap);
    const may = kind === "page" ? canPage(target, "approve") : kind === "section" ? canSection(target, "approve") : canBook("approve");
    let access = A.cleanAccess(chain[0]);
    const above = chain.slice(1);
    const P = global.SaltCore?.covens?.picker;
    const members = await D.members(state.coven.id).catch(() => []);
    await UI.loadNames(state.context, members.map((m) => m.user_id));
    const entries = P.whoEntries(state.ranks || [], members.filter((m) => m.status === "active").map((m) => ({ id: m.user_id, name: nameOf(m.user_id) })));
    const NOTES = {
      view: "Only those named here see it at all: it’s left out of the contents, searches, links and the ritual builder for everyone else.",
      write: "They edit it directly. No one writes in what they can’t open.",
      approve: "They decide what members suggest for it, and choose who can open it."
    };
    const draw = () => {
      pane.innerHTML = `${back()}<h2>Who can open it</h2>
        <p><strong>${esc(kind === "book" ? "The whole book" : target.title)}</strong></p>
        <p class="sp-caption">The coven’s head and the site’s moderators can always open, write in and approve everything.</p>
        ${A.ACCESS_WHATS.map((what) => {
          const set = Boolean(access[what]);
          const inherited = A.ruleFor(above, what);
          return `<section class="sp-card" data-what="${what}">
            <p class="sp-eyebrow">${esc(A.WHAT_LABEL[what])}</p>
            <p class="sp-caption">${esc(NOTES[what])}</p>
            ${may ? `<div class="cv-inline-form"><label><input type="radio" name="w-${what}" value="above" ${set ? "" : "checked"} /> ${esc(kind === "book" ? "The coven’s own powers" : kind === "section" ? "As the whole book" : "As its section")}</label>
              <label><input type="radio" name="w-${what}" value="here" ${set ? "checked" : ""} /> Chosen here</label></div>` : ""}
            ${set ? (may ? `<div data-picker="${what}"></div>` : `<p>${esc(A.ruleLabel(access[what], what, state.ranks || [], nameOf))}</p>`) : `<p>${esc(A.ruleLabel(inherited.list, what, state.ranks || [], nameOf))} <span class="sp-caption">(${esc(A.ruleSource(inherited.from, kind).toLowerCase())})</span></p>`}
          </section>`;
        }).join("")}
        ${may ? `<div class="sp-actions"><button type="button" class="button button--primary" data-save-access>Save</button></div>` : `<p class="sp-caption">Only those who approve for this part of the book choose who can open it.</p>`}
        ${statusLine()}`;
      A.ACCESS_WHATS.forEach((what) => {
        pane.querySelectorAll(`input[name="w-${what}"]`).forEach((r) =>
          r.addEventListener("change", () => {
            access = A.setRule(access, what, r.value === "here" ? A.ruleFor(above, what).list || [{ kind: "coven", id: "coven" }] : null);
            draw();
          })
        );
        const holder = pane.querySelector(`[data-picker="${what}"]`);
        if (holder && global.CovenPicker)
          global.CovenPicker.create(holder, {
            id: `access-${what}`,
            label: "Who",
            placeholder: "Whole coven, Elder, Rowan…",
            empty: "Only the coven’s head.",
            chips: () => (access[what] || []).map((a) => ({ key: P.assigneeKey(a), label: P.assigneeLabel(a, state.ranks || [], nameOf) })),
            search: (q, picked) => P.searchEntries(entries, q, { limit: 8, picked, suggestions: P.whoSuggestions(entries, 4) }),
            onAdd: (entry) => (access = A.setRule(access, what, P.cleanAssignees([...(access[what] || []), P.assigneeFromKey(entry.key)]))),
            onRemove: (key) => (access = A.setRule(access, what, (access[what] || []).filter((a) => P.assigneeKey(a) !== key)))
          });
      });
      pane.querySelector("[data-save-access]")?.addEventListener("click", async (event) => {
        if (await UI.busy(event.currentTarget, pane.querySelector("[data-status]"), () => D.setBookAccess(kind, target.id, access).then(() => true), { done: "Saved." })) await load();
      });
    };
    draw();
  }

  // --- a page's history --------------------------------------------------------------------

  async function history(pageId, versionId) {
    const p = snap.pages.find((x) => x.id === pageId);
    if (!p || !canPage(p, "write")) return (pane.innerHTML = `${back()}<p class="sp-notice">Only those who write in this page see its history.</p>`);
    const versions = await D.pageVersions(pageId).catch(() => []);
    await UI.loadNames(state.context, versions.map((v) => v.saved_by));
    const rows = G().history.historyRows(versions);
    const shown = versionId ? versions.find((v) => v.id === versionId) : null;
    const pageLink = bookHref(`&page=${encodeURIComponent(p.id)}`);
    if (shown) {
      const blocks = G().history.versionBlockRows(shown);
      pane.innerHTML = `<p><a class="sp-back" href="${esc(bookHref(`&history=${encodeURIComponent(p.id)}`))}" data-tab="book">← The history</a></p>
        <p class="sp-caption">${esc(nameOf(shown.saved_by))} · ${esc(new Date(shown.saved_at).toLocaleString())}</p>
        <article class="sp-section cv-grimoire-paper"><h2>${esc(shown.title)}</h2><div class="cv-grimoire-page">${blocks.map(blockHtml).join("")}</div></article>
        ${shown.id !== rows[0]?.version.id ? `<div class="sp-actions"><button type="button" class="button button--primary" data-restore>Put this version back</button></div>` : ""}${statusLine()}`;
      pane.querySelector("[data-restore]")?.addEventListener("click", async (event) => {
        if (!(await UI.confirmAction("Put this version back?", "The page becomes this version. The page as it is now stays in its history.", "Put it back"))) return;
        if (await UI.busy(event.currentTarget, pane.querySelector("[data-status]"), () => D.restoreVersion(shown.id).then(() => true))) {
          await load();
          navigate(pageLink);
        }
      });
      return;
    }
    pane.innerHTML = `<p><a class="sp-back" href="${esc(pageLink)}" data-tab="book">← ${esc(p.title)}</a></p><h2>History</h2>
      ${rows.length ? `<nav class="sp-list" aria-label="Versions">${rows.map(({ version, line }, i) => row(bookHref(`&history=${encodeURIComponent(p.id)}&version=${encodeURIComponent(version.id)}`), `${nameOf(version.saved_by)} · ${L.relativeTime(version.saved_at)}`, i === 0 ? `${line} · as it is now` : line, "book")).join("")}</nav>` : `<p class="sp-empty">No versions are kept yet. One is kept each time the page is saved.</p>`}`;
  }

  // --- suggestions -------------------------------------------------------------------------

  function queue() {
    const Sb = G().submissions;
    const approves = (s) => (s.page_id ? canPage(snap.pages.find((p) => p.id === s.page_id), "approve") : canSection(sectionOf(s.section_id), "approve"));
    const waiting = submissions.filter((s) => s.status === "pending" && s.submitted_by !== me() && approves(s));
    const mine = submissions.filter((s) => s.submitted_by === me());
    const card = (s) => {
      const current = s.page_id ? snap.pages.find((p) => p.id === s.page_id) : null;
      const places = snap.sections.filter((x) => canSection(x, "approve"));
      return `<article class="sp-card" data-submission="${esc(s.id)}">
        <p class="sp-eyebrow">${esc(Sb.submissionLine(s, nameOf, current ? `“${current.title}”` : sectionOf(s.section_id)?.title))}</p>
        <div class="sp-field"><label>Title</label><input name="title" maxlength="200" value="${esc(s.title)}" /></div>
        ${s.note ? `<p>Their note: ${esc(s.note)}</p>` : ""}
        ${!s.page_id && places.length ? `<div class="sp-field"><label>Where it goes</label><select name="section">${canBook("approve") ? `<option value="">No section</option>` : ""}${places.map((x) => `<option value="${esc(x.id)}" ${x.id === s.section_id ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select></div>` : ""}
        <div class="cv-grimoire-paper cv-grimoire-page" data-preview>${G().history.versionBlockRows({ page_id: s.id, blocks: s.blocks }).map(blockHtml).join("")}</div>
        <details class="sp-details"><summary>Edit before approving</summary>
          ${s.blocks.map((b, i) => (Sb.editableBlock(b) ? `<div class="sp-field"><label>${b.block_type === "heading" ? "Heading" : "Words"}</label><textarea data-edit="${i}" rows="3">${esc(Sb.blockMarkup(b))}</textarea></div>` : "")).join("")}
        </details>
        ${current ? `<details class="sp-details"><summary>The page as it is now</summary><div class="cv-grimoire-page">${G().structure.pageBlocks(snap, current.id).map(blockHtml).join("")}</div></details>` : ""}
        <div class="sp-field"><label>Note to them</label><textarea name="note" maxlength="2000" rows="2"></textarea></div>
        <div class="sp-actions">
          <button type="button" class="button button--primary button--small" data-decide="approve">Approve</button>
          <button type="button" class="button button--ghost button--small" data-decide="return">Send back with a note</button>
          <button type="button" class="button button--ghost button--small" data-decide="decline">Decline</button>
        </div>${statusLine()}
      </article>`;
    };
    pane.innerHTML = `${back()}
      <section class="sp-section"><h2>Waiting for your approval</h2>${waiting.length ? waiting.map(card).join("") : `<p class="sp-empty">Nothing is waiting for you.</p>`}</section>
      <section class="sp-section"><h2>Your suggestions</h2>${mine.length ? mine.map((s) => `<article class="sp-card" data-mine="${esc(s.id)}">
          <h3>${esc(s.title)}</h3>
          <p class="sp-caption">${esc(Sb.STATUS_LABEL[s.status])} · ${esc(L.relativeTime(s.submitted_at || s.updated_at))}${sectionOf(s.section_id) ? ` · for ${esc(sectionOf(s.section_id).title)}` : ""}</p>
          ${s.reviewer_note ? `<p>${esc(nameOf(s.reviewer_id))} said: ${esc(s.reviewer_note)}</p>` : ""}
          <div class="sp-actions">
            ${s.status === "approved" && s.published_page_id ? `<a class="button button--ghost button--small" href="${esc(bookHref(`&page=${encodeURIComponent(s.published_page_id)}`))}" data-tab="book">Open the page</a>` : ""}
            ${Sb.canEditSubmission(s, me()) ? `<a class="button button--ghost button--small" href="${esc(bookHref(`&suggest=1&submission=${encodeURIComponent(s.id)}`))}" data-tab="book">Change and send again</a>` : ""}
            ${s.status !== "approved" ? `<button type="button" class="button button--ghost button--small" data-take-back>Take it back</button>` : ""}
          </div>${statusLine()}</article>`).join("") : `<p class="sp-empty">You haven’t suggested anything. Any page of your own Book of Shadows can be suggested to the coven from the page.</p>`}</section>`;
    pane.querySelectorAll("[data-submission]").forEach((el) => {
      const s = submissions.find((x) => x.id === el.dataset.submission);
      el.querySelectorAll("[data-decide]").forEach((button) =>
        button.addEventListener("click", async () => {
          const decision = button.dataset.decide;
          const note = el.querySelector('[name="note"]').value;
          if (decision === "return" && !note.trim()) return UI.setStatus(el.querySelector("[data-status]"), "Say what to change, so they know.", true);
          const edits = {};
          el.querySelectorAll("[data-edit]").forEach((t) => {
            const i = Number(t.dataset.edit);
            if (t.value !== Sb.blockMarkup(s.blocks[i])) edits[i] = t.value;
          });
          const title = el.querySelector('[name="title"]').value;
          const sectionId = el.querySelector('[name="section"]')?.value;
          const changes = decision !== "approve" ? {} : { ...(Object.keys(edits).length || title !== s.title ? { title, blocks: Sb.editedBlocks(s.blocks, edits) } : {}), ...(sectionId !== undefined && sectionId !== (s.section_id || "") ? { sectionId: sectionId || null } : {}) };
          if (await UI.busy(button, el.querySelector("[data-status]"), () => D.reviewSubmission(s.id, decision, note, changes).then(() => true))) {
            await load();
            queue();
          }
        })
      );
    });
    pane.querySelectorAll("[data-mine] [data-take-back]").forEach((button) =>
      button.addEventListener("click", async () => {
        const id = button.closest("[data-mine]").dataset.mine;
        if (!(await UI.confirmAction("Take this suggestion back?", "It’s removed, and no one is asked to approve it.", "Take it back"))) return;
        if (await UI.busy(button, button.closest("[data-mine]").querySelector("[data-status]"), () => D.removeSubmission(id).then(() => true))) {
          await load();
          queue();
        }
      })
    );
  }

  function suggest({ pageId, sectionId, submissionId } = {}) {
    const Sb = G().submissions;
    const own = submissionId ? submissions.find((s) => s.id === submissionId && s.submitted_by === me()) : null;
    const p = snap.pages.find((x) => x.id === (own?.page_id || pageId)) || null;
    const base = own ? own.blocks : p ? Sb.submissionBlocks(G().structure.pageBlocks(snap, p.id)) : [];
    const fromBlocks = Boolean(p || own);
    const places = snap.sections.filter((s) => canSection(s, "view"));
    pane.innerHTML = `${back()}
      <form class="sp-section" data-suggest>
        <h2>${p ? "Suggest changes" : "Suggest a page"}</h2>
        <p>${p ? `Your changes to “${esc(p.title)}” go to those who approve it. The page stays as it is until they do.` : "Your page goes to those who approve that part of the coven’s book."}</p>
        <div class="sp-card">
          <div class="sp-field"><label for="sg-title">Title</label><input id="sg-title" name="title" maxlength="200" required value="${esc(own?.title || p?.title || "")}" /></div>
          ${!p && places.length ? `<div class="sp-field"><label for="sg-section">Where it goes</label><select id="sg-section" name="section"><option value="">No section</option>${places.map((s) => `<option value="${esc(s.id)}" ${s.id === (own?.section_id || sectionId) ? "selected" : ""}>${esc(s.title)}</option>`).join("")}</select></div>` : ""}
          ${fromBlocks
            ? base.map((b, i) => (Sb.editableBlock(b) ? `<div class="sp-field"><label>${b.block_type === "heading" ? "Heading" : "Words"}</label><textarea data-edit="${i}" rows="3">${esc(Sb.blockMarkup(b))}</textarea></div>` : "")).join("")
            : `<div class="sp-field"><label for="sg-body">The page</label><textarea id="sg-body" name="body" rows="14" maxlength="40000" placeholder="Leave a blank line between paragraphs. A line in capitals becomes a heading."></textarea></div>`}
          <div class="sp-field"><label for="sg-note">A note for those who approve (optional)</label><textarea id="sg-note" name="note" rows="2" maxlength="2000">${esc(own?.note || "")}</textarea></div>
          <div class="sp-actions"><button class="button button--primary" type="submit" value="send">Send for approval</button><button class="button button--ghost" type="submit" value="draft">Keep as a draft</button></div>
          ${statusLine()}
        </div>
      </form>`;
    const form = pane.querySelector("[data-suggest]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const edits = {};
      form.querySelectorAll("[data-edit]").forEach((t) => {
        const i = Number(t.dataset.edit);
        if (t.value !== Sb.blockMarkup(base[i])) edits[i] = t.value;
      });
      const blocks = fromBlocks ? Sb.editedBlocks(base, edits) : G().coven.textBlocks(form.elements.body.value);
      if (!blocks.length) return UI.setStatus(form.querySelector("[data-status]"), "Write something for the page.", true);
      const saved = await UI.busy(form, form.querySelector("[data-status]"), () =>
        D.submitPage({ covenId: state.coven.id, sectionId: p ? null : form.elements.section?.value || null, pageId: p?.id || null, title: form.elements.title.value, pageType: p?.page_type || own?.page_type || null, blocks, note: form.elements.note.value, submissionId: own?.id || null, send: event.submitter?.value !== "draft" })
      );
      if (!saved) return;
      await load();
      navigate(saved.status === "approved" && saved.published_page_id ? bookHref(`&page=${encodeURIComponent(saved.published_page_id)}`) : bookHref("&queue=1"));
    });
  }

  // --- what a gathering left behind ------------------------------------------------------

  function record(ritualId) {
    const r = records.find((x) => x.ritual_id === ritualId);
    if (!r || !S()) return (pane.innerHTML = `${back()}<p class="sp-notice">That record isn’t here.</p>`);
    const C = G().coven;
    const what = r.kind === "meeting" ? "minutes" : "record";
    const shelf = snap.sections.find((s) => s.shelf === C.GATHERING_SHELF[what]) || null;
    const kept = C.gatheringPage(snap.pages, r.ritual_id, what);
    pane.innerHTML = `${back()}
      <article class="sp-section"><p class="sp-eyebrow">${r.kind === "meeting" ? "Meeting" : "Ritual record"}</p><h2>${esc(r.title)}</h2>
        <div class="cv-doc cv-book-page">${prose(S().recordText(r, nameOf))}</div></article>
      <div class="sp-actions">
        ${kept ? `<a class="button button--primary" href="${esc(bookHref(`&page=${encodeURIComponent(kept.id)}`))}" data-tab="book">Open its page in the Book</a>` : shelf && canSection(shelf, "write") ? `<button type="button" class="button button--primary" data-keep>Keep it in the Book as a page</button>` : ""}
        <a class="button button--ghost" href="${esc(`${api.covenHref("rituals")}&ritual=${encodeURIComponent(r.ritual_id)}`)}" data-tab="rituals">${r.kind === "meeting" ? "Open the meeting" : "Open the ritual"}</a>
      </div>${statusLine()}`;
    pane.querySelector("[data-keep]")?.addEventListener("click", async (event) => {
      const title = `${r.title} · ${new Date(r.held_at || r.ended_at || Date.now()).toLocaleDateString()}`;
      const saved = await UI.busy(event.currentTarget, pane.querySelector("[data-status]"), () => D.saveGathering(state.coven.id, r.ritual_id, what, title, C.recordPageBlocks(S().recordBlocks(r, nameOf))));
      if (!saved) return;
      await load();
      if (saved.page_id) navigate(bookHref(`&page=${encodeURIComponent(saved.page_id)}`));
      else UI.setStatus(pane.querySelector("[data-status]"), "Sent to those who approve the Book’s pages.");
    });
  }

  // --- drawing -------------------------------------------------------------------------------

  function navigate(href) {
    global.history.pushState(null, "", href);
    draw();
    global.scrollTo(0, 0);
  }

  function draw() {
    if (!pane || !snap) return;
    const p = params();
    if (p.get("page")) return p.get("edit") ? editor(p.get("page")) : page(p.get("page"));
    if (p.get("new")) return newPage(p.get("section"));
    if (p.get("access")) return accessView(p.get("access"));
    if (p.get("history")) return history(p.get("history"), p.get("version"));
    if (p.get("queue")) return queue();
    if (p.get("suggest")) return suggest({ pageId: p.get("for"), sectionId: p.get("section"), submissionId: p.get("submission") });
    if (p.get("record")) return record(p.get("record"));
    return contents();
  }

  async function mount(el, s, a) {
    pane = el;
    state = s;
    api = a;
    // Moving between the book's views keeps what was just read (half a minute).
    if (snap && loadedFor === s.coven.id && Date.now() - loadedAt < 30000) return draw();
    customising = false;
    pane.innerHTML = `<p class="sp-caption">Opening the coven’s book…</p>`;
    try {
      await load();
    } catch (error) {
      if (pane === el) pane.innerHTML = `<p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
      return;
    }
    if (pane !== el) return;
    draw();
  }

  function unmount() {
    pane = null;
  }

  global.CovenBook = { mount, unmount };
})(window);
