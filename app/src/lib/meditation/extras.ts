// What goes with a sit besides its timer: the kind of practice, the written
// guidance (scripts.ts), something to look at (focus.ts), the sound
// (sound.ts), your intention and how you feel before, and the programme
// it's part of. Passed to the sit as plain strings (route params on the app,
// the query on the website), and on to the log afterwards with how you felt
// after. Pure.

import { cleanFocus, type FocusId } from './focus.ts';
import { SIT_KINDS, type SitKind } from './log.ts';
import { scriptOf, type ScriptId } from './scripts.ts';
import { cleanMix, mixOn, type SoundMix } from './sound.ts';

export type SitExtras = {
  kind: SitKind | null;
  script: ScriptId | null;
  focus: FocusId;
  /** The saved sigil's entry id, for the sigil focus. */
  sigil: string;
  sound: SoundMix | null;
  intention: string;
  before: number | null;
  programme: string;
  step: string;
};

export const NO_EXTRAS: SitExtras = { kind: null, script: null, focus: 'none', sigil: '', sound: null, intention: '', before: null, programme: '', step: '' };

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function cleanExtras(raw: Record<string, unknown>): SitExtras {
  let sound: SoundMix | null = null;
  try {
    const m = typeof raw.sound === 'string' && raw.sound ? cleanMix(JSON.parse(raw.sound)) : null;
    sound = m && mixOn(m) ? m : null;
  } catch {
    sound = null;
  }
  const before = Math.round(Number(raw.before));
  return {
    kind: SIT_KINDS.some((k) => k.value === raw.kind) ? (raw.kind as SitKind) : null,
    script: scriptOf(raw.script)?.id ?? null,
    focus: cleanFocus(raw.focus),
    sigil: str(raw.sigil, 80),
    sound,
    intention: str(raw.intention, 300),
    before: before >= 1 && before <= 5 ? before : null,
    programme: str(raw.programme, 40),
    step: str(raw.step, 80),
  };
}

/** The extras as plain strings, leaving out what isn't set. */
export function extrasParams(e: SitExtras): Record<string, string> {
  const out: Record<string, string> = {};
  if (e.kind) out.kind = e.kind;
  if (e.script) out.script = e.script;
  if (e.focus !== 'none') out.focus = e.focus;
  if (e.focus === 'sigil' && e.sigil) out.sigil = e.sigil;
  if (e.sound && mixOn(e.sound)) out.sound = JSON.stringify(e.sound);
  if (e.intention.trim()) out.intention = e.intention.trim().slice(0, 300);
  if (e.before) out.before = String(e.before);
  if (e.programme) out.programme = e.programme;
  if (e.step) out.step = e.step;
  return out;
}

/** What the log is opened with after a timed sit. */
export function logParams(done: { at: string; minutes: number }, e: SitExtras, more: { after?: number | null; steps?: number | null; altar?: string; together?: string } = {}): Record<string, string> {
  const out: Record<string, string> = { at: done.at, minutes: String(done.minutes), timed: '1' };
  const kind = e.kind ?? (e.script ? scriptOf(e.script)!.kind : null);
  if (kind) out.kind = kind;
  if (e.script) out.script = e.script;
  if (e.intention) out.intention = e.intention;
  if (e.before) out.before = String(e.before);
  if (more.after) out.after = String(more.after);
  if (more.steps) out.steps = String(more.steps);
  if (e.programme) out.programme = e.programme;
  if (e.step) out.step = e.step;
  if (more.altar) out.altar = more.altar;
  if (more.together) out.together = more.together;
  return out;
}
