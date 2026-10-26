/*
 * A note on our research: the one-line footer with "Send a note" at the foot
 * of every researched page (Living Library entries and deities, holidays,
 * dedication journeys and the patron guide, the Closed & living traditions
 * guide, tarot cards, runes and ogham staves), the first-visit card on the
 * Living Library, and the full note at /more/research/. The app's twin is
 * app/src/components/ResearchNote.tsx; the words and the mailto are the
 * app's own (app/src/lib/research.ts via js/core/research.js).
 *
 * Needs: js/core/research.js. Loads before each page's own script.
 */
(function (global) {
  const R = global.SaltCore?.research;
  const esc = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const STYLE = `
.rn-footer{margin-top:2rem;padding-top:1rem;border-top:1px solid rgba(201,169,97,.3);display:grid;gap:.35rem}
.rn-footer p{margin:0}
.rn-line{font-style:italic;opacity:.9}
.rn-links a{margin-right:1rem}
.rn-card{border:1px solid rgba(201,169,97,.45);border-radius:14px;padding:1rem 1.1rem;margin:0 0 1.25rem;display:grid;gap:.6rem}
.rn-card p{margin:0}
.rn-card .rn-actions{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}`;

  /** Adds the note's few styles once, so every page can show it whatever it loads. */
  function style() {
    const doc = global.document;
    if (!doc || doc.getElementById("rn-style")) return;
    const el = doc.createElement("style");
    el.id = "rn-style";
    el.textContent = STYLE;
    (doc.head || doc.documentElement).appendChild(el);
  }

  /** The mailto for a note on one page ("Note on: Hekate"), or on the research as a whole. */
  const mailto = (page, kind) => R.researchNoteUrl(page || null, kind || null);

  /** The one-line footer for a page, with "Send a note" and a link to the full note. */
  function footerHtml(page, kind) {
    if (!R) return "";
    style();
    return `<aside class="rn-footer" data-research-note aria-label="${esc(R.RESEARCH_NOTE_TITLE)}">
      <p class="rn-line sp-caption">${esc(R.RESEARCH_LINE)}</p>
      <p class="rn-links"><a href="${esc(mailto(page, kind))}" aria-label="Send a note about ${esc(page)} to ${esc(R.SUPPORT_EMAIL)}">Send a note</a><a href="${esc(R.RESEARCH_NOTE_SITE_HREF)}">${esc(R.RESEARCH_NOTE_TITLE)}</a></p>
    </aside>`;
  }

  /** Whether the Living Library's card has been put away in this browser. */
  function cardSeen() {
    try {
      return global.localStorage.getItem(R.RESEARCH_CARD_SEEN_KEY) === "1";
    } catch {
      return false;
    }
  }

  function markSeen() {
    try {
      global.localStorage.setItem(R.RESEARCH_CARD_SEEN_KEY, "1");
    } catch {
      /* Private windows: the card simply shows again next time. */
    }
  }

  /** The first-visit card for the Living Library, or "" once it has been put away. */
  function cardHtml() {
    if (!R || cardSeen()) return "";
    style();
    return `<section class="rn-card" data-research-card aria-label="${esc(R.RESEARCH_NOTE_TITLE)}">
      <p class="sp-eyebrow">${esc(R.RESEARCH_NOTE_TITLE)}</p>
      <p>${esc(R.RESEARCH_CARD)}</p>
      <div class="rn-actions"><a class="button button--ghost" href="${esc(R.RESEARCH_NOTE_SITE_HREF)}" data-research-read>Read the note</a><button class="button button--ghost" type="button" data-research-dismiss>Got it</button></div>
    </section>`;
  }

  /** Puts the card away (remembered in this browser) when Got it or Read the note is chosen. */
  function bindCard(root) {
    const card = root?.querySelector("[data-research-card]");
    if (!card) return;
    card.querySelector("[data-research-dismiss]")?.addEventListener("click", () => {
      markSeen();
      card.remove();
    });
    card.querySelector("[data-research-read]")?.addEventListener("click", markSeen);
  }

  /** The full note's body, for /more/research/. */
  function noteHtml() {
    if (!R) return "";
    return `<div class="sp-card">${R.RESEARCH_NOTE.map((p) => `<p>${esc(p)}</p>`).join("")}
      <div class="sp-actions"><a class="button button--ghost" href="${esc(mailto())}">Send a note</a></div>
      <p class="sp-caption gd-selectable">Or write to ${esc(R.SUPPORT_EMAIL)}</p></div>
      <p class="sp-caption">Every Library entry, deity, holiday, journey and card page has a Send a note link at its foot, which names the page for me.</p>`;
  }

  const api = { ready: !!R, mailto, footerHtml, cardHtml, bindCard, cardSeen, noteHtml };
  global.ResearchNote = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
