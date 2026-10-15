// Keeps the home and lock screen widgets in step: a month of days is sent
// whenever the app comes to the front, or the calendars or plans change.

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { holidayChoice } from './holidays';
import { useRituals } from './rituals/store';
import { useMySettings } from './settings/store';
import { widgetTimeline } from './widgetTimeline';

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
  const choiceKey = `${settings?.calendar_traditions ?? ''}|${settings?.calendar_custom_holidays ?? ''}|${settings?.calendar_picked_holidays ?? ''}`;

  useEffect(() => {
    const send = () => {
      try {
        const timeline = widgetTimeline(new Date(), holidayChoice(settings), plans, templates);
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
    send();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') send();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- choiceKey stands in for the calendar settings it reads
  }, [choiceKey, plans, templates]);
}
