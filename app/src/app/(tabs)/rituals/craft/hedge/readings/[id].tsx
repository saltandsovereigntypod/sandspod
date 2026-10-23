import { Redirect, useLocalSearchParams } from 'expo-router';

// A reading opens under Divination now, open to every practice.
export default function HedgeReading() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: '/rituals/divination/[id]', params: { id } }} />;
}
