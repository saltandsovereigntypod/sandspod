// Chapters 10–12: progressions and returns, the Moon and eclipses, and astrology in magic.

import { astro, holyLink, libLink, pageLink, ritualLink, type AstroChapter } from './types.ts';

export const PROGRESSIONS: AstroChapter = {
  id: 'progressions',
  title: 'Progressions and returns',
  summary: 'Two more ways of timing: the slow unfolding of the chart itself, and the yearly and monthly return charts.',
  lessons: [
    {
      id: 'astro-progressions-secondary',
      title: 'Secondary progressions',
      summary: 'A day for a year: how the chart unfolds as you grow.',
      minutes: 6,
      terms: ['progressions'],
      links: [astro('chart:progressions', 'Your progressions')],
      yourChart: 'progressions',
      body: `## A day for a year

**Secondary progressions** use a symbolic key: each day after your birth stands for a year of your life. To see age 30, astrologers look at the sky 30 days after you were born. The method goes back to Persian and medieval astrologers and was popularised in modern times by Alan Leo.

Because a day is a short time, most planets barely move: the progressed Sun moves about a degree a year, so it changes sign roughly once every thirty years. Those changes feel like shifts in identity and style. Mercury, Venus and Mars move more, and may change sign or turn retrograde by progression, which often marks a change in how you think, love or act.

## The progressed angles

With an exact birth time, the Ascendant and Midheaven progress too. This app moves them by **solar arc** (the same distance the progressed Sun has moved), a common method. When a progressed angle reaches a natal planet, that planet comes to the fore.

## How to read them

Progressions describe inner development: the slow ripening of the person. Transits describe outer weather. Read them together: a transit hits harder when it echoes a progression.`,
    },
    {
      id: 'astro-progressions-moon',
      title: 'The progressed Moon',
      summary: 'A twenty-seven-year cycle of emotional chapters, and the progressed lunar phases.',
      minutes: 6,
      terms: ['progressions', 'moon', 'moon-phases'],
      links: [astro('chart:progressions', 'Your progressed Moon')],
      yourChart: 'progressions',
      body: `## The fastest progression

The progressed Moon moves about a degree a month, so it spends around two and a half years in each sign and goes all the way round the zodiac in about 27 years. It is the clearest clock in progressed astrology.

- Its **sign** colours an emotional chapter: in Taurus you want to settle, in Gemini to learn and talk, in Scorpio to go deep.
- Its **house** in your natal chart shows where your feelings gather: the fourth house brings home and family, the tenth brings career to the fore.
- When it changes sign or crosses an angle, people often describe a new chapter starting.

At about 27 and 54 it returns to its natal place: the **progressed lunar return**, often a time of emotional renewal.

## The progressed phases

The progressed Sun and Moon also make a cycle of phases, like the Moon's monthly one but about thirty years long. Dane Rudhyar described each phase (new, crescent, first quarter, gibbous, full, disseminating, last quarter, balsamic) as a season of a life: beginning, struggling, building, refining, fulfilling, sharing, letting go and resting.

> **Try this:** Look up when your progressed Moon last changed sign. What changed in your emotional life around then?`,
    },
    {
      id: 'astro-progressions-returns',
      title: 'Solar and lunar returns',
      summary: 'A chart for each birthday, and one for each month.',
      minutes: 7,
      terms: ['returns', 'solar-return', 'lunar-return'],
      links: [astro('chart:returns', 'Your returns'), ritualLink('cosmic-solar-return-reading')],
      yourChart: 'progressions',
      body: `## The solar return

Once a year, around your birthday, the Sun comes back to the exact degree and minute it held at your birth. A chart for that moment is your **solar return**, read for the year ahead. It is an old technique: Persian astrologers called it the revolution of the years of the nativity.

How to read it:

1. The **house the Sun falls in**: the year's main stage.
2. The **rising sign** and its ruler: the year's tone.
3. **Planets on the angles**: the loudest themes.
4. The **Moon**: where feelings gather.
5. How the return chart lies on your birth chart.

Astrologers disagree about where to cast it: for your birthplace, or for wherever you are on your birthday. Try both.

## The lunar return

Every 27 days or so the Moon returns to its natal place. The **lunar return** is read the same way for the month ahead, and works best as a habit: a few lines in a journal each month show your rhythms over a year.

> **Try this:** Keep your next solar return chart in your Grimoire, with three intentions for the year. On your next birthday, read them again.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-progressions',
    title: 'Progressions and returns',
    intro: 'Six questions on progressions and returns.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'In secondary progressions, one day after birth stands for…', options: ['One hour', 'One month', 'One year', 'Seven years'], correct: [2], points: 1, explanation: 'A day for a year is the key of secondary progressions.' },
      { id: 'q2', type: 'single', prompt: 'About how long does the progressed Moon stay in each sign?', options: ['A month', 'Two and a half years', 'Twelve years', 'Thirty years'], correct: [1], points: 1, explanation: 'Around two and a half years, going round in about 27.' },
      { id: 'q3', type: 'single', prompt: 'A solar return is cast for…', options: ['New Year\'s Day', 'The moment the Sun returns to its exact natal degree', 'The next eclipse', 'Midnight on your birthday'], correct: [1], points: 1, explanation: 'It is the exact moment of the Sun\'s return, near your birthday.' },
      { id: 'q4', type: 'single', prompt: 'In a solar return, the house the Sun falls in shows…', options: ['Your rising sign', 'The year\'s main stage', 'Your career forever', 'Nothing'], correct: [1], points: 1, explanation: 'The return Sun\'s house is the focus of the year.' },
      { id: 'q5', type: 'truefalse', prompt: 'Progressions describe inner development; transits describe outer weather.', options: ['True', 'False'], correct: [0], points: 1, explanation: 'A useful rule of thumb: read them together.' },
      { id: 'q6', type: 'single', prompt: 'How often does a lunar return come?', options: ['About every 27 days', 'Every year', 'Every 18.6 years', 'Every full moon'], correct: [0], points: 1, explanation: 'The Moon returns to its natal place about every 27 days.' },
    ],
  },
};

export const MOON_CHAPTER: AstroChapter = {
  id: 'moon',
  title: 'The Moon, eclipses and void of course',
  summary: 'The witch\'s clock: the lunar phases and signs, eclipses and the nodes, and the void-of-course Moon.',
  lessons: [
    {
      id: 'astro-moon-phases-signs',
      title: 'Phases and signs',
      summary: 'The lunation cycle, the Moon through the signs, and the phase you were born under.',
      minutes: 7,
      terms: ['lunation', 'moon-phases', 'new-moon', 'full-moon', 'quarter-moons'],
      links: [astro('sky', 'The moon tonight'), holyLink('moon-new'), holyLink('moon-full'), ritualLink('cosmic-new-moon-intentions'), ritualLink('cosmic-full-moon-charging-moon-water')],
      yourChart: 'moon',
      body: `## The lunation

The Moon's phases come from its angle to the Sun. At the **new moon** they are conjunct: the Moon is dark, between us and the Sun. As it pulls away it waxes through the crescent and **first quarter** (a square), to the **full moon** (opposite the Sun, fully lit), then wanes through the **last quarter** back to dark. The whole cycle, a **lunation**, takes about 29½ days.

In the craft, the waxing Moon is for drawing in and growing, the full for power and charging, the waning for releasing and banishing, and the dark for rest.

## The Moon through the signs

The Moon changes sign every two to two and a half days, and its sign colours the mood of those days: practical in Taurus, chatty in Gemini, tender in Cancer. Witches choose both: a waxing Moon in Taurus for money, a waning Moon in Scorpio for banishing.

## Your birth phase

The phase you were born under says something too. New-moon people tend to begin things on instinct; full-moon people are aware of others and of themselves; balsamic (just before the new moon) people often feel like the end of an old cycle and the seed of a new one.

> **Try this:** Note the Moon's sign and phase each day for a month, with a word about your mood. You will find your own rhythm.`,
    },
    {
      id: 'astro-moon-eclipses',
      title: 'Eclipses and the nodes',
      summary: 'What eclipses are, why they come in seasons, and how witches work with them.',
      minutes: 6,
      terms: ['eclipse', 'solar-eclipse', 'lunar-eclipse', 'saros', 'north-node', 'south-node'],
      links: [astro('sky', 'Eclipses this year'), ritualLink('cosmic-solar-eclipse-threshold'), ritualLink('cosmic-lunar-eclipse-vigil')],
      body: `## Why eclipses happen

The Moon's orbit is tilted about 5° to the ecliptic, crossing it at two points, the **nodes**. An eclipse happens only when a new or full moon falls close to a node.

- A **solar eclipse** is a new moon near a node: the Moon passes in front of the Sun.
- A **lunar eclipse** is a full moon near a node: the Moon passes through the Earth's shadow and often turns red.

Because the Sun reaches each node about every six months, eclipses come in **seasons**, usually two or three within a few weeks, twice a year. Similar eclipses repeat every 18 years 11 days: the **saros** cycle known to Babylonian astronomers.

## Reading them

Eclipses have always been read as turning points, once for kings and now for individuals. An eclipse that falls on a planet or angle in your chart (within a few degrees) is taken to mark a chapter opening (solar) or closing (lunar) in that area of life, often unfolding over the following months.

## Working with them

Many witches rest and observe during the eclipse itself, rather than casting, and work with the new direction afterwards: intentions after a solar eclipse, release after a lunar one. Others treat eclipses as doorways for powerful threshold rites. Both are traditional; choose what feels right, and never look at a solar eclipse without proper eye protection.

> **Safety:** Never look directly at the Sun during a solar eclipse without certified eclipse glasses.`,
    },
    {
      id: 'astro-moon-void',
      title: 'The void-of-course Moon',
      summary: 'The quiet hours between the Moon\'s last aspect in a sign and its move to the next.',
      minutes: 5,
      terms: ['void-of-course', 'ingress'],
      links: [astro('sky', 'Is the Moon void now?'), pageLink('planner')],
      body: `## What it is

After the Moon makes its last major aspect to a planet in a sign, and before it moves into the next sign, it is **void of course**. This can last minutes or more than a day.

The idea is medieval, from horary astrology (answering questions by the chart of the moment). Then, and for many astrologers now, a void Moon means "nothing will come of it": plans made now tend to fizzle or change.

## Using it

- **Avoid** starting new workings, signing contracts or launching things while the Moon is void, if you can.
- **Do** rest, meditate, clean, tidy the altar, finish what is already in motion, and do divination about the past.

Some modern astrologers find void Moons excellent for spiritual practice and inner work, precisely because nothing outer is "caught".

## How long, and how often

The Moon goes void every two to two and a half days, each time it nears the end of a sign. Most void periods last a few hours; some last a day or more, when the Moon makes no aspects for a long stretch of a sign. The sky page shows the next void period and when it ends.

## Which aspects count

Astrologers differ here. Most count only the five major aspects to the seven traditional planets; some add the outer planets, which makes void periods shorter. This app follows the common modern practice of counting the major aspects to the Sun through Pluto. Older texts also note exceptions: William Lilly said the Moon works even when void in Taurus, Cancer, Sagittarius and Pisces.

> **Note:** The void Moon is a gentle guide, not a rule to be anxious about. If a working has to happen now, it can.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-moon',
    title: 'The Moon, eclipses and void of course',
    intro: 'Six questions on the Moon\'s phases, eclipses and void Moons.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'At the full moon, the Moon is…', options: ['Conjunct the Sun', 'Square the Sun', 'Opposite the Sun', 'Trine the Sun'], correct: [2], points: 1, explanation: 'Full moons are oppositions of the Moon and Sun.' },
      { id: 'q2', type: 'single', prompt: 'The waning Moon traditionally suits…', options: ['Drawing in and growing', 'Releasing and banishing', 'Charging', 'Nothing'], correct: [1], points: 1, explanation: 'Waning is for letting go, clearing and banishing.' },
      { id: 'q3', type: 'single', prompt: 'A solar eclipse is…', options: ['A full moon near a node', 'A new moon near a node', 'Any new moon', 'A planet passing the Sun'], correct: [1], points: 1, explanation: 'Solar eclipses are new moons close to the lunar nodes.' },
      { id: 'q4', type: 'single', prompt: 'Why do eclipses come in seasons about six months apart?', options: ['The Moon speeds up', 'The Sun reaches each lunar node about every six months', 'The calendar says so', 'Random chance'], correct: [1], points: 1, explanation: 'Eclipses need the Sun near a node, which happens twice a year.' },
      { id: 'q5', type: 'single', prompt: 'When is the Moon void of course?', options: ['During an eclipse', 'Between its last major aspect in a sign and entering the next sign', 'At every new moon', 'When retrograde'], correct: [1], points: 1, explanation: 'That gap is the void-of-course period.' },
      { id: 'q6', type: 'multi', prompt: 'Which suit a void-of-course Moon? Choose all.', options: ['Rest and meditation', 'Tidying the altar', 'Launching a new venture', 'Finishing what is already in motion'], correct: [0, 1, 3], points: 1, explanation: 'Void Moons suit rest and finishing, not new starts.' },
    ],
  },
};

export const MAGIC: AstroChapter = {
  id: 'magic',
  title: 'Astrology in magic',
  summary: 'Timing your craft by the sky, the planetary days and hours, planetary correspondences, and a working built from your own chart.',
  lessons: [
    {
      id: 'astro-magic-timing',
      title: 'Choosing a time',
      summary: 'Electional astrology made simple: the Moon, the day, the hour and the planet.',
      minutes: 7,
      terms: ['moon-phases', 'void-of-course', 'planetary-days', 'planetary-hours'],
      links: [astro('timing', 'Find a good time for a working'), astro('hours', 'Planetary days and hours'), pageLink('planner'), pageLink('moon')],
      body: `## Electional astrology

Choosing a good moment to begin something is called **electional astrology**: electing a time. It is how most witches use astrology day to day. A full election can be elaborate; a good one can be simple.

## A simple method

1. **The Moon's phase.** Waxing to draw in, full to charge, waning to release, dark to rest.
2. **The Moon's sign.** Matching the aim: Taurus for money and the body, Cancer for home, Libra for love and harmony, Scorpio for banishing and depth, Capricorn for career and binding.
3. **Not void of course**, if you can help it.
4. **The day** ruled by the planet of your aim.
5. **The hour** ruled by that planet too.

Add, if you like: the planet of your aim not retrograde, and not in a hard aspect to Saturn or Mars at that moment.

## Good enough

You will rarely find a perfect time. Traditional astrologers chose the best time available, not a flawless one. A working done with care at a decent time is better than one never done while waiting for perfection.

> **Try this:** Choose an aim. Open **Find a good time** (the spell timing advisor), which weighs all five of these for you and shows why, or use the planetary hours page and the moon page to find the next day and hour that fit yourself, and put it in the ritual planner.`,
    },
    {
      id: 'astro-magic-days-hours',
      title: 'Planetary days and hours',
      summary: 'The Chaldean order, the seven days of the week, and the hours of the day and night.',
      minutes: 7,
      terms: ['planetary-days', 'planetary-hours', 'chaldean-order'],
      links: [astro('hours', 'This hour, and the hours today'), ritualLink('cosmic-sunday-sun-success'), ritualLink('cosmic-monday-moon-intuition'), ritualLink('cosmic-tuesday-mars-courage'), ritualLink('cosmic-wednesday-mercury-study'), ritualLink('cosmic-thursday-jupiter-prosperity'), ritualLink('cosmic-friday-venus-love'), ritualLink('cosmic-saturday-saturn-boundaries')],
      body: `## The Chaldean order

Ancient astronomers ranked the seven visible planets by speed, slowest first: **Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon**. This is the Chaldean order, and it governs the hours.

## The hours

The day from sunrise to sunset is divided into twelve "hours", and the night from sunset to sunrise into twelve more. They are only sixty minutes long at the equinoxes; in summer the day hours are long and the night hours short. Each hour is ruled by a planet, in the Chaldean order, starting at sunrise with the ruler of the day.

## The days

Because twenty-four hours later the sequence has moved on three places, the first hour of each day falls to a different planet. That is where our weekdays come from:

- Sunday: the Sun. Success, health, vitality.
- Monday: the Moon. Intuition, home, dreams.
- Tuesday (Tiw, the Norse Mars): Mars. Courage, protection.
- Wednesday (Woden, matched with Mercury): Mercury. Study, travel, words.
- Thursday (Thor, matched with Jupiter): Jupiter. Prosperity, growth.
- Friday (Frigg, matched with Venus): Venus. Love, beauty, friendship.
- Saturday: Saturn. Boundaries, binding, endings.

## Using them

For a working, pick the day of the planet that rules your aim, and within it an hour of the same planet. When you can't choose the day, the hour alone still helps: there is a Venus hour every day.`,
    },
    {
      id: 'astro-magic-correspondences',
      title: 'Planetary correspondences',
      summary: 'Herbs, stones, metals, colours and deities for each of the seven planets.',
      minutes: 8,
      terms: ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'],
      links: [
        astro('planet:Sun'),
        libLink('herb', 'calendula'),
        libLink('crystal', 'citrine'),
        libLink('crystal', 'moonstone'),
        libLink('herb', 'mugwort'),
        libLink('herb', 'lavender'),
        libLink('herb', 'rose'),
        libLink('crystal', 'rose_quartz'),
        libLink('herb', 'nettle'),
        libLink('crystal', 'carnelian'),
        libLink('herb', 'sage'),
        libLink('crystal', 'lapis_lazuli'),
        libLink('herb', 'cypress'),
        libLink('crystal', 'onyx'),
      ],
      body: `## The seven

Correspondences are the web of likeness that magic works through: things that share a planet's nature can call on it. These are common ones in modern Western practice, drawn from Agrippa, the herbals and living tradition:

- **Sun**: gold; yellow and gold; calendula, sunflower, bay, frankincense; citrine, sunstone. Success, health, confidence.
- **Moon**: silver; white and silver; mugwort, jasmine, willow; moonstone, pearl, selenite. Intuition, dreams, home, cycles.
- **Mercury**: quicksilver (use the symbol, never the metal); orange and yellow; lavender, dill, mint; agate, citrine. Study, speech, travel, trade.
- **Venus**: copper; green and pink; rose, myrtle, apple; rose quartz, emerald. Love, beauty, friendship, pleasure.
- **Mars**: iron; red; nettle, basil, pepper, dragon's blood; carnelian, bloodstone, garnet. Courage, protection, strength.
- **Jupiter**: tin; blue and purple; sage, oak, cinnamon; lapis lazuli, sapphire. Growth, prosperity, wisdom, justice.
- **Saturn**: lead (use the symbol, never the metal); black and indigo; cypress, comfrey, myrrh; onyx, jet, obsidian. Boundaries, binding, endings, the ancestors.

## Planets and deities

Many deities have been linked with planets, mostly through the Roman names: Sol and Helios, Selene and Diana, Hermes and Thoth, Aphrodite and Freyja, Ares, Zeus and Thor, Kronos. Work with these links as bridges, not equations, and respect the traditions they come from.

> **Safety:** Some traditional planetary plants (belladonna, henbane, hemlock for Saturn) are deadly. Use them as symbols or not at all. Mercury and lead are poisons; never handle them.`,
    },
    {
      id: 'astro-magic-your-chart',
      title: 'A working from your own chart',
      summary: 'Using your chart\'s strong planets, your chart ruler and current transits to shape your practice.',
      minutes: 7,
      terms: ['chart-ruler', 'transit', 'natal-chart'],
      links: [astro('chart:craft', 'Your chart and the craft'), astro('chart:transits'), pageLink('spell'), pageLink('grimoire')],
      yourChart: 'magic',
      body: `## Your personal planets

Your chart suggests where your magic comes most naturally:

- Your **chart ruler** is your personal planet: its day, hour, colours and stones are always yours to call on.
- Your **Sun and Moon signs**' elements suggest your home element.
- A planet on an angle or in a stellium is a power you can lean on.
- A weak or missing element is one to build deliberately, with its correspondences.

## A natal talisman

A classic working: make a charm for your chart ruler. On its day and in its hour, with the Moon waxing and not void, gather a stone, a herb and a colour of the planet, and charge them together with words of your own about what that planet means in your chart. Carry it, or keep it on your altar.

## Working with transits

When a slow planet is crossing an important point in your chart, work *with* it: blessing under Jupiter, commitment under Saturn, release under Pluto. The Craft tab of your chart suggests correspondences for what is happening now.

## Keep a record

Write each astrological working in your Grimoire with the sky at the time: the Moon's phase and sign, the day and hour, any transits. Over time you will learn which times work best for you, which is the real knowledge astrology offers a witch.

> **Try this:** Plan a natal talisman for your chart ruler, using the Craft tab and the planetary hours.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-magic',
    title: 'Astrology in magic',
    intro: 'Seven questions on timing and planetary correspondences.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'What is the Chaldean order, slowest first?', options: ['Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn', 'Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon', 'Moon, Mercury, Venus, Sun, Mars, Jupiter, Saturn', 'Mars, Sun, Venus, Moon, Saturn, Jupiter, Mercury'], correct: [1], points: 1, explanation: 'Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon.' },
      { id: 'q2', type: 'single', prompt: 'Which planet rules Friday?', options: ['Mars', 'Jupiter', 'Venus', 'Saturn'], correct: [2], points: 1, explanation: 'Friday is Venus\'s day (Frigg\'s day in English).' },
      { id: 'q3', type: 'single', prompt: 'When does the first planetary hour of the day begin?', options: ['At midnight', 'At sunrise', 'At noon', 'At 6 a.m.'], correct: [1], points: 1, explanation: 'Planetary hours count from sunrise and sunset.' },
      { id: 'q4', type: 'truefalse', prompt: 'Planetary hours are always exactly sixty minutes long.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'They divide daylight and darkness into twelve each, so they change through the year.' },
      { id: 'q5', type: 'single', prompt: 'For a prosperity working, which day and hour fit best?', options: ['Saturday, Saturn hour', 'Thursday, Jupiter hour', 'Tuesday, Mars hour', 'Monday, Moon hour'], correct: [1], points: 1, explanation: 'Jupiter rules growth and prosperity.' },
      { id: 'q6', type: 'single', prompt: 'Which stone traditionally corresponds to Mars?', options: ['Moonstone', 'Carnelian', 'Rose quartz', 'Lapis lazuli'], correct: [1], points: 1, explanation: 'Carnelian, bloodstone and garnet are Mars stones.' },
      { id: 'q7', type: 'multi', prompt: 'A simple election for a working considers… Choose all.', options: ['The Moon\'s phase', 'The Moon\'s sign', 'The planetary day and hour', 'The weather forecast'], correct: [0, 1, 2], points: 1, explanation: 'Phase, sign, void of course, day and hour make a simple election.' },
    ],
  },
};
