// Kitchen witchery: recipes cooked with an intent. Each has what it's for
// (the spell timing advisor's intents, so "Find a good time" opens with it),
// the festivals of the calendars it belongs to (holy-day page refs), the
// altar's seasonal things and Offerings drawer foods it goes with, its
// ingredients tied to the Living Library and the pantry correspondences,
// and honest allergy and safety notes. A few starter recipes are written
// here, each marked traditional, adapted (an old custom, a modern recipe)
// or modern; your own are craft entries (kitchen.recipes). Any recipe can be
// kept as a page in your Grimoire, under Kitchen witchery.
// Pure, so it can be tested and shared with the website (js/core/hearth.js).

import { holidaysBetween, type HolidayChoice } from '../../holidays.ts';
import { holyRef } from '../../holy/refs.ts';
import { TRADITIONAL_LIBRARY } from '../../library/traditionalData.ts';
import { HERB_OPTIONS, herbName } from '../green/garden.ts';
import { PANTRY, pantryItem } from '../kitchen/pantry.ts';
import { timingIntent, TIMING_INTENTS } from '../cosmic/timing.ts';

export const RECIPES = 'kitchen.recipes';
export const RECIPE_SECTION = 'Kitchen witchery';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()) : []);
const DAY = 86_400_000;

export type Origin = 'traditional' | 'adapted' | 'modern' | 'mine';
export const ORIGIN_LABELS: Record<Origin, string> = {
  traditional: 'Traditional',
  adapted: 'An old custom, a modern recipe',
  modern: 'Modern',
  mine: 'Your own',
};

export type Allergen = 'gluten' | 'dairy' | 'egg' | 'nuts' | 'alcohol' | 'honey';
export const ALLERGENS: { id: Allergen; label: string; note: string }[] = [
  { id: 'gluten', label: 'Gluten', note: 'Contains wheat, barley, rye or oats that may not be gluten-free.' },
  { id: 'dairy', label: 'Dairy', note: 'Contains milk, butter or cream.' },
  { id: 'egg', label: 'Egg', note: 'Contains egg.' },
  { id: 'nuts', label: 'Nuts', note: 'Contains or may contain nuts.' },
  { id: 'alcohol', label: 'Alcohol', note: 'Contains alcohol unless you take the alcohol-free way.' },
  { id: 'honey', label: 'Honey', note: 'Never give honey to a baby under one year old.' },
];
export const allergenLabel = (id: string) => ALLERGENS.find((a) => a.id === id)?.label ?? id;

/** Always shown with a recipe. */
export const KITCHEN_SAFETY =
  'Cook for the people at your table: check allergies before you share food, and take the same care with offerings left where children or animals can reach them. Herbs in food are folklore and flavour, not medicine; if you’re pregnant, breastfeeding or on medication, ask a pharmacist about any herb you’re unsure of.';

export type Ingredient = { text: string; herb?: string | null; pantry?: string | null };

export type Recipe = {
  title: string;
  origin: Origin;
  /** A spell timing advisor intent key (lib/craft/cosmic/timing.ts). */
  intent: string | null;
  /** Holy-day page refs (lib/holy): "wheel-samhain". */
  festivals: string[];
  /** The altar's seasonal things it goes with (lib/altar/seasonal.ts ids). */
  seasonal: string[];
  /** The Offerings drawer food it can be set out as (lib/altar/offerings.ts OFFERING_FOODS id), or 'milk' for the Dish of Milk. */
  offering: string | null;
  serves: string;
  time: string;
  ingredients: Ingredient[];
  method: string[];
  /** Words said while making or serving it. */
  words: string;
  allergens: Allergen[];
  /** Safety beyond the allergens. */
  safety: string;
  /** Where it comes from, honestly. */
  about: string;
  notes: string;
};

export type StarterRecipe = Recipe & { id: string };

/** The holy days a recipe can belong to, in words, for the editor and the page. */
export const FESTIVAL_NAMES: Record<string, string> = {
  'wheel-samhain': 'Samhain',
  'wheel-yule': 'Yule',
  'wheel-imbolc': 'Imbolc',
  'wheel-ostara': 'Ostara',
  'wheel-beltane': 'Beltane',
  'wheel-litha': 'Litha',
  'wheel-lammas': 'Lammas',
  'wheel-mabon': 'Mabon',
  'celtic-samhain_gaelic': 'Samhain (Gaelic)',
  'celtic-la_fheile_bride': 'Lá Fhéile Bríde',
  'celtic-bealtaine': 'Bealtaine',
  'celtic-lughnasadh': 'Lughnasadh',
  'christian-epiphany': 'Twelfth Night & Epiphany',
  'christian-st_brigid': 'St Brigid’s Day',
  'christian-st_john': 'St John’s Eve',
  'christian-lammas': 'Lammas Day',
  'christian-michaelmas': 'Michaelmas',
  'christian-all_souls': 'All Souls',
  'christian-christmas': 'Christmas',
};
export const festivalName = (ref: string) => FESTIVAL_NAMES[ref] ?? ref.replace(/^[a-z_]+-/, '').replace(/_/g, ' ');

/** The altar's seasonal things recipes name (checked against lib/altar/seasonal.ts by the tests). */
export const SEASONAL_NAMES: Record<string, string> = {
  apples: 'Apples',
  pomegranate: 'Pomegranate',
  gourds: 'Gourds',
  'wheat-sheaf': 'Wheat Sheaf',
  'corn-dolly': 'Corn Dolly',
  'yule-log': 'Yule Log',
  'flower-crown': 'Flower Crown',
  'brigids-cross': 'Brigid’s Cross',
  'sun-wheel': 'Sun Wheel',
  'ostara-eggs': 'Ostara Eggs',
};

/** The Offerings drawer things recipes name (checked against lib/altar/offerings.ts and offeringDrawer.ts). */
export const OFFERING_NAMES: Record<string, string> = {
  bread: 'Bread',
  fruit: 'Fruit',
  sweets: 'Honey Cakes and Sweets',
  meal: 'A Cooked Meal',
  harvest: 'Whole Apples and Gourds',
  honeycomb: 'Honeycomb',
  milk: 'Dish of Milk',
};

const i = (text: string, link: { herb?: string; pantry?: string } = {}): Ingredient => ({ text, herb: link.herb ?? null, pantry: link.pantry ?? null });

export const STARTER_RECIPES: StarterRecipe[] = [
  {
    id: 'soul-cakes',
    title: 'Soul cakes',
    origin: 'adapted',
    intent: 'ancestors',
    festivals: ['wheel-samhain', 'christian-all_souls', 'celtic-samhain_gaelic'],
    seasonal: ['apples', 'pomegranate'],
    offering: 'sweets',
    serves: 'About 16 small cakes',
    time: '45 minutes',
    ingredients: [
      i('225 g plain flour', { pantry: 'flour' }),
      i('110 g butter, cold and diced', { pantry: 'butter' }),
      i('85 g caster sugar', { pantry: 'sugar' }),
      i('1 egg yolk', { pantry: 'eggs' }),
      i('½ tsp each ground cinnamon, nutmeg and allspice', { herb: 'cinnamon' }),
      i('A pinch of saffron steeped in 2 tbsp warm milk (or just the milk)', { herb: 'saffron' }),
      i('50 g currants or raisins'),
    ],
    method: [
      'Rub the butter into the flour and spices until it looks like breadcrumbs, then stir in the sugar and currants.',
      'Add the egg yolk and the saffron milk, and bring it together into a soft dough.',
      'Roll it out about 1 cm thick and cut rounds. Mark each with a cross, as the old soul cakes were.',
      'Bake at 180 °C (160 °C fan) for 15 to 20 minutes, until pale gold.',
      'Set one aside on the altar or by the door for your dead, and share the rest.',
    ],
    words: 'A soul cake, a soul cake, for all the souls of mine. Remembered and fed, my beloved dead.',
    allergens: ['gluten', 'dairy', 'egg'],
    safety: '',
    about:
      'Souling is a real English and Welsh custom: from the Middle Ages into the twentieth century, poor people and children went door to door around All Souls (2 November), singing for small spiced cakes in return for prayers for the household’s dead. Recipes were never fixed and varied by place; this one is a modern version of the usual spiced, currant-studded cake. The rhyme is our own, after the souling songs.',
    notes: '',
  },
  {
    id: 'beltane-bannock',
    title: 'Beltane bannock',
    origin: 'adapted',
    intent: 'protection',
    festivals: ['wheel-beltane', 'celtic-bealtaine'],
    seasonal: ['flower-crown'],
    offering: 'bread',
    serves: 'One round, cut in eight',
    time: '30 minutes',
    ingredients: [
      i('250 g medium oatmeal', { pantry: 'oats' }),
      i('A good pinch of salt', { pantry: 'salt' }),
      i('½ tsp bicarbonate of soda'),
      i('30 g butter, melted', { pantry: 'butter' }),
      i('About 120 ml hot water'),
      i('1 tbsp honey (optional)', { pantry: 'honey' }),
    ],
    method: [
      'Mix the oatmeal, salt and soda. Pour in the melted butter, the honey if you like, and enough hot water to make a firm dough.',
      'Press it into a round about 1 cm thick on a floured board and cut it into eight.',
      'Cook on a dry griddle or heavy pan over a low heat, about 5 minutes a side, until firm and lightly browned.',
      'Break the first piece and give it to the land: crumble it outside, with thanks for the summer coming in.',
    ],
    words: 'To the land that feeds us, the first of the bread. Keep this house and all in it through the bright half of the year.',
    allergens: ['gluten', 'dairy', 'honey'],
    safety: 'Oats are often grown or milled with wheat: use certified gluten-free oats for anyone with coeliac disease.',
    about:
      'Eighteenth-century travellers in the Scottish Highlands, among them Thomas Pennant (1769), described Beltane gatherings where an oatmeal cake was baked and pieces offered to the powers that protect or harm the flocks. How widely and how long this was kept is uncertain. The recipe is a plain modern oatcake.',
    notes: '',
  },
  {
    id: 'lammas-loaf',
    title: 'Lammas loaf',
    origin: 'adapted',
    intent: 'money',
    festivals: ['wheel-lammas', 'christian-lammas', 'celtic-lughnasadh'],
    seasonal: ['wheat-sheaf', 'corn-dolly'],
    offering: 'bread',
    serves: 'One loaf',
    time: '3 hours, mostly rising',
    ingredients: [
      i('500 g strong white or wholemeal bread flour', { pantry: 'flour' }),
      i('7 g fast-action yeast'),
      i('10 g salt', { pantry: 'salt' }),
      i('1 tbsp honey', { pantry: 'honey' }),
      i('2 tbsp olive oil or melted butter', { pantry: 'olive_oil' }),
      i('About 320 ml warm water'),
    ],
    method: [
      'Mix the flour, yeast and salt, then add the honey, oil and enough water to make a soft dough. Knead for 10 minutes until smooth.',
      'Cover and leave somewhere warm until doubled, about an hour.',
      'Knock it back and shape it: a round, a plait, or a sheaf of wheat with a little of the dough rolled into ears and stalks.',
      'Leave to rise again for 30 to 45 minutes, then bake at 220 °C (200 °C fan) for 30 to 35 minutes, until it sounds hollow underneath.',
      'Give the first slice back to the land or the altar, with thanks for the harvest and for the work that brought it in.',
    ],
    words: 'First of the grain, first of the bread: thanks to the field, and plenty ahead.',
    allergens: ['gluten', 'honey'],
    safety: '',
    about:
      'Lammas comes from the Old English hlafmæsse, “loaf mass”: in early medieval England bread from the first-ripe grain was brought to church to be blessed on 1 August. The shaped sheaf loaf is a much later baker’s tradition, and this is a modern recipe.',
    notes: '',
  },
  {
    id: 'wassail',
    title: 'Wassail bowl',
    origin: 'adapted',
    intent: 'peace',
    festivals: ['wheel-yule', 'christian-epiphany', 'christian-christmas'],
    seasonal: ['apples', 'yule-log'],
    offering: 'fruit',
    serves: '6 to 8 cups',
    time: '1 hour',
    ingredients: [
      i('4 small apples', { pantry: 'apple' }),
      i('1 litre cloudy apple juice, or dry cider, or ale', { pantry: 'apple' }),
      i('1 orange, sliced', { pantry: 'orange' }),
      i('1 cinnamon stick', { herb: 'cinnamon' }),
      i('6 cloves', { herb: 'clove' }),
      i('A thumb of ginger, sliced', { herb: 'ginger' }),
      i('2 tbsp brown sugar or honey, to taste', { pantry: 'brown_sugar' }),
    ],
    method: [
      'Roast the apples whole at 180 °C for 30 to 40 minutes, until soft and splitting.',
      'Warm the juice, cider or ale gently with the orange, spices and sugar. Don’t let it boil.',
      'Float the roasted apples in the bowl and pour the warm wassail over them.',
      'Raise a cup to the household and to one another. If you have an apple tree, take the last of the bowl out to it and pour a little at its roots.',
    ],
    words: 'Waes hael: be well. Here’s to the tree, and here’s to the house, and here’s to the year to come.',
    allergens: ['alcohol', 'honey'],
    safety: 'Made with cider or ale it is alcoholic; the apple juice way is for everyone.',
    about:
      'Wassail is from the Old English and Norse greeting “wæs hæl”, be well. Spiced ale with roasted apples (“lambswool”) was drunk at Christmas and Twelfth Night in England, and apple orchards were wassailed with song and cider in the West Country, a custom still kept and revived in many places. Recipes always varied; this one is modern.',
    notes: '',
  },
  {
    id: 'milk-and-honey',
    title: 'Milk and honey for the house spirits',
    origin: 'traditional',
    intent: 'peace',
    festivals: ['wheel-imbolc', 'christian-st_brigid', 'celtic-la_fheile_bride'],
    seasonal: ['brigids-cross'],
    offering: 'milk',
    serves: 'One small dish',
    time: '5 minutes',
    ingredients: [i('A small dish of fresh milk, or a plant milk', { pantry: 'milk' }), i('A spoonful of honey', { pantry: 'honey' })],
    method: [
      'Warm the milk gently if the night is cold, and stir in the honey.',
      'Set it by the hearth, the stove or the doorstep at nightfall.',
      'In the morning, pour what is left onto the earth outside, never down the sink, and wash the dish.',
    ],
    words: 'For the ones who keep this house: thank you. Be easy here, and welcome.',
    allergens: ['dairy', 'honey'],
    safety: 'Don’t leave it where pets can drink it; milk upsets many cats and dogs.',
    about:
      'Leaving milk, cream or porridge for the household spirits (the brownie, the gruagach, the fair folk) is recorded across Scottish, Irish and English folklore. At Imbolc, butter, milk and bread were set out for Brigid in Irish homes on the eve of her feast. This is the custom itself, not a recipe made up for it.',
    notes: '',
  },
  {
    id: 'nettle-soup',
    title: 'Spring nettle soup',
    origin: 'traditional',
    intent: 'cleansing',
    festivals: ['wheel-ostara'],
    seasonal: ['ostara-eggs'],
    offering: 'meal',
    serves: '4',
    time: '40 minutes',
    ingredients: [
      i('A carrier bag of young nettle tops (about 150 g), gathered with gloves', { herb: 'nettle' }),
      i('1 onion, chopped', { pantry: 'onion' }),
      i('1 clove garlic', { herb: 'garlic' }),
      i('1 large potato, diced', { pantry: 'potato' }),
      i('A knob of butter or a splash of olive oil', { pantry: 'butter' }),
      i('1 litre vegetable stock'),
      i('Salt and black pepper', { pantry: 'salt' }),
    ],
    method: [
      'Wearing gloves, pick over the nettles, keeping only the leaves and soft tips, and wash them well.',
      'Soften the onion and garlic in the butter, then add the potato and stock and simmer until the potato is tender.',
      'Add the nettles and simmer for 3 or 4 minutes: they lose their sting as they cook.',
      'Blend, season, and serve with a swirl of cream or yoghurt if you like.',
      'Eat it as a clearing-out of winter: the first green of the year.',
    ],
    words: 'Green of the spring, sting of the year: out with the old, and in with the clear.',
    allergens: ['dairy'],
    safety: 'Gather only young nettles you are certain of, from clean ground. See the nettle in Foraging for its look-alikes.',
    about:
      'Nettle soup and nettle pottage are old country foods across Britain, Ireland and northern Europe, eaten as the first fresh green of spring after the winter stores. The magical reading of it as a spring cleansing is modern.',
    notes: '',
  },
  {
    id: 'elderflower-cordial',
    title: 'Elderflower cordial',
    origin: 'traditional',
    intent: 'love',
    festivals: ['wheel-litha', 'christian-st_john'],
    seasonal: ['sun-wheel'],
    offering: null,
    serves: 'About 1.5 litres',
    time: '30 minutes, then a day to steep',
    ingredients: [
      i('20 elderflower heads, picked on a dry morning', { herb: 'elder' }),
      i('1.5 litres water', { pantry: 'water' }),
      i('1 kg sugar', { pantry: 'sugar' }),
      i('2 unwaxed lemons, sliced', { pantry: 'lemon' }),
      i('50 g citric acid (optional; it helps it keep)'),
    ],
    method: [
      'Shake the flower heads to free any insects, and snip off as much green stalk as you can.',
      'Bring the water to the boil, take it off the heat and stir in the sugar until it dissolves.',
      'Add the lemons, citric acid and flowers, cover with a cloth, and leave for 24 hours.',
      'Strain through a clean cloth into sterilised bottles. Keep in the fridge and use within a few weeks, or freeze some.',
      'Dilute to drink, and share the first glass at midsummer.',
    ],
    words: 'Flower of the elder, given with leave: sweetness for summer, and thanks to the tree.',
    allergens: [],
    safety: 'Use only the flowers: elder leaves, stems and bark are poisonous. Be certain of the plant; see elder in Foraging for its deadly look-alikes. Ask the elder before you take, as the old lore says.',
    about:
      'Elderflower cordial and “champagne” are long-kept country drinks in Britain and much of Europe. Asking the elder’s leave before cutting it is recorded English and Scandinavian folklore. Pairing it with love is a modern reading after elder’s link to Venus in the correspondence lists.',
    notes: '',
  },
  {
    id: 'rosehip-syrup',
    title: 'Rosehip syrup',
    origin: 'traditional',
    intent: 'healing',
    festivals: [],
    seasonal: [],
    offering: null,
    serves: 'About 1 litre',
    time: '1½ hours',
    ingredients: [
      i('1 kg ripe rose hips', { herb: 'rosehip' }),
      i('2.5 litres water, in two parts', { pantry: 'water' }),
      i('500 g sugar', { pantry: 'sugar' }),
    ],
    method: [
      'Top and tail the hips and mince or chop them roughly.',
      'Drop them into 1.7 litres of boiling water, bring back to the boil, then take off the heat and leave for 15 minutes.',
      'Strain through a jelly bag or doubled muslin, and keep the liquid.',
      'Return the pulp to 850 ml of boiling water, leave for 10 minutes and strain again.',
      'Strain the two liquids together once more through clean muslin, to catch every hair.',
      'Boil down to about a litre, stir in the sugar until dissolved, boil for 5 minutes, and bottle while hot in sterilised bottles.',
    ],
    words: 'Red of the hedge in the turn of the year: keep us well till the spring is here.',
    allergens: [],
    safety: 'Strain very carefully: the hairs around the seeds irritate the mouth and gut. Keep in the fridge once opened.',
    about:
      'Wartime Britain gathered rose hips by the ton for syrup in the 1940s, and the Ministry of Food’s recipe, which this follows, was widely printed. We make no claim for it beyond being a good syrup; the wish for wellbeing in the words is a blessing, not medicine.',
    notes: '',
  },
  {
    id: 'bramble-crumble',
    title: 'Bramble and apple crumble',
    origin: 'modern',
    intent: 'money',
    festivals: ['wheel-mabon', 'christian-michaelmas'],
    seasonal: ['apples', 'gourds'],
    offering: 'harvest',
    serves: '4 to 6',
    time: '1 hour',
    ingredients: [
      i('3 cooking apples, peeled and sliced', { pantry: 'apple' }),
      i('300 g blackberries'),
      i('2 tbsp sugar', { pantry: 'sugar' }),
      i('175 g plain flour', { pantry: 'flour' }),
      i('100 g cold butter', { pantry: 'butter' }),
      i('75 g brown sugar', { pantry: 'brown_sugar' }),
      i('50 g oats', { pantry: 'oats' }),
      i('½ tsp cinnamon', { herb: 'cinnamon' }),
    ],
    method: [
      'Put the apples and blackberries in a baking dish and sprinkle with the sugar.',
      'Rub the butter into the flour, then stir in the brown sugar, oats and cinnamon.',
      'Scatter the crumble over the fruit and bake at 190 °C (170 °C fan) for 35 to 40 minutes, until golden and bubbling.',
      'As you serve it, name three things the year has given you.',
    ],
    words: 'For what the year has given, thanks. May the store stay full and the table kind.',
    allergens: ['gluten', 'dairy'],
    safety: 'Pick blackberries above dog height and wash them well.',
    about:
      'The crumble is a twentieth-century British pudding, popular from the war years. Blackberries before Michaelmas is old folklore: after it, the saying goes, the devil has spoiled them.',
    notes: '',
  },
  {
    id: 'honey-cake',
    title: 'Honey cake for sweetness',
    origin: 'modern',
    intent: 'love',
    festivals: [],
    seasonal: [],
    offering: 'sweets',
    serves: 'One small cake',
    time: '1 hour',
    ingredients: [
      i('175 g honey', { pantry: 'honey' }),
      i('150 g butter', { pantry: 'butter' }),
      i('75 g brown sugar', { pantry: 'brown_sugar' }),
      i('2 eggs', { pantry: 'eggs' }),
      i('200 g self-raising flour', { pantry: 'flour' }),
      i('1 tsp cinnamon', { herb: 'cinnamon' }),
      i('A few dried rose petals, food-grade, to finish', { herb: 'rose' }),
    ],
    method: [
      'Melt the honey, butter and sugar together gently, then let it cool a little.',
      'Beat in the eggs, then fold in the flour and cinnamon.',
      'Pour into a lined 18 cm tin and bake at 170 °C (150 °C fan) for 40 to 45 minutes.',
      'Warm a spoonful of honey and brush it over the top while the cake is warm, stirring it clockwise as you think of what you want sweetened.',
      'Scatter the rose petals over it, and share it with the person or the bond you are sweetening.',
    ],
    words: 'Sweet as honey, kind as bread: let what’s between us be gently fed.',
    allergens: ['gluten', 'dairy', 'egg', 'honey'],
    safety: 'Use only petals sold as food-grade or grown without sprays.',
    about:
      'Honey cakes are among the oldest offerings recorded, from Greek melitoutta to Jewish lekach. This recipe and its use for “sweetening” a relationship are modern kitchen witchery, not an old rite.',
    notes: '',
  },
  {
    id: 'rosemary-salt-bread',
    title: 'Rosemary and salt threshold bread',
    origin: 'modern',
    intent: 'protection',
    festivals: [],
    seasonal: [],
    offering: 'bread',
    serves: 'One flat loaf',
    time: '2½ hours, mostly rising',
    ingredients: [
      i('500 g strong white bread flour', { pantry: 'flour' }),
      i('7 g fast-action yeast'),
      i('10 g fine salt, and flaky sea salt to finish', { pantry: 'sea_salt' }),
      i('4 tbsp olive oil, and more for the tin', { pantry: 'olive_oil' }),
      i('About 350 ml warm water'),
      i('3 sprigs of rosemary', { herb: 'rosemary' }),
    ],
    method: [
      'Mix the flour, yeast, fine salt, 2 tbsp oil and the water into a soft, sticky dough, and knead or stretch it for 10 minutes.',
      'Leave it covered until doubled, about an hour, then tip it into an oiled tin and press it out to the corners.',
      'Leave 30 minutes more, then press deep dimples all over it with your fingers.',
      'Push in the rosemary leaves, drizzle with the rest of the oil and scatter the sea salt, naming each room of the house as you do.',
      'Bake at 220 °C (200 °C fan) for 20 to 25 minutes. Break the first piece at the front door.',
    ],
    words: 'Salt at the door and rosemary on the sill: nothing unkind comes in here, nor will.',
    allergens: ['gluten'],
    safety: '',
    about:
      'Salt and rosemary are both old protective herbs in European folk practice; this focaccia-style bread and its threshold use are a modern kitchen witch’s working.',
    notes: '',
  },
];

export const starterRecipe = (id: string | null | undefined) => STARTER_RECIPES.find((r) => r.id === id) ?? null;

// ── Your own ────────────────────────────────────────────────────────────────

export const blankRecipe = (): Recipe => ({
  title: '',
  origin: 'mine',
  intent: null,
  festivals: [],
  seasonal: [],
  offering: null,
  serves: '',
  time: '',
  ingredients: [],
  method: [],
  words: '',
  allergens: [],
  safety: '',
  about: '',
  notes: '',
});

export function normalizeRecipe(raw: unknown): Recipe {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Recipe>;
  const ingredients = Array.isArray(r.ingredients)
    ? (r.ingredients as unknown[])
        .map((x) => (typeof x === 'string' ? { text: x } : (x as Ingredient)))
        .filter((x) => x && typeof x.text === 'string' && x.text.trim())
        .map((x) => ({ text: x.text.trim(), herb: typeof x.herb === 'string' && x.herb ? x.herb : null, pantry: typeof x.pantry === 'string' && x.pantry ? x.pantry : null }))
    : [];
  return {
    title: str(r.title).trim() || 'A recipe',
    origin: r.origin && r.origin in ORIGIN_LABELS ? r.origin : 'mine',
    intent: timingIntent(str(r.intent)) ? str(r.intent) : null,
    festivals: strs(r.festivals),
    seasonal: strs(r.seasonal).filter((id) => id in SEASONAL_NAMES),
    offering: str(r.offering) in OFFERING_NAMES ? str(r.offering) : null,
    serves: str(r.serves),
    time: str(r.time),
    ingredients,
    method: strs(r.method).map((s) => s.trim()),
    words: str(r.words),
    allergens: strs(r.allergens).filter((a): a is Allergen => ALLERGENS.some((x) => x.id === a)),
    safety: str(r.safety),
    about: str(r.about),
    notes: str(r.notes),
  };
}

/** Lines of text (one ingredient or step a line) into a list, dropping blank lines and list marks. */
export const linesOf = (text: string) =>
  String(text ?? '')
    .split(/\n+/)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

const fold = (text: string) => text.toLowerCase().replace(/[^a-z ]/g, ' ');

/**
 * An ingredient typed as a line, linked to the Library herb or pantry item
 * whose name it contains ("2 sprigs of rosemary" → rosemary), when one does.
 */
export function linkIngredient(text: string): Ingredient {
  const words = ` ${fold(text).replace(/\s+/g, ' ')} `;
  const has = (name: string) => {
    const n = fold(name).replace(/\s+/g, ' ').trim();
    return n.length > 2 && (words.includes(` ${n} `) || words.includes(` ${n}s `));
  };
  // The longest name wins: "sea salt" before "salt", "rosemary" before "rose".
  const longest = <T>(list: T[], names: (x: T) => string[]) =>
    list
      .map((x) => ({ x, len: Math.max(0, ...names(x).filter(has).map((n) => n.length)) }))
      .filter((m) => m.len > 0)
      .sort((a, b) => b.len - a.len)[0]?.x ?? null;
  const pantry = longest(PANTRY, (p) => [p.name, ...(p.aliases ?? [])]);
  const herb = longest(HERB_OPTIONS, (h) => [h.name, h.key.replace(/_/g, ' ')]);
  const pantryLen = pantry ? Math.max(...[pantry.name, ...(pantry.aliases ?? [])].filter(has).map((n) => n.length)) : 0;
  const herbLen = herb ? Math.max(...[herb.name, herb.key.replace(/_/g, ' ')].filter(has).map((n) => n.length)) : 0;
  if (pantry && pantryLen >= herbLen) return { text: text.trim(), herb: pantry.library || null, pantry: pantry.library ? null : pantry.key };
  return { text: text.trim(), herb: herb?.key ?? null, pantry: null };
}

// ── Correspondences ─────────────────────────────────────────────────────────

type HerbData = { DisplayName?: string; Element?: string; Planet?: string; Uses?: string; TraditionalWarnings?: string };
const HERBS = (TRADITIONAL_LIBRARY as unknown as Record<string, Record<string, HerbData>>).herb ?? {};

export type IngredientLink = { text: string; kind: 'herb' | 'pantry'; key: string; name: string; element: string; planet: string; uses: string; warning: string };

/** What an ingredient corresponds to: its Library herb or its pantry item. */
export function ingredientLink(ing: Ingredient): IngredientLink | null {
  if (ing.herb && HERBS[ing.herb]) {
    const h = HERBS[ing.herb];
    return { text: ing.text, kind: 'herb', key: ing.herb, name: h.DisplayName ?? herbName(ing.herb) ?? ing.herb, element: h.Element ?? '', planet: h.Planet ?? '', uses: h.Uses ?? '', warning: h.TraditionalWarnings ?? '' };
  }
  const p = pantryItem(ing.pantry);
  if (p) return { text: ing.text, kind: 'pantry', key: p.key, name: p.name, element: p.element, planet: p.planet, uses: p.uses.join(', '), warning: '' };
  return null;
}

/** The elements a recipe leans to, from its linked ingredients, most first. */
export function recipeElements(recipe: Recipe): { element: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const ing of recipe.ingredients) {
    const el = ingredientLink(ing)?.element?.split(/[,/ ]+/)[0];
    if (el) counts.set(el, (counts.get(el) ?? 0) + 1);
  }
  return [...counts.entries()].map(([element, count]) => ({ element, count })).sort((a, b) => b.count - a.count || a.element.localeCompare(b.element));
}

/** The Library herbs a recipe uses. */
export const recipeHerbs = (recipe: Recipe) => [...new Set(recipe.ingredients.map((x) => x.herb).filter((x): x is string => !!x && !!HERBS[x]))];

export const intentLabel = (key: string | null | undefined) => timingIntent(key)?.label ?? null;
export const INTENT_CHOICES = TIMING_INTENTS.map((t) => ({ key: t.key, label: t.label }));

// ── Finding recipes ─────────────────────────────────────────────────────────

export type AnyRecipe = { id: string; recipe: Recipe; starter: boolean };

/** Your recipes and the starters, as one list: yours first. */
export function allRecipes(mine: { id: string; data: unknown }[]): AnyRecipe[] {
  return [...mine.map((e) => ({ id: e.id, recipe: normalizeRecipe(e.data), starter: false })), ...STARTER_RECIPES.map((r) => ({ id: r.id, recipe: r as Recipe, starter: true }))];
}

export type RecipeFilter = { intent?: string | null; festival?: string | null; herb?: string | null; query?: string };

export function filterRecipes(list: AnyRecipe[], f: RecipeFilter): AnyRecipe[] {
  const words = (f.query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter(({ recipe: r }) => {
    if (f.intent && r.intent !== f.intent) return false;
    if (f.festival && !r.festivals.includes(f.festival)) return false;
    if (f.herb && !recipeHerbs(r).includes(f.herb)) return false;
    if (!words.length) return true;
    const hay = [r.title, r.about, r.notes, intentLabel(r.intent) ?? '', ...r.festivals.map(festivalName), ...r.ingredients.map((x) => x.text)].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** Recipes for a holy-day page. */
export const recipesForHoly = (ref: string, list: AnyRecipe[] = allRecipes([])) => list.filter((r) => r.recipe.festivals.includes(ref));

/** Recipes using a Library herb. */
export const recipesForHerb = (herb: string, list: AnyRecipe[] = allRecipes([])) => list.filter((r) => recipeHerbs(r.recipe).includes(herb));

export type FestivalFood = { name: string; ref: string; date: Date; inDays: number; recipes: AnyRecipe[] };

/** The festivals of your calendars in the next `days` that have recipes, soonest first. */
export function festivalFoodsAhead(now: Date, choice: HolidayChoice, days = 21, list: AnyRecipe[] = allRecipes([])): FestivalFood[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const out: FestivalFood[] = [];
  for (const h of holidaysBetween(start, new Date(start.getTime() + days * DAY), choice)) {
    const ref = holyRef(h.id);
    const recipes = recipesForHoly(ref, list);
    if (!recipes.length || out.some((o) => o.ref === ref)) continue;
    const inDays = Math.max(0, Math.round((h.date.getTime() - start.getTime()) / DAY));
    out.push({ name: h.name, ref, date: h.date, inDays, recipes });
  }
  return out;
}

// ── In the Grimoire ─────────────────────────────────────────────────────────

/** The Grimoire page ref a recipe is kept under (the saveHolyPage tag), so it's found again. */
export const recipeRef = (id: string) => `kitchen-recipe:${id}`;

const html = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A recipe as Grimoire blocks (the website's block shapes: text as HTML, lists one per line). */
export function recipeBlocks(recipe: Recipe): { type: string; content: string }[] {
  const facts = [
    ORIGIN_LABELS[recipe.origin],
    intentLabel(recipe.intent) ? `For ${intentLabel(recipe.intent)!.toLowerCase()}` : '',
    recipe.festivals.length ? `For ${recipe.festivals.map(festivalName).join(', ')}` : '',
    recipe.serves,
    recipe.time,
  ].filter(Boolean);
  const blocks: { type: string; content: string }[] = [{ type: 'callout', content: html(facts.join(' · ')) }];
  if (recipe.ingredients.length) blocks.push({ type: 'heading', content: 'Ingredients' }, { type: 'bulleted_list', content: recipe.ingredients.map((x) => x.text).join('\n') });
  if (recipe.method.length) blocks.push({ type: 'heading', content: 'Method' }, { type: 'numbered_list', content: recipe.method.join('\n') });
  if (recipe.words.trim()) blocks.push({ type: 'heading', content: 'Words' }, { type: 'quote', content: html(recipe.words.trim()) });
  const corr = recipe.ingredients
    .map(ingredientLink)
    .filter((x): x is IngredientLink => !!x)
    .map((x) => `${x.name}: ${[x.element, x.planet, x.uses].filter(Boolean).join(' · ')}`);
  if (corr.length) blocks.push({ type: 'heading', content: 'Correspondences' }, { type: 'correspondence', content: [...new Set(corr)].join('\n') });
  const safety = [...recipe.allergens.map((a) => `${allergenLabel(a)}: ${ALLERGENS.find((x) => x.id === a)!.note}`), recipe.safety.trim()].filter(Boolean);
  if (safety.length) blocks.push({ type: 'heading', content: 'Allergies and safety' }, { type: 'bulleted_list', content: safety.join('\n') });
  if (recipe.about.trim()) blocks.push({ type: 'heading', content: 'Where it comes from' }, { type: 'text', content: html(recipe.about.trim()) });
  blocks.push({ type: 'heading', content: 'My notes' }, { type: 'text', content: html(recipe.notes.trim()) });
  return blocks;
}

/** A Grimoire page already holding this recipe, by its tag. */
export function findRecipePage<P extends { id: string; metadata: Record<string, unknown> | null }>(pages: P[], id: string): P | null {
  return pages.find((p) => (p.metadata as { holyRef?: string } | null)?.holyRef === recipeRef(id)) ?? null;
}
