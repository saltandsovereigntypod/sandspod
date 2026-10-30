// Builds the website for Cloudflare Pages: copies the site into dist/,
// leaving out what isn't part of it (the phone app's source, the database
// and its functions, build scripts, tests, notes). Cloudflare runs
// `node scripts/cloudflare-build.mjs` and publishes dist/; _headers (repo
// root) tells it how long browsers may keep each kind of file.
//
// Everything under assets/ goes, the altar's object pictures as both the
// original PNGs (saved altars name them) and the WebP twins the pages show
// (scripts/build-altar-object-webp.py). Workers static assets take at most
// 20,000 files of at most 25 MiB each; the build stops if dist/ outgrows that.
import { cpSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist");
const LEAVE_OUT = new Set(["app", "supabase", "scripts", "tests", "docs", "dist", "node_modules", ".git", ".github", ".claude", "package.json", "package-lock.json", "wrangler.jsonc", "readme.md", "CNAME"]);

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const name of readdirSync(root)) {
  if (LEAVE_OUT.has(name) || name.startsWith(".")) continue;
  cpSync(join(root, name), join(out, name), { recursive: true });
}

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
