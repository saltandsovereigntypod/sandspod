// Builds the website for Cloudflare: copies the site into dist/, leaving out
// what isn't part of it (the phone app's source, the database and its
// functions, build scripts, the Worker, tests, notes). Cloudflare runs
// `node scripts/cloudflare-build.mjs` and publishes dist/ with the Worker
// (wrangler.jsonc); _headers (repo root) tells it how long browsers may keep
// each kind of file.
//
// The website's own copies of the app's pages (Today, Altar, Practice, Coven,
// More and the rest: worker/routing.js REPLACED_SECTIONS) are left out too:
// the Worker serves the Expo web app there instead. Their source stays in the
// repo for now. The coven guidelines (KEPT_IN_REPLACED) still ship.
//
// Everything under assets/ goes, the altar's object pictures as both the
// original PNGs (saved altars name them) and the WebP twins the pages show
// (scripts/build-altar-object-webp.py). Workers static assets take at most
// 20,000 files of at most 25 MiB each; the build stops if dist/ outgrows that.
import { cpSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { KEPT_IN_REPLACED, REPLACED_SECTIONS } from "../worker/routing.js";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist");
const LEAVE_OUT = new Set([...REPLACED_SECTIONS, "app", "supabase", "scripts", "tests", "docs", "dist", "worker", "node_modules", ".git", ".github", ".claude", "package.json", "package-lock.json", "wrangler.jsonc", "readme.md", "CNAME"]);

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const name of readdirSync(root)) {
  if (LEAVE_OUT.has(name) || name.startsWith(".")) continue;
  cpSync(join(root, name), join(out, name), { recursive: true });
}
for (const kept of KEPT_IN_REPLACED) {
  mkdirSync(dirname(join(out, kept)), { recursive: true });
  cpSync(join(root, kept), join(out, kept), { recursive: true });
}

// sitemap.xml and robots.txt: the static pages that ship, and the app's main screens.
const ORIGIN = "https://saltandsovereignty.com";
const APP_PAGES = ["/today", "/altar", "/grimoire", "/grimoire/library", "/rituals", "/rituals/craft", "/coven", "/sign-in"];
const blogPages = [];
const findPages = (dir) => {
  for (const entry of readdirSync(join(out, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) findPages(rel);
    else if (entry.name.endsWith(".html")) blogPages.push(`/${rel.replace(/\.html$/, "")}`);
  }
};
findPages("blog");
const pages = ["/", "/submit/", "/help/", "/covens/guidelines/", "/privacy", "/submission-terms", "/delete-account", ...blogPages.sort(), ...APP_PAGES];
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${ORIGIN}${page}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nDisallow: /admin/\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);

const MAX_FILES = 20000;
const MAX_BYTES = 25 * 1024 * 1024;
let files = 0;
const tooBig = [];
const count = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) count(full);
    else {
      files += 1;
      if (statSync(full).size > MAX_BYTES) tooBig.push(full);
    }
  }
};
count(out);
if (files > MAX_FILES || tooBig.length) {
  console.error(`dist/ has ${files} files (at most ${MAX_FILES})${tooBig.length ? `; over 25 MiB: ${tooBig.join(", ")}` : ""}`);
  process.exit(1);
}
console.log(`Site copied to dist/: ${files} files`);
