/* =========================================================
   ALTAR GROUPS
   Selection mode, ritual groups, and grimoire handoff
   ========================================================= */

function ensureObjectId(object) {
  if (!object.dataset.altarObjectId) {
    object.dataset.altarObjectId =
      crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
  }

  return object.dataset.altarObjectId;
}

function getGroupById(groupId) {
  return altarGroups.find((group) => group.id === groupId) || null;
}

function getActiveGroup() {
  return getGroupById(activeGroupId);
}

function getGroupObjects(groupId) {
  const group = getGroupById(groupId);

  if (!group || !Array.isArray(group.objectIds)) return [];

  return group.objectIds
    .map((objectId) =>
      altarStage.querySelector(`.altar-object[data-altar-object-id="${objectId}"]`)
    )
    .filter(Boolean);
}

function syncGroupObjectClasses() {
  // Clear the old marks; the selected object's group is outlined again (updateSelectedGroupVisuals).
  altarStage.querySelectorAll(".altar-object").forEach((object) => {
    object.classList.remove("is-ritual-grouped", "is-group-active");
    object.classList.toggle("is-ritual-grouped", !!object.dataset.groupId && !!getGroupById(object.dataset.groupId));
  });
  if (typeof selectedObject !== "undefined" && selectedObject) updateSelectedGroupVisuals(selectedObject);
}

/** Tell the selection bar (altar-select.js) that what's chosen has changed. */
function announceRitualSelection() {
  document.dispatchEvent(new CustomEvent("altar:selection-changed", { detail: { count: selectedRitualItems.length, selecting: altarSelectionMode } }));
}

/** Members of the object's group (or just the object): choosing one of a group chooses the group. */
function ritualItemsWith(object) {
  if (!object) return [];
  const members = object.dataset.groupId ? getGroupObjects(object.dataset.groupId) : [];
  return members.includes(object) ? members : [object];
}

function updateSelectedGroupVisuals(object) {
  altarStage.querySelectorAll(".altar-object").forEach((item) => {
    item.classList.remove("is-group-active");
  });

  if (!object || !object.dataset.groupId) return;

  getGroupObjects(object.dataset.groupId).forEach((groupObject) => {
    if (groupObject !== object) {
      groupObject.classList.add("is-group-active");
    }
  });
}

function updateGroupIndicator() {
  if (!altarGroupIndicator) return;

  const activeGroup = getActiveGroup();

  if (!activeGroup) {
    altarGroupIndicator.hidden = true;
    altarGroupIndicator.textContent = "";
    return;
  }

  const itemCount = getGroupObjects(activeGroup.id).length;

  altarGroupIndicator.hidden = false;
  altarGroupIndicator.textContent =
    `Active group: ${activeGroup.name} · ${itemCount} item${itemCount === 1 ? "" : "s"}`;
}

function toggleRitualSelectionMode(start = null) {
  altarSelectionMode = !altarSelectionMode;
  altarStage.classList.toggle("is-selecting-ritual-items", altarSelectionMode);

  if (!altarSelectionMode) {
    clearRitualSelection();
    return;
  }

  deselectObject();
  clearCandleDressingMode();
  if (start) toggleRitualItem(start);
  announceRitualSelection();
}

/** A tap in Select mode: the object (with its group) is chosen, or left out again. */
function toggleRitualItem(object) {
  if (!object) return;

  const alreadySelected = selectedRitualItems.includes(object);
  const these = ritualItemsWith(object);

  if (alreadySelected) {
    selectedRitualItems = selectedRitualItems.filter((item) => !these.includes(item));
    these.forEach((item) => item.classList.remove("is-ritual-selected"));
  } else {
    these.forEach((item) => {
      if (!selectedRitualItems.includes(item)) selectedRitualItems.push(item);
      item.classList.add("is-ritual-selected");
    });
  }
  announceRitualSelection();
}

/** Choose these objects (all of them, or none). */
function setRitualSelection(objects) {
  selectedRitualItems.forEach((object) => object.classList.remove("is-ritual-selected"));
  selectedRitualItems = [...new Set(objects)].filter((object) => object && object.isConnected);
  selectedRitualItems.forEach((object) => object.classList.add("is-ritual-selected"));
  announceRitualSelection();
}

function clearRitualSelection() {
  selectedRitualItems.forEach((object) => {
    object.classList.remove("is-ritual-selected");
  });

  selectedRitualItems = [];
  altarSelectionMode = false;
  altarStage.classList.remove("is-selecting-ritual-items");
  announceRitualSelection();
}

/**
 * After objects leave the altar: a group left with fewer than two members is
 * no group at all, and a cord tied to a candle that's gone is untied
 * (the app's selection.removeObjects).
 */
function tidyAfterRemoval(removedIds = []) {
  const live = new Set([...altarStage.querySelectorAll(".altar-object")].map((o) => o.dataset.altarObjectId).filter(Boolean));
  altarGroups = altarGroups
    .map((group) => ({ ...group, objectIds: (Array.isArray(group.objectIds) ? group.objectIds : []).filter((id) => live.has(id)) }))
    .filter((group) => group.objectIds.length > 1);
  const kept = new Set(altarGroups.map((group) => group.id));
  altarStage.querySelectorAll(".altar-object").forEach((object) => {
    if (object.dataset.groupId && !kept.has(object.dataset.groupId)) object.dataset.groupId = "";
  });
  if (activeGroupId && !kept.has(activeGroupId)) activeGroupId = altarGroups[0] ? altarGroups[0].id : null;
  const cord = window.SaltCore && window.SaltCore.altar && window.SaltCore.altar.cord;
  if (cord && removedIds.length && window.altarExtraFields && window.altarExtraFields.cords) {
    const tidied = cord.withoutCordsFor({ objects: [], groups: [], activeGroupId: null, background: "", backgroundName: "", extra: { ...window.altarExtraFields } }, removedIds);
    window.altarExtraFields = tidied.extra;
    document.dispatchEvent(new CustomEvent("altar:cords-changed"));
  }
  syncGroupObjectClasses();
  updateGroupIndicator();
}

function chooseActiveGroup() {
  if (altarGroups.length === 0) {
    showAltarToast("Create a group first");
    return null;
  }

  if (altarGroups.length === 1) {
    activeGroupId = altarGroups[0].id;
    updateGroupIndicator();
    return altarGroups[0];
  }

  const groupList = altarGroups
    .map((group, index) => {
      const itemCount = getGroupObjects(group.id).length;
      return `${index + 1}. ${group.name} (${itemCount} item${itemCount === 1 ? "" : "s"})`;
    })
    .join("\n");

  const choice = window.prompt(`Choose a group:\n\n${groupList}`, "1");
  const selectedIndex = Number(choice) - 1;
  const selectedGroup = altarGroups[selectedIndex];

  if (!selectedGroup) {
    showAltarToast("No group selected");
    return null;
  }

  activeGroupId = selectedGroup.id;
  updateGroupIndicator();

  return selectedGroup;
}

/**
 * Group what's chosen so it moves together (the app's editor.groupObjects):
 * named in a small sheet unless a name is given. They stay chosen.
 */
function groupSelectedRitualItems(name) {
  if (selectedRitualItems.length < 2) {
    showAltarToast("Choose at least two things to group");
    return;
  }

  if (typeof name !== "string") {
    const B = window.AltarApp;
    if (!B || !B.openSheet) {
      groupSelectedRitualItems(window.prompt("Name this group:", "Ritual Working") || "Ritual Working");
      return;
    }
    const count = selectedRitualItems.length;
    B.openSheet({
      eyebrow: "Group",
      title: "Group things together",
      html: `<p class="app-caption">Grouped things move, turn and resize together. A working, a spell or a shrine within the altar.</p>
        <label class="app-field"><span>Group name</span><input data-group-name placeholder="Ritual Working" maxlength="60"></label>
        <button type="button" class="app-button" data-group-go>Group ${count} things</button>`,
      onMount(body, dialog, close) {
        const go = () => {
          const value = body.querySelector("[data-group-name]").value;
          close();
          if (typeof pushAltarUndoSnapshot === "function") pushAltarUndoSnapshot();
          groupSelectedRitualItems(value || "Ritual Working");
        };
        body.querySelector("[data-group-go]").addEventListener("click", go);
        body.querySelector("[data-group-name]").addEventListener("keydown", (event) => { if (event.key === "Enter") go(); });
      }
    });
    return;
  }

  const groupId = `group-${crypto.randomUUID ? crypto.randomUUID() : String(Date.now())}`;
  const chosen = [...selectedRitualItems];
  const objectIds = chosen.map((object) => {
    const objectId = ensureObjectId(object);
    object.dataset.groupId = groupId;
    return objectId;
  });

  // Things already in another group move to this one; a group left with one member is no group.
  altarGroups = altarGroups
    .map((group) => ({ ...group, objectIds: (Array.isArray(group.objectIds) ? group.objectIds : []).filter((id) => !objectIds.includes(id)) }))
    .filter((group) => group.objectIds.length > 1);
  const live = new Set(altarGroups.map((group) => group.id));
  altarStage.querySelectorAll(".altar-object").forEach((object) => {
    if (object.dataset.groupId && object.dataset.groupId !== groupId && !live.has(object.dataset.groupId)) object.dataset.groupId = "";
  });

  altarGroups.push({
    id: groupId,
    name: name.trim() || "Ritual Working",
    createdAt: new Date().toISOString(),
    objectIds
  });
  activeGroupId = groupId;

  syncGroupObjectClasses();
  updateGroupIndicator();
  saveWorkingAltarDraft();
  announceRitualSelection();
  if (window.AltarApp && window.AltarApp.notice) window.AltarApp.notice("Grouped. They move together now; select one to see the group.");
}

function ungroupCurrentItems(groupId = "") {
  const activeGroup = groupId ? getGroupById(groupId) : chooseActiveGroup();
  if (!activeGroup) return;

  altarStage.querySelectorAll(".altar-object").forEach((object) => {
    if (object.dataset.groupId === activeGroup.id) object.dataset.groupId = "";
  });

  altarGroups = altarGroups.filter((group) => group.id !== activeGroup.id);
  activeGroupId = altarGroups.length > 0 ? altarGroups[0].id : null;

  syncGroupObjectClasses();
  updateGroupIndicator();
  saveWorkingAltarDraft();
  announceRitualSelection();
  showAltarToast("Ungrouped");
}

function altarObjectToRitualItem(object) {
  return {
    id: object.dataset.altarObjectId || "",
    label: object.dataset.label || "Altar Item",
    type: object.dataset.type || "item",
    herb: object.dataset.herb || "",
    form: object.dataset.form || "",
    color: object.dataset.color || "",
    dressings: JSON.stringify(
      typeof getDressings === "function" ? getDressings(object) : []
    )
  };
}

// Everything on the altar (or the group) written down for the Grimoire page:
// each thing under its kind with all that was written about it, then this
// altar's petitions, open and finished since it was last recorded
// (js/core/altar.js altarRecord, shared with the app). [] when it can't be read.
async function altarRecordFor(objects, groupOnly) {
  const core = window.SaltCore?.altar;
  const B = window.AltarApp;
  if (!core?.altarRecord || !B) return [];
  try {
    const altarId = B.altarId() || null;
    const list = async (collection) => {
      try { return (await window.SaltCraft?.list(collection)) || []; } catch { return []; }
    };
    const [petitions, tendings, history] = altarId ? await Promise.all([list("altar.petitions"), list("tend.rhythms"), list("altar.history")]) : [[], [], []];
    const blocks = core.altarRecord.altarRecordBlocks(objects.map(B.toSaved), {
      now: new Date(),
      altarId,
      petitions,
      tendings: tendings.map((e) => e.data),
      since: altarId ? core.altarRecord.lastRecordedAt(history, altarId) : "",
      allObjects: B.doc().objects,
      groupOnly
    });
    if (altarId && !groupOnly) window.SaltCraft?.add("altar.history", { altarId, text: core.altarRecord.RECORDED_LINE, at: new Date().toISOString(), recorded: true }).catch(() => {});
    return blocks;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function sendCurrentGroupToGrimoire() {
  const activeGroup = chooseActiveGroup();
  if (!activeGroup) return;

  const groupObjects = getGroupObjects(activeGroup.id);

  if (groupObjects.length === 0) {
    showAltarToast("That group is empty");
    return;
  }

  const handoffGroup = {
    id: activeGroup.id,
    name: activeGroup.name,
    createdAt: activeGroup.createdAt,
    items: groupObjects.map(altarObjectToRitualItem),
    record: await altarRecordFor(groupObjects, true)
  };

  localStorage.setItem(
    ALTAR_GRIMOIRE_HANDOFF_KEY,
    JSON.stringify(handoffGroup)
  );

  window.location.href = "../grimoire/index.html?import=altar";
}

// Record everything on the altar as a page in the Grimoire, for a spell or
// working done without the ritual builder (the group version, for the whole altar).
async function sendAltarToGrimoire() {
  const objects = Array.from(altarStage.querySelectorAll(".altar-object"));

  if (objects.length === 0) {
    showAltarToast("Place something on the altar first");
    return;
  }

  const handoff = {
    id: `altar-${Date.now()}`,
    name: "Altar Working",
    createdAt: new Date().toISOString(),
    items: objects.map(altarObjectToRitualItem),
    record: await altarRecordFor(objects, false)
  };

  localStorage.setItem(ALTAR_GRIMOIRE_HANDOFF_KEY, JSON.stringify(handoff));
  window.location.href = "../grimoire/index.html?import=altar";
}

/* =========================================================
   GROUP CREATION CHOICES
   Group or create Apothecary item from selected ingredients
   ========================================================= */

function openGroupCreationChoiceModal() {
  // Nothing chosen yet: start choosing, and say how.
  if (selectedRitualItems.length === 0) {
    if (!altarSelectionMode) toggleRitualSelectionMode();
    if (window.AltarApp && window.AltarApp.notice) window.AltarApp.notice("Tap the things to group on the altar, then Group.");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "group-choice-modal";
  modal.setAttribute("data-group-choice-modal", "");

  modal.innerHTML = `
    <div class="group-choice-card" role="dialog" aria-modal="true" aria-label="Create from selected items">
      <button class="altar-cabinet-close" type="button" data-close-group-choice aria-label="Close">
        ×
      </button>

      <p class="eyebrow">Selected ingredients</p>
      <h2>What are you creating?</h2>

      <p>
        Bind these selected items together as a simple group, or preserve them as something made for My Apothecary.
      </p>

      <div class="group-choice-grid">
        <button type="button" data-group-choice="group">
          <strong>Create Group</strong>
          <span>Keep these altar objects linked together.</span>
        </button>

        <button type="button" data-group-choice="spell-jar">
          <strong>Create Spell Jar</strong>
          <span>Save these ingredients as a reusable spell jar.</span>
        </button>

        <button type="button" data-group-choice="oil-tincture">
          <strong>Create Oil / Tincture</strong>
          <span>Save these ingredients as an oil or tincture.</span>
        </button>

        <button type="button" data-group-choice="herb-mix">
          <strong>Create Herb Mix</strong>
          <span>Save these ingredients as a loose blend.</span>
        </button>

        <button type="button" data-group-choice="incense">
          <strong>Create Incense</strong>
          <span>Save these ingredients as an incense blend.</span>
        </button>

        <button type="button" data-group-choice="sachet">
          <strong>Create Sachet</strong>
          <span>Save these ingredients as a sachet.</span>
        </button>

        <button type="button" data-group-choice="poppet">
          <strong>Create Poppet</strong>
          <span>Save these ingredients as a poppet.</span>
        </button>

        <button type="button" data-group-choice="spray">
          <strong>Create Spray</strong>
          <span>Save these ingredients as a spray, mist, or wash.</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add("altar-modal-open");
}

function closeGroupCreationChoiceModal() {
  const modal = document.querySelector("[data-group-choice-modal]");
  if (!modal) return;

  modal.remove();
  document.body.classList.remove("altar-modal-open");
}

function handleGroupCreationChoice(choice) {
  closeGroupCreationChoiceModal();

  if (choice === "group") {
    groupSelectedRitualItems();
    return;
  }

  if (["spell-jar", "oil-tincture", "herb-mix", "incense", "sachet", "poppet", "spray"].includes(choice)) {
    if (typeof openCreateApothecaryModal === "function") {
      openCreateApothecaryModal(choice);
    } else {
      showAltarToast("My Apothecary is not ready yet");
    }
  }
}

document.addEventListener("click", (event) => {
  const choiceButton = event.target.closest("[data-group-choice]");
  const closeButton = event.target.closest("[data-close-group-choice]");
  const modal = event.target.closest("[data-group-choice-modal]");

  if (choiceButton) {
    handleGroupCreationChoice(choiceButton.dataset.groupChoice);
  }

  if (closeButton) {
    closeGroupCreationChoiceModal();
  }

  if (modal && event.target === modal) {
    closeGroupCreationChoiceModal();
  }
});
