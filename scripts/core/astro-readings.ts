// The chart readings for the website: the interpretation library (every
// placement, house, aspect, pattern, transit, return and progression read in
// full) and how a chart's reading is put together. Built by
// scripts/build-core.mjs into js/core/astro-readings.js
// (window.SaltCore["astro-readings"]). It is most of the astrology's weight,
// so only the pages that read a chart load it (practice/cosmic/chart/ and
// practice/cosmic/synastry/, beside js/core/astro.js); the pages that only
// need the sky, the Moon and the hours load js/core/astro.js alone.
export * as interpret from '../../app/src/lib/astro/interpret/registry.ts';
export * as compose from '../../app/src/lib/astro/interpret/compose.ts';
