/*
 * Open positions on the website, level with the app (its
 * components/covens/Positions.tsx and PositionEditors.tsx):
 *
 *   card         "Open positions" on About and My standing: each open
 *                position above you, its places left and closing date, what
 *                it asks (✓ met, ✗ not yet, ○ for the reviewer) and Apply.
 *   leaderPanel  Manage → Positions → a position: places and who holds it,
 *                opening it for applications (note, closing date, who hears)
 *                and closing it, what it asks, and its questions.
 *   reviewPanel  Review: a request's checklist, ticks, answers and places left;
 *                Approve stays off while ticks are missing; while the position
 *                is full it becomes "Approve: add to the waiting list"
 *                (covens/coven/queue.js keeps the lists).
 *
 * The logic is the app's (SaltCore.covens.positions, js/core/covens.js); the
 * database checks everything again (…_coven_open_positions.sql).
 */
(function (global) {
  "use strict";

  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;
  const P = () => global.SaltCore?.covens?.positions;
  const status = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;

  /** What a position asks, each with ✓, ✗ or ○ and its line. */
  function checklistHtml(checks) {
    if (!checks?.length) return "";
    const said = { met: "met", unmet: "not yet", needs_review: "for the reviewer" };
    return `<ul class="cv-checklist">${checks
      .map((c) => `<li class="cv-checklist__item cv-checklist__item--${esc(c.status)}"><span class="cv-checklist__mark" aria-hidden="true">${esc(P().statusMark(c.status))}</span>
        <span><span class="sr-only">${esc(said[c.status] || "")}: </span>${esc(c.label)}${c.line ? `<br /><span class="sp-caption">${esc(c.line)}</span>` : ""}</span></li>`)
      .join("")}</ul>`;
  }

  // --- the Open positions card ----------------------------------------------

  /**
   * Fill `container` with the open positions above you. Resolves with the
   * overview (null before the database has open positions, so the page can
   * fall back to the older form).
   */
  async function card(container, state, { applyHere = false, chosen = null, onApplied, covenHref } = {}) {
    if (!container || !P() || !state.perms.member) return null;
    const overview = await D.positionsOverview(state.coven.id);
    if (!overview) return null;
    const positions = P().openPositions(state.ranks, overview);
    const pending = (state.advancements || []).find((a) => a.status === "pending");
    if (!positions.length) {
      container.innerHTML = applyHere ? `<p class="sp-caption">No higher positions are open to apply for right now.</p>` : "";
      return overview;
    }
    const applyHref = (id) => `${covenHref ? covenHref("path") : ""}&apply=${encodeURIComponent(id)}`;
    container.innerHTML = `<section class="sp-section"><h2>Open positions</h2>${positions
      .map((p) => `<article class="sp-card${p.ready ? " sp-card--gold" : ""}" data-position="${esc(p.rank.id)}">
          <h3>${esc(p.rank.name)}</h3>
          ${P().openLine(p) ? `<p class="sp-caption">${esc(P().openLine(p))}</p>` : ""}
          ${p.rank.opening_note ? `<div class="cv-doc">${prose(p.rank.opening_note)}</div>` : ""}
          ${checklistHtml(p.checks)}
          ${p.rank.requirements ? `<p class="sp-caption">In their words</p><div class="cv-doc">${prose(p.rank.requirements)}</div>` : ""}
          ${
            pending
              ? `<p class="sp-caption">${pending.rank_id === p.rank.id ? "You’ve asked for this. The coven’s reviewers will decide." : "You have a request waiting already; one at a time."}</p>`
              : !p.ready
                ? `<p class="sp-caption">You can apply once everything marked ✗ is met.</p>`
                : applyHere
                  ? `<div data-apply-holder></div><div class="sp-actions"><button class="button button--ghost" type="button" data-apply="${esc(p.rank.id)}" ${state.standing.ok ? "" : "disabled"}>Apply for ${esc(p.rank.name)}</button></div>`
                  : `<div class="sp-actions"><a class="button button--ghost" href="${esc(applyHref(p.rank.id))}" data-tab="path">Apply for ${esc(p.rank.name)}</a></div>`
          }
          ${!pending && p.ready && !state.standing.ok ? `<p class="sp-caption">${esc(state.standing.reasons.join(" "))}</p>` : ""}
        </article>`)
      .join("")}</section>`;

    const showForm = (rankId) => {
      const article = container.querySelector(`[data-position="${CSS.escape(rankId)}"]`);
      const position = positions.find((p) => p.rank.id === rankId);
      if (!article || !position) return;
      article.querySelector("[data-apply]")?.closest(".sp-actions")?.remove();
      applyForm(article.querySelector("[data-apply-holder]"), state, position, onApplied);
    };
    container.querySelectorAll("[data-apply]").forEach((button) => button.addEventListener("click", () => showForm(button.dataset.apply)));
    if (applyHere && chosen && !pending && state.standing.ok && positions.some((p) => p.rank.id === chosen && p.ready)) showForm(chosen);
    return overview;
  }

  function applyForm(holder, state, position, onApplied) {
    if (!holder) return;
    const questions = P().rankQuestions(position.rank);
    const id = position.rank.id;
    holder.innerHTML = `<form class="sp-section" data-apply-form>
        ${questions.map((q) => `<div class="sp-field"><label for="pq-${esc(id)}-${esc(q.id)}">${esc(q.prompt)}${q.required ? "" : " (optional)"}</label>
          <textarea id="pq-${esc(id)}-${esc(q.id)}" name="${esc(q.id)}" maxlength="4000" ${q.required ? "required" : ""}></textarea></div>`).join("")}
        <div class="sp-field"><label for="ps-${esc(id)}">Why you’re ready, and how you’ve met what it asks</label>
          <textarea id="ps-${esc(id)}" name="__statement" maxlength="4000" required></textarea></div>
        <div class="sp-actions"><button class="button button--primary" type="submit">Send my application</button></div>
        ${status()}</form>`;
    const form = holder.querySelector("[data-apply-form]");
    form.querySelector("textarea")?.focus();
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const statement = String(data.__statement || "").trim();
      delete data.__statement;
      const read = P().readAnswers(questions, data);
      if (read.missing) return UI.setStatus(form.querySelector("[data-status]"), `Please answer: ${read.missing.prompt}`, true);
      if (!statement) return UI.setStatus(form.querySelector("[data-status]"), "Say why you’re ready.", true);
      if (await UI.busy(form, form.querySelector("[data-status]"), () => D.requestAdvancement(state.coven.id, id, statement, read.answers))) onApplied?.();
    });
  }

  // --- Manage: one position ---------------------------------------------------

  const AUDIENCE_DETAIL = "Each person’s own notification choices still count, and no one who has blocked you is told.";

  /** Places, opening and what it asks, for `rank`, inside the position's details on Manage. */
  async function leaderPanel(container, state, rank, { refresh } = {}) {
    if (!container || !P()) return;
    const S = P();
    const [members, programs] = await Promise.all([D.members(state.coven.id).catch(() => null), D.programs(state.coven.id).catch(() => [])]);
    const holders = (members || []).filter((m) => m.status === "active" && m.rank_id === rank.id);
    await UI.loadNames(state.context, holders.map((m) => m.user_id));
    const held = holders.length;
    const open = S.flaggedOpen(rank) && !S.pastDeadline(rank);
    const rid = esc(rank.id);
    const ctx = { rank, ranks: state.ranks, programs: programs.filter((p) => p.status !== "archived").map((p) => ({ id: p.id, title: p.title })), documents: state.documents.map((d) => ({ id: d.id, title: d.title })) };
    let items = S.requirementItems(rank);
    let questions = S.rankQuestions(rank);

    container.innerHTML = `<form class="sp-section" data-places>
        <h3>Places</h3>
        <p>${esc(S.placesLine(rank, held))}</p>
        ${S.overLimit(rank, held) ? `<p class="sp-caption">More hold it than its places now. Nobody loses it; no one new can be given it until there’s room.</p>` : ""}
        ${members ? `<p class="sp-caption">${held ? `Held by ${esc(holders.map((m) => UI.nameOf(state.context, m.user_id)).join(", "))}` : "No one holds it yet."}</p>` : ""}
        <div class="sp-field"><label for="pp-${rid}">How many may hold it (empty for no limit)</label><input id="pp-${rid}" name="places" type="number" min="1" max="1000" value="${esc(rank.seat_limit ?? "")}" /></div>
        <div class="sp-actions"><button class="button button--ghost button--small" type="submit">Save places</button></div>
        ${status()}
      </form>
      ${rank.is_default ? `<p class="sp-caption">Everyone joins the coven here, so there’s nothing to apply for.</p>` : `<form class="sp-section" data-opening>
        <h3>Open for applications</h3>
        <p><strong>${esc(S.positionStatus(rank, held).label)}</strong>${rank.applications_close_at ? ` · ${esc(S.deadlineWords(rank.applications_close_at))}` : ""}</p>
        <div class="sp-field"><label for="pn-${rid}">Why it’s open (a note for those who could apply)</label><textarea id="pn-${rid}" name="note" maxlength="${S.MAX_NOTE}">${esc(rank.opening_note || "")}</textarea></div>
        <div class="sp-field"><label for="pd-${rid}">Applications close on (empty for no date)</label><input id="pd-${rid}" name="close" type="date" value="${esc(S.dateOfCloseAt(rank.applications_close_at))}" /></div>
        ${open ? "" : `<fieldset class="gd-fieldset"><legend>Who hears that it’s open</legend>${S.AUDIENCES.map((a, i) => `<label class="cv-check"><input type="radio" name="notify" value="${esc(a.value)}" ${i === 0 ? "checked" : ""} /> <span>${esc(a.label)} <span class="sp-caption" data-count="${esc(a.value)}"></span><br /><span class="sp-caption">${esc(a.detail)}</span></span></label>`).join("")}
          <p class="sp-caption">${esc(AUDIENCE_DETAIL)}</p></fieldset>`}
        <div class="sp-actions"><button class="button button--primary button--small" type="submit">${open ? "Save changes" : "Open for applications"}</button>${open ? `<button class="button button--ghost button--small" type="button" data-close>Close applications</button>` : ""}</div>
        ${open ? `<p class="sp-caption">Changing an open position tells no one again.</p>` : ""}
        ${status()}
      </form>`}
      <form class="sp-section" data-asks>
        <h3>What it asks</h3>
        <p class="sp-caption">Up to ${S.MAX_REQUIREMENTS}. Those checked from the coven’s record must be met before someone can apply; their mentor’s approval and anything in your words are ticked by whoever decides.</p>
        <div data-items></div>
        <div class="sp-field"><label for="pk-${rid}">Add a requirement</label><select id="pk-${rid}" data-add-kind><option value="">Choose…</option>${S.REQUIREMENT_KINDS.map((k) => `<option value="${esc(k.kind)}">${esc(k.label)}</option>`).join("")}</select></div>
        <h3>Questions for those who apply</h3>
        <p class="sp-caption">Up to 20, answered when someone asks for this position. Empty questions are left out.</p>
        <div data-rank-questions></div>
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-add-question>Add a question</button><button class="button button--primary button--small" type="submit">Save what it asks</button></div>
        ${status()}
      </form>`;

    const after = () => refresh?.("manage");

    container.querySelector("[data-places]").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const read = S.readPlaces(form.elements.places.value);
      if (read.error) return UI.setStatus(form.querySelector("[data-status]"), read.error, true);
      if (await UI.busy(form, form.querySelector("[data-status]"), () => D.setPositionPlaces(rank.id, read.value).then(() => true), { done: "Saved." })) after();
    });

    const opening = container.querySelector("[data-opening]");
    if (opening) {
      if (!open)
        D.positionNoticePreview(rank.id)
          .then((p) => ["everyone", "eligible"].forEach((k) => {
            const el = opening.querySelector(`[data-count="${k}"]`);
            if (el) el.textContent = `(${p[k]})`;
          }))
          .catch(() => {});
      opening.addEventListener("submit", async (event) => {
        event.preventDefault();
        const st = opening.querySelector("[data-status]");
        const places = S.readPlaces(container.querySelector("[data-places]").elements.places.value);
        if (places.error) return UI.setStatus(st, places.error, true);
        const day = opening.elements.close.value;
        const closeAt = day ? S.closeAtFromDate(day) : null;
        if (day && !closeAt) return UI.setStatus(st, "Choose a closing date.", true);
        const notify = opening.elements.notify ? (opening.querySelector("[name=notify]:checked")?.value || "everyone") : "none";
        const out = await UI.busy(opening, st, () => D.openPosition(rank.id, places.value, opening.elements.note.value, closeAt, notify));
        if (out) {
          UI.setStatus(st, out.closed_full ? "Saved. Every place is held now, so it has stopped taking applications." : open ? "Saved." : out.notify ? `${rank.name} is open for applications. Those you chose are being told.` : `${rank.name} is open for applications.`);
          setTimeout(after, 900);
        }
      });
      opening.querySelector("[data-close]")?.addEventListener("click", async (event) => {
        if (await UI.busy(event.currentTarget, opening.querySelector("[data-status]"), () => D.closePosition(rank.id).then(() => true), { done: "Closed. Requests already waiting stay for you to decide." })) setTimeout(after, 900);
      });
    }

    // What it asks: kept in `items` while editing, drawn again on each change of kind or choice.
    const asks = container.querySelector("[data-asks]");
    const list = asks.querySelector("[data-items]");
    const below = S.lowerRanks(ctx);
    const select = (name, i, options, value, label) =>
      `<div class="sp-field"><label for="pi-${rid}-${i}-${name}">${esc(label)}</label><select id="pi-${rid}-${i}-${name}" data-i="${i}" data-field="${name}">${options.map((o) => `<option value="${esc(o.value)}"${o.value === value ? " selected" : ""}>${esc(o.label)}</option>`).join("")}</select></div>`;
    const number = (name, i, value, label) =>
      `<div class="sp-field"><label for="pi-${rid}-${i}-${name}">${esc(label)}</label><input id="pi-${rid}-${i}-${name}" type="number" min="1" max="3650" data-i="${i}" data-field="${name}" value="${esc(value ?? "")}" /></div>`;
    const drawItems = () => {
      list.innerHTML = items
        .map((item, i) => {
          const kind = S.REQUIREMENT_KINDS.find((k) => k.kind === item.kind);
          const parts = [];
          if (item.kind === "min_days_in_position" || item.kind === "holds_position")
            parts.push(below.length ? select("rank_id", i, below.map((r) => ({ value: r.id, label: r.name })), item.rank_id, "Position") : `<p class="sp-caption">There are no positions below this one to choose.</p>`);
          if (item.kind === "min_days_in_coven" || item.kind === "min_days_in_position") {
            parts.push(`<div class="sp-chips">${S.DAY_CHOICES.map((d) => `<button type="button" class="sp-chip" data-i="${i}" data-days="${d}" aria-pressed="${item.days === d}">${esc(S.daysWords(d))}</button>`).join("")}</div>`);
            parts.push(number("days", i, item.days, "How many days"));
          }
          if (item.kind === "min_rites_attended") parts.push(number("count", i, item.count, "How many rites"));
          if (item.kind === "program_completed") parts.push(ctx.programs.length ? select("program_id", i, ctx.programs.map((p) => ({ value: p.id, label: p.title })), item.program_id, "Program") : `<p class="sp-caption">The coven has no programs yet. Make one under Initiation &amp; training.</p>`);
          if (item.kind === "document_signed") parts.push(ctx.documents.length ? select("document_id", i, ctx.documents.map((d) => ({ value: d.id, label: d.title })), item.document_id, "Page") : `<p class="sp-caption">The coven has no pages yet.</p>`);
          if (item.kind === "custom") parts.push(`<div class="sp-field"><label for="pi-${rid}-${i}-text">In your words</label><input id="pi-${rid}-${i}-text" maxlength="300" data-i="${i}" data-field="text" value="${esc(item.text || "")}" /></div>`);
          return `<div class="sp-card"><h4>${esc(S.requirementLabel(item, ctx))}</h4><p class="sp-caption">${esc(kind?.detail || "")}</p>${parts.join("")}
            <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-remove-item="${i}">Remove</button></div></div>`;
        })
        .join("") || `<p class="sp-empty">Nothing yet beyond its own words.</p>`;
    };
    const qList = asks.querySelector("[data-rank-questions]");
    const drawQuestions = () => {
      qList.innerHTML = questions
        .map((q, i) => `<div class="cv-inline-form" data-q="${i}">
          <div class="sp-field"><label for="pq-${rid}-${i}">Question ${i + 1}</label><input id="pq-${rid}-${i}" maxlength="300" data-q-prompt="${i}" value="${esc(q.prompt)}" /></div>
          <label class="cv-check"><input type="checkbox" data-q-required="${i}" ${q.required ? "checked" : ""} /> <span>Required</span></label>
          <button class="button button--ghost button--small" type="button" data-remove-q="${i}">Remove</button></div>`)
        .join("");
    };
    drawItems();
    drawQuestions();

    asks.addEventListener("input", (event) => {
      const t = event.target;
      if (t.dataset.field && t.dataset.i != null) {
        const i = Number(t.dataset.i);
        const field = t.dataset.field;
        items[i] = { ...items[i], [field]: field === "days" || field === "count" ? Number(t.value) || undefined : t.value };
        if (field !== "text" && field !== "days" && field !== "count") drawItems();
        else {
          const title = list.children[i]?.querySelector("h4");
          if (title) title.textContent = S.requirementLabel(items[i], ctx);
        }
      }
      if (t.dataset.qPrompt != null) questions[Number(t.dataset.qPrompt)].prompt = t.value;
    });
    asks.addEventListener("change", (event) => {
      const t = event.target;
      if (t.dataset.field && t.tagName === "SELECT") {
        items[Number(t.dataset.i)] = { ...items[Number(t.dataset.i)], [t.dataset.field]: t.value };
        drawItems();
      }
      if (t.dataset.qRequired != null) questions[Number(t.dataset.qRequired)].required = t.checked;
      if (t.matches("[data-add-kind]") && t.value) {
        if (items.length >= S.MAX_REQUIREMENTS) return UI.setStatus(asks.querySelector("[data-status]"), `A position can ask up to ${S.MAX_REQUIREMENTS} things.`, true);
        if (t.value === "mentor_approval" && items.some((x) => x.kind === "mentor_approval")) t.value = "";
        else items = [...items, S.newRequirement(t.value, ctx, items.map((x) => String(x.id || "")))];
        t.value = "";
        drawItems();
      }
    });
    asks.addEventListener("click", (event) => {
      const t = event.target.closest("button");
      if (!t) return;
      if (t.dataset.days) {
        items[Number(t.dataset.i)] = { ...items[Number(t.dataset.i)], days: Number(t.dataset.days) };
        drawItems();
      }
      if (t.dataset.removeItem != null) {
        items = items.filter((_, j) => j !== Number(t.dataset.removeItem));
        drawItems();
      }
      if (t.dataset.removeQ != null) {
        questions = questions.filter((_, j) => j !== Number(t.dataset.removeQ));
        drawQuestions();
      }
      if (t.matches("[data-add-question]") && questions.length < 20) {
        questions = [...questions, { id: "", prompt: "", required: false }];
        drawQuestions();
        qList.lastElementChild?.querySelector("input")?.focus();
      }
    });
    asks.addEventListener("submit", async (event) => {
      event.preventDefault();
      const cleaned = S.cleanRequirements(items, ctx);
      if (cleaned.error) return UI.setStatus(asks.querySelector("[data-status]"), cleaned.error, true);
      const L = global.CovenLogic;
      if (await UI.busy(asks, asks.querySelector("[data-status]"), () => D.saveRankRequirements(rank.id, cleaned.items, L.normalizeQuestions(questions)).then(() => true), { done: "Saved." })) setTimeout(after, 900);
    });
  }

  // --- Review ----------------------------------------------------------------

  /**
   * A request's checklist (with ticks), its answers, and places left, into
   * `holder`; keeps the form's Approve off while something is still to tick,
   * and makes it "Approve: add to the waiting list" while the position is
   * full (form.dataset.full). The ticks go with the decision (form.dataset.ticks).
   */
  async function reviewPanel(holder, state, request, holders) {
    if (!holder || !P()) return;
    const S = P();
    const form = holder.closest("article")?.querySelector("[data-decide]");
    const rank = state.ranks.find((r) => r.id === request.rank_id);
    const checks = await D.checklist(request.id);
    const me = state.context.user?.id;
    const mentorsThem = (state.mentors || []).some((m) => m.user_id === request.user_id && m.mentor_id === me);
    const ticked = new Set();
    const held = holders?.[request.rank_id];
    const left = rank && held != null ? S.placesLeft(rank, held) : null;

    const draw = () => {
      const list = S.withTicks(checks, [...ticked]);
      const toTick = checks.filter((c) => !c.auto && c.status !== "met");
      const unticked = S.untickedLabels(checks, [...ticked]);
      const full = left === 0;
      const block = unticked.length ? `Tick what it asks before approving: ${unticked.join("; ")}.` : "";
      holder.innerHTML = `${rank && held != null ? `<p class="sp-caption">${esc(S.placesLine(rank, held))}</p>` : ""}
        ${checklistHtml(list)}
        ${toTick
          .map((c) => (c.kind !== "mentor_approval" || state.perms.manage || state.perms.site || mentorsThem
            ? `<label class="cv-check"><input type="checkbox" data-tick="${esc(c.id)}" ${ticked.has(c.id) ? "checked" : ""} /> <span>${c.kind === "mentor_approval" ? "Their mentor approves" : `Confirmed: ${esc(c.label)}`}</span></label>`
            : `<p class="sp-caption">Their mentor or the coven’s leaders give their mentor’s approval.</p>`))
          .join("")}
        ${S.rankQuestions(rank).map((q) => `<p><strong>${esc(q.prompt)}</strong><br />${prose(request.answers?.[q.id] || "—")}</p>`).join("")}
        ${full ? `<p class="sp-caption">${esc(rank.name)} is full. Approving adds them to its waiting list, in turn; they’re told where they are in line. Or give it more places under Manage → Positions, or decline.</p>` : ""}
        ${block ? `<p class="sp-caption" data-block>${esc(block)}</p>` : ""}`;
      if (form) {
        form.dataset.ticks = JSON.stringify([...ticked]);
        form.dataset.blocked = block ? "1" : "";
        form.dataset.full = full ? "1" : "";
        const approve = form.querySelector('[data-approve="1"]');
        if (approve) {
          approve.disabled = !!block;
          approve.textContent = full ? "Approve: add to the waiting list" : "Approve";
        }
      }
      holder.querySelectorAll("[data-tick]").forEach((box) =>
        box.addEventListener("change", () => {
          if (box.checked) ticked.add(box.dataset.tick);
          else ticked.delete(box.dataset.tick);
          draw();
        })
      );
    };
    draw();
  }

  global.CovenPositions = { card, leaderPanel, reviewPanel, checklistHtml };
})(window);
