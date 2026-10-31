// The altar pieces the website's land journal needs to link a note to your
// potted plants (/practice/hearth/land/note-edit/): your altars as the app
// reads them, and the pots on them. Kept apart from js/core/hearth.js because
// the altar's artwork list is large and only the note pages need it. Built by
// scripts/build-core.mjs into js/core/hearth-altar.js
// (window.SaltCore['hearth-altar']).
export * as snapshot from '../../app/src/lib/altar/snapshot.ts';
export * as potted from '../../app/src/lib/craft/hearth/potted.ts';
