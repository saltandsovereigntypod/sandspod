// Which kinds of draw the draw screen offers: tarot, runes, ogham,
// Lenormand, Kipper and your own decks, each of which you can hide in
// Settings → Divination (app and website alike). Kept with your settings
// as a comma list of the hidden ones, so a new kind shows until you hide
// it. Small and self-contained, so the website's settings can load it
// without the whole deck. Pure.

export const HIDDEN_KINDS_KEY = 'divination_hidden_kinds';

export const KIND_CHOICES: { id: string; label: string; detail: string }[] = [
  { id: 'tarot', label: 'Tarot', detail: 'The Rider–Waite–Smith deck.' },
  { id: 'runes', label: 'Runes', detail: 'The Elder Futhark.' },
  { id: 'ogham', label: 'Ogham', detail: 'The twenty feda.' },
  { id: 'lenormand', label: 'Lenormand', detail: 'Thirty-six cards, read in pairs and lines.' },
  { id: 'kipper', label: 'Kipper', detail: 'Thirty-six German cards of people and situations.' },
  { id: 'oracle', label: 'Your decks', detail: 'Oracle decks of your own, with their cards and meanings.' },
];

/** The kinds you've hidden. */
export function hiddenKinds(settings: Record<string, unknown> | null | undefined): string[] {
  const raw = settings?.[HIDDEN_KINDS_KEY];
  return typeof raw === 'string' ? raw.split(',').map((s) => s.trim()).filter((s) => KIND_CHOICES.some((k) => k.id === s)) : [];
}

/** The setting's value for a list of hidden kinds, in the usual order. */
export const hiddenKindsValue = (hidden: string[]) => KIND_CHOICES.map((k) => k.id).filter((id) => hidden.includes(id)).join(',');

/** The setting changed to show or hide one kind. */
export function withKindShown(settings: Record<string, unknown> | null | undefined, id: string, shown: boolean): string {
  const hidden = hiddenKinds(settings).filter((h) => h !== id);
  return hiddenKindsValue(shown ? hidden : [...hidden, id]);
}

/**
 * The kinds to offer, leaving out the hidden ones, but never leaving
 * nothing (tarot comes back if all are hidden) and always keeping `keep`,
 * the kind already chosen, so a link to a hidden kind still works.
 */
export function shownKinds<T extends { id: string }>(kinds: T[], settings: Record<string, unknown> | null | undefined, keep?: string | null): T[] {
  const hidden = hiddenKinds(settings);
  const shown = kinds.filter((k) => !hidden.includes(k.id) || k.id === keep);
  return shown.length ? shown : kinds.filter((k) => k.id === 'tarot');
}
