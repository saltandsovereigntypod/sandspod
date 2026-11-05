// "How your charts meet": inter-chart aspects grouped for a kind of bond,
// house overlays (only when both birth times are known), the composite
// (midpoint) chart, and element balance. Pure; no scores or percentages.

import { aspectsAcross, aspectsAmong, allowedOrb, DEFAULT_ORBS, type AspectHit, type AspectPoint } from './aspects.ts';
import { norm } from './ephemeris.ts';
import { houseOf } from './houses.ts';
import { ordinalHouse } from './interpret/houses.ts';
import { makePosition, type Chart, type Position } from './natal.ts';
import { ELEMENTS, elementOf, MODALITIES, modalityOf, type ChartPointName, type Element, type Modality } from './signs.ts';
import { fillNames, PAIRS, pairKey, pairReading, type MajorAspect } from './relationshipPairs.ts';
import { OVERLAY_TEXT, type OverlayPlanet } from './relationshipHouses.ts';
import {
  BRIDGE_TITLE,
  COMPOSITE_SIGN,
  ELEMENT_EVEN,
  ELEMENT_FEW,
  ELEMENT_MANY,
  ELEMENT_MEET,
  ELEMENT_PHRASE,
  elementRelation,
  MARS_ELEMENT,
  MODALITY_LINE,
  MOON_HEARS,
  SIGN_FOCUS,
  SIGN_TOUCH,
  type SignPlanet,
} from './relationshipSigns.ts';
import { ASPECT_TONE, ELEMENT_ROLE, GROUP_ORDER, LENS, TILT_LINE, TYPE_CLOSE, TYPE_FOCUS, TYPE_OPEN, type Family, type GroupKey, type Planet8, type RelType } from './relationshipText.ts';

export const SYN8: Planet8[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant'];
const ORBS = { orbs: { conjunction: 6, opposition: 6, trine: 5, square: 5, sextile: 4 }, luminaryBonus: 1, minors: false };

export const familyOf = (h: Pick<AspectHit, 'aspect'>): Family => (h.aspect === 'trine' || h.aspect === 'sextile' ? 'harm' : h.aspect === 'conjunction' ? 'conj' : 'hard');

// ── Strength ─────────────────────────────────────────────────────────────

/** How much each point weighs in a bond: the lights first, then the personal planets and the Ascendant. */
export const PLANET_WEIGHT: Record<Planet8, number> = { Sun: 3, Moon: 3, Venus: 2.5, Mars: 2.5, Ascendant: 2.5, Mercury: 2, Saturn: 2, Jupiter: 1.5 };
const ASPECT_WEIGHT: Record<string, number> = { conjunction: 1, opposition: 0.95, square: 0.9, trine: 0.85, sextile: 0.7 };
export type Strength = 'Strong' | 'Moderate' | 'Light';

/** 0–1: planet weight × aspect weight × tightness of orb (an exact aspect counts fully, one at the edge of its orb about a third). */
export function strengthScore(hit: Pick<AspectHit, 'a' | 'b' | 'aspect' | 'orb'>): number {
  const pw = ((PLANET_WEIGHT[hit.a as Planet8] ?? 1.5) + (PLANET_WEIGHT[hit.b as Planet8] ?? 1.5)) / 6;
  const allowed = allowedOrb(hit.aspect, hit.a, hit.b, ORBS);
  const tight = Math.max(0, 1 - hit.orb / allowed);
  return pw * (ASPECT_WEIGHT[hit.aspect] ?? 0.5) * (0.35 + 0.65 * tight);
}
export const strengthLabel = (score: number): Strength => (score >= 0.6 ? 'Strong' : score >= 0.35 ? 'Moderate' : 'Light');

// ── Dedupe ───────────────────────────────────────────────────────────────

const sentencesOf = (text: string): string[] => text.split(/(?<=[.?])\s+(?=[A-Z“{])/).map((x) => x.trim()).filter(Boolean);

/** Drop any sentence already used on the page (tracked in seen); returns the text that is left, or '' if none. */
export function dedupe(text: string, seen: Set<string>): string {
  const keep = sentencesOf(text).filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return keep.join(' ');
}

// ── Contacts ─────────────────────────────────────────────────────────────

export type Contact = {
  hit: AspectHit;
  family: Family;
  score: number;
  strength: Strength;
  /** The reading for this pair and aspect, with names filled in. */
  text: string;
  /** When it matters whose planet is whose. */
  whose: string | null;
  /** How this kind of bond reads the contact. */
  lens: string | null;
};
export type Group = { key: GroupKey; contacts: Contact[] };

/** Which group a contact belongs to. Mercury talks; Mars/Saturn friction is a watch-point; other friction grows; Jupiter and conjunctions are gifts; the rest flows. */
export function groupOf(a: ChartPointName, b: ChartPointName, family: Family): GroupKey {
  const has = (p: string) => a === p || b === p;
  if (has('Mercury')) return 'talk';
  if (family === 'hard' && (has('Mars') || has('Saturn'))) return 'watch';
  if (family === 'hard' || has('Saturn')) return 'grow';
  if (family === 'conj' || has('Jupiter')) return 'bring';
  return 'flows';
}

const pts = (c: Chart): AspectPoint[] =>
  c.positions.filter((p) => (SYN8 as string[]).includes(p.point) && (p.point !== 'Ascendant' || c.timeKnown)).map((p) => ({ point: p.point, longitude: p.longitude }));

/** Ranking for a kind of bond: the raw strength, nudged up when the bond leans on one of the planets. */
export function rankScore(c: Pick<Contact, 'hit' | 'score'>, type: RelType): number {
  const focus: string[] = TYPE_FOCUS[type];
  return c.score * ([c.hit.a, c.hit.b].some((p) => focus.includes(p)) ? 1.15 : 1);
}

function lensFor(p: Planet8, q: Planet8, family: Family, type: RelType): string | null {
  const lens = LENS[type];
  const lead = (Object.keys(lens) as Planet8[]).find((k) => k === p || k === q);
  if (!lead) return null;
  const hard = family === 'hard' || (family === 'conj' && [p, q].some((x) => x === 'Mars' || x === 'Saturn'));
  return lens[lead]![hard ? 'hard' : 'easy'];
}

/** Every inter-chart contact, read for this kind of bond, strongest first. */
export function contacts(a: Chart, b: Chart, type: RelType, na = 'the first', nb = 'the second'): Contact[] {
  return aspectsAcross(pts(a), pts(b), ORBS)
    .map((hit) => {
      const p = hit.a as Planet8;
      const q = hit.b as Planet8;
      const family = familyOf(hit);
      const names = p === q ? {} : { [p]: na, [q]: nb };
      const score = strengthScore(hit);
      const whose = PAIRS[pairKey(p, q)]?.whose;
      return {
        hit,
        family,
        score,
        strength: strengthLabel(score),
        text: fillNames(pairReading(p, q, hit.aspect as MajorAspect, type) ?? '', names),
        whose: whose && p !== q ? fillNames(whose, names) : null,
        lens: lensFor(p, q, family, type),
      };
    })
    .sort((x, y) => rankScore(y, type) - rankScore(x, type));
}

/** Contacts grouped and ordered for the kind of bond, each group strongest first. */
export function meet(a: Chart, b: Chart, type: RelType, na?: string, nb?: string): Group[] {
  const all = contacts(a, b, type, na, nb);
  return GROUP_ORDER[type].map((key) => ({ key, contacts: all.filter((c) => groupOf(c.hit.a, c.hit.b, c.family) === key) }));
}

export type Overlay = { whose: 'a' | 'b'; point: ChartPointName; house: number };
const OVERLAY_POINTS: ChartPointName[] = ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

/** Where one chart's planets fall in the other's houses; null unless both birth times and places are known. */
export function overlays(a: Chart, b: Chart): Overlay[] | null {
  if (!a.houses || !b.houses) return null;
  const into = (from: Chart, to: Chart, whose: 'a' | 'b'): Overlay[] =>
    from.positions.filter((p) => OVERLAY_POINTS.includes(p.point)).map((p) => ({ whose, point: p.point, house: houseOf(p.longitude, to.houses!.cusps) }));
  return [...into(a, b, 'a'), ...into(b, a, 'b')];
}

// ── Composite ────────────────────────────────────────────────────────────

/** The midpoint on the shorter arc (so 350° and 10° meet at 0°, not 180°). */
export function midpoint(x: number, y: number): number {
  const d = ((((y - x) % 360) + 540) % 360) - 180;
  return norm(x + d / 2);
}

const COMPOSITE_POINTS: ChartPointName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

export type Composite = { positions: Position[]; aspects: AspectHit[] };

export function composite(a: Chart, b: Chart): Composite {
  const positions: Position[] = [];
  for (const point of COMPOSITE_POINTS) {
    const pa = a.positions.find((p) => p.point === point);
    const pb = b.positions.find((p) => p.point === point);
    if (pa && pb) positions.push(makePosition(point, midpoint(pa.longitude, pb.longitude), null, null));
  }
  const aspects = aspectsAmong(positions.map((p) => ({ point: p.point, longitude: p.longitude })), { ...DEFAULT_ORBS, minors: false });
  return { positions, aspects };
}

// ── Balance ──────────────────────────────────────────────────────────────

const BALANCE_POINTS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
export type Tally = { elements: Record<Element, number>; modalities: Record<Modality, number> };

/** Element and modality counts over the seven classical planets of any number of people. */
export function balance(people: { point: string; sign: Position['sign'] }[][]): Tally {
  const elements = Object.fromEntries(ELEMENTS.map((e) => [e, 0])) as Record<Element, number>;
  const modalities = Object.fromEntries(MODALITIES.map((m) => [m, 0])) as Record<Modality, number>;
  for (const person of people)
    for (const p of person)
      if (BALANCE_POINTS.includes(p.point)) {
        elements[elementOf(p.sign)] += 1;
        modalities[modalityOf(p.sign)] += 1;
      }
  return { elements, modalities };
}

/** The element with the most (ties: first) and the one with the least. */
export function extremes(t: Tally): { most: Element; least: Element } {
  const sorted = [...ELEMENTS].sort((x, y) => t.elements[y] - t.elements[x]);
  return { most: sorted[0], least: sorted[sorted.length - 1] };
}

const COMPLEMENT: Record<Element, Element> = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' };

/** Suggested ritual-role pairings: each member by their Sun's element, paired with a complementary one. */
export function pairings(members: { name: string; sunSign: Position['sign'] }[]): string[] {
  const pool = members.map((m) => ({ ...m, el: elementOf(m.sunSign) }));
  const used = new Set<number>();
  const out: string[] = [];
  pool.forEach((m, i) => {
    if (used.has(i)) return;
    const j = pool.findIndex((o, k) => k !== i && !used.has(k) && o.el === COMPLEMENT[m.el]);
    if (j < 0) return;
    used.add(i);
    used.add(j);
    out.push(`${m.name} (${ELEMENT_ROLE[m.el]}) with ${pool[j].name} (${ELEMENT_ROLE[pool[j].el]})`);
  });
  return out;
}

// ── The heart of it ──────────────────────────────────────────────────────

/** Two charts hold 14 classical planets; 5 or more in one element is a lot, 1 or none is little. */
export function elementSummary(t: Tally): { many: Element | null; few: Element | null; lines: string[] } {
  const sorted = [...ELEMENTS].sort((x, y) => t.elements[y] - t.elements[x]);
  const many = t.elements[sorted[0]] >= 5 ? sorted[0] : null;
  const least = sorted[sorted.length - 1];
  const few = t.elements[least] <= 1 ? least : null;
  const lines = [...(many ? [ELEMENT_MANY[many]] : []), ...(few ? [ELEMENT_FEW[few]] : [])];
  return { many, few, lines: lines.length ? lines : [ELEMENT_EVEN] };
}

const ASPECT_WORD: Record<string, string> = { conjunction: 'conjunct', sextile: 'sextile', square: 'square', trine: 'trine', opposition: 'opposite' };
const themeOf = (c: Contact) => PAIRS[pairKey(c.hit.a as Planet8, c.hit.b as Planet8)]?.theme ?? `${c.hit.a} and ${c.hit.b}`;
const isHard = (c: Pick<Contact, 'hit' | 'family'>) => c.family === 'hard' || (c.family === 'conj' && [c.hit.a, c.hit.b].some((p) => p === 'Mars' || p === 'Saturn'));

/** Whether the strongest contacts lean easy, hard or mixed (a conjunction with Mars or Saturn counts as hard). */
export function tiltOf(top: Pick<Contact, 'hit' | 'family'>[]): 'easy' | 'hard' | 'mixed' | 'none' {
  if (!top.length) return 'none';
  const hard = top.filter(isHard).length;
  const easy = top.length - hard;
  return easy >= hard * 2 ? 'easy' : hard >= easy * 2 ? 'hard' : 'mixed';
}

/** 3–5 sentences: the strongest thread, the runners-up, whether they lean easy or hard, the element balance, and a word for this kind of bond. */
export function heartOfIt(ranked: Contact[], tally: Tally, type: RelType, na: string, nb: string): string[] {
  const top = ranked.filter((c) => c.strength !== 'Light').slice(0, 5);
  const lead = ranked[0];
  const parts: string[] = [];
  if (lead) {
    const h = lead.hit;
    parts.push(`${TYPE_OPEN[type]}, the strongest thread between you is ${themeOf(lead)} (${na}’s ${h.a} ${ASPECT_WORD[h.aspect] ?? h.aspect} ${nb}’s ${h.b}), ${ASPECT_TONE[h.aspect] ?? 'a theme you share'}.`);
  }
  const next = [...new Set(ranked.slice(1, 6).map(themeOf))].filter((t) => !lead || t !== themeOf(lead)).slice(0, 2);
  const nextLine = next.length === 2 ? `Close behind come ${next[0]} and ${next[1]}.` : next.length === 1 ? `Close behind comes ${next[0]}.` : null;
  if (nextLine) parts.push(nextLine);
  parts.push(TILT_LINE[tiltOf(top.length ? top : ranked.slice(0, 3))]);
  parts.push(...elementSummary(tally).lines);
  const close = TYPE_CLOSE[type];
  parts.push(close);
  // Keep it to five sentences: drop the runners-up first, then the closing word.
  let out = parts;
  if (out.length > 5 && nextLine) out = out.filter((x) => x !== nextLine);
  if (out.length > 5) out = out.filter((x) => x !== close);
  return out;
}

// ── Signs ────────────────────────────────────────────────────────────────

export type SignSection = { title: string; lines: string[] };
const signOf = (c: Chart, p: string) => c.positions.find((x) => x.point === p)?.sign;

function personSignLine(name: string, planet: SignPlanet, sign: Position['sign']): string {
  const body = planet === 'Mars' ? MARS_ELEMENT[elementOf(sign)] : SIGN_TOUCH[planet][sign];
  return `${name}’s ${planet} in ${sign} ${body} ${MODALITY_LINE[planet][modalityOf(sign)]}`;
}

/** For the placements this kind of bond looks at: each person's sign, how the two elements meet, and how each one's Mercury reaches the other's Moon. */
export function signSections(a: Chart, b: Chart, type: RelType, na: string, nb: string): SignSection[] {
  const out: SignSection[] = [];
  for (const { planet, title } of SIGN_FOCUS[type]) {
    const sa = signOf(a, planet);
    const sb = signOf(b, planet);
    if (!sa || !sb) continue;
    const ea = elementOf(sa);
    const eb = elementOf(sb);
    const meetLine = ELEMENT_MEET[planet][elementRelation(ea, eb)]
      .replace('{A}', na)
      .replace('{B}', nb)
      .replace('{ea}', ELEMENT_PHRASE[planet][ea])
      .replace('{eb}', ELEMENT_PHRASE[planet][eb]);
    out.push({ title, lines: [personSignLine(na, planet, sa), personSignLine(nb, planet, sb), meetLine] });
  }
  const bridge = (from: Chart, to: Chart, x: string, y: string): string | null => {
    const merc = signOf(from, 'Mercury');
    const moon = signOf(to, 'Moon');
    if (!merc || !moon) return null;
    const same = elementOf(merc) === elementOf(moon);
    return `${x} talks ${ELEMENT_PHRASE.Mercury[elementOf(merc)]}; ${y}’s ${moon} Moon hears best ${MOON_HEARS[elementOf(moon)]}.${same ? ` That comes naturally to ${x}.` : ` That is worth practising, ${x}.`}`;
  };
  const bridges = [bridge(a, b, na, nb), bridge(b, a, nb, na)].filter((l): l is string => !!l);
  if (bridges.length) out.push({ title: BRIDGE_TITLE, lines: bridges });
  return out;
}

// ── Composite lines ──────────────────────────────────────────────────────

const COMPOSITE_PAIR_POINTS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const COMPOSITE_LEAD: Record<'Sun' | 'Moon' | 'Venus', string> = {
  Sun: 'Composite Sun in {sign}, what the bond is for:',
  Moon: 'Composite Moon in {sign}, what it needs:',
  Venus: 'Composite Venus in {sign}, how it enjoys itself:',
};

/** The composite Sun, Moon and Venus by sign, then its three tightest aspects among the classical planets. */
export function compositeLines(comp: Composite): string[] {
  const lines: string[] = [];
  for (const p of ['Sun', 'Moon', 'Venus'] as const) {
    const sign = comp.positions.find((x) => x.point === p)?.sign;
    if (sign) lines.push(`${COMPOSITE_LEAD[p].replace('{sign}', sign)} ${COMPOSITE_SIGN[p][sign]}`);
  }
  comp.aspects
    .filter((h) => COMPOSITE_PAIR_POINTS.includes(h.a) && COMPOSITE_PAIR_POINTS.includes(h.b) && h.aspect in ASPECT_TONE)
    .slice(0, 3)
    .forEach((h) => {
      const theme = PAIRS[pairKey(h.a as Planet8, h.b as Planet8)]?.theme ?? `${h.a} and ${h.b}`;
      lines.push(`Composite ${h.a} ${ASPECT_WORD[h.aspect]} ${h.b}: ${theme}, ${ASPECT_TONE[h.aspect]}.`);
    });
  return lines;
}

// ── The whole page ───────────────────────────────────────────────────────

export type OverlayLine = { key: string; text: string };
export type Reading = { heart: string[]; groups: Group[]; signs: SignSection[]; overlays: OverlayLine[] | null; composite: string[] };

/**
 * Everything the page shows, in page order, with no sentence repeated: the
 * heart of it, the contact groups (up to perGroup each, strongest first), the
 * sign readings, the house overlays and the composite.
 */
export function reading(a: Chart, b: Chart, type: RelType, na: string, nb: string, perGroup = 4): Reading {
  const seen = new Set<string>();
  const ranked = contacts(a, b, type, na, nb);
  const tally = balance([a.positions, b.positions]);
  const heart = heartOfIt(ranked, tally, type, na, nb).map((s) => dedupe(s, seen)).filter(Boolean);

  const groups: Group[] = GROUP_ORDER[type].map((key) => ({
    key,
    contacts: ranked
      .filter((c) => groupOf(c.hit.a, c.hit.b, c.family) === key)
      .slice(0, perGroup)
      .map((c) => ({ ...c, text: dedupe(c.text, seen), whose: c.whose ? dedupe(c.whose, seen) || null : null, lens: c.lens ? dedupe(c.lens, seen) || null : null })),
  }));

  const signs = signSections(a, b, type, na, nb)
    .map((s) => ({ ...s, lines: s.lines.map((l) => dedupe(l, seen)).filter(Boolean) }))
    .filter((s) => s.lines.length);

  const ov = overlays(a, b);
  const overlayLines = ov
    ? ov
        .map((o) => {
          const [p, h] = o.whose === 'a' ? [na, nb] : [nb, na];
          const meaning = OVERLAY_TEXT[o.point as OverlayPlanet][o.house].replace(/\{P\}/g, p).replace(/\{H\}/g, h);
          return { key: `${o.whose}${o.point}`, text: dedupe(`${p}’s ${o.point} in ${h}’s ${ordinalHouse(o.house)}: ${meaning}`, seen) };
        })
        .filter((o) => o.text)
    : null;

  const comp = compositeLines(composite(a, b)).map((l) => dedupe(l, seen)).filter(Boolean);
  return { heart, groups, signs, overlays: overlayLines, composite: comp };
}
