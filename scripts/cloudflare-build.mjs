// Builds the website for Cloudflare: copies the site into dist/, leaving out
// what isn't part of it (the phone app's source, the database and its
// functions, build scripts, the Worker, tests, notes). Cloudflare runs
// `node scripts/cloudflare-build.mjs` and publishes dist/ with the Worker
// (wrangler.jsonc); _headers (repo root) tells it how long browsers may keep
// each kind of file.
//
// The website's own copies of the app's pages (Today, Altar, Practice, Coven,
// More and the rest: worker/routing.js REPLACED_SECTIONS) are left out too:
// the Worker serves the Expo web app there instead, from its export in webapp/
// (scripts/build-webapp.mjs, committed with each release). The export's files
// join the site's (/_expo/, the hashed /assets/assets/ and /assets/____app/,
// sw.js, manifest and icons) and its page goes to /_app/index.html, the shell
// the Worker answers app addresses with; the build stops if one would replace
// a file of the site. Their source stays in the
// repo for now. The coven guidelines (KEPT_IN_REPLACED) still ship.
//
// Everything under assets/ goes, the altar's object pictures as both the
// original PNGs (saved altars name them) and the WebP twins the pages show
// (scripts/build-altar-object-webp.py). Workers static assets take at most
// 20,000 files of at most 25 MiB each; the build stops if dist/ outgrows that.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { KEPT_IN_REPLACED, REPLACED_SECTIONS } from "../worker/routing.js";
import { buildLibraryBlog } from "./build-library-blog.mjs";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist");
const LEAVE_OUT = new Set([...REPLACED_SECTIONS, "app", "supabase", "scripts", "tests", "docs", "dist", "worker", "node_modules", "webapp", ".git", ".github", ".claude", "package.json", "package-lock.json", "wrangler.jsonc", "readme.md", "CNAME"]);

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

// The Expo web app's export, merged in without replacing any of the site's files.
const webapp = join(root, "webapp");
if (!existsSync(join(webapp, "index.html"))) {
  console.error("webapp/ has no export: run node scripts/build-webapp.mjs and commit webapp/");
  process.exit(1);
}
const clashes = [];
const merge = (rel) => {
  for (const entry of readdirSync(join(webapp, rel), { withFileTypes: true })) {
    const from = join(rel, entry.name);
    if (entry.isDirectory()) merge(from);
    else {
      const to = join(out, from === "index.html" ? "_app/index.html" : from);
      if (existsSync(to)) clashes.push(from);
      else {
        mkdirSync(dirname(to), { recursive: true });
        cpSync(join(webapp, from), to);
      }
    }
  }
};
merge("");
if (clashes.length) {
  console.error(`webapp/ files would replace the site's: ${clashes.join(", ")}`);
  process.exit(1);
}

// The journal: a post for every Living Library entry, its index pages and the
// home page's posts.json (scripts/build-library-blog.mjs), built from the Library.
const journal = buildLibraryBlog({ root, out });
console.log(`Library journal: ${journal.posts.length} posts; ${journal.skipped.length} too short to post (${journal.skipped.map((s) => s.name).join(", ") || "none"})`);

// sitemap.xml and robots.txt: the static pages that ship, and the app's main screens.
const ORIGIN = "https://saltandsovereignty.com";
const APP_PAGES = ["/today", "/altar", "/grimoire", "/grimoire/library", "/rituals", "/rituals/craft", "/coven", "/sign-in"];
/** When a file last changed (its last commit), if git knows. */
const changed = (file) => {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null;
  } catch {
    return null;
  }
};
const generated = new Set([...journal.indexes, ...journal.posts.map((post) => post.path)]);
const handWritten = [];
const findPages = (dir) => {
  for (const entry of readdirSync(join(out, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) findPages(rel);
    else if (entry.name.endsWith(".html")) {
      const page = `/${rel.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "")}`;
      if (!generated.has(page)) handWritten.push({ page, lastmod: changed(rel) });
    }
  }
};
findPages("blog");
const pages = [
  ...[["/", "index.html"], ["/submit/", "submit"], ["/help/", "help"], ["/covens/guidelines/", "covens/guidelines"], ["/privacy", "privacy.html"], ["/submission-terms", "submission-terms.html"], ["/delete-account", "delete-account.html"]].map(([page, file]) => ({ page, lastmod: changed(file) })),
  ...journal.indexes.map((page) => ({ page, lastmod: journal.date })),
  ...handWritten.sort((a, b) => a.page.localeCompare(b.page)),
  ...journal.posts.map((post) => ({ page: post.path, lastmod: journal.date })),
  ...APP_PAGES.map((page) => ({ page })),
];
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(({ page, lastmod }) => `  <url><loc>${ORIGIN}${page}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`);
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
