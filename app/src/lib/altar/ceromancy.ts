// Reading a candle after it burns (ceromancy): what the flame, the smoke and
// the wax did, and what folk candle-readers have traditionally taken those
// signs to mean. Offered as a way to reflect on a working, not as prophecy;
// drafts, wicks and wax explain most of it, and the reading is yours.
// Each reading is kept with the burn it describes, in the candle's
// `livingState.app.readings`. Pure, so it can be tested.

import { appStateOf, candleLife, isCandle, logAppEvent, readLivingState, setAppState, type BurnRecord } from './livingState.ts';
import type { SavedObject } from './types.ts';
import { newId } from './uid.ts';

export type Sign = { id: string; label: string; meaning: string };

export const FLAME_SIGNS: Sign[] = [
  { id: 'tall-steady', label: 'Tall and steady', meaning: 'A tall, still flame is read as a working with strength behind it: the way is fairly open and the energy is going where you sent it.' },
  { id: 'low', label: 'Low or small', meaning: 'A low flame is often taken to mean slow going: something is pushing back, or the working needs more time, more care or a second candle.' },
  { id: 'flickering', label: 'Flickering', meaning: 'A flickering flame is read as unsettled energy: doubts, mixed feelings, or a spirit or presence moving close. Ask whether your intention was clear.' },
  { id: 'dancing', label: 'Dancing', meaning: 'A lively, dancing flame is usually a happy sign: a quick, eager working, with lots of energy, though it may be scattered.' },
  { id: 'sputtering', label: 'Sputtering or crackling', meaning: 'Sputters and crackles are read as communication or resistance: someone talking about the matter, or obstacles being burned through.' },
  { id: 'jumping', label: 'Jumping or flaring', meaning: 'A flame that leaps up suddenly is read as a burst of power or a strong answer, sometimes as things moving faster than expected.' },
  { id: 'went-out', label: 'Went out by itself', meaning: 'A candle that goes out on its own is traditionally read as the work being done for now, or as a pause: set it aside, then decide calmly whether to relight it.' },
];

export const SMOKE_SIGNS: Sign[] = [
  { id: 'none', label: 'Hardly any', meaning: 'Little smoke is read as a clean, unhindered burn.' },
  { id: 'white', label: 'White or pale', meaning: 'White smoke is read as blessing and clear purpose: the working is being received kindly.' },
  { id: 'black', label: 'Black, or soot on the glass', meaning: 'Black smoke or soot is read as something being drawn out or burned away. Many readers cleanse the space, or the glass, and try again.' },
  { id: 'toward', label: 'Drifting toward you', meaning: 'Smoke drifting toward you is read as the working coming back to you: the thing you asked for moving your way.' },
  { id: 'away', label: 'Drifting away from you', meaning: 'Smoke drifting away is read as the working going out into the world, carried to where it needs to go.' },
];

export const WAX_SIGNS: Sign[] = [
  { id: 'clean', label: 'Burned clean', meaning: 'A clean burn with little left is read as a complete, successful working.' },
  { id: 'tunnelled', label: 'Tunnelled down the middle', meaning: 'Tunnelling is read as focus without reach: the heart of the matter was touched, but not everything around it.' },
  { id: 'pooled-side', label: 'Pooled or dripped to one side', meaning: 'Wax running to one side is read as the working pulling one way: some say the side it ran to shows where effort is needed.' },
  { id: 'shapes', label: 'Left drip shapes', meaning: 'Drips and shapes are read like tea leaves: look at them for a moment and see what they bring to mind.' },
  { id: 'remnant', label: 'Left a remnant', meaning: 'A remnant left behind is read as something unfinished, or a piece of the working to keep, bury or let go of with care.' },
];

export type RemnantChoice = 'keep' | 'bury' | 'bin';
export const REMNANT_CHOICES: { id: RemnantChoice; label: string; detail: string }[] = [
  { id: 'keep', label: 'Keep it', detail: 'Kept as a charm or to add to a later working.' },
  { id: 'bury', label: 'Bury it', detail: 'Buried, to let the earth finish the work.' },
  { id: 'bin', label: 'Bin it', detail: 'Thrown away, to be done with it.' },
];

export type FlameReading = {
  id: string;
  /** The burn it reads (burnHistory eventId, or its start). */
  burnId: string;
  at: string;
  flame: string;
  smoke: string[];
  wax: string[];
  notes: string;
  /** The reading as written at the time. */
  text: string;
  journalId?: string;
};

export type ReadingInput = { flame: string; smoke: string[]; wax: string[]; notes: string };

const find = (list: Sign[], id: string) => list.find((s) => s.id === id);

/** The few lines a reading is made of, in order: flame, smoke, wax. */
export function readingLines(input: Pick<ReadingInput, 'flame' | 'smoke' | 'wax'>): string[] {
  const lines: string[] = [];
  const flame = find(FLAME_SIGNS, input.flame);
  if (flame) lines.push(flame.meaning);
  for (const id of input.smoke) {
    const sign = find(SMOKE_SIGNS, id);
    if (sign) lines.push(sign.meaning);
  }
  for (const id of input.wax) {
    const sign = find(WAX_SIGNS, id);
    if (sign) lines.push(sign.meaning);
  }
  return lines;
}

/** A short summary in a sentence or two, before the details. */
export function readingSummary(input: Pick<ReadingInput, 'flame' | 'smoke' | 'wax'>): string {
  const strong = input.flame === 'tall-steady' || input.flame === 'dancing' || input.flame === 'jumping';
  const slow = input.flame === 'low' || input.flame === 'flickering';
  const clearing = input.smoke.includes('black');
  const blessed = input.smoke.includes('white');
  const complete = input.wax.includes('clean');
  const unfinished = input.wax.includes('remnant') || input.wax.includes('tunnelled');
  if (!input.flame && !input.smoke.length && !input.wax.length) return '';
  if (strong && (complete || blessed) && !clearing) return 'A bright, willing burn: folk readers would call this a working that went out well.';
  if (input.flame === 'went-out') return 'The candle stopped on its own. Traditionally that asks for a pause before you decide what comes next.';
  if (clearing && unfinished) return 'A heavy, working burn: something was being cleared, and there may be more to do.';
  if (clearing) return 'A clearing burn: readers would say something was being drawn out or burned away.';
  if (slow && unfinished) return 'A slow burn with work left over: give it time, or come back to it with a fresh candle.';
  if (slow) return 'A quiet, careful burn: readers would say this one is taking its time.';
  if (strong) return 'A lively burn with plenty of energy behind it.';
  if (complete) return 'A clean, complete burn.';
  return 'A mixed burn: read the signs below and see which ones ring true.';
}

/** The whole reading as one piece of text (for the journal and the candle's story). */
export function readingText(input: ReadingInput): string {
  return [readingSummary(input), ...readingLines(input), input.notes.trim() ? `My notes: ${input.notes.trim()}` : '']
    .filter(Boolean)
    .join('\n\n');
}

export function readingsOf(object: SavedObject): FlameReading[] {
  const list = appStateOf(object).readings;
  return Array.isArray(list) ? (list as FlameReading[]).filter((r) => r && typeof r.burnId === 'string') : [];
}

const burnIdOf = (burn: BurnRecord) => String(burn.eventId || burn.litAt || burn.startedAt || '');
const burnEnd = (burn: BurnRecord) => Date.parse(String(burn.extinguishedAt || burn.endedAt || ''));

/** The candle's most recent finished burn, or null. */
export function lastBurn(object: SavedObject): BurnRecord | null {
  if (!isCandle(object)) return null;
  const list = readLivingState(object, '').candle?.burnHistory ?? [];
  return list.length ? list[list.length - 1] : null;
}

/** How long after a burn the app still asks how it went. */
export const READING_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

/** The burn that's waiting to be read: the last one, recently ended, not read yet. Null otherwise. */
export function burnToRead(object: SavedObject, now: number = Date.now()): BurnRecord | null {
  if (!isCandle(object) || object.lit === 'true') return null;
  const burn = lastBurn(object);
  if (!burn) return null;
  const id = burnIdOf(burn);
  if (!id || readingsOf(object).some((r) => r.burnId === id)) return null;
  const ended = burnEnd(burn);
  return Number.isFinite(ended) && now - ended <= READING_WINDOW_MS ? burn : null;
}

/** Keep a reading of a burn with the candle (the last burn when none is named). */
export function recordReading(object: SavedObject, input: ReadingInput, now: string, burn: BurnRecord | null = lastBurn(object)): SavedObject {
  if (!isCandle(object) || !burn) return object;
  const reading: FlameReading = {
    id: newId(),
    burnId: burnIdOf(burn),
    at: now,
    flame: input.flame,
    smoke: [...input.smoke],
    wax: [...input.wax],
    notes: input.notes.trim(),
    text: readingText(input),
  };
  const readings = [...readingsOf(object).filter((r) => r.burnId !== reading.burnId), reading];
  return setAppState(object, { readings }, now);
}

/** Note the journal entry a reading was saved to. */
export function linkReadingJournal(object: SavedObject, readingId: string, journalId: string, now: string): SavedObject {
  const readings = readingsOf(object).map((r) => (r.id === readingId ? { ...r, journalId } : r));
  return setAppState(object, { readings }, now, false);
}

export type Remnant = { choice: RemnantChoice; at: string };

export function remnantOf(object: SavedObject): Remnant | null {
  const raw = appStateOf(object).remnant as Remnant | undefined;
  return raw && REMNANT_CHOICES.some((c) => c.id === raw.choice) ? raw : null;
}

/** What became of a burned-down candle's remnant. */
export function setRemnant(object: SavedObject, choice: RemnantChoice, now: string): SavedObject {
  if (!isCandle(object) || !candleLife(object, Date.parse(now) || Date.now()).spent) return object;
  const detail = REMNANT_CHOICES.find((c) => c.id === choice)!;
  return logAppEvent(object, { kind: 'remnant', text: `Its wax remnant was ${detail.id === 'keep' ? 'kept' : detail.id === 'bury' ? 'buried' : 'thrown away'}.` }, now, {
    remnant: { choice, at: now },
  });
}
