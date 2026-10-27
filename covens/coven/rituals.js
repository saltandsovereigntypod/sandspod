/*
 * A coven's Rituals tab: rituals the coven performs together.
 *
 * Each step is for any mix of the whole coven, positions and people (chosen
 * with the search picker, covens/coven/picker.js), is made from an action
 * (the app's lib/covens/stepActions.ts, through js/core/covens.js), and can
 * use the altar's things and ask something of people: written, placed or
 * done, ahead of time or during the step (lib/covens/contributions.ts). While
 * a ritual is under way the current step is shared live; whoever it is for
 * sees its directions and the words to speak, does their part, and marks it
 * finished so the ritual moves on. Those who lead rituals (the founder,
 * positions that lead or moderate the coven, and positions given "leads
 * rituals") plan, start and steer them. The database checks all of it
 * (supabase/migrations/…_coven_rituals.sql and …_coven_ritual_contributions.sql),
 * and the app's ritual screens (app/src/app/(tabs)/coven/c/[slug]/ritual/)
 * save the same shapes.
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
  // The app's own planning logic (js/core/covens.js): the picker, the actions, and what steps ask.
  const P = () => global.SaltCore?.covens?.picker;
  const A = () => global.SaltCore?.covens?.stepActions;
  const C = () => global.SaltCore?.covens?.contributions;
  const askOf = (step) => (C() ? C().cleanContribution(step?.contribution) : null);
  const leaderNow = () => Boolean((state.perms.lead && state.standing.ok) || state.perms.site);
  const reader = () => ({ userId: me(), member: Boolean(state.perms.member || state.perms.site), leads: leaderNow() });
  const WRITTEN = ["petition", "intention", "gratitude", "vow", "ancestor", "question", "reflection"];
  const STATUS_WORDS = { written: "Written", offered: "Offered", burned: "Burned", buried: "Buried", released: "Released", held: "Held by the coven", answered: "Answered", closed: "Closed" };
  // What people brought to this ritual's steps, and who has (for those allowed), loaded once per ritual and step.
  let contribKey_ = null;
  // Steps whose contribution is being written or changed, and the items chosen for it.
  const contribEditing = new Set();
  const contribItems = {};

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

  const ACTION_SHORT = { light_candle: "🕯 Lights a candle", place_item: "✦ Places on the altar", light_all: "🕯 Lights the altar", snuff_all: "Puts out the candles", release_papers: "Releases the papers" };

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
        ${step.items?.length ? `<p class="sp-caption">Items: ${esc(L.stepItemsLabel(step))}</p>` : ""}
        ${askOf(step) && !current ? `${participationHtml(step)}${contributionList(contributionsOf(step).filter((c) => ritual.status === "done" || c.mine || c.status !== "written"))}` : ""}
        ${accessHtml(step, index, ritual)}
        <span class="sr-only">Step ${index + 1} of ${total}</span>
      </li>`;
  }

  /** For those who lead: who else may tend the altar while this step is under way. */
  function accessHtml(step, index, ritual) {
    if (!(state.perms.lead || state.perms.site) || ["done", "cancelled"].includes(ritual.status)) return "";
    const value = step.altar_access || "assigned";
    const options = step.altar_tenders?.length ? [...ALTAR_ACCESS, { value: "chosen", label: "Chosen people" }] : ALTAR_ACCESS;
    return `<div class="sp-field cv-access"><label for="acc-${esc(step.id)}">At the altar during step ${index + 1}</label>
        <select id="acc-${esc(step.id)}" data-access="${index}">${options.map((a) => `<option value="${a.value}"${a.value === value ? " selected" : ""}>${esc(a.label)}</option>`).join("")}</select></div>`;
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
        ${step.items?.length ? `<p class="sp-caption">Items: ${esc(L.stepItemsLabel(step))}</p>` : ""}
        ${altarActionHtml(step, yours)}
        ${nowAskHtml(step, yours)}
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

  // --- what steps ask of people -------------------------------------------------

  const contributionsOf = (step) => (state.contributions || []).filter((c) => c.step_id === step.id && !c.mine);
  const mineFor = (step) => (state.contributions || []).find((c) => c.step_id === step.id && c.mine);
  const rowFor = (step) => (state.participation || []).find((r) => r.step_id === step.id);
  const oneDone = (step) => (rowFor(step)?.done || 0) > 0 || (state.contributions || []).some((c) => c.step_id === step.id);

  /** Whether this person can write a step's asking now: theirs, or the coven's one that no one has done yet (the leader may step in). */
  function canContribute(step, ask, yours) {
    if (!ask || !state.standing.ok) return false;
    if (!(yours || (ask.mode === "one" && leaderNow()))) return false;
    return ask.mode === "each" || Boolean(mineFor(step)) || !oneDone(step);
  }

  /** Your own part in a step that asks something, as the app's components/covens/Contributions.tsx MyContribution. */
  function contributionBox(step, ask, { canOffer }) {
    const mine = mineFor(step);
    const kind = (C().CONTRIBUTION_KINDS || []).find((k) => k.id === ask.kind) || { verb: "write", noun: "words" };
    const task = C().contributionTask({ kind: ask.kind, mode: ask.mode });
    const id = esc(step.id);
    if (mine && mine.status !== "written") {
      return `<div class="cv-contrib"><p class="sp-label">${esc(task)}</p>
        <p class="sp-caption">${esc(STATUS_WORDS[mine.status] || "")}${mine.private ? " · private" : ""}${mine.support_count ? ` · ${mine.support_count} holding it` : ""}</p>
        ${mine.body ? `<div class="cv-doc">${prose(mine.body)}</div>` : ""}</div>`;
    }
    const editing = !mine || contribEditing.has(step.id);
    const head = `<p class="sp-label">${esc(task)}</p>${ask.prompt ? `<p>${esc(ask.prompt)}</p>` : ""}<p class="sp-caption">${esc(C().contributionNote(ask))}</p>`;
    if (!editing) {
      return `<div class="cv-contrib">${head}
        ${mine.body ? `<div class="cv-doc">${prose(mine.body)}</div>` : ""}
        ${(mine.items || []).length ? `<p class="sp-caption">${esc(mine.items.map((i) => i.name).join(", "))}</p>` : ""}
        <p class="sp-caption">${mine.private ? "Private. " : ""}${mine.anonymous ? "Without your name. " : ""}${canOffer ? "Offer it now, or it is offered when the step ends." : "It is offered when its step comes."}</p>
        <div class="sp-actions">${canOffer ? `<button class="button button--primary button--small" type="button" data-offer="${esc(mine.id)}">Offer it</button>` : ""}
          <button class="button button--ghost button--small" type="button" data-contrib-edit="${id}">Change it</button>
          <button class="button button--ghost button--small" type="button" data-contrib-remove="${esc(mine.id)}">Take it back</button></div></div>`;
    }
    if (!contribItems[step.id]) contribItems[step.id] = [...(mine?.items || [])];
    return `<form class="cv-contrib" data-contrib-form="${id}">${head}
        ${kind.verb === "place" ? `<div data-contrib-items="${id}"></div>` : ""}
        <div class="sp-field"><label for="cb-${id}">${esc(kind.verb === "write" ? `Your ${kind.noun}` : "A note (optional)")}</label>
          ${kind.verb === "write" ? `<textarea id="cb-${id}" name="body" maxlength="2000">${esc(mine?.body || "")}</textarea>` : `<input id="cb-${id}" name="body" maxlength="2000" value="${esc(mine?.body || "")}"${kind.id === "card" ? ` placeholder="The card you drew"` : ""} />`}</div>
        ${kind.verb === "write" ? `<label class="cv-check"><input type="checkbox" name="private"${mine?.private ? " checked" : ""} /><span>Keep mine private. It still takes part. On the altar it shows sealed, and no one else reads it, the leaders included. Others can still hold it for you.</span></label>` : ""}
        ${kind.verb === "write" && ask.visibility === "coven" ? `<label class="cv-check"><input type="checkbox" name="anonymous"${mine?.anonymous ? " checked" : ""} /><span>Leave my name off. Others see it without knowing it’s yours.</span></label>` : ""}
        <div class="sp-actions"><button class="button button--primary button--small" type="submit">${mine ? "Save the changes" : "Save it"}</button>
          ${mine ? `<button class="button button--ghost button--small" type="button" data-contrib-cancel="${id}">Cancel</button>` : ""}</div>
      </form>`;
  }

  /** What others brought to a step, as this person may see it (sealed, nameless and held, as each should be). */
  function contributionList(list) {
    if (!list.length || !C()) return "";
    const r = reader();
    return `<ul class="cv-contribs">${list
      .map((c) => {
        const label = C().contributionLabel(c, nameOf);
        const readable = C().canRead({ ...c, owner: c.mine ? me() : null }, r) && c.body;
        const holders = c.mine && c.supporters?.length ? P().andList(c.supporters.map(nameOf)) : "";
        const tend = C().ownerActions(c);
        return `<li class="cv-contribs__item" data-contribution="${esc(c.id)}"><p>${esc(label)}</p>
          ${readable ? `<div class="cv-doc">${prose(c.body)}</div>` : c.private ? `<p class="sp-caption">Sealed. Only its writer reads it.</p>` : ""}
          <p class="sp-caption">${esc(STATUS_WORDS[c.status] || "")}${c.support_count ? ` · ${c.support_count} holding it` : ""}${holders ? ` · ${esc(holders)}` : ""}${c.outcome_note && readable ? ` · ${esc(c.outcome_note)}` : ""}</p>
          ${C().canSupport({ ...c, owner: null }, r) ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-support="${esc(c.id)}" data-on="${c.supported_by_me ? "" : "1"}" aria-pressed="${Boolean(c.supported_by_me)}">${c.supported_by_me ? "You’re holding this" : "Hold this for them"}</button></div>` : ""}
          ${tend.length ? `<div class="sp-field"><label for="tn-${esc(c.id)}">A note (optional)</label><input id="tn-${esc(c.id)}" data-tend-note maxlength="1000" /></div>
            <div class="sp-actions">${tend.map((a) => `<button class="button button--ghost button--small" type="button" data-tend="${esc(c.id)}" data-to="${a}">${a === "held" ? "Keep holding it" : a === "answered" ? "It’s answered" : "Close it"}</button>`).join("")}</div>` : ""}
        </li>`;
      })
      .join("")}</ul>`;
  }

  /** "14 of 20 have written", and who has and hasn't for those allowed to see it (never what they wrote). */
  function participationHtml(step) {
    const ask = askOf(step);
    const row = rowFor(step);
    if (!ask || !row) return "";
    const names = row.done_users || row.waiting_users ? C().participationNames(row, nameOf) : null;
    return `<div class="cv-participation"><p class="sp-caption">${esc(C().participationLine(row, ask))}</p>
      ${names?.done ? `<p class="sp-caption">Done: ${esc(names.done)}</p>` : ""}${names?.waiting ? `<p class="sp-caption">Not yet: ${esc(names.waiting)}</p>` : ""}</div>`;
  }

  /** The step under way: your part in what it asks, who has done theirs, and what others brought. */
  function nowAskHtml(step, yours) {
    const ask = askOf(step);
    if (!ask) return "";
    const can = canContribute(step, ask, yours);
    return `${can ? contributionBox(step, ask, { canOffer: true }) : ""}
      ${ask.mode === "one" && leaderNow() && !oneDone(step) && !yours ? `<p class="sp-notice">No one has done this for the coven yet. You can do it now, above.</p>` : ""}
      ${participationHtml(step)}${contributionList(contributionsOf(step))}`;
  }

  /** Before the rite: what you're asked to write or bring ahead of time. */
  function aheadHtml(ritual, steps) {
    if (ritual.status !== "scheduled" || !C()) return "";
    const ahead = steps.filter((s) => {
      const ask = askOf(s);
      return ask && ask.timing === "ahead" && canContribute(s, ask, mine(s));
    });
    if (!ahead.length) return "";
    return `<section class="sp-section" aria-label="Before the rite"><h2>Before the rite</h2>${ahead
      .map((s) => `<div class="sp-card" data-ahead="${esc(s.id)}"><p class="sp-caption">For step ${steps.indexOf(s) + 1}: ${esc(s.title)}</p>${contributionBox(s, askOf(s), { canOffer: false })}${statusLine()}</div>`)
      .join("")}</section>`;
  }

  async function loadContributions(ritual) {
    const key = `${ritual.id}:${ritual.current_step_id || ""}:${ritual.status}`;
    if (contribKey_ === key) return;
    contribKey_ = key;
    if (!stepsOf(ritual).some((s) => s.contribution)) {
      state.contributions = [];
      state.participation = [];
      return;
    }
    const [list, rows] = await Promise.all([D.contributions(ritual.id).catch(() => []), D.participation(ritual.id).catch(() => [])]);
    state.contributions = list;
    state.participation = rows;
    // Kept for the coven's "before the rite" banner (coven.js tasksBanner).
    state.myContributions = [...(state.myContributions || []).filter((c) => c.ritual_id !== ritual.id), ...list.filter((c) => c.mine).map((c) => ({ id: c.id, step_id: c.step_id, ritual_id: c.ritual_id, status: c.status }))];
    const ids = [...list.flatMap((c) => [c.user_id, ...(c.supporters || [])]), ...rows.flatMap((r) => [...(r.done_users || []), ...(r.waiting_users || [])])].filter(Boolean);
    if (ids.length) await UI.loadNames(state.context, ids);
    if (pane && params().get("ritual") === ritual.id && !editing) draw();
  }

  /** Who has done this ritual's altar actions (each lights their own candle on a whole-coven step). */
  async function loadMarks(ritual) {
    if (marksFor_ === ritual.id) return;
    marksFor_ = ritual.id;
    state.stepMarks = await D.stepMarks(ritual.id).catch(() => []);
    if (pane && params().get("ritual") === ritual.id) draw();
  }

  /** The buttons and forms of what steps ask (writing, offering, holding, tending). */
  function wireContributions(ritual, steps) {
    const statusOf = (el) => (el.closest("[data-now], .sp-card, .cv-step") || pane).querySelector("[data-status]") || pane.querySelector("[data-status]");
    const again = async () => {
      contribKey_ = null;
      await loadContributions(ritual);
    };
    // Items for something placed, through the ITEMS picker (lib/altar/itemIndex.ts, in js/core/altar.js).
    pane.querySelectorAll("[data-contrib-items]").forEach(async (holder) => {
      const stepId = holder.dataset.contribItems;
      const core = await UI.altarCore().catch(() => null);
      if (!core || !global.CovenPicker) return;
      const index = core.itemIndex.itemIndex();
      global.CovenPicker.create(holder, {
        id: `ci-${stepId}`,
        label: "What you place",
        placeholder: "A candle in your colour, bread, a flower…",
        chips: () => contribItems[stepId].map((i) => ({ key: i.key, label: i.name, image: i.image })),
        search: (q, picked) => core.itemIndex.searchItems(index, q, { limit: 6, picked }),
        onAdd: (entry) => (contribItems[stepId] = [...contribItems[stepId], core.itemIndex.stepItemOf(entry)].slice(0, 6)),
        onRemove: (key) => (contribItems[stepId] = contribItems[stepId].filter((i) => i.key !== key))
      });
    });
    pane.querySelectorAll("[data-contrib-form]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const step = steps.find((s) => s.id === form.dataset.contribForm);
        const ask = askOf(step);
        const body = form.elements.body?.value || "";
        const items = contribItems[step.id] || [];
        const problem = C().contributionProblem(ask, body, items);
        if (problem) return UI.setStatus(statusOf(form), problem, true);
        const saved = await UI.busy(form, statusOf(form), () => D.saveContribution(step.id, body, items, form.elements.private?.checked, form.elements.anonymous?.checked));
        if (!saved) return;
        contribEditing.delete(step.id);
        delete contribItems[step.id];
        await again();
      })
    );
    pane.querySelectorAll("[data-contrib-edit]").forEach((button) =>
      button.addEventListener("click", () => {
        contribEditing.add(button.dataset.contribEdit);
        draw();
      })
    );
    pane.querySelectorAll("[data-contrib-cancel]").forEach((button) =>
      button.addEventListener("click", () => {
        contribEditing.delete(button.dataset.contribCancel);
        delete contribItems[button.dataset.contribCancel];
        draw();
      })
    );
    pane.querySelectorAll("[data-contrib-remove]").forEach((button) =>
      button.addEventListener("click", async () => {
        if (await UI.busy(button, statusOf(button), () => D.removeContribution(button.dataset.contribRemove).then(() => true))) await again();
      })
    );
    // Offering: a folded paper on the ritual's altar for something written (sealed and nameless as it should be),
    // and a petition the coven will hold gets its own altar's candle and paper, as in the app.
    pane.querySelectorAll("[data-offer]").forEach((button) =>
      button.addEventListener("click", async () => {
        const c = (state.contributions || []).find((x) => x.id === button.dataset.offer);
        const done = await UI.busy(button, statusOf(button), async () => {
          const offered = await D.offerContribution(c.id);
          const core = await UI.altarCore();
          const altar = altarOf(ritual);
          const now = new Date().toISOString();
          const label = C().contributionLabel({ ...c, mine: false, user_id: c.anonymous ? null : c.user_id }, nameOf);
          if (altar && WRITTEN.includes(c.kind) && c.visibility !== "me") {
            await D.changeAltarOnce(altar.id, (doc) => core.ritualAltar.offerPaper({ id: c.id, fate: c.fate }, label, core.ritualAltar.paperCount(doc), now)(doc)).catch(() => {});
          }
          if (offered?.petition?.altar_id) await D.changeAltarOnce(offered.petition.altar_id, core.petitionAltar.seedPetitionAltar(offered.petition, now)).catch(() => {});
          return true;
        });
        if (done) await again();
      })
    );
    pane.querySelectorAll("[data-support]").forEach((button) =>
      button.addEventListener("click", async () => {
        if (await UI.busy(button, statusOf(button), () => D.supportContribution(button.dataset.support, "holding", Boolean(button.dataset.on)).then(() => true))) await again();
      })
    );
    pane.querySelectorAll("[data-tend]").forEach((button) =>
      button.addEventListener("click", async () => {
        const note = button.closest("[data-contribution]")?.querySelector("[data-tend-note]")?.value || "";
        if (await UI.busy(button, statusOf(button), () => D.tendContribution(button.dataset.tend, button.dataset.to, note))) await again();
      })
    );
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
      ${aheadHtml(ritual, steps)}
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
    loadContributions(ritual);
    wireContributions(ritual, steps);
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
    const [candidates, templates, today, core, petitions] = await Promise.all([
      D.ritualPeople(state.coven.id).catch(() => []),
      D.myRitualTemplates(state.context.user?.id).catch(() => []),
      loadToday(),
      UI.altarCore().catch(() => null),
      D.petitions(state.coven.id).catch(() => [])
    ]);
    const covenDays = global.SaltCore?.covens?.programs?.covenHolidaysBetween(state.coven, new Date(), new Date(Date.now() + 200 * 86400000)) || [];
    const suggestions = L.occasionSuggestions(today, new Date(), 6, covenDays);
    const canSchedule = state.perms.schedule || state.perms.site;
    const keepsSchedule = ritual?.status === "scheduled";
    await UI.loadNames(state.context, candidates.map((c) => c.user_id));
    if (!pane || !editing) return;
    const I = core?.itemIndex;
    const blank = () => ({ title: "", instructions: "", spoken_text: "", duration_minutes: null, assigned_user_id: null, assigned_rank_id: null, assignees: [], action: "", deity: "", items: [], contribution: null,
      altar_action: "", altar_color: "white", altar_form: "votive", altar_image: "", altar_label: "", altar_access: "assigned", altar_tenders: [] });
    // A saved step as the planner edits it (the app's planner.ts draftFromStep): its people, items and asking, and
    // for steps planned before items, their one picture as an item.
    let steps = ritual
      ? stepsOf(ritual).map((s) => {
          const saved = Array.isArray(s.items) ? s.items : [];
          const items = !saved.length && s.altar_action === "place_item" && s.altar_image ? [{ key: `legacy|${s.altar_image}`, name: s.altar_label || "Offering", image: s.altar_image, category: "" }] : saved;
          const deity = items.find((i) => i.category === "deities");
          return { ...blank(), ...s, items, assignees: L.stepAssignees(s), altar_action: s.altar_action || "", altar_color: s.altar_color || "white", altar_form: s.altar_form || "votive",
            altar_access: s.altar_access || "assigned", altar_tenders: s.altar_tenders || [], contribution: askOf(s), action: s.action || "", deity: deity ? deity.name.replace(/\s+(statue|figure|idol|icon)\b.*$/i, "") : "" };
        })
      : [blank()];
    const ranks = [...state.ranks].sort((a, b) => b.level - a.level);
    const people = candidates.map((c) => ({ id: c.user_id, name: nameOf(c.user_id), eligible: Boolean(c.eligible) })).sort((a, b) => a.name.localeCompare(b.name));
    const whoList = P() ? P().whoEntries(state.ranks, people) : [];
    const whoSuggest = P() ? P().whoSuggestions(whoList) : [];
    // Everything the altar knows, and the coven's open petitions (the ITEMS picker).
    const itemList = I ? I.itemIndex({ petitions: (petitions || []).filter((x) => x.status === "open") }) : [];
    const blockedPart = (s) => L.unassignablePart(s, people, nameOf);
    const choosing = new Set(ritual ? [] : [0]);
    const actionLabel = (a) => (A() ? A().actionLabel(a) : a.name);
    const opt = (value, label, current) => `<option value="${esc(value)}"${value === current ? " selected" : ""}>${esc(label)}</option>`;
    const select = (name, id, label, options, current) => `<div class="sp-field"><label for="${id}">${esc(label)}</label><select id="${id}" name="${name}">${options.map((o) => opt(o.value, o.label, current)).join("")}</select></div>`;

    const actionChooser = (s, i) => `<div class="cv-action-chooser" data-action-chooser>
        <p class="sp-caption">Choosing one fills in its name, directions and words. You can change any of them after.</p>
        <div class="sp-field"><label for="st-aq-${i}">Find an action</label><input id="st-aq-${i}" type="search" data-action-query placeholder="circle, candle, libation…" autocomplete="off" /></div>
        <div class="sp-chips" role="group" aria-label="Kinds of action">${(A()?.ACTION_GROUPS || []).map((g) => `<button type="button" class="sp-chip" data-action-group="${g.id}">${esc(g.label)}</button>`).join("")}</div>
        <div class="sp-chips" data-action-list></div>
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-action-id="">Something else (write your own)</button>
          ${s.title.trim() || s.action ? `<button class="button button--ghost button--small" type="button" data-action-cancel>Cancel</button>` : ""}</div></div>`;

    const askFields = (s, i) => {
      const ask = s.contribution;
      const kinds = C()?.CONTRIBUTION_KINDS || [];
      const kindSelect = select("ask_kind", `st-ak-${i}`, "Ask something of people", [{ value: "", label: "Nothing" }, ...kinds.map((k) => ({ value: k.id, label: k.label }))], ask?.kind || "");
      if (!ask) return kindSelect;
      const writes = (kinds.find((k) => k.id === ask.kind) || {}).verb === "write";
      const detail = (list, value) => esc((list.find((x) => x.value === value) || {}).detail || "");
      return `${kindSelect}<div class="sp-grid-2">
          ${select("ask_mode", `st-am-${i}`, "Asked of", C().CONTRIBUTION_MODES, ask.mode)}
          ${select("ask_timing", `st-at-${i}`, "When", C().CONTRIBUTION_TIMINGS, ask.timing)}</div>
        <p class="sp-caption">${detail(C().CONTRIBUTION_TIMINGS, ask.timing)}</p>
        ${writes ? `<div class="sp-grid-2">${select("ask_visibility", `st-av-${i}`, "Who can read it", C().CONTRIBUTION_VISIBILITY, ask.visibility)}
          ${select("ask_fate", `st-af-${i}`, "What becomes of it", C().CONTRIBUTION_FATES.filter((f) => f.value !== "petition" || ask.kind === "petition"), ask.fate)}</div>
          <p class="sp-caption">${detail(C().CONTRIBUTION_VISIBILITY, ask.visibility)} Anyone can also mark their own private. ${detail(C().CONTRIBUTION_FATES, ask.fate)}</p>` : ""}
        <div class="sp-field"><label for="st-ap-${i}">A line for them (optional)</label><input id="st-ap-${i}" name="ask_prompt" maxlength="280" value="${esc(ask.prompt || "")}" placeholder="What are you grateful for?" /></div>
        <p class="sp-caption">They will see: ${esc(C().contributionNote(ask))}</p>`;
    };

    const stepHtml = (s, i) => {
      const action = A()?.actionOf(s.action);
      const effects = A()?.ALTAR_EFFECTS || L.ALTAR_ACTIONS;
      const effect = effects.find((e) => e.value === (s.altar_action || "")) || effects[0];
      const access = [{ value: "assigned", label: "Whoever does the step" }, ...ALTAR_ACCESS.slice(1), { value: "chosen", label: "Chosen people" }];
      return `<li class="sp-card cv-step-edit" data-index="${i}">
        <div class="cv-inline-form"><p class="sp-label">Step ${i + 1}</p><span class="cv-grow"></span>
          <button class="button button--ghost button--small" type="button" data-move="-1" ${i === 0 ? "disabled" : ""} aria-label="Move step ${i + 1} up">↑</button>
          <button class="button button--ghost button--small" type="button" data-move="1" ${i === steps.length - 1 ? "disabled" : ""} aria-label="Move step ${i + 1} down">↓</button>
          <button class="button button--ghost button--small" type="button" data-remove aria-label="Remove step ${i + 1}">Remove</button></div>
        <div class="sp-field"><p class="sp-label">Action</p>
          ${choosing.has(i) ? actionChooser(s, i) : `<div class="cv-inline-form"><span>${esc(action ? actionLabel(action) : s.title.trim() ? "Your own" : "None chosen")}</span><span class="cv-grow"></span>
            <button class="button button--ghost button--small" type="button" data-choose-action>${action ? "Change" : "Choose an action"}</button></div>`}</div>
        ${action?.deity ? `<div data-picker-deity></div>` : ""}
        <div class="sp-field"><label for="st-title-${i}">Step name</label><input id="st-title-${i}" name="title" maxlength="120" value="${esc(s.title)}" placeholder="Cast the circle" />
          <p class="sp-caption">A few words, as it shows in the list of steps.</p></div>
        <div class="sp-field"><label for="st-ins-${i}">Directions</label><textarea id="st-ins-${i}" name="instructions" maxlength="4000">${esc(s.instructions || "")}</textarea>
          <p class="sp-caption">What the person doing it does. They see this when the step comes.</p></div>
        <div class="sp-field"><label for="st-say-${i}">Words to speak (optional)</label><textarea id="st-say-${i}" name="spoken_text" maxlength="4000">${esc(s.spoken_text || "")}</textarea></div>
        <div data-picker-who></div>
        <p class="cv-status is-error" data-blocked>${esc(blockedPart(s))}</p>
        <div class="sp-field"><label for="st-min-${i}">Minutes (optional)</label><input id="st-min-${i}" name="duration_minutes" type="number" min="0" max="240" value="${esc(s.duration_minutes ?? "")}" /></div>
        <div data-picker-items></div>
        <div class="sp-grid-2">
          ${select("altar_action", `st-act-${i}`, "On the altar", effects, s.altar_action || "")}
          ${select("altar_access", `st-acc-${i}`, "Who tends the altar during it", access, s.altar_access || "assigned")}</div>
        <p class="sp-caption">${esc(effect.detail || "")}</p>
        ${s.altar_access === "chosen" ? `<div data-picker-tenders></div>` : ""}
        ${askFields(s, i)}
      </li>`;
    };

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
        s.duration_minutes = minutes === "" ? null : Math.max(0, Math.min(240, Math.round(Number(minutes) || 0)));
        s.altar_action = li.querySelector("[name=altar_action]").value;
        s.altar_access = li.querySelector("[name=altar_access]").value;
        const kind = li.querySelector("[name=ask_kind]")?.value || "";
        if (!kind || !C()) s.contribution = null;
        else if (!s.contribution || s.contribution.kind !== kind) s.contribution = C().defaultContribution(kind, s.contribution ? { mode: s.contribution.mode, timing: s.contribution.timing } : {});
        else {
          for (const f of ["mode", "timing", "visibility", "fate"]) {
            const el = li.querySelector(`[name=ask_${f}]`);
            if (el) s.contribution[f] = el.value;
          }
          s.contribution.prompt = li.querySelector("[name=ask_prompt]")?.value || "";
          s.contribution = C().cleanContribution(s.contribution);
        }
      });
    };
    // Who a step is for, the people who tend the altar, its deity and its items: the search pickers (covens/coven/picker.js).
    const whoChips = (list) => (P() ? P().cleanAssignees(list) : []).map((a) => ({ key: P().assigneeKey(a), label: P().assigneeLabel(a, state.ranks, nameOf) }));
    const addWho = (list, entry) => {
      const a = P().assigneeFromKey(entry.key);
      if (!a) return list;
      return P().cleanAssignees(a.kind === "coven" ? [a] : [...list.filter((x) => x.kind !== "coven"), a]);
    };
    const mountPickers = (li, i) => {
      const s = steps[i];
      if (!global.CovenPicker || !P()) return;
      const action = A()?.actionOf(s.action);
      global.CovenPicker.create(li.querySelector("[data-picker-who]"), {
        id: `st-who-${i}`,
        label: "Who does it",
        hint: "Positions, people, or the whole coven, in any mix.",
        placeholder: "Initiate, High Priestess, Rowan…",
        empty: "The whole coven",
        chips: () => whoChips(s.assignees),
        search: (q, picked) => P().searchEntries(whoList, q, { limit: 8, picked, suggestions: whoSuggest }),
        onAdd: (entry) => {
          s.assignees = addWho(s.assignees, entry);
          li.querySelector("[data-blocked]").textContent = blockedPart(s);
        },
        onRemove: (key) => {
          s.assignees = s.assignees.filter((a) => P().assigneeKey(a) !== key);
          li.querySelector("[data-blocked]").textContent = blockedPart(s);
        }
      });
      const tenders = li.querySelector("[data-picker-tenders]");
      if (tenders) {
        global.CovenPicker.create(tenders, {
          id: `st-tend-${i}`,
          label: "Tended by",
          placeholder: "Maiden, Rowan…",
          empty: "No one chosen yet.",
          chips: () => whoChips(s.altar_tenders),
          search: (q, picked) => P().searchEntries(whoList, q, { limit: 8, picked, suggestions: whoSuggest }),
          onAdd: (entry) => (s.altar_tenders = addWho(s.altar_tenders, entry)),
          onRemove: (key) => (s.altar_tenders = s.altar_tenders.filter((a) => P().assigneeKey(a) !== key))
        });
      }
      if (!I) {
        li.querySelector("[data-picker-items]").innerHTML = `<p class="sp-caption">The altar’s things couldn’t load. Refresh the page to add items.</p>`;
        return;
      }
      global.CovenPicker.create(li.querySelector("[data-picker-items]"), {
        id: `st-items-${i}`,
        label: "Items",
        hint: "What the step uses, or sets on the altar. Type to find candles, herbs, crystals, offerings, deities and tools.",
        placeholder: "White candle, rosemary, bread…",
        chips: () => s.items.map((it) => ({ key: it.key, label: it.name, image: it.image })),
        search: (q, picked) => I.searchItems(itemList, q, { limit: 8, picked, suggestions: I.itemSuggestions(itemList, action?.suggestItems) }),
        onAdd: (entry) => (s.items = [...s.items, I.stepItemOf(entry)].slice(0, 24)),
        onRemove: (key) => (s.items = s.items.filter((it) => it.key !== key))
      });
      const deity = li.querySelector("[data-picker-deity]");
      if (deity && action) {
        global.CovenPicker.create(deity, {
          id: `st-deity-${i}`,
          label: "Which deity",
          placeholder: "Hekate, Brigid, Freyja…",
          empty: "No deity chosen yet.",
          max: 1,
          chips: () => s.items.filter((it) => it.category === "deities").map((it) => ({ key: it.key, label: it.name, image: it.image })),
          search: (q, picked) => I.searchItems(itemList, q, { limit: 6, picked, categories: ["deities"] }),
          onAdd: (entry) => {
            read();
            const name = entry.label.replace(/\s+(statue|figure|idol|icon)\b.*$/i, "");
            Object.assign(s, A().refillDeity(s, action, s.deity, name), { deity: name, items: [I.stepItemOf(entry), ...s.items.filter((it) => it.category !== "deities")] });
            drawSteps();
          },
          onRemove: () => {
            read();
            Object.assign(s, A().refillDeity(s, action, s.deity, ""), { deity: "", items: s.items.filter((it) => it.category !== "deities") });
            drawSteps();
          }
        });
      }
    };
    const drawActions = (li, i, group) => {
      const list = li.querySelector("[data-action-list]");
      if (!list || !A()) return;
      const query = li.querySelector("[data-action-query]")?.value || "";
      const found = query.trim() ? A().searchActions(query) : group ? A().STEP_ACTIONS.filter((a) => a.group === group) : [];
      list.innerHTML = found.map((a) => `<button type="button" class="sp-chip${a.id === steps[i].action ? " is-active" : ""}" data-action-id="${esc(a.id)}">${esc(actionLabel(a))}</button>`).join("");
      li.querySelectorAll("[data-action-group]").forEach((b) => b.setAttribute("aria-pressed", String(!query.trim() && b.dataset.actionGroup === group)));
    };
    const drawSteps = () => {
      holder.innerHTML = steps.map(stepHtml).join("");
      holder.querySelectorAll("[data-index]").forEach((li) => {
        const i = Number(li.dataset.index);
        mountPickers(li, i);
        if (choosing.has(i)) drawActions(li, i, A()?.actionOf(steps[i].action)?.group || "");
      });
    };
    drawSteps();
    // Choices that change what the step shows draw it again.
    holder.addEventListener("change", (event) => {
      if (!["altar_action", "altar_access", "ask_kind", "ask_mode", "ask_timing", "ask_visibility", "ask_fate"].includes(event.target.name)) return;
      read();
      drawSteps();
      holder.querySelector(`#${CSS.escape(event.target.id)}`)?.focus();
    });
    holder.addEventListener("input", (event) => {
      if (!event.target.matches("[data-action-query]")) return;
      const li = event.target.closest("[data-index]");
      drawActions(li, Number(li.dataset.index), "");
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
        const wasI = choosing.has(i);
        const wasJ = choosing.has(j);
        choosing.delete(i);
        choosing.delete(j);
        if (wasI) choosing.add(j);
        if (wasJ) choosing.add(i);
        drawSteps();
        holder.querySelector(`[data-index="${j}"] [data-move="${move.dataset.move}"]`)?.focus();
      }
      if (event.target.closest("[data-remove]")) {
        read();
        steps.splice(i, 1);
        const after = [...choosing].filter((k) => k !== i).map((k) => (k > i ? k - 1 : k));
        choosing.clear();
        after.forEach((k) => choosing.add(k));
        drawSteps();
      }
      if (event.target.closest("[data-choose-action]")) {
        read();
        choosing.add(i);
        drawSteps();
        holder.querySelector(`[data-index="${i}"] [data-action-query]`)?.focus();
      }
      if (event.target.closest("[data-action-cancel]")) {
        read();
        choosing.delete(i);
        drawSteps();
      }
      const group = event.target.closest("[data-action-group]");
      if (group) drawActions(li, i, group.dataset.actionGroup);
      const pick = event.target.closest("[data-action-id]");
      if (pick) {
        read();
        choosing.delete(i);
        const action = A()?.actionOf(pick.dataset.actionId);
        if (action) Object.assign(steps[i], A().applyAction(action, { deity: steps[i].deity }));
        else steps[i].action = "";
        drawSteps();
        holder.querySelector(`[data-index="${i}"] [name=title]`)?.focus();
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
      choosing.add(steps.length - 1);
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
      const noItem = kept.findIndex((s) => s.altar_action === "place_item" && !s.altar_image && !(s.items || []).some((it) => it.image));
      if (noItem >= 0) return UI.setStatus(form.querySelector("[data-status]"), `Step ${noItem + 1}: choose what is placed on the altar.`, true);
      const blocked = kept.findIndex((s) => blockedPart(s));
      if (blocked >= 0) {
        drawSteps();
        return UI.setStatus(form.querySelector("[data-status]"), `Step ${blocked + 1}: ${blockedPart(kept[blocked])}`, true);
      }
      const noTenders = kept.findIndex((s) => s.altar_access === "chosen" && !(s.altar_tenders || []).length);
      if (noTenders >= 0) return UI.setStatus(form.querySelector("[data-status]"), `Step ${noTenders + 1}: choose who tends the altar during it.`, true);
      const fields = {
        title: form.elements.ritual_title.value.trim(),
        intention: form.elements.ritual_intention.value.trim(),
        description: form.elements.ritual_description.value.trim(),
        scheduled_for: L.fromLocalInput(form.elements.scheduled_for.value),
        status: form.elements.status.value,
        occasion: form.elements.occasion.value,
        occasion_name: form.elements.occasion_name.value.trim()
      };
      // The same shapes as the app's planner.ts stepsPayload.
      const payload = kept.map((s) => {
        const assignees = P() ? P().cleanAssignees(L.stepAssignees(s)) : [];
        const items = I ? I.cleanStepItems(s.items) : s.items || [];
        const candle = I ? I.stepCandle(items, { color: s.altar_color, form: s.altar_form }) : { color: s.altar_color, form: s.altar_form };
        const placing = s.altar_action === "place_item";
        const lighting = s.altar_action === "light_candle";
        return {
          id: s.id || null, title: s.title.trim(), instructions: s.instructions || "", spoken_text: s.spoken_text || "", duration_minutes: s.duration_minutes,
          ...(P() ? P().legacyColumns(assignees) : { assigned_user_id: s.assigned_user_id, assigned_rank_id: s.assigned_rank_id }),
          assignees, action: s.action || null, items, contribution: askOf(s),
          altar_action: s.altar_action || "", altar_color: lighting ? candle.color : "", altar_form: lighting ? candle.form : "",
          altar_image: placing ? (items.length ? (items.find((it) => it.image) || {}).image || "" : s.altar_image) : "",
          altar_label: placing ? (items.length ? L.stepItemsLabel({ items }).slice(0, 80) : s.altar_label) : "",
          altar_access: s.altar_access || "assigned", altar_tenders: s.altar_access === "chosen" ? P().cleanAssignees(s.altar_tenders) : []
        };
      });
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
    contribKey_ = null;
    contribEditing.clear();
    global.clearTimeout(altarTimer);
  }

  global.CovenRituals = { mount, unmount, onChange, onAltarChange };
})(window);
