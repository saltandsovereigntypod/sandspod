/*
 * One panel over a coven altar, as in the app (components/covens/
 * AltarRitual.tsx AltarPanel), with two tabs: "Messages" (the coven's chat)
 * and, while a rite is under way, "Ritual" (the step in progress). It folds
 * down to a slim bar in the corner; open, it takes at most about a third of
 * the screen along the bottom, with no backdrop, so the altar above stays in
 * view and can still be tended. The rite's pop-ups sit at the top of the
 * screen (covens/coven/step-popups.js).
 *
 * Messages is the Messages tab itself (covens/coven/chat.js, mounted with
 * { panel: true }), so who may write (members in good standing whose position
 * talks in the chat), blocks, reports, signing the agreements and coven
 * readings work exactly as they do there. "Chats" switches to one of your
 * conversations and "Open" goes to the full Messages tab. What you may do in
 * the coven comes from the same loader as the coven's page
 * (CovenUI.loadAccess).
 *
 * Ritual shows the step under way with its parts said plainly, your turn,
 * Done, the items ticking off as they go on this altar, and moving on (the
 * step's ender's alone); "Open" goes to the whole ritual on the coven's page
 * once it is over.
 *
 * While a rite is under way everyone stays at the altar, as in the app: the
 * Ritual tab is the home of the step. It opens by itself (a soft chime, a
 * brief glow) when a step begins, when your turn comes, and when a step you
 * move on is finished, in place of pop-ups over the altar; folded, its bar
 * keeps the step in a line ("Step 3 · Your turn: Call the East"). It says how
 * to do the step (the planner's words, or a plain default), sets the step's
 * items down from tiles, takes a petition straight onto the altar, lights up
 * what to tap for the person whose part it is (coven-altar.js glow), counts
 * the deed when it is done by hand (arm), and runs a sit for everyone in step
 * (covens/coven/ritual-sit.js). The rules are SaltCore.covens.ritualPanel.
 *
 * The altar page (altar/js/features/coven-altar.js) loads this, and the
 * coven scripts it needs, only when a coven altar is open.
 */
(function (global) {
  "use strict";

  const doc = global.document;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const L = global.CovenLogic;
  const { esc, href } = UI;
  const P = () => global.SaltCore?.covens?.altarPanel || null;
  const PP = () => global.CovenStepPopups || null;
  const badge = (n) => (P() ? P().badgeLabel(n) : n > 99 ? "99+" : String(n));

  let state = null;
  let live = null;
  let panel = null;
  let open = false;
  let tab = "messages";
  let chatMounted = false;
  let unread = 0;
  let slug = "";
  let altarId_ = "";
  let objects = null;
  let lastCue = "";
  const RP = () => global.SaltCore?.covens?.ritualPanel || null;
  const AA = () => global.SaltCore?.covens?.altarActions || null;

  const covenHref = (t) => href(`/covens/coven/?c=${encodeURIComponent(slug)}${t && t !== "about" ? `&tab=${t}` : ""}`);
  const ritualNow = () => (P() && state ? P().liveRitualFor(state.rituals || [], altarId_, null) : null);
  const stepsOf = (ritual) => (L ? L.orderSteps(state.ritualSteps || [], ritual.id) : []);

  // iOS Safari lays the keyboard over fixed things; keep the panel above it.
  function keepAboveKeyboard() {
    const vv = global.visualViewport;
    if (!panel || !vv) return;
    const covered = Math.max(0, global.innerHeight - vv.height - vv.offsetTop);
    panel.style.setProperty("--cv-keyboard", `${covered}px`);
  }

  function showTabs() {
    if (!panel) return;
    const ritual = ritualNow();
    if (!ritual && tab === "ritual") tab = "messages";
    panel.classList.toggle("is-open", open);
    panel.querySelectorAll("[data-tab-to]").forEach((button) => {
      const which = button.dataset.tabTo;
      button.hidden = which === "ritual" && !ritual;
      const on = open && tab === which;
      button.setAttribute("aria-selected", on ? "true" : "false");
      button.classList.toggle("is-active", on);
      if (which === "messages") button.textContent = unread ? `Messages ${badge(unread)}` : "Messages";
    });
    panel.querySelector("[data-fold]").hidden = !open;
    const line = panel.querySelector("[data-bar-line]");
    if (line) {
      line.textContent = barLine;
      line.hidden = open || !barLine || !ritual;
    }
    // Messages read only while they show (as before, when the window closed).
    if (chatMounted && !(open && tab === "messages")) {
      chatMounted = false;
      global.CovenChat.unmount();
    }
    panel.querySelector("[data-messages]").hidden = !(open && tab === "messages");
    panel.querySelector("[data-ritual]").hidden = !(open && tab === "ritual");
    const chats = panel.querySelector("[data-chats]");
    if (chats) chats.textContent = unread ? `Chats ${badge(unread)}` : "Chats";
  }

  function pick(which) {
    if (open && tab === which) return fold();
    tab = which;
    open = true;
    if (which === "messages" && !chatMounted) {
      chatMounted = true;
      panel.classList.remove("is-choosing");
      global.CovenChat.mount(panel.querySelector("[data-pane]"), state, { panel: true, covenHref });
    }
    if (which === "ritual") drawRitual();
    keepAboveKeyboard();
    showTabs();
  }

  function fold() {
    open = false;
    showTabs();
  }

  // ── Ritual ───────────────────────────────────────────────────────────
  async function act(button, work) {
    const status = panel.querySelector("[data-ritual] [data-status]");
    const saved = await UI.busy(button, status, work);
    if (saved && saved.id && "current_step_id" in saved) state.rituals = L.applyChange(state.rituals, { eventType: "UPDATE", new: saved });
    await reloadSteps();
    drawRitual();
  }

  const handlers = {
    done: (stepId) => {
      live?.done(stepId);
      state.presence = (state.presence || []).filter((p) => p.user_id !== state.context.user.id).concat({ user_id: state.context.user.id, place: `altar:${altarId_}`, done: stepId });
      drawRitual();
    },
    move: (stepId, button) => act(button, () => D.finishStep(stepId)),
    // A step done for real at this altar (SaltCore.covens.altarActions): doing it is your Done, and passes your turn.
    deed: (kind, stepId) => global.CovenAltarDeed?.start(kind, () => deedDone(stepId)),
    // A step's item from its tile, placed as the cabinet places it.
    tile: (item) => {
      const [itemId, formId] = String(item?.key || "").split("|");
      if (itemId && formId !== undefined && global.AltarCabinet?.placeItem({ itemId, formId })) return;
      global.CovenAltarDeed?.toCabinet?.(item?.name || "");
    },
    // A petition written in the panel, folded onto the altar as its own writer does.
    petition: async (input, form) => {
      if (!input.title.trim() || !global.AltarLiving?.writePetition) return;
      const button = form.querySelector("button[type=submit]");
      if (button) button.disabled = true;
      try {
        await global.AltarLiving.writePetition({ title: input.title, words: input.words, intention: "", timing: "now" });
      } finally {
        if (button) button.disabled = false;
      }
    },
    turn: (stepId, button) =>
      act(button, () =>
        D.nextTurn(stepId).then((saved) => {
          if (saved) state.ritualSteps = L.applyChange(state.ritualSteps, { eventType: "UPDATE", new: saved });
          return true;
        })
      )
  };

  /** Done at the altar: your Done for the step, and on a step taken in turn, your turn passed on. */
  function deedDone(stepId) {
    const step = (state.ritualSteps || []).find((s) => s.id === stepId);
    const finish = AA()?.deedFinish(step || {}, state.context.user.id) || { done: true, passTurn: false };
    if (finish.done) handlers.done(stepId);
    if (finish.passTurn)
      D.nextTurn(stepId)
        .then((saved) => {
          if (saved) state.ritualSteps = L.applyChange(state.ritualSteps, { eventType: "UPDATE", new: saved });
          drawRitual();
        })
        .catch(() => undefined);
  }

  let barLine = "";
  function chime() {
    const a11y = global.SaltAccessibility?.getState?.() || { candleSounds: true };
    if (!a11y.candleSounds) return;
    try {
      const bell = new Audio("/assets/sounds/bell-chime.mp3");
      bell.volume = 0.6;
      void bell.play()?.catch?.(() => {});
    } catch {
      /* a bell that can't sound is simply not heard */
    }
  }

  /** The step's deed waits on the altar, and what to tap glows, for the person whose part it is; a candle-gazing sit lights the lit candle. */
  function armAndGlow(flow) {
    const deeds = global.CovenAltarDeed;
    if (!deeds?.arm) return;
    const step = flow?.step;
    const row = step ? AA()?.atAltarOf(step) : null;
    const sit = step ? AA()?.sitStepOf(step) : null;
    const glowing = !!flow && RP()?.glowsForMe({ kind: flow.kind, mine: flow.mine, myTurn: flow.myTurn, hasOrder: (step.turn_order || []).length > 0, iDone: flow.iDone, complete: flow.progress.complete });
    // A quarters step: one quarter at a time (yours glows, alone), its marker tapped to call or release it.
    const Q = global.SaltCore?.covens?.quarterSteps;
    const ritual = ritualNow();
    const order = Q && ritual ? Q.ritualQuarterOrder(ritual.plan, stepsOf(ritual)) : null;
    const qs = Q && step ? Q.quarterStepOf(step, order) : null;
    const qDeed = qs ? Q.quarterDeed(qs, step.turn_at) : null;
    deeds.quarters?.(qs && flow && !flow.progress.complete ? { mode: qs.mode, order, glow: Q.quarterGlowFor(qs, step.turn_at, glowing), spots: true } : null);
    const kind = qDeed?.kind || row?.deed || null;
    if (kind && glowing && state.standing?.ok !== false) {
      deeds.arm({ kind, quarter: qDeed?.quarter || null, key: `${step.id}:${step.turn_at || 0}:${kind}:${qDeed?.quarter || ""}`, onDone: () => deedDone(step.id) });
      deeds.glow(kind);
      return;
    }
    deeds.arm(null);
    deeds.glow(sit && RP()?.gazesAtCandle(sit.id) && flow && !flow.progress.complete ? "gaze" : null);
  }

  function drawRitual() {
    const holder = panel?.querySelector("[data-ritual]");
    const ritual = ritualNow();
    if (!holder) return showTabs();
    PP()?.clear();
    if (!ritual) {
      barLine = "";
      holder.querySelector("[data-ritual-main]").innerHTML = "";
      global.CovenRitualSit?.stop();
      armAndGlow(null);
      global.CovenAltarDeed?.quarters?.(null);
      return showTabs();
    }
    const steps = stepsOf(ritual);
    const flow = PP()?.flowOf(ritual, steps, state, objects) || null;
    const step = flow?.step;
    const live = ritual.status === "live";
    holder.querySelector("[data-ritual-title]").textContent = ritual.title;
    const openLink = holder.querySelector("[data-ritual-open]");
    openLink.href = `${covenHref("rituals")}&ritual=${encodeURIComponent(ritual.id)}`;
    // While it's under way everyone stays at the altar; afterwards the whole ritual page opens.
    openLink.hidden = live;
    const who = step && L ? L.stepAssignee(step, state.ranks || [], (id) => UI.nameOf(state.context, id)).label : "";
    holder.querySelector("[data-ritual-main]").innerHTML = step
      ? `<p class="sp-eyebrow">Step ${flow.index + 1} of ${steps.length} · ${esc(flow.myTurn || (flow.mine && flow.kind !== "turns") ? "Your turn" : who)}</p><h2 class="cv-altar-ritual__title">${esc(step.title)}</h2>
          ${PP().howHtml(flow)}
          ${step.spoken_text ? `<p class="sp-label">Words to speak</p><blockquote class="cv-doc cv-spoken">${UI.prose(step.spoken_text)}</blockquote>` : ""}
          ${flow.quarter && flow.myTurn && !flow.progress.complete ? `<p class="sp-label">Your words for the ${esc(flow.quarter.line.replace(/^(Call|Release) the /, ""))}</p><blockquote class="cv-doc cv-spoken">${UI.prose(flow.quarter.words)}</blockquote>` : ""}
          ${flow.myTurn && !flow.progress.complete ? `<p class="sp-label">${esc(flow.turn.heading)}</p><div class="sp-actions"><button class="button button--primary" type="button" data-panel-turn>${esc(flow.turn.button)}</button></div>` : ""}
          ${PP().cardHtml(flow, { altarHref: "" })}`
      : `<p class="sp-caption">${live ? "The ritual is under way." : "The ritual has ended."}</p>`;
    if (flow) {
      PP().wire(holder.querySelector("[data-ritual-main]"), flow, handlers);
      holder.querySelector("[data-panel-turn]")?.addEventListener("click", (event) => handlers.turn(flow.step.id, event.currentTarget));
    }
    // A sit runs in the panel for everyone, from the step's own start.
    const sit = step ? AA()?.sitStepOf(step) : null;
    const sitHolder = holder.querySelector("[data-ritual-sit]");
    if (sit && state.standing?.ok !== false) {
      sitHolder.hidden = false;
      global.CovenRitualSit?.mount(sitHolder, {
        stepId: step.id,
        preset: sit.id,
        startedAt: step.started_at,
        onFinished: () => {
          const now = PP()?.flowOf(ritualNow(), stepsOf(ritualNow()), state, objects);
          if (now && now.step.id === step.id && !now.iDone && now.kind === "together") handlers.done(step.id);
        }
      });
    } else {
      sitHolder.hidden = true;
      sitHolder.innerHTML = "";
      global.CovenRitualSit?.stop();
    }
    armAndGlow(flow);
    barLine = flow && RP() ? RP().panelBarLine({ index: flow.index, title: step.title, mine: flow.mine, myTurn: flow.myTurn, kind: flow.kind, iDone: flow.iDone, complete: flow.progress.complete, isEnder: flow.isEnder, quarterLine: flow.quarter?.line }) : "";
    // Opening by itself: a new step, your turn, a finished step you move on.
    const cue = RP() ? RP().panelCue(step?.id, flow) : "";
    const before = lastCue;
    lastCue = cue;
    if (RP()?.opensPanel(before, cue)) {
      if (!(open && tab === "ritual")) {
        tab = "ritual";
        open = true;
        keepAboveKeyboard();
      }
      chime();
      panel.classList.remove("is-cue");
      void panel.offsetWidth;
      panel.classList.add("is-cue");
      global.setTimeout(() => panel.classList.remove("is-cue"), 1800);
    }
    showTabs();
  }

  async function reloadSteps() {
    const ritual = ritualNow();
    if (!ritual) return;
    const fresh = await D.ritualSteps([ritual.id]).catch(() => null);
    if (!fresh) return;
    state.ritualSteps = [...(state.ritualSteps || []).filter((s) => s.ritual_id !== ritual.id), ...fresh];
    const ids = [ritual.led_by, ...fresh.flatMap((s) => s.turn_order || []), ...fresh.flatMap((s) => (s.assignees || []).filter((a) => a.kind === "user").map((a) => a.id))].filter(Boolean);
    if (ids.length) await UI.loadNames(state.context, ids).catch(() => {});
  }

  let objectsTimer = null;
  function loadObjects() {
    global.clearTimeout(objectsTimer);
    objectsTimer = global.setTimeout(async () => {
      const rows = await D.altarObjects(altarId_).catch(() => null);
      if (!rows) return;
      objects = rows.map((r) => r.data || {});
      drawRitual();
    }, 600);
  }

  function onRitual(kind, change) {
    if (kind === "ritual") state.rituals = L.applyChange(state.rituals || [], change);
    else if (kind === "step") state.ritualSteps = L.applyChange(state.ritualSteps || [], change);
    else return;
    if (kind === "ritual") void reloadSteps().then(drawRitual);
    else drawRitual();
  }

  function build() {
    panel = doc.createElement("aside");
    panel.className = "cv-altar-chat";
    panel.setAttribute("aria-label", `Messages and ritual in ${state.coven.name}`);
    panel.innerHTML = `<div class="cv-altar-chat__tabs" role="tablist">
        <button class="cv-altar-chat__line" type="button" data-bar-line hidden aria-label="Open the ritual"></button>
        <button class="cv-altar-chat__tab" type="button" role="tab" data-tab-to="messages">Messages</button>
        <button class="cv-altar-chat__tab is-gold" type="button" role="tab" data-tab-to="ritual" hidden>Ritual</button>
        <button class="button button--ghost button--small cv-altar-chat__fold" type="button" data-fold aria-label="Fold the panel down" hidden>Hide</button>
      </div>
      <div class="cv-altar-chat__body" data-messages hidden>
        <div class="cv-altar-chat__bar">
          <p class="cv-altar-chat__title">${esc(state.coven.name)}</p>
          <button class="button button--ghost button--small" type="button" data-chats aria-label="Your chats">Chats</button>
          <button class="button button--ghost button--small" type="button" data-full aria-label="Open the full Messages tab">Open</button>
        </div>
        <div class="cv-altar-chat__pane" data-pane></div>
      </div>
      <div class="cv-altar-chat__body" data-ritual hidden>
        <div class="cv-altar-chat__bar"><p class="cv-altar-chat__title" data-ritual-title></p>
          <a class="button button--ghost button--small" href="#" data-ritual-open aria-label="Open the whole ritual">Open</a></div>
        <div class="cv-altar-chat__pane">
          <div data-ritual-sit hidden></div>
          <div data-ritual-main></div>
          <p class="cv-status" role="status" aria-live="polite" data-status></p>
        </div>
      </div>`;
    panel.querySelectorAll("[data-tab-to]").forEach((button) => button.addEventListener("click", () => pick(button.dataset.tabTo)));
    panel.querySelector("[data-fold]").addEventListener("click", fold);
    panel.querySelector("[data-bar-line]").addEventListener("click", () => pick("ritual"));
    panel.querySelector("[data-chats]").addEventListener("click", () => panel.classList.toggle("is-choosing"));
    panel.querySelector("[data-full]").addEventListener("click", () => {
      const thread = global.CovenChat.current();
      global.location.assign(`${covenHref("gathering")}${thread ? `&thread=${encodeURIComponent(thread)}` : ""}`);
    });
    panel.addEventListener("keydown", (event) => {
      // Escape folds the panel, unless it's cancelling an edit in the box.
      if (event.key === "Escape" && !event.target.closest?.("textarea")) fold();
    });
    doc.body.append(panel);
    global.visualViewport?.addEventListener("resize", keepAboveKeyboard);
    global.visualViewport?.addEventListener("scroll", keepAboveKeyboard);
  }

  /** Start the panel for the coven altar open on this page. */
  async function start({ covenSlug, altarId }) {
    if (state || !covenSlug || !global.CovenChat) return false;
    slug = covenSlug;
    altarId_ = altarId;
    const context = await UI.boot();
    if (!context.user) return false;
    const coven = await D.coven(slug).catch(() => null);
    if (!coven) return false;
    state = { context, coven, ranks: [], documents: [], signatures: [], unsigned: [], presence: [], rituals: [], ritualSteps: [] };
    await UI.loadAccess(state);
    if (!(state.perms.member || state.perms.site)) return false;
    build();
    global.CovenChat.onTotal((n) => {
      unread = n;
      showTabs();
    });
    live = D.live(coven.id, {
      onMessage: (change) => global.CovenChat.onChange(change),
      onAltar: (change) => {
        const row = change?.new && Object.keys(change.new).length ? change.new : change?.old;
        if (row && (row.altar_id || row.id) === altarId_) loadObjects();
      },
      onRitual,
      onPresence: (presence) => {
        state.presence = Object.values(presence).map((list) => list[0]).filter(Boolean);
        global.CovenChat.onPresence(state.presence);
        drawRitual();
      },
      onStatus: (status) => global.CovenChat.onStatus(status)
    });
    // Where you are in the coven, as the app says it (place "altar:<id>").
    live.track({ user_id: context.user.id, name: UI.nameOf(context, context.user.id), place: `altar:${altarId}` });
    global.addEventListener("pagehide", () => live?.close());
    await global.CovenChat.prime(state);
    // A rite under way here: its steps, and what's on this altar for its items.
    state.rituals = (await D.rituals(coven.id).catch(() => [])) || [];
    await reloadSteps();
    if (ritualNow()) {
      tab = "ritual";
      loadObjects();
      // Already here: opening the ritual on the coven's page later doesn't send you back (rituals.js).
      try {
        global.sessionStorage.setItem(`cv-taken-to-altar:${ritualNow().id}`, "1");
      } catch {
        /* nothing kept in this browser */
      }
    }
    drawRitual();
    // Sent here by a step's button on the coven's page ("…&do=petition&step=<id>"): open it now, once.
    const params = new URLSearchParams(global.location.search);
    if (params.get("do") && params.get("step")) {
      handlers.deed(params.get("do"), params.get("step"));
      params.delete("do");
      params.delete("step");
      global.history.replaceState(null, "", `${global.location.pathname}?${params}`);
    }
    return true;
  }

  global.CovenAltarChat = {
    start,
    open: (which) => pick(which === "ritual" ? "ritual" : "messages"),
    close: () => fold(),
    // "Under way here" at the top of the altar opens the Ritual tab.
    openRitual: () => ritualNow() && !(open && tab === "ritual") && pick("ritual"),
    state: () => ({ open, tab, unread, ready: Boolean(state) })
  };
})(window);
