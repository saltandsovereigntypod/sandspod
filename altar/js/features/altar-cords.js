/* =========================================================
   ALTAR CORDS
   Cord cutting on the website, as the app does it (CordLayer.tsx,
   CordSheet.tsx, the candle's panel): a cord tied between two candles at a
   height down their wax, drawn over the stage; when either candle burns down
   to it, it catches, an ember travels along it, it parts and the two ends
   fall; then it's kept as cut. The cords are kept with the altar, beside its
   groups (`cords` in the saved altar, window.altarExtraFields), so the app
   and the website read each other's.

   Everything is the app's own logic (js/core/altar.js cord): the cords, when
   they catch and burn through, where they wrap their candles and how they're
   drawn. This draws it, keeps what happened, and offers the sheet to tie one
   and the panel section for a candle that has one.
   ========================================================= */

(function initializeAltarCords(global) {
  "use strict";

  const B = () => global.AltarApp;
  const C = () => global.SaltCore?.altar?.cord;
  const L = () => global.SaltCore?.altar?.livingState;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const nowIso = () => new Date().toISOString();
  const CHAR = "rgb(38,30,26)";
  const short = (label, fallback = "the candle") => global.SaltCore?.altar?.cabinet?.shortLabel?.(label, fallback) || String(label || fallback);
  const stillMotion = () => !!global.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const stage = () => document.querySelector("[data-altar-stage]");
  const doc = () => B()?.doc?.() || null;
  const cords = () => (C() && doc() ? C().cordsOf(doc()) : []);
  const labelOf = (id) => short(doc()?.objects.find((o) => o.altarObjectId === id)?.label);

  /** Keep a changed altar's cords (one undo step unless said otherwise). */
  function setCordsFrom(next, { undo = true } = {}) {
    if (!next) return;
    if (undo) global.pushAltarUndoSnapshot?.();
    const extra = { ...(global.altarExtraFields || {}) };
    if (next.extra?.cords) extra.cords = next.extra.cords;
    else delete extra.cords;
    global.altarExtraFields = extra;
    global.saveWorkingAltarDraft?.();
    document.dispatchEvent(new CustomEvent("altar:cords-changed"));
  }

  // ── Drawing ────────────────────────────────────────────────────────────
  let layer = null;
  function ensureLayer() {
    const root = stage();
    if (!root) return null;
    if (layer && root.contains(layer)) return layer;
    layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    layer.setAttribute("class", "altar-cords");
    layer.setAttribute("aria-hidden", "true");
    layer.dataset.altarCords = "";
    root.appendChild(layer);
    return layer;
  }

  function draw() {
    const core = C();
    const el = ensureLayer();
    const root = stage();
    if (!core || !el || !root) return false;
    const d = doc();
    const list = d ? core.cordsOf(d) : [];
    const width = root.clientWidth;
    const height = root.clientHeight;
    el.setAttribute("viewBox", `0 0 ${width} ${height}`);
    el.setAttribute("width", String(width));
    el.setAttribute("height", String(height));
    const now = Date.now();
    let moving = false;
    const still = stillMotion();
    const parts = [`<defs><radialGradient id="cord-ember" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgb(255,244,200)"/><stop offset="0.35" stop-color="rgb(255,170,60)" stop-opacity="0.95"/><stop offset="1" stop-color="rgb(255,110,30)" stop-opacity="0"/></radialGradient></defs>`];
    for (const cord of list) {
      const ends = core.cordEnds(d, cord, width);
      if (!ends) continue;
      const state = core.cordState(d, cord, now);
      if (core.cordMoving(state, now)) moving = true;
      const art = core.cordArt(ends, state, now, width, still);
      const color = core.cordColor(cord.color);
      const path = (p, stroke, w) => (p ? `<path d="${p}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" fill="none"/>` : "");
      parts.push(`<g data-cord="${esc(cord.id)}" data-cord-status="${state.status}">`);
      art.wraps.forEach((w) => parts.push(path(w.d, color.shade, art.width + 1.2)));
      art.wraps.forEach((w) => parts.push(path(w.d, w.charred ? CHAR : color.stroke, art.width)));
      parts.push(path(art.span, color.shade, art.width + 1.2), path(art.span, color.stroke, art.width), path(art.charred, CHAR, art.width * 0.8));
      art.pieces.forEach((p) => parts.push(path(p, color.shade, art.width + 1.2)));
      art.pieces.forEach((p) => parts.push(path(p, color.stroke, art.width)));
      art.tips.forEach((t) => parts.push(`<circle cx="${t.x}" cy="${t.y}" r="${art.width * 0.75}" fill="${CHAR}"/>`));
      if (art.ember) {
        parts.push(`<circle cx="${art.ember.x}" cy="${art.ember.y}" r="${art.ember.r * 3.2}" fill="url(#cord-ember)" opacity="0.75"/><circle cx="${art.ember.x}" cy="${art.ember.y}" r="${art.ember.r * 0.7}" fill="rgb(255,236,170)"/>`);
      }
      art.smoke.forEach((m) => parts.push(`<circle cx="${m.x}" cy="${m.y}" r="${m.r}" fill="rgb(206,206,200)" opacity="${m.opacity}"/>`));
      parts.push("</g>");
    }
    el.innerHTML = parts.join("");
    el.hidden = !list.length;
    return moving;
  }

  let frame = 0;
  function redraw() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      draw();
    });
  }

  // ── Keeping what happens: a cord catches, burns through ─────────────────
  function settle() {
    const core = C();
    const d = doc();
    if (!core || !d) return;
    const before = new Map(core.cordsOf(d).map((c) => [c.id, c.status]));
    const next = core.settleCords(d, nowIso());
    if (next !== d) {
      setCordsFrom(next, { undo: false });
      const changed = core.cordsOf(next).filter((c) => before.get(c.id) !== c.status);
      if (changed.some((c) => c.status === "cut")) B()?.notice("The cord has burned through and fallen apart. Select one of its candles to write it in your Grimoire.");
      else if (changed.some((c) => c.status === "burning")) B()?.notice("The flame has reached the cord. It’s catching.");
      global.AltarLiving?.schedule?.();
    }
  }

  function tick() {
    if (!document.hidden && cords().length) {
      settle();
      const moving = draw();
      setTimeout(tick, moving ? 90 : 1000);
      return;
    }
    setTimeout(tick, 1500);
  }

  // ── The sheet: tie a cord, or set out a pair ──────────────────────────
  function openSheet(first = "") {
    const core = C();
    if (!core || !B()) return;
    const free = core.freeCandles(doc()).map((o) => ({ id: String(o.altarObjectId), label: short(o.label, "Candle") }));
    let picked = first && free.some((c) => c.id === first) ? [first] : [];
    let height = core.DEFAULT_CORD_HEIGHT;
    let color = "red";
    const chips = (list) => B().chips(list);
    const libraryHref = global.SaltEnvironment?.resolvePath?.("/library/entry/?entity=traditional:tool:cord") || "/library/entry/?entity=traditional:tool:cord";
    const html = () => `
      <p>Two candles, one for you and one for what you’re letting go of: a person, a habit, a hold something has on you. A cord tied between them burns through when the candles burn down to it. Light them when you’re ready; the altar keeps count while they burn.</p>
      <p class="app-caption">With real candles, stay with them while they burn and keep the cord away from anything that could catch. Snuff them if you need to step away; the cord waits.</p>
      <p class="app-caption"><a href="${esc(libraryHref)}">About cords, in the Living Library</a></p>
      <p class="app-label">How far down</p>
      ${chips(core.CORD_HEIGHTS.map((h) => ({ label: h.label, action: "height", pressed: h.value === height, data: { value: h.value } })))}
      <p class="app-caption">Higher burns through sooner; lower asks for longer.</p>
      <p class="app-label">The cord</p>
      ${chips(core.CORD_COLORS.map((c) => ({ label: c.label, action: "color", pressed: c.id === color, data: { id: c.id } })))}
      <label class="app-field"><span>What it stands for (if you like)</span><input data-cord-intention maxlength="160" placeholder="An old tie, a promise that’s run its course…"></label>
      <p class="app-label">Candles on this altar</p>
      ${free.length >= 2
        ? `${chips(free.map((c) => ({ label: c.label, symbol: picked.includes(c.id) ? "✓" : "○", action: "candle", pressed: picked.includes(c.id), data: { id: c.id } })))}
           <button type="button" class="app-button" data-app-action="tie"${picked.length < 2 ? " disabled" : ""}>${picked.length < 2 ? "Choose two candles" : "Tie the cord between them"}</button>`
        : `<p class="app-caption">${free.length === 1 ? "There’s one candle free on this altar; a cord needs two." : "There are no free candles on this altar yet."} Set out a pair below, or place candles from the cabinet first.</p>`}
      <p class="app-label">Or a fresh pair</p>
      <p class="app-caption">Two chime candles, white and black, side by side with the cord tied between them. A chime burns about two hours.</p>
      <button type="button" class="app-button app-button--outline" data-app-action="pair">Set out a pair with a cord</button>`;
    B().openSheet({
      eyebrow: "Cord cutting",
      title: "Tie a cord between two candles",
      html: html(),
      onMount(body, dialog, close) {
        let intention = "";
        const rerender = () => {
          body.innerHTML = html();
          body.querySelector("[data-cord-intention]").value = intention;
        };
        body.addEventListener("input", (event) => {
          if (event.target.matches("[data-cord-intention]")) intention = event.target.value;
        });
        body.addEventListener("click", (event) => {
          const button = event.target.closest("[data-app-action]");
          if (!button) return;
          const action = button.dataset.appAction;
          const choice = { height, color, intention };
          if (action === "height") { height = Number(button.dataset.value); rerender(); }
          else if (action === "color") { color = button.dataset.id; rerender(); }
          else if (action === "candle") {
            const id = button.dataset.id;
            picked = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id].slice(-2);
            rerender();
          } else if (action === "tie" && picked.length === 2) {
            setCordsFrom(core.tieCord(doc(), picked[0], picked[1], choice, nowIso()));
            close();
            B().notice(`The cord is tied ${core.heightWords(height)} between ${labelOf(picked[0])} and ${labelOf(picked[1])}. Light them when you’re ready; it burns when they reach it.`);
          } else if (action === "pair") {
            const before = doc();
            const root = stage();
            const after = core.setOutCordPair(before, { cx: 0.5, cy: 0.6 }, choice, nowIso());
            if (after === before || !root) return;
            global.pushAltarUndoSnapshot?.();
            after.objects.slice(before.objects.length).forEach((object) => B().addSaved(object, { undo: false, select: false }));
            setCordsFrom(after, { undo: false });
            close();
            B().notice("Two chime candles are set out with the cord tied between them. Light them when you’re ready.");
          }
        });
      }
    });
  }

  // ── The candle's panel ────────────────────────────────────────────────
  function panelHtml(saved) {
    const core = C();
    if (!core || !L()?.isCandle(saved)) return "";
    const d = doc();
    const id = String(saved.altarObjectId || "");
    const cord = core.cordOfCandle(d, id);
    const chips = B().chips;
    if (!cord) {
      if (core.freeCandles(d).length < 2 || L().candleLife(saved).spent) return "";
      return chips([{ label: "Tie a cord to another candle", symbol: "➰", action: "cord-tie", hint: "Cord cutting: tie a cord between this candle and another" }]);
    }
    const minute = Math.floor(Date.now() / 60000) * 60000;
    const status = core.cordState(d, cord, minute).status;
    const line = core.cordLine(d, cord, labelOf, minute);
    return `<div class="app-block"><p class="app-living__eyebrow">${esc(`Cord cutting · ${status}`)}</p><p class="app-caption">${esc(line)}</p>
      ${cord.intention ? `<p class="app-living__glance">${esc(cord.intention)}</p>` : ""}
      ${status === "tied" ? chips(core.CORD_HEIGHTS.map((h) => ({ label: h.label, action: "cord-height", pressed: Math.abs(cord.height - h.value) < 0.01, data: { value: h.value }, hint: `Tie the cord ${h.label.toLowerCase()}` }))) : ""}
      ${chips([
        status === "cut" ? { label: cord.recordedAt ? "Write it again in Grimoire" : "Record in Grimoire", symbol: "❧", action: "cord-record" } : null,
        status !== "burning" ? { label: status === "cut" ? "Clear the cord away" : "Untie the cord", symbol: "⌫", action: "cord-untie" } : null
      ])}</div>`;
  }

  const selectedId = () => String(B()?.selected?.()?.dataset?.altarObjectId || "");
  const actions = {
    "cord-tie": () => openSheet(selectedId()),
    "cord-height": (button) => {
      const cord = C()?.cordOfCandle(doc(), selectedId());
      if (cord) setCordsFrom(C().updateCord(doc(), cord.id, { height: Number(button.dataset.value) }));
      global.AltarLiving?.schedule?.();
    },
    "cord-untie": () => {
      const cord = C()?.cordOfCandle(doc(), selectedId());
      if (!cord) return;
      setCordsFrom(C().untieCord(doc(), cord.id));
      B().notice(cord.status === "cut" ? "The burned cord is cleared away." : "The cord is untied.");
      global.AltarLiving?.schedule?.();
    },
    "cord-record": () => {
      const cord = C()?.cordOfCandle(doc(), selectedId());
      if (cord) void record(cord);
    }
  };

  /** Write a cut cord into the Grimoire: its two candles as a working, the website's record path (groups.js). */
  async function record(cord) {
    const els = B().objects().filter((o) => o.dataset.altarObjectId === cord.a || o.dataset.altarObjectId === cord.b);
    if (!els.length) return;
    setCordsFrom(C().updateCord(doc(), cord.id, { recordedAt: nowIso() }), { undo: false });
    const cut = cord.cutAt ? new Date(cord.cutAt) : new Date();
    const handoff = {
      id: cord.id,
      name: "Cord cutting",
      createdAt: nowIso(),
      items: els.map(global.altarObjectToRitualItem),
      record: typeof global.altarRecordFor === "function" ? await global.altarRecordFor(els, true) : [],
      details: {
        kind: "Spell",
        intention: cord.intention || "",
        extraItems: `A ${cord.color === "natural" ? "twine" : cord.color} cord, tied ${C().heightWords(cord.height)} between the candles`,
        steps: [`Tied a cord between ${labelOf(cord.a)} and ${labelOf(cord.b)}.`, "Lit the candles and let them burn down to it.", `The flame of ${labelOf(cord.caughtOn || cord.a)} reached the cord and it burned through, ${cut.toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" })}.`].join("\n")
      }
    };
    localStorage.setItem("saltAndSovereigntyAltarToGrimoire", JSON.stringify(handoff));
    global.location.href = "../grimoire/index.html?import=altar";
  }

  function start() {
    ensureLayer();
    ["app-altar:changed", "altar:cords-changed", "altar:objects-moved", "altar:current-changed"].forEach((name) => document.addEventListener(name, redraw));
    global.addEventListener("resize", redraw);
    redraw();
    setTimeout(tick, 1200);
  }

  global.AltarCords = { openSheet, panelHtml, actions, draw, settle };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})(typeof window !== "undefined" ? window : globalThis);
