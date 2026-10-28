/*
 * The coven directory (/covens/), in two tabs as the app's Coven tab has them
 * (app/src/app/(tabs)/coven/index.tsx), switched by js/segmented-switch.js:
 *
 *   My covens:    "Your covens" from Today (today/coven-today.js), then a card
 *                 for each coven you belong to (your position, unread messages
 *                 in its chat, its next gathering, and the applications and
 *                 requests to advance waiting in covens you review, kept
 *                 current while the page is open), and your applications still
 *                 waiting for an answer.
 *   Find a coven: every listed coven, searchable, your community profile, and
 *                 the way to found one.
 *
 * It opens on My covens when you belong to a coven and on Find a coven when you
 * don't; after that on the tab last used in this browser (or ?tab=mine|find).
 * The moderators' Moderation link shows on both.
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const SW = global.SaltSwitch;
  const { esc, href } = UI;
  const { header } = global.GuidesUI;
  const tabsCore = () => global.SaltCore?.covens?.screenTabs;

  let context = null;
  let covens = [];
  let query = "";
  let joining = "all";
  let tab = null;
  let linkedTab = null;
  // What My covens shows, loaded by loadMine(): null until it has loaded.
  let mineData = null;
  let unread = {};

  const covenHref = (slug) => href(`/covens/coven/?c=${encodeURIComponent(slug)}`);

  function card(c) {
    const join = L.JOINING[c.joining] || L.JOINING.application;
    return `<a class="cv-card-link" href="${esc(covenHref(c.slug))}"><article class="sp-card">
        <h3>${esc(c.name)}</h3>
        ${c.tagline ? `<p class="sp-muted">${esc(c.tagline)}</p>` : ""}
        <div class="cv-meta">
          <span class="cv-pill${c.joining === "open" ? " cv-pill--gold" : ""}">${esc(join.label)}</span>
          ${c.tradition ? `<span class="cv-pill">${esc(c.tradition)}</span>` : ""}
          <span class="cv-pill">${Number(c.member_count) || 0} member${Number(c.member_count) === 1 ? "" : "s"}</span>
        </div>
        ${c.meeting_rhythm ? `<p class="sp-caption">Gathers: ${esc(c.meeting_rhythm)}</p>` : ""}
        ${c.tags?.length ? `<p class="sp-caption">${c.tags.map(esc).join(" · ")}</p>` : ""}
      </article></a>`;
  }

  function drawResults() {
    const count = root.querySelector("[data-count]");
    const results = root.querySelector("[data-results]");
    if (!count || !results) return;
    const list = L.filterDirectory(covens, { query, joining });
    count.textContent = covens.length
      ? `${list.length} of ${covens.length} coven${covens.length === 1 ? "" : "s"}`
      : "No covens have been founded yet. Yours could be the first.";
    results.innerHTML = list.length ? `<div class="cv-directory">${list.map(card).join("")}</div>` : covens.length ? `<p class="sp-empty">No covens match that search.</p>` : "";
    root.querySelectorAll("[data-joining]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.joining === joining)));
  }

  // ── My covens ──────────────────────────────────────────────────────────

  /** Unread messages in each coven's own chat since you last read it in this browser (as the coven page counts them). */
  async function loadUnread(memberships) {
    const userId = context.user?.id;
    if (!userId || !D.unreadSince) return {};
    let read = {};
    try {
      read = JSON.parse(global.localStorage.getItem(`coven.chat.read.${userId}`) || "{}") || {};
    } catch {
      read = {};
    }
    const key = (id) => global.SaltCore?.covens?.unreadCount?.threadKey?.(id, null) ?? id;
    const out = {};
    await Promise.all(
      memberships.map(async (m) => {
        const since = read[key(m.coven_id)];
        if (since) out[m.coven_id] = await D.unreadSince(m.coven_id, null, userId, since).catch(() => 0);
      })
    );
    return out;
  }

  async function loadMine() {
    if (!context.user) {
      mineData = { memberships: [], pending: [], waiting: {} };
      return;
    }
    const [memberships, applications, waiting] = await Promise.all([
      D.myMemberships(context.user.id).catch(() => []),
      D.myApplications(context.user.id).catch(() => []),
      D.pendingForReview ? D.pendingForReview(context.user.id).catch(() => ({})) : {}
    ]);
    const mine = memberships.filter((m) => m.covens);
    mineData = { memberships: mine, pending: applications.filter((a) => a.status === "pending" && !mine.some((m) => m.coven_id === a.coven_id)), waiting };
    unread = await loadUnread(mine);
  }

  function covenCard(m) {
    const R = global.SaltCore?.covens?.requests;
    const today = global.SaltCore?.covens?.today;
    const c = m.covens;
    const count = R ? R.pendingIn(mineData.waiting, m.coven_id) : 0;
    const requests = count ? R.pendingLabel(mineData.waiting[m.coven_id]) : "";
    const glance = today?.covenGlance ? today.covenGlance(global.CovenToday?.input?.() || null, m.coven_id) : { position: null, next: null };
    const status = c.status === "suspended" ? "Paused by the moderators" : c.status === "archived" ? "Archived" : "";
    const fresh = unread[m.coven_id] || 0;
    const next = glance.next ? `${glance.next.live ? "Now" : glance.next.meeting ? "Next meeting" : "Next gathering"}: ${glance.next.line}` : "";
    return `<a class="cv-card-link" href="${esc(covenHref(c.slug))}${count ? "&amp;tab=review" : ""}" data-coven-row="${esc(m.coven_id)}"><article class="sp-card cv-mine-card">
        <div class="cv-mine-card__head"><h3>${esc(c.name)}</h3><span class="sp-row__chevron" aria-hidden="true">›</span></div>
        ${status ? `<p class="sp-caption">${esc(status)}</p>` : c.tagline ? `<p class="sp-muted">${esc(c.tagline)}</p>` : ""}
        ${glance.position || fresh ? `<div class="cv-meta">${glance.position ? `<span class="cv-pill cv-pill--gold">${esc(glance.position)}</span>` : ""}${fresh ? `<span class="cv-pill">${fresh > 99 ? "99+" : fresh} unread</span>` : ""}</div>` : ""}
        ${next ? `<p class="sp-caption">${esc(next)}</p>` : ""}
        ${requests ? `<p class="sp-caption cv-gold">${esc(requests)}<span class="cv-count cv-count--row" aria-hidden="true">${count}</span></p>` : ""}
      </article></a>`;
  }

  function mineHtml() {
    if (!mineData) return `<p class="sp-caption">Gathering your covens…</p>`;
    const { memberships, pending } = mineData;
    const applied = pending.length
      ? `<section class="sp-section"><p class="sp-label">Waiting to hear back</p><nav class="sp-list" aria-label="Applications waiting">${pending
          .map((a) => `<a class="sp-row" href="${esc(covenHref(a.covens?.slug || ""))}"><span class="sp-row__text"><span class="sp-row__title">${esc(a.covens?.name || "A coven")}</span><span class="sp-row__detail">Application waiting for review</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`)
          .join("")}</nav></section>`
      : "";
    if (!memberships.length) {
      return `<div class="sp-card"><h3>No coven yet</h3><p>${
        pending.length
          ? "Your application is with the coven. While you wait, you can look at others or found one of your own."
          : "When you join a coven it will be here, with its gatherings and messages. Find one to practise with, or found your own."
      }</p><div class="sp-actions"><button type="button" class="button button--primary" data-go-find>Find a coven</button></div></div>${applied}`;
    }
    return `<section class="sp-section"><p class="sp-label">Covens you belong to</p><div class="cv-mine">${memberships.map(covenCard).join("")}</div></section>${applied}`;
  }

  // ── The page ───────────────────────────────────────────────────────────

  function chooseTab() {
    const T = tabsCore();
    if (!T) return "find";
    return T.covenTabFor({
      linked: linkedTab,
      remembered: SW.remembered(T.COVEN_TAB_KEY, T.asCovenTab),
      signedIn: Boolean(context.user),
      covenCount: mineData ? mineData.memberships.length : null
    });
  }

  function setTab(next, { focus = false } = {}) {
    tab = next;
    linkedTab = null;
    const T = tabsCore();
    if (T) SW.remember(T.COVEN_TAB_KEY, next);
    paint();
    if (focus) SW.focus(root, "cv-tabs");
  }

  function paint() {
    const signedIn = Boolean(context.user);
    const moderation = context.siteModerator ? `<a class="button button--ghost" href="${esc(href("/covens/moderation/"))}">Moderation</a>` : "";
    const tabs = { id: "cv-tabs", label: "Covens", options: tabsCore()?.COVEN_TABS || [{ key: "mine", label: "My covens" }, { key: "find", label: "Find a coven" }], value: tab };
    const content =
      tab === "mine"
        ? signedIn
          ? `<div data-coven-today>${global.CovenToday?.html?.() || ""}</div>
            <div data-mine>${mineHtml()}</div>
            ${moderation ? `<div class="sp-actions">${moderation}</div>` : ""}`
          : UI.signInCard("see the covens you belong to")
        : `<p>Find witches to practise with: covens with their own creed, rules and ways, a gathering to talk in and an altar you tend together. Covens are for adults (18+) and follow the <a href="${esc(href("/covens/guidelines/"))}">community guidelines</a>.</p>
          <div class="sp-actions">
            ${signedIn ? `<a class="button button--primary" href="${esc(href("/covens/new/"))}">✦ Found a coven</a>` : `<a class="button button--primary" href="${esc(href("/?sanctuary=auth"))}">Sign in to join or found a coven</a>`}
            ${signedIn ? `<button class="button button--ghost" type="button" data-profile-toggle>${context.profile ? "Your community profile" : "Set up your community profile"}</button>` : ""}
            ${moderation}
          </div>
          <div data-profile hidden></div>
          <section class="sp-section">
            <p class="sp-label">Find a coven</p>
            <div class="sp-field"><label for="cv-search">Search covens</label>
              <input id="cv-search" type="search" placeholder="Hellenic, hedge, moon circle, beginners…" autocomplete="off" value="${esc(query)}" /></div>
            <div class="sp-chips" role="group" aria-label="How they join">
              <button type="button" class="sp-chip" data-joining="all">All</button>
              <button type="button" class="sp-chip" data-joining="open">Open to join</button>
              <button type="button" class="sp-chip" data-joining="application">By application</button>
            </div>
            <p class="sp-caption" role="status" aria-live="polite" data-count></p>
            <div data-results></div>
          </section>`;
    root.innerHTML = `${header({ title: "Covens", eyebrow: "Circles to practise with", back: "/?sanctuary=more", backLabel: "Back to More" })}
      ${context.banned ? UI.bannedCard() : ""}
      ${SW.html(tabs)}
      ${SW.panel(tabs, `<div class="cv-tab-panel">${content}</div>`)}`;

    root.querySelector("#cv-search")?.addEventListener("input", (event) => {
      query = event.target.value;
      drawResults();
    });
    root.querySelectorAll("[data-joining]").forEach((b) =>
      b.addEventListener("click", () => {
        joining = b.dataset.joining;
        drawResults();
      })
    );
    const toggle = root.querySelector("[data-profile-toggle]");
    const holder = root.querySelector("[data-profile]");
    toggle?.addEventListener("click", () => {
      holder.hidden = !holder.hidden;
      if (!holder.hidden) UI.profileForm(holder, context, { onSaved: () => (toggle.textContent = "Your community profile") });
    });
    drawResults();
  }

  /** Redraw My covens' list in place (when counts change or Today's coven rows arrive). */
  function redrawMine() {
    const holder = root.querySelector("[data-mine]");
    const html = mineHtml();
    if (holder && holder.innerHTML !== html) holder.innerHTML = html;
  }

  async function draw() {
    const [listing] = await Promise.all([D.directory().catch((error) => ({ error })), loadMine()]);
    if (listing?.error) {
      root.innerHTML = `${header({ title: "Covens", eyebrow: "Circles to practise with", back: "/?sanctuary=more", backLabel: "Back to More" })}<p class="sp-notice">${esc(L.errorMessage(listing.error))}</p>`;
      return;
    }
    covens = listing || [];
    tab = chooseTab();
    paint();
    watchMine();
  }

  /** While the page is open, keep the counts on your covens current: live once the database sends requests, and every two minutes. */
  let watching = false;
  function watchMine() {
    if (watching || !context.user) return;
    watching = true;
    let timer = null;
    const again = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          await loadMine();
        } catch {
          return;
        }
        redrawMine();
      }, 400);
    };
    const stop = D.watchRequests ? D.watchRequests(again) : () => {};
    const every = setInterval(again, 2 * 60 * 1000);
    global.document.addEventListener("visibilitychange", () => global.document.visibilityState === "visible" && again());
    global.addEventListener("pagehide", () => {
      stop();
      clearInterval(every);
    });
  }

  if (SW) {
    SW.bind(root, "cv-tabs", (next, how) => setTab(next, how));
  }
  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-go-find]")) setTab("find", { focus: true });
  });
  // Your covens' rites and positions arrive from today/coven-today.js after the page draws.
  global.addEventListener("covenTodayLoaded", () => {
    const holder = root.querySelector("[data-coven-today]");
    if (holder) holder.innerHTML = global.CovenToday?.html?.() || "";
    redrawMine();
  });

  // A link may ask for a tab (/covens/?tab=find); it's then taken out of the address.
  try {
    const params = new URLSearchParams(global.location.search);
    linkedTab = tabsCore()?.asCovenTab(params.get("tab")) || null;
    if (linkedTab) {
      params.delete("tab");
      const search = params.toString();
      global.history.replaceState(global.history.state, "", `${global.location.pathname}${search ? `?${search}` : ""}${global.location.hash}`);
    }
  } catch {
    linkedTab = null;
  }
  if (linkedTab) {
    const T = tabsCore();
    SW?.remember(T.COVEN_TAB_KEY, linkedTab);
  }

  UI.boot()
    .then((ctx) => {
      context = ctx;
      return draw();
    })
    .catch((error) => {
      console.error(error);
      root.innerHTML = `<h1>Covens</h1><p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
    });
})(window);
