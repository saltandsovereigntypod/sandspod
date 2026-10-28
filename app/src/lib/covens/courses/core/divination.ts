// Core module: divination. What it is and how to choose a system, tarot in
// depth (the deck, a three-card spread, a reading method), runes, ogham,
// pendulum and scrying briefly, daily-draw journaling, and reading ethically
// for others. Card names and keywords follow app/src/lib/divination/tarot.ts
// (Rider–Waite–Smith); rune and ogham history follows the Grimoire's pages.

import type { CourseModule } from '../types.ts';

const divination = {
  id: 'core-divination',
  title: 'Divination',
  docs: [
    {
      id: 'core-divination-what-it-is',
      title: 'What divination is',
      summary:
        'What divination is and isn’t, a short honest history, the different ways practitioners understand it, how to ask a good question, and how to choose a system.',
      minutes: 20,
      body: `## Seeking insight

**Divination** is any practice of seeking insight or guidance through a system of signs: cards, runes, the fall of lots, a swinging pendulum, the patterns in water or smoke, the flight of birds, dreams. The word comes from Latin *divinare*, “to foresee” or “to be inspired by a god”.

Divination is one of the oldest and most widespread human practices. Babylonian priests read the livers of sacrificed animals. Greeks travelled to the oracle at Delphi. Romans watched the flight of birds before public business (the *augurs*). The Norse and other Germanic peoples, according to the Roman writer Tacitus, cast marked strips of wood to learn the will of the gods. Chinese diviners used the *Yijing* (I Ching). It is found on every continent.

In a coven, divination is used to look at a situation more clearly, to ask the gods or spirits for guidance, to check whether a working is wise before doing it, to reflect on your own path, and sometimes to help others.

## What divination can and can’t do

Be honest with yourself and with anyone you read for.

Divination **can**:

- help you see a situation from new angles;
- bring to the surface what you already half know;
- prompt good questions and better decisions;
- give a sense of guidance, comfort or warning;
- in many traditions, be a way of listening to gods, spirits and ancestors.

Divination **can’t**:

- tell you fixed facts about the future, as if it were already written;
- diagnose illness, predict pregnancy, settle legal questions, or tell you whether to take a medicine;
- tell you for certain what someone else is thinking or doing;
- replace doctors, lawyers, counsellors, or your own judgement.

There is no scientific evidence that divination predicts events. Practitioners who find it valuable usually speak of it as insight and guidance rather than prediction.

## How might it work?

Practitioners hold different views. You don’t need to choose one.

1. **As a mirror.** The symbols prompt your own intuition and unconscious mind. A card shows you a picture; what you see in it, and what you feel about it, tells you something you didn’t know you knew. The psychologist Carl Jung’s idea of *synchronicity* (meaningful coincidence) is often mentioned here.
2. **As a conversation.** Gods, spirits, ancestors or your own deeper self guide the fall of cards or runes to say something. This is the oldest understanding: in most ancient divination, the gods were the ones speaking.
3. **As a tool for thinking.** Even if nothing beyond chance is at work, a random prompt breaks habits of thought and helps you consider options you had overlooked.

Many practitioners use all three at different times.

## Asking a good question

The quality of a reading depends heavily on the question.

1. **Make it open, not yes or no.** “What do I need to know about this new job?” works better than “Will I get the job?”
2. **Make it about you,** or about something you have a right to know. “How can I improve my relationship with my sister?” rather than “What is my sister secretly thinking?”
3. **Make it about the near future or the present.** Readings are clearest about the next weeks or months, and about the forces at work now.
4. **Make it one question.** If you have three questions, do three readings.
5. **Write it down** before you begin, so you can read it back later.

Good starting forms: “What do I need to know about…?”, “What would help me with…?”, “What is the best approach to…?”, “What am I not seeing about…?”

## Choosing a system

There are hundreds of divination systems. For a beginner, it is best to learn **one** system well before trying others. A good choice:

- **Tarot** is the most widely used in modern witchcraft, has a rich picture language that beginners can read straight away, and is taught in depth in the next two lessons. The app has a full tarot deck with meanings.
- **Oracle decks** are simpler picture decks with no fixed structure; each comes with its own guidebook. They are gentle to start with but vary greatly.
- **Runes** suit Heathen and Germanic-leaning practitioners, and are taught briefly in a later lesson.
- **Ogham** suits Celtic-leaning practitioners, also taught briefly later.
- **Pendulum** is good for simple yes-or-no questions.
- **Scrying** (gazing into water, a mirror or flame) suits people who see images easily.

Choose what draws you, what fits your tradition, and what you can get easily. You can use the app’s cards and runes before buying anything.

## A first reading, before you know anything

You can begin today, before learning a single meaning.

1. Sit quietly and take five slow breaths.
2. Write an open question about your own life.
3. Draw one tarot card (from the app or a deck) without looking up its meaning.
4. Look at the picture for three minutes. Describe aloud or on paper everything you see: who is there, what they are doing, the colours, the weather, the mood.
5. Ask: if this picture were an answer to my question, what would it be saying?
6. Write your answer down. Only then look up the card’s meaning and compare.

Many beginners are surprised how much they find in the picture alone. That is the heart of reading: looking closely and listening to what arises.

## Common difficulties at the start

- **“I feel silly.”** Most people do at first. It passes with practice.
- **“I don’t trust what comes.”** That’s healthy. Write it down and see how it looks in a week.
- **“I want to read about everything.”** Keep to one question a day for now. Too many readings blur together.

> **Your coven:** Your coven may favour one system, especially one tied to its tradition: runes in Heathenry, ogham in Celtic paths, lots and omens in Hellenic and Roman practice, Psalms and Bible-opening in Christian folk magic. Ask your mentor which the coven uses and whether it has a reader you can learn from.

> **Safety:** If divination ever makes you anxious, obsessive (reading again and again on the same question) or frightened, stop for a while. Ground yourself, talk to your mentor, and remember that a reading shows possibilities, not fate.`,
    },
    {
      id: 'core-divination-tarot-deck',
      title: 'The tarot deck',
      summary:
        'The structure of a tarot deck: the 22 Major Arcana, the four suits and their elements, what the numbers and court cards mean, and a short honest history.',
      minutes: 30,
      body: `## A short history

Tarot cards first appear in northern Italy in the fifteenth century, as luxury hand-painted decks for a card game called *tarocchi*. The game is still played in parts of Europe. There is no evidence that tarot was used for divination for its first three hundred years or so.

In 1781 the French writer Antoine Court de Gébelin claimed that the tarot held the lost wisdom of ancient Egypt. He was wrong (the Egyptian language hadn’t yet been deciphered, and nothing connects the cards to Egypt), but the idea caught on. In 1789 a French occultist known as Etteilla published the first deck designed for fortune-telling. In the late nineteenth century the Hermetic Order of the Golden Dawn linked the cards to astrology, the Hebrew alphabet and the four elements.

In 1909 the artist **Pamela Colman Smith**, working with the occultist A. E. Waite, painted a deck in which every card, including the numbered ones, shows a scene. This **Rider–Waite–Smith** deck is the most influential tarot of the twentieth century, and most modern decks follow its structure and imagery. The app’s tarot uses it.

So tarot is old as a deck of cards, and a little over two centuries old as a divination system. It is a living, creative tradition, with thousands of decks made every year.

## The structure

A tarot deck has **78 cards**, in two parts.

### The Major Arcana: 22 cards

*Arcana* means “secrets”. The 22 Major Arcana show large themes, turning points and spiritual lessons. They are numbered 0 to 21. Read through them slowly; the keywords are the app’s.

- **0 The Fool:** beginnings, trust, the open road.
- **1 The Magician:** will, skill, the tools to hand.
- **2 The High Priestess:** secrets, intuition, the inner voice.
- **3 The Empress:** abundance, nurture, fruitfulness.
- **4 The Emperor:** structure, authority, steadiness.
- **5 The Hierophant:** tradition, teaching, belonging.
- **6 The Lovers:** love, union, a true choice.
- **7 The Chariot:** will, direction, victory.
- **8 Strength:** gentle courage, patience, compassion.
- **9 The Hermit:** solitude, inner light, seeking.
- **10 Wheel of Fortune:** cycles, fate, a turning point.
- **11 Justice:** fairness, truth, cause and effect.
- **12 The Hanged Man:** surrender, pause, a new way of seeing.
- **13 Death:** endings, transformation, clearing. Almost never a physical death.
- **14 Temperance:** balance, moderation, patience.
- **15 The Devil:** attachment, temptation, the shadow.
- **16 The Tower:** upheaval, revelation, sudden change.
- **17 The Star:** hope, renewal, calm.
- **18 The Moon:** illusion, fear, the unconscious.
- **19 The Sun:** joy, success, vitality.
- **20 Judgement:** awakening, reckoning, a calling.
- **21 The World:** completion, wholeness, arrival.

Many readers see the Major Arcana as a story, sometimes called **the Fool’s Journey**: the Fool sets out (0), meets teachers and powers (1 to 5), makes choices and gains mastery (6 to 10), faces trials, surrender and endings (11 to 16), and finds hope, illumination and completion (17 to 21).

> **Note:** In older decks such as the Tarot of Marseille, Strength is 11 and Justice is 8. Waite swapped them. Neither is wrong; just know which your deck uses.

### The Minor Arcana: 56 cards

The Minor Arcana are like ordinary playing cards: four suits, each with cards from Ace to Ten and four court cards. They show the everyday events, people, feelings and choices of life.

The four suits, with the elements most modern readers give them (from the Golden Dawn):

- **Wands** (also rods, staves): **fire.** Will, energy, creativity, ambition, work, passion. Equivalent to clubs in playing cards.
- **Cups:** **water.** Feelings, love, relationships, intuition, dreams. Equivalent to hearts.
- **Swords:** **air.** Thought, truth, words, conflict, decisions, difficulty. Equivalent to spades.
- **Pentacles** (also coins, disks): **earth.** Money, work, the body, home, the material world. Equivalent to diamonds.

> **Note:** A few decks and readers swap Wands and Swords, giving Wands to air and Swords to fire. If your deck’s book does this, follow it.

### The numbers

Each number has a general meaning, which combines with the suit:

- **Ace:** a seed, a beginning, the pure gift of the suit.
- **Two:** balance, choice, partnership.
- **Three:** growth, first results, cooperation.
- **Four:** stability, structure, rest (sometimes stagnation).
- **Five:** conflict, loss, challenge, disruption.
- **Six:** harmony restored, generosity, moving on.
- **Seven:** assessment, testing, a choice or a challenge to hold your ground.
- **Eight:** movement, effort, mastery or being caught.
- **Nine:** near-completion, fulfilment or its anxieties.
- **Ten:** completion, the end of a cycle, sometimes too much.

So the **Ace of Cups** is a new love or emotional beginning; the **Five of Pentacles** is material hardship; the **Ten of Wands** is the burden of carrying too much work.

### The court cards

Each suit has four court cards: **Page, Knight, Queen, King.** They can show:

- **a person** in your life, with the qualities of that rank and suit;
- **a part of you** you need to use;
- **a way of approaching** the situation.

A general guide:

- **Page:** a learner, messenger, beginner, curiosity.
- **Knight:** action, movement, pursuit (sometimes too fast or too much).
- **Queen:** mature, inward mastery of the suit; nurturing, understanding.
- **King:** mature, outward mastery of the suit; leadership, responsibility.

The **Queen of Cups** might be a deeply compassionate person, or a call to listen to your own feelings with care. The **Knight of Swords** might be someone rushing in with sharp words, or a call to act quickly on a clear idea.

Court cards are traditionally hard for beginners. Don’t worry about getting them “right”; notice what they suggest.

## Reversed cards

Some readers read cards that come out upside down as **reversed**, with a changed meaning: often the energy of the card blocked, delayed, turned inward, or overdone. The app gives reversed meanings for every card. Reading reversals is optional. Many good readers never use them. As a beginner, you may prefer to turn every card upright and add reversals later.

## Getting to know your deck

1. **Choose a deck.** The app’s Rider–Waite–Smith cards are a good start. If you buy a deck, choose one whose pictures you like and that follows the Rider–Waite–Smith structure, with scenes on every card.
2. **Look through every card,** slowly, without reading the meanings. Notice what catches your eye.
3. **Sort them** into Major Arcana and the four suits, and lay out each suit from Ace to King.
4. **Study one card a day.** Look at the picture for two minutes. Write what you see: people, colours, objects, weather, mood. Then read its meaning and write what you think it means *for you*.

There is a myth that your first tarot deck must be given to you as a gift. It needn’t. Buy, borrow or use the app’s.

> **Your coven:** Your coven may have a preferred deck, or readers who use a particular one. Some covens cleanse and consecrate decks as tools (as you learned in Altar and tools). Ask your mentor.`,
    },
    {
      id: 'core-divination-tarot-reading',
      title: 'Reading the cards: a three-card spread',
      summary:
        'How to prepare, shuffle, lay out and read a three-card spread step by step, with a worked example, common difficulties, and how to know you are improving.',
      minutes: 30,
      body: `## What a spread is

A **spread** is a pattern for laying out cards, where each position has a meaning. The positions turn a handful of cards into an answer you can read. There are many spreads, from one card to the famous ten-card Celtic Cross. The best one to learn first is the **three-card spread**: simple enough to learn quickly, rich enough to say something real.

## Three ways to read three cards

Choose one before you lay the cards.

- **Past, present, future:** what led here, where things stand, where they are heading if nothing changes.
- **Situation, challenge, advice:** what is going on, what stands in the way, what would help.
- **Mind, body, spirit:** what is happening in your thoughts, your physical life, and your spiritual life.

“Situation, challenge, advice” is especially good for beginners, because it always ends on something you can act on.

## Reading step by step

Allow about twenty minutes.

1. **Prepare the space.** Clear a table. Some people lay a cloth. Light a candle if you wish (safely). Switch off notifications.
2. **Ground and centre,** as you learned in Grounding. Take five slow breaths: in for four, out for six.
3. **Write your question** in your journal. Keep it open and about you (see What divination is).
4. **Shuffle.** Hold the cards and shuffle in whatever way is comfortable: overhand, riffle, or spread them face down on the table and swirl them. While you shuffle, hold the question in mind. Stop when it feels right, or after a count of your choice.
5. **Cut** the deck if you like (many readers cut into three piles with the left hand and restack), then take the top three cards. Or fan them out and pick three that draw you.
6. **Lay them face down,** left to right: position one, two, three.
7. **Turn them over** one at a time.
8. **Look before you read.** For each card, spend a minute just looking. What is happening in the picture? What is the mood? What catches your eye? What do you feel?
9. **Add the meaning.** Now recall or look up the card’s keywords. How do they fit the picture and the position?
10. **Read the cards together.** Look at all three. Is there a story moving left to right? Are there many cards of one suit (lots of Cups suggests feelings are the heart of it)? Many Major Arcana (a big, significant time)? Do people in the cards face towards or away from each other?
11. **Sum it up in one or two sentences.** This is the answer to your question.
12. **Write it down:** the date, question, spread, cards, what you saw, and your summary. If you’re using the app, you can save the reading.
13. **Close.** Thank whatever you feel helped (your deck, your gods, your own intuition), put the cards away, and drink some water.

## A worked example

**Question:** “What would help me feel settled in my new home?”

**Spread:** situation, challenge, advice.

1. **Situation: Four of Wands.** Garlands, people dancing at the gate: celebration, homecoming. The picture says this home is a good thing, a real arrival.
2. **Challenge: Eight of Swords.** A blindfolded woman surrounded by swords, though the way out is open. Feeling trapped, mostly by thoughts. The challenge isn’t the home; it’s worry.
3. **Advice: Six of Cups.** Children sharing flowers in an old courtyard: memory, kindness, simple pleasures. Bring things that feel like home from the past; be gentle; perhaps invite an old friend.

**Summary:** “The home is right. What unsettles me is worry, which is less real than it feels. Fill the place with familiar comforts and people I love.”

Notice that the reading didn’t predict anything. It gave a fresh way of looking at the situation and something to do.

## Common difficulties

- **“I can’t remember the meanings.”** Normal. Look them up, every time, for months. Meanings stick through use, not memorising lists. Lean on the pictures; they were drawn to be read.
- **“The cards don’t make sense together.”** Read each card alone first, then ask: if these three were a sentence, what would it say? If it still doesn’t fit, write it down and come back in a week. Many readings make sense only in hindsight.
- **“I got a scary card.”** Death, the Tower and the Devil are dramatic, but not curses. Death is endings and change; the Tower is upheaval that clears the ground; the Devil is unhealthy attachment. They show what is happening so you can respond.
- **“I keep drawing again because I don’t like the answer.”** Stop. Re-drawing until you get the answer you want teaches nothing. Write down the first reading and sit with it. Give the question a few days, at least, before asking again.
- **“I read what I want to see.”** Everyone does at first. Writing your reading down and checking it later is the cure.

## How you’ll know it’s working

You will not wake up one day with second sight. Instead, over weeks, you will notice: the meanings come faster; you see more in the pictures; your summaries get clearer; and when you look back at old readings, more of them seem apt. That is real progress.

> **Safety:** Don’t read about your health, a pregnancy, someone’s death, or legal and financial decisions in a way that replaces professional advice. If a reading frightens you, put it away, ground yourself, and talk to your mentor.

> **Try this:** Do a situation, challenge, advice reading on a small, real question in your life this week. Follow every step above and write it all down.`,
    },
    {
      id: 'core-divination-other-systems',
      title: 'Runes, ogham, pendulum and scrying',
      summary:
        'A short, honest introduction to four other common systems: what each is, where it comes from, and a simple way to begin.',
      minutes: 25,
      body: `## Other ways of seeing

Tarot is not the only way. This lesson introduces four other systems you may meet in your coven. Each could fill a course of its own; this is a first taste. The app’s Grimoire has fuller pages on the runes and ogham.

## Runes

**Runes** are the letters of the old Germanic alphabets. The oldest, the **Elder Futhark**, has 24 runes and was used from roughly the second to the eighth century, carved on stone, wood, metal and bone. It is named after its first six letters: *f, u, th, a, r, k*. Each rune is a letter, a sound and a name with a meaning: **Fehu** (cattle, wealth), **Uruz** (aurochs, strength), **Thurisaz** (giant, thorn), and so on.

**History, honestly.** The Roman writer Tacitus, around the year 98, described Germanic peoples casting strips of wood marked with signs to learn the will of the gods, but he doesn’t say the signs were runes. The old rune poems (Old English, Norwegian and Icelandic, written down in the Middle Ages) give each rune a short verse, and these are the main old source for meanings. Most modern methods of rune divination, and nearly all reversed (“merkstave”) readings, are twentieth-century inventions. The “blank rune” in many sets was added in 1982 and has no historical basis.

**A simple start:**

1. Make or buy a set of 24 runes. You can paint them on pebbles or write them on card, or use the app’s.
2. Ground and centre. Hold a question in mind.
3. Draw one rune from a bag without looking.
4. Read its name and meaning, and look at its shape. What does it say about your question?
5. Write it down.

> **Note:** Runes are sacred in Heathenry, and some runic symbols have been misused by hate groups. Learn them respectfully, from good sources. Your coven’s tradition lessons may teach them more fully.

## Ogham

**Ogham** is an early medieval Irish alphabet of twenty letters (plus a few later additions), made of strokes cut along a straight line, often the edge of a standing stone. Several hundred ogham stones survive in Ireland and western Britain, mostly from the fourth to sixth centuries, recording people’s names.

**History, honestly.** Medieval Irish scholars, in texts such as the *Ogham Tract*, listed each letter with names and associations, including trees: *beith* (birch), *luis* (rowan), *fearn* (alder), and so on. Not every letter name originally meant a tree; the tree lists were partly a later learned scheme. There is no direct evidence that ogham was used for divination in early Ireland. The popular “Celtic tree calendar”, with each letter given a month, was invented by the poet Robert Graves in *The White Goddess* (1948). Modern ogham divination, usually with letters carved on wooden sticks (“few”), is a living modern practice built on these sources.

**A simple start:** as with runes, draw one stick or card, read its name, tree and meaning, and reflect on how it speaks to your question.

## The pendulum

A **pendulum** is a small weight on a chain or thread: a crystal, a ring, a key. You hold it still and ask a yes-or-no question, and it swings in a pattern you have agreed means yes, no or unsure.

**How it works, honestly.** In 1852 the physiologist William Carpenter described the **ideomotor effect**: tiny muscle movements you make without noticing, driven by what you expect or half know. Experiments show pendulums move this way. Some practitioners see this as exactly the point (it reveals what your deeper mind knows); others believe spirits or energy guide it too. Either way, it can only tell you what *something* in you or around you inclines towards. It is not a lie detector, a medical test or a way to choose numbers.

**A simple start:**

1. Sit with your elbow resting on a table and hold the chain between thumb and finger, the weight hanging still.
2. **Calibrate.** Ask it to show you “yes”, and wait. It may swing back and forth, side to side, or in a circle. Then ask for “no”, and then “unsure”. Write down each.
3. **Test.** Ask questions you know the answer to (“Is my name Alex?”) to check.
4. **Ask** simple, real questions about yourself, and treat the answer as one voice among many, not a command.

## Scrying

**Scrying** means gazing into a surface (still water, a dark mirror, a crystal ball, a candle flame, smoke) until images, impressions or ideas arise. The Elizabethan scholar John Dee used a polished obsidian mirror (now in the British Museum) and a crystal for his visionary work. Scrying is found in many cultures.

**A simple start: water scrying.**

1. In a dim room, fill a dark bowl with water. Put a candle (in a safe holder) where its light doesn’t reflect directly in the water.
2. Ground and centre, then hold a question gently in mind.
3. Gaze softly at the water’s surface, or just into it. Blink when you need to. Breathe slowly.
4. Wait. For ten minutes, notice any shapes, colours, pictures, words, memories or feelings that arise, in the water or in your mind’s eye. Many people see little for the first few sessions; that is normal.
5. Stop, write down everything, eat or drink something, and ground.

> **Safety:** Keep scrying sessions short (ten to fifteen minutes). Gazing can bring on a dreamy, spaced-out state. If you feel disoriented, frightened, or unsure what is real, stop at once, put the lights on, ground yourself firmly, and talk to your mentor. If you have a history of dissociation, psychosis or seizures, talk to your mentor and your doctor before scrying, and choose another method if in doubt. Never leave a candle unattended.

> **Your coven:** Your tradition may have its own forms of divination, taught in its own lessons. Ask your mentor which of these, if any, your coven uses.

> **Try this:** Choose one of these four systems and try it three times this fortnight. Write down what you did, what you asked, what came, and how it compared with tarot for you.`,
    },
    {
      id: 'core-divination-daily-draw',
      title: 'The daily draw and your reading journal',
      summary:
        'How to keep a daily one-card practice and a reading journal, what to record, and how reviewing your readings over time makes you a better reader.',
      minutes: 15,
      body: `## Little and often

The single best way to learn any divination system is a **daily draw**: one card (or rune, or ogham stave) each day, read and recorded. It takes five minutes. Over a few months, you will meet every card many times in the context of real days, which teaches you more than any book.

## The daily draw, step by step

1. **Choose a time.** Morning works well, so you can carry the card through the day and see how it fits. Some people prefer evening, as a reflection on the day just gone. Be consistent.
2. **Ground briefly.** Three slow breaths.
3. **Ask a simple question.** For example: “What do I need to know today?”, “What energy will help me today?”, or “What should I pay attention to?”
4. **Shuffle and draw one card.** Use your own deck or the app’s draw.
5. **Look first.** Spend a minute with the picture.
6. **Read the meaning.** Look it up if you need to.
7. **Write two or three lines:** the card, what you see in it, and one guess about how it might show up today.
8. **In the evening, add a line:** did it show up? How?

## Learning a card through the day

A daily card is a small teacher. To get the most from it:

1. **Describe it in your own words** before reading anything. “A man carrying ten heavy sticks towards a town, bent over, can’t see where he’s going.”
2. **Find the keyword that fits the picture.** For the Ten of Wands the app gives burden, responsibility, overload. You can see it in the picture.
3. **Make one guess.** “Today I might take on too much at work.”
4. **Watch.** During the day, notice anything that echoes the card: a conversation, a mood, a sight, a choice.
5. **Reflect in the evening.** Perhaps you did take on too much; perhaps you said no to something and felt relief; perhaps nothing matched. Write it down either way.

Over months, each card gathers real memories: the day the Ten of Wands was the shopping you carried home in the rain, the day the Star was the message from an old friend. Those memories become your meanings, and they are far easier to recall than lists.

## A worked week

Here is a trainee’s first week, as she wrote it in her journal.

- **Monday, Page of Cups:** a young person looking at a fish in a cup, surprised. *Guess:* a pleasant surprise. *Evening:* a colleague brought cake for no reason. Small, but it fitted.
- **Tuesday, Five of Swords:** someone walking off with swords, others defeated. *Guess:* an argument. *Evening:* I nearly snapped at my brother and didn’t. Maybe a warning heeded.
- **Wednesday, The Hermit:** an old man with a lantern alone on a mountain. *Guess:* I need time alone. *Evening:* cancelled plans and read; felt much better.
- **Thursday, Eight of Pentacles:** someone carefully making coins at a bench. *Guess:* steady work. *Evening:* finished a dull report properly. Felt good.
- **Friday, Three of Cups:** three women dancing with cups. *Guess:* friends. *Evening:* drinks with friends. Easy one.
- **Saturday, The Tower:** lightning, people falling. *Guess:* something sudden. *Evening:* the boiler broke. Annoying, not a disaster.
- **Sunday, Four of Swords:** a knight lying still in a church. *Guess:* rest. *Evening:* slept all afternoon.

Notice how ordinary it is. The daily draw is not about drama. It is about learning the cards through real life, and noticing your days more closely.

## Common difficulties

- **Missing days.** Don’t worry; start again the next day.
- **Drawing the same card often.** Take notice. A card that keeps returning may be pointing at something.
- **Every card seems to fit, whatever happens.** That can happen, because cards are broad. Make your morning guess specific, and be honest in the evening about whether it fitted.

## What to record

Keep every reading, daily draws and larger spreads alike, in one place: your Grimoire in the app, the app’s reading log, or a notebook. For each reading, write:

- the **date and time**, and the **Moon’s phase** (you will learn something from this);
- the **question**;
- the **spread** and the **cards** in their positions (and whether any were reversed);
- **what you saw** in the pictures and **what you felt**;
- your **summary**: the answer in a sentence or two;
- later, a **follow-up note**: what actually happened, and how the reading looks now.

## Reviewing your readings

Once a month, at the same phase of the Moon if you like, read back over the month’s readings.

1. **Count.** Which cards came up most? Which suits? Were there many Major Arcana? Repeated cards often point to a theme in your life.
2. **Check.** Read your follow-up notes. Which readings seem apt now? Which seem off? Can you see why?
3. **Learn.** Pick one card that confused you and study it again, looking at the picture and the app’s longer Grimoire page.
4. **Write a short summary** of the month: themes, lessons, how your reading is changing.

## Honest record-keeping

It is natural to remember the readings that “came true” and forget those that didn’t. That is how all human memory works. Writing everything down, including the misses, keeps you honest, helps you learn which kinds of question your system answers well, and protects you from both over-trusting and dismissing it.

> **Note:** If a daily card is hard (the Tower, the Five of Pentacles), don’t dread the day. Take it as a gentle warning: be careful with plans, look after your money, check in with yourself. Most days, nothing dramatic happens. Notice how the card shows up in small ways.

> **Your coven:** Some covens share a monthly card or rune with the whole group, or draw one at each esbat. Ask your mentor if yours does.

> **Try this:** Start your daily draw today. Keep it for the rest of this stage, recording each draw, and review the whole set at the end.`,
    },
    {
      id: 'core-divination-ethics',
      title: 'Reading for others, ethically',
      summary:
        'How to read for another person with consent, care and honesty: what to read about and what not to, how to give hard news, confidentiality, money and red flags.',
      minutes: 20,
      body: `## A responsibility

Reading for yourself is practice. Reading for someone else is a responsibility. People often come to a reader when they are worried, grieving, lovesick or at a crossroads, and what you say can affect them deeply. Most covens expect members to read for others only once they are confident in their system, and always with care.

## Consent

1. **Read only for someone who has asked,** or who has clearly agreed when you offered. Never do an unasked-for reading “at” someone, and don’t announce what the cards say about people who didn’t ask.
2. **Don’t read about third parties** who haven’t consented, as if spying on them. “What is my ex doing?” or “Is my partner cheating?” invade someone else’s privacy and rarely help. Turn the question back to the person asking: “What do I need to know about how I feel after the break-up?”, “What would help me with my worries about trust?”
3. **The person can stop at any time.** Say so at the start.

## What not to read on

Some questions are not for divination, or should only be read alongside proper help. Gently redirect, and say why.

- **Health:** don’t diagnose, predict illness or recovery, or advise on medicine. Encourage them to see a doctor.
- **Pregnancy:** don’t predict whether someone is or will become pregnant, or the sex of a baby.
- **Death:** don’t predict anyone’s death, ever.
- **Legal and financial decisions:** don’t tell someone how a court case will go or whether to make an investment. Point them to a lawyer or adviser.
- **Mental health crises:** if someone is in crisis or talking about harming themselves, don’t read. Stay with them, listen, and help them contact a crisis line, a doctor or emergency services.

You can still read around these subjects in a supportive way: “What would help me cope while I wait for test results?” is a fair question; “Do I have cancer?” is not.

## How to give a reading

1. **Before you start,** agree the question together, and explain briefly how you read: that the cards show possibilities and advice, not fixed fate.
2. **Ground** yourself, and offer the other person a few slow breaths too.
3. **Read honestly but kindly.** Describe what you see. Use “this suggests”, “this might mean”, “how does that fit for you?” rather than certainties.
4. **Invite them in.** Ask what they see in the pictures. A reading is a conversation.
5. **Give hard cards with care.** Explain what they really mean (the Death card is change, not death), focus on what can be done, and never frighten someone.
6. **End with something they can act on,** and remind them that the choices are theirs.
7. **Check how they are** before they go. If they seem shaken, ground together, offer water, and stay a while.

## Words to open and close

It helps to have simple words ready. You might begin:

“Before we start: the cards show possibilities and advice, not a fixed future. You make your own choices. If anything feels uncomfortable, say so and we’ll stop. What would you like to ask about?”

And close:

“Those are the cards. What stands out most for you? Remember, this is one way of looking at things; you know your life best. How are you feeling?”

## Reading within the coven

Coven members often read for one another, and sometimes the coven asks a reader to divine for the group, for example before a working or at a festival. The same ethics apply: an agreed question, honesty with kindness, and confidentiality. When you read for the coven as a whole, report what you saw plainly and humbly, and leave decisions to the coven and its leaders. A reading is advice, not an order.

## Confidentiality

What someone tells you in a reading is private. Don’t share it with anyone, including other coven members, without permission. Don’t post readings about real people online. If you keep notes, keep them private and without full names.

The only exception is safety: if someone tells you they or another person, especially a child, is in danger, encourage them to get help, and talk to your mentor or High Priestess about what to do. Safety comes before confidentiality.

## Money, pressure and red flags

Some professional readers charge fairly for their time and skill, and that is fine. But divination is also used to exploit people. Watch for these red flags, whether in yourself, in other readers, or in anyone who reads for you:

- claiming a curse or “dark energy” that only an expensive working can remove;
- asking for more and more money, gifts, or secrets;
- making someone dependent, reading on the same question again and again;
- frightening someone so they come back;
- using a reading to pressure someone into a relationship, sex, or joining a group.

No genuine reader or coven will demand money, sex or secrets from you. If anyone does, stop, and talk to your mentor or High Priestess.

> **Your coven:** Your coven may have its own rules on reading for others, for money, or for people outside the coven. Ask your mentor before you start.

> **Try this:** With your mentor’s agreement, offer a three-card reading to a friend or fellow trainee who would like one. Follow the steps above, with consent and an open question. Afterwards, ask them how it felt, and write down what you learned.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-core-divination',
      title: 'Divination: test',
      intro:
        'Fourteen questions on what divination is, the tarot deck, reading a spread, other systems, journaling and ethics. Choice questions are scored at once; your mentor scores the written answers. You need 80 per cent to pass, and you can retake it.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'Which question is best suited to a divination reading?',
          options: [
            'Will I get the job? Yes or no?',
            'What do I need to know about applying for this job?',
            'What is my manager secretly thinking about me?',
            'Will my test results be clear?',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Good questions are open, about you, and about the present or near future. Yes-or-no questions give little to read, questions about other people’s private thoughts invade their privacy, and health questions belong with a doctor.',
        },
        {
          id: 'q2',
          type: 'truefalse',
          prompt: 'Tarot cards were invented in ancient Egypt to preserve secret wisdom.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation:
            'Tarot first appears in fifteenth-century Italy as a card game. The Egyptian theory was proposed by Court de Gébelin in 1781 and is not supported by any evidence. Divinatory use dates from the eighteenth century.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'How many cards are in a tarot deck, and how are they divided?',
          options: [
            '52 cards in four suits',
            '78 cards: 22 Major Arcana and 56 Minor Arcana',
            '78 cards: 56 Major Arcana and 22 Minor Arcana',
            '22 cards only',
          ],
          correct: [1],
          points: 1,
          explanation:
            'A tarot deck has 78 cards: 22 Major Arcana (0 The Fool to 21 The World) and 56 Minor Arcana in four suits of fourteen cards each.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'In most modern decks, which suit corresponds to water and feelings?',
          options: ['Wands', 'Cups', 'Swords', 'Pentacles'],
          correct: [1],
          points: 1,
          explanation:
            'Cups are water: feelings, love, relationships and intuition. Wands are fire, Swords air, and Pentacles earth (though a few decks swap Wands and Swords).',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'You draw the Death card. What does it most often mean?',
          options: [
            'Someone is going to die',
            'Endings, transformation and clearing the way for something new',
            'A curse has been placed on you',
            'You should stop reading tarot',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Death almost never means a physical death. It stands for endings, change and clearing. Dramatic cards show what is happening so you can respond; they are not curses.',
        },
        {
          id: 'q6',
          type: 'multi',
          prompt: 'Which of these are good habits when reading for yourself? Choose all that apply.',
          options: [
            'Writing down the question before you start',
            'Looking at each picture before reading its meaning',
            'Drawing again until you get an answer you like',
            'Recording the reading and checking it later',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation:
            'Writing the question, looking before reading, and recording and reviewing readings all make you a better reader. Re-drawing until you like the answer teaches nothing.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'What does the court card the Page usually suggest?',
          options: ['Mature leadership', 'A learner, messenger or beginning curiosity', 'Rushing into action', 'Completion'],
          correct: [1],
          points: 1,
          explanation:
            'Pages are learners and messengers; Knights are action and pursuit; Queens are inward mastery; Kings are outward mastery and leadership.',
        },
        {
          id: 'q8',
          type: 'truefalse',
          prompt: 'Reading reversed cards is required in tarot, and a reading without reversals is incomplete.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation:
            'Reversals are optional. Many good readers never use them. You can turn every card upright as a beginner and add reversals later if you choose.',
        },
        {
          id: 'q9',
          type: 'single',
          prompt: 'Which statement about runes is most accurate?',
          options: [
            'Rune divination methods, including reversed readings and the blank rune, are recorded in detail in Viking sources',
            'The runes are an old alphabet; most modern divination methods with them, including reversed readings and the blank rune, are twentieth-century',
            'Runes were invented in 1982',
            'Runes come from ancient Ireland',
          ],
          correct: [1],
          points: 1,
          explanation:
            'The Elder Futhark was used from about the second to the eighth century. The rune poems give old meanings, but most divination methods, reversed readings and the blank rune (1982) are modern. Ogham, not the runes, is Irish.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'What is the ideomotor effect, and why does it matter for pendulum work?',
          options: [
            'A spirit that moves pendulums',
            'Tiny, unnoticed muscle movements, driven by expectation, that can move a pendulum; so its answers reflect what something in you inclines towards, not certain fact',
            'A magnetic force from crystals',
            'A rule that pendulums only work at the full moon',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Small unconscious movements move a pendulum. Some see this as the deeper mind speaking, others believe more is involved, but either way it is not a medical test or lie detector.',
        },
        {
          id: 'q11',
          type: 'multi',
          prompt: 'While scrying you start to feel disoriented and frightened. What should you do? Choose all that apply.',
          options: [
            'Stop at once and put the lights on',
            'Ground yourself firmly',
            'Keep going until you see something clearly',
            'Talk to your mentor about it',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation:
            'Stop, put the lights on, ground, and talk to your mentor. Keep sessions short. If you have a history of dissociation, psychosis or seizures, check with your mentor and doctor first.',
        },
        {
          id: 'q12',
          type: 'single',
          prompt: 'A friend asks you to read on whether their partner is cheating. What is the most ethical response?',
          options: [
            'Read on it, since they asked',
            'Refuse and end the conversation',
            'Explain you don’t read on other people’s private lives, and offer to read on what would help them with their worries about trust',
            'Tell them what you think the partner is doing',
          ],
          correct: [2],
          points: 1,
          explanation:
            'Reading on someone who hasn’t consented invades their privacy and rarely helps. Turning the question back to the person asking respects everyone and gives something they can act on.',
        },
        {
          id: 'q13',
          type: 'short',
          prompt:
            'A reader tells someone they have a curse that only a costly working can lift. Explain why this is a red flag and what the person should do.',
          points: 3,
          explanation:
            'Claiming a curse that only paid work can remove is a classic exploitation pattern. No genuine reader or coven demands money, sex or secrets. The person should stop, not pay, and talk to someone they trust, such as their mentor or High Priestess.',
          rubric:
            'Full marks (3): names it as a common scam or exploitation pattern using fear (1); says genuine readers and covens don’t pressure for money, sex or secrets (1); says what to do: stop, don’t pay, and talk to a trusted person such as the mentor or High Priestess (1).',
        },
        {
          id: 'q14',
          type: 'long',
          prompt:
            'Describe one three-card reading you did during this stage: the question, the spread, the three cards, what you saw in each picture, and your summary. Then say what you would do differently next time.',
          points: 5,
          explanation:
            'A good reading starts from an open question, uses a clear spread, looks at the pictures before the meanings, reads the cards together, and sums up in something useful. Reflecting on it is how you improve.',
          rubric:
            'Full marks (5): an open question about themselves (1); a named spread with the three cards in their positions (1); describes what they saw in the pictures, not only keywords (1); a summary that reads the cards together and ends on something actionable (1); a thoughtful note on what to do differently (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Divination',
      intro:
        'In this stage you learn what divination is and isn’t, get to know the tarot deck, read for yourself every day, try another system, and learn how to read for others with care. It takes about a month, because daily practice is how readers are made.',
      min_days: 28,
      passed_by: 'mentor',
      tasks: [
        {
          title: 'What divination is',
          kind: 'study',
          instructions:
            '1. Read “What divination is”.\n2. Write three questions about your own life, each turned into a good open question.\n3. In the answer box, write each question as you first thought of it, then as you rewrote it.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 25,
          docs: ['core-divination-what-it-is'],
        },
        {
          title: 'Meet the deck',
          kind: 'practice',
          instructions:
            '1. Read “The tarot deck”.\n2. Using your own deck or the app’s cards, sort the deck into the Major Arcana and the four suits.\n3. Then study one card a day: two minutes looking at the picture, then write what you see, read its meaning, and write what it means for you.\n4. Log each card studied. Start with the 22 Major Arcana.',
          times: 22,
          response: 'none',
          checked_by: 'self',
          minutes: 10,
          docs: ['core-divination-tarot-deck'],
        },
        {
          title: 'Daily draw',
          kind: 'practice',
          instructions:
            '1. Read “The daily draw and your reading journal”.\n2. Each day, draw one card, look, read its meaning, and write two or three lines. In the evening, add a line on how it showed up.\n3. Log each day. Aim for 21 days.\n4. On the last day, review all your draws as the lesson describes, and write your monthly summary in the answer box.',
          times: 21,
          response: 'text',
          checked_by: 'self',
          minutes: 5,
          docs: ['core-divination-daily-draw'],
        },
        {
          title: 'Three-card readings',
          kind: 'practice',
          instructions:
            '1. Read “Reading the cards: a three-card spread”.\n2. Do three three-card readings for yourself on real questions, a few days apart, following every step.\n3. Record each in your reading journal. Log each one.\n4. In the answer box, write one of them out in full: question, spread, cards, what you saw, and your summary.',
          times: 3,
          response: 'text',
          checked_by: 'mentor',
          minutes: 25,
          docs: ['core-divination-tarot-reading'],
        },
        {
          title: 'Try another system',
          kind: 'practice',
          instructions:
            '1. Read “Runes, ogham, pendulum and scrying”, including the safety notes.\n2. Choose one system and try it three times this fortnight.\n3. Log each session. In the answer box, write what you did, what came, and how it compared with tarot for you.',
          times: 3,
          response: 'text',
          checked_by: 'mentor',
          minutes: 20,
          docs: ['core-divination-other-systems'],
        },
        {
          title: 'Read for someone else',
          kind: 'practice',
          instructions:
            '1. Read “Reading for others, ethically”.\n2. Send your mentor a message on this step to agree who you will read for (a friend or fellow trainee who would like it).\n3. With their consent and an open question, give a three-card reading, following the steps in the lesson.\n4. Afterwards, ask them how it felt.\n5. In the answer box, write how you agreed the question, what you read (without anything they asked you to keep private), how you gave any hard cards, and what you learned.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['core-divination-ethics'],
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions:
            '1. Re-read any lesson you are unsure of.\n2. Take the Divination test. Choice questions are scored at once; your mentor scores the written answers.\n3. You need 80 per cent to pass. If you don’t pass, look at the questions you missed, revisit the lessons and take it again.',
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          quiz: 'quiz-core-divination',
        },
      ],
    },
  ],
} satisfies CourseModule;

export default divination;
