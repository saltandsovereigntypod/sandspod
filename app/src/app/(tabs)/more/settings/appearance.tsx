import { Redirect } from 'expo-router';

// Appearance (the default altar background) is now part of Settings → Altar.
export default function AppearanceMoved() {
  return <Redirect href="/more/settings/altar" />;
}
