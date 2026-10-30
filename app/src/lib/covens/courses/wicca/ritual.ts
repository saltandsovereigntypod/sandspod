// Wiccan ritual: the shape of a Wiccan rite, the Wiccan altar and its tools
// (athame, boline, wand, chalice, pentacle, censer), casting the circle, the
// quarters and the Goddess and God, cakes and ale, drawing down the moon as
// publicly described, and a complete sample esbat to learn by heart. Open,
// public practice in original words; nothing from an oathbound Book of
// Shadows. Builds on core-sacred-space and core-altar-tools. British spelling.

import type { CourseModule } from '../types';
import { candle, coven, deity, herb, holy, page, ritual, tool, vessel } from '../linkHelpers.ts';

export default {
  id: 'wicca-ritual',
  title: 'Wiccan ritual',
  docs: [
    {
      id: 'wicca-ritual-shape-of-a-wiccan-rite',
      title: 'The shape of a Wiccan rite',
      summary: 'The order of a Wiccan rite from preparation to feast, why each part is there, how a rite grows or shrinks for one person or a whole coven, and the roles people take.',
      minutes: 15,
      links: [ritual('wicca-casting-the-circle'), coven('ritual-builder'), page('planner'), coven('rituals')],
      body: `## A rite you can learn by heart

Wiccan ritual has a recognisable shape. The words differ from coven to coven, and between initiatory and open Wicca, but the order is much the same everywhere. Once you know the shape, you can follow any Wiccan rite, write your own, and adapt it for one person or for thirty. This module teaches it part by part and ends with a complete rite to learn.

The core lessons on sacred space and on the altar and tools taught you a simple, tradition-neutral circle. Here you learn the Wiccan form in particular.

## The shape

1. **Preparation.** Bathing, dressing, setting the altar, quieting the mind.
2. **Cleansing the space.** Sweeping with the besom; blessing salt and water.
3. **Casting the circle.** Marking the circle with the athame or wand, then with salt water, incense and fire.
4. **Calling the quarters.** Welcoming the powers of air, fire, water and earth at east, south, west and north.
5. **Inviting the Goddess and the God.** Calling on them to be present, in words, music or silence.
6. **The statement of purpose.** Saying why the circle has been cast: this sabbat, this full moon, this working.
7. **The heart of the rite.** The seasonal drama of a sabbat; at an esbat, worship of the Goddess, perhaps the Charge, and magic.
8. **Raising and sending power,** if there is magical work: chanting, dancing, then release and grounding.
9. **Cakes and ale.** Blessing and sharing food and drink, with an offering for the gods.
10. **Thanks and farewell.** Thanking the Goddess and God.
11. **Releasing the quarters,** in reverse order.
12. **Opening the circle.**
13. **Grounding, feasting and clearing up.**

## Why each part is there

- **Preparation** marks a change from ordinary life. The ritual bath is not about dirt; it is about arriving clean in mind as well as body.
- **Cleansing** clears the space of what has gathered there, so the circle is made on fresh ground.
- **The circle** creates a place "between the worlds", set apart from ordinary time. It protects those inside, and it contains the power raised until it is sent.
- **The quarters** place the rite within the whole world: the four directions, the four elements, the powers of the land and sky. Wiccans often think of them as guardians or witnesses.
- **The Goddess and God** are the reason for the rite. Everything else prepares for meeting them.
- **The statement of purpose** focuses everyone. A rite with a clear purpose works better than one without.
- **The heart** is what the rite is for.
- **Cakes and ale** brings the sacred back into the body and into fellowship, and shares the blessing with the gods.
- **Thanks, release and opening** close what was opened, in reverse, so nothing is left hanging and everyone returns to ordinary life whole.
- **Grounding and feasting** settle the body and mind. People who skip this often feel spacey or drained afterwards.

## Growing and shrinking the shape

### A solitary rite in twenty minutes

Alone, the shape stays the same but each part becomes simple: a quick sweep, salt in water, one walk round with your finger pointing, a short welcome at each quarter, a few words to the Lady and Lord, your purpose, a few minutes of worship or a short working, a bite of bread and a sip of juice, thanks, release, and open. The ready-made "Casting and Closing the Circle" ritual in the app is a frame of this kind.

### A coven sabbat

With a coven, each part may grow: several people cleanse and cast, four people call the quarters, the priestess and priest invite the Goddess and God, the seasonal drama has parts for many, a chant raises power, and the feast lasts longer than the rite.

## Roles in a coven rite

- **High Priestess and High Priest:** lead the rite, usually cast the circle, invite the Goddess and God, and bless cakes and ale.
- **Maiden:** in many covens, the High Priestess's assistant, who helps with cleansing, lights candles and keeps things moving. The title is traditional and is not a statement about anyone's age or life.
- **Summoner:** in some covens, the High Priest's assistant, who helps organise and may call people to the circle.
- **Quarter callers:** four members who welcome the elements.
- **Everyone:** joins chants and dances, says "So mote it be" or "Blessed be" in response, and holds the circle's attention.

Not every coven uses all these roles; many share them round so that everyone learns.

## The words of response

Two phrases are used in almost every Wiccan rite:

- **"So mote it be"**, an old Masonic phrase meaning "so must it be", said to affirm an invocation or working.
- **"Blessed be"**, said as a blessing, a response, a greeting and a farewell.

## Writing it down

Every Wiccan keeps their rites in their Book of Shadows. Write down the shape and the words you use, and later what happened. In the app, the coven's ritual builder and the ritual planner hold planned rites, and your Grimoire holds your own.

> **Your coven:** Your coven's rite will have its own words, and perhaps its own order. Ask your mentor to show you the coven's written rite, if newcomers may see it, and learn that alongside this one.

> **Try this:** Write the thirteen parts of the shape from memory on a card. Check it against this lesson. Keep the card on your altar until you no longer need it.

## What's old and what's modern

- **Old:** the cleansing of a sacred space, the ritual circle of ceremonial magic, offering food and drink to the gods.
- **Modern:** the Wiccan rite as a whole, assembled in the 1940s and 1950s and refined by every coven since.`,
    },
    {
      id: 'wicca-ritual-the-altar-and-tools',
      title: 'The Wiccan altar and its tools',
      summary: 'How a Wiccan altar is usually laid out, and the tools of the Craft in their Wiccan meaning: athame, boline, wand, chalice, pentacle, censer, besom, cords and cauldron, which element each is linked with and why sources differ, and how to keep a blade legally and safely.',
      minutes: 16,
      links: [tool('athame'), tool('boline'), tool('wand'), tool('chalice'), tool('pentacle'), tool('incense_burner'), tool('besom'), tool('cord'), tool('cauldron'), tool('altar'), ritual('wicca-consecrating-a-tool'), page('altar')],
      body: `## Building on the core lesson

The core lesson on the altar and tools explained what an altar is, how to set one up with little money or space, and how to cleanse and consecrate tools. This lesson adds what is particular to Wicca: how the altar is usually arranged, and what the tools mean in Wiccan practice. As before, no tool is required. A Wiccan with nothing but their hands and a candle can keep every rite.

## The Wiccan altar

The altar usually stands in the north of the circle, or in the centre, though some covens put it in the east. A common arrangement, found in many open Wiccan books:

- **On the left, the Goddess's side:** a candle (silver or white), the chalice, perhaps a statue or image of the Goddess, a shell or a bowl of water.
- **On the right, the God's side:** a candle (gold or red), the athame and wand, perhaps an image of the God, antlers or a pine cone.
- **In the centre:** the pentacle, with a censer (incense burner) before or behind it; the bowls of salt and water; the plate for cakes.
- **Seasonal things** at the front or around the edge: flowers, leaves, fruit, the season's objects.

Some covens light a single central candle for the Goddess and God together. Others place the four elements' tools at the four sides of the altar. All of these are fine; ask what your coven does.

## The tools

### Athame

The **athame** is the Wiccan's ritual knife, usually double-edged with a black handle. It is used to cast the circle, to direct power, to call and dismiss the quarters, and in the blessing of the wine. In most Wiccan traditions it is **never used to cut anything physical**: it is a tool of will and direction, not a kitchen knife. Many Wiccans keep it blunt. The word is of uncertain origin; Gardner used it, and it may come from a medieval magical text's word for a knife.

### Boline

The **boline** is the working knife, often white-handled, sometimes curved like a small sickle. It is the one that cuts: herbs, cords, candles, wands from a tree. Many Wiccans simply use a good kitchen knife kept for the purpose.

### Wand

The **wand** is a length of wood, often from the elbow to the fingertip, cut with thanks from a tree such as hazel, willow, oak or rowan, or bought. It is used to invite and invoke, gently, where the athame commands and directs. Some Wiccans cast the circle with the wand instead of the athame.

### Chalice

The **chalice** is the cup, holding wine, juice or water. It stands for the Goddess, for water and for the womb, and is used in cakes and ale.

### Pentacle

The **pentacle** is a flat disc of wood, metal, clay or wax, marked with a five-pointed star in a circle (a pentagram) and often other symbols. It stands for earth. Things are set on it to be blessed: the cakes, a charm, a new tool. The pentagram is the best-known Wiccan symbol, usually explained as the four elements crowned by spirit.

### Censer

The **censer**, or incense burner, holds burning incense, linked with air (and in some traditions fire). It purifies the circle with smoke.

### Besom

The **besom** is a broom, used to sweep the space before the circle is cast. It is also used in handfastings, where the couple jump over it.

### Cords

Many covens use **cords**, often red, white or blue, worn at the waist or used in magic: tied in knots to bind a working's power, or used to measure the circle.

### Cauldron

The **cauldron**, an iron pot on three legs, is linked with the Goddess and with transformation and rebirth. It may hold water for scrying, a fire, or flowers.

### Book of Shadows

Your **Book of Shadows** is also a tool: it holds the words and memory of the Craft.

## Tools and the elements

Most Wiccans link four tools with the four elements, but sources disagree:

- **Pentacle and earth, chalice and water:** almost everyone agrees.
- **Athame and wand:** in the Golden Dawn system, the sword or dagger is air and the wand is fire. Many Wiccan books, including some of the earliest, give the athame to fire and the wand to air.

Neither is wrong. Each has a good argument: the blade divides and discerns, as the mind does (air), but it is forged in fire and commands (fire); the wand grows from a tree in the air, but passes the spark of will (fire). Learn your coven's choice, and keep it consistently.

## Getting tools

You need not buy anything. Start with a kitchen bowl for a chalice, a plate with a star drawn on it for a pentacle, a stick you found for a wand. If you want an athame, a simple double-edged letter opener or a blunt craft knife works. Many Wiccans make their own tools over time. Some covens give a new initiate a tool, or have them make one.

> **Safety:** A knife is still a knife. Keep the athame and boline at home, out of children's reach, and never carry them in public. In many countries, including the United Kingdom, carrying a blade in public without good reason is a criminal offence, and religious reasons are not always accepted. For outdoor rites, use a wand or your hand, or check the law first.

## Caring for tools

Consecrate each tool before using it, as the core lesson and the app's "Consecrating a New Tool" rite show. Many Wiccans keep them wrapped in cloth when not in use, and do not let others handle them without asking; others share freely. Clean them with care. If a tool breaks or you no longer need it, thank it, and bury it, burn it if it is wood, or give it to someone who will use it well.

> **Your coven:** Ask your mentor which tools your coven uses, which element it gives the athame and wand, and whether there is a coven custom about how members get their tools.

> **Try this:** Set your altar in the Wiccan way described here, using what you have. Photograph it if you like, and describe it in the answer box: what stands where, and why.

## What's old and what's modern

- **Old:** ritual knives, cups and wands in ceremonial magic; the besom and cauldron in folk custom.
- **Modern:** the Wiccan set of tools and their meanings, from the 1940s onwards.`,
    },
    {
      id: 'wicca-ritual-casting-the-circle',
      title: 'Casting the Wiccan circle',
      summary: 'The Wiccan circle step by step: sweeping, blessing salt and water, casting with the athame, sealing with the four elements, working inside, cutting a doorway, and opening the circle at the end. With a solitary version, what people notice, and common difficulties.',
      minutes: 18,
      links: [ritual('wicca-casting-the-circle'), tool('athame'), tool('besom'), tool('salt_circle'), vessel('bowl'), herb('frankincense')],
      body: `## What the circle is

In Wicca, the circle is cast at the start of every rite. Wiccans describe it as a place "between the worlds": a boundary that keeps out what is not wanted, a container that holds the power raised inside until it is sent, and a meeting place with the gods. It is usually imagined not as a ring on the floor but as a sphere, reaching above and below.

Many traditional accounts give the circle a size of nine feet across. In practice it is as big as the room or the group needs. A solitary circle can be as small as your arms' reach around your altar.

## Before you begin

1. **Find north.** Use a compass or your phone. The quarters are called at east, south, west and north.
2. **Clear the space.** Move furniture back so you can walk the edge without tripping.
3. **Set the altar** with your candles, salt, water, incense, athame or wand, chalice and cakes.
4. **Prepare yourself.** Bathe or wash hands and face; put on robes or clean clothes; ground and centre as the core lessons taught.

## Casting, step by step

### 1. Sweep

Take the besom (or your hand). Starting in the east, walk the edge of the space deosil (clockwise), sweeping just above the floor, brushing out the day's clutter. You might say quietly: "Out with all that does not belong. This place is made clean."

### 2. Bless the water and salt

At the altar, hold the point of your athame (or your fingers) in the bowl of water and say: "I bless and cleanse this water, that it may be pure and fit for the work of the gods." Hold it over the salt: "I bless this salt, that it may be pure and fit for the work of the gods." Pour three pinches of salt into the water and stir it deosil three times.

### 3. Cast with the athame

Stand in the east. Point your athame (or wand, or finger) at the floor at the circle's edge. Walk slowly deosil all the way round, ending back in the east. As you go, see a line of light flowing from the blade and rising into a wall, then a sphere above and below. You might say, in your own words: "I cast this circle, a boundary between the worlds, a place of love and truth, a shield and a container for the power we raise. So mote it be."

Many people find it helps to breathe in from the earth as they step and out through the blade.

### 4. Seal with water and salt

Carry the bowl of salted water deosil round the circle, sprinkling it lightly at the edge (and, in a coven, over each person, with consent).

### 5. Seal with fire and air

Carry the censer of burning incense deosil round the circle, then a candle. Some covens combine these steps; some do earth and water together and air and fire together.

### 6. Close the circle

Back at the east, say: "The circle is cast. We are between the worlds, and what happens between the worlds affects all the worlds." (This phrase is widely used in open Wicca.) Everyone may answer "So mote it be."

## Working inside

Once the circle is cast:

- **Move deosil** whenever you can.
- **Don't walk through the edge.** If someone needs to leave, a doorway is cut.
- **Keep your attention.** It is fine to feel relaxed, but the circle is not the place for checking your phone.

## Cutting a doorway

If someone must leave or come in:

1. Stand at the edge, usually in the north-east.
2. With the athame, "cut" an opening in the circle's wall, tracing an arch from the floor, up and over, and down, anticlockwise.
3. The person steps through.
4. "Close" the doorway by tracing the same arch clockwise, and say something like "the circle is whole".

If you are alone and must leave in a hurry (a smoke alarm, a child crying, feeling unwell), just go. The circle will not punish you. Come back, ground yourself, and either recast it or close it properly and start again another time.

## Opening the circle

At the end of the rite, after thanking the Goddess and God and releasing the quarters:

1. Stand in the east, or the north.
2. Walk widdershins (anticlockwise), with the athame pointing at the edge, seeing the light draw back into the blade and the earth.
3. Say: "The circle is open, but unbroken. Merry meet, and merry part, and merry meet again."
4. Touch the ground with your hands to return excess energy to the earth.

## What people notice

When a circle is cast, people commonly report:

- a sense of the room going quiet or still;
- a feeling of being enclosed, held or protected;
- a change in temperature or air pressure, or tingling skin;
- sounds from outside seeming further away;
- nothing much at first, which is normal.

The circle's strength comes from attention and practice. Your hundredth circle will feel different from your first.

## Common difficulties

- **"I can't visualise the light."** Then feel it, or hear it in the words, or simply know it is there by the act of walking. Visualisation is only one way.
- **"I feel self-conscious."** Practise alone first, saying the words quietly. Confidence comes.
- **"The room is too small."** Cast round your altar, or walk the circle in your mind.
- **"I forgot a step."** Carry on. Note it afterwards. No harm is done.

> **Safety:** Keep incense and candles on heat-proof holders when carrying them round the circle, mind hems and sleeves, and keep the floor clear. If smoke troubles you or anyone present, use a feather or a bell for air instead.

> **Your coven:** Your coven will have its own way of casting, its own words, and perhaps a different order. Learn theirs as well as this one.

> **Try this:** Cast and open the circle alone three times, with nothing else in between but a few minutes of sitting quietly. Log each time and note what you noticed.

## What's old and what's modern

- **Old:** the magician's circle, found in medieval and Renaissance magical books and in the Golden Dawn.
- **Modern:** the Wiccan circle as a sacred space for worship as well as magic, and the phrase "between the worlds".`,
    },
    {
      id: 'wicca-ritual-quarters-and-powers',
      title: 'The quarters, the Goddess and the God',
      summary: 'Calling the quarters in the Wiccan way: the four elements and directions, the Watchtowers and Guardians, invoking and banishing pentagrams, colours and correspondences, the southern hemisphere; then inviting the Goddess and the God in your own words, with examples.',
      minutes: 18,
      links: [ritual('green-daily-calling-the-elements'), ritual('green-four-elements-balancing-rite'), deity('wiccan_goddess'), deity('horned_god'), candle('yellow'), candle('red'), candle('blue'), candle('green')],
      body: `## The four quarters

Once the circle is cast, Wiccans call the four quarters: the powers of the four directions, each linked with an element. In most Wicca, in the northern hemisphere:

- **East: air.** Dawn, spring, breath, thought, words, beginnings. Colour often yellow.
- **South: fire.** Noon, summer, will, passion, courage, transformation. Colour often red.
- **West: water.** Dusk, autumn, feeling, love, dreams, healing. Colour often blue.
- **North: earth.** Midnight, winter, the body, stability, the land, the dead. Colour often green.

These links come from the ceremonial magic of the Golden Dawn, reaching back to ancient Greek ideas of four elements. They are not the only possible scheme: in other places, the elements sit differently.

### The southern hemisphere

In the southern hemisphere the sun stands in the north at noon, so many Wiccans there place fire in the north and earth in the south. Others keep the northern scheme, or place the elements according to their own land: water where the sea is, fire where the hot inland lies. All are reasonable. Ask your coven.

## Watchtowers, Guardians and elementals

Wiccans speak of what is called at the quarters in different ways:

- **The Watchtowers,** or "Lords of the Watchtowers", a phrase found in Gardnerian Wicca and drawn from the Enochian magic of the Golden Dawn.
- **The Guardians** of the four directions.
- **The elements themselves,** air, fire, water and earth.
- **The spirits of the land** in each direction where you live.
- **Elemental beings** (sylphs, salamanders, undines, gnomes), an idea from Renaissance magic that some Wiccans use and others do not.

Whatever you call, the attitude is the same: you are inviting, with respect, not commanding.

## Calling a quarter, step by step

1. **Face the direction.** In a coven, everyone faces it too.
2. **Raise your athame or wand,** or your open hand.
3. **Draw an invoking pentagram** in the air, if your coven uses one (see below).
4. **Speak the call.** For example, in the east: "Powers of the east, powers of air, of breath and morning and the clear mind: we call you to witness this rite and guard this circle. Hail and welcome."
5. **Light the quarter's candle,** if you have one.
6. **Pause** and notice: the air on your skin, the sense of that direction.
7. Everyone answers: "Hail and welcome."

Then turn deosil to the next quarter. Calls for the others might speak of the south's fire, the noon sun and courage; the west's water, dusk and the deep; and the north's earth, midnight, the bones of the land and the ancestors.

## Pentagrams

Many Wiccans draw a pentagram in the air at each quarter: an invoking pentagram when calling, a banishing pentagram when releasing. The forms most widely published come from the Golden Dawn's ritual of the pentagram:

- **A common invoking pentagram:** start at the top point, draw down to the lower left, up to the right, across to the left, down to the lower right, and back up to the top.
- **A common banishing pentagram:** start at the lower left, draw up to the top, down to the lower right, up to the left, across to the right, and back down to the lower left.

The Golden Dawn has a different pentagram for each element; many Wiccans use one invoking and one banishing form for all four. Some covens use none at all. Learn what your coven does. What matters most is intent and attention, not the exact line.

## Inviting the Goddess and the God

After the quarters, the Goddess and God are invited. In a coven this is often done by the High Priestess and High Priest; alone, you do it yourself.

Two things are useful to understand:

- **Inviting** asks the gods to be present in the circle, as honoured guests.
- **Invoking**, in the stronger sense, asks a god to come into a person. Drawing down the moon, the subject of a later lesson, is of this kind. Beginners invite.

### Writing an invitation

A good invitation names who you are calling, praises them for what they are, and asks them to come. For example:

"Lady of the moon, Mother of all living, Queen of the starry sea: you who were from the beginning, whose love is poured out upon the earth: be with us in this circle tonight. Hail and welcome."

"Lord of the greenwood, Horned One, sun and grain and the hunter in the dark: you who die and are born again: be with us in this circle tonight. Hail and welcome."

Write your own. Use the names your coven uses, or the names of particular gods you honour. Speak slowly. Leave a moment of silence after each invitation, and notice.

## Releasing

At the end of the rite, the Goddess and God are thanked first, then the quarters are released in reverse: north, west, south, east (or widdershins from where you started). For each:

1. Face the direction and raise your athame or hand.
2. Draw a banishing pentagram, if your coven uses one.
3. Say: "Powers of the north, powers of earth: thank you for your presence and your guarding. Go if you must, stay if you will. Hail and farewell."
4. Put out the quarter's candle.

"Go if you must, stay if you will" (or similar) is common in open Wicca: it releases the powers courteously, without ordering them away.

> **Safety:** Quarter candles on the floor are easy to kick over or brush with a robe. Use tall, sturdy holders or glass jars, or place the quarter candles on the altar instead.

> **Your coven:** Your coven may call the quarters in its own words, with or without pentagrams, and may call the Goddess and God by particular names. Ask your mentor to teach you the coven's own forms.

> **Try this:** Write your own calls for all four quarters and invitations for the Goddess and God. Read them aloud. Keep the best version in your Book of Shadows.

## What's old and what's modern

- **Old:** the four elements (ancient Greek), the quarters and pentagrams of ceremonial magic.
- **Modern:** the Wiccan way of calling the quarters and inviting the Goddess and God.`,
    },
    {
      id: 'wicca-ritual-cakes-and-ale',
      title: 'Cakes and ale',
      summary: 'The Wiccan sharing of blessed food and drink: what it means, the symbolic union of athame and chalice (the Great Rite in token), how to bless and share cakes and ale step by step, the offering to the gods, and keeping it safe and inclusive.',
      minutes: 14,
      links: [ritual('wicca-cakes-and-ale'), tool('chalice'), tool('athame'), tool('pentacle'), vessel('offering_bowl')],
      body: `## What cakes and ale is

Near the end of almost every Wiccan rite comes **cakes and ale**: food and drink blessed in the circle and shared among everyone present, with a portion offered to the gods. It is one of the best-loved parts of a Wiccan rite. Leland's Aradia (1899) has the witches share cakes and wine at their full moon meetings, and the custom passed into Wicca from there and from older feasts with the gods.

The name is traditional; the "ale" is often wine, mead, cider or juice, and the "cakes" are often biscuits, bread or crescent-shaped moon cakes.

## What it means

Cakes and ale does several things at once:

- **It shares the gods' blessing.** The food and drink are blessed in the presence of the Goddess and God, and taking them in is taking in their blessing.
- **It brings the sacred into the body.** After the heights of a rite, eating and drinking ground people gently.
- **It joins the group.** Sharing a cup and a plate makes a coven a family.
- **It gives thanks.** The first portion goes to the gods, in thanks for the earth's gifts.

## The blessing of the wine

In much Wicca, the drink is blessed by the High Priestess and High Priest together. The priestess holds the chalice; the priest lowers the point of the athame into it. This is a symbol of the union of the Goddess and God, of female and male, and of the fertile meeting from which all life comes.

This act is sometimes called the **Great Rite in token**, or the symbolic Great Rite. The Great Rite is the Wiccan name for the sacred union of the Goddess and God. In publicly available accounts of traditional Wicca, it is enacted almost always in this symbolic way, with athame and chalice. A few traditions also speak of the Great Rite "in true", an actual sexual union, which, where it happens at all, is only between committed, consenting partners, in private, and is never a requirement of anyone.

> **Safety:** No genuine coven requires sex of anyone as a condition of training, dedication, initiation or advancement, and no teacher may ask it of a student. If anyone suggests otherwise, it is a serious red flag. Leave, and tell someone you trust.

Many covens no longer tie the blessing to sex or gender. Two people of any gender may bless the cup together; one person may lower the athame into the chalice alone; or the cup may simply be blessed with words. The meaning, the union from which life comes, remains.

## Step by step

### With a coven

1. The chalice is filled and the cakes are set on the pentacle or a plate.
2. The priestess holds the chalice. The priest (or second person) holds the athame point down above it.
3. Together they say words of blessing. For example: "As the athame is to the God, so the cup is to the Goddess, and joined in one they bring forth life." The athame is lowered gently into the drink.
4. The cakes are blessed: the athame touches or is held over the plate, with words such as: "Blessed be these cakes, gift of the earth, that we may share in plenty and never hunger."
5. A portion of each is set aside for the gods in the offering bowl.
6. The cup and plate are passed round deosil. As each person passes the cup, they say "Blessed be" (or "May you never thirst") and the next answers "Blessed be".
7. People may sit and talk quietly while eating; some covens use this time for news and sharing.

### Alone

1. Fill your chalice and set out a little bread or a biscuit.
2. Hold the athame over the cup, or lower it in, and bless it in your own words.
3. Bless the cake.
4. Pour a little drink and crumble a little cake into the offering bowl for the Lady and the Lord, with thanks.
5. Eat and drink slowly, feeling yourself come back into your body.

The ready-made "Cakes and Ale" rite in the app has words you can use.

## The offering

The portion set aside belongs to the gods. After the rite, pour the drink onto the earth and leave the crumbs outside for the birds, or bury them in the garden. If you live without a garden, a plant pot or a respectful place in a park works, or the bin with thanks if nothing else is possible. Never leave food where it will harm animals (chocolate, grapes and raisins, onions and many sweet things are bad for dogs and birds) or make litter.

## Safe and inclusive

- **Alcohol is never required.** Many covens use juice or water in the main cup, or have two cups, so no one has to ask.
- **Ask about allergies** and offer gluten-free cakes if needed.
- **Sharing a cup** spreads colds. Many covens now let people pour into their own small cups or dip a cake instead.
- **Recovery and religion.** If anyone present is in recovery from alcohol, make juice the default for everyone.

> **Your coven:** Your coven will have its own words for blessing the wine and cakes, and its own custom about who blesses them and how they are shared. Ask your mentor.

> **Try this:** Bake or buy simple moon cakes (crescent biscuits with honey or oats are traditional in many covens). At your next full moon, bless and share cakes and ale alone, with the offering. Write what it felt like.

## What's old and what's modern

- **Old:** sharing food and drink with the gods, in many ancient religions; the cakes and wine of Leland's witches (1899).
- **Modern:** Wiccan cakes and ale, and the Great Rite in token with athame and chalice.`,
    },
    {
      id: 'wicca-ritual-drawing-down-the-moon',
      title: 'Drawing down the moon',
      summary: 'What drawing down the moon is, as it has been publicly described: the invocation of the Goddess into the High Priestess, the Charge, what people report, the honest questions it raises, why it is learned in a coven and not tried alone, and the care it needs before and after.',
      minutes: 15,
      links: [holy('moon-full'), ritual('wicca-full-moon-esbat'), deity('wiccan_goddess'), deity('selene'), deity('diana'), page('moon')],
      body: `## The central mystery

**Drawing down the moon** is, for many Wiccans, the heart of their religion. It is the moment in a rite when the Goddess is invited, not only into the circle, but into a priestess, so that the Goddess may be present in a person and speak through her. Margot Adler took it as the title of her 1979 survey of modern paganism, because it seemed to her to capture what made Wicca distinctive: a religion in which the divine is met in human beings.

This lesson describes drawing down as it has been publicly written about by Wiccans and scholars. The particular words, gestures and teachings each initiatory tradition uses are part of its oathbound material and are not given here. This lesson is for understanding, not for trying the practice alone.

## Where the name comes from

The phrase is old. In ancient Greece, the witches of Thessaly were said to be able to draw down the moon from the sky, a phrase that appears in Greek comedy and later writers. Wicca borrowed the name for something different: not pulling down the moon itself, but calling down the Goddess of the moon into a priestess.

## What happens, in outline

As it has been publicly described:

1. The circle is cast and the quarters called, as usual, usually at a full moon esbat.
2. The High Priestess stands, often before the altar, in a posture that represents the Goddess.
3. The High Priest, or another member, invokes the Goddess into her, with words of praise and invitation, and gestures of reverence.
4. The priestess, now speaking as or for the Goddess, may deliver the **Charge of the Goddess**, or speak words of her own, inspired in the moment.
5. The coven receives the Goddess's words with reverence.
6. Later, the priestess is helped to return fully to herself.

Some traditions also have a corresponding rite for the God, called drawing down the sun, into a priest.

## What people report

Priestesses who have done it describe a wide range of experience:

- feeling a strong presence alongside or within them, while remaining aware of themselves;
- words coming that they did not plan, sometimes surprising them;
- a sense of great love, power or calm;
- in deeper experiences, losing some awareness of time, or not remembering all that was said;
- sometimes, very little: the priestess speaks the Charge with feeling, and that is enough.

Members of the coven often say that the priestess looked, sounded or felt different. Many say it was the moment they first felt the Goddess was real.

## Honest questions

It is fair to ask what is happening. Wiccans themselves give different answers:

- the Goddess truly comes into the priestess;
- the priestess opens to a deep part of herself where the divine is met;
- it is a powerful act of sacred theatre, through which everyone present meets the Goddess;
- some combination of these.

You do not need to decide. It is also wise to hold some discernment: words spoken in drawing down are not infallible commands, and a coven should never treat them as giving any person power over another's life. If a leader uses "the Goddess said" to demand money, sex, obedience or secrecy about harm, that is abuse, not religion.

## Why it is learned in a coven

Drawing down the moon is a form of what is sometimes called **aspecting** or **invocation**: opening oneself to a divine presence. It can be deeply moving, and it can also be disorienting. For that reason:

- it is normally done only by experienced priestesses and priests, after training;
- it is done in a cast circle, with others present who know how to help;
- someone experienced is always watching over the person, ready to help them back;
- it is followed by grounding, food and care.

This course does not teach you to draw down alone, and you should not attempt it as a beginner. If your coven practises it, its leaders will teach it in time, if and when you are ready, and you may always choose not to.

> **Safety:** If you have a history of psychosis, dissociation, or a mental health condition that makes strong altered states risky, tell your High Priestess, and talk to your doctor before taking part in any practice of this kind. Being present while someone else draws down is usually fine; taking part yourself is never required.

## Aftercare

Whoever has drawn down, and whoever has been present, needs to come back fully:

1. The priestess is spoken to by her own name, and helped to sit.
2. She eats and drinks: cakes and ale are well placed for this.
3. She touches the ground, or holds something heavy, and breathes slowly.
4. The coven checks on her in the hours and days after, and she can talk with her High Priestess or mentor about what she experienced.

## What you might do now

As a devotee, you meet drawing down as a witness, if at all. Your part is to be present, reverent and quiet, and to receive what is said with an open but thoughtful mind. Many devotees also simply read the Charge of the Goddess aloud at a full moon at home, as a devotion rather than an invocation. That is a good and safe practice.

> **Your coven:** Ask your mentor whether your coven practises drawing down, whether newcomers are present for it, and what is expected of those who witness it.

> **Try this:** At the next full moon, after your candle greeting, read the Charge of the Goddess aloud slowly, as a prayer, not an invocation. Then sit in silence for five minutes and write what you noticed.

## What's old and what's modern

- **Old:** the phrase "drawing down the moon", from the witches of Thessaly in Greek writing; the ancient practice of oracles speaking for a god.
- **Modern:** Wiccan drawing down as the invocation of the Goddess into a priestess.`,
    },
    {
      id: 'wicca-ritual-a-complete-esbat',
      title: 'A complete esbat, from start to finish',
      summary: 'A full sample Wiccan rite for the full moon, in original words, for one person or a small group: preparation, cleansing, casting, quarters, Goddess and God, a reading, a simple working, cakes and ale, thanks, release and opening, with timings and notes for adapting it.',
      minutes: 20,
      links: [ritual('wicca-full-moon-esbat'), ritual('wicca-casting-the-circle'), ritual('wicca-cakes-and-ale'), holy('moon-full'), coven('ritual-builder'), page('planner')],
      body: `## How to use this rite

This is a complete esbat in original words, for the full moon. It is written for one person, with notes for a small group. It takes about forty-five minutes. Read it through twice before you keep it. Learn the shape before the words; the words can be read from a card, and you may change them freely. The app's ready-made "Full Moon Esbat" is a shorter version you can open alongside it.

## What you need

- Altar with two candles (Goddess and God) and four quarter candles if you like.
- Bowls of water and salt; incense and censer; athame or wand; chalice with juice or wine; a cake or biscuit on a plate; an offering bowl.
- A small white candle for the working, and a heat-proof holder.
- A card with the words, and a lighter.

## Before: about thirty minutes

1. Take a bath or shower with attention, or wash hands and face. Think of washing off the day.
2. Dress in robes or clean, comfortable clothes.
3. Set the altar. Find north.
4. Sit for five minutes. Breathe in for four, out for six. Ground and centre as you have learned.

## The rite

### 1. Cleansing (three minutes)

Sweep deosil from the east. Bless the water and salt, mix them, and stir three times deosil.

### 2. Casting (five minutes)

From the east, cast deosil with the athame: "I cast this circle, a boundary between the worlds, a place of love and truth, a shield and a container for the power I raise. So mote it be." Sprinkle salt water round, then carry the incense round. Back in the east: "The circle is cast. I am between the worlds."

### 3. The quarters (five minutes)

At each, raise the athame, draw an invoking pentagram if you use one, light the candle, and call:

- **East:** "Powers of the east, of air and breath and morning: witness this rite and guard this circle. Hail and welcome."
- **South:** "Powers of the south, of fire and will and noon: witness this rite and guard this circle. Hail and welcome."
- **West:** "Powers of the west, of water and feeling and dusk: witness this rite and guard this circle. Hail and welcome."
- **North:** "Powers of the north, of earth and body and midnight: witness this rite and guard this circle. Hail and welcome."

### 4. The Goddess and God (three minutes)

Light the Goddess candle: "Lady of the moon, Mother of all living, shining tonight in fullness: be with me in this circle. Hail and welcome."

Light the God candle: "Lord of the wild and the sun, Horned One, consort of the Lady: be with me in this circle. Hail and welcome."

### 5. Purpose (one minute)

"I keep this rite on the night of the full moon, to honour the Lady in her fullness, to give thanks, and to ask her blessing on my work."

### 6. Worship (ten minutes)

Stand or sit facing the moon, or the Goddess candle. Read the Charge of the Goddess aloud slowly, or a poem or prayer of your own. Then stand with arms raised, palms open, and breathe the moonlight in. Stay in silence for five minutes. Speak to the Lady if you wish, and listen.

### 7. A simple working (ten minutes)

Choose one clear, kind purpose, for yourself or for someone who has asked: steadiness, healing, courage. Hold the small white candle and breathe your purpose into it. Light it. Raise power gently, as you learned in the core lessons: hum or chant a simple phrase, getting louder, or sway in place, until you feel a peak. At the peak, release: let the power go into the candle and out to its purpose, with "So mote it be". Then touch the ground and let any excess flow away. Let the candle burn while you finish the rite, safely, or snuff it at the end and relight it on following nights.

### 8. Cakes and ale (five minutes)

Lower the athame into the chalice: "As the blade to the cup, so the Lord to the Lady: may all life be blessed." Bless the cake: "Blessed be this gift of the earth." Set a portion of each in the offering bowl. Eat and drink, saying "Blessed be." Sit and come back to yourself.

### 9. Thanks (two minutes)

To the Goddess: "Lady of the moon, thank you for your presence and your blessing. Hail and farewell." Put out her candle.

To the God: "Lord of the wild, thank you for your presence and your blessing. Hail and farewell." Put out his candle.

### 10. Releasing the quarters (four minutes)

Widdershins, beginning in the north: "Powers of the north, of earth: thank you for your guarding. Go if you must, stay if you will. Hail and farewell." Then west, south and east in turn, putting out each candle.

### 11. Opening (two minutes)

Walk widdershins from the east, drawing the circle back into the blade: "The circle is open, but unbroken. Merry meet, and merry part, and merry meet again." Touch the ground.

## After

1. Eat something and drink water.
2. Write in your Book of Shadows: date, moon, what you did, what you noticed, the working's purpose.
3. Take the offering outside within a day.
4. Watch over the working candle until it is out.

## For a small group

Share the parts: one person sweeps and blesses, one casts, four call the quarters, two invite the Goddess and God, and everyone chants together in the working. Pass the cup and cakes deosil. Talk about the rite at the feast afterwards.

## When it goes differently

If you lose your place, pause, breathe and carry on. If you forget a quarter, call it when you notice. If you are interrupted, close as simply as you can and begin again another night. Gods are not offended by honest mistakes.

> **Safety:** Never leave candles burning unattended. Keep robes and hair away from flames, especially when raising arms. If you feel dizzy or overwhelmed during the working, stop, sit, put your hands on the floor and breathe; close the rite simply.

> **Your coven:** Your coven's esbat will differ. Use this rite at home between coven meetings, and learn the coven's own rite alongside it.

> **Try this:** Keep this esbat at the next full moon. Afterwards, change one thing to make it more your own, and keep the new version at the following full moon.

## What's old and what's modern

- **Old:** honouring the full moon, offering food and drink, the circle's roots in ceremonial magic.
- **Modern:** this rite, written for this course.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wicca-ritual',
      title: 'Wiccan ritual: test',
      intro: 'Thirteen questions on the shape of a Wiccan rite, the tools, the circle, the quarters, cakes and ale and drawing down the moon. Most are scored at once; your mentor scores the written answers. You need 80% to pass.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'In which order do these come in a Wiccan rite?',
          options: [
            'Cakes and ale, cast the circle, call the quarters, invite the Goddess and God',
            'Cast the circle, call the quarters, invite the Goddess and God, the heart of the rite, cakes and ale',
            'Call the quarters, open the circle, cast the circle, cakes and ale',
            'Invite the Goddess and God, release the quarters, cast the circle',
          ],
          correct: [1],
          points: 1,
          explanation: 'The circle is cast, the quarters called and the Goddess and God invited; then the heart of the rite, cakes and ale, thanks, releasing and opening, in reverse.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'What is the athame used for in most Wiccan traditions?',
          options: ['Cutting herbs and cords', 'Casting the circle and directing power, not cutting anything physical', 'Carving candles', 'Self-defence'],
          correct: [1],
          points: 1,
          explanation: 'The athame is a tool of will and direction. The boline, or a kitchen knife kept for the purpose, is the one that cuts.',
        },
        {
          id: 'q3',
          type: 'truefalse',
          prompt: 'Wiccan sources all agree that the athame is linked with air and the wand with fire.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. The Golden Dawn gives the blade to air and the wand to fire; many Wiccan books reverse them. Learn your coven’s choice and keep it consistently.',
        },
        {
          id: 'q4',
          type: 'multi',
          prompt: 'Which are wise ways to keep an athame? Choose all that apply.',
          options: ['At home, out of children’s reach', 'Carried in a pocket to an outdoor rite in a public park', 'Blunted, as many Wiccans keep it', 'Wrapped in cloth when not in use'],
          correct: [0, 2, 3],
          points: 1,
          explanation: 'In many countries carrying a blade in public is an offence. Keep it at home; use a wand or your hand for outdoor rites, or check the law first.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'In which direction is the circle usually cast?',
          options: ['Widdershins (anticlockwise)', 'Deosil (clockwise, sunwise)', 'Straight lines only', 'It doesn’t matter'],
          correct: [1],
          points: 1,
          explanation: 'The circle is cast and walked deosil, sunwise. It is opened widdershins, undoing what was done.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'Someone needs to leave the circle during a coven rite. What usually happens?',
          options: ['They must stay until the end', 'A doorway is cut with the athame, they step through, and it is closed again', 'They walk straight through the edge', 'The whole rite is abandoned'],
          correct: [1],
          points: 1,
          explanation: 'A doorway is cut and closed. Alone in an emergency you can simply go; the circle will not punish you. Ground and recast or close it afterwards.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'In most northern-hemisphere Wicca, which element belongs to the south?',
          options: ['Air', 'Fire', 'Water', 'Earth'],
          correct: [1],
          points: 1,
          explanation: 'East is air, south fire, west water, north earth. Many southern-hemisphere Wiccans place fire in the north, where the noon sun stands.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'In what order are the quarters released at the end of a rite?',
          options: ['The same order they were called', 'In reverse, usually beginning in the north', 'Only the east is released', 'They are not released'],
          correct: [1],
          points: 1,
          explanation: 'What was opened is closed in reverse: the Goddess and God thanked, then the quarters released widdershins, then the circle opened.',
        },
        {
          id: 'q9',
          type: 'multi',
          prompt: 'Which statements about cakes and ale and the Great Rite are true? Choose all that apply.',
          options: [
            'Lowering the athame into the chalice is a symbol of the union of the Goddess and God',
            'Alcohol is never required; juice or water is fine',
            'A coven may require sex as part of initiation',
            'A portion is offered to the gods',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'The Great Rite in token is symbolic. No genuine coven requires sex of anyone; anyone who suggests it is showing a serious red flag.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'What is drawing down the moon, as publicly described?',
          options: [
            'Pulling the moon closer with magic',
            'Inviting the Goddess into a priestess, so that she may be present and speak through her',
            'A way of charging moon water',
            'A divination with a mirror',
          ],
          correct: [1],
          points: 1,
          explanation: 'It is the invocation of the Goddess into a priestess, often followed by the Charge. Its particular forms belong to each tradition.',
        },
        {
          id: 'q11',
          type: 'truefalse',
          prompt: 'A beginner should practise drawing down the moon alone at home to prepare for coven work.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. It is learned in a coven, with experienced people present and aftercare. A beginner can safely read the Charge as a prayer instead.',
        },
        {
          id: 'q12',
          type: 'short',
          prompt: 'Describe the altar you set in the Wiccan way: what stands where, which tools you used or made do without, and why.',
          points: 2,
          explanation: 'Any honest, safe altar is right. Knowing why each thing stands where it does is what matters.',
          rubric: 'Full marks: describes a Wiccan-style arrangement, such as the Goddess and God sides and the pentacle in the centre (1 point); explains at least two choices, including any tools they substituted, and keeps any blade safely (1 point).',
        },
        {
          id: 'q13',
          type: 'long',
          prompt: 'After keeping the complete esbat, describe what you did, step by step, what you noticed, what was hard, and the one change you made to make it your own.',
          points: 4,
          explanation: 'Keeping a whole rite yourself is how the shape becomes yours. Honest notes help your mentor help you.',
          rubric: 'Full marks (4): describes the rite in the right order, from cleansing and casting to opening (1); notes what they noticed honestly, including if it was little (1); names a difficulty and how they handled it or would next time (1); describes a thoughtful change of their own (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Wiccan ritual',
      intro: 'Here you learn the Wiccan rite part by part: its shape, the altar and tools, casting the circle, the quarters and the Goddess and God, cakes and ale, and drawing down the moon as it is publicly described. You practise each at home, then keep a complete esbat yourself and with the coven.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'The shape of a rite',
          kind: 'study',
          instructions: `1. Read "The shape of a Wiccan rite".
2. Write the thirteen parts on a card from memory, check them, and keep the card on your altar.
3. Mark this task done when you can say the shape without looking.`,
          times: 1,
          response: 'none',
          checked_by: 'self',
          minutes: 25,
          docs: ['wicca-ritual-shape-of-a-wiccan-rite'],
          links: [page('planner')],
        },
        {
          title: 'Set a Wiccan altar',
          kind: 'practice',
          instructions: `1. Read "The Wiccan altar and its tools".
2. Set your altar in the Wiccan way with what you have. Consecrate any new tool with the app's "Consecrating a New Tool" rite.
3. In the answer box, describe your altar (and add a photo to your message if you'd like your mentor to see it).`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['wicca-ritual-the-altar-and-tools'],
          links: [ritual('wicca-consecrating-a-tool'), page('altar')],
        },
        {
          title: 'Cast and open the circle',
          kind: 'practice',
          instructions: `1. Read "Casting the Wiccan circle".
2. Cast and open the circle alone, with only a few minutes of quiet sitting in between.
3. Log each time, with a note of what you noticed. Do it three times on different days.`,
          times: 3,
          response: 'none',
          checked_by: 'self',
          minutes: 25,
          docs: ['wicca-ritual-casting-the-circle'],
          links: [ritual('wicca-casting-the-circle')],
        },
        {
          title: 'Write your calls',
          kind: 'book',
          instructions: `1. Read "The quarters, the Goddess and the God".
2. Write your own calls for the four quarters and invitations for the Goddess and God, and their farewells.
3. Read them aloud in a cast circle, then write the final version in the answer box and in your Book of Shadows.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 45,
          docs: ['wicca-ritual-quarters-and-powers'],
          links: [page('grimoire')],
        },
        {
          title: 'Cakes and ale',
          kind: 'ritual',
          instructions: `1. Read "Cakes and ale".
2. At the next full moon or in any cast circle, bless and share cakes and ale alone, with the offering, as the lesson describes.
3. Take the offering outside afterwards, and log it.`,
          times: 1,
          response: 'none',
          checked_by: 'self',
          minutes: 30,
          docs: ['wicca-ritual-cakes-and-ale'],
          links: [ritual('wicca-cakes-and-ale')],
        },
        {
          title: 'Drawing down the moon',
          kind: 'study',
          instructions: `1. Read "Drawing down the moon".
2. At the next full moon, read the Charge of the Goddess aloud as a prayer, then sit in silence for five minutes.
3. Send your mentor a message on this step: what you understood of drawing down, any questions, and whether your coven practises it.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wicca-ritual-drawing-down-the-moon'],
          links: [holy('moon-full'), page('moon')],
        },
        {
          title: 'Keep a complete esbat',
          kind: 'ritual',
          instructions: `1. Read "A complete esbat, from start to finish" twice.
2. Keep it at the next full moon, alone or with one or two others.
3. At the following full moon, change one thing to make it your own and keep it again.
4. Log each, and write in the answer box after the second.`,
          times: 2,
          response: 'text',
          checked_by: 'mentor',
          minutes: 75,
          docs: ['wicca-ritual-a-complete-esbat'],
          links: [ritual('wicca-full-moon-esbat')],
        },
        {
          title: 'An esbat with the coven',
          kind: 'attend',
          instructions: `1. Attend a coven esbat or sabbat, in person or in the app.
2. Afterwards, write in the answer box how the coven's rite differed from the one you learned, and anything you would like to learn next.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['wicca-ritual-shape-of-a-wiccan-rite'],
          links: [coven('rituals')],
          solitary: 'Keep a third full moon esbat, this time written wholly in your own words, and compare it with a Wiccan rite shared in the Community Rituals. In the answer box, write how they differ and what you learned.',
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
          minutes: 35,
          quiz: 'quiz-wicca-ritual',
          links: [coven('ritual-builder')],
        },
      ],
    },
  ],
} satisfies CourseModule;
