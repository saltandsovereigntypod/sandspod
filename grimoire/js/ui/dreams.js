/* =========================================================
   GRIMOIRE DREAMS SHELF
   File: grimoire/js/ui/dreams.js

   Dreams, a built-in section of the Book of Shadows, as the app's Grimoire
   has it (app/src/lib/grimoire/dreams.ts): straight after My Practice, or
   first when My Practice is turned off; your own sections keep their saved
   order. It is never a row in grimoire_sections, so saved layouts are
   untouched. The dreams are the dream journal's (craft_entries
   `hedge.dreams` via SaltCraft), written and read on /grimoire/dreams/.
   ========================================================= */

const DREAMS_SHELF_OPEN_KEY = "dreams-root";

function dreamsCore() {
  return window.SaltCore && window.SaltCore["practice-a"] ? window.SaltCore["practice-a"] : null;
}

/** Where the Dreams shelf goes in the contents: after My Practice, else first. */
function placeDreamsShelf(container, shelf) {
  const myPractice = container.querySelector("[data-my-practice-shelf]");
  if (myPractice) myPractice.insertAdjacentElement("afterend", shelf);
  else container.prepend(shelf);
}

function dreamShelfRow(entry, core) {
  const d = entry.data;
  const day = core.calendar.fullDate(d.date)?.replace(/, \d{4}$/, "") ?? d.date;
  return `
    <a class="book-page-link traditional-library-entity-link dreams-shelf-link" href="/grimoire/dreams/dream/?id=${encodeURIComponent(entry.id)}">
      <span>${escapeHtml(d.title || "Untitled dream")}</span>
      <small>${escapeHtml(`${day} · ${d.moonPhase} in ${d.moonSign}`)}</small>
    </a>
  `;
}

async function renderDreamsShelf() {
  if (!grimoireShelf || !window.SaltCraft) return;
  const core = dreamsCore();
  if (!core) return;
  const D = core.dreams;

  // Dreams can be switched off in My Sanctuary's settings.
  let showDreams = true;
  try {
    if (typeof getMySettings === "function") showDreams = (await getMySettings()).grimoire_show_dreams !== false;
  } catch (error) {
    console.warn("Settings could not be read.", error);
  }
  if (!showDreams) {
    grimoireShelf.querySelector("[data-dreams-shelf]")?.remove();
    return;
  }

  let dreams = [];
  try {
    dreams = D.sortDreams((await window.SaltCraft.list(D.DREAMS)).map((e) => ({ ...e, data: D.normalizeDream(e.data) })));
  } catch (error) {
    console.warn("Dreams could not be read.", error);
  }

  const existing = grimoireShelf.querySelector("[data-dreams-shelf]");
  if (existing) existing.remove();

  const isOpen = isLibraryShelfOpen(DREAMS_SHELF_OPEN_KEY) || !(DREAMS_SHELF_OPEN_KEY in getLibraryShelfState());
  const wrapper = document.createElement("section");
  wrapper.className = "book-toc-section dreams-shelf";
  wrapper.setAttribute("data-dreams-shelf", "");
  wrapper.innerHTML = `
    <button class="book-section-title traditional-library-title" type="button" data-dreams-toggle aria-expanded="${isOpen}">
      <span>Dreams</span>
    </button>

    <div class="book-section-pages traditional-library-root" data-dreams-list ${isOpen ? "" : "hidden"}>
      <a class="button button--primary my-practice-new-entry-button" href="/grimoire/dreams/edit/">Write down a dream</a>

      <form class="library-sidebar-search" action="/grimoire/dreams/" method="get" role="search">
        <label class="sr-only" for="dreams-shelf-search">Search your dreams</label>
        <input id="dreams-shelf-search" type="search" name="q" placeholder="Search dreams..." />
      </form>

      ${
        dreams.length
          ? dreams.slice(0, 5).map((entry) => dreamShelfRow(entry, core)).join("")
          : `<p class="book-section-empty">No dreams yet. The moon each came under is noted for you.</p>`
      }

      <a class="book-page-link traditional-library-entity-link" href="/grimoire/dreams/">
        ${dreams.length > 5 ? `All ${dreams.length} dreams` : "All dreams"}
      </a>
      <a class="book-page-link traditional-library-entity-link" href="/grimoire/dreams/symbols/">Symbols and moons</a>
    </div>
  `;

  placeDreamsShelf(grimoireShelf, wrapper);
}

if (typeof document !== "undefined") document.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-dreams-toggle]");
  if (!toggle) return;
  const list = toggle.closest("[data-dreams-shelf]")?.querySelector("[data-dreams-list]");
  if (!list) return;
  const open = list.hidden;
  list.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  saveLibraryShelfState(DREAMS_SHELF_OPEN_KEY, open);
});

if (typeof module === "object" && module.exports) module.exports = { placeDreamsShelf };
