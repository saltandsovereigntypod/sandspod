// The app's own logic for the website's draws (/divination/draw/
// and the laid-out draw on a reading's page): the Rider–Waite–Smith deck and
// its meanings, the runes and ogham, the spreads and how they're laid out,
// spreads of your own (`hedge.spreads`), spreads for the time of the moon and
// year, the shuffle, and the reading a draw becomes. Built by
// scripts/build-core.mjs into js/core/divination.js (window.SaltCore.divination).
// Also the link from a card or stave to its page in the Book of Shadows
// ("Read more"). Pure modules from app/src/lib only.
export * as tarot from '../../app/src/lib/divination/tarot.ts';
export * as staves from '../../app/src/lib/divination/staves.ts';
export * as draw from '../../app/src/lib/divination/draw.ts';
export * as daily from '../../app/src/lib/divination/daily.ts';
export * as layout from '../../app/src/lib/divination/layout.ts';
export * as custom from '../../app/src/lib/divination/custom.ts';
export * as seasonal from '../../app/src/lib/divination/seasonal.ts';
export * as links from '../../app/src/lib/divination/links.ts';
// Readings drawn for a dream, a planned working or a deity.
export * as linked from '../../app/src/lib/divination/linked.ts';
