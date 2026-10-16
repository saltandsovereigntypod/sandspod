// Turning the screen sideways for the full-screen altar. The rotation lives in
// native code that only newer builds of the app carry, so older builds (which
// still receive updates) simply don't offer it.

import { requireOptionalNativeModule } from 'expo-modules-core';

const supported = requireOptionalNativeModule('ExpoScreenOrientation') != null;

/** Whether this build of the app can turn the screen sideways. */
export const canTurnScreen = supported;

function orientation(): typeof import('expo-screen-orientation') | null {
  // Loaded only when the native side exists; requiring it otherwise throws.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return supported ? require('expo-screen-orientation') : null;
}

/** Sideways (either way round), or back to upright. */
export async function turnScreen(landscape: boolean): Promise<void> {
  const o = orientation();
  if (!o) return;
  try {
    await o.lockAsync(landscape ? o.OrientationLock.LANDSCAPE : o.OrientationLock.PORTRAIT_UP);
  } catch {
    // Some iPads in split view can't be locked; the altar still fills the screen.
  }
}

/**
 * Lets go of the upright lock just before the app restarts itself into an
 * update. The old copy's lock would otherwise linger beside the new one's and
 * keep the full-screen altar from turning sideways until the app is closed.
 */
export async function releaseScreen(): Promise<void> {
  const o = orientation();
  if (!o) return;
  try {
    await o.lockAsync(o.OrientationLock.DEFAULT);
  } catch {
    // Nothing to let go of.
  }
}
