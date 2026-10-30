// Wheel of the Year ritual: the shape of an eclectic seasonal rite, taught
// step by step. Cleansing and opening sacred space in several ways (walking
// the boundary, a hallowing, a grove opening, the circle as one option among
// others), welcoming the powers, the festival's heart and the shared bread and
// drink, closing and disposal, and a full sample rite for one person or a
// coven. No Wiccan form is required. British spelling.

import type { CourseModule } from '../types';
import { coven, herb, page, ritual, tool, vessel } from '../linkHelpers.ts';

export default {
  id: 'wheel-ritual',
  title: 'Seasonal ritual',
  docs: [
    {
      id: 'wheel-ritual-shape-of-a-rite',
      title: 'The shape of a seasonal rite',
      summary: 'The order most eclectic Wheel rites follow, from preparation to feast, why each part is there, and how the shape stretches from a ten-minute household rite to a coven festival.',
      minutes: 15,
      links: [coven('ritual-builder'), page('planner'), coven('rituals'), ritual('folk-build-your-own-ritual')],
      body: `## Why a shape helps

A seasonal rite can be almost anything: lighting a candle at a window, a two-hour coven festival with a bonfire and a feast. But most rites that work well share a shape. Knowing it lets you take part with confidence, write your own rites, and adapt any rite to the time and space you have. This lesson teaches the shape; the following lessons teach each part in detail.

Eclectic Wheel covens did not invent this shape. It is close to what many traditions do: Greek and Roman rites, Druid ceremonies, Heathen blóts, church services, even family celebrations. You arrive and prepare, you make the space special, you welcome who is honoured, you do the heart of the thing, you share food, you say thank you, and you go home.

## The shape

1. **Preparation.** Before the rite: deciding what it is for, gathering what you need, cleaning the space, preparing yourself.
2. **Cleansing.** Washing away ordinary life so you can give the rite your full attention: water, smoke, sound or breath.
3. **Opening the space.** Marking a time and place as set apart: walking a boundary, lighting a central flame, casting a circle, or another way.
4. **Welcome.** Greeting whoever and whatever is honoured: the land and its spirits, the ancestors, the gods, the season itself.
5. **Statement of purpose.** Saying aloud why you have gathered: "We are here to mark the first harvest."
6. **The seasonal heart.** The festival's own custom or story: the thing that makes Samhain Samhain and not Beltane.
7. **A working or sharing** (optional): magic, a blessing, a meditation, or each person speaking.
8. **Bread and drink.** Blessing and sharing food and drink, with a portion given as an offering.
9. **Thanks.** Thanking each power welcomed, in roughly the reverse order.
10. **Closing the space.** Undoing the opening: walking the boundary the other way, putting out the flame, opening the circle.
11. **Grounding and feast.** Coming back to ordinary life, eating properly, talking.
12. **Afterwards.** Clearing away, dealing with offerings, writing it up.

## Why each part is there

- **Preparation** makes the rite smooth and safe. Most rites that go wrong do so because nobody knew where the matches were.
- **Cleansing** is a threshold for your attention. People who skip it often find their minds still at work or on their phones.
- **Opening** tells everyone, including your own mind, that this time is different. Many people experience it as a real change in the feel of the room.
- **Welcome** sets up the relationship the rite is about.
- **Purpose** keeps everyone on the same page, and helps you notice whether the rite did what it was meant to.
- **The seasonal heart** is the reason for the day.
- **Bread and drink** brings the blessing into the body and the community; it is also a gentle grounding.
- **Thanks** completes the relationship: you don't leave without saying goodbye.
- **Closing** returns the space to ordinary use and signals that the special time is over.
- **Grounding and feast** protect you from carrying the rite's intensity into the rest of the day.

## Stretching and shrinking the shape

The same shape works at any size.

### A ten-minute household rite

1. Wash your hands with attention (cleansing).
2. Light a candle on your seasonal altar and say "this is a holy time" (opening).
3. "Spirits of this place, my ancestors, and [any god you honour], be welcome" (welcome).
4. "I mark the spring equinox" (purpose).
5. Place a new flower on the altar and say what is growing in your life (heart).
6. Eat a piece of bread, pour a little drink on the earth or in a dish (bread and drink).
7. "Thank you, all who came" (thanks).
8. Put out the candle (closing).

### A coven festival

Every part is longer and shared out: one person cleanses each arrival, another opens the space, several speak the welcome, the heart may take forty minutes with a story, a dance and a working, and the feast lasts all evening.

## Roles in a coven rite

In a coven rite, the parts are shared. Common roles include:

- **Leader** (often the High Priestess or High Priest): holds the rite together, keeps time, speaks the purpose.
- **Opener:** opens and closes the space.
- **Welcomers:** greet the powers, often one person for each.
- **Cleanser:** cleanses people as they arrive.
- **Keeper of the flame or fire:** looks after candles and fire safety.
- **Storyteller or reader:** tells the festival's story.
- **Bearers:** carry and share the bread and drink.

As a devotee, you will usually be given small roles first. Your coven plans these in the ritual builder, so you can read your part before the day.

> **Your coven:** Your coven has its own order and its own words. Ask your mentor for a copy of the order your coven usually uses, and compare it with the shape here.

## Writing it down

Keep a copy of every rite you write or take part in, in your Grimoire or the app's planner. Over the years these records become your own book of rites, and show you how your practice grows.

> **Try this:** Take a ritual you have been to, perhaps your first coven gathering, and write down its order from memory. Label each part with the step in the shape above. What was missing? What was added?

## What's old and what's modern

- **Old:** the basic shape of approach, offering, sharing food and departure, which is found in many ancient and folk traditions.
- **Modern:** this exact order, its names, and the ritual builder that shares it with the coven.`,
    },
    {
      id: 'wheel-ritual-opening-the-space',
      title: 'Cleansing and opening sacred space, several ways',
      summary: 'How to cleanse yourself and others, and four ways to open sacred space from different traditions, each step by step: lighting a central flame, walking the boundary, a hallowing with fire, and a grove opening; with the cast circle as one option among them.',
      minutes: 20,
      links: [ritual('wicca-casting-the-circle'), herb('rosemary'), herb('juniper'), tool('bell'), vessel('bowl'), ritual('kitchen-threshold-salt-blessing')],
      body: `## Why open a space at all

"Sacred space" means a place set apart, for a time, for the work of a rite. Many traditions mark it: Greek temples had their boundaries, Roman augurs drew out a templum in the sky, Norse hallowers carried fire around a meeting place, churches are consecrated, and Wiccans cast a circle. An eclectic Wheel coven may use any of these, or its own.

Opening the space does three things. It focuses attention. It tells everyone present, and perhaps the unseen, that the rite has begun. And many practitioners experience it as creating a real boundary within which the work is held.

You do not have to cast a circle. This lesson teaches several ways, so you can choose what suits you, your coven and the rite.

## First, cleansing

Before opening the space, people cleanse themselves. Choose one:

### With water

1. Fill a bowl with clean water. You may add a pinch of salt (keep it away from plants) or a sprig of rosemary.
2. Hold your hands over it and say: "Water, wash away what I don't need to carry here."
3. Dip your fingers and touch your forehead, lips and heart, or wash your hands.

### With smoke

1. Light a stick of incense or a small dried bundle of garden herbs such as rosemary, lavender or juniper, in a fireproof dish.
2. Waft the smoke over yourself from head to feet, or have someone waft it over you.
3. Call it "cleansing with smoke". It is a common folk practice in Britain and Europe. Avoid the word "smudging", which names particular Indigenous ceremonies, and avoid white sage, which is over-harvested and sacred to some nations.

### With sound

Ring a bell or strike a singing bowl, and listen until the sound fades completely. This is a good choice for people who can't use smoke.

### With breath

Breathe in for four and out for six, ten times, imagining the out-breath carrying away the day.

## Four ways to open the space

### 1. The central flame

The simplest opening, found in many traditions, is lighting a flame at the centre.

1. Stand or sit at the altar or the middle of your space. Take three slow breaths.
2. Light the candle, lamp or fire.
3. Say: "With this flame we open a holy time and a holy place. Here we keep [the festival]."
4. Ring a bell or let a moment of silence fall.

### 2. Walking the boundary

Walking around a space to mark it is very old, found in Roman boundary rites, English beating of the bounds and many folk customs.

1. Decide the boundary: the edge of a room, a circle of stones, a garden.
2. Start in the direction your coven prefers. Many start in the east, where the sun rises, and walk sunwise (clockwise in the northern hemisphere, the way the sun moves across the sky; in the southern hemisphere the sun moves the other way, and some practitioners there walk anticlockwise).
3. Walk slowly once around, carrying a candle, a bell, a bowl of water or simply your attention. You may sprinkle water or ring the bell as you go.
4. As you walk, say: "I walk the bounds of this place. Within them, peace and good intent."
5. When you return to the start, stop and say: "The bounds are walked. The space is open."

### 3. A hallowing with fire

This is inspired by Heathen and Norse practice, where fire was carried around a place to make it holy (hallowed).

1. Light a candle or torch from the central flame.
2. Carry it sunwise around the space, holding it steadily, at a walking pace.
3. Say: "I carry fire around this place. Let it be hallowed. Let nothing ill be here."
4. Return the flame to the centre.

> **Safety:** Carrying fire needs care. Use a candle in a lantern or glass, keep hair and sleeves back, and never carry an open flame where people are crowded or where there is dry grass. An electric lantern is fine.

### 4. A grove opening

This is inspired by modern Druid practice, which often opens a rite by honouring land, sea and sky, and by calling for peace.

1. Stand facing the centre. Say three times: "May there be peace in the north, in the south, in the west and in the east. May there be peace throughout the world." (Druid orders use a call like this; your coven may have its own.)
2. Touch the earth and say: "Land beneath us, we greet you."
3. Pour a little water and say: "Waters around us, we greet you."
4. Raise your hands and say: "Sky above us, we greet you."
5. Say: "Between land, sea and sky, this grove is open."

### The cast circle, as an option

Many eclectic covens cast a circle, a practice that came into Wicca from ceremonial magic. It is offered here as an option, not a requirement. In brief:

1. Starting in the east, walk sunwise around the space, pointing a finger, wand or knife at the ground.
2. Imagine a line of light drawn by your pointing hand, and see it rise into a sphere.
3. Say: "I cast this circle, a boundary between the worlds."
4. Return to the east, and say: "The circle is cast."

The core course's lesson on sacred space teaches it in more detail, and the app has a ready-made rite for casting and closing a circle.

## Choosing

- **For a quick household rite:** the central flame.
- **For an outdoor rite:** walking the boundary or a grove opening.
- **For a rite with strong energy work:** a hallowing or a circle.
- **For a mixed coven:** something everyone is comfortable with.

There is no wrong choice, as long as you close the space in the same way at the end.

## What you might notice

Some people feel a change when the space opens: a hush, a pressure, a warmth, a feeling of being held. Others notice nothing, or only that their attention has sharpened. Both are normal. The opening works as a practice either way.

> **Your coven:** Your coven has its usual opening. Ask your mentor to show it to you, and whether you may use others at home.

> **Try this:** Over the next three weeks, open a space at home in three different ways, once each. Note in the app how each felt, and which suits you.

## What's old and what's modern

- **Old:** cleansing with water and smoke, walking boundaries, carrying fire round a place.
- **Modern:** the Druid-inspired grove opening (twentieth century), the Wiccan circle (from nineteenth- and twentieth-century ceremonial magic), and these exact words.`,
    },
    {
      id: 'wheel-ritual-welcoming-the-powers',
      title: 'Welcoming the powers',
      summary: 'How to welcome the land and its spirits, the ancestors, gods and the season in a rite, how to write a welcome and a thanks, and calling the four directions or elements as one option, with what each tradition means by it.',
      minutes: 18,
      links: [page('patron'), page('ancestors'), page('library'), ritual('green-daily-calling-the-elements'), page('journeys')],
      body: `## What a welcome does

Once the space is open, the rite welcomes those it honours. A welcome is like greeting guests at your door: you name them, you say why you're glad they're here, and you invite them in. It sets up the relationship the rite is about.

In an eclectic coven, the welcome must make room for many beliefs. This lesson teaches a common pattern, how to write your own words, and calling the four directions or elements as an option.

## The common pattern

Many eclectic Wheel rites welcome three groups, in this order:

1. **The land and its spirits:** the place where you stand.
2. **The ancestors:** those who came before.
3. **The gods,** or the powers each person honours.

Then, often, **the season itself**.

This order moves from closest (the ground under your feet) to furthest. You can change it, add to it or shorten it, but it is a good place to start.

## Writing a welcome

A good welcome has four parts:

1. **Name them.** "Spirits of this place." "Our ancestors, of blood and of heart." "Brigid, keeper of the flame."
2. **Describe them.** One or two lines that show you know whom you're addressing. "You who were here before the houses, the old ones of hedge and stone." "You who carried us to this day, whose names we know and whose names are lost."
3. **Invite them.** "Be welcome at our festival." "Come and share our feast, if it please you."
4. **Offer something.** A small gift, as a sign of good faith: a pinch of grain, a pour of drink, a flower, a song.

Keep it short: three or four lines for each is plenty. Speak clearly and slowly.

### Example: the land

"Spirits of this place, of the soil and the old roots, of the birds and the rain: you were here long before us. We come with respect. Be welcome at our festival, and accept this gift." (Pour a little water or scatter grain.)

### Example: the ancestors

"Ancestors, of blood and of heart, of craft and of place: you carried life to us, through every winter. We remember you. Be welcome tonight." (Place a candle or a piece of bread.)

### Example: the gods

"Gods and goddesses whom we honour, each of us in our own way: be welcome at our rite, and share in our celebration." (Pause, so each person can name their own silently or aloud.)

### Example: the season

"Season of first harvest, of ripening grain and long golden evenings: we welcome you." (Hold up a stalk of wheat or a loaf.)

## Thanks at the end

At the end of the rite, each welcome is answered by thanks, usually in the reverse order. A thanks has three parts:

1. **Name them.**
2. **Thank them** for something specific: "for your presence", "for the harvest".
3. **Bid farewell**: "go if you must, stay if you will", or "hail and farewell", or simply "thank you".

"Go if you must, stay if you will" is common in modern paganism. It is polite to spirits of the land, who were there before you and will remain.

## Calling the directions or elements, as an option

Many covens also call the four directions, east, south, west and north, often linked with the four classical elements, air, fire, water and earth. This practice comes mostly from the ceremonial magic of the Hermetic Order of the Golden Dawn, founded in 1888, which taught it to many later traditions, including Wicca. It is not found in Gaelic or Anglo-Saxon sources.

The usual pairings in the northern hemisphere are east and air, south and fire, west and water, north and earth. Other traditions pair them differently, and many southern-hemisphere practitioners swap north and south, so that fire is in the north (towards the equator, where the sun is) and earth in the south.

If your coven calls the directions, the pattern is like any welcome:

1. Face the direction.
2. Name it and its element: "Powers of the east, of air and the rising sun."
3. Describe it: "breath of the morning, wind of new beginnings."
4. Invite: "Be with us at our rite."

Some covens light a candle at each direction. Some practitioners understand the directions as beings, some as forces, some as ways of focusing the mind. All are respected.

If you prefer not to call the directions, you lose nothing essential. Welcoming the land, the ancestors and the gods is enough.

## Speaking aloud

Many people feel shy speaking a welcome. Some tips:

- **Write it down** and read it. There's no shame in a script.
- **Slow down.** Rites are not rushed.
- **Speak from your belly**, not your throat, so your voice carries without strain.
- **Pause** after each welcome. Let it land.
- **Mistakes don't matter.** If you stumble, carry on.

## When you don't believe

If you don't believe in spirits or gods, can you take part honestly? Many naturalistic pagans welcome the land as a living system, the ancestors as the people whose lives made theirs possible, and the gods as great stories or archetypes. You can say the words with those meanings in your heart. You are also free to stay silent during any part you can't say honestly.

> **Your coven:** Ask your mentor whom your coven usually welcomes, in what order, and whether it calls the directions. Ask for a copy of its usual words.

> **Try this:** Write a welcome and a thanks for the land where you live, using the four parts. Read them aloud at your altar, and change anything that doesn't feel right.

## What's old and what's modern

- **Old:** greeting gods and spirits, offerings to the land and the dead, thanking them at the end.
- **Modern:** calling the four directions with elements (from the Golden Dawn and Wicca), and the land-ancestors-gods order of many modern pagan groups.`,
    },
    {
      id: 'wheel-ritual-seasonal-heart',
      title: 'The seasonal heart, bread and drink',
      summary: 'The middle of a festival rite: the festival’s own custom or story, a working or sharing, and blessing and sharing bread and drink with an offering, step by step, with safety and inclusion.',
      minutes: 16,
      links: [page('premade'), ritual('wicca-cakes-and-ale'), ritual('kitchen-family-meal-blessing'), ritual('folk-gratitude-ritual'), coven('ritual-builder')],
      body: `## The reason for the day

The opening and welcome make the space; the closing undoes it. The seasonal heart is what the festival is about. It is the part that makes Imbolc Imbolc, and it should be the part people remember. The lore module gives customs for each festival; this lesson teaches how to build the heart of any rite, and how to bless and share bread and drink.

## Building the seasonal heart

The heart usually has one or two of these:

- **A custom of the season:** lighting candles at Imbolc, planting seeds at the spring equinox, weaving flowers at Beltane, watching the sunset at midsummer, breaking the first loaf at Lammas, setting a place for the dead at Samhain, lighting a log at Yule.
- **A story:** a myth or folk tale, or the story of the land through the season. It can be read, told or acted out.
- **Silence and attention:** watching the sun rise, the moon, a fire; listening to the land.
- **A reflection:** a question each person answers: "what are you harvesting this year?", "what will you leave in the dark?"
- **A working:** magic suited to the season, such as blessing seeds for growth, a protection charm at Samhain or a release at the autumn equinox.
- **Music and movement:** a song, a chant, a dance, a procession.

A good heart is **simple and concrete**. One custom done well is better than five crammed in. Something people do with their hands (planting, weaving, lighting) usually works better than something they only listen to. People remember what they did long after they have forgotten what was said, and a custom repeated every year, the same seeds planted, the same candles lit, becomes a thread that ties the years together.

### Planning it

1. **What is the season doing** where you are?
2. **What does the festival mean**, from its history and from your coven's practice?
3. **What one thing** will people do?
4. **What will they need?** Materials, roles, timing.
5. **How long?** Ten to forty minutes is usual.
6. **Is it safe and inclusive?** Can everyone take part, including those with limited mobility, no fire, no alcohol?

Then walk through it in your head from start to finish, as if you were a newcomer who had never seen it. Wherever you would be confused, add a line of explanation or a simpler step.

## A working

If the heart includes magic, it follows the pattern you learn in the core course: a clear intention, raising energy, directing it, release and grounding. In a seasonal rite, the working usually fits the festival:

- **Imbolc:** blessing candles for the year, or a working for inspiration.
- **Spring equinox:** blessing seeds for the year's goals.
- **Beltane:** a working for vitality, love or creativity.
- **Midsummer:** charging herbs or water in the sun.
- **Lughnasadh:** gratitude and the fruits of work.
- **Autumn equinox:** balance and letting go.
- **Samhain:** protection for the dark half, or work with the ancestors.
- **Yule:** hope and the returning light.

Consent matters. Never work magic on someone who has not asked for it.

## Bread and drink

Almost every Wheel rite ends its heart by sharing food and drink. It is a moment of community, of blessing, and of gentle grounding before the closing. In Wicca it is called "cakes and ale"; many traditions have their own versions. Any food and drink will do: bread, cakes, fruit, biscuits; wine, cider, mead, juice or water.

### Step by step

1. **Hold up the bread** (or food) and bless it. A simple blessing: "Bread of the earth, gift of the sun and the rain and many hands: we bless you and give thanks."
2. **Break off a piece for the offering** and set it on the offering plate or the earth: "To the land, the ancestors and the gods: the first share is yours."
3. **Pass the bread.** Each person takes a piece. They may say something: "may you never hunger", answered "may you never hunger".
4. **Hold up the drink** and bless it: "Drink of the earth, gift of the season: we bless you and give thanks."
5. **Pour a little as an offering**, into a bowl or onto the ground.
6. **Pass the cup**, or pour into each person's own cup. The same words: "may you never thirst".

The offering portions are dealt with after the rite, as the next lesson explains.

### Safety and inclusion

- **Alcohol is always optional.** Offer juice or water in the same way. Many covens use only non-alcoholic drink, so that no one has to explain.
- **Sharing a single cup** spreads illness. Many covens now pour into individual cups.
- **Allergies and diets:** know them. Have gluten-free, vegan or nut-free options as needed, and label shared food.
- **Children:** they can share juice and bread like everyone else.

## Online in the app

When a rite is online, each person has their own bread, drink and candle at home. The leader speaks the blessing and everyone does each step at the same time, then each says "may you never hunger" in turn or in the chat.

> **Your coven:** Ask your mentor what your coven usually shares, what words it uses, and how it handles a shared cup.

> **Try this:** Choose the next festival. Plan a seasonal heart using the six questions above, and write it down. If it's suitable, use it in your own household rite.

## What's old and what's modern

- **Old:** feasting at festivals, the first share given to the gods or the land, blessing bread, toasts and libations.
- **Modern:** the "cakes and ale" name and form (from Wicca), and the inclusive non-alcoholic and individual-cup practice.`,
    },
    {
      id: 'wheel-ritual-closing-and-after',
      title: 'Closing, grounding and offerings',
      summary: 'How to thank the powers and close the space in the same way you opened it, ground afterwards, dispose of offerings safely and kindly to the land, and write the rite up.',
      minutes: 15,
      links: [ritual('kitchen-solitary-grounding-centering'), vessel('offering_bowl'), page('journal'), page('grimoire'), coven('book')],
      body: `## Ending well

How a rite ends matters as much as how it begins. A rite that stops abruptly can leave people dizzy, scattered, or unsure whether it's over. A rite that ends well leaves them calm, grounded and glad. This lesson teaches the closing, grounding, and what happens afterwards.

## Thanks

After the seasonal heart and the bread and drink, thank each power welcomed, usually in reverse order: the season, the gods, the ancestors, then the land. The previous lesson taught how. Keep it as heartfelt and specific as the welcome.

## Closing the space

Close the space in the same way you opened it, reversed. This tells everyone, and your own mind, that the special time is over.

### If you lit a central flame

1. Say: "Our rite is ended. With thanks we close this holy time."
2. Put out the flame with a snuffer or by pinching (wet your fingers first), rather than blowing, if you like; many people feel blowing is disrespectful to the flame, though nothing in the old sources says so.
3. Ring a bell or clap once.

### If you walked the boundary

1. Start where you began and walk the opposite way, anticlockwise in the northern hemisphere (against the sun, sometimes called widdershins).
2. Say: "I walk the bounds again. The space returns to the world."
3. When you return to the start: "The bounds are open. Our rite is done."

### If you hallowed with fire

1. Thank the fire: "Fire that hallowed this place, thank you."
2. Put it out.
3. Say: "The hallowing is ended."

### If you opened a grove

1. Thank the sky, the waters and the land, in that order.
2. Say: "Between land, sea and sky, this grove is closed. May there be peace."

### If you cast a circle

1. Walk the circle anticlockwise from the east, pointing as you did when casting, and imagine the light drawing back into your hand or fading.
2. Say: "The circle is open, yet unbroken."

## Grounding

After the closing, everyone grounds: returns attention to their body and ordinary life. Rites can raise a lot of feeling or energy, and grounding prevents people leaving dizzy, wired or tearful. The core course teaches grounding in depth. Quick ways:

- **Touch the ground** with both hands, and imagine any excess energy draining down.
- **Eat** something: the feast is the best grounding.
- **Stamp your feet**, stretch, or clap.
- **Say your name, the date and where you are** aloud.
- **Drink water.**

If anyone feels unwell, dizzy or upset after a rite, sit with them, give them water and food, and don't leave them alone until they are steady. Make sure nobody drives home until they feel fully themselves again.

## Offerings

Offerings given during the rite now need care. The principle: **return them in a way that honours the power and does no harm to the land.**

### Food and drink

- **Pour drink onto the earth** in a garden or plant pot. Alcohol harms some plants in quantity; pour a little, or use water. Never pour into rivers or ponds.
- **Bury food** in a garden, or put it in compost or food waste. Avoid leaving food out in public places, where it feeds rats, harms wild animals or simply becomes litter.
- **Never leave** chocolate, grapes, raisins, onions, garlic or xylitol (a sweetener in many sugar-free foods) where dogs or cats can eat them; all are toxic to them. Bread is bad for ducks and swans.

Some practitioners do not eat food offered to the powers, believing it now belongs to them; others share it, believing the powers take the essence. Follow your coven's custom.

### Flowers and greenery

Compost them, or return them to the earth where they will rot naturally. Don't throw them in rivers.

### Candles

Let candles burn down safely on another occasion, or put them out and reuse them for the same purpose. Remove wax, tealight cases and wrappers from outdoor sites.

### Outdoors

Leave the place as you found it, or better. Pick up any litter, including other people's. Scatter ashes only where allowed, once fully cold.

## Writing it up

After the rite, write a short record in your Grimoire or the app's journal:

1. The date, festival and moon.
2. Where you were and who was there.
3. What you did, in order.
4. What you noticed: feelings, signs, weather, anything striking.
5. What worked and what you would change.

These notes are your own book of rites. A coven also keeps a record in its Book of Shadows. Reading back over a year of notes, you will see which customs took root and which never quite worked, and next year's festivals will be better for it. Write while it's fresh: details fade within a day.

> **Your coven:** Ask your mentor how your coven closes, what it does with offerings after outdoor rites, and who writes up coven rites.

> **Safety:** Make sure every candle, incense and fire is fully out before leaving. Check twice outdoors. If someone is distressed after a rite and it doesn't pass with grounding and food, tell your mentor; strong feelings are normal, but persistent distress needs care.

## What's old and what's modern

- **Old:** thanking the powers, offering food and drink to the earth, feasting after the rite.
- **Modern:** the closing forms and words here, the ecological care for offerings, and keeping records in an app.`,
    },
    {
      id: 'wheel-ritual-a-complete-rite',
      title: 'A complete seasonal rite',
      summary: 'A full sample rite for any festival of the Wheel, for one person at home or a coven, every word and step written out, with places marked where you put in the festival’s own custom.',
      minutes: 25,
      links: [coven('ritual-builder'), page('planner'), page('calendar'), page('premade'), page('journal'), page('altar')],
      body: `## How to use this rite

This lesson gives a complete seasonal rite you can use for any festival. It follows the shape you have learned, with every word written out. Where it says **[the festival's custom]**, put in something from the lore lesson for that festival. You can use it alone at home, or a coven can share it out among roles.

It takes about forty minutes alone, or an hour with a group, plus the feast.

## What you need

- A table or cloth for the altar, with something seasonal on it: flowers, leaves, fruit, grain, evergreens.
- A central candle in a holder, and matches.
- A bowl of water, and a sprig of rosemary or a towel.
- Incense or a small dried herb bundle in a fireproof dish (optional).
- A small bell (optional).
- Bread or cake on a plate, and drink in a cup or jug; individual cups if there are several people.
- An offering dish.
- Whatever the festival's custom needs.
- The words, printed or on your phone.

## Preparation

1. Decide the festival and the custom. Read the festival's lesson and page in the app.
2. Clean and tidy the space. Set up the altar.
3. Wash, and put on clean clothes. Put your phone on silent.
4. Sit quietly for a few minutes and think about the season: what you saw outside today, what the festival means to you this year.

## The rite

### 1. Cleansing

Stand before the altar. Dip your fingers in the water, touch your forehead, lips and heart, and say:

"Water, wash away what I don't need to carry here."

If you use smoke, waft it over yourself from head to feet. In a group, the cleanser does this for each person.

### 2. Opening

Light the central candle and say:

"With this flame I open a holy time and a holy place. Here I keep [the festival]."

Ring the bell, or let a moment of silence fall. (Your coven may walk the boundary, hallow with fire, open a grove or cast a circle here instead.)

### 3. Welcome

Speak each welcome, making a small offering after each:

"Spirits of this place, of soil and root and sky: you were here before me. Be welcome." (Scatter a pinch of grain or pour a little water in the offering dish.)

"Ancestors, of blood and of heart: you carried life to me. Be welcome." (Place a piece of bread in the dish.)

"Gods whom I honour, [name them, or say: and all the holy powers]: be welcome at my festival." (Pause.)

"Season of [describe the season in your own words]: I welcome you."

### 4. Purpose

"I am here to mark [the festival], when [say what the year is doing: the light returns, the first harvest ripens, the leaves fall]. I give thanks for what has been, and open myself to what is coming."

### 5. The seasonal heart

**[The festival's custom.]** For example: light candles around the central one at Imbolc; plant a seed at the spring equinox; weave a flower ring at Beltane; watch the sunset at midsummer; break the first loaf at Lughnasadh; name what you are grateful for at the autumn equinox; read the names of your dead at Samhain; light a candle in the dark at Yule.

Take your time. Then sit in silence for a minute or two.

### 6. Reflection

Say aloud, or write in your journal:

"This season, I [harvest / release / begin / remember / hope for] ..."

In a group, each person speaks in turn, or passes.

### 7. Bread and drink

Hold up the bread: "Bread of the earth, gift of the sun and the rain and many hands: I bless you and give thanks." Break off a piece for the offering dish: "The first share is yours." Eat a piece.

Hold up the drink: "Drink of the earth, gift of the season: I bless you and give thanks." Pour a little into the offering dish: "The first share is yours." Drink.

### 8. Thanks

"Season of [the season], thank you."
"Gods whom I honour, thank you for your presence."
"Ancestors, thank you. Go if you must, stay if you will."
"Spirits of this place, thank you. Go if you must, stay if you will."

### 9. Closing

"My rite is ended. With thanks I close this holy time."

Put out the candle. Ring the bell or clap once.

### 10. Grounding

Touch the ground with both hands. Breathe out slowly three times. Eat and drink something.

## Afterwards

1. Deal with the offerings as the previous lesson describes.
2. Leave the seasonal altar up until the next festival, or until its flowers fade.
3. Write the rite up in your journal or Grimoire.

## For a coven

The same rite shared among roles:

- **Leader:** purpose, reflection, holds the timing.
- **Cleanser:** cleanses each person on arrival.
- **Opener:** opening and closing.
- **Welcomers:** one for each of land, ancestors, gods and season, who also give the thanks.
- **Keeper of the heart:** leads the festival's custom.
- **Bearers:** bread and drink.

The ritual builder lets the coven share the words and roles before the day.

> **Safety:** Keep candles stable and away from anything that hangs. Never leave a flame unattended. Offer non-alcoholic drink. If you are outdoors, check fire rules and leave no trace.

> **Your coven:** Your coven's own festival rite may differ. Ask your mentor for a copy of it, and keep it with this one.

## What's old and what's modern

- **Old:** cleansing, welcoming, offering, sharing bread and drink, thanking.
- **Modern:** this complete rite, written for this course, and adaptable to any festival.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wheel-ritual',
      title: 'Seasonal ritual: test',
      intro: 'Twelve questions on the shape of a seasonal rite, opening sacred space in several ways, welcoming the powers, the seasonal heart, bread and drink, closing and offerings. You need 80% to pass. Your mentor will score the written answers.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'In the shape of a seasonal rite, what comes straight after opening the space?',
          options: ['The feast', 'Welcoming the powers', 'Closing', 'Grounding'],
          correct: [1],
          points: 1,
          explanation: 'After the space is opened, those the rite honours are welcomed: the land, the ancestors, the gods and the season.',
        },
        {
          id: 'q2',
          type: 'truefalse',
          prompt: 'In this coven’s practice, a seasonal rite must begin by casting a circle.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. A circle is one option among several: a central flame, walking the boundary, a hallowing with fire, or a grove opening all work.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'Where does calling the four directions with the four elements mainly come from?',
          options: [
            'Early Irish texts',
            'The ceremonial magic of the Hermetic Order of the Golden Dawn, passed on to Wicca and others',
            'Bede',
            'The Roman augurs',
          ],
          correct: [1],
          points: 1,
          explanation: 'The elemental quarters come mostly from the Golden Dawn (founded 1888) and later traditions such as Wicca. They are not in Gaelic or Anglo-Saxon sources.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'You want to cleanse with smoke. Which is the best choice?',
          options: [
            'White sage, calling it smudging',
            'Dried garden rosemary or incense, calling it cleansing with smoke',
            'Burning any plant you find',
            'A large bonfire indoors',
          ],
          correct: [1],
          points: 1,
          explanation: 'Garden herbs or incense work well. "Smudging" names particular Indigenous ceremonies, and white sage is over-harvested and sacred to some nations.',
        },
        {
          id: 'q5',
          type: 'multi',
          prompt: 'Which are parts of a good welcome? Choose all that apply.',
          options: ['Naming whom you welcome', 'Describing them in a line or two', 'Inviting them', 'Offering a small gift', 'Demanding that they grant a wish'],
          correct: [0, 1, 2, 3],
          points: 1,
          explanation: 'A welcome names, describes, invites and offers, like greeting guests at your door. Demands have no place in it.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'Why do many covens say "go if you must, stay if you will" when thanking the spirits of the land?',
          options: [
            'Because spirits must leave at once',
            'Because the land and its spirits were there before the rite and will remain; it is polite not to send them away',
            'Because it is a Wiccan rule',
            'Because it banishes them',
          ],
          correct: [1],
          points: 1,
          explanation: 'The spirits of a place belong there. The phrase thanks them without dismissing them from their own home.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'How should you close a space you opened by walking the boundary?',
          options: [
            'Simply stop and leave',
            'Walk it again the opposite way and say that the space returns to the world',
            'Cast a circle',
            'Blow out every candle in the house',
          ],
          correct: [1],
          points: 1,
          explanation: 'Close the space in the same way you opened it, reversed. That tells everyone the special time is over.',
        },
        {
          id: 'q8',
          type: 'multi',
          prompt: 'Which are safe and kind ways to deal with food and drink offerings? Choose all that apply.',
          options: [
            'Burying food in a garden, or putting it in compost',
            'Pouring a little drink onto the earth in a garden or plant pot',
            'Leaving chocolate and grapes in the park',
            'Pouring wine into a river',
          ],
          correct: [0, 1],
          points: 1,
          explanation: 'Offerings should honour the power and harm nothing. Chocolate and grapes are toxic to dogs; litter and alcohol harm rivers and wildlife.',
        },
        {
          id: 'q9',
          type: 'multi',
          prompt: 'Which are good practice when sharing bread and drink in a group? Choose all that apply.',
          options: [
            'Always offering a non-alcoholic drink',
            'Pouring into individual cups to avoid spreading illness',
            'Knowing and labelling allergens',
            'Pressing everyone to drink the wine',
          ],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Alcohol is always optional, individual cups are kinder, and food should be safe for everyone. No one is ever pressed to drink.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'After a rite, a coven-mate feels dizzy and tearful. What do you do first?',
          options: [
            'Leave them to get over it',
            'Sit with them, help them ground, give them water and food, and stay until they are steady',
            'Start another rite',
            'Tell them they did it wrong',
          ],
          correct: [1],
          points: 1,
          explanation: 'Strong feeling after a rite is common. Grounding, food, water and company usually help. If distress persists, tell the mentor.',
        },
        {
          id: 'q11',
          type: 'short',
          prompt: 'Write a welcome and a matching thanks for the spirits of the land where you live, using the parts taught in the lesson.',
          points: 3,
          explanation: 'A welcome names, describes, invites and offers; a thanks names, thanks for something specific, and bids farewell.',
          rubric: 'Full marks: the welcome names and describes the land specifically (1 point); it invites and includes a suitable offering (1 point); the thanks names, thanks for something specific and bids a respectful farewell (1 point).',
        },
        {
          id: 'q12',
          type: 'long',
          prompt: 'Plan the seasonal heart for the next festival of the Wheel: what the season is doing where you live, what people will do, what they need, how long it takes, and how you make it safe and inclusive.',
          points: 3,
          explanation: 'A good seasonal heart is simple, concrete and suited to the season and the land, with one custom done well, safely and for everyone.',
          rubric: 'Full marks: links the plan to both the festival’s meaning and the actual local season (1 point); a clear, concrete activity with materials and timing (1 point); addresses at least one safety point and one way to include people who cannot do part of it (1 point).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Seasonal ritual',
      intro: 'Here you learn your coven’s ritual form by doing it: the shape of a seasonal rite, cleansing and opening sacred space in several ways, welcoming the powers, the seasonal heart with bread and drink, and closing well. You finish by keeping a complete rite at home and taking a part in a coven rite.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'The shape of a rite',
          kind: 'study',
          instructions: `1. Read "The shape of a seasonal rite".
2. Do the "Try this": write down the order of a rite you've been to, and label each part.
3. Write it in the answer box.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wheel-ritual-shape-of-a-rite'],
        },
        {
          title: 'Open a space three ways',
          kind: 'practice',
          instructions: `1. Read "Cleansing and opening sacred space, several ways".
2. On three different days, cleanse yourself and open a space at home, each time in a different way (central flame, walking the boundary, a hallowing, a grove opening, or a circle). Close it the same way.
3. Log each time, with a note of which way you used and how it felt.`,
          times: 3,
          response: 'none',
          checked_by: 'self',
          minutes: 20,
          docs: ['wheel-ritual-opening-the-space'],
        },
        {
          title: 'Write a welcome and a thanks',
          kind: 'book',
          instructions: `1. Read "Welcoming the powers".
2. Write a welcome and a thanks for the land where you live, for your ancestors, and for any gods you honour (or the season, if you honour none).
3. Read them aloud at your altar and revise.
4. Write the final words in the answer box, and keep a copy in your Grimoire.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 45,
          docs: ['wheel-ritual-welcoming-the-powers'],
        },
        {
          title: 'Plan a seasonal heart',
          kind: 'book',
          instructions: `1. Read "The seasonal heart, bread and drink".
2. Choose the next festival and plan its heart using the six questions.
3. Write your plan in the answer box.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['wheel-ritual-seasonal-heart'],
        },
        {
          title: 'Keep a complete rite',
          kind: 'ritual',
          instructions: `1. Read "Closing, grounding and offerings" and "A complete seasonal rite".
2. Keep the complete rite at home for the next festival (or a full or new moon), with your seasonal heart.
3. Deal with the offerings kindly afterwards.
4. In the answer box, write it up: what you did, what you noticed, and what you would change.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['wheel-ritual-a-complete-rite', 'wheel-ritual-closing-and-after'],
        },
        {
          title: 'Take a part in a coven rite',
          kind: 'attend',
          instructions: `1. Ask your mentor for a small role at the next coven rite: a welcome, the cleansing, bearing the bread, or keeping the flame.
2. Read your part beforehand in the ritual builder, and practise it aloud.
3. After the rite, send your mentor a message on this step: how it went, and what you'd like to try next.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['wheel-ritual-shape-of-a-rite', 'wheel-ritual-welcoming-the-powers'],
          solitary: 'Keep the complete rite again for the following festival, speaking every part aloud as if leading others, and record it (audio or notes) to listen back and write what you would change.',
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
          quiz: 'quiz-wheel-ritual',
        },
      ],
    },
  ],
} satisfies CourseModule;
