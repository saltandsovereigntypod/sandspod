// Chapters 4–6: the signs, the houses and the aspects.

import { astro, libLink, type AstroChapter } from './types.ts';

export const SIGNS_CHAPTER: AstroChapter = {
  id: 'signs',
  title: 'Signs, elements and modalities',
  summary: 'The twelve signs, built from four elements, three modalities and two polarities, and how a sign colours a planet.',
  lessons: [
    {
      id: 'astro-signs-elements',
      title: 'The four elements',
      summary: 'Fire, earth, air and water: the oldest way of sorting the signs, and the one witches know best.',
      minutes: 6,
      terms: ['elements', 'fire', 'earth', 'air', 'water'],
      links: [astro('chart:balance', 'Your balance of elements'), libLink('candle', 'red'), libLink('candle', 'green'), libLink('candle', 'yellow'), libLink('candle', 'blue')],
      yourChart: 'elements',
      body: `## Four elements, three signs each

The signs go round the zodiac in the order fire, earth, air, water, three times:

- **Fire**: Aries, Leo, Sagittarius. Spirit, will, enthusiasm, inspiration.
- **Earth**: Taurus, Virgo, Capricorn. Body, matter, practicality, patience.
- **Air**: Gemini, Libra, Aquarius. Mind, speech, ideas, connection.
- **Water**: Cancer, Scorpio, Pisces. Feeling, memory, intuition, depth.

Signs of the same element are 120° apart (a trine), so they get on easily.

## The elements in a chart

Counting which elements your planets fall in gives a quick picture of temperament. Someone heavy in fire acts on enthusiasm; heavy in earth trusts what they can touch. An element with no planets at all is often noticed too: people tend to feel its lack, admire it in others, or work hard to build it.

This idea is very old: the four elements come from Empedocles, and Hellenistic astrologers (the Greek-speaking astrologers of the ancient Mediterranean, where Western astrology began) paired them with the four humours of medicine (choleric fire, melancholic earth, sanguine air, phlegmatic water).

## In the craft

You already work with the elements when you call the quarters or choose a candle colour. A chart tells you which element is your home ground and which one to build deliberately.

> **Try this:** Open your chart's balance. Which element is strongest, and which is weakest? Choose one small practice this week for the weakest one: a bath for water, a walk for earth, a candle for fire, a journal page for air.`,
    },
    {
      id: 'astro-signs-modalities',
      title: 'Modalities and polarity',
      summary: 'Cardinal, fixed and mutable: how a sign moves. Yang and yin: whether it reaches out or draws in.',
      minutes: 5,
      terms: ['modalities', 'cardinal', 'fixed', 'mutable', 'polarity'],
      links: [astro('chart:balance')],
      yourChart: 'elements',
      body: `## Three ways of moving

Each element has one sign of each **modality** (also called quality or mode):

- **Cardinal** signs begin the seasons: Aries, Cancer, Libra, Capricorn. They start things, lead and act.
- **Fixed** signs hold the middle of each season: Taurus, Leo, Scorpio, Aquarius. They sustain, protect and persist.
- **Mutable** signs end the seasons and prepare the next: Gemini, Virgo, Sagittarius, Pisces. They adapt, learn and change.

Signs of the same modality are 90° or 180° apart, so they tend to clash: they want the same kind of thing in different elements.

## Two polarities

The signs alternate between two **polarities**:

- **Yang** (also called masculine, positive or active): the fire and air signs, which reach outward.
- **Yin** (also called feminine, negative or receptive): the earth and water signs, which draw inward.

These are traditional labels for energies, not genders: everyone has both.

## Building a sign

Every sign is a unique mix: Aries is cardinal fire and yang (the spark that begins); Taurus is fixed earth and yin (the field that holds); and so on. Once you know the elements and modalities, you can work out any sign's character from first principles.

> **Try this:** Work out Scorpio from its parts: fixed, water, yin. What would a sign like that be like? Then read its glossary entry.`,
    },
    {
      id: 'astro-signs-twelve',
      title: 'The twelve signs, and a planet in a sign',
      summary: 'A tour of the twelve, and the simple key to reading any placement: the planet is the verb, the sign the adverb.',
      minutes: 9,
      terms: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'],
      links: [astro('chart:placements', 'Your placements'), astro('chart:reading', 'Your reading')],
      yourChart: 'planets',
      body: `## The twelve in brief

- **Aries** (cardinal fire, ruled by Mars): courage, beginnings, directness.
- **Taurus** (fixed earth, Venus): patience, the senses, steadiness.
- **Gemini** (mutable air, Mercury): curiosity, talk, versatility.
- **Cancer** (cardinal water, Moon): care, home, memory.
- **Leo** (fixed fire, Sun): warmth, creativity, pride.
- **Virgo** (mutable earth, Mercury): skill, service, discernment.
- **Libra** (cardinal air, Venus): balance, relationship, beauty.
- **Scorpio** (fixed water, Mars and modern Pluto): depth, intensity, transformation.
- **Sagittarius** (mutable fire, Jupiter): faith, adventure, meaning.
- **Capricorn** (cardinal earth, Saturn): ambition, structure, endurance.
- **Aquarius** (fixed air, Saturn and modern Uranus): ideals, community, independence.
- **Pisces** (mutable water, Jupiter and modern Neptune): compassion, imagination, surrender.

## Reading a planet in a sign

The simplest key in astrology:

- The **planet** is *what*: the part of you, the verb. Mars acts. Venus loves. Mercury thinks.
- The **sign** is *how*: the style, the adverb. Boldly in Aries, slowly in Taurus, curiously in Gemini.

So Mars in Taurus acts slowly and steadily, and is very hard to stop once moving. Venus in Gemini loves with curiosity and conversation. Mercury in Scorpio thinks deeply and keeps secrets.

Later chapters add the third part, the house: *where* in life it happens.

> **Try this:** For each planet in your chart, write a sentence with the planet as verb and the sign as adverb: "My Mars acts ___ ." Then check your reading to see how close you came.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-signs',
    title: 'Signs, elements and modalities',
    intro: 'Seven questions on the elements, modalities, polarities and signs.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'Which are the water signs?', options: ['Aries, Leo, Sagittarius', 'Cancer, Scorpio, Pisces', 'Gemini, Libra, Aquarius', 'Taurus, Virgo, Capricorn'], correct: [1], points: 1, explanation: 'Cancer, Scorpio and Pisces are the water signs.' },
      { id: 'q2', type: 'single', prompt: 'Cardinal signs…', options: ['End the seasons', 'Begin the seasons', 'Hold the middle of the seasons', 'Have no season'], correct: [1], points: 1, explanation: 'Aries, Cancer, Libra and Capricorn begin the seasons at the equinoxes and solstices.' },
      { id: 'q3', type: 'single', prompt: 'Which sign is fixed fire?', options: ['Aries', 'Leo', 'Sagittarius', 'Taurus'], correct: [1], points: 1, explanation: 'Leo is the fixed fire sign, ruled by the Sun.' },
      { id: 'q4', type: 'single', prompt: 'In "Mars in Taurus", what does Taurus tell you?', options: ['Where in life Mars acts', 'How Mars acts: its style', 'When Mars was discovered', 'Which planet rules Mars'], correct: [1], points: 1, explanation: 'The sign is the style, the "how". The house is the "where".' },
      { id: 'q5', type: 'truefalse', prompt: 'Yin and yang polarities in astrology describe a person\'s gender.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'They describe energies (outward or inward), and everyone has both.' },
      { id: 'q6', type: 'single', prompt: 'Which planet traditionally rules Capricorn?', options: ['Jupiter', 'Mars', 'Saturn', 'Uranus'], correct: [2], points: 1, explanation: 'Saturn rules Capricorn (and, traditionally, Aquarius).' },
      { id: 'q7', type: 'single', prompt: 'Signs of the same element are how far apart?', options: ['30°', '60°', '90°', '120°'], correct: [3], points: 1, explanation: 'Same-element signs are 120° apart: a trine.' },
    ],
  },
};

export const HOUSES_CHAPTER: AstroChapter = {
  id: 'houses',
  title: 'The houses',
  summary: 'The twelve areas of life, the angles that anchor them, and the house systems astrologers argue about.',
  lessons: [
    {
      id: 'astro-houses-what',
      title: 'What the houses are',
      summary: 'The houses divide the sky around your birthplace into twelve stages of life.',
      minutes: 6,
      terms: ['houses', 'cusp', 'ascendant', 'midheaven'],
      links: [astro('chart', 'Your chart wheel')],
      yourChart: 'houses',
      body: `## Signs are the sky, houses are the earth

The signs divide the zodiac, which turns with the stars. The houses divide the sky around one place on earth at one moment, counting from the eastern horizon. A planet's sign tells you *how* it works; its house tells you *where* in life.

## Twelve stages

Starting at the Ascendant and going anticlockwise:

- Houses **1 to 3**: self, resources, the near world.
- Houses **4 to 6**: home, creativity, daily work and health.
- Houses **7 to 9**: partners, shared things, the wider world.
- Houses **10 to 12**: career, community, the hidden and the spiritual.

Each house starts at its **cusp**. The sign on the cusp colours the house, and that sign's ruler, wherever it sits, says more about it.

## Angular, succedent, cadent

- **Angular** houses (1, 4, 7, 10) begin at the four angles. Planets here are strong and visible.
- **Succedent** houses (2, 5, 8, 11) follow them: steady, accumulating.
- **Cadent** houses (3, 6, 9, 12) fall away towards the next angle: learning, adjusting, preparing.

An empty house is not an empty part of life: everyone has relationships, even with nothing in the seventh. Read it through its cusp sign and ruler.

> **Try this:** Find the house with the most planets in your chart. Does that area of life take up a lot of your attention?`,
    },
    {
      id: 'astro-houses-twelve',
      title: 'The twelve houses',
      summary: 'What each house governs, with its old names and natural signs.',
      minutes: 8,
      terms: ['house-1', 'house-2', 'house-3', 'house-4', 'house-5', 'house-6', 'house-7', 'house-8', 'house-9', 'house-10', 'house-11', 'house-12'],
      links: [astro('chart:reading', 'Your houses, read')],
      yourChart: 'houses',
      body: `## Round the wheel

1. **The first house**: you. Body, appearance, temperament, how you begin. Starts at the Ascendant.
2. **The second**: resources. Money, possessions, skills you earn by, self-worth.
3. **The third**: the near world. Siblings, neighbours, short journeys, early learning, speech.
4. **The fourth**: home and roots. Family, ancestors, land, the private self. Starts at the IC.
5. **The fifth**: joy. Creativity, romance, pleasure, children, play.
6. **The sixth**: work and health. Daily routine, service, illness and healing, animals.
7. **The seventh**: others. Partners, marriage, open enemies, contracts. Starts at the Descendant.
8. **The eighth**: depth. Shared money, inheritance, intimacy, death and rebirth.
9. **The ninth**: horizons. Travel, higher learning, faith, philosophy, publishing.
10. **The tenth**: public life. Career, reputation, achievement. Starts at the Midheaven.
11. **The eleventh**: friends. Groups, community, patrons, hopes.
12. **The twelfth**: the hidden. Solitude, retreat, the unconscious, hospitals and prisons, hidden enemies, spiritual practice.

Each house echoes the sign in the same place in the zodiac (the first and Aries, the second and Taurus…), but they are not the same thing: a house is an area of life, a sign a style.

## Old names

Hellenistic astrologers (the Greek-speaking astrologers of the ancient Mediterranean, where Western astrology began) gave some houses names: the tenth was the *Midheaven*, the eleventh the *Good Spirit*, the twelfth the *Bad Spirit*, the fifth *Good Fortune*, the third the *Goddess*, the ninth the *God*. Planets were said to rejoice in certain houses: Mercury in the first, the Moon in the third, Venus in the fifth, Mars in the sixth, the Sun in the ninth, Jupiter in the eleventh, Saturn in the twelfth.`,
    },
    {
      id: 'astro-houses-systems',
      title: 'House systems',
      summary: 'Why there are several ways to divide the houses, and which one to choose.',
      minutes: 6,
      terms: ['house-systems', 'placidus', 'whole-sign', 'equal-house', 'porphyry'],
      links: [astro('chart', 'Change your chart\'s house system')],
      body: `## The problem

Dividing the zodiac into signs is simple: 30° each. Dividing the sky around a place into houses is not, because the ecliptic sits at a slant to the horizon, and the slant changes with latitude and time. Astrologers have tried many solutions.

## The main systems

- **Whole sign**: the oldest. The whole rising sign is the first house, the next sign the second, and so on. Simple, and used by the ancient Greek-speaking and Indian astrologers. Recovered by many modern traditional astrologers.
- **Equal house**: twelve houses of 30° from the Ascendant's exact degree.
- **Porphyry**: each quadrant between the angles divided in three. Ancient and simple.
- **Placidus**: divides by time (how long each degree takes to rise). The most common system in twentieth-century books, and this app's default. It fails near the poles, where some degrees never rise; the app then uses Porphyry.

In Placidus and Porphyry, the Midheaven is always the tenth-house cusp; in whole sign and equal house it can fall in the ninth, tenth or eleventh.

## Which to use?

There is no proven answer. Try whole sign and Placidus on your own chart and see which describes your life better. Many astrologers use whole sign for the topics of life and keep the quadrant angles as sensitive points.

> **Note:** If a planet changes house when you change system, read it as sitting between the two: both houses' matters will show.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-houses',
    title: 'The houses',
    intro: 'Seven questions on the houses and house systems.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'The sign of a planet tells you how it works. The house tells you…', options: ['When it works', 'Where in life it works', 'Whether it is retrograde', 'Its element'], correct: [1], points: 1, explanation: 'Houses are areas of life: the "where".' },
      { id: 'q2', type: 'single', prompt: 'Which house begins at the Midheaven?', options: ['First', 'Fourth', 'Seventh', 'Tenth'], correct: [3], points: 1, explanation: 'In quadrant systems the Midheaven is the tenth-house cusp.' },
      { id: 'q3', type: 'single', prompt: 'Partnership and marriage belong to which house?', options: ['Fifth', 'Seventh', 'Eighth', 'Eleventh'], correct: [1], points: 1, explanation: 'The seventh, beginning at the Descendant, is partners and open others.' },
      { id: 'q4', type: 'multi', prompt: 'Which are angular houses? Choose all.', options: ['1', '4', '7', '10', '11'], correct: [0, 1, 2, 3], points: 1, explanation: 'Angular houses begin at the four angles: 1, 4, 7 and 10.' },
      { id: 'q5', type: 'truefalse', prompt: 'An empty house means that area of life is missing from your life.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'Read an empty house through its cusp sign and ruler; the area of life is still there.' },
      { id: 'q6', type: 'single', prompt: 'Which is the oldest house system?', options: ['Placidus', 'Whole sign', 'Koch', 'Equal house'], correct: [1], points: 1, explanation: 'Whole sign houses were used by the Hellenistic astrologers, the Greek-speaking astrologers of the ancient Mediterranean.' },
      { id: 'q7', type: 'single', prompt: 'Spirituality, solitude and the hidden belong to the…', options: ['Third house', 'Sixth house', 'Ninth house', 'Twelfth house'], correct: [3], points: 1, explanation: 'The twelfth house: retreat, the unconscious and spiritual practice.' },
    ],
  },
};

export const ASPECTS_CHAPTER: AstroChapter = {
  id: 'aspects',
  title: 'Aspects',
  summary: 'The angles planets make to each other: the conversations in a chart, their orbs, and the shapes they form.',
  lessons: [
    {
      id: 'astro-aspects-major',
      title: 'The five major aspects',
      summary: 'Conjunction, sextile, square, trine and opposition: what each angle means.',
      minutes: 7,
      terms: ['aspects', 'conjunction', 'sextile', 'square', 'trine', 'opposition'],
      links: [astro('chart:aspects', 'Your aspects')],
      yourChart: 'aspects',
      body: `## Planets in conversation

An **aspect** is a meaningful angle between two planets, measured round the zodiac. If planets are the actors, aspects are their conversations: some easy, some tense.

## The five Ptolemaic aspects

These come from dividing the circle by 1, 2, 3, 4 and 6:

- **Conjunction** (0°): together. The two blend and act as one; whether that is easy depends on the planets.
- **Sextile** (60°): an opening. Signs of friendly elements (fire with air, earth with water). Helpful, but it needs you to act.
- **Square** (90°): friction. Signs of the same modality but clashing elements. Tension that pushes you to grow; often where people build their greatest strengths.
- **Trine** (120°): flow. Signs of the same element. Easy talent, sometimes taken for granted.
- **Opposition** (180°): a see-saw. Opposite signs. Awareness through contrast, often played out with other people; the work is balance.

## Hard and soft

Squares and oppositions are traditionally "hard", trines and sextiles "soft". Modern astrologers are careful with these words: hard aspects drive achievement, and soft ones can make for comfort without growth. A chart with no hard aspects can be as challenging as one full of them.

> **Try this:** Open your aspects and find your tightest one (the smallest orb). Read it. How do those two planets talk in your life?`,
    },
    {
      id: 'astro-aspects-orbs',
      title: 'Orbs, applying and separating',
      summary: 'How close is close enough, and why a forming aspect differs from a fading one.',
      minutes: 5,
      terms: ['orb', 'applying-separating'],
      links: [astro('chart:aspects')],
      yourChart: 'aspects',
      body: `## Orbs

Planets are rarely at an exact angle. The **orb** is how far from exact an aspect can be and still count. This app uses middle-of-the-road modern orbs: about 8° for conjunctions and oppositions, 7° for squares and trines, 5° for sextiles, with two degrees more when the Sun or Moon is involved, and tighter orbs for the points and the minor aspects. You can change them in your chart's settings.

The tighter the orb, the stronger the aspect. An aspect within 1° is felt loudly; one at the edge of its orb is a whisper.

## Applying and separating

If the faster planet is moving towards the exact angle, the aspect is **applying**: building, a matter still unfolding. If it has passed exact, it is **separating**: fading, a matter already lived. Traditional astrologers took this very seriously, especially in questions and elections.

## Out-of-sign aspects

Sometimes two planets are at the right distance but in signs that don't match (a "trine" between a late Leo and an early Capricorn planet, say). Many astrologers count these but read them as weaker or more complicated.`,
    },
    {
      id: 'astro-aspects-minor-patterns',
      title: 'Minor aspects and patterns',
      summary: 'The quincunx and other minor angles, and the larger shapes several aspects make together.',
      minutes: 8,
      terms: ['quincunx', 'semisextile', 'semisquare', 'sesquiquadrate', 'quintile', 'aspect-patterns', 'grand-trine', 't-square', 'grand-cross', 'yod', 'kite', 'stellium'],
      links: [astro('chart:aspects'), astro('chart:reading', 'Your patterns, read')],
      yourChart: 'patterns',
      body: `## Minor aspects

Kepler and later astrologers added more angles. They use small orbs (1–3°) and say more when they are tight:

- **Quincunx** (150°): two signs with nothing in common. Constant adjustment.
- **Semisextile** (30°): neighbouring signs. A slight, slow link.
- **Semisquare** (45°) and **sesquiquadrate** (135°): smaller frictions.
- **Quintile** (72°) and **biquintile** (144°): talent and style.

You can turn minor aspects off in your chart settings if you prefer to start with the five majors.

## Patterns

Several aspects can link up into shapes that act as a whole:

- **Grand trine**: three planets in one element, each trine the others. A circle of ease and talent.
- **T-square**: two planets in opposition, both square a third (the apex). Driving tension released through the apex.
- **Grand cross**: four planets in two oppositions, all squaring. Great strength under constant pressure.
- **Yod**: two planets sextile, both quincunx a third. A pointed sense of purpose at the apex.
- **Kite**: a grand trine plus a planet opposite one corner. Talent with a direction.
- **Stellium**: three or more planets in one sign or house. A concentration of energy.

Patterns are often the first thing a chart's wheel shows you, because the lines draw them. They are worth reading before the single aspects inside them.`,
    },
  ],
  quiz: {
    id: 'quiz-astro-aspects',
    title: 'Aspects',
    intro: 'Seven questions on aspects, orbs and patterns.',
    passPercent: 80,
    questions: [
      { id: 'q1', type: 'single', prompt: 'How many degrees is a square?', options: ['60°', '90°', '120°', '180°'], correct: [1], points: 1, explanation: 'A square divides the circle by four: 90°.' },
      { id: 'q2', type: 'single', prompt: 'Which aspect joins signs of the same element?', options: ['Sextile', 'Square', 'Trine', 'Opposition'], correct: [2], points: 1, explanation: 'Trines (120°) join signs of the same element.' },
      { id: 'q3', type: 'single', prompt: 'What is an orb?', options: ['A planet\'s glow', 'How far from exact an aspect can be and still count', 'A kind of pattern', 'The Moon\'s path'], correct: [1], points: 1, explanation: 'The orb is the allowed distance from exactness.' },
      { id: 'q4', type: 'single', prompt: 'An applying aspect is…', options: ['Fading', 'Building towards exact', 'Always hard', 'Out of sign'], correct: [1], points: 1, explanation: 'Applying means the faster planet is moving towards the exact angle.' },
      { id: 'q5', type: 'single', prompt: 'Two planets in opposition, both square a third, make a…', options: ['Grand trine', 'Yod', 'T-square', 'Kite'], correct: [2], points: 1, explanation: 'That is a T-square, with the third planet as the apex.' },
      { id: 'q6', type: 'truefalse', prompt: 'A chart full of trines is always easier to live with than one with squares.', options: ['True', 'False'], correct: [1], points: 1, explanation: 'Squares drive growth; trines can make for comfort without challenge. Neither is simply better.' },
      { id: 'q7', type: 'single', prompt: 'Which minor aspect joins two signs with nothing in common?', options: ['Semisextile', 'Quincunx', 'Quintile', 'Semisquare'], correct: [1], points: 1, explanation: 'The quincunx (150°) joins signs that share no element, modality or polarity.' },
    ],
  },
};
