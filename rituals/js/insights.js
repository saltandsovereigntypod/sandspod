/* Your moon: journal insights (app: rituals/journal/insights.tsx). */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const { esc } = UI;
  const R = global.SaltCore.rituals;

  // How lit each phase is, for the little moons beside the counts.
  const LIGHT = {
    "New Moon": [0, true],
    "Waxing Crescent": [0.25, true],
    "First Quarter": [0.5, true],
    "Waxing Gibbous": [0.8, true],
    "Full Moon": [1, true],
    "Waning Gibbous": [0.8, false],
    "Last Quarter": [0.5, false],
    "Waning Crescent": [0.25, false]
  };
  const JOURNAL = "/?sanctuary=rituals";

  async function render() {
    const main = UI.root();
    const journal = await S.journal();
    const insights = R.insights.journalInsights(journal, new Date());
    const most = Math.max(1, ...insights.byPhase.map((p) => p.count));
    const last = insights.lastThisPhase;
    const lastWords = last ? last.entry.what_happened_during || last.entry.feelings_after || last.entry.notes || last.entry.intention : null;

    const summary =
      insights.total < 3
        ? `<section class="sp-card"><p>${esc(
            insights.total === 0
              ? "Journal a few rituals and the patterns in your practice will gather here: which moons you work under, what for, and what you did last time the moon looked like this."
              : "A few more rituals and the patterns in your practice will start to show here."
          )}</p></section>`
        : insights.lines.length
          ? `<section class="sp-card sp-card--gold">${insights.lines.map((line) => `<p>${esc(line)}</p>`).join("")}</section>`
          : "";

    main.innerHTML = `
      ${UI.header({ back: { href: "/rituals/", label: "Rituals" }, eyebrow: `${insights.total} ${insights.total === 1 ? "ritual" : "rituals"}`, title: "Your moon" })}
      ${summary}
      ${
        last
          ? `<section class="sp-section" aria-labelledby="rt-last"><h2 class="sp-label" id="rt-last">${esc(`Last ${last.phase}`)}</h2>
              <div class="sp-list">${UI.row({
                href: JOURNAL,
                title: last.entry.title || "Untitled Ritual",
                detail: [R.format.journalDetail(last.entry), lastWords ? String(lastWords).slice(0, 120) : ""].filter(Boolean).join(" — ")
              })}</div></section>`
          : ""
      }
      ${
        insights.total > 0
          ? `<section class="sp-section" aria-labelledby="rt-phase"><h2 class="sp-label" id="rt-phase">By phase</h2>
              <div class="sp-card">
                <ul class="rt-bars">${insights.byPhase
                  .map(
                    ({ phase, count }) => `<li class="rt-bar">
                      ${UI.moon(LIGHT[phase][0], LIGHT[phase][1], 22)}
                      <span class="rt-bar__label">${esc(phase)}</span>
                      <span class="rt-bar__track" aria-hidden="true"><span style="width:${(count / most) * 100}%"></span></span>
                      <span class="rt-bar__count"><span class="sr-only">: </span>${count}<span class="sr-only"> ${count === 1 ? "ritual" : "rituals"}</span></span>
                    </li>`
                  )
                  .join("")}</ul>
                <p class="sp-muted">${esc(`${insights.thisMoon} this moon · ${insights.lastMoon} last moon`)}</p>
              </div></section>`
          : ""
      }
      ${
        insights.watching.length
          ? `<section class="sp-section" aria-labelledby="rt-watch"><h2 class="sp-label" id="rt-watch">Still watching for</h2>
              <div class="sp-list">${insights.watching
                .map((entry) => UI.row({ href: JOURNAL, title: entry.results || "", detail: `${entry.title || "Untitled Ritual"} · ${R.format.journalDetail(entry)}` }))
                .join("")}</div></section>`
          : ""
      }
      <p class="sp-caption">Worked out from your own journal: the rituals you finish at the altar or in the app, and the ones you record.</p>`;
  }

  async function start() {
    await global.SaltPage.ready();
    await UI.attempt(render, "Your journal couldn't be opened");
    global.SaltPage.onUserChange(() => UI.attempt(render, "Your journal couldn't be opened"));
  }

  start();
})(window);
