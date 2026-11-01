// The words "Your chart in plain words" is built from (interpret/plainWords.ts):
// small combinational tables, written in everyday language, that the
// composer mixes for each chart. Nothing here is a reading on its own; each
// line is written to be joined to others (a sign's phrase to a planet's role,
// an element pair to the two placements it compares). House voice: warm,
// plain British English, "tends to", "often", never fate.

import type { AspectName, PatternName } from '../aspects.ts';
import type { Classical, ChartPointName, Element, Modality, ZodiacSign } from '../signs.ts';

// ── Jargon, explained in a few words ────────────────────────────────────────
// Whenever a part uses one of these terms it explains it the first time,
// in brackets (plainWords.ts `Gloss`). The tests check every use is explained.
export const GLOSSES: Record<string, string> = {
  'rising sign': 'the sign that was coming up over the eastern horizon as you were born',
  'chart ruler': 'the planet that rules your rising sign, and so steers the whole chart',
  house: 'a slice of the chart standing for one area of life',
  'on an angle': 'in one of the four most powerful places in a chart: the rising point, the setting point, the top and the bottom',
  exalted: 'in the sign where it is traditionally honoured and works at its best',
  'in detriment': 'in the sign opposite its home, where it has to work in an unfamiliar way',
  'in fall': 'in the sign opposite the one where it is honoured, so it has to try harder',
  retrograde: 'seeming to move backwards from Earth, which many read as turning its energy inwards',
  conjunction: 'two planets side by side, acting as one',
  opposition: 'two planets facing each other across the chart',
  square: 'two planets a quarter of the circle apart',
  trine: 'two planets a third of the circle apart, usually in the same element',
  sextile: 'two planets a sixth of the circle apart',
  quincunx: 'two planets five signs apart, with little in common',
  stellium: 'three or more planets bunched in one sign or house',
  'T-square': 'two planets facing each other, both pressing on a third',
  'grand trine': 'three planets evenly spaced round the chart in one element',
  'grand cross': 'four planets in a cross, each facing one and pressing on two',
  yod: 'two planets in an easy link, both at an awkward angle to a third',
  'kite pattern': 'three planets in an easy triangle, with a fourth opposite one corner',
  cardinal: 'starting: the signs that begin each season',
  fixed: 'keeping: the signs in the settled middle of each season',
  mutable: 'adapting: the signs that end each season and change it',
  modality: 'how a sign moves: starting, keeping or adapting',
  Midheaven: 'the top of the chart, tied to career and public life',
};

// ── The signs, as phrases for each part of you ──────────────────────────────

export type SignPlain = {
  /** A few adjectives: "bold, quick and direct". */
  adj: string;
  /** What the Sun here is reaching for: "to act, lead and meet a challenge head on". */
  core: string;
  /** What the Moon here needs: "freedom to act, honest warmth and something to aim at". */
  need: string;
  /** How the rising sign meets people: "quick, frank and ready to go". */
  front: string;
};

export const SIGN_PLAIN: Record<ZodiacSign, SignPlain> = {
  Aries: { adj: 'bold, quick and direct', core: 'to act, to lead and to meet a challenge head on', need: 'freedom to act, honest heat and something to aim at', front: 'quick, frank and ready to go' },
  Taurus: { adj: 'steady, patient and sensual', core: 'to build something lasting and enjoy the good things of life', need: 'comfort, routine, good food and time that is not rushed', front: 'calm, solid and unhurried' },
  Gemini: { adj: 'curious, lively and talkative', core: 'to learn, connect and keep the mind moving', need: 'conversation, variety and something new to think about', front: 'bright, chatty and quick to engage' },
  Cancer: { adj: 'tender, protective and loyal', core: 'to care for your own and make a home', need: 'closeness, a safe nest and people who stay', front: 'gentle, watchful and slow to trust strangers' },
  Leo: { adj: 'warm, proud and generous', core: 'to create, to shine and to be loved for who you are', need: 'warmth, appreciation and a chance to play', front: 'warm, confident and hard to miss' },
  Virgo: { adj: 'careful, useful and observant', core: 'to improve things, to be skilled and to be of real use', need: 'order, a useful task and things done properly', front: 'modest, neat and quietly observant' },
  Libra: { adj: 'gracious, fair and sociable', core: 'to make things balanced, beautiful and fair', need: 'harmony, good company and peace in the room', front: 'charming, polite and easy to like' },
  Scorpio: { adj: 'deep, intense and private', core: 'to get to the truth and to transform what you touch', need: 'trust, depth and loyalty you can count on', front: 'reserved, magnetic and hard to read' },
  Sagittarius: { adj: 'free, hopeful and outspoken', core: 'to explore, to find meaning and to tell the truth as you see it', need: 'room to roam, honesty and something to believe in', front: 'open, friendly and restless' },
  Capricorn: { adj: 'serious, ambitious and dependable', core: 'to achieve, to build a reputation and to master your craft', need: 'a plan, respect and a sense of being in control', front: 'composed, capable and a little formal' },
  Aquarius: { adj: 'independent, original and fair-minded', core: 'to be your own person and make things better for everyone', need: 'space, friendship and freedom from fuss', front: 'friendly but cool, and a little unusual' },
  Pisces: { adj: 'dreamy, kind and sensitive', core: 'to imagine, to heal and to feel part of something larger', need: 'quiet, kindness and time to drift', front: 'soft, gentle and hard to pin down' },
};

// ── Elements ────────────────────────────────────────────────────────────────

export const ELEMENT_PLAIN: Record<Element, { is: string; wants: string }> = {
  fire: { is: 'energy, enthusiasm and action', wants: 'charge ahead and act on it' },
  earth: { is: 'practical sense, steadiness and the body', wants: 'take it slowly and make it real' },
  air: { is: 'ideas, words and other people', wants: 'think it over and talk it through' },
  water: { is: 'feeling, intuition and closeness', wants: 'feel its way and trust its gut' },
};

/** Two placements in the same element. */
export const ELEMENT_SAME: Record<Element, string> = {
  fire: 'Fire feeds fire, so these parts of you agree about wanting life to be lively, brave and moving. You tend to act on enthusiasm without much inner argument. The thing to watch is burning out: with nothing in you saying "wait", rest and follow-through can slip.',
  earth: 'Earth on earth makes firm ground. These parts of you agree about wanting things to be real, useful and lasting, and you rarely feel torn between them. You can be very dependable. The thing to watch is getting stuck: when nothing inside asks for change, a rut can feel like safety.',
  air: 'Air with air keeps the mind turning. These parts of you agree that life is about ideas, talk and connection, so you think quickly and get on with people easily. The thing to watch is living in your head: feelings and the body can get left behind while you analyse.',
  water: 'Water joins water easily. These parts of you agree about what matters most: feeling, closeness and the people you love. Your emotional world is rich and your instincts strong. The thing to watch is being swamped: with nothing inside saying "step back", other people\'s moods can become yours.',
};

/** Two placements in different elements. Key: the two elements in ELEMENTS order, joined by '|'. */
export const ELEMENT_PAIR: Record<string, { image: string; text: string; work: string }> = {
  'fire|earth': {
    image: 'Fire and earth: a forge',
    text: 'Fire wants to leap; earth wants to build. Together they can be very productive, with the spark of an idea and the patience to make it real, but they run at different speeds. One side gets restless at the other\'s caution, the other side gets uneasy at the first one\'s risks.',
    work: 'Let the fire side start things and the earth side finish them, and agree a pace both can live with.',
  },
  'fire|air': {
    image: 'Fire and air: a fanned flame',
    text: 'Air feeds fire, so these two lift each other. Ideas turn into enthusiasm and enthusiasm into more ideas; you are likely lively, sociable and quick to get going. What they share is speed, and what they can both lack is staying power and attention to feelings.',
    work: 'Pick one idea at a time to see through, and check in with how you actually feel, not only what you think.',
  },
  'fire|water': {
    image: 'Fire and water: steam',
    text: 'Fire and water are the classic odd couple. Fire wants to act now, water wants to feel its way first; fire is outgoing, water protective. That can feel like being pulled between boldness and sensitivity, or like reacting strongly and then feeling it deeply afterwards. Handled well, it makes steam: passion with real heart behind it.',
    work: 'Give feelings a moment before you act, and give action a chance before you sink into feeling.',
  },
  'earth|air': {
    image: 'Earth and air: a plan on paper',
    text: 'Earth deals in what is real and air in what is possible. One side of you wants proof and practical results; the other wants ideas, talk and new angles. That can feel like a sensible voice arguing with a curious one. Together they make a good planner: ideas tested against reality.',
    work: 'Let ideas run free for a while, then ask the practical questions; neither voice needs to win outright.',
  },
  'earth|water': {
    image: 'Earth and water: a garden',
    text: 'Water softens earth and earth gives water a shape, so these two get on well. You are likely caring in practical ways, steady in your feelings and loyal. What they share is a love of security, so the risk is caution: both sides can hold on to people, habits and things a little too long.',
    work: 'Use the steadiness to take one small risk at a time, knowing you have firm ground to come back to.',
  },
  'air|water': {
    image: 'Air and water: mist',
    text: 'Air wants to understand; water wants to feel. One side of you steps back to think, the other dives in to feel, and they do not always trust each other. It can show as talking about feelings instead of having them, or being swept by feelings you cannot explain. Together they can make a rare thing: emotional intelligence.',
    work: 'Name what you feel in words, and let some feelings simply be felt without having to explain them.',
  },
};

// ── Modalities ──────────────────────────────────────────────────────────────

export const MODE_PLAIN: Record<Modality, { who: string; style: string }> = {
  cardinal: { who: 'a starter', style: 'begins things and takes the lead' },
  fixed: { who: 'a keeper', style: 'holds steady and sees things through' },
  mutable: { who: 'an adapter', style: 'bends, adjusts and moves with change' },
};

export const MODE_SAME: Record<Modality, string> = {
  cardinal: 'Both are starters, so you like to begin, decide and take charge, and you do not wait to be asked. Finishing and sticking with things may take more conscious effort.',
  fixed: 'Both are keepers, so you are steady, loyal and very hard to push. Once you have decided, you stay decided. Change, when it comes, may need to be your own idea.',
  mutable: 'Both are adapters, so you are flexible, quick to adjust and good at seeing several sides. Choosing one path and holding to it can be the harder part.',
};

/** Key: the two modalities in MODALITIES order, joined by '|'. */
export const MODE_PAIR: Record<string, string> = {
  'cardinal|fixed': 'One side wants to start something new and the other wants to keep what works. It can feel like an accelerator and a brake pressed together, but it also means you can both begin and sustain.',
  'cardinal|mutable': 'One side wants to lead and decide, the other wants to keep options open. You can be quick to start and quick to change course; the risk is starting more than you finish.',
  'fixed|mutable': 'One side holds firm while the other wants to adapt. You can be steady at the core and flexible at the edges, though sometimes you may dig in where bending would help, or bend where you should hold.',
};

// ── Planets ─────────────────────────────────────────────────────────────────

export type PlanetPlain = {
  /** "your drive and fight". */
  self: string;
  /** "to act, win and defend what matters". */
  wants: string;
  /** "courage, energy and the nerve to begin". */
  gift: string;
  /** "hard physical work and plain, honest disagreement". */
  practice: string;
  /** What it looks like when this planet is one of the strongest in a chart. */
  strong: string;
};

export type PlainPoint = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto' | 'Ascendant' | 'Midheaven';

export const PLANET_PLAIN: Record<PlainPoint, PlanetPlain> = {
  Sun: {
    self: 'your sense of who you are',
    wants: 'to be seen and to live by your own purpose',
    gift: 'warmth, confidence and a clear sense of direction',
    practice: 'doing one thing each day that is wholly your own choice',
    strong: 'A strong Sun tends to make a person noticed. You carry a sense of purpose and often end up at the centre of things, whether you mean to or not. Day to day it shows as a need to make your mark and a low tolerance for living by someone else\'s plan.',
  },
  Moon: {
    self: 'your feelings and needs',
    wants: 'to feel safe, fed and at home',
    gift: 'sensitivity, care and a feel for what others need',
    practice: 'regular rest, good food and time at home, kept like an appointment',
    strong: 'A strong Moon makes feelings and instincts central. You likely read moods quickly, care for people without being asked and need a real home base. Day to day your energy rises and falls with how safe and looked after you feel, so routine and rest matter more than they might for others.',
  },
  Mercury: {
    self: 'your mind and the way you talk',
    wants: 'to understand things, name them and pass them on',
    gift: 'quick thinking, a way with words and curiosity',
    practice: 'writing things down, learning something new and talking it through',
    strong: 'A strong Mercury makes the mind the main tool. You are likely quick, observant and good with words, and people may come to you to explain, sort out or put things into words. Day to day you need mental stimulation; boredom is harder on you than tiredness.',
  },
  Venus: {
    self: 'what you love and value',
    wants: 'pleasure, beauty, closeness and fairness',
    gift: 'charm, taste and an easy way with people',
    practice: 'making something beautiful and spending time with people you like',
    strong: 'A strong Venus brings charm and a feel for beauty and people. Relationships, art, pleasure and fairness are likely to matter a great deal, and people often find you easy to be around. Day to day you need some beauty and affection around you; a harsh or ugly setting drains you quickly.',
  },
  Mars: {
    self: 'your drive and fight',
    wants: 'to act, to win and to defend what matters',
    gift: 'courage, energy and the nerve to begin',
    practice: 'hard physical work or exercise and plain, honest disagreement',
    strong: 'A strong Mars brings energy, nerve and a competitive edge. You are likely direct, quick to act and willing to fight for what matters. Day to day you need a physical outlet and a goal; without them the same energy can turn into irritation.',
  },
  Jupiter: {
    self: 'your hope and appetite for growth',
    wants: 'more room, more meaning and more of life',
    gift: 'generosity, faith and a knack for good fortune',
    practice: 'study, travel and giving something away',
    strong: 'A strong Jupiter brings optimism, generosity and a big-picture view. Doors tend to open, and you are likely the one who believes things will work out. Day to day you need something to grow towards; the risk is overdoing it, saying yes to too much.',
  },
  Saturn: {
    self: 'your sense of duty and limits',
    wants: 'order, mastery and things done properly',
    gift: 'patience, staying power and skill built slowly',
    practice: 'small, steady routines and promises you can keep',
    strong: 'A strong Saturn brings seriousness, responsibility and staying power. You may have grown up early, and you likely earn what you get through patience and work. Day to day you need structure and a sense of progress; you may also need reminding that rest is not failure.',
  },
  Uranus: {
    self: 'your urge for freedom and change',
    wants: 'to break the pattern and be yourself, however unusual',
    gift: 'originality and sudden insight',
    practice: 'room to experiment, and a little rebellion with a purpose',
    strong: 'A strong Uranus marks someone who does not fit the mould. You likely value freedom, have flashes of insight and get restless with rules that make no sense. Day to day you need room to do things your own way; too much routine feels like a cage.',
  },
  Neptune: {
    self: 'your imagination and longing',
    wants: 'to merge with something larger: art, faith, love or dream',
    gift: 'imagination, compassion and spiritual feeling',
    practice: 'music, prayer, time by water and writing down dreams, with clear boundaries',
    strong: 'A strong Neptune brings imagination, sensitivity and a feel for the unseen. You may be artistic, spiritual or deeply empathetic, and boundaries between you and others can be thin. Day to day you need quiet and beauty to recharge, and clear limits so you do not lose yourself in other people.',
  },
  Pluto: {
    self: 'your depth and power',
    wants: 'the truth underneath, and control over your own life',
    gift: 'resilience and the power to remake yourself',
    practice: 'honest inner work and letting go of what is finished',
    strong: 'A strong Pluto brings intensity and depth. You are likely drawn to what is hidden, see through pretence and go through big changes rather than small ones. Day to day you need honesty and a sense of control over your own life; shallowness wears you out.',
  },
  Ascendant: {
    self: 'the way you meet the world',
    wants: 'to be met as you are',
    gift: 'a ready presence',
    practice: 'care of the body and attention to how you begin things',
    strong: '',
  },
  Midheaven: {
    self: 'your public path and calling',
    wants: 'a place in the world that means something',
    gift: 'a sense of vocation',
    practice: 'small steps towards the work you want to be known for',
    strong: '',
  },
};

/** Your life when this planet is the chart ruler. */
export const RULER_PLAIN: Record<Classical, string> = {
  Sun: 'With the Sun as your chart ruler, life is steered by the need to be fully yourself in full view: to create, to lead and to be recognised for what you do. You tend to come alive when you have something that is clearly yours.',
  Moon: 'With the Moon as your chart ruler, life is steered by feeling. Your moods, your home and the people you care for set your direction more than any plan, and your sense of safety colours everything.',
  Mercury: 'With Mercury as your chart ruler, life is steered by the mind. Curiosity, learning, talk and making connections lead you on, and you often find your way by thinking or talking it through.',
  Venus: 'With Venus as your chart ruler, life is steered by what you love. Relationships, beauty, pleasure and fairness lead you on, and you tend to move towards what feels harmonious and away from what feels ugly or unjust.',
  Mars: 'With Mars as your chart ruler, life is steered by drive. You move forward by acting, competing and pushing through, and you tend to feel most yourself when you have a challenge in front of you.',
  Jupiter: 'With Jupiter as your chart ruler, life is steered by hope and growth. You are led on by meaning, learning, travel and faith, and you tend to trust that the next horizon holds something good.',
  Saturn: 'With Saturn as your chart ruler, life is steered by responsibility and long effort. You tend to build slowly and surely, take duties seriously and grow into yourself with age; many people with this ruler find life gets easier, not harder, as the years go on.',
};

/** The modern co-rulers, in a line. */
export const MODERN_CORULER: Partial<Record<ChartPointName, string>> = {
  Uranus: 'Modern astrologers add Uranus as a co-ruler, bringing a streak of independence and a need to do things your own way.',
  Neptune: 'Modern astrologers add Neptune as a co-ruler, bringing imagination, sensitivity and a pull towards the spiritual.',
  Pluto: 'Modern astrologers add Pluto as a co-ruler, bringing intensity and a life marked by deep changes.',
};

// ── Houses, as everyday areas of life ───────────────────────────────────────

export const HOUSE_PLAIN: Record<number, { area: string; cluster: string }> = {
  1: { area: 'yourself, your body and how you come across', cluster: 'Life keeps bringing you back to yourself: your body, your look and your way of starting things. You are often the visible one, and much of your growth comes through learning who you are and acting on it.' },
  2: { area: 'money, possessions and what you value', cluster: 'Much of your energy goes into security: earning, owning, saving and working out what is truly worth something to you. Your sense of self-worth and your bank balance can feel closely tied.' },
  3: { area: 'talk, learning, siblings and your neighbourhood', cluster: 'Your energy goes into communication: talking, writing, learning, short journeys and the people close by, including brothers and sisters. A busy mind and a busy phone are likely.' },
  4: { area: 'home, family and roots', cluster: 'Home and family are at the centre: where you live, where you come from and the private life behind closed doors. Your roots, and the home you make, shape you more than most.' },
  5: { area: 'pleasure, creativity, romance and children', cluster: 'Your energy goes into joy: creating, playing, falling in love, children and whatever lets you express yourself. You need fun, and you do your best work when you enjoy it.' },
  6: { area: 'daily work, health and routines', cluster: 'Your energy goes into the everyday: work, habits, health and being useful. How you spend an ordinary Tuesday matters a great deal to how you feel about your life.' },
  7: { area: 'partners and close one-to-one relationships', cluster: 'Your energy goes into partnership: marriage, close friendships, business partners and even rivals. You often learn who you are through other people, and relationships are where your life\'s lessons tend to arrive.' },
  8: { area: 'intimacy, shared money, endings and the hidden depths', cluster: 'Your energy goes into the deep end: intimacy, trust, shared resources, loss and renewal. Life asks you to go below the surface, and you are rarely satisfied with shallow answers.' },
  9: { area: 'beliefs, study, travel and the search for meaning', cluster: 'Your energy goes into the search for meaning: travel, higher learning, faith, philosophy and other cultures. You need a bigger picture to make sense of life.' },
  10: { area: 'career, reputation and your public role', cluster: 'Your energy goes into your public life: career, reputation, ambition and what you are known for. People notice what you do, and you likely feel driven to achieve something visible.' },
  11: { area: 'friends, groups, community and hopes for the future', cluster: 'Your energy goes into community: friends, groups, causes and hopes for the future. You do well in a network, and the people you gather around you shape where you go.' },
  12: { area: 'solitude, the unconscious and quiet inner work', cluster: 'Your energy goes inwards: solitude, dreams, spirituality, rest and the things you keep to yourself. Much happens behind the scenes, and you need time alone to stay well.' },
};

export const SIDE_PLAIN: Record<'above' | 'below' | 'east' | 'west', string> = {
  above: 'Most of your planets sit in the top half of the chart, the part above the horizon. Many astrologers read this as a life lived outwards, in public and among others; your attention tends to go to the world, your role and what you do.',
  below: 'Most of your planets sit in the bottom half of the chart, the part below the horizon. Many astrologers read this as a more private, inward life; your attention tends to go to home, feelings and personal matters, and you may build quietly before you are seen.',
  east: 'Most of your planets sit on the left-hand side of the chart, the rising side. This is often read as self-directed: you tend to make your own choices and shape your own life, and you may find it harder to wait on others.',
  west: 'Most of your planets sit on the right-hand side of the chart, the setting side. This is often read as a life shaped through others: partners, clients and friends bring your opportunities, and you do well by working with people rather than alone.',
};

export const QUADRANT_PLAIN: Record<number, string> = {
  1: 'The busiest quarter is the first (the first to third houses): much of your energy is about yourself, your resources and your mind, finding out who you are and what you have.',
  2: 'The busiest quarter is the second (the fourth to sixth houses): much of your energy goes into home, creative self-expression and the daily work of living well.',
  3: 'The busiest quarter is the third (the seventh to ninth houses): much of your energy goes into other people, what you share with them and how they widen your world.',
  4: 'The busiest quarter is the fourth (the tenth to twelfth houses): much of your energy goes into your place in the wider world: career, community and the larger spiritual picture.',
};

// ── Balance, in everyday terms ──────────────────────────────────────────────

export const ELEMENT_LEAN: Record<Element, { dominant: string; missing: string; practice: string }> = {
  fire: {
    dominant: 'With fire leading, you likely run on enthusiasm and do best when life feels like an adventure. You start fast and inspire others; the work is in keeping going once the excitement fades.',
    missing: 'With no fire, getting started and pushing yourself forward may not come naturally. You might find energy and confidence in livelier friends, or build it on purpose through movement and small, brave acts.',
    practice: 'a candle lit with an intention, movement first thing, and one small brave act a week',
  },
  earth: {
    dominant: 'With earth leading, you are likely practical, steady and good with your hands, money and time. You trust what you can see and touch; the work is in staying open to what cannot be measured.',
    missing: 'With no earth, practical matters such as money, routines and the body may feel like hard work or an afterthought. You might lean on practical people, or build earth on purpose through simple routines, cooking and time outdoors.',
    practice: 'gardening, cooking from scratch, a regular bedtime and bare feet on the ground',
  },
  air: {
    dominant: 'With air leading, you likely live a good deal in ideas, words and people. You see patterns, talk well and need conversation; the work is in coming back into your body and feelings.',
    missing: 'With no air, stepping back to see things from outside, or putting feelings into words, may take more effort. You might lean on talkative friends, or build air on purpose by writing, reading and asking questions.',
    practice: 'journalling, reading, a walk in the wind and talking things through with a friend',
  },
  water: {
    dominant: 'With water leading, you likely feel things deeply and read people well. Closeness, memory and intuition guide you; the work is in protecting your energy and not taking on everyone\'s moods.',
    missing: 'With no water, feelings may be something you think about more than sit with, and you may be puzzled by more emotional people. You might find depth through others, or grow it on purpose with music, baths, tears and time with people you trust.',
    practice: 'baths, moon-water, music that moves you and time by the sea or a river',
  },
};

export const MODE_LEAN: Record<Modality, { dominant: string; missing: string }> = {
  cardinal: {
    dominant: 'Most of your chart is in the starting signs, so you are likely an initiator: quick to begin, decide and take the lead. Life tends to feel like a series of fresh starts.',
    missing: 'None of your planets is in the starting signs, so beginning things may be the hardest part. A firm date or a friend who gets things moving can help.',
  },
  fixed: {
    dominant: 'Most of your chart is in the keeping signs, so you are likely steady, loyal and persistent. You finish what you start; the challenge is letting go when something has run its course.',
    missing: 'None of your planets is in the keeping signs, so sticking with one thing for a long time may not come easily. Small, regular habits can build the staying power you need.',
  },
  mutable: {
    dominant: 'Most of your chart is in the adapting signs, so you are likely flexible, versatile and good in a crisis. You can see every side; the challenge is choosing one and holding to it.',
    missing: 'None of your planets is in the adapting signs, so changing plans or going with the flow may be hard. Building in a little slack can help when life does not follow the plan.',
  },
};

/** The chart's overall temperament: its leading element with its leading modality, the "sign" the whole chart is like. */
export const TEMPERAMENT: Record<string, { like: ZodiacSign; text: string }> = {
  'fire|cardinal': { like: 'Aries', text: 'a spark: quick to see what needs doing and to do it first, brave, impatient and best at the beginning of things' },
  'fire|fixed': { like: 'Leo', text: 'a steady fire: warm, proud, loyal and creative, with a heart that keeps burning once it is lit' },
  'fire|mutable': { like: 'Sagittarius', text: 'a wildfire: restless, hopeful and adventurous, always heading for the next horizon' },
  'earth|cardinal': { like: 'Capricorn', text: 'a builder with a plan: ambitious, responsible and able to turn long goals into steady steps' },
  'earth|fixed': { like: 'Taurus', text: 'bedrock: calm, patient, sensual and very hard to move once settled' },
  'earth|mutable': { like: 'Virgo', text: 'a craftsperson: practical, skilled, helpful and always refining' },
  'air|cardinal': { like: 'Libra', text: 'a diplomat: sociable, fair-minded and quick to bring people together' },
  'air|fixed': { like: 'Aquarius', text: 'a free thinker: independent, principled and loyal to ideas and friends' },
  'air|mutable': { like: 'Gemini', text: 'a messenger: curious, quick-witted and endlessly interested in everything' },
  'water|cardinal': { like: 'Cancer', text: 'a protector: caring, intuitive and quick to look after your own' },
  'water|fixed': { like: 'Scorpio', text: 'deep water: intense, loyal, private and capable of great change' },
  'water|mutable': { like: 'Pisces', text: 'the sea: sensitive, imaginative and compassionate, shaped by everything around you' },
};

// ── Aspects, as lived experience ────────────────────────────────────────────

export const ASPECT_PLAIN: Partial<Record<AspectName, { framing: string; work: string }>> = {
  conjunction: { framing: 'a fusion: you rarely feel one without the other, and they act as one, for good and ill', work: 'notice when one is running the other, and give each its own turn' },
  opposition: { framing: 'a see-saw: you swing between the two, or meet one side in other people and argue with it there', work: 'look for the middle way, and notice when you hand one side to someone else to carry' },
  square: { framing: 'friction: the two get in each other\'s way, which is uncomfortable but keeps you moving', work: 'use the friction as fuel, in small deliberate steps rather than blow-ups' },
  quincunx: { framing: 'an awkward fit: the two speak different languages and need constant small adjustments', work: 'make room for both in your week rather than hoping they will merge' },
  trine: { framing: 'an easy flow: they help each other without effort', work: 'use it on purpose, since easy gifts are easy to take for granted' },
  sextile: { framing: 'an open door: a helpful link that works best when you take it up', work: 'act on it: this gift grows with use' },
};

export const PATTERN_PLAIN: Record<PatternName, string> = {
  't-square': 'is a built-in engine of pressure: two parts of you pull against each other and both push on a third, which becomes where you try hardest and achieve most. It can be stressful, but people with one tend to get things done.',
  'grand-cross': 'is four parts of you pulling in four directions. Life can feel demanding, as though everything needs attention at once, but it builds great resilience: you learn to hold a lot together.',
  'grand-trine': 'is a closed circle of ease: a talent that comes so naturally you may not notice it. The risk is comfort; it shines when something else in the chart gives it a reason to work.',
  kite: 'is an easy triangle with a purpose: the talent of the triangle, with a fourth planet opposite that pulls it out into the world and gives it a job.',
  yod: 'is sometimes called the finger of fate: two parts of you that get along both point awkwardly at a third. Many people with one feel a sense of special task, reached through repeated adjustment rather than a straight line.',
  stellium: 'puts a lot of you in one place. That sign or house becomes a strong theme in your life: a focus, a speciality, sometimes an obsession, and the place where your energy most naturally goes.',
};

// ── The Sun and Moon's phase at birth ───────────────────────────────────────

export const BIRTH_PHASE: { name: string; text: string }[] = [
  { name: 'new Moon', text: 'You were born near a new Moon, when the Sun and Moon stand together. Many astrologers read this as a person whose head and heart point the same way: instinctive, single-minded and starting fresh, sometimes without much distance on yourself.' },
  { name: 'waxing crescent', text: 'You were born under a waxing crescent Moon, as the light grows. This is often read as a person pushing out of the old towards something new: hopeful, determined and still finding their feet.' },
  { name: 'first quarter Moon', text: 'You were born near a first quarter Moon, when the Sun and Moon stand at right angles. This is often read as a builder\'s Moon: a life that moves forward by meeting obstacles and acting on them.' },
  { name: 'waxing gibbous', text: 'You were born under a waxing gibbous Moon, nearly full. This is often read as a refiner: someone who keeps improving, questioning and polishing until things are right.' },
  { name: 'full Moon', text: 'You were born near a full Moon, when the Sun and Moon face each other. Many astrologers read this as a person very aware of other people and of their own inner split: what you want and what you need often show up as two sides to balance, and relationships bring them into the open.' },
  { name: 'waning gibbous', text: 'You were born under a waning gibbous Moon, just past full. This is often read as a sharer: someone who wants to pass on what they know and make meaning of experience.' },
  { name: 'last quarter Moon', text: 'You were born near a last quarter Moon, as the light shrinks. This is often read as a person who questions and reforms: comfortable letting go of old forms to make room for better ones.' },
  { name: 'balsamic Moon', text: 'You were born under a balsamic Moon, the last thin crescent before the new. This is often read as a wise or old soul: reflective, a little apart and attuned to endings, rest and what comes next.' },
];
