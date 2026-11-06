// Reading incense smoke (capnomancy) and wax poured into water
// (ceromancy). Both are old folk arts with thin written history: smoke was
// read in antiquity at altars and sacrifices, and poured lead and wax are a
// New Year custom in Germany, Finland and elsewhere in northern Europe. The
// forms below are the ones modern readers use; the reading says so. Shapes
// seen in either are read from the tea-leaf dictionary. Built on the shared
// engine (../symbolReading.ts). Pure, so it can be tested.

import { composer, hash, joinNames, rotate, roundRobin, sentenceCase } from '../symbolReading.ts';
import { renderSections, leanOf } from './tea.ts';
import { TEA_SYMBOLS, teaSymbolById, type TeaSymbol } from './teaSymbols.ts';

type Row = string;
const parse = (rows: Row, category: TeaSymbol['category']): TeaSymbol[] =>
  rows
    .trim()
    .split('\n')
    .map((r) => {
      const [id, name, words, tone, theme, meaning, question] = r.split('|');
      return { id, name, words: words.split(',').map((w) => w.trim()), category, tone, theme, meaning, question } as TeaSymbol;
    });

// id | label | other words | tone | theme | meaning | question
export const SMOKE_FORMS: TeaSymbol[] = parse(
  `
rises-straight|Rises straight up|straight,column,still|good|a clear way and a willing answer|Smoke that climbs straight and unbroken is the classic good sign: the matter is clear, the way is open, and what you asked is being received. It needs a still room, so check for draughts before you trust it.|What is clear enough to act on now?
curls|Curls and spirals|curling,spiral,coil|mixed|a matter that turns on itself|Curling smoke is read as a question going round before it settles: a spiral is a matter with more in it than shows, and tight curls can mean an argument, or a mind going round.|Where are you going in circles?
splits|Splits in two|forks,divides,parts|mixed|a choice, or two ways|Smoke that parts into two threads is a fork: a decision, or two people, or two answers that are both true. See which thread was thicker and which lasted longer.|What are the two roads, and which one was already thicker?
toward-me|Drifts toward you|toward,drifts to me,comes to|good|something coming your way|Smoke that leans toward you is traditionally what is coming to you: news, a person, a result. It is as often a draught as an omen, so notice, then see if it stays.|What do you want to arrive?
away|Drifts away from you|away,leaves,goes off|mixed|something going out into the world|Smoke carried away from you is the request travelling outward, or something leaving your life. It is neither good nor ill until you know what you asked.|What are you ready to send away?
toward-another|Drifts toward someone else|toward them,toward a guest,toward another|mixed|attention that is on another person|When smoke goes to one person in the room, readers say the matter concerns them, or they are the one to hear it. Say aloud whose name came to mind.|Who did you think of as it moved?
hangs-low|Hangs low|low,heavy,pools,settles|hard|a heaviness that has not lifted|Smoke that hangs low and will not rise is a heavy mood or a block: something not ready to be carried up. Open a window and wait, then see whether it lifts.|What feels too heavy to rise?
forms-shapes|Forms shapes|shapes,figures,pictures|good|a message in a picture|When the smoke seems to make a shape, treat it as you would a tea leaf: name what you saw first, before you reason it out, and pick it from the shapes below.|What did you see before you doubted it?
breaks-up|Breaks up quickly|dissolves,vanishes,scatters|hard|an unsettled matter|Smoke that scatters at once is read as a matter without a hold yet: unsettled, scattered, or not yet ready to be asked. Wait a day and ask again.|What is not yet ready to be asked?
thick-dark|Thick and dark|dark,black,heavy smoke|hard|something being burned off|Thick, dark smoke is often only a damp stick or too much resin. As a sign it is read as something being cleared, so clear the room and begin again.|What are you ready to burn off?
thin-white|Thin and pale|white,fine,faint,wisp|good|a gentle blessing|A thin, pale thread is a mild good sign: a quiet answer, a blessing, a protective presence rather than a dramatic one.|What small kindness have you been overlooking?
bends-door|Bends toward the door or window|door,window,exit,outward|mixed|a way out, or a message sent|Smoke that leans for the door or the window is read as a departure or a message going out to a person beyond the room.|What wants to leave?
clings|Clings to the incense|clings,hugs,stays close|mixed|a wish to hold on|Smoke that stays close round the incense is something held close and not yet released; it can be comfort, or a reluctance to let go.|What are you holding too close?
dances|Dances and flickers|flickers,wavers,restless|mixed|unsettled energy|A restless, wavering line is read like a restless flame: movement in the matter, perhaps a presence close by, or just a draught. Check the room first.|What would calm it?
rings|Makes rings|ring,circle,loop|good|a circle completing|Rings of smoke, rare in incense, are read as completion: a cycle closing or a promise rounding off.|What is nearly whole?
`,
  'form',
);

// Wax poured into cold water: what it did as well as what it looks like.
export const WAX_FORMS: TeaSymbol[] = parse(
  `
wax-lump|One solid mass|lump,blob,single|good|a single clear matter|A single mass says the matter is one thing, whole and not broken up: the question is simpler than it feels.|What is the one thing at the centre?
wax-many|Many small pieces|beads,drops,scattered,spatter|mixed|many small things, not one|Wax that breaks into beads is a matter split into many parts: lots of small events or voices, with no single answer yet.|Which of the small pieces is actually yours to tend?
wax-sheet|A thin flat sheet|sheet,flat,skin,disc|mixed|something spread thin|A thin sheet is energy spread too widely or an effort that has no depth. It asks what you could gather into one place.|Where have you spread yourself too thin?
wax-ring|A ring with an empty centre|hollow,ring,hole|good|a circle with space inside it|A ring with a hole is read as a promise with room in it, or a cycle with a gap: something is missing from the middle and wants naming.|What is missing from the centre?
wax-strand|A long strand|thread,string,tail,trail|good|a path or a connection|A long thread is a journey, a link to a distant person or a plan in stages. Where it ends tells you where it leads.|Where does the thread end, and who is there?
wax-sank|Sank to the bottom|sank,sunk,bottom|hard|something hidden or heavy|Wax that sinks is a matter that is hidden or has gone below your attention, and should be brought up to look at.|What have you buried that is still there?
wax-floats|Floated to the edge|edge,rim,side|mixed|a matter held at a distance|Wax that drifts to the rim is a matter kept at arm's length, or concern for what is happening beyond you.|What are you keeping at the edge?
wax-split|Split in two|two,halves,separate|mixed|a parting or a choice|Wax that parts into two is a division: two people, two paths or a parting. Which half is larger?|What is dividing?
wax-spiky|Spiky or jagged|jagged,sharp,spikes|hard|friction and sharp edges|Jagged wax is read as sharp words and friction; a matter with edges that will not be rushed.|Where does it catch?
wax-smooth|Smooth and rounded|smooth,round,soft|good|ease and a settled matter|Smooth, rounded wax is the easy one: a matter that settles and comes to rest without much fuss.|What is allowed to be easy?
wax-wall|Climbed the bowl's side|climbed,clings,side|mixed|reaching for something|Wax that clings to the bowl's side is reaching up and out, or refusing to settle; it asks what you are reaching for.|What are you reaching for?
wax-bridge|Joined to another piece|joined,linked,touching,fused|good|a link between two things|Pieces joined together read as a connection: two people, two matters, or two parts of yourself that belong together.|What are you ready to connect?
`,
  'form',
);

/** Everything a poured-wax reading can pick: the wax forms, then every tea shape. */
export const WAX_SYMBOLS: TeaSymbol[] = [...WAX_FORMS, ...TEA_SYMBOLS];
export const waxSymbolById = (id: string) => WAX_SYMBOLS.find((s) => s.id === id);
export const smokeFormById = (id: string) => SMOKE_FORMS.find((s) => s.id === id);

export type SignKind = 'smoke' | 'wax';
export type SignInput = {
  kind: SignKind;
  /** The form of the smoke, or of the wax (the ids above). */
  forms: string[];
  /** Shapes seen in it (tea-leaf shape ids). */
  shapes: string[];
  question: string;
  date: string;
  /** Which incense or candle. */
  label?: string;
};
export type SignReading = { blocks: { title: string; paragraphs: string[] }[]; sections: { id: string; title: string; paragraphs: string[] }[]; lean: ReturnType<typeof leanOf>; summary: string; text: string };

const OPENERS: Record<SignKind, string[]> = {
  smoke: [
    'Let the room be still and read the smoke while it is still moving.',
    'Smoke is read as it rises, not afterwards: you have a minute or two.',
    'Watch the first thread from the tip and follow it up as far as it goes.',
    'Reading smoke is one of the oldest of the small arts, and one of the quietest.',
  ],
  wax: [
    'Let the wax settle and cool in the water before you lift it out and look.',
    'Hold the cooled wax to the light: the shadow it throws can be read as well as the shape.',
    'Turn the piece slowly. Shapes in wax change with the angle, so read it from more than one side.',
    'Poured wax has been read at New Year in northern Europe for a long time, mostly as a game and a way to talk about the year ahead.',
  ],
};
const CLOSES = [
  'It is a way of reflecting, and a draught or a hot wick explains a lot; take what rings true.',
  'Nothing here is fixed. It shows how things lean today and you can lean against it.',
  'Write down what you saw before it fades, and look again in a month.',
  'Ask the last question aloud, and notice what you answer before you think.',
];
const HISTORY: Record<SignKind, string> = {
  smoke: 'Smoke-reading (capnomancy) is old but thinly recorded; these meanings are modern folk and craft usage, not a lost rulebook.',
  wax: 'Wax and lead pouring is a European New Year custom; the meanings here are the folk and modern craft ones.',
};

export function readSigns(input: SignInput): SignReading {
  const forms = input.forms.map((id) => (input.kind === 'smoke' ? smokeFormById(id) : waxSymbolById(id))).filter((s): s is TeaSymbol => !!s);
  const shapes = input.shapes.map((id) => (input.kind === 'wax' ? waxSymbolById(id) : teaSymbolById(id))).filter((s): s is TeaSymbol => !!s);
  const seed = hash(`${input.kind}|${input.date}|${input.question}|${[...input.forms, ...input.shapes].join(',')}`);
  const { fresh, para } = composer();
  const all = [...forms, ...shapes];
  const lean = leanOf(all.map((symbol) => ({ symbol, depth: 'middle' as const })));
  const what = input.kind === 'smoke' ? (input.label ? `the smoke of ${input.label}` : 'the smoke') : input.label ? `the wax from ${input.label}` : 'the wax';
  const q = input.question.trim();

  const opening = [
    para(rotate(OPENERS[input.kind], seed)),
    q ? para(`You asked: ${q.replace(/[?.\s]+$/, '')}?`) : para(`No question was set, so this reads ${what} as it came.`),
    all.length ? para(`${sentenceCase(joinNames(all.map((s) => s.name.toLowerCase())))} ${all.length === 1 ? 'is' : 'are'} what you saw.`) : '',
    para(
      lean === 'favourable'
        ? 'Taken together, the signs lean kindly.'
        : lean === 'cautious'
          ? 'Taken together, the signs ask for care, as a note and not a verdict.'
          : lean === 'mixed'
            ? 'Taken together, the signs are mixed: something helpful and something that needs watching.'
            : 'Nothing was picked, so this is left open.',
    ),
  ].filter(Boolean);

  const make = (s: TeaSymbol, i: number): { symbol: TeaSymbol; paragraphs: string[] } => ({
    symbol: s,
    paragraphs: [para(`${s.name}: ${s.meaning}`), para(rotate([`This points to ${s.theme}.`, `In short: ${s.theme}.`, `Put plainly, it speaks of ${s.theme}.`], seed + i))].filter(Boolean),
  });
  const formsRead = forms.map(make);
  const shapesRead = shapes.map((s, i) => make(s, i + forms.length));
  const symbols = [...formsRead, ...shapesRead];

  const questions = roundRobin(symbols.map((s) => [s.symbol.question]), seed, 3, fresh);
  const close = [para(rotate(CLOSES, seed >>> 3)), para(HISTORY[input.kind])].filter(Boolean);
  const sections = [
    { id: 'opening', title: 'Opening', paragraphs: opening },
    ...(symbols.length ? [{ id: 'symbols', title: input.kind === 'smoke' ? 'The smoke' : 'The wax', paragraphs: [] }] : []),
    ...(questions.length ? [{ id: 'questions', title: 'Questions to sit with', paragraphs: questions }] : []),
    { id: 'close', title: 'Close', paragraphs: close },
  ];
  const summary =
    all.length === 0
      ? 'Read'
      : `${joinNames(all.slice(0, 3).map((s) => s.name.toLowerCase()))}: ${lean === 'favourable' ? 'a kind sign' : lean === 'cautious' ? 'a note of care' : 'a mixed sign'}`;
  return { blocks: symbols.map((s) => ({ title: s.symbol.name, paragraphs: s.paragraphs })), sections, lean, summary: sentenceCase(summary), text: renderSections(sections, symbols) };
}
