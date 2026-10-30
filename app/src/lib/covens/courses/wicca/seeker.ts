// Wicca seeker: a short, honest taste of Wicca for someone in their first
// thirty days, deciding whether this coven is right for them. What Wicca is
// and the difference between initiatory (British Traditional) Wicca and the
// open, eclectic Wicca this course teaches; one simple first practice (a
// candle greeting to the Lady and the Lord); and what a Wiccan circle is like
// for a newcomer, and what a devotee is asked. Public material only. British
// spelling.

import type { CourseModule } from '../types';
import { candle, closed, coven, deity, holy, journey, page, ritual } from '../linkHelpers.ts';

export default {
  id: 'wicca-seeker',
  title: 'A first taste of Wicca',
  docs: [
    {
      id: 'wicca-seeker-wicca-in-brief',
      title: 'Wicca in brief',
      summary: 'A short, honest introduction to Wicca: a modern religion of witchcraft that honours a Goddess and a God, keeps the eight sabbats and the full moons, and works in a cast circle. What initiatory Wicca is, what this course teaches instead, and what you are and are not asked to believe.',
      minutes: 12,
      links: [journey('path-wicca'), closed('initiatory-wicca'), deity('wiccan_goddess'), deity('horned_god'), page('calendar'), holy('moon-full')],
      body: `## Welcome

You are in your first thirty days with a coven that practises Wicca, finding out whether it is right for you. There is no pressure to decide quickly and no wrong answer. This short course gives you a taste of the religion: what it is, one simple thing to try at home, and what joining would ask of you. Your coven's general welcome lessons cover how the coven works, your rights, and what to watch for in any group.

## What Wicca is

Wicca is a modern pagan religion of witchcraft. It came to public notice in England in the early 1950s through a retired civil servant called Gerald Gardner and the people around him, above all the poet and priestess Doreen Valiente. It has since spread around the world and grown many branches.

Most Wiccans share a handful of things:

- **A Goddess and a God.** Wicca honours the divine as a Goddess, often linked with the moon, the earth and the sea, and a God, often pictured with horns and linked with the sun, the wild, the harvest and death and rebirth. Many Wiccans see all goddesses as faces of the one Goddess and all gods as faces of the one God; others honour particular, named gods. This two-sided view is called **duotheism**.
- **The turning year.** Wiccans keep eight seasonal festivals called **sabbats**, the Wheel of the Year, and see in them the story of the Goddess and the God through the seasons.
- **The moon.** Wiccans meet at the full moon, and sometimes the new moon, for rites called **esbats**: worship, magic and fellowship.
- **The circle.** Wiccan rites happen inside a **cast circle**, a space marked out and made sacred, with the four directions and elements called at its edges.
- **Magic.** Wicca is a religion that includes the practice of magic: working with intention, ritual and the energy of the body and the world to bring about change, alongside ordinary action.
- **Ethics.** Many Wiccans live by the Wiccan Rede, usually given as "an it harm none, do what ye will": be free, and take responsibility for any harm you cause.

## Two kinds of Wicca

It is important to know from the start that the word Wicca is used in two ways.

**Initiatory Wicca**, often called British Traditional Wicca, includes the Gardnerian line (from Gardner) and the Alexandrian line (from Alex and Maxine Sanders, in the 1960s). It is a mystery religion: you enter it by initiation into a coven, from a priestess or priest who was initiated themselves, so each initiate belongs to a line, or lineage, going back to the founders. Initiates swear an oath and copy their coven's Book of Shadows, which holds rites and teachings that are kept secret. That material is **not taught in this course**, and no course or app can give it to you.

**Open, or eclectic, Wicca** grew from books published from the 1970s onwards, most famously Scott Cunningham's Wicca: A Guide for the Solitary Practitioner (1988). It keeps the public shape of the religion (the Goddess and God, the sabbats and esbats, the circle, the tools, the ethics) and anyone can learn it, alone or in a coven. This course teaches that open, public Wicca, honestly and in depth.

Some initiatory Wiccans feel that only initiates should call themselves Wiccan, and that everyone else is practising "Wiccan-style witchcraft". Others are happy with the word being shared. You will meet both views, and both are held in good faith.

> **Your coven:** Ask your High Priestess or mentor plainly whether your coven belongs to an initiatory lineage, and if so, which. If it does, what you learn here is the outer, public part of its practice, and its inner teachings will come, if you are initiated, in the coven's own way.

## What you are asked to believe

Very little, at this stage. Wicca has no creed you must sign and no holy book that tells you what to think. It is a religion of practice and experience: people come to know the Goddess and the God by keeping the rites, not by agreeing to statements about them. Wiccans hold a wide range of beliefs about what the gods are, from very real persons to powerful symbols of nature and the psyche.

What a Wiccan coven will ask is that you join in its rites with respect, take your own experience seriously, and learn honestly. If you find, after a time, that you cannot honour a Goddess and a God in any sense, Wicca may not be your path, and an eclectic pagan or witchcraft coven may suit you better. That is a good thing to discover.

## Honest history

You will meet the claim that Wicca is the unbroken survival of an ancient witch religion. Historians, and most Wiccans today, agree that it is not. Wicca is a twentieth-century religion built from older materials: folklore, ceremonial magic, the writings of Charles Leland and Margaret Murray, Freemasonry, poetry and the inspiration of its founders. Being modern takes nothing from its depth. The tradition module of this course tells the story honestly.

## What a Wiccan coven does

A coven is a small group, traditionally no more than thirteen, that meets for the sabbats and the full moons, trains its members, works magic for healing and good ends, and cares for one another. Most covens are led by a High Priestess, often with a High Priest. In the app you will see the coven's rites in its calendar, its Book of Shadows, its altars and its messages.

> **Try this:** Open the app's calendar and find the next full moon and the next sabbat. Read the page for each. Note anything you want to ask your mentor.

## What's old and what's modern

- **Old:** the festivals' roots, the watching of the moon, folk magic, the ceremonial magic that shaped the circle.
- **Modern:** Wicca itself (1940s and 1950s), its liturgy (much of it by Doreen Valiente), and the eclectic, book-taught Wicca of the 1970s onwards.`,
    },
    {
      id: 'wicca-seeker-a-first-practice',
      title: 'A first practice: the candle greeting',
      summary: 'One simple practice to try at home: lighting two candles for the Lady and the Lord, greeting them in your own words, and sitting quietly for a few minutes. Step by step, with what you might notice, what to do if you notice nothing, and how to keep it safe.',
      minutes: 12,
      links: [ritual('wicca-daily-devotion'), candle('white'), candle('silver'), candle('gold'), page('moon'), page('journal')],
      body: `## Why start here

The heart of Wicca is relationship with the Goddess and the God, kept up through small, regular acts of attention. Before circles and tools and sabbats, there is simply this: lighting a light, saying hello, and listening. Many Wiccans keep a practice like this every day for years. It is a good way to find out how the religion feels to you.

You do not have to believe anything in particular to try it. Treat it as an experiment: do it three times over your first month, and notice honestly what happens.

## What you need

- **Two candles.** Traditionally a silver or white one for the Goddess (often called the Lady) and a gold or yellow one for the God (often called the Lord). Any two candles will do: two tealights work perfectly. Electric candles are fine if flame is a problem where you live.
- **A heat-proof surface.** A plate, a tile or a tray on a table or shelf where nothing can catch.
- **A quiet ten minutes,** when you will not be interrupted.
- **Something to write with,** or the app's journal.

That is all. You do not need an altar, robes, special words or any tools.

> **Safety:** Set candles on a heat-proof surface, away from curtains, books, hair and loose sleeves, and out of reach of children and pets. Never leave a flame burning when you leave the room or fall asleep. If you live with smoke alarms that are sensitive, or anyone with breathing problems, use electric candles.

## The practice, step by step

1. **Settle.** Sit or stand comfortably in front of the candles. Put your phone face down or in another room.
2. **Breathe.** Breathe in slowly for a count of four, and out for a count of six. Do this five times. Let your shoulders drop and your jaw soften. If thoughts come, let them pass and come back to the count.
3. **Light the Goddess's candle.** Light the first candle (on the left, as many Wiccans place it) and say, aloud or quietly, something like: "Lady of the moon, mother of all living, I greet you." Use your own words if you prefer. Simple and honest is best.
4. **Light the God's candle.** Light the second (on the right) and say something like: "Lord of the sun and the wild places, I greet you."
5. **Sit with them.** For three to five minutes, just be with the two lights. Watch the flames. Notice your breathing, the room, your body, your feelings. You are not trying to make anything happen; you are paying attention and being present, as you would with a guest.
6. **Speak, if you wish.** You might tell them a little about your day, say thank you for something, or ask a question. Then listen: notice any thought, image, feeling or memory that comes, without deciding yet what it means.
7. **Close.** Say something like: "Lady and Lord, thank you for your presence. Blessed be." ("Blessed be" is a common Wiccan blessing and farewell.) Put the candles out, with a snuffer or by pinching them if you know how; many Wiccans prefer not to blow candles out, though there is no harm in it.
8. **Write.** In the app's journal or a notebook, write the date, what you did, and anything you noticed, even if it was nothing much.

## What people notice

People's experiences vary a great deal, and all of these are common:

- a sense of calm or quiet, or of the room feeling different;
- warmth, tingling or heaviness in the body;
- an emotion arriving unexpectedly: comfort, sadness, joy;
- an image, a word or a memory that seems to come from nowhere;
- a sense of being listened to, or of company;
- nothing at all, beyond a pleasant few minutes with candles.

**Noticing little at first is completely normal.** Relationship with the gods, like any relationship, usually grows slowly. Some people never have dramatic experiences and still find great meaning in the religion. Keep your notes honest; they will be more useful to you than notes that say what you hoped for.

## Common difficulties

- **"I felt silly speaking aloud."** Very common. Whisper, or speak in your head at first. Many people find that speaking aloud gets easier, and that it matters more than they expected.
- **"My mind wouldn't stop."** Go back to the breathing count whenever you notice you have drifted. Noticing that you drifted is the practice working.
- **"I don't know if I believe in a Goddess and God."** You don't have to know. Greet them as an experiment, or as you might greet the moon and the sun. See what happens over time.
- **"I can't light candles where I live."** Use electric candles, or two stones, or simply sit at a window where you can see the sky.

## When to keep it, and the moon

You can keep the greeting at any time. If you would like to link it to the moon, as Wiccans often do, open the app's moon page and keep one of your three greetings on or near the full moon, perhaps where you can see it. Notice whether it feels different.

> **Your coven:** Your coven may greet the Goddess and God in its own words or by particular names. Ask your mentor whether there are words they would like you to use, or whether your own are welcome.

> **Try this:** After your third greeting, read back over your three notes. Is anything the same each time? Is anything changing? Bring what you noticed to your mentor.

## What's old and what's modern

- **Old:** lighting a lamp or candle for the gods, which people have done in many religions for thousands of years.
- **Modern:** the Wiccan pairing of a Goddess candle and a God candle, and the greeting "Blessed be".`,
    },
    {
      id: 'wicca-seeker-a-circle-and-what-is-asked',
      title: 'What a Wiccan circle is like, and what is asked of a devotee',
      summary: 'What to expect at your first Wiccan rite: the circle, the quarters, the Goddess and God, cakes and ale; what to wear and bring; what you may always say no to; and what becoming a devotee of this coven would ask of you.',
      minutes: 14,
      links: [ritual('wicca-casting-the-circle'), ritual('wicca-cakes-and-ale'), ritual('wicca-full-moon-esbat'), coven('rituals'), coven('standing'), closed('initiatory-wicca')],
      body: `## Your first rite

Going to your first Wiccan rite can feel daunting. This lesson tells you what usually happens, so nothing takes you by surprise. Every coven does things a little differently, so ask your mentor about your coven's own way.

Many covens invite newcomers to an **open circle**: a public or semi-public rite, often a sabbat, kept simply so that guests can join in. Some keep a separate **outer court** or training group for people who are not yet dedicated or initiated. Inner rites, especially in initiatory covens, are for members only. You will not be asked to attend anything you are not ready for.

## What usually happens

A Wiccan rite follows a recognisable shape. Here it is in brief; the ritual module teaches each part in depth.

1. **Preparing.** People arrive, chat, and quiet down. Some covens ask you to wash your hands or take a short ritual bath at home beforehand.
2. **Cleansing.** The space is swept with a broom (a **besom**), and salt and water are blessed and sprinkled. Incense may be carried round.
3. **Casting the circle.** The priestess or priest walks the edge of the space clockwise (**deosil**, "sunwise"), usually with a ritual knife called an **athame** or a wand, marking out the circle. You stand inside. From now on, people move around the circle clockwise and don't walk out of it without a doorway being made.
4. **Calling the quarters.** Someone faces each direction in turn (usually east, south, west and north) and welcomes the powers of air, fire, water and earth. Often everyone turns to face that direction too.
5. **Welcoming the Goddess and the God.** The priestess and priest, or the whole group, invite the Goddess and the God to be present. There may be poetry, a reading, music or silence.
6. **The heart of the rite.** At a sabbat, something marking the season: a story, a drama, a blessing of seeds or bread. At an esbat, worship of the Goddess under the full moon, and perhaps magic for healing, raised by chanting or dancing round the circle.
7. **Cakes and ale.** A cup of wine or juice and a plate of cakes or bread are blessed and passed round. Each person takes a little, often with the words "Blessed be".
8. **Thanks and closing.** The Goddess, God and quarters are thanked, and the circle is opened. People often say "Merry meet, and merry part, and merry meet again."
9. **Feasting.** Food and talk afterwards. This is where friendships are made.

A rite might last from half an hour to two hours.

## What to wear and bring

Ask your mentor. Many covens wear robes or simple dark or seasonal clothes; guests usually wear whatever is comfortable and respectful. Wear shoes you can stand in for a while, or be ready to take them off. Bring something to share at the feast if you can.

Some traditional covens, especially in the initiatory lines, work **skyclad**, that is, naked. This is a long-standing and publicly known Wiccan practice, and in those covens it is about equality and freedom, not sex. It is **never** expected of a guest or a newcomer, and you should never be pressured into it at any stage. If a coven asks a newcomer to undress, or makes nudity a condition of being taught, treat that as a red flag.

## What you may always say no to

At every rite, as a newcomer and as a member, you may:

- watch and follow rather than speak;
- decline a role, a reading or a turn at anything;
- choose juice or water instead of wine in cakes and ale (alcohol is never required);
- step back from a dance or a chant if you feel unwell or uneasy;
- ask for a doorway to be cut so you can leave the circle, at any time, for any reason;
- refuse any touch you do not want.

No genuine Wiccan coven requires money for initiation, sex, secrets that would hide harm, or cutting off your friends and family. The welcome lessons cover these red flags in detail.

## What is asked of a devotee

If you decide to carry on, the next step is the **devotee** program. In this coven, a devotee is someone who has chosen Wicca and the coven and wants to learn the practice properly before any question of initiation. It usually lasts several months and asks you to:

- **read and practise** the lessons: energy, grounding, raising power, sacred space, the altar and tools, and the coven's own Wiccan ritual and devotion;
- **keep a small daily practice,** like the candle greeting, most days;
- **come to the coven's rites** as often as you reasonably can, in person or in the app;
- **keep your own Book of Shadows,** your personal record of rites and learning, in the app's Grimoire or on paper;
- **talk with your mentor** on each step;
- **take the short tests,** which check understanding, not memory;
- at the end, **make a dedication**: a promise to study and practise Wicca with this coven for a time, traditionally a year and a day.

Dedication is not initiation. It is a commitment to learning, freely made, and you can leave afterwards if the path turns out not to be yours. Initiation, if your coven offers it, is a separate and later step, taken only when you and the coven's leaders agree you are ready.

> **Your coven:** Ask your mentor what your coven's devotee path looks like in practice: how often it meets, what it expects, how long dedication lasts, and whether it leads on to initiation into a lineage.

> **Try this:** Before your first rite, write down three questions you would like answered. Ask them afterwards, at the feast or in a message on this step.

## What's old and what's modern

- **Old:** the ceremonial magic from which the circle and quarters come, and the custom of sharing food and drink with the gods.
- **Modern:** the Wiccan rite as a whole, with its circle, Goddess and God, and cakes and ale, as it took shape from the 1940s onwards.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wicca-seeker',
      title: 'A first taste of Wicca: test',
      intro: 'Ten short questions on what Wicca is, the first practice, and what a rite and a devotee path are like. Most are scored at once; your mentor reads the two written answers. You need 80% to pass, and you can try again.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'Which description of Wicca is most accurate?',
          options: [
            'An unbroken Stone Age religion that survived in secret',
            'A modern pagan religion of witchcraft, made public in England in the 1950s from older materials',
            'Another name for any kind of witchcraft',
            'A branch of Christianity',
          ],
          correct: [1],
          points: 1,
          explanation: 'Wicca is a twentieth-century religion, made public by Gerald Gardner and his circle in the 1950s, built from folklore, ceremonial magic and other older sources. Being modern takes nothing from its depth.',
        },
        {
          id: 'q2',
          type: 'multi',
          prompt: 'Which of these do most Wiccans share? Choose all that apply.',
          options: ['Honouring a Goddess and a God', 'Keeping eight seasonal sabbats', 'Meeting at the full moon for esbats', 'Working in a cast circle', 'Sacrificing animals'],
          correct: [0, 1, 2, 3],
          points: 1,
          explanation: 'The Goddess and God, the sabbats, the esbats and the circle are shared by most Wiccans. Wicca does not sacrifice animals; offerings are food, drink, flowers, incense and time.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'What is British Traditional Wicca (Gardnerian and Alexandrian)?',
          options: [
            'Any Wicca practised in Britain',
            'An initiatory mystery religion entered through a coven, with an oathbound Book of Shadows passed down a lineage',
            'Wicca learned from Scott Cunningham’s book',
            'A style of altar decoration',
          ],
          correct: [1],
          points: 1,
          explanation: 'Initiatory Wicca is entered by initiation from someone in the lineage, with oaths of secrecy. Its inner material is not taught in this course; this course teaches open, public Wicca.',
        },
        {
          id: 'q4',
          type: 'truefalse',
          prompt: 'This course can give you the secret, oathbound material of the Gardnerian and Alexandrian Book of Shadows.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. That material is passed on only within initiatory covens. This course teaches the public shape of Wicca honestly and does not reproduce oathbound material.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'In the candle greeting, what should you do if you notice very little?',
          options: [
            'Give up: it means Wicca is not for you',
            'Write what you noticed honestly and keep going; noticing little at first is normal',
            'Use more candles until something happens',
            'Pretend you felt something so your mentor is pleased',
          ],
          correct: [1],
          points: 1,
          explanation: 'Relationship with the gods usually grows slowly, and many people notice little at first. Honest notes are the most useful.',
        },
        {
          id: 'q6',
          type: 'multi',
          prompt: 'Which are safe ways to keep the candle greeting? Choose all that apply.',
          options: [
            'Candles on a heat-proof plate, away from curtains and hair',
            'Electric candles',
            'Leaving the candles burning while you go to bed',
            'Putting the candles out before leaving the room',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Never leave a flame burning when you leave the room or fall asleep. Electric candles work just as well.',
        },
        {
          id: 'q7',
          type: 'multi',
          prompt: 'At a Wiccan rite, which of these may you always do? Choose all that apply.',
          options: [
            'Choose juice or water instead of wine at cakes and ale',
            'Decline a role or a turn',
            'Ask for a doorway so you can leave the circle',
            'Refuse touch you do not want',
          ],
          correct: [0, 1, 2, 3],
          points: 1,
          explanation: 'All of these are always your right. Alcohol is never required, and you may leave the circle at any time.',
        },
        {
          id: 'q8',
          type: 'truefalse',
          prompt: 'A coven that asks a newcomer to work skyclad (naked) as a condition of being taught is showing a red flag.',
          options: ['True', 'False'],
          correct: [0],
          points: 1,
          explanation: 'True. Some traditional covens work skyclad, but it is never expected of a guest or newcomer, and pressure to undress is a red flag.',
        },
        {
          id: 'q9',
          type: 'short',
          prompt: 'After your three candle greetings, describe what you did and what you noticed, including if you noticed little.',
          points: 2,
          explanation: 'Any honest account is welcome. The practice of attention grows with time.',
          rubric: 'Full marks: describes the greeting as they actually did it, including how they kept it safe (1 point); gives an honest account of what they noticed or did not notice across the three times (1 point).',
        },
        {
          id: 'q10',
          type: 'short',
          prompt: 'What draws you to Wicca, and what questions or worries do you have about joining this coven?',
          points: 2,
          explanation: 'This helps you and your mentor talk openly as you decide. There is no wrong answer.',
          rubric: 'Full marks: names at least one thing that draws them, with a reason (1 point); names at least one honest question or worry, such as about belief, lineage, time or practice, or explains why they have none (1 point). Mentor: use this to start a conversation, not to judge.',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'A first taste of Wicca',
      intro: 'In your first thirty days you get a feel for the Wicca your coven practises. Read three short lessons, try one simple practice at home, come to a rite if you can, and talk openly with your mentor or High Priestess about whether this path is for you.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'Wicca in brief',
          kind: 'study',
          instructions: `1. Read "Wicca in brief".
2. Open the app's calendar and find the next full moon and the next sabbat, and read their pages.
3. Note anything that surprised you or that you want to ask, especially about whether your coven belongs to an initiatory lineage, and mark this task done.`,
          times: 1,
          response: 'none',
          checked_by: 'self',
          minutes: 15,
          docs: ['wicca-seeker-wicca-in-brief'],
          links: [page('calendar')],
        },
        {
          title: 'The candle greeting',
          kind: 'practice',
          instructions: `1. Read "A first practice: the candle greeting".
2. Keep the greeting step by step, safely, and write what you noticed in the app's journal.
3. Log each time. Do it three times on different days during your first month, one of them near the full moon if you can.`,
          times: 3,
          response: 'none',
          checked_by: 'self',
          minutes: 15,
          docs: ['wicca-seeker-a-first-practice'],
          links: [ritual('wicca-daily-devotion'), page('journal')],
        },
        {
          title: 'Come to a rite',
          kind: 'attend',
          instructions: `1. Read "What a Wiccan circle is like, and what is asked of a devotee".
2. Ask your mentor which rite you could come to (often an open circle or a sabbat), and what to wear and bring.
3. Attend, in person or in the app. Watch and follow; you can say no to anything and leave the circle at any time.
4. Send your mentor a message on this step afterwards with anything that puzzled you.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['wicca-seeker-a-circle-and-what-is-asked'],
          links: [coven('rituals'), ritual('wicca-full-moon-esbat')],
          solitary: 'Keep the next full moon at home with the ready-made Full Moon Esbat in the app, read slowly and kept simply: light your two candles, greet the Lady and the Lord, sit under or near the moon, share a little bread and juice with them, and write what you did.',
        },
        {
          title: 'Is this path for you?',
          kind: 'reflection',
          instructions: `1. Reread the section "What is asked of a devotee".
2. In the answer box, write honestly: what draws you, what feels hard, whether you can honour a Goddess and God in some sense, whether the time fits your life, and what you'd like to ask before deciding.
3. Talk it through with your mentor or High Priestess.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 20,
          docs: ['wicca-seeker-a-circle-and-what-is-asked', 'wicca-seeker-wicca-in-brief'],
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
          quiz: 'quiz-wicca-seeker',
          links: [journey('path-wicca')],
        },
      ],
    },
  ],
} satisfies CourseModule;
