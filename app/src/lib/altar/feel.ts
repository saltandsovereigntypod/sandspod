// How the altar sounds and feels: a match struck and a soft tap as a candle
// is lit, a lighter tap as it's snuffed, and while candles burn the sounds
// real ones make: the soft sound of them burning, dry crackles now and then,
// sharp pops when there are herbs dressed into the wax, and little sputters
// from oil. Quiet, mixed with whatever else is playing, and silent when the
// phone's ring switch is off. Each can be turned off in Accessibility.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useIsFocused } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { useAccessibility } from '../accessibility/store';
import { dressingsOf, isCandle, isLit } from './livingState';
import type { SavedObject } from './types';

const SOUNDS = {
  strike: require('../../../assets/sounds/match-strike.wav'),
  crackle1: require('../../../assets/sounds/crackle-1.wav'),
  crackle2: require('../../../assets/sounds/crackle-2.wav'),
  crackle3: require('../../../assets/sounds/crackle-3.wav'),
  crackle4: require('../../../assets/sounds/crackle-4.wav'),
  crackle5: require('../../../assets/sounds/crackle-5.wav'),
  crackle6: require('../../../assets/sounds/crackle-6.wav'),
  crackle7: require('../../../assets/sounds/crackle-7.wav'),
  crackle8: require('../../../assets/sounds/crackle-8.wav'),
  crackle9: require('../../../assets/sounds/crackle-9.wav'),
  crackle10: require('../../../assets/sounds/crackle-10.wav'),
  pop1: require('../../../assets/sounds/pop-1.wav'),
  pop2: require('../../../assets/sounds/pop-2.wav'),
  pop3: require('../../../assets/sounds/pop-3.wav'),
  pop4: require('../../../assets/sounds/pop-4.wav'),
  pop5: require('../../../assets/sounds/pop-5.wav'),
  sputter1: require('../../../assets/sounds/sputter-1.wav'),
  sputter2: require('../../../assets/sounds/sputter-2.wav'),
  sputter3: require('../../../assets/sounds/sputter-3.wav'),
  sputter4: require('../../../assets/sounds/sputter-4.wav'),
} as const;
type Sound = keyof typeof SOUNDS;

/** A candle burning, recorded close: the quiet sound under the crackles, looped while candles are lit. */
const BURNING = require('../../../assets/sounds/candle-burning.wav');

const CRACKLES: Sound[] = ['crackle1', 'crackle2', 'crackle3', 'crackle4', 'crackle5', 'crackle6', 'crackle7', 'crackle8', 'crackle9', 'crackle10'];
const POPS: Sound[] = ['pop1', 'pop2', 'pop3', 'pop4', 'pop5'];
const SPUTTERS: Sound[] = ['sputter1', 'sputter2', 'sputter3', 'sputter4'];

const players = new Map<Sound, AudioPlayer>();
let modeSet = false;

function player(sound: Sound): AudioPlayer | null {
  try {
    if (!modeSet) {
      modeSet = true;
      // Sound effects: alongside music or a podcast, and quiet with the ring switch off.
      void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => {});
    }
    let p = players.get(sound);
    if (!p) {
      p = createAudioPlayer(SOUNDS[sound]);
      players.set(sound, p);
    }
    return p;
  } catch {
    return null;
  }
}

function play(sound: Sound, volume: number) {
  const p = player(sound);
  if (!p) return;
  try {
    p.volume = Math.max(0, Math.min(1, volume));
    void p.seekTo(0).then(() => p.play()).catch(() => p.play());
  } catch {
    // A sound that can't play is simply not heard.
  }
}

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

function tap(style: Haptics.ImpactFeedbackStyle) {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(style).catch(() => {});
}

const uidOf = (o: SavedObject) => String(o.altarObjectId || '');

/**
 * A match and a tap when a candle on this altar is lit, a lighter tap when
 * one is put out. Watches the candles themselves, so lighting from a
 * button, the close-up or the widget all sound the same. Not on first showing.
 */
export function useCandleFeel(altarId: string, objects: SavedObject[]) {
  const prefs = useAccessibility();
  const was = useRef<{ altarId: string; lit: Set<string> } | null>(null);
  useEffect(() => {
    const lit = new Set(objects.filter((o) => isCandle(o) && isLit(o)).map(uidOf));
    const before = was.current;
    was.current = { altarId, lit };
    if (!before || before.altarId !== altarId) return;
    const lighted = [...lit].some((id) => !before.lit.has(id));
    const snuffed = [...before.lit].some((id) => !lit.has(id));
    if (lighted) {
      if (prefs.candleSounds) play('strike', 0.6);
      if (prefs.haptics) tap(Haptics.ImpactFeedbackStyle.Medium);
    } else if (snuffed) {
      if (prefs.haptics) tap(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [altarId, objects, prefs.candleSounds, prefs.haptics]);
}

/** How often each burning candle makes a sound, per second: crackling wax, popping herbs, sputtering oil. */
export function candleVoices(objects: SavedObject[]): { crackle: number; pop: number; sputter: number } {
  let crackle = 0;
  let pop = 0;
  let sputter = 0;
  for (const o of objects) {
    if (!isCandle(o) || !isLit(o)) continue;
    crackle += 1 / 11;
    const dressings = dressingsOf(o);
    const herbs = dressings.filter((d) => d.type === 'herb').length;
    const oil = dressings.some((d) => d.type === 'oil');
    if (herbs) pop += Math.min(3, herbs) / 7;
    if (oil) sputter += 1 / 9;
  }
  return { crackle, pop, sputter };
}

/**
 * While this altar is on screen with candles burning: the soft sound of them
 * burning (louder a little with more of them), their crackles, and the
 * pops and sputters of herbs and oil dressed into them, at random moments as
 * real ones come. Dressed candles are livelier. Stops when the screen or the
 * app is left.
 */
export function useCandleAmbience(objects: SavedObject[]) {
  const prefs = useAccessibility();
  const focused = useIsFocused();
  const latest = useRef(objects);
  useEffect(() => {
    latest.current = objects;
  });
  const anyLit = objects.some((o) => isCandle(o) && isLit(o));
  useEffect(() => {
    if (!focused || !anyLit || !prefs.candleSounds) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let active = AppState.currentState === 'active';
    // The candles burning, softly, under everything else.
    let bed: AudioPlayer | null = null;
    try {
      player('crackle1'); // sets the audio mode (mixed with other audio, quiet on silent)
      bed = createAudioPlayer(BURNING);
      bed.loop = true;
      bed.volume = Math.min(0.55, 0.3 + 0.06 * latest.current.filter((o) => isCandle(o) && isLit(o)).length);
      if (active) bed.play();
    } catch {
      bed = null;
    }
    const sub = AppState.addEventListener('change', (state) => {
      active = state === 'active';
      try {
        if (active) bed?.play();
        else bed?.pause();
      } catch {
        // Not worth stopping for.
      }
    });
    const next = () => {
      const v = candleVoices(latest.current);
      const rate = v.crackle + v.pop + v.sputter;
      if (!(rate > 0)) return;
      // A random wait, as such sounds come: sometimes two close together, sometimes a long quiet.
      const wait = Math.min(25, Math.max(0.35, -Math.log(1 - Math.random()) / rate)) * 1000;
      timer = setTimeout(() => {
        if (active) {
          const roll = Math.random() * rate;
          if (roll < v.pop) {
            play(pick(POPS), 0.45 + Math.random() * 0.35);
            if (prefs.haptics && Math.random() < 0.5) tap(Haptics.ImpactFeedbackStyle.Soft);
          } else if (roll < v.pop + v.sputter) {
            play(pick(SPUTTERS), 0.3 + Math.random() * 0.3);
          } else {
            play(pick(CRACKLES), 0.25 + Math.random() * 0.35);
          }
        }
        next();
      }, wait);
    };
    next();
    return () => {
      if (timer) clearTimeout(timer);
      sub.remove();
      try {
        bed?.pause();
        bed?.remove();
      } catch {
        // Already gone.
      }
    };
  }, [focused, anyLit, prefs.candleSounds, prefs.haptics]);
}
