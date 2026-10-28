// Keeps the home and lock screen widgets in step: a month of days is sent
// whenever the app comes to the front, or the calendars, plans,
// covens or what you tend change.

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { calendarSettingsKey, leadLine } from './calendars';
import { holidayChoice } from './holidays';
import { usePlace } from './location';
import { useRituals } from './rituals/store';
import { useMySettings } from './settings/store';
import { useWidgetMore } from './widgetInputs';
import { WIDGET_DAYS, widgetTimeline } from './widgetTimeline';

type WidgetModule = typeof import('../widgets');

// Builds without the widget extension (and older app versions receiving an
// update) don't have the native module; the widgets simply aren't there.
function widgets(): WidgetModule[keyof WidgetModule][] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded lazily on purpose (see above)
    return Object.values(require('../widgets') as WidgetModule);
  } catch {
    return [];
  }
}

export function useWidgetSync() {
  const { settings } = useMySettings();
  const { plans, templates } = useRituals();
  const place = usePlace();
  // Your covens, what you tend and today's card; sent again whenever they change (Today's fetches reach here too).
  const more = useWidgetMore();
  const choiceKey = `${settings?.calendar_traditions ?? ''}|${settings?.calendar_custom_holidays ?? ''}|${settings?.calendar_picked_holidays ?? ''}|${calendarSettingsKey(settings)}|${place ? `${place.latitude.toFixed(1)},${place.longitude.toFixed(1)}` : ''}`;

  useEffect(() => {
    const send = () => {
      try {
        const now = new Date();
        const timeline = widgetTimeline(now, holidayChoice(settings), plans, templates, WIDGET_DAYS, {
          lead: (day) => leadLine(day, settings, place),
        }, more(now));
        for (const widget of widgets()) {
          try {
            widget.updateTimeline(timeline);
          } catch {
            // One widget failing shouldn't stop the others.
          }
        }
      } catch {
        // The widgets are a nicety; never let them disturb the app.
      }
    };
    // Several sources settle one after another as the app opens; send once they have.
    const soon = setTimeout(send, 400);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') send();
    });
    return () => {
      clearTimeout(soon);
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- choiceKey stands in for the calendar settings it reads
  }, [choiceKey, plans, templates, more]);
}
