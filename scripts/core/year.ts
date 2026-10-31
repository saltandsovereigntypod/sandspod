// The app's own logic for the website's Grimoire → Your year in review
// (/grimoire/year/): which year (by the person's own new year), everything
// it held, the reflection prompts and the year-end page, and the shareable
// card. Built by scripts/build-core.mjs into js/core/year.js
// (window.SaltCore.year). The page also loads js/core/holy.js (holy-day
// pages, and holyOps for keeping the year-end page). Pure modules from app/src/lib only.
export * as yearSpan from '../../app/src/lib/grimoire/yearSpan.ts';
export * as yearReview from '../../app/src/lib/grimoire/yearReview.ts';
export * as readings from '../../app/src/lib/craft/hedge/readings.ts';
export * as dreams from '../../app/src/lib/craft/hedge/dreams.ts';
export * as holidays from '../../app/src/lib/holidays.ts';
export * as calendars from '../../app/src/lib/calendars/index.ts';
export * as calendar from '../../app/src/lib/calendar.ts';
export * as links from '../../app/src/lib/divination/links.ts';
export { JOURNEY_CATALOG } from '../../app/src/lib/journeys/catalog.ts';
// Saved altars as the app reads them (saved_altars rows, or this browser's copy), for offerings and changes at the altar.
export { altarFromRow, LOCAL_ALTARS_KEY, parseLocalAltars } from '../../app/src/lib/altar/snapshot.ts';
