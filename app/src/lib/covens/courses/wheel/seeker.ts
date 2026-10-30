// Wheel of the Year seeker: a short taste of an eclectic, non-Wiccan seasonal
// practice for someone in their first thirty days, deciding whether this coven
// is right for them. What the eight festivals are and where they come from,
// one simple first practice (a seasonal walk and a threshold candle), and what
// a seasonal rite is like and what is asked of a devotee. British spelling.

import type { CourseModule } from '../types';
import { coven, holy, journey, page, ritual, seasonal } from '../linkHelpers.ts';

export default {
  id: 'wheel-seeker',
  title: 'A first taste of the Wheel of the Year',
  docs: [
    {
      id: 'wheel-seeker-the-wheel-in-brief',
      title: 'The Wheel of the Year in brief',
      summary: 'A short, honest introduction to the eclectic seasonal practice your coven keeps: the eight festivals, where they come from, what the practice asks you to believe (very little), and what a Wheel coven actually does.',
      minutes: 12,
      links: [page('calendar'), journey('path-wheel'), holy('wheel/samhain'), holy('wheel/yule'), page('green-season')],
      body: `## Welcome

You are in your first thirty days with a coven that keeps the Wheel of the Year, finding out whether it is right for you. There is no pressure to decide quickly and no wrong answer. This short course gives you a taste of the practice: what it is, one simple thing to try at home, and what joining would ask of you. Your coven's general welcome lessons cover how the coven works, your rights, and what to watch out for in any group.

## What the Wheel of the Year is

The Wheel of the Year is a cycle of eight seasonal festivals, spaced roughly six or seven weeks apart, that many modern pagans and witches keep. Four of them are the turning points of the sun:

- **the winter solstice**, the longest night, around 21 December in the northern hemisphere, often called Yule;
- **the spring equinox**, when day and night are equal, around 20 March, often called Ostara;
- **the summer solstice**, the longest day, around 21 June, often called Litha or Midsummer;
- **the autumn equinox**, around 22 September, often called Mabon or Harvest Home.

The other four fall roughly between them, and come mostly from the old Gaelic calendar of Ireland and Scotland:

- **Imbolc**, at the start of February, the first stirring of spring;
- **Beltane**, at the start of May, the beginning of summer;
- **Lughnasadh** or **Lammas**, at the start of August, the first harvest;
- **Samhain**, at the start of November, the end of harvest and the beginning of winter.

Together they make a wheel: a way of marking the whole year as it turns, from dark to light and back again. The app's calendar shows each festival's date for this year, and each has its own page with its history and customs.

## What "eclectic" means here

Your coven keeps the Wheel as an **eclectic** practice. "Eclectic" means drawing from more than one source. The festivals themselves have many roots: Irish fire festivals, Anglo-Saxon month names, the astronomy of the solstices, English and Scottish folk customs, church holidays that kept older habits alive, and twentieth-century inventions. An eclectic Wheel coven draws on all of these honestly, and adds what grows out of its own land and its own members.

This coven's practice is **not Wicca**. Wicca is a particular religion, founded in England in the mid-twentieth century, that also keeps eight sabbats. Many people meet the Wheel through Wicca, and some Wiccan customs (a cast circle, calling the quarters) are offered here as options among others. But you will not be asked to accept Wicca's theology, such as its Goddess and God, its Rede or its initiatory lineage. Members of a Wheel coven may honour many gods, one, none, the land itself, their ancestors, or simply the turning of the seasons.

## Honest about history

You will hear many claims that the eight festivals are "the ancient Celtic calendar" or "the old religion of Europe". They are not, and you deserve to know that from the start. The four Gaelic festivals are genuinely old and well recorded. The solstices and equinoxes have been noticed for thousands of years: some Neolithic monuments are aligned to them. Many folk customs are centuries old. But no ancient people is known to have kept all eight as one cycle. The eight-fold Wheel was assembled in England in the 1950s, and several of its popular names, including Litha, Ostara and Mabon, were chosen in the 1970s.

That does not make it less meaningful. A practice can be new and true at once. Your coven will be clear with you about what is old, what is folk custom, and what is modern. If anyone tells you a practice is ancient, it is fair to ask how we know.

## What a Wheel coven does

A coven that keeps the eclectic Wheel typically:

- **gathers for the eight festivals**, in person or in the app, often outdoors when it can;
- **pays attention to its own land**: what is flowering, fruiting, migrating or resting where members live;
- **keeps the moon** as well, gathering at full or new moons for magic and reflection;
- **holds rites** in a simple, flexible form: opening a sacred space, welcoming whatever powers the coven honours, a seasonal working or custom, sharing food, closing;
- **teaches each member** to keep a small seasonal altar and a habit of noticing the season;
- **practises magic and divination** in the coven's own way.

Most members spend a few minutes a day noticing the season and tending a small altar, and gather with the coven for festivals.

> **Your coven:** Every Wheel coven has its own customs: which names it uses, whether it casts a circle, which powers it honours, how often it meets. Ask your mentor or High Priestess what yours is like, and which festival is coming up next.

## Is it for you?

People come to the Wheel for many reasons: a love of the outdoors and the seasons, a wish for a spiritual life without a fixed creed, a sense that their year needs markers, a family wish to celebrate the turning year with children, or curiosity after reading about witchcraft. Some find that the Wheel's openness suits them perfectly. Others want a tradition with more structure or a single set of gods, and that is fine too.

As you read this course, notice:

- whether marking the seasons speaks to you or feels like a hobby;
- whether you are comfortable with a practice that asks you to decide much of your belief for yourself;
- whether you enjoy the mix of history, folklore and creativity;
- whether this coven feels like a place where you could belong.

> **Safety:** You are free to ask questions, take your time and say no. No one in a healthy coven will pressure you to join, demand money beyond agreed costs, ask for sex, or ask you to keep secrets that would hurt you. If anything feels wrong, talk to someone you trust, inside or outside the coven.

## What's old and what's modern

- **Old:** the Gaelic quarter days, the solstices and equinoxes as markers, many folk customs such as Brigid's crosses, May garlands, harvest suppers and Hallowe'en guising.
- **Modern:** the eight-fold Wheel as one cycle (1950s), several of its names (1970s), and the eclectic covens that keep it today.`,
    },
    {
      id: 'wheel-seeker-a-first-practice',
      title: 'Your first seasonal walk and threshold candle',
      summary: 'One simple practice to try at home: a short walk to notice the season, bringing one thing home, and lighting a candle at your threshold to mark the turning year, step by step.',
      minutes: 20,
      links: [page('green-season'), page('moon'), page('altar'), seasonal('evergreen-boughs'), ritual('hedge-hearing-the-land-walk')],
      body: `## Start here

The heart of the Wheel of the Year is not a rite or a god or a book. It is **noticing**: paying attention to what the year is doing where you live. Every festival grows out of that attention. This lesson teaches you a simple practice in two parts: a short seasonal walk, and a candle lit at your door to mark the season. It takes about twenty minutes and needs almost nothing. If you try only one thing in your first month, try this.

## Part one: the seasonal walk

### What you need

- Fifteen minutes and comfortable shoes.
- A route you know: a street, a park, a garden, a path to the shops. It does not have to be "nature" in any grand sense. A city street has trees, weeds, birds, weather and light.
- Your phone on silent, or left at home if you're comfortable.

### The walk, step by step

1. **Pause at your door.** Stand for a moment before you set off. Breathe in for a count of four and out for a count of six, three times. Say to yourself, silently or aloud: "I am going out to see what the year is doing."
2. **Walk slowly.** Go at about half your usual pace. You are not exercising; you are looking.
3. **Use each sense in turn.** For a minute or two each, notice the light, the air, the plants, the creatures and the sounds (the list below says what to look for).
4. **Find one sign of the season.** Choose one thing that says "this is the time of year it is": a fallen leaf, a sprig of a weed in flower, a feather, a pine cone, a pebble wet with rain. If you take it, take only something that is plentiful and free to pick up, never from a protected place or someone's garden.
5. **Pause at your door again** on the way home, and say: "Thank you for what I have seen."

### What to look for

- **Light:** how high is the sun, how long are the shadows, what colour is the sky.
- **Air:** is it warm or cold, damp or dry, still or moving, and what does it smell of.
- **Plants:** what is in leaf, in bud, in flower, in fruit, dying back or bare.
- **Creatures:** birds, insects, squirrels, cats, people, and what they are doing.
- **Sound:** birdsong, wind, traffic, rain, and how loud or quiet the world is.

## Part two: the threshold candle

The threshold, the doorway of your home, is a place many traditions treat as special: the line between inside and outside, home and world. In Irish and Scottish custom, Brigid's crosses were hung above it; at Hallowe'en, lanterns were set on it; in many places, the first person over it at New Year brought luck. Marking the season at your threshold is a simple way to bring the year in.

### What you need

- A candle in a stable holder, or a tealight in a jar, or an electric candle.
- The sign of the season you brought home, or a picture of it.
- A small dish or saucer to rest it on.

### The practice, step by step

1. **Choose your place.** A shelf or windowsill near your front door, or a table you can see from the door. If that is impossible, any windowsill will do: a window is a threshold too.
2. **Set it out.** Put the dish down, place your sign of the season on it, and set the candle beside it.
3. **Settle.** Stand in front of it. Breathe in for four, out for six, three times.
4. **Light the candle.** As you do, say: "The wheel turns. It is [name the season as you saw it: early spring, high summer, the end of the leaves]. I mark this time."
5. **Speak what you noticed.** Say aloud, or in a whisper, two or three things you saw on your walk. "The blackthorn is out. The light lasts until six. The blackbirds are singing in the evening."
6. **Be still.** Watch the flame for a minute. You don't have to think anything in particular.
7. **Say thanks.** If you honour a god, a spirit of the land, or your ancestors, you may thank them. If not, simply say: "Thank you for this season."
8. **Put out the candle**, or let a tealight in a jar burn while you are in the room and awake.

## Afterwards

- Leave your sign of the season on its dish until it fades, then return it to the earth: a garden, a park, a plant pot.
- Note in the app what you saw and anything you felt. Even a single line counts.
- Look at the app's calendar to see which festival is coming next.

## What you might notice

People describe this practice in many ways: a sense of calm, of slowing down, of being part of something bigger; delight at seeing something they had walked past for years; a little awkwardness at speaking aloud; or nothing much at all. All of these are normal. Many people feel little at first and notice only after a few weeks that they have started to see the year differently: the first blossom, the day the swifts leave. That change of attention is the practice working.

## Common difficulties

- **"I live in a city with no nature."** There is more than you think: street trees, weeds in pavements, pigeons, the angle of the light on buildings, the smell of rain. Notice those.
- **"I can't walk far."** Sit by an open window, or on a step, for fifteen minutes instead. Noticing is the practice, not walking.
- **"I feel silly talking to a candle."** Almost everyone does. A whisper counts, and so does saying it in your head.
- **"I can't have a flame."** Use an electric candle. It works just as well as a marker.

> **Safety:** Keep the candle on a heat-proof surface, away from curtains, coats, paper and anything that hangs near a door. Never leave a flame burning when you leave the room or go to sleep. Keep matches away from children and pets. Don't pick plants you can't identify, and wash your hands after handling anything you found outside.

> **Try this:** Do the walk and the candle three times in your first month, on different days, perhaps a week or more apart. After the third time, write a few sentences in the app about what changed between the walks.

> **Your coven:** Your coven may have its own words for marking the season, or a custom of bringing a sign of the season to every rite. Ask your mentor to show you theirs.

## What's old and what's modern

- **Old:** the threshold as a special place, seasonal signs brought into the house (greenery at midwinter, May blossom, the last sheaf), and simply watching the weather and the year.
- **Modern:** this exact practice, its words, and the habit of writing it down in an app.`,
    },
    {
      id: 'wheel-seeker-a-rite-and-what-is-asked',
      title: 'What a seasonal rite is like, and what is asked of a devotee',
      summary: 'What to expect at your first Wheel festival with the coven, in person or in the app, how to take part as a newcomer, and what becoming a devotee would ask of you in time and commitment.',
      minutes: 15,
      links: [coven('rituals'), page('calendar'), coven('gathering')],
      body: `## Your first rite

During your first thirty days you will probably be invited to a coven gathering: one of the eight festivals, a full moon, or a gathering for newcomers. This lesson tells you what it is likely to be like, so you can come relaxed, and what would be asked of you if you decided to become a devotee.

## Before you go

- **Ask what to expect.** Your mentor or the High Priestess will tell you which festival it is, whether it is indoors or out, how long it will take, whether there is food afterwards, and what you might be asked to do.
- **Ask what to wear.** Usually clean, comfortable clothes suited to the weather. Outdoor rites in winter can be cold; bring layers and a torch. Some covens wear robes or a colour for the season; as a guest, ordinary clothes are always fine.
- **Ask what to bring.** Often a small dish for the shared meal, or something seasonal for the altar: a flower, an apple, a sprig of green.
- **Tell someone** you trust where you are going, as you would for any first meeting with a new group.

## What happens

Eclectic Wheel rites vary more than those of most traditions, but most follow a similar shape. A festival rite might go like this:

1. **Gathering.** People arrive, greet you, put food on the table, and settle. Phones go on silent.
2. **Briefing.** The leader explains the festival, what it celebrates, and who will do what. Newcomers are told what to expect.
3. **Cleansing.** Each person may be cleansed as they enter the space: with smoke from a herb bundle or incense, a sprinkle of water, or simply a moment of washing hands and breathing.
4. **Opening the space.** The space is marked as sacred. Your coven may cast a circle, walk the boundary, call the four directions, honour the land and its spirits, or simply light a central candle or fire and say why you have gathered.
5. **Welcome.** Whatever the coven honours is welcomed: the spirits of the place, the ancestors, particular gods of the season, or the season itself.
6. **The heart of the festival.** Something belonging to the day: lighting candles at Imbolc, planting seeds at the spring equinox, jumping a small fire or dancing a maypole at Beltane, sharing bread at Lammas, remembering the dead at Samhain.
7. **A working or sharing.** Often each person names what they want to grow, harvest or release. Sometimes the coven does magic together.
8. **Sharing food and drink.** A blessing over bread and drink, passed around.
9. **Thanks and closing.** The powers welcomed are thanked; the space is opened again.
10. **Feast.** Food and conversation. This is a good time to ask questions.

A rite usually lasts from half an hour to an hour and a half, plus the meal.

### Online in the app

If the rite is online, each person stays at home with a candle, a cup and something seasonal. The leader guides each step, and everyone does it at the same time. Have your things ready before it starts, and a quiet room if you can.

## How to take part as a newcomer

- **Watch and follow.** No one expects you to know what to do.
- **You can always say no.** If you're offered a role, a chant, or a turn at something, and you don't want it, just say so. You never have to explain.
- **You don't have to speak** your wishes aloud, sing or dance if you're not ready. Standing quietly is a full way to take part.
- **Alcohol is optional.** Juice or water is always available, or you can pass the cup on.
- **You don't have to believe anything.** You can take part as an observer of the season, and decide later what it means to you.
- **Ask afterwards** about anything that puzzled you.

> **Safety:** A healthy coven will tell you what a rite involves before you take part, will never require nudity, touch or anything sexual, and will never make you drink or take anything. Fire-jumping, if your coven does it, is always optional and done over a small, safe fire. If anything feels wrong, you may leave at any time. Tell your mentor or someone you trust.

## What is asked of a devotee

If you decide at the end of your thirty days to continue, the next step is to become a devotee: someone who has chosen this coven and its practice and is learning its foundations, ending in a dedication. Here is roughly what that would ask of you.

### Time

- **A few minutes a day** noticing the season and tending a small seasonal altar. Five to ten minutes is enough.
- **The eight festivals**: an hour or two each, with the coven or at home, about every six weeks.
- **The moon**: some covens gather at full or new moons; you may keep a short moon practice at home.
- **Study**: a few hours a month reading lessons, practising, and writing short answers for your mentor.

### Commitments

- **Keep a small seasonal altar** and change it as the year turns.
- **Work through the devotee course** at your own pace: energy and grounding, sacred space, the coven's ritual form, the Wheel's history and roots, devotion to the land and whatever powers you honour, and finally a dedication.
- **Talk honestly with your mentor**, including about doubts.
- **Keep confidential** what other members share with you.
- **Respect** other members' beliefs, which may differ from yours.

### What it does not ask

- Large sums of money. Agreed shared costs are normal; anything more is a red flag.
- Giving up other friends, family, faiths or interests.
- Believing in particular gods, or in any. Practice comes first; belief can grow or not.
- A lifelong promise. Dedication as a devotee is a commitment to this path for now. You can always leave.

## Making your decision

Your thirty days end with a decision: continue as a devotee, take longer, or part kindly. Before then:

1. **Try the seasonal walk and threshold candle** at least three times.
2. **Attend at least one gathering**, if you can.
3. **Talk openly** with your mentor or the High Priestess about what you've liked, what puzzled you, and what worries you.
4. **Notice how you feel** in the days after practice and after the rite.

> **Your coven:** Ask your mentor how long the devotee course usually takes in your coven, how often the coven meets, and what costs, if any, members share.

## What's old and what's modern

- **Old:** seasonal feasting, fires at the turning points, sharing bread and drink, folk customs belonging to each season.
- **Modern:** the eclectic rite's shape, online rites, devotee courses, and the clear rights every member keeps.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wheel-seeker',
      title: 'A first taste: test',
      intro: 'Ten short questions on what the Wheel of the Year is, your first seasonal practice, and what to expect at a rite. You need 80% to pass. Your mentor will read the written answers.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'What is the Wheel of the Year?',
          options: [
            'A single ancient Celtic calendar, kept unchanged for thousands of years',
            'A modern cycle of eight seasonal festivals, drawing on older festivals, folk customs and the solstices and equinoxes',
            'The Wiccan creed',
            'A calendar of the moon’s phases only',
          ],
          correct: [1],
          points: 1,
          explanation: 'The Wheel is a cycle of eight festivals: the solstices and equinoxes, and four festivals between them taken mainly from the Gaelic calendar. It was put together as one cycle in the twentieth century from genuinely older parts.',
        },
        {
          id: 'q2',
          type: 'truefalse',
          prompt: 'To keep the Wheel of the Year in this coven, you must accept Wiccan beliefs such as the Goddess and God.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. This is an eclectic, non-Wiccan practice. Members may honour many gods, one, none, the land, their ancestors or the seasons themselves.',
        },
        {
          id: 'q3',
          type: 'multi',
          prompt: 'Which four festivals are the turning points of the sun? Choose all that apply.',
          options: ['The winter solstice (Yule)', 'Beltane', 'The spring equinox', 'The summer solstice', 'Samhain', 'The autumn equinox'],
          correct: [0, 2, 3, 5],
          points: 1,
          explanation: 'The solstices and equinoxes are set by the sun. Beltane, Samhain, Imbolc and Lughnasadh fall between them and come mainly from the Gaelic calendar.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'Which statement about the Wheel’s history is honest?',
          options: [
            'Every ancient European people kept all eight festivals',
            'The four Gaelic festivals are well recorded, but the eight were first kept together as one cycle in the twentieth century',
            'The names Litha and Mabon were used by the ancient Celts',
            'Nothing in the Wheel is older than 1970',
          ],
          correct: [1],
          points: 1,
          explanation: 'Its parts are of many ages: old Gaelic festivals, the ancient noticing of solstices, centuries-old folk customs. The eight-fold cycle came together in 1950s England, and Litha and Mabon were named in the 1970s.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'What is the heart of the first practice in this course?',
          options: ['Casting a circle', 'Noticing what the season is doing where you live', 'Reciting a set prayer to a goddess', 'Fasting'],
          correct: [1],
          points: 1,
          explanation: 'Noticing the season is the root of every Wheel festival. The walk and the threshold candle are ways of paying attention and marking it.',
        },
        {
          id: 'q6',
          type: 'multi',
          prompt: 'Which are safe ways to keep the threshold candle? Choose all that apply.',
          options: [
            'A candle on a heat-proof surface, away from coats and curtains',
            'An electric candle',
            'A tealight in a jar, while you are in the room and awake',
            'A candle left burning by the door while you go out',
          ],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Never leave a flame burning when you leave the room or go to sleep. An electric candle works just as well as a marker.',
        },
        {
          id: 'q7',
          type: 'multi',
          prompt: 'At your first coven rite, which of these are fine? Choose all that apply.',
          options: [
            'Watching and following others',
            'Saying no to a role or a turn at something',
            'Choosing juice or water instead of wine',
            'Standing quietly instead of speaking your wishes aloud',
          ],
          correct: [0, 1, 2, 3],
          points: 1,
          explanation: 'All of these are fine. Newcomers are not expected to know what to do, and you may always say no, choose not to drink, or take part quietly.',
        },
        {
          id: 'q8',
          type: 'truefalse',
          prompt: 'Becoming a devotee means making a lifelong promise that you can never take back.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. Dedication as a devotee is a commitment to this path for now. You can always leave.',
        },
        {
          id: 'q9',
          type: 'short',
          prompt: 'After your seasonal walks and threshold candle, describe what you did and what you noticed about the season, including if you noticed little.',
          points: 2,
          explanation: 'Any honest account is welcome. Many people notice little at first; the practice of attention grows with time.',
          rubric: 'Full marks: describes the walk (or seated noticing) and the candle as they actually did them (1 point); names at least one specific sign of the season they observed, or says honestly what they did or did not notice (1 point).',
        },
        {
          id: 'q10',
          type: 'short',
          prompt: 'What appeals to you about keeping the Wheel of the Year, and what questions or worries do you have about joining?',
          points: 2,
          explanation: 'This helps you and your mentor talk openly as you decide. There is no wrong answer.',
          rubric: 'Full marks: names at least one thing that appeals to them, with a reason (1 point); names at least one honest question or worry, or explains why they have none (1 point). Mentor: use this to start a conversation, not to judge.',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'A first taste of the Wheel of the Year',
      intro: 'In your first thirty days you get a feel for the seasonal practice your coven keeps. Read three short lessons, try one simple practice at home, come to a gathering if you can, and talk openly with your mentor or High Priestess about whether this path is for you.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'The Wheel of the Year in brief',
          kind: 'study',
          instructions: `1. Read "The Wheel of the Year in brief".
2. Open the app's calendar and find the next festival of the Wheel and its page.
3. Note anything that surprised you or that you want to ask about, and mark this task done when you've read it.`,
          times: 1,
          response: 'none',
          checked_by: 'self',
          minutes: 15,
          docs: ['wheel-seeker-the-wheel-in-brief'],
        },
        {
          title: 'Your first seasonal walk and candle',
          kind: 'practice',
          instructions: `1. Read "Your first seasonal walk and threshold candle".
2. Take the walk (or sit at an open window), find one sign of the season, and light your threshold candle, step by step.
3. Log each time. Do it three times on different days during your first month.`,
          times: 3,
          response: 'none',
          checked_by: 'self',
          minutes: 25,
          docs: ['wheel-seeker-a-first-practice'],
        },
        {
          title: 'Come to a gathering',
          kind: 'attend',
          instructions: `1. Read "What a seasonal rite is like, and what is asked of a devotee".
2. Ask your mentor which gathering you could come to, and what to wear and bring.
3. Attend, in person or in the app. Watch and follow; you can say no to anything.
4. Send your mentor a message on this step afterwards with anything that puzzled you.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['wheel-seeker-a-rite-and-what-is-asked'],
          solitary: 'Keep the next festival of the Wheel at home: read its page in the app, take a seasonal walk on the day, light your threshold candle, share food with someone if you can, and write what you did.',
        },
        {
          title: 'Is this path for you?',
          kind: 'reflection',
          instructions: `1. Reread the section "What is asked of a devotee".
2. In the answer box, write honestly: what appeals to you, what feels hard, whether the time and commitments fit your life, and what you'd like to ask before deciding.
3. Talk it through with your mentor or High Priestess.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 20,
          docs: ['wheel-seeker-a-rite-and-what-is-asked', 'wheel-seeker-the-wheel-in-brief'],
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Take the short test. The choice questions are scored at once; your mentor reads the written answers.
2. You need 80% to pass. If you don't pass, look at the questions you missed and try again (the explanations show once you've passed); it's a check of understanding, not a hurdle.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 15,
          quiz: 'quiz-wheel-seeker',
        },
      ],
    },
  ],
} satisfies CourseModule;
