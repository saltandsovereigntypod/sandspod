/* The altar bell, as the app's (app/src/lib/altar/bell.ts, useAltarBell.ts):
   a bell placed on the altar offers "Ring the bell" (one chime and a ripple
   from it) and "Ring to cleanse the space" (three chimes 1.6 s apart, then
   "The space is cleared."), which marks your own Cleansing thing on To tend
   done today, "Sound / bells". On a coven altar everyone there hears it
   (coven-altar.js, the "bell" broadcast), each person at most once every
   1.5 s. The chime follows Candle sounds in Accessibility; with it off, the
   ripple plays alone and says so once. The sound is synthesised
   (assets/sounds/bell-chime.mp3), nothing recorded. */
(function initializeAltarBell(global) {
  "use strict";

  const SRC = "../assets/sounds/bell-chime.mp3";
  const bell = () => global.SaltCore?.altar?.bell || null;
  const prefs = () => global.SaltAccessibility?.getState?.() || { candleSounds: true, haptics: true };
  const rung = new Map();
  const players = [];
  let next = 0;
  let told = false;

  function chime() {
    try {
      const i = next++ % 3;
      if (!players[i]) players[i] = new Audio(SRC);
      const p = players[i];
      p.volume = 0.8;
      p.currentTime = 0;
      p.play()?.catch?.(() => {});
    } catch (_) {
      // A bell that can't sound is simply not heard.
    }
  }

  const toast = (line) => { if (typeof global.showAltarToast === "function") global.showAltarToast(line); };
  const findByKey = (key) => (key ? Array.from(document.querySelectorAll("[data-altar-object-id]")).find((o) => o.dataset.altarObjectId === key) || null : null);

  function sound(kind, object) {
    const B = bell();
    const times = kind === "cleanse" ? B?.CLEANSE_RINGS || 3 : 1;
    const gap = B?.CLEANSE_GAP_MS || 1600;
    const { candleSounds, haptics } = prefs();
    for (let i = 0; i < times; i++) {
      global.setTimeout(() => {
        if (candleSounds) chime();
        if (haptics && typeof navigator.vibrate === "function") { try { navigator.vibrate(12); } catch (_) {} }
        if (object?.isConnected) global.LivingArt?.playMoment?.(object, "sound");
      }, i * gap);
    }
  }

  async function markCleansing() {
    const B = bell();
    if (!B || !global.SaltCraft) return null;
    try {
      const found = B.cleanseFromEntries((await global.SaltCraft.list("tend.rhythms")) || [], new Date());
      if (!found) return null;
      await global.SaltCraft.update("tend.rhythms", found.id, found.record);
      return found.title;
    } catch (_) {
      return null;
    }
  }

  function ring(object, kind) {
    const B = bell();
    if (!B) return;
    const me = global.CovenAltarPage?.me?.() || "me";
    if (!B.ringAllowed(rung, me, Date.now())) return;
    sound(kind, object);
    global.CovenAltarPage?.ringBell?.(kind, object.dataset.altarObjectId || "");
    if (!prefs().candleSounds && !told) {
      told = true;
      toast(B.SOUND_OFF_LINE);
    }
    if (kind !== "cleanse") return;
    const wait = new Promise((resolve) => global.setTimeout(resolve, (B.CLEANSE_RINGS - 1) * B.CLEANSE_GAP_MS + 800));
    Promise.all([markCleansing(), wait]).then(([marked]) => toast(B.cleansedLine(marked)));
  }

  // The others at a coven altar ringing.
  global.CovenAltarPage?.onBell?.((r) => {
    const B = bell();
    if (B && B.ringAllowed(rung, r.from, Date.now())) sound(r.kind, findByKey(r.key));
  });

  const registry = global.altarObjectActionRegistry;
  if (!Array.isArray(registry)) return;
  const isBell = (o) => o?.dataset.type === "tool" && o.dataset.tool === "bell";
  registry.push(
    { id: "ring-bell", label: "Ring the bell", icon: "◎", priority: 11, types: ["tool"], available: isBell, handler: (o) => ring(o, "ring") },
    { id: "ring-cleanse", label: "Ring to cleanse the space", icon: "◌", priority: 12, types: ["tool"], available: isBell, handler: (o) => ring(o, "cleanse") }
  );
})(window);
