// Website asset paths, without React Native, so they can be unit tested.

/** Where the website is served; saved paths are relative to it. */
export const WEBSITE_ORIGIN = 'https://saltandsovereignty.com';

/**
 * Turn a saved image path into a site-relative key like
 * "assets/altar/objects/tools/key/key.png". The website writes object images
 * relative to /altar/ ("../assets/...") and backgrounds from the root
 * ("/assets/..."). Returns null for anything that is not a website path
 * (for example a Supabase storage URL for a custom image).
 */
export function websiteAssetKey(path: string): string | null {
  let p = path.trim();
  if (!p) return null;
  if (p.startsWith(WEBSITE_ORIGIN)) p = p.slice(WEBSITE_ORIGIN.length);
  else if (/^https?:\/\/(www\.)?saltandsovereignty\.com/.test(p)) p = p.replace(/^https?:\/\/[^/]+/, '');
  else if (/^[a-z]+:/i.test(p)) return null;
  p = p.split(/[?#]/)[0];
  while (p.startsWith('../')) p = p.slice(3);
  p = p.replace(/^\.?\//, '');
  return p.startsWith('assets/') ? decodeURI(p) : null;
}

/** Full URL of a website asset (used when the app has no bundled copy). */
export function websiteAssetUrl(key: string): string {
  return `${WEBSITE_ORIGIN}/${encodeURI(key)}`;
}
