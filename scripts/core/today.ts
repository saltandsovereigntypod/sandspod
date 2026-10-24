// The app's own logic for the website's Today pages (/today/, /today/sky/,
// /today/calendar/, and the shared parts of /today/holy/): the moon and sky,
// the day's correspondences, holidays and calendars, For your practice, your
// deities, your next working and last time. Built by scripts/build-core.mjs
// into js/core/today.js (window.SaltCore.today). Keep it to pure modules from
// app/src/lib. The holy pages' text is in its own bundle (scripts/core/holy.ts).
export * as moon from '../../app/src/lib/moon.ts';
export * as calendar from '../../app/src/lib/calendar.ts';
export * as holidays from '../../app/src/lib/holidays.ts';
export * as traditionDay from '../../app/src/lib/traditionDay.ts';
export * as today from '../../app/src/lib/today.ts';
export * as calendars from '../../app/src/lib/calendars/index.ts';
export * as practiceDay from '../../app/src/lib/craft/today.ts';
// The morning prompt to catch last night's dream (Grimoire → Dreams).
export * as dreams from '../../app/src/lib/craft/hedge/dreams.ts';
export * as patron from '../../app/src/lib/patron/index.ts';
export * as traditions from '../../app/src/lib/library/traditions.ts';
// The sky: Today's sky card and the Sky page.
export * as sky from '../../app/src/lib/sky.ts';
export * as dayInfo from '../../app/src/lib/dayInfo.ts';
export * as meanings from '../../app/src/lib/astro/meanings.ts';
export * as planets from '../../app/src/lib/astro/planets.ts';
export * as cosmicHours from '../../app/src/lib/craft/cosmic/hours.ts';
// Links to the holy-day and moon pages, without their text.
export * as holyRefs from '../../app/src/lib/holy/refs.ts';
// Your next working, a ritual under way, and Last time.
export * as plans from '../../app/src/lib/rituals/plans.ts';
export * as planSync from '../../app/src/lib/rituals/planSync.ts';
export * as ritualFormat from '../../app/src/lib/rituals/format.ts';
export * as insights from '../../app/src/lib/rituals/insights.ts';
export * as lookBack from '../../app/src/lib/rituals/lookBack.ts';
export * as apothecaryLookBack from '../../app/src/lib/altar/apothecaryLookBack.ts';
export * as lifecycle from '../../app/src/lib/rituals/lifecycle.ts';
export * as ritualRows from '../../app/src/lib/rituals/rows.ts';
// A working for tonight, and the premade a holy page suggests.
export * as premade from '../../app/src/lib/rituals/premade/index.ts';
// The Living Library entries the correspondences open.
export * as library from '../../app/src/lib/library/model.ts';
// The card of the day, from the Hedge reading log.
export * as readings from '../../app/src/lib/craft/hedge/readings.ts';
export * as daily from '../../app/src/lib/divination/daily.ts';
export * as seasonal from '../../app/src/lib/divination/seasonal.ts';
