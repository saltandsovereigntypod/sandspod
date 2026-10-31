/* =========================================================
   GRIMOIRE JOURNAL SHELVES
   File: grimoire/js/ui/journals.js

   The practice journals kept in the Grimoire (Shadow work, Deity & spirit,
   Ancestors, Omens & signs), each a built-in section after Dreams, as the
   app's Grimoire home has them (app/src/lib/journals/journals.ts). A journal
   moved to "its own journal" lives under Rituals → Journal instead and has no
   shelf here. Never rows in grimoire_sections, so saved layouts are untouched.
   The entries are craft_entries (journal.shadow and the rest, via SaltCraft),
   written and read on /grimoire/journals/.
   ========================================================= */

function journalsCore() {
  return window.SaltCore && window.SaltCore["practice-a"] ? window.SaltCore["practice-a"].journals : null;
}

async function renderJournalShelves() {
  if (!grimoireShelf || !window.SaltCraft) return;
  const J = journalsCore();
  if (!J) return;
  let settings = {};
  try {
    if (typeof getMySettings === "function") settings = await getMySettings();
  } catch (error) {
    console.warn("Settings could not be read.", error);
  }
  grimoireShelf.querySelectorAll("[data-journal-shelf]").forEach((el) => el.remove());

  // After Dreams, else after My Practice, else first.
  let after = grimoireShelf.querySelector("[data-dreams-shelf]") || grimoireShelf.querySelector("[data-my-practice-shelf]");
  for (const def of J.grimoireJournals(settings)) {
    let list = [];
    try {
      list = (await window.SaltCraft.list(def.collection)).map((e) => ({ id: e.id, createdAt: e.createdAt, data: J.normalizeEntry(e.data) }));
    } catch (error) {
      console.warn("A journal could not be read.", error);
    }
    const routes = J.journalWebRoutes(def.kind, "grimoire");
    const openKey = `journal-${def.kind}`;
    const isOpen = isLibraryShelfOpen(openKey) || !(openKey in getLibraryShelfState());
    const shown = J.sortEntries(list).slice(0, 3);
    const wrapper = document.createElement("section");
    wrapper.className = "book-toc-section dreams-shelf";
    wrapper.setAttribute("data-journal-shelf", def.shelfKey);
    wrapper.innerHTML = `
      <button class="book-section-title traditional-library-title" type="button" data-journal-toggle="${escapeHtml(openKey)}" aria-expanded="${isOpen}">
        <span>${escapeHtml(def.title)}</span>
      </button>
      <div class="book-section-pages traditional-library-root" data-journal-list ${isOpen ? "" : "hidden"}>
        <a class="button button--primary my-practice-new-entry-button" href="${escapeHtml(routes.write())}">${escapeHtml(def.write)}</a>
        <form class="library-sidebar-search" action="/grimoire/journals/journal/" method="get" role="search">
          <input type="hidden" name="j" value="${escapeHtml(def.kind)}" />
          <label class="sr-only" for="journal-shelf-search-${escapeHtml(def.kind)}">Search your ${escapeHtml(def.title.toLowerCase())} journal</label>
          <input id="journal-shelf-search-${escapeHtml(def.kind)}" type="search" name="q" placeholder="Search..." />
        </form>
        ${
          shown.length
            ? shown
                .map(
                  (e) => `<a class="book-page-link traditional-library-entity-link dreams-shelf-link" href="${escapeHtml(routes.entry(e.id))}">
                    <span>${escapeHtml(J.entryTitle(def.kind, e.data))}</span>
                    <small>${escapeHtml(J.entryDetail(def.kind, e.data))}</small>
                  </a>`
                )
                .join("")
            : `<p class="book-section-empty">${escapeHtml(J.shelfLine(def.kind, list))}</p>`
        }
        <a class="book-page-link traditional-library-entity-link" href="${escapeHtml(routes.list)}">${list.length > 3 ? `All ${list.length} ${escapeHtml(def.nouns)}` : "Open the journal"}</a>
      </div>
    `;
    if (after) after.insertAdjacentElement("afterend", wrapper);
    else grimoireShelf.prepend(wrapper);
    after = wrapper;
  }

  // The hub of all four, wherever each lives.
  grimoireShelf.querySelector("[data-journals-hub]")?.remove();
  const hub = document.createElement("p");
  hub.className = "book-section-empty";
  hub.setAttribute("data-journals-hub", "");
  hub.innerHTML = `<a class="book-page-link traditional-library-entity-link" href="/grimoire/journals/">Journals: shadow work, deity &amp; spirit, ancestors, omens &amp; signs</a>`;
  if (after) after.insertAdjacentElement("afterend", hub);
  else grimoireShelf.prepend(hub);

  // Hearth & land, as the app's Grimoire row "Kitchen witchery & the land" (beside the Living Library there).
  grimoireShelf.querySelector("[data-hearth-hub]")?.remove();
  const hearth = document.createElement("p");
  hearth.className = "book-section-empty";
  hearth.setAttribute("data-hearth-hub", "");
  hearth.innerHTML = `<a class="book-page-link traditional-library-entity-link" href="/practice/hearth/">Kitchen witchery &amp; the land: recipes with intent, your land journal and harvests</a>`;
  hub.insertAdjacentElement("afterend", hearth);
}

/** Under a page of your book: the journal entries that link to it, and a way to write one that does. */
async function hydrateJournalBacklinks(page) {
  const box = document.querySelector("[data-journal-backlinks]");
  const J = journalsCore();
  if (!box || !J || !page || !window.SaltCraft) return;
  let settings = {};
  try {
    if (typeof getMySettings === "function") settings = await getMySettings();
  } catch {
    settings = {};
  }
  const byKind = {};
  await Promise.all(
    J.JOURNALS.map(async (j) => {
      try {
        byKind[j.kind] = (await window.SaltCraft.list(j.collection)).map((e) => ({ id: e.id, createdAt: e.createdAt, data: J.normalizeEntry(e.data) }));
      } catch {
        byKind[j.kind] = [];
      }
    })
  );
  if (!box.isConnected) return;
  const found = J.linkingTo(byKind, "page", page.id);
  const param = { page: page.id, pageTitle: page.title || "Untitled page" };
  box.innerHTML = `<section class="book-linked-pages"><h2>In your journals</h2>${found
    .map(({ kind, entry }) => `<a class="book-page-link" href="${escapeHtml(J.journalWebRoutes(kind, J.journalPlace(settings, kind)).entry(entry.id))}">${escapeHtml(`${J.entryTitle(kind, entry.data)} · ${J.journalDef(kind).title}`)}</a>`)
    .join("")}<div>${J.JOURNALS.map((j) => `<a class="book-page-link" href="${escapeHtml(J.journalWebRoutes(j.kind, J.journalPlace(settings, j.kind)).write(param))}">${escapeHtml(`Write in ${j.title}`)}</a>`).join("")}</div></section>`;
}

if (typeof document !== "undefined") document.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-journal-toggle]");
  if (!toggle) return;
  const list = toggle.closest("[data-journal-shelf]")?.querySelector("[data-journal-list]");
  if (!list) return;
  const open = list.hidden;
  list.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  saveLibraryShelfState(toggle.dataset.journalToggle, open);
});
