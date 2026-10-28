import { Redirect } from 'expo-router';

// Companion panel is now part of Settings → Altar → About sheet.
export default function CompanionMoved() {
  return <Redirect href="/more/settings/about-sheet" />;
}
