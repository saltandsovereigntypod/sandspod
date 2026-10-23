import { Redirect, type Href } from 'expo-router';

// Readings moved out of Hedge: divination is open to every practice now.
export default function HedgeReadings() {
  return <Redirect href={'/rituals/divination' as Href} />;
}
