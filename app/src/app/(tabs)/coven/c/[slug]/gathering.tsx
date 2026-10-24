import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

// The coven's chat moved to Messages; older links still land there.
export default function Gathering() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <Redirect href={`/coven/c/${slug}/chat/coven` as Href} />;
}
