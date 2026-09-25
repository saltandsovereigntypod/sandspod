# Salt & Sovereignty app — build plan

A paid, one-time-purchase iPhone and Android app that is a cleaner, calmer
version of **My Sanctuary** from the website. The website stays free and
unchanged. Both use the same Supabase projects, so one account works in both
and nothing saved on the website is lost.

Approved design: the "Salt & Sovereignty App" design canvas (Welcome, Today,
Altar, Grimoire page, Rituals, Planner, More).

## Design rules

- **Beautiful, simple, powerful.** One main thing per screen; extra options sit
  one tap away. The approved Today screen sets the level of detail.
- **Vertical scrolling only.** No sideways carousels or scroll rows; chips wrap.
- **The witchcore look carries over:** forest greens, gold, cream; Cormorant
  Garamond for display, Source Serif 4 for text (`src/theme.ts`).
- **Everything connects.** A ritual knows its altar, grimoire page, ingredients
  and date; any of them is one tap from the others.
- 44 pt minimum touch targets, real accessibility labels, readable contrast.

## Navigation

`Today · Altar · Grimoire · Rituals · More`, plus Welcome and Sign in before
the tabs. Guests keep everything on the device; signing in syncs it.

| My Sanctuary on the website | In the app |
|---|---|
| Welcome, sign in, guest mode | Welcome + Sign in screens |
| My Digital Altar | Altar tab |
| My Book of Shadows | Grimoire tab |
| Completed Rituals form | Rituals tab: spell builder, planner, journal |
| — | Today tab: moon, reminders, what's next |
| Community Grimoire, Offer, My Submissions | More → Community |
| Living Library | Linked from every ingredient; More → Library |
| Settings, backup, delete account | More → Settings / Backup |

## Tech

- Expo SDK 57, React Native, TypeScript, Expo Router (`src/app/`).
- Supabase JS with sessions stored on the device (`src/lib/supabase.ts`).
- Moon phases computed on the device with Meeus' algorithms, so Today works
  offline (`src/lib/moon.ts`, tested against published phase times).
- Builds and store submission through EAS (no Mac required).

## Milestones

1. **Foundation** *(this PR)* — project, theme, fonts, tab bar, Welcome,
   Sign in, guest mode, Today with the live moon, weekday meaning and
   the next moon phase and sabbat. Other tabs are placeholders.
2. **Grimoire** — books, sections, pages and blocks (`grimoire_books`,
   `grimoire_sections`, `grimoire_pages`, `grimoire_blocks`,
   `grimoire_page_links`).
   - *2a, done:* table of contents and parchment page reader for every block
     type the website writes, ritual-journal details (date, moon, length,
     altar items), linked pages, offline copy on the phone, pull to refresh.
   - *2b, done:* writing and editing pages the way the website does. Edit a
     page's title and every element the website edits (paragraph, heading,
     note, lists, ingredients, correspondence, image, page link, divider);
     add, reorder and remove elements; start pages from the website's
     templates in any section; link pages; return pages to ashes; add,
     rename and delete sections. Rows match the website's columns,
     `block_type`s, `rich_content` HTML and `sort_order`. Rich text is edited
     as light markup (`**bold**`, `*italic*`, `__underline__`, `[link](url)`)
     and saved as the website's HTML. Changes show at once, are kept on the
     phone, and are sent in order when online; anything the server refuses is
     kept until retried or discarded. Guests still need to sign in, as on the
     website.
   - *Later:* reorder pages and sections, move a page to another section,
     add a template to an existing page, a guest book that syncs on sign-in.
3. **Rituals** — journal from `ritual_sessions` / `ritual_session_steps`,
   templates from `ritual_templates` / `ritual_template_steps` /
   `user_rituals`, links via `ritual_links`. Then the planner and spell
   builder, which suggest nights from moon phase and weekday and ingredients
   from the Library. Today's "next working" card fills in here.
   - *Done:* the Rituals tab (`src/app/(tabs)/rituals/`) with the journal
     (`user_rituals`, read, write, edit, delete, as the website's ritual
     journal), templates (view, write, edit, archive; saved like the altar's
     template editor, including its Book of Shadows page), stepping through a
     ritual (timers, pause, skip, timed steps; saved to `ritual_sessions` /
     `ritual_session_steps` so a ritual begun here shows at the website's
     altar and the other way round), the planner (best nights from moon tide
     and weekday ruler for 11 intentions; Library ingredients), the spell
     builder (intention + Library ingredients + your words become steps to
     begin, plan, or keep as a template), and one-tap links from every ritual
     to its grimoire page, altar, template, date and ingredients. Offline copy
     and pull to refresh like the grimoire; sessions that can't sync wait on
     the phone and are sent later.
   - Guests keep sessions and journal entries on the phone, as on the website;
     templates need an account there, so here too. After signing in, the app
     offers to bring the phone's guest rituals into the account.
   - Today's "next working" card shows the next plan or the ritual under way.
   - Plans are kept on the phone: the ritual tables have no "planned" record
     yet (a `ritual_plans` table would let them sync).
4. **Moon reminders** — local notifications (expo-notifications) for chosen
   phases and planned rituals; works without an account.
   - *Done:* settings at **`/rituals/reminders`** (from the Rituals tab and
     Today's moon button; More can link there too). Choose phases, the hour,
     the evening before, and how long before a planned ritual. The next two
     months are scheduled on the phone (at most 60, under iOS's 64 limit) and
     topped up each time the app opens. The web app explains that reminders
     ring in the phone app.
   - *Add to calendar* (optional, off unless chosen): a planned ritual, and
     optionally the chosen moon phases and the sabbats, go into a phone
     calendar with expo-calendar; editing or removing the plan updates or
     removes the event. expo-calendar isn't in Expo Go on SDK 57, so Expo Go
     opens Google Calendar instead; development and store builds write to the
     calendar. The web app offers an `.ics` download and a Google Calendar link.
5. **Altar** — the full drag, rotate, layer, light and dress experience from
   `saved_altars`, `custom_cabinet_items`, `custom_altar_backgrounds`, reusing
   the website's artwork in `assets/altar/`. The biggest single piece.
   - *5a, done:* Altar tab lists saved altars (signed in: `saved_altars`,
     with an offline copy; guests: the website's own localStorage keys and
     shapes) and opens them on a 16:9 canvas that matches the website to the
     pixel (same `leftPercent` / `topPercent` / `sizePercent` maths, same
     box heights, tested against positions measured on the website). Drag,
     pinch to resize, twist to rotate (buttons for all of it too, so it works
     with a mouse on the web), flip, lock, glow, duplicate, remove, layer
     order, undo/redo, zoom and look around. Light and snuff candles (burn
     history kept in Living Object State), dress candles with loose herbs and
     oils (the website's overlays), change background (built-in plus your
     uploads), and add from the cabinet (built-in artwork, your custom
     cabinet items and your image overrides). Save updates the altar you
     opened or saves a new one; unsaved work is kept as the working draft.
     Artwork is bundled as small WebP copies (`app/assets/altar`, ~3 MB,
     rebuilt by `scripts/build-altar-assets.py`); anything else loads from
     saltandsovereignty.com.
   - *5b, next:* uploading custom cabinet images and backgrounds from the
     phone (needs expo-image-picker), creating custom cabinet items, groups
     (existing groups are kept and move together, but can't be made yet),
     crystal / deity / apothecary tending actions, and plaques.
6. **More** — Community Grimoire, offerings and replies
   (`community_submissions`, `community_submission_messages`), Library,
   settings (`user_settings`), backup and restore, account deletion (the
   existing `delete-account` function; Apple requires it in-app).
   - *Done:* More is a menu (`src/app/(tabs)/more/`) leading to:
     - **Community**: published pages with search and type filters, Field
       Notes and offering a Field Note; making an offering (guests too, as on
       the website) with the Submission Terms; My submissions with the
       reviewer's response and the reply thread. Same queries and row shapes
       as `js/community-grimoire.js` / `js/submissions.js`.
     - **Living Library**: the website's Traditional Library (copied by
       `scripts/sync-traditional-library.mjs`), with your My Practice notes
       from `living_library_entries` laid over it; search, type filters,
       pages that follow your Living Library settings, and pairing chips that
       open the paired entry. Other features use `src/lib/library` (see its
       `index.ts`), e.g. for ingredient suggestions.
     - **Settings**: identity, Book of Shadows and Living Library settings,
       read from and upserted to `user_settings` exactly as the website does
       (guests keep them on the device). Altar, Companion and Living Object
       settings are kept untouched for the Altar milestone.
     - **Backup and restore**: format `salt-and-sovereignty-sanctuary-backup`
       v1, ported from `js/sanctuary-backup.js` and tested against the
       website's own module in both directions. Merge-only restore after a
       required safety backup, with resumable stages. Phones use the share
       sheet and document picker; the web build downloads and uploads.
     - **Account**: sign in or out, and deletion with a fresh backup, a
       recent sign-in and the typed phrase, calling `delete-account`.
     - Marked slots in `more/index.tsx` for **Moon reminders** and the
       **Altar**; set their `href` when those milestones merge.
   - *Needs the owner / server before release:*
     - `delete-account` isn't deployed on sandspod-dev, and it only accepts
       requests with an allowed `Origin`. Phones send none, and
       `https://app.saltandsovereignty.com` isn't on its list. Deploy it,
       allow those requests (e.g. through `ACCOUNT_DELETE_ALLOWED_ORIGINS` plus
       a rule for no-Origin requests that still carry a bearer token), test
       it with a throwaway account, then build with
       `EXPO_PUBLIC_ACCOUNT_DELETION=on`. Until then the app explains that
       deletion isn't switched on and deletes nothing.
     - Website bug: its backup validator requires an `id` on every
       `user_settings` row, but that table is keyed by `user_id` (which
       backups strip), so the website refuses its own signed-in backups. The
       app accepts them. One-line fix in `validateIds` in
       `js/sanctuary-backup.js`: skip `user_settings`. Its account restore
       also can't tell that a settings row already exists; the app keeps the
       existing settings instead.
     - Guest restore writes the website's guest storage keys. The Altar and
       Rituals guest stores should read the same keys so restored guest work
       shows up there.
7. **Store release** — app icon, screenshots, privacy details, TestFlight and
   Play internal testing, then paid listings on both stores.

## Needed from the owner

- **D-U-N-S number for the LLC** (free, can take a couple of weeks), then an
  **Apple Developer** account ($99/yr) and a **Google Play** developer account
  ($25 once), both enrolled as the organization.
- **An app icon**: a 1024×1024 square PNG with no text. The website's icon
  says "Podcast" and is circular, so it can't be reused as-is.
- ~~Supabase access~~ (connected). Real data lives in **sandspod-dev**; the
  "main" project is empty. Decide before launch whether to move to the main
  project; if so it needs the schema and its publishable key.
- A **privacy policy URL** and **support email** for the store listings.
- A price for the app.

## Running it

```bash
cd app
npm install
npm start          # scan the QR code with Expo Go, or press w for web
npm test           # moon, calendar, grimoire, ritual and reminder tests
npm run typecheck
```
