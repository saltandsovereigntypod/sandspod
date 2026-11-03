// How the altar sounds and feels: a match struck and a soft tap as a candle
// is lit, a lighter tap as it's snuffed, and while candles burn the sounds
// real ones make: the soft sound of them burning, dry crackles now and then,
// sharp pops when there are herbs dressed into the wax, and little sputters
// from oil. Quiet, mixed with whatever else is playing, and silent when the
// phone's ring switch is off. Each can be turned off in Accessibility. The
// altar bell (bell.ts) rings through here too, under Candle sounds.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useIsFocused } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { useAccessibility } from '../accessibility/store';
import type { BowlToneId } from './bowl';
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

/** Whether a bell is ringing out (it plays through the silent switch meanwhile). */
let bellRinging = false;
/** Sounds the person chose to hear (a sit's layers) hold the silent switch open until they stop. */
let loudHolds = 0;
export function holdLoud(on: boolean) {
  loudHolds = Math.max(0, loudHolds + (on ? 1 : -1));
  if (on) void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => {});
  else if (!bellRinging) void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => {});
}

function setMode() {
  if (modeSet) return;
  modeSet = true;
  if (bellRinging || loudHolds) return; // set back to quiet once the bell has rung out or the sit's sound stops
  // Sound effects: alongside music or a podcast, and quiet with the ring switch off.
  void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => {});
}

function player(sound: Sound): AudioPlayer | null {
  try {
    setMode();
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

/** The altar bell (synthesised, see bell.ts): three players, so a chime rings on under the next. */
const BELL = require('../../../assets/sounds/bell-chime.mp3');
const bells: AudioPlayer[] = [];
const played = new Set<AudioPlayer>();
let nextBell = 0;
/** Each ring's number, so only the newest one sets the silent switch back. */
let ringSeq = 0;
/** How long after the last chime the bell is left to ring out. */
const RING_OUT_MS = 4500;

function chime(volume: number) {
  try {
    const i = nextBell++ % 3;
    if (!bells[i]) bells[i] = createAudioPlayer(BELL);
    const p = bells[i];
    p.volume = volume;
    if (played.has(p)) void p.seekTo(0).then(() => p.play()).catch(() => p.play());
    else {
      played.add(p);
      p.play();
    }
  } catch {
    // A bell that can't sound is simply not heard.
  }
}

/**
 * Ring the altar bell `times` times, `gapMs` apart: each chime heard (when
 * sound is on), a soft tap (when vibration is), and `onChime` for the ripple.
 * Ringing is something you do on purpose, so the bell sounds even with the
 * iPhone's silent switch on; the candles' sounds stay quiet with it, as the
 * audio mode goes back once the last chime has rung out.
 * Returns a function that stops any chimes still to come.
 */
export function ringBell(times: number, gapMs: number, sound: boolean, haptics: boolean, onChime: (i: number) => void): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let stopped = false;
  const seq = ++ringSeq;
  const schedule = () => {
    if (stopped) return;
    for (let i = 0; i < times; i++) {
      timers.push(
        setTimeout(() => {
          if (sound) chime(0.8);
          if (haptics) tap(Haptics.ImpactFeedbackStyle.Light);
          onChime(i);
        }, i * gapMs),
      );
    }
  };
  if (!sound) schedule();
  else {
    bellRinging = true;
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false })
      .catch(() => {})
      .then(schedule);
    // Not cleared by stop: the mode always goes back, unless a newer ring will.
    setTimeout(() => {
      if (seq !== ringSeq) return;
      bellRinging = false;
      modeSet = true;
      if (loudHolds) return;
      void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => {});
    }, (times - 1) * gapMs + RING_OUT_MS);
  }
  return () => {
    stopped = true;
    timers.forEach(clearTimeout);
  };
}

/** The singing bowl's tones (bowl.ts; synthesised by scripts/build-bowl-sounds.py). */
const BOWLS: Record<BowlToneId, number> = {
  root: require('../../../assets/sounds/bowl-root.mp3'),
  sacral: require('../../../assets/sounds/bowl-sacral.mp3'),
  solar: require('../../../assets/sounds/bowl-solar.mp3'),
  heart: require('../../../assets/sounds/bowl-heart.mp3'),
  throat: require('../../../assets/sounds/bowl-throat.mp3'),
  'third-eye': require('../../../assets/sounds/bowl-third-eye.mp3'),
  crown: require('../../../assets/sounds/bowl-crown.mp3'),
  '432': require('../../../assets/sounds/bowl-432.mp3'),
};
const bowlPlayers = new Map<BowlToneId, AudioPlayer>();
/** How long a struck bowl is left to ring out before the silent switch is minded again. */
const BOWL_OUT_MS = 9500;

/**
 * Strike the singing bowl once in this tone: heard when sound is on (through
 * the silent switch, as striking it is something you do on purpose, like the
 * bell), a soft tap when vibration is.
 */
export function strikeBowl(tone: BowlToneId, sound: boolean, haptics: boolean) {
  if (haptics) tap(Haptics.ImpactFeedbackStyle.Soft);
  if (!sound) return;
  holdLoud(true);
  try {
    let p = bowlPlayers.get(tone);
    if (!p) {
      p = createAudioPlayer(BOWLS[tone] ?? BOWLS.heart);
      bowlPlayers.set(tone, p);
    }
    const player = p;
    player.volume = 0.85;
    void player.seekTo(0).then(() => player.play()).catch(() => player.play());
  } catch {
    // A bowl that can't sound is simply not heard.
  }
  setTimeout(() => holdLoud(false), BOWL_OUT_MS);
}

/** The lighter's click (a struck match is SOUNDS.strike). */
const LIGHTER = require('../../../assets/sounds/lighter-click.mp3');
let lighterPlayer: AudioPlayer | null = null;
/** What the next candle lit on this altar was lit with, so it sounds right (useCandleFeel). */
let litWith: 'match' | 'lighter' | null = null;
export function lightingWith(how: 'match' | 'lighter') {
  litWith = how;
  setTimeout(() => {
    if (litWith === how) litWith = null;
  }, 1500);
}

/** A match struck or a lighter clicked, heard from someone else at a coven altar. */
export function fireSound(how: 'match' | 'lighter', sound: boolean, haptics: boolean) {
  if (haptics) tap(Haptics.ImpactFeedbackStyle.Light);
  if (!sound) return;
  if (how === 'match') return play('strike', 0.6);
  try {
    setMode();
    if (!lighterPlayer) lighterPlayer = createAudioPlayer(LIGHTER);
    const p = lighterPlayer;
    p.volume = 0.7;
    void p.seekTo(0).then(() => p.play()).catch(() => p.play());
  } catch {
    // Not heard.
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
      const how = litWith;
      litWith = null;
      if (how === 'lighter') fireSound('lighter', prefs.candleSounds, false);
      else if (prefs.candleSounds) play('strike', 0.6);
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
