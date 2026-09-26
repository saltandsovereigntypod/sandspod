// Sanctuary settings, matching the website's js/my-settings.js: the same
// defaults, the same `user_settings` row shape, and the same guest storage
// key, so settings saved on either side read the same on the other.

export const SETTINGS_LOCAL_KEY = 'saltAndSovereigntyUserSettings';

export const LAYERS = ['myPractice', 'traditional', 'community'] as const;
export type Layer = (typeof LAYERS)[number];

export const LIBRARY_CATEGORIES = [
  'meanings',
  'uses',
  'correspondences',
  'ingredients',
  'intentions',
  'pairings',
  'substitutions',
  'warnings',
  'grimoire',
  'dressings',
  'groups',
  'notes',
  'sources',
] as const;
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<LibraryCategory, string> = {
  meanings: 'Meanings',
  uses: 'Uses',
  correspondences: 'Correspondences',
  ingredients: 'Ingredients',
  intentions: 'Intentions',
  pairings: 'Pairings',
  substitutions: 'Substitutions',
  warnings: 'Warnings',
  grimoire: 'Grimoire links and status',
  dressings: 'Candle dressings',
  groups: 'Groups and connected items',
  notes: 'Notes',
  sources: 'Sources',
};

export const LAYER_LABELS: Record<Layer, string> = {
  myPractice: 'My Practice',
  traditional: 'Traditional Information',
  community: 'Community',
};

export const LAYER_ORDER_OPTIONS = [
  'myPractice,traditional,community',
  'traditional,myPractice,community',
  'community,myPractice,traditional',
  'myPractice,community,traditional',
] as const;

export const GREETING_OPTIONS = [
  { value: 'preferred', label: 'Preferred name' },
  { value: 'magical', label: 'Magical name' },
  { value: 'none', label: 'No name' },
] as const;

export const PAGE_FONT_OPTIONS = [
  { value: 'classic-serif', label: 'Classic Serif' },
  { value: 'dark-academia', label: 'Dark Academia' },
  { value: 'soft-journal', label: 'Soft Journal' },
  { value: 'handwritten', label: 'Handwritten' },
] as const;

export type SettingValue = string | boolean;
export type Settings = Record<string, SettingValue> & {
  preferred_name: string;
  pronouns: string;
  magical_name: string;
  sanctuary_greeting_name: string;
  default_altar_background: string;
  default_mundane_mode: boolean;
  grimoire_page_font: string;
  sync_traditional_library_to_grimoire: boolean;
  library_layer_order: string;
};

const layerFlags = (layer: Layer, off: LibraryCategory[] = [], enabled = true) => ({
  [`library_${layer}_enabled`]: enabled,
  ...Object.fromEntries(LIBRARY_CATEGORIES.map((category) => [`library_${layer}_${category}`, !off.includes(category)])),
});

const companionFlags = (prefix: string, on: Record<string, boolean>) =>
  Object.fromEntries(Object.entries(on).map(([key, value]) => [`companion_${prefix}_${key}`, value]));

export function defaultSettings(): Settings {
  return {
    preferred_name: '',
    pronouns: '',
    magical_name: '',
    sanctuary_greeting_name: 'preferred',
    default_altar_background: '',
    default_mundane_mode: false,
    grimoire_page_font: 'classic-serif',
    sync_traditional_library_to_grimoire: false,
    library_layer_order: 'myPractice,traditional,community',
    ...layerFlags('myPractice'),
    ...layerFlags('traditional', ['grimoire', 'dressings']),
    ...layerFlags('community', ['grimoire', 'dressings'], false),
    companion_copy_grimoire_settings: true,
    companion_layer_order: 'myPractice,traditional,community',
    ...companionFlags('my', {
      enabled: true,
      meanings: true,
      uses: true,
      correspondences: true,
      ingredients: true,
      intentions: true,
      pairings: true,
      substitutions: true,
      warnings: true,
      grimoire: true,
      dressings: true,
      groups: true,
      notes: true,
      sources: true,
    }),
    ...companionFlags('traditional', {
      enabled: false,
      meanings: false,
      uses: true,
      correspondences: false,
      ingredients: true,
      intentions: true,
      pairings: true,
      substitutions: true,
      warnings: false,
      sources: false,
    }),
    ...companionFlags('community', {
      enabled: false,
      meanings: true,
      uses: true,
      correspondences: true,
      ingredients: true,
      intentions: true,
      pairings: true,
      substitutions: true,
      warnings: true,
      notes: false,
      sources: true,
    }),
    living_state_show_status: true,
    living_state_show_created: true,
    living_state_show_source: true,
    living_state_show_last_tended: true,
    living_state_show_expiration: true,
    living_state_show_future_tending: true,
    living_state_show_remaining: true,
    living_state_show_recent_activity: true,
  };
}

const ROW_ONLY_KEYS = new Set(['settings', 'user_id', 'updated_at']);

/**
 * Same merge as the website's normalizeMySettings: defaults, then the JSON
 * `settings` column, then the row's own columns. Values are coerced to the
 * default's type so a stray null never reaches a switch or text field.
 */
export function normalizeSettings(input: unknown): Settings {
  const source = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const nested = source.settings && typeof source.settings === 'object' ? (source.settings as Record<string, unknown>) : {};
  const merged: Record<string, unknown> = { ...nested, ...source };
  const out: Record<string, SettingValue> = defaultSettings();
  for (const [key, value] of Object.entries(merged)) {
    if (ROW_ONLY_KEYS.has(key)) continue;
    const fallback = out[key];
    if (typeof fallback === 'boolean') out[key] = value == null ? fallback : Boolean(value);
    else if (typeof fallback === 'string') out[key] = value == null ? fallback : String(value);
    else if (typeof value === 'string' || typeof value === 'boolean') out[key] = value;
  }
  return out as Settings;
}

/** The row the website upserts into `user_settings` (onConflict user_id). */
export function settingsRow(settings: Settings, userId: string, now: Date = new Date()) {
  const normalized = normalizeSettings(settings);
  return {
    user_id: userId,
    preferred_name: normalized.preferred_name || '',
    pronouns: normalized.pronouns || '',
    magical_name: normalized.magical_name || '',
    default_mundane_mode: Boolean(normalized.default_mundane_mode),
    default_altar_background: normalized.default_altar_background || '',
    settings: normalized,
    updated_at: now.toISOString(),
  };
}

/** The name the Sanctuary greets you with, per `sanctuary_greeting_name`. */
export function greetingName(settings: Settings): string {
  if (settings.sanctuary_greeting_name === 'none') return '';
  if (settings.sanctuary_greeting_name === 'magical') return settings.magical_name.trim() || settings.preferred_name.trim();
  return settings.preferred_name.trim() || settings.magical_name.trim();
}

export function layerOrder(settings: Settings): Layer[] {
  const order = String(settings.library_layer_order || LAYER_ORDER_OPTIONS[0])
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is Layer => (LAYERS as readonly string[]).includes(item));
  for (const layer of LAYERS) if (!order.includes(layer)) order.push(layer);
  return order;
}

export function layerOrderLabel(order: string): string {
  return order
    .split(',')
    .map((layer) => LAYER_LABELS[layer as Layer] ?? layer)
    .join(', ');
}
