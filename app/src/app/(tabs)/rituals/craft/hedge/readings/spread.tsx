import { Redirect, useLocalSearchParams } from 'expo-router';

// Making a spread happens under Divination now, open to every practice.
export default function HedgeSpread() {
  const { id, kind } = useLocalSearchParams<{ id?: string; kind?: string }>();
  const params: Record<string, string> = {};
  if (id) params.id = id;
  if (kind) params.kind = kind;
  return <Redirect href={{ pathname: '/rituals/divination/spread', params }} />;
}
