// Where each address on saltandsovereignty.com is answered. A pure function,
// so it can be tested without Cloudflare (tests/site-routing.test.js).
//
// The site is two things on one domain: the brand's own static pages (home,
// blog, submit, help, privacy and terms, admin) served from dist/, and the
// Expo web app (EAS Hosting, APP_ORIGIN) for everything you use: Today, Altar,
// Practice (Grimoire, Rituals, Craft), Coven and More. The website's old
// copies of those pages are no longer shipped; their addresses lead to the
// same screen in the app, by a permanent redirect where the address changed.
import { APP_ROUTES } from "./app-routes.js";

/** The old website sections the app now replaces (left out of dist/ by scripts/cloudflare-build.mjs). */
export const REPLACED_SECTIONS = ["today", "altar", "practice", "rituals", "covens", "grimoire", "library", "divination", "sigil", "more", "reminders", "account"];

/** Parts of those sections that stay on the website, with no screen in the app (the coven guidelines). */
export const KEPT_IN_REPLACED = ["covens/guidelines", "covens/covens.css"];

/**
 * Hand-written journal posts that a Living Library post replaced
 * (scripts/build-library-blog.mjs writes /blog/<type>/<slug>/ from the
 * Library). Their old addresses, with or without ".html", redirect there.
 */
export const BLOG_REDIRECTS = {
  "/blog/herbs/basil-history": "/blog/herbs/basil/",
  "/blog/herbs/bay-history": "/blog/herbs/bay/",
  "/blog/herbs/cedar-history": "/blog/herbs/cedar/",
  "/blog/herbs/chamomile-history": "/blog/herbs/chamomile/",
  "/blog/herbs/cinnamon-history": "/blog/herbs/cinnamon/",
  "/blog/herbs/clove-history": "/blog/herbs/clove/",
  "/blog/herbs/dandelion-history": "/blog/herbs/dandelion/",
  "/blog/herbs/frankincense-history": "/blog/herbs/frankincense/",
  "/blog/herbs/lavender-history": "/blog/herbs/lavender/",
  "/blog/herbs/mugwort-history": "/blog/herbs/mugwort/",
  "/blog/herbs/nettle-history": "/blog/herbs/nettle/",
  "/blog/herbs/patchouli-history": "/blog/herbs/patchouli/",
  "/blog/herbs/peppermint-history": "/blog/herbs/peppermint/",
  "/blog/herbs/rose-history": "/blog/herbs/rose/",
  "/blog/herbs/rosemary-history": "/blog/herbs/rosemary/",
  "/blog/herbs/rue-history": "/blog/herbs/rue/",
  "/blog/herbs/sage-history": "/blog/herbs/sage/",
  "/blog/herbs/thyme-history": "/blog/herbs/thyme/",
  "/blog/deities/hekate-traditional": "/blog/deities/hekate/",
};

/** "/blog/herbs/sage-history.html" → "/blog/herbs/sage-history". */
const blogKey = (pathname) => pathname.replace(/\/index\.html$/, "").replace(/\.html$/, "").replace(/\/+$/, "");

/** Paths always answered by the static site. */
const STATIC_PREFIXES = ["/blog/", "/submit/", "/help/", "/admin/", "/css/", "/js/", "/covens/guidelines/"];
const STATIC_EXACT = new Set(["/", "/index.html", "/privacy.html", "/submission-terms.html", "/delete-account.html", "/blog", "/submit", "/help", "/admin", "/covens/guidelines", "/covens/covens.css"]);

/** Each old section's first page in the app: where an old address with no closer match goes. */
export const SECTION_TOP = {
  today: "/today",
  altar: "/altar",
  practice: "/rituals/craft",
  rituals: "/rituals",
  covens: "/coven",
  grimoire: "/grimoire",
  library: "/grimoire/library",
  divination: "/rituals/divination",
  sigil: "/rituals/sigil",
  more: "/more",
  reminders: "/more/settings/notifications",
  account: "/more/account",
};

/**
 * Old pages whose app screen has a different address. Each lists the app
 * addresses to try in order: ":name" takes the old page's ?name= value (and
 * drops it from the query); the first whose values are all there wins. With
 * none matching, the address is treated like any other in its section.
 */
const journals = (base) => ({
  [`${base}/journal`]: [`${base}/:j`, base],
  [`${base}/edit`]: [`${base}/:j/edit`, base],
  [`${base}/entry`]: [`${base}/:j/:id`, `${base}/:j`, base],
});
const craft = "/rituals/craft";
export const OLD_PAGES = {
  "/today/holy": ["/today/holy/:ref", "/today"],
  "/covens/coven": ["/coven/c/:c", "/coven"],
  "/covens/join": ["/coven/join/:code", "/coven/invitation/:invitation", "/coven"],
  "/divination/reading": ["/rituals/divination/:id", "/rituals/divination"],
  "/divination/runes": ["/rituals/divination"],
  "/grimoire/community-grimoire.html": ["/more/community"],
  "/grimoire/dreams/dream": ["/grimoire/dreams/:id", "/grimoire/dreams"],
  ...journals("/grimoire/journals"),
  ...journals("/rituals/journals"),
  "/library/entry": ["/grimoire/library/:entity", "/grimoire/library"],
  "/rituals/plan": ["/rituals/plan/:id", "/rituals/planner"],
  "/rituals/ingredient": ["/rituals/ingredient/:ref", "/rituals"],
  "/rituals/cycle": ["/rituals/cycle/:view"],
  "/practice/eclectic/correspondences/entry": [`${craft}/eclectic/correspondences/:id`, `${craft}/eclectic/correspondences`],
  "/practice/folk/lore/entry": [`${craft}/folk/lore/:id`, `${craft}/folk/lore`],
  "/practice/green/plant": [`${craft}/green/plant/:id`, `${craft}/green`],
  "/practice/green/plant/edit": [`${craft}/green/plant/:id`, `${craft}/green/plant/new`],
  "/practice/hedge/ancestors/person": [`${craft}/hedge/ancestors/:id`, `${craft}/hedge/ancestors`],
  "/practice/hedge/dreams/dream": [`${craft}/hedge/dreams/:id`, `${craft}/hedge/dreams`],
  "/practice/hedge/readings/reading": [`${craft}/hedge/readings/:id`, `${craft}/hedge/readings`],
  "/practice/kitchen/pantry/item": [`${craft}/kitchen/pantry/:key`, `${craft}/kitchen/pantry`],
  "/account/reset-password": ["/auth-callback"],
};

/** Where an old section's pages now live: /practice/x → /rituals/craft/x, /covens/x → /coven/x. */
const SECTION_MOVED = { practice: craft, covens: "/coven", library: "/grimoire/library", divination: "/rituals/divination", sigil: "/rituals/sigil" };

const ROUTES = APP_ROUTES.map((route) => route.split("/").filter(Boolean));

/** Whether a path is one of the app's screens. */
export function isAppRoute(pathname) {
  const parts = String(pathname).split("/").filter(Boolean);
  return ROUTES.some((route) => {
    for (let i = 0; i < route.length; i += 1) {
      const part = route[i];
      if (part.startsWith("[...")) return parts.length > i;
      if (i >= parts.length) return false;
      if (!part.startsWith("[") && part !== parts[i]) return false;
    }
    return route.length === parts.length;
  });
}

/** "/practice/cosmic/chart/" and "/practice/cosmic/chart/index.html" → "/practice/cosmic/chart". */
function pageKey(pathname) {
  return pathname.replace(/\/index\.html$/, "/").replace(/\/+$/, "") || "/";
}

function fill(template, params) {
  const used = [];
  let missing = false;
  const path = template.replace(/:([a-z]+)/gi, (_, name) => {
    const value = params.get(name);
    if (!value) missing = true;
    used.push(name);
    return encodeURIComponent(value || "");
  });
  if (missing) return null;
  const rest = new URLSearchParams(params);
  for (const name of used) rest.delete(name);
  const query = rest.toString();
  return `${path}${query ? `?${query}` : ""}`;
}

/**
 * How to answer a request for this path:
 *   { action: "static" }            the static site (dist/)
 *   { action: "static-or-app" }     the static file if there is one, otherwise the app
 *   { action: "app" }               the app, as asked
 *   { action: "redirect", location } a permanent redirect (path and query)
 */
export function decideRoute(pathname, search = "") {
  const path = pathname || "/";
  const replaced = path.startsWith("/blog/") && BLOG_REDIRECTS[blogKey(path)];
  if (replaced) return { action: "redirect", location: `${replaced}${search && search !== "?" ? (search.startsWith("?") ? search : `?${search}`) : ""}` };
  if (STATIC_EXACT.has(path) || STATIC_PREFIXES.some((prefix) => path.startsWith(prefix))) return { action: "static" };
  const section = path.split("/")[1];
  if (!REPLACED_SECTIONS.includes(section)) {
    if (section === "_expo" || isAppRoute(path)) return { action: "app" };
    return { action: "static-or-app" };
  }

  const key = pageKey(path);
  const params = new URLSearchParams(search);
  const query = params.toString();
  const withQuery = (target) => `${target}${query ? `?${query}` : ""}`;
  for (const template of OLD_PAGES[key] || []) {
    const location = fill(template, params);
    if (location) return { action: "redirect", location };
  }
  const moved = SECTION_MOVED[section];
  const target = moved ? `${moved}${key.slice(section.length + 1)}` : key;
  if (isAppRoute(target)) return target === key ? { action: "app" } : { action: "redirect", location: withQuery(target) };
  return { action: "redirect", location: withQuery(SECTION_TOP[section]) };
}
