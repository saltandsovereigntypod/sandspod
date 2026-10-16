// The app's Living Library logic for the website's public Library pages
// (/library/ and /library/entry/): building entries from the website's own
// Traditional Library (js/traditional-library.js) with each person's My
// Practice laid over them, the fields and layers a page shows, search, and
// "Connected To". Built by scripts/build-core.mjs into js/core/library.js
// (window.SaltCore.library). Only data-free functions are exported, so the
// app's copy of the Traditional Library is left out of the bundle.
export {
  LIBRARY_TYPES,
  correspondences,
  entriesFromData,
  entryIntro,
  findByName,
  formatName,
  guestPracticeRows,
  hasMyPractice,
  layerFields,
  libraryFrom,
  pathEntryIds,
  searchLibrary,
  typeLabel,
  typeSingular,
  visibleLayers,
} from '../../app/src/lib/library/model.ts';
export { connectionGroups, entryResolver, guestRelationRows, uniqueRelations } from '../../app/src/lib/library/connections.ts';
export { entryVisible, hideTraditions, myPath, pathName } from '../../app/src/lib/library/traditions.ts';
export { ritualRecord } from '../../app/src/lib/library/records.ts';
export { richTextBlocks } from '../../app/src/lib/library/richText.ts';
export { hiddenTraditions } from '../../app/src/lib/holidays.ts';
export { LAYER_LABELS } from '../../app/src/lib/settings/defaults.ts';
