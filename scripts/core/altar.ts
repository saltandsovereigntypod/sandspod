// The app's own altar logic for the website's altar (altar/): a candle's life,
// wax and flame; dressing, carving and ceromancy; offerings, incense,
// petitions and charges; the workings (spell jars, sachets, spells, scrying,
// gratitude); reading and arranging the altar; tonight's altar and shrines;
// an object's story; and the share card. Built by scripts/build-core.mjs into
// js/core/altar.js (window.SaltCore.altar). Keep it to pure modules from
// app/src/lib: the altar page turns its objects into the app's saved-object
// shape (altar/js/features/app-altar-bridge.js) and back.
export * as livingState from '../../app/src/lib/altar/livingState.ts';
export * as geometry from '../../app/src/lib/altar/geometry.ts';
export * as wax from '../../app/src/lib/altar/wax.ts';
export * as flame from '../../app/src/lib/altar/flame.ts';
export * as ceromancy from '../../app/src/lib/altar/ceromancy.ts';
export * as incense from '../../app/src/lib/altar/incense.ts';
export * as offerings from '../../app/src/lib/altar/offerings.ts';
export * as petitions from '../../app/src/lib/altar/petitions.ts';
export * as charge from '../../app/src/lib/altar/charge.ts';
export * as moonCharge from '../../app/src/lib/altar/moonCharge.ts';
export * as attunement from '../../app/src/lib/altar/attunement.ts';
export * as story from '../../app/src/lib/altar/story.ts';
export * as devotion from '../../app/src/lib/altar/devotion.ts';
export * as relationship from '../../app/src/lib/altar/relationship.ts';
export * as companion from '../../app/src/lib/altar/companion.ts';
export * as arrange from '../../app/src/lib/altar/arrange.ts';
export * as tonight from '../../app/src/lib/altar/tonight.ts';
export * as cabinet from '../../app/src/lib/altar/cabinet.ts';
export * as editor from '../../app/src/lib/altar/editor.ts';
export * as snapshot from '../../app/src/lib/altar/snapshot.ts';
export * as altarOptions from '../../app/src/lib/altar/altarOptions.ts';
export * as ambient from '../../app/src/lib/altar/ambient.ts';
export * as colors from '../../app/src/lib/altar/workings/colors.ts';
export * as dressing from '../../app/src/lib/altar/workings/dressing.ts';
export * as spellJar from '../../app/src/lib/altar/workings/spellJar.ts';
export * as sachet from '../../app/src/lib/altar/workings/sachet.ts';
export * as spells from '../../app/src/lib/altar/workings/spells.ts';
export * as scrying from '../../app/src/lib/altar/workings/scrying.ts';
export * as gratitude from '../../app/src/lib/altar/workings/gratitude.ts';
export * as correspondence from '../../app/src/lib/altar/reading/correspondence.ts';
export * as intention from '../../app/src/lib/altar/reading/intention.ts';
export * as reading from '../../app/src/lib/altar/reading/reading.ts';
export * as layouts from '../../app/src/lib/altar/reading/layouts.ts';
export * as tonightExplained from '../../app/src/lib/altar/reading/tonightExplained.ts';
export * as shareCard from '../../app/src/lib/altar/connect/shareCard.ts';
export * as ancestor from '../../app/src/lib/altar/connect/ancestor.ts';
export * as apothecary from '../../app/src/lib/altar/apothecary.ts';
export * as moon from '../../app/src/lib/moon.ts';
export * as holidays from '../../app/src/lib/holidays.ts';
export { TRADITIONAL_LIBRARY } from '../../app/src/lib/library/traditionalData.ts';
export { traditionalEntries, searchLibrary } from '../../app/src/lib/library/model.ts';
export * as ritualLifecycle from '../../app/src/lib/rituals/lifecycle.ts';
export * as ritualRows from '../../app/src/lib/rituals/rows.ts';
export * as practice from '../../app/src/lib/altar/connect/practice.ts';
export * as history from '../../app/src/lib/altar/connect/history.ts';
export * as ancestors from '../../app/src/lib/craft/hedge/ancestors.ts';
export * as readings from '../../app/src/lib/craft/hedge/readings.ts';
export * as stones from '../../app/src/lib/craft/crystal/stones.ts';
export * as stoneCollections from '../../app/src/lib/craft/crystal/collections.ts';
export * as garden from '../../app/src/lib/craft/green/garden.ts';
