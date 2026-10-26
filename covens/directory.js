/*
 * The coven directory (/covens/): every listed coven, searchable, plus your
 * own covens and applications when signed in (with the applications and
 * requests to advance waiting in covens you review, kept current while the
 * page is open), and the way to found one.
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, href } = UI;
  const { header } = global.GuidesUI;

  let context = null;
  let covens = [];
  let query = "";
  let joining = "all";

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
    const list = L.filterDirectory(covens, { query, joining });
    root.querySelector("[data-count]").textContent = covens.length
      ? `${list.length} of ${covens.length} coven${covens.length === 1 ? "" : "s"}`
      : "No covens have been founded yet. Yours could be the first.";
    root.querySelector("[data-results]").innerHTML = list.length ? `<div class="cv-directory">${list.map(card).join("")}</div>` : covens.length ? `<p class="sp-empty">No covens match that search.</p>` : "";
    root.querySelectorAll("[data-joining]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.joining === joining)));
  }

  async function mine() {
    if (!context.user) return "";
    const [memberships, applications, waiting] = await Promise.all([
      D.myMemberships(context.user.id).catch(() => []),
      D.myApplications(context.user.id).catch(() => []),
      D.pendingForReview ? D.pendingForReview(context.user.id).catch(() => ({})) : {}
    ]);
    const R = global.SaltCore?.covens?.requests;
    const pending = applications.filter((a) => a.status === "pending");
    const rows = memberships
      .filter((m) => m.covens)
      .map((m) => {
        const count = R ? R.pendingIn(waiting, m.coven_id) : 0;
        const detail = count ? R.pendingLabel(waiting[m.coven_id]) : m.covens.status === "active" ? m.covens.tagline || "Your coven" : m.covens.status === "suspended" ? "Paused by the moderators" : "Archived";
        return `<a class="sp-row" href="${esc(covenHref(m.covens.slug))}${count ? "&amp;tab=review" : ""}" data-coven-row="${esc(m.coven_id)}"><span class="sp-row__text"><span class="sp-row__title">${esc(m.covens.name)}</span>
        <span class="sp-row__detail">${esc(detail)}</span></span>${count ? `<span class="cv-count cv-count--row" aria-label="${count} waiting for review">${count}</span>` : ""}<span class="sp-row__chevron" aria-hidden="true">›</span></a>`;
      })
      .concat(pending.map((a) => `<a class="sp-row" href="${esc(covenHref(a.covens?.slug || ""))}"><span class="sp-row__text"><span class="sp-row__title">${esc(a.covens?.name || "A coven")}</span><span class="sp-row__detail">Application waiting for review</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`));
    if (!rows.length) return "";
    return `<section class="sp-section"><p class="sp-label">Your covens</p><nav class="sp-list" aria-label="Your covens">${rows.join("")}</nav></section>`;
  }

  async function draw() {
    const [listing, mineHtml] = await Promise.all([D.directory().catch((error) => ({ error })), mine()]);
    if (listing?.error) {
      root.innerHTML = `${header({ title: "Covens", eyebrow: "Circles to practise with", back: "/?sanctuary=more", backLabel: "Back to More" })}<p class="sp-notice">${esc(L.errorMessage(listing.error))}</p>`;
      return;
    }
    covens = listing || [];
    const signedIn = Boolean(context.user);
    root.innerHTML = `${header({ title: "Covens", eyebrow: "Circles to practise with", back: "/?sanctuary=more", backLabel: "Back to More" })}
      <p>Find witches to practise with: covens with their own creed, rules and ways, a gathering to talk in and an altar you tend together. Covens are for adults (18+) and follow the <a href="${esc(href("/covens/guidelines/"))}">community guidelines</a>.</p>
      ${context.banned ? UI.bannedCard() : ""}
      <div class="sp-actions">
        ${signedIn ? `<a class="button button--primary" href="${esc(href("/covens/new/"))}">✦ Found a coven</a>` : `<a class="button button--primary" href="${esc(href("/?sanctuary=auth"))}">Sign in to join or found a coven</a>`}
        ${signedIn ? `<button class="button button--ghost" type="button" data-profile-toggle>${context.profile ? "Your community profile" : "Set up your community profile"}</button>` : ""}
        ${context.siteModerator ? `<a class="button button--ghost" href="${esc(href("/covens/moderation/"))}">Moderation</a>` : ""}
      </div>
      <div data-profile hidden></div>
      <div data-mine>${mineHtml}</div>
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

    root.querySelector("#cv-search").addEventListener("input", (event) => {
      query = event.target.value;
      drawResults();
    });
    root.querySelectorAll("[data-joining]").forEach((b) => b.addEventListener("click", () => {
      joining = b.dataset.joining;
      drawResults();
    }));
    const toggle = root.querySelector("[data-profile-toggle]");
    const holder = root.querySelector("[data-profile]");
    toggle?.addEventListener("click", () => {
      holder.hidden = !holder.hidden;
      if (!holder.hidden) UI.profileForm(holder, context, { onSaved: () => (toggle.textContent = "Your community profile") });
    });
    drawResults();
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
        const html = await mine().catch(() => null);
        const holder = root.querySelector("[data-mine]");
        if (holder && html != null && holder.innerHTML !== html) holder.innerHTML = html;
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
