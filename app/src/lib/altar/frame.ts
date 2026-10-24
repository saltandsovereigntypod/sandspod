// The ancestor frame: a gilt or wooden frame from the cabinet's Tools, with a
// photo of your own drawn into its opening, cropped to fill it, softened to
// an old sepia if you like, and a name and dates beneath it ("In memory of
// Nan, 1932–2019"). The name can come from Hedge → Ancestors, and then the
// frame is linked to them as a memorial candle is (`livingState.app.ancestor`).
// What's in the frame is kept in `livingState.app.frame`, the same on the
// app and the website: { photo, storagePath, aged, name, dates }. Where each
// frame's opening is was found from its picture when the artwork was built
// (scripts/build-altar-artwork.mjs). Pure, so it can be tested.

import { ALTAR_ARTWORK } from './artworkData.ts';
import { pictureBox } from './flame.ts';
import { appStateOf, logAppEvent } from './livingState.ts';
import type { SavedObject } from './types.ts';
import { lifespan, normalizeAncestor, type AncestorEntry } from '../craft/hedge/ancestors.ts';

export const FRAME_TOOL = 'ancestor-frame';

/** Storage folder for frame photos under `user-assets/${userId}/` (signed in). */
export const FRAME_PHOTO_FOLDER = 'ancestor-photos';

export type FrameState = {
  /** The photo: an uploaded picture's URL, or a guest's copy on the device. '' for none yet. */
  photo: string;
  /** Where an uploaded photo is kept in storage, so it can be removed when replaced. */
  storagePath: string;
  /** Softened to an old sepia print. */
  aged: boolean;
  name: string;
  /** "1932–2019", "14 May 1932 – 3 June 2019", or anything you write. */
  dates: string;
};

export type FrameOpening = { left: number; top: number; width: number; height: number; oval: boolean };
type FrameArt = { image: string; ratio: number | null; opening: FrameOpening | null };

export const isFrame = (object: SavedObject | null | undefined) => !!object && object.type === 'tool' && object.tool === FRAME_TOOL;

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export function frameOf(object: SavedObject): FrameState {
  const raw = appStateOf(object).frame as Partial<FrameState> | null | undefined;
  const r = raw && typeof raw === 'object' ? raw : {};
  return { photo: str(r.photo), storagePath: str(r.storagePath), aged: r.aged === true, name: str(r.name).trim(), dates: str(r.dates).trim() };
}

const nameOf = (object: SavedObject) => frameOf(object).name;

/** The label a frame carries: "In memory of Nan", or plain "Ancestor Frame" before it's named. */
export const frameLabel = (name: string) => (name.trim() ? `In memory of ${name.trim()}` : 'Ancestor Frame');

/** Put a photo in the frame (or a new one in place of the old). */
export function setFramePhoto(object: SavedObject, photo: string, storagePath: string, now: string): SavedObject {
  if (!isFrame(object) || !photo) return object;
  const had = !!frameOf(object).photo;
  const frame: FrameState = { ...frameOf(object), photo, storagePath };
  const who = nameOf(object);
  return logAppEvent(object, { kind: 'frame', action: 'photo', text: `${had ? 'Changed the photo' : 'Set a photo'} in the frame${who ? ` for ${who}` : ''}.` }, now, { frame });
}

/** Take the photo out; the frame stays on the altar. */
export function removeFramePhoto(object: SavedObject, now: string): SavedObject {
  if (!isFrame(object) || !frameOf(object).photo) return object;
  return logAppEvent(object, { kind: 'frame', action: 'photo-removed', text: 'Took the photo out of the frame.' }, now, { frame: { ...frameOf(object), photo: '', storagePath: '' } });
}

/** An old sepia print, or the photo as it is. */
export function setFrameAged(object: SavedObject, aged: boolean, now: string): SavedObject {
  if (!isFrame(object) || frameOf(object).aged === aged) return object;
  return logAppEvent(object, { kind: 'frame', action: aged ? 'aged' : 'unaged', text: aged ? 'Gave the photo an old sepia look.' : 'Showed the photo as it is.' }, now, { frame: { ...frameOf(object), aged } });
}

export type FrameCaption = { name: string; dates: string; ancestor?: { id: string; name: string } | null };

/**
 * Name the frame for someone, with their dates. With `ancestor`, it's linked
 * to them in Hedge → Ancestors; a name typed by hand that isn't theirs
 * unlinks it.
 */
export function setFrameCaption(object: SavedObject, caption: FrameCaption, now: string): SavedObject {
  if (!isFrame(object)) return object;
  const name = caption.name.trim().slice(0, 80);
  const dates = caption.dates.trim().slice(0, 60);
  const current = appStateOf(object).ancestor as { id?: string; name?: string } | undefined;
  const ancestor =
    caption.ancestor !== undefined ? (caption.ancestor ? { id: caption.ancestor.id, name } : null) : current?.id && current.name === name ? current : null;
  const labelled: SavedObject = { ...object, label: frameLabel(name), plaqueText: name };
  return logAppEvent(
    labelled,
    { kind: 'frame', action: 'named', text: name ? `Named the frame for ${name}${dates ? `, ${dates}` : ''}.` : 'Took the name from the frame.' },
    now,
    { frame: { ...frameOf(object), name, dates }, ancestor },
  );
}

/** A name and dates for the frame from one of your Ancestors. */
export function captionFromAncestor(entry: AncestorEntry): FrameCaption {
  const a = normalizeAncestor(entry.data);
  const name = a.name.trim();
  return { name, dates: lifespan(a), ancestor: { id: entry.id, name } };
}

/** What the close-up shows beneath the photo: "In memory of Nan" and "1932–2019", or null before it's named. */
export function frameCaption(object: SavedObject): { title: string; dates: string } | null {
  if (!isFrame(object)) return null;
  const { name, dates } = frameOf(object);
  if (!name && !dates) return null;
  return { title: name ? `In memory of ${name}` : 'In memory', dates };
}

// ── Drawing ──────────────────────────────────────────────────────────────

/** Where the frame's opening is in its picture (fractions of the picture), for the built-in frames; null for a picture of your own. */
export function frameArtOf(object: SavedObject, frames: Record<string, FrameArt> = ALTAR_ARTWORK.frames): FrameArt | null {
  if (!isFrame(object)) return null;
  const art = frames[String(object.form || '')];
  return art && art.image === object.imagePath ? art : null;
}

export type FramePhotoRect = { left: number; top: number; width: number; height: number; oval: boolean };

/**
 * Where the photo is drawn, in the object's box (`width` × `height` pixels,
 * the picture contained in it as the stage draws it): the frame's opening.
 * The photo is cropped to cover it. Null when the opening isn't known.
 */
export function framePhotoRect(object: SavedObject, width: number, height: number, frames: Record<string, FrameArt> = ALTAR_ARTWORK.frames): FramePhotoRect | null {
  const art = frameArtOf(object, frames);
  if (!art?.opening || !art.ratio || !(width > 0) || !(height > 0)) return null;
  const box = pictureBox(art.ratio, height / width);
  const pic = { left: box.left * width, top: box.top * height, width: box.width * width, height: box.height * height };
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const o = art.opening;
  return { left: r1(pic.left + o.left * pic.width), top: r1(pic.top + o.top * pic.height), width: r1(o.width * pic.width), height: r1(o.height * pic.height), oval: o.oval };
}

/** The old sepia print's colour, as the offering tint takes it (CSS filter on the web, a colour matrix on the phone). */
export const AGED_PHOTO = { sepia: 0.62, saturate: 0.72, brightness: 0.96 } as const;

export const framePhotoTint = (object: SavedObject) => (frameOf(object).aged ? AGED_PHOTO : null);
