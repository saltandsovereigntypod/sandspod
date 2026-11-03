/* The altar bell, as the app's (app/src/lib/altar/bell.ts, useAltarBell.ts):
   a bell placed on the altar offers "Ring the bell" (one chime and a ripple
   from it) and "Ring to cleanse the space" (three chimes 1.6 s apart, then
   "The space is cleared."), which is kept in that altar's own History as
   "Space cleansed with the bell" (on a coven altar, under the coven altar's
   id, as the app keeps it); To tend is left alone. On a coven altar everyone
   there hears it (coven-altar.js, the "bell" broadcast), each person at most
   once every 1.5 s. The chime follows Candle sounds in Accessibility; with it
   off, the ripple plays alone and says so once. The sound is synthesised
   (assets/sounds/bell-chime.mp3), nothing recorded.

   Sound: browsers (Safari above all) only let sound start inside the tap
   itself, so the first ring opens one shared Web Audio context there and
   then, and all the chimes of a ring are scheduled on it at once. The chime
   is fetched and decoded once, starting as this script loads. Without Web
   Audio, plain <audio> players are used. Rings heard from the others at a
   coven altar sound only once this page's context is running. */
(function initializeAltarBell(global) {
  "use strict";

  const SRC = "../assets/sounds/bell-chime.mp3";
  const VOLUME = 0.8;
  const bell = () => global.SaltCore?.altar?.bell || null;
  const prefs = () => global.SaltAccessibility?.getState?.() || { candleSounds: true, haptics: true };
  const rung = new Map();
  let told = false;

  const Context = global.AudioContext || global.webkitAudioContext || null;
  let ctx = null;
  let buffer = null;
  let decoding = null;
  // The chime's bytes, fetched as the page loads; decoded once a context exists.
  const bytes = Context && typeof global.fetch === "function"
    ? global.fetch(SRC).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null)
    : Promise.resolve(null);

  function decode() {
    if (buffer || !ctx) return Promise.resolve(buffer);
    if (!decoding) {
      decoding = bytes
        .then((data) => (data ? new Promise((resolve, reject) => ctx.decodeAudioData(data.slice(0), resolve, reject)) : null))
        .then((decoded) => { buffer = decoded; return decoded; })
        .catch(() => { decoding = null; return null; });
    }
    return decoding;
  }

  /** Inside the tap: open (or wake) the shared context. */
  function unlock() {
    if (!Context) return null;
    try {
      if (!ctx) ctx = new Context();
      if (ctx.state === "suspended") ctx.resume()?.catch?.(() => {});
      void decode();
    } catch (_) {
      ctx = null;
    }
    return ctx;
  }

  /** Every chime of a ring, `gap` seconds apart, on the context. */
  function scheduleChimes(times, gap) {
    const play = (decoded) => {
      if (!decoded || !ctx) return;
      try {
        const start = ctx.currentTime + 0.02;
        for (let i = 0; i < times; i++) {
          const source = ctx.createBufferSource();
          const gain = ctx.createGain();
          gain.gain.value = VOLUME;
          source.buffer = decoded;
          source.connect(gain).connect(ctx.destination);
          source.start(start + i * gap);
        }
      } catch (_) {
        // A bell that can't sound is simply not heard.
      }
    };
    if (buffer) play(buffer);
    else decode().then(play);
  }

  // Without Web Audio: three <audio> players, so a chime rings on under the next.
  const players = [];
  let next = 0;
  function htmlChime() {
    try {
      const i = next++ % 3;
      if (!players[i]) players[i] = new Audio(SRC);
      const p = players[i];
      p.volume = VOLUME;
      p.currentTime = 0;
      p.play()?.catch?.(() => {});
    } catch (_) {
      // A bell that can't sound is simply not heard.
    }
  }

  const toast = (line) => { if (typeof global.showAltarToast === "function") global.showAltarToast(line); };
  const findByKey = (key) => (key ? Array.from(document.querySelectorAll("[data-altar-object-id]")).find((o) => o.dataset.altarObjectId === key) || null : null);

  /** `mine`: rung here, inside the tap; otherwise heard from someone else. */
  function sound(kind, object, mine) {
    const B = bell();
    const times = kind === "cleanse" ? B?.CLEANSE_RINGS || 3 : 1;
    const gap = B?.CLEANSE_GAP_MS || 1600;
    const { candleSounds, haptics } = prefs();
    let html = false;
    if (candleSounds) {
      const context = mine ? unlock() : ctx;
      if (context && (mine || context.state === "running")) scheduleChimes(times, gap / 1000);
      else html = mine; // no Web Audio here: plain players, from the tap
    }
    for (let i = 0; i < times; i++) {
      const at = () => {
        if (html) htmlChime();
        if (haptics && typeof navigator.vibrate === "function") { try { navigator.vibrate(12); } catch (_) {} }
        if (object?.isConnected) global.LivingArt?.playMoment?.(object, "sound");
      };
      if (i === 0) at();
      else global.setTimeout(at, i * gap);
    }
  }

  /** Keep a line in this altar's History (a coven altar's under its own id, as the app does). */
  function logAltar(text) {
    const id = global.AltarApp?.altarId?.() || global.currentSavedAltarId || global.CovenAltarPage?.altarId || "";
    if (id) global.SaltCraft?.add?.("altar.history", { altarId: id, text, at: new Date().toISOString() })?.catch?.(() => {});
  }

  function ring(object, kind) {
    const B = bell();
    if (!B) return;
    const me = global.CovenAltarPage?.me?.() || "me";
    if (!B.ringAllowed(rung, me, Date.now())) return;
    sound(kind, object, true);
    global.CovenAltarPage?.ringBell?.(kind, object.dataset.altarObjectId || "");
    if (!prefs().candleSounds && !told) {
      told = true;
      toast(B.SOUND_OFF_LINE);
    }
    if (kind !== "cleanse") return;
    logAltar(B.CLEANSED_HISTORY);
    global.setTimeout(() => toast(B.CLEANSED_LINE), (B.CLEANSE_RINGS - 1) * B.CLEANSE_GAP_MS + 800);
  }

  // The others at a coven altar ringing.
  global.CovenAltarPage?.onBell?.((r) => {
    const B = bell();
    if (B && B.ringAllowed(rung, r.from, Date.now())) sound(r.kind, findByKey(r.key), false);
  });

  /**
   * A meditation's bells at this altar ("Meditate here", altar-reading.js):
   * `times` chimes (or only a vibration, `vibrateOnly`), under Candle sounds
   * and Vibration. Call it once from a tap first (`unlockOnly`) so the browser
   * lets the later chimes sound.
   */
  function toll(times, { vibrateOnly = false, unlockOnly = false } = {}) {
    const { candleSounds, haptics } = prefs();
    const context = unlock();
    if (unlockOnly) return;
    const gap = 2.6;
    const html = !vibrateOnly && candleSounds && !(context && context.state === "running");
    if (!vibrateOnly && candleSounds && !html) scheduleChimes(times, gap);
    for (let i = 0; i < times; i++) {
      global.setTimeout(() => {
        if (html) htmlChime();
        if (haptics && typeof navigator.vibrate === "function") { try { navigator.vibrate(vibrateOnly ? 400 : 12); } catch (_) {} }
      }, i * gap * 1000);
    }
  }

  // A coven ritual step can ring it too (coven-altar.js).
  global.AltarBell = { ring, toll };

  const registry = global.altarObjectActionRegistry;
  if (!Array.isArray(registry)) return;
  const isBell = (o) => o?.dataset.type === "tool" && o.dataset.tool === "bell";
  registry.push(
    { id: "ring-bell", label: "Ring the bell", icon: "◎", priority: 11, types: ["tool"], available: isBell, handler: (o) => ring(o, "ring") },
    { id: "ring-cleanse", label: "Ring to cleanse the space", icon: "◌", priority: 12, types: ["tool"], available: isBell, handler: (o) => ring(o, "cleanse") }
  );
})(window);
