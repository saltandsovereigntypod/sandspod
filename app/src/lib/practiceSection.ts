// Which half of the Practice tab (Grimoire or Rituals) was used last, so the
// tab reopens it. Kept in memory and on the device; nothing breaks without it.

import AsyncStorage from '@react-native-async-storage/async-storage';

export type PracticeSection = 'grimoire' | 'rituals';

const KEY = 'saltPracticeSection';
let last: PracticeSection = 'grimoire';

AsyncStorage.getItem(KEY)
  .then((value) => {
    if (value === 'grimoire' || value === 'rituals') last = value;
  })
  .catch(() => {});

export const lastPracticeSection = (): PracticeSection => last;

export function rememberPracticeSection(section: PracticeSection) {
  if (last === section) return;
  last = section;
  AsyncStorage.setItem(KEY, section).catch(() => {});
}
