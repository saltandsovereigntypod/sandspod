// Practice challenges: short runs of daily practice (7, 13, 21 or 30 days)
// beside A Year and a Day. Each theme has thirty prompts that build on one
// another; a shorter run takes an even spread of them, always beginning with
// the first and ending with the last, so no two days repeat. Check in each
// day with a line or two; the streak counts unbroken days, and the end asks
// for a reflection. A missed day isn't a failure: the run carries on.
//
// Kept as craft entries (collection yearday.challenges). Pure, so it can be
// tested and shared with the website (js/core/spirit.js).

import { moonState } from '../moon.ts';
import { dateFromKey, localDateKey } from '../rituals/lifecycle.ts';

export const CHALLENGES = 'yearday.challenges';
export const LENGTHS = [7, 13, 21, 30] as const;
export type ChallengeLength = (typeof LENGTHS)[number];

export type ThemeId = 'tarot' | 'moon' | 'devotion' | 'grounding' | 'plants' | 'ancestors';

/** A place in the app (and its website address) that goes with a theme. */
export type ThemeLink = { label: string; app: string; web: string };

export type Theme = { id: ThemeId; title: string; about: string; need: string; prompts: string[]; links: ThemeLink[] };

export const THEMES: Theme[] = [
  {
    id: 'tarot',
    title: 'A card a day',
    about: 'Draw one card each morning, sit with it, and come back at night to see where it showed up. Thirty days is enough to meet most of the Major Arcana in your own life.',
    need: 'A tarot deck (or the app’s draw), a notebook.',
    links: [
      { label: 'Draw a card', app: '/rituals/divination/draw', web: '/divination/draw/' },
      { label: 'Card meanings', app: '/rituals/divination/meanings', web: '/divination/' },
    ],
    prompts: [
      'Shuffle slowly and draw one card. Before reading any meaning, write three words the picture gives you.',
      'Draw today’s card. Who in the picture would you be, and why?',
      'Draw a card and find one colour in it that is also in the room around you. What does that colour carry today?',
      'Draw a card. Write what it would say to you in the first person: “I am the Five of Cups, and I…”.',
      'Draw a card and look only at the background: the sky, the ground, the buildings. What is happening behind the main scene?',
      'Draw a card and read its book meaning. Then write where you disagree with the book.',
      'Draw a card for the morning; at night, note one moment it showed up, even small.',
      'Draw a card and ask it a question back. Draw a second card as its answer.',
      'Draw a card and name the element of its suit (or the Major’s correspondence). Where is that element in your day?',
      'Draw a card and imagine stepping into it. What do you smell, hear, feel underfoot?',
      'Draw a card upside down on purpose. Read it reversed: blocked, inward, or just turned?',
      'Draw a card and pair it with yesterday’s. What story do the two tell?',
      'Draw a card and find its number. What else in your life is that number today?',
      'Draw a card for someone you love (in your head; don’t tell them). What would you want them to know?',
      'Halfway: lay out every card you’ve drawn so far. Which suit or number keeps coming?',
      'Draw a card and write a short spell or affirmation from it.',
      'Draw a card and find the hands in it. What are they holding, giving, refusing?',
      'Draw a card and read it as advice for your body today.',
      'Draw a card and name the season it feels like. Does it match the season outside?',
      'Draw a card you dislike on purpose (find it in the deck). What is it trying to teach you?',
      'Draw a card and write the moment before the picture, and the moment after.',
      'Draw a card and read it only through its court card or figure’s gaze: where are they looking?',
      'Draw a card and pick one symbol. Look it up in the Living Library or a book, and see what you missed.',
      'Draw a card and read it as a message from a deity or ancestor you honour.',
      'Draw a card in the evening instead of the morning. Read it as a review of the day.',
      'Draw a card and write a single line of poetry from it.',
      'Draw a card and decide one small action it asks of you. Do it today.',
      'Draw a card and compare how you read it now with how you would have read it on day one.',
      'Pull out the card you’ve drawn most often in this run (or the one that struck you most). Why that one?',
      'Last day: draw a card for the next month. Write what you’ll carry on from this practice, and what you’ll let go.',
    ],
  },
  {
    id: 'moon',
    title: 'Moon journaling',
    about: 'A few lines each evening with the moon: her phase, her sign if you follow it, and how you are. Over a month the two rhythms start to talk to each other.',
    need: 'A notebook, a window or a step outside.',
    links: [
      { label: 'Cycle & Moon', app: '/rituals/cycle', web: '/rituals/cycle/' },
      { label: 'Moon journal in the Grimoire', app: '/grimoire/journals', web: '/grimoire/journals/' },
    ],
    prompts: [
      'Tonight the moon is {phase}. Go and find her, or where she would be. Write how you feel, in one word and then in three lines.',
      'The moon is {phase}. What are you beginning, carrying, or finishing just now?',
      'Write your energy today from one to ten, and what moved it. The moon is {phase}.',
      'Under a {phase} moon: what is growing in you that you haven’t said aloud?',
      'Notice the light tonight. Write one thing it falls on that you usually miss.',
      'The moon is {phase}. What do you need more of this week, and less of?',
      'Write about sleep last night: how long, what you dreamed. Keep this up for the run; patterns show by the end.',
      'Under a {phase} moon: a worry, written down plainly, then folded away.',
      'Which phase do you feel most like yourself in? Tonight is {phase}; does it suit you?',
      'Write a short thank-you to the moon, as if to a neighbour.',
      'The moon is {phase}. What has the week taught you?',
      'Look up the moon’s sign tonight if you follow it. Does its character show in your day?',
      'Write about water today: rain, a bath, the tide, tears. The moon is {phase}.',
      'Under a {phase} moon: what is ready to be harvested, finished or celebrated?',
      'Halfway: read back your entries. What changed between the first and now?',
      'The moon is {phase}. Write what you would put in a jar of moon water tonight, and why.',
      'Who were you with today, and how did it feel? The moon is {phase}.',
      'Write what you are letting go of. Keep it short; read it aloud.',
      'Under a {phase} moon: your body today, from head to feet.',
      'Write about a woman, mother, or moon-figure in your life or tradition.',
      'The moon is {phase}. What is quiet in you tonight?',
      'Write a dream you remember, any dream, from any time.',
      'Under a {phase} moon, what is the one thing worth doing tomorrow?',
      'Note the time the moon rises or sets tonight, if you can find it. Were you awake?',
      'Write about a boundary you held or let slip. The moon is {phase}.',
      'Under a {phase} moon: what are you proud of this month?',
      'Draw the moon as she is tonight, however roughly.',
      'Read your sleep notes from this run. Any pattern with the phases?',
      'The moon is {phase}. Write a wish for the next cycle, plainly.',
      'Last night: read the whole run back. Write what the moon has shown you about your own rhythm, and how you’ll keep listening.',
    ],
  },
  {
    id: 'devotion',
    title: 'Daily devotion',
    about: 'A small daily act for a deity, ancestor or spirit you honour: a candle, a word, a cup of water. Devotion is built by turning up, more than by grand gestures.',
    need: 'A shrine or a corner of a shelf, a candle or a cup.',
    links: [
      { label: 'My deities', app: '/rituals/library', web: '/library/' },
      { label: 'Solitary practice: daily devotion', app: '/rituals/craft/solitary', web: '/practice/solitary/' },
    ],
    prompts: [
      'Choose who this run is for. Set out one thing for them: a cup of fresh water is enough. Say their name.',
      'Light a candle (or turn on a light) at the same time as yesterday. Say good morning to them.',
      'Find one fact about them you didn’t know: a title, a place they were honoured, an old prayer.',
      'Give fresh water again and pour yesterday’s onto earth, not down the sink.',
      'Write them a short letter, as you would to a beloved elder.',
      'Sit with them for five quiet minutes. Note anything that comes, and anything that doesn’t.',
      'Offer something from your kitchen: bread, salt, a little of your meal.',
      'Read or say an old hymn or prayer to them, if one survives. If not, write your own four lines.',
      'Clean their shrine: dust, fresh cloth, tidy candles. Care is devotion too.',
      'Do one thing in the world in their name: for a goddess of the hearth, cook; for a god of the sea, clean a beach.',
      'Ask them one question, and draw a card or sit in silence for the reply.',
      'Offer a song, or a few lines of poetry, aloud.',
      'Write what you think they want from you, and what you want from them. Are these fair?',
      'Bring them a flower or leaf from outside, something growing now.',
      'Halfway: what has turning up each day changed?',
      'Learn one of their symbols and draw it, or place it on the shrine.',
      'Light incense or a candle in a scent you associate with them (mind pets and lungs).',
      'Tell them about your day, plainly, as you’d tell a friend.',
      'Find their festival day, or the nearest holy day of their tradition, and mark it in your calendar.',
      'Offer silence: sit with no asking at all.',
      'Write down a sign you think came from them this run, and a plain explanation beside it. Keep both.',
      'Give something costly in time: an hour’s work, study or making for them.',
      'Read a modern devotee’s words about them, and an older source. Note where they differ.',
      'Make a small thing by hand for their shrine: a drawing, a plait of grass, a written name.',
      'Thank them for one specific thing.',
      'Ask what they would have you carry on after this run.',
      'Pour a libation outside, if your tradition does: milk, wine, water, honey-water.',
      'Write the shape of your devotion as it’s become: what, when, how long.',
      'Re-read your letter from day five. Write the reply you imagine.',
      'Last day: offer something a little special, and promise only what you’ll keep: perhaps a weekly candle. Write it down.',
    ],
  },
  {
    id: 'grounding',
    title: 'Grounding',
    about: 'A few minutes each day of coming back to the body and the earth. Grounding is the foundation every other working stands on, and it is also simply good for you.',
    need: 'Somewhere to stand or sit; outside when you can.',
    links: [
      { label: 'Meditation', app: '/rituals/craft/meditation', web: '/practice/meditation/' },
      { label: 'Land journal', app: '/rituals/craft/hearth/land', web: '/practice/hearth/land/' },
    ],
    prompts: [
      'Stand with your feet flat. Breathe in for four, out for six, ten times. Notice your feet.',
      'Name five things you can see, four you can hear, three you can touch, two you can smell, one you can taste.',
      'Sit and imagine roots from the base of your spine down into the earth. Stay three minutes.',
      'Go outside, even to a doorstep. Touch something living: bark, grass, a pot plant.',
      'Walk slowly for five minutes, feeling heel, sole, toe.',
      'Hold a stone, or anything heavy, in both hands. Let your shoulders drop.',
      'Eat something slowly, noticing every taste. Food is the oldest grounding.',
      'Lie on the floor for five minutes. Let it hold your full weight.',
      'Breathe with your hand on your belly; feel it rise first, then your chest.',
      'Go barefoot on earth, grass or sand, if it’s safe and warm enough. If not, hands on a tree.',
      'Hum low for a minute. Feel where the sound sits in your body.',
      'After something stressful today, stop and ground for one minute. Note what happened.',
      'Find north, east, south and west from where you live. Turn to each and breathe once.',
      'Sit with your back against a tree or a wall. Imagine its stillness passing into you.',
      'Halfway: which grounding has worked best so far? Do that one again, longer.',
      'Wash your hands slowly in cold water, then warm. Notice the change.',
      'Before sleep, tense and release each part of your body, feet to face.',
      'Garden, or handle soil, for ten minutes: repot a plant, weed, dig.',
      'Breathe in for four, hold four, out four, hold four. Five rounds.',
      'Notice the weather on your skin. Write it in the land journal.',
      'Ground before a working or a hard conversation. Then do the thing.',
      'Sit with a cup of something warm and do nothing else until it’s finished.',
      'Stamp your feet, shake out your hands, clap: sometimes grounding is loud.',
      'Visualise drawing up the earth’s steadiness through your roots into your heart.',
      'Ground after screens: ten minutes away from every screen, outside if you can.',
      'Carry a small stone all day; touch it whenever you notice you’ve drifted.',
      'Find a sit spot outside and visit it today; promise to come back.',
      'Ground with someone else (a child, a friend, an animal): breathe together.',
      'Write your own two-minute grounding, in your words, to keep.',
      'Last day: do your own grounding outdoors. Write what has changed in your body over this run.',
    ],
  },
  {
    id: 'plants',
    title: 'Plant study',
    about: 'One plant, or one a day, studied the old way: by looking, drawing, smelling and reading, with the plant in front of you. Identify carefully and never eat what you aren’t certain of.',
    need: 'A plant or two you can visit, a notebook, a field guide.',
    links: [
      { label: 'Living Library herbs', app: '/rituals/library', web: '/library/' },
      { label: 'Foraging & garden', app: '/rituals/craft/hearth/forage', web: '/practice/hearth/forage/' },
    ],
    prompts: [
      'Choose a plant you can visit every day: a tree on your road, a weed by the door, a pot on the sill. Write where it is and how you found it.',
      'Draw its leaf, as carefully as you can. Drawing makes you see.',
      'Find its common name, Latin name, and the family it belongs to.',
      'Smell it (leaf rubbed between fingers, flower, bark). Write the smell in your own words.',
      'Look at it from the ground up: root or base, stem, leaves, flowers or buds, seed.',
      'Find out whether it is poisonous to people or pets, and write it down plainly.',
      'Visit at a different time of day. What has changed?',
      'Look for insects or birds that use it. Who are its neighbours?',
      'Find one old folk name or folk use for it, and where it comes from.',
      'Find its traditional correspondences (planet, element) in the Living Library, and see whether they fit what you’ve seen.',
      'Draw the whole plant, roughly.',
      'Note the weather and how the plant is taking it.',
      'Look at it with a magnifier or your phone’s zoom. Something new?',
      'Find out whether it is native where you live, and how it came if it isn’t.',
      'Halfway: write what you know now that you didn’t on day one.',
      'Sit with it quietly for five minutes, and ask it, in your head, how it would like to be known.',
      'Look up a medicinal use, then the evidence for it, and the safety notes. Write all three.',
      'Find a poem, song or story that names it.',
      'Look at its roots if you can do so without harm (a weed you’re pulling anyway).',
      'Notice its stage in the year: bud, leaf, flower, fruit, seed, rest. Note it in the land journal.',
      'Compare it with a look-alike. How do you tell them apart?',
      'Press a leaf or flower (only if it’s common and plentiful).',
      'If it is safe and certainly identified, taste it the old way: a little, as tea or in food. If not, smell it again.',
      'Find its place in a tradition you honour, or note that it has none you know of.',
      'Write a short charm or blessing using it, to keep in your Grimoire.',
      'Give something back: water it, clear rubbish round it, collect its seed to spread.',
      'Draw it again. Compare with your first drawing.',
      'Write a page about it for your Grimoire: names, look, safety, lore, your own notes.',
      'Introduce it to someone: show them the plant and tell them one thing.',
      'Last day: visit it, thank it, and write how this run changed how you see plants you pass every day.',
    ],
  },
  {
    id: 'ancestors',
    title: 'Ancestor days',
    about: 'A short daily practice for your beloved dead: remembering, learning, cooking, writing. For blood family, chosen family and the people whose names are lost alike.',
    need: 'A photo, a name or a candle; your ancestor pages.',
    links: [
      { label: 'Ancestors', app: '/rituals/craft/hedge/ancestors', web: '/practice/hedge/ancestors/' },
      { label: 'Family tree', app: '/rituals/craft/hedge/ancestors/tree', web: '/practice/hedge/ancestors/tree/' },
    ],
    prompts: [
      'Write the names of every ancestor you can remember, as far back as you can. Then add: “and all those whose names are lost.”',
      'Light a candle (or a lamp) and say one name aloud.',
      'Write down a story about one of them, as it was told to you.',
      'Find a photograph, a recipe or an object of theirs. Write what it holds.',
      'Set out a glass of water for them, and pour it onto earth in the morning.',
      'Ask an older relative about someone you never met. Write what they say.',
      'Cook something they would have eaten, or something from where they came from.',
      'Write a letter to one of them about your life now.',
      'Learn one fact about the place one of them lived.',
      'Add someone to your ancestor pages, with as much as you know.',
      'Remember a chosen ancestor: a teacher, a writer, a friend, someone you were shaped by.',
      'Sing or play a song they loved.',
      'Write about something you inherited that isn’t an object: a laugh, a temper, a skill.',
      'Sit with their photo or name and listen for five minutes.',
      'Halfway: who has come forward most in these days?',
      'Find out what work one of them did, and how it was done then.',
      'Remember the hard ones honestly. You need not honour harm; you can draw a line.',
      'Write the names in your family tree that are blank. Light a candle for them.',
      'Visit a grave, a church, a place one of them knew, or look at it on a map.',
      'Do something kind in their name.',
      'Write a prayer or blessing for your line, forwards and backwards.',
      'Look for an ancestor festival in your calendar, and plan how you’ll keep it.',
      'Make a small ancestor shrine, or tidy the one you have.',
      'Write about how your ancestors would see your practice. How do you feel about that?',
      'Learn a word or phrase in a language one of them spoke.',
      'Tell someone younger a story about one of them.',
      'Offer bread and salt, or a food they loved, and share it after.',
      'Read your letter from day eight, and write the reply you imagine.',
      'Write what you want to be remembered for, as a future ancestor.',
      'Last day: thank them all, the known and the lost, and set a small regular practice to carry on.',
    ],
  },
];

export const themeById = (id: string) => THEMES.find((t) => t.id === id) ?? null;

/** The day-by-day prompts for a run: an even spread of the theme's thirty, first and last always kept. */
export function promptsFor(theme: Theme, length: number): string[] {
  const n = Math.max(1, Math.min(theme.prompts.length, Math.round(length)));
  if (n === 1) return [theme.prompts[0]];
  const last = theme.prompts.length - 1;
  const picks: number[] = [];
  for (let i = 0; i < n; i++) picks.push(Math.round((i * last) / (n - 1)));
  return picks.map((i) => theme.prompts[i]);
}

/** A prompt for its day, with tonight's moon put in where the theme asks for it. */
export function promptOn(prompt: string, date: Date): string {
  return prompt.replace(/\{phase\}/g, () => moonState(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 21)).name.toLowerCase());
}

/** A day checked in: by hand, or (`from`) counted from that tool's own record of the day, never saved twice. */
export type CheckIn = { on: string; note: string; from?: string };

/**
 * Themes that are a tool already in the app: the day is done when that tool
 * has its own record for the day (a devotion kept, a sit logged, a moon or
 * cycle note written, a card drawn and kept in your readings). The check-in
 * opens the tool; nothing separate is written.
 */
export const TOOL_THEMES: Partial<Record<ThemeId, { label: string; app: string; what: string }>> = {
  devotion: { label: 'Open daily devotion', app: '/rituals/craft/solitary/devotion', what: 'your daily devotion' },
  grounding: { label: 'Sit (Meditation)', app: '/rituals/craft/meditation', what: 'a sit in Meditation' },
  moon: { label: 'Write today’s moon note', app: '/rituals/cycle/log', what: 'your note in Cycle & Moon' },
  tarot: { label: 'Draw today’s card', app: '/rituals/divination/draw', what: 'a card drawn and kept in your readings' },
};

/** The challenge with each day the tool has a record for counted as checked in (as `from`), hand check-ins kept as they are. */
export function withToolDays(c: Challenge, dates: Iterable<string>): Challenge {
  const tool = TOOL_THEMES[c.theme];
  if (!tool) return c;
  const set = new Set(dates);
  let checkins = c.checkins;
  for (let n = 1; n <= c.length; n++) {
    const date = dateOfDay(c, n);
    if (!checkins[String(n)] && set.has(date)) checkins = { ...checkins, [String(n)]: { on: date, note: '', from: tool.what } };
  }
  return checkins === c.checkins ? c : { ...c, checkins };
}

export type Challenge = {
  theme: ThemeId;
  length: ChallengeLength;
  /** The first day, YYYY-MM-DD. */
  start: string;
  /** Check-ins by day number (1-based). */
  checkins: Record<string, CheckIn>;
  reflection: string;
  /** When the reflection was written, or blank. */
  finished: string;
};

export function newChallenge(theme: ThemeId, length: ChallengeLength, start: string): Challenge {
  return { theme, length, start, checkins: {}, reflection: '', finished: '' };
}

export function normalizeChallenge(raw: unknown): Challenge | null {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const theme = themeById(String(r.theme));
  const start = typeof r.start === 'string' && dateFromKey(r.start) ? r.start : '';
  if (!theme || !start) return null;
  const length = (LENGTHS as readonly number[]).includes(Number(r.length)) ? (Number(r.length) as ChallengeLength) : 7;
  const checkins: Record<string, CheckIn> = {};
  const raw2 = r.checkins && typeof r.checkins === 'object' ? (r.checkins as Record<string, unknown>) : {};
  for (const [k, v] of Object.entries(raw2)) {
    const n = Number(k);
    const c = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
    if (Number.isInteger(n) && n >= 1 && n <= length && typeof c.on === 'string' && dateFromKey(c.on)) checkins[String(n)] = { on: c.on, note: typeof c.note === 'string' ? c.note : '' };
  }
  return { theme: theme.id, length, start, checkins, reflection: typeof r.reflection === 'string' ? r.reflection : '', finished: typeof r.finished === 'string' ? r.finished : '' };
}

const DAY = 86_400_000;
const daysBetween = (a: string, b: string) => Math.round((dateFromKey(b)!.getTime() - dateFromKey(a)!.getTime()) / DAY);

/** Which day of the run `now` is (1-based); 0 before it starts, length + 1 once it's over. */
export function dayNumber(c: Challenge, now: Date): number {
  const n = daysBetween(c.start, localDateKey(now)) + 1;
  return n < 1 ? 0 : Math.min(n, c.length + 1);
}

/** The calendar date of day `n`, as a key. */
export function dateOfDay(c: Challenge, n: number): string {
  const d = dateFromKey(c.start)!;
  return localDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n - 1));
}

export function checkIn(c: Challenge, n: number, note: string, on: string): Challenge {
  if (n < 1 || n > c.length) return c;
  return { ...c, checkins: { ...c.checkins, [String(n)]: { on, note } } };
}

export function uncheck(c: Challenge, n: number): Challenge {
  const next = { ...c.checkins };
  delete next[String(n)];
  return { ...c, checkins: next };
}

export type Progress = { day: number; done: number; streak: number; best: number; over: boolean; todayDone: boolean };

/**
 * How it's going. The streak counts back from today (or yesterday, when today
 * isn't checked yet) over days checked in; the best is the longest run.
 */
export function progressOf(c: Challenge, now: Date): Progress {
  const day = dayNumber(c, now);
  const has = (n: number) => !!c.checkins[String(n)];
  const done = Object.keys(c.checkins).length;
  let best = 0;
  let run = 0;
  for (let n = 1; n <= c.length; n++) {
    run = has(n) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  const upTo = Math.min(day, c.length);
  let streak = 0;
  let n = has(upTo) ? upTo : upTo - 1;
  while (n >= 1 && has(n)) {
    streak++;
    n--;
  }
  return { day, done, streak, best, over: day > c.length, todayDone: day >= 1 && day <= c.length && has(day) };
}

/** The finish: ready for a reflection once the run is over or every day is checked. */
export const readyToFinish = (c: Challenge, now: Date) => !c.finished && (dayNumber(c, now) > c.length || Object.keys(c.checkins).length >= c.length);

export const FINISH_QUESTIONS = [
  'What did you notice on the days you did it, and on the days you didn’t?',
  'Which prompt stayed with you?',
  'What will you keep doing, and how often, honestly?',
];

export const challengeTitle = (c: Challenge) => `${themeById(c.theme)?.title ?? 'A challenge'}, ${c.length} days`;
