/*
 * Coven moderation (/covens/moderation/), for Salt & Sovereignty's site
 * moderators: every report, every coven (to open, pause or archive), site
 * bans, and, for admins, who the moderators are. Moderators can also open
 * any coven and see its gathering, altar and members from the coven page.
 * The database only answers these for user_roles 'admin' or 'moderator'.
 */
(function (global) {
  "use strict";

  const root = global.document.querySelector("[data-page-root]");
  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose, href } = UI;
  const { header } = global.GuidesUI;

  let context = null;
  let view = "reports";
  let reportFilter = "open";

  const reasonLabel = (value) => L.REPORT_REASONS.find((r) => r.value === value)?.label || value;
  const covenLink = (c) => (c ? `<a href="${esc(href(`/covens/coven/?c=${encodeURIComponent(c.slug)}`))}">${esc(c.name)}</a>` : "—");
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;

  function shell() {
    const views = [["reports", "Reports"], ["heads", "Heads gone"], ["covens", "Covens"], ["bans", "Site bans"], ...(context.admin ? [["moderators", "Moderators"]] : [])];
    root.innerHTML = `${header({ title: "Coven moderation", eyebrow: "Covens", back: "/covens/", backLabel: "All covens" })}
      <p class="sp-caption">You can open any coven, read its gathering and altar, remove messages and act on its members. Reports come here, never to coven leaders.</p>
      <nav class="cv-tabs" aria-label="Moderation">${views.map(([key, label]) => `<button type="button" class="cv-tab" data-view="${key}"${key === view ? ' aria-current="page"' : ""}>${esc(label)}</button>`).join("")}</nav>
      <div data-pane><p class="sp-caption">Loading…</p></div>`;
    root.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => {
      view = b.dataset.view;
      draw();
    }));
  }

  async function reports(pane) {
    const rows = await D.reports(reportFilter);
    await UI.loadNames(context, rows.flatMap((r) => [r.reporter_id, r.target_user_id, r.resolved_by]));
    const card = (r) => `<article class="sp-card" data-report="${esc(r.id)}">
        <div class="cv-meta"><span class="cv-pill${r.status === "open" ? " cv-pill--warn" : ""}">${esc(r.status)}</span><span class="cv-pill">${esc(r.target_type.replace("_", " "))}</span><span class="cv-pill">${esc(reasonLabel(r.reason))}</span></div>
        <p class="sp-caption">${esc(L.relativeTime(r.created_at))} · reported by ${esc(r.reporter_id ? UI.nameOf(context, r.reporter_id) : "a deleted account")} · coven ${covenLink(r.covens)}</p>
        ${r.target_user_id ? `<p>About: <strong>${esc(UI.nameOf(context, r.target_user_id))}</strong> <span class="sp-caption">(${esc(r.target_user_id)})</span></p>` : ""}
        ${r.snapshot ? `<blockquote class="cv-doc sp-notice">${prose(r.snapshot)}</blockquote>` : ""}
        ${r.details ? `<p><strong>Reporter’s note</strong><br />${prose(r.details)}</p>` : ""}
        ${r.resolution_note ? `<p class="sp-caption">Resolution: ${esc(r.resolution_note)}${r.resolved_by ? ` · ${esc(UI.nameOf(context, r.resolved_by))}` : ""}</p>` : ""}
        <form class="sp-section" data-resolve>
          <div class="sp-field"><label for="res-${esc(r.id)}">Note</label><textarea id="res-${esc(r.id)}" name="note" maxlength="2000">${esc(r.resolution_note || "")}</textarea></div>
          <div class="sp-actions">
            <button class="button button--ghost button--small" type="submit" data-status-value="reviewing">Mark reviewing</button>
            <button class="button button--primary button--small" type="submit" data-status-value="resolved">Resolved</button>
            <button class="button button--ghost button--small" type="submit" data-status-value="dismissed">Dismiss</button>
            ${r.target_type === "message" && r.target_id ? `<button class="button button--ghost button--small" type="button" data-remove-message="${esc(r.target_id)}">Remove the message</button>` : ""}
            ${r.target_user_id ? `<button class="button button--ghost button--small" type="button" data-ban="${esc(r.target_user_id)}">Ban from all covens</button>` : ""}
            ${r.covens ? `<button class="button button--ghost button--small" type="button" data-pause="${esc(r.coven_id)}">Pause the coven</button>` : ""}
          </div>${statusLine()}</form>
      </article>`;
    pane.innerHTML = `<div class="sp-chips" role="group" aria-label="Show">${["open", "reviewing", "resolved", "dismissed", "all"].map((s) => `<button type="button" class="sp-chip" data-filter="${s}" aria-pressed="${s === reportFilter}">${esc(s[0].toUpperCase() + s.slice(1))}</button>`).join("")}</div>
      ${rows.length ? rows.map(card).join("") : `<p class="sp-empty">No ${reportFilter === "all" ? "" : `${reportFilter} `}reports.</p>`}`;
    pane.querySelectorAll("[data-filter]").forEach((b) => b.addEventListener("click", () => {
      reportFilter = b.dataset.filter;
      draw();
    }));
    pane.querySelectorAll("[data-report]").forEach((cardEl) => {
      const id = cardEl.dataset.report;
      const form = cardEl.querySelector("[data-resolve]");
      const status = form.querySelector("[data-status]");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (await UI.busy(form, status, () => D.resolveReport(id, event.submitter.dataset.statusValue, form.elements.note.value).then(() => true))) draw();
      });
      cardEl.querySelector("[data-remove-message]")?.addEventListener("click", async (event) => {
        await UI.busy(event.currentTarget, status, () => D.removeMessage(event.currentTarget.dataset.removeMessage), { done: "Message removed. Its words stay in this report." });
      });
      cardEl.querySelector("[data-ban]")?.addEventListener("click", async (event) => {
        const userId = event.currentTarget.dataset.ban;
        if (!(await UI.confirmAction(`Ban ${UI.nameOf(context, userId)} from all covens?`, "They keep their Sanctuary account but can’t join, speak in or tend any coven.", "Ban"))) return;
        await UI.busy(event.currentTarget, status, () => D.ban(userId, form.elements.note.value || reasonLabel(rows.find((r) => r.id === id)?.reason)), { done: "Banned." });
      });
      cardEl.querySelector("[data-pause]")?.addEventListener("click", async (event) => {
        if (!(await UI.confirmAction("Pause this coven?", "Members can still read it, but nothing new can be added until you reopen it.", "Pause"))) return;
        await UI.busy(event.currentTarget, status, () => D.moderateCoven(event.currentTarget.dataset.pause, "suspended", form.elements.note.value), { done: "Coven paused." });
      });
    });
  }

  async function covens(pane) {
    const rows = await D.allCovens();
    await UI.loadNames(context, rows.map((c) => c.founder_id));
    let query = "";
    const drawRows = () => {
      const list = L.filterDirectory(rows, { query });
      pane.querySelector("[data-rows]").innerHTML = `<div class="cv-scroll"><table class="cv-table"><thead><tr><th>Coven</th><th>Founder</th><th>Members</th><th>Status</th><th>Action</th></tr></thead><tbody>${list
        .map((c) => `<tr data-coven="${esc(c.id)}"><td>${covenLink(c)}<br /><span class="sp-caption">${esc(c.joining)} · ${esc(c.visibility)} · ${esc(new Date(c.created_at).toLocaleDateString())}</span></td>
          <td>${esc(c.founder_id ? UI.nameOf(context, c.founder_id) : "—")}</td><td>${Number(c.member_count) || 0}</td>
          <td>${esc(c.status)}${c.moderation_note ? `<br /><span class="sp-caption">${esc(c.moderation_note)}</span>` : ""}</td>
          <td><select aria-label="Set status for ${esc(c.name)}" data-set-status>${["active", "suspended", "archived"].map((s) => `<option value="${s}"${s === c.status ? " selected" : ""}>${s === "suspended" ? "paused" : s}</option>`).join("")}</select></td></tr>`)
        .join("")}</tbody></table></div>`;
    };
    pane.innerHTML = `<div class="sp-field"><label for="mod-search">Search covens</label><input id="mod-search" type="search" /></div>
      <div class="sp-field"><label for="mod-note">Note shown to a coven’s members when you pause it (optional)</label><input id="mod-note" maxlength="1000" /></div>
      ${statusLine()}<div data-rows></div>`;
    drawRows();
    pane.querySelector("#mod-search").addEventListener("input", (event) => {
      query = event.target.value;
      drawRows();
    });
    pane.addEventListener("change", async (event) => {
      const select = event.target.closest("[data-set-status]");
      if (!select) return;
      const id = select.closest("[data-coven]").dataset.coven;
      const saved = await UI.busy(select, pane.querySelector("[data-status]"), () => D.moderateCoven(id, select.value, pane.querySelector("#mod-note").value), { done: "Saved." });
      if (saved) Object.assign(rows.find((c) => c.id === id), saved);
      drawRows();
    });
  }

  async function bans(pane) {
    const rows = await D.bans();
    await UI.loadNames(context, rows.flatMap((b) => [b.user_id, b.banned_by]));
    pane.innerHTML = `<p class="sp-caption">Banned people keep their Sanctuary account but can’t take part in any coven. Ban someone from a report, or by their account id here.</p>
      <form class="cv-inline-form" data-ban-form>
        <div class="sp-field"><label for="ban-id">Account id</label><input id="ban-id" name="user_id" required pattern="[0-9a-fA-F-]{36}" /></div>
        <div class="sp-field"><label for="ban-reason">Reason</label><input id="ban-reason" name="reason" maxlength="1000" /></div>
        <button class="button button--primary button--small" type="submit">Ban</button></form>${statusLine()}
      ${rows.length ? `<div class="sp-list">${rows
        .map((b) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(UI.nameOf(context, b.user_id))}</span><span class="sp-row__detail">${esc(b.reason || "No reason given")} · ${esc(L.relativeTime(b.created_at))}${b.banned_by ? ` · by ${esc(UI.nameOf(context, b.banned_by))}` : ""}</span><span class="sp-row__detail">${esc(b.user_id)}</span></span>
          <button class="button button--ghost button--small" type="button" data-lift="${esc(b.user_id)}">Lift</button></div>`)
        .join("")}</div>` : `<p class="sp-empty">No one is banned.</p>`}`;
    const form = pane.querySelector("[data-ban-form]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (await UI.busy(form, pane.querySelector("[data-status]"), () => D.ban(form.elements.user_id.value.trim(), form.elements.reason.value.trim()).then(() => true))) draw();
    });
    pane.querySelectorAll("[data-lift]").forEach((b) => b.addEventListener("click", async () => {
      if (await UI.busy(b, pane.querySelector("[data-status]"), () => D.liftBan(b.dataset.lift).then(() => true))) draw();
    }));
  }

  async function moderators(pane) {
    const rows = await D.moderators();
    pane.innerHTML = `<p class="sp-caption">Moderators can see and act on every coven. Admins can also name moderators.</p>
      <form class="cv-inline-form" data-mod-form>
        <div class="sp-field"><label for="mod-email">Their Sanctuary account email</label><input id="mod-email" name="email" type="email" required /></div>
        <button class="button button--primary button--small" type="submit">Make moderator</button></form>${statusLine()}
      <div class="sp-list">${rows
        .map((m) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(m.display_name || m.email || m.user_id)}</span><span class="sp-row__detail">${esc(m.role)}${m.email ? ` · ${esc(m.email)}` : ""}</span></span>
          ${m.role === "moderator" && m.email ? `<button class="button button--ghost button--small" type="button" data-stand-down="${esc(m.email)}">Stand down</button>` : ""}</div>`)
        .join("")}</div>`;
    const form = pane.querySelector("[data-mod-form]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (await UI.busy(form, pane.querySelector("[data-status]"), () => D.setModerator(form.elements.email.value.trim(), true))) draw();
    });
    pane.querySelectorAll("[data-stand-down]").forEach((b) => b.addEventListener("click", async () => {
      if (await UI.busy(b, pane.querySelector("[data-status]"), () => D.setModerator(b.dataset.standDown, false))) draw();
    }));
  }

  /**
   * "The head can't be reached": what elders sent, with the coven, how long
   * the head has been away and its succession plan (as the app's
   * coven/moderation.tsx). Hand the coven on, or close the report.
   */
  async function heads(pane) {
    const LD = global.CovenLineageData;
    const Lx = global.SaltCore?.covens?.lineage;
    if (!LD || !Lx) return (pane.innerHTML = `<p class="sp-notice">This part couldn’t load. Please refresh the page.</p>`);
    const rows = await LD.headReports();
    pane.innerHTML = rows.length
      ? rows.map((r) => {
          const candidates = Lx.transferCandidates(r);
          return `<form class="sp-card" data-head-report="${esc(r.id)}">
            <p class="sp-eyebrow">${r.status === "open" ? "Head can’t be reached" : r.status === "transferred" ? "Handed on" : "Closed"}</p>
            <h3>${covenLink(r.coven)}</h3>
            <p>Head: ${esc(r.head.name || "a deleted account")} · not seen for ${esc(Lx.inactiveFor(r.last_active_at))} · ${Number(r.coven.members) || 0} member${Number(r.coven.members) === 1 ? "" : "s"}</p>
            ${r.coven.mother ? `<p class="sp-caption">A daughter coven of ${esc(r.coven.mother.name)}: its head can also choose who leads it.</p>` : ""}
            <p class="sp-caption">Sent by ${esc(r.reported_by.name || "an elder")} ${esc(L.relativeTime(r.created_at))}${r.note ? `: “${esc(r.note)}”` : ""}</p>
            <p class="sp-caption">Succession plan: ${esc(r.successors.length ? r.successors.map((s) => `${s.name || "A witch"}${s.which === 2 ? " (second)" : ""}${s.active ? "" : " (no longer a member)"}`).join(", ") : "no one named")}</p>
            ${r.status === "open" ? `${candidates.length ? `<div class="sp-field"><label for="to-${esc(r.id)}">Hand the coven to</label><select id="to-${esc(r.id)}" name="to">${candidates.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join("")}</select></div>` : `<p class="sp-caption">No one named or leading with the head. You can still pause or archive the coven under Covens.</p>`}
              <div class="sp-field"><label for="note-${esc(r.id)}">Note (kept with the report)</label><textarea id="note-${esc(r.id)}" name="note" maxlength="2000"></textarea></div>
              <div class="sp-actions">${candidates.length ? `<button class="button button--primary button--small" type="submit" value="transfer">Hand it on</button>` : ""}<button class="button button--ghost button--small" type="submit" value="close">Close without changing</button></div>` : ""}
            ${statusLine()}</form>`;
        }).join("")
      : `<p class="sp-caption">No coven has told you its head can’t be reached.</p>`;
    pane.querySelectorAll("[data-head-report]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const report = rows.find((r) => r.id === form.dataset.headReport);
        const to = event.submitter?.value === "transfer" ? form.elements.to?.value : null;
        if (await UI.busy(form, form.querySelector("[data-status]"), () => LD.resolveHeadReport(report, to, form.elements.note.value).then(() => true))) draw();
      })
    );
  }

  async function draw() {
    shell();
    const pane = root.querySelector("[data-pane]");
    try {
      await ({ reports, heads, covens, bans, moderators }[view] || reports)(pane);
    } catch (error) {
      console.error(error);
      pane.innerHTML = `<p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
    }
  }

  UI.boot().then((ctx) => {
    context = ctx;
    if (!ctx.user) {
      root.innerHTML = `${header({ title: "Coven moderation", eyebrow: "Covens", back: "/covens/", backLabel: "All covens" })}${UI.signInCard("moderate covens")}`;
      return;
    }
    if (!ctx.siteModerator) {
      root.innerHTML = `${header({ title: "Coven moderation", eyebrow: "Covens", back: "/covens/", backLabel: "All covens" })}<p class="sp-notice">This page is for Salt &amp; Sovereignty’s moderators.</p>`;
      return;
    }
    draw();
  });
})(window);
