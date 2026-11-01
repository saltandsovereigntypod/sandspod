// "Your chart in plain words": the whole chart explained in everyday
// language, and how its pieces fit together. Not the readings strung end to
// end: this looks at the chart as a whole (how the Sun, Moon and rising get
// on, what steers the chart, where the planets gather, the tightest
// push-pulls and easy links) and assembles paragraphs from the small
// combinational tables in plainWordsData.ts. Five parts, each with a short
// Simple version and an in-depth Detailed one, each ending in links to the
// detailed readings on the chart page. Charts without a birth time (no
// rising sign, no houses) are said so plainly and read from what there is.
// Pure and deterministic.

import { type AspectHit, type AspectName } from '../aspects.ts';
import { strongPlacements } from '../craftLinks.ts';
import { SIGN_STYLE } from '../meanings.ts';
import { positionOf, type Chart, type Position } from '../natal.ts';
import { PLANET_GUIDES } from '../planetGuides.ts';
import { ELEMENTS, MODALITIES, TRADITIONAL_RULER, elementOf, modalityOf, type Classical, type Element, type Modality, type ZodiacSign } from '../signs.ts';
import { leadingQuadrant, leaningSides } from './compose.ts';
import { ordinalHouse } from './houses.ts';
import {
  ASPECT_PLAIN,
  BIRTH_PHASE,
  ELEMENT_LEAN,
  ELEMENT_PAIR,
  ELEMENT_PLAIN,
  ELEMENT_SAME,
  GLOSSES,
  HOUSE_PLAIN,
  MODE_LEAN,
  MODE_PAIR,
  MODE_PLAIN,
  MODE_SAME,
  MODERN_CORULER,
  PATTERN_PLAIN,
  PLANET_PLAIN,
  QUADRANT_PLAIN,
  RULER_PLAIN,
  SIDE_PLAIN,
  SIGN_PLAIN,
  TEMPERAMENT,
  type PlainPoint,
} from './plainWordsData.ts';

export { GLOSSES };

/** The chart page's tabs a link can open. */
export type ChartTab = 'wheel' | 'placements' | 'aspects' | 'balance' | 'reading' | 'transits' | 'craft';

/** Where a part's link leads: a tab on the chart page, a planet guide, its days and hours, or the natal altar. */
export type PlainLink =
  | { label: string; tab: ChartTab }
  | { label: string; planet: Classical }
  | { label: string; hours: Classical }
  | { label: string; altar: Classical };

export type PlainPartId = 'big-picture' | 'runs-the-show' | 'energy' | 'tensions-gifts' | 'fits-together';

export type PlainPart = {
  id: PlainPartId;
  title: string;
  /** A short version: a few sentences. */
  simple: string;
  /** In depth: several paragraphs, a blank line between them. */
  detailed: string;
  links: PlainLink[];
};

export type PlainWords = { intro: string; parts: PlainPart[] };

// ── Small helpers ───────────────────────────────────────────────────────────

/** Explains each jargon term the first time a text uses it. */
class Gloss {
  private seen = new Set<string>();
  t(term: keyof typeof GLOSSES & string, shown: string = term): string {
    if (this.seen.has(term)) return shown;
    this.seen.add(term);
    return `${shown} (${GLOSSES[term]})`;
  }
  /** The explanation alone, the first time (", the sign that was…"), else nothing. */
  note(term: string): string {
    if (this.seen.has(term)) return '';
    this.seen.add(term);
    return `, ${GLOSSES[term]}`;
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const join = (paras: (string | null | false | undefined)[]) => paras.filter(Boolean).join('\n\n');
const an = (word: string) => (/^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`);

const PLANETS: PlainPoint[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const OUTER = ['Uranus', 'Neptune', 'Pluto'];
const BIG = ['Sun', 'Moon', 'Ascendant'];

/** "the Sun", "Mars", "your rising sign". */
function nameOf(p: string, g?: Gloss): string {
  if (p === 'Sun' || p === 'Moon') return `the ${p}`;
  if (p === 'Ascendant') return g ? `your ${g.t('rising sign')}` : 'your rising sign';
  return p;
}

function houseWord(n: number, g: Gloss): string {
  return `${ordinalHouse(n).replace(' house', '')} ${g.t('house')}`;
}

const orbNote = (orb: number) => (orb < 1 ? 'almost exact, so you feel it strongly' : orb < 3 ? 'a close one' : 'wide enough to be felt now and then rather than all the time');

const plainOf = (p: string) => PLANET_PLAIN[p as PlainPoint];

/** "Mars (your drive and fight)", or for the rising sign "the way you meet the world (your rising sign, …)". */
function labelled(p: string, g: Gloss): string {
  return p === 'Ascendant' ? `the way you meet the world (your rising sign${g.note('rising sign')})` : `${nameOf(p)} (${plainOf(p).self})`;
}

// ── Part 1: the big picture ─────────────────────────────────────────────────

type BigItem = { role: string; sign: ZodiacSign };

function roleList(items: BigItem[]): string {
  return list(items.map((i) => `${i.role} (${i.sign})`));
}

/** How the three (or two) agree or pull apart by element, with no line said twice. */
function elementStory(items: BigItem[], detailed: boolean): string[] {
  const groups = new Map<Element, BigItem[]>();
  for (const i of items) groups.set(elementOf(i.sign), [...(groups.get(elementOf(i.sign)) ?? []), i]);
  const out: string[] = [];
  const all = [...groups.entries()];
  if (all.length === 1) {
    const [el, xs] = all[0];
    out.push(`${cap(roleList(xs))} are ${xs.length > 2 ? 'all' : 'both'} ${el} signs.${detailed ? ` ${ELEMENT_SAME[el]}` : ` All of a piece: ${ELEMENT_PLAIN[el].is} run right through you.`}`);
    return out;
  }
  for (const [el, xs] of all) {
    if (xs.length > 1) out.push(`${cap(roleList(xs))} are both ${el} signs, so they back each other up.${detailed ? ` ${ELEMENT_SAME[el]}` : ''}`);
  }
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const [ea, xa] = all[i];
      const [eb, xb] = all[j];
      const [e1, x1, e2, x2] = ELEMENTS.indexOf(ea) < ELEMENTS.indexOf(eb) ? [ea, xa, eb, xb] : [eb, xb, ea, xa];
      const pair = ELEMENT_PAIR[`${e1}|${e2}`];
      const who1 = list(x1.map((x) => x.role));
      const who2 = list(x2.map((x) => x.role));
      if (detailed) {
        out.push(
          `${cap(roleList(x1))} ${x1.length > 1 ? 'are' : 'is'} ${e1}, and ${roleList(x2)} ${x2.length > 1 ? 'are' : 'is'} ${e2}. ${pair.image}. ${pair.text} So ${who1} may want to ${ELEMENT_PLAIN[e1].wants}, while ${who2} would rather ${ELEMENT_PLAIN[e2].wants}. ${pair.work}`,
        );
      } else {
        out.push(`${cap(who1)} (${e1}) and ${who2} (${e2}) make ${pair.image.split(': ')[1]}.`);
      }
    }
  }
  return out;
}

/** The same, by modality: starter, keeper or adapter. */
function modeStory(items: BigItem[], g: Gloss): string[] {
  const groups = new Map<Modality, BigItem[]>();
  for (const i of items) groups.set(modalityOf(i.sign), [...(groups.get(modalityOf(i.sign)) ?? []), i]);
  const all = [...groups.entries()];
  const out: string[] = [
    `Each sign also has a ${g.t('modality')}: it is one of the ${g.t('cardinal')}, ${g.t('fixed')} or ${g.t('mutable')} signs.`,
  ];
  if (all.length === 1) {
    const [m, xs] = all[0];
    out.push(`${cap(roleList(xs))} are ${xs.length > 2 ? 'all' : 'both'} ${m}. ${MODE_SAME[m]}`);
    return out;
  }
  for (const [m, xs] of all) out.push(`${cap(roleList(xs))} ${xs.length > 1 ? 'are' : 'is'} ${m}, so that side of you ${MODE_PLAIN[m].style}.`);
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const [a, b] = [all[i][0], all[j][0]].sort((x, y) => MODALITIES.indexOf(x) - MODALITIES.indexOf(y));
      const roles = (m: Modality) => list(groups.get(m)!.map((x) => x.role));
      const text = MODE_PAIR[`${a}|${b}`];
      out.push(`Between ${roles(a)} and ${roles(b)}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`);
    }
  }
  return out;
}

const BIG_PAIR: Record<string, { theme: string; hard: string; soft: string; blend: string }> = {
  'Sun|Moon': {
    theme: 'what you want and what you need',
    hard: 'can pull against each other, so you may feel torn between your goals and your comfort until you learn to give each its due',
    soft: 'work together, so your goals and your emotional needs tend to point the same way',
    blend: 'are bound up together, so you are single-minded, with heart and will moving as one',
  },
  'Sun|Ascendant': {
    theme: 'who you are and how you come across',
    hard: 'do not always match, so people may misread you at first until they know you better',
    soft: 'get on well, so the way you come across is a fair picture of who you are',
    blend: 'are one and the same, so what people see is very much what they get',
  },
  'Moon|Ascendant': {
    theme: 'what you feel and what you show',
    hard: 'can clash, so your feelings may show before you mean them to, or hide behind a manner that does not match',
    soft: 'work together, so your feelings come through naturally in the way you meet people',
    blend: 'are bound up together, so your moods are written on your face and people sense how you feel straight away',
  },
};

function bigPicture(chart: Chart, detailed: boolean): string {
  const g = new Gloss();
  const sun = positionOf(chart, 'Sun')!;
  const moon = positionOf(chart, 'Moon')!;
  const asc = positionOf(chart, 'Ascendant');
  const S = SIGN_PLAIN[sun.sign];
  const M = SIGN_PLAIN[moon.sign];
  const A = asc ? SIGN_PLAIN[asc.sign] : null;
  const items: BigItem[] = [
    { role: 'your Sun', sign: sun.sign },
    { role: 'your Moon', sign: moon.sign },
    ...(asc ? [{ role: 'your rising sign', sign: asc.sign }] : []),
  ];
  const orSign = moon.orSign ? ` Without a birth time the Moon could be in ${moon.orSign} instead, since it changed sign that day; read both and see which feels truer.` : '';

  if (!detailed) {
    const lines = [
      `Your Sun in ${sun.sign} makes you ${S.adj} at heart. Your Moon in ${moon.sign} is the inner you, and it needs ${M.need}.${orSign}`,
      asc ? `With ${asc.sign} as your ${g.t('rising sign')}, you meet the world ${A!.front}.` : `Without a birth time there is no ${g.t('rising sign')}, so this picture uses the Sun and Moon.`,
      ...elementStory(items, false),
    ];
    return lines.join(' ');
  }

  const intro = asc
    ? `Three placements do most of the work of describing a person: the Sun, the Moon and your ${g.t('rising sign')}. Think of them as your core, your heart and your front door. Each is coloured by the sign it is in, and the way the three get on with each other says a great deal about how comfortable you feel in your own skin.`
    : `Three placements usually do most of the work of describing a person: the Sun, the Moon and your ${g.t('rising sign')}. Without a birth time there is no rising sign, because it changes every two hours or so, so this picture is built from the Sun and Moon. If you find your birth time, add it and this part will grow.`;
  const sunP = `Your Sun is in ${sun.sign}. The Sun is your core: the self you grow into over a lifetime, what gives you energy and a sense of purpose. In ${sun.sign} that core is ${S.adj}, and what it wants most is ${S.core}. This is the part of you that people mean when they ask your star sign.`;
  const moonP = `Your Moon is in ${moon.sign}. The Moon is the inner, private you: how you react before you have had time to think, what comforts you when you are tired, and the you that family and partners know best. Here it is ${M.adj}. To feel well you need ${M.need}, and when those needs go unmet you will feel it before you can explain it.${orSign}`;
  const ascP = asc
    ? `Your rising sign is ${asc.sign}. It is how you meet the world: first impressions, the way you walk into a room, how you start things and often your body's look and manner. With ${asc.sign} rising you come across as ${A!.front}. People who do not know you well often meet this side long before they meet your Sun or your Moon.`
    : null;
  const elements = `Every sign belongs to one of four elements: fire (${ELEMENT_PLAIN.fire.is}), earth (${ELEMENT_PLAIN.earth.is}), air (${ELEMENT_PLAIN.air.is}) and water (${ELEMENT_PLAIN.water.is}). ${elementStory(items, true).join('\n\n')}`;
  const modes = modeStory(items, g).join(' ');

  // How they meet: aspects among the three, and the phase of the Moon at birth.
  const links: string[] = [];
  for (const a of chart.aspects) {
    if (!BIG.includes(a.a) || !BIG.includes(a.b) || !ASPECT_PLAIN[a.aspect]) continue;
    const key = BIG.indexOf(a.a) < BIG.indexOf(a.b) ? `${a.a}|${a.b}` : `${a.b}|${a.a}`;
    const pair = BIG_PAIR[key];
    if (!pair) continue;
    const tone = a.aspect === 'conjunction' ? 'blend' : ['trine', 'sextile'].includes(a.aspect) ? 'soft' : 'hard';
    links.push(`${cap(nameOf(a.a, g))} and ${nameOf(a.b, g)} are linked by ${an(g.t(a.aspect as keyof typeof GLOSSES, a.aspect))}, ${orbNote(a.orb)}. Between ${pair.theme}, that means they ${pair[tone]}.`);
  }
  if (!links.length) links.push(`The ${asc ? 'three are' : 'Sun and Moon are'} not linked by any close angle, so they work more independently: you may notice yourself switching between them rather than blending them, being one way at work and quite another at home.`);
  const angle = (((moon.longitude - sun.longitude) % 360) + 360) % 360;
  const phase = BIRTH_PHASE[Math.floor(((angle + 22.5) % 360) / 45)];
  const summary = `In short: at heart you are ${S.adj}; inside you are ${M.adj}${A ? `; and on the surface you seem ${A.front}` : ''}. Most of what follows is the detail of how those parts of you get their way.`;

  return join([intro, sunP, moonP, ascP, elements, modes, `${links.join(' ')} ${phase.text}`, summary]);
}

// ── Part 2: what runs the show ──────────────────────────────────────────────

type Standout = { planet: PlainPoint; score: number; reasons: string[] };

/** The planets that stand out, strongest first: dignity, angles, the ruler, links and stelliums. */
export function standouts(chart: Chart): Standout[] {
  const strong = strongPlacements(chart);
  const asc = positionOf(chart, 'Ascendant');
  const mc = positionOf(chart, 'Midheaven');
  const out: Standout[] = [];
  for (const planet of PLANETS) {
    const p = positionOf(chart, planet);
    if (!p) continue;
    const reasons: string[] = [];
    let score = 0;
    const s = strong.find((x) => x.planet === planet);
    if (s) {
      if (p.dignity === 'domicile') reasons.push(`at home in its own sign, ${p.sign}`);
      if (p.dignity === 'exaltation') reasons.push(`exalted in ${p.sign}`);
      if (p.house && [1, 4, 7, 10].includes(p.house)) reasons.push(`on an angle, in your ${ordinalHouse(p.house)}`);
      score += s.reasons.length * 2;
    }
    if (chart.ruler?.traditional === planet) score += 1;
    const near = (pt: Position | null) => pt && Math.abs(((p.longitude - pt.longitude + 540) % 360) - 180) < 8;
    if (!s?.reasons.some((r) => r.startsWith('on an angle')) && (near(asc) || near(mc)) && OUTER.includes(planet)) {
      reasons.push(`close to the ${near(asc) ? 'rising point' : 'top of the chart'}`);
      score += 2;
    }
    const links = chart.aspects.filter((a) => (a.a === planet || a.b === planet) && ASPECT_PLAIN[a.aspect] && a.aspect !== 'quincunx' && [...PLANETS, 'Ascendant'].includes(a.a === planet ? a.b : a.a)).length;
    score += links * 0.5;
    if (chart.patterns.some((x) => x.name === 'stellium' && x.points.includes(planet))) {
      reasons.push('part of a tight bunch of planets');
      score += 1;
    }
    if (planet === 'Sun' || planet === 'Moon') score += 1;
    out.push({ planet, score, reasons: links >= 5 ? [...reasons, `one of the most connected planets in your chart, with ${links} links to others`] : reasons });
  }
  return out.sort((a, b) => b.score - a.score || PLANETS.indexOf(a.planet) - PLANETS.indexOf(b.planet));
}

function reasonText(reasons: string[], g: Gloss): string {
  const xs = reasons.map((r) =>
      r.startsWith('exalted') ? r.replace('exalted', g.t('exalted')) : r.startsWith('on an angle') ? r.replace('on an angle', g.t('on an angle')) : r.startsWith('part of a tight') ? `part of a ${g.t('stellium')}` : r,
  );
  return xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join('; ')}; and ${xs[xs.length - 1]}`;
}

const CONDITION: Record<string, (g: Gloss, planet: string, sign: ZodiacSign) => string> = {
  domicile: (g, planet, sign) => `${planet} is at home in ${sign}, its own sign, so it works easily and with confidence: what it stands for comes naturally to you.`,
  exaltation: (g, planet, sign) => `${planet} is ${g.t('exalted')} in ${sign}, so it tends to show its best side: what it stands for is a source of pride and ease.`,
  detriment: (g, planet, sign) => `${planet} is ${g.t('in detriment')} in ${sign}. That does not make it weak, only less straightforward: it gets things done in an unusual way, and you may have had to learn its skills consciously.`,
  fall: (g, planet, sign) => `${planet} is ${g.t('in fall')} in ${sign}. It works, but with effort; many people find this becomes a hard-won strength later in life.`,
  none: (g, planet, sign) => `${planet} is neither especially strong nor weak in ${sign}, so it takes its colour from the sign and from the planets it links with.`,
};

function runsTheShow(chart: Chart, detailed: boolean): string {
  const g = new Gloss();
  const tops = standouts(chart);
  const ruler = chart.ruler?.traditional ?? null;
  const sun = positionOf(chart, 'Sun')!;
  const guide = ruler ?? TRADITIONAL_RULER[sun.sign];
  const gp = positionOf(chart, guide)!;
  const others = tops.filter((t) => t.planet !== guide && (t.reasons.length || t.score >= 4)).slice(0, detailed ? 3 : 2);

  if (!detailed) {
    const lead = ruler
      ? `${cap(nameOf(ruler))} is your ${g.t('chart ruler')}. It sits in ${gp.sign}${gp.house ? ` in your ${houseWord(gp.house, g)}` : ''}, so life tends to pull you towards ${gp.house ? HOUSE_PLAIN[gp.house].area : SIGN_PLAIN[gp.sign].core}. ${RULER_PLAIN[ruler].split('. ')[0]}.`
      : `Without a birth time there is no ${g.t('chart ruler')}, so we look to ${nameOf(guide)}, the ruler of your Sun sign, which works ${SIGN_STYLE[gp.sign]} in ${gp.sign}.`;
    const loud = others.length ? ` The planets that stand out most are ${list(others.map((o) => nameOf(o.planet)))}, so ${list(others.map((o) => plainOf(o.planet).self))} ${others.length > 1 ? 'are' : 'is'} loud in your life.` : '';
    return `${lead}${loud}`;
  }

  const paras: string[] = [];
  if (ruler) {
    const modern = chart.ruler!.modern !== ruler ? MODERN_CORULER[chart.ruler!.modern] : null;
    paras.push(`Every chart has a planet in charge. Your ${g.t('chart ruler')} is ${nameOf(ruler)}, because ${chart.ruler!.sign} is ruled by ${nameOf(ruler)}. ${RULER_PLAIN[ruler]}${modern ? ` ${modern}` : ''}`);
    paras.push(
      `${cap(nameOf(ruler))} sits in ${gp.sign}, so it works ${SIGN_STYLE[gp.sign]}: the planet that steers you does so in a way that is ${SIGN_PLAIN[gp.sign].adj}.${
        gp.house ? ` It is in your ${houseWord(gp.house, g)}, the area of ${HOUSE_PLAIN[gp.house].area}, so that is where your life's direction keeps leading you: the place you tend to go looking for yourself.` : ''
      }`,
    );
  } else {
    paras.push(
      `Every chart with a birth time has a ${g.t('chart ruler')}. Without a time we cannot name it, so many astrologers look instead to the ruler of the Sun's sign. For you that is ${nameOf(guide)}, which rules ${sun.sign}: it colours how you go after what you want, bringing ${plainOf(guide).self} into the way you pursue your purpose. It sits in ${gp.sign}, so it works ${SIGN_STYLE[gp.sign]}.`,
    );
  }
  const links = chart.aspects
    .filter((a) => (a.a === guide || a.b === guide) && ASPECT_PLAIN[a.aspect] && [...PLANETS, 'Ascendant'].includes(a.a === guide ? a.b : a.a))
    .sort((x, y) => x.orb - y.orb);
  const cond = CONDITION[gp.dignity ?? 'none'](g, cap(nameOf(guide)), gp.sign);
  const retro = gp.retrograde ? ` It was ${g.t('retrograde')} when you were born, so its work may happen more inwardly, with a habit of going back over things before acting.` : '';
  const linkLine = links.length
    ? ` It makes ${links.length} close ${links.length === 1 ? 'link' : 'links'} to other planets, the tightest ${an(g.t(links[0].aspect as keyof typeof GLOSSES, links[0].aspect))} with ${nameOf(links[0].a === guide ? links[0].b : links[0].a, g)}, so ${nameOf(links[0].a === guide ? links[0].b : links[0].a)}, ${plainOf(links[0].a === guide ? links[0].b : links[0].a).self}, is closely bound up with the way you steer.`
    : ' It makes no close links to other planets, so it works on its own terms: an independent voice, sometimes a lonely one, that you may need to consult on purpose.';
  paras.push(`How well placed is it? ${cond}${retro}${linkLine}`);

  if (others.length) {
    paras.push(
      `Beyond ${ruler ? 'the ruler' : nameOf(guide)}, some planets simply speak louder than others: those in a sign they are strong in, those on the chart's power points, and those with many links. In your chart the loudest are ${list(others.map((o) => nameOf(o.planet)))}.`,
    );
    for (const o of others) {
      const why = o.reasons.length ? `${cap(nameOf(o.planet))} stands out because it is ${reasonText(o.reasons, g)}. ` : `${cap(nameOf(o.planet))} stands out through its many links to the rest of the chart. `;
      paras.push(`${why}${plainOf(o.planet).strong}`);
    }
  }
  paras.push(`Day to day, you are likely to feel most on course when ${nameOf(guide)} is fed: ${plainOf(guide).practice}. When life feels off track, that is a good first thing to check.`);
  return join(paras);
}

// ── Part 3: where your energy goes ──────────────────────────────────────────

function clusters(chart: Chart): { house: number; planets: string[] }[] {
  if (!chart.houses) return [];
  const by = new Map<number, string[]>();
  for (const p of chart.positions) if (PLANETS.includes(p.point as PlainPoint) && p.house) by.set(p.house, [...(by.get(p.house) ?? []), p.point]);
  const ranked = [...by.entries()].map(([house, planets]) => ({ house, planets })).sort((a, b) => b.planets.length - a.planets.length || a.house - b.house);
  const big = ranked.filter((r) => r.planets.length >= 3);
  return (big.length ? big : ranked.filter((r) => r.planets.length >= 2)).slice(0, 3);
}

function lightest<K extends string>(scores: Record<K, { score: number; points: string[] }>, keys: readonly K[]): K {
  return [...keys].sort((a, b) => scores[a].score - scores[b].score)[0];
}

function energy(chart: Chart, detailed: boolean): string {
  const g = new Gloss();
  const b = chart.balance;
  const cl = clusters(chart);
  const dom = b.dominantElement;
  const mode = b.dominantModality;
  const missingModes = MODALITIES.filter((m) => b.modalities[m].points.length === 0);

  if (!detailed) {
    const where = cl.length
      ? `Most of your planets gather in your ${houseWord(cl[0].house, g)}: ${HOUSE_PLAIN[cl[0].house].area}${cl[1] ? `, with another group in the ${ordinalHouse(cl[1].house)} (${HOUSE_PLAIN[cl[1].house].area})` : ''}.`
      : chart.houses
        ? 'Your planets are spread round the chart rather than bunched, so your energy goes into many areas of life.'
        : 'Without a birth time there are no houses, so we cannot say which areas of life your planets fall in.';
    return `${where} Your chart leans ${dom} (${ELEMENT_PLAIN[dom].is}) and ${g.t(mode)} in style${b.missingElements.length ? `, with no ${list(b.missingElements)}` : ''}.`;
  }

  const paras: string[] = [];
  if (chart.houses) {
    paras.push(
      `Your chart is cut into twelve slices, each standing for an area of life. Where your planets fall shows where your energy most naturally goes, and the busy areas tend to be where your life's big events and lessons gather.`,
    );
    if (cl.length) {
      for (const [i, c] of cl.entries()) {
        paras.push(`${i === 0 ? 'Your busiest' : 'Another busy'} area is your ${houseWord(c.house, g)}, ${HOUSE_PLAIN[c.house].area}, with ${list(c.planets.map((p) => nameOf(p)))} there. ${HOUSE_PLAIN[c.house].cluster}`);
      }
    } else {
      paras.push('Your planets are spread round the chart, one or so to an area, rather than gathered in a few. That usually means a life with many interests and no single obsession.');
    }
    const empty = Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => !chart.positions.some((p) => p.house === n && PLANETS.includes(p.point as PlainPoint)));
    if (empty.length) paras.push(`Some houses have no planets in them (${list(empty.map((n) => ordinalHouse(n).replace(' house', '')))}). An empty house is not an empty part of life; it simply runs in the background, without needing much attention.`);
    const sides = leaningSides(b);
    const q = leadingQuadrant(b);
    paras.push(sides.length || q ? [...sides.map((s) => SIDE_PLAIN[s]), q ? QUADRANT_PLAIN[q] : ''].filter(Boolean).join(' ') : 'Your planets are spread fairly evenly round the chart, top and bottom, left and right, so no half dominates: you likely move between private and public, self and others, without leaning hard either way.');
    const mc = positionOf(chart, 'Midheaven');
    if (mc) paras.push(`Your ${g.t('Midheaven')} is in ${mc.sign}, so you are likely drawn to a public role that lets you be ${SIGN_PLAIN[mc.sign].adj}, and you may be seen that way at work even if you feel otherwise at home.`);
  } else {
    paras.push('Without a birth time there are no houses, the twelve slices of the chart that stand for areas of life, so we cannot say where in your life your planets do their work. What we can read, from the signs alone, is the balance of your energy: which elements and ways of moving lead, and which are missing.');
  }
  const stelliums = chart.patterns.filter((p) => p.name === 'stellium');
  if (stelliums.length) {
    const one = (s: (typeof stelliums)[number]) => `${list(s.points.map((p) => nameOf(p)))} together${s.sign ? ` in ${s.sign}` : s.house ? ` in your ${ordinalHouse(s.house)}` : ''}`;
    paras.push(
      stelliums.length === 1
        ? `You have a ${g.t('stellium')}: ${one(stelliums[0])}. A stellium ${PATTERN_PLAIN.stellium}`
        : `You have ${stelliums.length === 2 ? 'two' : stelliums.length} ${g.t('stellium', 'stelliums')}: ${stelliums.map(one).join('; and ')}. Each ${PATTERN_PLAIN.stellium}`,
    );
  }
  const low = lightest(b.elements, ELEMENTS);
  paras.push(
    `Now the balance. Counting the planets by sign (with the Sun, Moon and rising counted twice, as they matter most), your chart is mostly ${dom}. ${ELEMENT_LEAN[dom].dominant} ${
      b.missingElements.length ? b.missingElements.map((e) => ELEMENT_LEAN[e].missing).join(' ') : `Your lightest element is ${low}: you have some ${ELEMENT_PLAIN[low].is}, but you may need to make a little more room for it.`
    }`,
  );
  paras.push(`By ${g.t('modality')}, your chart leans ${g.t(mode)}. ${MODE_LEAN[mode].dominant}${missingModes.length ? ` ${missingModes.map((m) => MODE_LEAN[m].missing).join(' ')}` : ''}`);
  paras.push(
    `So the shape of your energy is ${dom} in flavour and ${MODE_PLAIN[mode].who} in style${cl.length ? `, poured mainly into ${HOUSE_PLAIN[cl[0].house].area}` : ''}. When you feel drained, it is often because life is asking for the element or way of moving you have least of.`,
  );
  return join(paras);
}

// ── Part 4: your main tensions and gifts ────────────────────────────────────

const TENSION: AspectName[] = ['square', 'opposition', 'quincunx'];
const GIFT: AspectName[] = ['trine', 'sextile'];

function personal(chart: Chart, p: string): boolean {
  return ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant'].includes(p) || chart.ruler?.traditional === p;
}

/** The aspects that matter most: closest and most personal first, outer planet pairs (shared by a whole generation) left out, and pairs within the big three (part 1 reads those). */
export function keyAspects(chart: Chart, kinds: AspectName[]): AspectHit[] {
  const ok = [...PLANETS, 'Ascendant'];
  return chart.aspects
    .filter((a) => kinds.includes(a.aspect) && ok.includes(a.a) && ok.includes(a.b))
    .filter((a) => !(OUTER.includes(a.a) && OUTER.includes(a.b)) && !(BIG.includes(a.a) && BIG.includes(a.b)))
    .map((a) => ({ a, w: a.orb - (personal(chart, a.a) ? 1.5 : 0) - (personal(chart, a.b) ? 1.5 : 0) + (a.aspect === 'quincunx' ? 2 : 0) }))
    .sort((x, y) => x.w - y.w)
    .map((x) => x.a);
}

function aspectPara(chart: Chart, a: AspectHit, g: Gloss, kind: 'tension' | 'gift' | 'fusion'): string {
  const A = plainOf(a.a);
  const B = plainOf(a.b);
  const how = ASPECT_PLAIN[a.aspect]!;
  const pa = positionOf(chart, a.a);
  const pb = positionOf(chart, a.b);
  const nA = labelled(a.a, g);
  const nB = labelled(a.b, g);
  const head = `${cap(nA)} and ${nB} are linked by ${an(g.t(a.aspect as keyof typeof GLOSSES, a.aspect))}, ${orbNote(a.orb)}; it makes for ${how.framing}.`;
  const where =
    pa?.house && pb?.house && a.a !== 'Ascendant' && a.b !== 'Ascendant'
      ? pb.house === pa.house
        ? ` ${cap(nameOf(a.a))} and ${nameOf(a.b)} both sit in the area of ${HOUSE_PLAIN[pa.house].area}, so that is where you will notice it.`
        : ` ${cap(nameOf(a.a))} works in the area of ${HOUSE_PLAIN[pa.house].area}, ${nameOf(a.b)} in ${HOUSE_PLAIN[pb.house].area}, so those are where you will notice it.`
      : '';
  if (kind === 'tension') {
    return `${head} One part of you wants ${A.wants}; another wants ${B.wants}.${where} What helps: ${how.work}; give ${nameOf(a.a)} room through ${A.practice}; give ${nameOf(a.b)} room through ${B.practice}.`;
  }
  if (kind === 'gift') {
    return `${head} What ${nameOf(a.a)} gives you (${A.gift}) and what ${nameOf(a.b)} gives you (${B.gift}) feed each other, so this is a talent you can rely on.${where} ${cap(how.work)}, especially through ${A.practice}, or ${B.practice}.`;
  }
  return `${head} In you, ${A.self} and ${B.self} come as a package deal.${where} ${cap(how.work)}: ask which of the two is speaking when you feel pulled.`;
}

function tensionsGifts(chart: Chart, detailed: boolean): string {
  const g = new Gloss();
  const tensions = keyAspects(chart, TENSION).slice(0, detailed ? 3 : 1);
  const gifts = keyAspects(chart, GIFT).slice(0, detailed ? 3 : 1);
  const fusion = keyAspects(chart, ['conjunction'])[0];
  const patterns = chart.patterns.filter((p) => p.name !== 'stellium');

  if (!detailed) {
    const t = tensions[0];
    const gi = gifts[0];
    return [
      t ? `Your main push-pull is between ${labelled(t.a, g)} and ${labelled(t.b, g)}: ${ASPECT_PLAIN[t.aspect]!.framing.split(':')[0]}.` : 'Your chart has few close tensions between planets, so fewer inner battles.',
      gi ? `Your easiest gift links ${plainOf(gi.a).self} and ${plainOf(gi.b).self}: ${plainOf(gi.a).gift}, backed by ${plainOf(gi.b).gift}.` : 'Your talents come more through effort than through easy links between planets.',
      patterns.length ? `Your chart also holds ${an(g.t(PATTERN_TERM[patterns[0].name], PATTERN_TERM[patterns[0].name]))}, which shapes much of this.` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  const paras: string[] = [
    'Planets talk to each other across the chart through the angles between them. Some angles make friction, which you feel as a push-pull you keep meeting in life; others make an easy flow, which you feel as a talent. The ones below are the closest and most personal in your chart, so they are the ones you are most likely to recognise.',
  ];
  if (tensions.length) {
    paras.push(`Your main tensions. ${tensions.length > 1 ? 'These are' : 'This is'} where you are most likely to feel torn, and also where you grow most.`);
    for (const t of tensions) paras.push(aspectPara(chart, t, g, 'tension'));
  } else {
    paras.push('Your chart has few close hard angles between planets, which often means fewer inner battles. Growth may come more through challenges you choose than ones that choose you, so it is worth setting yourself some.');
  }
  if (gifts.length) {
    paras.push(`Your main gifts. ${gifts.length > 1 ? 'These come' : 'This comes'} easily, which is exactly why ${gifts.length > 1 ? 'they are' : 'it is'} easy to overlook.`);
    for (const t of gifts) paras.push(aspectPara(chart, t, g, 'gift'));
  } else {
    paras.push('Your chart has few close easy angles between planets, so your talents are more likely to be built through effort than handed over. That tends to make them sturdier.');
  }
  if (fusion) paras.push(aspectPara(chart, fusion, g, 'fusion'));
  for (const name of [...new Set(patterns.map((p) => p.name))]) {
    const same = patterns.filter((p) => p.name === name);
    const term = PATTERN_TERM[name];
    const apexes = [...new Set(same.map((p) => p.apex).filter(Boolean) as string[])];
    const focus = apexes.length
      ? ` The focus is ${list(apexes.map((x) => nameOf(x)))}: ${list(apexes.map((x) => plainOf(x)?.self ?? x))} ${apexes.length > 1 ? 'are' : 'is'} where the pattern's energy comes out.`
      : '';
    const made = (p: (typeof same)[number]) => list(p.points.map((x) => nameOf(x)));
    const holds =
      same.length === 1
        ? `Your chart also holds ${an(g.t(term, term))}, made of ${made(same[0])}. It`
        : `Your chart also holds ${same.length === 2 ? 'two' : same.length === 3 ? 'three' : same.length} ${g.t(term, PATTERN_PLURAL[name])}: ${same.map((p, i) => `${i === 0 ? 'one' : 'another'} made of ${made(p)}`).join('; ')}. Each`;
    paras.push(`${holds} ${PATTERN_PLAIN[name]}${focus}`);
  }
  paras.push('None of these is a fault or a fixed fate. The tensions are where life keeps asking you to grow; the gifts are what you can lean on while you do.');
  return join(paras);
}

const PATTERN_PLURAL = { 't-square': 'T-squares', 'grand-cross': 'grand crosses', 'grand-trine': 'grand trines', kite: 'kite patterns', yod: 'yods', stellium: 'stelliums' } as const;

const PATTERN_TERM = {
  't-square': 'T-square',
  'grand-cross': 'grand cross',
  'grand-trine': 'grand trine',
  kite: 'kite pattern',
  yod: 'yod',
  stellium: 'stellium',
} as const;

// ── Part 5: how it fits together ────────────────────────────────────────────

function fitsTogether(chart: Chart, detailed: boolean): string {
  const g = new Gloss();
  const b = chart.balance;
  const sun = positionOf(chart, 'Sun')!;
  const moon = positionOf(chart, 'Moon')!;
  const asc = positionOf(chart, 'Ascendant');
  const ruler = chart.ruler?.traditional ?? null;
  const ally: Classical = ruler ?? TRADITIONAL_RULER[sun.sign];
  const guide = PLANET_GUIDES[ally];
  const temp = TEMPERAMENT[`${b.dominantElement}|${b.dominantModality}`];
  const tension = keyAspects(chart, TENSION)[0];
  const gift = keyAspects(chart, GIFT)[0];
  const cl = clusters(chart);
  const allyAt = positionOf(chart, ally)!;
  const stage = cl[0]?.house ?? allyAt.house ?? null;

  const likeLine =
    temp.like === sun.sign
      ? `That is the very sign your Sun is in, so the familiar picture of ${sun.sign} is the real you, turned up.`
      : elementOf(temp.like) === elementOf(sun.sign)
        ? `Your ${sun.sign} Sun shares that element, so the Sun-sign picture is broadly right, though the chart as a whole behaves more like ${temp.like}.`
        : `That is not your Sun's element, so people who know only that you are ${an(sun.sign)} may miss much of what drives you: the chart as a whole behaves more like ${temp.like} than ${sun.sign}.`;

  if (!detailed) {
    return `Put together, your chart is ${temp.text}. ${likeLine} A good place to start: ${guide.day}, the day of ${nameOf(ally)}, ${ruler ? `your ${g.t('chart ruler')}` : 'the ruler of your Sun sign'}, is your day for workings about yourself and your path.`;
  }

  const paras: string[] = [];
  paras.push(
    `Put all of that together and a picture forms. Take your chart's leading element and its leading way of moving and you get its overall temperament: ${b.dominantElement} and ${g.t(b.dominantModality)}, which makes you ${temp.text}. ${likeLine}`,
  );
  const story: string[] = [
    `If your chart were a story, ${nameOf(ally)} would be the lead, bringing ${plainOf(ally).self}${allyAt ? `, played ${SIGN_STYLE[allyAt.sign]}` : ''}.`,
  ];
  if (stage) story.push(`The main stage is ${HOUSE_PLAIN[stage].area}: that is where the important scenes tend to happen.`);
  if (tension) story.push(`The plot turns on the push-pull between ${plainOf(tension.a).self} and ${plainOf(tension.b).self}.`);
  if (gift) story.push(`The help that keeps arriving is ${plainOf(gift.a).gift}, joined to ${plainOf(gift.b).gift}.`);
  const shared = tension && gift ? [tension.a, tension.b].find((p) => p === gift.a || p === gift.b) : undefined;
  if (shared) story.push(`Notice that ${nameOf(shared)} appears in both: the very part of you that feels the strain also holds the way through it.`);
  if (tension && [tension.a, tension.b].includes(ally)) story.push(`And because ${nameOf(ally)} leads the whole chart, this tension sits near the heart of your life, not at its edges.`);
  paras.push(story.join(' '));

  const missing = b.missingElements[0];
  paras.push(
    `${missing ? `What is missing matters too. With no ${missing} in your chart, you may find yourself drawn to people who carry ${ELEMENT_PLAIN[missing].is} for you, and part of growing up is learning to grow some of your own.` : `Nothing in your chart is wholly missing, so you have something of every element to draw on; the work is less about filling a gap than about using what is quieter.`} Inside, your ${moon.sign} Moon keeps asking for ${SIGN_PLAIN[moon.sign].need}; outwardly, your ${sun.sign} Sun keeps wanting ${SIGN_PLAIN[sun.sign].core}${asc ? `; and your ${asc.sign} rising is how you open every new chapter` : ''}. A life that feeds the Moon's needs while chasing the Sun's aims is the one this chart is built for.`,
  );

  const allyWhy = ruler ? `your ${g.t('chart ruler')}` : 'the ruler of your Sun sign';
  const herbs = guide.herbs.slice(0, 3);
  const working = tension
    ? `For the push-pull between ${nameOf(tension.a, g)} and ${nameOf(tension.b, g)}, a simple two-candle working suits: one candle for each, lit together, with a written promise to give each its due. Burn them a little each night until they are done.`
    : missing
      ? `To build up the ${missing} you lack, keep a small practice for a month: ${ELEMENT_LEAN[missing].practice}.`
      : `To bless what comes easily, set a candle for ${nameOf(ally)} and write down three things your chart's gifts have already given you.`;
  paras.push(
    `Where to start. Timing: your guiding planet is ${nameOf(ally)}, ${allyWhy}, and its day is ${guide.day}. Its planetary hours on that day are the traditional times for workings about yourself and your path. ${working} Offerings that suit ${nameOf(ally)}: ${list(herbs)}, ${guide.incense[0] ? `${guide.incense[0].toLowerCase()} incense, ` : ''}in ${list(guide.colours.slice(0, 2))}. A small natal altar for ${nameOf(ally)} is a good home for all of this.`,
  );
  const next = [
    asc ? 'your Sun, Moon and rising' : 'your Sun and Moon',
    ruler ? 'your chart ruler' : null,
    tension ? `the link between ${nameOf(tension.a, g)} and ${nameOf(tension.b, g)}` : null,
    chart.houses && stage ? `the ${ordinalHouse(stage)}` : null,
  ].filter(Boolean) as string[];
  paras.push(`What to read next: in Read in full, start with ${list(next)}. Then look at Transits to see which of these parts of you the sky is touching now.`);
  return join(paras);
}

// ── The whole ───────────────────────────────────────────────────────────────

/** The five parts of "Your chart in plain words". */
export function plainWords(chart: Chart): PlainWords {
  const ruler = chart.ruler?.traditional ?? null;
  const sun = positionOf(chart, 'Sun')!;
  const ally: Classical = ruler ?? TRADITIONAL_RULER[sun.sign];
  const both = (f: (c: Chart, d: boolean) => string) => ({ simple: f(chart, false), detailed: f(chart, true) });
  const intro = chart.timeKnown && chart.houses
    ? 'The whole chart in everyday words: who you are at heart, what steers you, where your energy goes, your main push-pulls and gifts, and how it all fits together. Each part links to the detailed readings below.'
    : 'The whole chart in everyday words. Without a birth time there is no rising sign and there are no houses, so this reads what the planets and signs can say on their own, and says plainly where the time would add more.';
  return {
    intro,
    parts: [
      { id: 'big-picture', title: 'The big picture', ...both(bigPicture), links: [{ label: 'Sun, Moon and rising, read in full', tab: 'reading' }, { label: 'Every placement', tab: 'placements' }] },
      {
        id: 'runs-the-show',
        title: 'What runs the show',
        ...both(runsTheShow),
        links: [{ label: ruler ? 'Your chart ruler, read in full' : 'The planets, read in full', tab: 'reading' }, { label: `${ally}: the planet guide`, planet: ally }, { label: 'In your craft', tab: 'craft' }],
      },
      {
        id: 'energy',
        title: 'Where your energy goes',
        ...both(energy),
        links: [{ label: 'Balance: elements, modes and halves', tab: 'balance' }, ...(chart.houses ? [{ label: 'The twelve houses, read in full', tab: 'reading' as const }] : []), { label: 'The wheel', tab: 'wheel' }],
      },
      { id: 'tensions-gifts', title: 'Your main tensions and gifts', ...both(tensionsGifts), links: [{ label: 'Aspects and patterns', tab: 'aspects' }, { label: 'The closest aspects, read in full', tab: 'reading' }] },
      {
        id: 'fits-together',
        title: 'How it fits together',
        ...both(fitsTogether),
        links: [{ label: 'In your craft', tab: 'craft' }, { label: `${ally}: days and hours`, hours: ally }, { label: `A natal altar for ${ally}`, altar: ally }, { label: 'Transits: what touches your chart now', tab: 'transits' }],
      },
    ],
  };
}
