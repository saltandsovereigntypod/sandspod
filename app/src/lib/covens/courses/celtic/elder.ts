// Celtic eldership: the tradition's own leadership for initiates called to
// lead, teach and care. Leading the fire festivals for a coven (fire-keeping,
// public and sacred sites, permissions, the living customs); the elder as
// host (hospitality, honour and fair judgement, from the briugu, the honour
// price and the ruler's truth); teaching the sources honestly and correcting
// common myths kindly; and the care that Otherworld and trance work asks of
// those who lead and watch over it. Modern practice marked as modern. British
// spelling.

import type { CourseModule } from '../types';
import { closed, coven, holy, page, ritual } from '../linkHelpers.ts';

export default {
  id: 'celtic-elder',
  title: 'Leading in the Celtic tradition',
  docs: [
    {
      id: 'celtic-elder-leading-the-fire-festivals',
      title: 'Leading the fire festivals',
      summary: 'How to plan and lead one of the four fire festivals for a coven: choosing the customs and the gods, roles, the fire-keeper and fire safety, outdoor and sacred sites and their permissions, meeting in the app, including newcomers and children, and what to do when it rains.',
      minutes: 16,
      links: [coven('ritual-builder'), coven('rituals'), page('calendar'), holy('celtic/bealtaine'), holy('celtic/samhain_gaelic'), ritual('green-fire-safe-bonfire-release')],
      body: `## From taking part to leading

By now you have kept all four fire festivals, taken every part of the coven's rite and learned it by heart. Leading a festival for others asks something more: you hold the whole gathering, so that everyone else can be present to it. This lesson is about leading the fire festivals in particular. The core elder lessons on leading ritual and holding space go with it.

## Planning

Start a month or more ahead. In the ritual builder, set out:

1. **The purpose.** What is this festival about, for this coven, this year? Samhain might centre on a member who has died; Lughnasadh on a skill the coven is learning together.
2. **The customs.** Choose one to three recorded customs to keep, and know where each was recorded: crosses and the brat Bríde at Imbolc; rowan, the fire and the dew at Bealtaine; the hill, the first fruits and games at Lughnasadh; the dead, the fire and divination games at Samhain. Fewer customs, done well, are better than many rushed.
3. **The gods.** Which gods will be honoured, and why, from the stories and the season.
4. **The shape.** The coven's usual rite, with the festival at its heart.
5. **Roles.** Leader, fire-keeper, sainer, poet or speaker, host, and someone to welcome newcomers. Give people their parts in good time, with their words.
6. **What's needed.** Fire materials, water, offerings, food, rushes, rowan, lanterns, first-aid kit.
7. **A wet-weather plan.** Ireland and Scotland are wet countries, and so are most places at Samhain and Imbolc.

Ask the coven's head to read your plan, and listen to what they say.

## The fire-keeper

At the fire festivals, the **fire-keeper** has the most important practical job. Choose someone steady and sober for the whole rite. They:

- check the site and any permission needed;
- build and light the fire, and keep it to a safe size;
- keep water, sand or an extinguisher to hand;
- watch the fire throughout, especially when people walk round it, pass offerings to it or jump embers;
- keep children and dogs at a safe distance;
- put the fire out completely, and make sure it is cold before anyone leaves.

> **Safety:** Many places forbid open fires, or need a permit. Never light fires in dry weather or high wind, under trees or on peat, which can smoulder underground for days. Use a raised fire pit or brazier where possible. Jumping is only ever over low embers, by willing adults, never with loose clothing or after drinking.

## Sites

Celtic covens are drawn to hills, wells, woods and old monuments. Some guidance:

- **Private land:** ask the owner, and follow their conditions.
- **Public land and parks:** check local rules on gatherings and fires.
- **Ancient monuments:** many are protected by law. Fires, candles, digging and leaving offerings can damage them and may be illegal. Hold your rite nearby, not on the monument itself, and leave no trace.
- **Holy wells and churchyards:** these are living Christian sites. Do not hold a pagan festival rite there. Visit quietly as guests, if at all.
- **Hills:** fine for Lughnasadh, but take the weather seriously; plan for everyone's fitness and mobility.

## Meeting in the app

Many covens gather in the app for some or all festivals. Each person keeps a candle, water and a small offering at home, and the leader speaks the rite. Customs adapt well: everyone weaves a cross at Imbolc together on camera, or lights a candle in their window at Samhain at the same time. Leave time for each person to speak, and plan how people take turns.

## Including everyone

- **Newcomers:** have someone welcome them, explain what will happen, and stand beside them.
- **Children:** many customs are good for children (crosses, lanterns, games, guising, berry-picking). Keep them away from the fire, and tell parents what will happen.
- **Disabled members:** plan access to the site, seating, and ways to take part without walking round a fire or climbing a hill.
- **Alcohol:** always have juice, milk or water as an equal choice.
- **The grieving:** at Samhain especially, some will be raw. Make space for tears, and have someone ready to sit with anyone who needs it.

## When things go wrong

Rain, a fire that won't light, a forgotten offering, someone unwell: things go wrong. Stay calm, say plainly what is happening, adapt, and carry on. The gods are not offended by the weather. If someone is hurt or taken ill, the rite stops; their care comes first, and the coven can finish later or another day. Afterwards, write down what you would do differently.

## After the festival

Within a day or two, ask people how it was for them. Write up the rite in the coven's book: what was done, which customs, where they came from, and what was learned. Over years, the coven's book becomes its own record of the Celtic year.

> **Your coven:** Ask the coven's head how they plan the festivals, who usually keeps the fire, and where the coven has permission to meet.

> **Try this:** Choose the next fire festival. Draft its plan in the ritual builder, following the steps above, and show it to the coven's head.

## What's old and what's modern

- **Old:** the festivals' customs, fires and gatherings, as recorded.
- **Modern:** planning a coven festival in the ritual builder, and the fire safety and access rules we keep today.`,
    },
    {
      id: 'celtic-elder-the-host',
      title: 'The elder as host: hospitality, honour and fair judgement',
      summary: 'Leadership in the spirit of the early Irish and Welsh sources: the briugu and the open house, the honour price and the dignity of every member, satire and its dangers, the ruler’s truth and fair judgement in the Audacht Morainn, and what these ask of an elder in a modern coven.',
      minutes: 16,
      links: [coven('standing'), coven('members'), coven('gathering'), ritual('kitchen-family-meal-blessing'), page('library')],
      body: `## Leading as a host

The early Irish and Welsh sources say much about how the powerful should behave. Their world was hierarchical and very different from ours, and we should not wish it back. But some of its ideals are a fine model for an elder in a Celtic coven, and they come from inside the tradition: the elder as **host**, as a keeper of **honour**, and as a **fair judge**.

## Hospitality

In early Ireland, certain landholders, the **briugu**, were bound by law to keep open house for any traveller: a fire always burning, a cauldron always on, food for whoever came. Their hostels stood at crossroads. The Triads of Ireland name "the cauldron of guests" among the three cauldrons in every fort. To refuse hospitality was shameful; to harm a guest under your roof was among the worst of crimes. In Welsh tales, too, the measure of a lord is how he treats his guests.

For an elder, hospitality means:

- **welcoming:** greeting newcomers by name, making sure they have somewhere to sit, someone to talk to, food and drink;
- **noticing:** who has not been for a while, who is quiet, who is struggling;
- **providing:** making sure the rite and the feast have what they need, and that no one carries everything alone;
- **including:** making room for people of every background, ability and level of experience;
- **protecting:** no one who comes to the coven's fire should be harmed there, in body, mind or reputation.

## Honour

Every free person in early Ireland had an **honour price**, lóg n-enech, "the price of the face". If someone was insulted, injured or wronged, compensation was owed according to their honour. Honour could be lost by lying, by failing in hospitality, by breaking one's word, or by being justly satirised.

We do not rank people's worth by price. But the idea that every person has a **face** that must not be shamed is a good one for a coven. An elder:

- never humiliates anyone, in a rite, in the app's messages or in private;
- corrects in private and praises in public;
- keeps people's confidences;
- makes amends quickly when they have wronged someone;
- protects the honour of those not present: no gossip.

## Satire and its dangers

The poets' satire was feared. The tales say a true satire could raise blisters on the face of an unjust king. In Cath Maige Tuired, the poet Coirpre satirises the stingy king Bres, who gave his guests no ale on their breath and no grease on their knives, and Bres's reign begins to fail.

Satire was meant to correct the powerful when they failed in generosity or justice. But it could also be used cruelly. In a coven, mockery, sarcasm and public criticism can do great harm, and they are especially damaging from those with authority. An elder may need to speak hard truths, even to the coven's head. Do it face to face, privately, with care, and for the good of the coven, never to wound.

## Fair judgement

The **Audacht Morainn**, "the Testament of Morann", an early Irish text of advice to a king, perhaps from about 700, teaches that through the ruler's truth, **fír flathemon**, the land is fruitful, the weather mild, the cattle give milk, and plagues and enemies are kept away. A false judgement could blight the land. The king must judge fairly, listen to both sides, and not take bribes or favour his friends.

An elder is not a king, and covens make decisions in many ways. But elders are often asked to help settle disputes, decide who takes which role, judge whether someone is ready, or score a written answer. The ruler's truth asks you to:

- **listen to both sides** fully before deciding;
- **declare your interests:** if a friend or partner is involved, step back;
- **judge by the coven's agreements,** not by your feelings about a person;
- **say why** you decided as you did;
- **admit mistakes** and put them right.

The core elder lessons on governance, conflict and scoring answers teach the practical side.

## Generosity

The worst fault of a leader in the Irish tales is meanness. Bres's failure was that he was stingy. A good host gives: time, attention, food, knowledge, credit. An elder who hoards knowledge, takes credit for others' work, or uses the coven to serve themselves is failing as a host.

## Limits

Hospitality has limits too. A host who lets one guest abuse another has failed everyone. An elder must sometimes ask someone to leave a rite or a conversation, or bring a problem to the coven's head, for the sake of the other guests. The coven's agreements say how.

## The host is also a guest

One more thing the sources suggest: in the rite, the coven hosts the gods, the ancestors and the spirits of the land, but it is also a guest on their land and in their presence. An elder who remembers this leads with less self-importance. You are not the owner of the fire; you are its keeper for the evening.

> **Your coven:** Ask the coven's head how elders here welcome newcomers, handle disputes, and raise concerns about leadership.

> **Try this:** Write three triads of your own about how an elder of this coven should behave, drawing on hospitality, honour and fair judgement. Share them with the coven's head.

## What's old and what's modern

- **Old:** the briugu and hospitality law, the honour price, the poets' satire, and the ruler's truth in the Audacht Morainn.
- **Modern:** applying these ideals to leadership in a small, equal, voluntary coven.`,
    },
    {
      id: 'celtic-elder-teaching-the-sources',
      title: 'Teaching the Celtic sources honestly',
      summary: 'How to teach Celtic paganism with integrity: always naming sources, separating evidence from interpretation and modern practice, the common myths to correct (the tree calendar, the eightfold Wheel, Iolo’s triads, hereditary witches, druids at Stonehenge, the triple goddess), how to correct kindly, and teaching respect for the living cultures.',
      minutes: 15,
      links: [closed(), coven('programs'), page('library'), page('closed-guide'), coven('book')],
      body: `## Why honesty matters most here

Every tradition needs honest teachers. Celtic paganism needs them more than most, because it is surrounded by romance, invention and commerce: books and websites full of "ancient Celtic" wisdom that is nothing of the kind. A teacher who passes on those claims, even innocently, misleads the people who trust them. A teacher who is honest about the sources gives their students something solid to stand on.

## The habits of an honest teacher

1. **Name your sources.** "Cormac's Glossary says...", "MacNeill recorded...", "This is from Iolo Morganwg...", "This is our coven's own practice." It becomes second nature.
2. **Separate the four kinds of knowing:** the evidence, scholarship, shared modern practice, and personal experience. Say which you are giving.
3. **Mark the modern as modern,** without apology. "This is modern, and it is good" is a perfectly honest sentence.
4. **Say "we don't know"** when we don't. It is the most important sentence in Celtic studies.
5. **Point people to good books,** and to the sources themselves in translation.
6. **Keep learning.** Scholarship changes. What you were taught twenty years ago may be out of date.

## Common myths to correct

Here are some claims you will hear, and what to say:

- **"The Celtic tree calendar is ancient."** It was devised by Robert Graves in The White Goddess (1948).
- **"The eightfold Wheel of the Year is the Celtic calendar."** The Gaelic year had four quarter days; the eightfold Wheel is a twentieth-century creation of Wicca and Druidry.
- **"These druid triads are ancient wisdom."** Most come from Iolo Morganwg's Barddas, published 1862, partly forged.
- **"The awen symbol is ancient."** It was invented by Iolo Morganwg. The word awen, inspiration, is old Welsh.
- **"My family are hereditary Celtic witches" / "This is an unbroken druid lineage."** No such lines are known to exist.
- **"The druids built Stonehenge."** It was built long before any druid.
- **"Every Celtic goddess is maiden, mother or crone."** The triple goddess in that form is a modern idea, largely from Graves.
- **"Samhain was the festival of a death god called Samhain."** A modern error; there was no such god.
- **"Bealtaine means the fire of Bel."** Most scholars doubt it.
- **"Saint Brigid never existed; she is just the goddess."** The relationship is debated; the saint's historical existence is generally accepted.
- **"Celtic Christianity was a nature religion opposed to Rome."** A romantic modern idea; the early Irish and Welsh churches were part of the wider church.
- **"Ogham was a secret druidic tree language."** The stones are mostly memorials with names; divination with ogham is modern.

## Correcting kindly

Most people who repeat these things learned them from books they trusted. Correct gently:

- **Ask before you correct,** where you can: "Where did you come across that?"
- **Share what you know,** with the source: "As far as I know, that comes from Graves in 1948."
- **Don't shame.** You probably believed something similar once.
- **Leave room** for the person to keep the practice if they love it, now knowing where it comes from.
- **Be humble** about your own knowledge; you may be wrong too.

## Teaching respect for the living cultures

An elder teaches respect by example. Teach newcomers:

- that Celtic paganism is open, but borrows from living peoples;
- that many customs, such as Brigid's crosses, holy wells and Reek Sunday, belong to living Christian faith, and to keep them as guests;
- to learn some of a Celtic language, and to give back;
- to use the Sanctuary's closed and living traditions guide.

Avoid speaking of the Irish, Scots or Welsh as though they were a lost ancient people. They are living nations with their own politics, arts, faiths and opinions, including about pagans.

## Teaching the gods

When you teach about a god, start with the stories and the evidence, then add modern practice and personal experience, clearly marked. Encourage students to read the tales themselves. Resist the temptation to give a neat label ("Lugh, god of light"); give the story instead.

## Teaching through practice

The best teaching in this tradition happens at the hearth and the fire, not only on the page. Let students take parts in rites early, practise with them, and learn by doing; then show them where each part comes from.

## When students disagree with you

Good students will question you, and sometimes they will be right. Welcome it. Look at the source together. If you were wrong, say so plainly; it teaches more than any lesson. If the evidence is unclear, say that too, and let the student hold their own view. A coven where people can disagree about the sources without falling out is a healthy one.

## Scoring written answers

When you score a written answer in these courses, look for honest use of sources more than for agreement with you. A student who says "I'm not sure, and here's why" about a debated question has understood more than one who repeats a confident myth. The core lesson on scoring teaches the method.

> **Your coven:** Ask the coven's head which books and sources the coven trusts, and whether it keeps a list of common myths with notes for teachers.

> **Try this:** Choose one myth from the list above that you once believed, or still half do. Write how you would explain its true source, kindly, to a newcomer who loves it.

## What's old and what's modern

- **Old:** the sources the teaching rests on.
- **Modern:** critical scholarship, and the habit of naming sources and marking the modern, which this coven keeps.`,
    },
    {
      id: 'celtic-elder-otherworld-care',
      title: 'Otherworld work and the care it asks',
      summary: 'Journeying, trance and visionary work in modern Celtic practice: the voyages and adventures of the tales (immrama and echtrai) and what they do and don’t teach, imbas forosnai as a literary account, modern guided journeys marked as modern, and how an elder prepares, watches over and cares for people before, during and after strong work, with safety and mental health first.',
      minutes: 16,
      links: [ritual('hedge-inner-landscape-journey'), ritual('hedge-warding-before-spirit-work'), ritual('kitchen-solitary-grounding-centering'), coven('rituals'), page('journal'), holy('celtic/samhain_gaelic')],
      body: `## Journeys in the tales

The medieval tales are full of journeys to the Otherworld. In the **immrama**, the voyage tales, heroes sail west to wondrous islands: in Immram Brain, "the Voyage of Bran", a woman of the Otherworld calls Bran across the sea, Manannán rides past him over the waves in a chariot, and Bran's companion, returning home, crumbles to dust as the years catch up with him. In the **echtrai**, the adventures, people enter the síd, as Nera does at Samhain, or are taken away. Welsh tales tell of Pwyll in Annwn and Arthur's raid for a cauldron in Preiddeu Annwfn.

Medieval texts also describe ways of gaining vision. Cormac's Glossary describes **imbas forosnai**, "illuminating knowledge", in which a poet chews raw flesh, chants over it, and lies in sleep or seclusion to receive a vision; it says Saint Patrick banned it. Other texts mention seers who prophesied, and the Morrígan's great prophecy at the end of Cath Maige Tuired.

These are **literary accounts**, written by Christians, sometimes describing practices they disapproved of. They show that medieval Irish writers imagined the Otherworld as close and vision as possible. They do not give us a method to follow, and no one today can claim to practise the ancient imbas forosnai.

## Modern Otherworld work

Many modern Celtic pagans do some form of **visionary or journey work**: guided meditations to an inner Otherworld, journeys to meet gods or ancestors, trance with drumming or chanting, dream work, and seership. These are **modern practices**, drawing on the tales, on Druid training, on psychology and on traditions from elsewhere. Some are excellent. Some, especially those borrowed from Indigenous cultures as "shamanism", raise questions of respect; the closed and living traditions guide covers these.

The folk tradition itself urges caution. Its stories of the Otherworld are full of people who did not come back, or came back changed, or found that years had passed. Its stance towards the good neighbours was courtesy and protection, not friendship sought. A Celtic coven that does Otherworld work should take that seriously.

## Before

As an elder leading or watching over journey or trance work:

1. **Know the people.** Do not lead strong visionary work with newcomers, or with anyone you do not know well.
2. **Ask about health.** Some practices are unwise for people with a history of psychosis, dissociation, severe trauma, epilepsy (with drumming or flickering light), or in a mental health crisis. Ask privately and kindly, and respect what you are told. When in doubt, don't.
3. **Explain** what will happen, how long it will last, and how anyone can stop.
4. **Agree a signal** for "I need to stop" and "I need help".
5. **Ward and ground.** Begin with grounding and protection, as the coven practises it: saining, a circle of rowan or iron, a protective blessing.
6. **No substances.** No drugs or alcohol are used, or allowed, in this coven's Otherworld work.

## During

- **Someone stays out of trance** to watch over everyone: an elder or another experienced member. That is their only job.
- **Watch for distress:** crying that does not settle, shaking, panic, confusion, someone who does not come back when called.
- **Bring people back gently,** by name, with a familiar voice, touch only if they have agreed to it.
- **Keep time.** Journeys should have a clear end.

## After

- **Ground everyone:** food and drink, feet on the floor, hands in water or on the earth, ordinary talk.
- **Let people speak** about their experience if they wish, without others interpreting it for them.
- **Check on each person** before they leave, and the next day.
- **Remind people** of discernment: write it down, wait, test it.
- **Watch for after-effects:** sleeplessness, anxiety, a sense of unreality, or feeling haunted. These need attention.

> **Safety:** If anyone is distressed after Otherworld work for more than a day or two, or shows signs of losing touch with reality, help them get medical support. Spiritual practice is never a substitute for medical or psychological care. The death of Bridget Cleary in 1895, killed by her husband who believed she was a changeling, is a lasting reminder of what can happen when Otherworld beliefs are allowed to override care.

## Saying no

An elder may decline to lead or allow Otherworld work, or decline someone's wish to take part, for their safety. That is a duty, not a failure of nerve.

## Gentler ways

Not every coven needs trance or journey work at all. Much of the Otherworld's presence in Celtic tradition is met in gentler ways: keeping courtesy at a lone thorn, sitting quietly by a spring at dusk, telling the old voyage tales aloud by the fire at Samhain, or leaving a dish for the good neighbours. These ask far less care and carry far less risk, and many people find them enough for a lifetime. Offer them first.

> **Your coven:** Ask the coven's head whether the coven does any journey or trance work, who may lead it, and what care it takes.

> **Try this:** With the coven's head, write a short checklist for watching over others in Otherworld or trance work: before, during and after. Add it to the coven's book.

## What's old and what's modern

- **Old:** the immrama and echtrai, imbas forosnai and other accounts of vision in medieval literature, and the folk caution about the Otherworld.
- **Modern:** guided journeys and trance work in Celtic paganism, and the care described here.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-celtic-elder',
      title: 'Leading in the Celtic tradition: test',
      intro: 'Thirteen questions on leading the fire festivals, the elder as host, teaching the sources honestly, and care in Otherworld work. Most are scored at once; the coven’s head or your mentor reads the written answers. You need 80% to pass, and you can try again.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'multi',
          prompt: 'Which are the fire-keeper’s duties? Choose all that apply.',
          options: ['Checking the site and permissions', 'Watching the fire throughout', 'Leading the praise of the gods', 'Making sure the fire is cold before anyone leaves'],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'The fire-keeper is responsible for the fire’s safety from start to finish. The praise is another role.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'Where should a coven NOT hold a pagan fire festival rite?',
          options: ['A garden with the owner’s permission', 'A holy well that is a living Christian site, or on a protected monument', 'Online in the app', 'A park where gatherings are allowed'],
          correct: [1],
          points: 1,
          explanation: 'Holy wells and churchyards are living Christian sites, and monuments are protected. Gather nearby, as guests, leaving no trace.',
        },
        {
          id: 'q3',
          type: 'truefalse',
          prompt: 'Lighting a fire on peat is fine as long as the flames are small.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. Peat can smoulder underground for days. Never light fires on peat.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'Who were the briugu of early Ireland?',
          options: ['Poets', 'Hospitallers bound by law to keep open house for travellers', 'Druids', 'Warriors'],
          correct: [1],
          points: 1,
          explanation: 'The briugu kept open house, with a fire and cauldron always ready: a model for an elder as host.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'What does the Audacht Morainn teach about the ruler’s truth (fír flathemon)?',
          options: ['That kings may judge as they please', 'That through the ruler’s truth the land flourishes, and a false judgement can blight it', 'That only druids may judge', 'That truth does not matter'],
          correct: [1],
          points: 1,
          explanation: 'The ruler’s truth brings plenty and peace; fair judgement is a sacred duty.',
        },
        {
          id: 'q6',
          type: 'multi',
          prompt: 'How should an elder protect members’ honour? Choose all that apply.',
          options: ['Correct in private and praise in public', 'Keep confidences', 'Mock people who make mistakes in rites', 'Make amends quickly when they have wronged someone'],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Mockery shames. An elder protects every member’s face.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'Why does Bres’s reign begin to fail in Cath Maige Tuired?',
          options: ['He lost his hand', 'He was stingy to his guests and was satirised by the poet Coirpre', 'He forgot Samhain', 'He married a goddess'],
          correct: [1],
          points: 1,
          explanation: 'Bres’s meanness as a host brought satire and the loss of his kingship: the worst fault of a leader in the tales.',
        },
        {
          id: 'q8',
          type: 'multi',
          prompt: 'Which of these claims are modern rather than ancient? Choose all that apply.',
          options: ['The awen symbol', 'The Celtic tree calendar', 'The triple goddess as maiden, mother and crone', 'The ogham stones'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'The awen symbol (Iolo), the tree calendar (Graves) and the maiden-mother-crone goddess (largely Graves) are modern. The ogham stones date from the fourth to seventh centuries.',
        },
        {
          id: 'q9',
          type: 'single',
          prompt: 'What is the kindest good way to correct a myth someone repeats?',
          options: ['Tell them publicly they are wrong', 'Ask where they came across it, share what you know with its source, and leave them room', 'Ignore it always', 'Tell them to leave the coven'],
          correct: [1],
          points: 1,
          explanation: 'Gentle, sourced correction without shame. You probably believed something similar once.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'How should imbas forosnai in Cormac’s Glossary be understood?',
          options: ['As an ancient method this coven practises', 'As a literary account by a Christian writer; it gives no method to follow', 'As a modern invention', 'As an ogham letter'],
          correct: [1],
          points: 1,
          explanation: 'It is a medieval description, saying Patrick banned it. No one can claim to practise the ancient imbas forosnai.',
        },
        {
          id: 'q11',
          type: 'multi',
          prompt: 'In Otherworld or trance work, which are part of good care? Choose all that apply.',
          options: ['Someone stays out of trance to watch over everyone', 'Agreeing a signal to stop', 'Using alcohol to deepen the trance', 'Grounding everyone with food and drink afterwards'],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'A watcher, a stop signal and grounding are essential. No substances are used in this coven’s Otherworld work.',
        },
        {
          id: 'q12',
          type: 'long',
          prompt: 'Describe the fire festival you planned and led: its purpose, the customs and where they were recorded, the gods, the roles, how you kept it safe and inclusive, and what you learned.',
          points: 4,
          explanation: 'Leading a festival well brings together everything in this module.',
          rubric: 'Full marks (4): a clear purpose and named customs with accurate sources (1); gods and roles chosen with reasons (1); concrete safety and inclusion measures, including the fire-keeper and wet-weather or access plans (1); honest reflection on what went well and what they would change (1).',
        },
        {
          id: 'q13',
          type: 'short',
          prompt: 'Share three triads you wrote about how an elder of this coven should behave.',
          points: 2,
          explanation: 'Triads are a traditional way to teach values.',
          rubric: 'Full marks (2): three triads in the proper form, a heading and three items (1); drawing clearly on hospitality, honour or fair judgement as the lesson teaches them (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Leading in the Celtic tradition',
      intro: 'Here you learn the tradition’s own leadership: leading the fire festivals safely and well, leading as a host who keeps everyone’s honour and judges fairly, teaching the sources honestly, and caring for those who take part in strong Otherworld work. You plan and lead a festival, teach, and work with the coven’s head on the coven’s practice.',
      passed_by: 'manager',
      tasks: [
        {
          title: 'Plan a fire festival',
          kind: 'ritual',
          instructions: `1. Read "Leading the fire festivals".
2. Plan the next fire festival for the coven in the ritual builder: purpose, customs and their sources, gods, shape, roles, the fire-keeper, what's needed, and a wet-weather plan.
3. Ask the coven's head to look it over, and in the answer box note what you changed after their feedback.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 120,
          docs: ['celtic-elder-leading-the-fire-festivals'],
          links: [coven('ritual-builder')],
          solitary: 'Plan a fire festival for a small group of friends or a local moot, in the ritual planner, and ask an experienced Celtic pagan or Druid you trust to read it over.',
        },
        {
          title: 'Lead the festival',
          kind: 'ritual',
          instructions: `1. Lead the festival you planned, in the role agreed with the coven's head.
2. Afterwards, ask people how it was for them, and write it up for the coven's book.
3. In the answer box, write what went well, what you'd change, and what you learned about holding a gathering.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 150,
          docs: ['celtic-elder-leading-the-fire-festivals'],
          links: [coven('rituals')],
          solitary: 'Lead the festival you planned for friends or a moot, or, if that isn’t possible, keep it alone in full as though leading others, and write what you would need to do differently with a group.',
        },
        {
          title: 'The elder as host',
          kind: 'reflection',
          instructions: `1. Read "The elder as host: hospitality, honour and fair judgement".
2. Do the "Try this": write three triads about how an elder should behave.
3. In the answer box, share your triads and one way you will practise hospitality in the coven this season.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 45,
          docs: ['celtic-elder-the-host'],
          links: [coven('members')],
        },
        {
          title: 'Teach honestly',
          kind: 'service',
          instructions: `1. Read "Teaching the Celtic sources honestly".
2. Teach a newcomer or a devotee one topic from this course (a festival, a god, the sources, ogham), in person or in the app, naming your sources.
3. In the answer box, write what you taught, one myth you corrected or might have, and how you marked what was modern.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 60,
          docs: ['celtic-elder-teaching-the-sources'],
          links: [coven('programs')],
          solitary: 'Write a short teaching piece on one topic for someone new to Celtic paganism, with its sources named and the modern marked, and share it in a moot, an online group or with a friend who asked.',
        },
        {
          title: 'Care in Otherworld work',
          kind: 'meeting',
          instructions: `1. Read "Otherworld work and the care it asks".
2. With the coven's head, write a checklist for watching over others in Otherworld or trance work: before, during, after.
3. Add it to the coven's book, and log this task when it is done.`,
          times: 1,
          response: 'none',
          checked_by: 'manager',
          minutes: 60,
          docs: ['celtic-elder-otherworld-care'],
          links: [coven('book')],
          solitary: 'Write the checklist yourself, for any journey or trance work you might take part in with others at a moot or gathering, and keep it in your book.',
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Re-read any lesson you're unsure of.
2. Take the test. The choice questions are scored at once; the coven's head or your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          quiz: 'quiz-celtic-elder',
          links: [closed()],
        },
      ],
    },
  ],
} satisfies CourseModule;
