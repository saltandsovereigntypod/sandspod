/* =========================================================
   GRIMOIRE MODALS
   File: grimoire/js/modals.js
   ========================================================= */

function ensureModalRoot() {
  let root = document.querySelector("[data-book-modal-root]");

  if (!root) {
    root = document.createElement("div");
    root.dataset.bookModalRoot = "";
    document.body.appendChild(root);
  }

  return root;
}

function closeBookModal(value = null) {
  const root = document.querySelector("[data-book-modal-root]");
  if (root) root.innerHTML = "";

  if (typeof closeBookModal.resolve === "function") {
    closeBookModal.resolve(value);
    closeBookModal.resolve = null;
  }
}

function openModal(title, bodyHtml) {
  const root = ensureModalRoot();

  root.innerHTML = `
    <div class="book-modal-backdrop" data-close-book-modal>
      <section class="book-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <header>
          <h2>${escapeHtml(title)}</h2>
          <button type="button" data-close-book-modal>×</button>
        </header>

        <div class="book-modal-body">
          ${bodyHtml}
        </div>
      </section>
    </div>
  `;

  return new Promise((resolve) => {
    closeBookModal.resolve = resolve;
  });
}

function openPageTemplateChooser(sectionId = null) {
  const buttons = Object.entries(PAGE_TEMPLATES)
    .map(
      ([key, template]) => `
        <button type="button" data-choose-template="${key}">
          ${escapeHtml(template.label)}
        </button>
      `
    )
    .join("");

  // A sigil is made first, in the sigil maker, which then saves it as its own page here.
  const sigilHref = `/practice/eclectic/sigil/?from=grimoire${sectionId ? `&section=${encodeURIComponent(sectionId)}` : ""}`;

  return openModal(
    "Create a Page",
    `<div class="book-template-grid">${buttons}</div>
    <p class="book-template-extra">Or make something for it:</p>
    <div class="book-template-grid">
      <a class="book-template-link" href="${escapeHtml(sigilHref)}">A sigil <span>from your intent, by its letters or a planetary square</span></a>
    </div>`
  );
}

function openPageChooser(title = "Choose a Page") {
  const availablePages = pages.filter((page) => !currentPage || page.id !== currentPage.id);

  const buttons = availablePages
    .map(
      (page) => `
        <button type="button" data-choose-page="${page.id}">
          ${escapeHtml(page.title)}
        </button>
      `
    )
    .join("");

  return openModal(
    title,
    `<div class="book-template-grid">${buttons || "<p>No other pages yet.</p>"}</div>`
  );
}

/* =========================================================
   ALTAR IMPORT MODAL
   ========================================================= */

function groupAltarItemsByType(items = []) {
  return items.reduce((groups, item) => {
    const type = item.type || "item";
    const label = ALTAR_IMPORT_TYPE_LABELS[type] || "Other Items";

    if (!groups[label]) {
      groups[label] = [];
    }

    groups[label].push(item);
    return groups;
  }, {});
}

function renderAltarImportSummary(ritual) {
  const groupedItems = groupAltarItemsByType(ritual.items || []);

  return Object.entries(groupedItems)
    .map(([groupLabel, items]) => {
      return `
        <section class="book-import-group">
          <h3>${escapeHtml(groupLabel)}</h3>

          <ul>
            ${items
              .map((item) => `<li>${escapeHtml(item.label || "Altar Item")}</li>`)
              .join("")}
          </ul>
        </section>
      `;
    })
    .join("");
}

// The optional fields of a recorded working (app components/altar/ArrangeSheets.tsx).
const WORKING_FIELDS = [
  ["intention", "Intention", "What was this working for?", true],
  ["time", "Time", "Dusk, 9pm, the witching hour…", false],
  ["moonPhase", "Moon phase", "Waxing crescent", false],
  ["day", "Day", "Friday", false],
  ["weather", "Weather and season", "Rain, first frost…", false],
  ["deities", "Deities, spirits and ancestors", "Who you called on or honoured", true],
  ["extraItems", "Also used", "Anything not on the altar, one per line", true],
  ["preparation", "Preparation", "Cleansing, grounding, casting a circle…", true],
  ["steps", "What I did", "One step per line", true],
  ["words", "Words spoken", "Chants, petitions, prayers", true],
  ["feelings", "What I felt", "Energy, sensations, emotions", true],
  ["signs", "Signs and omens", "Anything you noticed", true],
  ["results", "Results", "You can add this later", true],
  ["reflection", "Reflection", "What you would keep or change", true],
  ["followUp", "Follow-up", "When to check back, what to do next", true]
];

function renderWorkingField([key, label, placeholder, lines], value = "") {
  const control = lines
    ? `<textarea rows="3" data-working-field="${key}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>`
    : `<input type="text" data-working-field="${key}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}" />`;
  return `<label class="book-import-field">${escapeHtml(label)}${control}</label>`;
}

function openAltarImportModal(ritual) {
  const now = new Date();
  const defaults = {
    moonPhase: typeof approximateMoonPhase === "function" ? approximateMoonPhase(now) : "",
    day: now.toLocaleDateString(undefined, { weekday: "long" })
  };
  const bodyHtml = `
    <div class="book-import-modal">
      <p class="eyebrow">Record in Grimoire</p>

      <h2>${escapeHtml(ritual.name || "Ritual Working")}</h2>

      <p>
        A page in your Grimoire for this spell or working. Fill in as much or as little
        as you like; you can keep adding to it in the Grimoire.
      </p>

      <label class="book-import-field">
        Name
        <input type="text" data-import-title value="${escapeHtml(ritual.name || "Ritual Working")}" />
      </label>

      <fieldset class="book-import-field book-import-kinds">
        <legend>Type of working</legend>
        ${WORKING_KINDS.map((kind) => `<label class="book-import-kind"><input type="radio" name="working-kind" value="${escapeHtml(kind)}" /> ${escapeHtml(kind)}</label>`).join("")}
      </fieldset>

      ${WORKING_FIELDS.slice(0, 6).map((field) => renderWorkingField(field, defaults[field[0]] || "")).join("")}

      <div class="book-import-summary">
        ${renderAltarImportSummary(ritual)}
      </div>

      ${WORKING_FIELDS.slice(6).map((field) => renderWorkingField(field)).join("")}

      <div class="book-import-actions">
        <button class="button" type="button" data-cancel-altar-import>
          Cancel
        </button>

        <button class="button button--primary" type="button" data-create-altar-ritual>
          Create Page
        </button>
      </div>
    </div>
  `;

  openModal("Record in Grimoire", bodyHtml);

  const root = document.querySelector("[data-book-modal-root]");
  if (!root) return;

  const cancelButton = root.querySelector("[data-cancel-altar-import]");
  const createButton = root.querySelector("[data-create-altar-ritual]");
  const titleInput = root.querySelector("[data-import-title]");

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      localStorage.removeItem(ALTAR_GRIMOIRE_HANDOFF_KEY);
      closeBookModal(null);
    });
  }

  if (createButton) {
    createButton.addEventListener("click", async () => {
      const details = {};
      root.querySelectorAll("[data-working-field]").forEach((field) => {
        details[field.dataset.workingField] = field.value;
      });
      details.kind = root.querySelector('input[name="working-kind"]:checked')?.value || "";
      const name = titleInput ? titleInput.value.trim() : "";

      createButton.disabled = true;
      createButton.textContent = "Saving…";
      const saved = await createRitualPageFromAltarImport(name ? { ...ritual, name } : ritual, details);
      if (!saved) {
        // Keep what was written and the altar items, so nothing is lost.
        createButton.disabled = false;
        createButton.textContent = "Create Page";
        return;
      }

      localStorage.removeItem(ALTAR_GRIMOIRE_HANDOFF_KEY);
      closeBookModal(null);
    });
  }
}
