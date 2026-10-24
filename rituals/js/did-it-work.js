/*
 * "Did it work?" on the website's journal pages (app: components/rituals/DidItWork.tsx
 * and the What works for you section of rituals/journal/insights.tsx). The
 * logic is the app's own (SaltCore.rituals.lookBack and .whatWorks); answers
 * are saved into the entry's metadata.lookBack, exactly as the app saves them.
 * Spell jars, sachets and the rest of My Apothecary get the same card
 * (kind "apothecary"), saved into apothecary_items.metadata.lookBack
 * (SaltCore.rituals.apothecaryLookBack, app: components/rituals/ItemDidItWork.tsx).
 *
 * Needs: rituals-ui.js (RitualsUI), rituals-store.js (RitualsStore), js/core/rituals.js.
 */
(function (global) {
  "use strict";

  const UI = global.RitualsUI;
  const S = global.RitualsStore;
  const { esc } = UI;
  const R = () => global.SaltCore.rituals;
  const LB = () => R().lookBack;
  const AL = () => R().apothecaryLookBack;

  const dayWords = (key) => R().calendar.fullDate(key) || key;

  function lookBackWords(lookBack) {
    const moon = lookBack.when === "full_moon" || lookBack.when === "new_moon";
    return moon ? `${LB().whenWords(lookBack.when)} (${dayWords(lookBack.date)})` : `on ${dayWords(lookBack.date)}`;
  }

  const waitedLines = (lookBack) =>
    (lookBack?.waited || [])
      .map((w) => `<p class="sp-caption">${esc(`${dayWords(w.date)}: ${w.answer ? LB().answerLabel(w.answer) : "Still waiting"}${w.outcome ? `. ${w.outcome}` : ""}`)}</p>`)
      .join("");

  function form(entry, { due, now, title }) {
    const lookBack = LB().readLookBack(entry);
    const answer = lookBack?.answer || null;
    const waits = LB().lookBackChoices(entry, now, now);
    return `
      <form class="rt-diw__form" data-diw-form data-id="${esc(entry.id)}" ${due ? "" : "hidden"}>
        ${due ? `<p>${esc(LB().dueQuestion(entry, dayWords))}</p>` : title ? `<p>${esc(entry.title || "Untitled Ritual")}</p>` : ""}
        <div class="sp-chips" role="group" aria-label="Did it work?">
          ${LB().ANSWERS.map((a) => UI.chip(a.label, { pressed: answer === a.id, attrs: `data-diw-answer="${a.id}"` })).join("")}
        </div>
        <div class="sp-field">
          <label for="diw-${esc(entry.id)}">What happened</label>
          <textarea id="diw-${esc(entry.id)}" name="outcome" placeholder="In your own words">${esc(lookBack?.outcome || "")}</textarea>
        </div>
        <div data-diw-wait ${answer === "not_yet" || answer === "partly" ? "" : "hidden"}>
          <p class="sp-caption">Still waiting? Look again</p>
          <div class="sp-chips" role="group" aria-label="Look again">
            ${waits.map((c) => UI.chip(c.label, { pressed: false, attrs: `data-diw-wait-when="${c.when}"` })).join("")}
          </div>
        </div>
        <div class="sp-actions">
          <button class="button button--primary" type="submit" data-diw-submit>Save the answer</button>
          ${due ? "" : `<button class="button button--ghost" type="button" data-diw-close>Not now</button>`}
        </div>
      </form>`;
  }

  /** One entry's look-back: the question when it's due, the answer once given, or the day it's waiting for. */
  function card(entry, now = new Date(), { title = false, kind = "" } = {}) {
    const lookBack = LB().readLookBack(entry);
    const due = LB().isDue(entry, now);
    let summary = "";
    if (lookBack?.answer) {
      summary = `
        <p>${esc(`${LB().answerLabel(lookBack.answer)}${lookBack.outcome ? `. ${lookBack.outcome}` : ""}`)}</p>
        ${lookBack.outcomeDate ? `<p class="sp-caption">${esc(`Written ${dayWords(lookBack.outcomeDate)}`)}</p>` : ""}
        ${waitedLines(lookBack)}
        <div class="sp-actions"><button class="button button--ghost" type="button" data-diw-open>Change the answer</button></div>`;
    } else if (!due) {
      summary = `
        ${lookBack?.date ? `<p>${esc(`It will come back to you ${lookBackWords(lookBack)}.`)}</p>` : `<p class="sp-muted">No look-back day is set for this one.</p>`}
        ${waitedLines(lookBack)}
        <div class="sp-actions"><button class="button button--ghost" type="button" data-diw-open>Say what happened now</button></div>`;
    }
    return `
      <section class="sp-card rt-diw ${due ? "sp-card--gold" : ""}" data-diw="${esc(entry.id)}"${kind ? ` data-diw-kind="${esc(kind)}"` : ""}>
        <p class="sp-eyebrow">Did it work?</p>
        ${title ? `<h3 class="rt-diw__title">${esc(entry.title || "Untitled Ritual")}</h3>` : ""}
        <div data-diw-summary>${summary}</div>
        ${form(entry, { due, now, title: false })}
      </section>`;
  }

  /** "What works for you": success by phase, intention, day, candle, herb and stone, small numbers said plainly. */
  function worksSection(works) {
    if (!works.answered) {
      return `<section class="sp-section" aria-labelledby="rt-works"><h2 class="sp-label" id="rt-works">What works for you</h2>
        <section class="sp-card"><p>${esc(
          works.waiting
            ? `When you look back on your workings and say whether they worked, what works for you will gather here. ${works.waiting} ${works.waiting === 1 ? "is" : "are"} waiting for a look-back day.`
            : "When you journal a ritual or spell, choose a day to look back. Once you’ve said whether your workings worked, what works for you will gather here."
        )}</p></section></section>`;
    }
    const W = R().whatWorks;
    const group = (title, tallies) =>
      tallies.length
        ? `<section class="sp-card"><p class="sp-eyebrow">${esc(title)}</p><ul class="rt-bars">${tallies
            .map(
              (t) => `<li class="rt-works">
                <div class="rt-bar">
                  <span class="rt-bar__label rt-works__label">${esc(t.label)}</span>
                  <span class="rt-bar__track${t.caveat ? " is-faint" : ""}" aria-hidden="true"><span style="width:${Math.max(t.rate * 100, 2)}%"></span></span>
                </div>
                <span class="sp-caption">${esc(`${W.tallyWords(t)}${t.caveat ? ` · ${t.caveat}` : ""}`)}</span>
              </li>`
            )
            .join("")}</ul></section>`
        : "";
    return `<section class="sp-section" aria-labelledby="rt-works"><h2 class="sp-label" id="rt-works">What works for you</h2>
      <section class="sp-card sp-card--gold">${works.lines.map((line) => `<p>${esc(line)}</p>`).join("")}${works.caveat ? `<p class="sp-muted">${esc(works.caveat)}</p>` : ""}</section>
      ${group("By moon phase", works.byPhase)}
      ${group("By intention", works.byIntention)}
      ${group("By day and its planet", works.byDay)}
      ${group("Candle colours", works.byCandle)}
      ${group("Herbs and oils", works.byHerb)}
      ${group("Stones", works.byCrystal)}
      <p class="sp-caption">A yes counts whole and a partly counts half. Groups with fewer than three answers are early notes, not patterns.</p>
    </section>`;
  }

  /** A spell jar, sachet or other working's card: the item seen as a journal entry. */
  function itemCard(item, now = new Date()) {
    return card(AL().apothecaryWorking(item), now, { title: true, kind: "apothecary" });
  }

  /**
   * Answer from any card inside `root`. `entries()` gives the journal as the
   * page last read it; `onSaved()` redraws the page. `items`, when the page
   * shows My Apothecary's workings: { list() → items, save(item) }.
   */
  function bind(root, entries, onSaved, items = null) {
    if (!root || root.dataset.diwBound) return;
    root.dataset.diwBound = "1";
    root.addEventListener("click", (event) => {
      const card = event.target.closest("[data-diw]");
      if (!card) return;
      const formEl = card.querySelector("[data-diw-form]");
      if (event.target.closest("[data-diw-open]")) {
        formEl.hidden = false;
        card.querySelector("[data-diw-summary]").hidden = true;
        formEl.querySelector("textarea")?.focus();
        return;
      }
      if (event.target.closest("[data-diw-close]")) {
        formEl.hidden = true;
        card.querySelector("[data-diw-summary]").hidden = false;
        return;
      }
      const answer = event.target.closest("[data-diw-answer]");
      if (answer) {
        const on = answer.getAttribute("aria-pressed") !== "true";
        formEl.querySelectorAll("[data-diw-answer]").forEach((b) => b.setAttribute("aria-pressed", b === answer && on ? "true" : "false"));
        const id = on ? answer.dataset.diwAnswer : null;
        formEl.querySelector("[data-diw-wait]").hidden = !(id === "not_yet" || id === "partly");
        return;
      }
      const wait = event.target.closest("[data-diw-wait-when]");
      if (wait) {
        const on = wait.getAttribute("aria-pressed") !== "true";
        formEl.querySelectorAll("[data-diw-wait-when]").forEach((b) => b.setAttribute("aria-pressed", b === wait && on ? "true" : "false"));
        formEl.querySelector("[data-diw-submit]").textContent = on ? "Keep waiting" : "Save the answer";
      }
    });
    root.addEventListener("submit", async (event) => {
      const formEl = event.target.closest("[data-diw-form]");
      if (!formEl) return;
      event.preventDefault();
      const isItem = formEl.closest("[data-diw]")?.dataset.diwKind === "apothecary";
      const item = isItem && items ? items.list().find((i) => i.id === formEl.dataset.id) : null;
      const entry = isItem ? (item ? AL().apothecaryWorking(item) : null) : entries().find((e) => e.id === formEl.dataset.id);
      if (!entry) return;
      const pressed = formEl.querySelector('[data-diw-answer][aria-pressed="true"]');
      const answer = pressed ? pressed.dataset.diwAnswer : null;
      const waitEl = formEl.querySelector("[data-diw-wait]");
      const waiting = !waitEl.hidden ? formEl.querySelector('[data-diw-wait-when][aria-pressed="true"]') : null;
      if (!answer && !waiting) {
        UI.say("Choose Yes, Partly, Not yet or No first.");
        return;
      }
      const now = new Date();
      const base = LB().readLookBack(entry)?.answer ? LB().reopenLookBack(entry, now) : entry;
      const next = LB().answerLookBack(
        base,
        { answer, outcome: formEl.outcome.value, keepWaiting: waiting ? { when: waiting.dataset.diwWaitWhen } : null },
        now
      );
      const button = formEl.querySelector("[data-diw-submit]");
      button.disabled = true;
      try {
        if (isItem) await items.save(AL().itemFromWorking(item, next));
        else await S.saveJournalMetadata(next);
        UI.say(waiting ? "Kept waiting. It will come back to you then." : "Saved. Thank you for looking back.");
        await onSaved();
      } catch (error) {
        console.error(error);
        UI.say(`Your answer couldn't be saved. ${error?.message || "Please try again."}`, "problem");
        button.disabled = false;
      }
    });
  }

  global.DidItWork = { card, itemCard, worksSection, bind, lookBackWords };
})(window);
