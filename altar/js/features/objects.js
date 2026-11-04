/* =========================================================
   ALTAR OBJECTS
   Object transforms, placement, dragging, duplication, delete
   ========================================================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updateObjectTransform(object) {
  const scale = Number(object.dataset.scale || 1);
  const rotation = Number(object.dataset.rotation || 0);
  const flipped = object.dataset.flipped === "true" ? -1 : 1;

  object.style.transform =
    `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale}) scaleX(${flipped})`;
}

function getObjectImagePath(object) {
  const img = object.querySelector(
    "img:not(.candle-herb-overlay):not(.candle-oil-overlay)"
  );

  // The picture's own .png path, though the altar shows its WebP twin (js/sanctuary-asset-catalog.js).
  return img ? window.SanctuaryAssetCatalog?.imagePath?.(img) ?? img.getAttribute("src") : "";
}

const altarUndoStack = [];
const altarRedoStack = [];
let dragStartSnapshot = null;
let activeObjectPointerId = null;
const completedPlacementRequests = new Set();

function resetAltarPointerState() {
  if (activeObject && activeObjectPointerId != null && activeObject.hasPointerCapture?.(activeObjectPointerId)) {
    activeObject.releasePointerCapture(activeObjectPointerId);
  }
  document.querySelectorAll(".altar-object.is-dragging").forEach((object) => object.classList.remove("is-dragging"));
  activeObject = null;
  activeObjectPointerId = null;
  offsetX = 0;
  offsetY = 0;
  dragStartSnapshot = null;
}

function captureAltarSnapshot() {
  if (!altarStage) return null;

  const objects = Array.from(altarStage.querySelectorAll(".altar-object")).map((object) => {
    const position = getStagePositionPercent(object);

    return {
      ...(typeof savedObjectExtras === "function" ? savedObjectExtras(object) : {}),
      imagePath: getObjectImagePath(object),
      fallbackSymbol: typeof objectFallbackSymbol === "function" ? objectFallbackSymbol(object) : object.textContent || "",
      label: object.dataset.label || "object",
      type: object.dataset.type || "",
      herb: object.dataset.herb || "",
      form: object.dataset.form || "",
      color: object.dataset.color || "",
      crystal: object.dataset.crystal || "",
      tool: object.dataset.tool || "",
      vessel: object.dataset.vessel || "",
      deity: object.dataset.deity || "",
      apothecaryItemId: object.dataset.apothecaryItemId || "",
      apothecaryType: object.dataset.apothecaryType || "",
      apothecaryIngredients: object.dataset.apothecaryIngredients || "[]",
      apothecaryIntention: object.dataset.apothecaryIntention || "",
      apothecaryNotes: object.dataset.apothecaryNotes || "",
      apothecaryLogToGrimoire: object.dataset.apothecaryLogToGrimoire || "false",
      apothecaryGrimoireStatus: object.dataset.apothecaryGrimoireStatus || "",
      scale: object.dataset.scale || "1",
      rotation: object.dataset.rotation || "0",
      flipped: object.dataset.flipped || "false",
      locked: object.dataset.locked || "false",
      glowing: object.dataset.glowing || "false",
      lit: object.dataset.lit || "false",
      ritualIncluded: object.dataset.ritualIncluded || "false",
      livingState: object.dataset.livingState || "",
      plaqueText: object.dataset.plaqueText || "",
      altarObjectId: object.dataset.altarObjectId || "",
      groupId: object.dataset.groupId || "",
      leftPercent: position.leftPercent,
      topPercent: position.topPercent,
      sizePercent: position.sizePercent,
      zIndex: object.style.zIndex || "10"
    };
  });

  return {
    background: altarStage.dataset.background || "",
    backgroundName: altarStage.dataset.backgroundName || "",
    groups: Array.isArray(altarGroups) ? JSON.parse(JSON.stringify(altarGroups)) : [],
    activeGroupId,
    // The altar's other fields (a cord tied between candles), so Undo takes them back too.
    extra: JSON.parse(JSON.stringify(window.altarExtraFields || {})),
    objects
  };
}

function pushAltarUndoSnapshot(snapshot = captureAltarSnapshot()) {
  if (!snapshot) return;

  altarUndoStack.push(snapshot);

  if (altarUndoStack.length > 60) {
    altarUndoStack.shift();
  }

  altarRedoStack.length = 0;
}

function restoreAltarSnapshot(snapshot) {
  if (!snapshot || !altarStage) return;

  altarStage.querySelectorAll(".altar-object").forEach((object) => {
    stopFlame(object);
    object.remove();
  });

  deselectObject();
  clearCandleDressingMode();

  if (snapshot.background) {
    altarStage.style.backgroundImage = `url("${window.SanctuaryAssetCatalog?.displayPath?.(snapshot.background) || snapshot.background}")`;
    altarStage.dataset.background = snapshot.background;
    altarStage.dataset.backgroundName = snapshot.backgroundName || "";
  }

  altarGroups = Array.isArray(snapshot.groups) ? JSON.parse(JSON.stringify(snapshot.groups)) : [];
  activeGroupId = snapshot.activeGroupId || null;
  if (snapshot.extra && typeof snapshot.extra === "object") window.altarExtraFields = JSON.parse(JSON.stringify(snapshot.extra));

  highestLayer = 10;

  (snapshot.objects || []).forEach((savedObject) => {
    const object = createSavedObject(savedObject);
    altarStage.appendChild(object);

    highestLayer = Math.max(highestLayer, Number(savedObject.zIndex || 10));

    // Hidden until placed (storage.js), so it never shows at the corner first.
    placeAltarObjectWhenReady(object, savedObject, { fade: false });
  });

  updateGroupIndicator();
  syncGroupObjectClasses();
  updateEmptyMessage();
  if (typeof clearRitualSelection === "function" && altarSelectionMode) setRitualSelection([]);
  document.dispatchEvent(new CustomEvent("altar:cords-changed"));
}

function undoAltarChange() {
  if (altarUndoStack.length === 0) {
    showAltarToast("Nothing to undo");
    return;
  }

  const currentSnapshot = captureAltarSnapshot();
  const previousSnapshot = altarUndoStack.pop();

  if (currentSnapshot) {
    altarRedoStack.push(currentSnapshot);
  }

  restoreAltarSnapshot(previousSnapshot);
  saveWorkingAltarDraft();
  showAltarToast("Undone");
}

function redoAltarChange() {
  if (altarRedoStack.length === 0) {
    showAltarToast("Nothing to redo");
    return;
  }

  const currentSnapshot = captureAltarSnapshot();
  const nextSnapshot = altarRedoStack.pop();

  if (currentSnapshot) {
    altarUndoStack.push(currentSnapshot);
  }

  restoreAltarSnapshot(nextSnapshot);
  saveWorkingAltarDraft();
  showAltarToast("Redone");
}

/* A salt circle or salt rectangle (app/src/lib/altar/geometry.ts isSaltBorder):
   it may hang off the stage like a cloth, grow to frame the whole altar, and is
   hollow, touched only on its line. */
function isSaltBorderObject(object) {
  return !!window.SaltCore?.altar?.geometry?.isSaltBorder?.({ type: object?.dataset?.type || "", tool: object?.dataset?.tool || "" });
}

/** Holds like a cloth on the stage: a cloth, or a salt border. */
function hangsLikeCloth(object) {
  return object?.dataset?.type === "cloth" || isSaltBorderObject(object);
}

/**
 * Make a salt border hollow: the button itself takes no touches, and an SVG
 * of its salt line (geometry.ts saltLinePath, the same line the app's hitTest
 * uses) laid over the picture does, so a tap inside reaches what lies within.
 */
function markSaltLine(object) {
  const geometry = window.SaltCore?.altar?.geometry;
  const line = geometry?.saltLineOf?.({ type: object.dataset.type || "", tool: object.dataset.tool || "", form: object.dataset.form || "" });
  object.querySelector(".altar-object__salt-line")?.remove();
  object.classList.toggle("altar-object--salt-line", !!line);
  if (!line) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "altar-object__salt-line");
  svg.setAttribute("viewBox", `0 0 1000 ${1000 * line.ratio}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", geometry.saltLinePath(line));
  path.setAttribute("fill-rule", "evenodd");
  svg.appendChild(path);
  object.appendChild(svg);
}

function keepObjectInsideStage(object) {
  if (!altarStage || !object) return;

  if (hangsLikeCloth(object)) return;

  const scale = Number(object.dataset.scale || 1);
  const visualWidth = object.offsetWidth * scale;
  const visualHeight = object.offsetHeight * scale;

  let x = parseFloat(object.style.left) || 0;
  let y = parseFloat(object.style.top) || 0;

  const minX = visualWidth / 2;
  const minY = visualHeight / 2;
  const maxX = altarStage.clientWidth - visualWidth / 2;
  const maxY = altarStage.clientHeight - visualHeight / 2;

  x = Math.max(minX, Math.min(x, maxX));
  y = Math.max(minY, Math.min(y, maxY));

  object.style.left = `${x}px`;
  object.style.top = `${y}px`;
}

/** Where an object may move to (px), as the stage allows it: [minX, maxX, minY, maxY] for its centre. */
function objectMoveBounds(object) {
  const scale = Number(object.dataset.scale || 1);
  const visualWidth = object.offsetWidth * scale;
  const visualHeight = object.offsetHeight * scale;
  if (hangsLikeCloth(object)) {
    return [-visualWidth * 0.75, altarStage.clientWidth - visualWidth * 0.25, -visualHeight * 0.75, altarStage.clientHeight - visualHeight * 0.25];
  }
  return [visualWidth / 2, altarStage.clientWidth - visualWidth / 2, visualHeight / 2, altarStage.clientHeight - visualHeight / 2];
}

/**
 * Move these objects together by (dx, dy) px, the move shortened so every one
 * stays on the stage and they keep their places to one another (the app's
 * selection.moveTogether). Locked ones stay put.
 */
function moveObjectsTogether(objects, dx, dy) {
  const moving = [...new Set(objects)].filter((object) => object && object.dataset.locked !== "true");
  if (!moving.length) return;
  let loX = -Infinity, hiX = Infinity, loY = -Infinity, hiY = Infinity;
  moving.forEach((object) => {
    const [minX, maxX, minY, maxY] = objectMoveBounds(object);
    const x = parseFloat(object.style.left) || 0;
    const y = parseFloat(object.style.top) || 0;
    loX = Math.max(loX, Math.min(0, minX - x));
    hiX = Math.min(hiX, Math.max(0, maxX - x));
    loY = Math.max(loY, Math.min(0, minY - y));
    hiY = Math.min(hiY, Math.max(0, maxY - y));
  });
  const mx = loX > hiX ? 0 : Math.max(loX, Math.min(hiX, dx));
  const my = loY > hiY ? 0 : Math.max(loY, Math.min(hiY, dy));
  if (!mx && !my) return;
  moving.forEach((object) => {
    object.style.left = `${(parseFloat(object.style.left) || 0) + mx}px`;
    object.style.top = `${(parseFloat(object.style.top) || 0) + my}px`;
    updateObjectPositionPercent(object);
  });
  renderLighting();
  document.dispatchEvent(new CustomEvent("altar:objects-moved"));
}

function resizeObject(object, amount) {
  if (!object || object.dataset.locked === "true") return;

  const objectsToResize = object.dataset.groupId
    ? getGroupObjects(object.dataset.groupId)
    : [object];

  objectsToResize.forEach((item) => {
    if (item.dataset.locked === "true") return;

    const oldScale = Number(item.dataset.scale || 1);
    const oldLeft = parseFloat(item.style.left) || 0;
    const oldTop = parseFloat(item.style.top) || 0;

    const centerX = oldLeft;
    const centerY = oldTop;

    // A salt border grows by a tenth at a time, up to twice the altar's width (geometry.ts sizeLimitsOf).
    const border = isSaltBorderObject(item);
    let newScale = border ? oldScale * (1 + amount) : oldScale + amount;
    const borderMax = ((window.SaltCore?.altar?.geometry?.SALT_BORDER_MAX_SIZE || 2) * altarStage.clientWidth) / (item.offsetWidth || 80);
    const maxScale = border ? Math.max(3, borderMax) : item.dataset.type === "cloth" ? 18 : 3;
    const minScale = item.dataset.type === "candle" ? 0.18 : 0.35;

    newScale = Math.max(minScale, Math.min(newScale, maxScale));

    item.dataset.scale = String(newScale);
    updateObjectTransform(item);

    item.style.left = `${centerX}px`;
    item.style.top = `${centerY}px`;

    keepObjectInsideStage(item);
    updateObjectPositionPercent(item);
    renderLighting();
  });

  saveWorkingAltarDraft();
}

function rotateObject(object, amount = 15) {
  if (!object || object.dataset.locked === "true") return;

  const rotation = Number(object.dataset.rotation || 0) + amount;

  object.dataset.rotation = String(rotation);
  updateObjectTransform(object);
  updateObjectPositionPercent(object);
  saveWorkingAltarDraft();
}

function objectLayer(object) {
  return Number(object?.style.zIndex || 10);
}

function otherAltarObjects(object) {
  return Array.from(altarStage.querySelectorAll(".altar-object")).filter((other) => other !== object);
}

/** One step up: trade places with the nearest object above, or rise to the top. */
function bringForward(object) {
  if (!object) return;

  const currentLayer = objectLayer(object);
  const above = otherAltarObjects(object)
    .filter((other) => objectLayer(other) >= currentLayer)
    .sort((a, b) => objectLayer(a) - objectLayer(b))[0];
  if (above && objectLayer(above) > currentLayer) {
    object.style.zIndex = objectLayer(above);
    above.style.zIndex = currentLayer;
  } else {
    highestLayer = Math.max(highestLayer, currentLayer) + 1;
    object.style.zIndex = highestLayer;
  }
  saveWorkingAltarDraft();
}

/** One step down: trade places with the nearest object below. */
function sendBackward(object) {
  if (!object) return;

  const currentLayer = objectLayer(object);
  const below = otherAltarObjects(object)
    .filter((other) => objectLayer(other) <= currentLayer)
    .sort((a, b) => objectLayer(b) - objectLayer(a))[0];
  if (below && objectLayer(below) < currentLayer) {
    object.style.zIndex = objectLayer(below);
    below.style.zIndex = currentLayer;
  } else {
    object.style.zIndex = Math.max(1, currentLayer - 1);
  }
  saveWorkingAltarDraft();
}

/** In front of everything on the altar. */
function bringToFront(object) {
  if (!object) return;

  highestLayer += 1;
  object.style.zIndex = highestLayer;
  saveWorkingAltarDraft();
}

/** Behind everything on the altar, never below layer 1. */
function sendToBack(object) {
  if (!object) return;

  const layers = otherAltarObjects(object).map(objectLayer);
  const lowest = layers.length ? Math.min(...layers) : objectLayer(object);
  object.style.zIndex = Math.max(1, lowest - 1);
  saveWorkingAltarDraft();
}

function flipObject(object) {
  if (!object || object.dataset.locked === "true") return;

  object.dataset.flipped = object.dataset.flipped === "true" ? "false" : "true";
  updateObjectTransform(object);
  saveWorkingAltarDraft();
}

function toggleLock(object) {
  if (!object) return;

  const isLocked = object.dataset.locked === "true";

  object.dataset.locked = isLocked ? "false" : "true";
  object.classList.toggle("is-locked", !isLocked);
  saveWorkingAltarDraft();
}

function toggleGlow(object) {
  if (!object) return;

  object.dataset.glowing = object.dataset.glowing === "true" ? "false" : "true";
  object.classList.toggle("has-glow", object.dataset.glowing === "true");
  saveWorkingAltarDraft();
}

function makeDraggable(object) {
  object.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".altar-toolbar")) return;

    if (pendingCandleDressing && object.dataset.type === "candle") {
      dressCandle(object);
      return;
    }

    if (altarSelectionMode) {
      // A tap chooses it (or leaves it out); a drag moves everything chosen with it.
      selectionPress = { object, pointerId: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false, snapshot: captureAltarSnapshot() };
      object.setPointerCapture?.(event.pointerId);
      return;
    }

    selectObject(object);

    if (object.dataset.locked === "true") return;

    dragStartSnapshot = captureAltarSnapshot();
     
    activeObject = object;
    activeObjectPointerId = event.pointerId;

    const stageRect = altarStage.getBoundingClientRect();

    offsetX = event.clientX - stageRect.left - (parseFloat(object.style.left) || 0);
    offsetY = event.clientY - stageRect.top - (parseFloat(object.style.top) || 0);

    object.setPointerCapture(event.pointerId);
    object.classList.add("is-dragging");
  });

  object.addEventListener("pointermove", (event) => {
    if (selectionPress && selectionPress.object === object && selectionPress.pointerId === event.pointerId) {
      if (!selectionPress.moved && Math.hypot(event.clientX - selectionPress.x, event.clientY - selectionPress.y) < 6) return;
      selectionPress.moved = true;
      // Dragging something chosen moves all that's chosen; something not chosen moves alone (with its group).
      const together = selectedRitualItems.includes(object) ? selectedRitualItems : (typeof ritualItemsWith === "function" ? ritualItemsWith(object) : [object]);
      moveObjectsTogether(together, event.clientX - selectionPress.lastX, event.clientY - selectionPress.lastY);
      selectionPress.lastX = event.clientX;
      selectionPress.lastY = event.clientY;
      return;
    }
    if (activeObject !== object || object.dataset.locked === "true") return;

    const stageRect = altarStage.getBoundingClientRect();
    const scale = Number(object.dataset.scale || 1);

    let x = event.clientX - stageRect.left - offsetX;
    let y = event.clientY - stageRect.top - offsetY;

    if (hangsLikeCloth(object)) {
      const visualWidth = object.offsetWidth * scale;
      const visualHeight = object.offsetHeight * scale;

      const minX = -visualWidth * 0.75;
      const minY = -visualHeight * 0.75;
      const maxX = altarStage.clientWidth - visualWidth * 0.25;
      const maxY = altarStage.clientHeight - visualHeight * 0.25;

      x = Math.max(minX, Math.min(x, maxX));
      y = Math.max(minY, Math.min(y, maxY));
    } else {
      const visualWidth = object.offsetWidth * scale;
      const visualHeight = object.offsetHeight * scale;
      
      const minX = visualWidth / 2;
      const minY = visualHeight / 2;
      const maxX = altarStage.clientWidth - visualWidth / 2;
      const maxY = altarStage.clientHeight - visualHeight / 2;
      
      x = Math.max(minX, Math.min(x, maxX));
      y = Math.max(minY, Math.min(y, maxY));
    }

    const oldX = parseFloat(object.style.left) || 0;
    const oldY = parseFloat(object.style.top) || 0;
    const deltaX = x - oldX;
    const deltaY = y - oldY;

    // A group moves as one, kept whole on the stage, so its members keep their places to one another.
    const groupObjects = object.dataset.groupId ? getGroupObjects(object.dataset.groupId) : [];
    if (groupObjects.length > 1 && groupObjects.includes(object)) {
      moveObjectsTogether(groupObjects, deltaX, deltaY);
      return;
    }

    object.style.left = `${x}px`;
    object.style.top = `${y}px`;

    updateObjectPositionPercent(object);
    renderLighting();
    document.dispatchEvent(new CustomEvent("altar:objects-moved"));
  });

  object.addEventListener("pointerup", (event) => {
    if (selectionPress && selectionPress.object === object) {
      const press = selectionPress;
      selectionPress = null;
      if (object.hasPointerCapture?.(event.pointerId)) object.releasePointerCapture(event.pointerId);
      if (!press.moved) {
        toggleRitualItem(object);
        return;
      }
      pushAltarUndoSnapshot(press.snapshot);
      saveWorkingAltarDraft();
      return;
    }
    object.classList.remove("is-dragging");

    if (dragStartSnapshot) {
      pushAltarUndoSnapshot(dragStartSnapshot);
      dragStartSnapshot = null;
    }

    saveWorkingAltarDraft();
    activeObject = null;
    activeObjectPointerId = null;
    if (object.hasPointerCapture?.(event.pointerId)) object.releasePointerCapture(event.pointerId);
  });

  object.addEventListener("pointercancel", (event) => {
    if (selectionPress && selectionPress.object === object) {
      if (selectionPress.moved) {
        pushAltarUndoSnapshot(selectionPress.snapshot);
        saveWorkingAltarDraft();
      }
      selectionPress = null;
      return;
    }
    object.classList.remove("is-dragging");

    if (dragStartSnapshot) {
      pushAltarUndoSnapshot(dragStartSnapshot);
      dragStartSnapshot = null;
    }

    saveWorkingAltarDraft();
    activeObject = null;
    activeObjectPointerId = null;
    if (object.hasPointerCapture?.(event.pointerId)) object.releasePointerCapture(event.pointerId);
  });

  object.addEventListener("wheel", (event) => {
    if (selectedObject !== object) return;

    event.preventDefault();

    if (object.dataset.locked === "true") return;

     pushAltarUndoSnapshot();

    resizeObject(object, event.deltaY < 0 ? 0.1 : -0.1);
  });

  object.addEventListener("dblclick", () => {
    if (altarSelectionMode) return;
    deleteObject(object);
  });
}

function placeObject(options) {
  if (!altarStage) return null;
  const requestId = String(options?.requestId || "");
  if (requestId && completedPlacementRequests.has(requestId)) return null;
  pushAltarUndoSnapshot();

  const {
     imagePath,
     fallbackSymbol,
     label,
     type,
     herb,
     form,
     color,
     crystal,
     tool,
     vessel,
     deity,
     apothecaryItemId,
     apothecaryType,
     apothecaryIngredients,
     apothecaryIntention,
     apothecaryNotes,
     apothecaryLogToGrimoire,
     apothecaryGrimoireStatus,
     entityId,
     instanceId,
     offering,
     offeringLabel,
     vesselLabel
   } = options;

  const entityName =
    label ||
    herb ||
    crystal ||
    deity ||
    tool ||
    vessel ||
    color ||
    "Object";

  const entityType =
    herb ? "herb" :
    crystal ? "crystal" :
    deity ? "deity" :
    tool ? "tool" :
    vessel ? "vessel" :
    type || "object";

  const canonicalEntity = typeof Library !== "undefined" && typeof Library.resolveObjectEntity === "function"
    ? Library.resolveObjectEntity({ entityId, herb, crystal, deity, tool, vessel, color, type })
    : null;
  const existingEntity = canonicalEntity || (
    entityId && typeof Library !== "undefined"
      ? Library.getEntity(entityId)
      : null
  );

  const entity = existingEntity || Library.getOrCreateEntity({
    name: entityName,
    type: entityType,
    image: imagePath || ""
  });
  const object = document.createElement("button");

  object.type = "button";
  object.className = "altar-object";

  object.dataset.label = label || "object";
  object.dataset.type = type || "";
  object.dataset.entityId = entity.id;
  object.dataset.instanceId = instanceId || "";
  object.dataset.herb = herb || "";
  object.dataset.form = form || "";
  object.dataset.color = color || "";

  object.dataset.crystal = crystal || "";
  object.dataset.tool = tool || "";
  object.dataset.vessel = vessel || "";
  object.dataset.deity = deity || "";

  object.dataset.apothecaryItemId = apothecaryItemId || "";
  object.dataset.apothecaryType = apothecaryType || "";
  object.dataset.apothecaryIngredients = apothecaryIngredients || "[]";

  object.dataset.apothecaryIntention = apothecaryIntention || "";
  object.dataset.apothecaryNotes = apothecaryNotes || "";
  object.dataset.apothecaryLogToGrimoire = apothecaryLogToGrimoire || "false";
  object.dataset.apothecaryGrimoireStatus = apothecaryGrimoireStatus || "";

  const saltBorder = !!window.SaltCore?.altar?.geometry?.isSaltBorder?.({ type: type || "", tool: tool || "" });
  const startingScale = type === "cloth" || saltBorder
    ? "3"
    : String(Math.max(0.75, Math.min(1.35, altarStage.clientWidth / 900)));

  object.dataset.scale = startingScale;
  object.dataset.rotation = "0";
  object.dataset.flipped = "false";
  object.dataset.locked = "false";
  // A lamp or lantern is set down glowing, as if lit (app/src/lib/altar/shelf.ts).
  object.dataset.glowing = window.SaltCore?.altar?.shelf?.glowsWhenPlaced({ type: type || "", tool: tool || "", form: form || "" }) ? "true" : "false";
  object.classList.toggle("has-glow", object.dataset.glowing === "true");
  object.dataset.lit = "false";
  if (saltBorder) {
    // Set down under everything but the cloths, so things can be placed within it (app/src/lib/altar/layers.ts bottomLayer).
    const layers = Array.from(altarStage.querySelectorAll(".altar-object")).filter((other) => other.dataset.type !== "cloth").map((other) => Number(other.style.zIndex || 10));
    object.style.zIndex = String(Math.max(1, (layers.length ? Math.min(...layers) : 10) - 1));
  } else {
    highestLayer += 1;
    object.style.zIndex = highestLayer;
  }

  if (imagePath) {
    const img = document.createElement("img");
    if (window.SanctuaryAssetCatalog?.showImage) window.SanctuaryAssetCatalog.showImage(img, imagePath);
    else img.src = imagePath;
    img.alt = label || "altar object";
    img.draggable = false;
    object.appendChild(img);
  } else {
    object.textContent = fallbackSymbol || "";
  }
  // A labelled jar or bottle from the Apothecary (js/vessel-labels.js).
  if (vesselLabel) {
    object.dataset.appExtra = JSON.stringify({ vesselLabel });
    window.VesselLabels?.decorateAltarObject(object);
  }

  object.setAttribute(
    "aria-label",
    `${label || "Object"}. Click to select. Drag to move. Double click to remove.`
  );

  markSaltLine(object);
  altarStage.appendChild(object);

  const scale = Number(object.dataset.scale || 1);
  // The middle of the altar, or a small step aside from what already sits
  // there, so things placed one after another don't stack exactly on top of
  // each other (app/src/lib/altar/cabinet.ts nudgedCenter).
  const stageWidth = altarStage.clientWidth || 1;
  const stageHeight = altarStage.clientHeight || 1;
  const taken = Array.from(altarStage.querySelectorAll(".altar-object"))
    .filter((other) => other !== object)
    .map((other) => ({ cx: (parseFloat(other.style.left) || 0) / stageWidth, cy: (parseFloat(other.style.top) || 0) / stageHeight }));
  const nudge = window.SaltCore?.altar?.cabinet?.nudgedCenter;
  const spot = typeof nudge === "function" ? nudge({ cx: 0.5, cy: 0.5 }, taken) : { cx: 0.5, cy: 0.5 };
  const centerX = spot.cx * stageWidth;
  const centerY = spot.cy * stageHeight;

  object.style.left = `${centerX}px`;
  object.style.top = `${centerY}px`;
   
  updateObjectPositionPercent(object);
  updateObjectTransform(object);
  makeDraggable(object);

  // A filled vessel from the Offerings drawer is set down with its offering
  // already set out, as "Set out an offering" would (app/src/lib/altar/offeringDrawer.ts).
  const offerings = window.SaltCore?.altar?.offerings;
  if (offering && offerings?.offeringKind(offering) && window.AltarApp?.update) {
    window.AltarApp.update(object, (saved) => offerings.setOffering(saved, offering, offeringLabel || "", new Date().toISOString()), { undo: false, quiet: true });
  }

  selectObject(object);
  updateEmptyMessage();
  renderLighting();
  saveWorkingAltarDraft();
  if (requestId) {
    completedPlacementRequests.add(requestId);
    if (completedPlacementRequests.size > 100) completedPlacementRequests.delete(completedPlacementRequests.values().next().value);
  }
  return object;
}

function deleteObject(object) {
  if (!object) return;

   pushAltarUndoSnapshot();

  if (object === selectedObject) {
    clearCandleDressingMode();
  }

  if (object.dataset.type === "candle" && object.dataset.lit === "true" && typeof extinguishCandleObject === "function") {
    extinguishCandleObject(object, "removed_from_altar", { showSummary: false });
  }
  stopFlame(object);
  const removedId = object.dataset.altarObjectId || "";
  object.remove();
  if (typeof tidyAfterRemoval === "function") tidyAfterRemoval(removedId ? [removedId] : []);
  deselectObject();
  renderLighting();
  updateEmptyMessage();
  saveWorkingAltarDraft();
}

/**
 * Take several things off the altar as one step (one undo): the app's
 * selection.removeObjects. Returns how many went.
 */
function deleteObjects(objects) {
  const going = [...new Set(objects)].filter((object) => object && object.isConnected);
  if (!going.length) return 0;
  pushAltarUndoSnapshot();
  const ids = [];
  going.forEach((object) => {
    if (object === selectedObject) clearCandleDressingMode();
    if (object.dataset.type === "candle" && object.dataset.lit === "true" && typeof extinguishCandleObject === "function") {
      extinguishCandleObject(object, "removed_from_altar", { showSummary: false });
    }
    stopFlame(object);
    if (object.dataset.altarObjectId) ids.push(object.dataset.altarObjectId);
    object.remove();
  });
  if (typeof tidyAfterRemoval === "function") tidyAfterRemoval(ids);
  deselectObject();
  renderLighting();
  updateEmptyMessage();
  saveWorkingAltarDraft();
  return going.length;
}

function duplicateObject(object) {
  if (!object || !altarStage) return;

   pushAltarUndoSnapshot();

  const clone = object.cloneNode(true);

  clone.dataset.altarObjectId = crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

  if (clone.dataset.type === "candle" && window.CandleLifecycle && typeof getLivingObjectState === "function" && typeof saveLivingObjectState === "function") {
    // A duplicate is a fresh candle: full life, unlit, unlocked, no burn
    // history. Dressings are copied as before; burn state never is.
    const originalState = getLivingObjectState(object);
    const clonedState = getLivingObjectState(clone);
    clonedState.candle = window.CandleLifecycle.fresh(clone.dataset.form || originalState?.candle?.form, {
      expectedBurnMs: window.CandleLifecycle.formDefinition(clone.dataset.form)?.defaultBurnMs,
      dressings: originalState?.candle?.dressings || []
    });
    delete clone.dataset.instanceId;
    clone.dataset.lit = "false";
    clone.dataset.candleStatus = "unlit";
    clone.dataset.ritualIncluded = "false";
    clone.classList.remove("is-lit", "is-candle-spent", "is-extinguishing");
    saveLivingObjectState(clone, clonedState, { silent: true });
  } else if (typeof getLivingObjectState === "function" && typeof saveLivingObjectState === "function") {
    const clonedState = getLivingObjectState(clone);
    if (clonedState?.candle?.currentBurnStartedAt) {
      const time = new Date().toISOString();
      clonedState.candle.currentBurnStartedAt = time;
      clonedState.candle.lastLitAt = time;
    }
    saveLivingObjectState(clone, clonedState, { silent: true, preserveUpdatedAt: true });
  }

  highestLayer += 1;

  clone.style.left = `${(parseFloat(object.style.left) || 0) + 24}px`;
  clone.style.top = `${(parseFloat(object.style.top) || 0) + 24}px`;
  clone.style.zIndex = highestLayer;

  updateObjectPositionPercent(clone);

  clone.classList.remove("is-selected", "is-dragging", "can-receive-dressing");

  updateCandleDressingVisuals(clone);

  if (clone.dataset.lit === "true") {
    startFlame(clone);
  }

  makeDraggable(clone);

  altarStage.appendChild(clone);
  selectObject(clone);
  updateEmptyMessage();
  renderLighting();
  saveWorkingAltarDraft();
}

/* =========================================================
   COMPANION PANEL EDITING
   Mobile + desktop
   ========================================================= */

function escapeAltarHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCurrentSelectedAltarObject() {
  return selectedObject || document.querySelector(".altar-object.is-selected");
}

function getSelectedCompanionEntity() {
  const object = getCurrentSelectedAltarObject();

  if (!object || typeof Library === "undefined") return null;

  let entityId = typeof Library.resolveCanonicalEntityId === "function"
    ? Library.resolveCanonicalEntityId(object.dataset.entityId)
    : object.dataset.entityId;

  const canonicalEntity = typeof Library.resolveObjectEntity === "function"
    ? Library.resolveObjectEntity({
        entityId,
        herb: object.dataset.herb,
        crystal: object.dataset.crystal,
        deity: object.dataset.deity,
        tool: object.dataset.tool,
        vessel: object.dataset.vessel,
        color: object.dataset.color,
        type: object.dataset.type
      })
    : null;

  if (canonicalEntity) {
    entityId = canonicalEntity.id;
    object.dataset.entityId = entityId;
  }

  if (!entityId) {
    const entityName =
      object.dataset.label ||
      object.dataset.herb ||
      object.dataset.crystal ||
      object.dataset.deity ||
      object.dataset.tool ||
      object.dataset.vessel ||
      "Object";

    const entityType =
      object.dataset.herb ? "herb" :
      object.dataset.crystal ? "crystal" :
      object.dataset.deity ? "deity" :
      object.dataset.tool ? "tool" :
      object.dataset.vessel ? "vessel" :
      object.dataset.type || "object";

    const entity = Library.getOrCreateEntity({
      name: entityName,
      type: entityType,
      image: getObjectImagePath(object) || ""
    });

    object.dataset.entityId = entity.id;
    entityId = entity.id;
  }

  return Library.getEntity(entityId);
}

function renderCompanionRichField(key, label, value = "") {
  return `
    <section class="companion-edit-field">
      <h3>${label}</h3>

      <div class="book-rich-toolbar companion-rich-toolbar" aria-label="Formatting tools">
        <button type="button" data-companion-rich-command="bold">B</button>
        <button type="button" data-companion-rich-command="italic"><em>I</em></button>
        <button type="button" data-companion-rich-command="underline"><u>U</u></button>
        <button type="button" data-companion-rich-command="insertUnorderedList">• List</button>
        <button type="button" data-companion-rich-command="insertOrderedList">1. List</button>
        <button type="button" data-companion-rich-command="formatBlock" data-companion-rich-value="blockquote">Quote</button>
      </div>

      <div
        class="book-rich-input companion-rich-input"
        contenteditable="true"
        data-companion-edit-field="${key}">
        ${value || ""}
      </div>
    </section>
  `;
}

function openCompanionEditModal() {
  const object = getCurrentSelectedAltarObject();
  const entity = getSelectedCompanionEntity();

  if (!object || !entity) {
    showAltarToast("Select an object first");
    return;
  }

  const myPractice = entity.myPractice || {};
  const modal = document.createElement("div");

  modal.className = "library-section-editor-modal companion-edit-modal";
  modal.setAttribute("data-companion-edit-modal", "");

  modal.innerHTML = `
    <div class="library-section-editor-card companion-edit-card" role="dialog" aria-modal="true">
      <button class="library-section-editor-close" type="button" data-close-companion-edit-modal aria-label="Close">
        ×
      </button>

      <p class="eyebrow">Companion Editor</p>
      <h2>Edit ${escapeAltarHtml(object.dataset.label || entity.name || "Object")}</h2>

      <form data-companion-edit-form>
        <label class="companion-edit-label">
          Display Name
          <input type="text" name="label" value="${escapeAltarHtml(object.dataset.label || entity.name || "")}" />
        </label>

        ${renderCompanionRichField("Meaning", "Meaning", myPractice.Meaning || "")}
        ${renderCompanionRichField("Uses", "Uses", myPractice.Uses || "")}
        ${renderCompanionRichField("PairsWith", "Pairs With", myPractice.PairsWith || "")}
        ${renderCompanionRichField("Substitutions", "Substitutions", myPractice.Substitutions || "")}
        ${renderCompanionRichField("Notes", "Notes", myPractice.Notes || "")}

        <button class="button button--primary" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
}

function closeCompanionEditModal() {
  document.querySelector("[data-companion-edit-modal]")?.remove();
}

function saveCompanionEditForm(form) {
  const object = getCurrentSelectedAltarObject();
  const entity = getSelectedCompanionEntity();

  if (!object || !entity || typeof Library === "undefined") return;

  const formData = new FormData(form);
  const label = String(formData.get("label") || "").trim();

  if (label) {
    object.dataset.label = label;
    object.setAttribute("aria-label", `${label}. Click to select. Drag to move.`);
  }

  const myPractice = {};

  form.querySelectorAll("[data-companion-edit-field]").forEach((field) => {
    const key = field.dataset.companionEditField;
    const value = field.innerHTML.trim();

    if (value) {
      myPractice[key] = value;
    }
  });

  Library.updateEntity(entity.id, {
    name: label || entity.name,
    myPractice
  });

  if (typeof Library.syncMyPracticeConnections === "function") {
    Library.syncMyPracticeConnections(entity.id);
  }

  saveWorkingAltarDraft();

  if (typeof showAltarInfoCard === "function") {
    showAltarInfoCard(object);
  }
}

document.addEventListener("click", (event) => {
  const richButton = event.target.closest("[data-companion-rich-command]");

  if (richButton) {
    event.preventDefault();

    const command = richButton.dataset.companionRichCommand;
    const value = richButton.dataset.companionRichValue || null;

    document.execCommand(command, false, value);
    return;
  }

  const editButton = event.target.closest("[data-edit-companion-entry]");

  if (editButton) {
    event.preventDefault();
    event.stopPropagation();
    openCompanionEditModal();
    return;
  }

  const closeButton = event.target.closest("[data-close-companion-edit-modal]");

  if (closeButton) {
    event.preventDefault();
    closeCompanionEditModal();
  }
}, true);

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-companion-edit-form]");
  if (!form) return;

  event.preventDefault();

  saveCompanionEditForm(form);
  closeCompanionEditModal();
  showAltarToast("Entry updated");
}, true);
