/* =========================================================
   ALTAR RITES
   The altar's working tools, as the app has them (components/altar/
   useToolRites.tsx, RitePanels.tsx, RiteLayer.tsx, lib/altar/useAltarRites.ts):

   - An athame or wand casts the circle: trace round the altar with it,
     sunwise, and a thin line of light in the colour you chose follows it;
     most of the way round (300°) it closes into a glowing ring, "Circle
     cast". Traced back anticlockwise it's released. "Cast it for me" draws it.
   - The quarters, East, South, West and North, lit at the altar's edges in
     their colours (yours if you change them), released in reverse; the
     circle panel says what's still open.
   - The singing bowl: struck once, or every 1 to 10 minutes until stopped,
     in one of eight tones.
   - The chalice: filled, raised in a toast, poured out as a libation (into
     an offering bowl when there is one) and drunk, its level in the cup.
   - The besom sweeps away the debris: ash, spent matches, burned cords.
   - Matches, a lighter or a snuffer brought near a candle or incense offer
     a small "Light candle" or "Snuff candle" button. Never by themselves.

   Everything is the app's own logic (js/core/altar.js circle, bowl and
   toolRites). The circle, quarters and debris are kept with the altar
   (window.altarExtraFields, as the cords are), so a coven altar shares them;
   its sounds and moments go to everyone there by the altar channel's "rite"
   broadcast (coven-altar.js). Everything done is kept in the altar's History.
   Sounds follow Candle sounds in Accessibility, and are synthesised
   (assets/sounds/bowl-*.mp3, lighter-click.mp3, match-strike.mp3).
   ========================================================= */

(function initializeAltarRites(global) {
  "use strict";

  const B = () => global.AltarApp;
  const K = () => global.SaltCore?.altar || null;
  const C = () => K()?.circle;
  const W = () => K()?.bowl;
  const T = () => K()?.toolRites;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const nowIso = () => new Date().toISOString();
  const prefs = () => global.SaltAccessibility?.getState?.() || { candleSounds: true, haptics: true };
  const stage = () => document.querySelector("[data-altar-stage]");
  const say = (line) => (typeof global.showAltarToast === "function" ? global.showAltarToast(line) : B()?.notice?.(line));
  const buzz = (ms = 12) => { if (prefs().haptics && typeof navigator.vibrate === "function") { try { navigator.vibrate(ms); } catch (_) {} } };
  const extra = () => ({ ...(global.altarExtraFields || {}) });
  const uidOf = (el) => el?.dataset?.altarObjectId || "";
  const findByKey = (key) => (key ? B()?.findById?.(key) || null : null);
  const nameOf = (o) => `the ${B()?.shortLabel?.(o?.label, "candle") || "candle"}`;

  /** Keep the altar's changed extra fields (the circle, quarters, debris, cords). */
  function setExtra(next, { undo = true } = {}) {
    if (!next) return;
    if (undo) global.pushAltarUndoSnapshot?.();
    global.altarExtraFields = next;
    global.saveWorkingAltarDraft?.();
    document.dispatchEvent(new CustomEvent("altar:rites-changed"));
    redraw();
  }

  /** Keep a line in this altar's History (a coven altar's under its own id, as the app does). */
  function logAltar(text) {
    const id = global.AltarApp?.altarId?.() || global.currentSavedAltarId || global.CovenAltarPage?.altarId || "";
    if (id) global.SaltCraft?.add?.("altar.history", { altarId: id, text, at: nowIso() })?.catch?.(() => {});
  }

  // ── Sound ────────────────────────────────────────────────────────────
  // As the bell (altar-bell.js): one Web Audio context opened inside a tap,
  // each sound fetched once and decoded on it; plain <audio> without it.
  const Context = global.AudioContext || global.webkitAudioContext || null;
  let ctx = null;
  const fetched = new Map();
  const decoded = new Map();
  const bytesOf = (src) => {
    if (!fetched.has(src)) fetched.set(src, typeof global.fetch === "function" ? global.fetch(src).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null) : Promise.resolve(null));
    return fetched.get(src);
  };
  function unlock() {
    if (!Context) return null;
    try {
      if (!ctx) ctx = new Context();
      if (ctx.state === "suspended") ctx.resume()?.catch?.(() => {});
    } catch (_) {
      ctx = null;
    }
    return ctx;
  }
  function bufferOf(src) {
    if (decoded.has(src)) return Promise.resolve(decoded.get(src));
    return bytesOf(src).then((data) => (data && ctx ? new Promise((resolve, reject) => ctx.decodeAudioData(data.slice(0), resolve, reject)) : null)).then((b) => { if (b) decoded.set(src, b); return b; }).catch(() => null);
  }
  /** `mine`: inside a tap here; otherwise heard from someone else (only once this page's sound is open). */
  function play(src, volume, mine) {
    if (!prefs().candleSounds) return;
    const c = mine ? unlock() : ctx;
    if (c && (mine || c.state === "running")) {
      bufferOf(src).then((buffer) => {
        if (!buffer || !ctx) return;
        try {
          const source = ctx.createBufferSource();
          const gain = ctx.createGain();
          gain.gain.value = volume;
          source.buffer = buffer;
          source.connect(gain).connect(ctx.destination);
          source.start(ctx.currentTime + 0.02);
        } catch (_) { /* not heard */ }
      });
    } else if (mine) {
      try { const a = new Audio(src); a.volume = volume; a.play()?.catch?.(() => {}); } catch (_) { /* not heard */ }
    }
  }
  const SOUND = {
    bowl: (tone) => `../assets/sounds/${W()?.bowlSoundFile?.(tone) || "bowl-heart.mp3"}`,
    match: "../assets/sounds/match-strike.mp3",
    lighter: "../assets/sounds/lighter-click.mp3"
  };
  const moment = (el, kind) => { if (el?.isConnected) global.LivingArt?.playMoment?.(el, kind); };
  const send = (wire) => global.CovenAltarPage?.sendRite?.(wire);

  // ── Drawing: the ring, the quarters, the debris, the trail ─────────────
  let layer = null;
  let trail = null; // { points: [{x,y}] in stage fractions, color }
  function ensureLayer() {
    const root = stage();
    if (!root) return null;
    if (layer && root.contains(layer)) return layer;
    layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    layer.setAttribute("class", "altar-rites");
    layer.setAttribute("aria-hidden", "true");
    root.appendChild(layer);
    return layer;
  }
  function draw() {
    const c = C();
    const t = T();
    const el = ensureLayer();
    const root = stage();
    if (!c || !t || !el || !root) return;
    const w = root.clientWidth;
    const h = root.clientHeight;
    const ex = extra();
    const circle = c.circleOf(ex);
    const quarters = c.quartersOf(ex);
    const debris = t.debrisOf(ex);
    const u = w / 600;
    el.setAttribute("viewBox", `0 0 ${w} ${h}`);
    el.setAttribute("width", String(w));
    el.setAttribute("height", String(h));
    const parts = [];
    for (const d of debris) {
      const x = d.x * w;
      const y = d.y * h;
      parts.push(d.kind === "match"
        ? `<line x1="${x - 9 * u}" y1="${y + 2 * u}" x2="${x + 9 * u}" y2="${y - 2 * u}" stroke="rgb(196,160,112)" stroke-width="${1.6 * u}" stroke-linecap="round"/><circle cx="${x - 9 * u}" cy="${y + 2 * u}" r="${2 * u}" fill="rgb(30,24,22)"/>`
        : `<g opacity="0.85"><circle cx="${x}" cy="${y}" r="${7 * u}" fill="rgb(90,86,82)" opacity="0.55"/><circle cx="${x + 3 * u}" cy="${y - 1.5 * u}" r="${4 * u}" fill="rgb(150,146,140)" opacity="0.6"/><circle cx="${x - 3.5 * u}" cy="${y + u}" r="${2.5 * u}" fill="rgb(40,36,34)" opacity="0.7"/></g>`);
    }
    if (circle) {
      const ring = (sw, op) => `<circle cx="${circle.cx * w}" cy="${circle.cy * h}" r="${circle.r * w}" stroke="${esc(circle.color)}" stroke-opacity="${op}" stroke-width="${sw}" fill="none"/>`;
      parts.push(`<g class="altar-rites__ring">${ring(14 * u, 0.18)}${ring(5 * u, 0.4)}${ring(1.4 * u, 0.95)}</g>`);
    }
    for (const id of quarters.open) {
      const spot = c.QUARTER_SPOT[id];
      const color = esc(c.quarterColor(quarters, id));
      parts.push(`<g><circle cx="${spot.x * w}" cy="${spot.y * h}" r="${16 * u}" fill="${color}" opacity="0.22"/><circle cx="${spot.x * w}" cy="${spot.y * h}" r="${9 * u}" fill="${color}" opacity="0.85"/><text x="${spot.x * w}" y="${spot.y * h + 3.6 * u}" font-size="${10 * u}" font-weight="700" fill="rgb(28,22,30)" text-anchor="middle">${esc(c.quarterOf(id).name[0])}</text></g>`);
    }
    if (trail && trail.points.length > 1) {
      const pts = trail.points.map((p) => `${p.x * w},${p.y * h}`).join(" ");
      parts.push(`<polyline points="${pts}" stroke="${esc(trail.color)}" stroke-opacity="0.3" stroke-width="${6 * u}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" stroke="${esc(trail.color)}" stroke-width="${1.6 * u}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    el.innerHTML = parts.join("");
    el.hidden = !parts.length;
    drawBar();
  }
  let frame = 0;
  function redraw() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      draw();
      near();
    });
  }

  // The circle panel's reminder, under the stage, while anything is open.
  let bar = null;
  function drawBar() {
    const root = stage();
    const line = C()?.circleReminder(extra());
    if (!root) return;
    if (!bar || !bar.isConnected) {
      bar = document.createElement("div");
      bar.className = "altar-rites-bar";
      bar.setAttribute("role", "status");
      root.insertAdjacentElement("afterend", bar);
      bar.addEventListener("click", (event) => { if (event.target.closest("[data-rites-panel]")) openCirclePanel(); });
    }
    bar.hidden = !line;
    if (line) bar.innerHTML = `<span>${esc(line)}</span> <button type="button" class="app-chip" data-rites-panel>The circle</button>`;
  }

  // ── Casting the circle ───────────────────────────────────────────────
  let color = "";
  const circleColor = () => color || C()?.DEFAULT_CIRCLE_COLOR || "#f0c96a";
  let tracing = null; // { releasing, el, from: { left, top }, points }
  let shield = null;

  function cast(ring, auto) {
    const c = C();
    setExtra(c.castCircle(extra(), ring, circleColor(), nowIso(), global.CovenAltarPage?.me?.() || undefined, auto));
    logAltar(c.castLine(circleColor()));
    say(`${c.CIRCLE_CAST_STATUS}.`);
    finish("circle");
  }
  function release() {
    const c = C();
    if (!c.circleOf(extra())) return;
    setExtra(c.releaseCircle(extra()));
    logAltar(c.RELEASED_LINE);
    say("The circle is released.");
    finish("release_circle");
  }

  function stopTrace() {
    if (tracing?.el) {
      tracing.el.style.left = tracing.from.left;
      tracing.el.style.top = tracing.from.top;
    }
    tracing = null;
    trail = null;
    shield?.remove();
    shield = null;
    redraw();
  }

  function startTrace(el, releasing) {
    const root = stage();
    if (!root || !el) return;
    stopTrace();
    tracing = { releasing, el, from: { left: el.style.left, top: el.style.top }, points: [] };
    shield = document.createElement("div");
    shield.className = "altar-rites-shield";
    shield.innerHTML = `<p>${releasing ? "Trace the ring back anticlockwise, all the way round." : "Trace round the altar, sunwise (clockwise), until the line meets where you began."}</p><button type="button" class="app-chip" data-rites-stop>Stop</button>`;
    root.appendChild(shield);
    shield.querySelector("[data-rites-stop]").addEventListener("click", stopTrace);
    const at = (event) => {
      const r = root.getBoundingClientRect();
      return { x: (event.clientX - r.left) / r.width, y: (event.clientY - r.top) / r.height, r };
    };
    shield.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      event.preventDefault();
      shield.setPointerCapture?.(event.pointerId);
      const p = at(event);
      tracing.points = [{ x: p.x, y: p.y }];
      trail = { points: tracing.points, color: C().circleOf(extra())?.color || circleColor() };
      redraw();
    });
    shield.addEventListener("pointermove", (event) => {
      if (!tracing?.points.length) return;
      const p = at(event);
      const last = tracing.points[tracing.points.length - 1];
      if (Math.hypot(last.x - p.x, ((last.y - p.y) * p.r.height) / p.r.width) < 0.004) return;
      tracing.points.push({ x: p.x, y: p.y });
      // The tool follows the finger, as if carried round the altar.
      tracing.el.style.left = `${p.x * p.r.width - tracing.el.offsetWidth / 2}px`;
      tracing.el.style.top = `${p.y * p.r.height - tracing.el.offsetHeight / 2}px`;
      redraw();
    });
    const up = () => {
      if (!tracing?.points.length) return;
      const c = C();
      const r = root.getBoundingClientRect();
      const k = r.height / r.width;
      const reading = c.readTrace(tracing.points.map((p) => ({ x: p.x, y: p.y * k })), c.MIN_RADIUS);
      const t = tracing;
      t.el.style.left = t.from.left;
      t.el.style.top = t.from.top;
      const done = reading.closes && reading.direction === (t.releasing ? "widdershins" : "deosil");
      if (!done) {
        say(c.traceHint(reading, t.releasing));
        t.points = [];
        trail = null;
        redraw();
        return;
      }
      stopTrace();
      if (t.releasing) release();
      else cast({ cx: reading.centre.x, cy: reading.centre.y / k, r: reading.radius }, false);
    };
    shield.addEventListener("pointerup", up);
    shield.addEventListener("pointercancel", up);
    say(releasing ? "Trace the ring back anticlockwise with the tool." : "Trace round the altar with the tool, sunwise.");
  }

  function openCast(el) {
    const c = C();
    const ui = B();
    ui.openSheet({
      eyebrow: "The circle",
      title: c.CAST_LABEL,
      label: "the circle",
      html: "",
      onMount(body, dialog, close) {
        const render = () => {
          body.innerHTML = `
            <p class="app-caption">Trace round the altar with the tool, sunwise (clockwise), and a thin line of light follows it. Most of the way round, it closes into a ring.</p>
            <p class="app-label">Colour of the light</p>
            ${ui.chips(c.CIRCLE_COLORS.map((x) => ({ label: x.label, symbol: "●", action: "color", data: { color: x.color }, pressed: circleColor() === x.color })))}
            <label class="app-field"><span class="app-label">Your own colour, as #hex</span><input type="text" data-own value="" autocomplete="off" spellcheck="false"></label>
            ${ui.chips([{ label: c.CAST_LABEL, action: "trace", primary: true }, { label: c.CAST_FOR_ME_LABEL, action: "auto" }])}`;
          body.querySelector("[data-own]").addEventListener("change", (event) => { color = c.cleanColor(event.target.value, circleColor()); render(); });
        };
        render();
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-app-action]");
          if (!b) return;
          const action = b.dataset.appAction;
          if (action === "color") { color = b.dataset.color; render(); return; }
          close();
          if (action === "trace") startTrace(el, false);
          if (action === "auto") cast(c.DEFAULT_RING, true);
        });
      }
    });
  }

  function openCirclePanel() {
    const c = C();
    const ui = B();
    ui.openSheet({
      eyebrow: "The circle",
      title: "The circle and the quarters",
      label: "the circle panel",
      onMount(body) {
        let tinting = null;
        const render = () => {
          const ex = extra();
          const state = c.quartersOf(ex);
          const next = c.nextToCall(state);
          const last = c.nextToRelease(state);
          const reminder = c.circleReminder(ex);
          body.innerHTML = `
            <p class="app-caption">${c.circleOf(ex) ? "The circle is cast." : "The circle isn’t cast."}</p>
            <div class="app-rows">${c.QUARTERS.map((q) => {
              const open = state.open.includes(q.id);
              return `<div class="altar-rites-quarter"><span class="altar-rites-swatch" style="background:${esc(c.quarterColor(state, q.id))};opacity:${open ? 1 : 0.35}"></span><span>${esc(q.name)} · ${esc(q.element)}${open ? " · open" : ""}</span>${ui.chips([
                open ? { label: "Release", action: "release", data: { q: q.id }, disabled: last !== q.id } : { label: "Call", action: "call", data: { q: q.id }, primary: next === q.id },
                { label: "Colour", action: "tint", data: { q: q.id }, hint: `Colour for the ${q.name}` }
              ])}</div>`;
            }).join("")}</div>
            ${tinting ? ui.chips([...c.QUARTERS.map((q) => q.color), ...c.CIRCLE_COLORS.map((x) => x.color)].map((x) => ({ label: x, symbol: "●", action: "color", data: { color: x }, pressed: c.quarterColor(state, tinting) === x })).concat([{ label: "Usual colour", action: "color", data: { color: "" } }])) : ""}
            <p class="app-caption">Called East, South, West, North, and released in reverse. The colours are the common modern ones; change them to your own.</p>
            ${reminder ? `<p class="app-caption"><strong>${esc(reminder)}</strong></p>` : ""}
            ${c.circleOf(ex) && !state.open.length ? ui.chips([{ label: c.RELEASE_LABEL, action: "uncircle" }]) : ""}`;
        };
        render();
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-app-action]");
          if (!b) return;
          const action = b.dataset.appAction;
          if (action === "call") callQuarter(b.dataset.q);
          else if (action === "release") releaseQuarter(b.dataset.q);
          else if (action === "tint") tinting = tinting === b.dataset.q ? null : b.dataset.q;
          else if (action === "color" && tinting) setExtra(c.setQuarterColor(extra(), tinting, b.dataset.color || null));
          else if (action === "uncircle") release();
          render();
        });
      }
    });
  }
  function callQuarter(id) {
    const c = C();
    const r = c.callQuarter(extra(), id);
    if (r.ok) {
      setExtra(r.extra);
      logAltar(r.line);
      if (!c.nextToCall(c.quartersOf(r.extra))) finish("quarters");
    }
    say(r.line);
  }
  function releaseQuarter(id) {
    const c = C();
    const r = c.releaseQuarter(extra(), id);
    if (r.ok) {
      setExtra(r.extra);
      logAltar(r.line);
      if (!c.quartersOf(r.extra).open.length) finish("release_quarters");
    }
    say(r.line);
  }

  // ── The singing bowl ─────────────────────────────────────────────────
  const struck = new Map();
  let ringing = null; // { tone, every, startedAt, el, timer }
  function soundBowl(tone, el, mine) {
    play(SOUND.bowl(tone), 0.85, mine);
    buzz();
    moment(el, "sound");
  }
  function strike(el) {
    const w = W();
    if (!w.STRIKE_GAP_MS || !K().bell.ringAllowed(struck, global.CovenAltarPage?.me?.() || "me", Date.now(), w.STRIKE_GAP_MS)) return;
    const tone = w.toneOf(B().toSaved(el));
    soundBowl(tone.id, el, true);
    send({ kind: "bowl", key: uidOf(el), tone: tone.id });
    if (!prefs().candleSounds) say(w.BOWL_SOUND_OFF);
    logAltar(w.strikeLine(tone));
    finish("bowl");
  }
  function stopRinging(quiet) {
    if (!ringing) return;
    clearTimeout(ringing.timer);
    ringing = null;
    if (!quiet) say("The bowl is still.");
  }
  function ringEvery(el, minutes) {
    const w = W();
    stopRinging(true);
    const tone = w.toneOf(B().toSaved(el));
    const every = w.clampEvery(minutes);
    soundBowl(tone.id, el, true);
    send({ kind: "bowl", key: uidOf(el), tone: tone.id });
    ringing = { tone: tone.id, every, startedAt: Date.now(), el, timer: 0 };
    const next = () => {
      if (!ringing) return;
      const now = Date.now();
      const at = w.nextStrikeAt(ringing.startedAt, ringing.every, now + 1);
      ringing.timer = global.setTimeout(() => {
        if (!ringing) return;
        soundBowl(ringing.tone, ringing.el, true);
        send({ kind: "bowl", key: uidOf(ringing.el), tone: ringing.tone });
        next();
      }, Math.max(250, at - now));
    };
    next();
    logAltar(w.everyLine(tone, every));
    say(`The bowl will ring every ${every} minute${every === 1 ? "" : "s"} until you stop it.`);
  }
  function openBowl(el) {
    const w = W();
    const ui = B();
    let every = ringing?.every || 3;
    ui.openSheet({
      eyebrow: "Singing bowl",
      title: "Strike or ring the bowl",
      label: "the singing bowl",
      onMount(body) {
        const render = () => {
          const tone = w.toneOf(ui.toSaved(el));
          body.innerHTML = `
            <p class="app-label">Tone: ${esc(w.toneLabel(tone))}</p>
            ${ui.chips(w.BOWL_TONES.map((t) => ({ label: t.id === "432" ? "432 Hz" : `${t.label} ${t.note}`, action: "tone", data: { tone: t.id }, pressed: t.id === tone.id })))}
            <p class="app-caption">Pairing the chakras with the notes C to B is a modern convention, one of several, and 432 Hz is a modern preference rather than an old tuning. Choose what sounds right to you.</p>
            ${ui.chips([{ label: w.STRIKE_LABEL, action: "strike", primary: true }])}
            ${ringing ? `<p class="app-caption">Ringing every ${ringing.every} minute${ringing.every === 1 ? "" : "s"}.</p>${ui.chips([{ label: w.STOP_LABEL, action: "stop" }])}` : `
              <p class="app-label">${esc(w.EVERY_LABEL)}</p>
              ${ui.chips([{ label: "Fewer", symbol: "−", action: "fewer", disabled: every <= w.EVERY_MIN }, { label: `Every ${every} minute${every === 1 ? "" : "s"}`, action: "every" }, { label: "More", symbol: "+", action: "more", disabled: every >= w.EVERY_MAX }])}`}`;
        };
        render();
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-app-action]");
          if (!b) return;
          const action = b.dataset.appAction;
          if (action === "tone") ui.update(el, (o) => ({ ...o, bowlTone: b.dataset.tone }));
          else if (action === "strike") strike(el);
          else if (action === "stop") stopRinging(false);
          else if (action === "fewer") every = Math.max(w.EVERY_MIN, every - 1);
          else if (action === "more") every = Math.min(w.EVERY_MAX, every + 1);
          else if (action === "every") ringEvery(el, every);
          render();
        });
      }
    });
  }

  // ── The chalice ──────────────────────────────────────────────────────
  function openChalice(el) {
    const t = T();
    const ui = B();
    ui.openSheet({
      eyebrow: "Chalice",
      title: "The chalice",
      label: "the chalice",
      onMount(body) {
        const render = () => {
          const o = ui.toSaved(el);
          const level = t.chaliceLevel(o);
          body.innerHTML = `
            <p class="app-caption">${level > 0 ? `The chalice holds ${esc(t.chaliceDrink(o))}, ${level >= 0.98 ? "full" : `about ${Math.round(level * 4)} parts in 4`}.` : "The chalice is empty."}</p>
            <p class="app-label">Fill it with</p>
            ${ui.chips(t.CHALICE_DRINKS.map((d) => ({ label: d.label, action: "fill", data: { drink: d.id } })))}
            ${ui.chips([{ label: "Raise it in a toast", action: "raise", primary: true, disabled: level <= 0 }, { label: "Pour a libation", action: "pour", disabled: level <= 0 }, { label: "Drink", action: "drink", disabled: level <= 0 }])}`;
        };
        render();
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-app-action]");
          if (!b) return;
          chalice(el, b.dataset.appAction, b.dataset.drink);
          render();
        });
      }
    });
  }
  function chalice(el, fn, drink) {
    const t = T();
    const ui = B();
    const at = nowIso();
    if (fn === "fill") {
      ui.update(el, (o) => t.fillChalice(o, drink, at));
      logAltar(`Filled the chalice with ${drink}.`);
      return say(`The chalice is filled with ${drink}.`);
    }
    if (fn === "raise") {
      ui.update(el, (o) => t.raiseChalice(o, at));
      moment(el, "moon");
      send({ kind: "toast", key: uidOf(el) });
      logAltar("Raised the chalice in a toast.");
      finish("toast");
      return say("The chalice is raised.");
    }
    if (fn === "drink") {
      ui.update(el, (o) => t.drinkChalice(o, at));
      logAltar("Drank from the chalice.");
      return say("The chalice is empty.");
    }
    const els = ui.objects();
    const objs = els.map(ui.toSaved);
    const i = els.indexOf(el);
    const b = t.libationBowlIndex(objs, i);
    const poured = t.pourLibation(objs[i], b >= 0 ? objs[b] : null, at);
    if (!poured) return say("The chalice is empty. Fill it first.");
    ui.update(el, () => poured.chalice);
    if (b >= 0 && poured.bowl) ui.update(els[b], () => poured.bowl, { undo: false });
    moment(b >= 0 ? els[b] : el, "moon");
    send({ kind: "pour", key: uidOf(b >= 0 ? els[b] : el) });
    logAltar(poured.line);
    say(poured.line);
    finish("libation");
  }

  // ── The besom ────────────────────────────────────────────────────────
  function canSweep() {
    const t = T();
    const d = B()?.doc?.();
    return !!(t && d && t.hasDebris(d.objects, d.extra, t.burnedCordSpots(d).length));
  }
  function sweep(el) {
    const t = T();
    const ui = B();
    const d = ui.doc();
    const r = t.sweepAlong(d.objects, d.extra, [], t.burnedCordSpots(d), true);
    const line = t.sweepLine(r);
    if (!line) return say("The altar is clean: nothing to sweep.");
    const at = nowIso();
    const next = t.applySweep(d, r, (o) => K().incense.clearAsh(o, at));
    if (next.objects !== d.objects) ui.applyObjects(d.objects, next.objects);
    setExtra(next.extra, { undo: next.objects === d.objects });
    document.dispatchEvent(new CustomEvent("altar:cords-changed"));
    moment(el, "salt");
    send({ kind: "sweep", key: uidOf(el) });
    logAltar(line);
    say(line);
    finish("sweep");
  }
  /** A burned petition's ash, left on the altar (altar-living.js). */
  function dropAsh(near) {
    const t = T();
    if (t) setExtra(t.dropDebris(extra(), "ash", near, nowIso()), { undo: false });
  }

  // ── Lighting and snuffing by hand ────────────────────────────────────
  let nearButton = null;
  function near() {
    const t = T();
    const ui = B();
    const root = stage();
    const el = ui?.selected?.();
    if (!t || !root) return;
    const saved = el && !tracing ? ui.toSaved(el) : null;
    const mode = saved && t.isSnuffer(saved) ? "snuff" : saved && t.isFireTool(saved) ? "light" : null;
    const els = mode ? ui.objects() : [];
    const i = mode ? els.indexOf(el) : -1;
    const target = i >= 0 ? t.nearTarget(els.map(ui.toSaved), i, mode) : -1;
    if (target < 0) {
      if (nearButton) nearButton.hidden = true;
      return;
    }
    if (!nearButton || !nearButton.isConnected) {
      nearButton = document.createElement("button");
      nearButton.type = "button";
      nearButton.className = "altar-rites-near";
      root.appendChild(nearButton);
      nearButton.addEventListener("click", (event) => {
        event.stopPropagation();
        lightOrSnuff();
      });
    }
    const thing = els[target];
    const isCandle = K().livingState.isCandle(ui.toSaved(thing));
    const label = mode === "snuff" ? (isCandle ? "Snuff candle" : "Put out incense") : isCandle ? "Light candle" : "Light incense";
    nearButton.textContent = label;
    nearButton.setAttribute("aria-label", `${label}: ${nameOf(ui.toSaved(thing))}`);
    nearButton.hidden = false;
    const left = thing.offsetLeft + thing.offsetWidth / 2 - 60;
    nearButton.style.left = `${Math.max(4, Math.min(root.clientWidth - 124, left))}px`;
    nearButton.style.top = `${Math.max(4, thing.offsetTop - 42)}px`;
  }
  function lightOrSnuff() {
    const t = T();
    const ui = B();
    const live = K().livingState;
    const inc = K().incense;
    const el = ui.selected();
    if (!el) return;
    const els = ui.objects();
    const objs = els.map(ui.toSaved);
    const tool = objs[els.indexOf(el)];
    const mode = t.isSnuffer(tool) ? "snuff" : "light";
    const target = t.nearTarget(objs, els.indexOf(el), mode);
    if (target < 0) return;
    const thing = objs[target];
    const at = nowIso();
    const name = nameOf(thing);
    if (mode === "snuff") {
      ui.update(els[target], (o) => (live.isCandle(o) ? live.snuffCandle(o, at) : inc.putOutIncense(o, at)));
      logAltar(`Snuffed ${name}.`);
      say(`${name[0].toUpperCase()}${name.slice(1)} is out.`);
      near();
      return;
    }
    const how = t.isLighter(tool) ? "lighter" : "match";
    play(SOUND[how], how === "match" ? 0.6 : 0.7, true);
    buzz(20);
    send({ kind: how === "match" ? "strike" : "click", key: uidOf(els[target]) });
    ui.update(els[target], (o) => (live.isCandle(o) ? live.lightCandle(o, at) : inc.lightIncense(o, at)));
    if (how === "match") setExtra(t.dropDebris(extra(), "match", thing, at), { undo: false });
    logAltar(`Lit ${name} with ${how === "match" ? "a match" : "a lighter"}.`);
    finish("light");
    finish("match");
    near();
  }

  // ── Heard from the others at a coven altar ───────────────────────────
  const heard = new Map();
  global.CovenAltarPage?.onRite?.((wire) => {
    const bell = K()?.bell;
    if (!bell || !bell.ringAllowed(heard, `${wire.from}:${wire.kind}`, Date.now(), W()?.STRIKE_GAP_MS || 1500)) return;
    const el = findByKey(wire.key);
    if (wire.kind === "bowl") return soundBowl(W().bowlTone(wire.tone).id, el, false);
    if (wire.kind === "strike") return play(SOUND.match, 0.6, false);
    if (wire.kind === "click") return play(SOUND.lighter, 0.7, false);
    const shown = { toast: ["moon", "The chalice is raised."], pour: ["moon", "A libation is poured."], sweep: ["salt", "The altar is swept."] }[wire.kind];
    if (!shown) return;
    moment(el, shown[0]);
    say(shown[1]);
  });

  // ── A coven ritual step done here (coven-altar.js) ───────────────────
  let pending = null; // { kind, done }
  function finish(kind) {
    if (pending?.kind !== kind) return;
    const done = pending.done;
    pending = null;
    done?.();
  }
  /** Begin a deed from the ritual builder's "At the altar" table; false when it isn't one of these. */
  function deed(kind, done, toCabinet) {
    const ui = B();
    const els = ui?.objects?.() || [];
    const find = (test) => els.find((el) => test(ui.toSaved(el))) || null;
    const pick = (el) => global.selectObject?.(el);
    const c = C();
    const t = T();
    if (!c || !t) return false;
    pending = { kind, done };
    switch (kind) {
      case "circle":
      case "release_circle": {
        if (kind === "release_circle" && !c.circleOf(extra())) {
          say("The circle isn’t cast here.");
          finish(kind);
          return true;
        }
        const el = find((o) => c.isCircleTool(o));
        if (!el) {
          if (kind === "circle") cast(c.DEFAULT_RING, true);
          else release();
          return true;
        }
        pick(el);
        startTrace(el, kind === "release_circle");
        return true;
      }
      case "quarters":
      case "release_quarters": {
        openCirclePanel();
        const state = c.quartersOf(extra());
        if (!(kind === "quarters" ? c.nextToCall(state) : c.nextToRelease(state))) finish(kind);
        return true;
      }
      case "bowl": {
        const el = find((o) => W().isSingingBowl(o));
        if (!el) { toCabinet("singing bowl"); return true; }
        pick(el);
        strike(el);
        return true;
      }
      case "toast":
      case "libation": {
        const el = find((o) => t.isChalice(o));
        if (!el) { toCabinet("chalice"); return true; }
        pick(el);
        openChalice(el);
        return true;
      }
      case "sweep": {
        const el = find((o) => t.isBesom(o));
        if (el) pick(el);
        sweep(el);
        finish("sweep");
        return true;
      }
      case "match": {
        const el = find((o) => t.isFireTool(o) && !t.isLighter(o));
        if (!el) { toCabinet("box of matches"); return true; }
        pick(el);
        say("Bring the matches to an unlit candle, then tap “Light candle”.");
        return true;
      }
    }
    pending = null;
    return false;
  }

  global.AltarRites = { deed, dropAsh, openCirclePanel, redraw };

  // ── In the object's actions ──────────────────────────────────────────
  const registry = global.altarObjectActionRegistry;
  if (Array.isArray(registry)) {
    const saved = (o) => B()?.toSaved?.(o) || null;
    const circleTool = (o) => !!C()?.isCircleTool(saved(o));
    const isCast = () => !!C()?.circleOf(extra());
    registry.push(
      { id: "cast-circle", label: "Cast the circle", icon: "◯", priority: 11, types: ["tool"], available: (o) => circleTool(o) && !isCast(), handler: (o) => openCast(o) },
      { id: "release-circle", label: "Release the circle", icon: "◌", priority: 11, types: ["tool"], available: (o) => circleTool(o) && isCast(), handler: (o) => startTrace(o, true) },
      { id: "release-circle-for-me", label: "Release it for me", icon: "◌", priority: 12, types: ["tool"], available: (o) => circleTool(o) && isCast(), handler: () => release() },
      { id: "circle-quarters", label: "Call the quarters", icon: "✦", priority: 13, types: ["tool"], available: circleTool, handler: () => openCirclePanel() },
      { id: "bowl-strike", label: "Strike once", icon: "◎", priority: 11, types: ["tool"], available: (o) => !!W()?.isSingingBowl(saved(o)), handler: (o) => strike(o) },
      { id: "bowl-more", label: "Tones and ringing", icon: "♪", priority: 12, types: ["tool"], available: (o) => !!W()?.isSingingBowl(saved(o)), handler: (o) => openBowl(o) },
      { id: "chalice", label: "Fill, raise or pour", icon: "♁", priority: 11, types: ["tool"], available: (o) => !!T()?.isChalice(saved(o)), handler: (o) => openChalice(o) },
      { id: "besom-sweep", label: "Sweep the altar", icon: "⌇", priority: 11, types: ["tool"], available: (o) => !!T()?.isBesom(saved(o)) && canSweep(), handler: (o) => sweep(o) }
    );
  }

  function start() {
    redraw();
    ["app-altar:changed", "altar:cords-changed", "altar:objects-moved", "altar:current-changed", "living-object-state:changed"].forEach((name) => document.addEventListener(name, redraw));
    document.addEventListener("pointerup", () => global.setTimeout(near, 0));
    global.addEventListener("resize", redraw);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})(window);
