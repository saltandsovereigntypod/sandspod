// The sit's sound layers in the app (lib/meditation/sound.ts): the beds play
// from their files, and the drone, drum, bowls and binaural tones are made
// as you begin (synth.ts) and written once to the cache as WAV files for
// expo-audio. Twice a second the mix is worked out from the sit's clock
// (soundTick) and each player's volume follows it, so it fades in and out
// and stops with the timer; a sit together's drum or bowls keep in step,
// since everyone's clock starts at the same moment. Sound you chose plays
// with the silent switch on. The web build uses sitSound.web.ts.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioSource } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { useEffect, useMemo, useRef } from 'react';

import { bowlStrikes, loopMs, mixOn, samplesFor, soundTick, type SoundMix } from '../../lib/meditation/sound';
import { wavBytes } from '../../lib/meditation/synth';
import { elapsedOf, type SitClock, type SitPlan } from '../../lib/meditation/timer';

const BEDS: Record<string, number> = {
  pink: require('../../../assets/sounds/meditation/pink.wav'),
  brown: require('../../../assets/sounds/meditation/brown.wav'),
  rain: require('../../../assets/sounds/meditation/rain.wav'),
  wind: require('../../../assets/sounds/meditation/wind.wav'),
  fire: require('../../../assets/sounds/meditation/fire.wav'),
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

export type SitSoundControl = { needsTap: boolean; unlock: () => void };

export function useSitSound(mix: SoundMix | null, plan: SitPlan, clock: SitClock, endedAtMs: number | null): SitSoundControl {
  const latest = useRef({ plan, clock, endedAtMs });
  useEffect(() => {
    latest.current = { plan, clock, endedAtMs };
  });
  const mixKey = mix && mixOn(mix) ? JSON.stringify(mix) : '';
  const strikes = useMemo(() => (mixKey ? bowlStrikes(JSON.parse(mixKey) as SoundMix, plan) : []), [mixKey, plan]);

  useEffect(() => {
    if (!mixKey) return;
    const m = JSON.parse(mixKey) as SoundMix;
    const players = new Map<string, AudioPlayer>();
    const bowls = new Map<string, AudioPlayer>();
    let last: number | null = null;
    let wasPaused = false;
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});

    const tick = () => {
      const { plan: p, clock: c, endedAtMs: ended } = latest.current;
      try {
        if (c.pausedAt !== null) {
          if (!wasPaused) players.forEach((pl) => pl.pause());
          wasPaused = true;
          return;
        }
        const elapsed = elapsedOf(c, Date.now());
        const { voices, strike } = soundTick(m, p, strikes, last ?? -1, elapsed, ended);
        last = elapsed;
        const want = new Set(voices.map((v) => v.key));
        for (const [key, pl] of players) {
          if (!want.has(key)) {
            quiet(pl);
            players.delete(key);
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
            pl.volume = v.volume;
            pl.play();
            players.set(v.key, pl);
          }
          pl.volume = v.volume;
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
            b.volume = strike.volume;
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
    return () => {
      clearInterval(id);
      players.forEach(quiet);
      bowls.forEach(quiet);
    };
  }, [mixKey, strikes]);

  return { needsTap: false, unlock: () => {} };
}
