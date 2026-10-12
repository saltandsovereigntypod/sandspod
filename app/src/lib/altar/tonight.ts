// "Set tonight's altar": a starter altar from the day itself, built from the
// cabinet. A holiday brings its traditional things; otherwise the weekday's
// planet chooses the candle, herb and stone, and a full or new moon adds a
// touch of its own. Everything can be moved, swapped or removed afterwards.

import { builtInCabinet, objectFromForm, placeableForms, shortLabel } from './cabinet.ts';
import type { SavedObject } from './types.ts';
import type { AltarDocument } from './snapshot.ts';

type Pick = [itemId: string, form: string];

export type TonightAltar = {
  doc: AltarDocument;
  /** What it was set for: "Mars's day: courage and protection". */
  reason: string;
  /** What was placed, in order. */
  labels: string[];
};

const WEEKDAYS: { reason: string; picks: Pick[] }[] = [
  { reason: 'the Sun’s day: success and vitality', picks: [['candles:gold-candle', 'vigil'], ['herbs:cinnamon', 'sprig'], ['crystals:clear-quartz', 'cluster']] },
  { reason: 'the Moon’s day: intuition and dreams', picks: [['candles:silver-candle', 'vigil'], ['herbs:mugwort', 'sprig'], ['crystals:amethyst', 'cluster']] },
  { reason: 'Mars’s day: courage and protection', picks: [['candles:red-candle', 'vigil'], ['herbs:basil', 'sprig'], ['tools:athame', 'standard']] },
  { reason: 'Mercury’s day: words and learning', picks: [['candles:yellow-candle', 'vigil'], ['herbs:lavender', 'sprig'], ['crystals:clear-quartz', 'point']] },
  { reason: 'Jupiter’s day: wisdom and abundance', picks: [['candles:blue-candle', 'vigil'], ['herbs:sage', 'sprig'], ['crystals:amethyst', 'point']] },
  { reason: 'Venus’s day: love and friendship', picks: [['candles:pink-candle', 'vigil'], ['herbs:chamomile', 'sprig'], ['crystals:clear-quartz', 'chips']] },
  { reason: 'Saturn’s day: protection and endings', picks: [['candles:black-candle', 'vigil'], ['herbs:cedar', 'sprig'], ['tools:black-salt', 'pile']] },
];

/** Traditional altars for holidays, by holiday id (or the start of one). */
const HOLIDAYS: { ids: string[]; picks: Pick[] }[] = [
  { ids: ['samhain', 'vetrnaetur', 'dziady'], picks: [['candles:black-candle', 'vigil'], ['candles:orange-candle', 'vigil'], ['herbs:mugwort', 'sprig'], ['vessels:cauldron', 'standard'], ['tools:raven-skull', 'standard']] },
  { ids: ['yule', 'jol', 'sol_invictus', 'koliada', 'saturnalia'], picks: [['candles:gold-candle', 'vigil'], ['candles:red-candle', 'vigil'], ['herbs:cedar', 'sprig'], ['herbs:bay', 'sprig'], ['herbs:cinnamon', 'sprig']] },
  { ids: ['imbolc', 'la_fheile_bride'], picks: [['candles:white-candle', 'vigil'], ['candles:white-candle', 'taper'], ['herbs:bay', 'sprig'], ['herbs:chamomile', 'sprig'], ['crystals:clear-quartz', 'cluster']] },
  { ids: ['ostara'], picks: [['candles:green-candle', 'vigil'], ['candles:yellow-candle', 'vigil'], ['herbs:lavender', 'sprig'], ['crystals:clear-quartz', 'point']] },
  { ids: ['beltane', 'bealtaine', 'floralia'], picks: [['candles:red-candle', 'vigil'], ['candles:white-candle', 'vigil'], ['herbs:rosemary', 'sprig'], ['herbs:basil', 'sprig']] },
  { ids: ['litha', 'midsummer', 'kupala'], picks: [['candles:gold-candle', 'vigil'], ['candles:yellow-candle', 'vigil'], ['herbs:chamomile', 'sprig'], ['herbs:sage', 'sprig']] },
  { ids: ['lughnasadh', 'lammas'], picks: [['candles:orange-candle', 'vigil'], ['candles:gold-candle', 'vigil'], ['herbs:bay', 'sprig'], ['herbs:cinnamon', 'sprig']] },
  { ids: ['mabon', 'haustblot'], picks: [['candles:brown-candle', 'vigil'], ['candles:orange-candle', 'vigil'], ['herbs:sage', 'sprig'], ['herbs:cinnamon', 'sprig']] },
  { ids: ['deipnon'], picks: [['deities:hekate-statue', 'statue'], ['candles:black-candle', 'vigil'], ['tools:key', 'standard'], ['tools:black-salt', 'pile']] },
  { ids: ['noumenia'], picks: [['candles:white-candle', 'vigil'], ['herbs:bay', 'sprig'], ['vessels:spell-jar', 'standard']] },
];

function placed(picks: Pick[], now: string): { objects: SavedObject[]; labels: string[] } {
  const objects: SavedObject[] = [];
  const labels: string[] = [];
  const usable = picks
    .map(([itemId, formId]) => {
      const item = builtInCabinet.find((i) => i.id === itemId);
      // Only forms that have a picture; another form of the same thing stands in otherwise.
      const forms = item ? placeableForms(item) : [];
      const form = forms.find((f) => (f.form || f.label) === formId) ?? forms[0];
      return item && form ? { item, form } : null;
    })
    .filter((p): p is NonNullable<typeof p> => !!p);
  usable.forEach(({ item, form }, i) => {
    // Spread along the altar's surface, the tallest things to the back.
    const cx = usable.length === 1 ? 0.5 : 0.22 + (0.56 * i) / (usable.length - 1);
    const cy = form.type === 'candle' || form.type === 'deity' ? 0.64 : 0.72;
    const object = objectFromForm(item, form, objects, now, {}, { cx, cy });
    objects.push(object);
    labels.push(shortLabel(object.label, item.name));
  });
  return { objects, labels };
}

/**
 * Tonight's altar for `date`. `holidayIds` are today's holidays (from the
 * calendars chosen in Settings); `moon` is tonight's phase name.
 */
export function tonightAltar(date: Date, holidays: { id: string; name: string }[], moon: string): TonightAltar {
  const now = date.toISOString();
  const holidaySet = holidays
    .map((holiday) => ({ holiday, set: HOLIDAYS.find((h) => h.ids.some((id) => holiday.id === id || holiday.id.startsWith(`${id}_`))) }))
    .find((h) => !!h.set);

  let picks: Pick[];
  let reason: string;
  if (holidaySet?.set) {
    picks = holidaySet.set.picks;
    reason = holidaySet.holiday.name;
  } else {
    const day = WEEKDAYS[date.getDay()];
    picks = [...day.picks];
    reason = day.reason;
    if (moon === 'Full Moon') {
      picks.push(['candles:white-candle', 'tea-light']);
      reason += ', under the full moon';
    } else if (moon === 'New Moon') {
      picks.push(['vessels:spell-jar', 'standard']);
      reason += ', at the new moon';
    }
  }

  const { objects, labels } = placed(picks, now);
  return {
    doc: { background: '', backgroundName: '', groups: [], activeGroupId: null, objects, extra: {} },
    reason,
    labels,
  };
}
