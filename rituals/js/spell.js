/* The spell builder (app: rituals/spell.tsx). The logic is the app's own
 * (app/src/lib/rituals/spellcraft, built into js/core/spellcraft.js). Links in:
 * ?intent= or ?intention=, ?method=, ?add=<Library refs>, ?deity=, ?planet=,
 * ?templateId= (a saved spell) and ?premade= ("Adapt this in the builder").
 * With none of those, the spell you were last building comes back. */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const L = global.RitualsLogic;
  const { esc } = UI;
  const R = global.SaltCore.rituals;
  const C = global.SaltCore.spellcraft;

  const AUTOSAVE = "rituals.spellBuilder.v2";
  const OWN_CATEGORY = { candles: "candle", herbs: "herb", crystals: "crystal" };
  const TYPE_LABELS = { candle: "Candles", herb: "Herbs", crystal: "Stones" };
  const FOCUS = ["", "5", "10", "15", "30"];
  const ALL_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const params = new URLSearchParams(global.location.search);
  const param = (k) => params.get(k) || null;

  const starters = (intent) => C.starterIngredients(C.spellIntent(intent));
  const deityName = (key) => (C.deityOf(key) || {}).name || null;

  function fromLink() {
    const premade = R.premade.premadeById(param("premade"));
    if (premade) return C.specFromPremade(premade);
    const link = { intent: param("intent"), intention: param("intention"), method: param("method"), add: param("add"), deity: param("deity"), planet: param("planet") };
    if (Object.values(link).some(Boolean) || param("fresh")) return C.specFromParams(link, starters, deityName);
    return null;
  }

  function readSaved() {
    try {
      const raw = global.localStorage.getItem(AUTOSAVE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  const state = {
    spec: fromLink() || C.blankSpec(),
    templateId: null,
    saved: null,
    templates: [],
    journal: [],
    altars: [],
    pantry: null,
    ownItems: [],
    active: null,
    busy: false,
    editing: null,
    message: ""
  };

  let saveTimer = null;
  function autosave() {
    global.clearTimeout(saveTimer);
    saveTimer = global.setTimeout(() => {
      try {
        global.localStorage.setItem(AUTOSAVE, JSON.stringify({ spec: state.spec, templateId: state.templateId }));
      } catch {
        /* Private browsing: nothing kept, nothing lost from the page. */
      }
    }, 400);
  }

  const intent = () => C.spellIntent(state.spec.intent);
  const method = () => C.methodOf(state.spec.method);
  const draft = () => C.specToDraft(state.spec, { id: state.templateId, grimoire_page_id: state.saved ? state.saved.grimoire_page_id : null });
  const steps = () => C.specSteps(state.spec);
  const has = (ref) => state.spec.ingredients.some((i) => i.ref === ref);
  const owned = () => C.ownedRefs([...suggestedAll(), ...state.spec.ingredients], state.pantry);
  function suggested() {
    const i = intent();
    return i ? C.suggestMaterials(i, { planet: state.spec.planet }) : null;
  }
  function suggestedAll() {
    const s = suggested();
    return s ? [...s.candle, ...s.herb, ...s.crystal] : [];
  }

  function update(patch, regions) {
    state.spec = { ...state.spec, ...patch };
    autosave();
    renderParts(regions);
  }

  // ------------------------------------------------------------------ parts

  const section = (id, label, body) => `<section class="sp-section" aria-labelledby="sb-${id}"><h2 class="sp-label" id="sb-${id}">${esc(label)}</h2>${body}</section>`;
  const button = (label, attrs, variant = "ghost") => `<button type="button" class="button button--${variant}" ${attrs}>${esc(label)}</button>`;
  const link = (label, href, title = "") => `<a class="rt-text-link" href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}>${esc(label)}</a>`;

  function itemChips(items, mine) {
    return `<div class="sp-chips">${items
      .map((item) =>
        UI.chip(mine.has(item.ref) ? `${item.name} · yours` : item.name, {
          pressed: has(item.ref),
          title: `${item.name}${mine.has(item.ref) ? ", you have it" : ""}${item.why ? `. ${item.why}` : ""}`,
          attrs: `data-item="${esc(item.ref)}" data-name="${esc(item.name)}" data-type="${esc(item.type)}"`
        })
      )
      .join("")}</div>`;
  }

  const PARTS = {
    title() {
      return `${esc(draft().title)}`;
    },
    intent() {
      const i = intent();
      return `<div class="sp-chips">${C.SPELL_INTENTS.map((x) => UI.chip(x.label, { pressed: state.spec.intent === x.key, attrs: `data-intent="${esc(x.key)}"` })).join("")}</div>
        ${i ? `<p class="sp-muted">${esc(i.why)}</p>` : ""}`;
    },
    form() {
      const m = method();
      return `<div class="sp-chips">${C.SPELL_METHODS.map((x) => UI.chip(x.label, { pressed: state.spec.method === x.key, title: x.line, attrs: `data-method="${esc(x.key)}"` })).join("")}</div>
        <p>${esc(m.line)}</p>
        ${m.needs.length ? `<p class="sp-muted">${esc(`You'll also need: ${m.needs.join("; ").toLowerCase()}.`)}</p>` : ""}
        ${m.history ? `<p class="sp-muted">${esc(m.history)}</p>` : ""}
        ${m.key === "sigil" ? `<p>${link("Open the sigil maker", "/sigil/")}</p>` : ""}
        ${m.key === "simmer" ? `<p>${link("Simmer pot ideas in the kitchen", "/practice/kitchen/simmer/")}</p>` : ""}`;
    },
    gather() {
      const i = intent();
      const s = suggested();
      const mine = owned();
      const groups = s
        ? `<p class="sp-muted">${esc(`From the Living Library for ${i.label.toLowerCase()}${state.spec.planet ? `, leaning to ${state.spec.planet}` : ""}. Things you have are marked and come first.`)}</p>
          ${["candle", "herb", "crystal"]
            .filter((t) => s[t].length)
            .map((t) => `<p class="sp-eyebrow">${TYPE_LABELS[t]}</p>${itemChips(C.ownedFirst(s[t], mine), mine)}`)
            .join("")}`
        : `<p class="sp-muted">Choose what it's for and the Library will suggest candles, herbs and stones. Or choose freely below.</p>`;
      const own = state.ownItems.length ? `<p class="sp-eyebrow">Your own cabinet</p>${itemChips(state.ownItems, mine)}` : "";
      const all = ["candle", "herb", "crystal"]
        .map(
          (t) =>
            `<details class="sp-details"><summary>${esc(`All ${TYPE_LABELS[t].toLowerCase()} in the Library`)}</summary>${itemChips(
              C.allMaterials(t).map((x) => ({ ...x, name: x.danger ? `${x.name} (poisonous)` : x.name })),
              mine
            )}</details>`
        )
        .join("");
      const chosen = state.spec.ingredients.length
        ? `<div class="sp-card"><p class="sp-label">Chosen</p><ul class="rt-plain-list">${state.spec.ingredients
            .map((item) => {
              const subs = item.ref.startsWith("traditional/") ? C.substitutesFor(item.ref) : [];
              return `<li><h3>${esc(`${item.name}${mine.has(item.ref) ? " · you have it" : ""}`)}</h3>
                ${
                  subs.length
                    ? `<p class="sp-muted">Or use instead:</p><div class="sp-chips">${subs
                        .map((x) =>
                          x.ref
                            ? `<button type="button" class="sp-chip" data-swap="${esc(item.ref)}" data-to="${esc(x.ref)}" data-to-name="${esc(x.name)}" aria-label="${esc(`Use ${x.name} instead of ${item.name}`)}">${esc(x.name)} ⇄</button>`
                            : `<span class="sp-chip">${esc(x.name)}</span>`
                        )
                        .join("")}</div>`
                    : ""
                }
                <p>${item.ref.startsWith("traditional/") ? `${link("In the Library", L.libraryHref(item.ref))} · ` : ""}<button type="button" class="rt-text-link" data-remove="${esc(item.ref)}">Remove</button></p></li>`;
            })
            .join("")}</ul><p class="sp-caption">${esc(`${C.GENERAL_SUBSTITUTES.candle} ${C.GENERAL_SUBSTITUTES.crystal}`)}</p></div>`
        : "";
      const check = state.spec.ingredients.length ? UI.ingredientCheck(R.ingredients.checkIngredients(R.ingredients.templateNeeds({ ingredients: state.spec.ingredients }), state.pantry || { objects: [] })) : "";
      return `${groups}${own}${all}${chosen}${check}`;
    },
    deities() {
      const i = intent();
      const list = i ? C.suggestDeities(i, { planet: state.spec.planet }) : [];
      const honoured = (key) => state.spec.deities.some((d) => d.key === key);
      return `<p class="sp-muted">Optional. Deities aren't ingredients: approach them through their own tradition, with an offering, and ask rather than command.</p>
        ${list
          .map(
            (d) => `<div class="sp-card"><h3>${esc(`${d.name}${d.tradition ? ` · ${d.tradition}` : ""}`)}</h3>
              ${d.link ? `<p class="sp-muted">${esc(`${C.DEITY_LINK_LABEL[d.link]} to ${d.planet}`)}</p>` : ""}
              ${d.note ? `<p>${esc(d.note)}</p>` : ""}
              ${d.days.length ? `<p class="sp-muted">${esc(`Their days: ${d.days.map((x) => `${x.name} (${x.basis})`).join("; ")}`)}</p>` : ""}
              ${d.respect ? `<p class="sp-caption">${esc(d.respect)}</p>` : ""}
              <div class="sp-actions">${d.key ? button(honoured(d.key) ? "Honouring" : "Honour in this spell", `data-deity="${esc(d.key)}" data-name="${esc(d.name)}" aria-pressed="${honoured(d.key)}"`, honoured(d.key) ? "primary" : "ghost") : ""}
              ${d.key ? link("In the Library", L.libraryHref(`traditional/deity/${d.key}`)) : ""}</div></div>`
          )
          .join("")}
        <details class="sp-details"><summary>All deities in the Library</summary><div class="sp-chips">${C.allDeities()
          .map((d) => UI.chip(d.name, { pressed: honoured(d.key), title: `${d.name}, ${d.tradition}`, attrs: `data-deity="${esc(d.key)}" data-name="${esc(d.name)}"` }))
          .join("")}</div></details>
        <p>${link("Closed & living traditions", "/library/closed/")}</p>`;
    },
    when() {
      const i = intent();
      const moons = i ? C.suggestMoons(i) : ["new", "waxing", "full", "waning"].map((tide) => ({ tide, label: C.TIDE_LABELS[tide], best: false }));
      const days = C.suggestDays(i || { ...C.SPELL_INTENTS[0], planets: ALL_PLANETS });
      const p = state.spec.planet;
      return `<p class="sp-eyebrow">The moon</p><div class="sp-chips">${moons
        .map((m) => UI.chip(`${m.label}${m.best ? " · best" : ""}`, { pressed: state.spec.moon === m.tide, attrs: `data-moon="${m.tide}"` }))
        .join("")}</div>
        <p class="sp-eyebrow">The day and its planet</p><div class="sp-chips">${days
          .map((d) => UI.chip(`${d.day} · ${d.planet}`, { pressed: p === d.planet, attrs: `data-planet="${d.planet}"` }))
          .join("")}</div>
        ${p ? `<p>${link(`About ${p}: colours, herbs, stones`, `/practice/cosmic/planet/?planet=${encodeURIComponent(p)}`)}</p>` : ""}
        <div class="sp-actions">${button("Find a good time", "data-find-time")}</div>`;
    },
    wordsExtra() {
      const i = intent();
      const line = i ? C.WORDS_STARTERS[i.key] : "";
      return line && state.spec.words.trim() !== line ? `<button type="button" class="rt-text-link" data-starter title="${esc(line)}">Start from a simple line</button>` : "";
    },
    steps() {
      const list = steps();
      const m = method();
      return `<p class="sp-muted">${esc(state.spec.steps ? "These are your own steps now." : `Following the ${m.label.toLowerCase()} form. Change anything and they become yours.`)}</p>
        <p class="sp-eyebrow">Time to sit with it</p>
        <div class="sp-chips">${FOCUS.map((x) => UI.chip(x ? `${x} minutes` : "No timer", { pressed: state.spec.focusMinutes === x, attrs: `data-focus="${x}"` })).join("")}</div>
        <ol class="rt-steps">${list
          .map((s, n) => {
            const body =
              state.editing === n
                ? `<div class="sp-field"><label for="sb-st-${n}">Title</label><input id="sb-st-${n}" type="text" data-step="${n}" data-key="title" value="${esc(s.title)}" /></div>
                  <div class="sp-field"><label for="sb-si-${n}">What to do</label><textarea id="sb-si-${n}" data-step="${n}" data-key="instructions">${esc(s.instructions)}</textarea></div>
                  <div class="sp-field"><label for="sb-ss-${n}">Words to say (optional)</label><textarea id="sb-ss-${n}" data-step="${n}" data-key="spoken_text">${esc(s.spoken_text)}</textarea></div>
                  <div class="sp-field"><label for="sb-sm-${n}">Minutes (optional)</label><input id="sb-sm-${n}" type="text" inputmode="numeric" data-step="${n}" data-key="minutes" value="${esc(s.minutes)}" /></div>
                  <div class="sp-actions">${button("Done", "data-done")}</div>`
                : `<h3>${esc(s.title || "Untitled step")}</h3>${s.instructions ? `<p>${esc(s.instructions)}</p>` : ""}${s.spoken_text ? `<p class="sp-muted">“${esc(s.spoken_text)}”</p>` : ""}${
                    s.minutes ? `<p class="sp-caption">${esc(`${s.minutes} min`)}</p>` : ""
                  }`;
            return `<li class="rt-step">${body}<p>${state.editing === n ? "" : `<button type="button" class="rt-text-link" data-edit="${n}">Edit</button> · `}${
              n > 0 ? `<button type="button" class="rt-text-link" data-move="${n}" data-by="-1" aria-label="Move step ${n + 1} earlier">Up</button> · ` : ""
            }${n < list.length - 1 ? `<button type="button" class="rt-text-link" data-move="${n}" data-by="1" aria-label="Move step ${n + 1} later">Down</button> · ` : ""}<button type="button" class="rt-text-link" data-drop="${n}">Remove</button></p></li>`;
          })
          .join("")}</ol>
        <div class="sp-actions">${button("Add a step", "data-add-step")}${state.spec.steps ? button(`Use the ${m.label.toLowerCase()} steps again`, "data-reset-steps") : ""}</div>`;
    },
    safety() {
      const notes = C.spellSafety(state.spec);
      return notes.length ? `<div class="sp-card"><p class="sp-label">8 · Take care</p>${notes.map((x) => `<p>${x.level === "danger" ? "<strong>Danger:</strong> " : ""}${esc(x.text)}</p>`).join("")}</div>` : "";
    },
    altars() {
      return state.altars.length
        ? `<p class="sp-eyebrow">Belongs to an altar</p><div class="sp-chips">${state.altars.map((a) => UI.chip(a.name, { pressed: state.spec.altarId === a.id, attrs: `data-altar="${esc(a.id)}"` })).join("")}</div>`
        : "";
    },
    history() {
      const h = C.spellHistory(state.journal, state.spec, { templateId: state.templateId, title: draft().title });
      return `<p class="sp-label">Did it work?</p>
        ${
          h.workings.length
            ? `<p>${esc(h.line || `Worked ${h.workings.length} ${h.workings.length === 1 ? "time" : "times"}, still waiting to look back.`)}</p><ul class="rt-plain-list">${h.workings
                .slice(0, 5)
                .map((w) => `<li>${esc(`${w.date || ""} · ${w.answerLabel || (w.waitingUntil ? `look back ${w.waitingUntil}` : "no look-back yet")}`)}</li>`)
                .join("")}</ul>`
            : `<p class="sp-muted">After you've done it, the journal asks when to look back, and then whether it worked. The answers gather here and in What works for you.</p>`
        }
        ${h.materials.map((m) => `<p class="sp-muted">${esc(`${m.name}: ${m.tally.yes} of ${m.tally.total} workings with it worked${m.tally.caveat ? ` (${m.tally.caveat})` : ""}.`)}</p>`).join("")}
        <p>${link("What works for you", "/rituals/journal/insights/#did-it-work")}</p>`;
    },
    actions() {
      const account = S.user();
      const saved = state.saved;
      const blocked = state.busy || !!state.active;
      return `<div class="sp-actions">
          ${button(state.busy ? "One moment…" : "Begin now", `data-begin${blocked ? " disabled" : ""}`, "primary")}
          ${button("Begin together", `data-begin-together${state.busy ? " disabled" : ""}`)}
          ${button("Plan a night for it", "data-plan")}
          ${account ? button(state.busy ? "Saving…" : saved ? "Save changes" : "Keep in my Grimoire", `data-keep${state.busy ? " disabled" : ""}`) : ""}
          ${button("Print", "data-print")}
          ${button("Copy as text", "data-copy")}
          ${button("Start a new spell", "data-new", "text")}
        </div>
        ${account ? "" : `<p class="sp-muted">Sign in to keep spells in your Grimoire, begin them on an altar and share them.</p>`}
        ${
          saved
            ? `<p class="sp-notice">Kept. ${link("Open it", `/altar/?editRitualTemplate=${encodeURIComponent(saved.id)}`)}${
                saved.grimoire_page_id ? ` · ${link("Its Grimoire page", `/grimoire/?page=${encodeURIComponent(saved.grimoire_page_id)}`)}` : ""
              } · ${link("Begin on an altar", `/altar/?editRitualTemplate=${encodeURIComponent(saved.id)}`)} · ${link("Share with the community", `/rituals/community/?share=1&template=${encodeURIComponent(saved.id)}`, "Offers a copy to Community Rituals, reviewed before it appears")}</p>`
            : ""
        }
        ${state.message ? `<p class="sp-notice" role="status">${esc(state.message)}</p>` : ""}
        ${state.active ? `<p class="sp-notice">A ritual is under way. Finish it before beginning this one. <a class="rt-text-link" href="/altar/?ritual=1">Continue it</a></p>` : ""}`;
    }
  };

  const ALL = Object.keys(PARTS);

  function renderParts(regions = ALL) {
    const main = UI.root();
    for (const name of regions) {
      const el = main.querySelector(`[data-part="${name}"]`);
      if (el) el.innerHTML = PARTS[name]();
    }
    const name = main.querySelector("#sb-name");
    if (name) name.placeholder = C.defaultName(state.spec);
    const words = main.querySelector("#sb-words");
    if (words) words.placeholder = method().wordsHint;
    main.querySelector("[data-steps-title]").textContent = `7 · The steps (${steps().length})`;
  }

  /** Text fields are drawn once and refilled only when the whole spell changes. */
  function fillFields() {
    const main = UI.root();
    for (const key of ["purpose", "words", "name", "notes"]) {
      const el = main.querySelector(`[data-text="${key}"]`);
      if (el) el.value = state.spec[key] || "";
    }
  }

  function render() {
    const main = UI.root();
    main.innerHTML = `
      ${UI.header({ eyebrow: "Spell builder", title: "My spell", lead: "Work through it in order or jump about: every choice can be changed, and the steps follow along until you make them your own." })}
      ${section("for", "1 · What is it for?", `<div data-part="intent"></div>`)}
      <div class="sp-field"><label for="sb-purpose">In your own words</label><textarea id="sb-purpose" data-text="purpose" placeholder="Steady work that pays the rent"></textarea></div>
      ${section("form", "2 · Its form", `<div data-part="form"></div>`)}
      ${section("gather", "3 · What goes in", `<div data-part="gather"></div>
        <div class="sp-field"><label for="sb-other">Something else</label><input id="sb-other" type="text" placeholder="Salt, a coin, a photograph, ribbon…" /></div>
        <div class="sp-actions">${button("Add it", "data-add-other")}</div>`)}
      ${section("deities", "4 · Who you honour (if anyone)", `<div data-part="deities"></div>`)}
      ${section("when", "5 · When", `<div data-part="when"></div>`)}
      ${section(
        "words",
        "6 · Your words",
        `<div class="sp-field"><label for="sb-words">Words, chant or petition</label><textarea id="sb-words" data-text="words"></textarea></div><p data-part="wordsExtra"></p>`
      )}
      <section class="sp-section" aria-labelledby="sb-steps"><h2 class="sp-label" id="sb-steps" data-steps-title>7 · The steps</h2><div data-part="steps"></div></section>
      <div data-part="safety"></div>
      ${section(
        "meta",
        "9 · Name, notes and altar",
        `<div class="sp-field"><label for="sb-name">Name</label><input id="sb-name" type="text" data-text="name" /></div>
        <div class="sp-field"><label for="sb-notes">Notes of your own</label><textarea id="sb-notes" data-text="notes" placeholder="Where it came from, what to change next time…"></textarea></div>
        <div data-part="altars"></div>`
      )}
      <section class="sp-card" data-part="history"></section>
      <section class="sp-card" data-part="actions"></section>
      <pre class="sb-print" data-print-text aria-hidden="true"></pre>`;
    main.querySelector("h1").setAttribute("data-part", "title");
    fillFields();
    renderParts();
  }

  function setSteps(next, regions = ["steps", "title", "actions"]) {
    update({ steps: next }, regions);
  }

  function bind() {
    const main = UI.root();
    main.addEventListener("input", (event) => {
      const t = event.target;
      if (t.dataset.text) {
        state.spec = { ...state.spec, [t.dataset.text]: t.value };
        autosave();
        renderParts(["title", "history", ...(t.dataset.text === "words" ? ["wordsExtra"] : []), ...(state.spec.steps || t.dataset.text === "notes" ? [] : ["steps"])]);
      } else if (t.dataset.step !== undefined) {
        const n = Number(t.dataset.step);
        const key = t.dataset.key;
        const value = key === "minutes" ? t.value.replace(/[^0-9]/g, "") : t.value;
        const list = steps().map((s, i) => (i === n ? { ...s, [key]: value, completion_mode: key === "minutes" && !value ? "manual" : s.completion_mode } : s));
        state.spec = { ...state.spec, steps: list };
        autosave();
        main.querySelector("[data-steps-title]").textContent = `7 · The steps (${list.length})`;
      }
    });

    main.addEventListener("click", async (event) => {
      const el = event.target.closest("button");
      if (!el || el.disabled) return;
      const d = el.dataset;
      if (d.intent) {
        const next = state.spec.intent === d.intent ? null : d.intent;
        const untouched = !state.spec.ingredients.length || state.spec.ingredients.every((i) => starters(state.spec.intent).some((s) => s.ref === i.ref));
        update({ intent: next, ...(untouched ? { ingredients: starters(next) } : {}) });
      } else if (d.method) {
        update({ method: d.method });
      } else if (d.item) {
        update({ ingredients: has(d.item) ? state.spec.ingredients.filter((i) => i.ref !== d.item) : [...state.spec.ingredients, { ref: d.item, name: d.name.replace(/ \(poisonous\)$/, ""), type: d.type }] }, ["gather", "title", "steps", "safety", "history"]);
      } else if (d.remove) {
        update({ ingredients: state.spec.ingredients.filter((i) => i.ref !== d.remove) }, ["gather", "title", "steps", "safety", "history"]);
      } else if (d.swap) {
        const list = state.spec.ingredients.map((i) => (i.ref === d.swap ? { ref: d.to, name: d.toName, type: i.type } : i)).filter((i, n, all) => all.findIndex((x) => x.ref === i.ref) === n);
        update({ ingredients: list }, ["gather", "steps", "safety", "history"]);
      } else if (el.hasAttribute("data-add-other")) {
        const input = main.querySelector("#sb-other");
        const name = input.value.trim();
        if (!name) return;
        const ref = `own/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        input.value = "";
        if (!has(ref)) update({ ingredients: [...state.spec.ingredients, { ref, name, type: "item" }] }, ["gather", "steps", "safety"]);
      } else if (d.deity) {
        const on = state.spec.deities.some((x) => x.key === d.deity);
        update({ deities: on ? state.spec.deities.filter((x) => x.key !== d.deity) : [...state.spec.deities, { key: d.deity, name: d.name }] }, ["deities", "steps", "title"]);
      } else if (d.moon) {
        update({ moon: state.spec.moon === d.moon ? null : d.moon }, ["when"]);
      } else if (d.planet) {
        update({ planet: state.spec.planet === d.planet ? null : d.planet }, ["when", "gather", "deities"]);
      } else if (d.focus !== undefined) {
        update({ focusMinutes: d.focus }, ["steps"]);
      } else if (el.hasAttribute("data-starter")) {
        const line = C.WORDS_STARTERS[state.spec.intent];
        const words = state.spec.words.trim() ? `${state.spec.words.trim()}\n${line}` : line;
        main.querySelector("#sb-words").value = words;
        update({ words }, ["wordsExtra", "steps"]);
      } else if (d.edit !== undefined) {
        state.editing = Number(d.edit);
        renderParts(["steps"]);
        main.querySelector(`#sb-st-${state.editing}`)?.focus();
      } else if (el.hasAttribute("data-done")) {
        state.editing = null;
        renderParts(["steps", "title"]);
      } else if (d.move !== undefined) {
        const list = [...steps()];
        const n = Number(d.move);
        const [s] = list.splice(n, 1);
        list.splice(n + Number(d.by), 0, s);
        state.editing = null;
        setSteps(list);
      } else if (d.drop !== undefined) {
        state.editing = null;
        setSteps(steps().filter((_, n) => n !== Number(d.drop)));
      } else if (el.hasAttribute("data-add-step")) {
        const list = [...steps(), { ...R.lifecycle.blankStep(), title: "A step of my own" }];
        state.editing = list.length - 1;
        setSteps(list);
      } else if (el.hasAttribute("data-begin-together")) {
        try {
          global.sessionStorage.setItem("together.start", JSON.stringify({ kind: "draft", draft: draft(), source: { kind: "spell", ref: state.saved ? state.saved.id : null } }));
        } catch {
          // Storage blocked: the page explains there's nothing to begin.
        }
        global.location.href = "/rituals/together/?start=1";
      } else if (el.hasAttribute("data-reset-steps")) {
        state.editing = null;
        setSteps(null);
      } else if (d.altar) {
        update({ altarId: state.spec.altarId === d.altar ? null : d.altar }, ["altars"]);
      } else if (el.hasAttribute("data-find-time")) {
        // The timing advisor, which hands the chosen time to the planner with this spell.
        const spell = draft();
        S.handOffDraft(spell);
        const i = intent();
        const q = { ...(state.saved ? { templateId: state.saved.id } : { fromSpell: "1" }), title: spell.title, ...(i ? { intent: i.key } : {}) };
        if (state.spec.moon) q.moon = state.spec.moon;
        if (state.spec.planet) q.weekday = String(ALL_PLANETS.indexOf(state.spec.planet));
        global.location.href = `/practice/cosmic/timing/?${new URLSearchParams(q)}`;
      } else if (el.hasAttribute("data-plan")) {
        S.handOffDraft(draft());
        const key = C.plannerKeyOf(state.spec);
        global.location.href = state.saved
          ? `/rituals/planner/?templateId=${encodeURIComponent(state.saved.id)}`
          : `/rituals/planner/?fromSpell=1${key ? `&intention=${encodeURIComponent(key)}` : ""}`;
      } else if (el.hasAttribute("data-begin")) {
        state.busy = true;
        renderParts(["actions"]);
        state.active = await S.activeSession().catch(() => null);
        if (state.active) {
          state.busy = false;
          renderParts(["actions"]);
          return;
        }
        S.begin(L.beginHandoff(state.saved ? { kind: "template", templateId: state.saved.id } : { kind: "draft", draft: draft() }, { altarId: state.spec.altarId }));
      } else if (el.hasAttribute("data-keep")) {
        state.busy = true;
        renderParts(["actions"]);
        const from = state.saved && state.saved.metadata && state.saved.metadata.from ? state.saved.metadata.from : null;
        const saved = await UI.attempt(() => S.saveTemplate({ ...draft(), from }, { replace: !!state.saved }), "Couldn't save");
        state.busy = false;
        if (saved) {
          state.message = state.saved ? "Your changes are saved." : "Kept in your Grimoire, with your templates.";
          state.saved = saved;
          state.templateId = saved.id;
          autosave();
        }
        renderParts(["actions", "history"]);
      } else if (el.hasAttribute("data-print")) {
        main.querySelector("[data-print-text]").textContent = C.spellText(state.spec);
        global.print();
      } else if (el.hasAttribute("data-copy")) {
        try {
          await global.navigator.clipboard.writeText(C.spellText(state.spec));
          state.message = "Copied. Paste it wherever you like.";
        } catch {
          state.message = "Your browser wouldn't copy it; use Print instead.";
        }
        renderParts(["actions"]);
      } else if (el.hasAttribute("data-new")) {
        state.spec = C.blankSpec();
        state.templateId = null;
        state.saved = null;
        state.editing = null;
        state.message = "";
        autosave();
        fillFields();
        renderParts();
      }
    });
  }

  async function start() {
    await global.SaltPage.ready();
    const fromUrl = !!fromLink();
    if (!fromUrl && !param("templateId")) {
      const saved = readSaved();
      if (saved && saved.spec) {
        state.spec = C.migrateSpec(saved.spec);
        state.templateId = saved.templateId || null;
      }
    }
    render();
    bind();
    const [pantry, active, templates, journal, altars] = await Promise.all([
      S.pantry().catch(() => null),
      S.activeSession().catch(() => null),
      S.templates().catch(() => []),
      S.journal().catch(() => []),
      S.altars().catch(() => [])
    ]);
    Object.assign(state, { pantry, active, templates, journal, altars });
    const wanted = param("templateId") || state.templateId;
    const template = wanted ? templates.find((t) => t.id === wanted) : null;
    if (template) {
      state.saved = template;
      state.templateId = template.id;
      if (param("templateId")) state.spec = C.openTemplate(template);
    } else if (param("templateId")) {
      state.message = "That saved spell couldn't be found here. Sign in, or open it from your templates.";
    } else {
      state.templateId = null;
    }
    // Your own candles, herbs and crystals from the cabinet sit beside the Library's.
    state.ownItems = ((pantry && pantry.customItems) || [])
      .filter((item) => OWN_CATEGORY[item.category])
      .map((item) => ({ ref: `custom/${item.id}`, name: item.name, type: OWN_CATEGORY[item.category] }));
    fillFields();
    renderParts();
  }

  UI.attempt(start, "The spell builder couldn't open");
})(window);
