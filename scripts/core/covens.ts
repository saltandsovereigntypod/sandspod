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
// The ritual builder: sections, roles, steps that know what they are (their
// fields), ready-made templates, and the script, votes and record.
export * as builder from '../../app/src/lib/covens/builder.ts';
export * as fields from '../../app/src/lib/covens/fields.ts';
export * as templates from '../../app/src/lib/covens/templates.ts';
export * as script from '../../app/src/lib/covens/script.ts';
export * as draft from '../../app/src/lib/covens/draft.ts';
export { newId } from '../../app/src/lib/grimoire/ids.ts';
// Paths in the coven: shares of how the coven practises and whom it honours, never who.
export * as paths from '../../app/src/lib/covens/paths.ts';
// Meetings: who a meeting is for, its own chat's window and who reads it
// afterwards, motions and elections, actions carried forward, the minutes.
export * as meetings from '../../app/src/lib/covens/meetings.ts';
// Who hears about a gathering (the coven's rules, a gathering's own choice),
// and the phone notes' words and what changed (coven-notify's gatherings.ts).
export * as notices from '../../app/src/lib/covens/notices.ts';
export * as gatheringNotes from '../../supabase/functions/coven-notify/gatherings.ts';
// Invitations: invite codes and links, a new link's choices, how a link
// stands, and the words (covens/join/, the Invite tab, My covens).
export * as invites from '../../app/src/lib/covens/invites.ts';
// The Covens page's two tabs (My covens | Find a coven) and which opens first.
export * as screenTabs from '../../app/src/lib/screenTabs.ts';
// Daughter covens: the disclosure, a mother coven head's powers, the lineage
// lines and log, founding choices, the library, handing on and head reports.
export * as lineage from '../../app/src/lib/covens/lineage.ts';
