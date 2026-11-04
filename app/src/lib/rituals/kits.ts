// Moon and sabbat kits: for each phase of the moon and each sabbat of the
// Wheel, everything for the night in one place, gathered from what the app
// already holds. The altar set-up is Tonight's altar for that day (altar/
// tonight.ts), placed in one tap; the correspondences and the ritual come
// from the day's own holy page (lib/holy) and its premade working; the
// reading is the spread for the time (divination/seasonal.ts and draw.ts);
// the journal prompt is the kit's own. Pure, so it can be tested.

import { tonightAltar, type TonightAltar } from '../altar/tonight.ts';
import { spreadById } from '../divination/draw.ts';
import { nearSabbat } from '../divination/seasonal.ts';
import { holyPage, moonRef } from '../holy/index.ts';
import { moonState } from '../moon.ts';
import { premadeById, type Premade } from './premade/index.ts';

export type KitKind = 'moon' | 'sabbat';

export type Kit = {
  /** The holy page it belongs to: "moon-full", "wheel-samhain". */
  ref: string;
  kind: KitKind;
  title: string;
  /** Herbs, stones and colours from the holy page, to open in the Library. */
  correspondences: { herbs: string[]; crystals: string[]; colors: string[] };
  /** A short ritual from the premade workings. */
  premade: Premade | null;
  prompt: string;
  spread: { id: string; label: string };
  /** What Tonight's altar is set for: the sabbat (if one) and the moon phase's name. */
  altar: { holiday: { id: string; name: string } | null; moon: string };
};

type MoonDef = { moon: string; spread: string; prompt: string };

const MOONS: Record<string, MoonDef> = {
  'moon-dark': { moon: 'New Moon', spread: 'shadow-work', prompt: 'What needs rest in you tonight, and what are you ready to stop carrying?' },
  'moon-new': { moon: 'New Moon', spread: 'new-moon', prompt: 'What do you want to begin this month? Write it as if it has already taken root.' },
  'moon-waxing-crescent': { moon: 'Waxing Crescent', spread: 'new-moon', prompt: 'What small step can you take this week towards what you set at the new moon?' },
  'moon-first-quarter': { moon: 'First Quarter', spread: 'situation-action-outcome', prompt: 'What is standing in the way, and what would it take to act anyway?' },
  'moon-waxing-gibbous': { moon: 'Waxing Gibbous', spread: 'full-moon', prompt: 'What is nearly ready? What could you tend, adjust or give more time?' },
  'moon-full': { moon: 'Full Moon', spread: 'full-moon', prompt: 'What has the light shown you this month? What are you grateful for, and what can go?' },
  'moon-waning-gibbous': { moon: 'Waning Gibbous', spread: 'full-moon', prompt: 'What have you learned since the full moon, and who could you share it with?' },
  'moon-last-quarter': { moon: 'Last Quarter', spread: 'full-moon', prompt: 'What are you ready to release, forgive or finish before the month turns?' },
  'moon-waning-crescent': { moon: 'Waning Crescent', spread: 'shadow-work', prompt: 'Before the dark moon: what would you like to rest, clear away or leave behind?' },
};

/** The moon kits, from the dark through the full and back. */
export const MOON_KIT_REFS = Object.keys(MOONS);

const SABBATS: Record<string, { name: string; prompt: string }> = {
  samhain: { name: 'Samhain', prompt: 'Who among your dead would you like to remember tonight? Write them a few lines, or write what they gave you.' },
  yule: { name: 'Yule', prompt: 'In the longest night, what light are you keeping? What would you like the returning sun to grow?' },
  imbolc: { name: 'Imbolc', prompt: 'What is stirring under the frost in your life? What first small thing could you tend?' },
  ostara: { name: 'Ostara', prompt: 'Where in your life are things in balance, and where do they lean? What seed would you plant now?' },
  beltane: { name: 'Beltane', prompt: 'What makes you feel most alive? Where would you like more joy, warmth or love this summer?' },
  litha: { name: 'Litha', prompt: 'At the height of the sun, what has come to full flower for you? What would you like to celebrate?' },
  lammas: { name: 'Lammas', prompt: 'What is your first harvest this year? What did it cost you, and what will you share?' },
  mabon: { name: 'Mabon', prompt: 'Give thanks for three things this year has brought. What will you let fall with the leaves?' },
};

/** The sabbat kits, in the Wheel's order from Samhain. */
export const SABBAT_KIT_REFS = Object.keys(SABBATS).map((id) => `wheel-${id}`);

const spreadOf = (id: string) => ({ id, label: spreadById(id)?.label ?? id });

/** The kit for a holy page's ref ("moon-full", "wheel-samhain", or a southern "wheel_south-…"), or null. */
export function kitFor(ref: string | null | undefined): Kit | null {
  const key = String(ref ?? '').replace(/^wheel_south-/, 'wheel-');
  const page = holyPage(key);
  if (!page) return null;
  const c = page.correspondences;
  const correspondences = { herbs: c.herbs ?? [], crystals: c.crystals ?? [], colors: c.colors ?? [] };
  const premade = premadeById(page.ritual.premade);
  const moon = MOONS[key];
  if (moon) return { ref: key, kind: 'moon', title: page.title, correspondences, premade, prompt: moon.prompt, spread: spreadOf(moon.spread), altar: { holiday: null, moon: moon.moon } };
  const sabbat = key.startsWith('wheel-') ? key.slice('wheel-'.length) : '';
  const def = SABBATS[sabbat];
  if (!def) return null;
  return {
    ref: key,
    kind: 'sabbat',
    title: page.title,
    correspondences,
    premade,
    prompt: def.prompt,
    spread: spreadOf(sabbat),
    altar: { holiday: { id: sabbat, name: def.name }, moon: '' },
  };
}

/**
 * Tonight's kit: a sabbat's on its day (and the day either side), otherwise
 * the moon's as it is tonight.
 */
export function kitTonight(now: Date, { south = false }: { south?: boolean } = {}): Kit {
  const sabbat = nearSabbat(now, { south });
  if (sabbat && Math.abs(sabbat.days) <= 1) {
    const kit = kitFor(`wheel-${sabbat.spread}`);
    if (kit) return kit;
  }
  return kitFor(moonRef(moonState(now))) ?? kitFor('moon-full')!;
}

/** The kit's altar, ready to place: Tonight's altar for the sabbat or the moon (with its seasonal thing, when it has one). */
export function kitAltar(kit: Kit, date: Date): TonightAltar {
  const holiday = kit.altar.holiday;
  const moon = kit.altar.moon || moonState(date).name;
  return tonightAltar(date, holiday ? [holiday] : [], moon, holiday ? [{ keys: [`wheel/${holiday.id}`], name: holiday.name }] : []);
}
