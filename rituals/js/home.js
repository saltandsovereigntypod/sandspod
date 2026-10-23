/* Rituals home (app: rituals/index.tsx). */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const { esc } = UI;
  const R = global.SaltCore.rituals;
  const D = global.DidItWork;
  let current = [];

  async function render() {
    const main = UI.root();
    const now = new Date();
    const moon = R.moon.moonState(now);
    const account = S.user();
    const [plans, journal, active] = await Promise.all([
      S.loadPlans(),
      S.journal().catch(() => []),
      S.activeSession().catch(() => null)
    ]);

    const upcoming = R.plans.upcomingPlans(plans, now);
    const [next, ...later] = upcoming;
    const entries = R.plans.sortJournal(journal);
    const insight = R.insights.journalInsights(journal, now);
    current = journal;
    const due = R.lookBack.dueLookBacks(journal, now);
    const dueCards = due.length
      ? `<section class="sp-section" aria-labelledby="rt-due"><h2 class="sp-label" id="rt-due">Did it work?</h2>
          ${due.slice(0, 3).map((entry) => D.card(entry, now, { title: true })).join("")}
          ${due.length > 3 ? `<div class="sp-actions"><a class="button button--ghost" href="/rituals/journal/insights/#did-it-work">${esc(`${due.length - 3} more to look back on`)}</a></div>` : ""}
        </section>`
      : "";

    let activeCard = "";
    if (active) {
      const steps = active.session_steps || [];
      const step = steps.find((s) => s.status === "active") || null;
      const index = step ? steps.findIndex((s) => s.id === step.id) : -1;
      activeCard = `
        <section class="sp-card sp-card--gold">
          <p class="sp-eyebrow">${active.status === "paused" ? "Paused" : "Under way"}</p>
          <h2>${esc(active.title || "Your ritual")}</h2>
          <p class="sp-muted">${esc(step && steps.length ? `Step ${index + 1} of ${steps.length} · ${step.title}` : "Take the time you need, then finish and journal it.")}</p>
          <div class="sp-actions"><a class="button button--primary" href="/altar/?ritual=1">Continue the ritual</a></div>
        </section>`;
    }

    const nextCard = next
      ? `<section class="sp-card sp-card--gold">
          <p class="sp-eyebrow">Your next working</p>
          <h2>${esc(next.title)}</h2>
          <p class="sp-muted">${esc(`${R.format.planWhen(next, now)} · ${R.format.planSky(next)}`)}</p>
          <div class="sp-actions"><a class="button button--ghost" href="/rituals/plan/?id=${encodeURIComponent(next.id)}">Open the plan</a></div>
        </section>`
      : `<section class="sp-card sp-card--gold">
          <p class="sp-eyebrow">Your next working</p>
          <h2>Nothing planned yet</h2>
          <p class="sp-muted">Choose an intention and we'll find the right night.</p>
          <div class="sp-actions"><a class="button button--primary" href="/rituals/planner/">Plan a ritual</a></div>
        </section>`;

    const laterList = later.length
      ? `<section class="sp-section"><h2 class="sp-label">Also planned</h2><div class="sp-list">${later
          .slice(0, 4)
          .map((plan) => UI.row({ href: `/rituals/plan/?id=${encodeURIComponent(plan.id)}`, title: plan.title, detail: R.format.planWhen(plan, now) }))
          .join("")}</div></section>`
      : "";

    const tools = `
      <nav class="sp-list" aria-label="Rituals">
        ${UI.row({ href: "/altar/?ritual=1", title: "Begin a ritual", detail: "From one of your templates, or a quiet working of your own" })}
        ${UI.row({ href: "/rituals/premade/", title: "Rituals & spells", detail: `${R.premade.PREMADE.length} premade workings for every practice and path` })}
        ${UI.row({ href: "/rituals/planner/", title: "Plan a night", detail: "Moon phase and weekday for your intention" })}
        ${UI.row({ href: "/rituals/spell/", title: "Build a spell", detail: "Ingredients from the Library, steps to follow" })}
        ${UI.row({ href: "/rituals/journeys/", title: "Dedication journeys", detail: "Study, practice and a rite of self-dedication, for each path and god" })}
        ${UI.row({ href: "/practice/", title: "My practice", detail: "Tools for your craft: garden, hearth, dreams, stars, stones, tides and more" })}
        ${UI.row({ href: "/reminders/", title: "Reminders & calendar", detail: "Moon phases, planned rituals, devotions and sacred days in your calendar" })}
      </nav>`;

    const journalList = entries.length
      ? `<div class="sp-list">${entries
          .slice(0, 5)
          .map((entry) => UI.row({ href: "/?sanctuary=rituals", title: entry.title || "Untitled Ritual", detail: R.format.journalDetail(entry) }))
          .join("")}</div>
        ${entries.length > 5 ? `<div class="sp-actions"><a class="button button--ghost" href="/?sanctuary=rituals">See all ${entries.length} rituals</a></div>` : ""}
        <div class="sp-list">${UI.row({
          href: "/rituals/journal/insights/",
          title: "Your moon",
          detail: insight.lines[0] || "Which moons you work under, what for, and what works for you"
        })}</div>`
      : `<section class="sp-card"><p>Rituals you finish at the altar or in the app are kept in your journal.</p></section>`;

    main.innerHTML = `
      ${UI.header({ back: null, eyebrow: moon.name, title: "Rituals" })}
      ${activeCard}
      ${dueCards}
      ${nextCard}
      ${laterList}
      ${tools}
      <section class="sp-section" aria-labelledby="rt-journal">
        <div class="rt-head-row">
          <h2 class="sp-label" id="rt-journal">Journal</h2>
          <a class="rt-text-link" href="/?sanctuary=rituals">Record a ritual</a>
        </div>
        ${journalList}
      </section>
      ${
        account
          ? ""
          : UI.signInCard("Your rituals are kept in this browser. Sign in to keep them with your Salt & Sovereignty account and see them in the app.")
      }`;
  }

  async function start() {
    await global.SaltPage.ready();
    await UI.attempt(render, "Your rituals couldn't be opened");
    D.bind(UI.root(), () => current, () => UI.attempt(render, "Your rituals couldn't be opened"));
    global.SaltPage.onUserChange(() => UI.attempt(render, "Your rituals couldn't be opened"));
  }

  start();
})(window);
