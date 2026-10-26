/* =========================================================
   GRIMOIRE DIVINATION (Traditional Information)
   File: grimoire/js/ui/divination.js

   Tarot, Runes and Ogham as sibling drop-downs under a Divination heading
   inside Traditional Information, as the app's Grimoire has them
   (app/src/lib/divination/library.ts, built into
   js/core/divination-library.js). Each card or stave is a row with its
   picture or letter and its three words, and opens its page here. Built in,
   like Dreams: never a row in grimoire_sections or the Living Library, so
   nothing is saved. Follows the Traditional Information setting, since it
   lives inside that shelf. The draw pages link here with
   /grimoire/?divination=tarot/16-the-tower.
   ========================================================= */

// The page open in the reader, to mark its row when the contents redraw.
let activeDivination = null;
// The tarot deck to show (Settings: tarot_deck), and one looked at on the open page instead.
let divinationDeck = null;
let lookingDeck = null;

function divinationCore() {
  return window.SaltCore && window.SaltCore["divination-library"] ? window.SaltCore["divination-library"] : null;
}

/** The deck chosen in settings, read once (the Rider–Waite–Smith until then). */
async function loadDivinationDeck(core) {
  if (divinationDeck) return divinationDeck;
  try {
    const settings = typeof getMySettings === "function" ? await getMySettings() : {};
    divinationDeck = core.decks.chosenDeck(settings);
  } catch (error) {
    console.error(error);
    divinationDeck = core.decks.DEFAULT_DECK;
  }
  return divinationDeck;
}

/** A row's picture: the card's art in your deck, or the rune's or stave's letter. */
function divinationThumb(entry, core) {
  if (entry.cardId) {
    const src = core.decks.deckImagePath(divinationDeck || core.decks.DEFAULT_DECK, entry.cardId);
    return `<img class="divination-thumb" src="${escapeHtml(src)}" alt="" loading="lazy" />`;
  }
  return `<span class="divination-glyph divination-glyph--${entry.kind}" aria-hidden="true">${escapeHtml(entry.glyph || "")}</span>`;
}

function isActiveDivination(entry) {
  const showing = typeof currentPage !== "undefined" && !currentPage && typeof activeLibraryEntityId !== "undefined" && !activeLibraryEntityId;
  return showing && activeDivination === `${entry.kind}/${entry.id}`;
}

function divinationRow(entry, core) {
  return `
    <button type="button" class="book-page-link traditional-library-entity-link divination-link${isActiveDivination(entry) ? " is-active" : ""}" data-divination-entry="${escapeHtml(`${entry.kind}/${entry.id}`)}"
      aria-label="${escapeHtml(`${entry.name}: ${entry.words.join(", ")}`)}">
      ${divinationThumb(entry, core)}
      <span class="divination-link__text">
        <span>${escapeHtml(entry.name)}</span>
        <small>${escapeHtml(core.wordsLine(entry.words))}</small>
      </span>
    </button>
  `;
}

/** The Divination drop-downs, added to the end of Traditional Information. */
function renderDivinationShelf() {
  const core = divinationCore();
  if (!core || typeof grimoireShelf === "undefined" || !grimoireShelf) return;
  grimoireShelf.querySelector("[data-divination-shelf]")?.remove();

  // No Traditional Information shelf means it's turned off in settings.
  const list = grimoireShelf.querySelector("[data-traditional-library-shelf] [data-traditional-library-list]");
  if (!list) return;

  const term = typeof librarySearchTerm === "string" ? librarySearchTerm.trim() : "";
  const groups = core.divinationGroups(term);
  if (!groups.length) return;

  const wrapper = document.createElement("div");
  wrapper.className = "divination-shelf";
  wrapper.setAttribute("data-divination-shelf", "");
  wrapper.innerHTML = `
    <p class="divination-shelf__title">${escapeHtml(core.DIVINATION_TITLE)}</p>
    ${groups
      .map((group) => {
        const open = Boolean(term) || isLibraryShelfOpen(`divination-${group.kind}`);
        return `
          <div class="traditional-library-group" data-divination-group="${group.kind}">
            <button class="traditional-library-group-title" type="button" data-divination-toggle="${group.kind}" aria-expanded="${open}">
              <span>${open ? "▾" : "▸"}</span>
              ${escapeHtml(group.label)} <small class="divination-count">${core.countOf(group)}</small>
            </button>
            <div class="traditional-library-entity-list" data-divination-list="${group.kind}" ${open ? "" : "hidden"}>
              <p class="divination-note">${escapeHtml(group.note)}</p>
              ${group.subgroups
                .map(
                  (sub) => `
                    ${group.subgroups.length > 1 ? `<p class="divination-subgroup">${escapeHtml(sub.label)}</p>` : ""}
                    ${sub.entries.map((entry) => divinationRow(entry, core)).join("")}
                  `
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("")}
  `;
  list.appendChild(wrapper);
  // Once the deck is known, show its pictures.
  if (!divinationDeck) loadDivinationDeck(core).then((deck) => deck !== core.decks.DEFAULT_DECK && renderDivinationShelf());
}

/** A card's, rune's or stave's page in the reader, in the Living Library's page style. */
async function renderDivinationPage(kind, id) {
  const core = divinationCore();
  if (!core || typeof entryList === "undefined" || !entryList) return;
  const entry = core.findDivination(kind, id);
  if (!entry) return;

  activeLibraryEntityId = null;
  activeDivination = `${entry.kind}/${entry.id}`;
  document.body.classList.add("library-page-open");
  saveLastGrimoireView({ type: "divination", id: `${entry.kind}/${entry.id}` });
  currentPage = null;
  currentBlocks = [];
  pageLinks = [];
  pageMode = "read";
  if (grimoireHeading) grimoireHeading.textContent = entry.name;
  hideEmptyState();
  updateEditButton();

  const showTraditional = typeof shouldShowTraditionalLibrary === "function" ? await shouldShowTraditionalLibrary() : true;
  const page = core.divinationPage(entry);
  const D = core.decks;
  const deck = lookingDeck || (await loadDivinationDeck(core));
  const info = D.deckInfo(deck);
  const deckTitle = entry.cardId ? D.deckCardTitle(deck, entry.cardId) : null;
  // Your deck first; the others a tap away, just for this page.
  const deckChoice = entry.cardId
    ? `<p class="divination-deck-title">${escapeHtml(deckTitle ? `${info.name}: ${deckTitle}` : `${info.name}, ${info.made}`)}</p>
       <div class="divination-decks" role="group" aria-label="Deck">${D.TAROT_DECKS.map(
         (d) => `<button type="button" class="divination-deck" data-divination-deck="${escapeHtml(d.id)}" aria-pressed="${d.id === deck ? "true" : "false"}">${escapeHtml(d.name)}</button>`
       ).join("")}</div>`
    : "";
  const figure = entry.cardId
    ? `<figure class="book-library-hero-image divination-hero"><img src="${escapeHtml(D.deckImagePath(deck, entry.cardId))}" alt="${escapeHtml(`${entry.name}, ${D.deckPictureLabel(deck)}`)}" /></figure>${deckChoice}`
    : `<figure class="divination-hero divination-hero--${entry.kind}"><span class="divination-glyph divination-glyph--${entry.kind}" aria-hidden="true">${escapeHtml(entry.glyph || "")}</span></figure>`;

  entryList.innerHTML = `
    <section class="book-reader-page book-library-entity-page divination-page">
      <div class="book-library-sticky-tools">
        <div class="book-library-sticky-left">
          <button class="grimoire-menu-button" type="button" data-grimoire-menu-button aria-label="Open Table of Contents">☰</button>
        </div>
      </div>
      <header class="book-reader-header book-library-header">
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1>${escapeHtml(entry.name)}</h1>
        ${
          showTraditional
            ? `${figure}
               <p class="book-library-intro divination-words" aria-label="${escapeHtml(`In three words: ${entry.words.join(", ")}`)}">${escapeHtml(core.wordsLine(entry.words))}</p>
               ${page.gloss ? `<p class="divination-gloss">${escapeHtml(page.gloss)}</p>` : ""}`
            : ""
        }
        <div class="book-reader-divider">✦ ☽ ✦ ☾ ✦</div>
      </header>
      <div class="book-reader-body book-library-body">
        ${
          showTraditional
            ? page.sections
                .map(
                  (section) => `
                    <section class="book-library-layer divination-section divination-section--${section.key}">
                      <h2>${escapeHtml(section.label)}</h2>
                      <p>${escapeHtml(section.text)}</p>
                    </section>
                  `
                )
                .join("")
            : `<p class="book-section-empty">Traditional Information is turned off in your Living Library settings, so this page is hidden.</p>`
        }
        ${showTraditional && typeof window !== "undefined" && window.ResearchNote ? window.ResearchNote.footerHtml(entry.name, page.eyebrow) : ""}
      </div>
    </section>
  `;

  // Mark the open row in the contents.
  document.querySelectorAll("[data-divination-entry]").forEach((row) => {
    row.classList.toggle("is-active", row.dataset.divinationEntry === `${entry.kind}/${entry.id}`);
  });
}

if (typeof document !== "undefined")
  document.addEventListener("click", async (event) => {
    const toggle = event.target.closest("[data-divination-toggle]");
    if (toggle) {
      const kind = toggle.dataset.divinationToggle;
      const list = toggle.closest("[data-divination-shelf]")?.querySelector(`[data-divination-list="${kind}"]`);
      if (!list) return;
      list.hidden = !list.hidden;
      toggle.setAttribute("aria-expanded", String(!list.hidden));
      const icon = toggle.querySelector("span");
      if (icon) icon.textContent = list.hidden ? "▸" : "▾";
      saveLibraryShelfState(`divination-${kind}`, !list.hidden);
      return;
    }
    const deckButton = event.target.closest("[data-divination-deck]");
    if (deckButton && activeDivination) {
      lookingDeck = deckButton.dataset.divinationDeck;
      const [kind, id] = activeDivination.split("/");
      await renderDivinationPage(kind, id);
      document.querySelector(`[data-divination-deck="${lookingDeck}"]`)?.focus();
      return;
    }
    const row = event.target.closest("[data-divination-entry]");
    if (row) {
      const [kind, id] = row.dataset.divinationEntry.split("/");
      lookingDeck = null;
      await renderDivinationPage(kind, id);
    }
  });

if (typeof module === "object" && module.exports) module.exports = { renderDivinationShelf, renderDivinationPage };
