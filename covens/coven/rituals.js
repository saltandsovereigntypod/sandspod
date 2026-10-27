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
  // The builder's rules (lib/covens/builder.ts, script.ts): the plan, steps that know what they are, the script.
  const B = () => global.SaltCore?.covens?.builder;
  const S = () => global.SaltCore?.covens?.script;
  const kindOf = (ritual) => (ritual?.kind === "meeting" ? "meeting" : "rite");
  const planOf = (ritual) => (B() ? B().cleanPlan(ritual?.plan, kindOf(ritual)) : { sections: [], roles: [], checklist: [], afterwards: { hold_hours: null, notes: "", follow_up: null } });
  const builderSteps = (ritual) => (B() ? stepsOf(ritual).map((s) => B().builderStepFrom(s, planOf(ritual))) : []);
  const viewer = () => ({ membership: state.membership, userId: me() });
  // Per ritual: the Book's pages its words come from, the checklist's ticks, votes and the record.
  let extras_ = null;
  let extrasKey_ = null;
  function scriptOf(ritual) {
    if (!S() || !B()) return null;
    return S().buildScript({ title: ritual.title, kind: kindOf(ritual), plan: planOf(ritual), steps: builderSteps(ritual), ctx: { ranks: state.ranks, nameOf }, pages: extras_?.pages || [], viewer: viewer() });
  }
  const scriptStepOf = (ritual, stepId) => (scriptOf(ritual)?.sections || []).flatMap((x) => x.steps).find((x) => x.key === stepId);
  async function loadExtras(ritual, fresh) {
    const current = stepsOf(ritual).find((s) => s.id === ritual.current_step_id);
    const key = `${ritual.id}:${ritual.status}:${ritual.current_step_id || ""}:${current?.turn_at ?? ""}`;
    if (!fresh && extrasKey_ === key) return;
    extrasKey_ = key;
    const plan = planOf(ritual);
    const steps = builderSteps(ritual);
    const [pages, prep, votes, record] = await Promise.all([
      // Linked pages you can't open come back marked, so the script says only that.
      steps.some((s) => s.details.book_page_id) ? D.bookPages(state.coven.id, steps.map((s) => s.details.book_page_id).filter(Boolean)).catch(() => []) : Promise.resolve(extras_?.pages || []),
      plan.checklist.length ? D.ritualPrep(ritual.id) : Promise.resolve([]),
      stepsOf(ritual).some((s) => s.action === "vote") ? D.ritualVotes(ritual.id) : Promise.resolve([]),
      ritual.status === "done" ? D.ritualRecord(ritual.id) : Promise.resolve(null)
    ]);
    extras_ = { id: ritual.id, pages, prep, votes, record };
    const ids = [...prep.flatMap((r) => r.users || []), ...votes.flatMap((v) => (v.ballots || []).map((b) => b.user_id)), ...(record?.attendees || []), record?.led_by].filter(Boolean);
    if (ids.length) await UI.loadNames(state.context, ids);
    if (record) keepInGrimoire(record);
    if (pane && params().get("ritual") === ritual.id && !editing) draw();
  }
  const extrasFor = (ritual) => (extras_?.id === ritual.id ? extras_ : { pages: [], prep: [], votes: [], record: null });

  // Your own copy of a rite you were at, in your grimoire under Coven rites (as the app's grimoire store saveCovenRite).
  const keptRites = new Set();
  async function keepInGrimoire(record) {
    const user = state.context.user;
    if (!user || !global.db || !S() || keptRites.has(record.ritual_id) || !(record.attendees || []).includes(user.id)) return;
    keptRites.add(record.ritual_id);
    try {
      const db = global.db;
      const [books, sections, pages] = await Promise.all([
        db.from("grimoire_books").select("id,title,created_at,updated_at").eq("user_id", user.id).order("created_at"),
        db.from("grimoire_sections").select("id,book_id,title,sort_order,created_at").eq("user_id", user.id),
        db.from("grimoire_pages").select("id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at").eq("user_id", user.id)
      ]);
      if ([books, sections, pages].some((r) => r.error)) return;
      if (S().findCovenRitePage(pages.data || [], record.ritual_id)) return;
      const snapshot = { fetchedAt: new Date().toISOString(), books: books.data || [], sections: sections.data || [], pages: pages.data || [], blocks: [], links: [] };
      const { ops } = S().covenRitePageOps(snapshot, { userId: user.id, now: new Date().toISOString() }, { ritualId: record.ritual_id, covenName: state.coven.name, record, nameOf }, global.SaltCore.covens.newId);
      // In order: the book, the section, the page, then its blocks.
      for (const op of ops) {
        if (op.kind !== "insert") continue;
        const { error } = await db.from(op.table).insert(op.row);
        if (error && error.code !== "23505") throw error;
      }
    } catch (error) {
      console.error(error);
      keptRites.delete(record.ritual_id);
    }
  }
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
        <span class="sp-row__detail">${r.kind === "meeting" ? "Meeting · " : ""}${L.occasionLabel(r) ? `${esc(L.occasionLabel(r))} · ` : ""}${esc(when(r))} · ${steps.length} step${steps.length === 1 ? "" : "s"}${yours ? ` · ${yours} ${yours === 1 ? "is" : "are"} yours` : ""}${r.status === "cancelled" ? " · cancelled" : ""}${rsvpWord(r)}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;
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
    pane.innerHTML = `<div class="sp-actions">${state.perms.lead || state.perms.site ? `<a class="button button--primary" href="${esc(editHref("new"))}" data-tab="rituals">✦ Plan a gathering</a><a class="button button--ghost" href="${esc(`${editHref("new")}&kind=meeting`)}" data-tab="rituals">Plan a meeting</a>` : ""}</div>
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
    const scripted = scriptStepOf(ritual, step.id);
    const words = `${step.instructions ? `<div class="cv-doc">${prose(step.instructions)}</div>` : ""}
      ${scripted ? linesHtml(scripted) : step.spoken_text ? `<blockquote class="cv-doc cv-spoken">${prose(step.spoken_text)}</blockquote>` : ""}`;
    const hasWords = Boolean(step.instructions || step.spoken_text || scripted?.lines.length || scripted?.facts.length);
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

  /** A step's facts and words as the script reads them (Book pages as they stand now), yours marked. */
  function linesHtml(scripted) {
    return `${scripted.facts.map((f) => `<p class="sp-caption">${esc(f)}</p>`).join("")}
      ${scripted.lines.map((l) => `<div class="cv-script__line${l.mine ? " is-mine" : ""}"><p class="cv-script__who">${l.part ? `${esc(l.part)} · ` : ""}${esc(l.who)}${l.mine ? " · you" : ""}${l.fromBook ? ` · from the Book: ${esc(l.fromBook)}` : ""}</p><blockquote class="cv-doc cv-spoken">${prose(l.words)}</blockquote></div>`).join("")}`;
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
        <p class="sp-caption">${yours ? (who.kind === "person" ? "This step is yours." : `This step is for ${esc(who.label.toLowerCase())}${who.kind === "everyone" ? "" : ", and you are one"}.`) : `${esc(who.label)} leads this step.`}${step.duration_minutes ? ` About ${step.duration_minutes} ${step.duration_minutes === 1 ? "minute" : "minutes"}.` : ""}</p>
        ${step.instructions ? `<div class="cv-doc">${prose(step.instructions)}</div>` : ""}
        ${scriptStepOf(ritual, step.id) ? linesHtml(scriptStepOf(ritual, step.id)) : step.spoken_text ? `<p class="sp-label">Words to speak</p><blockquote class="cv-doc cv-spoken">${prose(step.spoken_text)}</blockquote>` : ""}
        ${step.items?.length ? `<p class="sp-caption">Items: ${esc(L.stepItemsLabel(step))}</p>` : ""}
        ${turnHtml(ritual, step)}
        ${voteHtml(ritual, step)}
        ${linkedHtml(step, yours)}
        ${altarActionHtml(step, yours)}
        ${waitingTurn(ritual, step) ? "" : nowAskHtml(step, yours)}
        <div class="sp-actions">
          ${canFinish ? `<button class="button button--primary" type="button" data-finish="${esc(step.id)}">${yours ? "I’ve finished this step" : "Finish this step"}${index === steps.length - 1 ? " and close the ritual" : ""}</button>` : ""}
          ${state.perms.lead || state.perms.site ? `${index > 0 ? `<button class="button button--ghost button--small" type="button" data-goto="${esc(steps[index - 1].id)}">Back a step</button>` : ""}
            <button class="button button--ghost button--small" type="button" data-end>End the ritual</button>` : ""}
        </div>
        ${yours && !state.standing.ok && !canFinish ? `<p class="sp-notice">${esc(state.standing.reasons.join(" "))} The ritual’s leader can move it on for you.</p>` : ""}
        ${statusLine()}
      </section>`;
  }

  const steersNow = (ritual) => leaderNow() || ritual.led_by === me();
  const waitingTurn = (ritual, step) => step.turn_mode === "in_turn" && (step.turn_order || []).length > 0 && (step.turn_order || [])[step.turn_at || 0] !== me() && !steersNow(ritual);

  /** A one-at-a-time step: whose turn it is, and the buttons to move on. */
  function turnHtml(ritual, step) {
    if (step.turn_mode !== "in_turn" || !B()) return "";
    const t = B().turnState(step.turn_order || [], step.turn_at || 0);
    const steers = steersNow(ritual);
    if (!t.total) return `<p class="sp-caption">Turns begin when people open the ritual.</p>${steers ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-turn="restart">Start the turns again</button></div>` : ""}`;
    const mine = t.current === me();
    return `<div class="cv-turn${mine ? " is-mine" : ""}"><p class="sp-label">${t.done ? "Everyone has had their turn" : `Turn ${t.position} of ${t.total}`}</p>
      ${t.done ? "" : `<p class="cv-turn__who">${mine ? "Your turn" : `${esc(nameOf(t.current))}’s turn`}</p>${t.next ? `<p class="sp-caption">Next: ${t.next === me() ? "you" : esc(nameOf(t.next))}</p>` : ""}`}
      <div class="sp-actions">${mine && !t.done ? `<button class="button button--primary button--small" type="button" data-turn="done">I’ve done mine</button>` : ""}
        ${steers && !t.done && !mine ? `<button class="button button--ghost button--small" type="button" data-turn="skip">Next person</button>` : ""}
        ${steers ? `<button class="button button--ghost button--small" type="button" data-turn="restart">Start the turns again</button>` : ""}</div></div>`;
  }

  /** A vote under way: the motion, the answers, and the count as it may be shown. */
  function voteHtml(ritual, step) {
    if (step.action !== "vote" || !B() || !S()) return "";
    const b = B().builderStepFrom(step, planOf(ritual));
    const fields = b.details.fields || {};
    const options = S().voteOptions(fields);
    const row = extrasFor(ritual).votes.find((v) => v.step_id === step.id);
    const secret = fields.ballot === "secret";
    const closed = Boolean(row?.closed);
    const canVote = state.standing.ok && S().mayVote(b, planOf(ritual), viewer());
    const counts = row?.counts || null;
    const result = counts && closed ? S().voteResult({ options, counts, total: row.total }) : counts ? options.map((o) => `${o}: ${counts[o] || 0}`).join(" · ") : "";
    return `<div class="cv-vote"><p class="sp-label">${secret ? "A secret ballot" : "An open vote"}</p>
      ${fields.motion ? `<div class="cv-doc">${prose(fields.motion)}</div>` : ""}
      ${canVote && !closed ? `<div class="sp-chips">${options.map((o) => `<button type="button" class="sp-chip${row?.mine === o ? " is-active" : ""}" data-vote="${esc(o)}" aria-pressed="${row?.mine === o}">${esc(o)}</button>`).join("")}</div><p class="sp-caption">${row?.mine ? "You can change your vote until it closes." : "Choose one."}</p>` : closed ? "" : `<p class="sp-caption">This vote is for those named on it.</p>`}
      ${row ? `<p class="sp-caption">${row.total} ${row.total === 1 ? "vote" : "votes"} cast.</p>` : ""}
      ${result ? `<p>${esc(result)}</p>` : ""}
      ${!secret && row?.ballots?.length ? `<p class="sp-caption">${esc(row.ballots.map((x) => `${nameOf(x.user_id)}: ${x.choice}`).join(" · "))}</p>` : ""}
      ${steersNow(ritual) && !closed ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-close-vote>Close the vote</button></div>` : ""}</div>`;
  }

  /** A later step on something named earlier: put out Hekate’s candle, clear the crossroads offerings. */
  function linkedHtml(step, yours) {
    const link = B()?.linkedEffect(step);
    if (!link || !((yours && state.standing.ok) || leaderNow())) return "";
    const label = link.kind === "snuff" ? `Put out ${link.name === "*" ? "every candle" : link.name}` : `Clear ${link.name}`;
    return `<div class="sp-actions"><button class="button button--ghost" type="button" data-linked="${esc(step.id)}">${esc(label)}</button></div>`;
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
          const placed = steps.find((s) => s.id === c.step_id);
          if (altar && placed && ["offering", "candle"].includes(c.kind) && (c.items || []).length && B()) {
            const count = (state.stepMarks || []).length + (state.contributions || []).filter((x) => x.status !== "written").length;
            await D.changeAltarOnce(altar.id, core.ritualAltar.placeOffering(c.items, label, B().stepThingName(placed), `${ritual.title} · ${placed.title}`, count, now)).catch(() => {});
          }
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

  function rolesHtml(ritual) {
    const plan = planOf(ritual);
    if (!plan.roles.length || !B()) return "";
    return `<div class="cv-roles"><p class="sp-label">Roles</p><ul class="cv-script__list">${plan.roles.map((r) => `<li>${esc(B().roleLabel(r, { ranks: state.ranks, nameOf }))}</li>`).join("")}</ul></div>`;
  }

  /** Before the rite: the checklist each person ticks; those who see participation see who has. */
  function prepHtml(ritual) {
    const plan = planOf(ritual);
    if (!plan.checklist.length || ["done", "cancelled"].includes(ritual.status) || !B()) return "";
    const rows = extrasFor(ritual).prep;
    const sum = L.rsvpSummary(state.rsvps, ritual.id, me());
    const expected = sum.going.length + sum.maybe.length;
    const can = state.perms.member && state.standing.ok;
    return `<section class="sp-card" aria-label="Before"><p class="sp-label">${kindOf(ritual) === "meeting" ? "Before the meeting" : "Before the rite"}</p>
      ${plan.checklist
        .map((c) => {
          const row = rows.find((r) => r.item_id === c.id);
          return `<div class="cv-prep">${can ? `<label class="cv-check"><input type="checkbox" data-prep="${esc(c.id)}"${row?.mine ? " checked" : ""} /><span>${esc(c.text)}</span></label>` : `<p>${esc(c.text)}</p>`}
            ${row ? `<p class="sp-caption">${esc(B().prepLine(row.done, expected))}${row.users?.length ? ` Done: ${esc(row.users.map(nameOf).join(", "))}` : ""}</p>` : ""}</div>`;
        })
        .join("")}${statusLine()}</section>`;
  }

  /** After the rite: the altar's quiet time, its notes, the record with the leader's notes, and saving to the Book. */
  function afterHtml(ritual) {
    if (ritual.status !== "done" || !B()) return "";
    const plan = planOf(ritual);
    const until = B().holdUntil(ritual.ended_at, plan);
    const record = extrasFor(ritual).record;
    const steers = steersNow(ritual);
    const canBook = (state.perms.writeBook && state.standing.ok) || state.perms.site;
    const kind = kindOf(ritual);
    const date = record ? record.held_at || record.ended_at : null;
    return `${until || plan.afterwards.notes ? `<section class="sp-card" aria-label="Afterwards"><p class="sp-label">Afterwards</p>
        ${until ? `<p>${esc(B().holdLine(until))}</p>` : ""}${plan.afterwards.notes ? `<div class="cv-doc">${prose(plan.afterwards.notes)}</div>` : ""}
        ${leaderNow() && B().holdActive(until) && altarOf(ritual) ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-release-hold>End the quiet time now</button></div>` : ""}${statusLine()}</section>` : ""}
      ${record && S() ? `<section class="sp-card" aria-label="The record"><p class="sp-label">The record</p>
        <p>${esc([date ? new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "", S().recordMoon(record)].filter(Boolean).join(" · "))}</p>
        <p class="sp-caption">Who was there: ${esc(record.attendees.length ? record.attendees.map(nameOf).join(", ") : "not recorded")}</p>
        <p class="sp-caption">${record.steps.filter((x) => x.done).length} of ${record.steps.length} steps done${S().countsLine(record.counts) ? ` · ${esc(S().countsLine(record.counts))}` : ""}</p>
        ${record.votes.map((v) => `<p class="sp-caption">${esc(v.title)}: ${esc(S().voteResult({ options: v.options, counts: v.counts, total: v.total }))}</p>`).join("")}
        ${steers ? `<form data-record-notes><div class="sp-field"><label for="rec-notes">${kind === "meeting" ? "Minutes and notes" : "Notes and reflection"}</label><textarea id="rec-notes" name="notes" maxlength="8000" placeholder="What happened, what was felt, what to remember">${esc(record.notes || "")}</textarea></div>
          <div class="sp-actions"><button class="button button--ghost button--small" type="submit">Save the notes</button></div></form>` : record.notes ? `<div class="cv-doc">${prose(record.notes)}</div>` : ""}
        ${me() && record.attendees.includes(me()) ? `<p class="sp-caption">A copy is in your grimoire, under Coven rites.</p>` : ""}${statusLine()}</section>` : ""}
      ${canBook ? bookButtons(ritual, record) : ""}`;
  }

  function bookButtons(ritual, record) {
    const kind = kindOf(ritual);
    return `<div class="sp-actions">${stepsOf(ritual).length ? `<button class="button button--ghost button--small" type="button" data-to-book="rite">${kind === "meeting" ? "Save the agenda to the Book" : "Save the rite to the Book"}</button>` : ""}
      ${record ? `<button class="button button--ghost button--small" type="button" data-to-book="record">${kind === "meeting" ? "Save the minutes to the Book" : "Save the record to the Book"}</button>` : ""}</div>${statusLine()}`;
  }

  /** The whole script, or your run-through, printable. */
  function scriptView(ritual, mode) {
    const script = scriptOf(ritual);
    pane.innerHTML = `<p class="cv-no-print"><a class="sp-back" href="${esc(ritualHref(ritual.id))}" data-tab="rituals">← Back to the ritual</a></p>
      <div class="sp-chips cv-no-print"><a class="sp-chip${mode === "script" ? " is-active" : ""}" href="${esc(ritualHref(ritual.id, "&view=script"))}" data-tab="rituals">The whole script</a><a class="sp-chip${mode === "run" ? " is-active" : ""}" href="${esc(ritualHref(ritual.id, "&view=run"))}" data-tab="rituals">Your run-through</a></div>
      <p class="sp-caption cv-no-print">${mode === "run" ? "Every step in order, with yours marked in gold." : `Every step and every word, in order${script?.minutes ? `, about ${script.minutes} minutes` : ""}.`}</p>
      ${script && global.CovenBuilder ? global.CovenBuilder.scriptHtml(script, mode) : `<p class="sp-notice">The script couldn’t load. Refresh the page to try again.</p>`}
      <div class="sp-actions cv-no-print"><button class="button button--ghost" type="button" data-print>Print it</button></div>`;
    pane.querySelector("[data-print]")?.addEventListener("click", () => global.print());
    loadExtras(ritual);
  }

  function detail(id) {
    const ritual = state.rituals.find((r) => r.id === id);
    if (!ritual) {
      pane.innerHTML = `<p class="sp-notice">That ritual isn’t here any more.</p><p><a class="sp-back" href="${esc(api.covenHref("rituals"))}" data-tab="rituals">← All rituals</a></p>`;
      return;
    }
    // A meeting has its own page (covens/coven/meeting.js, the app's MeetingScreen).
    if (ritual.kind === "meeting" && global.CovenMeeting) {
      return global.CovenMeeting.draw(pane, ritual, { state, api, editHref, navigate, reloadSteps });
    }
    global.CovenMeeting?.stop?.();
    const steps = stepsOf(ritual);
    const leader = state.perms.lead || state.perms.site;
    const yours = steps.filter(mine);
    pane.innerHTML = `<p><a class="sp-back" href="${esc(api.covenHref("rituals"))}" data-tab="rituals">← All rituals</a></p>
      <header class="sp-section">
        <h2>${esc(ritual.title)}</h2>
        <div class="cv-meta">${L.occasionLabel(ritual) ? `<span class="cv-pill cv-pill--gold">${esc(L.occasionLabel(ritual))}</span>` : ""}<span class="cv-pill${ritual.status === "live" ? " cv-pill--warn" : ""}">${esc(when(ritual))}</span>
          ${kindOf(ritual) === "meeting" ? `<span class="cv-pill">Meeting</span>` : ""}
          ${ritual.status === "cancelled" ? `<span class="cv-pill">Cancelled</span>` : ""}${ritual.status === "done" ? `<span class="cv-pill">Completed ${esc(L.relativeTime(ritual.ended_at))}</span>` : ""}
          ${ritual.led_by && ritual.status === "live" ? `<span class="cv-pill">Led by ${esc(nameOf(ritual.led_by))}</span>` : ""}</div>
        ${ritual.intention ? `<p class="gd-intro">${esc(ritual.intention)}</p>` : ""}
        ${ritual.description ? `<div class="cv-doc">${prose(ritual.description)}</div>` : ""}
        ${rolesHtml(ritual)}
        ${steps.length ? `<div class="sp-actions"><a class="button button--ghost button--small" href="${esc(ritualHref(ritual.id, "&view=script"))}" data-tab="rituals">The script</a><a class="button button--ghost button--small" href="${esc(ritualHref(ritual.id, "&view=run"))}" data-tab="rituals">Your run-through</a></div>` : ""}
        ${ritual.status !== "live" && yours.length ? `<p class="sp-notice">${yours.length === 1 ? "One step is yours" : `${yours.length} steps are yours`}: ${yours.map((s) => esc(s.title)).join(", ")}. When the ritual reaches ${yours.length === 1 ? "it" : "each one"}, it will show up here for you.</p>` : ""}
      </header>
      ${rsvpBlock(ritual)}
      <div data-attendance></div>
      ${prepHtml(ritual)}
      ${aheadHtml(ritual, steps)}
      ${ritual.status === "live" ? nowCard(ritual, steps) : ""}
      ${afterHtml(ritual)}
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
    loadAttendance(ritual);
    loadExtras(ritual);
    wireBuilderParts(ritual, steps);
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
        const now = new Date().toISOString();
        const change = step && core.ritualAltar.stepAltarChange(step, ritual, name, already, now);
        const thing = step?.altar_action === "place_item" && B() ? B().stepThingName(step) : "";
        if (change && altar) await D.changeAltarOnce(altar.id, thing ? core.ritualAltar.nameNewThings(change, thing, now) : change);
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

  /** The checklist, turns, votes, linked steps, the altar's quiet time, the record's notes and saving to the Book. */
  function wireBuilderParts(ritual, steps) {
    const statusOf = (el) => (el.closest("[data-now], .sp-card") || pane).querySelector("[data-status]");
    const again = () => loadExtras(ritual, true);
    pane.querySelectorAll("[data-prep]").forEach((box) =>
      box.addEventListener("change", async () => {
        if (await UI.busy(box, statusOf(box), () => D.tickPrep(ritual.id, box.dataset.prep, box.checked).then(() => true))) again();
        else box.checked = !box.checked;
      })
    );
    pane.querySelectorAll("[data-turn]").forEach((button) =>
      button.addEventListener("click", async () => {
        const step = steps.find((s) => s.id === ritual.current_step_id);
        if (!step) return;
        const how = button.dataset.turn;
        const saved = await UI.busy(button, statusOf(button), () => (how === "restart" ? D.restartTurns(step.id) : D.nextTurn(step.id, how === "skip")));
        if (!saved) return;
        apply("step", { eventType: "UPDATE", new: saved });
        draw();
      })
    );
    pane.querySelectorAll("[data-vote]").forEach((button) =>
      button.addEventListener("click", async () => {
        if (await UI.busy(button, statusOf(button), () => D.castVote(ritual.current_step_id, button.dataset.vote))) again();
      })
    );
    pane.querySelector("[data-close-vote]")?.addEventListener("click", async (event) => {
      if (await UI.busy(event.currentTarget, statusOf(event.currentTarget), () => D.closeVote(ritual.current_step_id).then(() => true))) again();
    });
    pane.querySelector("[data-linked]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const step = steps.find((s) => s.id === button.dataset.linked);
      const link = step && B().linkedEffect(step);
      const altar = altarOf(ritual);
      if (!link || !altar) return UI.setStatus(statusOf(button), "The ritual’s altar couldn’t be found.", true);
      await UI.busy(
        button,
        statusOf(button),
        async () => {
          const core = await UI.altarCore();
          const change = link.kind === "snuff" ? core.ritualAltar.snuffNamed(link.name, new Date().toISOString()) : core.ritualAltar.clearNamed(link.name);
          await D.changeAltarOnce(altar.id, change);
          return true;
        },
        { done: link.kind === "snuff" ? `${link.name === "*" ? "Every candle" : link.name} is out.` : `${link.name} cleared from the altar.` }
      );
    });
    pane.querySelector("[data-release-hold]")?.addEventListener("click", async (event) => {
      const altar = altarOf(ritual);
      if (altar) await UI.busy(event.currentTarget, statusOf(event.currentTarget), () => D.releaseAltarHold(altar.id).then(() => true), { done: "The altar can be tended again." });
    });
    pane.querySelector("[data-record-notes]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (await UI.busy(form, statusOf(form), () => D.setRecordNotes(ritual.id, form.elements.notes.value), { done: "Saved." })) again();
    });
    pane.querySelectorAll("[data-to-book]").forEach((button) =>
      button.addEventListener("click", async () => {
        const kind = kindOf(ritual);
        const record = extrasFor(ritual).record;
        const script = scriptOf(ritual);
        const asRecord = button.dataset.toBook === "record";
        // Onto the Book's own shelf; saving again updates the same page (as the app's ritual/[id].tsx).
        const what = asRecord ? (kind === "meeting" ? "minutes" : "record") : kind === "meeting" ? "agenda" : "rite";
        const shelf = what === "rite" ? "Rites" : what === "record" ? "Ritual records" : "Meeting minutes";
        const title = asRecord && record ? `${ritual.title} · ${new Date(record.held_at || record.ended_at || Date.now()).toLocaleDateString()}` : ritual.title;
        const G = global.SaltCore.grimoire.coven;
        const blocks = asRecord && record ? G.recordPageBlocks(S().recordBlocks(record, nameOf)) : G.textBlocks(S().scriptText(script));
        const saved = await UI.busy(button, statusOf(button), () => D.saveGathering(state.coven.id, ritual.id, what, title, blocks));
        if (saved) UI.setStatus(statusOf(button), saved.status === "published" ? `It is in the coven’s Book, under ${shelf}.` : "Sent to those who approve the Book’s pages.");
      })
    );
  }

  // --- the builder (covens/coven/builder.js) ----------------------------------

  function editor(id) {
    editing = true;
    const ritual = id === "new" ? null : state.rituals.find((r) => r.id === id);
    if (id !== "new" && !ritual) return detail(id);
    if (!(state.perms.lead || state.perms.site)) return detail(id);
    if (ritual?.status === "live") {
      pane.innerHTML = `<p><a class="sp-back" href="${esc(ritualHref(ritual.id))}" data-tab="rituals">← Back to the ritual</a></p><p class="sp-notice">This ritual is under way. End it before changing it.</p>`;
      return;
    }
    if (!global.CovenBuilder) {
      pane.innerHTML = `<p class="sp-notice">The builder couldn’t load. Refresh the page to try again.</p>`;
      return;
    }
    global.CovenBuilder.open(pane, {
      state,
      ritual,
      kind: params().get("kind"),
      backHref: ritual ? ritualHref(ritual.id) : api.covenHref("rituals"),
      onSaved: async (saved) => {
        apply("ritual", { eventType: ritual ? "UPDATE" : "INSERT", new: saved });
        await reloadSteps(saved.id);
        editing = false;
        global.CovenBuilder.close();
        navigate(ritualHref(saved.id));
      }
    });
  }

  // --- attendance (the members' record, covens/coven/record.js) --------------
  // Opening a ritual while it's under way counts you as there; "Can't make it"
  // can carry a note for the leaders, who see who sent word and who was there,
  // and can correct it. As the app's ritual/[id].tsx.

  let attendanceFor_ = null;
  let attendancePeople_ = null;
  const presenceSent = new Set();

  async function loadAttendance(ritual, fresh) {
    const holder = pane?.querySelector("[data-attendance]");
    const R = global.SaltCore?.covens?.record;
    if (!holder || !R || ritual.status === "draft" || ritual.status === "cancelled") return;
    if (ritual.status === "live" && state.perms.member && !presenceSent.has(ritual.id)) {
      presenceSent.add(ritual.id);
      if (await D.recordPresence(ritual.id)) fresh = true;
    }
    if (fresh || attendanceFor_?.id !== ritual.id) attendanceFor_ = { id: ritual.id, rows: await D.attendance(ritual.id).catch(() => []) };
    const leads = (state.perms.lead && state.standing?.ok) || state.perms.site;
    const held = ritual.status === "live" || ritual.status === "done";
    if (leads && held && !attendancePeople_) attendancePeople_ = (await D.members(state.coven.id).catch(() => [])).filter((m) => m.status === "active").map((m) => m.user_id);
    const rows = attendanceFor_.rows;
    await UI.loadNames(state.context, [...rows.map((r) => r.user_id), ...(leads && held ? attendancePeople_ || [] : [])]);
    const live = pane?.querySelector("[data-attendance]");
    if (!live || params().get("ritual") !== ritual.id) return;
    const rowOf = (userId) => rows.find((r) => r.user_id === userId);
    const mine = rowOf(me());
    const sum = L.rsvpSummary(state.rsvps, ritual.id, me());
    const open = ritual.status === "scheduled" || ritual.status === "live";
    const excuse = (userId, row) => `<button class="button button--ghost button--small" type="button" data-excuse="${esc(userId)}" data-excused="${row?.excused ? "false" : "true"}">${row?.excused ? "Not excused" : "Excuse the absence"}</button>`;
    const parts = [];
    if (open && sum.mine === "not_going" && state.perms.member && state.standing?.ok) {
      parts.push(`<form class="sp-card" data-apology>
          <div class="sp-field"><label for="apology-note">A note for the leaders (optional)</label>
            <textarea id="apology-note" name="note" maxlength="${R.APOLOGY_MAX}">${esc(mine?.apology || "")}</textarea></div>
          <p class="sp-caption">Only those who lead the coven’s rituals see it.</p>
          <div class="sp-actions"><button class="button button--ghost button--small" type="submit">${mine?.apology ? "Change the note" : "Send the note"}</button>
            ${mine?.apology ? `<button class="button button--ghost button--small" type="button" data-take-back>Take it back</button>` : ""}</div>${statusLine()}</form>`);
    }
    if (leads && open && sum.notGoing.length) {
      parts.push(`<section class="sp-card"><p class="sp-label">Can’t make it</p><div class="sp-list">${sum.notGoing
        .map((r) => {
          const row = rowOf(r.user_id);
          return `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(nameOf(r.user_id))}</span>${row?.apology ? `<span class="sp-row__detail">“${esc(row.apology)}”</span>` : ""}${row?.excused ? `<span class="sp-row__detail">Excused</span>` : ""}</span>${excuse(r.user_id, row)}</div>`;
        })
        .join("")}</div>${statusLine()}</section>`);
    }
    if (leads && held && attendancePeople_?.length) {
      parts.push(`<section class="sp-card"><p class="sp-label">Who was there</p>
          <p class="sp-caption">Someone counts as there when they open the ritual while it’s under way. Correct it for anyone who joined in person.</p>
          <div class="sp-list">${attendancePeople_
            .map((userId) => {
              const row = rowOf(userId);
              const stood = R.attendedAs({ status: ritual.status, held_at: ritual.scheduled_for || new Date().toISOString() }, row, "1970-01-01T00:00:00Z");
              return `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(nameOf(userId))}</span><span class="sp-row__detail">${esc(R.ATTENDED_LABEL[stood === "under_way" ? "missed" : stood])}${row?.marked_by ? " (marked)" : ""}</span></span>
                <span class="sp-actions">${row?.present === true
                  ? `<button class="button button--ghost button--small" type="button" data-mark="${esc(userId)}" data-present="false">Wasn’t there</button>`
                  : `<button class="button button--ghost button--small" type="button" data-mark="${esc(userId)}" data-present="true">Was there in person</button>${excuse(userId, row)}`}</span></div>`;
            })
            .join("")}</div>${statusLine()}</section>`);
    }
    live.innerHTML = parts.join("");
    const again = () => loadAttendance(ritual, true);
    const statusOf = (el) => el.closest(".sp-card")?.querySelector("[data-status]");
    const form = live.querySelector("[data-apology]");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (await UI.busy(form, form.querySelector("[data-status]"), () => D.sendApology(ritual.id, form.elements.note.value).then(() => true), { done: "Sent." })) again();
    });
    form?.querySelector("[data-take-back]")?.addEventListener("click", async (event) => {
      if (await UI.busy(event.currentTarget, form.querySelector("[data-status]"), () => D.sendApology(ritual.id, null).then(() => true))) again();
    });
    live.querySelectorAll("[data-excuse]").forEach((b) =>
      b.addEventListener("click", async () => {
        if (await UI.busy(b, statusOf(b), () => D.excuseAbsence(ritual.id, b.dataset.excuse, b.dataset.excused === "true").then(() => true))) again();
      })
    );
    live.querySelectorAll("[data-mark]").forEach((b) =>
      b.addEventListener("click", async () => {
        if (await UI.busy(b, statusOf(b), () => D.markAttendance(ritual.id, b.dataset.mark, b.dataset.present === "true").then(() => true))) again();
      })
    );
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
    if (editing) global.CovenBuilder?.close?.();
    editing = false;
    if (p.get("ritual") && ["script", "run"].includes(p.get("view"))) {
      const ritual = state.rituals.find((r) => r.id === p.get("ritual"));
      if (ritual) return scriptView(ritual, p.get("view"));
    }
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
    if (editing) global.CovenBuilder?.close?.();
    global.CovenMeeting?.stop?.();
    pane = null;
    extras_ = null;
    extrasKey_ = null;
    editing = false;
    marksFor_ = null;
    attendanceFor_ = null;
    attendancePeople_ = null;
    altars = null;
    contribKey_ = null;
    contribEditing.clear();
    global.clearTimeout(altarTimer);
  }

  global.CovenRituals = { mount, unmount, onChange, onAltarChange };
})(window);
