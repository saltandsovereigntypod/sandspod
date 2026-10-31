/*
 * One Living Library entry (the app's LibraryEntryView): its introduction,
 * quick correspondences, the layers your Living Library settings show (My
 * Practice, Traditional, Community), "In the Traditions", the sourcing note,
 * a deity's card and dedication journey, Connected To, and Your Journey.
 * Open to everyone; signed in, your My Practice layer shows and the page
 * links to the same entry in your Book of Shadows to add or edit it.
 * Logic: library/library-logic.js.
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const core = global.SaltCore?.library;
  const L = global.LibraryLogic;
  const { esc, header, unavailable } = global.GuidesUI;
  const data = typeof TraditionalLibrary !== "undefined" ? TraditionalLibrary : null;
  // js/library.js declares these with const, so they are globals but not window properties.
  const Sourcing = typeof LibrarySourcing !== "undefined" ? LibrarySourcing : null;
  const Graph = typeof Library !== "undefined" ? Library : null;
  if (!core || !L || !data) return unavailable(root, "This Living Library entry");

  const BACK = { back: "/library/", backLabel: "Back to the Library" };
  let drawn = 0;

  /** A field's text as the app's RichText reads it: paragraphs, lists and quotes, with bold and italics. */
  function richHtml(text) {
    const blocks = core.richTextBlocks(String(text || ""));
    const runs = (block) =>
      block.runs
        .map((run) => {
          let html = esc(run.text);
          if (run.bold) html = `<strong>${html}</strong>`;
          if (run.italic) html = `<em>${html}</em>`;
          if (run.underline) html = `<u>${html}</u>`;
          return html;
        })
        .join("");
    let out = "";
    let list = null;
    for (const block of blocks) {
      const kind = block.kind === "bullet" ? "ul" : block.kind === "number" ? "ol" : null;
      if (list && list !== kind) {
        out += `</${list}>`;
        list = null;
      }
      if (kind) {
        if (!list) out += `<${kind}>`;
        list = kind;
        out += `<li>${runs(block)}</li>`;
      } else if (block.kind === "quote") out += `<blockquote>${runs(block)}</blockquote>`;
      else out += `<p>${runs(block)}</p>`;
    }
    if (list) out += `</${list}>`;
    return `<div class="lb-rich">${out}</div>`;
  }

  function chipsHtml(chips) {
    return `<div class="sp-chips">${chips
      .map((chip) =>
        chip.href
          ? `<a class="sp-chip" href="${esc(chip.href)}" aria-label="${esc(`${chip.label}, open its Library page`)}">${esc(chip.label)}</a>`
          : `<span class="lb-tag">${esc(chip.label)}</span>`
      )
      .join("")}</div>`;
  }

  const section = (label, inner, { gold = false, plain = false } = {}) =>
    `<section class="sp-section"><h2 class="sp-label">${esc(label)}</h2>${plain ? inner : `<div class="sp-card${gold ? " sp-card--gold" : ""}">${inner}</div>`}</section>`;

  const factsHtml = (facts) =>
    facts.length
      ? `<dl class="lb-facts">${facts.map((fact) => `<div class="lb-fact"><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`).join("")}</dl>`
      : "";

  function pageHtml(model, user) {
    const record = model.record
      ? `${factsHtml(model.record.facts)}${model.record.sections
          .map((s) => section(s.title, s.chips ? chipsHtml(s.chips) : richHtml(s.text), { gold: true }))
          .join("")}`
      : "";
    const layers = model.layers
      .map(({ layer, label, fields }) =>
        section(
          label,
          fields
            .map((field) => `<div class="lb-field"><h3 class="lb-field__label">${esc(field.label)}</h3>${field.chips ? chipsHtml(field.chips) : richHtml(field.text)}</div>`)
            .join(""),
          { gold: layer === "myPractice" }
        )
      )
      .join("");
    const edit = model.grimoireHref
      ? `<div class="sp-actions"><a class="button ${model.hasMyPractice ? "button--ghost" : "button--primary"}" href="${esc(model.grimoireHref)}">Open in your Book of Shadows</a></div>
        <p class="sp-caption">${model.hasMyPractice ? "Edit your My Practice notes for this entry there." : "Add your own My Practice notes for this entry there."}</p>`
      : "";
    const connections = model.connections.length
      ? section(
          "Connected To",
          model.connections.map((group) => `<div class="lb-field"><h3 class="lb-field__label">${esc(group.label)}</h3>${chipsHtml(group.entries)}</div>`).join("")
        )
      : "";
    return `${header({ title: model.name, eyebrow: model.category, ...BACK })}
      ${model.image ? `<figure class="lb-image"><img src="${esc(model.image)}" alt="" /></figure>` : ""}
      <p class="lb-intro">${esc(model.intro)}</p>
      ${factsHtml(model.facts)}
      <div data-sourcing></div>
      ${model.type === "deity" ? `<section class="lb-deity" aria-label="${esc(`${model.name} in your practice`)}" data-deity-yours="${esc(model.deityKey || "")}" data-deity-name="${esc(model.name)}"></section>` : ""}
      ${model.spellHref ? `<div class="sp-actions"><a class="button button--ghost" href="${esc(model.spellHref)}" title="${esc(`Opens the spell builder with ${model.name} already chosen`)}">Use in a spell</a></div>` : ""}
      ${edit}
      ${record}
      ${model.empty ? `<div class="sp-card"><p>Nothing to show here with your current Living Library settings.</p></div>` : ""}
      ${layers}
      ${connections}
      <div data-journey></div>
      <div data-hearth-herb></div>
      ${model.tags.length ? section("Tags", chipsHtml(model.tags.map((label) => ({ label, href: null }))), { plain: true }) : ""}
      ${user ? "" : `<p class="sp-caption">Sign in to keep your own My Practice notes for this entry in your Book of Shadows.</p>`}
      ${global.ResearchNote ? global.ResearchNote.footerHtml(model.name, model.category || "Living Library") : ""}`;
  }

  /** "Sourcing with care", from the app's notes (js/library.js loads js/core/guides.js for it). */
  async function addSourcing(model, token) {
    const S = Sourcing;
    if (!S || !model.sourcingQuery) return;
    const G = await S.guides();
    const note = S.noteFor({ metadata: { traditionalReference: model.sourcingQuery.traditionalReference }, name: model.sourcingQuery.name }, G?.closed);
    const slot = root.querySelector("[data-sourcing]");
    if (note && slot && token === drawn) slot.innerHTML = S.noteHtml(note);
  }

  /** "Your Journey with …": the history your practice holds with this entry (js/living-connections.js). */
  async function addJourney(entry, token) {
    if (!global.LivingConnections || !global.LivingConnectionsView || !Graph) return;
    const id = entry.traditionalRef || entry.practiceSourceId || entry.practiceEntityIds?.[0];
    if (!id || !Graph.resolveCanonicalEntityId?.(id)) return;
    try {
      const view = global.LivingConnectionsView.createJourneyModel(await global.LivingConnections.load(id));
      const slot = root.querySelector("[data-journey]");
      if (!view.hasHistory || !slot || token !== drawn) return;
      const event = (e) => `<li><time datetime="${esc(e.timestamp)}">${esc(e.date)}</time>${e.href ? `<a href="${esc(e.href)}">${esc(e.label)}</a>` : `<strong>${esc(e.label)}</strong>`}${e.context ? `<p class="sp-caption">${esc(e.context)}</p>` : ""}</li>`;
      const pairs = view.pairings.map((p) => {
        const other = Graph.getEntity(p.entityId);
        const ref = other?.metadata?.traditionalReference || p.entityId;
        return { label: p.label, href: L.entryHref(ref) };
      });
      slot.innerHTML = `<section class="sp-section lb-journey"><h2 class="sp-label">${esc(`Your Journey with ${entry.name}`)}</h2><div class="sp-card">
        ${view.summary.length ? `<dl class="lb-facts">${view.summary.map((r) => `<div class="lb-fact"><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join("")}</dl>` : ""}
        ${pairs.length ? `<div class="lb-field"><h3 class="lb-field__label">Frequently Paired With</h3>${chipsHtml(pairs)}</div>` : ""}
        ${view.recentEvents.length ? `<div class="lb-field"><h3 class="lb-field__label">Recent Activity</h3><ol>${view.recentEvents.map(event).join("")}</ol></div>` : ""}
      </div></section>`;
    } catch (error) {
      console.warn("Your Journey couldn't be gathered for this entry.", error);
    }
  }

  async function start(user) {
    const token = ++drawn;
    const wanted = new URLSearchParams(global.location.search).get("entity") || "";
    const state = await L.load({
      core,
      user,
      db: global.db || null,
      traditionalData: data,
      storage: (() => {
        try {
          return global.localStorage;
        } catch {
          return null;
        }
      })(),
      getSettings: () => (typeof global.getMySettings === "function" ? global.getMySettings() : {})
    });
    if (token !== drawn) return;
    const entry = L.findEntry(core, state.entries, wanted);
    if (!entry) {
      global.document.title = "Living Library | Salt & Sovereignty";
      root.innerHTML = `${header({ title: "Living Library", ...BACK })}<p>This entry couldn’t be found.</p>
        <div class="sp-actions"><a class="button button--ghost" href="/library/">Search the Library</a></div>`;
      return;
    }
    const view = L.entryModel(core, entry, state.entries, state.relations, state.settings, { signedIn: !!user });
    global.document.title = `${view.name} | Living Library | Salt & Sovereignty`;
    root.innerHTML = pageHtml(view, user);
    global.SaltDeityYours?.hydrate(root.querySelector("[data-deity-yours]"));
    addSourcing(view, token);
    addJourney(entry, token);
    // Hearth & land for a herb or tree: foraging, the garden, your land journal and recipes (js/hearth-links.js).
    const herbRef = String(entry.traditionalRef || "").split("/");
    if (herbRef[1] === "herb" && herbRef[2] && !herbRef[2].includes(".")) global.SaltHearthLinks?.mountHerb(root.querySelector("[data-hearth-herb]"), herbRef[2]);
  }

  const ready = global.SaltPage?.ready ? global.SaltPage.ready() : Promise.resolve(null);
  ready.then(start).catch(() => start(null));
  global.SaltPage?.onUserChange?.((user) => start(user));
})(window);
