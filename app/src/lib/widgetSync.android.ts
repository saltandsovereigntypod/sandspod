// Keeps the Android home screen widgets in step: a month of days is stored for
// the widget task whenever the app comes to the front, or the calendars or
// plans change; each widget then shows the day it is (refreshed every 30 minutes).

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { calendarSettingsKey, leadLine } from './calendars';
import { holidayChoice } from './holidays';
import { usePlace } from './location';
import { useRituals } from './rituals/store';
import { useMySettings } from './settings/store';
import { WIDGET_DAYS, widgetTimeline } from './widgetTimeline';

const DAY_WIDGETS = ['MoonWidget', 'HolidayWidget', 'ComingUpWidget', 'RitualWidget'];

/** Redraw these widgets from what's stored (builds without widgets do nothing). */
export async function redrawAndroidWidgets(names: string[]) {
  try {
    /* eslint-disable @typescript-eslint/no-require-imports -- loaded lazily: builds before the Android widgets don't have them */
    const { requestWidgetUpdate } = require('react-native-android-widget') as typeof import('react-native-android-widget');
    const { renderAndroidWidget } = require('../widgets/android/render') as typeof import('../widgets/android/render');
    /* eslint-enable @typescript-eslint/no-require-imports */
    for (const widgetName of names) {
      await requestWidgetUpdate({ widgetName, renderWidget: (info) => renderAndroidWidget(info) }).catch(() => {});
    }
  } catch {
    // No widgets in this build.
  }
}

export function useWidgetSync() {
  const { settings } = useMySettings();
  const { plans, templates } = useRituals();
  const place = usePlace();
  const choiceKey = `${settings?.calendar_traditions ?? ''}|${settings?.calendar_custom_holidays ?? ''}|${settings?.calendar_picked_holidays ?? ''}|${calendarSettingsKey(settings)}|${place ? `${place.latitude.toFixed(1)},${place.longitude.toFixed(1)}` : ''}`;

  useEffect(() => {
    const send = async () => {
      try {
        const { writeDays } = await import('../widgets/android/store');
        const timeline = widgetTimeline(new Date(), holidayChoice(settings), plans, templates, WIDGET_DAYS, {
          lead: (day) => leadLine(day, settings, place),
        });
        await writeDays(timeline.map(({ date, props }) => ({ date: date.toISOString(), value: props })));
        await redrawAndroidWidgets(DAY_WIDGETS);
      } catch {
        // The widgets are a nicety; never let them disturb the app.
      }
    };
    void send();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void send();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- choiceKey stands in for the calendar settings it reads
  }, [choiceKey, plans, templates]);
}
