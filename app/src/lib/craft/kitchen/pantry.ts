// Pantry correspondences: the everyday cupboard as the kitchen witch reads it.
// Element and planet follow the common modern correspondence lists (Cunningham
// and the herbals before him); where lists disagree it says so in `also`.
// Things the Living Library already covers (cinnamon, cloves, garlic and the
// other spices it holds) are kept short here and point at the Library entry
// for their meaning, so the two never drift apart. Pure, so it can be tested.

import { TRADITIONAL_LIBRARY } from '../../library/traditionalData.ts';
import type { PremadeIntention } from '../../rituals/premade/types.ts';

export type PantryGroup = 'salt' | 'sweet' | 'oils' | 'grains' | 'produce' | 'spices' | 'drinks';

export const PANTRY_GROUPS: { key: PantryGroup; label: string }[] = [
  { key: 'salt', label: 'Salt & vinegar' },
  { key: 'sweet', label: 'Sweeteners' },
  { key: 'oils', label: 'Oils, dairy & eggs' },
  { key: 'grains', label: 'Grains & pulses' },
  { key: 'produce', label: 'Fruit & vegetables' },
  { key: 'spices', label: 'Spices' },
  { key: 'drinks', label: 'Drinks & water' },
];

export type PantryItem = {
  key: string;
  name: string;
  group: PantryGroup;
  /** Other names people search by. */
  aliases?: string[];
  /** Filled from the Library for linked entries. */
  element: string;
  planet: string;
  /** Where the correspondence lists disagree, or the assignment is modern. */
  also?: string;
  /** Short magical uses, for the list and the search. */
  uses: string[];
  intentions: PremadeIntention[];
  /** The folklore and meaning, in a few sentences. Empty for Library entries. */
  about: string;
  /** One way to work it into cooking or housekeeping. */
  kitchen: string;
  safety: string;
  /** A Living Library herb key; its entry holds the full meaning. */
  library?: string;
};

type Raw = Omit<PantryItem, 'element' | 'planet' | 'uses'> & { element?: string; planet?: string; uses?: string[] };

const RAW: Raw[] = [
  // Salt & vinegar
  {
    key: 'salt',
    name: 'Salt',
    group: 'salt',
    aliases: ['table salt', 'kosher salt', 'rock salt'],
    element: 'Earth',
    planet: 'Saturn',
    also: 'Some lists give salt to the Earth itself rather than a planet.',
    uses: ['protection', 'purification', 'grounding', 'hospitality'],
    intentions: ['protection', 'cleansing', 'banishing'],
    about:
      'The great preserver: what keeps food from spoiling was trusted to keep harm out too. Salt is laid along thresholds and sills, thrown over the left shoulder after a spill, and given with bread to bless a new home. Sharing salt with someone was once a bond of friendship you did not break lightly.',
    kitchen: 'Keep a small dish of salt by the stove and add the first pinch to any meal with a silent word for the household’s safekeeping.',
    safety:
      'Salt kills plants and spoils soil, so don’t scatter it on the garden, lawn or houseplants. Large amounts are poisonous to dogs and cats, including salt-dough ornaments, so keep lines and bowls of salt out of their reach.',
  },
  {
    key: 'sea_salt',
    name: 'Sea salt',
    group: 'salt',
    aliases: ['flaky salt', 'grey salt', 'bath salt'],
    element: 'Water',
    planet: 'Moon',
    also: 'Many count it as Earth like any salt; the sea adds Water and the Moon’s tides.',
    uses: ['cleansing', 'healing', 'release', 'the sea'],
    intentions: ['cleansing', 'healing', 'peace'],
    about:
      'Salt made by the sun from seawater carries the tide in it. A spoonful in a bath or a bowl of water stands in for the sea when you can’t get to the shore, and sea-washing has long been thought to take away what clings: illness, grief, the evil eye.',
    kitchen: 'Dissolve a spoonful in a warm bath with a handful of rosemary for a ritual wash at the end of a hard week.',
    safety:
      'As for any salt: not on soil or plants, and out of pets’ reach. Salt water corrodes metal and can damage soft or porous stones, so keep it away from tools, jewellery and crystals you don’t want spoiled.',
  },
  {
    key: 'vinegar',
    name: 'Vinegar',
    group: 'salt',
    aliases: ['white vinegar', 'malt vinegar', 'distilled vinegar'],
    element: 'Fire',
    planet: 'Mars',
    also: 'Some lists give vinegar to Water and the Moon for its use in washes.',
    uses: ['banishing', 'cleansing', 'breaking', 'souring'],
    intentions: ['banishing', 'cleansing', 'protection'],
    about:
      'Wine turned sharp, vinegar is the sour to sugar’s sweet: it cuts, clears and sends away. It is the base of old protective washes and of witch bottles, and in folk magic a name put into vinegar is a quarrel or a hold soured until it lets go.',
    kitchen: 'Add a splash to the floor-wash bucket on the waning moon, mopping from the back of the house towards the door.',
    safety:
      'Never mix vinegar with bleach: together they release chlorine gas. Vinegar etches marble, limestone and other natural stone, and can dull some grout and wood finishes, so test it first.',
  },
  {
    key: 'apple_cider_vinegar',
    name: 'Apple cider vinegar',
    group: 'salt',
    aliases: ['cider vinegar', 'acv'],
    element: 'Water',
    planet: 'Venus',
    also: 'Read through the apple; as a vinegar it shares plain vinegar’s Fire and Mars.',
    uses: ['cleansing', 'healing', 'herbal vinegars', 'gentle banishing'],
    intentions: ['cleansing', 'healing', 'banishing'],
    about:
      'Vinegar with the apple still in it: sharp enough to clear, kind enough to heal. It is the usual base for herbal vinegars steeped through the turn of a moon, and old country remedies leaned on it for everything from sore throats to tired feet.',
    kitchen: 'Steep a jar of it with garlic, rosemary and thyme for one moon, strain, and use it in dressings as a protective kitchen vinegar.',
    safety:
      'It is acidic: dilute it before it goes on skin or hair, and rinse your mouth after drinking it to spare your teeth. Never mix with bleach.',
  },
  // Sweeteners
  {
    key: 'sugar',
    name: 'Sugar',
    group: 'sweet',
    aliases: ['white sugar', 'caster sugar', 'granulated sugar'],
    element: 'Water',
    planet: 'Venus',
    uses: ['sweetening', 'love', 'attraction', 'kindness'],
    intentions: ['love', 'peace'],
    about:
      'Sugar sweetens people as well as tea. Sweetening jars of sugar or honey are kept to make someone kinder towards you or a home gentler, and a spoonful stirred clockwise into a drink is a small spell for a warm conversation.',
    kitchen: 'Stir your tea or coffee clockwise three times while you think of someone you’d like things to be easier with.',
    safety:
      'Spilled sugar draws ants. Anyone diabetic should swap in an unsweetened symbol, such as a sprig of rosemary, for anything they’d eat. If you swap in a sugar-free sweetener, keep xylitol (birch sugar) well away from dogs: even a little can be deadly to them.',
  },
  {
    key: 'brown_sugar',
    name: 'Brown sugar',
    group: 'sweet',
    aliases: ['demerara', 'muscovado', 'light brown sugar', 'dark brown sugar'],
    element: 'Water',
    planet: 'Venus',
    also: 'Some give it Earth as well, for its weight and its use in money work.',
    uses: ['sweetening', 'love', 'money', 'comfort'],
    intentions: ['love', 'prosperity'],
    about:
      'Darker and heavier than white sugar, brown sugar is used where sweetness should also stay and settle: in money and luck jars, and in sweetening work where you want comfort that lasts rather than a sugar rush.',
    kitchen: 'Sprinkle a little on the morning porridge with cinnamon to sweeten the day and draw a little luck in.',
    safety: 'As for sugar. It clumps and attracts ants in jars, so seal them well.',
  },
  {
    key: 'honey',
    name: 'Honey',
    group: 'sweet',
    aliases: ['raw honey', 'mead'],
    element: 'Water',
    planet: 'Venus',
    also: 'Many give honey to the Sun, and some to Air; lists differ more than for most foods.',
    uses: ['sweetening', 'love', 'offerings', 'healing', 'preservation'],
    intentions: ['love', 'healing', 'prosperity', 'peace'],
    about:
      'The oldest sweetener and one of the oldest offerings: honey has been poured for gods, spirits and the dead across Europe, the Mediterranean and far beyond. It keeps almost forever, heals small wounds, and in honey jars it holds a wish in sweetness while it works. Telling the bees about births, marriages and deaths is an old British and Irish custom.',
    kitchen: 'Taste a drop before a difficult talk so your words come out sweet, or bake it into a cake for someone who needs mending.',
    safety:
      'Never give honey to a baby under 12 months: it can carry the spores that cause infant botulism. People with pollen allergies occasionally react to raw honey.',
  },
  {
    key: 'maple_syrup',
    name: 'Maple syrup',
    group: 'sweet',
    aliases: ['maple'],
    element: 'Air',
    planet: 'Jupiter',
    also: 'Given through the maple tree, which the lists place under Jupiter.',
    uses: ['sweetening', 'abundance', 'longevity', 'love'],
    intentions: ['prosperity', 'love'],
    about:
      'Sap boiled down at the very end of winter, maple syrup is sweetness that took patience: around forty measures of sap make one of syrup. That makes it a fitting sweetener for slow, lasting abundance. The sugaring season is a real seasonal marker in the north-east of North America, an Indigenous practice long before it was anyone else’s.',
    kitchen: 'Pour it on the first pancakes of a new month or season and say what you want to grow sweetly over the coming weeks.',
    safety: 'Use pure maple syrup; “pancake syrup” is mostly corn syrup with flavouring. Hot syrup burns badly, so take care if you boil it.',
  },
  {
    key: 'molasses',
    name: 'Molasses',
    group: 'sweet',
    aliases: ['black treacle', 'treacle', 'blackstrap'],
    element: 'Earth',
    planet: 'Saturn',
    also: 'A modern assignment; some put it under Jupiter for its use in money work.',
    uses: ['sticking', 'slow sweetening', 'money', 'endurance'],
    intentions: ['prosperity', 'protection'],
    about:
      'The dark, slow syrup left when sugar is made. In folk magic it is the thing that makes a working stick, for luck that stays and good that won’t slide away, and its bitterness alongside the sweet makes it honest about hard times.',
    kitchen: 'Bake it into gingerbread or parkin on a cold night for endurance through the dark half of the year.',
    safety: 'Very sticky and draws ants; seal jars well. Like any syrup it burns badly when hot.',
  },
  // Oils, dairy & eggs
  {
    key: 'olive_oil',
    name: 'Olive oil',
    group: 'oils',
    aliases: ['oil', 'extra virgin olive oil'],
    element: 'Fire',
    planet: 'Sun',
    uses: ['anointing', 'blessing', 'peace', 'healing', 'lamps'],
    intentions: ['healing', 'peace', 'protection'],
    about:
      'The oil of the Mediterranean, used for food, for lamps and for anointing priests, kings, the sick and the dead. The olive branch is the old sign of peace. It is the usual carrier oil for dressing candles, and a drop on the forehead is one of the simplest blessings there is.',
    kitchen: 'Warm a little with a sprig of rosemary to make a small anointing oil, or bless the bottle before you cook with it.',
    safety:
      'Never put water on burning oil: turn off the heat and cover the pan. Herb-infused oils kept at room temperature can grow botulism, so make them small, keep them in the fridge and use them within four days, or freeze them. Patch-test before anointing skin.',
  },
  {
    key: 'butter',
    name: 'Butter',
    group: 'oils',
    aliases: ['ghee', 'clarified butter'],
    element: 'Earth',
    planet: 'Moon',
    also: 'Venus in some lists; ghee is given to fire and to the gods in Hindu worship.',
    uses: ['comfort', 'abundance', 'smoothing', 'offerings'],
    intentions: ['prosperity', 'peace', 'love'],
    about:
      'Butter was long the measure of a farmhouse’s luck, and the folklore shows it: in Britain and Ireland a churn that wouldn’t turn was blamed on ill-wishing, and charms were said to bring the butter. It smooths things, comforts and enriches, and was left as an offering in some places at May Day.',
    kitchen: 'Soften butter with honey and a pinch of cinnamon to spread on the bread you share for a peaceful, plentiful table.',
    safety: 'A dairy allergen. Offerings of butter go rancid and draw animals: bring them in within a day.',
  },
  {
    key: 'milk',
    name: 'Milk',
    group: 'oils',
    aliases: ['cream', 'dairy'],
    element: 'Water',
    planet: 'Moon',
    also: 'Some lists give milk to Venus.',
    uses: ['nurture', 'offerings', 'moon work', 'gentleness'],
    intentions: ['peace', 'healing', 'love'],
    about:
      'The first food, and a moon-white one. A bowl of milk or cream was left out for the household spirit, the brownie or the fairies in much of Britain and Ireland, and milk is poured for gods across many traditions. In a bath it softens and soothes.',
    kitchen: 'Warm a cup of milk with honey and cardamom on the full moon and drink it slowly as the last thing before sleep.',
    safety:
      'A dairy allergen, and lactose troubles many adults. Don’t leave cow’s milk out for hedgehogs or cats: most can’t digest it. Bring outdoor offerings in before they sour.',
  },
  {
    key: 'eggs',
    name: 'Eggs',
    group: 'oils',
    aliases: ['egg', 'eggshell', 'cascarilla'],
    element: 'Water',
    planet: 'Moon',
    also: 'Some give the whole egg to Spirit, as a world in small.',
    uses: ['new life', 'fertility', 'protection', 'cleansing'],
    intentions: ['beginnings', 'protection', 'cleansing'],
    about:
      'An egg is a beginning held whole. Painted eggs come with the spring festivals, eggshells are crushed for protection powders, and an unbroken egg rolled over the body to draw out ill is a living cleansing practice in Latin American curanderismo (the limpia), best learnt from someone in that tradition.',
    kitchen: 'Save shells from the week’s eggs, dry them in a low oven and grind them for a protective powder or for the garden’s soil.',
    safety: 'Raw egg can carry salmonella, so wash your hands and surfaces after handling it. Eggs are a common allergen, especially in children.',
  },
  // Grains & pulses
  {
    key: 'flour',
    name: 'Flour',
    group: 'grains',
    aliases: ['wheat', 'wheat flour', 'plain flour', 'bread flour'],
    element: 'Earth',
    planet: 'Venus',
    also: 'The lists follow wheat; some give grain to the Sun at harvest.',
    uses: ['abundance', 'nourishment', 'binding', 'harvest'],
    intentions: ['prosperity', 'beginnings'],
    about:
      'Wheat ground fine is the harvest made ready for the hearth. Flour binds a working the way it binds a dough, and a sigil traced in flour on the board before kneading is a quiet way to bake an intention into everything made that day.',
    kitchen: 'Trace a sign of what you want in the dusting of flour on your board before you knead, then work it into the dough.',
    safety:
      'Don’t eat raw flour or raw dough: flour can carry E. coli until it is cooked. A cloud of flour near a flame can flash, so keep it away from candles. Wheat holds gluten.',
  },
  {
    key: 'bread',
    name: 'Bread',
    group: 'grains',
    aliases: ['loaf', 'toast'],
    element: 'Earth',
    planet: 'Venus',
    also: 'From the wheat; at Lammas the first loaf is given to the Sun and the harvest.',
    uses: ['hospitality', 'abundance', 'harvest', 'blessing', 'offerings'],
    intentions: ['prosperity', 'protection', 'love', 'beginnings'],
    about:
      'Bread is what a home is measured by. Bread and salt welcome people to a new house across Eastern Europe and beyond, the first loaf from the new grain was blessed at Lammas (the “loaf-mass”), and a knife was never left stuck in a loaf. Breaking bread together makes a bond.',
    kitchen: 'Cut a cross or your own sign into the top of a loaf before it goes in the oven, and share the first slice.',
    safety:
      'Contains gluten (and often milk or eggs). Bread is poor food for ducks and birds: scatter only crumbs, or put out seed instead.',
  },
  {
    key: 'rice',
    name: 'Rice',
    group: 'grains',
    aliases: ['white rice', 'brown rice'],
    element: 'Air',
    planet: 'Sun',
    uses: ['fertility', 'abundance', 'protection', 'blessing'],
    intentions: ['prosperity', 'protection', 'love'],
    about:
      'The staple grain for much of the world, and a sign of plenty wherever it is grown. Rice is thrown over newlyweds for fruitfulness, kept in a jar so the house never goes hungry, and a few grains are used as a ground for divination and as a protective scatter on the roof.',
    kitchen: 'Keep a jar of uncooked rice with a coin or a bay leaf buried in it on the pantry shelf, and never let it run empty.',
    safety: 'Cooked rice left at room temperature can grow Bacillus cereus; cool it quickly and don’t keep it out overnight.',
  },
  {
    key: 'oats',
    name: 'Oats',
    group: 'grains',
    aliases: ['oatmeal', 'porridge', 'rolled oats'],
    element: 'Earth',
    planet: 'Venus',
    uses: ['comfort', 'money', 'steadiness', 'soothing'],
    intentions: ['prosperity', 'peace', 'healing'],
    about:
      'The grain of cold, wet places, oats fed Scotland, the North of England and Ireland through hard winters. Porridge is comfort and steadiness, oatcakes were baked for the old quarter days, and oats tied in muslin make a soothing bath for sore skin.',
    kitchen: 'Stir the morning porridge clockwise for something to grow and anticlockwise for something to ease.',
    safety: 'Pure oats are gluten-free but are often milled alongside wheat; buy certified gluten-free oats for anyone coeliac, and know that a few coeliacs react even to pure oats.',
  },
  {
    key: 'barley',
    name: 'Barley',
    group: 'grains',
    aliases: ['pearl barley', 'barley water'],
    element: 'Earth',
    planet: 'Venus',
    uses: ['healing', 'love', 'protection', 'harvest'],
    intentions: ['healing', 'love', 'protection'],
    about:
      'One of the first grains people grew, and the grain of beer and of the old harvest songs, John Barleycorn cut down and rising again. Barley water is a classic sickroom drink, and grains of barley are scattered for protection and laid in love charms.',
    kitchen: 'Add a handful of pearl barley to a broth for someone who is unwell, and stir in a wish for their mending.',
    safety: 'Barley contains gluten.',
  },
  {
    key: 'corn',
    name: 'Corn (maize)',
    group: 'grains',
    aliases: ['maize', 'cornmeal', 'polenta', 'popcorn', 'corn dolly'],
    element: 'Earth',
    planet: 'Venus',
    also: 'Some give corn to the Sun for its colour and harvest.',
    uses: ['abundance', 'protection', 'harvest', 'luck'],
    intentions: ['prosperity', 'protection'],
    about:
      'Maize is sacred food to many Indigenous peoples of the Americas, as one of the Three Sisters with beans and squash, and that is theirs to tell. In British usage “corn” meant any grain, and the corn dolly woven from the last sheaf kept the harvest spirit over winter. Cornmeal is scattered as a simple, biodegradable offering.',
    kitchen: 'Bake cornbread on Lammas or the autumn equinox and save a corner for the birds outside.',
    safety: 'Corn is an allergen for some. Dried husks and dollies are tinder, so keep them away from candles and stoves.',
  },
  {
    key: 'lentils',
    name: 'Lentils',
    group: 'grains',
    aliases: ['red lentils', 'green lentils', 'dal'],
    element: 'Earth',
    planet: 'Moon',
    also: 'A modern assignment; lists vary.',
    uses: ['money', 'luck', 'peace', 'nourishment'],
    intentions: ['prosperity', 'peace'],
    about:
      'Small, round and coin-like, lentils are eaten at New Year in Italy so the coming months bring money, and they are humble food that stretches far. A pot of lentils is a working for enough: steady, plain, and sufficient.',
    kitchen: 'Cook a lentil soup on the first evening of the year or the new moon and count a coin’s worth of thanks for each bowl.',
    safety: 'Dried lentils must be cooked; rinse them and pick out any small stones first.',
  },
  {
    key: 'beans',
    name: 'Beans',
    group: 'grains',
    aliases: ['bean', 'kidney beans', 'black-eyed peas', 'broad beans', 'fava'],
    element: 'Air',
    planet: 'Mercury',
    uses: ['protection', 'luck', 'money', 'spirits'],
    intentions: ['prosperity', 'protection', 'banishing'],
    about:
      'Beans carry a lot of folklore. Black-eyed peas are eaten for luck on New Year’s Day in the American South, Romans threw black beans over the shoulder at the Lemuria to pay off the restless dead, and a dried bean in a pocket or a jar is a simple charm for luck and against ill-wishing.',
    kitchen: 'Keep a jar of mixed dried beans on the shelf as a protection and plenty jar; cook from it and top it up so it never empties.',
    safety:
      'Raw or undercooked red kidney beans are poisonous: soak them, then boil hard for at least ten minutes. Fava beans can trigger a serious reaction in people with G6PD deficiency. Dried beans are a choking hazard for small children.',
  },
  // Fruit & vegetables
  {
    key: 'garlic',
    name: 'Garlic',
    group: 'produce',
    library: 'garlic',
    intentions: ['protection', 'healing', 'banishing'],
    about: '',
    kitchen: 'Hang a braid of garlic in the kitchen, and crush a clove into the pot on the waning moon to send off what lingers.',
    safety: 'Garlic and onion are toxic to dogs and cats, cooked or raw.',
  },
  {
    key: 'onion',
    name: 'Onion',
    group: 'produce',
    aliases: ['onions', 'shallot', 'leek'],
    element: 'Fire',
    planet: 'Mars',
    uses: ['protection', 'absorbing', 'healing', 'banishing'],
    intentions: ['protection', 'banishing', 'healing'],
    about:
      'Layer on layer like a ward. Halved onions were set in sickrooms to draw illness in old European folk medicine, braids of onions hung in kitchens to keep harm off, and in some countryside lore you peel an onion’s skins for the coming months to read the winter: thick skins, a hard one.',
    kitchen: 'Cut an onion in half and leave it on a saucer in a room that feels heavy for a day, then throw it away, never eat it.',
    safety: 'Toxic to dogs and cats. Don’t eat onion that has been used to absorb anything; bin it.',
  },
  {
    key: 'lemon',
    name: 'Lemon',
    group: 'produce',
    aliases: ['lemons', 'lemon peel', 'lime'],
    element: 'Water',
    planet: 'Moon',
    uses: ['cleansing', 'clarity', 'friendship', 'cutting through'],
    intentions: ['cleansing', 'study', 'banishing'],
    about:
      'Sharp, bright and clean. Lemon is the kitchen witch’s cleanser: lemon water to wash tools and surfaces, peel in a floor wash, a halved lemon on the windowsill to sour bad feeling. It is also used for clear thinking and for friendship that lasts.',
    kitchen: 'Wipe down the worktops with lemon and water at the end of a waning-moon clean, and leave the halves on a saucer to finish.',
    safety:
      'Lemon juice on skin in sunlight can cause blistering burns (phytophotodermatitis); wash it off before going out. Citrus oils are toxic to cats and dogs. Lemon etches marble.',
  },
  {
    key: 'orange',
    name: 'Orange',
    group: 'produce',
    aliases: ['oranges', 'orange peel', 'clementine', 'satsuma', 'mandarin'],
    element: 'Fire',
    planet: 'Sun',
    uses: ['joy', 'abundance', 'love', 'luck', 'warmth'],
    intentions: ['prosperity', 'love', 'courage'],
    about:
      'A small sun you can hold. Oranges were Christmas treasure in a stocking, pomanders of orange studded with cloves were hung in Tudor homes, and orange blossom has been worn by brides for centuries. Orange brings cheer, luck and a full, golden kind of plenty.',
    kitchen: 'Dry rounds of orange in a low oven for the Yule window, or save the peel for the simmer pot.',
    safety: 'Citrus oils in the peel are toxic to cats and dogs. The juice can sensitise skin to sunlight.',
  },
  {
    key: 'apple',
    name: 'Apple',
    group: 'produce',
    aliases: ['apples', 'apple peel', 'cider'],
    element: 'Water',
    planet: 'Venus',
    uses: ['love', 'healing', 'the dead', 'wisdom', 'divination'],
    intentions: ['love', 'healing', 'intuition'],
    about:
      'Cut an apple across and the seeds make a five-pointed star. Apples are love charms and fortune-tellers: a peel thrown over the shoulder was read for a sweetheart’s initial, and they were bobbed for at Halloween. Orchards are wassailed in midwinter to wake the trees, and apples are left for the dead at Samhain.',
    kitchen: 'Cut an apple across its middle to show the star, share one half with someone you love, and eat the other yourself.',
    safety: 'The seeds hold small amounts of cyanide compounds; a few swallowed whole are harmless, but don’t grind them. Core apples before giving them to pets.',
  },
  {
    key: 'ginger',
    name: 'Ginger',
    group: 'produce',
    library: 'ginger',
    intentions: ['courage', 'prosperity', 'healing'],
    about: '',
    kitchen: 'Add slices of fresh root to tea or a stir-fry when you need to get something moving fast.',
    safety: 'Generally gentle in food. Large medicinal amounts can interact with blood-thinning medicines.',
  },
  {
    key: 'tomato',
    name: 'Tomato',
    group: 'produce',
    aliases: ['tomatoes', 'love apple'],
    element: 'Water',
    planet: 'Venus',
    uses: ['love', 'protection', 'abundance'],
    intentions: ['love', 'protection', 'prosperity'],
    about:
      'Once called the love apple in Europe, the tomato was long eyed with suspicion as a relative of nightshade before it won every kitchen over. A ripe tomato on the windowsill or mantel is an old charm for a prosperous, protected home, replaced as it softens.',
    kitchen: 'Make a tomato sauce slowly on a Friday, stirring clockwise, for a meal shared with someone you love.',
    safety: 'Tomato leaves and stems are toxic, especially to pets. Some people with nightshade sensitivity react to tomatoes.',
  },
  {
    key: 'potato',
    name: 'Potato',
    group: 'produce',
    aliases: ['potatoes', 'spud'],
    element: 'Earth',
    planet: 'Moon',
    uses: ['grounding', 'healing', 'nourishment', 'image magic'],
    intentions: ['healing', 'peace', 'protection'],
    about:
      'A root that grows in the dark and feeds a family. Carrying a potato in your pocket against rheumatism was a widespread charm in Britain and Ireland, and potatoes are carved as poppets in folk magic. They are the plain food of the earth: grounding and steady.',
    kitchen: 'Make a pot of mash on a dark-moon evening when you need grounding, and eat it slowly.',
    safety: 'Green patches, sprouts and leaves hold solanine, which is poisonous; cut them away and bin any very green potatoes. Never eat raw potato.',
  },
  // Spices
  {
    key: 'black_pepper',
    name: 'Black pepper',
    group: 'spices',
    library: 'black_pepper',
    intentions: ['protection', 'banishing', 'courage'],
    about: '',
    kitchen: 'Grind pepper over a meal anticlockwise to send off envy and ill-wishing.',
    safety: 'Ground pepper irritates eyes and noses; keep it away from pets’ faces and don’t blow it about.',
  },
  {
    key: 'cinnamon',
    name: 'Cinnamon',
    group: 'spices',
    library: 'cinnamon',
    intentions: ['prosperity', 'love', 'courage', 'protection'],
    about: '',
    kitchen: 'Add a stick to the coffee pot or blow a pinch through the front door on the first of the month.',
    safety: 'Cassia, the common supermarket cinnamon, is high in coumarin, so keep daily amounts small. Cinnamon oil burns skin; never apply it neat, and keep the oil away from pets.',
  },
  {
    key: 'nutmeg',
    name: 'Nutmeg',
    group: 'spices',
    aliases: ['mace'],
    library: 'nutmeg',
    intentions: ['prosperity', 'intuition', 'love'],
    about: '',
    kitchen: 'Grate a little over warm milk or a custard and make a wish for luck as you grate.',
    safety:
      'Only a pinch: around a teaspoon or two (5 g or so) has caused nutmeg poisoning (hallucinations, racing heart, vomiting), and it is toxic to dogs and cats. Keep whole nutmegs away from children.',
  },
  {
    key: 'cloves',
    name: 'Cloves',
    group: 'spices',
    library: 'clove',
    intentions: ['protection', 'banishing', 'love', 'prosperity'],
    about: '',
    kitchen: 'Stud an orange with cloves for a pomander to hang by the door through winter.',
    safety: 'Clove oil is very strong and can burn skin and harm children if swallowed; keep it diluted and away from little ones and cats.',
  },
  {
    key: 'allspice',
    name: 'Allspice',
    group: 'spices',
    aliases: ['pimento', 'jamaica pepper'],
    library: 'allspice',
    intentions: ['prosperity', 'healing', 'courage'],
    about: '',
    kitchen: 'Add a few whole berries to a stew or a mulled drink for luck that comes quickly.',
    safety: 'Gentle in food amounts. Allspice oil irritates skin and is unsafe for pets.',
  },
  {
    key: 'star_anise',
    name: 'Star anise',
    group: 'spices',
    library: 'star_anise',
    intentions: ['intuition', 'protection', 'prosperity'],
    about: '',
    kitchen: 'Float one star in a mug of tea or a simmer pot before divination or a dreaming night.',
    safety:
      'Buy food-grade Chinese star anise (Illicium verum). Japanese star anise looks almost the same and is poisonous; don’t use stars of unknown origin in food.',
  },
  {
    key: 'cardamom',
    name: 'Cardamom',
    group: 'spices',
    aliases: ['cardamon', 'chai'],
    library: 'cardamom',
    intentions: ['love', 'study', 'peace'],
    about: '',
    kitchen: 'Crack a few pods into coffee or warm milk to share with a guest you want to feel welcome.',
    safety: 'Gentle in food. The essential oil is strong; keep it away from pets.',
  },
  {
    key: 'vanilla',
    name: 'Vanilla',
    group: 'spices',
    library: 'vanilla',
    intentions: ['love', 'peace'],
    about: '',
    kitchen: 'Add a drop of vanilla to a cake batter for a loving home, or dab a little on a pulse point before a date.',
    safety: 'Vanilla extract is about a third alcohol; keep it from children and pets. Patch-test before using on skin.',
  },
  {
    key: 'mustard_seed',
    name: 'Mustard seed',
    group: 'spices',
    aliases: ['mustard', 'mustard seeds'],
    element: 'Fire',
    planet: 'Mars',
    uses: ['faith', 'protection', 'courage', 'fertility'],
    intentions: ['protection', 'courage', 'beginnings'],
    about:
      'The smallest of seeds growing into a great plant made mustard the parable of faith in the Gospels, and a mustard seed carried in a locket is still a charm for faith and courage. Scattered across a doorway or carried in red cloth, it guards against harm.',
    kitchen: 'Toast mustard seeds in oil until they pop at the start of a curry or pickle, and let each pop be a small courage.',
    safety: 'Mustard is a common allergen (one of the 14 that must be labelled in the UK and EU). Mustard plasters and compresses can blister skin; don’t leave them on.',
  },
  {
    key: 'chili',
    name: 'Chili',
    group: 'spices',
    aliases: ['chilli', 'chile', 'cayenne', 'red pepper flakes', 'hot pepper'],
    element: 'Fire',
    planet: 'Mars',
    uses: ['protection', 'speed', 'breaking', 'passion'],
    intentions: ['protection', 'banishing', 'courage'],
    about:
      'The hottest thing in the cupboard is used to speed a working up or burn a curse off. Strings of dried chillies hang in kitchens from Mexico to Italy to keep the evil eye away, and the Italian cornicello charm takes a chilli-red horn shape.',
    kitchen: 'Hang a string of dried chillies by the stove, or add a pinch to a dish when a plan needs to get going.',
    safety:
      'Wear gloves to cut hot chillies and never touch your eyes. Don’t simmer, burn or heat chilli dry: the fumes hurt lungs, and are dangerous for pets and anyone with asthma.',
  },
  {
    key: 'paprika',
    name: 'Paprika',
    group: 'spices',
    aliases: ['smoked paprika', 'pimenton'],
    element: 'Fire',
    planet: 'Mars',
    also: 'A modern assignment, from the pepper family.',
    uses: ['energy', 'warmth', 'speed', 'courage'],
    intentions: ['courage', 'prosperity'],
    about:
      'The gentler cousin of chilli, ground from sweet or mildly hot red peppers. Paprika adds warmth and life without the burn: a spice for steady energy, and for working that should move on but not in a rush.',
    kitchen: 'Dust a pot of soup or stew with paprika on a cold Tuesday for warmth and quiet nerve.',
    safety: 'A nightshade; some people react to it. Smoked paprika scorches quickly in oil and its fumes sting.',
  },
  {
    key: 'peppermint',
    name: 'Peppermint',
    group: 'spices',
    aliases: ['mint tea'],
    library: 'peppermint',
    intentions: ['cleansing', 'healing', 'study'],
    about: '',
    kitchen: 'Brew a pot of peppermint tea after a heavy meal, or before study, to clear the head.',
    safety: 'Peppermint oil is toxic to cats and must not be put near a baby’s or small child’s face. Mint tea may worsen reflux.',
  },
  // Drinks & water
  {
    key: 'coffee',
    name: 'Coffee',
    group: 'drinks',
    aliases: ['coffee grounds', 'espresso'],
    element: 'Fire',
    planet: 'Mars',
    also: 'A modern assignment; some give coffee to Saturn for its dark bitterness.',
    uses: ['speed', 'energy', 'breaking blocks', 'grounding'],
    intentions: ['courage', 'study', 'banishing'],
    about:
      'A newer arrival in European folk practice, but quickly loved: coffee speeds a working, clears a block and wakes the mind. Grounds are read like tea leaves in Turkish and Greek fortune-telling, and spent grounds are used to ground and to drive off unwanted energy.',
    kitchen: 'Turn your cup over onto its saucer after drinking Turkish coffee and read the shapes left in the grounds.',
    safety: 'Caffeine is toxic to dogs and cats, including grounds left in compost or on soil. Too much in a day keeps anyone up.',
  },
  {
    key: 'black_tea',
    name: 'Black tea',
    group: 'drinks',
    aliases: ['tea', 'tea leaves', 'earl grey'],
    element: 'Fire',
    planet: 'Sun',
    uses: ['courage', 'riches', 'divination', 'hospitality'],
    intentions: ['courage', 'prosperity', 'intuition'],
    about:
      'A pot of tea is the British and Irish kitchen’s great comfort and welcome. Loose leaves left in the cup are read for signs (tasseography), a teapot is warmed before use, and folk sayings fill the brewing: stir the pot and you stir up strife, and a tea stalk floating on top means a visitor is coming.',
    kitchen: 'Make loose-leaf tea in a pot, drink it down to the leaves and swirl the cup three times before turning it to read.',
    safety: 'Caffeine, and tannins that stain; tea leaves are toxic to pets in quantity.',
  },
  {
    key: 'chocolate',
    name: 'Chocolate & cacao',
    group: 'drinks',
    aliases: ['cacao', 'cocoa', 'hot chocolate'],
    element: 'Fire',
    planet: 'Mars',
    also: 'Many modern lists give chocolate to Venus for love.',
    uses: ['love', 'energy', 'comfort', 'offerings'],
    intentions: ['love', 'courage', 'peace'],
    about:
      'Cacao was a sacred drink and even money among the Maya and Aztecs, poured for gods and kings, and it still comes from that history. In the modern kitchen it is a love food, a comfort and a lifter of spirits, and a favourite offering for the beloved dead.',
    kitchen: 'Make real hot chocolate from cocoa or grated chocolate on a cold night and drink it with someone you love, or leave a square for your ancestors.',
    safety: 'Theobromine in chocolate is toxic to dogs and cats, dark chocolate and cocoa most of all. Don’t leave chocolate offerings where pets can reach them.',
  },
  {
    key: 'wine',
    name: 'Wine',
    group: 'drinks',
    aliases: ['red wine', 'white wine', 'grape juice', 'libation'],
    element: 'Water',
    planet: 'Moon',
    also: 'From the grape; wine is also given to the Sun and to gods of the vine such as Dionysus.',
    uses: ['libation', 'celebration', 'offerings', 'ecstasy'],
    intentions: ['love', 'beginnings'],
    about:
      'The libation of the old world: a little poured on the ground or into the fire for the gods and the dead before anyone drinks. Wine blesses a feast, seals a promise and is the cup of cakes and ale in modern Wiccan rites.',
    kitchen: 'Pour the first splash of the bottle outside or into an offering bowl with thanks before a celebration meal.',
    safety:
      'Grape juice or water does the same work for anyone sober, young or pregnant. Alcohol is toxic to pets, and grapes, raisins and grape products can cause kidney failure in dogs, so don’t leave offerings where they can reach. Wine near candles or in a hot pan can catch.',
  },
  {
    key: 'water',
    name: 'Water',
    group: 'drinks',
    aliases: ['moon water', 'rain water', 'spring water'],
    element: 'Water',
    planet: 'Moon',
    uses: ['cleansing', 'blessing', 'healing', 'moon water'],
    intentions: ['cleansing', 'healing', 'intuition', 'peace'],
    about:
      'The first thing in any kitchen. Water is blessed, charged under the moon, stirred with intention and used to wash, to drink and to give back. Holy wells, rain caught on certain feast days and the first water drawn on New Year’s morning were all thought to carry special luck.',
    kitchen: 'Leave a covered jar of water on the windowsill on the full moon and use it to make the next morning’s tea.',
    safety:
      'Only drink moon or rain water that was clean to begin with and covered; rainwater can carry dirt and microbes. Many stones are unsafe in water you will drink, including malachite and selenite, so check Stone care first.',
  },
];

type LibraryHerb = { DisplayName?: string; Element?: string; Planet?: string; Uses?: string };
const HERBS = TRADITIONAL_LIBRARY.herb as unknown as Record<string, LibraryHerb>;

const fromLibrary = (raw: Raw): PantryItem => {
  const herb = raw.library ? HERBS[raw.library] : undefined;
  return {
    ...raw,
    element: raw.element ?? herb?.Element ?? '',
    planet: raw.planet ?? herb?.Planet ?? '',
    uses:
      raw.uses ??
      (herb?.Uses ?? '')
        .split(',')
        .map((u) => u.trim().toLowerCase())
        .filter(Boolean),
  };
};

/** The cupboard, in display order. */
export const PANTRY: PantryItem[] = RAW.map(fromLibrary);

const byKey = new Map(PANTRY.map((p) => [p.key, p]));
export const pantryItem = (key: string | null | undefined): PantryItem | null => (key ? byKey.get(key) ?? null : null);

/** The Library entry id for a linked item, for ritualsLibraryHref. */
export const pantryLibraryId = (item: PantryItem): string | null => (item.library ? `traditional:herb:${item.library}` : null);

/** Kitchen herbs the Library covers in full, for a short "also in the Library" list. */
export const LIBRARY_KITCHEN_HERBS = ['bay', 'rosemary', 'basil', 'thyme', 'sage', 'mint', 'chamomile', 'lavender', 'rose', 'lemon_balm', 'saffron', 'lemongrass', 'calendula', 'juniper'].filter(
  (key) => !!HERBS[key],
);
export const libraryHerbName = (key: string) => HERBS[key]?.DisplayName ?? key;

const fold = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export type PantryFilter = { query?: string; group?: PantryGroup | null; element?: string | null; intention?: string | null };

export function filterPantry(list: PantryItem[], filter: PantryFilter): PantryItem[] {
  const words = fold(filter.query ?? '').split(/\s+/).filter(Boolean);
  return list.filter((p) => {
    if (filter.group && p.group !== filter.group) return false;
    if (filter.element && p.element !== filter.element) return false;
    if (filter.intention && !p.intentions.includes(filter.intention as PremadeIntention)) return false;
    if (!words.length) return true;
    const text = fold([p.name, ...(p.aliases ?? []), ...p.uses, p.element, p.planet, p.about, p.kitchen].join(' '));
    return words.every((w) => text.includes(w));
  });
}
