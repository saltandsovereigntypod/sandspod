/*
 * The coven's moon calendar on the website, level with the app
 * (components/covens/CovenMoonCalendar.tsx):
 *
 *   card   About: "What the coven follows", in plain words, with today's date
 *          by the coven's count, and for members "Use the coven's calendar
 *          for my own" (showing first what will change in their Settings) or
 *          "Keep my own"; "Put back my own calendar" undoes it, and a later
 *          change to the coven's calendar asks again, never changing anything
 *          by itself.
 *   form   Manage → the practice calendar: how the coven counts its days
 *          (the ordinary date or the moon's months), the calendars it shows
 *          beside the date, and the moon's choices, including those that
 *          follow the Attic, Coligny or Hindu calendar when the coven shows it.
 *   lineOf A gathering's date by the coven's count, when it differs from yours
 *          (after prime, which the page calls as it loads).
 *
 * The logic is the app's (SaltCore.covens.moonCalendar and .calendars,
 * js/core/covens.js). Before 20261114000000_coven_moon_calendar.sql is applied
 * the coven reads as having set nothing.
 */
(function (global) {
  "use strict";

  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc } = UI;
  const M = () => global.SaltCore?.covens?.moonCalendar;
  const K = () => global.SaltCore?.covens?.calendars;

  function readPlace() {
    try {
      const place = JSON.parse(global.localStorage.getItem("sky.place") || "null");
      return place && Number.isFinite(place.latitude) && Number.isFinite(place.longitude) ? place : null;
    } catch {
      return null;
    }
  }

  // The coven's moon calendar, read once per coven and page load.
  const moons = new Map();
  function covenMoon(covenId, fresh = false) {
    if (fresh || !moons.has(covenId)) moons.set(covenId, D.fetchCovenMoon(covenId).catch(() => null).then((m) => m || {}));
    return moons.get(covenId);
  }

  const mySettings = async () => (typeof global.getMySettings === "function" ? global.getMySettings() : null);

  // --- What the coven follows ------------------------------------------------

  async function card(container, state) {
    if (!container || !M() || !state?.coven) return;
    const moon = await covenMoon(state.coven.id);
    const coven = { ...state.coven, moon_calendar: moon };
    const lines = M().covenFollowsLines(coven);
    if (!lines.length) {
      container.innerHTML = "";
      return;
    }
    const member = !!(state.perms?.member && state.context?.user);
    let mine = member ? await mySettings().catch(() => null) : null;
    let confirming = false;
    let message = "";

    const draw = () => {
      const place = readPlace();
      const today = new Date();
      const theirs = M().covenMoonLine(coven, today, place);
      const differs = mine ? M().covenMoonLineIfDifferent(coven, mine, today, place) : theirs;
      const st = mine ? M().covenCalendarState(mine, coven) : "none";
      const changes = mine ? M().covenCalendarChanges(mine, coven).lines : [];
      const button = (action, label, kind = "button--primary") => `<button class="button ${kind} button--small" type="button" data-moon-action="${action}">${esc(label)}</button>`;
      let actions = "";
      if (mine && confirming) {
        actions = `<p class="sp-caption"><strong>This changes your Settings → Calendar & holidays:</strong></p>
          <ul class="cv-moon-changes">${changes.map((c) => `<li>${esc(c.from ? `${c.label}: ${c.from} → ${c.to}` : `${c.label}: ${c.to}`)}</li>`).join("")}</ul>
          <p class="sp-caption">Everything else stays yours, and you can put your own back afterwards.</p>
          <div class="sp-actions">${button("take", "Yes, use it")}${button("cancel", "Not now", "button--ghost")}</div>`;
      } else if (mine && (st === "offer" || st === "changed")) {
        actions = `${st === "changed" ? `<p class="sp-caption">The coven’s calendar has changed since you took it. Update yours to match?</p>` : ""}
          <div class="sp-actions">${button("confirm", st === "changed" ? "Update mine" : "Use the coven’s calendar for my own")}${button("keep", st === "changed" ? "Keep mine as it is" : "Keep my own", "button--ghost")}</div>`;
      } else if (mine && st === "applied") {
        actions = `<p class="sp-caption">Your calendar follows the coven’s.</p>`;
      } else if (mine && st === "same") {
        actions = `<p class="sp-caption">Your calendar already counts as the coven’s does.</p>`;
      } else if (mine && st === "kept") {
        actions = `<p class="sp-caption">You keep your own calendar.</p><div class="sp-actions">${button("confirm", "Use the coven’s after all", "button--ghost")}</div>`;
      }
      if (mine && !confirming && M().canRestore(mine, coven)) actions += `<div class="sp-actions">${button("restore", "Put back my own calendar", "button--ghost")}</div>`;
      container.innerHTML = `<section class="sp-section" aria-labelledby="coven-follows-heading"><h2 id="coven-follows-heading">What the coven follows</h2>
        <div class="sp-card">${lines.map((l) => `<p>${esc(l)}</p>`).join("")}
          ${theirs ? `<p class="sp-caption">${esc(differs ? `Today, by the coven’s count: ${theirs}.` : `Today, by the coven’s count and yours: ${theirs}.`)}</p>` : ""}
          ${actions}
          <p class="cv-status" role="status" aria-live="polite" data-moon-status>${esc(message)}</p></div></section>`;
    };

    const save = async (changes, done) => {
      if (!mine || typeof global.saveMySettings !== "function") return;
      container.querySelectorAll("button").forEach((b) => (b.disabled = true));
      try {
        const latest = (await mySettings()) || mine;
        const next = { ...latest, ...changes };
        await global.saveMySettings(next);
        mine = next;
        confirming = false;
        message = done;
        global.dispatchEvent(new CustomEvent("saltSettingsChanged"));
      } catch (error) {
        console.error(error);
        message = global.CovenLogic?.errorMessage?.(error) || "That didn’t save. Please try again.";
      }
      draw();
    };

    container.onclick = (event) => {
      const action = event.target.closest("[data-moon-action]")?.dataset.moonAction;
      if (!action || !mine) return;
      if (action === "confirm") {
        confirming = true;
        message = "";
        return draw();
      }
      if (action === "cancel") {
        confirming = false;
        return draw();
      }
      if (action === "take") return save(M().takeCovenCalendar(mine, coven), "Your calendar now follows the coven’s.");
      if (action === "keep") return save(M().keepMyCalendar(mine, coven), "Your own calendar stays as it is.");
      if (action === "restore") return save(M().restoreMyCalendar(mine), "Your own calendar is back as it was.");
    };
    draw();
  }

  // --- Manage: how the coven counts its days --------------------------------

  const COUNT_OPTIONS = [
    { value: "standard", label: "Standard" },
    { value: "moon", label: "The moon" },
  ];

  async function form(container, coven) {
    if (!container || !M() || !K()) return;
    const moon = await covenMoon(coven.id, true);
    let draft = M().covenSettings({ ...coven, moon_calendar: moon });
    let message = "";
    const chips = (group, options, value, label) =>
      `<div class="cv-moon-chips" role="group" aria-label="${esc(label)}">${options.map((o) => `<button type="button" class="button button--small button--ghost" data-moon-chip="${esc(group)}" data-value="${esc(o.value)}" aria-pressed="${o.value === value}">${esc(o.label)}</button>`).join("")}</div>`;

    const draw = () => {
      const lead = K().primaryCalendar(draft);
      const shown = new Set(String(draft[K().EXTRA_KEY] || "").split(",").filter(Boolean));
      const usesMoon = lead === "moon" || shown.has("moon");
      const list = K().CALENDARS.filter((c) => !(lead === "moon" && c.id === "moon"));
      const choices = usesMoon
        ? K().choiceViews(draft, "moon")
            .map(
              (c) => `<div class="cv-moon-choice"><p class="sp-caption"><strong>${esc(c.label)}</strong></p>${chips(`opt:${c.key}`, c.options, c.value, c.label)}
                ${[c.fallback, c.note, c.aside, c.hint].filter(Boolean).map((t) => `<p class="sp-caption">${esc(t)}</p>`).join("")}</div>`,
            )
            .join("")
        : "";
      container.innerHTML = `<form class="sp-card" data-coven-counting>
          <h2>How the coven counts its days</h2>
          <p class="sp-caption">The coven’s own way of counting days, as members choose theirs in Settings → Calendar & holidays. Members see it on the coven’s page and may take it for their own; it never changes anyone’s settings unless they choose.</p>
          <p class="sp-caption"><strong>Count the coven’s days by</strong></p>
          ${chips("count", COUNT_OPTIONS, lead, "Count the coven’s days by")}
          <p class="sp-caption"><strong>Also show</strong> · the calendars the coven keeps beside the date. The moon’s months can follow the Attic, Coligny or Hindu calendar when the coven shows it.</p>
          <div class="cv-holiday-picks">${list.map((def) => `<label class="cv-check"><input type="checkbox" name="moon-extra" value="${esc(def.id)}" ${shown.has(def.id) ? "checked" : ""} /> <span>${esc(def.name)}</span></label>`).join("")}</div>
          ${usesMoon ? `<h3>${esc(K().MOON_CALENDAR.name)}</h3>${choices}` : ""}
          <div class="sp-actions"><button class="button button--primary button--small" type="submit">Save how the coven counts</button></div>
          <p class="cv-status" role="status" aria-live="polite" data-status>${esc(message)}</p>
        </form>`;
    };

    container.onclick = (event) => {
      const chip = event.target.closest("[data-moon-chip]");
      if (!chip) return;
      const group = chip.dataset.moonChip;
      const key = group === "count" ? K().COUNT_KEY : K().optionKey("moon", group.slice(4));
      draft = { ...draft, [key]: chip.dataset.value };
      message = "";
      draw();
    };
    container.onchange = (event) => {
      const box = event.target.closest("[name=moon-extra]");
      if (!box) return;
      draft = { ...draft, [K().EXTRA_KEY]: K().withShown(draft, box.value, box.checked) };
      draw();
    };
    container.onsubmit = async (event) => {
      event.preventDefault();
      const lead = K().primaryCalendar(draft);
      const shown = new Set(String(draft[K().EXTRA_KEY] || "").split(",").filter(Boolean));
      const calendars = K().CALENDARS.filter((c) => shown.has(c.id) && !(lead === "moon" && c.id === "moon")).map((c) => c.id);
      const formEl = container.querySelector("form");
      [...formEl.elements].forEach((c) => (c.disabled = true));
      try {
        await D.saveCovenCounting(coven.id, calendars, M().readCovenMoon({ ...draft, [K().COUNT_KEY]: lead }));
        moons.delete(coven.id);
        // The page's copy of the coven, so About shows it without a reload.
        coven.practice_calendars = calendars;
        message = "Saved. Members see it on the coven’s page, and may take it for their own.";
      } catch (error) {
        console.error(error);
        message = global.CovenLogic?.errorMessage?.(error) || String(error?.message || error);
      }
      draw();
    };
    draw();
  }

  // --- A gathering's date by the coven's count -------------------------------

  // Read once per page load (prime), so the rituals list can ask synchronously (lineOf).
  let primed = null;
  async function prime(state) {
    if (!M() || !state?.coven) return;
    const [moon, mine] = await Promise.all([covenMoon(state.coven.id), mySettings().catch(() => null)]);
    primed = { id: state.coven.id, coven: { ...state.coven, moon_calendar: moon }, mine, place: readPlace() };
  }

  /** "Hekatombaion · day 7 by the coven’s count" for a gathering's time, when it differs from yours, or "". */
  function lineOf(state, when) {
    if (!when || !M() || !primed || primed.id !== state?.coven?.id) return "";
    const line = M().covenMoonLineIfDifferent({ ...state.coven, moon_calendar: primed.coven.moon_calendar }, primed.mine, new Date(when), primed.place);
    return line ? `${line} by the coven’s count` : "";
  }

  global.CovenMoonCalendar = { card, form, prime, lineOf };
})(window);
