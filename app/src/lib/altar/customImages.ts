// Your own altar backgrounds and your own pictures for the cabinet's built-in
// forms, as the website keeps them (altar/js/features/custom-images.js): the
// same `user-assets` folders, the same `custom_altar_backgrounds` and
// `custom_cabinet_image_overrides` rows. Pure, so it can be tested.

import { overrideKey } from './cabinet.ts';
import type { CabinetForm, CabinetItem } from './types.ts';

/** Storage folders under `user-assets/${userId}/` (uploadUserAsset's `folder`). */
export const BACKGROUND_FOLDER = 'backgrounds';
export const CABINET_IMAGE_FOLDER = 'cabinet';

/** What the website's name prompt starts with. */
export const DEFAULT_BACKGROUND_NAME = 'My Custom Altar';

/** The `custom_altar_backgrounds` row promptCustomAltarBackground inserts. */
export function backgroundRow(userId: string, name: string, imageUrl: string, storagePath: string) {
  return {
    user_id: userId,
    name: name.trim(),
    icon: '🖼️',
    keywords: ['custom', 'uploaded', 'background'],
    image_url: imageUrl,
    storage_path: storagePath,
  };
}

/** The label the website's cabinet tile carries for a form (getCabinetDisplayImage). */
export function overrideLabel(item: CabinetItem, form: CabinetForm): string {
  return form.label === 'Place' ? item.name : `${item.name} ${form.label}`;
}

/** The `custom_cabinet_image_overrides` row setCustomCabinetImage upserts (on user_id,override_key). */
export function overrideRow(userId: string, item: CabinetItem, form: CabinetForm, imageUrl: string, storagePath: string, now: string) {
  return {
    user_id: userId,
    override_key: overrideKey(item, form),
    image_url: imageUrl,
    storage_path: storagePath,
    metadata: { label: overrideLabel(item, form), type: form.type || '', form: form.form || '' },
    updated_at: now,
  };
}
