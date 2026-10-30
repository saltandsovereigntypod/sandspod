// Community Rituals: personal and coven ritual templates shared with
// everyone, reviewed first, like the Community Grimoire. What a shared ritual
// holds, how one is made from a template (yours or a coven's, never its
// roles, members or notes), how people search the published ones, and how
// one becomes your own template, a coven's, or a ritual done once. Pure, so
// the website (js/core/community-rituals.js) shares it.
//
// Tables (supabase/migrations/20261116000000_community_rituals.sql):
// community_rituals (read through community_rituals_published by everyone)
// and community_ritual_saves; every change goes through its functions.

import { SUPPORT_EMAIL } from '../community/model.ts';
import { secondsToMinutes } from './lifecycle.ts';
import type { StepDraft, TemplateDraft, TemplateRow } from './types.ts';

// ─── What a shared ritual holds ─────────────────────────────────────────────

/** The kinds, drawn from the app's own (premade ritual or spell, coven rite or meeting, the planner's intentions). */
export const COMMUNITY_KINDS = [
  { value: 'ritual', label: 'Ritual' },
  { value: 'spell', label: 'Spell' },
  { value: 'seasonal', label: 'Sabbat or holiday rite' },
  { value: 'esbat', label: 'Moon rite' },
  { value: 'devotion', label: 'Devotion' },
  { value: 'cleansing', label: 'Cleansing' },
  { value: 'protection', label: 'Protection' },
  { value: 'healing', label: 'Healing' },
  { value: 'divination', label: 'Divination' },
  { value: 'meeting', label: 'Coven meeting' },
] as const;
export type CommunityKind = (typeof COMMUNITY_KINDS)[number]['value'];

/** The moon words the premade book uses. */
export const COMMUNITY_MOONS = [
  { value: 'new', label: 'New moon' },
  { value: 'waxing', label: 'Waxing moon' },
  { value: 'full', label: 'Full moon' },
  { value: 'waning', label: 'Waning moon' },
  { value: 'dark', label: 'Dark moon' },
] as const;

export const COMMUNITY_DIFFICULTIES = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Some experience' },
  { value: 'experienced', label: 'Experienced' },
] as const;

export const COMMUNITY_SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'saved', label: 'Most saved' },
  { value: 'title', label: 'A to Z' },
] as const;
export type CommunitySort = (typeof COMMUNITY_SORTS)[number]['value'];

/** How the sharer is credited. "coven" is offered only for a coven's template. */
export const SHARE_AS = [
  { value: 'preferred_name', label: 'My preferred name' },
  { value: 'magical_name', label: 'My magical name' },
  { value: 'anonymous', label: 'Anonymous' },
  { value: 'coven', label: 'The coven' },
] as const;
export type ShareAs = (typeof SHARE_AS)[number]['value'];

export const COMMUNITY_LIMITS = { title: 120, steps: 60, stepTitle: 120, stepText: 4000, list: 12, materials: 60, item: 120 };

export type CommunityStep = { title: string; instructions: string; spoken_text: string; minutes: number | null };

/** What the share form edits and the server keeps. */
export type CommunityContent = {
  title: string;
  kind: CommunityKind;
  summary: string;
  tradition: string;
  deities: string[];
  occasion: string;
  moon_phase: string;
  duration_minutes: number | null;
  difficulty: string;
  materials: string[];
  preparation: string;
  steps: CommunityStep[];
  closing: string;
  notes: string;
  safety_notes: string;
  cultural_note: string;
  tags: string[];
};

/** A row of community_rituals_published (what everyone reads). */
export type PublishedRitual = {
  id: string;
  /** Only when a person is credited by name. */
  sharer_id: string | null;
  /** Only when a coven is credited. */
  coven_id: string | null;
  share_as: 'person' | 'anonymous' | 'coven';
  display_name: string;
  title: string;
  kind: string;
  summary: string | null;
  tradition: string | null;
  deities: string[] | null;
  occasion: string | null;
  moon_phase: string | null;
  duration_minutes: number | null;
  difficulty: string | null;
  materials: string[] | null;
  preparation: string | null;
  steps: unknown;
  closing: string | null;
  notes: string | null;
  safety_notes: string | null;
  cultural_note: string | null;
  tags: string[] | null;
  version: number;
  save_count: number;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/** A row of community_rituals: your own shares, a coven's, or the moderators' queue. */
export type SharedRitual = Omit<PublishedRitual, 'sharer_id'> & {
  user_id: string;
  source: string;
  status: SharedStatus;
  reviewer_note: string | null;
  reviewed_at: string | null;
  replaces_id: string | null;
  submitted_at: string | null;
};

export type SharedStatus = 'pending' | 'needs_revision' | 'published' | 'rejected' | 'withdrawn' | 'superseded';

const STATUS_LABELS: Record<SharedStatus, string> = {
  pending: 'Waiting for review',
  needs_revision: 'Returned for changes',
  published: 'Published',
  rejected: 'Not accepted',
  withdrawn: 'Withdrawn',
  superseded: 'Replaced by a newer version',
};
export const sharedStatusLabel = (status: string | null | undefined) => STATUS_LABELS[(status ?? 'pending') as SharedStatus] ?? 'Waiting for review';

export const kindLabel = (kind: string | null | undefined) => COMMUNITY_KINDS.find((k) => k.value === kind)?.label ?? 'Ritual';
export const moonLabel = (moon: string | null | undefined) => COMMUNITY_MOONS.find((m) => m.value === moon)?.label ?? '';
export const difficultyLabel = (d: string | null | undefined) => COMMUNITY_DIFFICULTIES.find((x) => x.value === d)?.label ?? '';

export function blankContent(): CommunityContent {
  return {
    title: '',
    kind: 'ritual',
    summary: '',
    tradition: '',
    deities: [],
    occasion: '',
    moon_phase: '',
    duration_minutes: null,
    difficulty: '',
    materials: [],
    preparation: '',
    steps: [],
    closing: '',
    notes: '',
    safety_notes: '',
    cultural_note: '',
    tags: [],
  };
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()).map((x) => x.trim()) : []);
const unique = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/** "Rosemary, a white candle" → ["Rosemary", "a white candle"]. */
export function splitList(text: string): string[] {
  return unique(
    String(text || '')
      .split(/[,\n]/)
      .map((x) => x.trim())
      .filter(Boolean),
  );
}

/** A shared ritual's steps, read safely whatever the row holds. */
export function stepsOf(row: { steps: unknown }): CommunityStep[] {
  if (!Array.isArray(row.steps)) return [];
  return row.steps
    .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
    .map((s) => ({
      title: str(s.title),
      instructions: str(s.instructions),
      spoken_text: str(s.spoken_text),
      minutes: typeof s.minutes === 'number' && s.minutes > 0 ? s.minutes : null,
    }))
    .filter((s) => s.title.trim());
}

// ─── Made from a template ───────────────────────────────────────────────────

/** One of your templates (ritual_templates), ready to share: everything but your altar and Grimoire links. */
export function contentFromTemplate(template: TemplateRow): CommunityContent {
  const steps = [...(template.ritual_template_steps ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const ingredients = Array.isArray(template.metadata?.ingredients) ? (template.metadata.ingredients as { name?: string }[]) : [];
  const total = Number(template.estimated_duration_seconds || 0);
  return {
    ...blankContent(),
    title: template.title || '',
    kind: template.metadata?.kind === 'spell' ? 'spell' : 'ritual',
    summary: template.intention ?? '',
    preparation: template.preparation ?? '',
    closing: template.closing ?? '',
    duration_minutes: total > 0 ? Math.round(total / 60) : null,
    materials: unique(ingredients.map((i) => str(i?.name).trim()).filter(Boolean)),
    steps: steps.map((s) => ({
      title: s.title,
      instructions: s.instructions ?? '',
      spoken_text: s.spoken_text ?? '',
      minutes: s.duration_seconds ? Number(secondsToMinutes(s.duration_seconds)) || null : null,
    })),
  };
}

type CovenLibraryStep = {
  title?: unknown;
  instructions?: unknown;
  spoken_text?: unknown;
  duration_minutes?: unknown;
  deity?: unknown;
  items?: unknown;
};

/**
 * One of a coven's templates (coven_ritual_library, kind 'template'), ready
 * to share. Only the rite itself goes: its title, purpose, occasion and each
 * step's words and directions. Never its roles, who is cast or assigned,
 * checklists, afterwards notes or anything else the coven keeps.
 */
export function contentFromCovenTemplate(title: string, body: Record<string, unknown> | null | undefined): CommunityContent {
  const b = body ?? {};
  const raw = Array.isArray(b.steps) ? (b.steps as CovenLibraryStep[]) : [];
  const steps = raw
    .map((s) => ({
      title: str(s?.title).trim(),
      instructions: str(s?.instructions),
      spoken_text: str(s?.spoken_text),
      minutes: typeof s?.duration_minutes === 'number' && s.duration_minutes > 0 ? s.duration_minutes : null,
    }))
    .filter((s) => s.title);
  const deities = unique(raw.map((s) => str(s?.deity).trim()).filter(Boolean));
  const materials = unique(
    raw.flatMap((s) => (Array.isArray(s?.items) ? (s.items as { name?: unknown; label?: unknown }[]) : [])).map((i) => str(i?.name ?? i?.label).trim()).filter(Boolean),
  );
  const minutes = steps.reduce((sum, s) => sum + (s.minutes ?? 0), 0);
  const occasion = str(b.occasion_name).trim();
  return {
    ...blankContent(),
    title: title || '',
    kind: b.kind === 'meeting' ? 'meeting' : occasion ? 'seasonal' : 'ritual',
    summary: str(b.intention) || str(b.description),
    occasion,
    deities: deities.slice(0, COMMUNITY_LIMITS.list),
    materials: materials.slice(0, COMMUNITY_LIMITS.materials),
    duration_minutes: minutes > 0 ? Math.round(minutes) : null,
    steps,
  };
}

/** A shared ritual back in the form, to change it or send an update. */
export function contentFromShared(row: PublishedRitual | SharedRitual): CommunityContent {
  const kind = COMMUNITY_KINDS.some((k) => k.value === row.kind) ? (row.kind as CommunityKind) : 'ritual';
  return {
    title: row.title,
    kind,
    summary: row.summary ?? '',
    tradition: row.tradition ?? '',
    deities: list(row.deities),
    occasion: row.occasion ?? '',
    moon_phase: row.moon_phase ?? '',
    duration_minutes: row.duration_minutes ?? null,
    difficulty: row.difficulty ?? '',
    materials: list(row.materials),
    preparation: row.preparation ?? '',
    steps: stepsOf(row),
    closing: row.closing ?? '',
    notes: row.notes ?? '',
    safety_notes: row.safety_notes ?? '',
    cultural_note: row.cultural_note ?? '',
    tags: list(row.tags),
  };
}

type Result<T> = { ok: true; value: T } | { ok: false; message: string };

/** Trimmed and within bounds, or what's missing (the server checks the same). */
export function cleanContent(input: CommunityContent): Result<CommunityContent> {
  const L = COMMUNITY_LIMITS;
  const title = input.title.trim().slice(0, L.title);
  if (!title) return { ok: false, message: 'Give the ritual a title.' };
  const steps = input.steps
    .map((s) => ({
      title: s.title.trim().slice(0, L.stepTitle),
      instructions: s.instructions.trim().slice(0, L.stepText),
      spoken_text: s.spoken_text.trim().slice(0, L.stepText),
      minutes: s.minutes && s.minutes > 0 ? Math.min(600, s.minutes) : null,
    }))
    .filter((s) => s.title || s.instructions || s.spoken_text);
  if (!steps.length) return { ok: false, message: 'Add at least one step.' };
  if (steps.some((s) => !s.title)) return { ok: false, message: 'Each step needs a title.' };
  if (steps.length > L.steps) return { ok: false, message: `A shared ritual can have up to ${L.steps} steps.` };
  const minutes = input.duration_minutes && input.duration_minutes > 0 ? Math.min(1440, Math.round(input.duration_minutes)) : null;
  return {
    ok: true,
    value: {
      title,
      kind: COMMUNITY_KINDS.some((k) => k.value === input.kind) ? input.kind : 'ritual',
      summary: input.summary.trim().slice(0, 2000),
      tradition: input.tradition.trim().slice(0, 80),
      deities: unique(list(input.deities)).slice(0, L.list).map((d) => d.slice(0, 80)),
      occasion: input.occasion.trim().slice(0, 80),
      moon_phase: COMMUNITY_MOONS.some((m) => m.value === input.moon_phase) ? input.moon_phase : '',
      duration_minutes: minutes,
      difficulty: COMMUNITY_DIFFICULTIES.some((d) => d.value === input.difficulty) ? input.difficulty : '',
      materials: unique(list(input.materials)).slice(0, L.materials).map((m) => m.slice(0, L.item)),
      preparation: input.preparation.trim().slice(0, 6000),
      steps,
      closing: input.closing.trim().slice(0, 4000),
      notes: input.notes.trim().slice(0, 4000),
      safety_notes: input.safety_notes.trim().slice(0, 2000),
      cultural_note: input.cultural_note.trim().slice(0, 2000),
      tags: unique(list(input.tags)).slice(0, L.list).map((t) => t.slice(0, 40)),
    },
  };
}

/** The name a person is credited by (as the Community Grimoire's "Publish or reference as"). */
export function personName(shareAs: ShareAs, names: { preferred_name?: unknown; magical_name?: unknown }): string {
  if (shareAs === 'magical_name') return str(names.magical_name).trim() || str(names.preferred_name).trim() || 'Community member';
  if (shareAs === 'preferred_name') return str(names.preferred_name).trim() || 'Community member';
  return 'Anonymous';
}

export type ShareOptions = {
  /** Changing a ritual that is waiting or returned. */
  id?: string | null;
  shareAs: ShareAs;
  names: { preferred_name?: unknown; magical_name?: unknown };
  /** The coven whose template this is (needed for any coven template, whoever is credited). */
  covenId?: string | null;
  /** Sending an update to a published ritual. */
  replaces?: string | null;
  source: 'template' | 'coven_template' | 'other';
  /** The Submission Terms and the community guidelines. */
  agreed: boolean;
};

/** Arguments for share_community_ritual, or what's missing. */
export function shareArgs(content: CommunityContent, options: ShareOptions): Result<Record<string, unknown>> {
  const clean = cleanContent(content);
  if (!clean.ok) return clean;
  if (options.shareAs === 'coven' && !options.covenId) return { ok: false, message: 'Only a coven’s template can be credited to the coven.' };
  if (!options.agreed) return { ok: false, message: 'Please agree to the Submission Terms and the community guidelines.' };
  const share = options.shareAs === 'coven' ? 'coven' : options.shareAs === 'anonymous' ? 'anonymous' : 'person';
  return {
    ok: true,
    value: {
      p_id: options.id ?? null,
      p_ritual: clean.value,
      p_share_as: share,
      p_display_name: share === 'person' ? personName(options.shareAs, options.names) : null,
      p_coven: options.covenId ?? null,
      p_replaces: options.id ? null : options.replaces ?? null,
      p_source: options.source,
    },
  };
}

// ─── Reading one ────────────────────────────────────────────────────────────

export function sharerName(row: Pick<PublishedRitual, 'share_as' | 'display_name'>): string {
  if (row.share_as === 'anonymous') return 'Anonymous';
  return row.display_name || (row.share_as === 'coven' ? 'A coven' : 'Community member');
}

/** "From Moon Circle in Community Rituals": how a copy is credited. */
export const creditLine = (row: Pick<PublishedRitual, 'share_as' | 'display_name'>) => `From ${sharerName(row)} in Community Rituals`;

/** Who to filter or block by: a coven, a named person, or nobody (anonymous). */
export function sharerKey(row: Pick<PublishedRitual, 'share_as' | 'sharer_id' | 'coven_id'>): string | null {
  if (row.share_as === 'coven' && row.coven_id) return `coven:${row.coven_id}`;
  if (row.share_as === 'person' && row.sharer_id) return `person:${row.sharer_id}`;
  return null;
}

/** Hidden on this device (lib/community/hidden.ts): the ritual itself, or everything from its sharer. */
export function isRitualHidden(row: Pick<PublishedRitual, 'id' | 'share_as' | 'sharer_id' | 'coven_id'>, hidden: { posts: string[]; authors: string[] }): boolean {
  const key = sharerKey(row);
  return hidden.posts.includes(row.id) || (!!row.sharer_id && hidden.authors.includes(row.sharer_id)) || (!!key && hidden.authors.includes(key));
}

/** "Moon rite · Wicca · Full moon · about 20 min · Beginner". */
export function ritualFacts(row: Pick<PublishedRitual, 'kind' | 'tradition' | 'moon_phase' | 'duration_minutes' | 'difficulty' | 'occasion'>): string {
  return [
    kindLabel(row.kind),
    row.tradition,
    row.occasion,
    moonLabel(row.moon_phase),
    row.duration_minutes ? `about ${row.duration_minutes} min` : '',
    difficultyLabel(row.difficulty),
  ]
    .filter(Boolean)
    .join(' · ');
}

export const savesLabel = (count: number | null | undefined) => {
  const n = Number(count || 0);
  return n ? `Saved ${n === 1 ? 'once' : `${n} times`}` : '';
};

/**
 * A ritual as one of your own templates (TemplateDraft). Materials, safety,
 * roots and notes go into the preparation, as a premade's do.
 */
export function draftFromContent(content: CommunityContent, from: Record<string, unknown> | null = null): TemplateDraft {
  const steps: StepDraft[] = content.steps
    .filter((s) => s.title.trim())
    .map((s) => ({
      id: null,
      title: s.title,
      instructions: s.instructions,
      spoken_text: s.spoken_text,
      minutes: s.minutes ? String(s.minutes) : '',
      completion_mode: 'manual',
      actions: [],
    }));
  const preparation = [
    content.materials.length ? `Gather: ${content.materials.join(', ')}.` : '',
    content.preparation,
    content.safety_notes ? `Take care: ${content.safety_notes}` : '',
    content.cultural_note ? `About its roots: ${content.cultural_note}` : '',
    content.notes ? `Notes from the sharer: ${content.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  return {
    id: null,
    title: content.title,
    intention: content.summary,
    preparation,
    closing: content.closing,
    linked_altar_id: null,
    grimoire_page_id: null,
    steps,
    ingredients: [],
    kind: content.kind === 'spell' ? 'spell' : 'template',
    ...(from ? { from } : {}),
  };
}

/** Your own template from a shared ritual: an independent copy, credited. */
export function draftFromCommunity(row: PublishedRitual): TemplateDraft {
  return draftFromContent(contentFromShared(row), { kind: 'community', id: row.id, version: row.version, sharer: sharerName(row), credit: creditLine(row) });
}

/**
 * Your own template from one of a coven's rites or templates (a member's
 * copy): the rite's words and directions, never its roles or who was cast.
 */
export function draftFromCoven(title: string, body: Record<string, unknown>, covenName: string): TemplateDraft {
  return draftFromContent(contentFromCovenTemplate(title, body), { kind: 'coven', coven: covenName, credit: `From ${covenName}` });
}

/**
 * A coven's template (coven_ritual_library body) from a shared ritual, for
 * "Add to a coven's rituals". The builder fills in sections and roles when
 * the coven plans a gathering from it.
 */
export function covenBodyFromCommunity(row: PublishedRitual): { title: string; body: Record<string, unknown> } {
  const draft = draftFromCommunity(row);
  return {
    title: row.title.slice(0, 120),
    body: {
      kind: row.kind === 'meeting' ? 'meeting' : 'rite',
      intention: row.summary ?? '',
      description: [creditLine(row), draft.preparation, row.closing ? `Closing: ${row.closing}` : ''].filter(Boolean).join('\n\n'),
      occasion: '',
      occasion_name: row.occasion ?? '',
      steps: stepsOf(row).map((s) => ({ title: s.title, instructions: s.instructions, spoken_text: s.spoken_text, duration_minutes: s.minutes })),
      from: { kind: 'community', id: row.id, version: row.version, sharer: sharerName(row) },
    },
  };
}

/** Where a template came from ("From Moon Circle in Community Rituals"), if it was copied. */
export function templateCredit(metadata: Record<string, unknown> | null | undefined): string | null {
  const from = metadata?.from as { credit?: unknown } | undefined;
  return from && typeof from.credit === 'string' && from.credit ? from.credit : null;
}

/** The shared ritual a session was begun from ("Do it once"), if any. */
export function communityOrigin(metadata: Record<string, unknown> | null | undefined): { id: string; credit: string } | null {
  const from = metadata?.from as { kind?: unknown; id?: unknown; credit?: unknown } | undefined;
  return from && from.kind === 'community' && typeof from.id === 'string' ? { id: from.id, credit: typeof from.credit === 'string' ? from.credit : '' } : null;
}

// ─── Searching ──────────────────────────────────────────────────────────────

export type CommunityFilter = {
  query: string;
  kind?: string | null;
  moon?: string | null;
  tradition?: string | null;
  deity?: string | null;
  occasion?: string | null;
  material?: string | null;
  /** A sharer's key (sharerKey): "More from …". */
  sharer?: string | null;
  sort?: CommunitySort;
};

const fold = (text: string) =>
  String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const has = (values: (string | null | undefined)[] | null | undefined, wanted: string) =>
  (values ?? []).some((v) => fold(v ?? '') === fold(wanted));

/** Everything a search looks through: sharer, title, kind, tradition, deities, occasion, moon, materials and more. */
export function searchText(row: PublishedRitual): string {
  return fold(
    [
      row.title,
      sharerName(row),
      kindLabel(row.kind),
      row.tradition,
      ...(row.deities ?? []),
      row.occasion,
      moonLabel(row.moon_phase),
      ...(row.materials ?? []),
      ...(row.tags ?? []),
      row.summary,
      difficultyLabel(row.difficulty),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export function filterCommunity(rows: PublishedRitual[], filter: CommunityFilter): PublishedRitual[] {
  const words = fold(filter.query).split(/\s+/).filter(Boolean);
  const shown = rows.filter((row) => {
    if (filter.kind && row.kind !== filter.kind) return false;
    if (filter.moon && row.moon_phase !== filter.moon) return false;
    if (filter.tradition && fold(row.tradition ?? '') !== fold(filter.tradition)) return false;
    if (filter.occasion && fold(row.occasion ?? '') !== fold(filter.occasion)) return false;
    if (filter.deity && !has(row.deities, filter.deity)) return false;
    if (filter.material && !has(row.materials, filter.material)) return false;
    if (filter.sharer && sharerKey(row) !== filter.sharer) return false;
    if (!words.length) return true;
    const text = searchText(row);
    return words.every((w) => text.includes(w));
  });
  const time = (row: PublishedRitual) => Date.parse(row.published_at || row.created_at || '') || 0;
  const sort = filter.sort ?? 'newest';
  return shown.sort((a, b) => {
    if (sort === 'saved') return (b.save_count || 0) - (a.save_count || 0) || time(b) - time(a);
    if (sort === 'title') return a.title.localeCompare(b.title);
    return time(b) - time(a);
  });
}

/** The traditions, deities, occasions and materials in use, most common first, for the filter chips. */
export function communityFacets(rows: PublishedRitual[], limit = 12) {
  const count = (values: string[]) => {
    const tally = new Map<string, { label: string; n: number }>();
    for (const v of values) {
      const label = v.trim();
      if (!label) continue;
      const key = fold(label);
      const seen = tally.get(key);
      if (seen) seen.n += 1;
      else tally.set(key, { label, n: 1 });
    }
    return [...tally.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label)).slice(0, limit).map((x) => x.label);
  };
  return {
    traditions: count(rows.map((r) => r.tradition ?? '')),
    deities: count(rows.flatMap((r) => r.deities ?? [])),
    occasions: count(rows.map((r) => r.occasion ?? '')),
    materials: count(rows.flatMap((r) => r.materials ?? [])),
  };
}

// ─── Your shares, and review ───────────────────────────────────────────────

export const canChange = (row: Pick<SharedRitual, 'status'>) => row.status === 'pending' || row.status === 'needs_revision';
export const canSendUpdate = (row: Pick<SharedRitual, 'status'>) => row.status === 'published';
export const canWithdraw = (row: Pick<SharedRitual, 'status'>) => row.status === 'pending' || row.status === 'needs_revision' || row.status === 'published';

/** "1 returned for changes · 2 published": the line beside "My shared rituals". */
export function mySharesLine(rows: Pick<SharedRitual, 'status'>[]): string {
  const n = (status: SharedStatus) => rows.filter((r) => r.status === status).length;
  const parts = [
    n('needs_revision') ? `${n('needs_revision')} returned for changes` : '',
    n('pending') ? `${n('pending')} waiting for review` : '',
    n('published') ? `${n('published')} published` : '',
    n('rejected') ? `${n('rejected')} not accepted` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Nothing shared yet';
}

export const REVIEW_FOLDERS = [
  { value: 'pending', label: 'Waiting' },
  { value: 'needs_revision', label: 'Returned' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Declined' },
  { value: 'all', label: 'All' },
] as const;
export type ReviewFolder = (typeof REVIEW_FOLDERS)[number]['value'];

export const RITUAL_REVIEW_ACTIONS = [
  { value: 'publish', label: 'Publish' },
  { value: 'return', label: 'Return for changes' },
  { value: 'decline', label: 'Decline' },
] as const;
export type RitualReviewAction = (typeof RITUAL_REVIEW_ACTIONS)[number]['value'];

export function inRitualFolder(row: Pick<SharedRitual, 'status'>, folder: ReviewFolder): boolean {
  if (folder === 'all') return row.status !== 'withdrawn' && row.status !== 'superseded';
  return row.status === folder;
}

/** Which review buttons a row offers (the server checks the same). */
export function reviewActionsFor(row: Pick<SharedRitual, 'status'>): RitualReviewAction[] {
  if (row.status === 'pending') return ['publish', 'return', 'decline'];
  if (row.status === 'needs_revision') return ['publish', 'decline'];
  if (row.status === 'published') return ['decline'];
  if (row.status === 'rejected') return ['publish'];
  return [];
}

/** A pre-filled email to the moderators about one shared ritual. */
export function ritualReportUrl(row: Pick<PublishedRitual, 'id' | 'title'>): string {
  const subject = `Report: ${row.title || 'Community ritual'}`;
  const body = ["I'd like to report this Community Ritual.", '', `Title: ${row.title || '(none)'}`, `Reference: community-ritual/${row.id}`, '', 'What concerns you about it?', ''].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** The guidelines a sharer agrees to, beside the Submission Terms. */
export const RITUAL_GUIDELINES = [
  'Share rituals that are yours to share: your own work, or a coven’s that its head or ritual leaders have agreed to share.',
  'Leave out anyone’s name, private details, a coven’s members and roles, and anything said in confidence.',
  'Don’t share the ceremonies, songs or prayers of a closed or initiatory tradition, or present them as open. Read Closed & living traditions first if you are unsure.',
  'Say plainly what needs care: fire, herbs and oils on skin or taken in, pets, pregnancy, and anything else that could harm.',
  'Nothing that curses, harms or controls another person.',
  'Every ritual is reviewed before it appears. It may be returned with a note, edited lightly for safety or clarity, or declined.',
];
