/*
 * The premade book (app: rituals/premade/index.tsx) and one working
 * (rituals/premade/[id].tsx), at /rituals/premade/ and /rituals/premade/?id=.
 */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const L = global.RitualsLogic;
  const { esc } = UI;
  const R = global.SaltCore.rituals;
  const PM = R.premade;

  const params = new URLSearchParams(global.location.search);
  const KINDS = [
    { value: null, label: "All" },
    { value: "ritual", label: "Rituals" },
    { value: "spell", label: "Spells" }
  ];

  const detail = (p) => L.premadeDetail(p, PM.practiceName);
  const href = (p) => `/rituals/premade/?id=${encodeURIComponent(p.id)}`;

  // ---------------------------------------------------------------- the book

  const filter = { query: "", practice: null, intention: null, kind: null, path: null };

  function results() {
    const filtering = !!(filter.query.trim() || filter.practice || filter.intention || filter.kind || filter.path);
    const shown = PM.filterPremade(PM.PREMADE, filter);
    const label = filtering ? `${shown.length} ${shown.length === 1 ? "working" : "workings"}` : `All ${PM.PREMADE.length} workings`;
    return { filtering, html: `<h2 class="sp-label" id="rt-results">${esc(label)}</h2>${
      shown.length
        ? `<div class="sp-list">${shown.map((p) => UI.row({ href: href(p), title: p.title, detail: detail(p) })).join("")}</div>`
        : `<section class="sp-card"><p>Nothing matches all of those. Try fewer filters.</p></section>`
    }` };
  }

  function chipGroup(name, label, options, current) {
    return `
      <fieldset class="rt-chipset">
        <legend class="sp-eyebrow">${esc(label)}</legend>
        <div class="sp-chips">${options
          .map((o) => UI.chip(o.label, { pressed: current === o.value, attrs: `data-filter="${name}" data-value="${o.value === null ? "" : esc(o.value)}"` }))
          .join("")}</div>
      </fieldset>`;
  }

  async function renderBook() {
    const main = UI.root();
    const settings = await S.settings();
    const ctx = PM.forYouContext(settings, new Date());
    const suggested = PM.forYou(ctx);
    if (PM.PRACTICES.some((p) => p.id === params.get("practice"))) filter.practice = params.get("practice");

    const practices = [...PM.PRACTICES.filter((p) => ctx.practices.includes(p.id)), ...PM.PRACTICES.filter((p) => !ctx.practices.includes(p.id))];
    const pathIds = [...new Set(PM.PREMADE.flatMap((p) => p.paths))];
    const paths = [...pathIds.filter((id) => ctx.paths.includes(id)), ...pathIds.filter((id) => !ctx.paths.includes(id))];

    main.innerHTML = `
      ${UI.header({
        eyebrow: "Premade",
        title: "Workings library",
        lead: "Workings from the Wheel of the Year, the old folk ways and every kind of practice, written for you to begin, plan, or make your own."
      })}
      <section class="sp-section" data-for-you aria-labelledby="rt-foryou">
        ${
          suggested.length
            ? `<h2 class="sp-label" id="rt-foryou">For you tonight</h2>
              <div class="sp-list">${suggested.map((p) => UI.row({ href: href(p), title: p.title, detail: detail(p) })).join("")}</div>
              ${ctx.practices.length ? "" : `<p class="sp-muted">Choose your crafts in <a class="rt-text-link" href="/practice/#choose">Craft tools → Choose your crafts</a> and these will follow them.</p>`}`
            : ""
        }
      </section>
      <section class="sp-card" aria-label="Find a working">
        <div class="sp-field">
          <label for="rt-search">Search</label>
          <input id="rt-search" type="search" placeholder="Moon water, Samhain, protection jar…" autocomplete="off" />
        </div>
        ${chipGroup("kind", "Kind", KINDS, filter.kind)}
        ${chipGroup("practice", "Practice", [{ value: null, label: "Any" }, ...practices.map((p) => ({ value: p.id, label: p.name }))], filter.practice)}
        ${chipGroup("intention", "Intention", [{ value: null, label: "Any" }, ...R.planner.INTENTIONS.map((i) => ({ value: i.key, label: i.label }))], filter.intention)}
        ${chipGroup("path", "Path", [{ value: null, label: "Any" }, ...paths.map((id) => ({ value: id, label: R.traditions.pathName(id) }))], filter.path)}
      </section>
      <section class="sp-section" data-results aria-labelledby="rt-results" aria-live="polite"></section>`;

    const showResults = () => {
      const { filtering, html } = results();
      main.querySelector("[data-results]").innerHTML = html;
      main.querySelector("[data-for-you]").hidden = filtering || !suggested.length;
    };
    showResults();

    main.querySelector("#rt-search").addEventListener("input", (event) => {
      filter.query = event.target.value;
      showResults();
    });
    main.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-filter]");
      if (!chip) return;
      const name = chip.dataset.filter;
      const value = chip.dataset.value || null;
      // "Any" and "All" clear; choosing the chosen one again clears it too.
      filter[name] = value && filter[name] !== value ? value : null;
      chip.closest(".sp-chips").querySelectorAll("[data-filter]").forEach((c) => {
        c.setAttribute("aria-pressed", String((c.dataset.value || null) === filter[name]));
      });
      showResults();
    });
  }

  // ---------------------------------------------------------------- one working

  const view = { premade: null, active: null, altars: null, choosing: false, busy: null, saved: null, check: null };

  function renderWorking() {
    const main = UI.root();
    const p = view.premade;
    if (!p) {
      main.innerHTML = `${UI.header({ back: { href: "/rituals/premade/", label: "Workings library" }, title: "Not found" })}<p>This working isn’t in the book any more.</p>`;
      return;
    }
    const account = S.user();
    const when = L.premadeWhen(p);
    const belongs = [...p.practices.map(PM.practiceName), ...p.paths.map(R.traditions.pathName)].join(" · ");
    const blocked = !!view.busy || !!view.active;

    const altarChooser = !view.choosing
      ? ""
      : view.altars === null
        ? `<p class="sp-muted">Opening your altars…</p>`
        : view.altars.length === 0
          ? `<section class="sp-card" aria-labelledby="rt-onaltar"><h2 class="sp-label" id="rt-onaltar">Begin on an altar</h2>
              <p>Save an altar first, at the altar. Then the ritual can run over it: its candles lit as the steps begin, and the altar kept with your journal entry.</p>
              <div class="sp-actions"><a class="button button--ghost" href="/altar/">Open the altar</a></div></section>`
          : `<section class="sp-card" aria-labelledby="rt-onaltar"><h2 class="sp-label" id="rt-onaltar">Begin on an altar</h2>
              <p class="sp-caption">The ritual opens over the altar you choose. Its steps light and snuff the candles there, and the altar is kept with your journal entry.</p>
              <div class="sp-list">${view.altars
                .map((a) => UI.row({ title: a.name, detail: "Begin here", attrs: `data-altar="${esc(a.id)}" aria-label="${esc(`Begin on ${a.name}`)}"` }))
                .join("")}</div></section>`;

    const saveArea = account
      ? view.saved
        ? `<p class="sp-notice">Saved to your templates. <a class="rt-text-link" href="/altar/?editRitualTemplate=${encodeURIComponent(view.saved.id)}">Open your copy</a> to change it however you like.</p>`
        : `<button type="button" class="button button--ghost" data-save${view.busy ? " disabled" : ""}>${view.busy === "save" ? "Saving…" : "Save a copy to my templates"}</button>`
      : `<p class="sp-muted">Sign in to save a copy to your own templates and change it however you like.</p>`;

    const needs = p.ingredients.length
      ? `<ul class="rt-needs">${p.ingredients
          .map((item) => {
            const label = `${item.name}${item.optional ? " (optional)" : ""}`;
            return item.ref
              ? `<li><a href="${L.libraryHref(item.ref)}" aria-label="${esc(`${label}. Open in the Library`)}">${esc(label)}</a></li>`
              : `<li>${esc(label)}</li>`;
          })
          .join("")}</ul>`
      : `<p>Nothing but yourself.</p>`;

    main.innerHTML = `
      ${UI.header({ back: { href: "/rituals/premade/", label: "Workings library" }, eyebrow: belongs, title: p.title, lead: L.premadeFacts(p) })}
      <p>${esc(p.summary)}</p>
      ${when.length ? `<p class="sp-muted">Best on: ${esc(when.join(", "))}</p>` : ""}

      <div class="sp-actions rt-actions">
        <button type="button" class="button button--primary" data-begin${blocked ? " disabled" : ""}>${view.busy === "begin" ? "Beginning…" : "Begin this ritual"}</button>
        <button type="button" class="button button--ghost" data-begin-together title="Do it live with your coven or friends, each from where you are">Begin together</button>
        <button type="button" class="button button--ghost" data-choose-altar aria-expanded="${view.choosing}"${blocked ? " disabled" : ""}
          title="Choose one of your altars; the ritual runs over it and lights its candles as the steps begin">Begin on an altar</button>
        <a class="button button--ghost" href="/rituals/planner/?premade=${encodeURIComponent(p.id)}${p.intention ? `&intention=${p.intention}` : ""}">Plan a night for it</a>
        <a class="button button--ghost" href="/practice/cosmic/timing/?${esc(
          new URLSearchParams({
            premade: p.id,
            title: p.title,
            ...(p.intention ? { intent: p.intention } : {}),
            ...(p.moon && p.moon.length ? { moon: p.moon.join(",") } : {}),
            ...(p.weekday !== undefined && p.weekday !== null ? { weekday: String(p.weekday) } : {})
          }).toString()
        )}" title="The best times ahead for this working, from the moon and the planets">Find a good time</a>
        <a class="button button--ghost" href="/rituals/spell/?premade=${encodeURIComponent(p.id)}" title="Opens it in the spell builder: change its form, ingredients, words and steps, and keep it as your own">Adapt this in the builder</a>
        ${saveArea}
      </div>
      ${view.active ? `<p class="sp-muted">Finish the ritual that’s under way before beginning another. <a class="rt-text-link" href="/altar/?ritual=1">Continue it</a></p>` : ""}
      ${altarChooser}

      ${p.safety ? `<section class="sp-card sp-card--gold" aria-labelledby="rt-care"><h2 class="sp-label" id="rt-care">Take care</h2><p>${esc(p.safety)}</p></section>` : ""}

      <div data-check>${UI.ingredientCheck(view.check)}</div>

      <section class="sp-card" aria-labelledby="rt-need">
        <h2 class="sp-label" id="rt-need">You’ll need</h2>
        ${needs}
        ${p.preparation ? `<p>${esc(p.preparation)}</p>` : ""}
      </section>

      <section class="sp-section" aria-labelledby="rt-steps">
        <h2 class="sp-label" id="rt-steps">Steps</h2>
        <ol class="rt-steps">${p.steps
          .map(
            (step) => `<li class="rt-step">
              <h3>${esc(step.title)}</h3>
              <p>${esc(step.instructions)}</p>
              ${step.spoken ? `<p class="rt-spoken">${esc(step.spoken)}</p>` : ""}
              ${step.minutes ? `<p class="sp-caption">${esc(`${step.minutes} min${step.timed ? " · moves on when the timer ends" : ""}`)}</p>` : ""}
            </li>`
          )
          .join("")}</ol>
      </section>

      <section class="sp-card" aria-labelledby="rt-closing"><h2 class="sp-label" id="rt-closing">Closing</h2><p>${esc(p.closing)}</p></section>

      <section class="sp-card" aria-labelledby="rt-about">
        <h2 class="sp-label" id="rt-about">About this working</h2>
        <p>${esc(p.lore)}</p>
        ${p.sources?.length ? `<p class="sp-muted">${esc(`Drawn from: ${p.sources.join("; ")}.`)}</p>` : ""}
      </section>`;
  }

  /** Rituals together: hand this working's steps to /rituals/together/ (sessionStorage "together.start"). */
  function beginTogether(draft, source) {
    try {
      global.sessionStorage.setItem("together.start", JSON.stringify({ kind: "draft", draft, source }));
    } catch {
      // Storage blocked: the page explains there's nothing to begin.
    }
    global.location.href = "/rituals/together/?start=1";
  }

  async function beginWorking(altarId) {
    const p = view.premade;
    view.busy = "begin";
    renderWorking();
    const active = await S.activeSession().catch(() => null);
    if (active) {
      view.active = active;
      view.busy = null;
      renderWorking();
      return;
    }
    const draft = PM.premadeDraft(p);
    S.begin(L.beginHandoff({ kind: "draft", draft: altarId ? { ...draft, linked_altar_id: altarId } : draft }, { premadeId: p.id, altarId }));
  }

  async function saveCopy() {
    view.busy = "save";
    renderWorking();
    const saved = await UI.attempt(() => S.saveTemplate(PM.premadeDraft(view.premade)), "Couldn't save");
    view.busy = null;
    if (saved) view.saved = saved;
    renderWorking();
    if (saved) UI.root().querySelector(".sp-notice a")?.focus();
  }

  async function startWorking() {
    view.premade = PM.premadeById(params.get("id"));
    if (view.premade) global.document.title = `${view.premade.title} | Salt & Sovereignty`;
    renderWorking();
    if (!view.premade) return;
    view.active = await S.activeSession().catch(() => null);
    renderWorking();
    const pantry = await S.pantry().catch(() => null);
    if (pantry) {
      view.check = R.ingredients.checkIngredients(R.ingredients.premadeNeeds(view.premade), pantry);
      UI.root().querySelector("[data-check]").innerHTML = UI.ingredientCheck(view.check);
    }
    UI.root().addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      if (button.hasAttribute("data-begin")) beginWorking(null);
      else if (button.hasAttribute("data-begin-together")) beginTogether(PM.premadeDraft(view.premade), { kind: "premade", ref: view.premade.id });
      else if (button.hasAttribute("data-save")) saveCopy();
      else if (button.hasAttribute("data-choose-altar")) {
        view.choosing = !view.choosing;
        renderWorking();
        if (view.choosing && view.altars === null) {
          view.altars = await S.altars().catch(() => []);
          renderWorking();
        }
        UI.root().querySelector("[data-choose-altar]")?.focus();
      } else if (button.dataset.altar) beginWorking(button.dataset.altar);
    });
  }

  async function start() {
    await global.SaltPage.ready();
    if (params.get("id")) await startWorking();
    else await renderBook();
  }

  UI.attempt(start, "The book couldn't be opened");
})(window);
