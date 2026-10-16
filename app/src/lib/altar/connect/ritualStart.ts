// Beginning a ritual on an altar: the start source (a premade working or one
// of your templates, linked to the altar), where it came from (so the altar
// can find its closing words and intention again after a restart), whether a
// step's "light all candles" should light every candle or only the colours
// the working names, and the crystal care done on the altar that a stone's own
// log can take. Pure, so it can be tested.

import { colorsInText, draftForAltar } from './ritual.ts';
import { premadeById, premadeDraft } from '../../rituals/premade/index.ts';
import type { Premade } from '../../rituals/premade/types.ts';
import type { StartSource } from '../../rituals/lifecycle.ts';
import type { Ingredient, RitualSession, TemplateDraft, TemplateRow } from '../../rituals/types.ts';

/** What a ritual on the altar is begun from. */
export type RitualSource = { kind: 'premade'; premade: Premade } | { kind: 'template'; template: TemplateRow };

type NamedThing = { name?: string | null; ref?: string | null };

/**
 * 'matching' when the working's words or ingredients name candle colours
 * ("Light the green candle", "A white candle", traditional/candle/white),
 * so a step lights those; otherwise 'all', the website's way.
 */
export function candleScopeFor(texts: (string | null | undefined)[], ingredients: NamedThing[] = []): 'all' | 'matching' {
  for (const text of texts) if (text && colorsInText(text).length) return 'matching';
  for (const item of ingredients) {
    if (item?.name && colorsInText(item.name).length) return 'matching';
    if (item?.ref && colorsInText(item.ref.replace(/[/_-]+/g, ' ')).length) return 'matching';
  }
  return 'all';
}

const ingredientList = (value: unknown): NamedThing[] => (Array.isArray(value) ? (value as Ingredient[]).filter((i) => i && typeof i === 'object') : []);

export const draftCandleScope = (draft: TemplateDraft) =>
  candleScopeFor(
    draft.steps.flatMap((s) => [s.title, s.instructions, s.spoken_text]),
    draft.ingredients,
  );

export const sourceCandleScope = (source: RitualSource) =>
  source.kind === 'premade'
    ? candleScopeFor(source.premade.steps.flatMap((s) => [s.title, s.instructions, s.spoken]), source.premade.ingredients)
    : candleScopeFor(
        (source.template.ritual_template_steps ?? []).flatMap((s) => [s.title, s.instructions, s.spoken_text]),
        ingredientList(source.template.metadata?.ingredients),
      );

/** A running session's candle scope, from its own steps and ingredients. */
export const sessionCandleScope = (session: RitualSession) =>
  candleScopeFor(
    session.session_steps.flatMap((s) => [s.title, s.instructions, s.spoken_text]),
    ingredientList(session.metadata?.ingredients),
  );

/** The source as startRitual takes it, linked to the altar it's done on. */
export function startOnAltar(source: RitualSource, altarId: string): StartSource {
  if (source.kind === 'premade') return { kind: 'draft', draft: draftForAltar(premadeDraft(source.premade), altarId) };
  return { kind: 'template', template: { ...source.template, linked_altar_id: altarId } };
}

/** Remember which premade working a session came from (drafts carry no id). */
export function withRitualOrigin(session: RitualSession, source: RitualSource): RitualSession {
  if (source.kind !== 'premade' || session.metadata?.premadeId === source.premade.id) return session;
  return { ...session, metadata: { ...session.metadata, premadeId: source.premade.id } };
}

/** Keep a draft's closing words with its session (sessions don't carry them), for a draft that isn't a premade. */
export function withDraftClosing(session: RitualSession, draft: Pick<TemplateDraft, 'closing'>): RitualSession {
  const closing = String(draft.closing || '').trim();
  if (!closing || session.metadata?.closing === closing) return session;
  return { ...session, metadata: { ...session.metadata, closing } };
}

/** Whether a running session is being done on this altar. */
export function runsOnAltar(session: RitualSession | null | undefined, altarId: string | null | undefined): boolean {
  if (!session || !altarId) return false;
  return session.linked_altar_id === altarId || session.metadata?.ranOnAltar === altarId;
}

export type RitualOrigin = {
  title: string;
  /** The closing words (sessions don't keep them). */
  closing: string;
  /** The premade's intention key, when it came from one. */
  intentionKey: string | null;
  candleScope: 'all' | 'matching';
  premade: Premade | null;
  template: TemplateRow | null;
};

/** What the overlay needs to know about a running session's source. */
export function ritualOrigin(session: RitualSession, templates: TemplateRow[]): RitualOrigin {
  const premadeId = typeof session.metadata?.premadeId === 'string' ? session.metadata.premadeId : null;
  const premade = premadeById(premadeId);
  const template = !premade && session.template_id ? (templates.find((t) => t.id === session.template_id) ?? null) : null;
  return {
    title: session.title || premade?.title || template?.title || 'Ritual Session',
    closing: premade?.closing ?? template?.closing ?? (typeof session.metadata?.closing === 'string' ? session.metadata.closing : ''),
    intentionKey: premade?.intention ?? null,
    candleScope: sessionCandleScope(session),
    premade,
    template,
  };
}

// The crystal care done on the altar that a stone's own log can take lives in
// altarCare.ts (no ritual data), so the website's altar bundle can use it.
export { lastAltarCareOf, type AltarCare } from './altarCare.ts';
