/* =========================================================
   RITUAL TEMPLATE SAVE-AND-START BRIDGE
   Templates created from Start Ritual begin immediately after save.
   ========================================================= */

let ritualTemplateShouldStartAfterSave = false;

// Capture the origin before the template editor handles the click.
document.addEventListener(
  "click",
  (event) => {
    const openButton = event.target.closest("[data-open-ritual-template-editor]");
    if (!openButton) return;

    ritualTemplateShouldStartAfterSave = Boolean(
      openButton.closest(".altar-companion-panel")
    );
  },
  true
);

// Closing the editor without saving cancels the pending launch intent.
document.addEventListener(
  "click",
  (event) => {
    const closeButton = event.target.closest("[data-close-ritual-template-editor]");
    const clickedBackdrop =
      typeof ritualTemplateEditorOverlay !== "undefined"
      && ritualTemplateEditorOverlay
      && event.target === ritualTemplateEditorOverlay;

    if (closeButton || clickedBackdrop) {
      ritualTemplateShouldStartAfterSave = false;
    }
  },
  true
);

if (typeof saveRitualTemplateFromEditor === "function") {
  const originalSaveRitualTemplateFromEditor = saveRitualTemplateFromEditor;

  saveRitualTemplateFromEditor = async function saveRitualTemplateAndMaybeStart(form) {
    const templateIdBeforeSave = String(
      new FormData(form).get("template_id") || ""
    );

    const shouldStartAfterSave =
      ritualTemplateShouldStartAfterSave
      && !templateIdBeforeSave
      && !activeRitualSession
      && !(typeof hasStoredRitualForCurrentScope === "function" && hasStoredRitualForCurrentScope());

    await originalSaveRitualTemplateFromEditor(form);

    if (!shouldStartAfterSave) return;

    const savedTemplateId = ritualTemplateEditorState.activeTemplateId;
    const savedTemplate = ritualTemplateEditorState.templates.find(
      (template) => template.id === savedTemplateId
    );

    if (!savedTemplate) {
      throw new Error("The template was saved, but it could not be started.");
    }

    ritualTemplateShouldStartAfterSave = false;
    closeRitualTemplateEditor();

    if (!(await createTemplateRitualSession(savedTemplate))) return;
    renderActiveRitualPanel();

    if (typeof showAltarToast === "function") {
      showAltarToast("Ritual template saved and started");
    }
  };
}

/* =========================================================
   SET A RITUAL FOR A CHOSEN TIME
   Find a good time (practice/cosmic/timing.js) links here with
   ?setDate=&setTime=… (rituals/js/set-ritual.js). The editor opens
   on a new template with a "Set for" note; saving it keeps the
   template, plans it for that time and opens the plan.
   ========================================================= */

let ritualTemplateSetFor = null;

if (typeof saveRitualTemplateFromEditor === "function" && window.SaltSetRitual) {
  const saveBeforeSetting = saveRitualTemplateFromEditor;

  saveRitualTemplateFromEditor = async function saveRitualTemplateAndSetIt(form) {
    const set = ritualTemplateSetFor;
    const isNew = !String(new FormData(form).get("template_id") || "");
    await saveBeforeSetting(form);
    if (!set || !isNew) return;

    const saved = ritualTemplateEditorState.templates.find((item) => item.id === ritualTemplateEditorState.activeTemplateId);
    if (!saved) return;
    const SR = window.SaltSetRitual;
    const plan = SR.keep(SR.plan({ id: SR.newId(), set, title: saved.title, templateId: saved.id }));
    ritualTemplateSetFor = null;
    window.location.href = SR.planHref(plan);
  };
}

// Closing the editor leaves the chosen time behind.
document.addEventListener(
  "click",
  (event) => {
    if (event.target.closest("[data-close-ritual-template-editor]") || (ritualTemplateEditorOverlay && event.target === ritualTemplateEditorOverlay)) ritualTemplateSetFor = null;
  },
  true
);

function showRitualTemplateSetNote() {
  const set = ritualTemplateSetFor;
  const form = document.querySelector("[data-ritual-template-editor-form]");
  if (!set || !form || form.querySelector("[data-ritual-template-set-note]")) return;
  const note = document.createElement("p");
  note.className = "ritual-template-status";
  note.setAttribute("data-ritual-template-set-note", "");
  const why = set.why ? ` ${set.why}${/[.!?]$/.test(set.why) ? "" : "."}` : "";
  note.textContent = `Set for ${window.SaltSetRitual.whenText(set)}.${why} Saving it plans it for then.`;
  form.prepend(note);
  const intention = form.querySelector('textarea[name="intention"]');
  if (intention && !intention.value && set.label) intention.value = set.label;
}

window.addEventListener("load", () => {
  const set = window.SaltSetRitual?.read(window.location.search);
  if (!set || typeof openRitualTemplateEditor !== "function") return;
  ritualTemplateSetFor = set;
  openRitualTemplateEditor(null)
    .then(() => {
      // Signed out, the editor asks you to sign in; the time stays in the URL for when you come back.
      if (!document.querySelector("[data-ritual-template-editor-form]")) return;
      showRitualTemplateSetNote();
      window.history.replaceState({}, "", window.location.pathname);
    })
    .catch(console.error);
});

window.addEventListener("load", () => {
  const templateId = new URLSearchParams(window.location.search).get("editRitualTemplate");
  if (!templateId || typeof openRitualTemplateEditor !== "function") return;

  openRitualTemplateEditor(templateId)
    .then(() => window.history.replaceState({}, "", window.location.pathname))
    .catch(console.error);
});

/* =========================================================
   BEGIN A RITUAL HANDED OVER FROM THE RITUALS PAGES
   /rituals/ (the planner, a plan, the premade book, the spell
   builder) links here with ?ritual=1&beginRitual=1 and leaves
   what to begin in sessionStorage "saltRitualBegin": one of
   your templates by id, a premade working or spell shaped as a
   template, or a working of your own. It starts the way the
   companion's own "Begin This Ritual" does.
   ========================================================= */

const RITUAL_BEGIN_HANDOFF_KEY = "saltRitualBegin";
const RITUAL_PLANS_KEY = "rituals.plans.v1";

function takeRitualBeginHandoff() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("beginRitual")) return null;
  url.searchParams.delete("beginRitual");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  let handoff = null;
  try {
    handoff = JSON.parse(sessionStorage.getItem(RITUAL_BEGIN_HANDOFF_KEY));
    sessionStorage.removeItem(RITUAL_BEGIN_HANDOFF_KEY);
  } catch {
    return null;
  }
  // Only a hand-off from the last few minutes: a reload later never starts a ritual again.
  if (!handoff || handoff.version !== 1 || Date.now() - Number(handoff.createdAt || 0) > 10 * 60 * 1000) return null;
  return handoff;
}

function waitForRitualAuth() {
  if (window.getSaltCommunityModeratorState?.().resolved) return Promise.resolve();
  return new Promise((resolve) => {
    document.addEventListener("saltAuthReady", () => resolve(), { once: true });
    window.setTimeout(resolve, 5000);
  });
}

/** A planned working is done once it has begun (as the app does); its row stays. */
async function markHandedOverPlanDone(planId, user) {
  const doneAt = new Date().toISOString();
  try {
    const plans = JSON.parse(localStorage.getItem(RITUAL_PLANS_KEY) || "[]");
    if (Array.isArray(plans)) {
      localStorage.setItem(RITUAL_PLANS_KEY, JSON.stringify(plans.map((plan) => (plan && plan.id === planId ? { ...plan, doneAt } : plan))));
    }
  } catch {
    /* The account's copy below is the one that matters when signed in. */
  }
  if (!user) return;
  const { error } = await db.from("ritual_plans").update({ done_at: doneAt, updated_at: doneAt }).eq("id", planId).eq("user_id", user.id);
  if (error) console.warn("The plan could not be marked as begun.", error);
}

/** Keep what the app keeps with a session: its ingredients, the premade it came from, the altar it runs on, the plan it was begun from. */
async function addHandoffToRitualSession(handoff, user) {
  const extra = {};
  if (Array.isArray(handoff.ingredients) && handoff.ingredients.length) extra.ingredients = handoff.ingredients;
  if (handoff.premadeId) extra.premadeId = handoff.premadeId;
  // Done once from Community Rituals, kept as the app keeps it (lib/rituals/community.ts communityOrigin).
  if (handoff.community?.id) extra.from = { kind: "community", id: handoff.community.id, credit: handoff.community.credit || "" };
  if (handoff.closing) extra.closing = handoff.closing;
  if (handoff.altarId) extra.ranOnAltar = handoff.altarId;
  // The plan it was begun from, so a reading drawn before it shows beside "Did it work?".
  if (handoff.planId) extra.planId = handoff.planId;
  if (!Object.keys(extra).length || !activeRitualSession) return;
  activeRitualSession.metadata = { ...(activeRitualSession.metadata || {}), ...extra };
  if (!user) {
    persistGuestActiveRitual();
    return;
  }
  const { error } = await db
    .from("ritual_sessions")
    .update({ metadata: activeRitualSession.metadata })
    .eq("id", activeRitualSession.id)
    .eq("user_id", user.id);
  if (error) console.warn("The ritual's ingredients could not be kept with it.", error);
}

async function beginHandedOverRitual() {
  const handoff = takeRitualBeginHandoff();
  if (!handoff || typeof createTemplateRitualSession !== "function") return;
  await waitForRitualAuth();
  try {
    const user = await getRitualUser();
    await fetchActiveRitualSession();
    if (activeRitualSession) {
      renderActiveRitualPanel();
      showAltarToast("Finish the ritual that's under way before beginning another.");
      return;
    }

    let session = null;
    if (handoff.kind === "free") {
      session = await createFreeRitualSession({ title: handoff.title || "", intention: handoff.intention || "" });
    } else {
      let template = handoff.template || null;
      if (handoff.kind === "template") {
        const templates = await getRitualTemplates();
        template = templates.find((item) => item.id === handoff.templateId) || null;
        if (!template) throw new Error("That template could not be found. It may have been archived.");
      }
      if (!template) return;
      if (handoff.altarId) {
        template = { ...template, linked_altar_id: handoff.altarId };
        // Signed in, the automation loads the linked altar itself; guests' altars are in this browser.
        if (!user && typeof loadAltarById === "function") await loadAltarById(handoff.altarId);
      }
      // null means the person chose not to continue past a candle-life warning.
      session = await createTemplateRitualSession(template);
    }
    if (!session) return;

    await addHandoffToRitualSession(handoff, user);
    if (handoff.planId) await markHandedOverPlanDone(handoff.planId, user);
    renderActiveRitualPanel();
    showAltarToast("Ritual started");
  } catch (error) {
    console.error(error);
    showAltarToast(error.message || "The ritual could not be started");
  }
}

window.addEventListener("load", () => {
  beginHandedOverRitual();
});
