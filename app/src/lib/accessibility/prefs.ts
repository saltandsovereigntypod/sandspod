// Accessibility preferences, matching the website's js/accessibility.js: the
// same choices, the same per-device storage key for each guest or account
// (`saltAndSovereigntyAccessibility:guest` / `:user:<id>`) and the same saved
// shape, so a web build of the app and the website read each other's choices.
//
// This file stays free of React Native so the theme can read the current
// choices while it builds text styles, and tests can run it under node.

export const ACCESSIBILITY_STORAGE_PREFIX = 'saltAndSovereigntyAccessibility';
export const TEXT_SCALES = [0.9, 1, 1.1, 1.2, 1.3] as const;

export type AccessibilityPrefs = {
  textScale: number;
  lineSpacing: boolean;
  letterSpacing: boolean;
  readableFont: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  // Kept so the website's choices survive a save from the app, though a phone has no use for them.
  hideDecoration: boolean;
  readingRuler: boolean;
  focusMode: boolean;
};

export const ACCESSIBILITY_DEFAULTS: Readonly<AccessibilityPrefs> = Object.freeze({
  textScale: 1,
  lineSpacing: false,
  letterSpacing: false,
  readableFont: false,
  highContrast: false,
  reduceMotion: false,
  hideDecoration: false,
  readingRuler: false,
  focusMode: false,
});

const BOOLEAN_KEYS = (Object.keys(ACCESSIBILITY_DEFAULTS) as (keyof AccessibilityPrefs)[]).filter(
  (key) => typeof ACCESSIBILITY_DEFAULTS[key] === 'boolean',
);

/** `guest` or `user:<id>`, as the website's setScope picks it. */
export function accessibilityScope(userId: string | null | undefined): string {
  return userId ? `user:${userId}` : 'guest';
}

export function accessibilityStorageKey(scope: string): string {
  return `${ACCESSIBILITY_STORAGE_PREFIX}:${scope}`;
}

/** The website's normalize(): known scales and true/false values only, defaults for the rest. */
export function normalizeAccessibility(candidate: unknown): AccessibilityPrefs {
  const source = candidate && typeof candidate === 'object' ? (candidate as Record<string, unknown>) : {};
  const output: AccessibilityPrefs = { ...ACCESSIBILITY_DEFAULTS };
  const scale = Number(source.textScale);
  if ((TEXT_SCALES as readonly number[]).includes(scale)) output.textScale = scale;
  for (const key of BOOLEAN_KEYS) {
    if (typeof source[key] === 'boolean') (output as Record<string, unknown>)[key] = source[key];
  }
  return output;
}

/** What the website writes on every change (persist): focus mode is never kept. */
export function accessibilityToSave(prefs: AccessibilityPrefs): string {
  return JSON.stringify({ ...normalizeAccessibility(prefs), focusMode: false });
}

/** One step smaller or larger, staying within the website's scales. */
export function stepTextScale(current: number, step: -1 | 1): number {
  const index = (TEXT_SCALES as readonly number[]).indexOf(current);
  const from = index === -1 ? 1 : index;
  return TEXT_SCALES[Math.max(0, Math.min(TEXT_SCALES.length - 1, from + step))];
}

// The theme's text colours and their high-contrast versions (css/styles.css .a11y-high-contrast).
const HIGH_CONTRAST: Record<string, string> = {
  '#f4ecd8': '#fff8e8', // cream
  '#e6dcc2': '#fff8e8', // parchment
  '#cabf9d': '#eee1bd', // muted
  '#b4ad96': '#eee1bd', // tabInactive
};

// Line spacing applies to running text, not headings (the website's p, li, label).
const BODY_TEXT_MAX = 18;

type TextLike = {
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: unknown;
};

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * A text style with the preferences applied: scaled text, roomier lines
 * (1.75, as the website), wider letters (0.04em), the phone's own system
 * font in place of the decorative ones, and brighter text colours.
 */
export function accessibleTextStyle<T extends object>(style: T, prefs: AccessibilityPrefs): T {
  const base = style as TextLike;
  const next: TextLike = { ...base };
  const size = typeof base.fontSize === 'number' ? base.fontSize : null;
  if (size !== null && prefs.textScale !== 1) next.fontSize = round(size * prefs.textScale);
  if (typeof base.lineHeight === 'number' && prefs.textScale !== 1) next.lineHeight = round(base.lineHeight * prefs.textScale);
  if (prefs.lineSpacing && size !== null && size <= BODY_TEXT_MAX) {
    next.lineHeight = Math.max(next.lineHeight ?? 0, Math.round((next.fontSize ?? size) * 1.75));
  }
  if (prefs.letterSpacing && size !== null) next.letterSpacing = round((base.letterSpacing ?? 0) + (next.fontSize ?? size) * 0.04);
  if (prefs.readableFont && base.fontFamily) {
    const family = base.fontFamily;
    next.fontFamily = undefined;
    if (/SemiBold/.test(family)) next.fontWeight = '600';
    else if (/Bold/.test(family)) next.fontWeight = '700';
    else if (/Medium/.test(family)) next.fontWeight = '500';
    if (/Italic/.test(family)) next.fontStyle = 'italic';
  }
  if (prefs.highContrast && typeof base.color === 'string') {
    next.color = HIGH_CONTRAST[base.color.toLowerCase()] ?? base.color;
  }
  return next as T;
}

// The choices in effect right now, for styles built outside React (the theme).
let current: AccessibilityPrefs = { ...ACCESSIBILITY_DEFAULTS };

export function currentAccessibility(): AccessibilityPrefs {
  return current;
}

export function setCurrentAccessibility(prefs: AccessibilityPrefs) {
  current = prefs;
}
