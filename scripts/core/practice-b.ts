// The app's own logic for the website's practice hubs, part 2: Cosmic &
// celestial, Crystal, Elemental, Sea, and Traditional & folk. Built by
// scripts/build-core.mjs into js/core/practice-b.js (window.SaltCore['practice-b']).
// Keep it to pure modules from app/src/lib.
export * as calendar from '../../app/src/lib/calendar.ts';
export * as moon from '../../app/src/lib/moon.ts';
export * as hoursAstro from '../../app/src/lib/astro/hours.ts';
export * as meanings from '../../app/src/lib/astro/meanings.ts';
export * as voidOfCourse from '../../app/src/lib/astro/voidOfCourse.ts';
export * as practices from '../../app/src/lib/craft/practices.ts';
export * as premade from '../../app/src/lib/rituals/premade/index.ts';
export * as lifecycle from '../../app/src/lib/rituals/lifecycle.ts';
export * as altarSnapshot from '../../app/src/lib/altar/snapshot.ts';

export * as chart from '../../app/src/lib/craft/cosmic/chart.ts';
export * as cosmicCollections from '../../app/src/lib/craft/cosmic/collections.ts';
export * as hours from '../../app/src/lib/craft/cosmic/hours.ts';
export * as transits from '../../app/src/lib/craft/cosmic/transits.ts';

export * as care from '../../app/src/lib/craft/crystal/care.ts';
export * as crystalCollections from '../../app/src/lib/craft/crystal/collections.ts';
export * as stones from '../../app/src/lib/craft/crystal/stones.ts';

export * as balance from '../../app/src/lib/craft/elemental/balance.ts';
export * as weather from '../../app/src/lib/craft/elemental/weather.ts';

export * as finds from '../../app/src/lib/craft/sea/finds.ts';
export * as tides from '../../app/src/lib/craft/sea/tides.ts';

export * as folkCalendar from '../../app/src/lib/craft/folk/calendar.ts';
export * as lore from '../../app/src/lib/craft/folk/lore.ts';
export * as folkWeather from '../../app/src/lib/craft/folk/weather.ts';
