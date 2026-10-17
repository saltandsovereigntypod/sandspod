// The practices someone can choose in Settings → My practice, and how the
// choice is saved (a comma list of practice ids in `my_practice`). Pure and
// free of the premade data, so the website can load it on its own.

import type { PracticeId } from './types.ts';

export type Practice = { id: PracticeId; name: string; about: string };

export const PRACTICES: Practice[] = [
  { id: 'eclectic', name: 'Eclectic', about: 'Blends practices, folklore and beliefs from many cultures, paths and traditions rather than one set system.' },
  { id: 'green', name: 'Green', about: 'Nature, botanical work and gardening: herbs, plants and flowers in spellwork.' },
  { id: 'kitchen', name: 'Kitchen & hearth', about: 'Magic in the home: cooking, baking, cleaning and family care as intentional ritual.' },
  { id: 'hedge', name: 'Hedge', about: 'Liminal spaces, intuition, spirit work and journeying between this world and the veil.' },
  { id: 'solitary', name: 'Solitary', about: 'Rituals, spells and practice done alone rather than in a group or coven.' },
  { id: 'cosmic', name: 'Cosmic & celestial', about: 'Astrology, astronomy, star charts and planetary timing to time and power the work.' },
  { id: 'crystal', name: 'Crystal', about: 'Minerals, crystals and stones for energy work, healing and amplification.' },
  { id: 'elemental', name: 'Elemental', about: 'Earth, air, fire and water: all four in balance, or one element alone.' },
  { id: 'sea', name: 'Sea', about: 'Oceans, rivers and tides, sea weather, shells and salt water, and the moon’s pull on water.' },
  { id: 'folk', name: 'Traditional & folk', about: 'Historical lore, regional folklore, local spirits and old-ways customs rather than modern frameworks.' },
];

export const practiceName = (id: string) => PRACTICES.find((p) => p.id === id)?.name ?? id;

type SettingsLike = Record<string, unknown> | null | undefined;

/** Settings → My practice, saved as a comma list of practice ids. */
export function myPractices(settings: SettingsLike): PracticeId[] {
  const raw = typeof settings?.my_practice === 'string' ? settings.my_practice : '';
  const chosen = raw.split(',').map((id) => id.trim());
  return PRACTICES.map((p) => p.id).filter((id) => chosen.includes(id));
}

export const practicesValue = (ids: string[]) => PRACTICES.map((p) => p.id).filter((id) => ids.includes(id)).join(',');
