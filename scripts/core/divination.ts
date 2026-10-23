// The app's own logic for the website's draws (/practice/hedge/readings/draw/
// and the laid-out draw on a reading's page): the Rider–Waite–Smith deck and
// its meanings, the runes and ogham, the spreads, the shuffle, and the reading
// a draw becomes, and the link from a card or stave to its page in the
// Book of Shadows ("Read more"). Built by scripts/build-core.mjs into
// js/core/divination.js (window.SaltCore.divination). Pure modules from app/src/lib only.
export * as tarot from '../../app/src/lib/divination/tarot.ts';
export * as staves from '../../app/src/lib/divination/staves.ts';
export * as draw from '../../app/src/lib/divination/draw.ts';
export * as daily from '../../app/src/lib/divination/daily.ts';
export * as links from '../../app/src/lib/divination/links.ts';
