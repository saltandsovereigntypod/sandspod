// The Salt & Sovereignty website's own pages, linked from the menu (the side
// bar on a computer, the More tab on a phone). Kept in one place so they can
// become relative paths once the web app lives on the same domain.

export const SITE_ORIGIN = 'https://saltandsovereignty.com';

/** A page of the website: its full address (or, with an empty origin, its path on this site). */
export function sitePage(path: string, origin: string = SITE_ORIGIN): string {
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
