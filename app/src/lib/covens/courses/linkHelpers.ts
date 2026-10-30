// Short ways to write a course link in a lesson or step (courseLinks.ts has
// what each kind opens). Pure.

import type { CourseLink } from '../courseLinks.ts';

export const page = (id: string): CourseLink => ({ kind: 'page', id });
export const coven = (id: string): CourseLink => ({ kind: 'coven', id });
export const lib = (type: string, key: string): CourseLink => ({ kind: 'library', id: `traditional:${type}:${key}` });
export const deity = (key: string) => lib('deity', key);
export const herb = (key: string) => lib('herb', key);
export const crystal = (key: string) => lib('crystal', key);
export const tool = (key: string) => lib('tool', key);
export const vessel = (key: string) => lib('vessel', key);
export const candle = (key: string) => lib('candle', key);
/** A holy day by its holiday key ('wheel/samhain') or a holy page's ref ('moon-full', 'roman-saturnalia'). */
export const holy = (id: string): CourseLink => ({ kind: 'holy', id });
export const ritual = (id: string): CourseLink => ({ kind: 'premade', id });
export const journey = (id: string): CourseLink => ({ kind: 'journey', id });
export const spread = (id: string): CourseLink => ({ kind: 'spread', id });
export const closed = (id = ''): CourseLink => ({ kind: 'closed', id });
export const seasonal = (id: string): CourseLink => ({ kind: 'seasonal', id });
