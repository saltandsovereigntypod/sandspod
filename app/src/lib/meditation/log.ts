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

export type SitKind = 'breath' | 'grounding' | 'candle' | 'visualisation' | 'pathworking' | 'trance' | 'walking' | 'body' | 'scrying' | 'devotional' | 'mantra' | 'listening' | 'other';

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
  { value: 'mantra', label: 'Mantra & mala' },
  { value: 'listening', label: 'Listening' },
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
/** How you feel, before and after, 1 to 5. */
export const MOOD_WORDS = ['', 'Low', 'Heavy', 'Middling', 'Good', 'Bright'];

/** Questions to write to after a sit, matched to its kind. */
export const PROMPTS: Record<SitKind, string[]> = {
  breath: ['Where did the breath move most easily, and where did it catch?', 'What changed between the first breath and the last?'],
  grounding: ['Where did you feel most held by the earth?', 'What did you let sink away, and what did you draw up?'],
  candle: ['What did the flame do as you watched it?', 'What stayed with you when you closed your eyes?'],
  visualisation: ['Which image was clearest, and which wouldn’t come?', 'What would you like to return to?'],
  pathworking: ['What did you meet, and what did it show or tell you?', 'Is there anything to do, give or look into now?'],
  trance: ['What came as the rhythm carried you?', 'How did the callback feel, coming back?'],
  walking: ['What did you notice underfoot and around you?', 'How did your pace change as you went?'],
  body: ['Where in your body did you feel most at ease, and where least?', 'What did your body seem to ask for?'],
  scrying: ['What shapes, colours or pictures came?', 'What do they bring to mind now?'],
  devotional: ['Did you feel a presence, or a quiet?', 'What would you like to offer or say next time?'],
  mantra: ['How did the words feel by the end?', 'Did the counting settle you, or busy you?'],
  listening: ['What did you notice in the sound, and in yourself?', 'Where did your attention go as you listened?'],
  other: ['What came up?', 'What would you keep from this sit?'],
};
export const promptsFor = (kind: SitKind) => PROMPTS[kind] ?? PROMPTS.other;

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
  /** What you brought to it, written before you began. */
  intention?: string;
  /** How you felt before and after, 1 to 5 (MOOD_WORDS). */
  before?: number;
  after?: number;
  /** The mantra or chant, and how many beads were counted (mala.ts). */
  mantra?: string;
  count?: number;
  /** Steps counted on a walking meditation. */
  steps?: number;
  /** Sat as part of a programme (programmes.ts), and which day or festival. */
  programme?: string;
  step?: string;
  /** The guidance followed (scripts.ts). */
  script?: string;
};

export type SitEntry = { id: string; createdAt?: string; data: Sit };

const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const mood = (v: unknown) => {
  const n = Math.round(Number(v));
  return n >= 1 && n <= 5 ? n : null;
};
const count = (v: unknown, max: number) => {
  const n = Math.round(Number(v));
  return n > 0 ? Math.min(n, max) : null;
};
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
    ...(text(s.intention, 300) ? { intention: text(s.intention, 300) } : {}),
    ...(mood(s.before) ? { before: mood(s.before)! } : {}),
    ...(mood(s.after) ? { after: mood(s.after)! } : {}),
    ...(text(s.mantra, 120) ? { mantra: text(s.mantra, 120) } : {}),
    ...(count(s.count, 100_000) ? { count: count(s.count, 100_000)! } : {}),
    ...(count(s.steps, 200_000) ? { steps: count(s.steps, 200_000)! } : {}),
    ...(text(s.programme, 40) ? { programme: text(s.programme, 40) } : {}),
    ...(text(s.step, 80) ? { step: text(s.step, 80) } : {}),
    ...(text(s.script, 40) ? { script: text(s.script, 40) } : {}),
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
  if (s.intention) blocks.push({ type: 'text', content: html(`Intention: ${s.intention}`) });
  if (s.before || s.after) blocks.push({ type: 'text', content: html([s.before ? `Before: ${MOOD_WORDS[s.before]} (${s.before} of 5)` : '', s.after ? `After: ${MOOD_WORDS[s.after]} (${s.after} of 5)` : ''].filter(Boolean).join(' · ')) });
  if (s.mantra || s.count) blocks.push({ type: 'text', content: html([s.mantra ? `Mantra: ${s.mantra}` : '', s.count ? `${s.count} counted` : ''].filter(Boolean).join(' · ')) });
  if (s.steps) blocks.push({ type: 'text', content: html(`${s.steps} steps`) });
  if (s.cameUp) blocks.push({ type: 'heading', content: 'What came up' }, ...s.cameUp.split(/\n\s*\n/).map((p) => ({ type: 'text', content: html(p.trim()) })));
  if (s.tags.length) blocks.push({ type: 'text', content: html(`Tags: ${s.tags.map((t) => CAME_UP_TAGS.find((x) => x.value === t)?.label ?? t).join(', ')}`) });
  if (s.note) blocks.push({ type: 'heading', content: 'Notes' }, ...s.note.split(/\n\s*\n/).map((p) => ({ type: 'text', content: html(p.trim()) })));
  return { ref: sitRef(id), title: `${kindLabel(s)} · ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, sectionTitle: MEDITATION_SECTION, blocks };
}

/** A Grimoire page already holding this sit, by its tag. */
export function findSitPage<P extends { id: string; metadata: Record<string, unknown> | null }>(pages: P[], id: string): P | null {
  return pages.find((p) => (p.metadata as { holyRef?: string } | null)?.holyRef === sitRef(id)) ?? null;
}
