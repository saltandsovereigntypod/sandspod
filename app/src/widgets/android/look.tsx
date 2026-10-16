'use no memo';
// The Android widgets' shared look: the same colours, night-sky background and
// little drawings as the iPhone widgets (which use Apple's symbols; here they're
// drawn as small pictures).

import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

export const night = '#0f1a14';
export const cream = '#f4ecd8';
export const gold = '#e2c36d';
export const muted = '#cabf9d';
export const serif = 'serif';

export type Size = 'small' | 'medium' | 'large';
export type Box = { width: number; height: number; size: Size };

/** Android tells us the widget's size; this sorts it into the iPhone's small, medium and large. */
export function boxOf(width: number, height: number): Box {
  const size: Size = height >= 260 ? 'large' : width >= 250 ? 'medium' : 'small';
  return { width, height, size };
}

/** The night-sky gradient behind the day widgets. */
export const sky = { from: '#1a2c21', to: '#0a120d', orientation: 'TL_BR' } as const;

type TextProps = { text: string; size: number; color?: string; weight?: 'normal' | 'bold' | '600' | '500'; font?: string; lines?: number; italic?: boolean; align?: 'left' | 'center' | 'right' };

/** A line of words, the size the iPhone widget uses. */
export function Words({ text, size, color = cream, weight = 'normal', font, lines = 1, italic, align }: TextProps) {
  return (
    <TextWidget
      text={text}
      maxLines={lines}
      truncate="END"
      allowFontScaling={false}
      style={{ fontSize: size, color: color as `#${string}`, fontWeight: weight, fontFamily: font, fontStyle: italic ? 'italic' : 'normal', textAlign: align }}
    />
  );
}

export const Label = ({ text }: { text: string }) => <Words text={text} size={10} weight="600" color={gold} />;

export const Gap = ({ h = 0, w = 0 }: { h?: number; w?: number }) => <FlexWidget style={{ height: h || 1, width: w || 1 }} />;

/** Fills the space left in a row or column (SwiftUI's Spacer). */
export const Spacer = () => <FlexWidget style={{ flex: 1 }} />;

// ── Drawings ──────────────────────────────────────────────────────────────

const svg = (body: string, view = 24) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${view} ${view}">${body}</svg>`;

/** The moon as it looks: `lit` 0–1 of its face lit, waxing (lit on the right) or waning. */
export function moonSvg(lit: number, waxing: boolean, color = cream): string {
  const r = 45;
  const p = Math.max(0, Math.min(1, lit));
  const dark = `<circle cx="50" cy="50" r="${r}" fill="${color}" fill-opacity="0.16" stroke="${color}" stroke-opacity="0.55" stroke-width="2"/>`;
  if (p < 0.02) return svg(dark, 100);
  if (p > 0.98) return svg(`<circle cx="50" cy="50" r="${r}" fill="${color}"/>`, 100);
  const rx = Math.abs(1 - 2 * p) * r;
  const crescent = p < 0.5;
  // Outer edge on the lit side, then back along the line between light and dark.
  const outer = waxing ? 1 : 0;
  const inner = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
  const lightPath = `<path d="M50 ${50 - r} A${r} ${r} 0 0 ${outer} 50 ${50 + r} A${rx.toFixed(2)} ${r} 0 0 ${inner} 50 ${50 - r} Z" fill="${color}"/>`;
  return svg(dark + lightPath, 100);
}

const PHASE_LIGHT: Record<string, [number, boolean]> = {
  'moonphase.new.moon': [0, true],
  'moonphase.waxing.crescent': [0.25, true],
  'moonphase.first.quarter': [0.5, true],
  'moonphase.waxing.gibbous': [0.78, true],
  'moonphase.full.moon': [1, true],
  'moonphase.waning.gibbous': [0.78, false],
  'moonphase.last.quarter': [0.5, false],
  'moonphase.waning.crescent': [0.25, false],
};

/** A phase's symbol name (the iPhone's) as a drawing; tonight's uses the real share lit. */
export function Moon({ symbol, size, percent, color = cream }: { symbol: string; size: number; percent?: number; color?: string }) {
  const [lit, waxing] = PHASE_LIGHT[symbol] ?? [0.5, true];
  const share = percent != null && lit > 0 && lit < 1 ? percent / 100 : lit;
  return <SvgWidget svg={moonSvg(share, waxing, color)} style={{ width: size, height: size }} />;
}

const ICONS: Record<string, (c: string) => string> = {
  flame: (c) => svg(`<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`),
  flameFill: (c) => svg(`<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="${c}"/>`),
  sparkles: (c) => svg(`<path d="M10 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="${c}"/><path d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="${c}"/>`),
  hands: (c) => svg(`<path d="M12 3l1.4 4.2L18 8.5l-4.6 1.3L12 14l-1.4-4.2L6 8.5l4.6-1.3z" fill="${c}"/><path d="M3 15c2 0 4 1 5 3h8c1-2 3-3 5-3v3c-2 0-3 1-4 3H7c-1-2-2-3-4-3z" fill="${c}"/>`),
  diamond: (c) => svg(`<path d="M12 2l8 10-8 10-8-10z" fill="${c}"/>`),
  hourglass: (c) => svg(`<path d="M6 2h12v4l-4 6 4 6v4H6v-4l4-6-4-6z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`),
  circle: (c) => svg(`<circle cx="12" cy="12" r="8" fill="none" stroke="${c}" stroke-width="3"/>`),
};

export function Icon({ name, size, color = gold }: { name: keyof typeof ICONS; size: number; color?: string }) {
  return <SvgWidget svg={ICONS[name](color)} style={{ width: size, height: size }} />;
}

/** "2:08 PM" today, "Oct 13" another day: when something last happened. */
export function whenText(iso: string, now: Date): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  if (date.toDateString() === now.toDateString()) {
    const h = date.getHours();
    return `${h % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/** "in 2 hr 10 min", "in 3 days": how long until something. */
export function untilText(iso: string, now: Date): string {
  const ms = Date.parse(iso) - now.getTime();
  if (!Number.isFinite(ms)) return '';
  if (ms <= 0) return 'now';
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `in ${hours} hr${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
  return `in ${Math.round(hours / 24)} days`;
}
