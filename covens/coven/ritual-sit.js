/*
 * A ritual step's sit, run in the Ritual tab of the panel over a coven altar
 * (covens/coven/chat-panel.js), as the app's RitualSit
 * (components/covens/RitualPanelParts.tsx): everyone's clock is the step's
 * own start (never begun early), with the guidance, a breath circle, bells
 * and sound layers each person chose (Settings → Covens & privacy → During
 * coven rituals). Candle gazing looks at the altar's own lit candle. The
 * rules are the app's (SaltCore.covens.ritualPanel); the clock, bells,
 * guidance and sound are the Meditation pages' own (SaltCore.meditation).
 */
(function (global) {
  "use strict";

  const RP = () => global.SaltCore?.covens?.ritualPanel || null;
  const M = () => global.SaltCore?.meditation || null;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  let sit = null;

  function chime() {
    const a11y = global.SaltAccessibility?.getState?.() || { candleSounds: true };
    if (!a11y.candleSounds) return;
    try {
      const bell = new Audio("/assets/sounds/bell-chime.mp3");
      bell.volume = 0.8;
      void bell.play()?.catch?.(() => {});
    } catch {
      /* a bell that can't sound is simply not heard */
    }
  }

  async function prefsNow() {
    let settings = {};
    try {
      settings = (await global.getMySettings?.()) || global.getLocalMySettings?.() || {};
    } catch {
      settings = {};
    }
    return RP().ritualSitPrefs(settings);
  }

  function stop() {
    if (!sit) return;
    global.clearInterval(sit.timer);
    sit.sound?.stop();
    sit = null;
  }

  function draw() {
    if (!sit || !sit.el.isConnected) return stop();
    const { timer: T, scripts: SC, sound: S } = M();
    const sync = RP().sitSync({ startedAt: sit.startedAt, minutes: sit.plan.minutes || 0, now: Date.now() });
    const face = sit.el.querySelector("[data-sit-face]");
    if (sync.phase === "waiting") {
      face.innerHTML = `<p class="sp-caption">The sit begins for everyone together when the leader starts this step.</p>`;
      return;
    }
    if (sync.phase === "over" || sit.stopped) {
      sit.sound?.stop();
      sit.sound = null;
      face.innerHTML = `<p class="sp-caption">${sit.stopped ? "You’ve stepped out of the sit. The others carry on until it ends." : "The sit has ended."}</p>`;
      if (sync.phase === "over" && !sit.finished && !sit.stopped && sit.last !== null) {
        sit.finished = true;
        sit.onFinished?.();
      }
      global.clearInterval(sit.timer);
      return;
    }
    const elapsed = sync.elapsedMs;
    for (const b of T.bellsDue(sit.bells, sit.last ?? elapsed - 1, elapsed)) for (let i = 0; i < b.times; i++) global.setTimeout(chime, i * 2600);
    sit.last = elapsed;
    if (sit.sound) {
      const r = S.soundTick(sit.mix, sit.plan, sit.strikes, sit.soundLast ?? -1, elapsed, null);
      sit.soundLast = elapsed;
      sit.sound.update(r.voices);
      if (r.strike) sit.sound.strike(r.strike.key, r.strike.volume);
    }
    const s = T.sitStateAt(sit.plan, elapsed, null);
    const script = sit.script ? SC.scriptOf(sit.script) : null;
    const at = script && s.phase === "sit" ? SC.lineAt(script, s.sitMs, sit.plan.minutes * 60000) : null;
    const breath = sit.prefs.breath ? T.breathAt(RP().RITUAL_BREATH, elapsed) : null;
    face.innerHTML = `${sit.gaze ? `<p>Gaze at the lit candle on the altar.</p>` : ""}
      <p class="sp-eyebrow">${esc(T.PHASE_WORDS[s.phase])}</p>
      <p class="cv-sit__clock">${esc(T.clockLabel(s.phaseLeftMs ?? s.sitMs))}</p>
      ${breath ? `<div class="cv-sit__breath" aria-label="${esc(T.BREATH_WORDS[breath.stage])}"><span style="transform: scale(${(0.4 + 0.6 * breath.scale).toFixed(3)})"></span><em>${esc(T.BREATH_WORDS[breath.stage])}</em></div>` : ""}
      ${at ? `<p class="cv-sit__line" style="opacity:${at.opacity}">${esc(script.lines[at.index])}</p>` : ""}
      ${sit.sound?.needsTap() ? `<button class="button button--ghost button--small" type="button" data-sit-sound>Let the sound play</button>` : ""}
      <button class="button button--ghost button--small" type="button" data-sit-stop>Stop here</button>`;
  }

  /** Run the sit for this step in `el` (kept while the step lasts), or leave a running one be. */
  async function mount(el, { stepId, preset, startedAt, onFinished }) {
    if (!el || !RP() || !M()) return;
    if (sit && sit.stepId === stepId && sit.el === el) return;
    stop();
    const prefs = await prefsNow();
    const R = RP();
    const plan = R.ritualSitPlan(preset, prefs);
    const mix = R.ritualSitMix(prefs);
    sit = {
      el,
      stepId,
      startedAt,
      plan,
      prefs,
      mix,
      onFinished,
      bells: M().timer.bellsOf(plan),
      script: R.ritualSitScript(preset, prefs),
      gaze: R.gazesAtCandle(preset),
      sound: mix ? M().webSound.createWebSound((bed) => `/assets/sounds/meditation/${bed}.wav`) : null,
      strikes: mix ? M().sound.bowlStrikes(mix, plan) : [],
      last: null,
      stopped: false,
      finished: false
    };
    el.innerHTML = `<div class="cv-sit" aria-live="polite" data-sit-face></div>`;
    el.onclick = (event) => {
      if (!sit) return;
      if (event.target.closest("[data-sit-stop]")) {
        sit.stopped = true;
        draw();
      } else if (event.target.closest("[data-sit-sound]")) sit.sound?.unlock();
    };
    sit.timer = global.setInterval(draw, 500);
    draw();
  }

  global.CovenRitualSit = { mount, stop, running: () => sit?.stepId || null };
})(window);
