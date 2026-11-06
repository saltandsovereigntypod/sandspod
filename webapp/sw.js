// Offline support for the web app (saltandsovereignty.com, where the site's
// Worker serves it beside the website's own pages, and its EAS Hosting
// address).
//
// On saltandsovereignty.com the website's own pages (home, blog, help, submit,
// privacy and terms, admin) share this origin: they are left to the network,
// never stored as the app's page, and the app's saved page is fetched from an
// app address (/today) rather than / (the website's home there).
//
// Pages: network first, so a new deploy shows as soon as there is a
// connection; offline, the last copy of the app shell is served instead.
// Built files under /_expo/ and /assets/ have the content hash in their
// names, so they are served from the cache once stored. The app sends the
// list of files it uses (see src/lib/offline/serviceWorker.web.ts) so they
// are stored ahead of time, including altar artwork not yet opened.
//
// Data is not cached here: Supabase calls go to another origin, and the app
// keeps its own offline copy of altars, pages and rituals.

const VERSION = 2;
const SHELL = `shell-v${VERSION}`;
const FILES = `files-v${VERSION}`;
// The app's page, the same single-page app at every address; stored under this key.
const APP_PAGE = '/today';
const SHELL_URLS = ['/manifest.json', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

const ON_SITE = /(^|\.)saltandsovereignty\.com$/.test(self.location.hostname);
const WEBSITE_EXACT = ['/', '/index.html', '/privacy.html', '/submission-terms.html', '/delete-account.html', '/sitemap.xml', '/robots.txt'];
const WEBSITE_PREFIXES = ['/blog/', '/submit/', '/help/', '/admin/', '/css/', '/js/', '/covens/guidelines/'];

/** A page or file of the website itself (worker/routing.js in the website), not the app. */
function isWebsitePath(pathname) {
  return ON_SITE && (WEBSITE_EXACT.includes(pathname) || WEBSITE_PREFIXES.some((prefix) => pathname.startsWith(prefix)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => Promise.all([cache.addAll(SHELL_URLS), fetchPage(new Request(APP_PAGE)).catch(() => undefined)]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== SHELL && key !== FILES).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Built files carry a content hash in their names (/_expo/static/js/web/index-<hash>.js,
// /assets/.../name.<hash>.png). The website's own unhashed /assets/ files are left to the network.
function isBuiltFile(url) {
  return url.pathname.startsWith('/_expo/') || (url.pathname.startsWith('/assets/') && /\.[0-9a-f]{32}\.[a-z0-9]+$/i.test(url.pathname));
}

// On a weak signal, wait this long for the network before opening the saved
// copy (the fresh page still lands in the cache when it arrives).
const NETWORK_WAIT_MS = 4000;

async function fromNetworkThenShell(request) {
  const network = fetchPage(request);
  const shell = await caches.match(APP_PAGE, { cacheName: SHELL });
  if (!shell) return network;
  const timeout = new Promise((resolve) => setTimeout(() => resolve(shell), NETWORK_WAIT_MS));
  return Promise.race([network.catch(() => shell), timeout]);
}

async function fetchPage(request) {
  try {
    const response = await fetch(request);
    // Every page is the same single-page app. GitHub Pages serves paths other
    // than / from its 404.html copy with a 404 status, so keep either as the
    // shell, stored as a plain 200.
    const isHtml = (response.headers.get('Content-Type') || '').includes('text/html');
    if (isHtml && (response.ok || response.status === 404)) {
      const body = await response.clone().blob();
      const cache = await caches.open(SHELL);
      await cache.put(APP_PAGE, new Response(body, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
    }
    return response;
  } catch (error) {
    const shell = await caches.match(APP_PAGE, { cacheName: SHELL });
    if (shell) return shell;
    throw error;
  }
}

async function fromCacheThenNetwork(request) {
  const cached = await caches.match(request, { cacheName: FILES });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(FILES);
    await cache.put(request, response.clone());
  }
  return response;
}

async function fromCacheAndRefresh(request) {
  const cache = await caches.open(SHELL);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await refresh) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isWebsitePath(url.pathname)) return;
  if (request.mode === 'navigate') event.respondWith(fromNetworkThenShell(request));
  else if (isBuiltFile(url)) event.respondWith(fromCacheThenNetwork(request));
  else if (SHELL_URLS.includes(url.pathname)) event.respondWith(fromCacheAndRefresh(request));
});

// { type: 'precache', urls: [...] } from the app: store any built files not
// yet cached, and drop scripts from earlier deploys that the app no longer
// loads.
async function precache(urls) {
  const cache = await caches.open(FILES);
  const wanted = new Set();
  for (const raw of urls) {
    const url = new URL(raw, self.location.origin);
    if (url.origin === self.location.origin && isBuiltFile(url)) wanted.add(url.href);
  }
  for (const request of await cache.keys()) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/_expo/static/js/') && !wanted.has(url.href)) await cache.delete(request);
  }
  for (const href of wanted) {
    if (await cache.match(href)) continue;
    try {
      const response = await fetch(href);
      if (response.ok) await cache.put(href, response);
    } catch {
      // Offline or the file moved; it is fetched again next time it is used.
    }
  }
}

self.addEventListener('message', (event) => {
  const data = event.data;
  if (data && data.type === 'precache' && Array.isArray(data.urls)) event.waitUntil(precache(data.urls));
});
