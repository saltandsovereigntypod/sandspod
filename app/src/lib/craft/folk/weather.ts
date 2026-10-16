// Weather lore: old sayings for each month of the northern year, and a few
// for any time, each with a plain note on whether the weather bears it out.
// The sayings are traditional and public domain; the notes are written for
// the app from what meteorologists have said about them. Pure, so it can be tested.

export type Verdict = 'sound' | 'partly' | 'no';

export const VERDICT_LABEL: Record<Verdict, string> = {
  sound: 'Holds up',
  partly: 'A grain of truth',
  no: 'Not borne out',
};

export type WeatherSaying = { saying: string; note: string; verdict: Verdict };

/** Sayings for any month. */
export const ANY_MONTH: WeatherSaying[] = [
  {
    saying: 'Red sky at night, shepherd’s delight; red sky in the morning, shepherd’s warning.',
    verdict: 'sound',
    note: 'Where weather comes mostly from the west, as in Britain and Ireland, a red sunset means clear sky to the west lighting up dust and cloud overhead: fair weather is on its way. A red sunrise means the clear air has passed east and cloud is arriving behind it. Least reliable in summer and where weather comes from other directions.',
  },
  {
    saying: 'Mackerel sky and mares’ tails make lofty ships carry low sails.',
    verdict: 'sound',
    note: 'Wispy cirrus (mares’ tails) and rippled cirrocumulus (mackerel sky) often run ahead of a warm front, so wind and rain commonly follow within a day or so.',
  },
  {
    saying: 'When halo rings the moon or sun, rain’s approaching on the run.',
    verdict: 'sound',
    note: 'A halo is light bent by ice crystals in thin, high cirrostratus cloud, which often thickens ahead of a front. Rain follows more often than not, though not always.',
  },
  {
    saying: 'Clear moon, frost soon.',
    verdict: 'sound',
    note: 'A clear sky lets the ground lose its heat to space overnight, so in the cold months clear, still nights are the frosty ones.',
  },
  {
    saying: 'Rain before seven, fine before eleven.',
    verdict: 'partly',
    note: 'A band of frontal rain often passes in a few hours, so early rain clearing by late morning is common in Britain. It’s a tendency, not a rule; slow fronts can rain all day.',
  },
  {
    saying: 'Swallows high, staying dry; swallows low, wet will blow.',
    verdict: 'partly',
    note: 'Swallows follow the insects they eat. In settled weather, warm rising air lifts insects high; in damp, unsettled air they stay nearer the ground. A fair short-range sign.',
  },
  {
    saying: 'Cows lie down before the rain.',
    verdict: 'no',
    note: 'Cows lie down to chew the cud, rest or keep warm, whatever the forecast. Studies have found no useful link with rain.',
  },
];

/** Sayings for each month, January (index 0) to December (11), for the northern year. */
export const BY_MONTH: WeatherSaying[][] = [
  // January
  [
    {
      saying: 'As the day lengthens, so the cold strengthens.',
      verdict: 'sound',
      note: 'The land and sea keep losing stored warmth for weeks after the winter solstice, so the coldest weather in Britain usually comes in January and February even as the days draw out.',
    },
    {
      saying: 'If the grass grows in Janiveer, it grows the worse for all the year.',
      verdict: 'no',
      note: 'A mild January says little about the rest of the year. There is a real risk that early growth gets nipped by later frost, which may be what the saying remembers.',
    },
    {
      saying: 'A January spring is worth nothing.',
      verdict: 'partly',
      note: 'A mild spell in January rarely lasts, and cold often returns. True as a caution not to trust it, not as a forecast.',
    },
    {
      saying: 'If January calends be summerly gay, ’twill be winterly weather till the calends of May.',
      verdict: 'no',
      note: 'The weather on 1 January has no measurable link with the spring to come.',
    },
  ],
  // February
  [
    {
      saying: 'If Candlemas Day be fair and bright, winter will have another flight; if Candlemas Day be clouds and rain, winter is gone and won’t come again.',
      verdict: 'no',
      note: 'One day’s weather can’t foretell six weeks. The American groundhog version, from the same European root, has been checked against records and does no better than chance.',
    },
    {
      saying: 'February fill-dyke, be it black or be it white.',
      verdict: 'partly',
      note: 'February isn’t usually the wettest month in Britain, but after a winter’s rain the ground is soaked and little water evaporates, so ditches fill with whatever falls, rain (black) or snow (white).',
    },
    {
      saying: 'When the wind’s in the east on Candlemas Day, there it will stick till the second of May.',
      verdict: 'no',
      note: 'Winds change with each passing weather system. Easterlies are more common in late winter and spring, which may be the kernel, but not for three months running.',
    },
    {
      saying: 'There is always one fine week in February.',
      verdict: 'partly',
      note: 'High pressure often builds for a spell in late winter, bringing crisp, dry days. Often true, never promised.',
    },
  ],
  // March
  [
    {
      saying: 'March comes in like a lion and goes out like a lamb.',
      verdict: 'partly',
      note: 'On average March does grow milder and calmer as it goes, but any given year can be the other way round. No use as a forecast.',
    },
    {
      saying: 'A peck of March dust is worth a king’s ransom.',
      verdict: 'sound',
      note: 'A farming truth rather than a forecast: dry soil in March lets you work the land and sow on time, which was worth a great deal.',
    },
    {
      saying: 'So many mists in March, so many frosts in May.',
      verdict: 'no',
      note: 'Fog in March is no guide to frost two months later.',
    },
    {
      saying: 'March winds and April showers bring forth May flowers.',
      verdict: 'partly',
      note: 'Spring is often windy and April showery, and both dry and water the ground before growth takes off. As a description of the season it’s fair.',
    },
  ],
  // April
  [
    {
      saying: 'April showers.',
      verdict: 'sound',
      note: 'In spring the sun heats the ground strongly while the air aloft is still cold, which makes the air unstable and builds quick showers, often with sunshine between.',
    },
    {
      saying: 'Oak before ash, we’re in for a splash; ash before oak, we’re in for a soak.',
      verdict: 'no',
      note: 'Leafing follows the spring temperature, not the summer to come. Oak leafs out with warmth, so in warmer springs, now most of them, oak comes first; there’s no link with the summer’s rain.',
    },
    {
      saying: 'A cold April the barn will fill.',
      verdict: 'partly',
      note: 'A cool April holds blossom and growth back until frosts are less likely, which can spare the crop. Not a reliable rule.',
    },
    {
      saying: 'When April blows his horn, ’tis good for both hay and corn.',
      verdict: 'partly',
      note: 'The horn is thunder. Spring thunderstorms come with warmth and moisture, both good for growth, but they say nothing about the harvest.',
    },
  ],
  // May
  [
    {
      saying: 'Ne’er cast a clout till May be out.',
      verdict: 'sound',
      note: 'Don’t shed a layer of clothes (a clout) too soon. Whether “May” means the month or the hawthorn blossom, frosts and cold snaps can come into late May, so the caution is sound.',
    },
    {
      saying: 'A swarm of bees in May is worth a load of hay; a swarm in June is worth a silver spoon; a swarm in July is not worth a fly.',
      verdict: 'sound',
      note: 'A beekeeping truth: an early swarm has the whole summer to build comb and store honey; a late one may not survive the winter.',
    },
    {
      saying: 'Mist in May and heat in June make the harvest come right soon.',
      verdict: 'partly',
      note: 'Moisture in late spring and warmth in early summer are what crops want. A description of a good year, not a forecast of one.',
    },
    {
      saying: 'Who shears his sheep before St Gervase’s Day (19 June) loves more his wool than his sheep.',
      verdict: 'sound',
      note: 'Cold snaps in late May and early June can chill newly shorn sheep, so waiting was good husbandry.',
    },
  ],
  // June
  [
    {
      saying: 'Barnaby bright, Barnaby bright, the longest day and the shortest night.',
      verdict: 'partly',
      note: 'St Barnabas’ Day, 11 June, really was the solstice under the old Julian calendar, which by Tudor times had drifted about ten days. Since 1752 the longest day falls around 21 June.',
    },
    {
      saying: 'When the dew is on the grass, rain will never come to pass.',
      verdict: 'sound',
      note: 'Heavy dew forms on clear, calm nights, which go with high pressure, so a dewy morning usually means a dry day. When the grass is dry at dawn, cloud or wind kept it so, and rain is more likely.',
    },
    {
      saying: 'A dripping June sets all in tune.',
      verdict: 'partly',
      note: 'Rain in June feeds growing crops and grass at the time they most need it. Good for the farm, not a forecast.',
    },
    {
      saying: 'If on the eighth of June it rain, it foretells a wet harvest.',
      verdict: 'no',
      note: 'No single day sets the summer.',
    },
  ],
  // July
  [
    {
      saying: 'St Swithin’s Day, if thou dost rain, for forty days it will remain; St Swithin’s Day, if thou be fair, for forty days ’twill rain nae mair.',
      verdict: 'partly',
      note: 'Forty days of rain after a wet 15 July has never been recorded. The kernel: by mid-July the jet stream often settles into a pattern that can last for weeks, so the weather around then can be a fair guide to the rest of the summer.',
    },
    {
      saying: 'The dog days.',
      verdict: 'partly',
      note: 'The hot, sultry weeks of July and August, named because Sirius, the Dog Star, rose with the sun then in ancient times. The heat is real; the star has nothing to do with it, and it now rises later.',
    },
    {
      saying: 'If the first of July be rainy weather, it will rain more or less for four weeks together.',
      verdict: 'no',
      note: 'One day is no guide to a month.',
    },
    {
      saying: 'Ants busy, rain coming.',
      verdict: 'partly',
      note: 'Flying ants swarm on warm, humid, still days, which also bring thundery showers. They’re responding to the same conditions, not foreseeing them.',
    },
  ],
  // August
  [
    {
      saying: 'Dry August and warm doth harvest no harm.',
      verdict: 'sound',
      note: 'Dry, warm weather ripens grain and lets it be cut and brought in without rotting. Good farming sense.',
    },
    {
      saying: 'St Bartholomew brings the cold dew.',
      verdict: 'sound',
      note: 'By 24 August nights are noticeably longer and cooler, so dew is heavier and the first chilly mornings arrive. A true marker of summer’s turn.',
    },
    {
      saying: 'If the first week in August is unusually warm, the winter will be white and long.',
      verdict: 'no',
      note: 'Summer warmth tells us nothing about the winter ahead.',
    },
    {
      saying: 'When the wind is in the east, ’tis neither good for man nor beast.',
      verdict: 'partly',
      note: 'In Britain an east wind comes off the continent: biting in winter and spring, sometimes sticky in summer. Fair as a grumble, not a forecast.',
    },
  ],
  // September
  [
    {
      saying: 'September blow soft till the fruit’s in the loft.',
      verdict: 'sound',
      note: 'A wish rather than a forecast: autumn gales bring fruit down before it can be picked and stored. The first big autumn storms often come late in the month.',
    },
    {
      saying: 'Fair on the first of September, fair for the month.',
      verdict: 'no',
      note: 'No day sets a month’s weather, though September is often settled in Britain.',
    },
    {
      saying: 'Long foretold, long last; short notice, soon past.',
      verdict: 'partly',
      note: 'Weather that arrives slowly, with high cloud thickening over a day, usually comes from a large, slow system that lingers. A sudden squall tends to be a small, quick one. A fair rule of thumb as autumn storms begin.',
    },
    {
      saying: 'St Michael’s little summer.',
      verdict: 'partly',
      note: 'A warm, settled spell around Michaelmas (29 September) happens in many years as high pressure builds, though not in all.',
    },
  ],
  // October
  [
    {
      saying: 'St Luke’s little summer.',
      verdict: 'partly',
      note: 'A short spell of calm, mild, sunny weather around St Luke’s Day (18 October) is common enough to have earned a name. Not every year.',
    },
    {
      saying: 'Many haws, many snows.',
      verdict: 'no',
      note: 'A heavy crop of haws or berries reflects the spring and summer just gone, a good flowering and no late frost, not the winter to come.',
    },
    {
      saying: 'If ducks do slide at Hollantide, at Christmas they will swim.',
      verdict: 'partly',
      note: 'Hollantide is All Saints, 1 November. An early cold snap is often followed by milder weather. A tendency, not a rule.',
    },
    {
      saying: 'Much rain in October, much wind in December.',
      verdict: 'no',
      note: 'An active autumn says little about the storms two months on.',
    },
  ],
  // November
  [
    {
      saying: 'If there’s ice in November that will bear a duck, there’ll be nothing after but sludge and muck.',
      verdict: 'no',
      note: 'A cold November isn’t followed by a mild winter any more often than chance. There’s no link either way.',
    },
    {
      saying: 'St Martin’s summer.',
      verdict: 'partly',
      note: 'A mild, still spell around Martinmas (11 November) does sometimes happen when high pressure settles, and is known across Europe. Not reliable.',
    },
    {
      saying: 'Onion skins very thin, mild winter coming in; onion skins thick and tough, coming winter cold and rough.',
      verdict: 'no',
      note: 'Plants respond to the season they grew in, not the one ahead.',
    },
    {
      saying: 'As November, so the following March.',
      verdict: 'no',
      note: 'No measurable link.',
    },
  ],
  // December
  [
    {
      saying: 'A green Christmas makes a fat churchyard.',
      verdict: 'no',
      note: 'Cold winters, not mild ones, are the harder on health. The saying may come from damp mild winters in poor housing, but today’s records point the other way.',
    },
    {
      saying: 'If ice will bear a man before Christmas, it will not bear a mouse after.',
      verdict: 'partly',
      note: 'Early cold snaps are often followed by milder spells. It’s a tendency at most.',
    },
    {
      saying: 'Frost on the shortest day indicates a severe winter.',
      verdict: 'no',
      note: 'One frost says nothing about what follows. The worst cold usually comes after the solstice either way.',
    },
    {
      saying: 'If the sun shines through the apple trees on Christmas Day, there will be a fine crop.',
      verdict: 'no',
      note: 'Apple crops depend on spring frosts, pollinators and the summer, not on a winter day’s sun.',
    },
  ],
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Month name (0–11). */
export const monthName = (m: number) => MONTH_NAMES[((m % 12) + 12) % 12];

/**
 * The month of sayings that fits where you are. North of the equator it is
 * this month; south of it, the month six away, so the season matches.
 */
export function seasonalMonth(month: number, latitude: number | null | undefined): number {
  return latitude !== null && latitude !== undefined && latitude < 0 ? (month + 6) % 12 : month;
}
