/* =========================================================
   CRYSTAL WEAR
   The app's crystal wear (components/altar/CrystalWear.tsx): stones dull,
   cloud and may crack with use, faster in protective work, and cleansing
   clears most of it; "Something came at me" (the Tend tools, a protective
   spell's card, a stone on guard) logs it and the stones on guard take the
   brunt; a broken stone waits for you to choose what becomes of it. The
   setting is crystal_wear in your settings (Off, Gentle, Realistic), shared
   with the app. living-art.js draws the look, altar-living.js shows the
   card. Everything is the app's own logic (js/core/altar.js crystalCare).
   ========================================================= */

(function initializeCrystalWear(global) {
  "use strict";

  const B = () => global.AltarApp;
  const C = () => global.SaltCore?.altar?.crystalCare || null;
  const nowIso = () => new Date().toISOString();
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const say = (line) => (typeof global.showAltarToast === "function" ? global.showAltarToast(line) : B()?.notice?.(line));

  // The setting, kept from your settings (read once, then whenever settings change).
  let mode = "gentle";
  async function loadMode() {
    try {
      const settings = (await global.SaltSettings?.get?.()) || global.getLocalMySettings?.() || {};
      const next = C()?.wearModeOf(settings[C()?.WEAR_SETTING || "crystal_wear"]) || "gentle";
      if (next !== mode) { mode = next; global.LivingArt?.renderAll?.(); global.AltarLiving?.schedule?.(); }
    } catch { /* keep what we have */ }
  }

  /** What else on the altar puts a stone to work: the altar's intention and its spells. */
  function context() {
    const altarId = B()?.altarId?.() || "";
    const text = global.AltarReading?.state?.intention?.data?.text || "";
    const spells = (global.AltarLivingEntries?.spells || []).filter((e) => e.data?.altarId === altarId).map((e) => e.data);
    return { altarIntention: text ? { text } : null, spells };
  }

  function wearOf(saved, now = Date.now()) {
    const c = C();
    if (!c || saved?.type !== "crystal") return null;
    return c.wearOf(saved, mode, Math.floor(now / 60000) * 60000, context());
  }
  /** How it looks now (crystalCare wearLook), or null. */
  const look = (saved, now) => C()?.wearLook(wearOf(saved, now)) || null;

  function logAltar(text) {
    const id = B()?.altarId?.() || global.currentSavedAltarId || global.CovenAltarPage?.altarId || "";
    if (id) global.SaltCraft?.add?.("altar.history", { altarId: id, text, at: nowIso() })?.catch?.(() => {});
  }

  function cameAtMe() {
    const c = C();
    const ui = B();
    if (!c || !ui) return;
    const at = nowIso();
    const before = ui.doc().objects;
    const result = c.somethingCameAtMe(before, mode, at, context());
    if (result.hit.length) ui.applyObjects(before, result.objects);
    logAltar(result.hit.length ? result.line : "Something came at me.");
    const broken = result.objects.find((o) => result.broke.includes(String(o.altarObjectId || "")));
    say(broken ? `${result.line} ${c.breakLine(ui.shortLabel(broken.label, "stone"))}` : result.line);
    global.AltarLiving?.schedule?.();
  }

  function choose(choice) {
    const c = C();
    const ui = B();
    const el = ui?.selected?.();
    const option = c?.breakChoice(choice);
    if (!el || !option) return;
    const name = ui.shortLabel(el.dataset.label, "The stone");
    const at = nowIso();
    ui.update(el, (o) => c.chooseForBroken(o, choice, at));
    if (option.removes) ui.removeEl(el);
    const line = `${name} ${option.line}.`;
    logAltar(line);
    say(option.removes ? `${line} Thank you, ${name.toLowerCase()}.` : line);
    global.AltarLiving?.schedule?.();
  }

  const CAME_AT = { label: "Something came at me", symbol: "◈", action: "came-at-me", hint: "Something came at me: log it, and the stones doing protective work take the brunt" };

  /** The card in the object panel (altar-living.js): its wear, and a broken stone's choices. */
  function panelHtml(saved) {
    const c = C();
    const wear = wearOf(saved);
    if (!c || !wear) return "";
    const line = c.wearLine(wear);
    if (!line && !wear.guard) return "";
    const ui = B();
    const waiting = c.awaitingChoice(saved);
    const body = waiting
      ? `<p class="app-caption">${esc(c.breakLine(ui.shortLabel(saved.label, "stone")))} What would you like to do with it? Nothing is taken away until you choose.</p>${ui.chips(c.BREAK_CHOICES.map((b) => ({ label: b.label, action: "wear-choose", data: { choice: b.id } })))}`
      : line ? `<p class="app-caption">${esc(line)}</p>` : "";
    return `<div class="app-block${wear.stage !== "whole" && wear.stage !== "dull" ? " app-block--faded" : ""}">${line ? `<p class="app-living__eyebrow">${esc(c.STAGE_WORDS[wear.stage])}</p>` : ""}${body}${wear.guard && !wear.broken ? ui.chips([CAME_AT]) : ""}</div>`;
  }
  /** "Something came at me" on a protective spell's card. */
  const spellChip = (spell) => (C()?.PROTECTIVE.test(`${spell?.title || ""} ${spell?.intention || ""}`) ? B().chips([CAME_AT]) : "");

  /** The clouding and crack over a worn stone's picture (the app's WearMarks), in its box w × h. */
  function marksHtml(wearLook, width, height) {
    const c = C();
    if (!c || !wearLook || !(wearLook.haze > 0 || wearLook.crack > 0)) return "";
    // The picture sits inside the box's padding (geometry.ts IMAGE_INSET).
    const inset = global.SaltCore?.altar?.geometry?.IMAGE_INSET || { x: 0.075, y: 0.0125 };
    const x0 = width * inset.x;
    const y0 = width * inset.y;
    const w = width - x0 * 2;
    const h = height - y0 * 2;
    const haze = wearLook.haze > 0 ? `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w * 0.42}" ry="${h * 0.42}" fill="rgb(236,238,242)" opacity="${wearLook.haze}"/>` : "";
    const cracks = wearLook.crack > 0 ? c.crackPaths(w, h, wearLook.crack).map((d) => `<path d="${d}" stroke="rgba(30,26,34,0.75)" stroke-width="${Math.max(0.8, w * (wearLook.crack === 2 ? 0.03 : 0.015))}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join("") : "";
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true" style="position:absolute;inset:0;pointer-events:none"><g transform="translate(${x0} ${y0})">${haze}${cracks}</g></svg>`;
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-something-came-at]")) { event.preventDefault(); cameAtMe(); }
  });
  global.addEventListener?.("load", loadMode);
  global.addEventListener?.("focus", loadMode);
  loadMode();

  global.CrystalWear = {
    mode: () => mode,
    look,
    marksHtml,
    panelHtml,
    spellChip,
    cameAtMe,
    actions: {
      "came-at-me": () => cameAtMe(),
      "wear-choose": (button) => choose(button.dataset.choice),
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
