// Charm casting: a set of small objects (keys, coins, bones, shells, buttons)
// thrown onto a marked mat and read by where each lands. Bone-throwing and
// casting of small objects is practised in many places under many names, some
// of them closed traditions with their own meanings; the traditional-looking
// set here is a general, modern European-style charm set (the kind sold as
// "witch's charms" or "fortune charms"), and the reading never claims
// otherwise. You build your own set, add your own charms, and give them your
// own meanings. Pure, so it can be tested.

import { composer, hash, joinNames, rotate, roundRobin, sentenceCase } from '../symbolReading.ts';

export type Charm = { id: string; name: string; theme: string; meaning: string; shadow: string; question: string; custom?: boolean };

// id | name | theme | meaning | shadow (face down) | question
const ROWS = `
key|Key|an opening|The key is opportunity and access: a door that will open, an answer, a way in. It is also a secret you hold.|Face down, a locked door, or a secret not yet told.|What are you ready to unlock?
coin|Coin|money and worth|The coin is money and what you value: income, exchange, the worth of a thing or of yourself.|Face down, value that is hidden or not yet recognised.|What is it worth to you?
bone|Bone|the bare structure|The bone is what lasts: ancestry, the plain structure under a matter, what remains when the rest falls away.|Face down, a matter of the dead, or a root buried deep.|What is the plain frame of this?
shell|Shell|shelter and the sea|The shell is shelter, the sea and a voice from far off: protection, a retreat, news that comes by water.|Face down, a retreat that has closed in too tightly.|What do you need to be sheltered from?
ring|Ring|a promise|The ring is commitment and cycle: a promise, a bond, a matter coming full circle.|Face down, a promise unspoken or a bond that is loosening.|What have you promised, and to whom?
button|Button|small fastenings|The button is the small thing that holds the whole together: a detail, a tie, a quiet loyalty.|Face down, a loose end or something coming undone.|Which small thing is holding it all together?
dice|Dice|chance|The dice are chance and risk: a gamble, a turn of luck, a decision that cannot be fully worked out.|Face down, a risk being taken without looking.|What are you leaving to chance?
star|Star|hope|The star is hope and guidance: a wish with a chance, a long-range goal, a light to steer by.|Face down, hope that is dim or kept hidden.|What do you steer by?
moon|Moon|intuition and cycles|The moon is intuition, rhythm and the hidden: a changing mood, a matter that waxes and wanes.|Face down, intuition ignored, or the dark of the moon.|What does your gut keep saying?
heart|Heart|love|The heart is love in all its kinds: affection, desire, kindness, the feeling at the root of a matter.|Face down, a hurt or a feeling kept back.|Where is your heart actually?
bird|Bird|news and freedom|The bird is news and freedom: a message, a visitor, the lifting of a weight.|Face down, a message not yet arrived, or a wish to leave.|What are you waiting to hear?
horseshoe|Horseshoe|luck and protection|The horseshoe is luck and protection, the old charm for a threshold: good fortune that is made, not found.|Face down, it is said to spill the luck; turn it up when you can.|Where can you make your own luck?
acorn|Acorn|small beginnings|The acorn is a great thing in small form: patience, growth, a plan that needs time.|Face down, a seed not yet planted.|What would you plant if you trusted it to grow?
crystal|Crystal|clarity|The crystal is clarity and focus: a clear view, an amplified intention, a pure matter.|Face down, a clouded view, or a matter not yet clear.|What would clear sight show you?
cross|Cross|a crossing or a burden|The cross is a crossing of paths, a burden or a sacrifice, and also protection at the crossroads.|Face down, a weight carried unseen.|Which road are you crossing?
eye|Eye|watching and insight|The eye is insight, attention and the watcher: being seen, or seeing what has been missed.|Face down, a blind spot, or a gaze avoided.|What have you not wanted to see?
feather|Feather|lightness and visits|The feather is lightness, a gentle sign, and for many a visit from the dead or an angel.|Face down, grief, or a message that has fallen.|What feels lighter, if you let it?
skull|Skull|an ending|The skull is mortality and ending, and so a reminder to live: a matter closing for good, or deep change.|Face down, an ending put off or denied.|What is truly over?
arrow|Arrow|direction|The arrow is aim and direction: a decision, a message sent, a goal you are moving toward.|Face down, a missed aim, or something aimed at you.|What are you aiming at?
knot|Knot|binding and puzzles|The knot is a binding, a puzzle or a tie: something tied or tangled that can be loosened with patience.|Face down, a tangle that is getting tighter.|What needs loosening, not cutting?
bell|Bell|a call|The bell is a summons, a clearing and good news: an announcement, a time to pay attention.|Face down, a call that is muffled or ignored.|What is calling to you?
mirror|Mirror|reflection|The mirror is reflection and truth: what you see of yourself in others, a matter looking back at you.|Face down, an avoided truth.|What is this showing you about yourself?
thimble|Thimble|thrift and care|The thimble is thrift, domestic care and small protections: a kindness that mends.|Face down, mending put off.|What needs mending?
anchor|Anchor|steadiness|The anchor is stability and hold: a safe harbour, a decision to stay, a hope that does not drift.|Face down, being held back, or an anchor that does not hold.|Where do you need to stay put?
candle|Candle|light and devotion|The candle is devotion and guidance: a small steady light, patience and prayer.|Face down, a light snuffed, or a hope that is nearly out.|What are you tending?
nail|Nail|fixing and hardship|The nail is fixing, binding and sometimes hardship: a decision made firm, or a hurt that is pinned.|Face down, a grievance being held in place.|What have you fixed in place that you could free?
tooth|Tooth|bite and age|The tooth is bite, appetite and age: a hard thing that you must chew on, or a keepsake of childhood.|Face down, a bite put off or a pain ignored.|What is hard to swallow?
wishbone|Wishbone|a wish and a split|The wishbone is a wish made and the chance of getting it, and a split decision, two sides pulling.|Face down, a wish not spoken.|What have you not yet wished for aloud?
clover|Clover|luck and gentle fortune|The four-leafed clover is gentle luck, found in the small and the common: fortune that comes by noticing.|Face down, luck passed over.|What have you been stepping over?
sun|Sun|vitality|The sun is warmth, vitality and success, the day: a matter that is open, visible and well.|Face down, vitality low, or a light turned away.|What gives you energy right now?
`;

export const CHARMS: Charm[] = ROWS.trim()
  .split('\n')
  .map((r) => {
    const [id, name, theme, meaning, shadow, question] = r.split('|');
    return { id, name, theme, meaning, shadow, question };
  });

/** Make a charm of your own. */
export function ownCharm(name: string, meaning: string, id = `own-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`): Charm {
  const n = name.trim();
  const m = meaning.trim();
  return { id, name: n, theme: m.replace(/[.!]+$/, '').toLowerCase().slice(0, 60), meaning: m ? `${sentenceCase(m.replace(/[.\s]+$/, ''))}, as you have given it.` : `${n}, with a meaning you will find in the casting.`, shadow: `Face down, ${n.toLowerCase()} is its hidden or unfinished side.`, question: `What does ${n.toLowerCase()} mean to you here?`, custom: true };
}

// ───────────────────────────── The mat ─────────────────────────────

/** A cast charm: x and y run from -1 to 1 across the circle (y positive is up the mat); beyond the circle's edge is outside. */
export type Cast = { charmId: string; x: number; y: number; up: boolean };

export type Ring = 'centre' | 'near' | 'far' | 'outside';
export type Zone = { ring: Ring; side: 'left' | 'right' | 'middle'; level: 'above' | 'below' | 'level'; inside: boolean; up: boolean; quarter: 'north' | 'east' | 'south' | 'west' | 'centre' };

export const RADII = { centre: 0.22, near: 0.6, edge: 1 } as const;
/** Charms closer than this (in mat units) are touching. */
export const TOUCH = 0.2;

const dist = (a: Cast, b: Cast) => Math.hypot(a.x - b.x, a.y - b.y);

/** Where a charm landed: which ring, which side (past is left, future is right), above or below, and which way up. */
export function classify(c: Cast): Zone {
  const r = Math.hypot(c.x, c.y);
  const ring: Ring = r <= RADII.centre ? 'centre' : r <= RADII.near ? 'near' : r <= RADII.edge ? 'far' : 'outside';
  const side = Math.abs(c.x) < 0.12 ? 'middle' : c.x < 0 ? 'left' : 'right';
  const level = Math.abs(c.y) < 0.12 ? 'level' : c.y > 0 ? 'above' : 'below';
  const quarter = ring === 'centre' ? 'centre' : Math.abs(c.y) >= Math.abs(c.x) ? (c.y > 0 ? 'north' : 'south') : c.x > 0 ? 'east' : 'west';
  return { ring, side, level, inside: r <= RADII.edge, up: c.up, quarter };
}

/** Groups of charms that are touching one another, directly or through a neighbour; single charms are left out. */
export function touching(casts: Cast[]): number[][] {
  const seen = new Set<number>();
  const groups: number[][] = [];
  casts.forEach((_, i) => {
    if (seen.has(i)) return;
    const group = [i];
    seen.add(i);
    for (let k = 0; k < group.length; k++) {
      casts.forEach((c, j) => {
        if (!seen.has(j) && dist(casts[group[k]], c) <= TOUCH) {
          seen.add(j);
          group.push(j);
        }
      });
    }
    if (group.length > 1) groups.push(group.sort((a, b) => a - b));
  });
  return groups;
}

/** A random cast: charms thrown onto and around the mat, most of them in. */
export function throwCharms(charms: Charm[], random: () => number = Math.random): Cast[] {
  return charms.map((c) => {
    const angle = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * 1.15;
    return { charmId: c.id, x: Math.cos(angle) * r, y: Math.sin(angle) * r, up: random() < 0.6 };
  });
}

// ───────────────────────────── The reading ─────────────────────────────

const RING_LINES: Record<Ring, string[]> = {
  centre: ['In the centre, it is the heart of the matter: you, and what it is now.', 'Right at the middle, it is you and the present moment, and what the question turns on.'],
  near: ['Near the middle, it bears closely on the matter and on the next weeks.', 'Close to the centre, it is part of what is going on now or soon.'],
  far: ['Out toward the rim, it is further off: on the edge of the matter, or further ahead.', 'Near the edge of the circle, it is at the margins of things, or a way off in time.'],
  outside: ['Fallen outside the circle, it stands outside the matter: an outside influence, or something that is not yours to carry.', 'Landing beyond the mat, it is outside the question, and some casters would say it is best left out of the reading.'],
};
const SIDE_LINES = { left: 'On the left it belongs to the past, or to what you are leaving behind.', right: 'On the right it looks to the future, or to what is coming toward you.', middle: 'On the centre line, it is present and not yet leaning to past or future.' };
const LEVEL_LINES = { above: 'Toward the top of the mat it is of the mind, and of what is above you or ahead.', below: 'Toward the bottom it is of the body and the ground: practical, and close to home.', level: 'On the middle line across the mat, it is balanced between thought and ground.' };
const QUARTER: Record<string, string> = { north: 'north, the quarter of air and thought', east: 'east, the quarter of beginnings and fire', south: 'south, the quarter of feeling and water', west: 'west, the quarter of earth and endings' };
const OPENERS = [
  'Gather the charms in both hands, think of the question and let them fall.',
  'Read the whole mat first, then each charm: the first thing your eye goes to is usually the answer.',
  'Look at what is in the centre before anything else, then follow the eye outward.',
  'Say the question once aloud, cast, and read the charms from the middle out.',
];
const CLOSES = [
  'Charms are a way of putting what you already half know in front of you; take what rings true.',
  'Cast again another day. A single throw is a sketch, not a portrait.',
  'Write down where the charms lay before you gather them up, and look back in a month.',
];
const CAVEAT = 'Casting charms and bones belongs to many traditions, several of them closed to outsiders; this is a general modern set, read by position, and does not claim to be any of them.';

export type CharmRead = { charm: Charm; zone: Zone; paragraphs: string[] };
export type CharmReading = { reads: CharmRead[]; sections: { id: string; title: string; paragraphs: string[] }[]; text: string };

export function readCast(casts: Cast[], set: Charm[], question: string, date: string): CharmReading {
  const find = (id: string) => set.find((c) => c.id === id) ?? CHARMS.find((c) => c.id === id);
  const placed = casts.map((c) => ({ cast: c, charm: find(c.charmId) })).filter((p): p is { cast: Cast; charm: Charm } => !!p.charm);
  const seed = hash(`${date}|${question}|${placed.map((p) => `${p.charm.id}${p.cast.x.toFixed(2)}${p.cast.y.toFixed(2)}${p.cast.up}`).join(',')}`);
  const { fresh, para } = composer();
  const zones = placed.map((p) => classify(p.cast));
  const q = question.trim();

  const reads: CharmRead[] = placed.map((p, i) => {
    const z = zones[i];
    const parts = [p.charm.meaning, z.up ? '' : p.charm.shadow, rotate(RING_LINES[z.ring], seed + i)];
    if (z.ring !== 'outside') parts.push(i % 2 === 0 ? SIDE_LINES[z.side] : LEVEL_LINES[z.level]);
    if (z.ring === 'far' && z.quarter !== 'centre') parts.push(`It lies in the ${QUARTER[z.quarter]}.`);
    return { charm: p.charm, zone: z, paragraphs: [para(...parts)] };
  });

  const centre = placed.filter((_, i) => zones[i].ring === 'centre');
  const past = placed.filter((_, i) => zones[i].side === 'left' && zones[i].inside).length;
  const future = placed.filter((_, i) => zones[i].side === 'right' && zones[i].inside).length;
  const outside = placed.filter((_, i) => !zones[i].inside);
  const down = placed.filter((_, i) => !zones[i].up);

  const opening = [
    para(rotate(OPENERS, seed)),
    q ? para(`You asked: ${q.replace(/[?.\s]+$/, '')}?`) : para('No question was set, so this reads the mat as a whole.'),
    placed.length ? para(`${placed.length} ${placed.length === 1 ? 'charm' : 'charms'} fell: ${joinNames(placed.map((p) => p.charm.name.toLowerCase()))}.`) : para('Nothing has been cast yet.'),
    centre.length ? para(`${sentenceCase(joinNames(centre.map((p) => p.charm.name.toLowerCase())))} landed in the centre, so the matter turns on ${joinNames(centre.map((p) => p.charm.theme))}.`) : para('Nothing fell in the centre, so the matter is not yet focused on any one thing.'),
  ];

  const patterns: string[] = [];
  if (past > future && past >= 2) patterns.push(para(`More charms lie on the left than on the right (${past} to ${future}), so this is weighted toward the past: what led here.`));
  else if (future > past && future >= 2) patterns.push(para(`More charms lie on the right than on the left (${future} to ${past}), so this looks forward more than back.`));
  for (const g of touching(placed.map((p) => p.cast))) {
    const here = g.map((i) => placed[i].charm);
    patterns.push(para(`${sentenceCase(joinNames(here.map((c) => c.name.toLowerCase())))} lie touching, so read them as one phrase: ${joinNames(here.map((c) => c.theme))}, each colouring the other.`));
  }
  if (outside.length) patterns.push(para(`${sentenceCase(joinNames(outside.map((p) => p.charm.name.toLowerCase())))} fell outside the circle: ${outside.length === 1 ? 'an influence' : 'influences'} from beyond the matter, to note and not to dwell on.`));
  if (down.length && down.length === placed.length && placed.length > 1) patterns.push(para('Every charm fell face down, which many casters take as a matter not yet ready to be shown: ask again another day.'));
  else if (down.length >= 2) patterns.push(para(`${down.length} charms fell face down, so some of this is hidden or not yet ready to be seen.`));

  const questions = roundRobin(placed.map((p) => [p.charm.question]), seed, 3, fresh);
  const sections = [
    { id: 'opening', title: 'Opening', paragraphs: opening.filter(Boolean) },
    ...(reads.length ? [{ id: 'charms', title: 'The charms', paragraphs: [] }] : []),
    ...(patterns.length ? [{ id: 'patterns', title: 'Where they lie', paragraphs: patterns.filter(Boolean) }] : []),
    ...(questions.length ? [{ id: 'questions', title: 'Questions to sit with', paragraphs: questions }] : []),
    { id: 'close', title: 'Close', paragraphs: [para(rotate(CLOSES, seed >>> 3)), para(CAVEAT)].filter(Boolean) },
  ];
  const lines: string[] = [];
  for (const s of sections) {
    lines.push(s.title.toUpperCase());
    if (s.id === 'charms') for (const r of reads) lines.push(`${r.charm.name}\n${r.paragraphs.join('\n')}`);
    else if (s.id === 'questions') lines.push(...s.paragraphs.map((x) => `- ${x}`));
    else lines.push(...s.paragraphs);
    lines.push('');
  }
  return { reads, sections, text: lines.join('\n').trim() };
}
