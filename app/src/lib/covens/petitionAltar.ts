// A coven petition's own altar: asking sets out a candle in the petition's
// colour with the folded petition paper at its foot; each tending sets a small
// lit candle beside it in the tender's name and relights the petition's
// candle. Pure, so it can be tested; the petitions screen saves each change
// to the altar (altarSync.changeAltarOnce).

import { builtInCabinet, objectFromForm } from "../altar/cabinet.ts";
import { addObject, moveObject, updateObjects } from "../altar/editor.ts";
import {
  appStateOf,
  isCandle,
  lightCandle,
  setAppState,
} from "../altar/livingState.ts";
import {
  isPetitionPaper,
  petitionObject,
  type Petition as PaperPetition,
} from "../altar/petitions.ts";
import type { AltarDocument } from "../altar/snapshot.ts";
import type { SavedObject } from "../altar/types.ts";
import { newId } from "../altar/uid.ts";
import { circleSpot } from "./ritualAltar.ts";
import type { Petition } from "./model.ts";

/** The candle of a colour, in the form named (or the cabinet's first). */
function candle(color: string, form: string) {
  const item =
    builtInCabinet.find((i) => i.id === `candles:${color}-candle`) ??
    builtInCabinet.find((i) => i.id === "candles:white-candle");
  const chosen = item?.forms.find((f) => f.form === form) ?? item?.forms[0];
  return item && chosen ? { item, form: chosen } : null;
}

/** Sets an object at a spot (its own size kept) and lights it. */
function place(
  doc: AltarDocument,
  object: SavedObject,
  cx: number,
  cy: number,
  now: string,
): AltarDocument {
  const added = addObject(doc, object);
  const index = added.objects.length - 1;
  const moved = moveObject(added, index, cx, cy);
  return updateObjects(moved, [index], (o) => lightCandle(o, now));
}

const isPetitionCandle = (o: SavedObject) =>
  isCandle(o) && appStateOf(o).petitionCandle === true;

/** What asking sets out: the petition's candle, lit, with its paper at its foot. Does nothing if they're there. */
export function seedPetitionAltar(
  petition: Pick<Petition, "id" | "title" | "color" | "body">,
  now: string,
) {
  return (doc: AltarDocument): AltarDocument => {
    if (doc.objects.some(isPetitionPaper) || doc.objects.some(isPetitionCandle))
      return doc;
    const chosen = candle(petition.color, "vigil");
    let next = doc;
    let main: SavedObject | null = null;
    if (chosen) {
      const object = setAppState(
        {
          ...objectFromForm(
            chosen.item,
            chosen.form,
            doc.objects,
            now,
            {},
            { cx: 0.5, cy: 0.55 },
          ),
          label: `Candle for ${petition.title}`,
          altarObjectId: newId(),
        },
        { petitionCandle: true },
        now,
        false,
      );
      next = place(next, object, 0.5, 0.55, now);
      main = next.objects[next.objects.length - 1];
    }
    const paper: PaperPetition = {
      altarId: "",
      title: petition.title.slice(0, 60),
      words: petition.body ?? "",
      intention: "",
      timing: "now",
      timingAt: "",
      place: main ? "candle" : "box",
      objectId: "",
      candleId: main?.altarObjectId ? String(main.altarObjectId) : "",
      status: "waiting",
      releaseOn: "",
      releaseWhy: "",
      doneAt: "",
      writtenAt: now,
    };
    return addObject(
      next,
      petitionObject(paper, petition.id, next.objects, now, main),
    );
  };
}

/** What tending adds: a small lit candle in the tender's name, in the petition's colour, and its candle lit again. */
export function tendPetitionAltar(
  petition: Pick<Petition, "color">,
  person: string,
  now: string,
  personId = "",
) {
  return (doc: AltarDocument): AltarDocument => {
    const lit = doc.objects
      .map((o, i) => (isPetitionCandle(o) ? i : -1))
      .filter((i) => i >= 0);
    let next = lit.length
      ? updateObjects(doc, lit, (o) => lightCandle(o, now))
      : doc;
    const chosen = candle(petition.color, "chime-spell");
    if (!chosen) return next;
    const count = next.objects.filter(
      (o) => isCandle(o) && !isPetitionCandle(o),
    ).length;
    const spot = circleSpot(count);
    const object = setAppState(
      {
        ...objectFromForm(
          chosen.item,
          chosen.form,
          next.objects,
          now,
          {},
          spot,
        ),
        label: `${person}’s candle`,
      },
      // Their name, and (so "Find mine" knows it's theirs) who they are.
      personId ? { tendedBy: person, tendedById: personId } : { tendedBy: person },
      now,
      false,
    );
    next = place(next, object, spot.cx, spot.cy, now);
    return next;
  };
}

/**
 * Tending, with the petition's own candle and paper set out first if they
 * aren't there yet: a petition a ritual made (its writer's contribution,
 * offered as the step ended) gets its altar ready the first time anyone
 * tends it or opens the coven's petitions.
 */
export function tendWithSeed(
  petition: Pick<Petition, "id" | "title" | "color" | "body">,
  person: string,
  now: string,
  personId = "",
) {
  const seed = seedPetitionAltar(petition, now);
  const tend = tendPetitionAltar(petition, person, now, personId);
  return (doc: AltarDocument): AltarDocument => tend(seed(doc));
}

/** Petitions whose altars may still be bare: open ones a ritual made (seedPetitionAltar does nothing where they're set). */
export const petitionsToSeed = <T extends Pick<Petition, "status" | "altar_id"> & { source_ritual_id?: string | null }>(list: T[]): T[] =>
  list.filter((p) => p.status === "open" && !!p.altar_id && !!p.source_ritual_id);
