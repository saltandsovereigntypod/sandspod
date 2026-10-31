// The app's own logic for A Year and a Day on the website (/rituals/year/)
// and Today's card: the plan, the schedule and the progress rules, the
// course links' website addresses, the lesson reader and the calendar file.
// Built by scripts/build-core.mjs into js/core/yearday.js
// (window.SaltCore.yearday). The lessons themselves load on demand
// (js/core/course-programs.json).
export * as year from '../../app/src/lib/yearday/index.ts';
export { courseLinkSiteHref } from '../../app/src/lib/covens/courseLinks.ts';
export { lessonHtml, readingTime } from '../../app/src/lib/covens/lesson.ts';
export { toIcs } from '../../app/src/lib/reminders/calendarEvent.ts';
export { keepsSouthernWheel } from '../../app/src/lib/divination/seasonal.ts';
