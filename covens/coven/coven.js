/*
 * A coven's home (/covens/coven/?c=<address>&tab=…).
 *
 * Everyone sees About: the coven's creed, rules, requirements, agreements
 * and positions. Seekers sign the agreements and join or apply under Join.
 * Members get the Gathering (live chat, covens/coven/chat.js), the Altar
 * (shared and live, covens/coven/altar.js), Members and My path (their
 * position, agreements and requests to advance). Reviewers get Review and
 * leaders Manage (covens/coven/manage.js). Site moderators see every tab.
 */
(function (global) {
  "use strict";

  const doc = global.document;
  const root = doc.querySelector("[data-page-root]");
  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose, href } = UI;
  const { header } = global.GuidesUI;

  const slug = new URLSearchParams(global.location.search).get("c") || "";
  const state = { context: null, coven: null, ranks: [], documents: [], membership: null, perms: null, signatures: [], unsigned: [], application: null, advancements: [], pending: { applications: 0, advancements: 0 }, presence: [] };
  let live = null;
  let mounted = null;

  const covenHref = (tab) => href(`/covens/coven/?c=${encodeURIComponent(slug)}${tab && tab !== "about" ? `&tab=${tab}` : ""}`);
  const kindLabel = (kind) => L.DOCUMENT_KINDS.find((d) => d.kind === kind)?.label || "Page";

  // --- loading -------------------------------------------------------------

  async function load() {
    const { context } = state;
    const coven = await D.coven(slug);
    state.coven = coven;
    if (!coven) return;
    const userId = context.user?.id;
    const [ranks, documents, membership, signatures, application, advancements] = await Promise.all([
      D.ranks(coven.id),
      D.documents(coven.id),
      D.membership(coven.id, userId).catch(() => null),
      D.mySignatures(coven.id, userId).catch(() => []),
      D.myCovenApplication(coven.id, userId).catch(() => null),
      D.myAdvancements(coven.id, userId).catch(() => [])
    ]);
    Object.assign(state, { ranks: ranks || [], documents: L.orderDocuments(documents || []), membership, signatures: signatures || [], application, advancements: advancements || [] });
    state.perms = L.permissions({ coven, membership, ranks: state.ranks, userId, siteModerator: context.siteModerator });
    state.unsigned = userId ? L.unsignedAgreements(state.documents, state.signatures, userId) : state.documents.filter((d) => d.requires_signature);
    state.standing = L.standing(state.perms, state.unsigned, context.banned);
    if (state.perms.review || state.perms.site) {
      const [apps, advs] = await Promise.all([D.applications(coven.id).catch(() => []), D.advancements(coven.id).catch(() => [])]);
      state.pending = { applications: apps.length, advancements: advs.length };
    }
    if (coven.founder_id) await UI.loadNames(context, [coven.founder_id]);
  }

  /** Reload everything and redraw the current tab (after joining, signing…). */
  async function refresh(tab) {
    await load();
    connect();
    if (tab && tab !== currentTab()) global.history.replaceState(null, "", covenHref(tab));
    draw(currentTab());
  }

  // --- tabs ----------------------------------------------------------------

  function tabs() {
    const { perms, coven } = state;
    const list = [{ key: "about", label: "About" }];
    const insider = perms.member || perms.site;
    if (!perms.member && coven.status === "active") list.push({ key: "join", label: coven.joining === "open" ? "Join" : "Apply" });
    if (insider) list.push({ key: "gathering", label: "Gathering" }, { key: "altar", label: "Altar" }, { key: "members", label: "Members" });
    if (perms.member) list.push({ key: "path", label: "My path", count: state.unsigned.length });
    if (perms.review || perms.site) list.push({ key: "review", label: "Review", count: state.pending.applications + state.pending.advancements });
    if (perms.manage || perms.site) list.push({ key: "manage", label: "Manage" });
    return list;
  }

  function currentTab() {
    const wanted = new URLSearchParams(global.location.search).get("tab") || "about";
    return tabs().some((t) => t.key === wanted) ? wanted : "about";
  }

  function tabBar(active) {
    return `<nav class="cv-tabs" aria-label="${esc(state.coven.name)}">${tabs()
      .map((t) => `<a class="cv-tab" href="${esc(covenHref(t.key))}" data-tab="${t.key}"${t.key === active ? ' aria-current="page"' : ""}>${esc(t.label)}${t.count ? `<span class="cv-count" aria-label="${t.count} waiting">${t.count}</span>` : ""}</a>`)
      .join("")}</nav>`;
  }

  function banners() {
    const { coven, perms, context } = state;
    const out = [];
    if (coven.status === "suspended") out.push(`<div class="cv-banner"><p><strong>This coven is paused by the Salt &amp; Sovereignty moderators.</strong> Members can read it, but nothing new can be added while it’s paused.${coven.moderation_note ? ` Note from the moderators: ${esc(coven.moderation_note)}` : ""}</p></div>`);
    if (coven.status === "archived") out.push(`<div class="cv-banner"><p>This coven has been archived. Its members can still read it.</p></div>`);
    if (perms.site && !perms.member) out.push(`<div class="cv-banner cv-banner--site"><p>You’re viewing this coven as a site moderator.</p></div>`);
    if (context.banned) out.push(UI.bannedCard());
    if (perms.member && state.unsigned.length && currentTab() !== "path") out.push(`<div class="cv-banner"><p>The coven’s agreements have changed. <a href="${esc(covenHref("path"))}" data-tab="path">Read and sign them</a> to keep taking part in the gathering and at the altar.</p></div>`);
    return out.join("");
  }

  function draw(tab) {
    mounted?.unmount?.();
    mounted = null;
    const { coven } = state;
    doc.title = `${coven.name} | Salt & Sovereignty`;
    root.innerHTML = `${header({ title: coven.name, eyebrow: coven.tradition || "Coven", back: "/covens/", backLabel: "All covens" })}
      ${coven.tagline ? `<p class="sp-muted">${esc(coven.tagline)}</p>` : ""}
      ${banners()}
      ${tabBar(tab)}
      <div class="cv-pane" data-pane></div>`;
    const pane = root.querySelector("[data-pane]");
    const views = { about, join, path, gathering: () => mount(global.CovenChat), altar: () => mount(global.CovenAltar), members: () => mount(global.CovenMembers), review: () => mount(global.CovenReview), manage: () => mount(global.CovenManage) };
    function mount(module) {
      if (!module) return (pane.innerHTML = `<p class="sp-notice">This part of the coven couldn’t load. Please refresh the page.</p>`);
      mounted = module;
      module.mount(pane, state, { refresh, live, covenHref });
    }
    (views[tab] || about)(pane);
    if (live) live.track({ user_id: state.context.user.id, name: UI.nameOf(state.context, state.context.user.id), place: tab });
  }

  // --- About ---------------------------------------------------------------

  function documentSection(d) {
    const signed = state.context.user && d.requires_signature && !state.unsigned.some((u) => u.id === d.id);
    return `<details class="sp-details" ${d.kind === "agreement" ? "" : "open"}>
        <summary>${esc(d.title)}</summary>
        <div class="cv-meta"><span class="cv-pill">${esc(kindLabel(d.kind))}</span>
          ${d.visibility === "members" ? `<span class="cv-pill">Members only</span>` : ""}
          ${d.requires_signature ? `<span class="cv-pill${signed ? " cv-pill--gold" : ""}">${signed ? "✓ You’ve signed this" : "To be signed"} · version ${d.version}</span>` : ""}
          ${d.published ? "" : `<span class="cv-pill cv-pill--warn">Draft</span>`}</div>
        ${d.body.trim() ? `<div class="cv-doc">${prose(d.body)}</div>` : `<p class="sp-empty">Not written yet.</p>`}
      </details>`;
  }

  function positions() {
    const ranks = [...state.ranks].sort((a, b) => b.level - a.level);
    if (!ranks.length) return "";
    return `<section class="sp-section"><h2>Positions</h2><div class="sp-list">${ranks
      .map((r) => {
        const powers = L.rankPowers(r);
        return `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(r.name)}${r.is_default ? " · where new members begin" : ""}${r.open_to_applications ? " · open to apply" : ""}</span>
          ${r.description ? `<span class="sp-row__detail">${esc(r.description)}</span>` : ""}
          ${r.requirements ? `<span class="sp-row__detail">Asks: ${esc(r.requirements)}</span>` : ""}
          ${powers.length ? `<span class="sp-row__detail">This position ${esc(powers.join(", "))}.</span>` : ""}</span></div>`;
      })
      .join("")}</div></section>`;
  }

  function about(pane) {
    const { coven, perms, context } = state;
    const join = L.JOINING[coven.joining] || L.JOINING.application;
    const here = state.presence.length;
    pane.innerHTML = `<div class="sp-section">
        <div class="cv-meta">
          <span class="cv-pill${coven.joining === "open" ? " cv-pill--gold" : ""}">${esc(join.label)}</span>
          <span class="cv-pill">${Number(coven.member_count) || 0} member${Number(coven.member_count) === 1 ? "" : "s"}</span>
          ${coven.meeting_rhythm ? `<span class="cv-pill">Gathers: ${esc(coven.meeting_rhythm)}</span>` : ""}
          ${coven.visibility === "unlisted" ? `<span class="cv-pill">Unlisted</span>` : ""}
          ${here ? `<span class="cv-pill"><span class="cv-presence__dot" aria-hidden="true"></span> ${here} here now</span>` : ""}
        </div>
        ${coven.description ? `<div class="cv-doc">${prose(coven.description)}</div>` : ""}
        ${coven.tags?.length ? `<p class="sp-caption">${coven.tags.map(esc).join(" · ")}</p>` : ""}
        <p class="sp-caption">Led by ${esc(coven.founder_id ? UI.nameOf(context, coven.founder_id) : "the coven’s elders")} · founded ${esc(new Date(coven.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long" }))}</p>
        ${!perms.member && coven.status === "active" && coven.joining !== "closed" ? `<div class="sp-actions"><a class="button button--primary" href="${esc(covenHref("join"))}" data-tab="join">${coven.joining === "open" ? "Join this coven" : "Apply to join"}</a></div>` : ""}
        ${coven.joining === "closed" && !perms.member ? `<p class="sp-notice">${esc(join.detail)}</p>` : ""}
      </div>
      ${state.documents.length ? `<section class="sp-section"><h2>Our ways</h2>${state.documents.map(documentSection).join("")}</section>` : ""}
      ${positions()}
      <div class="sp-actions">
        ${context.user ? `<button class="button button--ghost button--small" type="button" data-report-coven>Report this coven</button>` : ""}
      </div>`;
    pane.querySelector("[data-report-coven]")?.addEventListener("click", () => UI.report({ target_type: "coven", target_id: coven.id, coven_id: coven.id, label: "this coven" }));
  }

  // --- signing agreements --------------------------------------------------

  function signer(container, after) {
    const { unsigned, context } = state;
    if (!unsigned.length) {
      container.innerHTML = `<p class="sp-caption">✓ You’ve signed the coven’s current agreements.</p>`;
      return;
    }
    container.innerHTML = unsigned
      .map((d) => `<form class="sp-card" data-sign="${esc(d.id)}">
          <h3>${esc(d.title)}</h3>
          <p class="sp-caption">Version ${d.version}</p>
          ${d.body.trim() ? `<div class="cv-doc">${prose(d.body)}</div>` : `<p class="sp-empty">The coven hasn’t written this agreement yet.</p>`}
          <label class="cv-check"><input type="checkbox" name="agree" required /> <span>I have read this and agree to it.</span></label>
          <div class="sp-field"><label for="sign-${esc(d.id)}">Sign with your coven name</label>
            <input id="sign-${esc(d.id)}" name="signed_name" required minlength="2" maxlength="80" value="${esc(context.profile?.display_name || "")}" /></div>
          <div class="sp-actions"><button class="button button--primary" type="submit">Sign</button></div>
          <p class="cv-status" role="status" aria-live="polite" data-status></p>
        </form>`)
      .join("");
    container.querySelectorAll("[data-sign]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const ok = await UI.busy(form, form.querySelector("[data-status]"), () => D.sign(form.dataset.sign, form.elements.signed_name.value.trim()).then(() => true));
        if (ok) {
          state.signatures = await D.mySignatures(state.coven.id, context.user.id);
          state.unsigned = L.unsignedAgreements(state.documents, state.signatures, context.user.id);
          after();
        }
      })
    );
  }

  // --- Join ----------------------------------------------------------------

  function join(pane) {
    const { coven, context, membership, application } = state;
    if (!context.user) return (pane.innerHTML = UI.signInCard(`join ${coven.name}`));
    if (context.banned) return (pane.innerHTML = UI.bannedCard());
    if (!context.profile) {
      pane.innerHTML = `<div data-profile></div>`;
      return UI.profileForm(pane.querySelector("[data-profile]"), context, { intro: "Before you join a coven, choose the name its members will see and confirm you are 18 or older.", onSaved: () => join(pane) });
    }
    if (membership?.status === "banned") return (pane.innerHTML = `<p class="sp-notice">You can’t rejoin this coven.</p>`);
    if (coven.joining === "closed") return (pane.innerHTML = `<p class="sp-notice">${esc(L.JOINING.closed.detail)}</p>`);

    if (application?.status === "pending") {
      const questions = L.normalizeQuestions(coven.application_questions);
      pane.innerHTML = `<div class="sp-card">
          <h2>Your application is waiting</h2>
          <p>You applied ${esc(L.relativeTime(application.created_at))}. The coven’s reviewers will read it soon.</p>
          ${questions.map((q) => `<p><strong>${esc(q.prompt)}</strong><br />${prose(application.answers?.[q.id] || "—")}</p>`).join("")}
          ${application.message ? `<p><strong>Your note</strong><br />${prose(application.message)}</p>` : ""}
          <div class="sp-actions"><button class="button button--ghost" type="button" data-withdraw>Withdraw my application</button></div>
          <p class="cv-status" role="status" aria-live="polite" data-status></p></div>`;
      const button = pane.querySelector("[data-withdraw]");
      button.addEventListener("click", async () => {
        if (!(await UI.confirmAction("Withdraw your application?", "You can apply again later.", "Withdraw"))) return;
        if ((await UI.busy(button, pane.querySelector("[data-status]"), () => D.withdraw("application", application.id).then(() => true)))) refresh("join");
      });
      return;
    }

    const declined = application?.status === "declined" ? `<div class="cv-banner"><p>Your last application wasn’t accepted.${application.reviewer_note ? ` The coven said: ${esc(application.reviewer_note)}` : ""} You can apply again 30 days after that decision.</p></div>` : "";
    const open = coven.joining === "open";
    pane.innerHTML = `${declined}
      <section class="sp-section"><h2>1 · Read and sign the agreements</h2><div data-signer></div></section>
      <section class="sp-section"><h2>2 · ${open ? "Join" : "Apply"}</h2><div data-step></div></section>`;
    const step = pane.querySelector("[data-step]");
    const drawStep = () => {
      const blocked = state.unsigned.length > 0;
      if (open) {
        step.innerHTML = `<div class="sp-card"><p>${blocked ? "Sign the agreements above first." : "You’re ready. Welcome."}</p>
          <div class="sp-actions"><button class="button button--primary" type="button" data-join ${blocked ? "disabled" : ""}>Join ${esc(coven.name)}</button></div>
          <p class="cv-status" role="status" aria-live="polite" data-status></p></div>`;
        const button = step.querySelector("[data-join]");
        button.addEventListener("click", async () => {
          if (await UI.busy(button, step.querySelector("[data-status]"), () => D.join(coven.id))) refresh("gathering");
        });
        return;
      }
      const questions = L.normalizeQuestions(coven.application_questions);
      step.innerHTML = `<form class="sp-card" data-apply>
          ${questions.map((q) => `<div class="sp-field"><label for="ans-${esc(q.id)}">${esc(q.prompt)}${q.required ? "" : " (optional)"}</label>
            <textarea id="ans-${esc(q.id)}" name="${esc(q.id)}" maxlength="4000" ${q.required ? "required" : ""}></textarea></div>`).join("")}
          <div class="sp-field"><label for="ans-message">Anything else you’d like the coven to know (optional)</label>
            <textarea id="ans-message" name="__message" maxlength="4000"></textarea></div>
          <p class="sp-caption">The coven’s reviewers will see your coven name, pronouns, the little about your path in your profile, and these answers.</p>
          <div class="sp-actions"><button class="button button--primary" type="submit" ${blocked ? "disabled" : ""}>Send my application</button></div>
          ${blocked ? `<p class="sp-caption">Sign the agreements above first.</p>` : ""}
          <p class="cv-status" role="status" aria-live="polite" data-status></p></form>`;
      const form = step.querySelector("[data-apply]");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const message = data.__message;
        delete data.__message;
        const missing = L.missingAnswers(questions, data);
        if (missing.length) return UI.setStatus(form.querySelector("[data-status]"), `Please answer: ${missing[0].prompt}`, true);
        if (await UI.busy(form, form.querySelector("[data-status]"), () => D.apply(coven.id, data, message))) refresh("join");
      });
    };
    signer(pane.querySelector("[data-signer]"), drawStep);
    drawStep();
  }

  // --- My path -------------------------------------------------------------

  function path(pane) {
    const { perms, coven, context, advancements } = state;
    const options = L.advancementOptions(state.ranks, perms);
    const pending = advancements.find((a) => a.status === "pending");
    const rankName = (id) => state.ranks.find((r) => r.id === id)?.name || "a position";
    const powers = L.rankPowers(perms.rank);
    pane.innerHTML = `<section class="sp-section"><h2>Your place in the coven</h2>
        <div class="sp-card">
          <p><strong>${esc(perms.founder ? `${perms.rank?.name || "Leader"} · founder` : perms.rank?.name || "Member")}</strong></p>
          ${perms.rank?.description ? `<p class="sp-muted">${esc(perms.rank.description)}</p>` : ""}
          ${powers.length ? `<p class="sp-caption">Your position ${esc(powers.join(", "))}.</p>` : ""}
          <p class="sp-caption">Member since ${esc(new Date(state.membership.joined_at).toLocaleDateString())}${perms.muted ? ` · messages paused until ${esc(new Date(state.membership.muted_until).toLocaleString())}` : ""}</p>
        </div></section>
      <section class="sp-section"><h2>Agreements</h2><div data-signer></div></section>
      <section class="sp-section"><h2>Rise to a higher position</h2><div data-advance></div></section>
      ${perms.founder ? "" : `<section class="sp-section"><h2>Leaving</h2><div class="sp-actions"><button class="button button--ghost" type="button" data-leave>Leave ${esc(coven.name)}</button></div><p class="cv-status" role="status" aria-live="polite" data-leave-status></p></section>`}`;

    signer(pane.querySelector("[data-signer]"), () => refresh("path"));

    const advance = pane.querySelector("[data-advance]");
    const history = advancements.filter((a) => a.status !== "pending").slice(0, 5);
    const historyHtml = history.length
      ? `<div class="sp-list">${history.map((a) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(rankName(a.rank_id))} · ${esc(a.status)}</span>${a.reviewer_note ? `<span class="sp-row__detail">${esc(a.reviewer_note)}</span>` : ""}<span class="sp-row__detail">${esc(L.relativeTime(a.decided_at || a.created_at))}</span></span></div>`).join("")}</div>`
      : "";
    if (pending) {
      advance.innerHTML = `<div class="sp-card"><p>You’ve asked to become <strong>${esc(rankName(pending.rank_id))}</strong>. The coven’s reviewers will decide.</p>
          ${pending.statement ? `<div class="cv-doc">${prose(pending.statement)}</div>` : ""}
          <div class="sp-actions"><button class="button button--ghost" type="button" data-withdraw>Withdraw this request</button></div>
          <p class="cv-status" role="status" aria-live="polite" data-status></p></div>${historyHtml}`;
      const button = advance.querySelector("[data-withdraw]");
      button.addEventListener("click", async () => {
        if (await UI.busy(button, advance.querySelector("[data-status]"), () => D.withdraw("advancement", pending.id).then(() => true))) refresh("path");
      });
    } else if (!options.length) {
      advance.innerHTML = `<p class="sp-caption">No higher positions are open to apply for right now.</p>${historyHtml}`;
    } else {
      advance.innerHTML = `<form class="sp-card" data-advance-form>
          <div class="sp-field"><label for="adv-rank">Position</label>
            <select id="adv-rank" name="rank">${options.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join("")}</select></div>
          <p class="sp-caption" data-adv-requirements></p>
          <div class="sp-field"><label for="adv-statement">Why you’re ready, and how you’ve met what it asks</label>
            <textarea id="adv-statement" name="statement" maxlength="4000" required></textarea></div>
          <div class="sp-actions"><button class="button button--primary" type="submit" ${state.standing.ok ? "" : "disabled"}>Ask to advance</button></div>
          ${state.standing.ok ? "" : `<p class="sp-caption">${esc(state.standing.reasons.join(" "))}</p>`}
          <p class="cv-status" role="status" aria-live="polite" data-status></p></form>${historyHtml}`;
      const form = advance.querySelector("[data-advance-form]");
      const req = form.querySelector("[data-adv-requirements]");
      const showReq = () => {
        const r = options.find((o) => o.id === form.elements.rank.value);
        req.textContent = [r?.description, r?.requirements ? `Asks: ${r.requirements}` : ""].filter(Boolean).join(" ");
      };
      form.elements.rank.addEventListener("change", showReq);
      showReq();
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (await UI.busy(form, form.querySelector("[data-status]"), () => D.requestAdvancement(coven.id, form.elements.rank.value, form.elements.statement.value))) refresh("path");
      });
    }

    const leave = pane.querySelector("[data-leave]");
    leave?.addEventListener("click", async () => {
      if (!(await UI.confirmAction(`Leave ${coven.name}?`, "You’ll lose your position. You can apply again later.", "Leave"))) return;
      if (await UI.busy(leave, pane.querySelector("[data-leave-status]"), () => D.leave(coven.id).then(() => true))) global.location.assign(href("/covens/"));
    });
  }

  // --- live connection -----------------------------------------------------

  function connect() {
    const { perms, context, coven } = state;
    if (live || !(perms.member || perms.site) || !context.user) return;
    live = D.live(coven.id, {
      onMessage: (change) => global.CovenChat?.onChange?.(change),
      onAltar: (change) => global.CovenAltar?.onChange?.(change),
      onPresence: (presence) => {
        state.presence = Object.values(presence).map((list) => list[0]).filter(Boolean);
        global.CovenChat?.onPresence?.(state.presence);
        global.CovenAltar?.onPresence?.(state.presence);
      },
      onStatus: (status) => global.CovenChat?.onStatus?.(status)
    });
  }

  // --- start ---------------------------------------------------------------

  doc.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-tab]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button) return;
    event.preventDefault();
    global.history.pushState(null, "", link.getAttribute("href"));
    draw(currentTab());
    global.scrollTo(0, 0);
  });
  global.addEventListener("popstate", () => state.coven && draw(currentTab()));
  global.addEventListener("pagehide", () => live?.close());

  UI.boot()
    .then(async (context) => {
      state.context = context;
      if (!slug) return global.location.replace(href("/covens/"));
      await load();
      if (!state.coven) {
        root.innerHTML = `${header({ title: "Coven not found", eyebrow: "Covens", back: "/covens/", backLabel: "All covens" })}<p>This coven doesn’t exist, or it isn’t open to view right now.</p>`;
        return;
      }
      connect();
      draw(currentTab());
    })
    .catch((error) => {
      console.error(error);
      root.innerHTML = `<h1>Coven</h1><p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
    });
})(window);
