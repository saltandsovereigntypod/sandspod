/*
 * The coven ritual builder on the website, the twin of the app's
 * ritual/plan.tsx and components/covens/builder/. Its rules are the app's own
 * (lib/covens/builder.ts, fields.ts, templates.ts, script.ts, through
 * js/core/covens.js), and it saves the same shapes through save_coven_ritual
 * (supabase/migrations/20261103000000_coven_ritual_builder.sql).
 *
 * A gathering (a rite or a meeting) starts from a ready-made template, one of
 * the coven's own, a copy of one of its rituals, one of your own rituals, or
 * nothing, and shows as an OUTLINE: its sections with one-line step cards.
 * Each step opens in its own panel: what it is, who and how, its fields, its
 * words (or a page of the coven's Book), and the rest under More options.
 * Roles, the checklist, afterwards and the sections have panels of their own;
 * the preview reads the whole script or your run-through.
 *
 *   CovenBuilder.open(pane, { state, ritual, backHref, onSaved })
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;

  const core = () => global.SaltCore?.covens || {};
  const B = () => core().builder;
  const F = () => core().fields;
  const T = () => core().templates;
  const S = () => core().script;
  const P = () => core().picker;
  const A = () => core().stepActions;
  const C = () => core().contributions;

  let pane = null;
  let ctx = null;
  let m = null;
  // Inside a step or panel the browser's Back goes to the outline: an extra
  // history entry stands for the inner view while it is open.
  let innerPushed = false;
  let swallowPop = false;

  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const nameOf = (id) => UI.nameOf(ctx.state.context, id);
  const btn = (label, act, extra = "", cls = "button--ghost button--small") => `<button class="button ${cls}" type="button" data-act="${act}" ${extra}>${esc(label)}</button>`;
  const chip = (label, act, attrs, on) => `<button type="button" class="sp-chip${on ? " is-active" : ""}" data-act="${act}" ${attrs} aria-pressed="${Boolean(on)}">${esc(label)}</button>`;
  const attr = (o) => Object.entries(o).map(([k, v]) => `data-${k}="${esc(v)}"`).join(" ");
  const whoCtx = () => ({ roles: m.plan.roles, ranks: ctx.state.ranks, nameOf });
  const whoLabel = (key) => B().whoLabel(key, whoCtx());
  const ordered = () => B().orderBySections(m.steps, m.plan.sections);
  const stepByKey = (key) => m.steps.find((s) => s.key === key);
  const setStatus = (text, error) => UI.setStatus(pane.querySelector("[data-status]"), text, error);

  // --- opening -----------------------------------------------------------------

  async function open(el, options) {
    innerPushed = false;
    swallowPop = false;
    pane = el;
    ctx = options;
    const state = ctx.state;
    const ritual = ctx.ritual || null;
    pane.innerHTML = `<p class="sp-caption">Opening the builder…</p>`;
    if (!B() || !T()) {
      pane.innerHTML = `<p class="sp-notice">The builder couldn’t load. Refresh the page to try again.</p>`;
      return;
    }
    const kind = ritual?.kind === "meeting" ? "meeting" : "rite";
    const plan = B().cleanPlan(ritual?.plan, kind);
    const saved = ritual ? L.orderSteps(state.ritualSteps, ritual.id) : [];
    m = {
      ritual,
      kind,
      plan,
      steps: B().orderBySections(saved.map((s) => B().builderStepFrom(s, plan)), plan.sections),
      fields: {
        title: ritual?.title || "",
        intention: ritual?.intention || "",
        description: ritual?.description || "",
        occasion: ritual?.occasion || "",
        occasion_name: ritual?.occasion_name || "",
        when: L.toLocalInput(ritual?.scheduled_for)
      },
      view: ritual ? "outline" : "start",
      previewMode: "script",
      library: [],
      pages: [],
      people: [],
      ownRituals: [],
      itemList: [],
      I: null,
      more: false,
      tidying: false,
      choosing: null,
      group: "",
      actionDraft: null
    };
    const [people, library, pages, own, altarCore, petitions, today] = await Promise.all([
      D.ritualPeople(state.coven.id).catch(() => []),
      D.ritualLibrary(state.coven.id).catch(() => []),
      D.bookPages(state.coven.id).catch(() => []),
      D.myRitualTemplates(state.context.user?.id).catch(() => []),
      UI.altarCore().catch(() => null),
      D.petitions(state.coven.id).catch(() => []),
      loadToday()
    ]);
    if (pane !== el) return;
    await UI.loadNames(state.context, people.map((p) => p.user_id));
    m.people = people.map((p) => ({ id: p.user_id, name: nameOf(p.user_id), eligible: Boolean(p.eligible) })).sort((a, b) => a.name.localeCompare(b.name));
    m.library = library;
    m.pages = pages;
    m.ownRituals = own;
    m.I = altarCore?.itemIndex || null;
    m.itemList = m.I ? m.I.itemIndex({ petitions: (petitions || []).filter((p) => p.status === "open") }) : [];
    const covenDays = core().programs?.covenHolidaysBetween(state.coven, new Date(), new Date(Date.now() + 200 * 86400000)) || [];
    m.suggestions = today ? L.occasionSuggestions(today, new Date(), 6, covenDays) : [];
    draw();
  }

  let todayLoading = null;
  function loadToday() {
    if (global.SaltCore?.today) return Promise.resolve(global.SaltCore.today);
    if (!todayLoading) {
      todayLoading = new Promise((resolve) => {
        const script = global.document.createElement("script");
        script.src = UI.href("/js/core/today.js");
        script.onload = () => resolve(global.SaltCore?.today || null);
        script.onerror = () => resolve(null);
        global.document.head.appendChild(script);
      });
    }
    return todayLoading;
  }

  const custom = () => m.library.filter((l) => l.kind === "action").map((l) => B().cleanCustomAction(l.id, l.body)).filter(Boolean);
  const blocks = () => m.library.filter((l) => l.kind === "block");
  const savedTemplates = () => m.library.filter((l) => l.kind === "template");
  const whoEntries = () => [...B().roleEntries(m.plan.roles), ...P().whoEntries(ctx.state.ranks, m.people)];
  const whoSuggest = () => [...m.plan.roles.map((r) => `role:${r.id}`), ...P().whoSuggestions(P().whoEntries(ctx.state.ranks, m.people))];

  // --- drawing -----------------------------------------------------------------

  function back() {
    return `<div class="sp-actions"><button class="button button--ghost" type="button" data-act="view" data-view="outline">← Back to the outline</button></div>`;
  }

  function draw() {
    if (!pane) return;
    const v = m.view;
    const html =
      v === "start" ? startHtml()
      : v === "outline" ? outlineHtml()
      : v === "details" ? detailsHtml()
      : v === "roles" ? rolesHtml()
      : v === "sections" ? sectionsHtml()
      : v === "prep" ? prepHtml()
      : v === "after" ? afterHtml()
      : v === "preview" ? previewHtml()
      : v === "action" ? actionHtml()
      : stepHtml(v.step);
    pane.innerHTML = `<div class="cv-builder">${html}</div>`;
    const inner = v !== "start" && v !== "outline";
    if (inner && !innerPushed) {
      global.history.pushState({ covenBuilder: true }, "", global.location.href);
      innerPushed = true;
    } else if (!inner && innerPushed) {
      innerPushed = false;
      swallowPop = true;
      global.history.back();
    }
    mount();
  }

  function startHtml() {
    const ready = T().RITUAL_TEMPLATES.filter((t) => t.kind === m.kind);
    const copies = ctx.state.rituals.filter((r) => (r.kind || "rite") === m.kind).slice(0, 12);
    const row = (label, detail, act, attrs) => `<button type="button" class="sp-row cv-row-button" data-act="${act}" ${attrs}><span class="sp-row__text"><span class="sp-row__title">${esc(label)}</span>${detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""}</span><span class="sp-row__chevron" aria-hidden="true">›</span></button>`;
    return `<p><a class="sp-back" href="${esc(ctx.backHref)}" data-tab="rituals">← All rituals</a></p>
      <h2>Plan a gathering</h2>
      <div class="sp-chips" role="group" aria-label="What kind of gathering">${B().GATHERING_KINDS.map((k) => chip(k.label, "kind", attr({ kind: k.value }), m.kind === k.value)).join("")}</div>
      <p class="sp-caption">${esc(B().GATHERING_KINDS.find((k) => k.value === m.kind).detail)}</p>
      <div class="sp-actions">${btn(m.kind === "meeting" ? "Start with an empty agenda" : "Start with an empty outline", "blank", "", "button--ghost")}</div>
      <section class="sp-section"><h3>Ready-made</h3><nav class="sp-list" aria-label="Ready-made">${ready.map((t) => row(t.name, `${t.tradition} · ${t.summary}`, "template", attr({ id: t.id }))).join("")}</nav></section>
      ${savedTemplates().length ? `<section class="sp-section"><h3>The coven’s own templates</h3><nav class="sp-list">${savedTemplates().map((t) => row(t.title, "", "saved-template", attr({ id: t.id }))).join("")}</nav></section>` : ""}
      ${copies.length ? `<section class="sp-section"><h3>A copy of one of the coven’s</h3><nav class="sp-list">${copies.map((r) => row(r.title, L.occasionLabel(r), "copy", attr({ id: r.id }))).join("")}</nav></section>` : ""}
      ${m.ownRituals.length ? `<section class="sp-section"><h3>One of your own rituals</h3><nav class="sp-list">${m.ownRituals.slice(0, 12).map((t) => row(t.title, "", "own", attr({ id: t.id }))).join("")}</nav></section>` : ""}
      ${m.library.length ? `<section class="sp-section"><h3>The coven’s library</h3><div class="sp-actions">${btn(m.tidying ? "Done tidying" : "Remove saved templates, blocks or actions", "tidy")}</div>${m.tidying ? `<div class="sp-list">${m.library.map((l) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(l.title)}</span><span class="sp-row__detail">${l.kind === "template" ? "Template" : l.kind === "block" ? "Block of steps" : "Action"}</span></span>${btn("Remove", "library-remove", attr({ id: l.id }))}</div>`).join("")}</div>` : ""}</section>` : ""}
      ${statusLine()}`;
  }

  function problems() {
    const out = {};
    for (const s of ordered()) {
      const blocked = L.unassignablePart(B().withFieldColumns(s, m.plan, custom()), m.people, nameOf);
      if (blocked) out[s.key] = blocked;
    }
    return out;
  }

  function outlineHtml() {
    const wc = whoCtx();
    const cust = custom();
    const probs = problems();
    const parts = B().outline(m.plan, m.steps);
    const total = m.steps.length - 1;
    const canSchedule = ctx.state.perms.schedule || ctx.state.perms.site;
    const keepsSchedule = m.ritual?.status === "scheduled";
    const summaryRow = (label, detail, view) => `<button type="button" class="sp-row cv-row-button" data-act="view" data-view="${view}"><span class="sp-row__text"><span class="sp-row__title">${esc(label)}</span><span class="sp-row__detail">${esc(detail)}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></button>`;
    const when = [m.fields.when ? new Date(m.fields.when).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "No date yet", m.fields.occasion_name || (L.OCCASIONS.find((o) => o.value === m.fields.occasion) || {}).label || ""].filter(Boolean).join(" · ");
    const after = [m.plan.afterwards.hold_hours ? `Altar left for ${m.plan.afterwards.hold_hours} hours` : "", m.plan.afterwards.notes ? "Notes" : "", m.plan.afterwards.follow_up ? "A follow-up" : ""].filter(Boolean).join(" · ") || "Nothing set";
    return `<p><a class="sp-back" href="${esc(ctx.backHref)}" data-tab="rituals">← ${m.ritual ? "Back to the ritual" : "All rituals"}</a></p>
      <h2>${m.ritual ? `Edit ${m.kind === "meeting" ? "the meeting" : "the rite"}` : m.kind === "meeting" ? "Plan a meeting" : "Plan a rite"}</h2>
      <nav class="sp-list" aria-label="About it">
        ${summaryRow(m.fields.title.trim() || "Name it", when, "details")}
        ${summaryRow("Roles", m.plan.roles.length ? m.plan.roles.map((r) => `${r.name}${r.cast.length ? "" : " (no one yet)"}`).join(", ") : "None yet", "roles")}
        ${summaryRow(m.kind === "meeting" ? "Before the meeting" : "Before the rite", m.plan.checklist.length ? m.plan.checklist.map((c) => c.text).join(" · ") : "Nothing to do yet", "prep")}
        ${summaryRow("Afterwards", after, "after")}
        ${summaryRow("Sections", m.plan.sections.map((s) => s.name).join(" · "), "sections")}
      </nav>
      <div class="cv-outline">${parts
        .map(({ section, steps }) => {
          const minutes = steps.reduce((sum, x) => sum + (x.step.duration_minutes || 0), 0);
          return `<section class="cv-outline__section" aria-label="${esc(section.name)}">
            <div class="cv-outline__head"><h3>${esc(section.name)}</h3>${minutes ? `<span class="sp-caption">about ${minutes} min</span>` : ""}</div>
            <ol class="cv-outline__steps">${steps
              .map(({ step, index }) => `<li class="cv-outline__step${probs[step.key] ? " is-warn" : ""}">
                <button type="button" class="cv-outline__open" data-act="open" data-key="${esc(step.key)}">
                  <span class="cv-outline__title"><span class="cv-outline__n">${index + 1}.</span> ${esc(B().stepSummary(step, wc, cust))}</span>
                  <span class="sp-caption">${esc(probs[step.key] || B().stepWhoLine(step, wc))}</span></button>
                <span class="cv-outline__arrows">
                  <button type="button" class="button button--ghost button--small" data-act="move" data-key="${esc(step.key)}" data-by="-1" ${index === 0 ? "disabled" : ""} aria-label="Move step ${index + 1} up">↑</button>
                  <button type="button" class="button button--ghost button--small" data-act="move" data-key="${esc(step.key)}" data-by="1" ${index === total ? "disabled" : ""} aria-label="Move step ${index + 1} down">↓</button>
                </span></li>`)
              .join("")}</ol>
            <button type="button" class="cv-linkish" data-act="add" data-section="${esc(section.id)}">${steps.length ? `Add a step to ${esc(section.name)}` : `Add the first step to ${esc(section.name)}`}</button>
          </section>`;
        })
        .join("")}</div>
      ${B().builderWarnings(m.plan, m.steps, cust).map((w) => `<p class="sp-caption">${esc(w)}</p>`).join("")}
      ${m.steps.length ? `<div class="sp-actions">${btn("Read it through", "view", 'data-view="preview"', "button--ghost")}</div>` : ""}
      ${canSchedule ? "" : `<p class="sp-caption">${keepsSchedule ? "You can change this rite, but only those the coven’s head allows can move it on the calendar." : "Only those the coven’s head allows can put rites on the calendar. Save it as a draft and they can schedule it."}</p>`}
      <div class="sp-actions">
        ${canSchedule || keepsSchedule ? btn("Save it on the coven’s calendar", "save", 'data-as="scheduled"', "button--primary") : ""}
        ${btn("Save as a draft", "save", 'data-as="draft"', canSchedule || keepsSchedule ? "button--ghost" : "button--primary")}
      </div>
      ${statusLine()}`;
  }

  function detailsHtml() {
    const f = m.fields;
    return `${back()}<h2>Details</h2>
      <div class="sp-card">
        <div class="sp-field"><label for="bd-title">${m.kind === "meeting" ? "The meeting" : "The rite"}</label><input id="bd-title" maxlength="120" data-bind="title" value="${esc(f.title)}" placeholder="${m.kind === "meeting" ? "Autumn business meeting" : "Full moon rite"}" /></div>
        <div class="sp-field"><label for="bd-int">Intention (optional)</label><input id="bd-int" maxlength="500" data-bind="intention" value="${esc(f.intention)}" /></div>
        <div class="sp-field"><label for="bd-desc">What members should know or bring (optional)</label><textarea id="bd-desc" maxlength="4000" data-bind="description">${esc(f.description)}</textarea></div>
        <p class="sp-label">Kind of gathering</p>
        <div class="sp-chips">${B().GATHERING_KINDS.map((k) => chip(k.label, "set-kind", attr({ kind: k.value }), m.kind === k.value)).join("")}</div>
      </div>
      <div class="sp-card">
        <p class="sp-label">Occasion</p>
        <div class="sp-chips">${[{ value: "", label: "None" }, ...L.OCCASIONS].map((o) => chip(o.label, "occasion", attr({ value: o.value }), f.occasion === o.value)).join("")}</div>
        <div class="sp-field"><label for="bd-oname">Its name (optional)</label><input id="bd-oname" maxlength="80" data-bind="occasion_name" value="${esc(f.occasion_name)}" placeholder="Samhain, Hunter’s Moon…" /></div>
        ${m.suggestions?.length ? `<div class="sp-chips">${m.suggestions.map((sg, k) => chip(`${sg.label} · ${sg.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`, "suggest", attr({ index: k }), false)).join("")}</div>` : ""}
        <div class="sp-field"><label for="bd-when">When (your time)</label><input id="bd-when" type="datetime-local" data-bind="when" value="${esc(f.when)}" /></div>
      </div>
      <div class="sp-actions">${btn("Keep this as one of the coven’s templates", "keep-template", "", "button--ghost")}</div>
      ${statusLine()}`;
  }

  function rolesHtml() {
    const suggestions = B().ROLE_SUGGESTIONS[m.kind].filter((r) => !m.plan.roles.some((x) => x.name.toLowerCase() === r.toLowerCase())).slice(0, 8);
    return `${back()}<h2>Roles</h2>
      <p class="sp-caption">Name each role once and cast someone in it. Steps are given to roles, so when someone else takes a role, every step goes with it.</p>
      ${m.plan.roles
        .map((r) => {
          const used = m.steps.filter((s) => s.roles.includes(r.id)).length;
          return `<div class="sp-card" data-role="${esc(r.id)}">
            <div class="sp-field"><label for="rl-${esc(r.id)}">Role</label><input id="rl-${esc(r.id)}" maxlength="60" data-role-name="${esc(r.id)}" value="${esc(r.name)}" /></div>
            <div data-picker-cast="${esc(r.id)}"></div>
            <p class="sp-caption">${used === 1 ? "In 1 step." : `In ${used} steps.`}</p>
            <div class="sp-actions">${btn("Remove the role", "remove-role", attr({ id: r.id }))}</div></div>`;
        })
        .join("")}
      <div class="sp-card"><p class="sp-label">Add a role</p>
        ${suggestions.length ? `<div class="sp-chips">${suggestions.map((s) => chip(s, "add-role", attr({ name: s }), false)).join("")}</div>` : ""}
        <div class="sp-field"><label for="rl-new">Or name your own</label><input id="rl-new" maxlength="60" data-new-role placeholder="Keeper of the flame" /></div>
        <div class="sp-actions">${btn("Add the role", "add-role-typed")}</div></div>`;
  }

  function sectionsHtml() {
    return `${back()}<h2>Sections</h2>
      <p class="sp-caption">Name the parts of the gathering as your tradition does, and put them in order. Removing a section moves its steps into the one before.</p>
      ${m.plan.sections
        .map((s, i) => {
          const count = m.steps.filter((x) => x.section === s.id).length;
          return `<div class="sp-card"><div class="sp-field"><label for="sc-${esc(s.id)}">Section ${i + 1}</label><input id="sc-${esc(s.id)}" maxlength="60" data-section-name="${esc(s.id)}" value="${esc(s.name)}" /></div>
            <p class="sp-caption">${count === 1 ? "1 step" : `${count} steps`}</p>
            <div class="sp-actions">${btn("Up", "section-move", `${attr({ id: s.id, by: -1 })} ${i === 0 ? "disabled" : ""}`)}${btn("Down", "section-move", `${attr({ id: s.id, by: 1 })} ${i === m.plan.sections.length - 1 ? "disabled" : ""}`)}
              ${m.plan.sections.length > 1 ? btn("Remove", "section-remove", attr({ id: s.id })) : ""}${count ? btn("Save its steps as a block", "section-block", attr({ id: s.id })) : ""}</div></div>`;
        })
        .join("")}
      <div class="sp-card"><div class="sp-field"><label for="sc-new">A new section</label><input id="sc-new" maxlength="60" data-new-section placeholder="Invocation, Aarti, Prasad, Reports…" /></div>
        <div class="sp-actions">${btn("Add the section", "section-add")}</div></div>${statusLine()}`;
  }

  function prepHtml() {
    return `${back()}<h2>${m.kind === "meeting" ? "Before the meeting" : "Before the rite"}</h2>
      <p class="sp-caption">Things everyone does before. They show on each person’s Before the rite list with a reminder in the app, and each ticks them off. The coven’s head, and those the head chooses, see who has.</p>
      ${m.plan.checklist
        .map((c) => `<div class="sp-card"><div class="sp-field"><label for="pp-${esc(c.id)}">To do</label><input id="pp-${esc(c.id)}" maxlength="200" data-prep-text="${esc(c.id)}" value="${esc(c.text)}" /></div>
          <div class="sp-chips">${B().PREP_REMIND.map((r) => chip(r.label, "prep-remind", attr({ id: c.id, value: r.value }), c.remind === r.value)).join("")}</div>
          <div class="sp-actions">${btn("Remove", "prep-remove", attr({ id: c.id }))}</div></div>`)
        .join("")}
      <div class="sp-card"><div class="sp-field"><label for="pp-new">Something to do before</label><input id="pp-new" maxlength="200" data-new-prep placeholder="Wash your hands before you arrive." /></div>
        <div class="sp-actions">${btn("Add it", "prep-add")}</div></div>`;
  }

  function afterHtml() {
    const a = m.plan.afterwards;
    const hold = a.hold_hours ? String(a.hold_hours) : "";
    const choices = B().HOLD_CHOICES.some((h) => h.value === hold) ? B().HOLD_CHOICES : [...B().HOLD_CHOICES, { value: hold, label: `${hold} hours` }];
    return `${back()}<h2>Afterwards</h2>
      <div class="sp-card"><p class="sp-label">Leave the altar untouched</p>
        <div class="sp-chips">${choices.map((h) => chip(h.label, "hold", attr({ value: h.value }), hold === h.value)).join("")}</div>
        <p class="sp-caption">For that long after the rite no one tends or clears the ritual’s altar, its keepers included. Then its leader is reminded to clear it.</p></div>
      <div class="sp-card"><div class="sp-field"><label for="af-notes">Notes for afterwards</label><textarea id="af-notes" maxlength="2000" data-after="notes" placeholder="Leave the offerings at the crossroads overnight.">${esc(a.notes)}</textarea></div></div>
      <div class="sp-card"><div class="sp-field"><label for="af-follow">A follow-up reminder (optional)</label><input id="af-follow" maxlength="200" data-after="follow_text" value="${esc(a.follow_up?.text || "")}" placeholder="Keep the Noumenia today" /></div>
        <div class="sp-field"><label for="af-hours">Hours after the rite</label><input id="af-hours" type="number" min="1" max="1440" data-after="follow_hours" value="${esc(a.follow_up?.after_hours || 24)}" /></div>
        <p class="sp-caption">Everyone in the coven is reminded, in the app.</p></div>`;
  }

  function previewHtml() {
    const script = S().buildScript({ title: m.fields.title || "This gathering", kind: m.kind, plan: m.plan, steps: ordered().map((s) => B().withFieldColumns(s, m.plan, custom())), ctx: { ranks: ctx.state.ranks, nameOf }, custom: custom(), pages: m.pages, viewer: { membership: ctx.state.membership, userId: ctx.state.context.user?.id } });
    return `${back()}<div class="sp-chips">${chip("The whole script", "preview-mode", attr({ mode: "script" }), m.previewMode === "script")}${chip("Your run-through", "preview-mode", attr({ mode: "run" }), m.previewMode === "run")}</div>
      ${scriptHtml(script, m.previewMode)}`;
  }

  function actionHtml() {
    const d = m.actionDraft;
    const types = F().FIELD_TYPES;
    return `<h2>One of the coven’s own</h2>
      <p class="sp-caption">An action of the coven’s own shows with the steps you choose from, in every ritual.</p>
      <div class="sp-card">
        <div class="sp-field"><label for="ca-name">Its name</label><input id="ca-name" maxlength="80" data-action-draft="name" value="${esc(d.name)}" placeholder="Our quarter call" /></div>
        <p class="sp-label">Where it usually goes</p>
        <div class="sp-chips">${m.plan.sections.map((s) => chip(s.name, "action-section", attr({ id: s.id }), d.section === s.id)).join("")}</div>
        <div class="sp-field"><label for="ca-dir">Directions</label><textarea id="ca-dir" maxlength="4000" data-action-draft="directions">${esc(d.directions)}</textarea></div>
        <div class="sp-field"><label for="ca-words">Words to speak (optional)</label><textarea id="ca-words" maxlength="4000" data-action-draft="words">${esc(d.words)}</textarea></div>
      </div>
      <div class="sp-card"><p class="sp-label">What it asks for</p>
        ${d.fields.length ? d.fields.map((f) => `<div class="cv-inline-form"><span>${esc(f.label)} <span class="sp-caption">· ${esc((types.find((t) => t.value === f.type) || {}).label || f.type)}</span></span><span class="cv-grow"></span>${btn("Remove", "action-field-remove", attr({ key: f.key }))}</div>`).join("") : `<p class="sp-caption">Nothing yet. Add a field for each thing the step needs to know.</p>`}
        <div class="sp-field"><label for="ca-type">Kind of field</label><select id="ca-type" data-action-new="type">${types.map((t) => `<option value="${t.value}">${esc(t.label)}</option>`).join("")}</select></div>
        <div class="sp-field"><label for="ca-label">Its label</label><input id="ca-label" maxlength="80" data-action-new="label" placeholder="Which herb" /></div>
        <div class="sp-field"><label for="ca-opts">The choices, one per line (for choices)</label><textarea id="ca-opts" maxlength="1000" data-action-new="options"></textarea></div>
        <div class="sp-actions">${btn("Add the field", "action-field-add")}</div></div>
      <div class="sp-actions">${btn("Keep it for the coven", "action-save", "", "button--primary")}${btn("Cancel", "view", 'data-view="outline"')}</div>${statusLine()}`;
  }

  // --- one step ------------------------------------------------------------------

  function chooserHtml(step, number) {
    const query = m.choosing?.query || "";
    const found = query.trim() ? A().searchActions(query) : m.group ? A().STEP_ACTIONS.filter((a) => a.group === m.group) : [];
    const fresh = !step.title.trim() && !step.action;
    const own = custom().filter((c) => !query.trim() || c.name.toLowerCase().includes(query.trim().toLowerCase()));
    return `<p class="sp-eyebrow">Step ${number}${sectionName(step) ? ` · ${esc(sectionName(step))}` : ""}</p>
      <h2>What happens here?</h2>
      <p class="sp-caption">Choose what the step is. It fills in a name and words you can change.</p>
      <div class="sp-field"><label for="ch-q">Find one</label><input id="ch-q" type="search" autocomplete="off" data-chooser-query value="${esc(query)}" placeholder="quarters, candle, libation, vote…" /></div>
      <div class="sp-chips" role="group" aria-label="Kinds of step">${A().ACTION_GROUPS.map((g) => chip(g.label, "group", attr({ group: g.id }), m.group === g.id && !query.trim())).join("")}</div>
      <div class="cv-choices" data-chooser-list>${found.map((a) => `<button type="button" class="cv-choice" data-act="pick-action" data-id="${esc(a.id)}">${esc(A().actionLabel(a))}</button>`).join("")}</div>
      ${own.length ? `<p class="sp-label">The coven’s own</p><div class="cv-choices">${own.map((c) => `<button type="button" class="cv-choice" data-act="pick-custom" data-id="${esc(c.id)}">${esc(c.name)}</button>`).join("")}</div>` : ""}
      ${fresh && blocks().length ? `<p class="sp-label">The coven’s saved blocks</p><div class="cv-choices">${blocks().map((b) => `<button type="button" class="cv-choice" data-act="pick-block" data-id="${esc(b.id)}">${esc(b.title)}</button>`).join("")}</div>` : ""}
      <div class="sp-actions">${btn("Something else (write it yourself)", "pick-action", 'data-id=""', "button--ghost")}${fresh ? btn("Never mind", "remove-step") : btn("Keep it as it was", "stop-choosing")}</div>`;
  }

  const sectionName = (step) => (m.plan.sections.find((s) => s.id === step.section) || {}).name || "";

  function stepHtml(key) {
    const list = ordered();
    const index = list.findIndex((s) => s.key === key);
    const step = list[index];
    if (!step) {
      m.view = "outline";
      return outlineHtml();
    }
    if (m.choosing?.key === key) return `${back()}${chooserHtml(step, index + 1)}`;
    const specs = B().specsOf(step, custom());
    const values = F().cleanValues(specs, step.details.fields);
    // Each part (a direction) has its own words, so the step's own aren't asked for.
    const partsSpec = specs.find((x) => x.type === "parts");
    const partsWords = Boolean(partsSpec && F().partsOf(partsSpec, values, specs).length);
    const ask = step.contribution;
    const kinds = C().CONTRIBUTION_KINDS;
    const writes = ask && (kinds.find((k) => k.id === ask.kind) || {}).verb === "write";
    const effects = A().ALTAR_EFFECTS;
    const effect = effects.find((e) => e.value === (step.altar_action || "")) || effects[0];
    // A linked page you can't open (or that's gone) shows only that; its title stays with those who can (as the app's StepFocus).
    const linkedPage = step.details.book_page_id ? m.pages.find((p) => p.id === step.details.book_page_id) : null;
    const linked = step.details.book_page_id ? (linkedPage && !linkedPage.hidden ? linkedPage : { title: (linkedPage && linkedPage.hidden) || m.pages.length ? global.SaltCore.grimoire.access.HIDDEN_PAGE : step.details.book_page_title || "A page of the Book" }) : null;
    const blocked = problems()[step.key];
    const access = [{ value: "assigned", label: "Whoever does the step" }, { value: "everyone", label: "Everyone" }, { value: "leader", label: "Only the leader" }, { value: "chosen", label: "Chosen people" }];
    return `${back()}<p class="sp-eyebrow">Step ${index + 1}${sectionName(step) ? ` · ${esc(sectionName(step))}` : ""}</p>
      <div class="sp-field"><label for="st-title">Step name</label><input id="st-title" maxlength="120" data-step="title" value="${esc(step.title)}" placeholder="Call the quarters" /></div>
      <div class="cv-inline-form"><span class="sp-caption">${esc(B().stepActionName(step, custom()) || "Written by you")}</span><span class="cv-grow"></span>${btn("Change what it is", "choose")}</div>
      <div class="sp-card"><p class="sp-label">Who</p>
        ${m.plan.roles.length ? `<div class="sp-chips" role="group" aria-label="Roles">${m.plan.roles.map((r) => chip(r.name, "toggle-role", attr({ id: r.id }), step.roles.includes(r.id))).join("")}</div>` : ""}
        <div data-picker-people></div>
        ${blocked ? `<p class="cv-status is-error">${esc(blocked)}</p>` : ""}
        <p class="sp-label">How</p>
        <div class="sp-chips" role="group" aria-label="How it is done">${B().TURN_MODES.map((t) => chip(t.label, "turn", attr({ value: t.value }), step.turn_mode === t.value)).join("")}</div>
        <p class="sp-caption">${esc((B().TURN_MODES.find((t) => t.value === step.turn_mode) || {}).detail || "")}</p></div>
      ${specs.some((s) => s.essential) ? `<div class="sp-card">${fieldsHtml(specs, values, "essential", step, index)}</div>` : ""}
      ${partsWords ? "" : `<div class="sp-card"><p class="sp-label">Words</p>
        ${linked ? `<p>From the coven’s Book: <strong>${esc(linked.title)}</strong></p><p class="sp-caption">The words are read from the page as it stands, so changes to the page show here too.</p><div class="sp-actions">${btn("Unlink the page", "unlink")}</div>`
          : `<div class="sp-field"><label for="st-words">Words to speak</label><textarea id="st-words" maxlength="4000" data-step="spoken_text" placeholder="Leave empty if nothing is said">${esc(step.spoken_text)}</textarea></div>
            ${m.pages.length ? `<details class="sp-details"><summary>Link a page of the coven’s Book instead</summary><div class="sp-field"><label for="st-page">Find a page</label><input id="st-page" type="search" data-page-query placeholder="Opening prayer" /></div><div class="cv-choices" data-page-list>${pageChoices("")}</div></details>` : ""}`}
      </div>`}
      <div class="sp-actions">${btn(m.more ? "Fewer options" : "More options", "more", "", "button--ghost")}</div>
      ${m.more ? `<div class="sp-card">
          <div class="sp-field"><label for="st-dir">Directions</label><textarea id="st-dir" maxlength="4000" data-step="instructions">${esc(step.instructions)}</textarea><p class="sp-caption">What the person doing it does. They see this when the step comes.</p></div>
          <div class="sp-field"><label for="st-min">Minutes (optional)</label><input id="st-min" type="number" min="0" max="240" data-step="duration_minutes" value="${esc(step.duration_minutes ?? "")}" /></div>
          ${specs.some((s) => !s.essential) ? fieldsHtml(specs, values, "more", step, index) : ""}
          ${m.plan.roles.length && step.spoken_text.trim() ? `<p class="sp-label">Who speaks the words</p><div class="sp-chips">${m.plan.roles.map((r) => chip(r.name, "toggle-speaker", attr({ id: r.id }), (step.details.speakers || []).includes(r.id))).join("")}</div>` : ""}
        </div>
        <div class="sp-card"><div data-picker-items></div>
          <p class="sp-label">On the altar</p><div class="sp-chips">${effects.map((e) => chip(e.label, "effect", attr({ value: e.value }), (step.altar_action || "") === e.value)).join("")}</div>
          <p class="sp-caption">${esc(effect.detail || "")}</p>
          <p class="sp-label">Who tends the altar during it</p><div class="sp-chips">${access.map((a) => chip(a.label, "access", attr({ value: a.value }), step.altar_access === a.value)).join("")}</div>
          ${step.altar_access === "chosen" ? `<div data-picker-tenders></div>` : ""}</div>
        <div class="sp-card"><p class="sp-label">Ask something of people</p>
          <div class="sp-chips">${[{ id: "", label: "Nothing" }, ...kinds].map((k) => chip(k.label, "ask-kind", attr({ value: k.id }), (ask?.kind || "") === k.id)).join("")}</div>
          ${ask ? `<p class="sp-label">When</p><div class="sp-chips">${C().CONTRIBUTION_TIMINGS.map((t) => chip(t.label, "ask", attr({ field: "timing", value: t.value }), ask.timing === t.value)).join("")}</div>
            ${writes ? `<p class="sp-label">Who can read it</p><div class="sp-chips">${C().CONTRIBUTION_VISIBILITY.map((t) => chip(t.label, "ask", attr({ field: "visibility", value: t.value }), ask.visibility === t.value)).join("")}</div>
              <p class="sp-label">What becomes of it</p><div class="sp-chips">${C().CONTRIBUTION_FATES.filter((f) => f.value !== "petition" || ask.kind === "petition").map((t) => chip(t.label, "ask", attr({ field: "fate", value: t.value }), ask.fate === t.value)).join("")}</div>
              <p class="sp-caption">${esc((C().CONTRIBUTION_FATES.find((f) => f.value === ask.fate) || {}).detail || "")}</p>` : ""}
            <div class="sp-field"><label for="st-prompt">A line for them (optional)</label><input id="st-prompt" maxlength="280" data-ask-prompt value="${esc(ask.prompt || "")}" placeholder="What are you grateful for?" /></div>
            <p class="sp-caption">They will see: ${esc(C().contributionNote({ ...ask, mode: step.turn_mode === "on_behalf" ? "one" : "each" }))}</p>` : ""}
        </div>
        <div class="sp-card"><p class="sp-label">Section</p><div class="sp-chips">${m.plan.sections.map((s) => chip(s.name, "step-section", attr({ id: s.id }), step.section === s.id)).join("")}</div>
          <div class="sp-actions">${btn("Duplicate", "duplicate")}${btn("Save as a block", "step-block")}${step.details.custom_action ? "" : btn("Make it one of the coven’s own", "make-action")}</div>
          <p class="sp-caption">A block can be added to any of the coven’s rituals. One of the coven’s own shows with the steps you choose from.</p></div>` : ""}
      <div class="sp-actions">${btn("Done", "view", 'data-view="outline"', "button--primary")}${btn("Remove this step", "remove-step")}</div>${statusLine()}`;
  }

  function pageChoices(query) {
    const q = String(query || "").trim().toLowerCase();
    return m.pages
      .filter((p) => !p.hidden)
      .filter((p) => !q || `${p.title} ${p.section || ""}`.toLowerCase().includes(q))
      .slice(0, 8)
      .map((p) => `<button type="button" class="cv-choice" data-act="link-page" data-id="${esc(p.id)}">${esc(p.title)}${p.section ? ` <span class="sp-caption">· ${esc(p.section)}</span>` : ""}</button>`)
      .join("");
  }

  /** The one field renderer (the app's FieldRenderer.tsx): every field type, essentials or the rest. */
  function fieldsHtml(specs, values, only, step, index) {
    const shown = specs.filter((s) => (only === "essential" ? s.essential : !s.essential));
    const named = B().namedThings(ordered(), custom(), index);
    return shown
      .map((spec) => {
        const v = values[spec.key];
        const id = `fd-${spec.key}`;
        const label = `<label for="${id}">${esc(spec.label)}</label>`;
        const hint = spec.hint ? `<p class="sp-caption">${esc(spec.hint)}</p>` : "";
        switch (spec.type) {
          case "text":
            return `<div class="sp-field">${label}<input id="${id}" maxlength="200" data-field="${esc(spec.key)}" value="${esc(typeof v === "string" ? v : "")}" placeholder="${esc(spec.placeholder || "")}" />${hint}</div>`;
          case "long":
            return `<div class="sp-field">${label}<textarea id="${id}" maxlength="4000" data-field="${esc(spec.key)}" placeholder="${esc(spec.placeholder || "")}">${esc(typeof v === "string" ? v : "")}</textarea>${hint}</div>`;
          case "number":
            return `<div class="sp-field">${label}<input id="${id}" type="number" data-field="${esc(spec.key)}" data-number value="${esc(typeof v === "number" ? v : "")}" />${hint}</div>`;
          case "list":
            return `<div class="sp-field">${label}<textarea id="${id}" maxlength="2000" data-field="${esc(spec.key)}" data-list>${esc(Array.isArray(v) ? v.join("\n") : "")}</textarea>${hint}</div>`;
          case "choice":
            return `<div class="sp-field"><p class="sp-label">${esc(spec.label)}</p><div class="sp-chips">${(spec.options || []).map((o) => chip(o.label, "field-choice", attr({ key: spec.key, value: o.value }), v === o.value)).join("")}</div>${hint}</div>`;
          case "multi":
            return `<div class="sp-field"><p class="sp-label">${esc(spec.label)}</p><div class="sp-chips">${(spec.options || []).map((o) => chip(o.label, "field-multi", attr({ key: spec.key, value: o.value }), Array.isArray(v) && v.includes(o.value))).join("")}</div>${hint}</div>`;
          case "colour":
            return `<div class="sp-field"><p class="sp-label">${esc(spec.label)}${v ? `: ${esc(v)}` : ""}</p><div class="cv-swatches">${F().COLOUR_OPTIONS.map((o) => `<button type="button" class="cv-swatch${v === o.value ? " is-active" : ""}" data-act="field-colour" ${attr({ key: spec.key, value: o.value })} aria-pressed="${v === o.value}" aria-label="${esc(o.label)}" style="--swatch:${esc(swatch(o.value))}"></button>`).join("")}</div></div>`;
          case "deity":
          case "items":
          case "who":
            return `<div data-field-picker="${esc(spec.key)}"></div>`;
          case "parts": {
            const parts = F().partsOf(spec, values, specs);
            const source = specs.find((s) => s.key === spec.partsFrom);
            if (!parts.length) return `<p class="sp-caption">Choose ${esc((source?.label || "the parts").toLowerCase())} first.</p>`;
            return `<div class="sp-field"><p class="sp-label">${esc(spec.label)}</p>${parts
              .map((p) => `<div class="cv-part"><h4>${esc(F().optionLabel(source, p.part))}</h4><div data-part-picker="${esc(spec.key)}" data-part="${esc(p.part)}"></div>
                <div class="sp-field"><label for="pt-${esc(p.part)}">Words</label><textarea id="pt-${esc(p.part)}" maxlength="2000" data-part-words="${esc(spec.key)}" data-part="${esc(p.part)}" placeholder="${esc(F().defaultPartWords(step.action, p.part) || "What they say")}">${esc(p.words || "")}</textarea></div></div>`)
              .join("")}</div>`;
          }
          case "ref": {
            const things = named.filter((t) => !spec.refKind || spec.refKind === "thing" || t.kind === spec.refKind);
            const options = [...things.map((t) => ({ value: t.name, label: `${t.name} (step ${t.index + 1})` })), ...(spec.refKind === "candle" ? [{ value: "*", label: "Every candle" }] : [])];
            return `<div class="sp-field"><p class="sp-label">${esc(spec.label)}</p>${options.length ? `<div class="sp-chips">${options.map((o) => chip(o.label, "field-choice", attr({ key: spec.key, value: o.value }), v === o.value)).join("")}</div>` : `<p class="sp-caption">No earlier step names one yet. Give a name to the ${spec.refKind === "candle" ? "candle where it is lit" : "thing where it is set down"}, and it will show here.</p>`}</div>`;
          }
        }
        return "";
      })
      .join("");
  }

  const SWATCH = { white: "#f4efe2", black: "#1b1b1b", red: "#b3261e", orange: "#e07b24", yellow: "#e8c547", green: "#2f7d44", blue: "#2f5fa8", indigo: "#3b2f7a", purple: "#6b3fa0", pink: "#e58fb4", magenta: "#b0277a", brown: "#6b4426", grey: "#8a8a8a", silver: "#c9ccd1", gold: "#c9a64a" };
  const swatch = (c) => SWATCH[c] || "#888";

  /** The whole script or the run-through (lib/covens/script.ts), as ritual/script.tsx draws it. Printable. */
  function scriptHtml(script, mode) {
    const run = mode === "run";
    return `<article class="cv-script" data-script>
      <h2>${esc(script.title)}</h2>
      ${script.roles.length ? `<section><h3>Roles</h3><ul class="cv-script__list">${script.roles.map((r) => `<li class="${run && r.mine ? "is-mine" : ""}">${esc(r.name)}: ${esc(r.who)}${run && r.mine ? " · you" : ""}</li>`).join("")}</ul></section>` : ""}
      ${script.checklist.length ? `<section><h3>Before</h3><ul class="cv-script__list">${script.checklist.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></section>` : ""}
      ${script.sections
        .map((section) => `<section><h3>${esc(section.name)}</h3>${section.steps
          .map((s) => {
            const yours = s.mine || s.lines.some((l) => l.mine);
            return `<div class="cv-script__step${run && yours ? " is-mine" : ""}">
              <h4>${s.n}. ${esc(s.title)}</h4>
              <p class="sp-caption">${esc(s.who)}${s.how && s.how !== "Only those named" ? ` · ${esc(s.how.toLowerCase())}` : ""}${s.minutes ? ` · about ${s.minutes} min` : ""}${run && yours ? " · yours" : ""}</p>
              ${(!run || yours) && s.directions ? `<div class="cv-doc">${prose(s.directions)}</div>` : ""}
              ${s.facts.map((f) => `<p class="sp-caption">${esc(f)}</p>`).join("")}
              ${s.asks ? `<p class="sp-caption">${esc(s.asks)}</p>` : ""}
              ${s.lines.map((l) => `<div class="cv-script__line${run && l.mine ? " is-mine" : ""}"><p class="cv-script__who">${l.part ? `${esc(l.part)} · ` : ""}${esc(l.who)}${l.fromBook ? ` · from the Book: ${esc(l.fromBook)}` : ""}</p><blockquote class="cv-doc cv-spoken">${prose(l.words)}</blockquote></div>`).join("")}
            </div>`;
          })
          .join("")}</section>`)
        .join("")}
      ${script.afterwards.length ? `<section><h3>Afterwards</h3>${script.afterwards.map((a) => `<p>${esc(a)}</p>`).join("")}</section>` : ""}
    </article>`;
  }

  // --- pickers -----------------------------------------------------------------

  function mount() {
    const Pk = global.CovenPicker;
    if (!Pk || !P()) return;
    const v = m.view;
    if (v === "roles") {
      pane.querySelectorAll("[data-picker-cast]").forEach((holder) => {
        const roleId = holder.dataset.pickerCast;
        // The plan is replaced on each change, so read the role afresh every time.
        const role = () => m.plan.roles.find((r) => r.id === roleId) || { id: roleId, cast: [] };
        if (!m.plan.roles.some((r) => r.id === roleId)) return;
        Pk.create(holder, {
          id: `cast-${roleId}`,
          label: "Played by",
          placeholder: "A person or a position",
          empty: "No one yet",
          chips: () => P().cleanAssignees(role().cast).map((a) => ({ key: P().assigneeKey(a), label: whoLabel(P().assigneeKey(a)) })),
          search: (q, picked) => P().searchEntries(P().whoEntries(ctx.state.ranks, m.people), q, { limit: 8, picked, suggestions: P().whoSuggestions(P().whoEntries(ctx.state.ranks, m.people)) }),
          onAdd: (entry) => {
            const a = P().assigneeFromKey(entry.key);
            if (a) m.plan = B().castRole(m.plan, roleId, a.kind === "coven" ? [a] : [...role().cast.filter((c) => c.kind !== "coven"), a]);
          },
          onRemove: (key) => (m.plan = B().castRole(m.plan, roleId, role().cast.filter((a) => P().assigneeKey(a) !== key)))
        });
      });
      return;
    }
    if (typeof v !== "object" || m.choosing?.key === v.step) return;
    const step = stepByKey(v.step);
    if (!step) return;
    const nonRole = whoEntries().filter((e) => !e.key.startsWith("role:"));
    const nonRoleSuggest = whoSuggest().filter((k) => !k.startsWith("role:"));
    const people = pane.querySelector("[data-picker-people]");
    if (people) {
      Pk.create(people, {
        id: "st-people",
        label: m.plan.roles.length ? "And people or positions" : "People or positions",
        placeholder: "Maiden, Initiate, Rowan…",
        empty: B().forWholeCoven(step) ? "The whole coven" : "No one else",
        chips: () => P().cleanAssignees(step.assignees).filter((a) => a.kind !== "coven").map((a) => ({ key: P().assigneeKey(a), label: whoLabel(P().assigneeKey(a)) })),
        search: (q, picked) => P().searchEntries(nonRole, q, { limit: 8, picked, suggestions: nonRoleSuggest }),
        onAdd: (entry) => {
          const a = P().assigneeFromKey(entry.key);
          if (!a) return;
          const current = P().cleanAssignees(step.assignees).filter((x) => x.kind !== "coven");
          step.assignees = P().cleanAssignees(a.kind === "coven" ? [a] : [...current, a]);
        },
        onRemove: (key) => (step.assignees = step.assignees.filter((a) => P().assigneeKey(a) !== key))
      });
    }
    const items = pane.querySelector("[data-picker-items]");
    if (items && m.I) {
      Pk.create(items, {
        id: "st-items",
        label: "Items",
        hint: "What the step uses, or sets on the altar.",
        placeholder: "White candle, rosemary, bread…",
        chips: () => step.items.map((it) => ({ key: it.key, label: it.name, image: it.image })),
        search: (q, picked) => m.I.searchItems(m.itemList, q, { limit: 8, picked, suggestions: m.I.itemSuggestions(m.itemList, A().actionOf(step.action)?.suggestItems) }),
        onAdd: (entry) => (step.items = [...step.items, m.I.stepItemOf(entry)].slice(0, 24)),
        onRemove: (key) => (step.items = step.items.filter((it) => it.key !== key))
      });
    }
    const tenders = pane.querySelector("[data-picker-tenders]");
    if (tenders) {
      Pk.create(tenders, {
        id: "st-tenders",
        label: "Tended by",
        placeholder: "Maiden, Rowan…",
        empty: "No one chosen yet.",
        chips: () => P().cleanAssignees(step.altar_tenders).map((a) => ({ key: P().assigneeKey(a), label: whoLabel(P().assigneeKey(a)) })),
        search: (q, picked) => P().searchEntries(nonRole, q, { limit: 8, picked, suggestions: nonRoleSuggest }),
        onAdd: (entry) => {
          const a = P().assigneeFromKey(entry.key);
          if (a) step.altar_tenders = P().cleanAssignees([...step.altar_tenders, a]);
        },
        onRemove: (key) => (step.altar_tenders = step.altar_tenders.filter((a) => P().assigneeKey(a) !== key))
      });
    }
    const specs = B().specsOf(step, custom());
    const setField = (key, value) => {
      const values = { ...(step.details.fields || {}), [key]: value };
      step.details = { ...step.details, fields: F().cleanValues(specs, values) };
    };
    const value = (key) => F().cleanValues(specs, step.details.fields)[key];
    pane.querySelectorAll("[data-field-picker]").forEach((holder) => {
      const spec = specs.find((s) => s.key === holder.dataset.fieldPicker);
      if (!spec) return;
      if (spec.type === "who") {
        Pk.create(holder, {
          id: `fp-${spec.key}`,
          label: spec.label,
          hint: spec.hint,
          max: spec.single ? 1 : undefined,
          placeholder: "A role, position or person",
          chips: () => (value(spec.key) || []).map((k) => ({ key: k, label: whoLabel(k) })),
          search: (q, picked) => P().searchEntries(whoEntries(), q, { limit: 8, picked, suggestions: whoSuggest() }),
          onAdd: (entry) => setField(spec.key, spec.single ? [entry.key] : [...(value(spec.key) || []), entry.key]),
          onRemove: (key) => setField(spec.key, (value(spec.key) || []).filter((k) => k !== key))
        });
      } else if (spec.type === "items" && m.I) {
        Pk.create(holder, {
          id: `fp-${spec.key}`,
          label: spec.label,
          hint: spec.hint,
          placeholder: "Type to find it",
          chips: () => (value(spec.key) || []).map((i) => ({ key: i.key, label: i.name, image: i.image })),
          search: (q, picked) => m.I.searchItems(m.itemList, q, { limit: 8, picked }),
          onAdd: (entry) => setField(spec.key, [...(value(spec.key) || []), { key: entry.key, name: entry.label, image: entry.image || "", category: entry.category }]),
          onRemove: (key) => setField(spec.key, (value(spec.key) || []).filter((i) => i.key !== key))
        });
      } else if (spec.type === "deity" && m.I) {
        Pk.create(holder, {
          id: `fp-${spec.key}`,
          label: spec.label,
          max: 1,
          placeholder: "Hekate, Brigid, Freyja…",
          empty: "None chosen yet. Type to find one, or write the name in the step’s words.",
          chips: () => (value(spec.key) ? [{ key: value(spec.key), label: value(spec.key) }] : []),
          search: (q, picked) => m.I.searchItems(m.itemList, q, { limit: 6, picked, categories: ["deities"] }),
          onAdd: (entry) => setField(spec.key, entry.label.replace(/\s+(statue|figure|idol|icon)\b.*$/i, "").trim()),
          onRemove: () => setField(spec.key, null)
        });
      }
    });
    pane.querySelectorAll("[data-part-picker]").forEach((holder) => {
      const spec = specs.find((s) => s.key === holder.dataset.partPicker);
      const part = holder.dataset.part;
      if (!spec) return;
      const parts = () => F().partsOf(spec, F().cleanValues(specs, step.details.fields), specs);
      const setPart = (patch) => setField(spec.key, parts().map((p) => (p.part === part ? { ...p, ...patch } : p)));
      Pk.create(holder, {
        id: `pp-${part}`,
        label: "Who",
        max: 1,
        empty: "Whoever the step is for",
        placeholder: "A role or person",
        chips: () => {
          const who = parts().find((p) => p.part === part)?.who;
          return who ? [{ key: who, label: whoLabel(who) }] : [];
        },
        search: (q, picked) => P().searchEntries(whoEntries(), q, { limit: 6, picked, suggestions: whoSuggest() }),
        onAdd: (entry) => setPart({ who: entry.key }),
        onRemove: () => setPart({ who: undefined })
      });
    });
  }

  // --- events ------------------------------------------------------------------

  function onInput(event) {
    if (!pane || !m) return;
    const el = event.target;
    const f = el.dataset;
    if (f.bind !== undefined) m.fields[f.bind] = el.value;
    else if (f.roleName) m.plan = B().renameRole(m.plan, f.roleName, el.value);
    else if (f.sectionName) m.plan = B().renameSection(m.plan, f.sectionName, el.value);
    else if (f.prepText) m.plan = { ...m.plan, checklist: m.plan.checklist.map((c) => (c.id === f.prepText ? { ...c, text: el.value } : c)) };
    else if (f.after) {
      const a = m.plan.afterwards;
      if (f.after === "notes") m.plan = { ...m.plan, afterwards: { ...a, notes: el.value } };
      if (f.after === "follow_text") m.plan = { ...m.plan, afterwards: { ...a, follow_up: el.value.trim() ? { text: el.value, after_hours: a.follow_up?.after_hours || 24 } : null } };
      if (f.after === "follow_hours" && a.follow_up) m.plan = { ...m.plan, afterwards: { ...a, follow_up: { ...a.follow_up, after_hours: Math.max(1, Math.min(1440, Math.round(Number(el.value) || 1))) } } };
    } else if (f.actionDraft) m.actionDraft[f.actionDraft] = el.value;
    else if (el.matches("[data-chooser-query]")) {
      m.choosing.query = el.value;
      const list = pane.querySelector("[data-chooser-list]");
      const found = el.value.trim() ? A().searchActions(el.value) : m.group ? A().STEP_ACTIONS.filter((a) => a.group === m.group) : [];
      if (list) list.innerHTML = found.map((a) => `<button type="button" class="cv-choice" data-act="pick-action" data-id="${esc(a.id)}">${esc(A().actionLabel(a))}</button>`).join("");
    } else if (el.matches("[data-page-query]")) {
      const list = pane.querySelector("[data-page-list]");
      if (list) list.innerHTML = pageChoices(el.value);
    } else if (typeof m.view === "object") {
      const step = stepByKey(m.view.step);
      if (!step) return;
      if (f.step) {
        if (f.step === "duration_minutes") step.duration_minutes = el.value === "" ? null : Math.max(0, Math.min(240, Math.round(Number(el.value) || 0)));
        else step[f.step] = el.value;
      } else if (f.field) {
        const specs = B().specsOf(step, custom());
        const raw = f.list !== undefined ? el.value.split("\n") : f.number !== undefined ? (el.value === "" ? null : Number(el.value)) : el.value;
        const fields = { ...(step.details.fields || {}), [f.field]: raw };
        step.details = { ...step.details, fields: f.list !== undefined ? fields : F().cleanValues(specs, fields) };
      } else if (f.partWords) {
        const specs = B().specsOf(step, custom());
        const spec = specs.find((s) => s.key === f.partWords);
        const parts = F().partsOf(spec, F().cleanValues(specs, step.details.fields), specs).map((p) => (p.part === f.part ? { ...p, words: el.value } : p));
        step.details = { ...step.details, fields: { ...(step.details.fields || {}), [spec.key]: parts } };
      } else if (el.matches("[data-ask-prompt]") && step.contribution) step.contribution = { ...step.contribution, prompt: el.value };
    }
  }

  async function onClick(event) {
    if (!pane || !m) return;
    const el = event.target.closest("[data-act]");
    if (!el || !pane.contains(el)) return;
    const d = el.dataset;
    const act = d.act;
    const step = typeof m.view === "object" ? stepByKey(m.view.step) : null;
    const redraw = () => {
      const y = global.scrollY;
      draw();
      global.scrollTo(0, y);
    };
    switch (act) {
      case "view":
        m.view = d.view;
        m.more = false;
        draw();
        global.scrollTo(0, 0);
        return;
      case "kind":
        m.kind = d.kind;
        m.plan = B().blankPlan(d.kind);
        return redraw();
      case "set-kind":
        m.kind = d.kind;
        return redraw();
      case "blank":
        return begin({ kind: m.kind, plan: B().blankPlan(m.kind), steps: [] });
      case "template":
        return begin(T().draftFromTemplate(T().templateOf(d.id)));
      case "saved-template": {
        const t = savedTemplates().find((x) => x.id === d.id);
        const body = t?.body || {};
        const kind = body.kind === "meeting" ? "meeting" : "rite";
        const plan = B().cleanPlan(body.plan, kind);
        return begin({ kind, plan, steps: B().stepsFromLibrary(body.steps, plan), title: t.title, intention: body.intention, description: body.description, occasion: body.occasion || "", occasionName: body.occasion_name || "" });
      }
      case "copy": {
        const r = ctx.state.rituals.find((x) => x.id === d.id);
        const kind = r.kind === "meeting" ? "meeting" : "rite";
        const plan = B().cleanPlan(r.plan, kind);
        return begin({ kind, plan, steps: B().freshSteps(L.orderSteps(ctx.state.ritualSteps, r.id).map((s) => B().builderStepFrom(s, plan))), title: r.title, intention: r.intention || "", description: r.description || "", occasion: r.occasion || "", occasionName: r.occasion_name || "" });
      }
      case "own": {
        const t = m.ownRituals.find((x) => x.id === d.id);
        const copied = await D.templateSteps(d.id).catch(() => []);
        const plan = B().blankPlan(m.kind);
        const work = B().defaultSectionFor("", plan.sections);
        return begin({ kind: m.kind, plan, steps: L.stepsFromTemplate(copied).map((s) => ({ ...B().blankBuilderStep(work), ...s, assignees: [], key: B().shortId("k") })), title: t?.title || "", intention: t?.intention || "" });
      }
      case "open":
        m.view = { step: d.key };
        m.more = false;
        draw();
        global.scrollTo(0, 0);
        return;
      case "add": {
        const s = B().blankBuilderStep(d.section);
        m.steps = B().insertStep(m.plan, m.steps, s, d.section);
        m.view = { step: s.key };
        m.choosing = { key: s.key, query: "" };
        m.group = "";
        draw();
        global.scrollTo(0, 0);
        pane.querySelector("[data-chooser-query]")?.focus();
        return;
      }
      case "move":
        m.steps = B().moveStep(m.plan, m.steps, d.key, Number(d.by));
        redraw();
        pane.querySelector(`[data-act="move"][data-key="${CSS.escape(d.key)}"][data-by="${d.by}"]`)?.focus();
        return;
      case "save":
        return save(d.as, el);
      case "occasion":
        m.fields.occasion = d.value;
        return redraw();
      case "suggest": {
        const sg = m.suggestions[Number(d.index)];
        m.fields.occasion = sg.occasion;
        m.fields.occasion_name = sg.name;
        m.fields.when = L.toLocalInput(L.suggestionTime(sg));
        if (!m.fields.title.trim()) m.fields.title = sg.occasion === "sabbat" ? `${sg.name} rite` : `${sg.label} esbat`;
        return redraw();
      }
      case "tidy":
        m.tidying = !m.tidying;
        return redraw();
      case "library-remove": {
        const l = m.library.find((x) => x.id === d.id);
        if (!l) return;
        const what = l.kind === "template" ? "template" : l.kind === "block" ? "block" : "action";
        if (!global.confirm(`Remove “${l.title}”?\n\nThis takes the ${what} out of the coven’s library. Gatherings already planned from it stay as they are.`)) return;
        if (await keep(el, () => D.removeRitualLibrary(l.id), `“${l.title}” is removed.`)) redraw();
        return;
      }
      case "keep-template":
        if (!m.fields.title.trim()) return setStatus("Give it a name first.", true);
        return keep(el, () => D.saveRitualLibrary(ctx.state.coven.id, null, "template", m.fields.title, { kind: m.kind, intention: m.fields.intention, description: m.fields.description, occasion: m.fields.occasion, occasion_name: m.fields.occasion_name, plan: m.plan, steps: ordered().map(B().libraryStep) }), `“${m.fields.title.trim()}” is kept with the coven’s templates.`);
      case "add-role":
        m.plan = B().addRole(m.plan, d.name).plan;
        return redraw();
      case "add-role-typed": {
        const input = pane.querySelector("[data-new-role]");
        if (!input.value.trim()) return;
        m.plan = B().addRole(m.plan, input.value).plan;
        return redraw();
      }
      case "remove-role": {
        const next = B().removeRole(m.plan, m.steps, d.id);
        m.plan = next.plan;
        m.steps = next.steps;
        return redraw();
      }
      case "section-move":
        m.plan = B().moveSection(m.plan, d.id, Number(d.by));
        return redraw();
      case "section-remove": {
        const next = B().removeSection(m.plan, m.steps, d.id);
        m.plan = next.plan;
        m.steps = next.steps;
        return redraw();
      }
      case "section-add": {
        const input = pane.querySelector("[data-new-section]");
        if (!input.value.trim()) return;
        m.plan = B().addSection(m.plan, input.value);
        return redraw();
      }
      case "section-block": {
        const name = (m.plan.sections.find((s) => s.id === d.id) || {}).name || "Steps";
        return keep(el, () => D.saveRitualLibrary(ctx.state.coven.id, null, "block", name, { steps: ordered().filter((s) => s.section === d.id).map(B().libraryStep) }), `“${name}” is kept with the coven’s blocks.`);
      }
      case "prep-remind":
        m.plan = { ...m.plan, checklist: m.plan.checklist.map((c) => (c.id === d.id ? { ...c, remind: d.value } : c)) };
        return redraw();
      case "prep-remove":
        m.plan = { ...m.plan, checklist: m.plan.checklist.filter((c) => c.id !== d.id) };
        return redraw();
      case "prep-add": {
        const input = pane.querySelector("[data-new-prep]");
        m.plan = B().addPrep(m.plan, input.value);
        return redraw();
      }
      case "hold":
        m.plan = { ...m.plan, afterwards: { ...m.plan.afterwards, hold_hours: d.value ? Number(d.value) : null } };
        return redraw();
      case "preview-mode":
        m.previewMode = d.mode;
        return redraw();
      case "action-section":
        m.actionDraft.section = d.id;
        return redraw();
      case "action-field-remove":
        m.actionDraft.fields = m.actionDraft.fields.filter((f) => f.key !== d.key);
        return redraw();
      case "action-field-add": {
        const type = pane.querySelector('[data-action-new="type"]').value;
        const label = pane.querySelector('[data-action-new="label"]').value.trim();
        const options = F().optionsFromLines(pane.querySelector('[data-action-new="options"]').value);
        if (!label) return setStatus("Give the field a label.", true);
        if ((type === "choice" || type === "multi") && !options.length) return setStatus("Write the choices, one per line.", true);
        m.actionDraft.fields = [...m.actionDraft.fields, { key: `${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 24)}_${m.actionDraft.fields.length + 1}`, type, label, essential: true, ...(type === "choice" || type === "multi" ? { options } : {}) }];
        return redraw();
      }
      case "action-save":
        if (!m.actionDraft.name.trim()) return setStatus("Give it a name to keep it.", true);
        if (await keep(el, () => D.saveRitualLibrary(ctx.state.coven.id, null, "action", m.actionDraft.name, m.actionDraft), `“${m.actionDraft.name.trim()}” is now one of the coven’s own.`)) {
          m.view = "outline";
          redraw();
        }
        return;
    }
    if (!step) return;
    switch (act) {
      case "choose":
        m.choosing = { key: step.key, query: "" };
        m.group = A().actionOf(step.action)?.group || "";
        return redraw();
      case "stop-choosing":
        m.choosing = null;
        return redraw();
      case "group":
        m.group = m.group === d.group ? "" : d.group;
        m.choosing.query = "";
        return redraw();
      case "pick-action": {
        const action = A().actionOf(d.id);
        m.choosing = null;
        if (action) Object.assign(step, A().applyAction(action), { details: { ...step.details, custom_action: undefined, fields: {} } });
        else Object.assign(step, { action: "", details: { ...step.details, custom_action: undefined } });
        redraw();
        pane.querySelector("#st-title")?.focus();
        return;
      }
      case "pick-custom": {
        const own = custom().find((c) => c.id === d.id);
        m.choosing = null;
        if (own) Object.assign(step, B().applyCustomAction(own), { details: { ...step.details, custom_action: own.id, fields: {} } });
        return redraw();
      }
      case "pick-block": {
        const block = blocks().find((b) => b.id === d.id);
        const added = B().stepsFromLibrary(block?.body?.steps, m.plan, step.section);
        let next = m.steps;
        let after = step.key;
        for (const s of added) {
          next = B().insertStep(m.plan, next, s, step.section, after);
          after = s.key;
        }
        m.steps = next.filter((s) => s.key !== step.key);
        m.choosing = null;
        m.view = "outline";
        return redraw();
      }
      case "remove-step":
        m.steps = m.steps.filter((s) => s.key !== step.key);
        m.choosing = null;
        m.view = "outline";
        return redraw();
      case "toggle-role":
        step.roles = step.roles.includes(d.id) ? step.roles.filter((r) => r !== d.id) : [...step.roles, d.id];
        return redraw();
      case "toggle-speaker": {
        const list = step.details.speakers || [];
        step.details = { ...step.details, speakers: list.includes(d.id) ? list.filter((r) => r !== d.id) : [...list, d.id] };
        return redraw();
      }
      case "turn":
        step.turn_mode = d.value;
        return redraw();
      case "more":
        m.more = !m.more;
        return redraw();
      case "unlink":
        step.details = { ...step.details, book_page_id: undefined, book_page_title: undefined };
        return redraw();
      case "link-page": {
        const page = m.pages.find((p) => p.id === d.id);
        step.details = { ...step.details, book_page_id: d.id, book_page_title: page?.title };
        return redraw();
      }
      case "field-choice":
      case "field-colour": {
        const specs = B().specsOf(step, custom());
        const values = F().cleanValues(specs, step.details.fields);
        step.details = { ...step.details, fields: F().cleanValues(specs, { ...values, [d.key]: values[d.key] === d.value ? null : d.value }) };
        if (d.key === "colour") step.altar_color = values[d.key] === d.value ? "white" : d.value;
        return redraw();
      }
      case "field-multi": {
        const specs = B().specsOf(step, custom());
        const values = F().cleanValues(specs, step.details.fields);
        const list = Array.isArray(values[d.key]) ? values[d.key] : [];
        step.details = { ...step.details, fields: F().cleanValues(specs, { ...values, [d.key]: list.includes(d.value) ? list.filter((x) => x !== d.value) : [...list, d.value] }) };
        return redraw();
      }
      case "effect":
        step.altar_action = d.value;
        return redraw();
      case "access":
        step.altar_access = d.value;
        return redraw();
      case "ask-kind":
        step.contribution = d.value ? C().defaultContribution(d.value, step.contribution ? { timing: step.contribution.timing } : {}) : null;
        return redraw();
      case "ask":
        step.contribution = C().cleanContribution({ ...step.contribution, [d.field]: d.value });
        return redraw();
      case "step-section":
        step.section = d.id;
        m.steps = B().orderBySections(m.steps, m.plan.sections);
        return redraw();
      case "duplicate": {
        const copy = { ...step, id: null, key: B().shortId("k"), details: { ...step.details } };
        m.steps = B().insertStep(m.plan, m.steps, copy, step.section, step.key);
        m.view = { step: copy.key };
        return redraw();
      }
      case "step-block":
        return keep(el, () => D.saveRitualLibrary(ctx.state.coven.id, null, "block", step.title.trim() || "A step", { steps: [B().libraryStep(step)] }), `“${step.title.trim() || "A step"}” is kept with the coven’s blocks.`);
      case "make-action":
        m.actionDraft = { name: step.title, section: step.section, directions: step.instructions, words: step.spoken_text, minutes: step.duration_minutes, fields: B().specsOf(step, custom()) };
        m.view = "action";
        draw();
        global.scrollTo(0, 0);
        return;
    }
  }

  function begin(next) {
    m.kind = next.kind;
    m.plan = next.plan;
    m.steps = B().orderBySections(next.steps, next.plan.sections);
    if (next.title !== undefined) m.fields.title = next.title;
    if (next.intention) m.fields.intention = next.intention;
    if (next.description) m.fields.description = next.description;
    if (next.occasion !== undefined) m.fields.occasion = next.occasion;
    if (next.occasionName !== undefined) m.fields.occasion_name = next.occasionName;
    m.view = "outline";
    draw();
    global.scrollTo(0, 0);
  }

  async function keep(el, work, done) {
    const saved = await UI.busy(el, pane.querySelector("[data-status]"), work, { done });
    if (!saved) return false;
    m.library = await D.ritualLibrary(ctx.state.coven.id).catch(() => m.library);
    return true;
  }

  async function save(as, el) {
    const problem = B().builderProblem(m.fields.title, m.plan, m.steps, m.people, nameOf, custom());
    if (problem) return setStatus(problem, true);
    const fields = B().ritualPayload(
      { title: m.fields.title, intention: m.fields.intention, description: m.fields.description, scheduled_for: L.fromLocalInput(m.fields.when), status: as, occasion: m.fields.occasion, occasion_name: m.fields.occasion_name },
      m.kind,
      m.plan
    );
    const saved = await UI.busy(el, pane.querySelector("[data-status]"), () => D.saveRitual(ctx.state.coven.id, m.ritual?.id, fields, B().builderPayload(m.plan, m.steps, custom())));
    if (saved) ctx.onSaved(saved);
  }

  function attach(el) {
    el.addEventListener("input", onInput);
    el.addEventListener("click", onClick);
  }

  // coven.js asks first on the browser's Back; true means the builder took it.
  function onPop() {
    if (swallowPop) {
      swallowPop = false;
      return true;
    }
    if (!innerPushed || !m || !pane?.querySelector(".cv-builder")) return false;
    innerPushed = false;
    m.view = "outline";
    draw();
    return true;
  }

  function close() {
    if (innerPushed) global.history.replaceState(null, "", global.location.href);
    innerPushed = false;
    pane = null;
    m = null;
  }

  global.CovenBuilder = { onPop, open: (el, options) => { if (el.dataset.builder !== "on") { attach(el); el.dataset.builder = "on"; } return open(el, options); }, close, scriptHtml: (script, mode) => scriptHtml(script, mode) };
})(window);
