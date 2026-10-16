// Petition papers: a written petition is set on the altar (folded under a
// candle, or kept in the altar's petition box) and later burned in a
// heatproof bowl, buried, or released on a night you choose. The box is the
// synced craft collection `altar.petitions` (one entry per petition, carrying
// its altarId); burned, buried and released petitions stay in it as history.
// The paper on the altar is a plain tool object the website shows by its
// symbol. Pure, so it can be tested.

import { boxHeightFraction, displayBox, NEW_OBJECT_SIZE, savedFromBox } from './geometry.ts';
import { layerOf, nextLayer } from './layers.ts';
import { appStateOf, ensureLivingState, setAppState } from './livingState.ts';
import { julianDayToDate, lunationNear, phaseJde } from '../moon.ts';
import type { SavedObject } from './types.ts';

export const PETITIONS = 'altar.petitions';

export type PetitionTiming = 'now' | 'new-moon' | 'waxing' | 'full-moon' | 'waning';
export type PetitionStatus = 'waiting' | 'scheduled' | 'burned' | 'buried' | 'released';

export type Petition = {
  altarId: string;
  title: string;
  words: string;
  intention: string;
  timing: PetitionTiming;
  /** The moon it was timed for, if any (ISO). */
  timingAt: string;
  /** Where it sits: folded under a candle, or in the petition box. */
  place: 'candle' | 'box';
  /** The altarObjectId of the paper on the altar, and of the candle it sits under. */
  objectId: string;
  candleId: string;
  status: PetitionStatus;
  /** The night it's to be released (ISO), when scheduled. */
  releaseOn: string;
  releaseWhy: string;
  doneAt: string;
  writtenAt: string;
};

export const TITLE_MAX = 60;
export const WORDS_MAX = 2000;

export const PETITION_TIMINGS: { id: PetitionTiming; label: string; detail: string }[] = [
  { id: 'now', label: 'Now', detail: 'Whatever the moon is doing; the need is now.' },
  { id: 'new-moon', label: 'New Moon', detail: 'For beginnings: plant it in the dark.' },
  { id: 'waxing', label: 'Waxing moon', detail: 'For growth and drawing things in.' },
  { id: 'full-moon', label: 'Full Moon', detail: 'For fullness, clarity and answers.' },
  { id: 'waning', label: 'Waning moon', detail: 'For release, banishing and letting go.' },
];

const DAY = 86_400_000;
const phaseAfter = (from: Date, offset: 0 | 0.5, phase: 'new' | 'full') => {
  for (let k = lunationNear(from) - 1; ; k++) {
    const date = julianDayToDate(phaseJde(k + offset, phase));
    if (date.getTime() > from.getTime()) return date;
  }
};

/** When a timing next comes round: its moon (the waxing and waning moons start the day after the new and full). */
export function timingDate(timing: PetitionTiming, now: Date): Date | null {
  if (timing === 'now') return null;
  if (timing === 'new-moon') return phaseAfter(now, 0, 'new');
  if (timing === 'full-moon') return phaseAfter(now, 0.5, 'full');
  if (timing === 'waxing') return new Date(phaseAfter(new Date(now.getTime() - DAY), 0, 'new').getTime() + DAY);
  return new Date(phaseAfter(new Date(now.getTime() - DAY), 0.5, 'full').getTime() + DAY);
}

export type PetitionInput = { title: string; words: string; intention: string; timing: PetitionTiming };

export function newPetition(altarId: string, input: PetitionInput, now: Date): Petition {
  const at = timingDate(input.timing, now);
  return {
    altarId,
    title: input.title.replace(/\s+/g, ' ').trim().slice(0, TITLE_MAX) || 'My petition',
    words: input.words.trim().slice(0, WORDS_MAX),
    intention: input.intention.trim(),
    timing: input.timing,
    timingAt: at ? at.toISOString() : '',
    place: 'box',
    objectId: '',
    candleId: '',
    status: 'waiting',
    releaseOn: '',
    releaseWhy: '',
    doneAt: '',
    writtenAt: now.toISOString(),
  };
}

/**
 * The folded paper on the altar: a plain tool with no picture, which the
 * website shows as its symbol and the app draws as a folded paper. Under a
 * candle it sits at the candle's foot, one layer beneath it; otherwise in the
 * middle of the altar.
 */
export function petitionObject(petition: Petition, entryId: string, existing: SavedObject[], now: string, candle?: SavedObject | null): SavedObject {
  const size = NEW_OBJECT_SIZE * 0.8;
  let cx = 0.5;
  let cy = 0.72;
  let zIndex = String(nextLayer(existing));
  if (candle) {
    const box = displayBox(candle);
    cx = box.cx;
    // At the candle's foot, overlapping its base a little.
    cy = Math.min(1 - boxHeightFraction({ size, aspect: 1 }) / 2, box.cy + boxHeightFraction(box) / 2 - boxHeightFraction({ size, aspect: 1 }) * 0.25);
    zIndex = String(Math.max(1, layerOf(candle) - 1));
  }
  const object: SavedObject = {
    imagePath: '',
    fallbackSymbol: '📜',
    label: `Petition: ${petition.title}`,
    type: 'tool',
    entityId: '',
    instanceId: '',
    tool: 'petition-paper',
    form: 'folded',
    plaqueText: petition.title,
    scale: '1',
    rotation: candle ? '0' : '-6',
    flipped: 'false',
    locked: 'false',
    glowing: 'false',
    lit: 'false',
    livingState: '',
    altarObjectId: '',
    groupId: '',
    ...savedFromBox({ cx, cy, size, aspect: 1 }),
    zIndex,
  };
  const ready = ensureLivingState(object, now);
  return setAppState(ready, { petition: { entryId } }, now, false);
}

export const isPetitionPaper = (object: SavedObject) => object.type === 'tool' && object.tool === 'petition-paper';

export const petitionEntryOf = (object: SavedObject) => {
  const raw = appStateOf(object).petition as { entryId?: string } | undefined;
  return raw && typeof raw.entryId === 'string' ? raw.entryId : '';
};

export type PetitionEnd = 'burned' | 'buried' | 'released';

/** It's done: burned, buried or released. It stays in the box's history. */
export function finishPetition(petition: Petition, how: PetitionEnd, now: Date): Petition {
  return { ...petition, status: how, doneAt: now.toISOString(), releaseOn: how === 'released' ? petition.releaseOn || now.toISOString() : petition.releaseOn };
}

export function schedulePetition(petition: Petition, night: Date, why: string): Petition {
  return { ...petition, status: 'scheduled', releaseOn: night.toISOString(), releaseWhy: why };
}

export const isOpen = (p: Petition) => p.status === 'waiting' || p.status === 'scheduled';

/** A scheduled release whose night has come. */
export const releaseDue = (p: Petition, now: Date) => p.status === 'scheduled' && Date.parse(p.releaseOn) - 6 * 3_600_000 <= now.getTime();

export type Night = { id: string; label: string; date: Date; why: string };

/** Local evening (9pm) of a date. */
const evening = (date: Date) => {
  const d = new Date(date);
  d.setHours(21, 0, 0, 0);
  return d;
};

/**
 * Nights to release a petition on: tonight, the first night of the waning
 * moon, the dark moon, and Samhain when it's near (31 October in the north,
 * 30 April in the south).
 */
export function releaseNights(now: Date, latitude: number | null = null): Night[] {
  const nights: Night[] = [{ id: 'tonight', label: 'Tonight', date: evening(now), why: 'Tonight' }];
  const full = phaseAfter(new Date(now.getTime() - DAY), 0.5, 'full');
  const waning = new Date(full.getTime() + DAY);
  if (waning.getTime() > now.getTime()) nights.push({ id: 'waning', label: 'The waning moon', date: evening(waning), why: 'The first night of the waning moon, for letting go' });
  const dark = new Date(phaseAfter(now, 0, 'new').getTime() - DAY);
  if (dark.getTime() > now.getTime()) nights.push({ id: 'dark', label: 'The dark moon', date: evening(dark), why: 'The dark moon, the last night before the New Moon' });
  const south = latitude != null && latitude < 0;
  const year = now.getFullYear();
  for (const y of [year, year + 1]) {
    const samhain = south ? new Date(y, 3, 30, 21) : new Date(y, 9, 31, 21);
    const away = samhain.getTime() - now.getTime();
    if (away > -3 * 3_600_000 && away < 120 * DAY) {
      nights.push({ id: 'samhain', label: 'Samhain', date: samhain, why: 'Samhain, when the veil is thin and the year turns' });
      break;
    }
  }
  return nights.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** This altar's petitions: those still open (oldest first) and the finished ones (newest first). */
export function petitionBox<T extends { id: string; data: Petition }>(entries: T[], altarId: string): { open: T[]; history: T[] } {
  const mine = entries.filter((e) => e.data && e.data.altarId === altarId);
  return {
    open: mine.filter((e) => isOpen(e.data)).sort((a, b) => a.data.writtenAt.localeCompare(b.data.writtenAt)),
    history: mine.filter((e) => !isOpen(e.data)).sort((a, b) => b.data.doneAt.localeCompare(a.data.doneAt)),
  };
}

export const PETITION_ENDS: Record<PetitionEnd, string> = {
  burned: 'Burned',
  buried: 'Buried',
  released: 'Released',
};

/** The fire-safety words shown with a burning. */
export const FIRE_SAFETY =
  'If you burn it for real: use a fireproof bowl or cauldron on a heat-safe surface, with sand or salt in the bottom, away from curtains, hair and loose sleeves. Fold the paper small, light one corner with a long match, and keep water or a lid close by. Never leave it burning alone. Let the ash cool completely before you scatter it or bury it.';
