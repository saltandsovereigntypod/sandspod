/*
 * The members' record (?tab=record, and &member=<id> for one member), and
 * each member's own standing under My path. The website's twin of the app's
 * record/index.tsx, record/[userId].tsx, standing.tsx and
 * components/covens/Record.tsx, summed up by the app's own logic
 * (lib/covens/record.ts, through js/core/covens.js as SaltCore.covens.record).
 *
 * The record: everyone in the coven, least active first, with how many rituals
 * they came to, when they last took part, their studies and their mentoring,
 * and gentle flags. One member: every ritual since they joined, their studies,
 * their mentoring, what else they've done, the leaders' private notes, and
 * messaging, changing position, pausing or removing them (with a reason kept
 * on their record). For the coven's head, the site's moderators and those the
 * head chooses; the database checks every call
 * (supabase/migrations/20261102000000_coven_member_record.sql).
 */
(function (global) {
  "use strict";

  const D = global.CovenData;
  const UI = global.CovenUI;
  const L = global.CovenLogic;
  const { esc } = UI;
  const R = () => global.SaltCore?.covens?.record || null;
  const P = () => global.SaltCore?.covens?.picker || null;

  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const day = (value) => new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const riteDay = (value) => new Date(value).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  const pill = (label, tone) => `<span class="cv-pill${tone ? ` cv-pill--${tone}` : ""}">${esc(label)}</span>`;

  /** Whether this person sees the record (the head, a site moderator, or one the head chose). */
  function seesRecord(state) {
    const r = R();
    if (!r || !state.perms) return false;
    return r.seesRecord({ founder: state.perms.founder, site: state.perms.site, settings: state.recordSettings, membership: state.membership, userId: state.context.user?.id });
  }

  // --- one member's record, as its keepers read it and as the member reads their own ---

  function sectionsHtml(record, state, { marks, logs, showAll } = {}) {
    const r = R();
    const nameOf = (id) => UI.nameOf(state.context, id);
    const me = state.context.user?.id;
    const now = Date.parse(record.now);
    const { rows, summary } = r.recordRituals(record);
    const shown = showAll ? rows : rows.slice(0, 12);
    const whose = record.own ? "Your" : "Their";
    const ritualCard = (x) => {
      const part = r.ritualPartLine(x);
      const held = x.status === "done" || x.status === "live";
      const tone = x.attended === "present" ? "gold" : x.attended === "missed" ? "warn" : "";
      const actions = marks
        ? [
            held && x.present !== true ? `<button class="button button--ghost button--small" type="button" data-mark="${esc(x.id)}" data-present="true">Was there in person</button>` : "",
            held && x.present !== false && x.attended !== "not_recorded" ? `<button class="button button--ghost button--small" type="button" data-mark="${esc(x.id)}" data-present="false">Wasn’t there</button>` : "",
            held && x.corrected ? `<button class="button button--ghost button--small" type="button" data-mark="${esc(x.id)}" data-present="null">Undo the correction</button>` : "",
            x.attended !== "present" ? `<button class="button button--ghost button--small" type="button" data-excuse="${esc(x.id)}" data-excused="${x.excused ? "false" : "true"}">${x.excused ? "Not excused" : "Excuse the absence"}</button>` : ""
          ].join("")
        : "";
      return `<div class="sp-row"><span class="sp-row__text">
          <span class="sp-row__title">${esc(x.title)}</span>
          <span class="sp-row__detail">${esc(riteDay(x.held_at))}</span>
          <span class="cv-meta">${pill(r.ATTENDED_LABEL[x.attended], tone)}${x.rsvp ? pill(r.RSVP_LABEL[x.rsvp]) : ""}${x.corrected ? pill("Marked by a leader") : ""}${x.excused && x.attended !== "excused" ? pill("Excused") : ""}</span>
          ${x.rsvp === "not_going" && x.apology ? `<span class="sp-row__detail">${whose} note: ${esc(x.apology)}</span>` : ""}
          ${part ? `<span class="sp-row__detail">${esc(part)}</span>` : ""}
          ${actions ? `<span class="sp-actions">${actions}</span>` : ""}
        </span></div>`;
    };
    const study = (s) => `<div class="sp-row"><span class="sp-row__text">
        <span class="sp-row__title">${esc(s.title)}</span>
        <span class="cv-meta">${pill(s.kind === "initiation" ? "Initiation" : "Training")}${r.studyStalled(s, now) ? pill("Stalled", "warn") : ""}${s.waiting ? pill("Waiting for sign-off", "gold") : ""}</span>
        <span class="sp-row__detail">${esc(r.studyLine(s))}</span>
        <span class="sp-row__detail">Last moved ${esc(r.agoLabel(s.last_activity || s.started_at, now))} · began ${esc(day(s.started_at))}</span>
      </span></div>`;
    const checkins = (list, hideMentor) =>
      list.length
        ? `<div class="sp-list">${list
            .map((c) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__detail">${esc(r.checkinDate(c.met_on))}${hideMentor ? "" : ` · ${esc(nameOf(c.mentor_id))}`}</span>
              ${c.note ? `<span>${esc(c.note)}</span>` : ""}</span>
              ${c.mentor_id === me ? `<button class="button button--ghost button--small" type="button" data-remove-checkin="${esc(c.id)}">Take it back</button>` : ""}</div>`)
            .join("")}</div>`
        : `<p class="sp-caption">No check-ins logged yet.</p>`;
    const logForm = (menteeId) =>
      `<form class="cv-inline-form" data-log-checkin="${esc(menteeId)}">
        <div class="sp-field"><label for="ck-day-${esc(menteeId)}">Met on</label><input id="ck-day-${esc(menteeId)}" name="met_on" type="date" required value="${esc(r.todayIso())}" max="${esc(r.todayIso())}" /></div>
        <div class="sp-field"><label for="ck-note-${esc(menteeId)}">How it went (optional)</label><textarea id="ck-note-${esc(menteeId)}" name="note" maxlength="${r.NOTE_MAX}"></textarea></div>
        <button class="button button--ghost button--small" type="submit">Log the check-in</button>${statusLine()}</form>`;
    const a = record.activity;
    return `<section class="sp-section"><h2>Rituals</h2>
        <p>${esc(r.attendanceLine(summary, "since joining"))}</p>
        ${summary.unrecorded ? `<p class="sp-caption">Attendance was kept from ${esc(day(record.attendance_since))}. Before that, what they answered and did in each ritual still shows.</p>` : ""}
        ${rows.length ? `<div class="sp-list">${shown.map(ritualCard).join("")}</div>` : `<p class="sp-caption">No rituals since joining.</p>`}
        ${rows.length > 12 ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-show-all>${showAll ? "Show fewer" : `Show all ${rows.length}`}</button></div>` : ""}
      </section>
      <section class="sp-section"><h2>Studies</h2>
        ${record.studies.length ? `<div class="sp-list">${record.studies.map(study).join("")}</div>` : `<p class="sp-caption">Not in any initiation or training.</p>`}
      </section>
      <section class="sp-section"><h2>Mentoring</h2>
        <p>${record.mentor ? `Mentored by ${esc(nameOf(record.mentor.mentor_id))} since ${esc(day(record.mentor.assigned_at))}` : "No mentor"}</p>
        ${record.mentor ? (record.checkins_hidden ? `<p class="sp-caption">${whose} mentor’s check-ins are kept for the coven’s head.</p>` : checkins(record.checkins)) : ""}
        ${record.mentees
          .map((m) => `<div class="sp-card"><h3>Mentoring ${esc(nameOf(m.user_id))}</h3>
            <p class="sp-caption">Since ${esc(day(m.assigned_at))} · ${m.checkins.length ? `${m.checkins.length} ${m.checkins.length === 1 ? "check-in" : "check-ins"}, the last ${esc(r.agoLabel(m.checkins[0].met_on, now))}` : "no check-ins yet"}</p>
            ${m.studies.map((s) => `<p class="sp-caption">${esc(s.title)}: ${esc(r.studyLine(s))}</p>`).join("")}
            ${checkins(m.checkins, true)}
            ${logs ? logForm(m.user_id) : ""}</div>`)
          .join("")}
      </section>
      <section class="sp-section"><h2>${record.own ? "Other ways you’ve taken part" : "Other ways they’ve taken part"}</h2>
        <p>Tended ${a.tendings} ${a.tendings === 1 ? "petition" : "petitions"}${a.last_tending ? `, the last ${esc(r.agoLabel(a.last_tending, now))}` : ""}</p>
        <p>${a.messages} ${a.messages === 1 ? "message" : "messages"} in the coven’s chat${a.last_message ? `, the last ${esc(r.agoLabel(a.last_message, now))}` : ""}</p>
        <p class="sp-caption">Counts only. What was said, and one-to-one and group conversations, aren’t part of the record.</p>
      </section>`;
  }

  /** Wire a drawn record's buttons and forms; `after` reloads it. */
  function wireSections(holder, record, state, { after, toggleAll }) {
    const status = () => holder.querySelector("[data-record-status]");
    const run = async (button, work) => {
      if (await UI.busy(button, status(), () => work().then(() => true))) after();
    };
    holder.querySelectorAll("[data-mark]").forEach((b) =>
      b.addEventListener("click", () => run(b, () => D.markAttendance(b.dataset.mark, record.user_id, b.dataset.present === "null" ? null : b.dataset.present === "true")))
    );
    holder.querySelectorAll("[data-excuse]").forEach((b) => b.addEventListener("click", () => run(b, () => D.excuseAbsence(b.dataset.excuse, record.user_id, b.dataset.excused === "true"))));
    holder.querySelectorAll("[data-remove-checkin]").forEach((b) => b.addEventListener("click", () => run(b, () => D.removeCheckin(b.dataset.removeCheckin))));
    holder.querySelector("[data-show-all]")?.addEventListener("click", toggleAll);
    holder.querySelectorAll("[data-log-checkin]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const metOn = R().cleanCheckinDate(form.elements.met_on.value);
        if (!metOn) return UI.setStatus(form.querySelector("[data-status]"), "Choose a day on or before today.", true);
        if (await UI.busy(form, form.querySelector("[data-status]"), () => D.logCheckin(state.coven.id, form.dataset.logCheckin, metOn, form.elements.note.value).then(() => true))) after();
      })
    );
  }

  const namesIn = (record) => [record.user_id, record.mentor?.mentor_id, ...record.checkins.map((c) => c.mentor_id), ...record.mentees.map((m) => m.user_id), ...record.notes.map((n) => n.author_id), ...record.removals.map((x) => x.removed_by)];

  // --- My standing (in My path) ----------------------------------------------

  const CovenStanding = {
    async mount(holder, state) {
      if (!R()) return (holder.innerHTML = `<p class="sp-notice">This part of the coven couldn’t load. Please refresh the page.</p>`);
      holder.innerHTML = `<p class="sp-caption">Gathering your record…</p>`;
      let showAll = false;
      const draw = async () => {
        let record;
        try {
          record = await D.memberRecord(state.coven.id, state.context.user.id);
        } catch (error) {
          holder.innerHTML = `<p class="sp-caption">${esc(L.errorMessage(error))}</p>`;
          return;
        }
        await UI.loadNames(state.context, namesIn(record));
        const flags = R().recordFlags(record, Date.parse(record.now));
        holder.innerHTML = `<p>The coven’s head, and those they choose, keep a record of how each member takes part: which rituals you came to or sent word about, how your studies and mentoring are going, and how much else you’ve done. This is what they see of yours. They never see what you wrote privately, or your own conversations.</p>
          ${flags.length ? `<div class="sp-card"><p class="sp-caption">What the record notices</p>${flags.map((f) => `<p>${esc(f)}</p>`).join("")}</div>` : ""}
          ${sectionsHtml(record, state, { logs: state.standing?.ok, showAll })}
          <p class="cv-status" role="status" aria-live="polite" data-record-status></p>`;
        wireSections(holder, record, state, { after: draw, toggleAll: () => ((showAll = !showAll), draw()) });
      };
      await draw();
    }
  };

  // --- the record ------------------------------------------------------------

  let pane = null;
  let state = null;
  let api = null;

  const CovenRecord = {
    async mount(el, s, a) {
      pane = el;
      state = s;
      api = a;
      pane.innerHTML = `<p class="sp-caption">Opening the record…</p>`;
      if (!R() || !P()) return (pane.innerHTML = `<p class="sp-notice">This part of the coven couldn’t load. Please refresh the page.</p>`);
      const member = new URLSearchParams(global.location.search).get("member");
      if (member) return memberPage(member);
      return overview();
    },
    unmount() {
      pane = null;
    }
  };

  const recordHref = (member) => `${api.covenHref("record")}${member ? `&member=${encodeURIComponent(member)}` : ""}`;

  async function overview() {
    const r = R();
    const p = P();
    const { coven, context, perms } = state;
    const head = perms.founder || perms.site;
    const members = await D.members(coven.id).catch(() => []);
    const active = members.filter((m) => m.status === "active");
    await UI.loadNames(context, active.map((m) => m.user_id));
    const nameOf = (id) => UI.nameOf(context, id);
    const entries = p.whoEntries(state.ranks, active.map((m) => ({ id: m.user_id, name: nameOf(m.user_id) })), { coven: false });
    const viewerEntries = entries.filter((e) => e.key !== `user:${coven.founder_id}`);
    let range = r.DEFAULT_RANGE;
    let who = [];
    let data = null;
    let viewers = p.cleanAssignees(state.recordSettings?.record_viewers || []);

    pane.innerHTML = `<p>Who has been taking part, and who hasn’t, least active first. Open someone for every ritual, their studies and their mentoring.</p>
      <div class="sp-grid-2">
        <div class="sp-field"><label for="rec-range">Over</label><select id="rec-range" data-range>${r.RANGES.map((x) => `<option value="${esc(x.value)}"${x.value === range ? " selected" : ""}>${esc(x.label)}</option>`).join("")}</select></div>
        <div data-who></div>
      </div>
      <div data-rows><p class="sp-caption">Gathering the record…</p></div>
      ${head ? `<section class="sp-card" data-keepers>
          <h2>Who keeps the record</h2>
          <p class="sp-caption">You, as the coven’s head, always see it, as do the Salt &amp; Sovereignty moderators. Choose positions and people who see it too. No one sees their own leader notes.</p>
          <div data-viewers></div>
          <label class="cv-check"><input type="checkbox" data-mentees-see ${state.recordSettings?.mentees_see_checkins ? "checked" : ""} /> <span>Mentees read their mentor’s check-ins (off: only the mentor and those who keep the record read them)</span></label>
          <div class="sp-actions"><button class="button button--primary button--small" type="button" data-save-keepers>Save</button></div>
          ${statusLine()}</section>` : ""}`;

    const rowsEl = pane.querySelector("[data-rows]");
    const drawRows = () => {
      if (!pane) return;
      if (!data) return;
      const now = Date.parse(data.now);
      const phrase = r.rangePhrase(range);
      const rows = r.overviewRows(data, who, now);
      rowsEl.innerHTML = rows.length
        ? `<div class="sp-list">${rows
            .map((x) => {
              const rank = state.ranks.find((k) => k.id === x.rankId);
              return `<a class="sp-row" href="${esc(recordHref(x.userId))}" data-tab="record"><span class="sp-row__text">
                  <span class="sp-row__title">${esc(nameOf(x.userId))}${x.userId === context.user?.id ? " (you)" : ""}${rank ? ` <span class="sp-muted">· ${esc(rank.name)}</span>` : ""}</span>
                  <span>${esc(r.attendanceLine(x.attendance, phrase))}</span>
                  <span class="sp-row__detail">Last took part ${esc(r.agoLabel(x.lastActive, now))} · joined ${esc(day(x.joinedAt))}</span>
                  <span class="sp-row__detail">${esc(r.studiesLine(x.studies))}</span>
                  <span class="sp-row__detail">${esc(r.mentorLine(x, nameOf, now))}</span>
                  ${x.flags.length ? `<span class="cv-meta">${x.flags.map((f) => pill(f, "warn")).join("")}</span>` : ""}
                </span></a>`;
            })
            .join("")}</div>
          <p class="sp-caption">Attendance has been kept since ${esc(day(data.attendance_since))}: someone counts as there when they open the ritual while it’s under way, and leaders can correct it. Earlier rituals show what people answered and did instead.</p>`
        : `<p class="sp-caption">No one matches.</p>`;
    };
    const load = async () => {
      rowsEl.innerHTML = `<p class="sp-caption">Gathering the record…</p>`;
      try {
        data = await D.recordOverview(coven.id, r.sinceFor(range));
        await UI.loadNames(context, [...data.members.map((m) => m.user_id), ...data.mentors.map((m) => m.mentor_id)]);
        drawRows();
      } catch (error) {
        rowsEl.innerHTML = `<p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
      }
    };

    pane.querySelector("[data-range]").addEventListener("change", (event) => {
      range = event.target.value;
      load();
    });
    global.CovenPicker.create(pane.querySelector("[data-who]"), {
      id: "record-who",
      label: "Only these",
      placeholder: "A position or a name",
      empty: "Everyone.",
      chips: () => who.map((x) => ({ key: p.assigneeKey(x), label: p.assigneeLabel(x, state.ranks, nameOf) })),
      search: (q, picked) => p.searchEntries(entries, q, { limit: 8, picked, suggestions: p.whoSuggestions(entries, 3) }),
      onAdd: (entry) => {
        who = p.cleanAssignees([...who, p.assigneeFromKey(entry.key)]);
        drawRows();
      },
      onRemove: (key) => {
        who = who.filter((x) => p.assigneeKey(x) !== key);
        drawRows();
      }
    });
    const keepers = pane.querySelector("[data-keepers]");
    if (keepers) {
      global.CovenPicker.create(keepers.querySelector("[data-viewers]"), {
        id: "record-viewers",
        label: "Who also sees the record",
        placeholder: "Maiden, Elder, Rowan…",
        empty: "Only you.",
        chips: () => viewers.map((x) => ({ key: p.assigneeKey(x), label: p.assigneeLabel(x, state.ranks, nameOf) })),
        search: (q, picked) => p.searchEntries(viewerEntries, q, { limit: 8, picked, suggestions: p.whoSuggestions(viewerEntries, 3) }),
        onAdd: (entry) => (viewers = p.cleanAssignees([...viewers, p.assigneeFromKey(entry.key)])),
        onRemove: (key) => (viewers = viewers.filter((x) => p.assigneeKey(x) !== key))
      });
      keepers.querySelector("[data-save-keepers]").addEventListener("click", async (event) => {
        const saved = await UI.busy(event.currentTarget, keepers.querySelector("[data-status]"), () => D.setRecordViewers(coven.id, viewers, keepers.querySelector("[data-mentees-see]").checked), { done: "Saved." });
        if (saved) state.recordSettings = saved;
      });
    }
    await load();
  }

  async function memberPage(userId) {
    const r = R();
    const { coven, context, perms } = state;
    const me = context.user?.id;
    let showAll = false;
    const draw = async () => {
      let record;
      try {
        record = await D.memberRecord(coven.id, userId);
      } catch (error) {
        if (pane) pane.innerHTML = `<p><a href="${esc(recordHref())}" data-tab="record">← Members’ record</a></p><p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
        return;
      }
      await UI.loadNames(context, namesIn(record));
      if (!pane) return;
      const name = UI.nameOf(context, userId);
      const now = Date.parse(record.now);
      const rank = state.ranks.find((k) => k.id === record.rank_id);
      const muted = record.muted_until && new Date(record.muted_until).getTime() > now;
      const levelOf = (id, rankId) => (id === coven.founder_id ? 1000 : state.ranks.find((k) => k.id === rankId)?.level || 0);
      const manageable = record.status === "active" && userId !== me && (perms.site || (userId !== coven.founder_id && levelOf(userId, record.rank_id) < perms.level));
      const grantable = L.grantableRanks(state.ranks, perms);
      const flags = r.recordFlags(record, now);
      const notes = record.keeper && !record.own
        ? `<section class="sp-section"><h2>Leaders’ notes</h2>
            <p class="sp-caption">Private: only those who keep the record read these. ${esc(name)} never sees them.</p>
            ${record.notes.map((n) => `<div class="sp-card"><p>${esc(n.body)}</p><p class="sp-caption">${esc(UI.nameOf(context, n.author_id))} · ${esc(r.agoLabel(n.created_at, now))}</p>
              ${n.author_id === me || perms.founder || perms.site ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-remove-note="${esc(n.id)}">Remove the note</button></div>` : ""}</div>`).join("")}
            <form class="sp-card" data-add-note><div class="sp-field"><label for="rec-note">Add a note</label><textarea id="rec-note" name="body" maxlength="${r.NOTE_MAX}" required></textarea></div>
              <div class="sp-actions"><button class="button button--ghost button--small" type="submit">Save the note</button></div>${statusLine()}</form>
          </section>`
        : "";
      const removals = record.removals.length
        ? `<section class="sp-section"><h2>Removed before</h2>${record.removals.map((x) => `<p class="sp-caption">${esc(day(x.created_at))}: ${x.status === "banned" ? "banned" : "removed"} by ${esc(UI.nameOf(context, x.removed_by))}${x.reason ? `. “${esc(x.reason)}”` : ""}</p>`).join("")}</section>`
        : "";
      const actions = !record.own && record.status === "active"
        ? `<section class="sp-section"><h2>What you can do</h2>
            <div class="sp-actions"><button class="button button--ghost" type="button" data-message ${state.standing?.ok ? "" : "disabled"}>Message ${esc(name)}</button></div>
            ${manageable ? `<form class="cv-inline-form" data-member-form>
              ${grantable.length && (perms.review || perms.site) ? `<div class="sp-field"><label>Position<select name="rank_id">${grantable.map((k) => `<option value="${esc(k.id)}"${k.id === record.rank_id ? " selected" : ""}>${esc(k.name)}</option>`).join("")}</select></label></div>
                <button class="button button--ghost button--small" type="submit" data-act="rank">Change position</button>` : ""}
              ${perms.moderate || perms.site ? `<div class="sp-field"><label>Pause messages<select name="mute"><option value="">—</option><option value="24">1 day</option><option value="168">1 week</option><option value="720">30 days</option>${muted ? `<option value="clear">Lift the pause</option>` : ""}</select></label></div>
                <button class="button button--ghost button--small" type="submit" data-act="mute">Apply</button>
                <div class="sp-field"><label for="rec-reason">Why (optional, kept with their record)</label><textarea id="rec-reason" name="reason" maxlength="${r.REASON_MAX}"></textarea></div>
                <button class="button button--ghost button--small" type="submit" data-act="removed">Remove from coven</button>
                <button class="button button--ghost button--small" type="submit" data-act="banned">Ban from coven</button>` : ""}
            </form>` : ""}
            ${statusLine()}</section>`
        : "";
      pane.innerHTML = `<p><a href="${esc(recordHref())}" data-tab="record">← Members’ record</a></p>
        <h2>${esc(name)}</h2>
        <div class="cv-meta">${userId === coven.founder_id ? pill("Founder", "gold") : ""}${rank ? pill(rank.name) : ""}${record.status !== "active" ? pill({ left: "Left", banned: "Banned", removed: "Removed" }[record.status] || record.status, "warn") : ""}${muted ? pill("Messages paused", "warn") : ""}</div>
        <p class="sp-caption">Joined ${esc(day(record.joined_at))}</p>
        ${flags.length ? `<div class="sp-card">${flags.map((f) => `<p>${esc(f)}</p>`).join("")}</div>` : ""}
        <p class="cv-status" role="status" aria-live="polite" data-record-status></p>
        ${sectionsHtml(record, state, { marks: record.marks_attendance, showAll })}
        ${notes}${removals}${actions}`;
      wireSections(pane, record, state, { after: draw, toggleAll: () => ((showAll = !showAll), draw()) });

      pane.querySelector("[data-add-note]")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (await UI.busy(form, form.querySelector("[data-status]"), () => D.addMemberNote(coven.id, userId, form.elements.body.value).then(() => true))) draw();
      });
      pane.querySelectorAll("[data-remove-note]").forEach((b) =>
        b.addEventListener("click", async () => {
          if (await UI.busy(b, pane.querySelector("[data-record-status]"), () => D.removeMemberNote(b.dataset.removeNote).then(() => true))) draw();
        })
      );
      pane.querySelector("[data-message]")?.addEventListener("click", async (event) => {
        const made = await UI.busy(event.currentTarget, pane.querySelector("[data-record-status]"), () => D.openDirect(coven.id, userId));
        if (made?.id) global.location.assign(`${api.covenHref("gathering")}&thread=${encodeURIComponent(made.id)}`);
      });
      const form = pane.querySelector("[data-member-form]");
      form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const act = event.submitter?.dataset.act;
        const status = form.parentElement.querySelector("[data-status]");
        let work = null;
        if (act === "rank") work = () => D.updateMember(coven.id, userId, { rank_id: form.elements.rank_id.value });
        if (act === "mute") {
          const value = form.elements.mute.value;
          if (!value) return UI.setStatus(status, "Choose how long to pause their messages.", true);
          work = () => D.updateMember(coven.id, userId, value === "clear" ? { clear_mute: true } : { muted_until: new Date(Date.now() + Number(value) * 3600000).toISOString() });
        }
        if (act === "removed" || act === "banned") {
          const reason = form.elements.reason.value;
          const ok = await UI.confirmAction(
            act === "banned" ? `Ban ${name} from the coven?` : `Remove ${name} from the coven?`,
            `${act === "banned" ? "They won’t be able to rejoin or apply again." : "They can apply again later."}${reason.trim() ? " Your reason is kept with their record." : ""}`,
            act === "banned" ? "Ban" : "Remove"
          );
          if (!ok) return;
          work = () => D.removeMember(coven.id, userId, act, reason);
        }
        if (work && (await UI.busy(form, status, () => work().then(() => true), { done: "Done." }))) draw();
      });
    };
    pane.innerHTML = `<p class="sp-caption">Opening their record…</p>`;
    await draw();
  }

  global.CovenRecord = CovenRecord;
  global.CovenStanding = CovenStanding;
  global.CovenRecordAccess = { seesRecord };
})(window);
