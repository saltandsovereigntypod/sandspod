/* =========================================================
   ALTAR UI
   Empty state, toast, modals, mobile cabinet, toolbar shell
   ========================================================= */

const workspacePanelStyles = document.createElement("link");
workspacePanelStyles.rel = "stylesheet";
workspacePanelStyles.href = "workspace-panel.css";
document.head.appendChild(workspacePanelStyles);

const toolbar = document.createElement("div");
toolbar.className = "altar-toolbar is-in-action-bar";
toolbar.hidden = true;
toolbar.setAttribute("aria-label", "Selected object actions");

// The selected object's actions, under the stage while something is selected.
// The altar-wide actions (Undo, Save, Add, Tend, More…) are the one toolbar
// in index.html ([data-altar-tools]), as the app groups them; events.js
// handles their data-global-action buttons wherever they sit.
const altarActionBar = document.createElement("div");
altarActionBar.className = "altar-action-bar";

const altarMobileBackdrop = document.createElement("button");
altarMobileBackdrop.type = "button";
altarMobileBackdrop.className = "altar-mobile-backdrop";
altarMobileBackdrop.setAttribute("aria-label", "Close altar cabinet");

const altarToast = document.createElement("div");
altarToast.className = "altar-toast";
altarToast.hidden = true;

const altarGroupIndicator = document.createElement("div");
altarGroupIndicator.className = "altar-group-indicator";
altarGroupIndicator.hidden = true;

const altarInfoCard = document.createElement("aside");
altarInfoCard.className = "altar-info-card";
altarInfoCard.hidden = true;
altarInfoCard.setAttribute("aria-live", "polite");

const altarCompanionPanel = document.createElement("section");
altarCompanionPanel.className = "altar-companion-panel altar-workspace-module is-visible";
altarCompanionPanel.setAttribute("aria-live", "polite");
altarCompanionPanel.innerHTML = `
  <div class="altar-companion-inner">
    <div class="altar-companion-header">
      <div>
        <p class="eyebrow">Companion</p>
        <h2>Selected Object</h2>
      </div>
    </div>

    <div class="altar-companion-content" data-companion-content>
      <p>Select an object to see its details.</p>
    </div>
  </div>
`;

const altarWorkspacePanel = document.createElement("aside");
altarWorkspacePanel.className = "altar-workspace-panel";
altarWorkspacePanel.setAttribute("aria-label", "Altar companion panel");
altarWorkspacePanel.innerHTML = `<div class="altar-workspace-panel-inner"></div>`;
altarWorkspacePanel.querySelector(".altar-workspace-panel-inner").append(
  altarCompanionPanel
);

const mobileCabinetToggle = document.createElement("button");
mobileCabinetToggle.type = "button";
mobileCabinetToggle.className = "altar-mobile-cabinet-toggle";
mobileCabinetToggle.textContent = "✦ Add Items";
mobileCabinetToggle.setAttribute("aria-expanded", "false");

// The Companion sizes itself in CSS now (altar-page.css): it sits in the side
// column above the tools and scrolls within its own height. Kept as a no-op
// for the callers that still ask for a resync.
function syncAltarWorkspacePanelHeight() {
  altarWorkspacePanel?.style.removeProperty("height");
}

if (altarStage) {

  const altarWorkspace = altarStage.closest(".altar-workspace");
  const altarStageWrap = altarStage.closest(".altar-stage-wrap");
  const altarSide = altarWorkspace?.querySelector("[data-altar-side]");

  // The selected object's page (the Companion) leads the side column, above the tools.
  if (altarSide) {
    altarSide.prepend(altarWorkspacePanel);
  } else if (altarWorkspace && altarStageWrap) {
    altarWorkspace.insertBefore(altarWorkspacePanel, altarStageWrap);
  }

  const lightingCanvas = document.createElement("canvas");
  lightingCanvas.className = "altar-lighting-layer";
  lightingCanvas.setAttribute("data-lighting-layer", "");

  altarStage.appendChild(lightingCanvas);

  altarStage.after(altarActionBar);
  altarActionBar.prepend(toolbar);
  altarStage.appendChild(altarGroupIndicator);
  altarStage.appendChild(altarInfoCard);

}

if (altarCabinet) {
  document.body.appendChild(altarMobileBackdrop);
  document.body.appendChild(mobileCabinetToggle);
  document.body.appendChild(altarToast);
}

function setAltarWorkspacePanelMinimized(isMinimized) {
  document.body.classList.toggle("altar-companion-minimized", isMinimized);
  altarWorkspacePanel.classList.toggle("is-minimized", isMinimized);

  document.querySelectorAll("[data-companion-toggle]").forEach((button) => {
    button.textContent = isMinimized ? "☰" : "−";
    button.setAttribute("aria-expanded", String(!isMinimized));
    button.setAttribute(
      "aria-label",
      isMinimized ? "Open companion panel" : "Minimize companion panel"
    );
  });

  window.requestAnimationFrame(() => {
    syncAltarWorkspacePanelHeight();

    if (typeof repositionAllObjectsFromPercent === "function") {
      repositionAllObjectsFromPercent();
    }

    if (typeof resizeLightingCanvas === "function") {
      resizeLightingCanvas();
    }

    if (typeof renderLighting === "function") {
      renderLighting();
    }
  });
}

document.addEventListener(
  "click",
  (event) => {
    const toggle = event.target.closest("[data-companion-toggle]");
    if (!toggle) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const isCurrentlyMinimized = document.body.classList.contains("altar-companion-minimized");
    setAltarWorkspacePanelMinimized(!isCurrentlyMinimized);

    if (typeof showAltarToast === "function") {
      showAltarToast(isCurrentlyMinimized ? "Panel opened" : "Panel minimized");
    }
  },
  true
);

function updateEmptyMessage() {
  if (!altarStage || !emptyMessage) return;
  emptyMessage.hidden = altarStage.querySelectorAll(".altar-object").length > 0;
}

function showAltarToast(message) {
  if (!altarToast) return;

  altarToast.textContent = message;
  altarToast.hidden = false;
  altarToast.classList.add("is-visible");

  window.clearTimeout(showAltarToast.timeout);

  showAltarToast.timeout = window.setTimeout(() => {
    altarToast.classList.remove("is-visible");

    window.setTimeout(() => {
      altarToast.hidden = true;
    }, 250);
  }, 1600);
}

function closeMobileCabinet() {
  if (!altarCabinet) return;

  altarCabinet.classList.remove("is-mobile-open");
  document.body.classList.remove("altar-cabinet-open");
  mobileCabinetToggle.setAttribute("aria-expanded", "false");
}

function openSaveModal() {
  if (!saveModal) return;

  saveModal.hidden = false;
  document.body.classList.add("altar-modal-open");
}

function closeSaveModal() {
  if (!saveModal) return;

  saveModal.hidden = true;
  document.body.classList.remove("altar-modal-open");
}

altarMobileBackdrop.addEventListener("click", closeMobileCabinet);
