import { Redirect, useLocalSearchParams } from 'expo-router';

// Draws are under Divination now, open to every practice.
export default function HedgeDraw() {
  const { spread } = useLocalSearchParams<{ spread?: string }>();
  return <Redirect href={{ pathname: '/rituals/divination/draw', params: spread ? { spread } : {} }} />;
}
