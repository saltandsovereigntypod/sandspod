/*
 * To tend (/today/tend/), as the app's To tend screen has it
 * (app/src/components/tend/TendScreen.tsx): everything you look after,
 * wherever it began, due today first and then ongoing, with where each came
 * from; tended right here by its own source's tending (today/tend/tend-data.js),
 * with a rhythm and a reminder of its own, and an ending with "how did it
 * go?" kept in your Grimoire. Things of your own (cleansing the house, salt
 * lines, a spiritual bath) are added here too, each with its rhythm and a
 * history of when and how it was done.
 */
(function () {
  "use strict";

  const root = document.querySelector("[data-page-root]");
  const D = window.TendData;
  const esc = (text) => (window.SaltPage ? window.SaltPage.esc(text) : String(text ?? ""));
  if (!root) return;
  if (!D) {
    root.innerHTML = '<p class="sp-notice">To tend could not load. Check your connection and refresh the page.</p>';
    return;
  }

  const MARK = { petition: "✉", candle: "🕯", offering: "❦", plant: "❧", "coven-petition": "✦", contribution: "✧", journey: "☽", lookback: "?", "coven-task": "✎", checkin: "☉", action: "✓", own: "✶" };
  const HOURS = [7 * 60, 9 * 60, 12 * 60, 18 * 60, 20 * 60, 21 * 60];
  const hourLabel = (m) => new Date(2000, 0, 1, Math.floor(m / 60), m % 60).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const ui = { query: "", group: "all", open: null, ending: null, message: "", status: "", adding: false, editing: null };
  let state = null;
  let loading = true;
  const C = () => window.SaltCore.tend;

  const chip = (label, attrs, pressed) => `<button type="button" class="sp-chip"${pressed === undefined ? "" : ` aria-pressed="${pressed ? "true" : "false"}"`} ${attrs}>${esc(label)}</button>`;

  function render() {
    const head =
      `<p><a class="sp-back" href="/today/">‹ Back to Today</a></p>` +
      `<header class="tn-head"><p class="sp-eyebrow">Everything you look after</p><h1 class="tn-title">To tend</h1>` +
      `<p class="sp-caption">Your petitions, candles, offerings and plants, what you hold in your covens, your journeys and your “Did it work?” days, wherever they began. Tend them here and the altar, the coven and the journal keep up. Add your own too: cleansing the house, salt lines, a spiritual bath.</p></header>`;
    if (loading || !state) {
      root.innerHTML = head + (!loading && ui.message ? `<p class="sp-notice" role="status">${esc(ui.message)}</p>` : `<p class="sp-caption">Gathering what you tend…</p>`);
      return;
    }
    const M = C().model;
    const pick = (list) => M.filterList(ui.group === "all" ? list : list.filter((i) => i.group === ui.group), ui.query);
    const today = pick(state.list.today);
    const ongoing = pick(state.list.ongoing);
    const nothing = !state.list.today.length && !state.list.ongoing.length;
    root.innerHTML =
      head +
      `<div class="sp-field"><label for="tn-search">Find something</label><input id="tn-search" type="search" data-search value="${esc(ui.query)}" placeholder="A petition, a plant, a coven, a ritual" /></div>` +
      `<div class="sp-chips" role="group" aria-label="Show">${M.GROUP_FILTERS.map((g) => chip(g.label, `data-group="${g.value}"`, ui.group === g.value)).join("")}</div>` +
      (ui.message ? `<p class="sp-notice" role="status">${esc(ui.message)}</p>` : "") +
      (ui.adding ? `<div class="sp-card tn-item" data-own-new>${ownForm(null)}</div>` : `<div class="sp-actions"><button type="button" class="button button--ghost" data-add-own>Add your own</button></div>`) +
      (nothing ? `<div class="sp-card"><p>Nothing to tend yet. A petition on your altar, a candle burning, an offering set out, a coven petition you hold or a journey begun will gather here.</p></div>` : "") +
      (today.length ? `<h2 class="sp-eyebrow tn-group">Due today · ${today.length}</h2>${today.map(card).join("")}` : "") +
      (ongoing.length ? `<h2 class="sp-eyebrow tn-group">Ongoing · ${ongoing.length}</h2>${ongoing.map(card).join("")}` : "") +
      (!nothing && !today.length && !ongoing.length ? `<p class="sp-empty">Nothing here matches. Try another word, or Everything.</p>` : "") +
      (!state.account ? `<p class="sp-caption">Sign in to see what you hold in your covens, and to keep how things went in your Grimoire.</p>` : "");
  }

  function card(item) {
    const M = C().model;
    const line = [item.due.line, item.detail].filter(Boolean).join(" · ");
    const open = ui.open === item.key;
    return `<article class="sp-card tn-item${item.due.state === "ending" ? " tn-item--ending" : ""}" data-key="${esc(item.key)}">
      <button type="button" class="tn-item__head" data-toggle aria-expanded="${open}">
        <span class="tn-mark" aria-hidden="true">${MARK[item.kind] || "✧"}</span>
        <span class="tn-item__text"><strong>${esc(item.title)}</strong>
          <span class="sp-caption">${esc(item.source)}</span>
          ${line ? `<span class="sp-caption${item.due.state === "due" || item.due.state === "ending" ? " sp-gold" : ""}">${esc(line)}</span>` : ""}
          ${item.private ? `<span class="sp-caption tn-private">Private to you</span>` : ""}
          <span class="sr-only">${esc(M.KIND_LABEL[item.kind].label)}</span>
        </span>
      </button>
      ${open ? panel(item) : ""}
    </article>`;
  }

  const endsOf = (item) => [...item.ends, ...(item.ends.includes("let-go") ? [] : ["let-go"])];

  function panel(item) {
    const M = C().model;
    const has = (a) => item.actions.includes(a);
    const status = ui.status ? `<p class="sp-notice" role="status">${esc(ui.status)}</p>` : "";
    const open = `<p><a class="sp-back" href="${esc(item.webHref)}">Open where it lives ›</a></p>`;
    if (item.kind === "own") return ui.editing === item.key ? `<div class="tn-panel">${status}${ownForm(item)}</div>` : ownPanel(item, status);
    if (item.kind === "lookback") {
      return `<div class="tn-panel">${status}
        <form data-answer class="tn-form"><p>Did it work? It may have worked in a way you didn’t expect.</p>
          <div class="sp-chips" role="group" aria-label="Did it work?">${C().lookBack.ANSWERS.map((a) => `<label class="sp-chip tn-radio"><input type="radio" name="answer" value="${a.id}" /> ${esc(a.label)}</label>`).join("")}</div>
          <div class="sp-field"><label for="tn-outcome">What happened (optional)</label><textarea id="tn-outcome" name="outcome"></textarea></div>
          <div class="sp-actions"><button class="button" type="submit">Keep it</button></div>
        </form>${open}</div>`;
    }
    let tendPart = "";
    if (item.kind === "coven-task") {
      tendPart = `<form data-write class="tn-form"><div class="sp-field"><label for="tn-write">What you’ll bring</label><textarea id="tn-write" name="body" required placeholder="In your own words"></textarea></div>
        <label class="tn-check"><input type="checkbox" name="sealed"${item.ref.visibility === "me" ? " checked" : ""} /> Seal it as private <span class="sp-caption">It still takes part, sealed. No one else reads it, the leaders too.</span></label>
        <div class="sp-actions"><button class="button" type="submit">Write it</button></div></form>`;
    } else if (item.kind === "checkin") {
      tendPart = `<form data-checkin class="tn-form"><div class="sp-field"><label for="tn-note">A note from your check-in (optional)</label><textarea id="tn-note" name="note"></textarea></div><div class="sp-actions"><button class="button" type="submit">We met today</button></div></form>`;
    } else if (item.kind === "action") {
      tendPart = `<form data-done class="tn-form"><p class="sp-caption">Agreed at a coven meeting. Mark it done here or on the meeting’s page.</p><div class="sp-actions"><button class="button" type="submit">It’s done</button></div></form>`;
    } else if (item.kind === "journey" && has("practice")) {
      tendPart = `<form data-practice class="tn-form"><div class="sp-field"><label for="tn-note">A note (optional)</label><textarea id="tn-note" name="note"></textarea></div><div class="sp-actions"><button class="button" type="submit">Done for today</button></div></form>`;
    } else {
      const actions = [
        has("light") ? chip("Light the candle", 'data-act="light"') : "",
        has("snuff") ? chip("Let the candle rest", 'data-act="snuff"') : "",
        has("refresh") ? chip("Refresh the offering", 'data-act="refresh"') : "",
        has("water") ? chip("Water it", 'data-act="water"') : "",
        has("tend") ? chip(item.kind === "coven-petition" ? "Tend it (a candle in your name)" : "Keep holding it", 'data-act="tend"') : "",
        has("word") ? chip("Keep the word", 'data-act="word"') : ""
      ].join("");
      tendPart =
        (has("word") || has("tend") ? `<div class="sp-field"><label for="tn-word">Add a word (optional)</label><textarea id="tn-word" data-word placeholder="What you said, or what you noticed"></textarea></div>` : "") +
        (actions ? `<div class="sp-chips">${actions}</div>` : "") +
        (item.kind === "coven-petition" && !has("tend") ? `<p class="sp-caption">You tended it in the last twelve hours. Its candle is still burning for you.</p>` : "");
    }
    const rhythmPart = `<p class="sp-eyebrow">Its rhythm</p>${rhythmChips(item)}`;
    const endPart =
      `<p class="sp-eyebrow">When it’s done</p><div class="sp-chips">${endsOf(item).map((how) => chip(M.END_WORDS[how].label, `data-ending="${how}"`, ui.ending === how)).join("")}</div>` +
      (ui.ending
        ? `<form data-end class="tn-form sp-card"><div class="sp-field"><label for="tn-how">How did it go? (optional)</label><textarea id="tn-how" name="note" placeholder="What happened, what changed, what you’d do again"></textarea></div>
          ${state.account ? `<label class="tn-check"><input type="checkbox" name="keep" checked /> Keep it in my Grimoire <span class="sp-caption">A page under How it went, with the words you added along the way.</span></label>` : `<p class="sp-caption">Signed in, how it went can be kept in your Grimoire.</p>`}
          <div class="sp-actions"><button class="button" type="submit">${esc(M.END_WORDS[ui.ending].label)}</button></div></form>`
        : "");
    return `<div class="tn-panel">${status}${tendPart}${rhythmPart}${endPart}${open}</div>`;
  }

  const shortDay = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

  /** Its rhythm (as it asks, every day or week, every X days, by the moon, until a day) and its reminder, saved as each is chosen. */
  function rhythmChips(item) {
    const M = C().model;
    const rhythm = M.rhythmOf(item, item.record);
    const choices = M.untilChoices(new Date());
    return (
      `<div class="sp-chips">${M.RHYTHMS.filter((r) => item.kind !== "own" || r.value !== "asks").map((r) => chip(r.label, `data-rhythm="${r.value}"`, rhythm.kind === r.value)).join("")}</div>` +
      (rhythm.kind === "every"
        ? `<div class="tn-every"><div class="sp-field"><label for="tn-every-${esc(item.key)}">Every how many days? (1 to ${M.EVERY_MAX})</label><input id="tn-every-${esc(item.key)}" type="number" min="1" max="${M.EVERY_MAX}" step="1" inputmode="numeric" data-every value="${rhythm.every}" /></div><button type="button" class="button button--ghost" data-every-set>Keep it</button></div>`
        : "") +
      (rhythm.kind === "moon" ? `<div class="sp-chips">${M.MOON_MARKS.map((m) => chip(m.label, `data-moon="${m.value}"`, rhythm.moon === m.value)).join("")}</div>` : "") +
      (rhythm.kind === "until" ? `<div class="sp-chips">${choices.map((c) => chip(`${c.label} · ${shortDay(c.date)}`, `data-until="${c.date}" data-why="${esc(c.why)}"`, rhythm.until === c.date)).join("")}</div>` : "") +
      (rhythm.kind === "asks"
        ? `<p class="sp-caption">It asks in its own time.</p>`
        : `<label class="tn-check"><input type="checkbox" data-remind${item.record?.remind ? " checked" : ""} /> Remind me <span class="sp-caption">On your phone with your other reminders, and in the calendar file on Reminders.</span></label>` +
          (item.record?.remind ? `<div class="sp-chips">${HOURS.map((m) => chip(hourLabel(m), `data-hour="${m}"`, item.record.at === m)).join("")}</div>` : ""))
    );
  }

  /** Add a thing of your own, or change one: what it is, what kind, notes, how often, and whether to note it in your Grimoire. */
  function ownForm(item) {
    const M = C().model;
    const own = item?.record?.own || { type: "cleansing", other: "", notes: "", grimoire: false };
    const rhythm = item?.record?.rhythm || { kind: "weekly" };
    const id = item ? esc(item.key) : "new";
    const choices = M.untilChoices(new Date());
    return `<form data-own-form class="tn-form">
      ${item ? "" : `<p class="sp-eyebrow">Add your own</p>`}
      <div class="sp-field"><label for="tn-own-name-${id}">What is it?</label><input id="tn-own-name-${id}" name="name" maxlength="${M.OWN_NAME_MAX}" value="${esc(item?.title || "")}" placeholder="Cleanse the house" /></div>
      <div class="sp-chips" role="radiogroup" aria-label="What kind of tending">${M.OWN_TYPES.map((t) => `<label class="sp-chip tn-radio"><input type="radio" name="type" value="${t.value}"${own.type === t.value ? " checked" : ""} /> ${esc(t.label)}</label>`).join("")}</div>
      <div class="sp-field" data-when-type="other"${own.type === "other" ? "" : " hidden"}><label for="tn-own-other-${id}">What kind of tending?</label><input id="tn-own-other-${id}" name="other" maxlength="80" value="${esc(own.other)}" placeholder="In your own words" /></div>
      <div class="sp-field"><label for="tn-own-notes-${id}">Notes (optional)</label><textarea id="tn-own-notes-${id}" name="notes" placeholder="What you use, where, anything to remember">${esc(own.notes)}</textarea></div>
      <div class="sp-field"><label for="tn-own-rhythm-${id}">How often</label><select id="tn-own-rhythm-${id}" name="rhythm">${M.RHYTHMS.filter((r) => r.value !== "asks").map((r) => `<option value="${r.value}"${rhythm.kind === r.value ? " selected" : ""}>${esc(r.label)}</option>`).join("")}</select></div>
      <div class="sp-field" data-when-rhythm="every"${rhythm.kind === "every" ? "" : " hidden"}><label for="tn-own-every-${id}">Every how many days? (1 to ${M.EVERY_MAX})</label><input id="tn-own-every-${id}" name="every" type="number" min="1" max="${M.EVERY_MAX}" step="1" inputmode="numeric" value="${rhythm.every || 3}" /></div>
      <div class="sp-field" data-when-rhythm="moon"${rhythm.kind === "moon" ? "" : " hidden"}><label for="tn-own-moon-${id}">Which moon</label><select id="tn-own-moon-${id}" name="moon">${M.MOON_MARKS.map((m) => `<option value="${m.value}"${rhythm.moon === m.value ? " selected" : ""}>${esc(m.label)}</option>`).join("")}</select></div>
      <div class="sp-field" data-when-rhythm="until"${rhythm.kind === "until" ? "" : " hidden"}><label for="tn-own-until-${id}">Until</label><select id="tn-own-until-${id}" name="until">${choices.map((c) => `<option value="${c.date}" data-why="${esc(c.why)}"${rhythm.until === c.date ? " selected" : ""}>${esc(`${c.label} · ${shortDay(c.date)}`)}</option>`).join("")}</select></div>
      ${state.account ? `<label class="tn-check"><input type="checkbox" name="grimoire"${own.grimoire ? " checked" : ""} /> Also note it in my Grimoire <span class="sp-caption">Each time it’s done, a short page under Tending.</span></label>` : `<p class="sp-caption">Signed in, each time can also be noted in your Grimoire.</p>`}
      <div class="sp-actions"><button class="button" type="submit">${item ? "Save" : "Add it"}</button>${item ? `<button type="button" class="button button--ghost" data-remove-own>Take it off my list</button>` : ""}<button type="button" class="button button--ghost" data-cancel-own>Cancel</button></div>
    </form>`;
  }

  function ownInput(form) {
    const data = new FormData(form);
    const kind = String(data.get("rhythm") || "weekly");
    const until = form.querySelector('[name="until"]');
    const rhythm =
      kind === "every"
        ? { kind, every: Number(data.get("every")) }
        : kind === "moon"
          ? { kind, moon: String(data.get("moon") || "full") }
          : kind === "until"
            ? { kind, until: String(data.get("until") || ""), untilWhy: until?.selectedOptions[0]?.dataset.why || "" }
            : { kind };
    return { name: String(data.get("name") || ""), type: String(data.get("type") || "other"), other: String(data.get("other") || ""), notes: String(data.get("notes") || ""), rhythm, grimoire: data.get("grimoire") === "on" };
  }

  const dateWords = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  /** A thing of your own: done today (or another day) and how, its rhythm and reminder, its history, and changing it. */
  function ownPanel(item, status) {
    const M = C().model;
    const own = item.record?.own;
    const key = esc(item.key);
    const today = M.dayKey(new Date());
    const history = [...(item.record?.done || [])].reverse();
    return `<div class="tn-panel">${status}
      ${own?.notes ? `<p class="sp-caption">${esc(own.notes)}</p>` : ""}
      <form data-own-done class="tn-form">
        <p class="sp-eyebrow">How (optional)</p>
        <div class="sp-chips" role="group" aria-label="How">${(own ? M.ownHows(own.type) : []).map((h) => `<label class="sp-chip tn-radio"><input type="checkbox" name="how" value="${esc(h)}" /> ${esc(h)}</label>`).join("")}<label class="sp-chip tn-radio"><input type="checkbox" name="other-on" data-other-how /> Other</label></div>
        <div class="sp-field" data-when-other hidden><label for="tn-how-other-${key}">How, in your words</label><input id="tn-how-other-${key}" name="other-how" maxlength="80" /></div>
        <div class="sp-field"><label for="tn-done-note-${key}">A note (optional)</label><textarea id="tn-done-note-${key}" name="note" placeholder="What you noticed"></textarea></div>
        <label class="tn-check"><input type="checkbox" name="another" data-another /> Done on another day</label>
        <div class="sp-field" data-when-another hidden><label for="tn-done-day-${key}">Which day?</label><input id="tn-done-day-${key}" name="day" type="date" max="${today}" value="${M.dayKey(new Date(Date.now() - 86400000))}" /></div>
        <div class="sp-actions"><button class="button" type="submit">Done today</button></div>
      </form>
      <p class="sp-eyebrow">How often</p>${rhythmChips(item)}
      <details class="tn-history"><summary>Its history · ${history.length}</summary>
        ${history.length ? `<ul class="tn-history__list">${history.map((c) => `<li><strong>${esc(dateWords(c.at))}</strong>${c.how.length ? `<span class="sp-caption">${esc(c.how.join(" · "))}</span>` : ""}${c.note ? `<span class="sp-caption">${esc(c.note)}</span>` : ""}<button type="button" class="sp-chip" data-undo="${esc(c.at)}">Take this one out</button></li>`).join("")}</ul>` : `<p class="sp-caption">Not done yet. Each time you mark it done is kept here, the last 50.</p>`}
      </details>
      <div class="sp-actions"><button type="button" class="button button--ghost" data-edit-own>Change or remove it</button></div>
    </div>`;
  }

  // ── Doing ──────────────────────────────────────────────────────────────

  const itemOf = (el) => {
    const key = el.closest("[data-key]")?.dataset.key;
    return key ? [...state.list.today, ...state.list.ongoing].find((i) => i.key === key) : null;
  };

  async function act(work, closeAfter) {
    ui.status = "";
    try {
      const message = await work();
      if (closeAfter) {
        ui.open = null;
        ui.ending = null;
        ui.message = message;
      } else ui.status = message;
      await refresh(false);
    } catch (error) {
      ui.status = error?.message || "That didn’t work. Please try again.";
      render();
    }
  }

  root.addEventListener("input", (event) => {
    if (event.target.matches("[data-search]")) {
      ui.query = event.target.value;
      render();
      const input = root.querySelector("[data-search]");
      input.focus();
      input.setSelectionRange(ui.query.length, ui.query.length);
    }
  });

  root.addEventListener("click", (event) => {
    const el = event.target.closest("button, [data-group]");
    if (!el || !state) return;
    if (el.dataset.group) {
      ui.group = el.dataset.group;
      return render();
    }
    if (el.hasAttribute("data-add-own")) {
      ui.adding = true;
      ui.message = "";
      render();
      root.querySelector('[data-own-new] [name="name"]')?.focus();
      return;
    }
    if (el.hasAttribute("data-cancel-own")) {
      ui.adding = false;
      ui.editing = null;
      return render();
    }
    const item = itemOf(el);
    if (!item) return;
    if (el.hasAttribute("data-edit-own")) {
      ui.editing = item.key;
      ui.status = "";
      return render();
    }
    if (el.hasAttribute("data-remove-own")) {
      if (!window.confirm("Take it off your list?\n\nIt goes with its history. Anything noted in your Grimoire stays there.")) return;
      ui.editing = null;
      return act(() => D.removeOwn(state, item), true);
    }
    if (el.dataset.undo) return act(() => D.undoDone(state, item, el.dataset.undo));
    if (el.hasAttribute("data-every-set")) {
      const n = Number(el.closest("[data-key]").querySelector("[data-every]")?.value);
      if (!Number.isInteger(n) || n < 1 || n > C().model.EVERY_MAX) {
        ui.status = `A whole number of days, 1 to ${C().model.EVERY_MAX}.`;
        return render();
      }
      return act(() => D.setRhythm(state, item, { rhythm: { kind: "every", every: n } }));
    }
    const M = C().model;
    if (el.hasAttribute("data-toggle")) {
      ui.open = ui.open === item.key ? null : item.key;
      ui.ending = null;
      ui.status = "";
      return render();
    }
    if (el.dataset.act) {
      const word = el.closest("[data-key]").querySelector("[data-word]")?.value || "";
      return act(() => D.tend(state, item, el.dataset.act, word));
    }
    if (el.dataset.rhythm) {
      const kind = el.dataset.rhythm;
      const first = M.untilChoices(new Date())[0];
      const rhythm = kind === "moon" ? { kind, moon: "full" } : kind === "until" ? { kind, until: first?.date || "", untilWhy: first?.why || "" } : kind === "every" ? { kind, every: 3 } : { kind };
      return act(() => D.setRhythm(state, item, { rhythm }));
    }
    if (el.dataset.moon) return act(() => D.setRhythm(state, item, { rhythm: { kind: "moon", moon: el.dataset.moon } }));
    if (el.dataset.until) return act(() => D.setRhythm(state, item, { rhythm: { kind: "until", until: el.dataset.until, untilWhy: el.dataset.why || "" } }));
    if (el.dataset.hour) return act(() => D.setRhythm(state, item, { at: Number(el.dataset.hour) }));
    if (el.dataset.ending) {
      ui.ending = ui.ending === el.dataset.ending ? null : el.dataset.ending;
      return render();
    }
  });

  root.addEventListener("change", (event) => {
    const form = event.target.closest("[data-own-form], [data-own-done]");
    if (form) {
      // Show only the fields that go with what's chosen.
      const data = new FormData(form);
      form.querySelectorAll("[data-when-type]").forEach((el) => (el.hidden = data.get("type") !== el.dataset.whenType));
      form.querySelectorAll("[data-when-rhythm]").forEach((el) => (el.hidden = data.get("rhythm") !== el.dataset.whenRhythm));
      form.querySelectorAll("[data-when-other]").forEach((el) => (el.hidden = data.get("other-on") !== "on"));
      form.querySelectorAll("[data-when-another]").forEach((el) => (el.hidden = data.get("another") !== "on"));
      const submit = form.matches("[data-own-done]") && form.querySelector('[type="submit"]');
      if (submit) submit.textContent = data.get("another") === "on" ? "Done that day" : "Done today";
      return;
    }
    if (!event.target.matches("[data-remind]") || !state) return;
    const item = itemOf(event.target);
    if (item) act(() => D.setRhythm(state, item, { remind: event.target.checked, rhythm: C().model.rhythmOf(item, item.record) }));
  });

  root.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.matches("[data-own-form]") && state) {
      const input = ownInput(form);
      if (input.rhythm.kind === "every" && !(Number.isInteger(input.rhythm.every) && input.rhythm.every >= 1 && input.rhythm.every <= C().model.EVERY_MAX)) {
        ui.status = ui.message = `Every how many days: a whole number, 1 to ${C().model.EVERY_MAX}.`;
        return render();
      }
      const editing = itemOf(form);
      ui.adding = false;
      ui.editing = null;
      return act(() => D.saveOwn(state, input, editing || undefined), true);
    }
    const item = itemOf(form);
    if (!item || !state) return;
    const data = new FormData(form);
    if (form.matches("[data-own-done]")) {
      let at = new Date();
      if (data.get("another") === "on") {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(data.get("day") || ""));
        at = m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null;
        if (!at || at.getTime() > Date.now()) {
          ui.status = "Choose a day up to today.";
          return render();
        }
      }
      const how = [...data.getAll("how").map(String), ...(data.get("other-on") === "on" && String(data.get("other-how") || "").trim() ? [String(data.get("other-how")).trim()] : [])];
      return act(() => D.markDone(state, item, at, how, String(data.get("note") || "")));
    }
    if (form.matches("[data-end]")) return act(() => D.end(state, item, ui.ending, String(data.get("note") || ""), data.get("keep") === "on"), true);
    if (form.matches("[data-write]")) return act(() => D.write(state, item, String(data.get("body") || ""), data.get("sealed") === "on"), true);
    if (form.matches("[data-checkin]")) return act(() => D.checkin(state, item, String(data.get("note") || "")), true);
    if (form.matches("[data-done]")) return act(() => D.done(state, item), true);
    if (form.matches("[data-practice]")) return act(() => D.practice(state, item, String(data.get("note") || "")), true);
    if (form.matches("[data-answer]")) {
      const answer = data.get("answer");
      if (!answer) {
        ui.status = "Choose an answer first.";
        return render();
      }
      return act(() => D.answer(state, item, answer, String(data.get("outcome") || "")), true);
    }
  });

  async function refresh(showLoading = true) {
    if (showLoading) {
      loading = true;
      render();
    }
    try {
      state = await D.load();
    } catch (error) {
      console.warn("Couldn’t gather what you tend", error);
      ui.message = "Some of what you tend couldn’t be read just now. Refresh to try again.";
    }
    loading = false;
    render();
  }

  render();
  if (window.SaltPage) {
    window.SaltPage.ready().then(() => refresh());
    window.SaltPage.onUserChange(() => refresh());
  } else refresh();
})();
