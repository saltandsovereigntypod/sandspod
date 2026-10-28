/*
 * The coven directory (/covens/), in two tabs as the app's Coven tab has them
 * (app/src/app/(tabs)/coven/index.tsx), switched by js/segmented-switch.js:
 *
 *   My covens:    invitations sent to you (Accept or Decline), then
 *                 "Your covens" from Today (today/coven-today.js), then a card
 *                 for each coven you belong to (your position, unread messages
 *                 in its chat, its next gathering, and the applications and
 *                 requests to advance waiting in covens you review, kept
 *                 current while the page is open), and your applications still
 *                 waiting for an answer.
 *   Find a coven: "Have an invite?" (a code or link opens covens/join/), every
 *                 listed coven, searchable, your community profile, and the
 *                 way to found one.
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
  const invitesCore = () => global.SaltCore?.covens?.invites;
  const PENDING_KEY = "coven.invite.pending";

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
      mineData = { memberships: [], pending: [], waiting: {}, invitations: [] };
      return;
    }
    const [memberships, applications, waiting, invited] = await Promise.all([
      D.myMemberships(context.user.id).catch(() => []),
      D.myApplications(context.user.id).catch(() => []),
      D.pendingForReview ? D.pendingForReview(context.user.id).catch(() => ({})) : {},
      D.myInvitations(context.user.id).catch(() => [])
    ]);
    const mine = memberships.filter((m) => m.covens);
    const I = invitesCore();
    const invitations = I ? I.openInvitations((invited || []).filter((i) => i.covens), mine.map((m) => m.coven_id)) : [];
    await UI.loadNames(context, invitations.map((i) => i.invited_by));
    mineData = { memberships: mine, pending: applications.filter((a) => a.status === "pending" && !mine.some((m) => m.coven_id === a.coven_id)), waiting, invitations };
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

  /** Invitations sent to you, each with Accept and Decline (as the app's My covens has them). */
  function invitationsHtml() {
    const I = invitesCore();
    const list = mineData?.invitations || [];
    if (!I || !list.length) return "";
    return `<section class="sp-section"><p class="sp-label">Invitations</p>${list
      .map((i) => `<article class="sp-card cv-invite-card" data-invitation="${esc(i.id)}">
          <h3>${esc(i.covens.name)}</h3>
          ${i.covens.tagline ? `<p class="sp-muted">${esc(i.covens.tagline)}</p>` : ""}
          <p>${esc(I.invitationLine(i.invited_by ? UI.nameOf(context, i.invited_by) : null, i.message))}</p>
          <div class="sp-actions"><button class="button button--primary" type="button" data-invite-accept="${esc(i.id)}">Accept</button><button class="button button--ghost" type="button" data-invite-decline="${esc(i.id)}">Decline</button></div>
          <p class="cv-status" role="status" aria-live="polite" data-invite-status></p>
        </article>`)
      .join("")}</section>`;
  }

  /** An invitation opened before signing in (covens/join/ remembers it). */
  function pendingInviteHtml() {
    let path = "";
    try {
      path = global.localStorage.getItem(PENDING_KEY) || "";
    } catch {
      path = "";
    }
    if (!context.user || !/^\/covens\/join\/\?(code|invitation)=[A-Za-z0-9-]+$/.test(path)) return "";
    return `<div class="cv-banner"><p>You opened an invitation to a coven. <a href="${esc(href(path))}&amp;accept=1">Go back to it</a></p></div>`;
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
          ? `<div data-invitations>${invitationsHtml()}</div>
            <div data-coven-today>${global.CovenToday?.html?.() || ""}</div>
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
          <form class="sp-section" data-invite-code>
            <p class="sp-label">Have an invite?</p>
            <div class="sp-field"><label for="cv-invite-code">Invite code or link</label>
              <input id="cv-invite-code" name="code" autocomplete="off" autocapitalize="characters" placeholder="Paste the link, or type the code" /></div>
            <div class="sp-actions"><button class="button button--ghost" type="submit">Open the invitation</button></div>
            <p class="cv-status" role="status" aria-live="polite" data-code-status></p>
          </form>
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
      ${pendingInviteHtml()}
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
    const invites = root.querySelector("[data-invitations]");
    const list = invitationsHtml();
    if (invites && invites.innerHTML !== list) invites.innerHTML = list;
  }

  /** Accept or decline an invitation; when the coven's agreements (or your profile) come first, its invitation page opens. */
  async function answerInvitation(button, id, accept) {
    const card = button.closest("[data-invitation]");
    const status = card?.querySelector("[data-invite-status]");
    const I = invitesCore();
    const row = (mineData?.invitations || []).find((i) => i.id === id);
    button.disabled = true;
    UI.setStatus(status, accept ? "Joining…" : "Working…");
    try {
      await D.respondToInvitation(id, accept);
      if (accept && row) return global.location.assign(covenHref(row.covens.slug));
      await loadMine();
      redrawMine();
    } catch (error) {
      if (accept && I && (I.needsAgreements(error) || I.needsProfile(error))) return global.location.assign(href(`/covens/join/?invitation=${encodeURIComponent(id)}&accept=1`));
      UI.setStatus(status, I ? I.inviteError(error) : L.errorMessage(error), true);
      button.disabled = false;
    }
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
    const accept = event.target.closest("[data-invite-accept]");
    if (accept) void answerInvitation(accept, accept.dataset.inviteAccept, true);
    const decline = event.target.closest("[data-invite-decline]");
    if (decline) void answerInvitation(decline, decline.dataset.inviteDecline, false);
  });
  // "Have an invite?": a code or a whole link opens its invitation page.
  root.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-invite-code]");
    if (!form) return;
    event.preventDefault();
    const code = invitesCore()?.parseInviteCode(form.elements.code.value);
    if (!code) return UI.setStatus(form.querySelector("[data-code-status]"), "That doesn’t look like an invite code or link. A code is ten letters and numbers.", true);
    global.location.assign(href(`/covens/join/?code=${encodeURIComponent(code)}`));
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
