// The web browns and dulls an offering's picture with a CSS filter (see
// AltarObjectArt); the phone's colour-matrix copy is in AgedPicture.native.tsx.

import type { AltarPicture } from '../../lib/altar/assets';

export const HAS_AGED = false;

export function AgedPicture(_props: { picture: AltarPicture; width: number; height: number; matrix: number[] }) {
  return null;
}
