// Wheel of the Year lore: the eight festivals, one lesson each, as an
// eclectic seasonal practice that draws honestly on their many roots (Gaelic,
// Anglo-Saxon and Norse, astronomical, folk and church custom), with a lesson
// on dates, names and keeping a festival. Each festival task carries its
// holiday key (holidays.ts, tradition 'wheel'); the southern Wheel reuses the
// module with its own keys (index.ts). Consistent with the festival pages in
// holy/data/holidays.ts. British spelling.

import type { CourseModule, CourseTask } from '../types';
import { deity, herb, holy, journey, page, ritual, seasonal, spread } from '../linkHelpers.ts';

const festivals: { slug: string; name: string; when: string }[] = [
  { slug: 'samhain', name: 'Samhain', when: 'the turn of October into November (late April into May in the south)' },
  { slug: 'yule', name: 'Yule', when: 'the winter solstice, around 21 December (21 June in the south)' },
  { slug: 'imbolc', name: 'Imbolc', when: 'the start of February (the start of August in the south)' },
  { slug: 'ostara', name: 'the spring equinox', when: 'around 20 March (22 September in the south)' },
  { slug: 'beltane', name: 'Beltane', when: 'May Eve and May Day (the turn of October into November in the south)' },
  { slug: 'litha', name: 'Midsummer', when: 'the summer solstice, around 21 June (21 December in the south)' },
  { slug: 'lammas', name: 'Lughnasadh', when: 'the start of August (the start of February in the south)' },
  { slug: 'mabon', name: 'the autumn equinox', when: 'around 22 September (20 March in the south)' },
];

const festivalTask = (f: (typeof festivals)[number]): CourseTask => ({
  title: `Keep ${f.name}`,
  kind: 'ritual',
  instructions: `1. A week or two before ${f.when}, read the lesson on ${f.name} (and "The turning year" if you haven't yet). The app's calendar shows this year's date, and the festival's own page has more.
2. Watch your land in the weeks before: what is the season doing where you live?
3. Plan how you will keep it: alone, with the coven, or both. Gather what you need, and change your seasonal altar.
4. On the day, keep it as the lesson describes, or in your coven's way.
5. Afterwards, write in the answer box what you did, what the land was doing, what you learned of the festival's history, and one thing you'd do differently next year.
6. If you could not keep it on the day, keep a simple version within a few days and say so in your answer.`,
  times: 1,
  response: 'text',
  checked_by: 'mentor',
  minutes: 90,
  holiday: `wheel/${f.slug}`,
  docs: [`wheel-lore-${f.slug}`, 'wheel-lore-the-turning-year'],
});

export default {
  id: 'wheel-lore',
  title: 'The festivals of the Wheel',
  docs: [
    {
      id: 'wheel-lore-the-turning-year',
      title: 'The turning year: dates, names and keeping a festival',
      summary: 'How the eight festivals are dated (fixed days and the sun’s own turning points), the many names each goes by, the southern and northern wheels, and how to keep a festival well as a beginner or a coven.',
      minutes: 16,
      links: [page('calendar'), page('moon'), page('green-season'), page('folk-calendar'), spread('year-ahead'), page('altar')],
      body: `## A year of eight festivals

This module gives one lesson to each of the eight festivals of the Wheel, in the order the year turns from Samhain, which many practitioners treat as the beginning. Each lesson tells you the festival's roots honestly, its old and folk customs, how modern practitioners keep it, and a way to keep it yourself. You will keep each festival as it comes, so this module takes a full year.

## How the dates work

The festivals are dated in two different ways.

### The sun's turning points

The solstices and equinoxes are astronomical events. They happen when the sun reaches a particular point in its yearly path across the sky, so their dates shift by a day or so from year to year:

- **winter solstice:** 20 to 23 December (northern hemisphere);
- **spring equinox:** 19 to 21 March;
- **summer solstice:** 20 to 22 June;
- **autumn equinox:** 21 to 24 September.

They even happen at a particular moment, which may fall in the night. Many practitioners keep the festival on the day, or the evening before, rather than at the exact minute.

### The cross-quarter days

Imbolc, Beltane, Lughnasadh and Samhain are usually kept on fixed days: 1 February, 1 May, 1 August and 1 November (with their eves, the evenings before, often the main celebration). These follow the old Gaelic calendar, whose festivals began at sunset on the evening before.

The true astronomical midpoints between the solstices and equinoxes fall a few days later: around 4 February, 5 May, 7 August and 7 November. Some practitioners prefer these. Others keep the festival when the land shows its signs: the first lambs, the hawthorn in flower, the first grain harvested, the first hard frost.

You don't have to calculate any of this. The app's calendar shows each year's dates, and each festival has its own page.

## The names

Every festival has several names. Here they are, so you will recognise them:

- **Samhain** (SOW-in): Hallowe'en, All Hallows, Calan Gaeaf (Welsh).
- **Yule:** the winter solstice, Midwinter, Alban Arthan (Druid).
- **Imbolc** (IM-bolk): Imbolg, St Brigid's Day, Lá Fhéile Bríde, Candlemas, Oimelc.
- **Ostara:** the spring equinox, Eostre, Alban Eilir.
- **Beltane:** Bealtaine, May Day, May Eve, Walpurgis Night (in German lands, 30 April), Calan Mai.
- **Litha:** the summer solstice, Midsummer, St John's Eve, Alban Hefin.
- **Lughnasadh** (LOO-na-sa): Lammas, Lúnasa, Garland Sunday, the first harvest.
- **Mabon:** the autumn equinox, Harvest Home, Alban Elfed.

The names Litha, Ostara and Mabon date from the 1970s, as the tradition module explained. In the app's calendar, the festivals carry their most common names.

> **Your coven:** Ask your mentor which names your coven uses. Some covens prefer the Gaelic names, some English folk names, some the 1970s names.

## The southern wheel

In the southern hemisphere, most practitioners turn the wheel by six months, as the tradition module explained. The Sanctuary keeps a southern Wheel calendar with the dates turned: Samhain at the end of April, Yule at the June solstice, Imbolc at the start of August, the spring equinox in September, Beltane at the end of October, Midsummer in December, Lughnasadh at the start of February, and the autumn equinox in March. Each lesson in this module notes the southern date. Where a festival's customs are tied to church holidays (Candlemas, Easter, St John's Eve, Christmas, All Saints), southern practitioners usually keep the customs with the season, not the church date.

## Keeping a festival as a beginner

Each festival lesson gives a way to keep the day. In general:

1. **Read ahead.** Read the lesson and the festival's page a week or two before.
2. **Watch your land.** What is the season doing where you are?
3. **Choose one thing** you can do: one custom done well is a full festival.
4. **Prepare.** Gather what you need. Change your seasonal altar.
5. **Keep the rite.** The complete seasonal rite from the ritual module, with the festival's custom at its heart, works for every festival.
6. **Share food,** with your coven, family or friends if you can.
7. **Write it up** in the app afterwards.

## Keeping a festival with a coven

Covens usually gather for most festivals. A coven festival follows the coven's rite at greater length, often outdoors, with a shared meal and roles for many members. Online gatherings in the app let members who live far apart keep the day together, each at their own altar.

## Honesty about what we know

Every festival lesson separates what is old from what is folk custom and what is modern. Some festivals, like Samhain and Beltane, are richly recorded; others, especially the equinoxes, have little traditional custom in Britain and Ireland, and modern practitioners have built most of what is done. That is fine. What matters is not pretending our inventions are ancient.

> **Safety:** Several festivals involve fire: bonfires, candles, burning wheels and logs. Never leave a flame unattended; check local rules on fires; in dry weather, use lanterns instead. Several involve drink: alcohol is never required. Several involve gathering plants: identify them, take little, and never eat what you can't identify.

> **Try this:** Before the next festival, use the app's year-ahead spread, or simply sit and write, to set out what you hope for from this full turn of the Wheel. Read it again at the same festival next year.

## What's old and what's modern

- **Old:** the Gaelic quarter days and their eves, the solstices and equinoxes, many of the names.
- **Modern:** keeping all eight as one cycle, the 1970s names, and the southern wheel.`,
    },
    {
      id: 'wheel-lore-samhain',
      title: 'Samhain',
      summary: 'The end of harvest and the beginning of winter, kept from the evening of 31 October: what the Irish sources say, the Hallowe’en folk customs of guising, lanterns, apples and divination, All Saints and All Souls, and keeping it as a festival of the dead.',
      minutes: 18,
      links: [holy('wheel/samhain'), holy('celtic/samhain_gaelic'), holy('christian/all_hallows_eve'), holy('christian/all_souls'), holy('slavic/dziady'), ritual('wicca-samhain-dumb-supper'), ritual('folk-apple-candle-halloween'), ritual('hedge-ancestor-candle-evening'), seasonal('turnip-lantern'), seasonal('apples'), spread('samhain'), page('ancestors')],
      body: `## When

Samhain (pronounced SOW-in) is kept from the evening of 31 October into 1 November in the northern hemisphere, and from 30 April into 1 May in the south. Many practitioners treat it as the beginning of the Wheel's year.

## The roots

### The Gaelic Samhain

Samhain is the best recorded of the Gaelic festivals. In early Irish literature, written down by monks from about the 8th century, it marks the end of the harvest and the beginning of winter. Kings held great assemblies and feasts at Samhain, such as the Feast of Tara. Many tales are set at Samhain because it was a time when the boundary between this world and the Otherworld opened: the sídhe, the fairy mounds, stood open, and their people walked abroad. Heroes met strange beings, and the dead were close.

Whether Samhain was the pre-Christian "Celtic new year" is often said and is plausible, but scholars disagree; the evidence is indirect. There was no god called Samhain, "lord of the dead"; that is an eighteenth-century mistake still repeated online.

### All Saints and All Souls

In the 8th and 9th centuries, the church in Rome came to keep All Saints' Day on 1 November, and in the late 10th century the monastery of Cluny began All Souls' Day on 2 November, praying for all the dead. Whether these dates were chosen to replace Samhain is debated: All Saints moved to 1 November in Rome, not Ireland. Either way, in Ireland and Britain the old festival and the Christian days of the dead came together, and the eve, All Hallows' Eve, became Hallowe'en.

### Hallowe'en folk customs

From the eighteenth to the twentieth century, Hallowe'en in Ireland, Scotland, Wales and northern England was rich in custom:

- **Guising:** children and young people went from house to house in disguise, performing for food or coins. This, and the English custom of souling (begging for soul cakes in return for prayers for the dead), are the roots of trick-or-treating.
- **Lanterns:** turnips or mangel-wurzels hollowed out and carved with faces, lit with a candle. Pumpkins replaced them in America.
- **Apples and nuts:** bobbing for apples in water, snapping at apples hung on strings, and roasting nuts in the fire.
- **Divination:** especially for love and marriage. Robert Burns's poem "Halloween" (1785) describes many of these customs in Scotland: pulling kale stalks, burning nuts in pairs, eating an apple before a mirror to see a future spouse.
- **The dead:** in many places, a place was set at the table or the fire left burning for the family's dead, and food left out.

## How modern practitioners keep it

For most modern pagans, Samhain is the great festival of the dead and of endings: the last harvest is in, the year is dying back, and it is time to remember those who have gone and to rest. Common modern customs include:

- a **silent supper** (often called a dumb supper), a meal eaten in silence with a place set for the dead;
- an **ancestor altar** with photographs, candles and the dead's favourite foods;
- **reading the names** of the dead aloud;
- **divination** for the year ahead;
- **letting go** of what the year has ended, often by writing it on paper and burning it;
- **carving lanterns** to guide the dead and keep away the unwelcome;
- **Hallowe'en fun:** costumes, apples and sweets, for and with children.

## Keeping it as a beginner

1. **Prepare your altar:** a dark cloth, autumn leaves, apples, photographs or names of your dead, a candle, a glass of water.
2. **Carve a lantern** from a turnip, swede or pumpkin, and set it at your door or window.
3. **Keep the seasonal rite,** with this at its heart:
4. Light a candle for the dead. Say the names you know, and "all those whose names I do not know".
5. Tell them something of your year. Leave a little of their favourite food or drink.
6. Sit in silence for a few minutes.
7. Write on a slip of paper something the year has ended for you. Burn it safely in a fireproof dish, or tear it and bury it.
8. **Eat a meal,** with a place set for the dead if you like, in silence for a while or in remembrance.
9. **Afterwards,** dispose of the offerings kindly, and ground well. Ancestor work can stir grief.

## With the coven

Many covens hold a silent supper, read the names of members' dead, and do divination for the coming year. Some hold a public Hallowe'en gathering for families as well as the coven's own rite. Online, members light candles at their own altars and read names in turn.

## In the southern hemisphere

Southern Samhain falls at the end of April, in autumn, when leaves are turning and nights lengthening, which suits it well. Hallowe'en itself, at the end of October, falls in southern spring; many southern practitioners enjoy it as a secular holiday and keep their Samhain in April or May.

> **Safety:** Ancestor work can bring up grief. Ground well afterwards, and talk to your mentor if it stays heavy. Never leave candles or lanterns burning unattended. Divination is for reflection, not for frightening yourself or others about death.

> **Your coven:** Ask your mentor how your coven keeps Samhain, and whether you may bring a name to be read.

## What's old and what's modern

- **Old:** the Gaelic Samhain as the start of winter and a time when the Otherworld opened; All Saints and All Souls; Hallowe'en guising, lanterns, apples and divination.
- **Modern:** Samhain as the pagan new year and festival of the dead in this form, the silent supper, and the ancestor altar as a modern pagan practice.`,
    },
    {
      id: 'wheel-lore-yule',
      title: 'Yule',
      summary: 'The winter solstice and the longest night: Bede’s Modraniht and the Norse jól, Newgrange, the Roman Saturnalia and Sol Invictus, the Yule log, evergreens and wassail, and keeping the return of the light.',
      minutes: 18,
      links: [holy('wheel/yule'), holy('norse/jol'), holy('roman/saturnalia'), holy('roman/sol_invictus'), holy('slavic/koliada'), holy('christian/christmas'), ritual('wicca-yule-log-sun-vigil'), ritual('folk-jol-rune-casting'), seasonal('yule-log'), seasonal('evergreen-boughs'), seasonal('holly-and-ivy'), herb('holly'), spread('yule'), journey('deity-sol')],
      body: `## When

Yule is kept at the winter solstice, around 21 December in the northern hemisphere and 21 June in the south: the longest night and shortest day, after which the light begins to return.

## The roots

### The solstice itself

At the winter solstice the sun rises and sets at its furthest point south (in the north), and for a few days seems to stand still before turning back. ("Solstice" means "sun stands still".) This has been noticed for a very long time. At Newgrange in Ireland, built around 3200 BCE, the rising sun shines down a long passage into the inner chamber for a few minutes on the mornings around the winter solstice. At Maeshowe in Orkney the setting sun does the same. We do not know what their builders believed; we know they cared.

### Anglo-Saxon and Norse Yule

The English monk Bede, writing in 725, says the pagan English year began on 25 December with a night they called Modraniht, "mothers' night". He doesn't say what was done. The months around midwinter were called Giuli. The Norse jól was a midwinter feast; the sagas describe feasting, drinking toasts and sacrifice. One saga says that King Hákon the Good of Norway, in the 10th century, moved the jól feast to coincide with Christmas. Yule became the old English word for the Christmas season, and still is in parts of Britain and Scandinavia.

### Roman midwinter

In Rome, the Saturnalia (from 17 December) was a festival of feasting, gift-giving, candles and turning the world upside down. In the 4th century, 25 December is recorded as the birthday of Sol Invictus, the Unconquered Sun, and as Christmas. Which came first, and whether one was meant to replace the other, is debated.

### Folk customs

Many customs gathered around midwinter and Christmas in Britain and Europe:

- **The Yule log:** a large log brought in and burned on the hearth over the Christmas season, recorded in England from the 17th century. A piece was sometimes kept to light next year's.
- **Evergreens:** holly, ivy, bay, rosemary and mistletoe decorated houses and churches in medieval England. Christmas trees came from Germany and spread in Britain in the 19th century.
- **Wassailing:** going from house to house with a bowl of spiced ale, singing for luck, and in apple-growing areas, wassailing the orchard trees to bless next year's crop, usually on Twelfth Night.
- **Mumming:** folk plays performed by disguised players at Christmas.
- **The twelve days:** feasting from Christmas to Twelfth Night.

## How modern practitioners keep it

For modern pagans, Yule celebrates the return of the light: the darkest night, and the promise that the sun will come back. Common customs:

- **Keeping vigil** through the longest night, with candles, and watching the sunrise;
- **lighting a Yule log** or a large candle, often decorated with evergreens;
- **decorating with evergreens** as a sign of life that endures;
- **feasting and gifts;**
- **wassailing** apple trees or friends;
- **reflecting** on the year past and hopes for the next.

## Keeping it as a beginner

1. **Decorate your altar** with evergreens, a red or gold candle, oranges or apples, and a log or a thick candle for the sun.
2. **On the eve of the solstice,** put out every light in the house at dusk, or as late as you can, and sit in the dark for a few minutes. Notice the longest night.
3. **Light one candle** and say: "In the longest night, the light returns."
4. **Keep the seasonal rite,** with this at its heart: from the one candle, light others, one by one, naming a hope for the coming year with each.
5. **Stay up a while,** or set an alarm, and watch the sunrise the next morning if you can. Greet it.
6. **Feast** with friends or family, and give something away to someone in need.

## Food and family

Midwinter food is rich and warming: roast meats or a nut roast, root vegetables, spiced cakes, mince pies, oranges, nuts, mulled wine or spiced apple juice. With children, making paper snowflakes or orange-and-clove pomanders, telling stories by candlelight, and getting up early for the sunrise are lovely ways to keep Yule. Many families with mixed beliefs keep Yule on the solstice and Christmas a few days later, and enjoy both.

## With the coven

Covens often hold a long night vigil, with stories, songs, candlelight and food, ending at sunrise; or a Yule feast with a decorated log and gifts. Some go wassailing. Online, members light candles at the same moment across their homes.

## In the southern hemisphere

Southern Yule falls at the June solstice, in deep winter, which suits it. Christmas, though, falls at midsummer in the south. Many southern practitioners keep Yule in June with log, candles and evergreens, and enjoy Christmas as a summer holiday or a Midsummer festival.

> **Safety:** Holly berries, mistletoe and ivy are poisonous to people and pets; keep them out of reach. Dried evergreens catch fire very easily; keep them well away from candles and fires, and take them down before they dry out. Never leave a Yule log or candle burning unattended.

> **Your coven:** Ask your mentor how your coven keeps Yule, whether it holds a vigil, and what it does when Yule falls close to Christmas for members with family obligations.

## What's old and what's modern

- **Old:** watching the solstice, Bede's Modraniht and Giuli, the Norse jól, the Roman Saturnalia, the Yule log, evergreens and wassailing.
- **Modern:** Yule as a pagan festival of the returning light in this form, and the solstice vigil to sunrise.`,
    },
    {
      id: 'wheel-lore-imbolc',
      title: 'Imbolc',
      summary: 'The first stirring of spring at the start of February: the uncertain name, Brigid as goddess and saint, rush crosses, the Brídeóg and Brigid’s bed, holy wells, Candlemas and weather lore, and keeping it as a festival of hearth, light and beginnings.',
      minutes: 18,
      links: [holy('wheel/imbolc'), holy('celtic/la_fheile_bride'), holy('christian/st_brigid'), holy('christian/candlemas'), ritual('folk-brigid-cross-well'), ritual('wicca-imbolc-brigids-bed'), ritual('folk-candlemas-candles'), seasonal('brigids-cross'), seasonal('brideog'), seasonal('snowdrops'), deity('brigid'), journey('deity-brigid'), deity('cailleach'), spread('imbolc')],
      body: `## When

Imbolc is kept from the evening of 31 January into 1 February in the northern hemisphere, and from 31 July into 1 August in the south. In Ireland it is St Brigid's Day, and since 2023 it has been a public holiday there.

## The roots

### The name

Imbolc (IM-bolk) is one of the four Gaelic quarter days, marking the start of spring. The meaning of its name is uncertain. A glossary compiled in Ireland around 900, called Cormac's Glossary, explains it as oimelc, "ewe's milk", the time when sheep came into milk before lambing. Modern scholars more often suggest i mbolc, "in the belly", perhaps also about pregnant ewes. Either way, it seems to have been a festival of the first signs of new life in the farming year.

### Brigid, goddess and saint

Cormac's Glossary also describes a goddess, Brigit, worshipped by poets, with two sisters of the same name, one of healing and one of smithcraft; all three were daughters of the Dagda. St Brigid of Kildare, said to have died around 525, was one of Ireland's patron saints, with a feast on 1 February. At Kildare, the 12th-century writer Gerald of Wales reported a fire kept burning by nuns, which no man might approach. How much of the saint's story borrowed from a goddess is unknowable and much debated; modern practitioners honour Brigid in both forms, or either. The Sanctuary has a page and a dedication journey for Brigid.

### Folk customs

St Brigid's Day customs were kept in Ireland and Scotland into living memory:

- **Brigid's crosses:** woven from rushes or straw, often with four arms around a square centre, hung above doors and in byres for protection through the year. The old one was burned or kept when the new was made.
- **The Brídeóg:** a doll made from straw or a churn dash, dressed and carried from house to house by girls (and in some places young men called Biddy Boys) who were welcomed and given food or coins.
- **Brigid's bed:** in the Hebrides, a sheaf of oats was dressed as Brigid and laid in a basket called her bed, with a wand beside it. In the morning people looked in the ashes of the fire for her footprint as a sign of a good year. A traveller, Martin Martin, recorded this around 1703.
- **The brat Bríde:** a cloth or ribbon left outside on the eve for Brigid to bless as she passed; kept for healing through the year.
- **Holy wells:** visited on her day, especially the many wells named for her.

### Candlemas and weather lore

The next day, 2 February, is Candlemas, the church's feast of the Presentation, when candles for the year were blessed. It was also a day for weather lore: an English rhyme says "If Candlemas be fair and bright, winter will have another flight". In Scotland, the hag of winter, the Cailleach, was said to gather firewood on that day; if the day was fine, she gathered plenty for a long winter. America's Groundhog Day comes from the same family of lore.

## How modern practitioners keep it

Imbolc is a festival of the first light of spring: cleaning out winter, kindling new beginnings, honouring Brigid as patron of poetry, healing and smithcraft, and noticing the first snowdrops. Common customs:

- **weaving Brigid's crosses;**
- **lighting candles,** sometimes every candle in the house;
- **making a bed for Brigid** and inviting her in;
- **leaving out a cloth** for her blessing;
- **spring cleaning** the house and altar;
- **writing poetry** or starting a creative project;
- **dedications,** since it's a festival of beginnings.

## Keeping it as a beginner

1. **Clean your altar** and house: sweep out the winter.
2. **Gather** rushes, straw or paper strips, a white candle, a bowl of milk or water, and a ribbon or cloth.
3. **Weave a Brigid's cross.** There are many guides; the simplest uses folded strips, each one wrapped around the last, until you have four arms.
4. **On the eve, keep the seasonal rite,** with this at its heart:
5. Light the white candle and say: "Brigid, if it please you, be welcome in this house." Or if you honour no god: "Welcome, first light of spring."
6. Hold up your cross and bless it, then hang it above your door.
7. Hang the cloth outside overnight for blessing, and bring it in in the morning.
8. Light every candle you can safely watch, one by one, naming something you want to begin this year.
9. **Look for the first signs of spring** on your land in the days around Imbolc.

## With the coven

Many covens make Brigid's crosses together, bless candles for the year, hold dedications of new members, and share dairy foods such as butter, cheese and pancakes. Some visit a holy well.

## In the southern hemisphere

Southern Imbolc falls on 1 August, in late winter, when wattle begins to bloom in Australia and lambs are born. St Brigid's Day and Candlemas fall in summer there; southern practitioners usually keep the customs at their own Imbolc.

> **Safety:** Lighting every candle is lovely and dangerous. Use stable holders on heat-proof surfaces, keep them away from curtains and children, and never leave them unattended. If you visit a well, take care at the water's edge, and don't leave coins, ribbons or plastic there; they harm the water and the trees.

> **Your coven:** Ask your mentor how your coven keeps Imbolc, and whether it honours Brigid, and in which form.

## What's old and what's modern

- **Old:** Imbolc as the Gaelic start of spring, Brigid as saint (and probably goddess), rush crosses, the Brídeóg, Brigid's bed, the brat Bríde, Candlemas candles and weather lore.
- **Modern:** Imbolc as a pagan festival of Brigid in this form, and its use for dedications.`,
    },
    {
      id: 'wheel-lore-ostara',
      title: 'The spring equinox',
      summary: 'The spring equinox, when day and night stand equal: Bede’s single line on Eostre, how eggs and hares came to Easter, the thin folk record and what modern practitioners have built, and keeping it with seeds and balance.',
      minutes: 16,
      links: [holy('wheel/ostara'), holy('christian/lady_day'), holy('christian/easter'), holy('slavic/marzanna'), ritual('wicca-ostara-seed-and-egg'), ritual('green-seed-blessing-before-sowing'), seasonal('ostara-eggs'), seasonal('blossom-branch'), seasonal('red-eggs'), deity('eostre'), spread('ostara')],
      body: `## When

The spring equinox falls around 20 March in the northern hemisphere and around 22 September in the south. On that day, night and day are nearly equal all over the world, and from then on the days grow longer than the nights.

## The roots

### The equinox

"Equinox" means "equal night". At the equinoxes the sun rises due east and sets due west. Some ancient monuments may be aligned to the equinoxes, though the evidence is weaker than for the solstices.

### Bede's Eostre

The English monk Bede, writing in 725, listed the old English months. He says that Eosturmonath, the month around the spring equinox, "was once called after a goddess of theirs named Eostre, in whose honour feasts were celebrated in that month". That sentence is all we know about Eostre from ancient sources. The English word Easter comes from her name, or at least from the same root, which is related to the words for "east" and "dawn".

In 1835 the German scholar Jacob Grimm suggested that a German goddess Ostara must have existed alongside Bede's Eostre, and imagined her as a goddess of spring and dawn. There is no other evidence for Ostara. Aidan Kelly took Grimm's name for the equinox in the 1970s.

### Eggs and hares

Eggs and hares are everywhere in modern equinox and Easter customs. Their histories:

- **Eggs:** in medieval Europe eggs were forbidden during Lent, the forty days before Easter, so Easter was when people ate them again. Decorated and dyed eggs are recorded from the Middle Ages in many parts of Europe; red eggs are still central to Orthodox Easter. Egg-rolling and "pace-egging" (from Pasch, Easter) were English folk customs.
- **The Easter hare:** first recorded in Germany in 1682, bringing eggs to children. It came to America with German immigrants and became the Easter bunny.
- **Eostre and the hare:** many modern books say the hare was Eostre's sacred animal. There is no ancient evidence for this; it was suggested in the 19th and 20th centuries.

### The thin folk record

In Britain and Ireland there was little traditional folk custom at the equinox itself: spring customs gathered around Easter, Lady Day (25 March, a quarter day for rents and the old new year in England until 1752) and May Day. Elsewhere in Europe, the Slavic custom of drowning Marzanna, a straw figure of winter, was kept in spring, often at the equinox in modern times.

## How modern practitioners keep it

Most of what modern pagans do at the spring equinox is modern, and none the worse for that. Common customs:

- **balance:** marking the moment of equal day and night, often with a light and a dark candle;
- **seeds:** blessing and sowing seeds for the year's garden and the year's goals;
- **eggs:** decorating eggs, eating them, hunting for them with children;
- **greening:** bringing in spring flowers and budding branches;
- **spring cleaning;**
- **honouring** spring deities, including Eostre in her modern form, for those drawn to her.

## Keeping it as a beginner

1. **Decorate your altar** with spring flowers, budding twigs, eggs (real, blown or wooden), and two candles, one white and one black or dark.
2. **Gather** a few seeds and a pot of compost.
3. **Keep the seasonal rite,** with this at its heart:
4. Light the dark candle and say: "Night, you have held us through the winter." Light the white candle: "Day, now you grow." Sit for a moment between them, noticing balance in your own life.
5. Hold the seeds and name one thing you want to grow this year for each seed.
6. Plant them, water them, and set the pot in a sunny window.
7. Decorate an egg with a symbol of what you hope for, and keep it on your altar or eat it.
8. **Tend your seeds** through the spring, and notice how your intentions grow alongside them.

## Food and family

Eggs are the obvious food: boiled, painted, rolled down a hill, or baked into breads and cakes. Spring greens, the first shoots of wild garlic (identified with care, since it looks like poisonous lily of the valley), sprouted seeds, honey and fresh cheese all suit the season. With children, egg painting, planting cress in an eggshell, and a walk to find the first lambs, catkins or blossom are good ways to keep the day. If an egg hunt clashes with a family's Easter, hold it on another day; nobody minds two egg hunts.

## With the coven

Covens often bless seeds together, decorate eggs, hold egg hunts for members' children, and walk outside to see the spring. Some make a straw figure of winter and send it away, after the Slavic custom.

## In the southern hemisphere

The southern spring equinox falls around 22 September, when spring flowers are opening. Easter falls in southern autumn; southern practitioners usually keep eggs and seeds at their own September equinox.

> **Safety:** If you blow eggs for decorating, wash them well and wash your hands; raw egg can carry salmonella. Wash your hands after handling seeds, some of which are treated with chemicals. Keep candles stable and attended.

> **Your coven:** Ask your mentor what your coven calls this festival, and how it keeps it.

## What's old and what's modern

- **Old:** the equinox itself, Bede's one line on Eostre, Easter eggs from the Middle Ages, the Easter hare from 1682, Lady Day, the Slavic Marzanna.
- **Modern:** Ostara as a name (Grimm's form, chosen by Kelly in the 1970s), the hare as Eostre's animal, and most equinox rites.`,
    },
    {
      id: 'wheel-lore-beltane',
      title: 'Beltane',
      summary: 'The beginning of summer on May Eve and May Day: the Gaelic Bealtaine fires and cattle, May dew, hawthorn and the May bush, maypoles, May queens, Jack-in-the-Green and the hobby horse, and keeping it as a festival of fire, flowers and life.',
      minutes: 18,
      links: [holy('wheel/beltane'), holy('celtic/bealtaine'), holy('roman/floralia'), ritual('folk-bealtaine-dew'), ritual('green-hawthorn-may-blossom-blessing'), ritual('wicca-beltane-flower-crown'), seasonal('flower-crown'), seasonal('may-bush'), seasonal('floralia-flowers'), herb('hawthorn'), herb('rowan'), spread('beltane')],
      body: `## When

Beltane is kept from the evening of 30 April into 1 May in the northern hemisphere, and from 31 October into 1 November in the south.

## The roots

### The Gaelic Bealtaine

Bealtaine (in modern Irish, the name of the month of May) is one of the four Gaelic quarter days, marking the beginning of summer. Cormac's Glossary, compiled around 900, says that on this day two fires were lit with incantations, and cattle were driven between them to protect them from disease before they went out to summer pasture. The name has often been explained as "bright fire" or "fire of Bel", from a supposed god Belenus, but its meaning is uncertain.

Beltane fires were recorded in the Scottish Highlands into the 18th and 19th centuries. The traveller Thomas Pennant described in 1769 how people in some places cooked a custard and an oatcake on the fire, and threw pieces of the cake over their shoulders as offerings to protect their animals from foxes and eagles. In Ireland, May Eve was a dangerous time when the fairies were active and butter or milk might be stolen by magic. People hung rowan or primroses at the door, and were careful not to give fire or milk away.

### May Day in England and beyond

May Day customs were widespread across Britain and Europe:

- **Bringing in the May:** young people went out on May Eve or at dawn to gather flowering branches, especially hawthorn (called "may"), to decorate houses and the village.
- **May dew:** washing your face in the dew on May morning was said to bring beauty.
- **The maypole:** a tall pole, recorded in England from the 14th century, set up on the village green, decorated with greenery and danced around. The ribbon dance familiar today was popularised in the 19th century.
- **The May queen:** a girl crowned with flowers, a custom popular in Victorian times.
- **Jack-in-the-Green:** a figure covered in a frame of leaves, carried in May Day processions by chimney sweeps from the 18th century; revived in many towns today.
- **Hobby horses:** at Padstow in Cornwall, the 'Obby 'Oss dances through the town on May Day, a custom recorded from the early 19th century.
- **The May bush:** in Ireland, a hawthorn or other small tree decorated with ribbons, flowers and eggshells.

In German lands, the night of 30 April is Walpurgis Night, when witches were said to gather. In Rome, the Floralia for the goddess of flowers ran from late April into May.

## How modern practitioners keep it

Beltane is a festival of the full flowering of spring: life, fertility, love, joy and fire. Common modern customs:

- **a Beltane fire,** jumped over (small and safe) or danced around;
- **gathering flowers** and making garlands and crowns;
- **maypole dancing;**
- **washing in May dew** at dawn;
- **honouring the fairy folk** with care;
- **celebrating love and life,** including handfastings, which are pagan weddings or commitments.

Some Wiccan traditions treat Beltane as the sacred marriage of the Goddess and God. In an eclectic coven that's one story among others, and Beltane is never an occasion for pressure about sex or partners.

## Keeping it as a beginner

1. **On May Eve,** hang a sprig of rowan or a few primroses over your door, after the Irish custom.
2. **Decorate your altar** with flowers, green branches and ribbons.
3. **Keep the seasonal rite,** with this at its heart:
4. Light a candle or small fire for Beltane and say: "Summer begins. Fire of life, burn bright."
5. Weave a ring or crown of flowers and greenery, naming what makes you feel alive.
6. If you have a safe, small fire (or a candle in a lantern), step past it or over it, saying what you want to bring into the summer.
7. **At dawn on May Day,** go out and wash your face in the dew, if you can. Bring in a flowering branch, and greet the summer.

## Food and family

Beltane food is fresh and festive: oatcakes or bannocks after the Scottish custom, dairy, honey, the first green herbs, and anything you can eat outdoors. With children, gathering flowers for crowns, dancing round a simple maypole (a broom handle with ribbons will do), and getting up early for the dew are joyful ways to keep the day.

## With the coven

Covens often keep Beltane outdoors with a fire, a maypole or ribbon dance, flower crowns, and a feast. Some go out at dawn for May dew, or join a local May Day celebration.

## In the southern hemisphere

Southern Beltane falls on 31 October and 1 November, in late spring, when much is in flower. Hallowe'en falls on the same night in the calendar, which can be confusing; southern practitioners usually keep Beltane then, and Samhain in April.

> **Safety:** Jumping over fire is optional and must be done only over a very small fire, with loose clothing and hair secured, no alcohol beforehand, and someone watching with water ready. A candle in a lantern is a good substitute. Check fire rules before lighting any fire outdoors. Some say hawthorn blossom brings bad luck indoors; whether you keep that belief or not, some people are sensitive to its scent. Never pick protected flowers.

> **Your coven:** Ask your mentor how your coven keeps Beltane, and what it does about fire and dancing.

## What's old and what's modern

- **Old:** the Gaelic Bealtaine fires and cattle, May Eve protection and fairy lore, bringing in the May, May dew, maypoles, the May bush, Walpurgis Night, the Floralia.
- **Modern:** the ribbon maypole dance (Victorian), May queens (largely Victorian), and Beltane as a pagan festival of fertility and the sacred marriage.`,
    },
    {
      id: 'wheel-lore-litha',
      title: 'Midsummer',
      summary: 'The summer solstice, the longest day: Stonehenge and the solstice sun, St John’s Eve fires and burning wheels, gathering midsummer herbs, love divination, Kupala Night and the Scandinavian midsummer pole, and keeping the height of the light.',
      minutes: 17,
      links: [holy('wheel/litha'), holy('christian/st_john'), holy('slavic/kupala'), holy('norse/midsummer'), ritual('wicca-litha-noon-herb-gathering'), ritual('green-harvesting-herbs-with-thanks'), ritual('green-flower-essence-sun-method'), seasonal('sun-wheel'), seasonal('midsummer-birch'), seasonal('kupala-wreath'), herb('st_johns_wort'), herb('yarrow'), spread('litha'), journey('deity-sol')],
      body: `## When

Midsummer is kept at the summer solstice, around 21 June in the northern hemisphere and 21 December in the south: the longest day and shortest night. In much of Europe the traditional celebration was on St John's Eve, 23 June.

## The roots

### The solstice

At the summer solstice the sun rises and sets at its furthest north (in the northern hemisphere), climbs highest at noon, and gives the longest day. After it, the days begin to shorten. Stonehenge's main axis is aligned to the midsummer sunrise and the midwinter sunset. Crowds have gathered there at midsummer since at least the 19th century; we do not know what its builders did.

Bede's names for the months around midsummer were Ærra Liþa and Æfterra Liþa, "before Litha" and "after Litha". We know the name, not the festival.

### St John's Eve

In Christian Europe, midsummer was kept on St John's Eve, 23 June, the eve of the birth of John the Baptist. It was one of the most widespread festivals in Europe, from Ireland to Russia:

- **Bonfires** were lit on hills and in villages, and people danced around them, leapt through them, and drove cattle past them for protection.
- **Burning wheels** were rolled down hills in parts of Germany and France, sometimes said to show the sun turning.
- **Herbs** gathered on St John's Eve were thought especially powerful: St John's wort above all, hung over doors against evil, and also yarrow, vervain, mugwort and others.
- **Divination,** especially for love: young women looked for a future husband in dreams, or in water, on midsummer night.
- **Fairies** were active on midsummer night, as Shakespeare's A Midsummer Night's Dream reflects.

In Slavic lands, Kupala Night, on the same night, was kept with fires, flower wreaths floated on rivers, and a search for the magical fern flower. In Scandinavia, midsummer is still a great festival with a decorated pole (in Sweden, the midsommarstång), dancing and feasting.

### The Oak King and Holly King

Many modern pagans tell a story at midsummer and midwinter of an Oak King and a Holly King who fight for the year. This is a modern story, drawing on Robert Graves's The White Goddess (1948) and popularised by Wiccan writers in the 1980s. It is a good story, not an old one.

## How modern practitioners keep it

Midsummer celebrates the sun at its height: abundance, strength, joy, and, as the days begin to shorten, the first turn towards the dark. Common customs:

- **watching the sunrise or sunset** on the longest day;
- **midsummer fires** and candles at dusk;
- **gathering herbs** at their peak, to dry for the year;
- **making sun water**, water left in the sun;
- **flower wreaths,** floated on water or hung on the door;
- **spending the long evening outdoors** with food and friends.

## Keeping it as a beginner

1. **Decorate your altar** with summer flowers, a sun wheel (a circle of twigs or straw with spokes), golden candles and a bowl of water.
2. **At sunrise or sunset,** go outside and watch the sun. Greet it: "Sun at your height, I see you."
3. **Gather a few herbs** you can identify, such as St John's wort, yarrow, lavender or mint, with thanks, and hang them to dry.
4. **Keep the seasonal rite** at dusk, with this at its heart:
5. Light a candle or a small, safe fire and say: "The longest day. The light is full."
6. Name what has grown and flowered in your life since spring.
7. Then say: "From now, the light turns towards the dark," and name something you want to carry gently into the second half of the year.
8. **Share food outdoors** if you can: strawberries, honey, bread, something grilled.

## Food and family

Midsummer food is light and outdoor: strawberries and cream, salads, fresh bread, honey, elderflower cordial, anything grilled. With children, staying up late to see how long the light lasts, making a sun wheel from sticks and string, and floating flower boats on a pond (natural materials only, and retrieved afterwards) are good ways to keep the day. Many families simply eat outside on the longest evening and watch the sun go down together, which is a full festival in itself.

## With the coven

Covens often gather outdoors for midsummer: a sunrise vigil, an evening fire, a picnic, herb gathering. Some float flower wreaths on water, after the Kupala custom, using only natural materials.

## In the southern hemisphere

Southern Midsummer falls at the December solstice, close to Christmas. Many southern practitioners keep it with a beach day, a barbecue, a fire at dusk and the long light, and blend it with Christmas celebrations with family.

> **Safety:** St John's wort can make skin sensitive to sunlight and interacts with many medicines, including antidepressants and the contraceptive pill. Don't take it internally without advice from a doctor or pharmacist. Mugwort is unsafe in pregnancy. Wear sun protection at sunrise and sunset vigils that run long, and drink water. Fires: check the rules, especially in dry summers, when lanterns are safer.

> **Your coven:** Ask your mentor how your coven keeps Midsummer, and whether it watches the sunrise or the sunset.

## What's old and what's modern

- **Old:** the solstice and monuments aligned to it, Bede's Litha months, St John's Eve fires, burning wheels, midsummer herbs and divination, Kupala Night, the Scandinavian midsummer.
- **Modern:** Litha as a festival name (1970s), the Oak King and Holly King story, and sun water.`,
    },
    {
      id: 'wheel-lore-lammas',
      title: 'Lughnasadh and Lammas',
      summary: 'The first harvest at the start of August: Lugh and Tailtiu, Máire MacNeill’s record of Lughnasa hilltop gatherings and bilberries, the Anglo-Saxon loaf mass, and keeping it with bread, thanks and the fruits of work.',
      minutes: 17,
      links: [holy('wheel/lammas'), holy('celtic/lughnasadh'), holy('christian/lammas'), ritual('wicca-lammas-bread-offering'), ritual('kitchen-prosperity-bread'), seasonal('lammas-loaf'), seasonal('wheat-sheaf'), seasonal('corn-dolly'), seasonal('bilberries'), deity('lugh'), journey('deity-lugh'), spread('lammas')],
      body: `## When

Lughnasadh, also called Lammas, is kept from the evening of 31 July into 1 August in the northern hemisphere, and from 31 January into 1 February in the south.

## The roots

### The Gaelic Lughnasadh

Lughnasadh (LOO-na-sa; Lúnasa in modern Irish, the name of the month of August) is one of the four Gaelic quarter days, marking the beginning of the harvest. Medieval Irish texts say it was founded by the god Lugh, a god of many skills, in memory of his foster-mother Tailtiu, who died after clearing the plains of Ireland for farming. The Óenach Tailten, a great assembly with games, horse races, trading and marriages, was held at Teltown in County Meath at this time.

### Máire MacNeill's Lughnasa

In 1962 the Irish folklorist Máire MacNeill published The Festival of Lughnasa, a study of how the festival survived in folk custom across Ireland. She found nearly two hundred places where people gathered at the start of August, usually on the last Sunday of July or the first of August, often called Garland Sunday, Bilberry Sunday or Height Sunday:

- **climbing hills** and mountains together;
- **picking bilberries** (also called fraughans or whortleberries), the first wild fruit, and eating or bringing them home;
- **visiting holy wells** and lakes;
- **dancing, music, courting** and sometimes faction fights;
- **the first new potatoes** dug and eaten.

The pilgrimage up Croagh Patrick on the last Sunday of July, and Puck Fair at Killorglin, where a wild goat is crowned king, are among the customs she linked to Lughnasa.

### The Anglo-Saxon Lammas

In England, 1 August was Hlafmæsse, "loaf mass", recorded from the 10th century. Bread baked from the first ripe grain was blessed in church. One Old English charm instructs that the blessed Lammas loaf be broken into four and the pieces put in the four corners of the barn to protect the stored grain. Lammas was also a quarter day for rents in Scotland.

### Harvest customs

Across Britain and Ireland, the end of the grain harvest (often later, in late August or September) had many customs: cutting the last sheaf, sometimes by throwing sickles at it so no one person "killed" it; plaiting it into a corn dolly or "kern baby" to keep through the winter; and a harvest supper for the workers. These belong to the harvest season as a whole, shared between Lammas and the autumn equinox.

## How modern practitioners keep it

Lughnasadh is a festival of the first harvest: gratitude for what has ripened, the fruits of work, and the first turn towards autumn. Common customs:

- **baking bread** from new grain, blessing it and sharing it;
- **giving the first piece** as an offering;
- **honouring Lugh** as a god of skill, for those drawn to him;
- **games and contests,** after the Óenach Tailten;
- **climbing a hill** and picking wild fruit;
- **making corn dollies** or wheat weavings;
- **giving thanks** for the work of the year, your own and others'.

## Keeping it as a beginner

1. **Bake or buy a loaf,** ideally one you have made with your own hands. Even a simple soda bread counts.
2. **Decorate your altar** with ears of wheat or other grain, early fruit such as blackberries or bilberries, and a golden candle.
3. **Keep the seasonal rite,** with this at its heart:
4. Hold up the loaf and say: "First bread of the harvest, gift of the land, the sun, the rain and many hands."
5. Name what you have harvested this year so far: the fruits of your work, learning, relationships.
6. Break off the first piece and give it as an offering. Break the rest and share it.
7. Name the people whose work feeds you: farmers, bakers, drivers, shop workers. Thank them.
8. **If you can, climb a hill** or walk somewhere with a view, and pick a few wild berries you can identify.

## Food and family

This is the festival of bread above all, so bake if you can: soda bread needs no yeast and takes under an hour. Shape the dough into a sheaf, a sun, a person or a simple plait. Early fruit, especially blackberries, bilberries and the first apples, and new potatoes with butter, suit the day. With children, baking together, making a simple corn dolly from a handful of wheat or long grass, and going blackberrying (with care about what they pick) all keep the festival. Games and races, after Lugh's games, are a good excuse to be outside.

Lugh himself is called Samildánach, "skilled in all the arts", in Irish legend. Some practitioners use Lughnasadh to show or celebrate a skill they have worked on this year: a craft, a song, a piece of writing. That fits the festival well.

## With the coven

Covens often bake bread together, hold a harvest feast, play games, or climb a hill. Many also give to a food bank, sharing the harvest with those in need.

## In the southern hemisphere

Southern Lughnasadh falls on 1 February, in late summer, at the height of many grain and fruit harvests. It suits the season well.

> **Safety:** Never eat wild berries you can't identify with certainty: some, such as deadly nightshade and yew, are poisonous. Hill walks need good shoes, water and an eye on the weather. Have gluten-free bread for those who need it.

> **Your coven:** Ask your mentor how your coven keeps Lughnasadh, and whether it calls it Lammas, Lughnasadh or another name.

## What's old and what's modern

- **Old:** the Gaelic Lughnasadh, Lugh and Tailtiu, the Óenach Tailten, the folk Lughnasa gatherings and bilberries, the Anglo-Saxon loaf mass, harvest customs and corn dollies.
- **Modern:** Lughnasadh as a pagan festival of the first harvest in this form, and corn dollies as altar decorations.`,
    },
    {
      id: 'wheel-lore-mabon',
      title: 'The autumn equinox',
      summary: 'The autumn equinox, when day and night stand equal again: the name Mabon and why it was chosen, Harvest Home, the last sheaf, the church harvest festival, Michaelmas and the harvest moon, and keeping it with gratitude, balance and letting go.',
      minutes: 16,
      links: [holy('wheel/mabon'), holy('christian/michaelmas'), holy('norse/haustblot'), holy('moon-full'), ritual('wicca-mabon-thanks-and-balance'), ritual('folk-gratitude-ritual'), ritual('green-putting-the-garden-to-bed'), ritual('kitchen-seasonal-simmer-pot'), seasonal('apples'), seasonal('gourds'), seasonal('michaelmas-daisies'), seasonal('autumn-leaves'), spread('mabon')],
      body: `## When

The autumn equinox falls around 22 September in the northern hemisphere and around 20 March in the south. Day and night are nearly equal; from then on, the nights grow longer than the days.

## The roots

### The name Mabon

In the 1970s Aidan Kelly named the autumn equinox Mabon, after Mabon ap Modron, "Mabon son of Modron", a figure in the medieval Welsh tale Culhwch and Olwen, where he is a prisoner who must be rescued. Kelly later explained he chose the name because he liked its sound and wanted a Celtic-sounding name; there is no old connection between Mabon and the equinox. Some modern writers have linked Mabon's imprisonment to the waning year. That is a modern reading. Many practitioners prefer to call this festival Harvest Home, the autumn equinox, or Alban Elfed (the Druid name, from Iolo Morganwg).

### Harvest Home

In Britain and Ireland, there was no traditional folk festival at the equinox itself. But the weeks around it were the end of the grain harvest, and that had many customs:

- **The last sheaf:** the last of the grain to be cut was often treated specially: cut by all the reapers together, decorated, plaited into a figure called the corn dolly, the kern baby, the maiden or the hag, and kept until spring.
- **Crying the neck:** in Devon and Cornwall the reapers held up the last handful of wheat and cried out, a custom revived in some places today.
- **The harvest supper:** the farmer gave a feast for everyone who had worked the harvest, with drinking and songs.
- **Gleaning:** the poor were allowed to gather what was left in the fields.

### The church harvest festival

In 1843 the Reverend Robert Hawker of Morwenstow in Cornwall invited his parishioners to a service of thanksgiving for the harvest, with bread made from the new corn. The idea spread quickly, and the harvest festival, with churches decorated with produce later given to the poor, became one of the best-loved festivals in Britain. It is a Victorian creation, not a pagan survival.

### Michaelmas and the harvest moon

Michaelmas, 29 September, the feast of St Michael, was a quarter day for rents and the end of the farming year. Goose was eaten, and folklore said you must not pick blackberries after Michaelmas, because the devil had spat on them. The full moon nearest the autumn equinox is the harvest moon, which rises at almost the same time for several nights, giving light for harvesting late into the evening. The name is recorded in English from the early 18th century.

## How modern practitioners keep it

Because there is so little traditional equinox custom, this is the festival where modern practitioners have built the most. Common customs:

- **giving thanks** for the whole harvest of the year;
- **balance:** marking equal day and night, often with a light and a dark candle;
- **letting go:** releasing what you don't want to carry into the dark half of the year;
- **sharing:** giving to food banks, feeding others;
- **apples and the garden:** making cider, apple dishes, putting the garden to bed;
- **honouring the harvest's gods** for those drawn to them, such as Demeter and Persephone.

## Keeping it as a beginner

1. **Decorate your altar** with apples, gourds, the last flowers of the garden, autumn leaves, and two candles, one light and one dark.
2. **Keep the seasonal rite,** with this at its heart:
3. Light both candles: "Day and night, equal again."
4. Name, one by one, everything you are grateful for from this year's harvest: in your life, your work, your relationships, the land. Say thank you after each.
5. Then name something you want to let go of as the nights lengthen. Write it on a leaf, and later put it on the compost or bury it.
6. Share an apple: cut it across to show the five-pointed star of seeds inside, eat half, and give half as an offering.
7. **In the days around the equinox,** give food or time to someone in need, or to a food bank.

## Food and family

The autumn equinox is a time for apples, pears, plums, blackberries (before Michaelmas, if you keep the old saying), squash, nuts and the last of the garden: crumbles, pies, soups and cider or apple juice. With children, apple picking, pressing apples for juice, making a leaf crown and collecting conkers are good ways to keep the day. Taking a box of food together to a food bank teaches the heart of the festival: that a harvest is meant to be shared.

## With the coven

Covens often hold a harvest feast, give to a food bank, put a garden to bed together, or go apple picking. Some make a corn dolly from the last sheaf of a local farm, with permission.

## In the southern hemisphere

The southern autumn equinox falls around 20 March. Easter is also in southern autumn; some practitioners there blend harvest thanks and Easter's themes.

> **Safety:** If you make cider or wine, follow safe methods; homemade alcohol can be dangerous if made badly. Wash windfall apples well. Gather leaves and fruit only where allowed.

> **Your coven:** Ask your mentor what your coven calls this festival, and how it keeps the harvest.

## What's old and what's modern

- **Old:** the equinox, harvest customs such as the last sheaf, crying the neck and the harvest supper, Michaelmas, the harvest moon.
- **Modern:** the name Mabon (1970s), the church harvest festival (1843), and most equinox rites, including balance and letting go.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wheel-lore',
      title: 'The festivals of the Wheel: test',
      intro: 'Twelve questions on how the festivals are dated and named, and on each festival’s roots, customs and safe modern keeping. You need 80% to pass. Your mentor will score the written answers.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'Why do the dates of the solstices and equinoxes shift by a day or so from year to year?',
          options: [
            'Because covens choose them',
            'Because they are astronomical events, set by the sun’s position, not by the calendar',
            'Because they follow the moon',
            'They never shift',
          ],
          correct: [1],
          points: 1,
          explanation: 'The solstices and equinoxes happen when the sun reaches particular points in its yearly path, so their calendar dates vary slightly. The app’s calendar works them out.',
        },
        {
          id: 'q2',
          type: 'truefalse',
          prompt: 'There was an ancient Celtic god called Samhain, lord of the dead.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. This is an eighteenth-century mistake. Samhain is the name of the festival, and of the month of November in Irish.',
        },
        {
          id: 'q3',
          type: 'multi',
          prompt: 'Which were traditional Hallowe’en folk customs in Ireland and Britain? Choose all that apply.',
          options: ['Guising from house to house', 'Carved turnip lanterns', 'Apple bobbing and love divination', 'Dancing round the maypole'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Guising, turnip lanterns, apples and divination belong to Hallowe’en. The maypole belongs to May Day.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'What did Bede say about Modraniht?',
          options: [
            'It was a night of Norse sacrifice',
            'It was "mothers’ night", at midwinter, when the pagan English year began',
            'It was the night of the spring equinox',
            'It was a festival of Brigid',
          ],
          correct: [1],
          points: 1,
          explanation: 'Bede says the pagan English year began at midwinter with Modraniht, "mothers’ night". He doesn’t say what was done.',
        },
        {
          id: 'q5',
          type: 'multi',
          prompt: 'Which customs belong to Imbolc and St Brigid’s Day? Choose all that apply.',
          options: ['Weaving rush crosses to hang over the door', 'Carrying the Brídeóg from house to house', 'Leaving a cloth outside for Brigid’s blessing', 'Floating flower wreaths on the river'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Brigid’s crosses, the Brídeóg and the brat Bríde are Imbolc customs. Floating wreaths belongs to Kupala Night at midsummer.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'What is the evidence that the hare was the sacred animal of the goddess Eostre?',
          options: [
            'Bede says so',
            'There is no ancient evidence; the link was suggested in the 19th and 20th centuries',
            'Roman inscriptions',
            'The Irish law texts',
          ],
          correct: [1],
          points: 1,
          explanation: 'Bede says only that a month was named for Eostre. The Easter hare is first recorded in Germany in 1682, and its link to Eostre is modern.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'According to Cormac’s Glossary, what was done with cattle at Bealtaine?',
          options: ['They were sacrificed', 'They were driven between two fires for protection', 'They were decorated with ribbons', 'They were kept indoors'],
          correct: [1],
          points: 1,
          explanation: 'Cattle were driven between two fires to protect them from disease before they went out to summer pasture.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'Before taking St John’s wort gathered at midsummer, what must you know?',
          options: [
            'Nothing; it is completely safe',
            'It can make skin sensitive to sunlight and interacts with many medicines, including antidepressants and the pill, so don’t take it internally without a doctor’s or pharmacist’s advice',
            'It must be gathered at midnight',
            'It is only safe in tea',
          ],
          correct: [1],
          points: 1,
          explanation: 'St John’s wort is a powerful herb with real drug interactions. Hanging it over the door is safe; taking it needs medical advice.',
        },
        {
          id: 'q9',
          type: 'multi',
          prompt: 'Which customs belong to Lughnasadh and Lammas? Choose all that apply.',
          options: ['Climbing hills and picking bilberries', 'Blessing bread from the first grain', 'The Óenach Tailten with games and races', 'Washing your face in May dew'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Hilltop gatherings, bilberries, the loaf mass and Lugh’s games for Tailtiu belong to the first harvest. May dew belongs to Beltane.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'Where does the name Mabon for the autumn equinox come from?',
          options: [
            'An ancient Welsh festival of the equinox',
            'Aidan Kelly’s choice in the 1970s, after Mabon ap Modron of Welsh legend, with no old link to the equinox',
            'Bede',
            'Cormac’s Glossary',
          ],
          correct: [1],
          points: 1,
          explanation: 'Kelly chose the name because he liked its sound. Many practitioners prefer Harvest Home or simply the autumn equinox.',
        },
        {
          id: 'q11',
          type: 'short',
          prompt: 'Choose one festival you kept this year. What did you do, what was your land doing at the time, and which parts of what you did were old, folk custom or modern?',
          points: 3,
          explanation: 'Each festival lesson separates the old, the folk and the modern, and asks you to keep the festival with your own land in mind.',
          rubric: 'Full marks: describes a real observance with the festival’s custom (1 point); describes what their land was doing at the time with at least one specific sign (1 point); correctly sorts at least two elements of their observance into old, folk or modern, consistent with the lesson (1 point).',
        },
        {
          id: 'q12',
          type: 'short',
          prompt: 'How would a practitioner in the southern hemisphere keep Yule and Midsummer, given that Christmas falls in their summer?',
          points: 2,
          explanation: 'Most southern practitioners turn the Wheel by six months: Yule at the June solstice, Midsummer in December, often blended with Christmas as a summer holiday.',
          rubric: 'Full marks: places southern Yule at the June solstice and Midsummer at the December solstice (1 point); describes a reasonable way of handling Christmas’s seasonal mismatch, such as keeping Yule customs in June and enjoying Christmas as a summer festival (1 point).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'The festivals of the Wheel',
      intro: 'The Wheel turns through eight festivals: the dead and the dark, the returning light, the first spring, balance and seed, fire and flowers, the height of the sun, the first harvest, and thanks. Here you keep each festival as it comes, reading its lesson ahead of time, watching your land, and writing up what you did. A full turn takes a year; your mentor will help you plan.',
      passed_by: 'mentor',
      tasks: [
        ...festivals.map(festivalTask),
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Read "The turning year" and the lessons for any festivals you haven't kept yet.
2. Take the test. You can take it before the year is out; the choice questions are scored at once and your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed, talk to your mentor, and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wheel-lore-the-turning-year'],
          quiz: 'quiz-wheel-lore',
        },
      ],
    },
  ],
} satisfies CourseModule;
