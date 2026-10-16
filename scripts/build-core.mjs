// Builds the app's own logic (app/src/lib, pure TypeScript) into plain
// scripts the website loads, so the site and the app share one source of
// truth for calendars, rituals, journeys, practice tools and guides.
//
//   node scripts/build-core.mjs        build every bundle into js/core/
//   node scripts/build-core.mjs today  build one
//
// Each entry in scripts/core/<name>.ts becomes js/core/<name>.js and sets
// window.SaltCore.<name>. The output is committed, so the site stays buildless.

import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ESBUILD = 'esbuild@0.28.2';
const only = process.argv.slice(2);
const entries = readdirSync(join(root, 'scripts/core'))
  .filter((f) => f.endsWith('.ts'))
  .map((f) => f.replace(/\.ts$/, ''))
  .filter((name) => !only.length || only.includes(name));

for (const name of entries) {
  execFileSync(
    'npx',
    [
      '-y',
      ESBUILD,
      `scripts/core/${name}.ts`,
      '--bundle',
      '--minify',
      '--format=iife',
      `--global-name=SaltCore.${name}`,
      '--target=es2019',
      `--outfile=js/core/${name}.js`,
      '--log-level=warning',
      `--banner:js=/* Built by scripts/build-core.mjs from app/src/lib (scripts/core/${name}.ts). Do not edit. */ window.SaltCore = window.SaltCore || {};`,
    ],
    { cwd: root, stdio: 'inherit' },
  );
  console.log(`js/core/${name}.js`);
}
