// Builds the Expo web app into webapp/ for the website: run it at release time
// and commit webapp/ with the release. scripts/cloudflare-build.mjs copies it
// into dist/ beside the static pages and the Worker serves it (worker/index.js),
// so Cloudflare's build never has to install or bundle the app.
//
// Most of the export is the app's pictures (app/assets), which git already
// stores, so a release adds little more than the new script bundle.
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "webapp");
rmSync(out, { recursive: true, force: true });
execFileSync("npx", ["expo", "export", "--platform", "web", "--clear", "--output-dir", out], { cwd: join(root, "app"), stdio: "inherit" });
// Expo's export notes, not served.
rmSync(join(out, "metadata.json"), { force: true });
console.log("Web app exported to webapp/: commit it with the release.");
