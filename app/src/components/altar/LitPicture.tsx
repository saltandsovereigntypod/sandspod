// The web shows objects' pictures as they are; the phone's candlelit
// pictures are in LitPicture.native.tsx.

import type { AltarPicture } from '../../lib/altar/assets';

import type { ObjectLight } from '../../lib/altar/litShader';

export const HAS_LIT = false;

export function LitPicture(_props: { picture: AltarPicture; width: number; height: number; lights: ObjectLight[]; gloss: number; reach: number; still: boolean }) {
  return null;
}
