// The holy-day and moon pages for the website's /today/holy/ page: their
// text, the Grimoire page each becomes, and the rows that keep it there
// (the same as the app's saveHolyPage). Built by scripts/build-core.mjs into
// js/core/holy.js (window.SaltCore.holy). Kept apart from today.js so Today
// stays light; the holy page loads both.
export * as holy from '../../app/src/lib/holy/index.ts';
export * as holyOps from '../../app/src/lib/grimoire/holyOps.ts';
export { newId } from '../../app/src/lib/grimoire/ids.ts';
