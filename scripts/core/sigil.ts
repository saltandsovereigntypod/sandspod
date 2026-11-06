// The sigil maker for the website (/sigil/): the letter
// method, the planetary squares, hand drawing, the saved shape and the
// Grimoire page it becomes (the same rows as the app's saveSigilPage). Built
// by scripts/build-core.mjs into js/core/sigil.js (window.SaltCore.sigil).
export * from '../../app/src/lib/sigil/index.ts';
// The planets' seals beside the squares: their Intelligences and Spirits, traced.
export * as seals from '../../app/src/lib/sigil/seals.ts';
export { sigilPageOps } from '../../app/src/lib/grimoire/sigilOps.ts';
export { newId } from '../../app/src/lib/grimoire/ids.ts';
