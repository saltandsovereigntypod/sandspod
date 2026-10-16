// Pages for the holidays in lib/holidays.ts: the Wheel of the Year, Celtic,
// Norse, Hellenic (festivals and monthly days), Roman, Slavic and Christian
// traditions. wheel_south shares the wheel pages. Pure data.

import type { HolyPage } from '../types.ts';

export const HOLIDAY_PAGES: HolyPage[] = [
  // ─── Wheel of the Year ───────────────────────────────────────────────
  {
    ref: 'wheel-imbolc',
    title: 'Imbolc',
    aka: ['Imbolg', 'Oimelc', 'Candlemas', 'Brigid’s Day', 'Lá Fhéile Bríde'],
    tradition: 'Wheel of the Year',
    summary:
      'The first stirring of spring on 1 February, when the light is visibly longer and the ewes come into milk. On the modern Wheel it is the sabbat of Brigid, the hearth and holy wells: cleaning, candles and new beginnings.',
    honours:
      'Brigid above all, the Irish goddess of poetry, healing and smithcraft and the much-loved saint of Kildare who carries many of her images. It also honours the hearth fire, the young lambs and the first green shoots: the household turning, very quietly, toward the light.',
    history:
      'Imbolc is genuinely old as a date. Early Irish literature names it as one of the four quarter days of the Gaelic year, with Bealtaine, Lughnasadh and Samhain. Its meaning was already a puzzle in the Middle Ages: a tenth-century Irish glossary explained the variant “oimelc” as “ewe’s milk”, and many scholars now prefer “i mbolg”, “in the belly”, for the pregnant ewes. Both point to lambing season.\n\nWhat we know of how the day was kept comes almost entirely from the feast of St Brigid, recorded by folklorists in nineteenth- and twentieth-century Ireland, Scotland and Man. Rush crosses were woven, a cloth or ribbon was left outside overnight to be blessed as Brigid passed, a doll of her (the Brídeog) was carried from door to door, and in the Hebrides a bed was made for her by the hearth so that she might be welcomed in.\n\nIn the 1950s Gerald Gardner’s Wicca took the four Gaelic quarter days as its “greater sabbats”, and Imbolc, sometimes called Candlemas in early Wiccan writing, became the first sabbat of spring on the modern Wheel of the Year.',
    knowAndDont: {
      known:
        'Imbolc is attested as a quarter day in early Irish texts. Brigid as a goddess is named in a medieval Irish glossary as a poet and the daughter of the Dagda, with sisters of healing and smithcraft. The saint’s folk customs are richly documented, and the Kildare fire tended by nuns was described by Gerald of Wales in the 1180s.',
      unknown:
        'We have no description of a pre-Christian Imbolc rite. Whether the saint “is” the goddess, or simply shares her name and some of her qualities, cannot be settled from the evidence, and both Christian and pagan Irish people hold strong, sincere views. The modern sabbat’s focus on candles and purification owes as much to Candlemas and Wicca as to anything Gaelic.',
    },
    celebrate: [
      'Give the house a real clean and open the windows for a few minutes, letting winter out.',
      'Weave a Brigid’s cross from rushes, straw or paper and hang it over the door until next year.',
      'Leave a strip of cloth (a brat Bríde) on a sill or branch overnight, and keep it as a blessing for healing.',
      'Light a candle in every room after dark, or one candle for the year’s hopes, and never leave it unattended.',
      'Walk somewhere you can look for snowdrops, catkins or lambs, and write a few lines of poetry for Brigid.',
    ],
    ritual: { premade: 'wicca-imbolc-brigids-bed' },
    correspondences: {
      deities: ['Brigid'],
      herbs: ['Rowan', 'Bay', 'Chamomile'],
      crystals: ['Amethyst', 'Garnet', 'Moonstone'],
      colors: ['White', 'Red', 'Green'],
      foods: ['Butter and buttermilk', 'Oat bannocks', 'Colcannon', 'Milk with honey'],
      symbols: ['Brigid’s cross', 'Brat Bríde (Brigid’s cloth)', 'Candles', 'Snowdrops', 'Holy wells', 'The ewe and lamb'],
    },
    sources: [
      'Kuno Meyer (tr.), The Wooing of Emer (Tochmarc Emire), CELT: https://celt.ucc.ie/published/T301021/index.html',
      'Alexander Carmichael, Carmina Gadelica vol. 1 (1900): https://archive.org/details/carminagadelicah01carm',
      'Catholic Encyclopedia (1907), “St. Brigid of Ireland”: https://www.newadvent.org/cathen/02784b.htm',
      'Ronald Hutton, The Stations of the Sun: A History of the Ritual Year in Britain (Oxford, 1996), ch. 13.',
      'J. A. MacCulloch, The Religion of the Ancient Celts (1911): https://www.gutenberg.org/ebooks/14672',
    ],
  },
  {
    ref: 'wheel-ostara',
    title: 'Ostara',
    aka: ['Spring Equinox', 'Vernal Equinox', 'Eostre', 'Alban Eilir'],
    tradition: 'Wheel of the Year',
    summary:
      'The spring equinox, around 20 March, when day and night stand equal and then the light pulls ahead. A modern sabbat of seeds, eggs, hares and greening earth.',
    honours:
      'The returning sun and the waking land: buds, nesting birds, the hare in the field. Many witches also honour Eostre, a spring goddess named by the Anglo-Saxon monk Bede, or simply the balance of light and dark at the hinge of the year.',
    history:
      'The equinox itself has been watched for thousands of years, and the date of Easter is still reckoned from it. But there is no record of a pagan festival called Ostara. The name comes from two sources. In 725 Bede wrote that the English called April Eosturmonath after a goddess, Eostre, in whose honour feasts had once been held; he says nothing more about her. In 1835 Jacob Grimm, reasoning from Bede and from the German word Ostern, proposed a German goddess “Ostara”.\n\nThe modern sabbat name was chosen by the American Pagan Aidan Kelly in 1974, when he gave names to the solstices and equinoxes, which early Wicca had simply called by their seasons. It spread through the Pagan magazine Green Egg and the books of the 1980s.\n\nThe hare and the egg belong to European spring folklore rather than to Eostre. The Easter hare that brings eggs is first described in Germany in 1682, and decorated eggs were made across Christian Europe because eggs, given up for Lent, came back at Easter.',
    knowAndDont: {
      known:
        'Bede records a month named for Eostre and feasts in her honour. Linguists accept that the name is related to old words for dawn and the east, and inscriptions to matron goddesses called the Austriahenae have been found in Germany. The equinox, eggs and hares are real spring traditions.',
      unknown:
        'Everything else about Eostre is unknown: her stories, her rites, even whether Bede had it right. The often-repeated tale of Eostre turning a bird into an egg-laying hare is a modern invention, and “Ostara” as a sabbat dates from 1974. That does not make the day less worth keeping; it just means we are building, not recovering.',
    },
    celebrate: [
      'Sow seeds in a pot or the garden, saying what you hope will grow in you this season.',
      'Dye or paint eggs with onion skins, beetroot or turmeric, and give them away.',
      'Spend a moment at sunrise or sunset noticing the balance, then name one thing to bring back into balance in your life.',
      'Clear a little space outdoors for wildflowers, or put out water for birds and bees.',
      'Eat something fresh and green: the first salad leaves, sprouted seeds, spring herbs.',
    ],
    ritual: { premade: 'wicca-ostara-seed-and-egg' },
    correspondences: {
      herbs: ['Lemon Balm', 'Mint', 'Dandelion', 'Calendula'],
      crystals: ['Rose Quartz', 'Green Aventurine', 'Moss Agate', 'Aquamarine'],
      colors: ['Green', 'Yellow', 'Pink', 'White'],
      foods: ['Eggs', 'Hot cross buns or seed bread', 'Honey', 'Spring greens and sprouts'],
      symbols: ['Eggs', 'The hare', 'Seeds', 'Spring flowers', 'The balanced scale'],
    },
    sources: [
      'Bede, De temporum ratione, ch. 15 (725); tr. Faith Wallis, Bede: The Reckoning of Time (Liverpool, 1999).',
      'Jacob Grimm, Teutonic Mythology, tr. J. S. Stallybrass (1882), vol. 1, ch. 13.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 18–19.',
      'Ronald Hutton, The Triumph of the Moon: A History of Modern Pagan Witchcraft (Oxford, 1999).',
    ],
  },
  {
    ref: 'wheel-beltane',
    title: 'Beltane',
    aka: ['Bealtaine', 'May Day', 'May Eve', 'Calan Mai', 'Walpurgisnacht'],
    tradition: 'Wheel of the Year',
    summary:
      'May Day, the start of summer in the old Gaelic year and the flowering height of spring. A fire festival of fertility, joy and protection, with bonfires, hawthorn blossom and dew.',
    honours:
      'Life at its most abundant: the land in blossom, the herds going out to pasture, love and desire. Modern witches honour the union of the Goddess and the God; older Gaelic custom asked the fire for protection over people and cattle for the summer ahead.',
    history:
      'Bealtaine is one of the four quarter days named in early Irish literature. A tenth-century Irish glossary says that on this day druids made two fires and drove cattle between them as a protection against disease, and later Irish and Scottish custom kept the same idea: hearth fires were put out and relit from a communal fire, and cattle and people passed by the flames.\n\nFolk custom recorded in the eighteenth to twentieth centuries adds much more: washing the face in May morning dew for beauty, bringing in blossom or a May bush, hanging rowan over the door, and guarding the dairy, since butter and luck were thought easy to steal on May morning. The maypole and the May Queen belong to the English and continental May Day, not to the Gaelic Bealtaine; both are now part of the modern sabbat.\n\nWicca took Beltane as a greater sabbat in the 1950s, and gave it its modern focus on the sacred marriage. Today it is also kept publicly, as at Edinburgh’s Beltane Fire Festival, revived in 1988, and the bonfire at the Hill of Uisneach in Ireland.',
    knowAndDont: {
      known:
        'The name and date are early medieval; the glossary account of two fires and cattle is a real medieval source; and the protective fire, dew and rowan customs are well documented by folklorists.',
      unknown:
        'The glossary was written by Christian scholars centuries after druids disappeared, so its picture of druid ritual is uncertain. There is no evidence of an ancient “sacred marriage” rite at Beltane: that is Wiccan theology, and a meaningful one, but modern.',
    },
    celebrate: [
      'Rise early and wash your face in the morning dew, or in water left out overnight under the sky.',
      'Bring in flowering branches or make a flower crown, but cut hawthorn only from the hedge, never a lone tree, and with thanks.',
      'Light a fire safely outdoors with friends, or a candle at home, and leap or step over a small flame only if it is truly safe.',
      'Hang a sprig of rowan tied with red thread over the door for protection through summer.',
      'Do something joyful with your body: dance, walk, make love, swim.',
    ],
    ritual: { premade: 'wicca-beltane-flower-crown' },
    correspondences: {
      deities: ['Freyr', 'Aphrodite', 'Cernunnos', 'Rhiannon'],
      herbs: ['Hawthorn', 'Rowan', 'Rose', 'Meadowsweet', 'Birch'],
      crystals: ['Carnelian', 'Rose Quartz', 'Emerald', 'Garnet'],
      colors: ['Green', 'Red', 'White', 'Pink'],
      foods: ['Oatcakes or Beltane bannock', 'Honey cakes', 'Dairy', 'May wine (with sweet woodruff, in moderation)'],
      symbols: ['Bonfire', 'Maypole', 'Hawthorn blossom', 'Ribbons', 'Morning dew', 'Flower crown'],
    },
    sources: [
      'J. A. MacCulloch, The Religion of the Ancient Celts (1911), ch. 18: https://www.gutenberg.org/ebooks/14672',
      'Kuno Meyer (tr.), The Wooing of Emer (Tochmarc Emire), CELT: https://celt.ucc.ie/published/T301021/index.html',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 21–24.',
      'Kevin Danaher, The Year in Ireland (Cork, 1972).',
    ],
  },
  {
    ref: 'wheel-litha',
    title: 'Litha',
    aka: ['Midsummer', 'Summer Solstice', 'St John’s Eve', 'Alban Hefin'],
    tradition: 'Wheel of the Year',
    summary:
      'The summer solstice, around 21 June, the longest day, when the sun stands at the height of its power. A sabbat of fire, herbs and celebration, and of the quiet turn toward the waning year.',
    honours:
      'The sun at its strongest and the green world at its fullest. Many witches honour the God at his peak, or sun deities such as Apollo or Lugh, and the herbs that were gathered at midsummer for their power.',
    history:
      'The solstice has been marked for a very long time: monuments such as Stonehenge are aligned to the solstices, though their builders left no word of what they did there. In Christian Europe midsummer was kept on St John’s Eve, 23 June, with bonfires, rolling burning wheels, gathering herbs such as St John’s wort, and divination for love. These customs are recorded from the Middle Ages to living memory, from Ireland to Russia.\n\n“Litha” comes from Bede, who in 725 listed the old English month names: the months around midsummer were Ærra Liþa and Æfterra Liþa, “before Litha” and “after Litha”. Bede tells us nothing of a festival. The American Pagan Aidan Kelly took the name for the solstice in 1974, possibly helped by Tolkien, whose hobbits keep “Lithe” at midsummer.\n\nToday crowds gather at Stonehenge for the sunrise, and Druids call the day Alban Hefin, a name from the eighteenth-century Welsh writer Iolo Morganwg.',
    knowAndDont: {
      known:
        'Midsummer fires and herb-gathering are among the best-documented folk customs in Europe, mostly tied to St John’s Eve. Bede records the month names Ærra and Æfterra Liþa.',
      unknown:
        'We do not know what, if anything, the pagan English did at midsummer, or what Stonehenge’s builders believed. The sabbat name is a 1970s choice, and the Oak King and Holly King battle often told at Litha is a modern story from the late twentieth century.',
    },
    celebrate: [
      'Watch the sunrise or sunset, and spend some of the long day outdoors.',
      'Gather herbs at their peak, with thanks, to dry for the year; label anything you won’t eat.',
      'Light a fire or candles at dusk, safely and lawfully, and let go of something into the flames.',
      'Make sun water or a midsummer garland of flowers for the door.',
      'Share food outside with friends: strawberries, honey, bread, something grilled.',
    ],
    ritual: { premade: 'wicca-litha-noon-herb-gathering' },
    correspondences: {
      deities: ['Apollo', 'Lugh', 'Baldur', 'Ra'],
      herbs: ['St John’s Wort', 'Yarrow', 'Lavender', 'Calendula', 'Oak', 'Elder'],
      crystals: ['Sunstone', 'Citrine', 'Tiger Eye', 'Carnelian'],
      colors: ['Gold', 'Yellow', 'Orange', 'Green'],
      foods: ['Strawberries', 'Honey', 'Fresh bread', 'Elderflower cordial', 'Summer salads'],
      symbols: ['The sun wheel', 'Bonfire', 'Oak leaves', 'Herb garland', 'Sunflowers'],
    },
    sources: [
      'Bede, De temporum ratione, ch. 15 (725); tr. Faith Wallis, Bede: The Reckoning of Time (Liverpool, 1999).',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 30–31.',
      'James George Frazer, The Golden Bough (abridged 1922), ch. 62: https://www.gutenberg.org/ebooks/3623',
      'Ronald Hutton, The Triumph of the Moon (Oxford, 1999).',
    ],
  },
  {
    ref: 'wheel-lammas',
    title: 'Lammas',
    aka: ['Lughnasadh', 'Loaf Mass', 'First Harvest', 'Gŵyl Awst'],
    tradition: 'Wheel of the Year',
    summary:
      'The first harvest, on 1 August, when the grain is cut and the first loaf baked. A sabbat of gratitude, bread and sharing, named for both the English Loaf Mass and the Irish festival of Lugh.',
    honours:
      'The ripened grain and the work that brings it in. Many witches honour Lugh, the many-skilled Irish god said to have founded the festival for his foster-mother Tailtiu, and the spirit of the grain that is cut so that people may eat.',
    history:
      'The modern sabbat combines two real festivals. In Ireland, Lughnasadh was one of the four quarter days: medieval tales say Lugh founded games at Tailtiu in memory of his foster-mother, who died clearing the plains for farming. In English, “hlafmæsse”, the loaf-mass, appears in the Anglo-Saxon Chronicle for 921: bread made from the first ripe wheat was brought to church to be blessed.\n\nIrish folk custom kept Lughnasadh alive as Garland Sunday or Bilberry Sunday, the last Sunday of July or first of August, when people climbed hills, picked bilberries, held fairs and matched couples. The folklorist Máire MacNeill recorded the custom at nearly two hundred sites in her 1962 study.\n\nWicca took the date as a greater sabbat, often under both names. The story of John Barleycorn, the grain who is cut down and rises again as bread and ale, comes from an English folk ballad and is widely sung at modern Lammas rites.',
    knowAndDont: {
      known:
        'Lughnasadh is an attested Irish quarter day tied in the literature to Lugh and Tailtiu. Lammas is an attested English church festival of the first loaf. The hill-top gatherings are well documented in Ireland.',
      unknown:
        'We do not know what pre-Christian rites, if any, were held, and the medieval story of Lugh and Tailtiu was written by Christian authors. The idea of a sacrificed grain-god or “corn king” owes a great deal to J. G. Frazer’s nineteenth-century theories, which scholars have largely set aside.',
    },
    celebrate: [
      'Bake a loaf (or buy a good one), and share the first piece with someone or set it out for the birds.',
      'Make a simple corn dolly or a plait of wheat or grass to hang in the kitchen until spring.',
      'Climb a hill or walk to a high place, and look out over the land that feeds you.',
      'Pick blackberries or bilberries where it is permitted, and leave plenty for wildlife.',
      'Write down the first harvest of your own year: what has ripened since spring.',
    ],
    ritual: { premade: 'wicca-lammas-bread-offering' },
    correspondences: {
      deities: ['Lugh', 'Ceres', 'Demeter', 'Freyr'],
      herbs: ['Calendula', 'Meadowsweet', 'Basil', 'Rosemary'],
      crystals: ['Citrine', 'Peridot', 'Tiger Eye', 'Carnelian'],
      colors: ['Gold', 'Orange', 'Yellow', 'Brown'],
      foods: ['Bread', 'Bilberries and blackberries', 'New potatoes', 'Ale or cider', 'Oats and barley'],
      symbols: ['The first loaf', 'Wheat sheaf', 'Corn dolly', 'The sickle', 'Hilltop'],
    },
    sources: [
      'Máire MacNeill, The Festival of Lughnasa (Oxford, 1962).',
      'The Anglo-Saxon Chronicle, entry for 921 (“hlafmæsse”); tr. J. A. Giles (1847), Project Gutenberg: https://www.gutenberg.org/ebooks/657',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 32–33.',
      'J. A. MacCulloch, The Religion of the Ancient Celts (1911): https://www.gutenberg.org/ebooks/14672',
    ],
  },
  {
    ref: 'wheel-mabon',
    title: 'Mabon',
    aka: ['Autumn Equinox', 'Harvest Home', 'Second Harvest', 'Alban Elfed'],
    tradition: 'Wheel of the Year',
    summary:
      'The autumn equinox, around 22 September, when day and night are equal before the dark pulls ahead. A modern sabbat of the second harvest: gratitude, sharing and getting ready for winter.',
    honours:
      'The fruits, nuts and late grain of the year, and the turn toward the dark. The name honours Mabon ap Modron, “son of the Mother”, a mysterious figure of Welsh legend who was taken from his mother as a baby and later freed; some witches also honour Persephone’s descent at this season.',
    history:
      'There was no ancient Celtic festival at the autumn equinox that we know of. In Britain the end of harvest was marked by Harvest Home, a supper for the workers when the last load came in, whenever that happened to be. Churches added a Harvest Festival service from 1843, when the Cornish vicar Robert Hawker held one in his parish, and it quickly spread. Nearby, Michaelmas (29 September) was a quarter day for rents and hiring.\n\nThe name Mabon was given by Aidan Kelly in 1974. He was looking for a story like Persephone’s, of a child taken into the underworld, and found Mabon in the Welsh tale Culhwch and Olwen, where he is a prisoner who must be released to win the hero’s quest. The name has become very widely loved, although historians point out that it has no link with the season in the old tales.\n\nDruids call the day Alban Elfed, and many Pagans keep it simply as the Autumn Equinox.',
    knowAndDont: {
      known:
        'Harvest suppers, the last sheaf customs (the “neck” or “mare”), and the church Harvest Festival are well documented in Britain and Ireland. Mabon ap Modron appears in medieval Welsh literature.',
      unknown:
        'There is no evidence of any pre-Christian equinox festival in Britain or Ireland, and nothing links Mabon to it beyond the 1974 naming. It is a modern sabbat, and none the worse for being honest about it.',
    },
    celebrate: [
      'Make a gratitude list of the year’s harvest, the good and the hard-won.',
      'Cook with the season: apples, squash, nuts, late plums, and share the meal.',
      'Give to a food bank or share surplus produce with neighbours.',
      'Walk at dusk and notice the earlier dark; decide what you want to bring with you into winter.',
      'Tidy your altar and home for the dark half of the year, and put away summer things with thanks.',
    ],
    ritual: { premade: 'wicca-mabon-thanks-and-balance' },
    correspondences: {
      deities: ['Persephone', 'Demeter', 'Ceres'],
      herbs: ['Sage', 'Rosemary', 'Cinnamon', 'Clove', 'Oak'],
      crystals: ['Smoky Quartz', 'Tiger Eye', 'Red Jasper', 'Amber'],
      colors: ['Orange', 'Brown', 'Gold', 'Red'],
      foods: ['Apples', 'Blackberries', 'Squash', 'Nuts', 'Cider', 'Bread'],
      symbols: ['The balanced scale', 'Apples', 'Cornucopia', 'Acorns', 'Falling leaves'],
    },
    sources: [
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 34–35 (harvest customs and Harvest Festival).',
      'Culhwch and Olwen, in The Mabinogion, tr. Lady Charlotte Guest (1849): https://www.gutenberg.org/ebooks/5160',
      'Aidan Kelly’s own account of naming the sabbats (2017), summarised in religion journalism and Pagan histories; see also Hutton, The Triumph of the Moon (Oxford, 1999).',
    ],
  },
  {
    ref: 'wheel-samhain',
    title: 'Samhain',
    aka: ['Halloween', 'All Hallows’ Eve', 'Oíche Shamhna', 'Calan Gaeaf', 'Witches’ New Year'],
    tradition: 'Wheel of the Year',
    summary:
      'From sunset on 31 October: summer’s end and, for many witches, the new year. A night to honour the ancestors and the beloved dead, to look into the year ahead, and to rest as the dark half begins.',
    honours:
      'The dead of our families and lines, those we loved and those we never met, and the turning of the year into darkness. Many witches also honour gods of death and the dark, such as Hekate, the Morrigan or Hel, and the Otherworld that the old tales say comes close tonight.',
    history:
      'Samhain is the best-attested of the Gaelic quarter days. Medieval Irish tales place great assemblies and feasts at Samhain, and many of their strangest events happen on that night: the mounds of the Otherworld open, the dead and the síde walk abroad, and heroes cross between worlds.\n\nThe Church set All Saints’ Day on 1 November in the eighth and ninth centuries and All Souls’ on the 2nd soon after, and Halloween grew from both. Folklorists recorded bonfires, guising in masks, turnip lanterns, apple and nut games to divine a future spouse, and food left for the dead in Ireland, Scotland, Wales and Man. Irish and Scottish emigrants carried Halloween to North America, which gave it pumpkins and trick-or-treating.\n\nThe idea that Samhain was “the Celtic New Year” comes from nineteenth-century scholars and is debated; it became central in modern Wicca, where Samhain is the most important sabbat of all.',
    knowAndDont: {
      known:
        'Samhain is attested in the earliest Irish literature as a quarter day of assemblies and feasting, closely linked with the Otherworld. The Halloween customs of guising, divination, lanterns and feeding the dead are well documented from the eighteenth century onward.',
      unknown:
        'We have no description of pagan religious rites at Samhain, and claims that druids made sacrifices on this night, or that it was a festival of a “Lord of the Dead”, are not supported by the sources. Whether it began the year is uncertain. The dumb supper and much modern Samhain liturgy are recent, and beautiful.',
    },
    celebrate: [
      'Set a photo or the names of your beloved dead on a small altar with a candle, and tell their stories.',
      'Lay a place at the table or set out a plate of food for the ancestors, and give it to the earth the next day.',
      'Carve a turnip or pumpkin lantern and set it at the door to light the way home.',
      'Try an old divination: apple peel thrown over the shoulder, or a few cards for the year ahead.',
      'Rest. Go to bed early, and let the dark be the start of something rather than an ending.',
    ],
    ritual: { premade: 'wicca-samhain-dumb-supper' },
    correspondences: {
      deities: ['Hekate', 'The Morrigan', 'Cerridwen', 'Hel', 'Hades', 'Persephone'],
      herbs: ['Mugwort', 'Rosemary', 'Sage', 'Yew', 'Wormwood', 'Rowan'],
      crystals: ['Obsidian', 'Jet', 'Smoky Quartz', 'Black Tourmaline', 'Onyx'],
      colors: ['Black', 'Orange', 'Purple', 'Silver'],
      foods: ['Apples', 'Nuts', 'Barmbrack or soul cakes', 'Colcannon', 'Pumpkin and squash'],
      symbols: ['Turnip or pumpkin lantern', 'Apples', 'Candles in the window', 'Masks', 'The ancestors’ plate'],
    },
    sources: [
      'J. A. MacCulloch, The Religion of the Ancient Celts (1911), ch. 18: https://www.gutenberg.org/ebooks/14672',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 36–37.',
      'Catholic Encyclopedia (1907), “All Saints’ Day”: https://www.newadvent.org/cathen/01315a.htm',
      'Kevin Danaher, The Year in Ireland (Cork, 1972).',
    ],
  },
  {
    ref: 'wheel-yule',
    title: 'Yule',
    aka: ['Winter Solstice', 'Midwinter', 'Jól', 'Alban Arthan', 'Longest Night'],
    tradition: 'Wheel of the Year',
    summary:
      'The winter solstice, around 21 December, the longest night. The sun stands still, then begins to return: a sabbat of candles, evergreens, feasting and hope.',
    honours:
      'The reborn sun and the light that comes back after the darkest night; the evergreen life that holds on through winter; the household and its ancestors gathered at the fire. Many witches honour the Goddess giving birth to the Sun Child, or sun and winter gods of the old north.',
    history:
      'People have marked the midwinter sun since the Stone Age: the passage tomb at Newgrange in Ireland, built around 3200 BCE, lets the rising sun into its inner chamber on the mornings around the solstice. What its builders believed, we cannot say.\n\nThe name Yule is old. Bede says the pagan English called the months of December and January “Giuli”, and that their year began on what is now Christmas Eve, which they called Modranecht, “Mothers’ Night”. In Norway, Snorri Sturluson wrote that King Hakon the Good (tenth century) moved the heathen Yule feast to coincide with Christmas. Through the Middle Ages, “Yule” simply meant Christmas in English and the Scandinavian languages, and still does.\n\nThe Yule log, evergreens, wassailing and feasting are folk customs of the Christian centuries, recorded from the 1600s on. Modern Pagans returned the name Yule to the solstice itself and made it one of the eight sabbats.',
    knowAndDont: {
      known:
        'Newgrange and other monuments are aligned to midwinter. The word Yule and a pagan midwinter feast are attested by Bede and the sagas, and Christmas absorbed and kept the name and many customs.',
      unknown:
        'Almost nothing is known of what pagan Yule rites involved beyond feasting, drinking and sacrifice “for a good year”. Claims that the Christmas tree, Yule log or holly are ancient pagan survivals are usually unproven. The Holly King and Oak King story is modern.',
    },
    celebrate: [
      'Keep vigil through the longest night, or wake for the sunrise, and greet the returning sun.',
      'Bring in evergreens: holly, ivy, pine or a living tree, and give the birds some suet or seed.',
      'Burn a Yule log in a safe fireplace, or decorate a log with candles and never leave it burning unattended.',
      'Feast with the people you love, and drink a toast to those who have gone before.',
      'Give gifts made by hand, or give to someone in need.',
    ],
    ritual: { premade: 'wicca-yule-log-sun-vigil' },
    correspondences: {
      deities: ['Frigg', 'Odin', 'Baldur', 'Ra', 'Dazhbog'],
      herbs: ['Holly', 'Mistletoe', 'Juniper', 'Cedar', 'Cinnamon', 'Frankincense'],
      crystals: ['Garnet', 'Ruby', 'Bloodstone', 'Clear Quartz', 'Sunstone'],
      colors: ['Red', 'Green', 'Gold', 'White'],
      foods: ['Spiced cider or mulled wine', 'Gingerbread', 'Roast vegetables', 'Oranges with cloves', 'Yule log cake'],
      symbols: ['Yule log', 'Evergreens', 'Candles', 'The sun wheel', 'Holly and ivy', 'Wreath'],
    },
    sources: [
      'Bede, De temporum ratione, ch. 15 (725); tr. Faith Wallis, Bede: The Reckoning of Time (Liverpool, 1999).',
      'Snorri Sturluson, Heimskringla, Saga of Hakon the Good, ch. 15–16, tr. Samuel Laing (1844): https://www.gutenberg.org/ebooks/598',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 1–10.',
      'Office of Public Works, Brú na Bóinne (Newgrange) visitor information: https://heritageireland.ie/places-to-visit/bru-na-boinne-visitor-centre-newgrange-and-knowth/',
    ],
  },
  // ─── Celtic fire festivals ───────────────────────────────────────────
  {
    ref: 'celtic-la_fheile_bride',
    title: 'Imbolc · Lá Fhéile Bríde',
    aka: ['Imbolc', 'St Brigid’s Day', 'Là Fhèill Brìghde', 'Gŵyl Ffraid', 'Laa’l Breeshey'],
    tradition: 'Celtic',
    summary:
      'The first day of spring in the Gaelic year, 1 February, and the feast of Brigid. Crosses are woven, a cloth is left out for her blessing, and she is welcomed into the house.',
    honours:
      'Brigid: the goddess remembered in medieval Irish learning as poet, healer and smith, and the saint of Kildare, patron of Ireland with Patrick and Columba, of dairymaids, midwives, poets and travellers. The day also honours the turning of the farming year: lambs, milk and the first ploughing.',
    history:
      'Imbolc is named in early Irish literature as one of the four quarter days. A medieval Irish glossary describes a goddess Brigid, daughter of the Dagda, “a goddess whom poets worshipped”, with two sisters of the same name for healing and smithcraft. The saint, Brigid of Kildare, died around 525; her early Lives are full of miracles of milk, butter, fire and hospitality, and in the 1180s Gerald of Wales described a fire at Kildare kept burning by nineteen nuns in turn, with Brigid herself tending it on the twentieth night.\n\nThe customs of her eve were recorded across Ireland, Scotland and Man into the twentieth century. Crosses of rushes or straw were woven and hung above doors and in byres. A strip of cloth, the brat Bríde, was left outside to be touched by the saint as she passed, and kept for curing headaches and sickness. Girls carried a Brídeog, a doll of Brigid, from house to house; in the Hebrides she was laid in a basket bed by the hearth with a white wand, and the ashes checked in the morning for her footprint.\n\nIn 2023 Ireland made the first Monday of February (or 1 February when it falls on a Friday) a public holiday in her honour, and the Brigid’s flame was relit in Kildare in 1993 by the Brigidine Sisters, who still tend it.',
    knowAndDont: {
      known:
        'The date and name are attested in early medieval Irish texts. The goddess is described in a medieval glossary; the saint’s Lives, Gerald’s account of the Kildare fire, and the nineteenth- and twentieth-century folk customs are all well recorded.',
      unknown:
        'We do not know what, if any, pre-Christian rite was held on 1 February, or how far the saint’s customs preserve worship of the goddess. People hold this question in different ways, and the honest answer is that it cannot be proved either way.',
    },
    celebrate: [
      'On the eve, weave a Brigid’s cross from rushes, straw or paper and hang it above the door.',
      'Put a strip of cloth or ribbon outside overnight, and keep it through the year for comfort and healing.',
      'Make up a little bed for Brigid by the hearth or stove, and invite her in with a candle and a word of welcome.',
      'Visit a holy well or spring, or bless a bowl of water at home.',
      'Write or read a poem, mend something, or care for someone who is unwell, in Brigid’s three arts.',
    ],
    ritual: { premade: 'folk-brigid-cross-well' },
    correspondences: {
      deities: ['Brigid', 'The Dagda'],
      herbs: ['Rowan', 'Angelica', 'Chamomile'],
      crystals: ['Amethyst', 'Garnet', 'Bloodstone'],
      colors: ['White', 'Red', 'Green'],
      foods: ['Butter', 'Buttermilk', 'Oatcakes and bannocks', 'Colcannon', 'Barmbrack'],
      symbols: ['Brigid’s cross', 'Brat Bríde', 'Brídeog doll', 'Perpetual flame', 'Holy well'],
    },
    respect:
      'St Brigid’s Day is a living Christian feast in Ireland and the Irish diaspora, and Brigid is also honoured by Irish Pagans and polytheists. If you go to a holy well or to Kildare, behave as you would in a church: be quiet, leave nothing synthetic, and follow local custom. The Brigidine Sisters at Solas Bhríde in Kildare welcome visitors of any faith.',
    sources: [
      'Kuno Meyer (tr.), The Wooing of Emer, CELT: https://celt.ucc.ie/published/T301021/index.html',
      'Alexander Carmichael, Carmina Gadelica vol. 1 (1900): https://archive.org/details/carminagadelicah01carm',
      'Catholic Encyclopedia (1907), “St. Brigid of Ireland”: https://www.newadvent.org/cathen/02784b.htm',
      'Kevin Danaher, The Year in Ireland (Cork, 1972), “The Feast of St Brigid”.',
      'Solas Bhríde Centre, Kildare: https://solasbhride.ie/',
    ],
  },
  {
    ref: 'celtic-bealtaine',
    title: 'Bealtaine',
    aka: ['Beltane', 'Lá Bealtaine', 'May Day', 'Calan Mai', 'Latha Bealltainn', 'Shenn Laa Boaldyn'],
    tradition: 'Celtic',
    summary:
      'The first day of summer in the Gaelic year, 1 May. Fires were lit and cattle driven past them for protection before they went up to summer pastures; dew, blossom and rowan guarded house and herd.',
    honours:
      'The land coming into summer, the herds, the dairy and the household’s luck. The fire itself was the great protector. In Wales, Calan Mai is the start of summer too, and the night before is one of the “spirit nights” when the Otherworld is close.',
    history:
      'Bealtaine is one of the four quarter days of the early Irish texts. A tenth-century glossary says its name meant “lucky fire” and describes two fires made by druids with incantations, between which cattle were driven against disease each year. Later writers placed a great Bealtaine assembly at the Hill of Uisneach, the symbolic centre of Ireland.\n\nFolk custom kept the spirit of protection strong. In Ireland and Scotland the household fire was put out and relit from a bonfire; cattle were driven past the flames or singed with a burning bush; rowan and primroses were placed on doors and byres; the first water drawn from the well and the May dew were prized, and it was unlucky to give away fire, milk or salt on May Day. In the Highlands, a Bealltainn bannock was baked and shared, and one piece marked for whoever must leap the fire.\n\nIn recent years a Bealtaine fire has again been lit at Uisneach as a public festival, and in Wales the old May carols (carolau Mai) are sung again in some places.',
    knowAndDont: {
      known:
        'The quarter day, the protective fires, and the dew, rowan, bannock and dairy customs are well recorded from the medieval period to living memory.',
      unknown:
        'The glossary’s druids are seen through Christian eyes centuries later. We don’t know which gods, if any, were honoured; claims that Bealtaine means “fire of Bel” or honours a god Belenus are guesses that most scholars doubt. The maypole and the May Queen are English customs, not Gaelic ones.',
    },
    celebrate: [
      'Rise early on May morning and wash your face in the dew.',
      'Put primroses, marigolds or a sprig of rowan on your doorstep or windowsill.',
      'Light a fire safely outdoors with others, or a candle at home, and walk around it sunwise for protection through summer.',
      'Bake oatcakes or a bannock, and share it out.',
      'Bless your animals and garden: walk them round, speak a blessing, and check fences and gates.',
    ],
    ritual: { premade: 'folk-bealtaine-dew' },
    correspondences: {
      deities: ['The Dagda', 'Brigid', 'Rhiannon'],
      herbs: ['Rowan', 'Hawthorn', 'Birch', 'Meadowsweet', 'Elder'],
      crystals: ['Carnelian', 'Emerald', 'Red Jasper'],
      colors: ['Green', 'Yellow', 'Red'],
      foods: ['Oatcakes and bannocks', 'Butter and cream', 'Milk', 'Eggs'],
      symbols: ['Twin fires', 'Cattle', 'May bush', 'Rowan and red thread', 'May dew', 'Primroses'],
    },
    sources: [
      'J. A. MacCulloch, The Religion of the Ancient Celts (1911), ch. 18: https://www.gutenberg.org/ebooks/14672',
      'Kevin Danaher, The Year in Ireland (Cork, 1972), “May Day”.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 21.',
      'Kuno Meyer (tr.), The Wooing of Emer, CELT: https://celt.ucc.ie/published/T301021/index.html',
    ],
  },
  {
    ref: 'celtic-lughnasadh',
    title: 'Lughnasadh',
    aka: ['Lúnasa', 'Lammas', 'Garland Sunday', 'Bilberry Sunday', 'Reek Sunday', 'Gŵyl Awst', 'Lughnasa'],
    tradition: 'Celtic',
    summary:
      'The harvest festival of the god Lugh, on 1 August: the start of autumn in the Gaelic year. Assemblies, games, matchmaking, hill-climbing and the first fruits of the harvest.',
    honours:
      'Lugh, the bright, many-skilled god of the Irish tales, and Tailtiu, his foster-mother, who died after clearing the plains of Ireland for farming. It also honours the harvest itself, eaten for the first time, and the end of the “hungry month” of July.',
    history:
      'Medieval Irish texts say that Lugh founded the Óenach Tailten, the assembly at Tailtiu (Teltown, County Meath), as funeral games for his foster-mother. Assemblies, horse races, trading, contests and marriages took place there at the start of August, and similar gatherings were held at other royal sites.\n\nIn folk custom the festival lived on as Garland Sunday, Bilberry Sunday or Height Sunday, at the end of July or start of August. People climbed hills and mountains, picked bilberries, danced and courted, and in many places brought the first new potatoes or a sheaf to the table. Máire MacNeill’s The Festival of Lughnasa (1962) traced these gatherings at nearly two hundred sites and found stories of Lugh defeating a dark figure, Crom Dubh, to win the harvest. The pilgrimage up Croagh Patrick on Reek Sunday and the Puck Fair at Killorglin in August are among its living descendants.\n\nIn Wales the day is Gŵyl Awst, the August feast, and in England it is Lammas.',
    knowAndDont: {
      known:
        'The quarter day, the link with Lugh and Tailtiu in medieval texts, and the hill-top and bilberry customs of later centuries are all well documented.',
      unknown:
        'The medieval accounts are literary and written by Christians. MacNeill’s reconstruction of a myth of Lugh and Crom Dubh is careful but interpretive. We do not know the pre-Christian rites.',
    },
    celebrate: [
      'Climb a hill or walk somewhere high, and leave a small offering of flowers or a little bread at the top (biodegradable only).',
      'Gather bilberries or blackberries where it is allowed, and make a crumble or jam to share.',
      'Eat the first new potatoes, or bake a loaf from the new season’s flour.',
      'Hold games: a race, a contest of skill, a craft swap, in Lugh’s honour as master of all arts.',
      'Make or renew a promise or a friendship; this was a time for bargains, handfasts and agreements.',
    ],
    ritual: {
      title: 'A hill-top first fruits for Lugh',
      outline: [
        'Choose a safe hill, high place or simply your garden, and bring water, a small loaf or some berries, and a ribbon or flower.',
        'At the top, stand and look over the land. Say who you are and that you have come to honour Lugh and Tailtiu at the harvest’s start.',
        'Break the bread or share the berries. Leave a small portion on the earth for Tailtiu and the land, and eat the rest.',
        'Name one skill you want to grow this coming season, and ask Lugh, master of every art, to help you learn it.',
        'Tie the ribbon to your bag or a garden plant (not a wild tree), and take it home as a reminder.',
        'Walk down with thanks, and take all your rubbish with you.',
      ],
    },
    correspondences: {
      deities: ['Lugh', 'The Dagda'],
      herbs: ['Meadowsweet', 'Calendula', 'Yarrow', 'Oak'],
      crystals: ['Citrine', 'Carnelian', 'Peridot'],
      colors: ['Gold', 'Orange', 'Green'],
      foods: ['Bilberries', 'New potatoes', 'Bread from new flour', 'Blackberries', 'Ale or cider'],
      symbols: ['The hill', 'Bilberries', 'First sheaf', 'Spear of Lugh', 'Games and races'],
    },
    sources: [
      'Máire MacNeill, The Festival of Lughnasa (Oxford, 1962).',
      'J. A. MacCulloch, The Religion of the Ancient Celts (1911), ch. 18: https://www.gutenberg.org/ebooks/14672',
      'Kevin Danaher, The Year in Ireland (Cork, 1972), “Lúnasa”.',
      'Kuno Meyer (tr.), The Wooing of Emer, CELT: https://celt.ucc.ie/published/T301021/index.html',
    ],
  },
  {
    ref: 'celtic-samhain_gaelic',
    title: 'Samhain (Oíche Shamhna)',
    aka: ['Samhain', 'Samhuinn', 'Halloween', 'Oíche Shamhna', 'Calan Gaeaf', 'Hop-tu-Naa'],
    tradition: 'Celtic',
    summary:
      '“Summer’s end”, kept from sunset on 31 October: the start of winter and, in many tellings, of the Gaelic year. The Otherworld draws near, fires are lit, guisers go door to door, and food is set out for the dead.',
    honours:
      'The dead of the household and the community, and the beings of the síde, the Otherworld hills, who move about on this night. It also marks the herds brought down from summer pastures and the end of the farming year.',
    history:
      'In the earliest Irish literature Samhain is a time of assemblies and feasting, and of crossing between worlds. In one tale the hero Nera goes out on Samhain night and finds his way into the síd of Crúachan; in others, Otherworld women and warriors appear, and kings meet their deaths. The great feast of Tara was said to be held at Samhain.\n\nIrish, Scottish and Manx folklore kept the night as one for fires and protection, for guising and mischief, and for fortune-telling about love and death: nuts set to burn on the hearth, apples bobbed or peeled, cabbages pulled blindfold. A place might be left at the table and the door unlatched for the dead. In Wales the eve of Calan Gaeaf was an ysbrydnos, a spirit night, when it was wise to hurry home before the tailless black sow, the hwch ddu gwta, caught you. On the Isle of Man the night is Hop-tu-Naa, with turnip lanterns and songs still today.\n\nThe church feasts of All Saints and All Souls were placed beside it, and Halloween as the world knows it grew from both.',
    knowAndDont: {
      known:
        'Samhain as an Otherworld-haunted assembly time is well established in medieval texts. The folk customs of fires, guising, divination and the dead are richly recorded in the eighteenth to twentieth centuries.',
      unknown:
        'There is no reliable description of pagan Samhain worship. Stories of druid sacrifices or of a god of death called Samhain are modern errors. Whether it began the year is likely but not proven; the idea comes partly from nineteenth-century scholars.',
    },
    celebrate: [
      'Light a candle in the window to guide the dead home, and say their names.',
      'Set a plate of food and a cup aside for them at dinner, and give it to the earth in the morning.',
      'Carve a turnip lantern (the older way) and put it by the door.',
      'Play the old divination games with apples and nuts, with friends, for fun and for meaning.',
      'Visit the graves of your people, or a local graveyard, and tidy one neglected stone.',
    ],
    ritual: { premade: 'hedge-ancestor-candle-evening' },
    correspondences: {
      deities: ['The Morrigan', 'The Dagda', 'Cerridwen', 'Manannán mac Lir'],
      herbs: ['Rowan', 'Yew', 'Mugwort', 'Elder'],
      crystals: ['Jet', 'Obsidian', 'Smoky Quartz'],
      colors: ['Black', 'Orange', 'White'],
      foods: ['Barmbrack', 'Colcannon', 'Apples and nuts', 'Champ', 'Oatcakes'],
      symbols: ['Turnip lantern', 'Bonfire', 'Masks and guisers', 'Apples', 'The síd mound', 'Unlatched door'],
    },
    sources: [
      'J. A. MacCulloch, The Religion of the Ancient Celts (1911), ch. 18: https://www.gutenberg.org/ebooks/14672',
      'Kevin Danaher, The Year in Ireland (Cork, 1972), “Samhain”.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 36–37.',
      'Trefor M. Owen, Welsh Folk Customs (Cardiff, 1959).',
    ],
  },

  // ─── Norse & Heathen ─────────────────────────────────────────────────
  {
    ref: 'norse-thorrablot',
    title: 'Þorrablót',
    aka: ['Thorrablot', 'Bóndadagur', 'Husbands’ Day', 'Midwinter feast'],
    tradition: 'Norse & Heathen',
    summary:
      'The feast at the start of Þorri, the old Icelandic midwinter month, beginning on a Friday in late January. Icelanders gather to eat traditional preserved foods, sing and drink toasts through the worst of the winter.',
    honours:
      'Þorri, the personification of deep winter, and the endurance of the people who got through it. Modern heathens also honour the gods, the land spirits and the ancestors who kept the old food and the old calendar alive.',
    history:
      'Þorri is the fourth month of winter in the old Icelandic calendar, which counted the year in weeks of summer and winter rather than by the Roman months. A medieval story (in Orkneyinga saga and the related tale “How Norway was settled”) makes Þorri a king who held a sacrifice at midwinter, called the þorrablót, and whose daughter Gói vanished and was searched for until the next month, which bears her name.\n\nIn later Icelandic folk custom the first day of Þorri was Bóndadagur, the farmer’s or husbands’ day: the man of the house was said to go out in his shirt with one trouser leg on, hopping round the house to welcome Þorri in. The feast itself was revived in the nineteenth century by Icelandic students and societies, beginning in 1873, as part of the national awakening. In 1958 the Reykjavík restaurant Naustið began serving “þorramatur” in wooden troughs, and the modern feast took shape.\n\nToday Þorrablót is kept all over Iceland and by Icelandic communities abroad, and the Ásatrúarfélagið (Iceland’s modern heathen fellowship) holds its own blót at this season.',
    knowAndDont: {
      known:
        'The month of Þorri and the custom of Bóndadagur are genuinely old Icelandic tradition. The name þorrablót appears in a medieval story, and the modern feast and its food date from 1873 and 1958.',
      unknown:
        'We do not know if a real midwinter sacrifice called þorrablót was ever held in heathen times; the medieval story may be a learned tale explaining month names. Þorri may have been a winter spirit or a by-name of Thor, but that is speculation.',
    },
    celebrate: [
      'Share a winter feast of preserved foods: smoked or cured meat, dried fish, pickles, rye bread, butter.',
      'Toast the gods, the land and the ancestors with ale, mead or a non-alcoholic drink, and pass the cup round.',
      'On the first morning, bring breakfast or a small gift to the husband, partner or farmer of the household.',
      'Sing, tell winter stories, or read a saga aloud by candlelight.',
      'Check on neighbours and elders who may struggle in the cold.',
    ],
    ritual: { premade: 'folk-simple-blot' },
    correspondences: {
      deities: ['Thor', 'Odin', 'Skadi'],
      herbs: ['Juniper', 'Birch', 'Yarrow'],
      crystals: ['Hematite', 'Smoky Quartz', 'Clear Quartz'],
      colors: ['White', 'Red', 'Black'],
      foods: ['Hangikjöt (smoked lamb)', 'Harðfiskur (dried fish)', 'Rúgbrauð (rye bread)', 'Butter', 'Pickled foods', 'Brennivín or ale'],
      symbols: ['Wooden trough (trog)', 'Drinking horn', 'Snow', 'The hearth fire'],
    },
    sources: [
      'Árni Björnsson, Icelandic Feasts and Holidays (Reykjavík, 1980).',
      'Orkneyinga saga, ch. 1–3, tr. Jon A. Hjaltalin and Gilbert Goudie (1873).',
      'Icelandic Canadian Club of Toronto, “History of Thorrablot”: https://www.icct.info/history-of-thorrablot',
      'Lögberg-Heimskringla, 17 February 1995, p. 8 (on Naustið and þorramatur): https://timarit.is/page/2239925',
    ],
  },
  {
    ref: 'norse-disablot',
    title: 'Dísablót',
    aka: ['Disablot', 'Dísting', 'Disting', 'Blót to the dísir'],
    tradition: 'Norse & Heathen',
    summary:
      'A sacrifice to the dísir, the female guardian spirits and ancestral mothers of a family. Many modern heathens keep it in late winter around the February full moon, after the Swedish Dísting held at Uppsala.',
    honours:
      'The dísir: protective female powers who watch over a family line, who may be ancestral mothers, goddesses, or something in between. Freyja is called Vanadís, “dís of the Vanir”, and Frigg is often honoured too. It is also a time to remember the women of your own line.',
    history:
      'Several sagas mention a dísablót. In Ynglinga saga, the Swedish king Aðils rides around the hall at Uppsala during the dísablót, falls from his horse and dies. In Egils saga a dísablót is held at a farm in Norway in autumn, with heavy drinking. In Víga-Glúms saga a feast for the dísir is held at the Winter Nights in mid-October. So in the sagas the date varies.\n\nThe late-winter date comes from Sweden. Snorri Sturluson wrote that in heathen times the chief sacrifice of the Swedes was held at Uppsala in the month of Gói (February to March), with a great assembly and market that lasted a week. After conversion the market was moved to Candlemas; Swedish sources call it Dísting, the “Thing of the dísir”, and a Disting market is still held in Uppsala each February.\n\nModern heathens therefore keep Dísablót either at the Winter Nights or in late winter, many at the full moon of February.',
    knowAndDont: {
      known:
        'Dísablót is named in several sagas; the Uppsala assembly in late winter is described by Snorri; the Disting market is historical and still runs.',
      unknown:
        'Who the dísir were is not clear: ancestors, fate-women, valkyrie-like beings or minor goddesses. The sagas were written down by Christians two or three centuries after conversion. Whether the Uppsala assembly was itself a dísablót, rather than a general sacrifice, is debated.',
    },
    celebrate: [
      'Set a candle by photos or names of the women of your family, your mothers’ line, or women who mothered you.',
      'Pour a little mead, milk or juice to the dísir and ask for their protection over your household.',
      'Cook a dish from your grandmothers’ kitchens, or one from the region your people came from.',
      'Write a short letter of thanks to a woman, living or dead, who shaped you.',
      'If family history is painful, honour the protective spirits of your chosen family instead; that is fully in keeping.',
    ],
    ritual: {
      premade: 'folk-simple-blot',
      title: 'A blót for the dísir',
      outline: [
        'At dusk, set a cloth with a candle, a bowl, and a horn or cup of mead, milk or juice. Add names or photos of the women of your line.',
        'Light the candle and say you are holding blót for the dísir who guard your family.',
        'Hallow the drink by raising it and asking the dísir to receive it. Drink a little.',
        'Speak to them: thanks for protection, and one thing you ask for the household this year.',
        'Pour the rest into the bowl, and later onto the earth outside.',
        'Sit a while in quiet before putting out the candle.',
      ],
    },
    correspondences: {
      deities: ['Freyja', 'Frigg'],
      herbs: ['Mugwort', 'Yarrow', 'Birch', 'Juniper'],
      crystals: ['Moonstone', 'Amber', 'Garnet'],
      colors: ['Red', 'White', 'Silver'],
      foods: ['Mead or milk', 'Porridge with butter', 'Bread', 'Family recipes'],
      symbols: ['Drinking horn', 'Spindle', 'Keys of the household', 'The full moon'],
    },
    sources: [
      'Snorri Sturluson, Heimskringla, Saga of Olaf Haraldson, ch. 76–77, tr. Samuel Laing (1844): https://www.gutenberg.org/ebooks/598',
      'Snorri Sturluson, Ynglinga saga, ch. 29 (Aðils at the dísablót).',
      'Egils saga Skalla-Grímssonar, ch. 44; Víga-Glúms saga, ch. 6.',
      'Rudolf Simek, Dictionary of Northern Mythology (Cambridge, 1993), “dísir”, “dísablót”.',
    ],
  },
  {
    ref: 'norse-sigrblot',
    title: 'Sigrblót · Sumardagurinn fyrsti',
    aka: ['Sigrblót', 'Sigurblót', 'First Day of Summer', 'Sumardagurinn fyrsti', 'Summer Finding'],
    tradition: 'Norse & Heathen',
    summary:
      'The first day of summer in the old Icelandic year, the first Thursday after 18 April. The sagas speak of a sacrifice at summer’s start “for victory”, for the season of voyages and undertakings ahead.',
    honours:
      'Odin, giver of victory, and the gods and land spirits who favour a good season. In Iceland the day honours summer itself, with gifts for children and gladness after the long winter.',
    history:
      'Snorri Sturluson writes in Ynglinga saga that Odin set three great sacrifices: one at the beginning of winter for a good year, one at midwinter for growth, and a third at the beginning of summer, for victory. Summer was the season for raiding, trading and travel, so the third blót asked for success in what lay ahead.\n\nThe old Icelandic calendar divides the year into summer and winter, and the first day of summer still falls on a Thursday between 19 and 25 April. Sumardagurinn fyrsti is a public holiday in Iceland, kept with parades, scouts, sports and summer gifts (sumargjafir), a custom older than Christmas presents there. Folk belief held that if summer and winter “froze together” the night before, with frost, it would be a good summer.\n\nMany modern heathens keep Sigrblót on this day or around the spring equinox.',
    knowAndDont: {
      known:
        'Snorri records the three seasonal sacrifices and names the summer one as for victory. The Icelandic first day of summer and its gift custom are long-standing and still kept.',
      unknown:
        'Snorri wrote in the thirteenth century, as a Christian, and presented Odin as a human king; we can’t be sure how the blót was really held or whether it was kept everywhere.',
    },
    celebrate: [
      'Give a small summer gift to a child or friend.',
      'Hold a blót for success: name one undertaking for the summer and ask Odin or your gods for victory in it.',
      'Get outside: plan the first long walk, sail, journey or project of the season.',
      'Watch for frost the night before, and see if summer and winter “freeze together”.',
      'Clean and ready your tools, bike, boots or boat for the months ahead.',
    ],
    ritual: { premade: 'folk-simple-blot' },
    correspondences: {
      deities: ['Odin', 'Thor', 'Tyr', 'Freyr'],
      herbs: ['Birch', 'Yarrow', 'Oak'],
      crystals: ['Tiger Eye', 'Carnelian', 'Bloodstone'],
      colors: ['Red', 'Gold', 'Green'],
      foods: ['Pancakes', 'Mead or ale', 'Fresh bread', 'Smoked fish'],
      symbols: ['The ship', 'Spear', 'First flowers', 'Sun'],
    },
    sources: [
      'Snorri Sturluson, Ynglinga saga, ch. 8; in Heimskringla, tr. Lee M. Hollander (Austin, 1964).',
      'Árni Björnsson, Icelandic Feasts and Holidays (Reykjavík, 1980).',
      'Government of Iceland, public holidays: https://www.government.is/topics/foreign-affairs/protocol/public-holidays/',
    ],
  },
  {
    ref: 'norse-midsummer',
    title: 'Midsummer (Miðsumar)',
    aka: ['Midsommar', 'Miðsumar', 'Jónsmessa', 'Sankthans', 'Summer Solstice'],
    tradition: 'Norse & Heathen',
    summary:
      'The height of the sun’s power at the summer solstice: bonfires, flowers, feasting and gathering, the season when the old assemblies met.',
    honours:
      'The sun and the full green earth; Baldur, the shining god whose death many modern heathens link with the turning of the light; Freyr and Freyja for fertility and plenty; and the community gathered together.',
    history:
      'There is no clear record of a heathen midsummer blót in the sagas; Snorri’s three great sacrifices are at winter, midwinter and summer’s start. But midsummer was a time of gathering: Iceland’s Althing, the national assembly founded in 930, met at Þingvellir for two weeks in June, with law, trade, marriages and feuds.\n\nIn the Christian centuries Scandinavians kept St John’s Eve (Jónsmessa in Iceland, Sankthans in Norway and Denmark) with bonfires and herbs. In Iceland, it was said that cows could speak, seals take human form, and the dew of Jónsmessunótt had healing power if you rolled in it naked. In Sweden, midsommar is the great national festival: a flower-decked pole raised and danced around, wreaths, herring, new potatoes and strawberries, and girls putting seven flowers under their pillows to dream of a husband. The Swedish midsummer pole was probably borrowed from the German maypole in the late Middle Ages.\n\nModern heathens keep the solstice as one of the high points of the year.',
    knowAndDont: {
      known:
        'The Althing’s June assembly is historical. Scandinavian midsummer bonfires, dew, herb and flower customs are well recorded in Christian times.',
      unknown:
        'Whether there was a specific midsummer sacrifice in heathen Scandinavia is uncertain; the sources are silent. The link of Baldur with midsummer is a modern interpretation, influenced by Frazer.',
    },
    celebrate: [
      'Gather wildflowers for a wreath (pick only common flowers, a few of each).',
      'Hold a bonfire or a candle-lit supper outdoors, safely, and stay up for the light night.',
      'Eat the Swedish way: new potatoes, dill, pickled herring or smoked fish, strawberries and cream.',
      'Put seven different flowers under your pillow and see what you dream.',
      'Meet with your community: a gathering, a picnic, a group decision or a promise renewed.',
    ],
    ritual: { premade: 'green-harvesting-herbs-with-thanks' },
    correspondences: {
      deities: ['Baldur', 'Freyr', 'Freyja', 'Thor'],
      herbs: ['St John’s Wort', 'Birch', 'Yarrow', 'Meadowsweet', 'Oak'],
      crystals: ['Sunstone', 'Amber', 'Citrine'],
      colors: ['Gold', 'Yellow', 'Green', 'Blue'],
      foods: ['New potatoes with dill', 'Pickled herring', 'Strawberries and cream', 'Mead or ale'],
      symbols: ['Bonfire', 'Midsummer pole', 'Flower wreath', 'Sun wheel', 'Dew'],
    },
    sources: [
      'Árni Björnsson, Icelandic Feasts and Holidays (Reykjavík, 1980), “Jónsmessa”.',
      'Jesse Byock, Viking Age Iceland (London, 2001), on the Althing.',
      'Þingvellir National Park, history of the Althing: https://www.thingvellir.is/en/history/',
      'James George Frazer, The Golden Bough (abridged 1922), ch. 62–65: https://www.gutenberg.org/ebooks/3623',
    ],
  },
  {
    ref: 'norse-haustblot',
    title: 'Haustblót',
    aka: ['Autumn blót', 'Harvest blót', 'Autumn Equinox'],
    tradition: 'Norse & Heathen',
    summary:
      'An autumn harvest blót kept by many modern heathens at the equinox, giving thanks to the gods and the land for the year’s harvest.',
    honours:
      'Freyr, lord of harvest, peace and plenty; Sif of the golden hair, often linked by modern heathens with ripe grain; Thor who blesses the fields with rain; and the land spirits (landvættir) who share the land with us.',
    history:
      'The sagas speak of a sacrifice at the start of winter, in mid-October, “for a good year”, and of toasts at feasts to Njord and Freyr “for good seasons and peace”. A separate autumn equinox blót is not recorded; Haustblót, “autumn sacrifice”, is a modern name for a modern observance, though the thanksgiving it expresses is very old.\n\nIn Scandinavian folk custom the end of harvest had its own rites. The last sheaf was left for Odin’s horse or the birds, or made into a figure; a harvest feast was held for the workers. In Norway and Sweden a sheaf of grain, the julenek, was later set out for the birds at Christmas.\n\nMany heathen groups now keep an autumn blót at the equinox, and some move it to the Winter Nights.',
    knowAndDont: {
      known:
        'Seasonal sacrifices for a good year and toasts for harvest and peace are attested in the sagas; harvest-end customs are recorded in Scandinavian folklore.',
      unknown:
        'There is no evidence of a heathen equinox festival. Sif’s link with grain is a modern reading of her golden hair, not something the sources state.',
    },
    celebrate: [
      'Bake bread or cook with the harvest and set the first portion aside for the land spirits.',
      'Hold a blót of thanks, naming everything the year has given you.',
      'Leave a sheaf, seed head or handful of grain out for the birds.',
      'Put your garden to bed, saving seed for next year.',
      'Share food with someone who needs it.',
    ],
    ritual: {
      premade: 'folk-gratitude-ritual',
      title: 'Harvest thanks to Freyr and the land',
      outline: [
        'Set out bread, apples or produce from your area, a cup of mead, cider or juice, and a bowl.',
        'Hallow the space by walking round it with a lit candle, and say that you have come to give thanks.',
        'Raise the cup to Freyr for the harvest and to the landvættir for sharing the land, and drink.',
        'Name aloud what the year has brought, good and hard.',
        'Pour the rest of the cup into the bowl, and take it and some of the food outside for the land.',
        'Share the remaining food with your household.',
      ],
    },
    correspondences: {
      deities: ['Freyr', 'Freyja', 'Thor'],
      herbs: ['Oak', 'Birch', 'Rowan', 'Yarrow'],
      crystals: ['Amber', 'Tiger Eye', 'Moss Agate'],
      colors: ['Gold', 'Brown', 'Green'],
      foods: ['Bread', 'Apples', 'Mead or cider', 'Barley', 'Root vegetables'],
      symbols: ['Last sheaf', 'Boar', 'Drinking horn', 'Golden grain'],
    },
    sources: [
      'Snorri Sturluson, Heimskringla, Saga of Hakon the Good, ch. 16, tr. Samuel Laing (1844): https://www.gutenberg.org/ebooks/598',
      'Rudolf Simek, Dictionary of Northern Mythology (Cambridge, 1993), “blót”.',
      'Hilda Ellis Davidson, Myths and Symbols in Pagan Europe (Manchester, 1988).',
    ],
  },
  {
    ref: 'norse-vetrnaetur',
    title: 'Winter Nights (Vetrnætur)',
    aka: ['Vetrnætur', 'Fyrsti vetrardagur', 'Álfablót', 'Dísablót', 'First Day of Winter'],
    tradition: 'Norse & Heathen',
    summary:
      'The start of winter in the Icelandic year, a Saturday in late October. The sagas tell of a blót “for a good year”, and it is a time to honour the álfar (elves) and the dísir.',
    honours:
      'The gods, for a good year; the álfar, spirits of the land and of the mound-dwelling dead; the dísir, protective ancestral mothers; and the household itself, as the herds come in and winter closes round.',
    history:
      'In the old Icelandic calendar winter begins on a Saturday between 21 and 27 October, and the two “winter nights” before it were a time of feasting. Snorri’s list of Odin’s sacrifices puts the first at the beginning of winter, for a good year. In Gísla saga a Winter Nights feast is held and Þorgrímr sacrifices to Freyr; in Víga-Glúms saga there is a feast for the dísir at the Winter Nights.\n\nThe Icelandic skald Sigvatr Þórðarson, travelling through Sweden around 1019, wrote verses about being turned away from farm after farm because the people inside were holding álfablót, a sacrifice to the elves, and would not let a stranger in. It is one of the few eyewitness glimpses of a private heathen rite.\n\nToday Fyrsti vetrardagur is still marked in Iceland, and many heathens keep the Winter Nights with blót to the álfar, dísir and ancestors, much as others keep Samhain.',
    knowAndDont: {
      known:
        'The date is part of the old Icelandic calendar. Winter Nights feasts and sacrifices appear in several sagas, and Sigvatr’s álfablót verses are a contemporary eleventh-century source.',
      unknown:
        'Sigvatr does not say what the álfablót involved, only that it was private and closed to strangers. Who the álfar were exactly, and how they relate to the dead, is debated.',
    },
    celebrate: [
      'Close the house for the evening: just family or close friends, as in the old álfablót.',
      'Set out an offering of food and drink for the álfar and the land spirits, outside or at the threshold.',
      'Honour the dísir and ancestors with a candle and their names.',
      'Bring the garden in, store food, and check your winter supplies.',
      'Drink to a good winter and a good year.',
    ],
    ritual: { premade: 'hedge-ancestor-candle-evening' },
    correspondences: {
      deities: ['Freyr', 'Freyja', 'Odin', 'Frigg'],
      herbs: ['Juniper', 'Yew', 'Rowan', 'Mugwort'],
      crystals: ['Jet', 'Smoky Quartz', 'Amber'],
      colors: ['Black', 'Red', 'Brown'],
      foods: ['Roast meat or stew', 'Porridge with butter', 'Mead or ale', 'Bread'],
      symbols: ['Closed door', 'Burial mound', 'Drinking horn', 'First frost'],
    },
    sources: [
      'Sigvatr Þórðarson, Austrfararvísur (c. 1019), in Heimskringla, Saga of Olaf Haraldson.',
      'Gísla saga Súrssonar, ch. 15; Víga-Glúms saga, ch. 6.',
      'Snorri Sturluson, Ynglinga saga, ch. 8.',
      'Rudolf Simek, Dictionary of Northern Mythology (Cambridge, 1993), “álfablót”, “vetrnætur”.',
    ],
  },
  {
    ref: 'norse-jol',
    title: 'Yule (Jól)',
    aka: ['Jól', 'Jul', 'Jólablót', 'Midwinter', 'Yuletide'],
    tradition: 'Norse & Heathen',
    summary:
      'The great midwinter feast, traditionally kept for twelve nights: drinking to the gods and the ancestors for a good year and peace, and welcoming back the sun.',
    honours:
      'Odin, the Yule-father (Jólnir is one of his names); Njord and Freyr for a good year and peace; Thor; the dead, who were remembered with a memorial cup; and the household gathered round the fire.',
    history:
      'Jól is the oldest name we have for a Germanic midwinter feast. Snorri Sturluson says that before King Hakon the Good, heathen Yule began on “slaughter night” at midwinter and was kept for three nights, and that Hakon made a law that it should begin at the same time as the Christian feast, with every household brewing ale for it. He also describes how a sacrificial feast was held: blood sprinkled with twigs, meat boiled for everyone, and toasts passed over the fire, first to Odin for victory and power, then to Njord and Freyr for good seasons and peace, then the bragafull, and a memorial cup for kinsmen who had died.\n\nYule merged with Christmas, and “jul” still means Christmas in Scandinavia. Folk custom kept many old elements: Yule ale, the Yule goat, the sheaf for the birds, food left out for the house spirit (nisse or tomte), and the belief that the dead and the Wild Hunt are abroad.\n\nMost modern heathens keep Jól from the solstice for twelve nights, with the first night as Mother Night after Bede.',
    knowAndDont: {
      known:
        'Snorri’s account of the Yule law and of how toasts were made is a key source. The word jól, the Yule ale, and the folk customs of the house spirit and the Yule goat are well documented.',
      unknown:
        'Snorri wrote about two centuries after Hakon. The exact date of heathen Yule (a full moon, the solstice, or mid-January) is debated, and the “twelve nights” is a Christian period that modern heathens have taken over.',
    },
    celebrate: [
      'Brew or buy a Yule ale, mead or cider, and drink toasts over the fire: to the gods, to a good year and peace, and to your dead.',
      'Leave porridge with butter out for the house spirit on Yule night.',
      'Put out a sheaf of grain or seed for the birds.',
      'Keep the twelve nights with a small candle or toast each night, and some quiet reflection.',
      'Make an oath for the coming year over the cup, and keep it short and realistic.',
    ],
    ritual: {
      premade: 'folk-simple-blot',
      title: 'Yule toasts (full)',
      outline: [
        'Light the hearth or candles and gather your household with a horn or cup of ale, mead or juice.',
        'First toast, to Odin: for wisdom and strength in the year ahead.',
        'Second toast, to Njord and Freyr: til árs ok friðar, “for a good year and peace”.',
        'A bragafull: anyone may make a promise or a boast for the coming year.',
        'The minni: name and drink to those who have died.',
        'Pour the last of the cup outside for the land and the dead.',
      ],
    },
    correspondences: {
      deities: ['Odin', 'Frigg', 'Freyr', 'Thor', 'Baldur'],
      herbs: ['Juniper', 'Holly', 'Mistletoe', 'Birch', 'Cinnamon'],
      crystals: ['Garnet', 'Amber', 'Bloodstone', 'Clear Quartz'],
      colors: ['Red', 'Green', 'Gold', 'White'],
      foods: ['Roast pork or ham', 'Yule ale or mead', 'Rice porridge', 'Gingerbread', 'Spiced bread'],
      symbols: ['Yule goat', 'Drinking horn', 'Sun wheel', 'Evergreens', 'Sheaf for the birds', 'Wild Hunt'],
    },
    sources: [
      'Snorri Sturluson, Heimskringla, Saga of Hakon the Good, ch. 15–16, tr. Samuel Laing (1844): https://www.gutenberg.org/ebooks/598',
      'Bede, De temporum ratione, ch. 15 (725).',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 1.',
      'Rudolf Simek, Dictionary of Northern Mythology (Cambridge, 1993), “jól”.',
    ],
  },
  // ─── Hellenic festivals (Attic calendar) ─────────────────────────────
  {
    ref: 'hellenic-kronia',
    title: 'Kronia',
    aka: ['Cronia', 'Festival of Kronos'],
    tradition: 'Hellenic',
    summary:
      'The festival of Kronos on 12 Hekatombaion, in high summer, when masters and the enslaved feasted at the same table in memory of the Golden Age.',
    honours:
      'Kronos, the Titan who ruled before Zeus, and his consort Rhea. In his reign, Hesiod says, people lived like gods, without toil or grief, and the earth gave its fruit freely. The Kronia remembers that lost age of equality and plenty.',
    history:
      'The Kronia was one of the older festivals of Athens, held in the first month of the year, after the harvest. Demosthenes mentions it as a day when the Council did not sit. The Roman writer Macrobius, quoting the Athenian historian Philochorus and the poet Accius, says that at the Kronia heads of households ate with their slaves and served them, and that the Greeks honoured Kronos with this custom long before the Romans kept the Saturnalia.\n\nKronos and Rhea had a sanctuary in Athens near the Olympieion. The festival was a reversal of the everyday order, a glimpse of the world as it was imagined before hierarchy, labour and law.\n\nModern Hellenic polytheists keep the Kronia as a day of shared food and equality, and some use it to reflect on justice and labour today.',
    knowAndDont: {
      known:
        'The date, the feast of masters and slaves together, and the link with the Golden Age are attested by Philochorus (via Macrobius), Accius, and Athenian inscriptions and speeches.',
      unknown:
        'We know little about any public sacrifice or temple rite. The festival’s meaning was already being explained by ancient writers in different ways.',
    },
    celebrate: [
      'Cook a meal and serve the people who usually serve you: housemates, carers, staff, parents.',
      'Eat together at one table with no head and no ranks.',
      'Give a day’s pay, or a day of work, to a cause that supports workers or people in poverty.',
      'Read Hesiod’s Golden Age passage in Works and Days (lines 109–126) and talk about what a fair world would look like.',
      'Pour a libation to Kronos and Rhea for abundance shared.',
    ],
    ritual: {
      premade: 'folk-khernips-libation',
      title: 'A Golden Age table',
      outline: [
        'Wash your hands in khernips, then light a candle for Hestia.',
        'Lay one table for everyone, with the best food you can manage, and seat people at random.',
        'Pour a little wine, juice or water to Kronos and Rhea, asking for a world with enough for all.',
        'Let the person who usually cooks or serves be served first.',
        'At the end, each person names one thing they will do to share more fairly in the coming year.',
      ],
    },
    correspondences: {
      deities: ['Kronos', 'Rhea', 'Demeter'],
      herbs: ['Bay', 'Basil', 'Thyme'],
      crystals: ['Citrine', 'Smoky Quartz', 'Onyx'],
      colors: ['Gold', 'Black'],
      foods: ['Barley bread', 'Figs', 'Honey cakes', 'Wine mixed with water', 'Summer fruit'],
      symbols: ['The sickle', 'The shared table', 'Golden Age'],
    },
    sources: [
      'Macrobius, Saturnalia 1.7.37 and 1.10.22 (quoting Accius and Philochorus): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Macrobius/Saturnalia/home.html',
      'Hesiod, Works and Days 109–126, tr. H. G. Evelyn-White (1914): https://www.theoi.com/Text/HesiodWorksDays.html',
      'H. W. Parke, Festivals of the Athenians (London, 1977), Hekatombaion.',
      'Theoi Project, “Kronos”: https://www.theoi.com/Titan/TitanKronos.html',
    ],
  },
  {
    ref: 'hellenic-panathenaia',
    title: 'Panathenaia',
    aka: ['Panathenaea', 'Great Panathenaia', 'Athena’s birthday'],
    tradition: 'Hellenic',
    summary:
      'Athena’s birthday festival, on 28 Hekatombaion. A great procession brings her ancient statue a newly woven robe, the peplos, with a hecatomb sacrifice, games and contests.',
    honours:
      'Athena Polias, guardian of the city, goddess of wisdom, weaving and crafts, of the olive and of disciplined courage. The festival honoured her as the heart of Athens, and the city honoured itself through her.',
    history:
      'The Panathenaia was the greatest festival of Athens. Every year there was a sacrifice and procession; every fourth year, from 566 BCE, the Great Panathenaia added athletic, musical and equestrian contests over several days. Prizes were large painted amphorae of oil from Athena’s sacred olive trees.\n\nThe heart of the festival was the peplos, a saffron-yellow robe woven by Athenian women and girls over nine months, decorated with the battle of the gods and giants. It was carried in the procession, which went from the Dipylon gate through the Agora to the Acropolis, where it was given to the old olive-wood statue of Athena Polias. A night-long celebration (pannychis) with torch races and dancing came before the procession, and a hecatomb of cattle was sacrificed, with meat shared among the citizens.\n\nThe frieze of the Parthenon, now mostly in the British Museum, is often read as a picture of this procession.',
    knowAndDont: {
      known:
        'The procession, the peplos, the sacrifice and the contests are described in inscriptions, ancient writers and vase paintings; prize amphorae survive in their hundreds.',
      unknown:
        'Whether the Parthenon frieze really shows the Panathenaic procession is debated. Details of the order of events changed over time, and some aspects are reconstructed from scattered evidence.',
    },
    celebrate: [
      'Weave, sew, knit or mend something as a gift to Athena, or finish a craft you started.',
      'Pour olive oil as an offering, and cook with good oil in her honour.',
      'Walk in procession, alone or with friends, to a high point in your town.',
      'Hold a friendly contest: a race, a reading, a quiz, a song.',
      'Do a civic good deed: volunteer, write to a representative, care for a public space.',
    ],
    ritual: {
      premade: 'folk-khernips-libation',
      title: 'A peplos for Athena',
      outline: [
        'Prepare a small piece of cloth or ribbon you have woven, sewn or embroidered over the past weeks, or a new scarf.',
        'Wash your hands in khernips and light a lamp for Hestia.',
        'Carry the cloth in a short procession through your home to your altar or a high window.',
        'Offer it to Athena, with a pinch of incense and a few drops of olive oil.',
        'Ask her for wisdom in your work and courage in your city.',
        'Keep the cloth on her image or altar through the year.',
      ],
    },
    correspondences: {
      deities: ['Athena', 'Hephaestus', 'Erechtheus'],
      herbs: ['Bay', 'Frankincense', 'Thyme'],
      crystals: ['Lapis Lazuli', 'Clear Quartz', 'Sodalite'],
      colors: ['Yellow', 'Blue', 'Gold'],
      foods: ['Olives and olive oil', 'Barley cakes', 'Honey', 'Figs'],
      symbols: ['The owl', 'The olive tree', 'The peplos', 'Panathenaic amphora', 'Torch race'],
    },
    sources: [
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Panathenaea”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Panathenaea.html',
      'Jenifer Neils (ed.), Goddess and Polis: The Panathenaic Festival in Ancient Athens (Princeton, 1992).',
      'H. W. Parke, Festivals of the Athenians (London, 1977).',
      'Theoi Project, “Athena”: https://www.theoi.com/Olympios/Athena.html',
    ],
  },
  {
    ref: 'hellenic-eleusinia',
    title: 'Eleusinian Mysteries',
    aka: ['Greater Mysteries', 'Eleusinia', 'Mysteria'],
    tradition: 'Hellenic',
    summary:
      'The Greater Mysteries of Demeter and Persephone at Eleusis, 15–23 Boedromion: the most revered initiation of the ancient world, about loss, return and the promise of a better lot after death.',
    honours:
      'Demeter, mother of grain, and her daughter Persephone (Kore), taken by Hades and returned to her for part of each year. Also Iakchos, who led the procession, and the gods of the underworld. The Mysteries offered initiates a blessed afterlife.',
    history:
      'For nearly two thousand years, people came from all over the Greek and later Roman world to be initiated at Eleusis, near Athens. Men and women, free and enslaved, could take part if they spoke Greek and were free of blood-guilt. The Homeric Hymn to Demeter tells the founding story: Demeter, grieving for her stolen daughter, came to Eleusis disguised as an old woman, and when Persephone was restored, she taught the rites to the people there. The hymn says: “Happy is he among men upon earth who has seen these mysteries; but he who is uninitiate and who has no part in them, never has lot of like good things once he is dead, down in the darkness and gloom.”\n\nThe outline of the festival is known. On the first day the initiates gathered; on the second they bathed in the sea, each with a piglet to sacrifice; then came sacrifices and a day for latecomers; on the 19th a great procession walked the Sacred Way to Eleusis, crying out to Iakchos; then the initiates fasted, drank the kykeon (a barley drink), and entered the Telesterion at night to see and hear what was shown. They returned to Athens on the 23rd.\n\nThe Mysteries ended in the late fourth century CE, under imperial bans on pagan worship and the sack of Eleusis by Alaric’s Goths.',
    knowAndDont: {
      known:
        'The calendar of the festival, the procession, the fasting and kykeon, the founding myth in the Hymn, and the huge prestige of the Mysteries are well attested. The site at Eleusis survives.',
      unknown:
        'The secret was kept. We do not know what was shown inside the Telesterion. Christian writers later claimed it was an ear of grain reaped in silence; theories of a psychedelic kykeon are speculation. Any modern “Eleusinian” rite is a respectful reimagining, not the real thing.',
    },
    celebrate: [
      'Read the Homeric Hymn to Demeter slowly, perhaps over several evenings.',
      'Fast lightly during the day if your health allows, and break the fast at nightfall with a simple barley drink or porridge.',
      'Walk a meaningful route in silence, as the initiates walked the Sacred Way.',
      'Honour grief and return: a candle for someone lost, and one for what has come back.',
      'Eat a pomegranate, thinking of Persephone between two worlds.',
    ],
    ritual: {
      title: 'A night for Demeter and Kore',
      outline: [
        'After dark, purify with khernips and light a lamp for Hestia, then a torch-candle for Demeter searching.',
        'Read the Hymn’s account of Demeter’s grief and Persephone’s return aloud.',
        'Drink a simple kykeon of barley water flavoured with fresh mint. Never use pennyroyal, the ancient herb: it is toxic.',
        'Hold an ear of wheat or a handful of grain in silence for a while.',
        'Name what you have lost and what you hope will return.',
        'Pour a libation of barley water to Demeter and Persephone, and keep the grain to sow in spring.',
      ],
    },
    correspondences: {
      deities: ['Demeter', 'Persephone', 'Hades', 'Hekate'],
      herbs: ['Mint', 'Myrrh', 'Cypress'],
      crystals: ['Garnet', 'Obsidian', 'Moonstone'],
      colors: ['Gold', 'Black', 'Red'],
      foods: ['Barley', 'Pomegranate', 'Wheat', 'Honey'],
      symbols: ['Ear of wheat', 'Torches', 'Pomegranate', 'Piglet', 'Kykeon cup'],
    },
    sources: [
      'Homeric Hymn to Demeter, tr. H. G. Evelyn-White (1914): https://www.theoi.com/Text/HomericHymns1.html',
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Eleusinia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Eleusinia.html',
      'Walter Burkert, Ancient Mystery Cults (Harvard, 1987).',
      'George E. Mylonas, Eleusis and the Eleusinian Mysteries (Princeton, 1961).',
    ],
  },
  {
    ref: 'hellenic-pyanepsia',
    title: 'Pyanepsia',
    aka: ['Pyanopsia', 'Feast of Beans', 'Eiresione'],
    tradition: 'Hellenic',
    summary:
      'Apollo’s autumn festival on 7 Pyanepsion: a pot of mixed beans is boiled and shared, and the eiresione, an olive branch hung with wool and fruits, is carried home and hung by the door for a year’s blessing.',
    honours:
      'Apollo, god of light, healing and order, at the harvest; and Helios and the Horai, the seasons, in some accounts. The day also remembers Theseus and the young Athenians he brought home safe from Crete.',
    history:
      'Plutarch tells the story: when Theseus returned from Crete, he paid his vows to Apollo on the seventh of Pyanepsion. The young people who came back with him put together the last of their provisions, “boiled it in one common pot, feasted upon it, and ate it all up together.” So Athenians boiled beans and pulses on this day.\n\nThey also carried the eiresione, “a bough of olive wreathed with wool, such as Theseus used at the time of his supplication, and laden with all sorts of fruit-offerings,” and as they went they sang:\n“Eiresione for us brings figs and bread of the richest,\nBrings us honey in pots and oil to rub off from the body,\nStrong wine too in a beaker, that one may go to bed mellow.”\nBoys carried such branches from house to house, and each family hung one over its door until it was replaced the next year.\n\nThe Oschophoria, a festival of grape-vine branches and races, was held around the same time.',
    knowAndDont: {
      known:
        'The date, the bean pot and the eiresione with its song are well attested, chiefly in Plutarch’s Life of Theseus and in later lexicographers.',
      unknown:
        'The festival’s meaning was explained in different ways in antiquity; some linked it to the Heracleidae. We know little about the public sacrifices.',
    },
    celebrate: [
      'Cook a pot of mixed beans and pulses, and share it with everyone in the house.',
      'Make an eiresione: an olive or other branch wound with wool and hung with dried figs, small breads and a little pot of honey.',
      'Hang it over your door until next year’s Pyanepsia, then burn or compost the old one.',
      'Sing or say the eiresione song as you hang it.',
      'Give thanks to Apollo for health, healing and safe returns.',
    ],
    ritual: {
      premade: 'folk-khernips-libation',
      title: 'Hanging the eiresione',
      outline: [
        'Make your branch: wind white and red wool around it, and tie on figs, a small bun, nuts or fruit.',
        'Put a pot of mixed beans to simmer.',
        'Wash your hands in khernips and pour a libation to Hestia and then to Apollo.',
        'Carry the branch to the front door, singing or speaking the eiresione song.',
        'Hang it over the door, asking Apollo to keep the house well-fed and healthy for the year.',
        'Eat the beans together, leaving none.',
      ],
    },
    correspondences: {
      deities: ['Apollo', 'Helios'],
      herbs: ['Bay', 'Rosemary', 'Thyme'],
      crystals: ['Sunstone', 'Citrine', 'Carnelian'],
      colors: ['Gold', 'White', 'Red'],
      foods: ['Mixed beans and pulses', 'Figs', 'Honey', 'Bread', 'Olive oil', 'Wine'],
      symbols: ['The eiresione branch', 'Wool', 'Bean pot', 'Laurel'],
    },
    sources: [
      'Plutarch, Life of Theseus 22, tr. Bernadotte Perrin (1914): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Theseus*.html',
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Pyanepsia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Pyanepsia.html',
      'H. W. Parke, Festivals of the Athenians (London, 1977), Pyanepsion.',
    ],
  },
  {
    ref: 'hellenic-thesmophoria',
    title: 'Thesmophoria',
    aka: ['Thesmophoria of Demeter'],
    tradition: 'Hellenic',
    summary:
      'The women’s festival of Demeter Thesmophoros and Persephone, 11–13 Pyanepsion, at the autumn sowing: for the fertility of the fields and of families.',
    honours:
      'Demeter Thesmophoros, “bringer of law” or “of the things laid down”, and her daughter Persephone. Also the women of the city, who held the festival alone, and the seed about to be sown.',
    history:
      'The Thesmophoria was the most widespread festival of Demeter in the Greek world, and one of the few times citizen women met as a body on their own. In Athens it lasted three days. On the Anodos, the “going up”, the women climbed to the Thesmophorion and set up camp. On the Nesteia they fasted, sitting on the ground on mats of plant stalks in memory of Demeter’s grief, and traded the ribald jokes (aischrologia) that recalled Iambe, the woman whose jokes made the grieving goddess laugh. The final day was the Kalligeneia, “fair birth”, a feast.\n\nAn ancient commentary on Lucian adds the most famous detail: piglets had been thrown into underground chambers (megara) earlier in the year, and their rotted remains were brought up by women called “bailers” and placed on the altars, to be mixed with seed for a good harvest.\n\nMen were strictly excluded. Aristophanes’ comedy Women at the Thesmophoria (411 BCE) imagines a man sneaking in disguise, and getting caught.',
    knowAndDont: {
      known:
        'The three days, the fasting, the joking and the exclusion of men are attested in Aristophanes, ancient commentaries and inscriptions.',
      unknown:
        'The secret rites themselves are mostly unknown; the piglet account comes from a late commentary and its timing is debated. Modern groups differ on whether to keep the festival women-only.',
    },
    celebrate: [
      'Gather with women friends, or with a group of your choosing, for food, laughter and frank talk.',
      'Fast for part of the second day if it is safe for you, then share a generous meal.',
      'Bless seed for autumn sowing, or plant bulbs.',
      'Honour the bodies, labour and lives of women: mothers, midwives, carers.',
      'Tell bawdy jokes and laugh until it hurts, as Iambe did for Demeter.',
    ],
    ritual: {
      title: 'Sowing with Demeter Thesmophoros',
      outline: [
        'Gather seed, bulbs or a pot of compost, a candle, a bowl of khernips, and some bread or cake.',
        'Purify with khernips and light the candle for Hestia, then for Demeter.',
        'Sit on the ground for a few minutes in silence, remembering Demeter’s grief for Persephone.',
        'Share a joke or story that makes everyone laugh, as Iambe did.',
        'Bless the seed in Demeter’s name and plant it.',
        'Break bread together for the Kalligeneia, the fair birth.',
      ],
    },
    correspondences: {
      deities: ['Demeter', 'Persephone'],
      herbs: ['Mint', 'Willow', 'Garlic'],
      crystals: ['Moss Agate', 'Garnet', 'Red Jasper'],
      colors: ['Gold', 'Red', 'Green'],
      foods: ['Pomegranate', 'Sesame and honey cakes', 'Barley bread', 'Pork'],
      symbols: ['Seed', 'Piglet', 'Torch', 'Pine branch', 'Underground chamber'],
    },
    sources: [
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Thesmophoria”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Thesmophoria.html',
      'Aristophanes, Thesmophoriazusae (411 BCE).',
      'Scholion on Lucian, Dialogues of the Courtesans 2.1.',
      'H. W. Parke, Festivals of the Athenians (London, 1977), Pyanepsion.',
    ],
  },
  {
    ref: 'hellenic-haloa',
    title: 'Haloa',
    aka: ['Haloea', 'Festival of the threshing floor'],
    tradition: 'Hellenic',
    summary:
      'A winter festival of Demeter, Kore and Dionysus around 26 Poseideon, kept mainly by women at Eleusis with feasting, joking and sexual symbols, to quicken the young crops.',
    honours:
      'Demeter and Kore, for the sprouting grain; Dionysus, for the vines being pruned. Its name comes from the halos, the threshing floor, and it was a festival of fertility in the dead of winter.',
    history:
      'The Haloa was held at Eleusis in midwinter. An ancient commentary on Lucian describes it: the women alone went in, with jests and mockery, carrying models of genitals; wine and rich foods were set out, but not those forbidden at the Mysteries, such as pomegranates, eggs and certain fish. The archons laid the tables and then left the women to themselves. There were also cakes shaped like sexual organs.\n\nAn Athenian court speech tells of a hierophant who was condemned for making a sacrifice at the Haloa on behalf of a courtesan, on the altar in the courtyard at Eleusis, when on that day sacrifices were the priestess’s business.\n\nThe festival’s mixture of Demeter and Dionysus, and of joking and feasting, shows how much fertility was a matter of laughter as well as solemnity.',
    knowAndDont: {
      known:
        'The date, the place at Eleusis, the women’s feast and the ribald symbols are described by the scholiast on Lucian and the speech Against Neaira.',
      unknown:
        'The scholion is late and brief. We do not know how the festival related to the threshing it was named for, since there is no threshing in winter, or exactly what rites the women performed.',
    },
    celebrate: [
      'Hold a feast with friends, with wine or juice and plenty of rich food, and leave out pomegranates for the day.',
      'Bake playful cakes or biscuits in suggestive shapes, and don’t be shy about laughing.',
      'Prune or care for vines, fruit trees or houseplants.',
      'Honour your own body and pleasure without shame.',
      'Pour a libation to Demeter and Dionysus for growth in the dark.',
    ],
    ritual: {
      premade: 'folk-khernips-libation',
      title: 'A Haloa feast',
      outline: [
        'Lay a table with bread, cakes, cheese, wine or juice, and anything that delights you.',
        'Purify with khernips and light a lamp for Hestia.',
        'Pour libations to Demeter and Kore, then to Dionysus.',
        'Feast, jest and tell stories. Laughter is the offering.',
        'Before you finish, name one thing you want to grow in the coming spring.',
      ],
    },
    correspondences: {
      deities: ['Demeter', 'Persephone', 'Dionysus'],
      herbs: ['Mint', 'Thyme'],
      crystals: ['Carnelian', 'Garnet'],
      colors: ['Green', 'Red', 'Gold'],
      foods: ['Bread and cakes', 'Wine', 'Cheese', 'Figs'],
      symbols: ['Threshing floor', 'Vine', 'Young wheat'],
    },
    sources: [
      'Scholion on Lucian, Dialogues of the Courtesans 7.4.',
      '[Demosthenes] 59, Against Neaira 116.',
      'H. W. Parke, Festivals of the Athenians (London, 1977), Poseideon.',
      'Theoi Project, “Demeter”: https://www.theoi.com/Olympios/Demeter.html',
    ],
  },
  {
    ref: 'hellenic-lenaia',
    title: 'Lenaia',
    aka: ['Lenaea', 'Dionysus Lenaios'],
    tradition: 'Hellenic',
    summary:
      'The winter festival of Dionysus Lenaios, around 12 Gamelion, with dramatic contests of comedy and tragedy for the people of Athens.',
    honours:
      'Dionysus of the wine-press (lenos) or of the lenai, his ecstatic women followers. The god of wine, theatre, masks and release, honoured in midwinter when the new wine was settling.',
    history:
      'The Lenaia was held in the month of Gamelion (January–February), when sailing was over and few foreigners were in Athens, so it was a more local festival than the City Dionysia. There was a procession and sacrifice, and from about 440 BCE official contests in comedy, later also tragedy.\n\nMany of Aristophanes’ comedies were first performed at the Lenaia: Acharnians, Knights, and Frogs among them. In Acharnians he jokes that “we are by ourselves now, at the Lenaia”, so he can say what he likes about the city.\n\nA group of Athenian vases shows women ladling wine before a masked pillar-image of Dionysus; some scholars connect these with the Lenaia, though this is debated.',
    knowAndDont: {
      known:
        'The date, the dramatic contests, and the plays first performed there are well recorded.',
      unknown:
        'The religious rites are less clear, and the meaning of “Lenaios” (wine-press or maenads) is debated.',
    },
    celebrate: [
      'Watch, read or stage a comedy, ancient or modern.',
      'Make or wear a mask, and play.',
      'Open a bottle of wine or grape juice and pour the first cup to Dionysus.',
      'Laugh at power: political satire was the Lenaia’s speciality.',
      'Invite friends to a winter party with music.',
    ],
    ritual: {
      premade: 'folk-khernips-libation',
      title: 'A cup for Dionysus Lenaios',
      outline: [
        'Purify with khernips and light a lamp for Hestia.',
        'Set a mask, an ivy sprig or an image of Dionysus on your altar.',
        'Pour the first of the wine or grape juice to Dionysus, asking for joy and freedom from care.',
        'Read aloud a few lines from a comedy, or perform a scene with friends.',
        'Finish with a toast and a song.',
      ],
    },
    correspondences: {
      deities: ['Dionysus'],
      herbs: ['Rosemary', 'Cinnamon'],
      crystals: ['Amethyst', 'Garnet'],
      colors: ['Purple', 'Red', 'Green'],
      foods: ['Wine or grape juice', 'Grapes', 'Figs', 'Bread'],
      symbols: ['Comic and tragic masks', 'Ivy', 'Thyrsus', 'Wine cup'],
    },
    sources: [
      'Arthur Pickard-Cambridge, The Dramatic Festivals of Athens (2nd ed., Oxford, 1968).',
      'Aristophanes, Acharnians 504–508.',
      'Theoi Project, “Dionysus”: https://www.theoi.com/Olympios/Dionysos.html',
      'H. W. Parke, Festivals of the Athenians (London, 1977), Gamelion.',
    ],
  },
  {
    ref: 'hellenic-anthesteria',
    title: 'Anthesteria',
    aka: ['Festival of Flowers', 'Pithoigia', 'Choes', 'Chytroi'],
    tradition: 'Hellenic',
    summary:
      'Dionysus’s three-day festival of flowers and the new wine, 11–13 Anthesterion. On the last day the spirits of the dead walk, and are sent away at its close.',
    honours:
      'Dionysus, whose new wine is opened; Hermes Chthonios, guide of souls; and the dead of the city, who return to wander the streets for a day.',
    history:
      'The Anthesteria was one of the oldest festivals of Athens. On the first day, Pithoigia, “jar-opening”, the new wine was opened at the sanctuary of Dionysus in the Marshes and offered to the god. On the second, Choes, “jugs”, everyone, including slaves and children of three or so, drank from their own jug in a drinking contest held in silence, each at a separate table, in memory of the polluted Orestes who was once served this way. Children received small jugs and garlands of flowers; many of these little choes survive. On this day the wife of the archon basileus was ceremonially married to Dionysus.\n\nThe Choes was also a day of pollution: the dead were abroad. People chewed buckthorn leaves in the morning and smeared their doors with pitch to keep spirits away. On the third day, Chytroi, “pots”, a pot of mixed grains was cooked for Hermes Chthonios and the dead, not for the gods above. At the end, the dead were sent off with the words recorded by ancient lexicographers: “Out of doors, Keres! It is no longer Anthesteria.”',
    knowAndDont: {
      known:
        'The three days, the jugs and garlands, the silent drinking, the sacred marriage, the pitch and buckthorn, and the pots for Hermes and the dead are attested by ancient writers and by the thousands of small choes jugs found in children’s graves and houses.',
      unknown:
        'Whether the Keres sent away were ghosts or another kind of spirit (and whether the phrase was originally “Kares”) is debated. The details of the sacred marriage were secret.',
    },
    celebrate: [
      'Open a new bottle or jar of something: wine, juice, preserves, and offer the first of it to Dionysus.',
      'Give children (or yourself) a garland of spring flowers and a little cup of their own.',
      'Remember your dead on the third day with a pot of mixed grains or a simple porridge.',
      'Mark the doorway at dusk with a dab of oil or pitch (or a sprig of hawthorn), and close the festival by saying the words to send the spirits away.',
      'Spend some of the evening in quiet, without talking.',
    ],
    ritual: {
      title: 'Opening, drinking and sending home',
      outline: [
        'Day one: open the new jar or bottle, pour the first of it to Dionysus, and share.',
        'Day two: drink a cup in silence at your own place, then crown yourself with flowers. Mark the door against wandering spirits.',
        'Day three: cook a pot of mixed grains or pulses and offer a portion to Hermes Chthonios and the dead outside or at the threshold. Do not eat that portion.',
        'At nightfall, open the door and say: “Out of doors, Keres! It is no longer Anthesteria.”',
        'Close the door, wash your hands, and light a fresh lamp for Hestia.',
      ],
    },
    correspondences: {
      deities: ['Dionysus', 'Hermes', 'Hades'],
      herbs: ['Hawthorn', 'Rosemary'],
      crystals: ['Amethyst', 'Obsidian'],
      colors: ['Purple', 'Black', 'White'],
      foods: ['New wine or grape juice', 'Mixed grain pot (panspermia)', 'Honey'],
      symbols: ['Choes jug', 'Flower garland', 'Pitch on the door', 'Wine jar'],
    },
    sources: [
      'Walter Burkert, Homo Necans (California, 1983), ch. 4; and Greek Religion (Harvard, 1985).',
      'H. W. Parke, Festivals of the Athenians (London, 1977), Anthesterion.',
      'Theoi Project, “Dionysus”: https://www.theoi.com/Olympios/Dionysos.html',
    ],
  },
  {
    ref: 'hellenic-dionysia',
    title: 'City Dionysia',
    aka: ['Great Dionysia', 'Dionysia', 'Dionysia en astei'],
    tradition: 'Hellenic',
    summary:
      'Athens’ great spring festival of Dionysus, beginning around 10 Elaphebolion, where the tragedies and comedies we still read were first performed.',
    honours:
      'Dionysus Eleuthereus, “of Eleutherai”, whose image was brought to Athens from the border town of that name. God of wine, ecstasy, masks and theatre, who frees and transforms.',
    history:
      'The City Dionysia was held in spring when the sea was open and visitors filled Athens. The statue of Dionysus was taken out of the city and brought back in torchlight procession, re-enacting his first arrival. A great procession followed, with bulls for sacrifice, phallic poles, and citizens and foreigners in fine clothes.\n\nThen came the contests: dithyrambs sung by choruses of men and boys, and three days of tragedy, each poet presenting three tragedies and a satyr play. Comedies were added in 486 BCE. Thespis is said to have won the first tragic contest around 534 BCE. Aeschylus, Sophocles and Euripides all competed here; Sophocles won some eighteen times.\n\nBefore the plays, the city showed off: tribute from allies was displayed, and orphans of war, raised at public expense, were paraded in armour.',
    knowAndDont: {
      known:
        'The procession, the contests, and many winning plays and poets are recorded in inscriptions and ancient writers; we still have plays first staged here.',
      unknown:
        'The exact sequence of days changed over the centuries, and the origins of tragedy in Dionysian ritual are much debated.',
    },
    celebrate: [
      'Read or watch a Greek tragedy, or see any play.',
      'Write or perform something of your own: a scene, a song, a poem.',
      'Pour wine or grape juice to Dionysus before the performance.',
      'Bring a spring branch or ivy into the house.',
      'Let yourself be moved; tragedy was worship too.',
    ],
    ritual: {
      premade: 'folk-khernips-libation',
      title: 'Theatre for Dionysus',
      outline: [
        'Purify with khernips and light a lamp for Hestia.',
        'Bring an image of Dionysus or an ivy wreath in procession to where you will watch or perform.',
        'Pour a libation of wine or grape juice to Dionysus Eleuthereus.',
        'Watch, read or perform a play, giving it your full attention.',
        'Afterwards, talk with others about what moved you, and pour a last libation in thanks.',
      ],
    },
    correspondences: {
      deities: ['Dionysus', 'Apollo'],
      herbs: ['Rosemary', 'Bay'],
      crystals: ['Amethyst', 'Garnet', 'Carnelian'],
      colors: ['Purple', 'Red', 'Gold'],
      foods: ['Wine or grape juice', 'Bread', 'Figs', 'Olives'],
      symbols: ['Theatre masks', 'Ivy', 'Thyrsus', 'Bull', 'Panther'],
    },
    sources: [
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Dionysia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Dionysia.html',
      'Arthur Pickard-Cambridge, The Dramatic Festivals of Athens (2nd ed., Oxford, 1968).',
      'Simon Goldhill, “The Great Dionysia and Civic Ideology”, Journal of Hellenic Studies 107 (1987).',
    ],
  },
  {
    ref: 'hellenic-mounichia',
    title: 'Mounichia',
    aka: ['Munychia', 'Festival of Artemis Mounichia'],
    tradition: 'Hellenic',
    summary:
      'The festival of Artemis Mounichia on 16 Mounichion, at the full moon of spring, with round cakes ringed by little torches (amphiphontes), shining like the moon.',
    honours:
      'Artemis Mounichia, worshipped at her harbour sanctuary on the hill of Mounichia in Piraeus: protector of girls growing up, of sailors and of Athens in war. In later times the festival also gave thanks for the naval victory at Salamis.',
    history:
      'The Mounichia was held on 16 Mounichion, near the full moon. Worshippers brought amphiphontes, “shining all round”, cakes set with small torches around the edge, to Artemis. The goat was her sacrifice, and later the ephebes (young men in training) held boat races in her honour.\n\nPlutarch says the Athenians dedicated the sixteenth of Mounichion to Artemis because on that day the goddess shone with a full moon on the Greeks as they won at Salamis. Like Brauron, the sanctuary at Mounichia was a place where young girls served Artemis as “little bears”, and a story was told there of a bear killed in the sanctuary, and a girl sacrificed or replaced by a goat.',
    knowAndDont: {
      known:
        'The date, the amphiphontes, the ephebic boat races, and the sanctuary on Mounichia hill are attested by inscriptions, lexicographers and Plutarch; the sanctuary has been excavated.',
      unknown:
        'The Salamis link may be a later explanation of an older festival. The bear stories survive in confusing versions.',
    },
    celebrate: [
      'Bake a round cake and set it with small candles round the edge, lit safely on a fireproof plate.',
      'Go out under the full moon and greet Artemis.',
      'Honour girls and young women in your life: celebrate a milestone, give a gift.',
      'If you are near the sea, walk the shore; Artemis Mounichia protected harbours.',
      'Give to a charity that supports girls’ education or wildlife.',
    ],
    ritual: {
      premade: 'folk-khernips-libation',
      title: 'Cakes that shine all round',
      outline: [
        'Bake or buy a round cake. Set small birthday candles around its rim, on a fireproof plate.',
        'Purify with khernips and light a lamp for Hestia.',
        'Light the candles and carry the cake to your altar or outside under the moon.',
        'Pray to Artemis Mounichia for protection of the young and of all who travel by water.',
        'Let the candles burn a minute, blow them out, and share the cake, leaving one piece for Artemis outdoors.',
      ],
    },
    correspondences: {
      deities: ['Artemis', 'Selene'],
      herbs: ['Mugwort', 'Willow', 'Cypress'],
      crystals: ['Moonstone', 'Selenite', 'Clear Quartz'],
      colors: ['Silver', 'White'],
      foods: ['Round cakes', 'Honey', 'Cheese', 'Goat’s milk'],
      symbols: ['Amphiphontes cake', 'Full moon', 'Bear', 'Bow', 'Torches', 'Boat'],
    },
    sources: [
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Munychia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Munychia.html',
      'Plutarch, On the Glory of the Athenians 349F.',
      'Theoi Project, “Artemis”: https://www.theoi.com/Olympios/Artemis.html',
      'H. W. Parke, Festivals of the Athenians (London, 1977), Mounichion.',
    ],
  },
  {
    ref: 'hellenic-thargelia',
    title: 'Thargelia',
    aka: ['Thargelia of Apollo', 'Birthday of Apollo and Artemis'],
    tradition: 'Hellenic',
    summary:
      'Festival of Apollo and Artemis on their birthdays, 6–7 Thargelion, with first fruits of the harvest and the purification of the city.',
    honours:
      'Apollo, born on the 7th, and Artemis, born on the 6th, according to Athenian tradition. Apollo as purifier and healer, and as god of the first ripened grain.',
    history:
      'On the first day, the 6th, Athens was purified. Two people, the pharmakoi, were led out of the city, wearing strings of figs, and driven out as scapegoats, carrying the city’s pollution with them. Ancient sources disagree on how harsh this was; it was probably expulsion, not death, in classical Athens.\n\nOn the 7th came Apollo’s feast. The thargelos was carried: a pot of the first grain, cooked, or a first loaf. Choruses of men and boys competed in song, and the victors dedicated tripods. Plato and Socrates were said to have been born at the Thargelia, and Plato’s birthday was kept by his followers on the 7th.\n\nThe Thargelia connected cleansing with harvest: before the first fruits could be enjoyed, the community had to be set right.',
    knowAndDont: {
      known:
        'The dates, the pharmakoi, the thargelos, and the choral contests are attested in lexicographers, inscriptions and ancient poets.',
      unknown:
        'Exactly how the pharmakoi were chosen and treated is uncertain. Earlier claims that they were killed rely on doubtful sources.',
    },
    celebrate: [
      'Clean your home thoroughly on the first day, and take rubbish and old things out of the house.',
      'On the second day, cook the first grain or a first loaf of the season, and offer some to Apollo.',
      'Sing, alone or with others.',
      'Celebrate Artemis on the 6th and Apollo on the 7th with candles and libations.',
      'Release one burden you have carried for others; set it down outside the door.',
    ],
    ritual: {
      premade: 'folk-khernips-libation',
      title: 'Cleansing and first fruits',
      outline: [
        'Day one: clean and air the house. Write on a fig leaf or paper what you want to send out, and take it outside to compost or bin.',
        'Purify with khernips and light a lamp for Hestia; pour a libation to Artemis for her birthday.',
        'Day two: cook a pot of grain or bake a small loaf.',
        'Offer the first spoonful or slice to Apollo with a hymn or song.',
        'Share the rest, and keep a bay leaf from the day on your altar.',
      ],
    },
    correspondences: {
      deities: ['Apollo', 'Artemis'],
      herbs: ['Bay', 'Hyssop', 'Rosemary'],
      crystals: ['Sunstone', 'Moonstone', 'Clear Quartz'],
      colors: ['Gold', 'Silver', 'White'],
      foods: ['First grain or loaf', 'Figs', 'Honey', 'Fruit'],
      symbols: ['Tripod', 'Laurel', 'Lyre', 'Figs on a string', 'Swan'],
    },
    sources: [
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Thargelia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Thargelia.html',
      'Jan Bremmer, “Scapegoat Rituals in Ancient Greece”, Harvard Studies in Classical Philology 87 (1983).',
      'Theoi Project, “Apollo”: https://www.theoi.com/Olympios/Apollon.html',
    ],
  },
  {
    ref: 'hellenic-plynteria',
    title: 'Plynteria',
    aka: ['Plunteria', 'Washing of Athena', 'Kallynteria'],
    tradition: 'Hellenic',
    summary:
      'On 25 Thargelion, Athena’s ancient statue was undressed, taken to be washed and her robes cleaned. It was a solemn and unlucky day of cleansing and renewal.',
    honours:
      'Athena Polias, whose olive-wood image was the city’s most sacred object; and Aglauros, the daughter of the first king, linked with Athena’s cult. The day honoured her presence by keeping her image pure.',
    history:
      'The Plynteria was the job of the Praxiergidai, a priestly family. They removed the robe and ornaments from Athena’s ancient image, covered it, and the temple was roped off. The image was then washed, perhaps at the sea at Phaleron, and a procession carrying a cake of figs (the hegeteria) went with it. The Kallynteria, a day of sweeping and decorating the temple, came just before.\n\nBecause the goddess was “away”, the Plynteria was counted among the most unlucky days of the year: no public business was done. Plutarch and Xenophon note that Alcibiades returned to Athens on the day of the Plynteria in 407 BCE, and people saw it as a bad omen.',
    knowAndDont: {
      known:
        'The day, the Praxiergidai, the covering of the statue and the ill-omened nature of the day are attested by Plutarch, Xenophon and inscriptions.',
      unknown:
        'Whether the statue was carried to the sea to be washed or washed in the city is debated, as are the exact day and the order of the Kallynteria and Plynteria.',
    },
    celebrate: [
      'Clean your altar and wash any images, statues or altar cloths gently.',
      'Keep the day quiet, without starting new ventures.',
      'Sweep and air your home or workplace.',
      'Mend and launder clothes, especially special ones.',
      'Re-dress your altar at the end of the day, fresh and bright.',
    ],
    ritual: {
      title: 'Washing the image',
      outline: [
        'Purify with khernips, then cover your altar or the image of your god with a clean cloth.',
        'Take everything off the altar and wash it: images, bowls, cloths, the surface itself.',
        'Use plain water, and a little salt water for objects it won’t harm.',
        'Let everything dry, and keep the day quiet in the meantime.',
        'In the evening, re-dress the altar, uncover the image, and offer olive oil and a fig to Athena.',
      ],
    },
    correspondences: {
      deities: ['Athena'],
      herbs: ['Bay', 'Hyssop', 'Thyme'],
      crystals: ['Clear Quartz', 'Selenite'],
      colors: ['White', 'Blue'],
      foods: ['Figs', 'Olive oil'],
      symbols: ['Veiled statue', 'Washing bowl', 'The peplos', 'The sea'],
    },
    sources: [
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Plynteria”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Plynteria.html',
      'Plutarch, Life of Alcibiades 34, tr. Bernadotte Perrin (1916): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Alcibiades*.html',
      'Xenophon, Hellenica 1.4.12.',
      'H. W. Parke, Festivals of the Athenians (London, 1977), Thargelion.',
    ],
  },
  {
    ref: 'hellenic-skira',
    title: 'Skira',
    aka: ['Skirophoria', 'Scira'],
    tradition: 'Hellenic',
    summary:
      'A midsummer women’s festival of Demeter and Persephone on 12 Skirophorion, ahead of the threshing, at the very end of the Athenian year.',
    honours:
      'Demeter and Kore; and in the public procession, Athena, Poseidon-Erechtheus and Helios. It honours the end of the year and the summer’s grain.',
    history:
      'The Skira gave its name to the last month of the Athenian year. A procession left the Acropolis for a place called Skiron on the road to Eleusis: the priestess of Athena, the priest of Poseidon-Erechtheus and the priest of Helios walked under a great white parasol (skiron). There was a sacrifice there, and a festival held by women.\n\nWe hear that women at the Skira ate garlic so as to keep their husbands at a distance, and Aristophanes’ comedy Assemblywomen imagines women plotting at the Skira to take over the government. A late ancient commentary seems to connect the Skira with piglets placed in the megara (underground chambers) to be brought up at the Thesmophoria.\n\nThe Skira was a festival of separation and readiness, at the hottest point of the year before the threshing and the new year.',
    knowAndDont: {
      known:
        'The date, the parasol procession, the women’s gathering, and the garlic are attested by ancient writers and lexicographers.',
      unknown:
        'The Skira is one of the less understood Athenian festivals. Its connection to the Thesmophoria and the meaning of the parasol are debated.',
    },
    celebrate: [
      'Gather with women friends, or anyone you choose, under shade, for food and talk.',
      'Eat something with plenty of garlic.',
      'Take stock of the year that is ending, as the Athenian year closed.',
      'Give thanks for the grain and prepare for the new year’s first month.',
      'Walk a stretch of road at midday under a sunshade or parasol, and drink plenty of water.',
    ],
    ritual: {
      premade: 'folk-khernips-libation',
      title: 'Under the white parasol',
      outline: [
        'Purify with khernips and light a lamp for Hestia.',
        'Set up a white parasol or sheet for shade outside, or a white cloth over your altar.',
        'Pour libations to Demeter and Kore, and to Athena.',
        'Eat a simple garlic-rich meal, and talk with others about what this year has been.',
        'Name one thing to leave behind with the old year before the new moon of Hekatombaion.',
      ],
    },
    correspondences: {
      deities: ['Demeter', 'Persephone', 'Athena', 'Poseidon'],
      herbs: ['Garlic', 'Mint', 'Thyme'],
      crystals: ['Citrine', 'Moss Agate'],
      colors: ['White', 'Gold'],
      foods: ['Garlic', 'Barley', 'Figs', 'Bread'],
      symbols: ['White parasol', 'Grain', 'Piglets'],
    },
    sources: [
      'H. W. Parke, Festivals of the Athenians (London, 1977), Skirophorion.',
      'Aristophanes, Ecclesiazusae 18 and 59.',
      'Walter Burkert, Homo Necans (California, 1983).',
      'Theoi Project, “Demeter”: https://www.theoi.com/Olympios/Demeter.html',
    ],
  },
  // ─── Hellenic monthly days ───────────────────────────────────────────
  {
    ref: 'hellenic_monthly-noumenia',
    title: 'Noumenia',
    aka: ['New Moon day', 'Neomenia', 'First of the month'],
    tradition: 'Hellenic',
    summary:
      'The first day of the lunar month, when the first sliver of the new crescent appears: offerings to the household gods for a good month.',
    honours:
      'The household gods: Hestia of the hearth, Zeus Ktesios guardian of the stores, Apollo Noumenios, Hermes and Hekate at the door, and the Agathos Daimon. It is the holiest day of the month, when no other festival was held.',
    history:
      'The Athenian month began when the new crescent was first seen at sunset. Ancient writers called the Noumenia the most sacred of days, and in Athens no other festival was scheduled on it. Offerings were small and household-centred: incense, honey cakes, garlands for the household images.\n\nThe philosopher Porphyry tells a story, borrowed from Theopompus, of a poor man of Methydrion in Arcadia, Klearchos, who was judged by the oracle at Delphi to be more pious than a rich man who made splendid sacrifices. Klearchos simply crowned and polished his images of Hermes and Hekate every new moon, and offered them incense, barley cakes and small cakes. That story still guides how many Hellenists keep the day: small, regular and sincere.',
    knowAndDont: {
      known:
        'The Noumenia was the first day of the lunar month, sacred and kept free of other festivals in Athens. Small household offerings on this day are well attested.',
      unknown:
        'Exactly which gods each household honoured varied, and much of the modern monthly cycle (Deipnon, Noumenia, Agathos Daimon) is assembled from scattered sources.',
    },
    celebrate: [
      'Look for the new crescent at sunset, and greet it.',
      'Clean and garland your household shrine, as Klearchos did.',
      'Offer incense and a little honey or a barley cake to your household gods.',
      'Set one intention for the month.',
      'Make a fresh start in one small thing: a tidy drawer, a new notebook.',
    ],
    ritual: { premade: 'folk-noumenia-blessing' },
    correspondences: {
      deities: ['Hestia', 'Hermes', 'Hekate', 'Apollo', 'Selene'],
      herbs: ['Frankincense', 'Bay', 'Myrrh'],
      crystals: ['Moonstone', 'Selenite', 'Clear Quartz'],
      colors: ['Silver', 'White'],
      foods: ['Honey cakes', 'Barley cakes', 'Fresh water', 'Incense'],
      symbols: ['New crescent', 'Garlands', 'Household shrine'],
    },
    sources: [
      'Porphyry, On Abstinence from Animal Food 2.16, tr. Thomas Taylor (1823).',
      'Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year (Princeton, 1975).',
      'Hellenion, “Noumenia”: https://hellenion.org/',
    ],
  },
  {
    ref: 'hellenic_monthly-agathos_daimon',
    title: 'Agathos Daimon',
    aka: ['Agathodaimon', 'The Good Spirit', 'Second of the month'],
    tradition: 'Hellenic',
    summary:
      'The second day of the month, honouring the Good Spirit of the household with a libation of wine.',
    honours:
      'The Agathos Daimon, the “good spirit” or “good god” of the house and its fortunes, often shown as a snake, and often paired with Agathe Tyche, Good Fortune. He guards the vines, the grain and the household’s luck.',
    history:
      'Greeks drank a small cup of unmixed wine to the Agathos Daimon at the end of a meal, before the main drinking began; Aristophanes’ characters refer to it as a familiar custom. Snakes in the house were treated kindly as forms of the house’s good spirit. In Hellenistic Alexandria, the Agathos Daimon became a protector of the whole city.\n\nThe second day of the month as his day appears in later ancient lists of the days of the month and their gods, and in modern scholarship of the Athenian calendar, where the first eight days each had a patron. Modern Hellenists keep it as a quiet, domestic day, with a libation and thanks for the household’s luck.',
    knowAndDont: {
      known:
        'The after-dinner libation of unmixed wine to the Agathos Daimon is well attested. His snake form and link with Agathe Tyche are known from art and inscriptions.',
      unknown:
        'The evidence that the second of every month was sacred to him is thinner than for the Noumenia, and how widely it was kept is uncertain.',
    },
    celebrate: [
      'After dinner, pour a little wine or juice for the Agathos Daimon before you leave the table.',
      'Thank the spirit of your home for its luck and shelter.',
      'Tend something that brings the household luck: plants, the pantry, the savings jar.',
      'Light a small lamp beside an image of a snake, or simply your household shrine.',
    ],
    ritual: {
      title: 'A cup for the Good Spirit',
      outline: [
        'After the evening meal, wash your hands.',
        'Pour a small cup of unmixed wine, or grape juice, or water.',
        'Lift it and say: “To the Agathos Daimon, good spirit of this house, thank you for our luck and our bread.”',
        'Pour a few drops on the hearth, a bowl or the ground outside, and drink a sip.',
        'Leave the rest by the household shrine overnight, then pour it out.',
      ],
    },
    correspondences: {
      deities: ['Agathos Daimon', 'Agathe Tyche', 'Hestia'],
      herbs: ['Basil', 'Bay', 'Thyme'],
      crystals: ['Green Aventurine', 'Citrine', 'Jade'],
      colors: ['Green', 'Gold'],
      foods: ['Wine or grape juice', 'Bread', 'Honey'],
      symbols: ['The house snake', 'Cornucopia', 'Wine cup'],
    },
    sources: [
      'Aristophanes, Knights 85–106; Wasps 525.',
      'Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year (Princeton, 1975).',
      'Hellenion, “Agathos Daimon”: https://hellenion.org/?p=1514',
      'Walter Burkert, Greek Religion (Harvard, 1985).',
    ],
  },
  {
    ref: 'hellenic_monthly-deipnon',
    title: 'Hekate’s Deipnon',
    aka: ['Deipnon', 'Hekate’s Supper', 'Hekataia', 'Dark moon'],
    tradition: 'Hellenic',
    summary:
      'Hekate’s supper on the last day of the lunar month: cleansing the house and leaving food for Hekate at a crossroads before the new month begins.',
    honours:
      'Hekate, goddess of thresholds, crossroads and the night, and the restless dead who travel with her. The house is purified and the month closed so that the new month can begin clean.',
    history:
      'On the last day of the month, Athenians left food at the crossroads for Hekate, often at a small shrine (hekataion) where three roads met. Aristophanes jokes about it in Wealth: ask Hekate, a character says, whether wealth or poverty is better, for the rich send her a supper every month and the poor snatch it before it is even set down. So the poor did eat these suppers, and the custom was known to everyone.\n\nThe same day was a time of purification. Sweepings from the house and the remains of purification rites were taken to the crossroads too. Foods mentioned for Hekate include cakes, eggs, cheese, small fish such as red mullet, and garlic.\n\nModern Hellenists and many witches keep the Deipnon each dark moon, cleaning the house and leaving a meal for Hekate.',
    knowAndDont: {
      known:
        'Suppers for Hekate at crossroads at the month’s end, and the link with household purification, are attested in Aristophanes and other ancient writers.',
      unknown:
        'Exact rites varied, and much of what is said about the Deipnon today comes from modern practice rather than ancient sources.',
    },
    celebrate: [
      'Clean your home: sweep, dust, and take the sweepings and rubbish out.',
      'Leave a small supper for Hekate at a crossroads near home or your doorstep, and walk away without looking back.',
      'Use pet-safe foods if anything can reach it: no chocolate, grapes, raisins, onion or garlic outdoors.',
      'Reflect on the month: settle debts, apologise, close out what is unfinished.',
      'Rest. Tomorrow is the Noumenia.',
    ],
    ritual: { premade: 'folk-hekate-deipnon' },
    correspondences: {
      deities: ['Hekate'],
      herbs: ['Garlic', 'Mugwort', 'Myrrh', 'Cypress'],
      crystals: ['Obsidian', 'Black Tourmaline', 'Jet'],
      colors: ['Black', 'Silver'],
      foods: ['Bread', 'Eggs', 'Cheese', 'Honey cakes', 'Garlic (indoors only)'],
      symbols: ['Crossroads', 'Torches', 'Keys', 'Dogs', 'The broom'],
    },
    sources: [
      'Aristophanes, Wealth (Plutus) 594–597: https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0040:line=594',
      'Theoi Project, “Hekate”: https://www.theoi.com/Khthonios/Hekate.html',
      'Sarah Iles Johnston, Restless Dead: Encounters between the Living and the Dead in Ancient Greece (California, 1999).',
    ],
  },

  // ─── Roman ───────────────────────────────────────────────────────────
  {
    ref: 'roman-parentalia',
    title: 'Parentalia',
    aka: ['Dies Parentales', 'Feralia', 'Caristia'],
    tradition: 'Roman',
    summary:
      'Nine days, 13–21 February, honouring the family’s ancestors with gifts of flowers, grain, salt and bread soaked in wine at their tombs. It ends with the Feralia on the 21st and the family reconciliation of the Caristia on the 22nd.',
    honours:
      'The di parentes, the family dead, especially parents and grandparents. Unlike the Lemuria’s restless ghosts, these are the loved and honoured dead, given what is due to them.',
    history:
      'The Parentalia opened at noon on 13 February, when a Vestal Virgin made offering for the dead; the Calendar of 354 still marks the day “Virgo Vesta parentat”. For nine days, temples were closed, magistrates laid aside their insignia, no weddings were held, and families went to the tombs outside the city.\n\nOvid says the dead ask little: a tile wreathed with garlands, a scattering of grain, a few grains of salt, bread softened in wine, and loose violets. In his words: “tegula porrectis satis est velata coronis / et sparsae fruges parcaque mica salis, / inque mero mollita Ceres violaeque solutae.” He tells of a time when the rites were neglected and the dead came out of their tombs, howling through the streets.\n\nOn the 21st, the Feralia, the public offering to the dead closed the festival. The next day, the Caristia, families met for a meal to make peace, with incense and food offered to the Lares.',
    knowAndDont: {
      known:
        'The dates and customs are described by Ovid’s Fasti and confirmed by Roman calendars. The rites were simple and domestic.',
      unknown:
        'We know less about how ordinary people kept every one of the nine days, or how strictly the closures were observed in later centuries.',
    },
    celebrate: [
      'Visit a family grave and leave violets or other flowers, or set flowers by a photo at home.',
      'Offer a little grain, salt and bread dipped in wine at your shrine for your parents and ancestors.',
      'Say the names of your dead aloud.',
      'On the 22nd, the Caristia, share a meal with family and mend a quarrel if you can.',
      'If family is complicated, honour the dead who loved you, or the ancestors of your craft or place.',
    ],
    ritual: { premade: 'folk-parentalia' },
    correspondences: {
      deities: ['Vesta', 'Janus', 'Mercury'],
      herbs: ['Rosemary', 'Cypress', 'Myrrh'],
      crystals: ['Jet', 'Amethyst', 'Smoky Quartz'],
      colors: ['Purple', 'Black', 'White'],
      foods: ['Bread soaked in wine', 'Salt', 'Spelt or grain', 'Violets (as offering)'],
      symbols: ['Violets', 'Garlanded tile', 'Tombs', 'Lamps'],
    },
    sources: [
      'Ovid, Fasti 2.533–638 (Latin): https://www.thelatinlibrary.com/ovid/ovid.fasti2.shtml',
      'Calendar of Filocalus, Chronography of 354, February: https://www.tertullian.org/fathers/chronography_of_354_06_calendar.htm',
      'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (London, 1981).',
    ],
  },
  {
    ref: 'roman-lupercalia',
    title: 'Lupercalia',
    aka: ['Lupercal', 'Februa'],
    tradition: 'Roman',
    summary:
      'An ancient festival of purification and fertility on 15 February, honouring Faunus and the she-wolf who nursed Romulus and Remus, at the cave of the Lupercal below the Palatine.',
    honours:
      'Faunus (or Inuus), god of the wild and of herds; the she-wolf who saved Rome’s founders; and the fertility of people and flocks. The name probably joins lupus, “wolf”, and the cave of the Lupercal.',
    history:
      'At the Lupercal cave, the priests called Luperci sacrificed goats and a dog. Two young men were touched on the forehead with the bloody knife, then the blood was wiped off with wool soaked in milk, and they had to laugh. The Luperci, naked but for goatskins, then ran around the Palatine, striking those they met with strips of goatskin called februa, purifiers. Women held out their hands to be struck, believing it helped fertility and childbirth.\n\nThe name of February comes from these februa. Mark Antony, as a Lupercus, famously offered Julius Caesar a crown at the Lupercalia of 44 BCE. The festival lasted into Christian times; in the 490s Pope Gelasius wrote against Christians who still kept it.\n\nThere is no evidence that the Lupercalia is the origin of Valentine’s Day, a link often made but never shown.',
    knowAndDont: {
      known:
        'The sacrifice, the run and the februa are described by Plutarch, Ovid, Varro and others. The festival lasted until the late fifth century.',
      unknown:
        'The original meaning was already debated in antiquity, and the identity of the god honoured is unclear. Modern stories of a “love lottery” are not ancient.',
    },
    celebrate: [
      'Purify your home: open windows, clean, and sprinkle salt water at the doorways.',
      'Run or walk briskly around your home, block or park for vitality.',
      'Pour milk as an offering for Faunus and the she-wolf.',
      'Support a wolf or wildlife conservation group.',
      'Laugh: the young men had to.',
    ],
    ritual: {
      title: 'A februa purification',
      outline: [
        'Make februa: a few strips of leather or cloth, or a bundle of twigs.',
        'Pour a little milk into a bowl, and dip a wool tuft or cloth in it.',
        'Walk round your home or space, lightly tapping the walls and doorways with the strips to drive out stale energy. Never strike a person or animal.',
        'Touch the milk-soaked wool to your forehead and laugh out loud.',
        'Pour the milk outside for Faunus and the she-wolf, and wash your hands.',
      ],
    },
    correspondences: {
      deities: ['Faunus', 'Juno', 'Mars'],
      herbs: ['Rosemary', 'Hyssop', 'Bay'],
      crystals: ['Red Jasper', 'Garnet', 'Bloodstone'],
      colors: ['Red', 'White'],
      foods: ['Milk', 'Salted cakes (mola salsa)', 'Goat’s cheese'],
      symbols: ['She-wolf', 'Goatskin strips', 'The cave', 'Twins'],
    },
    sources: [
      'Plutarch, Life of Romulus 21, tr. Bernadotte Perrin (1914): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Romulus*.html',
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Lupercalia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Lupercalia.html',
      'Ovid, Fasti 2.267–474 (Latin): https://www.thelatinlibrary.com/ovid/ovid.fasti2.shtml',
      'Mary Beard, John North and Simon Price, Religions of Rome (Cambridge, 1998).',
    ],
  },
  {
    ref: 'roman-matronalia',
    title: 'Matronalia',
    aka: ['Matronales Feriae', 'Women’s Kalends'],
    tradition: 'Roman',
    summary:
      'Festival of Juno Lucina, goddess of childbirth, on 1 March, the old Roman new year: mothers and wives are honoured and given gifts.',
    honours:
      'Juno Lucina, “she who brings to light”, who helps women in labour; and the matronae, the married women of Rome. Mars, whose month it begins, is honoured as Juno’s son and as the father of Rome.',
    history:
      'The temple of Juno Lucina on the Esquiline was dedicated on 1 March, traditionally in 375 BCE. On that day the married women of Rome went to the temple with flowers, prayed for their families, and received gifts from husbands and daughters.\n\nOvid asks Mars why women keep his festival, and is told it remembers the Sabine women, who made peace between their Roman husbands and their Sabine fathers. He also says Juno Lucina is honoured because the year begins with life, as March, the first month of the old Roman year, begins the spring. According to Macrobius, Roman women also served their slaves a meal on this day, as men did at the Saturnalia.',
    knowAndDont: {
      known:
        'The date, the temple dedication, and the custom of gifts and prayers for mothers are described by Ovid and other Roman writers.',
      unknown:
        'Details of the temple rite are thin. The festival’s link to the Sabine women is one of several ancient explanations.',
    },
    celebrate: [
      'Give flowers and a gift to the mothers and mother-figures in your life.',
      'Pray for or support anyone expecting a baby or recovering from birth.',
      'Cook a meal for the person who usually cooks.',
      'Make peace between family members if you can, as the Sabine women did.',
      'Light a candle for Juno Lucina for all who labour in childbirth.',
    ],
    ritual: {
      premade: 'folk-lararium-offering',
      title: 'Flowers for Juno Lucina',
      outline: [
        'Gather fresh flowers, a candle and a small cake or bread.',
        'At your shrine, light the candle and offer the flowers to Juno Lucina.',
        'Name the mothers, midwives and birth-givers you wish to honour, living or dead.',
        'Ask Juno to bring safe births and protect families.',
        'Give the cake to a mother or share it in her honour.',
      ],
    },
    correspondences: {
      deities: ['Juno', 'Mars'],
      herbs: ['Rose', 'Calendula', 'Jasmine'],
      crystals: ['Rose Quartz', 'Moonstone', 'Garnet'],
      colors: ['White', 'Pink', 'Gold'],
      foods: ['Honey cakes', 'Fresh flowers', 'Milk'],
      symbols: ['Peacock', 'Flowers', 'Lamp', 'Pomegranate'],
    },
    sources: [
      'Ovid, Fasti 3.167–258 (Latin): https://www.thelatinlibrary.com/ovid/ovid.fasti3.shtml',
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Matronalia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Matronalia.html',
      'Macrobius, Saturnalia 1.12.7: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Macrobius/Saturnalia/home.html',
    ],
  },
  {
    ref: 'roman-floralia',
    title: 'Floralia',
    aka: ['Ludi Florales', 'Festival of Flora'],
    tradition: 'Roman',
    summary:
      'Festival of Flora, goddess of flowers and springtime, from 28 April to 3 May, with games, theatre, bright clothing and joyful licence.',
    honours:
      'Flora, goddess of everything that blooms: flowers, the blossom of fruit trees and grain, and the sweetness of youth and pleasure. She was an old Italian goddess with her own priest (flamen Floralis).',
    history:
      'Flora’s temple near the Circus Maximus was founded in 241 or 238 BCE, after the Sibylline books were consulted during a drought. The games became annual in 173 BCE, when crops were damaged, and grew to six days.\n\nThe Floralia was famous for its merriment. People wore bright colours instead of white; mimes and farces were performed, and actresses performed naked at the crowd’s request. Hares and goats were let loose in the Circus, and beans, lupins and vetch were scattered among the crowd as symbols of fertility. Ovid has Flora herself explain her cult, and she says that she loves flowers and fun, and that her festival is free and easy because life itself should be enjoyed while it blooms.',
    knowAndDont: {
      known:
        'The dates, the temple, the games, the bright clothes and theatrical licence are described by Ovid, Pliny and other Roman writers.',
      unknown:
        'We know little about the religious rites beyond the games. Some ancient stories about Flora were invented later.',
    },
    celebrate: [
      'Wear bright colours, and put flowers in your hair or on your table.',
      'Plant flowers or scatter wildflower seed where it is welcome.',
      'Go to the theatre, watch a comedy, or put on something playful with friends.',
      'Scatter a handful of beans or seeds for the birds or in the garden.',
      'Enjoy pleasure without guilt, kindly and safely.',
    ],
    ritual: { premade: 'green-hawthorn-may-blossom-blessing' },
    correspondences: {
      deities: ['Venus', 'Ceres'],
      herbs: ['Rose', 'Calendula', 'Jasmine', 'Hawthorn'],
      crystals: ['Rose Quartz', 'Peridot', 'Rhodochrosite'],
      colors: ['Pink', 'Yellow', 'Green', 'Rainbow'],
      foods: ['Honey', 'Milk', 'Beans and lupins', 'Spring greens'],
      symbols: ['Flowers', 'Hares', 'Garlands', 'Bright clothes', 'Theatre masks'],
    },
    sources: [
      'Ovid, Fasti 5.183–378 (Latin): https://www.thelatinlibrary.com/ovid/ovid.fasti5.shtml',
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Floralia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Floralia.html',
      'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (London, 1981).',
    ],
  },
  {
    ref: 'roman-lemuria',
    title: 'Lemuria',
    aka: ['Lemuralia', 'Remuria'],
    tradition: 'Roman',
    summary:
      'Rites to appease the restless dead (lemures) on 9, 11 and 13 May, when the head of the household sent the ghosts out of the house at midnight with black beans.',
    honours:
      'The lemures, unquiet or hungry spirits of the dead, especially those without kin to care for them. Not worship so much as a careful, respectful sending-away, so the house could be at peace.',
    history:
      'Ovid gives the rite in detail. At midnight, when dogs and birds are silent, the father of the house rises barefoot, makes a sign with his thumb between his fingers to ward off ghosts, and washes his hands in spring water. He takes up black beans, turns away, and throws them behind him, saying nine times without looking back: “haec ego mitto; his redimo meque meosque fabis”, “These I send; with these beans I redeem me and mine.” The ghost is thought to gather the beans and follow. He washes again, clashes bronze, and nine times asks the shades to leave: “Manes exite paterni”, “Ghosts of my fathers, go out!” Then he looks back, and the rite is done.\n\nOvid links the festival to Remus, whose ghost appeared after his death, and says Remuria became Lemuria. Temples were closed on these days and it was unlucky to marry in May.',
    knowAndDont: {
      known:
        'Ovid’s Fasti describes the household rite step by step, and the dates are in the Roman calendars.',
      unknown:
        'Ovid’s link with Remus is a poet’s etymology. How widely the rite was kept in his day, and what lemures were believed to be, is not clear.',
    },
    celebrate: [
      'At midnight, perform Ovid’s rite, or a gentle version of it, to clear your home of heaviness.',
      'Don’t make big commitments or move house in these days if you can help it.',
      'Remember the forgotten dead: those with no one to mourn them.',
      'Clean and air the house the next morning.',
      'If a home feels troubled by grief, speak with someone you trust as well as doing the rite.',
    ],
    ritual: {
      premade: 'hedge-letting-go-of-the-dead',
      title: 'Ovid’s midnight rite',
      outline: [
        'At midnight, rise barefoot and in silence. Wash your hands in fresh water.',
        'Take nine black beans (dried, uncooked) in your hand.',
        'Turn your back and throw the beans behind you, saying nine times: “These I send; with these beans I redeem me and mine.” Do not look back.',
        'Wash your hands again, and strike a pot or bell.',
        'Say nine times: “Ghosts of my fathers, go out.”',
        'Then turn, look back, and sweep the beans out of the house in the morning.',
      ],
    },
    correspondences: {
      deities: ['Mercury', 'Janus'],
      herbs: ['Rosemary', 'Rue', 'Bay'],
      crystals: ['Obsidian', 'Black Tourmaline', 'Jet'],
      colors: ['Black', 'White'],
      foods: ['Black beans', 'Spring water'],
      symbols: ['Black beans', 'Bronze bell or pot', 'Bare feet', 'Midnight'],
    },
    sources: [
      'Ovid, Fasti 5.419–492 (Latin): https://www.thelatinlibrary.com/ovid/ovid.fasti5.shtml',
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Lemuralia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Lemuralia.html',
      'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (London, 1981).',
    ],
  },
  {
    ref: 'roman-vestalia',
    title: 'Vestalia',
    aka: ['Festival of Vesta'],
    tradition: 'Roman',
    summary:
      'Festival of Vesta, goddess of the hearth, on 9 June, when her storehouse was opened to the women of Rome and bakers and their donkeys took a holiday.',
    honours:
      'Vesta, the sacred fire at the heart of Rome and of every Roman home, tended by the Vestal Virgins; and the bakers, millers and donkeys who made the bread.',
    history:
      'Vesta’s round temple in the Forum held the eternal flame and the secret sacred objects of Rome. From 7 to 15 June, the innermost store (penus) was opened, and matrons came barefoot to bring food offerings. On 9 June, the Vestalia, bakers and millers rested, and the donkeys that turned the millstones were garlanded with violets and strings of small loaves.\n\nThe Vestals made the mola salsa, salted spelt flour used in sacrifices, during these days. On the 15th, the temple was swept and the refuse taken to the Tiber; until that was done, the day was unlucky. Ovid describes the scene, and reminds us that Vesta has no image, for she is living flame.',
    knowAndDont: {
      known:
        'The dates, the opening of the penus, the bakers’ holiday and the garlanded donkeys are described by Ovid and Roman calendars.',
      unknown:
        'What was kept in the penus was secret. Details of the matrons’ offerings are few.',
    },
    celebrate: [
      'Clean your kitchen or hearth thoroughly.',
      'Bake bread or a simple salted loaf, and offer a piece to Vesta.',
      'Give a rest day to anyone who usually cooks, or to a working animal.',
      'Light a candle on the stove or table for Vesta, and keep watch over it.',
      'Take old cooking oil, crumbs and kitchen rubbish out on the 15th.',
    ],
    ritual: { premade: 'folk-vestalia-hearth' },
    correspondences: {
      deities: ['Vesta', 'Hestia'],
      herbs: ['Bay', 'Rosemary', 'Basil'],
      crystals: ['Carnelian', 'Garnet', 'Sunstone'],
      colors: ['White', 'Red', 'Orange'],
      foods: ['Salted bread', 'Mola salsa (salted flour)', 'Spelt', 'Water'],
      symbols: ['Eternal flame', 'Round temple', 'Garlanded donkey', 'Violets'],
    },
    sources: [
      'Ovid, Fasti 6.249–468 (Latin): https://www.thelatinlibrary.com/ovid/ovid.fasti6.shtml',
      'Calendar of Filocalus, Chronography of 354, June: https://www.tertullian.org/fathers/chronography_of_354_06_calendar.htm',
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Vestales”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Vestales.html',
    ],
  },
  {
    ref: 'roman-neptunalia',
    title: 'Neptunalia',
    aka: ['Festival of Neptune'],
    tradition: 'Roman',
    summary:
      'Festival of Neptune on 23 July, in the hottest, driest part of summer, with shelters of leafy branches.',
    honours:
      'Neptune, an old Italian god of fresh water, springs and rivers before he became identified with the Greek Poseidon and the sea. At the height of summer drought, he was honoured to keep water flowing.',
    history:
      'Very little is known about the Neptunalia. The ancient writer Festus says that people built umbrae, shelters of leafy branches, to keep off the sun during the festival, and feasted in them. It was a day for gathering and drinking, perhaps by springs and rivers.\n\nNeptune had a temple in the Campus Martius. The Furrinalia, a festival of a mysterious spring goddess, Furrina, followed two days later, also linked with water.',
    knowAndDont: {
      known:
        'The date and the leafy shelters are recorded.',
      unknown:
        'The rites, offerings and original meaning of the festival are mostly unknown.',
    },
    celebrate: [
      'Make a shady shelter outdoors with branches or a sheet, and picnic in it.',
      'Visit a spring, river or the sea, and leave an offering of flowers (no plastic).',
      'Save water: fix a leak or water the garden at dusk.',
      'Pour a libation of fresh water for Neptune.',
      'Give to a charity that brings clean water to people.',
    ],
    ritual: {
      premade: 'sea-safe-passage-blessing',
      title: 'Shade and water for Neptune',
      outline: [
        'Build a simple shelter of leafy branches or a sheet over chairs outdoors.',
        'Fill a bowl with fresh water.',
        'Sit in the shade and pour a little water for Neptune, asking for wells, springs and rivers to stay full.',
        'Share cool drinks and food.',
        'Water a thirsty plant or tree with what is left.',
      ],
    },
    correspondences: {
      deities: ['Poseidon', 'Manannán mac Lir'],
      herbs: ['Willow', 'Mint', 'Lemon Balm'],
      crystals: ['Aquamarine', 'Blue Lace Agate', 'Turquoise'],
      colors: ['Blue', 'Green'],
      foods: ['Cool water', 'Fish', 'Fresh fruit', 'Watered wine'],
      symbols: ['Trident', 'Leafy shelter', 'Springs', 'Horses'],
    },
    sources: [
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Neptunalia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Neptunalia.html',
      'Calendar of Filocalus, Chronography of 354, July: https://www.tertullian.org/fathers/chronography_of_354_06_calendar.htm',
      'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (London, 1981).',
    ],
  },
  {
    ref: 'roman-saturnalia',
    title: 'Saturnalia',
    aka: ['Io Saturnalia', 'Festival of Saturn'],
    tradition: 'Roman',
    summary:
      'Festival of Saturn from 17 December: feasting, candles and gift-giving, when ordinary rules were set aside and roles turned upside down.',
    honours:
      'Saturn, god of sowing and of the Golden Age, when he ruled Italy and all were equal. His statue’s woollen bonds were loosened for the festival, setting him free for a while.',
    history:
      'The Saturnalia began with a sacrifice at the temple of Saturn in the Forum and a public banquet, with the cry “Io Saturnalia!” For several days (it grew from one to seven), Romans wore casual clothes and the felt cap of freed slaves, gambled openly, ate and drank, and gave gifts: wax candles (cerei) and small pottery figures (sigillaria). Slaves were served by their masters or ate with them, and a mock king was chosen to give silly orders.\n\nCatullus called it “Saturnalibus, optimo dierum”, “the Saturnalia, best of days”. Seneca grumbled that the whole city went mad, and Pliny the Younger hid in a soundproof room to work. Macrobius set his long dialogue Saturnalia during the festival.\n\nMany Christmas and New Year customs, such as gift-giving, candles, feasting and the Lord of Misrule, echo the Saturnalia, though direct descent is often hard to prove.',
    knowAndDont: {
      known:
        'The customs are well described by Roman writers, including Macrobius, Seneca, Catullus, Martial and Lucian.',
      unknown:
        'How far masters truly served slaves, and how these customs passed into Christmas, is debated.',
    },
    celebrate: [
      'Give small, playful gifts: candles, little figures, sweets.',
      'Serve those who usually serve you, and share a table with no head.',
      'Wear something comfortable and festive, and play games of chance (for buttons, not money).',
      'Light many candles and greet friends with “Io Saturnalia!”',
      'Choose a mock king or queen for the evening.',
    ],
    ritual: {
      premade: 'folk-lararium-offering',
      title: 'Loosening Saturn’s bonds',
      outline: [
        'Tie a woollen thread around an image or symbol of Saturn (a sickle, a sheaf, or a candle).',
        'Light candles, and offer wine or juice and a little grain to Saturn.',
        'Untie the thread, and say: “Io Saturnalia! Be free among us.”',
        'Exchange small gifts, and feast together without ranks.',
        'At the end of the festival, retie the thread and put the image back.',
      ],
    },
    correspondences: {
      deities: ['Saturn', 'Janus', 'Ceres'],
      herbs: ['Holly', 'Bay', 'Cinnamon', 'Juniper'],
      crystals: ['Garnet', 'Onyx', 'Smoky Quartz'],
      colors: ['Red', 'Gold', 'Green'],
      foods: ['Roast pork', 'Wine', 'Nuts', 'Honey cakes', 'Figs and dates'],
      symbols: ['Candles (cerei)', 'Felt cap (pilleus)', 'Sigillaria figurines', 'Dice', 'Sickle'],
    },
    sources: [
      'Macrobius, Saturnalia, book 1: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Macrobius/Saturnalia/home.html',
      'Catullus 14.15 (Latin): https://www.thelatinlibrary.com/catullus.shtml',
      'Smith’s Dictionary of Greek and Roman Antiquities (1875), “Saturnalia”: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Saturnalia.html',
      'Seneca, Letters 18.',
    ],
  },
  {
    ref: 'roman-sol_invictus',
    title: 'Dies Natalis Solis Invicti',
    aka: ['Birthday of the Unconquered Sun', 'Sol Invictus', 'Natalis Invicti'],
    tradition: 'Roman',
    summary:
      'The birthday of the Unconquered Sun, 25 December, celebrating the sun’s return after the winter solstice.',
    honours:
      'Sol Invictus, the unconquered sun, a god especially honoured by the later Roman emperors as protector of the empire, and the reborn light of midwinter.',
    history:
      'Sol was an old Roman god, but the emperor Aurelian made Sol Invictus a major state god and built him a temple in 274 CE. The Calendar of 354, made for a Christian Roman, marks 25 December as “N INVICTI CM XXX”, the birthday of the Unconquered, with thirty chariot races. On the same date the Christian list in that document says Christ was born in Bethlehem.\n\nThe emperor Julian, in his Hymn to King Helios (362), says that games for the sun were held after the Saturnalia. Some scholars think Christians chose 25 December to replace the sun festival; others argue the Christian date came from calculations of Jesus’s conception and is independent. The evidence is not decisive.\n\nThe idea that Mithras was born on 25 December is often repeated, but no ancient source says so.',
    knowAndDont: {
      known:
        'Aurelian’s temple, the Calendar of 354 entry, and Julian’s reference to games for the sun are firm evidence.',
      unknown:
        'Whether the festival existed before Christmas or alongside it, and how they influenced each other, is debated. Claims about Mithras are unsupported.',
    },
    celebrate: [
      'Watch the sunrise and greet the returning sun.',
      'Light a gold or yellow candle at dawn.',
      'Spend time outdoors in daylight, however brief.',
      'Make a sun symbol for your door or window.',
      'Count the minutes of daylight each day until they visibly grow.',
    ],
    ritual: {
      title: 'Greeting the unconquered sun',
      outline: [
        'Rise before dawn and find a place with a view east, or a window.',
        'Light a gold or yellow candle.',
        'As the sun rises, raise your hands and greet it: “Hail, Sol Invictus, unconquered sun, born again.”',
        'Offer incense or a little wine, and name what you want to grow with the light.',
        'Let the candle burn while you have breakfast, then put it out.',
      ],
    },
    correspondences: {
      deities: ['Apollo', 'Ra', 'Dazhbog'],
      herbs: ['Frankincense', 'Bay', 'Cinnamon', 'Saffron'],
      crystals: ['Sunstone', 'Citrine', 'Tiger Eye', 'Amber'],
      colors: ['Gold', 'Yellow', 'Orange'],
      foods: ['Bread', 'Oranges', 'Honey', 'Wine'],
      symbols: ['Radiate crown', 'Chariot', 'Sun disc', 'Dawn'],
    },
    sources: [
      'Calendar of Filocalus, Chronography of 354, December: https://www.tertullian.org/fathers/chronography_of_354_06_calendar.htm',
      'Julian, Hymn to King Helios 156B–C.',
      'Steven Hijmans, Sol: The Sun in the Art and Religions of Rome (Groningen, 2009).',
      'Thomas J. Talley, The Origins of the Liturgical Year (New York, 1986).',
    ],
  },
  // ─── Slavic ──────────────────────────────────────────────────────────
  {
    ref: 'slavic-marzanna',
    title: 'Drowning of Marzanna',
    aka: ['Topienie Marzanny', 'Vynášení Morany', 'Morana', 'Smrtná neděle', 'Death Sunday'],
    tradition: 'Slavic',
    summary:
      'An effigy of Marzanna (Morana), the figure of winter and death, is burned or drowned to send winter away and welcome spring. Traditionally on a Sunday in mid-Lent; many now keep it on the first day of spring or at the equinox.',
    honours:
      'Winter itself, sent off with respect and relief; spring, brought into the village with a green branch; and, for those who see her as a goddess, Morana, lady of winter and death, who must leave so that life can return.',
    history:
      'In Poland, Czechia, Slovakia and neighbouring lands, children and young people made a straw figure dressed in women’s clothes, carried it through the village singing, and threw it into a river or burned it, often without looking back. Then a green branch or small tree decorated with ribbons and eggs (the gaik or nové léto, “new summer”) was carried back into the village. The custom was kept on the fourth or fifth Sunday of Lent, sometimes called Death Sunday.\n\nThe name Marzanna first appears in the fifteenth century, when the chronicler Jan Długosz listed her among Polish gods and likened her to Ceres. Church synods of the same period already disapproved of carrying and drowning “death”. Scholars debate whether Marzanna was a real pre-Christian goddess or a folk personification of winter and death.\n\nToday schoolchildren in Poland often make and drown or burn a Marzanna on 21 March, the first day of spring, and Rodnovers (followers of Slavic Native Faith) keep it at the equinox.',
    knowAndDont: {
      known:
        'The custom is well documented from the fifteenth century to today, across West Slavic lands, with the effigy, the songs, the water and the green branch.',
      unknown:
        'Whether Marzanna was ever worshipped as a goddess is uncertain; Długosz’s list of Polish gods is learned and partly guesswork. The rite may have been a folk custom of the Christian centuries from the start.',
    },
    celebrate: [
      'Make a small Marzanna from straw, twigs, paper and natural cloth, with no plastic or wire.',
      'Carry her out singing, and burn her safely in a fire pit, or let her go into running water only if she is fully biodegradable and local rules allow it.',
      'Walk home without looking back.',
      'Bring home a green branch tied with ribbons to welcome spring.',
      'Spring-clean, and put away heavy winter things.',
    ],
    ritual: {
      title: 'Sending winter away',
      outline: [
        'Make a small figure of straw or twigs, dressed in a scrap of natural cloth.',
        'Tell her, aloud or on a slip of paper tucked inside, what winter has meant and what you are ready to leave behind.',
        'Carry her outside in procession, singing or drumming.',
        'Burn her in a safe fire pit or metal bowl, with water nearby, or bury her in the garden.',
        'Turn and walk away without looking back.',
        'Bring a green branch or spring flowers inside and decorate it with ribbons.',
      ],
    },
    correspondences: {
      deities: ['Morana', 'Lada'],
      herbs: ['Willow', 'Birch', 'Rowan'],
      crystals: ['Obsidian', 'Moss Agate', 'Clear Quartz'],
      colors: ['White', 'Black', 'Green'],
      foods: ['Eggs', 'Rye bread', 'First greens'],
      symbols: ['Straw effigy', 'River', 'Green branch with ribbons', 'Painted eggs'],
    },
    respect:
      'Marzanna is above all a living folk custom of Poland, Czechia and Slovakia, kept by Catholic and secular families and schools as well as by Rodnovers. If you take part, follow local customs and environmental rules: many towns now ask that Marzannas be burned or made without plastic, not thrown into rivers.',
    sources: [
      'Jan Długosz, Annales seu cronicae incliti Regni Poloniae, book 1 (15th century).',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), on “carrying out Death”.',
      'James George Frazer, The Golden Bough (abridged 1922), ch. 28: https://www.gutenberg.org/ebooks/3623',
      'Aleksander Gieysztor, Mitologia Słowian (Warsaw, 1982).',
    ],
  },
  {
    ref: 'slavic-kupala',
    title: 'Kupala Night',
    aka: ['Noc Kupały', 'Ivan Kupala', 'Kupalle', 'Sobótka', 'St John’s Eve', 'Kupalnocka'],
    tradition: 'Slavic',
    summary:
      'Midsummer night of fire and water: jumping over bonfires, floating flower wreaths on rivers, and searching for the magical fern flower. Kept on St John’s Eve, 23–24 June; in Orthodox lands by the Old Style, 6–7 July.',
    honours:
      'The sun at its height, water and fire together, young love, and the healing herbs of midsummer. In Christian terms it is the feast of St John the Baptist (Ivan); Rodnovers honour Kupala as a figure of midsummer, and some honour Dazhbog or Lada.',
    history:
      'Midsummer customs among the Slavs are recorded from the Middle Ages, often in church complaints about “devilish games”. A seventeenth-century Ukrainian chronicle names Kupalo as a god of the earth’s fruits, though scholars now think Kupala was more likely a name for the festival itself, from a root meaning “to bathe”, joined with the Baptist’s feast.\n\nThe customs are vivid and widespread. Young people light bonfires on river banks and jump over them in pairs. Girls weave wreaths of flowers and herbs and set them floating with candles; if a boy catches a girl’s wreath, they will marry. People bathe in rivers and roll in the dew. The night’s greatest secret is the fern flower, which blooms only at midnight and brings luck and the ability to understand animals and find treasure; of course ferns do not flower, which is part of the magic.\n\nIn Poland the festival is called Sobótka, and Jan Kochanowski wrote about it in 1586. In Belarus Kupalle is a national celebration, and in Ukraine and Russia it is kept in early July.',
    knowAndDont: {
      known:
        'The midsummer customs of fire, water, wreaths, herbs and the fern flower are richly documented from the sixteenth century to today.',
      unknown:
        'Whether there was a god called Kupala is doubtful; the name is probably the festival’s. The pre-Christian form of the festival is not directly recorded.',
    },
    celebrate: [
      'Weave a wreath of wild flowers and herbs and float it on a river or lake (natural materials only).',
      'Light a bonfire safely and lawfully, and jump only a small, safe flame, or simply walk round it.',
      'Gather midsummer herbs with thanks, to dry for the year.',
      'Bathe in a river, lake or the sea if it is safe, or walk barefoot in the dew.',
      'Stay up late and search the woods for the fern flower, with friends and a torch.',
    ],
    ritual: { premade: 'folk-kupala-wreath' },
    correspondences: {
      deities: ['Dazhbog', 'Lada', 'Perun'],
      herbs: ['St John’s Wort', 'Mugwort', 'Yarrow', 'Birch', 'Elder'],
      crystals: ['Sunstone', 'Moonstone', 'Aquamarine'],
      colors: ['Red', 'Gold', 'Green', 'White'],
      foods: ['Bread and honey', 'Kvass or mead', 'Cheese', 'Strawberries'],
      symbols: ['Flower wreath', 'Bonfire', 'Fern flower', 'River', 'Dew'],
    },
    respect:
      'Kupala is a living folk festival in Belarus, Ukraine, Poland, Russia and the Baltic lands, kept by Orthodox, Catholic and secular communities and by Rodnovers. If you join a public celebration, ask about local customs, keep the rivers clean, and remember that for many people from these countries it carries strong feelings of home and identity, especially in time of war.',
    sources: [
      'Linda J. Ivanits, Russian Folk Belief (Armonk, 1989).',
      'Jan Kochanowski, Pieśń świętojańska o Sobótce (1586).',
      'W. R. S. Ralston, The Songs of the Russian People (1872): https://www.gutenberg.org/ebooks/search/?query=ralston+songs+of+the+russian+people',
      'Aleksander Gieysztor, Mitologia Słowian (Warsaw, 1982).',
    ],
  },
  {
    ref: 'slavic-dziady',
    title: 'Dziady',
    aka: ['Forefathers’ Eve', 'Dzyady', 'Radunitsa', 'Zaduszki', 'Dmitrov Saturday'],
    tradition: 'Slavic',
    summary:
      'Forefathers’ Eve, when the spirits of the ancestors are welcomed home and fed. Kept several times a year in Belarus; the autumn Dziady falls before St Dmitri’s day in early November, and in Poland it has merged with All Saints’ and All Souls’.',
    honours:
      'The dziady, “grandfathers”: all the family dead, who return home on these nights to be fed and remembered. Also the souls with no one to remember them.',
    history:
      'In Belarus, Ukraine, Lithuania and eastern Poland, families kept several days for the dead each year: in spring (Radunitsa, after Easter), at Trinity, and in autumn (Dzmitrava Saturday, before St Dmitri’s day). On the autumn Dziady the house was cleaned, a special supper prepared, and the door or window opened. Food was set out for the dead, and a share was left on the table overnight; sometimes the first spoonful of each dish was put aside for them. People spoke little and avoided sharp knives, so as not to hurt the souls.\n\nThe Polish poet Adam Mickiewicz made the custom famous in his verse drama Dziady (1823–1860), in which a village ritual summons the dead. In Poland the customs largely merged with All Saints’ Day and All Souls’ (Zaduszki), with candles on every grave. In Belarus, Dziady is still widely kept and has become a day of national remembrance.',
    knowAndDont: {
      known:
        'The customs of feeding the dead on set days are well documented in nineteenth- and twentieth-century folklore, and the Orthodox and Catholic memorial days are part of church life.',
      unknown:
        'The pre-Christian origins are assumed but not directly recorded. Practice varies a great deal by region.',
    },
    celebrate: [
      'Clean the house and prepare a simple supper with traditional foods.',
      'Open a door or window, and invite your dead to come.',
      'Set a place for them, and leave a share of the food overnight.',
      'Visit graves and light candles, especially on forgotten ones.',
      'Read Mickiewicz’s Dziady, or tell stories about your family dead.',
    ],
    ritual: { premade: 'folk-dziady-meal' },
    correspondences: {
      deities: ['Veles', 'Mokosh'],
      herbs: ['Rosemary', 'Juniper', 'Birch'],
      crystals: ['Jet', 'Smoky Quartz', 'Amber'],
      colors: ['White', 'Black', 'Red'],
      foods: ['Kutia (wheat with honey and poppy seed)', 'Pancakes (bliny)', 'Bread', 'Kissel', 'Vodka or kvass'],
      symbols: ['Open door', 'Empty place at the table', 'Candles on graves', 'Towel (rushnyk)'],
    },
    respect:
      'Dziady and the days of the dead are kept by Orthodox and Catholic Christians and secular families in Belarus, Poland, Ukraine and Lithuania, and by Rodnovers. In Belarus it also carries political meaning as a day of remembrance for victims of repression. If you visit a cemetery, behave quietly, don’t touch other families’ graves except to light a candle on a neglected one, and follow local customs.',
    sources: [
      'Adam Mickiewicz, Dziady (Forefathers’ Eve), parts II and IV (1823).',
      'Linda J. Ivanits, Russian Folk Belief (Armonk, 1989).',
      'Aleksander Gieysztor, Mitologia Słowian (Warsaw, 1982).',
    ],
  },
  {
    ref: 'slavic-koliada',
    title: 'Koliada',
    aka: ['Kolyada', 'Koleda', 'Kolędowanie', 'Svyat Vechir', 'Carolling'],
    tradition: 'Slavic',
    summary:
      'The season of carolling: koliadki sung from house to house for blessings in the year ahead, from Christmas Eve to Epiphany. Keeping it at the solstice as a festival of the newborn sun is a modern Rodnover reconstruction.',
    honours:
      'The newborn Christ, for most who keep it; the household and its prosperity for the year; the ancestors, who are fed at the Holy Supper; and, for Rodnovers, the reborn sun.',
    history:
      'The name comes from the Latin calendae, the first day of the month, especially the New Year’s Kalends, borrowed into Slavic languages in early Christian times. Carollers went from house to house through the Christmas season, often with a star on a pole, a goat costume (koza), and a puppet show (vertep). Their songs, koliadki and shchedrivky, wished the household health, good harvests and marriages, and they were given food and coins in return.\n\nOn Christmas Eve families shared the Holy Supper of twelve meatless dishes, beginning with kutia, wheat with honey and poppy seeds, and set a spoonful aside for the dead. A sheaf of wheat, the didukh, stood in the corner. The Ukrainian carol Shchedryk, arranged by Mykola Leontovych, became the English “Carol of the Bells”.\n\nNo pre-Christian Koliada festival is recorded. Rodnovers have reconstructed Koliada as a solstice festival of the newborn sun, and keep it in that form today.',
    knowAndDont: {
      known:
        'The carolling customs, songs, Holy Supper and didukh are richly documented and still very much alive.',
      unknown:
        'The pre-Christian midwinter customs of the Slavs are not directly recorded, and the idea of a sun god Koliada is a modern reconstruction.',
    },
    celebrate: [
      'Go carolling with friends, or learn a koliadka or Shchedryk.',
      'Cook kutia, or a meatless supper, and set a spoon aside for the ancestors.',
      'Stand a sheaf of wheat or a bundle of grasses in the corner of the room.',
      'Make a star on a pole and carry it with your carollers.',
      'Give to carollers or to people in need.',
    ],
    ritual: {
      title: 'A Holy Supper and carol',
      outline: [
        'Place a little hay or straw under the tablecloth and a sheaf in the corner.',
        'Light a candle in the window and wait for the first star to appear.',
        'Share a supper of simple, meatless dishes, beginning with kutia.',
        'Set aside a portion for the ancestors.',
        'Sing a carol or koliadka, and bless the house for the year.',
      ],
    },
    correspondences: {
      deities: ['Dazhbog', 'Veles'],
      herbs: ['Juniper', 'Birch', 'Holly'],
      crystals: ['Garnet', 'Amber', 'Clear Quartz'],
      colors: ['Red', 'Gold', 'White'],
      foods: ['Kutia', 'Pierogi or varenyky', 'Borscht', 'Uzvar (dried fruit drink)', 'Poppy-seed cake'],
      symbols: ['Carollers’ star', 'Didukh (wheat sheaf)', 'Goat mask', 'Candle in the window'],
    },
    respect:
      'Koliada is above all the Christmas season of Orthodox and Catholic Slavs, kept by families and churches in Ukraine, Belarus, Poland, Russia, Serbia, Slovakia and beyond. Rodnovers keep their own solstice form. If you join carolling or a Holy Supper, honour the Christian meaning for those who hold it, and the strong ties to home and family it carries, especially for Ukrainians today.',
    sources: [
      'Linda J. Ivanits, Russian Folk Belief (Armonk, 1989).',
      'Mykola Leontovych, Shchedryk (arranged 1916).',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), on calends and carolling.',
    ],
  },
  // ─── Christian ───────────────────────────────────────────────────────
  {
    ref: 'christian-epiphany',
    title: 'Epiphany',
    aka: ['Twelfth Night', 'Three Kings’ Day', 'Theophany', 'Little Christmas', 'Día de Reyes'],
    tradition: 'Christian',
    summary:
      'On 6 January the Magi come to the Christ child, and Twelfth Night ends the Christmas season. Doors are chalked with the year and the Magi’s initials to bless the house for the year ahead.',
    honours:
      'Christ revealed to the world: to the Magi from the east in the Western churches, and at his baptism in the Jordan in the Eastern churches. The Magi, later named Caspar, Melchior and Balthasar, are honoured as the first pilgrims.',
    history:
      'Epiphany, “manifestation”, is one of the oldest Christian feasts, kept in the East from the third or fourth century. In the West it came to focus on the visit of the Magi in Matthew’s Gospel; in the East, as Theophany, on Christ’s baptism, with great blessings of water in rivers and the sea.\n\nFolk customs abound. The house blessing with chalk, writing the year and C+M+B above the door (for the Magi’s names, or Christus mansionem benedicat, “May Christ bless this house”), is kept in Central Europe, and children go from house to house as star singers collecting for charity. In Spain and Latin America the Three Kings bring the gifts; in Italy La Befana does. A king cake or Twelfth cake with a hidden bean or figure chooses a king for the night. In England, Twelfth Night was a night of feasting and misrule, and the Christmas greenery came down.',
    knowAndDont: {
      known:
        'The feast is ancient. The chalking, star singers, king cake and water blessings are long-established and still widely kept.',
      unknown:
        'The Gospel does not say how many Magi there were or that they were kings; the names and the number three come from later tradition.',
    },
    celebrate: [
      'Chalk the year and C+M+B above your door, with a short prayer for the house.',
      'Bake or buy a king cake with a hidden bean or figure; whoever finds it is king or queen for the night.',
      'Take down Christmas decorations and greenery, and compost or burn it safely.',
      'Bless water, or attend a church water blessing if you are near an Orthodox community.',
      'Give a gift to someone in need, as the Magi did.',
    ],
    ritual: { premade: 'folk-epiphany-chalk' },
    correspondences: {
      herbs: ['Frankincense', 'Myrrh'],
      crystals: ['Citrine', 'Clear Quartz'],
      colors: ['Gold', 'White'],
      foods: ['King cake or Twelfth cake', 'Galette des rois', 'Rosca de Reyes', 'Spiced wine'],
      symbols: ['Star', 'Chalk', 'The three gifts', 'Crowns', 'Water'],
    },
    respect:
      'Epiphany is a Christian feast, kept as a holy day in many churches. Chalking the door is a Catholic and Lutheran house blessing; you are welcome to keep it, but it is a prayer to Christ, not a spell. If you attend a church service or a water blessing, come quietly, follow what others do, and ask before photographing.',
    sources: [
      'Catholic Encyclopedia (1909), “Epiphany”: https://www.newadvent.org/cathen/05504c.htm',
      'Matthew 2:1–12.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 2.',
    ],
  },
  {
    ref: 'christian-st_brigid',
    title: 'St Brigid’s Day',
    aka: ['Lá Fhéile Bríde', 'Feast of St Brigid', 'St Bride’s Day', 'Imbolc'],
    tradition: 'Christian',
    summary:
      'Feast of Brigid of Kildare on 1 February, saint of hearth, healing and holy wells. Rush crosses are woven and hung over doors for protection, and a cloth is left out overnight to take her blessing.',
    honours:
      'St Brigid of Kildare (died c. 525), abbess and founder of a double monastery, patron of Ireland with Patrick and Columba, of dairy workers, midwives, newborns and the poor. She is remembered for her generosity: giving away her father’s goods, her mother’s butter, and anything else to the needy.',
    history:
      'Brigid’s early Lives, from the seventh century on, are full of miracles of food and abundance: butter multiplied, a cow giving milk three times, ale made from bath water for visiting clergy. Her monastery at Kildare became one of the most important in Ireland, and Gerald of Wales described a fire there tended by her nuns that never went out.\n\nHer feast on 1 February, the first day of spring in Ireland, is kept with many customs: weaving a cross from rushes, often while telling the story of Brigid explaining the cross to a dying chieftain; leaving out a cloth (brat Bríde) to be blessed; making a doll (Brídeog) carried by children; and visiting holy wells.\n\nThe Brigidine Sisters relit her flame in Kildare in 1993, and in 2023 Ireland made her feast a public holiday.',
    knowAndDont: {
      known:
        'Brigid’s cult, her Lives, the Kildare monastery, and the feast customs are well documented.',
      unknown:
        'Very little is known for certain about the historical Brigid. The relation between the saint and the goddess of the same name is debated by scholars and believers alike.',
    },
    celebrate: [
      'Weave a Brigid’s cross from rushes, straw or paper, and hang it inside the door.',
      'Leave a strip of cloth outside overnight for Brigid’s blessing.',
      'Visit a holy well, or bless a bowl of water at home.',
      'Give food or money to someone in need, as Brigid did.',
      'Pray the traditional blessing or a prayer of your own for the home.',
    ],
    ritual: { premade: 'folk-brigid-cross-well' },
    correspondences: {
      herbs: ['Rowan', 'Chamomile'],
      crystals: ['Amethyst', 'Clear Quartz'],
      colors: ['White', 'Green', 'Red'],
      foods: ['Butter', 'Bread', 'Buttermilk', 'Colcannon'],
      symbols: ['Brigid’s cross', 'Brat Bríde', 'Holy well', 'Flame', 'Cow'],
    },
    respect:
      'St Brigid’s Day is a living Christian feast, and Brigid is a beloved Catholic, Anglican and Orthodox saint. Many Irish people keep both her Christian and folk customs. If you visit Kildare or a holy well, treat it as a holy place: quietly, without leaving litter or non-biodegradable rags.',
    sources: [
      'Catholic Encyclopedia (1907), “St. Brigid of Ireland”: https://www.newadvent.org/cathen/02784b.htm',
      'Kevin Danaher, The Year in Ireland (Cork, 1972).',
      'Solas Bhríde Centre, Kildare: https://solasbhride.ie/',
    ],
  },
  {
    ref: 'christian-candlemas',
    title: 'Candlemas',
    aka: ['Presentation of the Lord', 'Purification of Mary', 'Feast of Lights', 'Hypapante'],
    tradition: 'Christian',
    summary:
      'The Presentation of Christ in the Temple on 2 February, forty days after Christmas: the light of the world. Candles for the year are blessed today, and the weather is watched for what is left of winter.',
    honours:
      'The infant Christ presented in the Temple; Mary, who came for purification after childbirth; and the old Simeon and Anna, who recognised him. Simeon’s song calls Christ “a light to lighten the Gentiles”.',
    history:
      'The pilgrim Egeria described the feast in Jerusalem in the late fourth century. In Rome, by the seventh century, it was kept with a procession of candles, and the blessing of candles became central: churches and households had their candles for the year blessed at Candlemas.\n\nFolk weather lore says that if Candlemas is bright and fair, winter will have another flight; if it is dark and wet, winter is gone. In German-speaking America, this became Groundhog Day. In France, crêpes are made at the Chandeleur. In some places the Christmas greenery was kept until Candlemas, and then removed.',
    knowAndDont: {
      known:
        'The feast, its candle procession and its weather lore are well documented.',
      unknown:
        'Claims that Candlemas replaced the Roman Lupercalia or Imbolc are not supported by evidence; it falls forty days after Christmas.',
    },
    celebrate: [
      'Gather the candles you will use this year, and have them blessed at church or bless them yourself with a prayer.',
      'Light a candle in each window at dusk.',
      'Make pancakes or crêpes.',
      'Watch the weather, and note what it says about spring.',
      'Take down the last of the Christmas greenery.',
    ],
    ritual: { premade: 'folk-candlemas-candles' },
    correspondences: {
      herbs: ['Bay', 'Rosemary', 'Frankincense'],
      crystals: ['Clear Quartz', 'Selenite'],
      colors: ['White', 'Gold'],
      foods: ['Crêpes or pancakes', 'Bread', 'Milk'],
      symbols: ['Candles', 'Two turtle doves', 'The Temple', 'Light'],
    },
    respect:
      'Candlemas is a Christian feast still kept in Catholic, Orthodox, Anglican and Lutheran churches. Many Christians welcome visitors at the candle blessing. If you bless candles at home, you can use Simeon’s song (Luke 2:29–32) in its Christian meaning.',
    sources: [
      'Catholic Encyclopedia (1908), “Candlemas”: https://www.newadvent.org/cathen/03245b.htm',
      'Luke 2:22–40.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 14.',
    ],
  },
  {
    ref: 'christian-ash_wednesday',
    title: 'Ash Wednesday',
    aka: ['Day of Ashes', 'Start of Lent'],
    tradition: 'Christian',
    summary:
      'The first day of Lent, marked with ashes: “remember that you are dust.” Forty days of prayer, fasting and letting go begin.',
    honours:
      'God’s mercy to those who turn back; the season of Lent, in which Christians follow Christ’s forty days in the wilderness and prepare for Easter.',
    history:
      'Ashes as a sign of repentance are found in the Hebrew Bible. By the tenth century, Christians in Western Europe received ashes on their foreheads at the start of Lent, and the custom became universal in the Western church. The ashes are traditionally made by burning the palms from the previous year’s Palm Sunday.\n\nThe priest or minister marks a cross on the forehead and says words from Genesis, in the King James version: “for dust thou art, and unto dust shalt thou return”, or “Repent, and believe the Gospel.” It is a day of fasting for many Christians. The day before is Shrove Tuesday, Mardi Gras or Carnival, a feast to use up rich food.',
    knowAndDont: {
      known:
        'The custom of ashes at Lent is medieval, and the words are biblical.',
      unknown:
        'Exactly when Lent took its present form is debated, and practice varies among churches.',
    },
    celebrate: [
      'Attend an Ash Wednesday service if you wish, or simply reflect on your mortality.',
      'Choose something to give up or take up for Lent, gently and realistically.',
      'Give to charity what you save by fasting.',
      'Burn last year’s palm crosses or a dried bundle of herbs to make your own ashes, safely.',
    ],
    ritual: {
      title: 'A quiet beginning to Lent',
      outline: [
        'Sit with a candle and a small dish of ashes.',
        'Read Genesis 3:19 or Psalm 51 slowly.',
        'Touch a little ash to your forehead or the back of your hand, if you wish, and remember that you are dust.',
        'Name one thing to let go of, and one practice to take up, for the forty days.',
        'Put out the candle and keep the evening simple.',
      ],
    },
    correspondences: {
      herbs: ['Hyssop', 'Rosemary', 'Myrrh'],
      crystals: ['Smoky Quartz', 'Amethyst'],
      colors: ['Purple', 'Grey'],
      foods: ['Plain bread', 'Simple soup', 'Water'],
      symbols: ['Ashes', 'Cross', 'Desert', 'Palm'],
    },
    respect:
      'Ash Wednesday is a Christian day of penitence. Anyone may attend a service, and many churches welcome non-Christians to receive ashes; ask the minister. Keep any private observance respectful of its meaning.',
    sources: [
      'Catholic Encyclopedia (1907), “Ash Wednesday”: https://www.newadvent.org/cathen/01775b.htm',
      'Genesis 3:19 (King James Version).',
      'Church of England, The Church’s Year: https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year',
    ],
  },
  {
    ref: 'christian-lady_day',
    title: 'Lady Day (Annunciation)',
    aka: ['The Annunciation', 'Lady Day', 'Feast of the Incarnation'],
    tradition: 'Christian',
    summary:
      'Gabriel’s message to Mary on 25 March, nine months before Christmas. A feast of Mary, of yes-saying and new life, and an old quarter day when the year turned.',
    honours:
      'Mary, who said yes to God; the archangel Gabriel; and the conception of Christ.',
    history:
      'The Annunciation is told in Luke’s Gospel. The feast was kept by the fifth century, and in the West its date, 25 March, was linked with the spring equinox and the creation of the world. In England, Lady Day was the legal start of the year until 1752, and one of the quarter days when rents were due and contracts began. That is why the British tax year still begins on 6 April, Lady Day adjusted for the calendar change.\n\nFolk customs of the day include seed sowing and blessings for the farm. In Orthodox lands, birds were released and it was considered a great feast when no work was done.',
    knowAndDont: {
      known:
        'The feast, its date, and its role as an English quarter day and New Year are well recorded.',
      unknown:
        'Many folk customs tied to Lady Day are local and variable.',
    },
    celebrate: [
      'Sow seeds or plant something with a prayer for new life.',
      'Read Luke 1:26–38, or the Magnificat.',
      'Set a vase of spring flowers by an image of Mary.',
      'Take stock of the year as the old Lady Day new year: what are you saying yes to?',
    ],
    ritual: { premade: 'green-seed-blessing-before-sowing' },
    correspondences: {
      herbs: ['Rose', 'Lavender', 'Calendula'],
      crystals: ['Moonstone', 'Rose Quartz', 'Lapis Lazuli'],
      colors: ['Blue', 'White'],
      foods: ['Waffles (Våffeldagen in Sweden)', 'Spring greens', 'Honey'],
      symbols: ['Lily', 'Dove', 'Angel', 'Seed'],
    },
    respect:
      'The Annunciation is a Christian feast of Mary, solemnly kept in Catholic, Orthodox and Anglican churches. If you honour Mary in your own way, respect that she is not a goddess in Christian belief, and keep devotion separate from spellwork.',
    sources: [
      'Catholic Encyclopedia (1907), “The Feast of the Annunciation”: https://www.newadvent.org/cathen/01542a.htm',
      'Luke 1:26–38.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996).',
    ],
  },
  {
    ref: 'christian-palm_sunday',
    title: 'Palm Sunday',
    aka: ['Passion Sunday', 'Willow Sunday', 'Yew Sunday', 'Flower Sunday'],
    tradition: 'Christian',
    summary:
      'Christ’s entry into Jerusalem, a week before Easter; Holy Week begins. Blessed palms are kept, often folded into crosses, as protection for the home through the year.',
    honours:
      'Christ entering Jerusalem as king, greeted by crowds with palm branches; and the beginning of the week of his passion.',
    history:
      'The pilgrim Egeria described the procession with branches in late fourth-century Jerusalem. The custom spread to the West, where branches were blessed and carried. In northern countries without palms, people used willow, yew, box or other evergreens; in Slavic lands it is Willow Sunday, and in Poland elaborate “palms” of dried flowers and grasses are made.\n\nBlessed palms or branches were kept in the home, tucked behind pictures or crosses, and believed to protect against lightning, fire and illness. In many places they were burned the following year to make the Ash Wednesday ashes.',
    knowAndDont: {
      known:
        'The feast, the procession, and the custom of keeping blessed branches are long-established.',
      unknown:
        'The protective folk beliefs vary greatly from place to place.',
    },
    celebrate: [
      'Attend a Palm Sunday service and take home a blessed palm or branch.',
      'Fold a palm or willow into a cross and keep it in your home.',
      'Bring in pussy willow or spring branches for the house.',
      'Read the Gospel account of the entry into Jerusalem.',
    ],
    ritual: {
      title: 'A branch for the house',
      outline: [
        'Collect a palm from church or cut a few sprigs of willow or yew with thanks.',
        'Read Matthew 21:1–11.',
        'Fold or tie the branches into a cross.',
        'Place it behind a picture, over the door or by a crucifix, with a prayer for the house.',
        'Keep it until next Lent, then burn it safely or return it to church.',
      ],
    },
    correspondences: {
      herbs: ['Willow', 'Yew', 'Bay'],
      crystals: ['Green Aventurine', 'Clear Quartz'],
      colors: ['Red', 'Green'],
      foods: ['Bread', 'Figs'],
      symbols: ['Palm', 'Willow', 'Donkey', 'Cross'],
    },
    respect:
      'Palm Sunday begins the holiest week of the Christian year. Visitors are welcome at most services; join the procession if invited. Keep blessed palms with respect; many Christians return old ones to church to be burned.',
    sources: [
      'Catholic Encyclopedia (1911), “Palm Sunday”: https://www.newadvent.org/cathen/11432b.htm',
      'Matthew 21:1–11.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996).',
    ],
  },
  {
    ref: 'christian-good_friday',
    title: 'Good Friday',
    aka: ['Holy Friday', 'Great Friday'],
    tradition: 'Christian',
    summary:
      'The crucifixion, the most solemn day of the Christian year: a day of fasting, silence and keeping vigil. Bread baked today was kept for healing.',
    honours:
      'Christ’s passion and death on the cross, and all who suffer.',
    history:
      'Christians have marked the day of the crucifixion from the earliest centuries. Its liturgy includes the reading of the Passion, the veneration of the cross, and prayers for the whole world; no Mass is said in the Catholic church. In many countries it is kept with processions, Stations of the Cross, and silence.\n\nFolk customs include hot cross buns in England, which were believed not to go mouldy and were kept for healing; eggs laid on Good Friday were also kept. In some places, no iron was put in the ground and no nails hammered.',
    knowAndDont: {
      known:
        'The day’s liturgy and many of its folk customs are well documented.',
      unknown:
        'Hot cross buns are first clearly recorded in the eighteenth century; claims of a pagan origin are unproven.',
    },
    celebrate: [
      'Keep quiet for part of the day, especially between noon and three.',
      'Walk the Stations of the Cross, or attend a service.',
      'Eat simply, and fast only if your health allows.',
      'Bake or buy hot cross buns, and keep one in the kitchen.',
      'Pray or light a candle for those who suffer.',
    ],
    ritual: {
      title: 'Three hours of quiet',
      outline: [
        'Clear the afternoon, from noon to three if you can.',
        'Light a single candle by a cross or plain cloth.',
        'Read one of the Passion accounts, such as John 18–19.',
        'Sit in silence, and pray for the suffering of the world.',
        'At three o’clock, put out the candle and eat a simple meal.',
      ],
    },
    correspondences: {
      herbs: ['Hyssop', 'Myrrh', 'Rosemary'],
      crystals: ['Smoky Quartz', 'Onyx'],
      colors: ['Black', 'Red', 'Purple'],
      foods: ['Hot cross buns', 'Fish', 'Plain bread', 'Water'],
      symbols: ['Cross', 'Crown of thorns', 'Nails', 'Candle'],
    },
    respect:
      'Good Friday is a holy day of mourning for Christians. If you attend, dress soberly and keep the silence. This page offers devotion and reflection rather than magic, in keeping with the day.',
    sources: [
      'Catholic Encyclopedia (1909), “Good Friday”: https://www.newadvent.org/cathen/06643a.htm',
      'John 18–19.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 19.',
    ],
  },
  {
    ref: 'christian-easter',
    title: 'Easter',
    aka: ['Pascha', 'Resurrection Sunday', 'Ostern'],
    tradition: 'Christian',
    summary:
      'The resurrection, the heart of the Christian year: new life out of death, kept with sunrise services, eggs, lilies and blessed water.',
    honours:
      'The risen Christ, and the promise of new life; the women at the tomb, who were the first witnesses.',
    history:
      'Easter is the oldest Christian feast, kept from the first century in connection with the Jewish Passover. Its date, the first Sunday after the first full moon on or after 21 March, was set by the fourth century. The Easter Vigil begins in darkness: a new fire is lit, the Paschal candle is carried into the church, and the cry goes up, “Christ is risen!”\n\nThe English name may come from Eostre, a goddess mentioned by Bede, though some scholars doubt this. Eggs, given up during Lent, return at Easter, and are dyed red in Orthodox lands, decorated as pisanki in Poland and Ukraine, or hunted for in Germany and beyond. Water drawn from a stream before sunrise on Easter morning was thought to have healing power.',
    knowAndDont: {
      known:
        'Easter’s Christian origins, liturgy, date and folk customs are well documented.',
      unknown:
        'The derivation of “Easter” from Eostre rests on Bede alone. Claims that eggs or hares come from Eostre are unproven.',
    },
    celebrate: [
      'Attend a sunrise service or the Easter Vigil.',
      'Dye or decorate eggs, and share them.',
      'Draw water from a stream in silence before dawn, and keep it.',
      'Bring spring flowers or lilies into the house.',
      'Share a feast with family and friends.',
    ],
    ritual: {
      title: 'Easter morning',
      outline: [
        'Rise before dawn, and if you can, go out to watch the sunrise.',
        'Draw a little water from a clean stream or tap, in silence, and bring it home.',
        'Light a candle and say, “Christ is risen.”',
        'Bless the house and family with the water.',
        'Break your Lenten fast with eggs and bread.',
      ],
    },
    correspondences: {
      herbs: ['Rosemary', 'Lavender', 'Hyssop'],
      crystals: ['Clear Quartz', 'Rose Quartz'],
      colors: ['White', 'Gold', 'Yellow'],
      foods: ['Eggs', 'Lamb', 'Hot cross buns', 'Paska or kulich', 'Simnel cake'],
      symbols: ['Empty tomb', 'Paschal candle', 'Eggs', 'Lilies', 'Lamb'],
    },
    respect:
      'Easter is the most important Christian feast. Visitors are welcome at most services, especially sunrise services. Orthodox Easter often falls on a different date. Treat its symbols with respect even if you also keep the spring equinox.',
    sources: [
      'Catholic Encyclopedia (1909), “Easter”: https://www.newadvent.org/cathen/05224d.htm',
      'Bede, De temporum ratione, ch. 15 (725).',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 19–20.',
    ],
  },
  {
    ref: 'christian-pentecost',
    title: 'Pentecost',
    aka: ['Whitsun', 'Whit Sunday', 'Feast of the Holy Spirit'],
    tradition: 'Christian',
    summary:
      'The Holy Spirit comes as wind and tongues of fire, fifty days after Easter. A feast of gifts, inspiration and speaking with power.',
    honours:
      'The Holy Spirit, who came upon the apostles as they prayed together in Jerusalem, and the Church, which Christians say was born that day.',
    history:
      'Acts of the Apostles tells how, at the Jewish feast of Shavuot (Pentecost), the apostles heard a rushing wind and saw tongues of fire on each other’s heads, then spoke in languages that people of many nations understood. Christians have kept the feast since at least the second century.\n\nIn England it was called Whitsun, perhaps from the white clothes of the newly baptised. Whitsun was a time of church ales, Morris dancing and processions, and Whit walks are still held in parts of northern England. In some churches rose petals are dropped from the ceiling to represent the tongues of fire.',
    knowAndDont: {
      known:
        'The feast is ancient and the account is in Acts 2.',
      unknown:
        'The origin of the name Whitsun is debated.',
    },
    celebrate: [
      'Wear red, and attend a Pentecost service.',
      'Fly a kite or sit in the wind, thinking of the Spirit.',
      'Learn a phrase in a new language, or speak to someone from another culture.',
      'Name your gifts and how you will use them this year.',
    ],
    ritual: {
      title: 'Wind and fire',
      outline: [
        'Light a red candle in a safe place, ideally by an open window.',
        'Read Acts 2:1–13.',
        'Feel the air moving, and pray for the gifts you need.',
        'Write each gift on a slip of paper and keep it on your altar or in your Bible.',
        'Put out the candle and go out into the wind.',
      ],
    },
    correspondences: {
      herbs: ['Bay', 'Frankincense', 'Rose'],
      crystals: ['Carnelian', 'Ruby'],
      colors: ['Red', 'White'],
      foods: ['Bread', 'Honey', 'Strawberries'],
      symbols: ['Dove', 'Flames', 'Wind', 'Rose petals'],
    },
    respect:
      'Pentecost is a major Christian feast. Visitors are welcome at services. If you honour the Spirit in your own way, respect what the feast means to those who keep it.',
    sources: [
      'Catholic Encyclopedia (1912), “Pentecost”: https://www.newadvent.org/cathen/15614b.htm',
      'Acts 2:1–13.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 25–26.',
    ],
  },
  {
    ref: 'christian-st_john',
    title: 'St John’s Eve and Day',
    aka: ['Midsummer', 'Nativity of St John the Baptist', 'Sankthans', 'Juhannus', 'Noc Świętojańska'],
    tradition: 'Christian',
    summary:
      'The birth of John the Baptist at midsummer, 24 June. Bonfires are lit on the eve, and St John’s wort, gathered now, is hung for protection.',
    honours:
      'John the Baptist, the forerunner of Christ, whose birth was six months before Jesus’s; and the light of midsummer, which, as John said, “must decrease” after him.',
    history:
      'The feast of John’s birth was kept by the fourth century. St Augustine noted that after John’s birth the days begin to shorten, and after Christ’s they lengthen, echoing John’s words, “He must increase, but I must decrease.”\n\nMidsummer bonfires on St John’s Eve are recorded across Europe from the Middle Ages, with leaping through the flames, rolling burning wheels, and gathering herbs. St John’s wort, which blooms around this time, was hung over doors and windows to keep away evil and lightning. In Scandinavia, Finland and the Baltic lands, St John’s Eve is still one of the great festivals of the year.',
    knowAndDont: {
      known:
        'The feast date, the bonfires and herb customs are well recorded.',
      unknown:
        'Whether the midsummer fires were originally pagan is debated; they are documented mainly in Christian times.',
    },
    celebrate: [
      'Light a bonfire or candles on the eve, safely and lawfully.',
      'Gather St John’s wort and other midsummer herbs, and hang a bunch over the door (do not take it internally; it interacts with many medicines and can cause sun sensitivity).',
      'Read the birth of John in Luke 1, or the Benedictus.',
      'Stay up for the short night with friends.',
    ],
    ritual: { premade: 'green-harvesting-herbs-with-thanks' },
    correspondences: {
      herbs: ['St John’s Wort', 'Yarrow', 'Elder', 'Mugwort', 'Vervain'],
      crystals: ['Sunstone', 'Citrine'],
      colors: ['Gold', 'Red', 'Green'],
      foods: ['Strawberries', 'New potatoes', 'Honey', 'Bread'],
      symbols: ['Bonfire', 'St John’s wort', 'Lamb', 'Shell'],
    },
    respect:
      'St John’s Day is a Christian feast and, in many countries, a national holiday with deep folk roots. Join public bonfires as a guest, follow local fire rules, and honour the Christian meaning for those who keep it.',
    sources: [
      'Catholic Encyclopedia (1910), “St. John the Baptist”: https://www.newadvent.org/cathen/08486b.htm',
      'John 3:30; Luke 1:57–80.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 30–31.',
    ],
  },
  {
    ref: 'christian-lammas',
    title: 'Lammas (Loaf Mass)',
    aka: ['Loaf Mass', 'Hlafmæsse', 'Lammas Day', 'Gule of August'],
    tradition: 'Christian',
    summary:
      'On 1 August, the first loaf from the new wheat is baked and blessed in thanks for the harvest. Pieces were kept to bless the barn and hearth.',
    honours:
      'God as giver of the harvest, and the work of farmers and bakers. In the Western church, 1 August was also the feast of St Peter in Chains.',
    history:
      'The Anglo-Saxon Chronicle mentions “hlafmæsse” in 921. A loaf made from the first wheat was brought to church and blessed. An Anglo-Saxon charm recommends crumbling the blessed loaf in the four corners of the barn to protect the harvest.\n\nLammas was a quarter day in Scotland and a date for fairs and rents in England. The custom faded after the Reformation but has been revived in many Anglican parishes, where a loaf is offered at the altar.',
    knowAndDont: {
      known:
        'The name and the loaf blessing are recorded in Anglo-Saxon sources, and the date was a quarter day.',
      unknown:
        'How widely the loaf blessing was kept in medieval England is uncertain.',
    },
    celebrate: [
      'Bake a loaf from new flour, and give thanks before cutting it.',
      'Take bread to church to be blessed, if your parish keeps Lammas.',
      'Crumble a little blessed bread in the corners of your kitchen or garden for protection.',
      'Thank a farmer or baker.',
    ],
    ritual: { premade: 'kitchen-prosperity-bread' },
    correspondences: {
      herbs: ['Calendula', 'Basil'],
      crystals: ['Citrine', 'Tiger Eye'],
      colors: ['Gold', 'Yellow'],
      foods: ['New bread', 'Honey', 'Ale', 'Apples'],
      symbols: ['Loaf', 'Wheat sheaf', 'Sickle'],
    },
    respect:
      'Lammas is a Christian harvest custom, kept especially in Anglican churches, and shares a date and theme with the Wheel of the Year’s Lammas. Both can be honoured; respect the church’s blessing if you attend.',
    sources: [
      'The Anglo-Saxon Chronicle, entry for 921; tr. J. A. Giles (1847), Project Gutenberg: https://www.gutenberg.org/ebooks/657',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 33.',
    ],
  },
  {
    ref: 'christian-assumption',
    title: 'The Assumption of Mary',
    aka: ['Assumption', 'Dormition of the Theotokos', 'Matka Boska Zielna', 'Ferragosto', 'Kräuterweihe'],
    tradition: 'Christian',
    summary:
      'On 15 August, Mary taken up into heaven. In many places bundles of healing herbs are blessed today and hung in the house through the year.',
    honours:
      'Mary, the mother of Jesus, taken body and soul into heaven at the end of her life (in Catholic teaching), or falling asleep and taken up by Christ (the Orthodox Dormition).',
    history:
      'Stories of Mary’s death and assumption circulated from the fifth century, and the feast was kept in the East by the sixth century and in Rome by the seventh. Pope Pius XII declared the Assumption a dogma in 1950.\n\nA legend tells that when Mary’s tomb was opened, it was found full of flowers and sweet herbs. In Germany, Austria and Poland, bundles of herbs and grain (Kräuterbuschen, or bouquets for Matka Boska Zielna, “Our Lady of the Herbs”) are blessed at church and hung in the house or barn to protect against illness and storms. In Italy the day is Ferragosto, the summer holiday.',
    knowAndDont: {
      known:
        'The feast, the dogma, and the herb blessing customs are well documented.',
      unknown:
        'The historical end of Mary’s life is unknown; the feast rests on tradition.',
    },
    celebrate: [
      'Gather a bundle of herbs, flowers and grain and have it blessed at church, or bless it with a prayer.',
      'Hang it in your kitchen or by the door for the year.',
      'Visit a church or shrine of Mary.',
      'Enjoy a summer feast with family.',
    ],
    ritual: {
      title: 'An Assumption herb bundle',
      outline: [
        'Gather seven or nine kinds of herbs and flowers: yarrow, mint, tansy (do not eat), chamomile, wheat or oats, and others from your garden.',
        'Tie them with a ribbon.',
        'Take them to an Assumption Mass to be blessed, or pray the Hail Mary or Magnificat over them at home.',
        'Hang the bundle in the kitchen or over the door for the year.',
        'Burn a little of it in a fireproof dish during storms, safely, as was the old custom.',
      ],
    },
    correspondences: {
      herbs: ['Yarrow', 'Mint', 'Chamomile', 'Calendula', 'Rose'],
      crystals: ['Moonstone', 'Lapis Lazuli', 'Rose Quartz'],
      colors: ['Blue', 'White', 'Gold'],
      foods: ['Summer fruit', 'Bread', 'Honey'],
      symbols: ['Herb bundle', 'Lily', 'Crown of stars'],
    },
    respect:
      'The Assumption is a solemn feast of Mary for Catholics and Orthodox Christians and a public holiday in many countries. If you bless herbs, remember that in Christian belief Mary is honoured, not worshipped, and her feast is not a pagan harvest festival in disguise.',
    sources: [
      'Catholic Encyclopedia (1907), “Assumption of Mary”: https://www.newadvent.org/cathen/02006b.htm',
      'Pius XII, Munificentissimus Deus (1950).',
    ],
  },
  {
    ref: 'christian-michaelmas',
    title: 'Michaelmas',
    aka: ['Feast of St Michael and All Angels', 'Michaelmas Day', 'Feast of the Archangels'],
    tradition: 'Christian',
    summary:
      'Feast of St Michael the Archangel on 29 September, protector against evil, as autumn darkens. Blackberries were not picked after today, and protection is asked for the winter.',
    honours:
      'St Michael, the archangel who fights the dragon in the Book of Revelation, and all angels. Since 1969 the Catholic Church honours Gabriel and Raphael on the same day.',
    history:
      'A church to St Michael was dedicated near Rome on 29 September in the fifth century, and the feast spread across Europe. In England, Michaelmas was a quarter day for rents, hiring fairs and the start of the legal and university terms.\n\nFolk tradition said that when Michael threw the devil out of heaven, he fell into a bramble patch, and every year he spits or worse on the blackberries, so they should not be picked after Michaelmas (or Old Michaelmas, 10–11 October). A goose was eaten for good luck and money, and Michaelmas daisies bloom at this time.',
    knowAndDont: {
      known:
        'The feast, its date and its role as a quarter day are well recorded.',
      unknown:
        'The blackberry legend is folklore with many local versions.',
    },
    celebrate: [
      'Pick the last blackberries before the day, and make a crumble.',
      'Pray Psalm 91 or the prayer to St Michael for protection.',
      'Check the house is ready for winter.',
      'Settle debts or begin new work, as on the old quarter day.',
    ],
    ritual: { premade: 'folk-psalm-91-protection' },
    correspondences: {
      herbs: ['Angelica', 'Bay', 'Rosemary', 'Frankincense'],
      crystals: ['Black Tourmaline', 'Sapphire', 'Lapis Lazuli'],
      colors: ['Blue', 'Red', 'Gold'],
      foods: ['Roast goose', 'Blackberry crumble', 'St Michael’s bannock', 'Apples'],
      symbols: ['Sword', 'Scales', 'Dragon', 'Michaelmas daisy'],
    },
    respect:
      'Michaelmas is a Christian feast of the archangels. If you seek Michael’s protection, do so through prayer rather than spellwork, honouring how the Church understands him.',
    sources: [
      'Catholic Encyclopedia (1911), “St. Michael the Archangel”: https://www.newadvent.org/cathen/10275b.htm',
      'Revelation 12:7–9.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 35.',
    ],
  },
  {
    ref: 'christian-all_hallows_eve',
    title: 'All Hallows’ Eve',
    aka: ['Halloween', 'Hallowe’en', 'Eve of All Saints'],
    tradition: 'Christian',
    summary:
      'The eve of All Saints, 31 October, when the boundary with the dead feels thin: candles in windows, prayers for the departed, and the souls remembered.',
    honours:
      'All the saints, and all the faithful departed; the dead of our families.',
    history:
      'Halloween is the eve of the feast of All Saints. In medieval England, bells were rung for the souls in purgatory, candles lit, and soul cakes given to the poor who prayed for the dead; in later centuries children went souling, singing for cakes.\n\nThe customs of guising, lanterns and divination came from Gaelic Samhain traditions in Ireland and Scotland, and the two merged. Irish and Scottish emigrants brought Halloween to North America, which gave it trick-or-treating and the pumpkin lantern.',
    knowAndDont: {
      known:
        'The eve of All Saints and its medieval customs are well documented, as are the Gaelic folk elements.',
      unknown:
        'How much of Halloween is Christian and how much Gaelic is a lively debate.',
    },
    celebrate: [
      'Light a candle in the window for the souls of the dead.',
      'Bake soul cakes and give them away.',
      'Carve a lantern and welcome children at the door.',
      'Pray for the dead, or name them at your table.',
    ],
    ritual: { premade: 'folk-apple-candle-halloween' },
    correspondences: {
      herbs: ['Rosemary', 'Sage', 'Rowan'],
      crystals: ['Jet', 'Obsidian'],
      colors: ['Black', 'Orange', 'White'],
      foods: ['Soul cakes', 'Apples', 'Nuts', 'Pumpkin'],
      symbols: ['Candle in the window', 'Lantern', 'Soul cakes', 'Bells'],
    },
    respect:
      'All Hallows’ Eve is the vigil of a Christian feast, and many churches hold services for it. Respect those who keep it as a holy night, and those who prefer not to celebrate Halloween at all.',
    sources: [
      'Catholic Encyclopedia (1907), “All Saints’ Day”: https://www.newadvent.org/cathen/01315a.htm',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 36–37.',
    ],
  },
  {
    ref: 'christian-all_saints',
    title: 'All Saints’ Day',
    aka: ['All Hallows', 'Hallowmas', 'Toussaint', 'Wszystkich Świętych', 'Todos los Santos'],
    tradition: 'Christian',
    summary:
      'Honouring all the saints on 1 November, known and unknown: the great company of the faithful who have gone before.',
    honours:
      'All the saints: those named in the calendar, and the countless faithful whose names nobody remembers. Christians speak of the “communion of saints”, the bond between the living and the holy dead, and this is its feast.',
    history:
      'The Eastern churches kept a feast of all martyrs from the fourth century, and still keep All Saints on the Sunday after Pentecost. In Rome, the Pantheon was rededicated to Mary and all martyrs on 13 May 609. Pope Gregory III (731–741) dedicated a chapel in St Peter’s to all the saints, and in 835 Gregory IV extended a 1 November feast to the whole Western Church. Some historians think 1 November was already kept in England and Ireland before Rome adopted it, which would place it beside Samhain, though this is not proven.\n\nIn medieval England the day was Hallowmas, “the mass of the hallows (saints)”, and its eve gave us Halloween. In Poland, France, Spain, the Philippines and much of Catholic Europe and Latin America, families visit cemeteries on 1 November, cleaning graves, laying chrysanthemums and lighting candles in coloured glass lanterns, so that graveyards glow through the night. In Mexico, 1 November begins Día de Muertos, with the day for children who have died.',
    knowAndDont: {
      known:
        'The dates of Gregory III’s chapel and Gregory IV’s extension of the feast, and the customs of visiting graves, are well documented.',
      unknown:
        'Why 1 November was chosen is uncertain. Theories that it was set to replace Samhain are possible but rest on thin evidence.',
    },
    celebrate: [
      'Visit and tend family graves, lay flowers and light a candle in a lantern.',
      'Read the life of a saint you admire, or tell the story of a holy, good person from your own life.',
      'Attend an All Saints’ service; many churches read the names of the year’s dead.',
      'Give thanks for the ordinary good people who shaped you, and write one of them a letter if they are living.',
      'Leave a candle on a neglected grave.',
    ],
    ritual: {
      title: 'Candles for the company of saints',
      outline: [
        'At dusk, set out a candle in a glass holder for each saint or holy person you want to honour.',
        'Light each and say the name aloud, with one thing they gave to the world.',
        'Light one more for all whose names no one remembers.',
        'Read Revelation 7:9–12, the great multitude, or sit in silence with them.',
        'If you can, visit a cemetery and light a candle on a neglected grave.',
        'Put out the indoor candles before you go to bed.',
      ],
    },
    correspondences: {
      herbs: ['Rosemary', 'Frankincense', 'Bay'],
      crystals: ['Clear Quartz', 'Amethyst'],
      colors: ['White', 'Gold'],
      foods: ['Bread', 'Seasonal fruit', 'Huesos de santo (Spain)', 'Panellets (Catalonia)'],
      symbols: ['Candles on graves', 'Halo', 'Chrysanthemums', 'Great multitude in white'],
    },
    respect:
      'All Saints’ Day is a Christian holy day, a day of obligation for Catholics and a public holiday in many countries. Cemeteries are crowded and very personal on this day: dress soberly, be quiet, and don’t photograph mourners. If you light a candle on a stranger’s grave, do it simply and leave it.',
    sources: [
      'Catholic Encyclopedia (1907), “All Saints’ Day”: https://www.newadvent.org/cathen/01315a.htm',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 36.',
      'Revelation 7:9–12.',
    ],
  },
  {
    ref: 'christian-all_souls',
    title: 'All Souls’ Day',
    aka: ['Commemoration of All the Faithful Departed', 'Zaduszki', 'Día de los Fieles Difuntos', 'Soulmas'],
    tradition: 'Christian',
    summary:
      'Prayers for all the faithful departed on 2 November. Graves are visited and tended, candles lit, and the beloved dead named and remembered.',
    honours:
      'All who have died: family, friends, strangers, and especially those with no one to pray for them. In Catholic teaching, the prayers of the living help the dead on their way to God.',
    history:
      'Around 998, Odilo, abbot of the great monastery of Cluny, ordered that all the monasteries under Cluny keep 2 November as a day of prayer for all the dead, the day after All Saints. The custom spread through the Western Church. In 1915 Pope Benedict XV allowed every priest to say three Masses on this day because of the dead of the First World War.\n\nFolk customs grew richly around it. In England children and the poor went “souling” on All Souls’ Eve, singing for soul cakes, small spiced buns, and promising prayers in return. Bells were tolled for the dead. In many Catholic lands people believed the souls returned home on this night: a fire was kept in, the table left laid, and water left for them. In Poland the evening of Zaduszki was associated with Dziady customs. Protestant churches abolished the feast at the Reformation, but many Anglican churches have restored it.',
    knowAndDont: {
      known:
        'The Cluny origin, the spread of the feast and the souling, bell and grave customs are well documented.',
      unknown:
        'Folk beliefs about returning souls vary enormously, and how far they predate the Christian feast is unclear.',
    },
    celebrate: [
      'Light a candle for your dead and say their names.',
      'Visit graves, tidy them and leave flowers or a candle.',
      'Attend a requiem or All Souls’ service where names of the dead are read.',
      'Bake soul cakes and give them away, or share food with the hungry in memory of the dead.',
      'If grief is raw, be gentle with yourself, and reach out to a friend or bereavement service.',
    ],
    ritual: { premade: 'hedge-ancestor-candle-evening' },
    correspondences: {
      herbs: ['Rosemary', 'Cypress', 'Yew'],
      crystals: ['Jet', 'Amethyst', 'Smoky Quartz'],
      colors: ['Black', 'Purple', 'White'],
      foods: ['Soul cakes', 'Bread', 'Pan de muerto', 'Beans and grain'],
      symbols: ['Candles', 'Graves', 'Tolling bells', 'Chrysanthemums', 'Soul cakes'],
    },
    respect:
      'All Souls’ is a Christian day of prayer for the dead, and for many families it is deeply personal. If you visit a cemetery, be quiet and respectful. Día de Muertos is its own living Mexican tradition with Indigenous and Catholic roots; learn from it and support Mexican communities, but don’t borrow its altars or face-paint as a costume.',
    sources: [
      'Catholic Encyclopedia (1907), “All Souls’ Day”: https://www.newadvent.org/cathen/01315b.htm',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 36–37.',
    ],
  },
  {
    ref: 'christian-advent',
    title: 'Advent Sunday',
    aka: ['First Sunday of Advent', 'Advent', 'Advent Wreath'],
    tradition: 'Christian',
    summary:
      'The Christian year begins in waiting for the light. The first candle of the Advent wreath is lit, and one more each Sunday until Christmas.',
    honours:
      'Christ who is coming: at Christmas, and at the end of time. Advent also honours those who waited for him: the prophets, John the Baptist, and Mary.',
    history:
      'Advent, from the Latin adventus, “coming”, has been kept as a season of preparation since about the fifth and sixth centuries; in Gaul it was once a fast of forty days from St Martin’s Day. Rome settled on four Sundays, and Advent Sunday, the fourth Sunday before Christmas, became the start of the Church’s year. The season has two moods: penitence, with purple vestments, and joyful expectation, with the pink candle of Gaudete Sunday.\n\nThe Advent wreath is newer than it looks. In 1839 Johann Hinrich Wichern, a Lutheran pastor running a home for poor boys in Hamburg, made a cartwheel with candles, a small one for each weekday and a large one for each Sunday, so the children could count the days to Christmas. Evergreens were added, the wheel shrank to four candles, and the custom spread across the world in the twentieth century. Advent calendars began in nineteenth-century Germany too. The great “O Antiphons” sung from 17 December, which gave us “O Come, O Come, Emmanuel”, are much older, going back to at least the eighth century.',
    knowAndDont: {
      known:
        'The season’s history, the start of the church year, Wichern’s wreath and the O Antiphons are well documented.',
      unknown:
        'The earliest forms of Advent varied by region and are only partly known. Claims that the Advent wreath is a pagan Yule wheel in disguise are not supported; its origin in 1839 is well recorded.',
    },
    celebrate: [
      'Make an Advent wreath of evergreens and four candles, and light the first at dusk.',
      'Start an Advent calendar, perhaps with a small act of kindness for each day.',
      'Slow down: keep a few minutes of quiet each evening in the run-up to Christmas.',
      'Give to a food bank or shelter each week of Advent.',
      'Sing or listen to “O Come, O Come, Emmanuel”.',
    ],
    ritual: {
      title: 'Lighting the first candle',
      outline: [
        'Make a wreath of evergreens with four candles (often three purple and one pink) on a fireproof plate, away from curtains.',
        'At dusk, turn off the lights and sit for a moment in the dark.',
        'Light the first candle, the candle of hope.',
        'Read Isaiah 9:2, “The people that walked in darkness have seen a great light.”',
        'Sit in the light and pray or reflect on what you are waiting for.',
        'Put out the candle before leaving the room; light it again each evening this week.',
      ],
    },
    correspondences: {
      herbs: ['Holly', 'Juniper', 'Cedar', 'Rosemary'],
      crystals: ['Amethyst', 'Clear Quartz', 'Rose Quartz'],
      colors: ['Purple', 'Pink', 'Green', 'Blue'],
      foods: ['Stollen', 'Gingerbread', 'Spiced biscuits', 'Clementines'],
      symbols: ['Advent wreath', 'Four candles', 'Star', 'Advent calendar'],
    },
    respect:
      'Advent is the start of the Christian year and a season of prayer. You are welcome to keep a wreath or calendar; if you do, honour its meaning as waiting for Christ, and know that many churches welcome visitors at Advent carol services.',
    sources: [
      'Catholic Encyclopedia (1907), “Advent”: https://www.newadvent.org/cathen/01165a.htm',
      'Church of England, The Church’s Year: https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year',
      'Isaiah 9:2 (King James Version).',
    ],
  },
  {
    ref: 'christian-st_lucy',
    title: 'St Lucy’s Day',
    aka: ['Santa Lucia', 'Luciadagen', 'Lucy', 'Lussinatta', 'Lucia'],
    tradition: 'Christian',
    summary:
      'Lucy, whose name means light, kept on 13 December, what was once the longest night: candles, crowns of light and saffron buns carry the light into midwinter.',
    honours:
      'St Lucy (Lucia) of Syracuse, a young Christian woman martyred in the persecution of Diocletian around 304, patron of the blind, of eyes and of light.',
    history:
      'Lucy’s feast is one of the oldest in the Roman calendar, and her name is in the Canon of the Mass. Her legend says she gave her dowry to the poor, was denounced by a disappointed suitor, and could not be moved even by a team of oxen when the authorities tried to drag her away. Later stories, and many paintings, show her with her eyes on a dish.\n\nUnder the old Julian calendar her day fell near the winter solstice, which is why John Donne, in 1633, called it “the year’s midnight, and it is the day’s, / Lucy’s, who scarce seven hours herself unmasks.” In Scandinavia, Lucy night was feared as the longest and most dangerous of the year, when the Lussi and other spirits were abroad.\n\nThe Swedish Lucia procession, girls in white with a crown of candles and a red sash, singing the Neapolitan song Santa Lucia, spread from western Swedish country houses in the eighteenth and nineteenth centuries and became a national custom after a Stockholm newspaper crowned a Lucia in 1927. Saffron buns (lussekatter) and gingersnaps are served at dawn. In parts of Italy, Lucy brings gifts to children.',
    knowAndDont: {
      known:
        'Lucy’s martyrdom and her early cult are well recorded; Donne’s poem and the modern Swedish customs are documented.',
      unknown:
        'The details of her life come from later legend. The Scandinavian Lussi folklore and the procession grew separately, and how they joined is not entirely clear.',
    },
    celebrate: [
      'Rise early and bring breakfast with saffron buns to someone, by candlelight.',
      'Watch or join a Lucia procession; many Swedish churches abroad hold one.',
      'Light candles in your windows in the darkest weeks.',
      'Give to a charity for blind or partially sighted people.',
      'Read Donne’s poem and sit with the long night for a while.',
    ],
    ritual: {
      title: 'Carrying the light',
      outline: [
        'Rise before dawn. Use a battery candle crown, or carry a single candle in a sturdy holder.',
        'Bring a tray of saffron buns, gingersnaps and coffee or juice to someone in the house.',
        'Sing or say a verse about light in darkness, such as John 1:5.',
        'Pray for those whose sight or hope is dim.',
        'Set the candle in a window as the day begins.',
      ],
    },
    correspondences: {
      herbs: ['Saffron', 'Cinnamon', 'Clove'],
      crystals: ['Clear Quartz', 'Citrine', 'Selenite'],
      colors: ['White', 'Red', 'Gold'],
      foods: ['Saffron buns (lussekatter)', 'Gingersnaps (pepparkakor)', 'Coffee or glögg', 'Cuccìa (Sicilian wheat pudding)'],
      symbols: ['Crown of candles', 'White dress', 'Red sash', 'Eyes on a dish', 'Palm of martyrdom'],
    },
    respect:
      'St Lucy is a Christian saint, and her feast is beloved in Sweden, Norway, Finland and Italy, especially Sicily. Join public celebrations as a guest. The Lucia procession is often a children’s church event, so ask before photographing.',
    sources: [
      'Catholic Encyclopedia (1910), “St. Lucy”: https://www.newadvent.org/cathen/09414a.htm',
      'John Donne, “A Nocturnal upon St Lucy’s Day, Being the Shortest Day” (1633).',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996).',
    ],
  },
  {
    ref: 'christian-christmas_eve',
    title: 'Christmas Eve',
    aka: ['Wigilia', 'Heiligabend', 'Holy Night', 'Nochebuena', 'Svyat Vechir', 'Badnji dan'],
    tradition: 'Christian',
    summary:
      'The holy night of waiting on 24 December, kept with candles, midnight services, and the old belief that animals speak at midnight.',
    honours:
      'The coming birth of Christ; Mary and Joseph seeking shelter in Bethlehem; and, in many homes, the dead and the stranger, who are given a place at the table.',
    history:
      'Christmas Eve is the vigil of the Nativity. The midnight Mass began in Rome by the fifth century at the church of Santa Maria Maggiore, and became the “Mass of the angels”, celebrated in the dark when Christ was believed to have been born.\n\nIn much of Central and Eastern Europe, Christmas Eve is the main family celebration. In Poland, the Wigilia supper begins when the first star appears: hay is placed under the white tablecloth, an empty place is set for an unexpected guest or the absent dead, and the opłatek wafer is broken and shared with wishes before the meatless meal. Ukrainians share Sviata Vecheria with twelve dishes; Serbs bring in the badnjak, an oak branch, and lay it on the fire. In Germany and Scandinavia, gifts are opened on the Eve.\n\nFolk belief across Europe held that at midnight animals kneel in their stalls and can speak, water turns to wine, and bees hum the Hundredth Psalm. Thomas Hardy’s poem “The Oxen” (1915) remembers the belief. “Silent Night” was first sung on Christmas Eve 1818 in Oberndorf, Austria.',
    knowAndDont: {
      known:
        'The vigil, the midnight Mass and the regional customs of the Christmas Eve supper are long established and well recorded.',
      unknown:
        'Folk beliefs about animals and midnight vary from place to place; their origins are obscure.',
    },
    celebrate: [
      'Set a candle in the window to welcome the holy family and any traveller.',
      'Share a supper with an empty place laid for the stranger or the absent.',
      'Break bread or a wafer together, offering each person a wish for the year.',
      'Attend Midnight Mass or a carol service.',
      'At midnight, step outside, look at the stars, and listen.',
    ],
    ritual: {
      title: 'A holy night vigil',
      outline: [
        'Put a little hay or straw under the tablecloth and a candle in the window at dusk.',
        'Wait for the first star before sitting down to eat.',
        'Break bread or a wafer and share it, each person offering a wish to the others.',
        'Leave one place empty for the stranger or the absent dead.',
        'Read Luke 2:1–20, then sing a carol.',
        'At midnight, step outside in quiet, then put out the candle before bed.',
      ],
    },
    correspondences: {
      herbs: ['Frankincense', 'Myrrh', 'Holly', 'Cinnamon'],
      crystals: ['Clear Quartz', 'Garnet', 'Citrine'],
      colors: ['Red', 'Gold', 'White'],
      foods: ['Wigilia dishes: barszcz, pierogi, carp', 'Kutia', 'Mince pies', 'Mulled wine or cider'],
      symbols: ['Candle in the window', 'First star', 'Hay under the cloth', 'Empty place', 'Manger'],
    },
    respect:
      'Christmas Eve is one of the holiest nights of the Christian year, and for many families the most important meal of the year. Visitors are welcome at most services; arrive early, as churches fill. If you are invited to a Wigilia or Holy Supper, follow your hosts’ customs: wait for the first star and accept the wafer graciously.',
    sources: [
      'Catholic Encyclopedia (1908), “Christmas”: https://www.newadvent.org/cathen/03724b.htm',
      'Luke 2:1–20.',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 1–10.',
    ],
  },
  {
    ref: 'christian-christmas',
    title: 'Christmas',
    aka: ['The Nativity', 'Noel', 'Yule', 'Christ’s Mass', 'Natale', 'Weihnachten'],
    tradition: 'Christian',
    summary:
      'The birth of Christ on 25 December, the light coming into the world at midwinter. The twelve days of Christmas run from today to Epiphany.',
    honours:
      'The birth of Jesus in Bethlehem; Mary and Joseph; the shepherds who came from the fields and the angels who sang to them; and the belief that God came to share human life.',
    history:
      'The earliest firm record of Christmas on 25 December is in the Chronography of 354, whose list of martyrs (written in 336) begins: “VIII kal. Ian. natus Christus in Betleem Iudeae”, “eight days before the Kalends of January, Christ was born in Bethlehem of Judaea.” The Eastern churches kept 6 January; most of them later accepted 25 December, though those using the Julian calendar now keep it on 7 January.\n\nWhy 25 December? One theory says the Church chose it to replace the Roman feast of the Unconquered Sun; another says it was calculated from a belief that Jesus was conceived on the same day as he died, 25 March, nine months earlier. Both views have serious defenders.\n\nOver the centuries Christmas gathered customs: the twelve days of feasting, carols, the crib popularised by St Francis in 1223, the Yule log, evergreens, mumming and misrule, the German Christmas tree, and Santa Claus, grown from St Nicholas and the English Father Christmas. Puritans banned it in England in the 1640s and 50s; the Victorians reinvented much of it, with Dickens’s A Christmas Carol (1843) at the centre.',
    knowAndDont: {
      known:
        'The date is attested in Rome by 336, and the history of the customs is well documented.',
      unknown:
        'The Gospels do not give a date for Jesus’s birth, and the original reason for 25 December is still debated.',
    },
    celebrate: [
      'Attend a Christmas service, or listen to carols from a cathedral.',
      'Share a feast with family or friends, and invite someone who would be alone.',
      'Give gifts, and give to those in need.',
      'Set up a crib or nativity scene, and add the Magi on Epiphany.',
      'Keep the twelve days: something small and festive each day until 6 January.',
    ],
    ritual: {
      title: 'Christmas morning',
      outline: [
        'Light a candle at breakfast, or by the crib or tree.',
        'Read Luke 2:1–20 or John 1:1–14.',
        'Give thanks for the light coming into the world, and for the people around you.',
        'Sing a carol together.',
        'Share gifts and food, and set something aside for someone in need.',
      ],
    },
    correspondences: {
      herbs: ['Frankincense', 'Myrrh', 'Holly', 'Cinnamon', 'Clove'],
      crystals: ['Garnet', 'Clear Quartz', 'Ruby'],
      colors: ['Red', 'Green', 'Gold', 'White'],
      foods: ['Christmas pudding', 'Roast dinner', 'Mince pies', 'Gingerbread', 'Panettone or stollen'],
      symbols: ['Star', 'Manger and crib', 'Evergreens', 'Candles', 'Angels'],
    },
    respect:
      'Christmas is one of the two greatest Christian feasts. Many people also keep it as a cultural holiday, and many witches keep Yule beside it. Respect its meaning for Christians, and be gentle with those for whom it is a hard time of year.',
    sources: [
      'Catholic Encyclopedia (1908), “Christmas”: https://www.newadvent.org/cathen/03724b.htm',
      'Chronography of 354, Depositio Martyrum: https://www.tertullian.org/fathers/chronography_of_354_12_depositions_martyrs.htm',
      'Thomas J. Talley, The Origins of the Liturgical Year (New York, 1986).',
      'Ronald Hutton, The Stations of the Sun (Oxford, 1996), ch. 1–10.',
    ],
  },
];
