// Daily devotion for the solitary practitioner: a short practice for the
// morning and one for the evening, chosen by the date so everyone's day has
// its own and it never repeats two days running. Kept gently: a week of dots,
// never a streak to lose. All the prompts are original to the app.
// Pure, so it can be tested.

export type DevotionKind = 'intention' | 'gratitude' | 'breath' | 'reading' | 'reflection' | 'release' | 'thanks';

export type DevotionPrompt = {
  id: string;
  kind: DevotionKind;
  title: string;
  /** What to do, in a few sentences. */
  text: string;
  /** For readings: a short passage to read slowly, then the prompt in `text`. */
  reading?: string;
};

export const KIND_LABELS: Record<DevotionKind, string> = {
  intention: 'Intention',
  gratitude: 'Gratitude',
  breath: 'Breath',
  reading: 'A short reading',
  reflection: 'Reflection',
  release: 'Release',
  thanks: 'Thanks',
};

// Interleaved by kind so neighbouring days feel different.
export const MORNING: DevotionPrompt[] = [
  { id: 'm-one-word', kind: 'intention', title: 'One word for today', text: 'Before you reach for your phone, choose one word to carry through the day: steady, kind, brave, open. Say it once aloud, and come back to it whenever the day gets loud.' },
  { id: 'm-light', kind: 'gratitude', title: 'The first light', text: 'Find the light: a window, a lamp, the sky. Name three things you can see that you’re glad of this morning, however small.' },
  { id: 'm-four-breaths', kind: 'breath', title: 'Four breaths', text: 'Stand with your feet flat on the floor. Breathe in for four, hold for four, out for four, hold for four. Do it four times, and feel the floor holding you up.' },
  {
    id: 'm-reading-roots',
    kind: 'reading',
    title: 'Roots',
    reading: 'A tree does not decide each morning whether to keep its roots. It simply holds on, quietly, underneath everything, and the holding is what lets it lean into the wind.',
    text: 'What is holding you up today that you don’t usually notice? Give it a moment of thanks.',
  },
  { id: 'm-hands', kind: 'intention', title: 'What your hands will do', text: 'Look at your hands. Think of one thing they’ll do today that matters: a meal, a message, a piece of work, a kindness. Ask that it be done well.' },
  { id: 'm-body', kind: 'gratitude', title: 'Thanks to the body', text: 'Starting at your feet and moving up, thank each part of your body for one thing it does for you. Be honest and be kind; it’s carried you this far.' },
  { id: 'm-elements', kind: 'breath', title: 'Four elements, four breaths', text: 'Breathe in earth and feel heavy and settled. Breathe in water and soften. Breathe in fire and wake up. Breathe in air and feel clear. Breathe out slowly after each one.' },
  {
    id: 'm-reading-kettle',
    kind: 'reading',
    title: 'The kettle',
    reading: 'Every tradition has its morning offering. Yours might be the first cup, poured while the house is still quiet. It isn’t small because it’s ordinary; it’s holy because you do it every day.',
    text: 'Make your first drink slowly and on purpose. Offer the first sip, in thought, to whatever you hold sacred.',
  },
  { id: 'm-gentle', kind: 'intention', title: 'Where to be gentle', text: 'Think through today. Where will it be hard? Decide now, before it comes, how you’ll be gentle with yourself there.' },
  { id: 'm-one-person', kind: 'gratitude', title: 'One person', text: 'Bring to mind someone who made your life better, living or gone. Thank them in your heart, and if you can, tell them today.' },
  { id: 'm-sun-breath', kind: 'breath', title: 'Breathing in the day', text: 'Face the window or the east. Breathe in as if drawing the daylight into your chest, and breathe out anything left over from the night. Seven times.' },
  {
    id: 'm-reading-threshold',
    kind: 'reading',
    title: 'The threshold',
    reading: 'The old ways paid attention to doorways: you stepped over the threshold with your right foot, you blessed it, you didn’t linger on it. Every morning is a threshold, and you cross it whether you notice or not.',
    text: 'When you first step out of the door today, pause and cross it on purpose.',
  },
  { id: 'm-ask', kind: 'intention', title: 'Ask for one thing', text: 'Ask whatever you pray to, or the day itself, for one thing you need: patience, luck, a clear head, a kind word. Ask simply, as you would ask a friend.' },
  { id: 'm-home', kind: 'gratitude', title: 'This home', text: 'Walk through one room and touch three things: a door, a cup, a blanket. Thank the home for keeping you.' },
  { id: 'm-long-out', kind: 'breath', title: 'The long out-breath', text: 'Breathe in for a count of four and out for a count of eight. A longer out-breath tells the body it’s safe. Keep going for a minute.' },
  {
    id: 'm-reading-seed',
    kind: 'reading',
    title: 'The seed',
    reading: 'A seed doesn’t look like anything is happening. For days it only takes in water in the dark. And then, without asking anyone, it splits its own skin open and starts.',
    text: 'What in you is still underground? Give it water today: five minutes of attention.',
  },
  { id: 'm-keep', kind: 'intention', title: 'What to keep', text: 'Choose one promise to yourself for today, small enough to keep: drink water, step outside, eat lunch sitting down. Keep it.' },
  { id: 'm-sky', kind: 'gratitude', title: 'The sky today', text: 'Look up. Whatever the weather, find something beautiful or interesting in today’s sky and let yourself enjoy it for a full breath.' },
  { id: 'm-hum', kind: 'breath', title: 'Hum', text: 'Breathe in through the nose, then hum on the out-breath until it runs out. Feel it in your chest and face. Five hums.' },
  {
    id: 'm-reading-wheel',
    kind: 'reading',
    title: 'The wheel',
    reading: 'Nothing in the year stands still: the light grows and goes, the garden fills and empties, and none of it is failure. You are allowed to have seasons too.',
    text: 'What season are you in right now? Name it without judging it.',
  },
  { id: 'm-shield', kind: 'intention', title: 'A cloak for the day', text: 'Picture a cloak of light or a soft, strong coat settling over your shoulders. Decide what it keeps out today, and what it lets in.' },
  { id: 'm-food', kind: 'gratitude', title: 'Breakfast', text: 'Before you eat or drink, think of everyone it took: the grower, the picker, the driver, the shop. Thank them, and the earth.' },
  { id: 'm-ground', kind: 'breath', title: 'Grounding', text: 'Sit or stand and imagine roots going down from you into the earth. On each in-breath draw steadiness up; on each out-breath let worry run down into the ground.' },
  {
    id: 'm-reading-candle',
    kind: 'reading',
    title: 'A small flame',
    reading: 'A single candle doesn’t light a room the way the sun does. It doesn’t need to. It makes a place you can see by, and that is enough to work, to read, to find your way.',
    text: 'Where can you be a small light today?',
  },
  { id: 'm-speak', kind: 'intention', title: 'How you’ll speak', text: 'Decide how you want to speak today: plainly, kindly, less, more honestly. Touch your throat and ask your words to follow.' },
  { id: 'm-simple', kind: 'gratitude', title: 'Something simple', text: 'Name one thing you’d miss terribly if it were gone: hot water, a pet, a song, your own bed. Thank it.' },
  { id: 'm-box', kind: 'breath', title: 'Shoulders down', text: 'Lift your shoulders up to your ears as you breathe in, hold, then drop them as you breathe out. Three times. Notice where else you’re holding on.' },
  {
    id: 'm-reading-water',
    kind: 'reading',
    title: 'Water finds a way',
    reading: 'Water doesn’t argue with the stone. It goes round, or under, or waits, and over time the stone gives way. Softness is not the same as weakness.',
    text: 'Is there something you’ve been pushing at? Try going round it today.',
  },
  { id: 'm-dedicate', kind: 'intention', title: 'Dedicate the day', text: 'Offer today’s work, whatever it is, to something larger than you: your gods, your ancestors, the people you love, the earth. Say it in one sentence.' },
  { id: 'm-morning-self', kind: 'gratitude', title: 'Yesterday’s you', text: 'Thank yourself for one thing you did yesterday that made today a little easier.' },
];

export const EVENING: DevotionPrompt[] = [
  { id: 'e-three', kind: 'reflection', title: 'Three moments', text: 'Look back over the day and find three moments: one that was good, one that was hard, one you’d nearly forgotten. Let each one be what it was.' },
  { id: 'e-set-down', kind: 'release', title: 'Set it down', text: 'Hold your hands out, palms up, and imagine the day’s weight in them. Then turn them over and let it go. You can pick it up again tomorrow if you need it.' },
  { id: 'e-thanks-day', kind: 'thanks', title: 'Thanks for the day', text: 'Whatever kind of day it was, say thank you to it. You don’t have to have loved it. It brought you here.' },
  { id: 'e-learned', kind: 'reflection', title: 'What today taught', text: 'What did today teach you, about yourself or the world? Write it in a line if you like.' },
  { id: 'e-candle-out', kind: 'release', title: 'Snuff the candle', text: 'Light a candle, and when you’re ready, snuff it out (don’t blow) and let something go with the smoke: a worry, a word you wish you hadn’t said, a plan that didn’t happen.' },
  { id: 'e-thanks-person', kind: 'thanks', title: 'Someone today', text: 'Who helped you today, even without knowing it? Thank them in your mind before you sleep.' },
  { id: 'e-kind', kind: 'reflection', title: 'Where you were kind', text: 'Find one place today where you were kind, to someone else or to yourself. Notice it. That counts.' },
  { id: 'e-wash', kind: 'release', title: 'Wash it off', text: 'When you wash your hands or face tonight, do it slowly and imagine the day’s grime, the inside kind, going down the drain with the water.' },
  { id: 'e-thanks-body', kind: 'thanks', title: 'Thank the body', text: 'Lie down and thank your body for carrying you through today. Let each part go heavy as you thank it.' },
  { id: 'e-again', kind: 'reflection', title: 'If you could do it again', text: 'Is there one moment you’d do differently? Picture yourself doing it the way you’d like. Then forgive the version who didn’t.' },
  { id: 'e-breath-out', kind: 'release', title: 'Breathe it out', text: 'Breathe in, and on a long out-breath let out a sigh, out loud. Do it three times. Let the sound carry the day out of you.' },
  { id: 'e-thanks-home', kind: 'thanks', title: 'Goodnight, house', text: 'Walk round the house turning off the lights, and say goodnight to each room as you go. Thank it for sheltering you.' },
  { id: 'e-felt', kind: 'reflection', title: 'How it felt', text: 'Don’t think about what happened; think about how it felt. Give today a colour, a weather or a single word.' },
  { id: 'e-unfinished', kind: 'release', title: 'Unfinished things', text: 'Name what’s unfinished. Write it down if it helps, and tell yourself plainly: this will keep until tomorrow.' },
  { id: 'e-thanks-food', kind: 'thanks', title: 'What fed you', text: 'Think of what fed you today, food and otherwise: a meal, a conversation, a song, a walk. Thank each one.' },
  { id: 'e-surprise', kind: 'reflection', title: 'A surprise', text: 'What surprised you today, even a little? What does that tell you?' },
  { id: 'e-cord', kind: 'release', title: 'Loosening the cords', text: 'Picture any argument or tension from today as a cord between you and someone else. Breathe out and imagine it loosening, not cut, just slack. You’ll both sleep better.' },
  { id: 'e-thanks-sky', kind: 'thanks', title: 'The night sky', text: 'If you can, look out at the night. Find the moon or a star, or just the dark, and thank it for the turning of the day.' },
  { id: 'e-signs', kind: 'reflection', title: 'Signs and small things', text: 'Did anything catch your attention today: a bird, a number, a song, a stranger’s words? Note it without needing to know what it means.' },
  { id: 'e-salt', kind: 'release', title: 'Salt water', text: 'Stir a pinch of salt into a glass of water. Hold it, and let the day’s heaviness go into it. Pour it down the sink with the tap running.' },
  { id: 'e-thanks-self', kind: 'thanks', title: 'Thank yourself', text: 'Thank yourself for one thing you did today, out loud if you can. It may feel strange. Do it anyway.' },
  { id: 'e-grew', kind: 'reflection', title: 'What grew', text: 'Is there something, a skill, a friendship, a feeling, that grew a little today? Tend it with a moment’s attention.' },
  { id: 'e-worry-jar', kind: 'release', title: 'Into the jar', text: 'Write tonight’s worry on a scrap of paper, fold it away from you and put it in a jar or a drawer. It doesn’t need to sleep in your head.' },
  { id: 'e-thanks-ancestors', kind: 'thanks', title: 'Those before you', text: 'Think of those who came before you, by blood or by choice. Thank them for one thing they gave you that you used today.' },
  { id: 'e-enough', kind: 'reflection', title: 'Enough', text: 'Where was there enough today: enough time, enough food, enough love, enough rest? Notice even one.' },
  { id: 'e-door', kind: 'release', title: 'Closing the door', text: 'When you lock the door tonight, rest your hand on it and say: the day stays out there. Then turn away from it.' },
  { id: 'e-thanks-rest', kind: 'thanks', title: 'Thanks for rest', text: 'As you get into bed, thank the bed, the blanket, the dark, and the sleep that’s coming.' },
  { id: 'e-practice', kind: 'reflection', title: 'Your practice today', text: 'Where did your practice show up today, even outside ritual: a choice, a moment of attention, a small spell of kindness?' },
  { id: 'e-tears', kind: 'release', title: 'Let it be heavy', text: 'If something today hurt, let it hurt for a minute without fixing it. Hand on heart. Then breathe out and let it settle.' },
  { id: 'e-thanks-gods', kind: 'thanks', title: 'A last word', text: 'Say a last word of thanks to whatever you hold sacred, in whatever words come: gods, goddess, spirit, the earth, the people you love.' },
];

const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Days since 1 January 1970 for a local calendar date, so the pick is the same all day wherever you are. */
export function dayIndex(key: string): number {
  return Math.floor(Date.parse(`${key}T00:00:00Z`) / 86_400_000);
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Today's morning and evening practice. */
export function devotionFor(key: string): { morning: DevotionPrompt; evening: DevotionPrompt } {
  const day = dayIndex(key);
  return { morning: MORNING[mod(day, MORNING.length)], evening: EVENING[mod(day * 7 + 11, EVENING.length)] };
}

export type DevotionDay = {
  /** Local date, YYYY-MM-DD. */
  date: string;
  morning: boolean;
  evening: boolean;
  note?: string;
};

type EntryLike = { id: string; updatedAt: string; data: DevotionDay };

/**
 * One record per date. Two phones offline on the same morning can each make
 * one; they're read together, so a practice kept on either counts.
 */
export function daysByDate(entries: EntryLike[]): Map<string, DevotionDay & { ids: string[] }> {
  const out = new Map<string, DevotionDay & { ids: string[] }>();
  const sorted = [...entries].sort((a, b) => (a.updatedAt < b.updatedAt ? -1 : 1));
  for (const e of sorted) {
    const d = e.data;
    if (!d || typeof d.date !== 'string') continue;
    const have = out.get(d.date);
    if (!have) {
      out.set(d.date, { date: d.date, morning: !!d.morning, evening: !!d.evening, note: d.note ?? '', ids: [e.id] });
    } else {
      have.morning = have.morning || !!d.morning;
      have.evening = have.evening || !!d.evening;
      if (d.note) have.note = have.note && have.note !== d.note ? `${have.note}\n\n${d.note}` : d.note;
      have.ids.push(e.id);
    }
  }
  return out;
}

export type WeekDot = { date: string; weekday: string; morning: boolean; evening: boolean; today: boolean };
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** The last seven days, oldest first, ending today. */
export function weekDots(days: Map<string, DevotionDay>, today: Date): WeekDot[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - i));
    const key = dateKey(d);
    const day = days.get(key);
    return { date: key, weekday: WEEKDAYS[d.getDay()], morning: !!day?.morning, evening: !!day?.evening, today: i === 6 };
  });
}

/** A gentle line about the week; never counts a broken streak. */
export function weekWords(dots: WeekDot[]): string {
  const kept = dots.filter((d) => d.morning || d.evening).length;
  if (kept === 0) return 'A fresh week. Any morning or evening is a good one to begin.';
  if (kept === 7) return 'You came back to your practice every day this week.';
  if (kept >= 4) return `You kept your practice on ${kept} of the last 7 days.`;
  return `You came to your practice on ${kept} ${kept === 1 ? 'day' : 'days'} this week. Every time counts.`;
}

/** Which practice to show first: morning until mid-afternoon, then evening. */
export const eveningFirst = (now: Date) => now.getHours() >= 15;

export const NOTE_MAX = 2000;
