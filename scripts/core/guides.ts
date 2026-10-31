// The app's own logic for the website's guides, settings and reminders: the
// Closed & living traditions guide and sourcing notes, support lines, the How
// to guide, the settings choices the site was missing (My practice, My path,
// Calendar & holidays, Today), and moon/ritual/devotion reminders as calendar
// files. Built by scripts/build-core.mjs into js/core/guides.js
// (window.SaltCore.guides). Keep it to pure modules from app/src/lib.
export * as closed from '../../app/src/lib/library/closed/index.ts';
export * as help from '../../app/src/lib/help/index.ts';
export * as support from '../../app/src/lib/support/lines.ts';
export * as holidays from '../../app/src/lib/holidays.ts';
export * as traditions from '../../app/src/lib/library/traditions.ts';
export * as traditionDay from '../../app/src/lib/traditionDay.ts';
export * as calendar from '../../app/src/lib/calendar.ts';
export * as moon from '../../app/src/lib/moon.ts';
export * as schedule from '../../app/src/lib/reminders/schedule.ts';
export * as calendarEvent from '../../app/src/lib/reminders/calendarEvent.ts';
export * as planSync from '../../app/src/lib/rituals/planSync.ts';
export * as patron from '../../app/src/lib/patron/index.ts';
export { PRACTICES, myPractices, practicesValue, practiceName } from '../../app/src/lib/rituals/premade/practices.ts';
export * as calendars from '../../app/src/lib/calendars/index.ts';
// Which kinds of draw Divination offers (Settings → My practice).
export * as divinationKinds from '../../app/src/lib/divination/oracle/kinds.ts';
// Hekate's Deipnon each month, as a calendar reminder for those who keep it.
export * as deipnon from '../../app/src/lib/deipnon.ts';
// Holidays, tending, ritual planning, quiet hours and the pause: the synced
// reminder choices (`reminders_v2`) and the reminders they make, the same as the app's.
export * as reminderPrefs from '../../app/src/lib/reminders/prefs.ts';
export * as reminderHolidays from '../../app/src/lib/reminders/holidays.ts';
export * as reminderPlan from '../../app/src/lib/reminders/plan.ts';
export * as reminderSources from '../../app/src/lib/reminders/sources.ts';
// Reminders asked for on your To tend list (craft collection `tend.rhythms`).
export * as tendModel from '../../app/src/lib/tend/model.ts';
export * as reminderCovens from '../../app/src/lib/reminders/covens.ts';
export * as altarSnapshot from '../../app/src/lib/altar/snapshot.ts';
// The coven's tradition, for its members' premade workings and calendars (js/coven-paths.js).
export * as covenTradition from '../../app/src/lib/covens/covenTradition.ts';
// The seasons of the year, counted as chosen (Settings → Location & hemisphere).
export * as seasons from '../../app/src/lib/seasons.ts';
