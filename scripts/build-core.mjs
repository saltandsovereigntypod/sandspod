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
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ESBUILD = 'esbuild@0.28.2';
const only = process.argv.slice(2);

// Data the website already loads as its own script, read from there rather
// than copied into every bundle. The Traditional Library is about a megabyte:
// app/src/lib/library/traditionalData.ts is generated from
// js/traditional-library.js, so the bundles read that file's TraditionalLibrary
// and the browser downloads and caches it once for every page. A page (or a
// loader) that uses one of these bundles loads that file first;
// scripts/validate-static.js checks the pages, finding the bundles that need
// it by this message.
const TRADITIONAL_LIBRARY_NEEDED = 'Load /js/traditional-library.js before this script.';
const SHARED = [
  {
    // Matched against the import as written ("./traditionalData.ts" in
    // library/model.ts, "../../library/traditionalData.ts" elsewhere).
    external: '*/traditionalData.ts',
    file: /^(?:\.\.?\/)+(?:[\w-]+\/)*traditionalData\.ts$/,
    module: `{TRADITIONAL_LIBRARY:(function(){if(typeof TraditionalLibrary==="undefined")throw new Error(${JSON.stringify(TRADITIONAL_LIBRARY_NEEDED)});return TraditionalLibrary})()}`,
  },
];

/** Swap each external's require("…") for the shared data it stands for. */
function linkShared(outfile) {
  let code = readFileSync(outfile, 'utf8');
  code = code.replace(/\b[A-Za-z_$][\w$]*\("([^"]+)"\)/g, (call, path) => {
    const shared = SHARED.find((s) => s.file.test(path));
    return shared ? shared.module : call;
  });
  for (const { file } of SHARED) {
    if ([...code.matchAll(/"([^"]+)"/g)].some(([, path]) => file.test(path))) throw new Error(`${outfile}: a shared module was left unlinked`);
  }
  writeFileSync(outfile, code);
}
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
      // Names like "practice-b" aren't identifiers: SaltCore["practice-b"].
      /^[A-Za-z_$][\w$]*$/.test(name) ? `--global-name=SaltCore.${name}` : `--global-name=SaltCore[${JSON.stringify(name)}]`,
      '--target=es2019',
      ...SHARED.map((s) => `--external:${s.external}`),
      `--outfile=js/core/${name}.js`,
      '--log-level=warning',
      `--banner:js=/* Built by scripts/build-core.mjs from app/src/lib (scripts/core/${name}.ts). Do not edit. */ window.SaltCore = window.SaltCore || {};`,
    ],
    { cwd: root, stdio: 'inherit' },
  );
  linkShared(join(root, `js/core/${name}.js`));
  console.log(`js/core/${name}.js`);
}

// The ready-made coven programs (every course lesson) as data the app and the
// coven pages fetch only when needed: js/core/course-programs.json.
if (!only.length || only.includes('courses')) {
  execFileSync(process.execPath, ['--experimental-strip-types', '--disable-warning=ExperimentalWarning', 'scripts/build-course-programs.mjs'], { cwd: root, stdio: 'inherit' });
}
