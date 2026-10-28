// Core module: the Moon's phases and magical timing. The phases (named as in
// app/src/lib/moon.ts, with meanings in line with PHASE_GOOD_FOR in
// app/src/lib/astro/meanings.ts), working with them, the void-of-course Moon
// and eclipses briefly, the seasons, and when timing matters and when it
// doesn't. Tradition-neutral and hemisphere-aware.

import type { CourseModule } from '../types.ts';

const moonTiming = {
  id: 'core-moon-timing',
  title: 'The Moon and magical timing',
  docs: [
    {
      id: 'core-moon-timing-phases',
      title: 'The Moon’s phases',
      summary:
        'What the Moon is actually doing through its month, the eight phases and their names, and how to find and recognise each one in your own sky.',
      minutes: 20,
      body: `## Why the Moon?

Of all the things in the sky, the Moon is the one people have watched most closely. It changes shape night by night, it is easy to see without any equipment, and its rhythm is short enough to live by: about a month from one full moon to the next. The word *month* itself comes from *moon*. Farmers, fishers, healers and priests in many cultures timed their work by it, and most modern witches do too.

Before we talk about magic, let’s be clear about what is happening in the sky. Knowing the real Moon will make your practice richer, not poorer.

## What the Moon is doing

The Moon gives off no light of its own. It is a ball of rock lit by the Sun, and half of it is always in sunlight, just as half the Earth is always in daytime. As the Moon travels around the Earth, we see different amounts of its sunlit half.

- When the Moon is roughly **between the Earth and the Sun**, its lit side faces away from us. We see little or nothing. This is the **new moon**.
- As it moves round, we see a growing sliver, then half, then most of the lit side. The Moon is **waxing** (growing).
- When the Moon is on the **far side of the Earth from the Sun**, we see the whole lit face. This is the **full moon**.
- Then the lit part shrinks again night by night. The Moon is **waning**.

One complete cycle, from new moon to new moon, takes about **29 and a half days**. This is called a *lunation* or *synodic month*.

The Earth’s shadow has nothing to do with the ordinary phases. (It only falls on the Moon during a lunar eclipse, which you will meet in a later lesson.)

## The eight phases

The cycle is continuous, but it is usually divided into eight phases. These are the names the app uses.

1. **New Moon.** The Moon is close to the Sun in the sky and invisible, or nearly so. Some people call the last day or two before it the **dark moon**, and keep “new moon” for the first thin crescent; others use the words the other way round, or as one. Ask your coven which it uses.
2. **Waxing Crescent.** A thin, growing curve of light appears in the west just after sunset, a day or two after the new moon.
3. **First Quarter.** About a week after the new moon, half the face is lit. It is called a “quarter” because the Moon is a quarter of the way through its cycle, not because a quarter is lit. It is high in the south (in the northern hemisphere) around sunset.
4. **Waxing Gibbous.** More than half lit and still growing. *Gibbous* means “humped”.
5. **Full Moon.** About two weeks after the new moon, the whole face is lit. The full moon rises in the east around sunset and sets around sunrise, so it is up all night.
6. **Waning Gibbous.** More than half lit, now shrinking. It rises later each evening.
7. **Last Quarter** (also called third quarter). Half lit again, the other half this time. It rises around midnight and is seen in the morning sky.
8. **Waning Crescent.** A thin, shrinking curve seen in the east before dawn, until it disappears into the new moon again.

The Moon rises on average about fifty minutes later each day, which is why the waning Moon is a creature of the small hours and the morning, while the waxing Moon belongs to the evening.

## Which way round? The hemisphere matters

Where you live changes how the Moon looks.

- In the **northern hemisphere**, a waxing Moon is lit on the **right**, and a waning Moon on the **left**. A memory aid: the lit shape spells **D-O-C** through the month: a D shape (waxing), O (full), C shape (waning).
- In the **southern hemisphere** it is the other way round: waxing is lit on the left, waning on the right. The lit shape goes C-O-D.
- Near the **equator**, the crescent lies on its back like a bowl or a smile.

The phases themselves happen at the same moment for everyone on Earth. A full moon is full in London, Sydney and Nairobi at once; only the time on the clock differs. So covens meeting online across the world can share a full moon.

## Finding the phase

The app shows the current phase and the coming new, quarter and full moons in the sky view on the Today tab. Use it, and also *look up*. Even in a city, the Moon is usually visible when it’s above the horizon and the sky is clear.

> **Try this:** For one whole lunation (about a month), look for the Moon every day or night you can. Each time, note the date, time, where it was in the sky, what shape it was, and one word for how it made you feel. If you can’t see it because of cloud or because it isn’t up, write that down too. By the end, you will know the Moon’s rhythm in your body, not just from a chart.

## A note on the Moon and our bodies

You will hear many claims that the full moon makes people wilder, that hospitals are busier, or that menstrual cycles follow the Moon. Large studies have mostly not found these effects. The Moon does move the tides of the ocean, and many animals and plants, especially in the sea, time their breeding by it. For people, its effect seems to be mostly cultural and psychological, which is real enough: when you pay attention to the Moon, it shapes your month.

> **Your coven:** Many covens meet at the full moon, at the new moon, or both. These meetings are often called **esbats** (a word for a witches’ gathering, popularised in the twentieth century), to tell them apart from the seasonal festivals. Ask your mentor when your coven meets and what it calls its lunar gatherings.`,
    },
    {
      id: 'core-moon-timing-working-with-phases',
      title: 'Working with the phases',
      summary:
        'What each phase is traditionally good for, how to shape any intention to fit the phase you’re in, and simple practices such as moon water and a moon journal.',
      minutes: 25,
      body: `## The basic idea

The principle behind lunar timing is simple: **as the Moon grows, work to grow things; as it shrinks, work to shrink things.** Bring in while it waxes; let go while it wanes. Use the full moon for things at their peak, and the new moon for rest and fresh starts.

## How old is this?

Folk practice in many parts of Europe timed planting, harvesting, cutting hair and wood, and even medical treatments by the Moon. Roman writers such as Pliny the Elder (first century) recorded advice about doing things at the waxing or waning Moon, and farmers’ almanacs still print it. So the idea of lunar timing is genuinely old.

The detailed system of eight phases, each with its own magical purpose, is much more recent. It developed in twentieth-century witchcraft and New Age writing. That doesn’t make it worse; it makes it a modern practice built on an old instinct. Use it as a helpful rhythm, not a rule.

## What each phase suits

These match the meanings the app gives for each phase.

- **New Moon:** rest, setting intentions, planting seeds in the dark. A time to decide what you want for the coming month.
- **Waxing Crescent:** beginnings, hope, first small steps. Start what you planned.
- **First Quarter:** action, courage, pushing through challenges. The first obstacles often appear; meet them.
- **Waxing Gibbous:** refining, building, nurturing. Adjust and tend what you have started.
- **Full Moon:** power, charging, celebration, divination, gratitude. Many people find this the strongest time for any working, and the best for thanks.
- **Waning Gibbous:** sharing, giving thanks, beginning to let go. Teach, give away, reflect.
- **Last Quarter:** release, breaking habits, clearing out. Cut ties, end things, clean.
- **Waning Crescent:** banishing, rest, reflection, preparing to begin again. Clear the decks before the new moon.

## Turning any intention to fit the phase

You don’t have to wait two weeks for the “right” Moon. Most intentions can be worded to fit whichever way the Moon is going.

1. **Write your intention plainly.** For example: “I want to stop feeling anxious about money.”
2. **Ask: what grows, and what shrinks?** Here, *security* should grow and *anxiety* and *debt* should shrink.
3. **If the Moon is waxing, word it as growth:** “My savings and my calm grow with the Moon.”
4. **If the Moon is waning, word it as release:** “My debt and my worry shrink with the Moon.”
5. **If it is full, word it as fulfilment or thanks:** “I give thanks for enough, and I welcome more security.”
6. **If it is new or dark, word it as a seed:** “I plant the seed of financial calm.”

This simple reframing is one of the most useful skills in lunar magic.

## A full-moon practice, step by step

This can be done alone, at home, in about twenty minutes.

1. **Prepare.** Choose a time when the full Moon is up (any time from sunset to sunrise on the night of the full moon, or the night before or after). Tidy a small space. If you can see the Moon from a window or outside, so much the better; if not, that is fine.
2. **Ground and centre,** as you learned in Grounding.
3. **Light a white or silver candle** in a safe holder, if you wish.
4. **Look at the Moon,** or close your eyes and picture it, for two minutes. Breathe slowly: in for four, out for six.
5. **Give thanks.** Say aloud three things that have gone well since the last full moon.
6. **Name what you want to bring to fullness.** One sentence.
7. **Sit in silence** for five minutes, open to whatever comes. Some people feel calm, some feel energised, some feel nothing in particular; all are fine.
8. **Close.** Thank the Moon, snuff the candle, eat or drink something, and write a few lines in your journal.

## Moon water

Moon water is water that has been left out under the Moon (usually the full Moon) to take on its qualities. It is a modern practice, very popular, and simple.

1. Fill a **clean glass jar with a lid** with tap or bottled water.
2. Hold it, and say what you would like it to carry (calm, clarity, blessing).
3. Put it on a windowsill or outside where the Moon will shine on it overnight, **with the lid on** to keep out dust and insects.
4. Bring it in before strong morning sun.
5. Use it to wipe the altar, anoint candles and stones, water plants, add to a cleansing bath, or sprinkle round a room.

> **Safety:** Don’t drink moon water unless it was clean drinking water in a clean, covered container and you use it within a day. Water left uncovered outdoors can carry bacteria, bird droppings and pollutants. If you want a drink of it, boil it first. Never put stones in water you will drink.

## Keeping a moon journal

A moon journal is the best way to learn how the Moon affects *you*.

1. Each day (or as often as you can), note the phase. The app shows it.
2. Write a line on your mood, energy, sleep and dreams.
3. Note any workings you did and their phase.
4. At the end of each lunation, read the month back.

After three or four months, many people notice patterns: perhaps your energy rises before the full moon, or you sleep badly at the dark of the Moon, or your divination seems clearer at a particular phase. These patterns are yours, and more useful than any book.

> **Your coven:** Your coven may hold particular rites at the full or new moon, call the Moon by names from its tradition, or honour a lunar god or goddess. Your tradition’s lessons will teach those. Ask your mentor whether you are expected to keep the full moon at home in the months you can’t gather together.

> **Try this:** At the next full moon, do the full-moon practice above and make a jar of moon water. Use the water over the following waning fortnight to cleanse your altar, and note how you feel each time.`,
    },
    {
      id: 'core-moon-timing-sky-beyond',
      title: 'Signs, void-of-course and eclipses',
      summary:
        'A brief, honest introduction to the Moon’s zodiac sign, the void-of-course Moon and eclipses: what they are and how much weight to give them.',
      minutes: 15,
      body: `## Going deeper, briefly

Phases are the heart of lunar timing. But you will hear people talk about the Moon being “in Scorpio”, “void of course”, or about an eclipse coming up. The app shows all of these, so here is what they mean. You don’t need to use them yet. Think of this lesson as a map of what is further along the road.

## The Moon’s sign

As seen from Earth, the Moon travels through the same band of constellations as the Sun and the planets: the **zodiac**. Astrologers divide that band into twelve equal **signs** (Aries, Taurus, Gemini and so on). The Moon moves quickly, spending about two and a half days in each sign and going through all twelve in about a month.

In astrological magic, the Moon’s sign colours the mood of those days and suits certain workings. For example, the app describes the Moon in Taurus as steady and grounded, good for money and home blessings; the Moon in Gemini as curious and talkative, good for study and communication; the Moon in Scorpio as deep and intense, good for protection and transformation.

This comes from Hellenistic and later Western astrology, which is a long and learned tradition. It is also a tradition with no scientific support for its predictions. Use it, if you choose, as one more layer of symbolism, like a correspondence. Many excellent practitioners never consider it at all.

## The void-of-course Moon

The **void-of-course Moon** (often written *VOC*) is the stretch of time after the Moon has made its last major angle, or *aspect*, to another planet in one sign, and before it enters the next sign. The app calculates it for you. It can last a few minutes or, occasionally, more than a day.

The traditional advice from astrologers is that things *begun* during a void-of-course Moon tend to come to nothing, go off course, or have unexpected results. So some practitioners avoid starting new workings, signing contracts or making big decisions then, and use the time instead for rest, reflection, cleaning, meditation and finishing things.

How much weight to give it is up to you and your coven. Some ignore it entirely; some check it before every important working. A balanced approach:

1. If you are planning a significant working ahead of time and it is easy to avoid a void-of-course period, avoid it.
2. If you need to act now, act. Don’t let a void-of-course Moon stop you doing something urgent or kind.
3. Notice, in your records, whether workings begun during void-of-course periods turn out differently for you.

## Eclipses

A **lunar eclipse** happens when the Earth passes directly between the Sun and the full Moon, so the Earth’s shadow falls on the Moon. It can only happen at a full moon. During a total lunar eclipse, the Moon often turns a coppery red. Lunar eclipses are completely safe to watch with the naked eye.

A **solar eclipse** happens when the new Moon passes directly between the Earth and the Sun and blocks some or all of the Sun’s light. It can only happen at a new moon.

> **Safety:** Never look directly at the Sun, during an eclipse or at any other time, without proper certified eclipse glasses or a safe projection method. Ordinary sunglasses, smoked glass and phone screens are not safe. Looking at the Sun can permanently damage your eyes in seconds.

Many cultures treated eclipses as omens, often frightening ones. In modern practice, people take different views: some find eclipses powerful times for deep change and release; others prefer not to work magic during them at all, treating them as unpredictable, and simply watch. Both are reasonable. If you work, keep it simple and ground well afterwards.

## Retrogrades, briefly

You will also hear people blame things on “Mercury retrograde”. A planet is **retrograde** when, seen from the moving Earth, it appears for a few weeks to drift backwards against the stars. Nothing actually reverses; it is an effect of our point of view, like a slower car seeming to slip backwards as you overtake it on a motorway. Mercury does this three or four times a year, for about three weeks each time.

Astrologers associate a planet’s retrograde with its affairs going awry or needing review: for Mercury, communication, travel, contracts and technology. Some practitioners use these weeks for revising, finishing and reflecting rather than starting. There is no evidence that emails go astray more often during Mercury retrograde, and it is not a reason to fear anything. The app notes retrogrades, and you can watch your own records to see whether they mean anything to you.

## A worked example

Alex wants to do a working to begin a new course of study. Opening the app, Alex sees that the Moon is waxing (good for beginnings), that it is in Gemini (curious, good for study), and that a void-of-course period begins at nine that evening and lasts until the next morning.

Alex decides to do the working at seven, during the waxing Moon in Gemini and before the void-of-course period starts, in an hour of Mercury found in the app. If none of this had lined up, Alex would simply have worked on the waxing Moon at a convenient time. The extra layers are a bonus, not a requirement.

## How these fit together

If you want a simple order of importance for a beginner:

1. **The phase** (waxing or waning, full or new). Use it often.
2. **The day and planetary hour,** which you met in Correspondences. Use it when you plan ahead.
3. **The Moon’s sign.** Optional, for extra colour.
4. **The void-of-course Moon.** Optional; avoid it for big new starts if it is easy to.
5. **Eclipses.** Rare; notice them, and decide with your coven how to treat them.

> **Your coven:** Some covens follow astrology closely and plan rituals around it; others don’t use it at all, and reconstructionist traditions may prefer their own historical calendars. Ask your mentor how your coven sees it.

> **Try this:** Open the app on three different days this week and note the Moon’s phase, sign, and whether a void-of-course period is coming. Write one line each time on how the day felt. Don’t try to prove anything; just get to know the sky.`,
    },
    {
      id: 'core-moon-timing-seasons',
      title: 'The Sun’s year and the seasons',
      summary:
        'The solstices, equinoxes and the days between, why seasons flip between the hemispheres, and how to tune your practice to the year where you actually live.',
      minutes: 20,
      body: `## The longer rhythm

If the Moon gives your practice a monthly rhythm, the Sun gives it a yearly one. Light lengthens and shortens; plants grow, flower, fruit and die back; animals breed and migrate; the weather turns. Almost every religious tradition on Earth marks the turning of the year with festivals, and your coven’s tradition will have its own calendar of holy days, taught in its own lessons. This lesson covers the astronomy and the general idea, so you can understand any calendar.

## Solstices and equinoxes

The Earth is tilted on its axis. As it travels round the Sun over a year, first one hemisphere and then the other leans towards the Sun. That tilt, not the Earth’s distance from the Sun, is what makes the seasons.

There are four turning points:

- **The summer solstice:** the longest day and shortest night. The Sun reaches its highest point at noon. In the northern hemisphere this falls around **21 June**; in the southern, around **21 December**.
- **The winter solstice:** the shortest day and longest night. The Sun is at its lowest. Around **21 December** in the north, **21 June** in the south.
- **The spring (vernal) equinox:** day and night are roughly equal, and days are lengthening. Around **20 March** in the north, **22 or 23 September** in the south.
- **The autumn equinox:** day and night roughly equal again, now with nights lengthening. Around **22 or 23 September** in the north, **20 March** in the south.

*Solstice* comes from Latin for “the Sun stands still”: for a few days around each solstice, the Sun’s rising point on the horizon seems to stop moving before turning back. *Equinox* means “equal night”.

The exact dates shift by a day or so from year to year, so check each year’s date in the app’s calendar or an almanac.

## The days between

Midway between each solstice and equinox lies a **cross-quarter day**, around the beginning of **February, May, August and November**. In the northern hemisphere these mark the first stirrings of spring, the start of summer, the first harvest, and the start of winter. Several old European festivals fall near them, and many modern calendars mark all eight points.

> **Note:** The “Wheel of the Year” that sets eight festivals at the solstices, equinoxes and cross-quarter days is a modern synthesis, put together by Wiccans and Druids in Britain in the 1950s to 1970s from older festivals of different peoples. It is a beautiful and widely used calendar, and it is honest to know it was assembled recently. Other traditions in this app keep their own historical calendars, some of which follow the Moon, the Sun, or a mixture.

## North and south

Because the seasons are opposite in the two hemispheres, a festival of the returning light belongs to December in Edinburgh and to June in Melbourne. Many practitioners in the southern hemisphere keep festivals by their own season rather than by the northern calendar date. Others keep the northern dates because of a tradition’s roots or a deity’s historical feast day. Both choices exist; your coven will have its own.

Near the equator, the seasons may be wet and dry rather than warm and cold, and practitioners there often build their year around rains, harvests and local festivals.

## Living by the seasons where you are

Books describe seasons in a particular place, usually Britain or North America. Your own place may be different. The best seasonal practice starts with paying attention to what is actually happening around you.

1. **Choose a spot outdoors** that you can visit often: a tree, a park bench, a stretch of river, a window box, the view from your window.
2. **Visit once a week.** Spend five minutes there. Notice the light, temperature, plants, birds, insects, smells and sounds.
3. **Write three lines** in your journal: what you saw, what changed since last week, and how you feel.
4. **Note the first and last of things:** the first frost, the first swallow, the first blossom, the last leaves.
5. **Over a year,** this becomes your own seasonal calendar. You will know when *your* spring really begins.

## Using the seasons in magic

Seasonal timing works much like lunar timing, on a larger scale:

- **Growing light (from the winter solstice to the summer one):** beginnings, growth, planting projects, building.
- **The peak of light (around the summer solstice):** strength, celebration, success, abundance.
- **Waning light (from the summer solstice to the winter one):** harvest, gratitude, letting go, rest, turning inward.
- **The depth of dark (around the winter solstice):** rest, endings, deep reflection, hope for the returning light.

Many practitioners combine the two: a working for a new project at a waxing Moon in spring, or a deep release at a waning Moon in late autumn.

## Marking a solstice or equinox at home

Before you learn your tradition’s own festivals, here is a simple way to mark one of the four turning points on your own. Allow about twenty minutes.

1. **Find the date and time** of the solstice or equinox for the year.
2. **Watch the Sun** if you can: its rising, its setting, or how high it stands at noon. Notice where on the horizon it rises or sets compared with a month ago.
3. **Gather something of the season** from where you live: a leaf, a flower, a seed head, a stone, snow in a bowl.
4. **Ground and centre,** then light a candle in a safe holder.
5. **Speak simply** of what the season means where you are: “Today is the longest night. From here the light returns.”
6. **Give thanks** for one thing the past season gave you, and name one thing you hope for in the next.
7. **Sit quietly** for a few minutes, then put out the candle, eat something, and write in your journal.

Your tradition will give you richer forms for its own holy days. This simple practice works for any of them and keeps you tied to the real sky.

> **Your coven:** Your coven’s holy days, and the customs of each, are taught in your tradition’s lessons on lore. Ask your mentor how your coven adjusts its calendar if members live in different hemispheres or climates.

> **Try this:** Choose your outdoor spot this week and make your first visit. Write down what you notice. Keep visiting once a week through this course.`,
    },
    {
      id: 'core-moon-timing-when-it-matters',
      title: 'When timing matters, and when it doesn’t',
      summary:
        'How to decide how much timing a working needs, why urgent needs should never wait for the Moon, and how to layer timing without becoming ruled by it.',
      minutes: 15,
      body: `## Timing is a tool, not a gate

Once people learn about phases, days, hours, signs and seasons, some begin to feel they can’t do anything without consulting a chart. That is a trap. Timing is one way to add meaning and focus to a working. It is never a reason to leave someone without help, to avoid acting in ordinary ways, or to feel your magic has “failed” because you got the date wrong.

## When timing matters more

Timing is worth thinking about when:

- **You are planning ahead.** A working for a new project next month can easily be set for a waxing Moon on the right day.
- **The working is large or important to you.** Extra layers of meaning help you focus and treat it seriously.
- **It is a coven rite.** Shared timing (full moons, festivals) brings a group together in a common rhythm, which has a strength of its own.
- **Your tradition asks for it.** Some traditions keep particular days for particular gods, or particular hours for particular rites.
- **You are learning.** Paying attention to timing trains you to notice the world.

## When timing matters less, or not at all

- **When something is urgent.** If you or someone you love needs protection, comfort or healing *now*, act now. Every phase can be worded to suit (as you learned in Working with the phases), and every day has an hour of every planet.
- **For daily devotion and simple practices.** Grounding, prayer, offerings, a daily card: do them every day, whatever the Moon is doing.
- **When the alternative is not doing it at all.** A working done at the “wrong” time with care is worth more than a perfect working that never happens.

> **Safety:** Magic never replaces ordinary action in a crisis. If someone is in danger, ill or in distress, contact emergency services, a doctor or a crisis line first. Do your magic as well, at any time, but never instead.

## Layering timing

When you do want to plan, here is a simple order that keeps it manageable:

1. **Start with the phase.** Waxing for growth, waning for release, full for power and thanks, new for seeds and rest.
2. **Add the day,** if it is easy: Friday for love, Thursday for luck, Saturday for boundaries.
3. **Add the planetary hour,** if you want to: the app finds the next one.
4. **Check the void-of-course Moon,** if you or your coven use it, for big new beginnings.
5. **Stop there.** If all the layers won’t line up for weeks, pick the most important one (usually the phase) and go ahead.

## A worked example

Sam wants to do a working to find a new job.

1. *Intention:* “I find a job that suits me and pays fairly.”
2. *Phase:* it is a waning Moon. Sam can wait about ten days for the waxing Moon, or reword the intention for the waning Moon: “All that keeps me from the right job falls away.” Sam decides to do both: a release working now, and a drawing-in working when the Moon is waxing.
3. *Day and hour:* for the waxing working, Sam chooses a Sunday (success) in the hour of Mercury (applications and interviews), found in the app.
4. *Mundane action:* every week, whatever the Moon, Sam sends applications and updates their CV. The magic supports the action; it doesn’t replace it.
5. *Record:* Sam writes down both workings with their dates, phases, days and hours, and notes what happens over the following weeks.

## Common traps

- **Waiting for perfect timing.** All the layers rarely line up. If you find yourself putting a working off week after week, choose the phase alone and begin.
- **Anxiety about getting it wrong.** Timing is meant to add meaning and confidence, not fear. If checking the sky makes you anxious, step back to the phases only, or set timing aside for a while.
- **Blaming the timing.** When a working doesn’t go as hoped, it is tempting to blame the void-of-course Moon or a retrograde. Look first at the intention, the effort and the ordinary action you took, as you will learn in Spellcraft.
- **Letting timing replace care.** No phase or hour is ever a reason to delay helping someone, seeing a doctor, or keeping yourself safe.
- **Copying someone else’s calendar.** A book written for another hemisphere or tradition may not fit you. Use your own sky and your own coven’s calendar.

## Recording and learning

The only way to know how much timing matters *for you* is to keep records. For every working, note the date, time, phase, day, hour (and sign and void-of-course status if you use them). After six months, look back. Did workings at certain times feel stronger? Did they turn out differently? Your records, honestly kept, will teach you more than any book, including this one.

> **Your coven:** Covens often have to meet when people are free, not when the sky is perfect. Many covens hold their full-moon rite on the nearest convenient evening. Ask your mentor how strict your coven is about dates, and why.

> **Try this:** Think of something you would like to work for. Write the intention, then write it twice more: once worded for a waxing Moon and once for a waning Moon. Add the day and hour you would choose. Then write one ordinary, practical action you will take towards it this week, whatever the Moon.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-core-moon-timing',
      title: 'The Moon and magical timing: test',
      intro:
        'Thirteen questions on the phases, working with them, signs, void-of-course and eclipses, the seasons, and when timing matters. Choice questions are scored at once; your mentor scores the written answers. You need 80 per cent to pass, and you can retake it.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'Why does the Moon have phases?',
          options: [
            'The Earth’s shadow covers part of it each night',
            'We see different amounts of its sunlit half as it travels around the Earth',
            'The Moon’s own light grows and fades',
            'Clouds of dust pass in front of it',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Half the Moon is always lit by the Sun. As it orbits the Earth we see more or less of that lit half. The Earth’s shadow only falls on the Moon during a lunar eclipse.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'About how long is one full cycle of phases, from new moon to new moon?',
          options: ['7 days', '14 days', 'About 29 and a half days', '365 days'],
          correct: [2],
          points: 1,
          explanation: 'A lunation takes about 29 and a half days. The word month comes from moon.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'You live in the northern hemisphere and see a crescent Moon lit on the right, low in the west just after sunset. Which phase is it?',
          options: ['Waning Crescent', 'Waxing Crescent', 'Last Quarter', 'Full Moon'],
          correct: [1],
          points: 1,
          explanation:
            'In the northern hemisphere a waxing Moon is lit on the right (a D shape), and the young crescent is seen in the west after sunset. In the southern hemisphere it would be lit on the left.',
        },
        {
          id: 'q4',
          type: 'truefalse',
          prompt: 'A full moon happens at the same moment all over the world, even though local clock times differ.',
          options: ['True', 'False'],
          correct: [0],
          points: 1,
          explanation:
            'Phases are moments in the Moon’s orbit, so they happen at the same instant for everyone. Only the clock time differs, which is why a coven can share a full moon online across countries.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'Which phase is traditionally best for release, breaking habits and clearing out?',
          options: ['Waxing Crescent', 'First Quarter', 'Last Quarter', 'Waxing Gibbous'],
          correct: [2],
          points: 1,
          explanation:
            'The waning half of the cycle, and the Last Quarter especially, is for release, breaking habits and clearing out. The waxing phases are for beginnings, action and building.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'The Moon is waning, and you want more confidence. What is the best approach?',
          options: [
            'Give up until the Moon is waxing',
            'Word the working as release, for example “my self-doubt shrinks with the Moon”',
            'Do a working to shrink your confidence',
            'Only work at the full moon',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Most intentions can be turned to fit the phase: what should grow, and what should shrink? In a waning Moon, release what stands in the way of what you want.',
        },
        {
          id: 'q7',
          type: 'multi',
          prompt: 'Which are safe ways to make and use moon water? Choose all that apply.',
          options: [
            'Use a clean jar with a lid on it overnight',
            'Use it to wipe the altar or water plants',
            'Drink water left uncovered outside for several days',
            'Put stones in it and drink it',
          ],
          correct: [0, 1],
          points: 1,
          explanation:
            'Keep moon water in a clean, covered jar and use it for cleansing, anointing and watering plants. Uncovered water outdoors can carry bacteria and pollutants, and stones can contain toxic minerals, so never drink those.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'What is the traditional advice about the void-of-course Moon?',
          options: [
            'It is the best time to start anything new',
            'Things begun then tend to go off course, so some avoid starting important new workings then',
            'It is when the Moon is invisible',
            'It means the Moon has left the zodiac',
          ],
          correct: [1],
          points: 1,
          explanation:
            'The void-of-course Moon runs from the Moon’s last major aspect in one sign until it enters the next. Astrologers advise against starting important things then. How much weight to give it is up to you and your coven, and it should never stop you acting when something is urgent.',
        },
        {
          id: 'q9',
          type: 'truefalse',
          prompt: 'It is safe to look at a partial solar eclipse through ordinary sunglasses.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation:
            'Never look at the Sun without certified eclipse glasses or a safe projection method. Ordinary sunglasses and phone screens are not safe, and eye damage can happen in seconds. Lunar eclipses, by contrast, are safe to watch.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'Around 21 June, what is happening in the southern hemisphere?',
          options: ['The summer solstice', 'The winter solstice', 'The spring equinox', 'The autumn equinox'],
          correct: [1],
          points: 1,
          explanation:
            'The seasons are opposite in the two hemispheres. Around 21 June the north has its summer solstice and the south its winter solstice.',
        },
        {
          id: 'q11',
          type: 'single',
          prompt: 'A friend is frightened and needs protection tonight, but the Moon is in the “wrong” phase and void of course. What should you do?',
          options: [
            'Wait for a better time',
            'Help them in practical ways now (and get emergency help if they are in danger), and do a protection working now if you wish, worded to suit the phase',
            'Tell them magic can’t help until the new moon',
            'Do nothing, because the void-of-course Moon will spoil it',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Timing is a tool, not a gate. Urgent needs come first, and practical help and emergency services come before magic. Any working can be worded to suit any phase.',
        },
        {
          id: 'q12',
          type: 'short',
          prompt:
            'Choose an intention of your own. Write it once worded for a waxing Moon and once for a waning Moon.',
          points: 2,
          explanation:
            'For the waxing Moon, word the intention as something growing; for the waning Moon, as something shrinking or being released. The same goal can be reached from either side.',
          rubric:
            'Full marks (2): a waxing wording that clearly grows or draws in something (1); a waning wording of the same intention that clearly releases or shrinks what stands in the way (1).',
        },
        {
          id: 'q13',
          type: 'long',
          prompt:
            'Explain in your own words when timing matters in magic and when it doesn’t. Include what you have noticed in your own moon journal or seasonal observations so far.',
          points: 4,
          explanation:
            'Timing adds meaning and focus when you can plan ahead, for larger workings, for coven rites and when your tradition asks for it. It matters less for urgent needs, daily practice, and when waiting would mean not acting at all. Your own records are the best guide.',
          rubric:
            'Full marks (4): gives at least two situations where timing is worth considering (1); gives at least two situations where it matters less, including urgent needs (1); says that magic never replaces practical help or that timing is a tool, not a gate (1); refers to their own observations from their journal or seasonal spot with at least one specific detail (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'The Moon and the seasons',
      intro:
        'In this stage you get to know the real Moon and the turning year where you live, and learn how to time your magic by them without being ruled by them. It takes at least one full lunation, because you will watch the Moon through a whole month.',
      min_days: 30,
      passed_by: 'mentor',
      tasks: [
        {
          title: 'Read about the phases',
          kind: 'study',
          instructions:
            '1. Read “The Moon’s phases”.\n2. Check the app for today’s phase and the dates of the next new and full moons.\n3. In the answer box, write which phase it is today, how the lit side should look from where you live, and when your coven holds its lunar gatherings (ask your mentor if you don’t know).',
          times: 1,
          response: 'text',
          checked_by: 'self',
          minutes: 25,
          docs: ['core-moon-timing-phases'],
        },
        {
          title: 'Keep a moon journal for a lunation',
          kind: 'practice',
          instructions:
            '1. For about a month, look for the Moon as often as you can.\n2. Each time, write in your journal the date, time, where it was, its shape, and one word for how you felt. Note your mood, energy and sleep too.\n3. If you can’t see it, write that down.\n4. Log each entry here. Aim for at least twenty days in the month.\n5. On your last entry, write in the answer box any patterns you noticed.',
          times: 20,
          response: 'text',
          checked_by: 'self',
          minutes: 5,
          docs: ['core-moon-timing-phases', 'core-moon-timing-working-with-phases'],
        },
        {
          title: 'Keep the full moon',
          kind: 'ritual',
          instructions:
            '1. Read “Working with the phases”.\n2. On or near the next full moon, do the full-moon practice from the lesson (about 20 minutes), keeping your candle safe.\n3. Make a jar of moon water with the lid on, and use it over the next fortnight to cleanse your altar.\n4. In the answer box, write your three thanks, what you named, and what you noticed. Send your mentor a message on this step if anything came up you would like to talk about.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['core-moon-timing-working-with-phases'],
        },
        {
          title: 'Look further into the sky',
          kind: 'study',
          instructions:
            '1. Read “Signs, void-of-course and eclipses”.\n2. On three days this week, open the app and note the Moon’s phase, sign, and the next void-of-course period.\n3. Log each day, with one line on how the day felt.',
          times: 3,
          response: 'none',
          checked_by: 'self',
          minutes: 10,
          docs: ['core-moon-timing-sky-beyond'],
        },
        {
          title: 'Your seasonal spot',
          kind: 'practice',
          instructions:
            '1. Read “The Sun’s year and the seasons”.\n2. Choose an outdoor spot (or a window view) you can visit weekly.\n3. Visit four times, a week apart, for about five minutes each.\n4. Each time, write three lines: what you saw, what changed, how you feel. Log each visit.\n5. Keep visiting through the rest of the course if you can.',
          times: 4,
          response: 'text',
          checked_by: 'self',
          minutes: 10,
          docs: ['core-moon-timing-seasons'],
        },
        {
          title: 'Plan a timed working',
          kind: 'reflection',
          instructions:
            '1. Read “When timing matters, and when it doesn’t”.\n2. Choose something you would like to work for.\n3. In the answer box, write the intention three ways: plainly, for a waxing Moon, and for a waning Moon. Add the day and planetary hour you would choose, and one practical action you will take this week whatever the Moon.\n4. Your mentor will read it and may reply on this step.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 20,
          docs: ['core-moon-timing-when-it-matters'],
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions:
            '1. Re-read any lesson you are unsure of.\n2. Take the Moon and magical timing test. Choice questions are scored at once; your mentor scores the written answers.\n3. You need 80 per cent to pass. If you don’t pass, read the explanations, revisit the lessons and take it again.',
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 25,
          quiz: 'quiz-core-moon-timing',
        },
      ],
    },
  ],
} satisfies CourseModule;

export default moonTiming;
