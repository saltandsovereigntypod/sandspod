// The folk calendar: old customs of Britain, Ireland and wider Europe through
// the year, with where they were kept, what people did, and a way to keep
// each one now. Movable feasts are counted from Easter; others fall on a
// fixed day, a weekday rule, or "the last Tuesday of January" and the like.
// Written for the app, drawing on standard folklore references (Hutton's
// The Stations of the Sun, Chambers' Book of Days, Roud's The English Year).
// Pure, so it can be tested.

import { startOfDay } from '../../calendar.ts';
import { easterSunday } from '../../holidays.ts';

export type CustomRule =
  /** A fixed day (month 1–12). `move` shifts it by days when it falls on a given weekday (0 = Sunday). */
  | { kind: 'fixed'; month: number; day: number; move?: Partial<Record<number, number>> }
  /** Days before (negative) or after Western Easter Sunday. */
  | { kind: 'easter'; offset: number }
  /** The first `weekday` on or after day `from` of `month`. */
  | { kind: 'weekday'; month: number; from: number; weekday: number }
  /** The last `weekday` of `month`. */
  | { kind: 'lastWeekday'; month: number; weekday: number };

export type FolkCustom = {
  id: string;
  name: string;
  rule: CustomRule;
  /** How many days it runs, when more than one. */
  days?: number;
  region: string;
  /** What people did, in a few sentences. */
  did: string;
  /** A way to keep it now. */
  keep: string;
  /** How the date is reckoned, when it isn't obvious. */
  when?: string;
  /** A premade working that suits it (lib/rituals/premade id). */
  premade?: string;
  /** Anything to take care with. */
  care?: string;
};

export const FOLK_CUSTOMS: FolkCustom[] = [
  // ─── January ───
  {
    id: 'calennig',
    name: 'Calennig',
    rule: { kind: 'fixed', month: 1, day: 1 },
    region: 'Wales',
    did: 'On New Year’s morning children went door to door before noon, singing a verse and carrying an apple stuck with cloves and oats on three hazel sticks, and were given coins, bread or mince pies for the luck they brought.',
    keep: 'Make a clove-studded apple for your table as a wish for a sweet and fruitful year, and give a small New Year gift to a neighbour.',
  },
  {
    id: 'twelfth-night-wassail',
    name: 'Twelfth Night wassailing',
    rule: { kind: 'fixed', month: 1, day: 5 },
    region: 'England: the cider counties (Somerset, Devon, Herefordshire, Kent)',
    did: 'Households carried a bowl of hot spiced ale or cider, lambswool, from house to house, toasting health. In the orchards the oldest apple tree was toasted, cider poured on its roots, toast soaked in it hung in its branches for the robins, and noise made to wake the tree and scare off harm.',
    keep: 'Warm some cider or apple juice with spices, take it out to a tree you love, pour a little at its roots and hang a piece of toast in its branches for the birds. Sing or say a blessing for a good year.',
    when: 'Twelfth Night is usually the evening of 5 January; some places keep it on the 6th.',
  },
  {
    id: 'epiphany-chalking',
    name: 'Epiphany and the blessing of doors',
    rule: { kind: 'fixed', month: 1, day: 6 },
    region: 'Central Europe: Germany, Austria, Poland, the Czech lands',
    did: 'At Epiphany, Old Christmas, the door lintel is chalked with the year and the initials C+M+B for the Magi (also read as “Christus mansionem benedicat”, Christ bless this house). Carol singers dressed as the three kings go round collecting for charity.',
    keep: 'Chalk the year and a sign of blessing above your door, and sweep the threshold as you do it.',
    premade: 'folk-epiphany-chalk',
  },
  {
    id: 'befana',
    name: 'La Befana',
    rule: { kind: 'fixed', month: 1, day: 5 },
    region: 'Italy',
    did: 'On the night before Epiphany an old woman on a broomstick comes down the chimney, filling the stockings of good children with sweets and of naughty ones with coal, and sweeping the floor as she leaves.',
    keep: 'Sweep the house out on the eve of Epiphany to close the old year, and leave a little wine and something sweet by the hearth or the stove.',
  },
  {
    id: 'haxey-hood',
    name: 'The Haxey Hood',
    rule: { kind: 'fixed', month: 1, day: 6, move: { 0: -1 } },
    region: 'Haxey, Lincolnshire, England',
    did: 'A rough, slow, good-humoured struggle across the fields between villages to carry a leather “hood” to one of the local pubs, led by the Lord, the Boggins and the Fool, who is “smoked” over a fire before giving his speech. The story says it began when a lady’s hood was blown away in the 1300s.',
    keep: 'Look for an old local custom near you and go and watch it. Many survive only because people keep turning up.',
    when: '6 January; when that’s a Sunday, the Saturday before.',
  },
  {
    id: 'distaff-day',
    name: 'St Distaff’s Day',
    rule: { kind: 'fixed', month: 1, day: 7 },
    region: 'England',
    did: 'The day after Twelfth Day, when women went back to their spinning after the holidays. Men were said to set the flax alight in fun, and the women to throw water back at them.',
    keep: 'Pick up a piece of handwork you put down over the winter holidays: knitting, mending, spinning, a craft project, a page of writing.',
  },
  {
    id: 'plough-monday',
    name: 'Plough Monday',
    rule: { kind: 'weekday', month: 1, from: 7, weekday: 1 },
    region: 'England, especially the East Midlands and East Anglia',
    did: 'The start of the farming year after Christmas. Ploughboys dragged a decorated plough around the parish, often in disguise with blackened faces, collecting money; those who refused might have their doorstep ploughed up. A plough light was kept burning in the church, and Molly dancers and plough plays went with it.',
    keep: 'Begin something real this week: clear a garden bed, sort seeds, or set out your plans for the year. Bless your tools.',
    when: 'The first Monday after Twelfth Day (6 January).',
  },
  {
    id: 'tjugondag-knut',
    name: 'Tjugondag Knut',
    rule: { kind: 'fixed', month: 1, day: 13 },
    region: 'Sweden and Finland',
    did: 'The twentieth day after Christmas, when Christmas is “danced out”: the tree is stripped of its sweets and decorations and thrown out, often with a party.',
    keep: 'Take down the last of the winter greenery with thanks, and burn or compost it rather than binning it.',
  },
  {
    id: 'old-twelvy',
    name: 'Old Twelvy wassail',
    rule: { kind: 'fixed', month: 1, day: 17 },
    region: 'Somerset and the West Country, England (Carhampton and elsewhere)',
    did: 'Many orchards kept to the old calendar after Britain changed it in 1752, so their wassail falls on Old Twelfth Night, 17 January. Carhampton still wassails its orchard on this night with shotguns fired through the branches.',
    keep: 'If you missed Twelfth Night, wassail now: toast a tree, pour cider or apple juice at its roots and hang toast for the robins.',
  },
  {
    id: 'st-agnes-eve',
    name: 'St Agnes’ Eve',
    rule: { kind: 'fixed', month: 1, day: 20 },
    region: 'England and Scotland',
    did: 'A night of love divination. Young women fasted, went to bed without looking behind them, and hoped to dream of their future husband; some ate a salted cake in silence. Keats’s poem The Eve of St Agnes made the custom famous.',
    keep: 'Go to bed in silence with a question you want answered and write down what you dream in the morning.',
    premade: 'hedge-dream-pillow',
  },
  {
    id: 'up-helly-aa',
    name: 'Up Helly Aa',
    rule: { kind: 'lastWeekday', month: 1, weekday: 2 },
    region: 'Lerwick, Shetland, Scotland',
    did: 'A fire festival begun in Victorian times, out of older Yule tar-barrel customs. The Jarl’s squad in Norse dress lead hundreds of torch-bearers through the town and throw their torches into a replica Viking galley, then the halls dance all night.',
    keep: 'Light a fire or a candle in the deep of winter for the courage to see it out. Burn a written list of what you’re done with.',
    when: 'The last Tuesday of January.',
    care: 'Burn paper only in a fireproof dish or outdoor fire, never indoors on an open flame.',
  },
  // ─── February ───
  {
    id: 'brigids-day',
    name: 'St Brigid’s Day',
    rule: { kind: 'fixed', month: 2, day: 1 },
    region: 'Ireland, and the Highlands and Islands of Scotland',
    did: 'On Brigid’s Eve rushes were pulled (never cut) to weave crosses hung over doors and in byres for the year. A cloth or ribbon, the brat Bríde, was left outside overnight to take her blessing and was used for healing. In Scotland the Brideog doll was made and given a bed by the fire.',
    keep: 'Weave a Brigid’s cross from rushes or reeds, leave a strip of cloth outside overnight and keep it for times of illness or worry.',
    premade: 'folk-brigid-cross-well',
  },
  {
    id: 'candlemas',
    name: 'Candlemas',
    rule: { kind: 'fixed', month: 2, day: 2 },
    region: 'Britain, Ireland and across Europe',
    did: 'The church’s candles for the year were blessed and taken home for protection in storms and at deathbeds. The last of the Christmas greenery had to be gone by Candlemas Eve, or goblins would come. The day’s weather was watched closely: a fine Candlemas meant more winter to come.',
    keep: 'Bless the candles you will use this year and clear away the last of the winter decorations. Note the weather, and see if the old saying holds.',
    premade: 'folk-candlemas-candles',
  },
  {
    id: 'valentines-eve',
    name: 'St Valentine’s Eve and Jack Valentine',
    rule: { kind: 'fixed', month: 2, day: 13 },
    region: 'England (Norfolk for Jack Valentine)',
    did: 'Love divinations on the eve: pinning bay leaves to the pillow to dream of a sweetheart, or watching for the first person you saw in the morning. In Norfolk, a mysterious Jack Valentine knocked on doors after dark and left little gifts on the step, vanishing before anyone could see him.',
    keep: 'Leave an anonymous kindness on someone’s doorstep.',
  },
  {
    id: 'fat-thursday',
    name: 'Fat Thursday (Tłusty Czwartek)',
    rule: { kind: 'easter', offset: -52 },
    region: 'Poland, and as Fettdonnerstag in parts of Germany',
    did: 'The last Thursday before Lent, when everyone eats pączki (rich filled doughnuts) and faworki. An old saying warns that whoever eats no doughnut today will have no luck in the year.',
    keep: 'Use up the rich things in your cupboard before a season of simpler eating, and share them.',
    when: 'The Thursday before Ash Wednesday.',
  },
  {
    id: 'busojaras',
    name: 'Busójárás',
    rule: { kind: 'easter', offset: -52 },
    days: 6,
    region: 'Mohács, Hungary',
    did: 'Men in horned wooden masks and sheepskins, the busós, roar through the town with rattles and cowbells to scare winter away, ending with a great bonfire on the last night before Lent.',
    keep: 'Make a racket to see winter out: bang pots at dusk, and light a fire or candle for spring.',
    when: 'The six days before Lent, ending on Shrove Tuesday.',
  },
  {
    id: 'shrove-tuesday',
    name: 'Shrove Tuesday',
    rule: { kind: 'easter', offset: -47 },
    region: 'England, Ireland and widely as Carnival, Fasching, Mardi Gras',
    did: 'The last day before Lent, for confessing (being “shriven”) and using up eggs, butter and fat: hence pancakes. A pancake bell rang at noon; there were pancake races (Olney in Buckinghamshire still runs one), and huge rough-and-tumble Shrovetide football games between parishes, as still at Ashbourne in Derbyshire.',
    keep: 'Make pancakes, and as you toss each one name something you are ready to let go of over the coming weeks.',
    when: '47 days before Easter.',
  },
  // ─── March ───
  {
    id: 'martisor',
    name: 'Mărțișor and Martenitsa',
    rule: { kind: 'fixed', month: 3, day: 1 },
    region: 'Romania, Moldova and Bulgaria',
    did: 'On 1 March people give each other red and white twisted threads, worn on the wrist or chest for health through spring. In Bulgaria the Martenitsa is taken off when you see the first stork or a tree in blossom, and tied to its branches.',
    keep: 'Twist red and white thread together, wear it, and tie it to a blossoming tree when spring truly arrives.',
  },
  {
    id: 'st-davids-day',
    name: 'St David’s Day',
    rule: { kind: 'fixed', month: 3, day: 1 },
    region: 'Wales',
    did: 'The feast of Wales’s patron saint: leeks and daffodils worn, cawl and Welsh cakes eaten, and children in traditional dress. David’s last words, “do the little things”, are often remembered.',
    keep: 'Do the little things: one small kindness, one small repair, and a bunch of daffodils for the table.',
  },
  {
    id: 'mothering-sunday',
    name: 'Mothering Sunday',
    rule: { kind: 'easter', offset: -21 },
    region: 'England and Ireland',
    did: 'On the fourth Sunday of Lent people went back to their “mother church”, and servants were given the day off to visit home, often taking flowers picked on the way or a simnel cake.',
    keep: 'Visit, or call, the people who mothered you, and the place you come from. Leave wildflowers or a cake.',
    when: 'The fourth Sunday of Lent, three weeks before Easter.',
  },
  {
    id: 'st-patricks-day',
    name: 'St Patrick’s Day',
    rule: { kind: 'fixed', month: 3, day: 17 },
    region: 'Ireland, and the Irish everywhere',
    did: 'Shamrock was worn, and at the end of the day it was “drowned” in the last drink. The day was a break in the Lenten fast and, in the countryside, the day to start sowing potatoes.',
    keep: 'Wear a sprig of green, and plant something, even one seed in a pot.',
  },
  {
    id: 'marzanna',
    name: 'Drowning of Marzanna',
    rule: { kind: 'fixed', month: 3, day: 21 },
    region: 'Poland, Czech Republic, Slovakia',
    did: 'A straw effigy of Marzanna, winter and death, is dressed in rags, carried out of the village, set alight and thrown into the river, and people walk home without looking back. Then a green branch, the gaik, is brought in for spring.',
    keep: 'Make a small figure from straw or paper for what winter held, and let it go on moving water (with nothing that won’t break down), then bring a green branch indoors.',
    when: 'Once on a Sunday in mid-Lent; since the 20th century usually 21 March, the first day of spring.',
    care: 'Only put natural, unpainted straw and string into water, and never light anything near dry grass.',
  },
  {
    id: 'lady-day',
    name: 'Lady Day',
    rule: { kind: 'fixed', month: 3, day: 25 },
    region: 'England, Wales and Ireland',
    did: 'The feast of the Annunciation and a quarter day, when rents fell due, farm tenancies began and ended and labourers moved to new places. Until 1752 the English legal year began today, and the UK tax year still starts on 6 April, Old Lady Day.',
    keep: 'A good day to settle accounts, pay what is owed and make a fresh start on a household plan.',
  },
  // ─── April ───
  {
    id: 'hunt-the-gowk',
    name: 'April Fools and Hunt-the-Gowk',
    rule: { kind: 'fixed', month: 4, day: 1 },
    region: 'Britain; Scotland’s Hunt-the-Gowk (the cuckoo)',
    did: 'Tricks and fool’s errands until noon. In Scotland a “gowk” was sent with a note to deliver that read “hunt the gowk another mile”, and so passed from house to house.',
    keep: 'Let yourself be a little foolish. Laughter is good spring medicine.',
  },
  {
    id: 'flowering-sunday',
    name: 'Palm Sunday and Flowering Sunday',
    rule: { kind: 'easter', offset: -7 },
    region: 'Wales (Sul y Blodau), Britain, Poland and across Europe',
    did: 'Palms, or in Britain willow catkins and yew (“palm”), were blessed and kept in the house through the year for protection. In Wales and parts of England families cleaned and decorated the graves of their dead with flowers.',
    keep: 'Take flowers to a family grave, or set some by a photo of someone you’ve lost. Keep a sprig of green over the door.',
    when: 'The Sunday before Easter.',
  },
  {
    id: 'good-friday',
    name: 'Good Friday buns and planting',
    rule: { kind: 'easter', offset: -2 },
    region: 'England and Ireland',
    did: 'Hot cross buns baked today were said never to go mouldy, and one was hung in the kitchen for the year against fire and illness. It was a lucky day to plant potatoes and parsley, since the devil had no power over the ground today.',
    keep: 'Bake or buy hot cross buns and hang one up to dry for the year. Sow parsley.',
    when: 'The Friday before Easter.',
  },
  {
    id: 'pace-egging',
    name: 'Pace-egging and egg rolling',
    rule: { kind: 'easter', offset: 1 },
    region: 'Northern England and Scotland',
    did: 'Eggs were dyed with onion skins and flowers, and rolled down hills, as still in Preston’s Avenham Park. Pace-eggers in costume performed a mummers’ play door to door for eggs and coins.',
    keep: 'Dye eggs with onion skins and leaves pressed against them, then roll them down a hill. The furthest goes the luckiest.',
    when: 'Easter Monday (and Easter weekend).',
  },
  {
    id: 'smigus-dyngus',
    name: 'Śmigus-dyngus',
    rule: { kind: 'easter', offset: 1 },
    region: 'Poland, and as Oblévačka in Czech and Slovak lands',
    did: 'Wet Monday: everyone drenches everyone else with water, from buckets to water pistols, for health and as a spring cleansing. In some places boys switch girls with willow wands.',
    keep: 'Sprinkle your doorstep and your plants with fresh water at dawn as a spring cleansing.',
    when: 'Easter Monday.',
  },
  {
    id: 'walpurgis',
    name: 'Walpurgis Night',
    rule: { kind: 'fixed', month: 4, day: 30 },
    region: 'Germany, Scandinavia (Valborg), the Czech lands, Finland (Vappu)',
    did: 'The night before May Day, when witches were said to fly to the Brocken in the Harz mountains. Bonfires were lit and noise made to drive them away; in Sweden, Valborg bonfires and songs still welcome the spring.',
    keep: 'Light a fire or candle at dusk and sing the spring in, then go out at dawn for the May.',
  },
  // ─── May ───
  {
    id: 'may-day',
    name: 'May Day and the May dew',
    rule: { kind: 'fixed', month: 5, day: 1 },
    region: 'Britain and Ireland',
    did: 'Young people went “a-Maying” before dawn to gather hawthorn blossom and green boughs, and girls washed their faces in May dew for beauty. Maypoles were raised and garlands carried round. In Ireland, May Eve was a night to guard butter, milk and the well against those who would steal the luck.',
    keep: 'Go out before sunrise and wash your face in the dew. Bring in a green branch, but leave the blossom on the hawthorn: it was unlucky indoors.',
    premade: 'folk-bealtaine-dew',
  },
  {
    id: 'padstow-oss',
    name: 'Padstow ’Obby ’Oss',
    rule: { kind: 'fixed', month: 5, day: 1, move: { 0: 1 } },
    region: 'Padstow, Cornwall, England',
    did: 'Two ’Osses, the Old and the Blue Ribbon, each a dancer in a great black hoop-frame with a fierce mask, dance through the town all day, led by a Teaser and followed by the Mayers singing the Night Song and the Day Song. The town is decked in greenery the night before.',
    keep: 'Deck your door with fresh green on May Eve, and sing to bring the summer in.',
    when: '1 May; when that’s a Sunday, 2 May.',
  },
  {
    id: 'helston-flora',
    name: 'Flora Day',
    rule: { kind: 'fixed', month: 5, day: 8, move: { 0: -1, 1: -2 } },
    region: 'Helston, Cornwall, England',
    did: 'The Furry Dance through the streets, in and out of houses and gardens, from early morning, with lily-of-the-valley worn. The Hal-an-Tow pageant sings of St George, St Michael and the summer coming in.',
    keep: 'Dance through your own house, front door to back, to bring the summer in.',
    when: '8 May, unless that’s a Sunday or Monday, when it moves to the Saturday before.',
  },
  {
    id: 'rogationtide',
    name: 'Rogationtide and beating the bounds',
    rule: { kind: 'easter', offset: 35 },
    days: 5,
    region: 'England and Wales',
    did: 'The parish walked its boundaries with the priest, praying over the crops, stopping at boundary stones and marker trees. Boys were bumped against the stones or ducked in streams so they would remember the bounds when they were old.',
    keep: 'Walk the edges of your place, your garden, street or village, and greet its markers: old trees, stones, streams. Notice who lives there.',
    when: 'Rogation Sunday (five weeks after Easter) to Ascension Day.',
    premade: 'hedge-hearing-the-land-walk',
  },
  {
    id: 'well-dressing',
    name: 'Well dressing',
    rule: { kind: 'easter', offset: 39 },
    region: 'Derbyshire and Staffordshire, England',
    did: 'Wells and springs are decorated with great boards of wet clay pressed with flower petals, seeds, bark and moss into pictures, in thanks for clean water. Tissington’s dressing begins on Ascension Day; other villages follow through the summer.',
    keep: 'Visit a spring or well, clear any litter, and leave a few petals (not plastic or coins) in thanks for water.',
    when: 'Tissington’s begins on Ascension Day, 39 days after Easter.',
    premade: 'folk-brigid-cross-well',
  },
  {
    id: 'whitsun',
    name: 'Whitsun greenery and Whit walks',
    rule: { kind: 'easter', offset: 49 },
    region: 'Northern England (Whit walks), Poland (Zielone Świątki), Germany',
    did: 'Churches and homes were decked with birch and green boughs; Whit walks of children in new clothes processed through northern towns; Whitsun ales and fairs were held. In Poland, Green Holidays brought calamus and birch indoors for protection.',
    keep: 'Bring fresh green branches into the house and open every window.',
    when: 'Pentecost, seven weeks after Easter.',
  },
  {
    id: 'oak-apple-day',
    name: 'Oak Apple Day',
    rule: { kind: 'fixed', month: 5, day: 29 },
    region: 'England',
    did: 'Celebrating the restoration of Charles II, who hid in an oak tree. People wore oak sprigs or oak apples (galls), and anyone without one could be pinched or stung with nettles. Great Wishford in Wiltshire still asserts its right to gather wood in Grovely Forest today.',
    keep: 'Wear an oak leaf, and visit an old oak to thank it for the shelter oaks give.',
  },
  // ─── June ───
  {
    id: 'midsommar',
    name: 'Midsommar',
    rule: { kind: 'weekday', month: 6, from: 19, weekday: 5 },
    region: 'Sweden (and Midsummer Eve across Scandinavia and Finland)',
    did: 'A maypole hung with leaves and flowers is raised and danced around; people wear flower crowns and eat herring and strawberries. Girls picked seven kinds of flowers in silence to put under their pillow to dream of a future love.',
    keep: 'Pick seven kinds of wildflower in silence and sleep with them under your pillow.',
    when: 'The Friday between 19 and 25 June.',
  },
  {
    id: 'st-johns-eve',
    name: 'Midsummer and St John’s Eve',
    rule: { kind: 'fixed', month: 6, day: 23 },
    days: 2,
    region: 'Britain, Ireland and across Europe (Golowan in Cornwall)',
    did: 'Bonfires on hilltops and in streets; people leapt the flames, drove cattle through the smoke and carried embers home. St John’s wort, mugwort, vervain and other herbs were gathered and hung over doors. It was a night of fern seed, fairies and love divination. Midsummer Day was a quarter day.',
    keep: 'Gather St John’s wort or yarrow at noon or dusk and hang a bunch to dry by the door. Sit up with a fire or candle on the shortest night.',
    care: 'Hang herbs, don’t take them: St John’s wort interacts with many medicines and mugwort is not to be eaten. Never jump fires.',
  },
  {
    id: 'kupala',
    name: 'Kupala Night',
    rule: { kind: 'fixed', month: 6, day: 23 },
    region: 'Poland (Noc Kupały), Ukraine, Belarus, Russia; Jāņi in Latvia',
    did: 'Girls float wreaths of flowers and herbs with candles on rivers to read their luck in love by where they drift; couples jump the bonfire hand in hand; everyone searches the forest for the fern flower that blooms only tonight and brings luck and understanding.',
    keep: 'Make a wreath of wildflowers and herbs and set it on moving water at dusk (no wire or plastic). Walk in the woods and look for something marvellous.',
    when: 'The night of 23–24 June; where the Julian calendar is kept, 6–7 July.',
    premade: 'folk-kupala-wreath',
  },
  // ─── July ───
  {
    id: 'tynwald-day',
    name: 'Tynwald Day',
    rule: { kind: 'fixed', month: 7, day: 5, move: { 6: 2, 0: 1 } },
    region: 'Isle of Man',
    did: 'The open-air sitting of the Manx parliament on Tynwald Hill at St John’s, on Old Midsummer Day. Those taking part wear a sprig of mugwort, bollan bane, for protection, and the new laws are read out in Manx and English.',
    keep: 'Wear a sprig of mugwort, or hang one by the door, on Old Midsummer.',
    when: '5 July; when that’s a Saturday or Sunday, the Monday after.',
    care: 'Mugwort is worn, not eaten, and is best avoided in pregnancy.',
  },
  {
    id: 'st-swithins-day',
    name: 'St Swithin’s Day',
    rule: { kind: 'fixed', month: 7, day: 15 },
    region: 'England',
    did: 'If it rains today, the saying goes, it will rain for forty days. The story is that the saint’s bones were moved into Winchester Cathedral against his wish to lie out under the rain, and a storm followed. Apples were said not to ripen until St Swithin had christened them.',
    keep: 'Watch the weather today and see. Put out a bowl to catch rainwater for your work.',
  },
  {
    id: 'garland-sunday',
    name: 'Garland Sunday and Reek Sunday',
    rule: { kind: 'lastWeekday', month: 7, weekday: 0 },
    region: 'Ireland',
    did: 'The old Lughnasa gatherings, kept on the last Sunday of July: climbing hills and holy mountains (pilgrims still climb Croagh Patrick, the Reek), picking the first bilberries (fraughans), dancing, matchmaking and visiting holy wells.',
    keep: 'Climb a hill near you and pick a few wild berries (only those you know for certain). Leave the top a little cleaner than you found it.',
    when: 'The last Sunday in July.',
    care: 'Only gather berries you can identify with certainty, away from roadsides and sprayed land.',
  },
  // ─── August ───
  {
    id: 'lammas',
    name: 'Lammas',
    rule: { kind: 'fixed', month: 8, day: 1 },
    region: 'England, Scotland and Ireland (as Lughnasa)',
    did: 'Loaf-mass: a loaf from the first ripe wheat was baked and blessed in church, and pieces were crumbled in the four corners of the barn to protect the harvest. Lammas was also a Scottish quarter day and a time of fairs and handfastings.',
    keep: 'Bake a loaf, give thanks for the first harvest, and crumble a little outside for the birds at the four corners of your home.',
  },
  {
    id: 'puck-fair',
    name: 'Puck Fair',
    rule: { kind: 'fixed', month: 8, day: 10 },
    days: 3,
    region: 'Killorglin, County Kerry, Ireland',
    did: 'One of Ireland’s oldest fairs: a wild goat is caught in the mountains and crowned King Puck, then reigns from a high stand over three days of horse fair, music and trading before being returned to the hills.',
    keep: 'Spend a day at a local fair or market, and buy from the people who grow and make things.',
  },
  {
    id: 'herb-blessing',
    name: 'Our Lady of the Herbs',
    rule: { kind: 'fixed', month: 8, day: 15 },
    region: 'Poland (Matki Boskiej Zielnej), Germany and Austria (Kräuterweihe)',
    did: 'On the feast of the Assumption, bunches of herbs, grain and flowers are blessed and dried at home through the year, to be put under the pillow, burned in storms or added to animal feed against illness.',
    keep: 'Gather a bundle of herbs from your garden (rosemary, yarrow, mint, tansy, wheat) and hang it to dry as your house blessing for the year.',
  },
  // ─── September ───
  {
    id: 'horn-dance',
    name: 'Abbots Bromley Horn Dance',
    rule: { kind: 'weekday', month: 9, from: 6, weekday: 1 },
    region: 'Abbots Bromley, Staffordshire, England',
    did: 'Six dancers carrying ancient reindeer antlers (carbon dated to around 1065), with a Fool, a Hobby Horse, Maid Marian and a Bowman, dance a twenty-mile round of the parish farms and pubs from dawn to dusk.',
    keep: 'Walk a long round of your own parish or neighbourhood, calling on places that matter to you.',
    when: 'Wakes Monday: the day after the first Sunday after 4 September.',
  },
  {
    id: 'michaelmas',
    name: 'Michaelmas',
    rule: { kind: 'fixed', month: 9, day: 29 },
    region: 'Britain and Ireland',
    did: 'A quarter day of rents, hiring fairs and the Michaelmas goose. Blackberries must not be picked after today, because the devil, cast out of heaven by St Michael, fell into a bramble and spits (or worse) on them every year. In some places that day is Old Michaelmas, 10 or 11 October.',
    keep: 'Pick the last blackberries and make a crumble or jam, then leave the rest for the birds and the devil.',
    care: 'Pick only berries you know, and well away from roads.',
  },
  // ─── October ───
  {
    id: 'punkie-night',
    name: 'Punkie Night',
    rule: { kind: 'lastWeekday', month: 10, weekday: 4 },
    region: 'Hinton St George, Somerset, England',
    did: 'Children carry “punkies”, lanterns carved from mangel-wurzels, round the village, singing for candles or pennies. The tale says the village women carved them to light their way to Chiselborough fair to fetch home their drunken husbands.',
    keep: 'Carve a lantern from a turnip, swede or beet, not a pumpkin, and walk out with it at dusk.',
    when: 'The last Thursday of October.',
    care: 'Use a tea light in a jar or a battery light inside carved lanterns.',
  },
  {
    id: 'halloween',
    name: 'Hallowe’en divinations',
    rule: { kind: 'fixed', month: 10, day: 31 },
    region: 'Scotland, Ireland, Wales and northern England',
    did: 'The night for fortunes. Nuts were named for a pair of sweethearts and set on the fire to see if they burned quietly together or jumped apart; an apple peel thrown over the shoulder made a letter; a girl combed her hair at a mirror by candlelight to glimpse her future love. Kale stalks were pulled blindfold in Scotland; in Ireland, a ring was hidden in colcannon or barmbrack; in Wales, Nos Calan Gaeaf, people ran home from the bonfire before the Hwch Ddu Gwta caught them.',
    keep: 'Bake a barmbrack with a ring wrapped in baking paper inside, and try the apple-peel or nut divination with friends.',
    premade: 'folk-apple-candle-halloween',
    care: 'Wrap any charm in a cake well, and tell everyone it’s there.',
  },
  // ─── November ───
  {
    id: 'souling',
    name: 'All Souls and souling',
    rule: { kind: 'fixed', month: 11, day: 1 },
    days: 2,
    region: 'Cheshire, Shropshire and the north of England; Poland (Zaduszki); across Catholic Europe',
    did: 'Soulers went house to house singing for soul cakes, each one a prayer for the dead; in Cheshire the Soul-caking play is still performed. Across Poland and much of Europe graves are cleaned and covered with candles in glass lanterns on All Saints and All Souls, so cemeteries glow through the night.',
    keep: 'Bake soul cakes and give them away, naming someone you’ve lost for each. Light a candle in a window or at a grave.',
    premade: 'folk-dziady-meal',
  },
  {
    id: 'bonfire-night',
    name: 'Bonfire Night',
    rule: { kind: 'fixed', month: 11, day: 5 },
    region: 'England, especially Lewes in Sussex',
    did: 'Remembering the failed Gunpowder Plot of 1605 with bonfires, fireworks and effigies, gathering up older autumn fire customs. Lewes’s bonfire societies hold torchlit processions with burning tar barrels.',
    keep: 'Go to a community bonfire, rather than lighting one alone, and warm your hands on the turning year.',
    care: 'Check bonfire piles for sleeping hedgehogs before lighting, and keep pets indoors.',
  },
  {
    id: 'martinmas',
    name: 'Martinmas',
    rule: { kind: 'fixed', month: 11, day: 11 },
    region: 'Germany, the Low Countries, Scotland and England',
    did: 'The feast of St Martin, who cut his cloak in half for a beggar. Children walk with paper lanterns singing St Martin’s songs; goose is eaten; in Scotland it was a term day for rents and hiring, and the time for killing and salting meat for winter. A mild spell now is St Martin’s summer.',
    keep: 'Make a paper lantern and walk with it at dusk, and give away a warm coat you don’t need.',
  },
  {
    id: 'stir-up-sunday',
    name: 'Stir-up Sunday',
    rule: { kind: 'weekday', month: 11, from: 20, weekday: 0 },
    region: 'England',
    did: 'Named for the Prayer Book collect read in church that day (“Stir up, we beseech thee”). Everyone in the family takes a turn stirring the Christmas pudding, east to west for the Magi, making a wish; a coin or ring may go in.',
    keep: 'Make your winter pudding, cake or mincemeat, and let everyone in the house stir and wish.',
    when: 'The Sunday before Advent: the last before Christmas preparations begin.',
  },
  {
    id: 'st-clement-catherine',
    name: 'St Clement’s and St Catherine’s Days',
    rule: { kind: 'fixed', month: 11, day: 23 },
    days: 3,
    region: 'England (and Catherinettes in France)',
    did: 'Clement (23rd) was patron of blacksmiths, who fired anvils and went “clementing” for drink and money; Catherine (25th), of lacemakers and spinners, who ate Cattern cakes and danced. In France, unmarried women of 25 wore extravagant yellow and green hats.',
    keep: 'Honour the makers and menders you know, and bake caraway Cattern cakes.',
  },
  {
    id: 'st-andrews-eve',
    name: 'St Andrew’s Eve (Andrzejki)',
    rule: { kind: 'fixed', month: 11, day: 29 },
    region: 'Poland, Romania, Germany, Scotland',
    did: 'A night of divination. In Poland, hot wax is poured through the hole of a key into cold water and the shadow it casts read by candlelight; shoes are lined up toward the door to see whose reaches it first. In Romania, garlic was hung against the strigoi who walk this night.',
    keep: 'Pour candle wax through an old key into a bowl of cold water, hold the shape to a candle and read its shadow on the wall.',
    care: 'Pour hot wax slowly and over a tray, away from children.',
  },
  // ─── December ───
  {
    id: 'krampusnacht',
    name: 'Krampusnacht',
    rule: { kind: 'fixed', month: 12, day: 5 },
    region: 'Austria, Bavaria and the Alpine lands, Slovenia, Hungary',
    did: 'The night before St Nicholas, when the horned, shaggy Krampus with his chains, bells and birch switches comes with the saint to frighten naughty children. Krampus runs (Krampuslauf) fill the streets with masked figures.',
    keep: 'Name what you want kept out of the house this winter, and tie a bundle of birch twigs with red ribbon to hang by the door.',
  },
  {
    id: 'st-nicholas',
    name: 'St Nicholas’ Day',
    rule: { kind: 'fixed', month: 12, day: 6 },
    region: 'The Netherlands and Belgium (Sinterklaas on the 5th), Germany, Poland, Central Europe',
    did: 'Children put out shoes or boots on the eve and find them filled with nuts, oranges, chocolate and small gifts. St Nicholas, the gift-bringer, was the patron of children, sailors and the poor.',
    keep: 'Fill a shoe with nuts and a clementine for someone you love, and give anonymously to someone in need.',
  },
  {
    id: 'st-lucy',
    name: 'St Lucy’s Day',
    rule: { kind: 'fixed', month: 12, day: 13 },
    region: 'Sweden, Norway and Finland, Italy',
    did: 'Under the old calendar this was the longest night. In Sweden the eldest daughter, in white with a crown of candles, brings saffron buns and coffee at dawn, and Lucia processions sing in the dark. Lussinatta was a dangerous night when spirits and trolls were abroad.',
    keep: 'Rise before dawn, light a candle and bake or buy saffron buns to share.',
    care: 'Use battery candles for any crown or worn light.',
  },
  {
    id: 'st-thomas-day',
    name: 'St Thomas’s Day: going a-gooding',
    rule: { kind: 'fixed', month: 12, day: 21 },
    region: 'England',
    did: 'On the shortest day, poorer women and widows went “a-Thomasing”, “mumping” or “gooding” from house to house, given flour, money or wheat for their Christmas baking.',
    keep: 'Give to a food bank or a neighbour who would welcome some baking.',
  },
  {
    id: 'mari-lwyd',
    name: 'Mari Lwyd',
    rule: { kind: 'fixed', month: 12, day: 24 },
    days: 14,
    region: 'South Wales, now revived across Wales and the borders',
    did: 'A horse’s skull on a pole, draped in white and hung with ribbons, is carried door to door after dark through the midwinter season. Its party challenges the household in rhyme (pwnco), and if the house loses the battle of verse it must let the Mari in for food and drink.',
    keep: 'Hold an evening of verses, riddles or songs by candlelight, and open the door to guests.',
    when: 'Through the Christmas season, from Christmas to Twelfth Night or beyond.',
  },
  {
    id: 'christmas-eve',
    name: 'Christmas Eve and Wigilia',
    rule: { kind: 'fixed', month: 12, day: 24 },
    region: 'Britain, Poland and across Europe',
    did: 'The Yule log was brought in and lit from last year’s saved piece; at midnight the cattle were said to kneel and speak. In Poland the Wigilia supper begins with the first star; hay goes under the tablecloth and a place is laid for the stranger, or for the family’s dead.',
    keep: 'Lay an extra place at your table tonight for the wanderer and the ones who are gone, and keep a piece of your Yule log or candle for next year.',
    premade: 'folk-smooring-the-fire',
  },
  {
    id: 'wren-day',
    name: 'St Stephen’s Day: the Wren Boys',
    rule: { kind: 'fixed', month: 12, day: 26 },
    region: 'Ireland, the Isle of Man (Hunt the Wren), Wales',
    did: 'Wren Boys in straw suits, masks and old clothes went from house to house with a holly bush said to hold the wren, “the king of all birds”, singing and playing for money for a party. The real bird has long been replaced by a toy.',
    keep: 'Put out food for the wrens and small birds, and visit neighbours with music or a song.',
  },
  {
    id: 'hogmanay',
    name: 'Hogmanay and first-footing',
    rule: { kind: 'fixed', month: 12, day: 31 },
    region: 'Scotland and northern England',
    did: 'The house is cleaned and debts paid before the bells. After midnight the first-foot, ideally a tall dark-haired man, crosses the threshold with coal, salt, shortbread or black bun, and whisky, so the house will have warmth, food and good cheer all year. In Stonehaven, fireballs are swung through the streets.',
    keep: 'Clean the house and settle what you owe before midnight; after it, have someone step in first carrying salt, bread and a piece of coal or wood.',
  },
];

// ─── Working out dates ───────────────────────────────────────────────────

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** The day a custom falls in `year` (local midnight). */
export function customDate(rule: CustomRule, year: number): Date {
  switch (rule.kind) {
    case 'fixed': {
      const date = new Date(year, rule.month - 1, rule.day);
      return addDays(date, rule.move?.[date.getDay()] ?? 0);
    }
    case 'easter':
      return addDays(easterSunday(year), rule.offset);
    case 'weekday': {
      const first = new Date(year, rule.month - 1, rule.from);
      return addDays(first, (rule.weekday - first.getDay() + 7) % 7);
    }
    case 'lastWeekday': {
      const last = new Date(year, rule.month, 0);
      return addDays(last, -((last.getDay() - rule.weekday + 7) % 7));
    }
  }
}

export type CustomOn = { custom: FolkCustom; date: Date; days: number; inDays: number };

/** Customs running on or starting after `from`'s day, up to `days` ahead, soonest first. */
export function customsAhead(from: Date, days = 30, list: FolkCustom[] = FOLK_CUSTOMS): CustomOn[] {
  const today = startOfDay(from);
  const end = addDays(today, days).getTime();
  const out: CustomOn[] = [];
  for (const custom of list) {
    for (const year of [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1]) {
      const date = customDate(custom.rule, year);
      const span = custom.days ?? 1;
      if (addDays(date, span - 1).getTime() < today.getTime() || date.getTime() > end) continue;
      out.push({ custom, date, days: span, inDays: Math.max(0, Math.round((date.getTime() - today.getTime()) / 86_400_000)) });
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime() || a.custom.name.localeCompare(b.custom.name));
}

/** Customs that begin in a month (1–12) of `year`, in date order. */
export function customsInMonth(month: number, year: number, list: FolkCustom[] = FOLK_CUSTOMS): CustomOn[] {
  const first = new Date(year, month - 1, 1);
  return list
    .map((custom) => ({ custom, date: customDate(custom.rule, year), days: custom.days ?? 1, inDays: 0 }))
    .filter((c) => c.date.getMonth() === month - 1 && c.date.getFullYear() === year)
    .map((c) => ({ ...c, inDays: Math.round((c.date.getTime() - first.getTime()) / 86_400_000) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.custom.name.localeCompare(b.custom.name));
}

export const customById = (id: string | null | undefined) => FOLK_CUSTOMS.find((c) => c.id === id) ?? null;

export const SOUTHERN_NOTE =
  'These customs belong to the northern year, so their seasons are turned around for you: Midsummer falls in your midwinter, and Hallowe’en in your spring. Many people south of the equator keep the dates and let the meaning shift, or move the seasonal ones by six months.';
