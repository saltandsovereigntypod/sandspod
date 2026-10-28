/*
 * Dedication journeys on the website, the same as the app's
 * (app/src/app/(tabs)/rituals/journeys): the list, each journey, its stages,
 * lessons, practices, discernment, rites and the year after. One page; the
 * query string picks the view (JourneysLogic.route).
 *
 * Needs: js/salt-store.js, js/core/journeys.js, rituals/js/rituals-logic.js,
 * rituals/journeys/journeys-logic.js and journeys-store.js.
 */
(function (global) {
  "use strict";

  const L = global.JourneysLogic;
  const S = global.JourneysStore;
  const core = () => global.SaltCore.journeys;
  const esc = (text) => global.SaltPage.esc(text);
  const root = global.document.querySelector("[data-page-root]");
  const DAY = 86400000;

  const state = { route: L.route(global.location.search), journey: null, entries: [], entry: null, settings: {}, cadence: {}, readings: [] };

  /** On a deity's journey: the readings drawn for them, and the Patron deity spread to draw (the app's LinkedReadings). */
  function deityReadings(journey) {
    const Ln = core().linked;
    if (journey.kind !== "deity" || !Ln) return "";
    const link = Ln.deityLink(journey.deityRef, journey.title.split(":")[0]);
    const mine = Ln.linkedReadings(state.readings, "deity", link.id);
    return `<section class="sp-section">${label("Readings for this god")}${
      mine.length
        ? `<div class="sp-list">${mine.map((e) => row(e.data.question || Ln.cardsLine(e.data).split("\n")[0] || "A reading", `${core().calendar.fullDate(e.data.date) || e.data.date} · ${e.data.drawn.join(", ")}`, `/divination/reading/?id=${encodeURIComponent(e.id)}`)).join("")}</div>`
        : body("Four cards: what this god asks of you, what they offer, how to honour them, and what stands between you.", true)
    }<p>${textLink("Draw the Patron deity spread", `/divination/draw/${Ln.drawQuery(link)}`)}</p></section>`;
  }

  // ---------------------------------------------------------------- pieces

  const back = (label, url) => `<a class="sp-back" href="${esc(url)}">‹ ${esc(label)}</a>`;
  const title = (eyebrow, text) => `<header class="jr-title">${eyebrow ? `<p class="sp-eyebrow">${esc(eyebrow)}</p>` : ""}<h1>${esc(text)}</h1></header>`;
  const body = (text, muted) => `<p class="${muted ? "sp-muted" : ""}">${esc(text)}</p>`;
  const label = (text, tag = "h2") => `<${tag} class="jr-label">${esc(text)}</${tag}>`;
  const paragraphs = (text) => `<div class="jr-reading">${L.paragraphs(text).map((p) => `<p>${esc(p)}</p>`).join("")}</div>`;
  const card = (inner, gold) => `<section class="sp-card${gold ? " sp-card--gold" : ""}">${inner}</section>`;
  const row = (rowTitle, detail, url, aria) =>
    `<a class="sp-row" href="${esc(url)}"${aria ? ` aria-label="${esc(aria)}"` : ""}><span class="sp-row__text"><span class="sp-row__title">${esc(rowTitle)}</span>${
      detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""
    }</span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;
  const list = (rows) => `<div class="sp-list">${rows.join("")}</div>`;
  const section = (heading, inner) => `<section class="sp-section">${heading ? label(heading) : ""}${inner}</section>`;
  const link = (text, url, kind = "primary") => `<a class="button button--${kind}" href="${esc(url)}">${esc(text)}</a>`;
  const button = (text, action, kind = "primary", extra = "") =>
    `<button class="button button--${kind}" type="button" data-action="${esc(action)}"${extra}>${esc(text)}</button>`;
  const textLink = (text, url, extra = "") => `<a class="jr-link" href="${esc(url)}"${extra}>${esc(text)}</a>`;
  const bullets = (items) => `<ul class="jr-bullets">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  const support = () => `<p class="jr-support"><a href="${L.href.support()}">If this stirs up something heavy, support is here.</a></p>`;
  function progressBar(fraction, name) {
    const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
    return `<div class="jr-progress" role="progressbar" aria-label="${esc(name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>`;
  }
  const confirmAction = (heading, message) => global.confirm(`${heading}\n\n${message}`);
  const tell = (heading, message) => global.alert(`${heading}\n\n${message}`);
  const shortDate = (d) => core().calendar.shortDate(d instanceof Date ? d : new Date(d));
  const fullDate = (d) => core().calendar.fullDate(d);
  const relativeDay = (now, d) => core().calendar.relativeDay(now, d);
  const pathName = (id) => core().traditions.pathName(id);

  function notFound(heading, message, backLabel = "Dedication journeys", backUrl = L.href.home()) {
    return `${back(backLabel, backUrl)}${title("", heading)}${body(message)}`;
  }

  function show(html, pageTitle) {
    root.innerHTML = html;
    root.setAttribute("aria-busy", "false");
    global.document.title = `${pageTitle ? `${pageTitle} | ` : ""}Dedication journeys | Salt & Sovereignty`;
  }

  /** The journey under way (not set down), or null. */
  const going = () => {
    const p = state.entry?.data || null;
    return p && core().progress.journeyStatus(p) !== "stopped" ? p : null;
  };

  /** Save a change to the progress, then show the page again. */
  async function change(fn, then) {
    try {
      state.entry = await S.change(state.entry, fn);
      if (then) return then();
      render();
    } catch (error) {
      tell("Couldn’t save", error?.message || "Please try again.");
    }
  }

  async function begin() {
    try {
      const entry = await S.startJourney(state.journey.id);
      state.entries = [entry, ...state.entries];
      state.entry = entry;
      render();
    } catch (error) {
      tell("Couldn't begin", error?.message || "Please try again.");
    }
  }

  // ---------------------------------------------------------------- home

  function homeLists(query) {
    const C = core();
    const mine = C.traditions.myPath(state.settings).traditions;
    const found = query.trim() ? C.lookup.searchJourneysIn(C.JOURNEY_CATALOG, query) : C.JOURNEY_CATALOG;
    const paths = C.lookup.pathsMineFirstIn(found, mine);
    const groups = C.lookup.deityGroupsIn(found, mine);
    const started = new Set(L.journeysUnderWay(state.entries, C.progress.journeyStatus, (id) => !!S.summary(id)).map((e) => e.data.journeyId));
    const journeyRow = (j) => row(j.title, started.has(j.id) ? `Under way · ${j.summary}` : j.summary, L.href.journey(j.id));
    let html = "";
    if (!paths.length && !groups.length) html += card(body("No journey matches that yet. More are being written."));
    if (paths.length) html += section("Paths", list(paths.map(journeyRow)));
    if (groups.length) {
      html += `<section class="sp-section">${label("Deities")}${groups
        .map((g, gi) => {
          const name = `${pathName(g.path)}${mine.includes(g.path) ? " · your path" : ""}`;
          return mine.includes(g.path) || query.trim() || gi === 0
            ? `<div class="sp-section">${label(name, "h3")}${list(g.journeys.map(journeyRow))}</div>`
            : `<details class="sp-details"><summary>${esc(`${pathName(g.path)} (${g.journeys.length})`)}</summary>${list(g.journeys.map(journeyRow))}</details>`;
        })
        .join("")}</section>`;
    }
    return html;
  }

  async function renderHome() {
    const C = core();
    const mine = C.traditions.myPath(state.settings).traditions;
    const under = L.journeysUnderWay(state.entries, C.progress.journeyStatus, (id) => !!S.summary(id));
    const now = new Date();
    const journeys = await Promise.all(under.map((e) => S.loadJourney(e.data.journeyId).catch(() => null)));
    const yours = under
      .map((e, i) => {
        const j = journeys[i];
        const line = j ? C.progress.nextStepLine(C.progress.nextStep(j, e.data, now, state.cadence)) : "";
        return row(S.summary(e.data.journeyId).title, line, L.href.journey(e.data.journeyId));
      })
      .filter(Boolean);
    show(
      `${back("Rituals", "/rituals/")}
      ${title("Study · practice · discernment · rite", "Dedication journeys")}
      ${body("A dedication is a promise you make yourself, to a path or to a god, after a season of learning and practice. It isn’t an initiation: in most traditions initiation is given by a coven, lineage or teacher, and nothing here stands in for that.")}
      ${body("Go at your own pace. Pause whenever you need; a journey waits for you, and nothing is ever failed.", true)}
      ${yours.length ? section("Your journeys", list(yours)) : ""}
      ${list([row("Patron deities", "What a patron is, how to know if one is calling you, and how to answer", L.href.patron())])}
      <div class="sp-field"><label for="jr-search">Search journeys</label><input id="jr-search" type="search" placeholder="A path or a god: Norse, Hekate, hearth…" autocomplete="off" data-journey-search /></div>
      <div class="jr-results" data-journey-results>${homeLists("")}</div>
      ${!mine.length ? body("Choose your path in Settings → Living Library → My path to put its journeys first.", true) : ""}`
    );
    const input = root.querySelector("[data-journey-search]");
    const results = root.querySelector("[data-journey-results]");
    input.addEventListener("input", () => {
      results.innerHTML = homeLists(input.value);
    });
  }

  // ---------------------------------------------------------------- journey

  function stepCard(journey, step) {
    const P = core().progress;
    const detail = L.stepDetail(step, shortDate);
    const url = L.stepHref(journey, step);
    return card(
      `<p class="sp-eyebrow">Today</p><h2 class="jr-card-title">${esc(P.nextStepLine(step))}</h2>${detail ? body(detail, true) : ""}<div class="sp-actions">${link(L.STEP_ACTION[step.kind], url)}</div>`,
      true
    );
  }

  function renderJourney() {
    const C = core();
    const P = C.progress;
    const journey = state.journey;
    const now = new Date();
    const progress = state.entry?.data || null;
    const status = progress ? P.journeyStatus(progress) : null;
    const g = going();
    const here = g ? P.currentStage(journey, g) : null;
    const pace = g ? P.stagePace(journey, g, now) : null;
    const step = g ? P.nextStep(journey, g, now, state.cadence) : null;
    const total = P.suggestedDays(journey);

    const seen = new Set();
    const holyDays = P.holyDaysBetween(journey, now, new Date(now.getTime() + 380 * DAY), state.cadence.choice, state.cadence.hidden).filter((h) => {
      if (seen.has(h.name)) return false;
      seen.add(h.name);
      return true;
    });

    let top;
    if (g && step && here && pace) {
      const paceLine =
        status !== "paused" && here.stage.kind !== "ongoing"
          ? body(pace.over ? `Day ${pace.day}. The suggestion was ${L.lengthWords(pace.suggested)}; take all the time it needs.` : `Day ${pace.day} of ${L.lengthWords(pace.suggested)}`, true)
          : "";
      top =
        stepCard(journey, step) +
        card(
          `${label(`Stage ${here.index + 1} of ${journey.stages.length} · ${L.STAGE_WORDS[here.stage.kind]}`)}
          <h3 class="jr-card-title">${esc(here.stage.title)}</h3>${paceLine}
          ${progressBar(P.stageCompletion(journey, g, here.index).fraction, `${here.stage.title}: progress`)}
          <div class="sp-actions">${link("Open this stage", L.href.stage(journey.id, here.index), "ghost")}
          ${g.dedicatedAt ? link("Holy days and rededication", L.href.ongoing(journey.id), "ghost") : ""}
          ${status === "paused" ? button("Pick it up again", "resume") : button("Pause for now", "pause", "ghost")}</div>`
        );
    } else {
      const stopped = status === "stopped" && progress?.decision;
      top = card(
        `${label(status === "stopped" ? "Set down with grace" : "Before you begin")}
        ${
          stopped
            ? body(`You set this journey down on ${shortDate(progress.decision.at)}. That was a real choice, and a good one to have made honestly. You can begin again any time.`)
            : paragraphs(journey.welcome)
        }
        ${body(`Six stages, about ${total} days in all, then a year of keeping it. Pause whenever you need.`, true)}
        <div class="sp-actions">${button(status === "stopped" ? "Begin again" : "Begin this journey", "begin")}</div>`,
        true
      );
    }

    const stages = journey.stages.map((s, i) => {
      const done = g ? g.stageDoneAt[s.kind] : null;
      const current = here?.index === i;
      return row(`${i + 1}. ${s.title}`, `${L.STAGE_WORDS[s.kind]} · ${L.lengthWords(s.days)}${current ? " · you are here" : done ? " · done" : ""}`, L.href.stage(journey.id, i));
    });

    show(
      `${back("Dedication journeys", L.href.home())}
      ${title(`${journey.kind === "path" ? "Path" : "Deity"} · ${journey.paths.map(pathName).join(" · ")}`, journey.title)}
      ${body(journey.summary)}
      ${top}
      <section class="sp-section">${label("About")}${paragraphs(journey.about)}${
        journey.deityRef ? `<p>${textLink("Open in the Living Library", L.href.library(journey.deityRef))}</p>` : ""
      }</section>
      ${deityReadings(journey)}
      ${journey.notes.length ? card(`${label("Things to know first")}${bullets(journey.notes)}`, true) : ""}
      ${
        holyDays.length
          ? section(
              "Holy days",
              card(
                holyDays
                  .map((h) => `<div class="jr-holy"><h3 class="jr-card-title">${esc(h.name)}</h3>${body(`${shortDate(h.date)}${h.days > 1 ? ` · ${h.days} days` : ""} · ${h.meaning}`, true)}</div>`)
                  .join("")
              )
            )
          : ""
      }
      ${section("The six stages", list(stages))}
      ${journey.sources.length ? `<details class="sp-details"><summary>Sources</summary>${bullets(journey.sources)}</details>` : ""}
      ${global.ResearchNote ? global.ResearchNote.footerHtml(journey.title, "Dedication journey") : ""}`,
      journey.title
    );
    on("begin", begin);
    on("resume", () => change((p) => P.resumeJourney(p, new Date())));
    on("pause", () => {
      if (confirmAction("Pause this journey?", "It will wait for you, just as it is. Pick it up again whenever you like.")) change((p) => P.pauseJourney(p, new Date()));
    });
  }

  // ---------------------------------------------------------------- stage

  function practiceWhen(s, pr, now) {
    if (s?.done) return "done";
    if (s?.due) return "good to do today";
    if (s?.nextAt) return `next ${s.nextName ? `${s.nextName}, ` : ""}${relativeDay(now, s.nextAt)}`;
    return L.everyWords(pr.every);
  }

  function beginCard(text) {
    return card(`${body(text)}<div class="sp-actions">${button("Begin this journey", "begin")}</div>`, true);
  }

  function renderStage() {
    const P = core().progress;
    const journey = state.journey;
    const index = state.route.stage;
    const stage = journey.stages[index];
    if (!stage) return show(notFound("Not found", "This stage isn’t here any more.", "Journey", L.href.journey(journey.id)), "Not found");
    const now = new Date();
    const g = going();
    const current = g ? P.stageIndex(journey, g) === index : false;
    const completion = g ? P.stageCompletion(journey, g, index) : null;
    const pace = g && current ? P.stagePace(journey, g, now) : null;
    const next = journey.stages[index + 1] || null;

    const lessons = stage.lessons.map((l) => {
      const read = g?.lessonsRead[l.id];
      return row(l.title, `${read ? "Read · " : ""}about ${l.minutes} min · ${l.summary}`, L.href.lesson(journey.id, l.id), `${l.title}. ${read ? "Read." : "Not read yet."} About ${l.minutes} minutes. ${l.summary}`);
    });
    const practices = stage.practices.map((pr) => {
      const s = g ? P.practiceState(pr, journey, g, now, state.cadence) : null;
      const count = s ? `${Math.min(s.count, s.times)} of ${s.times}` : pr.times === 1 ? "Once" : `${pr.times} times`;
      return row(pr.title, `${count} · ${practiceWhen(s, pr, now)}`, L.href.practice(journey.id, pr.id));
    });
    const extras = [];
    if (stage.rite) extras.push(row(stage.rite.title, `${completion?.riteDone ? "Done · " : ""}${stage.rite.summary}`, L.href.rite(journey.id, index)));
    if (stage.kind === "discernment") extras.push(row("Discern", g?.decision ? "Your choice is made" : "The honest questions, and your choice", L.href.discern(journey.id)));
    if (stage.kind === "ongoing") extras.push(row("Holy days and rededication", "What’s coming up, and your yearly renewal", L.href.ongoing(journey.id)));

    let moveOn = "";
    if (g && current && next && stage.kind !== "discernment") {
      moveOn = completion?.complete
        ? card(`${body(`Everything in this stage is done. When you’re ready: ${next.title}.`)}<div class="sp-actions">${button(`Move on to ${next.title}`, "move-on")}</div>`, true)
        : `<div class="sp-actions">${button(`Move on to ${next.title} when you’re ready`, "move-on", "ghost")}</div>`;
    }

    show(
      `${back(journey.title, L.href.journey(journey.id))}
      ${title(`Stage ${index + 1} of ${journey.stages.length} · ${L.STAGE_WORDS[stage.kind]} · ${L.lengthWords(stage.days)}`, stage.title)}
      ${paragraphs(stage.intro)}
      ${pace && stage.kind !== "ongoing" ? body(pace.over ? `Day ${pace.day}. No hurry: the length was only a suggestion.` : `Day ${pace.day} of ${L.lengthWords(pace.suggested)}`, true) : ""}
      ${completion ? progressBar(completion.fraction, `${stage.title}: progress`) : ""}
      ${!g ? beginCard("You can read everything here. Begin the journey to keep your place, tick off practices and mark lessons read.") : ""}
      ${lessons.length ? section(`Lessons${completion ? ` · ${completion.lessonsRead} of ${completion.lessonsTotal} read` : ""}`, list(lessons)) : ""}
      ${practices.length ? section("Practices", list(practices)) : ""}
      ${extras.length ? list(extras) : ""}
      ${moveOn}
      ${g && !current ? `<div class="sp-actions">${button("Make this my current stage", "make-current", "ghost")}</div>` : ""}`,
      stage.title
    );
    on("begin", begin);
    on("move-on", () => {
      if (
        !completion?.complete &&
        !confirmAction(`Move on to ${next?.title ?? "the next stage"}?`, "You don’t have to finish everything first. What you’ve done stays, and you can come back to this stage any time.")
      )
        return;
      change(
        (p) => P.advanceStage(journey, p, new Date()),
        () => global.location.assign(L.href.stage(journey.id, index + 1))
      );
    });
    on("make-current", () => {
      if (confirmAction(`Make “${stage.title}” your stage now?`, "Nothing you’ve done is lost. The days for this stage start from today.")) change((p) => P.goToStage(journey, p, index, new Date()));
    });
  }

  // ---------------------------------------------------------------- lesson

  /** A question to sit with, and a space to write about it that's kept in the ritual journal. */
  function journalPrompt(prompt, index) {
    return `<div class="jr-prompt" data-prompt="${index}">
      <p class="jr-question">${esc(prompt)}</p>
      <div class="jr-prompt-body" data-prompt-body>${button("Write in my journal", `prompt-open:${index}`, "ghost", ` aria-label="Write in my journal about: ${esc(prompt)}"`)}</div>
    </div>`;
  }

  function wirePrompts(prompts, journalTitle, intention) {
    prompts.forEach((prompt, index) => {
      const box = root.querySelector(`[data-prompt="${index}"] [data-prompt-body]`);
      const closed = () => {
        box.innerHTML = button("Write in my journal", `prompt-open:${index}`, "ghost", ` aria-label="Write in my journal about: ${esc(prompt)}"`);
      };
      on(`prompt-open:${index}`, () => {
        const id = `jr-reflect-${index}`;
        box.innerHTML = `<div class="sp-field"><label for="${id}">Your reflection</label><textarea id="${id}" placeholder="Whatever comes. No one else reads this."></textarea></div>
          <div class="sp-actions">${button("Save to my journal", `prompt-save:${index}`)}${button("Not now", `prompt-close:${index}`, "ghost")}</div>`;
        box.querySelector("textarea").focus();
      });
      on(`prompt-close:${index}`, closed);
      on(`prompt-save:${index}`, async (target) => {
        const text = box.querySelector("textarea").value.trim();
        if (!text) return;
        target.disabled = true;
        target.textContent = "Saving…";
        try {
          await S.saveJournal({ title: journalTitle, intention: intention ?? prompt, notes: `${prompt}\n\n${text}` });
          box.innerHTML = `<p class="sp-caption" role="status">Kept in your journal · <a class="jr-link" href="${L.href.journal()}">open it</a></p>`;
        } catch (error) {
          target.disabled = false;
          target.textContent = "Save to my journal";
          tell("Couldn't save to your journal", error?.message || "Your words are still here; please try again.");
        }
      });
    });
  }

  /** The premade workings a lesson or practice points to, from the Rituals pages' book (loaded only when needed). */
  async function fillPremade(ids) {
    const box = root.querySelector("[data-premade]");
    if (!box || !ids.length) return;
    let book = global.SaltCore.rituals?.premade;
    if (!book) {
      // js/core/rituals.js reads the Traditional Library, so that comes first.
      await loadTraditional();
      await new Promise((resolve) => {
        const script = global.document.createElement("script");
        script.src = "/js/core/rituals.js";
        script.onload = resolve;
        script.onerror = resolve;
        global.document.head.append(script);
      });
      book = global.SaltCore.rituals?.premade;
    }
    const found = ids.map((id) => book?.premadeById?.(id)).filter(Boolean);
    if (!found.length) {
      box.remove();
      return;
    }
    box.outerHTML = box.dataset.premade === "lesson"
      ? section("Put it into practice", list(found.map((p) => row(p.title, p.summary, L.href.premade(p.id)))))
      : list(found.map((p) => row(p.title, "A guided working for this practice", L.href.premade(p.id))));
  }

  function renderLesson() {
    const C = core();
    const P = C.progress;
    const journey = state.journey;
    const found = C.lookup.findLesson(journey, state.route.lesson);
    if (!found) return show(notFound("Not found", "This lesson isn’t here any more.", "Journey", L.href.journey(journey.id)), "Not found");
    const { lesson, stage, index } = found;
    const g = going();
    const read = g?.lessonsRead[lesson.id];
    const after = C.lookup.nextLesson(journey, lesson.id);

    let actions;
    if (read) {
      actions = `${body("Marked as read.", true)}<div class="sp-actions">${
        after ? link(`Next: ${after.title}`, L.href.lesson(journey.id, after.id)) : link(`Back to ${stage.title}`, L.href.stage(journey.id, index))
      }${button("Mark as not read", "toggle-read", "ghost")}</div>`;
    } else if (g) {
      actions = `<div class="sp-actions">${button("Mark as read", "toggle-read")}</div><p class="sp-caption">Read it in more than one sitting if you like. It keeps.</p>`;
    } else {
      actions = `${body("Begin the journey to keep track of what you’ve read.", true)}<div class="sp-actions">${button("Begin this journey", "begin", "ghost")}</div>`;
    }

    show(
      `${back(stage.title, L.href.stage(journey.id, index))}
      ${title(`${journey.title} · ${L.STAGE_WORDS[stage.kind]} · about ${lesson.minutes} min`, lesson.title)}
      <p class="jr-lede">${esc(lesson.summary)}</p>
      ${lesson.sections.map((s) => `<section class="jr-passage"><h2 class="jr-heading">${esc(s.heading)}</h2>${paragraphs(s.body)}</section>`).join("")}
      ${card(`${label("What we know")}${paragraphs(lesson.knowAndDont.known)}${label("What we don’t")}${paragraphs(lesson.knowAndDont.unknown)}`, true)}
      ${card(`${label("In practice")}${paragraphs(lesson.inPractice)}`)}
      ${lesson.reflect.length ? section("To reflect on", lesson.reflect.map(journalPrompt).join("")) : ""}
      ${(lesson.premade || []).length ? `<div data-premade="lesson"></div>` : ""}
      ${
        (lesson.library || []).length
          ? section(
              "In the Living Library",
              list(lesson.library.map((ref) => {
                const name = L.libraryName(ref, C.libraryItem);
                return row(name, "", L.href.library(ref), `${name}. Open in the Library`);
              }))
            )
          : ""
      }
      ${(lesson.further || []).length ? card(`${label("Further reading")}${bullets(lesson.further)}`) : ""}
      ${actions}
      ${support()}`,
      lesson.title
    );
    wirePrompts(lesson.reflect, `${journey.title}: ${lesson.title}`, `Reflection on ${lesson.title}`);
    fillPremade(lesson.premade || []);
    on("begin", begin);
    on("toggle-read", () => change((p) => (read ? P.markUnread(p, lesson.id) : P.markRead(p, lesson.id, new Date()))));
  }

  // ---------------------------------------------------------------- practice

  function renderPractice() {
    const C = core();
    const P = C.progress;
    const journey = state.journey;
    const found = C.lookup.findPractice(journey, state.route.practice);
    if (!found) return show(notFound("Not found", "This practice isn’t here any more.", "Journey", L.href.journey(journey.id)), "Not found");
    const { practice, stage, index } = found;
    const now = new Date();
    const g = going();
    const s = g ? P.practiceState(practice, journey, g, now, state.cadence) : null;
    const log = [...((g && g.practiceLog[practice.id]) || [])].sort((a, b) => (a.at < b.at ? 1 : -1));

    const stateCard = s
      ? card(
          `${label(`${Math.min(s.count, s.times)} of ${s.times} done`)}
          ${progressBar(s.count / s.times, `${practice.title}: ${s.count} of ${s.times} done`)}
          ${body(
            s.done
              ? "Done. You can keep going if it’s become part of you."
              : s.due
                ? "Good to do today."
                : s.nextAt
                  ? `Next comes round ${s.nextName ? `with ${s.nextName} ` : ""}${relativeDay(now, s.nextAt)}. You can still mark it any time.`
                  : "Whenever you choose.",
            true
          )}
          ${practice.prompt ? `<p class="jr-question">${esc(practice.prompt)}</p>` : ""}
          <div class="sp-field"><label for="jr-note">A note (optional)</label><textarea id="jr-note" placeholder="What you noticed, felt or did" data-note></textarea></div>
          <label class="jr-check" data-to-journal hidden><input type="checkbox" data-journal-too /> Also keep it in my journal</label>
          <div class="sp-actions">${button("I did this", "record")}</div>`,
          true
        )
      : beginCard("Begin the journey to tick off each time you do this practice.");

    show(
      `${back(stage.title, L.href.stage(journey.id, index))}
      ${title(`${journey.title} · ${practice.times === 1 ? "once" : `${practice.times} times`} · ${L.everyWords(practice.every)}`, practice.title)}
      ${paragraphs(practice.instructions)}
      ${practice.premade ? `<div data-premade="practice"></div>` : ""}
      ${stateCard}
      ${
        log.length
          ? section(
              "Times you’ve done it",
              card(
                log
                  .map((e) => `<div class="jr-log"><h3 class="jr-card-title">${esc(shortDate(e.at))}</h3>${e.note ? body(e.note) : ""}${button("Remove", `remove:${e.at}`, "ghost", ' aria-label="Remove this time: it stops counting"')}</div>`)
                  .join("")
              )
            )
          : ""
      }`,
      practice.title
    );
    fillPremade(practice.premade ? [practice.premade] : []);
    on("begin", begin);
    const note = root.querySelector("[data-note]");
    const toJournal = root.querySelector("[data-to-journal]");
    note?.addEventListener("input", () => {
      toJournal.hidden = !note.value.trim();
    });
    on("record", async (target) => {
      const text = note.value;
      const alsoJournal = root.querySelector("[data-journal-too]").checked;
      target.disabled = true;
      target.textContent = "Saving…";
      try {
        state.entry = await S.change(state.entry, (p) => P.logPractice(p, practice.id, new Date(), text));
        if (alsoJournal && text.trim()) {
          await S.saveJournal({
            title: `${journey.title}: ${practice.title}`,
            intention: practice.title,
            notes: practice.prompt ? `${practice.prompt}\n\n${text.trim()}` : text.trim()
          }).catch(() => tell("Kept here, not in the journal", "Your note is saved with the practice; the journal couldn’t be reached."));
        }
        render();
      } catch (error) {
        target.disabled = false;
        target.textContent = "I did this";
        tell("Couldn’t save", error?.message || "Please try again.");
      }
    });
    log.forEach((e) =>
      on(`remove:${e.at}`, () => {
        if (confirmAction("Remove this time?", "It will no longer count toward the practice.")) change((p) => P.unlogPractice(p, practice.id, e.at));
      })
    );
  }

  // ---------------------------------------------------------------- discern

  function renderDiscern() {
    const P = core().progress;
    const journey = state.journey;
    const at = journey.stages.findIndex((s) => s.kind === "discernment");
    const stage = at >= 0 ? journey.stages[at] : null;
    if (!stage) return show(notFound("Not found", "This journey has no discernment stage.", "Journey", L.href.journey(journey.id)), "Not found");
    const questions = stage.questions || [];
    const g = going();
    const saved = state.entry?.data?.answers || {};
    const chosen = g?.decision ? L.CHOICES.find((c) => c.kind === g.decision.kind) : null;

    show(
      `${back(stage.title, L.href.stage(journey.id, at))}
      ${title(`${journey.title} · Discernment`, stage.title)}
      ${paragraphs(stage.intro)}
      ${body("There’s no wrong answer here, and nothing to prove. Write as much or as little as you like; only you see it.", true)}
      ${!g ? beginCard("Begin the journey to keep your answers and make your choice.") : ""}
      ${
        questions.length
          ? `<section class="sp-section">${label("Questions to sit with")}${questions
              .map(
                (q, i) =>
                  `<div class="sp-field jr-answer"><p class="jr-question" id="jr-q-${i}">${esc(q)}</p><label class="sr-only" for="jr-a-${i}">Your answer to question ${i + 1}</label><textarea id="jr-a-${i}" aria-describedby="jr-q-${i}" data-answer="${i}">${esc(saved[String(i)] || "")}</textarea></div>`
              )
              .join("")}${g ? `<div class="sp-actions">${button("Keep my answers", "save-answers", "ghost")}${button("Keep them in my journal too", "answers-journal", "ghost")}</div><p class="sp-caption" role="status" data-answers-status></p>` : ""}</section>`
          : ""
      }
      ${
        g?.decision
          ? card(
              `${label("Your choice")}${body(`On ${shortDate(g.decision.at)} you chose: ${chosen ? chosen.title : g.decision.kind}.`)}${g.decision.note ? body(g.decision.note, true) : ""}${body("You can choose again below if something has changed.", true)}`
            )
          : ""
      }
      ${
        g
          ? `<section class="sp-section">${label("Your choice")}<div class="sp-field"><label for="jr-why">A word about why (optional)</label><textarea id="jr-why" data-why></textarea></div>${L.CHOICES.map((c) =>
              card(`<h3 class="jr-card-title">${esc(c.title)}</h3>${body(c.body)}<div class="sp-actions">${button(c.action, `choose:${c.kind}`, c.kind === "continue" ? "primary" : "ghost")}</div>`, c.kind === "continue")
            ).join("")}</section>`
          : ""
      }
      ${support()}`,
      stage.title
    );
    on("begin", begin);
    const answers = () => {
      const out = {};
      root.querySelectorAll("[data-answer]").forEach((t) => {
        out[t.dataset.answer] = t.value;
      });
      return out;
    };
    const withAnswers = (p) => ({ ...p, answers: { ...(p.answers || {}), ...answers() } });
    const status = (text) => {
      const node = root.querySelector("[data-answers-status]");
      if (node) node.textContent = text;
    };
    on("save-answers", async () => {
      try {
        state.entry = await S.change(state.entry, withAnswers);
        status("Your answers are kept.");
      } catch (error) {
        tell("Couldn’t save", error?.message || "Please try again.");
      }
    });
    on("answers-journal", async () => {
      const text = L.answersText(questions, answers());
      if (!text) return;
      try {
        state.entry = await S.change(state.entry, withAnswers);
        await S.saveJournal({ title: `${journey.title}: discernment`, intention: "Discerning whether to dedicate", notes: text });
        status("Your answers are kept, here and in your journal.");
      } catch (error) {
        tell("Couldn't save to your journal", error?.message || "Your answers are kept here; please try again.");
      }
    });
    L.CHOICES.forEach((c) =>
      on(`choose:${c.kind}`, async (target) => {
        const note = root.querySelector("[data-why]").value;
        target.disabled = true;
        try {
          state.entry = await S.change(state.entry, (p) => P.decide(journey, withAnswers(p.paused ? P.resumeJourney(p, new Date()) : p), c.kind, new Date(), note));
          if (c.kind === "continue") return global.location.assign(L.href.stage(journey.id, at + 1));
          if (c.kind === "another") return global.location.assign(L.href.home());
          if (c.kind === "stop") tell("Set down with grace", "Thank you for listening honestly. Everything you learned is still yours. You can begin again any time.");
          global.location.assign(L.href.journey(journey.id));
        } catch (error) {
          target.disabled = false;
          tell("Couldn’t save", error?.message || "Please try again.");
        }
      })
    );
  }

  // ---------------------------------------------------------------- rite

  /** After the dedication: keep the deity in My deities as Dedicated (DeityYours.tsx KeepDedicated). */
  async function keepDedicatedMarkup(journey, since) {
    if (!journey.deityRef) return "";
    const key = journey.deityRef.split("/").pop();
    await loadTraditional();
    const record = traditional()?.deity?.[key];
    const name = String(record?.DisplayName || key);
    const kept = L.keepDedicated(core().mine, state.settings, journey.deityRef, name, since);
    if (!kept) return "";
    if (kept.kept) return `<p class="sp-caption">${esc(`${name} is in My deities as ${kept.level === "patron" ? "your patron" : "dedicated"}.`)}</p>`;
    return `<div class="sp-actions" data-keep-box>${button(`Keep ${name} in My deities`, "keep-dedicated", "ghost", ' aria-describedby="jr-keep-hint"')}</div><p class="sp-caption" id="jr-keep-hint">Adds them to My deities as Dedicated, from the day of your dedication.</p>`;
  }

  const traditional = () => (typeof global.TraditionalLibrary !== "undefined" ? global.TraditionalLibrary : typeof TraditionalLibrary !== "undefined" ? TraditionalLibrary : null); // eslint-disable-line no-undef
  function loadTraditional() {
    if (traditional()) return Promise.resolve();
    // Once, however many parts of the page ask (js/environment.js).
    if (global.SaltScripts) return global.SaltScripts.traditionalLibrary().catch(() => {});
    return new Promise((resolve) => {
      const script = global.document.createElement("script");
      script.src = "/js/traditional-library.js";
      script.onload = resolve;
      script.onerror = resolve;
      global.document.head.append(script);
    });
  }

  async function renderRite() {
    const P = core().progress;
    const journey = state.journey;
    const index = state.route.stage;
    const stage = journey.stages[index];
    const rite = stage?.rite;
    if (!rite) return show(notFound("Not found", "This rite isn’t here any more.", "Journey", L.href.journey(journey.id)), "Not found");
    const g = going();
    const sessionId = g?.riteSessions?.[stage.kind];
    const doneAt = g?.ritesDoneAt?.[stage.kind] ?? (stage.kind === "dedication" ? g?.dedicatedAt : undefined);
    const activeId = S.activeRitualId();
    const underWay = !!activeId && activeId === sessionId;
    const pending = (() => {
      try {
        const p = JSON.parse(global.localStorage.getItem(S.KEYS.pendingRite) || "null");
        return p && p.journeyId === journey.id && p.kind === stage.kind ? p : null;
      } catch {
        return null;
      }
    })();
    const otherRunning = !!activeId && !underWay && !pending;
    const isDedication = stage.kind === "dedication";

    let top;
    if (doneAt) {
      top = card(
        `${label(isDedication ? "Dedicated" : "Done")}
        ${body(
          isDedication
            ? `You made your dedication on ${fullDate(doneAt)}. What comes now is the keeping of it: the holy days, the small daily things, and a rededication each year.`
            : `You did this rite on ${fullDate(doneAt)}.`
        )}
        ${isDedication ? `<div data-keep></div>` : ""}
        ${isDedication ? `<div class="sp-actions">${button("On to the year after", "enter-ongoing")}</div>` : ""}`,
        true
      );
    } else {
      top = `<div class="jr-rite-actions">
        <div class="sp-actions">${
          underWay || (pending && activeId)
            ? link("Continue the rite", L.href.ritual())
            : button("Begin the rite", "begin-rite", "primary", otherRunning ? " disabled" : "")
        }${g ? button("I’ve done it", "mark-done", "ghost", ' aria-describedby="jr-done-hint"') : ""}</div>
        ${g ? `<p class="sp-caption" id="jr-done-hint">“I’ve done it” marks the rite done, if you did it in your own way.</p>` : ""}
        ${otherRunning ? body("Finish the ritual that’s under way before beginning this one.", true) : ""}
        ${!g ? `${body("Begin the journey to keep a record of this rite.", true)}<div class="sp-actions">${button("Begin this journey", "begin", "ghost")}</div>` : ""}
        ${(sessionId || pending) && !underWay ? body("When you finish the guided rite, it’s marked done here by itself.", true) : ""}
      </div>`;
    }

    show(
      `${back(stage.title, L.href.stage(journey.id, index))}
      ${title(`${journey.title} · ${L.STAGE_WORDS[stage.kind]} · about ${rite.minutes} min`, rite.title)}
      ${body(rite.summary)}
      ${top}
      ${rite.safety ? card(`${label("Take care")}${body(rite.safety)}`, true) : ""}
      ${card(
        `${label("You’ll need")}${
          rite.ingredients.length ? bullets(rite.ingredients.map((item) => `${item.name}${item.optional ? " (optional)" : ""}`)) : body("Nothing but yourself.")
        }${rite.preparation ? paragraphs(rite.preparation) : ""}`
      )}
      <section class="sp-section">${label("Steps")}<ol class="jr-steps">${rite.steps
        .map(
          (step) => `<li class="jr-step"><div class="jr-step__text"><h3 class="jr-card-title">${esc(step.title)}</h3>${body(step.instructions)}${
            step.spoken ? `<p class="jr-spoken">${esc(step.spoken)}</p>` : ""
          }${step.minutes ? body(`${step.minutes} min`, true) : ""}</div></li>`
        )
        .join("")}</ol></section>
      ${card(`${label("Closing")}${paragraphs(rite.closing)}`)}
      ${support()}`,
      rite.title
    );

    on("begin", begin);
    on("begin-rite", (target) => {
      target.disabled = true;
      try {
        S.beginRite(journey, stage);
      } catch (error) {
        target.disabled = false;
        tell("Couldn't begin", error?.message || "Please try again.");
      }
    });
    on("mark-done", () => {
      const ok = confirmAction(
        isDedication ? "You’ve made your dedication?" : "You’ve done this rite?",
        isDedication ? "Today will be kept as the day of your dedication, and a year from now you’ll be invited to rededicate." : "It will be marked done for this stage."
      );
      if (ok) change((p) => P.riteDone(p, stage.kind, new Date()));
    });
    on("enter-ongoing", () =>
      change(
        (p) => P.enterOngoing(journey, p, new Date()),
        () => global.location.assign(L.href.ongoing(journey.id))
      )
    );
    const keep = root.querySelector("[data-keep]");
    if (keep) {
      keep.innerHTML = await keepDedicatedMarkup(journey, String(doneAt));
      on("keep-dedicated", async (target) => {
        target.disabled = true;
        try {
          state.settings = await global.SaltSettings.get();
          const key = journey.deityRef.split("/").pop();
          const name = String(traditional()?.deity?.[key]?.DisplayName || key);
          const kept = L.keepDedicated(core().mine, state.settings, journey.deityRef, name, String(doneAt));
          if (kept && !kept.kept) state.settings = await global.SaltSettings.patch({ [core().mine.MY_DEITIES_KEY]: kept.value });
          keep.innerHTML = await keepDedicatedMarkup(journey, String(doneAt));
        } catch (error) {
          target.disabled = false;
          tell("Couldn’t save", error?.message || "Please try again.");
        }
      });
    }
  }

  // ---------------------------------------------------------------- ongoing

  function renderOngoing() {
    const P = core().progress;
    const journey = state.journey;
    const now = new Date();
    const at = L.stageIndexOf(journey, "ongoing");
    const stage = at >= 0 ? journey.stages[at] : null;
    if (!stage) return show(notFound("Not found", "This journey isn’t here any more."), "Not found");
    const holyDays = P.holyDaysBetween(journey, now, new Date(now.getTime() + 366 * DAY), state.cadence.choice, state.cadence.hidden).slice(0, 12);
    const g = going();
    const re = g ? P.rededication(g, now) : null;
    const dedicationAt = L.stageIndexOf(journey, "dedication");

    const reCard = re
      ? `<h3 class="jr-card-title">${esc(
          re.due ? "A year has turned: time to rededicate" : re.soon ? `Your rededication comes ${relativeDay(now, re.nextAt)}` : `Next rededication: ${fullDate(re.nextAt)}`
        )}</h3>
        ${body(`Dedicated on ${fullDate(g.dedicatedAt)}${re.count ? ` · rededicated ${re.count} ${re.count === 1 ? "time" : "times"}, last on ${fullDate(re.lastAt)}` : ""}.`, true)}
        ${body("Many keep the anniversary by renewing the promise: the dedication rite again, or simple words at the shrine. If it no longer fits, letting it go with thanks is honest too.")}
        <div class="sp-actions">${
          dedicationAt >= 0 && journey.stages[dedicationAt].rite ? link("Read the dedication rite again", L.href.rite(journey.id, dedicationAt), re.due ? "primary" : "ghost") : ""
        }${button("I’ve rededicated", "rededicate", "ghost")}</div>`
      : body("After your dedication, a rededication comes round each year. You’ll see it here.");

    const practices = stage.practices.map((pr) => {
      const s = g ? P.practiceState(pr, journey, g, now, state.cadence) : null;
      return row(pr.title, `${s ? `${Math.min(s.count, s.times)} of ${s.times} · ` : ""}${s?.due ? "good to do today" : L.everyWords(pr.every)}`, L.href.practice(journey.id, pr.id));
    });

    show(
      `${back(journey.title, L.href.journey(journey.id))}
      ${title(`${journey.title} · The year after`, stage.title)}
      ${paragraphs(stage.intro)}
      ${card(`${label("Rededication")}${reCard}`, true)}
      ${
        holyDays.length
          ? section(
              "Holy days coming up",
              card(
                holyDays
                  .map((h) => {
                    const rel = relativeDay(now, h.date);
                    const when = rel === shortDate(h.date) ? shortDate(h.date) : `${rel} · ${shortDate(h.date)}`;
                    return `<div class="jr-holy"><h3 class="jr-card-title">${esc(h.name)}</h3>${body(`${when} · ${h.meaning}`, true)}</div>`;
                  })
                  .join("")
              )
            )
          : ""
      }
      ${practices.length ? section("Keeping it", list(practices)) : ""}
      ${stage.lessons.length ? body(`There ${stage.lessons.length === 1 ? "is a lesson" : `are ${stage.lessons.length} lessons`} for this year in the stage itself.`, true) : ""}`,
      stage.title
    );
    on("rededicate", () => {
      if (confirmAction("You’ve rededicated?", "Today will be kept as your rededication, and the next comes round in a year.")) change((p) => P.rededicate(p, new Date()));
    });
  }

  // ---------------------------------------------------------------- wiring

  let handlers = new Map();
  /** Run `fn(button)` when a [data-action] with this name is pressed. */
  function on(action, fn) {
    handlers.set(action, fn);
  }
  root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target || target.disabled) return;
    const fn = handlers.get(target.dataset.action);
    if (fn) fn(target);
  });

  function render() {
    handlers = new Map();
    const view = state.route.view;
    if (view === "home") return renderHome();
    if (!state.journey) return show(notFound("Not found", "This journey isn’t here any more."), "Not found");
    switch (view) {
      case "stage": return renderStage();
      case "lesson": return renderLesson();
      case "practice": return renderPractice();
      case "discern": return renderDiscern();
      case "rite": return renderRite();
      case "ongoing": return renderOngoing();
      default: return renderJourney();
    }
  }

  async function load() {
    root.setAttribute("aria-busy", "true");
    try {
      await global.SaltPage.ready();
      const [settings, entries, journey, readings] = await Promise.all([
        S.settings(),
        S.progressEntries().catch(() => []),
        state.route.id ? S.loadJourney(state.route.id) : Promise.resolve(null),
        global.SaltCraft && core().READINGS ? global.SaltCraft.list(core().READINGS).catch(() => []) : []
      ]);
      state.readings = core().normalizeReading ? readings.map((e) => ({ ...e, data: core().normalizeReading(e.data) })) : [];
      state.settings = settings;
      state.cadence = S.cadence(settings);
      state.entries = entries;
      state.journey = journey;
      state.entry = journey ? S.progressFor(entries, journey.id) : null;
      if (state.entry) state.entry = await S.reconcileRites(state.entry);
      await render();
    } catch (error) {
      show(`${back("Dedication journeys", L.href.home())}${title("", "Something went wrong")}${body(error?.message || "Please reload the page.")}`, "");
    }
  }

  global.SaltPage.onUserChange(load);
  load();
})(window);
