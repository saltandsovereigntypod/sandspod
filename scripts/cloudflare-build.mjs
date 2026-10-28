// Builds the website for Cloudflare Pages: copies the site into dist/,
// leaving out what isn't part of it (the phone app's source, the database
// and its functions, build scripts, tests, notes). Cloudflare runs
// `node scripts/cloudflare-build.mjs` and publishes dist/; _headers (repo
// root) tells it how long browsers may keep each kind of file.
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist");
const LEAVE_OUT = new Set(["app", "supabase", "scripts", "tests", "docs", "dist", "node_modules", ".git", ".github", ".claude", "package.json", "package-lock.json", "readme.md", "CNAME"]);

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const name of readdirSync(root)) {
  if (LEAVE_OUT.has(name) || name.startsWith(".")) continue;
  cpSync(join(root, name), join(out, name), { recursive: true });
}
console.log("Site copied to dist/");
