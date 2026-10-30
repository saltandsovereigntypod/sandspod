// Celtic seeker: a short, honest taste of Celtic paganism for someone in their
// first thirty days, deciding whether this coven is right for them. What
// "Celtic" means (two living language families, the Gaelic and the
// Brythonic), what the sources are and are not, the three main modern ways of
// practising, and the living cultures this practice borrows from; one simple
// first practice (kindling a light and giving a gift at the hearth); and what
// a Celtic rite is like for a newcomer, and what a devotee is asked.
// Reconstructionist-informed, modern practice marked as modern. British
// spelling.

import type { CourseModule } from '../types';
import { candle, closed, coven, deity, holy, journey, page, ritual, vessel } from '../linkHelpers.ts';

export default {
  id: 'celtic-seeker',
  title: 'A first taste of Celtic paganism',
  docs: [
    {
      id: 'celtic-seeker-celtic-practice-in-brief',
      title: 'Celtic paganism in brief',
      summary: 'A short, honest introduction: what “Celtic” means, the Gaelic and Brythonic streams, what the old sources can and cannot tell us, the three main ways people practise today, and the living cultures this practice owes so much to.',
      minutes: 13,
      links: [journey('path-celtic'), deity('brigid'), deity('dagda'), deity('rhiannon'), closed(), page('calendar'), holy('celtic/samhain_gaelic')],
      body: `## Welcome

You are in your first thirty days with a coven whose practice is Celtic, finding out whether it is right for you. There is no hurry and no wrong answer. This short course gives you a taste: what Celtic paganism is, one simple thing to try at home, and what joining would ask of you. Your coven's general welcome lessons cover how the coven works, your rights, and what to watch for in any group.

## What "Celtic" means

The word Celtic is used in many ways, and it helps to be exact from the start.

Most carefully, **Celtic is a family of languages.** Six are still spoken, in two branches:

- **Gaelic (Goidelic):** Irish, Scottish Gaelic and Manx.
- **Brythonic (Brittonic):** Welsh, Cornish and Breton.

Other Celtic languages, such as Gaulish in what is now France, died out in the ancient world. The ancient Greeks called some peoples north of them Keltoi, and the name stuck, but the people of early Ireland and Britain did not call themselves Celts. There was never one Celtic nation, one Celtic religion or one Celtic people. There were many peoples, speaking related languages, sharing some gods and customs and differing in others.

So this course speaks of two **streams**:

- **The Gaelic stream:** the gods, stories and folk customs of Ireland, Gaelic Scotland and the Isle of Man: the Tuatha Dé Danann, Brigid, Lugh, the Dagda, the Morrígan, Manannán, and the four fire festivals of Samhain, Imbolc, Bealtaine and Lughnasadh.
- **The Brythonic stream:** the gods, stories and folk customs of Wales, Cornwall and Brittany: the Four Branches of the Mabinogi, Rhiannon, Arianrhod, Brân, Gwydion, Cerridwen and Taliesin, and the Welsh calends of winter and May.

Your coven may lean towards one stream, or keep both side by side. Behind both stand the older Celtic peoples of Britain and Gaul, known to us mostly from archaeology and from what Greek and Roman writers said about them.

> **Your coven:** Ask your mentor which stream your coven leans towards, whether it has a name for itself (a coven, a grove, a hearth), and which gods it honours most.

## What we know and what we don't

Here is the honest heart of Celtic paganism: **we have no sacred texts from the pagan Celts themselves.** Their learned people, the druids and poets, taught by word of mouth. What we have instead is:

- **what outsiders wrote,** chiefly Greek and Roman authors such as Julius Caesar, who were often hostile and sometimes wrong;
- **archaeology:** shrines, offerings in lakes and rivers, carvings and inscriptions to gods;
- **medieval literature** from Ireland and Wales, such as the Mabinogi and the tales of the Tuatha Dé Danann, written down centuries after the conversion, by Christian monks and scholars;
- **folklore** gathered in the last three hundred years from Irish, Scottish, Manx, Welsh, Cornish and Breton country people, most of them devout Christians.

Each kind of source has its limits, and the tradition lessons teach them in depth. Together they give us a great deal: gods, stories, festivals, values and customs. What they do not give us is a complete pagan religion ready to step into. Every modern Celtic pagan fills the gaps with something, and the honest ones say what they have filled.

## Three ways of practising

You will meet three main approaches, often mixed:

1. **Celtic Reconstructionism,** or Gaelic Polytheism on the Irish and Scottish side: practice built as closely as possible on the evidence and the living cultures, with study of the sources and, often, of a Celtic language.
2. **Druidry:** modern orders such as the Order of Bards, Ovates and Druids (OBOD, founded 1964) and Ár nDraíocht Féin (ADF, founded 1983), with their own rituals, grades and courses, drawing on the sources and on two centuries of revival.
3. **Celtic-flavoured eclectic practice:** witchcraft or Wicca that works with Celtic gods and festivals in its own framework of circle and quarters.

All three are modern. All three can be practised with integrity. This course is reconstructionist-informed: it teaches from the sources, tells you plainly where they stop, and marks modern practice as modern, including its own.

## Living cultures

The Gaelic and Welsh languages are alive, spoken in homes, schools and on the radio. Many of the customs this practice draws on, such as Brigid's crosses and visits to holy wells, are still kept today, mostly by Catholic and other Christian communities, as part of their own faith. Celtic paganism is open to anyone, but it borrows from living people, and it asks you to do so with respect: to learn rather than to take, and never to pass off someone's living Christian custom as a secret pagan survival. The Sanctuary's guide to closed and living traditions explains how to think about this, and a later lesson goes further.

## What you are asked to believe

Very little, at this stage. There is no creed and no holy book. Celtic pagans honour, in different proportions, **the gods**, **the ancestors** and **the spirits of the land**, and they keep the turning year. People hold many views of what the gods are. What a coven asks is that you join its rites with respect, learn honestly, and keep your word.

> **Try this:** Open the app's calendar and find the next of the four Celtic fire festivals. Read its page, including the "What we don't know" part. Note anything you want to ask your mentor.

## What's old and what's modern

- **Old:** the gods' names, the four quarter days, the stories (as written by medieval Christians), offerings to waters, and the folk customs recorded by collectors.
- **Modern:** every Celtic pagan religion practised today, its rituals and its covens, groves and orders, from the eighteenth-century Druid revival onwards.`,
    },
    {
      id: 'celtic-seeker-a-first-practice',
      title: 'A first practice: a light and a gift at the hearth',
      summary: 'One simple practice to try at home: kindling a light as the centre of the house, giving a small gift of milk, bread or oats to the gods, the ancestors and the land, and listening. Step by step, with what you might notice, what to do if you notice nothing, and how to give the gift back to the earth.',
      minutes: 13,
      links: [ritual('folk-smooring-the-fire'), ritual('hedge-house-spirit-offering'), vessel('offering_bowl'), candle('white'), page('altar'), page('journal')],
      body: `## Why start here

In the Gaelic and Welsh past the hearth was the centre of the home: the fire that cooked, warmed and gave light, kept alive day and night. Folk collectors in the Scottish Highlands and Islands recorded prayers said while kindling the fire in the morning and banking it, or smooring it, at night. Hospitality, the giving of food to guests, was one of the highest duties in early Irish and Welsh society.

This practice brings those two things together in a small, modern way: you kindle a light at your own hearth, and you give a little gift. It is a good way to find out how this kind of relationship feels to you. You do not have to believe anything to try it. Do it three times over your first month, and notice honestly what happens.

## What you need

- **A candle or a lamp,** to be your hearth. One white candle or a tealight is perfect. An electric candle is fine where flame is a problem.
- **A heat-proof surface,** such as a plate or tile, on a table or shelf where nothing can catch.
- **A small dish or cup.**
- **A small gift:** a little milk, cream or butter, a crumb of oatcake or bread, a pinch of oats, or a splash of clean water. These are the good things of an old Gaelic or Welsh farm, and of folk offerings recorded from those places.
- **A quiet ten minutes,** and something to write with, or the app's journal.

> **Safety:** Keep the flame on a heat-proof surface, away from curtains, books, hair and sleeves, and out of reach of children and pets. Never leave it burning when you leave the room or go to sleep.

## The practice, step by step

1. **Settle.** Sit or stand before the candle and dish. Put your phone away. Breathe in slowly for a count of four and out for a count of six, five times.
2. **Kindle the light.** Light the candle and say, aloud or quietly, something like: "I kindle this light at the centre of my home. Let it be a hearth for the gods, the ancestors and the spirits of this place." Use your own words if you prefer.
3. **Name who you are greeting.** You can greet all three kinds of being together, which many Celtic pagans do: the gods (the "shining ones" or "the gods of my people", or a god you are drawn to, such as Brigid), the ancestors (your own dead, by name if you like), and the spirits of the land where you live.
4. **Give the gift.** Pour or place the gift in the dish, saying what it is and who it is for: "Here is milk for you, freely given, with thanks." A gift is the heart of the practice: you give first, with nothing asked in return.
5. **Sit and listen.** For three to five minutes, be with the light. Notice your breathing, the room, your body and your feelings. If you wish, say something about your day, or ask a question, and then listen: notice any thought, image or feeling that comes, without deciding yet what it means.
6. **Thank and close.** Say something like: "Thank you for your company. Go well." Put out the candle by snuffing or pinching it.
7. **Give the gift to the earth.** Later that day or the next morning, take the gift outside and pour it on the ground, at the foot of a tree or plant, or bury it. If you have no garden, use a pot plant's soil for a liquid, or wrap a crumb in paper and put it in food waste with a word of thanks. In Irish and Scottish custom, food given to the good folk or the dead was not eaten afterwards; treat yours the same way.
8. **Write.** In the app's journal, note the date, what you did, and anything you noticed, even if it was very little.

## What people notice

All of these are common:

- a sense of calm, or of the room feeling different;
- warmth, tingling or heaviness in the body;
- an emotion arriving unexpectedly, sometimes sadness when thinking of the dead;
- an image, word or memory that seems to come from nowhere;
- a sense of company, or of being listened to;
- nothing at all, beyond a pleasant few minutes with a candle.

**Noticing little is completely normal.** Relationship with gods, ancestors and land grows slowly, like any friendship. Keep your notes honest; they will help you more than notes that say what you hoped for.

## Common difficulties

- **"Who am I talking to?"** You do not have to know yet. Greeting "the gods, the ancestors and the spirits of this place" is honest and enough.
- **"I don't have Celtic ancestors."** You don't need them. The gods of a tradition are not owned by bloodlines, and your own ancestors, whoever they were, are welcome at your hearth.
- **"Isn't wasting food wrong?"** Keep the gift small. A spoonful given with care means more than a plateful given carelessly.
- **"I can't light candles."** Use an electric candle, or sit by a window and treat the daylight as your hearth.

## Where this comes from

Be clear about what is old and what is new here. The importance of the hearth, the kindling and smooring prayers, the duty of hospitality, and gifts of milk and butter to the good folk are all well recorded in Irish, Scottish and Welsh sources. The kindling and smooring prayers that Alexander Carmichael collected in the Hebrides are Christian prayers, addressed to the Trinity and the saints; the ready-made Smooring the Fire ritual in the app uses his public-domain translation, and the devotion lessons explain how to use such prayers with respect. Putting gods, ancestors and land spirits together at one candle in a modern home is a **modern practice**, built from these older pieces.

> **Your coven:** Your coven may greet the gods by particular names, or use a particular blessing. Ask your mentor whether there are words they would like you to use, or whether your own are welcome.

> **Try this:** After your third time, read your three notes together. Is anything the same each time, or changing? Bring what you noticed to your mentor.

## What's old and what's modern

- **Old:** the hearth as the heart of the home, hospitality, and gifts of milk and butter.
- **Modern:** this small rite of kindling and giving at a candle, as a daily or weekly practice for anyone.`,
    },
    {
      id: 'celtic-seeker-a-rite-and-what-is-asked',
      title: 'What a Celtic rite is like, and what is asked of a devotee',
      summary: 'What to expect at your first rite with a Celtic coven: saining, kindling, honouring the land, the ancestors and the gods, offerings, praise and hospitality; what to wear and bring; what you may always say no to; and what becoming a devotee would ask of you.',
      minutes: 14,
      links: [coven('rituals'), coven('standing'), holy('celtic/bealtaine'), ritual('folk-brigid-cross-well'), page('calendar'), journey('path-celtic')],
      body: `## Your first rite

Going to your first rite can feel daunting. This lesson tells you what usually happens, so nothing takes you by surprise. Celtic covens differ more than most, because each builds its rites from the sources in its own way. Ask your mentor about your coven's.

Many covens invite newcomers to one of the four fire festivals, or to a simpler open rite. Some meet outdoors by a fire, a tree or water; some indoors around a candle; some in the app, each at their own hearth.

## What usually happens

Here is a common shape, in brief. The ritual module teaches each part in depth. Nothing here is an ancient liturgy: no complete pagan Celtic rite survives, and this is a modern shape built from the sources.

1. **Gathering.** People arrive, talk and quiet down. Some covens ask you to wash your hands and face beforehand.
2. **Saining.** The people and the place are blessed and cleansed, often with water sprinkled from a bowl, sometimes with the smoke of juniper or another herb, an old Scottish custom. People move round the space **sunwise**, in the direction the sun travels (in Irish deiseal, in Scottish Gaelic deiseil).
3. **Kindling.** A fire or a candle is lit at the centre, with words of blessing. It is the coven's shared hearth for the rite.
4. **Honouring the powers.** The leader, or everyone in turn, greets the spirits of the land, the ancestors and the gods. Some covens greet the three realms of land, sea and sky. Others, especially those influenced by ADF Druidry, work at a fire, a well and a tree.
5. **Praise and offering.** The gods of the occasion are praised, often in poetry, and given gifts: milk, butter, oatcakes, bread, honey, ale or whiskey (or juice), poured or placed, or given to the fire.
6. **The heart of the rite.** At a festival, its customs: weaving Brigid's crosses at Imbolc, walking round the fire at Bealtaine, sharing first fruits at Lughnasadh, setting a place for the dead at Samhain.
7. **An omen.** Some covens draw an ogham stave or watch the fire for a sign of whether the offerings were welcome. This is a modern practice.
8. **Hospitality.** Food and drink are blessed, the first portion set aside for the gods or the dead, and the rest shared.
9. **Thanks and closing.** Everyone who was greeted is thanked, the fire is put out or banked, and the offerings are later given to the earth, water or fire.

A rite might last from half an hour to two hours, with a feast after.

## What to wear and bring

Ask your mentor. Most Celtic covens wear ordinary clothes, sometimes something special or seasonal. If you meet outdoors, dress for the weather: wet grass and fires in the dark are common at Samhain and Imbolc. Bring a little food to share at the feast, and a small gift for the offering if you like: something you made, baked, grew or bought with care.

## What you may always say no to

At every rite, as a newcomer and as a member, you may:

- watch and follow rather than speak;
- decline a role, a reading or a turn;
- choose juice, milk or water instead of alcohol (it is never required);
- stand back from the fire, a dance or anything that feels unsafe;
- leave the rite at any time, for any reason;
- refuse any touch you do not want.

No genuine coven requires money for teaching, sex, secrets that would hide harm, or cutting yourself off from friends and family. The welcome lessons cover these red flags in detail.

## Fire and weather

Fire is at the heart of the four festivals. At a coven fire, follow the fire-keeper's lead: keep loose clothing and hair back, don't throw things in unless asked, watch children and dogs, and stand back if smoke troubles you. Indoors, a candle does the same work.

## What is asked of a devotee

If you decide to carry on, the next step is the **devotee** program. A devotee is someone who has chosen this coven and its Celtic practice and wants to learn properly. It usually lasts several months and asks you to:

- **read and practise** the lessons: energy, grounding, raising power, sacred space, the altar, and the coven's own Celtic ritual, tradition and devotion;
- **keep a small hearth practice,** like the one in this course, most days or each week;
- **come to the coven's rites** as often as you reasonably can, in person or in the app;
- **study honestly:** read some of the old stories, and learn what the sources do and don't say;
- **keep your own book** of rites, offerings and learning, in the app's Grimoire or on paper;
- **talk with your mentor** on each step, and **take the short tests,** which check understanding, not memory;
- at the end, **make a dedication:** a promise, freely made, to study and practise with this coven for a time.

Dedication is not initiation. You can leave afterwards if this path is not yours. Initiation, if your coven offers it, comes later and is a separate decision.

> **Your coven:** Ask your mentor what the devotee path looks like here: how often the coven meets, whether it asks you to learn any Irish, Gaelic or Welsh, and how long dedication lasts.

> **Try this:** Before your first rite, write down three questions. Ask them at the feast, or in a message on this step.

## What's old and what's modern

- **Old:** sunwise turning, saining with water and juniper (recorded in Scottish folk custom), fires at the quarter days, hospitality and gifts to the gods and the dead.
- **Modern:** the shape of a Celtic coven rite as a whole, and omens drawn with ogham.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-celtic-seeker',
      title: 'A first taste of Celtic paganism: test',
      intro: 'Eleven short questions on what Celtic paganism is, the first practice, and what a rite and a devotee path are like. Most are scored at once; your mentor reads the two written answers. You need 80% to pass, and you can try again.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'What is the most careful meaning of the word “Celtic”?',
          options: ['A single ancient nation with one religion', 'A family of related languages, and the peoples and cultures that spoke them', 'Anything from Ireland', 'A style of knotwork'],
          correct: [1],
          points: 1,
          explanation: 'Celtic is above all a language family. There was never one Celtic nation or one Celtic religion, but many peoples speaking related languages.',
        },
        {
          id: 'q2',
          type: 'multi',
          prompt: 'Which languages belong to the Gaelic (Goidelic) branch? Choose all that apply.',
          options: ['Irish', 'Welsh', 'Scottish Gaelic', 'Manx', 'Breton'],
          correct: [0, 2, 3],
          points: 1,
          explanation: 'Irish, Scottish Gaelic and Manx are Gaelic. Welsh, Cornish and Breton are Brythonic.',
        },
        {
          id: 'q3',
          type: 'truefalse',
          prompt: 'We have sacred texts written by the pagan druids themselves.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. The druids taught by word of mouth. We rely on outsiders’ accounts, archaeology, medieval literature written by Christians, and later folklore.',
        },
        {
          id: 'q4',
          type: 'multi',
          prompt: 'Which of these are sources for Celtic religion? Choose all that apply.',
          options: ['Greek and Roman writers such as Caesar', 'Archaeology: shrines, offerings and inscriptions', 'Medieval Irish and Welsh literature', 'Folklore collected in the last three centuries'],
          correct: [0, 1, 2, 3],
          points: 1,
          explanation: 'All four are sources, and each has its limits: outsiders’ bias, silent objects, Christian scribes, and late Christian-era collection.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'Which statement about modern Celtic paganism is honest?',
          options: ['It is the unbroken survival of the druids’ religion', 'All its forms are modern, built from older sources, and can be practised with integrity', 'Only Druidry is real Celtic paganism', 'It was invented in the 1990s from nothing'],
          correct: [1],
          points: 1,
          explanation: 'Reconstructionism, Druidry and Celtic-flavoured eclectic practice are all modern, and all draw on genuine older sources.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'What does “sunwise” (deiseal) mean?',
          options: ['Facing the sun', 'Moving round in the direction the sun travels across the sky', 'Only working in daylight', 'Moving against the sun'],
          correct: [1],
          points: 1,
          explanation: 'Sunwise movement follows the sun’s path, clockwise for someone in the northern hemisphere facing south. It was the lucky direction in Gaelic custom.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'In the hearth practice, what do you do with the gift afterwards?',
          options: ['Eat it', 'Give it to the earth: pour or bury it outside, or compost it with thanks', 'Keep it on the shelf for a month', 'Throw it in the bin without a thought'],
          correct: [1],
          points: 1,
          explanation: 'In Irish and Scottish custom, food given to the good folk or the dead was not eaten afterwards. Give it back to the earth with thanks.',
        },
        {
          id: 'q8',
          type: 'truefalse',
          prompt: 'The kindling and smooring prayers collected by Alexander Carmichael are Christian prayers.',
          options: ['True', 'False'],
          correct: [0],
          points: 1,
          explanation: 'True. They were said by Christian Highlanders and Islanders and address the Trinity and the saints. They show us the importance of the hearth; they are not pagan texts.',
        },
        {
          id: 'q9',
          type: 'multi',
          prompt: 'At a Celtic coven rite, which of these may you always do? Choose all that apply.',
          options: ['Choose juice or water instead of alcohol', 'Stand back from the fire', 'Leave at any time', 'Refuse touch you do not want'],
          correct: [0, 1, 2, 3],
          points: 1,
          explanation: 'All of these are always your right, as a newcomer and as a member.',
        },
        {
          id: 'q10',
          type: 'short',
          prompt: 'After your three times at the hearth, describe what you did and what you noticed, including if you noticed little.',
          points: 2,
          explanation: 'Any honest account is welcome. Relationship grows with time.',
          rubric: 'Full marks: describes the practice as they actually did it, including keeping it safe and what they did with the gift (1 point); gives an honest account of what they noticed or did not notice across the three times (1 point).',
        },
        {
          id: 'q11',
          type: 'short',
          prompt: 'What draws you to Celtic paganism, and what questions or worries do you have about joining this coven?',
          points: 2,
          explanation: 'This helps you and your mentor talk openly as you decide. There is no wrong answer.',
          rubric: 'Full marks: names at least one thing that draws them, with a reason (1 point); names at least one honest question or worry, such as about belief, ancestry, the living cultures, time or practice, or explains why they have none (1 point). Mentor: use this to start a conversation, not to judge.',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'A first taste of Celtic paganism',
      intro: 'In your first thirty days you get a feel for the Celtic practice your coven keeps. Read three short lessons, try one simple practice at home, come to a rite if you can, and talk openly with your mentor or the coven’s head about whether this path is for you.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'Celtic paganism in brief',
          kind: 'study',
          instructions: `1. Read "Celtic paganism in brief".
2. Open the app's calendar and find the next of the four Celtic fire festivals, and read its page.
3. Note anything that surprised you or that you want to ask, such as which stream your coven leans towards, and mark this task done.`,
          times: 1,
          response: 'none',
          checked_by: 'self',
          minutes: 15,
          docs: ['celtic-seeker-celtic-practice-in-brief'],
          links: [page('calendar'), closed()],
        },
        {
          title: 'A light and a gift at the hearth',
          kind: 'practice',
          instructions: `1. Read "A first practice: a light and a gift at the hearth".
2. Keep the practice step by step, safely, and give the gift back to the earth afterwards.
3. Write what you noticed in the app's journal, and log each time. Do it three times on different days during your first month.`,
          times: 3,
          response: 'none',
          checked_by: 'self',
          minutes: 15,
          docs: ['celtic-seeker-a-first-practice'],
          links: [ritual('hedge-house-spirit-offering'), page('journal')],
        },
        {
          title: 'Come to a rite',
          kind: 'attend',
          instructions: `1. Read "What a Celtic rite is like, and what is asked of a devotee".
2. Ask your mentor which rite you could come to (often one of the fire festivals), and what to wear and bring.
3. Attend, in person or in the app. Watch and follow; you can say no to anything and leave at any time.
4. Send your mentor a message on this step afterwards with anything that puzzled you.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['celtic-seeker-a-rite-and-what-is-asked'],
          links: [coven('rituals'), page('calendar')],
          solitary: 'Keep the next fire festival, or the next full moon, simply at home: read the holy day’s page in the app, kindle your hearth candle, greet the land, the ancestors and the gods, give a gift of milk or oatcake, keep one of the festival’s customs from the page, and write what you did.',
        },
        {
          title: 'Is this path for you?',
          kind: 'reflection',
          instructions: `1. Reread the section "What is asked of a devotee".
2. In the answer box, write honestly: what draws you, what feels hard, how you feel about practising from incomplete sources, how you will treat the living cultures, whether the time fits your life, and what you'd like to ask before deciding.
3. Talk it through with your mentor or the coven's head.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 20,
          docs: ['celtic-seeker-a-rite-and-what-is-asked', 'celtic-seeker-celtic-practice-in-brief'],
          links: [coven('standing')],
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Take the short test. The choice questions are scored at once; your mentor reads the written answers.
2. You need 80% to pass. If you don't pass, look at the questions you missed and try again; it's a check of understanding, not a hurdle.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 15,
          quiz: 'quiz-celtic-seeker',
          links: [journey('path-celtic')],
        },
      ],
    },
  ],
} satisfies CourseModule;
