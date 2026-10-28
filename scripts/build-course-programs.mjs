// Writes the ready-made coven programs composed from the courses
// (app/src/lib/covens/courses/index.ts) to js/core/course-programs.json: every
// lesson and test, about a megabyte, so it stays out of the app's bundle and
// the coven pages. The app fetches it from the website, and the website's
// Initiation & training tab, when someone opens the ready-made programs.
//
//   node scripts/build-course-programs.mjs   (scripts/build-core.mjs runs it too)

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const courses = await import(pathToFileURL(join(root, 'app/src/lib/covens/courses/index.ts')).href);
const catalog = {
  version: 1,
  label: courses.PATH_LABEL,
  traditions: courses.COURSE_TRADITIONS,
  programs: courses.coursePrograms(),
};
writeFileSync(join(root, 'js/core/course-programs.json'), JSON.stringify(catalog));
console.log(`js/core/course-programs.json (${catalog.programs.length} programs)`);
