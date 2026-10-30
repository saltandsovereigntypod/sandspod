// Celtic lore: the Gaelic year and its four fire festivals, with the Gaelic
// and Brythonic depth the Wheel of the Year lessons leave out: the quarter
// days in the medieval texts, days from sunset and the two halves of the year,
// the Coligny calendar and the Welsh calends; then one lesson for each of
// Samhain, Imbolc (Lá Fhéile Bríde), Bealtaine and Lughnasadh, on its place in
// the medieval literature, its customs across Ireland, Scotland, Man, Wales,
// Cornwall and Brittany, respect for the living (often Christian) customs,
// and a Celtic rite for it; and a lesson on the great stories (the
// Mythological Cycle, the Lebor Gabála, Cath Maige Tuired and the Mabinogi).
// The festivals' general history is taught in the Wheel of the Year lessons
// (wheel-lore), which each festival task also gives to read rather than
// repeat. Each festival task carries its holiday key (holidays.ts, tradition
// 'celtic'). Modern practice marked as modern. British spelling.

import type { CourseModule, CourseTask } from '../types';
import { closed, deity, herb, holy, journey, page, ritual, seasonal, spread } from '../linkHelpers.ts';

const festivals: { slug: string; wheel: string; name: string; rite: string; spread: string; things: string[] }[] = [
  { slug: 'samhain_gaelic', wheel: 'samhain', name: 'Samhain', rite: 'hedge-ancestor-candle-evening', spread: 'samhain', things: ['turnip-lantern', 'apples'] },
  { slug: 'la_fheile_bride', wheel: 'imbolc', name: 'Imbolc (Lá Fhéile Bríde)', rite: 'folk-brigid-cross-well', spread: 'imbolc', things: ['brideog', 'brigids-cross'] },
  { slug: 'bealtaine', wheel: 'beltane', name: 'Bealtaine', rite: 'folk-bealtaine-dew', spread: 'beltane', things: ['may-bush'] },
  { slug: 'lughnasadh', wheel: 'lammas', name: 'Lughnasadh', rite: 'green-harvesting-herbs-with-thanks', spread: 'lammas', things: ['bilberries', 'wheat-sheaf'] },
];

const festivalTask = (f: (typeof festivals)[number]): CourseTask => ({
  title: `Keep ${f.name}`,
  kind: 'ritual',
  instructions: `1. A week or two before, read the Celtic lesson on ${f.name}, and the Wheel of the Year lesson on the same festival for its wider history. The app's calendar shows the date, and the holy day's page has more.
2. Plan how you will keep it: with the coven, alone, or both. Change your shrine for the season, and prepare the festival's food and its custom.
3. On the day (from sunset the evening before, in the Gaelic way, if you can), keep the rite in the lesson or in your coven's way, with at least one recorded custom of the festival.
4. Afterwards, write in the answer box what you did, which customs you kept and where they were recorded, what the land was doing, and one thing you'd do differently next year.
5. If you could not keep it on the day, keep a simple version within a few days and say so.`,
  times: 1,
  response: 'text',
  checked_by: 'mentor',
  minutes: 90,
  holiday: `celtic/${f.slug}`,
  docs: [`celtic-lore-${f.slug}`, `wheel-lore-${f.wheel}`],
  links: [ritual(f.rite), spread(f.spread), ...f.things.map(seasonal)],
  solitary: `Keep ${f.name} alone at your hearth with the solitary rite in the lesson: sain, kindle, honour the powers, keep at least one of the festival’s recorded customs, and give the season’s food. If you can, share the food with family, friends or neighbours afterwards, as hospitality asks.`,
});

export default {
  id: 'celtic-lore',
  title: 'The Celtic year and its stories',
  docs: [
    {
      id: 'celtic-lore-the-gaelic-year',
      title: 'The Gaelic year: four quarter days',
      summary: 'How the Gaelic year was divided: the four quarter days named in the medieval texts, the winter and summer halves, days reckoned from sunset, the Coligny calendar of Gaul, the Welsh calends and the Scottish term days; where the solstices fit; and keeping the year in the southern hemisphere.',
      minutes: 16,
      links: [page('calendar'), holy('celtic/samhain_gaelic'), holy('celtic/la_fheile_bride'), holy('celtic/bealtaine'), holy('celtic/lughnasadh'), holy('coligny-samonios'), page('folk-calendar'), spread('year-ahead')],
      body: `## Four days that turn the year

The Gaelic year turned on four great days, the **quarter days**, at the beginning of each season:

- **Samhain,** 1 November, the beginning of winter;
- **Imbolc,** 1 February, the beginning of spring;
- **Bealtaine,** 1 May, the beginning of summer;
- **Lughnasadh,** 1 August, the beginning of autumn.

They are named together in medieval Irish literature. In the tale Tochmarc Emire, "the Wooing of Emer", the heroine Emer sets the hero Cú Chulainn riddles that name the four: Samain, Imbolc, Beltaine and Brón Trogain, an old name for Lughnasadh, often translated "the sorrow" or "the labour of the earth" as the harvest begins. Other tales place assemblies, feasts and battles on them, above all at Samhain.

Each is not a single day but an eve and a day: the festival begins at sunset the evening before. That is why Halloween is 31 October and the eve of Brigid's day is 31 January.

## Days from sunset

Julius Caesar noted that the Gauls counted time by nights rather than days, and kept birthdays and the beginnings of months and years with the night first. Medieval Irish practice also treated the eve as part of the feast. In modern Irish the night before a feast is its oíche: Oíche Shamhna, Samhain night. Many Celtic pagans begin their festivals at sunset for this reason.

## The two halves

The quarter days divide the year in two great halves as well as four seasons: the **winter half**, from Samhain to Bealtaine, and the **summer half**, from Bealtaine to Samhain. The Irish words geimhreadh (winter) and samhradh (summer) cover these halves loosely. Herds went up to summer pastures at Bealtaine and came down at Samhain. The dark half came first, as night comes before day; many scholars and modern pagans speak of Samhain as the Gaelic New Year, though the evidence for this is suggestive rather than certain.

## The Coligny calendar

The one surviving pagan Celtic calendar is the bronze tablet found at Coligny in eastern France in 1897, made in the late second century CE. It sets out five years of lunar months in Gaulish, each month split into two halves, with intercalary months to keep the moon and sun in step. Its first month is Samonios, a name linked with the word for summer, and one of its days reads TRINVX SAMONI, often understood as "three nights of Samonios". Whether Samonios fell near Samhain or at the start of summer is still argued. The app's calendars include the Coligny months as a reconstruction. It shows that at least one Celtic people kept a careful lunar-solar calendar; it does not tell us their festivals.

## Wales, Scotland, Man and Brittany

- **Wales** keeps the calends, **calan**: Calan Gaeaf (1 November, the calends of winter) and Calan Mai (1 May), each with an eve, a nos galan, counted among the **ysbrydnosau**, the spirit nights. Gŵyl Awst, the feast of August, and Gŵyl Fair y Canhwyllau, Mary's feast of the candles (Candlemas, 2 February), stand at the other quarters.
- **Scotland** kept the Gaelic festivals in the Highlands and Islands, and Scots law kept four **term days**, on which rents and wages fell due: Candlemas, Whitsunday, Lammas and Martinmas, near the old quarter days.
- **The Isle of Man** kept Hop-tu-Naa at Samhain, Laa'l Breeshey at Imbolc, Laa Boaldyn at Bealtaine and Laa Luanys at Lughnasadh.
- **Brittany** kept Kala-Goañv, the calends of winter, and Kala-Mae, the calends of May.

## And the solstices?

The solstices and equinoxes are hardly mentioned in early Irish or Welsh sources. That does not mean no one noticed them: the great Neolithic tomb at Newgrange, built over five thousand years ago, long before any Celtic language reached Ireland, is aligned so that the rising sun at midwinter lights its inner chamber. And Midsummer Eve, the feast of Saint John, was kept with bonfires across Ireland, Man, Wales and Brittany in folk custom, as it still is in parts of the west of Ireland. But the eight-festival Wheel of the Year, with solstices and equinoxes between the quarter days, is a twentieth-century creation. A Celtic coven may keep Midsummer as a folk feast, but should not call the eightfold Wheel ancient Celtic.

## Calendar changes

When Britain and Ireland moved from the Julian to the Gregorian calendar in 1752, eleven days were dropped. Some communities went on keeping festivals by the old reckoning, so you will find "Old May Day" on 12 May and "Old Halloween" in mid-November in some records. Some Celtic pagans also keep the festivals by the land rather than the date: Bealtaine when the hawthorn flowers, Lughnasadh with the first harvest. Both have good reasons. This coven's calendar in the app keeps the fixed dates.

## In the southern hemisphere

The Gaelic festivals belong to the seasons of Ireland and Scotland. In Australia, New Zealand, South Africa and South America, the seasons are reversed. Many southern Celtic pagans keep Samhain at the start of May and Bealtaine at the start of November, to follow the land; others keep the Irish dates, to stay with the communities and calendars of the homelands. Both are honest choices. Ask your coven which it keeps; the app's Celtic calendar shows the northern dates.

> **Your coven:** Ask your mentor which festivals your coven keeps besides the four, whether it begins them at sunset, and whether it keeps them by date or by the land.

> **Try this:** Draw the Gaelic year in your book as a circle split into two halves and four quarters. Mark the four festivals, the winter and summer halves, and three things that happen on your own land in each quarter.

## What's old and what's modern

- **Old:** the four quarter days in medieval Irish literature, days from sunset, the Coligny calendar, the Welsh calends, the Scottish term days, and Midsummer fires in folk custom.
- **Modern:** the eightfold Wheel, and keeping the Gaelic festivals by the southern seasons.`,
    },
    {
      id: 'celtic-lore-samhain_gaelic',
      title: 'Samhain (Oíche Shamhna)',
      summary: 'Samhain in the Gaelic and Brythonic world: the medieval tales of assemblies, Otherworld encounters and kings’ deaths, the folk customs of fires, guising, divination and the dead across Ireland, Scotland, Man, Wales, Cornwall and Brittany, what is not known, and a Celtic Samhain rite for a coven and alone.',
      minutes: 17,
      links: [holy('celtic/samhain_gaelic'), deity('morrigan'), deity('dagda'), deity('aengus'), deity('cailleach'), page('ancestors'), ritual('hedge-ancestor-candle-evening'), ritual('folk-apple-candle-halloween'), seasonal('turnip-lantern'), spread('samhain')],
      body: `## Summer's end

Samhain, in Scottish Gaelic Samhainn and in Manx Sauin, is the first day of winter, 1 November, kept from sunset on 31 October. Its name is usually explained as "summer's end", though the word's origins are debated. For the general history of the festival and of Halloween, read the Wheel of the Year lesson on Samhain alongside this one. This lesson goes deeper into the Gaelic and Brythonic sources and customs.

## Samhain in the medieval tales

In early Irish literature Samhain is the great assembly time, and the time when the Otherworld is open.

- **Assemblies and feasts.** The tales place the great Feast of Tara at Samhain, with the king and the men of Ireland gathered for days. Seventeenth-century historian Geoffrey Keating describes a fire lit at Tlachtga (the Hill of Ward in County Meath) at Samhain, from which others were kindled; his source and its age are uncertain.
- **The Otherworld opens.** In Echtra Nerai, "the Adventure of Nera", a young warrior goes out on Samhain night at the court of Crúachan, follows a host of the síd into their mound, and lives there for a time. In Aislinge Óenguso, "the Dream of Aengus", the god Aengus finds his beloved Caer at Samhain in the form of a swan, and flies away with her.
- **The gods meet.** In Cath Maige Tuired, the Dagda meets the Morrígan at Samhain, at a river in Connacht, before the great battle, and she promises her help.
- **Danger and death.** Fionn mac Cumhaill guards Tara on Samhain night against Aillén, a fire-breathing being of the síd who burns it every year. Several kings meet their deaths at Samhain in the tales.

These are stories written by Christian authors. They show that Samhain was remembered as a time of gathering, of the Otherworld close at hand, and of fate. They do not describe pagan rites.

## Samhain in folk custom

- **Ireland.** Bonfires on hills; guisers in straw masks and costumes going from house to house; the barmbrack, a fruit loaf with a ring baked in (whoever finds it will marry); colcannon with charms; games of divination with apples and nuts; a place left at the table and the door unlatched for the dead; turnip lanterns. Food left out that night, or fallen to the floor, was not eaten.
- **Scotland.** Samhainn fires in the Highlands, and guising in the Lowlands and Highlands alike; divination with apples, kale stalks and nuts, as Robert Burns describes in his poem "Halloween" (1785).
- **The Isle of Man.** **Hop-tu-Naa**, with turnip lanterns and children going round singing the Hop-tu-Naa songs, still kept today.
- **Wales.** Nos Galan Gaeaf, a spirit night, with bonfires (coelcerthi); people marked stones and threw them into the fire, and looked for them in the morning, a missing stone being an ill omen; and everyone ran home before "the tailless black sow" (yr hwch ddu gwta) caught the last one.
- **Cornwall.** Allantide, with large, polished "Allan apples" given as gifts and placed under pillows for dreams of love.
- **Brittany.** The night of the dead, when the souls (an Anaon) are thought to return, with food left out and graves visited at All Saints.

Much of this is still alive, in Christian families and communities. All Saints and All Souls stand right beside Samhain, and for most Irish, Scottish, Manx, Welsh and Breton people the dead are remembered at Mass and at the graves.

## What we don't know

We have no reliable description of pagan Samhain worship. Stories of druids' Samhain sacrifices, or of a "lord of death" called Samhain, are modern errors. That Samhain began the year is likely but not proven.

## The gods of Samhain

From the tales, the Dagda and the Morrígan meet at Samhain; Aengus finds Caer; the people of the síd ride out. Many Celtic pagans honour these gods, the Cailleach as winter begins, and above all their own dead.

## A Celtic Samhain rite

**With the coven,** perhaps outdoors by a fire:

1. **Gather** at sunset. Sain everyone with water.
2. **Kindle** the fire.
3. **Honour** the land, sea and sky, and the spirits of the place, with a gift left apart for the good neighbours, and a word of courtesy.
4. **The dead.** Each person speaks the names of their dead, and gives a little food or drink to the fire or the earth for them.
5. **The gods.** Praise and an offering to the Dagda and the Morrígan, or the coven's gods of the season.
6. **The customs.** Divination games with apples and nuts, done with laughter as well as meaning; stories of the year past.
7. **A feast** with a place set and a plate served for the dead.
8. **Thanks and closing.** The dead's plate is given to the earth in the morning.

**Alone:** light a candle in the window, set a place at your table, speak your dead's names, give them food, play one old game, and write in your book what you are leaving behind with the summer.

> **Safety:** Bonfires need permission and care; guising should be kind, never frightening for the vulnerable. Respect graveyards: they belong to living families.

> **Your coven:** Ask your mentor how your coven keeps Samhain: indoors or out, with which gods, and whether it remembers members who have died.

## What's old and what's modern

- **Old:** Samhain as an Otherworld-haunted assembly time in the tales, and the fires, guising, divination and care for the dead in folk custom.
- **Modern:** pagan Samhain rites to the old gods, and calling Samhain "the Celtic New Year" with certainty.`,
    },
    {
      id: 'celtic-lore-la_fheile_bride',
      title: 'Imbolc (Lá Fhéile Bríde)',
      summary: 'Imbolc and Brigid’s feast across the Gaelic world: the name and its uncertain meaning, Brigid as goddess and saint, the crosses, the brat Bríde, the Brídeog and Brigid’s bed in Ireland, Scotland and Man, the Cailleach and the serpent, the living Christian feast and how to honour it, and a Celtic Imbolc rite.',
      minutes: 17,
      links: [holy('celtic/la_fheile_bride'), deity('brigid'), deity('cailleach'), journey('deity-brigid'), ritual('folk-brigid-cross-well'), seasonal('brideog'), seasonal('brigids-cross'), spread('imbolc'), closed()],
      body: `## The first day of spring

Imbolc, 1 February, kept from the eve of 31 January, is the first day of spring in the Gaelic year and the feast of Brigid: Lá Fhéile Bríde in Irish, Là Fhèill Brìghde in Scottish Gaelic, Laa'l Breeshey in Manx. For the festival's wider history read the Wheel of the Year lesson on Imbolc as well. This lesson goes into the Gaelic customs, Brigid herself, and the respect the day asks for.

## The name

Imbolc is named in Tochmarc Emire among the four quarter days. Its meaning is uncertain. Cormac's Glossary, around 900, explains it as oímelc, "ewe's milk", for the lambing season; many modern scholars prefer i mbolg, "in the belly", for the pregnant ewes. Neither is certain. Both point to the same thing: the first stirring of new life in the farming year, lambs and milk after the hungry winter.

## Brigid, goddess and saint

Cormac's Glossary describes a goddess Brigid, daughter of the Dagda, "a goddess whom poets worshipped", with two sisters of the same name, one of healing and one of smithcraft. Saint Brigid of Kildare, who died around 525, is one of Ireland's three patron saints. Her early Lives are full of miracles of milk, butter, fire, healing and hospitality. Gerald of Wales described the fire kept by her nuns at Kildare in the 1180s.

How the goddess and the saint are related is one of the great open questions of Irish religious history. Some scholars think the saint's cult took up much of the goddess's; others think the saint was simply a remarkable woman whose cult gathered folk customs. People hold this in different ways, and it cannot be proved either way. A Celtic pagan honours the goddess, and treats the saint, and those who love her, with respect.

## The customs

**In Ireland:**

- **Brigid's crosses** of rushes or straw are woven on the eve and hung over doors and in byres, the old ones burned or kept. There are many regional forms: the four-armed cross with a woven centre, the three-armed cross, diamond "lozenge" forms.
- **The brat Bríde,** a cloth or ribbon, is left outside overnight for the saint to touch as she passes, and kept for healing headaches and sore throats through the year.
- **The Brídeog,** a doll or figure of Brigid, is carried from house to house by young people, the Biddy boys in some places, who are given food or money.
- **Brigid is welcomed in:** in some places a member of the family went out and knocked three times, asking to be let in "for Brigid", and was welcomed in with the rushes for the crosses.

**In Scotland,** Carmina Gadelica records the women of the house dressing a sheaf of oats as Bride and laying her in a basket bed, **leabaidh Bhrìde**, by the hearth with a white wand, crying "Bride is welcome", and checking the ashes in the morning for her footprint as a sign of a good year. A rhyme says the serpent will come out of its hole on Bride's day, a sign of spring. And in Highland folklore, if Imbolc is fine, the **Cailleach**, the hag of winter, is out gathering firewood to make winter last longer; if it is foul, she is asleep, and spring is near.

**On the Isle of Man,** rushes were gathered and the family stood at the door to invite Brigid in to spend the night.

**In Wales** the day after, 2 February, is Gŵyl Fair y Canhwyllau, the Christian feast of Candlemas, with candles blessed in church.

## A living feast

Saint Brigid's Day is a living Christian feast. Since 2023 Ireland has had a public holiday in Brigid's honour on the first Monday of February (or 1 February when it falls on a Friday). The Brigidine Sisters relit Brigid's flame in Kildare in 1993 and keep it at Solas Bhríde, which welcomes visitors of any faith. Crosses are made in Irish schools and blessed in churches.

So at Imbolc, more than at any other festival, a Celtic pagan is keeping a day that others keep as their own. You may weave a cross, leave out a cloth and welcome Brigid as goddess at your hearth. Do not claim the Catholic customs as secretly pagan, and if you visit a church, a holy well or Kildare, go as a respectful guest.

## A Celtic Imbolc rite

**With the coven:**

1. **Gather** at sunset on the eve. One person waits outside with the rushes.
2. **The welcome.** The one outside knocks three times and asks to come in with Brigid; the coven answers, "Come in, and welcome." The rushes are brought in sunwise.
3. **Sain** with water from a well or spring if you can get it, and **kindle** the fire.
4. **Honour** the land, the ancestors and Brigid, with praise and an offering of milk, butter and bread.
5. **Weave crosses** together, with talk, stories and poems. Read or speak something new for Brigid as goddess of poets.
6. **Make Brigid's bed** by the hearth: a basket with a small figure or sheaf and a white stick. Smooth the ashes, or a dish of sand, beside it.
7. **Put out the brat Bríde,** a strip of cloth from each person, to stay out overnight.
8. **Feast** on dairy, oatcakes, colcannon or barmbrack.
9. **Thanks and closing.** In the morning, look at the ashes, take in the cloths, and hang the crosses.

**Alone:** weave one cross, make a small bed for Brigid, leave a ribbon outside overnight, light a candle and say a poem to her, and give milk to the earth in the morning.

> **Your coven:** Ask your mentor which form of cross your coven weaves, and whether the coven visits a holy well at Imbolc.

## What's old and what's modern

- **Old:** the quarter day, Brigid in Cormac's Glossary, the saint and her cult, and the crosses, brat Bríde, Brídeog and Brigid's bed in folk custom (Christian).
- **Modern:** honouring Brigid as goddess with these customs in a pagan rite.`,
    },
    {
      id: 'celtic-lore-bealtaine',
      title: 'Bealtaine',
      summary: 'Bealtaine in the Gaelic and Brythonic world: Cormac’s Glossary and the two fires, Uisneach, the protective customs of fire, dew, rowan, the May bush and the first water, butter luck and its thieves, the Beltane bannock and Pennant’s Highland account, Calan Mai in Wales and May Eve on Man, what is not known, and a Celtic Bealtaine rite.',
      minutes: 17,
      links: [holy('celtic/bealtaine'), ritual('folk-bealtaine-dew'), ritual('folk-rowan-red-thread'), ritual('green-hawthorn-may-blossom-blessing'), herb('rowan'), herb('hawthorn'), seasonal('may-bush'), spread('beltane'), deity('belenus')],
      body: `## The first day of summer

Bealtaine, 1 May, kept from the eve of 30 April, is the first day of summer in the Gaelic year: Lá Bealtaine in Irish, Latha Bealltainn in Scottish Gaelic, Laa Boaldyn in Manx, and Calan Mai in Welsh. For the wider history of May Day, read the Wheel of the Year lesson on Beltane as well. This lesson goes into the Gaelic and Welsh sources and customs.

## In the medieval sources

Bealtaine is one of the four quarter days in Tochmarc Emire. Cormac's Glossary, around 900, gives the fullest early description: it explains the name as "lucky fire" or "bright fire", and says that two fires were made by druids with great incantations, and cattle were driven between them each year against disease. The glossary was written by a Christian scholar long after the druids, and what he describes may be memory, custom of his own day, or learned guesswork; but the driving of cattle past fire for protection is well recorded in later folk custom.

Later writers, among them Keating in the seventeenth century, placed a great Bealtaine assembly at the Hill of **Uisneach** in County Westmeath, the symbolic centre of Ireland. In recent years a Bealtaine fire has again been lit there as a public festival.

## The name and Belenus

You will often read that Bealtaine means "the fire of Bel" or honours a god Belenus or Bel. Belenus was a real Gaulish and British god, known from inscriptions, often linked with Apollo. But most scholars doubt the connection with Bealtaine; the name's first part probably means "bright" or "lucky". Honour Belenus if you are drawn to him, but don't teach that Bealtaine is his feast.

## The customs of protection

Bealtaine customs are above all about **protecting** the household, the herds and the dairy as summer begins and the cattle go out to pasture, and about guarding the household's luck.

- **Fire.** In Ireland and Scotland, the household fire was put out and relit from a bonfire. Cattle were driven past the flames or singed with a burning bush. People jumped the fire or walked round it sunwise.
- **Rowan and red thread.** Sprigs or crosses of rowan, often bound with red thread, were put over doors, on byres and in the cattle's tails.
- **The May bush.** In Ireland a branch or small tree, often hawthorn, was set up and decorated with flowers, ribbons and eggshells. (Cutting hawthorn was otherwise unlucky; customs differed by place.)
- **The May dew.** Washing the face in May morning dew brought beauty and health.
- **The first water.** The first water drawn from a well on May morning, "the flower of the well", was prized, and could carry away a neighbour's luck.
- **Butter luck.** It was unlucky to give away fire, milk or salt on May Day, lest the household's luck went with them. Tales tell of butter-stealing witches, sometimes in the shape of hares, skimming the dew or the well to steal the neighbours' butter for the year.
- **Primroses and marigolds** were strewn on doorsteps and windowsills.

## Scotland and the Beltane bannock

In the Highlands a special **Bealltainn bannock** was baked. Thomas Pennant, describing a Beltane gathering in Perthshire in his Tour in Scotland (1769), tells of a caudle of eggs, butter, oatmeal and milk poured on the ground, and of oatcakes with nine knobs, each broken off and thrown over the shoulder with words given to a protector of the herds or to a creature that might harm them, asking it to spare the flocks. Other accounts tell of a cake divided by lot, with one piece blackened, and its taker made to leap the fire.

## Wales and Man

In **Wales**, Nos Galan Mai, May Eve, was another spirit night. May carols, **carolau Mai**, were sung from house to house, and in some places a birch maypole (bedwen Fai) was raised. Calan Mai began the summer, and the summer and winter "fought" in folk plays.

On the **Isle of Man**, crosses of rowan, crosh cuirn, were placed over doors, gorse was burned to drive out witches, and in some places the May Queen and the Queen of Winter fought a mock battle.

## What we don't know

We do not know which gods, if any, were honoured at Bealtaine. The maypole and the May Queen are mostly English customs, found in Wales and Man but not in Gaelic Ireland or Scotland. The modern Wiccan idea of Beltane as a sacred marriage of Goddess and God is not in the Celtic sources.

## A Celtic Bealtaine rite

**With the coven,** outdoors if you can:

1. **On May Eve,** put rowan and red thread over each door, and set up a May bush.
2. **Gather** at the fire. **Sain** with water from a spring.
3. **Kindle** the Bealtaine fire, with words of protection for the summer.
4. **Honour** the land, the ancestors and the gods of the coven, with praise and offerings of milk, butter and bannock.
5. **Walk the fire** sunwise, three times, asking protection for people, animals and homes. Those who wish may carry a candle lit from the fire home.
6. **Share the bannock,** with the first piece given to the fire.
7. **Thanks and closing.**
8. **At dawn,** those who can go out and wash their faces in the dew.

**Alone:** hang rowan and red thread on May Eve, light a candle and walk round it sunwise, bless your home and animals, eat an oatcake with butter, and wash your face in the dew at sunrise.

> **Safety:** Never jump a fire that is more than embers, and never with loose clothing or after drinking. Hawthorn is thorny, and some of its folklore warns against bringing it indoors; follow your coven's custom.

> **Your coven:** Ask your mentor whether your coven keeps Bealtaine with a fire, and whether it walks between two fires or round one.

## What's old and what's modern

- **Old:** the quarter day, Cormac's two fires, and the folk customs of fire, rowan, dew, the May bush, butter luck and the bannock.
- **Modern:** the link with Belenus, and pagan Bealtaine rites to the old gods.`,
    },
    {
      id: 'celtic-lore-lughnasadh',
      title: 'Lughnasadh',
      summary: 'Lughnasadh across the Gaelic world: Lugh and Tailtiu and the Óenach Tailten in the medieval texts, Máire MacNeill’s study of the hill gatherings and Crom Dubh, Garland Sunday, Reek Sunday and Puck Fair, Lùnastal and Laa Luanys, Gŵyl Awst, the first fruits, and a Celtic Lughnasadh rite.',
      minutes: 17,
      links: [holy('celtic/lughnasadh'), deity('lugh'), deity('lleu'), journey('deity-lugh'), seasonal('bilberries'), spread('lammas'), ritual('green-harvesting-herbs-with-thanks'), closed()],
      body: `## The first day of autumn

Lughnasadh, 1 August, is the first day of autumn in the Gaelic year and the start of the harvest: Lúnasa in modern Irish (the name of the month of August), Lùnastal in Scottish Gaelic, Laa Luanys in Manx. In Wales the day is Gŵyl Awst, the feast of August, and in England Lammas, "loaf-mass". For the wider history of Lammas and the harvest, read the Wheel of the Year lesson on Lammas as well. This lesson goes into the Gaelic sources and customs.

## Lugh and Tailtiu

The name means "the assembly of Lugh". Medieval Irish texts say that Lugh founded the **Óenach Tailten**, the assembly at Tailtiu (Teltown, County Meath), as funeral games for his foster-mother Tailtiu, who died after clearing the plains of Ireland for farming. Her labour made the harvest possible; her death is remembered at its beginning. Assemblies were held there at the start of August, with horse races, contests, trading, the settling of laws and the making of marriages. Similar gatherings took place at other royal sites.

In Tochmarc Emire the festival is called Brón Trogain, often understood as "the sorrow of the earth" or "the earth's labour", the land in travail as it gives up its harvest.

Lugh himself is the bright, many-skilled god of Cath Maige Tuired, who came to Tara and was admitted because he alone held every art. Many Celtic pagans honour him at Lughnasadh as master of skills and as the god who wins the harvest.

## MacNeill and the hill gatherings

The great study of this festival is Máire MacNeill's The Festival of Lughnasa (1962). Working through the archives of the Irish Folklore Commission, she found records of summer gatherings at nearly two hundred sites, mostly on hills and mountains or by lakes and rivers, held on the last Sunday of July or the first of August. People climbed, picked bilberries (fraughans), danced, courted, raced horses, held faction fights, and in many places brought home the first new potatoes. She found a recurring story behind many of them: Lugh, or a saint such as Patrick, defeats a dark figure, Crom Dubh, who has held back the harvest, or tames a bull.

MacNeill's work is careful and widely respected, but her reconstruction of a single ancient Lughnasadh myth is interpretive. Use it, and say so.

## The living customs

- **Garland Sunday, Bilberry Sunday, Height Sunday** and many other local names for the hill gatherings, some still kept.
- **Reek Sunday,** the last Sunday of July, when thousands of pilgrims climb Croagh Patrick in County Mayo, some barefoot, in honour of Saint Patrick. It is a Catholic pilgrimage.
- **Puck Fair** at Killorglin, County Kerry, in August, when a wild goat is crowned king of the town for three days. Its origins are argued over.
- **The first fruits:** the first new potatoes dug and eaten with ceremony, a sheaf brought to the table, bread from the new grain.
- **Teltown marriages:** a folk tradition said that couples could be joined at Teltown for a year and a day and part by walking away from each other. It is a nineteenth-century folk memory, not a recorded ancient law.

In **Scotland**, Lammas fairs were held, and in **Man** people climbed hills on the first Sunday of August, Laa Luanys. In **Wales**, Gŵyl Awst was kept with gatherings on hills in some places, and Lammas with bread.

## Respect

Reek Sunday is a Catholic pilgrimage; pilgrims climb as an act of penance and prayer. If you climb Croagh Patrick, climb as a guest among pilgrims, not to hold a pagan rite. Many of the hill gatherings are local community events with their own life. Join in, enjoy them, and don't claim them.

## A Celtic Lughnasadh rite

**With the coven,** on a hill if you can:

1. **Climb together,** at an easy pace, with water, food and a little of the first harvest: new potatoes, a loaf from new flour, berries.
2. **At the top, sain** with water and **kindle** a candle in a jar or lantern (no open fire on hills).
3. **Honour** the land and Tailtiu who cleared it, the ancestors who farmed it, and Lugh, with praise.
4. **First fruits.** Break the bread, share the berries, and leave a small portion on the earth for Tailtiu and the land.
5. **Games.** A race, a contest of skill, a poem or song competition, in Lugh's honour.
6. **Skills.** Each person names a skill they will learn or practise this season, and asks Lugh's help.
7. **Thanks and closing.** Take every scrap of rubbish home.

**Alone:** walk somewhere high, or into your garden; eat the first fruits of the season with a portion given to the earth; name a skill to learn; and do something with your hands in Lugh's honour.

> **Safety:** Hills need proper shoes, water and weather sense. Tell someone where you are going. Pick berries only where it is allowed and where you are sure what they are.

> **Your coven:** Ask your mentor whether your coven climbs a hill at Lughnasadh, and which skills or games it keeps.

## What's old and what's modern

- **Old:** the quarter day, Lugh and Tailtiu and the Óenach Tailten in the medieval texts, and the hill gatherings, bilberries and first fruits in folk custom.
- **Modern:** pagan Lughnasadh rites to Lugh, and the use of MacNeill's reconstruction as a myth for the festival.`,
    },
    {
      id: 'celtic-lore-the-great-stories',
      title: 'The great stories: the Mythological Cycle and the Mabinogi',
      summary: 'A reader’s guide to the stories of the gods: the Lebor Gabála and the invasions of Ireland, Cath Maige Tuired, the Wooing of Étaín and other tales of the Tuatha Dé, the Four Branches of the Mabinogi, Culhwch and Olwen and the Taliesin tradition; what each is, when it was written, and how to read them for practice.',
      minutes: 17,
      links: [deity('dagda'), deity('lugh'), deity('nuada'), deity('morrigan'), deity('rhiannon'), deity('arianrhod'), deity('blodeuwedd'), deity('bran'), deity('cerridwen'), page('library'), journey('path-celtic')],
      body: `## Why read the stories

For a Celtic pagan, the medieval stories are the nearest thing to scripture, though they are not scripture. They are where the gods speak and act. Reading them closely, and more than once, is the best way to come to know the gods and the world-view of the tradition. This lesson is a guide to the main ones.

Scholars sort the Irish tales into four groups: the **Mythological Cycle** (the Tuatha Dé Danann), the **Ulster Cycle** (Cú Chulainn and the Táin), the **Fenian Cycle** (Fionn mac Cumhaill and the Fianna) and the **Cycles of the Kings**. These groupings are modern. For the gods, the Mythological Cycle matters most, though the gods appear in all four.

## Lebor Gabála Érenn

"The Book of the Taking of Ireland" is an eleventh-century compilation, in prose and verse, telling how Ireland was settled by a series of peoples: Cessair before the Flood, then Partholón, Nemed, the Fir Bolg, the **Tuatha Dé Danann**, and finally the sons of Míl, ancestors of the Gaels. It fits Irish tradition into the Bible's history, tracing the Gaels back to Noah.

It is a work of medieval learning, not a pagan myth, and modern scholars read it with great caution. But it keeps the names and kinships of the Tuatha Dé, their arrival in Ireland, and their withdrawal into the síde after they were defeated by the Gaels. It is also the source of the poem known as the Song of Amergin, spoken by the poet of the sons of Míl as he sets foot in Ireland: "I am a wind on the sea, I am a wave of the ocean...". Its meaning and age are debated.

## Cath Maige Tuired

"The Second Battle of Mag Tuired" survives in a sixteenth-century manuscript, in language that suggests an earlier text, perhaps of the ninth to twelfth centuries. It is the great story of the gods: the Tuatha Dé under the oppressive half-Fomorian king Bres; the healing of Nuada's hand; the arrival of Lugh at Tara, master of every art; the Dagda's labours and his meeting with the Morrígan at Samhain; the preparations, in which each god promises their craft; the battle, in which Lugh slays Balor of the baleful eye; and the Morrígan's prophecies at the end, one of peace and one of the end of the world.

If you read only one Irish tale, read this one.

## Other tales of the Tuatha Dé

- **Tochmarc Étaíne,** "the Wooing of Étaín": the love of Midir of the síd for Étaín, her transformation into a fly, her rebirth as a mortal woman and Midir's winning her back. It includes the druid Dalán's use of ogham on yew wands to find her.
- **Aislinge Óenguso,** "the Dream of Aengus": Aengus falls in love with a woman in a dream and finds her, Caer, as a swan at Samhain.
- **Oidheadh Chlainne Lir,** "the Fate of the Children of Lir": the children turned into swans for nine hundred years. It is a later medieval tale, with a Christian ending.
- **The Dindshenchas,** the lore of places: poems and prose explaining place-names, full of gods and goddesses, including Boann and the Boyne.

## The Four Branches of the Mabinogi

The Four Branches are the great Welsh stories, in manuscripts of around 1350 and 1400, probably composed in the eleventh or twelfth century by one or more skilled authors.

- **Pwyll, Prince of Dyfed:** Pwyll trades places for a year with Arawn, king of Annwn; Rhiannon rides out of the Otherworld to choose him; their son Pryderi is stolen, and Rhiannon is falsely accused and punished, until he is found.
- **Branwen, daughter of Llŷr:** Branwen's marriage to the king of Ireland, her mistreatment, Brân the Blessed's war, the cauldron of rebirth, and Brân's head, which keeps his companions company for eighty years.
- **Manawydan, son of Llŷr:** Manawydan and Rhiannon, an enchantment that empties Dyfed, and patience and craft that win it back.
- **Math, son of Mathonwy:** Gwydion's trickery, Arianrhod's curses on her son Lleu, the making of Blodeuwedd from flowers, her betrayal of Lleu, and her transformation into an owl.

## Other Welsh sources

- **Culhwch and Olwen,** perhaps the oldest Arthurian tale, full of Otherworld figures and impossible tasks.
- **The Book of Taliesin,** a manuscript of the fourteenth century with poems of various dates, including Preiddeu Annwfn, "the Spoils of Annwn", in which Arthur sails to the Otherworld for a cauldron.
- **Hanes Taliesin,** the story of Cerridwen, Gwion Bach and the birth of Taliesin, in sixteenth-century versions.
- **Trioedd Ynys Prydein,** "the Triads of the Island of Britain", lists of three that preserve names and story-fragments, many now lost.

## How to read them

1. **Read a good modern translation,** with notes, and if possible a retelling first to learn the plot.
2. **Read slowly,** and keep a list of names and kin.
3. **Notice what is strange.** The odd, unexplained details are often the oldest or most revealing.
4. **Ask what it shows of the gods:** what they do, value and refuse.
5. **Remember the authors:** Christians, often learned, writing for their own audiences.
6. **Don't flatten the story** into an allegory or a set of archetypes. Let it be what it is.
7. **Read it aloud,** as these stories were once told.

> **Your coven:** Ask your mentor which stories your coven reads together, and which translations it prefers.

> **Try this:** Read Cath Maige Tuired or the First Branch of the Mabinogi in full. In your book, list the gods who appear, one thing each does, and the strangest detail you noticed.

## What's old and what's modern

- **Old:** the stories themselves, as written by medieval authors, and the older material they may preserve.
- **Modern:** the four "cycles" of scholarship, and reading the tales as sources for a living religion.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-celtic-lore',
      title: 'The Celtic year and its stories: test',
      intro: 'Fourteen questions on the Gaelic year, the four fire festivals and the great stories. You can take it before the year is out. Most are scored at once; your mentor reads the written answers. You need 80% to pass, and you can try again.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'When does a Gaelic festival begin?',
          options: ['At dawn on the day', 'At sunset the evening before', 'At noon', 'At midnight'],
          correct: [1],
          points: 1,
          explanation: 'The eve belongs to the feast: Caesar notes the Gauls counted by nights, and Irish custom keeps the night before.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'Which tale names the four quarter days, calling Lughnasadh Brón Trogain?',
          options: ['The Mabinogi', 'Tochmarc Emire (the Wooing of Emer)', 'Carmina Gadelica', 'Lebor Gabála'],
          correct: [1],
          points: 1,
          explanation: 'In Tochmarc Emire, Emer names Samain, Imbolc, Beltaine and Brón Trogain in her riddles to Cú Chulainn.',
        },
        {
          id: 'q3',
          type: 'truefalse',
          prompt: 'The eight-festival Wheel of the Year, with solstices and equinoxes, is an ancient Celtic calendar.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. It is a twentieth-century creation. The Gaelic year turned on four quarter days; Midsummer fires were a folk feast of Saint John.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'In Echtra Nerai, what happens on Samhain night?',
          options: ['Lugh founds an assembly', 'Nera follows a host of the síd into their mound', 'Brigid lights the Kildare fire', 'Pwyll meets Rhiannon'],
          correct: [1],
          points: 1,
          explanation: 'Nera goes out on Samhain night and enters the síd of Crúachan: the Otherworld is open.',
        },
        {
          id: 'q5',
          type: 'multi',
          prompt: 'Which Samhain customs are recorded in folk tradition? Choose all that apply.',
          options: ['Guising from house to house', 'Divination with apples and nuts', 'A place left at the table for the dead', 'Druid sacrifices to a god called Samhain'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Guising, divination and the dead are well recorded. A death god called Samhain and druid sacrifices at Samhain are modern errors.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'What is the honest answer about how the goddess Brigid and Saint Brigid are related?',
          options: ['The saint never existed', 'It is debated and cannot be proved either way', 'The saint is certainly the goddess in disguise', 'They have nothing in common'],
          correct: [1],
          points: 1,
          explanation: 'Scholars disagree. A Celtic pagan honours the goddess and treats the saint and her devotees with respect.',
        },
        {
          id: 'q7',
          type: 'multi',
          prompt: 'Which are recorded Imbolc customs? Choose all that apply.',
          options: ['Weaving Brigid’s crosses', 'Leaving out the brat Bríde overnight', 'Making Brigid’s bed by the hearth', 'Crowning a goat king'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Crosses, the brat Bríde and Brigid’s bed are Imbolc customs. The goat king is Puck Fair, in August.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'What does Cormac’s Glossary describe at Bealtaine?',
          options: ['A maypole dance', 'Two fires made by druids, with cattle driven between them against disease', 'A sacred marriage', 'A harvest race'],
          correct: [1],
          points: 1,
          explanation: 'The glossary describes two fires and cattle driven between them. It was written by a Christian scholar long after the druids.',
        },
        {
          id: 'q9',
          type: 'truefalse',
          prompt: 'Most scholars agree that Bealtaine means “the fire of the god Bel”.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. Most scholars doubt the link with Belenus; the name probably means “bright” or “lucky fire”.',
        },
        {
          id: 'q10',
          type: 'multi',
          prompt: 'Which Bealtaine customs protect the household and herds? Choose all that apply.',
          options: ['Rowan and red thread over doors and byres', 'Driving cattle past the fire', 'Giving fire, milk and salt away freely on May Day', 'Relighting the hearth from the bonfire'],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Giving fire, milk or salt away on May Day was thought to give away the household’s luck.',
        },
        {
          id: 'q11',
          type: 'single',
          prompt: 'According to the medieval texts, why did Lugh found the assembly at Tailtiu?',
          options: ['To celebrate his victory over Balor', 'As funeral games for his foster-mother Tailtiu, who cleared the plains for farming', 'To mark the solstice', 'To crown a goat'],
          correct: [1],
          points: 1,
          explanation: 'The Óenach Tailten honoured Tailtiu, whose labour made the harvest possible.',
        },
        {
          id: 'q12',
          type: 'single',
          prompt: 'Which tale tells of Lugh’s arrival at Tara and the battle against the Fomoire?',
          options: ['The Fourth Branch of the Mabinogi', 'Cath Maige Tuired', 'Culhwch and Olwen', 'The Children of Lir'],
          correct: [1],
          points: 1,
          explanation: 'Cath Maige Tuired, the Second Battle of Mag Tuired, is the great story of the Irish gods.',
        },
        {
          id: 'q13',
          type: 'short',
          prompt: 'Choose one festival you kept this year. Describe one recorded custom you kept, where it was recorded, and how you kept it with respect for the people who still keep it.',
          points: 3,
          explanation: 'Keeping the old customs well means knowing where they come from and who keeps them now.',
          rubric: 'Full marks (3): names a festival and a specific custom they actually kept (1); accurately names where it was recorded, such as Ireland, Scotland, Man or Wales, or a source (1); shows awareness of its living (often Christian) keepers and how they acted respectfully (1).',
        },
        {
          id: 'q14',
          type: 'short',
          prompt: 'Name one god from Cath Maige Tuired or the Four Branches, and describe what they do in the story and what it shows you of them.',
          points: 2,
          explanation: 'The stories are where the gods act.',
          rubric: 'Full marks (2): names a god and accurately describes something they do in the named story (1); draws a thoughtful point about the god from it, beyond a one-word label (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'The Celtic year',
      intro: 'The Gaelic year turns on four fire festivals: Samhain at summer’s end, Imbolc and Brigid at the first stirring of spring, Bealtaine at summer’s start, and Lughnasadh at the harvest. Here you learn the shape of the year and the great stories, and keep each festival as it comes, reading its Celtic lesson and its Wheel of the Year lesson beforehand. A full turn takes a year.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'The Gaelic year',
          kind: 'study',
          instructions: `1. Read "The Gaelic year: four quarter days", and "The turning year" from the Wheel of the Year course for comparison.
2. Do the "Try this": draw the Gaelic year in your book.
3. In the answer box, write which festivals your coven keeps, whether it begins them at sunset, and whether it keeps them by date or by the land, after asking your mentor.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['celtic-lore-the-gaelic-year', 'wheel-lore-the-turning-year'],
          links: [page('calendar'), spread('year-ahead')],
        },
        {
          title: 'Read a great story',
          kind: 'study',
          instructions: `1. Read "The great stories: the Mythological Cycle and the Mabinogi".
2. Read Cath Maige Tuired or the First Branch of the Mabinogi in full, in a good translation.
3. In the answer box, list the gods who appear, one thing each does, and the strangest detail you noticed.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['celtic-lore-the-great-stories'],
          links: [page('library'), deity('lugh')],
        },
        ...festivals.map(festivalTask),
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Read "The Gaelic year" again, and the lessons for any festivals you haven't kept yet.
2. Take the test. You can take it before the year is out; the choice questions are scored at once and your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed, talk to your mentor, and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 35,
          docs: ['celtic-lore-the-gaelic-year'],
          quiz: 'quiz-celtic-lore',
          links: [closed(), journey('path-celtic')],
        },
      ],
    },
  ],
} satisfies CourseModule;
