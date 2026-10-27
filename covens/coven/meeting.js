/*
 * A coven meeting on the website, the twin of the app's
 * components/covens/meeting/MeetingScreen.tsx. Its rules are the app's own
 * (lib/covens/meetings.ts through js/core/covens.js) and it makes the same
 * calls as the app's lib/covens/meetingApi.ts, against
 * supabase/migrations/20261107000200_coven_meetings.sql.
 *
 * Who it is for, its agenda, and while it's under way the item in hand: its
 * time, who has the floor (a speaking flag for voice later), a motion
 * seconded and amended, the vote the Chair calls (with its threshold and
 * quorum), an election, a round, the roll call, the Secretary's notes and
 * "Add an action". Its own chat sits beside it (below, and foldable, on a
 * narrow screen), apart from the coven's chat and its unread counts. When it
 * ends the minutes are written into the Book's Meeting minutes shelf. The
 * coven's head chooses who reads the whole chat afterwards.
 *
 *   CovenMeeting.draw(pane, ritual, { state, api, editHref, navigate, reloadSteps })
 *   CovenMeeting.stop()
 *   CovenMeeting.fetchDefaults(covenId)
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;

  const core = () => global.SaltCore?.covens || {};
  const M = () => core().meetings;
  const B = () => core().builder;
  const S = () => core().script;
  const P = () => core().picker;
  const F = () => core().fields;
  const T = () => core().thread;

  const db = () => {
    if (!global.db) throw new Error("The Sanctuary’s connection isn’t ready. Please refresh the page.");
    return global.db;
  };
  async function run(promise) {
    const { data, error } = await promise;
    if (error) throw error;
    return data;
  }
  const rpc = (name, args) => run(db().rpc(name, args));
  const ACTION_FIELDS = "id,ritual_id,coven_id,step_id,body,assignees,due_on,status,done_by,done_at,created_by,created_at";

  // The same calls as the app (lib/covens/meetingApi.ts).
  const Api = {
    state: (id) => run(db().from("coven_meeting_state").select("*").eq("ritual_id", id).maybeSingle()).catch(() => null),
    messages: (id) => run(db().from("coven_meeting_messages").select("*").eq("ritual_id", id).order("created_at", { ascending: false }).limit(300)).then((rows) => (rows || []).reverse()),
    send: (ritualId, covenId, body) => run(db().from("coven_meeting_messages").insert({ ritual_id: ritualId, coven_id: covenId, body }).select().single()),
    removeMessage: (id) => rpc("remove_coven_meeting_message", { p_message: id }),
    actions: (covenId) => run(db().from("coven_meeting_actions").select(ACTION_FIELDS).eq("coven_id", covenId).order("created_at").limit(1000)).catch(() => []),
    setChat: (ritualId, what, minutes) => rpc("set_coven_meeting_chat", { p_ritual: ritualId, p_what: what, p_minutes: minutes || 15 }),
    setFloor: (ritualId, userId) => rpc("set_coven_meeting_floor", { p_ritual: ritualId, p_user: userId || null }),
    raiseHand: (ritualId, up) => rpc("raise_coven_meeting_hand", { p_ritual: ritualId, p_up: Boolean(up) }),
    setNotes: (stepId, notes) => rpc("set_coven_meeting_notes", { p_step: stepId, p_notes: notes }),
    second: (stepId, on) => rpc("second_coven_meeting_motion", { p_step: stepId, p_on: Boolean(on) }),
    amend: (stepId, text) => rpc("propose_coven_meeting_amendment", { p_step: stepId, p_text: String(text || "").trim() }),
    decide: (stepId, amendmentId, status) => rpc("decide_coven_meeting_amendment", { p_step: stepId, p_amendment: amendmentId, p_status: status }),
    callVote: (stepId) => rpc("call_coven_meeting_vote", { p_step: stepId }),
    extend: (stepId, minutes) => rpc("extend_coven_meeting_item", { p_step: stepId, p_minutes: minutes }),
    addAction: (ritualId, stepId, body, assignees, due) => rpc("add_coven_meeting_action", { p_ritual: ritualId, p_step: stepId || null, p_body: String(body || "").trim(), p_assignees: assignees, p_due: due || null }),
    setAction: (actionId, status) => rpc("set_coven_meeting_action", { p_action: actionId, p_status: status }),
    removeAction: (actionId) => rpc("remove_coven_meeting_action", { p_action: actionId }),
    setReaders: (ritualId, readers) => rpc("set_coven_meeting_chat_readers", { p_ritual: ritualId, p_readers: readers }),
    setDefaults: (covenId, readers) => rpc("set_coven_meeting_defaults", { p_coven: covenId, p_readers: readers }),
    saveMinutes: (ritualId, title, blocks, view) => rpc("save_coven_meeting_minutes", { p_ritual: ritualId, p_title: String(title).slice(0, 200), p_blocks: blocks, p_view: view || null }),
    fetchDefaults: (covenId) => run(db().from("coven_ritual_settings").select("meeting_chat_readers").eq("coven_id", covenId).maybeSingle()).then((row) => row?.meeting_chat_readers ?? null)
  };

  let pane = null;
  let ritual = null;
  let ctx = null;
  let cur = null;
  let channel = null;
  let timer = null;
  let attached = null;
  // Open forms (notes, an action, an amendment) keep what's typed while the page redraws.
  const drafts = {};

  const state = () => ctx.state;
  const me = () => state().context.user?.id || null;
  const nameOf = (id) => UI.nameOf(state().context, id);
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const btn = (label, act, extra = "", cls = "button--ghost button--small") => `<button class="button ${cls}" type="button" data-mt="${act}" ${extra}>${esc(label)}</button>`;
  const chip = (label, act, attrs, on) => `<button type="button" class="sp-chip${on ? " is-active" : ""}" data-mt="${act}" ${attrs} aria-pressed="${Boolean(on)}">${esc(label)}</button>`;
  const attr = (o) => Object.entries(o).map(([k, v]) => `data-${k}="${esc(v)}"`).join(" ");
  const ritualHref = (id) => `${ctx.api.covenHref("rituals")}&ritual=${encodeURIComponent(id)}`;

  const planOf = () => B().cleanPlan(ritual.plan, "meeting");
  const rows = () => L.orderSteps(state().ritualSteps, ritual.id);
  const stepsOf = () => rows().map((s) => B().builderStepFrom(s, planOf()));
  const viewer = () => ({ userId: me(), membership: state().membership, head: Boolean(state().coven.founder_id && state().coven.founder_id === me()), site: Boolean(state().perms.site) });
  const standingOk = () => Boolean(state().standing?.ok);
  const leads = () => Boolean((state().perms.lead && standingOk()) || state().perms.site);
  const powers = () => M().meetingPowers(ritual, { ...viewer(), leads: leads(), standing: standingOk() });
  const keys = () => M().historyKeys(ritual.chat_readers, cur?.defaults);
  const access = () => M().chatAccess(ritual, cur?.state, keys(), { ...viewer(), standing: standingOk() }, Date.now());

  // --- loading -------------------------------------------------------------

  async function load(fresh) {
    const id = ritual.id;
    const covenId = state().coven.id;
    const [st, msgs, acts, votes, att, prep] = await Promise.all([
      Api.state(id),
      Api.messages(id).catch(() => []),
      Api.actions(covenId),
      D.ritualVotes(id),
      ritual.status === "draft" ? Promise.resolve([]) : D.attendance(id).catch(() => []),
      D.ritualPrep(id)
    ]);
    if (!cur || cur.id !== id) return;
    Object.assign(cur, { state: M().cleanState(st, id), messages: msgs, actions: acts, votes, attendance: att, prep, loaded: true });
    if (fresh || !cur.members) {
      const [members, pages, defaults] = await Promise.all([D.members(covenId).catch(() => []), D.bookPages(covenId).catch(() => []), Api.fetchDefaults(covenId).catch(() => null)]);
      if (!cur || cur.id !== id) return;
      Object.assign(cur, { members: members.filter((x) => x.status === "active"), pages, defaults });
    }
    const people = [
      ...msgs.map((x) => x.user_id),
      ...att.map((a) => a.user_id),
      cur.state.floor_user,
      ...cur.state.hands,
      ...(cur.members || []).map((x) => x.user_id),
      ...acts.flatMap((a) => P().cleanAssignees(a.assignees).filter((x) => x.kind === "user").map((x) => x.id)),
      ...votes.flatMap((v) => (v.ballots || []).map((b) => b.user_id))
    ].filter(Boolean);
    await UI.loadNames(state().context, people);
    render();
  }

  function subscribe() {
    unsubscribe();
    if (!global.db?.channel) return;
    const id = ritual.id;
    channel = global.db.channel(`meeting:${id}`);
    for (const table of ["coven_meeting_messages", "coven_meeting_state", "coven_meeting_actions"]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table, filter: `ritual_id=eq.${id}` }, (change) => {
        if (!cur || cur.id !== id) return;
        if (table === "coven_meeting_messages" && change.new?.id) {
          cur.messages = L.applyChange(cur.messages || [], { eventType: change.eventType, new: change.new });
          UI.loadNames(state().context, [change.new.user_id]).then(renderChat);
        } else load(false);
      });
    }
    channel.subscribe();
  }
  function unsubscribe() {
    if (channel && global.db?.removeChannel) global.db.removeChannel(channel);
    channel = null;
  }

  // --- drawing ---------------------------------------------------------------

  function draw(el, r, c) {
    pane = el;
    ritual = r;
    ctx = c;
    if (!attached || attached !== el) {
      el.addEventListener("click", onClick);
      el.addEventListener("submit", onSubmit);
      el.addEventListener("input", onInput);
      attached = el;
    }
    const key = `${r.status}:${r.current_step_id || ""}`;
    if (!cur || cur.id !== r.id) {
      cur = { id: r.id, key, chatOpen: true, loaded: false };
      subscribe();
      global.clearInterval(timer);
      timer = global.setInterval(() => {
        const typing = pane && pane.contains(global.document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(global.document.activeElement.tagName);
        if (!typing) render();
      }, 30000);
      if (r.status === "live" && state().perms.member) D.recordPresence(r.id).then((row) => row && load(false));
      render();
      load(true);
      return;
    }
    if (cur.key !== key) {
      cur.key = key;
      load(false);
    }
    render();
  }

  function stop() {
    unsubscribe();
    global.clearInterval(timer);
    timer = null;
    cur = null;
    if (attached) {
      attached.removeEventListener("click", onClick);
      attached.removeEventListener("submit", onSubmit);
      attached.removeEventListener("input", onInput);
    }
    attached = null;
  }

  // Still showing this meeting (the tab may have moved on to the list or another ritual)?
  const showing = () => Boolean(pane && ritual && pane.isConnected && new URLSearchParams(global.location.search).get("ritual") === ritual.id && !new URLSearchParams(global.location.search).get("edit"));

  function render() {
    if (!pane || !cur || !ritual || !M()) return;
    if (!showing()) return stop();
    const y = global.scrollY;
    const log = pane.querySelector("[data-mt-log]");
    const stick = !log || log.scrollHeight - log.scrollTop - log.clientHeight < 60;
    pane.innerHTML = html();
    mountPickers();
    mountSend();
    const next = pane.querySelector("[data-mt-log]");
    if (next && stick) next.scrollTop = next.scrollHeight;
    global.scrollTo(0, y);
  }

  function renderChat() {
    if (!showing()) return stop();
    const holder = pane?.querySelector("[data-mt-chat]");
    if (!holder) return render();
    const log = holder.querySelector("[data-mt-log]");
    const stick = !log || log.scrollHeight - log.scrollTop - log.clientHeight < 60;
    const typed = holder.querySelector("textarea")?.value || "";
    holder.innerHTML = chatHtml();
    const area = holder.querySelector("textarea");
    if (area) area.value = typed;
    const next = holder.querySelector("[data-mt-log]");
    if (next && stick) next.scrollTop = next.scrollHeight;
  }

  const timeWords = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "");

  function html() {
    const plan = planOf();
    const steps = stepsOf();
    const raw = rows();
    const pw = powers();
    const live = ritual.status === "live";
    const current = steps.find((s) => s.key === ritual.current_step_id) || null;
    const currentRow = raw.find((s) => s.id === ritual.current_step_id) || null;
    const at = current ? steps.indexOf(current) : -1;
    const item = current ? cur.state?.items?.[current.key] : undefined;
    const ranks = state().ranks;
    const whoCtx = { roles: plan.roles, ranks, nameOf };
    const mine = (cur.actions || []).filter((a) => a.ritual_id === ritual.id);
    const outstanding = M().outstandingActions(cur.actions || [], state().rituals, ritual);
    const sum = L.rsvpSummary(state().rsvps, ritual.id, me());
    const myAttendance = (cur.attendance || []).find((a) => a.user_id === me());
    const head = viewer().head || state().perms.site;
    const pageTitle = (pid) => {
      const p = (cur.pages || []).find((x) => x.id === pid);
      return p ? (p.hidden ? "A page you can’t open" : p.title) : "A page of the Book";
    };
    const voteRow = (key) => (cur.votes || []).find((v) => v.step_id === key);
    const canMark = (a) => pw.keepsNotes || (standingOk() && M().actionIsMine(a, state().membership, me()));

    const main = `
      <header class="sp-section">
        <h2>${esc(ritual.title)}</h2>
        <div class="cv-meta"><span class="cv-pill${live ? " cv-pill--warn" : ""}">${esc(live ? "Under way" : ritual.status === "scheduled" ? "On the calendar" : ritual.status === "done" ? "Done" : ritual.status === "cancelled" ? "Cancelled" : "Draft")}</span><span class="cv-pill">Meeting</span>${ritual.audience ? `<span class="cv-pill">Kept to some</span>` : ""}${ritual.scheduled_for ? `<span class="cv-pill">${esc(timeWords(ritual.scheduled_for))}</span>` : ""}</div>
        <p class="sp-caption">For: ${esc(M().audienceLabel(ritual.audience, ranks, nameOf))}</p>
        ${ritual.intention ? `<p class="gd-intro">Purpose: ${esc(ritual.intention)}</p>` : ""}
        ${ritual.description ? `<div class="cv-doc">${prose(ritual.description)}</div>` : ""}
        ${plan.roles.length ? `<p class="sp-label">Roles</p><ul class="cv-script__list">${plan.roles.map((r) => `<li>${esc(B().roleLabel(r, { ranks, nameOf }))}</li>`).join("")}</ul>` : ""}
      </header>
      ${ritual.status === "scheduled" && state().perms.member ? `<section class="sp-card"><p class="sp-label">Will you be there?</p>
          ${standingOk() ? `<div class="sp-chips">${[["going", "Going"], ["maybe", "Maybe"], ["not_going", "Can’t make it"]].map(([v, l]) => chip(l, "rsvp", attr({ value: v }), sum.mine === v)).join("")}</div>` : ""}
          <p class="sp-caption">${[`${sum.going.length} going`, sum.maybe.length ? `${sum.maybe.length} maybe` : "", sum.notGoing.length ? `${sum.notGoing.length} can’t make it` : ""].filter(Boolean).join(" · ")}</p>
          ${sum.mine === "not_going" && standingOk() ? `<form data-mt-form="apology"><div class="sp-field"><label for="mt-apology">A note for the leaders (optional)</label><textarea id="mt-apology" name="note" maxlength="280">${esc(myAttendance?.apology || "")}</textarea></div><div class="sp-actions"><button class="button button--ghost button--small" type="submit">${myAttendance?.apology ? "Change the note" : "Send the note"}</button></div></form>` : ""}
          ${statusLine()}</section>` : ""}
      ${plan.checklist.length && ["scheduled", "draft"].includes(ritual.status) ? `<section class="sp-card"><p class="sp-label">Before the meeting</p>${plan.checklist
          .map((c) => {
            const row = (cur.prep || []).find((r) => r.item_id === c.id);
            return `<div class="cv-prep"><label class="cv-check"><input type="checkbox" data-mt-prep="${esc(c.id)}"${row?.mine ? " checked" : ""}${state().perms.member && standingOk() ? "" : " disabled"} /><span>${esc(c.text)}</span></label>${row ? `<p class="sp-caption">${esc(B().prepLine(row.done, sum.going.length + sum.maybe.length))}</p>` : ""}</div>`;
          })
          .join("")}${statusLine()}</section>` : ""}
      ${outstanding.length ? `<section class="sp-section"><h3>Outstanding from last time</h3>${actionList(outstanding, canMark, false)}</section>` : ""}
      ${live && current && currentRow ? currentHtml({ plan, steps, current, currentRow, at, item, pw, voteRow, mine, outstanding }) : live ? `<p class="sp-notice">The meeting is under way.</p>` : ""}
      ${ritual.status === "done" ? minutesHtml(pw, plan) : ""}
      ${mine.length ? `<section class="sp-section"><h3>Actions</h3>${actionList(mine, canMark, pw.keepsNotes)}</section>` : ""}
      ${ritual.status === "done" && pw.keepsNotes ? addActionHtml(null) : ""}
      ${head ? historyHtml(plan) : `<p class="sp-caption">Afterwards, the whole chat is read by: ${esc(lower(M().historyLabel(keys(), plan, ranks, nameOf)))}. Everyone else has the minutes.</p>`}
      <section class="sp-section"><h3>The agenda</h3>${steps.length
        ? plan.sections
            .map((section) => {
              const list = steps.filter((s) => s.section === section.id);
              if (!list.length) return "";
              return `<p class="sp-label">${esc(section.name)}</p><ol class="cv-steps">${list
                .map((s) => {
                  const row = raw.find((x) => x.id === s.key);
                  const now = s.key === ritual.current_step_id;
                  const vote = B().isVoteAction(s.action) ? voteRow(s.key) : null;
                  const notes = cur.state?.items?.[s.key]?.notes;
                  const pages = (s.details.fields || {}).pages;
                  return `<li class="cv-step${now ? " is-current" : ""}${row?.completed_at ? " is-done" : ""}"><div class="cv-step__head"><span class="cv-step__n" aria-hidden="true">${row?.completed_at ? "✓" : steps.indexOf(s) + 1}</span><div class="cv-step__title"><h3>${esc(B().stepSummary(s, whoCtx))}</h3></div></div>
                    ${notes && !now ? `<p class="sp-caption">Notes: ${esc(notes)}</p>` : ""}
                    ${vote?.closed ? `<p class="sp-caption">${esc(M().stepResult(s, vote.counts).line)}</p>` : ""}
                    ${Array.isArray(pages) && pages.length ? `<p class="sp-caption">Papers: ${esc(pages.map(pageTitle).join(", "))}</p>` : ""}</li>`;
                })
                .join("")}</ol>`;
            })
            .join("")
        : `<p class="sp-empty">Nothing on the agenda yet.</p>`}</section>
      ${(leads() || pw.steers) && !["done", "cancelled"].includes(ritual.status) ? `<div class="sp-actions">
          ${!live && leads() ? btn("Start the meeting", "start", raw.length ? "" : "disabled", "button--primary") : ""}
          ${live && pw.steers && !(current && at === steps.length - 1) ? btn("End the meeting", "end") : ""}
          ${!live && leads() ? `<a class="button button--ghost" href="${esc(ctx.editHref(ritual.id))}" data-tab="rituals">Edit the meeting</a>` : ""}
          ${!live && leads() && ritual.status === "draft" && (state().perms.schedule || state().perms.site) ? btn("Put it on the calendar", "status", 'data-to="scheduled"') : ""}
          ${!live && leads() && ritual.status === "scheduled" ? btn("Cancel the meeting", "status", 'data-to="cancelled"') : ""}
        </div>${!live && !leads() && pw.steers ? `<p class="sp-caption">Those who lead the coven’s rituals start the meeting; then you chair it.</p>` : ""}${statusLine()}` : ""}
      ${!live && ritual.status === "scheduled" ? `<div data-mt-send></div>` : ""}`;

    return `<p><a class="sp-back" href="${esc(ctx.api.covenHref("rituals"))}" data-tab="rituals">← All rituals</a></p>
      <div class="cv-meeting">
        <div class="cv-meeting__main">${main}</div>
        <aside class="cv-meeting__chat sp-card" aria-label="The meeting’s chat">
          <div class="cv-inline-form"><p class="sp-label">The meeting’s chat</p><span class="cv-grow"></span><button type="button" class="cv-linkish cv-meeting__fold" data-mt="fold">${cur.chatOpen ? "Fold it away" : "Show it"}</button></div>
          <div data-mt-chat ${cur.chatOpen ? "" : 'class="cv-meeting__folded"'}>${chatHtml()}</div>
        </aside>
      </div>`;
  }

  const lower = (text) => text.charAt(0).toLowerCase() + text.slice(1);

  function currentHtml({ plan, steps, current, currentRow, at, item, pw, voteRow, mine, outstanding }) {
    const section = plan.sections.find((s) => s.id === current.section);
    const timerNow = M().itemTimer(currentRow.started_at, current.duration_minutes, item?.extra_minutes || 0, Date.now());
    const scripted = S().buildScript({ title: ritual.title, kind: "meeting", plan, steps, ctx: { ranks: state().ranks, nameOf }, pages: cur.pages || [], viewer: { membership: state().membership, userId: me() } }).sections.flatMap((x) => x.steps).find((x) => x.key === current.key);
    const floor = M().floorState(cur.state, me(), nameOf);
    const present = (cur.attendance || []).filter((a) => a.present).map((a) => a.user_id);
    const canAsk = pw.open && standingOk() && state().perms.member;
    const fields = current.details.fields || {};
    const values = F().cleanValues(B().specsOf(current), fields);
    const called = M().voteCalled(current, item);
    const row = voteRow(current.key);
    const secret = fields.ballot === "secret";
    const options = F().voteOptions(values);
    const canVote = standingOk() && pw.open && S().mayVote(current, plan, { membership: state().membership, userId: me() });
    const audienceMembers = (cur.members || []).filter((x) => M().inAudience(ritual, { userId: x.user_id, membership: x, head: x.user_id === state().coven.founder_id }));
    const others = present.filter((id) => id !== floor.holder && !floor.queue.includes(id));
    const turn = currentRow.turn_mode === "in_turn" ? B().turnState(currentRow.turn_order || [], currentRow.turn_at || 0) : null;
    const whoKey = (k) => (k.startsWith("role:") ? (plan.roles.find((r) => `role:${r.id}` === k) || {}).name || "A role" : nameOf(P().assigneeFromKey(k)?.id || ""));
    const notesKey = `notes:${current.key}`;
    return `<section class="sp-card sp-card--gold" aria-label="The item under way">
        <p class="sp-eyebrow">Item ${at + 1} of ${steps.length}${section ? ` · ${esc(section.name)}` : ""}</p>
        <h2>${esc(current.title)}</h2>
        ${timerNow ? `<p class="sp-caption${timerNow.over ? " cv-over" : ""}">${esc(timerNow.line)}</p>` : ""}
        ${current.instructions ? `<div class="cv-doc">${prose(current.instructions)}</div>` : ""}
        ${scripted ? `${scripted.facts.map((f) => `<p class="sp-caption">${esc(f)}</p>`).join("")}${scripted.lines.map((l) => `<div class="cv-script__line${l.mine ? " is-mine" : ""}"><p class="cv-script__who">${esc(l.who)}${l.mine ? " · you" : ""}</p><blockquote class="cv-doc cv-spoken">${prose(l.words)}</blockquote></div>`).join("")}` : ""}
        <div class="cv-floor" data-speaking="${floor.speaking}" aria-label="${esc(floor.line)}"><p>${esc(floor.line)}</p>
          ${floor.queue.length ? `<p class="sp-caption">Asking for the floor: ${esc(floor.queue.map(nameOf).join(", "))}</p>` : ""}
          <div class="sp-actions">${canAsk && !floor.speaking ? btn(floor.handUp ? "Put my hand down" : "Ask for the floor", "hand", attr({ up: floor.handUp ? "0" : "1" })) : ""}
            ${pw.steers ? floor.queue.map((id) => btn(`Give the floor to ${nameOf(id)}`, "floor", attr({ user: id }))).join("") : ""}
            ${pw.steers && floor.holder ? btn("Take the floor back", "floor", 'data-user=""') : ""}</div>
          ${pw.steers && others.length && !floor.holder ? `<p class="sp-label">Give the floor to</p><div class="sp-chips">${others.map((id) => chip(nameOf(id), "floor", attr({ user: id }), false)).join("")}</div>` : ""}
        </div>
        ${current.action === "motion" ? `<div class="sp-card"><p class="sp-label">The motion</p><div class="cv-doc">${prose(String(fields.motion || ""))}</div>
            ${Array.isArray(fields.proposer) && fields.proposer.length ? `<p class="sp-caption">Proposed by ${esc(fields.proposer.map(whoKey).join(", "))}</p>` : ""}
            <p class="sp-caption">${item?.seconded_by ? `Seconded by ${esc(item.seconded_by === me() ? "you" : nameOf(item.seconded_by))}` : "Not seconded yet"}</p>
            ${M().maySecond(current, item, me(), standingOk() && pw.open) ? btn(item?.seconded_by === me() ? "Take back my seconding" : "Second it", "second", attr({ on: item?.seconded_by === me() ? "0" : "1" })) : ""}
            ${(item?.amendments || []).map((a) => `<p>Amendment${a.by ? ` from ${esc(nameOf(a.by))}` : ""}: ${esc(a.text)} <span class="sp-caption">(${a.status === "accepted" ? "accepted" : a.status === "rejected" ? "set aside" : "proposed"})</span></p>
              ${pw.steers && !item?.vote_called_at && a.status === "proposed" ? `<div class="sp-actions">${btn("Accept it", "decide", attr({ id: a.id, status: "accepted" }))}${btn("Set it aside", "decide", attr({ id: a.id, status: "rejected" }))}</div>` : ""}`).join("")}
            ${standingOk() && pw.open && !item?.vote_called_at ? `<form data-mt-form="amend"><div class="sp-field"><label for="mt-amend">Propose an amendment</label><textarea id="mt-amend" name="text" maxlength="1000" data-mt-draft="amend" placeholder="Every second month instead">${esc(drafts.amend || "")}</textarea></div><div class="sp-actions"><button class="button button--ghost button--small" type="submit">Propose it</button></div></form>` : ""}
          </div>` : ""}
        ${B().isVoteAction(current.action) && !called ? `<p class="sp-caption">${current.action === "election" ? "Voting opens when the Chair calls it." : "The vote opens when the Chair calls it."}</p>
            ${pw.steers ? btn("Call the vote", "call", current.action === "motion" && !item?.seconded_by ? "disabled" : "", "button--ghost") : ""}
            ${pw.steers && current.action === "motion" && !item?.seconded_by ? `<p class="sp-caption">A motion needs a seconder before the vote.</p>` : ""}` : ""}
        ${B().isVoteAction(current.action) && called ? `<div class="sp-card"><p class="sp-label">${secret ? "A secret ballot" : "An open vote"}</p>
            ${current.action === "election" ? `<p>Position: ${esc(String(fields.position || ""))}</p>` : fields.motion ? `<div class="cv-doc">${prose(String(fields.motion))}</div>` : ""}
            ${canVote && !row?.closed ? `<div class="sp-chips">${options.map((o) => chip(row?.mine === o ? `${o} (your vote)` : o, "vote", attr({ choice: o }), row?.mine === o)).join("")}</div><p class="sp-caption">${row?.mine ? "You can change your vote until it closes." : "Choose one."}</p>` : !row?.closed ? `<p class="sp-caption">This vote is for those named on it.</p>` : ""}
            <p class="sp-caption">${row ? `${row.total} ${row.total === 1 ? "vote" : "votes"} cast.` : ""}</p>
            ${row?.counts ? `<p>${esc(row.closed ? M().stepResult(current, row.counts).line : options.map((o) => `${o}: ${row.counts[o] || 0}`).join(" · "))}</p>` : ""}
            ${!secret && row?.ballots?.length ? `<p class="sp-caption">${esc(row.ballots.map((b) => `${nameOf(b.user_id)}: ${b.choice}`).join(" · "))}</p>` : ""}
            ${pw.steers && !row?.closed ? btn("Close the vote", "close-vote") : ""}</div>` : ""}
        ${turn ? `<div class="sp-card"><p class="sp-label">${turn.done ? "Everyone has had their turn" : `Turn ${turn.position} of ${turn.total}`}</p>
            ${!turn.done && turn.current ? `<p><strong>${esc(turn.current === me() ? "Your turn" : `${nameOf(turn.current)}’s turn`)}</strong></p>` : ""}
            <div class="sp-actions">${turn.current === me() && !turn.done ? btn("I’ve done mine", "turn", 'data-skip="0"') : ""}${pw.steers && !turn.done && turn.current !== me() ? btn("Next person", "turn", 'data-skip="1"') : ""}</div></div>` : ""}
        ${current.action === "roll_call" ? `<div class="sp-card"><p class="sp-label">Roll call</p>${audienceMembers
            .map((x) => {
              const a = (cur.attendance || []).find((r) => r.user_id === x.user_id);
              const line = a?.present ? "Here" : a?.apology ? `Sent apologies: “${a.apology}”` : a?.present === false ? "Not here" : "Not here yet";
              return `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(nameOf(x.user_id))}</span><span class="sp-row__detail">${esc(line)}</span></span>${pw.keepsNotes ? btn(a?.present ? "Not here" : "Here", "roll", attr({ user: x.user_id, here: a?.present ? "0" : "1" })) : ""}</div>`;
            })
            .join("")}</div>` : ""}
        ${current.action === "review_actions" && !outstanding.length ? `<p class="sp-caption">Nothing is outstanding from last time.</p>` : ""}
        ${pw.keepsNotes ? `<form data-mt-form="notes"><div class="sp-field"><label for="mt-notes">The Secretary’s notes for this item</label><textarea id="mt-notes" name="notes" maxlength="8000" data-mt-draft="${esc(notesKey)}" placeholder="What was said, and what was agreed">${esc(drafts[notesKey] ?? item?.notes ?? "")}</textarea></div><div class="sp-actions"><button class="button button--ghost button--small" type="submit">Keep the notes</button></div></form>` : item?.notes ? `<div class="cv-doc">${prose(`Notes: ${item.notes}`)}</div>` : ""}
        ${pw.keepsNotes ? addActionHtml(current.key) : ""}
        ${mine.filter((a) => a.step_id === current.key).length ? actionList(mine.filter((a) => a.step_id === current.key), () => pw.keepsNotes, false) : ""}
        ${pw.steers ? `<div class="sp-actions">${at > 0 ? btn("Back an item", "back", attr({ to: steps[at - 1].key })) : ""}${btn("Five more minutes", "extend")}${at < steps.length - 1 ? btn("Next item", "next", "", "button--primary button--small") : btn("End the meeting", "end", "", "button--primary button--small")}</div>` : `<p class="sp-caption">The Chair moves the meeting on.</p>`}
        ${statusLine()}
      </section>`;
  }

  function minutesHtml(pw, plan) {
    const page = cur.state?.minutes_page_id;
    const view = plan.meeting?.minutes_view || "audience";
    return `<section class="sp-card"><p class="sp-label">The minutes</p>
        ${page ? `<p>The minutes are in the coven’s Book, under Meeting minutes${pw.keepsNotes ? ". The Chair and Secretary can change them there, and every change is kept." : "."}</p><div class="sp-actions"><a class="button button--ghost button--small" href="${esc(`${ctx.api.covenHref("book")}&page=${encodeURIComponent(page)}`)}" data-tab="book">Read the minutes</a></div>`
          : `<p>${pw.keepsNotes ? "The minutes haven’t been written into the Book yet." : "The minutes will be in the coven’s Book, under Meeting minutes."}</p>`}
        ${pw.keepsNotes ? `<div class="sp-actions">${btn(page ? "Write the minutes again from the meeting" : "Write the minutes", "minutes")}</div>
          ${ritual.audience ? `<p class="sp-label">Who reads the minutes</p><div class="sp-chips">${chip("Those it was for", "minutes", 'data-view="audience"', view === "audience")}${chip("The whole coven", "minutes", 'data-view="coven"', view === "coven")}</div>` : ""}
          ${page ? `<p class="sp-caption">Writing them again replaces the page with what the meeting recorded. Changes made in the Book stay in its history.</p>` : ""}` : ""}
        ${statusLine()}</section>`;
  }

  function addActionHtml(stepId) {
    const k = `action:${stepId || "after"}`;
    if (!drafts[k]) return `<div class="sp-actions">${btn("Add an action", "action-open", attr({ step: stepId || "" }))}</div>`;
    const d = drafts[k];
    return `<form class="sp-card" data-mt-form="action" data-step="${esc(stepId || "")}"><p class="sp-label">An action</p>
        <div class="sp-field"><label for="mt-act-body">What is to be done</label><input id="mt-act-body" name="body" maxlength="500" data-mt-draft="${esc(k)}:body" value="${esc(d.body || "")}" placeholder="Book the hall for Yule" /></div>
        <div data-mt-picker="${esc(k)}"></div>
        <div class="sp-field"><label for="mt-act-due">By when (optional)</label><input id="mt-act-due" name="due" type="date" data-mt-draft="${esc(k)}:due" value="${esc(d.due || "")}" /></div>
        <p class="sp-caption">It goes on their To tend list, with a reminder the day before it’s due.</p>
        <div class="sp-actions"><button class="button button--primary button--small" type="submit">Add it</button>${btn("Cancel", "action-cancel", attr({ step: stepId || "" }))}</div>${statusLine()}</form>`;
  }

  function actionList(list, canMark, canRemove) {
    const ranks = state().ranks;
    return `<div class="sp-list">${list
      .map((a) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title"${a.status !== "open" ? ' style="text-decoration: line-through"' : ""}>${esc(M().actionLine({ ...a, due_on: null, status: "open" }, ranks, nameOf))}</span><span class="sp-row__detail">${esc(M().actionDueLine(a, Date.now()))}</span></span>
        <span class="sp-actions">${canMark(a) && a.status === "open" ? btn("Done", "act-status", attr({ id: a.id, to: "done" })) : ""}${canMark(a) && a.status !== "open" ? btn("Open it again", "act-status", attr({ id: a.id, to: "open" })) : ""}${canRemove && a.status === "open" ? btn("Drop it", "act-status", attr({ id: a.id, to: "dropped" })) : ""}${canRemove ? btn("Remove", "act-remove", attr({ id: a.id })) : ""}</span></div>`)
      .join("")}</div>${statusLine()}`;
  }

  function historyHtml(plan) {
    const k = keys();
    return `<section class="sp-card"><p class="sp-label">Who reads the whole chat afterwards</p>
        <p class="sp-caption">Once the meeting is over, only these read its chat. Everyone else it was for has the minutes. You decide, as the coven’s head.</p>
        <div data-mt-history></div>
        <p class="sp-caption">Now: ${esc(M().historyLabel(k, plan, state().ranks, nameOf))}.</p>
        <div class="sp-actions">${ritual.chat_readers ? btn("Follow the coven’s default", "readers-default") : ""}${btn("Make this the coven’s default", "readers-coven")}</div>${statusLine()}</section>`;
  }

  function chatHtml() {
    const a = access();
    const line = M().chatLine(ritual, a, Date.now());
    const shown = (cur.messages || []).map((x) => ({ ...x, hidden: state().context.blocks.includes(x.user_id) }));
    const items = T() ? T().threadItems(shown, me(), true) : [];
    const pw = powers();
    const bubble = (item) => {
      if (item.kind === "time") return `<p class="cv-day">${esc(item.label)}</p>`;
      const m = item.message;
      const own = m.user_id === me();
      const body = m.deleted_at ? `<p class="cv-msg__body cv-msg__body--gone">${m.deleted_by && m.deleted_by !== m.user_id ? "Removed by a moderator." : "Message deleted."}</p>` : m.hidden ? `<p class="cv-msg__body cv-msg__body--gone">A message from someone you’ve blocked.</p>` : `<p class="cv-msg__body">${prose(m.body)}</p>`;
      const canRemove = own || state().perms.moderate || state().perms.site;
      const tools = m.deleted_at || m.hidden ? "" : `<div class="cv-msg__actions">${canRemove ? `<button type="button" data-mt="msg-remove" data-id="${esc(m.id)}">${own ? "Delete" : "Remove"}</button>` : ""}${own ? "" : `<button type="button" data-mt="msg-report" data-id="${esc(m.id)}">Report</button>`}${own || !m.user_id ? "" : `<button type="button" data-mt="msg-block" data-user="${esc(m.user_id)}">Block</button>`}</div>`;
      return `<article class="cv-bubble${item.mine ? " cv-bubble--mine" : ""}${item.first ? " is-first" : ""}${item.last ? " is-last" : ""}">${item.showName ? `<p class="cv-bubble__name">${esc(m.hidden ? "Blocked" : nameOf(m.user_id))}</p>` : ""}<div class="cv-bubble__inner">${body}<time class="cv-bubble__time" datetime="${esc(m.created_at)}">${esc(new Date(m.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }))}</time></div>${tools}</article>`;
    };
    return `<p class="sp-caption">${esc(line)} Only those the meeting is for see this chat. It isn’t part of the coven’s chat.</p>
      ${a.read ? `<div class="cv-chat cv-chat--bubbles cv-meeting__log" role="log" aria-live="polite" aria-relevant="additions" data-mt-log>${!cur.loaded ? `<p class="sp-caption">Opening…</p>` : items.length ? items.map(bubble).join("") : `<p class="sp-empty">No one has written yet.</p>`}</div>
        ${a.write ? `<form class="cv-composer" data-mt-form="send"><label class="sr-only" for="mt-message">Message</label><textarea id="mt-message" name="body" maxlength="2000" rows="2" placeholder="Write to the meeting" required></textarea><button class="button button--primary" type="submit">Send</button></form>` : `<p class="sp-caption">${esc(standingOk() ? line : state().standing?.reasons?.[0] || line)}</p>`}`
        : `<p class="sp-caption">You have the minutes, in the coven’s Book.</p>`}
      ${pw.steers && ritual.status !== "cancelled" ? `<div class="sp-actions">${!a.open ? btn(ritual.status === "done" ? "Open it again for a while" : "Open the chat now", "chat", 'data-what="open"') : `${btn("Close the chat", "chat", 'data-what="close"')}${btn("Fifteen minutes more", "chat", 'data-what="extend"')}`}</div>` : ""}
      ${statusLine()}`;
  }

  // --- sending a notification by hand (covens/coven/notices.js) --------------------

  // Kept across the page's re-renders, so a half-written note survives live updates.
  let sendBox = null;
  function mountSend() {
    const slot = pane.querySelector("[data-mt-send]");
    if (!slot || !global.CovenNotices) return;
    if (!sendBox || sendBox.dataset.ritual !== ritual.id) {
      sendBox = document.createElement("div");
      sendBox.dataset.ritual = ritual.id;
      global.CovenNotices.sendPanel(sendBox, state(), ritual);
    }
    slot.replaceWith(sendBox);
  }

  // --- pickers ---------------------------------------------------------------

  function mountPickers() {
    const Pk = global.CovenPicker;
    if (!Pk || !P()) return;
    const people = (cur.members || []).filter((x) => M().inAudience(ritual, { userId: x.user_id, membership: x, head: x.user_id === state().coven.founder_id })).map((x) => ({ id: x.user_id, name: nameOf(x.user_id) }));
    const entries = P().whoEntries(state().ranks, people, { coven: true });
    const label = (k) => (entries.find((e) => e.key === k) || {}).label || "Someone";
    pane.querySelectorAll("[data-mt-picker]").forEach((holder) => {
      const k = holder.dataset.mtPicker;
      const d = drafts[k];
      if (!d) return;
      Pk.create(holder, {
        id: `mt-who-${k.replace(/[^a-z0-9]/gi, "")}`,
        label: "Who does it",
        placeholder: "A person or a position",
        empty: "No one yet",
        chips: () => (d.who || []).map((a) => ({ key: P().assigneeKey(a), label: label(P().assigneeKey(a)) })),
        search: (q, picked) => P().searchEntries(entries, q, { limit: 8, picked, suggestions: P().whoSuggestions(entries) }),
        onAdd: (entry) => {
          const a = P().assigneeFromKey(entry.key);
          if (a) d.who = a.kind === "coven" ? [a] : P().cleanAssignees([...(d.who || []).filter((x) => x.kind !== "coven"), a]);
        },
        onRemove: (key) => (d.who = (d.who || []).filter((a) => P().assigneeKey(a) !== key))
      });
    });
    const history = pane.querySelector("[data-mt-history]");
    if (history) {
      const plan = planOf();
      const list = M().historyEntries(plan, P().whoEntries(state().ranks, (cur.members || []).map((x) => ({ id: x.user_id, name: nameOf(x.user_id) }))));
      const keyLabel = (k) => M().historyLabel([k], plan, state().ranks, nameOf).replace(/ and the coven’s head$/, "");
      Pk.create(history, {
        id: "mt-history",
        label: "Who reads the whole chat afterwards",
        placeholder: "The Chair, the Elders, Rowan…",
        empty: "Only you",
        chips: () => keys().map((k) => ({ key: k, label: keyLabel(k).replace(/^./, (c) => c.toUpperCase()) })),
        search: (q, picked) => P().searchEntries(list, q, { limit: 8, picked }),
        onAdd: (entry) => setReaders([...new Set([...keys(), entry.key])]),
        onRemove: (key) => setReaders(keys().filter((k) => k !== key))
      });
    }
  }

  async function setReaders(next) {
    try {
      const saved = await Api.setReaders(ritual.id, next);
      ritual.chat_readers = saved;
      render();
    } catch (error) {
      UI.setStatus(pane.querySelector("[data-mt-history]")?.closest(".sp-card")?.querySelector("[data-status]"), L.errorMessage(error), true);
    }
  }

  // --- the minutes -------------------------------------------------------------

  async function writeMinutes(view) {
    const plan = planOf();
    const [record, votes, attendance, actions, st, fresh] = await Promise.all([
      D.ritualRecord(ritual.id),
      D.ritualVotes(ritual.id),
      D.attendance(ritual.id).catch(() => []),
      Api.actions(state().coven.id),
      Api.state(ritual.id),
      D.ritualSteps([ritual.id]).catch(() => rows())
    ]);
    const now = state().rituals.find((r) => r.id === ritual.id) || ritual;
    const pageTitle = (pid) => {
      const p = (cur?.pages || []).find((x) => x.id === pid);
      return p ? (p.hidden ? "A page you can’t open" : p.title) : "A page of the Book";
    };
    const minutes = M().composeMinutes({
      ritual: { ...now, status: "done" },
      steps: L.orderSteps(fresh, ritual.id).map((s) => ({ ...B().builderStepFrom(s, plan), completed_at: s.completed_at, started_at: s.started_at || null })),
      attendees: record?.attendees || attendance.filter((a) => a.present).map((a) => a.user_id),
      apologies: attendance.filter((a) => a.apology || a.excused).map((a) => ({ user_id: a.user_id, note: a.apology || null, excused: Boolean(a.excused) })),
      state: M().cleanState(st, ritual.id),
      votes,
      actions: actions.filter((a) => a.ritual_id === ritual.id),
      outstanding: M().outstandingActions(actions, state().rituals, now),
      ranks: state().ranks,
      nameOf,
      pageTitle
    });
    await Api.saveMinutes(ritual.id, minutes.title, M().minutesPageBlocks(minutes.blocks), view);
  }

  // --- events ------------------------------------------------------------------

  function statusFor(el) {
    return el.closest(".sp-card, section, aside, form")?.querySelector("[data-status]") || pane.querySelector("[data-status]");
  }

  async function act(el, work, done) {
    const ok = await UI.busy(el, statusFor(el), () => Promise.resolve(work()).then(() => true), { done });
    if (ok) {
      await ctx.reloadSteps(ritual.id).catch(() => {});
      await load(false);
    }
    return ok;
  }

  function onInput(event) {
    const el = event.target;
    const key = el.dataset?.mtDraft;
    if (!key) return;
    if (key.startsWith("action:")) {
      const [, step, field] = key.split(":");
      const d = drafts[`action:${step}`];
      if (d) d[field] = el.value;
    } else drafts[key] = el.value;
  }

  async function onClick(event) {
    if (!cur || !ritual) return;
    const el = event.target.closest("[data-mt]");
    if (!el || !pane.contains(el)) return;
    const d = el.dataset;
    const current = ritual.current_step_id;
    switch (d.mt) {
      case "fold":
        cur.chatOpen = !cur.chatOpen;
        return render();
      case "rsvp": {
        const sum = L.rsvpSummary(state().rsvps, ritual.id, me());
        return act(el, () => D.rsvp(ritual.id, d.value === sum.mine ? null : d.value));
      }
      case "start":
        return act(el, () => D.startRitual(ritual.id));
      case "status":
        return act(el, () => D.setRitualStatus(ritual.id, d.to));
      case "hand":
        return act(el, () => Api.raiseHand(ritual.id, d.up === "1"));
      case "floor":
        return act(el, () => Api.setFloor(ritual.id, d.user || null));
      case "second":
        return act(el, () => Api.second(current, d.on === "1"));
      case "decide":
        return act(el, () => Api.decide(current, d.id, d.status));
      case "call":
        return act(el, () => Api.callVote(current));
      case "vote":
        return act(el, () => D.castVote(current, d.choice));
      case "close-vote":
        return act(el, () => D.closeVote(current));
      case "turn":
        return act(el, () => D.nextTurn(current, d.skip === "1"));
      case "roll":
        return act(el, () => D.markAttendance(ritual.id, d.user, d.here === "1"));
      case "extend":
        return act(el, () => Api.extend(current, 5));
      case "back":
        return act(el, () => D.goToStep(ritual.id, d.to));
      case "next":
        return act(el, () => D.finishStep(current));
      case "end": {
        if (!(await UI.confirmAction("End the meeting?", "Items not yet reached are left as they are. The minutes are written into the coven’s Book.", "End it"))) return;
        return act(
          el,
          async () => {
            await D.goToStep(ritual.id, null);
            await writeMinutes(null).catch(() => {});
          },
          "The meeting has ended. Its minutes are in the coven’s Book, under Meeting minutes."
        );
      }
      case "minutes":
        return act(el, () => writeMinutes(d.view || null), d.view === "coven" ? "The whole coven can read the minutes now." : d.view === "audience" ? "Only those it was for can read the minutes now." : "The minutes are in the coven’s Book.");
      case "chat":
        return act(el, () => Api.setChat(ritual.id, d.what, 15));
      case "action-open":
        drafts[`action:${d.step || "after"}`] = { body: "", who: [], due: "" };
        return render();
      case "action-cancel":
        delete drafts[`action:${d.step || "after"}`];
        return render();
      case "act-status":
        return act(el, () => Api.setAction(d.id, d.to));
      case "act-remove":
        return act(el, () => Api.removeAction(d.id));
      case "readers-default":
        return setReaders(null);
      case "readers-coven":
        return act(el, () => Api.setDefaults(state().coven.id, keys()), "This is now the coven’s default for every meeting that hasn’t its own.");
      case "msg-remove": {
        const msg = (cur.messages || []).find((x) => x.id === d.id);
        const own = msg?.user_id === me();
        if (!(await UI.confirmAction(own ? "Delete your message?" : "Remove this message?", own ? "" : "Its words are removed for everyone. If it breaks the guidelines, report it as well so the site moderators keep a copy.", own ? "Delete" : "Remove"))) return;
        if (await UI.busy(el, statusFor(el), () => Api.removeMessage(d.id).then(() => true))) {
          cur.messages = L.applyChange(cur.messages || [], { eventType: "UPDATE", new: { id: d.id, body: "", deleted_at: new Date().toISOString(), deleted_by: me() } });
          renderChat();
        }
        return;
      }
      case "msg-report": {
        const msg = (cur.messages || []).find((x) => x.id === d.id);
        if (msg) UI.report({ target_type: "meeting_message", target_id: msg.id, coven_id: state().coven.id, target_user_id: msg.user_id, label: "this message" });
        return;
      }
      case "msg-block": {
        const who = d.user;
        if (!(await UI.confirmAction(`Block ${nameOf(who)}?`, "You won’t see their messages in any coven. They aren’t told.", "Block"))) return;
        if (await UI.busy(el, statusFor(el), () => D.block(me(), who).then(() => true))) {
          state().context.blocks = [...state().context.blocks, who];
          renderChat();
        }
        return;
      }
    }
  }

  async function onSubmit(event) {
    const form = event.target.closest("[data-mt-form]");
    if (!form || !pane.contains(form) || !cur) return;
    event.preventDefault();
    const kind = form.dataset.mtForm;
    const current = ritual.current_step_id;
    if (kind === "send") {
      const body = String(form.elements.body.value || "").trim();
      if (!body) return;
      const sent = await UI.busy(form, statusFor(form), () => Api.send(ritual.id, state().coven.id, body));
      if (sent) {
        cur.messages = L.applyChange(cur.messages || [], { eventType: "INSERT", new: sent });
        renderChat();
      }
    } else if (kind === "notes") {
      const key = `notes:${current}`;
      if (await act(form, () => Api.setNotes(current, form.elements.notes.value), "Notes kept.")) delete drafts[key];
    } else if (kind === "amend") {
      if (await act(form, () => Api.amend(current, form.elements.text.value))) delete drafts.amend;
    } else if (kind === "apology") {
      await act(form, () => D.sendApology(ritual.id, form.elements.note.value), "Sent.");
    } else if (kind === "action") {
      const k = `action:${form.dataset.step || "after"}`;
      const d = drafts[k] || {};
      const body = String(form.elements.body.value || "").trim();
      if (!body || !(d.who || []).length) return UI.setStatus(statusFor(form), "Say what is to be done and who does it.", true);
      if (await act(form, () => Api.addAction(ritual.id, form.dataset.step || null, body, d.who, form.elements.due.value || null), "Added. It is on their To tend list.")) {
        delete drafts[k];
        render();
      }
    }
  }

  // The checklist before the meeting ticks straight away.
  global.document.addEventListener("change", (event) => {
    const box = event.target;
    if (!pane || !cur || !box?.dataset?.mtPrep || !pane.contains(box)) return;
    act(box, () => D.tickPrep(ritual.id, box.dataset.mtPrep, box.checked));
  });

  global.CovenMeeting = { draw, stop, fetchDefaults: Api.fetchDefaults, ritualHref: (id) => (ctx ? ritualHref(id) : "") };
})(window);
