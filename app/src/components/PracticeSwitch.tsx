// The Grimoire | Rituals switch at the top of the Practice tab's two halves.
// Each half is its own route, so choosing one navigates there.

import { router, type Href } from 'expo-router';

import { rememberPracticeSection, type PracticeSection } from '../lib/practiceSection';
import { SegmentedSwitch } from './SegmentedSwitch';

const SECTIONS: { key: PracticeSection; label: string; href: Href }[] = [
  { key: 'grimoire', label: 'Grimoire', href: '/grimoire' },
  { key: 'rituals', label: 'Rituals', href: '/rituals' },
];

export function PracticeSwitch({ current }: { current: PracticeSection }) {
  return (
    <SegmentedSwitch
      label="Practice"
      options={SECTIONS}
      value={current}
      onChange={(key) => {
        rememberPracticeSection(key);
        router.navigate(SECTIONS.find((s) => s.key === key)!.href);
      }}
    />
  );
}
