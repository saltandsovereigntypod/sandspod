// Partner and coven telepathy: one person sends (looks at a target and holds
// it in mind), the others receive (write impressions, then choose). Nobody
// passes anything to anybody but a time: every screen works out where it is
// in the session from the same start time (as a public sit does,
// lib/community/sits.ts). The target is drawn on the server and kept where
// receivers cannot read it until the round's reveal time (supabase/migrations/
// 20261128000000_telepathy.sql), so no device can know it early. Scored
// against chance like the other exercises, with a breakdown by partner. Pure.

import { ESP_MODES } from './esp.ts';
import type { PsychicSession } from './log.ts';
import { DECOYS } from './remote.ts';
import { binomialP } from './stats.ts';

export type TargetType = 'symbols' | 'suits' | 'colours' | 'picture';
export type SenderMode = 'fixed' | 'alternate' | 'random';
export type SessionKind = 'pair' | 'coven';

export const TARGET_TYPES: { id: TargetType; label: string; detail: string }[] = [
  { id: 'symbols', label: 'Five symbols', detail: 'Circle, cross, waves, square or star. One in five by chance.' },
  { id: 'suits', label: 'Tarot suits', detail: 'Wands, cups, swords or pentacles. One in four by chance.' },
  { id: 'colours', label: 'Six colours', detail: 'Red, orange, yellow, green, blue or violet. One in six by chance.' },
  { id: 'picture', label: 'A picture', detail: 'A picture from the altar art, chosen among four. One in four by chance.' },
];

export const SENDER_MODES: { id: SenderMode; label: string; detail: string }[] = [
  { id: 'fixed', label: 'The same sender', detail: 'One person sends every round.' },
  { id: 'alternate', label: 'Take turns', detail: 'The sender changes each round, in turn.' },
  { id: 'random', label: 'Random', detail: 'The sender is drawn each round, so it can repeat.' },
];

export const ROUND_CHOICES = [3, 5, 8, 10, 15, 20] as const;
export const SECONDS_CHOICES = [30, 45, 60, 90, 120, 180] as const;
export const MAX_ROUNDS = 30;
export const MIN_SECONDS = 20;
export const MAX_SECONDS = 600;
/** Everyone sees the target and the results for this long after each round. */
export const REVEAL_SECONDS = 20;
export const AHEAD_DAYS = 30;
export const MAX_COVEN_PEOPLE = 30;
export const CODE_LENGTH = 8;

export const targetLabel = (t: string) => TARGET_TYPES.find((x) => x.id === t)?.label ?? 'Symbols';

/** What a receiver chooses among. Pictures come with the round's four. */
export function optionsFor(type: TargetType, pictures: readonly string[] = []): { id: string; label: string; colour?: string }[] {
  if (type === 'picture') return pictures.map((id) => ({ id, label: id.split(':').pop() ?? id }));
  return ESP_MODES.find((m) => m.id === type)?.options ?? [];
}

/** The chance of a hit on one round by luck alone. */
export const chanceFor = (type: TargetType): number => (type === 'picture' ? 1 / (DECOYS + 1) : 1 / (ESP_MODES.find((m) => m.id === type)?.options.length ?? 5));

export type TelepathySession = {
  id: string;
  host_id: string;
  kind: SessionKind;
  coven_id: string | null;
  title: string;
  target_type: TargetType;
  rounds: number;
  round_seconds: number;
  starts_at: string;
  sender_mode: SenderMode;
  host_sends: boolean;
  invite_code: string | null;
  sound: string | null;
  pool: string[] | null;
  status: 'scheduled' | 'cancelled';
  created_at: string;
};

export type Participant = { user_id: string; status: 'invited' | 'joined'; joined_at: string };

/** A round as receivers may read it: never the target. */
export type Round = { n: number; sender_id: string; options: string[] | null; starts_at: string; reveal_at: string; ends_at: string };

export type Guess = { round_n: number; user_id: string; guess: string; impressions: string | null };

// ─── Timing ────────────────────────────────────────────────────────────────

export const slotSeconds = (s: Pick<TelepathySession, 'round_seconds'>) => s.round_seconds + REVEAL_SECONDS;
export const sessionStart = (s: Pick<TelepathySession, 'starts_at'>) => Date.parse(s.starts_at);
export const sessionEnd = (s: Pick<TelepathySession, 'starts_at' | 'rounds' | 'round_seconds'>) => sessionStart(s) + s.rounds * slotSeconds(s) * 1000;

/** Round n (from 1): when it opens, when its target is shown, and when the next begins. The same on every device. */
export function roundTiming(s: Pick<TelepathySession, 'starts_at' | 'round_seconds'>, n: number) {
  const start = sessionStart(s) + (n - 1) * slotSeconds(s) * 1000;
  return { start, reveal: start + s.round_seconds * 1000, end: start + slotSeconds(s) * 1000 };
}

export type Where =
  | { phase: 'before'; msToStart: number }
  | { phase: 'round'; n: number; msLeft: number }
  | { phase: 'reveal'; n: number; msLeft: number }
  | { phase: 'done' };

/** Where the session is at a moment, from the start time alone. `reveals` lets an early reveal (everyone locked in) bring a reveal forward. */
export function whereAt(s: Pick<TelepathySession, 'starts_at' | 'rounds' | 'round_seconds'>, now: number, reveals: Readonly<Record<number, number>> = {}): Where {
  const start = sessionStart(s);
  if (now < start) return { phase: 'before', msToStart: start - now };
  if (now >= sessionEnd(s)) return { phase: 'done' };
  const n = Math.min(s.rounds, Math.floor((now - start) / (slotSeconds(s) * 1000)) + 1);
  const t = roundTiming(s, n);
  const reveal = Math.min(t.reveal, reveals[n] ?? t.reveal);
  return now < reveal ? { phase: 'round', n, msLeft: reveal - now } : { phase: 'reveal', n, msLeft: t.end - now };
}

export function clockText(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ─── Who sends ─────────────────────────────────────────────────────────────

/**
 * The sender of round n. Fixed: the chosen sender (else the first person, the
 * host). Taking turns: round 1 the first, round 2 the next, round-robin.
 * Random: drawn each round. The server draws the real senders when the session
 * begins (the rounds table); this is the same rule, to show who is due and to
 * test it. `people` are in joining order, the host first.
 */
export function senderFor(mode: SenderMode, people: readonly string[], n: number, fixed?: string | null, rng: () => number = Math.random): string {
  if (!people.length) return '';
  if (mode === 'fixed') return fixed && people.includes(fixed) ? fixed : people[0];
  if (mode === 'alternate') return people[(Math.max(1, n) - 1) % people.length];
  return people[Math.min(people.length - 1, Math.floor(rng() * people.length))];
}

/** Which rounds each person sends, when the senders are known. */
export function sendingRounds(rounds: readonly Pick<Round, 'n' | 'sender_id'>[]): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const r of rounds) (out[r.sender_id] ??= []).push(r.n);
  return out;
}

/** Receivers of a round: everyone but its sender. */
export const receiversOf = (people: readonly string[], sender: string) => people.filter((p) => p !== sender);

/** Everyone who will receive has locked in. */
export function allLockedIn(people: readonly string[], sender: string, guesses: readonly Pick<Guess, 'user_id'>[]): boolean {
  const got = new Set(guesses.map((g) => g.user_id));
  const rx = receiversOf(people, sender);
  return rx.length > 0 && rx.every((p) => got.has(p));
}

// ─── Scoring ───────────────────────────────────────────────────────────────

export type RoundResult = { n: number; sender_id: string; target: string; guesses: { user_id: string; guess: string; hit: boolean }[] };

export const isHit = (target: string, guess: string) => !!target && target === guess;

/** The revealed rounds, with each receiver's hit or miss. Rounds whose target is not yet revealed are left out. */
export function resultsOf(rounds: readonly Pick<Round, 'n' | 'sender_id'>[], targets: Readonly<Record<number, string>>, guesses: readonly Guess[]): RoundResult[] {
  return rounds
    .filter((r) => !!targets[r.n])
    .map((r) => ({
      n: r.n,
      sender_id: r.sender_id,
      target: targets[r.n],
      guesses: guesses.filter((g) => g.round_n === r.n && g.user_id !== r.sender_id).map((g) => ({ user_id: g.user_id, guess: g.guess, hit: isHit(targets[r.n], g.guess) })),
    }));
}

/** Hits and trials for one receiver. A round they did not answer counts as a trial and a miss. */
export function scoreFor(results: readonly RoundResult[], userId: string): { trials: number; hits: number } {
  let trials = 0;
  let hits = 0;
  for (const r of results) {
    if (r.sender_id === userId) continue;
    trials++;
    if (r.guesses.some((g) => g.user_id === userId && g.hit)) hits++;
  }
  return { trials, hits };
}

/** What each person got in the session: receivers' scores, and how many receivers hit while each person sent. */
export function sessionTable(results: readonly RoundResult[], people: readonly string[]) {
  return people.map((id) => {
    const rx = scoreFor(results, id);
    const sent = results.filter((r) => r.sender_id === id);
    return {
      id,
      trials: rx.trials,
      hits: rx.hits,
      sent: sent.length,
      sentTrials: sent.length * Math.max(0, people.length - 1),
      sentHits: sent.reduce((a, r) => a + r.guesses.filter((g) => g.hit).length, 0),
    };
  });
}

// ─── Keeping the session (the one record) ──────────────────────────────────

export type KeptRound = { n: number; role: 'send' | 'receive'; partner: string; partnerName: string; hit: boolean };

/** The psychic session to keep for a person, from the finished rounds. Scored for what they received; sending is recorded but not counted. */
export function keptSession(args: { sessionId: string; userId: string; type: TargetType; title: string; results: readonly RoundResult[]; names: Readonly<Record<string, string>>; kind: SessionKind }): Pick<PsychicSession, 'trials' | 'hits' | 'chance' | 'summary' | 'detail'> {
  const { sessionId, userId, type, results, names, kind } = args;
  const name = (id: string) => names[id] || 'a partner';
  const rounds: KeptRound[] = [];
  for (const r of results) {
    if (r.sender_id === userId) {
      for (const g of r.guesses) rounds.push({ n: r.n, role: 'send', partner: g.user_id, partnerName: name(g.user_id), hit: g.hit });
    } else {
      rounds.push({ n: r.n, role: 'receive', partner: r.sender_id, partnerName: name(r.sender_id), hit: r.guesses.some((g) => g.user_id === userId && g.hit) });
    }
  }
  const { trials, hits } = scoreFor(results, userId);
  const sent = results.filter((r) => r.sender_id === userId).length;
  const bits = [trials ? `${hits} of ${trials} received` : '', sent ? `${sent} sent` : ''].filter(Boolean).join(', ');
  return {
    trials,
    hits,
    chance: chanceFor(type),
    summary: `Telepathy, ${kind === 'coven' ? 'with the coven' : 'with a partner'} (${targetLabel(type).toLowerCase()}): ${bits || 'no rounds'}`,
    detail: { sessionId, title: args.title, targetType: type, kind, rounds },
  };
}

/** Whether this session was already kept (so it is kept once). */
export const alreadyKept = (entries: readonly { data: Pick<PsychicSession, 'detail'> }[], sessionId: string) => entries.some((e) => e.data.detail?.sessionId === sessionId);

export type PartnerRow = { partner: string; name: string; received: { trials: number; hits: number; expected: number; p: number }; sent: { trials: number; hits: number } };

/** Per partner across every telepathy session: what you received from them against chance (binomial p), and how often they hit when you sent. */
export function partnerBreakdown(entries: readonly { data: Pick<PsychicSession, 'kind' | 'chance' | 'detail'> }[]): PartnerRow[] {
  const map = new Map<string, { name: string; rx: { trials: number; hits: number; expected: number }; tx: { trials: number; hits: number } }>();
  for (const e of entries) {
    if (e.data.kind !== 'telepathy') continue;
    const rounds = Array.isArray(e.data.detail?.rounds) ? (e.data.detail.rounds as Partial<KeptRound>[]) : [];
    for (const r of rounds) {
      if (!r.partner || (r.role !== 'send' && r.role !== 'receive')) continue;
      const cur = map.get(r.partner) ?? { name: r.partnerName || 'a partner', rx: { trials: 0, hits: 0, expected: 0 }, tx: { trials: 0, hits: 0 } };
      if (r.partnerName) cur.name = r.partnerName;
      const side = r.role === 'receive' ? cur.rx : cur.tx;
      side.trials++;
      if (r.hit) side.hits++;
      if (r.role === 'receive') cur.rx.expected += e.data.chance;
      map.set(r.partner, cur);
    }
  }
  return [...map.entries()]
    .map(([partner, v]) => {
      const meanChance = v.rx.trials ? v.rx.expected / v.rx.trials : 0.2;
      return { partner, name: v.name, received: { ...v.rx, p: binomialP(v.rx.hits, v.rx.trials, meanChance) }, sent: v.tx };
    })
    .sort((a, b) => b.received.trials + b.sent.trials - (a.received.trials + a.sent.trials) || a.name.localeCompare(b.name));
}

// ─── Making a session ──────────────────────────────────────────────────────

export type Draft = {
  kind: SessionKind;
  covenId: string | null;
  title: string;
  target: TargetType;
  rounds: number;
  seconds: number;
  startsAt: Date | null;
  senderMode: SenderMode;
  /** A pair with a fixed sender: the host sends (else the partner does). */
  hostSends: boolean;
  sound: string;
  /** The picture ids to draw from (pictures only). */
  pool: string[];
};

/** The row to insert, or what is wrong. Starting "now" is a minute and a half ahead, so everyone has time to open it. */
export function draftPayload(d: Draft, now: Date): { ok: true; row: Record<string, unknown> } | { ok: false; error: string } {
  if (d.kind === 'coven' && !d.covenId) return { ok: false, error: 'Choose which coven.' };
  const rounds = Math.round(d.rounds);
  if (!(rounds >= 1 && rounds <= MAX_ROUNDS)) return { ok: false, error: `Choose 1 to ${MAX_ROUNDS} rounds.` };
  const seconds = Math.round(d.seconds);
  if (!(seconds >= MIN_SECONDS && seconds <= MAX_SECONDS)) return { ok: false, error: `Choose ${MIN_SECONDS} to ${MAX_SECONDS} seconds a round.` };
  const at = (d.startsAt ?? new Date(now.getTime() + 90_000)).getTime();
  if (d.target === 'picture' && d.pool.length < 8) return { ok: false, error: 'There are not enough pictures to draw from.' };
  if (!Number.isFinite(at) || at < now.getTime() + 60_000) return { ok: false, error: 'Choose a start at least a minute from now.' };
  if (at > now.getTime() + AHEAD_DAYS * 86400_000) return { ok: false, error: `Choose a start within ${AHEAD_DAYS} days.` };
  return {
    ok: true,
    row: {
      kind: d.kind,
      coven_id: d.kind === 'coven' ? d.covenId : null,
      title: d.title.trim().slice(0, 80),
      target_type: d.target,
      rounds,
      round_seconds: seconds,
      starts_at: new Date(at - (at % 1000)).toISOString(),
      sender_mode: d.senderMode,
      host_sends: d.hostSends,
      sound: d.sound || null,
      pool: d.target === 'picture' ? d.pool : null,
    },
  };
}

/** Start choices: in a minute and a half, a quarter of an hour on, and set times ahead. */
export function startOptions(now: Date): { label: string; at: Date | null }[] {
  const out: { label: string; at: Date | null }[] = [{ label: 'Now (in a minute and a half)', at: null }];
  const q = new Date(now.getTime());
  q.setSeconds(0, 0);
  q.setMinutes(Math.ceil((q.getMinutes() + 10) / 15) * 15);
  const add = (at: Date) => {
    const day = at.toDateString() === now.toDateString() ? 'Today' : at.toDateString() === new Date(now.getTime() + 86400_000).toDateString() ? 'Tomorrow' : at.toLocaleDateString(undefined, { weekday: 'short' });
    out.push({ label: `${day} ${at.getHours()}:${String(at.getMinutes()).padStart(2, '0')}`, at });
  };
  add(q);
  add(new Date(q.getTime() + 3600_000));
  for (const [off, hour] of [[0, 20], [1, 8], [1, 20]] as const) {
    const d = new Date(now.getTime() + off * 86400_000);
    d.setHours(hour, 0, 0, 0);
    if (d.getTime() > q.getTime() + 3600_000) add(d);
  }
  return out;
}

export const sessionMinutes = (d: { rounds: number; round_seconds: number }) => Math.ceil((d.rounds * (d.round_seconds + REVEAL_SECONDS)) / 60);

/** "Pair, 8 rounds of 60 seconds, about 11 minutes". */
export const sessionLine = (s: Pick<TelepathySession, 'kind' | 'rounds' | 'round_seconds'>) => `${s.kind === 'coven' ? 'Coven' : 'Pair'}, ${s.rounds} rounds of ${s.round_seconds} seconds, about ${sessionMinutes(s)} minutes`;

export const cleanCode = (raw: string) => raw.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, CODE_LENGTH);

/** The words to share for a pair invitation. */
export const inviteText = (code: string) => `Join me for a telepathy session in Salt & Sovereignty. In the app, open Practice, Craft, Psychic development, Telepathy, choose "Join with a code" and enter ${code}.`;
