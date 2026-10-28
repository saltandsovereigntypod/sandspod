import { Redirect } from 'expo-router';

// Living Objects is now part of Settings → Altar → About sheet.
export default function LivingObjectsMoved() {
  return <Redirect href="/more/settings/about-sheet" />;
}
