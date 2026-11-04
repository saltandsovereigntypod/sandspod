import { Redirect } from 'expo-router';

// My shared rituals is Community → Mine now; old links arrive there.
export default function MySharedRitualsMoved() {
  return <Redirect href={{ pathname: '/rituals/community', params: { tab: 'mine' } }} />;
}
