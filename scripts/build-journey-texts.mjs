// Writes each dedication journey's full text to js/core/journeys/<id>.json
// from the app's registry (app/src/lib/journeys/registry.ts). The app loads a
// journey from here the first time it's opened and keeps it on the phone
// (app/src/lib/journeys/texts.ts), so the four megabytes of journeys stay out
// of its bundle. The website loads its own js/core/journey-<id>.js.
//
//   node --experimental-strip-types scripts/build-journey-texts.mjs   (scripts/build-core.mjs runs it too)

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'js/core/journeys');
const { JOURNEYS } = await import(pathToFileURL(join(root, 'app/src/lib/journeys/registry.ts')).href);
mkdirSync(out, { recursive: true });
const ids = new Set(JOURNEYS.map((j) => `${j.id}.json`));
for (const f of readdirSync(out)) if (!ids.has(f)) rmSync(join(out, f));
for (const j of JOURNEYS) writeFileSync(join(out, `${j.id}.json`), JSON.stringify(j));
console.log(`js/core/journeys/*.json (${JOURNEYS.length} journeys)`);
