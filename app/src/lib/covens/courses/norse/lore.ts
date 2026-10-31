// Norse lore: the Heathen year. The old Icelandic calendar of summer and
// winter, its months and weeks (the app's Old Icelandic calendar pages),
// Snorri's three great blóts, Bede's Old English months, counting by nights,
// and the modern Heathen calendars; then one lesson for each of the seven
// holy days in holidays.ts (tradition 'norse'): Þorrablót, Dísablót,
// Sigrblót, Midsummer, Haustblót, Winter Nights and Yule, each with what
// the sources say and how far to trust them, the folk customs, the living
// (often Christian) customs of the Nordic countries, and a rite for a coven
// and for one person. Midsummer, the autumn blót and Yule also give the Wheel
// of the Year's lesson on the same season for its wider history. Modern
// practice marked as modern. British spelling.

import type { CourseModule, CourseTask } from '../types';
import { closed, deity, herb, holy, journey, page, ritual, seasonal, spread } from '../linkHelpers.ts';

const festivals: { slug: string; wheel?: string; name: string; rite: string; spread: string; things: string[] }[] = [
  { slug: 'thorrablot', name: 'Þorrablót', rite: 'folk-simple-blot', spread: 'one-rune', things: ['drinking-horn'] },
  { slug: 'disablot', name: 'Dísablót', rite: 'hedge-ancestor-candle-evening', spread: 'three-runes', things: ['hlautbolli', 'drinking-horn'] },
  { slug: 'sigrblot', name: 'Sigrblót', rite: 'folk-simple-blot', spread: 'five-rune-cross', things: ['drinking-horn'] },
  { slug: 'midsummer', wheel: 'litha', name: 'Midsummer', rite: 'hedge-hearing-the-land-walk', spread: 'litha', things: ['midsummer-birch', 'sun-wheel'] },
  { slug: 'haustblot', wheel: 'mabon', name: 'Haustblót', rite: 'folk-gratitude-ritual', spread: 'mabon', things: ['odins-sheaf'] },
  { slug: 'vetrnaetur', name: 'Winter Nights', rite: 'hedge-house-spirit-offering', spread: 'nine-worlds', things: ['hlautbolli', 'drinking-horn'] },
  { slug: 'jol', wheel: 'yule', name: 'Yule', rite: 'folk-jol-rune-casting', spread: 'yule', things: ['yule-goat', 'yule-log', 'evergreen-boughs'] },
];

const festivalTask = (f: (typeof festivals)[number]): CourseTask => ({
  title: `Keep ${f.name}`,
  kind: 'ritual',
  instructions: `1. A week or two before, read the lesson on ${f.name}${f.wheel ? ', and the Wheel of the Year lesson on the same season for its wider history' : ''}. The app's calendar shows the date, and the holy day's page has more.
2. Plan how you will keep it: with the coven, alone, or both. Change your altar for the season, and prepare the feast's food and drink.
3. On the day, keep a blót in the lesson's way or your coven's, with at least one recorded custom of the season.
4. Afterwards, write in the answer box what you did, which customs you kept and where they come from, which parts are old and which modern, and one thing you'd do differently next year.
5. If you could not keep it on the day, keep a simple version within a few days and say so.`,
  times: 1,
  response: 'text',
  checked_by: 'mentor',
  minutes: 90,
  holiday: `norse/${f.slug}`,
  docs: [`norse-lore-${f.slug}`, ...(f.wheel ? [`wheel-lore-${f.wheel}`] : [])],
  links: [ritual(f.rite), spread(f.spread), ...f.things.map(seasonal)],
  solitary: `Keep ${f.name} alone with the solitary rite in the lesson: hallow your space, call the powers of the feast, bless and pour the cup, keep at least one of the season’s customs, and give the gift to the earth. If you can, share the food with family, friends or neighbours afterwards, as hospitality asks.`,
});

export default {
  id: 'norse-lore',
  title: 'The Heathen year',
  docs: [
    {
      id: 'norse-lore-the-heathen-year',
      title: 'The Heathen year: summer, winter and the great blóts',
      summary: 'How the old Icelandic year was counted (two seasons, weeks and named months, with a leap week), Snorri’s three great blóts, Bede’s Old English months, counting by nights, and how modern Heathen calendars, including this app’s, were put together.',
      minutes: 16,
      links: [page('calendar'), holy('icelandic-ylir'), holy('icelandic-morsugur'), holy('icelandic-konudagur'), holy('icelandic-einmanudur'), holy('icelandic-skerpla'), holy('icelandic-sumarauki'), holy('icelandic-haustmanudur'), spread('year-ahead')],
      body: `## Two seasons

The heathen Norse did not divide the year into four seasons, as we usually do, but into two: **summer** and **winter.** Each was called a **misseri,** a half-year. Icelanders even counted a person's age in winters. Summer was the time of farming, travel, trade and assemblies; winter the time of indoor work, feasting, storytelling and survival.

The best-preserved form of this reckoning is the **old Icelandic calendar,** still printed in Icelandic almanacs. It counts the year in **weeks** rather than months: 52 weeks, or 364 days, with summer beginning on a Thursday in April and winter on a Saturday in October. Every few years a **sumarauki,** "summer addition", a leap week, was added in midsummer to keep the calendar in step with the sun. The system was reformed by the Althing in the tenth century, and we know it best from medieval Icelandic texts.

The months, too, have names, recorded in Snorri's Edda and later almanacs, though the lists differ a little:

- **Winter:** Gormánuður (slaughter month), Ýlir, Mörsugur (fat-sucking month), Þorri, Góa and Einmánuður.
- **Summer:** Harpa or Gaukmánuður (cuckoo month), Skerpla, Sólmánuður (sun month), Heyannir (haymaking), Tvímánuður and Haustmánuður (autumn month).

The app's Old Icelandic calendar shows these months and their days, with a page for each. Some, such as Konudagur, the first day of Góa, are still kept in Iceland today.

## Counting by nights

Tacitus wrote in the first century that the Germans counted not days but nights, and that for them "night leads the day". English keeps a trace in "fortnight", fourteen nights. The names of feasts such as **Winter Nights** and **Mōdraniht,** "mothers' night", suggest that feasts began at evening. Many Heathens begin holy days at sunset, though the evidence for any fixed rule is thin.

## Snorri's three great blóts

In **Ynglinga saga,** Snorri Sturluson says that Odin set the law for three great sacrifices:

- **at the beginning of winter, for a good year** (til árs);
- **at midwinter, for growth** (til gróðrar);
- **at the beginning of summer, for victory** (til sigrs).

This is our clearest statement of a heathen festival year, and Heathens build on it. But remember who is speaking: a thirteenth-century Christian historian, presenting Odin as a human king who made laws. The three feasts fit the farming year so well that they are probably real; Snorri's neat list may still be tidier than practice ever was.

## Bede's English months

The English monk **Bede,** in his work on reckoning time written in 725, gives the old English month names and a few notes on heathen customs:

- **Giuli,** two months around midwinter, from which "Yule" comes;
- **Mōdraniht,** "mothers' night", on the night that is now Christmas Eve;
- **Sōlmōnaþ,** the month of cakes offered to the gods, in February;
- **Hrēþmōnaþ** and **Ēosturmōnaþ,** named, Bede says, after goddesses Hreða and Ēostre;
- **Hāligmōnaþ,** "holy month", in September;
- **Blōtmōnaþ,** "sacrifice month", in November, when cattle were slaughtered for the gods.

Bede is a precious, early and nearly contemporary witness, writing only a century after the English conversion. He is also brief, and on Ēostre and Hreða he is our only source.

## Feasts in the sagas

The sagas mention many feasts: Yule, Winter Nights, the dísablót, the álfablót, autumn feasts and funeral ales. Their dates vary from saga to saga and place to place. The great sacrificial feasts seem to have been tied to the farming year: slaughter in autumn, the dark of midwinter, the start of the sailing season.

## Modern Heathen calendars

Every modern Heathen calendar is a **modern construction** from these pieces. Some groups keep only Snorri's three; some keep many more, adding feasts for particular gods or modern days of remembrance. Some keep the old Icelandic dates; some use the solstices and equinoxes; some follow the moon.

The app's **Norse and Heathen** calendar keeps seven, as many Heathen groups do:

1. **Þorrablót,** in late January, by the Icelandic calendar;
2. **Dísablót,** at the full moon of February;
3. **Sigrblót,** on the Icelandic first day of summer in April;
4. **Midsummer,** at the summer solstice;
5. **Haustblót,** at the autumn equinox, a modern feast;
6. **Winter Nights,** on the Icelandic first day of winter in October;
7. **Yule,** at the winter solstice, for twelve nights.

Each has its own lesson here. Some rest on good old evidence and some are modern; each lesson says which.

## The southern hemisphere

The old Heathen year was made in the far north, where winter is long and dark and midsummer barely has a night. If you live in the southern hemisphere, the feasts' dates by the calendar fall in the opposite season: Yule in December is high summer in Australia. Southern Heathens differ. Some keep the northern dates, honouring the tradition as it was received; many move the seasonal feasts by six months, so that Winter Nights falls at the start of their own winter in April and Yule at their own midwinter in June. Both are honest choices. What matters is to know why you have chosen as you have.

## The moon

Some Heathens follow the moon: the dísablót at the February full moon, as in the app, or Yule at the first full moon after the solstice. Bede says the English months followed the moon, and Snorri's Uppsala assembly was tied to it. The app's moon pages can help you follow it if you choose.

> **Your coven:** Ask your mentor which feasts your coven keeps, whether it begins them at sunset, and whether it uses the Icelandic dates, the solstices or the moon.

> **Try this:** Draw the Heathen year in your book as a circle, divided into summer and winter. Mark the seven feasts and the Icelandic months, and note which feasts rest on old evidence and which are modern.

## What's old and what's modern

- **Old:** summer and winter as the two halves of the year, the Icelandic week reckoning and months, counting by nights, Snorri's three blóts and Bede's months.
- **Modern:** every Heathen festival calendar now in use, including the app's seven feasts and the equinox Haustblót.`,
    },
    {
      id: 'norse-lore-thorrablot',
      title: 'Þorrablót: the midwinter month',
      summary: 'Þorri, the old Icelandic midwinter month, and its feast: the medieval story of King Þorri, the nineteenth-century revival and the traditional food of today, Bóndadagur and Konudagur, and a winter blót for endurance and good company.',
      minutes: 15,
      links: [holy('norse/thorrablot'), holy('icelandic-konudagur'), ritual('folk-simple-blot'), seasonal('drinking-horn'), deity('thor'), deity('skadi'), journey('deity-skadi')],
      body: `## The month of Þorri

**Þorri** is the fourth month of winter in the old Icelandic calendar. It begins on a Friday between 19 and 25 January, in the thirteenth week of winter, in the depths of the cold and dark. Its first day is **Bóndadagur,** "husband's" or "farmer's day". Þorri is followed by **Góa,** whose first day, **Konudagur,** is "wife's day".

## The story of King Þorri

A medieval Icelandic text, preserved with **Orkneyinga saga** and in a short tale called "How Norway was settled", makes Þorri a king who held a sacrifice every year at midwinter, called the **þorrablót.** His daughter **Gói** disappeared, and a sacrifice was held a month later to learn where she had gone, giving the month Góa its name. Her brothers searched for her, and their journeys explain how Norway came to be divided and settled.

How much of this is old? The story may be a learned tale made up to explain month names, as medieval writers loved to do. Þorri may have been a winter spirit, the personification of frost; some have suggested a by-name of Thor, but that is speculation. We do not know whether a real heathen feast called þorrablót was ever held.

## The revival

The feast as Icelanders keep it now is a **modern revival.** In the nineteenth century, with Iceland's national awakening, students and patriotic societies began holding Þorrablót feasts; one is often dated to 1873. Then in 1958 a Reykjavík restaurant, Naustið, began serving **þorramatur,** "Þorri food", in wooden troughs: smoked lamb (hangikjöt), dried fish (harðfiskur) with butter, rye bread, sour-cured meats and, for the brave, fermented shark (hákarl), washed down with brennivín. The feast spread to every village and to Icelanders abroad.

So Þorrablót today is a living Icelandic custom, kept by Icelanders of every belief, mostly as a celebration of national food, endurance and community. Ásatrúarfélagið and other Heathens also keep it as a holy feast.

## Living custom

Because Þorrablót is a national custom, respect for Icelanders matters. Don't present your Heathen blót as "the real Þorrablót" that Icelanders have forgotten: the custom belongs to them, and they keep it in their own way. Do enjoy learning about it, and if you can, try the food.

## What the feast is about

Whatever its history, Þorrablót makes sense in a Heathen year. It falls in the hardest part of winter, when stores are running low and the light is only beginning to return. Its themes are:

- **endurance:** honouring the strength that gets people through;
- **preserved food:** what was salted, smoked, dried and pickled in the autumn, now keeping people alive;
- **company:** gathering against the cold, with song and stories;
- **the household:** Bóndadagur, when the man of the house is honoured, and a month later Konudagur, for the woman. Modern Heathens often honour all members of a household, whatever their roles.

## Góa and Konudagur

A month after Þorri comes **Góa,** named after the lost daughter of the tale. Its first day, **Konudagur,** is now "women's day" in Iceland, when flowers are given to wives and mothers, much as Bóndadagur honours the men. The app's Old Icelandic calendar has a page for it. Some Heathens keep Þorrablót and Konudagur as a pair, the household honoured on both sides through the hardest weeks of the year.

## Winter in the gods' stories

Winter is everywhere in the myths. The world began in the meeting of fire and ice, in Snorri's telling; the giants of frost are the gods' oldest rivals; and before the end of the world comes the **Fimbulvetr,** the "great winter", three winters with no summer between. A feast in the depths of real winter is a good time to read these stories aloud, and to remember that the gods themselves are said to have struggled against the cold.

Gods often honoured at Þorrablót include **Thor,** protector of ordinary people, and **Skadi,** the winter giantess of the mountains. Some honour Þorri himself as a spirit of winter.

## A Þorrablót blót for the coven

1. **Prepare a winter table:** preserved foods, rye or dark bread, butter, cheese, pickles, smoked fish or meat (or vegetarian equivalents), and ale, mead or a hot non-alcoholic drink.
2. **Hallow the hall** with fire carried round, and declare frith.
3. **Call** Thor, Skadi and the spirit of winter: "Hail Skadi, lady of the snowshoes, whose cold teaches us patience. Hail Thor, who keeps us safe through the long nights."
4. **Bless the horn** and pass it round. Each person names one thing that has carried them through this winter.
5. **Pour** the gift, and give the first portion of the food to the gods and the land.
6. **Feast,** with songs, stories or a saga read aloud.
7. **Check on neighbours:** in the days after, take food or a visit to someone who struggles in the cold. This is the Heathen ethic of hospitality, lived.

## Alone

At home, set out a small winter meal: bread, butter, something smoked or pickled. Light a candle. Raise a cup to Thor and Skadi, and to yourself for getting this far through winter. Pour out a portion for the land. Eat slowly, and read a winter story, perhaps Skadi's coming to Asgard in Snorri.

> **Safety:** Fermented shark and sour-cured meats are acquired tastes, and not for everyone. Never pressure guests to try them, and label food for those with allergies or dietary needs.

> **Try this:** Find out how your own grandparents or great-grandparents got through winter: what they preserved, what they ate in the dark months. Cook one dish from that memory for your Þorrablót.

## What's old and what's modern

- **Old:** the month of Þorri in the Icelandic calendar, Bóndadagur and Konudagur, and the medieval tale of King Þorri.
- **Modern:** the feast as now kept, from the nineteenth-century revival and the 1958 þorramatur trough, and its use as a Heathen holy day.`,
    },
    {
      id: 'norse-lore-disablot',
      title: 'Dísablót: the guardian mothers',
      summary: 'The dísir and their blót in the sagas, the Uppsala assembly and the Disting market Snorri describes, why the date varies, the women of your line and chosen kin, and a blót for the dísir with the coven and alone.',
      minutes: 15,
      links: [holy('norse/disablot'), ritual('hedge-ancestor-candle-evening'), seasonal('hlautbolli'), deity('freyja'), deity('frigg'), journey('deity-freyja'), journey('deity-frigg'), page('ancestors')],
      body: `## The dísir

The **dísir** are female powers who watch over a family or a person. The devotion lessons introduced them: ancestral mothers, guardian spirits, fate-women or minor goddesses, depending on the source and the scholar. Freyja is called **Vanadís,** "the dís of the Vanir", which suggests a close link between the dísir and the goddesses of fertility and fate.

## The dísablót in the sagas

Several sagas mention a **dísablót,** a sacrifice to the dísir:

- In **Ynglinga saga,** the Swedish king **Aðils** rides his horse round the hall at Uppsala during the dísablót. The horse stumbles, he falls, strikes his head on a stone and dies.
- In **Egils saga,** a dísablót is held at a farm in western Norway, in autumn, with a great feast and heavy drinking; the young Egil, insulted, kills a man there.
- In **Víga-Glúms saga,** a feast for the dísir is held at **Winter Nights,** in mid-October.
- In **Hervarar saga,** a princess named Álfhildr reddens the hörgr at a dísablót at night, and is carried off by Starkaðr Áludrengr, grandfather of the more famous Starkaðr.

So in the sagas the dísablót falls at different times: autumn, Winter Nights, or unstated. It seems to have been a household or local feast, held when it suited, often led by women.

## Uppsala and the Disting

In his saga of **Olaf Haraldsson,** Snorri writes that in heathen Sweden the main blót was held at Uppsala in the month of **Gói,** in late winter, for peace and victory for the king, and that at the same time there was a great assembly and market, the **Disting,** "the thing of the dísir". After the conversion, Snorri says, the assembly and market went on, though the sacrifice was given up.

The **Disting market** is real: a fair called Distingen is still held in Uppsala in early February. Whether the original assembly was itself a dísablót, or a general sacrifice that took its name from the dísir, is debated.

## Why late winter

Many modern Heathens keep the Dísablót in late winter, often at the full moon of February, following the Uppsala Disting. Others keep a dísablót at Winter Nights, following Víga-Glúms saga. The app's calendar uses the February full moon. Both are reasonable; neither is the one true date.

Late winter has its own fitness. The household has come through the dark months; the women's work of spinning, weaving and care has kept it going; and the year's luck is about to turn towards spring.

## Honouring the women of your line

At the Dísablót many Heathens honour:

- **the dísir** as the guardian mothers of their family line;
- **the women of their own family:** mothers, grandmothers, great-grandmothers, by name;
- **women who mothered them,** related or not: teachers, neighbours, friends;
- **Freyja** as Vanadís and **Frigg** as mother of the gods and keeper of the household.

Families are complicated. If the women of your line hurt you, you may honour the dísir as protectors without naming any particular person, or honour chosen kin. If you don't know your family's history, the dísir know you. The devotion lessons said more.

## Spinning and the keys

Two objects often appear on a Dísablót altar. The **spindle** recalls the work that clothed every household, and the goddesses and Norns who were imagined as spinning or weaving fate; Frigg is linked with spinning in later folklore, and in Sweden the stars of Orion's belt were called Friggerock, "Frigg's distaff". The **keys** recall the mistress of a Viking-age house, who wore the keys to its stores at her belt as a sign of her charge; keys are found in many women's graves.

Men and people of every gender keep the Dísablót. Honouring the mothers is a matter for all their descendants. And the dísir of any family are honoured here, whatever its origins.

## A blót for the dísir with the coven

1. **At dusk,** set the altar with a candle, a bowl, a horn of mead, milk or juice, and photographs or names of the women members wish to honour. Add a spindle or a key, old symbols of women's work and the household.
2. **Hallow** the space, and declare frith.
3. **Call** the dísir: "Mothers of our lines, guardians of our kin, we hold blót for you tonight." Call Freyja Vanadís and Frigg if your coven honours them at this feast.
4. **Speak their names.** Each person may name a woman they honour, living or dead, and say a word of thanks.
5. **Bless the horn** and pass it round. Pour what is left into the bowl.
6. **Sprinkle** the altar and the people with the sprig, asking the dísir's protection on every household present.
7. **Pour** the bowl onto the earth.
8. **Feast,** with a dish from a grandmother's kitchen if anyone has one.

## Alone

Set a candle by the names or photos of the women of your family, or of women who shaped you. Pour a cup of mead, milk or juice, and say a few words to the dísir. Write a short letter of thanks to one woman, living or dead. Pour the cup onto the earth, and sit quietly a while.

> **Your coven:** Ask whether your coven keeps the Dísablót in late winter or at Winter Nights, and how it honours the women of members' lines.

> **Try this:** Find out the name of one woman in your family line further back than you knew before, or of a woman who shaped someone who shaped you. Speak her name at your Dísablót.

## What's old and what's modern

- **Old:** the dísir and the dísablót in the sagas, the Uppsala assembly and Disting market described by Snorri, and the Disting market still held today.
- **Modern:** the Dísablót as a fixed late-winter festival at the February full moon, and honouring chosen kin alongside the women of one's line.`,
    },
    {
      id: 'norse-lore-sigrblot',
      title: 'Sigrblót: summer’s start and the blót for victory',
      summary: 'Snorri’s summer blót “for victory”, the Icelandic first day of summer and its gifts, frost and other omens, Walpurgis and May bonfires as later Scandinavian customs, and a blót for the undertakings of the coming season.',
      minutes: 15,
      links: [holy('norse/sigrblot'), ritual('folk-simple-blot'), deity('odin'), deity('tyr'), journey('deity-odin'), journey('deity-tyr'), spread('five-rune-cross')],
      body: `## The third blót

Snorri's list of Odin's three great sacrifices in **Ynglinga saga** ends with one "at summer, for victory", **til sigrs.** That is the origin of the name **Sigrblót,** "victory blót", which many modern Heathens use for their feast at summer's start.

Why victory? For the people of the Viking age, summer was the season of action: the sea was open, ships went out to trade, to settle and to raid, assemblies met, quarrels were settled, and men went to war. A sacrifice for victory asked the gods to favour all of it: not only battles, but voyages, trade, lawsuits and the work of the farm.

## How far to trust it

Snorri is our only clear witness to a summer blót for victory, writing three centuries after the fact. Sagas speak of sacrifices before voyages and battles, and the start of summer was certainly a turning point. But we do not know how widely a sigrblót was kept, how, or exactly when. Some groups prefer to call their spring feast simply a summer blót, or **Summer Finding.**

## The first day of summer

In the old Icelandic calendar, summer begins on the **first Thursday after 18 April:** **Sumardagurinn fyrsti,** the first day of summer. It is still a public holiday in Iceland, with parades, scouts and children's events, even when the weather is anything but summery.

Icelanders have long given **summer gifts,** sumargjafir, on this day; the custom is older in Iceland than giving Christmas presents. A well-known belief holds that if summer and winter **"freeze together",** if there is frost on the night before, the summer will be good.

## Later Scandinavian customs

In Sweden and elsewhere, the turn to summer is kept on **Walpurgis Night,** 30 April, called Valborg, with bonfires, songs to spring and student celebrations. May Day follows. These are Christian-era customs, named after an English saint, Walburga, and they have their own long history. They show how strongly northern people mark the coming of light, but they are not heathen survivals, and Heathens who keep them should know that.

## Odin and the giving of victory

Why Odin for victory, rather than Thor or Tyr? In the poems and sagas Odin is the god who decides battles, who sends his valkyries to choose the slain, and who favours his heroes until he chooses to abandon them. In Völsunga saga he gives the hero Sigmund a sword, and later breaks it with his spear. That is a warning worth keeping: Odin's favour was never a guarantee, and those who asked for it knew it could be withdrawn. Many modern Heathens ask Tyr as well, for courage in a just cause, or Thor for protection on the journey.

## What the feast is about

A Sigrblót for today is a feast of **beginnings and courage:**

- naming the undertakings of the coming season, large or small: a new job, a journey, an exam, a garden, a hard conversation;
- asking the gods for success in them;
- giving thanks for the winter survived;
- getting ready: cleaning tools, mending gear, planning.

Gods often honoured are **Odin,** giver of victory; **Tyr,** god of courage and right; **Thor,** who protects; and **Freyr,** for good seasons.

"Victory" can trouble people today, with its echoes of war. Many Heathens read it as success in what you set out to do, and courage to face what is hard. It is also worth remembering that the old victories were often won by people who were very unkind to their neighbours. A modern blót for victory should never be a prayer for harm to others.

## A Sigrblót with the coven

1. **Outdoors if you can,** in the first warmth. Set the altar with a horn, a bowl, and something for each undertaking: a tool, a ticket, a seed packet, a pen.
2. **Hallow** the space and declare frith.
3. **Call** Odin, Tyr and the gods of the coven: "Odin, giver of victory, Tyr, who keeps faith, we ask your favour for what we begin this summer."
4. **Name your undertakings.** Each person names one thing they will attempt this summer, and holds the token for it.
5. **Bless the horn** and pass it round. As each person drinks, the others say: "May it go well."
6. **Pour** the gift, and sprinkle the tokens and the people from the bowl.
7. **Draw an omen,** if the coven wishes: one rune for the coven's summer, read together.
8. **Feast,** with pancakes, fresh bread or early greens. Give each other small summer gifts, as Icelanders do.

## Alone

On the first day of summer, or the nearest weekend, go outside if you can. Name one undertaking for the season and write it down. Raise a cup to Odin or Tyr, asking for courage and success in it, and pour the rest onto the earth. Give someone a small summer gift. Clean or mend one tool you'll need.

> **Note:** If you make a promise at Sigrblót, keep it small and real. "I will walk the coast path by Midsummer" is a good promise; "I will change my life" is not.

> **Try this:** Use the app's five-rune cross spread on the eve of summer, asking about the undertaking you named. Write the reading in your book, and look at it again at Midsummer.

## What's old and what's modern

- **Old:** Snorri's summer blót for victory, the Icelandic first day of summer and its gifts, the belief in summer and winter freezing together.
- **Modern:** the name Sigrblót for a fixed spring feast, reading victory as success and courage, and Walpurgis bonfires as a Christian-era custom.`,
    },
    {
      id: 'norse-lore-midsummer',
      title: 'Midsummer: the light at its height',
      summary: 'What the sources do and don’t say of a heathen midsummer, the Althing’s June assembly, the rich Christian-era customs of Jónsmessa, Midsommar and Sankthans, Baldr and Frazer, and a rite of gathering under the long light.',
      minutes: 15,
      links: [holy('norse/midsummer'), seasonal('midsummer-birch'), seasonal('sun-wheel'), ritual('hedge-hearing-the-land-walk'), deity('baldur'), deity('sunna'), journey('deity-baldur'), herb('birch')],
      body: `## A silent source

Here the honest answer starts with a gap: **there is no clear record of a heathen midsummer sacrifice in the Norse sources.** Snorri's three great blóts are at winter, midwinter and summer's start. No saga describes a midsummer blót. If heathen Scandinavians held one, the sources do not say so.

That does not mean midsummer was unimportant. In the far north the sun barely sets in June, and the light itself is overwhelming. Every northern people marks it.

## The assembly

What the sources do show is **gathering.** Iceland's **Althing,** the national assembly founded around 930, met at **Þingvellir** for two weeks in June. People came from every part of the island: chieftains and their followers, farmers, traders, families. Laws were recited and made, lawsuits fought, marriages arranged, goods traded, news shared and feuds both settled and started. It was in the Althing, in 999 or 1000, that Iceland chose to become Christian.

Many modern Heathens keep Midsummer as a feast of **community:** gathering, making decisions together, renewing bonds.

## Christian-era customs

The Nordic countries have some of the richest midsummer customs in Europe, mostly recorded from Christian times and kept around **St John's Eve,** 23 to 24 June:

- **Jónsmessa** in Iceland, when dew was said to heal and some rolled naked in it;
- **Midsommar** in Sweden, kept on the Friday between 19 and 25 June, with a leafy pole raised and danced around, flower wreaths, new potatoes, herring and strawberries; the pole probably came from Germany in later centuries;
- **Sankthans** in Norway and Denmark, with great bonfires; in Denmark a witch figure is burned on the fire, a custom that probably came from Germany and only became common in the twentieth century;
- **Juhannus** in Finland, with lakeside fires and birch boughs at the door;
- seven or nine kinds of flowers laid under the pillow to dream of a future love.

These are **living Christian and national customs.** They are kept by Scandinavians of every belief, and Heathens join in with pleasure. But they are not proof of a heathen festival, and should not be presented as pagan survivals with their Christian layers stripped away.

## Baldr and the light

Many modern Heathens link Midsummer with **Baldr,** the shining god whose death, they say, is the turning of the sun towards winter. This is a modern interpretation, owing much to James Frazer's The Golden Bough (1890 onwards), which linked Baldr with midsummer fires and the mistletoe. Frazer's theories are now doubted by scholars. The link can still be meaningful in practice, as long as it is named as modern.

## Sunna, the sun goddess

In the Norse myths the sun is female: **Sól** or **Sunna,** who drives the sun's chariot across the sky, pulled by the horses Árvakr and Alsviðr, chased by a wolf who will catch her at the end of the world. The Second Merseburg Charm, written down in tenth-century Germany, names **Sunna** among the goddesses who sing a healing charm. Much older, the Bronze Age **Trundholm sun chariot** from Denmark, a horse drawing a gilded disc, shows that the sun was carried across the sky in northern imagination more than a thousand years before the Viking age. Be careful with that last link: the Bronze Age people of Denmark were not Norse, and we cannot read their religion through the Eddas. But the picture of a sun drawn by horses is strikingly long-lived.

## What the feast is about

A Heathen Midsummer is a feast of:

- **the sun at its height,** honoured as **Sunna** or **Sól,** the sun goddess of the myths;
- **the green earth:** flowers, leaves, birch, the land in full growth;
- **community:** gathering, sharing food, settling things together;
- **the turn:** from here the light begins to wane, and the harvest is coming.

## A Midsummer rite with the coven

1. **Outdoors,** in the long evening. Bring birch boughs and wildflowers (common ones, a few of each), food to share, and a horn.
2. **Hallow** the space, perhaps with a fire, safely made.
3. **Call** Sunna, the landvættir, and the gods of the coven. Some groups call Baldr, as a modern custom.
4. **The horn** goes round, with each person naming something the year has brought to fullness.
5. **Make wreaths** of flowers together.
6. **Hold a thing:** a short meeting in which the coven speaks about its year, its plans and any matters to settle. The app's coven messages and petitions can carry the decisions afterwards.
7. **Pour** the gift onto the earth, and **feast** under the light.
8. **Stay up** for the short night if you can.

## Alone

Walk your land in the long evening, as the app's land walk describes. Pick a few common wildflowers and make a small wreath or posy. Raise a cup to the sun and pour it onto the earth. Eat outdoors. Lay seven flowers under your pillow, if you like, and write down what you dream.

> **Safety:** Fires in dry summer weather can spread fast. Check local rules, keep water to hand, and never leave a fire unattended. Pick only common flowers, and never protected species.

> **Try this:** Find out when the sun rises and sets where you live on Midsummer Day, and how long the night is. Watch the sunset, and if you can, the sunrise.

## What's old and what's modern

- **Old:** the Althing's June assembly, and the long tradition of northern people marking the light; the folk customs themselves are old, but Christian-era.
- **Modern:** Midsummer as a Heathen blót, the Baldr link drawn from Frazer, and the Danish witch on the fire.`,
    },
    {
      id: 'norse-lore-haustblot',
      title: 'Haustblót: thanks for the harvest',
      summary: 'Why Haustblót is a modern feast built on old thanksgiving, the toasts for a good year and peace, Bede’s holy month, the last sheaf left for Odin’s horse in later folklore, and a harvest blót to Freyr, Sif and the land.',
      minutes: 15,
      links: [holy('norse/haustblot'), seasonal('odins-sheaf'), ritual('folk-gratitude-ritual'), deity('freyr'), deity('sif'), journey('deity-freyr'), page('green-season'), page('folk-calendar')],
      body: `## A modern name for an old thanks

**Haustblót** means "autumn blót". Many modern Heathens keep it at the autumn equinox, in late September, as a harvest festival. Be clear from the start: **no heathen equinox festival is recorded.** The sagas speak of a sacrifice at the start of winter, in mid-October, "for a good year", and of feasts in autumn, but not of an equinox blót.

Haustblót is a modern feast. What it expresses, though, is very old: **thanks for the harvest,** and gifts to the powers that made it.

## The old evidence for thanksgiving

- In **Hákonar saga góða,** the toasts at the great feast include one to **Njord and Freyr, "for a good year and peace",** til árs ok friðar. Freyr, the sources agree, was the god of good seasons and plenty.
- **Adam of Bremen** says that at Uppsala sacrifices were made to **Fricco,** usually taken as Freyr, at weddings, and that he gave peace and pleasure.
- **Bede** calls September **Hāligmōnaþ,** "holy month", perhaps because of harvest offerings, though he does not say what they were.
- **Archaeology** shows grain, bread and food among offerings, and great feasting at the end of the farming year.

## The last sheaf

The richest harvest customs come from **later folklore,** recorded across Scandinavia, Germany and Britain in the eighteenth and nineteenth centuries. In parts of Scandinavia and northern Germany, the last sheaf of the harvest was left standing in the field **for Odin's horse,** or for "Wode", with a rhyme asking him to take it and give a good harvest next year. Elsewhere the last sheaf was made into a figure, an old woman, a goat or a "corn mother", and kept through the winter.

These customs fascinated nineteenth-century scholars such as Wilhelm Mannhardt, who saw in them survivals of heathen grain spirits. Some may be; others may have grown up later. The Odin's sheaf custom is genuinely recorded and lovely to keep, as long as it is named as folk custom of the Christian centuries.

## Sif and the grain

Many modern Heathens honour **Sif,** Thor's wife, at harvest, seeing in her golden hair the ripe grain. This is a modern reading: no old source says Sif was a goddess of grain. The image is beautiful and many find it meaningful. Name it as modern.

## Freyr and the good year

Freyr is the god most bound up with harvest in the old sources. Snorri says he rules rain and sunshine and the fruit of the earth, and that men should call on him for good seasons and peace. In **Ynglinga saga,** Snorri tells, as euhemerism, how Freyr was a king of the Swedes in whose reign there were such good seasons that people believed he caused them, and when he died they kept his body in a mound for three years, paying tribute into it, so the good years would go on. In **Skírnismál,** Freyr gives away his sword to win the giantess Gerðr, and many read the poem as a story of the god of the fields winning the earth. Whatever its first meaning, it makes him a god who gives up a weapon for love and plenty, which suits a feast of thanks.

## What the feast is about

A Heathen Haustblót is a feast of:

- **thanks:** to the gods, the land and the people whose work feeds us;
- **the harvest,** literal and figurative: what you grew, made and achieved this year;
- **sharing:** giving food to those who need it;
- **preparing for winter:** saving seed, storing food, putting the garden to bed.

Gods often honoured include **Freyr,** lord of the harvest; **Freyja;** **Thor,** who brings the rain; **Sif;** and the **landvættir,** who share the land with us.

## A Haustblót with the coven

1. **Set a harvest altar:** bread, apples, grain, vegetables from members' gardens or local farms, a horn of mead, cider or juice, and a bowl.
2. **Hallow** the space and declare frith.
3. **Call** Freyr, Thor, Sif and the land wights: "Freyr, lord of good seasons, we thank you for the harvest. Wights of this land, we thank you for sharing it."
4. **Name the harvest.** Each person names something the year has given them, good and hard.
5. **Bless the horn** and pass it round, with a toast **til árs ok friðar,** for a good year and peace.
6. **Pour** the gift. Take a loaf, some fruit and the bowl outside for the land.
7. **Leave a sheaf** or a handful of grain for the birds, as Odin's sheaf was left.
8. **Feast,** and give food to a local food bank or a neighbour.

## Alone

Bake or buy a loaf, and set out a little of the season's produce. Light a candle. Raise a cup to Freyr and the land, naming what you are thankful for. Take a slice of bread and the poured cup outside for the land. Leave grain or seed for the birds. Put your garden, window box or house plants in order for winter, and save some seed.

> **Try this:** Find out what was harvested in your area a hundred years ago, and what is harvested now. Buy or gather something local for your Haustblót.

> **Note:** If your coven follows the old evidence closely, it may keep its harvest thanks at Winter Nights instead. Both are reasonable.

## What's old and what's modern

- **Old:** thanks to Freyr and Njord for a good year and peace, Bede's holy month, harvest offerings and feasting; from later folklore, the last sheaf for Odin's horse.
- **Modern:** Haustblót as an equinox festival, and Sif as a goddess of grain.`,
    },
    {
      id: 'norse-lore-vetrnaetur',
      title: 'Winter Nights: the start of winter, the álfar and the dísir',
      summary: 'The Icelandic first day of winter and the two nights before it, Snorri’s blót for a good year, the Winter Nights feasts of Gísla saga and Víga-Glúms saga, Sigvatr’s álfablót, Bede’s sacrifice month, and a closed, household rite for the álfar, the dísir and the dead.',
      minutes: 16,
      links: [holy('norse/vetrnaetur'), holy('icelandic-haustmanudur'), seasonal('hlautbolli'), ritual('hedge-house-spirit-offering'), ritual('hedge-ancestor-candle-evening'), deity('freyr'), page('ancestors')],
      body: `## The first day of winter

In the old Icelandic calendar, **winter begins on a Saturday between 21 and 27 October.** The two nights before it are the **vetrnætur,** "Winter Nights". It was a time of slaughter and plenty: animals that could not be fed through winter were killed, meat was fresh, ale was brewed, and the household gathered for a great feast before the dark closed in.

## What the sources say

Winter Nights has some of the best evidence of any Heathen feast:

- **Snorri's Ynglinga saga** puts the first of Odin's three great sacrifices at the beginning of winter, **for a good year.**
- In **Gísla saga,** Þorgrímr, a chieftain devoted to Freyr, holds a Winter Nights feast and makes a sacrifice to Freyr. During the feast he is killed in his bed by Gísli, the saga's hero, and the saga turns on that killing.
- In **Víga-Glúms saga,** a feast for the dísir is held at Winter Nights.
- **Bede** calls November **Blōtmōnaþ,** "sacrifice month", when the English slaughtered the cattle they could not keep and gave them to their gods.

## The álfablót

The most moving witness is the skald **Sigvatr Þórðarson,** a Christian poet in the service of King Olaf Haraldsson. Travelling through Sweden around 1019, in autumn, he came to a farm and asked for shelter. A woman stood in the doorway and refused him: they were holding an **álfablót,** a sacrifice to the elves, and no stranger could come in, "for fear of Odin's anger". He went from farm to farm and was turned away each time.

Sigvatr's verses are a **contemporary source,** composed by someone who was there, in a land still largely heathen. They show a private, household rite, closed to outsiders, at the start of winter. They don't say what was done.

**Kormáks saga** adds a later, stranger picture: a wounded man is told to find a mound where álfar live, redden it with the blood of a bull, and make a feast of the meat for the álfar, to be healed.

## Who are honoured

At Winter Nights many Heathens honour:

- **the gods,** for a good year, especially **Freyr,** as in Gísla saga;
- **the álfar,** elves, the mysterious beings often linked with the mounds and the dead;
- **the dísir,** as in Víga-Glúms saga;
- **the dead** of the household, as winter, the season of the dead, begins.

Winter Nights falls close to the Gaelic Samhain and to the Christian All Saints and All Souls. The overlap shows how widely northern peoples felt the start of winter as a time when the dead drew near. It does not prove that these feasts share an origin.

## Slaughter and plenty

It is easy to romanticise the start of winter. For a farm in the Viking age it was a hard reckoning: how much hay was there, how many animals could be kept alive until spring, how much food was stored. Animals that could not be fed were slaughtered, and for once there was fresh meat in plenty. The feast was real abundance on the edge of real scarcity. A modern Winter Nights can keep that honesty: give thanks for what you have, take stock of what you need, and think of those who will go short this winter.

## A closed feast

Following Sigvatr, many Heathen groups keep Winter Nights as a **closed** rite: household and close kin only, doors shut. That is a lovely custom. A coven might keep a public blót for a good year earlier in the day, and a closed rite for its members at night.

## A Winter Nights rite with the coven

1. **Close the door.** Members only; phones away.
2. **Set the altar** with a horn, a bowl, a candle for the dead, names or photos of members' dead, and food for the álfar: porridge with butter, bread, a little meat or cheese.
3. **Hallow** the space and declare frith.
4. **First, the gods:** call Freyr and the gods of the coven, and ask for a good year. Pass the horn.
5. **Second, the álfar and the land:** greet them, and set aside their portion of the food.
6. **Third, the dísir and the dead:** speak names. Pour a cup for them.
7. **Sprinkle** the people and the house from the bowl, for protection through winter.
8. **Feast** together. Afterwards, carry the álfar's portion out to the threshold or the garden, and leave it.

## Alone

Close your door for the evening. Light a candle for your dead. Pour a cup to Freyr for a good year, and to the álfar and the land. Set out a small bowl of porridge with butter by the door or outside. Speak the names of your dead. Then eat a good meal yourself, and go to bed early, as winter begins.

> **Note:** The app's Winter Nights page explains the date, which moves with the Icelandic calendar. Some covens keep it on the nearest weekend.

> **Try this:** Read Sigvatr's verses in a translation of Heimskringla (in the saga of Olaf Haraldsson). Imagine yourself on either side of that door. Write a few lines on what the álfablót might have been like.

## What's old and what's modern

- **Old:** the Icelandic first day of winter, Snorri's blót for a good year, the Winter Nights feasts in Gísla saga and Víga-Glúms saga, Sigvatr's álfablót, and Bede's sacrifice month.
- **Modern:** the shape of the three-part rite here, and porridge for the álfar, which borrows from later house-spirit custom.`,
    },
    {
      id: 'norse-lore-jol',
      title: 'Yule (Jól): the great midwinter feast',
      summary: 'Jól in the oldest sources, Hákon the Good’s Yule law, the Yule toasts, Bede’s Giuli and Mothers’ Night, Odin as Jólnir and the Wild Hunt, the house spirit’s porridge and the Yule goat, respect for the living Christmas, and twelve nights of rite and toast.',
      minutes: 17,
      links: [holy('norse/jol'), seasonal('yule-goat'), seasonal('yule-log'), seasonal('evergreen-boughs'), ritual('folk-jol-rune-casting'), ritual('folk-simple-blot'), deity('odin'), deity('frigg'), deity('njord'), journey('deity-odin'), spread('yule')],
      body: `## The oldest name

**Jól** is the oldest name we have for a Germanic midwinter feast. It is in a skaldic poem from around 900, which says of King Harald Fairhair that he "will drink Yule out at sea". Bede, in 725, gives the English months around midwinter as **Giuli.** Gothic, the oldest recorded Germanic language, has a related month name. So the feast, or at least its name, is very old and widespread. English still says "Yule", and the Nordic languages still call Christmas **jul** or **jól.**

## Hákon's Yule law

The fullest Norse account is in Snorri's **Hákonar saga góða.** Snorri says that before King Hákon the Good, in the tenth century, Yule began on **hǫkunótt,** "midwinter night", and was kept for three nights. Hákon, raised a Christian in England, made a law that Yule should be kept at the same time as the Christian feast, and that every household should brew ale for it and keep it as long as the ale lasted, or pay a fine.

Snorri also describes the toasts at a great feast, which Heathens use at Yule: **to Odin, for victory; to Njord and Freyr, for a good year and peace; the bragafull;** and the **minni,** in memory of dead kin.

How much can we trust this? Snorri wrote nearly three centuries after Hákon. The exact date of heathen Yule is debated: midwinter by the moon, the solstice, or mid-January have all been argued. The **twelve nights** of Yule are a Christian period, from Christmas to Epiphany, that modern Heathens have taken over.

## Bede's Mothers' Night

Bede says the heathen English began their year on the night now called Christmas Eve, which they called **Mōdraniht,** "mothers' night", "because of the ceremonies they performed that night". He doesn't say what they were. Many Heathens keep Mothers' Night at the start of Yule, honouring the dísir and the mothers of their line.

## Odin, the Yule-father

One of Odin's names is **Jólnir,** and another **Jólfaðr,** "Yule-father", in the poetic sources. In later folklore across Scandinavia and Germany, the **Wild Hunt,** a host of the dead riding through the winter sky, was led in some places by Odin or Wodan; the Norwegian **Oskoreia** is one version. These are folk beliefs recorded in Christian times, and it is debated how old the Odin connection is.

## The house spirit and the goat

Later Scandinavian folklore gives many Yule customs:

- a bowl of **porridge with butter** left for the **tomte** or **nisse,** the house spirit, on Christmas Eve;
- the **Yule goat,** julbock or julebukk, made of straw, and in older times a person dressed as a goat going from house to house; some see in it Thor's goats, but that link is modern speculation;
- a **sheaf of grain** set up for the birds;
- the **Yule log** and evergreens, found across northern Europe;
- the belief that the dead return to their homes at Yule, and that beds should be left made for them.

## Respecting the living Christmas

Christmas in the Nordic countries is a **living Christian and family feast,** with St Lucia's day, church services, Christmas trees and family meals. Many customs, such as the tomte's porridge, the Yule goat and the Christmas ham, belong to it now, whatever their roots. Heathens can enjoy and share them, and many have Christian families. Avoid the common online habit of claiming that Christmas is "really" a pagan festival stolen by the church. The history is more tangled than that, and the claim is unkind to people who keep Christmas as their own.

## What the feast is about

Yule is the greatest feast of the Heathen year. It is a feast of:

- **the dark and the returning sun;**
- **the gods,** toasted for victory, a good year and peace;
- **the dead,** who draw near;
- **the household,** gathered round the fire;
- **oaths for the year ahead,** made over the Yule cup.

## Yule with the coven

Many covens keep twelve nights, with a great blót and sumbel on one of them.

1. **Mothers' Night:** honour the dísir and the mothers of members' lines, as at the Dísablót.
2. **The great blót:** hallow the hall, call Odin as Jólnir, Frigg, Njord and Freyr, Thor and the gods of the coven. Bless and pass the horn, pour the gift, and sprinkle the folk.
3. **The Yule sumbel:** toasts to Odin for victory; to Njord and Freyr, til árs ok friðar; the bragafull for oaths for the year (small and specific); and the minni for the dead.
4. **The feast:** roast meat or a rich vegetarian dish, porridge, spiced bread, Yule ale and something non-alcoholic.
5. **Gifts for the house spirit:** porridge with butter at each member's home.
6. **A rune cast for the year,** as in the app's Rune-Casting for the Year at Jól.

## Alone

Over twelve nights, light a candle each night and make a small toast: to a god, to an ancestor, to the land, and so on. On one night, keep a fuller blót with the Yule toasts. Leave porridge for the house spirit. Put out grain for the birds. Draw a rune or a spread for the year ahead, and write one small oath you can keep.

> **Safety:** Candles and evergreens are a fire risk in a warm house. Keep them apart, never leave candles unattended, and water a live tree.

> **Try this:** Keep a simple twelve-night record in your book: one line each night on what you toasted and what you noticed. Read it back on Twelfth Night.

## What's old and what's modern

- **Old:** the word jól and Bede's Giuli, Hákon's Yule law and the Yule toasts, Mōdraniht, Odin as Jólnir; from later folklore, the house spirit's porridge, the Yule goat, the Wild Hunt and the sheaf for the birds.
- **Modern:** keeping Yule at the solstice, the twelve nights as a Heathen period, and the shape of the coven's Yule here.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-norse-lore',
      title: 'The Heathen year: test',
      intro: 'Fourteen questions on the Heathen year and its seven feasts. Most are scored at once; your mentor reads the two written answers. You need 80% to pass, and you can try again.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'Into how many seasons did the old Icelandic calendar divide the year?',
          options: ['Two: summer and winter', 'Four', 'Eight', 'Thirteen'],
          correct: [0],
          points: 1,
          explanation: 'Summer and winter, each a misseri. Icelanders counted age in winters.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'What is the sumarauki?',
          options: ['A summer goddess', 'A leap week added in midsummer to keep the calendar in step with the sun', 'The first day of summer', 'A drinking horn'],
          correct: [1],
          points: 1,
          explanation: 'The Icelandic year of 52 weeks needed a leap week every few years.',
        },
        {
          id: 'q3',
          type: 'multi',
          prompt: 'According to Snorri’s Ynglinga saga, which were Odin’s three great sacrifices? Choose all that apply.',
          options: ['At winter’s start, for a good year', 'At midwinter, for growth', 'At summer’s start, for victory', 'At the autumn equinox, for the harvest'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'No equinox sacrifice is recorded; Haustblót is a modern feast.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'What does Bede say Mōdraniht was?',
          options: ['A summer feast', '“Mothers’ night”, on the night now called Christmas Eve, when the heathen English began their year', 'A sacrifice of cattle in November', 'A harvest month'],
          correct: [1],
          points: 1,
          explanation: 'Bede, writing in 725, says the heathen English held ceremonies on Mothers’ Night but not what they were.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'When does the modern Icelandic Þorrablót feast with þorramatur largely date from?',
          options: ['The Viking age', 'The nineteenth-century revival and a 1958 Reykjavík restaurant', 'Bede’s time', 'The 1990s'],
          correct: [1],
          points: 1,
          explanation: 'The month is old; the feast as kept now is a modern revival, a living Icelandic custom.',
        },
        {
          id: 'q6',
          type: 'truefalse',
          prompt: 'In the sagas, the dísablót always falls in late winter.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. Egils saga puts one in autumn and Víga-Glúms saga at Winter Nights; the late-winter date follows Snorri’s Uppsala Disting.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'What is the Disting?',
          options: ['A rune', 'The assembly and market at Uppsala in late winter, which Snorri links with the dísir and which still runs as a fair', 'A Yule goat', 'A sumbel round'],
          correct: [1],
          points: 1,
          explanation: 'Distingen is still held in Uppsala in early February.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'When is the Icelandic first day of summer?',
          options: ['1 May', 'The first Thursday after 18 April', 'The spring equinox', 'Midsummer Day'],
          correct: [1],
          points: 1,
          explanation: 'Sumardagurinn fyrsti is still a public holiday in Iceland, with summer gifts.',
        },
        {
          id: 'q9',
          type: 'truefalse',
          prompt: 'The Norse sources clearly describe a heathen midsummer blót.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. The sources are silent; what they show is the Althing’s June assembly. The rich customs are Christian-era.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'Where does the link between Baldr and midsummer mostly come from?',
          options: ['Völuspá', 'James Frazer’s The Golden Bough, and modern interpretation', 'Bede', 'A runestone'],
          correct: [1],
          points: 1,
          explanation: 'It is a modern interpretation, meaningful to some, and should be named as such.',
        },
        {
          id: 'q11',
          type: 'single',
          prompt: 'Why was the skald Sigvatr turned away at Winter Nights around 1019?',
          options: ['The household was holding a closed álfablót', 'He was drunk', 'It was the Althing', 'He had no horse'],
          correct: [0],
          points: 1,
          explanation: 'His verses are a contemporary witness to a private rite for the elves at the start of winter.',
        },
        {
          id: 'q12',
          type: 'multi',
          prompt: 'Which Yule customs come from later Scandinavian folklore, recorded in Christian times? Choose all that apply.',
          options: ['Porridge left for the house spirit', 'The straw Yule goat', 'A sheaf of grain for the birds', 'Hákon’s Yule law in Snorri'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Hákon’s law is in Snorri’s saga; the others are later folk custom.',
        },
        {
          id: 'q13',
          type: 'long',
          prompt: 'Choose one feast you kept this year. Describe what you did, which customs you kept and where they come from (a saga, Snorri, Bede, folklore, or modern practice), and how you showed respect for any living custom involved.',
          points: 4,
          explanation: 'Keeping the feasts well means knowing where each custom comes from and who keeps it now.',
          rubric: 'Full marks (4): describes a feast actually kept, with what was done (1); names at least one custom and accurately gives its source or type (1); correctly marks at least one element as old and one as modern (1); shows awareness of living customs (Icelandic, Scandinavian, Christian) and how they acted respectfully, or explains why none was involved (1).',
        },
        {
          id: 'q14',
          type: 'short',
          prompt: 'A friend says “Christmas is really a pagan festival the church stole.” Using what you have learned about Yule, how would you answer?',
          points: 2,
          explanation: 'The honest answer is more tangled, and kinder.',
          rubric: 'Full marks (2): gives an accurate point from the lesson, such as the old word jól and Bede’s Giuli alongside the later Christian origin of the twelve nights or of many folk customs (1); answers respectfully, acknowledging Christmas as a living Christian feast and avoiding the “stolen” framing (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'The Heathen year',
      intro: 'The Heathen year turns on summer and winter, with seven feasts from Þorrablót in the midwinter dark to Yule. Here you learn how the year was counted and what the sources say of each feast, and keep each feast as it comes, reading its lesson beforehand. A full turn takes a year.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'The Heathen year',
          kind: 'study',
          instructions: `1. Read "The Heathen year: summer, winter and the great blóts", and "The turning year" from the Wheel of the Year course for comparison.
2. Open the app's Old Icelandic calendar and find this month's name and the next first day of summer or winter.
3. Do the "Try this": draw the Heathen year in your book.
4. In the answer box, write which feasts your coven keeps, whether it begins them at sunset, and which dates it uses, after asking your mentor.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['norse-lore-the-heathen-year', 'wheel-lore-the-turning-year'],
          links: [page('calendar'), spread('year-ahead')],
        },
        ...festivals.map(festivalTask),
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Read "The Heathen year" again, and the lessons for any feasts you haven't kept yet.
2. Take the test. You can take it before the year is out; the choice questions are scored at once and your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed, talk to your mentor, and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 35,
          docs: ['norse-lore-the-heathen-year'],
          quiz: 'quiz-norse-lore',
          links: [closed(), journey('path-norse'), deity('norns')],
        },
      ],
    },
  ],
} satisfies CourseModule;
