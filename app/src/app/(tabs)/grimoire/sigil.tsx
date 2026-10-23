import { useLocalSearchParams } from 'expo-router';

import { SigilMaker } from '../../../components/sigil/SigilMaker';

// New page → A sigil: made here, saved as its own page in the chosen section.
export default function GrimoireSigil() {
  const { sectionId } = useLocalSearchParams<{ sectionId?: string }>();
  return <SigilMaker back="Your Grimoire" eyebrow="Grimoire" sectionId={sectionId || null} fromGrimoire />;
}
