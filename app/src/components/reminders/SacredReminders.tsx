import { router, usePathname } from 'expo-router';
import { Text } from 'react-native';

import { Button } from '../Button';
import { Card } from '../more/ui';
import { TimeStepper } from '../rituals/TimeStepper';
import { Toggle } from '../rituals/ui';
import { remindersSupported } from '../../lib/reminders/notifier';
import { calendarOn, PATRON_GROUP_ID, withCalendarOn, withChange } from '../../lib/reminders/prefs';
import { useReminders } from '../../lib/reminders/store';
import { useReminderPrefs } from '../../lib/reminders/usePrefs';
import { settingsHref } from '../../lib/settings/links';
import { type } from '../../theme';

/** Reminders on the sacred days of patron and dedicated deities: their calendar among the holiday reminders (Reminders → Holidays); shown in My deities and in Reminders. */
export function SacredReminders({ inHub = false }: { inHub?: boolean }) {
  const pathname = usePathname();
  const { permission } = useReminders();
  const { prefs, update, ready, settings } = useReminderPrefs();
  if (!remindersSupported || !ready) return null;
  const on = prefs.holidays.on && calendarOn(prefs, PATRON_GROUP_ID);
  // Holiday reminders off until now: these alone, not every calendar at once.
  const turn = (next: boolean) => void update(withCalendarOn(prefs, settings, PATRON_GROUP_ID, next));
  return (
    <Card>
      <Toggle label="Remind me on their sacred days" detail="For your patron and dedicated deities, with a small devotion for the day" value={on} onChange={turn} />
      {on && <TimeStepper minutes={prefs.holidays.at} onChange={(minutes) => void update(withChange(prefs, 'holidays.at', minutes))} />}
      {on && <Text style={type.caption}>At the time chosen for holiday reminders. Choose how far ahead, and which of your other calendars remind you, in Reminders → Holidays.</Text>}
      {!inHub && <Button label="Holiday reminders" variant="text" onPress={() => router.push({ pathname: settingsHref('notifications', pathname), params: { section: 'holidays' } } as never)} />}
      {permission === 'denied' && on && <Text style={type.caption}>Notifications are off for this app. Turn them on in your phone’s Settings to hear these.</Text>}
    </Card>
  );
}
