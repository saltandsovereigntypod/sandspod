// Simmer pots: a pan of water, peel, spice and herbs kept barely simmering to
// scent and bless the home. A small book of blends, each for one or more
// intentions and seasons, and a way to turn one into a short guided working.
// Pure, so it can be tested.

import type { Ingredient, StepDraft, TemplateDraft } from '../../rituals/types.ts';
import type { PremadeIntention } from '../../rituals/premade/types.ts';
import { libraryHerbName, pantryItem } from './pantry.ts';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export const SEASONS: { key: Season; label: string }[] = [
  { key: 'spring', label: 'Spring' },
  { key: 'summer', label: 'Summer' },
  { key: 'autumn', label: 'Autumn' },
  { key: 'winter', label: 'Winter' },
];

export type SimmerPart = {
  amount: string;
  name: string;
  /** A pantry item (pantry.ts) it comes from. */
  pantry?: string;
  /** A Living Library herb key. */
  herb?: string;
  optional?: boolean;
};

export type SimmerPot = {
  id: string;
  name: string;
  intentions: PremadeIntention[];
  /** Empty means any time of year. */
  seasons: Season[];
  parts: SimmerPart[];
  /** Why these, in a line. */
  why: string;
};

const S = {
  orange: (amount = '1 orange, sliced'): SimmerPart => ({ amount, name: 'orange', pantry: 'orange' }),
  orangePeel: (): SimmerPart => ({ amount: 'peel of 1 orange', name: 'orange peel', pantry: 'orange' }),
  lemon: (amount = '1 lemon, sliced'): SimmerPart => ({ amount, name: 'lemon', pantry: 'lemon' }),
  apple: (amount = 'peel and core of 2 apples'): SimmerPart => ({ amount, name: 'apple', pantry: 'apple' }),
  cinnamon: (amount = '2 sticks'): SimmerPart => ({ amount, name: 'cinnamon', pantry: 'cinnamon' }),
  cloves: (amount = '6 whole'): SimmerPart => ({ amount, name: 'cloves', pantry: 'cloves' }),
  allspice: (amount = '6 berries'): SimmerPart => ({ amount, name: 'allspice', pantry: 'allspice' }),
  starAnise: (amount = '2 stars'): SimmerPart => ({ amount, name: 'star anise', pantry: 'star_anise' }),
  ginger: (amount = '5 thin slices of fresh root'): SimmerPart => ({ amount, name: 'ginger', pantry: 'ginger' }),
  vanilla: (amount = '1 tsp extract or half a pod'): SimmerPart => ({ amount, name: 'vanilla', pantry: 'vanilla' }),
  cardamom: (amount = '4 pods, cracked'): SimmerPart => ({ amount, name: 'cardamom', pantry: 'cardamom' }),
  nutmeg: (amount = 'a few gratings'): SimmerPart => ({ amount, name: 'nutmeg', pantry: 'nutmeg' }),
  pepper: (amount = '1 tsp whole peppercorns'): SimmerPart => ({ amount, name: 'black pepper', pantry: 'black_pepper' }),
  salt: (amount = 'a pinch'): SimmerPart => ({ amount, name: 'salt', pantry: 'salt' }),
  peppermint: (amount = 'a handful of sprigs, or 2 tea bags'): SimmerPart => ({ amount, name: 'peppermint', pantry: 'peppermint' }),
  herb: (herb: string, amount: string, optional?: boolean): SimmerPart => ({ amount, name: libraryHerbName(herb).toLowerCase(), herb, optional }),
};

export const SIMMER_POTS: SimmerPot[] = [
  {
    id: 'hearth-guard',
    name: 'Hearth guard',
    intentions: ['protection'],
    seasons: ['autumn', 'winter'],
    parts: [S.herb('bay', '3 leaves'), S.herb('rosemary', '2 sprigs'), S.cloves(), S.orangePeel(), S.pepper('6 peppercorns')],
    why: 'Bay and rosemary have guarded doors for centuries; clove and pepper keep ill-wishing off.',
  },
  {
    id: 'clear-threshold',
    name: 'Clear threshold',
    intentions: ['protection', 'cleansing'],
    seasons: ['spring', 'summer'],
    parts: [S.lemon(), S.herb('rosemary', '2 sprigs'), S.herb('basil', 'a small handful'), S.salt()],
    why: 'Lemon and salt clear, rosemary and basil guard and bless: a bright, green ward.',
  },
  {
    id: 'golden-door',
    name: 'Golden door',
    intentions: ['prosperity'],
    seasons: ['autumn', 'winter'],
    parts: [S.orange(), S.cinnamon(), S.cloves('5 whole'), S.allspice(), S.herb('bay', '1 leaf')],
    why: 'Orange is a small sun, cinnamon and allspice speed money in, and bay is for success.',
  },
  {
    id: 'green-growth',
    name: 'Green growth',
    intentions: ['prosperity', 'beginnings'],
    seasons: ['spring', 'summer'],
    parts: [S.herb('basil', 'a handful'), S.herb('mint', 'a few sprigs'), S.lemon('half a lemon, sliced'), S.ginger('3 slices of fresh root')],
    why: 'Basil and mint are the old money herbs of the windowsill; ginger gets things moving.',
  },
  {
    id: 'harvest-plenty',
    name: 'Harvest plenty',
    intentions: ['prosperity', 'peace'],
    seasons: ['autumn'],
    parts: [S.apple(), S.cinnamon(), S.nutmeg(), S.vanilla()],
    why: 'Apple and cinnamon for the gathered harvest, nutmeg for luck, vanilla to sweeten the house.',
  },
  {
    id: 'sweet-hearth',
    name: 'Sweet hearth',
    intentions: ['love', 'peace'],
    seasons: [],
    parts: [S.apple('1 apple, sliced'), S.cinnamon('1 stick'), S.cardamom(), S.vanilla(), S.herb('rose', 'a small handful of dried culinary petals', true)],
    why: 'Apple and rose belong to Venus; cardamom and vanilla make a home feel warm and welcoming.',
  },
  {
    id: 'rose-and-orange',
    name: 'Rose and orange',
    intentions: ['love'],
    seasons: ['spring', 'summer'],
    parts: [S.herb('rose', 'a handful of dried culinary petals'), S.orange(), S.vanilla('a few drops of extract'), S.herb('lavender', '1 tsp dried buds')],
    why: 'Rose and orange blossom are the old bridal flowers; lavender keeps love gentle.',
  },
  {
    id: 'mending-steam',
    name: 'Mending steam',
    intentions: ['healing'],
    seasons: ['autumn', 'winter'],
    parts: [S.lemon(), S.ginger(), S.herb('thyme', '4 sprigs'), S.cinnamon('1 stick')],
    why: 'Lemon, ginger and thyme are the sickroom standbys; cinnamon warms the house through.',
  },
  {
    id: 'garden-air',
    name: 'Garden air',
    intentions: ['healing', 'peace'],
    seasons: ['spring', 'summer'],
    parts: [S.herb('lemon_balm', 'a handful of fresh leaves'), S.herb('mint', 'a few sprigs'), S.lemon('half a lemon, sliced'), S.herb('chamomile', '2 tbsp dried flowers or 2 tea bags')],
    why: 'Lemon balm gladdens the heart, chamomile soothes, and mint and lemon freshen a tired room.',
  },
  {
    id: 'sweep-out',
    name: 'Sweep-out',
    intentions: ['banishing', 'cleansing'],
    seasons: [],
    parts: [S.lemon(), S.herb('rosemary', '3 sprigs'), S.cloves('8 whole'), S.pepper(), S.herb('bay', '2 leaves')],
    why: 'Sharp lemon, rosemary, clove and pepper: the house-clearing blend for a waning moon.',
  },
  {
    id: 'clear-ending',
    name: 'Clear ending',
    intentions: ['banishing'],
    seasons: ['autumn', 'winter'],
    parts: [S.herb('sage', 'a few leaves of garden sage'), S.lemon('half a lemon, sliced'), S.cloves(), S.starAnise('1 star')],
    why: 'Garden sage and clove close a chapter; star anise watches the door as it shuts.',
  },
  {
    id: 'moon-window',
    name: 'Moon window',
    intentions: ['intuition'],
    seasons: ['autumn', 'winter'],
    parts: [S.starAnise('3 stars'), S.herb('bay', '2 leaves'), S.orangePeel(), S.vanilla('a few drops of extract')],
    why: 'Star anise and bay are the cupboard’s seers; orange and vanilla keep it warm, not eerie.',
  },
  {
    id: 'dreaming-pot',
    name: 'Dreaming pot',
    intentions: ['intuition', 'peace'],
    seasons: [],
    parts: [S.herb('chamomile', '2 tbsp dried flowers or 2 tea bags'), S.herb('lavender', '1 tsp dried buds'), S.starAnise('1 star'), S.vanilla()],
    why: 'For the hour before bed: chamomile and lavender to settle, star anise to open the dream door.',
  },
  {
    id: 'brave-heart',
    name: 'Brave heart',
    intentions: ['courage'],
    seasons: ['autumn', 'winter'],
    parts: [S.ginger(), S.cinnamon(), S.cloves('4 whole'), S.orange(), S.pepper('4 peppercorns')],
    why: 'Ginger, cinnamon and pepper are fire in the pot; orange keeps the courage cheerful.',
  },
  {
    id: 'bright-morning',
    name: 'Bright morning',
    intentions: ['courage', 'beginnings'],
    seasons: ['spring', 'summer'],
    parts: [S.orange(), S.ginger('3 slices of fresh root'), S.herb('basil', 'a handful'), S.herb('mint', 'a few sprigs')],
    why: 'A sunny, peppery pot for the morning of something new.',
  },
  {
    id: 'spring-clean',
    name: 'Spring clean',
    intentions: ['cleansing'],
    seasons: ['spring'],
    parts: [S.lemon('2 lemons, sliced'), S.herb('rosemary', '3 sprigs'), S.herb('mint', 'a handful'), S.herb('thyme', '3 sprigs')],
    why: 'The classic clearing herbs with plenty of lemon, to put on while you clean.',
  },
  {
    id: 'fresh-linen',
    name: 'Fresh linen',
    intentions: ['cleansing', 'peace'],
    seasons: ['summer', 'spring'],
    parts: [S.lemon(), S.herb('lavender', '1 tbsp dried buds'), S.herb('rosemary', '1 sprig')],
    why: 'Lavender has scented the washing and the linen press for centuries; lemon and rosemary keep it bright.',
  },
  {
    id: 'cold-hearth-clearing',
    name: 'Cold hearth clearing',
    intentions: ['cleansing', 'protection'],
    seasons: ['winter', 'autumn'],
    parts: [S.orangePeel(), S.herb('rosemary', '2 sprigs'), S.herb('juniper', '6 dried berries', true), S.cinnamon('1 stick')],
    why: 'For when the windows stay shut: rosemary and juniper were burned to sweeten sickrooms.',
  },
  {
    id: 'new-leaf',
    name: 'New leaf',
    intentions: ['beginnings'],
    seasons: ['spring', 'summer'],
    parts: [S.orange('half an orange, sliced'), S.lemon('half a lemon, sliced'), S.herb('mint', 'a few sprigs'), S.herb('bay', '1 leaf you have whispered your wish to')],
    why: 'Citrus for a bright start, mint to wake things up, and a bay leaf to carry the wish.',
  },
  {
    id: 'first-light',
    name: 'First light',
    intentions: ['beginnings', 'prosperity'],
    seasons: ['winter'],
    parts: [S.orange(), S.cinnamon(), S.starAnise('1 star'), S.herb('bay', '1 leaf')],
    why: 'A midwinter pot for the returning sun: orange and cinnamon for light, bay for a good year.',
  },
  {
    id: 'study-lamp',
    name: 'Study lamp',
    intentions: ['study'],
    seasons: [],
    parts: [S.herb('rosemary', '3 sprigs'), S.peppermint(), S.lemon('peel of half a lemon'), S.herb('bay', '1 leaf')],
    why: 'Rosemary is for remembrance, peppermint and lemon for a clear head.',
  },
  {
    id: 'clear-head',
    name: 'Clear head',
    intentions: ['study', 'courage'],
    seasons: ['spring', 'summer'],
    parts: [S.herb('lemongrass', '2 stalks, bruised'), S.lemon('half a lemon, sliced'), S.herb('basil', 'a small handful'), S.herb('mint', 'a few sprigs')],
    why: 'Lemongrass and mint are Mercury’s; basil gives the nerve to speak up.',
  },
  {
    id: 'quiet-house',
    name: 'Quiet house',
    intentions: ['peace'],
    seasons: [],
    parts: [S.herb('chamomile', '2 tbsp dried flowers or 2 tea bags'), S.herb('lavender', '1 tsp dried buds'), S.vanilla(), S.apple('1 apple, sliced')],
    why: 'The gentlest pot in the book, for a house that needs to slow down.',
  },
  {
    id: 'winter-comfort',
    name: 'Winter comfort',
    intentions: ['peace', 'love'],
    seasons: ['winter'],
    parts: [S.orange(), S.cinnamon(), S.cloves('5 whole'), S.cardamom('3 pods, cracked'), S.vanilla()],
    why: 'The smell of the midwinter kitchen: a comfort and a welcome.',
  },
];

const potById = new Map(SIMMER_POTS.map((p) => [p.id, p]));
export const simmerPot = (id: string | null | undefined): SimmerPot | null => (id ? potById.get(id) ?? null : null);

export type SeasonGuess = { season: Season; hemisphere: 'north' | 'south'; /** No latitude was known, so northern was assumed. */ assumed: boolean };

/** Meteorological seasons (whole months), flipped for the southern hemisphere. */
export function seasonAt(date: Date, latitude: number | null | undefined): SeasonGuess {
  const known = typeof latitude === 'number' && Number.isFinite(latitude);
  const hemisphere = known && latitude! < 0 ? 'south' : 'north';
  const month = date.getMonth(); // 0 = January
  const north: Season = month <= 1 || month === 11 ? 'winter' : month <= 4 ? 'spring' : month <= 7 ? 'summer' : 'autumn';
  const flip: Record<Season, Season> = { winter: 'summer', spring: 'autumn', summer: 'winter', autumn: 'spring' };
  return { season: hemisphere === 'south' ? flip[north] : north, hemisphere, assumed: !known };
}

/** The best two or three blends for an intention and season, best first. */
export function suggestSimmer(intention: string, season: Season, count = 3): SimmerPot[] {
  return SIMMER_POTS.map((pot, order) => {
    const at = pot.intentions.indexOf(intention as PremadeIntention);
    if (at < 0) return null;
    const fit = pot.seasons.length === 0 ? 1 : pot.seasons.includes(season) ? 2 : 0;
    return { pot, score: (at === 0 ? 3 : 2) + fit, order };
  })
    .filter((x): x is { pot: SimmerPot; score: number; order: number } => !!x)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, count)
    .map((x) => x.pot);
}

/** The Library entry a part links to ("traditional:herb:<key>"), if any. */
export function partLibraryId(part: SimmerPart): string | null {
  const key = part.herb ?? pantryItem(part.pantry)?.library;
  return key ? `traditional:herb:${key}` : null;
}

export const SIMMER_SAFETY = [
  'Never leave a simmer pot on the stove unattended, and turn it off before you go out or to bed.',
  'Keep the heat at the lowest simmer and top it up with hot water every 20 to 30 minutes so it never boils dry.',
  'Keep pets and small children away from the hot pan and the cooker.',
  'Use a stainless steel or enamel pan, not a non-stick one: a non-stick pan that boils dry gives off fumes that can kill pet birds.',
  'No essential oils in the pot: heated and spread through the air they are harmful to cats, dogs and birds.',
  'Don’t eat or drink what’s been simmering. Strain the solids onto the compost when you’re done, where pets can’t get at the spices.',
];

const WORDS: Record<string, string> = {
  protection: 'Steam rise, walls hold; keep this house and all it holds.',
  prosperity: 'As the scent fills every room, let plenty fill this home.',
  love: 'Sweet the air and warm the hearth; love is welcome in this house.',
  healing: 'Warm and green, the kettle’s breath: mend what’s tired, ease what aches.',
  banishing: 'What doesn’t belong here, go with the steam and don’t come back.',
  intuition: 'Steam and star, open the door; let me see a little more.',
  courage: 'Fire under the pot, fire in my chest; I am ready.',
  cleansing: 'Clear the air and clear the corners; only what is good stays.',
  beginnings: 'New water, new day; let what starts here go well.',
  study: 'Clear head, steady hand; let what I learn here stay.',
  peace: 'Slow the house and soft the light; peace in every room tonight.',
};

/** Clockwise to draw in; anticlockwise to send away. */
export const stirsAway = (intention: string) => intention === 'banishing' || intention === 'cleansing';

const partLine = (p: SimmerPart) => `${p.name} (${p.amount})${p.optional ? ', if you have it' : ''}`;

function list(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** A blend as a short guided working, to begin straight away. */
export function simmerDraft(pot: SimmerPot, intention: string, intentionLabel: string): TemplateDraft {
  const away = stirsAway(intention);
  const direction = away ? 'anticlockwise' : 'clockwise';
  const step = (title: string, instructions: string, extra: Partial<StepDraft> = {}): StepDraft => ({
    id: null,
    title,
    instructions,
    spoken_text: '',
    minutes: '',
    completion_mode: 'manual',
    actions: [],
    ...extra,
  });
  const steps: StepDraft[] = [
    step(
      'Ready the stove',
      'Clear the hob around a medium saucepan and fill it two-thirds with water. Make sure you’ll be home and awake the whole time it simmers. Stand at the stove for a breath and say what this pot is for.',
    ),
    step(
      'Add each thing with a word',
      `Add ${list(pot.parts.map(partLine))} one at a time. As each goes in, name what it brings in your own words: ${pot.why}`,
    ),
    step(
      'Bring it to life',
      `Bring it just to the boil, then turn it down to the lowest heat so it barely steams. Stir three times ${direction}${away ? ', to send away' : ', to draw in'}, and say the words.`,
      { spoken_text: WORDS[intention] ?? WORDS.peace },
    ),
    step(
      'Breathe it in',
      'Stay by the pot while the scent builds. Breathe slowly and picture the steam carrying your intention up and out into the house.',
      { minutes: '5' },
    ),
    step(
      'Walk it through the home',
      `Open the inside doors and walk slowly from room to room, letting the scent follow you. Pause in each doorway and think of ${intentionLabel.toLowerCase()} settling there.`,
      { minutes: '10' },
    ),
    step(
      'Tend it',
      'Let it simmer for as long as you are home to watch it, up to two hours. Check every 20 to 30 minutes and top it up with hot water; each top-up renews the working.',
    ),
  ];
  const ingredients: Ingredient[] = [];
  for (const part of pot.parts) {
    const id = partLibraryId(part);
    if (!id) continue;
    const ref = id.replace(/:/g, '/');
    if (!ingredients.some((i) => i.ref === ref)) ingredients.push({ ref, name: libraryHerbName(ref.split('/')[2]), type: 'herb' });
  }
  return {
    id: null,
    title: `${pot.name} simmer pot`,
    intention: `A simmer pot for ${intentionLabel.toLowerCase()}: ${pot.why}`,
    preparation: [`Gather a saucepan, water, and ${list(pot.parts.map(partLine))}.`, `Take care: ${SIMMER_SAFETY.join(' ')}`].join('\n\n'),
    closing:
      'When you’re done, turn off the heat and let it cool. Strain the solids onto the compost or bury them with thanks, wipe the hob, and say goodnight to the house.',
    linked_altar_id: null,
    grimoire_page_id: null,
    steps,
    ingredients,
    kind: 'spell',
  };
}
