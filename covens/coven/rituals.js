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
  let marksFor_ = null;
  // The coven's altars, for "Held at" (loaded once per visit to the tab).
  let altars = null;

  const params = () => new URLSearchParams(global.location.search);
  const ritualHref = (id, extra = "") => `${api.covenHref("rituals")}&ritual=${encodeURIComponent(id)}${extra}`;
  const editHref = (id) => `${api.covenHref("rituals")}&edit=${encodeURIComponent(id || "new")}`;
  const stepsOf = (ritual) => L.orderSteps(state.ritualSteps, ritual.id);
  const nameOf = (id) => UI.nameOf(state.context, id);
  const mine = (step) => L.stepIsMine(step, state.membership, state.context.user?.id);
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const me = () => state.context.user?.id;
  const marksFor = (step) => (state.stepMarks || []).filter((m) => m.step_id === step.id);

  // The site's moon and calendar logic is large, so it loads only for the planner.
  let todayLoading = null;
  function loadToday() {
    if (global.SaltCore?.today) return Promise.resolve(global.SaltCore.today);
    if (!todayLoading) {
      todayLoading = new Promise((resolve) => {
        const script = global.document.createElement("script");
        script.src = UI.href("/js/core/today.js");
        script.onload = () => resolve(global.SaltCore?.today || null);
        script.onerror = () => resolve(null);
        global.document.head.appendChild(script);
      });
    }
    return todayLoading;
  }

  // Who may tend the ritual's altar during each step (coven_ritual_steps.altar_access), as in the app.
  const ALTAR_ACCESS = [
    { value: "assigned", label: "Whoever’s step it is" },
    { value: "everyone", label: "Everyone" },
    { value: "leader", label: "Only the leader" }
  ];

  const ACTION_SHORT = { light_candle: "🕯 Lights a candle", place_item: "✦ Places on the altar", light_all: "🕯 Lights the altar", snuff_all: "Puts out the candles" };

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
        <span class="sp-row__detail">${L.occasionLabel(r) ? `${esc(L.occasionLabel(r))} · ` : ""}${esc(when(r))} · ${steps.length} step${steps.length === 1 ? "" : "s"}${yours ? ` · ${yours} ${yours === 1 ? "is" : "are"} yours` : ""}${r.status === "cancelled" ? " · cancelled" : ""}${rsvpWord(r)}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;
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

  function rsvpWord(ritual) {
    if (ritual.status !== "scheduled") return "";
    const sum = L.rsvpSummary(state.rsvps, ritual.id, me());
    const word = { going: " · you’re going", maybe: " · you might come", not_going: " · you can’t come" }[sum.mine] || " · will you come?";
    return `${sum.going.length ? ` · ${sum.going.length} going` : ""}${word}`;
  }

  // --- one ritual ----------------------------------------------------------

  function rsvpBlock(ritual) {
    if (!["scheduled", "live"].includes(ritual.status) || !state.perms.member) return "";
    const sum = L.rsvpSummary(state.rsvps, ritual.id, me());
    const names = (list) => list.map((r) => esc(nameOf(r.user_id))).join(", ");
    const choice = (value, label) => `<button type="button" class="sp-chip" data-rsvp="${value}" aria-pressed="${sum.mine === value}">${esc(label)}</button>`;
    return `<section class="sp-card" aria-label="Will you come?">
        <p class="sp-label">Will you come?</p>
        <div class="sp-chips">${choice("going", "I’ll be there")}${choice("maybe", "Maybe")}${choice("not_going", "Can’t make it")}</div>
        <p class="sp-caption">${sum.going.length ? `Going: ${names(sum.going)}.` : "No one has said they’re coming yet."}${sum.maybe.length ? ` Maybe: ${names(sum.maybe)}.` : ""}${sum.notGoing.length ? ` ${sum.notGoing.length} can’t make it.` : ""}</p>
        ${ritual.scheduled_for && ritual.status === "scheduled" ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-ics>Add to my calendar</button></div>
          <p class="sp-caption">Adds the rite, with a reminder an hour before, to your phone’s or computer’s calendar. The app reminds you too.</p>` : ""}
        ${statusLine()}
      </section>`;
  }

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
            <div class="cv-meta">${assigneeHtml(step)}${step.duration_minutes ? `<span class="cv-pill">${step.duration_minutes} min</span>` : ""}${step.altar_action ? `<span class="cv-pill">${esc(ACTION_SHORT[step.altar_action])}</span>` : ""}${current ? `<span class="cv-pill cv-pill--warn">Now</span>` : ""}${done ? `<span class="cv-pill">Done${step.completed_by ? ` · ${esc(nameOf(step.completed_by))}` : ""}</span>` : ""}</div></div></div>
        ${hasWords ? (yours || current ? words : `<details class="sp-details"><summary>Read along</summary>${words}</details>`) : ""}
        ${accessHtml(step, index, ritual)}
        <span class="sr-only">Step ${index + 1} of ${total}</span>
      </li>`;
  }

  /** For those who lead: who else may tend the altar while this step is under way. */
  function accessHtml(step, index, ritual) {
    if (!(state.perms.lead || state.perms.site) || ["done", "cancelled"].includes(ritual.status)) return "";
    const value = step.altar_access || "assigned";
    return `<div class="sp-field cv-access"><label for="acc-${esc(step.id)}">At the altar during step ${index + 1}</label>
        <select id="acc-${esc(step.id)}" data-access="${index}">${ALTAR_ACCESS.map((a) => `<option value="${a.value}"${a.value === value ? " selected" : ""}>${esc(a.label)}</option>`).join("")}</select></div>`;
  }

  /** The altar a ritual is held at: its own, or the coven's main ritual altar. */
  const altarOf = (ritual) => (altars || []).find((a) => a.id === ritual.altar_id) || (altars || []).find((a) => a.is_main) || null;

  function altarSection(ritual) {
    if (!altars) return `<section class="sp-section" aria-label="The altar" data-altar-section><p class="sp-caption">Finding the ritual’s altar…</p></section>`;
    const altar = altarOf(ritual);
    if (!altar) return "";
    const leader = state.perms.lead || state.perms.site;
    const choices = altars.filter((a) => !a.archived_at);
    const live = ritual.status === "live";
    return `<section class="sp-section" aria-label="The altar" data-altar-section>
        <p class="sp-label">The altar</p>
        <p>Held at ${esc(altar.name)}.</p>
        ${live ? `<div data-ritual-altar></div>` : `<div class="sp-actions"><a class="button button--ghost button--small" href="${esc(UI.href(`/altar/?covenAltar=${encodeURIComponent(altar.id)}&c=${encodeURIComponent(state.coven.slug)}`))}">Open the altar</a></div>`}
        ${leader && !live && choices.length > 1 ? `<div class="sp-field"><label for="held-at">Hold it at</label><select id="held-at" data-held-at>${choices.map((a) => `<option value="${esc(a.id)}"${a.id === altar.id ? " selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>` : ""}
        ${leader ? `<p class="sp-caption">Its leader and the altar’s keepers can always tend it. For each step below, choose who else can.</p>` : ""}
        ${statusLine()}
      </section>`;
  }

  async function loadAltars() {
    if (altars) return;
    try {
      const list = await D.altars(state.coven.id);
      altars = (list || []).sort((a, b) => Number(b.is_main) - Number(a.is_main));
    } catch {
      altars = [];
    }
    const id = params().get("ritual");
    if (pane && id && !editing) draw();
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
        ${altarActionHtml(step, yours)}
        <div class="sp-actions">
          ${canFinish ? `<button class="button button--primary" type="button" data-finish="${esc(step.id)}">${yours ? "I’ve finished this step" : "Finish this step"}${index === steps.length - 1 ? " and close the ritual" : ""}</button>` : ""}
          ${state.perms.lead || state.perms.site ? `${index > 0 ? `<button class="button button--ghost button--small" type="button" data-goto="${esc(steps[index - 1].id)}">Back a step</button>` : ""}
            <button class="button button--ghost button--small" type="button" data-end>End the ritual</button>` : ""}
        </div>
        ${yours && !state.standing.ok && !canFinish ? `<p class="sp-notice">${esc(state.standing.reasons.join(" "))} The ritual’s leader can move it on for you.</p>` : ""}
        ${statusLine()}
      </section>`;
  }

  /** The step's altar action, for whoever it belongs to (or the leader). */
  function altarActionHtml(step, yours) {
    if (!step.altar_action) return "";
    const marks = marksFor(step);
    const each = ["light_candle", "place_item"].includes(step.altar_action);
    const doneByMe = each && marks.some((m) => m.user_id === me());
    const canAct = (yours && state.standing.ok) || state.perms.lead || state.perms.site;
    const button = canAct && !doneByMe ? `<button class="button button--primary" type="button" data-altar-act="${esc(step.id)}">${esc(L.altarActionButton(step))}</button>` : "";
    const lit = each && marks.length ? `${marks.length} ${step.altar_action === "light_candle" ? (marks.length === 1 ? "candle lit" : "candles lit") : (marks.length === 1 ? "offering placed" : "offerings placed")}${doneByMe ? ", yours among them" : ""}.` : "";
    return `<div class="cv-altar-action"><p class="sp-caption">${esc(L.altarActionNote(step))} ${esc(lit)}</p>${button ? `<div class="sp-actions">${button}</div>` : ""}</div>`;
  }

  /** Who has done this ritual's altar actions (each lights their own candle on a whole-coven step). */
  async function loadMarks(ritual) {
    if (marksFor_ === ritual.id) return;
    marksFor_ = ritual.id;
    state.stepMarks = await D.stepMarks(ritual.id).catch(() => []);
    if (pane && params().get("ritual") === ritual.id) draw();
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
        <div class="cv-meta">${L.occasionLabel(ritual) ? `<span class="cv-pill cv-pill--gold">${esc(L.occasionLabel(ritual))}</span>` : ""}<span class="cv-pill${ritual.status === "live" ? " cv-pill--warn" : ""}">${esc(when(ritual))}</span>
          ${ritual.status === "cancelled" ? `<span class="cv-pill">Cancelled</span>` : ""}${ritual.status === "done" ? `<span class="cv-pill">Completed ${esc(L.relativeTime(ritual.ended_at))}</span>` : ""}
          ${ritual.led_by && ritual.status === "live" ? `<span class="cv-pill">Led by ${esc(nameOf(ritual.led_by))}</span>` : ""}</div>
        ${ritual.intention ? `<p class="gd-intro">${esc(ritual.intention)}</p>` : ""}
        ${ritual.description ? `<div class="cv-doc">${prose(ritual.description)}</div>` : ""}
        ${ritual.status !== "live" && yours.length ? `<p class="sp-notice">${yours.length === 1 ? "One step is yours" : `${yours.length} steps are yours`}: ${yours.map((s) => esc(s.title)).join(", ")}. When the ritual reaches ${yours.length === 1 ? "it" : "each one"}, it will show up here for you.</p>` : ""}
      </header>
      ${rsvpBlock(ritual)}
      ${ritual.status === "live" ? nowCard(ritual, steps) : ""}
      ${["cancelled", "done"].includes(ritual.status) ? "" : altarSection(ritual)}
      ${leader && ritual.status !== "live" ? `<div class="sp-actions">
          ${ritual.status !== "cancelled" ? `<button class="button button--primary" type="button" data-start ${steps.length ? "" : "disabled"}>${ritual.status === "done" ? "Perform it again" : "Begin the ritual"}</button>` : ""}
          <a class="button button--ghost" href="${esc(editHref(ritual.id))}" data-tab="rituals">Edit</a>
          ${ritual.status === "cancelled" ? (state.perms.schedule || state.perms.site ? `<button class="button button--ghost" type="button" data-status-to="scheduled">Put it back on the calendar</button>` : "") : `<button class="button button--ghost" type="button" data-status-to="cancelled">Cancel</button>`}
          ${ritual.status === "draft" && (state.perms.schedule || state.perms.site) && ritual.scheduled_for ? `<button class="button button--ghost" type="button" data-status-to="scheduled">Put it on the calendar</button>` : ""}
          <button class="button button--ghost" type="button" data-status-to="deleted">Delete</button>
        </div>${statusLine()}` : ""}
      <section class="sp-section"><h2>Steps</h2>
        ${steps.length ? `<ol class="cv-steps">${steps.map((s, i) => stepCard(s, i, steps.length, ritual)).join("")}</ol>` : `<p class="sp-empty">No steps yet.</p>`}
      </section>`;

    loadAltars();
    if (ritual.status === "live") {
      loadMarks(ritual);
      const holder = pane.querySelector("[data-ritual-altar]");
      const altar = altarOf(ritual);
      if (holder && altar) {
        holder.innerHTML = `<p class="sp-caption">Setting the altar…</p>`;
        global.CovenAltar?.preview?.(holder, altar.id, state);
      }
    }
    pane.querySelector("[data-held-at]")?.addEventListener("change", async (event) => {
      const select = event.currentTarget;
      const saved = await UI.busy(select, status(select), () => D.setRitualAltar(ritual.id, select.value, null));
      if (saved) {
        apply("ritual", { eventType: "UPDATE", new: saved });
        draw();
      }
    });
    pane.querySelectorAll("[data-access]").forEach((select) =>
      select.addEventListener("change", async () => {
        const at = Number(select.dataset.access);
        const access = steps.map((s, i) => (i === at ? select.value : s.altar_access || "assigned"));
        const ok = await UI.busy(select, status(pane.querySelector("[data-altar-section]") || select), () => D.setRitualAltar(ritual.id, ritual.altar_id || null, access).then(() => true), { done: "Saved." });
        if (ok) {
          state.ritualSteps = state.ritualSteps.map((s) => (s.ritual_id === ritual.id && steps[at]?.id === s.id ? { ...s, altar_access: select.value } : s));
        } else select.value = steps[at]?.altar_access || "assigned";
      })
    );
    const status = (button) => (button.closest("[data-now], .sp-card") || pane).querySelector("[data-status]");
    pane.querySelectorAll("[data-rsvp]").forEach((button) =>
      button.addEventListener("click", async () => {
        const current = L.rsvpSummary(state.rsvps, ritual.id, me()).mine;
        const next = current === button.dataset.rsvp ? null : button.dataset.rsvp;
        const saved = await UI.busy(button, status(button), () => D.rsvp(ritual.id, next).then((row) => row || true));
        if (!saved) return;
        state.rsvps = (state.rsvps || []).filter((r) => !(r.ritual_id === ritual.id && r.user_id === me()));
        if (saved !== true) state.rsvps.push(saved);
        draw();
      })
    );
    pane.querySelector("[data-ics]")?.addEventListener("click", () => {
      const file = L.riteCalendarFile(ritual, state.coven.name, `${global.location.origin}${ritualHref(ritual.id)}`);
      const link = global.document.createElement("a");
      link.href = URL.createObjectURL(new Blob([file], { type: "text/calendar" }));
      link.download = `${L.slugify(ritual.title) || "rite"}.ics`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    });
    pane.querySelector("[data-altar-act]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const step = steps.find((s) => s.id === button.dataset.altarAct);
      // As the app does (ritual/[id].tsx): mark the step, then set the change on the ritual's altar.
      const done = await UI.busy(button, status(button), async () => {
        const already = (state.stepMarks || []).filter((m) => m.ritual_id === ritual.id).length;
        await D.performStepAction(button.dataset.altarAct);
        const core = await UI.altarCore();
        const altar = altarOf(ritual);
        const name = state.context.profile?.display_name || "A member";
        const change = step && core.ritualAltar.stepAltarChange(step, ritual, name, already, new Date().toISOString());
        if (change && altar) await D.changeAltarOnce(altar.id, change);
        return true;
      });
      if (!done) return;
      marksFor_ = null;
      await loadMarks(ritual);
    });
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
    // Who can be given a part: members who have signed the coven's current agreements.
    const [candidates, templates, today] = await Promise.all([D.ritualPeople(state.coven.id).catch(() => []), D.myRitualTemplates(state.context.user?.id).catch(() => []), loadToday()]);
    const covenDays = global.SaltCore?.covens?.programs?.covenHolidaysBetween(state.coven, new Date(), new Date(Date.now() + 200 * 86400000)) || [];
    const suggestions = L.occasionSuggestions(today, new Date(), 6, covenDays);
    const canSchedule = state.perms.schedule || state.perms.site;
    const keepsSchedule = ritual?.status === "scheduled";
    await UI.loadNames(state.context, candidates.map((c) => c.user_id));
    if (!pane || !editing) return;
    const blank = () => ({ title: "", instructions: "", spoken_text: "", duration_minutes: null, assigned_user_id: null, assigned_rank_id: null, altar_action: "", altar_color: "white", altar_form: "votive", altar_image: "", altar_label: "" });
    let steps = ritual ? stepsOf(ritual).map((s) => ({ ...blank(), ...s, altar_action: s.altar_action || "", altar_color: s.altar_color || "white", altar_form: s.altar_form || "votive" })) : [blank()];
    const cabinet = Object.entries(global.AltarArtwork?.items || {}).map(([shelf, items]) => ({
      shelf,
      items: items.flatMap((item) => (item.forms || []).filter((f) => f.image).map((f) => ({ name: item.forms.filter((x) => x.image).length > 1 ? `${item.name} · ${f.label}` : item.name, image: L.sitePath(f.image) })))
    }));
    const altarFields = (s, i) => {
      const action = s.altar_action || "";
      const actionSelect = `<div class="sp-field"><label for="st-act-${i}">On the shared altar</label><select id="st-act-${i}" name="altar_action">${L.ALTAR_ACTIONS.map((a) => `<option value="${a.value}"${a.value === action ? " selected" : ""}>${esc(a.label)}</option>`).join("")}</select></div>`;
      if (action === "light_candle") {
        return `${actionSelect}<div class="sp-grid-2">
          <div class="sp-field"><label for="st-col-${i}">Candle colour</label><select id="st-col-${i}" name="altar_color">${L.CANDLE_COLORS.map((c) => `<option value="${c}"${c === s.altar_color ? " selected" : ""}>${esc(c[0].toUpperCase() + c.slice(1))}</option>`).join("")}</select></div>
          <div class="sp-field"><label for="st-form-${i}">Candle</label><select id="st-form-${i}" name="altar_form">${L.CANDLE_FORMS.map((f) => `<option value="${f.id}"${f.id === s.altar_form ? " selected" : ""}>${esc(f.label)}</option>`).join("")}</select></div></div>
          <p class="sp-caption">${s.assigned_user_id || s.assigned_rank_id ? "Whoever this step belongs to lights it when the step comes." : "Each member lights their own when the step comes, and the candles gather in a circle."}</p>`;
      }
      if (action === "place_item") {
        return `${actionSelect}<div class="sp-field"><label for="st-img-${i}">What is placed</label><select id="st-img-${i}" name="altar_image"><option value="">Choose…</option>${cabinet
          .map((c) => `<optgroup label="${esc(c.shelf[0].toUpperCase() + c.shelf.slice(1))}">${c.items.map((it) => `<option value="${esc(it.image)}" data-name="${esc(it.name)}"${it.image === s.altar_image ? " selected" : ""}>${esc(it.name)}</option>`).join("")}</optgroup>`)
          .join("")}</select></div>`;
      }
      return actionSelect;
    };
    const ranks = [...state.ranks].sort((a, b) => b.level - a.level);
    const people = candidates.map((c) => ({ id: c.user_id, name: nameOf(c.user_id), eligible: Boolean(c.eligible) })).sort((a, b) => a.name.localeCompare(b.name));

    const assignValue = (s) => (s.assigned_user_id ? `user:${s.assigned_user_id}` : s.assigned_rank_id ? `rank:${s.assigned_rank_id}` : "");
    const assignOptions = (s) => {
      const value = assignValue(s);
      const opt = (v, label, disabled) => `<option value="${esc(v)}"${v === value ? " selected" : ""}${disabled ? " disabled" : ""}>${esc(label)}</option>`;
      const gone = s.assigned_user_id && !people.some((p) => p.id === s.assigned_user_id) ? opt(`user:${s.assigned_user_id}`, `${nameOf(s.assigned_user_id)} (no longer a member)`, true) : "";
      return `${opt("", "The whole coven")}
        <optgroup label="Everyone in a position">${ranks.map((r) => opt(`rank:${r.id}`, `Every ${r.name}`)).join("")}</optgroup>
        <optgroup label="One person">${people.map((p) => opt(`user:${p.id}`, p.eligible ? p.name : `${p.name} (needs to re-sign)`, !p.eligible)).join("")}${gone}</optgroup>`;
    };
    const blockedPart = (s) => L.unassignablePart(s, people, nameOf);

    const stepHtml = (s, i) => `<li class="sp-card cv-step-edit" data-index="${i}">
        <div class="cv-inline-form"><p class="sp-label">Step ${i + 1}</p><span class="cv-grow"></span>
          <button class="button button--ghost button--small" type="button" data-move="-1" ${i === 0 ? "disabled" : ""} aria-label="Move step ${i + 1} up">↑</button>
          <button class="button button--ghost button--small" type="button" data-move="1" ${i === steps.length - 1 ? "disabled" : ""} aria-label="Move step ${i + 1} down">↓</button>
          <button class="button button--ghost button--small" type="button" data-remove aria-label="Remove step ${i + 1}">Remove</button></div>
        <div class="sp-field"><label for="st-title-${i}">What happens</label><input id="st-title-${i}" name="title" maxlength="120" required value="${esc(s.title)}" placeholder="Cast the circle" /></div>
        <div class="sp-grid-2">
          <div class="sp-field"><label for="st-who-${i}">Whose step</label><select id="st-who-${i}" name="assign"${blockedPart(s) ? ` aria-describedby="st-who-note-${i}"` : ""}>${assignOptions(s)}</select>
            ${blockedPart(s) ? `<p class="cv-status is-error" id="st-who-note-${i}">${esc(blockedPart(s))}</p>` : ""}</div>
          <div class="sp-field"><label for="st-min-${i}">Minutes (optional)</label><input id="st-min-${i}" name="duration_minutes" type="number" min="0" max="240" value="${esc(s.duration_minutes ?? "")}" /></div>
        </div>
        <div class="sp-field"><label for="st-ins-${i}">Instructions (shown to them when the step comes)</label><textarea id="st-ins-${i}" name="instructions" maxlength="4000">${esc(s.instructions || "")}</textarea></div>
        <div class="sp-field"><label for="st-say-${i}">Words to speak (optional)</label><textarea id="st-say-${i}" name="spoken_text" maxlength="4000">${esc(s.spoken_text || "")}</textarea></div>
        ${altarFields(s, i)}
      </li>`;

    pane.innerHTML = `<p><a class="sp-back" href="${esc(ritual ? ritualHref(ritual.id) : api.covenHref("rituals"))}" data-tab="rituals">← ${ritual ? "Back to the ritual" : "All rituals"}</a></p>
      <form class="sp-section" data-ritual-form>
        <h2>${ritual ? "Edit the ritual" : "Plan a ritual"}</h2>
        <div class="sp-card">
          <div class="sp-field"><label for="rt-title">Ritual</label><input id="rt-title" name="ritual_title" required maxlength="120" value="${esc(ritual?.title || "")}" placeholder="Full moon rite" /></div>
          <div class="sp-field"><label for="rt-intention">Intention (optional)</label><input id="rt-intention" name="ritual_intention" maxlength="500" value="${esc(ritual?.intention || "")}" /></div>
          <div class="sp-field"><label for="rt-description">What members should know or bring (optional)</label><textarea id="rt-description" name="ritual_description" maxlength="4000">${esc(ritual?.description || "")}</textarea></div>
          <div class="sp-grid-2">
            <div class="sp-field"><label for="rt-occasion">Occasion (optional)</label><select id="rt-occasion" name="occasion"><option value="">—</option>${L.OCCASIONS.map((o) => `<option value="${o.value}"${o.value === ritual?.occasion ? " selected" : ""}>${esc(o.label)}</option>`).join("")}</select></div>
            <div class="sp-field"><label for="rt-occasion-name">Its name (optional)</label><input id="rt-occasion-name" name="occasion_name" maxlength="80" value="${esc(ritual?.occasion_name || "")}" placeholder="Samhain, Hunter’s Moon…" /></div>
          </div>
          ${suggestions.length ? `<div class="sp-section"><p class="sp-label">Coming moons and ${covenDays.length ? "the coven’s holidays" : "sabbats"}</p><div class="sp-chips">${suggestions
            .map((sg, k) => `<button type="button" class="sp-chip" data-suggest="${k}">${esc(sg.label)} · ${esc(sg.date.toLocaleDateString(undefined, { month: "short", day: "numeric" }))}</button>`)
            .join("")}</div></div>` : ""}
          <div class="sp-grid-2">
            <div class="sp-field"><label for="rt-when">When (your time)</label><input id="rt-when" name="scheduled_for" type="datetime-local" value="${esc(L.toLocalInput(ritual?.scheduled_for))}" /></div>
            <div class="sp-field"><label for="rt-status">Show it</label><select id="rt-status" name="status">
              <option value="scheduled"${ritual?.status !== "draft" && (canSchedule || keepsSchedule) ? " selected" : ""}${canSchedule || keepsSchedule ? "" : " disabled"}>On the coven’s calendar</option>
              <option value="draft"${ritual?.status === "draft" || !(canSchedule || keepsSchedule) ? " selected" : ""}>Only to ritual leaders (draft)</option></select></div>
          </div>
          ${canSchedule ? "" : `<p class="sp-caption">${keepsSchedule ? "You can change this rite, but only those the coven’s head allows can move it on the calendar." : "Only those the coven’s head allows can put rites on the calendar. Save it as a draft and they can schedule it."}</p>`}
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
        s.altar_action = li.querySelector("[name=altar_action]").value;
        s.altar_color = li.querySelector("[name=altar_color]")?.value || s.altar_color;
        s.altar_form = li.querySelector("[name=altar_form]")?.value || s.altar_form;
        const image = li.querySelector("[name=altar_image]");
        if (image) {
          s.altar_image = image.value;
          s.altar_label = image.selectedOptions[0]?.dataset.name || "";
        }
      });
    };
    const drawSteps = () => (holder.innerHTML = steps.map(stepHtml).join(""));
    drawSteps();
    // Choosing someone else clears the warning.
    holder.addEventListener("change", (event) => {
      if (!["assign", "altar_action"].includes(event.target.name)) return;
      read();
      drawSteps();
      holder.querySelector(`#${CSS.escape(event.target.id)}`)?.focus();
    });

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
    form.querySelectorAll("[data-suggest]").forEach((chip) =>
      chip.addEventListener("click", () => {
        const sg = suggestions[Number(chip.dataset.suggest)];
        form.elements.occasion.value = sg.occasion;
        form.elements.occasion_name.value = sg.name;
        form.elements.scheduled_for.value = L.toLocalInput(L.suggestionTime(sg));
        if (!form.elements.ritual_title.value.trim()) form.elements.ritual_title.value = sg.occasion === "sabbat" ? `${sg.name} rite` : `${sg.label} esbat`;
      })
    );
    form.querySelector("[data-add-step]").addEventListener("click", () => {
      read();
      steps.push(blank());
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
      const added = L.stepsFromTemplate(copied).map((st) => ({ ...blank(), ...st }));
      steps = [...steps.filter((s) => String(s.title).trim()), ...added];
      drawSteps();
      UI.setStatus(form.querySelector("[data-status]"), `${added.length} step${added.length === 1 ? "" : "s"} copied. Choose whose each one is.`);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      read();
      const kept = steps.filter((s) => String(s.title).trim());
      const noItem = kept.findIndex((s) => s.altar_action === "place_item" && !s.altar_image);
      if (noItem >= 0) return UI.setStatus(form.querySelector("[data-status]"), `Step ${noItem + 1}: choose what is placed on the altar.`, true);
      const blocked = kept.findIndex((s) => blockedPart(s));
      if (blocked >= 0) {
        drawSteps();
        return UI.setStatus(form.querySelector("[data-status]"), `Step ${blocked + 1}: ${blockedPart(kept[blocked])}`, true);
      }
      const fields = {
        title: form.elements.ritual_title.value.trim(),
        intention: form.elements.ritual_intention.value.trim(),
        description: form.elements.ritual_description.value.trim(),
        scheduled_for: L.fromLocalInput(form.elements.scheduled_for.value),
        status: form.elements.status.value,
        occasion: form.elements.occasion.value,
        occasion_name: form.elements.occasion_name.value.trim()
      };
      const payload = kept.map((s) => ({ id: s.id || null, title: s.title.trim(), instructions: s.instructions || "", spoken_text: s.spoken_text || "", duration_minutes: s.duration_minutes, assigned_user_id: s.assigned_user_id, assigned_rank_id: s.assigned_rank_id,
        altar_action: s.altar_action || "", altar_color: s.altar_action === "light_candle" ? s.altar_color : "", altar_form: s.altar_action === "light_candle" ? s.altar_form : "",
        altar_image: s.altar_action === "place_item" ? s.altar_image : "", altar_label: s.altar_action === "place_item" ? s.altar_label : "" }));
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

  /** Live altar changes: refresh the still picture of the ritual's altar while it's under way (gathered, as several may tend at once). */
  let altarTimer = null;
  function onAltarChange(change) {
    const row = change?.new && Object.keys(change.new).length ? change.new : change?.old;
    if (!pane || !row) return;
    // A coven_altars row (renamed, cleared away): read the list again when it's next shown.
    if ("is_main" in row) altars = null;
    const ritual = state.rituals.find((r) => r.id === params().get("ritual"));
    const altar = ritual && ritual.status === "live" ? altarOf(ritual) : null;
    if (!altar || (row.altar_id || row.id) !== altar.id) return;
    global.clearTimeout(altarTimer);
    altarTimer = global.setTimeout(() => {
      const holder = pane?.querySelector("[data-ritual-altar]");
      if (holder) global.CovenAltar?.preview?.(holder, altar.id, state);
    }, 800);
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
    marksFor_ = null;
    altars = null;
    global.clearTimeout(altarTimer);
  }

  global.CovenRituals = { mount, unmount, onChange, onAltarChange };
})(window);
