/* Rituals home (app: rituals/index.tsx): ritual work. The tools that aren't
 * rituals are on the Craft home (/practice/, practice/hub.js). */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const { esc } = UI;
  const R = global.SaltCore.rituals;
  const D = global.DidItWork;
  let current = [];
  let made = [];

  async function render() {
    const main = UI.root();
    const now = new Date();
    const moon = R.moon.moonState(now);
    const account = S.user();
    const [plans, journal, active, items] = await Promise.all([
      S.loadPlans(),
      S.journal().catch(() => []),
      S.activeSession().catch(() => null),
      S.apothecaryItems().catch(() => []),
      D.loadReadings()
    ]);
    made = items;

    const upcoming = R.plans.upcomingPlans(plans, now);
    const [next, ...later] = upcoming;
    const entries = R.plans.sortJournal(journal);
    const insight = R.insights.journalInsights(journal, now);
    current = journal;
    const due = R.lookBack.dueLookBacks(journal, now);
    // Spell jars, sachets and other workings from My Apothecary, after the journal's.
    const dueMade = R.apothecaryLookBack.dueItems(items, now);
    const shown = Math.max(0, 3 - due.length);
    const more = due.length + dueMade.length - Math.min(due.length, 3) - Math.min(dueMade.length, shown);
    const dueCards = due.length || dueMade.length
      ? `<section class="sp-section" aria-labelledby="rt-due"><h2 class="sp-label" id="rt-due">Did it work?</h2>
          ${due.slice(0, 3).map((entry) => D.card(entry, now, { title: true })).join("")}
          ${dueMade.slice(0, shown).map((item) => D.itemCard(item, now)).join("")}
          ${more > 0 ? `<div class="sp-actions"><a class="button button--ghost" href="/rituals/journal/insights/#did-it-work">${esc(`${more} more to look back on`)}</a></div>` : ""}
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
          <p class="sp-muted">Tap “Plan a ritual” below, and we’ll find the right night.</p>
        </section>`;

    const laterList = later.length
      ? `<section class="sp-section"><h2 class="sp-label">Also planned</h2><div class="sp-list">${later
          .slice(0, 4)
          .map((plan) => UI.row({ href: `/rituals/plan/?id=${encodeURIComponent(plan.id)}`, title: plan.title, detail: R.format.planWhen(plan, now) }))
          .join("")}</div></section>`
      : "";

    // Do, Learn and Record, as the app's Rituals home. Reminders are in your Sanctuary's settings.
    const doList = `
      <section class="sp-section" aria-labelledby="rt-do">
        <h2 class="sp-label" id="rt-do">Do</h2>
        <nav class="sp-list" aria-label="Do">
          ${UI.row({ href: "/altar/?ritual=1", title: "Begin a ritual", detail: "From one of your templates, or a quiet working of your own" })}
          ${UI.row({ href: "/rituals/planner/", title: "Plan a ritual", detail: "The moon phase and weekday for your intention" })}
          ${UI.row({ href: "/rituals/spell/", title: "Build a spell", detail: "Purpose, form, Library ingredients, timing and words" })}
          ${UI.row({ href: "/practice/", title: "Cycle, astrology, divination and more", detail: "Now under Craft, at the top · with the sigil maker and tools for every path" })}
        </nav>
      </section>`;
    const learnList = `
      <section class="sp-section" aria-labelledby="rt-learn">
        <h2 class="sp-label" id="rt-learn">Learn</h2>
        <nav class="sp-list" aria-label="Learn">
          ${UI.row({ href: "/rituals/premade/", title: "Workings library", detail: `${R.premade.PREMADE.length} premade rituals and spells for every practice and path` })}
          ${UI.row({ href: "/rituals/community/", title: "Community Rituals", detail: "Rituals and spells the community has shared · search, add to yours or do once" })}
          ${UI.row({ href: "/rituals/journeys/", title: "Dedication journeys", detail: "Study, practice and a rite of self-dedication, for each path and god" })}
          ${UI.row({ href: "/rituals/year/", title: "A Year and a Day", detail: "Thirteen moons of study and practice alone, ending in a self-dedication" })}
        </nav>
      </section>`;

    // Spell jars, sachets and the rest, with whether they worked (the journal's moon page keeps them).
    const apothecaryRow = UI.row({ href: "/rituals/journal/insights/#did-it-work-made", title: "Apothecary", detail: "Jars & sachets, and whether they worked" })
      // The practice journals (grimoire/journals/journals.js), wherever each lives.
      + UI.row({ href: "/rituals/journals/", title: "Journals", detail: "Shadow work, Deity & spirit, Ancestors, and Omens & signs" });
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
        })}${apothecaryRow}</div>`
      : `<section class="sp-card"><p>Rituals you finish at the altar or in the app are kept in your journal.</p></section>
        <div class="sp-list">${apothecaryRow}</div>`;

    main.innerHTML = `
      ${UI.header({ back: null, eyebrow: moon.name, title: "Rituals" })}
      ${activeCard}
      ${dueCards}
      ${nextCard}
      ${laterList}
      ${doList}
      ${learnList}
      <section class="sp-section" aria-labelledby="rt-journal">
        <div class="rt-head-row">
          <h2 class="sp-label" id="rt-journal">Record</h2>
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
    D.bind(UI.root(), () => current, () => UI.attempt(render, "Your rituals couldn't be opened"), { list: () => made, save: S.saveApothecaryMetadata });
    global.SaltPage.onUserChange(() => UI.attempt(render, "Your rituals couldn't be opened"));
  }

  start();
})(window);
