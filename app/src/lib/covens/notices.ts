// Who hears about a coven gathering (a rite or a meeting) when it is put on
// the calendar, moved or taken off it: the coven's rules by kind of
// gathering, and one gathering's own choice (its plan's `notify`). Pure, so
// the app and the website (js/core/covens.js) read it the same way, and it
// mirrors the database (supabase/migrations/20261108000000_coven_gathering_notices.sql:
// coven_notice_name, coven_gathering_notice_scopes, coven_clean_notice_who,
// coven_gathering_notice_who). The phone notes themselves are sent by
// supabase/functions/coven-notify (gatherings.ts has their words).
//
// Who is a list of WHO keys, as the planner's fields keep them: 'coven',
// 'rank:<id>', 'user:<id>', 'role:<id>' (one of the gathering's roles; only
// a gathering's own choice), 'parts' (everyone cast in one of its roles) or
// 'none' (no one: it goes on the calendar quietly).

import type { PlanRole } from './builder.ts';
import type { PickEntry } from './picker.ts';

export type NoticeRule = { coven_id: string; scope: string; who: string[]; updated_by?: string | null; updated_at?: string };
export type NoticeGathering = { kind?: string | null; occasion?: string | null; occasion_name?: string | null; plan?: unknown };
/** Where the choice comes from: the gathering's own, one of the coven's rules (its scope), or no choice at all. */
export type NoticeSource = 'gathering' | 'default' | string;

/** A name compared without case, spacing or curly quotes. Mirrors public.coven_notice_name. */
export function noticeName(text: unknown): string {
  return String(text ?? '')
    .trim()
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .slice(0, 60);
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** The series a meeting follows on from, as its rule sees it ('' when none is set). Mirrors meetings.ts seriesOf, without its fallback. */
export function noticeSeries(plan: unknown): string {
  const p = obj(plan);
  const m = obj(p.meeting);
  return noticeName((typeof m.series === 'string' && m.series.trim()) || (typeof p.template === 'string' && p.template.trim()) || '');
}

/** The rules that could apply, the closest first. Mirrors public.coven_gathering_notice_scopes. */
export function noticeScopes(g: NoticeGathering): string[] {
  const out: string[] = [];
  const name = noticeName(g.occasion_name);
  if (name) out.push(`name:${name}`);
  if (g.occasion) out.push(`occasion:${g.occasion}`);
  const series = g.kind === 'meeting' ? noticeSeries(g.plan) : '';
  if (series) out.push(`series:${series}`);
  out.push(g.kind === 'meeting' ? 'meeting' : 'rite');
  return out;
}

/** A scope as the database keeps it, or null. Mirrors public.coven_clean_notice_scope. */
export function cleanScope(scope: string): string | null {
  if (scope === 'rite' || scope === 'meeting') return scope;
  if (/^occasion:[a-z_]{1,30}$/.test(scope)) return scope;
  if (scope.startsWith('name:') && noticeName(scope.slice(5))) return `name:${noticeName(scope.slice(5))}`;
  if (scope.startsWith('series:') && noticeName(scope.slice(7))) return `series:${noticeName(scope.slice(7))}`;
  return null;
}

/**
 * WHO keys cleaned as the database cleans them (people and positions are
 * checked there): known shapes only, no repeats, the whole coven alone, and
 * 'none' only when nothing else is chosen. Roles only when the gathering's
 * roles are given. Empty: no choice.
 */
export function cleanNoticeWho(raw: unknown, roles?: Pick<PlanRole, 'id'>[] | null): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  let none = false;
  for (const k of raw) {
    if (typeof k !== 'string') continue;
    if (k === 'coven') return ['coven'];
    if (k === 'none') {
      none = true;
      continue;
    }
    const ok = k === 'parts' || /^(rank|user):.+/.test(k) || (k.startsWith('role:') && !!roles?.some((r) => `role:${r.id}` === k));
    if (ok && !out.includes(k)) out.push(k);
  }
  if (!out.length) return none ? ['none'] : [];
  return out.slice(0, 40);
}

/** The gathering's own choice, if it has one. */
export const ownNotice = (plan: unknown): string[] => cleanNoticeWho(obj(plan).notify, (obj(plan).roles as PlanRole[] | undefined) ?? []);

/** Who hears and where that comes from: its own choice, the closest of the coven's rules, else everyone it is for. Mirrors public.coven_gathering_notice_who. */
export function effectiveNotice(g: NoticeGathering, rules: Pick<NoticeRule, 'scope' | 'who'>[]): { who: string[] | null; source: NoticeSource } {
  const own = ownNotice(g.plan);
  if (own.length) return { who: own, source: 'gathering' };
  for (const scope of noticeScopes(g)) {
    const rule = rules.find((r) => r.scope === scope);
    const who = rule ? cleanNoticeWho(rule.who) : [];
    if (who.length) return { who, source: scope };
  }
  return { who: null, source: 'default' };
}

// ─── Words ─────────────────────────────────────────────────────────────────

const OCCASION_WORDS: Record<string, string> = { full_moon: 'Full moon', new_moon: 'New moon', esbat: 'Esbat', sabbat: 'Sabbat', other: 'Other gathering' };

/** Meeting series named by the ready-made meetings ("officials" → "Officials’ meeting"), as the settings screen offers them. */
export type SeriesName = { series: string; name: string };

/** How a rule's scope reads: "Rites", "Meetings", "Full moons", "Hekate’s Deipnon", "Officials’ meetings". */
export function scopeLabel(scope: string, options: { names?: string[]; series?: SeriesName[] } = {}): string {
  if (scope === 'rite') return 'Rites';
  if (scope === 'meeting') return 'Meetings';
  if (scope.startsWith('occasion:')) {
    const id = scope.slice(9);
    const word = OCCASION_WORDS[id];
    return word ? (id === 'other' ? 'Other gatherings' : `${word}s`) : 'An occasion';
  }
  if (scope.startsWith('name:')) {
    const key = scope.slice(5);
    // As the coven wrote it, when one of its gatherings or a ready-made rite has the name.
    const shown = options.names?.find((n) => noticeName(n) === key);
    return shown ?? key.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
  }
  if (scope.startsWith('series:')) {
    const key = scope.slice(7);
    const known = options.series?.find((s) => noticeName(s.series) === key);
    return known ? `${known.name}s` : `Meetings that follow on from “${key}”`;
  }
  return scope;
}

/** "the coven’s rule for Hekate’s Deipnon", for where a choice comes from. */
export function sourceLabel(source: NoticeSource, options: Parameters<typeof scopeLabel>[1] = {}): string {
  if (source === 'gathering') return 'chosen for this gathering';
  if (source === 'default') return 'as no rule says otherwise';
  const label = scopeLabel(source, options);
  return `from the coven’s rule for ${source.startsWith('name:') ? label : label.charAt(0).toLowerCase() + label.slice(1)}`;
}

/** "A, B and C". */
function andList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export type NoticeWords = { roles?: Pick<PlanRole, 'id' | 'name'>[]; ranks: { id: string; name: string }[]; nameOf: (id: string) => string };

/** How one key reads: "Everyone in the coven", "every Elder", "Rowan", "the Chair", "everyone with a part", "no one". */
export function noticeKeyLabel(key: string, w: NoticeWords): string {
  if (key === 'coven') return 'everyone in the coven';
  if (key === 'none') return 'no one';
  if (key === 'parts') return 'everyone with a part';
  if (key.startsWith('role:')) return `the ${w.roles?.find((r) => `role:${r.id}` === key)?.name ?? 'role'}`;
  if (key.startsWith('rank:')) return `every ${w.ranks.find((r) => `rank:${r.id}` === key)?.name ?? 'position'}`;
  if (key.startsWith('user:')) return w.nameOf(key.slice(5));
  return '';
}

/** How a list reads, capitalised: "Every Elder and Rowan". Null (no choice) is everyone the gathering is for. */
export function noticeWhoLabel(who: string[] | null, w: NoticeWords, kind: string = 'rite', kept = false): string {
  const line = !who || !who.length ? (kind === 'meeting' && kept ? 'everyone the meeting is for' : 'everyone in the coven') : andList(who.map((k) => noticeKeyLabel(k, w)).filter(Boolean));
  return line.charAt(0).toUpperCase() + line.slice(1);
}

/** The planner's line: "Everyone in the coven · from the coven’s rule for rites". */
export function noticeLine(g: NoticeGathering & { audience?: unknown }, rules: Pick<NoticeRule, 'scope' | 'who'>[], w: NoticeWords, options: Parameters<typeof scopeLabel>[1] = {}): string {
  const { who, source } = effectiveNotice(g, rules);
  const kept = g.kind === 'meeting' && Array.isArray(g.audience) && g.audience.length > 0;
  const words = noticeWhoLabel(who, { ...w, roles: w.roles ?? (obj(g.plan).roles as PlanRole[] | undefined) }, g.kind ?? 'rite', kept);
  const limited = kept && who && !who.includes('none') ? ', among those it is for' : '';
  return `${words}${limited} · ${sourceLabel(source, options)}`;
}

/** The picker's extra choices for notes: everyone with a part, and no one (the gathering's roles come with its WHO entries). */
export function noticeEntries(base: PickEntry[], options: { parts?: boolean } = {}): PickEntry[] {
  const extra: PickEntry[] = [
    ...(options.parts !== false ? [{ key: 'parts', label: 'Everyone with a part', detail: 'Whoever is cast in one of its roles', keywords: ['parts', 'roles', 'cast'], group: 'coven' }] : []),
    { key: 'none', label: 'No one', detail: 'It goes on the calendar quietly', keywords: ['nobody', 'quiet', 'silent', 'none'], group: 'coven' },
  ];
  return [...base.filter((e) => e.key !== 'parts' && e.key !== 'none'), ...extra];
}

/** Add a key to a choice: the whole coven or no one stand alone; anything else takes their place. */
export function addNoticeKey(list: string[], key: string): string[] {
  if (key === 'coven' || key === 'none') return [key];
  const next = list.filter((k) => k !== 'coven' && k !== 'none');
  return (next.includes(key) ? next : [...next, key]).slice(0, 40);
}

/** The occasions a rule can be for, and named ones the coven has used or a ready-made rite keeps. */
export function ruleChoices(args: { occasions: readonly { value: string; label: string }[]; names: string[]; series: SeriesName[]; taken: string[] }): { scope: string; label: string; detail: string }[] {
  const taken = new Set(args.taken);
  const out: { scope: string; label: string; detail: string }[] = [];
  for (const o of args.occasions) out.push({ scope: `occasion:${o.value}`, label: scopeLabel(`occasion:${o.value}`), detail: 'Occasion' });
  const seen = new Set<string>();
  for (const n of args.names) {
    const key = noticeName(n);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ scope: `name:${key}`, label: n.trim(), detail: 'By its name' });
  }
  for (const s of args.series) {
    const key = noticeName(s.series);
    if (!key || seen.has(`series:${key}`)) continue;
    seen.add(`series:${key}`);
    out.push({ scope: `series:${key}`, label: `${s.name}s`, detail: 'Kind of meeting' });
  }
  return out.filter((c) => !taken.has(c.scope));
}

/** The names rules can be shown by: occasion names the coven has used and ready-made rites keep, and ready-made meetings' series. */
export function noticeLabelOptions(
  templates: { kind: string; name: string; occasionName?: string; meeting?: { series?: string } }[],
  rituals: { occasion_name?: string | null }[],
): { names: string[]; series: SeriesName[] } {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const n of [...rituals.map((r) => r.occasion_name ?? ''), ...templates.map((t) => t.occasionName ?? '')]) {
    const key = noticeName(n);
    if (key && !seen.has(key)) {
      seen.add(key);
      names.push(n.trim());
    }
  }
  const series = templates.filter((t) => t.kind === 'meeting' && t.meeting?.series).map((t) => ({ series: t.meeting!.series!, name: t.name }));
  return { names, series };
}

// ─── Sending one by hand ─────────────────────────────────────────────────────

/** The most a sender's own note may say (coven_gathering_notices.note). */
export const NOTE_MAX = 200;

/**
 * Whether this person may send a notification by hand for a gathering: it is
 * on the calendar and still to come, and they have 'notices', moderate the
 * coven, lead it, are a site moderator, or planned it. Mirrors
 * public.coven_gathering_may_send (which also checks it is open to them).
 */
export function maySendNotice(
  ritual: { status: string; scheduled_for: string | null; created_by?: string | null },
  perms: { notices?: boolean; moderate?: boolean; member?: boolean; site?: boolean },
  userId: string | null,
  now: number = Date.now(),
): boolean {
  if (ritual.status !== 'scheduled' || !ritual.scheduled_for || new Date(ritual.scheduled_for).getTime() <= now) return false;
  return !!(perms.site || (perms.member && (perms.notices || perms.moderate || (!!userId && ritual.created_by === userId))));
}

export type NoticePreview = { recipients: number; announced: boolean; next_at: string | null };

/** What sending one by hand will be: "Let them know it’s on the calendar" the first time, else a reminder. */
export const sendLabel = (preview: Pick<NoticePreview, 'announced'> | null) => (preview?.announced ? 'Send a reminder' : 'Let them know it’s on the calendar');

/** "This goes to 4 people", before sending. */
export function reachLine(n: number): string {
  if (n <= 0) return 'This goes to no one as things stand. Choose who it’s for below.';
  return `This goes to ${n === 1 ? 'one person' : `${n} people`}, except anyone who has turned coven gathering notes off.`;
}

/** "9:15 pm", for when the next may be sent. */
function clock(at: string | number | Date): string {
  const d = new Date(at);
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** Whether one may go now, and if not, the friendly words. */
export function waitLine(nextAt: string | null | undefined, now: number = Date.now()): string | null {
  if (!nextAt || new Date(nextAt).getTime() <= now) return null;
  return `A notification went out for this gathering in the last half hour. You can send another after ${clock(nextAt)}.`;
}

/** The words after sending, or for what the edge function said back. */
export function sentLine(result: { error?: string; sent?: number; recipients?: number; event?: string } | null, nextAt?: string | null): string {
  if (!result) return 'That couldn’t be sent just now. Try again in a little while.';
  if (result.error === 'too_soon') return waitLine(nextAt) ?? 'A notification went out for this gathering in the last half hour. Try again a little later.';
  if (result.error === 'not_scheduled') return 'Only a gathering on the calendar, still to come, can be sent.';
  if (result.error === 'not_allowed') return 'Only those the coven’s head allows, and whoever planned it, send these.';
  if (result.error) return 'That couldn’t be sent just now. Try again in a little while.';
  const n = result.recipients ?? 0;
  if (!n) return 'There was no one to send it to.';
  return `${result.event === 'reminder' ? 'Reminder sent' : 'Sent'} to ${n === 1 ? 'one person' : `${n} people`}.`;
}
