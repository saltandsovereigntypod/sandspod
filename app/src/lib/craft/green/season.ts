// In season now: when to sow and gather the common culinary and magical
// herbs and flowers, for a temperate garden. Months are for the temperate
// northern hemisphere (roughly a British, northern European or mid-US
// garden) and are turned six months for the southern. Frost dates, altitude
// and rainfall move everything by weeks, so the screen says so.
// Pure, so it can be tested.

export type Hemisphere = 'north' | 'south';

export type SeasonPlant = {
  /** Living Library herb key, when the Library has the plant. */
  key: string;
  name: string;
  library: boolean;
  /** Months (1–12) to sow seed, plant out, plant cloves, corms or roots. */
  sow: number[];
  /** Months (1–12) to gather the part that's used. */
  harvest: number[];
  /** What's sown and what's gathered, in a few words. */
  sowWhat: string;
  harvestWhat: string;
  /** Growing note. */
  note: string;
  /** Anything to take care with: toxicity, skin, look-alikes. */
  caution?: string;
  /** Grows wild; gather from clean ground with permission. */
  wild?: boolean;
};

const range = (from: number, to: number): number[] => {
  const out: number[] = [];
  for (let m = from; ; m = (m % 12) + 1) {
    out.push(m);
    if (m === to) break;
  }
  return out;
};
const ALL = range(1, 12);

export const SEASON_PLANTS: SeasonPlant[] = [
  {
    key: 'basil',
    name: 'Basil',
    library: true,
    sow: range(3, 6),
    harvest: range(6, 9),
    sowWhat: 'Sow indoors in warmth from March; outside only once nights stay mild',
    harvestWhat: 'Pinch leaves from the tips, before it flowers',
    note: 'Tender: the first cold night blackens it. A sunny windowsill pot does well.',
  },
  {
    key: 'bay',
    name: 'Bay',
    library: true,
    sow: range(4, 5),
    harvest: ALL,
    sowWhat: 'Plant a young tree in spring; seed is slow',
    harvestWhat: 'Leaves can be picked any month; dry them flat',
    note: 'Evergreen and happy in a large pot. Shelter it from hard frost.',
  },
  {
    key: 'calendula',
    name: 'Calendula (pot marigold)',
    library: true,
    sow: [...range(3, 5), 9],
    harvest: range(6, 10),
    sowWhat: 'Sow straight into the ground in spring, or in September for early flowers',
    harvestWhat: 'Pick open flower heads on a dry morning; more will follow',
    note: 'Easy, cheerful and self-seeding.',
  },
  {
    key: 'catnip',
    name: 'Catnip',
    library: true,
    sow: range(3, 5),
    harvest: range(6, 9),
    sowWhat: 'Sow in spring',
    harvestWhat: 'Cut leafy stems as it comes into flower',
    note: 'Hardy perennial. Cats will find it, so give young plants some cover.',
  },
  {
    key: 'chamomile',
    name: 'Chamomile',
    library: true,
    sow: [...range(3, 5), 9],
    harvest: range(6, 8),
    sowWhat: 'Sow German chamomile on the surface (it needs light to germinate), spring or early autumn',
    harvestWhat: 'Pick the flowers when the petals are fully open',
    note: 'Pick often and it keeps flowering.',
    caution: 'In the daisy family: can trouble people allergic to ragweed.',
  },
  {
    key: 'comfrey',
    name: 'Comfrey',
    library: true,
    sow: range(3, 5),
    harvest: range(5, 9),
    sowWhat: 'Plant root cuttings or young plants in spring',
    harvestWhat: 'Cut leaves several times a summer for compost and feed',
    note: 'Deep-rooted and very hard to move once settled. Choose its spot well.',
    caution: 'Not for eating or drinking: it can harm the liver. Outward use only, and never on broken skin.',
  },
  {
    key: 'dandelion',
    name: 'Dandelion',
    library: true,
    sow: [],
    harvest: [...range(3, 5), ...range(9, 11)],
    sowWhat: 'No need to sow; it finds you',
    harvestWhat: 'Young leaves and flowers in spring; roots in autumn',
    note: 'Leave some flowers for early bees.',
    wild: true,
  },
  {
    key: 'elder',
    name: 'Elder',
    library: true,
    sow: [...range(11, 12), ...range(1, 2)],
    harvest: [...range(5, 6), ...range(8, 9)],
    sowWhat: 'Plant a young tree or hardwood cuttings while dormant',
    harvestWhat: 'Flowers in early summer; ripe dark berries in late summer',
    note: 'Ask the tree first, as the old custom goes.',
    caution: 'Raw berries, leaves, bark and stems can make you ill. Cook the berries; never eat them raw.',
  },
  {
    key: 'foxglove',
    name: 'Foxglove',
    library: true,
    sow: range(5, 7),
    harvest: range(6, 7),
    sowWhat: 'Sow on the surface in early summer; it flowers the year after',
    harvestWhat: 'For the eye and the altar only: it flowers in its second summer',
    note: 'A biennial that self-seeds in shade.',
    caution: 'Every part is poisonous, even in small amounts. Never eat it; wear gloves and keep it from children and pets.',
  },
  {
    key: 'garlic',
    name: 'Garlic',
    library: true,
    sow: [...range(10, 11), ...range(2, 3)],
    harvest: range(6, 8),
    sowWhat: 'Plant single cloves, pointed end up; autumn planting gives bigger bulbs',
    harvestWhat: 'Lift when the lower leaves yellow, then dry it in the sun',
    note: 'Needs a spell of cold to form good bulbs.',
  },
  {
    key: 'hawthorn',
    name: 'Hawthorn',
    library: true,
    sow: [...range(11, 12), ...range(1, 3)],
    harvest: [5, 9, 10],
    sowWhat: 'Plant bare-root whips while dormant',
    harvestWhat: 'Blossom in May; red haws in autumn',
    note: 'The old hedge tree. Folk custom keeps blossom out of the house.',
    caution: 'Thorny. The seeds inside the haws should not be eaten.',
  },
  {
    key: 'hyssop',
    name: 'Hyssop',
    library: true,
    sow: range(3, 5),
    harvest: range(6, 9),
    sowWhat: 'Sow in spring',
    harvestWhat: 'Cut flowering tops and leaves',
    note: 'Loves sun and poor, well-drained soil. Bees love it.',
    caution: 'Avoid in pregnancy and with epilepsy; the oil is strong.',
  },
  {
    key: 'jasmine',
    name: 'Jasmine',
    library: true,
    sow: [...range(4, 5), ...range(9, 10)],
    harvest: range(6, 9),
    sowWhat: 'Plant a young climber in spring or early autumn',
    harvestWhat: 'Gather flowers in the evening, when the scent is strongest',
    note: 'Common jasmine (Jasminum officinale) is hardy against a warm wall.',
  },
  {
    key: 'juniper',
    name: 'Juniper',
    library: true,
    sow: [...range(10, 12), ...range(1, 3)],
    harvest: range(9, 11),
    sowWhat: 'Plant a young shrub in autumn or early spring',
    harvestWhat: 'Pick blue-black berries; they take two or three years to ripen',
    note: 'You need a female plant, with a male nearby, for berries.',
    caution: 'Avoid in pregnancy and with kidney trouble. Some ornamental junipers are poisonous; use only common juniper.',
  },
  {
    key: 'lavender',
    name: 'Lavender',
    library: true,
    sow: range(2, 5),
    harvest: range(6, 8),
    sowWhat: 'Sow indoors late winter (slow), or plant young plants in spring',
    harvestWhat: 'Cut stems as the first flowers open, for the best scent',
    note: 'Wants full sun and sharp drainage. Trim after flowering, never into old wood.',
  },
  {
    key: 'lemon_balm',
    name: 'Lemon balm',
    library: true,
    sow: range(3, 5),
    harvest: range(5, 9),
    sowWhat: 'Sow in spring',
    harvestWhat: 'Pick leaves before it flowers, when the lemon scent is strongest',
    note: 'Spreads by seed; cut it back after flowering.',
  },
  {
    key: 'lemongrass',
    name: 'Lemongrass',
    library: true,
    sow: range(2, 4),
    harvest: range(7, 10),
    sowWhat: 'Sow indoors in warmth, or root shop-bought stalks in water',
    harvestWhat: 'Cut stalks at the base once they’re pencil-thick',
    note: 'Tropical: grow it in a pot and bring it in before the first frost.',
  },
  {
    key: 'mint',
    name: 'Mint',
    library: true,
    sow: range(3, 5),
    harvest: range(5, 10),
    sowWhat: 'Plant a root division or young plant in spring',
    harvestWhat: 'Pick sprigs all summer; cut hard before flowering to dry',
    note: 'Grow it in a pot: in open ground it runs everywhere.',
  },
  {
    key: 'meadowsweet',
    name: 'Meadowsweet',
    library: true,
    sow: [...range(3, 4), ...range(9, 10)],
    harvest: range(6, 8),
    sowWhat: 'Sow in autumn (seed likes the cold) or spring, in damp ground',
    harvestWhat: 'Cut the creamy flower heads as they open',
    note: 'A plant of wet meadows and ditch banks.',
    caution: 'Contains salicylates, like aspirin: avoid if you’re sensitive to aspirin.',
  },
  {
    key: 'mugwort',
    name: 'Mugwort',
    library: true,
    sow: range(3, 5),
    harvest: range(6, 8),
    sowWhat: 'Sow in spring; it also grows wild on waste ground',
    harvestWhat: 'Cut leafy tops just before the flowers open',
    note: 'Dry it in bundles for smoke-free dream pillows and altar work.',
    caution: 'Never eat or drink it. Avoid entirely in pregnancy. Its pollen is a strong allergen.',
  },
  {
    key: 'nettle',
    name: 'Nettle',
    library: true,
    sow: [],
    harvest: [...range(3, 5), 9],
    sowWhat: 'No need to sow; it grows wild on rich ground',
    harvestWhat: 'Young tops before it flowers, and the fresh regrowth after cutting',
    note: 'Wear gloves. Old leaves after flowering are gritty; leave them for the butterflies.',
    wild: true,
  },
  {
    key: 'peppermint',
    name: 'Peppermint',
    library: true,
    sow: range(3, 5),
    harvest: range(5, 10),
    sowWhat: 'Plant a rooted runner in spring (it doesn’t come true from seed)',
    harvestWhat: 'Pick sprigs all summer',
    note: 'As with all mints, keep it in a pot.',
  },
  {
    key: 'rose',
    name: 'Rose',
    library: true,
    sow: [...range(11, 12), ...range(1, 3)],
    harvest: [...range(6, 8), ...range(9, 11)],
    sowWhat: 'Plant bare-root roses while dormant',
    harvestWhat: 'Petals in summer; hips once they redden in autumn',
    note: 'Old scented roses and the wild dog rose give the best petals and hips.',
    caution: 'Rose hips have irritant hairs inside; strain any brew through fine cloth.',
  },
  {
    key: 'rosemary',
    name: 'Rosemary',
    library: true,
    sow: range(4, 5),
    harvest: ALL,
    sowWhat: 'Plant a young plant in spring (seed is slow and patchy)',
    harvestWhat: 'Sprigs any month, gently in winter',
    note: 'Evergreen. Hates wet roots in winter.',
  },
  {
    key: 'rowan',
    name: 'Rowan',
    library: true,
    sow: [...range(11, 12), ...range(1, 3)],
    harvest: range(8, 10),
    sowWhat: 'Plant a young tree while dormant',
    harvestWhat: 'Berries as they turn scarlet; a twig for an equal-armed cross',
    note: 'The old protector by the door.',
    caution: 'Raw berries upset the stomach; they are only eaten cooked.',
  },
  {
    key: 'rue',
    name: 'Rue',
    library: true,
    sow: range(3, 5),
    harvest: range(6, 8),
    sowWhat: 'Sow in spring',
    harvestWhat: 'Cut leafy stems with gloves on',
    note: 'A blue-grey evergreen for a dry, sunny spot.',
    caution: 'The sap blisters skin in sunlight. Wear gloves. Not for eating; avoid entirely in pregnancy.',
  },
  {
    key: 'saffron',
    name: 'Saffron crocus',
    library: true,
    sow: range(8, 9),
    harvest: range(10, 11),
    sowWhat: 'Plant corms in late summer (September at the latest), in sharp-draining soil',
    harvestWhat: 'Pluck the three red threads from each autumn flower',
    note: 'It flowers in autumn, not spring. Many flowers make a pinch.',
    caution: 'Don’t confuse it with autumn crocus (Colchicum), which is deadly. Buy corms labelled Crocus sativus.',
  },
  {
    key: 'sage',
    name: 'Sage',
    library: true,
    sow: range(3, 5),
    harvest: range(4, 10),
    sowWhat: 'Sow or plant in spring',
    harvestWhat: 'Pick leaves through the growing season; best before flowering',
    note: 'Replace every few years as it turns woody.',
    caution: 'Garden sage is fine as a kitchen herb; avoid large amounts in pregnancy.',
  },
  {
    key: 'st_johns_wort',
    name: 'St John’s wort',
    library: true,
    sow: range(3, 5),
    harvest: range(6, 7),
    sowWhat: 'Sow in spring',
    harvestWhat: 'Cut flowering tops around Midsummer, its traditional day',
    note: 'Hold a leaf to the light to see its tiny ‘holes’.',
    caution: 'Interferes with many medicines, including the pill and antidepressants, and can make skin burn in sun.',
  },
  {
    key: 'thyme',
    name: 'Thyme',
    library: true,
    sow: range(3, 5),
    harvest: range(5, 9),
    sowWhat: 'Sow on the surface in spring, or plant a young plant',
    harvestWhat: 'Snip sprigs; light picking is fine in winter too',
    note: 'Evergreen, loves sun and poor soil.',
  },
  {
    key: 'valerian',
    name: 'Valerian',
    library: true,
    sow: range(3, 5),
    harvest: range(9, 10),
    sowWhat: 'Sow on the surface in spring',
    harvestWhat: 'Lift roots in autumn of the second year',
    note: 'Tall and scented; cats are drawn to the roots.',
    caution: 'Causes drowsiness; don’t combine with sleeping medicines or alcohol.',
  },
  {
    key: 'vervain',
    name: 'Vervain',
    library: true,
    sow: range(3, 5),
    harvest: range(6, 9),
    sowWhat: 'Sow in spring',
    harvestWhat: 'Cut the flowering tops',
    note: 'Gathered in old lore when neither sun nor moon was in the sky.',
    caution: 'Avoid in pregnancy.',
  },
  {
    key: 'wormwood',
    name: 'Wormwood',
    library: true,
    sow: range(3, 5),
    harvest: range(7, 8),
    sowWhat: 'Sow in spring',
    harvestWhat: 'Cut flowering tops and dry them',
    note: 'Silver and bitter. It is said to stunt plants grown close to it, so give it room.',
    caution: 'Toxic in quantity: not to be eaten or drunk. Avoid in pregnancy.',
  },
  {
    key: 'yarrow',
    name: 'Yarrow',
    library: true,
    sow: [...range(4, 6), 9],
    harvest: range(6, 9),
    sowWhat: 'Sow on the surface in late spring or early autumn',
    harvestWhat: 'Cut stems in full flower; dry for bundles',
    note: 'Tough and drought-proof.',
    caution: 'Avoid in pregnancy; can cause skin reactions in some people.',
  },
  {
    key: 'angelica',
    name: 'Angelica',
    library: true,
    sow: [...range(3, 4), ...range(8, 9)],
    harvest: [...range(4, 5), ...range(7, 8)],
    sowWhat: 'Sow fresh seed in late summer, or spring; it needs cold to germinate',
    harvestWhat: 'Young stems in spring; seed heads in summer',
    note: 'A tall biennial for damp, part-shaded ground.',
    caution: 'Grow it from seed you bought: wild look-alikes such as hemlock are deadly. The sap can burn skin in sunlight.',
  },
  // Kitchen plants the Library doesn't have pages for yet.
  {
    key: 'parsley',
    name: 'Parsley',
    library: false,
    sow: range(3, 8),
    harvest: range(5, 11),
    sowWhat: 'Sow in succession through spring and summer (slow to sprout)',
    harvestWhat: 'Cut outer stems, leaving the heart to grow',
    note: 'An old saying holds that it goes to the devil seven times before it comes up.',
  },
  {
    key: 'chives',
    name: 'Chives',
    library: false,
    sow: range(3, 5),
    harvest: range(3, 10),
    sowWhat: 'Sow or divide clumps in spring',
    harvestWhat: 'Snip leaves; the purple flowers are edible',
    note: 'Dies back in winter and returns.',
  },
  {
    key: 'dill',
    name: 'Dill',
    library: false,
    sow: range(4, 7),
    harvest: range(6, 9),
    sowWhat: 'Sow where it’s to grow; it dislikes being moved',
    harvestWhat: 'Leaves while young; seed heads as they brown',
    note: 'Sow a pinch every few weeks for a steady supply.',
  },
  {
    key: 'sunflower',
    name: 'Sunflower',
    library: false,
    sow: range(4, 5),
    harvest: range(9, 10),
    sowWhat: 'Sow once the soil warms and frosts are over',
    harvestWhat: 'Cut heads when the back turns brown; dry for seed',
    note: 'Leave a head or two for the birds.',
  },
];

/** Southern below the equator; unknown latitude reads as northern. */
export function hemisphereOf(latitude: number | null | undefined): Hemisphere {
  return typeof latitude === 'number' && latitude < 0 ? 'south' : 'north';
}

/** Tropical latitudes keep wet and dry seasons rather than these. */
export function isTropical(latitude: number | null | undefined): boolean {
  return typeof latitude === 'number' && Math.abs(latitude) < 23.5;
}

/** The northern month that matches `month` (1–12) where you are. */
export function northernMonth(month: number, hemisphere: Hemisphere): number {
  return hemisphere === 'north' ? month : ((month + 5) % 12) + 1;
}

/** The local month (1–12) for a northern month. */
export function localMonth(northern: number, hemisphere: Hemisphere): number {
  return hemisphere === 'north' ? northern : ((northern + 5) % 12) + 1;
}

export type SeasonNow = { sow: SeasonPlant[]; harvest: SeasonPlant[] };

/** What to sow and gather in a local month (1–12). */
export function inSeason(month: number, hemisphere: Hemisphere, plants: SeasonPlant[] = SEASON_PLANTS): SeasonNow {
  const m = northernMonth(month, hemisphere);
  const byName = (a: SeasonPlant, b: SeasonPlant) => a.name.localeCompare(b.name);
  return {
    sow: plants.filter((p) => p.sow.includes(m)).sort(byName),
    harvest: plants.filter((p) => p.harvest.includes(m)).sort(byName),
  };
}

/** Local months, in order from January, for a plant's sow or harvest list. */
export function localMonths(northern: number[], hemisphere: Hemisphere): number[] {
  return northern.map((m) => localMonth(m, hemisphere)).sort((a, b) => a - b);
}

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "Mar–Jun", "All year", "Oct–Nov, Feb–Mar" from local months. */
export function monthSpan(months: number[]): string {
  if (!months.length) return '—';
  if (months.length === 12) return 'All year';
  const set = new Set(months);
  // Start each run at a month whose previous month isn't in the set.
  const starts = [...set].filter((m) => !set.has(((m + 10) % 12) + 1)).sort((a, b) => a - b);
  return starts
    .map((start) => {
      let end = start;
      while (set.has((end % 12) + 1)) end = (end % 12) + 1;
      return end === start ? SHORT[start - 1] : `${SHORT[start - 1]}–${SHORT[end - 1]}`;
    })
    .join(', ');
}
