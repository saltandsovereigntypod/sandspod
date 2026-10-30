// The app's own logic for the website's Community Rituals page
// (rituals/community/, rituals/js/community.js): what a shared ritual holds,
// how one is made from a template (yours or a coven's), searching and
// sorting, attribution, the copy made by "Add to my rituals", review
// folders, and the closed traditions a ritual names. Built by
// scripts/build-core.mjs into js/core/community-rituals.js
// (window.SaltCore["community-rituals"]). Keep it to pure modules from app/src/lib.
export * from '../../app/src/lib/rituals/community.ts';
export { CLOSED_GUIDE_TITLE, closedMentions, GOOD_GUEST, mentionLine } from '../../app/src/lib/rituals/communityClosed.ts';
