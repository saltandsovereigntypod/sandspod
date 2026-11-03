// The meditation log: each sit, timed or written in afterwards. When, how
// long, what kind of practice, how settled you felt (1 to 5), a note, and
// what came up, with optional tags (images, messages, a deity or spirit,
// emotions, body sensations). Kept in the craft collection `meditation.sits`
// (craft_entries, one row per sit, private, synced like the journals), so no
// new table. The moon's phase at the time is noted for the patterns. A sit
// can be kept as a Grimoire page (written as saveHolyPage writes, found again
// by its tag). Pure, so the app and the website (js/core/meditation.js) read
// it the same way.

import { moonState, type PhaseName } from '../moon.ts';
import { cleanPlan, minutesSat, type SitPlan } from './timer.ts';

export const SITS = 'meditation.sits';

export type SitKind = 'breath' | 'grounding' | 'candle' | 'visualisation' | 'pathworking' | 'trance' | 'walking' | 'body' | 'scrying' | 'devotional' | 'other';

export const SIT_KINDS: { value: SitKind; label: string }[] = [
  { value: 'breath', label: 'Breath' },
  { value: 'grounding', label: 'Grounding & centring' },
  { value: 'candle', label: 'Candle gazing' },
  { value: 'visualisation', label: 'Visualisation' },
  { value: 'pathworking', label: 'Pathworking' },
  { value: 'trance', label: 'Trance' },
  { value: 'walking', label: 'Walking' },
  { value: 'body', label: 'Body scan' },
  { value: 'scrying', label: 'Scrying' },
  { value: 'devotional', label: 'Devotional' },
  { value: 'other', label: 'Other' },
];

export const CAME_UP_TAGS: { value: string; label: string }[] = [
  { value: 'images', label: 'Images' },
  { value: 'messages', label: 'Messages' },
  { value: 'deity', label: 'A deity or spirit' },
  { value: 'emotions', label: 'Emotions' },
  { value: 'body', label: 'Body sensations' },
];

export const SETTLED_WORDS = ['', 'Restless', 'Unsettled', 'Somewhat settled', 'Settled', 'Deeply settled'];

export const NOTE_MAX = 4000;

export type Sit = {
  /** When it began (ISO). */
  at: string;
  minutes: number;
  kind: SitKind;
  /** The kind in your own words, for Other. */
  other: string;
  /** How settled, 1 to 5; null when not said. */
  settled: number | null;
  note: string;
  cameUp: string;
  tags: string[];
  /** The moon's phase when it began. */
  moonPhase: PhaseName;
  /** Timed in the app or on the website (rather than written in afterwards). */
  timed: boolean;
  /** Sat at an altar ("Meditate here"), or together (a ritual together's id). */
  altar?: string;
  together?: string;
};

export type SitEntry = { id: string; createdAt?: string; data: Sit };

const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const isKind = (v: unknown): v is SitKind => SIT_KINDS.some((k) => k.value === v);

export function normalizeSit(raw: unknown): Sit {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const at = typeof s.at === 'string' && Number.isFinite(Date.parse(s.at)) ? new Date(s.at).toISOString() : new Date(0).toISOString();
  const minutes = Math.round(Number(s.minutes));
  const settled = Math.round(Number(s.settled));
  const tags = Array.isArray(s.tags) ? [...new Set(s.tags.filter((t): t is string => CAME_UP_TAGS.some((x) => x.value === t)))] : [];
  return {
    at,
    minutes: Number.isFinite(minutes) && minutes > 0 ? Math.min(minutes, 24 * 60) : 1,
    kind: isKind(s.kind) ? s.kind : 'other',
    other: text(s.other, 80),
    settled: settled >= 1 && settled <= 5 ? settled : null,
    note: text(s.note, NOTE_MAX),
    cameUp: text(s.cameUp, NOTE_MAX),
    tags,
    moonPhase: typeof s.moonPhase === 'string' && s.moonPhase ? (s.moonPhase as PhaseName) : moonState(new Date(at)).name,
    timed: s.timed === true,
    ...(typeof s.altar === 'string' && s.altar ? { altar: s.altar.slice(0, 80) } : {}),
    ...(typeof s.together === 'string' && s.together ? { together: s.together.slice(0, 80) } : {}),
  };
}

export type SitInput = Partial<Omit<Sit, 'moonPhase'>> & { at: string; minutes: number };

/** A sit as kept, its moon worked out from when it began. */
export function newSit(input: SitInput): Sit {
  return normalizeSit({ ...input, moonPhase: moonState(new Date(input.at)).name });
}

/** A sit's kind in words: "Candle gazing", or what you called it. */
export const kindLabel = (s: Pick<Sit, 'kind' | 'other'>) => (s.kind === 'other' ? s.other || 'Other' : (SIT_KINDS.find((k) => k.value === s.kind)?.label ?? 'Other'));

/** The start of a sit's log from the timer: when it began and how long the sit itself was. */
export function fromTimer(startedAt: number, sitMs: number, plan: SitPlan): { at: string; minutes: number } {
  return { at: new Date(startedAt + cleanPlan(plan).settle * 60_000).toISOString(), minutes: minutesSat(sitMs) };
}

/** "Tue 3 Nov · 7:30 · 20 minutes". */
export function sitLine(s: Pick<Sit, 'at' | 'minutes'>): string {
  const d = new Date(s.at);
  const day = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${day} · ${time} · ${s.minutes} ${s.minutes === 1 ? 'minute' : 'minutes'}`;
}

// ─── In the Grimoire ─────────────────────────────────────────────────────

export const MEDITATION_SECTION = 'Meditation';
/** The Grimoire page ref a sit is kept under (the saveHolyPage tag), so it's found again. */
export const sitRef = (id: string) => `meditation-sit:${id}`;

const html = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A sit as Grimoire blocks (the website's block shapes). */
export function sitPage(id: string, s: Sit): { ref: string; title: string; sectionTitle: string; blocks: { type: string; content: string }[] } {
  const d = new Date(s.at);
  const facts = [kindLabel(s), `${s.minutes} ${s.minutes === 1 ? 'minute' : 'minutes'}`, s.moonPhase, s.settled ? `${SETTLED_WORDS[s.settled]} (${s.settled} of 5)` : ''].filter(Boolean);
  const blocks: { type: string; content: string }[] = [{ type: 'callout', content: html(facts.join(' · ')) }];
  if (s.cameUp) blocks.push({ type: 'heading', content: 'What came up' }, ...s.cameUp.split(/\n\s*\n/).map((p) => ({ type: 'text', content: html(p.trim()) })));
  if (s.tags.length) blocks.push({ type: 'text', content: html(`Tags: ${s.tags.map((t) => CAME_UP_TAGS.find((x) => x.value === t)?.label ?? t).join(', ')}`) });
  if (s.note) blocks.push({ type: 'heading', content: 'Notes' }, ...s.note.split(/\n\s*\n/).map((p) => ({ type: 'text', content: html(p.trim()) })));
  return { ref: sitRef(id), title: `${kindLabel(s)} · ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, sectionTitle: MEDITATION_SECTION, blocks };
}

/** A Grimoire page already holding this sit, by its tag. */
export function findSitPage<P extends { id: string; metadata: Record<string, unknown> | null }>(pages: P[], id: string): P | null {
  return pages.find((p) => (p.metadata as { holyRef?: string } | null)?.holyRef === sitRef(id)) ?? null;
}
