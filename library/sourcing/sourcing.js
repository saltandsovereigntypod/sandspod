/*
 * Sourcing with care (the app's More → Living Library → Sourcing with care):
 * the plants, resins and stones whose buying raises real concerns, and what
 * to do instead. Notes come from app/src/lib/library/closed via
 * js/core/guides.js.
 */
(function (global) {
  const root = global.document.querySelector("[data-page-root]");
  const G = global.SaltCore?.guides;
  const { esc, paragraphs, header, fold, unavailable } = global.GuidesUI;
  if (!G?.closed) return unavailable(root, "The sourcing notes");
  const C = G.closed;

  const notes = C.sourcingNotes();
  let query = "";

  function cards() {
    const q = fold(query);
    const shown = q ? notes.filter((n) => fold(n.name).includes(q)) : notes;
    const status = notes.length === 0 ? "The sourcing notes are on their way." : shown.length === 0 ? "No note matches that." : `${shown.length} ${shown.length === 1 ? "note" : "notes"}`;
    return `<p class="sp-caption" role="status" aria-live="polite">${esc(status)}</p>
      ${shown
        .map((note) => {
          const tradition = C.CLOSED_GUIDE_LIVE ? C.closedById(note.tradition) : null;
          const links = [
            note.ref ? `<a class="gd-link" href="/library/entry/?entity=${encodeURIComponent(note.ref)}">Open its Library page</a>` : "",
            tradition ? `<a class="gd-link" href="/library/closed/?id=${encodeURIComponent(tradition.id)}">About ${esc(tradition.name)}</a>` : "",
          ].filter(Boolean);
          return `<article class="sp-card">
          <h2>${esc(note.name)}</h2>
          <div class="gd-part"><p class="gd-part__label">Why care</p><p>${esc(note.concern)}</p></div>
          <div class="gd-part"><p class="gd-part__label">Instead</p><p>${esc(note.instead)}</p></div>
          ${links.length ? `<div class="gd-links">${links.join("")}</div>` : ""}
        </article>`;
        })
        .join("")}`;
  }

  root.innerHTML = `${header({ title: "Sourcing with care", eyebrow: "Living Library", back: "/library/", backLabel: "Back to the Library" })}
    ${paragraphs([
      "Some of the most loved materials in the craft come at a cost to the land or to the people they belong to: wild plants harvested faster than they grow back, medicines that are sacred to a living people, stones dug by hand in unsafe mines.",
      "None of this is about guilt. It’s about buying well, growing your own where you can, and choosing something else when the real thing isn’t yours to take.",
    ])}
    ${
      notes.length
        ? `<div class="sp-field"><label for="gd-sourcing-search">Search the notes</label>
      <input id="gd-sourcing-search" type="search" placeholder="Sage, sandalwood, quartz…" autocomplete="off" autocapitalize="none" spellcheck="false" /></div>`
        : ""
    }
    <div data-sourcing-list>${cards()}</div>
    <p class="sp-caption"><a class="gd-link" href="/library/closed/">Closed &amp; living traditions</a>: whose traditions these materials belong to.</p>`;

  const list = root.querySelector("[data-sourcing-list]");
  root.querySelector("#gd-sourcing-search")?.addEventListener("input", (event) => {
    query = event.target.value;
    list.innerHTML = cards();
  });
})(window);
