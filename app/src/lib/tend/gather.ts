// Gathering everything you tend into one list (model.ts): from your saved
// altars (petitions in the box, candles, offerings and potted plants), your
// covens (petitions you asked or have held, what you wrote in a ritual and
// are holding, what a rite asks you to write before it, mentees waiting for
// a check-in), your journeys and your "Did it work?" days. Each client loads
// the rows (the app's lib/tend/store.ts, the website's today/tend/tend.js)
// and hands them here, so both show the same list. Pure.
//
// Privacy: what you wrote in a coven ritual comes from your own rows only
// (the database shows no one else's), so a sealed one is only ever on its
// writer's list.

import { candleLife, isCandle, isLit, parseLivingState } from '../altar/livingState.ts';
import { offeringsDue } from '../altar/offerings.ts';
import { isOpen, releaseDue, type Petition } from '../altar/petitions.ts';
import { wateringDue } from '../altar/pottedPlants.ts';
import { documentFromAltar } from '../altar/snapshot.ts';
import type { SavedAltar, SavedObject } from '../altar/types.ts';
import { itemLookBack, type ApothecaryLike } from '../altar/apothecaryLookBack.ts';
import { cleanContribution, contributionNote, kindOf, ownerActions, ritualTasks, type ContributionFate, type ContributionKind, type ContributionStatus, type ContributionVisibility } from '../covens/contributions.ts';
import { assigneesOf } from '../covens/picker.ts';
import { CHECKIN_DAYS } from '../covens/record.ts';
import { readLookBack } from '../rituals/lookBack.ts';
import type { TendEnd, Tendable, TendAction } from './model.ts';

const DAY = 86_400_000;
const shortDay = (iso: string | number | null | undefined) => {
  const d = iso == null || iso === '' ? null : new Date(iso);
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '';
};
const fromKey = (key: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
const time = (ms: number) => new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const shorten = (text: string, n = 80) => (text.length > n ? `${text.slice(0, n - 1).trimEnd()}…` : text);
const altarWhere = (name: string) => `Your altar · ${name.trim() || 'Untitled altar'}`;
const parsed = (iso: string | null | undefined) => (iso ? Date.parse(iso) || null : null);

// ─── Your altars ─────────────────────────────────────────────────────────

export type AltarPart = {
  altars: SavedAltar[];
  /** The petition box (craft collection `altar.petitions`). */
  petitions: { id: string; data: Petition }[];
};

const objectKey = (altarId: string, objectId: string) => `${altarId}:${objectId}`;

export function altarTendables({ altars, petitions }: AltarPart, now: Date): Tendable[] {
  const out: Tendable[] = [];
  const docs = altars.map((a) => ({ altar: a, doc: documentFromAltar(a) }));
  const findAltar = (id: string) => docs.find((d) => d.altar.id === id);
  const underPetition = new Set<string>();

  for (const entry of petitions) {
    const p = entry.data;
    if (!p || !isOpen(p)) continue;
    const here = findAltar(p.altarId);
    if (!here) continue;
    const candle = p.candleId ? here.doc.objects.find((o) => o.altarObjectId === p.candleId) : undefined;
    if (candle) underPetition.add(objectKey(here.altar.id, p.candleId));
    const lit = !!candle && isLit(candle);
    const canLight = !!candle && !lit && !candleLife(candle, now).spent;
    const release = p.status === 'scheduled' ? parsed(p.releaseOn) : null;
    const timed = p.timingAt ? parsed(p.timingAt) : null;
    const detail = p.status === 'scheduled'
      ? releaseDue(p, now)
        ? `To be released tonight${p.releaseWhy ? `: ${p.releaseWhy.toLowerCase()}` : ''}`
        : `To be released ${shortDay(p.releaseOn)}${p.releaseWhy ? `, ${p.releaseWhy.toLowerCase()}` : ''}`
      : candle
        ? lit
          ? `Folded under ${shorten(String(candle.label || 'its candle'), 40)}, which is burning`
          : `Folded under ${shorten(String(candle.label || 'its candle'), 40)}`
        : 'In the petition box';
    const actions: TendAction[] = [...(canLight ? (['light'] as TendAction[]) : []), 'word', 'open'];
    out.push({
      key: `petition:${entry.id}`,
      kind: 'petition',
      group: 'altar',
      title: p.title || 'My petition',
      detail,
      source: altarWhere(here.altar.name),
      // Its night to be released, or the moon it was timed for, is the day it asks for.
      dueAt: release ?? (timed && timed > now.getTime() ? timed : null),
      tendedAt: candle ? parsed(parseLivingState(candle)?.candle?.lastLitAt) : null,
      actions,
      ends: ['burned', 'buried', 'released'],
      private: true,
      keywords: [p.intention, p.words].filter(Boolean).map((w) => shorten(w, 200)),
      href: `/altar/${here.altar.id}`,
      webHref: '/altar/',
      ref: { entryId: entry.id, altarId: here.altar.id, candleId: candle ? String(p.candleId) : '' },
    });
  }

  for (const { altar, doc } of docs) {
    for (const object of doc.objects) {
      if (!isCandle(object) || !object.altarObjectId) continue;
      const id = String(object.altarObjectId);
      if (underPetition.has(objectKey(altar.id, id))) continue;
      const life = candleLife(object, now);
      if (life.spent) continue;
      const lit = isLit(object);
      // A candle part-burned and waiting to be lit again is a working to come back to.
      const working = !lit && life.burnedMs > 0;
      if (!lit && !working) continue;
      const left = life.remainingMs;
      const detail = lit
        ? life.burnoutAt
          ? `Burning · it burns down ${life.burnoutAt - now.getTime() < DAY ? `at ${time(life.burnoutAt)}` : shortDay(life.burnoutAt)}`
          : 'Burning'
        : Number.isFinite(left)
          ? `Waiting to be lit again · about ${Math.max(1, Math.round(left / 3_600_000))} hours left in it`
          : 'Waiting to be lit again';
      out.push({
        key: `candle:${altar.id}:${id}`,
        kind: 'candle',
        group: 'altar',
        title: shorten(String(object.label || 'A candle'), 60),
        detail,
        source: altarWhere(altar.name),
        // A burning candle asks to be watched as it burns down today.
        dueAt: lit && life.burnoutAt ? life.burnoutAt : null,
        tendedAt: parsed(parseLivingState(object)?.candle?.lastLitAt),
        actions: [lit ? 'snuff' : 'light', 'word', 'open'],
        ends: ['let-go'],
        private: true,
        keywords: [String(object.plaqueText || '')].filter(Boolean),
        href: `/altar/${altar.id}`,
        webHref: '/altar/',
        ref: { altarId: altar.id, objectId: id },
      });
    }
  }

  const altarDocs = docs.map(({ altar, doc }) => ({ id: altar.id, name: altar.name, objects: doc.objects }));
  for (const due of offeringsDue(altarDocs, now.getTime(), now.getTime() + 14 * DAY)) {
    if (!due.objectId) continue;
    const name = altars.find((a) => a.id === due.altarId)?.name ?? '';
    const past = due.dueAt <= now.getTime();
    out.push({
      key: `offering:${due.altarId}:${due.objectId}`,
      kind: 'offering',
      group: 'altar',
      title: due.what.charAt(0).toUpperCase() + due.what.slice(1),
      detail: past ? `${due.stage.name}: ${due.stage.says}` : `Fresh until ${shortDay(due.dueAt)}`,
      source: altarWhere(name),
      dueAt: due.dueAt,
      tendedAt: null,
      actions: ['refresh', 'word', 'open'],
      ends: ['returned'],
      private: true,
      keywords: ['offering', due.kind],
      href: `/altar/${due.altarId}`,
      webHref: '/altar/',
      ref: { altarId: due.altarId, objectId: due.objectId },
    });
  }

  for (const due of wateringDue(altarDocs, now.getTime(), now.getTime() + 14 * DAY)) {
    if (!due.objectId) continue;
    const name = altars.find((a) => a.id === due.altarId)?.name ?? '';
    out.push({
      key: `plant:${due.altarId}:${due.objectId}`,
      kind: 'plant',
      group: 'altar',
      title: due.who.charAt(0).toUpperCase() + due.who.slice(1),
      detail: due.dueAt <= now.getTime() ? 'Would like water' : `Would like water ${shortDay(due.dueAt)}`,
      source: altarWhere(name),
      dueAt: due.dueAt,
      tendedAt: null,
      actions: ['water', 'word', 'open'],
      ends: [],
      private: true,
      keywords: ['plant', 'water', 'pot'],
      href: `/altar/${due.altarId}`,
      webHref: '/altar/',
      ref: { altarId: due.altarId, objectId: due.objectId },
    });
  }
  return out;
}

// ─── Your covens ─────────────────────────────────────────────────────────

export type CovenRow = { id: string; slug: string; name: string };
export type CovenPetitionRow = { id: string; coven_id: string; user_id: string; title: string; body: string | null; color: string; status: string; last_tended_at: string | null; altar_id?: string | null; source_ritual_id?: string | null; created_at: string };
export type TendingRow = { petition_id: string; user_id: string; note: string | null; created_at: string };
/** Your own contributions, as row-level security gives them to you (never anyone else's). */
export type MyContribution = {
  id: string;
  step_id: string;
  ritual_id: string;
  coven_id: string;
  kind: ContributionKind;
  body: string | null;
  private: boolean;
  anonymous: boolean;
  visibility: ContributionVisibility;
  fate: ContributionFate;
  status: ContributionStatus;
  petition_id: string | null;
  updated_at: string;
  created_at: string;
};
export type RitualRow = { id: string; coven_id: string; title: string; status: string; scheduled_for: string | null; created_at?: string | null };
export type StepRow = { id: string; ritual_id: string; title: string; contribution?: unknown; assignees?: unknown; assigned_user_id?: string | null; assigned_rank_id?: string | null };
export type MembershipRow = { coven_id: string; user_id: string; rank_id: string | null; status: 'active' | 'left' | 'removed' | 'banned' };
export type MentorshipRow = { coven_id: string; user_id: string; mentor_id: string; assigned_at: string };
export type CheckinRow = { coven_id: string; user_id: string; mentor_id: string; met_on: string };

export type CovenPart = {
  userId: string;
  covens: CovenRow[];
  memberships: MembershipRow[];
  /** Open petitions you asked or have tended. */
  petitions: CovenPetitionRow[];
  /** Your own tendings. */
  tendings: TendingRow[];
  contributions: MyContribution[];
  rituals: RitualRow[];
  steps: StepRow[];
  /** Mentorships where you are the mentor, and your check-ins. */
  mentorships: MentorshipRow[];
  checkins: CheckinRow[];
  nameOf: (userId: string) => string;
};

const covenHref = (slug: string, rest = '') => `/coven/c/${slug}${rest ? `/${rest}` : ''}`;
const covenWeb = (slug: string, tab = '', extra = '') => `/covens/coven/?c=${encodeURIComponent(slug)}${tab ? `&tab=${tab}` : ''}${extra}`;

export function covenTendables(part: CovenPart, now: Date): Tendable[] {
  const out: Tendable[] = [];
  const covenOf = (id: string) => part.covens.find((c) => c.id === id);
  const many = part.covens.length > 1;
  const where = (covenId: string, ritual?: RitualRow | null) => {
    const coven = covenOf(covenId);
    const head = many ? coven?.name ?? 'Coven' : 'Coven';
    if (!ritual) return head;
    const day = shortDay(ritual.scheduled_for ?? ritual.created_at ?? null);
    return `${head} · ${ritual.title}${day ? `, ${day}` : ''}`;
  };
  const ritualOf = (id: string | null | undefined) => (id ? part.rituals.find((r) => r.id === id) ?? null : null);

  for (const p of part.petitions) {
    if (p.status !== 'open') continue;
    const coven = covenOf(p.coven_id);
    if (!coven) continue;
    const mine = p.user_id === part.userId;
    const myTendings = part.tendings.filter((t) => t.petition_id === p.id && t.user_id === part.userId);
    if (!mine && !myTendings.length) continue;
    const last = myTendings.reduce((at, t) => Math.max(at, Date.parse(t.created_at) || 0), 0) || null;
    // The database lets you tend it once every twelve hours.
    const rested = !last || now.getTime() - last >= 12 * 3_600_000;
    const lastAny = parsed(p.last_tended_at);
    out.push({
      key: `coven-petition:${p.id}`,
      kind: 'coven-petition',
      group: 'coven',
      title: p.title,
      detail: [mine ? 'You asked the circle to hold it' : `Asked by ${part.nameOf(p.user_id)}. You’ve held it`, lastAny ? `last tended ${shortDay(lastAny)}` : ''].filter(Boolean).join(' · '),
      source: where(p.coven_id, ritualOf(p.source_ritual_id)),
      dueAt: null,
      tendedAt: last,
      actions: [...(rested ? (['tend'] as TendAction[]) : []), 'open'],
      ends: mine ? ['answered', 'closed'] : ['let-go'],
      private: false,
      keywords: [p.body ?? '', coven.name].filter(Boolean).map((w) => shorten(w, 200)),
      href: covenHref(coven.slug, 'petitions'),
      webHref: covenWeb(coven.slug, 'petitions'),
      ref: { petitionId: p.id, covenId: p.coven_id, altarId: p.altar_id ?? '', color: p.color, mine: mine ? '1' : '' },
    });
  }

  for (const c of part.contributions) {
    // Only your own, still held. One that became a coven petition is tended as that petition.
    const held = c.status === 'held' || ((c.status === 'offered' || c.status === 'written') && c.fate === 'petition' && !c.petition_id);
    if (!held || c.petition_id) continue;
    const coven = covenOf(c.coven_id);
    if (!coven) continue;
    const ritual = ritualOf(c.ritual_id);
    const actions = ownerActions({ mine: true, status: c.status, petition_id: c.petition_id });
    const noun = kindOf(c.kind).noun;
    out.push({
      key: `contribution:${c.id}`,
      kind: 'contribution',
      group: 'coven',
      title: c.body ? shorten(c.body.replace(/\s+/g, ' ').trim(), 70) : `Your ${noun}`,
      detail: `Your ${noun}${c.private ? ', sealed. Only you can read it' : ''}. ${c.status === 'held' ? 'You are holding it' : 'Offered in the ritual'}`,
      source: where(c.coven_id, ritual),
      dueAt: null,
      tendedAt: parsed(c.updated_at),
      actions: ['tend', 'word', 'open'],
      ends: actions.includes('answered') ? ['answered', 'closed'] : ['closed'],
      private: c.private || c.visibility === 'me',
      keywords: [noun, coven.name],
      href: covenHref(coven.slug, `ritual/${c.ritual_id}`),
      webHref: covenWeb(coven.slug, 'rituals', `&ritual=${encodeURIComponent(c.ritual_id)}`),
      ref: { contributionId: c.id, status: c.status },
    });
  }

  // What a rite asks you to write or bring before it, not done yet.
  const done = part.contributions.map((c) => ({ step_id: c.step_id, mine: true }));
  for (const coven of part.covens) {
    const membership = part.memberships.find((m) => m.coven_id === coven.id && m.user_id === part.userId) ?? null;
    const rituals = part.rituals.filter((r) => r.coven_id === coven.id);
    for (const task of ritualTasks(rituals, part.steps, done, membership, part.userId, assigneesOf)) {
      const step = part.steps.find((s) => s.id === task.stepId);
      const ask = cleanContribution(step?.contribution);
      if (!ask) continue;
      const start = parsed(task.scheduledFor);
      const writes = kindOf(ask.kind).verb === 'write';
      out.push({
        key: `coven-task:${task.stepId}`,
        kind: 'coven-task',
        group: 'coven',
        title: task.title,
        detail: [ask.prompt ?? '', contributionNote(ask)].filter(Boolean).join(' '),
        source: where(coven.id, part.rituals.find((r) => r.id === task.ritualId)),
        // Two days before the rite, as its reminder rings.
        dueAt: start ? Math.max(now.getTime() - 1, start - 2 * DAY) : null,
        tendedAt: null,
        actions: writes ? ['write', 'open'] : ['open'],
        ends: [],
        private: false,
        keywords: [task.stepTitle, task.ritualTitle, coven.name],
        href: covenHref(coven.slug, `ritual/${task.ritualId}`),
        webHref: covenWeb(coven.slug, 'rituals', `&ritual=${encodeURIComponent(task.ritualId)}`),
        ref: { stepId: task.stepId, ritualId: task.ritualId, kind: ask.kind, visibility: ask.visibility },
      });
    }
  }

  // Mentees waiting for a check-in (every six weeks or so).
  for (const m of part.mentorships) {
    if (m.mentor_id !== part.userId) continue;
    const coven = covenOf(m.coven_id);
    if (!coven) continue;
    const last = part.checkins
      .filter((c) => c.coven_id === m.coven_id && c.user_id === m.user_id && c.mentor_id === part.userId)
      .reduce<string | null>((at, c) => (!at || c.met_on > at ? c.met_on : at), null);
    const from = last ? fromKey(last.slice(0, 10)) ?? new Date(last) : new Date(m.assigned_at);
    const dueAt = from.getTime() + CHECKIN_DAYS * DAY;
    const name = part.nameOf(m.user_id);
    out.push({
      key: `checkin:${m.coven_id}:${m.user_id}`,
      kind: 'checkin',
      group: 'coven',
      title: `Check in with ${name}`,
      detail: last ? `Last check-in ${shortDay(from.getTime())}` : 'No check-ins yet',
      source: where(m.coven_id),
      dueAt,
      tendedAt: last ? from.getTime() : null,
      actions: ['checkin', 'open'],
      ends: [],
      private: false,
      keywords: [name, 'mentor', 'mentee', coven.name],
      href: covenHref(coven.slug, `record/${m.user_id}`),
      webHref: covenWeb(coven.slug, 'record', `&member=${encodeURIComponent(m.user_id)}`),
      ref: { covenId: m.coven_id, userId: m.user_id },
    });
  }
  return out;
}

// ─── Your journeys ───────────────────────────────────────────────────────

/** A journey begun, with what's next (journeys/progress.ts nextSteps), worked out by the caller. */
export type JourneyPart = {
  entryId: string;
  journeyId: string;
  title: string;
  steps: (
    | { kind: 'practice'; practice: { id: string; title: string; summary?: string }; state: { count: number; times: number } }
    | { kind: 'waiting'; nextAt: Date | null; nextName: string | null; practice: { id: string; title: string } | null }
    | { kind: string }
  )[];
};

export function journeyTendables(journeys: JourneyPart[], now: Date): Tendable[] {
  const out: Tendable[] = [];
  for (const j of journeys) {
    const base = { group: 'journey' as const, source: `Journey · ${j.title}`, private: true, href: `/rituals/journeys/${j.journeyId}`, webHref: '/rituals/journeys/', ends: [] as TendEnd[], tendedAt: null };
    for (const step of j.steps) {
      if (step.kind === 'practice' && 'practice' in step && 'state' in step) {
        const { practice, state } = step as Extract<JourneyPart['steps'][number], { kind: 'practice'; state: unknown }>;
        out.push({
          ...base,
          key: `journey:${j.entryId}:${practice.id}`,
          kind: 'journey',
          title: practice.title,
          detail: state.times > 1 ? `Done ${state.count} of ${state.times} times` : 'For today',
          dueAt: now.getTime(),
          actions: ['practice', 'open'],
          keywords: [j.title, practice.summary ?? ''],
          ref: { entryId: j.entryId, journeyId: j.journeyId, practiceId: practice.id },
        });
      } else if (step.kind === 'waiting' && 'nextAt' in step && step.practice) {
        const waiting = step as Extract<JourneyPart['steps'][number], { kind: 'waiting' }>;
        out.push({
          ...base,
          key: `journey:${j.entryId}:${waiting.practice!.id}`,
          kind: 'journey',
          title: waiting.practice!.title,
          detail: waiting.nextAt ? `Next ${waiting.nextName ? `at ${waiting.nextName}, ` : ''}${shortDay(waiting.nextAt.getTime())}` : 'Waiting for its day',
          dueAt: waiting.nextAt ? waiting.nextAt.getTime() : null,
          actions: ['open'],
          keywords: [j.title],
          ref: { entryId: j.entryId, journeyId: j.journeyId, practiceId: waiting.practice!.id },
        });
      }
    }
  }
  return out;
}

// ─── "Did it work?" ──────────────────────────────────────────────────────

export type JournalLike = { id: string; title: string; intention?: string | null; metadata: unknown };

export function lookBackTendables(journal: JournalLike[], apothecary: ApothecaryLike[]): Tendable[] {
  const out: Tendable[] = [];
  for (const entry of journal) {
    const lb = readLookBack(entry as never);
    if (!lb || lb.answer || !lb.date) continue;
    const day = fromKey(lb.date);
    out.push({
      key: `lookback:${entry.id}`,
      kind: 'lookback',
      group: 'rituals',
      title: `Did “${entry.title || 'your working'}” work?`,
      detail: day ? `Look back ${shortDay(day.getTime())}` : 'Look back',
      source: 'Your ritual journal',
      dueAt: day ? day.getTime() : null,
      tendedAt: null,
      actions: ['answer', 'open'],
      ends: [],
      private: true,
      keywords: [entry.title, entry.intention ?? ''].filter(Boolean),
      href: `/today/journal/${entry.id}`,
      webHref: `/rituals/journal/?id=${encodeURIComponent(entry.id)}`,
      ref: { journalId: entry.id },
    });
  }
  for (const item of apothecary) {
    const lb = itemLookBack(item);
    if (!lb || lb.answer || !lb.date) continue;
    const day = fromKey(lb.date);
    out.push({
      key: `lookback:apothecary:${item.id}`,
      kind: 'lookback',
      group: 'rituals',
      title: `Did “${item.name || 'your working'}” work?`,
      detail: day ? `Look back ${shortDay(day.getTime())}` : 'Look back',
      source: `My Apothecary${item.typeLabel ? ` · ${item.typeLabel}` : ''}`,
      dueAt: day ? day.getTime() : null,
      tendedAt: null,
      actions: ['answer', 'open'],
      ends: [],
      private: true,
      keywords: [item.name, item.intention ?? ''].filter(Boolean) as string[],
      href: `/rituals/apothecary/${item.id}`,
      webHref: `/altar/?apothecaryItem=${encodeURIComponent(item.id)}`,
      ref: { itemId: item.id },
    });
  }
  return out;
}

/** Everything, from whatever each client could load. */
export function gatherTendables(input: { now: Date; altars?: AltarPart | null; covens?: CovenPart | null; journeys?: JourneyPart[]; journal?: JournalLike[]; apothecary?: ApothecaryLike[] }): Tendable[] {
  return [
    ...(input.altars ? altarTendables(input.altars, input.now) : []),
    ...(input.covens ? covenTendables(input.covens, input.now) : []),
    ...journeyTendables(input.journeys ?? [], input.now),
    ...lookBackTendables(input.journal ?? [], input.apothecary ?? []),
  ];
}

export type { SavedObject };
