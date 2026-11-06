// The meditations Ashley has recorded (voice.ts). Each one's files are in the
// repo under /audio/meditation/<id>/ and served by the website; its sections
// and their lengths come from scripts/ingest-voice.mjs, which prints the
// entry to paste here. A script or program shows "Guided by voice" only
// when it has a track in this list, so nothing changes until one is added.
// docs/meditation/recording-scripts.md has what to read and how. Pure.

import type { ScriptId } from './scripts.ts';
import { trackOk, type VoiceTrack } from './voice.ts';

export const VOICE_TRACKS: VoiceTrack[] = [];

/** The track that reads a script, if there is one. */
export const scriptVoice = (id: ScriptId | null | undefined, list: VoiceTrack[] = VOICE_TRACKS): VoiceTrack | null => (id ? (list.find((t) => t.scriptId === id && !t.programId && trackOk(t)) ?? null) : null);

/** The track that voices a program's cues, if there is one. */
export const programVoice = (id: string | null | undefined, list: VoiceTrack[] = VOICE_TRACKS): VoiceTrack | null => (id ? (list.find((t) => t.programId === id && trackOk(t)) ?? null) : null);

/** A track by its id. */
export const voiceTrack = (id: unknown, list: VoiceTrack[] = VOICE_TRACKS): VoiceTrack | null => list.find((t) => t.id === id && trackOk(t)) ?? null;
