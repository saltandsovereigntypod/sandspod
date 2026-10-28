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
    "getting-started": "On the website, the same tabs sit in the bar at the top of the page on a computer and along the bottom on a phone: Today, Altar, Practice, Coven and More, with the podcast under the logo. Where a step says tap, click.",
    altar: "On the website, the Altar is its own page (Altar in the bar). Most tools are there under the same names; a few, like turning the phone sideways or the home screen widget, belong to the app alone.",
    grimoire: "On the website, the Grimoire opens your own book with the Living Library shelves beside it. Anyone can read the Living Library itself under More → Living Library.",
    rituals: "On the website, Practice → Rituals holds the same planner, premade book, journal and Your moon. A ritual can also be run at the altar’s Ritual Companion.",
    covens: "On the website, covens are under Coven in the bar, with the same pages, altars, messages and programs. Where a step says tap, click.",
    widgets: "Widgets live on a phone’s home screen, so they’re only in the app.",
  };

  /** Notes for single topics, where the website's steps differ from the app's. */
  const TOPIC_NOTES = {
    "find-your-way-around": "More opens your Sanctuary: My Journey, the Community Grimoire and Settings, which holds notifications and reminders, accessibility, calendars, deities and your account.",
    "replay-welcome-tour": "The website opens a welcome on Today the first time you visit: one page for each main part of the Sanctuary. Choose “Watch the welcome again” at the top of How to. The Altar and the Grimoire also have their own “How This Works”.",
    "welcome-tour":"Open your Sanctuary from Today or More and choose Sign In or Create Account, or carry on as a guest. The same account works in the app.",
    "guest-or-account": "As a guest, your work stays in this browser. More → Settings → Account & Data says whether you’re signed in.",
    "sign-in-account": "Choose Sign In under More, or Sign In or Create Account in More → Settings → Account & Data.",
    "ways-to-sign-in": "Open More → Settings → Account & Data and find Ways to Sign In. Choose Add Apple, Add Google or Add Email and Password there, or Remove beside one you no longer use.",
    "bring-guest-work": "Sign in in the browser that holds your guest work. More → Settings → Account & Data then shows Guest Sanctuary Found: choose Review Guest Data, download the guest safety backup, and choose Bring Selected Data Into My Account. Your practice tools and planned rituals can come too.",
    "how-sync-works": "More → Settings → Account & Data shows Cloud status and Last successful sync.",
    "backup-complete": "Open More → Settings → Account & Data and choose Download Complete Backup (as a guest, Download Guest Backup). Export Book of Shadows saves only your book. A file saved on the website restores in the app, and the other way round.",
    "backup-restore": "In More → Settings → Account & Data, under Restore a Backup, choose your file, then Download Pre-Restore Backup, then Merge With Existing Sanctuary.",
    "search-everything": "Use Search the Sanctuary on the Altar page or in the Grimoire.",
    "text-size-accessibility": "Open More, then Settings, then Accessibility. The website also has a reading ruler, focus mode and a way to hide decoration.",
    "open-settings": "Open More, then Settings. Choices are grouped the same way as in the app: You, Your practice, Screens, Notifications & reminders, Accessibility, Covens & privacy, and Account & data. Most choices save themselves; the rest have Save Changes at the foot.",
    "send-a-correction": "On the website, “Send a note” sits at the foot of the same pages. The full note is under More → Help → A note on our research, and linked from About on the home page.",
    "support-contact-policies": "Support, Privacy and Contact are linked from More and from the foot of the home page.",
    "today-main-calendar": "In More → Settings → Calendars & holidays, under Main calendar.",
    "choose-calendars": "In More → Settings → Calendars & holidays. Your choice is shared with the app when you’re signed in.",
    "own-calendar-events": "In More → Settings → Calendars & holidays, turn on Your own calendar, then use Add an event or Holidays from other calendars.",
    "today-layout": "In More → Settings → Today, or with Customise Today at the foot of Today.",
    "today-customise": "Choose Customise Today at the foot of Today, or open More → Settings → Today.",
    "calendar-count-by-moon": "In More → Settings → Calendars & holidays, under Count my days by.",
    "calendar-old-calendars": "In More → Settings → Calendars & holidays, under Also show.",
    "practice-my-deities": "In More → Settings → My deities.",
    "set-location": "On the website your place is set on The sky today (Today → Sky & Lore), and kept in this browser. The hemisphere is in More → Settings → Location & hemisphere.",
    "reminders-everything": "Open More → Settings → Notifications & reminders (the Reminders page). Everything is on one page, with a line for each kind at the top. The website turns your choices into calendar events, since a browser can’t ring at a set time. Holidays, tending, planning, quiet hours and the pause are the same choices as in the app.",
    "holiday-reminders": "Open Reminders, then Holidays. Each calendar opens to show its holidays, with All, None and Find a holiday. Download the calendar file again after you change them.",
    "tending-reminders": "Open Reminders, then Tending. Your altars and stones are read from your account (or this browser), and the calendar file holds the next two weeks of tending: download it again now and then.",
    "planning-reminders": "Open Reminders, then Ritual planning. Your covens are listed once you’re signed in.",
    "quiet-reminders": "Open Reminders, then Quiet hours and pause. Quiet hours and the pause hold in the calendar file too; gathering a busy day into one note is for the app’s notifications.",
    "moon-reminders": "A browser can’t ring at a set time, so the website turns your reminders into calendar events instead. Open Reminders, choose your phases, then download the calendar file or add events to Google Calendar one by one. Your calendar does the reminding.",
    "ritual-reminders": "Open Reminders, keep “Remind me before a planned ritual” on, and download the calendar file again after you plan a new ritual.",
    "sky-to-calendar": "Open Reminders and use “Download holidays, eclipses and moon phases (.ics)”. Event settings choose all day, the exact moment or a set time, and an alert.",
    "ritual-reminders-settings": "On the website, the moon and ritual reminder choices are kept in this browser. Open Reminders to change them, then download the calendar file again.",
    "ritual-plan-calendar": "Reminders lists your planned rituals with an Add to Google Calendar link for each, and puts them all in its calendar file.",
    "ritual-bring-device-rituals": "On the website, rituals from before you signed in come over with the rest of your guest work: More → Settings → Account & Data.",
    "practice-choose": "In More → Settings → Your crafts.",
    "library-browse": "Open More, then Living Library. It’s open to everyone, signed in or not.",
    "library-add-practice": "On the website, My Practice is written in your Book of Shadows. Sign in, open the entry in the Living Library and choose Open in your Book of Shadows.",
    "library-my-path": "In More → Settings → Living Library, under My path.",
    "library-layers-settings": "In More → Settings → Living Library.",
    "library-companion-panel": "In More → Settings → Altar, under About sheet.",
    "library-living-objects": "In More → Settings → Altar, under About sheet: its living state.",
    "grimoire-mundane-mode": "In More → Settings → Grimoire, or with the Mundane switch on a page.",
    "grimoire-page-font": "In More → Settings → Grimoire.",
    "sanctuary-identity": "In More → Settings → Identity.",
    "sanctuary-account": "In More → Settings → Account & Data.",
    "sanctuary-change-password": "In More → Settings → Account & Data, under Security.",
    "sanctuary-change-email": "In More → Settings → Account & Data, under Security.",
    "sanctuary-recovery-link": "In More → Settings → Account & Data, choose Send Password Recovery Link.",
    "altar-full-screen": "Not on the website: a computer screen is already wide. On a phone, use the app.",
    "altar-widget": "Only in the app.",
    "altar-widget-cleansing": "Only in the app.",
    "altar-open-saved": "On the Altar page, choose Library to open My Altars. At the top, switch between Personal, your own altars, and Coven, the altars you tend with your covens. The page remembers the one you used last.",
    "covens-altars": "Open your coven and choose the Altars tab, or on the Altar page choose Library and then Coven: every coven altar you can see, under each coven’s name, with Start a coven altar. “Open the altar” opens it in the Altar page’s own editor, with a bar over it saying who else is there and whether your changes are saved. “Keep a copy” (or Save) puts a copy among your own altars. Keepers choose who tends it under “Who tends it”. The Altar page fills the window, so there’s no full screen button.",
    "covens-chat": "Open your coven and choose the Messages tab: the coven’s chat first, then your conversations. “New message” starts one, and Details mutes, adds people or leaves. Phone notifications are chosen in the app; a browser can’t ring when you’re away.",
    "covens-petitions": "Open your coven and choose the Petitions tab. “Open its altar” opens the petition’s altar on the Altar page.",
    "covens-review-members": "Open your coven and choose the Members tab; open a person to change their position, pause, remove or ban them. The head hands on leadership there too, choosing what they keep.",
    "covens-daughter": "Open your coven and choose the Daughter covens tab, then Found a daughter coven. Its head answers under Requests to found on the same tab.",
    "covens-share-daughters": "Open your coven and choose the Daughter covens tab, then Share with your daughter covens. In a daughter coven, From your mother coven is on the same tab.",
    "covens-successor": "Open your coven and choose the Manage tab: Leadership is near the foot. Elders find The head can’t be reached under My standing.",
    "covens-rituals": "Open your coven and choose the Rituals tab. A ritual’s page says which altar it’s held at; those who lead choose another and who may tend it at each step.",
    "community-browse": "Open More, then Community Grimoire.",
    "community-offer": "Open More, then Offer to the Sanctuary.",
    "community-my-submissions": "Open More, then My Submissions.",
  };

  // App screens and where they live on the website. Anything not listed keeps
  // its path (with a trailing slash) and is only offered if that page exists.
  const EXACT = {
    "/altar": "/altar/",
    "/grimoire": "/grimoire/",
    "/rituals": "/rituals/",
    "/coven": "/covens/",
    "/coven/new": "/covens/new/",
    "/coven/moderation": "/covens/moderation/",
    "/today": "/today/",
    "/more": "/?sanctuary=more",
    "/more/settings/practice": "/practice/#choose",
    "/more/settings/calendar": "/today/calendar/",
    "/more/settings": "/?sanctuary=settings",
    "/more/account": "/?sanctuary=settings",
    "/more/backup": "/?sanctuary=settings",
    "/more/guest-data": "/?sanctuary=settings",
    "/more/delete-account": "/?sanctuary=settings",
    "/more/accessibility": "/?sanctuary=more",
    "/more/search": "/grimoire/",
    "/more/journey": "/?sanctuary=journey",
    "/more/library": "/library/",
    "/more/library/closed": "/library/closed/",
    "/more/library/sourcing": "/library/sourcing/",
    // The app's Living Library is a section of the Grimoire; the website's is its public Library.
    "/grimoire/library": "/library/",
    "/grimoire/library/closed": "/library/closed/",
    "/grimoire/library/sourcing": "/library/sourcing/",
    "/rituals/divination/meanings": "/grimoire/",
    "/more/support": "/more/support/",
    "/more/research": "/more/research/",
    "/more/settings/deities": "/more/settings/deities/",
    "/more/help": "/help/",
    "/more/community": "/grimoire/community-grimoire.html",
    "/more/community/offer": "/submit/",
    "/more/community/terms": "/submission-terms.html",
    "/more/community/mine": "/?sanctuary=submissions",
    "/rituals/reminders": "/reminders/",
    "/today/reminders": "/reminders/",
    "/more/reminders": "/reminders/",
    "/more/settings/notifications": "/reminders/",
    "/more/settings/location": "/today/sky/",
    "/more/settings/today": "/?sanctuary=settings&settings=today",
  };

  /** Pages the website certainly has, so their links need no check. */
  const KNOWN = new Set(Object.values(EXACT));

  /** The website address for an app route, e.g. /rituals/craft/green/moon → /practice/green/moon/. */
  function siteHref(appHref) {
    if (!appHref || typeof appHref !== "string") return null;
    const path = appHref.split("?")[0].replace(/\/+$/, "") || "/";
    // Today's, Coven's and Altar's tabs: a link to one (/today?section=horizon) opens it on the website too.
    if (path === "/today" || path === "/coven" || path === "/altar") {
      const asked = new URLSearchParams(appHref.split("?")[1] || "");
      const keep = new URLSearchParams();
      for (const name of ["tab", "section"]) if (asked.get(name)) keep.set(name, asked.get(name));
      return `${EXACT[path]}${keep.toString() ? `?${keep}` : ""}`;
    }
    if (EXACT[path]) return EXACT[path];
    if (path.startsWith("/more/settings")) return "/?sanctuary=settings";
    // One Library entry ("/more/library/traditional:herb:rosemary") on its public page.
    const entry = path.match(/^\/(?:more|today|rituals|grimoire|altar)\/library\/([^/]+)$/);
    if (entry && !["closed", "sourcing", "practice"].includes(entry[1])) return `/library/entry/?entity=${encodeURIComponent(decodeURIComponent(entry[1]))}`;
    // Divination and the sigil maker, open to every practice.
    const divination = path.match(/^\/rituals\/divination(?:\/([^/]+))?$/);
    if (divination) {
      const page = divination[1] || "";
      if (!page) return "/divination/";
      return ["draw", "edit", "spread"].includes(page) ? `/divination/${page}/` : `/divination/reading/?id=${encodeURIComponent(decodeURIComponent(page))}`;
    }
    if (path === "/rituals/sigil") return "/sigil/";
    if (path === "/rituals/craft") return "/practice/";
    if (path.startsWith("/rituals/craft/")) return `/practice/${path.slice("/rituals/craft/".length)}/`;
    return `${path}/`;
  }

  const api = { SECTION_NOTES, TOPIC_NOTES, EXACT, KNOWN, siteHref };
  global.HelpWebNotes = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
