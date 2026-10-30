/*
 * A coven's Members, Review and Manage tabs.
 *
 * Members: everyone in the coven by position (and the heads of covens above
 *   it, "Mother coven"); the coven's moderators can mute or remove people,
 *   reviewers can raise them, and the head can hand the coven on, choosing
 *   what they keep (covens/coven/lineage.js).
 * Review: training to sign off (covens/coven/programs.js), applications to
 *   join and requests to rise to a higher position.
 * Manage: the coven's details, its creed, rules, requirements and agreements,
 *   its positions, inviting people (the Invite tab, covens/coven/invite.js)
 *   and the questions it asks people who apply.
 * The database checks every one of these (supabase/migrations/…_covens.sql).
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;

  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;

  // --- Members -------------------------------------------------------------

  // A member's "in moon time" status, shared (Cycle & Moon, strictly opt-in)
  // with this coven or with you: the same words as app/src/lib/cycle/status.ts.
  const MOON_STATUS = { moon_time: "In moon time", moon_time_resting: "In moon time · resting", resting: "Resting · gentle days", quiet: "Keeping quiet for a few days" };
  async function moonStatuses(covenId) {
    try {
      const { data, error } = await global.db.rpc("cycle_moon_statuses", { p_coven: covenId });
      return error || !Array.isArray(data) ? new Map() : new Map(data.filter((r) => MOON_STATUS[r.status]).map((r) => [r.user_id, r.status]));
    } catch {
      return new Map();
    }
  }

  const CovenMembers = {
    async mount(pane, state, { refresh, covenHref }) {
      pane.innerHTML = `<p class="sp-caption">Gathering the members…</p>`;
      const keepsRecord = Boolean(global.CovenRecordAccess?.seesRecord(state));
      const recordHref = (userId) => `${covenHref("record")}${userId ? `&member=${encodeURIComponent(userId)}` : ""}`;
      const [members, signatures, enrollments, programs, moons] = await Promise.all([
        D.members(state.coven.id).catch(() => []),
        state.perms.review || state.perms.site ? D.covenSignatures(state.coven.id).catch(() => []) : Promise.resolve(null),
        // Their training, as far as you may see it (their mentor, those who keep progress, the head).
        state.perms.member ? D.enrollments(state.coven.id).catch(() => []) : Promise.resolve([]),
        state.perms.member ? D.programs(state.coven.id).catch(() => []) : Promise.resolve([]),
        state.perms.member ? moonStatuses(state.coven.id) : Promise.resolve(new Map())
      ]);
      const trainingHtml = (userId) => {
        const theirs = enrollments.filter((e) => e.user_id === userId && e.status !== "withdrawn");
        if (!theirs.length) return "";
        const title = (id) => programs.find((p) => p.id === id)?.title || "A program";
        return `<p class="sp-caption"><strong>Training:</strong> ${theirs
          .map((e) => `<a href="${esc(`${covenHref("programs")}&program=${encodeURIComponent(e.program_id)}&person=${encodeURIComponent(e.user_id)}`)}" data-tab="programs">${esc(title(e.program_id))}</a>`)
          .join(", ")} <span class="sp-muted">(open their path to sign off steps)</span></p>`;
      };
      await UI.loadNames(state.context, members.map((m) => m.user_id));
      const { perms, context, coven } = state;
      const me = context.user?.id;
      // The head's own membership, for what they keep when they hand on (covens/coven/lineage.js).
      state.headMembership = members.find((m) => m.user_id === coven.founder_id && m.status === "active") || null;
      state.activeMembers = members.filter((m) => m.status === "active");
      const LU = global.CovenLineageUI;
      const levelOf = (m) => (m.user_id === coven.founder_id ? 1000 : state.ranks.find((r) => r.id === m.rank_id)?.level || 0);
      const active = members.filter((m) => m.status === "active").sort((a, b) => levelOf(b) - levelOf(a) || new Date(a.joined_at) - new Date(b.joined_at));
      const grantable = L.grantableRanks(state.ranks, perms);
      const agreements = state.documents.filter((d) => d.requires_signature && d.published);
      const unsignedCount = (userId) => (signatures ? L.unsignedAgreements(agreements, signatures, userId).length : 0);
      const actsOn = (m) => m.user_id !== me && (perms.site || (m.user_id !== coven.founder_id && levelOf(m) < perms.level));

      const row = (m) => {
        const profile = context.names.get(m.user_id) || {};
        const rank = state.ranks.find((r) => r.id === m.rank_id);
        const muted = m.muted_until && new Date(m.muted_until) > new Date();
        const missing = unsignedCount(m.user_id);
        const manageable = actsOn(m) && (perms.review || perms.moderate || perms.site);
        return `<details class="sp-details" data-member="${esc(m.user_id)}">
            <summary>${esc(profile.display_name || "A witch")}${profile.pronouns ? ` <span class="sp-muted">(${esc(profile.pronouns)})</span>` : ""} · ${esc(m.user_id === coven.founder_id ? `${rank?.name || "Leader"} · founder` : rank?.name || "Member")}
              ${muted ? ` · <span class="sp-muted">paused</span>` : ""}${missing ? ` · <span class="sp-muted">needs to sign</span>` : ""}${m.visiting_from ? ` · <span class="sp-muted">visiting from a daughter coven</span>` : ""}${moons.has(m.user_id) ? ` · <span class="sp-muted" data-moon-status>☾ ${esc(MOON_STATUS[moons.get(m.user_id)])}</span>` : ""}</summary>
            <div class="sp-section">
              ${profile.bio ? `<p class="cv-doc">${prose(profile.bio)}</p>` : ""}
              <p class="sp-caption">Joined ${esc(new Date(m.joined_at).toLocaleDateString())}${muted ? ` · messages paused until ${esc(new Date(m.muted_until).toLocaleString())}` : ""}</p>
              ${trainingHtml(m.user_id)}
              ${manageable ? `<form class="cv-inline-form" data-member-form>
                ${grantable.length && (perms.review || perms.site) ? `<div class="sp-field"><label>Position<select name="rank_id">${grantable.map((r) => `<option value="${esc(r.id)}"${r.id === m.rank_id ? " selected" : ""}>${esc(r.name)}</option>`).join("")}</select></label></div>
                  <button class="button button--ghost button--small" type="submit" data-act="rank">Change position</button>` : ""}
                ${perms.moderate || perms.site ? `<div class="sp-field"><label>Pause messages<select name="mute"><option value="">—</option><option value="1">1 hour</option><option value="24">1 day</option><option value="168">1 week</option>${muted ? `<option value="clear">Lift the pause</option>` : ""}</select></label></div>
                  <button class="button button--ghost button--small" type="submit" data-act="mute">Apply</button>
                  <button class="button button--ghost button--small" type="submit" data-act="removed">Remove from coven</button>
                  <button class="button button--ghost button--small" type="submit" data-act="banned">Ban from coven</button>` : ""}
                ${perms.founder || perms.site ? `<button class="button button--ghost button--small" type="submit" data-act="transfer">Hand on leadership</button>${LU ? LU.handOnFields(state, m) : ""}` : ""}
              </form>${statusLine()}` : ""}
              ${m.user_id !== me || keepsRecord ? `<div class="sp-actions">${keepsRecord ? `<a class="button button--ghost button--small" href="${esc(recordHref(m.user_id))}" data-tab="record">Their record</a>` : ""}${m.user_id !== me ? `<button class="button button--ghost button--small" type="button" data-report-member>Report</button>` : ""}</div>` : ""}
            </div></details>`;
      };

      const formerCount = members.length - active.length;
      pane.innerHTML = `${keepsRecord ? `<p class="sp-caption"><a href="${esc(recordHref())}" data-tab="record">Members’ record</a>: who has been taking part and who hasn’t.</p>` : ""}${state.perms.member ? `<p class="sp-caption">Your own standing is under <a href="${esc(covenHref("path"))}" data-tab="path">My standing</a>.</p>` : ""}
        ${LU ? LU.headsAboveHtml(state) : ""}
        <section class="sp-section"><h2>${active.length} member${active.length === 1 ? "" : "s"}</h2>${active.map(row).join("")}</section>
        ${formerCount && (perms.moderate || perms.site) ? `<details class="sp-details"><summary>Former members (${formerCount})</summary><div class="sp-list">${members
          .filter((m) => m.status !== "active")
          .map((m) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(UI.nameOf(context, m.user_id))}</span><span class="sp-row__detail">${esc({ left: "Left", removed: "Removed", banned: "Banned from the coven" }[m.status] || m.status)}</span></span>
            ${m.status === "banned" ? `<button class="button button--ghost button--small" type="button" data-restore="${esc(m.user_id)}">Lift the ban (they may apply again)</button>` : ""}</div>`)
          .join("")}</div></details>` : ""}`;

      pane.querySelectorAll("[data-member]").forEach((details) => {
        const userId = details.dataset.member;
        const name = UI.nameOf(context, userId);
        details.querySelector("[data-report-member]")?.addEventListener("click", () => UI.report({ target_type: "member", target_id: userId, target_user_id: userId, coven_id: coven.id, label: name }));
        const form = details.querySelector("[data-member-form]");
        // Handing on asks what the head who steps back keeps (covens/coven/lineage.js).
        if (form && LU) LU.wireHandOn(form, state, members.find((x) => x.user_id === userId), () => refresh("members"));
        form?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const act = event.submitter?.dataset.act;
          if (act === "handon" || (act === "transfer" && LU)) return;
          const status = details.querySelector("[data-status]");
          let work = null;
          if (act === "rank") work = () => D.updateMember(coven.id, userId, { rank_id: form.elements.rank_id.value });
          if (act === "mute") {
            const value = form.elements.mute.value;
            if (!value) return UI.setStatus(status, "Choose how long to pause their messages.", true);
            work = () => D.updateMember(coven.id, userId, value === "clear" ? { clear_mute: true } : { muted_until: new Date(Date.now() + Number(value) * 3600000).toISOString() });
          }
          if (act === "removed" || act === "banned") {
            const ok = await UI.confirmAction(act === "banned" ? `Ban ${name} from the coven?` : `Remove ${name} from the coven?`, act === "banned" ? "They won’t be able to rejoin or apply again." : "They can apply again later.", act === "banned" ? "Ban" : "Remove");
            if (!ok) return;
            work = () => D.updateMember(coven.id, userId, { status: act });
          }
          if (act === "transfer") {
            const ok = await UI.confirmAction(`Make ${name} the coven’s leader?`, "They become its founder, with every power over the coven. You stay a member in your current position.", "Hand on");
            if (!ok) return;
            work = () => D.transfer(coven.id, userId);
          }
          if (work && (await UI.busy(form, status, work, { done: "Done." }))) refresh("members");
        });
      });
      pane.querySelectorAll("[data-restore]").forEach((button) =>
        button.addEventListener("click", async () => {
          if (await UI.busy(button, null, () => D.updateMember(coven.id, button.dataset.restore, { status: "removed" }).then(() => true))) refresh("members");
        })
      );
    }
  };

  // --- Review --------------------------------------------------------------

  const CovenReview = {
    async mount(pane, state, { refresh, covenHref }) {
      pane.innerHTML = `<p class="sp-caption">Gathering requests…</p>`;
      const { coven, context } = state;
      const [applications, advancements, signatures, decided] = await Promise.all([D.applications(coven.id), D.advancements(coven.id), D.covenSignatures(coven.id).catch(() => []), D.applications(coven.id, "all").catch(() => [])]);
      await UI.loadNames(context, [...applications, ...advancements, ...decided].flatMap((r) => [r.user_id, r.reviewer_id]));
      const questions = L.normalizeQuestions(coven.application_questions);
      const agreements = state.documents.filter((d) => d.requires_signature && d.published);
      const rankName = (id) => state.ranks.find((r) => r.id === id)?.name || "a position";
      const profile = (id) => context.names.get(id) || {};

      const decision = (kind, id) => `<form class="sp-section" data-decide="${kind}" data-id="${esc(id)}">
          <div class="sp-field"><label for="note-${esc(id)}">Note to them (optional)</label><textarea id="note-${esc(id)}" name="note" maxlength="2000"></textarea></div>
          <div class="sp-actions"><button class="button button--primary button--small" type="submit" data-approve="1">Approve</button><button class="button button--ghost button--small" type="submit" data-approve="0">Decline</button></div>
          ${statusLine()}</form>`;

      const appCard = (a) => {
        const p = profile(a.user_id);
        const missing = L.unsignedAgreements(agreements, signatures, a.user_id);
        return `<article class="sp-card">
            <h3>${esc(p.display_name || "A witch")}${p.pronouns ? ` <span class="sp-muted">(${esc(p.pronouns)})</span>` : ""}</h3>
            <p class="sp-caption">Applied ${esc(L.relativeTime(a.created_at))}${missing.length ? ` · hasn’t signed the current ${missing.map((d) => d.title).join(", ")}` : " · has signed the agreements"}</p>
            ${p.bio ? `<p class="cv-doc">${prose(p.bio)}</p>` : ""}
            ${questions.map((q) => `<p><strong>${esc(q.prompt)}</strong><br />${prose(a.answers?.[q.id] || "—")}</p>`).join("")}
            ${Object.entries(a.answers || {}).filter(([key]) => !questions.some((q) => q.id === key)).map(([, value]) => `<p>${prose(value)}</p>`).join("")}
            ${a.message ? `<p><strong>Their note</strong><br />${prose(a.message)}</p>` : ""}
            ${decision("application", a.id)}
            <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-report-app="${esc(a.id)}" data-user="${esc(a.user_id)}">Report</button></div>
          </article>`;
      };

      const advCard = (a) => {
        const wanted = state.ranks.find((r) => r.id === a.rank_id);
        return `<article class="sp-card">
            <h3>${esc(profile(a.user_id).display_name || "A witch")} → ${esc(rankName(a.rank_id))}</h3>
            <p class="sp-caption">Asked ${esc(L.relativeTime(a.created_at))}</p>
            <div data-adv-extra="${esc(a.id)}"></div>
            ${wanted?.requirements ? `<p class="sp-caption">In their words, the position asks</p><div class="cv-doc">${prose(wanted.requirements)}</div>` : ""}
            <p><strong>Why they’re ready</strong><br />${prose(a.statement || "—")}</p>
            ${decision("advancement", a.id)}
          </article>`;
      };

      const past = decided.filter((a) => a.status !== "pending").slice(0, 30);
      // Phone notes for new requests here (Reminders → Coven requests), as the app's Review screen shows them.
      const saved = state.perms.review && context.user ? await Promise.resolve(global.SaltSettings?.get?.()).catch(() => null) : null;
      const wanted = global.SaltCore?.covens?.requests?.requestsWanted?.(saved?.reminders_v2 || "", coven.id) ?? true;
      const notes = state.perms.review && context.user
        ? `<p class="sp-caption">Phone notes for new applications here: <strong>${wanted ? "on" : "off"}</strong>. <a href="${esc(UI.href("/reminders/#gd-requests"))}">Change them in Reminders</a> (they ring phones with the app; this page shows the count while it’s open).</p>`
        : "";
      pane.innerHTML = `${notes}<div data-training></div><div data-proposals></div><section class="sp-section"><h2>Applications to join</h2>${applications.length ? applications.map(appCard).join("") : `<p class="sp-empty">No applications are waiting.</p>`}</section>
        <section class="sp-section"><h2>Requests to advance</h2>${advancements.length ? advancements.map(advCard).join("") : `<p class="sp-empty">No requests are waiting.</p>`}</section>
        ${past.length ? `<details class="sp-details"><summary>Decided applications</summary><div class="sp-list">${past
          .map((a) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(profile(a.user_id).display_name || "A witch")} · ${esc(a.status)}</span>
            <span class="sp-row__detail">${esc(L.relativeTime(a.decided_at || a.created_at))}${a.reviewer_id ? ` · by ${esc(UI.nameOf(context, a.reviewer_id))}` : ""}${a.reviewer_note ? ` · “${esc(a.reviewer_note)}”` : ""}</span></span></div>`)
          .join("")}</div></details>` : ""}`;

      pane.querySelectorAll("[data-decide]").forEach((form) =>
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          const approve = event.submitter?.dataset.approve === "1";
          const note = form.elements.note.value;
          if (form.dataset.decide === "advancement") {
            // Full, or something still to tick (covens/coven/positions.js reviewPanel).
            if (approve && form.dataset.blocked) return UI.setStatus(form.querySelector("[data-status]"), form.closest("article")?.querySelector("[data-block]")?.textContent || "This can’t be approved yet.", true);
            const ticks = JSON.parse(form.dataset.ticks || "[]");
            // A full position: approved onto its waiting list (covens/coven/queue.js).
            if (approve && form.dataset.full) {
              if (await UI.busy(form, form.querySelector("[data-status]"), () => D.queueAdvancement(form.dataset.id, note, ticks))) refresh("review");
              return;
            }
            if (await UI.busy(form, form.querySelector("[data-status]"), () => D.decideAdvancement(form.dataset.id, approve, note, ticks))) refresh("review");
            return;
          }
          if (await UI.busy(form, form.querySelector("[data-status]"), () => D.decideApplication(form.dataset.id, approve, note))) refresh("review");
        })
      );
      // Training to sign off, at the top (covens/coven/programs.js).
      if (global.CovenPrograms?.trainingToSignOff && covenHref) global.CovenPrograms.trainingToSignOff(pane.querySelector("[data-training]"), state, { covenHref }).catch(() => {});
      // A place freed in a full position, for the head and leaders: who is next in line.
      if (global.CovenQueue) global.CovenQueue.proposals(pane.querySelector("[data-proposals]"), state, { refresh });
      pane.querySelectorAll("[data-report-app]").forEach((button) => button.addEventListener("click", () => UI.report({ target_type: "application", target_id: button.dataset.reportApp, target_user_id: button.dataset.user, coven_id: coven.id, label: "this application" })));
      // Each request's checklist, ticks, answers and places left (as the app's Review).
      if (advancements.length && global.CovenPositions) {
        const overview = await D.positionsOverview(coven.id);
        advancements.forEach((a) => global.CovenPositions.reviewPanel(pane.querySelector(`[data-adv-extra="${CSS.escape(a.id)}"]`), state, a, overview?.holders ?? null));
      }
    }
  };

  // --- Manage --------------------------------------------------------------

  function detailsForm(coven) {
    return `<form class="sp-card" data-details>
        <h2>The coven</h2>
        <div class="sp-field"><label for="m-name">Name</label><input id="m-name" name="name" required minlength="3" maxlength="80" value="${esc(coven.name)}" /></div>
        <div class="sp-field"><label for="m-tagline">One line about the coven</label><input id="m-tagline" name="tagline" maxlength="160" value="${esc(coven.tagline || "")}" /></div>
        <div class="sp-field"><label for="m-description">Who you are and how you practise</label><textarea id="m-description" name="description" maxlength="5000" rows="6">${esc(coven.description || "")}</textarea></div>
        <div class="sp-grid-2">
          <div class="sp-field"><label for="m-tradition">Tradition or path</label><input id="m-tradition" name="tradition" maxlength="80" value="${esc(coven.tradition || "")}" /></div>
          <div class="sp-field"><label for="m-rhythm">When you gather</label><input id="m-rhythm" name="meeting_rhythm" maxlength="160" value="${esc(coven.meeting_rhythm || "")}" /></div>
        </div>
        <div class="sp-field"><label for="m-tags">Tags, separated by commas</label><input id="m-tags" name="tags" value="${esc((coven.tags || []).join(", "))}" /></div>
        <div class="sp-grid-2">
          <div class="sp-field"><label for="m-joining">How witches join</label><select id="m-joining" name="joining">${Object.entries(L.JOINING).map(([k, v]) => `<option value="${k}"${coven.joining === k ? " selected" : ""}>${esc(v.label)}</option>`).join("")}</select></div>
          <div class="sp-field"><label for="m-visibility">Directory</label><select id="m-visibility" name="visibility"><option value="listed"${coven.visibility === "listed" ? " selected" : ""}>Listed</option><option value="unlisted"${coven.visibility === "unlisted" ? " selected" : ""}>Unlisted (link only)</option></select></div>
        </div>
        <div class="sp-field"><label for="m-limit">Most members (leave empty for no limit)</label><input id="m-limit" name="member_limit" type="number" min="2" max="1000" value="${esc(coven.member_limit || "")}" /></div>
        <div class="sp-actions"><button class="button button--primary" type="submit">Save</button></div>
        ${statusLine()}
      </form>`;
  }

  function documentForm(d) {
    const id = d.id || "new";
    return `<details class="sp-details"${d.id ? "" : " open"}><summary>${d.id ? esc(d.title) : "Add a page"}${d.requires_signature ? " · to be signed" : ""}${d.published === false ? " · draft" : ""}</summary>
        <form class="sp-section" data-document="${esc(d.id || "")}">
          <div class="sp-grid-2">
            <div class="sp-field"><label for="d-title-${id}">Title</label><input id="d-title-${id}" name="title" required maxlength="120" value="${esc(d.title || "")}" /></div>
            <div class="sp-field"><label for="d-kind-${id}">Kind</label><select id="d-kind-${id}" name="kind">${L.DOCUMENT_KINDS.map((k) => `<option value="${k.kind}"${d.kind === k.kind ? " selected" : ""}>${esc(k.label)}</option>`).join("")}</select></div>
          </div>
          <div class="sp-field"><label for="d-body-${id}">Words</label><textarea id="d-body-${id}" name="body" maxlength="20000" rows="8">${esc(d.body || "")}</textarea></div>
          <div class="sp-grid-2">
            <div class="sp-field"><label for="d-vis-${id}">Who can read it</label><select id="d-vis-${id}" name="visibility"><option value="public"${d.visibility !== "members" ? " selected" : ""}>Everyone, before they join</option><option value="members"${d.visibility === "members" ? " selected" : ""}>Members only</option></select></div>
            <div class="sp-field"><label for="d-pos-${id}">Order</label><input id="d-pos-${id}" name="position" type="number" min="0" max="999" value="${esc(d.position ?? 10)}" /></div>
          </div>
          <label class="cv-check"><input type="checkbox" name="requires_signature" ${d.requires_signature ? "checked" : ""} /> <span>Members must sign this (it must be readable by everyone)</span></label>
          <label class="cv-check"><input type="checkbox" name="published" ${d.published !== false ? "checked" : ""} /> <span>Published</span></label>
          ${d.requires_signature ? `<p class="sp-caption">Version ${d.version}. Changing its title or words asks every member to sign it again before they can speak or tend the altar.</p>` : ""}
          <div class="sp-actions"><button class="button button--primary button--small" type="submit">${d.id ? "Save" : "Add"}</button>${d.id ? `<button class="button button--ghost button--small" type="button" data-delete-document="${esc(d.id)}">Delete</button>` : ""}</div>
          ${statusLine()}
        </form></details>`;
  }

  function rankForm(r) {
    const id = r.id || "new";
    const check = (name, label) => `<label class="cv-check"><input type="checkbox" name="${name}" ${r[name] ? "checked" : ""} /> <span>${label}</span></label>`;
    const power = (p) => `<label class="cv-check"><input type="checkbox" name="${p.key}" ${L.powerOn(r, p) ? "checked" : ""} /> <span>${esc(p.label)}</span></label>`;
    return `<details class="sp-details"${r.id ? "" : " open"}${r.id ? ` data-rank-details="${esc(r.id)}"` : ""}><summary>${r.id ? `${esc(r.name)} · level ${r.level}<span class="sp-caption" data-rank-status="${esc(r.id)}"></span>` : "Add a position"}</summary>
        <form class="sp-section" data-rank="${esc(r.id || "")}">
          <div class="sp-grid-2">
            <div class="sp-field"><label for="r-name-${id}">Name</label><input id="r-name-${id}" name="name" required maxlength="60" value="${esc(r.name || "")}" /></div>
            <div class="sp-field"><label for="r-level-${id}">Seniority (1 is newest; higher is more senior)</label><input id="r-level-${id}" name="level" type="number" min="1" max="99" required value="${esc(r.level || 1)}" /></div>
          </div>
          <div class="sp-field"><label for="r-desc-${id}">What this position is</label><textarea id="r-desc-${id}" name="description" maxlength="1000">${esc(r.description || "")}</textarea></div>
          <div class="sp-field"><label for="r-req-${id}">What it asks, in your own words (shown to those who could apply, beside the requirements below)</label><textarea id="r-req-${id}" name="requirements" maxlength="2000">${esc(r.requirements || "")}</textarea></div>
          ${check("is_default", "New members begin here")}
          ${r.id ? "" : `<p class="sp-caption">Once it’s added, you can open it for applications, choose its places and what it asks.</p>`}
          ${L.RANK_POWERS.map((p) => power(p)).join("")}
          <div class="sp-actions"><button class="button button--primary button--small" type="submit">${r.id ? "Save" : "Add"}</button>${r.id ? `<button class="button button--ghost button--small" type="button" data-delete-rank="${esc(r.id)}">Delete</button>` : ""}</div>
          ${statusLine()}
        </form>
        ${r.id ? `<div class="sp-section" data-position-panel="${esc(r.id)}"><p class="sp-caption">Loading its places and what it asks…</p></div><div data-queue-panel-holder></div>` : ""}</details>`;
  }

  function questionsForm(coven) {
    const questions = L.normalizeQuestions(coven.application_questions);
    const row = (q, i) => `<div class="cv-inline-form" data-question="${esc(q.id || "")}">
        <div class="sp-field"><label for="q-${i}">Question</label><input id="q-${i}" name="prompt" maxlength="300" value="${esc(q.prompt || "")}" /></div>
        <label class="cv-check"><input type="checkbox" name="required" ${q.required ? "checked" : ""} /> <span>Required</span></label>
        <button class="button button--ghost button--small" type="button" data-remove-question>Remove</button></div>`;
    return `<form class="sp-card" data-questions>
        <h2>Questions for people who apply</h2>
        <p class="sp-caption">Up to 20. Applicants answer these after signing the agreements.</p>
        <div class="sp-section" data-question-list>${questions.map(row).join("")}</div>
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-add-question>Add a question</button><button class="button button--primary button--small" type="submit">Save questions</button></div>
        ${statusLine()}
        <template data-question-template>${row({ id: "", prompt: "", required: false }, "x")}</template>
      </form>`;
  }

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  /** The coven's practice calendar: the same holiday choices as a person's Settings → Calendar. */
  function calendarForm(coven) {
    const traditions = global.SaltCore?.covens?.programs?.CALENDAR_TRADITIONS || [];
    const chosen = new Set(coven.practice_traditions || []);
    const picked = new Set(coven.practice_holidays || []);
    const custom = global.SaltCore?.covens?.holidays?.parseCustomHolidays?.(coven.practice_custom || []) || [];
    const customRow = (c, i) => `<div class="cv-inline-form" data-custom>
        <div class="sp-field"><label for="cd-name-${i}">Name</label><input id="cd-name-${i}" name="name" maxlength="80" value="${esc(c.name || "")}" /></div>
        <div class="sp-field"><label for="cd-month-${i}">Month</label><select id="cd-month-${i}" name="month">${MONTHS.map((m, n) => `<option value="${n}"${n === c.month ? " selected" : ""}>${m}</option>`).join("")}</select></div>
        <div class="sp-field"><label for="cd-day-${i}">Day</label><input id="cd-day-${i}" name="day" type="number" min="1" max="31" value="${esc(c.day || 1)}" /></div>
        <div class="sp-field"><label for="cd-meaning-${i}">What it’s for</label><input id="cd-meaning-${i}" name="meaning" maxlength="300" value="${esc(c.meaning || "")}" /></div>
        <button class="button button--ghost button--small" type="button" data-remove-custom>Remove</button></div>`;
    return `<form class="sp-card" data-calendar>
        <h2>The coven’s practice calendar</h2>
        <p class="sp-caption">The holidays the coven keeps, as members choose theirs in Settings → Calendar. They show on the coven’s page and on members’ Today page, rites can be planned for them, and the ready-made programs for these calendars are suggested first.</p>
        ${traditions.length ? traditions.map((t) => `<div class="cv-calendar-choice">
            <label class="cv-check"><input type="checkbox" name="tradition" value="${esc(t.id)}" ${chosen.has(t.id) ? "checked" : ""} /> <span><strong>${esc(t.name)}</strong><br /><span class="sp-caption">${esc(t.description)}</span></span></label>
            <details class="sp-details"${t.holidays.some((h) => picked.has(`${t.id}/${h.id}`)) ? " open" : ""}><summary>Choose which holidays (all, if none are ticked)</summary>
              <div class="cv-holiday-picks">${t.holidays.map((h) => `<label class="cv-check"><input type="checkbox" name="holiday" value="${esc(`${t.id}/${h.id}`)}" ${picked.has(`${t.id}/${h.id}`) ? "checked" : ""} /> <span>${esc(h.name)}</span></label>`).join("")}</div>
            </details>
          </div>`).join("") : `<p class="sp-notice">The calendars couldn’t load. Please refresh the page.</p>`}
        <h3>The coven’s own days</h3>
        <div class="sp-section" data-custom-list>${custom.map(customRow).join("")}</div>
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-add-custom>Add a day</button><button class="button button--primary" type="submit">Save the calendar</button></div>
        ${statusLine()}
        <template data-custom-template>${customRow({ name: "", month: 0, day: 1, meaning: "" }, "new")}</template>
      </form>`;
  }

  /** Who manages initiation and training, and who sees everyone's progress, by name. */
  function grantsForm(state, members) {
    const has = (userId, power) => (state.grants || []).some((g) => g.user_id === userId && g.power === power);
    const sorted = [...members].filter((m) => m.status === "active" && m.user_id !== state.coven.founder_id).sort((a, b) => UI.nameOf(state.context, a.user_id).localeCompare(UI.nameOf(state.context, b.user_id)));
    const holders = (flag) => state.ranks.filter((r) => r[flag] || r.can_manage).map((r) => r.name);
    return `<section class="sp-card" data-grants>
        <h2>Who runs training</h2>
        <p class="sp-caption">Choose who designs the coven’s programs, chooses who takes them, assigns mentors and signs off work; and who may see everyone’s progress. You can give these to whole positions (below, under Positions) or to people by name here. You always can.</p>
        <p class="sp-caption">By position: manages programs: ${esc(holders("can_manage_programs").join(", ") || "none yet")}; sees progress: ${esc([...new Set([...holders("can_view_progress"), ...holders("can_manage_programs")])].join(", ") || "none yet")}.</p>
        ${sorted.length ? `<div class="cv-table-wrap"><table class="cv-table"><thead><tr><th>Member</th><th>Manages programs</th><th>Sees everyone’s progress</th></tr></thead><tbody>${sorted
          .map((m) => `<tr><td>${esc(UI.nameOf(state.context, m.user_id))}</td>
            <td><input type="checkbox" data-grant="manage_programs" data-user="${esc(m.user_id)}" aria-label="${esc(UI.nameOf(state.context, m.user_id))} manages programs" ${has(m.user_id, "manage_programs") ? "checked" : ""} /></td>
            <td><input type="checkbox" data-grant="view_progress" data-user="${esc(m.user_id)}" aria-label="${esc(UI.nameOf(state.context, m.user_id))} sees everyone’s progress" ${has(m.user_id, "view_progress") ? "checked" : ""} /></td></tr>`)
          .join("")}</tbody></table></div>` : `<p class="sp-empty">No other members yet.</p>`}
        ${statusLine()}
      </section>`;
  }

  const CovenManage = {
    mount(pane, state, { refresh, covenHref }) {
      const { coven, perms } = state;
      pane.innerHTML = `${detailsForm(coven)}
        ${state.inviteSettings ? `<section class="sp-section"><h2>Invite people</h2>
          <p class="sp-caption">Invite links, invitations by name, and whether members may invite too.</p>
          <div class="sp-actions"><a class="button button--ghost" href="${esc(covenHref("invite"))}" data-tab="invite">Invite people</a></div></section>` : ""}
        <section class="sp-section"><h2>Creed, rules, requirements and agreements</h2>
          <p class="sp-caption">Pages everyone can read help seekers decide whether the coven is for them. Agreements are signed before joining.</p>
          ${state.documents.map(documentForm).join("")}${documentForm({ kind: "rules", visibility: "public", published: true, position: (state.documents.length + 1) * 10 })}</section>
        <section class="sp-section"><h2>Positions</h2>
          <p class="sp-caption">Reviewers can raise members to positions below their own that carry no powers. Only leaders give positions with powers.</p>
          ${[...state.ranks].sort((a, b) => b.level - a.level).map(rankForm).join("")}${rankForm({ level: 1 })}</section>
        ${questionsForm(coven)}
        ${calendarForm(coven)}
        <div data-coven-counting-holder></div>
        <section class="sp-section"><h2>Gathering notifications</h2><div data-notice-rules></div></section>
        <div data-grants-holder></div>
        <div data-leadership-holder></div>
        ${perms.founder || perms.site ? `<section class="sp-card" data-participation>
          <h2>Ritual participation</h2>
          <p class="sp-caption">When a step asks people to write, place or do something, some may see how many have, and who has and hasn’t. They never see what anyone wrote, and private ones stay sealed. You, as the coven’s head, always see it. Choose positions and people who see it too.</p>
          <div data-participation-picker><p class="sp-caption">Loading…</p></div>
          <div class="sp-actions"><button class="button button--primary button--small" type="button" data-save-participation>Save</button></div>
          ${statusLine()}</section>` : ""}
        ${perms.site || (perms.founder && coven.status === "active") ? `<section class="sp-section"><h2>Archive the coven</h2>
          <p class="sp-caption">An archived coven leaves the directory and becomes read-only for its members. ${perms.site ? "" : "Only the site moderators can reopen it."}</p>
          <div class="sp-actions"><button class="button button--ghost" type="button" data-archive>${coven.status === "archived" ? "Reopen the coven" : "Archive the coven"}</button></div>${statusLine()}</section>` : ""}`;

      pane.querySelector("[data-details]").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        const errors = L.validateCoven({ ...data, slug: coven.slug });
        if (errors.length) return UI.setStatus(form.querySelector("[data-status]"), errors.join(" "), true);
        const changes = { ...data, tags: L.parseTags(data.tags), member_limit: data.member_limit ? Number(data.member_limit) : null };
        for (const key of ["tagline", "description", "tradition", "meeting_rhythm"]) changes[key] = String(changes[key] || "").trim() || null;
        if (await UI.busy(form, form.querySelector("[data-status]"), () => D.updateCoven(coven.id, changes), { done: "Saved." })) refresh("manage");
      });

      pane.querySelectorAll("[data-document]").forEach((form) =>
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          const data = Object.fromEntries(new FormData(form));
          const row = { coven_id: coven.id, title: data.title.trim(), kind: data.kind, body: data.body, visibility: data.visibility, position: Number(data.position) || 0, requires_signature: Boolean(data.requires_signature), published: Boolean(data.published) };
          if (row.requires_signature && row.visibility !== "public") return UI.setStatus(form.querySelector("[data-status]"), "An agreement must be readable by everyone, so seekers can sign it before they join.", true);
          if (form.dataset.document) row.id = form.dataset.document;
          if (await UI.busy(form, form.querySelector("[data-status]"), () => D.saveDocument(row))) refresh("manage");
        })
      );
      pane.querySelectorAll("[data-delete-document]").forEach((button) =>
        button.addEventListener("click", async () => {
          if (!(await UI.confirmAction("Delete this page?", "Its signatures go with it.", "Delete"))) return;
          if (await UI.busy(button, button.closest("form").querySelector("[data-status]"), () => D.deleteDocument(button.dataset.deleteDocument).then(() => true))) refresh("manage");
        })
      );

      pane.querySelectorAll("[data-rank]").forEach((form) =>
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          const data = Object.fromEntries(new FormData(form));
          const row = { coven_id: coven.id, name: data.name.trim(), level: Number(data.level) || 1, description: data.description.trim() || null, requirements: data.requirements.trim() || null };
          // Opening it for applications is its own section (covens/coven/positions.js), not a checkbox here.
          for (const flag of ["is_default", ...L.RANK_POWERS.map((p) => p.key)]) row[flag] = Boolean(data[flag]);
          // A power the database doesn't have yet (its migration not applied) is left out while it's off.
          if (!row.can_set_gathering_notices && state.ranks.length && !state.ranks.some((r) => "can_set_gathering_notices" in r)) delete row.can_set_gathering_notices;
          if (form.dataset.rank) row.id = form.dataset.rank;
          if (await UI.busy(form, form.querySelector("[data-status]"), () => D.saveRank(row))) refresh("manage");
        })
      );
      pane.querySelectorAll("[data-delete-rank]").forEach((button) =>
        button.addEventListener("click", async () => {
          if (!(await UI.confirmAction("Delete this position?", "Anyone who holds it becomes a member without a position until you give them another.", "Delete"))) return;
          if (await UI.busy(button, button.closest("form").querySelector("[data-status]"), () => D.deleteRank(button.dataset.deleteRank).then(() => true))) refresh("manage");
        })
      );

      // Each position's places, opening and what it asks, drawn when its details open; its status chip now.
      pane.querySelectorAll("[data-rank-details]").forEach((details) =>
        details.addEventListener("toggle", () => {
          const panel = details.querySelector("[data-position-panel]");
          if (!details.open || !panel || panel.dataset.loaded) return;
          panel.dataset.loaded = "1";
          const rank = state.ranks.find((r) => r.id === details.dataset.rankDetails);
          if (rank && global.CovenPositions) global.CovenPositions.leaderPanel(panel, state, rank, { refresh });
          // Its waiting list, after the places and what it asks.
          const queue = details.querySelector("[data-queue-panel-holder]");
          if (rank && queue && global.CovenQueue) global.CovenQueue.leaderPanel(queue, state, rank, { refresh });
        })
      );
      const S = global.SaltCore?.covens?.positions;
      if (S)
        D.members(coven.id)
          .then((members) => {
            const held = {};
            members.filter((m) => m.status === "active" && m.rank_id).forEach((m) => (held[m.rank_id] = (held[m.rank_id] || 0) + 1));
            state.ranks.forEach((r) => {
              const el = pane.querySelector(`[data-rank-status="${CSS.escape(r.id)}"]`);
              if (el) el.textContent = ` · ${S.positionStatus(r, held[r.id] || 0).label}`;
            });
          })
          .catch(() => {});

      const questions = pane.querySelector("[data-questions]");
      const list = questions.querySelector("[data-question-list]");
      let added = 0;
      questions.addEventListener("click", (event) => {
        if (event.target.closest("[data-remove-question]")) event.target.closest("[data-question]").remove();
        if (event.target.closest("[data-add-question]")) {
          const fragment = questions.querySelector("[data-question-template]").content.cloneNode(true);
          fragment.querySelector("input[name=prompt]").id = `q-new-${++added}`;
          fragment.querySelector("label[for]").setAttribute("for", `q-new-${added}`);
          list.appendChild(fragment);
          list.lastElementChild?.querySelector("input")?.focus();
        }
      });
      questions.addEventListener("submit", async (event) => {
        event.preventDefault();
        const next = L.normalizeQuestions([...list.querySelectorAll("[data-question]")].map((row) => ({ id: row.dataset.question, prompt: row.querySelector("[name=prompt]").value, required: row.querySelector("[name=required]").checked })));
        if (await UI.busy(questions, questions.querySelector("[data-status]"), () => D.updateCoven(coven.id, { application_questions: next }), { done: "Saved." })) refresh("manage");
      });

      // How the coven counts its days (covens/coven/moon-calendar.js).
      global.CovenMoonCalendar?.form(pane.querySelector("[data-coven-counting-holder]"), coven);
      const calendar = pane.querySelector("[data-calendar]");
      const customList = calendar.querySelector("[data-custom-list]");
      calendar.addEventListener("click", (event) => {
        if (event.target.closest("[data-remove-custom]")) event.target.closest("[data-custom]").remove();
        if (event.target.closest("[data-add-custom]")) {
          if (customList.children.length >= 60) return;
          customList.appendChild(calendar.querySelector("[data-custom-template]").content.cloneNode(true));
          customList.lastElementChild?.querySelector("input")?.focus();
        }
      });
      calendar.addEventListener("submit", async (event) => {
        event.preventDefault();
        const traditions = [...calendar.querySelectorAll("[name=tradition]:checked")].map((i) => i.value);
        // A holiday counts only under a calendar the coven keeps.
        const holidays = [...calendar.querySelectorAll("[name=holiday]:checked")].map((i) => i.value).filter((id) => traditions.includes(id.split("/")[0]));
        const custom = [...customList.querySelectorAll("[data-custom]")]
          .map((row, i) => ({ id: `coven-${i + 1}-${L.slugify(row.querySelector("[name=name]").value).slice(0, 24)}`, name: row.querySelector("[name=name]").value.trim(), month: Number(row.querySelector("[name=month]").value), day: Number(row.querySelector("[name=day]").value) || 1, meaning: row.querySelector("[name=meaning]").value.trim() }))
          .filter((c) => c.name);
        if (await UI.busy(calendar, calendar.querySelector("[data-status]"), () => D.updateCoven(coven.id, { practice_traditions: traditions, practice_holidays: holidays, practice_custom: custom }), { done: "Saved." })) refresh("manage");
      });

      // Powers by name are the coven head's to give.
      if (perms.manage || perms.site) {
        D.members(coven.id).then(async (members) => {
          await UI.loadNames(state.context, members.map((m) => m.user_id));
          const holder = pane.querySelector("[data-grants-holder]");
          if (!holder) return;
          holder.innerHTML = grantsForm(state, members);
          holder.querySelectorAll("[data-grant]").forEach((box) =>
            box.addEventListener("change", async () => {
              const ok = await UI.busy(box, holder.querySelector("[data-status]"), () => D.setGrant(coven.id, box.dataset.user, box.dataset.grant, box.checked).then(() => true), { done: "Saved." });
              if (!ok) box.checked = !box.checked;
              else state.grants = await D.grants(coven.id).catch(() => state.grants);
            })
          );
        }).catch(() => {});
      }

      // Succession and who may found daughter covens (covens/coven/lineage.js; the app's manage/leadership.tsx).
      global.CovenLineageUI?.leadershipPanel(pane.querySelector("[data-leadership-holder]"), state);

      // Who hears about the coven's gatherings (covens/coven/notices.js; the app's manage/notices.tsx).
      global.CovenNotices?.rulesPanel(pane.querySelector("[data-notice-rules]"), state);

      // Who sees ritual participation: the head chooses (as the app's manage/participation.tsx).
      const participation = pane.querySelector("[data-participation]");
      const P = global.SaltCore?.covens?.picker;
      if (participation && P && global.CovenPicker) {
        Promise.all([D.members(coven.id).catch(() => []), D.ritualSettings(coven.id).catch(() => null)]).then(async ([members, settings]) => {
          await UI.loadNames(state.context, members.map((m) => m.user_id));
          let viewers = P.cleanAssignees(settings?.participation_viewers || []);
          const entries = P.whoEntries(state.ranks, members.filter((m) => m.status === "active" && m.user_id !== coven.founder_id).map((m) => ({ id: m.user_id, name: UI.nameOf(state.context, m.user_id) })), { coven: false });
          const nameOf = (id) => UI.nameOf(state.context, id);
          global.CovenPicker.create(participation.querySelector("[data-participation-picker]"), {
            id: "participation-viewers",
            label: "Who also sees participation",
            placeholder: "Maiden, Elder, Rowan…",
            empty: "Only you.",
            chips: () => viewers.map((a) => ({ key: P.assigneeKey(a), label: P.assigneeLabel(a, state.ranks, nameOf) })),
            search: (q, picked) => P.searchEntries(entries, q, { limit: 8, picked, suggestions: P.whoSuggestions(entries, 3) }),
            onAdd: (entry) => (viewers = P.cleanAssignees([...viewers, P.assigneeFromKey(entry.key)])),
            onRemove: (key) => (viewers = viewers.filter((a) => P.assigneeKey(a) !== key))
          });
          participation.querySelector("[data-save-participation]").addEventListener("click", (event) =>
            UI.busy(event.currentTarget, participation.querySelector("[data-status]"), () => D.setParticipationViewers(coven.id, viewers), { done: "Saved." })
          );
        });
      }

      const archive = pane.querySelector("[data-archive]");
      archive?.addEventListener("click", async () => {
        const reopening = coven.status === "archived";
        if (!reopening && !(await UI.confirmAction("Archive this coven?", "It leaves the directory and its gathering and altar become read-only.", "Archive"))) return;
        const work = perms.site ? () => D.moderateCoven(coven.id, reopening ? "active" : "archived") : () => D.updateCoven(coven.id, { status: "archived" });
        if (await UI.busy(archive, archive.closest("section").querySelector("[data-status]"), work)) refresh("about");
      });
    }
  };

  global.CovenMembers = CovenMembers;
  global.CovenReview = CovenReview;
  global.CovenManage = CovenManage;
})(window);
