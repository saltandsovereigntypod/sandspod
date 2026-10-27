/*
 * Paths in the coven (?tab=paths): what share of the coven practises each
 * way, keeps each path and honours each deity, never who. The website's twin
 * of the app's paths.tsx, read by the app's own logic (lib/covens/paths.ts,
 * through js/core/covens.js as SaltCore.covens.paths). For the coven's head,
 * those who keep the members' record, and every member when the head shows it
 * to the whole coven (switched here). The database sums it up and checks who
 * is asking (supabase/migrations/20261105000000_coven_paths_overview.sql).
 */
(function (global) {
  "use strict";

  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc } = UI;
  const P = () => global.SaltCore?.covens?.paths || null;

  /** Whether this person sees the overview (the database checks again). */
  function seesPaths(state) {
    const p = P();
    if (!p || !state.perms) return false;
    return p.seesPaths({
      founder: state.perms.founder,
      site: state.perms.site,
      member: state.perms.member,
      record: state.recordSettings,
      paths: state.pathsSettings,
      membership: state.membership,
      userId: state.context.user?.id
    });
  }

  function barHtml(item, shared) {
    const other = item.key === "other";
    return `<div class="cv-share${other ? " cv-share--other" : ""}" role="img" aria-label="${esc(`${item.name}: ${item.count} of ${shared}, ${item.pct}%`)}">
        <div class="cv-share__labels"><span class="cv-share__name">${esc(item.name)}</span><span class="cv-share__pct">${item.pct}%</span></div>
        <div class="cv-share__track"><span style="width:${Math.max(item.pct, 2)}%"></span></div>
      </div>`;
  }

  function overviewHtml(overview) {
    const p = P();
    if (!overview) return "";
    const top = `<p class="sp-caption">${esc(p.sharedLine(overview))}</p>`;
    if (!overview.enough) return top;
    return top + p.SECTIONS.map(({ key, label }) => {
      const s = overview[key];
      if (!s) return "";
      const bars = p.sectionBars(s);
      return `<section class="sp-section"><h2>${esc(label)}</h2>
          <p class="sp-caption">${esc(p.sectionLine(s, key))}</p>
          ${bars.length ? `<div class="sp-card cv-shares">${bars.map((b) => barHtml(b, s.shared)).join("")}</div>` : s.shared >= p.MIN_COUNT ? `<p class="sp-empty">Nothing shared by three or more yet.</p>` : ""}
        </section>`;
    }).join("");
  }

  let pane = null;

  const CovenPaths = {
    async mount(el, state) {
      pane = el;
      const p = P();
      if (!p) return (pane.innerHTML = `<p class="sp-notice">This part of the coven couldn’t load. Please refresh the page.</p>`);
      const { coven, perms } = state;
      const head = perms.founder || perms.site;
      if (!seesPaths(state)) {
        pane.innerHTML = `<p class="sp-notice">The coven’s head sees this, with those who keep the members’ record, unless the head shows it to everyone.</p>`;
        return;
      }
      pane.innerHTML = `<p>How the coven practises, the paths it walks and the deities it honours, as a share of those who have said.</p>
        <div data-overview><p class="sp-caption">Counting…</p></div>
        <p class="sp-caption">${esc(p.ANONYMOUS_NOTE)}</p>
        ${head ? `<section class="sp-card" data-paths-visible>
          <h2>Who sees it</h2>
          <p class="sp-caption">You, as the coven’s head, always see it, as do those who keep the members’ record.</p>
          <label class="cv-check"><input type="checkbox" data-show-all${state.pathsSettings?.paths_visible_to_all ? " checked" : ""} /> <span>Show it to the whole coven: every member can open Paths in the coven from the coven’s page.</span></label>
          <p class="cv-status" role="status" aria-live="polite" data-status></p>
        </section>` : ""}`;

      const box = pane.querySelector("[data-overview]");
      try {
        const overview = p.readOverview(await D.pathsOverview(coven.id));
        if (pane === el) box.innerHTML = overviewHtml(overview) || `<p class="sp-empty">Nothing to show yet.</p>`;
      } catch (error) {
        console.error(error);
        box.innerHTML = `<p class="sp-notice">${esc(global.CovenLogic.errorMessage(error))}</p>`;
      }

      const toggle = pane.querySelector("[data-show-all]");
      toggle?.addEventListener("change", async () => {
        const on = toggle.checked;
        const saved = await UI.busy(toggle, pane.querySelector("[data-paths-visible] [data-status]"), () => D.setPathsVisible(coven.id, on), {
          done: on ? "The whole coven can see it now." : "Only you and those who keep the record see it now."
        });
        if (saved) state.pathsSettings = saved;
        else toggle.checked = !on;
      });
    },
    unmount() {
      pane = null;
    }
  };

  global.CovenPaths = CovenPaths;
  global.CovenPathsAccess = { seesPaths };
})(window);
