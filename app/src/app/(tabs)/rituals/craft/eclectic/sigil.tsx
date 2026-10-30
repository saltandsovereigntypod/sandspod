import { Redirect, type Href } from 'expo-router';

// The sigil maker is open to every practice now, from the Craft home.
export default function EclecticSigil() {
  return <Redirect href={'/rituals/sigil' as Href} />;
}
