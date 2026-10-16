/*
 * My deities (app/src/app/(tabs)/more/settings/deities.tsx): the gods someone
 * is exploring, dedicated to, or keeps as patron, from the Living Library or
 * in their own words. Saved in the `my_deities` setting as the app keeps it
 * (lib/patron/mine.ts), with "Save changes" like the app's settings screens;
 * every other setting is left as it is.
 *
 * Needs: js/salt-store.js, js/core/journeys.js, js/traditional-library.js,
 * rituals/journeys/journeys-logic.js.
 */
(function (global) {
  "use strict";

  const L = global.JourneysLogic;
  const M = () => global.SaltCore.journeys.mine;
  const esc = (text) => global.SaltPage.esc(text);
  const root = global.document.querySelector("[data-page-root]");
  /* global TraditionalLibrary */
  const library = L.libraryDeities(typeof TraditionalLibrary !== "undefined" ? TraditionalLibrary : null);

  const state = { list: [], dirty: false, notice: "", saving: false, query: "", signedIn: false };
  const slug = (d) => `${d.key || "own"}-${d.name}`.replace(/[^\w-]+/g, "_");

  function deityCard(d) {
    const id = slug(d);
    const level = M().LEVELS.find((l) => l.value === d.level);
    return `<section class="sp-card dy-kept" data-deity="${esc(id)}">
      <div class="dy-head"><h3 class="jr-card-title">${esc(d.name)}</h3>${!d.key ? `<span class="sp-caption">In your own words</span>` : ""}</div>
      <div class="sp-chips" role="group" aria-label="${esc(`How close you are to ${d.name}`)}">${M()
        .LEVELS.map((l) => `<button type="button" class="sp-chip" aria-pressed="${l.value === d.level}" data-level="${l.value}">${esc(l.label)}</button>`)
        .join("")}</div>
      <p class="sp-caption">${esc(level?.note || "")}</p>
      <div class="sp-field"><label for="since-${esc(id)}">Since</label><input id="since-${esc(id)}" data-field="since" placeholder="YYYY-MM-DD" autocomplete="off" spellcheck="false" value="${esc(d.since)}" /></div>
      <div class="sp-field"><label for="note-${esc(id)}">A note for yourself</label><textarea id="note-${esc(id)}" data-field="note" placeholder="How it began, what you offer, what you’ve noticed">${esc(d.note || "")}</textarea></div>
      <div class="sp-actions"><button type="button" class="button button--ghost" data-remove>Remove</button></div>
    </section>`;
  }

  function results() {
    const { matches, custom } = L.deitySearch(library, state.list, state.query);
    if (!matches.length && !custom) return !state.query && !state.list.length ? `<p class="sp-caption">Start typing a name or a pantheon.</p>` : "";
    return `<div class="sp-list">${matches
      .map((d) => `<button type="button" class="sp-row" data-add="${esc(d.key)}"><span class="sp-row__text"><span class="sp-row__title">${esc(d.name)}</span><span class="sp-row__detail">${esc(d.pantheon)}</span></span><span class="sp-row__chevron" aria-hidden="true">+</span></button>`)
      .join("")}${
      custom
        ? `<button type="button" class="sp-row" data-add-own><span class="sp-row__text"><span class="sp-row__title">${esc(`Add “${custom}” in your own words`)}</span><span class="sp-row__detail">For a deity, spirit or saint the Library doesn’t have</span></span><span class="sp-row__chevron" aria-hidden="true">+</span></button>`
        : ""
    }</div>`;
  }

  function render(focus) {
    const list = M().myDeities({ [M().MY_DEITIES_KEY]: M().deitiesValue(state.list) });
    root.innerHTML = `
      <a class="sp-back" href="/?sanctuary=more">‹ Back</a>
      <header class="jr-title"><p class="sp-eyebrow">Settings</p><h1>My deities</h1></header>
      <section class="sp-card"><p>The gods you’re getting to know, have dedicated to, or keep as your patron. None is required, and one or several are both normal.</p>
        <p><a class="jr-link" href="${L.href.patron()}">What a patron is, and how to know ›</a></p></section>
      ${list.length ? `<section class="sp-section"><h2 class="jr-label">Yours</h2>${list.map(deityCard).join("")}</section>` : ""}
      <section class="sp-section"><h2 class="jr-label">Add a deity</h2>
        <div class="sp-field"><label for="dy-search">Search the Living Library</label><input id="dy-search" type="search" data-search placeholder="e.g. Hekate, Brigid, Norse" autocomplete="off" spellcheck="false" value="${esc(state.query)}" /></div>
        <div data-results>${results()}</div></section>
      ${state.notice ? `<p class="sp-notice" role="status">${esc(state.notice)}</p>` : `<p class="sp-notice" role="status" hidden></p>`}
      <div class="sp-actions"><button type="button" class="button button--primary" data-save${!state.dirty || state.saving ? " disabled" : ""}>${state.saving ? "Saving…" : "Save changes"}</button></div>
      ${!state.signedIn ? `<p class="sp-caption">You're a guest, so these stay on this device. Sign in to use them everywhere.</p>` : ""}
      <p class="sp-caption">Reminders on their sacred days are kept by the phone app, with your other reminders.</p>`;
    root.setAttribute("aria-busy", "false");
    if (focus) root.querySelector(focus)?.focus();
  }

  const find = (card) => {
    const id = card.dataset.deity;
    return state.list.find((d) => slug(d) === id);
  };
  function edit(next, focus) {
    state.list = next;
    state.dirty = true;
    state.notice = "Unsaved changes.";
    render(focus);
  }

  root.addEventListener("click", async (event) => {
    const t = event.target;
    const card = t.closest("[data-deity]");
    const levelButton = t.closest("[data-level]");
    if (card && levelButton) {
      const d = find(card);
      return edit(M().withDeity(state.list, { ...d, level: levelButton.dataset.level }), `[data-deity="${card.dataset.deity}"] [data-level="${levelButton.dataset.level}"]`);
    }
    if (card && t.closest("[data-remove]")) return edit(M().withoutDeity(state.list, find(card)), "#dy-search");
    const add = t.closest("[data-add]");
    if (add) {
      const d = library.find((x) => x.key === add.dataset.add);
      state.query = "";
      return edit(M().withDeity(state.list, { key: d.key, name: d.name, level: "exploring", since: L.todayKey() }), "#dy-search");
    }
    if (t.closest("[data-add-own]")) {
      const name = state.query.trim();
      state.query = "";
      return edit(M().withDeity(state.list, { key: null, name, level: "exploring", since: L.todayKey() }), "#dy-search");
    }
    if (t.closest("[data-save]")) {
      state.saving = true;
      render();
      try {
        await global.SaltSettings.patch({ [M().MY_DEITIES_KEY]: M().deitiesValue(state.list) });
        state.dirty = false;
        state.notice = state.signedIn ? "Settings saved to your account." : "Settings saved on this device.";
      } catch {
        state.notice = "Settings could not be saved. Check your connection and try again.";
      }
      state.saving = false;
      render("[data-save]");
    }
  });

  root.addEventListener("input", (event) => {
    const t = event.target;
    if (t.matches("[data-search]")) {
      state.query = t.value;
      root.querySelector("[data-results]").innerHTML = results();
      return;
    }
    const card = t.closest("[data-deity]");
    const field = t.dataset.field;
    if (!card || !field) return;
    const d = find(card);
    // Typing changes the draft without redrawing, so the cursor stays put.
    state.list = M().withDeity(state.list, { ...d, [field]: t.value });
    state.dirty = true;
    state.notice = "Unsaved changes.";
    const notice = root.querySelector(".sp-notice");
    notice.hidden = false;
    notice.textContent = state.notice;
    root.querySelector("[data-save]").disabled = false;
  });

  async function load() {
    root.setAttribute("aria-busy", "true");
    const user = await global.SaltPage.ready();
    state.signedIn = !!user;
    let settings = {};
    try {
      settings = (await global.SaltSettings.get()) || {};
    } catch {
      state.notice = "Offline · showing the settings saved on this device";
    }
    state.list = M().myDeities(settings);
    state.dirty = false;
    render();
  }

  global.SaltPage.onUserChange(load);
  load();
})(window);
