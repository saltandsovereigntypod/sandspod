/*
 * A coven's Petitions: a member asks the circle to hold a petition for them.
 * A candle is set for it on the shared altar, and members tend it (each
 * tending relights the candle) once every twelve hours, with a few words if
 * they like. The person who asked marks it answered or closes it, and its
 * candle leaves the altar. Petitions are seen by the coven's members only.
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;

  let pane = null;
  let state = null;
  let petitions = [];
  let tendings = [];
  let showClosed = false;

  const me = () => state.context.user?.id;
  const nameOf = (id) => UI.nameOf(state.context, id);
  const statusLine = () => `<p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  const SWATCH = { white: "#f4efe2", black: "#1b1b1b", red: "#b3261e", orange: "#e07b24", yellow: "#e8c547", green: "#2f7d44", blue: "#2f5fa8", indigo: "#3b2f7a", purple: "#6b3fa0", pink: "#e58fb4", magenta: "#b0277a", brown: "#6b4426", grey: "#8a8a8a", silver: "#c9ccd1", gold: "#c9a64a", rainbow: "linear-gradient(135deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa)" };

  async function load() {
    petitions = await D.petitions(state.coven.id).catch(() => []);
    tendings = await D.petitionTendings(petitions.map((p) => p.id)).catch(() => []);
    await UI.loadNames(state.context, [...petitions.map((p) => p.user_id), ...tendings.map((t) => t.user_id)]);
  }

  function card(p) {
    const held = tendings.filter((t) => t.petition_id === p.id);
    const holders = [...new Set(held.map((t) => t.user_id))];
    const notes = held.filter((t) => t.note).slice(0, 5);
    const asker = p.user_id === me();
    const tend = L.canTend(p, tendings, me()) && state.standing.ok;
    const closer = asker || state.perms.moderate || state.perms.site;
    return `<article class="sp-card${p.status === "open" ? "" : " cv-petition--closed"}" data-petition="${esc(p.id)}">
        <div class="cv-meta"><span class="cv-swatch cv-swatch--small" style="background:${SWATCH[p.color] || SWATCH.white}" aria-hidden="true"></span>
          <span class="cv-pill">${esc(asker ? "Your petition" : `From ${nameOf(p.user_id)}`)}</span>
          <span class="cv-pill">${esc(L.relativeTime(p.created_at))}</span>
          ${p.status === "answered" ? `<span class="cv-pill cv-pill--gold">Answered</span>` : p.status === "closed" ? `<span class="cv-pill">Closed</span>` : ""}</div>
        <h3>${esc(p.title)}</h3>
        ${p.body ? `<div class="cv-doc">${prose(p.body)}</div>` : ""}
        ${p.outcome_note ? `<p class="cv-doc">“${esc(p.outcome_note)}”</p>` : ""}
        <p class="sp-caption">${holders.length ? `Held by ${holders.length} ${holders.length === 1 ? "member" : "members"}: ${holders.map((id) => esc(nameOf(id))).join(", ")}.` : p.status === "open" ? "No one has tended it yet." : ""}${p.last_tended_at && p.status === "open" ? ` Last tended ${esc(L.relativeTime(p.last_tended_at))}.` : ""}</p>
        ${notes.length ? `<ul class="gd-bullets">${notes.map((t) => `<li>${esc(t.note)} <span class="sp-caption">· ${esc(nameOf(t.user_id))}</span></li>`).join("")}</ul>` : ""}
        ${p.status === "open" ? `<form class="sp-section" data-tend>
            ${tend ? `<div class="sp-field"><label for="tn-${esc(p.id)}">A few words (optional)</label><input id="tn-${esc(p.id)}" name="note" maxlength="280" placeholder="Holding you in the light" /></div>
              <div class="sp-actions"><button class="button button--primary button--small" type="submit">🕯 Tend this petition</button></div>`
            : `<p class="sp-caption">${held.some((t) => t.user_id === me()) ? "You’ve tended it. Its candle is burning for you; you can tend it again later." : state.standing.ok ? "" : esc(state.standing.reasons.join(" "))}</p>`}
            ${statusLine()}</form>` : ""}
        <div class="sp-actions">
          ${p.status === "open" && closer ? `<button class="button button--ghost button--small" type="button" data-close="answered">${asker ? "It’s been answered" : "Mark answered"}</button><button class="button button--ghost button--small" type="button" data-close="closed">Close it</button>` : ""}
          ${asker ? "" : `<button class="button button--ghost button--small" type="button" data-report>Report</button>`}
        </div>
      </article>`;
  }

  function draw() {
    if (!pane) return;
    const open = petitions.filter((p) => p.status === "open");
    const closed = petitions.filter((p) => p.status !== "open");
    pane.innerHTML = `<p>Ask the circle to hold a petition for you. A candle is set for it on the coven’s altar, and members tend it while it’s open. Only the coven’s members see petitions.</p>
      ${state.standing.ok ? `<details class="sp-details"${open.length ? "" : " open"}><summary>Ask the circle</summary>
        <form class="sp-section" data-ask>
          <div class="sp-field"><label for="pt-title">What would you like held?</label><input id="pt-title" name="title" required maxlength="120" placeholder="Healing for my mother" /></div>
          <div class="sp-field"><label for="pt-body">More, if you’d like to share (optional)</label><textarea id="pt-body" name="body" maxlength="2000"></textarea></div>
          <div class="sp-field"><span class="sp-label" id="pt-color-label">Its candle</span>
            <div class="cv-swatches" role="radiogroup" aria-labelledby="pt-color-label">${L.CANDLE_COLORS.map((c, i) => `<label class="cv-swatch-choice"><input type="radio" name="color" value="${c}" ${i === 0 ? "checked" : ""} /><span class="cv-swatch" style="background:${SWATCH[c]}" title="${c}"></span><span class="sr-only">${c}</span></label>`).join("")}</div></div>
          <p class="sp-caption">Please don’t share anyone else’s private details. If someone is in danger, contact emergency services first.</p>
          <div class="sp-actions"><button class="button button--primary" type="submit">Ask the circle</button></div>
          ${statusLine()}
        </form></details>` : `<p class="sp-notice">${esc(state.standing.reasons.join(" "))}</p>`}
      <section class="sp-section"><h2>Being held</h2>${open.length ? open.map(card).join("") : `<p class="sp-empty">No petitions are open.</p>`}</section>
      ${closed.length ? `<section class="sp-section"><div class="sp-actions"><button class="button button--ghost button--small" type="button" data-toggle-closed>${showClosed ? "Hide" : "Show"} answered and closed (${closed.length})</button></div>${showClosed ? closed.slice(0, 30).map(card).join("") : ""}</section>` : ""}`;

    const ask = pane.querySelector("[data-ask]");
    ask?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const saved = await UI.busy(ask, ask.querySelector("[data-status]"), () => D.askPetition(state.coven.id, ask.elements.title.value.trim(), ask.elements.body.value.trim(), ask.elements.color.value));
      if (!saved) return;
      await load();
      draw();
    });
    pane.querySelector("[data-toggle-closed]")?.addEventListener("click", () => {
      showClosed = !showClosed;
      draw();
    });
    pane.querySelectorAll("[data-petition]").forEach((el) => {
      const id = el.dataset.petition;
      const p = petitions.find((x) => x.id === id);
      const form = el.querySelector("[data-tend]");
      form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const saved = await UI.busy(form, form.querySelector("[data-status]"), () => D.tendPetition(id, form.elements.note?.value));
        if (!saved) return;
        await load();
        draw();
      });
      el.querySelectorAll("[data-close]").forEach((button) =>
        button.addEventListener("click", async () => {
          const answered = button.dataset.close === "answered";
          const note = answered ? await UI.askText("It’s been answered", "A few words for the circle (optional)", "Mark answered") : null;
          if (note === null && answered) return;
          if (!answered && !(await UI.confirmAction("Close this petition?", "Its candle leaves the altar.", "Close it"))) return;
          if (await UI.busy(button, el.querySelector("[data-status]"), () => D.closePetition(id, button.dataset.close, note || null).then(() => true))) {
            await load();
            draw();
          }
        })
      );
      el.querySelector("[data-report]")?.addEventListener("click", () => UI.report({ target_type: "petition", target_id: id, coven_id: state.coven.id, target_user_id: p.user_id, label: "this petition" }));
    });
  }

  async function mount(el, s) {
    pane = el;
    state = s;
    pane.innerHTML = `<p class="sp-caption">Gathering the petitions…</p>`;
    await load();
    if (pane !== el) return;
    draw();
  }

  async function onChange() {
    if (!pane || pane.querySelector("[data-ask] input:focus, [data-ask] textarea:focus, [data-tend] input:focus")) return;
    await load();
    draw();
  }

  function unmount() {
    pane = null;
  }

  global.CovenPetitions = { mount, unmount, onChange };
})(window);
