// What a coven ritual step does at its altar, as a change to the altar's
// document: your candle lit and set in the circle, the step's items set down,
// every candle lit or put out, a folded paper set down for something written
// (sealed and nameless when it should be), and the papers burned, buried or
// released. Pure, so it can be tested; the ritual screen saves the change to
// the altar (altarSync.changeAltarOnce).

import { builtInCabinet, objectFromForm } from '../altar/cabinet.ts';
import { addObject, lightAll, moveObject, removeObject, snuffAll, updateObjects } from '../altar/editor.ts';
import { displayBox } from '../altar/geometry.ts';
import { cabinetFormOf, cleanStepItems, type StepItem } from '../altar/itemIndex.ts';
import { appStateOf, lightCandle, setAppState } from '../altar/livingState.ts';
import { petitionObject, type Petition as PaperPetition } from '../altar/petitions.ts';
import type { AltarDocument } from '../altar/snapshot.ts';
import type { CabinetForm, CabinetItem, SavedObject } from '../altar/types.ts';
import type { ContributionFate } from './contributions.ts';
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

/** A step's item as a cabinet item and form: the cabinet's own when it is one, otherwise its picture as a plain thing. */
function itemForm(item: Pick<StepItem, 'key' | 'image' | 'name'>): { item: CabinetItem; form: CabinetForm } | null {
  const own = cabinetFormOf(item.key);
  if (own) return own;
  const image = item.image;
  const found = builtInCabinet.find((i) => i.forms.some((f) => f.image === image || f.image.replace(/^\.\./, '') === image));
  const form = found?.forms.find((f) => f.image === image || f.image.replace(/^\.\./, '') === image);
  if (found && form) return { item: found, form };
  if (!image) return null;
  const plain: CabinetForm = { label: 'Place', image, type: 'tool' };
  return { item: { id: 'ritual:offering', category: 'tools', name: item.name || 'Offering', keywords: [], forms: [plain] }, form: plain };
}

/** Sets one thing down at a spot, labelled, noting the ritual and step; lit when it's a candle being lit. */
function setDown(doc: AltarDocument, chosen: { item: CabinetItem; form: CabinetForm }, label: string, note: string, spot: { cx: number; cy: number }, now: string, light: boolean): AltarDocument {
  const object = { ...objectFromForm(chosen.item, chosen.form, doc.objects, now, {}, spot), label, ritualNote: note };
  const added = addObject(doc, object);
  const index = added.objects.length - 1;
  const box = displayBox(object);
  const placed = moveObject(added, index, box.cx, box.cy);
  return light ? updateObjects(placed, [index], (o) => lightCandle(o, now)) : placed;
}

/**
 * The change one step makes. `person` names whose candle it is; `count` is how
 * many have already done this ritual's altar actions (where the next stands).
 */
export function stepAltarChange(
  step: Pick<RitualStep, 'altar_action' | 'altar_color' | 'altar_form' | 'altar_label' | 'altar_image' | 'title'> & { items?: unknown },
  ritual: { title: string },
  person: string,
  count: number,
  now: string,
): ((doc: AltarDocument) => AltarDocument) | null {
  const note = `${ritual.title} · ${step.title}`;
  if (step.altar_action === 'light_all') return (doc) => lightAll(doc, now);
  if (step.altar_action === 'snuff_all') return (doc) => snuffAll(doc, now);
  if (step.altar_action === 'release_papers') return (doc) => releasePapers(doc);
  if (step.altar_action === 'light_candle') {
    const color = step.altar_color || 'white';
    const item = builtInCabinet.find((i) => i.id === `candles:${color}-candle`) ?? builtInCabinet.find((i) => i.id === 'candles:white-candle');
    const wanted = FORMS[step.altar_form ?? ''] ?? step.altar_form ?? 'vigil';
    const form = item?.forms.find((f) => f.form === wanted) ?? item?.forms[0];
    if (!item || !form) return null;
    return (doc) => setDown(doc, { item, form }, step.altar_label || `${person}’s candle`, note, circleSpot(count), now, true);
  }
  if (step.altar_action !== 'place_item') return null;
  // The step's items, each set down in turn; older steps have one picture.
  const items = cleanStepItems(step.items);
  const list = items.length ? items : step.altar_image ? [{ key: '', name: step.altar_label || 'Offering', image: step.altar_image, category: '' }] : [];
  const chosen = list.map((it) => ({ it, form: itemForm(it) })).filter((x) => !!x.form);
  if (!chosen.length) return null;
  return (doc) =>
    chosen.reduce(
      (next, { it, form }, i) => setDown(next, form!, items.length ? it.name : step.altar_label || form!.item.name, note, circleSpot(count + i), now, false),
      doc,
    );
}

// ─── Written things: folded papers ───────────────────────────────────────

/** The paper's marks (appState.ritualPaper): whose contribution it is and what becomes of it. */
type PaperMark = { contributionId: string; fate: ContributionFate };

const paperOf = (o: SavedObject): PaperMark | null => {
  const raw = appStateOf(o).ritualPaper as Partial<PaperMark> | undefined;
  return raw && typeof raw.contributionId === 'string' ? { contributionId: raw.contributionId, fate: (raw.fate ?? 'keep') as ContributionFate } : null;
};

/**
 * A folded paper set down for something written in a step. Its label is what
 * everyone may know (contributions.ts contributionLabel: "Rowan’s petition",
 * "A private petition"), never the words. Nothing happens if it's there already.
 */
export function offerPaper(contribution: { id: string; fate: ContributionFate }, label: string, count: number, now: string) {
  return (doc: AltarDocument): AltarDocument => {
    if (doc.objects.some((o) => paperOf(o)?.contributionId === contribution.id)) return doc;
    const paper: PaperPetition = {
      altarId: '',
      title: label.slice(0, 60),
      words: '',
      intention: '',
      timing: 'now',
      timingAt: '',
      place: 'box',
      objectId: '',
      candleId: '',
      status: 'waiting',
      releaseOn: '',
      releaseWhy: '',
      doneAt: '',
      writtenAt: now,
    };
    const spot = circleSpot(count);
    const object = setAppState({ ...petitionObject(paper, contribution.id, doc.objects, now, null), label: label.slice(0, 80) }, { ritualPaper: { contributionId: contribution.id, fate: contribution.fate } }, now, false);
    const added = addObject(doc, object);
    return moveObject(added, added.objects.length - 1, spot.cx, Math.min(0.92, spot.cy + 0.06));
  };
}

/** The papers to be burned, buried or released are taken from the altar (those kept, or held as petitions, stay). */
export function releasePapers(doc: AltarDocument): AltarDocument {
  let next = doc;
  for (let i = next.objects.length - 1; i >= 0; i--) {
    const mark = paperOf(next.objects[i]);
    if (mark && (mark.fate === 'burn' || mark.fate === 'bury' || mark.fate === 'release')) next = removeObject(next, i);
  }
  return next;
}

/** How many papers lie on the altar (where the next one goes). */
export const paperCount = (doc: AltarDocument) => doc.objects.filter((o) => !!paperOf(o)).length;
