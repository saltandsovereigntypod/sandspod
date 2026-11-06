// Drop in: practise while in meditation. Before any exercise you can choose a
// meditation sound (the Meditation module's own layers: binaural beats, drone,
// bowls, rain), a guided drop-in (the warm-up scripts, one line at a time, on
// a timer) and how long to drop in for; then press Start whenever you are
// ready. The sound carries on through the exercise. The reveal timer is how
// long the impressions window lasts before the next step unlocks. Settings
// are kept on the device. Pure, so it can be tested.

import { DEFAULT_LISTEN_MIX } from '../../meditation/listen.ts';
import { cleanMix, LAYERS, type SoundMix } from '../../meditation/sound.ts';
import { programById, compile, type Compiled } from '../../meditation/programs.ts';
import { warmupOf } from './warmups.ts';

export const PSYCHIC_SETTINGS_KEY = 'psychic.dropin';

/** Binaural programs offered before an exercise: id, and what it suits. */
export const DROP_PROGRAMS: { id: string; program: string; label: string; line: string }[] = [
  { id: 'prog-divination', program: 'divination', label: 'Program: Divination', line: 'A receptive 6 Hz that eases up to clear attention at the end: before tarot, pendulum or scrying (headphones).' },
  { id: 'prog-obe', program: 'obe', label: 'Program: Out-of-body', line: 'A long descent to 4 Hz with a full return: before astral work or remote viewing (headphones).' },
  { id: 'prog-trance', program: 'trance', label: 'Program: Journeying', line: 'Theta at 4.5 Hz with a return: before pathworking (headphones).' },
  { id: 'prog-centering', program: 'centering', label: 'Program: Centering', line: 'Steady alpha, then back to clear attention (headphones).' },
];
export type DropSoundId = `prog-${string}` | 'none' | 'descent' | 'theta' | 'alpha' | 'drone' | 'bowls' | 'forks' | 'forks-ground' | 'rain' | 'listen';

export const DROP_SOUNDS: { id: DropSoundId; label: string; line: string; mix: SoundMix | null }[] = [
  { id: 'none', label: 'No sound', line: 'Drop in in silence.', mix: null },
  { id: 'descent', label: 'Theta descent', line: 'Binaural beats easing from alpha down to theta (headphones).', mix: DEFAULT_LISTEN_MIX },
  { id: 'theta', label: 'Theta 6 Hz', line: 'A steady binaural theta beat (headphones).', mix: cleanMix({ levels: { binaural: 0.5 }, binaural: 'theta6' }) },
  { id: 'alpha', label: 'Alpha 10 Hz', line: 'A relaxed, awake binaural alpha beat (headphones).', mix: cleanMix({ levels: { binaural: 0.5 }, binaural: 'alpha' }) },
  { id: 'drone', label: 'Drone', line: 'A low continuous tone with soft noise under it.', mix: cleanMix({ levels: { drone: 0.55, pink: 0.2 } }) },
  { id: 'bowls', label: 'Singing bowls', line: 'Bowls struck now and then over a quiet drone.', mix: cleanMix({ levels: { bowls: 0.6, drone: 0.25 }, bowlSet: 'chakras', bowlEvery: 30 }) },
  { id: 'forks', label: 'Tuning forks', line: 'The planetary forks struck now and then, each ringing out, over a quiet drone.', mix: cleanMix({ levels: { forks: 0.6, drone: 0.2 }, forkSet: 'cosmic', forkEvery: 60 }) },
  { id: 'forks-ground', label: 'Forks: 128 + 136.1 Hz', line: 'The grounding and OM forks struck together, then the OM pair, beating slowly.', mix: cleanMix({ levels: { forks: 0.6 }, forkSet: 'pairs', forkEvery: 60 }) },
  { id: 'rain', label: 'Rain and theta', line: 'Rain with a gentle theta beat under it.', mix: cleanMix({ levels: { rain: 0.5, binaural: 0.3 }, binaural: 'theta6' }) },
  ...DROP_PROGRAMS.map((p) => ({ id: p.id as DropSoundId, label: p.label, line: p.line, mix: cleanMix({ levels: { pink: 0.2 } }) })),
  { id: 'listen', label: 'My last Listen mix', line: 'Whatever you last set up under Meditation, Listen.', mix: null },
];

export const dropSound = (id: unknown) => DROP_SOUNDS.find((s) => s.id === id) ?? DROP_SOUNDS[0];

/** Drop-in lengths in minutes; null is until you are ready. */
export const DROP_LENGTHS: (number | null)[] = [3, 5, 10, 15, null];
export const dropLabel = (m: number | null) => (m === null ? 'Until I’m ready' : `${m} min`);

/** Reveal timer presets in seconds; null is manual (you tap reveal). Anything else is custom. */
export const REVEAL_PRESETS: (number | null)[] = [30, 60, 120, 300, null];
export const MIN_REVEAL = 5;
export const MAX_REVEAL = 3600;

export function revealLabel(sec: number | null): string {
  if (sec === null) return 'Manual';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m} min ${s}s` : `${m} min`;
}

export type PsychicSettings = {
  sound: DropSoundId;
  /** The mix behind "My last Listen mix", kept so it plays without asking again. */
  listenMix: SoundMix | null;
  guided: boolean;
  warmups: string[];
  dropMinutes: number | null;
  /** Seconds before the next step unlocks; null is manual. */
  revealSec: number | null;
  hideCountdown: boolean;
  chime: boolean;
  /** 0.1 to 1: how loud the sound plays. */
  volume: number;
};

export const DEFAULT_SETTINGS: PsychicSettings = {
  sound: 'descent',
  listenMix: null,
  guided: true,
  warmups: ['grounding', 'opening'],
  dropMinutes: 10,
  revealSec: null,
  hideCountdown: false,
  chime: true,
  volume: 0.6,
};

export const VOLUME_STEPS = [0.2, 0.4, 0.6, 0.8, 1] as const;

export function cleanSettings(raw: unknown): PsychicSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  const bool = (v: unknown, def: boolean) => (typeof v === 'boolean' ? v : def);
  const sound = DROP_SOUNDS.some((s) => s.id === r.sound) ? (r.sound as DropSoundId) : d.sound;
  const mins = r.dropMinutes === null ? null : typeof r.dropMinutes === 'number' && DROP_LENGTHS.includes(r.dropMinutes) ? r.dropMinutes : d.dropMinutes;
  const rs = r.revealSec === null ? null : typeof r.revealSec === 'number' && Number.isFinite(r.revealSec) ? Math.min(MAX_REVEAL, Math.max(MIN_REVEAL, Math.round(r.revealSec))) : d.revealSec;
  const warmups = Array.isArray(r.warmups) ? r.warmups.filter((x): x is string => typeof x === 'string' && !!warmupOf(x)) : d.warmups;
  const vol = typeof r.volume === 'number' && Number.isFinite(r.volume) ? Math.min(1, Math.max(0.1, r.volume)) : d.volume;
  const lm = r.listenMix && typeof r.listenMix === 'object' ? cleanMix(r.listenMix) : null;
  return {
    sound,
    listenMix: lm && LAYERS.some((l) => (lm.levels[l.id] ?? 0) > 0) ? lm : null,
    guided: bool(r.guided, d.guided),
    warmups,
    dropMinutes: mins,
    revealSec: rs,
    hideCountdown: bool(r.hideCountdown, d.hideCountdown),
    chime: bool(r.chime, d.chime),
    volume: vol,
  };
}

/** The mix a setting plays, or null for silence. */
export function mixFor(s: PsychicSettings): SoundMix | null {
  if (s.sound === 'listen') return s.listenMix;
  return dropSound(s.sound).mix;
}

/** A mix at the chosen volume: every layer's level scaled. */
export function scaleMix(mix: SoundMix, volume: number): SoundMix {
  const levels: SoundMix['levels'] = {};
  for (const l of LAYERS) {
    const v = mix.levels[l.id];
    if (typeof v === 'number') levels[l.id] = Math.round(v * volume * 1000) / 1000;
  }
  return { ...mix, levels };
}

// ─── Reveal timer ───────────────────────────────────────────────────────────

export type RevealState = {
  phase: 'idle' | 'running' | 'ready';
  /** Ms left, or null when there is no countdown (idle or manual). */
  leftMs: number | null;
  /** 0 at the start, 1 when it is ready (for the ring). */
  fraction: number;
};

/** The reveal timer: `elapsedMs` since the window opened (null before it has), `sec` its length (null for manual). */
export function revealAt(elapsedMs: number | null, sec: number | null): RevealState {
  if (elapsedMs === null) return { phase: 'idle', leftMs: null, fraction: 0 };
  if (sec === null) return { phase: 'ready', leftMs: null, fraction: 1 };
  const total = sec * 1000;
  const left = Math.max(0, total - Math.max(0, elapsedMs));
  return left === 0 ? { phase: 'ready', leftMs: 0, fraction: 1 } : { phase: 'running', leftMs: left, fraction: 1 - left / total };
}

/** "m:ss" for a countdown. */
export function countdownLabel(ms: number): string {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ─── Guided drop-in ─────────────────────────────────────────────────────────

/** Seconds on each line when the drop-in has no set length. */
export const OPEN_LINE_SECONDS = 30;
export const MIN_LINE_SECONDS = 15;

export type GuidedStep = { index: number; total: number; title: string; line: string; /** The sequence has run through. */ finished: boolean };

/** Which line of the chosen warm-ups it is, `elapsedMs` into the drop-in, spread across `dropMinutes` (or 30 s a line when open). */
export function guidedAt(warmupIds: readonly string[], elapsedMs: number, dropMinutes: number | null): GuidedStep | null {
  const lines = warmupIds.flatMap((id) => {
    const w = warmupOf(id);
    return w ? w.lines.map((line) => ({ title: w.title, line })) : [];
  });
  if (!lines.length) return null;
  const per = dropMinutes === null ? OPEN_LINE_SECONDS * 1000 : Math.max(MIN_LINE_SECONDS * 1000, Math.floor((dropMinutes * 60_000) / lines.length));
  const i = Math.floor(Math.max(0, elapsedMs) / per);
  const at = lines[Math.min(i, lines.length - 1)];
  return { index: Math.min(i, lines.length - 1), total: lines.length, title: at.title, line: at.line, finished: i >= lines.length };
}

/** Is the timed drop-in over? (Never, when it is open.) */
export const dropDone = (elapsedMs: number, dropMinutes: number | null) => dropMinutes !== null && elapsedMs >= dropMinutes * 60_000;

// ─── What a session records ────────────────────────────────────────────────

export type MeditationUse = { sound: boolean; preset: string; guided: boolean; dropMs: number };

/** What to keep with a session; undefined when nothing meditative was used. */
export function meditationUse(s: PsychicSettings, soundPlaying: boolean, guidedUsed: boolean, dropMs: number): MeditationUse | undefined {
  if (!soundPlaying && !guidedUsed) return undefined;
  return { sound: soundPlaying, preset: soundPlaying ? s.sound : 'none', guided: guidedUsed, dropMs: Math.max(0, Math.round(dropMs)) };
}

/** The program a setting plays, compiled to the drop-in's length (at least 5 minutes) and volume, or null. */
export function dropProgram(s: Pick<PsychicSettings, 'sound' | 'dropMinutes' | 'volume'>): Compiled | null {
  const row = DROP_PROGRAMS.find((p) => p.id === s.sound);
  const p = row ? programById(row.program) : null;
  if (!p) return null;
  return { ...compile(p, Math.max(5, s.dropMinutes ?? p.length)), volume: s.volume };
}
