// Which of the Practice tab's three sections (Grimoire, Rituals or Craft) was
// used last, so the tab reopens it. Kept in memory and on the device; nothing
// breaks without it. Which section a screen belongs to is in
// practiceSections.ts (pure, and tested).

import AsyncStorage from '@react-native-async-storage/async-storage';

import { asPracticeSection, type PracticeSection } from './practiceSections';

export type { PracticeSection } from './practiceSections';

const KEY = 'saltPracticeSection';
let last: PracticeSection = 'grimoire';

AsyncStorage.getItem(KEY)
  .then((value) => {
    const stored = asPracticeSection(value);
    if (stored) last = stored;
  })
  .catch(() => {});

export const lastPracticeSection = (): PracticeSection => last;

export function rememberPracticeSection(section: PracticeSection) {
  if (last === section) return;
  last = section;
  AsyncStorage.setItem(KEY, section).catch(() => {});
}
