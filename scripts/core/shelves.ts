// The app's own logic for the website's My Shelves (/rituals/shelves/): the
// shelves and what's on them, tending defaults and best-by days, the
// shopping list, ingredient matching and each thing's story, with the To
// tend model its records are kept in. Built by scripts/build-core.mjs into
// js/core/shelves.js (window.SaltCore.shelves). Keep it to pure modules from
// app/src/lib.
export * as model from '../../app/src/lib/shelves/model.ts';
export * as tend from '../../app/src/lib/tend/model.ts';
export * as story from '../../app/src/lib/altar/story.ts';
export { itemIndex, searchItems, cabinetFormOf, sitePicture } from '../../app/src/lib/altar/itemIndex.ts';
export * as snapshot from '../../app/src/lib/altar/snapshot.ts';
// The painted furniture each shelf is drawn on and its measured planks, and the labelled jars, bottles, boxes and spines.
export * as art from '../../app/src/lib/shelves/art.ts';
export * as vesselLabel from '../../app/src/lib/altar/vesselLabel.ts';
