// Keeps the home and lock screen widget in step: a month of days is sent
// whenever the app comes to the front, or the calendars or plans change.

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { holidayChoice } from './holidays';
import { useRituals } from './rituals/store';
import { useMySettings } from './settings/store';
import { widgetTimeline } from './widgetTimeline';

type WidgetModule = typeof import('../widgets/MoonWidget');

// Builds without the widget extension (and older app versions receiving an
// update) don't have the native module; the widget simply isn't there.
function widget(): WidgetModule['default'] | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded lazily on purpose (see above)
    return (require('../widgets/MoonWidget') as WidgetModule).default;
  } catch {
    return null;
  }
}

export function useWidgetSync() {
  const { settings } = useMySettings();
  const { plans } = useRituals();
  const choiceKey = `${settings?.calendar_traditions ?? ''}|${settings?.calendar_custom_holidays ?? ''}|${settings?.calendar_picked_holidays ?? ''}`;

  useEffect(() => {
    const send = () => {
      try {
        widget()?.updateTimeline(widgetTimeline(new Date(), holidayChoice(settings), plans));
      } catch {
        // The widget is a nicety; never let it disturb the app.
      }
    };
    send();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') send();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- choiceKey stands in for the calendar settings it reads
  }, [choiceKey, plans]);
}
