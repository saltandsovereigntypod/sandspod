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
4. **Moon reminders** — local notifications (expo-notifications) for chosen
   phases and planned rituals; works without an account.
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
npm test           # moon, calendar and grimoire tests
npm run typecheck
```
