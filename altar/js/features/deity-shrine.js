/* =========================================================
   A SHRINE FOR A DEITY
   "Set a shrine" on a deity's Living Library page links here
   with ?shrine=<deity key>. As in the app (altar/[altarId].tsx,
   altarId "shrine"), the stage is set with a starter shrine
   built from their Living Library entry by the app's own
   shrineAltar (js/core/altar.js): their statue, candles in
   their colours, their plants and stones, incense and an
   offering bowl. Nothing is saved until you Save.

   Cycle & Moon's moon-time altar comes the same way, with
   ?moontime=1 (the app's altarId "moon-time"): a moon bowl,
   red candles and a red cord, moonstone and red jasper,
   mugwort and rose (moonTimeAltar in js/core/altar.js).
   ========================================================= */

(function initializeDeityShrine(global) {
  "use strict";

  function setMoonTime() {
    const url = new URL(global.location.href);
    if (url.searchParams.get("moontime") !== "1") return;
    url.searchParams.delete("moontime");
    global.history.replaceState(global.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    const app = global.AltarApp;
    const tonight = global.SaltCore?.altar?.tonight;
    if (!app?.setDocument || !tonight?.moonTimeAltar) return;
    app.setDocument(tonight.moonTimeAltar(new Date()).doc, "Moon-Time Altar");
    app.notice?.("A moon-time altar: a moon bowl, red candles and a red cord, moonstone and red jasper, mugwort and rose. Move, swap or add anything, then Save to keep it.");
  }

  function setShrine() {
    const url = new URL(global.location.href);
    const key = String(url.searchParams.get("shrine") || "").trim().toLowerCase();
    if (!key) return;
    url.searchParams.delete("shrine");
    global.history.replaceState(global.history.state, "", `${url.pathname}${url.search}${url.hash}`);

    const app = global.AltarApp;
    const tonight = global.SaltCore?.altar?.tonight;
    /* global TraditionalLibrary */
    const library = typeof TraditionalLibrary !== "undefined" ? TraditionalLibrary : null;
    const record = library?.deity?.[key] || null;
    if (!app?.setDocument || !tonight?.shrineAltar || !/^[a-z0-9_-]+$/.test(key)) return;
    const name = String(record?.DisplayName || key);
    const shrine = tonight.shrineAltar(key, name, record, new Date());
    app.setDocument(shrine.doc, `${name}’s Shrine`);
    app.notice?.(`A shrine for ${name}, from their Living Library entry: their colours, plants and stones. Move, swap or add anything, then Save to keep it.`);
  }

  // After the working altar is restored on load, so the shrine is what's on the stage.
  global.addEventListener("load", () => global.setTimeout(() => (setShrine(), setMoonTime()), 50), { once: true });
})(window);
