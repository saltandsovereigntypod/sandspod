import { Redirect, useLocalSearchParams } from 'expo-router';

// Logging a reading happens under Divination now, open to every practice.
export default function HedgeReadingEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <Redirect href={{ pathname: '/rituals/divination/edit', params: id ? { id } : {} }} />;
}
