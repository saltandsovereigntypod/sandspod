/* The spell builder (app: rituals/spell.tsx). */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const L = global.RitualsLogic;
  const { esc } = UI;
  const R = global.SaltCore.rituals;
  const P = R.planner;

  const TYPE_LABELS = { candle: "Candles", herb: "Herbs", crystal: "Crystals" };
  const OWN_CATEGORY = { candles: "candle", herbs: "herb", crystals: "crystal" };
  const FOCUS = ["", "5", "10", "15"];
  const params = new URLSearchParams(global.location.search);

  function starters(key) {
    const intention = P.intentionByKey(key);
    if (!intention) return [];
    const s = P.suggestIngredients(intention);
    return [...s.candle.slice(0, 1), ...s.herb.slice(0, 2), ...s.crystal.slice(0, 1)].map(R.spell.toIngredient);
  }

  const state = {
    intentionKey: P.intentionByKey(params.get("intention")) ? params.get("intention") : null,
    picked: [],
    purpose: "",
    petition: "",
    focus: "10",
    name: "",
    ownItems: [],
    active: null,
    busy: false,
    saved: null
  };
  state.picked = starters(state.intentionKey);

  const intention = () => P.intentionByKey(state.intentionKey);
  const draft = () =>
    R.spell.buildSpell({ name: state.name, intention: intention(), purpose: state.purpose, petition: state.petition, ingredients: state.picked, focusMinutes: state.focus });
  const allItems = () => [...state.ownItems, ...R.library.LIBRARY_ITEMS];

  function itemChip(item) {
    return UI.chip(item.name, {
      pressed: state.picked.some((p) => p.ref === item.ref),
      title: `${item.name}: ${item.uses}`,
      attrs: `data-item="${esc(item.ref)}"`
    });
  }

  /** Parts that change as you choose; the text fields are left alone while you type. */
  function renderParts() {
    const main = UI.root();
    const spell = draft();
    const i = intention();
    const suggested = i ? P.suggestIngredients(i) : null;
    main.querySelector("[data-title]").textContent = spell.title;
    main.querySelectorAll("[data-intention]").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.intention === state.intentionKey)));
    main.querySelectorAll("[data-focus]").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.focus === state.focus)));
    main.querySelector("#rt-spell-name").placeholder = R.spell.defaultSpellName(i);

    main.querySelector("[data-suggested]").innerHTML = suggested
      ? `<p class="sp-muted">${esc(`Suggested from the Library for ${i.label.toLowerCase()}. Tap to add or remove.`)}</p>
         <div class="sp-chips">${[...suggested.candle, ...suggested.herb, ...suggested.crystal].map(itemChip).join("")}</div>`
      : `<p class="sp-muted">Choose an intention and the Library will suggest candles, herbs and crystals.</p>`;
    main.querySelectorAll("[data-item]").forEach((c) => c.setAttribute("aria-pressed", String(state.picked.some((p) => p.ref === c.dataset.item))));

    const readable = state.picked.filter((item) => !item.ref.startsWith("custom/"));
    main.querySelector("[data-read]").innerHTML = readable.length
      ? `<p class="sp-muted">Read about them in the Library</p><div class="sp-chips">${readable
          .map((item) => `<a class="sp-chip" href="${L.ingredientHref(item.ref)}" aria-label="${esc(`About ${item.name}`)}">${esc(item.name)} ›</a>`)
          .join("")}</div>`
      : "";

    main.querySelector("[data-steps-title]").textContent = `The steps (${spell.steps.length})`;
    main.querySelector("[data-steps]").innerHTML = spell.steps
      .map(
        (step, n) => `<li><h3>${esc(`${n + 1}. ${step.title}`)}</h3>${step.instructions ? `<p>${esc(step.instructions)}</p>` : ""}${
          step.spoken_text ? `<p class="sp-muted">“${esc(step.spoken_text)}”</p>` : ""
        }</li>`
      )
      .join("");
  }

  function renderActions() {
    const account = S.user();
    const blocked = state.busy || !!state.active;
    UI.root().querySelector("[data-actions]").innerHTML = `
      <div class="sp-actions">
        <button type="button" class="button button--primary" data-begin${blocked ? " disabled" : ""}>${state.busy ? "One moment…" : "Begin now"}</button>
        <button type="button" class="button button--ghost" data-plan>Plan a night for it</button>
        <button type="button" class="button button--ghost" data-find-time>Find a good time</button>
        ${
          account
            ? state.saved
              ? ""
              : `<button type="button" class="button button--ghost" data-keep${state.busy ? " disabled" : ""}>Keep as a template</button>`
            : ""
        }
      </div>
      ${account ? "" : `<p class="sp-muted">Sign in to keep spells as templates in your account and Grimoire.</p>`}
      ${state.saved ? `<p class="sp-notice">Kept as a template. <a class="rt-text-link" href="/altar/?editRitualTemplate=${encodeURIComponent(state.saved.id)}">Open it</a></p>` : ""}
      ${state.active ? `<p class="sp-notice">A ritual is under way. Finish it before beginning this one. <a class="rt-text-link" href="/altar/?ritual=1">Continue it</a></p>` : ""}`;
  }

  function render() {
    const main = UI.root();
    main.innerHTML = `
      ${UI.header({ eyebrow: "Spell builder", title: "My spell" })}
      <section class="sp-section" aria-labelledby="rt-for">
        <h2 class="sp-label" id="rt-for">What is it for?</h2>
        <div class="sp-chips">${P.INTENTIONS.map((i) => UI.chip(i.label, { pressed: false, attrs: `data-intention="${i.key}"` })).join("")}</div>
      </section>
      <div class="sp-field">
        <label for="rt-purpose">In your own words</label>
        <textarea id="rt-purpose" data-text="purpose" placeholder="Steady work that pays the rent"></textarea>
      </div>
      <section class="sp-section" aria-labelledby="rt-gather">
        <h2 class="sp-label" id="rt-gather">What you'll gather</h2>
        <div data-suggested></div>
        ${Object.keys(TYPE_LABELS)
          .map(
            (kind) => `<details class="sp-details" data-kind="${kind}"><summary>All ${TYPE_LABELS[kind].toLowerCase()}</summary>
              <div class="sp-chips">${allItems().filter((item) => item.type === kind).map(itemChip).join("")}</div></details>`
          )
          .join("")}
        <div data-read></div>
      </section>
      <div class="sp-field">
        <label for="rt-petition">Your words</label>
        <textarea id="rt-petition" data-text="petition" placeholder="The petition, charm or prayer you'll speak over the flame"></textarea>
      </div>
      <section class="sp-section" aria-labelledby="rt-sit">
        <h2 class="sp-label" id="rt-sit">Time to sit with it</h2>
        <div class="sp-chips">${FOCUS.map((m) => UI.chip(m ? `${m} minutes` : "No timer", { pressed: false, attrs: `data-focus="${m}"` })).join("")}</div>
      </section>
      <div class="sp-field">
        <label for="rt-spell-name">Name</label>
        <input id="rt-spell-name" type="text" data-text="name" />
      </div>
      <details class="sp-details"><summary data-steps-title>The steps</summary><ol class="rt-plain-list" data-steps></ol></details>
      <section class="sp-card" data-actions></section>`;
    main.querySelector("h1").setAttribute("data-title", "");
    renderParts();
    renderActions();
  }

  function bind() {
    const main = UI.root();
    main.addEventListener("input", (event) => {
      const key = event.target.dataset?.text;
      if (!key) return;
      state[key] = event.target.value;
      renderParts();
    });
    main.addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      if (button.dataset.intention) {
        state.intentionKey = state.intentionKey === button.dataset.intention ? null : button.dataset.intention;
        state.picked = starters(state.intentionKey);
        renderParts();
      } else if (button.dataset.item) {
        const ref = button.dataset.item;
        if (state.picked.some((i) => i.ref === ref)) state.picked = state.picked.filter((i) => i.ref !== ref);
        else {
          const item = allItems().find((i) => i.ref === ref);
          if (item) state.picked = [...state.picked, R.spell.toIngredient(item)];
        }
        renderParts();
      } else if (button.dataset.focus !== undefined) {
        state.focus = button.dataset.focus;
        renderParts();
      } else if (button.hasAttribute("data-begin")) {
        state.busy = true;
        renderActions();
        state.active = await S.activeSession().catch(() => null);
        if (state.active) {
          state.busy = false;
          renderActions();
          return;
        }
        S.begin(L.beginHandoff({ kind: "draft", draft: draft() }));
      } else if (button.hasAttribute("data-plan")) {
        S.handOffDraft(draft());
        const i = intention();
        global.location.href = `/rituals/planner/?fromSpell=1${i ? `&intention=${i.key}` : ""}`;
      } else if (button.hasAttribute("data-find-time")) {
        // The timing advisor, which hands the chosen time to the planner with this spell.
        const spell = draft();
        S.handOffDraft(spell);
        const i = intention();
        global.location.href = `/practice/cosmic/timing/?${new URLSearchParams({ fromSpell: "1", title: spell.title, ...(i ? { intent: i.key } : {}) })}`;
      } else if (button.hasAttribute("data-keep")) {
        state.busy = true;
        renderActions();
        const saved = await UI.attempt(() => S.saveTemplate(draft()), "Couldn't save");
        state.busy = false;
        if (saved) state.saved = saved;
        renderActions();
        if (saved) UI.root().querySelector("[data-actions] .sp-notice a")?.focus();
      }
    });
  }

  async function start() {
    await global.SaltPage.ready();
    render();
    bind();
    const [pantry, active] = await Promise.all([S.pantry().catch(() => null), S.activeSession().catch(() => null)]);
    state.active = active;
    // Your own candles, herbs and crystals from the cabinet sit beside the Library's.
    state.ownItems = (pantry?.customItems || [])
      .filter((item) => OWN_CATEGORY[item.category])
      .map((item) => ({
        ref: `custom/${item.id}`,
        type: OWN_CATEGORY[item.category],
        name: item.name,
        element: null,
        planet: null,
        uses: item.keywords.length ? item.keywords.join(", ") : "From your own cabinet",
        tags: item.keywords,
        tip: "",
        caution: ""
      }));
    if (state.ownItems.length) {
      UI.root().querySelectorAll("details[data-kind]").forEach((details) => {
        details.querySelector(".sp-chips").innerHTML = allItems().filter((item) => item.type === details.dataset.kind).map(itemChip).join("");
      });
    }
    renderParts();
    renderActions();
  }

  UI.attempt(start, "The spell builder couldn't open");
})(window);
