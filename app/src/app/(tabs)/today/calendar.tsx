import { router } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';

import { Button } from '../../../components/Button';
import { MoreScreen } from '../../../components/more/ui';
import { settingsHref } from '../../../lib/settings/links';
import { useMySettings } from '../../../lib/settings/store';
import { colors, type } from '../../../theme';
import { YearAhead } from '../more/settings/calendar';

// Holidays ahead, opened from a holiday on Today that has no page of its own:
// the year's holidays from the calendars you keep, to read. Choosing the
// calendars is a tap away, in Settings (still inside Today).
export default function HolidaysAhead() {
  const { settings } = useMySettings();
  return (
    <MoreScreen title="Holidays ahead" eyebrow="Your calendars" back="/today" backLabel="Back to Today">
      <Text style={type.body}>The holidays of the calendars you keep, for the next twelve months, with what they mean.</Text>
      <Button label="Choose calendars ›" variant="outline" onPress={() => router.push(settingsHref('calendar', '/today'))} />
      {settings ? <YearAhead draft={settings} /> : <ActivityIndicator color={colors.gold} />}
    </MoreScreen>
  );
}
