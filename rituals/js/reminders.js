/*
 * Reminders & calendar (app: rituals/reminders.tsx). Browsers can't ring at a
 * set time, so the website offers calendar files and Google Calendar links:
 * your calendar does the reminding.
 */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const L = global.RitualsLogic;
  const { esc } = UI;
  const R = global.SaltCore.rituals;

  const PHASES = ["new", "firstQuarter", "full", "lastQuarter"];
  const PHASES_KEY = "salt.rituals.calendarPhases";

  function chosenPhases() {
    try {
      const saved = JSON.parse(global.localStorage.getItem(PHASES_KEY) || "null");
      if (saved && typeof saved === "object") return Object.fromEntries(PHASES.map((p) => [p, !!saved[p]]));
    } catch {
      /* fall through to the default */
    }
    return { new: true, firstQuarter: false, full: true, lastQuarter: false };
  }
  function keepPhases(phases) {
    try {
      global.localStorage.setItem(PHASES_KEY, JSON.stringify(phases));
    } catch {
      /* This visit still has them. */
    }
  }

  const state = { plans: [], templates: [], phases: chosenPhases() };

  function render() {
    const main = UI.root();
    const now = new Date();
    const upcoming = R.plans.upcomingPlans(state.plans, now);
    const planRows = upcoming
      .map((plan) => {
        const template = R.plans.planTemplate(plan, state.templates);
        const event = R.calendarEvent.planEvent(plan, template);
        return `<li class="rt-cal-row">
          <div><a class="rt-text-link" href="/rituals/plan/?id=${encodeURIComponent(plan.id)}">${esc(plan.title)}</a>
          <p class="sp-caption">${esc(R.format.planWhen(plan, now))}</p></div>
          <div class="sp-actions">
            <button type="button" class="button button--ghost" data-ics="${esc(plan.id)}" aria-label="${esc(`Download ${plan.title} for my calendar`)}">.ics</button>
            ${event ? `<a class="button button--ghost" href="${esc(R.calendarEvent.googleCalendarUrl(event))}" target="_blank" rel="noopener" aria-label="${esc(`Add ${plan.title} to Google Calendar`)}">Google Calendar</a>` : ""}
          </div>
        </li>`;
      })
      .join("");

    main.innerHTML = `
      ${UI.header({ eyebrow: "In your calendar", title: "Reminders" })}
      <section class="sp-card sp-card--gold">
        <p>Reminders arrive in the Salt & Sovereignty phone app. Browsers can’t send them at a set time, so here you can add your plans and the moon’s phases to your own calendar, and let it remind you.</p>
      </section>

      <section class="sp-section" aria-labelledby="rt-planned">
        <h2 class="sp-label" id="rt-planned">Planned rituals</h2>
        ${
          upcoming.length
            ? `<ul class="sp-card rt-cal-list">${planRows}</ul>`
            : `<section class="sp-card"><p>Nothing planned yet.</p><div class="sp-actions"><a class="button button--ghost" href="/rituals/planner/">Plan a ritual</a></div></section>`
        }
        <p class="sp-caption">The .ics file opens in Apple Calendar, Outlook and Google Calendar. Changing a plan later doesn’t change the copy in your calendar; add it again.</p>
      </section>

      <section class="sp-section" aria-labelledby="rt-phases">
        <h2 class="sp-label" id="rt-phases">Moon phases</h2>
        <div class="sp-card">
          <div class="sp-chips">${PHASES.map((p) => {
            const next = R.moon.nextPhase(now, p);
            return UI.chip(R.moon.PRINCIPAL_NAMES[p], { pressed: state.phases[p], attrs: `data-phase="${p}" title="${esc(`${R.moon.PRINCIPAL_NAMES[p]}, next ${R.format.dayLabel(next, now)}`)}"` });
          }).join("")}</div>
          <p class="sp-caption">All-day events for the next six months, with the exact time in each.</p>
          <div class="sp-actions"><button type="button" class="button button--ghost" data-moon-ics${PHASES.some((p) => state.phases[p]) ? "" : " disabled"}>Download moon phases (.ics)</button></div>
        </div>
      </section>`;
  }

  function bind() {
    UI.root().addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      if (button.dataset.phase) {
        state.phases = { ...state.phases, [button.dataset.phase]: !state.phases[button.dataset.phase] };
        keepPhases(state.phases);
        render();
        UI.root().querySelector(`[data-phase="${button.dataset.phase}"]`)?.focus();
      } else if (button.dataset.ics) {
        const plan = state.plans.find((p) => p.id === button.dataset.ics);
        const spec = plan && R.calendarEvent.planEvent(plan, R.plans.planTemplate(plan, state.templates));
        if (!spec || !UI.downloadIcs(R.calendarEvent.toIcs([spec], new Date()), L.icsFileName(plan.title))) {
          UI.say("Couldn't download. Try Google Calendar instead.", "problem");
        }
      } else if (button.hasAttribute("data-moon-ics")) {
        const events = R.calendarEvent.moonEvents(state.phases, new Date());
        if (!events.length || !UI.downloadIcs(R.calendarEvent.toIcs(events, new Date()), "moon-phases.ics")) {
          UI.say("Couldn't download. Your browser blocked the file. Please try again.", "problem");
        }
      }
    });
  }

  async function load() {
    const [plans, templates] = await Promise.all([S.loadPlans(), S.templates().catch(() => [])]);
    state.plans = plans;
    state.templates = templates;
    render();
  }

  async function start() {
    await global.SaltPage.ready();
    bind();
    await load();
    global.SaltPage.onUserChange(() => UI.attempt(load, "Your plans couldn't be opened"));
  }

  UI.attempt(start, "Reminders couldn't open");
})(window);
