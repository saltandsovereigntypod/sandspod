/* =========================================================
   A SHRINE FOR A DEITY
   "Set a shrine" on a deity's Living Library page links here
   with ?shrine=<deity key>. As in the app (altar/[altarId].tsx,
   altarId "shrine"), the stage is set with a starter shrine
   built from their Living Library entry by the app's own
   shrineAltar (js/core/altar.js): their statue, candles in
   their colours, their plants and stones, incense and an
   offering bowl. Nothing is saved until you Save.
   ========================================================= */

(function initializeDeityShrine(global) {
  "use strict";

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
  global.addEventListener("load", () => global.setTimeout(setShrine, 50), { once: true });
})(window);
