// Public sits in Community: a group meditation anyone signed in can schedule
// (a time, a length, its bells, and a sound from the meditation module: a
// shared frame drum or singing bowls heard in step, or a binaural layer each
// plays for themselves). Others join; at the start time everyone's timer
// starts together, each worked out from the same moment, as a sit together
// does (meditation/together.ts). Nothing passes between people but the count
// of who's sitting. Rows: public_sits (supabase/migrations/
// 20261125000000_coven_shelf_rota_sits.sql). Pure.

import { SUPPORT_EMAIL, type HiddenCommunity } from './model.ts';
import { cleanMix, cleanShared, sharedMix, withShared, type BinauralPreset, type SharedSound, type SoundMix } from '../meditation/sound.ts';
import { cleanPlan, startClock, totalMs, type SitClock, type SitPlan } from '../meditation/timer.ts';

export type PublicSit = {
  id: string;
  host_id: string;
  title: string;
  intention: string | null;
  starts_at: string;
  minutes: number;
  plan: unknown;
  sound: unknown;
  status: 'scheduled' | 'cancelled' | 'removed';
  joined_count: number;
  created_at: string;
};

export type SitSound = { shared: SharedSound; binaural: BinauralPreset | null };

export const SIT_LENGTHS = [5, 10, 15, 20, 30, 45, 60] as const;
export const SIT_MAX_MINUTES = 180;
export const SIT_TITLE_MAX = 80;
export const SIT_INTENTION_MAX = 280;
/** How far ahead a sit may be set. */
export const SIT_AHEAD_DAYS = 60;

export const SOUND_CHOICES: { value: string; label: string }[] = [
  { value: '', label: 'Silence and bells' },
  { value: 'drum', label: 'A frame drum, in step' },
  { value: 'bowls', label: 'Singing bowls, in step' },
  { value: 'binaural:theta6', label: 'Binaural theta (headphones)' },
  { value: 'binaural:alpha', label: 'Binaural alpha (headphones)' },
  { value: 'binaural:descent', label: 'Binaural slow descent (headphones)' },
];

const BINAURALS: BinauralPreset[] = ['delta', 'theta4', 'theta6', 'alpha', 'descent'];

export function cleanSitSound(raw: unknown): SitSound {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const b = typeof r.binaural === 'string' && BINAURALS.includes(r.binaural as BinauralPreset) ? (r.binaural as BinauralPreset) : null;
  return { shared: cleanShared(r.shared), binaural: b };
}

/** The sound row from a SOUND_CHOICES value. */
export function soundFromChoice(choice: string): SitSound {
  if (choice === 'drum' || choice === 'bowls') return { shared: cleanShared({ layer: choice }), binaural: null };
  if (choice.startsWith('binaural:')) return cleanSitSound({ binaural: choice.slice(9) });
  return { shared: null, binaural: null };
}

export const soundChoiceOf = (s: SitSound) => (s.shared ? s.shared.layer : s.binaural ? `binaural:${s.binaural}` : '');
export const soundLabel = (s: SitSound) => SOUND_CHOICES.find((c) => c.value === soundChoiceOf(s))?.label ?? 'Silence and bells';

/** What plays for each person: the shared layer in step, and a binaural layer of their own. */
export function sitMix(s: SitSound): SoundMix | null {
  const own = s.binaural ? cleanMix({ levels: { binaural: 0.5 }, binaural: s.binaural }) : null;
  return s.shared ? withShared(own, s.shared) : own ?? sharedMix(null);
}

/** The sit's plan: its length and bells (no pausing: everyone keeps the same time). */
export function sitPlanOf(sit: Pick<PublicSit, 'minutes' | 'plan'>): SitPlan {
  const p = cleanPlan(sit.plan);
  return { ...p, minutes: Math.min(Math.max(1, Math.round(sit.minutes)), SIT_MAX_MINUTES) };
}

export const sitStart = (sit: Pick<PublicSit, 'starts_at'>) => Date.parse(sit.starts_at);

/** Everyone's clock, from the same moment: the start time, whoever opens it when. */
export const sitClock = (sit: Pick<PublicSit, 'starts_at'>): SitClock => startClock(sitStart(sit));

/** When it ends (start, settling, the sit and coming back). */
export function sitEnd(sit: Pick<PublicSit, 'starts_at' | 'minutes' | 'plan'>): number {
  return sitStart(sit) + (totalMs(sitPlanOf(sit)) ?? sit.minutes * 60_000);
}

export type SitPhase = 'upcoming' | 'sitting' | 'ended' | 'cancelled';

export function sitPhase(sit: Pick<PublicSit, 'starts_at' | 'minutes' | 'plan' | 'status'>, now: number): SitPhase {
  if (sit.status !== 'scheduled') return 'cancelled';
  if (now < sitStart(sit)) return 'upcoming';
  return now < sitEnd(sit) ? 'sitting' : 'ended';
}

/** How far into the sit everyone is (ms), the same for all: 0 before it begins. */
export const sitElapsed = (sit: Pick<PublicSit, 'starts_at'>, now: number) => Math.max(0, now - sitStart(sit));

/** Upcoming and under way, soonest first; ended ones (an hour on) and cancelled left out. */
export function listedSits<T extends Pick<PublicSit, 'id' | 'host_id' | 'starts_at' | 'minutes' | 'plan' | 'status'>>(sits: T[], now: number, hidden: HiddenCommunity): T[] {
  return sits
    .filter((s) => s.status === 'scheduled' && sitEnd(s) + 3600_000 > now && !isSitHidden(s, hidden))
    .sort((a, b) => sitStart(a) - sitStart(b));
}

export const isSitHidden = (sit: Pick<PublicSit, 'id' | 'host_id'>, hidden: HiddenCommunity) => hidden.posts.includes(`sit:${sit.id}`) || hidden.authors.includes(sit.host_id);

/** "Sitting now · 4 sitting", "Tomorrow at 19:30 · 2 joined". */
export function sitWhenLine(sit: Pick<PublicSit, 'starts_at' | 'minutes' | 'plan' | 'status' | 'joined_count'>, now: number): string {
  const phase = sitPhase(sit, now);
  const count = sit.joined_count > 0 ? `${sit.joined_count} ${phase === 'sitting' ? 'sitting' : 'joined'}` : '';
  const d = new Date(sitStart(sit));
  const at = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  const today = new Date(now);
  const tomorrow = new Date(now + 86400_000);
  const same = (x: Date, y: Date) => x.toDateString() === y.toDateString();
  const day = same(d, today) ? `Today at ${at}` : same(d, tomorrow) ? `Tomorrow at ${at}` : `${d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} at ${at}`;
  const when = phase === 'sitting' ? 'Sitting now' : phase === 'ended' ? 'Ended' : phase === 'cancelled' ? 'Cancelled' : day;
  return [when, `${sit.minutes} min`, count].filter(Boolean).join(' · ');
}

export type SitDraft = { title: string; intention: string; startsAt: Date | null; minutes: number; plan: SitPlan; sound: SitSound };

/** The row to schedule, or what's wrong with the draft. */
export function sitPayload(draft: SitDraft, now: Date): { ok: true; row: Record<string, unknown> } | { ok: false; error: string } {
  const title = draft.title.trim().slice(0, SIT_TITLE_MAX);
  if (!title) return { ok: false, error: 'Give the sit a name.' };
  if (!draft.startsAt || !Number.isFinite(draft.startsAt.getTime())) return { ok: false, error: 'Choose when it begins.' };
  const at = draft.startsAt.getTime();
  if (at < now.getTime() + 60_000) return { ok: false, error: 'Choose a time at least a minute from now.' };
  if (at > now.getTime() + SIT_AHEAD_DAYS * 86400_000) return { ok: false, error: `Choose a time within ${SIT_AHEAD_DAYS} days.` };
  const minutes = Math.round(draft.minutes);
  if (!(minutes >= 1 && minutes <= SIT_MAX_MINUTES)) return { ok: false, error: `Choose a length from 1 to ${SIT_MAX_MINUTES} minutes.` };
  const plan = cleanPlan({ ...draft.plan, minutes });
  return {
    ok: true,
    row: {
      title,
      intention: draft.intention.trim().slice(0, SIT_INTENTION_MAX) || null,
      starts_at: new Date(at - (at % 60_000)).toISOString(),
      minutes,
      plan: { settle: plan.settle, warm: plan.warm, startBell: plan.startBell, endBell: plan.endBell, every: plan.every, signal: plan.signal },
      sound: draft.sound,
    },
  };
}

/** Start choices for the form: on the next quarter hour, then a few set times ahead. */
export function startChoices(now: Date): { label: string; at: Date }[] {
  const q = new Date(now.getTime());
  q.setSeconds(0, 0);
  q.setMinutes(Math.ceil((q.getMinutes() + 5) / 15) * 15);
  const out: { label: string; at: Date }[] = [];
  const add = (at: Date) => {
    const hh = `${at.getHours()}:${String(at.getMinutes()).padStart(2, '0')}`;
    const day = at.toDateString() === now.toDateString() ? 'Today' : at.toDateString() === new Date(now.getTime() + 86400_000).toDateString() ? 'Tomorrow' : at.toLocaleDateString(undefined, { weekday: 'short' });
    out.push({ label: `${day} ${hh}`, at });
  };
  add(q);
  add(new Date(q.getTime() + 30 * 60_000));
  add(new Date(q.getTime() + 60 * 60_000));
  for (const [dayOffset, hour] of [
    [0, 19],
    [0, 21],
    [1, 7],
    [1, 19],
  ] as const) {
    const d = new Date(now.getTime() + dayOffset * 86400_000);
    d.setHours(hour, 0, 0, 0);
    if (d.getTime() > q.getTime() + 60 * 60_000 && !out.some((o) => o.at.getTime() === d.getTime())) add(d);
  }
  return out;
}

/** A pre-filled email to the moderators about one sit. */
export function sitReportUrl(sit: Pick<PublicSit, 'id' | 'title'>): string {
  const subject = `Report: ${sit.title || 'Community sit'}`;
  const body = ["I'd like to report this Community sit.", '', `Title: ${sit.title || '(none)'}`, `Reference: community-sit/${sit.id}`, '', 'What concerns you about it?', ''].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
