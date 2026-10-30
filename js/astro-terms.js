/*
 * Astrology terms anywhere on the website, as the app has them
 * (app/src/components/astro/Explain.tsx): SaltAstroTerms.html(text) turns a
 * sentence into HTML with its glossary terms as buttons; any
 * [data-astro-term] button opens one explanation dialog with a Simple ·
 * Detailed switch. The level is the setting `astro_explanations` (saved with
 * the rest of the person's settings, so it matches the app); each card can be
 * switched on its own.
 *
 * Needs js/core/astro.js (window.SaltCore.astro). Loads lazily what it
 * doesn't need straight away.
 */
(function (global) {
  "use strict";

  const A = () => global.SaltCore && global.SaltCore.astro;
  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const LEVEL_KEY = "astro.explanations";

  let level = "simple";
  try {
    const local = JSON.parse(global.localStorage.getItem("saltAndSovereigntyUserSettings") || "{}");
    if (local && (local.astro_explanations === "detailed" || local.settings?.astro_explanations === "detailed")) level = "detailed";
    if (global.localStorage.getItem(LEVEL_KEY) === "detailed") level = "detailed";
  } catch {
    /* storage blocked */
  }
  // The account's own setting, once known.
  if (typeof global.getMySettings === "function") {
    Promise.resolve()
      .then(() => global.getMySettings())
      .then((s) => {
        if (s && (s.astro_explanations === "simple" || s.astro_explanations === "detailed")) level = s.astro_explanations;
      })
      .catch(() => {});
  }

  async function setLevel(next) {
    level = next === "detailed" ? "detailed" : "simple";
    try {
      global.localStorage.setItem(LEVEL_KEY, level);
    } catch {
      /* fine */
    }
    try {
      if (global.SaltSettings?.patch) await global.SaltSettings.patch({ astro_explanations: level });
      else if (typeof global.getMySettings === "function" && typeof global.saveMySettings === "function") {
        const s = await global.getMySettings();
        const next2 = { ...s };
        ["settings", "user_id", "updated_at"].forEach((k) => delete next2[k]);
        await global.saveMySettings({ ...next2, astro_explanations: level });
      }
    } catch {
      /* saved here at least */
    }
    global.dispatchEvent(new CustomEvent("saltAstroLevel", { detail: level }));
  }

  /** A sentence as HTML, its terms as buttons. */
  function html(text, options = {}) {
    const a = A();
    if (!a) return esc(text);
    return a.glossary
      .linkTerms(String(text ?? ""), options)
      .map((p) => (p.term ? `<button type="button" class="astro-term" data-astro-term="${esc(p.term)}" aria-label="${esc(p.text)}: what it means">${esc(p.text)}</button>` : esc(p.text)))
      .join("");
  }

  function detailHtml(entry) {
    const a = A();
    return a.glossary.DETAIL_SECTIONS.filter((s) => entry.detailed[s.key])
      .map((s) => `<div class="astro-part"><p class="astro-part__head">${esc(s.label)}</p><p>${html(entry.detailed[s.key], { skip: [entry.id] })}</p></div>`)
      .join("");
  }

  /** The Simple · Detailed switch, as buttons with data-astro-level. */
  function levelSwitch(current, scopeAttr = "") {
    return `<div class="astro-level" role="group" aria-label="How much to explain"${scopeAttr}>${["simple", "detailed"]
      .map((l) => `<button type="button" data-astro-level="${l}" aria-pressed="${current === l}">${l === "simple" ? "Simple" : "Detailed"}</button>`)
      .join("")}</div>`;
  }

  const PHASE_REF = { new: "moon-new", firstQuarter: "moon-first-quarter", full: "moon-full", lastQuarter: "moon-last-quarter" };
  const TOOL = { hours: "/practice/cosmic/hours/", chart: "/practice/cosmic/chart/", charts: "/practice/cosmic/charts/", sky: "/today/sky/", learn: "/practice/cosmic/learn/" };

  function linkHref(link) {
    if (link.kind === "planet-guide") return `/practice/cosmic/planet/?planet=${encodeURIComponent(link.planet)}`;
    if (link.kind === "moon-phase") return `/today/holy/?ref=${encodeURIComponent(PHASE_REF[link.phase])}`;
    if (link.kind === "tool") return TOOL[link.tool];
    if (link.kind === "library") {
      const lib = global.TraditionalLibrary?.deity || {};
      const hit = Object.entries({ ...(global.TraditionalLibrary?.herb || {}), ...(global.TraditionalLibrary?.crystal || {}), ...lib }).find(([, v]) => v && v.DisplayName === link.name);
      if (!hit) return null;
      const type = Object.keys(global.TraditionalLibrary).find((t) => global.TraditionalLibrary[t][hit[0]] === hit[1]);
      return `/library/entry/?entity=${encodeURIComponent(`traditional/${type}/${hit[0]}`)}`;
    }
    return null;
  }

  let dialog = null;
  let openId = null;
  let own = null;

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = global.document.createElement("dialog");
    dialog.className = "astro-dialog";
    dialog.setAttribute("aria-labelledby", "astro-dialog-title");
    global.document.body.appendChild(dialog);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      openId = null;
      own = null;
    });
    return dialog;
  }

  function render() {
    const a = A();
    const entry = openId && a.glossary.term(openId);
    if (!entry) return;
    const lv = own || level;
    const links = (entry.links || [])
      .map((l) => {
        const href = linkHref(l);
        const label = l.label || (l.kind === "planet-guide" ? `${l.planet}: the full guide` : l.kind === "library" ? `${l.name} in the Living Library` : "Open");
        return href ? `<a class="astro-link" href="${esc(href)}">${esc(label)} ›</a>` : "";
      })
      .join("");
    const related = (entry.related || [])
      .map((id) => a.glossary.term(id))
      .filter(Boolean)
      .map((e) => `<button type="button" class="sp-chip" data-astro-term="${esc(e.id)}">${esc(e.term)}</button>`)
      .join("");
    ensureDialog().innerHTML = `<div class="astro-dialog__body">
      <div class="astro-dialog__head"><div><p class="sp-eyebrow">Astrology</p><h2 id="astro-dialog-title">${esc(`${entry.symbol ? `${entry.symbol} ` : ""}${entry.term}`)}</h2></div><button type="button" class="pb-text-button" data-astro-close>Done</button></div>
      ${levelSwitch(lv, ' data-astro-scope="dialog"')}
      ${lv === "simple" ? `<p>${html(entry.simple, { skip: [entry.id] })}</p><p class="sp-caption">Detailed adds the astronomy, the history, how traditions read it, its use in the craft, and what to take care over.</p>` : detailHtml(entry)}
      ${links}
      ${related ? `<p class="sp-label">Read next</p><div class="sp-chips">${related}</div>` : ""}
      <a class="astro-link" href="/practice/cosmic/learn/?term=${esc(entry.id)}">All of astrology, explained ›</a>
      <p class="sp-caption">Traditional meanings, offered for reflection. Nothing in a chart decides who you are.</p>
    </div>`;
  }

  function open(id) {
    const a = A();
    if (!a || !a.glossary.term(id)) return;
    openId = id;
    render();
    const d = ensureDialog();
    if (!d.open) {
      if (typeof d.showModal === "function") d.showModal();
      else d.setAttribute("open", "");
    }
    d.querySelector("[data-astro-close]")?.focus();
  }

  global.document.addEventListener("click", (event) => {
    const t = event.target.closest?.("[data-astro-term]");
    if (t) {
      event.preventDefault();
      open(t.getAttribute("data-astro-term"));
      return;
    }
    const lv = event.target.closest?.("[data-astro-level]");
    if (lv && lv.closest(".astro-dialog")) {
      own = lv.getAttribute("data-astro-level");
      setLevel(own);
      render();
      return;
    }
    if (event.target.closest?.("[data-astro-close]")) dialog?.close();
  });

  global.SaltAstroTerms = {
    html,
    open,
    detailHtml,
    levelSwitch,
    get level() {
      return level;
    },
    setLevel,
    esc
  };
})(typeof window !== "undefined" ? window : globalThis);
