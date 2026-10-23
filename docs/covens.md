# Covens

Digital covens on the website: a discoverable directory (`/covens/`), founding a coven (`/covens/new/`), each coven's home (`/covens/coven/?c=<address>`), the site moderators' console (`/covens/moderation/`) and the community guidelines (`/covens/guidelines/`). The database is `supabase/migrations/20261023000000_covens.sql`.

## Who can do what

The database decides; the pages only mirror it (`covens/coven-logic.js`).

- **Anyone**, signed in or not, can browse active covens with their public pages (creed, rules, requirements, agreements) and positions.
- **Taking part** needs a community profile (`coven_profiles`): a display name, optional pronouns and bio, and the 18+ and guidelines confirmations. The 18+ check is a self-attestation; no date of birth is stored.
- **Joining**: open covens are joined directly; application covens review an application with the coven's own questions (`covens.application_questions`). Either way, every agreement (`coven_documents.requires_signature`) must be signed first.
- **Agreements are versioned.** Editing an agreement's title or words bumps its version; members must sign the new version before they can speak in the gathering or tend the altar again ("good standing", `coven_in_good_standing`).
- **Positions** (`coven_ranks`) belong to each coven. A position's `level` orders seniority; `can_manage` (edit the coven, its pages and positions), `can_review` (applications and advancement) and `can_moderate` (remove messages, pause or remove members) are its powers. The founder has every power. Members apply to rise to positions marked `open_to_applications`. Reviewers can grant positions below their own that carry no powers; leaders grant up to their own level.
- **Site moderators** are `user_roles.role` `admin` or `moderator` (`is_community_moderator()`). They can read and act on every coven, chat, altar and report, pause or archive covens, and ban accounts from all covens (`community_bans`). Admins name moderators from the moderation console (`set_community_moderator`).

## Live chat and the shared altar

`coven_messages` and `coven_altar_items` are in the `supabase_realtime` publication. The coven page opens one channel per coven (`CovenData.live`) for message and altar changes plus presence (who is here, and on which tab). Row-level security still decides who receives each change.

Messages are rate-limited (8 per 30 seconds) and can be edited for a day. Removing a message clears its words; a report keeps its own copy (`coven_reports.snapshot`). Blocking (`user_blocks`) hides that person's messages from you only.

Altar items use only the site's own altar pictures (a check constraint on `image`). Candles burn down over `burn_minutes` from `lit_at`; the database sets `lit_at`/`lit_by` itself, and an altar holds at most 80 items.

## Coven rituals

The Rituals tab (`covens/coven/rituals.js`, `supabase/migrations/20261024000000_coven_rituals.sql`) holds rituals the coven performs together. Each step (`coven_ritual_steps`) belongs to one member (`assigned_user_id`), to everyone in a position (`assigned_rank_id`), or, with neither, to the whole coven.

- **Who leads:** the founder, positions that lead or moderate the coven, and positions given `can_lead_rituals` (the `lead` permission). They plan rituals (`save_coven_ritual`, which replaces the steps in one go), begin them, move back a step or end them.
- **Running:** a live ritual's `current_step_id` is shared over Realtime. The person (or people) a step belongs to see its full instructions and words to speak, and an "I've finished this step" button (`finish_coven_ritual_step`) that moves everyone on. On every coven tab, a banner and the page title tell a member when the current step is theirs.
- **Starting from a personal ritual:** the planner can copy the steps of one of your own saved rituals (`ritual_templates` / `ritual_template_steps`); each copied step starts as the whole coven's until you give it to someone.
- Rituals can only be changed through the functions; there are no direct write policies. A ritual can't be edited while it's under way. If a position is deleted, steps given to it become the whole coven's.

## Account deletion

`supabase/functions/delete-account` removes the person's coven profile, memberships, signatures, applications, advancement requests and messages. Covens they founded remain, with `founder_id` cleared; a site moderator can hand such a coven on (`transfer_coven`). Redeploy the function after this change.

## Testing

`tests/covens.test.js` covers the shared rules and checks that every altar picture the page offers exists and passes the database's picture rule. The SQL was exercised against a local Postgres with a Supabase-like `auth` schema and `anon`/`authenticated` roles, as each kind of user.
