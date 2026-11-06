// The sit's sound layers in the app's web build: the same mix (sound.ts) as
// the app, played with Web Audio (lib/meditation/webSound.ts, which the
// website uses too). A browser may hold sound back until the page is
// touched; then `needsTap` is true and `unlock` (from a tap) lets it play.
// A recorded voice (voice.ts) plays as a clip on the sit's clock, the next
// one fetched ahead, and the layers dip under it (duckAt).

import { Asset } from 'expo-asset';
import { useEffect, useMemo, useRef, useState } from 'react';

import { earPath, rampPath, rampVolume, type EarPath } from '../../lib/meditation/ramp';
import { programStrikes, programTick, type Compiled } from '../../lib/meditation/programs';
import { bowlStrikes, mixOn, soundTick, type SoundMix } from '../../lib/meditation/sound';
import { elapsedOf, type SitClock, type SitPlan } from '../../lib/meditation/timer';
import { duckAt, voiceAt, voiceUrl, type VoiceTimeline } from '../../lib/meditation/voice';
import { isSiteOrigin, SITE_ORIGIN } from '../../lib/siteLinks';
import { createWebSound, type WebSound } from '../../lib/meditation/webSound';
import type { SitSoundControl } from './sitSound';

const BEDS: Record<string, number> = {
  pink: require('../../../assets/sounds/meditation/pink.wav'),
  brown: require('../../../assets/sounds/meditation/brown.wav'),
  rain: require('../../../assets/sounds/nature/rain.m4a'),
  fire: require('../../../assets/sounds/nature/fire.m4a'),
};
const bedUrl = (bed: string) => Asset.fromModule(BEDS[bed]).uri;
/** On the website's own domain the voice is a plain path; elsewhere (a preview address) it's fetched from the website. */
const clipUrl = (url: string) => voiceUrl(url, isSiteOrigin(globalThis.location?.origin) ? '' : SITE_ORIGIN);

export function useSitSound(mix: SoundMix | null, plan: SitPlan, clock: SitClock, endedAtMs: number | null, program?: Compiled | null, voice?: VoiceTimeline | null): SitSoundControl {
  const latest = useRef({ plan, clock, endedAtMs });
  useEffect(() => {
    latest.current = { plan, clock, endedAtMs };
  });
  const [needsTap, setNeedsTap] = useState(false);
  const engine = useRef<WebSound | null>(null);
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
    let heard: { index: number; anchor: number } | null = null;
    const sound = createWebSound(bedUrl);
    if (!sound) return;
    engine.current = sound;
    let last: number | null = null;
    let paused = false;
    let ears: EarPath | null = null;
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
      if (said) {
        const { playing, next } = voiceAt(said, elapsed);
        if (next) sound.loadClip(clipUrl(next.url));
        // Started from the clock; begun again only on a new section or a jump (a skip), not for the tick's own jitter.
        const anchor = Date.now() - (playing?.intoMs ?? 0);
        if (!playing) {
          if (heard) sound.stopClip();
          heard = null;
        } else if (heard?.index !== playing.section.index || Math.abs(anchor - heard.anchor) > 1500) {
          if (sound.playClip(clipUrl(playing.section.url), playing.intoMs)) heard = { index: playing.section.index, anchor };
        }
      }
      const g = duckAt(said, elapsed);
      const prog = programRef.current;
      const { voices, strike } = !m ? { voices: [], strike: null } : prog ? programTick(prog, strikes, last ?? -1, elapsed) : soundTick(m, p, strikes, last ?? -1, elapsed, ended);
      last = elapsed;
      if (prog) {
        ears ??= earPath(rampPath(prog));
        sound.ramp(ears, elapsed, rampVolume(prog, elapsed));
      }
      sound.update(prog ? voices.filter((v) => !v.key.startsWith('binaural:')) : voices);
      if (strike) sound.strike(strike.key, strike.volume * g);
      setNeedsTap(sound.needsTap());
    };
    const id = setInterval(tick, 500);
    // The dip under the voice, eased a few times a tick.
    const dip = said
      ? setInterval(() => {
          const c = latest.current.clock;
          if (c.pausedAt === null) sound.duck(duckAt(said, elapsedOf(c, Date.now())), 0.15);
        }, 100)
      : null;
    return () => {
      clearInterval(id);
      if (dip) clearInterval(dip);
      sound.stop();
      engine.current = null;
    };
  }, [mixKey, voiceKey, strikes]);

  return {
    needsTap,
    unlock: () => {
      engine.current?.unlock();
      setNeedsTap(false);
    },
  };
}
