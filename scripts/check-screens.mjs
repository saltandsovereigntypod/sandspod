// Screen checks for the website and the app's web build at phone width (390px).
// Visits the key pages and fails on page errors, sideways scroll, text cut off
// (wider than its box, or poking out of a box that hides its overflow) and
// internal links to pages that don't exist.
//
//   npm run check:screens                     website and app (exports the app's web build first, ~1 min)
//   npm run check:screens -- --site           website only
//   npm run check:screens -- --app            app only
//   npm run check:screens -- --app-dist=DIR   use an app web export already made (npx expo export --platform web)
//   SCREENS_OUT=DIR                           where the export and screenshots go (default: the system temp folder)
//
// Needs Playwright with Chromium (require('playwright')). Not part of `npm test`.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const only = args.includes('--site') ? 'site' : args.includes('--app') ? 'app' : null;
const givenDist = args.find((a) => a.startsWith('--app-dist='))?.slice('--app-dist='.length);
const out = process.env.SCREENS_OUT || join(tmpdir(), 'sas-check-screens');
mkdirSync(out, { recursive: true });

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = createRequire(join(root, 'app/package.json'))('playwright'));
}

// ── What to visit ────────────────────────────────────────────────────────
const SITE_PAGES = [
  '/',
  '/today/',
  '/practice/',
  '/practice/cosmic/',
  '/practice/green/',
  '/rituals/',
  '/grimoire/',
  '/rituals/journeys/',
  '/rituals/journeys/?id=path-wicca',
  '/practice/cosmic/course/?l=astro-basics-what-it-is',
  '/library/',
  '/library/entry/?entity=traditional%2Fdeity%2Fhekate',
  '/covens/',
  '/covens/coven/?c=example',
  { path: '/practice/cosmic/chart/', deviceChart: true },
];
const APP_ROUTES = [
  '/today',
  '/rituals',
  '/rituals/craft',
  '/rituals/craft/cosmic',
  '/grimoire',
  '/rituals/journeys',
  '/rituals/journeys/path-wicca',
  '/rituals/craft/cosmic/lesson?l=astro-basics-what-it-is',
  '/more/library/traditional%3Adeity%3Ahekate',
  '/coven',
];

// ── Static servers ───────────────────────────────────────────────────────
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.wasm': 'application/wasm' };

/** The file a static host (Cloudflare Pages) would serve for a path, or null for a 404. */
function resolveFile(base, pathname) {
  let p;
  try {
    p = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  } catch {
    return null;
  }
  const full = join(base, p);
  if (!full.startsWith(base)) return null;
  const isFile = (f) => existsSync(f) && statSync(f).isFile();
  if (isFile(full)) return full;
  if (isFile(join(full, 'index.html'))) return join(full, 'index.html');
  if (!extname(full) && isFile(`${full}.html`)) return `${full}.html`;
  return null;
}

function serve(base, spa) {
  const server = createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://x');
    const file = resolveFile(base, pathname) ?? (spa && !extname(pathname) ? join(base, 'index.html') : null);
    if (!file) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, origin: `http://127.0.0.1:${server.address().port}` })));
}

// ── In-page checks ───────────────────────────────────────────────────────
function inspect() {
  const problems = [];
  const doc = document.documentElement;
  if (doc.scrollWidth > window.innerWidth + 1) problems.push(`sideways scroll: page is ${doc.scrollWidth}px wide`);
  const describe = (el) => {
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    const cls = typeof el.className === 'string' && el.className ? `.${el.className.split(/\s+/)[0]}` : '';
    return `<${el.tagName.toLowerCase()}${cls}> "${text}"`;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const meant = (cs) => cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none');
  const seen = new Set();
  const leaves = [...document.body.querySelectorAll('*')].filter(
    (el) => !['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'svg', 'SVG', 'OPTION', 'CANVAS'].includes(el.tagName) && !el.closest('svg,[aria-hidden="true"]') && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
  );
  for (const el of leaves.slice(0, 4000)) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    if (meant(cs) || cs.visibility === 'hidden') continue;
    if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' && cs.display !== 'inline') {
      const key = `wide ${describe(el)}`;
      if (!seen.has(key)) seen.add(key), problems.push(`text wider than its box: ${describe(el)} (${el.scrollWidth} > ${el.clientWidth})`);
      continue;
    }
    const r = el.getBoundingClientRect();
    for (let a = el.parentElement, depth = 0; a && a !== document.body && depth < 12; a = a.parentElement, depth++) {
      const acs = getComputedStyle(a);
      if (acs.overflowX === 'visible' && acs.overflowY === 'visible') continue;
      if (meant(acs) || acs.overflowX === 'auto' || acs.overflowX === 'scroll' || acs.overflowY === 'auto' || acs.overflowY === 'scroll') break;
      const ar = a.getBoundingClientRect();
      if (r.right > ar.right + 2 || r.left < ar.left - 2 || (acs.overflowY !== 'visible' && r.bottom > ar.bottom + 2 && r.top < ar.bottom)) {
        const key = `clip ${describe(el)}`;
        if (!seen.has(key)) seen.add(key), problems.push(`text cut off by a box that hides overflow: ${describe(el)}`);
      }
      break;
    }
  }
  const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  return { problems, links };
}

/** The website's device-only chart: saved through its own store, as someone would. */
async function seedDeviceChart(page, origin) {
  await page.goto(`${origin}/practice/cosmic/chart-edit/`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.SaltAstroStore, null, { timeout: 10_000 });
  return page.evaluate(async () => {
    const s = window.SaltAstroStore;
    await s.load(null);
    const id = `check-${Date.now()}`;
    await s.save({ id, name: 'Me', relation: 'me', input: { date: '1990-06-15', time: '14:30', utcOffsetMinutes: 60, latitude: 51.507, longitude: -0.128, placeLabel: 'London, England' }, updatedAt: new Date().toISOString() });
    return id;
  });
}

async function checkPages({ browser, origin, label, pages, spa, base }) {
  const failures = [];
  const links = new Map();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  // The app's welcome tour has been seen (it would cover every screen).
  if (spa) {
    const tourKey = /TOUR_SEEN_KEY = '([^']+)'/.exec(readFileSync(join(root, 'app/src/lib/welcomeTour.ts'), 'utf8'))[1];
    await context.addInitScript((k) => localStorage.setItem(k, '2026-01-01T00:00:00.000Z'), tourKey);
  }
  // Keep the run local and quick: nothing from other hosts but fonts and script CDNs (no accounts).
  // The app's on-demand data (journey texts, cities, course programs) comes from this checkout's js/core.
  await context.route(/^https?:\/\//, (route) => {
    const u = route.request().url();
    const core = /^https:\/\/saltandsovereignty\.com(\/js\/core\/[^?#]+)/.exec(u);
    if (core) {
      const file = resolveFile(root, core[1]);
      return file
        ? route.fulfill({ status: 200, body: readFileSync(file), headers: { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'access-control-allow-origin': '*' } })
        : route.fulfill({ status: 404, body: '' });
    }
    if (u.startsWith(origin) || /^https:\/\/(fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com)\//.test(u)) return route.continue();
    return route.abort();
  });
  for (const entry of pages) {
    const { path, deviceChart } = typeof entry === 'string' ? { path: entry } : entry;
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
    let target = path;
    try {
      if (deviceChart) target = `${path}?id=${encodeURIComponent(await seedDeviceChart(page, origin))}`;
      const res = await page.goto(origin + target, { waitUntil: 'load', timeout: 30_000 });
      if (res && res.status() >= 400) errors.push(`HTTP ${res.status()}`);
      await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
      await page.waitForTimeout(spa ? 1200 : 400);
      const { problems, links: hrefs } = await page.evaluate(inspect);
      if (spa && (await page.getByText('This link isn’t in the app yet').count())) problems.push('the app has no screen for this route');
      for (const h of hrefs) {
        if (!h || /^(https?:|mailto:|tel:|javascript:|#|data:)/.test(h) || h.startsWith('//')) {
          if (h && h.startsWith(origin)) links.set(new URL(h).pathname, target);
          continue;
        }
        const u = new URL(h, origin + target);
        if (!links.has(u.pathname)) links.set(u.pathname, target);
      }
      const all = [...errors.map((e) => `page error: ${e}`), ...problems];
      if (all.length) failures.push({ where: `${label} ${target}`, problems: all });
      await page.screenshot({ path: join(out, `${label}${target.replace(/[^a-z0-9]+/gi, '_')}.png`) });
    } catch (e) {
      failures.push({ where: `${label} ${target}`, problems: [`didn't load: ${e.message.split('\n')[0]}`] });
    }
    await page.close();
  }
  // Internal links: the static site must have a page for each; the app must have a screen.
  const broken = [];
  if (!spa) {
    for (const [p, from] of links) if (!resolveFile(base, p)) broken.push(`${p} (linked from ${from})`);
  } else {
    const page = await context.newPage();
    for (const [p, from] of [...links].slice(0, 60)) {
      if (/\.[a-z0-9]+$/i.test(p)) continue;
      await page.goto(origin + p, { waitUntil: 'load' }).catch(() => {});
      await page.waitForTimeout(500);
      if (await page.getByText('This link isn’t in the app yet').count()) broken.push(`${p} (linked from ${from})`);
    }
    await page.close();
  }
  if (broken.length) failures.push({ where: `${label} links`, problems: broken.map((b) => `broken internal link: ${b}`) });
  await context.close();
  return { failures, linkCount: links.size };
}

function appDist() {
  if (givenDist) return givenDist;
  const dist = join(out, 'app-web');
  rmSync(dist, { recursive: true, force: true });
  console.log('Exporting the app for the web…');
  execFileSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', dist], { cwd: join(root, 'app'), stdio: ['ignore', 'ignore', 'inherit'] });
  return dist;
}

const started = Date.now();
const browser = await chromium.launch();
const failures = [];
try {
  if (only !== 'app') {
    const { server, origin } = await serve(root, false);
    const r = await checkPages({ browser, origin, label: 'site', pages: SITE_PAGES, spa: false, base: root });
    console.log(`Website: ${SITE_PAGES.length} pages, ${r.linkCount} internal links, ${r.failures.length ? 'problems below' : 'fine'}.`);
    failures.push(...r.failures);
    server.close();
  }
  if (only !== 'site') {
    const dist = appDist();
    const { server, origin } = await serve(dist, true);
    const r = await checkPages({ browser, origin, label: 'app', pages: APP_ROUTES, spa: true, base: dist });
    console.log(`App: ${APP_ROUTES.length} screens, ${r.linkCount} internal links, ${r.failures.length ? 'problems below' : 'fine'}.`);
    failures.push(...r.failures);
    server.close();
    if (!givenDist) rmSync(dist, { recursive: true, force: true });
  }
} finally {
  await browser.close();
}
for (const f of failures) {
  console.log(`\n✗ ${f.where}`);
  for (const p of f.problems.slice(0, 25)) console.log(`  - ${p}`);
  if (f.problems.length > 25) console.log(`  … and ${f.problems.length - 25} more`);
}
console.log(`\n${failures.length ? `${failures.length} page(s) with problems` : 'All screens fine'} in ${Math.round((Date.now() - started) / 1000)}s. Screenshots: ${out}`);
process.exit(failures.length ? 1 : 0);
