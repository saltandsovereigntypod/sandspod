// Celtic ritual: the shape of a modern Celtic rite and where each part comes
// from (no complete pagan Celtic liturgy survives, so this is said plainly);
// saining, sunwise movement and thresholds from Gaelic folk custom; the sacred
// centre of fire, well and tree (Kildare's fire, holy wells, the bile, and
// ADF's modern model); offering and hospitality; prayer and praise in the
// poets' manner; and a complete rite with an omen, to learn by heart. Builds on
// core-sacred-space and core-altar-tools. Modern practice marked as modern.
// British spelling.

import type { CourseModule } from '../types';
import { candle, coven, deity, herb, holy, journey, page, ritual, spread, tool, vessel } from '../linkHelpers.ts';

export default {
  id: 'celtic-ritual',
  title: 'Celtic ritual',
  docs: [
    {
      id: 'celtic-ritual-shape-of-a-rite',
      title: 'The shape of a Celtic rite',
      summary: 'Why no ancient Celtic liturgy survives, what the sources do give us for building a rite, the shape this course uses (gathering, saining, kindling, honouring the powers, praise and offering, the heart, omen, hospitality, thanks), and how it compares with Druid and Wiccan rites.',
      minutes: 15,
      links: [coven('ritual-builder'), page('planner'), coven('rituals'), ritual('folk-smooring-the-fire'), page('library')],
      body: `## Starting honestly

No complete pagan Celtic rite survives. We have no prayer book of the druids, no temple calendar of offerings, no order of service. What we have are pieces: Roman descriptions of sacrifices and sacred groves; archaeological traces of offerings; medieval tales in which people swear by the elements, feast at Samhain or meet the gods at a ford; and a great wealth of folk custom around fire, water, the hearth and the dead, recorded from Christian communities.

So every Celtic rite you will take part in is **modern**, built from those pieces by people who have studied them. That is not a weakness. It means each part should be there for a reason you can explain. This lesson gives the shape this course uses, and where each part comes from.

## What the sources give us

A few patterns run through the evidence and shape most modern Celtic rites:

- **Hospitality.** Feeding the guest, and the duty of the host, are central to early Irish and Welsh society. A rite can be understood as hospitality between people and the powers: we welcome, feed and honour them, and they bless us.
- **The hearth and the fire.** The household fire, kindled in the morning and smoored at night, and the great fires of Bealtaine and Samhain.
- **Water.** Offerings in lakes, rivers and springs over thousands of years, and the holy wells.
- **Sunwise movement.** Turning deiseal, with the sun, for luck and blessing.
- **The three realms.** Oaths in the Ulster tales are sworn by sky, earth and sea. Many modern rites honour land, sea and sky because of this.
- **Gods, ancestors and spirits of place.** The sources show all three receiving honour or offerings.
- **Poetry.** The poet's praise was a gift of great value; satire was a weapon.

## The shape this course uses

1. **Gathering and preparing.** Arriving, washing hands and face, quieting down, agreeing roles.
2. **Saining.** Blessing and cleansing people and place, with water and, where safe, the smoke of juniper or another herb. Moving sunwise.
3. **Kindling.** Lighting the fire or candle at the centre, with words.
4. **Honouring the powers.** Greeting the land and its spirits, the ancestors, and the gods, often with the three realms of land, sea and sky.
5. **Praise and offering.** Invoking the gods of the occasion by their names and deeds, and giving gifts.
6. **The heart of the rite.** The festival's customs, a devotion, a blessing, a working, a story told.
7. **An omen,** if the coven takes one: asking whether the offerings were welcome, or what counsel the powers give.
8. **Hospitality.** Blessing food and drink, giving the first portion, and sharing.
9. **Thanks and closing.** Thanking each power in reverse order, putting out or banking the fire, and later giving the offerings away.

The next lessons teach each part.

## How it differs from other rites

You may know Wiccan or eclectic rites. A Celtic rite in this style is different in a few ways:

- **No circle is cast.** The sources do not show one. Sacred space is made by saining, by the fire at the centre, and by the welcome given. Some Celtic covens do cast a circle; ask yours.
- **No quarters are called** with elements at each direction. The four directions do appear in Irish tradition (a medieval tale gives each province of Ireland a quality, which the app's five-stave ogham spread uses), but not as guardians to be summoned.
- **No single Goddess and God.** Many gods, each with their own name and story.
- **The gift matters more than the power raised.** Most of the rite is relationship: welcome, praise, gift, blessing. Magic may be part of it, but is not its centre.

**ADF Druid** rites share much of this shape: ADF's public Core Order of Ritual includes purifying, honouring the Earth Mother, establishing the fire, well and tree, opening a gate, inviting the Three Kindreds, offerings, an omen and the return of blessing. **OBOD** rites are held in a circle with the quarters, and use the revival's Druid's Prayer and the awen chant. Both are modern; both are fine; they are simply different.

## Who does what

In a coven rite, roles are often shared:

- **a leader** who speaks for the coven and keeps the rite moving;
- **a fire-keeper** responsible for the fire, its safety and putting it out;
- **a sainer** who carries water and smoke;
- **a poet or speaker** who gives the praise;
- **a host** who sees to the food, drink and hospitality.

In a solitary rite you do all of these yourself, simply. Keep the parts in order, even when each is only a sentence or two: the shape carries you, and over time it becomes something you can do from memory, in the dark, at a fire or by a candle.

> **Your coven:** Ask your mentor for your coven's order of rite, written out. Compare it with the shape here: what is the same, what is different, and why?

> **Try this:** For each of the nine parts above, write one sentence in your book saying where it comes from: a source, a folk custom, a modern order, or the coven's own making.

## What's old and what's modern

- **Old:** hospitality, the hearth, offerings to water and fire, sunwise turning, oaths by the realms, praise poetry, folk saining.
- **Modern:** the order of rite as a whole, and the absence or presence of a circle in any given group.`,
    },
    {
      id: 'celtic-ritual-saining-and-sunwise',
      title: 'Saining, sunwise and the threshold',
      summary: 'Saining, the Scots word for blessing and protecting, as recorded in Highland folk custom with water and juniper smoke; how to sain people and places safely today; moving sunwise and never against the sun in a rite; and the threshold as a place of care.',
      minutes: 15,
      links: [herb('juniper'), herb('rowan'), vessel('bowl'), ritual('folk-rowan-red-thread'), ritual('folk-iron-threshold'), ritual('kitchen-threshold-salt-blessing')],
      body: `## What saining is

**Saining** is an old Scots word meaning to bless, to protect and to make holy; it is related to the word "sign", as in signing with the cross. In the Highlands and Islands, people sained cattle, houses, children and themselves at the turning points of the year and of life. Folklorists recorded the custom from the eighteenth century to the twentieth.

Two of the best recorded forms use water and smoke. F. Marian McNeill, in The Silver Bough (four volumes, 1957–68; the Hogmanay rites are in volume 3, 1961), describes the New Year saining of a Highland house: water was fetched in silence from a ford "over which the living and the dead pass", sprinkled over the household and the house, and then juniper was burned until the house filled with smoke, with the windows shut, before they were opened to let the fresh air in. Other sources record sprinkling with water from a holy well, and carrying fire sunwise round a house, a field or a child.

Modern Celtic pagans have taken up saining as the way to begin a rite: blessing the people and the place before the fire is kindled. It is a good choice, rooted in recorded Gaelic custom, and it replaces the "cleansing" or "casting" of other traditions.

## Saining with water

Water is the simplest and safest way.

1. **Fetch the water.** Ideally from running water, a spring or a well, taken with a word of thanks. Rain water or tap water blessed at your hearth is fine.
2. **Bless it.** Hold the bowl and say what it is for: "Water of the land, bless and protect us and this place."
3. **Sprinkle sunwise.** Walk sunwise round the space, flicking a few drops from your fingers or a sprig of a green plant (rowan, juniper, heather, rosemary). Then go round the people, sprinkling each lightly, or let them dip their fingers and touch their brow.
4. **Return the water.** Afterwards, pour it on the earth.

## Saining with smoke

Smoke saining is powerful but must be done with care.

> **Safety:** Juniper and other herbs make thick, irritating smoke. The old custom of filling a closed house with it is not safe today, and would set off smoke alarms. Use a small amount in a heat-proof dish, with a window open; never disable a smoke alarm; keep it away from anyone with asthma, from pregnant people if they would rather avoid it, and from pets and babies. Outdoors, mind dry grass and wind. Never take smoke near someone who has not agreed to it.

1. Light a little dried juniper, or another herb, on a charcoal disc in a heat-proof dish, or simply use a candle flame as the sign of fire.
2. Carry it sunwise round the space, and offer it to each person, who may waft it towards themselves or decline.
3. Put it out completely afterwards, in sand or water.

If smoke is not possible, water alone is enough, or water followed by carrying a candle sunwise round the space.

## Sunwise

**Sunwise** means moving in the direction the sun travels across the sky: in Irish deiseal, in Scottish Gaelic deiseil, in Welsh, gyda'r haul ("with the sun"). For someone in the northern hemisphere facing south at noon, the sun moves from left to right, so sunwise is clockwise. Martin Martin, describing the Western Isles of Scotland in 1703, recorded people walking sunwise round those they wished to bless, round fires and round holy wells. Rounds at Irish holy wells are still walked sunwise.

The opposite direction, **tuathal** in Irish, "widdershins" in Scots, was unlucky in folk custom and associated with cursing. In a rite, move sunwise: walk sunwise round the fire, pass food and drink sunwise, and when you go round the space, go with the sun.

> **Note:** In the southern hemisphere the sun moves the other way across the northern sky, so some Celtic pagans there walk anticlockwise as their sunwise. Others keep clockwise. Both reasons are good; ask your coven which it keeps.

## The threshold

The threshold, the doorway and the boundary of a place, was a place of special care in Gaelic and Welsh custom. Rowan crosses bound with red thread were hung over doors and byres at Bealtaine; iron was set by the door; Brigid was welcomed in over the threshold on her eve; water was not thrown out of the door at night without warning in case the good folk were passing. A rite often begins at a threshold, real or marked: a gate, a door, two stones.

You can mark the threshold of your rite by:

- pausing at the door or edge, and saying why you have come;
- sprinkling a little water across it;
- setting a sprig of rowan or a piece of iron there.

> **Try this:** Sain your home this week. Bless a bowl of water at your hearth candle, then walk sunwise through every room, sprinkling a few drops in each and at each outside door, saying a short blessing of your own. Pour what is left on the earth outside. Write how it felt.

## What's old and what's modern

- **Old:** saining with water from a ford or well and with juniper smoke, sunwise turning, and threshold protections, all recorded in Gaelic folk custom (in Christian communities).
- **Modern:** saining as the opening of a pagan coven rite, and the safety adjustments above.`,
    },
    {
      id: 'celtic-ritual-fire-well-and-tree',
      title: 'Fire, well and tree: the sacred centre',
      summary: 'The three great features of Celtic sacred places in the sources and in modern practice: the sacred fire (Bealtaine, Kildare, the household hearth), the sacred well and waters, and the sacred tree (the bile); ADF’s modern use of all three; and how to build a simple shrine with them at home.',
      minutes: 15,
      links: [herb('oak'), herb('hawthorn'), herb('rowan'), tool('cauldron'), vessel('bowl'), page('altar'), coven('altar'), holy('celtic/la_fheile_bride')],
      body: `## A centre to stand at

Every rite needs a centre: a place to face, to give to, to gather round. In Celtic sources three things stand out as sacred centres: the **fire**, the **well** or water, and the **tree**. Modern Celtic pagans use one, two or all three.

## The fire

Fire is everywhere in Gaelic custom. A tenth-century glossary describes the Bealtaine fires through which cattle were driven. Later writers put a great Samhain fire at Tlachtga and a Bealtaine fire at Uisneach. In folk custom the household hearth was the centre of the home, its fire never allowed to go out, banked at night with a blessing and kindled each morning with another. In the 1180s Gerald of Wales described a fire at Kildare kept burning by nineteen nuns in turn, with Saint Brigid tending it herself on the twentieth night; the Brigidine Sisters relit a flame there in 1993.

In a rite the fire is the hearth of the gathering: the place where offerings are given, light by which to see one another, and the presence of the gods' warmth. Indoors it is a candle or a lamp; outdoors, a fire pit, a brazier or a small fire on safe ground.

> **Safety:** Outdoor fires need permission where you are, a safe site away from overhanging branches and dry grass, water or sand to hand, a named fire-keeper, and a plan for putting it out completely. Indoors, keep candles on a heat-proof surface and never leave them unattended.

## The well

Water was where the Celtic peoples gave their best things: swords, shields, cauldrons and jewellery have been found in lakes, rivers and bogs across Europe. Medieval Irish tales place the source of wisdom in a well (Connla's Well, or the well of Segais), surrounded by hazels whose nuts fall into it and feed the salmon of knowledge. Boann, goddess of the Boyne, was said to have made the river when the waters of such a well rose against her. And there are around three thousand holy wells in Ireland alone, most of them dedicated to saints, visited still.

In a rite the well is the way to the depths, to the land, the ancestors and the Otherworld beneath. Indoors it is a bowl of water, or a cauldron; outdoors, a spring, a river, the sea, or a bowl set on the earth.

## The tree

The early Irish knew certain great trees as **bile** (plural bileda), sacred trees standing at royal and assembly sites. The Dindshenchas names five legendary great trees of Ireland. Tree names fill the landscape. The Gaulish word nemeton, a sacred place or grove, appears in place-names across Europe, and Roman writers speak of druids' groves cut down by Roman armies. Folklore keeps the lone hawthorn as a fairy tree not to be cut, and the rowan as a protector.

In a rite the tree is the axis between the worlds, joining the depths and the heights, and a living presence of the land. Indoors it may be a branch, a staff, a potted plant or a carved post; outdoors, a living tree.

## Fire, well and tree together

**ADF Druidry** built its public ritual on these three as the "Sacred Centre": the fire carries offerings to the gods above, the well reaches the depths and the ancestors, and the tree stands between, joining them. This is a **modern** synthesis, made by Isaac Bonewits and others from Irish, Vedic and other sources, not a recovered ancient pattern. It is also a fine one, and many Celtic covens use it.

Other covens use only the fire, as the hearth of hospitality; or fire and water, as at a holy well where a candle is lit beside the spring. What matters is that you know why each is there.

## A shrine at home

You can build a simple Celtic shrine with these three:

1. **Choose a place:** a shelf, a table or a corner where it can stay.
2. **The fire:** a candle or lamp at the centre.
3. **The well:** a small bowl of water, changed often, to one side.
4. **The tree:** a branch, a sprig of a native tree, a piece of wood, or a small plant, to the other side or behind.
5. **The offering dish:** a small bowl or plate in front, for gifts.
6. **The powers:** an image or a stone for a god you honour, a photograph or name of an ancestor, a stone or shell from the land where you live.

Keep it clean. Change the water. Take the offerings away before they spoil. Dust it. A shrine is a place you tend, not a display.

> **Your coven:** Ask your mentor how your coven makes its centre: fire alone, fire and well, or fire, well and tree. Look at the coven's altar in the app, if it keeps one.

> **Try this:** Set up a fire, well and tree shrine at home for one week. Each day, light the candle, change the water and touch the branch, and greet the gods, ancestors and land. Take a photo of it for your mentor if you'd like them to see it, and note which of the three feels most alive to you.

## What's old and what's modern

- **Old:** sacred fires, offerings in water, holy wells, sacred trees and groves, all in the sources.
- **Modern:** putting the three together as a ritual centre (ADF, from the 1980s), and shrines in modern homes.`,
    },
    {
      id: 'celtic-ritual-offering-and-hospitality',
      title: 'Offering and hospitality',
      summary: 'How to give offerings in a Celtic way: hospitality as the frame (host, guest and the gods), what to offer and to whom, how to give to fire, water and earth, the first portion, words to say, what not to do, and how to dispose of offerings well.',
      minutes: 15,
      links: [vessel('offering_bowl'), ritual('kitchen-family-meal-blessing'), ritual('hedge-house-spirit-offering'), ritual('sea-river-flower-offering'), ritual('green-land-spirit-garden-offering'), page('altar')],
      body: `## Hospitality as the frame

In early Ireland, hospitality was law as well as custom. Certain landholders, the **briugu** or hospitallers, were bound to keep open house for any traveller, and in the tales their hostels stand at crossroads with a cauldron always on the fire. To refuse a guest food shamed the household. To harm a guest under your roof was among the worst crimes. The Welsh laws and tales value hospitality just as highly: in the First Branch of the Mabinogi, a great feast is the setting for Pwyll's meeting with Rhiannon, and how a host treats guests decides much of the story.

Many Celtic pagans understand offering through this lens. In a rite we are hosts and the gods, ancestors and spirits are honoured guests; or we are guests in their land and bring a gift. Either way, the relationship is one of giving and receiving, with honour on both sides. A gift creates a bond. That is why you give first, give well, and give freely.

## What to offer

The best offerings are good, real things, given with care:

- **dairy:** milk, cream and butter, the wealth of an old Gaelic farm, and in folk custom the first of the churning left for the good folk;
- **grain:** oatcakes, bannocks, bread, porridge, a pinch of oats or barley;
- **honey,** apples, berries and other fruits of the season;
- **drink:** ale, mead, cider, whiskey, or (always just as good) water, milk or juice;
- **made things:** a poem, a song, a piece of craft, a woven cross;
- **work:** clearing litter from a spring, planting a tree, learning a language, given in a god's name.

Archaeology shows the ancients gave their finest metalwork to the waters. A coin or a small handmade object can carry that tradition, but think about where it goes; many wells and rivers are harmed by coins and metal.

## To whom

A common pattern is to give to each of the three kinds of power:

- **the gods:** the first and best, often to the fire;
- **the ancestors:** often to the earth or set at the table;
- **the spirits of the land:** to the earth, a tree or water, often kept separate from the gods' gifts.

## How to give

1. **Prepare it.** Put the offering in a clean dish or cup.
2. **Name it.** Say what you are giving and to whom: "Brigid, I give you this butter, from my hand, with thanks for your blessing on my work."
3. **Give it.** To **fire**, by placing a little in the flames of a fire or on a heat-proof dish beside a candle; to **water**, by pouring it into running water or a bowl; to **earth**, by pouring or burying it, or placing it at the foot of a tree.
4. **Pause.** Let it be received. Many people stand quietly for a breath or two.
5. **Leave it.** Food given is not taken back or eaten.

## The first portion

The old custom was to give the **first** and best portion, not the leftovers: the first of the milk, the first of the harvest at Lughnasadh, the first drop of a drink. At a coven feast, set aside a portion of each dish for the powers before anyone eats. At home, pour the first drop of your evening drink for the house.

## What not to do

- **Don't offer what isn't yours to give.** A stolen or borrowed gift shames the giver.
- **Don't harm wildlife or pets.** No chocolate, grapes, raisins, onion or garlic left outside; nothing in plastic; nothing that will attract rats near houses.
- **Don't pollute waters.** Pour liquids, not oil or wine in quantity, into running water; never throw glass, plastic or synthetic things into wells, rivers or the sea.
- **Don't give blood or harm any creature.** Modern Celtic paganism does not sacrifice animals.
- **Don't bargain greedily.** "I give so that you may give" is an old principle of gift exchange, but a gift that is only a payment is a poor gift.

## Disposing of offerings

Offerings on a shrine are usually taken away at the end of the day or the next morning: poured or buried outside, placed under a tree, composted, or burned in a fire. If you live without a garden, a pot plant's soil takes a liquid; food can go into food waste, wrapped, with a word of thanks. What matters is respect.

## When it feels one-sided

Many people worry, at first, that they are giving into silence. That is normal. Hospitality in the old sense was not a trade with instant returns; it built a bond over years, and honour on both sides. Keep giving small, regular gifts, keep your word, and notice over months rather than days whether your life with the gods, the dead and the land feels any different. Write it down, so that you can look back.

> **Your coven:** Ask your mentor what your coven offers, to whom, and what it does with the offerings after a rite.

> **Try this:** For two weeks, give the first drop of a drink or the first bite of a meal to the house, once a day, with a few words. Note how it changes, if at all, the way you sit down to eat.

## What's old and what's modern

- **Old:** hospitality law and custom, offerings in waters, dairy and food for the good folk and the dead, the first portion.
- **Modern:** the pattern of three kinds of offering to gods, ancestors and land spirits in one rite, and the environmental care.`,
    },
    {
      id: 'celtic-ritual-prayer-and-praise',
      title: 'Prayer, praise and the spoken word',
      summary: 'Why words matter so much in Celtic tradition: the poets, praise and satire; what we can learn from the shape of Gaelic prayer in Carmina Gadelica without taking it; invoking a god by names, deeds and places; the threefold blessing; and writing your own praise.',
      minutes: 15,
      links: [deity('brigid'), deity('ogma'), deity('cerridwen'), journey('deity-brigid'), journey('deity-cerridwen'), page('grimoire')],
      body: `## The power of words

In early Ireland and Wales, the poet was one of the most honoured people in society. The **file** (plural filid) in Ireland and the **bardd** in Wales trained for years, kept the genealogies and the lore, and composed praise for kings. A poet's praise could raise a person's honour; a poet's satire could ruin it, and the tales say a true satire could raise blisters on the face of an unjust king. Brigid, says Cormac's Glossary, was the goddess whom the poets worshipped. Cerridwen's cauldron gave Taliesin the awen, poetic inspiration.

So in Celtic practice, words are not filler between actions. Speaking well to the gods is itself an offering, perhaps the best one.

## What we can learn from Gaelic prayer

Alexander Carmichael's Carmina Gadelica (from 1900) gathers hundreds of prayers, blessings and charms from Gaelic-speaking Scotland: for kindling the fire, smooring it at night, milking, weaving, setting out on a journey, going to sleep. They are Christian prayers, addressed to God, Christ, Mary, Brigid and Michael, and Carmichael polished them. They are not pagan texts, and the respectful way to use them is to learn from them rather than to rewrite them.

What they teach is a **way of praying**:

- **Short lines,** often only two or three words, easy to say from memory while working.
- **Threes.** "To save, to shield, to surround." Repetition in threes runs through Gaelic and Welsh speech, and through the triads.
- **Everyday tasks.** Prayer is woven into kindling, milking and travelling, not kept for special occasions.
- **Encircling.** Many prayers ask for a protecting circle, a caim, around a person or a house.
- **The named day and the named thing.** "This eve, this night, and every night."

## Invoking a god

When you call on a god in a rite, the old way of praise suggests a pattern:

1. **Their names.** Call them by name, and by their bynames: "Lugh, Samildánach, Lugh of the long arm."
2. **Their kin.** Name their father, mother or people: "son of Cian, grandson of Balor and of Dian Cécht".
3. **Their deeds.** Tell what they did in the stories: "who came to Tara's door and was master of every art".
4. **Their places.** Name where they are honoured: "you whose feast is at Tailtiu".
5. **The asking.** Invite them, and say why: "come to our fire, receive our gift, bless our work".

This pattern of names, kin, deeds and places is common in praise across many old religions, and fits the Irish and Welsh love of genealogy and place-lore. The words themselves should be yours, drawn from the stories you have read.

## The threefold blessing

A simple form many Celtic pagans use is a blessing in threes, in the manner of Gaelic prayer. For example, at a hearth:

"Fire of the hearth,
warm us, light us, guard us,
this day, this night,
and every day and night."

You can write these for any purpose: a journey, a meal, a new home, a friend who is ill.

## Writing praise

1. **Choose a god** whose stories you have read.
2. **Gather their names, kin, deeds and places** in your book.
3. **Write six to twelve short lines,** speaking to them directly.
4. **Use threes,** and repeat a line at the end, as an echo.
5. **Read it aloud** at your shrine. Change any line that feels false or clumsy.
6. **Keep it** in your book, and use it in your rites.

It does not need to rhyme or be clever. Honest, specific words are worth more than borrowed grand ones.

## Speaking aloud

Many people find speaking to the gods aloud awkward at first. That is common, and it passes. A few things help:

- **Practise alone first,** quietly, then at a normal speaking voice.
- **Learn the opening lines by heart,** so you are not reading while you look at the fire.
- **Slow down.** Old praise was spoken or chanted, not rushed. Leave a breath between lines.
- **Mean it.** If a line feels false to you, change it. A plain "thank you" said with feeling is better than a fine phrase you do not believe.
- **In a coven,** the poet or speaker may read from a card. That is fine; most people do at first.

## Silence

Words are not the whole of prayer. After you have spoken, leave a time of quiet: a minute or two of listening, watching the flame or the water. Some of the most important moments in a rite come in that silence. Notice what comes, and do not hurry to fill it.

## The languages

If you are learning Irish, Scottish Gaelic or Welsh, try saying a line of your praise in that language: a god's name in its own form, a greeting, a blessing. Be humble about pronunciation and check with a teacher or a recording.

> **Note:** Some well-known "Celtic" prayers are modern. The Song of Amergin, from the Lebor Gabála, is a genuine medieval Irish poem, though its meaning is debated; many prayers sold as "ancient Celtic blessings" were written in the last century.

> **Try this:** Write a praise of six to twelve lines for a god whose stories you have read, using names, kin, deeds and places. Read it aloud at your shrine three times over a week, revising each time.

## What's old and what's modern

- **Old:** the honour of poets, praise and satire, the Gaelic prayer forms of Carmina Gadelica (Christian), threefold patterns.
- **Modern:** pagan praise written in those forms, and its use in coven rites.`,
    },
    {
      id: 'celtic-ritual-a-complete-rite',
      title: 'A complete rite, from start to finish, with an omen',
      summary: 'A full sample Celtic rite to learn and adapt: preparing, saining, kindling, honouring land, sea and sky, the ancestors, the spirits of place and a god, praise and offering, an omen with ogham, hospitality and closing; for a coven and for one person alone.',
      minutes: 18,
      links: [coven('ritual-builder'), page('planner'), spread('one-stave'), spread('three-staves'), ritual('folk-smooring-the-fire'), candle('white'), vessel('offering_bowl'), holy('celtic/lughnasadh')],
      body: `## Using this rite

Here is a complete rite for a coven, with notes for keeping it alone. It is a **modern** rite in the shape this module teaches. It can serve as a monthly devotion, a welcome for a newcomer, or the frame for a festival, with that festival's customs at its heart. Learn it well enough to lead it without reading, then change it to suit your coven.

This example honours Lugh. Put in the god of your own occasion.

## What you need

- a fire or a candle at the centre; a bowl of water; a branch or plant, if you use the tree;
- a bowl of water for saining, and a sprig of green;
- offerings: milk or butter, oatcakes or bread, and a drink (with juice or water for those who prefer);
- food and drink to share;
- a set of ogham staves, or the app's ogham spreads, for the omen;
- the words, written out for whoever speaks.

## The rite

1. **Gathering.** Everyone washes hands and face, and stands quietly at the edge of the space. The leader says why you have come: "We gather to honour Lugh of the many skills, at his feast."

2. **Saining.** The sainer blesses the water ("Water of the land, bless and protect us") and walks sunwise round the space, sprinkling it, then round the people, sprinkling each who wishes. If smoke is used, it follows, carried sunwise and offered to each person.

3. **Kindling.** The fire-keeper lights the fire or candle and says: "We kindle this fire, hearth of our gathering, light of the gods. Let it burn for welcome." All may answer, "Let it burn for welcome."

4. **Land, sea and sky.** The leader, or three people in turn, face the earth, the water and the sky: "We honour the land beneath us. We honour the sea around us. We honour the sky above us." A modern form, built on the old oath by sky, earth and sea.

5. **The spirits of the land.** Someone pours milk on the earth or into the land's dish: "Spirits of this place, good neighbours, we are guests here. Take this gift, and let there be peace between us." No more is asked of them.

6. **The ancestors.** Someone places bread for the dead: "Ancestors of blood, of place and of spirit, you who went before us, be welcome at our fire." People may speak names quietly.

7. **The god.** The poet speaks the praise of Lugh, with his names, kin, deeds and places, and invites him: "Lugh, come to our fire, receive our gift." The offering is given to the fire: a piece of oatcake and a little butter, and a drink poured.

8. **The heart.** At a festival, its customs; for Lugh, perhaps each person names a skill they are learning and asks for his help, or the first fruits are blessed. At a devotional rite, quiet time, a story read aloud, or each person's own short prayer.

9. **The omen.** The leader asks, "Lugh, have our gifts been welcome? What counsel do you give us?" and draws one ogham stave, or three, in silence. The stave's meaning is read aloud and talked over briefly. If the omen seems poor, a further gift may be given and the omen asked again, once, or the coven may simply take the counsel to heart. Ogham divination is **modern**; there is a medieval tale of a druid using ogham on yew wands to find someone lost, but no surviving rite of omen-taking.

10. **Hospitality.** The host blesses the food and drink: "Bless this food and those who share it." The first portion of each is set aside for the powers. Food and drink are passed sunwise.

11. **Thanks.** In reverse order, the leader thanks Lugh, the ancestors, the spirits of the land and the three realms: "Lugh, thank you. Ancestors, thank you. Good neighbours, thank you. Land, sea and sky, thank you."

12. **Closing.** The fire-keeper banks or puts out the fire: "The fire is banked, but not quenched in our hearts." The leader ends: "The rite is ended. Go in peace." Afterwards, the offerings are given to the earth, water or fire.

## Keeping it alone

Alone, keep every step, simply: one candle, one bowl of water, one dish. Sain yourself with water, kindle, greet the three realms, the land, the dead and the god, give your gift, keep a few minutes of quiet or your festival's custom, draw a stave if you wish, eat a little with the first bite set aside, thank and close. It takes twenty to thirty minutes.

## Common difficulties

- **Too long.** Shorten the praise or the heart, not the welcome and thanks.
- **The fire won't light.** Have a candle ready as a backup, and don't take it as an omen.
- **Unsure of the omen.** Treat it as counsel, not command, and write it down; meaning often becomes clear later.
- **Someone unwell.** Pause. The fire-keeper or another member cares for them; the rite can wait.

> **Your coven:** Ask your mentor for your coven's own words for each part, and which parts it adds or leaves out.

> **Try this:** Keep this rite once alone and, if you can, once with the coven. Afterwards, write in your book what each part did, which part felt strongest, and what you would change.

## What's old and what's modern

- **Old:** each element's roots (saining, sunwise turning, the hearth, gifts of food and drink, praise, the oath by sky, earth and sea, hospitality).
- **Modern:** this rite as a whole, and ogham omens.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-celtic-ritual',
      title: 'Celtic ritual: test',
      intro: 'Thirteen questions on the shape of a Celtic rite, saining and sunwise movement, fire, well and tree, offering, praise and the complete rite. Most are scored at once; your mentor reads the written answers. You need 80% to pass, and you can try again.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'truefalse',
          prompt: 'A complete pagan Celtic liturgy survives and modern covens follow it word for word.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. No complete pagan Celtic rite survives. Modern rites are built from pieces of evidence, and should say so.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'What does “saining” mean?',
          options: ['Singing a hymn', 'Blessing and protecting, often with water and smoke', 'Casting a circle with a blade', 'Fasting before a rite'],
          correct: [1],
          points: 1,
          explanation: 'Saining is the Scots word for blessing and protecting, recorded in Highland custom with water from a ford or well and juniper smoke.',
        },
        {
          id: 'q3',
          type: 'multi',
          prompt: 'Which are safe ways to sain with smoke today? Choose all that apply.',
          options: ['A small amount in a heat-proof dish with a window open', 'Filling a closed house with juniper smoke', 'Offering the smoke only to those who agree', 'Disabling the smoke alarm first'],
          correct: [0, 2],
          points: 1,
          explanation: 'Use a little, ventilate, and ask consent. Never fill a closed house with smoke or disable an alarm; water alone is always enough.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'In the northern hemisphere, which way is sunwise (deiseal)?',
          options: ['Anticlockwise', 'Clockwise', 'Towards the north', 'Any direction'],
          correct: [1],
          points: 1,
          explanation: 'Facing south, the sun moves left to right, so sunwise is clockwise. Some southern-hemisphere practitioners reverse it.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'What is a bile in early Irish tradition?',
          options: ['A holy well', 'A sacred tree, such as stood at assembly sites', 'A kind of offering cake', 'A poet’s satire'],
          correct: [1],
          points: 1,
          explanation: 'A bile was a sacred tree, often at a royal or assembly site.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'Using fire, well and tree together as the ritual centre comes from:',
          options: ['A surviving druid manual', 'ADF Druidry, a modern synthesis from the 1980s', 'Carmina Gadelica', 'Caesar'],
          correct: [1],
          points: 1,
          explanation: 'Each feature is in the sources, but putting the three together as the Sacred Centre is ADF’s modern synthesis.',
        },
        {
          id: 'q7',
          type: 'multi',
          prompt: 'Which are good offerings in this tradition? Choose all that apply.',
          options: ['Milk, cream or butter', 'Oatcakes or bread', 'A poem you wrote', 'Chocolate left out in the garden'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Dairy, grain and made things are good offerings. Chocolate, grapes, onion and the like harm animals and shouldn’t be left outside.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'Which portion of a meal is traditionally given to the powers?',
          options: ['The leftovers', 'The first and best portion', 'Whatever no one wanted', 'Nothing; only drink is given'],
          correct: [1],
          points: 1,
          explanation: 'The first and best portion is given, before anyone eats, in the spirit of hospitality.',
        },
        {
          id: 'q9',
          type: 'truefalse',
          prompt: 'The respectful way to use Carmina Gadelica in pagan practice is to learn from its forms and write your own prayers, rather than rewriting its Christian prayers as pagan ones.',
          options: ['True', 'False'],
          correct: [0],
          points: 1,
          explanation: 'True. They are Christian prayers. Learn their shape (short lines, threes, everyday tasks) and write your own.',
        },
        {
          id: 'q10',
          type: 'multi',
          prompt: 'When invoking a god in the old manner of praise, what might you name? Choose all that apply.',
          options: ['Their names and bynames', 'Their kin', 'Their deeds in the stories', 'Their places'],
          correct: [0, 1, 2, 3],
          points: 1,
          explanation: 'Names, kin, deeds and places make a strong praise, drawn from the stories you have read.',
        },
        {
          id: 'q11',
          type: 'single',
          prompt: 'In the complete rite, what is the omen with ogham staves?',
          options: ['An ancient druid rite preserved intact', 'A modern practice, asking whether gifts were welcome and what counsel is given', 'A required test that can fail the rite', 'A curse'],
          correct: [1],
          points: 1,
          explanation: 'Ogham omens are modern. Treat the result as counsel, not command.',
        },
        {
          id: 'q12',
          type: 'long',
          prompt: 'Write out the order of a Celtic rite you would lead alone, in your own words, saying briefly where each part comes from.',
          points: 4,
          explanation: 'Knowing why each part is there is what makes a modern rite honest.',
          rubric: 'Full marks (4): a complete order including saining, kindling, honouring the powers, offering, and thanks and closing (1); safe practice with fire and smoke (1); for each part, a fair note of its source or of it being modern (1); in their own words, with a god or occasion named (1).',
        },
        {
          id: 'q13',
          type: 'short',
          prompt: 'Share a praise you wrote for a god, and say which story its names and deeds come from.',
          points: 2,
          explanation: 'Praise drawn from the stories honours the god as the sources show them.',
          rubric: 'Full marks (2): a praise of several lines in their own words, speaking to a named god (1); names the story or source its details come from, accurately (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Celtic ritual',
      intro: 'Here you learn your coven’s Celtic rite: where its shape comes from, how to sain and move sunwise, how to make a sacred centre of fire, well and tree, how to give offerings in the spirit of hospitality, how to speak praise, and a complete rite to learn by heart. Practise each part at home before you take it in the coven.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'The shape of the rite',
          kind: 'study',
          instructions: `1. Read "The shape of a Celtic rite".
2. Ask your mentor for your coven's order of rite, and compare it with the lesson.
3. In the answer box, do the "Try this": one sentence for each part on where it comes from.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['celtic-ritual-shape-of-a-rite'],
          links: [coven('rituals')],
        },
        {
          title: 'Sain your home',
          kind: 'practice',
          instructions: `1. Read "Saining, sunwise and the threshold".
2. Sain your home with water, walking sunwise through every room, as in the "Try this". Use smoke only if it is safe and everyone in the house agrees.
3. Log each time. Do it twice, a week or more apart, and note how it felt.`,
          times: 2,
          response: 'none',
          checked_by: 'self',
          minutes: 20,
          docs: ['celtic-ritual-saining-and-sunwise'],
          links: [ritual('kitchen-threshold-salt-blessing'), herb('juniper')],
        },
        {
          title: 'Build your shrine',
          kind: 'practice',
          instructions: `1. Read "Fire, well and tree: the sacred centre".
2. Build a fire, well and tree shrine at home, and tend it every day for a week.
3. In the answer box, describe your shrine and which of the three felt most alive. Add a photo of it to your answer if you'd like your mentor to see it.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['celtic-ritual-fire-well-and-tree'],
          links: [page('altar')],
        },
        {
          title: 'Give the first portion',
          kind: 'practice',
          instructions: `1. Read "Offering and hospitality".
2. For two weeks, give the first drop or bite to the house once a day, and make one fuller offering at your shrine each week to a god, the ancestors or the land, disposing of it well.
3. Log each week.`,
          times: 2,
          response: 'none',
          checked_by: 'self',
          minutes: 15,
          docs: ['celtic-ritual-offering-and-hospitality'],
          links: [vessel('offering_bowl'), ritual('kitchen-family-meal-blessing')],
        },
        {
          title: 'Write a praise',
          kind: 'book',
          instructions: `1. Read "Prayer, praise and the spoken word".
2. Write a praise of six to twelve lines for a god whose stories you have read, and read it aloud at your shrine three times over a week, revising each time.
3. Write the final version in the answer box, with the story its details come from, and keep it in your Grimoire.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['celtic-ritual-prayer-and-praise'],
          links: [page('grimoire'), deity('brigid')],
        },
        {
          title: 'Keep the complete rite alone',
          kind: 'ritual',
          instructions: `1. Read "A complete rite, from start to finish, with an omen".
2. Keep the rite alone at home, step by step, with a god of your choosing.
3. In the answer box, write what each part did, which felt strongest, the omen if you took one, and what you'd change.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['celtic-ritual-a-complete-rite'],
          links: [spread('one-stave'), page('planner')],
        },
        {
          title: 'Take a part in a coven rite',
          kind: 'attend',
          instructions: `1. Ask your mentor for a part to take in the next coven rite: saining, kindling, greeting the land or the ancestors, giving the offering, or hosting.
2. Learn your words, and take your part, in person or in the app.
3. Send your mentor a message on this step afterwards: how it went, and what you'd do differently.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['celtic-ritual-a-complete-rite', 'celtic-ritual-shape-of-a-rite'],
          links: [coven('rituals')],
          solitary: 'Keep the complete rite alone a second time, giving special care to the part you found hardest the first time, and if you can, invite a friend to share the hospitality at the end.',
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
          quiz: 'quiz-celtic-ritual',
          links: [coven('ritual-builder'), holy('celtic/bealtaine')],
        },
      ],
    },
  ],
} satisfies CourseModule;
