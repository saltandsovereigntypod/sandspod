/*
 * The coven's tradition on its Practice calendar (app: the CovenTraditionForm
 * in coven/c/[slug]/manage/calendar.tsx): one of the course sets, saved on its
 * own (covens.course_tradition). Its course set, holiday calendars, premade
 * rituals and calendars are suggested first. The logic is the app's
 * (SaltCore.covens.covenTradition, js/core/covens.js).
 */
(function (global) {
  "use strict";

  const T = () => global.SaltCore?.covens?.covenTradition;
  const D = () => global.CovenData;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const known = new Map();
  /** The coven's tradition, read once a page. */
  function get(covenId) {
    if (!known.has(covenId)) known.set(covenId, D()?.fetchCovenTradition ? D().fetchCovenTradition(covenId).catch(() => null) : Promise.resolve(null));
    return known.get(covenId);
  }

  /** Put the calendars that suit the tradition first in the practice calendar form, and say so. */
  function orderCalendars(form, tradition) {
    if (!form) return;
    const suits = T()?.calendarsForTradition(tradition) || [];
    const choices = [...form.querySelectorAll(".cv-calendar-choice")];
    if (!choices.length) return;
    const first = choices[0];
    choices.forEach((row) => row.querySelector("[data-suits]")?.remove());
    choices
      .filter((row) => suits.includes(row.querySelector("[name=tradition]")?.value))
      .reverse()
      .forEach((row) => {
        first.parentNode.insertBefore(row, form.querySelector(".cv-calendar-choice"));
        row.querySelector(".sp-caption")?.insertAdjacentHTML("afterbegin", `<span data-suits>Suits the coven’s tradition. </span>`);
      });
  }

  /** The form, drawn into `holder`; `calendar` is the practice calendar form to order. */
  async function form(holder, coven, calendar) {
    if (!holder || !T()) return;
    const current = (await get(coven.id)) || "";
    holder.innerHTML = `<form class="sp-card" data-coven-tradition>
        <h2>The coven’s tradition</h2>
        <p class="sp-caption">Its course set, holiday calendars, premade rituals and calendars are suggested first, to those who design programs here and to every member. Nothing is hidden or chosen for anyone.</p>
        <div class="sp-field"><label for="cv-tradition">Tradition</label>
          <select id="cv-tradition" name="course_tradition"><option value="">Not said</option>${T().COVEN_TRADITIONS.map((t) => `<option value="${esc(t.id)}"${t.id === current ? " selected" : ""}>${esc(t.name)}</option>`).join("")}</select></div>
        <div class="sp-actions"><button class="button button--primary" type="submit">Save the tradition</button></div>
        <p class="sp-caption" data-status role="status"></p>
      </form>`;
    orderCalendars(calendar, current || null);
    const el = holder.querySelector("form");
    el.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = el.querySelector("[data-status]");
      const value = el.querySelector("select").value || null;
      status.textContent = "Saving…";
      try {
        await D().saveCovenTradition(coven.id, value);
        known.set(coven.id, Promise.resolve(value));
        orderCalendars(calendar, value);
        status.textContent = "Saved.";
      } catch (error) {
        status.textContent = error.message;
      }
    });
  }

  global.CovenTradition = { get, form };
})(window);
