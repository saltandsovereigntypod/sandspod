// The personal dream dictionary, kept with the other craft entries
// (collection `dreams.dictionary`), so it follows the account.

import { useMemo } from 'react';

import { addEntry, removeEntry, updateEntry, useCraft } from '../craft/store';
import { DICTIONARY, normalizeDictionaryEntry, type DictionaryEntry } from './reader';

export type DictionaryRow = { id: string; data: DictionaryEntry };

export function useDictionary(): { rows: DictionaryRow[]; entries: DictionaryEntry[] } {
  const { entries } = useCraft<unknown>(DICTIONARY);
  return useMemo(() => {
    const rows = entries.map((e) => ({ id: e.id, data: normalizeDictionaryEntry(e.data) })).filter((r) => r.data.word && r.data.meaning);
    return { rows, entries: rows.map((r) => r.data) };
  }, [entries]);
}

export const saveMeaning = (data: DictionaryEntry, id?: string) => (id ? updateEntry(DICTIONARY, id, data) : addEntry(DICTIONARY, data));
export const deleteMeaning = (id: string) => removeEntry(DICTIONARY, id);
