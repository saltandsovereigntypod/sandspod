// Wiccan lore: the eight sabbats as Wicca keeps them. A lesson on the Wiccan
// Wheel (the sacred story of the Goddess and the God through the year, greater
// and lesser sabbats, the shape of a sabbat rite), then one lesson per sabbat
// on its Wiccan meaning and how a solitary Wiccan and a coven keep it. The
// festivals' history, folk customs and dates are taught in the Wheel of the
// Year lessons (wheel-lore), which each festival task also links, rather than
// repeated here. Each festival task carries its holiday key (holidays.ts,
// tradition 'wheel'). Public, open practice in original words. British
// spelling.

import type { CourseModule, CourseTask } from '../types';
import { deity, holy, page, ritual, seasonal, spread } from '../linkHelpers.ts';

const sabbats: { slug: string; name: string; rite: string; things: string[] }[] = [
  { slug: 'samhain', name: 'Samhain', rite: 'wicca-samhain-dumb-supper', things: ['pumpkin-lantern', 'pomegranate', 'apples'] },
  { slug: 'yule', name: 'Yule', rite: 'wicca-yule-log-sun-vigil', things: ['yule-log', 'evergreen-boughs'] },
  { slug: 'imbolc', name: 'Imbolc', rite: 'wicca-imbolc-brigids-bed', things: ['brigids-cross', 'brideog'] },
  { slug: 'ostara', name: 'the spring equinox', rite: 'wicca-ostara-seed-and-egg', things: ['ostara-eggs'] },
  { slug: 'beltane', name: 'Beltane', rite: 'wicca-beltane-flower-crown', things: ['flower-crown', 'may-bush'] },
  { slug: 'litha', name: 'Midsummer', rite: 'wicca-litha-noon-herb-gathering', things: ['sun-wheel'] },
  { slug: 'lammas', name: 'Lammas', rite: 'wicca-lammas-bread-offering', things: ['lammas-loaf', 'corn-dolly', 'wheat-sheaf'] },
  { slug: 'mabon', name: 'the autumn equinox', rite: 'wicca-mabon-thanks-and-balance', things: ['apples', 'gourds', 'wheat-sheaf'] },
];

const sabbatTask = (s: (typeof sabbats)[number]): CourseTask => ({
  title: `Keep ${s.name}`,
  kind: 'ritual',
  instructions: `1. A week or two before, read the Wiccan lesson on ${s.name}, and the Wheel of the Year lesson on the same festival for its history and folk customs. The app's calendar shows this year's date.
2. Plan how you will keep it: with the coven, alone, or both. Change your shrine and altar for the season.
3. On the day, keep the sabbat in a cast circle, with the sabbat's heart as the lesson describes, or in your coven's way.
4. Afterwards, write in the answer box what you did, what part of the Goddess and God's story you kept, what the land was doing, and one thing you'd do differently next year.
5. If you could not keep it on the day, keep a simple version within a few days and say so.`,
  times: 1,
  response: 'text',
  checked_by: 'mentor',
  minutes: 90,
  holiday: `wheel/${s.slug}`,
  docs: [`wicca-lore-${s.slug}`, `wheel-lore-${s.slug}`],
  links: [ritual(s.rite), spread(s.slug), ...s.things.map(seasonal)],
  solitary: `Keep ${s.name} alone in a cast circle with the solitary rite in the lesson (the app's ready-made ${s.name} rite is a good frame), and if you can, share the season's food with family or friends afterwards.`,
});

export default {
  id: 'wicca-lore',
  title: 'The Wiccan sabbats',
  docs: [
    {
      id: 'wicca-lore-the-wiccan-wheel',
      title: 'The Wiccan Wheel: the sacred story of the year',
      summary: 'How Wicca reads the eight festivals as one sacred story of the Goddess and the God, the greater and lesser sabbats, the main variations of the story, the shape of a sabbat rite, and how sabbats and esbats fit together through the year.',
      minutes: 16,
      links: [page('calendar'), deity('wiccan_goddess'), deity('horned_god'), spread('year-ahead'), holy('wheel/samhain'), holy('wheel/yule')],
      body: `## The same festivals, a particular story

The eight festivals of the Wheel of the Year are kept by many pagans who are not Wiccan, and the Wheel of the Year lessons in this Sanctuary teach their history, roots, dates and folk customs. This module does not repeat that. Each of your festival tasks links the Wheel lesson for the same day: read it for the history. What this module adds is how **Wicca** keeps the festivals: as the chapters of a sacred story, the life of the Goddess and the God through the year, kept in a cast circle.

## Where the Wiccan Wheel came from

Gardner's coven first kept the four "great sabbats" that Margaret Murray had described: Candlemas, May Eve, Lammas and Hallowe'en. In the late 1950s it added the solstices and equinoxes, and the eight-fold year took shape alongside Ross Nichols's Druids. The Wheel lesson "How the Wheel was assembled" tells this in full. Over the following decades, Wiccan writers, especially Doreen Valiente, Janet and Stewart Farrar (Eight Sabbats for Witches, 1981) and Scott Cunningham, wove the eight into a single story.

## Greater and lesser sabbats

Many Wiccans call the four cross-quarter festivals (Samhain, Imbolc, Beltane and Lammas) the **greater sabbats**, because they were Gardner's first four and come from the old Gaelic calendar. The solstices and equinoxes (Yule, the spring equinox, Midsummer and the autumn equinox) are the **lesser sabbats**. The words describe history, not importance: many Wiccans find Yule as great as any.

## The story, in one telling

There are many versions. Here is a common one, kept in much open Wicca.

- **Samhain:** the God has died at the harvest and gone into the dark, to the land of the dead. The Goddess, as the Crone, mourns and keeps the mysteries. The veil between the worlds is thin. Many Wiccans keep this as their new year.
- **Yule:** at the longest night, the Goddess gives birth to the God again as the child of promise, the reborn sun. Light begins to return.
- **Imbolc:** the Goddess recovers from the birth and returns as the Maiden; the young God grows. The first stirrings of spring.
- **The spring equinox:** light and dark in balance. The Maiden and the young God meet and play; seeds are sown.
- **Beltane:** the Goddess and God join in the sacred marriage, and the earth is made fertile.
- **Midsummer:** the God at the height of his power, the sun at its strongest; from now his strength begins to wane. The Goddess carries the harvest within her.
- **Lammas:** the God gives his life in the cut grain, so that the people may live. The first harvest.
- **The autumn equinox:** balance again; the second harvest; thanks. The God journeys towards the underworld, and the Goddess prepares to mourn.

Then the Wheel turns again to Samhain.

## Variations

Covens and books tell the story differently. You will meet:

- **The Oak King and the Holly King,** twin aspects of the God who rule the waxing and waning halves of the year and do battle at the solstices (or, in some covens, the equinoxes). A modern image popularised by the Farrars.
- **A Goddess-centred year,** in Dianic and some other traditions, where the Goddess's own cycle of Maiden, Mother and Crone is the story.
- **A land-centred year,** where the story follows what the land around the coven actually does, rather than a fixed myth.
- **A story without death,** in covens that prefer not to dramatise the God's death, keeping instead the sun's waxing and waning.

All are honest ways to keep the Wiccan year. Ask which your coven tells.

## The shape of a sabbat rite

A Wiccan sabbat follows the usual shape (cleansing, casting, quarters, the Goddess and God, purpose, heart, cakes and ale, thanks, release, opening), with the seasonal story at its heart. That heart might be:

- **a drama,** with members taking parts: the Goddess, the God, the Oak and Holly Kings;
- **a custom,** such as lighting the Yule candles, making Brigid's bed, dancing round a maypole;
- **a blessing** of something seasonal: seeds, bread, apples, the first flowers;
- **a meditation** on the season's meaning for each person's life.

Sabbats are festive. They are usually followed by a feast, and some are partly open to guests. The esbats, by contrast, are kept at the full moon for worship and magic; many covens do no magical workings at the sabbats, keeping them for celebration, though this varies.

## The southern hemisphere

In the southern hemisphere, most Wiccans turn the Wheel by six months to follow their own seasons, keeping Samhain at the end of April and Yule at the June solstice. The story turns with it. The Wheel lessons explain this in detail.

## Keeping the whole year

In this module you keep each sabbat as it comes, reading its Wiccan lesson and the Wheel lesson beforehand. It takes a year. By the end you will have lived the whole story once, and many Wiccans say that only then does the religion begin to make full sense.

> **Your coven:** Ask your mentor how your coven tells the story of the year: which version, whether it uses the Oak and Holly Kings, which sabbats are open to guests, and whether it works magic at the sabbats.

> **Try this:** Draw a circle in your Book of Shadows, divided into eight. In each segment, write the sabbat's name and one line of the Goddess and God's story at that point. Add to it as you keep each festival.

## What's old and what's modern

- **Old:** the festivals' roots in Gaelic, Anglo-Saxon, astronomical and folk custom (see the Wheel lessons); the dying and rising gods of many ancient religions.
- **Modern:** the Wiccan sabbats as one sacred story of the Goddess and God, from the 1950s to the 1980s.`,
    },
    {
      id: 'wicca-lore-samhain',
      title: 'Samhain in Wicca',
      summary: 'Samhain as Wiccans keep it: the God in the land of the dead, the Crone, the thin veil and the Wiccan new year; honouring the Mighty Dead; and a sabbat rite for a coven and for one person.',
      minutes: 15,
      links: [holy('wheel/samhain'), ritual('wicca-samhain-dumb-supper'), spread('samhain'), seasonal('pumpkin-lantern'), seasonal('pomegranate'), page('ancestors')],
      body: `## Samhain in the Wiccan story

For many Wiccans, Samhain, kept on the evening of 31 October in the northern hemisphere (the end of April in the south), is the most important sabbat of the year, and the start of the new year. The Wheel of the Year lesson on Samhain tells its history and folk customs: the Gaelic festival of summer's end, Hallowe'en, guising, apples and lanterns. Read it alongside this lesson.

In the Wiccan story, the God has given his life at the harvest and has passed into the land of the dead. There he is often seen as the **Lord of the Shadows**, the comforter and guide of the dead. The Goddess appears as the **Crone**, the wise old woman who keeps the cauldron of death and rebirth, and who, in some tellings, already carries the God's child, to be born at Yule. The worlds of the living and the dead are close, and the dead may be welcomed.

## Themes

- **Death and the dead.** Remembering those who have died in the past year and all the beloved dead; honouring **the Mighty Dead**, the witches and Wiccans who have gone before.
- **The thin veil.** The sense that the boundary between worlds is thin, making it a time for divination and for speaking to the dead in love.
- **Endings and new beginnings.** Many Wiccans keep Samhain as their new year, and make resolutions or let go of what has ended.
- **The Crone's wisdom.** Honouring age, wisdom, and the dark half of the year.

## Keeping Samhain in a coven

A coven's Samhain often includes:

1. The usual opening, with the circle and quarters, perhaps by candlelight only.
2. Inviting the Goddess as the Crone and the God as the Lord of the dead.
3. **The roll of the dead:** each person names those they remember, and lights a candle or places a token for them.
4. **A meditation or guided journey** to meet the beloved dead, led by someone experienced, gently and with consent, and always with grounding after.
5. **Divination** for the new year, with tarot, runes, a scrying bowl or apples.
6. **A dumb supper,** in some covens: a meal eaten in silence with a place laid for the dead (a modern custom, now common).
7. Cakes and ale, with a portion for the dead.
8. Thanks, release, opening, and a feast, often noisy and joyful after the solemn rite.

## A solitary Samhain rite

1. **Prepare** a place for the dead: photographs, names, mementos, a candle, and an offering of food they liked. Set your altar with dark cloth, autumn leaves, apples or a pomegranate.
2. **Cast your circle** and call the quarters, perhaps with only one candle burning.
3. **Invite the Goddess and God:** "Wise Crone, keeper of the cauldron; Lord of the shadows, guide of the dead: be with me on this night between the years."
4. **State your purpose:** "On this night I remember the dead, give thanks for the year that is ending, and welcome the new."
5. **Remember:** light a candle for each person you remember, and say their name and one thing about them. End with "and all the beloved dead, and the Mighty Dead of the Craft."
6. **Sit in silence** with them for some minutes. Speak to them if you wish.
7. **Let go:** write on a slip of paper something from the past year you are ready to let go of, and burn it safely in a cauldron or fireproof dish, or tear it up and bury it.
8. **Divine:** draw three cards or runes for the year ahead, using the Samhain spread in the app if you like.
9. **Cakes and ale,** with a portion for the dead.
10. **Thank** the dead, the Goddess and God, release the quarters, open the circle.
11. **Eat** something good and write in your Book of Shadows.

The app's ready-made "Samhain Dumb Supper" is a fuller solitary or household version.

## The Wiccan new year

If your coven keeps Samhain as new year, it can be a time to:

- review the year's Book of Shadows;
- renew your dedication, or reread your words;
- set intentions for the year ahead;
- clean and rededicate your altar.

## Care at Samhain

Samhain can bring grief to the surface. Keep it gentle if you are newly bereaved. Speaking to the dead in love does not require any reply, and you should not try to summon spirits. If anything unsettles you, ground firmly, eat, put the lights on, and talk to your mentor.

> **Safety:** Samhain is a night of many candles and lanterns. Use electric lights in pumpkins, keep real flames away from costumes and leaves, and put every flame out before you sleep. Burn paper only in a fireproof dish with water nearby.

> **Your coven:** Ask your mentor how your coven keeps Samhain: whether it reads a roll of the dead, keeps a dumb supper, welcomes guests, and whether it counts Samhain as its new year.

> **Try this:** Before Samhain, write the names of your beloved dead in your Book of Shadows or the app's ancestors page, with one memory of each.

## What's old and what's modern

- **Old:** Samhain as the Gaelic festival of summer's end; Hallowe'en customs; All Souls' prayers for the dead (see the Wheel lesson).
- **Modern:** the God as Lord of the dead, the Crone, the Wiccan new year, the Mighty Dead and the dumb supper.`,
    },
    {
      id: 'wicca-lore-yule',
      title: 'Yule in Wicca',
      summary: 'Yule as Wiccans keep it: the Goddess gives birth to the reborn sun, the Oak King takes the year from the Holly King, the vigil through the longest night, and a sabbat rite for a coven and for one person.',
      minutes: 15,
      links: [holy('wheel/yule'), ritual('wicca-yule-log-sun-vigil'), spread('yule'), seasonal('yule-log'), seasonal('evergreen-boughs'), deity('horned_god')],
      body: `## Yule in the Wiccan story

Yule is kept at the winter solstice, around 21 December in the northern hemisphere (21 June in the south): the longest night of the year, after which the days begin to lengthen. The Wheel of the Year lesson on Yule tells its history: the old English and Norse midwinter, the Yule log, evergreens and the many solstice customs. Read it alongside this lesson.

In the Wiccan story, Yule is the night of birth. Out of the longest darkness, the Goddess, as the Great Mother, gives birth to the God again as the **Child of Promise**, the newborn sun. He who died at the harvest and passed through the land of the dead is reborn. Light returns to the world, though it is still very small.

Covens that tell the story of the **Oak King and the Holly King** keep a battle at Yule: the Holly King, who has ruled the waning year since midsummer, gives way to the Oak King, who will rule the waxing year until midsummer.

## Themes

- **Rebirth and hope.** The darkest moment holds the seed of light. Many Wiccans find this the most hopeful sabbat.
- **The Mother.** The Goddess as the one who gives birth: to the sun, to all life.
- **Vigil.** Keeping watch through the longest night and greeting the sunrise.
- **Hearth and gathering.** Warmth, food, gifts and family, in the depth of winter.

## Keeping Yule in a coven

A coven's Yule often includes:

1. The circle cast in darkness, or near-darkness.
2. Inviting the Goddess as the Mother in labour, and calling on the God to be reborn.
3. **The rebirth of the light:** in darkness, a single candle is lit, often from a central flame or by the High Priestess, to represent the newborn sun. Light passes from candle to candle round the circle until all are lit.
4. **The battle of the kings,** in some covens: two members enact the Oak King and Holly King, and the Holly King yields.
5. **Blessing the Yule log,** decorated with evergreens, and lighting it or candles set in it.
6. **Gifts** for the coven or for those in need.
7. Cakes and ale, then a feast. Some covens keep vigil through the night and greet the sunrise together.

## A solitary Yule rite

1. **Prepare** your altar with evergreens (holly, ivy, pine, fir), a gold or red candle for the newborn sun, and a Yule log or a log-shaped candle holder if you have one.
2. **Put out all the lights** in the room except what you need to see safely.
3. **Cast your circle** and call the quarters in near-darkness.
4. **Invite the Goddess and God:** "Great Mother, labouring in the longest night; Lord of light, waiting to be born: be with me."
5. **Sit in the dark** for a few minutes. Feel the long night. Think of what has been dark in your own year.
6. **Light the sun candle:** "From the dark womb of night, the sun is born again. Welcome, child of promise. Light returns."
7. **Light any other candles** from it, one by one, naming a hope for the coming year with each.
8. **Bless the Yule log** or your evergreens: "May the life that never fails, green through the winter, bless this house."
9. **Cakes and ale,** with a portion for the gods.
10. **Thank, release and open.**
11. **Keep vigil,** if you can: stay up through the night, or rise before dawn, and greet the sunrise from a window or outdoors.

The app's ready-made "Yule Log and Sun Vigil" is a fuller version.

## Yule and Christmas

Many Wiccans live among families who keep Christmas. Yule and Christmas share many customs: evergreens, lights, gifts, feasting, the birth of a holy child. Some Wiccans keep both, honouring their family's celebration as well as their own. Others keep Yule quietly on the solstice and join the family's Christmas as a guest. There is no single right way.

## The twelve days

Many Wiccans keep Yule not as a single night but as a season, often for twelve days, echoing the old twelve days of Christmas. Each night, light a candle on your shrine and name one thing you hope the returning light will bring. On the last night, gather up the evergreens with thanks and burn them safely or compost them, and keep a small piece of the Yule log, if you burned one, to light next year's.

## Care at Yule

Midwinter is hard for many people: short days, cold, money worries, family pressure, loneliness and grief. If the season is heavy for you, keep your rite simple, get outside in what daylight there is, and reach out to your coven. Yule's message is that light returns, but it is all right if you cannot feel that yet.

> **Safety:** Yule logs and candles with evergreens are a real fire risk: dried pine and holly burn fast. Keep flames well away from greenery, never leave them burning, and if you burn a log, do it in a proper fireplace or a safe outdoor fire pit, with water to hand.

> **Your coven:** Ask your mentor how your coven keeps Yule: whether it tells the Oak and Holly Kings, keeps vigil, exchanges gifts, and how members with family Christmases join in.

> **Try this:** On the morning after Yule, watch the sunrise and note the time. At Imbolc, watch it again and note how far it has moved.

## What's old and what's modern

- **Old:** midwinter festivals, the Yule log, evergreens, the old English Modraniht ("mothers' night"), Newgrange's solstice sunrise (see the Wheel lesson).
- **Modern:** the Goddess giving birth to the sun God, and the Oak and Holly Kings as Wiccans tell them.`,
    },
    {
      id: 'wicca-lore-imbolc',
      title: 'Imbolc in Wicca',
      summary: 'Imbolc as Wiccans keep it: the Goddess returns as the Maiden, the young God grows, the first stirrings of spring, purification and new beginnings, a favoured time for dedications; with a rite for a coven and for one person.',
      minutes: 15,
      links: [holy('wheel/imbolc'), ritual('wicca-imbolc-brigids-bed'), spread('imbolc'), seasonal('brigids-cross'), seasonal('brideog'), deity('brigid')],
      body: `## Imbolc in the Wiccan story

Imbolc is kept on 1 and 2 February in the northern hemisphere (the start of August in the south), halfway between the winter solstice and the spring equinox. The Wheel of the Year lesson on Imbolc tells its history: the Gaelic festival, St Brigid's Day and the goddess Brigid, Candlemas, Brigid's crosses and the brídeóg. Read it alongside this lesson.

In the Wiccan story, the Goddess, who gave birth at Yule, recovers and returns as the **Maiden**: young, fresh and full of promise. The God is a growing child, the strengthening sun. The earth is still cold, but beneath it life is stirring: the first snowdrops, lambs, longer evenings. Many Wiccans honour the Goddess at Imbolc as Brigid, goddess of the hearth, healing, poetry and smithcraft.

## Themes

- **The Maiden.** The Goddess young again: beginnings, inspiration, possibility.
- **Purification.** Clearing away winter: spring cleaning, washing, renewal.
- **Light.** Candles, in many covens a crown of lights or many candles lit together, welcoming the strengthening sun.
- **New beginnings and dedication.** Many covens choose Imbolc for dedications, and some for initiations, because it is the festival of beginnings.
- **Inspiration.** Brigid as goddess of poetry and craft: writing, making, learning.

## Keeping Imbolc in a coven

A coven's Imbolc often includes:

1. **Cleansing,** done more thoroughly than usual: the space swept, salt water sprinkled, each member purified.
2. Inviting the Goddess as the Maiden or as Brigid, and the God as the young sun.
3. **The lighting of the candles:** many small candles, sometimes a crown of lights worn by the High Priestess or a chosen member, lit in turn.
4. **Brigid's bed:** in many covens, a figure of Brigid made of straw or rushes (a brídeóg) is laid in a basket "bed" with a wand or a white rod beside her, and she is invited in: "Brigid is welcome." This custom comes from Scottish and Irish folk practice.
5. **Dedications,** if any are planned.
6. **Blessing:** seeds for spring, candles for the year, or members' creative work.
7. Cakes and ale (milk and honey cakes are traditional in many covens), thanks, release, opening, and a feast.

## A solitary Imbolc rite

1. **Clean** your home and altar the day before; open windows; sweep out the winter.
2. **Set your altar** with a white cloth, white candles (as many as you safely can), snowdrops or early flowers, a bowl of milk or water, and a Brigid's cross if you have one or have made one.
3. **Take a cleansing bath** or wash with attention.
4. **Cast your circle** and call the quarters.
5. **Invite the Goddess and God:** "Lady, Maiden of the returning spring; young Lord, growing sun: be with me."
6. **Light the candles** one by one, saying with each something you want to begin or renew: "I kindle this flame for..."
7. **Make Brigid's bed,** if you like: lay a small straw or cloth figure in a basket with a white stick, and say "Brigid, come in; your bed is ready."
8. **Bless your work:** a pen, a notebook, a tool, seeds for spring.
9. **Renew your dedication:** reread your words of dedication, or speak new promises for the year.
10. **Cakes and ale** (milk and honey cakes, or bread and butter), with a portion for the gods.
11. **Thank, release and open.**

The app's ready-made "Imbolc: Brigid's Bed" is a fuller version.

## Living the season

The weeks around Imbolc are a good time for small, practical beginnings. Many Wiccans:

- give the house a proper spring clean, opening every window for an hour on a dry day;
- begin a new notebook, a new course of study or a new creative project, and bless it at the sabbat;
- start seeds indoors on a sunny windowsill, ready for spring;
- look for the first snowdrops, catkins and lambs, and note in their Book of Shadows when they appear each year;
- reread their dedication and decide what they want to grow in themselves before Beltane.

In the Wiccan story, the Maiden is all possibility. Let the season remind you that it is never too late to begin something.

## Brigid, carefully

Brigid is honoured by pagans, by Christians as St Brigid of Kildare, and by people of Irish heritage as part of their own culture. Wiccans who honour her should learn her stories from Irish sources and respect the living traditions around her, especially the saint's day and holy wells. The Library and the dedication journey for Brigid are good places to begin.

> **Safety:** Many candles in a small space is a real fire risk. Use a large tray of sand or a fireproof surface, keep them away from fabric and hair, and never wear a crown of real lit candles. Use battery candles for a crown.

> **Your coven:** Ask your mentor how your coven keeps Imbolc: whether it honours Brigid, makes her bed, holds dedications at this time, and whether there is a crown of lights.

> **Try this:** Make a Brigid's cross from rushes, straw or paper. Hang it above your door or on your altar for the year, and burn or bury the old one next Imbolc.

## What's old and what's modern

- **Old:** the Gaelic festival, St Brigid's Day customs, Brigid's crosses and the brídeóg, Candlemas candles (see the Wheel lesson).
- **Modern:** the Goddess as Maiden at Imbolc, Imbolc as a time for Wiccan dedications, and the Wiccan blend of these customs.`,
    },
    {
      id: 'wicca-lore-ostara',
      title: 'The spring equinox in Wicca',
      summary: 'The spring equinox as Wiccans keep it: light and dark in balance, the Maiden and the young God meeting in the greening world, seeds and eggs, and a sabbat rite for a coven and for one person, with honesty about Eostre and the hare.',
      minutes: 15,
      links: [holy('wheel/ostara'), ritual('wicca-ostara-seed-and-egg'), spread('ostara'), seasonal('ostara-eggs'), deity('eostre'), ritual('green-seed-blessing-before-sowing')],
      body: `## The equinox in the Wiccan story

The spring equinox falls around 20 March in the northern hemisphere (22 September in the south), when day and night are of equal length. Many Wiccans call it Ostara, a name given in the 1970s from Jacob Grimm's form of Bede's goddess Eostre. The Wheel of the Year lesson on the spring equinox tells its history, and is honest about how little is known of Eostre. Read it alongside this lesson.

In the Wiccan story, light and dark stand in balance, and from now the light will be stronger. The Goddess, as the Maiden, walks the greening earth, and the young God, growing towards manhood, meets her. Some covens tell this as a courtship: the two meet, play and fall in love, and their union will come at Beltane. The earth wakes: buds open, birds pair and build, seeds are sown.

## Themes

- **Balance.** Equal day and night; balance in one's own life between work and rest, giving and receiving.
- **Growth and fertility.** Seeds, eggs, buds, young animals: everything beginning to grow.
- **The meeting of the Maiden and the young God.** Joy, play, attraction, the energy of youth.
- **Planting intentions.** Sowing, literally and in one's life, what you want to grow this year.

## Eggs, hares and honesty

Eggs and hares are everywhere at this season. Eggs as symbols of new life are found in many cultures, and decorated eggs at Easter go back centuries in Christian Europe. The idea that hares and eggs belonged to an ancient goddess Eostre is a nineteenth-century and later invention: Bede, our only source, says nothing of either. Wiccans can enjoy both as symbols of spring without claiming they are ancient to a goddess about whom we know almost nothing.

## Keeping the equinox in a coven

A coven's spring equinox often includes:

1. The usual opening, perhaps outdoors if the weather allows.
2. Inviting the Goddess as the Maiden in the greening world, and the God as the young lord of the woods.
3. **Balance:** a meditation on light and dark, sometimes with a black and a white candle lit together.
4. **The meeting,** in some covens: a light-hearted drama of the Maiden and the young God, or a game or dance.
5. **Blessing seeds:** each member brings seeds to be blessed on the pentacle, to plant afterwards with an intention.
6. **Eggs:** decorated eggs blessed and shared, or hidden for children to find.
7. Cakes and ale, thanks, release, opening, and a spring feast.

## A solitary equinox rite

1. **Set your altar** with spring flowers, a black and a white candle, a small pot of soil, seeds, and eggs (real, painted, or wooden).
2. **Cast your circle** and call the quarters.
3. **Invite the Goddess and God:** "Lady of the green and growing earth; young Lord of the waking wood: be with me in this time of balance."
4. **Light the black and white candles** together: "Day and night are equal. Dark and light are in balance. From now, the light grows."
5. **Reflect on balance:** sit and consider where your life is out of balance, and one thing you could do about it.
6. **Bless and plant seeds:** hold the seeds, breathe your intention into them ("as these grow, may my courage grow"), bless them on the pentacle, and plant them in the pot.
7. **Bless an egg:** hold it, and give thanks for new life. Eat it later (if it is a real egg, cooked), or bury it in the garden as an offering.
8. **Cakes and ale,** with a portion for the gods.
9. **Thank, release and open.**
10. **Tend your seeds** in the weeks after, and note in your Book of Shadows how they grow, alongside your intention.

The app's ready-made "Ostara: Seed and Egg" is a fuller version.

## Balance in your own life

The equinox invites an honest look at balance. Make two lists in your Book of Shadows: what gives you energy and what drains it; what you give to others and what you receive. Notice where one side is much heavier than the other. Choose one small change for the light half of the year, and bless it at the sabbat. Balance in Wicca is not a fixed point but a movement, like the year itself: day and night are equal for only a moment before the scales tip again.

## Taking it outside

The spring equinox is a good time to begin keeping rites outdoors. Find a quiet place, check whether you need permission, and keep it simple: a cloth, a candle in a jar, a bottle of water for offerings. Take everything away with you.

> **Safety:** Raw eggs carry a risk of salmonella; wash hands after handling, and cook any you eat. If you dye eggs, use food-safe colours. Plant seeds of plants you know: some garden plants are toxic to pets.

> **Your coven:** Ask your mentor how your coven keeps the spring equinox: whether it tells the meeting of the Maiden and young God, blesses seeds, or keeps it outdoors.

> **Try this:** Plant a seed with an intention at the equinox. Keep a short note each week in your Book of Shadows of how both are growing, until Midsummer.

## What's old and what's modern

- **Old:** the equinox itself; eggs as symbols of new life; Bede's single mention of Eostre (see the Wheel lesson).
- **Modern:** the name Ostara for the festival (1970s), Eostre's hares and eggs, and the Wiccan story of the Maiden and the young God.`,
    },
    {
      id: 'wicca-lore-beltane',
      title: 'Beltane in Wicca',
      summary: 'Beltane as Wiccans keep it: the sacred marriage of the Goddess and God, the fertility of the earth, the maypole and the fires, handfastings, the Great Rite in token, and keeping it joyful with clear consent; with a rite for a coven and for one person.',
      minutes: 15,
      links: [holy('wheel/beltane'), ritual('wicca-beltane-flower-crown'), spread('beltane'), seasonal('flower-crown'), seasonal('may-bush'), ritual('green-hawthorn-may-blossom-blessing')],
      body: `## Beltane in the Wiccan story

Beltane is kept on May Eve and May Day, 30 April and 1 May in the northern hemisphere (the turn of October into November in the south). The Wheel of the Year lesson on Beltane tells its history: the Gaelic Bealtaine and its fires, May Day customs, the maypole, May blossom and the May Queen. Read it alongside this lesson.

In the Wiccan story, Beltane is the **sacred marriage**. The Goddess, now in the full bloom of her womanhood, and the God, now grown, join in love, and from their union the earth becomes fertile. Everything flowers. In the Wiccan year this is the festival of love, desire, pleasure and joy, as the Charge of the Goddess says: all acts of love and pleasure are her rituals.

## Themes

- **Union and love.** The joining of the Goddess and God, and of all opposites that make life.
- **Fertility.** Of the earth, of animals, of people and of creative projects.
- **Joy and pleasure.** Dancing, flowers, music, feasting, the body.
- **Fire.** The Beltane fires of Gaelic custom; leaping a small fire for luck and blessing.
- **Handfasting.** Beltane is a favourite time for Wiccan weddings, called handfastings.

## Consent first

Because Beltane celebrates love and desire, it needs clear boundaries. In any coven:

- no one is ever expected to kiss, touch, pair off or do anything sexual;
- flirting is welcome only where it is welcome;
- dances are joined freely, and anyone may step out;
- the Great Rite at Beltane, as at any sabbat, is enacted **in token**, with athame and chalice, unless a committed couple choose otherwise in private.

> **Safety:** No genuine coven requires sex of anyone at Beltane or any other time. If you feel pressured, leave, and tell someone you trust.

## Keeping Beltane in a coven

A coven's Beltane often includes:

1. The circle cast outdoors if possible, with flowers and greenery everywhere.
2. Inviting the Goddess as the bride and Queen of May, and the God as the bridegroom, often the Green Man or the Horned God in his fullness.
3. **The sacred marriage:** enacted in token, often with the athame and chalice, with great joy, perhaps with a crowning of a May Queen and King.
4. **The maypole,** if the coven has one: members dance in and out with ribbons, weaving them round the pole.
5. **The fire:** a small fire or a cauldron with a candle, which members may leap over (carefully) or pass their hands over for blessing.
6. **Blessing:** flowers, crowns, handfasting cords, or couples who ask for it.
7. Cakes and ale, thanks, release, opening, and a feast with music.

## A solitary Beltane rite

1. **Gather flowers** in the days before, with thanks, from your garden or where it is allowed. Make a flower crown if you like.
2. **Set your altar** with flowers, greenery, red and white ribbons, your athame and chalice, and a small fire or a candle in your cauldron or a fireproof dish.
3. **Cast your circle** and call the quarters.
4. **Invite the Goddess and God:** "Lady in your flowering, Queen of May; Lord of the greenwood, in your strength: be with me on this day of joy."
5. **Honour their union:** hold up the athame and chalice, then lower the blade into the cup: "Lady and Lord, in your joining all life is blessed. As above, so below; as within, so without."
6. **Wear your crown,** or tie a ribbon on a tree or a branch, with a wish for what you want to flourish this summer.
7. **Pass your hands over the flame** (not through it) and ask for blessing, health and joy.
8. **Celebrate:** dance, sing, or simply enjoy the flowers and the light. Pleasure is the point.
9. **Cakes and ale,** with a portion for the gods.
10. **Thank, release and open.**

The app's ready-made "Beltane Flower Crown" is a fuller version.

## Handfastings

A **handfasting** is a Wiccan or pagan wedding, in which the couple's hands are bound together with a cord. Some couples are handfasted "for a year and a day", some for life, and some "for as long as love shall last". A handfasting can be a legal marriage in some countries if performed by an authorised celebrant; elsewhere it is religious only, and couples who want a legal marriage need a separate ceremony. Check the law where you live.

## Beltane on your own terms

Not everyone feels like celebrating love and desire. If you are single and sad about it, grieving, asexual, recovering from harm, or simply not in that mood, Beltane can be kept as a festival of flowering, creativity and joy in the earth. The Goddess and God's union is the union that makes all life; it belongs to everyone.

> **Safety:** Leaping fires is for small, low flames only, with loose clothing and hair tied back, and never after drinking. A candle in a cauldron that you pass your hands over is safer and keeps the meaning. Never pick protected wild flowers.

> **Your coven:** Ask your mentor how your coven keeps Beltane: whether it is held outdoors, whether there is a maypole or a fire, how it marks the sacred marriage, and whether it holds handfastings.

> **Try this:** Spend an hour outdoors on Beltane morning looking for every flower in bloom. Write down what you find.

## What's old and what's modern

- **Old:** the Gaelic Bealtaine fires, May Day customs, maypoles, the May Queen (see the Wheel lesson).
- **Modern:** the sacred marriage of the Goddess and God as Wiccans tell it, the Great Rite in token at Beltane, and the Wiccan handfasting.`,
    },
    {
      id: 'wicca-lore-litha',
      title: 'Midsummer in Wicca',
      summary: 'Midsummer as Wiccans keep it: the God at the height of his power, the Holly King taking the year from the Oak King, the Goddess carrying the harvest, herbs gathered for the year, and a sabbat rite for a coven and for one person.',
      minutes: 15,
      links: [holy('wheel/litha'), ritual('wicca-litha-noon-herb-gathering'), spread('litha'), seasonal('sun-wheel'), ritual('green-harvesting-herbs-with-thanks'), deity('horned_god')],
      body: `## Midsummer in the Wiccan story

Midsummer is kept at the summer solstice, around 21 June in the northern hemisphere (21 December in the south): the longest day, when the sun is at its highest and strongest. Many Wiccans call it Litha, a name given in the 1970s from Bede's month name. The Wheel of the Year lesson on Midsummer tells its history: St John's Eve fires, rolling wheels, herbs gathered on the eve. Read it alongside this lesson.

In the Wiccan story, the God is at the **height of his power**: the sun at noon on the longest day, the lord in his full strength and glory. But the height is also the turning point: from now on the days shorten, and the God begins his long journey towards the harvest and the dark. The Goddess, joined with him at Beltane, carries within her the coming harvest. In covens that tell the **Oak King and the Holly King**, this is the second battle of the year: the Oak King, who has ruled the waxing year, yields to the Holly King, lord of the waning year.

## Themes

- **The fullness of light.** Strength, success, abundance, joy at the height of summer.
- **The turning.** Every height is also a beginning of descent; celebrating what is, while knowing it will change.
- **The sun's power.** Healing, vitality, courage.
- **Herbs.** In folk custom, herbs gathered at Midsummer were thought especially powerful, and St John's wort is named for the saint's day.
- **The fairies.** In English folklore (and Shakespeare's A Midsummer Night's Dream), Midsummer Eve was a time of fairy mischief.

## Keeping Midsummer in a coven

A coven's Midsummer often includes:

1. A rite outdoors, often at noon, sunrise or sunset, or around a bonfire on the eve.
2. Inviting the God in his full glory as the sun king, and the Goddess as the fruitful Mother.
3. **The battle of the kings,** in some covens: the Oak King yields to the Holly King.
4. **A sun wheel:** a wheel or wreath of flowers and greenery, sometimes set alight and rolled downhill (in folk custom), more often blessed and hung up for the year.
5. **Gathering herbs:** members gather herbs for the year's healing and magic, with thanks.
6. **A bonfire,** where it is safe and permitted: members may cast herbs into it with wishes.
7. Cakes and ale, thanks, release, opening, and a long summer feast.

## A solitary Midsummer rite

1. **Rise for the sunrise,** if you can, or plan the rite for noon or sunset.
2. **Set your altar** outdoors or in the brightest room, with sunflowers or yellow and gold flowers, a gold candle, and a small sun wheel or wreath if you have made one.
3. **Cast your circle** and call the quarters.
4. **Invite the Goddess and God:** "Lord of the sun, in your full glory; Lady of the fruitful earth: be with me on this longest day."
5. **Greet the sun:** face it (never look directly at it), raise your arms and say: "Hail, Lord of light, at the height of your power. I honour your strength, and I know your turning."
6. **Reflect** on what in your life is at its height now, and what you are ready to let begin to change.
7. **Gather herbs,** if you have a garden or permission: take a little of each with thanks, and leave plenty. Bind them in a bundle to dry and hang them up for the year.
8. **Bless your sun wheel** and hang it in your home.
9. **Cakes and ale,** with a portion for the gods.
10. **Thank, release and open.**
11. **Stay outside** as long as you can in the long evening light.

The app's ready-made "Litha: Noon Herb Gathering" is a fuller version.

## The height and the turning

Midsummer carries a quiet lesson that many Wiccans value: every height is also a turning. The God is never stronger than today, and from today his light begins to wane. It is a good moment to celebrate fully what is going well in your life, without holding on to it as if it could last forever. Some Wiccans write a letter at Midsummer to the self who will read it at Yule, describing the fullness of this season, so that in the dark they remember the light will come again.

## The far north and the tropics

In the far north, Midsummer brings nights that never quite darken; in the tropics, day length barely changes. Wiccans in these places adapt the sabbat to what their land actually does, as the Wheel lessons discuss. The story of the God's height and turning can be told wherever you are.

> **Safety:** Never look directly at the sun. Use sunscreen, water and shade at outdoor rites. Bonfires only where permitted, with water to hand, and never in dry weather or on peat. Know your herbs before you pick: some, like foxglove, are poisonous, and St John's wort can interact with many medicines if taken.

> **Your coven:** Ask your mentor how your coven keeps Midsummer: at sunrise, noon or night; whether it tells the battle of the kings; whether it gathers herbs together.

> **Try this:** Note the time of sunrise and sunset on Midsummer Day. Compare them with what you noted at Yule.

## What's old and what's modern

- **Old:** the solstice; St John's Eve fires, wheels and herbs; English midsummer fairy lore (see the Wheel lesson).
- **Modern:** the name Litha for the festival (1970s), the God at his height, and the Oak and Holly Kings as Wiccans tell them.`,
    },
    {
      id: 'wicca-lore-lammas',
      title: 'Lammas in Wicca',
      summary: 'Lammas as Wiccans keep it: the first harvest, the God who gives his life in the grain, John Barleycorn, bread blessed and shared, and gratitude and sacrifice; with a rite for a coven and for one person.',
      minutes: 15,
      links: [holy('wheel/lammas'), ritual('wicca-lammas-bread-offering'), spread('lammas'), seasonal('lammas-loaf'), seasonal('corn-dolly'), deity('lugh')],
      body: `## Lammas in the Wiccan story

Lammas, also called Lughnasadh, is kept on 1 August in the northern hemisphere (the start of February in the south): the beginning of the harvest. Many Wiccans use the English name Lammas, "loaf mass", from the Anglo-Saxon church custom of blessing bread from the first grain; others use the Gaelic Lughnasadh, the festival of the god Lugh. The Wheel of the Year lesson on Lughnasadh and Lammas tells the history of both. Read it alongside this lesson.

In the Wiccan story, Lammas is the festival of **sacrifice**. The God, who reached his height at Midsummer, now gives his life in the grain: he is the corn that is cut down so that the people may eat. His death is not a defeat but a gift, and he will be reborn. The Goddess is the Mother of the harvest, the earth that has borne the grain, and she will mourn him as the year darkens.

## John Barleycorn

Many Wiccan covens tell the Lammas story through the folk song "John Barleycorn", known in English broadside ballads from the seventeenth century, in which John Barleycorn (the barley) is "killed": cut down, beaten, ground and made into ale and bread, yet "proves the strongest man at last". The song was almost certainly a joking drinking song, not a survival of pagan ritual. But Wiccans, following writers like Frazer, have found in it a moving image of the God in the grain, and many covens sing it at Lammas.

## Themes

- **The first harvest.** The first fruits of the year's work, literal and personal.
- **Sacrifice.** The God gives himself; what must be given up or cut away for something to be gained.
- **Gratitude.** Thanks for food, for the land, and for those who grow and harvest it.
- **Bread.** The God's body in the grain, baked and shared.
- **Skill and games,** from the Gaelic Lughnasadh with its fairs and contests, honouring Lugh, god of many skills.

## Keeping Lammas in a coven

A coven's Lammas often includes:

1. A rite outdoors, near fields if possible.
2. Inviting the Goddess as Mother of the harvest, and the God as the lord of the grain.
3. **The cutting of the grain:** in some covens, a sheaf or a figure of John Barleycorn is "cut down" with the boline, in a small drama of the God's sacrifice.
4. **The loaf:** a loaf baked by members, often in the shape of a man or a sun or a sheaf, is blessed and broken, and shared as the God's gift.
5. **First fruits:** members bring the first fruits of their own year's work (a finished project, a skill learned, a harvest from the garden) and offer thanks for them.
6. **Games or contests,** in some covens, honouring Lugh.
7. Cakes and ale (often the loaf itself), thanks, release, opening, and a harvest feast.

## A solitary Lammas rite

1. **Bake bread** the day before, or on the day, if you can: a simple loaf, perhaps shaped like a sun or a sheaf. As you knead, think of the grain, the sun and rain that grew it, and the people who harvested it. A bought loaf is fine.
2. **Set your altar** with the bread, wheat or other grain, early fruits, a gold or orange candle, and a corn dolly if you have one.
3. **Cast your circle** and call the quarters.
4. **Invite the Goddess and God:** "Mother of the harvest, Lady of the fruitful earth; Lord of the grain, who gives his life that we may live: be with me."
5. **Honour the sacrifice:** hold up the loaf: "Lord of the grain, you were cut down that we might eat. I thank you for your life, given in this bread."
6. **First fruits:** name the first harvests of your own year, the things you have achieved or grown, and give thanks for each.
7. **What to give up:** consider what you might need to sacrifice or let go of for a greater harvest. Write it down.
8. **Break the bread:** break the loaf, set the first piece aside for the gods, and eat a piece with thanks.
9. **Cakes and ale,** with the loaf as the cake.
10. **Thank, release and open.**
11. **Offer** the first piece outside afterwards, for the birds.

The app's ready-made "Lammas Bread Offering" is a fuller version.

## Gratitude in practice

Lammas is a good time for practical thanks: give to a food bank, support local farmers, learn where your food comes from, or volunteer at a community garden. In Wicca, worship and right action go together.

> **Safety:** If you or anyone sharing has coeliac disease or a wheat allergy, bake a gluten-free loaf or use oatcakes or rice cakes. Keep the boline away from hands when cutting sheaves; children should not handle it.

> **Your coven:** Ask your mentor how your coven keeps Lammas: whether it enacts the cutting of the grain, sings John Barleycorn, holds games, and who bakes the loaf.

> **Try this:** Bake bread for Lammas, from scratch if you can. Write in your Book of Shadows how it felt to make it as an offering.

## What's old and what's modern

- **Old:** the Gaelic Lughnasadh and Lugh; the Anglo-Saxon loaf mass; harvest customs and corn dollies; the John Barleycorn ballads (see the Wheel lesson).
- **Modern:** the God's sacrifice in the grain as Wiccans tell it, and John Barleycorn sung as a sacred song.`,
    },
    {
      id: 'wicca-lore-mabon',
      title: 'The autumn equinox in Wicca',
      summary: 'The autumn equinox as Wiccans keep it: balance again, the second harvest and thanksgiving, the God’s descent towards the underworld and the Goddess’s mourning, and a sabbat rite for a coven and for one person, with honesty about the name Mabon.',
      minutes: 15,
      links: [holy('wheel/mabon'), ritual('wicca-mabon-thanks-and-balance'), spread('mabon'), seasonal('apples'), seasonal('gourds'), seasonal('wheat-sheaf')],
      body: `## The equinox in the Wiccan story

The autumn equinox falls around 22 September in the northern hemisphere (20 March in the south), when day and night are again equal, and from now the dark grows longer. Many Wiccans call it Mabon, a name given by Aidan Kelly in the 1970s from Mabon ap Modron, a figure in Welsh legend. As the Wheel of the Year lesson on the autumn equinox explains, there is no old link between Mabon and the equinox; Kelly chose the name because it sounded right. Read that lesson alongside this one for the history and customs.

In the Wiccan story, the equinox is the **second harvest**: the fruits, the apples, the last of the grain gathered in. Light and dark stand in balance once more, but now the dark is winning. The God, who gave his life at Lammas, begins his journey into the underworld, the land of the dead. The Goddess, Mother of the harvest, prepares to mourn him and to become the Crone. Some covens borrow the Greek story of Persephone, who goes down to the underworld at this season while her mother Demeter grieves, though the Greek festivals kept it differently.

## Themes

- **Thanksgiving.** Gratitude for the harvest of the year: food, friendship, work, growth.
- **Balance.** Equal day and night; weighing up the year.
- **Descent.** Going inward; preparing for the dark half of the year.
- **Sharing.** Harvest suppers, giving to those in need.
- **Letting go.** As the leaves fall, releasing what is finished.

## Keeping the equinox in a coven

A coven's autumn equinox often includes:

1. The usual opening, perhaps with an altar heaped with fruit, gourds, nuts and grain.
2. Inviting the Goddess as the Mother of the harvest, turning towards her Crone aspect, and the God as the one who departs.
3. **Balance:** a black and a white candle, as at the spring equinox, but now with the dark one lit first or left burning last.
4. **The descent,** in some covens: a short drama or meditation on the God's journey into the underworld, and the Goddess's grief.
5. **Thanksgiving:** each member names what they are grateful for from the year's harvest.
6. **Apples:** an apple cut crosswise to show the five-pointed star within (a favourite Wiccan teaching), shared, and seeds kept or planted.
7. **Giving:** food collected for a food bank.
8. Cakes and ale, thanks, release, opening, and a harvest supper.

## A solitary equinox rite

1. **Set your altar** with autumn fruit, nuts, gourds, leaves, a black and a white candle, and an apple and your boline.
2. **Cast your circle** and call the quarters.
3. **Invite the Goddess and God:** "Mother of the harvest, Lady of the turning year; Lord who journeys into the dark: be with me in this time of balance."
4. **Light the white candle, then the black:** "Day and night are equal. From now, the dark grows. I give thanks for the light, and I welcome the dark."
5. **Give thanks:** name aloud, one by one, at least five things you are grateful for from this year. Take your time.
6. **Weigh the year:** sit with the question: what has this year's harvest been? What did I sow that did not grow? What do I take into the dark?
7. **Cut the apple** crosswise and look at the star within: "The star of the Goddess, hidden in the fruit." Eat half and set half aside as an offering.
8. **Let go:** gather a few fallen leaves; name something you are ready to release with each, and let them go into the wind or onto the earth.
9. **Cakes and ale,** with a portion for the gods.
10. **Thank, release and open.**
11. **Give:** in the week after, give food or time to someone in need.

The app's ready-made "Mabon: Thanks and Balance" is a fuller version.

## Preparing for the dark half

The autumn equinox opens the dark half of the year, which Wicca does not treat as something to be endured but as a season with its own gifts: rest, reflection, study, dreams, and the company of the dead. In the weeks after, many Wiccans turn their practice inward: longer evening devotions, more reading, divination, and time with their Book of Shadows. Prepare your altar for the change: put away the summer flowers, bring in dark cloth, seeds, nuts and candles for the long evenings.

## Gratitude as a practice

Gratitude is one of the simplest and most powerful Wiccan practices. Many Wiccans keep a gratitude list through the autumn, adding one thing each day until Samhain. It is a good way to enter the dark half of the year.

> **Safety:** Wild fruits, nuts and fungi gathered for the altar must not be eaten unless you are certain what they are. Conkers (horse chestnuts), yew berries and many fungi are poisonous. Keep autumn decorations away from candles: dry leaves catch fast.

> **Your coven:** Ask your mentor how your coven keeps the autumn equinox: whether it tells the God's descent or Persephone's, holds a harvest supper, or gathers food for others.

> **Try this:** From the autumn equinox until Samhain, write one thing you are grateful for each day in your Book of Shadows.

## What's old and what's modern

- **Old:** the equinox; harvest home suppers and thanksgiving; the Greek myth of Persephone (see the Wheel lesson).
- **Modern:** the name Mabon (1970s), the second harvest as a sabbat, and the God's descent and the Goddess's mourning as Wiccans tell them.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wicca-lore',
      title: 'The Wiccan sabbats: test',
      intro: 'Thirteen questions on the Wiccan Wheel and its eight sabbats. Most are scored at once; your mentor scores the written answers. You can take the test before the year is out. You need 80% to pass.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'What does Wicca add to the eight festivals of the Wheel of the Year?',
          options: [
            'Nothing; it keeps them only as dates',
            'A sacred story of the Goddess and the God through the year, kept in a cast circle',
            'Four extra festivals',
            'A ban on folk customs',
          ],
          correct: [1],
          points: 1,
          explanation: 'Wicca keeps the festivals as chapters in the life of the Goddess and God. Their history and folk customs are taught in the Wheel of the Year lessons.',
        },
        {
          id: 'q2',
          type: 'multi',
          prompt: 'Which are the "greater sabbats" in Wiccan usage? Choose all that apply.',
          options: ['Samhain', 'Yule', 'Imbolc', 'Beltane', 'Midsummer', 'Lammas'],
          correct: [0, 2, 3, 5],
          points: 1,
          explanation: 'The four cross-quarter festivals were Gardner’s first four, after Murray. The solstices and equinoxes are the lesser sabbats; the words describe history, not importance.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'In the common Wiccan story, what happens at Yule?',
          options: ['The God dies in the grain', 'The Goddess gives birth to the God again as the newborn sun', 'The sacred marriage', 'The Goddess becomes the Crone'],
          correct: [1],
          points: 1,
          explanation: 'At the longest night, the Goddess as Mother gives birth to the reborn sun God. Light begins to return.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'Which sabbat celebrates the sacred marriage of the Goddess and God?',
          options: ['Imbolc', 'Beltane', 'Lammas', 'Samhain'],
          correct: [1],
          points: 1,
          explanation: 'At Beltane the Goddess and God join, and the earth becomes fertile. It is enacted in token, with athame and chalice.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'At which sabbat does the God give his life in the cut grain?',
          options: ['The spring equinox', 'Midsummer', 'Lammas', 'Yule'],
          correct: [2],
          points: 1,
          explanation: 'Lammas, the first harvest, is the festival of the God’s sacrifice in the grain. Many covens sing John Barleycorn.',
        },
        {
          id: 'q6',
          type: 'truefalse',
          prompt: 'The Oak King and Holly King are a modern image, popularised by Janet and Stewart Farrar from Graves and Frazer.',
          options: ['True', 'False'],
          correct: [0],
          points: 1,
          explanation: 'True. Many covens use them to dramatise the waxing and waning year; others do not.',
        },
        {
          id: 'q7',
          type: 'truefalse',
          prompt: 'The song John Barleycorn is a proven survival of an ancient pagan harvest rite.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. It is known from seventeenth-century broadside ballads and was almost certainly a drinking song. Wiccans find in it a moving image of the God in the grain.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'Many Wiccans keep Samhain as what?',
          options: ['The first harvest', 'Their new year, and the festival of the dead', 'The festival of the sacred marriage', 'The longest day'],
          correct: [1],
          points: 1,
          explanation: 'At Samhain the God is in the land of the dead, the Crone keeps the mysteries, and the beloved and Mighty Dead are remembered.',
        },
        {
          id: 'q9',
          type: 'multi',
          prompt: 'Which are honest statements about the names and symbols of the equinoxes? Choose all that apply.',
          options: [
            'The names Ostara and Mabon were given in the 1970s',
            'Bede mentions Eostre but says nothing of hares or eggs',
            'Mabon ap Modron was anciently linked with the autumn equinox',
            'Eggs as symbols of new life are found in many cultures',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Aidan Kelly chose Mabon because it sounded right; there is no old link with the equinox. Hares and eggs for Eostre are a later invention.',
        },
        {
          id: 'q10',
          type: 'multi',
          prompt: 'Which belong in a safe and consensual Beltane? Choose all that apply.',
          options: [
            'Anyone may step out of a dance',
            'The Great Rite enacted in token with athame and chalice',
            'Members expected to pair off',
            'Only small, low flames for leaping, with hair tied back',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'No one is ever expected to kiss, touch or pair off. No genuine coven requires sex of anyone.',
        },
        {
          id: 'q11',
          type: 'single',
          prompt: 'In the southern hemisphere, what do most Wiccans do with the sabbats?',
          options: ['Keep the northern dates', 'Turn the Wheel by six months, so the story follows their own seasons', 'Keep only the esbats', 'Keep only four sabbats'],
          correct: [1],
          points: 1,
          explanation: 'Samhain at the end of April, Yule at the June solstice, and so on; the Goddess and God’s story turns with the land.',
        },
        {
          id: 'q12',
          type: 'long',
          prompt: 'Choose one sabbat you have kept this year. Describe how you kept it, which part of the Goddess and God’s story you honoured, what the land was doing, and how the festival’s older history (from the Wheel lesson) and its Wiccan meaning fitted together.',
          points: 4,
          explanation: 'Keeping a sabbat well joins the Wiccan story, the season and an honest sense of its history.',
          rubric: 'Full marks (4): describes how they kept the sabbat concretely (1); names the part of the Goddess and God’s story correctly (1); describes what the land or season was doing (1); distinguishes honestly between the festival’s older roots and its modern Wiccan meaning (1).',
        },
        {
          id: 'q13',
          type: 'short',
          prompt: 'Retell the Wiccan story of the year in your own words, in eight short lines, one for each sabbat, beginning at Samhain.',
          points: 3,
          explanation: 'There are many versions; any coherent telling that follows the cycle of birth, union, sacrifice and descent is right.',
          rubric: 'Full marks (3): all eight sabbats in order from Samhain (1); a coherent cycle including the God’s birth at Yule, union at Beltane and death or sacrifice at Lammas or the harvest (1); in their own words, or clearly naming their coven’s variation (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'The Wiccan sabbats',
      intro: 'The Wiccan year turns through eight sabbats: the God in the land of the dead, his rebirth, the Maiden’s return, the meeting in spring, the sacred marriage, the height of the sun, the sacrifice in the grain, and the descent. Here you keep each sabbat as it comes, reading its Wiccan lesson and its Wheel of the Year lesson beforehand, and writing up what you did. A full turn takes a year.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'The Wiccan Wheel',
          kind: 'study',
          instructions: `1. Read "The Wiccan Wheel: the sacred story of the year", and "The turning year" from the Wheel of the Year course for the dates and names.
2. Draw your eight-fold circle in your Book of Shadows, as the lesson suggests.
3. In the answer box, write which version of the story your coven tells, after asking your mentor.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['wicca-lore-the-wiccan-wheel', 'wheel-lore-the-turning-year'],
          links: [page('calendar'), spread('year-ahead')],
        },
        ...sabbats.map(sabbatTask),
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Read "The Wiccan Wheel" again, and the lessons for any sabbats you haven't kept yet.
2. Take the test. You can take it before the year is out; the choice questions are scored at once and your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed, talk to your mentor, and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 35,
          docs: ['wicca-lore-the-wiccan-wheel'],
          quiz: 'quiz-wicca-lore',
        },
      ],
    },
  ],
} satisfies CourseModule;
