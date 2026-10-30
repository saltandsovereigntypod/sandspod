// Cycle & Moon: the words. The inner seasons and what suits each, journaling
// prompts, the optional archetype lens, the four moon patterns (named as the
// folk and modern-spiritual frameworks they are), moon-time folk notes, and
// practice suggestions that open real things in the app: premade workings
// (rituals/premade), Living Library entries and divination spreads. Pure.

import type { MoonPattern, MoonQuarter, Season } from './types.ts';

/** The seasons' colours on the wheel, the same in the app and on the website. */
export const SEASON_COLOURS: Record<Season, string> = { winter: '#9b3b4a', spring: '#6f8465', summer: '#e2c36d', autumn: '#b9734a' };
export const PATTERN_COLOURS: Record<MoonPattern, string> = { white: '#f4ecd8', pink: '#d99aa8', red: '#c2414f', purple: '#9b7cc4' };

export const NOT_MEDICAL =
  'Cycle & Moon is for reflection and practice, not medical advice. It doesn’t predict fertility and must never be used as contraception. See a doctor or nurse for pain, very heavy bleeding, bleeding after menopause, or cycles that are very irregular or suddenly change.';

export const FRAMEWORK_NOTE =
  'The inner seasons and the moon patterns come from modern spiritual and folk practice, not biology. The moon doesn’t control anyone’s body; these are ways of noticing and meaning-making, and people move between them.';

export type SeasonInfo = {
  title: string;
  /** Where it falls. */
  when: string;
  /** How it may feel, gently. */
  feel: string;
  /** What kind of practice suits it. */
  practice: string;
  prompts: string[];
};

export const SEASON_INFO: Record<Season, SeasonInfo> = {
  winter: {
    title: 'Inner winter',
    when: 'While you bleed, or the dark of the moon.',
    feel: 'Often a time to draw in: quieter, more inward, closer to dreams and the edges of things.',
    practice: 'Rest, listening and divination: scrying, a single card, dream work, a cleansing bath. Let the work be small.',
    prompts: ['What am I ready to let go of this cycle?', 'What did my dreams bring this week?', 'If I could rest from one thing, what would it be?', 'What does my body ask of me today?'],
  },
  spring: {
    title: 'Inner spring',
    when: 'After the bleed, or the waxing moon.',
    feel: 'Often lighter and curious, with energy returning and room for new ideas.',
    practice: 'Beginnings: setting intentions, seed and growth spells, learning something new, planning a working.',
    prompts: ['What wants to begin?', 'What am I curious about right now?', 'Which small step would honour an intention?', 'Where do I feel energy returning?'],
  },
  summer: {
    title: 'Inner summer',
    when: 'Mid-cycle, or the full moon.',
    feel: 'Often outward and bright: a time for people, voice and confidence.',
    practice: 'Outward magic: manifestation, charging, love and confidence workings, ritual with others, moon water.',
    prompts: ['What do I want to say out loud?', 'Who would I like to share my practice with?', 'What is flowering in my life?', 'What am I proud of this cycle?'],
  },
  autumn: {
    title: 'Inner autumn',
    when: 'Before the bleed, or the waning moon.',
    feel: 'Often sharper and more honest, sometimes tender: a time when what isn’t working becomes clear.',
    practice: 'Release and banishing: cord cutting, cleansing the house, protection, clearing out, saying no.',
    prompts: ['What is no longer working?', 'Where do I need a boundary?', 'What would I like to clear before my winter?', 'What truth have I been avoiding?'],
  },
};

/** The archetype lens: off unless chosen. Traditional names, with plainer ones beside them for anyone who'd rather. */
export const ARCHETYPES: Record<Season, { name: string; plain: string; line: string }> = {
  winter: { name: 'Crone', plain: 'the Elder', line: 'Wisdom, endings and seeing clearly in the dark.' },
  spring: { name: 'Maiden', plain: 'the Seeker', line: 'Fresh starts, play and curiosity.' },
  summer: { name: 'Mother', plain: 'the Nurturer', line: 'Giving, making, holding and creating.' },
  autumn: { name: 'Enchantress or Wild Woman', plain: 'the Wild One', line: 'Truth-telling, instinct and the untamed edge.' },
};

export const ARCHETYPE_NOTE =
  'The Maiden, Mother, Enchantress (or Wild Woman) and Crone come from modern goddess spirituality. They’re one lens among many, and the plainer names beside them suit anyone who’d rather not use gendered ones.';

export type PatternInfo = { name: string; when: string; line: string };

export const PATTERN_INFO: Record<MoonPattern, PatternInfo> = {
  white: {
    name: 'White Moon',
    when: 'A bleed that begins near the new or dark moon.',
    line: 'In modern moon lore, a time linked with turning inward and renewal: the bleed and the dark of the moon resting together.',
  },
  pink: {
    name: 'Pink Moon',
    when: 'A bleed that begins under a waxing moon.',
    line: 'Said to be a time of moving towards something new, often during change or growth.',
  },
  red: {
    name: 'Red Moon',
    when: 'A bleed that begins near the full moon.',
    line: 'Linked in this lore with outward energy turned to creativity, healing or teaching; sometimes called the wise woman’s or healer’s cycle.',
  },
  purple: {
    name: 'Purple Moon',
    when: 'A bleed that begins under a waning moon.',
    line: 'Said to be a time of release and deep inner work, often during transition.',
  },
};

export const PATTERN_NOTE =
  'These four names belong to modern, popular moon lore, not to science: studies haven’t found that cycles follow the moon. Many people move from one pattern to another over months and years. Notice it if it means something to you, and let it go if it doesn’t.';

export const MOON_ONLY_NOTE =
  'Following the moon alone, for anyone who doesn’t bleed (after menopause or a hysterectomy, while pregnant, or for any reason): the dark of the moon becomes your inner winter, the waxing moon your spring, the full moon your summer and the waning moon your autumn.';

/** Moon blood and moon time: folk notes, said with care. */
export const FOLK_NOTES: { title: string; body: string }[] = [
  {
    title: 'Moon time',
    body: 'Many people call the days of bleeding their moon time, and keep them a little apart: resting, dreaming, writing, praying or simply doing less. There’s no wrong way to keep it, and no need to keep it at all.',
  },
  {
    title: 'Moon lodges and red tents',
    body: 'Some Indigenous nations keep moon lodges and their own teachings about moon time. Those teachings and ceremonies belong to those nations and are passed on within them; they aren’t ours to copy or sell. The modern “red tent” is a different, recent gathering, open to anyone who wants to sit together.',
  },
  {
    title: 'Moon blood in practice',
    body: 'Some modern witches offer a little moon blood to the earth, a garden or a houseplant as thanks, or use a drop in a personal working. If you do: only your own, only for your own workings, never in food or drink, never on another person or anything shared, and wash hands and tools well afterwards. Dilute it in water for the earth. Many traditions never use it, and that’s as valid a choice.',
  },
  {
    title: 'Being gentle',
    body: 'Pain, tiredness and low mood are real, not a failure of practice. Rest counts as practice. If pain stops you doing ordinary things, or something changes, see a doctor or nurse.',
  },
];

// ── Practice suggestions ─────────────────────────────────────────────────

/** Something to open: a premade working, a Living Library entry or a divination spread. */
export type PracticeLink =
  | { kind: 'premade'; id: string; label: string }
  | { kind: 'library'; id: string; label: string }
  | { kind: 'spread'; id: string; label: string };

export type Suggestion = { title: string; line: string; links: PracticeLink[] };

const premade = (id: string, label: string): PracticeLink => ({ kind: 'premade', id, label });
const library = (id: string, label: string): PracticeLink => ({ kind: 'library', id, label });
const spread = (id: string, label: string): PracticeLink => ({ kind: 'spread', id, label });

/** For each inner season, at each quarter of the moon. Every link names something the app has. */
export const SUGGESTIONS: Record<Season, Record<MoonQuarter, Suggestion>> = {
  winter: {
    dark: {
      title: 'Rest in the double dark',
      line: 'Inner winter under the dark moon: a night to stop. A shadow page, or nothing at all.',
      links: [premade('cosmic-dark-moon-rest-shadow', 'Dark Moon Rest and Shadow Pages'), spread('new-moon', 'The new moon spread')],
    },
    waxing: {
      title: 'Small and quiet',
      line: 'Inner winter as the moon grows: rest first, then a cup of something calming and a single question.',
      links: [premade('kitchen-peace-tea', 'Chamomile and Lavender Peace Tea'), library('traditional:herb:chamomile', 'Chamomile')],
    },
    full: {
      title: 'Dream by the full moon',
      line: 'Inner winter under a bright moon: a dream pillow and a notebook by the bed.',
      links: [premade('hedge-dream-pillow', 'Mugwort Dream Pillow & Dream Journal'), library('traditional:crystal:moonstone', 'Moonstone')],
    },
    waning: {
      title: 'Scrying or a quiet bath',
      line: 'Inner winter and a waning moon: scrying in a dark bowl, or a quiet cleansing bath.',
      links: [premade('hedge-dark-bowl-scrying', 'Scrying in a Dark Bowl of Water'), premade('green-herbal-ritual-bath', 'Garden Herb Ritual Bath')],
    },
  },
  spring: {
    dark: {
      title: 'Seeds in the dark',
      line: 'Inner spring at the new moon: write the seeds of what you want to grow.',
      links: [premade('cosmic-new-moon-intentions', 'New Moon Seed Intentions'), spread('new-moon', 'The new moon spread')],
    },
    waxing: {
      title: 'Grow something',
      line: 'Inner spring and a waxing moon: everything leans towards growth. Start a growing jar.',
      links: [premade('cosmic-waxing-moon-growth-jar', 'Waxing Moon Growing Jar'), library('traditional:crystal:carnelian', 'Carnelian')],
    },
    full: {
      title: 'Set it in a stone',
      line: 'Inner spring under the full moon: give a beginning somewhere to live.',
      links: [premade('crystal-programming-intention', 'Programming a Crystal'), library('traditional:crystal:clear_quartz', 'Clear Quartz')],
    },
    waning: {
      title: 'Clear space to begin',
      line: 'Inner spring as the moon wanes: sweep out what’s in the way of the new.',
      links: [premade('kitchen-sweeping-out-the-old', 'Sweeping Out the Old'), library('traditional:herb:rosemary', 'Rosemary')],
    },
  },
  summer: {
    dark: {
      title: 'Turn the light on yourself',
      line: 'Inner summer at the dark moon: a mirror working for the self you’re growing into.',
      links: [premade('kitchen-solitary-self-love-mirror', 'Self-Love Mirror Ritual'), library('traditional:crystal:rose_quartz', 'Rose Quartz')],
    },
    waxing: {
      title: 'Courage and reach',
      line: 'Inner summer and a waxing moon: outward magic for confidence and success.',
      links: [premade('cosmic-sunday-sun-success', 'Sunday Sun Crown'), premade('kitchen-courage-brew', 'Cinnamon-Ginger Courage Brew')],
    },
    full: {
      title: 'Full and bright',
      line: 'Inner summer under the full moon: charge, celebrate and make moon water.',
      links: [premade('cosmic-full-moon-charging-moon-water', 'Full Moon Charging and Moon Water'), premade('wicca-full-moon-esbat', 'Full Moon Esbat')],
    },
    waning: {
      title: 'Give thanks',
      line: 'Inner summer as the moon wanes: thank what has grown before it’s gathered in.',
      links: [premade('folk-gratitude-ritual', 'A Ritual of Thanks'), spread('full-moon', 'The full moon spread')],
    },
  },
  autumn: {
    dark: {
      title: 'Ward and cleanse',
      line: 'Inner autumn at the dark moon: clear the house and set a boundary.',
      links: [premade('kitchen-cleansing-floor-wash', 'Rosemary and Lemon Floor Wash'), premade('crystal-tourmaline-obsidian-shield', 'Black Tourmaline and Obsidian Shield')],
    },
    waxing: {
      title: 'Honest evening',
      line: 'Inner autumn as the moon grows: a candle and the truth of the day.',
      links: [premade('kitchen-solitary-evening-reflection', 'Evening Reflection by Candlelight'), spread('shadow-work', 'The shadow work spread')],
    },
    full: {
      title: 'Burn it bright, let it go',
      line: 'Inner autumn under the full moon: release in the light.',
      links: [premade('green-fire-safe-bonfire-release', 'Fire: Bonfire Release'), library('traditional:crystal:obsidian', 'Obsidian')],
    },
    waning: {
      title: 'Untie and cut',
      line: 'Inner autumn and a waning moon: the strongest release of the month. Unknot, or cut a cord.',
      links: [premade('cosmic-waning-moon-release', 'Waning Moon Unknotting'), premade('folk-cord-cutting', 'Cord Cutting')],
    },
  },
};

export const suggestionFor = (season: Season, quarter: MoonQuarter): Suggestion => SUGGESTIONS[season][quarter];

/** The moon-time altar: what it sets out, all from the cabinet. */
export const MOON_TIME_ALTAR_LINE = 'A red candle, a moon bowl of water, a red cord, moonstone and red jasper, mugwort and rose: set out while you bleed, put away when you’re done.';
