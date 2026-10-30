/*
 * Learn astrology, the course, on the website, as the app has it
 * (app/src/app/(tabs)/rituals/craft/cosmic/course.tsx, lesson.tsx, quiz.tsx):
 * the chapters with progress (?), a lesson (?l=<lesson id>) and a chapter's
 * quiz (?quiz=<chapter id>), started by practice/cosmic/cosmic.js. The course, its progress rules and the lesson
 * reader are the app's own (js/core/astro-course.js); "In your chart" uses the
 * chart engine (js/core/astro.js) and the charts kept in the vault
 * (practice/cosmic/astro-store.js). Progress is a craft entry in
 * 'astro.course', the same shape the app keeps.
 */
(function () {
  "use strict";

  const PB = window.PracticeB;
  const { h } = PB;
  const A = window.SaltCore && window.SaltCore.astro;
  const C = window.SaltCore && window.SaltCore["astro-course"];
  const ST = window.SaltAstroStore;
  const T = window.SaltAstroTerms;
  const esc = h.esc;
  const HUB = { href: "/practice/cosmic/", label: "Cosmic & celestial" };
  const COURSE = { href: "/practice/cosmic/course/", label: "Learn astrology" };
  const tx = (text) => (T ? T.html(text) : esc(text));
  const COLLECTION = () => C.progress.COURSE_COLLECTION;

  // ── Progress ──────────────────────────────────────────────────────────────

  let entry = null;
  async function loadProgress() {
    try {
      const list = window.SaltCraft ? await window.SaltCraft.list(COLLECTION()) : [];
      entry = C.progress.pickProgress(list);
    } catch (error) {
      console.warn("[astro-course]", error);
      entry = null;
    }
    return entry ? C.progress.normalizeCourseProgress(entry.data) : null;
  }
  async function saveProgress(fn) {
    if (!window.SaltCraft) return null;
    const current = entry ? C.progress.normalizeCourseProgress(entry.data) : C.progress.newCourseProgress(new Date());
    const next = fn(current);
    entry = entry ? await window.SaltCraft.update(COLLECTION(), entry.id, next) : await window.SaltCraft.add(COLLECTION(), next);
    return next;
  }

  // ── The learner's chart ───────────────────────────────────────────────────

  async function myChart(user) {
    if (!ST || !A) return { has: false, chart: null };
    try {
      await ST.load(user?.id ?? null);
    } catch {
      return { has: false, chart: null };
    }
    const saved = ST.state.phase === "open" ? (ST.state.data?.charts || []).find((c) => c.relation === "me") : null;
    if (!saved) return { has: false, locked: ST.state.phase === "locked", chart: null };
    let s = {};
    try {
      s = typeof window.getMySettings === "function" ? (await window.getMySettings()) || {} : {};
    } catch {
      s = {};
    }
    return { has: true, chart: A.natal.castChart(saved.input, A.prefs.chartOptionsFrom(s, {})) };
  }

  // ── Pieces ────────────────────────────────────────────────────────────────

  const bar = (percent, label) => `<div class="astro-course-bar" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span style="width:${Math.max(0, Math.min(100, percent))}%"></span></div>`;

  const termChips = (ids, label) => {
    const entries = ids.map((id) => A && A.glossary.term(id)).filter(Boolean);
    return entries.length ? `<p class="sp-caption">${esc(label)}</p>${h.chips(entries.map((e) => `<button type="button" class="sp-chip" data-astro-term="${esc(e.id)}">${esc(`${e.symbol ? `${e.symbol} ` : ""}${e.term}`)}</button>`))}` : "";
  };

  const linkButtons = (links) => {
    const name = (id) => (A ? A.glossary.term(id)?.term : null);
    const items = links
      .map((link) => {
        const label = C.course.astroLinkLabel(link, name);
        if (link.kind === "term") return A && A.glossary.term(link.id) ? `<button type="button" class="sp-chip" data-astro-term="${esc(link.id)}">${esc(label)}</button>` : "";
        const href = C.course.astroLinkSiteHref(link);
        return href ? `<a class="sp-chip astro-course-link" href="${esc(href)}">${esc(`${label} ›`)}</a>` : "";
      })
      .filter(Boolean);
    return items.length ? h.section("Go further", `<div class="sp-chips">${items.join("")}</div>`) : "";
  };

  const yourChart = (kind, mine) => {
    if (!kind) return "";
    if (mine.locked) return h.card(`${h.label("In your chart")}${h.p("Your charts are locked on this browser. Open them on the Charts page to see this lesson in your own chart.")}${h.actions([h.button("Your charts", { variant: "text", href: "/practice/cosmic/charts/" })])}`);
    if (!mine.has) return h.card(`${h.label("In your chart")}${h.p("Add your birth chart to see this lesson in your own chart.")}${h.actions([h.button("Add your chart", { variant: "text", href: "/practice/cosmic/charts/" })])}`);
    const lines = mine.chart && A.courseChart ? A.courseChart.yourChartLines(kind, mine.chart, new Date()) : null;
    return lines && lines.length ? h.card(`${h.label("In your chart")}${lines.map((l) => `<p>${tx(l)}</p>`).join("")}`, { gold: true }) : "";
  };

  // ── The chapters ──────────────────────────────────────────────────────────

  function overview(root, progress) {
    const sum = C.progress.courseSummary(progress);
    const next = C.progress.nextStep(progress);
    const nextHtml = next
      ? h.actions([h.button(next.kind === "lesson" ? `${sum.lessonsRead ? "Continue" : "Begin"}: ${next.lesson.title}` : `Take the quiz: ${next.chapter.title}`, { href: next.kind === "lesson" ? C.course.lessonSiteHref(next.lesson.id) : C.course.quizSiteHref(next.chapter.id) })])
      : h.p("Every lesson read and every quiz passed. Well done; keep the course for reference, and keep reading your chart.");
    PB.paint(
      root,
      [
        h.head("Cosmic & celestial", "Learn astrology", HUB),
        h.muted("A course from the very beginning to reading charts with confidence: twelve chapters, each a few short lessons and a quiz. Lessons show their subject in your own chart where they can."),
        h.card(`${h.label("Your progress")}${h.cardTitle(`${sum.lessonsRead} of ${sum.lessons} lessons read · ${sum.quizzesPassed} of ${sum.quizzes} quizzes passed`)}${bar(sum.percent, `${sum.percent}% of the course`)}${nextHtml}`, { gold: true }),
        C.course.CHAPTERS.map((c, i) => {
          const st = C.progress.chapterState(progress, c);
          const rows = c.lessons.map((l) => h.row({ href: C.course.lessonSiteHref(l.id), title: `${progress && progress.read[l.id] ? "✓ " : ""}${l.title}`, detail: `${l.summary} · ${l.minutes} min` }));
          rows.push(h.row({ href: C.course.quizSiteHref(c.id), title: `${st.quiz && st.quiz.passed ? "✓ " : ""}Quiz: ${c.quiz.title}`, detail: st.quiz ? `Best ${st.quiz.best}% · ${st.quiz.passed ? "passed" : `${c.quiz.passPercent}% to pass`}` : `${c.quiz.questions.length} questions · ${c.quiz.passPercent}% to pass` }));
          return h.details(`${i + 1}. ${c.title}${st.done ? " ✓" : ""}`, `${h.muted(c.summary)}${h.list(rows, c.title)}`, { open: !!next && next.chapter.id === c.id });
        }).join(""),
        `<a class="astro-link" href="/practice/cosmic/learn/">The glossary: every term explained ›</a>`,
        h.muted("These are traditional meanings and tools for reflection, not destiny.")
      ].join("")
    );
  }

  // ── A lesson ──────────────────────────────────────────────────────────────

  function lessonPage(root, lesson, progress, mine) {
    const chapter = C.course.chapterOfLesson(lesson.id);
    const after = C.course.nextLesson(lesson.id);
    const last = chapter.lessons[chapter.lessons.length - 1].id === lesson.id;
    const read = !!(progress && progress.read[lesson.id]);
    const onward = last ? C.course.quizSiteHref(chapter.id) : after ? C.course.lessonSiteHref(after.id) : COURSE.href;
    PB.paint(
      root,
      [
        h.head(chapter.title, lesson.title, COURSE),
        h.caption(`${C.course.lessonPlace(lesson.id)} · about ${lesson.minutes} min${read ? " · read" : ""}`),
        h.muted(lesson.summary),
        `<article class="astro-lesson">${C.lesson.lessonHtml(lesson.body)}</article>`,
        yourChart(lesson.yourChart, mine),
        termChips(lesson.terms, "Terms in this lesson"),
        linkButtons(lesson.links),
        h.actions([
          h.button(last ? "Done: take the chapter quiz" : after ? `Done: next, ${after.title}` : "Done", { attrs: { "data-action": "done", "data-href": onward } }),
          read ? h.button("Mark as not read", { variant: "text", attrs: { "data-action": "unread" } }) : h.button("Mark as read", { variant: "ghost", attrs: { "data-action": "read" } }),
          h.button("All chapters", { variant: "text", href: COURSE.href })
        ])
      ].join("")
    );
    const mark = (on) => saveProgress((p) => C.progress.markLesson(p, lesson.id, on, new Date()));
    PB.bind(root, {
      click: {
        done: async (el) => {
          if (!read) await mark(true);
          window.location.href = el.getAttribute("data-href");
        },
        read: async () => lessonPage(root, lesson, await mark(true), mine),
        unread: async () => lessonPage(root, lesson, await mark(false), mine)
      }
    });
  }

  // ── A quiz ────────────────────────────────────────────────────────────────

  function quizPage(root, chapter, progress) {
    const quiz = chapter.quiz;
    const index = C.course.CHAPTERS.indexOf(chapter);
    const following = C.course.CHAPTERS[index + 1];
    const st = { answers: {}, result: null, message: null, record: progress && progress.quizzes[quiz.id] };
    const question = (q, i) => {
      const multi = q.type === "multi";
      const answer = st.answers[q.id];
      const options = (q.options || [])
        .map((o, k) => {
          const on = Array.isArray(answer) && answer.includes(k);
          return `<label class="astro-quiz__option${on ? " is-on" : ""}"><input type="${multi ? "checkbox" : "radio"}" name="${esc(q.id)}" data-change="answer" data-q="${esc(q.id)}" data-i="${k}"${on ? " checked" : ""} /> <span>${esc(o)}</span></label>`;
        })
        .join("");
      return `<fieldset class="sp-card astro-quiz__q"><legend class="sp-eyebrow">Question ${i + 1} of ${quiz.questions.length}${multi ? " · choose every right answer" : ""}</legend><p class="pb-card-title">${esc(q.prompt)}</p>${options}</fieldset>`;
    };
    const draw = () => {
      const r = st.result;
      PB.paint(
        root,
        [
          h.head(`Chapter ${index + 1} quiz`, quiz.title, COURSE),
          h.muted(`${quiz.intro} ${quiz.passPercent}% to pass; take it as often as you like.${st.record ? ` Your best so far: ${st.record.best}%${st.record.passed ? ", passed" : ""}.` : ""}`),
          !r
            ? `${quiz.questions.map(question).join("")}${st.message ? h.notice(st.message, { live: true }) : ""}${h.actions([h.button("Check my answers", { attrs: { "data-action": "submit" } })])}`
            : [
                h.card(`${h.label(r.passed ? "Passed" : "Not passed yet")}${h.cardTitle(`${r.total} of ${r.max} · ${r.percent}%`)}${h.p(r.passed ? "Well done. The answers are below, each with the reason." : `You need ${quiz.passPercent}% to pass. Read the explanations below, look back at the lessons, and try again whenever you are ready.`)}`, { gold: true, attrs: { role: "status" } }),
                quiz.questions
                  .map((q, i) => h.card(`<p class="sp-eyebrow">Question ${i + 1} · ${r.right[q.id] ? "right" : "not quite"}</p>${h.cardTitle(q.prompt)}${h.p(`Your answer: ${C.quiz.answerWords(q, st.answers[q.id]) || "none"}`)}${r.right[q.id] ? "" : h.p(`The answer: ${C.quiz.rightWords(q)}`, "astro-quiz__right")}${h.muted(q.explanation)}`))
                  .join(""),
                h.actions([
                  r.passed && following ? h.button(`Next chapter: ${following.title}`, { href: C.course.lessonSiteHref(following.lessons[0].id) }) : h.button("Try again", { attrs: { "data-action": "again" } }),
                  r.passed ? "" : h.button("Back to the lessons", { variant: "ghost", href: C.course.lessonSiteHref(chapter.lessons[0].id) }),
                  h.button("All chapters", { variant: "text", href: COURSE.href }),
                  r.passed ? h.button("Take it again", { variant: "text", attrs: { "data-action": "again" } }) : ""
                ])
              ].join("")
        ].join("")
      );
    };
    PB.bind(root, {
      change: {
        answer: (el) => {
          const q = quiz.questions.find((x) => x.id === el.getAttribute("data-q"));
          st.answers[q.id] = C.quiz.choose(q, st.answers[q.id], Number(el.getAttribute("data-i")));
          draw();
        }
      },
      click: {
        submit: async () => {
          const missing = C.quiz.unanswered(quiz.questions, st.answers);
          if (missing.length) {
            st.message = `Answer every question first (question ${missing.map((i) => i + 1).join(", ")}).`;
            return draw();
          }
          st.message = null;
          st.result = C.progress.scoreQuiz(quiz, st.answers);
          draw();
          window.scrollTo({ top: 0 });
          const saved = await saveProgress((p) => C.progress.recordQuiz(p, quiz.id, st.result, new Date()));
          if (saved) st.record = saved.quizzes[quiz.id];
        },
        again: () => {
          st.answers = {};
          st.result = null;
          draw();
        }
      }
    });
    draw();
  }

  // ── The page ──────────────────────────────────────────────────────────────

  async function coursePage(root, user) {
    const progress = await loadProgress();
    const lesson = C.course.lessonById(PB.query("l"));
    const chapter = C.course.chapterById(PB.query("quiz"));
    if (lesson) return lessonPage(root, lesson, progress, await myChart(user));
    if (chapter) return quizPage(root, chapter, progress);
    if (PB.query("l") || PB.query("quiz")) PB.paint(root, `${h.head("Learn astrology", "Not found", COURSE)}${h.p("That lesson or quiz isn’t in the course.")}`);
    else overview(root, progress);
  }

  // practice/cosmic/cosmic.js starts the page (its "cosmic-course" view), as it does every cosmic page.
  window.SaltAstroCourse = {
    page(root, user) {
      if (!C) {
        root.innerHTML = '<p class="sp-notice">This page couldn’t load its tools. Check your connection and refresh.</p>';
        return null;
      }
      return coursePage(root, user);
    }
  };
})();
