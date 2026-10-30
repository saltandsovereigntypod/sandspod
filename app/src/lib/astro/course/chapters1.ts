// Chapters 1–3: what astrology is, the sky, and the planets.

import { astro, libLink, type AstroChapter } from './types.ts';

export const BASICS: AstroChapter = {
  id: 'basics',
  title: 'What astrology is',
  summary: 'What astrology is and is not, where it came from, and how to learn it with this course.',
  lessons: [
    {
      id: 'astro-basics-what-it-is',
      title: 'The sky as a language',
      summary: 'Astrology reads the positions of the Sun, Moon and planets as a symbolic language for life on earth.',
      minutes: 6,
      terms: ['natal-chart', 'zodiac', 'sun', 'moon'],
      links: [astro('learn'), astro('charts')],
      body: `## A language, not a sentence

Astrology is the practice of reading the sky as a set of symbols. The Sun, the Moon and the planets move through the same band of sky, and for thousands of years people have watched where they are and asked what they mean. "As above, so below" is the old phrase: the sky and life on earth are read as reflections of each other.

The most familiar tool is the **birth chart** (or natal chart): a map of the sky at the moment and place you were born. It shows where each planet was, against which sign of the zodiac, and in which part of the sky, the houses.

## What it does well

Used well, astrology is a language for reflection. It gives you words for parts of yourself (your drive, your need for comfort, how you love) and a sense of timing: seasons in a life, as there are in a year.

- It is a **mirror**: a way of noticing yourself.
- It is a **calendar**: a way of choosing good times, which is how witches have used it for centuries.
- It is a **story**: a shared vocabulary of myth that makes life feel meaningful.

## What it is not

It is not destiny. Nothing in a chart forces anything to happen, and no honest astrologer can tell you the day you will meet your partner. Throughout this course and the whole app, readings say "traditionally", "many astrologers read" and "tends to", because that is what they are: traditional meanings, offered for you to test against your life.

> **Note:** If a reading ever frightens you, set it down. Astrology is a tool for knowing yourself, never a reason to fear the future.

## How the course works

There are twelve chapters. Each has a few short lessons and a quiz at the end. Every underlined word in the app opens its glossary entry, and every reading has a Simple version (a sentence or two) and a Detailed one. If you have saved your own birth chart, many lessons will show you the lesson's subject in your chart.`,
    },
    {
      id: 'astro-basics-history',
      title: 'An honest history',
      summary: 'From Babylonian omens to Hellenistic horoscopes, medieval scholars, the scientific revolution and the modern revival.',
      minutes: 8,
      terms: ['tropical', 'precession', 'house-systems', 'lots'],
      links: [astro('learn')],
      body: `## Omens in Mesopotamia

The oldest astrology we know is Babylonian. From around 1800 BCE scribes recorded omens: if Venus appears in such a month, the harvest will be good. The tablets called *Enūma Anu Enlil* collect thousands of them. This was astrology for kings and kingdoms, not individuals. By the fifth century BCE Babylonian astronomers had divided the Sun's path into twelve equal signs, and the first birth charts for private people appear soon after.

## The Hellenistic horoscope

After Alexander's conquests, Babylonian astronomy met Greek philosophy and Egyptian temple lore, mostly in Alexandria. Between about the second century BCE and the second century CE, the system most astrology still uses took shape: the twelve signs, the seven planets as rulers, the houses counted from the rising sign (the *hōroskopos*, "hour-marker", which gives us the word horoscope), aspects, and lots such as the Part of Fortune. Writers such as Dorotheus, Ptolemy (*Tetrabiblos*) and Vettius Valens left manuals that are still read.

## Persia, the Islamic world and Europe

Astrology travelled east to India, where it grew into Jyotiṣa, and through Persian and Arabic scholars such as Māshā'allāh, Abū Ma'shar and al-Bīrūnī, who refined it alongside real astronomy. Their books reached medieval Europe in Latin translation. For centuries astrology was taught in universities beside medicine, and doctors timed treatments by the Moon.

## Decline and revival

After the seventeenth century, as Copernicus, Kepler and Newton changed astronomy, educated Europe dropped astrology. It survived in almanacs and folk practice, then revived in the late nineteenth century with Theosophy and writers such as Alan Leo, who made it about character. In the twentieth century, psychological astrology (Dane Rudhyar, Liz Greene) and Sun-sign columns made it popular again; from the 1990s, translators recovered the older Hellenistic and medieval methods.

## The honest question

Does it work? Controlled studies have not found that astrology predicts personality or events better than chance. Many astrologers today see it not as a physical influence of planets but as a symbolic system, a language of meaning, much as tarot is. You can practise it fully in that spirit. This course teaches the tradition as it is, says where schools differ, and leaves the belief to you.`,
    },
    {
      id: 'astro-basics-how-to-learn',
      title: 'How to learn it',
      summary: 'A simple path through the course, the glossary and your own chart, with a journal to keep as you go.',
      minutes: 5,
      terms: ['big-three', 'natal-chart'],
      links: [astro('charts', 'Add or open your birth chart'), astro('learn', 'The glossary'), { kind: 'page', id: 'grimoire' }],
      yourChart: 'big-three',
      body: `## The path

Astrology is a language, and languages are learned in layers. This course goes in the order most teachers use:

1. **The sky**: what is actually up there, and how the zodiac is measured.
2. **The planets**: the actors, what each one wants.
3. **The signs**: the costumes and moods they wear.
4. **The houses**: the stages, the areas of life.
5. **The aspects**: the conversations between planets.
6. **Reading a chart**: putting it together, step by step.
7. **Deeper tools**: dignities, transits, progressions and returns.
8. **The Moon and magic**: timing your craft by the sky.

## Your own chart

Nothing teaches astrology like your own chart. If you have your birth date, time and place, add your chart under Charts; the course will then show you, lesson by lesson, what the lesson means for you. Without a time, you can still learn the planets and signs; the houses and the rising sign need the time.

> **Try this:** Start an astrology section in your Grimoire or journal. After each lesson, write one sentence about how it shows in your life, or doesn't. Your own observations are the heart of learning astrology.

## A word on "Simple" and "Detailed"

Every reading in the app has two depths. Simple is for a glance. Detailed adds the history, the traditions and the craft. You can switch everywhere at once in the glossary, or flip any one card.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-basics',
    title: 'What astrology is',
    intro: 'Six questions on what astrology is, its history and how this course approaches it.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'What is a birth chart?', options: ['A forecast of your life', 'A map of the sky at the moment and place you were born', 'A list of your personality traits', 'A calendar of lucky days'], correct: [1], points: 1, explanation: 'A birth (natal) chart is a map of where the Sun, Moon and planets were, by sign and house, at your birth.' },
      { id: 'q2', type: 'single', prompt: 'Where does the word "horoscope" come from?', options: ['The Greek hōroskopos, "hour-marker", the rising sign', 'The Latin horror, "fear"', 'An Egyptian god', 'A medieval calendar'], correct: [0], points: 1, explanation: 'Hellenistic astrologers called the rising degree the hōroskopos, the marker of the hour.' },
      { id: 'q3', type: 'truefalse', prompt: 'In this course, a reading tells you what will definitely happen.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'Readings are traditional meanings for reflection, never destiny.' },
      { id: 'q4', type: 'single', prompt: 'Who first divided the Sun\'s path into twelve equal signs?', options: ['Medieval European monks', 'Babylonian astronomers', 'Victorian Theosophists', 'Isaac Newton'], correct: [1], points: 1, explanation: 'By around the fifth century BCE Babylonian astronomers used twelve equal signs of 30°.' },
      { id: 'q5', type: 'multi', prompt: 'Which are good uses of astrology as this course teaches it? Choose all that fit.', options: ['A mirror for self-reflection', 'Choosing times for magic', 'Deciding someone is a bad person because of their sign', 'A shared language of myth and meaning'], correct: [0, 1, 3], points: 1, explanation: 'Astrology works as a mirror, a calendar and a story. Judging people by their sign is not a use the tradition supports.' },
      { id: 'q6', type: 'single', prompt: 'What have controlled scientific studies generally found?', options: ['That planets physically shape personality', 'That astrology predicts events reliably', 'No evidence that astrology predicts better than chance', 'That only the Moon matters'], correct: [2], points: 1, explanation: 'Honestly said: studies have not found predictive power. Many astrologers practise it as a symbolic language instead.' },
    ],
  },
};

export const SKY: AstroChapter = {
  id: 'sky',
  title: 'The sky and the ecliptic',
  summary: 'What is really up there: the ecliptic, the zodiac, the two zodiacs, and how a chart maps the sky around you.',
  lessons: [
    {
      id: 'astro-sky-ecliptic',
      title: 'The ecliptic and the zodiac',
      summary: 'The Sun\'s yearly path, the band of sky the planets travel, and the twelve signs that measure it.',
      minutes: 6,
      terms: ['ecliptic', 'zodiac', 'degree', 'solstice-equinox'],
      links: [astro('sky', 'The sky today')],
      body: `## The Sun's road

As the Earth goes round the Sun, the Sun seems to move against the background stars, a little under a degree a day, all the way round in a year. Its path is called the **ecliptic** (because eclipses happen on it). The Moon and the planets all travel close to the same path, within a few degrees, because the solar system is roughly flat.

## Twelve signs

The band of sky either side of the ecliptic is the **zodiac**. Astrologers divide it into twelve equal parts of 30°, the signs, starting from the point where the Sun crosses the celestial equator in spring (the March equinox in the north): 0° Aries.

- Aries, Taurus, Gemini: spring (in the northern hemisphere)
- Cancer, Leo, Virgo: summer
- Libra, Scorpio, Sagittarius: autumn
- Capricorn, Aquarius, Pisces: winter

The solstices and equinoxes fall at 0° of Aries, Cancer, Libra and Capricorn, the four cardinal signs.

## Degrees

Each sign has 30 degrees (0° to 29°), each degree 60 minutes. "Venus at 14° Scorpio" means Venus is 14 degrees into the sign of Scorpio: 224° round from 0° Aries.

> **Try this:** Open The sky today and find which sign the Sun is in now. Then work out roughly when it will move into the next sign: a month for each sign.`,
    },
    {
      id: 'astro-sky-two-zodiacs',
      title: 'Two zodiacs: tropical and sidereal',
      summary: 'Why the signs no longer match the constellations, and what astrologers do about it.',
      minutes: 6,
      terms: ['tropical', 'sidereal', 'precession', 'ayanamsa', 'lahiri'],
      links: [astro('learn')],
      body: `## The wobble

The Earth's axis wobbles slowly, like a spinning top, once every 25,800 years or so. Because of this **precession**, the point of the spring equinox drifts backwards against the stars about one degree every 72 years.

When the Hellenistic astrologers fixed the zodiac, the signs and the constellations of the same names roughly lined up. Today they are about 24° apart: the Sun is "in Aries" by season while it stands in front of the stars of Pisces.

## Two answers

- The **tropical zodiac** ties the signs to the seasons: 0° Aries is always the spring equinox. Most Western astrology uses it, and so does this app by default. Its signs are about the year's light and season, not the stars behind.
- The **sidereal zodiac** ties the signs to the stars. Indian Jyotiṣa and some Western astrologers use it, subtracting the gap, the **ayanamsa**. The most common value is Lahiri's.

Neither is wrong; they measure different things. If your Sun is in the last few weeks of a sign, it may be in the sign before it sidereally.

> **Note:** The thirteenth constellation, Ophiuchus, sometimes makes the news. The signs are equal divisions of the ecliptic, not the constellations, so it is not part of either zodiac.

You can switch your charts to sidereal in their settings, if you want to compare.`,
    },
    {
      id: 'astro-sky-chart-map',
      title: 'The chart as a map of your sky',
      summary: 'The horizon and the meridian, the four angles, and how to read the wheel.',
      minutes: 7,
      terms: ['ascendant', 'descendant', 'midheaven', 'imum-coeli', 'houses'],
      links: [astro('chart', 'Open your chart wheel')],
      yourChart: 'big-three',
      body: `## Standing at your birthplace

Imagine standing where you were born, at the moment you were born. The sky turns around you once a day. A chart freezes that moment and draws it as a wheel.

- The **horizon** runs left to right across the middle. The left end is east: the degree of the zodiac rising there is the **Ascendant**. The right end is west: the **Descendant**, setting.
- The **meridian** runs up and down. The top is the **Midheaven** (MC, *medium coeli*), the point of the zodiac highest in the sky; the bottom is the **IC** (*imum coeli*), directly beneath you.

These four points are the **angles**. They move fast (the whole zodiac rises in a day, a new sign about every two hours), which is why the birth time matters.

## Reading the wheel

The wheel is drawn as if you were facing south (in the northern hemisphere): east on the left, the Sun rising there and climbing over the top to set on the right. So:

- A planet near the left edge was rising when you were born.
- A planet near the top was overhead.
- Planets in the lower half were below the horizon, out of sight.

The circle is cut into twelve **houses**, starting at the Ascendant and going anticlockwise beneath the horizon: houses 1 to 6 below, 7 to 12 above.

> **Try this:** Open your chart wheel and find your Ascendant on the left. Which planets were above the horizon when you were born?`,
    },
  ],
  quiz: {
    id: 'quiz-astro-sky',
    title: 'The sky and the ecliptic',
    intro: 'Six questions on the ecliptic, the zodiacs and the angles.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'What is the ecliptic?', options: ['The Moon\'s orbit', 'The Sun\'s apparent yearly path across the stars', 'The horizon', 'A kind of eclipse'], correct: [1], points: 1, explanation: 'The ecliptic is the Sun\'s path, and the planets move close to it.' },
      { id: 'q2', type: 'single', prompt: 'How many degrees does each sign contain?', options: ['12', '24', '30', '45'], correct: [2], points: 1, explanation: 'Twelve signs of 30° make the 360° circle.' },
      { id: 'q3', type: 'single', prompt: 'The tropical zodiac begins at…', options: ['The star Aldebaran', 'The March (spring) equinox', 'The winter solstice', 'Your birthday'], correct: [1], points: 1, explanation: 'Tropical 0° Aries is the Sun\'s position at the March equinox.' },
      { id: 'q4', type: 'truefalse', prompt: 'The tropical signs and the constellations of the same names line up today.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'Precession has moved them about 24° apart.' },
      { id: 'q5', type: 'single', prompt: 'Which point is rising on the eastern horizon at birth?', options: ['The Midheaven', 'The IC', 'The Ascendant', 'The Descendant'], correct: [2], points: 1, explanation: 'The Ascendant is the degree rising in the east; the Descendant sets in the west.' },
      { id: 'q6', type: 'single', prompt: 'Why does the birth time matter so much?', options: ['The planets move very fast', 'The angles and houses turn through the whole zodiac in a day', 'The Sun changes sign every hour', 'It doesn\'t matter'], correct: [1], points: 1, explanation: 'A new sign rises about every two hours, so the Ascendant and houses depend on the time.' },
    ],
  },
};

export const PLANETS: AstroChapter = {
  id: 'planets',
  title: 'The planets',
  summary: 'The ten planets and the main points: what each one wants, how fast it moves, and what retrograde means.',
  lessons: [
    {
      id: 'astro-planets-lights',
      title: 'The lights: Sun and Moon',
      summary: 'The two great lights of astrology: the self you are becoming, and the needs that keep you safe.',
      minutes: 6,
      terms: ['sun', 'moon', 'big-three', 'sect'],
      links: [astro('planet:Sun', 'The Sun\'s guide'), astro('planet:Moon', 'The Moon\'s guide'), libLink('crystal', 'citrine'), libLink('crystal', 'moonstone')],
      yourChart: 'big-three',
      body: `## The Sun

The Sun is the centre of the solar system and, in most modern astrology, of the chart. It stands for **vitality, will and purpose**: the self you are growing into, what makes you feel alive. Its sign is your "star sign". It moves about a degree a day and takes a year to go round the zodiac.

Traditionally it rules Leo, is exalted in Aries, and is the light of the day: in a chart born by day, it leads.

## The Moon

The Moon moves fastest, about 13° a day, through every sign in under a month. It stands for **feelings, needs, instinct, the body and home**: what you need to feel safe, how you react before you think, how you care and want to be cared for. Many people recognise themselves more in their Moon sign than their Sun sign, especially at home.

It rules Cancer, is exalted in Taurus, and is the light of the night.

## Together

Sun and Moon are a pair in nearly every tradition: day and night, gold and silver, will and need. The relationship between them (their signs, and the phase of the Moon you were born under) is one of the first things an astrologer looks at.

> **Try this:** Read your Sun and Moon signs in the reading. Which one feels more like you on an ordinary Tuesday evening? Which one when you are doing something you love?`,
    },
    {
      id: 'astro-planets-personal',
      title: 'Mercury, Venus and Mars',
      summary: 'The personal planets: how you think, what you love, and how you go after what you want.',
      minutes: 7,
      terms: ['mercury', 'venus', 'mars', 'retrograde'],
      links: [astro('planet:Mercury'), astro('planet:Venus'), astro('planet:Mars'), libLink('herb', 'lavender'), libLink('herb', 'rose'), libLink('herb', 'nettle')],
      yourChart: 'planets',
      body: `## Mercury: the mind

Mercury is the messenger: **thinking, speech, learning, trade, travel and the hands**. Its sign shows how your mind works (fast or slow, broad or precise) and its house where you most use it. It is never more than 28° from the Sun, so it is always in your Sun sign or a neighbouring one. It rules Gemini and Virgo.

## Venus: what you love

Venus is **love, beauty, pleasure, harmony and value**, including money. Its sign shows what you find beautiful, how you show affection and what makes you feel valued. It stays within 47° of the Sun. It rules Taurus and Libra, and is exalted in Pisces. Traditionally it is the "lesser benefic", a planet of good fortune.

## Mars: how you act

Mars is **drive, courage, desire, anger and the body's energy**: how you go after what you want and how you defend yourself. Its sign shows your style of action and conflict. It takes about two years to go round the zodiac. It rules Aries and (traditionally) Scorpio, is exalted in Capricorn, and is the "lesser malefic": not evil, but sharp.

## The personal planets

With the Sun and Moon these are the **personal planets**: they move fast enough that their signs differ between people born weeks apart, so they describe you rather than your generation.

> **Try this:** Find your Mercury, Venus and Mars signs. Write one sentence for each: "I think…", "I love…", "I fight…".`,
    },
    {
      id: 'astro-planets-social-outer',
      title: 'Jupiter, Saturn and the outer planets',
      summary: 'The social planets of growth and limit, and the three modern planets of change, dream and depth.',
      minutes: 8,
      terms: ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'],
      links: [astro('planet:Jupiter'), astro('planet:Saturn'), astro('chart:placements', 'Your placements')],
      yourChart: 'planets',
      body: `## Jupiter and Saturn: the social planets

**Jupiter** is growth, faith, generosity, wisdom and luck: the "greater benefic". It takes about twelve years to go round, a year in each sign, so its sign is shared with your school year. Its house shows where life tends to be generous to you. It rules Sagittarius and Pisces.

**Saturn** is structure, time, discipline, limits and maturity: the "greater malefic", though modern astrologers call it the teacher. It takes about 29 years to go round, two and a half years in each sign. Where Saturn is, you work hard, feel tested, and in the end become an authority. It rules Capricorn and Aquarius.

These two were the outermost planets the ancients could see, and between them they frame social life: expansion and contraction, hope and duty.

## The outer planets

Discovered with telescopes, the three outer planets move so slowly that whole generations share their signs. Their **house** and their **aspects** to your personal planets are what make them personal.

- **Uranus** (1781): change, freedom, invention and sudden awakenings. 84 years round. Modern ruler of Aquarius.
- **Neptune** (1846): dreams, spirit, compassion, art and illusion. About 165 years round. Modern ruler of Pisces.
- **Pluto** (1930): power, depth, death and rebirth. About 248 years round. Modern ruler of Scorpio. Astronomers reclassified it as a dwarf planet in 2006; astrologers still use it.

Traditional astrologers read only the seven visible planets; modern astrologers use all ten. This app shows both rulers wherever they differ.`,
    },
    {
      id: 'astro-planets-points-motion',
      title: 'The points, and how planets move',
      summary: 'The lunar nodes, Chiron, Lilith and the Part of Fortune; and retrograde motion, stations and shadows.',
      minutes: 8,
      terms: ['north-node', 'south-node', 'chiron', 'lilith', 'part-of-fortune', 'retrograde', 'station', 'shadow-period'],
      links: [astro('chart:placements', 'Your placements'), astro('sky', 'Retrogrades now'), { kind: 'premade', id: 'cosmic-mercury-retrograde-steadying' }],
      body: `## The points

Not everything in a chart is a planet.

- The **lunar nodes** are where the Moon's path crosses the ecliptic. Eclipses happen near them. The **North Node** is read as the direction of growth in this life; the **South Node**, always exactly opposite, as what comes easily and what to grow beyond. They move backwards through the zodiac in about 18.6 years.
- **Chiron** is a small body orbiting between Saturn and Uranus, discovered in 1977 and named for the wounded healer of Greek myth. It shows where you were hurt and how that becomes wisdom.
- **Lilith** (Black Moon Lilith) is the far point of the Moon's orbit: the wild, refused or exiled self.
- The **Part of Fortune** is the oldest of the Hellenistic lots, calculated from the Sun, Moon and Ascendant: the body, wellbeing and luck.

## Retrograde

Sometimes a planet seems to stop and move backwards against the stars for a few weeks or months. It isn't really reversing: the Earth is overtaking it (or it is overtaking us), as a car you pass on a motorway seems to drift backwards. This is **retrograde** motion.

- Before and after, the planet seems to stand still: a **station**.
- The stretch of zodiac it will retrace is the **shadow**: entered before the retrograde (pre-shadow) and left after (post-shadow).

Astrologers read a retrograde as a time to review, revisit and redo rather than begin. Mercury goes retrograde three or four times a year, which is why you hear about it most. A planet retrograde in a birth chart is often read as working inwardly, or in its own way.

> **Note:** A retrograde is not a curse. It is a season for the "re-" words: review, repair, return, rest.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-planets',
    title: 'The planets',
    intro: 'Seven questions on the planets, the points and retrograde motion.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'Which planet stands for feelings, needs and home?', options: ['The Sun', 'The Moon', 'Mars', 'Saturn'], correct: [1], points: 1, explanation: 'The Moon is the body, needs, instincts and home.' },
      { id: 'q2', type: 'single', prompt: 'Which planet is traditionally called the "greater benefic"?', options: ['Venus', 'Jupiter', 'Saturn', 'Mercury'], correct: [1], points: 1, explanation: 'Jupiter is the greater benefic; Venus the lesser.' },
      { id: 'q3', type: 'single', prompt: 'About how long does Saturn take to go round the zodiac?', options: ['One year', 'Twelve years', '29 years', '84 years'], correct: [2], points: 1, explanation: 'About 29½ years, which is why the Saturn return comes in the late twenties.' },
      { id: 'q4', type: 'multi', prompt: 'Which are personal planets? Choose all.', options: ['Mercury', 'Venus', 'Mars', 'Neptune'], correct: [0, 1, 2], points: 1, explanation: 'With the Sun and Moon, Mercury, Venus and Mars move fast enough to describe the individual. Neptune is generational.' },
      { id: 'q5', type: 'single', prompt: 'What causes retrograde motion?', options: ['The planet reverses its orbit', 'The Earth and the planet overtaking one another', 'An eclipse', 'The Moon\'s nodes'], correct: [1], points: 1, explanation: 'It is an effect of viewpoint: one planet passing another.' },
      { id: 'q6', type: 'single', prompt: 'The North Node is read as…', options: ['Your past', 'The direction of growth in this life', 'Your career', 'Your wounds'], correct: [1], points: 1, explanation: 'The North Node points to growth; the South Node to what comes easily.' },
      { id: 'q7', type: 'truefalse', prompt: 'Traditional astrology uses Uranus, Neptune and Pluto as sign rulers.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'Traditional astrology uses the seven visible planets; the outer planets are modern additions.' },
    ],
  },
};
