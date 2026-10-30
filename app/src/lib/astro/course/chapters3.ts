// Chapters 7–9: reading a chart step by step, dignities and rulerships, and transits.

import { astro, pageLink, ritualLink, type AstroChapter } from './types.ts';

export const READING: AstroChapter = {
  id: 'reading',
  title: 'Reading a chart, step by step',
  summary: 'A method for reading any chart, worked through on your own: the big three, the ruler, the planets, the aspects, and putting it together.',
  lessons: [
    {
      id: 'astro-reading-big-three',
      title: 'Step one: Sun, Moon and rising',
      summary: 'Start with the three most personal placements and how they fit together.',
      minutes: 7,
      terms: ['big-three', 'sun', 'moon', 'ascendant'],
      links: [astro('chart:reading', 'Your reading in full'), astro('chart', 'Your chart wheel')],
      yourChart: 'big-three',
      body: `## Why start here

The Sun, Moon and Ascendant are the "big three". Between them they describe the self you are becoming (Sun), the needs and instincts underneath (Moon), and the way you meet the world and begin things (Ascendant). Almost every astrologer starts here.

## How to read them together

1. **Name each one** in a few words. "Sun in Capricorn: ambitious, responsible. Moon in Leo: needs warmth and to be seen. Libra rising: gracious, diplomatic."
2. **Look at their elements.** Do they share one, or pull in different directions? Earth Sun, fire Moon and air rising: a practical core with a warm heart and a sociable manner.
3. **Notice tensions.** A Capricorn Sun and a Leo Moon may disagree: one says "work first", the other "play first". That disagreement is not a flaw; it is a person.
4. **Add the houses.** The Sun's house shows where you shine; the Moon's where you need to feel at home.

## Without a birth time

You still have the Sun and the Moon's sign (though the Moon may be near a sign change; the app says so). Read them, and leave the rising sign as an open question.

> **Try this:** Write three lines about your own big three, then one sentence that joins them: "I am someone who…".`,
    },
    {
      id: 'astro-reading-ruler-planets',
      title: 'Step two: the chart ruler and the planets',
      summary: 'Find the planet that steers the chart, then walk through each planet by sign and house.',
      minutes: 8,
      terms: ['chart-ruler', 'rulership', 'cusp'],
      links: [astro('chart:reading', 'Your chart ruler, read'), astro('chart:placements')],
      yourChart: 'ruler',
      body: `## The chart ruler

The planet that rules your rising sign is your **chart ruler**. Hellenistic astrologers called it the lord of the Hour and read its condition as the condition of the whole life. Where it sits (its sign and house) is where the chart's energy is "sent".

- Aries rising: Mars. Taurus or Libra: Venus. Gemini or Virgo: Mercury. Cancer: the Moon. Leo: the Sun. Sagittarius or Pisces: Jupiter. Capricorn or Aquarius: Saturn.
- Modern astrologers add Pluto for Scorpio, Uranus for Aquarius and Neptune for Pisces as co-rulers.

## Walking through the planets

For each planet, write one sentence with three parts:

**Planet** (what) + **sign** (how) + **house** (where).

"My Venus (love) in Virgo (carefully, practically) in the sixth house (daily work and service): I show love by doing useful things for people every day."

Go in order of speed: Mercury, Venus, Mars, then Jupiter and Saturn, then the outer planets (which matter most by house and by aspect to your personal planets).

## Weighting

Not everything is equally loud. Give more weight to planets that are:

- on an angle (near the Ascendant, Midheaven, Descendant or IC);
- the chart ruler, or the ruler of the Sun or Moon's sign;
- in a stellium, or the apex of a pattern;
- in tight aspect to the Sun, Moon or Ascendant.`,
    },
    {
      id: 'astro-reading-aspects-balance',
      title: 'Step three: aspects, patterns and balance',
      summary: 'Add the conversations between planets and the chart\'s overall shape.',
      minutes: 7,
      terms: ['aspects', 'aspect-patterns', 'elements', 'modalities', 'houses'],
      links: [astro('chart:aspects'), astro('chart:balance')],
      yourChart: 'aspects',
      body: `## The tightest aspects first

Read the aspects from the tightest orb outwards, and stop after about a dozen. An aspect within 2° to the Sun, Moon or chart ruler is usually a major theme.

For each, ask: what do these two planets want, and does the angle let them cooperate (trine, sextile), clash (square), mirror each other (opposition) or fuse (conjunction)?

## Patterns

If there is a T-square, grand trine, yod or stellium, read it as one unit. A T-square's apex or a stellium's sign often becomes the centre of the whole reading.

## Balance and shape

Step back and look at the whole:

- **Elements and modalities**: which dominate, which are missing?
- **Hemispheres**: are most planets above the horizon (outward, public) or below (inward, private)? East (self-directed) or west (shaped through others)?
- **Sect**: was the Sun above the horizon (a day chart) or below (a night chart)?

These give the chart's temperament before the details.

## An example

Say a chart is mostly earth and water, with no air, most planets below the horizon, and a tight Moon square Saturn. Before reading a single planet you already know a lot: a practical, feeling, private person, who may find it hard to step back and talk things through, and who learned early to hold their needs carefully. Every later detail is read in that light.

> **Try this:** Open your balance and your aspects. Write three words for your chart's overall temperament, then name your single tightest aspect and what it might mean.`,
    },
    {
      id: 'astro-reading-synthesis',
      title: 'Step four: putting it together',
      summary: 'Finding the themes that repeat, and writing your chart\'s story in a few sentences.',
      minutes: 7,
      terms: ['natal-chart', 'big-three', 'chart-ruler'],
      links: [astro('chart:reading', 'Your reading in full'), pageLink('grimoire'), pageLink('journal')],
      yourChart: 'big-three',
      body: `## Look for repetition

A good reading does not list every placement; it finds what the chart says more than once. If your Sun is in Scorpio, Pluto is on your Ascendant and you have a stellium in the eighth house, depth and transformation is not one theme among many: it is *the* theme. Astrologers call this the rule of three: anything said three ways is central.

## Hold contradictions

Charts contradict themselves because people do. A fire Sun and a water Moon, a free Uranus and a careful Saturn: both are true. Say "part of you… and part of you…".

## Write the story

1. One sentence for the big three.
2. One for the chart ruler and where it sends you.
3. One for the strongest pattern or theme.
4. One for the main tension and what it teaches.
5. One for the gift: the easiest, most natural strength.

## Ethics

When you read for other people, the same care applies as in any divination: speak of tendencies, not fate; never predict death, illness or disaster; leave people feeling more able, not less.

> **Try this:** Write your five sentences in your Grimoire. Come back to them in a year; you will read your chart differently.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-reading',
    title: 'Reading a chart',
    intro: 'Six questions on the step-by-step method.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'With Sagittarius rising, what is the traditional chart ruler?', options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'], correct: [1], points: 1, explanation: 'Jupiter rules Sagittarius, so it rules a Sagittarius-rising chart.' },
      { id: 'q2', type: 'single', prompt: 'In "Venus in Virgo in the sixth house", what does the sixth house add?', options: ['How Venus acts', 'Where in life Venus acts: daily work and service', 'Whether Venus is strong', 'Nothing'], correct: [1], points: 1, explanation: 'Planet = what, sign = how, house = where.' },
      { id: 'q3', type: 'multi', prompt: 'Which make a planet louder in a chart? Choose all.', options: ['Being on an angle', 'Being the chart ruler', 'Tight aspect to the Sun or Moon', 'Being in the twelfth house by default'], correct: [0, 1, 2], points: 1, explanation: 'Angularity, rulership and tight aspects to the lights all add weight.' },
      { id: 'q4', type: 'single', prompt: 'What is the "rule of three" in synthesis?', options: ['Read only three planets', 'A theme said three ways in a chart is central', 'Three houses matter most', 'Read for three people'], correct: [1], points: 1, explanation: 'Repetition across planets, signs and houses shows the main themes.' },
      { id: 'q5', type: 'truefalse', prompt: 'When a chart contradicts itself, one placement must be wrong.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'People contain contradictions; a good reading holds both sides.' },
      { id: 'q6', type: 'single', prompt: 'Which aspects should you read first?', options: ['The widest', 'The minor ones', 'The tightest, especially to the lights and ruler', 'Only the trines'], correct: [2], points: 1, explanation: 'Tight aspects to the Sun, Moon and chart ruler carry the most weight.' },
    ],
  },
};

export const DIGNITIES: AstroChapter = {
  id: 'dignities',
  title: 'Dignities and rulerships',
  summary: 'Which planets are at home where, how traditional astrologers judged a planet\'s strength, and sect.',
  lessons: [
    {
      id: 'astro-dignities-rulership',
      title: 'Rulership: planets at home',
      summary: 'Each sign has a ruling planet, and following the rulers links a whole chart together.',
      minutes: 6,
      terms: ['rulership', 'domicile', 'detriment'],
      links: [astro('chart:placements', 'Your placements and dignities')],
      yourChart: 'dignities',
      body: `## The scheme

The traditional rulerships follow a beautiful pattern. The Sun and Moon rule the two summer signs, Leo and Cancer. Then, moving outward in both directions in order of the planets' speed:

- Mercury rules Gemini and Virgo,
- Venus rules Taurus and Libra,
- Mars rules Aries and Scorpio,
- Jupiter rules Sagittarius and Pisces,
- Saturn rules Capricorn and Aquarius, the winter signs opposite the lights.

A planet in a sign it rules is in its **domicile**: at home, able to act freely. A planet in the sign opposite its home is in **detriment**: a guest in a house run by different rules, working harder or in an unusual way.

## Following the rulers

Every sign in your chart has a ruler somewhere else in it. "My seventh house is Aries, ruled by Mars, and Mars is in my tenth": partners and career are linked. Following these chains (dispositors) shows how the parts of a chart talk to each other. Sometimes one planet ends every chain: a **final dispositor**, very strong in the chart.

## Modern rulers

Modern astrology gives Scorpio to Pluto, Aquarius to Uranus and Pisces to Neptune. Many astrologers use both, the traditional ruler for practical matters and the modern one for psychological colour.`,
    },
    {
      id: 'astro-dignities-exaltation',
      title: 'Exaltation, fall and peregrine planets',
      summary: 'The honoured signs, their opposites, and planets with no dignity at all.',
      minutes: 6,
      terms: ['dignity', 'exaltation', 'fall'],
      links: [astro('chart:placements')],
      yourChart: 'dignities',
      body: `## Exaltation

Each of the seven traditional planets has a sign where it is **exalted**: an honoured guest, at its best and most celebrated. Ptolemy lists them in the *Tetrabiblos*:

- Sun in Aries, Moon in Taurus, Mercury in Virgo, Venus in Pisces, Mars in Capricorn, Jupiter in Cancer, Saturn in Libra.

Opposite its exaltation, a planet is in **fall**: overlooked, struggling to be seen.

## Peregrine

A planet in none of these four conditions is **peregrine**, a wanderer. That is most placements, and it is fine: the planet relies on its aspects and its ruler's condition.

## Reading dignity gently

Dignity describes how easily a planet can do its work, not whether you are good or bad. A Venus in detriment in Scorpio loves intensely and privately rather than lightly; a Mars in fall in Cancer fights for family rather than for itself. Many people with "debilitated" planets develop real mastery precisely because those planets made them work.

> **Note:** There are also smaller dignities (triplicity, term and face, or decan). The app shows each planet's decan; the full scheme belongs to a deeper study of traditional astrology.`,
    },
    {
      id: 'astro-dignities-sect',
      title: 'Sect and a planet\'s condition',
      summary: 'Day and night charts, and other ways traditional astrologers judged a planet\'s strength.',
      minutes: 6,
      terms: ['sect', 'retrograde', 'decans'],
      links: [astro('chart:balance', 'Your chart\'s sect')],
      yourChart: 'dignities',
      body: `## Day and night

**Sect** divides charts into day charts (Sun above the horizon) and night charts (Sun below). The planets divide too:

- The **day sect**: the Sun, Jupiter and Saturn.
- The **night sect**: the Moon, Venus and Mars.
- Mercury joins whichever sect it is nearer to, rising before or after the Sun.

In a day chart, Jupiter is the most helpful planet and Saturn's difficulties are softened; Mars is the hardest. In a night chart, Venus is the most helpful, Mars is gentled, and Saturn is the hardest. This ancient rule explains a great deal about why the "malefics" are harsher in some charts than others.

## Other conditions

Traditional astrologers also asked:

- Is the planet **angular** (strong, visible) or **cadent** (weaker, behind the scenes)?
- Is it **retrograde** (inward, delayed) or fast and direct?
- Is it under the Sun's beams (hidden) or **combust** (within about 8° of the Sun: overpowered), or **cazimi** (within a degree: in the heart of the Sun, greatly strengthened)?
- Is it received by its ruler (does the ruler aspect it)?

You don't need all of this to read a chart. It is a deeper layer, and worth knowing exists.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-dignities',
    title: 'Dignities and rulerships',
    intro: 'Six questions on rulership, exaltation and sect.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'Venus traditionally rules…', options: ['Aries and Scorpio', 'Taurus and Libra', 'Gemini and Virgo', 'Cancer and Leo'], correct: [1], points: 1, explanation: 'Venus rules Taurus and Libra.' },
      { id: 'q2', type: 'single', prompt: 'A planet in the sign opposite its home is in…', options: ['Exaltation', 'Detriment', 'Domicile', 'Cazimi'], correct: [1], points: 1, explanation: 'Detriment is the sign opposite a planet\'s domicile.' },
      { id: 'q3', type: 'single', prompt: 'Where is the Moon exalted?', options: ['Cancer', 'Taurus', 'Pisces', 'Scorpio'], correct: [1], points: 1, explanation: 'Ptolemy gives the Moon\'s exaltation as Taurus.' },
      { id: 'q4', type: 'single', prompt: 'A peregrine planet is…', options: ['Retrograde', 'In none of its dignities or debilities', 'Very strong', 'Near the Sun'], correct: [1], points: 1, explanation: 'Peregrine means a wanderer: no essential dignity or debility.' },
      { id: 'q5', type: 'single', prompt: 'In a night chart, which planet is the most helpful?', options: ['Jupiter', 'Saturn', 'Venus', 'Mars'], correct: [2], points: 1, explanation: 'Venus is the benefic of the night sect.' },
      { id: 'q6', type: 'truefalse', prompt: 'A planet in fall means the person is bad at what that planet rules.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'Dignity describes ease, not worth; debilitated planets often become places of mastery.' },
    ],
  },
};

export const TRANSITS_CHAPTER: AstroChapter = {
  id: 'transits',
  title: 'Transits',
  summary: 'How the moving sky touches your chart: what transits are, the great life cycles, and working with them.',
  lessons: [
    {
      id: 'astro-transits-what',
      title: 'What transits are',
      summary: 'The planets today, aspecting the planets at your birth.',
      minutes: 6,
      terms: ['transit', 'orb', 'applying-separating', 'station'],
      links: [astro('chart:transits', 'Your transits now')],
      yourChart: 'transits',
      body: `## The sky keeps moving

Your birth chart is fixed; the sky is not. A **transit** is a planet in today's sky making an aspect to a point in your birth chart: transiting Saturn square your natal Sun, say. Transits are the main way astrologers think about timing.

## Fast and slow

- The **Moon** transits every point in your chart each month: moods for a few hours.
- The **Sun, Mercury, Venus and Mars** bring days or weeks of focus.
- **Jupiter and Saturn** bring chapters of months.
- **Uranus, Neptune and Pluto** bring eras of a year or more, and often pass a point three times because of retrograde motion.

The slower the planet, the more it matters. Most astrologers watch the outer planets and Saturn and Jupiter crossing the Sun, Moon, angles and chart ruler.

## Houses too

As a planet moves through your houses, it lights up that area of life: Jupiter takes a year in each house, Saturn two and a half. Knowing which house Saturn is crossing tells you where life is asking for effort.

> **Try this:** Open your transits. Find the slowest planet touching your chart now, and read it. Does it match what this year has asked of you?`,
    },
    {
      id: 'astro-transits-cycles',
      title: 'The great cycles of a life',
      summary: 'Jupiter and Saturn returns, the midlife transits, the Chiron return and the nodal cycle.',
      minutes: 8,
      terms: ['transit', 'saturn', 'jupiter', 'uranus', 'chiron', 'north-node'],
      links: [astro('chart:transits'), astro('planet:Saturn', 'Saturn\'s guide')],
      body: `## Cycles everyone shares

Some transits happen to everyone at about the same age, because they are a planet returning to, or opposing, its own place in your chart.

- **Jupiter returns** every twelve years (about 12, 24, 36, 48, 60, 72, 84): new cycles of growth and faith.
- **Saturn squares** its place around 7, 21–22, 36 and 51, **opposes** it around 14–15 and 44, and **returns** around 29 and 58. The first Saturn return is astrology's famous coming of age: what is not truly yours falls away, and what is, gets built.
- **The midlife transits** cluster around 38–44: Uranus opposite Uranus (awakening), Neptune square Neptune (old dreams dissolve), and, for many people born in the twentieth century, Pluto square Pluto (power and depth).
- **Chiron returns** around 50: the old wound comes round to become wisdom.
- **The nodes return** every 18.6 years (about 18–19, 37, 56, 74), often around turning points of direction, with the reversal (North Node over South) about nine years after each.

## Using them

Knowing these cycles takes the fear out of them. A hard Saturn transit is a season, not a sentence: it has a beginning and an end, and what you build in it lasts.

> **Note:** Ages are approximate; the app shows your own exact dates as the transits come.`,
    },
    {
      id: 'astro-transits-working',
      title: 'Working with transits',
      summary: 'Tracking transits, reading them alongside the natal chart, and timing your practice by them.',
      minutes: 6,
      terms: ['transit', 'retrograde', 'shadow-period'],
      links: [astro('chart:transits'), astro('chart:craft', 'Where your chart meets the craft'), pageLink('planner'), ritualLink('cosmic-saturday-saturn-boundaries'), ritualLink('cosmic-thursday-jupiter-prosperity')],
      yourChart: 'transits',
      body: `## Read the natal promise first

A transit can only wake what is in the chart. Saturn crossing a natal Venus that is already strong and well aspected brings a sobering of love; crossing a Venus that is already under pressure, it may bring a real test. Always ask: what does the natal planet mean for this person, and what is the transiting planet asking of it?

## Keep a record

The best way to learn transits is to notice them. When a slow transit begins, write down what you expect; when it ends, write what happened. After a few years you will know how Saturn and Jupiter work for you.

## Working with them in the craft

- **Jupiter** transits: cast for growth and blessing; begin things.
- **Saturn** transits: bind, protect, commit; do long workings with patience.
- **Uranus**: spells for freedom and change; expect the unexpected.
- **Neptune**: dreamwork, devotion, art; ground often.
- **Pluto**: shadow work, release and rebirth.

Many witches time a working to the day a transit is exact, and renew it at each pass.

> **Try this:** Use the ritual planner to set a working for the next exact date of a transit you are living through.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-transits',
    title: 'Transits',
    intro: 'Six questions on transits and the cycles of a life.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'What is a transit?', options: ['A planet in your birth chart', 'A planet in today\'s sky aspecting a point in your birth chart', 'A house system', 'A kind of eclipse'], correct: [1], points: 1, explanation: 'Transits are the moving sky against the fixed natal chart.' },
      { id: 'q2', type: 'single', prompt: 'Around what age is the first Saturn return?', options: ['12', '21', '29', '42'], correct: [2], points: 1, explanation: 'Saturn takes about 29½ years to return to its natal place.' },
      { id: 'q3', type: 'single', prompt: 'Which transit is at the heart of the midlife awakening around 40–42?', options: ['Jupiter return', 'Uranus opposite Uranus', 'Mars return', 'The Moon\'s return'], correct: [1], points: 1, explanation: 'The Uranus opposition comes around 40–42.' },
      { id: 'q4', type: 'single', prompt: 'Why can an outer planet pass the same point three times?', options: ['It speeds up', 'Retrograde motion takes it back over the point', 'Houses change', 'It doesn\'t'], correct: [1], points: 1, explanation: 'Direct, retrograde and direct again: three passes.' },
      { id: 'q5', type: 'truefalse', prompt: 'A transit can bring something the natal chart has no sign of at all.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'Transits wake what the natal chart promises; always read the natal planet first.' },
      { id: 'q6', type: 'single', prompt: 'Which transiting planet suits binding, protection and long patient workings?', options: ['Jupiter', 'Saturn', 'Neptune', 'Uranus'], correct: [1], points: 1, explanation: 'Saturn is structure, limits and endurance.' },
    ],
  },
};
