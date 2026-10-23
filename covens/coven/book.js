/*
 * A coven's Book of Shadows: pages the coven writes together. Members read
 * the published pages. Those the coven's head allows to write draft new pages
 * and changes to published ones; those allowed to approve publish them (an
 * approver's own writing is published straight away). Personal grimoires stay
 * private; nothing here touches them. The database decides who may do what
 * (supabase/migrations/…_coven_rites_book_petitions.sql).
 *
 * Views, by address: ?tab=book (the contents), &page=<id>, &write=new,
 * &write=<draft id>, &change=<page id> and &queue (drafts and approvals).
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;

  let pane = null;
  let state = null;
  let api = null;
  let pages = [];
  let drafts = [];

  const params = () => new URLSearchParams(global.location.search);
  const bookHref = (extra = "") => `${api.covenHref("book")}${extra}`;
  const nameOf = (id) => UI.nameOf(state.context, id);
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const canWrite = () => state.perms.writeBook || state.perms.site;
  const canApprove = () => state.perms.approveBook || state.perms.site;
  const mineDrafts = () => drafts.filter((d) => d.author_id === state.context.user?.id);
  const pending = () => drafts.filter((d) => d.status === "pending");

  async function load() {
    const [p, d] = await Promise.all([D.bookPages(state.coven.id).catch(() => []), D.bookDrafts(state.coven.id).catch(() => [])]);
    pages = p;
    drafts = d;
    await UI.loadNames(state.context, [...pages.flatMap((x) => [x.author_id, x.published_by]), ...drafts.flatMap((x) => [x.author_id, x.reviewer_id])]);
  }

  function back(label = "The coven’s book") {
    return `<p><a class="sp-back" href="${esc(bookHref())}" data-tab="book">← ${esc(label)}</a></p>`;
  }

  // --- the contents ----------------------------------------------------------

  function contents() {
    const sections = L.bookSections(pages);
    const waiting = canApprove() ? pending().filter((d) => d.author_id !== state.context.user?.id).length : 0;
    const mine = mineDrafts().length;
    pane.innerHTML = `<p>The coven’s shared Book of Shadows. ${canWrite() ? (canApprove() ? "What you write here is published straight away." : "What you write goes to the coven’s approvers before it appears.") : "Only those the coven’s head allows can write in it."} Your own grimoire stays private.</p>
      <div class="sp-actions">
        ${canWrite() ? `<a class="button button--primary" href="${esc(bookHref("&write=new"))}" data-tab="book">✦ Write a page</a>` : ""}
        ${waiting || mine ? `<a class="button button--ghost" href="${esc(bookHref("&queue=1"))}" data-tab="book">${waiting ? `Waiting for approval (${waiting})` : ""}${waiting && mine ? " · " : ""}${mine ? `Your drafts (${mine})` : ""}</a>` : ""}
      </div>
      ${sections.length
        ? sections
            .map((sec) => `<section class="sp-section"><h2>${esc(sec.section)}</h2><nav class="sp-list" aria-label="${esc(sec.section)}">${sec.pages
              .map((p) => `<a class="sp-row" href="${esc(bookHref(`&page=${encodeURIComponent(p.id)}`))}" data-tab="book"><span class="sp-row__text"><span class="sp-row__title">${esc(p.title)}</span>
                <span class="sp-row__detail">${p.author_id ? `By ${esc(nameOf(p.author_id))} · ` : ""}${esc(L.relativeTime(p.published_at))}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`)
              .join("")}</nav></section>`)
            .join("")
        : `<p class="sp-empty">The coven’s book is empty.${canWrite() ? " Write its first page." : ""}</p>`}`;
  }

  // --- one page --------------------------------------------------------------

  function page(id) {
    const p = pages.find((x) => x.id === id);
    if (!p) return (pane.innerHTML = `${back()}<p class="sp-notice">That page isn’t in the book any more.</p>`);
    const proposing = mineDrafts().find((d) => d.page_id === p.id && d.status !== "published");
    pane.innerHTML = `${back()}
      <article class="sp-section">
        ${p.section ? `<p class="sp-eyebrow">${esc(p.section)}</p>` : ""}
        <h2>${esc(p.title)}</h2>
        <p class="sp-caption">${p.author_id ? `Written by ${esc(nameOf(p.author_id))}. ` : ""}${p.version > 1 ? `Version ${p.version}, ` : ""}published ${esc(new Date(p.published_at).toLocaleDateString())}${p.published_by && p.published_by !== p.author_id ? ` by ${esc(nameOf(p.published_by))}` : ""}.</p>
        <div class="cv-doc cv-book-page">${p.body.trim() ? prose(p.body) : `<span class="sp-empty">This page has no words yet.</span>`}</div>
      </article>
      <div class="sp-actions">
        ${canWrite() ? (proposing ? `<a class="button button--ghost" href="${esc(bookHref(`&write=${encodeURIComponent(proposing.id)}`))}" data-tab="book">Your ${proposing.status === "pending" ? "changes waiting for approval" : "draft changes"}</a>` : `<a class="button button--ghost" href="${esc(bookHref(`&change=${encodeURIComponent(p.id)}`))}" data-tab="book">${canApprove() ? "Edit this page" : "Suggest changes"}</a>`) : ""}
        ${canApprove() ? `<button class="button button--ghost" type="button" data-remove-page>Take it out of the book</button>` : ""}
        <button class="button button--ghost button--small" type="button" data-report-page>Report</button>
      </div>${statusLine()}`;
    pane.querySelector("[data-report-page]").addEventListener("click", () => UI.report({ target_type: "book_page", target_id: p.id, coven_id: state.coven.id, target_user_id: p.author_id, label: "this page" }));
    pane.querySelector("[data-remove-page]")?.addEventListener("click", async (event) => {
      if (!(await UI.confirmAction(`Take “${p.title}” out of the book?`, "It’s removed for everyone, with any drafts of changes to it.", "Remove"))) return;
      if (await UI.busy(event.currentTarget, pane.querySelector("[data-status]"), () => D.removeBookEntry("page", p.id).then(() => true))) {
        await load();
        navigate(bookHref());
      }
    });
  }

  // --- writing -----------------------------------------------------------------

  function writer({ draftId, pageId }) {
    if (!canWrite()) return contents();
    const draft = draftId ? drafts.find((d) => d.id === draftId) : null;
    const base = draft ? null : pageId ? pages.find((p) => p.id === pageId) : null;
    if (draftId && !draft) return (pane.innerHTML = `${back()}<p class="sp-notice">That draft isn’t here any more.</p>`);
    const target = draft?.page_id ? pages.find((p) => p.id === draft.page_id) : base;
    const fields = draft || base || { title: "", section: "", body: "" };
    const sections = [...new Set(pages.map((p) => p.section).filter(Boolean))];
    const publishes = canApprove();
    pane.innerHTML = `${back()}
      <form class="sp-section" data-book-form>
        <h2>${target ? `${publishes ? "Edit" : "Suggest changes to"} “${esc(target.title)}”` : draft ? "Your draft" : "Write a page"}</h2>
        ${draft?.status === "pending" ? `<p class="sp-notice">This is waiting for approval. Changing it takes it back to a draft until you send it again.</p>` : ""}
        ${draft?.status === "declined" ? `<div class="cv-banner"><p>This wasn’t approved${draft.reviewer_id ? ` by ${esc(nameOf(draft.reviewer_id))}` : ""}.${draft.reviewer_note ? ` They said: ${esc(draft.reviewer_note)}` : ""} You can change it and send it again.</p></div>` : ""}
        <div class="sp-card">
          <div class="sp-grid-2">
            <div class="sp-field"><label for="bk-title">Title</label><input id="bk-title" name="title" required maxlength="120" value="${esc(fields.title)}" /></div>
            <div class="sp-field"><label for="bk-section">Section (optional)</label><input id="bk-section" name="section" maxlength="60" list="bk-sections" value="${esc(fields.section || "")}" placeholder="Correspondences, Rites, Lore…" />
              <datalist id="bk-sections">${sections.map((x) => `<option value="${esc(x)}"></option>`).join("")}</datalist></div>
          </div>
          <div class="sp-field"><label for="bk-body">The page</label><textarea id="bk-body" name="body" maxlength="40000" rows="16">${esc(fields.body)}</textarea></div>
          <div class="sp-actions">
            <button class="button button--primary" type="submit" value="submit">${publishes ? "Publish to the book" : "Send for approval"}</button>
            <button class="button button--ghost" type="submit" value="save">Save as a draft</button>
            ${draft ? `<button class="button button--ghost" type="button" data-delete-draft>Delete this draft</button>` : ""}
          </div>
          ${statusLine()}
        </div>
      </form>`;
    const form = pane.querySelector("[data-book-form]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = event.submitter?.value === "submit";
      const values = { title: form.elements.title.value.trim(), section: form.elements.section.value.trim(), body: form.elements.body.value };
      const saved = await UI.busy(form, form.querySelector("[data-status]"), () => D.saveBookDraft(state.coven.id, draft?.id, draft ? draft.page_id : base?.id, values, submit));
      if (!saved) return;
      await load();
      if (saved.status === "published") navigate(bookHref(`&page=${encodeURIComponent(saved.page_id)}`));
      else if (saved.status === "pending") navigate(bookHref("&queue=1"));
      else {
        global.history.replaceState(null, "", bookHref(`&write=${encodeURIComponent(saved.id)}`));
        draw();
        UI.setStatus(pane.querySelector("[data-status]"), "Saved as a draft.");
      }
    });
    pane.querySelector("[data-delete-draft]")?.addEventListener("click", async (event) => {
      if (!(await UI.confirmAction("Delete this draft?", "", "Delete"))) return;
      if (await UI.busy(event.currentTarget, pane.querySelector("[data-status]"), () => D.removeBookEntry("draft", draft.id).then(() => true))) {
        await load();
        navigate(bookHref());
      }
    });
  }

  // --- drafts and approvals ------------------------------------------------------

  function queue() {
    const me = state.context.user?.id;
    const toApprove = canApprove() ? pending().filter((d) => d.author_id !== me) : [];
    const mine = mineDrafts();
    const label = (d) => ({ draft: "Draft", pending: "Waiting for approval", declined: "Not approved" })[d.status] || d.status;
    const approvalCard = (d) => {
      const current = d.page_id ? pages.find((p) => p.id === d.page_id) : null;
      return `<article class="sp-card" data-draft="${esc(d.id)}">
          <p class="sp-eyebrow">${current ? `Changes to “${esc(current.title)}”` : "A new page"} · from ${esc(nameOf(d.author_id))} · ${esc(L.relativeTime(d.submitted_at || d.updated_at))}</p>
          <h3>${esc(d.title)}</h3>${d.section ? `<p class="sp-caption">Section: ${esc(d.section)}</p>` : ""}
          <div class="cv-doc cv-book-page">${prose(d.body)}</div>
          ${current ? `<details class="sp-details"><summary>The page as it is now</summary><div class="cv-doc">${prose(current.body)}</div></details>` : ""}
          <form class="sp-section" data-review>
            <div class="sp-field"><label for="rv-${esc(d.id)}">Note to them (optional)</label><textarea id="rv-${esc(d.id)}" name="note" maxlength="2000"></textarea></div>
            <div class="sp-actions"><button class="button button--primary button--small" type="submit" value="1">Approve and publish</button><button class="button button--ghost button--small" type="submit" value="0">Don’t approve</button></div>
            ${statusLine()}
          </form>
        </article>`;
    };
    pane.innerHTML = `${back()}
      ${canApprove() ? `<section class="sp-section"><h2>Waiting for your approval</h2>${toApprove.length ? toApprove.map(approvalCard).join("") : `<p class="sp-empty">Nothing is waiting.</p>`}</section>` : ""}
      <section class="sp-section"><h2>Your drafts</h2>${mine.length
        ? `<nav class="sp-list" aria-label="Your drafts">${mine
            .map((d) => `<a class="sp-row" href="${esc(bookHref(`&write=${encodeURIComponent(d.id)}`))}" data-tab="book"><span class="sp-row__text"><span class="sp-row__title">${esc(d.title)}</span>
              <span class="sp-row__detail">${esc(label(d))}${d.page_id ? " · changes to a published page" : ""} · ${esc(L.relativeTime(d.updated_at))}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`)
            .join("")}</nav>`
        : `<p class="sp-empty">You have no drafts.</p>`}</section>`;
    pane.querySelectorAll("[data-review]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const id = form.closest("[data-draft]").dataset.draft;
        const saved = await UI.busy(form, form.querySelector("[data-status]"), () => D.reviewBookDraft(id, event.submitter?.value === "1", form.elements.note.value));
        if (!saved) return;
        await load();
        draw();
      })
    );
  }

  // --- drawing -------------------------------------------------------------------

  function navigate(href) {
    global.history.pushState(null, "", href);
    draw();
    global.scrollTo(0, 0);
  }

  function draw() {
    if (!pane) return;
    const p = params();
    if (p.get("page")) return page(p.get("page"));
    if (p.get("write") === "new") return writer({});
    if (p.get("write")) return writer({ draftId: p.get("write") });
    if (p.get("change")) return writer({ pageId: p.get("change") });
    if (p.get("queue")) return queue();
    return contents();
  }

  async function mount(el, s, a) {
    pane = el;
    state = s;
    api = a;
    pane.innerHTML = `<p class="sp-caption">Opening the coven’s book…</p>`;
    await load();
    if (pane !== el) return;
    draw();
  }

  function unmount() {
    pane = null;
  }

  global.CovenBook = { mount, unmount };
})(window);
