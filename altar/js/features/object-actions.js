/* =========================================================
   UNIFIED ALTAR OBJECT ACTIONS
   The canonical registry and bottom-toolbar renderer for selected objects.
   ========================================================= */

(function initializeObjectActions() {
  const MOBILE_QUERY = window.matchMedia("(max-width: 900px)");
  const CRAFTED_TYPES = new Set([
    "apothecary", "spell-jar", "oil", "incense", "sachet", "spray",
    "poppet", "powder", "tea", "herb-blend"
  ]);
  let overflowOpen = false;
  let overflowObject = null;
  let pendingActionAnchor = null;

  function currentObject(fallback = null) {
    return (typeof selectedObject !== "undefined" && selectedObject) ? selectedObject : fallback;
  }

  function objectType(object) {
    const raw = String(object?.dataset.apothecaryType || object?.dataset.type || "object")
      .trim().toLowerCase().replaceAll(" ", "-");
    if (object?.dataset.type === "apothecary") return "apothecary";
    return raw || "object";
  }

  function isCrafted(object) {
    return CRAFTED_TYPES.has(objectType(object)) || object?.dataset.type === "apothecary";
  }

  function snapshot() {
    if (typeof pushAltarUndoSnapshot === "function") pushAltarUndoSnapshot();
  }

  function escapeHtml(value = "") {
    return String(value ?? "")
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    if (typeof showAltarToast === "function") showAltarToast(message);
  }

  function refreshAfterAction(object) {
    if (!object?.isConnected) return;
    if (typeof updateToolbarNotes === "function") updateToolbarNotes(object);
    renderSelectedObjectActions(object);
    if (typeof refreshAltarCompanion === "function") {
      refreshAltarCompanion(object);
    } else {
      if (typeof scheduleCompanionV4 === "function") scheduleCompanionV4(object);
      if (typeof scheduleCompanionCurrentState === "function") scheduleCompanionCurrentState(object);
    }
  }

  function objectIdentity(object) {
    if (!object) return "";
    return object.dataset.altarObjectId || object.dataset.instanceId || object.dataset.entityId || "";
  }

  function sameObject(left, right) {
    if (!left || !right) return false;
    if (left === right) return true;
    const leftId = objectIdentity(left);
    return Boolean(leftId && leftId === objectIdentity(right));
  }

  function actionScrollOwner(element) {
    if (!element || !MOBILE_QUERY.matches) return null;
    let ancestor = element.parentElement;
    while (ancestor && ancestor !== document.body && ancestor !== document.documentElement) {
      const style = window.getComputedStyle(ancestor);
      if (/(auto|scroll|overlay)/.test(style.overflowY) && ancestor.scrollHeight > ancestor.clientHeight) {
        return ancestor;
      }
      ancestor = ancestor.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  function captureActionAnchor(actionId, object) {
    if (!overflowOpen || !sameObject(object, overflowObject)) return null;
    const button = Array.from(toolbar?.querySelectorAll("[data-object-action-overflow] [data-action]") || [])
      .find((candidate) => candidate.dataset.action === actionId);
    if (!button) return null;
    const scrollContainer = actionScrollOwner(button);
    return {
      object,
      objectId: objectIdentity(object),
      actionId,
      buttonViewportTop: button.getBoundingClientRect().top,
      scrollContainer,
      scrollPosition: scrollContainer?.scrollTop || 0
    };
  }

  function restoreActionAnchor(anchor, object) {
    if (!anchor || !overflowOpen || !sameObject(anchor.object, object)) return;
    const replacement = Array.from(toolbar?.querySelectorAll("[data-object-action-overflow] [data-action]") || [])
      .find((candidate) => candidate.dataset.action === anchor.actionId);
    const scrollContainer = anchor.scrollContainer?.isConnected
      ? anchor.scrollContainer
      : actionScrollOwner(replacement || toolbar);

    if (replacement) {
      const offset = replacement.getBoundingClientRect().top - anchor.buttonViewportTop;
      if (scrollContainer && Math.abs(offset) > 0.5) scrollContainer.scrollTop += offset;
      try { replacement.focus({ preventScroll: true }); } catch (_) { replacement.focus(); }
      return;
    }

    if (scrollContainer) scrollContainer.scrollTop = anchor.scrollPosition;
  }

  function closeActionModal() {
    document.querySelector("[data-object-action-modal]")?.remove();
  }

  function openActionModal({ title, description = "", fields = [], submitLabel = "Save", onSubmit }) {
    closeActionModal();
    const modal = document.createElement("div");
    modal.className = "library-section-editor-modal object-action-modal";
    modal.setAttribute("data-object-action-modal", "");
    modal.innerHTML = `
      <div class="library-section-editor-card object-action-modal-card" role="dialog" aria-modal="true" aria-labelledby="object-action-title">
        <button type="button" class="library-section-editor-close" data-close-object-action aria-label="Close">×</button>
        <p class="eyebrow">Object Action</p>
        <h2 id="object-action-title">${escapeHtml(title)}</h2>
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
        <form data-object-action-form>
          ${fields.map((field) => field.type === "checkboxes" ? `
            <fieldset class="object-action-checks">
              <legend>${escapeHtml(field.label)}</legend>
              ${(field.options || []).map((option) => `
                <label class="object-action-check"><input type="checkbox" name="${escapeHtml(field.name)}" value="${escapeHtml(option.value)}"> ${escapeHtml(option.label)}</label>
              `).join("")}
            </fieldset>
          ` : `
            <label>
              ${escapeHtml(field.label)}
              ${field.type === "select" ? `
                <select name="${escapeHtml(field.name)}">
                  ${(field.options || []).map((option) => {
                    const value = typeof option === "string" ? option : option.value;
                    const label = typeof option === "string" ? option : option.label;
                    return `<option value="${escapeHtml(value)}" ${String(value) === String(field.value || "") ? "selected" : ""}>${escapeHtml(label)}</option>`;
                  }).join("")}
                </select>
              ` : field.type === "textarea" ? `
                <textarea name="${escapeHtml(field.name)}" rows="4">${escapeHtml(field.value || "")}</textarea>
              ` : `
                <input type="${escapeHtml(field.type || "text")}" name="${escapeHtml(field.name)}" value="${escapeHtml(field.value || "")}" ${field.required ? "required" : ""}>
              `}
            </label>
          `).join("")}
          <button type="submit" class="button button--primary">${escapeHtml(submitLabel)}</button>
        </form>
      </div>
    `;

    const form = modal.querySelector("[data-object-action-form]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('[type="submit"]');
      if (submitButton.disabled) return;
      submitButton.disabled = true;
      try {
        const result = await onSubmit(new FormData(form));
        if (result === false) return;
        closeActionModal();
        refreshAfterAction(currentObject());
      } finally {
        if (submitButton.isConnected) submitButton.disabled = false;
      }
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-close-object-action]")) closeActionModal();
    });
    document.body.appendChild(modal);
    form.querySelector("input, textarea, select")?.focus();
  }

  function localDateTime(iso = "") {
    const date = new Date(iso || Date.now());
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }

  function toIso(value) {
    const date = new Date(value || "");
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function livingState(object) {
    return typeof getLivingObjectState === "function" ? getLivingObjectState(object) : null;
  }

  function optionCards(name, options, multiple = false, selected = []) {
    const chosen = new Set(Array.isArray(selected) ? selected : [selected]);
    return `<div class="object-workflow-options">${options.map((label) => {
      const value = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return `<label><input type="${multiple ? "checkbox" : "radio"}" name="${escapeHtml(name)}" value="${escapeHtml(value)}" ${multiple ? "" : "required"} ${chosen.has(value) ? "checked" : ""}><span>${escapeHtml(label)}</span></label>`;
    }).join("")}</div>`;
  }

  function resourceChoices(subject) {
    return Array.from(document.querySelectorAll(".altar-object"))
      .filter((item) => item !== subject && ["herb", "oil", "incense", "crystal", "candle", "apothecary"].includes(item.dataset.type))
      .map((item) => ({ id: item.dataset.altarObjectId || item.dataset.entityId || item.dataset.label, label: item.dataset.label || "Altar support" }));
  }

  function supportCards(subject) {
    const supports = resourceChoices(subject);
    if (!supports.length) return `<p class="object-workflow-muted">Place herbs, oils, incense, crystals, candles, or apothecary items on the altar to select them here.</p>`;
    return `<div class="object-workflow-options object-workflow-supports">${supports.map((support) => `<label><input type="checkbox" name="supports" value="${escapeHtml(support.id)}" data-support-label="${escapeHtml(support.label)}"><span>${escapeHtml(support.label)}</span></label>`).join("")}</div>`;
  }

  function openWorkflowModal({ title, intro, content, submitLabel, onSubmit }) {
    closeActionModal();
    const modal = document.createElement("div");
    modal.className = "library-section-editor-modal object-action-modal object-workflow-modal";
    modal.setAttribute("data-object-action-modal", "");
    modal.innerHTML = `<div class="library-section-editor-card object-action-modal-card object-workflow-card" role="dialog" aria-modal="true"><button type="button" class="library-section-editor-close" data-close-object-action aria-label="Close">×</button><p class="eyebrow">Guided Ritual</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(intro)}</p><form data-object-action-form>${content}<button type="submit" class="button button--primary">${escapeHtml(submitLabel)}</button></form></div>`;
    const form = modal.querySelector("form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"]');
      if (button.disabled) return;
      button.disabled = true;
      try {
        const result = await onSubmit(new FormData(form), form);
        if (result === false) return;
        closeActionModal();
        refreshAfterAction(currentObject());
      } finally { if (button.isConnected) button.disabled = false; }
    });
    modal.addEventListener("click", (event) => { if (event.target === modal || event.target.closest("[data-close-object-action]")) closeActionModal(); });
    modal.addEventListener("change", (event) => {
      if (event.target.name === "duration") {
        const review = modal.querySelector("[data-dedication-review]");
        if (review) review.hidden = !["until-a-chosen-date", "ongoing-but-review-later"].includes(event.target.value);
      }
      if (event.target.name === "intentionHandling") {
        const intentionField = modal.querySelector("[data-new-intention]");
        if (intentionField) intentionField.hidden = !["clear-and-replace-after-cleansing", "strengthen-current-intention", "cleanse-and-replace-it", "replace-without-cleansing"].includes(event.target.value);
      }
    });
    document.body.appendChild(modal);
  }

  function selectedValues(data, name) { return data.getAll(name).map(String); }
  function humanizeActionValue(value = "") {
    const text = String(value || "").replaceAll("-", " ").replaceAll("_", " ");
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  }
  function selectedSupportRecords(form) {
    return Array.from(form.querySelectorAll('input[name="supports"]:checked')).map((input) => ({ id: input.value, label: input.dataset.supportLabel || input.value }));
  }

  function openCandleDressingDialog(candle) {
    const ingredients = Array.from(document.querySelectorAll(".altar-object")).filter((item) => (
      item !== candle && typeof canDressCandle === "function" && canDressCandle(item)
    ));
    if (!ingredients.length) {
      showToast("Place a loose herb or oil on the altar first");
      return;
    }
    // Tick as many herbs and oils as you like; they all go on together.
    openActionModal({
      title: "Dress Candle",
      fields: [{
        name: "ingredient", label: "Herbs and oils on the altar", type: "checkboxes",
        options: ingredients.map((item, index) => ({
          value: String(index), label: item.dataset.label || item.dataset.herb || "Ingredient"
        }))
      }],
      submitLabel: "Dress the candle",
      onSubmit(formData) {
        const chosen = formData.getAll("ingredient").map((value) => ingredients[Number(value)]).filter(Boolean);
        if (!chosen.length) {
          showToast("Tick a herb or oil first");
          return false;
        }
        snapshot();
        chosen.forEach((ingredient) => {
          beginCandleDressing(ingredient);
          dressCandle(candle);
        });
        showToast(chosen.length > 1 ? `Candle dressed with ${chosen.length}` : "Candle dressed");
        return true;
      }
    });
  }

  function openObjectEditDialog(object) {
    openActionModal({
      title: "Edit Object",
      fields: [{
        name: "label", label: "Display name", required: true,
        value: object.dataset.label || "Altar Object"
      }],
      onSubmit(formData) {
        const label = String(formData.get("label") || "").trim();
        if (!label) return false;
        snapshot();
        object.dataset.label = label;
        object.setAttribute("aria-label", `${label}. Click to select. Drag to move.`);
        if (typeof saveWorkingAltarDraft === "function") saveWorkingAltarDraft();
        showToast("Object updated");
      }
    });
  }

  function getCrystalIntention(object) {
    const crystal = livingState(object)?.crystal || {};
    return String(crystal.intention?.text || crystal.currentIntention || crystal.dedicationDetails?.intention || crystal.dedicationDetails?.purpose || crystal.dedication || "").trim();
  }

  function openCrystalDecision(object, kind, initialTargets = null) {
    const crystals = Array.from(altarStage?.querySelectorAll('.altar-object[data-type="crystal"]') || []);
    const preselected = new Set((initialTargets || [object]).map((item) => item.dataset.altarObjectId));
    const anyIntention = crystals.filter((item) => preselected.has(item.dataset.altarObjectId)).some(getCrystalIntention);
    const choices = kind === "cleanse"
      ? (anyIntention ? ["Keep all current intentions", "Cleanse and remove all current intentions", "Cleanse and prepare all for new intentions"] : ["General energetic cleansing"])
      : (anyIntention ? ["Continue with existing intentions", "Cleanse selected crystals first"] : ["General energetic charge", "Charge with one shared new intention"]);
    openWorkflowModal({
      title: kind === "cleanse" ? "Prepare to Cleanse" : "Prepare to Charge",
      intro: "Choose one or more crystal objects currently on the altar. Each crystal keeps its own state and history.",
      submitLabel: "Continue",
      content: `<section class="object-workflow-current"><h3>Current intention</h3>${crystals.map((crystal) => { const state = livingState(crystal)?.crystal || {}; const intention = getCrystalIntention(crystal); return `<label class="offering-manager-choice"><input type="checkbox" name="crystalTarget" value="${escapeHtml(crystal.dataset.altarObjectId)}" ${preselected.has(crystal.dataset.altarObjectId) ? "checked" : ""}><span><strong>${escapeHtml(crystal.dataset.label || "Crystal")}</strong><em>${escapeHtml(intention || "No recorded intention")}</em><small>${state.lastCleansedAt ? `Last cleansed ${escapeHtml(new Date(state.lastCleansedAt).toLocaleDateString())}` : ""}${state.lastChargedAt ? `${state.lastCleansedAt ? " · " : ""}Last charged ${escapeHtml(new Date(state.lastChargedAt).toLocaleDateString())}` : ""}</small></span></label>`; }).join("")}</section><section><h3>${kind === "cleanse" ? "Intention consequence" : "Charge direction"}</h3>${optionCards("crystalDecision", choices)}</section>`,
      onSubmit(data) {
        const ids = data.getAll("crystalTarget");
        const targets = crystals.filter((crystal) => ids.includes(crystal.dataset.altarObjectId));
        if (!targets.length) { showToast("Choose at least one crystal"); return false; }
        const decision = data.get("crystalDecision");
        if (kind === "charge" && decision === "charge-with-one-shared-new-intention" && targets.some(getCrystalIntention)) {
          showToast("Cleanse crystals with existing intentions before assigning a shared new intention");
          return false;
        }
        closeActionModal();
        if (decision === "cleanse-selected-crystals-first") openCrystalDecision(targets[0], "cleanse", targets);
        else openCrystalAction(targets[0], `${kind}-execute`, { targets, decision });
        return false;
      }
    });
  }

  function openCrystalAction(object, kind, workflow = null) {
    if (["cleanse", "charge"].includes(kind)) { openCrystalDecision(object, kind); return; }
    const executeKind = kind.replace("-execute", "");
    const state = livingState(object)?.crystal || {};
    if (kind === "dedication") {
      const entities = typeof Library !== "undefined" && typeof Library.getAllEntitiesSorted === "function" ? Library.getAllEntitiesSorted() : [];
      openWorkflowModal({
        title: "Dedicate Crystal", intro: "Assign this crystal an ongoing spiritual role, relationship, or devotional focus.", submitLabel: "Save Dedication",
        content: `<section><h3>1. Dedication type</h3>${optionCards("dedicationType", ["Deity", "Ancestor", "Spirit", "Purpose", "Ritual role", "Person", "Self", "Place", "Practice", "Other"])}</section><section><h3>2. Dedicated to</h3><select name="entityId"><option value="">Custom or none</option>${entities.map((entity) => `<option value="${escapeHtml(entity.id)}">${escapeHtml(entity.name)} · ${escapeHtml(entity.type)}</option>`).join("")}</select><input name="dedicatedTo" placeholder="Custom name or focus" value="${escapeHtml(state.dedicationDetails?.dedicatedTo || "")}"></section><section><h3>3. Dedication intention</h3><textarea name="intention" rows="4">${escapeHtml(state.dedicationDetails?.intention || state.dedication || "")}</textarea></section><section><h3>4. Duration</h3>${optionCards("duration", ["Until manually removed", "For one ritual", "Until a chosen date", "Ongoing but review later"], false, state.dedicationDetails?.duration || "until-manually-removed")}<label data-dedication-review ${["until-a-chosen-date", "ongoing-but-review-later"].includes(state.dedicationDetails?.duration) ? "" : "hidden"}>Review or end date<input type="date" name="reviewAt" value="${escapeHtml(state.dedicationDetails?.reviewAt?.slice?.(0, 10) || "")}"></label></section><section><h3>5. Reflection</h3><textarea name="notes" rows="3" placeholder="Optional notes">${escapeHtml(state.dedicationDetails?.notes || "")}</textarea></section>`,
        async onSubmit(formData) {
          const entity = entities.find((item) => item.id === formData.get("entityId"));
          const details = { type: formData.get("dedicationType"), entityId: formData.get("entityId"), dedicatedTo: String(formData.get("dedicatedTo") || entity?.name || "").trim(), intention: String(formData.get("intention") || "").trim(), duration: formData.get("duration"), reviewAt: formData.get("reviewAt") || "", notes: String(formData.get("notes") || "").trim(), recordedAt: new Date().toISOString() };
          snapshot();
          setLivingCrystalCare(object, { dedication: details.intention || details.dedicatedTo, dedicationDetails: details });
          showToast("Crystal dedication updated");
        }
      });
      return;
    }
    const isCleanse = executeKind === "cleanse";
    const reasons = isCleanse ? ["General energetic cleansing", "Clearing a current intention", "Preparing for a new intention", "After ritual use", "After emotionally intense use", "Routine care", "Other"] : ["General recharge", "Strengthen current intention", "Prepare for ritual", "Prepare for meditation", "Protection", "Healing", "Divination", "Manifestation", "Devotional use", "Seasonal or lunar work", "Other"];
    const methods = isCleanse ? ["Moonlight", "Sunlight", "Water", "Salt", "Smoke", "Sound", "Selenite", "Earth", "Herbs", "Breath", "Visualization", "Prayer", "Intention", "Other"] : ["Moonlight", "Sunlight", "Crystal grid", "Another crystal", "Herbs", "Oil", "Candle", "Sound", "Breath", "Visualization", "Prayer", "Intention", "Altar placement", "Other"];
    const currentIntention = getCrystalIntention(object);
    const recentCleanse = state.cleansingHistory?.[state.cleansingHistory.length - 1];
    const recentCharge = state.chargingHistory?.[state.chargingHistory.length - 1];
    const context = `<section class="object-workflow-current"><h3>Current intention</h3><p class="object-workflow-intention">${escapeHtml(currentIntention || "No recorded intention")}</p>${state.dedicationDetails?.dedicatedTo ? `<p><strong>Dedicated to:</strong> ${escapeHtml(state.dedicationDetails.dedicatedTo)}</p>` : ""}${state.lastCleansedAt ? `<p><strong>Last cleansed:</strong> ${escapeHtml(new Date(state.lastCleansedAt).toLocaleString())}${recentCleanse?.methods?.length ? ` · ${escapeHtml(recentCleanse.methods.map(humanizeActionValue).join(", "))}` : ""}</p>` : ""}${state.lastChargedAt ? `<p><strong>Last charged:</strong> ${escapeHtml(new Date(state.lastChargedAt).toLocaleString())}${recentCharge?.methods?.length ? ` · ${escapeHtml(recentCharge.methods.map(humanizeActionValue).join(", "))}` : ""}</p>` : ""}</section>`;
    openWorkflowModal({
      title: isCleanse ? "Cleanse Crystal" : "Charge Crystal", intro: isCleanse ? "Record the purpose, methods, and supports used in this cleansing." : "Shape and record the purpose of this crystal charge.", submitLabel: isCleanse ? "Complete Cleansing" : "Complete Charge",
      content: `${context}${!isCleanse && workflow?.decision === "charge-with-one-shared-new-intention" ? `<section data-new-intention class="object-workflow-intention-entry"><h3>${workflow.targets?.length > 1 ? "Shared Intention" : "Intention"}</h3><p>${workflow.targets?.length > 1 ? "This intention will be applied to every selected crystal." : "What intention are you charging this crystal to hold?"}</p><textarea name="newIntention" rows="4" required aria-label="Intention"></textarea></section>` : ""}<section><h3>Selected consequence</h3><p>${escapeHtml(humanizeActionValue(workflow?.decision || "general"))}</p></section><section><h3>1. ${isCleanse ? "Reason for cleansing" : "Purpose of the charge"}</h3>${optionCards("purpose", reasons)}</section><section><h3>2. ${isCleanse ? "Cleansing" : "Charging"} methods</h3>${optionCards("methods", methods, true)}</section><section><h3>3. Supports used</h3>${supportCards(object)}</section><section><h3>Reflection</h3><textarea name="notes" rows="3" placeholder="Optional notes or reflection"></textarea></section><label>Completed at<input type="datetime-local" name="occurredAt" value="${localDateTime()}"></label>`,
      async onSubmit(formData, form) {
        const occurredAt = toIso(formData.get("occurredAt"));
        if (!occurredAt) return false;
        if (!formData.getAll("methods").length) { showToast("Choose at least one method"); return false; }
        const baseRecord = { occurredAt, purpose: formData.get("purpose"), methods: selectedValues(formData, "methods"), supports: selectedSupportRecords(form), intentionHandling: workflow?.decision || "", intention: String(formData.get("newIntention") || "").trim(), notes: String(formData.get("notes") || "").trim() };
        snapshot();
        const targets = workflow?.targets || [object];
        const clear = ["cleanse-and-remove-all-current-intentions", "cleanse-and-prepare-all-for-new-intentions"].includes(workflow?.decision);
        targets.forEach((target) => {
          const targetState = livingState(target)?.crystal || {};
          const record = { ...baseRecord, intention: baseRecord.intention || getCrystalIntention(target), id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()) };
          const care = isCleanse ? { cleansedAt: occurredAt, cleansingRecord: record } : { chargedAt: occurredAt, chargingRecord: record };
          if (clear) { care.dedication = ""; care.dedicationDetails = null; }
          if (!isCleanse && baseRecord.intention) { care.dedication = baseRecord.intention; care.dedicationDetails = { ...(targetState.dedicationDetails || {}), intention: baseRecord.intention, updatedAt: occurredAt }; }
          setLivingCrystalCare(target, care);
        });
        const methodSummary = baseRecord.methods.map(humanizeActionValue).join(", ");
        const consequence = clear ? "Previous intention cleared." : currentIntention ? "Current intention retained." : baseRecord.intention ? "New intention recorded." : "";
        showToast(`Crystal ${isCleanse ? "cleansed" : "charged"}${methodSummary ? ` with ${methodSummary}` : ""}. ${consequence}`.trim());
      }
    });
  }

  function openDeityAction(object, kind, offeringId = "") {
    const state = livingState(object)?.deity || {};
    const statuses = ["Offered", "Present on altar", "Completed", "Consumed or used", "Removed", "Returned to nature", "Disposed of", "Unknown", "Custom"];
    const offerings = [...(state.offerings || [])].sort((a, b) => String(b.occurredAt || "").localeCompare(String(a.occurredAt || "")));
    if (kind === "offering") {
      openWorkflowModal({ title: "Offering Manager", intro: `Record a new offering for ${object.dataset.label || "this presence"}, or update an existing devotional record.`, submitLabel: "Continue", content: `<section><h3>Choose an offering</h3><label class="offering-manager-choice"><input type="radio" name="offeringChoice" value="new" required><span><strong>Record New Offering</strong><small>Create a new devotional record.</small></span></label>${offerings.map((offering) => `<label class="offering-manager-choice"><input type="radio" name="offeringChoice" value="${escapeHtml(offering.id)}" required><span><strong>${escapeHtml(new Date(offering.occurredAt || Date.now()).toLocaleDateString())} · ${escapeHtml((offering.items || []).map((item) => item.label || item).join(", ") || (offering.types || []).join(", ") || "Offering")}</strong><small>${escapeHtml([offering.intention, offering.status, offering.perceivedResponse].filter(Boolean).join(" · "))}</small></span></label>`).join("")}</section>`, onSubmit(data) {
        const choice = data.get("offeringChoice");
        closeActionModal();
        openDeityAction(object, choice === "new" ? "offering-new" : "offering-update", choice === "new" ? "" : choice);
        return false;
      }});
      return;
    }
    if (kind === "offering-update") {
      const offering = offerings.find((item) => item.id === offeringId);
      if (!offering) { showToast("That offering is no longer available"); return; }
      openWorkflowModal({ title: "Update Offering", intro: `Editing ${(offering.items || []).map((item) => item.label || item).join(", ") || "the selected offering"} from ${new Date(offering.occurredAt).toLocaleDateString()}.`, submitLabel: "Save Offering Update", content: `<section><h3>Current devotional state</h3>${optionCards("status", statuses, false, offering.status)}<input name="customStatus" placeholder="Custom status"></section><section><h3>Perceived response</h3>${optionCards("response", ["Not yet known", "Accepted", "Neutral", "Declined", "Strong presence felt", "Personal interpretation"], false, offering.perceivedResponse)}<textarea name="responseNotes" rows="3" placeholder="Personal interpretation">${escapeHtml(offering.responseNotes || "")}</textarea></section><label>Reflection or follow-up notes<textarea name="followUpNotes" rows="3">${escapeHtml(offering.followUpNotes || "")}</textarea></label><label>Completion or removal date<input type="datetime-local" name="completedAt" value="${offering.completedAt ? localDateTime(offering.completedAt) : ""}"></label>`, onSubmit(data) {
        const status = data.get("status") === "custom" ? String(data.get("customStatus") || "").trim() : data.get("status");
        const response = data.get("response") || "";
        const occurredAt = new Date().toISOString();
        const update = { status, perceivedResponse: response, responseNotes: String(data.get("responseNotes") || "").trim(), followUpNotes: String(data.get("followUpNotes") || "").trim(), completedAt: toIso(data.get("completedAt")), updatedAt: occurredAt };
        snapshot();
        setLivingDeityState(object, { ...(offering.id === offerings[0]?.id ? { offeringStatus: status } : {}), updateOfferingId: offering.id, updateOffering: update, offeringStatusRecord: { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), offeringId: offering.id, status, perceivedResponse: response, occurredAt } });
        showToast(`Offering status updated to ${humanizeActionValue(status)}.${response ? ` Perceived response recorded as ${humanizeActionValue(response)}.` : ""}`);
      }});
      return;
    }
    if (kind === "reason-presence") {
      const reasons = ["Devotional focus", "Ritual participant", "Protection", "Guidance", "Honoring or remembrance", "Seasonal observance", "Ongoing altar presence", "Temporary presence", "Other"];
      openWorkflowModal({ title: "Reason for Presence", intro: "Describe the role this presence holds on the digital altar.", submitLabel: "Save Reason", content: `<section><h3>Primary reason</h3>${optionCards("reason", reasons, false, state.reasonDetails?.reason)}</section><label>Expanded notes<textarea name="notes" rows="4">${escapeHtml(state.reasonDetails?.notes || state.reasonForPresence || "")}</textarea></label>`, onSubmit(data) {
        const details = { reason: data.get("reason"), notes: String(data.get("notes") || "").trim(), updatedAt: new Date().toISOString() };
        snapshot();
        setLivingDeityState(object, { reasonForPresence: [details.reason?.replaceAll("-", " "), details.notes].filter(Boolean).join(": "), reasonDetails: details });
      }});
      return;
    }
    // From your altar: everything else on it, by its picture, to give as the offering itself
    // (js/core/altar.js offerFromAltar, shared with the app). "Something else" stays for anything not on the altar.
    const gifting = window.SaltCore?.altar?.offerFromAltar && window.AltarApp;
    const presenceName = gifting ? window.SaltCore.altar.relationship.deityName(window.AltarApp.toSaved(object)) : (object.dataset.label || "this presence");
    const gifts = gifting ? window.SaltCore.altar.offerFromAltar.altarGifts(window.AltarApp.doc().objects, window.AltarApp.toSaved(object)) : [];
    const giftCards = gifts.length
      ? `<p class="object-workflow-muted">Choose what you’re giving ${escapeHtml(presenceName)} from what’s already on this altar.</p><div class="object-workflow-options object-workflow-gifts">${gifts.map((gift) => `<label><input type="checkbox" name="gifts" value="${escapeHtml(gift.id)}" data-offering-type="${escapeHtml(gift.offeringType.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}"><span>${gift.imagePath ? `<img src="${escapeHtml(window.SanctuaryAssetCatalog?.thumbnailPath?.(gift.imagePath) || gift.imagePath)}" alt="" loading="lazy">` : `<b aria-hidden="true">${escapeHtml(gift.fallbackSymbol || "✦")}</b>`}<small>${escapeHtml(gift.label)}</small></span></label>`).join("")}</div><label class="object-workflow-feet" data-gift-feet hidden><input type="checkbox" name="atFeet" value="yes"> Set them at ${escapeHtml(presenceName)}’s feet</label>`
      : `<p class="object-workflow-muted">Nothing else is on this altar yet. Set out food, drink, flowers or anything you’d give, and it can be chosen here.</p>`;
    openWorkflowModal({ title: `Offering for ${object.dataset.label || "Selected Deity"}`, intro: "Record the devotional meaning and current state of this offering without treating interpretation as objective fact.", submitLabel: "Record Offering", content: `<section><h3>From your altar</h3>${giftCards}</section><section><h3>Something else</h3><label>Anything not on the altar<input name="customItems" placeholder="Comma-separated"></label></section><section><h3>Offering types</h3>${optionCards("types", ["Herbs", "Crystals", "Oils", "Apothecary items", "Incense", "Candles", "Food", "Drink", "Flowers", "Coins", "Written prayer", "Song or music", "Devotional act", "Other"], true)}</section><section><h3>Intention</h3><input name="intention" placeholder="Gratitude, petition, devotion, celebration…"><textarea name="message" rows="3" placeholder="Optional prayer or message"></textarea></section><section><h3>Offering status</h3>${optionCards("status", statuses, false, "offered")}<input name="customStatus" placeholder="Custom status"></section><section><h3>Perceived response</h3>${optionCards("response", ["Not yet known", "Accepted", "Neutral", "Declined", "Strong presence felt", "Personal interpretation"])}<textarea name="responseNotes" rows="3" placeholder="Optional personal interpretation"></textarea></section><label>Offered at<input type="datetime-local" name="occurredAt" value="${localDateTime()}"></label>`, async onSubmit(data, form) {
      const occurredAt = toIso(data.get("occurredAt")); if (!occurredAt) return false;
      const custom = String(data.get("customItems") || "").split(",").map((value) => value.trim()).filter(Boolean).map((label) => ({ label, custom: true }));
      const status = data.get("status") === "custom" ? String(data.get("customStatus") || "").trim() : data.get("status");
      const chosen = new Set(data.getAll("gifts").map(String));
      const given = gifts.filter((gift) => chosen.has(gift.id));
      if (given.length && gifting) {
        const B = window.AltarApp;
        const before = B.doc().objects;
        const index = B.objects().indexOf(object);
        if (index < 0) return false;
        const input = { types: selectedValues(data, "types"), supports: [], customItems: custom.map((c) => c.label).join(", "), intention: String(data.get("intention") || "").trim(), message: String(data.get("message") || "").trim(), status: data.get("status") === "custom" ? "Custom" : String(status || ""), customStatus: String(data.get("customStatus") || ""), response: String(data.get("response") || ""), responseNotes: String(data.get("responseNotes") || "").trim(), occurredAt };
        const result = window.SaltCore.altar.offerFromAltar.giveFromAltar(before, index, input, given, { atFeet: data.get("atFeet") === "yes" }, new Date().toISOString());
        B.applyObjects(before, result.objects);
        const altarId = B.altarId();
        if (altarId) window.SaltCraft?.add("altar.history", { altarId, text: result.line, at: new Date().toISOString() }).catch(() => {});
        showToast(`${result.line} Recorded.`);
        return;
      }
      const record = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), occurredAt, types: selectedValues(data, "types"), items: [...custom], intention: String(data.get("intention") || "").trim(), message: String(data.get("message") || "").trim(), status, perceivedResponse: data.get("response") || "", responseNotes: String(data.get("responseNotes") || "").trim() };
      snapshot(); setLivingDeityState(object, { lastOfferingAt: occurredAt, offeringStatus: status, offeringRecord: record });
      showToast(`Offering recorded for ${object.dataset.label || "selected deity"}.`);
    }});
    // Choosing something from the altar ticks the kind of offering it is (a honeycomb is food).
    const modal = document.querySelector("[data-object-action-modal]");
    modal?.addEventListener("change", (event) => {
      if (event.target.name !== "gifts") return;
      if (event.target.checked) {
        const box = modal.querySelector(`input[name="types"][value="${event.target.dataset.offeringType}"]`);
        if (box) box.checked = true;
      }
      const feet = modal.querySelector("[data-gift-feet]");
      if (feet) feet.hidden = !modal.querySelector('input[name="gifts"]:checked');
    });
  }

  async function saveCraftedLifecycle(object, stateValues, instanceValues = null) {
    snapshot();
    if (instanceValues && object.dataset.instanceId && typeof updateObjectInstance === "function") {
      const updated = await updateObjectInstance(object.dataset.instanceId, instanceValues);
      if (!updated) {
        showToast("Could not update this object instance");
        return false;
      }
    } else if (typeof setLivingApothecaryState === "function") {
      setLivingApothecaryState(object, stateValues);
    }
    if (typeof saveWorkingAltarDraft === "function") saveWorkingAltarDraft();
    showToast("Object state updated");
    return true;
  }

  function openCraftedAction(object, kind) {
    const state = livingState(object)?.apothecary || {};
    const definitions = {
      activation: {
        title: "Activation",
        fields: [{ name: "activationState", label: "Activation state", value: state.activationState }],
        values: (data) => ({ activationState: String(data.get("activationState") || "").trim() })
      },
      remaining: {
        title: "Remaining Amount",
        fields: [{ name: "remainingAmount", label: "Amount remaining", value: state.remainingAmount }],
        values: (data) => ({ remainingAmount: String(data.get("remainingAmount") || "").trim() })
      },
      review: {
        title: "Review / Expiration",
        fields: [
          { name: "nextTendingAt", label: "Next tending", type: "datetime-local", value: localDateTime(state.nextTendingAt) },
          { name: "reviewAt", label: "Review / expiration", type: "datetime-local", value: localDateTime(state.reviewAt) }
        ],
        values: (data) => ({
          nextTendingAt: toIso(data.get("nextTendingAt")),
          reviewAt: toIso(data.get("reviewAt"))
        })
      }
    };
    const definition = definitions[kind];
    openActionModal({
      ...definition,
      async onSubmit(formData) {
        const values = definition.values(formData);
        const instanceValues = kind === "remaining"
          ? { remaining_amount: values.remainingAmount || null }
          : kind === "review"
            ? {
              tending_due_at: values.nextTendingAt || null,
              tending_enabled: Boolean(values.nextTendingAt),
              expires_at: values.reviewAt || null,
              expiration_enabled: Boolean(values.reviewAt)
            }
            : null;
        return saveCraftedLifecycle(object, values, instanceValues);
      }
    });
  }

  const registry = [
    { id: "edit", label: "Edit", icon: "✎", priority: 10, types: ["*"], handler: openObjectEditDialog },
    { id: "light", label: (o) => o.dataset.lit === "true" ? "Extinguish" : "Light", icon: "🔥", priority: 12, types: ["candle"], available: (o) => o.dataset.candleStatus !== "spent" && o.dataset.candleStatus !== "archived", handler: (o) => { snapshot(); toggleLight(o); } },
    { id: "replace-candle", label: "Replace Candle", icon: "♻", priority: 13, types: ["candle"], available: (o) => o.dataset.candleStatus === "spent" && typeof replaceCandleObject === "function", handler: (o) => replaceCandleObject(o) },
    { id: "ritual-candle", label: (o) => o.dataset.ritualIncluded === "true" ? "Remove from Ritual" : "Include in Ritual", icon: "◉", priority: 16, types: ["candle"], handler: (o) => { o.dataset.ritualIncluded = o.dataset.ritualIncluded === "true" ? "false" : "true"; saveWorkingAltarDraft(); if (typeof scheduleCompanionV4 === "function") scheduleCompanionV4(o); } },
    { id: "dress-candle", label: "Dress", icon: "🌿", priority: 14, types: ["candle"], handler: openCandleDressingDialog },
    { id: "clear-dressings", label: "Undress", icon: "⌫", priority: 15, types: ["candle"], available: (o) => Boolean(livingState(o)?.candle?.dressings?.length), handler: (o) => { snapshot(); clearCandleDressings(o); } },
    { id: "cleanse", label: "Cleanse", icon: "💧", priority: 12, types: ["crystal"], handler: (o) => openCrystalAction(o, "cleanse") },
    { id: "charge", label: "Charge", icon: "☾", priority: 13, types: ["crystal"], handler: (o) => openCrystalAction(o, "charge") },
    { id: "dedicate", label: "Dedicate", icon: "✦", priority: 14, types: ["crystal"], handler: (o) => openCrystalAction(o, "dedication") },
    { id: "record-offering", label: "Offering", icon: "🎁", priority: 12, types: ["deity"], handler: (o) => openDeityAction(o, "offering") },
    { id: "reason-presence", label: "Reason", icon: "✎", priority: 14, types: ["deity"], handler: (o) => openDeityAction(o, "reason-presence") },
    { id: "edit-apothecary", label: "Edit Recipe", icon: "⚗", priority: 11, types: ["apothecary"], available: (o) => Boolean(o.dataset.apothecaryItemId && typeof openApothecaryItemEditor === "function"), handler: (o) => openApothecaryItemEditor(o.dataset.apothecaryItemId) },
    { id: "begin-practice", label: "Begin Practice", icon: "✨", priority: 16, types: ["*"], available: (o) => Boolean(o.dataset.instanceId && typeof openLivingStatePracticeMenu === "function"), handler: () => openLivingStatePracticeMenu() },
    { id: "edit-practice", label: "Edit Practice", icon: "📝", priority: 17, types: ["*"], available: (o) => Boolean(o.dataset.entityId && typeof openLibrarySectionEditor === "function"), handler: (o) => openLibrarySectionEditor(o.dataset.entityId, "myPractice") },
    { id: "relationships", label: "Relationships", icon: "⛓", priority: 18, types: ["*"], available: (o) => Boolean(o.dataset.entityId && typeof openRelationshipManagerModal === "function"), handler: (o) => openRelationshipManagerModal(o.dataset.entityId) },
    { id: "history", label: "Full History", icon: "🕘", priority: 19, types: ["*"], available: (o) => Boolean(o.dataset.entityId && typeof openLivingHistoryModal === "function"), handler: (o) => openLivingHistoryModal(o.dataset.entityId) },
    { id: "activation", label: "Activation", icon: "✦", priority: 12, types: ["crafted"], handler: (o) => openCraftedAction(o, "activation") },
    { id: "remaining", label: "Remaining", icon: "◐", priority: 13, types: ["crafted"], handler: (o) => openCraftedAction(o, "remaining") },
    { id: "tend", label: "Tend", icon: "🌱", priority: 14, types: ["crafted"], available: (o) => Boolean(o.dataset.instanceId && typeof openLivingStateTendModal === "function"), handler: () => openLivingStateTendModal() },
    { id: "review", label: "Review", icon: "📅", priority: 15, types: ["crafted"], handler: (o) => openCraftedAction(o, "review") },
    { id: "duplicate", label: "Duplicate", icon: "⧉", priority: 30, types: ["*"], handler: (o) => duplicateObject(o) },
    { id: "lock", label: (o) => o.dataset.locked === "true" ? "Unlock" : "Lock", icon: "🔒", priority: 31, types: ["*"], handler: (o) => { snapshot(); toggleLock(o); } },
    { id: "glow", label: "Glow", icon: "✦", priority: 32, types: ["*"], handler: (o) => { snapshot(); toggleGlow(o); } },
    { id: "smaller", label: "Smaller", icon: "−", priority: 40, types: ["*"], available: (o) => o.dataset.locked !== "true", handler: (o) => { snapshot(); resizeObject(o, -0.1); } },
    { id: "larger", label: "Larger", icon: "+", priority: 41, types: ["*"], available: (o) => o.dataset.locked !== "true", handler: (o) => { snapshot(); resizeObject(o, 0.1); } },
    { id: "rotate-left", label: "Rotate Left", icon: "↺", priority: 42, types: ["*"], available: (o) => o.dataset.locked !== "true", handler: (o) => { snapshot(); rotateObject(o, -15); } },
    { id: "rotate-right", label: "Rotate Right", icon: "↻", priority: 43, types: ["*"], available: (o) => o.dataset.locked !== "true", handler: (o) => { snapshot(); rotateObject(o, 15); } },
    { id: "flip", label: "Flip", icon: "⇋", priority: 44, types: ["*"], available: (o) => o.dataset.locked !== "true", handler: (o) => { snapshot(); flipObject(o); } },
    { id: "to-front", label: "Bring to Front", icon: "⤒", priority: 45, types: ["*"], available: () => typeof bringToFront === "function", handler: (o) => { snapshot(); bringToFront(o); } },
    { id: "forward", label: "Bring Forward", icon: "⬆", priority: 46, types: ["*"], handler: (o) => { snapshot(); bringForward(o); } },
    { id: "backward", label: "Send Backward", icon: "⬇", priority: 47, types: ["*"], handler: (o) => { snapshot(); sendBackward(o); } },
    { id: "to-back", label: "Send to Back", icon: "⤓", priority: 48, types: ["*"], available: () => typeof sendToBack === "function", handler: (o) => { snapshot(); sendToBack(o); } },
    { id: "ungroup", label: "Ungroup", icon: "⊟", priority: 49, types: ["*"], available: (o) => Boolean(o.dataset.groupId && typeof ungroupCurrentItems === "function"), handler: (o) => { snapshot(); ungroupCurrentItems(o.dataset.groupId); } },
    { id: "back-to-altar", label: "Back to Altar", mobileLabel: "Deselect", icon: "←", priority: 98, types: ["*"], handler: () => deselectObject() },
    { id: "delete", label: "Delete", icon: "🗑", priority: 99, types: ["*"], handler: (o) => deleteObject(o) }
  ];

  function actionApplies(action, object) {
    if (!action || !String(action.id || "").trim() || typeof action.handler !== "function") return false;
    const type = objectType(object);
    if (!Array.isArray(action.types)) return false;
    const typeMatches = action.types.includes("*") || action.types.includes(type) || (action.types.includes("crafted") && isCrafted(object));
    const label = typeof action.label === "function" ? action.label(object) : action.label;
    return typeMatches && String(label || "").trim() && (!action.available || action.available(object));
  }

  function getObjectActions(object = currentObject()) {
    if (!object) return [];
    return registry.filter((action) => actionApplies(action, object)).sort((a, b) => a.priority - b.priority);
  }

  // Line icons in the toolbar's own drawing (altar-toolbar.js): 24px, 1.6 stroke, never emoji.
  const ACTION_ICONS = {
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    light: '<path d="M12 3c2.8 3.2 4.5 5.6 4.5 8.6a4.5 4.5 0 0 1-9 0c0-1.7.8-3.2 2-4.4.2 1.4.9 2.3 1.8 2.8C11 7.6 11.2 5.3 12 3Z"/><path d="M9 20h6"/>',
    leaf: '<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14Z"/><path d="M5 19 13 11"/>',
    drop: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z"/>',
    moon: '<path d="M18.5 14.5A7.5 7.5 0 0 1 9.5 5.5a7.5 7.5 0 1 0 9 9Z"/>',
    star: '<path d="m12 3 2.2 5.6L20 9.3l-4.5 3.8 1.4 5.9L12 15.9 7.1 19l1.4-5.9L4 9.3l5.8-.7z"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/><path d="M12 7.5V12l3 2"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    gauge: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-1.5-3-5-3.5-5-1.5S10 9 12 9Zm0 0c1.5-3 5-3.5 5-1.5S14 9 12 9Z"/>',
    duplicate: '<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    glow: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    smaller: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/>',
    larger: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8M12 8v8"/>',
    "rotate-left": '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4v4h4"/>',
    "rotate-right": '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M20 4v4h-4"/>',
    flip: '<path d="M12 3v18"/><path d="M9 7 4 17h5zM15 7l5 10h-5z"/>',
    "to-front": '<path d="M5 4h14"/><path d="M12 20V8M7.5 12.5 12 8l4.5 4.5"/>',
    forward: '<path d="M12 19V5M6.5 10.5 12 5l5.5 5.5"/>',
    backward: '<path d="M12 5v14M6.5 13.5 12 19l5.5-5.5"/>',
    "to-back": '<path d="M5 20h14"/><path d="M12 4v12M7.5 11.5 12 16l4.5-4.5"/>',
    ungroup: '<rect x="3.5" y="3.5" width="8" height="8" rx="1"/><rect x="12.5" y="12.5" width="8" height="8" rx="1"/>',
    "back-to-altar": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    delete: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>'
  };
  const ICON_FOR_ACTION = {
    "replace-candle": "light", "ritual-candle": "star", "dress-candle": "leaf", "clear-dressings": "leaf",
    cleanse: "drop", charge: "moon", dedicate: "star", "record-offering": "gift", "reason-presence": "edit",
    "edit-apothecary": "edit", "begin-practice": "star", "edit-practice": "edit", relationships: "link",
    activation: "star", remaining: "gauge", tend: "leaf", review: "calendar"
  };

  function actionIcon(id) {
    const paths = ACTION_ICONS[id] || ACTION_ICONS[ICON_FOR_ACTION[id]] || ACTION_ICONS.star;
    return `<span class="altar-icon altar-icon--small" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg></span>`;
  }

  // The See More panel's groups, as the altar toolbar groups its own tools.
  // Whatever is the object's own (light, tend, history...) goes under Tend.
  const ACTION_GROUPS = [
    { key: "arrange", label: "Arrange", ids: ["smaller", "larger", "rotate-left", "rotate-right", "flip"] },
    { key: "layer", label: "Layer", ids: ["to-front", "forward", "backward", "to-back"] },
    { key: "keep", label: "Keep", ids: ["duplicate", "lock", "glow", "ungroup", "back-to-altar", "delete"] }
  ];
  const GROUPED_IDS = new Set(ACTION_GROUPS.flatMap((group) => group.ids));

  function actionLabel(action, object) {
    const configuredLabel = MOBILE_QUERY.matches && action.mobileLabel ? action.mobileLabel : action.label;
    return typeof configuredLabel === "function" ? configuredLabel(object) : configuredLabel;
  }

  function buttonMarkup(action, object, overflow = false) {
    const label = actionLabel(action, object);
    const danger = action.id === "delete" ? ' class="is-danger"' : "";
    return `<button type="button"${danger} data-action="${escapeHtml(action.id)}" ${overflow ? 'role="menuitem"' : ""} title="${escapeHtml(label)}">${actionIcon(action.id)}<span>${escapeHtml(label)}</span></button>`;
  }

  // Forward and Backward, one tap away on wider screens.
  function layerPairMarkup(object) {
    const buttons = ["forward", "backward"].map((id) => {
      const action = registry.find((candidate) => candidate.id === id);
      if (!actionApplies(action, object)) return "";
      const label = actionLabel(action, object);
      return `<button type="button" data-action="${id}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${actionIcon(id)}</button>`;
    }).join("");
    return buttons ? `<div class="altar-object-actions-layer" role="group" aria-label="Layer">${buttons}</div>` : "";
  }

  function groupMarkup(key, label, buttons) {
    if (!buttons) return "";
    const id = `altar-object-actions-${key}`;
    return `<div class="altar-object-actions-group" role="group" aria-labelledby="${id}"><p class="altar-object-actions-label" id="${id}">${escapeHtml(label)}</p><div class="altar-object-actions-row">${buttons}</div></div>`;
  }

  function overflowGroupsMarkup(actions, object, altarActions) {
    const tend = actions.filter((action) => !GROUPED_IDS.has(action.id));
    return [
      groupMarkup("tend", "Tend", tend.map((action) => buttonMarkup(action, object, true)).join("")),
      ...ACTION_GROUPS.map((group) => groupMarkup(group.key, group.label, group.ids
        .map((id) => actions.find((action) => action.id === id))
        .filter(Boolean)
        .map((action) => buttonMarkup(action, object, true))
        .join(""))),
      groupMarkup("altar", "Altar actions", altarActions)
    ].join("");
  }

  function globalActionMarkup() {
    return Array.from(altarActionBar.querySelectorAll(':scope > .altar-action-group [data-global-action]'))
      .filter((button) => !button.disabled && String(button.textContent || "").trim())
      .map((button) => {
        const icon = button.querySelector(".altar-icon svg");
        const iconMarkup = icon ? `<span class="altar-icon altar-icon--small" aria-hidden="true">${icon.outerHTML}</span>` : "";
        return `<button type="button" data-global-action="${escapeHtml(button.dataset.globalAction)}" role="menuitem">${iconMarkup}<span>${escapeHtml(button.textContent.trim())}</span></button>`;
      })
      .join("");
  }

  function closeObjectActionOverflow() {
    overflowOpen = false;
    overflowObject = null;
    pendingActionAnchor = null;
    const popup = toolbar?.querySelector("[data-object-action-overflow]");
    const trigger = toolbar?.querySelector("[data-object-action-more]");
    const backdrop = toolbar?.querySelector("[data-object-action-backdrop]");
    // Focus that was in the panel goes back to See More, not to the page's top.
    const hadFocus = Boolean(popup && !popup.hidden && popup.contains(document.activeElement));
    if (popup) popup.hidden = true;
    if (backdrop) backdrop.hidden = true;
    if (hadFocus) trigger?.focus({ preventScroll: true });
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("altar-action-sheet-open");
  }

  function renderSelectedObjectActions(object = currentObject()) {
    if (!toolbar || !altarActionBar) return;
    closeActionModal();
    const preserveOverflow = overflowOpen && sameObject(overflowObject, object);
    const anchor = preserveOverflow ? pendingActionAnchor : null;
    if (!preserveOverflow) closeObjectActionOverflow();
    altarActionBar.classList.toggle("has-object-selection", Boolean(object));
    if (!object) {
      toolbar.hidden = true;
      toolbar.replaceChildren();
      return;
    }

    const actions = getObjectActions(object);
    const visibleCount = MOBILE_QUERY.matches ? 3 : 4;
    const visible = actions.slice(0, visibleCount);
    const hasMore = actions.length > visibleCount;
    const altarActions = globalActionMarkup();
    const layerPair = MOBILE_QUERY.matches ? "" : layerPairMarkup(object);
    const objectName = String(object.dataset.label || "").trim();
    const heading = objectName && objectName !== "object" ? objectName : "This object";
    toolbar.innerHTML = `
      <div class="altar-object-actions-visible">${visible.map((action) => buttonMarkup(action, object)).join("")}</div>
      ${layerPair}
      ${hasMore || altarActions ? `
        <div class="altar-object-actions-more-wrap">
          <button type="button" data-object-action-more aria-haspopup="menu" aria-expanded="${preserveOverflow}">${actionIcon("more")}<span>See More</span></button>
          <div class="altar-object-actions-backdrop" data-object-action-backdrop ${preserveOverflow ? "" : "hidden"}></div>
          <div class="altar-object-actions-overflow" data-object-action-overflow ${preserveOverflow ? "" : "hidden"}>
            <div class="altar-object-actions-head">
              <p class="altar-object-actions-heading">${escapeHtml(heading)}</p>
              <button type="button" class="altar-object-actions-close" data-close-object-actions aria-label="Close actions" title="Close">${actionIcon("close")}</button>
            </div>
            <div class="altar-object-actions-body" role="menu" aria-label="Selected object actions">${overflowGroupsMarkup(actions, object, altarActions)}</div>
          </div>
        </div>
      ` : ""}
    `;
    toolbar.hidden = false;
    if (preserveOverflow) {
      overflowObject = object;
      document.body.classList.toggle("altar-action-sheet-open", MOBILE_QUERY.matches);
      window.requestAnimationFrame(() => restoreActionAnchor(anchor, object));
    }
    pendingActionAnchor = null;
  }

  async function executeSelectedObjectAction(actionId, object = currentObject()) {
    if (!object || !actionId) return false;
    if (actionId === "more") return false;
    const action = getObjectActions(object).find((candidate) => candidate.id === actionId);
    if (!action) return false;
    const closesDrawer = actionId === "back-to-altar" || actionId === "delete";
    pendingActionAnchor = closesDrawer ? null : captureActionAnchor(actionId, object);
    if (closesDrawer) closeObjectActionOverflow();
    await action.handler(object);
    if (actionId === "back-to-altar") return true;
    if (!document.querySelector("[data-object-action-modal]")) {
      refreshAfterAction(currentObject(object));
    }
    return true;
  }

  document.addEventListener("click", (event) => {
    const more = event.target.closest("[data-object-action-more]");
    if (more) {
      event.preventDefault();
      event.stopPropagation();
      overflowOpen = !overflowOpen;
      overflowObject = overflowOpen ? currentObject() : null;
      pendingActionAnchor = null;
      const popup = toolbar.querySelector("[data-object-action-overflow]");
      popup.hidden = !overflowOpen;
      const backdrop = toolbar.querySelector("[data-object-action-backdrop]");
      if (backdrop) backdrop.hidden = !overflowOpen;
      more.setAttribute("aria-expanded", String(overflowOpen));
      document.body.classList.toggle("altar-action-sheet-open", overflowOpen && MOBILE_QUERY.matches);
      if (overflowOpen) popup.querySelector('[role="menuitem"]')?.focus({ preventScroll: true });
      return;
    }
    if (event.target.closest("[data-close-object-actions]")) {
      closeObjectActionOverflow();
      return;
    }
    if (event.target.closest("[data-object-action-overflow] [data-global-action]")) closeObjectActionOverflow();
    if (event.target.closest("[data-object-action-backdrop]") || (overflowOpen && !event.target.closest(".altar-object-actions-more-wrap"))) closeObjectActionOverflow();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const actionModal = document.querySelector("[data-object-action-modal]");
    if (actionModal) {
      event.preventDefault();
      closeActionModal();
      return;
    }
    if (overflowOpen) {
      event.preventDefault();
      closeObjectActionOverflow();
      return;
    }
    const modalOpen = Boolean(document.querySelector("[role=dialog]"));
    if (!modalOpen && currentObject() && typeof deselectObject === "function") deselectObject();
  });

  const resetDrawerForViewport = (event) => {
    if (!event.matches) closeObjectActionOverflow();
    // Labels, the layer pair and the visible count differ between phone and desk.
    if (currentObject() && !document.querySelector("[data-object-action-modal]")) renderSelectedObjectActions();
  };
  if (typeof MOBILE_QUERY.addEventListener === "function") MOBILE_QUERY.addEventListener("change", resetDrawerForViewport);
  else MOBILE_QUERY.addListener(resetDrawerForViewport);

  window.altarObjectActionRegistry = registry;
  window.getAltarObjectActions = getObjectActions;
  window.renderSelectedObjectActions = renderSelectedObjectActions;
  window.executeSelectedObjectAction = executeSelectedObjectAction;
  window.closeObjectActionOverflow = closeObjectActionOverflow;
  window.AltarObjectActionDrawer = Object.freeze({
    objectIdentity,
    actionScrollOwner,
    captureActionAnchor,
    restoreActionAnchor,
    isOpen: () => overflowOpen
  });
})();
