/*
 * The teaching side of a coven's programs, on the website (the app's
 * programs/lesson, test, score, thread, library, lesson-edit and quiz-edit
 * screens): lessons and the lesson reader, tests (taking one, the result,
 * with the right answers and explanations once passed, the attempts,
 * scoring), practice logged a session at a time
 * with a timer, the conversation on each step, the coven's own lessons and
 * tests, and the ready-made course programs to copy in.
 *
 * Drawn inside the Initiation & training tab (covens/coven/programs.js):
 *   &lesson=<doc>[&e=<enrollment>&t=<task>]   the lesson reader
 *   &test=<task>&e=<enrollment>[&attempt=<id>] a step's test, or one attempt
 *   &score=<attempt>                            scoring a test
 *   &thread=<task>&e=<enrollment>               a step's conversation
 *   &view=library                               the coven's lessons and tests
 *   &lessonEdit=<id|new>  &quizEdit=<id|new>    writing them
 *
 * The rules are the app's own (SaltCore.covens.lesson, quiz, training,
 * courseCopy); the courses themselves load on demand (js/core/course-programs.json).
 * The database checks every action (supabase/migrations/20261110000100_coven_courses.sql).
 */
(function (global) {
  "use strict";

  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;
  const K = () => global.SaltCore?.covens;
  // Whether the caller signs off training as the coven's head (her own too; coven_head_signs_off).
  const headSignsOff = (ctx) => Boolean(K()?.programs?.signsOffAsHead && K().programs.signsOffAsHead(ctx.state.perms || {}, Boolean(ctx.state.standing?.ok)));
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const when = (value) => (value ? new Date(value).toLocaleString(undefined, { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }) : "");
  const store = {
    get: (key) => {
      try {
        return global.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set: (key, value) => {
      try {
        global.localStorage.setItem(key, value);
      } catch {
        // Kept for this visit only.
      }
    },
    remove: (key) => {
      try {
        global.localStorage.removeItem(key);
      } catch {
        // Nothing kept.
      }
    }
  };

  /**
   * The ready-made course programs, every lesson in them (about a megabyte):
   * js/core/course-programs.json, built from app/src/lib/covens/courses by
   * scripts/build-course-programs.mjs, fetched once when they're shown. The
   * app fetches the same file.
   */
  let coursesLoading = null;
  function coursesCore() {
    if (!coursesLoading) {
      coursesLoading = fetch(UI.href("/js/core/course-programs.json"))
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("missing"))))
        .then((v) => ({ label: v.label || "", names: Object.fromEntries((v.traditions || []).map((t) => [t.id, t.name])), programs: Array.isArray(v.programs) ? v.programs : [] }))
        .catch(() => {
          coursesLoading = null;
          throw new Error("The ready-made courses didn’t load. Check your connection and try again.");
        });
    }
    return coursesLoading;
  }

  // --- loading -------------------------------------------------------------------

  /** What the programs tab loads besides the programs: lessons, tests, attempts and unread messages. */
  async function load(coven, perms, enrollments) {
    const users = [...new Set(enrollments.map((e) => e.user_id))];
    const [docs, links, reads, attempts, quizzes, unread] = await Promise.all([
      D.programDocs(coven.id),
      D.taskDocs(coven.id),
      D.docReads(coven.id, users),
      D.attempts(coven.id),
      perms.programs ? D.quizzes(coven.id) : Promise.resolve([]),
      D.programUnread(coven.id)
    ]);
    return { docs, links, reads, attempts, quizzes, unread };
  }

  // --- on each step ----------------------------------------------------------------

  /** A step's lessons, its test, practice sessions and the way into its conversation. */
  function taskExtras(ctx, t, e, row, { self, later, canWork }) {
    const T = K().training;
    const Q = K().quiz;
    const docs = T.docsForTask(t.id, ctx.data.links, ctx.data.docs);
    const parts = [];
    if (!later && docs.length) {
      parts.push(`<div class="cv-lessons"><p class="sp-label">${esc(T.lessonsLine(docs, ctx.data.reads, e.user_id))}</p><ul class="cv-lesson-list">${docs
        .map(
          (d) => `<li><a href="${esc(ctx.link(`lesson=${d.id}&e=${e.id}&t=${t.id}`))}" data-go>${T.isRead(ctx.data.reads, e.user_id, d.id) ? "✓ " : ""}${esc(d.title)}</a>
            <span class="sp-caption">${esc(K().lesson.readingTime(d))}${d.file_path ? ` · ${esc(T.fileLabel(d))}` : ""}</span></li>`
        )
        .join("")}</ul></div>`);
    }
    if (t.quiz_id) {
      const mine = ctx.data.attempts.filter((a) => a.enrollment_id === e.id && a.task_id === t.id).sort((a, b) => b.number - a.number);
      const last = mine[0];
      const passed = mine.some((a) => a.status === "passed");
      const label = self ? (mine.length ? "Your test and results" : "Take the test") : mine.length ? "Their test and results" : "The test";
      parts.push(`<div class="cv-test-card"><div class="cv-meta"><span class="cv-pill cv-pill--gold">Test</span>${last ? `<span class="cv-pill">${esc(passed ? "Passed" : Q.ATTEMPT_STATUS[last.status])}</span>` : ""}${mine.length ? `<span class="cv-pill">${mine.length} attempt${mine.length === 1 ? "" : "s"}</span>` : ""}</div>
        ${last ? `<p class="sp-caption">Last: ${esc(Q.scoreLine(last))}</p>` : ""}
        ${later ? "" : `<a class="button ${self && !passed ? "button--primary" : "button--ghost"} button--small" href="${esc(ctx.link(`test=${t.id}&e=${e.id}`))}" data-go>${esc(label)}</a>`}</div>`);
    }
    if (!later && T.logsSessions(t)) {
      const sessions = T.sessionsOf(row);
      const all = (row?.times_done || 0) >= t.times;
      parts.push(`<div class="cv-practice" data-practice="${esc(t.id)}">
        <p class="cv-practice__count">${esc(T.sessionsLine(t, row))}${sessions.length ? ` · ${T.minutesPractised(sessions)} minutes in all` : ""}</p>
        ${sessions.length ? `<ul class="cv-sessions">${sessions
          .map((s, i) => `<li>${esc(new Date(`${s.on}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }))} · ${s.minutes} min${s.note ? ` · ${esc(s.note)}` : ""}${canWork ? ` <button class="button button--ghost button--small" type="button" data-unlog="${i}">Take back</button>` : ""}</li>`)
          .join("")}</ul>` : ""}
        ${canWork && !all ? `<form class="cv-practice__form" data-log="${esc(t.id)}">
          ${t.minutes ? `<div class="cv-timer" data-timer data-target="${t.minutes * 60}"><span class="cv-timer__clock" aria-live="polite" data-clock>0:00</span><span class="sp-caption"> of ${esc(T.clock(t.minutes * 60))}</span>
            <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-timer-go>Start the timer</button><button class="button button--ghost button--small" type="button" data-timer-use hidden>Use these minutes</button><button class="button button--ghost button--small" type="button" data-timer-reset hidden>Reset</button></div></div>` : ""}
          <div class="sp-grid-2"><div class="sp-field"><label for="on-${esc(t.id)}">Day</label><input id="on-${esc(t.id)}" name="on" type="date" value="${esc(T.todayKey())}" required /></div>
          <div class="sp-field"><label for="min-${esc(t.id)}">Minutes</label><input id="min-${esc(t.id)}" name="minutes" type="number" min="0" max="1440" value="${esc(t.minutes ?? "")}" /></div></div>
          <div class="sp-field"><label for="note-${esc(t.id)}">A note (optional)</label><input id="note-${esc(t.id)}" name="note" maxlength="1000" /></div>
          <div class="sp-actions"><button class="button button--primary button--small" type="submit">Log this session (${Math.min(t.times, (row?.times_done || 0) + 1)} of ${t.times})</button></div>${statusLine()}</form>` : ""}
      </div>`);
    }
    if (!later) {
      const unread = T.unreadMap(ctx.data.unread).get(T.threadKey(e.id, t.id)) || 0;
      const mentor = ctx.mentorOf(e.user_id);
      const label = self ? (mentor ? `Talk with ${ctx.nameOf(mentor)} about this step` : "Talk with the coven’s leaders about this step") : `Talk with ${ctx.nameOf(e.user_id)} about this step`;
      parts.push(`<p class="cv-thread-link"><a href="${esc(ctx.link(`thread=${t.id}&e=${e.id}`))}" data-go>${esc(label)}</a>${unread ? ` <span class="cv-pill cv-pill--gold">${unread} new</span>` : ""}</p>`);
    }
    return parts.join("");
  }

  /** Practice forms and timers on the path. */
  function bindExtras(ctx, e, onChanged) {
    const T = K().training;
    ctx.pane.querySelectorAll("[data-practice]").forEach((box) => {
      const taskId = box.dataset.practice;
      box.querySelectorAll("[data-unlog]").forEach((button) =>
        button.addEventListener("click", async () => {
          if (await UI.busy(button, box.querySelector("[data-status]"), () => D.removePractice(e.id, taskId, Number(button.dataset.unlog)))) onChanged();
        })
      );
      const form = box.querySelector("[data-log]");
      if (!form) return;
      const timer = form.querySelector("[data-timer]");
      let t = { startedAt: null, banked: 0 };
      let tick = null;
      const show = () => {
        const elapsed = T.timerElapsed(t);
        timer.querySelector("[data-clock]").textContent = T.clock(elapsed);
        const go = timer.querySelector("[data-timer-go]");
        go.textContent = t.startedAt ? "Pause" : elapsed ? "Carry on" : "Start the timer";
        timer.querySelector("[data-timer-use]").hidden = !elapsed || Boolean(t.startedAt);
        timer.querySelector("[data-timer-reset]").hidden = !elapsed || Boolean(t.startedAt);
        if (Number(timer.dataset.target) && elapsed >= Number(timer.dataset.target)) timer.classList.add("is-done");
      };
      if (timer) {
        timer.querySelector("[data-timer-go]").addEventListener("click", () => {
          t = t.startedAt ? T.timerPause(t) : T.timerStart(t);
          clearInterval(tick);
          if (t.startedAt) tick = setInterval(() => (form.isConnected ? show() : clearInterval(tick)), 1000);
          show();
        });
        timer.querySelector("[data-timer-use]").addEventListener("click", () => (form.elements.minutes.value = T.timerMinutes(T.timerElapsed(t))));
        timer.querySelector("[data-timer-reset]").addEventListener("click", () => {
          t = { startedAt: null, banked: 0 };
          timer.classList.remove("is-done");
          show();
        });
      }
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const day = T.cleanDay(form.elements.on.value);
        const status = form.querySelector("[data-status]");
        if (!day) return UI.setStatus(status, "Choose the day you practised.", true);
        const minutes = Number(form.elements.minutes.value || 0);
        if (await UI.busy(form, status, () => D.logPractice(e.id, taskId, day, minutes, form.elements.note.value.trim()))) {
          clearInterval(tick);
          onChanged();
        }
      });
    });
  }

  // --- the lesson reader -------------------------------------------------------------

  function lessonView(ctx, docId, enrollmentId, taskId) {
    const T = K().training;
    const doc = ctx.data.docs.find((d) => d.id === docId);
    const e = enrollmentId ? ctx.data.enrollments.find((x) => x.id === enrollmentId) : null;
    const back = e ? ctx.link(`program=${e.program_id}${e.user_id === ctx.me() ? "" : `&person=${e.user_id}`}${taskId ? `&task=${taskId}` : ""}`) : ctx.link(ctx.state.perms.programs ? "view=library" : "");
    if (!doc) {
      ctx.pane.innerHTML = `${ctx.nav("")}<p><a href="${esc(back)}" data-go>← Back</a></p><p class="sp-notice">That lesson isn’t here any more. The coven may have changed it.</p>`;
      return;
    }
    const reader = e?.user_id || ctx.me();
    const self = reader === ctx.me();
    const read = T.isRead(ctx.data.reads, reader, doc.id);
    const siblings = taskId ? T.docsForTask(taskId, ctx.data.links, ctx.data.docs) : [];
    const at = siblings.findIndex((d) => d.id === doc.id);
    const next = at >= 0 ? siblings[at + 1] : null;
    ctx.pane.innerHTML = `${ctx.nav("")}
      <p><a href="${esc(back)}" data-go>← Back to the step</a></p>
      <article class="cv-lesson" aria-labelledby="lesson-title">
        <header><h2 id="lesson-title">${esc(doc.title)}</h2>
          <p class="sp-caption">${esc(K().lesson.readingTime(doc))}${read ? (self ? " · You’ve read this" : ` · ${esc(ctx.nameOf(reader))} has read this`) : ""}${siblings.length > 1 && at >= 0 ? ` · Lesson ${at + 1} of ${siblings.length}` : ""}</p>
          ${doc.summary ? `<p class="cv-lesson__summary">${esc(doc.summary)}</p>` : ""}</header>
        ${doc.file_path ? `<div class="cv-lesson__file" data-file>${T.isImage(doc.file_type) ? `<img alt="${esc(doc.file_name || doc.title)}" data-file-img hidden />` : ""}<button class="button button--ghost button--small" type="button" data-open-file>Open ${esc(T.fileLabel(doc))}</button></div>` : ""}
        <div class="cv-lesson__body">${K().lesson.lessonHtml(doc.body)}</div>
      </article>
      <div class="sp-actions">
        ${self ? (read ? `<button class="button button--ghost" type="button" data-read="0">Mark as not read</button>` : `<button class="button button--primary" type="button" data-read="1">Mark as read</button>`) : ""}
        ${next ? `<a class="button ${read || !self ? "button--primary" : "button--ghost"}" href="${esc(ctx.link(`lesson=${next.id}&e=${enrollmentId || ""}&t=${taskId || ""}`))}" data-go>Next: ${esc(next.title)}</a>` : ""}
        ${e && taskId ? `<a class="button button--ghost" href="${esc(ctx.link(`thread=${taskId}&e=${e.id}`))}" data-go>Ask about this lesson</a>` : ""}
      </div>${statusLine()}`;
    const status = ctx.pane.querySelector(":scope > [data-status]");
    ctx.pane.querySelector("[data-read]")?.addEventListener("click", async (event) => {
      if (await UI.busy(event.currentTarget, status, () => D.markDocRead(doc.id, event.currentTarget.dataset.read === "1").then(() => true))) ctx.reloadAndDraw();
    });
    if (doc.file_path) {
      const img = ctx.pane.querySelector("[data-file-img]");
      if (img) D.lessonFileUrl(doc.file_path).then((url) => ((img.src = url), (img.hidden = false))).catch(() => {});
      ctx.pane.querySelector("[data-open-file]").addEventListener("click", async () => {
        const url = await UI.busy(ctx.pane.querySelector("[data-open-file]"), status, () => D.lessonFileUrl(doc.file_path));
        if (url) global.open(url, "_blank", "noopener");
      });
    }
  }

  // --- tests ----------------------------------------------------------------------------

  function questionHtml(q, n, of, answer) {
    const Q = K().quiz;
    const name = `ans-${q.id}`;
    const head = `<p class="sp-label">Question ${n} of ${of} · ${q.points} point${q.points === 1 ? "" : "s"}${q.type === "multi" ? " · choose every right answer" : ""}</p><p class="cv-q__prompt">${esc(q.prompt)}</p>`;
    if (Q.isWritten(q)) {
      return `<fieldset class="cv-q" data-q="${esc(q.id)}"><legend class="sr-only">Question ${n}</legend>${head}
        <div class="sp-field"><label for="${esc(name)}">${q.type === "long" ? "Your answer (a few paragraphs)" : "Your answer (a few sentences)"}</label><textarea id="${esc(name)}" name="${esc(name)}" rows="${q.type === "long" ? 8 : 4}" maxlength="8000">${esc(typeof answer === "string" ? answer : "")}</textarea></div></fieldset>`;
    }
    const chosen = Array.isArray(answer) ? answer : [];
    return `<fieldset class="cv-q" data-q="${esc(q.id)}"><legend class="sr-only">Question ${n}</legend>${head}
      ${(q.options || []).map((o, i) => `<label class="cv-option"><input type="${q.type === "multi" ? "checkbox" : "radio"}" name="${esc(name)}" value="${i}"${chosen.includes(i) ? " checked" : ""} /> <span>${esc(o)}</span></label>`).join("")}</fieldset>`;
  }

  function readAnswers(form, questions, answers) {
    questions.forEach((q) => {
      const name = `ans-${q.id}`;
      if (K().quiz.isWritten(q)) {
        const area = form.elements[name];
        if (area) answers[q.id] = area.value;
      } else {
        const boxes = [...form.querySelectorAll(`[name="${CSS.escape(name)}"]`)];
        if (boxes.length) answers[q.id] = boxes.filter((b) => b.checked).map((b) => Number(b.value));
      }
    });
    return answers;
  }

  function attemptHtml(a, { showRubric, self }) {
    const Q = K().quiz;
    const hidden = Q.keyLine(a, Boolean(self));
    return `${hidden ? `<p class="sp-caption" data-key-hidden>${esc(hidden)}</p>` : ""}<ol class="cv-result">${Q.attemptLines(a)
      .map((line) => {
        const q = line.question;
        return `<li class="cv-result__line${line.right === true ? " is-right" : line.right === false ? " is-wrong" : ""}">
          <p class="sp-label">Question ${line.number}${line.right === true ? " · right" : line.right === false ? " · not quite" : ""}${line.points !== null ? ` · ${line.points} of ${q.points}` : Q.isWritten(q) ? ` · ${q.points} point${q.points === 1 ? "" : "s"}, scored by a person` : ""}</p>
          <p class="cv-q__prompt">${esc(q.prompt)}</p>
          <p><strong>Answer given:</strong> ${prose(Q.answerWords(q, line.answer))}</p>
          ${line.right === false && Q.rightWords(q) ? `<p><strong>The right answer:</strong> ${esc(Q.rightWords(q))}</p>` : ""}
          ${line.comment ? `<p><strong>Comment:</strong> ${esc(line.comment)}</p>` : ""}
          ${q.explanation ? `<p class="cv-result__why">${esc(q.explanation)}</p>` : ""}
          ${showRubric && q.rubric ? `<p class="sp-caption"><strong>What a full answer includes:</strong> ${esc(q.rubric)}</p>` : ""}</li>`;
      })
      .join("")}</ol>`;
  }

  async function testView(ctx, taskId, enrollmentId, attemptId) {
    const Q = K().quiz;
    const e = ctx.data.enrollments.find((x) => x.id === enrollmentId);
    const t = ctx.data.tasks.find((x) => x.id === taskId);
    const back = e ? ctx.link(`program=${e.program_id}${e.user_id === ctx.me() ? "" : `&person=${e.user_id}`}&task=${taskId}`) : ctx.link("");
    if (!e || !t?.quiz_id) {
      ctx.pane.innerHTML = `${ctx.nav("")}<p class="sp-notice">This test isn’t here any more, or isn’t yours to see.</p>`;
      return;
    }
    ctx.pane.innerHTML = `${ctx.nav("")}<p class="sp-caption">Opening the test…</p>`;
    const [quiz, standing] = await Promise.all([D.quizView(t.quiz_id, e.id).catch(() => null), D.quizStanding(e.id, t.id).catch(() => null)]);
    if (!quiz) {
      ctx.pane.innerHTML = `${ctx.nav("")}<p class="sp-notice">This test isn’t yours to see.</p>`;
      return;
    }
    const self = e.user_id === ctx.me();
    // The coven's head scores anyone's test, her own too.
    const head = headSignsOff(ctx);
    const mayScore = head || (!self && (ctx.state.perms.programs || ctx.mentorOf(e.user_id) === ctx.me()));
    const attempts = ctx.data.attempts.filter((a) => a.enrollment_id === e.id && a.task_id === t.id).sort((a, b) => b.number - a.number);
    const can = Q.standingLine(standing);
    const key = Q.draftKey(e.id, t.id);
    const viewing = attemptId ? attempts.find((a) => a.id === attemptId) : null;
    const talk = `<a class="button button--ghost" href="${esc(ctx.link(`thread=${t.id}&e=${e.id}`))}" data-go>${self ? "Talk about your result" : `Talk with ${esc(ctx.nameOf(e.user_id))} about it`}</a>`;

    if (viewing) {
      const final = viewing.status === "passed" || viewing.status === "failed";
      ctx.pane.innerHTML = `${ctx.nav("")}<p><a href="${esc(ctx.link(`test=${t.id}&e=${e.id}`))}" data-go>← Back to the test</a></p>
        <header class="sp-section"><div class="cv-meta"><span class="cv-pill">Attempt ${viewing.number}</span><span class="cv-pill${viewing.status === "passed" ? " cv-pill--gold" : ""}">${esc(Q.ATTEMPT_STATUS[viewing.status])}</span></div>
          <h2>${esc(quiz.title)}</h2><p class="cv-score">${esc(Q.scoreLine(viewing))}</p>
          <p class="sp-caption">Handed in ${esc(when(viewing.submitted_at))} · ${viewing.pass_percent}% to pass${viewing.scored_by && final ? ` · scored by ${esc(ctx.nameOf(viewing.scored_by))}` : ""}</p></header>
        ${viewing.status === "passed" ? `<p class="sp-notice">Passed. This step is done.</p>` : ""}
        ${viewing.status === "failed" && self ? `<p class="sp-notice">${esc(can.line || "Not passed this time.")} See which questions to look at again below, and ask your mentor about anything unclear.</p>` : ""}
        ${!final ? `<p class="sp-notice">${self ? "The choice questions are scored. Your written answers are with your mentor or the coven’s leaders, who will score them." : "Written answers are waiting to be scored."}</p>` : ""}
        ${viewing.feedback && final ? `<div class="sp-card"><p class="sp-label">A note from ${esc(viewing.scored_by ? ctx.nameOf(viewing.scored_by) : "your mentor")}</p><div class="cv-doc">${prose(viewing.feedback)}</div></div>` : ""}
        ${attemptHtml(viewing, { showRubric: !self || head, self })}
        <div class="sp-actions">${mayScore && !final ? `<a class="button button--primary" href="${esc(ctx.link(`score=${viewing.id}`))}" data-go>Score it</a>` : ""}${talk}</div>`;
      return;
    }

    const written = quiz.questions.filter((q) => Q.isWritten(q)).length;
    const draft = self ? Q.readDraft(store.get(key)) : null;
    const answers = draft?.answers || {};
    const overview = () => {
      ctx.pane.innerHTML = `${ctx.nav("")}<p><a href="${esc(back)}" data-go>← Back to the step</a></p>
        <header class="sp-section"><div class="cv-meta"><span class="cv-pill">${esc(t.title)}</span>${self ? "" : `<span class="cv-pill">${esc(ctx.nameOf(e.user_id))}</span>`}</div>
          <h2>${esc(quiz.title)}</h2>${quiz.intro ? `<div class="cv-doc">${prose(quiz.intro)}</div>` : ""}
          <p class="sp-caption">${quiz.questions.length} question${quiz.questions.length === 1 ? "" : "s"} · ${Q.maxPoints(quiz.questions)} points · ${quiz.pass_percent}% to pass${written ? ` · ${written} written answer${written === 1 ? "" : "s"}, scored by your mentor or the coven’s leaders` : ""} · ${quiz.retakes} retake${quiz.retakes === 1 ? "" : "s"}${quiz.wait_hours ? `, ${quiz.wait_hours} hours apart` : ""}</p></header>
        ${self && can.line ? `<p class="sp-notice">${esc(can.line)}</p>` : ""}
        ${self && head ? `<p class="sp-caption">${esc(K().programs.HEAD_OWN_TRAINING)}</p>` : ""}
        <div class="sp-actions">
          ${self && can.canTake && quiz.questions.length ? `<button class="button button--primary" type="button" data-take="one">${Object.keys(answers).length ? "Carry on with your answers" : attempts.length ? "Take it again" : "Begin the test"}</button><button class="button button--ghost" type="button" data-take="all">See the whole test at once</button>` : ""}
          ${(head || (!self && ctx.state.perms.programs)) && standing && standing.used >= standing.allowed && !standing.passed ? `<button class="button button--ghost" type="button" data-allow>Allow one more attempt</button>` : ""}
        </div>${statusLine()}
        <section class="sp-section"><h3>${self ? "Your attempts" : "Attempts"}</h3>
          ${attempts.length ? `<ul class="cv-attempts">${attempts
            .map((a) => `<li><a href="${esc(ctx.link(mayScore && (a.status === "submitted" || a.status === "scored") ? `score=${a.id}` : `test=${t.id}&e=${e.id}&attempt=${a.id}`))}" data-go>Attempt ${a.number}: ${esc(Q.ATTEMPT_STATUS[a.status])}</a> <span class="sp-caption">${esc(Q.scoreLine(a))} · ${esc(when(a.submitted_at))}</span></li>`)
            .join("")}</ul>` : `<p class="sp-empty">${self ? "None yet." : "They haven’t taken it yet."}</p>`}
        </section>
        <p><a href="${esc(ctx.link(`thread=${t.id}&e=${e.id}`))}" data-go>${self ? "Ask about this test" : `Talk with ${esc(ctx.nameOf(e.user_id))} about it`}</a></p>`;
      ctx.pane.querySelectorAll("[data-take]").forEach((b) => b.addEventListener("click", () => take(b.dataset.take, draft?.index || 0)));
      ctx.pane.querySelector("[data-allow]")?.addEventListener("click", async (event) => {
        const saved = await UI.busy(event.currentTarget, ctx.pane.querySelector(":scope > [data-status]"), () => D.allowRetake(e.id, t.id), { done: "Another attempt is allowed, with no wait before it." });
        if (saved) await ctx.reload();
      });
    };
    const take = (layout, start) => {
      let index = Math.min(start, quiz.questions.length - 1);
      const save = (form) => {
        readAnswers(form, quiz.questions, answers);
        store.set(key, JSON.stringify({ answers, at: Date.now(), index }));
      };
      const draw = () => {
        const q = quiz.questions[index];
        ctx.pane.innerHTML = `${ctx.nav("")}<p><button class="button button--ghost button--small" type="button" data-leave>← Back (your answers are kept)</button></p>
          <h2>${esc(quiz.title)}</h2>
          <p class="sp-caption">Your answers are kept on this device as you go, until you hand the test in.</p>
          <form class="sp-section cv-take" data-take-form novalidate>
            ${layout === "one" ? questionHtml(q, index + 1, quiz.questions.length, answers[q.id]) : quiz.questions.map((x, i) => `<div class="sp-card">${questionHtml(x, i + 1, quiz.questions.length, answers[x.id])}</div>`).join("")}
            <div class="sp-actions">
              ${layout === "one" && index > 0 ? `<button class="button button--ghost" type="button" data-step="-1">Back</button>` : ""}
              ${layout === "one" && index < quiz.questions.length - 1 ? `<button class="button button--primary" type="button" data-step="1">Next question</button>` : `<button class="button button--primary" type="submit">Hand it in</button>`}
              ${layout === "one" ? `<button class="button button--ghost" type="button" data-layout>See the whole test</button>` : ""}
            </div>${statusLine()}</form>`;
        const form = ctx.pane.querySelector("[data-take-form]");
        form.addEventListener("input", () => save(form));
        form.addEventListener("change", () => save(form));
        ctx.pane.querySelector("[data-leave]").addEventListener("click", () => {
          save(form);
          overview();
        });
        form.querySelectorAll("[data-step]").forEach((b) =>
          b.addEventListener("click", () => {
            save(form);
            index += Number(b.dataset.step);
            store.set(key, JSON.stringify({ answers, at: Date.now(), index }));
            draw();
          })
        );
        form.querySelector("[data-layout]")?.addEventListener("click", () => {
          save(form);
          layout = "all";
          draw();
        });
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          save(form);
          const left = Q.unanswered(quiz.questions, answers);
          if (left.length && !(await UI.confirmAction("Hand it in anyway?", `Question${left.length === 1 ? "" : "s"} ${left.join(", ")} ${left.length === 1 ? "has" : "have"} no answer yet.`, "Hand it in"))) return;
          const saved = await UI.busy(form, form.querySelector("[data-status]"), () => D.submitQuiz(e.id, t.id, answers));
          if (saved) {
            store.remove(key);
            await ctx.load();
            ctx.go(ctx.link(`test=${t.id}&e=${e.id}&attempt=${saved.id}`));
          }
        });
      };
      draw();
    };
    overview();
  }

  function scoreView(ctx, attemptId) {
    const Q = K().quiz;
    const a = ctx.data.attempts.find((x) => x.id === attemptId);
    if (!a) {
      ctx.pane.innerHTML = `${ctx.nav("")}<p class="sp-notice">That attempt isn’t here, or isn’t yours to score.</p>`;
      return;
    }
    const own = a.user_id === ctx.me();
    const mayScore = headSignsOff(ctx) || (!own && (ctx.state.perms.programs || ctx.mentorOf(a.user_id) === ctx.me()));
    const open = a.status === "submitted" || a.status === "scored";
    const t = ctx.data.tasks.find((x) => x.id === a.task_id);
    const writtenQs = a.questions.map((q, i) => ({ q, i })).filter(({ q }) => Q.isWritten(q));
    ctx.pane.innerHTML = `${ctx.nav("")}<p><a href="${esc(ctx.link(`test=${a.task_id}&e=${a.enrollment_id}`))}" data-go>← The test</a></p>
      <header class="sp-section"><div class="cv-meta"><span class="cv-pill">${esc(ctx.nameOf(a.user_id))}</span><span class="cv-pill">Attempt ${a.number}</span><span class="cv-pill">${esc(Q.ATTEMPT_STATUS[a.status])}</span></div>
        <h2>Score: ${esc(a.title)}</h2>${t ? `<p class="sp-caption">${esc(t.title)}</p>` : ""}
        <p class="cv-score" data-total></p><p class="sp-caption">Choice questions: ${a.auto_score} points, scored when handed in.</p></header>
      ${mayScore ? "" : `<p class="sp-notice">Only their mentor, those who manage the coven’s programs or the coven’s head score this test.</p>`}
      ${mayScore && own ? `<p class="sp-notice">${esc(K().programs.HEAD_OWN_TRAINING)}</p>` : ""}
      <form class="sp-section" data-score novalidate>
        ${writtenQs
          .map(({ q, i }) => {
            const m = a.manual_scores[q.id];
            const answer = a.answers[q.id];
            return `<div class="sp-card cv-score-q"><p class="sp-label">Question ${i + 1} · up to ${q.points} point${q.points === 1 ? "" : "s"}</p><p class="cv-q__prompt">${esc(q.prompt)}</p>
              <div class="cv-response"><div class="cv-doc">${typeof answer === "string" && answer.trim() ? prose(answer) : "No answer given."}</div></div>
              ${q.rubric ? `<p class="sp-caption"><strong>What a full answer includes:</strong> ${esc(q.rubric)}</p>` : ""}
              ${mayScore && open ? `<div class="sp-grid-2"><div class="sp-field"><label for="p-${esc(q.id)}">Points (0 to ${q.points})</label><input id="p-${esc(q.id)}" name="points-${esc(q.id)}" type="number" min="0" max="${q.points}" step="0.5" value="${esc(m ? m.points : "")}" /></div>
                <div class="sp-field"><label for="c-${esc(q.id)}">A comment on this answer</label><textarea id="c-${esc(q.id)}" name="comment-${esc(q.id)}" rows="2" maxlength="2000">${esc(m?.comment || "")}</textarea></div></div>` : ""}</div>`;
          })
          .join("")}
        ${mayScore && open ? `<div class="sp-field"><label for="score-note">A note on the whole test (optional)</label><textarea id="score-note" name="feedback" rows="3" maxlength="4000">${esc(a.feedback || "")}</textarea></div>
          <div class="sp-actions"><button class="button button--primary" type="submit" data-final="1">Give the result</button><button class="button button--ghost" type="submit" data-final="0">Save for later</button></div>` : ""}
        ${statusLine()}</form>
      <p><a href="${esc(ctx.link(`thread=${a.task_id}&e=${a.enrollment_id}`))}" data-go>Talk with ${esc(ctx.nameOf(a.user_id))} about it</a></p>
      <h3>The whole attempt</h3>${attemptHtml(a, { showRubric: true, self: false })}`;
    const form = ctx.pane.querySelector("[data-score]");
    const typed = () => Object.fromEntries(writtenQs.map(({ q }) => [q.id, { points: form.elements[`points-${q.id}`]?.value ?? String(a.manual_scores[q.id]?.points ?? ""), comment: form.elements[`comment-${q.id}`]?.value ?? "" }]));
    const total = () => {
      const sum = a.auto_score + Object.values(typed()).reduce((n, s) => n + (Number(s.points) || 0), 0);
      ctx.pane.querySelector("[data-total]").textContent = `${sum} of ${a.max} · ${a.max ? Math.round((sum / a.max) * 100) : 100}% (${a.pass_percent}% to pass) · ${Q.passes(sum, a.max, a.pass_percent) ? "passes" : "not yet a pass"}`;
    };
    total();
    form.addEventListener("input", total);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const final = event.submitter?.dataset.final === "1";
      const { scores, errors } = Q.scoresPayload(a.questions, typed(), final);
      const status = form.querySelector("[data-status]");
      if (errors.length) return UI.setStatus(status, errors.slice(0, 3).join(" "), true);
      const saved = await UI.busy(form, status, () => D.scoreQuiz(a.id, scores, form.elements.feedback.value.trim(), final));
      if (saved) {
        await ctx.load();
        scoreView(ctx, a.id);
        UI.setStatus(ctx.pane.querySelector("[data-score] [data-status]"), final ? (saved.status === "passed" ? "Scored: passed. The step is done." : "Scored: not passed this time. They can see why, and take it again when allowed.") : "Saved. They still see it waiting.");
      }
    });
  }

  // --- a step's conversation -------------------------------------------------------------

  async function threadView(ctx, taskId, enrollmentId) {
    const T = K().training;
    const e = ctx.data.enrollments.find((x) => x.id === enrollmentId);
    const t = ctx.data.tasks.find((x) => x.id === taskId);
    if (!e || !t) {
      ctx.pane.innerHTML = `${ctx.nav("")}<p class="sp-notice">This conversation is between someone in training and those who oversee them, and isn’t yours to read.</p>`;
      return;
    }
    const self = e.user_id === ctx.me();
    const mentor = ctx.mentorOf(e.user_id);
    const messages = await D.programMessages(e.id, t.id).catch(() => null);
    if (!messages) {
      ctx.pane.innerHTML = `${ctx.nav("")}<p class="sp-notice">This conversation couldn’t be loaded.</p>`;
      return;
    }
    await UI.loadNames(ctx.state.context, messages.map((m) => m.author_id).filter(Boolean));
    D.readProgramThread(e.id, t.id).then(() => ctx.refreshCounts?.());
    const back = ctx.link(`program=${e.program_id}${self ? "" : `&person=${e.user_id}`}&task=${t.id}`);
    ctx.pane.innerHTML = `${ctx.nav("")}<p><a href="${esc(back)}" data-go>← Back to the step</a></p>
      <header class="sp-section"><p class="sp-label">Conversation</p><h2>${esc(t.title)}</h2>
        <p class="sp-caption">With ${esc(T.threadWith({ self, mentorName: mentor ? ctx.nameOf(mentor) : null, traineeName: ctx.nameOf(e.user_id) }))}. No one else in the coven reads it.</p></header>
      <ol class="cv-thread" aria-label="Messages">${messages.length ? messages
        .map((m) => {
          const mine = m.author_id === ctx.me();
          const role = T.authorRole(m.author_id, { traineeId: e.user_id, mentorId: mentor, headId: ctx.state.coven.founder_id });
          return `<li class="cv-thread__msg${mine ? " is-mine" : ""}"><p class="sp-caption">${esc(m.author_id ? (mine ? "You" : ctx.nameOf(m.author_id)) : "Someone")}${role ? ` · ${esc(role)}` : ""} · ${esc(when(m.created_at))}</p>
            ${m.deleted_at ? `<p class="sp-muted"><em>Removed</em></p>` : `<div class="cv-doc">${prose(m.body)}</div>`}
            ${mine && !m.deleted_at ? `<button class="button button--ghost button--small" type="button" data-remove-msg="${esc(m.id)}">Remove</button>` : ""}</li>`;
        })
        .join("") : `<li class="sp-empty">${self ? "Ask a question, say what you found hard, or share what you noticed. It stays with this step." : "Nothing written here yet."}</li>`}</ol>
      <form class="sp-section" data-post>
        <div class="sp-field"><label for="thread-body">${self ? "Write to your mentor and the coven’s leaders" : `Write to ${esc(ctx.nameOf(e.user_id))}`}</label><textarea id="thread-body" name="body" rows="4" maxlength="4000" required></textarea></div>
        <div class="sp-actions"><button class="button button--primary" type="submit">Send</button></div>${statusLine()}</form>`;
    const redraw = () => threadView(ctx, taskId, enrollmentId);
    ctx.pane.querySelector("[data-post]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.elements.body.value.trim()) return;
      if (await UI.busy(form, form.querySelector("[data-status]"), () => D.postProgramMessage(e.id, t.id, form.elements.body.value))) redraw();
    });
    ctx.pane.querySelectorAll("[data-remove-msg]").forEach((b) =>
      b.addEventListener("click", async () => {
        if (await UI.busy(b, ctx.pane.querySelector("[data-post] [data-status]"), () => D.removeProgramMessage(b.dataset.removeMsg))) redraw();
      })
    );
  }

  // --- the coven's lessons and tests -------------------------------------------------------

  function libraryView(ctx) {
    const T = K().training;
    const Q = K().quiz;
    if (!ctx.state.perms.programs) return false;
    const docs = ctx.data.docs;
    const quizzes = [...ctx.data.quizzes].sort((a, b) => a.title.localeCompare(b.title));
    const usedOn = (n) => (n ? `on ${n} step${n === 1 ? "" : "s"}` : "on no step yet");
    ctx.pane.innerHTML = `${ctx.nav("library")}
      <section class="sp-section"><h2>Lessons and tests</h2>
        <p>Lessons teach a step; a test checks what was learned. Change any of them: every program that uses one shows your changes.</p>
        <div class="sp-field"><label for="lib-find">Find a lesson or test</label><input id="lib-find" type="search" data-find /></div></section>
      <section class="sp-section"><h3>Lessons (${docs.length})</h3>
        <div class="sp-actions"><a class="button button--primary button--small" href="${esc(ctx.link("lessonEdit=new"))}" data-go>Write a lesson</a></div>
        ${docs.length ? `<ul class="cv-template-list" data-list>${docs
          .map((d) => `<li data-title="${esc(d.title.toLowerCase())}"><a href="${esc(ctx.link(`lessonEdit=${d.id}`))}" data-go><strong>${esc(d.title)}</strong></a> <span class="sp-caption">${esc([K().lesson.readingTime(d), usedOn(T.tasksUsing(d.id, ctx.data.links).length), d.file_path ? T.fileLabel(d) : "", d.source_id ? "ready-made" : "the coven’s own"].filter(Boolean).join(" · "))}</span> <a class="button button--ghost button--small" href="${esc(ctx.link(`lesson=${d.id}`))}" data-go>Read</a></li>`)
          .join("")}</ul>` : `<p class="sp-empty">No lessons yet. Copy a ready-made program, or write your own.</p>`}</section>
      <section class="sp-section"><h3>Tests (${quizzes.length})</h3>
        <div class="sp-actions"><a class="button button--ghost button--small" href="${esc(ctx.link("quizEdit=new"))}" data-go>Write a test</a></div>
        ${quizzes.length ? `<ul class="cv-template-list" data-list>${quizzes
          .map((x) => `<li data-title="${esc(x.title.toLowerCase())}"><a href="${esc(ctx.link(`quizEdit=${x.id}`))}" data-go><strong>${esc(x.title)}</strong></a> <span class="sp-caption">${x.questions.length} questions · ${Q.maxPoints(x.questions)} points · ${x.pass_percent}% to pass · ${usedOn(ctx.data.tasks.filter((t) => t.quiz_id === x.id).length)}</span></li>`)
          .join("")}</ul>` : ""}</section>`;
    ctx.pane.querySelector("[data-find]").addEventListener("input", (event) => {
      const q = event.target.value.trim().toLowerCase();
      ctx.pane.querySelectorAll("[data-list] li").forEach((li) => (li.hidden = Boolean(q) && !li.dataset.title.includes(q)));
    });
    return true;
  }

  const HOW = `Headings start with ## (or ###). Leave a blank line between paragraphs. Lists: "- " for bullets, "1. " for steps. **Bold** and *italic*. A line starting with "> **Safety:**", "> **Try this:**", "> **Note:**" or "> **Your coven:**" makes a box. "---" draws a line.`;

  function lessonEditView(ctx, id) {
    const T = K().training;
    if (!ctx.state.perms.programs) return false;
    const existing = id !== "new" ? ctx.data.docs.find((d) => d.id === id) : null;
    if (id !== "new" && !existing) {
      ctx.pane.innerHTML = `${ctx.nav("library")}<p class="sp-notice">That lesson was not found.</p>`;
      return true;
    }
    const doc = existing ? { title: existing.title, summary: existing.summary || "", minutes: existing.minutes, body: existing.body, file_path: existing.file_path, file_name: existing.file_name, file_type: existing.file_type } : T.emptyDoc();
    const used = existing ? T.tasksUsing(existing.id, ctx.data.links).length : 0;
    const draw = () => {
      ctx.pane.innerHTML = `${ctx.nav("library")}<p><a href="${esc(ctx.link("view=library"))}" data-go>← Lessons and tests</a></p>
        <form class="sp-section" data-lesson-form novalidate>
          <h2>${existing ? "Edit the lesson" : "A new lesson"}</h2>
          ${existing?.source_id ? `<p class="sp-notice">Copied from a ready-made course. This is the coven’s own copy: change it as you like.</p>` : ""}
          ${used > 1 ? `<p class="sp-caption">On ${used} steps. Changes show on all of them.</p>` : ""}
          <div class="sp-field"><label for="le-title">Title</label><input id="le-title" name="title" maxlength="160" value="${esc(doc.title)}" required /></div>
          <div class="sp-field"><label for="le-summary">What it teaches, in a sentence or two</label><textarea id="le-summary" name="summary" rows="2" maxlength="600">${esc(doc.summary)}</textarea></div>
          <div class="sp-field"><label for="le-minutes">About how long to read and try (minutes)</label><input id="le-minutes" name="minutes" type="number" min="0" max="600" value="${esc(doc.minutes ?? "")}" /><span class="sp-caption">Left empty, it’s worked out from the lesson’s length.</span></div>
          <div class="cv-lesson-edit">
            <div class="sp-field"><label for="le-body">The lesson</label><textarea id="le-body" name="body" rows="18" maxlength="60000">${esc(doc.body)}</textarea><span class="sp-caption">${esc(HOW)}</span></div>
            <div class="cv-lesson-edit__preview" aria-live="polite"><p class="sp-label">Preview</p><div class="cv-lesson__body" data-preview>${K().lesson.lessonHtml(doc.body)}</div></div>
          </div>
          <div class="sp-card"><p class="sp-label">A file (optional)</p><p class="sp-caption">A PDF or a picture, up to 15 MB. Only the coven’s members can open it.</p>
            ${doc.file_path ? `<p>${esc(T.fileLabel(doc))} <button class="button button--ghost button--small" type="button" data-drop-file>Remove the file</button></p>` : `<div class="sp-field"><label for="le-file">Add a PDF or picture</label><input id="le-file" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" data-file /></div>`}</div>
          <div class="sp-actions"><button class="button button--primary" type="submit">Save the lesson</button>${existing ? `<button class="button button--ghost" type="button" data-delete>Delete</button>` : ""}</div>${statusLine()}
        </form>`;
      const form = ctx.pane.querySelector("[data-lesson-form]");
      const status = form.querySelector("[data-status]");
      const read = () => {
        const f = form.elements;
        Object.assign(doc, { title: f.title.value, summary: f.summary.value, minutes: f.minutes.value === "" ? null : Number(f.minutes.value), body: f.body.value });
      };
      form.elements.body.addEventListener("input", () => (form.querySelector("[data-preview]").innerHTML = K().lesson.lessonHtml(form.elements.body.value)));
      form.querySelector("[data-drop-file]")?.addEventListener("click", () => {
        read();
        Object.assign(doc, { file_path: null, file_name: null, file_type: null });
        draw();
      });
      form.querySelector("[data-file]")?.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const type = T.fileTypeOf(file.name, file.type);
        if (!type) return UI.setStatus(status, "Choose a PDF or a picture (PNG, JPEG or WebP).", true);
        if (file.size > T.MAX_FILE_BYTES) return UI.setStatus(status, "That file is too large. Choose one under 15 MB.", true);
        read();
        const uploaded = await UI.busy(form, status, () => D.uploadLessonFile(ctx.state.coven.id, file, type));
        if (uploaded) {
          Object.assign(doc, uploaded);
          draw();
          UI.setStatus(ctx.pane.querySelector("[data-lesson-form] [data-status]"), "File added. Save the lesson to keep it.");
        }
      });
      form.querySelector("[data-delete]")?.addEventListener("click", async () => {
        if (!(await UI.confirmAction("Delete this lesson?", used ? `It comes off the ${used} step${used === 1 ? "" : "s"} it’s on, and who has read it is forgotten.` : "It isn’t on any step.", "Delete"))) return;
        if (await UI.busy(form, status, () => D.deleteDoc(existing.id))) {
          await ctx.load();
          ctx.go(ctx.link("view=library"));
        }
      });
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        read();
        const errors = T.validateDoc(doc);
        if (errors.length) return UI.setStatus(status, errors.join(" "), true);
        const saved = await UI.busy(form, status, () => D.saveDoc(ctx.state.coven.id, existing?.id, { ...doc, title: doc.title.trim(), summary: doc.summary.trim() }));
        if (saved) {
          await ctx.load();
          ctx.go(ctx.link("view=library"));
        }
      });
    };
    draw();
    return true;
  }

  function quizEditView(ctx, id) {
    const Q = K().quiz;
    if (!ctx.state.perms.programs) return false;
    const existing = id !== "new" ? ctx.data.quizzes.find((x) => x.id === id) : null;
    if (id !== "new" && !existing) {
      ctx.pane.innerHTML = `${ctx.nav("library")}<p class="sp-notice">That test was not found.</p>`;
      return true;
    }
    const quiz = existing
      ? JSON.parse(JSON.stringify({ title: existing.title, intro: existing.intro || "", pass_percent: existing.pass_percent, retakes: existing.retakes, wait_hours: existing.wait_hours, questions: existing.questions }))
      : { title: "", intro: "", pass_percent: 80, retakes: 2, wait_hours: 24, questions: [Q.emptyQuestion(1)] };
    const typeOptions = (value) => Q.QUESTION_TYPES.map((o) => `<option value="${o.value}"${o.value === value ? " selected" : ""}>${esc(o.label)}</option>`).join("");
    const questionForm = (q, i) => `<fieldset class="cv-task-edit" data-qi="${i}"><legend>Question ${i + 1}</legend>
        <div class="sp-grid-2"><div class="sp-field"><label>Kind<select name="type">${typeOptions(q.type)}</select></label></div>
          <div class="sp-field"><label>Points<input name="points" type="number" min="0" max="100" value="${esc(q.points)}" /></label></div></div>
        <div class="sp-field"><label>The question<textarea name="prompt" rows="2" maxlength="2000">${esc(q.prompt)}</textarea></label></div>
        ${Q.isChoice(q) ? `<div class="cv-options-edit"><p class="sp-label">${q.type === "multi" ? "Answers (tick every right one)" : "Answers (tick the right one)"}</p>${(q.options || [])
          .map((o, k) => `<div class="cv-option-edit"><label class="cv-check"><input type="${q.type === "multi" ? "checkbox" : "radio"}" name="correct-${i}" value="${k}"${(q.correct || []).includes(k) ? " checked" : ""} /> <span>Right</span></label>
            ${q.type === "truefalse" ? `<span>${esc(o)}</span>` : `<input name="option" data-k="${k}" maxlength="500" value="${esc(o)}" aria-label="Answer ${k + 1}" />${(q.options || []).length > 2 ? `<button class="button button--ghost button--small" type="button" data-drop-option="${i}:${k}">Remove</button>` : ""}`}</div>`)
          .join("")}${q.type !== "truefalse" && (q.options || []).length < 12 ? `<button class="button button--ghost button--small" type="button" data-add-option="${i}">Add an answer</button>` : ""}</div>` : ""}
        <div class="sp-field"><label>Explanation, shown once they’ve passed the test (teach the point again)<textarea name="explanation" rows="2" maxlength="4000">${esc(q.explanation || "")}</textarea></label></div>
        ${Q.isChoice(q) ? "" : `<div class="sp-field"><label>Scoring guide: what a full-marks answer includes<textarea name="rubric" rows="2" maxlength="4000">${esc(q.rubric || "")}</textarea></label></div>`}
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-move-q="${i}:-1">Move up</button><button class="button button--ghost button--small" type="button" data-move-q="${i}:1">Move down</button><button class="button button--ghost button--small" type="button" data-drop-q="${i}">Remove question</button></div>
      </fieldset>`;
    const draw = () => {
      ctx.pane.innerHTML = `${ctx.nav("library")}<p><a href="${esc(ctx.link("view=library"))}" data-go>← Lessons and tests</a></p>
        <form class="sp-section" data-quiz-form novalidate>
          <h2>${existing ? "Edit the test" : "A new test"}</h2>
          ${existing?.source_id ? `<p class="sp-notice">Copied from a ready-made course. This is the coven’s own copy: change it as you like.</p>` : ""}
          <p class="sp-caption">Attempts already made keep the questions as they were.</p>
          <div class="sp-field"><label for="qe-title">Title</label><input id="qe-title" name="quiz_title" maxlength="160" value="${esc(quiz.title)}" /></div>
          <div class="sp-field"><label for="qe-intro">Shown before they begin</label><textarea id="qe-intro" name="quiz_intro" rows="3" maxlength="4000">${esc(quiz.intro)}</textarea></div>
          <div class="sp-grid-2"><div class="sp-field"><label for="qe-pass">Pass mark (%)</label><input id="qe-pass" name="pass_percent" type="number" min="1" max="100" value="${esc(quiz.pass_percent)}" /></div>
            <div class="sp-field"><label for="qe-retakes">Retakes allowed</label><input id="qe-retakes" name="retakes" type="number" min="0" max="20" value="${esc(quiz.retakes)}" /></div>
            <div class="sp-field"><label for="qe-wait">Hours between attempts</label><input id="qe-wait" name="wait_hours" type="number" min="0" max="720" value="${esc(quiz.wait_hours)}" /></div></div>
          <div data-questions>${quiz.questions.map(questionForm).join("")}</div>
          <div class="sp-actions"><button class="button button--ghost" type="button" data-add-q>Add a question</button><button class="button button--primary" type="submit">Save the test</button></div>${statusLine()}
        </form>`;
      const form = ctx.pane.querySelector("[data-quiz-form]");
      const read = () => {
        const f = form.elements;
        Object.assign(quiz, { title: f.quiz_title.value, intro: f.quiz_intro.value, pass_percent: Number(f.pass_percent.value), retakes: Number(f.retakes.value), wait_hours: Number(f.wait_hours.value) });
        form.querySelectorAll("[data-qi]").forEach((fs) => {
          const i = Number(fs.dataset.qi);
          const q = quiz.questions[i];
          const v = (name) => fs.querySelector(`[name="${name}"]`);
          const type = v("type").value;
          Object.assign(q, { prompt: v("prompt").value, points: Number(v("points").value) || 0, explanation: v("explanation").value });
          if (Q.isChoice(q)) {
            if (q.type !== "truefalse") q.options = [...fs.querySelectorAll('[name="option"]')].map((x) => x.value);
            q.correct = [...fs.querySelectorAll(`[name="correct-${i}"]`)].filter((x) => x.checked).map((x) => Number(x.value));
          } else q.rubric = v("rubric").value;
          if (type !== q.type) quiz.questions[i] = Q.retype(q, type);
        });
      };
      form.addEventListener("change", (event) => {
        if (event.target.name === "type") {
          read();
          draw();
        }
      });
      form.addEventListener("click", (event) => {
        const b = event.target.closest("button");
        if (!b || b.type === "submit") return;
        read();
        if (b.hasAttribute("data-add-q")) quiz.questions.push({ ...Q.emptyQuestion(1), id: Q.nextQuestionId(quiz.questions) });
        else if (b.dataset.dropQ) quiz.questions.splice(Number(b.dataset.dropQ), 1);
        else if (b.dataset.moveQ) {
          const [i, by] = b.dataset.moveQ.split(":").map(Number);
          const to = i + by;
          if (to >= 0 && to < quiz.questions.length) [quiz.questions[i], quiz.questions[to]] = [quiz.questions[to], quiz.questions[i]];
        } else if (b.dataset.addOption) quiz.questions[Number(b.dataset.addOption)].options.push("");
        else if (b.dataset.dropOption) {
          const [i, k] = b.dataset.dropOption.split(":").map(Number);
          const q = quiz.questions[i];
          q.options.splice(k, 1);
          q.correct = (q.correct || []).filter((c) => c !== k).map((c) => (c > k ? c - 1 : c));
        } else return;
        draw();
      });
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        read();
        quiz.questions.forEach((q) => Q.isChoice(q) && (q.options = (q.options || []).map((o) => o.trim())));
        const errors = Q.validateQuiz(quiz);
        const status = form.querySelector("[data-status]");
        if (errors.length) return UI.setStatus(status, errors.slice(0, 4).join(" "), true);
        const saved = await UI.busy(form, status, () => D.saveQuiz(ctx.state.coven.id, existing?.id, quiz));
        if (saved) {
          await ctx.load();
          ctx.go(ctx.link("view=library"));
        }
      });
    };
    draw();
    return true;
  }

  // --- the program editor: a task's lessons and test ----------------------------------------

  /** The lessons and test fields in a task's editor (the draft task carries docs and quiz). */
  function taskTeachingFields(ctx, t, si, ti) {
    if (t.docs === undefined && t.quiz === undefined && !ctx.data.docs.length && !ctx.data.quizzes.length) {
      return `<p class="sp-caption">Lessons and tests are added from the coven’s own, under Lessons and tests.</p>`;
    }
    const docs = t.docs || [];
    return `<div class="cv-teach-edit" data-teach="${si}:${ti}">
      <p class="sp-label">Lessons to read</p>
      ${docs.length ? `<ol class="cv-teach-list">${docs.map((d, k) => `<li>${esc(d.title)} <button class="button button--ghost button--small" type="button" data-doc-move="${si}:${ti}:${k}:-1">Up</button><button class="button button--ghost button--small" type="button" data-doc-move="${si}:${ti}:${k}:1">Down</button><button class="button button--ghost button--small" type="button" data-doc-drop="${si}:${ti}:${k}">Remove</button></li>`).join("")}</ol>` : `<p class="sp-caption">None yet.</p>`}
      <div class="sp-field"><label>Add a lesson<select data-doc-add="${si}:${ti}"><option value="">Choose one of the coven’s lessons…</option>${ctx.data.docs
        .filter((d) => !docs.some((x) => x.id === d.id))
        .map((d) => `<option value="${esc(d.id)}">${esc(d.title)}</option>`)
        .join("")}</select></label></div>
      <div class="sp-field"><label>Test<select data-quiz-set="${si}:${ti}"><option value="">No test on this step</option>${ctx.data.quizzes
        .map((x) => `<option value="${esc(x.id)}"${t.quiz?.id === x.id ? " selected" : ""}>${esc(x.title)}</option>`)
        .join("")}${t.quiz && !t.quiz.id ? `<option selected>${esc(t.quiz.title)}</option>` : ""}</select></label>
        ${t.quiz ? `<span class="sp-caption">Passing it finishes this step.</span>` : ""}</div>
    </div>`;
  }

  /** Handle the lessons and test fields; `redraw` after a change. */
  function bindTaskTeaching(form, ctx, stages, readAll, redraw) {
    form.addEventListener("change", (event) => {
      const add = event.target.closest?.("[data-doc-add]");
      const quiz = event.target.closest?.("[data-quiz-set]");
      if (!add && !quiz) return;
      readAll();
      if (add && add.value) {
        const [si, ti] = add.dataset.docAdd.split(":").map(Number);
        const d = ctx.data.docs.find((x) => x.id === add.value);
        const t = stages[si].tasks[ti];
        t.docs = [...(t.docs || []), { id: d.id, title: d.title }];
      }
      if (quiz) {
        const [si, ti] = quiz.dataset.quizSet.split(":").map(Number);
        const x = ctx.data.quizzes.find((q) => q.id === quiz.value);
        stages[si].tasks[ti].quiz = x ? { id: x.id, title: x.title } : null;
      }
      redraw();
    });
    form.addEventListener("click", (event) => {
      const move = event.target.closest?.("[data-doc-move]");
      const drop = event.target.closest?.("[data-doc-drop]");
      if (!move && !drop) return;
      event.stopPropagation();
      readAll();
      if (move) {
        const [si, ti, k, by] = move.dataset.docMove.split(":").map(Number);
        const list = stages[si].tasks[ti].docs;
        const to = k + by;
        if (to >= 0 && to < list.length) [list[k], list[to]] = [list[to], list[k]];
      } else {
        const [si, ti, k] = drop.dataset.docDrop.split(":").map(Number);
        stages[si].tasks[ti].docs.splice(k, 1);
      }
      redraw();
    }, true);
  }

  // --- the ready-made course programs ---------------------------------------------------------

  /** The chooser's course paths, drawn into `box` once the courses load. */
  async function chooser(ctx, box, onCopied) {
    const CC = K().courseCopy;
    let catalog = { label: "", names: {}, programs: [] };
    let failed = "";
    try {
      catalog = await coursesCore();
    } catch (error) {
      failed = error.message;
    }
    const courses = catalog.programs;
    const names = catalog.names;
    const choice = CC.chooser(courses, ctx.data.templates, ctx.state.coven, names);
    const ranks = ctx.state.ranks || [];
    const canAward = ctx.state.perms.manage || ctx.state.perms.site;
    const chosen = {};
    const positionFor = (p) => (p.id in chosen ? chosen[p.id] || null : CC.matchAwardRank(p.award, ranks));
    const label = catalog.label;
    const templateRow = (t) => `<li><strong>${esc(t.title)}</strong> <span class="sp-caption">${esc(t.summary || "")}</span> <a class="button button--ghost button--small" href="${esc(ctx.link(`edit=new&from=${encodeURIComponent(t.id)}`))}" data-go>Use this</a></li>`;
    box.innerHTML = `${failed ? `<p class="sp-caption">${esc(failed)}</p>` : ""}${choice.paths
      .map((path) => `<article class="sp-card cv-path" data-path="${esc(path.tradition)}">
        <div class="cv-meta"><span class="cv-pill${path.suggested ? " cv-pill--gold" : ""}">${path.suggested ? "Your coven’s calendar" : "Ready-made"}</span></div>
        <h3>${esc(path.name)}: the whole path</h3>
        <p class="sp-caption">${esc(label)}. Each program teaches with lessons, practice to log, and a test, and has a conversation on every step.</p>
        <ol class="cv-path__steps">${path.programs
          .map((p) => {
            const done = CC.alreadyCopied(ctx.data.programs, p.id);
            return `<li class="cv-path__step" data-course="${esc(p.id)}"><p class="sp-label">${esc(CC.STEP_LABEL[p.path])}</p>
              <h4>${esc(p.title.replace(`${path.name}: `, ""))}</h4><p>${esc(p.summary)}</p>
              <p class="sp-caption">${esc(CC.contentsLine(p))} · <span data-award-line>${esc(CC.awardLine(p.award, ranks, p.awardLabel))}</span>${done ? " · already in the coven" : ""}</p>
              ${p.missing.length ? `<p class="sp-caption">Still being written: ${p.missing.length} part${p.missing.length === 1 ? "" : "s"}. What’s ready is copied now.</p>` : ""}
              ${canAward && p.award ? `<div class="sp-field"><label>Raises those who finish it to<select data-award="${esc(p.id)}"><option value="">(no change of position)</option>${ranks.map((r) => `<option value="${esc(r.id)}"${positionFor(p) === r.id ? " selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label></div>` : ""}
              <button class="button button--ghost button--small" type="button" data-copy="${esc(p.id)}">${done ? "Copy it again" : "Use this"}</button></li>`;
          })
          .join("")}</ol>
        ${path.programs.length > 1 ? `<div class="sp-actions"><button class="button button--primary" type="button" data-copy-all="${esc(path.tradition)}">Use all ${path.programs.length === 5 ? "five" : path.programs.length}</button></div>` : ""}
        ${canAward ? "" : `<p class="sp-caption">The coven’s head chooses the position each program raises people to.</p>`}
        ${statusLine()}</article>`)
      .join("")}
      ${choice.suggestedTemplates.length ? `<h3>Suggested for your coven’s calendar</h3><ul class="cv-template-list">${choice.suggestedTemplates.map(templateRow).join("")}</ul>` : choice.paths.some((p) => p.suggested) ? "" : `<p class="sp-caption">Choose the coven’s practice calendar under Manage to see the ready-made programs for it first.</p>`}
      <details class="sp-details"><summary>${choice.suggestedTemplates.length ? "Ready-made for other calendars" : "More ready-made programs"}</summary><ul class="cv-template-list">${choice.otherTemplates.map(templateRow).join("")}</ul></details>`;
    box.querySelectorAll("[data-award]").forEach((select) =>
      select.addEventListener("change", () => {
        chosen[select.dataset.award] = select.value;
        const name = ranks.find((r) => r.id === select.value)?.name;
        select.closest("[data-course]").querySelector("[data-award-line]").textContent = name ? `Raises those who finish it to ${name}.` : "Doesn’t change anyone’s position.";
      })
    );
    const copy = async (button, list) => {
      const status = button.closest("[data-path]").querySelector(":scope > [data-status]");
      const made = [];
      const all = [...box.querySelectorAll("[data-copy],[data-copy-all]")];
      all.forEach((b) => (b.disabled = true));
      try {
        for (const p of list) {
          UI.setStatus(status, `Copying ${p.title}…`);
          made.push(await D.copyCourseProgram(ctx.state.coven.id, p, canAward ? positionFor(p) : null, (done, of) => UI.setStatus(status, `Copying ${p.title}: ${Math.round((done / of) * 100)}%`)));
        }
        await onCopied(made, status);
      } catch (error) {
        UI.setStatus(status, `${made.length ? `${made.length} copied. ` : ""}${global.CovenLogic.errorMessage(error)}`, true);
      } finally {
        all.forEach((b) => (b.disabled = false));
      }
    };
    box.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => copy(b, courses.filter((p) => p.id === b.dataset.copy))));
    box.querySelectorAll("[data-copy-all]").forEach((b) => b.addEventListener("click", () => copy(b, choice.paths.find((p) => p.tradition === b.dataset.copyAll).programs)));
  }

  /** Draw a course view if the address asks for one. */
  function route(ctx, params) {
    if (params.get("lesson")) return lessonView(ctx, params.get("lesson"), params.get("e"), params.get("t")), true;
    if (params.get("test")) return void testView(ctx, params.get("test"), params.get("e"), params.get("attempt")), true;
    if (params.get("score")) return scoreView(ctx, params.get("score")), true;
    if (params.get("thread")) return void threadView(ctx, params.get("thread"), params.get("e")), true;
    if (params.get("lessonEdit")) return lessonEditView(ctx, params.get("lessonEdit"));
    if (params.get("quizEdit")) return quizEditView(ctx, params.get("quizEdit"));
    if (params.get("view") === "library") return libraryView(ctx);
    return false;
  }

  global.CovenCourse = { load, taskExtras, bindExtras, route, taskTeachingFields, bindTaskTeaching, chooser, coursesCore };
})(window);
