// The app's own per-object state, kept INSIDE the object's livingState JSON
// under the top-level key `app` (livingState.app.jar, livingState.app.sachet…).
// The website spreads unknown livingState keys through untouched, so this
// survives a save on either side; nothing new is added to the object itself.

import { readLivingState, writeLivingState } from '../livingState.ts';
import type { SavedObject } from '../types.ts';

export type AppState = Record<string, unknown>;

/** livingState.app, or {} when there is none yet. */
export function appStateOf(object: SavedObject): AppState {
  const app = readLivingState(object, '').app;
  return app && typeof app === 'object' && !Array.isArray(app) ? (app as AppState) : {};
}

/** One part of livingState.app (`jar`, `sachet`…), or null. */
export function appPart<T>(object: SavedObject, key: string): T | null {
  const value = appStateOf(object)[key];
  return value && typeof value === 'object' ? (value as T) : null;
}

/** Write one part of livingState.app, keeping every other part and every other livingState key. */
export function withAppPart(object: SavedObject, key: string, value: unknown, now: string, extra: Record<string, unknown> = {}): SavedObject {
  const state = readLivingState(object, now);
  const app = { ...appStateOf(object), [key]: value };
  return writeLivingState(object, { ...state, ...extra, lastUsedAt: now, app }, now);
}
