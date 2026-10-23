// "Did it work?" for the website's ritual journal outside the Rituals pages: the
// altar's journal form and Completed Rituals choose a look-back day, and any
// page can ask whether a working worked. Built by scripts/build-core.mjs into
// js/core/lookback.js (window.SaltCore.lookback). Small on purpose: pages that
// already load js/core/rituals.js find the same modules there.
export * as lookBack from '../../app/src/lib/rituals/lookBack.ts';
export * as whatWorks from '../../app/src/lib/rituals/whatWorks.ts';
