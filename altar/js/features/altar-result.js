/* =========================================================
   ALTAR RESULT
   What the last divination at the altar answered, held in the stage's
   corner, as the app has it (components/altar/DivinationResultCard.tsx;
   the wording is js/core/altar.js divinationResult): the pendulum's yes or
   no, the card or rune drawn, the scrying sit, the candle read. It stays
   until put away with ×, or another divination takes its place, and folds
   to a chip. "Add notes" keeps what you make of it on the reading itself
   (hedge.readings, its "What you make of it"; a candle's on its reading),
   so the notes show wherever readings show.

   AltarResult.show(result, { candleEl }) puts one up; on a coven altar a
   card someone else lays there shows to everyone (newlyLaid), and notes on
   it start a reading of your own.
   ========================================================= */

(function initializeAltarResult(global) {
  "use strict";

  const B = () => global.AltarApp;
  const R = () => global.SaltCore?.altar?.divinationResult;
  const READINGS = "hedge.readings";
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", '"': "&quot;", "'": "&#39;", ">": "&gt;" })[c]);
  const nowIso = () => new Date().toISOString();
  const stage = () => document.querySelector("[data-altar-stage]");

  let current = null;
  let candleEl = null;
  let folded = false;
  let said = "";

  async function readingEntry(id) {
    try { return ((await global.SaltCraft?.list?.(READINGS)) || []).find((e) => e.id === id) || null; } catch { return null; }
  }

  function box() {
    let el = document.querySelector("[data-altar-result]");
    const host = stage();
    if (!host) return null;
    if (!el) {
      el = document.createElement("div");
      el.className = "altar-result";
      el.setAttribute("data-altar-result", "");
      el.setAttribute("aria-live", "polite");
      el.addEventListener("click", onClick);
    }
    if (el.parentElement !== host) host.appendChild(el);
    return el;
  }

  function render() {
    const el = box();
    if (!el) return;
    const r = current;
    if (!r) { el.remove(); return; }
    const helpers = R();
    if (folded) {
      el.className = "altar-result altar-result--chip";
      el.innerHTML = `<button type="button" class="altar-result__chip" data-result="open" aria-label="${esc(helpers.resultChip(r))}. Show the answer">${esc(helpers.resultChip(r))}</button>`;
      return;
    }
    el.className = "altar-result";
    el.innerHTML = `
      <div class="altar-result__head">
        <p class="altar-result__eyebrow">${esc(r.eyebrow)}</p>
        <button type="button" class="altar-result__icon" data-result="fold" aria-label="Fold the answer to a chip">–</button>
        <button type="button" class="altar-result__icon" data-result="close" aria-label="Put the answer away">×</button>
      </div>
      <p class="altar-result__answer">${esc(r.answer)}</p>
      ${r.detail ? `<p class="altar-result__detail">${esc(r.detail)}</p>` : ""}
      <p class="altar-result__links">
        ${helpers.canKeepNotes(r) ? `<button type="button" class="altar-result__link" data-result="notes">${r.notes ? "Your notes" : "Add notes"}</button>` : ""}
        ${r.readingId ? `<a class="altar-result__link" href="${esc(`/divination/reading/?id=${encodeURIComponent(r.readingId)}`)}">Open reading ›</a>` : ""}
      </p>
      ${said ? `<p class="altar-result__detail">${esc(said)}</p>` : ""}`;
  }

  async function keepNotes(notes) {
    const r = current;
    const helpers = R();
    if (!r) return;
    if (r.candle) {
      if (!candleEl?.isConnected) throw new Error("The candle is no longer on the altar.");
      B().update(candleEl, (o) => helpers.withCandleNotes(o, r.candle.readingId, notes, nowIso()));
    } else if (r.readingId) {
      const entry = await readingEntry(r.readingId);
      if (!entry) throw new Error("The reading is no longer in your log.");
      await global.SaltCraft.update(READINGS, entry.id, helpers.withNotes(entry.data, notes));
    } else if (r.drawn?.length) {
      const entry = await global.SaltCraft.add(READINGS, helpers.readingForResult(r, notes, new Date()));
      if (r === current && entry?.id) current = { ...r, readingId: entry.id };
    }
    if (r === current || current?.at === r.at) current = { ...current, notes: notes.trim() };
  }

  async function openNotes() {
    const r = current;
    if (!r) return;
    let notes = r.notes || "";
    if (r.readingId) {
      const entry = await readingEntry(r.readingId);
      if (entry) notes = String(entry.data?.interpretation ?? notes);
    }
    B().openSheet({
      eyebrow: r.eyebrow,
      title: r.answer,
      label: "your notes",
      html: `${r.question ? `<p class="app-caption">You asked: ${esc(r.question)}</p>` : ""}
        <label class="app-field"><span class="app-label">What you make of it</span><textarea data-notes maxlength="4000" placeholder="What you make of it, what it brought to mind">${esc(notes)}</textarea></label>
        <p class="app-caption">${esc(r.candle ? "Kept with the candle’s reading, in its story." : R().RESULT_HELP)}</p>
        <button type="button" class="app-button" data-keep>Keep my notes</button>`,
      onMount(body, dialog, close) {
        body.querySelector("[data-keep]")?.addEventListener("click", async (event) => {
          const b = event.currentTarget;
          b.disabled = true;
          b.textContent = "Keeping…";
          try {
            await keepNotes(body.querySelector("[data-notes]")?.value || "");
            said = "Notes kept with the reading.";
            close();
          } catch {
            said = "Your notes couldn’t be kept just now. Please try again.";
            b.disabled = false;
            b.textContent = "Keep my notes";
          }
          render();
        });
      }
    });
  }

  function onClick(event) {
    const action = event.target.closest("[data-result]")?.dataset.result;
    if (!action) return;
    if (action === "close") { current = null; candleEl = null; }
    else if (action === "fold") folded = true;
    else if (action === "open") folded = false;
    else if (action === "notes") return void openNotes();
    render();
  }

  function show(result, options = {}) {
    if (!result) return;
    current = result;
    candleEl = options.candleEl || null;
    folded = false;
    said = "";
    render();
  }

  // ── A card someone else lays on the coven altar ─────────────────────
  let seen = null;
  async function watchLaid() {
    const helpers = R();
    const objects = B()?.objects?.() || [];
    const list = objects.map((el) => B().toSaved(el)).filter(Boolean);
    const ids = list.map((o) => String(o.altarObjectId || "")).filter(Boolean);
    const coven = !!global.CovenAltarPage?.altarId;
    // The altar as it loads is what was already there: only what comes after is new.
    if (!helpers || !coven || !seen || !seen.size) { seen = new Set(ids); return; }
    const fresh = helpers.newlyLaid(list, seen, new Set());
    ids.forEach((id) => seen.add(id));
    if (!fresh.length) return;
    let mine = [];
    try { mine = (await global.SaltCraft?.list?.(READINGS)) || []; } catch { mine = []; }
    const theirs = helpers.newlyLaid(fresh, new Set(), new Set(mine.map((e) => e.id)));
    const last = theirs[theirs.length - 1];
    if (!last) return;
    const drawn = global.SaltCore.altar.practice.drawnOf(last);
    const name = drawn.replace(/, reversed$/, "");
    let keywords = null;
    try {
      await B().loadScript("../js/core/divination.js");
      keywords = global.SaltCore?.divination?.draw?.meaningOf({ name, reversed: drawn !== name })?.meaning?.keywords ?? null;
    } catch { keywords = null; }
    show(helpers.laidResult(last, keywords, nowIso()));
  }

  function start() {
    ["app-altar:changed", "altar:current-changed"].forEach((name) => document.addEventListener(name, () => {
      if (name === "altar:current-changed") { seen = null; current = null; render(); }
      void watchLaid();
    }));
    void watchLaid();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  global.AltarResult = { show, clear: () => { current = null; render(); } };
})(window);
