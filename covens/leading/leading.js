/*
 * Leading a coven (/covens/leading/): the founder's training (seven modules,
 * each a lesson, a reflection kept in this browser only, and a short test),
 * and a coven's application to be listed in Find a coven. As in the app
 * (app/src/app/(tabs)/coven/leading/): ?m=<module> opens a module,
 * ?apply=<coven address> the application. The rules are the app's own
 * (SaltCore.covens.founding); the database decides.
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const L = global.CovenLogic;
  const D = global.CovenData;
  const FD = global.FoundingData;
  const UI = global.CovenUI;
  const { esc, prose, href } = UI;
  const { header } = global.GuidesUI;
  const K = () => global.SaltCore.covens;
  const F = () => K().founding;

  const params = new URLSearchParams(global.location.search);
  const top = (title, eyebrow, back, backLabel) => header({ title, eyebrow, back, backLabel });
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const linkButtons = (links) =>
    (links || [])
      .map((l) => ({ l, url: K().courseLinks.courseLinkSiteHref(l, null) }))
      .filter((x) => x.url)
      .map((x) => `<a class="button button--ghost button--small" href="${esc(href(x.url))}">${esc(K().courseLinks.courseLinkLabel(x.l))}</a>`)
      .join("");
  const store = {
    get(key) {
      try {
        return global.localStorage.getItem(key) || "";
      } catch {
        return "";
      }
    },
    set(key, value) {
      try {
        global.localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
  };

  // --- the hub ------------------------------------------------------------------

  async function hub(context) {
    const Fo = F();
    const rows = context.user ? await FD.training(context.user.id) : [];
    const status = Fo.trainingStatus(rows);
    let founded = [];
    if (context.user) {
      const mine = ((await D.myMemberships(context.user.id).catch(() => [])) || []).map((m) => m.covens).filter((c) => c && c.founder_id === context.user.id);
      founded = await Promise.all(mine.map(async (c) => ({ coven: c, latest: c.listing_approved_at ? null : await FD.latest(c.id) })));
    }
    root.innerHTML = `${top("Leading a coven", "Covens", "/covens/", "Back to covens")}
      <p>${esc(Fo.TRAINING_TITLE)}: seven short modules on holding space and consent, safeguarding, running rites in the app, conflict and endings, cultural respect, crisis signposting, and age, privacy and money. Each has a lesson, a reflection that stays private to you, and a short test.</p>
      <p class="sp-caption">Needed before a coven is listed in Find a coven; open to anyone, and worth doing for a coven kept to friends too.</p>
      ${context.user ? "" : UI.signInCard("take the training and keep your progress")}
      ${status.done ? `<div class="sp-card sp-card--gold"><p class="sp-eyebrow">✦ Badge</p><h2>${esc(Fo.BADGE_LABEL)}</h2><p class="sp-caption">You have passed every module. The badge shows on your listing applications.</p></div>` : ""}
      <section class="sp-section"><h2 class="sp-label">${esc(context.user ? status.line : "The modules")}</h2>
        <ol class="cv-lesson-list">${Fo.FOUNDER_MODULES.map(
          (m) => `<li><a href="${esc(href(`/covens/leading/?m=${m.slug}`))}">${status.passed.has(m.id) ? "✓ " : ""}${esc(m.title)}</a>
            <span class="sp-caption">${status.passed.has(m.id) ? "Passed" : status.next && status.next.id === m.id ? "Next" : "Lesson, reflection and test"}</span></li>`
        ).join("")}</ol></section>
      ${founded.length ? `<section class="sp-section"><h2 class="sp-label">Covens you founded</h2>${founded
        .map(({ coven, latest }) => `<p><a href="${esc(href(`/covens/leading/?apply=${encodeURIComponent(coven.slug)}`))}">${esc(coven.name)}</a><br /><span class="sp-caption">${esc(Fo.listingState(coven, latest).line)}</span></p>`)
        .join("")}</section>` : ""}
      <p class="sp-notice">${esc(Fo.LISTING_NOTE)}</p>
      <div class="sp-actions"><a class="button button--ghost" href="${esc(href("/covens/new/"))}">Found a coven</a><a class="button button--ghost" href="${esc(href("/more/support/"))}">Support: crisis, grief and other help lines</a></div>`;
  }

  // --- one module ---------------------------------------------------------------

  async function moduleView(context, slug) {
    const Fo = F();
    const meta = Fo.moduleBySlug(slug);
    const back = ["/covens/leading/", "Leading a coven"];
    if (!meta) {
      root.innerHTML = `${top("Leading a coven", "Covens", ...back)}<p class="sp-notice">That module wasn’t found.</p>`;
      return;
    }
    const index = Fo.FOUNDER_MODULES.indexOf(meta);
    const next = Fo.FOUNDER_MODULES[index + 1];
    const head = top(meta.title, `Leading a coven · module ${index + 1} of ${Fo.FOUNDER_MODULES.length}`, ...back);
    root.innerHTML = `${head}<p class="sp-caption">Loading the lesson…</p>`;
    let course;
    try {
      course = await FD.loadCourse();
    } catch (error) {
      root.innerHTML = `${head}<p class="sp-notice">${esc(error.message)}</p>`;
      return;
    }
    const { doc, quiz } = Fo.moduleParts(course, meta.slug);
    const rows = context.user ? await FD.training(context.user.id) : [];
    const passedBefore = rows.some((r) => r.module_id === meta.id);
    const key = Fo.reflectionKey(meta.slug);
    const prompt = Fo.FOUNDER_REFLECTIONS[meta.slug] || "";
    const question = (q, i) => {
      const multi = q.type === "multi";
      return `<fieldset class="sp-card cv-question" data-q="${esc(q.id)}"><legend class="sp-eyebrow">Question ${i + 1} of ${quiz.questions.length}${multi ? " · choose every right answer" : ""}</legend>
        <p>${esc(q.prompt)}</p>
        ${(q.options || []).map((o, j) => `<label class="cv-check"><input type="${multi ? "checkbox" : "radio"}" name="${esc(q.id)}" value="${j}" /> <span>${esc(o)}</span></label>`).join("")}
      </fieldset>`;
    };
    root.innerHTML = `${head}
      ${passedBefore ? `<p class="sp-notice">You have passed this module. Read it again whenever you like.</p>` : ""}
      ${doc ? `<p class="sp-caption">${esc(K().lesson.readingTime(doc))}</p><p>${esc(doc.summary)}</p><div class="cv-lesson__body">${K().lesson.lessonHtml(doc.body)}</div>
        ${doc.links && doc.links.length ? `<div class="sp-actions">${linkButtons(doc.links)}</div>` : ""}` : ""}
      ${doc ? `<section class="sp-section"><h2 class="sp-label">Reflection</h2><div class="sp-card">
        <p>${esc(prompt)}</p>
        <div class="sp-field"><label for="reflection">Your reflection (kept in this browser only)</label><textarea id="reflection" rows="6" maxlength="8000" data-reflection>${esc(store.get(key))}</textarea></div>
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-keep>Keep my reflection</button></div>
        <p class="sp-caption" role="status" aria-live="polite" data-kept>Not sent to anyone, and not part of the test. You might copy it into your ritual journal or your coven’s rules.</p>
      </div></section>` : ""}
      ${quiz ? `<form class="sp-section" data-quiz><h2 class="sp-label">${esc(quiz.title)}</h2>
        <p class="sp-caption">${esc(quiz.intro)} The pass mark is ${Number(quiz.passPercent) || Fo.PASS_PERCENT}%; you may take it again.</p>
        ${quiz.questions.map(question).join("")}
        <div data-result></div>
        <div class="sp-actions"><button class="button button--primary" type="submit">Check my answers</button></div>${statusLine()}</form>` : ""}
      <div class="sp-actions">${next ? `<a class="button button--ghost" href="${esc(href(`/covens/leading/?m=${next.slug}`))}">Next: ${esc(next.title)}</a>` : ""}<a class="button button--ghost" href="${esc(href("/covens/leading/"))}">All the modules</a></div>`;

    root.querySelector("[data-keep]")?.addEventListener("click", () => {
      const ok = store.set(key, root.querySelector("[data-reflection]").value);
      root.querySelector("[data-kept]").textContent = ok ? "Kept in this browser." : "This browser won’t keep it. Copy it somewhere safe.";
    });
    const form = root.querySelector("[data-quiz]");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector("[data-status]");
      const answers = {};
      for (const q of quiz.questions) {
        const chosen = [...form.querySelectorAll(`[data-q="${q.id}"] input:checked`)].map((i) => Number(i.value));
        if (chosen.length) answers[q.id] = chosen;
      }
      const scored = Fo.scoreModule(quiz, answers);
      if (scored.unanswered) return UI.setStatus(status, `Answer every question first (${scored.unanswered} left).`, true);
      form.querySelector("[data-result]").innerHTML = `<div class="sp-card${scored.passed ? " sp-card--gold" : ""}"><h3>${scored.passed ? "Passed" : "Not passed yet"}</h3>
        <p>${scored.score} of ${scored.max}. ${scored.passed ? "Well done." : "Read the lesson again, then try once more."}</p>
        <ol>${quiz.questions.map((q) => `<li class="sp-caption">${esc(q.explanation)}</li>`).join("")}</ol></div>`;
      if (!scored.passed) return UI.setStatus(status, "");
      if (!context.user) return UI.setStatus(status, "Sign in to keep your progress.", true);
      const done = await UI.busy(form, status, () => FD.recordTraining(meta.id, scored.score, scored.max), { done: "Passed and kept." });
      if (done) UI.setStatus(status, `Every module passed: you have the ${Fo.BADGE_LABEL} badge.`);
    });
  }

  // --- the application ----------------------------------------------------------

  async function apply(context, slug) {
    const Fo = F();
    const back = ["/covens/leading/", "Leading a coven"];
    if (!context.user) {
      root.innerHTML = `${top("Apply to be listed", "Find a coven listing", ...back)}${UI.signInCard("apply for your coven to be listed")}`;
      return;
    }
    const coven = await D.coven(slug).catch(() => null);
    if (!coven) {
      root.innerHTML = `${top("Apply to be listed", "Find a coven listing", ...back)}<p class="sp-notice">That coven wasn’t found.</p>`;
      return;
    }
    const [latest, rows, membership, ranks] = await Promise.all([FD.latest(coven.id), FD.training(context.user.id), D.membership(coven.id, context.user.id).catch(() => null), D.ranks(coven.id).catch(() => [])]);
    const rank = ranks.find((r) => membership && r.id === membership.rank_id);
    const manages = coven.founder_id === context.user.id || !!(rank && rank.can_manage && membership.status === "active");
    const state = Fo.listingState(coven, latest);
    const training = Fo.trainingStatus(rows);
    const draft = latest && (latest.status === "changes" || latest.status === "declined") ? Fo.emptyDraft(latest) : Fo.emptyDraft();
    const own = !Fo.LEADER_TITLES.includes(draft.leader_title);
    const showForm = manages && state.canApply && (!latest || latest.status !== "pending");

    root.innerHTML = `${top(coven.name, "Find a coven listing", ...back)}
      <div class="sp-card${state.key === "listed" || state.key === "approved" ? " sp-card--gold" : ""}">
        <p>${esc(state.line)}</p>
        ${latest ? `<p class="sp-caption">Latest application: ${esc(Fo.STATUS_WORDS[latest.status])}.</p>` : ""}
        ${latest && latest.moderator_note && (latest.status === "changes" || latest.status === "declined") ? `<p>The moderators wrote: “${esc(latest.moderator_note)}”</p>` : ""}
        ${latest && latest.status === "pending" && manages ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-withdraw>Withdraw the application</button></div>` : ""}
        ${statusLine()}
      </div>
      ${manages ? "" : `<p class="sp-notice">Only the coven’s leaders can apply for it to be listed.</p>`}
      ${showForm && !training.done ? `<div class="sp-card"><p>First, the founder’s training: ${esc(training.line)}</p><div class="sp-actions"><a class="button button--primary" href="${esc(href(training.next ? `/covens/leading/?m=${training.next.slug}` : "/covens/leading/"))}">${esc(training.next ? `Continue: ${training.next.title}` : "Open the training")}</a></div></div>` : ""}
      ${showForm && training.done ? `<form class="sp-card" data-apply>
        <h2>Your application</h2>
        <p class="sp-caption">${esc(Fo.BADGE_LABEL)}: your training shows on the application. The moderators read every one; most are answered within a few days.</p>
        <div class="sp-grid-2">
          <div class="sp-field"><label for="ap-title-choice">Your title as leader</label>
            <select id="ap-title-choice" name="title_choice">${[...Fo.LEADER_TITLES, "own"].map((t) => `<option value="${esc(t)}"${(own ? "own" : draft.leader_title) === t ? " selected" : ""}>${esc(t === "own" ? "My own title" : t)}</option>`).join("")}</select></div>
          <div class="sp-field" data-own-title${own ? "" : " hidden"}><label for="ap-own">Your own title</label><input id="ap-own" name="own_title" maxlength="60" value="${esc(own ? draft.leader_title : "")}" placeholder="Elder, Keeper, Gothi…" /></div>
        </div>
        ${Fo.QUESTIONS.map((q) => `<div class="sp-field"><label for="ap-${q.key}">${esc(q.label)}</label><span class="sp-caption">${esc(q.hint)}</span><textarea id="ap-${q.key}" name="${q.key}" rows="5" maxlength="${q.max}">${esc(draft[q.key])}</textarea></div>`).join("")}
        <label class="cv-check"><input type="checkbox" name="agree" /> <span>I will lead this coven by the <a href="${esc(href("/covens/guidelines/"))}" target="_blank" rel="noopener">coven guidelines</a> and the community guidelines.</span></label>
        <label class="cv-check"><input type="checkbox" name="adult" /> <span>I am 18 or older.</span></label>
        <div class="sp-actions"><button class="button button--primary" type="submit">Send to the moderators</button></div>${statusLine()}
      </form>` : ""}
      <div class="sp-actions"><a class="button button--ghost" href="${esc(href(`/covens/coven/?c=${encodeURIComponent(coven.slug)}`))}">Open the coven</a><a class="button button--ghost" href="${esc(href("/covens/leading/"))}">The founder’s training</a></div>`;

    root.querySelector("[data-withdraw]")?.addEventListener("click", async (event) => {
      if (await UI.busy(event.currentTarget, root.querySelector("[data-status]"), () => FD.withdraw(latest.id).then(() => true))) apply(context, slug);
    });
    const f = root.querySelector("[data-apply]");
    if (!f) return;
    f.elements.title_choice.addEventListener("change", () => (f.querySelector("[data-own-title]").hidden = f.elements.title_choice.value !== "own"));
    f.addEventListener("submit", async (event) => {
      event.preventDefault();
      const d = {
        leader_title: f.elements.title_choice.value === "own" ? f.elements.own_title.value : f.elements.title_choice.value,
        path: f.elements.path.value,
        experience: f.elements.experience.value,
        why: f.elements.why.value,
        safety: f.elements.safety.value,
        agree: f.elements.agree.checked,
        adult: f.elements.adult.checked,
      };
      const status = f.querySelector("[data-status]");
      const errors = Fo.validateApplication(d, training.done);
      if (errors.length) return UI.setStatus(status, errors.join(" "), true);
      if (await UI.busy(f, status, () => FD.submit(coven.id, d).then(() => true))) apply(context, slug);
    });
  }

  UI.boot().then(async (context) => {
    try {
      if (params.get("m")) await moduleView(context, params.get("m"));
      else if (params.get("apply")) await apply(context, params.get("apply"));
      else await hub(context);
    } catch (error) {
      console.error(error);
      root.insertAdjacentHTML("beforeend", `<p class="sp-notice">${esc(L.errorMessage(error))}</p>`);
    }
  });
})(window);
