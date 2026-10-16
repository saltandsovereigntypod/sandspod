/*
 * The website's own notes for the How to guide. The guide itself is the
 * app's (app/src/lib/help, via js/core/guides.js) and is written for the
 * app; these notes say where the steps differ on the website, and where an
 * app screen lives here ("Take me there"). Website-only words live in this
 * file so the app's guide never needs to change for the site.
 */
(function (global) {
  /** Notes shown under a whole section, before its topics. */
  const SECTION_NOTES = {
    "getting-started": "On the website, the same tabs sit in the bar at the top of the page on a computer and along the bottom on a phone: Today, Altar, Grimoire, Rituals, Podcast and More. Where a step says tap, click.",
    altar: "On the website, the Altar is its own page (Altar in the bar). Most tools are there under the same names; a few, like turning the phone sideways or the home screen widget, belong to the app alone.",
    grimoire: "On the website, the Grimoire opens your Book of Shadows with the Living Library shelves beside it.",
    rituals: "On the website, Rituals opens the altar’s Ritual Companion, where you plan, run and journal a ritual.",
    widgets: "Widgets live on a phone’s home screen, so they’re only in the app.",
  };

  /** Notes for single topics, where the website's steps differ from the app's. */
  const TOPIC_NOTES = {
    "find-your-way-around": "More opens your Sanctuary: settings, My Journey, the Community Grimoire, accessibility and your account.",
    "welcome-tour": "Open your Sanctuary from Today or More and choose Sign In or Create Account, or carry on as a guest. The same account works in the app.",
    "guest-or-account": "As a guest, your work stays in this browser. More → Settings → Account & Data says whether you’re signed in.",
    "sign-in-account": "Choose Sign In under More, or Sign In or Create Account in More → Settings → Account & Data.",
    "bring-guest-work": "Sign in in the browser that holds your guest work. More → Settings → Account & Data then shows Guest Sanctuary Found: choose Review Guest Data, download the guest safety backup, and choose Bring Selected Data Into My Account. Your practice tools and planned rituals can come too.",
    "how-sync-works": "More → Settings → Account & Data shows Cloud status and Last successful sync.",
    "backup-complete": "Open More → Settings → Account & Data and choose Download Complete Backup (as a guest, Download Guest Backup). Export Book of Shadows saves only your book. A file saved on the website restores in the app, and the other way round.",
    "backup-restore": "In More → Settings → Account & Data, under Restore a Backup, choose your file, then Download Pre-Restore Backup, then Merge With Existing Sanctuary.",
    "search-everything": "Use Search the Sanctuary on the Altar page or in the Grimoire.",
    "text-size-accessibility": "Open More, then Accessibility Options. The website also has a reading ruler, focus mode and a way to hide decoration.",
    "open-settings": "Open More, then Settings. Choices are grouped the same way: Identity, Appearance, Book of Shadows, My practice, Calendar & holidays, Living Library, Companion, Living Objects, and Account & Data.",
    "support-contact-policies": "Support, Privacy and Contact are linked from More and from the foot of the home page.",
    "today-main-calendar": "In More → Settings → Calendar & holidays, under Main calendar.",
    "choose-calendars": "In More → Settings → Calendar & holidays. Your choice is shared with the app when you’re signed in.",
    "own-calendar-events": "In More → Settings → Calendar & holidays, turn on Your own calendar, then use Add an event or Holidays from other calendars.",
    "today-layout": "In More → Settings → Calendar & holidays, under On Today.",
    "moon-reminders": "A browser can’t ring at a set time, so the website turns your reminders into calendar events instead. Open Reminders, choose your phases, then download the calendar file or add events to Google Calendar one by one. Your calendar does the reminding.",
    "ritual-reminders": "Open Reminders, keep “Remind me before a planned ritual” on, and download the calendar file again after you plan a new ritual.",
    "sky-to-calendar": "Open Reminders and use “Download holidays, eclipses and moon phases (.ics)”. Event settings choose all day, the exact moment or a set time, and an alert.",
    "ritual-reminders-settings": "On the website, reminder choices are kept in this browser. Open Reminders to change them, then download the calendar file again.",
    "ritual-plan-calendar": "Reminders lists your planned rituals with an Add to Google Calendar link for each, and puts them all in its calendar file.",
    "ritual-bring-device-rituals": "On the website, rituals from before you signed in come over with the rest of your guest work: More → Settings → Account & Data.",
    "practice-choose": "In More → Settings → My practice.",
    "library-my-path": "In More → Settings → Living Library, under My path.",
    "library-layers-settings": "In More → Settings → Living Library.",
    "library-companion-panel": "In More → Settings → Companion.",
    "library-living-objects": "In More → Settings → Living Objects.",
    "grimoire-mundane-mode": "In More → Settings → Book of Shadows, or with the Mundane switch on a page.",
    "grimoire-page-font": "In More → Settings → Book of Shadows.",
    "sanctuary-identity": "In More → Settings → Identity.",
    "sanctuary-account": "In More → Settings → Account & Data.",
    "sanctuary-change-password": "In More → Settings → Account & Data, under Security.",
    "sanctuary-change-email": "In More → Settings → Account & Data, under Security.",
    "sanctuary-recovery-link": "In More → Settings → Account & Data, choose Send Password Recovery Link.",
    "altar-full-screen": "Not on the website: a computer screen is already wide. On a phone, use the app.",
    "altar-widget": "Only in the app.",
    "altar-widget-cleansing": "Only in the app.",
    "community-browse": "Open More, then Community Grimoire.",
    "community-offer": "Open More, then Offer to the Sanctuary.",
    "community-my-submissions": "Open More, then My Submissions.",
  };

  // App screens and where they live on the website. Anything not listed keeps
  // its path (with a trailing slash) and is only offered if that page exists.
  const EXACT = {
    "/altar": "/altar/",
    "/grimoire": "/grimoire/",
    "/rituals": "/altar/?ritual=1",
    "/today": "/today/",
    "/more": "/?sanctuary=more",
    "/more/settings": "/?sanctuary=settings",
    "/more/account": "/?sanctuary=settings",
    "/more/backup": "/?sanctuary=settings",
    "/more/guest-data": "/?sanctuary=settings",
    "/more/delete-account": "/?sanctuary=settings",
    "/more/accessibility": "/?sanctuary=more",
    "/more/search": "/grimoire/",
    "/more/journey": "/?sanctuary=journey",
    "/more/library": "/grimoire/",
    "/more/library/closed": "/library/closed/",
    "/more/library/sourcing": "/library/sourcing/",
    "/more/support": "/more/support/",
    "/more/help": "/help/",
    "/more/community": "/grimoire/community-grimoire.html",
    "/more/community/offer": "/submit/",
    "/more/community/terms": "/submission-terms.html",
    "/more/community/mine": "/?sanctuary=submissions",
    "/rituals/reminders": "/reminders/",
    "/today/reminders": "/reminders/",
    "/more/reminders": "/reminders/",
  };

  /** Pages the website certainly has, so their links need no check. */
  const KNOWN = new Set(Object.values(EXACT));

  /** The website address for an app route, e.g. /rituals/craft/green/moon → /practice/green/moon/. */
  function siteHref(appHref) {
    if (!appHref || typeof appHref !== "string") return null;
    const path = appHref.split("?")[0].replace(/\/+$/, "") || "/";
    if (EXACT[path]) return EXACT[path];
    if (path.startsWith("/more/settings")) return "/?sanctuary=settings";
    if (path === "/rituals/craft") return "/practice/";
    if (path.startsWith("/rituals/craft/")) return `/practice/${path.slice("/rituals/craft/".length)}/`;
    return `${path}/`;
  }

  const api = { SECTION_NOTES, TOPIC_NOTES, EXACT, KNOWN, siteHref };
  global.HelpWebNotes = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
