// The Grimoire | Rituals | Craft switch at the top of the Practice tab's three
// homes. Grimoire is its own route; Rituals and Craft share the Rituals stack
// (lib/practiceSections.ts), so choosing one navigates there. The Library
// and Settings doors sit beside it (HeaderTools).

import { router, type Href } from 'expo-router';

import { rememberPracticeSection } from '../lib/practiceSection';
import { PRACTICE_SECTIONS, type PracticeSection } from '../lib/practiceSections';
import { HeaderRow } from './HeaderTools';
import { SegmentedSwitch } from './SegmentedSwitch';

export function PracticeSwitch({ current }: { current: PracticeSection }) {
  return (
    <HeaderRow>
      <SegmentedSwitch
      label="Practice"
      options={PRACTICE_SECTIONS}
      value={current}
      onChange={(key) => {
        rememberPracticeSection(key);
        router.navigate(PRACTICE_SECTIONS.find((s) => s.key === key)!.href as Href);
      }}
      />
    </HeaderRow>
  );
}
