/* One planned working (app: rituals/plan/[id].tsx). */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const L = global.RitualsLogic;
  const { esc } = UI;
  const R = global.SaltCore.rituals;

  const id = new URLSearchParams(global.location.search).get("id");
  const state = { plan: null, templates: [], altars: [], active: null, busy: false };

  const planTemplate = () => R.plans.planTemplate(state.plan, state.templates);

  function connections(template) {
    const plan = state.plan;
    const altarId = template?.linked_altar_id || null;
    const altar = altarId ? state.altars.find((a) => a.id === altarId) : null;
    const ingredients = plan.ingredients || [];
    const parts = [];
    if (template) parts.push(`<li><a href="/altar/?editRitualTemplate=${encodeURIComponent(template.id)}">The template: ${esc(template.title)}</a></li>`);
    if (template?.grimoire_page_id) parts.push(`<li><a href="/grimoire/?page=${encodeURIComponent(template.grimoire_page_id)}">Its page in your Book of Shadows</a></li>`);
    if (altar) parts.push(`<li>Linked altar: ${esc(altar.name)}</li>`);
    if (!parts.length && !ingredients.length) return "";
    return `
      <section class="sp-card" aria-labelledby="rt-connected">
        <h2 class="sp-label" id="rt-connected">Connected</h2>
        ${parts.length ? `<ul class="rt-links">${parts.join("")}</ul>` : ""}
        ${
          ingredients.length
            ? `<p class="sp-muted">What you'll gather</p><div class="sp-chips">${ingredients
                .map((item) =>
                  String(item.ref || "").startsWith("traditional/")
                    ? `<a class="sp-chip" href="${L.ingredientHref(item.ref)}">${esc(item.name)} ›</a>`
                    : `<span class="sp-chip">${esc(item.name)}</span>`
                )
                .join("")}</div>`
            : ""
        }
      </section>`;
  }

  function render() {
    const main = UI.root();
    const plan = state.plan;
    if (!plan) {
      main.innerHTML = `${UI.header({ title: "Plan" })}<p>This plan isn't here any more.</p>`;
      return;
    }
    const account = S.user();
    const template = planTemplate();
    const steps = template?.ritual_template_steps?.length ?? plan.draft?.steps?.length ?? 0;
    const event = R.calendarEvent.planEvent(plan, template);
    const google = event ? R.calendarEvent.googleCalendarUrl(event) : "";

    main.innerHTML = `
      ${UI.header({ eyebrow: R.format.planWhen(plan), title: plan.title, lead: R.format.planSky(plan) })}
      ${plan.intention ? `<p>${esc(plan.intention)}</p>` : ""}
      ${plan.doneAt ? `<p class="sp-notice">Begun ${esc(R.calendar.shortDate(new Date(plan.doneAt)))}. Its journal entry is kept with your rituals.</p>` : ""}

      <div class="sp-actions">
        <button type="button" class="button button--primary" data-begin${state.busy || state.active ? " disabled" : ""}>${state.busy ? "One moment…" : "Begin now"}</button>
      </div>
      ${state.active ? `<p class="sp-muted">Finish the ritual that's under way first. <a class="rt-text-link" href="/altar/?ritual=1">Continue it</a></p>` : ""}

      <section class="sp-card" aria-labelledby="rt-ritual">
        <h2 class="sp-label" id="rt-ritual">The ritual</h2>
        <p>${esc(
          template
            ? `${template.title} · ${steps} ${steps === 1 ? "step" : "steps"}`
            : plan.draft
              ? `${plan.draft.title} · a spell with ${steps} steps${plan.syncedTo ? "" : ", kept in this browser"}`
              : "Not chosen yet. Begin as a working of your own, or change the plan to pick a template."
        )}</p>
        ${
          plan.draft && account
            ? `<div class="sp-actions"><button type="button" class="button button--ghost" data-keep${state.busy ? " disabled" : ""}>Keep this spell as a template</button></div>`
            : plan.draft
              ? `<p class="sp-muted">Sign in to keep this spell as a template in your account.</p>`
              : ""
        }
      </section>

      ${connections(template)}

      <section class="sp-card" aria-labelledby="rt-reminder">
        <h2 class="sp-label" id="rt-reminder">Reminder</h2>
        <p class="sp-muted">Reminders ring in the phone app; browsers can’t send them at a set time. Add the plan to your calendar and your calendar can remind you.</p>
        <p><a class="rt-text-link" href="/reminders/">Reminders & calendar</a></p>
      </section>

      <section class="sp-card" id="calendar" aria-labelledby="rt-calendar">
        <h2 class="sp-label" id="rt-calendar">Calendar</h2>
        <p class="sp-muted">Download it for Apple Calendar or Outlook, or open it in Google Calendar.</p>
        <div class="sp-actions">
          <button type="button" class="button button--ghost" data-ics${event ? "" : " disabled"}>Download for my calendar (.ics)</button>
          ${google ? `<a class="button button--ghost" href="${esc(google)}" target="_blank" rel="noopener">Add to Google Calendar</a>` : ""}
        </div>
      </section>

      <div class="sp-actions">
        <a class="button button--ghost" href="/rituals/planner/?planId=${encodeURIComponent(plan.id)}">Change the night or time</a>
        <button type="button" class="button button--ghost rt-quiet" data-remove>Remove plan</button>
      </div>`;
  }

  async function begin() {
    const plan = state.plan;
    const template = planTemplate();
    state.busy = true;
    render();
    const active = await S.activeSession().catch(() => null);
    if (active) {
      state.active = active;
      state.busy = false;
      render();
      return;
    }
    const source = template
      ? { kind: "template", templateId: template.id }
      : plan.draft
        ? { kind: "draft", draft: plan.draft }
        : { kind: "free", title: plan.title, intention: plan.intention || "" };
    // The altar marks the plan done once the ritual has begun (as the app does).
    S.begin(L.beginHandoff(source, { planId: plan.id }));
  }

  async function keepAsTemplate() {
    const plan = state.plan;
    if (!plan.draft) return;
    state.busy = true;
    render();
    const saved = await UI.attempt(() => S.saveTemplate(plan.draft), "The spell couldn't be saved");
    if (saved) {
      state.templates = [saved, ...state.templates];
      state.plan = await S.savePlan({ ...plan, templateId: saved.id, draft: null });
      UI.say("Saved. The spell is now a template in your account and your Book of Shadows.");
    }
    state.busy = false;
    render();
  }

  async function remove() {
    if (!global.confirm("Remove this plan?")) return;
    await UI.attempt(() => S.removePlan(state.plan), "The plan couldn't be removed");
    global.location.href = "/rituals/";
  }

  function bind() {
    UI.root().addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      if (button.hasAttribute("data-begin")) begin();
      else if (button.hasAttribute("data-keep")) keepAsTemplate();
      else if (button.hasAttribute("data-remove")) remove();
      else if (button.hasAttribute("data-ics")) {
        const spec = R.calendarEvent.planEvent(state.plan, planTemplate());
        if (!spec || !UI.downloadIcs(R.calendarEvent.toIcs([spec], new Date()), L.icsFileName(state.plan.title))) {
          UI.say("Couldn't download. Try opening it in Google Calendar instead.", "problem");
        }
      }
    });
  }

  async function load() {
    const [plans, templates, altars, active] = await Promise.all([
      S.loadPlans(),
      S.templates().catch(() => []),
      S.altars().catch(() => []),
      S.activeSession().catch(() => null)
    ]);
    state.plan = plans.find((p) => p.id === id) || null;
    state.templates = templates;
    state.altars = altars;
    state.active = active;
    render();
  }

  async function start() {
    await global.SaltPage.ready();
    bind();
    await load();
    if (global.location.hash === "#calendar") global.document.getElementById("calendar")?.scrollIntoView();
    global.SaltPage.onUserChange(() => UI.attempt(load, "The plan couldn't be opened"));
  }

  UI.attempt(start, "The plan couldn't be opened");
})(window);
