// The app's own altar logic for the website's altar (altar/): a candle's life,
// wax and flame; dressing, carving and ceromancy; offerings, incense,
// petitions and charges; seasonal things, natural finds and more tools, the
// ancestor frame, potted plants and the Offerings drawer; the workings (spell jars, sachets, spells,
// scrying, gratitude); reading and arranging the altar; tonight's altar and shrines;
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
export * as offeringArt from '../../app/src/lib/altar/offeringArt.ts';
export * as offeringDrawer from '../../app/src/lib/altar/offeringDrawer.ts';
// Offering what's already on the altar to a presence, and everything on an altar written down for the Grimoire.
export * as offerFromAltar from '../../app/src/lib/altar/offerFromAltar.ts';
export * as altarRecord from '../../app/src/lib/altar/altarRecord.ts';
// Archived altars: set aside, kept whole, resting from reminders and the To tend list.
export * as archive from '../../app/src/lib/altar/archive.ts';
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
export * as cabinetFavourites from '../../app/src/lib/altar/cabinetFavourites.ts';
export * as seasonal from '../../app/src/lib/altar/seasonal.ts';
export * as frame from '../../app/src/lib/altar/frame.ts';
export * as shelf from '../../app/src/lib/altar/shelf.ts';
export * as pottedPlants from '../../app/src/lib/altar/pottedPlants.ts';
export * as pottedSprig from '../../app/src/lib/altar/pottedSprig.ts';
export * as editor from '../../app/src/lib/altar/editor.ts';
// "Meditate here": the meditation timer's clock and bells (Craft → Meditation).
export * as meditation from '../../app/src/lib/meditation/timer.ts';
// Choosing several things at once, and cord cutting between two candles.
export * as selection from '../../app/src/lib/altar/selection.ts';
export * as cord from '../../app/src/lib/altar/cord.ts';
// A coven ritual step's target on the altar, lit for the person whose part it is, and its items as cabinet things.
export * as deedTargets from '../../app/src/lib/covens/deedTargets.ts';
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
export { traditionalEntries, searchLibrary, buildLibrary, guestPracticeRows } from '../../app/src/lib/library/model.ts';
export { hideTraditions } from '../../app/src/lib/library/traditions.ts';
export * as ritualLifecycle from '../../app/src/lib/rituals/lifecycle.ts';
export * as ritualRows from '../../app/src/lib/rituals/rows.ts';
export * as practice from '../../app/src/lib/altar/connect/practice.ts';
export * as history from '../../app/src/lib/altar/connect/history.ts';
export * as grimoire from '../../app/src/lib/altar/connect/grimoire.ts';
export * as altarCare from '../../app/src/lib/altar/connect/altarCare.ts';
export * as ancestors from '../../app/src/lib/craft/hedge/ancestors.ts';
export * as readings from '../../app/src/lib/craft/hedge/readings.ts';
export * as stones from '../../app/src/lib/craft/crystal/stones.ts';
export * as stoneCollections from '../../app/src/lib/craft/crystal/collections.ts';
export * as garden from '../../app/src/lib/craft/green/garden.ts';
export * as sigil from '../../app/src/lib/sigil/index.ts';
// Coven altars: the altar as rows and back (the coven altar page and the
// coven's Altars tab), a ritual step's change to its altar, and a petition's altar.
export * as covenAltar from '../../app/src/lib/covens/altarDoc.ts';
export * as ritualAltar from '../../app/src/lib/covens/ritualAltar.ts';
export * as petitionAltar from '../../app/src/lib/covens/petitionAltar.ts';
// "Find mine" on a coven altar: what's on it and whose, as far as you may know (the To tend list's altar logic).
export * as tendAltar from '../../app/src/lib/tend/altar.ts';
// Everything the altar knows, as one list to search (the coven ritual
// planner's Items picker and the cabinet's search bar).
export * as itemIndex from '../../app/src/lib/altar/itemIndex.ts';
// The Altar page's two tabs (Personal | Coven) in My Altars, and the Coven
// tab's list: every coven altar you can see, grouped under each coven.
export * as screenTabs from '../../app/src/lib/screenTabs.ts';
export * as altarsAcross from '../../app/src/lib/covens/altarsAcross.ts';
// The altar bell: ringing it, ringing to cleanse (kept in the altar’s History) and the coven altar hearing it.
export * as bell from '../../app/src/lib/altar/bell.ts';
// The circle and the quarters, the singing bowl, and the chalice, besom, matches, lighter and snuffer.
export * as circle from '../../app/src/lib/altar/circle.ts';
export * as bowl from '../../app/src/lib/altar/bowl.ts';
export * as toolRites from '../../app/src/lib/altar/toolRites.ts';
// The pendulum, mortar and pestle, bolline, cauldron, crystals charging and the grid, drawing from a deck, ritual mode.
export * as craftTools from '../../app/src/lib/altar/craftTools.ts';
// Crystals: when they may charge (selenite touching, the moon by night, the sun by day), and how they wear with use.
export * as crystalCare from '../../app/src/lib/altar/crystalCare.ts';
