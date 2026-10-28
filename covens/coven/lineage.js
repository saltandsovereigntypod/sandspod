/*
 * Daughter covens and leadership on a coven's page, as the app has them
 * (app/src/app/(tabs)/coven/c/[slug]/lineage/…, manage/leadership.tsx,
 * unreachable.tsx; rules in app/src/lib/covens/lineage.ts →
 * SaltCore.covens.lineage; data in covens/lineage-data.js).
 *
 * CovenLineage: the Daughter covens tab (?tab=lineage): the mother coven and
 *   its disclosure, daughters, founding one (and the head's answers), what the
 *   mother shares (and pushing an update), releasing, and the lineage log.
 * CovenLineageUI: the disclosure, the About tab's lineage lines, the hand-on
 *   choice in Members, Manage → Leadership (succession, who may found
 *   daughters) and "The head can't be reached" for elders.
 * The database decides who may do each (…_coven_lineage.sql).
 */
(function (global) {
  "use strict";

  const UI = global.CovenUI;
  const LD = global.CovenLineageData;
  const { esc, prose, href } = UI;
  const X = () => global.SaltCore?.covens?.lineage;
  const statusLine = (attr = "data-status") => `<p class="cv-status" role="status" aria-live="polite" ${attr}></p>`;
  const covenLink = (slug) => href(`/covens/coven/?c=${encodeURIComponent(slug)}`);

  // --- Shared pieces --------------------------------------------------------

  /** "{Daughter} is a daughter coven of {Mother}. …final say over this coven." */
  function disclosureHtml(text, joining) {
    if (!text) return "";
    return `<div class="cv-banner cv-banner--lineage" data-disclosure><p><strong>A daughter coven.</strong> ${esc(text)}${joining ? " By joining, you join under that final say. The member agreement says so too." : ""}</p></div>`;
  }

  /** The About tab's lineage: "Hived from …" and "Daughter covens", each linked where you may see it. */
  function aboutHtml(state) {
    const lineage = state.lineage;
    const Lx = X();
    if (!lineage || !Lx || (!lineage.mother && !lineage.daughters?.length)) return "";
    const mother = lineage.mother
      ? `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${lineage.mother.slug ? `<a href="${esc(covenLink(lineage.mother.slug))}">${esc(Lx.hivedLine(lineage))}</a>` : esc(Lx.hivedLine(lineage))}</span>
          ${lineage.mother.head ? `<span class="sp-row__detail">${esc(lineage.mother.head.title)} ${esc(lineage.mother.head.name)} has final say here</span>` : ""}</span></div>`
      : "";
    const above = (lineage.above || [])
      .map((a) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${a.slug ? `<a href="${esc(covenLink(a.slug))}">Descends from ${esc(a.name || "an unlisted coven")}</a>` : `Descends from ${esc(a.name || "an unlisted coven")}`}</span>
          ${a.head ? `<span class="sp-row__detail">${esc(a.head.title)} ${esc(a.head.name)} has final say too</span>` : ""}</span></div>`)
      .join("");
    const daughters = (lineage.daughters || [])
      .map((d) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${d.slug ? `<a href="${esc(covenLink(d.slug))}">${esc(Lx.daughterLabel(d))}</a>` : esc(Lx.daughterLabel(d))}</span>
          <span class="sp-row__detail">${esc(Lx.daughterDetail(d) || "Daughter coven")}</span></span></div>`)
      .join("");
    return `<section class="sp-section" data-lineage-about><h2>Lineage</h2><div class="sp-list">${mother}${above}</div>
      ${daughters ? `<h3>Daughter covens</h3><div class="sp-list">${daughters}</div>` : ""}</section>`;
  }

  /** Fill a container with a daughter coven's disclosure, read by its address (anyone may). */
  async function mountDisclosure(container, slug, joining) {
    if (!container || !slug) return;
    const d = await LD.disclosure(slug);
    container.innerHTML = disclosureHtml(d?.text, joining);
  }

  /** The hand-on choice inside a member's form: what the head who steps back keeps. */
  function handOnFields(state, member) {
    const Lx = X();
    if (!Lx) return "";
    const youHandOn = state.coven.founder_id === state.context.user?.id;
    const headRow = state.ranks.find((r) => r.id === state.headMembership?.rank_id) || (youHandOn ? state.perms.rank : null);
    const keep = Lx.handOnDefault(state.ranks, headRow, youHandOn);
    const steps = Lx.stepDownOptions(state.ranks);
    return `<fieldset class="cv-handon" data-handon hidden>
        <legend>Hand on leadership to ${esc(UI.nameOf(state.context, member.user_id))}</legend>
        <label class="cv-check"><input type="radio" name="old_head" value="keep" checked /> <span>${esc(keep.words)}</span></label>
        <label class="cv-check"><input type="radio" name="old_head" value="step_down" /> <span>${youHandOn ? "Step down" : "Its current head steps down"} to a position that doesn’t lead:</span></label>
        <div class="sp-field"><label>Position<select name="step_to">${steps.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join("")}</select></label></div>
        <p class="sp-caption" data-handon-words></p>
        <p class="sp-caption">Only the new head (or the head of a mother coven, or a site moderator) can hand it on again.</p>
        <div class="sp-actions"><button class="button button--primary button--small" type="submit" data-act="handon">Hand on</button><button class="button button--ghost button--small" type="button" data-handon-cancel>Not now</button></div>
      </fieldset>`;
  }

  /** Wire a member's hand-on fields: open them, keep the words current, and hand on. */
  function wireHandOn(form, state, member, done) {
    const set = form.querySelector("[data-handon]");
    if (!set) return;
    const Lx = X();
    const name = UI.nameOf(state.context, member.user_id);
    const youHandOn = state.coven.founder_id === state.context.user?.id;
    const headRow = state.ranks.find((r) => r.id === state.headMembership?.rank_id) || (youHandOn ? state.perms.rank : null);
    const keep = Lx.handOnDefault(state.ranks, headRow, youHandOn);
    const words = () => {
      const choice = form.elements.old_head.value;
      const stepTo = state.ranks.find((r) => r.id === form.elements.step_to?.value) || null;
      set.querySelector("[data-handon-words]").textContent = Lx.handOnSummary({ name, covenName: state.coven.name, choice, keepWords: keep.words, stepTo, you: youHandOn });
    };
    set.addEventListener("change", words);
    words();
    form.querySelector("[data-act=transfer]")?.addEventListener("click", (event) => {
      event.preventDefault();
      set.hidden = false;
      set.querySelector("input")?.focus();
    });
    set.querySelector("[data-handon-cancel]").addEventListener("click", () => (set.hidden = true));
    form.addEventListener("submit", async (event) => {
      if (event.submitter?.dataset.act !== "handon") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const choice = form.elements.old_head.value;
      const status = form.parentElement.querySelector("[data-status]");
      if (await UI.busy(form, status, () => LD.handOn(state.coven.id, member.user_id, choice, form.elements.step_to?.value || null).then(() => true), { done: `${name} now leads the coven.` })) done();
    }, true);
  }

  /** The heads of covens above this one, at the top of Members ("Mother coven"). */
  function headsAboveHtml(state) {
    const lineage = state.lineage;
    if (!lineage) return "";
    const heads = [
      ...(lineage.mother ? [{ coven: lineage.mother.name || "Its mother coven", head: lineage.mother.head }] : []),
      ...(lineage.above || []).filter((a) => a.head).map((a) => ({ coven: a.name || "A coven above it", head: a.head }))
    ];
    return heads
      .map((h) => `<div class="sp-card cv-mother-head"><p><strong>${esc(h.head.name)}</strong> <span class="cv-pill cv-pill--gold">Mother coven</span> <span class="cv-pill">${esc(h.head.title)} of ${esc(h.coven)}</span></p>
        <p class="sp-caption">Has final say over this coven, without being a member of it.</p></div>`)
      .join("");
  }

  // --- Manage → Leadership --------------------------------------------------

  async function leadershipPanel(holder, state) {
    if (!holder) return;
    const { coven, perms, context } = state;
    const head = perms.founder;
    holder.innerHTML = `<p class="sp-caption">Loading leadership…</p>`;
    const [members, plan, founders] = await Promise.all([global.CovenData.members(coven.id).catch(() => []), LD.succession(coven.id), LD.founders(coven.id)]);
    await UI.loadNames(context, members.map((m) => m.user_id));
    const others = members.filter((m) => m.status === "active" && m.user_id !== coven.founder_id);
    const option = (id, chosen) => `<option value="${esc(id)}"${id === chosen ? " selected" : ""}>${esc(UI.nameOf(context, id))}</option>`;
    const named = new Set(founders.map((f) => f.user_id));
    holder.innerHTML = `<section class="sp-section" data-leadership><h2>Leadership</h2>
      ${head ? "" : `<p class="sp-caption">Only the coven’s head (or the head of its mother coven) changes these.</p>`}
      <form class="sp-card" data-succession>
        <h3>Succession plan</h3>
        <p class="sp-caption">Name who leads the coven next, and a second. If the head closes their account, the coven goes to them. If the head can’t be reached, the coven’s elders can tell the site moderators, who can hand it on to them.</p>
        <div class="sp-field"><label for="succ-first">Successor</label><select id="succ-first" name="first" ${head ? "" : "disabled"}><option value="">No one</option>${others.map((m) => option(m.user_id, plan?.successor_id)).join("")}</select></div>
        <div class="sp-field"><label for="succ-second">Second</label><select id="succ-second" name="second" ${head ? "" : "disabled"}><option value="">No one</option>${others.map((m) => option(m.user_id, plan?.second_id)).join("")}</select></div>
        ${plan ? `<p class="sp-caption">Last set ${esc(new Date(plan.updated_at).toLocaleDateString())}${plan.set_by ? ` by ${esc(UI.nameOf(context, plan.set_by))}` : ""}.</p>` : ""}
        ${head ? `<div class="sp-actions"><button class="button button--primary button--small" type="submit">Save the plan</button></div>` : ""}
        ${statusLine()}
      </form>
      <div class="sp-card" data-founders>
        <h3>Who may ask to found a daughter coven</h3>
        <p class="sp-caption">Positions with this power can ask; so can anyone you name. You approve every request either way.</p>
        ${[...state.ranks].sort((a, b) => b.level - a.level).map((r) => `<label class="cv-check"><input type="checkbox" data-rank-founds="${esc(r.id)}" ${r.can_found_daughter ? "checked" : ""} ${head ? "" : "disabled"} /> <span>${esc(r.name)}</span></label>`).join("")}
        ${others.length ? `<h4>Named by you</h4>${others.map((m) => `<label class="cv-check"><input type="checkbox" data-person-founds="${esc(m.user_id)}" ${named.has(m.user_id) ? "checked" : ""} ${head ? "" : "disabled"} /> <span>${esc(UI.nameOf(context, m.user_id))}</span></label>`).join("")}` : ""}
        ${statusLine()}
      </div></section>`;
    const form = holder.querySelector("[data-succession]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const first = form.elements.first.value;
      const second = form.elements.second.value;
      if (first && first === second) return UI.setStatus(form.querySelector("[data-status]"), "Choose two different people.", true);
      await UI.busy(form, form.querySelector("[data-status]"), () => LD.setSuccessors(coven.id, first, first ? second : null).then(() => true), { done: first ? `${UI.nameOf(context, first)} is named to lead next. They’re told.` : "No successor is named." });
    });
    const box = holder.querySelector("[data-founders]");
    box.addEventListener("change", async (event) => {
      const input = event.target;
      const status = box.querySelector("[data-status]");
      const work = input.dataset.rankFounds ? () => LD.setRankFounds(input.dataset.rankFounds, input.checked).then(() => true) : () => LD.setFounder(coven.id, input.dataset.personFounds, input.checked).then(() => true);
      if (!(await UI.busy(input, status, work, { done: "Saved." }))) input.checked = !input.checked;
    });
  }

  // --- The head can't be reached ---------------------------------------------

  async function unreachablePanel(holder, state) {
    if (!holder) return;
    const { coven, context } = state;
    const [plan, mine] = await Promise.all([LD.succession(coven.id), LD.myHeadReport(coven.id, context.user?.id)]);
    await UI.loadNames(context, [plan?.successor_id, plan?.second_id, coven.founder_id]);
    holder.innerHTML = `<details class="sp-details" data-unreachable><summary>The head can’t be reached</summary>
      <p>If ${esc(UI.nameOf(context, coven.founder_id))} has gone quiet and can’t be reached, the coven’s elders can tell the Salt &amp; Sovereignty moderators. They see the coven, its succession plan and how long the head has been away, and they decide whether to hand the coven on.</p>
      <p class="sp-caption">${plan?.successor_id ? `The coven’s plan names ${esc(UI.nameOf(context, plan.successor_id))} to lead next${plan.second_id ? `, then ${esc(UI.nameOf(context, plan.second_id))}` : ""}.` : "No successor is named, so the moderators will look at who leads with the head."}</p>
      ${mine?.status === "open" ? `<p class="sp-notice">You told the moderators on ${esc(new Date(mine.created_at).toLocaleDateString())}. It’s with them.</p>` : `<form data-report-head>
        <div class="sp-field"><label for="head-note">What’s happened (optional)</label><textarea id="head-note" name="note" maxlength="2000"></textarea></div>
        <div class="sp-actions"><button class="button button--ghost" type="submit">Tell the site moderators</button></div>${statusLine()}</form>`}
    </details>`;
    const form = holder.querySelector("[data-report-head]");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await UI.busy(form, form.querySelector("[data-status]"), () => LD.reportHead(coven.id, form.elements.note.value).then(() => true), { done: "Sent to the site moderators. They’ll look at it and decide." });
    });
  }

  // --- The Daughter covens tab ------------------------------------------------

  const CovenLineage = {
    async mount(pane, state, { refresh }) {
      const Lx = X();
      const { coven, context, perms } = state;
      const lineage = state.lineage;
      if (!lineage || !Lx) return (pane.innerHTML = `<p class="sp-notice">Daughter covens aren’t open here yet.</p>`);
      const me = context.user?.id;
      const ownHead = coven.founder_id === me;
      const mine = me ? await LD.myRequests(coven.id, me) : [];
      const latest = mine[0];
      const pending = mine.find((r) => r.status === "pending");
      const motherName = lineage.mother?.name || "your mother coven";

      pane.innerHTML = `
        ${lineage.mother ? `<section class="sp-section" data-mother><h2>Mother coven</h2>
          <p><strong>${lineage.mother.slug ? `<a href="${esc(covenLink(lineage.mother.slug))}">${esc(Lx.hivedLine(lineage))}</a>` : esc(Lx.hivedLine(lineage))}</strong></p>
          ${disclosureHtml(lineage.disclosure)}
          <details class="sp-details" data-library-details><summary>From your mother coven</summary><div data-library><p class="sp-caption">Loading…</p></div></details>
          ${ownHead && !lineage.ancestor ? `<form class="sp-card" data-ask-release>
            <h3>Becoming independent</h3>
            ${lineage.release_request ? `<p>You’ve asked ${esc(motherName)} to release this coven. Its head decides.</p><div class="sp-actions"><button class="button button--ghost" type="submit" value="withdraw">Take back the request</button></div>` : `<p>Only the head of ${esc(motherName)} can release this coven. You can ask; they decide.</p>
              <div class="sp-field"><label for="release-note">A note for them (optional)</label><textarea id="release-note" name="note" maxlength="2000"></textarea></div>
              <div class="sp-actions"><button class="button button--ghost" type="submit" value="ask">Ask to be released</button></div>`}${statusLine()}</form>` : ""}
          ${lineage.ancestor || perms.site ? `<form class="sp-card" data-release-self>
            <h3>Release this coven</h3>
            <p>${esc(coven.name)} would no longer count ${esc(motherName)} as its mother. You, and the heads above you, would lose your say over it. What it has copied stays its own.</p>
            ${lineage.release_request ? `<p class="sp-caption">Its head has asked to be released${lineage.release_request.note ? `: “${esc(lineage.release_request.note)}”` : "."}</p>` : ""}
            <div class="sp-field"><label for="release-self-note">A note (optional)</label><textarea id="release-self-note" name="note" maxlength="2000"></textarea></div>
            <div class="sp-actions"><button class="button button--ghost" type="submit" value="release">Release this coven</button>${lineage.release_request ? `<button class="button button--ghost" type="submit" value="keep">Keep the link</button>` : ""}</div>${statusLine()}</form>` : ""}
        </section>` : ""}

        <section class="sp-section" data-daughters><h2>Daughter covens</h2>
          ${lineage.daughters.length ? `<div class="sp-list">${lineage.daughters.map((d) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${d.slug ? `<a href="${esc(covenLink(d.slug))}">${esc(Lx.daughterLabel(d))}</a>` : esc(Lx.daughterLabel(d))}</span><span class="sp-row__detail">${esc(Lx.daughterDetail(d) || "Daughter coven")}</span></span>
            ${lineage.may_decide ? `<button class="button button--ghost button--small" type="button" data-release-daughter="${esc(d.id)}" data-name="${esc(Lx.daughterLabel(d))}">Release…</button>` : ""}</div>`).join("")}</div>` : `<p class="sp-caption">No daughter covens yet.</p>`}
          ${lineage.may_decide ? (lineage.release_requests || []).map((r) => `<div class="sp-card" data-release-request="${esc(r.id)}" data-daughter="${esc(r.daughter_coven_id)}"><p><strong>${esc(r.daughter_name || "A daughter coven")} asks to be released</strong></p>${r.note ? `<p>“${esc(r.note)}”</p>` : ""}
            <p class="sp-caption">Releasing ends the link: you lose your say over it, and it keeps what it copied.</p>
            <div class="sp-actions"><button class="button button--ghost button--small" type="button" value="yes">Release it</button><button class="button button--ghost button--small" type="button" value="no">Keep the link</button></div>${statusLine()}</div>`).join("") : ""}
          ${statusLine("data-daughters-status")}
        </section>

        <section class="sp-section"><h2>Founding and sharing</h2>
          ${latest ? `<div class="sp-card" data-my-request><p>${esc(Lx.requestLine(latest))}</p>${latest.status === "pending" ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-withdraw-request="${esc(latest.id)}">Withdraw it</button></div>${statusLine()}` : ""}</div>` : ""}
          ${lineage.may_found && !pending ? `<details class="sp-details" data-found-details><summary>Found a daughter coven</summary><div data-found></div></details>` : ""}
          ${lineage.may_decide ? `<details class="sp-details" data-requests-details ${lineage.pending_requests ? "open" : ""}><summary>Requests to found${lineage.pending_requests ? ` (${lineage.pending_requests} waiting)` : ""}</summary><div data-requests></div></details>
            <details class="sp-details" data-share-details><summary>Share with your daughter covens</summary><div data-share></div></details>` : ""}
          ${perms.manage ? `<details class="sp-details" data-log-details><summary>The lineage log</summary><div data-log></div></details>` : ""}
          ${!lineage.may_found && !lineage.may_decide ? `<p class="sp-caption">Founding a daughter coven is for positions the head allows, and for anyone the head names.</p>` : ""}
        </section>`;

      const lazy = (selector, fill) => {
        const details = pane.querySelector(selector);
        if (!details) return;
        const run = () => !details.dataset.loaded && (details.dataset.loaded = "1") && fill(details.querySelector("div"));
        details.addEventListener("toggle", () => details.open && run());
        if (details.open) run();
      };
      lazy("[data-library-details]", (box) => libraryView(box, state));
      lazy("[data-found-details]", (box) => foundView(box, state, refresh));
      lazy("[data-requests-details]", (box) => requestsView(box, state, refresh));
      lazy("[data-share-details]", (box) => shareView(box, state));
      lazy("[data-log-details]", (box) => logView(box, state));

      pane.querySelector("[data-withdraw-request]")?.addEventListener("click", async (event) => {
        const button = event.currentTarget;
        if (await UI.busy(button, button.closest(".sp-card").querySelector("[data-status]"), () => LD.withdrawRequest(coven.id, button.dataset.withdrawRequest).then(() => true))) refresh("lineage");
      });
      const ask = pane.querySelector("[data-ask-release]");
      ask?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const withdraw = event.submitter?.value === "withdraw";
        const work = withdraw ? () => LD.decideRelease(coven.id, lineage.release_request.id, false, "") : () => LD.askRelease(coven.id, ask.elements.note.value);
        if (await UI.busy(ask, ask.querySelector("[data-status]"), () => work().then(() => true))) refresh("lineage");
      });
      const self = pane.querySelector("[data-release-self]");
      self?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const keep = event.submitter?.value === "keep";
        if (!keep && !(await UI.confirmAction(`Release ${coven.name}?`, `It will no longer count ${motherName} as its mother.`, "Release"))) return;
        const work = keep ? () => LD.decideRelease(coven.id, lineage.release_request.id, false, self.elements.note.value) : () => LD.release(coven.id, self.elements.note.value);
        if (await UI.busy(self, self.querySelector("[data-status]"), () => work().then(() => true))) refresh("lineage");
      });
      pane.querySelectorAll("[data-release-daughter]").forEach((button) =>
        button.addEventListener("click", async () => {
          const name = button.dataset.name;
          if (!(await UI.confirmAction(`Release ${name}?`, `${name} would no longer count ${coven.name} as its mother. You would lose your say over it.`, "Release"))) return;
          if (await UI.busy(button, pane.querySelector("[data-daughters-status]"), () => LD.release(button.dataset.releaseDaughter, "").then(() => true))) refresh("lineage");
        })
      );
      pane.querySelectorAll("[data-release-request]").forEach((card) =>
        card.querySelectorAll("button").forEach((button) =>
          button.addEventListener("click", async () => {
            if (await UI.busy(button, card.querySelector("[data-status]"), () => LD.decideRelease(card.dataset.daughter, card.dataset.releaseRequest, button.value === "yes", "").then(() => true))) refresh("lineage");
          })
        )
      );
    }
  };

  async function libraryView(box, state) {
    const Lx = X();
    const items = await LD.motherLibrary(state.coven.id);
    const mother = state.lineage.mother?.name || "your mother coven";
    box.innerHTML = `<p class="sp-caption">What ${esc(mother)} shares with its daughter covens. Copying is one way, and only when you choose: nothing here ever changes your copies by itself. (The head of ${esc(mother)} can update a copy of yours; it’s kept in the lineage log.)</p>
      ${items.length ? `<div class="sp-list">${items.map((item, i) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(item.title)}</span><span class="sp-row__detail">${esc(Lx.KIND_LABELS[item.kind])} · ${esc(Lx.libraryLine(item))}</span></span>
        ${state.perms.manage ? `<button class="button button--ghost button--small" type="button" data-copy="${i}">${Lx.libraryState(item) === "new" ? "Copy in" : "Copy again"}</button>` : ""}</div>`).join("")}</div>` : `<p class="sp-caption">${esc(mother)} isn’t sharing anything with its daughters yet.</p>`}
      ${statusLine()}`;
    box.querySelectorAll("[data-copy]").forEach((button) =>
      button.addEventListener("click", async () => {
        const item = items[Number(button.dataset.copy)];
        if (await UI.busy(button, box.querySelector("[data-status]"), () => LD.copyFromMother(state.coven.id, item.kind, item.item_id).then(() => true), { done: `“${item.title}” is copied in. It’s the coven’s own now.` })) {
          box.dataset.loaded = "";
          libraryView(box, state);
        }
      })
    );
  }

  function foundView(box, state, refresh) {
    const Lx = X();
    const { coven } = state;
    const head = coven.founder_id === state.context.user?.id;
    const mother = coven.name;
    box.innerHTML = `<form class="sp-card" data-found-form>
      <p>A daughter coven hives off from ${esc(mother)}: a coven of its own, with its own High Priestess running it day to day, under the final say of ${esc(mother)}’s head. ${head ? "As the head, your request is approved as you send it." : `The head of ${esc(mother)} approves it and chooses who leads it (usually you).`}</p>
      <div class="sp-field"><label for="d-name">Name</label><input id="d-name" name="name" required minlength="3" maxlength="80" /></div>
      <div class="sp-field"><label for="d-slug">Address</label><input id="d-slug" name="slug" maxlength="60" autocapitalize="none" /><p class="sp-caption">saltandsovereignty.com/covens/coven/?c=<span data-slug-preview>your-coven</span></p></div>
      <div class="sp-field"><label for="d-tagline">One line about it (optional)</label><input id="d-tagline" name="tagline" maxlength="160" /></div>
      <div class="sp-field"><label for="d-tradition">Tradition or path (optional)</label><input id="d-tradition" name="tradition" maxlength="80" value="${esc(coven.tradition || "")}" /></div>
      <div class="sp-field"><label for="d-title">What its head is called</label><input id="d-title" name="founder_rank" maxlength="60" value="High Priestess" /></div>
      <div class="sp-field"><label for="d-joining">How witches join</label><select id="d-joining" name="joining"><option value="application">By application</option><option value="open">Open to join</option><option value="closed">Closed for now</option></select></div>
      <div class="sp-field"><label for="d-visibility">Directory</label><select id="d-visibility" name="visibility"><option value="listed">Listed</option><option value="unlisted">Unlisted (link only)</option></select></div>
      <fieldset data-copy-picker><legend>Carry across from ${esc(mother)}</legend>
        ${Lx.COPY_CHOICES.map((c) => `<label class="cv-check"><input type="checkbox" name="copy" value="${esc(c.key)}" checked /> <span><strong>${esc(c.label)}</strong><br /><span class="sp-caption">${esc(Lx.copyDetail(c, mother))}</span></span></label>`).join("")}
        <p class="sp-caption">${esc(Lx.NEVER_COPIED)} Copies are the new coven’s own; changing one never changes the other.</p>
      </fieldset>
      ${head ? "" : `<fieldset data-membership><legend>Your place in ${esc(mother)}</legend>
        ${Lx.MEMBERSHIP_CHOICES.map((c, i) => `<label class="cv-check"><input type="radio" name="membership" value="${esc(c.value)}" ${i === 0 ? "checked" : ""} /> <span><strong>${esc(c.label)}</strong><br /><span class="sp-caption">${esc(c.detail(mother))}</span></span></label>`).join("")}
      </fieldset>
      <div class="sp-field"><label for="d-note">A note for the head of ${esc(mother)} (optional)</label><textarea id="d-note" name="note" maxlength="2000"></textarea></div>`}
      <p class="sp-caption">Everyone who joins the new coven is told first that it’s a daughter coven of ${esc(mother)}, and that ${esc(mother)}’s head has final say over it. Its member agreement says so too.</p>
      <div class="sp-actions"><button class="button button--primary" type="submit">${head ? "Found it" : "Ask to found it"}</button></div>
      ${statusLine()}</form>`;
    const form = box.querySelector("form");
    let touched = false;
    const preview = form.querySelector("[data-slug-preview]");
    const address = () => (touched ? form.elements.slug.value : Lx.slugFrom(form.elements.name.value));
    form.elements.name.addEventListener("input", () => {
      if (!touched) form.elements.slug.value = Lx.slugFrom(form.elements.name.value);
      preview.textContent = address() || "your-coven";
    });
    form.elements.slug.addEventListener("input", () => {
      touched = true;
      form.elements.slug.value = form.elements.slug.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      preview.textContent = address() || "your-coven";
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector("[data-status]");
      const draft = { name: form.elements.name.value.trim(), slug: address(), tagline: form.elements.tagline.value.trim(), tradition: form.elements.tradition.value.trim(), joining: form.elements.joining.value, visibility: form.elements.visibility.value, founder_rank: form.elements.founder_rank.value.trim() };
      const problems = Lx.requestProblems(draft);
      if (problems.length) return UI.setStatus(status, problems.join(" "), true);
      const chosen = new Set([...form.querySelectorAll("[name=copy]:checked")].map((i) => i.value));
      const copy = Object.fromEntries(Lx.COPY_CHOICES.map((c) => [c.key, chosen.has(c.key)]));
      const membership = head ? "stay" : form.querySelector("[name=membership]:checked")?.value || "stay";
      const made = await UI.busy(form, status, () => LD.requestDaughter(coven.id, draft, copy, membership, head ? "" : form.elements.note.value));
      if (!made) return;
      if (made.status === "approved") return global.location.assign(covenLink(made.slug));
      UI.setStatus(status, `Your request is with ${UI.nameOf(state.context, coven.founder_id)}, the head of ${mother}. You’ll hear when they answer.`);
      setTimeout(() => refresh("lineage"), 1200);
    });
  }

  async function requestsView(box, state, refresh) {
    const Lx = X();
    const { coven, context } = state;
    const [requests, members] = await Promise.all([LD.requests(coven.id), global.CovenData.members(coven.id).catch(() => [])]);
    await UI.loadNames(context, [...requests.map((r) => r.requested_by), ...members.map((m) => m.user_id)]);
    const pending = requests.filter((r) => r.status === "pending");
    const decided = requests.filter((r) => r.status !== "pending").slice(0, 10);
    const me = context.user?.id;
    const heads = (r) => [r.requested_by, me, ...members.filter((m) => m.status === "active").map((m) => m.user_id)].filter((id, i, all) => id && all.indexOf(id) === i).slice(0, 40);
    box.innerHTML = `${pending.length ? "" : `<p class="sp-caption">No requests are waiting.</p>`}
      ${pending.map((r) => {
        const choice = Lx.MEMBERSHIP_CHOICES.find((c) => c.value === r.membership);
        return `<form class="sp-card" data-request="${esc(r.id)}">
          <p class="sp-eyebrow">${esc(UI.nameOf(context, r.requested_by))} asks to found</p>
          <h3>${esc(r.name)}</h3>
          <p class="sp-caption">${esc(r.slug)} · ${r.visibility === "unlisted" ? "unlisted" : "listed"}${r.tradition ? ` · ${esc(r.tradition)}` : ""}</p>
          ${r.note ? `<p>“${esc(r.note)}”</p>` : ""}
          ${choice ? `<p class="sp-caption">In ${esc(coven.name)}, they chose: ${esc(choice.label.toLowerCase())}. ${esc(choice.detail(coven.name))}</p>` : ""}
          <div class="sp-field"><label for="head-${esc(r.id)}">Its High Priestess</label><select id="head-${esc(r.id)}" name="head">${heads(r).map((id) => `<option value="${esc(id)}"${id === r.requested_by ? " selected" : ""}>${esc(UI.nameOf(context, id))}${id === r.requested_by ? " (asked)" : id === me ? " (you)" : ""}</option>`).join("")}</select></div>
          <p class="sp-caption">They run it day to day, with full head powers, under your final say. You can change who leads it later.</p>
          <fieldset data-copy-picker><legend>Carry across</legend>
            ${Lx.COPY_CHOICES.map((c) => `<label class="cv-check"><input type="checkbox" name="copy" value="${esc(c.key)}" ${r.copy?.[c.key] ? "checked" : ""} /> <span>${esc(c.label)}</span></label>`).join("")}
            <p class="sp-caption">${esc(Lx.NEVER_COPIED)}</p>
          </fieldset>
          <div class="sp-field"><label for="note-${esc(r.id)}">A note to them (optional)</label><textarea id="note-${esc(r.id)}" name="note" maxlength="2000"></textarea></div>
          <div class="sp-actions"><button class="button button--primary" type="submit" value="approve">Approve and found it</button><button class="button button--ghost" type="submit" value="decline">Decline</button></div>
          ${statusLine()}</form>`;
      }).join("")}
      ${decided.length ? `<h3>Answered</h3><div class="sp-list">${decided.map((r) => `<div class="sp-row"><span class="sp-row__text"><span class="sp-row__title">${esc(r.name)}</span><span class="sp-row__detail">${esc(r.status === "approved" ? "founded" : r.status)} · ${esc(UI.nameOf(context, r.requested_by))}</span></span></div>`).join("")}</div>` : ""}`;
    box.querySelectorAll("[data-request]").forEach((form) =>
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const approve = event.submitter?.value === "approve";
        const chosen = new Set([...form.querySelectorAll("[name=copy]:checked")].map((i) => i.value));
        const copy = Object.fromEntries(Lx.COPY_CHOICES.map((c) => [c.key, chosen.has(c.key)]));
        const done = await UI.busy(form, form.querySelector("[data-status]"), () => LD.decideRequest(coven.id, form.dataset.request, approve, form.elements.note.value, approve ? form.elements.head.value : null, approve ? copy : null), { done: approve ? "Founded." : "Declined." });
        if (done) refresh("lineage");
      })
    );
  }

  async function shareView(box, state) {
    const Lx = X();
    const { coven } = state;
    const items = await LD.shareables(coven.id);
    const shared = new Set((state.lineage.shared || []).map((s) => `${s.kind}:${s.item_id}`));
    const daughters = state.lineage.daughters || [];
    const order = ["document", "rank", "program", "book_section", "book_page", "ritual_library", "calendar"];
    box.innerHTML = `<p class="sp-caption">Mark what your daughter covens may copy in. They see it under “From your mother coven” and copy what they choose; nothing is copied by itself. Members’ own things are never shared: the records and minutes shelves and pages kept to some members don’t appear here.</p>
      ${daughters.length ? `<div class="sp-field"><label for="push-to">Push an update to</label><select id="push-to" data-push-to>${daughters.map((d) => `<option value="${esc(d.id)}">${esc(Lx.daughterLabel(d))}</option>`).join("")}</select></div>
        <p class="sp-caption">Pushing overwrites that coven’s copy with yours, after you see what will change.</p>` : ""}
      <div data-push-preview></div>
      ${order.map((kind) => {
        const list = items.filter((i) => i.kind === kind);
        if (!list.length) return "";
        return `<h3>${esc(Lx.KIND_LABELS[kind])}</h3><div class="sp-list">${list.map((item) => {
          const key = `${item.kind}:${item.id}`;
          return `<div class="sp-row" data-share-row="${esc(key)}"><label class="cv-check"><input type="checkbox" data-share="${esc(key)}" ${shared.has(key) ? "checked" : ""} /> <span>${esc(item.title)}${item.detail ? ` <span class="sp-muted">(${esc(item.detail)})</span>` : ""}</span></label>
            ${daughters.length ? `<button class="button button--ghost button--small" type="button" data-push="${esc(key)}" ${shared.has(key) ? "" : "hidden"}>Push…</button>` : ""}</div>`;
        }).join("")}</div>`;
      }).join("")}
      ${statusLine()}`;
    const status = box.querySelector("[data-status]");
    const byKey = new Map(items.map((i) => [`${i.kind}:${i.id}`, i]));
    box.querySelectorAll("[data-share]").forEach((input) =>
      input.addEventListener("change", async () => {
        const item = byKey.get(input.dataset.share);
        const ok = await UI.busy(input, status, () => LD.setShared(coven.id, item.kind, item.id, input.checked).then(() => true), { done: input.checked ? "Shared with daughter covens." : "No longer shared." });
        if (!ok) input.checked = !input.checked;
        const push = box.querySelector(`[data-push="${CSS.escape(input.dataset.share)}"]`);
        if (push) push.hidden = !input.checked;
      })
    );
    const previewBox = box.querySelector("[data-push-preview]");
    box.querySelectorAll("[data-push]").forEach((button) =>
      button.addEventListener("click", async () => {
        const item = byKey.get(button.dataset.push);
        const daughter = box.querySelector("[data-push-to]").value;
        const name = Lx.daughterLabel(daughters.find((d) => d.id === daughter) || {});
        const preview = await UI.busy(button, status, () => LD.pushPreview(daughter, item.kind, item.id));
        if (!preview) return;
        previewBox.innerHTML = `<div class="sp-card cv-push-preview"><p class="sp-eyebrow">Push to ${esc(name)}</p><h3>${esc(preview.title)}</h3>
          <ul>${preview.changes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
          <p class="sp-caption">Its head is told that you changed it.</p>
          <div class="sp-actions"><button class="button button--primary button--small" type="button" data-push-yes>Push this update</button><button class="button button--ghost button--small" type="button" data-push-no>Not now</button></div>${statusLine()}</div>`;
        previewBox.querySelector("[data-push-no]").addEventListener("click", () => (previewBox.innerHTML = ""));
        previewBox.querySelector("[data-push-yes]").addEventListener("click", async (event) => {
          const ok = await UI.busy(event.currentTarget, previewBox.querySelector("[data-status]"), () => LD.push(daughter, item.kind, item.id).then(() => true));
          if (ok) previewBox.innerHTML = `<p class="sp-notice">“${esc(item.title)}” is updated in ${esc(name)}. Its head is told, and it’s in their lineage log.</p>`;
        });
      })
    );
  }

  async function logView(box, state) {
    const Lx = X();
    const events = await LD.log(state.coven.id);
    await UI.loadNames(state.context, events.flatMap((e) => [e.actor, typeof e.detail?.head === "string" ? e.detail.head : null, typeof e.detail?.to === "string" ? e.detail.to : null]));
    const nameOf = (id) => UI.nameOf(state.context, id);
    box.innerHTML = `<p class="sp-caption">Everything about this coven’s mother and daughters, newest first. When the head of a mother coven changes something here, it shows here, and the coven’s head is told.</p>
      ${events.length ? `<div class="sp-list">${events.map((e) => `<div class="sp-row${["override", "pushed", "head_appointed"].includes(e.event) ? " cv-row--mother" : ""}"><span class="sp-row__text"><span class="sp-row__title">${esc(Lx.eventLine(e, nameOf))}</span>${e.note ? `<span class="sp-row__detail">“${esc(e.note)}”</span>` : ""}<span class="sp-row__detail">${esc(global.CovenLogic.relativeTime(e.created_at))}</span></span></div>`).join("")}</div>` : `<p class="sp-caption">Nothing yet.</p>`}`;
  }

  global.CovenLineage = CovenLineage;
  global.CovenLineageUI = { disclosureHtml, aboutHtml, mountDisclosure, handOnFields, wireHandOn, headsAboveHtml, leadershipPanel, unreachablePanel, prose };
})(window);
