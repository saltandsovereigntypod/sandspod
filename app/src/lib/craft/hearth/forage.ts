// Foraging & garden: a foraging calendar for common wild plants of temperate
// hedgerows, woods and shores, each with how to know it, the look-alikes
// that can hurt you, and how to take with care; what grows where on the
// places in your land journal; and a harvest log that keeps what you've
// gathered and dried as a store cupboard for the kitchen and the apothecary.
//
// The months are for the temperate northern hemisphere (a British or northern
// European hedgerow, much of the northern US) and turned six months south of
// the equator, as the Green practice's In season does. Weather, altitude and
// the year move everything by weeks. This is a starting point for learning,
// never a field guide: nothing here identifies a plant for you, and fungi are
// left out entirely. No medical claims are made for any plant.
//
// Patches and harvests are craft entries (land.growing and land.harvests).
// Pure, so it can be tested and shared with the website (js/core/hearth.js).

import { dateFromKey, localDateKey } from '../../rituals/lifecycle.ts';
import { herbName } from '../green/garden.ts';
import { localMonths, monthSpan, northernMonth, type Hemisphere } from '../green/season.ts';
import { moonOnDay } from './land.ts';
import type { PhaseName } from '../../moon.ts';

export const LAND_GROWING = 'land.growing';
export const LAND_HARVESTS = 'land.harvests';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const range = (from: number, to: number): number[] => {
  const out: number[] = [];
  for (let m = from; ; m = (m % 12) + 1) {
    out.push(m);
    if (m === to) break;
  }
  return out;
};

// ── The rules ───────────────────────────────────────────────────────────────

/** Read before anything else, on every foraging page. */
export const FORAGE_FIRST = 'Never eat, drink or put on your skin anything you can’t identify with complete certainty. If in doubt, leave it out.';

export const FORAGE_RULES: { title: string; text: string }[] = [
  {
    title: 'Be certain, every time',
    text: 'Check several features (leaf, stem, flower, smell, where it grows) against a good field guide for your region, and learn from an experienced local forager in person where you can. An app, this one included, is never enough to identify a plant.',
  },
  {
    title: 'Learn the dangerous look-alikes first',
    text: 'Several deadly plants grow beside common wild foods: hemlock and hemlock water dropwort among the white umbels, lily of the valley and lords-and-ladies among wild garlic, yew beside pine, deadly nightshade near the hedgerow fruit. Know them before you pick.',
  },
  {
    title: 'Fungi are not covered',
    text: 'This app gives no help with mushrooms or other fungi. Some of the deadliest look very like edible ones.',
  },
  {
    title: 'Take a little',
    text: 'Pick no more than you’ll use, from plants growing in plenty, and leave most of every patch for wildlife and for the plant to come back. Never uproot a wild plant. Pick a few here and a few there rather than stripping one bush.',
  },
  {
    title: 'Know the law and ask permission',
    text: 'Laws differ from place to place, so check yours. In Britain it is against the law to uproot any wild plant without the permission of the landowner or occupier (the Wildlife and Countryside Act 1981, as amended), and some species are protected outright; many parks, nature reserves and protected sites don’t allow picking at all. Elsewhere, public land often has its own rules. Ask the landowner before you gather on private land.',
  },
  {
    title: 'Choose clean ground',
    text: 'Avoid roadsides, sprayed fields, lawns and verges, the low growth on busy dog-walking paths, and anything near polluted water.',
  },
  {
    title: 'Go carefully with new foods',
    text: 'Try a small amount of a wild food the first time; some people react to plants others eat safely. Allergies to the daisy family, tree nuts and others apply to wild plants too.',
  },
  {
    title: 'No medical claims',
    text: 'The notes here are folklore, kitchen use and safety, not medicine. If you’re pregnant or breastfeeding, giving anything to a child, or taking medication, ask a doctor or pharmacist before using any plant. Keep pets away from the toxic ones.',
  },
  {
    title: 'If something goes wrong',
    text: 'If someone may have eaten something poisonous, get medical help at once and take a sample or photo of the plant with you. In the UK, call NHS 111, or 999 in an emergency; elsewhere, your emergency number or poison centre.',
  },
];

/** Planting by the moon, framed honestly: shown wherever the moon garden is offered beside foraging. */
export const MOON_PLANTING_NOTE =
  'Planting by the moon is a folk and almanac tradition, kept by many gardeners for centuries. Careful trials haven’t shown that it changes how plants grow, so take it as a rhythm to garden by, not a rule: sow when the soil, the weather and the season are right first.';

// ── The plants ──────────────────────────────────────────────────────────────

export type Danger = 'deadly' | 'toxic' | 'mild';

export type LookAlike = { name: string; danger: Danger; tell: string; library?: string };

export type ForagePlant = {
  key: string;
  name: string;
  latin: string;
  /** Living Library herb or tree key, when the Library has it. */
  library: string | null;
  /** What's gathered. */
  parts: string;
  /** Northern months (1–12) to gather. */
  months: number[];
  /** A few words on when, within those months. */
  when: string;
  where: string;
  /** How to know it, in short. Never enough on its own. */
  know: string;
  lookAlikes: LookAlike[];
  /** food: eaten as it is; cook: only cooked or prepared; not-food: not for eating or drinking. */
  use: 'food' | 'cook' | 'not-food';
  /** How to take with care, and any law or ethics. */
  care: string;
  /** Safety, beyond the look-alikes. */
  caution: string;
  /** Kitchen witchery starter recipes that use it. */
  recipes?: string[];
};

export const DANGER_LABELS: Record<Danger, string> = { deadly: 'Deadly', toxic: 'Poisonous', mild: 'Harmless but not the same' };
export const USE_LABELS: Record<ForagePlant['use'], string> = {
  food: 'Eaten as gathered',
  cook: 'Only cooked or prepared',
  'not-food': 'Not for eating or drinking',
};

const UMBELS: LookAlike = {
  name: 'Hemlock, hemlock water dropwort and other white umbels',
  danger: 'deadly',
  tell: 'These are soft, leafy plants with flat-topped heads of tiny white flowers on umbrella spokes. Hemlock has a smooth stem blotched purple and a mousy smell. Never gather from the carrot family unless you are expert.',
};

export const FORAGE_PLANTS: ForagePlant[] = [
  {
    key: 'wild_garlic',
    name: 'Wild garlic (ramsons)',
    latin: 'Allium ursinum',
    library: null,
    parts: 'Leaves, flowers',
    months: range(3, 5),
    when: 'Leaves from March, before and as it flowers; white star flowers in April and May',
    where: 'Damp, shady woods and stream banks, often in great carpets',
    know: 'Broad, soft, bright green leaves rising singly from the ground, and a strong garlic smell from each crushed leaf.',
    lookAlikes: [
      { name: 'Lily of the valley', danger: 'deadly', tell: 'Leaves come in pairs from one sheath and have no garlic smell. Garlic on your fingers can hide it, so smell each leaf with clean hands.' },
      { name: 'Lords-and-ladies (cuckoo pint)', danger: 'toxic', tell: 'Arrow-shaped, often dark-spotted leaves with branching veins.' },
      { name: 'Autumn crocus', danger: 'deadly', tell: 'Leaves appear in spring in a tuft, without the smell.' },
      { name: 'Bluebell leaves', danger: 'toxic', tell: 'Narrow, strap-like leaves without the smell; bluebells often grow among ramsons.' },
    ],
    use: 'food',
    care: 'Pick a leaf or two from each plant and leave the bulbs in the ground. In Britain it is against the law to dig up wild plants without permission.',
    caution: 'Pick leaf by leaf rather than by the handful, so nothing else comes with them.',
  },
  {
    key: 'nettle',
    name: 'Nettle',
    latin: 'Urtica dioica',
    library: 'nettle',
    parts: 'Young tops',
    months: [...range(3, 5), 9],
    when: 'The top few leaves of young plants in spring, before they flower; again from new growth after cutting',
    where: 'Rich ground: hedges, field edges, old gardens, beside paths',
    know: 'Toothed, heart-shaped leaves in opposite pairs on a square stem, covered in stinging hairs.',
    lookAlikes: [
      { name: 'Dead-nettles', danger: 'mild', tell: 'Similar leaves without the sting, with white, purple or yellow hooded flowers.' },
      { name: 'Dog’s mercury', danger: 'toxic', tell: 'Grows in shady woods, without stinging hairs, with an unpleasant smell.' },
    ],
    use: 'cook',
    care: 'Wear gloves. Take only the tops, which helps the plant branch.',
    caution: 'Cooking or drying removes the sting. Old plants in flower are coarse and best left.',
    recipes: ['nettle-soup'],
  },
  {
    key: 'dandelion',
    name: 'Dandelion',
    latin: 'Taraxacum officinale',
    library: 'dandelion',
    parts: 'Leaves, flowers, roots',
    months: [...range(3, 5), 10],
    when: 'Young leaves and flowers in spring; roots in autumn',
    where: 'Almost anywhere: meadows, lawns, verges, waste ground',
    know: 'A rosette of deeply toothed, hairless leaves; one yellow flower to each hollow stem, which bleeds white sap.',
    lookAlikes: [{ name: 'Cat’s-ear and hawkbits', danger: 'mild', tell: 'Hairy leaves, or branched and solid stems.' }],
    use: 'food',
    care: 'Leave plenty of the spring flowers: they are an early food for bees.',
    caution: 'Lawns and verges are often sprayed. A daisy-family plant: take care if you have that allergy.',
  },
  {
    key: 'elderflower',
    name: 'Elder (flowers)',
    latin: 'Sambucus nigra',
    library: 'elder',
    parts: 'Flower heads',
    months: range(5, 6),
    when: 'Late May and June, on a dry, sunny morning when the flowers are fully open and smell sweet',
    where: 'Hedges, woodland edges, waste ground',
    know: 'A woody shrub or small tree with corky bark, leaves of five to seven toothed leaflets, and flat sprays of creamy, scented flowers.',
    lookAlikes: [UMBELS, { name: 'Dwarf elder', danger: 'toxic', tell: 'A soft, non-woody plant with pinkish flowers and upright berries.' }],
    use: 'cook',
    care: 'Take a few heads from each bush and leave the rest to become berries for the birds.',
    caution: 'Leaves, stems, bark and roots are poisonous. Shake out insects, use the flowers only, and strip as much green stalk as you can.',
    recipes: ['elderflower-cordial'],
  },
  {
    key: 'elderberry',
    name: 'Elder (berries)',
    latin: 'Sambucus nigra',
    library: 'elder',
    parts: 'Ripe berries',
    months: range(8, 10),
    when: 'When the clusters hang heavy and every berry is dark purple-black',
    where: 'Hedges, woodland edges, waste ground',
    know: 'Drooping, umbrella-shaped bunches of tiny black berries on purple stalks, on the woody elder bush.',
    lookAlikes: [{ name: 'Dwarf elder', danger: 'toxic', tell: 'Berries held upright on a soft, non-woody plant.' }],
    use: 'cook',
    care: 'Leave many clusters for the birds, who depend on them in autumn.',
    caution: 'Never eat elderberries raw: unripe and raw berries, stalks and seeds can make you very ill. Strip them from the stalks with a fork and cook them thoroughly.',
  },
  {
    key: 'hawthorn',
    name: 'Hawthorn',
    latin: 'Crataegus monogyna',
    library: 'hawthorn',
    parts: 'Young leaves, blossom, haws',
    months: [4, 5, ...range(9, 11)],
    when: 'Young leaves in April, the may blossom in May, dark red haws from September',
    where: 'Hedges, field edges, open woods and hillsides',
    know: 'A thorny shrub with small, deeply lobed leaves, clouds of white five-petalled blossom, and clusters of red berries each with one hard stone.',
    lookAlikes: [{ name: 'Blackthorn', danger: 'mild', tell: 'Blossom comes before the leaves, earlier in spring; its fruit is the blue-black sloe.' }],
    use: 'cook',
    care: 'Folklore holds that a lone hawthorn belongs to the fair folk, and many still won’t cut one or bring the blossom indoors. Take a little, with thanks.',
    caution: 'Don’t eat the stones. Hawthorn can interact with heart and blood-pressure medicines: ask a doctor first if you take them.',
  },
  {
    key: 'rosehip',
    name: 'Rose hips',
    latin: 'Rosa canina',
    library: 'rosehip',
    parts: 'Ripe hips',
    months: range(9, 11),
    when: 'When they are deep red and just soft; many wait for the first frost',
    where: 'Hedges, scrub and woodland edges',
    know: 'Arching, prickly stems of wild rose with oval red hips where the flowers were.',
    lookAlikes: [{ name: 'Black bryony and white bryony berries', danger: 'toxic', tell: 'Shiny red berries in loose strings on climbing vines with no prickles. They are not hips.' }],
    use: 'cook',
    care: 'Leave plenty for the birds through winter.',
    caution: 'The seeds are wrapped in irritating hairs. Strain anything made with hips through a fine cloth.',
    recipes: ['rosehip-syrup'],
  },
  {
    key: 'blackberry',
    name: 'Blackberry (bramble)',
    latin: 'Rubus fruticosus agg.',
    library: null,
    parts: 'Ripe berries, young leaves',
    months: range(7, 9),
    when: 'From late July; folklore says not after Michaelmas, when the devil spits on them',
    where: 'Hedges, scrub, woods and waste ground',
    know: 'Arching, prickly stems; leaves of three or five toothed leaflets; berries made of many small drupes, red turning black.',
    lookAlikes: [],
    use: 'food',
    care: 'Pick above dog height, and leave the hard red ones to ripen.',
    caution: 'Wash before eating. Discard any that are mouldy.',
    recipes: ['bramble-crumble'],
  },
  {
    key: 'rowan',
    name: 'Rowan berries',
    latin: 'Sorbus aucuparia',
    library: 'rowan',
    parts: 'Ripe berries',
    months: range(8, 10),
    when: 'Late summer into autumn, when they are bright orange-red',
    where: 'Hillsides, woods, gardens and streets',
    know: 'A slender tree with feathery leaves of many paired, toothed leaflets, and heavy bunches of orange-red berries.',
    lookAlikes: [],
    use: 'cook',
    care: 'Rowan guards the house in old lore; birds rely on its berries. Take a few bunches only.',
    caution: 'Raw rowan berries are mildly poisonous and upset the stomach. They are only ever cooked, usually into a jelly with apples.',
  },
  {
    key: 'sloe',
    name: 'Sloes (blackthorn)',
    latin: 'Prunus spinosa',
    library: null,
    parts: 'Ripe fruit',
    months: range(10, 11),
    when: 'Autumn, traditionally after the first frost has touched them',
    where: 'Hedges and scrub',
    know: 'A dense, very thorny shrub; small blue-black fruit with a misty bloom, very sour, each with one stone.',
    lookAlikes: [
      { name: 'Deadly nightshade (belladonna)', danger: 'deadly', tell: 'Shiny black berries held singly in a star of green sepals, on a soft, non-thorny plant.', library: 'belladonna' },
      { name: 'Buckthorn', danger: 'toxic', tell: 'Black berries in clusters on a shrub with few thorns and oval, finely toothed leaves.' },
    ],
    use: 'cook',
    care: 'Leave plenty on each bush.',
    caution: 'Don’t eat or crush the stones.',
  },
  {
    key: 'crab_apple',
    name: 'Crab apples',
    latin: 'Malus sylvestris',
    library: null,
    parts: 'Fruit',
    months: range(9, 11),
    when: 'Autumn, as they colour and begin to fall',
    where: 'Hedges and old woodland; many wild apple trees are garden escapes',
    know: 'Small, hard, sour apples on a spreading tree.',
    lookAlikes: [],
    use: 'cook',
    care: 'Windfalls are fine for jelly; leave some for the wildlife.',
    caution: 'Don’t eat the pips in quantity.',
  },
  {
    key: 'hazel',
    name: 'Hazelnuts',
    latin: 'Corylus avellana',
    library: null,
    parts: 'Nuts',
    months: range(8, 10),
    when: 'Late summer, as the husks begin to brown; the squirrels are usually quicker',
    where: 'Hedges and woodland, often coppiced',
    know: 'A many-stemmed shrub with soft, round, toothed leaves; nuts in a frilled green husk.',
    lookAlikes: [],
    use: 'food',
    care: 'Hazel is the tree of wisdom in Irish lore. Leave plenty for squirrels and dormice.',
    caution: 'A tree nut: keep away from anyone with a nut allergy.',
  },
  {
    key: 'sweet_chestnut',
    name: 'Sweet chestnuts',
    latin: 'Castanea sativa',
    library: null,
    parts: 'Nuts',
    months: range(10, 11),
    when: 'October and November, when the cases split and fall',
    where: 'Woods and parks',
    know: 'Long, glossy, saw-toothed leaves; cases covered in many fine, sharp spines like a hedgehog, holding two or three flattish nuts with a pointed tassel.',
    lookAlikes: [
      { name: 'Horse chestnut (conkers)', danger: 'toxic', tell: 'Cases with a few short, stubby spines, holding one round, shiny nut with no point; leaves like a hand of five to seven leaflets.' },
    ],
    use: 'cook',
    care: 'Gather fallen nuts; don’t beat the trees.',
    caution: 'Slit the shell before roasting or it bursts. Conkers are poisonous.',
  },
  {
    key: 'yarrow',
    name: 'Yarrow',
    latin: 'Achillea millefolium',
    library: 'yarrow',
    parts: 'Leaves, flowers',
    months: range(6, 9),
    when: 'Summer, when it flowers',
    where: 'Grassland, verges and lawns',
    know: 'Very finely divided, feathery leaves, and flat heads of tiny white or pink flowers on tough stems; strongly scented.',
    lookAlikes: [UMBELS],
    use: 'not-food',
    care: 'Common almost everywhere; take a few stems.',
    caution: 'Kept here for its lore and for drying, not for eating. Avoid in pregnancy; a daisy-family plant.',
  },
  {
    key: 'meadowsweet',
    name: 'Meadowsweet',
    latin: 'Filipendula ulmaria',
    library: 'meadowsweet',
    parts: 'Flowers',
    months: range(6, 8),
    when: 'High summer, when the creamy froth of flowers is open',
    where: 'Damp meadows, ditches and riverbanks',
    know: 'Tall reddish stems, leaves silvery beneath, and fluffy, almond-scented sprays of cream flowers.',
    lookAlikes: [{ ...UMBELS, tell: `${UMBELS.tell} Hemlock water dropwort grows in exactly these damp places.` }],
    use: 'not-food',
    care: 'Take a few heads from a good stand.',
    caution: 'It contains salicylates, related to aspirin: not for anyone sensitive to aspirin, on blood thinners, or for children.',
  },
  {
    key: 'mugwort',
    name: 'Mugwort',
    latin: 'Artemisia vulgaris',
    library: 'mugwort',
    parts: 'Leaves and flowering tops',
    months: range(6, 9),
    when: 'Summer, before and as it flowers',
    where: 'Waste ground, verges and riverbanks',
    know: 'Tall, purplish stems; deeply cut leaves dark green above and silvery-white and downy beneath; small brownish flowers.',
    lookAlikes: [{ name: 'Wormwood', danger: 'toxic', tell: 'Silvery on both sides and strongly bitter; harmful in quantity.', library: 'wormwood' }],
    use: 'not-food',
    care: 'Common on waste ground; cut a few stems.',
    caution: 'Dried for sachets and dream pillows in folk practice, not for eating. Avoid in pregnancy; a daisy-family plant that can trouble people with allergies.',
  },
  {
    key: 'red_clover',
    name: 'Red clover',
    latin: 'Trifolium pratense',
    library: 'red_clover',
    parts: 'Flower heads',
    months: range(5, 9),
    when: 'Summer, the fresh pink heads',
    where: 'Meadows and grassy places',
    know: 'Leaves of three leaflets, often with a pale chevron; round heads of pinkish-purple flowers.',
    lookAlikes: [],
    use: 'food',
    care: 'Bees love it; take a few heads here and there.',
    caution: 'Use fresh or properly dried flowers only; mouldy or fermenting clover is harmful. Ask a doctor first if pregnant or on blood thinners.',
  },
  {
    key: 'violet',
    name: 'Sweet violet',
    latin: 'Viola odorata',
    library: 'violet',
    parts: 'Flowers, young leaves',
    months: range(2, 4),
    when: 'Late winter and early spring',
    where: 'Hedge banks, woodland edges and old gardens',
    know: 'Heart-shaped leaves in a low clump, and small, scented, purple or white flowers.',
    lookAlikes: [],
    use: 'food',
    care: 'One of the first flowers for early bees. Pick only a few.',
    caution: 'Not the African violet, an unrelated houseplant.',
  },
  {
    key: 'pine',
    name: 'Pine needles',
    latin: 'Pinus sylvestris',
    library: 'pine',
    parts: 'Young needles, resin that has already seeped out',
    months: range(1, 12),
    when: 'All year; the soft new tips in late spring',
    where: 'Pine woods, heaths and parks',
    know: 'Needles in pairs (Scots pine), bundled in a little papery sheath; reddish bark high on the trunk.',
    lookAlikes: [
      { name: 'Yew', danger: 'deadly', tell: 'Flat needles, dark above and paler beneath, growing singly along the twig, often with red berry-like cones. Every part of yew is deadly except the red flesh.', library: 'yew' },
    ],
    use: 'cook',
    care: 'Take a few tips from a low branch; never cut the trunk for resin.',
    caution: 'Some pines and conifers that aren’t true pines are poisonous. Avoid in pregnancy.',
  },
  {
    key: 'birch',
    name: 'Birch leaves',
    latin: 'Betula pendula',
    library: 'birch',
    parts: 'Young leaves, fallen twigs',
    months: range(4, 5),
    when: 'The young, sticky leaves of spring',
    where: 'Heaths and light woodland',
    know: 'White, papery bark with dark marks; small, triangular, double-toothed leaves on drooping twigs.',
    lookAlikes: [],
    use: 'not-food',
    care: 'Birch sap is tapped in late winter by some, but only with the landowner’s permission and real skill: a careless tap harms the tree. A few leaves and fallen twigs are enough for most work.',
    caution: 'Kept here for its lore and besoms.',
  },
  {
    key: 'honeysuckle',
    name: 'Honeysuckle',
    latin: 'Lonicera periclymenum',
    library: 'honeysuckle',
    parts: 'Flowers, for scent',
    months: range(6, 9),
    when: 'Summer evenings, when the scent is strongest',
    where: 'Hedges and woods, climbing',
    know: 'A twining climber with oval leaves in pairs and trumpet flowers of cream and pink.',
    lookAlikes: [],
    use: 'not-food',
    care: 'Take a sprig or two.',
    caution: 'The red berries are poisonous. Gather the flowers for their scent only.',
  },
  {
    key: 'heather',
    name: 'Heather',
    latin: 'Calluna vulgaris',
    library: 'heather',
    parts: 'Flowering sprigs',
    months: range(8, 9),
    when: 'Late summer',
    where: 'Moor and heath',
    know: 'A low, woody shrub with tiny scale-like leaves and spikes of small purple flowers.',
    lookAlikes: [],
    use: 'not-food',
    care: 'Moorland is fragile and often protected. Take a single sprig, and never from a nature reserve.',
    caution: 'Kept here for its lore.',
  },
  {
    key: 'oak',
    name: 'Oak (acorns and leaves)',
    latin: 'Quercus robur',
    library: 'oak',
    parts: 'Fallen acorns, leaves, galls',
    months: range(9, 11),
    when: 'Autumn, as they fall',
    where: 'Woods, parks and hedgerow trees',
    know: 'Lobed leaves and acorns in little cups.',
    lookAlikes: [],
    use: 'not-food',
    care: 'Gather from the ground. Jays and squirrels plant the next oaks with what you leave.',
    caution: 'Raw acorns are bitter with tannins and upset the stomach; making them edible takes days of leaching, so they’re kept here for charms and the altar. Acorns are poisonous to dogs and horses.',
  },
  {
    key: 'juniper',
    name: 'Juniper berries',
    latin: 'Juniperus communis',
    library: 'juniper',
    parts: 'Ripe blue-black berries (cones)',
    months: range(9, 11),
    when: 'Autumn; they take two years to ripen, so green and blue grow together',
    where: 'Heaths, hillsides and chalk downland',
    know: 'A prickly shrub with stiff, sharp needles in threes, each with a white stripe above.',
    lookAlikes: [
      { name: 'Yew', danger: 'deadly', tell: 'Soft, flat needles growing singly, with red, not blue, fruits.', library: 'yew' },
      { name: 'Savin and other ornamental junipers', danger: 'toxic', tell: 'Scale-like leaves; common in gardens.' },
    ],
    use: 'cook',
    care: 'Wild juniper is declining in Britain, is a priority species for conservation, and grows on protected sites in many places. Buy dried berries rather than gathering.',
    caution: 'Avoid in pregnancy and with kidney trouble.',
  },
];

export const forageByKey = (key: string | null | undefined) => FORAGE_PLANTS.find((p) => p.key === key) ?? null;
/** The forage plants that are a Library herb or tree. */
export const forageForHerb = (herb: string | null | undefined) => (herb ? FORAGE_PLANTS.filter((p) => p.library === herb) : []);

/** What to gather in a local month (1–12), by name. */
export function forageInMonth(month: number, hemisphere: Hemisphere, plants: ForagePlant[] = FORAGE_PLANTS): ForagePlant[] {
  const m = northernMonth(month, hemisphere);
  return plants.filter((p) => p.months.includes(m)).sort((a, b) => a.name.localeCompare(b.name));
}

/** "Sep–Nov" in local months. */
export const forageSpan = (plant: ForagePlant, hemisphere: Hemisphere) => monthSpan(localMonths(plant.months, hemisphere));

/** The most dangerous look-alike, for a one-line warning. */
export function worstLookAlike(plant: ForagePlant): LookAlike | null {
  const order: Danger[] = ['deadly', 'toxic', 'mild'];
  return [...plant.lookAlikes].sort((a, b) => order.indexOf(a.danger) - order.indexOf(b.danger))[0] ?? null;
}

const fold = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '');

/** A forage plant matching a name or Library herb, for linking a patch or harvest. */
export function matchForage(name: string, herb?: string | null): ForagePlant | null {
  if (herb) {
    const byHerb = forageForHerb(herb);
    if (byHerb.length) return byHerb[0];
  }
  const q = fold(name).replace(/ies$/, 'y').replace(/(?<!s)s$/, '');
  if (q.length < 3) return null;
  return FORAGE_PLANTS.find((p) => fold(p.name).startsWith(q) || q.startsWith(fold(p.name.split(' (')[0])) || fold(p.key) === q) ?? null;
}

// ── What grows where ────────────────────────────────────────────────────────

export type PatchKind = 'wild' | 'planted' | 'self-sown';
export const PATCH_KINDS: { id: PatchKind; label: string }[] = [
  { id: 'wild', label: 'Growing wild' },
  { id: 'planted', label: 'Planted' },
  { id: 'self-sown', label: 'Self-sown' },
];

export type Patch = {
  name: string;
  /** Living Library herb or tree key. */
  herb: string | null;
  /** A forage plant key, when it is one. */
  forage: string | null;
  /** The land.places entry it grows at. */
  placeId: string | null;
  kind: PatchKind;
  /** Exactly where: "by the gate", "north edge of the wood". */
  spot: string;
  note: string;
};

export const blankPatch = (placeId: string | null = null): Patch => ({ name: '', herb: null, forage: null, placeId, kind: 'wild', spot: '', note: '' });

export function normalizePatch(raw: unknown): Patch {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Patch>;
  return {
    name: str(r.name).trim() || 'A plant',
    herb: str(r.herb) || null,
    forage: forageByKey(str(r.forage)) ? str(r.forage) : null,
    placeId: str(r.placeId) || null,
    kind: PATCH_KINDS.some((k) => k.id === r.kind) ? (r.kind as PatchKind) : 'wild',
    spot: str(r.spot),
    note: str(r.note),
  };
}

/** Patches grouped by place, in the order of the places given, then those with no place. */
export function patchesByPlace<T extends { id: string; data: Patch }>(patches: T[], placeIds: string[]): { placeId: string | null; patches: T[] }[] {
  const out = placeIds.map((placeId) => ({ placeId: placeId as string | null, patches: patches.filter((p) => p.data.placeId === placeId) }));
  const loose = patches.filter((p) => !p.data.placeId || !placeIds.includes(p.data.placeId));
  if (loose.length) out.push({ placeId: null, patches: loose });
  return out.filter((g) => g.patches.length).map((g) => ({ ...g, patches: [...g.patches].sort((a, b) => a.data.name.localeCompare(b.data.name)) }));
}

/** Your patches that can be gathered this local month. */
export function patchesInSeason<T extends { data: Patch }>(patches: T[], month: number, hemisphere: Hemisphere): T[] {
  const m = northernMonth(month, hemisphere);
  return patches.filter((p) => forageByKey(p.data.forage)?.months.includes(m));
}

// ── Harvests ────────────────────────────────────────────────────────────────

export type HarvestUse = 'kitchen' | 'drying' | 'apothecary' | 'offering' | 'altar' | 'gift';
export const HARVEST_USES: { id: HarvestUse; label: string }[] = [
  { id: 'kitchen', label: 'For the kitchen' },
  { id: 'drying', label: 'Drying to keep' },
  { id: 'apothecary', label: 'For a working in the apothecary' },
  { id: 'offering', label: 'As an offering' },
  { id: 'altar', label: 'For the altar' },
  { id: 'gift', label: 'To give away' },
];
export const harvestUseLabel = (id: string) => HARVEST_USES.find((u) => u.id === id)?.label ?? 'Gathered';

export type Harvest = {
  /** Local date, YYYY-MM-DD. */
  on: string;
  name: string;
  herb: string | null;
  forage: string | null;
  placeId: string | null;
  patchId: string | null;
  /** "Flowers", "a basket of berries". */
  part: string;
  amount: string;
  use: HarvestUse;
  /** Still in the store cupboard. */
  kept: boolean;
  /** When it went in a jar: dried, or made into something. */
  storedOn: string;
  note: string;
};

export const blankHarvest = (now: Date, input: Partial<Harvest> = {}): Harvest => ({
  on: localDateKey(now),
  name: '',
  herb: null,
  forage: null,
  placeId: null,
  patchId: null,
  part: '',
  amount: '',
  use: 'kitchen',
  kept: false,
  storedOn: '',
  note: '',
  ...input,
});

export function normalizeHarvest(raw: unknown): Harvest {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Harvest>;
  return {
    on: dateFromKey(str(r.on)) ? str(r.on) : localDateKey(new Date()),
    name: str(r.name).trim() || 'A harvest',
    herb: str(r.herb) || null,
    forage: forageByKey(str(r.forage)) ? str(r.forage) : null,
    placeId: str(r.placeId) || null,
    patchId: str(r.patchId) || null,
    part: str(r.part),
    amount: str(r.amount),
    use: HARVEST_USES.some((u) => u.id === r.use) ? (r.use as HarvestUse) : 'kitchen',
    kept: r.kept === true,
    storedOn: dateFromKey(str(r.storedOn)) ? str(r.storedOn) : '',
    note: str(r.note),
  };
}

/** The moon a harvest was gathered under. */
export const harvestMoon = (h: Harvest): PhaseName => moonOnDay(h.on);

/** "A basket of berries · Drying to keep · Waning Gibbous". */
export function harvestLine(h: Harvest): string {
  return [h.amount || h.part, harvestUseLabel(h.use), harvestMoon(h)].filter(Boolean).join(' · ');
}

/** Harvests newest first. */
export function sortHarvests<T extends { createdAt: string; data: Harvest }>(list: T[]): T[] {
  return [...list].sort((a, b) => (a.data.on === b.data.on ? (a.createdAt < b.createdAt ? 1 : -1) : a.data.on < b.data.on ? 1 : -1));
}

/** The store cupboard: what's kept, oldest first (use it first). */
export function storeCupboard<T extends { createdAt: string; data: Harvest }>(list: T[]): T[] {
  return sortHarvests(list.filter((h) => h.data.kept)).reverse();
}

/** Months a dried herb has been in the cupboard, for a gentle "use it soon" (most keep their best for about a year). */
export function monthsKept(h: Harvest, now: Date): number | null {
  const from = dateFromKey(h.storedOn || h.on);
  if (!from) return null;
  return (now.getFullYear() - from.getFullYear()) * 12 + now.getMonth() - from.getMonth();
}

/** A Library herb's name, for the harvest and patch screens. */
export const plantHerbName = (key: string | null | undefined) => herbName(key);
