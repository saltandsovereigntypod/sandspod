(function initializeSaltAppHandoff(global) {
  "use strict";

  // My Sanctuary on phones opens the Salt & Sovereignty app, which shares the same
  // accounts. The website's own sanctuary stays in place for computers, for anyone
  // who chooses it, and for guests whose work lives only in this browser.
  const APP_URL = "https://app.saltandsovereignty.com/";
  const CLASSIC_KEY = "saltAndSovereigntyUseWebsiteSanctuary";

  // Guest work the app cannot see, because it is stored under the website's address.
  const GUEST_WORK_KEYS = Object.freeze([
    "saltAndSovereigntySavedAltars",
    "saltAndSovereigntyWorkingAltarDraft",
    "saltAndSovereigntyLibrary",
    "saltAndSovereigntyApothecaryItems",
    "saltAndSovereigntyUserRituals",
    "saltAndSovereigntyRitualLifecycle:guest",
    "saltAndSovereigntyCustomCabinetItems"
  ]);

  function read(storage, key) {
    try {
      return storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  function holdsWork(raw) {
    if (raw == null) return false;
    const text = String(raw).trim();
    if (!text || text === "null" || text === "[]" || text === "{}") return false;
    try {
      const value = JSON.parse(text);
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === "object") {
        return Object.values(value).some((entry) => (Array.isArray(entry) ? entry.length > 0 : entry != null && entry !== ""));
      }
      return Boolean(value);
    } catch {
      return true;
    }
  }

  function hasGuestWork(storage) {
    return GUEST_WORK_KEYS.some((key) => holdsWork(read(storage, key)));
  }

  function prefersWebsite(storage) {
    return read(storage, CLASSIC_KEY) === "true";
  }

  function setPrefersWebsite(storage, value) {
    try {
      if (value) storage?.setItem(CLASSIC_KEY, "true");
      else storage?.removeItem(CLASSIC_KEY);
    } catch {
      // Storage can be blocked; the choice just won't be remembered.
    }
  }

  function isPhone(win) {
    try {
      return Boolean(win?.matchMedia?.("(max-width: 820px)").matches && win.matchMedia("(pointer: coarse)").matches);
    } catch {
      return false;
    }
  }

  function isLocalHost(win) {
    const host = String(win?.location?.hostname || "").toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  }

  /**
   * Whether opening My Sanctuary should go to the app. A signed-in visitor's work is
   * in their account, so it follows them; a guest with work saved here stays, so
   * nothing is left behind.
   */
  function shouldOpenApp({ win, storage, signedIn }) {
    if (!isPhone(win) || isLocalHost(win) || prefersWebsite(storage)) return false;
    return Boolean(signedIn) || !hasGuestWork(storage);
  }

  const api = Object.freeze({ APP_URL, CLASSIC_KEY, GUEST_WORK_KEYS, hasGuestWork, prefersWebsite, setPrefersWebsite, isPhone, shouldOpenApp });
  global.SaltAppHandoff = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
