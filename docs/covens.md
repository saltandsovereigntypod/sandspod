# Covens

Digital covens on the website: a discoverable directory (`/covens/`), founding a coven (`/covens/new/`), each coven's home (`/covens/coven/?c=<address>`), the site moderators' console (`/covens/moderation/`) and the community guidelines (`/covens/guidelines/`). The database is `supabase/migrations/20261023000000_covens.sql`.

## Who can do what

The database decides; the pages only mirror it (`covens/coven-logic.js`).

- **Anyone**, signed in or not, can browse active covens with their public pages (creed, rules, requirements, agreements) and positions.
- **Taking part** needs a community profile (`coven_profiles`): a display name, optional pronouns and bio, and the 18+ and guidelines confirmations. The 18+ check is a self-attestation; no date of birth is stored.
- **Joining**: open covens are joined directly; application covens review an application with the coven's own questions (`covens.application_questions`). Either way, every agreement (`coven_documents.requires_signature`) must be signed first.
- **Agreements are versioned.** Editing an agreement's title or words bumps its version; members must sign the new version before they can speak in the gathering or tend the altar again ("good standing", `coven_in_good_standing`).
- **Positions** (`coven_ranks`) belong to each coven. A position's `level` orders seniority; `can_manage` (edit the coven, its pages and positions), `can_review` (applications and advancement) and `can_moderate` (remove messages, pause or remove members) are its powers. The founder has every power. Members apply to rise to positions marked `open_to_applications`. Reviewers can grant positions below their own that carry no powers; leaders grant up to their own level.
- **The head decides everything.** The founder (the coven's head) has every power and decides what each position can do. Besides the powers above, positions carry `can_lead_rituals`, `can_schedule_rites`, `can_write_book`, `can_approve_book`, `can_manage_programs` and `can_view_progress`, and, from `20261028000000_coven_altars.sql`: `can_start_altars` (start new altars; on by default), `can_tend_altars` (tend altars kept for chosen people, the main ritual altar among them), `can_keep_altars` (keep every altar: choose who tends it, lock it, clear it away) and `can_chat` (talk in the chat; on by default). `coven_permission` maps each to its permission name (`start_altars`, `tend_altars`, `keep_altars`, `chat`).
- **Site moderators** are `user_roles.role` `admin` or `moderator` (`is_community_moderator()`). They can read and act on every coven, chat, altar and report, pause or archive covens, and ban accounts from all covens (`community_bans`). Admins name moderators from the moderation console (`set_community_moderator`).

## Coven altars

From `20261028000000_coven_altars.sql`, a coven's altars are whole altars: the same document the personal altar saves (`saved_altars.altar_data`), with every feature of it (the cabinet, candles that burn down, offerings, workings, layouts and the rest), shared live. In the app, `AltarEditor` (`app/src/components/altar/AltarEditor.tsx`) is the personal altar editor; given `shared`, it opens a coven altar instead (`app/src/app/(tabs)/coven/c/[slug]/altars/[altarId]/`).

- **Many altars.** Each coven has one main ritual altar (`coven_altars.is_main`, made for every coven, kept by its head) and any member whose position may starts more (`create_coven_altar`). Keepers clear an altar away (`archive_coven_altar`) and can bring it back.
- **Stored so people can tend it at once.** The altar's scene (background, groups, other fields) is the `coven_altars` row; each object on it is its own `coven_altar_objects` row keyed by its `altarObjectId`, so two people moving two candles never overwrite each other. Objects may only show the site's own pictures or pictures members uploaded to the `user-assets` bucket (`coven_altar_data_ok`).
- **Live.** `app/src/lib/covens/altarSync.ts` sends each change to the others at once over the altar's realtime channel (broadcast), writes it a moment later, and folds others' changes in object by object (`altarDoc.ts`, pure and tested). Presence shows who is at the altar. A refused write puts the altar back as it is.
- **Who tends it** (`coven_altar_can_edit`, always a member in good standing): during a live coven ritual held there, the ritual's leader and the altar's keepers, plus whoever each step allows (`coven_ritual_steps.altar_access`: the step's person, everyone, or only the leader; `set_coven_ritual_altar`). Otherwise its keepers (the head, positions that keep altars, and whoever started it), and as `edit_mode` says: everyone, those chosen (positions that tend altars, and the people and positions in `coven_altar_editors`), or no one else. A locked altar is its keepers' alone. `coven_altar_access` says why not, for the screen.
- **Rituals.** A ritual is held at the main altar unless `coven_rituals.altar_id` names another. A step's altar action (your candle, an offering, lighting or snuffing all) is set on that altar from the ritual screen (`ritualAltar.ts`).
- **The website** still shows the earlier coven altar (`coven_altar_items`) until it moves to these altars too.

## Live chat

`coven_messages` and `coven_altar_items` are in the `supabase_realtime` publication (and `coven_altars`, `coven_altar_objects` and `coven_altar_editors`). The coven page opens one channel per coven (`CovenData.live`) for message and altar changes plus presence (who is here, and on which tab). Row-level security still decides who receives each change.

In the app, Messages is a button on every coven screen, with how many messages you haven't read (also on the Coven tab). It opens the coven's chat and your own conversations, which read like a phone's messages (bubbles, yours on the right, `app/src/lib/covens/thread.ts`).

- **Conversations** (`20261029000000_coven_conversations_petition_altars.sql`): one-to-one chats (`coven_open_direct`, one per pair, `direct_key`) and named groups (`coven_create_group`, `coven_add_to_group`, `coven_leave_conversation`) inside a coven. Their messages are `coven_messages` rows with a `conversation_id`, seen only by the conversation's members (and site moderators). Messages without one are the whole coven's chat; the website's gathering shows only those. Each member's `last_read_at` and `muted` are kept in `coven_conversation_members` (`coven_set_conversation`); the coven chat's read time is kept on the device (`app/src/lib/covens/unread.ts`).
- **Phone notifications**: the app registers an Expo push token (`register_push_token`, `push_tokens`) when a member turns them on, and each member chooses per coven in `coven_chat_settings` (`notify_coven`, `notify_direct`). After sending, the app calls the `coven-notify` edge function, which sends to everyone who should hear (not the sender, not muted, not blocking them, notifications on) and signs off tokens Expo says are gone. Push needs a store build that includes `expo-notifications` with push credentials; older builds keep the choices and start notifying after they update. Only positions that may chat (`can_chat`) can send. Messages are rate-limited (8 per 30 seconds) and can be edited for a day. Removing a message clears its words; a report keeps its own copy (`coven_reports.snapshot`). Blocking (`user_blocks`) hides that person's messages from you only.

Altar items use only the site's own altar pictures (a check constraint on `image`). Candles burn down over `burn_minutes` from `lit_at`; the database sets `lit_at`/`lit_by` itself, and an altar holds at most 80 items.

## Coven rituals

The Rituals tab (`covens/coven/rituals.js`, `supabase/migrations/20261024000000_coven_rituals.sql`) holds rituals the coven performs together. Each step (`coven_ritual_steps`) belongs to one member (`assigned_user_id`), to everyone in a position (`assigned_rank_id`), or, with neither, to the whole coven.

- **Who leads:** the founder, positions that lead or moderate the coven, and positions given `can_lead_rituals` (the `lead` permission). They plan rituals (`save_coven_ritual`, which replaces the steps in one go), begin them, move back a step or end them.
- **Running:** a live ritual's `current_step_id` is shared over Realtime. The person (or people) a step belongs to see its full instructions and words to speak, and an "I've finished this step" button (`finish_coven_ritual_step`) that moves everyone on. On every coven tab, a banner and the page title tell a member when the current step is theirs.
- **Starting from a personal ritual:** the planner can copy the steps of one of your own saved rituals (`ritual_templates` / `ritual_template_steps`); each copied step starts as the whole coven's until you give it to someone.
- **Only members in step can be given a part:** someone who hasn't signed the coven's current agreements (or is banned) can't be given a step (`save_coven_ritual` refuses it; `20261025000000_coven_ritual_signed_parts.sql`). The planner lists them greyed out as "needs to re-sign" (`coven_ritual_people`), and a step still given to them must be reassigned before the ritual can be saved. Steps given to a position or the whole coven are unaffected; at the ritual, a member who hasn't re-signed sees why they can't finish their step.
- Rituals can only be changed through the functions; there are no direct write policies. A ritual can't be edited while it's under way. If a position is deleted, steps given to it become the whole coven's.

## Rites, altar actions, the Book of Shadows and petitions

`supabase/migrations/20261026000000_coven_rites_book_petitions.sql`, with `covens/coven/rituals.js`, `book.js` and `petitions.js`.

- **Rites on the calendar.** A ritual can be marked as a full or new moon, an esbat, a sabbat or another gathering; the planner suggests the coming moons and sabbats (from the site's moon logic, `js/core/today.js`, loaded only when the planner opens). Only positions the coven's head gives `can_schedule_rites` (and leaders) put rites on the calendar or move them; other ritual leaders save drafts for them. Members answer going / maybe / can't make it (`rsvp_coven_ritual`). Reminders: on the website, a "coming up" notice on every coven tab for rites in the next day and an "Add to my calendar" file with a reminder an hour before; in the app, phone reminders.
- **Altar actions in steps.** Any step can light a candle, place something from the altar cabinet, light every candle, or put the candles out (`coven_ritual_steps.altar_*`). It isn't automatic: when the ritual reaches the step, whoever it belongs to (or the ritual's leader) presses the button (`perform_coven_step_action`). On a whole-coven candle step each member lights their own (`coven_ritual_step_marks`), and the candles gather in a circle. The shared altar is shown live beside a ritual under way.
- **Book of Shadows.** Positions with `can_write_book` write drafts and suggest changes; those with `can_approve_book` (and leaders) publish them, and their own writing publishes straight away. Members read published pages only (`coven_book_pages`); drafts (`coven_book_drafts`) are seen by their authors and approvers.
- **Petitions.** A member asks the circle to hold a petition (`ask_coven_petition`), which makes it its own coven altar (`coven_petitions.altar_id`, `extra.petition_id`, tended by members, kept by the asker). The app sets out its candle, lit in the petition's colour, with the petition paper at its foot (`app/src/lib/covens/petitionAltar.ts`). Members tend it once every twelve hours, with a few words if they like (`tend_coven_petition`); in the app each tending lights a small candle in their name beside it and relights the petition's candle. The asker (or a coven moderator) marks it answered or closes it (`close_coven_petition`), and its altar is cleared away. Petitions no longer touch the main ritual altar.

## Initiation, training and mentors

Migration: `supabase/migrations/20261027000000_coven_programs.sql`; ready-made programs `…20261027000100_coven_program_templates.sql`, generated by `scripts/build-coven-program-templates.mjs` (run with `node --experimental-strip-types`).

- **Programs** (`coven_programs`, kind `initiation` or `training`) are stages (`coven_program_stages`) of tasks (`coven_program_tasks`).
  - **Tasks:** each is study, practice, reflection, ritual, attending a rite, a Book of Shadows page, an oath, a meeting, service or other. A task has instructions and resources, how many times it's done, an optional holiday it belongs to, and whether a written response is asked for. It's signed off by the person themselves, their mentor, or a program manager.
  - **Stages:** a stage can ask for a least time (366 days for a year and a day) and says who confirms it's passed: the mentor (or a manager), a manager only, or the person once every required task is signed off. Managers may pass a stage early.
  - **Graduation:** a program can raise those who finish it to a position. Only the coven's head chooses that position.
- **Who:**
  - The coven's head (the founder, or a position that leads the coven) chooses who manages programs (`can_manage_programs`) and who sees everyone's progress (`can_view_progress`). These are given by position or by name (`coven_grants`, `set_coven_grant`).
  - Program managers design programs (`save_coven_program`, `copy_coven_program_template`) and assign them to a person or a whole position (`assign_coven_program`). Anyone who later holds the position is enrolled by a trigger on `coven_members`.
  - Program managers also assign mentors (`set_coven_mentor`; one mentor per member per coven) and sign off work (`check_coven_task`, `pass_coven_stage`).
  - Members log their work (`record_coven_task`) and may step away from a program (`set_coven_enrollment_status`). Programs marked "anyone may begin it" can be begun by any member (`start_coven_program`).
- **Who sees what:** progress (`coven_program_enrollments`, `_progress`, `_stage_passes`) is seen by the person, their mentor, those who see everyone's progress, and site moderators. Draft programs are seen only by program managers.
- **Ready-made programs:** an initiation (a year and a day: threshold, foundations, turning the year with every festival of the calendar, service, dedication and initiation) and an eight-module training program for each holiday calendar. Those for the coven's own calendar are suggested first.
- **Shared rules:** `app/src/lib/covens/programs.ts` (summaries, who may sign off, the editor's checks, the coven calendar) and `app/src/lib/covens/today.ts` (Today's coven section). Both are built into `js/core/covens.js` for the website (`node scripts/build-core.mjs covens`).

## The coven's practice calendar

`covens.practice_traditions`, `practice_holidays` (single holidays, when a calendar isn't kept whole) and `practice_custom` (the coven's own days) are the same choices as a person's Settings → Calendar, set by those who lead the coven (Manage → Practice calendar). They show on the coven's page and members' Today, the ritual planner suggests them for rites, and the ready-made programs for them come first.

## Navigation

The app's and the website's tabs are Today · Altar · Practice · Coven · More. Practice holds the Grimoire and Rituals, with a Grimoire | Rituals switch at the top of both; the tab reopens whichever was used last (`app/src/lib/practiceSection.ts`, `js/site-nav.js`). In the app, covens live under `/coven` (a coven at `/coven/c/<address>`). Old `/more/covens/…` links, including rite reminders set before the move, redirect there. The podcast is the website's logo.

## In the app

The iOS and Android app (the Coven tab, `app/src/app/(tabs)/coven/`) uses the same tables and database functions, so a coven is the same coven on both. It ships as an over-the-air update: no new native modules or packages.

- **What's there**: everything a member, leader, reviewer or site moderator does on the website. That covers the directory and your covens, your coven profile (with the 18+ and guidelines confirmation), and founding a coven. Each coven has its page (about, creed and other pages, positions), joining, applying and signing agreements (including re-signing a changed one), and My path (asking to rise to a position, leaving). It also has the gathering and rituals and rites: RSVP, your turn, the step's altar action and finishing a step, while leaders start, step back or ahead, and end. Then come the shared altar (set candles and offerings, light, snuff, move), the Book of Shadows (read, write, approve) and petitions (ask, tend, close). Members can be given a position, paused, removed, banned, or handed leadership. Review covers applications and requests to advance. Manage covers details and the altar setting, pages and agreements, positions and their powers, application questions, and archiving. Reporting and blocking work everywhere they do on the website.
- **Routes**: a coven's screens live under `/coven/c/<address>/…`, so no coven's address can clash with the app's own `/coven/new` and `/coven/profile`.
- **Site moderation** is in the app too (Coven tab → Coven moderation, `coven/moderation.tsx`): the reports queue, every coven to open, pause or archive, site bans, and for admins, naming moderators.
- **Planning rituals** is in the app too (`ritual/plan.tsx`, rules in `lib/covens/planner.ts`): the rite, its occasion and time (with the coming moons and the coven's holidays), calendar or draft, copying steps from one of your own rituals, and each step: whose it is, its words, and what it does at the altar. Leaders edit, schedule, move back to drafts, cancel and delete rites from the ritual's screen.
- **Everything coven-related is in the app.** Initiation and training, mentors, the coven calendar and program powers are in both; coven altars and the altar and chat powers are in the app first, and the website follows.
- **Shared code**: `app/src/lib/covens/model.ts` mirrors `covens/coven-logic.js`; `api.ts` mirrors `coven-data.js`; `CovenContext.tsx` holds one coven's state and its one live connection; `reminders.ts` sets phone reminders a day and an hour before rites you're going (or might go) to, under their own notification source so moon reminders and coven reminders never clear each other.

## Account deletion

`supabase/functions/delete-account` removes the person's altar tending choices (`coven_altar_editors`), program enrollments, progress, stage passes, assignments, grants and mentorships (and leaves those they mentored without a mentor), their coven profile, memberships, signatures, applications, advancement requests and messages. Covens they founded remain, with `founder_id` cleared; a site moderator can hand such a coven on (`transfer_coven`). Redeploy the function after this change.

## Testing

`tests/covens.test.js` covers the website's shared rules (and `app/tests/covens.test.ts` the app's) and checks that every altar picture the page offers exists and passes the database's picture rule. The SQL was exercised against a local Postgres with a Supabase-like `auth` schema and `anon`/`authenticated` roles, as each kind of user.
