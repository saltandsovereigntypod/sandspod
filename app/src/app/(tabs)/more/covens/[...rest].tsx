import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

// Covens moved from More to their own tab; old links (and reminders set
// before the move, /more/covens/c/<coven>/ritual/<id>) land on the same screen there.
export default function OldCovenScreen() {
  const { rest } = useLocalSearchParams<{ rest: string[] | string }>();
  const path = (Array.isArray(rest) ? rest : [rest]).filter(Boolean).map(encodeURIComponent).join('/');
  return <Redirect href={`/coven/${path}` as Href} />;
}
