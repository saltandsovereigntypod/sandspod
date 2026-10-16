'use no memo';
// Which widget to draw for a widget on the home screen, from what's stored.

import type { WidgetInfo } from 'react-native-android-widget';

import { AltarWidgetAndroid } from './AltarWidgetAndroid';
import { ComingUpWidgetAndroid, HolidayWidgetAndroid, MoonWidgetAndroid, OpenAppWidget, RitualWidgetAndroid } from './DayWidgets';
import { boxOf } from './look';
import { entryAt, readAltars, readDays, readPlaces } from './store';

export const ANDROID_WIDGETS = ['AltarWidget', 'MoonWidget', 'HolidayWidget', 'ComingUpWidget', 'RitualWidget'] as const;

const TITLES: Record<string, string> = {
  MoonWidget: "Tonight's Moon",
  HolidayWidget: 'Next Holiday',
  ComingUpWidget: 'Coming Up',
  RitualWidget: 'Next Ritual',
};

export async function renderAndroidWidget(info: WidgetInfo, now = new Date()) {
  const box = boxOf(info.width, info.height);
  if (info.widgetName === 'AltarWidget') {
    const [altarEntries, places] = await Promise.all([readAltars(), readPlaces()]);
    const altars = entryAt(altarEntries, now) ?? [];
    const place = places[String(info.widgetId)] ?? 1;
    return <AltarWidgetAndroid altar={altars[place - 1] ?? altars[0]} box={box} now={now} />;
  }
  const day = entryAt(await readDays(), now);
  if (!day) return <OpenAppWidget box={box} title={TITLES[info.widgetName] ?? 'Salt & Sovereignty'} />;
  switch (info.widgetName) {
    case 'HolidayWidget':
      return <HolidayWidgetAndroid day={day} box={box} />;
    case 'ComingUpWidget':
      return <ComingUpWidgetAndroid day={day} box={box.size === 'small' ? { ...box, size: 'medium' } : box} />;
    case 'RitualWidget':
      return <RitualWidgetAndroid day={day} box={box} now={now} />;
    default:
      return <MoonWidgetAndroid day={day} box={box} />;
  }
}
