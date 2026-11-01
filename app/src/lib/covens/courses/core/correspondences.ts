// Core module: correspondences. What they are and where they come from,
// colours, twelve common plants, seven common stones, days and planetary
// hours, herb and oil safety, and building your own. Tradition-neutral.
// Consistent with the Living Library (app/src/lib/library/traditionalData.ts)
// and the planetary hours in app/src/lib/craft/cosmic/hours.ts.

import type { CourseModule } from '../types.ts';

const correspondences = {
  id: 'core-correspondences',
  title: 'Correspondences',
  docs: [
    {
      id: 'core-correspondences-what-they-are',
      title: 'What correspondences are',
      summary:
        'What a correspondence is, where the lists in books and in the app come from, and how to use them as a language rather than a set of rules.',
      minutes: 20,
      body: `## A language of likeness

A **correspondence** is an agreed link between one thing and another: between a colour and a mood, a herb and a purpose, a day of the week and a planet, a stone and a feeling. When a book says “rosemary corresponds to remembrance and protection”, it means that people who practise magic have, for a long time, used rosemary when they wanted to remember or to protect, and that rosemary *stands for* those things in a working.

You already live with correspondences. Red means stop, green means go. White is worn at many weddings, black at many funerals. A gift of roses says something a gift of nettles doesn’t. None of these meanings is written into the colour or the plant by nature; people agreed on them, used them, and passed them on until they felt obvious. Magical correspondences work the same way, with a longer memory and a few more layers.

In magic, correspondences are used to **gather everything in a working around one idea**. If your intention is calm, you might choose a blue or white candle, a sprig of lavender, a piece of amethyst, and a Monday evening, because each of those has been linked with peace and quiet. Each piece repeats the same message. Practitioners describe this in different ways, and you will meet the main ones below; what they all share is the sense that a working where every part points the same way is stronger and clearer than one where the parts are random.

## Where the lists come from

It helps to know the history, because it tells you how much weight to give any one list.

- **Old ideas of sympathy.** Many cultures held that like affects like, and that things which resemble each other are connected. A yellow flower might be used for jaundice; a heart-shaped leaf for matters of the heart. This idea, sometimes called *sympathy* or *the doctrine of signatures*, is very old and appears in folk practice across Europe and beyond.
- **Classical and medieval learning.** Greek and Roman writers sorted the world into four elements (earth, water, air and fire) and seven visible “planets” (the Sun, the Moon, Mercury, Venus, Mars, Jupiter and Saturn). Medieval and Renaissance scholars, working from Arabic and Latin sources, built long lists linking each planet to metals, plants, stones, colours, days and parts of the body. Heinrich Cornelius Agrippa’s *Three Books of Occult Philosophy* (1533) is the most famous of these collections.
- **Nineteenth- and twentieth-century occultism.** Groups such as the Hermetic Order of the Golden Dawn (founded 1888) organised these older lists into large tables and added the tarot, Hebrew letters and the zodiac. Aleister Crowley published one version of these tables as *777* in 1909.
- **Modern witchcraft books.** From the 1970s onward, popular books (Scott Cunningham’s herbal and crystal encyclopaedias of the 1980s are the best known) gathered folk use, Golden Dawn tables and their authors’ own experience into the lists most people use today. Many crystal meanings in particular date only from the 1980s New Age movement.
- **Folk and family practice.** Alongside the books, families and regions kept their own uses: rowan over the door, salt across the threshold, bay in the bread bin. These are often older than the book lists and sometimes disagree with them.
- **Your own experience.** Every practitioner adds to the lists over time. You will too.

So when you read a correspondence, in a book, online, or in the app’s Living Library, you are reading a mixture of folk custom, learned tradition and modern writing. The Living Library tries to say which is which. None of it is a law of nature, and honest sources will tell you when a meaning is old and when it is new.

## How correspondences might work

People in your coven may hold different views, and you don’t need to choose one yet.

1. **As symbols that shape the mind.** Colour, scent and texture affect mood and attention. Holding a smooth cool stone and smelling lavender really does help many people slow down. On this view, correspondences work by focusing *you*: they make your intention vivid and keep it in mind.
2. **As real sympathies between things.** On the older view, things that share qualities are linked, so working with one stirs the others. A herb of the Sun carries something of the Sun’s nature.
3. **As a language spirits and gods understand.** In many traditions, offering a deity what is traditionally theirs (laurel to Apollo, for example) is a way of speaking respectfully in a shared language.

Many practitioners hold a little of all three. What matters for now is that you use correspondences with care and attention, and notice what happens.

## Using a table without being ruled by it

Correspondence tables can feel overwhelming. Here is how to use them well.

1. **Start from your intention, not from the table.** Write one sentence about what you want, for example “I want to sleep more peacefully.” Then look for a few things that fit it.
2. **Choose two or three items, not twenty.** A white candle and some lavender you already own will do more than a shopping list of things you don’t understand.
3. **Prefer what you know.** A herb from your kitchen that you have smelt, cooked with and grown is a stronger ally than an exotic one you have only read about.
4. **Check for safety every time.** Before you burn, touch or keep anything near pets or children, read its cautions. A later lesson in this module covers herb and oil safety in detail.
5. **When lists disagree, pick one and stay with it.** Rosemary is listed under fire in some books and under air or water in others. That is normal. Choose the one that makes sense to you, write it down, and be consistent.
6. **Substitute freely.** If a list calls for something you don’t have, use something with a similar meaning. A white candle can stand in for any colour. Rosemary can stand in for most cleansing and protective herbs. Clear quartz is often used in place of other stones.

> **Note:** Nobody needs to buy anything to practise magic. Every working in this course can be done with a plain candle, water, salt, and herbs from a supermarket spice rack.

## The four elements, briefly

You will see the four classical elements everywhere in correspondences, so here is a short reminder of what they usually stand for in modern practice:

- **Earth:** body, home, money, stability, growth, the ground under your feet.
- **Air:** mind, words, study, communication, breath, new ideas.
- **Fire:** will, courage, passion, energy, change, transformation.
- **Water:** feeling, love, dreams, intuition, healing, cleansing.

Many traditions add a fifth, often called **spirit** or **aether**, for what holds the others together. Your tradition’s own lessons may describe the elements differently, or not use them at all.

> **Your coven:** Some covens keep their own correspondence lists, especially for the quarters of the circle and for their gods. Ask your mentor whether your coven has one, and copy it into your Grimoire in the app when you are given it.

## Try this

> **Try this:** Choose one plant you already have in the kitchen (basil, mint, rosemary, bay, a tea bag of chamomile). Hold it, smell it, look at it closely for two minutes. In your journal, write what it makes you think of and feel, *before* you look it up. Then find it in the Living Library and compare. Where did you agree? Where not?

You are learning a language. Like any language, you learn it best by using it, a few words at a time.`,
    },
    {
      id: 'core-correspondences-colours',
      title: 'Colours',
      summary:
        'The common colour correspondences used for candles, cloths and cords, where they come from, and how to choose a colour for a working.',
      minutes: 20,
      body: `## Why colour matters in magic

Colour is the correspondence most people meet first, usually through candles. A green candle for money, a pink one for friendship, a black one for protection. Colour is quick to read, easy to find, and it acts on the mind straight away: you can feel the difference between a room lit by a red lamp and one lit by a blue one.

In practice you will use colour in candles, altar cloths, cords and ribbons, ink for writing petitions, bags and pouches for charms, and sometimes clothing for ritual.

## The common colours

These are the meanings most modern witchcraft books share, and the ones the app’s Living Library uses for candles. Each colour also has an element and a planet it is commonly linked with, which you will meet again later in this module.

- **White:** purification, blessing, healing, peace. White is the *universal substitute*: if you don’t have the colour a working calls for, use white. Linked with spirit and the Moon.
- **Black:** protection, banishing, absorbing negativity, endings, shadow work. Black is not evil; it is deep, still and containing, like night or fertile soil. Linked with Saturn.
- **Red:** courage, passion, vitality, strength, protection. Linked with fire and Mars.
- **Pink:** friendship, affection, self-love, compassion, emotional healing. Linked with water and Venus.
- **Orange:** creativity, opportunity, motivation, confidence, joy. Linked with fire and the Sun.
- **Yellow:** learning, communication, focus, inspiration. Linked with air and Mercury.
- **Gold:** success, abundance, confidence, divine blessing. Linked with fire and the Sun.
- **Green:** prosperity, growth, luck, fertility, the garden. Linked with earth and Venus.
- **Blue:** healing, peace, truth, wisdom, calm communication. Linked with water and Jupiter.
- **Purple:** intuition, psychic awareness, spiritual wisdom, divination. Linked with spirit and Jupiter.
- **Silver:** the Moon, dreams, intuition, reflection. Linked with water and the Moon.
- **Brown:** grounding, home, animals, practical matters, stability. Linked with earth and Saturn.
- **Grey:** neutrality, balance, calming a situation down. Linked with air and Saturn.

You will see other lists that differ. Some put Thursday’s colour as purple and others as blue; some use indigo for dreams and others silver. That is fine.

## Where colour meanings come from

Some colour meanings are close to universal: red for blood, heat and danger; green for growing things; gold for the Sun and wealth. Others are cultural. White is the colour of mourning in parts of East and South Asia, where Western books would use black. Green is associated with money partly because of the colour of United States banknotes, which is a twentieth-century association, not an ancient one.

Much of the colour list you see today comes from two sources: the planetary colours of Renaissance and Golden Dawn magic, and twentieth-century American candle shops and books, which simplified and popularised them. It is a modern system with some old roots, and it works well as a shared language.

> **Your coven:** If your coven comes from a culture where a colour means something different, use your coven’s meaning. Your own cultural sense of a colour is a correspondence too.

## Choosing a colour, step by step

1. **Write your intention as one sentence.** For example: “I want the courage to speak up at work.”
2. **Name the heart of it in one or two words.** Here: *courage*, *speaking*.
3. **Find the colour that matches the heart.** Courage suggests red; speaking suggests yellow. You might choose red for the courage, or yellow for the words, or a red candle on a yellow cloth for both.
4. **Check how the colour feels to you.** Look at it for a moment. If red feels angry rather than brave to you, try orange (confidence) instead.
5. **If in doubt, use white.** White carries any intention you give it.

## Colour on a small budget

You don’t need a candle of every colour. Many practitioners keep only white candles and tie a ribbon or thread of the right colour around them, or set them on a coloured cloth or paper. You can also write your petition in coloured ink, or draw a circle of coloured pencil around the candle on a paper plate. Tea lights in plain white, bought in bags, are the cheapest and safest candles for beginners.

## Candle safety

Colour work usually means candles, so before your first candle working:

> **Safety:** Never leave a burning candle unattended, and never burn one near curtains, shelves, hanging herbs, paper or pets. Put every candle in a heat-proof holder on a heat-proof surface, such as a ceramic plate or metal tray, away from draughts. Keep long hair and loose sleeves back. Keep water or a damp cloth nearby, and snuff rather than blow out if you prefer, but never leave a candle burning while you sleep or go out. If a spell calls for burning a candle down over several days, burn it in sessions and snuff it between them.

Coloured wax and glitter-covered candles can drip and flare more than plain ones. Tea lights in metal cups get very hot underneath: always stand them on a plate.

## Try this

> **Try this:** Collect five coloured things from around your home (a sock, a scarf, a mug, a book, a piece of fruit). Lay each on a plain surface and look at it for one minute. Write down three words for how each colour makes you feel. Compare your words with the list above. You are building your own colour sense, and it will be more useful to you than any list.`,
    },
    {
      id: 'core-correspondences-plants',
      title: 'Twelve common plants',
      summary:
        'Twelve safe, easy-to-find herbs and flowers: what each is used for, how to use it, and the cautions that go with it.',
      minutes: 30,
      body: `## Start with the kitchen

Plants are the oldest magical materials, and the easiest to find. The twelve below are all common, cheap, and sold as food or garden plants in most countries. They are a good beginner’s cupboard: between them they cover cleansing, protection, love, calm, courage, money and success.

For each one you will find its usual element and planet (as given in the app’s Living Library, though other books sometimes differ), its common uses, how to use it, and its cautions. Read the cautions every time. The next-but-one lesson goes deeper into safety.

> **Safety:** Everything in this lesson is for use *around* you: in jars, sachets, bowls, washes for floors and objects, and on the altar. Do not eat, drink or put any herb or oil on your skin as part of magic unless it is a normal food in normal amounts, or a qualified herbalist or doctor has advised you. Culinary use is not medical use.

## The twelve

### Rosemary

**Fire, Sun.** Protection, purification, remembrance, clarity. The great all-purpose cleansing herb of European folk practice; it was carried at weddings and funerals for remembrance.

*How to use:* hang a sprig by the door; add to floor washes; tuck a sprig under a pillow or in a purse; burn dried leaves as smoke cleansing in a fire-safe dish with the window open.

*Cautions:* the smoke can irritate lungs and pets. Concentrated rosemary oil should be avoided in pregnancy and by people with epilepsy.

### Lavender

**Air, Mercury.** Peace, sleep, gentle love, healing, purification.

*How to use:* a small bag of dried flowers by the bed; a few buds in a calming jar or sachet; fresh sprigs on the altar.

*Cautions:* generally gentle, but the essential oil can irritate skin and is not safe for all pets. Dilute well if it touches skin at all.

### Basil

**Fire, Mars.** Protection, prosperity, love, courage, a happy home.

*How to use:* a pot on the windowsill for household luck; dried leaves in a money jar; fresh leaves on the altar.

*Cautions:* gentle as food; the essential oil is strong. Keep oils away from pets.

### Bay

**Fire, Sun.** Wishes, success, victory, protection.

*How to use:* write a wish on a dried bay leaf and keep it in your purse, or burn it safely; add leaves to protection jars.

*Cautions:* burn only in a fire-safe bowl, held with tongs, with water nearby and ventilation. Whole bay leaves are a choking hazard if left in food, so keep magical and cooking leaves separate.

### Chamomile

**Water, Sun.** Calm, sleep, gentle luck, money, purification.

*How to use:* a tea bag opened into a sachet for peace; dried flowers in a luck jar; a cooled infusion as a wash for the altar or doorstep.

*Cautions:* chamomile is in the daisy family; people allergic to ragweed may react to it. Take care with pets and in pregnancy.

### Mint

**Air, Mercury.** Prosperity, freshness, clear thinking, communication, healing.

*How to use:* fresh leaves in a money bowl; a sprig in your wallet; dried mint in jars for movement and increase. Mint grows vigorously in a pot.

*Cautions:* mint and especially **peppermint** essential oils are strong; peppermint oil is toxic to cats and must never go near the face of a baby or young child.

### Cinnamon

**Fire, Sun.** Prosperity, speed, success, passion, warmth, protection.

*How to use:* a stick in a money jar; a pinch in a sachet to “quicken” a working; a little ground cinnamon blown gently across the threshold from the outside in (a modern folk custom for drawing in good fortune).

*Cautions:* cinnamon irritates skin and eyes. Don’t blow powder near people, pets or anyone with asthma, and never put cinnamon oil on skin.

### Rose

**Water, Venus.** Love of every kind, self-love, compassion, beauty, healing, comfort in grief.

*How to use:* petals in a self-love jar or bath sachet (kept in a bag, not loose in the water); a single rose on the altar; rose water to anoint objects.

*Cautions:* florist roses are usually sprayed with pesticides. Use food-grade or home-grown petals for anything touching skin. Mind the thorns.

### Thyme

**Water, Venus.** Courage, purification, healing, restful sleep.

*How to use:* a sprig in a pocket before a hard day; dried thyme in a cleansing sachet; in floor washes with rosemary.

*Cautions:* thyme oil is irritating and must never touch skin undiluted.

### Garden sage

**Air, Jupiter.** Cleansing, wisdom, protection, blessing.

*How to use:* a dried bundle of garden sage, or loose leaves on a heat-proof dish, burned for smoke cleansing; leaves in protection jars.

*Cautions:* use **garden sage** (*Salvia officinalis*), which grows almost anywhere, not wild-picked white sage. White sage is sacred to particular Native American nations and is being over-harvested; the app’s guide to closed and living traditions explains why. Call what you do “smoke cleansing” rather than “smudging”, which names a specific Indigenous ceremony. Smoke can irritate lungs and pets.

### Lemon balm

**Water, Moon.** Comfort, emotional healing, cheer, gentle protection.

*How to use:* fresh leaves on the altar when you feel low; dried leaves in a comfort sachet; a pot by the door. It grows easily and smells of lemon when brushed.

*Cautions:* gentle for most people, but medicinal use can interact with some conditions and medicines. Keep magical use separate from treatment.

### Calendula (pot marigold)

**Fire, Sun.** Joy, success, being seen kindly, solar blessing, dreams.

*How to use:* dried petals in a joy or success jar; fresh flowers on a summer altar; petals scattered on an offering.

*Cautions:* in the daisy family, so it can trigger ragweed-type allergies. Traditionally avoided internally in pregnancy. Calendula (*Calendula officinalis*) is not the same plant as the French and African marigolds (*Tagetes*) sold for bedding, so check the label.

## How to use plants, step by step

Most herb magic uses a handful of simple methods:

1. **Choose.** Pick one to three plants whose meanings match your intention.
2. **Prepare.** Wash your hands. If you have learned to ground and centre (as you did in Grounding), do so now. Hold the herb and say, aloud or silently, what you are asking it to help with.
3. **Use it** in one of the ways listed below.
4. **Dispose with respect.** When a working is finished, return plant material to the earth: compost it, bury it, or put it in the garden waste. Don’t throw it into rivers or wild places where it may spread or harm wildlife.

The usual ways to use a plant:

- **A jar or sachet** (a small cloth bag tied shut) that you keep somewhere meaningful.
- **A bowl on the altar.**
- **A wash:** steep a handful in a litre of just-boiled water for ten minutes, cool and strain, and use it to wipe down a doorstep, windowsills or the altar.
- **A sprig** carried in a pocket or hung over a door.
- **Smoke,** only for herbs listed as safe to burn, in a fire-safe dish with a window open.

> **Note:** You can grow almost all of these on a windowsill. A herb you have grown, watered and talked to is, for many practitioners, the most powerful kind.

> **Your coven:** Your tradition may hold particular plants sacred (oak and mistletoe, laurel and olive, rue, birch, rowan and many more). Those are taught in your tradition’s own lessons; ask your mentor which the coven keeps.`,
    },
    {
      id: 'core-correspondences-stones',
      title: 'Seven common stones',
      summary:
        'Seven easy-to-find stones, what they are used for, which must be kept out of water or sun, and how to care for and cleanse them safely.',
      minutes: 25,
      body: `## Stones in practice

Stones and crystals are popular in modern witchcraft. They are beautiful, they last, and holding one gives your hands and attention somewhere to rest. People use them on the altar, carry them in a pocket, place them in jars and sachets, sit with them in meditation, and lay them around a candle in a working.

Honesty first. Stones have been used as amulets and charms for thousands of years: carnelian and lapis in ancient Egypt, amber in northern Europe, jet in Roman Britain. But most of the specific meanings now given to crystals, especially for healing, come from New Age books of the 1980s onward. There is no scientific evidence that crystals heal illness. In magic, treat stones as **allies, symbols and focuses** for your intention, and never as a replacement for medical, psychological or practical help.

## The seven

These seven are cheap, easy to find, and between them cover most beginner needs. Their elements and planets follow the app’s Living Library.

### Clear quartz

**Spirit, Sun.** Clarity, amplification, holding an intention, cleansing. Often used as a stand-in for any other stone.

*Water:* safe to rinse. *Sun:* won’t fade, but a clear crystal can focus sunlight like a lens, so **never leave it in a sunny window near paper, curtains or anything that can catch fire**.

### Amethyst

**Air, Jupiter.** Calm intuition, dreams, meditation, spiritual protection, sobriety.

*Water:* safe to rinse. *Sun:* **fades** in strong sunlight over time; keep it out of sunny windows.

### Rose quartz

**Water, Venus.** Tenderness, self-love, compassion, forgiveness, gentle healing of the heart.

*Water:* safe to rinse. *Sun:* **fades** in strong sunlight.

### Black tourmaline

**Earth, Saturn.** Protection, grounding, boundaries, warding.

*Water:* a brief rinse is fine, but don’t soak it: pieces are often brittle and can split along cracks. *Sun:* fine.

### Citrine

**Fire, Sun.** Confidence, success, joy, abundance.

*Water:* safe to rinse. *Sun:* can fade over time. Note that much of the citrine sold is heat-treated amethyst; it can still be used, but it is fair to know what you are buying.

### Selenite

**Spirit, Moon.** Cleansing, peace, clarity, quiet.

*Water:* **never.** Selenite is a soft form of gypsum and dissolves, flakes and pits in water. Keep it away from damp, water bowls and bathrooms. Wash your hands after handling flaky pieces.

### Hematite

**Earth, Mars.** Grounding, focus, resilience, coming back into the body.

*Water:* **don’t soak**; hematite is an iron oxide and can rust. *Sun:* fine. Note that shiny magnetic “hematite” jewellery is usually a man-made material, not natural hematite.

## Quick rules for stone care

- **Out of water:** selenite, hematite, and also pyrite, malachite, and any soft, porous or flaky stone. When unsure, keep it dry.
- **Out of strong sun:** amethyst, rose quartz, citrine, and most coloured stones, which can fade.
- **Never in sun near anything flammable:** clear quartz and any clear crystal ball.
- **Never in drinking water:** don’t make “crystal elixirs” by soaking stones in water you drink. Some minerals, such as malachite, contain toxic metals, and many stones are dyed or treated.
- **Away from small children and pets:** small tumbled stones and chips are choking hazards.

## Cleansing a stone

Many practitioners **cleanse** a stone before using it and from time to time after, meaning they clear away whatever it has picked up so it is ready for new work. You don’t have to believe a stone “absorbs” anything to find this a useful habit: it marks the start of a new purpose.

Methods safe for every stone:

1. **Breath and intention.** Hold the stone, breathe in slowly for a count of four, and breathe out over it firmly, imagining anything stale blown away. Do this three times.
2. **Smoke.** Pass it through the smoke of a safe herb or incense three times, in a ventilated room.
3. **Sound.** Ring a bell, strike a singing bowl, or clap firmly over it.
4. **Earth or salt nearby.** Rest it on a dish of dry salt or rice, or on the soil of a pot plant, overnight. Don’t bury soft stones in damp soil or put any stone in salt water, which can damage many of them.
5. **Moonlight.** Leave it on a windowsill overnight. Moonlight won’t fade stones; just remember to bring the light-sensitive ones in before strong morning sun.

Then **dedicate** it: hold it, ground yourself, and say plainly what you would like it to help with. For example: “Amethyst, help me rest and dream clearly.” Keep it where you will see or touch it.

## Buying and sourcing

Stone mining can involve dangerous working conditions and child labour, and labels such as “ethically sourced” are often unverified. The app’s guide to sourcing explains more. Good habits: buy fewer stones; buy from sellers who can say where a stone was mined; consider second-hand stones; and remember that a pebble you found on a walk, which has meaning for you, is a perfectly good magical stone.

> **Your coven:** Some covens give each member a stone at dedication or keep stones on the coven altar. Ask your mentor how your coven uses them, if at all.

> **Try this:** Choose one stone you own, or a pebble from outside. Sit with it for five minutes. Notice its weight, temperature, texture and colour. Breathe slowly. Write down what you noticed, what (if anything) you felt, and what purpose it seems to suit. Then compare with the list above.`,
    },
    {
      id: 'core-correspondences-days-hours',
      title: 'Days of the week and planetary hours',
      summary:
        'How the seven days of the week came to be ruled by seven planets, what each day suits, and how planetary hours let you choose a time within a day.',
      minutes: 20,
      body: `## Seven planets, seven days

The ancient world could see seven moving lights in the sky that the Greeks called *planetes*, “wanderers”: the Sun, the Moon, Mercury, Venus, Mars, Jupiter and Saturn. (The Sun and Moon were counted as planets in this old sense.) In the Greek-speaking world of the late ancient Mediterranean (the Hellenistic and Roman periods), around two thousand years ago, each day of the week came to be ruled by one of them, and that system spread with the Roman Empire. You can still hear it in the names of the days.

- **Sunday:** the Sun. Success, vitality, confidence, health, recognition, blessing new ventures. Colours: gold, yellow, orange.
- **Monday:** the Moon (Moon-day; French *lundi*). Dreams, intuition, home and family, cleansing, emotional healing, divination. Colours: silver, white.
- **Tuesday:** Mars (French *mardi*; in English, Tiw’s day, after a Germanic war god). Courage, protection, energy, competition, cutting ties. Colour: red.
- **Wednesday:** Mercury (French *mercredi*; in English, Woden’s day). Communication, study, writing, business, travel. Colours: yellow, orange, sometimes purple.
- **Thursday:** Jupiter (French *jeudi*; in English, Thor’s day). Luck, growth, abundance, generosity, legal matters, learning. Colours: blue, purple.
- **Friday:** Venus (French *vendredi*; in English, Frigg’s day). Love, friendship, beauty, art, pleasure, harmony. Colours: green, pink.
- **Saturday:** Saturn. Boundaries, binding bad habits, endings, protection of the home, discipline, the ancestors. Colours: black, indigo, dark blue.

The English names come from the Germanic peoples matching their own gods to the Roman ones: Tiw for Mars, Woden for Mercury, Thor for Jupiter, Frigg for Venus. That matching is itself an old act of correspondence.

## Planetary hours

The same ancient astrologers also gave each *hour* a planet. This lets you choose not just a day but a time within it.

Here is how it works:

1. **The day and the night are each divided into twelve “hours”.** The time from sunrise to sunset is split into twelve equal parts, and the time from sunset to the next sunrise into another twelve. So in summer the daytime hours are long and the night hours short, and in winter the other way round. A planetary hour is rarely exactly sixty minutes.
2. **The first hour after sunrise belongs to the planet of the day.** On a Monday, the first hour belongs to the Moon; on a Friday, to Venus.
3. **The rest follow in a fixed order,** from the slowest planet to the fastest as the ancients saw them: Saturn, Jupiter, Mars, the Sun, Venus, Mercury, the Moon, then Saturn again, round and round.

This is in fact *why* the days of the week are in the order they are: if you run the hours on through twenty-four of them, the first hour of the next day lands on the next day’s planet.

You don’t need to work this out by hand. The app calculates planetary hours for where you are, shows you which planet rules the hour now, and finds the next hours of any planet you choose. It uses the same traditional meanings:

- **Sun:** success and vitality.
- **Moon:** dreams and intuition.
- **Mars:** courage and protection.
- **Mercury:** words and study.
- **Jupiter:** luck and growth.
- **Venus:** love and beauty.
- **Saturn:** boundaries and endings.

## Using days and hours

1. **Decide whether timing matters for this working.** For many small workings it doesn’t much. For a working you are planning ahead, it is a pleasant way to add one more layer of meaning.
2. **Find the planet that matches your intention.** A job interview: the Sun (success) or Mercury (words). A friendship: Venus. Protecting your home: Saturn or Mars.
3. **Choose the day,** if you can wait for it.
4. **Within the day, choose the planet’s hour,** using the app. If the day and the hour share the planet (a Venus hour on a Friday), many practitioners consider that especially fitting.
5. **If you can’t wait, use the hour alone.** Every planet has an hour on every day, so you can always find a Venus hour within a day or so.
6. **Write down the day and hour** in your record of the working, so you can compare results later.

## A worked example

Priya wants to bless a new friendship.

1. *Planet:* Venus, for friendship and harmony.
2. *Day:* Friday, Venus’s day.
3. *Hour:* she opens the app on Friday morning and sees that the next Venus hour starts at 1.40 in the afternoon, while she is at work, and the one after that late in the evening. She chooses the evening hour.
4. *Correspondences:* a pink candle (friendship), a pinch of rose petals (love of every kind), a piece of rose quartz.
5. *Record:* “Friday, hour of Venus, waxing Moon” goes at the top of her notes.

If Friday had been impossible, she could have used a Venus hour on any other day, or simply worked at a time that suited her. The timing is a gift to the working, not a condition of it.

## Common difficulties

- **“The hours don’t start on the hour.”** That is right: they run from sunrise and sunset, and their length changes through the year. Trust the app’s times for your location.
- **“The right hour falls in the middle of the night or my working day.”** Choose another hour of the same planet, or let the day alone carry the meaning.
- **“Different books give different colours for the days.”** Pick one list and be consistent.

> **Note:** Planetary days and hours come from the learned astrological tradition of the Mediterranean and Middle East, carried through medieval and Renaissance magic. They are genuinely old. Whether they suit your tradition is another question: some reconstructionist traditions don’t use them at all, and others use their own calendars. Your tradition’s lessons will say.

> **Your coven:** Covens often meet on the same weekday for practical reasons. Don’t worry if your coven’s meeting day doesn’t “match” the working. A coven’s regular rhythm has its own power.

> **Try this:** For one week, at some point each day, open the app and note which planet rules the day and the hour. Write one line on how the day felt. At the end of the week, read your notes back and see whether you noticed any pattern. Don’t worry if you didn’t; you are training attention, not proving anything.`,
    },
    {
      id: 'core-correspondences-safety',
      title: 'Herb, oil and incense safety',
      summary:
        'How to handle herbs, essential oils, incense and smoke safely around yourself, children, pregnancy and pets, and which plants to leave alone.',
      minutes: 25,
      body: `## Natural is not the same as safe

Many of the most poisonous substances in the world come from plants. Magic uses herbs, oils, resins and smoke in small amounts and in enclosed spaces, often around children and pets, and sometimes by people who are pregnant, unwell or taking medicines. This lesson is the safety foundation for everything you do with physical materials in this course. Read it carefully and come back to it.

> **Safety:** The rule above all rules: **never eat, drink, or put on your skin any herb, oil or preparation as part of magic** unless it is an everyday food in everyday amounts, or a qualified medical professional or herbalist who knows your health has said it is safe for you. Magic is never a substitute for medical or psychological care.

## Essential oils

Essential oils are highly concentrated plant extracts. A single drop of peppermint oil may hold the essence of a large handful of leaves. They are not the same as the plant.

1. **Never use an essential oil undiluted on skin.** Mix it into a carrier oil such as sunflower, olive, sweet almond or jojoba. About **one drop of essential oil to a teaspoon (5 ml) of carrier** gives roughly a 1 per cent dilution, which is plenty for anointing a candle, a wrist or a stone.
2. **Patch test.** Before using any oil blend on your skin, put a little on the inside of your elbow, cover it, and wait twenty-four hours. If there is redness, itching or burning, don’t use it.
3. **Keep oils away from eyes, mouth and broken skin.** Wash your hands after handling them.
4. **Never swallow essential oils.** Some, such as wintergreen, eucalyptus and pennyroyal, can be fatal if swallowed, especially by children.
5. **Watch for sun-sensitising oils.** Bergamot and cold-pressed lemon, lime and other citrus oils can cause burns and blistering if skin is exposed to sunlight after use.
6. **Hot, “spicy” oils burn skin:** cinnamon, clove, oregano, thyme. Don’t use them on skin at all.
7. **Store oils tightly closed, out of reach of children and pets,** away from heat and flame. They are flammable.
8. **Buy carefully.** Cheap “fragrance oils” are synthetic perfumes, not essential oils. They are fine for scenting a room or anointing a candle, but they are not plant materials.

> **Note:** Most magical anointing doesn’t need essential oil at all. Plain olive or sunflower oil from the kitchen, in which you have soaked a few dried herbs for a week, makes a gentle and safe anointing oil.

## Pregnancy, breastfeeding and children

If you are pregnant, trying to become pregnant, or breastfeeding, avoid essential oils on your skin and avoid smoke from burning herbs. Certain herbs have a long history of being used to bring on miscarriage and are traditionally avoided in pregnancy even in small amounts, including **mugwort, rue, tansy, pennyroyal, wormwood** and large amounts of sage and rosemary. Don’t handle these at all if you are pregnant.

For children: keep all oils, resins, herbs and candles out of reach; don’t diffuse strong oils (especially peppermint and eucalyptus) near babies and young children; and let children take part in magic with safe things like flowers, pebbles, water and drawing.

## Pets

Animals are often far more sensitive than people.

- **Cats** can’t break down many compounds in essential oils. Tea tree, peppermint, eucalyptus, citrus, cinnamon, clove, pine and ylang-ylang are among those that can make cats seriously ill, even from diffusers or from oil on their fur.
- **Dogs** are also harmed by tea tree and several other oils.
- **Birds** have delicate lungs and can be killed by smoke, incense and aerosol sprays. Never burn anything in a room with a pet bird.
- **Lilies** (true lilies and day lilies) are deadly to cats: even the pollen licked from fur can cause kidney failure. Don’t put lilies on an altar in a home with cats.
- Many common plants are toxic to pets if chewed. Keep herbs, offerings and altar plants where animals can’t reach them, and look up any new plant before bringing it home.

If you think a pet has eaten or touched something harmful, call a vet straight away.

## Smoke and incense

Burning herbs, resins and incense is an old and lovely practice. It is also smoke.

1. **Ventilate.** Open a window, even a little, whenever you burn anything.
2. **Burn in a fire-safe container**: a ceramic or metal bowl with a layer of sand or salt in the bottom, on a heat-proof surface.
3. **Use small amounts.** A pinch of dried herb or one stick of incense is enough.
4. **Never leave it burning unattended.** Make sure everything is fully out, and cold, before you leave the room. Charcoal discs for loose incense stay dangerously hot for a long time.
5. **Mind the people around you.** Smoke can trigger asthma and migraines. In a coven, ask before burning anything, and offer smoke-free ways to cleanse, such as a spray of herb water, a bell, or a sprinkle of salt water.
6. **Check smoke alarms** are working, and don’t disable them.

## Plants to leave alone

Some plants appear in old books of magic and in fiction because they are poisonous. **Don’t grow, buy, handle, burn or keep them as a beginner:** belladonna (deadly nightshade), foxglove, mandrake, henbane, datura, monkshood, hemlock, and yew (every part except the flesh of the berry is deadly, and the seed inside the berry is deadly too). Their meanings can be honoured through pictures, words and safe substitutes. Some, such as foxglove, are lovely garden plants; admire them where they grow.

## Allergies and sensitivities

The daisy family (chamomile, calendula, yarrow, mugwort, echinacea and many others) can trigger reactions in people allergic to ragweed. Lavender and rosemary oils can irritate. Cinnamon powder irritates skin and airways. Always ask the people in your coven about allergies before using anything in shared ritual.

## Wild-gathering and sourcing

Only pick plants you can identify with complete certainty, from places where picking is allowed, and never more than a small share of what grows there. Never pick protected or rare plants. Avoid roadsides and sprayed land. Prefer herbs you grow, buy as food, or buy from sustainable sources, and avoid over-harvested plants such as wild white sage and palo santo.

> **Your coven:** Your coven may keep a list of materials it won’t use in shared ritual because of members’ allergies, asthma or pets at the meeting place. Ask your mentor, and add your own needs to it.

> **Try this:** Go through every herb, oil, resin and incense you own. For each one, look up its cautions in the Living Library or on its label, and write a line in your Grimoire: what it is, what it’s safe for, and what to avoid. Throw away anything unlabelled you can’t identify.`,
    },
    {
      id: 'core-correspondences-your-own',
      title: 'Building your own correspondences',
      summary:
        'How to build a personal correspondence list from your own experience and test it over time, so the language of magic becomes yours.',
      minutes: 20,
      body: `## Why make your own?

Published correspondence lists are a shared starting point. But the most powerful correspondences for you will often be your own: the smell of your grandmother’s garden, the stone you picked up on the day your life changed, the song that makes you brave. Experienced practitioners nearly all keep a personal list, built up over years, that sits alongside the traditional ones.

Building your own is not making things up at random. It is careful, honest observation of how things affect you, recorded and tested over time.

## Three sources for your own list

1. **Memory and association.** What does this thing already mean to you? A herb your family cooked with at celebrations may mean joy and gathering to you, whatever the books say.
2. **Direct experience.** What do you notice when you sit with it? Some practitioners feel warmth, coolness, tingling, heaviness, lightness, or images and moods arising. Others notice very little at first. Both are normal; you are learning to pay attention, as you began to in the lessons on energy.
3. **Results.** Which materials seem to work well in your workings? After months of keeping records, patterns appear.

## Step by step: a correspondence study

Do this with one item at a time: a herb, a stone, a colour, a tree you walk past every day.

1. **Prepare.** Sit somewhere quiet. Ground and centre as you learned in Grounding. Set a timer for ten minutes.
2. **Meet it with your senses.** Look closely at it for two minutes. Smell it, if it has a scent. Feel its texture, weight and temperature. If it is a food you know to be safe, you may taste a tiny amount; otherwise don’t.
3. **Notice your body.** With your eyes closed and the item in your hand or in front of you, breathe slowly (in for four, out for six) and notice any change in your body: warmth, coolness, relaxation, tension, energy, sleepiness.
4. **Notice your mind.** What thoughts, memories, images, words or colours come up? Don’t judge or chase them; just notice.
5. **Write it down straight away,** before you look anything up, using the pattern below.
6. **Then look it up.** Read the Living Library entry or a good book. Note where you agreed and where you differed.
7. **Repeat** on another day, in a different mood. A single session can be coloured by how you happened to feel.

The pattern for your notes:

- **Item:** what it is.
- **Date, time, moon phase:** when you sat with it.
- **Senses:** what you saw, smelt and felt.
- **Body:** what changed.
- **Mind:** images, memories, words.
- **It seems to suit:** your best guess at its purpose.

## Testing over time

When you use an item in a working, record what you used and what happened. Every few months, read back over your records. Ask:

- Which materials have I reached for again and again?
- Which workings felt strongest, and what was in them?
- Has anything surprised me?

If, over many uses, a herb consistently feels calming to you though the books call it fiery, trust your records. Write your meaning beside the book’s in your personal list.

## Keeping your list

Keep your correspondences in your Grimoire in the app, or in a notebook if you prefer paper. A simple layout works best:

- one page per item, or
- one page per intention (calm, courage, love, protection, money, clarity, rest), listing the colours, plants, stones, days and symbols that work for you.

Note where each entry came from: *traditional*, *coven*, or *mine*. This keeps you honest, and helps when you teach others later.

## A worked example

Here is how one trainee’s notes on thyme looked after three sessions.

- **Session one** (waxing Moon, a tired evening): smelt sharp and warm, like a roast dinner; felt my shoulders drop; remembered my grandfather’s garden; seemed to suit comfort and home.
- **Session two** (full Moon, a good morning): noticed how tough the little stems are; felt steadier and more awake; the word “keep going” came to mind; seemed to suit endurance and courage.
- **Session three** (waning Moon, after a hard day at work): felt calmer; slept well afterwards; seemed to suit rest and quiet courage.
- **The books said:** courage, purification, healing, sleep.

The trainee’s own entry read: “Thyme: quiet courage, comfort, keeping going. *Mine and traditional.*” Notice that her experience and the books mostly agreed, and that her own words, “keeping going”, will mean more to her in a working than any list.

## Common difficulties

- **“I don’t notice anything.”** Very common at first. Record that honestly, and record the senses: colour, smell, texture. Perception grows with practice, as you found in the lessons on energy.
- **“I just repeat what I’ve read.”** Do the study before you look anything up, and with things you haven’t read about: a weed from the pavement (looked at, not handled, if you can’t identify it), a pebble, the colour of your front door.
- **“My notes contradict each other.”** That is information. Things can have several sides, and your mood colours each session. Look for what stays the same.
- **“I can’t keep it up.”** One item a week is plenty. Correspondence lists grow over years.

## A word on humility

Personal correspondences are valuable, but they are personal. When you share them, say so: “For me, thyme is a sleep herb” rather than “Thyme is a sleep herb.” And when your coven or tradition has an established meaning for something in its shared rites, use the shared meaning there. A coven works best when everyone speaks the same symbolic language in the circle, even if each member also has a private dialect at home.

> **Your coven:** Some covens build a shared correspondence list together over years, adding what members find. If yours does, your notes may one day become part of it.

> **Try this:** Choose one intention that matters to you now (calm, courage, rest, friendship, focus). From your home, and without buying anything, gather one colour, one plant or food, one stone or natural object, and one sound or song that *feel* like that intention to you. Write them down as the first page of your personal correspondence list, with a line on why you chose each.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-core-correspondences',
      title: 'Correspondences: test',
      intro:
        'Fifteen questions on what correspondences are, colours, plants, stones, days and hours, and safety. Most are scored at once; the written answers are scored by your mentor. You need 80 per cent to pass, and you can read the lessons again and retake it.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'Which best describes a correspondence in magic?',
          options: [
            'A fixed law of nature that makes a spell work',
            'An agreed link between one thing and an idea or purpose, built up through tradition and experience',
            'A letter you send to a deity',
            'A list of ingredients that must all be used exactly',
          ],
          correct: [1],
          points: 1,
          explanation:
            'A correspondence is an agreed link, such as rosemary with remembrance, built up through folk custom, learned tradition, modern books and personal experience. It is a shared language, not a law of nature, and you can substitute when you need to.',
        },
        {
          id: 'q2',
          type: 'truefalse',
          prompt: 'Most of the specific crystal meanings in modern books are ancient and recorded in Roman sources.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation:
            'Stones have been worn as amulets for thousands of years, but most specific modern crystal meanings, especially healing claims, come from New Age books of the 1980s onward. Knowing what is old and what is new helps you weigh a source honestly.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'You want to do a working for calm but have no blue, white or purple candle. What is the best choice?',
          options: [
            'Wait until you can buy the right colour',
            'Use any candle you have and tie a ribbon or set it on a cloth of a calm colour, or simply use a plain white tea light if you have one',
            'Use a red candle, because colour doesn’t matter at all',
            'Skip the candle and burn a cinnamon stick instead',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Correspondences are meant to help, not block you. White is the universal substitute, and a ribbon, cloth or coloured ink can carry the colour instead. There is no need to wait or buy anything.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'Which of these stones should never be put in water?',
          options: ['Clear quartz', 'Rose quartz', 'Selenite', 'Amethyst'],
          correct: [2],
          points: 1,
          explanation:
            'Selenite is a soft form of gypsum and dissolves, flakes and pits in water. Hematite and pyrite can rust, so don’t soak them either. Clear quartz, rose quartz and amethyst are safe to rinse.',
        },
        {
          id: 'q5',
          type: 'multi',
          prompt: 'Which of these stones fade if left in strong sunlight? Choose all that apply.',
          options: ['Amethyst', 'Rose quartz', 'Hematite', 'Citrine'],
          correct: [0, 1, 3],
          points: 1,
          explanation:
            'Amethyst, rose quartz and citrine can fade in strong sun. Hematite doesn’t fade, though it shouldn’t be soaked. Remember too that clear quartz can focus sunlight like a lens and start a fire.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'Why does the course recommend garden sage rather than white sage?',
          options: [
            'Garden sage is stronger',
            'White sage is sacred to particular Native American nations and is being over-harvested in the wild',
            'White sage is poisonous',
            'Garden sage is the only sage mentioned in old books',
          ],
          correct: [1],
          points: 1,
          explanation:
            'White sage grows wild only in a small region and is sacred to the nations there; wild stands are being poached for the smudge-kit trade. Garden sage, rosemary, bay or juniper make good cleansing smoke, and we call it smoke cleansing rather than smudging.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'Roughly how much essential oil to a teaspoon (5 ml) of carrier oil gives a gentle dilution for anointing?',
          options: ['About one drop', 'About ten drops', 'Half and half', 'None: essential oils go straight on the skin'],
          correct: [0],
          points: 1,
          explanation:
            'One drop to a teaspoon of carrier is roughly a 1 per cent dilution, plenty for anointing. Never use essential oils undiluted on skin, patch test first, and never swallow them.',
        },
        {
          id: 'q8',
          type: 'multi',
          prompt: 'Which of these are real dangers to pets? Choose all that apply.',
          options: [
            'Peppermint and tea tree oil around cats',
            'Lilies on an altar in a home with cats',
            'Incense smoke in a room with a pet bird',
            'A plain white candle in a holder on a high shelf with the animal out of the room',
          ],
          correct: [0, 1, 2],
          points: 1,
          explanation:
            'Cats can’t break down many essential oils, and lily pollen can cause fatal kidney failure in cats. Birds can be killed by smoke. A candle safely out of reach, with the pet out of the room and the flame attended, is not in itself a danger.',
        },
        {
          id: 'q9',
          type: 'truefalse',
          prompt: 'A herb that is safe to cook with is also safe to take in large amounts as a remedy, as long as it’s for magic.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation:
            'Culinary amounts are not medicinal amounts. Never eat, drink or put on your skin any herb or oil as part of magic unless it is an everyday food in everyday amounts, or a qualified professional has advised you.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'Which planet rules Friday, and what does it traditionally suit?',
          options: ['Mars: courage and protection', 'Venus: love, friendship and harmony', 'Saturn: boundaries and endings', 'Mercury: study and words'],
          correct: [1],
          points: 1,
          explanation:
            'Friday is Venus’s day (vendredi in French, Frigg’s day in English), traditionally for love, friendship, beauty and harmony.',
        },
        {
          id: 'q11',
          type: 'single',
          prompt: 'How are planetary hours counted?',
          options: [
            'Every clock hour from midnight, in alphabetical order of planets',
            'Daylight and night are each split into twelve parts; the first hour after sunrise belongs to the day’s planet, and the rest follow in a fixed order',
            'Each planet rules a whole day and there are no hours',
            'They are chosen freely by each practitioner',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Sunrise to sunset and sunset to sunrise are each split into twelve unequal hours. The first after sunrise belongs to the planet of the day, then Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon in order. The app works them out for where you are.',
        },
        {
          id: 'q12',
          type: 'multi',
          prompt: 'If you are pregnant, which of these should you avoid? Choose all that apply.',
          options: ['Handling mugwort or rue', 'Essential oils on your skin', 'Breathing smoke from burning herbs', 'Looking at a picture of a herb'],
          correct: [0, 1, 2],
          points: 1,
          explanation:
            'Mugwort, rue, tansy, pennyroyal and wormwood are traditionally avoided in pregnancy, as are essential oils on the skin and herb smoke. Pictures, words and safe substitutes can carry any plant’s meaning.',
        },
        {
          id: 'q13',
          type: 'short',
          prompt:
            'Two books give different elements for the same herb. What do you do, and why is that all right?',
          points: 3,
          explanation:
            'Lists disagree because they come from different sources and times. Choose one meaning that makes sense to you, write it down, and be consistent; your own tested experience is a valid source too, as long as you say it is yours.',
          rubric:
            'Full marks (3): says that lists differ because they come from different traditions, periods or authors (1); says to choose one meaning (or the one that fits their experience or coven) and use it consistently, writing it down (1); recognises that correspondences are a language, not a law, so either can be used (1).',
        },
        {
          id: 'q14',
          type: 'long',
          prompt:
            'Plan a simple working for an intention of your own using correspondences. Name your intention, then choose a colour, one or two plants, a stone (or a substitute), and a day or hour, saying why you chose each. Include every safety point that applies to what you chose.',
          points: 5,
          explanation:
            'A good plan starts from one clear intention, uses a few well-chosen items that all point the same way, explains the choices, and builds safety in from the start rather than adding it at the end.',
          rubric:
            'Full marks (5): one clear intention in a sentence (1); a colour, at least one plant and a stone or reasonable substitute, each matching the intention, with a reason (1); a day or planetary hour with a fitting planet (1); correct safety points for every item chosen, such as candle safety, not ingesting herbs, smoke ventilation, pets, stone water or sun cautions (1); keeps it simple and affordable, or explains substitutions (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Correspondences',
      intro:
        'In this stage you learn the language of correspondences: colours, plants, stones, days and hours, and how to use them safely. You will study a few materials closely, start your own list, and plan a working.',
      min_days: 21,
      passed_by: 'mentor',
      tasks: [
        {
          title: 'What correspondences are, and colours',
          kind: 'study',
          instructions:
            '1. Read “What correspondences are” and “Colours”.\n2. Do the colour exercise at the end of “Colours”: five coloured things, one minute each.\n3. In the answer box, write the five colours and your three words for each, and note where you agreed or disagreed with the list.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 45,
          docs: ['core-correspondences-what-they-are', 'core-correspondences-colours'],
        },
        {
          title: 'Herb, oil and incense safety audit',
          kind: 'practice',
          instructions:
            '1. Read “Herb, oil and incense safety” in full.\n2. Gather every herb, oil, resin and incense you own.\n3. For each, look up its cautions in the Living Library or on its label and write one line in your Grimoire: what it is, what it is safe for, what to avoid.\n4. Throw away anything unlabelled you can’t identify, and move anything dangerous out of reach of children and pets.\n5. In the answer box, list what you found and anything you moved or got rid of.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['core-correspondences-safety'],
        },
        {
          title: 'Study a plant',
          kind: 'practice',
          instructions:
            '1. Read “Twelve common plants”.\n2. Choose one of the twelve that you have or can easily get. Check its cautions first.\n3. Do the ten-minute correspondence study from “Building your own correspondences”, writing your notes before you look anything up.\n4. Do this three times, with a different plant each time, or the same plant on three different days.\n5. Log each session. In the answer box, write your notes for each session.',
          times: 3,
          response: 'text',
          checked_by: 'mentor',
          minutes: 15,
          docs: ['core-correspondences-plants', 'core-correspondences-your-own'],
        },
        {
          title: 'Meet a stone',
          kind: 'practice',
          instructions:
            '1. Read “Seven common stones”.\n2. Take one stone you own, or a pebble you have found. Check whether it can go in water or sun.\n3. Cleanse it by a method safe for that stone, then sit with it for five minutes as the lesson describes.\n4. Dedicate it to one purpose in a sentence.\n5. In the answer box, write what stone it is, how you cleansed it, what you noticed and what you dedicated it to. If you would like your mentor to see it, add a photo description.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 20,
          docs: ['core-correspondences-stones'],
        },
        {
          title: 'A week of days and hours',
          kind: 'practice',
          instructions:
            '1. Read “Days of the week and planetary hours”.\n2. Each day for seven days, open the app’s planetary hours and note the planet of the day and of the hour you looked.\n3. Write one line in your journal on how the day felt.\n4. Log each day. On the last day, write in the answer box whether you noticed any pattern (it is fine if you didn’t).',
          times: 7,
          response: 'text',
          checked_by: 'self',
          minutes: 5,
          docs: ['core-correspondences-days-hours'],
        },
        {
          title: 'Start your own correspondence list',
          kind: 'reflection',
          instructions:
            '1. Re-read “Building your own correspondences”.\n2. Choose one intention that matters to you now.\n3. Gather from your home one colour, one plant or food, one stone or natural object, and one sound or song that feel like it.\n4. Write them as the first page of your personal list in your Grimoire, marking each as traditional, coven or mine.\n5. In the answer box, copy the page and add a line on why you chose each.\n6. Send your mentor a message on this step if you would like to talk through your choices.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['core-correspondences-your-own'],
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions:
            '1. Re-read any lesson you are unsure of.\n2. Take the Correspondences test. Choice questions are scored at once; your mentor scores the written answers.\n3. You need 80 per cent to pass. If you don’t pass, look at the questions you missed, revisit the lessons and take it again.',
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          quiz: 'quiz-core-correspondences',
        },
      ],
    },
  ],
} satisfies CourseModule;

export default correspondences;
