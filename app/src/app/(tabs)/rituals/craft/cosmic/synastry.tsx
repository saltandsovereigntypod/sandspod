import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

// Two charts are compared in one place now: "How your charts meet", whose
// Detail section holds the full synastry (every contact, the bi-wheel and the
// house overlays). Older links land there.
export default function SynastryMoved() {
  const params = useLocalSearchParams<{ a?: string; b?: string }>();
  return <Redirect href={{ pathname: '/rituals/craft/cosmic/relationship', params: { ...(params.a ? { a: params.a } : {}), ...(params.b ? { b: params.b } : {}), detail: '1' } } as Href} />;
}
