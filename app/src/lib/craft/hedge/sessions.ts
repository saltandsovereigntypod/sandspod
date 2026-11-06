// Spirit sessions: a log of times you sat to speak with an ancestor, a deity,
// a spirit of place or a guide, by pendulum, spirit board, scrying,
// mediumship or trance. Who came (or was called), how you opened and
// closed, what protected you, the questions and answers, your impressions,
// and the part most logs leave out: checking later whether what was said
// bore out. A record kept honestly shows its own pattern over time.
//
// Kept as craft entries (collection hedge.spiritSessions). Pure, so it can
// be tested and shared with the website (js/core/spirit.js).

import { moonState, type PhaseName } from '../../moon.ts';
import { dateFromKey, localDateKey } from '../../rituals/lifecycle.ts';

export const SPIRIT_SESSIONS = 'hedge.spiritSessions';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export type SessionMethod = 'pendulum' | 'board' | 'scrying' | 'mediumship' | 'trance' | 'writing' | 'cards' | 'other';

export type MethodGuide = { id: SessionMethod; label: string; how: string; history: string; care: string };

export const SESSION_METHODS: MethodGuide[] = [
  {
    id: 'pendulum',
    label: 'Pendulum',
    how: 'Hold the chain still over a board or your palm, ask it first to show yes, no and “not to say”, and keep questions to ones it can answer that way.',
    history: 'Swinging rings and pendulums for answers is old folk practice; dowsing with them became popular in France in the early twentieth century. Since William Carpenter (1852), small unconscious movements of the hand, the ideomotor effect, have been the usual explanation. Many practitioners work with it as a voice of the deeper self, and that is honest enough.',
    care: 'Don’t ask it about health, pregnancy or money decisions you would act on without other advice.',
  },
  {
    id: 'board',
    label: 'Spirit board',
    how: 'Fingers rest lightly on the planchette. One person asks; one writes down each letter. Begin with greetings and simple questions; say goodbye and move the planchette to GOODBYE to close.',
    history: 'Talking boards grew out of nineteenth-century Spiritualism; the Ouija board was patented in 1890–91 and sold as a parlour game. Its fearsome reputation is largely twentieth-century, much of it from film. The ideomotor effect explains the planchette’s movement for most researchers.',
    care: 'Not alone, not drunk or high, not when grieving raw or frightened. If messages turn cruel, frightening or flattering-and-demanding, close at once.',
  },
  {
    id: 'scrying',
    label: 'Scrying',
    how: 'A dark mirror, a bowl of water, a crystal or a flame, in low light. Soften your gaze, breathe slowly, and let images come without reaching for them. Note everything, even what seems nothing.',
    history: 'Scrying is ancient and widespread. John Dee and Edward Kelley’s sessions in the 1580s, with a crystal and a polished obsidian mirror from Mexico (now in the British Museum), are the best-recorded in English.',
    care: 'Keep sessions short (twenty minutes is plenty to begin) and come back with food and fresh air.',
  },
  {
    id: 'mediumship',
    label: 'Mediumship',
    how: 'Sit quietly, open to one you’ve called by name, and speak or write what comes: impressions, words, images, feelings in the body.',
    history: 'Modern mediumship begins with the Fox sisters in New York in 1848 and the Spiritualist movement that followed; much older is the need to hear from the dead, found in nearly every culture.',
    care: 'Keep facts you can check apart from feelings. Grief makes us want answers; let the record show what bore out.',
  },
  {
    id: 'trance',
    label: 'Trance or journeying',
    how: 'Rhythm (a drum, a rattle, steady breath) or a guided path takes you inward to meet who comes. Go with an intention and a way back marked before you start.',
    history: 'Many cultures keep trance practices of their own. Some are closed or living traditions (Siberian and Native American practices among them) and belong to their people: work in a way that is your own, or one you have been taught and given leave to use.',
    care: 'Have a set ending (a callback drumbeat or a timer). Don’t journey if you are unwell in mind, and stop if it stops feeling like your choice.',
  },
  {
    id: 'writing',
    label: 'Automatic writing',
    how: 'Pen on paper, a question at the top, and let the hand move without steering. Read it after, not during.',
    history: 'A Spiritualist favourite from the 1850s; W. B. Yeats’s wife George wrote thousands of pages this way from 1917, the ground of his book A Vision.',
    care: 'As with the board: if the writing turns harsh or controlling, stop and close.',
  },
  {
    id: 'cards',
    label: 'Cards or runes, to a spirit',
    how: 'Ask the one you’ve called to choose the cards. Lay them as you would for yourself, and read them as their reply.',
    history: 'A modern use of old tools; many readers now work this way with ancestors and deities.',
    care: 'Log the cards drawn in Divination too, so the reading and the session meet.',
  },
  {
    id: 'other',
    label: 'Another way',
    how: 'However you listen: sitting at a grave, a dream incubated for them, a walk with a question.',
    history: '',
    care: '',
  },
];
export const sessionMethodLabel = (id: string) => SESSION_METHODS.find((m) => m.id === id)?.label ?? 'A session';

export type WhoKind = 'ancestor' | 'deity' | 'place' | 'guide' | 'familiar' | 'unknown';
export const WHO_KINDS: { id: WhoKind; label: string }[] = [
  { id: 'ancestor', label: 'An ancestor' },
  { id: 'deity', label: 'A deity' },
  { id: 'place', label: 'A spirit of place' },
  { id: 'guide', label: 'A guide or helping spirit' },
  { id: 'familiar', label: 'A familiar' },
  { id: 'unknown', label: 'Unknown, or whoever came' },
];

export type Protection = 'ground' | 'cleanse' | 'circle' | 'salt' | 'candle' | 'ward' | 'named' | 'ally' | 'time' | 'witness';
export const PROTECTIONS: { id: Protection; label: string }[] = [
  { id: 'ground', label: 'Grounded and centred first' },
  { id: 'cleanse', label: 'Cleansed the space' },
  { id: 'circle', label: 'Cast a circle' },
  { id: 'salt', label: 'Salt at the threshold' },
  { id: 'candle', label: 'A candle lit for the work' },
  { id: 'ward', label: 'Amulet or ward' },
  { id: 'named', label: 'Called only the one named' },
  { id: 'ally', label: 'A deity or guide asked to stand by' },
  { id: 'time', label: 'A set time to end' },
  { id: 'witness', label: 'Someone else present' },
];

export type Check = 'pending' | 'yes' | 'partly' | 'no' | 'cannot';
export const CHECKS: { id: Check; label: string }[] = [
  { id: 'pending', label: 'Not checked yet' },
  { id: 'yes', label: 'Bore out' },
  { id: 'partly', label: 'Partly' },
  { id: 'no', label: 'Didn’t' },
  { id: 'cannot', label: 'Can’t be checked' },
];

export type Exchange = { q: string; a: string; check: Check; checkNote: string };

export type After = 'well' | 'tired' | 'unsettled' | 'drained' | '';
export const AFTERS: { id: Exclude<After, ''>; label: string }[] = [
  { id: 'well', label: 'Well, settled' },
  { id: 'tired', label: 'Tired' },
  { id: 'unsettled', label: 'Unsettled' },
  { id: 'drained', label: 'Drained' },
];

/** Who the session was with, when they're kept elsewhere in the app. */
export type SessionLink = { kind: 'ancestor' | 'deity' | 'place-spirit' | 'familiar'; id: string; title: string };

export type SpiritSession = {
  date: string;
  method: SessionMethod;
  who: string;
  whoKind: WhoKind;
  link: SessionLink | null;
  intention: string;
  protections: Protection[];
  opening: string;
  closing: string;
  /** Did you close it fully? */
  closed: boolean;
  exchanges: Exchange[];
  impressions: string;
  after: After;
  aftercare: string;
  moonPhase: PhaseName;
};

const at9pm = (key: string) => {
  const d = dateFromKey(key) ?? new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 21);
};

/** Suggested opening and closing words, to change as you like. */
export function defaultOpening(method: SessionMethod): string {
  const sit = method === 'board' ? 'Hands on the planchette.' : method === 'pendulum' ? 'Pendulum held still; yes, no and “not to say” shown.' : method === 'trance' ? 'Drum or breath begun; the way back marked.' : 'Sitting quietly.';
  return `Grounded: breath down into the earth. Space cleansed and a candle lit. ${sit} “I call only on [name], who comes in kindness. Anything else, pass by.”`;
}
export function defaultClosing(method: SessionMethod): string {
  const end = method === 'board' ? 'Planchette to GOODBYE, board closed and put away.' : method === 'trance' ? 'Back along the way I came, counted up and out.' : method === 'scrying' ? 'Mirror covered, water poured onto earth.' : 'Tools put away.';
  return `“Thank you, [name]. This conversation is closed; go in peace.” ${end} Candle snuffed. Ate, drank water, touched the ground.`;
}

export function blankSession(now: Date, method: SessionMethod = 'pendulum'): SpiritSession {
  const date = localDateKey(now);
  return {
    date,
    method,
    who: '',
    whoKind: 'ancestor',
    link: null,
    intention: '',
    protections: ['ground', 'named'],
    opening: defaultOpening(method),
    closing: defaultClosing(method),
    closed: true,
    exchanges: [],
    impressions: '',
    after: '',
    aftercare: '',
    moonPhase: moonState(at9pm(date)).name,
  };
}

function readLink(raw: unknown): SessionLink | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!['ancestor', 'deity', 'place-spirit', 'familiar'].includes(String(r.kind)) || typeof r.id !== 'string' || !r.id) return null;
  return { kind: r.kind as SessionLink['kind'], id: r.id, title: str(r.title) };
}

export function normalizeSession(raw: unknown): SpiritSession {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const date = dateFromKey(str(r.date)) ? str(r.date) : localDateKey(new Date());
  const method = SESSION_METHODS.some((m) => m.id === r.method) ? (r.method as SessionMethod) : 'other';
  const exchanges = (Array.isArray(r.exchanges) ? r.exchanges : [])
    .map((x) => (x && typeof x === 'object' ? (x as Record<string, unknown>) : {}))
    .map((x) => ({ q: str(x.q), a: str(x.a), check: (CHECKS.some((c) => c.id === x.check) ? x.check : 'pending') as Check, checkNote: str(x.checkNote) }))
    .filter((x) => x.q.trim() || x.a.trim())
    .slice(0, 60);
  return {
    date,
    method,
    who: str(r.who),
    whoKind: WHO_KINDS.some((w) => w.id === r.whoKind) ? (r.whoKind as WhoKind) : 'unknown',
    link: readLink(r.link),
    intention: str(r.intention),
    protections: Array.isArray(r.protections) ? (r.protections.filter((p) => PROTECTIONS.some((x) => x.id === p)) as Protection[]) : [],
    opening: str(r.opening),
    closing: str(r.closing),
    closed: r.closed !== false,
    exchanges,
    impressions: str(r.impressions),
    after: AFTERS.some((a) => a.id === r.after) ? (r.after as After) : '',
    aftercare: str(r.aftercare),
    moonPhase: moonState(at9pm(date)).name,
  };
}

export const sessionTitle = (s: SpiritSession) => `${s.who.trim() || 'Whoever came'}, by ${sessionMethodLabel(s.method).toLowerCase()}`;

/** Answers still waiting to be checked, across sessions, oldest first. */
export function toVerify<T extends { id: string; data: SpiritSession }>(sessions: T[]): { id: string; date: string; who: string; index: number; q: string; a: string }[] {
  const out: { id: string; date: string; who: string; index: number; q: string; a: string }[] = [];
  for (const s of sessions) s.data.exchanges.forEach((x, index) => x.check === 'pending' && x.a.trim() && out.push({ id: s.id, date: s.data.date, who: s.data.who, index, q: x.q, a: x.a }));
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** What's been checked, and how much bore out: the honest tally. */
export function verifyTally(sessions: { data: SpiritSession }[]): { checked: number; yes: number; partly: number; no: number; rate: number | null } {
  let yes = 0;
  let partly = 0;
  let no = 0;
  for (const s of sessions)
    for (const x of s.data.exchanges) {
      if (x.check === 'yes') yes++;
      else if (x.check === 'partly') partly++;
      else if (x.check === 'no') no++;
    }
  const checked = yes + partly + no;
  return { checked, yes, partly, no, rate: checked ? Math.round(((yes + partly / 2) / checked) * 100) : null };
}

/** Gentle flags for a session: not closed, no grounding, came away drained. */
export function sessionCautions(s: SpiritSession): string[] {
  const out: string[] = [];
  if (!s.closed) out.push('This session wasn’t closed fully. Close it now, even late: say so aloud, snuff a candle, put the tools away and wash your hands.');
  if (!s.protections.includes('ground')) out.push('Grounding before and after makes the biggest difference to how you feel afterwards.');
  if (s.after === 'drained' || s.after === 'unsettled') out.push('You came away drained or unsettled. Eat, drink water, get outside, and leave a few days before the next session. If it lingers, talk to someone you trust.');
  return out;
}

export const SESSION_SAFETY: { title: string; text: string }[] = [
  { title: 'Before', text: 'Ground (breath into the earth, feet on the floor), cleanse the space, decide who you are calling and how you’ll end. Not when you’re drunk, high, exhausted, or newly and rawly bereaved.' },
  { title: 'During', text: 'Speak only with the one you called. Be courteous and plain; don’t make promises. Keep a timer.' },
  { title: 'Closing', text: 'Thank them, say clearly that the conversation is closed, put the tools away, snuff the candle. Then eat, drink water and touch the ground.' },
  {
    title: 'When to stop',
    text: 'Stop at once if messages turn threatening, cruel, flattering-and-demanding, or tell you to harm yourself or anyone, or to keep secrets from the people who love you. Stop, too, if you feel frightened, or if voices, presences or compulsions carry on outside your sessions. That last is a reason to see a doctor; it isn’t a failing, and many practitioners have done exactly that.',
  },
  { title: 'Grief', text: 'Reaching for someone you’ve lost is as old as love. Let it comfort, and let the record keep you honest about what you heard and what you hoped.' },
];
