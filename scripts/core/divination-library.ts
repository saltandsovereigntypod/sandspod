// The Grimoire's Traditional Information → Divination for the website's Book
// of Shadows (grimoire/js/ui/divination.js): every tarot card, rune and
// ogham stave with its three words and its page, the drop-downs, the search
// and the ?divination= links the draw pages use. Built by
// scripts/build-core.mjs into js/core/divination-library.js
// (window.SaltCore["divination-library"]). Kept apart from divination.js so
// the draw pages don't load every page's text.
export * from '../../app/src/lib/divination/library.ts';
// The tarot decks, so a card's page shows it in the deck chosen in settings.
export * as decks from '../../app/src/lib/divination/decks.ts';
