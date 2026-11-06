// The sit's sound layers in the app's web build: the same mix (sound.ts) as
// the app, played with Web Audio (lib/meditation/webSound.ts, which the
// website uses too). A browser may hold sound back until the page is
// touched; then `needsTap` is true and `unlock` (from a tap) lets it play.

import { Asset } from 'expo-asset';
import { useEffect, useMemo, useRef, useState } from 'react';

import { bowlStrikes, mixOn, soundTick, type SoundMix } from '../../lib/meditation/sound';
import { elapsedOf, type SitClock, type SitPlan } from '../../lib/meditation/timer';
import { createWebSound, type WebSound } from '../../lib/meditation/webSound';
import type { SitSoundControl } from './sitSound';

const BEDS: Record<string, number> = {
  pink: require('../../../assets/sounds/meditation/pink.wav'),
  brown: require('../../../assets/sounds/meditation/brown.wav'),
  rain: require('../../../assets/sounds/nature/rain.m4a'),
  fire: require('../../../assets/sounds/nature/fire.m4a'),
};
const bedUrl = (bed: string) => Asset.fromModule(BEDS[bed]).uri;

export function useSitSound(mix: SoundMix | null, plan: SitPlan, clock: SitClock, endedAtMs: number | null): SitSoundControl {
  const latest = useRef({ plan, clock, endedAtMs });
  useEffect(() => {
    latest.current = { plan, clock, endedAtMs };
  });
  const [needsTap, setNeedsTap] = useState(false);
  const engine = useRef<WebSound | null>(null);
  const mixKey = mix && mixOn(mix) ? JSON.stringify(mix) : '';
  const strikes = useMemo(() => (mixKey ? bowlStrikes(JSON.parse(mixKey) as SoundMix, plan) : []), [mixKey, plan]);

  useEffect(() => {
    if (!mixKey) return;
    const m = JSON.parse(mixKey) as SoundMix;
    const sound = createWebSound(bedUrl);
    if (!sound) return;
    engine.current = sound;
    let last: number | null = null;
    let paused = false;
    const tick = () => {
      const { plan: p, clock: c, endedAtMs: ended } = latest.current;
      if (c.pausedAt !== null) {
        if (!paused) sound.pause();
        paused = true;
        return;
      }
      if (paused) sound.resume();
      paused = false;
      const elapsed = elapsedOf(c, Date.now());
      const { voices, strike } = soundTick(m, p, strikes, last ?? -1, elapsed, ended);
      last = elapsed;
      sound.update(voices);
      if (strike) sound.strike(strike.key, strike.volume);
      setNeedsTap(sound.needsTap());
    };
    const id = setInterval(tick, 500);
    return () => {
      clearInterval(id);
      sound.stop();
      engine.current = null;
    };
  }, [mixKey, strikes]);

  return {
    needsTap,
    unlock: () => {
      engine.current?.unlock();
      setNeedsTap(false);
    },
  };
}
