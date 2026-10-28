// Core module 1: Welcome. How the course works, what a coven is and isn't,
// consent, ethics and safety, looking after your mind, and red flags.
import type { CourseModule } from '../types.ts';

export default {
  id: 'core-welcome',
  title: `Welcome to the craft`,
  docs: [
    {
      id: 'core-welcome-how-this-course-works',
      title: `How this course works`,
      summary: `What you'll do in each step of this course: read, practise at home, log your practice, write in the answer box, talk with your mentor, and take a short test.`,
      minutes: 15,
      body: `## Welcome

You've joined a coven, or you're thinking about it, and this course is where your training begins. It assumes you know nothing at all. If you already know a little, that's fine: read everything anyway, because your coven may use words and methods in ways you haven't met before, and the safety notes matter for everyone.

The course teaches three things side by side: the practice of your coven's tradition, how to take part in a coven, and how to practise magic. It's built from short modules. Each module has a few lessons to read, some practices to try at home, and a test at the end that checks you've understood the important points.

Nothing here is a race. People come to this with jobs, children, illnesses, grief and busy lives. A slow, steady pace with honest notes is worth far more than rushing through.

## The rhythm of a step

Every module is one stage in your coven's training program, and every stage is made of steps (the app calls them tasks). Each step works the same way:

1. **Read.** A step lists the lessons that go with it. Open each one and read it through. Most take ten to twenty minutes. You can come back to them as often as you like.
2. **Practise.** Most steps ask you to do something at home, away from the screen: sit and breathe, light a candle, set up an altar. The instructions say how long and how often.
3. **Log it.** Each time you do the practice, log it on the step in the app. If the step asks for something written, the answer box opens for you.
4. **Write.** Some steps ask you to write in the answer box: what you noticed, what was hard, a question. There is no "right" experience to report. Write what actually happened, even if it was "nothing much, and I kept thinking about dinner".
5. **Talk.** Every step has its own conversation with your mentor or the coven's head (often called the High Priestess or High Priest). Use it for questions, for "I'm stuck", or for anything that worried you. It stays attached to that step, so the context is always there.
6. **Sign-off.** Some steps you sign off yourself when you've done them. Others are checked by your mentor, who reads what you wrote and may reply before marking it done.

> **Note:** Practices happen offline, in your own space and your own time. The app is where you read, keep count, write and talk. You never have to practise with your phone in your hand.

## Logging honestly

Logging is for you and your mentor, not a score to inflate. If a step asks for ten sessions of five minutes and you managed four minutes on a bad day, log it and say so. If you missed a week, just carry on. A mentor who sees honest logs can help you; one who sees perfect logs can't tell what's going on.

When a step asks for a number of minutes, it's a guide, not a rule. If you have a health condition that makes sitting still, standing or concentrating for that long difficult, adapt it and tell your mentor what you changed. Every practice in this course can be done seated, lying down or with breaks.

## The answer box

When a step has an answer box, it's asking for a few honest sentences, not an essay. Good answers usually say:

- what you did (and for how long)
- what you noticed, in plain words: in your body, your feelings, your thoughts, your surroundings
- what was difficult or confusing
- a question, if you have one

You don't need special vocabulary. "My hands felt warm and a bit fizzy" is a better note than a paragraph of borrowed words. Over time your notes become a record of how your practice has grown.

## Talking with your mentor

Your coven will give you a mentor: someone further along who guides you through the course. In some covens it's the coven's head; in others it's an experienced member. Your mentor is there to answer questions, read your work, notice when you're struggling and help you get unstuck.

Send your mentor a message on a step when:

- you don't understand something in a lesson
- a practice isn't working and you've tried the suggestions
- something felt uncomfortable, frightening or overwhelming
- you need to adapt a practice for your body, health or home
- you want to share something that went well

Mentors are people with their own lives. Give them a few days to reply unless something is urgent, and if it is urgent and about your safety or health, contact the right emergency or health service first. Your mentor is a guide in the craft, not a doctor, counsellor or crisis service.

> **Your coven:** Your coven may give mentors different names (sponsor, guide, elder) and may expect you to meet them in person, online or only in the app. Ask your mentor how they like to be contacted and how often.

## Tests and how they're scored

Each module ends with a test. It's there to check you've understood the points that matter, especially the safety ones, not to catch you out. Most questions are multiple choice or true/false and are marked straight away. A few ask you to write an answer in your own words; your mentor scores those against a short description of what a full answer includes.

To pass, you need 80 per cent of the points. Your result shows which questions you got right and which you didn't, with your mentor's comments on the written answers. Every question also has an explanation, which teaches the point again; the right answers and their explanations open to you once you've passed the test, so a retake still asks you to think it through. If you don't pass, look at the questions you missed, go back over the lessons they come from, and talk to your mentor about trying again. Getting things wrong in a test is how you find out what to re-read; it's not a judgement on you.

You can have the lessons open while you take a test. The aim is understanding, not memory.

## Your Grimoire and journal

You'll keep two kinds of record as you go, both in the app: a Grimoire (your book of practice, sometimes called a Book of Shadows) and a journal of your practice sessions. The next lesson explains both and how to set them up.

## Pace

A good pace for most people is one module every two to four weeks. Some modules ask for a practice every day for a week or two; others are quicker. Your coven may set its own timetable, or let you go at your own speed. If life gets in the way, tell your mentor you're pausing. Pausing is always allowed.

> **Try this:** Before you go on, open the first step of this stage in the app and find where you log a practice, where the answer box is, and where the conversation with your mentor is. Knowing where things are now saves confusion later.

## What this course is not

This course teaches a spiritual practice. It does not replace medical, psychological, legal or financial advice, and nothing in it should stop you seeking that advice. Magic, as this course presents it, is something you practise and experience, not a guaranteed way to cause physical effects in the world. You'll be encouraged throughout to pair any magical work with ordinary, practical action.

It also doesn't ask you to believe anything on day one. You're asked to try things, notice honestly what happens, and talk about it. Belief, if it comes, comes from experience.`,
    },
    {
      id: 'core-welcome-grimoire-and-journal',
      title: `Keeping your Grimoire and journal`,
      summary: `What a Grimoire or Book of Shadows is, why practitioners keep one, and how to set up yours and a practice journal in the app.`,
      minutes: 15,
      body: `## Why practitioners write things down

Almost every magical and religious tradition that has survived did so partly because people wrote things down: prayers, recipes, calendars, what worked and what didn't. For you, a written record does three jobs:

- **It remembers for you.** You'll learn dozens of methods, words and correspondences. Nobody remembers them all.
- **It shows you patterns.** Over months, you'll see which practices help you, which times of day suit you, and how your perception changes. You can't see a pattern without notes.
- **It keeps you honest.** Memory flatters. Notes written on the day tell you what actually happened, which matters a great deal when you're learning to tell real experience from wishful thinking.

## Grimoire, Book of Shadows, journal: what's the difference?

**Grimoire** is an old word for a book of magic: historically, handwritten or printed books of spells, rituals and instructions, many from the late medieval and early modern period. Today people use it for their own book of practice.

**Book of Shadows** is a modern term. It comes from Gerald Gardner and the early Wiccan covens of the 1950s, where it meant the coven's book of rituals, copied by hand by each initiate. Many modern practitioners use it for any personal book of practice. Your coven may have its own Book of Shadows too, which members add to with approval.

**A journal** (or diary) is your day-by-day record: what you did today, how it felt, what you noticed. The Grimoire is the reference book; the journal is the lab notebook.

> **Your coven:** Your coven may use these words differently, or keep a coven Book of Shadows that only some members may read or write in. Ask your mentor which book is which in your coven and what you're allowed to copy from it into your own.

## Setting up your Grimoire in the app

Your Grimoire is under Practice, then Grimoire. It needs a Salt & Sovereignty account, and it syncs with the website so you won't lose it if you change phones. Set it up like this:

1. Open Practice, then Grimoire. Sign in if it asks you to.
2. Make a section called something like "Coven training". This is where your notes from this course will go.
3. Make a first page in it called "Why I'm here". Write a few sentences: what drew you to this coven, what you hope to learn, and anything you're nervous about. Date it. You'll enjoy reading it in a year.
4. As you go through the course, add a page for each method you learn that you want to keep: a grounding you liked, how your coven opens a ritual, a chant.

If you'd rather your book didn't look magical to someone glancing at your phone, the Grimoire has a "Mundane" switch that shows it in everyday words.

## Keeping a practice journal

Your practice journal is where each session goes. You can use the answer box on each step for the course's own practices, and the app's ritual journal (which opens when you finish a ritual in the app) or a Grimoire page for anything else. Some people prefer a paper notebook by their bed or altar and type up the highlights later. Any of these is fine. What matters is that you write soon after you practise, while it's fresh.

A useful entry has:

- **Date, time and place.** Where you were and roughly when.
- **What you did.** "Five minutes of breath counting, seated, eyes closed."
- **Your state before.** Tired, anxious, calm, distracted, unwell.
- **What you noticed.** Body sensations, emotions, images, thoughts, sounds, anything unexpected. Use plain words.
- **Your state after.** Did anything change?
- **Anything else.** The moon, the weather, what you'd eaten, if you think it matters.

Keep it short on most days. Two or three lines is enough. Longer entries are for when something interesting or difficult happens.

## Writing what happened, not what you hoped

The single most useful habit in a beginner's journal is separating what you **noticed** from what you **concluded**. For example:

- Noticed: "My palms tingled when I held them close together, and it got stronger when I breathed slowly."
- Concluded: "I was feeling energy between my hands."

Both are worth writing, but keep them apart. The noticing is the evidence; the conclusion is your interpretation of it, which might change as you learn. Later lessons will come back to this again and again.

> **Note:** If you have nothing to report, write that. "Sat for ten minutes, felt nothing in particular, mind busy" is a real and useful entry. Most practitioners' early journals are full of these.

## Privacy

Your Grimoire and journal are yours. Nobody in your coven can read them unless you share something. What you write in a step's answer box is seen by you, your mentor and those your coven allows to see training progress.

Some things people write in a journal are very personal. If you're not comfortable writing something in the answer box, you don't have to; tell your mentor you'd rather talk about it, or just keep it in your own journal.

Never write other people's private details into anything you share, and never copy your coven's private material anywhere it doesn't allow.

## Making it a habit

The easiest way to keep a journal is to tie it to the practice itself: practise, then write two lines before you get up. If you forget, write it the next morning. If you miss a week, don't try to fill it in from memory; just start again today.

> **Try this:** Tonight, open your Grimoire, make the "Coven training" section and the "Why I'm here" page. It takes ten minutes and you'll have started your book.`,
    },
    {
      id: 'core-welcome-what-a-coven-is',
      title: `What a coven is, and isn't`,
      summary: `Where covens come from, how they usually work, the roles you'll meet, and what a good coven will and won't ask of you.`,
      minutes: 15,
      body: `## A small group that practises together

A **coven** is a small group of people who practise magic or a pagan religion together, meet regularly, train new members, and share responsibility for their rituals. Most covens are small, often between three and thirteen people, because the work depends on members knowing and trusting each other.

A coven is not a church with a congregation watching a priest. Everyone takes part. Over time, everyone learns to lead.

## Where the word and the idea come from

It's worth being honest about history, because a lot of nonsense is written about it.

- The word **coven** comes from a Latin root meaning "to come together", the same root as "convene" and "convent". It appears in seventeenth-century Scottish witch-trial records, most famously in the 1662 confession of Isobel Gowdie, who described witches meeting in groups.
- In the 1920s, the scholar Margaret Murray argued that the people accused in the witch trials were members of a surviving, organised pagan religion. Historians have since shown that this theory doesn't hold up: the trial records were mostly produced under pressure and torture, and the people executed were overwhelmingly ordinary Christians.
- Modern covens largely descend from **Wicca**, a religion made public in England in the 1950s by Gerald Gardner and developed by Doreen Valiente and others. Wicca drew on older sources (ceremonial magic, folk customs, classical paganism, Murray's ideas) but as a religion it is modern.
- Since then, the coven model has been taken up by many other paths: eclectic witches, and groups following reconstructed or revived traditions such as Hellenic (ancient Greek), Roman, Norse, Celtic and Slavic paganism, and Christian folk magic.

None of this makes modern practice less real. A tradition doesn't need to be ancient to be meaningful. It does mean that if someone tells you their coven's rituals are "unchanged for thousands of years", you're entitled to ask how they know.

> **Your coven:** Your coven follows a particular tradition and may not call itself a coven at all outside this app: a grove, a kindred, a thiasos, a household, a circle. Its tradition module, later in this course, explains its own history and practice.

## How covens usually work

Every coven differs, but most share some features:

- **Regular meetings.** Often at the full or new moon (sometimes called esbats) and on the tradition's holy days. Some meet in person, some online, many both. In this app, rites are on the coven's calendar, and you can answer going, maybe or can't make it.
- **Training.** New members learn through a program like this one, with a mentor.
- **Stages or degrees.** Many covens have stages of membership. A common pattern is: seeker or student, then dedicant (someone who has formally committed to learning), then initiate, sometimes with further degrees. Some traditions have no degrees at all.
- **Shared work.** Members take turns preparing the space, bringing food, leading parts of the ritual and looking after newer members.
- **Shared rules.** A good coven has clear, written agreements: confidentiality, consent, what happens if there's a conflict, how decisions are made. In the app, a coven can ask you to read and sign these.

## The people you'll meet

- **The coven's head.** Often called the High Priestess or High Priest; in some traditions a different title. They lead the coven, hold its tradition and make final decisions. In this app, the founder or whoever leads the coven.
- **Your mentor.** An experienced member who guides your training.
- **Elders or officers.** Members with particular responsibilities: leading rituals, keeping the Book of Shadows, organising rites.
- **Other students.** People at your stage. They're often your best support.

## What a coven is for

A coven gives you things that are hard to find alone:

- teaching from people who have practised for years
- a shared tradition with tested methods
- people to practise with, whose experience can confirm, question or balance yours
- the particular power, comfort and joy of group ritual
- accountability: people who notice when you're struggling, and when you're getting carried away

## What a coven is not

- **It isn't a family that owns you.** You can leave at any time, for any reason, without punishment.
- **It isn't therapy.** Members support each other, but a coven isn't a substitute for professional mental health care.
- **It isn't a business.** Covens may ask members to share costs like candles, food or a room. No one should profit from you, and you should never be pressured to pay for advancement.
- **It isn't a secret society that overrides the law or your conscience.** Covens may keep their rituals private, but nothing should ever be secret because it's harmful.
- **It isn't a place where anyone is owed your body.** Some traditions include practices like ritual nudity (sometimes called "skyclad") or ritual touch. These are always optional, always with consent, and never a condition of membership or advancement. Sex is never part of a beginner's training.

The lesson on red flags goes into these in detail.

## Your part

Being a good coven member mostly means ordinary decency: turning up when you said you would, keeping others' confidences, doing your share, being honest about what you experience, and asking when you don't understand. You don't have to be gifted, confident or knowledgeable. You do have to be willing to learn and to treat others with respect.

> **Try this:** In the answer box for this step, write two or three sentences about what you hope a coven will give you, and one thing you're unsure or worried about. Your mentor will read it.`,
    },
    {
      id: 'core-welcome-ethics-and-safety',
      title: `Consent, ethics and safety`,
      summary: `The ground rules that hold throughout this course: consent, honesty, doing no harm, and practical safety with fire, plants, oils and your body.`,
      minutes: 20,
      body: `## Why start with ethics?

Magic, in the sense this course teaches, is the practice of focusing your attention, will and relationships with the world (and, if you believe in them, with gods and spirits) to bring about change. Whatever you think is going on when you do it, it's done by people, among people. That means it carries the same responsibilities as anything else you do: consent, honesty and care not to harm.

Different traditions have different ethical codes. Many Wiccans follow the Wiccan Rede ("an it harm none, do what ye will"). Heathens often speak of virtues such as honour, hospitality and keeping your word. Hellenic polytheists may speak of reverence (eusebeia), hospitality (xenia) and avoiding arrogant excess (hubris). Romans spoke of pietas, dutiful respect. Christian folk practitioners follow Christian ethics. Your tradition module will teach your coven's own. The principles below are shared by nearly all of them and apply throughout this course.

## Consent

**Consent** means a person freely agrees to something, knowing what it is, and can change their mind at any time.

- **No magic on people without their consent.** Don't do workings aimed at another person (to heal them, protect them, change their mind, make them love you) unless they have asked for it or agreed to it. If you want to help someone who hasn't asked, you can pray or light a candle for their wellbeing in general terms, or ask them if they'd like you to.
- **No touch without consent.** Group rituals sometimes involve holding hands, anointing (touching oil to someone's forehead or hands) or embracing. You can always say no, and should always be asked. If you're leading, ask: "Is it all right if I anoint your hands?"
- **No pressure.** Consent given because you felt you couldn't say no isn't consent. Anyone, at any time, may step out of a practice or ritual.
- **Consent can be withdrawn.** You can change your mind halfway through. So can others.

> **Safety:** Love spells that target a particular person are a consent problem: they aim to change someone's feelings without their agreement. Most covens forbid them. You'll learn kinder ways to work for love, aimed at yourself and your own openness, in the spellcraft module.

## Honesty

- Report your experiences honestly, including "nothing happened".
- Don't claim powers, lineage or experience you don't have.
- When you teach or share something, say where it comes from: a historical source, your coven, a book, or your own experience and intuition (sometimes called personal gnosis).

## Do no harm, and take responsibility

Most covens forbid work intended to harm, such as curses, and are cautious about binding (magic meant to stop someone acting). The spellcraft module covers why. More basically: think about the consequences of what you do, take responsibility for them, and pair magic with ordinary, practical action. A protection working is no substitute for locking your door, and a healing working is no substitute for seeing a doctor.

## Practical safety

These apply in every module. They'll come up again where they matter most.

### Fire and candles

1. Put candles in stable holders on a heat-proof surface, away from curtains, paper, hair, sleeves and anything that can fall on them.
2. Never leave a lit candle, incense or charcoal unattended, and never fall asleep with one burning.
3. Keep them out of reach of children and pets.
4. Trim wicks to about half a centimetre (a quarter of an inch) to stop large flames.
5. Keep water or a fire blanket nearby, and know where your smoke alarm is. Don't disable it.
6. Put candles out with a snuffer or by pinching them carefully, or by pressing the wick into the wax. Don't throw water on hot wax.
7. If you can't safely use a flame where you live (a shared house, a hospital, a care home), use a battery candle. It is perfectly acceptable, and many experienced practitioners do the same.

### Smoke and incense

Incense, burning herbs and resin produce smoke that can trigger asthma, harm birds and other pets, and set off alarms. Open a window, use small amounts, and choose a smokeless method (water, sound, a bell) if anyone present has breathing problems.

### Herbs and oils

- **Never eat, drink or swallow a herb or oil for magical purposes** without expert advice from a qualified herbalist, pharmacist or doctor. Many common herbs interact with medicines.
- **Essential oils** are concentrated. Dilute them in a carrier oil before they touch skin (a common guide is one or two drops per teaspoon of carrier oil), and patch-test first. Some are unsafe in pregnancy, for babies and children, or around cats, dogs and birds.
- **Pregnancy:** many herbs and oils are unsafe. If you're pregnant or might be, check every one with a professional, or leave them out.
- If anything causes a rash, breathing difficulty or feeling unwell, stop and seek medical advice.

### Your body

- Breathing exercises in this course are gentle. Never hold your breath or breathe fast to the point of dizziness. If you have a heart or lung condition, panic attacks, epilepsy, or are pregnant, keep breathing practices slow and natural and tell your mentor.
- Movement and dance can be done seated. Listen to your body.
- Fasting is never required in this course.

### Alcohol

Many traditions pour drink offerings (libations) of wine, mead or beer. **Alcohol is always optional.** Water, juice, milk or tea are acceptable offerings in every tradition this course teaches. Nobody should pressure you to drink, and you should never practise ritual while drunk.

## Money, secrets and pressure

No one in a coven may demand money from you as a condition of training, sex or any physical intimacy, or secrets that would hide harm. Covens may share costs openly, and may keep their rites private; those are different things. The next lessons cover mental health and the warning signs of an unhealthy group.

> **Note:** If something in your coven ever feels wrong, you can always talk to someone outside it, and you can always leave. Salt & Sovereignty's community guidelines also apply to every coven in the app, and you can report a concern to the site's moderators.`,
    },
    {
      id: 'core-welcome-mental-health',
      title: `Looking after your mind`,
      summary: `How spiritual practice can affect your mental health, the signs that mean pause, and what to do if a practice leaves you distressed.`,
      minutes: 15,
      body: `## Practice changes you, and that's the point

Spiritual and magical practice works with attention, emotion, imagination and belief. For most people most of the time, that's good: regular practice often brings calm, meaning, community and a deeper relationship with the world. But anything powerful enough to help can also unsettle. This lesson is about noticing when that happens and what to do.

Read it even if you feel completely well. These are things to know before you need them.

## What's normal

Some experiences are a normal part of learning:

- feeling a bit emotional, tearful or tender after a ritual
- vivid dreams for a few nights
- feeling light-headed or spacey after a long meditation (grounding, taught later, helps)
- old memories or feelings coming up during quiet practice
- a sense of awe, or of being very small, at a holy day or in nature
- being restless and bored, or unable to concentrate

These usually pass within hours or a day, and grounding, food, water, sleep and a chat with your mentor help.

## Signs that mean pause

Stop the practice, ground yourself, and talk to your mentor if you notice:

- anxiety, panic or fear that doesn't settle after you stop
- feeling detached from your body or surroundings, or that things aren't real, for more than a short while
- trouble sleeping for several nights, or sleeping much more than usual
- hearing or seeing things others don't, outside of a deliberate practice, especially if they're frightening or give you instructions
- feeling that you've been chosen, have special powers or a mission, in a way that's beginning to affect your relationships, work or money
- low mood, hopelessness, or thoughts of harming yourself
- feeling that a spirit, god or person is attacking or controlling you
- practising compulsively: feeling you must do rituals, or something bad will happen

None of these mean you've failed, and many have ordinary causes: stress, lack of sleep, illness, medication changes. But they're signs to step back.

> **Safety:** If you have thoughts of harming yourself or others, or feel unsafe, contact your local emergency number, a crisis line, or your doctor now. Your coven and your mentor are not emergency services, and magic is never a substitute for medical or psychological care. Many coven leaders have helped members find professional support; asking for it is a sign of good judgement, not weakness.

## If you have a mental health condition

Many people with mental health conditions practise happily and safely, and covens should welcome them. Some practices may need adapting:

- **Trauma, PTSD:** closed eyes, darkness, being touched, or certain words or smells may be triggers. Keep your eyes open, have a light on, and tell your mentor what you need.
- **Psychosis, bipolar disorder, or a history of them:** long trance, intense visualisation, fasting, sleep loss and practices about hearing spirits can be risky. Keep practices short and grounded, protect your sleep, and talk to your clinician as well as your mentor.
- **Anxiety and panic:** breathing practices should be slow and natural. Never hyperventilate. Stop if the breathing itself makes you anxious and use a physical grounding instead.
- **Dissociation:** prefer practices with your eyes open and attention on the body and the room.
- **Obsessive-compulsive disorder:** watch for rituals turning into compulsions. A practice should feel chosen, not required.

You don't have to tell your coven your diagnosis. It helps to tell your mentor what adaptations you need.

> **Your coven:** Your coven may have its own guidance or a member trained in mental health first aid. Ask your mentor who to go to if you're struggling and they're not available.

## Grief, crisis and big life changes

People often come to spiritual practice at hard times: after a death, a breakup, an illness, a move, a loss of faith. Practice can be a great comfort then. It can also hit harder than usual, because you're already raw. If you're in the middle of something like this, go gently: choose short, grounding practices over intense ones, keep your sleep and meals regular, lean on people as well as practice, and tell your mentor what's going on so they can suggest a pace that suits you. It's fine to step back from the course for a season and return when you're ready.

## Medication and treatment

Never stop or change medication, therapy or treatment because of a spiritual practice, a reading, or something a person in your coven tells you. A good coven will never suggest it. You can practise and take medication; they don't conflict.

## How to pause

1. Stop the practice that's troubling you. You don't need permission.
2. Ground yourself: eat something, drink water, feel your feet on the floor, go outside, do something ordinary like washing up.
3. Tell your mentor, in the step's conversation or however you usually reach them. Say what you were doing and what happened.
4. If the signs above are present, contact a doctor or mental health professional.
5. Rest from practice for as long as you need. Tell your mentor you're pausing the course. Your progress will still be there.
6. When you return, start with gentle, grounding practices, and build up slowly.

## Healthy practice looks like

- You feel more like yourself over time, not less.
- Your life outside practice (work, friends, rest, money) is going as well or better.
- You can skip a practice without fear.
- You can talk about doubts and difficulties with your coven without being shamed.
- You're getting enough sleep, food and time outdoors.

> **Try this:** In your Grimoire, write a short "if I'm struggling" page: who you'll contact (your mentor, a friend, your doctor, a crisis line), one grounding thing that works for you, and a reminder that pausing is allowed. Keep it somewhere you'll find it.`,
    },
    {
      id: 'core-welcome-red-flags',
      title: `Red flags in any group`,
      summary: `How to tell a healthy coven from an unhealthy one, the warning signs to watch for in any spiritual group, and what to do if you see them.`,
      minutes: 15,
      body: `## Why this lesson exists

Most covens are run by sincere people who give a great deal of time for nothing. But spiritual groups of every religion can attract people who misuse trust, and new members, eager to belong and unsure what's normal, are the easiest to take advantage of. Knowing the warning signs protects you, and helps you protect others later.

This applies to your own coven too. A good coven won't mind you reading this; it will want you to.

## Healthy signs

- **You can ask questions**, including sceptical ones, and get straight answers.
- **There are clear agreements** about confidentiality, consent, costs and conflict, and they apply to leaders too.
- **Costs are shared and open.** You know what money is for.
- **You can say no** to any practice, and to any touch, without consequence.
- **You can leave** at any time, and people who've left aren't talked about as traitors.
- **Leaders admit mistakes** and the limits of what they know.
- **Your life outside the coven is respected:** your family, friends, job, health and other commitments.
- **History is told honestly:** they distinguish ancient, modern and personal.
- **Teaching is open to newcomers** at a pace they can manage.

## Red flags

Any one of these is a reason to slow down and talk to someone outside the group. Several together are a reason to leave.

### Money

- Demands for payment to advance a degree, to be initiated, or to receive "secret" teachings.
- Pressure to buy expensive tools, courses, readings or items from the leader.
- Being told a curse or bad luck can be removed for a fee.
- Pressure to give gifts, loans or your possessions to the leader or group.

### Sex and the body

- Any suggestion that sex, nudity, or physical intimacy is required for training, initiation or advancement.
- Touch without asking, or after you've said no.
- Leaders pursuing relationships with students they're mentoring.
- Anything sexual involving anyone under eighteen. This is a crime: report it to the police.

### Secrets and control

- Being told to keep secrets from your partner, family, doctor or the police.
- Being told not to talk to former members, or to cut off friends and family who doubt the group.
- Pressure to report on other members or to keep your experiences hidden from your mentor.
- Rules that apply to members but not to leaders.
- Oaths demanded before you know what you're swearing to. Real oaths in this course come late, are explained in full beforehand, and are always freely chosen.

### Fear and specialness

- Threats that you'll be cursed, harmed or abandoned by the gods if you leave or disobey.
- Being told you're specially chosen, uniquely gifted or have a destiny that only this leader can unlock.
- Claims that the leader can't be wrong, speaks for a god in ways no one may question, or has powers no one may test.
- Your doubts, illness or bad luck blamed on your lack of faith or on "attack" by people outside the group.

### Health

- Advice to stop medication or treatment, or to avoid doctors.
- Pressure to fast, go without sleep, take drugs or drink alcohol.
- Practices that leave people frightened or distressed being dismissed as "just part of the path".

> **Safety:** Physical or sexual abuse, threats, and any harm to a child are crimes, whatever religious explanation is given. Contact the police or your local support services. You will not be breaking any vow worth keeping.

## Online groups

Many covens now meet partly or wholly online, including through this app. The same signs apply, with a few to add:

- pressure to move conversations off the app to private channels, especially one to one with a leader
- requests for photos of yourself, particularly intimate ones, for any "ritual" reason
- requests for your address, bank details or passwords
- someone you've never met claiming a long lineage or great authority that no one can check

Keep conversations about your training in the app where you can, so there's a record. A good mentor won't mind.

## Confidentiality versus secrecy

Covens often ask members to keep things confidential, and that's reasonable: who is a member (some people could lose jobs or family over it), what others share in a circle, and the coven's own rituals. Good confidentiality protects people.

Secrecy that protects harm is different. No promise of confidentiality can require you to hide abuse, crime, or danger to someone. If you're unsure which you're dealing with, ask: "Who does keeping this secret protect?"

## What to do if you see a red flag

1. **Trust the feeling.** If something feels wrong, take it seriously, even if you can't explain why yet.
2. **Write down what happened** in your own journal, with dates.
3. **Talk to someone outside the situation:** a friend, a member of another coven, a counsellor.
4. **Raise it with the coven if it's safe to:** your mentor, or the coven's head. A healthy coven will listen.
5. **Report it** to Salt & Sovereignty's moderators through the app if it concerns behaviour in the coven or breaks the community guidelines. Report crimes to the police.
6. **Leave if you need to.** You can leave a coven in the app at any time from your coven's "My standing" page. You owe no one an explanation.

> **Your coven:** Your coven should have written agreements you can read before you commit. If you haven't seen them, ask your mentor where they are.

## A last word

The great majority of your time in a coven should feel like learning, friendship, wonder and hard but rewarding work. Knowing the warning signs isn't about expecting the worst. It's about being free to give your trust where it's deserved.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-core-welcome',
      title: `Welcome: test`,
      intro: `Twelve questions on how the course works, what a coven is, consent, safety, looking after yourself and red flags. You can have the lessons open. You need 80 per cent to pass; your mentor scores the written answers.`,
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: `You sat for a breathing practice for ten minutes and noticed nothing in particular. What should you write in the answer box?`,
          options: [
            `Nothing; leave it blank until something happens`,
            `What you did and that you noticed nothing much, honestly`,
            `A description of what you think you were supposed to feel`,
            `Skip logging it, since it didn't work`,
          ],
          correct: [1],
          points: 1,
          explanation: `Honest notes, including "nothing much happened", are what let you and your mentor see real patterns. Most practitioners' early journals are full of quiet sessions.`,
        },
        {
          id: 'q2',
          type: 'truefalse',
          prompt: `To pass a module's test, you need 80 per cent of the points.`,
          options: [`True`, `False`],
          correct: [0],
          points: 1,
          explanation: `Each module's test needs 80 per cent. Choice questions are marked at once and written answers are scored by your mentor. If you don't pass, look at the questions you missed, go back over the lessons and talk to your mentor about trying again. The right answers and explanations show once you've passed.`,
        },
        {
          id: 'q3',
          type: 'single',
          prompt: `Which is the best way to separate noticing from concluding in your journal?`,
          options: [
            `"I felt energy between my hands."`,
            `"Noticed: my palms tingled and grew warm as I breathed slowly. I think this may be what my coven calls energy."`,
            `"My spirit guide touched my hands."`,
            `"Nothing; I don't write conclusions."`,
          ],
          correct: [1],
          points: 1,
          explanation: `Write what you noticed in plain words first, then your interpretation, kept apart. The noticing is the evidence; the conclusion may change as you learn.`,
        },
        {
          id: 'q4',
          type: 'truefalse',
          prompt: `Modern covens, and Wicca in particular, are an unbroken continuation of an organised pagan religion that survived the witch trials.`,
          options: [`True`, `False`],
          correct: [1],
          points: 1,
          explanation: `False. That was Margaret Murray's 1920s theory, which historians have rejected. Wicca was made public in the 1950s by Gerald Gardner and others, drawing on older sources. Modern practice is meaningful without needing to be ancient.`,
        },
        {
          id: 'q5',
          type: 'multi',
          prompt: `Which of these respect consent? Choose all that apply.`,
          options: [
            `Asking "Is it all right if I anoint your hands?" before doing so`,
            `Doing a healing working for a friend who asked you to`,
            `Doing a working to make a particular person fall in love with you`,
            `Stepping out of a ritual partway through because you're uncomfortable`,
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: `Consent means free, informed agreement that can be withdrawn. Asking before touch, working only for those who've asked, and being free to step out all respect it. A love spell aimed at a particular person tries to change their feelings without their agreement.`,
        },
        {
          id: 'q6',
          type: 'single',
          prompt: `You can't safely use a naked flame where you live. What should you do?`,
          options: [
            `Use one anyway, but only for short rituals`,
            `Use a battery candle; it's perfectly acceptable`,
            `Give up on candle practices`,
            `Light it outside your door`,
          ],
          correct: [1],
          points: 1,
          explanation: `Battery candles are fully acceptable and many experienced practitioners use them. Safety always comes first: never leave a flame unattended or use one where it isn't safe.`,
        },
        {
          id: 'q7',
          type: 'multi',
          prompt: `Which of these are safe practice with herbs and oils? Choose all that apply.`,
          options: [
            `Diluting essential oils in a carrier oil and patch-testing before they touch skin`,
            `Drinking a herbal tea from a spell book to make the spell stronger, without asking anyone`,
            `Checking every herb and oil with a professional if you're pregnant`,
            `Keeping oils away from cats, dogs and birds`,
          ],
          correct: [0, 2, 3],
          points: 1,
          explanation: `Never ingest a herb or oil for magical purposes without expert advice: many interact with medicines. Dilute and patch-test oils, check everything in pregnancy, and keep oils away from pets, some of which are poisoned by them.`,
        },
        {
          id: 'q8',
          type: 'truefalse',
          prompt: `Libations must be alcoholic to be acceptable.`,
          options: [`True`, `False`],
          correct: [1],
          points: 1,
          explanation: `False. Alcohol is always optional. Water, juice, milk or tea are acceptable offerings in every tradition this course teaches, and no one should pressure you to drink.`,
        },
        {
          id: 'q9',
          type: 'single',
          prompt: `After a week of evening meditation you've been sleeping badly and feel detached from your surroundings much of the day. What's the right first step?`,
          options: [
            `Meditate longer to push through it`,
            `Stop the practice, ground yourself, tell your mentor, and see a doctor if it continues`,
            `Keep it to yourself so you don't look weak`,
            `Stop taking any medication that might be interfering`,
          ],
          correct: [1],
          points: 1,
          explanation: `These are signs to pause. Stop, ground (food, water, feet on the floor, something ordinary), tell your mentor, and get medical help if it doesn't settle. Never change medication because of a spiritual practice.`,
        },
        {
          id: 'q10',
          type: 'multi',
          prompt: `Which of these are red flags in a spiritual group? Choose all that apply.`,
          options: [
            `Being told you must pay the leader to be initiated`,
            `Being asked to share the cost of candles and room hire, with the costs shown openly`,
            `Being told not to talk to former members`,
            `Being told sex with the leader is part of advancement`,
          ],
          correct: [0, 2, 3],
          points: 1,
          explanation: `Open sharing of costs is normal. Paying for advancement, being cut off from people outside the group, and any suggestion that sex is required are serious warning signs.`,
        },
        {
          id: 'q11',
          type: 'short',
          prompt: `In your own words, explain the difference between confidentiality and harmful secrecy in a coven, with an example of each.`,
          points: 3,
          explanation: `Confidentiality protects people (who is a member, what others share, the coven's own rites). Secrecy that hides harm protects the person doing harm. No promise can require you to hide abuse, crime or danger. Ask: "Who does keeping this secret protect?"`,
          rubric: `Full marks (3): explains that confidentiality protects members and the coven's private practice (1); explains that secrecy hiding abuse, crime or danger is never binding (1); gives a fitting example of each, such as not naming members vs. being told not to tell the police or a doctor (1).`,
        },
        {
          id: 'q12',
          type: 'short',
          prompt: `A practice has left you feeling anxious and unsettled for several hours. Describe what you would do, step by step.`,
          points: 3,
          explanation: `Stop the practice; ground yourself with food, water, feeling your feet and doing something ordinary; tell your mentor; seek medical or crisis help if it's severe or doesn't settle; rest from practice and return gently.`,
          rubric: `Full marks (3): stops the practice and grounds in a concrete way (1); tells the mentor (1); says they would seek professional or emergency help if it doesn't settle or if they feel unsafe, and returns gently or pauses (1).`,
        },
      ],
    },
  ],
  stages: [
    {
      title: `Beginning well`,
      intro: `Welcome. This first stage shows you how the course works, sets up your Grimoire and journal, and lays the ground rules of consent, safety and care that hold for everything that follows. Take your time with it.`,
      passed_by: 'mentor',
      tasks: [
        {
          title: `Learn how the course works`,
          kind: 'study',
          instructions: `1. Read "How this course works".
2. Open this step and find where you log, where the answer box is, and the conversation with your mentor.
3. In the answer box, write a short introduction: your name as you'd like to be called, what drew you to this coven, and anything you'd like your mentor to know about your health, access needs or time that might affect your practice (share only what you're comfortable sharing).`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 25,
          docs: ['core-welcome-how-this-course-works'],
        },
        {
          title: `Start your Grimoire and journal`,
          kind: 'book',
          instructions: `1. Read "Keeping your Grimoire and journal".
2. In the app, open Practice, then Grimoire, and make a section called "Coven training".
3. Make a page called "Why I'm here" and write a few sentences: what drew you, what you hope to learn, what you're nervous about. Date it.
4. Decide where you'll keep your practice journal (the answer boxes, the Grimoire, or a paper notebook) and write that choice in the answer box here.`,
          times: 1,
          response: 'text',
          checked_by: 'self',
          minutes: 30,
          docs: ['core-welcome-grimoire-and-journal'],
        },
        {
          title: `What a coven is`,
          kind: 'reflection',
          instructions: `1. Read "What a coven is, and isn't".
2. Ask your mentor (send a message on this step) what your coven calls itself, what its roles are called, and where its written agreements are.
3. In the answer box, write two or three sentences about what you hope a coven will give you, and one thing you're unsure or worried about.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 25,
          docs: ['core-welcome-what-a-coven-is'],
        },
        {
          title: `Consent, ethics and safety`,
          kind: 'study',
          instructions: `1. Read "Consent, ethics and safety", "Looking after your mind" and "Red flags in any group".
2. Check your practice space against the fire and candle safety list. Find your smoke alarm, and put a snuffer or a cup of water where you'll practise.
3. In your Grimoire, write an "If I'm struggling" page: who you'll contact, one grounding thing that helps you, and a reminder that pausing is allowed.
4. In the answer box, write one thing from these lessons that you hadn't thought about before, and any adaptation you'll need (for example, no flame, no incense, eyes open, seated practice).`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 50,
          docs: ['core-welcome-ethics-and-safety', 'core-welcome-mental-health', 'core-welcome-red-flags'],
        },
        {
          title: `Meet your mentor`,
          kind: 'meeting',
          instructions: `1. Arrange a first conversation with your mentor, in person, by call, or in the step's conversation here.
2. Talk about how often you'll be in touch, how they like to be contacted, and what pace suits you.
3. Ask anything the lessons left unclear.
4. Your mentor marks this done after you've talked.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
        },
        {
          title: `Take the test`,
          kind: 'study',
          instructions: `1. Take the Welcome test. You can have the lessons open.
2. Once you've passed, read each question's explanation: it teaches the point again.
3. Your mentor scores the written answers. You need 80 per cent to pass. If you don't, talk to your mentor about what to go over before you try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 20,
          quiz: 'quiz-core-welcome',
        },
      ],
    },
  ],
} satisfies CourseModule;
