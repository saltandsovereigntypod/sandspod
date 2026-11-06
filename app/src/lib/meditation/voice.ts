// A meditation read aloud: Ashley's recorded voice as a layer of the sit's
// sound. A recording is cut into sections (scripts/ingest-voice.mjs), one
// for each line of a written script (scripts.ts) or for some of a binaural
// program's cues (programs.ts). The sections are never cut or sped up: only
// the quiet between them stretches, so the same recording fills a 10 or a
// 45 minute sit. For a program, a section tied to a cue starts on that cue.
// While she speaks the other layers dip a little (duckAt) and come back up
// after. The tracks themselves are listed in voiceTracks.ts; the files are
// served by the website from /audio/meditation/<track>/. Played by
// components/meditation/sitSound.ts (the app) and sitSound.web.ts (web). Pure.

import { cueTimes, type Program } from './programs.ts';
import { scriptOf, type ScriptId } from './scripts.ts';
import type { SoundMix } from './sound.ts';

const MIN = 60_000;

export type VoiceSection = {
  /** The file, in the track's folder ("01.m4a"). */
  file: string;
  /** How long it is, in ms. */
  ms: number;
  /** A program track: the index of the cue (Program.cues) this section starts on. */
  cue?: number;
  /** How much of the spare quiet comes after it, against the others (default 1; the last section's default is 0, so the sit ends soon after the last words). */
  rest?: number;
  /** The script line (Script.lines) it reads, shown while it's heard (default: its own place). */
  line?: number;
  /** For a program track, the words to show while it's heard (else the program's own cue). */
  text?: string;
};

export type VoiceTrack = {
  id: string;
  /** The written script it reads, and/or the program whose cues it voices (a program track with a script shows the script's lines as its words). */
  scriptId?: ScriptId;
  programId?: string;
  title: string;
  /** Where its files are: a path on the website ("/audio/meditation/grounding/"), or a full address. */
  base: string;
  sections: VoiceSection[];
  /** The shortest quiet between two sections, in ms. */
  minGapMs: number;
  /** The sound it's made to go with, set when it's chosen and yours to change. */
  suggestedMix: SoundMix;
};

/** A section placed in a sit: when it starts and ends, in ms from the start of the sit's clock. */
export type PlacedSection = { index: number; file: string; url: string; startMs: number; endMs: number; line: number; text?: string };

export type VoiceTimeline = {
  trackId: string;
  sections: PlacedSection[];
  /** Whether it fits the time given; when it doesn't, it's laid out at its shortest (and runs over). */
  fits: boolean;
  /** The shortest it can be: the time it needs from the start of the sit. */
  minMs: number;
};

/** Quiet before the first words, after the bell to begin. Not stretched. */
export const LEAD_MS = 5_000;
/** An open-ended sit's gaps: this many times the shortest, an unhurried pace. */
export const OPEN_STRETCH = 2;
/** How far the other layers dip while she speaks: -6 dB. */
export const DUCK_GAIN = 0.5;
/** How long the dip takes to come in and to go. */
export const DUCK_RAMP_MS = 400;
/** A section is made ready this long before it starts. */
export const PRELOAD_MS = 20_000;

const join = (base: string, file: string) => (base.endsWith('/') ? base : `${base}/`) + file;
const restOf = (s: VoiceSection, i: number, n: number) => Math.max(0, s.rest ?? (i === n - 1 ? 0 : 1));
const audioMs = (track: VoiceTrack) => track.sections.reduce((t, s) => t + s.ms, 0);

/** The shortest a sit can be and keep all of it: the lead-in, every section, and the shortest quiet after each. */
export function voiceMinMs(track: VoiceTrack): number {
  return LEAD_MS + audioMs(track) + track.sections.length * track.minGapMs;
}

/** The same, in whole minutes. */
export const voiceMinMinutes = (track: VoiceTrack) => Math.ceil(voiceMinMs(track) / MIN);

/** The lengths (minutes) from a list that leave room for all of it. */
export const voiceLengths = (track: VoiceTrack, lengths: readonly number[]) => lengths.filter((m) => m * MIN >= voiceMinMs(track));

function placed(track: VoiceTrack, i: number, startMs: number): PlacedSection {
  const s = track.sections[i];
  const line = s.line ?? i;
  const text = s.text ?? (track.programId && track.scriptId ? scriptOf(track.scriptId)?.lines[line] : undefined);
  return { index: i, file: s.file, url: join(track.base, s.file), startMs: Math.round(startMs), endMs: Math.round(startMs + s.ms), line, ...(text ? { text } : {}) };
}

/**
 * A script track laid out over a sit of `lengthMs` (null: open-ended), starting
 * `offsetMs` into the clock (the minutes to settle in). Each section keeps its
 * own length; the spare time is shared between the quiet after each, by their
 * `rest`, and none is shorter than the track's shortest gap.
 */
export function sitVoiceTimeline(track: VoiceTrack, lengthMs: number | null, offsetMs = 0): VoiceTimeline {
  const n = track.sections.length;
  const minMs = voiceMinMs(track);
  const fits = lengthMs === null || lengthMs >= minMs;
  const weights = track.sections.map((s, i) => restOf(s, i, n));
  const total = weights.reduce((a, b) => a + b, 0);
  const spare = lengthMs === null ? 0 : Math.max(0, lengthMs - minMs);
  const gap = (i: number) => {
    if (lengthMs === null) return track.minGapMs * OPEN_STRETCH;
    const share = total > 0 ? weights[i] / total : i === n - 1 ? 1 : 0;
    return track.minGapMs + spare * share;
  };
  const sections: PlacedSection[] = [];
  let t = offsetMs + LEAD_MS;
  for (let i = 0; i < n; i++) {
    const p = placed(track, i, t);
    sections.push(p);
    t = p.endMs + gap(i);
  }
  return { trackId: track.id, sections, fits, minMs };
}

/**
 * A program track laid out over a program (its cues' times, in ms, and its
 * whole length): a section with a cue starts on it, and the sections after
 * it, up to the next with a cue, share the time until then as a sit's do
 * (their own lengths kept, the quiet after each stretched by its `rest`).
 * It fits when every section has room before the next cue, and the last
 * ends a little before the program does.
 */
export function programVoiceTimeline(track: VoiceTrack, cueTimes: number[], totalMs: number): VoiceTimeline {
  const n = track.sections.length;
  const tail = 2_000;
  // Runs of sections: each begins at a cue (or the lead-in, for the first) and ends before the next cue.
  const runs: number[][] = [];
  track.sections.forEach((s, i) => (i === 0 || s.cue !== undefined ? runs.push([i]) : runs[runs.length - 1].push(i)));
  let fits = track.sections.every((s) => s.cue === undefined || cueTimes[s.cue] !== undefined);
  const startOf = (run: number[]) => {
    const s = track.sections[run[0]];
    return s.cue !== undefined && cueTimes[s.cue] !== undefined ? cueTimes[s.cue] : LEAD_MS;
  };
  const sections: PlacedSection[] = [];
  let free = 0; // The earliest the next section may start.
  runs.forEach((run, r) => {
    const want = startOf(run);
    if (want < free) fits = false;
    let t = Math.max(want, free);
    const until = r + 1 < runs.length ? startOf(runs[r + 1]) : totalMs - tail;
    const need = run.reduce((sum, i) => sum + track.sections[i].ms + track.minGapMs, 0) - (r + 1 < runs.length ? 0 : track.minGapMs);
    const spare = Math.max(0, until - t - need);
    const weights = run.map((i) => restOf(track.sections[i], i, n));
    const total = weights.reduce((x, y) => x + y, 0);
    run.forEach((i, k) => {
      const p = placed(track, i, t);
      sections.push(p);
      t = p.endMs + track.minGapMs + (total > 0 ? (spare * weights[k]) / total : 0);
    });
    free = sections[sections.length - 1].endMs + track.minGapMs;
  });
  const last = sections[sections.length - 1];
  if (last && last.endMs > totalMs - tail) fits = false;
  return { trackId: track.id, sections, fits, minMs: last ? last.endMs + tail : 0 };
}

/** A program track laid out over the program at a length (minutes). */
export const programVoiceAt = (track: VoiceTrack, program: Pick<Program, 'cues'>, minutes: number) => programVoiceTimeline(track, cueTimes(program, minutes * MIN), minutes * MIN);

/** The program's lengths (minutes) the track fits. */
export const programVoiceLengths = (track: VoiceTrack, program: Pick<Program, 'cues' | 'lengths'>) => program.lengths.filter((m) => programVoiceAt(track, program, m).fits);

/**
 * How loud the other layers are `elapsedMs` in, 1 (as mixed) down to
 * DUCK_GAIN while a section is heard, with a smooth DUCK_RAMP_MS ramp in
 * just before it starts and out just after it ends.
 */
export function duckAt(timeline: VoiceTimeline | null | undefined, elapsedMs: number, gain = DUCK_GAIN, rampMs = DUCK_RAMP_MS): number {
  if (!timeline) return 1;
  let g = 1;
  for (const s of timeline.sections) {
    if (elapsedMs < s.startMs - rampMs) break;
    if (elapsedMs > s.endMs + rampMs) continue;
    let here: number;
    if (elapsedMs < s.startMs) here = 1 - (1 - gain) * smooth((elapsedMs - (s.startMs - rampMs)) / rampMs);
    else if (elapsedMs <= s.endMs) here = gain;
    else here = gain + (1 - gain) * smooth((elapsedMs - s.endMs) / rampMs);
    g = Math.min(g, here);
  }
  return Math.round(g * 1000) / 1000;
}

/** An eased 0 to 1 (no corner at either end). */
const smooth = (x: number) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};

/** What the voice should be doing `elapsedMs` in: the section being heard (and how far into it), and the next one to make ready. */
export function voiceAt(timeline: VoiceTimeline | null | undefined, elapsedMs: number, preloadMs = PRELOAD_MS): { playing: { section: PlacedSection; intoMs: number } | null; next: PlacedSection | null } {
  if (!timeline) return { playing: null, next: null };
  const now = timeline.sections.find((s) => elapsedMs >= s.startMs && elapsedMs < s.endMs) ?? null;
  const after = timeline.sections.find((s) => s.startMs > elapsedMs) ?? null;
  return { playing: now ? { section: now, intoMs: elapsedMs - now.startMs } : null, next: after && after.startMs - elapsedMs <= preloadMs ? after : null };
}

/** The section whose words show `elapsedMs` in: the last to have begun (it stays until the next), or null before the first. */
export function captionAt(timeline: VoiceTimeline | null | undefined, elapsedMs: number): PlacedSection | null {
  if (!timeline) return null;
  let out: PlacedSection | null = null;
  for (const s of timeline.sections) {
    if (s.startMs > elapsedMs) break;
    out = s;
  }
  return out;
}

/** A track's address resolved for playing: a site path joined to the website's origin (or kept as it is where the page is the website). */
export const voiceUrl = (url: string, origin: string) => (/^https?:\/\//.test(url) || !origin ? url : origin.replace(/\/$/, '') + url);

/** A track's sections, checked: files named, lengths positive, cues whole numbers. False when it can't be played. */
export function trackOk(track: VoiceTrack): boolean {
  return (
    !!track.id &&
    !!track.base &&
    track.sections.length > 0 &&
    track.minGapMs >= 0 &&
    track.sections.every((s) => !!s.file && s.ms > 0 && (s.cue === undefined || (Number.isInteger(s.cue) && s.cue >= 0)))
  );
}
