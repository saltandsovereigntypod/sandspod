// A Year and a Day: a structured year of study and practice for someone
// working alone, ending in a self-dedication. Pure data, shared by the app and
// the website (js/core/yearday.js).
//
// It writes no lessons of its own. Its readings are the coven courses'
// lessons (lib/covens/courses, fetched on demand as js/core/course-programs.json,
// so only their ids and titles are kept here; app/tests/yearday.test.ts checks
// both against the courses), its practices open the Sanctuary's own tools
// (CourseLink, as the courses link them), its festivals come from the track's
// own calendar (holidays.ts) and its rite is the dedication journey's rite and
// the ready-made self-dedications.
//
// Thirteen moons: twelve of about a lunar month each, from the day chosen,
// and a short thirteenth that ends on the day of dedication, a year and a day
// after the start (schedule.ts). Nothing is graded and nothing is locked.

import { courseLinkLabel, type CourseLink } from '../covens/courseLinks.ts';

export type TrackId = 'eclectic' | 'wicca' | 'celtic' | 'norse' | 'hellenic';
export type LensId = Exclude<TrackId, 'eclectic'>;

export type Track = {
  id: TrackId;
  name: string;
  /** One or two sentences for the chooser. */
  about: string;
  /** The course set its readings come from ('wheel' for the eclectic track). */
  set: string;
  /** The holidays.ts calendar whose festivals it keeps; `south` for the southern hemisphere, when there is one. */
  calendar: string;
  south?: string;
  /** Its dedication journey (lib/journeys), whose dedication rite closes the year. */
  journey: string;
  /** Ready-made workings: the self-dedication, and a rite for the moon or the month. */
  dedication: string;
  moonRite: string;
  /** Which moon its monthly rite is kept at: the full moon, or the new (the Hellenic Noumenia). */
  moonPhase: 'full' | 'new';
  /** Something to know before choosing it. */
  note?: string;
  noteLink?: CourseLink;
};

export const TRACKS: Track[] = [
  {
    id: 'eclectic',
    name: 'Eclectic',
    about: 'The foundations every path shares, with the seasons of the eclectic Wheel of the Year. No one tradition is assumed, and you can draw on several honestly.',
    set: 'wheel',
    calendar: 'wheel',
    south: 'wheel_south',
    journey: 'path-wheel',
    dedication: 'kitchen-solitary-self-dedication',
    moonRite: 'cosmic-full-moon-charging-moon-water',
    moonPhase: 'full',
  },
  {
    id: 'wicca',
    name: 'Wicca',
    about: 'The same foundations, read through Wicca: the circle, the Goddess and the God, the esbats and the eight sabbats.',
    set: 'wicca',
    calendar: 'wheel',
    south: 'wheel_south',
    journey: 'path-wicca',
    dedication: 'wicca-self-dedication',
    moonRite: 'wicca-full-moon-esbat',
    moonPhase: 'full',
    note: 'Initiatory Wicca is given by a coven within a lineage; a self-dedication is the solitary, eclectic Wicca many keep, and makes no claim to that.',
    noteLink: { kind: 'closed', id: 'initiatory-wicca' },
  },
  {
    id: 'celtic',
    name: 'Celtic',
    about: 'The foundations with the Gaelic fire festivals, the hearth, the land and the old stories, honest about what the sources can and can’t tell us.',
    set: 'celtic',
    calendar: 'celtic',
    journey: 'path-celtic',
    dedication: 'kitchen-solitary-self-dedication',
    moonRite: 'cosmic-full-moon-charging-moon-water',
    moonPhase: 'full',
    note: 'Irish, Scottish, Welsh, Breton, Cornish and Manx are living languages and cultures. Practise with respect for the people they belong to.',
    noteLink: { kind: 'closed', id: '' },
  },
  {
    id: 'norse',
    name: 'Norse & Heathen',
    about: 'The foundations with the Heathen year: blót and sumbel, the gods, the wights of land and house, and the ancestors.',
    set: 'norse',
    calendar: 'norse',
    journey: 'path-norse',
    dedication: 'kitchen-solitary-self-dedication',
    moonRite: 'folk-simple-blot',
    moonPhase: 'full',
    note: 'Heathenry is open to all; it has no place for racism, and its symbols are not to be borrowed for hate.',
  },
  {
    id: 'hellenic',
    name: 'Hellenic',
    about: 'The foundations with Hellenic household worship: khernips and libation, the monthly cycle and the festivals of the Attic year.',
    set: 'hellenic',
    calendar: 'hellenic',
    journey: 'path-hellenic',
    dedication: 'kitchen-solitary-self-dedication',
    moonRite: 'folk-noumenia-blessing',
    moonPhase: 'new',
  },
];

/**
 * The words on each link's button, as the courses name what they open
 * (linkTargets.ts, checked by the tests; the registries it reads stay out of
 * the app's bundle). Pages are named by COURSE_PAGES.
 */
export const LINK_LABELS: Record<string, string> = {
  'premade:kitchen-solitary-book-of-shadows-blessing': 'Ritual: Making and Blessing a Book of Shadows',
  'premade:kitchen-solitary-evening-reflection': 'Ritual: Evening Reflection by Candlelight',
  'premade:kitchen-solitary-grounding-centering': 'Ritual: Grounding and Centering Basics',
  'premade:kitchen-cleansing-floor-wash': 'Ritual: Rosemary and Lemon Floor Wash',
  'premade:kitchen-threshold-salt-blessing': 'Ritual: Threshold and Doorway Blessing',
  'premade:crystal-cleanse-and-charge': 'Ritual: Cleansing and Charging Your Stones',
  'premade:hedge-hearing-the-land-walk': 'Ritual: Hearing the Land Walk',
  'premade:green-land-spirit-garden-offering': 'Ritual: An Offering to the Garden\'s Spirit',
  'library:traditional:herb:rosemary': 'Herb: Rosemary',
  'premade:hedge-ancestor-candle-evening': 'Ritual: Ancestor Altar & Candle Evening',
  'premade:kitchen-solitary-self-dedication': 'Ritual: Self-Dedication to Your Path',
  'premade:cosmic-full-moon-charging-moon-water': 'Ritual: Full Moon Charging and Moon Water',
  'premade:wicca-self-dedication': 'Ritual: Solitary Self-Dedication',
  'premade:wicca-full-moon-esbat': 'Ritual: Full Moon Esbat',
  'premade:folk-simple-blot': 'Ritual: A Simple Blót',
  'premade:folk-noumenia-blessing': 'Ritual: Noumenia Household Blessing',
  'journey:path-wheel': 'Journey: The Wheel of the Year: A Year and a Day',
  'journey:path-wicca': 'Journey: Wicca: A Year and a Day',
  'journey:path-celtic': 'Journey: The Celtic Path',
  'journey:path-norse': 'Journey: The Heathen Way',
  'journey:path-hellenic': 'Journey: The Hellenic Path',
  'closed:initiatory-wicca': 'Closed & living traditions: Initiatory Wicca',
  'closed:': 'Closed & living traditions',
};

/** What a link's button says. */
export const linkLabel = (link: CourseLink): string => link.label ?? LINK_LABELS[`${link.kind}:${link.id}`] ?? courseLinkLabel(link);

export const trackById = (id: string | null | undefined): Track => TRACKS.find((t) => t.id === id) ?? TRACKS[0];

/** The dedication stage of every path journey (its rite is the year's last). */
export const DEDICATION_STAGE = 4;

export type PracticeKind = 'meditation' | 'journal' | 'altar' | 'offering' | 'divination' | 'spell' | 'timing' | 'devotion' | 'ritual' | 'study' | 'moon' | 'festival';

export const PRACTICE_WORD: Record<PracticeKind, string> = {
  meditation: 'Meditation',
  journal: 'Journal',
  altar: 'Altar',
  offering: 'Offering',
  divination: 'Divination',
  spell: 'Spellcraft',
  timing: 'Timing',
  devotion: 'Devotion',
  ritual: 'Ritual',
  study: 'Study',
  moon: 'The moon',
  festival: 'Festival',
};

export type Practice = {
  /** Unique within its moon. */
  id: string;
  kind: PracticeKind;
  title: string;
  /** What to do, in a sentence or three. */
  detail: string;
  links: CourseLink[];
};

export type Moon = {
  /** 1–13. */
  n: number;
  /** 'm1' … 'm13', stable forever (progress points at it). */
  id: string;
  title: string;
  /** A few words: what the moon is about. */
  theme: string;
  intro: string;
  /** Lessons for every track (the shared foundations). */
  core: string[];
  /** The eclectic track's own lessons (the Wheel of the Year set), and any lens without its own. */
  wheel: string[];
  /** A tradition's lessons in place of `wheel`. */
  lens?: Partial<Record<LensId, string[]>>;
  practices: Practice[];
  /** Questions for the moon's reflection. */
  reflect: string[];
  /** Private self-checks: "I can…", never graded. */
  milestones: string[];
};

const page = (id: string): CourseLink => ({ kind: 'page', id });
const ritual = (id: string): CourseLink => ({ kind: 'premade', id });
const library = (type: string, key: string): CourseLink => ({ kind: 'library', id: `traditional:${type}:${key}` });

export const MOONS: Moon[] = [
  {
    n: 1,
    id: 'm1',
    title: 'The threshold',
    theme: 'Beginning, and keeping a record',
    intro:
      'A year and a day is an old span for learning a craft, kept in many modern paths before a dedication. This first moon is for beginning well: a place to write, a small place to practise, a daily habit, and an honest look at what you are stepping into.',
    core: ['core-welcome-grimoire-and-journal', 'core-welcome-ethics-and-safety', 'core-welcome-mental-health'],
    wheel: ['wheel-tradition-what-it-is', 'wheel-seeker-a-first-practice'],
    lens: {
      wicca: ['wicca-seeker-wicca-in-brief', 'wicca-tradition-what-wicca-is', 'wicca-tradition-history'],
      celtic: ['celtic-seeker-celtic-practice-in-brief', 'celtic-tradition-who-were-the-celts', 'celtic-tradition-sources-and-their-limits', 'celtic-tradition-living-cultures'],
      norse: ['norse-seeker-heathenry-in-brief', 'norse-tradition-peoples-and-languages', 'norse-tradition-sources-and-their-limits', 'norse-tradition-symbols-and-misuse'],
      hellenic: ['hellenic-seeker-hellenic-practice-in-brief', 'hellenic-tradition-what-is-hellenismos', 'hellenic-tradition-history-and-sources'],
    },
    practices: [
      {
        id: 'book',
        kind: 'journal',
        title: 'Begin your book',
        detail: 'Make a page in your Grimoire for this year: why you are beginning, what you hope for and what you are unsure of. You will read it again at the end.',
        links: [page('grimoire'), ritual('kitchen-solitary-book-of-shadows-blessing')],
      },
      {
        id: 'space',
        kind: 'altar',
        title: 'A small place to practise',
        detail: 'Clear a shelf, a windowsill or a corner, or build an altar in the app. It need hold no more than a candle and something from outside.',
        links: [page('altar')],
      },
      {
        id: 'daily',
        kind: 'devotion',
        title: 'A daily practice, gently kept',
        detail: 'Keep the morning and evening devotion for the rest of the moon. Missing a day is not failing; you simply begin again.',
        links: [page('devotion')],
      },
    ],
    reflect: ['What drew you to begin, and what do you hope a year will give you?', 'What are you unsure of, or wary of, and how will you look after yourself?'],
    milestones: ['I have somewhere to write and somewhere to practise.', 'I have kept a short daily practice on most days of this moon.', 'I know where to find support if this stirs up something heavy.'],
  },
  {
    n: 2,
    id: 'm2',
    title: 'Breath and attention',
    theme: 'Meditation and sensing energy',
    intro:
      'Most magic begins with attention. This moon is quiet work: breathing, noticing your body, and learning what you mean, and don’t mean, when you speak of energy. Keep it simple and keep it honest.',
    core: ['core-energy-what-is-energy', 'core-energy-breath-awareness', 'core-energy-body-scan', 'core-energy-hand-sensing', 'core-energy-perception-journal'],
    wheel: ['wheel-devotion-daily-practice'],
    lens: {
      wicca: ['wicca-devotion-daily-practice'],
      celtic: ['celtic-devotion-the-hearth'],
      norse: ['norse-seeker-a-first-practice'],
      hellenic: ['hellenic-devotion-daily-practice'],
    },
    practices: [
      {
        id: 'breath',
        kind: 'meditation',
        title: 'Ten minutes of breath',
        detail: 'Sit with your breath for ten minutes on most days, and try the body scan once a week. Note what you notice, however small.',
        links: [ritual('kitchen-solitary-evening-reflection')],
      },
      {
        id: 'perception',
        kind: 'journal',
        title: 'A perception journal',
        detail: 'After each sitting, write a line or two: what you felt, where, and what else might explain it. Doubt is welcome here.',
        links: [page('grimoire')],
      },
    ],
    reflect: ['What did you notice when you paid attention, and what surprised you?', 'What does “energy” mean to you now, and what are you still unsure of?'],
    milestones: ['I can settle into my breath for a few minutes.', 'I have written about what I sense, and what else might explain it.'],
  },
  {
    n: 3,
    id: 'm3',
    title: 'Ground and boundary',
    theme: 'Grounding, centring, shielding and cleansing',
    intro:
      'Before raising anything, learn to come back down. Grounding, centring, shielding and cleansing are the habits that keep practice steady and safe, and they help on ordinary days too.',
    core: ['core-grounding-grounding-and-centring', 'core-grounding-shielding', 'core-grounding-cleansing-yourself', 'core-grounding-daily-life'],
    wheel: [],
    lens: { hellenic: ['hellenic-devotion-miasma-and-purification'] },
    practices: [
      {
        id: 'ground',
        kind: 'meditation',
        title: 'Ground and centre each day',
        detail: 'Ground and centre before and after your daily practice for the whole moon, until it comes without thinking.',
        links: [ritual('kitchen-solitary-grounding-centering')],
      },
      {
        id: 'cleanse',
        kind: 'ritual',
        title: 'Cleanse yourself and your space',
        detail: 'Once this moon, cleanse yourself and the place you practise, with water, salt, smoke or sound, whichever is safe where you live.',
        links: [ritual('kitchen-cleansing-floor-wash'), ritual('kitchen-threshold-salt-blessing')],
      },
    ],
    reflect: ['When did grounding help this moon, in practice or in ordinary life?', 'What boundaries do you want for your practice, and for yourself?'],
    milestones: ['I can ground and centre when I need to.', 'I have a way of cleansing myself and my space that I trust.'],
  },
  {
    n: 4,
    id: 'm4',
    title: 'Sacred space',
    theme: 'Opening and closing a place apart',
    intro:
      'Many paths mark out a place apart before a rite: a circle, a hallowing, a saining, a washing of hands. This moon you learn how and why, and open and close sacred space yourself.',
    core: ['core-sacred-space-what-and-why', 'core-sacred-space-purification', 'core-sacred-space-casting-a-circle', 'core-sacred-space-working-and-closing'],
    wheel: ['wheel-ritual-opening-the-space'],
    lens: {
      wicca: ['wicca-ritual-casting-the-circle', 'wicca-ritual-quarters-and-powers'],
      celtic: ['celtic-ritual-saining-and-sunwise'],
      norse: ['norse-ritual-hallowing-and-holy-space'],
      hellenic: ['hellenic-ritual-sacred-space', 'hellenic-ritual-procession-and-khernips'],
    },
    practices: [
      {
        id: 'open',
        kind: 'ritual',
        title: 'Open and close sacred space',
        detail: 'Three times this moon, open sacred space your track’s way, sit a while within it, and close it carefully. Write a line after each time.',
        links: [page('planner'), page('journal')],
      },
    ],
    reflect: ['How did the space feel once opened, and once closed?', 'Which way of making space suits you, and why?'],
    milestones: ['I can open and close sacred space without the book in my hand.'],
  },
  {
    n: 5,
    id: 'm5',
    title: 'The altar',
    theme: 'The altar, its tools and its care',
    intro:
      'An altar is a working place and a promise kept in sight. This moon you set one up with care, learn what tools are for (and that few are needed), and begin tending it.',
    core: ['core-altar-tools-what-an-altar-is', 'core-altar-tools-tools', 'core-altar-tools-cleansing-consecrating', 'core-altar-tools-caring-and-app'],
    wheel: ['wheel-devotion-the-seasonal-altar'],
    lens: {
      wicca: ['wicca-ritual-the-altar-and-tools'],
      celtic: ['celtic-ritual-fire-well-and-tree'],
      norse: ['norse-devotion-the-wights'],
      hellenic: ['hellenic-devotion-household-worship'],
    },
    practices: [
      {
        id: 'altar',
        kind: 'altar',
        title: 'Set and tend your altar',
        detail: 'Set your altar for the season, cleanse and bless what you place on it, and tend it once a week: dust, fresh water, a candle lit.',
        links: [page('altar')],
      },
      {
        id: 'consecrate',
        kind: 'ritual',
        title: 'Bless a tool',
        detail: 'Choose one tool or object, plain or precious, and cleanse and consecrate it for your practice.',
        links: [ritual('crystal-cleanse-and-charge')],
      },
    ],
    reflect: ['What is on your altar, and why each thing?', 'How does tending it change how you practise?'],
    milestones: ['I have an altar I tend, however small.', 'I know what my tools are for, and which I can do without.'],
  },
  {
    n: 6,
    id: 'm6',
    title: 'The moon’s month',
    theme: 'The moon and magical timing',
    intro:
      'This moon you watch the moon herself: her phases, her signs, and what each part of the month is traditionally good for. You also learn when timing matters, and when it really doesn’t.',
    core: ['core-moon-timing-phases', 'core-moon-timing-working-with-phases', 'core-moon-timing-sky-beyond', 'core-moon-timing-when-it-matters'],
    wheel: ['wheel-devotion-the-moon'],
    lens: {
      wicca: ['wicca-devotion-the-esbats'],
      hellenic: ['hellenic-devotion-the-monthly-cycle', 'hellenic-devotion-hekates-deipnon'],
    },
    practices: [
      {
        id: 'watch',
        kind: 'journal',
        title: 'Watch a whole moon',
        detail: 'Look at the moon, or read Today’s moon, each night you can, and note her phase and how you feel. By the end you will know her month by heart.',
        links: [page('moon'), page('cycle')],
      },
      {
        id: 'timing',
        kind: 'timing',
        title: 'Ask the timing advisor',
        detail: 'Choose something you mean to do this year and ask the timing advisor when it best fits the moon, the day and the hour. Write down why.',
        links: [page('timing')],
      },
    ],
    reflect: ['How did the moon’s month feel in your own life?', 'When does timing matter to you, and when would you rather just begin?'],
    milestones: ['I can name the moon’s phase on any night, and what it is traditionally good for.'],
  },
  {
    n: 7,
    id: 'm7',
    title: 'The turning year',
    theme: 'The festivals, and the land where you live',
    intro:
      'By now you will have kept a festival or two. This moon you learn where the year’s festivals come from, which parts are old and which are modern, and how to fit them to the land and seasons where you actually live.',
    core: ['core-moon-timing-seasons'],
    wheel: ['wheel-lore-the-turning-year', 'wheel-tradition-how-the-wheel-was-made', 'wheel-tradition-the-roots', 'wheel-tradition-your-land', 'wheel-devotion-the-land'],
    lens: {
      wicca: ['wicca-lore-the-wiccan-wheel', 'wheel-tradition-how-the-wheel-was-made', 'wheel-tradition-your-land'],
      celtic: ['celtic-lore-the-gaelic-year', 'celtic-devotion-land-and-the-good-neighbours', 'celtic-devotion-holy-wells-and-waters'],
      norse: ['norse-lore-the-heathen-year', 'norse-devotion-the-wights'],
      hellenic: ['hellenic-lore-the-attic-year'],
    },
    practices: [
      {
        id: 'walk',
        kind: 'offering',
        title: 'Walk your land',
        detail: 'Walk somewhere near home each week this moon, noticing what is growing, flowering or fading. Leave a small, harmless offering once.',
        links: [ritual('hedge-hearing-the-land-walk'), ritual('green-land-spirit-garden-offering')],
      },
      {
        id: 'calendar',
        kind: 'study',
        title: 'Your year on the calendar',
        detail: 'Look through the year’s festivals in your calendar and choose the ones you will keep. Add your own: a local fair, a first frost, a family day.',
        links: [page('calendar')],
      },
    ],
    reflect: ['Which festival so far felt most real to you, and why?', 'What does the year look like where you live, rather than in the books?'],
    milestones: ['I know which festivals I keep, and something true of where each comes from.'],
  },
  {
    n: 8,
    id: 'm8',
    title: 'Correspondences',
    theme: 'Colours, plants, stones, days and hours',
    intro:
      'Correspondences are the craft’s shorthand: what a colour, a herb, a stone or a day is said to suit. This moon you learn the common ones, how to use plants and oils safely, and how to build your own.',
    core: [
      'core-correspondences-what-they-are',
      'core-correspondences-colours',
      'core-correspondences-plants',
      'core-correspondences-stones',
      'core-correspondences-days-hours',
      'core-correspondences-safety',
      'core-correspondences-your-own',
    ],
    wheel: [],
    practices: [
      {
        id: 'library',
        kind: 'study',
        title: 'Know a few well',
        detail: 'Choose three herbs, three stones and three colours from the Living Library and come to know them: handle, smell or look at them, and note what they mean to you.',
        links: [page('library'), library('herb', 'rosemary')],
      },
      {
        id: 'own',
        kind: 'journal',
        title: 'Your own correspondences',
        detail: 'Begin a page of your own correspondences in your Grimoire, with where each one came from.',
        links: [page('grimoire')],
      },
    ],
    reflect: ['Which correspondences ring true for you, and which don’t?', 'Where will you check safety before using a plant, oil or incense?'],
    milestones: ['I know a handful of correspondences well, and check safety first.'],
  },
  {
    n: 9,
    id: 'm9',
    title: 'Divination',
    theme: 'Reading cards, runes and signs',
    intro:
      'Divination is a conversation, not a verdict. This moon you learn a system, draw daily, keep a reading journal, and think about what you will and won’t read for.',
    core: ['core-divination-what-it-is', 'core-divination-tarot-deck', 'core-divination-tarot-reading', 'core-divination-other-systems', 'core-divination-daily-draw', 'core-divination-ethics'],
    wheel: [],
    lens: {
      celtic: ['celtic-initiation-ogham'],
      norse: ['norse-initiation-the-runes', 'norse-initiation-reading-the-runes'],
    },
    practices: [
      {
        id: 'daily',
        kind: 'divination',
        title: 'A daily draw',
        detail: 'Draw one card, rune or stave each morning this moon, write it down, and look back at it in the evening.',
        links: [page('divination')],
      },
      {
        id: 'spread',
        kind: 'divination',
        title: 'A reading for the year so far',
        detail: 'Lay a three-card spread on where you have come from, where you are and what this year is asking of you. Keep it to read again at the end.',
        links: [page('divination')],
      },
    ],
    reflect: ['What did your daily draws show you about yourself, rather than the future?', 'What will you read for, and what will you leave alone?'],
    milestones: ['I can read a simple spread and keep a record of it.'],
  },
  {
    n: 10,
    id: 'm10',
    title: 'Your own rite',
    theme: 'The shape of a rite, written and kept',
    intro:
      'You have opened space, tended an altar and kept festivals. This moon you learn the shape beneath a whole rite, and write and keep one of your own from beginning to end.',
    core: ['core-ritual-coven-anatomy', 'core-ritual-coven-writing'],
    wheel: ['wheel-ritual-shape-of-a-rite', 'wheel-ritual-welcoming-the-powers', 'wheel-ritual-seasonal-heart', 'wheel-ritual-closing-and-after', 'wheel-ritual-a-complete-rite'],
    lens: {
      wicca: ['wicca-ritual-shape-of-a-wiccan-rite', 'wicca-ritual-cakes-and-ale', 'wicca-ritual-a-complete-esbat'],
      celtic: ['celtic-ritual-shape-of-a-rite', 'celtic-ritual-offering-and-hospitality', 'celtic-ritual-prayer-and-praise', 'celtic-ritual-a-complete-rite'],
      norse: ['norse-ritual-the-blot', 'norse-ritual-sumbel'],
      hellenic: ['hellenic-ritual-shape-of-a-rite', 'hellenic-ritual-prayer', 'hellenic-ritual-libation-and-offering', 'hellenic-ritual-closing-and-disposal', 'hellenic-ritual-a-complete-rite'],
    },
    practices: [
      {
        id: 'write',
        kind: 'ritual',
        title: 'Write a rite',
        detail: 'Write a rite of your own in the ritual planner, for this moon’s full moon or a festival near it, using the shape from the lessons.',
        links: [page('planner'), page('premade')],
      },
      {
        id: 'keep',
        kind: 'journal',
        title: 'Keep it, then write it up',
        detail: 'Keep your rite, and write in your ritual journal what worked, what felt awkward and what you would change.',
        links: [page('journal')],
      },
    ],
    reflect: ['What did writing your own rite teach you that reading others’ didn’t?', 'What would you change next time?'],
    milestones: ['I have written and kept a rite of my own from beginning to end.'],
  },
  {
    n: 11,
    id: 'm11',
    title: 'Spellcraft',
    theme: 'Raising energy, intention and spells',
    intro:
      'A spell is intention given a shape and sent out. This moon you learn the arc of a working, the forms spells take, their ethics, and how to look back honestly on what happened.',
    core: [
      'core-raising-the-arc',
      'core-raising-methods',
      'core-raising-directing-and-releasing',
      'core-spellcraft-intention',
      'core-spellcraft-structure',
      'core-spellcraft-forms',
      'core-spellcraft-ethics',
      'core-spellcraft-results',
    ],
    wheel: [],
    lens: {
      wicca: ['wicca-tradition-ethics'],
      norse: ['norse-initiation-seidr-and-galdr', 'norse-initiation-wyrd-and-the-oath'],
      celtic: ['celtic-initiation-triads-and-learning'],
    },
    practices: [
      {
        id: 'spell',
        kind: 'spell',
        title: 'Build a spell',
        detail: 'Build one small, kind spell for yourself or your home in the spell builder, with a clear intention you would be glad to see answered.',
        links: [page('spell')],
      },
      {
        id: 'time',
        kind: 'timing',
        title: 'Time it well',
        detail: 'Ask the timing advisor for a good moment, then keep the spell then, or say why you chose another time.',
        links: [page('timing')],
      },
      {
        id: 'look',
        kind: 'journal',
        title: 'Look back honestly',
        detail: 'Set a day to look back on the spell in your journal, and when it comes, answer “Did it work?” without flattering yourself.',
        links: [page('journal')],
      },
    ],
    reflect: ['What did you ask for, and how did you decide it was right to ask?', 'How will you know, honestly, whether a working worked?'],
    milestones: ['I can shape a working from intention to grounding, and look back on it honestly.'],
  },
  {
    n: 12,
    id: 'm12',
    title: 'Devotion',
    theme: 'The powers, offerings and the ancestors',
    intro:
      'Relationship is the heart of most paths: with gods or powers, the land, the beloved dead. This moon you learn how to begin and keep such a relationship, with offerings and with discernment.',
    core: [],
    wheel: ['wheel-tradition-the-powers', 'wheel-devotion-offerings', 'wheel-devotion-ancestors', 'wheel-devotion-discernment'],
    lens: {
      wicca: ['wicca-tradition-the-goddess-and-god', 'wicca-devotion-the-goddess', 'wicca-devotion-the-god', 'wicca-devotion-offerings-and-the-dead', 'wicca-devotion-discernment'],
      celtic: ['celtic-tradition-the-gods', 'celtic-devotion-coming-to-know-a-god', 'celtic-devotion-ancestors', 'celtic-devotion-discernment'],
      norse: ['norse-devotion-the-gods', 'norse-devotion-coming-to-know-a-god', 'norse-devotion-ancestors-and-disir'],
      hellenic: ['hellenic-tradition-values', 'hellenic-tradition-the-theoi', 'hellenic-devotion-offerings', 'hellenic-devotion-ancestors-and-the-dead', 'hellenic-devotion-discernment'],
    },
    practices: [
      {
        id: 'offer',
        kind: 'offering',
        title: 'Regular offerings',
        detail: 'Make a simple offering at your altar each week this moon: water, bread, a flower, a candle, words. Dispose of it respectfully.',
        links: [page('altar')],
      },
      {
        id: 'ancestors',
        kind: 'devotion',
        title: 'Remember your dead',
        detail: 'Spend an evening with your beloved dead, of blood or of choice: a candle, a photograph, their names spoken.',
        links: [ritual('hedge-ancestor-candle-evening'), page('ancestors')],
      },
      {
        id: 'patron',
        kind: 'study',
        title: 'Who you are drawn to',
        detail: 'If a god or power has been on your mind, read about patron deities and keep them in My deities. There is no hurry, and no need to have one.',
        links: [page('patron'), page('journeys')],
      },
    ],
    reflect: ['Who or what have you come to honour this year, and how?', 'How do you tell a real call from a wish, and does it matter to you?'],
    milestones: ['I make offerings regularly, and know how to dispose of them well.', 'I can tell what I know from what I hope.'],
  },
  {
    n: 13,
    id: 'm13',
    title: 'The dedication',
    theme: 'Preparing your words, your token and your day',
    intro:
      'The short thirteenth moon leads to the day itself, a year and a day after you began. Read back through your book, decide honestly whether to dedicate, and if you will, prepare your words, your token and your rite.',
    core: [],
    wheel: ['wheel-dedication-what-dedication-means', 'wheel-dedication-preparing', 'wheel-dedication-the-rite', 'wheel-dedication-after'],
    lens: {
      wicca: ['wicca-dedication-what-dedication-means', 'wicca-dedication-preparing', 'wicca-dedication-the-rite', 'wicca-dedication-after'],
      celtic: ['celtic-dedication-what-dedication-means', 'celtic-dedication-preparing', 'celtic-dedication-the-rite', 'celtic-dedication-after'],
      norse: ['norse-dedication-what-dedication-means', 'norse-dedication-preparing', 'norse-dedication-the-rite'],
      hellenic: ['hellenic-dedication-what-dedication-means', 'hellenic-dedication-preparing', 'hellenic-dedication-the-rite', 'hellenic-dedication-after'],
    },
    practices: [
      {
        id: 'reread',
        kind: 'journal',
        title: 'Read your year back',
        detail: 'Read back through your Grimoire page from the first moon, your reflections and your journal. Notice what has changed.',
        links: [page('grimoire'), page('journal')],
      },
      {
        id: 'words',
        kind: 'ritual',
        title: 'Write your words and choose your token',
        detail: 'Write the words of your dedication in your own voice, plain and true, and choose a token to bless: a ring, a cord, a stone, a pendant.',
        links: [page('journeys')],
      },
    ],
    reflect: ['Looking back over the year, what has changed in you?', 'Do you want to dedicate, wait, or simply carry on learning? Any answer is a good one.'],
    milestones: ['I have read my year back.', 'I know whether I am ready to dedicate, and I am at peace with my answer.'],
  },
];

export const moonById = (id: string): Moon | undefined => MOONS.find((m) => m.id === id);

/**
 * The lessons the year uses, by id, with their titles and minutes as the
 * courses have them (checked by the tests), so a moon's list shows offline
 * before the courses are fetched.
 */
export const READINGS: Record<string, { title: string; minutes: number }> = {
  'core-welcome-grimoire-and-journal': { title: 'Keeping your Grimoire and journal', minutes: 15 },
  'core-welcome-ethics-and-safety': { title: 'Consent, ethics and safety', minutes: 20 },
  'core-welcome-mental-health': { title: 'Looking after your mind', minutes: 15 },
  'core-energy-what-is-energy': { title: 'What is energy?', minutes: 20 },
  'core-energy-breath-awareness': { title: 'Breath awareness', minutes: 20 },
  'core-energy-body-scan': { title: 'The body scan', minutes: 25 },
  'core-energy-hand-sensing': { title: 'Sensing with your hands', minutes: 25 },
  'core-energy-perception-journal': { title: 'Keeping a perception journal', minutes: 15 },
  'core-grounding-grounding-and-centring': { title: 'Grounding and centring', minutes: 25 },
  'core-grounding-shielding': { title: 'Shielding', minutes: 20 },
  'core-grounding-cleansing-yourself': { title: 'Cleansing yourself', minutes: 25 },
  'core-grounding-daily-life': { title: 'Quick versions for daily life', minutes: 15 },
  'core-raising-the-arc': { title: 'The arc of a working', minutes: 20 },
  'core-raising-methods': { title: 'Ways to raise energy', minutes: 30 },
  'core-raising-directing-and-releasing': { title: 'Directing, releasing and grounding', minutes: 30 },
  'core-sacred-space-what-and-why': { title: 'What sacred space is, and why', minutes: 20 },
  'core-sacred-space-purification': { title: 'Purifying yourself and the space', minutes: 25 },
  'core-sacred-space-casting-a-circle': { title: 'Casting a simple circle and calling the quarters', minutes: 30 },
  'core-sacred-space-working-and-closing': { title: 'Working inside, leaving, and closing', minutes: 25 },
  'core-altar-tools-what-an-altar-is': { title: 'What an altar is for, and setting one up', minutes: 25 },
  'core-altar-tools-tools': { title: 'Tools and their uses', minutes: 25 },
  'core-altar-tools-cleansing-consecrating': { title: 'Cleansing and consecrating', minutes: 25 },
  'core-altar-tools-caring-and-app': { title: 'Caring for your altar, and the app\'s altar', minutes: 20 },
  'core-correspondences-what-they-are': { title: 'What correspondences are', minutes: 20 },
  'core-correspondences-colours': { title: 'Colours', minutes: 20 },
  'core-correspondences-plants': { title: 'Twelve common plants', minutes: 30 },
  'core-correspondences-stones': { title: 'Seven common stones', minutes: 25 },
  'core-correspondences-days-hours': { title: 'Days of the week and planetary hours', minutes: 20 },
  'core-correspondences-safety': { title: 'Herb, oil and incense safety', minutes: 25 },
  'core-correspondences-your-own': { title: 'Building your own correspondences', minutes: 20 },
  'core-moon-timing-phases': { title: 'The Moon’s phases', minutes: 20 },
  'core-moon-timing-working-with-phases': { title: 'Working with the phases', minutes: 25 },
  'core-moon-timing-sky-beyond': { title: 'Signs, void-of-course and eclipses', minutes: 15 },
  'core-moon-timing-seasons': { title: 'The Sun’s year and the seasons', minutes: 20 },
  'core-moon-timing-when-it-matters': { title: 'When timing matters, and when it doesn’t', minutes: 15 },
  'core-divination-what-it-is': { title: 'What divination is', minutes: 20 },
  'core-divination-tarot-deck': { title: 'The tarot deck', minutes: 30 },
  'core-divination-tarot-reading': { title: 'Reading the cards: a three-card spread', minutes: 30 },
  'core-divination-other-systems': { title: 'Runes, ogham, pendulum and scrying', minutes: 25 },
  'core-divination-daily-draw': { title: 'The daily draw and your reading journal', minutes: 15 },
  'core-divination-ethics': { title: 'Reading for others, ethically', minutes: 20 },
  'core-spellcraft-intention': { title: 'What a spell is, and the heart of it: intention', minutes: 20 },
  'core-spellcraft-structure': { title: 'The structure of a spell', minutes: 30 },
  'core-spellcraft-forms': { title: 'Common forms of spell', minutes: 30 },
  'core-spellcraft-ethics': { title: 'The ethics of spellcraft', minutes: 25 },
  'core-spellcraft-results': { title: 'Recording results, and when nothing happens', minutes: 20 },
  'core-ritual-coven-anatomy': { title: 'The anatomy of a ritual', minutes: 25 },
  'core-ritual-coven-writing': { title: 'Writing a ritual', minutes: 30 },

  'wheel-tradition-what-it-is': { title: 'What an eclectic Wheel practice is', minutes: 15 },
  'wheel-tradition-how-the-wheel-was-made': { title: 'How the Wheel was assembled', minutes: 18 },
  'wheel-tradition-the-roots': { title: 'The many roots of the festivals', minutes: 18 },
  'wheel-tradition-the-powers': { title: 'The powers you may honour, and borrowing well', minutes: 16 },
  'wheel-tradition-your-land': { title: 'Your land, your seasons, and the southern hemisphere', minutes: 16 },
  'wheel-seeker-a-first-practice': { title: 'Your first seasonal walk and threshold candle', minutes: 20 },
  'wheel-ritual-shape-of-a-rite': { title: 'The shape of a seasonal rite', minutes: 15 },
  'wheel-ritual-opening-the-space': { title: 'Cleansing and opening sacred space, several ways', minutes: 20 },
  'wheel-ritual-welcoming-the-powers': { title: 'Welcoming the powers', minutes: 18 },
  'wheel-ritual-seasonal-heart': { title: 'The seasonal heart, bread and drink', minutes: 16 },
  'wheel-ritual-closing-and-after': { title: 'Closing, grounding and offerings', minutes: 15 },
  'wheel-ritual-a-complete-rite': { title: 'A complete seasonal rite', minutes: 25 },
  'wheel-devotion-daily-practice': { title: 'A daily seasonal practice', minutes: 15 },
  'wheel-devotion-the-seasonal-altar': { title: 'The seasonal altar', minutes: 15 },
  'wheel-devotion-the-land': { title: 'The land and its spirits', minutes: 18 },
  'wheel-devotion-offerings': { title: 'Offerings in practice', minutes: 15 },
  'wheel-devotion-ancestors': { title: 'The ancestors and the beloved dead', minutes: 16 },
  'wheel-devotion-the-moon': { title: 'The moon between festivals', minutes: 15 },
  'wheel-devotion-discernment': { title: 'Discernment and relationship', minutes: 18 },
  'wheel-lore-the-turning-year': { title: 'The turning year: dates, names and keeping a festival', minutes: 16 },
  'wheel-lore-samhain': { title: 'Samhain', minutes: 18 },
  'wheel-lore-yule': { title: 'Yule', minutes: 18 },
  'wheel-lore-imbolc': { title: 'Imbolc', minutes: 18 },
  'wheel-lore-ostara': { title: 'The spring equinox', minutes: 16 },
  'wheel-lore-beltane': { title: 'Beltane', minutes: 18 },
  'wheel-lore-litha': { title: 'Midsummer', minutes: 17 },
  'wheel-lore-lammas': { title: 'Lughnasadh and Lammas', minutes: 17 },
  'wheel-lore-mabon': { title: 'The autumn equinox', minutes: 16 },
  'wheel-dedication-what-dedication-means': { title: 'What dedication means', minutes: 15 },
  'wheel-dedication-preparing': { title: 'Preparing for dedication', minutes: 16 },
  'wheel-dedication-the-rite': { title: 'The shape of the dedication rite', minutes: 16 },
  'wheel-dedication-after': { title: 'After dedication', minutes: 15 },

  'wicca-seeker-wicca-in-brief': { title: 'Wicca in brief', minutes: 12 },
  'wicca-tradition-what-wicca-is': { title: 'What Wicca is', minutes: 16 },
  'wicca-tradition-history': { title: 'How Wicca began: an honest history', minutes: 20 },
  'wicca-tradition-the-goddess-and-god': { title: 'The Goddess and the God', minutes: 18 },
  'wicca-tradition-ethics': { title: 'Wiccan ethics: the Rede, the Threefold Law and beyond', minutes: 16 },
  'wicca-ritual-shape-of-a-wiccan-rite': { title: 'The shape of a Wiccan rite', minutes: 15 },
  'wicca-ritual-the-altar-and-tools': { title: 'The Wiccan altar and its tools', minutes: 16 },
  'wicca-ritual-casting-the-circle': { title: 'Casting the Wiccan circle', minutes: 18 },
  'wicca-ritual-quarters-and-powers': { title: 'The quarters, the Goddess and the God', minutes: 18 },
  'wicca-ritual-cakes-and-ale': { title: 'Cakes and ale', minutes: 14 },
  'wicca-ritual-a-complete-esbat': { title: 'A complete esbat, from start to finish', minutes: 20 },
  'wicca-devotion-daily-practice': { title: 'A daily Wiccan practice', minutes: 15 },
  'wicca-devotion-the-esbats': { title: 'The esbats and the moon’s month', minutes: 16 },
  'wicca-devotion-the-goddess': { title: 'Coming to know the Goddess', minutes: 15 },
  'wicca-devotion-the-god': { title: 'Coming to know the God', minutes: 15 },
  'wicca-devotion-offerings-and-the-dead': { title: 'Offerings, the beloved dead and the Summerland', minutes: 15 },
  'wicca-devotion-discernment': { title: 'Discernment: telling real from wishful', minutes: 14 },
  'wicca-lore-the-wiccan-wheel': { title: 'The Wiccan Wheel: the sacred story of the year', minutes: 16 },
  'wicca-lore-samhain': { title: 'Samhain in Wicca', minutes: 15 },
  'wicca-lore-yule': { title: 'Yule in Wicca', minutes: 15 },
  'wicca-lore-imbolc': { title: 'Imbolc in Wicca', minutes: 15 },
  'wicca-lore-ostara': { title: 'The spring equinox in Wicca', minutes: 15 },
  'wicca-lore-beltane': { title: 'Beltane in Wicca', minutes: 15 },
  'wicca-lore-litha': { title: 'Midsummer in Wicca', minutes: 15 },
  'wicca-lore-lammas': { title: 'Lammas in Wicca', minutes: 15 },
  'wicca-lore-mabon': { title: 'The autumn equinox in Wicca', minutes: 15 },
  'wicca-dedication-what-dedication-means': { title: 'What dedication means in Wicca', minutes: 15 },
  'wicca-dedication-preparing': { title: 'Preparing for dedication', minutes: 15 },
  'wicca-dedication-the-rite': { title: 'The shape of the dedication rite', minutes: 15 },
  'wicca-dedication-after': { title: 'After dedication', minutes: 14 },

  'celtic-seeker-celtic-practice-in-brief': { title: 'Celtic paganism in brief', minutes: 13 },
  'celtic-tradition-who-were-the-celts': { title: 'Who were the Celts? Languages, peoples and two streams', minutes: 15 },
  'celtic-tradition-sources-and-their-limits': { title: 'The sources and their limits', minutes: 17 },
  'celtic-tradition-the-gods': { title: 'The gods of the two streams', minutes: 17 },
  'celtic-tradition-living-cultures': { title: 'Living languages, living cultures: practising with respect', minutes: 15 },
  'celtic-ritual-shape-of-a-rite': { title: 'The shape of a Celtic rite', minutes: 15 },
  'celtic-ritual-saining-and-sunwise': { title: 'Saining, sunwise and the threshold', minutes: 15 },
  'celtic-ritual-fire-well-and-tree': { title: 'Fire, well and tree: the sacred centre', minutes: 15 },
  'celtic-ritual-offering-and-hospitality': { title: 'Offering and hospitality', minutes: 15 },
  'celtic-ritual-prayer-and-praise': { title: 'Prayer, praise and the spoken word', minutes: 15 },
  'celtic-ritual-a-complete-rite': { title: 'A complete rite, from start to finish, with an omen', minutes: 18 },
  'celtic-devotion-the-hearth': { title: 'The hearth: a daily practice of kindling and smooring', minutes: 15 },
  'celtic-devotion-land-and-the-good-neighbours': { title: 'The land, the Otherworld and the good neighbours', minutes: 16 },
  'celtic-devotion-ancestors': { title: 'The ancestors and the dead', minutes: 16 },
  'celtic-devotion-holy-wells-and-waters': { title: 'Holy wells, waters and offerings to the land', minutes: 16 },
  'celtic-devotion-coming-to-know-a-god': { title: 'Coming to know a god', minutes: 17 },
  'celtic-devotion-discernment': { title: 'Discernment: the sources, experience and the gods', minutes: 15 },
  'celtic-lore-the-gaelic-year': { title: 'The Gaelic year: four quarter days', minutes: 16 },
  'celtic-lore-samhain_gaelic': { title: 'Samhain (Oíche Shamhna)', minutes: 17 },
  'celtic-lore-la_fheile_bride': { title: 'Imbolc (Lá Fhéile Bríde)', minutes: 17 },
  'celtic-lore-bealtaine': { title: 'Bealtaine', minutes: 17 },
  'celtic-lore-lughnasadh': { title: 'Lughnasadh', minutes: 17 },
  'celtic-initiation-ogham': { title: 'Ogham: the stones, the letters and divination', minutes: 16 },
  'celtic-initiation-triads-and-learning': { title: 'Triads, memory and the poet’s way of learning', minutes: 15 },
  'celtic-dedication-what-dedication-means': { title: 'What dedication means in this tradition', minutes: 14 },
  'celtic-dedication-preparing': { title: 'Preparing for dedication', minutes: 15 },
  'celtic-dedication-the-rite': { title: 'The shape of the dedication rite', minutes: 14 },
  'celtic-dedication-after': { title: 'After dedication', minutes: 13 },

  'norse-seeker-heathenry-in-brief': { title: 'Heathenry in brief', minutes: 13 },
  'norse-seeker-a-first-practice': { title: 'A first practice: a cup for the gods, the land and the ancestors', minutes: 13 },
  'norse-tradition-peoples-and-languages': { title: 'Who were the Norse? Peoples, languages and the conversion', minutes: 14 },
  'norse-tradition-sources-and-their-limits': { title: 'The sources and their limits', minutes: 16 },
  'norse-tradition-symbols-and-misuse': { title: 'The gods belong to everyone: misuse, symbols and Declaration 127', minutes: 15 },
  'norse-ritual-the-blot': { title: 'The blót: a gift to the gods', minutes: 16 },
  'norse-ritual-sumbel': { title: 'Sumbel: the horn, the rounds and the weight of words', minutes: 16 },
  'norse-ritual-hallowing-and-holy-space': { title: 'Hallowing and holy space: vé, hörgr, hof and the hearth', minutes: 15 },
  'norse-devotion-the-gods': { title: 'The gods: Æsir, Vanir and the giants', minutes: 17 },
  'norse-devotion-the-wights': { title: 'The wights of land and house: courtesy, not summoning', minutes: 15 },
  'norse-devotion-ancestors-and-disir': { title: 'The ancestors and the dísir', minutes: 15 },
  'norse-devotion-coming-to-know-a-god': { title: 'Coming to know a god: gift for gift, discernment and the hard gods', minutes: 15 },
  'norse-lore-the-heathen-year': { title: 'The Heathen year: summer, winter and the great blóts', minutes: 16 },
  'norse-lore-thorrablot': { title: 'Þorrablót: the midwinter month', minutes: 15 },
  'norse-lore-disablot': { title: 'Dísablót: the guardian mothers', minutes: 15 },
  'norse-lore-sigrblot': { title: 'Sigrblót: summer’s start and the blót for victory', minutes: 15 },
  'norse-lore-midsummer': { title: 'Midsummer: the light at its height', minutes: 15 },
  'norse-lore-haustblot': { title: 'Haustblót: thanks for the harvest', minutes: 15 },
  'norse-lore-vetrnaetur': { title: 'Winter Nights: the start of winter, the álfar and the dísir', minutes: 16 },
  'norse-lore-jol': { title: 'Yule (Jól): the great midwinter feast', minutes: 17 },
  'norse-initiation-the-runes': { title: 'The runes: letters, inscriptions and the rune poems', minutes: 17 },
  'norse-initiation-reading-the-runes': { title: 'Reading the runes: what is old, what is modern, and the app’s draws', minutes: 16 },
  'norse-initiation-wyrd-and-the-oath': { title: 'Wyrd, the Norns and the oath', minutes: 16 },
  'norse-initiation-seidr-and-galdr': { title: 'Seiðr and galdr: what the sources show, and modern practice', minutes: 17 },
  'norse-dedication-what-dedication-means': { title: 'What dedication means in this tradition', minutes: 14 },
  'norse-dedication-preparing': { title: 'Preparing for dedication: your words, your token and your gift', minutes: 14 },
  'norse-dedication-the-rite': { title: 'The dedication rite, and after', minutes: 15 },

  'hellenic-seeker-hellenic-practice-in-brief': { title: 'Hellenic practice in brief', minutes: 12 },
  'hellenic-tradition-what-is-hellenismos': { title: 'What Hellenismos is', minutes: 15 },
  'hellenic-tradition-history-and-sources': { title: 'History and sources', minutes: 20 },
  'hellenic-tradition-values': { title: 'Eusebeia, kharis and xenia', minutes: 15 },
  'hellenic-tradition-the-theoi': { title: 'The theoi: meeting the gods', minutes: 20 },
  'hellenic-ritual-shape-of-a-rite': { title: 'The shape of a Hellenic rite', minutes: 15 },
  'hellenic-ritual-procession-and-khernips': { title: 'Procession and khernips', minutes: 15 },
  'hellenic-ritual-sacred-space': { title: 'Sacred space without a circle', minutes: 15 },
  'hellenic-ritual-prayer': { title: 'Greek prayer', minutes: 15 },
  'hellenic-ritual-libation-and-offering': { title: 'Libation and offering', minutes: 20 },
  'hellenic-ritual-closing-and-disposal': { title: 'Closing a rite and disposing of offerings', minutes: 15 },
  'hellenic-ritual-a-complete-rite': { title: 'A complete Hellenic rite', minutes: 30 },
  'hellenic-devotion-household-worship': { title: 'Household worship', minutes: 20 },
  'hellenic-devotion-daily-practice': { title: 'Daily practice', minutes: 15 },
  'hellenic-devotion-the-monthly-cycle': { title: 'The monthly cycle: Noumenia and Agathos Daimon', minutes: 15 },
  'hellenic-devotion-hekates-deipnon': { title: 'Hekate\'s Deipnon and crossroads practice', minutes: 25 },
  'hellenic-devotion-offerings': { title: 'Offerings in practice', minutes: 15 },
  'hellenic-devotion-ancestors-and-the-dead': { title: 'Ancestors and the dead', minutes: 15 },
  'hellenic-devotion-miasma-and-purification': { title: 'Miasma and purification', minutes: 15 },
  'hellenic-devotion-discernment': { title: 'Discernment', minutes: 20 },
  'hellenic-lore-the-attic-year': { title: 'The Attic year', minutes: 15 },
  'hellenic-lore-kronia': { title: 'Kronia', minutes: 15 },
  'hellenic-lore-panathenaia': { title: 'Panathenaia', minutes: 15 },
  'hellenic-lore-eleusinia': { title: 'The Eleusinian Mysteries', minutes: 20 },
  'hellenic-lore-pyanepsia': { title: 'Pyanepsia', minutes: 15 },
  'hellenic-lore-thesmophoria': { title: 'Thesmophoria', minutes: 15 },
  'hellenic-lore-haloa': { title: 'Haloa', minutes: 15 },
  'hellenic-lore-lenaia': { title: 'Lenaia', minutes: 15 },
  'hellenic-lore-anthesteria': { title: 'Anthesteria', minutes: 20 },
  'hellenic-lore-dionysia': { title: 'City Dionysia', minutes: 15 },
  'hellenic-lore-mounichia': { title: 'Mounichia', minutes: 15 },
  'hellenic-lore-thargelia': { title: 'Thargelia', minutes: 15 },
  'hellenic-lore-plynteria': { title: 'Plynteria', minutes: 15 },
  'hellenic-lore-skira': { title: 'Skira', minutes: 15 },
  'hellenic-dedication-what-dedication-means': { title: 'What dedication means', minutes: 15 },
  'hellenic-dedication-preparing': { title: 'Preparing for dedication', minutes: 15 },
  'hellenic-dedication-the-rite': { title: 'The shape of the dedication rite', minutes: 15 },
  'hellenic-dedication-after': { title: 'After dedication', minutes: 15 },
};

/** A festival's lesson in a set, when the set has one ('wheel-lore-samhain'). */
export function festivalLesson(set: string, base: string): string | null {
  const id = `${set}-lore-${base}`;
  return READINGS[id] ? id : null;
}

/** The day itself: what the closing rite asks, for every track. */
export const THE_DAY = {
  title: 'The day of dedication',
  intro:
    'A year and a day after you began. If you have chosen to dedicate, keep your rite today, or on a day near it that means more to you: a festival, a full moon, a birthday. It is a promise you make yourself, to your path and to any powers you honour. It is not an initiation, and nothing here stands in for one.',
  wait: 'If you are not ready, that is an honest answer and a good one. Carry on learning, and dedicate when it is true; the year stays here.',
  after: 'Afterwards, write down what you said and how it felt, and keep your token where you will see it. Many people renew their dedication each year on the same day.',
};
