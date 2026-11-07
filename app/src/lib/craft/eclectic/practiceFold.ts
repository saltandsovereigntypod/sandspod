// One home for what a Library thing means to you: its My practice (the Living
// Library's own layer, living_library_entries). My correspondences
// (`eclectic.correspondences`) keeps only free-form things that aren't in the
// Library. A correspondence written about a Library entry before this is
// folded into that entry's My practice once (its meaning, pairings, element,
// planet, day, colour and source), and marked as moved (movedTo), never
// deleted. The correspondence finder and My correspondences read both. Pure.

import { emptyPracticeInput, mergePractice, PRACTICE_FIELDS, type PracticeInput } from '../../library/practiceModel.ts';
import type { LibraryEntry } from '../../library/types.ts';
import { correspondenceDetail, sourceLabel, type MyCorrespondence } from './correspondences.ts';

/** Moved into a Library entry's My practice: that entry's id. */
export const movedTo = (c: MyCorrespondence) => (typeof (c as { movedTo?: unknown }).movedTo === 'string' ? ((c as { movedTo?: string }).movedTo as string) : '');

/** The free-form ones: everything not yet moved into My practice. */
export const freeForm = <T extends { data: MyCorrespondence }>(list: T[]) => list.filter((e) => !movedTo(e.data));

const addLine = (text: string, line: string) => {
  const t = text.trim();
  const l = line.trim();
  if (!l || t.toLowerCase().includes(l.toLowerCase())) return t;
  return t ? `${t}\n${l}` : l;
};

/** An entry's My practice with a correspondence folded in: nothing it already says is lost or repeated. */
export function practiceWith(existing: Record<string, unknown> | null | undefined, c: MyCorrespondence): Record<string, unknown> {
  const input: PracticeInput = emptyPracticeInput(existing);
  input.Meaning = addLine(input.Meaning, c.meaning);
  input.PairsWith = addLine(input.PairsWith, c.pairs ?? '');
  const detail = correspondenceDetail({ ...c, meaning: '', pairs: '' } as MyCorrespondence);
  const source = [sourceLabel(c.source), c.sourceNote.trim()].filter(Boolean).join(': ');
  input.Notes = addLine(input.Notes, [detail, source ? `Source: ${source}` : ''].filter(Boolean).join('. '));
  return mergePractice(existing, input);
}

/** The correspondences still to fold in: written about a Library entry this person can see, not yet moved. */
export function toFold<T extends { id: string; data: MyCorrespondence }>(list: T[], entryOf: (id: string) => LibraryEntry | null): { item: T; entry: LibraryEntry }[] {
  const out: { item: T; entry: LibraryEntry }[] = [];
  for (const item of list) {
    if (movedTo(item.data) || !item.data.ref) continue;
    const entry = entryOf(item.data.ref);
    if (entry) out.push({ item, entry });
  }
  return out;
}

/** The fields to write for savePractice (PracticeInput), from the merged My practice. */
export const practiceInput = (merged: Record<string, unknown>): PracticeInput => emptyPracticeInput(merged);

/** My practice read as a correspondence, so the finder and My correspondences can list it beside the free-form ones. */
export function practiceAsCorrespondence(entry: Pick<LibraryEntry, 'id' | 'name' | 'myPractice'>): MyCorrespondence | null {
  const p = entry.myPractice;
  if (!p) return null;
  const input = emptyPracticeInput(p);
  if (!PRACTICE_FIELDS.some(({ key }) => input[key].trim())) return null;
  return { name: entry.name, ref: entry.id, meaning: [input.Meaning, input.Uses].filter((s) => s.trim()).join(' '), element: '', planet: '', day: '', colour: '', source: null, sourceNote: input.Notes, pairs: input.PairsWith };
}
