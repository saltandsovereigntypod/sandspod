// The forms a spell can take in the builder (candle, jar, sachet, oil, knot,
// sigil, petition, poppet, bath, powder, charm bag, simmer pot or your own),
// each with what it needs, what to take care over, and steps to start from.
// The steps are a starting point written for the app in plain words; the
// person can reorder, change, add or remove any of them. Pure.

import { buildSpell } from '../spell.ts';
import type { StepDraft } from '../types.ts';
import type { SpellMethodKey, SpellSpec } from './spec.ts';

/** What a form needs care over, for the safety notes. */
export type Hazard = 'fire' | 'heat' | 'skin' | 'water' | 'dust' | 'consent';

export type SpellMethod = {
  key: SpellMethodKey;
  label: string;
  /** One line on what it is. */
  line: string;
  /** Things the form itself needs, besides the ingredients. */
  needs: string[];
  hazards: Hazard[];
  /** Placeholder for the words field. */
  wordsHint: string;
  /** Honest notes on where the form comes from, when there's something to say. */
  history?: string;
};

export const SPELL_METHODS: SpellMethod[] = [
  {
    key: 'candle',
    label: 'Candle',
    line: 'A candle dressed with herbs and lit with your words.',
    needs: ['A candle in a safe holder', 'Matches or a lighter', 'A fire-safe dish'],
    hazards: ['fire'],
    wordsHint: "The petition, charm or prayer you'll speak over the flame",
  },
  {
    key: 'jar',
    label: 'Spell jar',
    line: 'Herbs, stones and a written intention sealed in a jar to keep.',
    needs: ['A clean jar with a lid', 'A slip of paper and a pen'],
    hazards: [],
    wordsHint: 'What you say as you seal the jar',
    history:
      'Spell jars are a modern form. Their best-known ancestor is the witch bottle of early modern England, a protective charm buried by the hearth or threshold.',
  },
  {
    key: 'sachet',
    label: 'Sachet',
    line: 'A little pouch of dried herbs to tuck under a pillow, in a drawer or a bag.',
    needs: ['A small cloth bag, or a square of cloth', 'Thread or ribbon to tie it'],
    hazards: [],
    wordsHint: 'What you say as you tie it closed',
  },
  {
    key: 'charm_bag',
    label: 'Charm bag',
    line: 'A small bag of chosen things to carry with you.',
    needs: ['A small drawstring bag', 'A thread or cord'],
    hazards: [],
    wordsHint: 'What you say as you close and name it',
    history:
      'Carried charms are found in folk magic across Europe and far beyond. The mojo bag belongs to hoodoo, a living African American tradition, and is not what this makes.',
  },
  {
    key: 'oil',
    label: 'Ritual oil',
    line: 'Dried herbs steeped in a carrier oil, for dressing candles and objects.',
    needs: ['A small clean glass bottle', 'A carrier oil such as sunflower or olive', 'A label'],
    hazards: ['skin'],
    wordsHint: 'What you say over the bottle',
  },
  {
    key: 'knot',
    label: 'Knot or cord',
    line: 'Your intention tied into a cord, one knot at a time.',
    needs: ['A length of cord, ribbon or wool'],
    hazards: [],
    wordsHint: 'A line to say with each knot',
    history:
      'Tying winds, cures and bindings into knots is old and widespread in folk magic. Rhyming nine-knot charms are a modern Wiccan custom.',
  },
  {
    key: 'sigil',
    label: 'Sigil',
    line: 'Your intention drawn into a single sign, charged and let go.',
    needs: ['Paper and a pen', 'A fire-safe dish, if you will burn it'],
    hazards: ['fire'],
    wordsHint: 'The statement the sigil is made from',
    history:
      'Making a sigil from the letters of a sentence comes from the artist Austin Osman Spare in the early twentieth century, and was taken up by chaos magic. Older grimoires used seals and planetary squares instead.',
  },
  {
    key: 'petition',
    label: 'Petition',
    line: 'Your intention written down, dressed and set to work.',
    needs: ['Paper and a pen', 'A fire-safe dish, if you will burn it'],
    hazards: ['fire'],
    wordsHint: 'The petition, in your own words',
  },
  {
    key: 'poppet',
    label: 'Poppet',
    line: 'A small cloth figure filled with herbs, for healing or protection.',
    needs: ['Two pieces of cloth, a needle and thread', 'A little stuffing'],
    hazards: ['consent'],
    wordsHint: 'What you say as you name and bless it',
    history:
      'Image magic is very old: wax and clay figures appear in Greek and Roman spells and in English witch trials. Cloth poppets for healing and protection are a modern folk and Pagan form.',
  },
  {
    key: 'bath',
    label: 'Ritual bath',
    line: 'Herbs steeped and added to a bath, or poured over you in the shower.',
    needs: ['A heatproof jug or pan', 'A strainer or a muslin bag'],
    hazards: ['skin', 'water', 'heat'],
    wordsHint: 'What you say as you pour it in',
  },
  {
    key: 'powder',
    label: 'Powder',
    line: 'Dried herbs ground fine, to sprinkle at a threshold or add to other workings.',
    needs: ['A mortar and pestle kept for craft work', 'A jar and a label'],
    hazards: ['dust', 'skin'],
    wordsHint: 'What you say as you grind',
  },
  {
    key: 'simmer',
    label: 'Simmer pot',
    line: 'Kitchen herbs and peel simmered on the hob to fill the home.',
    needs: ['A pan of water', 'Peel, spices or herbs from the kitchen'],
    hazards: ['heat'],
    wordsHint: 'What you say as you stir',
  },
  {
    key: 'own',
    label: 'My own form',
    line: 'Any other kind of working: lay out the steps yourself.',
    needs: [],
    hazards: [],
    wordsHint: 'Your words',
  },
];

export const methodOf = (key: string | null | undefined): SpellMethod => SPELL_METHODS.find((m) => m.key === key) ?? SPELL_METHODS[0];

// ── Steps ──────────────────────────────────────────────────────────────────

function list(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function step(title: string, instructions: string, extra: Partial<StepDraft> = {}): StepDraft {
  return { id: null, title, instructions, spoken_text: '', minutes: '', completion_mode: 'manual', actions: [], ...extra };
}

type Parts = {
  herbs: string;
  stones: string;
  candle: string;
  hasCandle: boolean;
  others: string;
  everything: string;
  purpose: string;
  words: string;
  deities: string;
};

function partsOf(spec: SpellSpec, intentLabel: string | null): Parts {
  const of = (type: string) => spec.ingredients.filter((i) => i.type === type);
  const candles = of('candle').map((i) => i.name.replace(/ Candle$/, '').toLowerCase());
  const herbs = of('herb').map((i) => i.name.toLowerCase());
  const stones = of('crystal').map((i) => i.name.toLowerCase());
  const others = spec.ingredients.filter((i) => !['candle', 'herb', 'crystal'].includes(i.type)).map((i) => i.name);
  return {
    herbs: list(herbs),
    stones: list(stones),
    candle: candles.length ? `${list(candles)} candle${candles.length > 1 ? 's' : ''}` : 'a candle',
    hasCandle: candles.length > 0,
    others: list(others),
    everything: list([...herbs, ...stones, ...others.map((o) => o.toLowerCase())]),
    purpose: spec.purpose.trim() || intentLabel?.toLowerCase() || 'your intention',
    words: spec.words.trim(),
    deities: list(spec.deities.map((d) => d.name)),
  };
}

const OPEN = step('Cleanse and open the space', 'Clear your altar, breathe slowly, and mark the edges of your working however you usually do.');

function sit(spec: SpellSpec, text: string): StepDraft {
  const minutes = spec.focusMinutes.trim();
  return step('Sit with the working', text, minutes ? { minutes, completion_mode: 'timed' } : {});
}

function greet(p: Parts): StepDraft[] {
  if (!p.deities) return [];
  return [
    step(
      `Greet ${p.deities}`,
      `If you honour ${p.deities}, greet them as their own tradition does and set out a small offering. Ask for their help; never demand it.`,
    ),
  ];
}

function thanks(p: Parts): string {
  return p.deities ? `Thank ${p.deities} and anything else you called on` : 'Thank anything you called on';
}

/** The candle form keeps the builder's first steps exactly, so older spells read the same. */
function candleSteps(spec: SpellSpec, intentLabel: string | null): StepDraft[] {
  const steps = buildSpell({
    name: spec.name,
    intention: null,
    purpose: spec.purpose.trim() || intentLabel?.toLowerCase() || '',
    petition: spec.words,
    ingredients: spec.ingredients,
    focusMinutes: spec.focusMinutes,
  }).steps;
  const p = partsOf(spec, intentLabel);
  if (!p.deities) return steps;
  const [open, ...rest] = steps;
  const last = rest[rest.length - 1];
  return [
    open,
    ...greet(p),
    ...rest.slice(0, -1),
    { ...last, instructions: `${thanks(p)}, ground yourself, and snuff or safely tend the flame.` },
  ];
}

/** The steps a form starts from, filled in from the spell's choices. */
export function methodSteps(spec: SpellSpec, intentLabel: string | null = null): StepDraft[] {
  if (spec.method === 'candle') return candleSteps(spec, intentLabel);
  const p = partsOf(spec, intentLabel);
  const words = (title: string, instructions: string, extra: Partial<StepDraft> = {}) => step(title, instructions, { spoken_text: p.words, ...extra });
  const add = (verb: string) =>
    [p.herbs ? `${verb} ${p.herbs}, one at a time, naming what each brings.` : '', p.stones ? `Add ${p.stones}.` : '', p.others ? `Add ${p.others}.` : '']
      .filter(Boolean)
      .join(' ') || 'Add what you have chosen, one thing at a time, naming what each brings.';
  const close = (aftercare: string) => step('Close and give thanks', `${thanks(p)}, ground yourself, and ${aftercare}`);
  const head = [OPEN, ...greet(p)];

  switch (spec.method) {
    case 'jar':
      return [
        ...head,
        step('Prepare the jar', `Wash and dry the jar. Write ${p.purpose} on the paper, fold it toward you to draw something in or away from you to send it off, and place it inside.`),
        step('Fill the jar', add('Add')),
        words('Speak and seal', `Close the lid and say your words for ${p.purpose}.${p.hasCandle ? ` If you like, seal the lid with drips from ${p.candle}, and never leave the flame alone.` : ''}`),
        sit(spec, 'Hold the jar and hold your intention. Notice what you feel and anything that stands out.'),
        close('keep the jar somewhere it can do its work. When it has done its work, return the herbs to the earth and wash the jar.'),
      ];
    case 'sachet':
      return [
        ...head,
        step('Lay out the cloth', 'Lay the cloth or open bag in front of you and hold your purpose in mind.'),
        step('Fill it', add('Place')),
        words('Speak and tie', `Gather it closed, tie it with three turns of thread, and say your words for ${p.purpose}.`),
        sit(spec, 'Hold the sachet in both hands and breathe your intention into it.'),
        close('tuck the sachet where it belongs: under a pillow, in a drawer or a bag. Refresh it when the scent fades and compost the old herbs.'),
      ];
    case 'charm_bag':
      return [
        ...head,
        step('Choose what goes in', `${add('Gather')} Many people like an odd number of things.`),
        step('Fill the bag', 'Put each thing in the bag, saying in a few words why it is there.'),
        words('Close and name it', `Draw the bag closed, tie it, and say your words for ${p.purpose}. Give it a name if you like.`),
        sit(spec, 'Hold the bag and feel its weight. Notice what you feel.'),
        close('carry the bag with you. Some people give it a breath or a drop of oil now and then to keep it awake, a modern custom.'),
      ];
    case 'oil':
      return [
        ...head,
        step('Prepare the bottle', 'Wash and dry the bottle well; any water left inside can spoil the oil.'),
        step('Add the dried herbs', `${add('Add')} Use only dried herbs: fresh ones can grow mould in oil.`),
        words('Cover and speak', `Pour in the carrier oil to cover the herbs, close the bottle and say your words for ${p.purpose}.`),
        sit(spec, 'Hold the bottle to the light and hold your intention.'),
        close('label the bottle with its name and date. Keep it somewhere dark for about two weeks, shaking it now and then, then strain it. Use it to dress candles and objects, and on skin only diluted and after a patch test.'),
      ];
    case 'knot':
      return [
        ...head,
        step('Ready the cord', `Hold the cord and name what it is for: ${p.purpose}.${p.everything ? ` Lay ${p.everything} beside it.` : ''}`),
        words('Tie the knots', 'Tie knots along the cord, one at a time, saying your line with each. Pull each knot tight as you finish it.'),
        sit(spec, 'Run the knots through your fingers and hold your intention.'),
        close('keep the cord on your altar or carry it. To release the working, untie the knots or bury the cord.'),
      ];
    case 'sigil':
      return [
        ...head,
        step('Write the statement', `Write one clear sentence for ${p.purpose}, in the present tense, as if it is already so.`),
        step('Draw the sigil', 'Make the sign: cross out repeated letters and weave the rest into one shape, or use the sigil maker. Simplify it until it feels right.'),
        words('Charge it', `Gaze at the sigil, breathe slowly, and say your words.${p.everything ? ` Set ${p.everything} around it.` : ''}`),
        sit(spec, 'Hold the sigil in your mind until it feels full, then let your attention go.'),
        close('burn the sigil in a fire-safe dish, bury it, or keep it hidden away. Then try to forget it and let it work.'),
      ];
    case 'petition':
      return [
        ...head,
        step('Write the petition', `Write your petition for ${p.purpose} by hand: plainly, as you would ask a trusted friend.`),
        step('Dress it', p.herbs ? `Sprinkle ${p.herbs} over the paper and fold it toward you to draw something in, or away from you to send it off.` : 'Fold the paper toward you to draw something in, or away from you to send it off.'),
        words('Read it aloud', `Read your petition aloud.${p.hasCandle ? ` Set it under ${p.candle} and light it.` : ''}`, p.hasCandle ? { actions: [{ type: 'light_all', when: 'start' }] } : {}),
        sit(spec, 'Sit with the petition and hold your intention.'),
        close('burn the petition in a fire-safe dish, bury it, or keep it on your altar until it has come to pass.'),
      ];
    case 'poppet':
      return [
        ...head,
        step('Make the figure', 'Cut two matching figures from the cloth and sew around the edge, leaving a gap at the top.'),
        step('Fill it', `${add('Fill it with')} Then stuff it and sew it closed.`),
        words('Name and bless it', `Hold the poppet and say who it stands for and your words for ${p.purpose}. Make one for yourself, or for someone else only with their consent.`),
        sit(spec, 'Hold the poppet gently and send it your intention.'),
        close('keep the poppet somewhere safe and cared for. When the work is done, unpick it, return the herbs to the earth and wash the cloth.'),
      ];
    case 'bath':
      return [
        ...head,
        step('Brew the herbs', p.herbs ? `Steep ${p.herbs} in hot water like a strong tea for about ten minutes, then strain it.` : 'Steep your herbs in hot water like a strong tea for about ten minutes, then strain it.'),
        step('Prepare the bath', `Run a warm bath, or stand ready in the shower.${p.stones ? ` Set ${p.stones} beside the bath, out of the water.` : ''}${p.hasCandle ? ` Light ${p.candle} where it can't be knocked.` : ''}`),
        words('Pour and speak', `Let the brew cool to a comfortable warmth, pour it in or over you, and say your words for ${p.purpose}.`),
        sit(spec, 'Soak and breathe, letting the water carry away what you are releasing or soak in what you are inviting.'),
        close(`let the water drain away, pat yourself dry${p.hasCandle ? ' and snuff the candle' : ''}.`),
      ];
    case 'powder':
      return [
        ...head,
        step('Grind the herbs', p.herbs ? `Grind ${p.herbs} in the mortar, a little at a time, thinking of ${p.purpose}.` : `Grind your dried herbs in the mortar, a little at a time, thinking of ${p.purpose}.`),
        words('Speak over it', 'Hold your hands over the powder and say your words.'),
        sit(spec, 'Sit with the powder and hold your intention.'),
        close('put the powder in a labelled jar. Sprinkle a pinch where it is needed, such as across a threshold or into a sachet.'),
      ];
    case 'simmer':
      return [
        ...head,
        step('Fill the pan', 'Fill a pan two-thirds with water and bring it to a gentle simmer.'),
        step('Add the herbs', add('Add')),
        words('Stir and speak', `Stir clockwise to draw in, or anticlockwise to let go, and say your words for ${p.purpose}.`),
        sit(spec, 'Let the scent fill the room. Stay nearby and top up the water so it never boils dry.'),
        close('turn off the heat, let it cool, and return what is left to the earth.'),
      ];
    default:
      return [
        ...head,
        step('Prepare', p.everything ? `Lay out ${p.everything} and hold your purpose in mind.` : 'Lay out what you need and hold your purpose in mind.'),
        words('Speak', `Say your words for ${p.purpose}.`),
        sit(spec, 'Hold your intention. Notice what you feel and anything that stands out.'),
        close('put everything away with care.'),
      ];
  }
}
