// The Salt & Sovereignty website's own pages, linked from the menu (the side
// bar on a computer, the More tab on a phone). The web app is served on the
// website's own domain (the site's Worker passes it through), so there they
// are plain paths on this site; on a phone, or the app's other web address,
// they are full https://saltandsovereignty.com addresses.

export const SITE_ORIGIN = 'https://saltandsovereignty.com';

/** Whether a page origin is the website's own domain (with or without www). */
export function isSiteOrigin(origin: string | null | undefined): boolean {
  return typeof origin === 'string' && /^https:\/\/(www\.)?saltandsovereignty\.com$/.test(origin);
}

/** The origin for links to the website: empty (same-site paths) when already on it. */
export function siteLinkOrigin(currentOrigin: string | null | undefined): string {
  return isSiteOrigin(currentOrigin) ? '' : SITE_ORIGIN;
}

/** This page's origin on the web; null on a phone. */
function currentOrigin(): string | null {
  try {
    return typeof window !== 'undefined' && window.location ? window.location.origin : null;
  } catch {
    return null;
  }
}

/** Whether the app is running on the website's own domain. */
export const ON_SITE = isSiteOrigin(currentOrigin());
const LINK_ORIGIN = siteLinkOrigin(currentOrigin());

/** A page of the website: its full address (or, with an empty origin, its path on this site). */
export function sitePage(path: string, origin: string = LINK_ORIGIN): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${origin.replace(/\/+$/, '')}${clean}`;
}

export type SiteLinkIcon = 'about' | 'podcast' | 'books' | 'blog' | 'letters' | 'offer' | 'help';
export type SiteLink = { key: string; label: string; url: string; icon: SiteLinkIcon };

export const SITE_SECTION_TITLE = 'Salt & Sovereignty';

// The same pages, in the same order, as the website's own menu (js/site-nav.js
// SITE_LINKS): About, Podcast, Books, Blog and Contact are parts of its home page.
export const SITE_LINKS: SiteLink[] = [
  { key: 'about', label: 'About', url: sitePage('/#about'), icon: 'about' },
  { key: 'podcast', label: 'Podcast', url: sitePage('/#podcast'), icon: 'podcast' },
  { key: 'books', label: 'Books', url: sitePage('/#books'), icon: 'books' },
  { key: 'blog', label: 'Blog', url: sitePage('/#blog'), icon: 'blog' },
  { key: 'contact', label: 'Contact', url: sitePage('/#contact'), icon: 'letters' },
  { key: 'submit', label: 'Submit', url: sitePage('/submit/'), icon: 'offer' },
  { key: 'help', label: 'Help', url: sitePage('/help/'), icon: 'help' },
];

/** The small print at the very bottom of the menu. */
export const SITE_SMALL_LINKS: { key: string; label: string; url: string }[] = [
  { key: 'privacy', label: 'Privacy', url: sitePage('/privacy.html') },
  { key: 'terms', label: 'Terms', url: sitePage('/submission-terms.html') },
];

export const PRIVACY_URL = SITE_SMALL_LINKS[0].url;
export const TERMS_URL = SITE_SMALL_LINKS[1].url;
