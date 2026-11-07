// Pure rules for the option picker: when a long list of chips folds into one
// row that opens a sheet, what that row says, and how the sheet's search works.

/** More options than this and chips fold into a picker row. */
export const PICKER_AFTER = 8;
/** More options than this and the picker's sheet gets a search field. */
export const SEARCH_AFTER = 12;

export type PickerOption = { key: string; label: string; selected: boolean };

export function shouldFold(count: number): boolean {
  return count > PICKER_AFTER;
}

export function shouldSearch(count: number): boolean {
  return count > SEARCH_AFTER;
}

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Options whose label holds every word of the query, in their own order. Case and accents are ignored. */
export function filterOptions<T extends { label: string }>(options: readonly T[], query: string): T[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [...options];
  return options.filter((o) => {
    const label = fold(o.label);
    return words.every((w) => label.includes(w));
  });
}

/** What the row shows: the one choice, two names, or how many are chosen. */
export function summaryLabel(options: readonly PickerOption[], placeholder = 'Choose'): string {
  const chosen = options.filter((o) => o.selected).map((o) => o.label);
  if (!chosen.length) return placeholder;
  if (chosen.length <= 2) return chosen.join(', ');
  return `${chosen.length} chosen`;
}
