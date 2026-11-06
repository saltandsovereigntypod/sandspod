// The sit's sound layers in the app (lib/meditation/sound.ts): the beds play
// from their files, and the drone, drum, bowls and binaural tones are made
// as you begin (synth.ts) and written once to the cache as WAV files for
// expo-audio. Twice a second the mix is worked out from the sit's clock
// (soundTick) and each player's volume follows it, so it fades in and out
// and stops with the timer; a sit together's drum or bowls keep in step,
// since everyone's clock starts at the same moment. Sound you chose plays
// with the silent switch on. A recorded voice (voice.ts) plays with it
// (voicePlayer.ts), and while it speaks the layers dip under it (duckAt),
// eased ten times a second. The web build uses sitSound.web.ts.

import { createAudioPlayer, type AudioPlayer, type AudioSource } from 'expo-audio';

import { holdLoud } from '../../lib/altar/feel';
import { File, Paths } from 'expo-file-system';
import { useEffect, useMemo, useRef } from 'react';

import { CHUNK_MS, chirpChunk, rampPath, rampVolume, type Phase, type RampPath } from '../../lib/meditation/ramp';
import { programStrikes, programTick, type Compiled } from '../../lib/meditation/programs';
import { bowlStrikes, loopMs, mixOn, samplesFor, soundTick, type SoundMix } from '../../lib/meditation/sound';
import { wavBytes } from '../../lib/meditation/synth';
import { duckAt, type VoiceTimeline } from '../../lib/meditation/voice';
import { elapsedOf, type SitClock, type SitPlan } from '../../lib/meditation/timer';
import { createVoicePlayer } from './voicePlayer';

const BEDS: Record<string, number> = {
  pink: require('../../../assets/sounds/meditation/pink.wav'),
  brown: require('../../../assets/sounds/meditation/brown.wav'),
  rain: require('../../../assets/sounds/nature/rain.m4a'),
  fire: require('../../../assets/sounds/nature/fire.m4a'),
};

/** A bed's file, or a made sound written once to the cache. */
function sourceFor(key: string): AudioSource | null {
  if (BEDS[key]) return BEDS[key];
  const file = new File(Paths.cache, `meditation-${key.replace(/[^a-z0-9.]/gi, '_')}.wav`);
  if (!file.exists) {
    const pcm = samplesFor(key);
    if (!pcm) return null;
    file.write(wavBytes(pcm));
  }
  return { uri: file.uri };
}

function quiet(p: AudioPlayer) {
  try {
    p.pause();
    p.remove();
  } catch {
    // Already gone.
  }
}

/**
 * The program's binaural layer as back-to-back chirp chunks (ramp.ts): each is
 * rendered with the phase the last ended on, played from a WAV in the cache and
 * freed once it is over. At most the playing chunk and the next are kept.
 */
function createRamp(prog: Compiled) {
  const path: RampPath = rampPath(prog);
  type Chunk = { index: number; player: AudioPlayer; file: File };
  let chunks: Chunk[] = [];
  let nextIndex = -1; // The chunk whose start phase `phase` is.
  let phase: Phase = { left: 0, right: 0 };
  let timer: ReturnType<typeof setTimeout> | null = null;
  let current = -1;
  let volume = 0;
  let gain = 1;

  const free = (c: Chunk) => {
    quiet(c.player);
    try {
      if (c.file.exists) c.file.delete();
    } catch {
      // Left for the cache to clear.
    }
  };
  function prepare(index: number): Chunk | null {
    if (index * CHUNK_MS >= prog.totalMs) return null;
    const have = chunks.find((c) => c.index === index);
    if (have) return have;
    if (index !== nextIndex) phase = { left: 0, right: 0 }; // Started part-way: no earlier chunk to match.
    const { pcm, phase: end } = chirpChunk(path, index * CHUNK_MS, Math.min(CHUNK_MS, prog.totalMs - index * CHUNK_MS), phase, index === nextIndex);
    phase = end;
    nextIndex = index + 1;
    const file = new File(Paths.cache, `meditation-ramp-${index % 4}.wav`);
    file.write(wavBytes(pcm));
    const player = createAudioPlayer({ uri: file.uri });
    player.loop = false;
    player.volume = volume * gain;
    const chunk = { index, player, file };
    chunks.push(chunk);
    return chunk;
  }
  function startNext(index: number) {
    const c = prepare(index);
    if (c) {
      c.player.volume = volume * gain;
      c.player.play();
      current = index;
    }
    chunks = chunks.filter((x) => {
      const old = x.index < index - 1;
      if (old) free(x);
      return !old;
    });
  }
  return {
    /** How far it dips under the voice (1: not at all). */
    gain(g: number) {
      gain = g;
      chunks.forEach((c) => (c.player.volume = volume * gain));
    },
    tick(elapsed: number, paused = false) {
      volume = paused ? 0 : rampVolume(prog, elapsed);
      chunks.forEach((c) => (c.player.volume = volume * gain));
      const index = Math.floor(elapsed / CHUNK_MS);
      if (current !== index && !(timer && current === index - 1)) {
        // First chunk, or a seek: begin the chunk we are in, from where we are in it.
        if (timer) clearTimeout(timer);
        timer = null;
        chunks.forEach(free);
        chunks = [];
        nextIndex = -1;
        const c = prepare(index);
        if (c) {
          const at = elapsed - index * CHUNK_MS;
          if (at > 300) void c.player.seekTo(at / 1000).catch(() => {});
          c.player.play();
          current = index;
        }
      }
      // Have the next chunk ready, and start it on the moment (the tick alone is too coarse).
      const into = elapsed - index * CHUNK_MS;
      if (!paused && !timer && into > CHUNK_MS - 8000 && (index + 1) * CHUNK_MS < prog.totalMs) {
        prepare(index + 1);
        timer = setTimeout(() => {
          timer = null;
          startNext(index + 1);
        }, Math.max(0, CHUNK_MS - into - 60));
      }
    },
    pause() {
      if (timer) clearTimeout(timer);
      timer = null;
      current = -1; // Begin again from the clock on resume.
      chunks.forEach((c) => c.player.pause());
    },
    stop() {
      if (timer) clearTimeout(timer);
      chunks.forEach(free);
      chunks = [];
    },
  };
}

export type SitSoundControl = { needsTap: boolean; unlock: () => void };

export function useSitSound(mix: SoundMix | null, plan: SitPlan, clock: SitClock, endedAtMs: number | null, program?: Compiled | null, voice?: VoiceTimeline | null): SitSoundControl {
  const latest = useRef({ plan, clock, endedAtMs });
  useEffect(() => {
    latest.current = { plan, clock, endedAtMs };
  });
  const mixKey = mix && mixOn(mix) ? JSON.stringify(mix) : '';
  const voiceKey = voice?.sections.length ? JSON.stringify(voice) : '';
  const strikes = useMemo(() => (!mixKey ? [] : program ? programStrikes(program) : bowlStrikes(JSON.parse(mixKey) as SoundMix, plan)), [mixKey, plan, program]);
  const programRef = useRef(program);
  useEffect(() => {
    programRef.current = program;
  });

  useEffect(() => {
    if (!mixKey && !voiceKey) return;
    const m = mixKey ? (JSON.parse(mixKey) as SoundMix) : null;
    const said = voiceKey ? (JSON.parse(voiceKey) as VoiceTimeline) : null;
    const voicePlayer = said ? createVoicePlayer(said) : null;
    const players = new Map<string, AudioPlayer>();
    const levels = new Map<string, number>();
    const bowls = new Map<string, AudioPlayer>();
    let last: number | null = null;
    let wasPaused = false;
    const ramp = m && programRef.current ? createRamp(programRef.current) : null;
    // Under the voice: every layer's level times the dip, now.
    const duck = () => {
      const c = latest.current.clock;
      if (!said || c.pausedAt !== null) return;
      const g = duckAt(said, elapsedOf(c, Date.now()));
      for (const [key, pl] of players) pl.volume = (levels.get(key) ?? 0) * g;
      ramp?.gain(g);
    };
    holdLoud(true);

    const tick = () => {
      const { plan: p, clock: c, endedAtMs: ended } = latest.current;
      try {
        if (c.pausedAt !== null) {
          if (!wasPaused) {
            players.forEach((pl) => pl.pause());
            ramp?.pause();
            voicePlayer?.tick(0, true);
          }
          wasPaused = true;
          return;
        }
        const elapsed = elapsedOf(c, Date.now());
        voicePlayer?.tick(elapsed, false);
        const g = duckAt(said, elapsed);
        const prog = programRef.current;
        const ticked = !m ? { voices: [], strike: null } : prog ? programTick(prog, strikes, last ?? -1, elapsed) : soundTick(m, p, strikes, last ?? -1, elapsed, ended);
        const strike = ticked.strike;
        // A program's binaural layer is the continuous ramp, not the loops.
        const voices = prog ? ticked.voices.filter((v) => !v.key.startsWith('binaural:')) : ticked.voices;
        last = elapsed;
        ramp?.tick(elapsed);
        const want = new Set(voices.map((v) => v.key));
        for (const [key, pl] of players) {
          if (!want.has(key)) {
            quiet(pl);
            players.delete(key);
            levels.delete(key);
          }
        }
        for (const v of voices) {
          let pl = players.get(v.key);
          if (!pl) {
            const source = sourceFor(v.key);
            if (!source) continue;
            pl = createAudioPlayer(source);
            const oneShot = v.key.startsWith('callback:');
            pl.loop = !oneShot;
            const len = loopMs(v.key);
            // Kept in step: the drum from where the shared clock says it is; the callback from where it's got to.
            const at = oneShot ? v.atMs : len ? v.atMs % len : 0;
            if (at > 500) void pl.seekTo(at / 1000).catch(() => {});
            pl.volume = v.volume * g;
            pl.play();
            players.set(v.key, pl);
          }
          levels.set(v.key, v.volume);
          pl.volume = v.volume * g;
          if (wasPaused) pl.play();
        }
        wasPaused = false;
        if (strike) {
          let b = bowls.get(strike.key);
          if (!b) {
            const source = sourceFor(strike.key);
            if (source) {
              b = createAudioPlayer(source);
              bowls.set(strike.key, b);
            }
          }
          if (b) {
            b.volume = strike.volume * g;
            void b.seekTo(0).catch(() => {});
            b.play();
          }
        }
      } catch {
        // A sound that can't play is simply not heard.
      }
    };
    tick();
    const id = setInterval(tick, 500);
    const dip = said ? setInterval(duck, 100) : null;
    return () => {
      holdLoud(false);
      clearInterval(id);
      if (dip) clearInterval(dip);
      voicePlayer?.stop();
      ramp?.stop();
      players.forEach(quiet);
      bowls.forEach(quiet);
    };
  }, [mixKey, voiceKey, strikes]);

  return { needsTap: false, unlock: () => {} };
}
