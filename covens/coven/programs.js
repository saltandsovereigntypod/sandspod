/*
 * A coven's Initiation & training tab: programs the coven designs for itself
 * (stages of detailed tasks), the people going through them, their mentors,
 * and who may see and manage it all.
 *
 *   ?tab=programs                      your programs, and the people you mentor
 *   &view=people                       everyone's progress (those who may see it)
 *   &view=design                       programs, assignments and mentors (program managers)
 *   &edit=<id>|new[&from=<template>]   the program editor
 *   &program=<id>[&person=<user>]      one person's path through one program
 *
 * The rules shared with the app (summaries, who may sign off what, the
 * coven's calendar) are SaltCore.covens.programs, built from
 * app/src/lib/covens/programs.ts. The database checks every action
 * (supabase/migrations/20261027000000_coven_programs.sql).
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;
  const P = () => global.SaltCore?.covens?.programs;

  let pane = null;
  let state = null;
  let helpers = null;
  let data = { programs: [], stages: [], tasks: [], assignments: [], enrollments: [], progress: [], passes: [], members: [], templates: [], docs: [], links: [], reads: [], attempts: [], quizzes: [], unread: [] };
  // Lessons, tests, practice and each step's conversation (covens/coven/course.js).
  const CC = () => global.CovenCourse;
  const ctx = () => ({ pane, state, data, link, go, nav, nameOf, me, mentorOf, load, reload: reloadAndDraw, reloadAndDraw, refreshCounts: () => helpers?.refreshCounts?.() });
  let draft = null;

  const me = () => state.context.user?.id;
  const nameOf = (id) => UI.nameOf(state.context, id);
  const rankName = (id) => state.ranks.find((r) => r.id === id)?.name || "a position";
  const params = () => new URLSearchParams(global.location.search);
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const link = (extra) => `${helpers.covenHref("programs")}${extra ? `&${extra}` : ""}`;
  // Study material: pages of the coven's Book a task links to ([[book:<id>|Title]], SaltCore.grimoire.coven).
  const GC = () => global.SaltCore?.grimoire?.coven;
  const studyText = (text) => (GC() ? GC().withoutStudyLinks(text) : String(text || ""));
  const studyButtons = (text) => {
    const links = GC() ? GC().studyLinks(text) : [];
    return links.length
      ? `<div class="sp-actions">${links.map((l) => `<a class="button button--ghost button--small" href="${esc(`${helpers.covenHref("book")}&page=${encodeURIComponent(l.id)}`)}" data-tab="book">Study: ${esc(l.title)}</a>`).join("")}</div>`
      : "";
  };
  let studyPages = null;
  if (typeof document !== "undefined") {
    document.addEventListener("focusin", async (event) => {
      const select = event.target.closest?.("[data-study-link]");
      if (!select || select.dataset.filled || !state) return;
      select.dataset.filled = "1";
      studyPages = studyPages || (await global.CovenData.bookPages(state.coven.id).catch(() => []));
      const list = studyPages.filter((p) => !p.hidden).sort((a, b) => Number(b.section === "Study material") - Number(a.section === "Study material") || a.title.localeCompare(b.title));
      select.innerHTML = `<option value="">Choose a page…</option>${list.map((p) => `<option value="${esc(p.id)}">${esc(p.section ? `${p.title} · ${p.section}` : p.title)}</option>`).join("")}`;
    });
    document.addEventListener("change", (event) => {
      const select = event.target.closest?.("[data-study-link]");
      if (!select || !select.value || !GC()) return;
      const page = (studyPages || []).find((p) => p.id === select.value);
      const area = select.closest(".sp-field")?.querySelector('textarea[name="resources"]');
      if (page && area) {
        const linkText = GC().studyLink(page);
        if (!area.value.includes(linkText)) area.value = `${area.value.trim()}${area.value.trim() ? "\n" : ""}${linkText}`;
        area.dispatchEvent(new Event("input", { bubbles: true }));
      }
      select.value = "";
    });
  }
  const outline = (programId) => P().programOutline(programId, data.stages, data.tasks);
  const program = (id) => data.programs.find((p) => p.id === id);
  const mentorOf = (userId) => P().mentorOf(state.mentors || [], userId);
  const isMentorOf = (userId) => mentorOf(userId) === me();
  const fmtDate = (value) => (value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "");

  async function load() {
    const { coven, perms } = state;
    const [programs, assignments, enrollments, progress, passes, mentors] = await Promise.all([
      D.programs(coven.id).catch(() => []),
      // Members see their own assignments; program managers and progress keepers see them all.
      D.programAssignments(coven.id).catch(() => []),
      D.enrollments(coven.id).catch(() => []),
      D.progress(coven.id).catch(() => []),
      D.stagePasses(coven.id).catch(() => []),
      D.mentors(coven.id).catch(() => [])
    ]);
    const ids = programs.map((p) => p.id);
    const [stages, tasks] = await Promise.all([D.programStages(ids).catch(() => []), D.programTasks(ids).catch(() => [])]);
    const members = perms.programs || perms.progress || perms.site ? await D.members(state.coven.id).catch(() => []) : [];
    const templates = perms.programs ? await D.programTemplates().catch(() => []) : [];
    const course = CC() ? await CC().load(coven, perms, enrollments).catch(() => ({})) : {};
    data = { programs, stages, tasks, assignments, enrollments, progress, passes, members: members.filter((m) => m.status === "active"), templates, docs: [], links: [], reads: [], attempts: [], quizzes: [], unread: [], ...course };
    state.mentors = mentors;
    await UI.loadNames(state.context, [...enrollments.map((e) => e.user_id), ...mentors.flatMap((m) => [m.user_id, m.mentor_id]), ...members.map((m) => m.user_id), ...progress.map((p) => p.checked_by)]);
  }

  // --- pieces ------------------------------------------------------------------

  function bar(percent) {
    return `<div class="cv-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-label="${percent}% done"><span style="width:${percent}%"></span></div>`;
  }

  function nav(active) {
    const items = [{ key: "", label: "My path" }];
    if (state.perms.progress) items.push({ key: "people", label: "Everyone’s progress" });
    if (state.perms.programs) items.push({ key: "design", label: "Design and assign" });
    if (state.perms.programs) items.push({ key: "library", label: "Lessons and tests" });
    if (items.length === 1) return "";
    return `<nav class="cv-subnav" aria-label="Initiation and training">${items
      .map((i) => `<a class="cv-tab cv-tab--small" href="${esc(link(i.key ? `view=${i.key}` : ""))}" data-go${i.key === active ? ' aria-current="page"' : ""}>${esc(i.label)}</a>`)
      .join("")}</nav>`;
  }

  function summaryOf(enrollment) {
    return P().enrollmentSummary(enrollment, outline(enrollment.program_id), data.progress);
  }

  function enrollmentCard(e, { who } = {}) {
    const prog = program(e.program_id);
    if (!prog) return "";
    const s = summaryOf(e);
    const person = who ? `<span class="cv-pill">${esc(nameOf(e.user_id))}</span>` : "";
    const stageLine = e.status === "completed" ? `Finished ${esc(fmtDate(e.completed_at))}` : s.stage ? `Stage ${s.stageIndex + 1} of ${s.stageCount}: ${esc(s.stage.title)}` : "";
    const waiting = s.waiting ? `<span class="cv-pill cv-pill--gold">${s.waiting} waiting for sign-off</span>` : "";
    const ready = s.ready ? `<span class="cv-pill cv-pill--gold">Ready to pass the stage</span>` : "";
    const unread = global.SaltCore?.covens?.training ? global.SaltCore.covens.training.unreadIn(data.unread, e.id) : 0;
    const unreadPill = unread ? `<span class="cv-pill cv-pill--gold">${unread} new message${unread === 1 ? "" : "s"}</span>` : "";
    return `<a class="sp-card cv-program-card" href="${esc(link(`program=${e.program_id}${who ? `&person=${e.user_id}` : ""}`))}" data-go>
        <div class="cv-meta">${person}<span class="cv-pill">${esc(prog.kind === "initiation" ? "Initiation" : "Training")}</span>
          ${e.status !== "active" ? `<span class="cv-pill">${esc(P().ENROLLMENT_STATUS[e.status])}</span>` : ""}${waiting}${ready}${unreadPill}</div>
        <h3>${esc(prog.title)}</h3>
        <p class="sp-caption">${stageLine}${s.daysLeft && e.status === "active" ? ` · at least ${s.daysLeft} more day${s.daysLeft === 1 ? "" : "s"}` : ""}</p>
        ${bar(s.percent)}
        ${s.next && e.status === "active" && !who ? `<p class="sp-caption">Next: ${esc(s.next.title)}</p>` : ""}
      </a>`;
  }

  // --- my path -----------------------------------------------------------------

  function mine() {
    const mineList = data.enrollments.filter((e) => e.user_id === me() && e.status !== "withdrawn");
    const enrolledIds = new Set(data.enrollments.filter((e) => e.user_id === me()).map((e) => e.program_id));
    const membership = state.membership;
    const assignedToMe = (p) => data.assignments.some((a) => a.program_id === p.id && (a.user_id === me() || (a.rank_id && a.rank_id === membership?.rank_id)));
    const canBegin = data.programs.filter((p) => p.status === "open" && !enrolledIds.has(p.id) && (p.self_enroll || assignedToMe(p)));
    const mentees = P().menteesOf(state.mentors || [], me());
    const menteeEnrollments = data.enrollments.filter((e) => mentees.includes(e.user_id) && e.status !== "withdrawn");
    const myMentor = mentorOf(me());
    const K = global.SaltCore?.covens;
    const who = { userId: me(), mentees, programs: state.perms.programs };
    const toSign = P().waitingForMe(data.progress, data.tasks, who);
    const toScore = K?.quiz ? K.quiz.attemptsToScore(data.attempts, who) : [];
    const myUnread = data.unread.filter((u) => u.trainee_id !== me());
    const taskTitle = (id) => data.tasks.find((t) => t.id === id)?.title || "A step";
    const waitingHtml = toSign.length + toScore.length + myUnread.length
      ? `<section class="sp-section"><h2>Waiting for you</h2><ul class="cv-waiting">
          ${toScore.map((a) => `<li><a href="${esc(link(`score=${a.id}`))}" data-go>Score: ${esc(nameOf(a.user_id))}, ${esc(a.title)}</a> <span class="sp-caption">${esc(K.quiz.scoreLine(a))}</span></li>`).join("")}
          ${toSign.map((p) => `<li><a href="${esc(link(`program=${p.program_id}&person=${p.user_id}&task=${p.task_id}`))}" data-go>Sign off: ${esc(nameOf(p.user_id))}, ${esc(taskTitle(p.task_id))}</a> <a class="button button--ghost button--small" href="${esc(link(`thread=${p.task_id}&e=${p.enrollment_id}`))}" data-go>Message ${esc(nameOf(p.user_id))}</a></li>`).join("")}
          ${myUnread.map((u) => `<li><a href="${esc(link(`thread=${u.task_id}&e=${u.enrollment_id}`))}" data-go>${esc(nameOf(u.trainee_id))}: ${esc(taskTitle(u.task_id))}</a> <span class="cv-pill cv-pill--gold">${u.unread} new</span></li>`).join("")}
        </ul></section>`
      : "";
    pane.innerHTML = `${nav("")}${waitingHtml}
      <section class="sp-section"><h2>Your programs</h2>
        ${myMentor ? `<p class="sp-caption">Your mentor is ${esc(nameOf(myMentor))}.</p>` : ""}
        ${mineList.length ? mineList.map((e) => enrollmentCard(e)).join("") : `<p class="sp-empty">You aren’t in any of the coven’s programs yet.${state.perms.programs ? " Design one under Design and assign." : " The coven’s leaders will assign one when it’s time, or you can begin one that’s open to all."}</p>`}
      </section>
      ${canBegin.length ? `<section class="sp-section"><h2>Open to you</h2>${canBegin
        .map((p) => `<article class="sp-card"><div class="cv-meta"><span class="cv-pill">${esc(p.kind === "initiation" ? "Initiation" : "Training")}</span></div>
            <h3>${esc(p.title)}</h3>${p.summary ? `<p>${esc(p.summary)}</p>` : ""}${p.description ? `<details class="sp-details"><summary>About this program</summary><div class="cv-doc">${prose(p.description)}</div></details>` : ""}
            <div class="sp-actions"><button class="button button--primary button--small" type="button" data-begin="${esc(p.id)}" ${state.standing.ok ? "" : "disabled"}>Begin</button></div>${statusLine()}</article>`)
        .join("")}</section>` : ""}
      ${menteeEnrollments.length || mentees.length ? `<section class="sp-section"><h2>People you mentor</h2>
        ${menteeEnrollments.length ? menteeEnrollments.map((e) => enrollmentCard(e, { who: true })).join("") : `<p class="sp-empty">${esc(mentees.map(nameOf).join(", "))} ${mentees.length === 1 ? "isn’t" : "aren’t"} in a program yet.</p>`}
      </section>` : ""}`;
    pane.querySelectorAll("[data-begin]").forEach((button) =>
      button.addEventListener("click", async () => {
        const saved = await UI.busy(button, button.closest("article").querySelector("[data-status]"), () => D.startProgram(button.dataset.begin));
        if (saved) {
          await load();
          go(link(`program=${button.dataset.begin}`));
        }
      })
    );
  }

  // --- one person's path ---------------------------------------------------------

  function path(programId, personId) {
    const prog = program(programId);
    const person = personId || me();
    const self = person === me();
    const e = data.enrollments.find((x) => x.program_id === programId && x.user_id === person);
    if (!prog || !e) {
      pane.innerHTML = `${nav("")}<p class="sp-notice">${self ? "You aren’t in that program." : "That progress isn’t yours to see, or the program has changed."}</p><p><a href="${esc(link(""))}" data-go>Back to Initiation &amp; training</a></p>`;
      return;
    }
    const stages = outline(programId);
    const s = summaryOf(e);
    const rows = new Map(data.progress.filter((p) => p.enrollment_id === e.id).map((p) => [p.task_id, p]));
    const passes = data.passes.filter((p) => p.enrollment_id === e.id);
    const who = { self, mentor: isMentorOf(person), programs: state.perms.programs };
    const mentor = mentorOf(person);

    const taskHtml = (t, stageState) => {
      const row = rows.get(t.id);
      const st = P().taskState(t, row);
      const holiday = P().holidayName(t.holiday);
      const canWork = self && e.status === "active" && stageState !== "later" && !["approved", "submitted"].includes(st.state) && state.standing.ok;
      const canSign = row?.status === "submitted" && P().canCheck(t, who);
      const T = global.SaltCore?.covens?.training;
      const sessions = T ? T.logsSessions(t) : false;
      const allLogged = (row?.times_done || 0) >= t.times;
      const extras = CC() && T ? CC().taskExtras(ctx(), t, e, row, { self, later: stageState === "later", canWork }) : "";
      return `<div class="cv-task cv-task--${st.state}" data-task="${esc(t.id)}">
          <div class="cv-task__head"><span class="cv-task__mark" aria-hidden="true">${st.state === "approved" ? "✓" : st.state === "submitted" ? "…" : "○"}</span>
            <div><h4>${esc(t.title)}${t.optional ? ` <span class="sp-muted">(optional)</span>` : ""}</h4>
              <p class="sp-caption">${esc(P().kindLabel(t.kind))}${t.times > 1 ? ` · ${t.times} times` : ""}${t.minutes ? ` · about ${t.minutes} min` : ""}${holiday ? ` · ${esc(holiday)}` : ""} · signed off by ${esc(P().checkedByLabel(t.checked_by).toLowerCase())} · <strong>${esc(st.label)}</strong></p></div></div>
          ${stageState === "later" ? "" : `${t.instructions ? `<div class="cv-doc">${prose(t.instructions)}</div>` : ""}${studyText(t.resources) ? `<p class="sp-caption"><strong>Resources:</strong> ${prose(studyText(t.resources))}</p>` : ""}${studyButtons(t.resources)}`}
          ${extras}
          ${row?.response ? `<div class="cv-response"><p class="sp-caption">${self ? "What you wrote" : `What ${esc(nameOf(person))} wrote`}</p><div class="cv-doc">${prose(row.response)}</div></div>` : ""}
          ${row?.feedback ? `<p class="cv-feedback"><strong>${row.status === "returned" ? "Sent back" : "Note"}${row.checked_by ? ` from ${esc(nameOf(row.checked_by))}` : ""}:</strong> ${esc(row.feedback)}</p>` : ""}
          ${canWork && sessions && t.response === "text" ? `<form class="sp-section" data-work="${esc(t.id)}">
              <div class="sp-field"><label for="r-${esc(t.id)}">Your answer</label><textarea id="r-${esc(t.id)}" name="response" rows="5" maxlength="8000">${esc(row?.response || "")}</textarea></div>
              <div class="sp-actions"><button class="button button--primary button--small" type="submit" data-count="0">${allLogged ? (t.checked_by === "self" ? "Save and finish" : "Send for sign-off") : "Save my answer"}</button></div>
              ${allLogged ? "" : `<p class="sp-caption">Write as you go. It’s sent once every session is logged.</p>`}${statusLine()}</form>` : ""}
          ${canWork && !sessions && !t.quiz_id ? `<form class="sp-section" data-work="${esc(t.id)}">
              ${t.response === "text" ? `<div class="sp-field"><label for="r-${esc(t.id)}">Your response</label><textarea id="r-${esc(t.id)}" name="response" rows="5" maxlength="8000">${esc(row?.response || "")}</textarea></div>` : ""}
              <div class="sp-actions">
                <button class="button button--primary button--small" type="submit" data-count="1">${t.times > 1 ? `Log one (${st.done + 1} of ${t.times})` : t.checked_by === "self" ? "Mark done" : "Send for sign-off"}</button>
                ${t.response === "text" ? `<button class="button button--ghost button--small" type="submit" data-count="0">Save without sending</button>` : ""}
              </div>${statusLine()}</form>` : ""}
          ${canSign ? `<form class="sp-section" data-sign="${esc(row.id)}">
              <div class="sp-field"><label for="f-${esc(row.id)}">Note to ${esc(nameOf(person))} (optional)</label><textarea id="f-${esc(row.id)}" name="feedback" rows="2" maxlength="2000"></textarea></div>
              <div class="sp-actions"><button class="button button--primary button--small" type="submit" data-approve="1">Sign it off</button><button class="button button--ghost button--small" type="submit" data-approve="0">Send back</button></div>${statusLine()}</form>` : ""}
        </div>`;
    };

    const stageHtml = (stage, index) => {
      const pass = passes.find((p) => p.stage_id === stage.id);
      const stageState = pass ? "passed" : index === s.stageIndex && e.status !== "completed" ? "current" : index < s.stageIndex ? "passed" : "later";
      const canPassIt = stageState === "current" && e.status === "active" && P().canPass(stage, who);
      const passer = P().PASSED_BY.find((x) => x.value === stage.passed_by)?.label.toLowerCase();
      const body = `${stage.intro ? `<div class="cv-doc">${prose(stage.intro)}</div>` : ""}
        <p class="sp-caption">${stage.min_days ? `At least ${stage.min_days} days in this stage. ` : ""}Passed when ${esc(passer)} confirm${stage.passed_by === "self" ? "" : "s"} it.</p>
        ${stage.tasks.map((t) => taskHtml(t, stageState)).join("") || `<p class="sp-empty">No tasks in this stage.</p>`}
        ${stageState === "current" ? `<div class="sp-card cv-stage-gate">
            <p>${s.tasksLeft ? `${s.tasksLeft} task${s.tasksLeft === 1 ? "" : "s"} still to be signed off.` : "Every task is signed off."}${s.daysLeft ? ` At least ${s.daysLeft} more day${s.daysLeft === 1 ? "" : "s"} in this stage.` : ""}</p>
            ${canPassIt ? `<form data-pass><div class="sp-field"><label for="pass-note">A note for ${self ? "your record" : esc(nameOf(person))} (optional)</label><input id="pass-note" name="note" maxlength="2000" /></div>
              <div class="sp-actions">${s.ready ? `<button class="button button--primary button--small" type="submit">${index === stages.length - 1 ? "Confirm they’ve finished" : "Confirm the stage is passed"}</button>` : ""}
              ${state.perms.programs && !self && !s.ready ? `<button class="button button--ghost button--small" type="submit" data-override>Pass the stage early</button>` : ""}</div>${statusLine()}</form>` : ""}
          </div>` : ""}`;
      const label = `Stage ${index + 1}: ${stage.title}`;
      const wanted = params().get("task") && stage.tasks.some((t) => t.id === params().get("task"));
      if (stageState === "current") return `<section class="sp-section cv-stage cv-stage--current"><h3>${esc(label)} <span class="cv-pill cv-pill--gold">Now</span></h3>${body}</section>`;
      return `<details class="sp-details cv-stage cv-stage--${stageState}"${wanted ? " open" : ""}><summary>${esc(label)}${pass ? ` · passed ${esc(fmtDate(pass.passed_at))}${pass.passed_by ? ` (${esc(nameOf(pass.passed_by))})` : ""}` : stageState === "later" ? " · later" : ""}</summary>${body}${pass?.note ? `<p class="sp-caption">“${esc(pass.note)}”</p>` : ""}</details>`;
    };

    const award = prog.award_rank_id ? `Finishing it makes ${self ? "you" : esc(nameOf(person))} ${esc(rankName(prog.award_rank_id))}.` : "";
    pane.innerHTML = `${nav(self ? "" : "people")}
      <p><a href="${esc(link(self ? "" : state.perms.progress ? "view=people" : ""))}" data-go>← ${self ? "Your programs" : "Back"}</a></p>
      <header class="sp-section"><div class="cv-meta"><span class="cv-pill">${esc(prog.kind === "initiation" ? "Initiation" : "Training")}</span><span class="cv-pill">${esc(P().ENROLLMENT_STATUS[e.status])}</span>
        ${self ? "" : `<span class="cv-pill">${esc(nameOf(person))}</span>`}</div>
        <h2>${esc(prog.title)}</h2>
        ${prog.summary ? `<p>${esc(prog.summary)}</p>` : ""}
        <p class="sp-caption">Begun ${esc(fmtDate(e.started_at))} · ${s.approved} of ${s.required} tasks done${mentor ? ` · mentor: ${esc(nameOf(mentor))}` : " · no mentor yet"}${award ? ` · ${award}` : ""}</p>
        ${bar(s.percent)}
        ${prog.description ? `<details class="sp-details"><summary>About this program</summary><div class="cv-doc">${prose(prog.description)}</div></details>` : ""}
      </header>
      ${e.status === "completed" ? `<p class="sp-notice">✦ Finished ${esc(fmtDate(e.completed_at))}.</p>` : ""}
      ${e.status === "paused" ? `<p class="sp-notice">This program is paused for now.</p>` : ""}
      ${stages.map(stageHtml).join("")}
      <div class="sp-actions" data-enrollment-actions>
        ${state.perms.programs && !self && e.status === "active" ? `<button class="button button--ghost button--small" type="button" data-status-to="paused">Pause</button>` : ""}
        ${state.perms.programs && !self && e.status === "paused" ? `<button class="button button--ghost button--small" type="button" data-status-to="active">Resume</button>` : ""}
        ${(state.perms.programs || self) && ["active", "paused"].includes(e.status) ? `<button class="button button--ghost button--small" type="button" data-status-to="withdrawn">${self ? "Step away from this program" : "Withdraw them"}</button>` : ""}
      </div>${statusLine()}`;

    if (CC()) CC().bindExtras(ctx(), e, reloadAndDraw);
    const wantedTask = params().get("task");
    if (wantedTask) pane.querySelector(`[data-task="${CSS.escape(wantedTask)}"]`)?.scrollIntoView?.({ block: "start" });
    pane.querySelectorAll("[data-work]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const count = Number(event.submitter?.dataset.count ?? 1);
        const response = form.elements.response?.value || "";
        const saved = await UI.busy(form, form.querySelector("[data-status]"), () => D.recordTask(e.id, form.dataset.work, response, count), { done: count ? "Saved." : "Saved for later." });
        if (saved) reloadAndDraw();
      })
    );
    pane.querySelectorAll("[data-sign]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const approve = event.submitter?.dataset.approve === "1";
        const saved = await UI.busy(form, form.querySelector("[data-status]"), () => D.checkTask(form.dataset.sign, approve, form.elements.feedback.value));
        if (saved) reloadAndDraw();
      })
    );
    pane.querySelector("[data-pass]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const override = event.submitter?.hasAttribute("data-override");
      if (override && !(await UI.confirmAction("Pass this stage early?", "Tasks not yet signed off, and any time the stage asks for, are set aside.", "Pass it"))) return;
      const saved = await UI.busy(form, form.querySelector("[data-status]"), () => D.passStage(e.id, form.elements.note.value, override));
      if (saved) reloadAndDraw();
    });
    pane.querySelectorAll("[data-status-to]").forEach((button) =>
      button.addEventListener("click", async () => {
        const to = button.dataset.statusTo;
        if (to === "withdrawn" && !(await UI.confirmAction(self ? "Step away from this program?" : `Withdraw ${nameOf(person)}?`, "The work done so far is kept. The program can be taken up again later.", "Step away"))) return;
        const saved = await UI.busy(button, pane.querySelector(":scope > [data-status]"), () => D.setEnrollmentStatus(e.id, to));
        if (saved) reloadAndDraw();
      })
    );
  }

  // --- everyone's progress ---------------------------------------------------------

  function people() {
    if (!state.perms.progress) return mine();
    const filter = params().get("p") || "";
    const list = data.enrollments.filter((e) => (!filter || e.program_id === filter) && e.status !== "withdrawn");
    const rowsHtml = list
      .sort((a, b) => nameOf(a.user_id).localeCompare(nameOf(b.user_id)))
      .map((e) => {
        const prog = program(e.program_id);
        const s = summaryOf(e);
        const mentor = mentorOf(e.user_id);
        return `<tr><td><a href="${esc(link(`program=${e.program_id}&person=${e.user_id}`))}" data-go>${esc(nameOf(e.user_id))}</a></td>
          <td>${esc(prog?.title || "")}</td>
          <td>${e.status === "completed" ? "Finished" : s.stage ? `${s.stageIndex + 1}/${s.stageCount} ${esc(s.stage.title)}` : ""}${e.status === "paused" ? " (paused)" : ""}</td>
          <td>${bar(s.percent)}<span class="sp-caption">${s.percent}%</span></td>
          <td>${s.waiting ? `<span class="cv-pill cv-pill--gold">${s.waiting}</span>` : ""}${s.ready ? ` <span class="cv-pill cv-pill--gold">ready</span>` : ""}</td>
          <td>${mentor ? esc(nameOf(mentor)) : `<span class="sp-muted">none</span>`}</td></tr>`;
      })
      .join("");
    pane.innerHTML = `${nav("people")}
      <section class="sp-section"><h2>Everyone’s progress</h2>
        <div class="sp-field"><label for="pf">Program</label><select id="pf" data-filter><option value="">All programs</option>${data.programs
          .filter((p) => p.status !== "draft")
          .map((p) => `<option value="${esc(p.id)}"${p.id === filter ? " selected" : ""}>${esc(p.title)}</option>`)
          .join("")}</select></div>
        ${list.length ? `<div class="cv-table-wrap"><table class="cv-table"><thead><tr><th>Who</th><th>Program</th><th>Stage</th><th>Progress</th><th>Waiting</th><th>Mentor</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>` : `<p class="sp-empty">No one is in ${filter ? "this program" : "a program"} yet.</p>`}
      </section>`;
    pane.querySelector("[data-filter]").addEventListener("change", (event) => go(link(`view=people${event.target.value ? `&p=${event.target.value}` : ""}`)));
  }

  // --- design and assign ---------------------------------------------------------------

  function design() {
    if (!state.perms.programs) return mine();
    const { suggested, others } = P().templatesFor(data.templates, state.coven);
    const byProgram = (id) => data.enrollments.filter((e) => e.program_id === id && e.status !== "withdrawn");
    const programCard = (p) => {
      const assigned = data.assignments.filter((a) => a.program_id === p.id);
      const enrolled = byProgram(p.id);
      const stages = outline(p.id);
      return `<article class="sp-card" data-program="${esc(p.id)}">
          <div class="cv-meta"><span class="cv-pill">${esc(p.kind === "initiation" ? "Initiation" : "Training")}</span><span class="cv-pill${p.status === "open" ? " cv-pill--gold" : ""}">${esc({ draft: "Draft", open: "Open", archived: "Archived" }[p.status])}</span>
            ${p.self_enroll ? `<span class="cv-pill">Anyone may begin it</span>` : ""}${p.award_rank_id ? `<span class="cv-pill">Leads to ${esc(rankName(p.award_rank_id))}</span>` : ""}</div>
          <h3>${esc(p.title)}</h3>
          <p class="sp-caption">${stages.length} stage${stages.length === 1 ? "" : "s"} · ${stages.reduce((n, s) => n + s.tasks.length, 0)} tasks · ${enrolled.length} ${enrolled.length === 1 ? "person" : "people"} in it</p>
          ${assigned.length ? `<ul class="gd-bullets">${assigned.map((a) => `<li>${esc(P().assignmentLabel(a, rankName, nameOf))} <button class="button button--ghost button--small" type="button" data-unassign="${esc(a.id)}">Stop assigning</button></li>`).join("")}</ul>` : ""}
          ${p.status === "open" ? `<form class="cv-inline-form" data-assign>
              <div class="sp-field"><label for="as-${esc(p.id)}">Assign to</label><select id="as-${esc(p.id)}" name="to">
                <optgroup label="A whole position (now and later)">${state.ranks.map((r) => `<option value="rank:${esc(r.id)}">Everyone who is ${esc(r.name)}</option>`).join("")}</optgroup>
                <optgroup label="A person">${data.members.map((m) => `<option value="user:${esc(m.user_id)}">${esc(nameOf(m.user_id))}</option>`).join("")}</optgroup>
              </select></div>
              <button class="button button--primary button--small" type="submit">Assign</button></form>` : ""}
          <div class="sp-actions">
            <a class="button button--ghost button--small" href="${esc(link(`edit=${p.id}`))}" data-go>Edit</a>
            ${p.status !== "open" ? `<button class="button button--ghost button--small" type="button" data-set="open">Open it</button>` : `<button class="button button--ghost button--small" type="button" data-set="draft">Back to draft</button>`}
            ${p.status !== "archived" ? `<button class="button button--ghost button--small" type="button" data-set="archived">Archive</button>` : ""}
            <button class="button button--ghost button--small" type="button" data-set="deleted">Delete</button>
          </div>${statusLine()}</article>`;
    };
    const templateRow = (t) => `<li><strong>${esc(t.title)}</strong> <span class="sp-caption">${esc(t.summary || "")}</span> <a class="button button--ghost button--small" href="${esc(link(`edit=new&from=${encodeURIComponent(t.id)}`))}" data-go>Use this</a></li>`;
    const membersSorted = [...data.members].sort((a, b) => nameOf(a.user_id).localeCompare(nameOf(b.user_id)));
    pane.innerHTML = `${nav("design")}
      <section class="sp-section"><h2>The coven’s programs</h2>
        ${data.programs.length ? data.programs.map(programCard).join("") : `<p class="sp-empty">No programs yet. Start from a ready-made one or make your own.</p>`}
      </section>
      <section class="sp-section"><h2>Start a program</h2>
        <div class="sp-actions"><a class="button button--primary" href="${esc(link("edit=new&kind=initiation"))}" data-go>✦ Make your own initiation</a><a class="button button--ghost" href="${esc(link("view=library"))}" data-go>Lessons and tests</a><a class="button button--ghost" href="${esc(link("edit=new&kind=training"))}" data-go>Make your own training</a></div>
        <div data-chooser>${CC() ? `<p class="sp-caption">Gathering the ready-made programs…</p>` : `${suggested.length ? `<h3>Suggested for your coven’s calendar</h3><ul class="cv-template-list">${suggested.map(templateRow).join("")}</ul>` : ""}<details class="sp-details"><summary>Ready-made programs</summary><ul class="cv-template-list">${others.map(templateRow).join("")}</ul></details>`}</div>
      </section>
      <section class="sp-section"><h2>Mentors</h2>
        <p class="sp-caption">A mentor sees their mentee’s progress and signs off the tasks and stages left to mentors.</p>
        <div class="cv-table-wrap"><table class="cv-table"><thead><tr><th>Member</th><th>Mentor</th></tr></thead><tbody>${membersSorted
          .map((m) => `<tr><td>${esc(nameOf(m.user_id))}</td><td><select data-mentor-for="${esc(m.user_id)}" aria-label="Mentor for ${esc(nameOf(m.user_id))}"><option value="">No mentor</option>${membersSorted
            .filter((x) => x.user_id !== m.user_id)
            .map((x) => `<option value="${esc(x.user_id)}"${mentorOf(m.user_id) === x.user_id ? " selected" : ""}>${esc(nameOf(x.user_id))}</option>`)
            .join("")}</select></td></tr>`)
          .join("")}</tbody></table></div>${statusLine()}
      </section>`;

    const chooserBox = pane.querySelector("[data-chooser]");
    if (CC()) {
      CC().chooser(ctx(), chooserBox, async (made) => {
        await load();
        if (made.length === 1) return go(link(`edit=${made[0].id}`));
        design();
        const box = pane.querySelector("[data-chooser]");
        box.insertAdjacentHTML("afterbegin", `<p class="sp-notice" role="status">${made.length} programs copied as drafts. Look each one over, then open it.</p>`);
      });
    }
    pane.querySelectorAll("[data-program]").forEach((card) => {
      const id = card.dataset.program;
      const status = card.querySelector("[data-status]");
      card.querySelector("[data-assign]")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const [kind, target] = event.currentTarget.elements.to.value.split(":");
        const n = await UI.busy(event.currentTarget, status, () => D.assignProgram(id, kind === "user" ? target : null, kind === "rank" ? target : null));
        if (n !== undefined) {
          await load();
          design();
          pane.querySelector(`[data-program="${CSS.escape(id)}"] [data-status]`).textContent = `Assigned. ${n} ${n === 1 ? "person" : "people"} enrolled now.`;
        }
      });
      card.querySelectorAll("[data-unassign]").forEach((button) =>
        button.addEventListener("click", async () => {
          if (await UI.busy(button, status, () => D.unassignProgram(button.dataset.unassign))) reloadAndDraw();
        })
      );
      card.querySelectorAll("[data-set]").forEach((button) =>
        button.addEventListener("click", async () => {
          const to = button.dataset.set;
          if (to === "deleted" && !(await UI.confirmAction("Delete this program?", "Everyone’s progress in it is deleted too. Archive it instead to keep the record.", "Delete"))) return;
          if (await UI.busy(button, status, () => D.setProgramStatus(id, to))) reloadAndDraw();
        })
      );
    });
    pane.querySelectorAll("[data-mentor-for]").forEach((select) =>
      select.addEventListener("change", async () => {
        const saved = await UI.busy(select, select.closest("section").querySelector("[data-status]"), () => D.setMentor(state.coven.id, select.dataset.mentorFor, select.value || null).then(() => true), { done: "Saved." });
        if (saved) state.mentors = await D.mentors(state.coven.id).catch(() => state.mentors);
      })
    );
  }

  // --- the editor ------------------------------------------------------------------------

  function holidayOptions(selected) {
    const traditions = global.SaltCore?.covens?.programs?.CALENDAR_TRADITIONS || [];
    const coven = new Set(state.coven.practice_traditions || []);
    const groups = [...traditions].sort((a, b) => Number(coven.has(b.id)) - Number(coven.has(a.id)));
    return `<option value="">None</option>${groups
      .map((t) => `<optgroup label="${esc(t.name)}">${t.holidays.map((h) => `<option value="${esc(`${t.id}/${h.id}`)}"${selected === `${t.id}/${h.id}` ? " selected" : ""}>${esc(h.name)}</option>`).join("")}</optgroup>`)
      .join("")}`;
  }

  function startDraft(id) {
    const p = params();
    if (id !== "new") {
      const prog = program(id);
      if (!prog) return null;
      return { id, program: { ...prog }, stages: P().draftFromOutline(outline(id), { links: data.links, docs: data.docs, quizzes: data.quizzes }) };
    }
    const from = p.get("from");
    const tpl = from ? data.templates.find((t) => t.id === from) : null;
    if (tpl) {
      return {
        id: null,
        program: { kind: tpl.kind, title: tpl.title, summary: tpl.summary, description: tpl.description, template_id: tpl.id, self_enroll: false, award_rank_id: null, status: "draft" },
        stages: JSON.parse(JSON.stringify(tpl.stages))
      };
    }
    const kind = p.get("kind") === "training" ? "training" : "initiation";
    return { id: null, program: { kind, title: "", summary: "", description: "", self_enroll: kind === "training", award_rank_id: null, status: "draft" }, stages: [P().emptyStage()] };
  }

  function editor(id) {
    if (!state.perms.programs) return mine();
    if (!draft || draft.key !== `${id}|${params().get("from") || ""}|${params().get("kind") || ""}`) {
      const fresh = startDraft(id);
      if (!fresh) return (pane.innerHTML = `<p class="sp-notice">That program was not found.</p>`);
      draft = { ...fresh, key: `${id}|${params().get("from") || ""}|${params().get("kind") || ""}` };
    }
    const { program: pr, stages } = draft;
    const opt = (list, value) => list.map((o) => `<option value="${esc(o.value)}"${o.value === value ? " selected" : ""}>${esc(o.label)}</option>`).join("");
    const taskForm = (t, si, ti) => `<fieldset class="cv-task-edit" data-t="${si}:${ti}">
        <legend>Task ${ti + 1}</legend>
        <div class="sp-grid-2">
          <div class="sp-field"><label>Title<input name="title" maxlength="160" value="${esc(t.title)}" required /></label></div>
          <div class="sp-field"><label>Kind<select name="kind">${opt(P().TASK_KINDS, t.kind)}</select></label></div>
        </div>
        <div class="sp-field"><label>Instructions<textarea name="instructions" rows="4" maxlength="8000">${esc(t.instructions || "")}</textarea></label></div>
        <div class="sp-field"><label>Resources (books, links, people to ask)<textarea name="resources" rows="2" maxlength="4000">${esc(t.resources || "")}</textarea></label>
          <label class="sp-caption">Link a page of the coven’s Book (it shows as a button that opens it)<select data-study-link><option value="">Choose a page…</option></select></label></div>
        <div class="sp-grid-2">
          <div class="sp-field"><label>Times to do it<input name="times" type="number" min="1" max="400" value="${esc(t.times || 1)}" /></label></div>
          <div class="sp-field"><label>About how long (minutes)<input name="minutes" type="number" min="0" max="1440" value="${esc(t.minutes ?? "")}" /></label></div>
          <div class="sp-field"><label>Signed off by<select name="checked_by">${opt(P().CHECKED_BY, t.checked_by)}</select></label></div>
          <div class="sp-field"><label>Belongs to a holiday<select name="holiday">${holidayOptions(t.holiday)}</select></label></div>
        </div>
        <label class="cv-check"><input type="checkbox" name="response" ${t.response === "text" ? "checked" : ""} /> <span>They write a response (a reflection, an essay, notes)</span></label>
        <label class="cv-check"><input type="checkbox" name="optional" ${t.optional ? "checked" : ""} /> <span>Optional (not needed to pass the stage)</span></label>
        ${CC() ? CC().taskTeachingFields(ctx(), t, si, ti) : ""}
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-move-task="${si}:${ti}:-1">Move up</button><button class="button button--ghost button--small" type="button" data-move-task="${si}:${ti}:1">Move down</button><button class="button button--ghost button--small" type="button" data-remove-task="${si}:${ti}">Remove task</button></div>
      </fieldset>`;
    const stageForm = (s, si) => `<section class="sp-card cv-stage-edit" data-s="${si}">
        <h3>Stage ${si + 1}</h3>
        <div class="sp-field"><label>Title<input name="title" maxlength="120" value="${esc(s.title)}" required /></label></div>
        <div class="sp-field"><label>What this stage is about<textarea name="intro" rows="3" maxlength="6000">${esc(s.intro || "")}</textarea></label></div>
        <div class="sp-grid-2">
          <div class="sp-field"><label>Least time in the stage (days; a year and a day is 366)<input name="min_days" type="number" min="0" max="1500" value="${esc(s.min_days ?? "")}" /></label></div>
          <div class="sp-field"><label>Who confirms it’s passed<select name="passed_by">${opt(P().PASSED_BY, s.passed_by)}</select></label></div>
        </div>
        <div class="cv-tasks">${s.tasks.map((t, ti) => taskForm(t, si, ti)).join("")}</div>
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-add-task="${si}">Add a task</button>
          <button class="button button--ghost button--small" type="button" data-move-stage="${si}:-1">Move stage up</button><button class="button button--ghost button--small" type="button" data-move-stage="${si}:1">Move stage down</button>
          <button class="button button--ghost button--small" type="button" data-remove-stage="${si}">Remove stage</button></div>
      </section>`;
    pane.innerHTML = `${nav("design")}
      <p><a href="${esc(link("view=design"))}" data-go data-leave-editor>← Design and assign</a></p>
      <form class="sp-section" data-editor novalidate>
        <h2>${draft.id ? "Edit the program" : "A new program"}</h2>
        ${pr.template_id && !draft.id ? `<p class="sp-notice">Starting from a ready-made program. Change anything you like; it’s saved as a draft until you open it.</p>` : ""}
        <div class="sp-card">
          <div class="sp-grid-2">
            <div class="sp-field"><label>Kind<select name="program_kind">${opt(P().PROGRAM_KINDS, pr.kind)}</select></label></div>
            <div class="sp-field"><label>Title<input name="program_title" maxlength="120" value="${esc(pr.title || "")}" required /></label></div>
          </div>
          <div class="sp-field"><label>In a line<input name="program_summary" maxlength="500" value="${esc(pr.summary || "")}" /></label></div>
          <div class="sp-field"><label>About the program (what it is, who it’s for, how it works)<textarea name="program_description" rows="5" maxlength="8000">${esc(pr.description || "")}</textarea></label></div>
          <div class="sp-field"><label>Those who finish it become<select name="award_rank_id" ${state.perms.manage || state.perms.site ? "" : "disabled"}><option value="">(no change of position)</option>${state.ranks.map((r) => `<option value="${esc(r.id)}"${pr.award_rank_id === r.id ? " selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label>
            ${state.perms.manage || state.perms.site ? "" : `<span class="sp-caption">Only the coven’s head chooses this.</span>`}</div>
          <label class="cv-check"><input type="checkbox" name="self_enroll" ${pr.self_enroll ? "checked" : ""} /> <span>Any member may begin it themselves (otherwise only those you assign)</span></label>
        </div>
        <div data-stages>${stages.map(stageForm).join("")}</div>
        <div class="sp-actions"><button class="button button--ghost" type="button" data-add-stage>Add a stage</button></div>
        <div class="sp-actions"><button class="button button--primary" type="submit" data-save="draft">Save as draft</button><button class="button button--primary" type="submit" data-save="open">Save and open</button></div>
        ${statusLine()}
      </form>`;

    const form = pane.querySelector("[data-editor]");
    const read = () => {
      const f = form.elements;
      // Stage and task fields are named title, kind…, so the program's own are program_title and so on.
      Object.assign(pr, { kind: f.program_kind.value, title: f.program_title.value, summary: f.program_summary.value, description: f.program_description.value, award_rank_id: f.award_rank_id.value || null, self_enroll: f.self_enroll.checked });
      form.querySelectorAll("[data-s]").forEach((section) => {
        const s = stages[Number(section.dataset.s)];
        const q = (name) => section.querySelector(`:scope > .sp-field [name="${name}"], :scope > .sp-grid-2 [name="${name}"]`);
        s.title = q("title").value;
        s.intro = q("intro").value;
        s.min_days = q("min_days").value === "" ? null : Number(q("min_days").value);
        s.passed_by = q("passed_by").value;
        section.querySelectorAll("[data-t]").forEach((fs) => {
          const [, ti] = fs.dataset.t.split(":").map(Number);
          const t = s.tasks[ti];
          const v = (name) => fs.querySelector(`[name="${name}"]`);
          Object.assign(t, {
            title: v("title").value,
            kind: v("kind").value,
            instructions: v("instructions").value,
            resources: v("resources").value,
            times: Number(v("times").value) || 1,
            minutes: v("minutes").value === "" ? null : Number(v("minutes").value),
            checked_by: v("checked_by").value,
            holiday: v("holiday").value || null,
            response: v("response").checked ? "text" : "none",
            optional: v("optional").checked
          });
        });
      });
    };
    const move = (list, index, by) => {
      const to = index + by;
      if (to < 0 || to >= list.length) return;
      [list[index], list[to]] = [list[to], list[index]];
    };
    if (CC()) CC().bindTaskTeaching(form, ctx(), stages, read, () => editor(id));
    form.addEventListener("click", (event) => {
      const b = event.target.closest("button");
      if (!b || b.type === "submit" || b.closest("[data-teach]")) return;
      read();
      if (b.hasAttribute("data-add-stage")) stages.push(P().emptyStage());
      else if (b.dataset.addTask) stages[Number(b.dataset.addTask)].tasks.push(P().emptyTask());
      else if (b.dataset.removeStage) stages.splice(Number(b.dataset.removeStage), 1);
      else if (b.dataset.removeTask) {
        const [si, ti] = b.dataset.removeTask.split(":").map(Number);
        stages[si].tasks.splice(ti, 1);
      } else if (b.dataset.moveStage) {
        const [si, by] = b.dataset.moveStage.split(":").map(Number);
        move(stages, si, by);
      } else if (b.dataset.moveTask) {
        const [si, ti, by] = b.dataset.moveTask.split(":").map(Number);
        move(stages[si].tasks, ti, by);
      } else return;
      editor(id);
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      read();
      const status = event.submitter?.dataset.save === "open" ? "open" : "draft";
      const errors = P().validateProgram({ title: pr.title, status }, stages);
      const statusEl = form.querySelector("[data-status]");
      if (errors.length) return UI.setStatus(statusEl, errors.slice(0, 4).join(" "), true);
      const payload = { kind: pr.kind, title: pr.title, summary: pr.summary, description: pr.description, self_enroll: pr.self_enroll, status, template_id: pr.template_id || null };
      if (state.perms.manage || state.perms.site) payload.award_rank_id = pr.award_rank_id || null;
      const saved = await UI.busy(form, statusEl, () => D.saveProgram(state.coven.id, draft.id, payload, P().stagesPayload(stages)));
      if (saved) {
        draft = null;
        await load();
        go(link("view=design"));
      }
    });
    pane.querySelector("[data-leave-editor]").addEventListener("click", () => (draft = null));
  }

  // --- drawing -------------------------------------------------------------------------------

  async function reloadAndDraw() {
    await load();
    draw();
  }

  function go(href) {
    global.history.pushState(null, "", href);
    draw();
    global.scrollTo(0, 0);
  }

  function draw() {
    if (!pane) return;
    if (!P()) {
      pane.innerHTML = `<p class="sp-notice">This part of the coven couldn’t load. Please refresh the page.</p>`;
      return;
    }
    const p = params();
    if (p.get("edit")) return editor(p.get("edit"));
    draft = null;
    if (CC() && global.SaltCore?.covens?.training && CC().route(ctx(), p)) return;
    if (p.get("program")) return path(p.get("program"), p.get("person"));
    if (p.get("view") === "people") return people();
    if (p.get("view") === "design") return design();
    return mine();
  }

  function onClick(event) {
    const a = event.target.closest("a[data-go]");
    if (!a || !pane?.contains(a) || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    go(a.getAttribute("href"));
  }

  async function mount(el, covenState, tools) {
    pane = el;
    state = covenState;
    helpers = tools;
    studyPages = null;
    pane.innerHTML = `<p class="sp-caption">Gathering the coven’s programs…</p>`;
    pane.addEventListener("click", onClick);
    global.addEventListener("popstate", draw);
    await load();
    draw();
  }

  function unmount() {
    pane?.removeEventListener("click", onClick);
    global.removeEventListener("popstate", draw);
    pane = null;
    draft = null;
  }

  global.CovenPrograms = { mount, unmount };
})(window);
