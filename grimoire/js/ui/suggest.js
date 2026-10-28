/* =========================================================
   SUGGEST A PAGE TO A COVEN
   File: grimoire/js/ui/suggest.js

   Under any page of your own Book of Shadows: send a copy of it to a
   coven's Book, for those who approve its pages (as the app's
   grimoire/suggest.tsx does, with the same call: submit_coven_grimoire_page,
   and the same copy of the page: SaltCore.grimoire.submissions). If they
   take it in, it credits you; your own page is never changed.
   ========================================================= */

(function (global) {
  "use strict";

  const S = () => global.SaltCore && global.SaltCore.grimoire && global.SaltCore.grimoire.submissions;
  const esc = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  async function myCovens(userId) {
    const { data, error } = await db.from("coven_members").select("covens(id,name,slug,status)").eq("user_id", userId).eq("status", "active");
    if (error) throw error;
    return (data || []).map((r) => r.covens).filter((c) => c && c.status === "active");
  }

  async function sectionsOf(covenId) {
    const opened = await db.rpc("open_coven_grimoire", { p_coven: covenId });
    if (opened.error) throw opened.error;
    const { data, error } = await db.from("coven_grimoire_sections").select("id,title,sort_order").eq("book_id", opened.data.id).order("sort_order");
    if (error) throw error;
    return data || [];
  }

  // Share…: both ways to share a page of your own, as the app's Share… sheet
  // on a Grimoire page: suggest it to a coven, or make an offering of it.
  const shareButtons = () =>
    `<span class="book-note">Share…</span> <button type="button" class="button button--ghost button--small" data-suggest-open>Suggest to a coven</button> <a class="button button--ghost button--small" href="/submit/">Make an offering</a>`;

  function addButton() {
    if (!entryList || typeof currentPage === "undefined" || !currentPage || pageMode !== "read") return;
    const reader = entryList.querySelector(".book-reader-page");
    if (!reader || reader.querySelector("[data-suggest-coven]") || !S()) return;
    const box = document.createElement("div");
    box.className = "grimoire-suggest";
    box.setAttribute("data-suggest-coven", "");
    box.innerHTML = shareButtons();
    reader.appendChild(box);
  }

  async function open(box) {
    const user = typeof getUser === "function" ? getUser() : null;
    if (!user || !currentPage) return;
    box.innerHTML = `<p class="book-note">Finding your covens…</p>`;
    let covens = [];
    try {
      covens = await myCovens(user.id);
    } catch (error) {
      box.innerHTML = `<p class="book-note">${esc(error.message)}</p>`;
      return;
    }
    if (!covens.length) {
      box.innerHTML = `<p class="book-note">You aren’t in a coven yet. Pages can be suggested to the covens you’re in.</p>`;
      return;
    }
    const blocks = S().submissionBlocks(currentBlocks || []);
    box.innerHTML = `
      <form class="grimoire-suggest-form" data-suggest-form>
        <p class="book-note">A copy of this page goes to those who approve pages in the coven’s book. If they take it in, it says you shared it. Your own page stays as it is, and private.</p>
        <label>Which coven
          <select name="coven" required>${covens.length > 1 ? `<option value="">Choose a coven</option>` : ""}${covens.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</select>
        </label>
        <label>Where in its book
          <select name="section"><option value="">Anywhere they choose</option></select>
        </label>
        <label>A note for them (optional)
          <textarea name="note" maxlength="2000" rows="3" placeholder="Why it might belong in the coven’s book"></textarea>
        </label>
        <div class="grimoire-layout-actions">
          <button type="submit" class="button button--primary button--small" ${blocks.length ? "" : "disabled"}>Suggest it</button>
          <button type="button" class="button button--ghost button--small" data-suggest-close>Not now</button>
        </div>
        <p class="book-note" data-suggest-status role="status" aria-live="polite">${blocks.length ? "" : "This page has nothing written on it yet."}</p>
      </form>`;
    const form = box.querySelector("[data-suggest-form]");
    const status = box.querySelector("[data-suggest-status]");
    const fillSections = async () => {
      const covenId = form.elements.coven.value;
      form.elements.section.innerHTML = `<option value="">Anywhere they choose</option>`;
      if (!covenId) return;
      try {
        const list = await sectionsOf(covenId);
        form.elements.section.innerHTML += list.map((s) => `<option value="${esc(s.id)}">${esc(s.title)}</option>`).join("");
      } catch (error) {
        status.textContent = error.message;
      }
    };
    form.elements.coven.addEventListener("change", fillSections);
    fillSections();
    box.querySelector("[data-suggest-close]").addEventListener("click", () => {
      box.innerHTML = shareButtons();
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const covenId = form.elements.coven.value;
      if (!covenId) return (status.textContent = "Choose a coven.");
      status.textContent = "Sending…";
      const { data, error } = await db.rpc("submit_coven_grimoire_page", {
        p_coven: covenId,
        p_section: form.elements.section.value || null,
        p_page: null,
        p_title: currentPage.title,
        p_page_type: currentPage.page_type || null,
        p_blocks: blocks,
        p_note: form.elements.note.value.trim() || null,
        p_source_page: currentPage.id,
        p_submission: null,
        p_send: true
      });
      if (error) return (status.textContent = error.message);
      if (data && data.status !== "draft") db.functions.invoke("coven-notify", { body: { grimoire_submission_id: data.id } }).catch(() => {});
      status.textContent = data && data.status === "approved" ? "It’s in the coven’s book now, crediting you." : "Sent. Those who approve for that part of the coven’s book will look at it, and you’ll hear when they do.";
      form.querySelector('[type="submit"]').disabled = true;
    });
  }

  function start() {
    if (typeof entryList === "undefined" || !entryList) return;
    new MutationObserver(addButton).observe(entryList, { childList: true });
    entryList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-suggest-open]");
      if (button) open(button.closest("[data-suggest-coven]"));
    });
    addButton();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof window !== "undefined" ? window : globalThis);
