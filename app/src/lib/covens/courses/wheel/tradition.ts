// The eclectic Wheel of the Year as a tradition: what an eclectic seasonal
// practice is, how the eight-fold Wheel was assembled in the twentieth century
// (Murray, Gardner, Nichols, Kelly), the festivals' many roots, the powers an
// eclectic coven may honour (and borrowing well), the land and seasons where
// you actually live (the southern hemisphere included), and how a Wheel coven
// works. Not Wicca. British spelling.

import type { CourseModule } from '../types';
import { closed, coven, deity, holy, journey, page, ritual } from '../linkHelpers.ts';

export default {
  id: 'wheel-tradition',
  title: 'The Wheel of the Year as a practice',
  docs: [
    {
      id: 'wheel-tradition-what-it-is',
      title: 'What an eclectic Wheel practice is',
      summary: 'What it means to keep the Wheel of the Year as an eclectic, non-Wiccan practice: its centre (the seasons and the land), its freedoms, its responsibilities, and the vocabulary you will hear.',
      minutes: 15,
      links: [journey('path-wheel'), page('calendar'), page('green-season'), closed()],
      body: `## A practice built on the year

The Wheel of the Year is a way of living with the seasons. Its practitioners mark eight festivals, roughly six and a half weeks apart, and between them they pay attention to what the land, the sky and their own lives are doing. Over years, the festivals become a frame: a way of noticing time, of celebrating, grieving and beginning again at the right moments.

Many people keep the Wheel. Wiccans keep it as their sabbats. Druids keep it, often with Welsh names. Many Heathens keep some of the festivals with their own. Christians with a love of folk custom keep Candlemas, May Day, Lammas, Michaelmas and All Hallows. And a great many people keep it as an **eclectic** practice: not belonging to any one religion, drawing honestly on several, and shaped by their own land.

That last way is what your coven keeps, and what this course teaches.

## What "eclectic" means

"Eclectic" comes from a Greek word meaning "to pick out" or "to choose". An eclectic practitioner chooses from more than one source. That can be done well or badly.

**Done badly**, eclecticism is a magpie habit: grabbing a god from one culture, a ritual from another and a sacred object from a third, with no idea what any of them meant to the people who kept them, and sometimes taking things that were never offered. It produces muddled practice and real harm to living communities.

**Done well**, eclecticism is careful and honest. You learn where each thing comes from. You choose what is open to you and leave what is not. You say plainly what is old, what is folk custom and what you have made up. You build something coherent, and you keep learning.

This course aims at the second kind. You will learn the festivals' many roots so that you can choose well.

## What is at the centre

Every religion has a centre: a god, a book, a lineage, a law. The eclectic Wheel's centre is simpler and wider: **the turning year, and the land you live on**. Everything else is built around that.

That means:

- **The seasons come first.** A festival is kept because the year has reached a point, not because a text commands it.
- **Your own land matters.** The festival of first harvest means something different in a wheat-growing valley, a city flat and a southern-hemisphere suburb. You learn to read your own place.
- **The powers are many and optional.** Members may honour gods of many pantheons, a single god, the spirits of the land, their ancestors, or no beings at all. A coven makes room for all of these in its rites.
- **Practice comes before belief.** You keep the festivals, and over time you discover what they mean to you.

## What it is not

- **It is not Wicca.** Wicca is a specific religion founded in England in the 1940s and 1950s, with its own theology (a Goddess and a God), its own ethic (the Wiccan Rede) and, in its traditional forms, its own initiatory lineages and secret rites. Its eight sabbats share their dates with the Wheel because the Wheel grew up alongside it. You can learn from Wicca, and some of its practices are offered in this course as options. You are never required to accept its beliefs.
- **It is not "the ancient Celtic religion".** The festivals have ancient parts, but the eight-fold Wheel is modern. The next lesson tells that story honestly.
- **It is not nature worship by rule.** Some members do understand the earth as sacred in itself; others do not. What is shared is attention and respect.
- **It is not anything goes.** It has ethics: honesty about sources, care for the land, consent and respect for others, and refusing to take what belongs to closed and living traditions.

## The vocabulary

You will hear these words often. Each is explained more fully later in the course.

- **Festival** or **sabbat:** one of the eight days of the Wheel. "Sabbat" is the Wiccan word, borrowed from old witch-trial accusations; many eclectic practitioners prefer "festival" or "holy day". Your coven will have its preference.
- **Quarter days:** the solstices and equinoxes. Confusingly, in old English and Scottish usage, "quarter days" were legal rent days such as Lady Day and Michaelmas.
- **Cross-quarter days:** the four festivals between the solstices and equinoxes: Imbolc, Beltane, Lughnasadh and Samhain.
- **Esbat:** a gathering at the full or new moon, a word taken from Wicca and widely used.
- **Land spirits:** the spirits of a particular place, honoured in many folk traditions.
- **Ancestors:** those who came before you, by blood, by adoption, by craft or by place.
- **The beloved dead:** people you knew who have died.
- **Offering:** a gift given to a power: food, drink, flowers, song, time, work.

> **Your coven:** Covens differ in their words: some say "sabbat", others "festival"; some call the Wheel's days by Gaelic names, others by English ones. Ask your mentor which your coven uses and why.

## The freedoms and the responsibilities

An eclectic practice gives you real freedom. You will not be told what to believe. You may honour the gods you are drawn to, keep the customs that speak to you, and make new ones. You may change your mind.

With that freedom comes responsibility:

1. **Learn before you borrow.** Find out where a practice comes from and what it meant.
2. **Respect what is closed.** Some traditions are not open to outsiders, or only through initiation or community. The Sanctuary's closed and living traditions guide explains which, and why.
3. **Be honest about invention.** Writing a new rite is a good thing. Calling it ancient is not.
4. **Care for the land.** Your practice depends on the living world. Never harm it for the sake of a rite.
5. **Respect your coven-mates.** In an eclectic coven, the person beside you may honour different powers. Make room.

> **Safety:** A practice without fixed rules can sometimes be bent by an unhealthy leader. A healthy eclectic coven still has clear agreements about consent, money, confidentiality and leaving. If anyone uses "it's all personal" to excuse pressure or harm, talk to someone you trust.

## What's old and what's modern

- **Old:** the festivals' roots, folk customs, honouring the land and the dead.
- **Modern:** eclectic paganism as a way of practice (from the 1960s and 1970s), and the ethics of borrowing well that it has learned, sometimes painfully, since.`,
    },
    {
      id: 'wheel-tradition-how-the-wheel-was-made',
      title: 'How the Wheel was assembled',
      summary: 'The honest history of the eight-fold Wheel: Margaret Murray’s four sabbats, Gerald Gardner’s coven, Ross Nichols and the Druids adding the solstices and equinoxes in the 1950s, and Aidan Kelly naming Litha, Ostara and Mabon in the 1970s.',
      minutes: 18,
      links: [journey('path-wheel'), closed('initiatory-wicca'), deity('eostre'), holy('wheel/mabon'), holy('wheel/ostara'), holy('wheel/litha')],
      body: `## Why the story matters

Many books and websites say the Wheel of the Year is the ancient pagan calendar of the Celts, or of all northern Europe. It is not. Knowing how it really came together does not spoil it. It frees you: you can love the festivals for what they are, keep the old parts with respect, and feel at liberty to build your own, as the people who made the Wheel did. This lesson draws on the work of historians, especially Ronald Hutton, whose books The Stations of the Sun and The Triumph of the Moon are the best places to read further.

## The old pieces

Long before anyone spoke of a Wheel, the pieces existed separately.

- **The Gaelic quarter days.** Early Irish literature, written down from about the 8th century onward, names four great festivals that began the seasons: Samhain (1 November), Imbolc (1 February), Bealtaine (1 May) and Lughnasadh (1 August). They are well recorded in Ireland, Scotland and the Isle of Man, with customs that lasted into living memory.
- **The solstices and equinoxes.** People have watched the sun's turning points for thousands of years. Newgrange in Ireland, built around 3200 BCE, lets the rising sun into its chamber at the winter solstice. We do not know what its builders believed.
- **Anglo-Saxon month names.** In 725 the English monk Bede wrote about the old English months. He mentions Modraniht, "mothers' night", at midwinter; months called Litha around midsummer; and a month named for a goddess, Eostre, around the spring equinox. He is the only source for Eostre.
- **Folk customs.** Across Britain and Europe, people kept midsummer fires on St John's Eve, brought in May blossom, baked the first loaf at Lammas, held harvest suppers and kept Hallowe'en. Many of these were kept on church holidays and are recorded from the Middle Ages to the twentieth century.

No source joins all of these into one eight-fold cycle.

## Margaret Murray's four sabbats

In 1921 the Egyptologist Margaret Murray published The Witch-Cult in Western Europe. She argued that the people accused of witchcraft in early modern Europe had been members of a surviving pagan fertility religion, which met at four great "sabbats": Candlemas (2 February), May Eve, Lammas (1 August) and Hallowe'en. Her theory was popular for decades. Historians have since shown that it does not fit the evidence: the trial records do not describe an organised pagan religion, and Murray read them selectively. But her four sabbats shaped what came next.

## Gerald Gardner and the 1950s

Gerald Gardner, a retired civil servant, made public in the early 1950s the religion that became known as Wicca, which he said he had been initiated into in 1939. His coven, meeting near St Albans, kept Murray's four great sabbats.

In the late 1950s, members of the coven asked for the solstices and equinoxes to be celebrated too. Gardner was close friends with **Ross Nichols**, a fellow member of a naturist club and later founder of the Order of Bards, Ovates and Druids. Druid groups were already gathering at the solstices and equinoxes; Nichols was interested in adding the Gaelic fire festivals to the Druid year. Around 1958, both groups came to keep all eight. The friendship and conversation of these two men is the best-supported origin of the eight-fold cycle as we know it.

The phrase "Wheel of the Year" came into common use later, in the 1970s and 1980s, as books spread the practice.

## Aidan Kelly's names

For a while the solstices and equinoxes had no special names; they were simply "the summer solstice" and so on, or carried Christian names such as Midsummer. In the early 1970s the American pagan **Aidan Kelly**, preparing a calendar for his own tradition, gave them names:

- **Litha** for the summer solstice, from Bede's month name.
- **Ostara** for the spring equinox, from Jacob Grimm's 1835 German form of Bede's Eostre.
- **Mabon** for the autumn equinox, from Mabon ap Modron, a figure in Welsh legend. Kelly later said he chose it because he wanted a name that sounded right; there is no old link between Mabon and the equinox.

Kelly's names spread through books and calendars and are now used everywhere. Yule was already in use, from the old English and Norse midwinter.

## The Druid names

You will also meet the names Alban Arthan (winter solstice), Alban Eilir (spring equinox), Alban Hefin (summer solstice) and Alban Elfed (autumn equinox). These come from the writings of Edward Williams, known as Iolo Morganwg, a Welsh poet and antiquarian of the late 18th and early 19th centuries who was a brilliant writer and a notorious forger of "ancient" Welsh lore. Modern Druids use them knowing their source.

## What this means for you

1. **The Wheel is a modern creation from old materials.** Every part has its own age and story. When you keep a festival, you can ask of each custom: how old is this, and where does it come from?
2. **The names are choices.** Your coven may use Kelly's names, Gaelic names, English names (Candlemas, May Day, Lammas, Harvest Home, Hallowe'en), Druid names, or simply "the spring equinox". None is more ancient than the others in the way people often claim.
3. **Making new practice is part of the tradition.** The Wheel exists because people in the 1950s and 1970s built something meaningful from what they had. You are invited to do the same, honestly.
4. **Wicca is a sibling, not a parent you must obey.** The Wheel grew up alongside Wicca, and much shared practice comes from it. Some Wiccan rites are oathbound in their traditional forms and are not taught outside their covens; you should not expect to find them in an eclectic course.

> **Note:** Some older books still teach that the witch trials killed nine million people, or that the Wheel is an unbroken pagan survival. Both are wrong. Estimates of executions for witchcraft in Europe are around 40,000 to 60,000, a terrible enough number. Honest history honours the dead better than inflated history.

> **Try this:** Choose one festival. Find its page in the app and read its history. In the answer box for this module's reading task, write which of its parts are old, which are folk custom and which are modern, as far as you can tell.

## What's old and what's modern

- **Old:** the Gaelic festivals, the noticing of solstices, Bede's month names, folk customs.
- **Modern:** Murray's theory (1921), Gardner's coven and Nichols' Druids keeping eight festivals (late 1950s), "Wheel of the Year" as a phrase, and Kelly's names (1970s).`,
    },
    {
      id: 'wheel-tradition-the-roots',
      title: 'The many roots of the festivals',
      summary: 'Four streams that feed the Wheel, each with its own evidence: the Gaelic fire festivals, Anglo-Saxon and Germanic midwinter and spring, the astronomy of the sun’s turning points, and the folk and church customs of the British and European year.',
      minutes: 18,
      links: [holy('celtic/la_fheile_bride'), holy('celtic/bealtaine'), holy('celtic/lughnasadh'), holy('celtic/samhain_gaelic'), holy('norse/jol'), holy('christian/candlemas'), holy('christian/lammas'), holy('christian/st_john'), page('folk-calendar')],
      body: `## Four streams

The eight festivals did not come from one place. It helps to think of four streams that flow together into the Wheel. Each has its own sources, and each gives you different things to draw on. When your coven keeps a festival, it will usually be drinking from more than one.

## The first stream: the Gaelic fire festivals

The four cross-quarter days come from the calendar of the Gaels: the Irish, the Scots of the Highlands and islands, and the Manx. Early Irish texts, especially tales and law texts written down by Christian monks from the 8th century onward, describe four festivals that began the seasons:

- **Samhain** (around 1 November): the beginning of winter and probably of the year; a time of assemblies, feasting, and stories of the Otherworld opening.
- **Imbolc** (around 1 February): the beginning of spring, later the feast of St Brigid. The meaning of the name is uncertain; a 10th-century glossary links it to ewes' milk.
- **Bealtaine** (around 1 May): the beginning of summer. The same glossary says cattle were driven between two fires for protection.
- **Lughnasadh** (around 1 August): the harvest festival, said in legend to have been founded by the god Lugh in memory of his foster-mother Tailtiu.

These festivals lived on as folk custom into the nineteenth and twentieth centuries: Brigid's crosses and the Brídeóg at Imbolc, May bonfires and May dew, hilltop gatherings and bilberry-picking at the start of August (studied by the folklorist Máire MacNeill in The Festival of Lughnasa), and Hallowe'en guising and divination. The Sanctuary's Celtic calendar keeps them under their Gaelic names.

What we do not know: the details of pre-Christian religious practice at these festivals. Monks wrote the texts long after conversion, and much folk custom was kept within a Christian frame.

## The second stream: Anglo-Saxon and Germanic

From the English and their Germanic cousins come two festivals' names and some of their feel:

- **Yule.** The old English and Norse midwinter season was called by forms of this name (Old English geola, Old Norse jól). Bede tells us the pagan English year began at midwinter with Modraniht, "mothers' night". Norse sources describe midwinter feasting and sacrifice. Many Christmas customs later gathered around the season.
- **Eostre.** Bede says the month around the spring equinox was named for a goddess Eostre, whose festival had been held then. That single sentence is all the evidence there is. The English word Easter comes from the same root. Whether Eostre was a widely worshipped goddess, a local one, or Bede's guess, scholars still debate.
- **Litha.** Bede's name for the months around midsummer. We know the name, not what was done.
- **Hlafmæsse.** "Loaf mass", the Anglo-Saxon festival of first bread on 1 August, recorded in the 10th century, which became Lammas.

The Sanctuary's Norse calendar keeps Jól and other Heathen festivals in their own right.

## The third stream: the sun's turning points

The solstices and equinoxes are astronomy, not culture. The sun really does stand still at its northern and southern limits; day and night really are nearly equal at the equinoxes. Neolithic monuments such as Newgrange, Maeshowe and Stonehenge are aligned to solstice sunrises or sunsets. Midsummer fires on St John's Eve were among the most widespread folk customs in Europe, from Ireland to Russia, and Christmas sits near the winter solstice.

The equinoxes are the thinnest stream. Apart from Easter's link to the spring equinox and harvest customs around the autumn one, there are few traditional folk festivals at the equinoxes in Britain and Ireland. Modern practitioners have built a great deal there, and it is honest to say so.

## The fourth stream: folk and church customs

Much of what people do at the Wheel's festivals comes from the folk year of Britain and Europe, often kept on church holidays:

- **Candlemas** (2 February): blessing candles, weather lore.
- **May Day:** maypoles, May garlands, May queens, Jack-in-the-Green, gathering May blossom and washing in May dew.
- **St John's Eve** (23 June): midsummer fires, rolling burning wheels, gathering St John's wort.
- **Lammas** (1 August): the first loaf.
- **Harvest Home:** harvest suppers and the last sheaf, made into a corn dolly; the church harvest festival began in 1843 in Cornwall.
- **Michaelmas** (29 September): geese, the end of blackberrying, rent day.
- **All Hallows' Eve, All Saints and All Souls** (31 October to 2 November): candles for the dead, soul cakes, turnip lanterns.

These customs are real and well recorded. Whether any of them "is really pagan underneath" is usually impossible to say, and often the answer is that they were Christian folk customs all along. You can keep them with love either way.

## Beyond these streams

Covens also draw from further afield: Roman festivals such as the Saturnalia at midwinter or the Floralia in spring; Slavic Kupala Night at midsummer; Greek myths of Demeter and Persephone at the equinoxes. The Sanctuary keeps those traditions' own calendars. Drawing on them is fine when done with knowledge and respect, as long as you remember that each belongs to its own tradition too.

> **Note:** When you read that a custom is "pagan", ask: who says so, and on what evidence? Victorian folklorists often assumed every rural custom was a pagan survival. Many were not.

> **Your coven:** Ask your mentor which streams your coven draws on most. Some Wheel covens lean Gaelic, some English, some Druidic, some are thoroughly mixed.

## What's old and what's modern

- **Old:** the Gaelic festivals, Yule and Bede's months, solstice alignments, the folk and church year.
- **Modern:** joining them as one wheel, and many equinox customs.`,
    },
    {
      id: 'wheel-tradition-the-powers',
      title: 'The powers you may honour, and borrowing well',
      summary: 'Who an eclectic Wheel coven may honour (gods of many pantheons, the spirits of the land, the ancestors, the seasons themselves, or none) and how to choose and borrow with knowledge, respect and honesty about closed traditions.',
      minutes: 16,
      links: [page('patron'), page('journeys'), closed(), deity('brigid'), deity('lugh'), deity('cernunnos'), deity('eostre'), page('ancestors')],
      body: `## Who is honoured

In many traditions, the question "who do we worship?" has one answer. In an eclectic Wheel coven it has several, and members may give different answers standing side by side in the same rite. This lesson describes the common ones, and how to choose and borrow well.

## The seasons and the turning year

Some practitioners honour no beings at all. For them, the Wheel is a way of living in harmony with the year: the solstice is the solstice, and marking it is enough. This is sometimes called naturalistic or humanistic paganism. It is a full and respectable way to keep the Wheel, and a coven should make room for it. A rite that says "we welcome the season of first harvest" includes everyone.

## The land and its spirits

Many folk traditions treat places as alive, or as inhabited by spirits: the fairy folk of Irish and Scottish lore, the house spirits and field spirits of Slavic and Scandinavian custom, the genius loci of Roman religion. Modern practitioners often honour **the spirits of the land** where they live: the spirit of a hill, a river, a garden, a street tree.

You do not need to know their names. You need to pay attention, offer respect, give small gifts that do the land no harm, and ask before you take. The devotion module teaches this in practice.

## The ancestors

Almost every human culture has honoured its dead. In the Wheel, Samhain is the great feast of the dead, but the ancestors can be honoured all year. Your ancestors may be:

- **of blood:** your family line, known and unknown;
- **of heart:** people who raised or loved you, by adoption or choice;
- **of craft:** those who did your work or kept your path before you;
- **of place:** those who lived on your land before you.

Not everyone's family was kind. You are never obliged to honour someone who harmed you. You can honour the ancestors as a whole, or only the ones you choose.

## Gods

Many members honour gods. In an eclectic coven these may come from different pantheons:

- **Gods tied to the festivals' roots**, such as Brigid at Imbolc or Lugh at Lughnasadh, both from Irish tradition; Eostre at the spring equinox, from Bede's single line.
- **Gods of the season** from other traditions: Demeter and Persephone at the harvest and the equinoxes, Freyr at midsummer, Saturn at midwinter.
- **Gods a member is drawn to personally**, for their own reasons.
- **A God and Goddess pair**, as in Wicca. Some members of eclectic covens keep this view; it is an option, not the coven's creed.

The Sanctuary's Living Library has pages for many gods, with honest notes on what is known about them, and dedication journeys for those who want to build a deeper relationship.

## Mixing in one rite

How can a rite honour Brigid, the spirits of the land and the turning year at once, when the people present believe different things? In practice, eclectic covens manage this in a few ways:

- **Welcoming broadly:** "we welcome the spirits of this place, our ancestors, and the gods each of us honours."
- **Taking turns:** each festival focuses on the powers most connected with it.
- **Personal offerings:** each member makes their own offering to whom they choose, in silence or aloud.
- **Agreeing a coven's powers:** some covens agree on a small set they honour together, while members keep their own at home.

> **Your coven:** Ask your mentor how your coven welcomes the powers in its rites, and whether it honours particular gods together.

## Borrowing well

The Wheel invites you to draw on many traditions. Here is how to do it with integrity.

1. **Learn the source.** Before honouring a god or using a practice, read about where it comes from: the culture, the evidence, how it is kept today. The Library and journeys are a good place to start.
2. **Ask whether it is open.** Many traditions welcome anyone who comes with respect: the Greek, Roman, Norse and Irish gods are honoured by people of every background. Some are **closed**: they belong to a particular people, or are passed on only within a community or by initiation. Examples include many Indigenous ceremonies, the sweat lodge, the vision quest, smudging as a named ceremony of particular nations, Vodou and Santería (Lucumí) practices that require initiation, and the oathbound rites of traditional initiatory Wicca. The Sanctuary's closed and living traditions guide explains which are closed and why.
3. **Keep living traditions' context.** If a tradition is still practised by living people, it is theirs before it is yours. Read what its own practitioners say.
4. **Name things truly.** If you burn a bundle of garden sage or rosemary to cleanse a space, call it "cleansing with smoke", not "smudging", which in North America names particular Indigenous ceremonies.
5. **Don't build on fakes.** Avoid gods and customs known to be invented and passed off as ancient, unless you know that and choose them anyway.
6. **When in doubt, ask.** Ask your mentor, and where you can, ask practitioners of the tradition itself.

> **Safety:** Be cautious of any group that tells you a closed practice has been "given" to it in secret, or that sells initiation into a closed tradition. Real living traditions protect their sacred practices through community, not through payments to outsiders.

## Choosing your own

You do not have to decide quickly whom you honour. Many people spend a year or more keeping the festivals and paying attention before any particular god becomes important to them. Some never do. If you feel drawn to a particular power, the devotion module teaches how to begin a relationship carefully, and how to tell real connection from wishful thinking.

## What's old and what's modern

- **Old:** honouring land spirits, ancestors and the gods of particular peoples; seasonal deities.
- **Modern:** honouring gods of many pantheons in one coven, naturalistic paganism, and the explicit ethics of borrowing from open traditions only.`,
    },
    {
      id: 'wheel-tradition-your-land',
      title: 'Your land, your seasons, and the southern hemisphere',
      summary: 'Why the Wheel must fit where you live: learning your own land’s year, festivals that don’t match your climate, the southern hemisphere’s turned wheel, and building a personal seasonal calendar.',
      minutes: 16,
      links: [page('green-season'), page('folk-calendar'), page('calendar'), page('moon'), ritual('green-land-spirit-garden-offering'), ritual('hedge-hearing-the-land-walk')],
      body: `## A wheel made for one place

The Wheel's festivals grew up in the climate of Ireland, Britain and north-western Europe. Imbolc's first lambs, Beltane's hawthorn blossom, Lughnasadh's ripe grain and Samhain's falling leaves are the seasons of that place. If you live there, they fit well. If you live in Arizona, Queensland, Singapore or the north of Norway, they may fit poorly or not at all.

An eclectic Wheel practice takes this seriously. Its centre is not the British climate; it is the turning year **where you are**. Part of becoming a practitioner is learning your own land's year and letting it shape your festivals.

## Learning your land's year

You probably know more than you think, and you will learn more by watching. Over a year, keep notes on:

1. **Light:** sunrise and sunset times, how high the sun climbs at noon, how long the evenings are. The app's sky page shows these.
2. **Weather:** first frost, last frost, rainy seasons, dry seasons, storms, heat.
3. **Plants:** the first flowers, when trees come into leaf, when fruit ripens, when leaves fall. Pick three plants near you and watch them all year.
4. **Animals:** birds arriving and leaving, insects appearing, mating calls, nesting, hibernation.
5. **Human life:** school terms, harvests, local festivals, fishing seasons, holidays.
6. **Your own body and mood:** when you feel energetic, when you slow down.

After a year you will have your land's own calendar. Many people find it more meaningful than any book.

> **Try this:** Choose three living things you can see often: a tree, a plant, a bird. Note them in the app every week for the next three months. The devotion module returns to this.

## When the festivals don't fit

What should you do if the festival says "first stirrings of spring" and your garden is under a metre of snow, or "falling leaves" and nothing falls where you live? There are several honest approaches, and covens choose differently:

- **Keep the meaning, change the signs.** Imbolc is about the first sign that the dark is ending. Look for your own first sign: the first evening the light lasts past five, the first bird song before dawn.
- **Keep the astronomy.** The solstices and equinoxes happen everywhere. Their light is real wherever you are.
- **Move the festival.** Some practitioners keep Beltane when their own hawthorn or equivalent blooms, not on a fixed date. Some keep the first harvest when their local harvest begins.
- **Keep the old dates for their story.** Some keep the British dates as a link to the festivals' history, while honouring their own land's year alongside.

## The southern hemisphere

South of the equator the seasons are reversed: midwinter is in June and midsummer in December. Most practitioners in Australia, New Zealand, South Africa and South America turn the Wheel by six months, so that the festivals fit the seasons:

- Samhain at the end of April or start of May;
- Yule at the June solstice;
- Imbolc at the start of August;
- the spring equinox in September;
- Beltane at the end of October or start of November;
- Litha at the December solstice;
- Lughnasadh at the start of February;
- the autumn equinox in March.

This was taken up from the 1980s onward and is now the usual practice. The Sanctuary keeps a separate southern Wheel calendar with these dates, and a coven can choose it.

Some southern practitioners keep the northern dates instead, for their history or to stay in step with northern friends, or keep a mixture. A complication: Christmas falls at midsummer in the south, and Easter in autumn, so the church holidays that carried many folk customs no longer match their seasons. Southern practitioners have built rich new customs in response: midsummer festivals on the beach, Samhain with autumn leaves in May.

> **Your coven:** Ask your mentor which calendar your coven keeps, and what it does where the festivals and the local seasons don't match.

## The tropics and the far north

Near the equator, the light hardly changes through the year, and the seasons are wet and dry rather than warm and cold. Some practitioners there build their wheel around rains and harvests; some keep the solstices and equinoxes as astronomy. In the far north and far south, the extremes of light and dark are overwhelming, and the solstices may be the most important days of all. There is no single right answer. What matters is honest attention.

## Whose land is it?

Wherever you live, others lived there before you. In colonised lands, the Indigenous peoples are still there, with their own relationships to the land, often including seasonal ceremonies that are not open to outsiders. Respect means:

- **Learn whose land you are on**, and something of its history.
- **Do not copy Indigenous ceremonies.** The closed and living traditions guide explains why.
- **Support** Indigenous-led land care and causes where you can.
- **Honour** the land's first peoples, if you wish, in your words, without claiming their practices.

## Making your own wheel

Over your first year, you will start to make a seasonal calendar that is truly yours: the eight festivals, with the signs of your land beside each, and perhaps local festivals of your own. The devotion and lore modules help you build it.

## What's old and what's modern

- **Old:** watching the land's year, local festivals, the solstices.
- **Modern:** the southern-hemisphere Wheel, eclectic adaptations to local climates, and the ethic of respecting Indigenous relationships with land.`,
    },
    {
      id: 'wheel-tradition-the-coven',
      title: 'How a Wheel coven works',
      summary: 'What a coven that keeps the eclectic Wheel does through the year: festival gatherings, moons, teaching, sharing food, magic, outdoor practice, how the app supports it, and how members with different beliefs keep one circle.',
      minutes: 15,
      links: [coven('rituals'), coven('ritual-builder'), coven('book'), coven('altar'), page('calendar'), page('community-rituals')],
      body: `## A year of gatherings

A Wheel coven's life follows the year. Its rhythm is set by the eight festivals, about six and a half weeks apart, with moon gatherings between. Here is what a typical year looks like, though every coven is different.

### The festivals

The eight festivals are the coven's great days. For most, the coven gathers: indoors at a member's home, outdoors in a garden, wood or park, or online in the app. A festival gathering often includes:

- preparation: decorating the space with seasonal greenery, flowers, fruit or grain;
- a rite in the coven's form, with the festival's own customs;
- shared food, often seasonal, sometimes a full feast;
- time to talk, plan and catch up.

Some covens gather for all eight. Others gather for the four great fire festivals and leave the solstices and equinoxes to households, or the other way around.

### The moons

Many Wheel covens also gather at the full moon, the new moon, or both. Moon gatherings are often smaller and more focused on magic, divination, healing or personal reflection. They may be monthly, or only at certain moons.

### Teaching

A coven teaches its members, from seekers to those preparing to lead. This course is part of that. Mentors meet with their trainees, answer questions in the app, and read written answers.

### Magic and service

Covens practise magic together: healing work for members and those who ask, protection, blessing, and seasonal work such as blessing seeds in spring. Many also do service: litter-picking on their local land, planting trees, supporting food banks at harvest.

## How the app helps

Your coven uses the Sanctuary's coven pages to:

- **plan rites** with the ritual builder, where roles, words and what to bring are shared before a gathering;
- **gather online**, each member at their own altar, following the rite together;
- **keep the coven's Book of Shadows**, its shared record of rites, customs, recipes and teaching;
- **keep altars** together, with the season's objects from the altar's Seasonal drawer;
- **talk** in the coven's messages, and on each step of your training.

## Who leads

Most Wheel covens are led by a High Priestess, a High Priest, or both, sometimes with elders who share the work. In an eclectic coven, leadership is usually less about lineage (a line of initiation going back to a founder) and more about experience, care and the members' trust. Leaders plan the year, lead rites or train others to, teach and mentor, look after members' wellbeing, and keep the coven's agreements.

Leadership roles in an eclectic coven are not owed obedience. A leader's authority rests on the coven's agreements and on the trust they earn.

## One circle, many beliefs

A Wheel coven usually holds people of different beliefs in one circle. That works when a few things are clear:

1. **The shared centre is the year.** Everyone can celebrate the solstice, whatever else they believe.
2. **The words are generous.** Rites welcome "the powers each of us honours" rather than requiring one view.
3. **Personal practice is respected.** Members don't argue about whose god is real during a rite.
4. **There is space for the agreed.** If the coven honours particular powers together, members know that before they join.
5. **Questions are welcome.** Theology is talked about openly, outside the rite, with curiosity rather than contest.

## Outdoors

Wheel covens often prefer to gather outdoors when they can, because the practice is about the living year. Outdoor rites need extra care:

- **Permission:** know whether you are allowed to gather, light fires or leave anything on that land. Public parks and nature reserves have rules.
- **Leave no trace:** take everything home, including offerings that could harm wildlife or litter the place.
- **Fire:** use only safe, permitted fires; in dry weather, none at all. A lantern or electric candle works fine.
- **Weather and dark:** dress for it, bring torches, tell someone where you are.
- **Privacy:** some members may not wish to be seen at a pagan rite. Choose places with that in mind.

> **Safety:** Never hold a rite on private land without permission, in a place that is unsafe at night, or with fire where it is not allowed. A healthy coven plans these things in advance and tells members.

## Food and hospitality

Sharing food is close to the heart of the Wheel: the feast is part of the festival. Covens commonly share a meal after every rite, with each member bringing a dish. Seasonal food is part of the joy: pancakes or dairy at Imbolc, eggs and greens in spring, strawberries at midsummer, bread at Lammas, apples and nuts at Samhain, spiced drinks at Yule. Make sure there is always food for everyone's needs, and non-alcoholic drink.

> **Your coven:** Ask your mentor which festivals your coven gathers for, whether it keeps the moons, where it usually meets, and what you should bring.

## Your first year

In your first year as a devotee you will usually come to as many festivals as you can, watch more than you lead, help with small jobs (setting up, bringing food, clearing away), and keep a small practice at home between gatherings. By the end of the year you will have seen the whole Wheel turn once with the coven. Most people say that first full turn is when the festivals start to feel like their own. If you miss a festival, keep a small version at home and tell your mentor; nobody keeps every one perfectly.

## What's old and what's modern

- **Old:** seasonal feasting, outdoor gatherings at festivals, community service at harvest.
- **Modern:** covens of mixed belief, online gatherings, and the coven's records kept in an app.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wheel-tradition',
      title: 'The Wheel of the Year as a practice: test',
      intro: 'Thirteen questions on what an eclectic Wheel practice is, its history and roots, the powers it may honour, borrowing well, your land and seasons, and how a Wheel coven works. You need 80% to pass. Your mentor will score the written answers.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'What is at the centre of an eclectic Wheel practice?',
          options: ['A single holy book', 'A particular Goddess and God', 'The turning year and the land you live on', 'A line of initiation going back to a founder'],
          correct: [2],
          points: 1,
          explanation: 'The eclectic Wheel centres on the seasons and the land. Everything else, including whom members honour, is built around that.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'Which best describes eclecticism done well?',
          options: [
            'Taking any practice from any culture without asking',
            'Learning each practice’s source, choosing only what is open, and being honest about what is old and what is new',
            'Following one tradition exactly',
            'Avoiding all history',
          ],
          correct: [1],
          points: 1,
          explanation: 'Eclecticism done well is careful and honest: it learns sources, respects closed traditions, and names its inventions as inventions.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'Who proposed in 1921 that accused witches had belonged to a pagan religion meeting at four great sabbats?',
          options: ['Gerald Gardner', 'Margaret Murray', 'Ross Nichols', 'Aidan Kelly'],
          correct: [1],
          points: 1,
          explanation: 'Margaret Murray’s theory, now rejected by historians, gave early Wicca its four great sabbats: Candlemas, May Eve, Lammas and Hallowe’en.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'How did the solstices and equinoxes join the four fire festivals to make eight?',
          options: [
            'They were always kept together by the ancient Celts',
            'In the late 1950s, Gardner’s coven asked for them, and Gardner and his friend Ross Nichols, whose Druids kept the solstices, came to keep all eight',
            'A Victorian folklorist invented them all in 1890',
            'They were added by the church in the Middle Ages',
          ],
          correct: [1],
          points: 1,
          explanation: 'Around 1958, through the friendship of Gerald Gardner and the Druid Ross Nichols, both groups came to keep all eight festivals.',
        },
        {
          id: 'q5',
          type: 'multi',
          prompt: 'Which festival names did Aidan Kelly choose in the early 1970s? Choose all that apply.',
          options: ['Litha', 'Samhain', 'Ostara', 'Mabon', 'Imbolc'],
          correct: [0, 2, 3],
          points: 1,
          explanation: 'Kelly named the summer solstice Litha (from Bede), the spring equinox Ostara (from Grimm’s form of Bede’s Eostre) and the autumn equinox Mabon (from Welsh legend, with no old link to the equinox). Samhain and Imbolc are Gaelic festival names.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'What is the only ancient source for the goddess Eostre?',
          options: ['The Irish law texts', 'A single passage by the monk Bede, written in 725', 'Roman inscriptions in Germany', 'The Poetic Edda'],
          correct: [1],
          points: 1,
          explanation: 'Bede mentions Eostre once, saying the month around the spring equinox was named for her. Everything else written about her is later, much of it modern.',
        },
        {
          id: 'q7',
          type: 'multi',
          prompt: 'Which festivals come mainly from the Gaelic calendar? Choose all that apply.',
          options: ['Samhain', 'Yule', 'Imbolc', 'Bealtaine', 'Lughnasadh'],
          correct: [0, 2, 3, 4],
          points: 1,
          explanation: 'Samhain, Imbolc, Bealtaine and Lughnasadh are the four Gaelic quarter days. Yule comes from the Anglo-Saxon and Norse midwinter.',
        },
        {
          id: 'q8',
          type: 'truefalse',
          prompt: 'To keep the Wheel in an eclectic coven, you must honour a god or goddess.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. Members may honour many gods, one, the land, the ancestors, or no beings at all. Naturalistic paganism is a full way to keep the Wheel.',
        },
        {
          id: 'q9',
          type: 'multi',
          prompt: 'Which of these are closed practices that an eclectic coven should not take up? Choose all that apply.',
          options: [
            'The sweat lodge and vision quest of particular Indigenous nations',
            'The oathbound rites of traditional initiatory Wicca',
            'Honouring the Greek or Norse gods with respect',
            'Practices of Vodou or Lucumí that require initiation',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'These belong to particular peoples or are passed on only by initiation within community. The Greek and Norse gods are honoured by people of every background who come with respect.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'How do most practitioners in the southern hemisphere keep the Wheel?',
          options: [
            'They keep the northern dates exactly',
            'They turn the wheel by six months, so that Yule falls at the June solstice and Samhain at the end of April',
            'They don’t keep it at all',
            'They keep only the equinoxes',
          ],
          correct: [1],
          points: 1,
          explanation: 'Most southern practitioners turn the Wheel so the festivals fit their seasons; the Sanctuary keeps a southern calendar for this. Some keep the northern dates for their history.',
        },
        {
          id: 'q11',
          type: 'multi',
          prompt: 'Which are good practice for an outdoor coven rite? Choose all that apply.',
          options: [
            'Knowing whether you are allowed to gather and light fires there',
            'Taking everything home, including offerings that could harm wildlife',
            'Lighting a fire in dry weather because the festival calls for it',
            'Bringing torches and telling someone where you are',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Permission, leaving no trace and safety come first. In dry weather, use a lantern or electric candle instead of fire.',
        },
        {
          id: 'q12',
          type: 'short',
          prompt: 'Choose one festival of the Wheel. Which of its parts are old, which are folk custom, and which are modern, as far as you know?',
          points: 3,
          explanation: 'Every festival mixes old festivals, folk and church customs, and modern practice. Sorting them is part of keeping the Wheel honestly.',
          rubric: 'Full marks: names at least one genuinely old element with a reasonable source, such as a Gaelic festival, Bede or a solstice alignment (1 point); names at least one folk or church custom (1 point); names at least one modern element, such as a 1970s name or a modern ritual form, without calling it ancient (1 point).',
        },
        {
          id: 'q13',
          type: 'short',
          prompt: 'Describe your own land’s year in a few sentences. Where does the Wheel fit it well, and where does it fit poorly? What might you do about the poor fit?',
          points: 2,
          explanation: 'An eclectic Wheel is shaped by the land you live on. Where the festivals don’t match, you can keep their meaning with local signs, keep the astronomy, move a festival or keep the old dates for their story.',
          rubric: 'Full marks: gives at least two specific observations of their local seasons (1 point); identifies a fit or misfit with at least one festival and suggests a reasonable approach from the lesson (1 point).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'The Wheel of the Year as a practice',
      intro: 'Here you learn what your coven’s practice is and where it comes from: the eclectic way of keeping the Wheel, its honest history, the many roots of the festivals, the powers members may honour, your own land’s year, and how the coven works. Take your time; much of this stays with you for years.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'What an eclectic Wheel practice is',
          kind: 'study',
          instructions: `1. Read "What an eclectic Wheel practice is".
2. In the answer box, write in a few sentences what you understand the centre of this practice to be, and one freedom and one responsibility that matter to you.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wheel-tradition-what-it-is'],
        },
        {
          title: 'The Wheel’s real history',
          kind: 'study',
          instructions: `1. Read "How the Wheel was assembled" and "The many roots of the festivals".
2. Do the "Try this": choose one festival, read its page in the app, and sort its parts into old, folk custom and modern.
3. Write your sorting in the answer box, with where you found each piece.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['wheel-tradition-how-the-wheel-was-made', 'wheel-tradition-the-roots'],
        },
        {
          title: 'The powers, and borrowing well',
          kind: 'reflection',
          instructions: `1. Read "The powers you may honour, and borrowing well".
2. Open the closed and living traditions guide and read about one tradition you didn't know was closed.
3. In the answer box, write: whom (if anyone) you feel drawn to honour now, what you learned from the guide, and one practice you have met that you now think should be left alone.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 45,
          docs: ['wheel-tradition-the-powers'],
        },
        {
          title: 'Watch three living things',
          kind: 'practice',
          instructions: `1. Read "Your land, your seasons, and the southern hemisphere".
2. Choose three living things near you: a tree, a plant, a bird or animal.
3. Once a week for twelve weeks, look at each and note in the app what it is doing. Log each week.`,
          times: 12,
          response: 'none',
          checked_by: 'self',
          minutes: 15,
          docs: ['wheel-tradition-your-land'],
        },
        {
          title: 'Your land and the Wheel',
          kind: 'reflection',
          instructions: `1. After your first month of watching, reread "Your land, your seasons, and the southern hemisphere".
2. In the answer box, describe your land's year as you know it so far, where the Wheel fits it well, where it fits poorly, and which calendar (northern or southern) your coven keeps.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wheel-tradition-your-land'],
        },
        {
          title: 'How our coven works',
          kind: 'meeting',
          instructions: `1. Read "How a Wheel coven works".
2. Meet your mentor (in person, by call or in the app's messages) and ask: which festivals the coven gathers for, whether it keeps the moons, whom it honours together, where it meets, and how members with different beliefs share a rite.
3. Send your mentor a short note on this step afterwards with anything you want to remember.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 45,
          docs: ['wheel-tradition-the-coven'],
          solitary: 'Write a page in your Grimoire on how you will keep the year alone: which festivals, whether you will keep the moons, whom you honour, where you will practise, and whom you might share a festival meal with.',
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Re-read any lesson you're unsure of.
2. Take the test. The choice questions are scored at once; your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed, talk to your mentor, and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          quiz: 'quiz-wheel-tradition',
        },
      ],
    },
  ],
} satisfies CourseModule;
