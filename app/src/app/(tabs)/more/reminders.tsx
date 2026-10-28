import { Redirect, useLocalSearchParams } from 'expo-router';

// The old More → Reminders route, kept for links and notifications that
// still point here: it opens Settings → Notifications & reminders, at the
// same section.
export default function RemindersMoved() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  return <Redirect href={section ? { pathname: '/more/settings/notifications', params: { section } } : '/more/settings/notifications'} />;
}
