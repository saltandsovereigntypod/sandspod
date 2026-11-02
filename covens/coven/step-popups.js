/*
 * How the step under way runs, on the website as in the app
 * (components/covens/LiveRitual.tsx FinishStep and StepPopups): the step's
 * five parts said plainly, Done for a step taken together, the items ticking
 * off as they go on the altar, and moving on, which is the step's ender's
 * alone (the ritual's leader unless the planner chose someone). The rules and
 * words are the app's own (SaltCore.covens.stepFlow liveFlow).
 *
 * The running pop-ups are small cards at the top of the screen that never
 * block it: the step as it begins (gone after eight seconds or a tap, and
 * kept in the step's card), "Your turn", and the step finished (the ender is
 * asked to move on; everyone else sees whom they wait for).
 *
 * Used by the coven's Rituals tab (covens/coven/rituals.js) and the Ritual
 * tab of the panel over a coven altar (covens/coven/chat-panel.js).
 */
(function (global) {
  "use strict";

  const doc = global.document;
  const esc = (s) => global.CovenUI.esc(s);
  const SF = () => global.SaltCore?.covens?.stepFlow || null;
  const B = () => global.SaltCore?.covens?.builder || null;

  /** The flow of the ritual's step under way, or null. `objects`: what's on its altar now, or null when unknown. */
  function flowOf(ritual, steps, state, objects) {
    const index = steps.findIndex((s) => s.id === ritual?.current_step_id);
    const step = steps[index];
    if (!step || !SF() || ritual.status !== "live") return null;
    const L = global.CovenLogic;
    const userId = state.context.user?.id || null;
    const leads = Boolean((state.perms.lead && state.standing.ok) || state.perms.site || ritual.led_by === userId);
    const plan = B() ? B().cleanPlan(ritual.plan, ritual.kind === "meeting" ? "meeting" : "rite") : { roles: [] };
    const nameOf = (id) => global.CovenUI.nameOf(state.context, id);
    const flow = SF().liveFlow({
      step,
      index,
      total: steps.length,
      roles: plan.roles,
      leaderId: ritual.led_by || null,
      leads,
      userId,
      membership: state.membership || null,
      presence: state.presence || [],
      objects: objects || null,
      nameOf,
      doerName: L ? L.stepAssignee(step, state.ranks || [], nameOf).label : "",
      now: Date.now()
    });
    const mine = L ? L.stepIsMine(step, state.membership, userId) : false;
    return { ...flow, step, index, mine };
  }

  /** In the step's card: the pop-up's words kept, the items ticked, Done, and moving on. */
  function cardHtml(flow) {
    if (!flow) return "";
    const tapsDone = !flow.progress.complete && (flow.kind === "together" || (flow.kind === "one" && flow.mine));
    const done = tapsDone
      ? flow.iDone
        ? `<p class="sp-caption">You’ve tapped Done. <button class="button button--ghost button--small" type="button" data-flow="undone">Not yet</button></p>`
        : `<button class="button ${flow.isEnder ? "button--ghost" : "button--primary"}" type="button" data-flow="done">Done</button>`
      : "";
    const move = flow.isEnder
      ? flow.progress.complete
        ? `<p>${esc(flow.complete.heading)}</p><button class="button button--primary" type="button" data-flow="move">${esc(flow.complete.button || "Move on")}</button>`
        : `<button class="button button--ghost button--small" type="button" data-flow="move">Move on anyway</button>`
      : `<p class="sp-caption">${esc(flow.progress.complete ? flow.complete.heading : `${flow.enderName} moves us on when this step is finished.`)}</p>`;
    return `<div class="cv-flow">${flow.start.lines.map((line) => `<p class="sp-caption">${esc(line)}</p>`).join("")}
      ${flow.items?.length ? `<p class="sp-caption">${flow.items.map((i) => `${i.placed ? "✓" : "○"} ${esc(i.name)}`).join("&nbsp;&nbsp; ")}</p>` : ""}
      <div class="sp-actions">${done}</div>
      ${flow.progress.waiting ? `<p class="sp-caption">${esc(flow.progress.waiting)}</p>` : ""}
      <div class="sp-actions">${move}</div></div>`;
  }

  /** Wire a card's Done / Not yet / move-on buttons. */
  function wire(root, flow, handlers) {
    root?.querySelectorAll("[data-flow]").forEach((button) =>
      button.addEventListener("click", () => {
        const how = button.dataset.flow;
        if (how === "done") handlers.done(flow.step.id);
        else if (how === "undone") handlers.done(null);
        else if (how === "move") handlers.move(flow.step.id, button);
      })
    );
  }

  // ── The pop-ups ──────────────────────────────────────────────────────
  let holder = null;
  let gone = null;
  let later = null;
  let timerFor = null;
  let timer = null;
  let handlers_ = null;
  let flow_ = null;

  function ensureHolder() {
    if (holder) return holder;
    holder = doc.createElement("div");
    holder.className = "cv-popups";
    holder.setAttribute("aria-live", "polite");
    holder.addEventListener("click", (event) => {
      const el = event.target.closest("[data-pop]");
      if (!el || !flow_) return;
      const how = el.dataset.pop;
      if (how === "start") gone = flow_.step.id;
      else if (how === "turn") return handlers_?.turn(flow_.step.id, el);
      else if (how === "move") return handlers_?.move(flow_.step.id, el);
      else if (how === "later") later = flow_.step.id;
      render(flow_, handlers_);
    });
    doc.body.append(holder);
    return holder;
  }

  /** Show (or clear, with a null flow) the pop-ups for the step under way. */
  function render(flow, handlers) {
    flow_ = flow;
    handlers_ = handlers;
    if (!flow) {
      if (holder) holder.innerHTML = "";
      return;
    }
    const el = ensureHolder();
    const id = flow.step.id;
    if (timerFor !== id) {
      timerFor = id;
      global.clearTimeout(timer);
      timer = global.setTimeout(() => {
        gone = id;
        if (flow_) render(flow_, handlers_);
      }, 8000);
    }
    const cards = [];
    if (gone !== id) {
      cards.push(`<button type="button" class="cv-popup" data-pop="start" aria-label="${esc(`${flow.start.heading}. ${flow.start.lines.join(" ")} Tap to close.`)}">
        <span class="sp-eyebrow">${esc(flow.start.heading)}</span>${flow.start.lines.map((line) => `<span class="sp-caption">${esc(line)}</span>`).join("")}</button>`);
    }
    if (flow.myTurn && !flow.progress.complete) {
      cards.push(`<div class="cv-popup is-gold"><strong>${esc(flow.turn.heading)}</strong><span class="sp-caption">${esc(flow.turn.body)}</span>
        <button class="button button--primary button--small" type="button" data-pop="turn">${esc(flow.turn.button)}</button></div>`);
    }
    if (flow.progress.complete && later !== id) {
      cards.push(`<div class="cv-popup${flow.isEnder ? " is-gold" : ""}"><span>${esc(flow.complete.heading)}</span>
        ${flow.isEnder && flow.complete.button ? `<button class="button button--primary button--small" type="button" data-pop="move">${esc(flow.complete.button)}</button>` : ""}
        <button class="button button--ghost button--small" type="button" data-pop="later">${flow.isEnder ? "Not yet" : "Close"}</button></div>`);
    }
    el.innerHTML = cards.join("");
  }

  function clear() {
    render(null, null);
  }

  global.CovenStepPopups = { flowOf, cardHtml, wire, render, clear };
})(window);
