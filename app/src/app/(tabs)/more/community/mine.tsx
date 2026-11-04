import { Redirect } from 'expo-router';

// My submissions is Community → Mine now; old links and notifications arrive there.
export default function MySubmissionsMoved() {
  return <Redirect href={{ pathname: '/more/community', params: { tab: 'mine' } }} />;
}
