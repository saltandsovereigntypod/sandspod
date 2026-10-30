/* The planner: find the night (app: rituals/planner.tsx). */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const L = global.RitualsLogic;
  const { esc } = UI;
  const R = global.SaltCore.rituals;
  const P = R.planner;

  const params = new URLSearchParams(global.location.search);
  const now = new Date();
  const eveningOf = (day) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), P.EVENING_HOUR);
  const fixedDay = R.lifecycle.dateFromKey(params.get("date"));

  // The planetary hours of the chosen day (js/core/astro.js, where the page loads it, and your saved place):
  // which hour the time falls in, and a planet's hours to pick from (the chips set the time).
  function planetaryHoursHtml() {
    const A = global.SaltCore && global.SaltCore.astro;
    let place = null;
    try {
      place = JSON.parse(global.localStorage.getItem("sky.place") || "null");
    } catch {
      place = null;
    }
    if (!A || !state.night || !place || !Number.isFinite(Number(place.latitude))) return "";
    const n = state.night;
    const hours = A.hours.planetaryHours(new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12), { latitude: Number(place.latitude), longitude: Number(place.longitude) });
    if (!hours) return "";
    const [h, m] = state.time.split(":").map(Number);
    let at = new Date(n.getFullYear(), n.getMonth(), n.getDate(), h, m);
    if (at < hours[0].start) at = new Date(at.getTime() + 86400000);
    const inHour = hours.find((x) => at >= x.start && at < x.end);
    const two = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const pick = state.hourPlanet && planets.includes(state.hourPlanet) ? state.hourPlanet : null;
    const termHtml = (t) => (global.SaltAstroTerms ? global.SaltAstroTerms.html(t) : esc(t));
    return `<h2 class="sp-label">Planetary hours that day</h2>
      ${inHour ? `<p class="sp-caption">${termHtml(`${A.calendar.timeOfDay(at)} falls in the hour of ${inHour.planet}: ${A.cosmicHours.HOUR_SUITS[inHour.planet].short}. The day belongs to ${hours[0].planet}.`)}</p>` : ""}
      <div class="sp-chips">${planets.map((p) => UI.chip(p, { pressed: pick === p, attrs: `data-hour-planet="${p}" data-key="hour-${p}"` })).join("")}</div>
      ${pick ? `<div class="sp-chips">${hours.filter((x) => x.planet === pick).map((x) => UI.chip(`${A.calendar.timeOfDay(x.start)}${x.night ? " (night)" : ""}`, { pressed: inHour === x, attrs: `data-time="${two(x.start)}" data-key="hourtime-${two(x.start)}"` })).join("")}</div>` : ""}`;
  }

  const state = {
    templates: [],
    editing: null,
    draft: null,
    intentionKey: params.get("intention") || null,
    night: fixedDay ? eveningOf(fixedDay) : null,
    // A time can come with the link (a planetary hour from Cosmic & celestial).
    time: /^\d{2}:\d{2}$/.test(params.get("time") || "") ? params.get("time") : "21:00",
    hourPlanet: params.get("hour") || null,
    attach: { kind: "none" },
    picked: [],
    name: "",
    toCalendar: false,
    saving: false
  };

  function defaultName() {
    const template = state.attach.kind === "template" ? state.templates.find((t) => t.id === state.attach.id) || null : null;
    return L.planDefaultName({ attach: state.attach, draft: state.draft, template, intention: P.intentionByKey(state.intentionKey) });
  }

  function nightStepper() {
    const today = eveningOf(now);
    const dateInput = `
      <div class="sp-field">
        <label for="rt-night-date">${state.night ? "Or pick a date" : "Pick a night on the calendar"}</label>
        <input id="rt-night-date" type="date" min="${R.lifecycle.localDateKey(today)}" value="${state.night ? R.lifecycle.localDateKey(state.night) : ""}" data-key="night-date" />
      </div>`;
    if (!state.night) return `<div class="sp-card">${dateInput}</div>`;
    const night = state.night;
    const moon = R.moon.moonState(night);
    const intention = P.intentionByKey(state.intentionKey);
    const fits = intention ? P.nightFits(night).some((fit) => fit.intention.key === intention.key) : false;
    const atStart = R.lifecycle.localDateKey(night) === R.lifecycle.localDateKey(today);
    const step = (label, days, title, disabled) =>
      `<button type="button" class="sp-chip" data-move="${days}" data-key="move${days}" aria-label="${esc(title)}"${disabled ? " disabled" : ""}>${esc(label)}</button>`;
    return `
      <div class="sp-card">
        <div class="rt-stepper">
          ${step("−7", -7, "A week earlier", atStart)}
          ${step("‹", -1, "The night before", atStart)}
          <p class="rt-stepper__day" aria-live="polite">${esc(R.format.dayLabel(night, now))}</p>
          ${step("›", 1, "The next night", false)}
          ${step("+7", 7, "A week later", false)}
        </div>
        <div class="rt-night-head">
          ${UI.moon(moon.illumination, moon.waxing, 32)}
          <div>
            <p class="sp-caption">${esc(`${moon.name} · ${R.calendar.dayRulerLabel(night)}`)}</p>
            ${intention ? `<p class="sp-caption">${fits ? "A good night for it" : "Not one of the best nights for it, but yours to choose"}</p>` : ""}
          </div>
        </div>
        ${dateInput}
      </div>`;
  }

  function render() {
    const main = UI.root();
    const intention = P.intentionByKey(state.intentionKey);
    const nights = intention && !fixedDay ? P.suggestNights(intention, now) : [];
    const ingredients = intention ? P.suggestIngredients(intention) : null;
    const template = state.attach.kind === "template" ? state.templates.find((t) => t.id === state.attach.id) || null : null;
    const nightKey = state.night ? R.lifecycle.localDateKey(state.night) : null;

    let fixedCard = "";
    if (fixedDay) {
      const at = state.night || fixedDay;
      const moon = R.moon.moonState(at);
      const fits = P.nightFits(eveningOf(fixedDay));
      fixedCard = `
        <section class="sp-card sp-card--gold">
          <h2 class="sp-label">${esc(R.calendar.fullDate(fixedDay))}</h2>
          <div class="rt-night-head">
            ${UI.moon(moon.illumination, moon.waxing, 44)}
            <div><h3>${esc(moon.name)}</h3><p class="sp-muted">${esc(`${R.calendar.dayRulerLabel(fixedDay)} · ${R.calendar.dayRuler(fixedDay).themes}`)}</p></div>
          </div>
          ${
            fits.length
              ? `<p class="sp-muted">A good night for</p><div class="sp-chips">${fits
                  .slice(0, 5)
                  .map(({ intention: fit }) => UI.chip(fit.label, { pressed: state.intentionKey === fit.key, attrs: `data-intention="${fit.key}" data-key="fit-${fit.key}"` }))
                  .join("")}</div>`
              : ""
          }
        </section>`;
    }

    const planning =
      (state.attach.kind === "draft" && state.draft) || template
        ? `<p>${esc(`Planning “${state.attach.kind === "draft" && state.draft ? state.draft.title : template.title}”.`)}</p>`
        : "";

    const nightRows = nights
      .map((n) => {
        const title = R.format.dayLabel(n.date, now);
        const selected = nightKey === R.lifecycle.localDateKey(n.date);
        const detail = `${n.phase} · ${n.reason.split(" · ")[1] || R.calendar.dayRulerLabel(n.date)}`;
        return `<button type="button" role="radio" aria-checked="${selected}" class="rt-night${selected ? " is-on" : ""}" data-night="${R.lifecycle.localDateKey(n.date)}" data-key="night-${R.lifecycle.localDateKey(n.date)}"
            aria-label="${esc(`${title}. ${n.phase}. ${n.reason}${n.best ? ". Best night" : ""}`)}">
          ${UI.moon(n.illumination, n.tide !== "waning", 32)}
          <span class="rt-night__text"><span class="rt-night__title">${esc(title)}</span><span class="sp-caption">${esc(detail)}</span></span>
          ${n.best ? `<span class="rt-best">Best</span>` : ""}
        </button>`;
      })
      .join("");

    const timeChips = L.TIMES.map((t) => {
      const [h, m] = t.split(":").map(Number);
      return UI.chip(R.format.clockTime(new Date(2000, 0, 1, h, m)), { pressed: state.time === t, attrs: `data-time="${t}" data-key="time-${t}"` });
    }).join("");

    const ritualChips = [
      state.draft ? UI.chip(state.draft.title, { pressed: state.attach.kind === "draft", attrs: `data-attach="draft" data-key="attach-draft"` }) : "",
      ...state.templates.map((t) =>
        UI.chip(t.title || "Untitled", { pressed: state.attach.kind === "template" && state.attach.id === t.id, attrs: `data-attach="template" data-id="${esc(t.id)}" data-key="attach-${esc(t.id)}"` })
      ),
      UI.chip("Decide later", { pressed: state.attach.kind === "none", attrs: `data-attach="none" data-key="attach-none"` })
    ].join("");

    const nightCard = state.night
      ? `<section class="sp-card" aria-labelledby="rt-when">
          <h2 class="sp-label" id="rt-when">${esc(`${R.format.dayLabel(state.night, now)} · what time?`)}</h2>
          <div class="sp-chips">${timeChips}</div>
          <div class="sp-field rt-narrow"><label for="rt-time">Or another time</label><input id="rt-time" type="time" step="300" value="${esc(state.time)}" data-key="time-input" /></div>
          ${planetaryHoursHtml()}

          <h2 class="sp-label">Which ritual?</h2>
          <div class="sp-chips">${ritualChips}</div>
          ${S.user() ? "" : `<p class="sp-caption">Your own templates appear here once you sign in.</p>`}
          ${
            state.draft
              ? ""
              : `<p><a class="rt-text-link" href="/rituals/spell/${intention ? `?intention=${intention.key}` : ""}">Build a spell for this night instead</a></p>`
          }

          <div class="sp-field"><label for="rt-name">Name</label><input id="rt-name" type="text" value="${esc(state.name)}" placeholder="${esc(defaultName())}" data-key="name" /></div>

          <label class="rt-toggle">
            <input type="checkbox" ${state.toCalendar ? "checked" : ""} data-key="calendar" />
            <span><span class="rt-toggle__label">Add to my calendar</span><span class="sp-caption">Download it or open Google Calendar from the plan</span></span>
          </label>
        </section>`
      : "";

    const fromLibrary = ingredients
      ? `<section class="sp-section" aria-labelledby="rt-library">
          <h2 class="sp-label" id="rt-library">From the Library</h2>
          <p class="sp-muted">Tap to add to what you'll gather.</p>
          <div class="sp-chips">${[...ingredients.candle, ...ingredients.herb, ...ingredients.crystal]
            .map((item) =>
              UI.chip(item.name, {
                pressed: state.picked.some((p) => p.ref === item.ref),
                title: `${item.name}: ${item.uses}`,
                attrs: `data-ingredient="${esc(item.ref)}" data-key="ing-${esc(item.ref)}"`
              })
            )
            .join("")}</div>
        </section>`
      : "";

    const saveButton = state.night
      ? `<div class="sp-actions"><button type="button" class="button button--primary" data-save data-key="save"${state.saving ? " disabled" : ""}>${esc(
          state.saving ? "Saving…" : state.editing ? "Save changes" : `Plan it for ${R.format.dayLabel(state.night, now).toLowerCase()}`
        )}</button></div>`
      : intention && !fixedDay
        ? `<p class="sp-notice">Choose one of the nights above, or a night of your own.</p>`
        : "";

    main.innerHTML = `
      ${UI.header({ back: state.editing ? { href: `/rituals/plan/?id=${encodeURIComponent(state.editing.id)}`, label: "The plan" } : undefined, eyebrow: state.editing ? "Change the plan" : "Planner", title: "Find the night" })}
      ${fixedCard}
      ${planning}
      <section class="sp-section" aria-labelledby="rt-for">
        <h2 class="sp-label" id="rt-for">What is it for?</h2>
        <div class="sp-chips">${P.INTENTIONS.map((i) => UI.chip(i.label, { pressed: state.intentionKey === i.key, attrs: `data-intention="${i.key}" data-key="int-${i.key}"` })).join("")}</div>
        ${intention ? `<p class="sp-muted">${esc(intention.why)}</p>` : ""}
      </section>
      ${
        intention && !fixedDay
          ? `<section class="sp-section" aria-labelledby="rt-best"><h2 class="sp-label" id="rt-best">Best nights in the next month</h2><div class="rt-nights" role="radiogroup" aria-labelledby="rt-best">${nightRows}</div></section>`
          : ""
      }
      ${!intention && !fixedDay ? `<p class="sp-muted">Choose an intention to see the nights whose moon and weekday suit it, or choose a night yourself.</p>` : ""}
      ${
        !fixedDay
          ? `<section class="sp-section" aria-labelledby="rt-own"><h2 class="sp-label" id="rt-own">${intention ? "Or choose your own night" : "Choose a night"}</h2>${nightStepper()}</section>`
          : ""
      }
      ${nightCard}
      ${fromLibrary}
      ${saveButton}`;
  }

  /** Re-render, keeping focus on the control that was used. */
  function update() {
    const key = global.document.activeElement?.dataset?.key;
    render();
    if (key) UI.root().querySelector(`[data-key="${CSS.escape(key)}"]`)?.focus();
  }

  function setNight(date) {
    const today = eveningOf(now);
    const next = eveningOf(date);
    state.night = next.getTime() < today.getTime() ? today : next;
  }

  async function save() {
    if (!state.night || state.saving) return;
    state.saving = true;
    update();
    const intention = P.intentionByKey(state.intentionKey);
    const template = state.attach.kind === "template" ? state.templates.find((t) => t.id === state.attach.id) || null : null;
    const plan = L.buildPlan({
      editing: state.editing,
      id: R.lifecycle.uuid(),
      date: R.lifecycle.localDateKey(state.night),
      time: state.time,
      name: state.name,
      defaultName: defaultName(),
      intention,
      template,
      attach: state.attach,
      draft: state.draft,
      picked: state.picked,
      toCalendar: state.toCalendar,
      now: new Date()
    });
    const saved = await UI.attempt(() => S.savePlan(plan), "The plan couldn't be saved");
    if (!saved) {
      state.saving = false;
      update();
      return;
    }
    if (state.attach.kind === "draft" && params.get("fromSpell")) S.clearDraft();
    global.location.href = `/rituals/plan/?id=${encodeURIComponent(plan.id)}${state.toCalendar ? "#calendar" : ""}`;
  }

  function bind() {
    const main = UI.root();
    main.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target || target.disabled) return;
      if (target.dataset.intention) {
        const key = target.dataset.intention;
        // A fitting night's chip only ever chooses; the main chips toggle.
        state.intentionKey = state.intentionKey === key && !target.dataset.key.startsWith("fit-") ? null : key;
      } else if (target.dataset.night) {
        setNight(R.lifecycle.dateFromKey(target.dataset.night));
      } else if (target.dataset.move) {
        const days = Number(target.dataset.move);
        const night = state.night;
        setNight(new Date(night.getFullYear(), night.getMonth(), night.getDate() + days));
      } else if (target.dataset.hourPlanet) {
        state.hourPlanet = state.hourPlanet === target.dataset.hourPlanet ? null : target.dataset.hourPlanet;
        render();
      } else if (target.dataset.time) {
        state.time = target.dataset.time;
      } else if (target.dataset.attach) {
        state.attach = target.dataset.attach === "template" ? { kind: "template", id: target.dataset.id } : { kind: target.dataset.attach };
      } else if (target.dataset.ingredient) {
        const ref = target.dataset.ingredient;
        if (state.picked.some((i) => i.ref === ref)) state.picked = state.picked.filter((i) => i.ref !== ref);
        else {
          const item = P.libraryItem(ref);
          if (item) state.picked = [...state.picked, R.spell.toIngredient(item)];
        }
      } else if (target.hasAttribute("data-save")) {
        save();
        return;
      } else return;
      update();
    });
    main.addEventListener("input", (event) => {
      const key = event.target.dataset?.key;
      if (key === "name") state.name = event.target.value;
    });
    main.addEventListener("change", (event) => {
      const key = event.target.dataset?.key;
      if (key === "night-date") {
        const date = R.lifecycle.dateFromKey(event.target.value);
        if (date) setNight(date);
        update();
      } else if (key === "time-input" && /^\d{2}:\d{2}$/.test(event.target.value)) {
        state.time = event.target.value;
        update();
      } else if (key === "calendar") {
        state.toCalendar = event.target.checked;
      }
    });
  }

  async function start() {
    await global.SaltPage.ready();
    const [templates, plans] = await Promise.all([S.templates().catch(() => []), S.loadPlans()]);
    state.templates = templates;
    const planId = params.get("planId");
    state.editing = planId ? plans.find((p) => p.id === planId) || null : null;

    const premade = R.premade.premadeById(params.get("premade"));
    state.draft = state.editing?.draft || (premade ? R.premade.premadeDraft(premade) : params.get("fromSpell") ? S.peekDraft() : null);
    state.attach = state.draft ? { kind: "draft" } : params.get("templateId") ? { kind: "template", id: params.get("templateId") } : { kind: "none" };
    state.picked = state.draft?.ingredients || [];

    if (state.editing) {
      const plan = state.editing;
      const begins = R.plans.planStart(plan);
      state.intentionKey = plan.intentionKey;
      if (begins) state.night = eveningOf(begins);
      state.time = plan.time;
      state.attach = plan.templateId ? { kind: "template", id: plan.templateId } : plan.draft ? { kind: "draft" } : { kind: "none" };
      state.picked = plan.ingredients || [];
      state.name = plan.title;
      state.toCalendar = !!plan.addToCalendar;
    }
    bind();
    render();
  }

  UI.attempt(start, "The planner couldn't open");
})(window);
