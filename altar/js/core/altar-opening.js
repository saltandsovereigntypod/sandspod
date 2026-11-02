/* =========================================================
   OPENING YOUR ALTAR
   Loaded in the page's <head>, before anything is drawn, so the stage never
   shows the default empty altar while a signed-in person's own altar is on
   its way. Only the stage waits (html.is-altar-opening, altar.css): the rest
   of the page stays usable. storage.js calls AltarOpening.done() once the
   altar is set out, every object placed; after ~6 s it opens regardless.
   ========================================================= */

(function initializeAltarOpening(global) {
  "use strict";

  const TIMEOUT_MS = 6000;
  const root = document.documentElement;
  let timer = 0;
  let open = false;

  function read(key) {
    try { return global.localStorage.getItem(key) || ""; } catch { return ""; }
  }

  /** A Supabase session kept in this browser (sb-<project>-auth-token), without waiting on the network. */
  function hasCachedSession() {
    try {
      for (let i = 0; i < global.localStorage.length; i += 1) {
        const key = global.localStorage.key(i) || "";
        if (!/^sb-[\w-]+-auth-token$/.test(key)) continue;
        const value = JSON.parse(global.localStorage.getItem(key) || "null");
        const session = value?.currentSession || value;
        if (session?.access_token || session?.refresh_token) return true;
      }
    } catch { /* storage blocked: as if signed out */ }
    return false;
  }

  /** Opening somewhere else (a coven's altar, a shrine, tonight's altar, a named altar) is those scripts' own business. */
  function opensSomethingElse() {
    const params = new URLSearchParams(global.location.search);
    return ["covenAltar", "altarId", "tonight", "shrine"].some((name) => params.has(name));
  }

  function stage() {
    return document.querySelector("[data-altar-stage]");
  }

  function done() {
    if (!open) return;
    open = false;
    global.clearTimeout(timer);
    root.classList.remove("is-altar-opening");
    const el = stage();
    if (!el) return;
    el.removeAttribute("aria-busy");
    if (typeof el.animate === "function" && !global.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 320, easing: "ease-out" });
    }
  }

  if (!opensSomethingElse() && hasCachedSession()
    && (read("saltAndSovereigntyCurrentAltarId") || read("saltAndSovereigntyWorkingAltarDraft"))) {
    open = true;
    root.classList.add("is-altar-opening");
    document.addEventListener("DOMContentLoaded", () => { if (open) stage()?.setAttribute("aria-busy", "true"); }, { once: true });
    timer = global.setTimeout(done, TIMEOUT_MS);
  }

  global.AltarOpening = {
    /** True while the stage waits for your altar. */
    isWaiting: () => open,
    /** Is a Supabase session kept in this browser? (No network.) */
    hasCachedSession,
    done
  };
})(window);
