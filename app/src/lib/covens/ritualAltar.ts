// What a coven ritual step does at its altar, as a change to the altar's
// document: your candle lit and set in the circle, an offering set down, or
// every candle lit or put out. Pure, so it can be tested; the ritual screen
// saves the change to the altar (altarSync.changeAltarOnce).

import { builtInCabinet, objectFromForm } from '../altar/cabinet.ts';
import { addObject, lightAll, moveObject, snuffAll, updateObjects } from '../altar/editor.ts';
import { displayBox } from '../altar/geometry.ts';
import { lightCandle } from '../altar/livingState.ts';
import type { AltarDocument } from '../altar/snapshot.ts';
import type { CabinetItem } from '../altar/types.ts';
import type { RitualStep } from './model.ts';

// The planner's candle forms, as the cabinet names them.
const FORMS: Record<string, string> = { chime: 'chime-spell', votive: 'vigil' };

/** Where the nth candle of a ritual stands: twelve to a ring, each ring a little closer in. */
export function circleSpot(n: number): { cx: number; cy: number } {
  const angle = -Math.PI / 2 + (n % 12) * ((2 * Math.PI) / 12);
  const ring = Math.floor(n / 12);
  return {
    cx: Math.max(0.05, Math.min(0.95, 0.5 + (0.36 - 0.07 * ring) * Math.cos(angle))),
    cy: Math.max(0.2, Math.min(0.95, 0.62 + (0.2 - 0.04 * ring) * Math.sin(angle))),
  };
}

/**
 * The change one step makes. `person` names whose candle it is; `count` is how
 * many have already done this ritual's altar actions (where the next stands).
 */
export function stepAltarChange(
  step: Pick<RitualStep, 'altar_action' | 'altar_color' | 'altar_form' | 'altar_label' | 'altar_image' | 'title'>,
  ritual: { title: string },
  person: string,
  count: number,
  now: string,
): ((doc: AltarDocument) => AltarDocument) | null {
  if (step.altar_action === 'light_all') return (doc) => lightAll(doc, now);
  if (step.altar_action === 'snuff_all') return (doc) => snuffAll(doc, now);
  let item: CabinetItem | undefined;
  let form: CabinetItem['forms'][number] | undefined;
  if (step.altar_action === 'light_candle') {
    const color = step.altar_color || 'white';
    item = builtInCabinet.find((i) => i.id === `candles:${color}-candle`) ?? builtInCabinet.find((i) => i.id === 'candles:white-candle');
    const wanted = FORMS[step.altar_form ?? ''] ?? step.altar_form ?? 'vigil';
    form = item?.forms.find((f) => f.form === wanted) ?? item?.forms[0];
  } else if (step.altar_action === 'place_item' && step.altar_image) {
    const image = step.altar_image;
    // The cabinet's own entry for that picture when there is one, so it's the real herb or stone.
    item = builtInCabinet.find((i) => i.forms.some((f) => f.image === image || f.image.replace(/^\.\./, '') === image));
    form = item?.forms.find((f) => f.image === image || f.image.replace(/^\.\./, '') === image);
    if (!item || !form) {
      form = { label: 'Place', image, type: 'tool' };
      item = { id: 'ritual:offering', category: 'tools', name: step.altar_label || 'Offering', keywords: [], forms: [form] };
    }
  }
  if (!item || !form) return null;
  const chosenItem = item;
  const chosenForm = form;
  const label = step.altar_label || (step.altar_action === 'light_candle' ? `${person}’s candle` : chosenItem.name);
  return (doc) => {
    const object = { ...objectFromForm(chosenItem, chosenForm, doc.objects, now, {}, circleSpot(count)), label, ritualNote: `${ritual.title} · ${step.title}` };
    const added = addObject(doc, object);
    const index = added.objects.length - 1;
    const box = displayBox(object);
    const placed = moveObject(added, index, box.cx, box.cy);
    return step.altar_action === 'light_candle' ? updateObjects(placed, [index], (o) => lightCandle(o, now)) : placed;
  };
}
