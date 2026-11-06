// The meditation sound in a browser, with Web Audio: the beds from their
// files, the drone, drum, bowls and binaural tones from synth.ts, each with
// its own gain moved smoothly to the level soundTick asks for. Used by the
// app's web build (components/meditation/sitSound.web.ts) and the website
// (js/core/meditation.js, SaltCore.meditation.webSound). A browser may hold
// sound back until the page is touched; `needsTap` says so, and `unlock`
// (from a tap) lets it play.

import type { EarPath, Knot } from './ramp.ts';
import { samplesFor, type Voice } from './sound.ts';

type Playing = { source: AudioBufferSourceNode; gain: GainNode };

export type WebSound = {
  update(voices: Voice[]): void;
  /** The program's binaural layer as two oscillators (left = carrier, right = carrier + beat) following `path` from `elapsedMs`, at `volume`; null to silence. */
  ramp(path: EarPath | null, elapsedMs: number, volume: number): void;
  strike(key: string, volume: number): void;
  pause(): void;
  resume(): void;
  stop(): void;
  needsTap(): boolean;
  unlock(): void;
};

export function createWebSound(bedUrl: (bed: string) => string): WebSound | null {
  const g = globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctx = g.AudioContext ?? g.webkitAudioContext;
  if (!Ctx) return null;
  let ctx: AudioContext;
  try {
    ctx = new Ctx();
  } catch {
    return null;
  }
  const buffers = new Map<string, Promise<AudioBuffer | null>>();
  const ready = new Map<string, AudioBuffer>();
  const playing = new Map<string, Playing>();
  const starting = new Set<string>();
  let stopped = false;
  let tones: { oscs: OscillatorNode[]; gain: GainNode; anchor: number } | null = null;

  function endTones(fade = 0.4) {
    if (!tones) return;
    const t = tones;
    tones = null;
    t.gain.gain.setTargetAtTime(0, ctx.currentTime, fade);
    setTimeout(() => t.oscs.forEach((o) => { try { o.stop(); } catch { /* Already stopped. */ } }), 2500);
  }

  function schedule(f: AudioParam, knots: Knot[], elapsedMs: number) {
    const now = ctx.currentTime;
    f.cancelScheduledValues(now);
    let at = 0;
    while (at < knots.length - 1 && knots[at + 1].ms <= elapsedMs) at++;
    const a = knots[at];
    const b = knots[at + 1];
    f.setValueAtTime(b && b.ms > a.ms && elapsedMs > a.ms ? a.hz + ((b.hz - a.hz) * (elapsedMs - a.ms)) / (b.ms - a.ms) : a.hz, now);
    for (let i = at + 1; i < knots.length; i++) f.linearRampToValueAtTime(knots[i].hz, now + (knots[i].ms - elapsedMs) / 1000);
  }

  function buffer(key: string): Promise<AudioBuffer | null> {
    let p = buffers.get(key);
    if (!p) {
      p = (async () => {
        try {
          const pcm = samplesFor(key);
          let b: AudioBuffer;
          if (pcm) {
            b = ctx.createBuffer(pcm.channels.length, pcm.channels[0].length, pcm.rate);
            pcm.channels.forEach((c, i) => b.getChannelData(i).set(c));
          } else {
            const res = await fetch(bedUrl(key));
            b = await ctx.decodeAudioData(await res.arrayBuffer());
          }
          ready.set(key, b);
          return b;
        } catch {
          return null;
        }
      })();
      buffers.set(key, p);
    }
    return p;
  }

  function begin(voice: Voice) {
    const b = ready.get(voice.key);
    if (!b) {
      if (!starting.has(voice.key)) {
        starting.add(voice.key);
        void buffer(voice.key).then(() => starting.delete(voice.key));
      }
      return;
    }
    const loop = !voice.key.startsWith('callback:');
    const offset = loop ? (voice.atMs / 1000) % b.duration : voice.atMs / 1000;
    if (!loop && offset >= b.duration) return;
    const source = ctx.createBufferSource();
    source.buffer = b;
    source.loop = loop;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(ctx.destination);
    source.start(0, Math.max(0, offset));
    playing.set(voice.key, { source, gain });
  }

  function fadeOut(key: string, p: Playing) {
    p.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    const s = p.source;
    setTimeout(() => {
      try {
        s.stop();
      } catch {
        // Already stopped.
      }
    }, 2500);
    playing.delete(key);
  }

  return {
    update(voices) {
      if (stopped) return;
      const want = new Set(voices.map((v) => v.key));
      for (const [key, p] of playing) if (!want.has(key)) fadeOut(key, p);
      for (const v of voices) {
        if (!playing.has(v.key)) begin(v);
        playing.get(v.key)?.gain.gain.setTargetAtTime(v.volume, ctx.currentTime, 0.5);
      }
    },
    ramp(path, elapsedMs, volume) {
      if (stopped) return;
      if (!path || volume <= 0) return endTones();
      const anchor = ctx.currentTime - elapsedMs / 1000;
      // Out of step with the clock (a seek, or a long stall): start the line again from here.
      if (tones && Math.abs(anchor - tones.anchor) > 1.5) endTones(0.05);
      if (!tones) {
        const gain = ctx.createGain();
        gain.gain.value = 0;
        const merger = ctx.createChannelMerger(2);
        const oscs = [path.left, path.right].map((knots, ear) => {
          const o = ctx.createOscillator();
          o.type = 'sine';
          schedule(o.frequency, knots, elapsedMs);
          o.connect(merger, 0, ear);
          o.start();
          return o;
        });
        merger.connect(gain).connect(ctx.destination);
        tones = { oscs, gain, anchor };
      }
      tones.gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.5);
    },
    strike(key, volume) {
      if (stopped) return;
      const b = ready.get(key);
      if (!b) {
        void buffer(key);
        return;
      }
      const source = ctx.createBufferSource();
      source.buffer = b;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      source.connect(gain).connect(ctx.destination);
      source.start();
    },
    pause() {
      void ctx.suspend().catch(() => {});
    },
    resume() {
      void ctx.resume().catch(() => {});
    },
    stop() {
      endTones();
      stopped = true;
      for (const [key, p] of playing) fadeOut(key, p);
      setTimeout(() => void ctx.close().catch(() => {}), 3000);
    },
    needsTap: () => ctx.state === 'suspended' && !stopped,
    unlock() {
      void ctx.resume().catch(() => {});
    },
  };
}

/** Make the bowl tones ahead, so the first strike isn't late. */
export function warmBowls(sound: WebSound, keys: string[]) {
  for (const k of keys) sound.strike(k, 0);
}
