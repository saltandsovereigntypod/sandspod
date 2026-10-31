// Norse seeker: a short, honest taste of Heathenry for someone in their first
// thirty days, deciding whether this coven (or kindred) is right for them.
// What Heathenry is (a living religion rebuilt from Norse and wider Germanic
// sources), what the sources are and are not, that it is open to everyone and
// rejects the racist misuse of its symbols; one simple first practice (a cup
// raised and poured for the gods, the land and the ancestors); and what a
// blót is like for a newcomer, and what a devotee is asked.
// Reconstructionist-informed, modern practice marked as modern. British
// spelling.

import type { CourseModule } from '../types';
import { closed, coven, deity, holy, journey, page, ritual, seasonal, vessel } from '../linkHelpers.ts';

export default {
  id: 'norse-seeker',
  title: 'A first taste of Heathenry',
  docs: [
    {
      id: 'norse-seeker-heathenry-in-brief',
      title: 'Heathenry in brief',
      summary: 'A short, honest introduction: what Heathenry is and what it is called, the gods, the wights and the ancestors, what the old sources can and cannot tell us, why it is open to people of every ancestry, and how it is practised today.',
      minutes: 13,
      links: [journey('path-norse'), deity('odin'), deity('thor'), deity('freyja'), deity('frigg'), page('calendar'), holy('norse/jol'), closed()],
      body: `## Welcome

You are in your first thirty days with a coven whose practice is Norse, or Heathen, finding out whether it is right for you. There is no hurry and no wrong answer. This short course gives you a taste: what Heathenry is, one simple thing to try at home, and what joining would ask of you. Your coven's general welcome lessons cover how the coven works, your rights, and what to watch for in any group.

## What it is called

The religion has several names, and you will hear all of them:

- **Heathenry** is the broad word, used especially in Britain and by scholars. "Heathen" was once an insult; people took it back.
- **Ásatrú,** Icelandic for "faith in the Æsir" (the gods), is common in Iceland and North America.
- **Forn Sed** or **Forn Siðr,** "the old custom", is used in Scandinavia.
- Some groups name a particular stream: **Anglo-Saxon** or **Fyrnsidu** practice draws on the English sources, **Theodish** belief on early medieval kingship, and so on.

Many Heathen groups call themselves a **kindred** or a **hearth** rather than a coven. Heathenry is not a form of witchcraft, though some witches honour the Norse gods and some Heathens practise magic. Your coven will tell you how it sees itself.

> **Your coven:** Ask your mentor what your coven calls itself and its practice, which gods it honours most, and whether it leans towards the Norse sources, the Anglo-Saxon ones, or both.

## What Heathens honour

Heathens speak of three kinds of holy power, and honour all three:

- **the gods:** the **Æsir,** such as Odin, Thor, Frigg and Tyr, and the **Vanir,** such as Freyr, Freyja and Njord, with others such as Skadi who married into them;
- **the wights:** the spirits of the land (in Old Norse landvættir), of the house, and the elves (álfar);
- **the ancestors:** your own dead, and the dísir, the guardian mothers of a family line.

The heart of the religion is **relationship kept up by gifts.** You give to the gods, the wights and the ancestors, and they give in return. An old poem, the Hávamál, says that a gift always looks for a gift. The main rite, the **blót,** is a gift-offering, usually of mead or another drink today.

## What we know and what we don't

We have **no holy book written by heathens.** The people of Viking-age Scandinavia passed their poems and stories on by word of mouth. What we have instead is:

- **the Eddas and sagas,** written down in Iceland in the thirteenth and fourteenth centuries by Christians, two or more centuries after the conversion;
- **poetry** composed earlier by heathen court poets (skalds), preserved inside those later books;
- **runic inscriptions** carved on stone, metal, wood and bone;
- **archaeology:** halls, graves, offerings, images of gods;
- **what outsiders wrote,** from the Roman Tacitus to Christian missionaries and an Arab traveller;
- **folklore** gathered from Scandinavian, English and German country people, most of them Christian.

Together these give us a great deal: the gods, their stories, the feasts, the values. They do not give us a complete religion ready to step into. Every modern Heathen fills the gaps, and the honest ones say what they have filled. The tradition lessons teach the sources in depth.

## Open to everyone

You will meet this early, so it is better said plainly. Since the twentieth century some people have misused Norse gods, runes and symbols for racist and white-supremacist ends, from the Nazis onwards. A minority of Heathen groups, calling themselves "folkish", still say the religion belongs only to people of northern European descent.

This coven, and this app, stand with the many Heathens who reject that. The gods of the North are not owned by a bloodline, and nothing in the old sources makes them so. Heathenry is open to people of every ancestry, colour, gender and sexuality. In 2016 a great many Heathen groups signed a statement called **Declaration 127,** refusing to work with an organisation that had published racist and anti-LGBT positions. The tradition lessons explain more, and teach you to recognise the symbols that racists have taken, so you are never caught out.

## What you are asked to believe

Very little, at this stage. There is no creed. Heathens hold many views of what the gods are, from real persons to great powers of nature to something harder to name. What a coven asks is that you join its rites with respect, learn honestly, and keep your word, which matters a great deal in Heathenry.

## The year

Heathens keep a year of feasts, each with its own blót. The app's Norse and Heathen calendar has seven: Þorrablót in midwinter, Dísablót for the guardian mothers in late winter, Sigrblót at summer's start, Midsummer, a harvest blót in autumn, Winter Nights at winter's start, and Yule, the great midwinter feast, kept for twelve nights. Some are well attested in the old sources and some are modern; each holy day's page in the app says which. You will keep them all, in time, if you go on to the initiate's path.

> **Try this:** Open the app's calendar and find the next of the Norse and Heathen holy days. Read its page, including the "What we know and what we don't" part. Note anything you want to ask your mentor.

## What's old and what's modern

- **Old:** the gods' names and stories (as written down by medieval Christians), gifts and feasts for the gods, the land and the dead, and the old Icelandic year.
- **Modern:** Heathenry as a religion practised today, its names, its groups and most of its ritual forms, rebuilt from the 1970s onwards.`,
    },
    {
      id: 'norse-seeker-a-first-practice',
      title: 'A first practice: a cup for the gods, the land and the ancestors',
      summary: 'One simple practice to try at home: raising a cup of mead, milk, juice or water, greeting the gods, the land and your ancestors, drinking a little and pouring the rest out as a gift. Step by step, with what you might notice, and what to do if you notice nothing.',
      minutes: 13,
      links: [ritual('folk-simple-blot'), ritual('hedge-house-spirit-offering'), vessel('offering_bowl'), seasonal('drinking-horn'), page('altar'), page('journal')],
      body: `## Why start here

The old word for worship in Norse is **blót,** a gift-offering to the gods. In the Viking age a great blót could mean a feast for a whole district, with animals slaughtered and the meat shared. What has come down most clearly, though, is the drink: toasts drunk to the gods, to a good year and to the dead, passed round a hall.

Modern Heathens keep a much simpler form at home: a cup is raised and blessed, the gods, wights and ancestors are greeted, everyone drinks, and what is left is poured out as a gift. This practice is a small version of that. You do not have to believe anything to try it. Do it three times over your first month, and notice honestly what happens.

## What you need

- **A cup, glass or horn.** Any cup you keep clean and use for this is fine. A drinking horn is traditional but not needed.
- **A drink:** mead, ale, cider, milk, fruit juice, or clean water. Alcohol is never required. Many Heathens do not drink at all, and a good blót never asks you to.
- **A bowl,** to pour the gift into if you are indoors.
- **A candle,** if you like, on a heat-proof plate.
- **A quiet ten minutes,** and something to write with, or the app's journal.

> **Safety:** If you light a candle, keep it on a heat-proof surface, away from curtains, books, hair and sleeves, and out of reach of children and pets. Never leave it burning when you leave the room.

## The practice, step by step

1. **Settle.** Stand or sit before your cup and bowl. Put your phone away. Breathe in slowly for a count of four and out for a count of six, five times.
2. **Mark the place.** Light the candle if you are using one, and say something like: "Here I stand to give a gift." If you are outside, simply stand still and look about you.
3. **Greet the land.** Say something like: "Hail to the wights of this land, who were here before me." A greeting is the old way of starting: "hail" is simply a wish for health and good fortune.
4. **Greet the ancestors.** "Hail to my ancestors, and to the mothers of my line." Name some if you wish. If your family is painful to think of, greet those who were kind to you, or the dead in general.
5. **Greet the gods.** "Hail to the gods and goddesses." Or name one you are drawn to: Thor, who guards ordinary people; Frigg, keeper of the household; Freyr, giver of good seasons.
6. **Raise and drink.** Lift the cup, say who it is for, and drink a little. Sharing the drink is part of the gift: you and the powers drink together.
7. **Pour.** Pour the rest into the bowl, or onto the ground outside, saying: "A gift for a gift." Then stand quietly for a minute or two and notice what you notice.
8. **Close.** Say "Thank you", put out the candle, and later pour the bowl's contents onto the earth, at the foot of a tree or into a plant pot. Don't drink it afterwards; it has been given.
9. **Write.** In the app's journal, note the date, what you did, and anything you noticed, even if it was very little.

## What people notice

All of these are common:

- a sense of calm, or of the room feeling different;
- warmth, tingling or heaviness in the body;
- an emotion arriving unexpectedly, sometimes sadness when thinking of the dead;
- an image, word or memory that seems to come from nowhere;
- a sense of company, or of being listened to;
- nothing at all, beyond a pleasant few minutes with a cup.

**Noticing little is completely normal.** Relationship grows slowly, like any friendship, and Heathenry cares more about keeping it up faithfully than about dramatic experiences. Keep your notes honest.

## Common difficulties

- **"I don't have Scandinavian ancestors."** You don't need them. The gods are not owned by bloodlines, and your own ancestors, whoever they were, are welcome.
- **"I don't drink."** Use milk, juice or water. Nobody worth learning from will mind.
- **"Who am I talking to?"** You do not have to know yet. Greeting "the land, the ancestors and the gods" is honest and enough.
- **"Isn't it a waste?"** Keep the gift small. A mouthful given with care means more than a bottle given carelessly.

## Where this comes from

Be clear about what is old and what is new. Saga writers describe toasts drunk to Odin, to Njord and Freyr "for a good year and peace", and to dead kinsmen, and offerings poured or left for the gods and the land are well attested. This small solitary rite, with its greetings to three kinds of power in a modern home, is a **modern practice** built from those pieces. The app's ready-made "A Simple Blót" gives a fuller version.

> **Your coven:** Your coven may use particular words, a horn, or a hammer sign to bless the drink. Ask your mentor whether there are words they would like you to use, or whether your own are welcome.

> **Try this:** After your third time, read your three notes together. Is anything the same each time, or changing? Bring what you noticed to your mentor.

## What's old and what's modern

- **Old:** toasts and drink-offerings to the gods, the land and the dead, and the idea of a gift for a gift.
- **Modern:** this small rite of greeting and pouring, as a daily or weekly practice for anyone.`,
    },
    {
      id: 'norse-seeker-a-rite-and-what-is-asked',
      title: 'What a blót is like, and what is asked of a devotee',
      summary: 'What to expect at your first blót or sumbel: hallowing, the call to the gods, the horn, the pouring, and the toasts; what to wear and bring; what you may always say no to; and what becoming a devotee would ask of you.',
      minutes: 14,
      links: [coven('rituals'), coven('standing'), ritual('folk-simple-blot'), ritual('folk-havamal-reflection'), holy('norse/vetrnaetur'), journey('path-norse')],
      body: `## Your first rite

Going to your first rite can feel daunting. This lesson tells you what usually happens, so nothing takes you by surprise. Heathen groups differ, because each builds its rites from the sources in its own way. Ask your mentor about your coven's.

Most groups hold two kinds of rite: the **blót,** a gift to the gods, and the **sumbel,** a formal round of toasts. Often both happen on the same day, the blót first and the sumbel at the feast after. Newcomers are usually invited to one of the seasonal holy days, such as Winter Nights or Yule.

## What usually happens at a blót

Here is a common shape, in brief. The ritual module teaches each part in depth. Nothing here is an ancient liturgy: no complete heathen rite survives, and this is a modern shape built from the sources.

1. **Gathering.** People arrive, talk and quiet down.
2. **Hallowing.** The space is made holy. Some groups carry fire round it; some make the sign of Thor's hammer over it; some simply declare it holy. People may be sprinkled with water or mead from a bowl with a sprig.
3. **The call.** The leader, often called the **gothi** (a man) or **gythia** (a woman), names the gods, wights or ancestors being honoured, and invites them.
4. **The horn.** A horn or cup of mead, ale or another drink is blessed and passed round. Each person may say a few words to the gods, or simply "Hail", drink a little, and pass it on.
5. **The gift.** What is left in the horn is poured into a bowl, and from the bowl onto the earth, often at a tree, a stone or a special place.
6. **Closing.** Thanks are given and the rite ends. Often a feast follows.

A blót might take twenty minutes to an hour.

## What usually happens at a sumbel

At the feast a horn goes round in set **rounds:** usually one to the gods, one to heroes or ancestors, and one in which people may make a boast (of something done) or a promise (of something to come). Words spoken over the horn are taken seriously: they are heard by everyone, and, many believe, by the gods. Never promise anything at a sumbel that you can't keep. You may always simply say "Hail" and pass the horn.

A few customs help a newcomer. Wait until the horn reaches you; don't speak across someone else's toast. Hold the horn with both hands. If you toast a god you don't know well, a simple "Hail to Thor, who guards us" is plenty. When others toast, listen: sumbel is as much about hearing as speaking.

## What to wear and bring

Ask your mentor. Most groups wear ordinary clothes; some wear tunics or dresses in a Viking-age style, but no one should expect a newcomer to. If you meet outdoors, dress for the weather. Bring something to share at the feast, and a small gift for the offering if you like: something you made, baked, grew or bought with care.

## What you may always say no to

At every rite, as a newcomer and as a member, you may:

- watch and follow rather than speak;
- pass the horn without drinking, or ask for a cup of something non-alcoholic;
- decline to boast, promise or speak at sumbel;
- decline a role, a reading or a turn;
- leave the rite at any time, for any reason;
- refuse any touch you do not want.

No genuine coven requires money for teaching, sex, secrets that would hide harm, or cutting yourself off from friends and family. And no genuine Heathen group asks about your ancestry before you can join. If you meet racist language, symbols or "ancestry" tests anywhere in Heathenry, you have learned what you need to know about that group.

## What is asked of a devotee

If you decide to carry on, the next step is the **devotee** program. A devotee is someone who has chosen this coven and its Heathen practice and wants to learn properly. It usually lasts several months and asks you to:

- **read and practise** the lessons: energy, grounding, sacred space, the altar, and the coven's own Heathen ritual, tradition and devotion;
- **keep a small practice,** like the cup in this course, most days or each week;
- **come to the coven's rites** as often as you reasonably can, in person or in the app;
- **study honestly:** read some of the Eddas and sagas in translation, and learn what the sources do and don't say;
- **keep your own book** of rites, gifts and learning, in the app's Grimoire or on paper;
- **talk with your mentor** on each step, and **take the short tests,** which check understanding, not memory;
- at the end, **make a dedication:** a promise, freely made, to study and practise with this coven for a time.

Dedication is not initiation. You can leave afterwards if this path is not yours.

> **Your coven:** Ask your mentor how often the coven holds blót and sumbel, whether it calls its leaders gothi and gythia, and how long dedication lasts.

> **Try this:** Before your first rite, write down three questions. Ask them at the feast, or in a message on this step.

## What's old and what's modern

- **Old:** the words blót and sumbel, toasts to the gods and the dead, sprinkling from the offering bowl (described in the sagas), and feasts at the turning seasons.
- **Modern:** the shape of a Heathen coven rite as a whole, the hammer hallowing, and the three rounds of sumbel as most groups keep them.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-norse-seeker',
      title: 'A first taste of Heathenry: test',
      intro: 'Eleven short questions on what Heathenry is, the first practice, and what a blót and a devotee path are like. Most are scored at once; your mentor reads the two written answers. You need 80% to pass, and you can try again.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'multi',
          prompt: 'Which of these names are used for the religion? Choose all that apply.',
          options: ['Heathenry', 'Ásatrú', 'Forn Sed', 'Gardnerian Wicca'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Heathenry, Ásatrú and Forn Sed are all names for it. Gardnerian Wicca is a different religion.',
        },
        {
          id: 'q2',
          type: 'multi',
          prompt: 'Which three kinds of holy power do Heathens honour? Choose all that apply.',
          options: ['The gods', 'The wights of land and house', 'The ancestors', 'The four elements as guardians of the quarters'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Gods, wights and ancestors. Guardians of the quarters belong to Wicca and ceremonial magic, not to the Norse sources.',
        },
        {
          id: 'q3',
          type: 'truefalse',
          prompt: 'The Eddas and sagas were written by heathens during the Viking age.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. They were written down in Iceland in the thirteenth and fourteenth centuries by Christians, though they keep older poetry and tradition.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'What does the Hávamál say a gift looks for?',
          options: ['Nothing at all', 'A gift in return', 'A blood price', 'A written receipt'],
          correct: [1],
          points: 1,
          explanation: 'A gift looks for a gift: relationship with gods, wights and people is kept up by giving and receiving.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'Who may honour the Norse gods?',
          options: ['Only people of Scandinavian descent', 'Only people of northern European descent', 'Anyone, of any ancestry, colour, gender or sexuality', 'Only those born in the Nordic countries'],
          correct: [2],
          points: 1,
          explanation: 'Heathenry is open to everyone. Nothing in the old sources ties the gods to a bloodline, and inclusive Heathens reject folkish and racist claims.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'What was Declaration 127?',
          options: ['A medieval law about Yule', 'A 2016 statement by many Heathen groups refusing to work with an organisation that published racist and anti-LGBT positions', 'A rune poem', 'The founding charter of the Icelandic Althing'],
          correct: [1],
          points: 1,
          explanation: 'Declaration 127, named after a verse of the Hávamál, was signed by many Heathen groups in 2016.',
        },
        {
          id: 'q7',
          type: 'truefalse',
          prompt: 'You must drink alcohol at a blót or sumbel.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. You may always pass the horn, touch it to your lips, or have a non-alcoholic drink.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'In the first practice, what do you do with the drink left in the bowl?',
          options: ['Drink it later', 'Pour it onto the earth, as a gift given', 'Keep it on the shelf for a month', 'Pour it down the sink without a thought'],
          correct: [1],
          points: 1,
          explanation: 'What has been given is not taken back. Pour it onto the earth with thanks.',
        },
        {
          id: 'q9',
          type: 'single',
          prompt: 'At sumbel, what should you never do?',
          options: ['Simply say “Hail” and pass the horn', 'Promise something you cannot keep', 'Choose a non-alcoholic drink', 'Listen to others’ toasts'],
          correct: [1],
          points: 1,
          explanation: 'Words spoken over the horn are taken seriously. Promise only what you can keep, or simply say “Hail”.',
        },
        {
          id: 'q10',
          type: 'short',
          prompt: 'After your three times with the cup, describe what you did and what you noticed, including if you noticed little.',
          points: 2,
          explanation: 'Any honest account is welcome. Relationship grows with time.',
          rubric: 'Full marks: describes the practice as they actually did it, including what they drank and what they did with the gift (1 point); gives an honest account of what they noticed or did not notice across the three times (1 point).',
        },
        {
          id: 'q11',
          type: 'short',
          prompt: 'What draws you to Heathenry, and what questions or worries do you have about joining this coven?',
          points: 2,
          explanation: 'This helps you and your mentor talk openly as you decide. There is no wrong answer.',
          rubric: 'Full marks: names at least one thing that draws them, with a reason (1 point); names at least one honest question or worry, such as about belief, alcohol, oaths, the misuse of symbols, time or practice, or explains why they have none (1 point). Mentor: use this to start a conversation, not to judge. If the answer suggests interest in ancestry-based or folkish ideas, talk about it openly and kindly, and explain the coven’s inclusive stance.',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'A first taste of Heathenry',
      intro: 'In your first thirty days you get a feel for the Heathen practice your coven keeps. Read three short lessons, try one simple practice at home, come to a blót if you can, and talk openly with your mentor or the coven’s head about whether this path is for you.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'Heathenry in brief',
          kind: 'study',
          instructions: `1. Read "Heathenry in brief".
2. Open the app's calendar and find the next of the Norse and Heathen holy days, and read its page.
3. Note anything that surprised you or that you want to ask, and mark this task done.`,
          times: 1,
          response: 'none',
          checked_by: 'self',
          minutes: 15,
          docs: ['norse-seeker-heathenry-in-brief'],
          links: [page('calendar'), journey('path-norse')],
        },
        {
          title: 'A cup for the gods, the land and the ancestors',
          kind: 'practice',
          instructions: `1. Read "A first practice: a cup for the gods, the land and the ancestors".
2. Keep the practice step by step, and pour the gift onto the earth afterwards.
3. Write what you noticed in the app's journal, and log each time. Do it three times on different days during your first month.`,
          times: 3,
          response: 'none',
          checked_by: 'self',
          minutes: 15,
          docs: ['norse-seeker-a-first-practice'],
          links: [ritual('folk-simple-blot'), page('journal')],
        },
        {
          title: 'Come to a blót',
          kind: 'attend',
          instructions: `1. Read "What a blót is like, and what is asked of a devotee".
2. Ask your mentor which rite you could come to (often one of the holy days), and what to wear and bring.
3. Attend, in person or in the app. Watch and follow; you can pass the horn, say no to anything and leave at any time.
4. Send your mentor a message on this step afterwards with anything that puzzled you.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['norse-seeker-a-rite-and-what-is-asked'],
          links: [coven('rituals'), page('calendar')],
          solitary: 'Keep the next Norse holy day, or the next full moon, simply at home: read the holy day’s page in the app, keep the app’s “A Simple Blót” with a cup of whatever you drink, greet the land, the ancestors and the gods, keep one of the customs on the page, and write what you did.',
        },
        {
          title: 'Is this path for you?',
          kind: 'reflection',
          instructions: `1. Reread the sections "Open to everyone" and "What is asked of a devotee".
2. In the answer box, write honestly: what draws you, what feels hard, how you feel about practising from incomplete sources, where you stand on the inclusive and folkish divide, whether the time fits your life, and what you'd like to ask before deciding.
3. Talk it through with your mentor or the coven's head.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 20,
          docs: ['norse-seeker-a-rite-and-what-is-asked', 'norse-seeker-heathenry-in-brief'],
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
          quiz: 'quiz-norse-seeker',
          links: [journey('path-norse')],
        },
      ],
    },
  ],
} satisfies CourseModule;
