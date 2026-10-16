// What the Android widgets show, kept on the phone where the widget task can
// read it even when the app is closed: a month of days and the altars (now,
// and again at each moment a candle burns down), which altar each widget
// shows, and taps waiting for the app to carry out.

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { WidgetAction, WidgetAltar } from '../../lib/altarWidget';
import type { WidgetDayProps } from '../../lib/widgetTimeline';

const DAYS = 'widgets.android.days';
const ALTARS = 'widgets.android.altars';
const PLACES = 'widgets.android.places';
const ACTIONS = 'widgets.android.actions';

export type Entry<T> = { date: string; value: T };

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
const write = (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});

/** The entry showing at `now`: the latest one that has begun (or the first). */
export function entryAt<T>(entries: Entry<T>[], now: Date): T | undefined {
  let shown: Entry<T> | undefined;
  for (const entry of entries) if (Date.parse(entry.date) <= now.getTime()) shown = entry;
  return (shown ?? entries[0])?.value;
}

export const readDays = () => read<Entry<WidgetDayProps>[]>(DAYS, []);
export const writeDays = (entries: Entry<WidgetDayProps>[]) => write(DAYS, entries);
export const readAltars = () => read<Entry<WidgetAltar[]>[]>(ALTARS, []);
export const writeAltars = (entries: Entry<WidgetAltar[]>[]) => write(ALTARS, entries);

/** Which place (1–6) each Altar widget shows, by widget id. */
export const readPlaces = () => read<Record<string, number>>(PLACES, {});
export async function setPlace(widgetId: number, place: number | null) {
  const places = await readPlaces();
  if (place == null) delete places[String(widgetId)];
  else places[String(widgetId)] = place;
  await write(PLACES, places);
}

export const readActions = () => read<WidgetAction[]>(ACTIONS, []);
export async function addAction(action: WidgetAction) {
  await write(ACTIONS, [...(await readActions()), action]);
}
/** Forget the taps the app has carried out. */
export async function clearActions(done: Set<string>) {
  await write(ACTIONS, (await readActions()).filter((a) => !done.has(a.id)));
}
