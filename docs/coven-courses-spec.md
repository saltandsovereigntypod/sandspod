# Coven training courses — writing spec (read all of this first)

The owner (a coven's High Priestess) said the current ready-made coven
trainings are far too thin: a step reads "Feel, raise, direct and release
energy, and keep yourself clear" with no explanation of what energy is, how
to feel it, or how to do any of it. She wants **real courses that TEACH
someone with no knowledge at all** the practice of their coven's tradition,
how to take part in a coven, and how to practise magic. Every module needs
**lesson documents** and a **comprehension test** with scoring. It is all
**digital**: the trainee reads in the app, practises at home, logs each
practice in the app, writes answers in an answer box, and talks to their
mentor or the High Priestess in a conversation attached to each step.

Types: `app/src/lib/covens/courses/types.ts` (CourseDoc, Quiz, Question,
CourseStage, CourseTask, CourseModule). Follow it exactly; it documents the
Markdown subset lessons may use.

## Where the existing programs live (for reference)
`supabase/migrations/20261027000100_coven_program_templates.sql` — 16
templates: `<tradition>-training` ("foundations of the craft", 8 stages)
and `<tradition>-initiation` ("a year and a day to initiation", 5 stages)
for wheel, wheel_south, celtic, norse, hellenic, roman, slavic, christian.
Read the ones for your traditions to see what they covered; yours replace
them with real teaching. Holiday keys look like `wheel/imbolc`; find the
exact keys in `app/src/lib/holidays*` / `app/src/lib/holy/` (grep for the
tradition id) and use only keys that exist.

The app also has a Living Library (`app/src/lib/library/`) and closed &
living traditions guide (`app/src/lib/library/closed/`). Stay consistent with
them; don't teach closed practices (see that guide).

## Writing standard
- Audience: an adult who has never done any of this. Define every term the
  first time (energy, grounding, circle, quarter, libation, blót, khernips,
  correspondences, …). Never assume they know what something "feels like":
  describe the range of what people commonly notice, and say that noticing
  little at first is normal.
- Teach HOW, step by step: numbered steps they can follow alone at home,
  with timings ("breathe in for a count of four"), what to notice, common
  difficulties and what to do about them, and how they'll know it's working.
  Give more than one method where people differ (visual, physical, verbal).
- Each lesson ~900–2000 words. Plain, warm, precise. British or American
  spelling is fine but be consistent within a file (the app mostly uses
  British: "colour", "centring").
- Honest about history and evidence: say what's ancient, what's modern
  revival or reconstruction, what's personal gnosis. No invented "ancient"
  claims. Magic is presented as practice and experience, not guaranteed
  physical cause and effect.
- Safety, woven in: fire and candle safety, herbs/oils (pregnancy, pets,
  skin, never ingest without expert advice), mental health (stop if a
  practice causes distress; ground; talk to the mentor; magic is never a
  substitute for medical or psychological care), consent (no working on
  someone without their consent), money/pressure (no one may demand money,
  sex, secrets), alcohol in offerings is optional (juice/water work).
- "Your coven" callouts where covens differ: `> **Your coven:** Your coven
  may cast its circle differently. Ask your mentor to show you theirs.`
- Digital: tasks say what to do in the app ("Log each session with the
  number of minutes", "In the answer box, write …", "Send your mentor a
  message on this step with …", "Take a photo of your altar and describe it
  in your answer if you'd like your mentor to see it"). Practices happen
  offline; the app is where they read, log, answer and talk.
- Tests: each module has one Quiz, 10–15 questions, passPercent 80. Mostly
  `single`/`multi`/`truefalse` (auto-scored), plus 2–3 `short`/`long`
  written questions with a clear `rubric`. Every question has an
  `explanation` that re-teaches. Questions test understanding and safety,
  not trivia. Options must be unambiguous; exactly the listed `correct`
  indices are right.
- Tasks: every practice task links its lessons (`docs`) and the module's
  test is its own task ("Take the test", kind 'study', quiz set, checked_by
  'mentor' so written answers get scored, response 'none'). Use realistic
  `times` and `minutes`. Mentor-checked where a person should look; self
  where it's routine logging.

## Files and modules (ids are fixed — use them)
Write one TypeScript file per module exporting `const module: CourseModule`
as default export, e.g.
`app/src/lib/covens/courses/core/energy.ts` →
`export default { id: 'core-energy', title: …, docs: [...], quizzes: [...], stages: [...] } satisfies CourseModule;`
(import type from '../types'). Use template literals for bodies. Escape
backticks and `${` if they ever appear.

### Core (shared by every tradition; tradition-neutral, with "Your coven" callouts)
Writer A (`courses/core/`):
1. `core-welcome` — Welcome: how this course works (reading, practising,
   logging, the answer box, talking to your mentor on each step, tests and
   how they're scored, pace, keeping a Book of Shadows/grimoire in the app,
   journaling), what a coven is and isn't, consent, ethics and safety
   foundations, mental health and when to pause, red flags in any group.
2. `core-energy` — What "energy" means in magical practice (several honest
   models: subtle energy, spirit/relationship, psychological/attentional;
   you needn't decide), learning to perceive it (breath awareness, body
   scan, hand-sensing, feeling a place/object), journaling perceptions.
3. `core-grounding` — Grounding, centring, shielding and cleansing yourself
   (multiple methods each, when to use them, signs you need to, quick
   versions for daily life).
4. `core-raising` — Raising, directing and releasing energy (breath, chant,
   movement/dance, drumming, visualisation; directing into a candle, object,
   sigil or goal; the moment of release; grounding the excess; signs of
   overdoing it; group energy, the "cone of power" idea).
5. `core-sacred-space` — Sacred space in general: purification of self and
   space, why boundaries, a simple circle casting step by step, calling the
   elements/quarters (what they are), working inside, closing, what to do if
   you must leave; that each tradition has its own form (taught in the
   tradition module).
6. `core-altar-tools` — The altar and tools (what an altar is for, setting
   one up with little money or space, tools and their uses and that none are
   required, cleansing and consecrating, caring for an altar; using the
   app's altar alongside a physical one).
Writer B (`courses/core/`):
7. `core-correspondences` — Correspondences: what they are and where they
   come from, colours, plants (12 common safe ones with cautions), stones (7
   common ones, which can't go in water/sun), days and planetary hours,
   building your own; herbal and oil safety in detail.
8. `core-moon-timing` — The moon's phases and magical timing, void-of-course
   (briefly), seasons, when timing matters and when it doesn't.
9. `core-divination` — Divination: what it is, choosing a system, tarot
   basics in depth (structure of the deck, a 3-card spread, reading
   method), a short intro to runes/ogham/pendulum/scrying, daily-draw
   journaling, reading ethically for others.
10. `core-spellcraft` — Spellcraft: intention, the structure of a spell,
    components, timing, wording, ethics (consent, harm, binding/cursing and
    why most covens forbid harmful work), recording and evaluating results,
    when nothing happens, mundane action alongside magic.
11. `core-ritual-coven` — Ritual craft and coven life: anatomy of a ritual,
    roles, coven etiquette (punctuality, confidentiality, consent, sharing
    the work, online/digital gatherings in the app), how to write a ritual,
    how to lead one, aftercare and grounding after ritual; the capstone
    (write and lead a ritual, reflection).

### Tradition modules (one file per module, `courses/<tradition>/`)
For each tradition T in: wheel, celtic, norse, hellenic, roman, slavic,
christian (wheel_south reuses wheel with Southern Hemisphere dates — write
`wheel` hemisphere-neutral and note the flip; Writer for wheel also writes
the `wheel_south` holiday-key mapping as a small exported function or a
second lore module `wheel_south-lore` with the southern keys):
1. `T-tradition` — The tradition itself: what it is, its history and
   sources (honest about reconstruction), its worldview and ethics, its
   powers (gods, spirits, land, ancestors) introduced respectfully, how this
   course's core skills fit (e.g. Heathenry doesn't usually cast circles;
   Hellenic practice centres on khernips, offerings and libation; Christian
   folk magic works through prayer, psalms and saints), what a coven of this
   tradition typically does.
2. `T-ritual` — The tradition's own ritual form, taught step by step
   (Wiccan-style circle and quarters; Celtic/Druidic grove opening; blót and
   sumbel; Hellenic procession, khernips, prayer, libation and offering;
   Roman praefatio, prayer formula, libation and pietas; Slavic offerings to
   household and ancestral spirits; Christian folk magic: prayer, psalms,
   candles, saints, the Bible as a working book), with a full sample rite.
3. `T-devotion` — Building relationship: daily devotion, offerings (what,
   how, disposing of them), ancestors, discernment (telling real from
   wishful, when to ask for help), dedication.
4. `T-lore` — The holy days: one lesson per holiday of the tradition's
   calendar (history, customs, meaning, how a beginner and a coven might
   keep it), each task with `holiday` set.
5. `T-initiation` — The initiation path's stages for this tradition (a year
   and a day; dedication; study and service; oath; preparing for
   initiation), each stage with lessons on what it means and what is
   expected, written so the High Priestess can adapt it. Initiation rites
   themselves stay with the coven: describe preparation, meaning and
   aftercare, not a secret rite.
Each tradition module has its own test.

Writers for traditions:
- Writer C: wheel (+ wheel_south lore)
- Writer D: celtic, slavic
- Writer E: norse, hellenic
- Writer F: roman, christian

## The four programs per tradition (owner's request)
Each tradition gets FIVE ready-made programs, one per step of coven life.
Each can raise its graduates to a position (the coven's own names; defaults
in brackets):

1. `<T>-seeker` — "Your first thirty days" (min_days 30). For someone in the
   30-day grace period deciding whether this coven is right for them. Light
   on practice, heavy on orientation, honesty and fit: what the coven is and
   does, its tradition in brief, what membership asks, their rights, red
   flags, a first taste of practice, attending a rite, and talking openly
   with the High Priestess/mentor. Ends with a decision step: continue as a
   devotee, take longer, or part well (and how to leave kindly). No
   promotion by default.
   Modules: core-seeker, T-seeker.
2. `<T>-devotee` — "Becoming a devotee" (several months). For those who've
   chosen the coven and want to dedicate. The foundations, the tradition's
   ritual and devotion, ending in a dedication. Raises to [Dedicant/Devotee].
   Modules: core-welcome, core-energy, core-grounding, core-raising,
   core-sacred-space, T-ritual, core-altar-tools, T-tradition, T-devotion,
   T-dedication.
3. `<T>-initiate` — "A year and a day to initiation" (min_days 366 over the
   program). For devotees seeking initiation: deeper craft, the full year
   of holy days, service, oath and preparation. Raises to [Initiate].
   Modules: core-correspondences, core-moon-timing, core-divination,
   core-spellcraft, T-lore, core-ritual-coven, T-initiation.
4. `<T>-elder` — "Becoming an elder". For initiates called to lead, teach
   and care for others. Raises to [Elder].
   Modules: core-elder-leading (leading ritual and groups, holding space,
   running gatherings in person and in the app), core-elder-teaching
   (teaching, mentoring, giving feedback, scoring tests and written
   answers fairly, the app's mentor tools), core-elder-care (pastoral
   care, boundaries, power dynamics, consent, safeguarding, crisis and
   referral to professionals, confidentiality and its limits),
   core-elder-governance (coven governance, decisions, conflict
   resolution, ethics, records and privacy, welcoming and parting well),
   T-elder (the tradition's own leadership: e.g. Hellenic: leading the
   festival calendar, the roles of priest/priestess in ancient and modern
   practice, theology in depth).

5. `<T>-high-priestess` — "Becoming a High Priestess or High Priest". For
   elders preparing to lead a coven: to succeed the current head, share
   leadership, or found a daughter coven. Raises to the coven's leading
   position (the one with `can_manage`; default [High Priestess]).
   Modules: core-hp-leading-coven (spiritual authority and accountability,
   vision and the coven's documents, running every part of the coven in
   the app: positions, programs, mentors, rites, meetings, notifications,
   invitations, open positions; delegating; crisis leadership; burnout and
   sustainability), core-hp-stewardship (succession and handing over,
   hiving off a daughter coven, training trainers, the coven's long-term
   health and lineage, closing a coven well, working with other covens and
   the wider community), T-high-priestess (the tradition's own high
   priesthood: e.g. Hellenic: priesthood in ancient and modern practice,
   leading the full festival year and household and civic cult, oracles
   and divination in a leading role, theology and ethics of leading
   worship).

New module ids beyond the list above:
- Core: `core-hp-leading-coven`, `core-hp-stewardship` (Writer H), `core-seeker`, `core-elder-leading`, `core-elder-teaching`,
  `core-elder-care`, `core-elder-governance` (Writer G).
- Per tradition: `T-seeker` (a short taste of the tradition for someone
  deciding: what it is, one simple first practice, what a rite will be
  like), `T-high-priestess`, `T-dedication` (what dedication means in this tradition, preparing
  for it, aftercare; the rite's shape the coven can adapt), `T-elder`.
- `T-initiation` now covers the devotee-to-initiate path only (study,
  service, oath, preparing for initiation).

The engineering side composes these in `courses/index.ts`. Writers don't
write index.ts.

## Checks before you finish
`cd app && npx tsc --noEmit` must pass with your files. Add
`app/tests/courses-<yourscope>.test.ts` checking your modules: unique ids,
every task's docs/quiz exist in your module or in core ids you reference,
every question valid (single/truefalse has exactly one correct index in
range; multi ≥1; short/long have rubric; options present for choice
types), passPercent 1–100, bodies use only the allowed Markdown (no tables,
links, images, HTML), holiday keys exist. Run `npm test` for your file.
Commit on your worktree branch. Don't push; don't touch Supabase or EAS.
Report: files, word counts per module, anything uncertain.
