// Geomancy: the sixteen figures of four lines (one dot or two), the four
// Mothers made from marks in the sand or on paper, and the shield chart
// built from them. Medieval Arabic (ilm al-raml, "the science of sand") and
// then Latin Europe, where Agrippa, Fludd and the Golden Dawn each
// wrote their own tables; the planets and elements below follow one common
// table, and sources differ on several. Pure, so it can be tested.

import { composer, hash, joinNames, rotate, sentenceCase } from '../symbolReading.ts';

/** Four lines, Fire (the head) down to Earth (the feet): 1 is one dot, 2 is two. */
export type Lines = [1 | 2, 1 | 2, 1 | 2, 1 | 2];
export type Figure = {
  id: string;
  name: string;
  english: string;
  lines: Lines;
  planet: string;
  element: 'Fire' | 'Air' | 'Water' | 'Earth';
  tone: 'good' | 'hard' | 'mixed';
  /** Mobile figures move things along; stable ones hold them. */
  motion: 'mobile' | 'stable';
  keywords: string;
  meaning: string;
  asJudge: string;
};

// id | name | english | lines | planet | element | tone | motion | keywords | meaning | as Judge
const ROWS = `
via|Via|The Way|1111|Moon|Water|mixed|mobile|journeys, change, the road|Via is the road itself: movement, a journey, a change that is under way. It is the most mobile of the figures and takes whatever it touches with it. Nothing will stay as it is, for better or worse.|As Judge, Via says the matter is moving and cannot be held still: act in the direction of travel, because waiting will not keep it as it is.
populus|Populus|The People|2222|Moon|Water|mixed|stable|crowds, the public, a gathering|Populus is the crowd: many people, a gathering, the public eye. It is stable and passive, and takes on the character of the figures near it, good or bad.|As Judge, Populus says the matter is in the hands of many, and will be affected by what others do and say. It strengthens what stands beside it.
conjunctio|Conjunctio|Conjunction|2112|Mercury|Air|mixed|mobile|meeting, union, reunion|Conjunctio is things coming together: a meeting, a union, a reunion of what was parted. It is neither good nor bad in itself; it makes what it joins stronger.|As Judge, Conjunctio says the answer lies in connection: a person, an agreement, a piece that will rejoin the whole.
carcer|Carcer|The Prison|1221|Saturn|Earth|hard|stable|confinement, boundaries, delay|Carcer is the prison: restriction, delay and being held. It is also a sign of what is protected or contained, a safe boundary, and of patience that is eventually rewarded.|As Judge, Carcer says the matter is stuck, held or delayed, and no forcing will shift it. Look for the limit that is really there, and work inside it.
fortuna-major|Fortuna Major|Greater Fortune|2211|Sun|Fire|good|stable|lasting success, help from outside|Fortuna Major is the great gift: lasting success, help that comes from outside and the steady rise of what is well founded. It is slow, strong and in your favour.|As Judge, Fortuna Major gives a favourable answer in the long run: what you want can be had, with steady support, and little hurry.
fortuna-minor|Fortuna Minor|Lesser Fortune|1122|Sun|Air|good|mobile|quick, small luck, outside help|Fortuna Minor is luck that comes fast and goes fast: a good run, a quick win, help that arrives now. It favours quick action and does not last without effort.|As Judge, Fortuna Minor says act promptly: luck is with you for a short while, and speed matters more than a perfect plan.
acquisitio|Acquisitio|Gain|2121|Jupiter|Air|good|stable|gain, getting, profit|Acquisitio is getting: money, goods, an offer accepted. A gain is on its way, and what is gained is worth keeping. It is good for most matters, though it can show getting without giving.|As Judge, Acquisitio is a good answer for what you want to gain: you will get something, though not necessarily what you first asked for.
amissio|Amissio|Loss|1212|Venus|Earth|hard|mobile|loss, letting go, what slips away|Amissio is loss: something leaves, money, a person or an opportunity. It is better to let go of what is leaving than to hold on. It is good for matters where you want to be rid of something.|As Judge, Amissio says what you are asking about will slip away; if you want to be free of something, that is welcome news.
laetitia|Laetitia|Joy|1222|Jupiter|Fire|good|mobile|joy, gladness, lightness|Laetitia is gladness: a lifting of the heart, good news, a fortunate meeting. It points upward and is good for nearly everything, though joy that is only surface wants watching.|As Judge, Laetitia answers kindly: things will go gladly, and your own good spirits are part of why.
tristitia|Tristitia|Sorrow|2221|Saturn|Earth|hard|stable|sorrow, heaviness, depth|Tristitia is sorrow, and it points downward: heaviness, grief, a sober mood. It is also solid ground, and is good for the foundations of things, for digging and building.|As Judge, Tristitia says the matter is heavy now and will go slowly. It is good only for what is meant to be buried, built on or made to last.
puella|Puella|The Girl|1211|Venus|Water|good|stable|beauty, affection, a gentle friend|Puella is beauty and affection: a gentle person or a pleasant time, though it can also mean someone who is more charming than useful. It is good in love and in friendship, less good for hard matters.|As Judge, Puella says kindness, charm and a gentle approach will carry the matter further than force.
puer|Puer|The Boy|1121|Mars|Fire|mixed|mobile|impulse, courage, a rash young energy|Puer is the young man: courage, haste and heat. It is good for fighting and starting, and bad for peace and patience; its danger is rashness.|As Judge, Puer says act, but not rashly: the matter wants courage and quickness, and a cool head if it is not to end in a quarrel.
albus|Albus|White|2212|Mercury|Water|good|stable|peace, wisdom, a clear head|Albus is the white figure: peace, calm thought and a wise adviser. It is good for study, contracts and anything that needs a steady head and a clean start.|As Judge, Albus counsels calm: wait for the clear moment, think before you speak, and the answer is peaceable.
rubeus|Rubeus|Red|2122|Mars|Air|hard|mobile|passion, violence, excess|Rubeus is the red figure: passion, anger, drink and fever. It is good only for what must be done with force, and is otherwise a warning against excess.|As Judge, Rubeus warns of heat: a quarrel, a risky impulse or an excess. Hold back until the feeling passes.
caput-draconis|Caput Draconis|The Head of the Dragon|2111|North Node|Earth|good|stable|a threshold, a beginning|Caput Draconis is the dragon's head, the north node: a doorway into a new matter. Good for beginning, and good with good figures and bad with bad: it magnifies the beginning.|As Judge, Caput Draconis says this is a threshold: a good beginning if started well, and an ill one if it is started badly.
cauda-draconis|Cauda Draconis|The Tail of the Dragon|1112|South Node|Fire|hard|mobile|an ending, an exit|Cauda Draconis is the dragon's tail, the south node: an ending, an exit, the close of a matter. It is good for leaving things and bad for beginning them.|As Judge, Cauda Draconis says what you ask about is ending or should be left: a good exit, and a poor place to begin anything new.
`;

export const FIGURES: Figure[] = ROWS.trim()
  .split('\n')
  .map((r) => {
    const [id, name, english, bits, planet, element, tone, motion, keywords, meaning, asJudge] = r.split('|');
    return { id, name, english, lines: bits.split('').map(Number) as Lines, planet, element, tone, motion, keywords, meaning, asJudge } as Figure;
  });

export const figureById = (id: string) => FIGURES.find((f) => f.id === id);
const key = (lines: readonly number[]) => lines.join('');
/** The figure with these lines. */
export const figureOf = (lines: readonly number[]): Figure => FIGURES.find((f) => key(f.lines) === key(lines))!;
export const dotsIn = (f: Figure) => f.lines.reduce<number>((n, l) => n + l, 0);

export const LINE_NAMES = ['Fire', 'Air', 'Water', 'Earth'] as const;

// ───────────────────────────── Derivation ─────────────────────────────

/** Adding two figures line by line: odd total is one dot, even is two. */
export function add(a: Figure, b: Figure): Figure {
  return figureOf(a.lines.map((l, i) => ((l + b.lines[i]) % 2 === 1 ? 1 : 2)));
}

export type Chart = {
  /** The sixteen houses in order: 4 Mothers, 4 Daughters, 4 Nieces, Right and Left Witness, Judge, Reconciler. */
  houses: Figure[];
  mothers: Figure[];
  daughters: Figure[];
  nieces: Figure[];
  rightWitness: Figure;
  leftWitness: Figure;
  judge: Figure;
  reconciler: Figure;
};

/**
 * The shield chart from four Mothers. The Daughters are the Mothers turned on
 * their side (the first Daughter is the Fire lines of all four Mothers, and so
 * on); each Niece is the sum of the two figures before it, and the Witnesses and
 * Judge go on the same way. The Reconciler is the Judge added to the first Mother.
 */
export function buildChart(mothers: Figure[]): Chart {
  if (mothers.length !== 4) throw new Error('Geomancy needs four Mothers');
  const daughters = [0, 1, 2, 3].map((row) => figureOf(mothers.map((m) => m.lines[row])));
  const [m1, m2, m3, m4] = mothers;
  const [d1, d2, d3, d4] = daughters;
  const nieces = [add(m1, m2), add(m3, m4), add(d1, d2), add(d3, d4)];
  const rightWitness = add(nieces[0], nieces[1]);
  const leftWitness = add(nieces[2], nieces[3]);
  const judge = add(rightWitness, leftWitness);
  const reconciler = add(judge, m1);
  return { houses: [...mothers, ...daughters, ...nieces, rightWitness, leftWitness, judge, reconciler], mothers, daughters, nieces, rightWitness, leftWitness, judge, reconciler };
}

/** Whether a Judge is possible: it always has an even number of dots. */
export const judgeIsEven = (judge: Figure) => dotsIn(judge) % 2 === 0;

/** A Mother from 4 lines of marks: the number of dots made in each line, odd or even. */
export const motherFromMarks = (counts: readonly number[]): Figure => figureOf(counts.map((n) => (n % 2 === 1 ? 1 : 2)));

/** Four Mothers made at random: each line one or two dots by a coin. */
export function castMothers(random: () => number = Math.random): Figure[] {
  return [0, 1, 2, 3].map(() => figureOf([0, 1, 2, 3].map(() => (random() < 0.5 ? 1 : 2))));
}

// ───────────────────────────── The houses ─────────────────────────────

export type Topic = 'general' | 'love' | 'money' | 'work' | 'home' | 'travel' | 'health' | 'children';
export const TOPICS: { id: Topic; label: string; house: number; about: string }[] = [
  { id: 'general', label: 'General', house: 1, about: 'the querent, and the matter as a whole' },
  { id: 'love', label: 'Love and partners', house: 7, about: 'partners, marriage and open enemies' },
  { id: 'money', label: 'Money', house: 2, about: 'wealth, goods and what you earn' },
  { id: 'work', label: 'Work and standing', house: 10, about: 'career, honour and those above you' },
  { id: 'home', label: 'Home and family', house: 4, about: 'home, land, the father and endings of things' },
  { id: 'travel', label: 'Travel and learning', house: 9, about: 'long journeys, study and belief' },
  { id: 'health', label: 'Health and daily work', house: 6, about: 'illness, daily duties and servants' },
  { id: 'children', label: 'Children and pleasure', house: 5, about: 'children, creative work and play' },
];
export const topicById = (id: Topic) => TOPICS.find((t) => t.id === id) ?? TOPICS[0];

/** The twelve houses of the heavens, which the first twelve figures of the chart are read in. */
export const HOUSE_NAMES = ['Self and life', 'Wealth', 'Siblings and short journeys', 'Home and ending', 'Children and pleasure', 'Health and work', 'Partners and rivals', 'Death and inheritance', 'Journeys and belief', 'Career and honour', 'Friends and hopes', 'Secrets and self-undoing'];

/** The chart in the order the shield is laid out: houses 1 to 12, then the Witnesses, Judge and Reconciler. */
export const POSITION_NAMES = [
  'First Mother', 'Second Mother', 'Third Mother', 'Fourth Mother',
  'First Daughter', 'Second Daughter', 'Third Daughter', 'Fourth Daughter',
  'First Niece', 'Second Niece', 'Third Niece', 'Fourth Niece',
  'Right Witness', 'Left Witness', 'Judge', 'Reconciler',
];

// ───────────────────────────── The reading ─────────────────────────────

export type GeoSection = { id: string; title: string; paragraphs: string[] };
export type GeoReading = { sections: GeoSection[]; text: string; tone: Figure['tone'] };

const WITNESS = 'The Witnesses show how the Judge was reached: the Right Witness is the querent and what they bring; the Left is the matter and the other side of it.';
const OPEN = [
  'The shield is read from the Judge outward, so begin there.',
  'Geomancy answers with one figure, and shows its working so you can see how it came.',
  'Sixteen figures stand in the shield, but the answer is in three of them.',
  'The four Mothers were made first, and everything else follows from them by addition.',
];
const CLOSE = [
  'Geomancers have always checked a chart against what they know of the situation: the figures confirm or sharpen, and they do not replace your judgement.',
  'Write the shield down and look again when the matter has played out.',
  'A chart is a conversation. Ask the same question again tomorrow and you ask a different one.',
];

const HISTORY = 'Geomancy was practised in the Islamic world as ilm al-raml and reached Latin Europe in the twelfth century. The planets and elements shown here follow one common table; others differ.';

export function readChart(chart: Chart, question: string, topic: Topic, date: string): GeoReading {
  const seed = hash(`${date}|${question}|${chart.houses.map((f) => f.id).join(',')}`);
  const { para } = composer();
  const t = topicById(topic);
  const q = question.trim();
  const { judge, rightWitness: rw, leftWitness: lw, reconciler } = chart;
  const house = chart.houses[t.house - 1];

  const opening = [
    para(rotate(OPEN, seed)),
    q ? para(`You asked: ${q.replace(/[?.\s]+$/, '')}?`) : para('No question was set, so this reads the matter as a whole.'),
    para(`The Judge is ${judge.name}, ${judge.english.toLowerCase()}: ${judge.keywords}.`),
  ];
  const judgeParas = [
    para(judge.meaning),
    para(judge.asJudge),
    para(`${sentenceCase(judge.motion)} and under ${judge.planet} in ${judge.element.toLowerCase()}, it is ${judge.tone === 'good' ? 'counted among the fortunate figures' : judge.tone === 'hard' ? 'counted among the difficult ones' : 'neither fortunate nor unfortunate in itself'}.`),
  ].filter(Boolean);

  const witnesses = [
    para(WITNESS),
    para(`The Right Witness is ${rw.name} (${rw.keywords}), the querent's side. The Left Witness is ${lw.name} (${lw.keywords}), the side of the matter.`),
    rw.id === lw.id
      ? para(`Both Witnesses are the same figure, ${rw.name}: the querent and the matter agree, and the Judge is not far from either.`)
      : rw.tone === lw.tone && rw.tone === 'good'
        ? para('Both Witnesses are fortunate figures, which strengthens the Judge.')
        : rw.tone === lw.tone && rw.tone === 'hard'
          ? para('Both Witnesses are difficult figures, which asks you to read the Judge with caution.')
          : para(`With ${rw.name} on one side and ${lw.name} on the other, the matter has more than one pull, and the Judge settles between them.`),
    judge.id === rw.id || judge.id === lw.id ? para(`The Judge repeats a Witness: ${judge.name} was already present in the working, which makes the answer firm.`) : '',
  ].filter(Boolean);

  const houseLine = t.house === 1 ? '' : para(`For ${t.label.toLowerCase()} the shield looks to the ${ordinal(t.house)} house, which is ${HOUSE_NAMES[t.house - 1].toLowerCase()}: ${house.name} sits there, ${house.keywords}.`);
  const mix = [
    houseLine,
    para(`The Reconciler, ${reconciler.name}, is the Judge added to the First Mother and is read as how the answer sits with the querent: ${reconciler.keywords}.`),
    judge.motion === 'mobile' && chart.mothers.filter((m) => m.motion === 'mobile').length >= 3 ? para('Most of the Mothers are mobile figures, so the whole shield wants to move: expect change sooner than you would think.') : '',
    chart.houses.filter((f) => f.id === judge.id).length > 2 ? para(`${judge.name} appears several times in the shield, which says this is the theme of the whole matter.`) : '',
  ].filter(Boolean);

  const sections: GeoSection[] = [
    { id: 'opening', title: 'Opening', paragraphs: opening },
    { id: 'judge', title: 'The Judge', paragraphs: judgeParas },
    { id: 'witnesses', title: 'The Witnesses', paragraphs: witnesses },
    ...(mix.length ? [{ id: 'houses', title: 'The shield', paragraphs: mix }] : []),
    { id: 'close', title: 'Close', paragraphs: [para(rotate(CLOSE, seed >>> 2)), para(HISTORY)].filter(Boolean) },
  ];
  const text = sections.map((s) => `${s.title.toUpperCase()}\n${s.paragraphs.join('\n')}`).join('\n\n');
  return { sections, text, tone: judge.tone };
}

const ordinal = (n: number) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10 < 4 ? n % 10 : 0]}`;

/** For the log: "Judge Via; Witnesses Albus and Populus". */
export const chartSummary = (c: Chart) => `Judge ${c.judge.name}; Witnesses ${joinNames([c.rightWitness.name, c.leftWitness.name])}`;
