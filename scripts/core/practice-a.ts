// The app's own logic for the website's My practice pages, part one: the hub
// (all ten practices, yours first) and the Green, Kitchen & hearth, Hedge,
// Solitary and Eclectic tools. Built by scripts/build-core.mjs into
// js/core/practice-a.js (window.SaltCore['practice-a']). Pure modules from
// app/src/lib only: no React, React Native or AsyncStorage.
export * as practices from '../../app/src/lib/craft/practices.ts';
export * as merge from '../../app/src/lib/craft/merge.ts';
export * as premade from '../../app/src/lib/rituals/premade/index.ts';
export * as planner from '../../app/src/lib/rituals/planner.ts';
export * as lifecycle from '../../app/src/lib/rituals/lifecycle.ts';
export * as moon from '../../app/src/lib/moon.ts';
export * as calendar from '../../app/src/lib/calendar.ts';
export * as holidays from '../../app/src/lib/holidays.ts';
export * as meanings from '../../app/src/lib/astro/meanings.ts';
export * as libraryModel from '../../app/src/lib/library/model.ts';
export * as calendarEvent from '../../app/src/lib/reminders/calendarEvent.ts';
export * as garden from '../../app/src/lib/craft/green/garden.ts';
export * as moonGarden from '../../app/src/lib/craft/green/moonGarden.ts';
export * as season from '../../app/src/lib/craft/green/season.ts';
export * as moonhome from '../../app/src/lib/craft/kitchen/moonhome.ts';
export * as pantry from '../../app/src/lib/craft/kitchen/pantry.ts';
export * as simmer from '../../app/src/lib/craft/kitchen/simmer.ts';
export * as ancestors from '../../app/src/lib/craft/hedge/ancestors.ts';
export * as dreams from '../../app/src/lib/craft/hedge/dreams.ts';
export * as dreamSymbols from '../../app/src/lib/craft/hedge/dreamSymbols.ts';
export * as readings from '../../app/src/lib/craft/hedge/readings.ts';
export * as devotion from '../../app/src/lib/craft/solitary/devotion.ts';
export * as correspondences from '../../app/src/lib/craft/eclectic/correspondences.ts';
// Readings drawn for a dream (the dream's page and its patterns).
export * as linked from '../../app/src/lib/divination/linked.ts';
// The practice journals (shadow work, deity & spirit, ancestors, omens & signs), and
// what they draw on: My deities, dedication journeys, planetary hours and the Deipnon.
export * as journals from '../../app/src/lib/journals/journals.ts';
export * as patronMine from '../../app/src/lib/patron/mine.ts';
export * as journeyCatalog from '../../app/src/lib/journeys/catalog.ts';
export * as journeyLookup from '../../app/src/lib/journeys/lookup.ts';
export * as journeyProgress from '../../app/src/lib/journeys/progress.ts';
export * as hours from '../../app/src/lib/astro/hours.ts';
export * as deipnon from '../../app/src/lib/deipnon.ts';
// How the seasons are counted, for the simmer pots (Settings → Location & hemisphere).
export * as seasons from '../../app/src/lib/seasons.ts';
