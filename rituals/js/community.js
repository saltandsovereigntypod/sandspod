/*
 * Community Rituals (app: rituals/community/*), at /rituals/community/:
 * the shared rituals with search and filters; one ritual (?id=) with Add to
 * my rituals, Do it once, Plan a night for it and Add to a coven's rituals;
 * Share a ritual (?share=1, with &template=, &coven=&item=, &edit= or
 * &update=); My shared rituals (?mine=1); and the moderators' review
 * (?review=1). The logic is the app's (js/core/community-rituals.js); the
 * tables and functions are supabase/migrations/20261116000000_community_rituals.sql.
 */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const L = global.RitualsLogic;
  const { esc } = UI;
  const C = global.SaltCore["community-rituals"];
  const BASE = "/rituals/community/";
  const HIDDEN_KEY = "community.hidden";
  const params = new URLSearchParams(global.location.search);

  const db = () => global.db;
  const user = () => S.user();

  // ---------------------------------------------------------------- data

  /** The section's tables or functions aren't in the database yet (communityApi.ts notReady). */
  function notReady(error) {
    if (!error) return false;
    return /PGRST20[25]|PGRST202|42P01|42883/.test(error.code || "") || /does not exist|Could not find the (table|function)|schema cache/i.test(error.message || "");
  }
  const NOT_READY = "Community Rituals isn’t open yet. Please try again soon.";
  function check(result) {
    if (result.error) throw new Error(notReady(result.error) ? NOT_READY : result.error.message || "Please try again.");
    return result.data;
  }

  async function published() {
    if (!db()) return { ready: false, rituals: [] };
    const result = await db().from("community_rituals_published").select("*").order("published_at", { ascending: false }).limit(500);
    if (result.error) {
      if (notReady(result.error)) return { ready: false, rituals: [] };
      throw new Error(result.error.message);
    }
    return { ready: true, rituals: result.data || [] };
  }

  async function myShares(userId) {
    const [mine, covens] = await Promise.all([
      db().from("community_rituals").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
      db().from("community_rituals").select("*").neq("user_id", userId).not("coven_id", "is", null).order("created_at", { ascending: false }).limit(200)
    ]);
    if (mine.error) {
      if (notReady(mine.error)) return { ready: false, mine: [], covens: [] };
      throw new Error(mine.error.message);
    }
    return { ready: true, mine: mine.data || [], covens: covens.error ? [] : covens.data || [] };
  }

  async function isModerator() {
    if (!db() || !user()) return false;
    const { data, error } = await db().rpc("is_community_moderator");
    return !error && data === true;
  }

  /** Your covens where you may share and add rituals: asked of the database itself. */
  async function covensILead() {
    const account = user();
    if (!account || !db()) return [];
    const rows = await db()
      .from("coven_members")
      .select("coven_id, covens!coven_members_coven_id_fkey(id,name,slug,status)")
      .eq("user_id", account.id)
      .eq("status", "active");
    if (rows.error) return [];
    const covens = (rows.data || []).map((r) => r.covens).filter((c) => c && c.status === "active");
    const allowed = await Promise.all(
      covens.map(async (c) => {
        const { data, error } = await db().rpc("community_ritual_coven_can_share", { p_coven: c.id });
        return !error && data === true;
      })
    );
    return covens.filter((_, i) => allowed[i]).map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  }

  async function covenTemplates(covenId) {
    const result = await db().from("coven_ritual_library").select("id,coven_id,kind,title,body,updated_at").eq("coven_id", covenId).eq("kind", "template").order("title").limit(300);
    return result.error ? [] : result.data || [];
  }

  const noteSaved = (id, to) => db().rpc("note_community_ritual_saved", { p_id: id, p_to: to }).then(() => undefined, () => undefined);

  // ---------------------------------------------------------------- hidden on this browser (the app keeps the same shape on the phone)

  function hidden() {
    try {
      const saved = JSON.parse(global.localStorage.getItem(HIDDEN_KEY) || "{}");
      return { posts: Array.isArray(saved.posts) ? saved.posts : [], authors: Array.isArray(saved.authors) ? saved.authors : [] };
    } catch {
      return { posts: [], authors: [] };
    }
  }
  function setHidden(next) {
    try {
      global.localStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
    } catch {
      /* Private browsing: hidden for this visit only. */
    }
  }

  // ---------------------------------------------------------------- pieces

  const chip = (label, pressed, attrs) => UI.chip(label, { pressed, attrs });
  const chipGroup = (legend, name, options, current) => `
    <fieldset class="rt-chipset">
      <legend class="sp-eyebrow">${esc(legend)}</legend>
      <div class="sp-chips">${options.map((o) => chip(o.label, current === o.value, `data-filter="${name}" data-value="${esc(o.value)}"`)).join("")}</div>
    </fieldset>`;

  /** Everything a ritual holds (components/rituals/CommunityRitualView.tsx). */
  function ritualHtml(row) {
    const steps = C.stepsOf(row);
    const mentions = C.closedMentions(C.contentFromShared(row));
    const deities = row.deities || [];
    const materials = row.materials || [];
    return `
      <p class="sp-muted">${esc(C.ritualFacts(row))}</p>
      ${row.summary ? `<p>${esc(row.summary)}</p>` : ""}
      ${deities.length ? `<p class="sp-muted">Honours: ${esc(deities.join(", "))}</p>` : ""}
      ${row.safety_notes ? `<section class="sp-card sp-card--gold" aria-label="Take care"><h2 class="sp-label">Take care</h2><p>${esc(row.safety_notes)}</p></section>` : ""}
      ${row.cultural_note || mentions.length ? `<section class="sp-card" aria-label="Its roots"><h2 class="sp-label">Its roots</h2>
        ${row.cultural_note ? `<p>${esc(row.cultural_note)}</p>` : ""}
        ${mentions.map((m) => `<p class="sp-muted">${esc(C.mentionLine(m))}</p>`).join("")}
        ${mentions.length ? `<p>${esc(C.GOOD_GUEST)}</p><p><a class="rt-text-link" href="/library/closed/">Read ${esc(C.CLOSED_GUIDE_TITLE)}</a></p>` : ""}</section>` : ""}
      <section class="sp-card" aria-label="You’ll need"><h2 class="sp-label">You’ll need</h2>
        ${materials.length ? `<ul class="rt-needs">${materials.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : "<p>Nothing but yourself.</p>"}
        ${row.preparation ? `<p>${esc(row.preparation)}</p>` : ""}</section>
      <section class="sp-section" aria-label="Steps"><h2 class="sp-label">Steps</h2>
        <ol class="rt-steps">${steps
          .map(
            (s) => `<li class="rt-step"><h3>${esc(s.title)}</h3>${s.instructions ? `<p>${esc(s.instructions)}</p>` : ""}${s.spoken_text ? `<p class="rt-spoken">${esc(s.spoken_text)}</p>` : ""}${s.minutes ? `<p class="sp-caption">${esc(`${s.minutes} min`)}</p>` : ""}</li>`
          )
          .join("")}</ol></section>
      ${row.closing ? `<section class="sp-card" aria-label="Closing"><h2 class="sp-label">Closing</h2><p>${esc(row.closing)}</p></section>` : ""}
      ${row.notes ? `<section class="sp-card" aria-label="Notes from the sharer"><h2 class="sp-label">Notes from the sharer</h2><p>${esc(row.notes)}</p></section>` : ""}
      ${(row.tags || []).length ? `<p class="sp-muted">${esc(row.tags.join(" · "))}</p>` : ""}`;
  }

  const dateOf = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "";
  };

  // ---------------------------------------------------------------- browse

  const filter = { query: "", kind: null, moon: null, tradition: null, deity: null, occasion: null, material: null, sharer: params.get("sharer") || null, sort: "newest" };
  let snapshot = null;
  let moreFilters = false;

  function results() {
    const shown = C.filterCommunity(visible(), filter);
    const filtering = !!(filter.query.trim() || filter.kind || filter.moon || filter.tradition || filter.deity || filter.occasion || filter.material || filter.sharer);
    const label = filter.sharer ? `From ${params.get("name") || "this sharer"}` : filtering ? `${shown.length} ${shown.length === 1 ? "ritual" : "rituals"}` : `${visible().length} shared ${visible().length === 1 ? "ritual" : "rituals"}`;
    return `<h2 class="sp-label" id="cr-results">${esc(label)}</h2>${
      shown.length
        ? `<div class="sp-list">${shown
            .map((r) => UI.row({ href: `${BASE}?id=${encodeURIComponent(r.id)}`, title: r.title, detail: [C.sharerName(r), C.ritualFacts(r), C.savesLabel(r.save_count)].filter(Boolean).join(" · ") }))
            .join("")}</div>`
        : `<section class="sp-card"><p>${visible().length ? "Nothing matches all of those. Try fewer filters." : "Nothing has been shared yet. Yours could be the first."}</p></section>`
    }${filtering ? `<p><button type="button" class="button button--ghost" data-clear>Clear the search and filters</button></p>` : ""}`;
  }

  const visible = () => (snapshot?.rituals || []).filter((r) => !C.isRitualHidden(r, hidden()));

  function filtersHtml() {
    const facets = C.communityFacets(visible());
    const facetGroup = (legend, name, values) => (values.length ? chipGroup(legend, name, values.map((v) => ({ value: v, label: v })), filter[name]) : "");
    return `
      <div class="sp-field"><label for="cr-search">Search</label>
        <input id="cr-search" type="search" placeholder="Sharer, title, deity, herb, Samhain…" autocomplete="off" value="${esc(filter.query)}" /></div>
      ${chipGroup("Kind", "kind", C.COMMUNITY_KINDS, filter.kind)}
      ${chipGroup("Moon", "moon", C.COMMUNITY_MOONS, filter.moon)}
      ${
        moreFilters
          ? `${facetGroup("Tradition or path", "tradition", facets.traditions)}${facetGroup("Deity", "deity", facets.deities)}${facetGroup("Occasion or holiday", "occasion", facets.occasions)}${facetGroup("What it needs", "material", facets.materials)}`
          : `<p><button type="button" class="button button--ghost" data-more-filters>More filters</button></p>`
      }
      ${chipGroup("Sort", "sort", C.COMMUNITY_SORTS, filter.sort)}`;
  }

  async function renderBrowse() {
    const main = UI.root();
    main.innerHTML = `${UI.header({ eyebrow: "Shared by the community", title: "Community Rituals", lead: "Rituals, spells and rites the Salt & Sovereignty community has shared, each reviewed before it appears. Add one to your rituals, or do it once." })}<p class="sp-muted">Opening…</p>`;
    const account = user();
    const [snap, shares, moderator] = await Promise.all([
      published(),
      account ? myShares(account.id).catch(() => null) : null,
      isModerator()
    ]);
    snapshot = snap;
    const h = hidden();
    main.innerHTML = `
      ${UI.header({ eyebrow: "Shared by the community", title: "Community Rituals", lead: "Rituals, spells and rites the Salt & Sovereignty community has shared, each reviewed before it appears. Add one to your rituals, or do it once." })}
      ${snap.ready ? "" : `<section class="sp-card"><p>Community Rituals is on its way. Shared rituals will appear here once it opens.</p></section>`}
      ${
        account
          ? `<div class="sp-list">
              ${UI.row({ href: `${BASE}?share=1`, title: "Share a ritual", detail: "One of your templates, or a coven’s you lead" })}
              ${UI.row({ href: `${BASE}?mine=1`, title: "My shared rituals", detail: shares?.ready ? C.mySharesLine(shares.mine) : "What you’ve shared and where each stands" })}
              ${moderator ? UI.row({ href: `${BASE}?review=1`, title: "Review shared rituals", detail: "Publish, return or decline" }) : ""}
            </div>`
          : `<p class="sp-muted">Sign in to share your own rituals, and to add these to yours. <a class="rt-text-link" href="${UI.SIGN_IN_HREF}">Sign in</a></p>`
      }
      ${snap.ready ? `<section class="sp-card" aria-label="Find a ritual" data-filters>${filtersHtml()}</section>
        <section class="sp-section" data-results aria-labelledby="cr-results" aria-live="polite">${results()}</section>` : ""}
      ${h.posts.length + h.authors.length ? `<p><button type="button" class="button button--ghost" data-show-hidden>Show rituals and people you’ve hidden</button></p>` : ""}`;

    const redraw = (filtersToo) => {
      if (filtersToo) main.querySelector("[data-filters]").innerHTML = filtersHtml();
      main.querySelector("[data-results]").innerHTML = results();
    };
    main.addEventListener("input", (event) => {
      if (event.target.id !== "cr-search") return;
      filter.query = event.target.value;
      redraw(false);
    });
    main.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.filter) {
        const name = button.dataset.filter;
        const value = button.dataset.value || null;
        filter[name] = name === "sort" ? value : value && filter[name] !== value ? value : null;
        redraw(true);
        main.querySelector(`[data-filter="${name}"][data-value="${CSS.escape(value || "")}"]`)?.focus();
      } else if (button.hasAttribute("data-more-filters")) {
        moreFilters = true;
        redraw(true);
      } else if (button.hasAttribute("data-clear")) {
        Object.assign(filter, { query: "", kind: null, moon: null, tradition: null, deity: null, occasion: null, material: null, sharer: null });
        redraw(true);
      } else if (button.hasAttribute("data-show-hidden")) {
        setHidden({ posts: [], authors: [] });
        renderBrowse();
      }
    });
  }

  // ---------------------------------------------------------------- one ritual

  const view = { row: null, busy: null, savedId: null, active: null, covens: null, choosingCoven: false, message: "" };

  function renderRitual() {
    const main = UI.root();
    const row = view.row;
    const back = { href: BASE, label: "Community Rituals" };
    if (!row || C.isRitualHidden(row, hidden())) {
      main.innerHTML = `${UI.header({ back, title: "Community Rituals" })}<p>${row ? "You’ve hidden this ritual. You can show hidden rituals again from Community Rituals." : "This ritual couldn’t be found. It may have been withdrawn or replaced by a newer version."}</p>`;
      return;
    }
    const account = user();
    const name = C.sharerName(row);
    const key = C.sharerKey(row);
    const blocked = !!view.busy || !!view.active;
    main.innerHTML = `
      ${UI.header({ back, eyebrow: "Community Rituals", title: row.title, lead: [`Shared by ${name}`, row.version > 1 ? `version ${row.version}` : "", C.savesLabel(row.save_count)].filter(Boolean).join(" · ") })}
      ${key ? `<p><a class="rt-text-link" href="${BASE}?sharer=${encodeURIComponent(key)}&name=${encodeURIComponent(name)}">More from ${esc(name)}</a></p>` : ""}
      <div class="sp-actions rt-actions">
        ${
          account
            ? view.savedId
              ? `<p class="sp-notice" data-saved>Added to your rituals, credited “${esc(C.creditLine(row))}”. It’s your own copy now. <a class="rt-text-link" href="/altar/?editRitualTemplate=${encodeURIComponent(view.savedId)}">Open your copy</a> to change it however you like.</p>`
              : `<button type="button" class="button button--primary" data-add${view.busy ? " disabled" : ""}>${view.busy === "mine" ? "Adding…" : "Add to my rituals"}</button>`
            : `<p class="sp-muted">Sign in to add it to your rituals and change it however you like.</p>`
        }
        <button type="button" class="button button--ghost" data-once${blocked ? " disabled" : ""} title="Begins it as a guided ritual without saving it to your rituals">${view.busy === "once" ? "Beginning…" : "Do it once"}</button>
        <button type="button" class="button button--ghost" data-plan>Plan a night for it</button>
        ${view.covens?.length ? `<button type="button" class="button button--ghost" data-choose-coven aria-expanded="${view.choosingCoven}"${view.busy ? " disabled" : ""}>Add to a coven’s rituals</button>` : ""}
      </div>
      ${view.active ? `<p class="sp-muted">Finish the ritual that’s under way before beginning another. <a class="rt-text-link" href="/altar/?ritual=1">Continue it</a></p>` : ""}
      ${
        view.choosingCoven
          ? `<section class="sp-card" aria-label="Which coven?"><h2 class="sp-label">Which coven?</h2><p class="sp-caption">It’s kept with the coven’s templates, credited, for planning a gathering from.</p>
            <div class="sp-chips">${view.covens.map((c) => chip(c.name, null, `data-coven="${esc(c.id)}" data-coven-name="${esc(c.name)}"`)).join("")}</div></section>`
          : ""
      }
      ${view.message ? `<p class="sp-notice" role="status">${esc(view.message)}</p>` : ""}
      ${ritualHtml(row)}
      <p class="sp-muted">${esc(C.creditLine(row))}</p>
      <div class="sp-chips">
        <a class="sp-chip" href="${esc(C.ritualReportUrl(row))}" title="Emails the moderators about this ritual">Report</a>
        ${chip("Hide", null, `data-hide title="Stops showing this ritual in this browser"`)}
        ${key && row.sharer_id !== account?.id ? chip(row.share_as === "coven" ? "Hide this coven" : "Block this person", null, `data-block`) : ""}
      </div>`;
  }

  async function startRitual() {
    const id = params.get("id");
    const snap = await published().catch(() => ({ ready: false, rituals: [] }));
    view.row = snap.rituals.find((r) => r.id === id) || null;
    if (view.row) global.document.title = `${view.row.title} | Salt & Sovereignty`;
    renderRitual();
    if (!view.row) return;
    view.active = await S.activeSession().catch(() => null);
    view.covens = await covensILead().catch(() => []);
    if (params.get("keep") && user()) view.message = "You did this ritual once. Add it to your rituals to keep it.";
    renderRitual();
    if (params.get("keep")) UI.root().querySelector("[data-add]")?.focus();

    UI.root().addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button || button.disabled) return;
      const row = view.row;
      if (button.hasAttribute("data-add")) {
        view.busy = "mine";
        renderRitual();
        const saved = await UI.attempt(() => S.saveTemplate(C.draftFromCommunity(row)), "Couldn’t add it");
        view.busy = null;
        if (saved) {
          view.savedId = saved.id;
          view.message = "";
          noteSaved(row.id, "mine");
        }
        renderRitual();
        UI.root().querySelector("[data-saved] a")?.focus();
      } else if (button.hasAttribute("data-once")) {
        view.busy = "once";
        renderRitual();
        const active = await S.activeSession().catch(() => null);
        if (active) {
          view.active = active;
          view.busy = null;
          renderRitual();
          return;
        }
        S.begin(L.beginHandoff({ kind: "draft", draft: C.draftFromCommunity(row) }, { community: { id: row.id, credit: C.creditLine(row) } }));
      } else if (button.hasAttribute("data-plan")) {
        S.handOffDraft(C.draftFromCommunity(row));
        global.location.href = "/rituals/planner/?fromSpell=1";
      } else if (button.hasAttribute("data-choose-coven")) {
        view.choosingCoven = !view.choosingCoven;
        renderRitual();
      } else if (button.dataset.coven) {
        view.busy = "coven";
        renderRitual();
        const { title, body } = C.covenBodyFromCommunity(row);
        const ok = await UI.attempt(async () => {
          check(await db().rpc("save_coven_ritual_library", { p_coven: button.dataset.coven, p_id: null, p_kind: "template", p_title: title, p_body: body }));
          await noteSaved(row.id, "coven");
          return true;
        }, "Couldn’t add it");
        view.busy = null;
        if (ok) {
          view.choosingCoven = false;
          view.message = `Added to ${button.dataset.covenName}’s templates. Plan a gathering from it under the coven’s Rituals.`;
        }
        renderRitual();
      } else if (button.hasAttribute("data-hide")) {
        if (!global.confirm("Hide this ritual?\n\nYou won’t see it in Community Rituals in this browser.")) return;
        const h = hidden();
        setHidden({ ...h, posts: [...new Set([...h.posts, row.id])] });
        global.location.href = BASE;
      } else if (button.hasAttribute("data-block")) {
        const coven = row.share_as === "coven";
        const name = C.sharerName(row);
        const account = user();
        const words = coven
          ? `Hide everything from this coven?\n\nYou won’t see rituals shared by ${name} in this browser.`
          : `Block this person?\n\nYou won’t see rituals or community pages from ${name}${account ? ", here or in the app" : " in this browser"}. They aren’t told.`;
        if (!global.confirm(words)) return;
        const h = hidden();
        setHidden({ ...h, authors: [...new Set([...h.authors, row.sharer_id || C.sharerKey(row)])] });
        if (!coven && account && row.sharer_id && row.sharer_id !== account.id) {
          await db().from("user_blocks").insert({ blocker_id: account.id, blocked_id: row.sharer_id }).then(() => undefined, () => undefined);
        }
        global.location.href = BASE;
      }
    });
  }

  // ---------------------------------------------------------------- share

  const share = { source: null, content: null, covenId: null, covenName: "", shareAs: "preferred_name", agreed: false, busy: false, problem: "", sent: false, templates: [], covenLists: [] };

  function chooserHtml() {
    return `
      ${UI.header({ back: { href: BASE, label: "Community Rituals" }, eyebrow: "Community Rituals", title: "Share a ritual", lead: "Choose one of your templates, or a template of a coven whose rituals you lead. You can change anything before you send it." })}
      ${share.problem ? `<p class="sp-notice" role="status">${esc(share.problem)}</p>` : ""}
      <section class="sp-section"><h2 class="sp-label">Your templates</h2>
        ${
          share.templates.length
            ? `<div class="sp-list">${share.templates.map((t) => UI.row({ title: t.title, detail: t.intention || "", attrs: `data-pick-template="${esc(t.id)}"` })).join("")}</div>`
            : `<p class="sp-muted">No templates yet. Save a ritual as a template first, from a premade working, the spell builder, or the altar’s template editor.</p>`
        }</section>
      ${share.covenLists
        .map(
          ({ coven, items }) => `<section class="sp-section"><h2 class="sp-label">${esc(`${coven.name}’s templates`)}</h2>
            <div class="sp-list">${items.map((item) => UI.row({ title: item.title, attrs: `data-pick-coven="${esc(coven.id)}" data-pick-item="${esc(item.id)}"` })).join("")}</div></section>`
        )
        .join("")}`;
  }

  const field = (id, label, value, { multiline = false, placeholder = "", type = "text" } = {}) =>
    `<div class="sp-field"><label for="cr-${id}">${esc(label)}</label>${
      multiline
        ? `<textarea id="cr-${id}" data-field="${id}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
        : `<input id="cr-${id}" data-field="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" />`
    }</div>`;

  function formHtml() {
    const c = share.content;
    const kind = share.source?.kind;
    const mentions = C.closedMentions(c);
    const credits = C.SHARE_AS.filter((o) => o.value !== "coven" || share.covenId);
    return `
      ${UI.header({ back: { href: BASE, label: "Community Rituals" }, eyebrow: kind === "update" ? "Send an update" : kind === "edit" ? "Change and send again" : "Share with the community", title: c.title || "Your ritual",
        lead: share.covenId ? `From ${share.covenName}’s templates. Only the rite itself is shared: never the coven’s roles, members or notes.` : "A copy is shared: your template stays yours, and your altar and Grimoire links stay with you." })}
      <form data-share-form novalidate>
        <section class="sp-card">
          ${field("title", "Title", c.title)}
          ${chipGroup("Kind", "kind", C.COMMUNITY_KINDS, c.kind)}
          ${field("summary", "What it’s for", c.summary, { multiline: true, placeholder: "A sentence or two about the ritual and its purpose" })}
          ${field("tradition", "Tradition or path", c.tradition, { placeholder: "Wicca, Hellenic, folk, eclectic…" })}
          ${field("deities", "Deities (separated by commas)", c.deities.join(", "), { placeholder: "Optional" })}
          ${field("occasion", "Occasion or holiday", c.occasion, { placeholder: "Samhain, a new home, a birthday…" })}
          ${chipGroup("Moon phase", "moon_phase", C.COMMUNITY_MOONS, c.moon_phase)}
          ${field("duration", "About how many minutes?", c.duration_minutes ? String(c.duration_minutes) : "", { type: "number", placeholder: "Optional" })}
          ${chipGroup("Who it suits", "difficulty", C.COMMUNITY_DIFFICULTIES, c.difficulty)}
        </section>
        <section class="sp-card"><h2 class="sp-label">What it needs</h2>
          ${field("materials", "Materials (one per line, or separated by commas)", c.materials.join("\n"), { multiline: true })}
          ${field("preparation", "Preparation", c.preparation, { multiline: true })}
        </section>
        <section class="sp-section"><h2 class="sp-label">Steps</h2>
          ${c.steps
            .map(
              (s, i) => `<section class="sp-card" aria-label="Step ${i + 1}"><p class="sp-eyebrow">Step ${i + 1}</p>
                <div class="sp-field"><label for="cr-step-${i}-title">Step title</label><input id="cr-step-${i}-title" data-step="${i}" data-key="title" value="${esc(s.title)}" /></div>
                <div class="sp-field"><label for="cr-step-${i}-instructions">What to do</label><textarea id="cr-step-${i}-instructions" data-step="${i}" data-key="instructions">${esc(s.instructions)}</textarea></div>
                <div class="sp-field"><label for="cr-step-${i}-spoken">Words to speak (optional)</label><textarea id="cr-step-${i}-spoken" data-step="${i}" data-key="spoken_text">${esc(s.spoken_text)}</textarea></div>
                <div class="sp-field"><label for="cr-step-${i}-minutes">Minutes (optional)</label><input id="cr-step-${i}-minutes" type="number" min="0" step="0.5" data-step="${i}" data-key="minutes" value="${s.minutes ? esc(s.minutes) : ""}" /></div>
                <div class="sp-chips">${i > 0 ? chip("Move up", null, `data-move="${i}" data-by="-1"`) : ""}${i < c.steps.length - 1 ? chip("Move down", null, `data-move="${i}" data-by="1"`) : ""}${chip("Remove", null, `data-remove-step="${i}"`)}</div>
              </section>`
            )
            .join("")}
          <p><button type="button" class="button button--ghost" data-add-step>Add a step</button></p>
        </section>
        <section class="sp-card">
          ${field("closing", "Closing", c.closing, { multiline: true })}
          ${field("notes", "Notes for those who do it", c.notes, { multiline: true, placeholder: "Substitutions, what you noticed, what to try" })}
          ${field("safety_notes", "Take care (safety notes)", c.safety_notes, { multiline: true, placeholder: "Fire, herbs or oils on skin, pets, pregnancy…" })}
          ${field("cultural_note", "Its roots (where it comes from)", c.cultural_note, { multiline: true, placeholder: "Your own, a folk custom, a tradition you were taught in…" })}
          ${field("tags", "Tags (separated by commas)", c.tags.join(", "), { placeholder: "Optional" })}
        </section>
        ${
          mentions.length
            ? `<section class="sp-card sp-card--gold" aria-label="Before you share"><h2 class="sp-label">Before you share</h2>
              <p>This ritual names a tradition the ${esc(C.CLOSED_GUIDE_TITLE)} guide describes as not open to everyone:</p>
              ${mentions.map((m) => `<p class="sp-muted">${esc(C.mentionLine(m))}</p>`).join("")}
              <p>Share it only if it’s yours to share, say where it comes from under “Its roots”, and never present a closed practice as open.</p>
              <p><a class="rt-text-link" href="/library/closed/">Read ${esc(C.CLOSED_GUIDE_TITLE)}</a></p></section>`
            : ""
        }
        <section class="sp-card"><h2 class="sp-label">Credit it to</h2>
          <div class="sp-chips">${credits.map((o) => chip(o.value === "coven" && share.covenName ? share.covenName : o.label, share.shareAs === o.value, `data-share-as="${o.value}"`)).join("")}</div>
          <p class="sp-caption">${
            share.shareAs === "coven"
              ? "Shown as shared by the coven. Only its head and those who lead its rituals can share or change it."
              : share.shareAs === "anonymous"
                ? "Shown as Anonymous. No one else can see who shared it."
                : "Shown with that name from More → Settings → Identity."
          }</p>
        </section>
        <section class="sp-card"><h2 class="sp-label">Community guidelines</h2>
          <ul>${C.RITUAL_GUIDELINES.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
          <label class="rt-check-row"><input type="checkbox" data-agree${share.agreed ? " checked" : ""} /> I agree to the <a class="rt-text-link" href="/submission-terms.html">Submission Terms</a> and these guidelines</label>
        </section>
        ${share.problem ? `<p class="sp-notice" role="status" data-problem>${esc(share.problem)}</p>` : ""}
        <div class="sp-actions">
          <button type="submit" class="button button--primary"${share.busy ? " disabled" : ""}>${share.busy ? "Sending…" : kind === "update" ? "Send the update for review" : "Send for review"}</button>
          <a class="button button--ghost" href="${BASE}">Cancel</a>
        </div>
      </form>`;
  }

  function sentHtml() {
    return `${UI.header({ back: { href: BASE, label: "Community Rituals" }, eyebrow: "Community Rituals", title: "Thank you" })}
      <section class="sp-card"><p>${
        share.source?.kind === "update"
          ? "Your update has been sent for review. The published version stays up until the update is published."
          : "Your ritual has been sent for review. You’ll see where it stands under My shared rituals, with any note from the moderators."
      }</p><div class="sp-actions"><a class="button button--primary" href="${BASE}?mine=1">My shared rituals</a><a class="button button--ghost" href="${BASE}">Back to Community Rituals</a></div></section>`;
  }

  function renderShare() {
    UI.root().innerHTML = share.sent ? sentHtml() : share.content ? formHtml() : chooserHtml();
  }

  /** Read the form's text fields into the content (chips update it as they're pressed). */
  function readForm() {
    const root = UI.root();
    const c = share.content;
    const value = (id) => root.querySelector(`[data-field="${id}"]`)?.value ?? "";
    Object.assign(c, {
      title: value("title"),
      summary: value("summary"),
      tradition: value("tradition"),
      deities: C.splitList(value("deities")),
      occasion: value("occasion"),
      duration_minutes: Number(value("duration")) || null,
      materials: C.splitList(value("materials")),
      preparation: value("preparation"),
      closing: value("closing"),
      notes: value("notes"),
      safety_notes: value("safety_notes"),
      cultural_note: value("cultural_note"),
      tags: C.splitList(value("tags"))
    });
    root.querySelectorAll("[data-step]").forEach((input) => {
      const step = c.steps[Number(input.dataset.step)];
      if (!step) return;
      step[input.dataset.key] = input.dataset.key === "minutes" ? Number(input.value) || null : input.value;
    });
    share.agreed = !!root.querySelector("[data-agree]")?.checked;
  }

  function useTemplate(t) {
    share.content = C.contentFromTemplate(t);
    share.source = { kind: "template", id: t.id };
  }

  async function useCovenItem(coven, item) {
    share.content = C.contentFromCovenTemplate(item.title, item.body);
    share.covenId = coven.id;
    share.covenName = coven.name;
    share.shareAs = "coven";
    share.source = { kind: "coven", id: item.id };
  }

  async function startShare() {
    const account = user();
    const main = UI.root();
    if (!account) {
      main.innerHTML = `${UI.header({ back: { href: BASE, label: "Community Rituals" }, title: "Share a ritual" })}${UI.signInCard("Sign in to share. Your templates, and the covens you lead, are kept with your account.")}`;
      return;
    }
    main.innerHTML = `${UI.header({ back: { href: BASE, label: "Community Rituals" }, title: "Share a ritual" })}<p class="sp-muted">Opening…</p>`;
    try {
      const [templates, covens] = await Promise.all([S.templates().catch(() => []), covensILead()]);
      share.templates = templates;
      const editing = params.get("edit") || params.get("update");
      if (editing) {
        const row = check(await db().from("community_rituals").select("*").eq("id", editing).maybeSingle());
        if (row) {
          share.content = C.contentFromShared(row);
          share.covenId = row.coven_id;
          share.covenName = covens.find((c) => c.id === row.coven_id)?.name || (row.share_as === "coven" ? row.display_name : "");
          share.shareAs = row.share_as === "coven" ? "coven" : row.share_as === "anonymous" ? "anonymous" : "preferred_name";
          share.source = { kind: params.get("edit") ? "edit" : "update", id: row.id };
        } else share.problem = "That shared ritual couldn’t be found.";
      } else if (params.get("template")) {
        const t = templates.find((x) => x.id === params.get("template"));
        if (t) useTemplate(t);
      } else if (params.get("coven") && params.get("item")) {
        const coven = covens.find((c) => c.id === params.get("coven"));
        const item = coven ? (await covenTemplates(coven.id)).find((x) => x.id === params.get("item")) : null;
        if (coven && item) await useCovenItem(coven, item);
        else share.problem = "Only the coven’s head and those who lead its rituals can share its templates.";
      }
      if (!share.content) {
        share.covenLists = (await Promise.all(covens.map(async (coven) => ({ coven, items: await covenTemplates(coven.id) })))).filter((x) => x.items.length);
      }
    } catch (error) {
      share.problem = error.message || "Please try again.";
    }
    renderShare();

    main.addEventListener("click", async (event) => {
      const target = event.target.closest("button, [data-pick-template], [data-pick-coven]");
      if (!target) return;
      if (target.dataset.pickTemplate) {
        const t = share.templates.find((x) => x.id === target.dataset.pickTemplate);
        if (t) useTemplate(t);
        renderShare();
        return;
      }
      if (target.dataset.pickCoven) {
        const list = share.covenLists.find((x) => x.coven.id === target.dataset.pickCoven);
        const item = list?.items.find((x) => x.id === target.dataset.pickItem);
        if (list && item) await useCovenItem(list.coven, item);
        renderShare();
        return;
      }
      if (!share.content) return;
      readForm();
      const c = share.content;
      if (target.dataset.filter) {
        const name = target.dataset.filter;
        const value = target.dataset.value || "";
        c[name] = name === "kind" ? value : c[name] === value ? "" : value;
      } else if (target.dataset.shareAs) share.shareAs = target.dataset.shareAs;
      else if (target.hasAttribute("data-add-step")) c.steps.push({ title: "", instructions: "", spoken_text: "", minutes: null });
      else if (target.dataset.removeStep) c.steps.splice(Number(target.dataset.removeStep), 1);
      else if (target.dataset.move) {
        const i = Number(target.dataset.move);
        const [step] = c.steps.splice(i, 1);
        c.steps.splice(i + Number(target.dataset.by), 0, step);
      } else return;
      const focusKey = target.dataset.filter ? `[data-filter="${target.dataset.filter}"][data-value="${CSS.escape(target.dataset.value || "")}"]` : target.dataset.shareAs ? `[data-share-as="${target.dataset.shareAs}"]` : null;
      renderShare();
      if (focusKey) UI.root().querySelector(focusKey)?.focus();
    });

    main.addEventListener("submit", async (event) => {
      if (!event.target.closest("[data-share-form]")) return;
      event.preventDefault();
      readForm();
      const settings = await S.settings().catch(() => ({}));
      const args = C.shareArgs(share.content, {
        id: share.source?.kind === "edit" ? share.source.id : null,
        replaces: share.source?.kind === "update" ? share.source.id : null,
        shareAs: share.shareAs,
        names: settings || {},
        covenId: share.covenId,
        source: share.covenId ? "coven_template" : share.source?.kind === "template" ? "template" : "other",
        agreed: share.agreed
      });
      if (!args.ok) {
        share.problem = args.message;
        renderShare();
        UI.root().querySelector("[data-problem]")?.focus?.();
        return;
      }
      share.busy = true;
      share.problem = "";
      renderShare();
      try {
        check(await db().rpc("share_community_ritual", args.value));
        share.sent = true;
      } catch (error) {
        share.problem = error.message || "It couldn’t be sent. Check your connection and try again.";
      }
      share.busy = false;
      renderShare();
    });
  }

  // ---------------------------------------------------------------- my shared rituals

  async function renderMine() {
    const main = UI.root();
    const account = user();
    const head = UI.header({ back: { href: BASE, label: "Community Rituals" }, eyebrow: "Community Rituals", title: "My shared rituals", lead: "Every ritual is reviewed before it appears. A moderator may publish it, return it to you with a note, or decline it. Check back here to see where each stands." });
    if (!account) {
      main.innerHTML = `${head}${UI.signInCard("Sign in to see what you’ve shared.")}`;
      return;
    }
    const data = await myShares(account.id).catch((error) => ({ ready: true, mine: [], covens: [], problem: error.message }));
    const card = (row) => `
      <section class="sp-card${row.status === "needs_revision" ? " sp-card--gold" : ""}" aria-label="${esc(row.title)}">
        <p class="sp-eyebrow">${esc(C.sharedStatusLabel(row.status))}</p>
        <h2 class="rt-card-title">${esc(row.title)}</h2>
        <p class="sp-caption">${esc([`Credited to ${C.sharerName(row)}`, C.ritualFacts(row), row.version > 1 ? `version ${row.version}` : "", dateOf(row.submitted_at), C.savesLabel(row.save_count)].filter(Boolean).join(" · "))}</p>
        ${row.reviewer_note ? `<p class="sp-caption">From the moderators</p><p>${esc(row.reviewer_note)}</p>` : ""}
        <div class="sp-actions">
          ${row.status === "published" ? `<a class="button button--ghost" href="${BASE}?id=${encodeURIComponent(row.id)}">Open it</a>` : ""}
          ${C.canChange(row) && row.user_id === account.id ? `<a class="button button--ghost" href="${BASE}?share=1&edit=${encodeURIComponent(row.id)}">${row.status === "needs_revision" ? "Change it and send again" : "Change it"}</a>` : ""}
          ${C.canSendUpdate(row) ? `<a class="button button--ghost" href="${BASE}?share=1&update=${encodeURIComponent(row.id)}">Send an update</a>` : ""}
          ${C.canWithdraw(row) ? `<button type="button" class="button button--ghost" data-withdraw="${esc(row.id)}">Withdraw</button>` : ""}
        </div>
      </section>`;
    const mine = data.mine.filter((r) => r.status !== "superseded");
    const covens = data.covens.filter((r) => r.status !== "superseded" && r.status !== "withdrawn");
    main.innerHTML = `${head}
      ${data.problem ? `<p class="sp-notice">${esc(data.problem)}</p>` : ""}
      ${!data.ready ? `<p>Community Rituals is on its way. You’ll be able to share once it opens.</p>` : `
        ${mine.length ? mine.map(card).join("") : `<p class="sp-muted">You haven’t shared a ritual yet.</p>`}
        <p><a class="button button--ghost" href="${BASE}?share=1">Share a ritual</a></p>
        ${covens.length ? `<section class="sp-section"><h2 class="sp-label">Shared for your covens</h2>${covens.map(card).join("")}</section>` : ""}`}`;
    main.onclick = async (event) => {
      const button = event.target.closest("[data-withdraw]");
      if (!button) return;
      const row = [...data.mine, ...data.covens].find((r) => r.id === button.dataset.withdraw);
      if (!row) return;
      const words = row.status === "published" ? "It leaves Community Rituals. Copies people have already added to their rituals stay theirs." : "It won’t be reviewed or published.";
      if (!global.confirm(`Withdraw this ritual?\n\n${words}`)) return;
      const ok = await UI.attempt(async () => check(await db().rpc("withdraw_community_ritual", { p_id: row.id })), "Couldn’t withdraw it");
      if (ok !== undefined) {
        await renderMine();
        UI.say(`“${row.title}” is withdrawn.`);
      }
    };
  }

  // ---------------------------------------------------------------- review (moderators)

  const review = { rows: null, folder: "pending", open: null, notes: {} };

  function renderReview() {
    const main = UI.root();
    const rows = review.rows || [];
    const shown = rows.filter((r) => C.inRitualFolder(r, review.folder));
    const count = (f) => rows.filter((r) => C.inRitualFolder(r, f)).length;
    main.innerHTML = `
      ${UI.header({ back: { href: BASE, label: "Community Rituals" }, eyebrow: "Moderators", title: "Review shared rituals" })}
      <div class="sp-chips">${C.REVIEW_FOLDERS.map((f) => chip(`${f.label} (${count(f.value)})`, review.folder === f.value, `data-folder="${f.value}"`)).join("")}</div>
      ${shown.length ? "" : `<p class="sp-muted">Nothing here.</p>`}
      ${shown
        .map(
          (row) => `<section class="sp-card" aria-label="${esc(row.title)}">
            <p class="sp-eyebrow">${esc(C.sharedStatusLabel(row.status))}</p>
            <h2 class="rt-card-title">${esc(row.title)}</h2>
            <p class="sp-caption">${esc([`Credited to ${C.sharerName(row)}`, row.coven_id ? "a coven’s template" : "", row.replaces_id ? `update (version ${row.version})` : "", dateOf(row.submitted_at)].filter(Boolean).join(" · "))}</p>
            ${
              review.open === row.id
                ? `${ritualHtml(row)}
                  <div class="sp-field"><label for="cr-note-${esc(row.id)}">Note for the sharer</label><textarea id="cr-note-${esc(row.id)}" data-note="${esc(row.id)}" placeholder="Needed to return it; shown to them with any decision">${esc(review.notes[row.id] ?? row.reviewer_note ?? "")}</textarea></div>
                  <div class="sp-actions">${C.reviewActionsFor(row)
                    .map((a) => `<button type="button" class="button ${a === "publish" ? "button--primary" : "button--ghost"}" data-review="${a}" data-id="${esc(row.id)}">${esc(C.RITUAL_REVIEW_ACTIONS.find((x) => x.value === a).label)}</button>`)
                    .join("")}<button type="button" class="button button--ghost" data-close>Close</button></div>`
                : `<p><button type="button" class="button button--ghost" data-open="${esc(row.id)}">Read and review</button></p>`
            }
          </section>`
        )
        .join("")}`;
  }

  async function startReview() {
    const main = UI.root();
    if (!(await isModerator())) {
      main.innerHTML = `${UI.header({ back: { href: BASE, label: "Community Rituals" }, title: "Review shared rituals" })}<p>Only the community’s moderators review shared rituals.</p>`;
      return;
    }
    const load = async () => {
      review.rows = check(await db().from("community_rituals").select("*").order("submitted_at", { ascending: false }).limit(500)) || [];
    };
    await UI.attempt(load, "The queue couldn’t open");
    renderReview();
    main.addEventListener("input", (event) => {
      if (event.target.dataset.note) review.notes[event.target.dataset.note] = event.target.value;
    });
    main.addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.folder) review.folder = button.dataset.folder;
      else if (button.dataset.open) review.open = button.dataset.open;
      else if (button.hasAttribute("data-close")) review.open = null;
      else if (button.dataset.review) {
        const id = button.dataset.id;
        const row = review.rows.find((r) => r.id === id);
        const action = button.dataset.review;
        const done = await UI.attempt(async () => {
          check(await db().rpc("review_community_ritual", { p_id: id, p_action: action, p_note: (review.notes[id] ?? "").trim() || null }));
          await load();
          return true;
        }, "Couldn’t do that");
        if (done) {
          review.open = null;
          renderReview();
          UI.say(`${C.RITUAL_REVIEW_ACTIONS.find((x) => x.value === action).label}: “${row?.title || ""}”.`);
          return;
        }
        return;
      } else return;
      renderReview();
    });
  }

  // ---------------------------------------------------------------- a coven's rite or template, kept as your own

  /**
   * ?keep=coven&coven=…&ritual=… (or &item=…): the coven pages' "Save to my
   * templates", as the app's KeepRitual and coven templates screen. Its words
   * and directions only, never its roles or who was cast.
   */
  async function startKeep() {
    const main = UI.root();
    const back = { href: "/rituals/", label: "Rituals" };
    if (!user()) {
      main.innerHTML = `${UI.header({ back, title: "Save to my templates" })}${UI.signInCard("Sign in to keep a coven’s rite with your own rituals.")}`;
      return;
    }
    main.innerHTML = `${UI.header({ back, title: "Save to my templates" })}<p class="sp-muted">Saving…</p>`;
    const covenId = params.get("coven");
    const saved = await UI.attempt(async () => {
      const coven = check(await db().from("covens").select("id,name,slug").eq("id", covenId).maybeSingle());
      if (!coven) throw new Error("That coven couldn’t be found.");
      let title = "";
      let body = null;
      if (params.get("item")) {
        const item = check(await db().from("coven_ritual_library").select("id,title,body").eq("id", params.get("item")).eq("coven_id", covenId).maybeSingle());
        if (item) ({ title, body } = { title: item.title, body: item.body || {} });
      } else if (params.get("ritual")) {
        const ritual = check(await db().from("coven_rituals").select("id,title,intention,description,kind,occasion_name").eq("id", params.get("ritual")).eq("coven_id", covenId).maybeSingle());
        const steps = check(await db().from("coven_ritual_steps").select("title,instructions,spoken_text,duration_minutes").eq("ritual_id", params.get("ritual")).order("position", { ascending: true }));
        if (ritual) ({ title, body } = { title: ritual.title, body: { kind: ritual.kind, intention: ritual.intention || "", description: ritual.description || "", occasion_name: ritual.occasion_name || "", steps: steps || [] } });
      }
      if (!body) throw new Error("That rite couldn’t be found. Only the coven’s members can keep a copy.");
      const draft = C.draftFromCoven(title, body, coven.name);
      if (!draft.steps.length) throw new Error("It has no steps to keep yet.");
      return { template: await S.saveTemplate(draft), coven };
    }, "Couldn’t save it");
    if (!saved) {
      main.querySelector(".sp-muted")?.remove();
      return;
    }
    main.innerHTML = `${UI.header({ back, eyebrow: saved.coven.name, title: saved.template.title })}
      <section class="sp-card"><p>Saved to your templates, credited “From ${esc(saved.coven.name)}”. It’s your own copy now: change it however you like.</p>
        <div class="sp-actions"><a class="button button--primary" href="/altar/?editRitualTemplate=${encodeURIComponent(saved.template.id)}">Open your copy</a>
        <a class="button button--ghost" href="/covens/coven/?c=${encodeURIComponent(saved.coven.slug)}&tab=rituals">Back to ${esc(saved.coven.name)}</a></div></section>`;
  }

  // ---------------------------------------------------------------- start

  async function start() {
    await global.SaltPage.ready();
    if (params.get("keep") === "coven") await startKeep();
    else if (params.get("id")) await startRitual();
    else if (params.get("share")) await startShare();
    else if (params.get("mine")) await renderMine();
    else if (params.get("review")) await startReview();
    else await renderBrowse();
  }

  UI.attempt(start, "Community Rituals couldn't be opened");
})(window);
