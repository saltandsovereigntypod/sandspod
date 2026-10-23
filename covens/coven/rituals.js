/*
 * A coven's Rituals tab: rituals the coven performs together.
 *
 * Each step belongs to one member, to everyone in a position, or to the whole
 * coven. While a ritual is under way the current step is shared live; whoever
 * it belongs to sees its full instructions and the words to speak, and marks
 * it finished so the ritual moves on. Those who lead rituals (the founder,
 * positions that lead or moderate the coven, and positions given "leads
 * rituals") plan, start and steer them. The database checks all of it
 * (supabase/migrations/…_coven_rituals.sql).
 *
 * Views, by address: ?tab=rituals (the list), &ritual=<id> (one ritual,
 * live when under way) and &edit=<id|new> (the planner).
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;

  let pane = null;
  let state = null;
  let api = null;
  let editing = false;

  const params = () => new URLSearchParams(global.location.search);
  const ritualHref = (id, extra = "") => `${api.covenHref("rituals")}&ritual=${encodeURIComponent(id)}${extra}`;
  const editHref = (id) => `${api.covenHref("rituals")}&edit=${encodeURIComponent(id || "new")}`;
  const stepsOf = (ritual) => L.orderSteps(state.ritualSteps, ritual.id);
  const nameOf = (id) => UI.nameOf(state.context, id);
  const mine = (step) => L.stepIsMine(step, state.membership, state.context.user?.id);
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;

  function when(ritual) {
    if (ritual.status === "live") return "Under way now";
    if (!ritual.scheduled_for) return ritual.status === "draft" ? "Draft" : "No time set";
    return new Date(ritual.scheduled_for).toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  function assigneeHtml(step) {
    const who = L.stepAssignee(step, state.ranks, nameOf);
    return `<span class="cv-pill${mine(step) ? " cv-pill--gold" : ""}">${esc(mine(step) ? `${who.label} · yours` : who.label)}</span>`;
  }

  // --- the list ------------------------------------------------------------

  function list() {
    const groups = L.ritualGroups(state.rituals);
    const row = (r) => {
      const steps = stepsOf(r);
      const yours = steps.filter(mine).length;
      return `<a class="sp-row" href="${esc(ritualHref(r.id))}" data-tab="rituals"><span class="sp-row__text"><span class="sp-row__title">${esc(r.title)}</span>
        <span class="sp-row__detail">${esc(when(r))} · ${steps.length} step${steps.length === 1 ? "" : "s"}${yours ? ` · ${yours} ${yours === 1 ? "is" : "are"} yours` : ""}${r.status === "cancelled" ? " · cancelled" : ""}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;
    };
    const section = (title, rows) => (rows.length ? `<section class="sp-section"><h2>${esc(title)}</h2><nav class="sp-list" aria-label="${esc(title)}">${rows.map(row).join("")}</nav></section>` : "");
    const liveCards = groups.live
      .map((r) => {
        const current = stepsOf(r).find((s) => s.id === r.current_step_id);
        return `<a class="cv-card-link" href="${esc(ritualHref(r.id))}" data-tab="rituals"><article class="sp-card sp-card--gold">
          <p class="sp-eyebrow">Under way now</p><h2>${esc(r.title)}</h2>
          ${current ? `<p>Now: <strong>${esc(current.title)}</strong> · ${esc(L.stepAssignee(current, state.ranks, nameOf).label)}${mine(current) ? " · <strong>your turn</strong>" : ""}</p>` : ""}
          <span class="button button--primary button--small">Join the ritual</span></article></a>`;
      })
      .join("");
    pane.innerHTML = `<div class="sp-actions">${state.perms.lead || state.perms.site ? `<a class="button button--primary" href="${esc(editHref("new"))}" data-tab="rituals">✦ Plan a ritual</a>` : ""}</div>
      ${liveCards}
      ${section("Coming up", groups.upcoming)}
      ${state.perms.lead || state.perms.site ? section("Drafts", groups.drafts) : ""}
      ${section("Past rituals", groups.past)}
      ${state.rituals.length ? "" : `<p class="sp-empty">The coven hasn’t planned a ritual yet.${state.perms.lead ? " Plan the first one, and give each step to the people who will lead it." : ""}</p>`}`;
  }

  // --- one ritual ----------------------------------------------------------

  function stepCard(step, index, total, ritual) {
    const yours = mine(step);
    const current = ritual.status === "live" && ritual.current_step_id === step.id;
    const done = Boolean(step.completed_at) && !current;
    const words = `${step.instructions ? `<div class="cv-doc">${prose(step.instructions)}</div>` : ""}
      ${step.spoken_text ? `<blockquote class="cv-doc cv-spoken">${prose(step.spoken_text)}</blockquote>` : ""}`;
    const hasWords = Boolean(step.instructions || step.spoken_text);
    return `<li class="cv-step${current ? " is-current" : ""}${done ? " is-done" : ""}${yours ? " is-mine" : ""}" data-step="${esc(step.id)}">
        <div class="cv-step__head"><span class="cv-step__n" aria-hidden="true">${done ? "✓" : index + 1}</span>
          <div class="cv-step__title"><h3>${esc(step.title)}</h3>
            <div class="cv-meta">${assigneeHtml(step)}${step.duration_minutes ? `<span class="cv-pill">${step.duration_minutes} min</span>` : ""}${current ? `<span class="cv-pill cv-pill--warn">Now</span>` : ""}${done ? `<span class="cv-pill">Done${step.completed_by ? ` · ${esc(nameOf(step.completed_by))}` : ""}</span>` : ""}</div></div></div>
        ${hasWords ? (yours || current ? words : `<details class="sp-details"><summary>Read along</summary>${words}</details>`) : ""}
        <span class="sr-only">Step ${index + 1} of ${total}</span>
      </li>`;
  }

  function nowCard(ritual, steps) {
    const index = steps.findIndex((s) => s.id === ritual.current_step_id);
    const step = steps[index];
    if (!step) return "";
    const yours = mine(step);
    const who = L.stepAssignee(step, state.ranks, nameOf);
    const canFinish = (yours && state.standing.ok) || state.perms.lead || state.perms.site;
    return `<section class="sp-card ${yours ? "sp-card--gold cv-your-turn" : ""}" aria-live="polite" data-now>
        <p class="sp-eyebrow">Step ${index + 1} of ${steps.length}${yours ? " · your turn" : ""}</p>
        <h2>${esc(step.title)}</h2>
        <p class="sp-caption">${yours ? (who.kind === "person" ? "This step is yours." : `This step is for ${esc(who.label.toLowerCase())}${who.kind === "everyone" ? "" : ", and you are one"}.`) : `${esc(who.label)} leads this step.`}${step.duration_minutes ? ` About ${step.duration_minutes} minutes.` : ""}</p>
        ${step.instructions ? `<div class="cv-doc">${prose(step.instructions)}</div>` : ""}
        ${step.spoken_text ? `<p class="sp-label">Words to speak</p><blockquote class="cv-doc cv-spoken">${prose(step.spoken_text)}</blockquote>` : ""}
        <div class="sp-actions">
          ${canFinish ? `<button class="button button--primary" type="button" data-finish="${esc(step.id)}">${yours ? "I’ve finished this step" : "Finish this step"}${index === steps.length - 1 ? " and close the ritual" : ""}</button>` : ""}
          ${state.perms.lead || state.perms.site ? `${index > 0 ? `<button class="button button--ghost button--small" type="button" data-goto="${esc(steps[index - 1].id)}">Back a step</button>` : ""}
            <button class="button button--ghost button--small" type="button" data-end>End the ritual</button>` : ""}
        </div>
        ${yours && !state.standing.ok && !canFinish ? `<p class="sp-notice">${esc(state.standing.reasons.join(" "))} The ritual’s leader can move it on for you.</p>` : ""}
        ${statusLine()}
      </section>`;
  }

  function detail(id) {
    const ritual = state.rituals.find((r) => r.id === id);
    if (!ritual) {
      pane.innerHTML = `<p class="sp-notice">That ritual isn’t here any more.</p><p><a class="sp-back" href="${esc(api.covenHref("rituals"))}" data-tab="rituals">← All rituals</a></p>`;
      return;
    }
    const steps = stepsOf(ritual);
    const leader = state.perms.lead || state.perms.site;
    const yours = steps.filter(mine);
    pane.innerHTML = `<p><a class="sp-back" href="${esc(api.covenHref("rituals"))}" data-tab="rituals">← All rituals</a></p>
      <header class="sp-section">
        <h2>${esc(ritual.title)}</h2>
        <div class="cv-meta"><span class="cv-pill${ritual.status === "live" ? " cv-pill--warn" : ""}">${esc(when(ritual))}</span>
          ${ritual.status === "cancelled" ? `<span class="cv-pill">Cancelled</span>` : ""}${ritual.status === "done" ? `<span class="cv-pill">Completed ${esc(L.relativeTime(ritual.ended_at))}</span>` : ""}
          ${ritual.led_by && ritual.status === "live" ? `<span class="cv-pill">Led by ${esc(nameOf(ritual.led_by))}</span>` : ""}</div>
        ${ritual.intention ? `<p class="gd-intro">${esc(ritual.intention)}</p>` : ""}
        ${ritual.description ? `<div class="cv-doc">${prose(ritual.description)}</div>` : ""}
        ${ritual.status !== "live" && yours.length ? `<p class="sp-notice">${yours.length === 1 ? "One step is yours" : `${yours.length} steps are yours`}: ${yours.map((s) => esc(s.title)).join(", ")}. When the ritual reaches ${yours.length === 1 ? "it" : "each one"}, it will show up here for you.</p>` : ""}
      </header>
      ${ritual.status === "live" ? nowCard(ritual, steps) : ""}
      ${leader && ritual.status !== "live" ? `<div class="sp-actions">
          ${ritual.status !== "cancelled" ? `<button class="button button--primary" type="button" data-start ${steps.length ? "" : "disabled"}>${ritual.status === "done" ? "Perform it again" : "Begin the ritual"}</button>` : ""}
          <a class="button button--ghost" href="${esc(editHref(ritual.id))}" data-tab="rituals">Edit</a>
          ${ritual.status === "cancelled" ? `<button class="button button--ghost" type="button" data-status-to="scheduled">Restore</button>` : `<button class="button button--ghost" type="button" data-status-to="cancelled">Cancel</button>`}
          <button class="button button--ghost" type="button" data-status-to="deleted">Delete</button>
        </div>${statusLine()}` : ""}
      <section class="sp-section"><h2>Steps</h2>
        ${steps.length ? `<ol class="cv-steps">${steps.map((s, i) => stepCard(s, i, steps.length, ritual)).join("")}</ol>` : `<p class="sp-empty">No steps yet.</p>`}
      </section>`;

    const status = (button) => (button.closest("[data-now]") || pane).querySelector("[data-status]");
    const act = async (button, work) => {
      const saved = await UI.busy(button, status(button), work);
      if (saved) apply("ritual", { eventType: "UPDATE", new: saved });
      await reloadSteps(ritual.id);
      draw();
    };
    pane.querySelector("[data-finish]")?.addEventListener("click", (event) => act(event.currentTarget, () => D.finishStep(event.currentTarget.dataset.finish)));
    pane.querySelector("[data-goto]")?.addEventListener("click", (event) => act(event.currentTarget, () => D.goToStep(ritual.id, event.currentTarget.dataset.goto)));
    pane.querySelector("[data-end]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      if (await UI.confirmAction("End the ritual now?", "Steps not yet reached are left undone.", "End it")) act(button, () => D.goToStep(ritual.id, null));
    });
    pane.querySelector("[data-start]")?.addEventListener("click", (event) => act(event.currentTarget, () => D.startRitual(ritual.id)));
    pane.querySelectorAll("[data-status-to]").forEach((button) =>
      button.addEventListener("click", async () => {
        const to = button.dataset.statusTo;
        if (to === "deleted" && !(await UI.confirmAction("Delete this ritual?", "Its steps go with it.", "Delete"))) return;
        const saved = await UI.busy(button, status(button), () => D.setRitualStatus(ritual.id, to));
        if (!saved) return;
        if (to === "deleted") {
          state.rituals = state.rituals.filter((r) => r.id !== ritual.id);
          state.ritualSteps = state.ritualSteps.filter((s) => s.ritual_id !== ritual.id);
          navigate(api.covenHref("rituals"));
        } else {
          apply("ritual", { eventType: "UPDATE", new: saved });
          draw();
        }
      })
    );
  }

  // --- the planner ---------------------------------------------------------

  async function editor(id) {
    editing = true;
    const ritual = id === "new" ? null : state.rituals.find((r) => r.id === id);
    if (id !== "new" && !ritual) return detail(id);
    if (!(state.perms.lead || state.perms.site)) return detail(id);
    pane.innerHTML = `<p class="sp-caption">Opening the planner…</p>`;
    const [members, templates] = await Promise.all([D.members(state.coven.id).catch(() => []), D.myRitualTemplates(state.context.user?.id).catch(() => [])]);
    const active = members.filter((m) => m.status === "active");
    await UI.loadNames(state.context, active.map((m) => m.user_id));
    if (!pane || !editing) return;
    let steps = ritual ? stepsOf(ritual).map((s) => ({ ...s })) : [{ title: "", instructions: "", spoken_text: "", duration_minutes: null, assigned_user_id: null, assigned_rank_id: null }];
    const ranks = [...state.ranks].sort((a, b) => b.level - a.level);
    const people = active.map((m) => ({ id: m.user_id, name: nameOf(m.user_id) })).sort((a, b) => a.name.localeCompare(b.name));

    const assignValue = (s) => (s.assigned_user_id ? `user:${s.assigned_user_id}` : s.assigned_rank_id ? `rank:${s.assigned_rank_id}` : "");
    const assignOptions = (s) => {
      const value = assignValue(s);
      const opt = (v, label) => `<option value="${esc(v)}"${v === value ? " selected" : ""}>${esc(label)}</option>`;
      const gone = s.assigned_user_id && !people.some((p) => p.id === s.assigned_user_id) ? opt(`user:${s.assigned_user_id}`, `${nameOf(s.assigned_user_id)} (no longer a member)`) : "";
      return `${opt("", "The whole coven")}
        <optgroup label="Everyone in a position">${ranks.map((r) => opt(`rank:${r.id}`, `Every ${r.name}`)).join("")}</optgroup>
        <optgroup label="One person">${people.map((p) => opt(`user:${p.id}`, p.name)).join("")}${gone}</optgroup>`;
    };

    const stepHtml = (s, i) => `<li class="sp-card cv-step-edit" data-index="${i}">
        <div class="cv-inline-form"><p class="sp-label">Step ${i + 1}</p><span class="cv-grow"></span>
          <button class="button button--ghost button--small" type="button" data-move="-1" ${i === 0 ? "disabled" : ""} aria-label="Move step ${i + 1} up">↑</button>
          <button class="button button--ghost button--small" type="button" data-move="1" ${i === steps.length - 1 ? "disabled" : ""} aria-label="Move step ${i + 1} down">↓</button>
          <button class="button button--ghost button--small" type="button" data-remove aria-label="Remove step ${i + 1}">Remove</button></div>
        <div class="sp-field"><label for="st-title-${i}">What happens</label><input id="st-title-${i}" name="title" maxlength="120" required value="${esc(s.title)}" placeholder="Cast the circle" /></div>
        <div class="sp-grid-2">
          <div class="sp-field"><label for="st-who-${i}">Whose step</label><select id="st-who-${i}" name="assign">${assignOptions(s)}</select></div>
          <div class="sp-field"><label for="st-min-${i}">Minutes (optional)</label><input id="st-min-${i}" name="duration_minutes" type="number" min="0" max="240" value="${esc(s.duration_minutes ?? "")}" /></div>
        </div>
        <div class="sp-field"><label for="st-ins-${i}">Instructions (shown to them when the step comes)</label><textarea id="st-ins-${i}" name="instructions" maxlength="4000">${esc(s.instructions || "")}</textarea></div>
        <div class="sp-field"><label for="st-say-${i}">Words to speak (optional)</label><textarea id="st-say-${i}" name="spoken_text" maxlength="4000">${esc(s.spoken_text || "")}</textarea></div>
      </li>`;

    pane.innerHTML = `<p><a class="sp-back" href="${esc(ritual ? ritualHref(ritual.id) : api.covenHref("rituals"))}" data-tab="rituals">← ${ritual ? "Back to the ritual" : "All rituals"}</a></p>
      <form class="sp-section" data-ritual-form>
        <h2>${ritual ? "Edit the ritual" : "Plan a ritual"}</h2>
        <div class="sp-card">
          <div class="sp-field"><label for="rt-title">Ritual</label><input id="rt-title" name="ritual_title" required maxlength="120" value="${esc(ritual?.title || "")}" placeholder="Full moon rite" /></div>
          <div class="sp-field"><label for="rt-intention">Intention (optional)</label><input id="rt-intention" name="ritual_intention" maxlength="500" value="${esc(ritual?.intention || "")}" /></div>
          <div class="sp-field"><label for="rt-description">What members should know or bring (optional)</label><textarea id="rt-description" name="ritual_description" maxlength="4000">${esc(ritual?.description || "")}</textarea></div>
          <div class="sp-grid-2">
            <div class="sp-field"><label for="rt-when">When (your time)</label><input id="rt-when" name="scheduled_for" type="datetime-local" value="${esc(L.toLocalInput(ritual?.scheduled_for))}" /></div>
            <div class="sp-field"><label for="rt-status">Show it</label><select id="rt-status" name="status"><option value="scheduled"${ritual?.status !== "draft" ? " selected" : ""}>To the coven</option><option value="draft"${ritual?.status === "draft" ? " selected" : ""}>Only to ritual leaders (draft)</option></select></div>
          </div>
          ${templates.length ? `<div class="cv-inline-form"><div class="sp-field"><label for="rt-template">Start from one of your rituals</label><select id="rt-template"><option value="">Choose…</option>${templates.map((t) => `<option value="${esc(t.id)}">${esc(t.title)}</option>`).join("")}</select></div>
            <button class="button button--ghost button--small" type="button" data-use-template>Copy its steps</button></div>` : ""}
        </div>
        <ol class="cv-steps-edit" data-steps></ol>
        <div class="sp-actions"><button class="button button--ghost" type="button" data-add-step>Add a step</button></div>
        <div class="sp-actions"><button class="button button--primary" type="submit">${ritual ? "Save the ritual" : "Plan the ritual"}</button></div>
        ${statusLine()}
      </form>`;

    const form = pane.querySelector("[data-ritual-form]");
    const holder = form.querySelector("[data-steps]");
    const read = () => {
      holder.querySelectorAll("[data-index]").forEach((li) => {
        const s = steps[Number(li.dataset.index)];
        s.title = li.querySelector("[name=title]").value;
        s.instructions = li.querySelector("[name=instructions]").value;
        s.spoken_text = li.querySelector("[name=spoken_text]").value;
        const minutes = li.querySelector("[name=duration_minutes]").value;
        s.duration_minutes = minutes === "" ? null : Number(minutes);
        const [kind, value] = li.querySelector("[name=assign]").value.split(":");
        s.assigned_user_id = kind === "user" ? value : null;
        s.assigned_rank_id = kind === "rank" ? value : null;
      });
    };
    const drawSteps = () => (holder.innerHTML = steps.map(stepHtml).join(""));
    drawSteps();

    holder.addEventListener("click", (event) => {
      const li = event.target.closest("[data-index]");
      if (!li) return;
      const i = Number(li.dataset.index);
      const move = event.target.closest("[data-move]");
      if (move) {
        read();
        const j = i + Number(move.dataset.move);
        [steps[i], steps[j]] = [steps[j], steps[i]];
        drawSteps();
        holder.querySelector(`[data-index="${j}"] [data-move="${move.dataset.move}"]`)?.focus();
      }
      if (event.target.closest("[data-remove]")) {
        read();
        steps.splice(i, 1);
        drawSteps();
      }
    });
    form.querySelector("[data-add-step]").addEventListener("click", () => {
      read();
      steps.push({ title: "", instructions: "", spoken_text: "", duration_minutes: null, assigned_user_id: null, assigned_rank_id: null });
      drawSteps();
      holder.querySelector(`[data-index="${steps.length - 1}"] input`)?.focus();
    });
    form.querySelector("[data-use-template]")?.addEventListener("click", async (event) => {
      const templateId = form.querySelector("#rt-template").value;
      if (!templateId) return;
      const copied = await UI.busy(event.currentTarget, form.querySelector("[data-status]"), () => D.templateSteps(templateId));
      if (!copied) return;
      read();
      const template = templates.find((t) => t.id === templateId);
      if (!form.elements.ritual_title.value.trim() && template) form.elements.ritual_title.value = template.title;
      if (!form.elements.ritual_intention.value.trim() && template?.intention) form.elements.ritual_intention.value = template.intention;
      const added = L.stepsFromTemplate(copied);
      steps = [...steps.filter((s) => String(s.title).trim()), ...added];
      drawSteps();
      UI.setStatus(form.querySelector("[data-status]"), `${added.length} step${added.length === 1 ? "" : "s"} copied. Choose whose each one is.`);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      read();
      const kept = steps.filter((s) => String(s.title).trim());
      const fields = {
        title: form.elements.ritual_title.value.trim(),
        intention: form.elements.ritual_intention.value.trim(),
        description: form.elements.ritual_description.value.trim(),
        scheduled_for: L.fromLocalInput(form.elements.scheduled_for.value),
        status: form.elements.status.value
      };
      const payload = kept.map((s) => ({ id: s.id || null, title: s.title.trim(), instructions: s.instructions || "", spoken_text: s.spoken_text || "", duration_minutes: s.duration_minutes, assigned_user_id: s.assigned_user_id, assigned_rank_id: s.assigned_rank_id }));
      const saved = await UI.busy(form, form.querySelector("[data-status]"), () => D.saveRitual(state.coven.id, ritual?.id, fields, payload));
      if (!saved) return;
      apply("ritual", { eventType: ritual ? "UPDATE" : "INSERT", new: saved });
      await reloadSteps(saved.id);
      editing = false;
      navigate(ritualHref(saved.id));
    });
  }

  // --- drawing and live changes ---------------------------------------------

  function navigate(href) {
    global.history.pushState(null, "", href);
    draw();
    global.scrollTo(0, 0);
  }

  async function reloadSteps(ritualId) {
    const fresh = await D.ritualSteps([ritualId]).catch(() => null);
    if (!fresh) return;
    state.ritualSteps = [...state.ritualSteps.filter((s) => s.ritual_id !== ritualId), ...fresh];
  }

  function apply(kind, change) {
    if (kind === "ritual") state.rituals = L.applyChange(state.rituals, change);
    else state.ritualSteps = L.applyChange(state.ritualSteps, change);
  }

  function draw() {
    if (!pane) return;
    const p = params();
    if (p.get("edit")) return editor(p.get("edit"));
    editing = false;
    if (p.get("ritual")) return detail(p.get("ritual"));
    return list();
  }

  /** coven.js passes every live ritual change here (it keeps state.rituals current). */
  function onChange() {
    if (!pane || editing) return;
    // Keep the reader's place while the ritual moves on.
    const y = global.scrollY;
    draw();
    global.scrollTo(0, y);
    pane.querySelector(".cv-your-turn")?.scrollIntoView?.({ block: "nearest" });
  }

  function mount(el, s, a) {
    pane = el;
    state = s;
    api = a;
    draw();
  }

  function unmount() {
    pane = null;
    editing = false;
  }

  global.CovenRituals = { mount, unmount, onChange };
})(window);
