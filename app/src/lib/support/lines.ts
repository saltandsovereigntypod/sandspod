// Crisis and support lines for More → Support.
//
// Every entry was checked against the service's own website (October 2026).
// Numbers change: re-check each one against its `url` before editing, and
// remove a line rather than guess. Pure data and helpers, no imports, so the
// tests can load it directly.

export type SupportCategory = 'crisis' | 'grief' | 'babyLoss' | 'abuse' | 'eating' | 'substances';

/** ISO 3166 region codes we have lines for; 'ALL' is anywhere. */
export type SupportRegion = 'US' | 'CA' | 'GB' | 'IE' | 'AU' | 'NZ' | 'ALL';

export type SupportHow = 'call' | 'text' | 'web';

export type SupportLine = {
  category: SupportCategory;
  /** Where it serves. Samaritans covers both the UK and Ireland. */
  region: readonly SupportRegion[];
  name: string;
  how: readonly SupportHow[];
  /** The number to call, as the service writes it. */
  number?: string;
  /** The number to text, when it differs from `number`. */
  textNumber?: string;
  /** A word to send by text, when the service asks for one. */
  keyword?: string;
  /** More numbers to call (e.g. one per nation). */
  alsoCall?: readonly { label: string; number: string }[];
  url: string;
  hours?: string;
  note?: string;
};

export const CATEGORIES: readonly { key: SupportCategory; label: string; blurb: string }[] = [
  { key: 'crisis', label: 'Crisis and suicide', blurb: 'If you’re thinking about ending your life, or are afraid you might, someone will listen now.' },
  { key: 'grief', label: 'Grief and bereavement', blurb: 'For when a death, recent or long ago, is weighing on you.' },
  { key: 'babyLoss', label: 'Pregnancy and baby loss', blurb: 'Miscarriage, stillbirth, and the death of a baby.' },
  { key: 'abuse', label: 'Domestic abuse', blurb: 'If someone close to you is hurting, controlling or frightening you.' },
  { key: 'eating', label: 'Eating disorders', blurb: 'For you, or someone you’re worried about.' },
  { key: 'substances', label: 'Alcohol and drugs', blurb: 'Honest, confidential help, whatever your use looks like.' },
];

export const REGION_NAMES: Record<SupportRegion, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'UK',
  IE: 'Ireland',
  AU: 'Australia',
  NZ: 'New Zealand',
  ALL: 'Anywhere',
};

export const SUPPORT_LINES: readonly SupportLine[] = [
  // ─── Crisis and suicide ───────────────────────────────────────────────
  {
    category: 'crisis',
    region: ['US'],
    name: '988 Suicide & Crisis Lifeline',
    how: ['call', 'text', 'web'],
    number: '988',
    url: 'https://988lifeline.org',
    hours: '24/7',
    note: 'Call or text 988, or chat online. Text and chat also in Spanish.',
  },
  {
    category: 'crisis',
    region: ['US'],
    name: 'Crisis Text Line',
    how: ['text', 'web'],
    textNumber: '741741',
    keyword: 'HOME',
    url: 'https://www.crisistextline.org',
    hours: '24/7',
  },
  {
    category: 'crisis',
    region: ['CA'],
    name: '9-8-8 Suicide Crisis Helpline',
    how: ['call', 'text', 'web'],
    number: '9-8-8',
    url: 'https://988.ca',
    hours: '24/7',
    note: 'Call or text, in English or French.',
  },
  {
    category: 'crisis',
    region: ['GB', 'IE'],
    name: 'Samaritans',
    how: ['call', 'web'],
    number: '116 123',
    url: 'https://www.samaritans.org',
    hours: '24/7',
    note: 'Free from landlines and mobiles across the UK and Ireland, and it won’t show on your bill.',
  },
  {
    category: 'crisis',
    region: ['GB'],
    name: 'Shout',
    how: ['text', 'web'],
    textNumber: '85258',
    url: 'https://giveusashout.org',
    hours: '24/7',
    note: 'Free, confidential mental health text support.',
  },
  {
    category: 'crisis',
    region: ['IE'],
    name: 'Text About It (50808)',
    how: ['text', 'web'],
    textNumber: '50808',
    keyword: 'TALK',
    url: 'https://www.textaboutit.ie',
    hours: '24/7',
    note: 'Free, anonymous text support, run by spunout.',
  },
  {
    category: 'crisis',
    region: ['AU'],
    name: 'Lifeline',
    how: ['call', 'text', 'web'],
    number: '13 11 14',
    textNumber: '0477 13 11 14',
    url: 'https://www.lifeline.org.au',
    hours: '24/7 by phone and chat',
  },
  {
    category: 'crisis',
    region: ['NZ'],
    name: '1737, Need to talk?',
    how: ['call', 'text', 'web'],
    number: '1737',
    url: 'https://1737.org.nz',
    hours: '24/7',
    note: 'Free. Call or text to talk with a trained counsellor.',
  },
  {
    category: 'crisis',
    region: ['ALL'],
    name: 'Find A Helpline',
    how: ['web'],
    url: 'https://findahelpline.com',
    note: 'Free, confidential helplines in more than 175 countries, by phone, text or chat.',
  },

  // ─── Grief and bereavement ────────────────────────────────────────────
  {
    category: 'grief',
    region: ['GB'],
    name: 'Cruse Bereavement Support',
    how: ['call', 'web'],
    number: '0808 808 1677',
    url: 'https://www.cruse.org.uk',
    hours: 'Mon, Wed, Thu, Fri 9.30am–5pm; Tue 1pm–8pm',
    note: 'Free from UK landlines and mobiles.',
  },
  {
    category: 'grief',
    region: ['IE'],
    name: 'Irish Hospice Foundation Bereavement Support Line',
    how: ['call', 'web'],
    number: '1800 80 70 77',
    url: 'https://hospicefoundation.ie/our-supports-services/bereavement-loss-hub/bereavement-support-line/',
    hours: 'Mon–Fri 10am–1pm',
    note: 'Freephone. A confidential place to talk about a death.',
  },
  {
    category: 'grief',
    region: ['US'],
    name: 'Your local hospice',
    how: ['web'],
    url: 'https://allianceforcareathome.org/find-a-provider/',
    note:
      'Many hospices run grief groups and counselling that are open to the wider community, not only families they cared for. Find one near you and call to ask.',
  },

  // ─── Pregnancy and baby loss ──────────────────────────────────────────
  {
    category: 'babyLoss',
    region: ['GB'],
    name: 'Miscarriage UK (formerly the Miscarriage Association)',
    how: ['call', 'web'],
    number: '0303 003 6464',
    url: 'https://www.miscarriageuk.org',
    hours: 'Mon, Wed, Fri 9am–8pm; Tue, Thu 9am–4pm',
  },
  {
    category: 'babyLoss',
    region: ['GB'],
    name: 'Sands',
    how: ['call', 'web'],
    number: '0808 164 3332',
    url: 'https://www.sands.org.uk',
    hours: 'Mon–Fri 10am–3pm; Tue–Thu also 6pm–9pm',
    note: 'Stillbirth and neonatal death. Free to call. Or email helpline@sands.org.uk.',
  },
  {
    category: 'babyLoss',
    region: ['US'],
    name: 'Share Pregnancy & Infant Loss Support',
    how: ['call', 'web'],
    number: '1-800-821-6819',
    url: 'https://nationalshare.org',
    note: 'For anyone who has experienced the death of a baby.',
  },

  // ─── Domestic abuse ───────────────────────────────────────────────────
  {
    category: 'abuse',
    region: ['GB'],
    name: 'National Domestic Abuse Helpline (Refuge)',
    how: ['call', 'web'],
    number: '0808 2000 247',
    url: 'https://www.nationaldahelpline.org.uk',
    hours: '24/7',
    note: 'Freephone and confidential. BSL support Mon–Fri 10am–6pm.',
  },
  {
    category: 'abuse',
    region: ['US'],
    name: 'National Domestic Violence Hotline',
    how: ['call', 'text', 'web'],
    number: '1-800-799-7233',
    textNumber: '88788',
    keyword: 'START',
    url: 'https://www.thehotline.org',
    hours: '24/7',
    note: 'Free and confidential. Message and data rates may apply to texts.',
  },
  {
    category: 'abuse',
    region: ['CA'],
    name: 'ShelterSafe',
    how: ['web'],
    url: 'https://sheltersafe.ca',
    note: 'Support is provincial and territorial in Canada. ShelterSafe, from Women’s Shelters Canada, finds a shelter or crisis line near you.',
  },
  {
    category: 'abuse',
    region: ['AU'],
    name: '1800RESPECT',
    how: ['call', 'text', 'web'],
    number: '1800 737 732',
    textNumber: '0458 737 732',
    url: 'https://www.1800respect.org.au',
    hours: '24/7',
    note: 'Domestic, family and sexual violence. Free.',
  },

  // ─── Eating disorders ─────────────────────────────────────────────────
  {
    category: 'eating',
    region: ['GB'],
    name: 'Beat',
    how: ['call', 'web'],
    number: '0808 801 0677',
    alsoCall: [
      { label: 'Scotland', number: '0808 801 0432' },
      { label: 'Wales', number: '0808 801 0433' },
      { label: 'Northern Ireland', number: '0808 801 0434' },
    ],
    url: 'https://www.beateatingdisorders.org.uk',
    hours: 'Mon–Fri 3pm–8pm',
    note: 'The main number is for England.',
  },
  {
    category: 'eating',
    region: ['US'],
    name: 'ANAD Eating Disorders Helpline',
    how: ['call', 'web'],
    number: '1-888-375-7767',
    url: 'https://anad.org/get-support/eating-disorders-helpline/',
    hours: 'Mon–Fri 9am–9pm Central',
    note: 'Free peer support and referrals. Not a crisis line: in a crisis, call or text 988. (NEDA’s helpline closed in 2023.)',
  },

  // ─── Alcohol and drugs ────────────────────────────────────────────────
  {
    category: 'substances',
    region: ['US'],
    name: 'SAMHSA National Helpline',
    how: ['call', 'web'],
    number: '1-800-662-4357',
    url: 'https://www.samhsa.gov/find-help/helplines/national-helpline',
    hours: '24/7',
    note: 'Free, confidential treatment referral and information, in English and Spanish. Or text your ZIP code to 435748 to find help near you.',
  },
  {
    category: 'substances',
    region: ['GB'],
    name: 'FRANK',
    how: ['call', 'text', 'web'],
    number: '0300 123 6600',
    textNumber: '82111',
    url: 'https://www.talktofrank.com',
    hours: '24 hours a day',
    note: 'Honest, confidential information about drugs.',
  },
  {
    category: 'substances',
    region: ['GB'],
    name: 'Alcoholics Anonymous (Great Britain)',
    how: ['call', 'web'],
    number: '0800 917 7650',
    url: 'https://www.alcoholics-anonymous.org.uk',
    note: 'Free national helpline, and meetings across Great Britain.',
  },
  {
    category: 'substances',
    region: ['ALL'],
    name: 'Alcoholics Anonymous',
    how: ['web'],
    url: 'https://www.aa.org/find-aa',
    note: 'Find A.A. near you, online meetings, and the Meeting Guide app.',
  },
  {
    category: 'substances',
    region: ['ALL'],
    name: 'SMART Recovery',
    how: ['web'],
    url: 'https://smartrecovery.org',
    note: 'Free, science-based mutual support meetings, online and in person. In the UK: smartrecovery.org.uk.',
  },
];

/** Emergency numbers named in the page's opening words. */
export const EMERGENCY_NUMBERS = ['911', '999', '112', '000'] as const;

const KNOWN = new Set<SupportRegion>(['US', 'CA', 'GB', 'IE', 'AU', 'NZ']);

/**
 * The region from a BCP 47 locale such as 'en-GB' or 'fr_CA', when we have
 * lines for it. 'UK' is accepted as GB.
 */
export function regionFromLocale(locale: string | null | undefined): SupportRegion | null {
  if (!locale) return null;
  const parts = locale.replace(/_/g, '-').split('-').slice(1);
  for (const part of parts) {
    const code = part.toUpperCase();
    if (code.length !== 2) continue;
    const region = (code === 'UK' ? 'GB' : code) as SupportRegion;
    return KNOWN.has(region) ? region : null;
  }
  return null;
}

// Without a known region, the US then UK lines lead.
const DEFAULT_ORDER: readonly SupportRegion[] = ['US', 'GB', 'IE', 'CA', 'AU', 'NZ'];

function regionRank(line: SupportLine, region: SupportRegion | null): number {
  if (region && line.region.includes(region)) return 0;
  if (line.region.includes('ALL')) return 100; // "everywhere else" goes last
  const ranks = line.region.map((r) => DEFAULT_ORDER.indexOf(r)).filter((i) => i >= 0);
  return 1 + (ranks.length ? Math.min(...ranks) : DEFAULT_ORDER.length);
}

/** Lines grouped by category, the given region's lines first in each. */
export function supportSections(region: SupportRegion | null, lines: readonly SupportLine[] = SUPPORT_LINES) {
  return CATEGORIES.map((category) => ({
    ...category,
    lines: lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.category === category.key)
      .sort((a, b) => regionRank(a.line, region) - regionRank(b.line, region) || a.index - b.index)
      .map(({ line }) => line),
  })).filter((section) => section.lines.length > 0);
}

/** The digits to dial for a number written with spaces, dashes or brackets. */
export function dialDigits(number: string): string {
  return number.replace(/[^\d+]/g, '');
}

export function telUrl(number: string): string {
  return `tel:${dialDigits(number)}`;
}

/**
 * An sms: link, prefilled with a keyword when there is one. iOS reads the
 * body after '&', Android after '?'.
 */
export function smsUrl(number: string, keyword?: string, platform: 'ios' | 'android' | 'web' | string = 'ios'): string {
  const base = `sms:${dialDigits(number)}`;
  if (!keyword) return base;
  return `${base}${platform === 'ios' ? '&' : '?'}body=${encodeURIComponent(keyword)}`;
}

/** The number to text: its own text number, or the call number. */
export function textTarget(line: SupportLine): string | undefined {
  return line.how.includes('text') ? line.textNumber ?? line.number : undefined;
}

/** Plain words for how to text, e.g. "Text START to 88788". */
export function textWords(line: SupportLine): string | null {
  const target = textTarget(line);
  if (!target) return null;
  return line.keyword ? `Text ${line.keyword} to ${target}` : `Text ${target}`;
}
