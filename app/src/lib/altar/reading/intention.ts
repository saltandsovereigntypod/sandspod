// An altar's intention: one line saying what the altar is for, kept per altar
// in the craft store (`altar.intentions`, one entry per altarId). And how well
// each object on it supports that intention, read from the Living Library.

import type { LibraryEntry } from '../../library/types.ts';
import { shortLabel } from '../cabinet.ts';
import type { SavedObject } from '../types.ts';
import { listing, objectCorrespondences, objectUid } from './correspondence.ts';

export const INTENTIONS_COLLECTION = 'altar.intentions';
export const INTENTION_MAX = 160;

/** One entry of `altar.intentions`. */
export type IntentionEntry = { altarId: string; text: string; setAt: string };

export function intentionEntry(altarId: string, text: string, now: string): IntentionEntry {
  return { altarId, text: text.replace(/\s+/g, ' ').trim().slice(0, INTENTION_MAX), setAt: now };
}

/** The altar's current intention (the newest, should two devices both have set one). */
export function intentionFor<T extends { data: IntentionEntry; updatedAt?: string }>(entries: T[], altarId: string): T | null {
  const mine = entries.filter((e) => e.data?.altarId === altarId && e.data.text);
  mine.sort((a, b) => Date.parse(b.updatedAt ?? b.data.setAt) - Date.parse(a.updatedAt ?? a.data.setAt));
  return mine[0] ?? null;
}

/**
 * The words people write and the Library words they mean: "money" finds
 * prosperity, "calm" finds peace. Kept small and traditional.
 */
const THEMES: Record<string, string[]> = {
  prosperity: ['money', 'prosperity', 'abundance', 'wealth', 'success', 'luck', 'job', 'work', 'career', 'business', 'plenty', 'growth', 'manifestation'],
  love: ['love', 'romance', 'attraction', 'passion', 'beauty', 'self-love', 'relationship', 'friendship', 'compassion', 'harmony', 'fertility'],
  protection: ['protection', 'protect', 'safety', 'safe', 'warding', 'shield', 'boundaries', 'boundary', 'banishing', 'grounding', 'strength'],
  healing: ['healing', 'heal', 'health', 'recovery', 'comfort', 'grief', 'emotional healing', 'soothing', 'vitality', 'renewal'],
  peace: ['peace', 'calm', 'rest', 'sleep', 'relaxation', 'tranquility', 'serenity', 'soothing', 'stress', 'anxiety', 'harmony'],
  clarity: ['clarity', 'focus', 'study', 'learning', 'wisdom', 'communication', 'memory', 'mental clarity', 'truth', 'knowledge', 'decision'],
  intuition: ['intuition', 'psychic', 'divination', 'dreams', 'dream', 'visions', 'insight', 'scrying', 'spirit work', 'meditation', 'mystery'],
  courage: ['courage', 'confidence', 'strength', 'motivation', 'energy', 'willpower', 'victory', 'determination', 'action'],
  cleansing: ['cleansing', 'cleanse', 'purification', 'purify', 'clearing', 'release', 'letting go', 'banishing', 'fresh start'],
  devotion: ['devotion', 'ancestors', 'ancestor', 'honour', 'honor', 'offering', 'spirituality', 'connection', 'blessing', 'gratitude'],
  transformation: ['transformation', 'change', 'endings', 'new beginnings', 'beginnings', 'rebirth', 'shadow work', 'shadow'],
};

const STOP = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'my', 'me', 'i', 'with', 'into', 'on', 'this', 'that', 'be', 'more', 'some', 'our', 'we', 'your', 'it', 'is', 'at', 'by', 'from']);

/** The themes and plain words an intention names. */
export function intentionKeywords(text: string): { themes: string[]; words: string[] } {
  const lower = ` ${text.toLowerCase().replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ')} `;
  const words = [...new Set(lower.trim().split(' ').filter((w) => w.length > 2 && !STOP.has(w)))];
  const themes = Object.entries(THEMES)
    .filter(([theme, list]) => lower.includes(` ${theme}`) || list.some((w) => lower.includes(` ${w}`)))
    .map(([theme]) => theme);
  return { themes, words };
}

/** The themes a list of Library uses falls under. */
export function usesThemes(uses: string[]): string[] {
  return Object.entries(THEMES)
    .filter(([theme, list]) => uses.some((u) => u === theme || list.includes(u) || list.some((w) => u.includes(w))))
    .map(([theme]) => theme);
}

export type Support = {
  index: number;
  uid: string;
  label: string;
  /** 0 (no link found) to 1 (speaks straight to it). */
  score: number;
  /** The uses that match. */
  matches: string[];
  note: string;
};

/** How well one object supports an intention. */
export function supportFor(object: SavedObject, intention: string, entries?: LibraryEntry[] | null, index = 0): Support {
  const label = shortLabel(object.label, 'This piece');
  const { themes, words } = intentionKeywords(intention);
  const uses = [...new Set(objectCorrespondences(object, entries).flatMap((c) => c.uses))];
  const direct = uses.filter((u) => words.some((w) => u.includes(w) || w.includes(u)));
  const thematic = uses.filter((u) => !direct.includes(u) && usesThemes([u]).some((t) => themes.includes(t)));
  const matches = [...direct, ...thematic].slice(0, 3);
  const score = !uses.length ? 0 : Math.min(1, direct.length * 0.5 + thematic.length * 0.3);
  const note = !uses.length
    ? `${label} has no traditional uses in the Library yet, so its place here is yours to say.`
    : matches.length
      ? `${label} speaks to it: ${listing(matches)}.`
      : `${label} isn’t traditionally tied to this; it may hold the altar in another way.`;
  return { index, uid: objectUid(object), label, score: Math.round(score * 100) / 100, matches, note };
}

/** Every object scored against the intention, strongest first. Cloths and backdrops are left out. */
export function scoreAltar(objects: SavedObject[], intention: string, entries?: LibraryEntry[] | null): Support[] {
  if (!intention.trim()) return [];
  return objects
    .map((o, i) => (o.type === 'cloth' ? null : supportFor(o, intention, entries, i)))
    .filter((s): s is Support => !!s)
    .sort((a, b) => b.score - a.score || a.index - b.index);
}

/** 0–1: how much of the altar speaks to the intention. */
export function coherence(supports: Support[]): number {
  if (!supports.length) return 0;
  return Math.round((supports.filter((s) => s.score > 0).length / supports.length) * 100) / 100;
}
