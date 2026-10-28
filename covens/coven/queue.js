/*
 * Waiting lists for full positions on the website, level with the app (its
 * components/covens/Queue.tsx):
 *
 *   myPlaces     My standing: "You’re 2nd in line for Initiate", and leaving
 *                the list.
 *   leaderPanel  Manage → Positions → a position: its list in order (move up
 *                or down, take someone off with the reason, add someone) and
 *                what happened on it.
 *   proposals    Review: "A place is free in Initiate. Rowan is next in line."
 *                Promote, Choose someone else (from the list or any member
 *                who could hold it), Not now. Nobody is moved without it.
 *
 * The logic is the app's (SaltCore.covens.queue, js/core/covens.js); the
 * database keeps the lists and checks everything again
 * (…_coven_test_keys_and_waiting_lists.sql).
 */
(function (global) {
  "use strict";

  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc } = UI;
  const Q = () => global.SaltCore?.covens?.queue;
  const status = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const rankName = (state, id) => state.ranks.find((r) => r.id === id)?.name || "the position";

  /** Members who could be given a position: active, below it, never the founder or you. */
  function candidates(state, rank, members) {
    const level = (id) => state.ranks.find((r) => r.id === id)?.level ?? 0;
    const me = state.context.user?.id;
    return (members || []).filter((m) => m.status === "active" && m.user_id !== state.coven.founder_id && m.user_id !== me && level(m.rank_id) < rank.level);
  }

  /** A short search over members; calls onPick(member). */
  function picker(holder, state, people, label, onPick) {
    holder.innerHTML = `<div class="sp-field"><label>${esc(label)}<input type="search" maxlength="60" data-find /></label></div><div class="sp-list" data-found></div>`;
    const find = holder.querySelector("[data-find]");
    const draw = () => {
      const q = find.value.trim().toLowerCase();
      const shown = people.filter((m) => !q || UI.nameOf(state.context, m.user_id).toLowerCase().includes(q)).slice(0, 8);
      holder.querySelector("[data-found]").innerHTML = shown.length
        ? shown.map((m) => `<button class="sp-row cv-row-button" type="button" data-pick="${esc(m.user_id)}"><span class="sp-row__text"><span class="sp-row__title">${esc(UI.nameOf(state.context, m.user_id))}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></button>`).join("")
        : `<p class="sp-caption">No one else could hold it just now.</p>`;
      holder.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => onPick(people.find((m) => m.user_id === b.dataset.pick), b)));
    };
    find.addEventListener("input", draw);
    draw();
  }

  // --- My standing ----------------------------------------------------------

  async function myPlaces(container, state, { refresh } = {}) {
    if (!container || !Q()) return;
    const mine = await D.myQueue(state.coven.id);
    if (!mine.length) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = `<section class="sp-section"><h2>Waiting lists</h2>${mine
      .map((e) => `<div class="sp-card${e.status === "proposed" ? " sp-card--gold" : ""}" data-queue-place="${esc(e.id)}">
          <p><strong>${esc(Q().myPlaceLine(e, rankName(state, e.rank_id)))}</strong></p>
          <p class="sp-caption">${esc(Q().entryLine(e))}</p>
          <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-withdraw-queue="${esc(e.id)}">Leave the waiting list</button></div>${status()}</div>`)
      .join("")}</section>`;
    container.querySelectorAll("[data-withdraw-queue]").forEach((button) =>
      button.addEventListener("click", async () => {
        const e = mine.find((x) => x.id === button.dataset.withdrawQueue);
        if (!(await UI.confirmAction("Leave the waiting list?", `You’ll lose your place in line for ${rankName(state, e.rank_id)}. To come back, you’d need to qualify or be added again.`, "Leave the list"))) return;
        const card = button.closest("[data-queue-place]");
        if (await UI.busy(button, card.querySelector("[data-status]"), () => D.withdrawFromQueue(state.coven.id, e.id).then(() => true))) {
          if (refresh) refresh("path");
          else myPlaces(container, state);
        }
      })
    );
  }

  // --- Manage → Positions → a position ---------------------------------------

  async function leaderPanel(container, state, rank, { refresh } = {}) {
    if (!container || !Q() || rank.is_default) return;
    const S = Q();
    let list;
    try {
      list = await D.queueList(rank.id);
    } catch {
      container.innerHTML = "";
      return;
    }
    if (!list) return;
    const members = await D.members(state.coven.id).catch(() => []);
    await UI.loadNames(state.context, members.map((m) => m.user_id));
    const ids = list.entries.map((e) => e.id);
    const onList = new Set(list.entries.map((e) => e.user_id));
    const people = candidates(state, rank, members).filter((m) => !onList.has(m.user_id));
    const reload = () => leaderPanel(container, state, rank, { refresh });

    container.innerHTML = `<section class="sp-section" data-queue-panel>
        <h3>Waiting list</h3>
        <p class="sp-caption">${list.entries.length
          ? `${list.entries.length} in line, in order. When a place frees, the first is proposed to you on Review; nobody is moved until you confirm.`
          : "No one is waiting. When the position is full, those who finish a program that leads to it, and requests you approve onto the list, wait here in order."}</p>
        <ol class="cv-queue">${list.entries
          .map((e, i) => `<li class="sp-card${e.status === "proposed" ? " sp-card--gold" : ""}" data-entry="${esc(e.id)}">
            <p><strong>${esc(e.name)}</strong></p>
            <p class="sp-caption">${esc(S.entryLine(e))}</p>
            ${e.note ? `<p class="sp-caption">“${esc(e.note)}”</p>` : ""}
            <div class="sp-actions">
              <button class="button button--ghost button--small" type="button" data-move="-1" ${i === 0 ? "disabled" : ""}>Move up</button>
              <button class="button button--ghost button--small" type="button" data-move="1" ${i === ids.length - 1 ? "disabled" : ""}>Move down</button>
              <button class="button button--ghost button--small" type="button" data-remove-open>Take off the list</button>
            </div>
            <form class="sp-section" data-remove hidden>
              <div class="sp-field"><label>Why (kept with the list)<input name="reason" maxlength="500" required /></label></div>
              <div class="sp-actions"><button class="button button--primary button--small" type="submit">Take ${esc(e.name)} off</button></div>
            </form>
            ${status()}</li>`)
          .join("")}</ol>
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-add-open>Add someone to the list</button></div>
        <div data-add hidden></div>
        ${status()}
        ${list.history.length ? `<details class="sp-details"><summary>What happened</summary><div class="sp-list">${list.history
          .map((h) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(S.eventLine(h))}</span><span class="sp-row__detail">${esc(new Date(h.at).toLocaleString(undefined, { day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }))}</span></span></div>`)
          .join("")}</div></details>` : ""}
      </section>`;
    const panelStatus = container.querySelector("[data-queue-panel] > [data-status]");

    container.querySelectorAll("[data-entry]").forEach((li) => {
      const id = li.dataset.entry;
      li.querySelectorAll("[data-move]").forEach((button) =>
        button.addEventListener("click", async () => {
          if (await UI.busy(button, li.querySelector("[data-status]"), () => D.reorderQueue(rank.id, S.moved(ids, id, Number(button.dataset.move))).then(() => true))) reload();
        })
      );
      const form = li.querySelector("[data-remove]");
      li.querySelector("[data-remove-open]").addEventListener("click", () => (form.hidden = !form.hidden));
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (await UI.busy(form, li.querySelector("[data-status]"), () => D.removeFromQueue(state.coven.id, id, form.elements.reason.value).then(() => true))) reload();
      });
    });
    const add = container.querySelector("[data-add]");
    container.querySelector("[data-add-open]").addEventListener("click", () => {
      add.hidden = !add.hidden;
      if (!add.hidden)
        picker(add, state, people, `Find someone to add to the list for ${rank.name}`, async (m, button) => {
          if (await UI.busy(button, panelStatus, () => D.addToQueue(state.coven.id, rank.id, m.user_id, "").then(() => true))) reload();
        });
    });
  }

  // --- Review: a place is free ------------------------------------------------

  async function proposals(container, state, { refresh } = {}) {
    if (!container || !Q() || !(state.perms.manage || state.perms.site)) return;
    const S = Q();
    const entries = await D.queues(state.coven.id);
    const list = S.proposals(entries);
    if (!list.length) {
      container.innerHTML = "";
      return;
    }
    const members = await D.members(state.coven.id).catch(() => []);
    await UI.loadNames(state.context, members.map((m) => m.user_id));
    container.innerHTML = `<section class="sp-section"><h2>Places to fill</h2>${list
      .map((p) => {
        const rank = state.ranks.find((r) => r.id === p.rank_id);
        if (!rank) return "";
        const others = S.othersInLine(entries, p);
        return `<article class="sp-card${p.deferred_at ? "" : " sp-card--gold"}" data-proposal="${esc(p.id)}">
            <h3>${esc(S.proposalLine(rank.name, p.name))}</h3>
            <p class="sp-caption">${esc(S.entryLine(p))}${rank.seat_limit != null ? ` · ${esc(p.held ?? 0)} of ${esc(rank.seat_limit)} places held` : ""}${p.deferred_at ? " · you chose “Not now”" : ""}</p>
            <div class="sp-actions">
              <button class="button button--primary button--small" type="button" data-promote>Promote ${esc(p.name)}</button>
              <button class="button button--ghost button--small" type="button" data-choose>Choose someone else</button>
              ${p.deferred_at ? "" : `<button class="button button--ghost button--small" type="button" data-not-now>Not now</button>`}
            </div>
            <div data-chooser hidden>
              <label class="cv-check"><input type="checkbox" data-pass-over /> <span>Take ${esc(p.name)} off the list</span></label>
              <div class="sp-field"><label>A note for the list (needed when you take them off)<input maxlength="500" data-note /></label></div>
              ${others.length ? `<div class="sp-list">${others
                .map((e, i) => `<button class="sp-row cv-row-button" type="button" data-pick-entry="${esc(e.user_id)}"><span class="sp-row__text"><span class="sp-row__title">${esc(e.place ?? i + 2)}. ${esc(e.name)}</span><span class="sp-row__detail">${esc(S.entryLine(e))}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></button>`)
                .join("")}</div>` : ""}
              <div data-any></div>
            </div>
            ${status()}
          </article>`;
      })
      .join("")}</section>`;

    container.querySelectorAll("[data-proposal]").forEach((card) => {
      const p = list.find((x) => x.id === card.dataset.proposal);
      const rank = state.ranks.find((r) => r.id === p.rank_id);
      const out = card.querySelector("[data-status]");
      const done = () => (refresh ? refresh("review") : proposals(container, state));
      const fill = async (userId, name, button) => {
        const passOver = card.querySelector("[data-pass-over]")?.checked;
        const note = card.querySelector("[data-note]")?.value || "";
        if (passOver && !note.trim()) return UI.setStatus(out, `Say why ${p.name} is taken off the list.`, true);
        if (!(await UI.confirmAction(`Give ${rank.name} to ${name}?`, passOver ? `${p.name} comes off the waiting list.` : `${p.name} keeps their place in line.`, "Give it"))) return;
        if (await UI.busy(button, out, () => D.fillPosition(state.coven.id, rank.id, userId, note, passOver).then(() => true))) done();
      };
      card.querySelector("[data-promote]").addEventListener("click", async (event) => {
        const button = event.currentTarget;
        if (!(await UI.confirmAction(`Make ${p.name} ${rank.name}?`, "They’re told on their phone.", "Promote"))) return;
        if (await UI.busy(button, out, () => D.fillPosition(state.coven.id, rank.id, p.user_id, "", false).then(() => true))) done();
      });
      card.querySelector("[data-not-now]")?.addEventListener("click", async (event) => {
        if (await UI.busy(event.currentTarget, out, () => D.holdProposal(p.id, "").then(() => true))) done();
      });
      const chooser = card.querySelector("[data-chooser]");
      card.querySelector("[data-choose]").addEventListener("click", () => {
        chooser.hidden = !chooser.hidden;
        if (chooser.hidden || chooser.dataset.ready) return;
        chooser.dataset.ready = "1";
        chooser.querySelectorAll("[data-pick-entry]").forEach((b) => b.addEventListener("click", () => fill(b.dataset.pickEntry, UI.nameOf(state.context, b.dataset.pickEntry), b)));
        const onList = new Set(entries.filter((e) => e.rank_id === rank.id).map((e) => e.user_id));
        picker(chooser.querySelector("[data-any]"), state, candidates(state, rank, members).filter((m) => !onList.has(m.user_id)), "Or find any member who could hold it", (m, b) => fill(m.user_id, UI.nameOf(state.context, m.user_id), b));
      });
    });
  }

  global.CovenQueue = { myPlaces, leaderPanel, proposals, candidates };
})(window);
