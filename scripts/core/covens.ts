// The app's own logic for the website's coven pages: initiation and training
// programs, mentors, the coven's practice calendar, and how messages and
// conversations read (bubbles, previews, unread counts). Built by
// scripts/build-core.mjs into js/core/covens.js (window.SaltCore.covens).
// Keep it to pure modules from app/src/lib.
export * as programs from '../../app/src/lib/covens/programs.ts';
export * as holidays from '../../app/src/lib/holidays.ts';
export * as today from '../../app/src/lib/covens/today.ts';
export * as thread from '../../app/src/lib/covens/thread.ts';
export * as unreadCount from '../../app/src/lib/covens/unreadCount.ts';
// Coven readings: a spread drawn together in the coven's chat.
export * as reading from '../../app/src/lib/covens/reading.ts';
// Applications and requests to advance waiting for reviewers (the Review tab's and coven list's counts).
export * as requests from '../../app/src/lib/covens/requests.ts';
// A coven altar's chat window and deleting an altar for good (who may, and the words asked first).
export * as altarPanel from '../../app/src/lib/covens/altarPanel.ts';
// Coven ritual planning: the one search picker (WHO and its ranking), the
// step actions, and what a step asks of people and who may read it.
export * as picker from '../../app/src/lib/covens/picker.ts';
export * as stepActions from '../../app/src/lib/covens/stepActions.ts';
export * as contributions from '../../app/src/lib/covens/contributions.ts';
// The members' record: attendance, studies, mentoring and the gentle flags.
export * as record from '../../app/src/lib/covens/record.ts';
// Paths in the coven: shares of how the coven practises and whom it honours, never who.
export * as paths from '../../app/src/lib/covens/paths.ts';
