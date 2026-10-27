// The app's grimoire rules for the website: the arranged home (order,
// hidden parts, names, what's open, page sort and filter), and a coven's
// Book of Shadows built on the same model (its operations, who may open,
// write in and approve each part, suggestions, page history, its shelves,
// what the ritual builder saves, Study material links). Built by
// scripts/build-core.mjs into js/core/grimoire.js (window.SaltCore.grimoire).
// Keep it to pure modules from app/src/lib.
export * as layout from '../../app/src/lib/grimoire/layout.ts';
export * as access from '../../app/src/lib/grimoire/access.ts';
export * as submissions from '../../app/src/lib/grimoire/submissions.ts';
export * as history from '../../app/src/lib/grimoire/history.ts';
export * as coven from '../../app/src/lib/grimoire/coven.ts';
// The same operations, templates and page elements the app's editor uses.
export * as edits from '../../app/src/lib/grimoire/edits.ts';
export * as elements from '../../app/src/lib/grimoire/elements.ts';
export * as markup from '../../app/src/lib/grimoire/markup.ts';
export * as richText from '../../app/src/lib/grimoire/richText.ts';
export * as structure from '../../app/src/lib/grimoire/structure.ts';
export { newId } from '../../app/src/lib/grimoire/ids.ts';
