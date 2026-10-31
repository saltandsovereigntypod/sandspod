/*
 * Rune meanings (/divination/runes/): the twenty-four runes of the Elder
 * Futhark and the modern blank rune, each with its three words and its whole
 * page, the same text as the app's (Craft → Divination → Card meanings, and
 * the Grimoire's rune pages: app/src/lib/divination/library.ts and
 * deep/runes.ts, built into js/core/divination-library.js). Opened from
 * Divination, a rune drawn in a reading (#fehu), the Norse & Heathen course's
 * rune lessons and the Grimoire. Each rune also links to its page in the Book
 * of Shadows.
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const L = global.SaltCore && global.SaltCore["divination-library"];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  if (!root) return;
  if (!L) {
    root.innerHTML = `<p class="sp-notice">The rune meanings couldn’t load. Please refresh the page.</p>`;
    return;
  }

  const group = L.allDivinationGroups().find((g) => g.kind === "runes");
  const entries = group.subgroups.flatMap((s) => s.entries);

  function runeHtml(entry) {
    const page = L.divinationPage(entry);
    return `<section class="sp-card dv-rune" id="${esc(entry.id)}" aria-labelledby="rune-${esc(entry.id)}">
        <p class="sp-eyebrow">${esc(page.eyebrow)}</p>
        <h2 id="rune-${esc(entry.id)}">${entry.glyph ? `<span class="dv-glyph" aria-hidden="true">${esc(entry.glyph)}</span> ` : ""}${esc(entry.name)}</h2>
        ${page.gloss ? `<p class="sp-muted">${esc(page.gloss)}</p>` : ""}
        <p class="dv-meaning__words">${esc(L.wordsLine(entry.words))}</p>
        ${page.sections.map((s) => `<h3>${esc(s.label)}</h3>${String(s.text).split(/\n\s*\n/).map((p) => `<p>${esc(p)}</p>`).join("")}`).join("")}
        <p><a class="rt-text-link" href="${esc(L.divinationWebPath({ kind: "runes", id: entry.id }))}">Its page in your Book of Shadows</a> · <a class="rt-text-link" href="#runes-top">Back to the runes</a></p>
      </section>`;
  }

  root.innerHTML = `<a class="sp-back" href="/divination/">← Divination</a>
    <header id="runes-top"><p class="sp-eyebrow">Divination · Runes</p><h1>Rune meanings</h1>
      <p class="sp-lead">${esc(group.note)} Each has its three words, what the rune poems say, a modern reading reversed, and how it is used in practice. The same pages are in your Book of Shadows and the app.</p></header>
    <p class="sp-caption">The rune poems are quoted briefly and put into plain English after Bruce Dickins’s translations (1915). Most divinatory meanings, and nearly all reversed readings, are modern; each page says so where it matters.</p>
    <nav class="sp-chips" aria-label="The runes">${entries.map((e) => `<a class="sp-chip" href="#${esc(e.id)}">${e.glyph ? `${esc(e.glyph)} ` : ""}${esc(e.name)}</a>`).join("")}</nav>
    ${group.subgroups.map((s) => `<h2 class="sp-label">${esc(s.label)}</h2>${s.entries.map(runeHtml).join("")}`).join("")}
    <p><a class="button button--ghost" href="/divination/draw/?spread=one-rune">Draw a rune</a> <a class="button button--ghost" href="/grimoire/">Open your Book of Shadows</a></p>`;
  global.document.title = "Rune meanings | Salt & Sovereignty";
  const wanted = global.location.hash.slice(1);
  if (wanted) global.document.getElementById(wanted)?.scrollIntoView();
})(window);
