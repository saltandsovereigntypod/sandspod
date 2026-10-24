import { Redirect, type Href } from 'expo-router';

// Covens moved from More to their own tab; old links (and reminders set
// before the move) land there.
export default function OldCovens() {
  return <Redirect href={'/coven' as Href} />;
}
