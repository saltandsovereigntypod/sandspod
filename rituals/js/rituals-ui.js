/*
 * Rituals pages: small DOM helpers shared by every page (rows, chips, moon
 * discs, a status line, the ingredient check, calendar files).
 */
(function (global) {
  "use strict";

  const esc = (text) => global.SaltPage.esc(text);
  const L = global.RitualsLogic;

  const SIGN_IN_HREF = "/?sanctuary=auth";

  function root() {
    return global.document.querySelector("[data-page-root]");
  }

  /** "‹ Rituals" back link, an eyebrow and the page title. */
  function header({ back = { href: "/rituals/", label: "Rituals" }, eyebrow = "", title, lead = "" }) {
    return `
      ${back ? `<a class="sp-back" href="${esc(back.href)}">‹ ${esc(back.label)}</a>` : ""}
      <header class="rt-head">
        ${eyebrow ? `<p class="sp-eyebrow">${esc(eyebrow)}</p>` : ""}
        <h1>${esc(title)}</h1>
        ${lead ? `<p class="sp-muted">${esc(lead)}</p>` : ""}
      </header>`;
  }

  function row({ href, title, detail = "", attrs = "" }) {
    const inner = `
      <span class="sp-row__text">
        <span class="sp-row__title">${esc(title)}</span>
        ${detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""}
      </span>
      <span class="sp-row__chevron" aria-hidden="true">›</span>`;
    return href ? `<a class="sp-row" href="${esc(href)}" ${attrs}>${inner}</a>` : `<button type="button" class="sp-row" ${attrs}>${inner}</button>`;
  }

  function chip(label, { pressed = null, attrs = "", title = "" } = {}) {
    const state = pressed === null ? "" : ` aria-pressed="${pressed ? "true" : "false"}"`;
    return `<button type="button" class="sp-chip"${state}${title ? ` title="${esc(title)}" aria-label="${esc(title)}"` : ""} ${attrs}>${esc(label)}</button>`;
  }

  function moon(illumination, waxing, size = 32) {
    const path = L.moonPath(illumination, waxing);
    return `<svg class="rt-moon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" class="rt-moon__dark" />
      ${illumination >= 0.99 ? `<circle cx="12" cy="12" r="10" class="rt-moon__lit" />` : path ? `<path d="${path}" class="rt-moon__lit" />` : ""}
    </svg>`;
  }

  /** A polite status line at the top of the page, for saves and problems. */
  function say(message, tone = "info") {
    let line = global.document.querySelector("[data-rt-status]");
    if (!line) {
      line = global.document.createElement("p");
      line.dataset.rtStatus = "";
      line.className = "sp-notice rt-status";
      line.setAttribute("role", "status");
      line.setAttribute("aria-live", "polite");
      root()?.prepend(line);
    }
    line.textContent = message;
    line.dataset.tone = tone;
    line.hidden = !message;
  }

  /** Sign-in note for guests, in the app's words. */
  function signInCard(text) {
    return `<section class="sp-card"><p>${esc(text)}</p><div class="sp-actions"><a class="button button--ghost" href="${SIGN_IN_HREF}">Sign in</a></div></section>`;
  }

  /** "You have 6 of the 8": the check, with its lists behind a disclosure. */
  function ingredientCheck(check, { altarName = "" } = {}) {
    if (!check || !check.total && !check.optionalHave.length && !check.optionalMissing.length) return "";
    const C = global.SaltCore.rituals.ingredients;
    const ratio = check.total ? check.haveCount / check.total : 1;
    const listOf = (title, items) =>
      items.length
        ? `<div class="rt-check__list"><p class="sp-eyebrow">${esc(title)}</p><ul>${items
            .map(
              (item) => `<li class="${item.have ? "is-have" : ""}"><span class="rt-check__mark" aria-hidden="true">${item.have ? "✓" : "○"}</span>
                <span><span class="rt-check__name">${esc(item.name)}</span>${item.have ? `<span class="sp-caption"> · ${esc(C.foundWords(item))}</span>` : `<span class="sr-only">, not found</span>`}</span></li>`
            )
            .join("")}</ul></div>`
        : "";
    return `
      <details class="sp-details rt-check">
        <summary>
          <span class="rt-check__meter" aria-hidden="true"><span style="width:${Math.round(ratio * 100)}%"></span></span>
          <span class="rt-check__head"><span class="rt-check__line">${esc(check.line)}</span>
          <span class="sp-caption">${altarName ? `On ${esc(altarName)}, and among your things` : "Among your things"}</span></span>
        </summary>
        ${listOf("You have", check.have)}
        ${listOf("To gather", check.missing)}
        ${listOf("If you like", [...check.optionalHave, ...check.optionalMissing])}
        <p class="sp-caption">Checked against your apothecary, your own cabinet items, your stones and your garden.</p>
      </details>`;
  }

  /** Save an .ics file (calendar files open in Apple Calendar, Outlook and Google). */
  function downloadIcs(text, filename) {
    const doc = global.document;
    if (typeof Blob === "undefined" || !global.URL?.createObjectURL) return false;
    const url = global.URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
    const link = doc.createElement("a");
    link.href = url;
    link.download = filename;
    doc.body.appendChild(link);
    link.click();
    link.remove();
    global.setTimeout(() => global.URL.revokeObjectURL(url), 1000);
    return true;
  }

  /** Run something that might fail, saying so in plain words if it does. */
  async function attempt(work, failure) {
    try {
      return await work();
    } catch (error) {
      console.error(error);
      say(`${failure}. ${error?.message || "Please try again."}`, "problem");
      return undefined;
    }
  }

  global.RitualsUI = { esc, root, header, row, chip, moon, say, signInCard, ingredientCheck, downloadIcs, attempt, SIGN_IN_HREF };
})(window);
