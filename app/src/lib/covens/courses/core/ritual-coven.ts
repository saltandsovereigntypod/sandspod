// Core module: ritual craft and coven life, and the course capstone. The
// anatomy of a ritual, roles, coven etiquette, gathering online in the app,
// writing a ritual, leading one, and aftercare; then writing and leading a
// ritual and reflecting on the course. Tradition-neutral.

import type { CourseModule } from '../types.ts';

const ritualCoven = {
  id: 'core-ritual-coven',
  title: 'Ritual craft and coven life',
  docs: [
    {
      id: 'core-ritual-coven-anatomy',
      title: 'The anatomy of a ritual',
      summary:
        'What a ritual is, the parts almost every ritual shares and why they are there, and how a ritual differs from a spell.',
      minutes: 25,
      body: `## What a ritual is

A **ritual** (or *rite*) is a planned sequence of meaningful actions, words and silences, done with attention, to mark something, honour something, or bring about a change. A birthday party with candles and a song is a ritual. So is a wedding, a funeral, a graduation, or lighting a candle every evening for someone who has died.

In a coven, rituals mark the Moon and the seasons, honour gods, spirits and ancestors, celebrate life events, initiate new members, heal, bless, and work magic together. You have already taken part in your coven’s own ritual form, taught in your tradition’s ritual lessons. This lesson looks underneath it, at the shape that most rituals across many traditions share, so that you can understand any ritual and, by the end of this module, write and lead one yourself.

## Ritual and spell

A **spell** is a working for a particular purpose; you learned its structure in Spellcraft. A **ritual** is the larger frame. Some rituals contain a spell (a full-moon rite with a healing working); many contain none at all (a seasonal celebration, an offering to a god). A ritual is often more about relationship, celebration and meaning than about getting a result.

## The parts of a ritual

Not every ritual has every part, and traditions name and order them differently. But you will recognise most of these in almost any rite.

1. **Purpose.** Every ritual starts, long before the day, with a clear purpose: what is this rite for? A full moon, a festival, a blessing, a farewell? Like a spell’s intention, everything else serves it.
2. **Preparation.** Planning, gathering what is needed, setting up the space, and preparing yourself: bathing, dressing, fasting lightly or not at all, quieting the mind.
3. **Purification.** Cleansing the people and the space, so that everyday concerns are set aside. Washing the hands, sprinkling water, passing through smoke, sweeping, ringing a bell. Almost every tradition has a form of this.
4. **Opening.** Marking the start and making the space sacred: casting a circle, opening a grove, a procession, lighting a hearth fire, a call to the gods, a prayer. You learned the general idea in Sacred space and your tradition’s form in its own lessons.
5. **Statement of purpose.** Someone says aloud why everyone is here. This simple step focuses the whole group.
6. **Welcoming the powers.** Calling, inviting or greeting the gods, spirits, ancestors, elements or quarters honoured in the rite. Often with offerings.
7. **The heart of the rite.** The main action: a seasonal drama, a story told, offerings made, a meditation, a working of magic, a blessing, a divination, an initiation.
8. **Sharing.** Food and drink are shared, often blessed first and with a portion offered to the powers. In Wicca this is called **cakes and ale** (or cakes and wine); in Heathenry the drinking rounds of **sumbel**; in Hellenic and Roman practice the shared feast after sacrifice. It grounds people and binds the group.
9. **Thanks and farewells.** Thanking and bidding farewell to the powers welcomed earlier, in reverse order.
10. **Closing.** Undoing the opening: opening the circle, closing the grove, extinguishing the fire. A clear end so everyone knows the rite is over.
11. **Grounding and aftercare.** Eating, drinking, talking, laughing, grounding any lingering energy. More on this in the last lesson.
12. **Clearing up and recording.** Tidying the space, disposing of offerings properly, and writing down what happened.

## Why this shape works

This shape has lasted because it suits people.

- **A clear beginning and end** lets people move fully into ritual time and fully out again. Leaving a ritual “open” often leaves people feeling unsettled.
- **Purification and opening** help everyone set aside the day’s concerns and arrive.
- **Saying the purpose** aloud brings a group into one focus.
- **Welcoming and thanking** the powers expresses relationship and respect, in the same way you would greet and thank a guest.
- **Sharing food** brings people back into their bodies and to each other.
- **Grounding** prevents the spaced-out, overwrought feeling some people have after intense ritual.

## A small example

Even the simplest solitary rite has this shape. Here is a ten-minute evening offering, mapped onto the parts:

- **Purpose:** to give thanks at the end of the day.
- **Preparation:** clear the altar; pour a little water or juice into a cup.
- **Purification:** wash your hands and face.
- **Opening:** light a candle and say, “I come to my altar.”
- **Statement of purpose:** “I am here to give thanks for this day.”
- **Welcoming:** greet the gods, spirits or ancestors you honour, by name or simply as “you who watch over this house”.
- **The heart:** name three things from the day you are grateful for, and pour a little of the drink into an offering bowl.
- **Sharing:** drink the rest of the cup yourself.
- **Thanks and closing:** “Thank you. Goodnight.” Put out the candle.
- **Grounding:** a breath, your hands on the floor.
- **Clearing up:** in the morning, pour the offering onto soil.

Once you see the shape, you will find it in every rite your coven does, however elaborate.

## Rhythm and pace

Good rituals have a rhythm: a gentle start, a building of focus, a peak at the heart of the rite, and a gentle return. Think of a piece of music. Too fast, and people can’t settle; too slow, and their attention drifts. Most coven rituals run between thirty minutes and an hour and a half, including sharing. A simple solitary rite might be fifteen minutes.

> **Your coven:** Your coven has its own ritual form, with its own names for each part and its own order. It may leave some parts out or add others. Ask your mentor to walk you through a typical rite and map it onto the parts above.

> **Try this:** Think back to the last coven ritual you attended (or one you saw described in your tradition’s lessons). Write down each part in order and match it to the list above. Which parts were there? Which were missing or different? Why do you think so?`,
    },
    {
      id: 'core-ritual-coven-etiquette',
      title: 'Roles and coven etiquette',
      summary:
        'The roles people take in coven ritual, and the etiquette that makes a coven work: punctuality, confidentiality, consent, sharing the work, and looking after one another.',
      minutes: 25,
      body: `## Many hands

In a coven, ritual is shared work. Different people take different roles, and over time most members try many of them. Knowing the roles helps you understand what is happening and prepares you to take part.

## Common roles

Names differ between traditions; your coven will have its own.

- **High Priestess and/or High Priest** (or another title, such as gothi or gydja in Heathenry, or simply leader or elder): the coven’s leader or leaders, who often lead major rites, hold the coven’s lore, and carry final responsibility for its wellbeing.
- **Officiant** or **ritual leader:** whoever leads a particular ritual. Not always the High Priestess; many covens rotate this.
- **Quarter callers** or **element callers:** in traditions that use them, the people who call and later dismiss the quarters or elements.
- **Those who make offerings or pour libations:** in many traditions a particular person makes the main offerings.
- **The person who purifies:** carrying water, smoke or salt round the space and the people.
- **Maiden, summoner or steward:** names for a coven officer who helps the leaders, organises, keeps the calendar, or watches over people’s wellbeing during rites.
- **Scribe:** keeps the coven’s records.
- **Participants:** everyone. Taking part fully (singing, responding, focusing, raising energy) is a role in itself, and the most important one.

## Etiquette: how to be a good coven member

Etiquette here isn’t fussy manners. It is the set of habits that lets a group of people do intense, vulnerable work together safely and well.

### Arriving

- **Be on time,** or a little early. Rituals often can’t start until everyone is there, and arriving late can break a circle that has already been cast. If you’re running late, message the coven so they can decide whether to wait.
- **If you can’t come, say so** as early as you can.
- **Come prepared:** read anything you were sent, bring what you agreed to bring, and know your part if you have one.
- **Come sober.** Don’t arrive under the influence of alcohol or drugs. If the rite includes a drink, you may always choose juice or water.

### Confidentiality

- **What happens in the coven stays in the coven.** Never tell anyone outside who the members are, what they said, or personal things they shared, without their permission. Many people have good reasons to keep their practice private: family, work, safety.
- **Never “out” a member** as a witch or pagan, online or off.
- **Some teachings may be oathbound,** meaning you promise not to share them. Keep those promises. But no legitimate coven will ask you to keep secrets about harm, abuse or crime. Safety always comes before secrecy.
- **Don’t photograph or record** rituals or members without everyone’s agreement.

### Consent and care

- **Ask before you touch.** Hand-holding in a circle is common; check that people are comfortable, and say if you are not. Hugs are offered, not assumed.
- **No one may pressure you** into anything you’re uncomfortable with: touch, nudity (some traditions practise “skyclad”, meaning naked, in some rites; it is never required of a trainee who doesn’t want it), drinking, sharing personal things, or any working. You can always step back or leave.
- **Share allergies, health needs and access needs** with the leaders, so the rite can be planned around them. Accept others’ needs without fuss.
- **Look after each other.** If someone seems unwell or distressed during a rite, quietly tell the leader or the person responsible for wellbeing.

### Sharing the work

- **Help set up and clear up.** Offer before being asked.
- **Bring your share** of food and supplies if that is your coven’s custom.
- **Take your turn** at roles as you are ready. Everyone was a beginner once.
- **Contribute honestly** in discussions, and listen.

### In the circle

- **Phones off,** or on silent and put away, unless the rite is online.
- **Follow the leader’s cues.** If you’re unsure what to do, watch, or quietly ask the person beside you.
- **Leaving during a rite:** if you need to leave (unwell, overwhelmed, a call of nature), it is fine. Your coven will have a way to do this; often you signal the leader, or a door is “cut” in the circle. You learned the general idea in Sacred space.
- **Laughter is fine.** Mistakes happen in every ritual: candles go out, words are forgotten, the cat walks through. Smile, carry on.

## Red flags in any group

Every coven has its quirks, but some things are never acceptable. Leave, and seek help from someone you trust, if a leader or member:

- demands money beyond reasonable shared costs, or sex, or secrets about harm;
- pressures anyone into sexual activity, or uses initiation or teaching as leverage for it;
- isolates members from family and friends;
- forbids members from talking about concerns, or punishes questions;
- claims to be beyond criticism or the only true path.

You learned more about these in the Welcome module. Your safety and dignity always come first.

> **Your coven:** Every coven has its own customs about arrival times, what to bring, dress, how to leave a circle, and who does what. Ask your mentor for your coven’s, and note them in your Grimoire.

> **Try this:** Write down your coven’s customs as you understand them so far: when to arrive, what to bring, what to wear, how to leave during a rite, and who to tell if someone is unwell. Check the list with your mentor.`,
    },
    {
      id: 'core-ritual-coven-online',
      title: 'Gathering online',
      summary:
        'How to take part in coven rituals and meetings held through the app: preparing your space, safety at home, timing, presence on camera, and privacy.',
      minutes: 15,
      body: `## Covens without walls

Many covens now meet online for some or all of their rites: members live far apart, travel is hard, health or caring duties keep people home, or the coven is spread across countries. Online ritual is different from gathering in one room, but it can be very powerful. Many people find that knowing others are lighting their candles at the same moment, in their own homes, creates a strong sense of connection.

Your coven uses the app for its meetings, conversations and shared work, and may hold rites through it or alongside it.

## Before the gathering

1. **Read what you were sent.** The leader may share a ritual script or a list of what to have ready. Read it the day before.
2. **Check the time zone.** If your coven spans time zones, check the start time in yours.
3. **Prepare your space.** Clear a small area, set up a simple altar, and gather what you need: often a candle, a cup of water or juice, a small piece of food, and anything the script asks for.
4. **Test your device.** Charge it, check your connection, and know how to mute and unmute. Prop it up so your hands are free.
5. **Tell your household,** if you live with others, that you need quiet and privacy for the time. Close the door.
6. **Purify yourself** in a simple way: wash your hands and face, ground and centre.

## During the gathering

- **Join a few minutes early,** to settle in and sort out technical problems.
- **Mute yourself** when you are not speaking, unless the leader asks everyone to speak or sing together. (Online, voices often lag, so group chanting may work better muted, each person chanting at home.)
- **Follow the leader’s cues** for when to light candles, speak, or act. The leader will usually say each step aloud.
- **Be present.** Close other apps and notifications. Treat it as you would a gathering in person.
- **Use the chat thoughtfully:** for short responses or practical messages, not side conversations during the rite.
- **If your connection drops,** carry on the rite at home if you know what comes next, or rejoin quietly. Don’t worry; it happens to everyone.

## Safety at home

> **Safety:** You are responsible for fire safety in your own home. Keep candles in safe holders on heat-proof surfaces, away from screens, cables, curtains and pets. Don’t let the screen distract you from the flame. Put candles out properly when the rite ends, before you leave the room. If you can’t safely have a flame (rented rooms, children, pets, smoke alarms), use an LED candle; it is just as good for ritual.

Ground well afterwards, as you would after any rite. It is easy to close the laptop and go straight back to the washing up, and some people find they feel spaced out or flat later. Eat, drink, and take a few minutes before going on with your evening.

## Making online ritual feel real

Some people find online rites flat at first. These help:

1. **Mark the threshold.** Before joining, wash your hands, change into something you keep for ritual, or ring a bell. Your body learns that this is not an ordinary call.
2. **Keep your own altar in view.** Look at your candle, not only the screen, during the quiet parts.
3. **Close your eyes** during meditations and energy work; listen to the leader’s voice.
4. **Use your body.** Stand for the opening if you can, raise your hands when others do, touch the floor to ground.
5. **Share the food at home.** Have your bread and drink ready, and eat and drink at the same moment as everyone else.
6. **Stay for the chat afterwards.** The talk after a rite matters as much online as in person.

## Including everyone

Online gatherings can include people who could never travel to a circle: those with disabilities or chronic illness, carers, parents of small children, people in remote places. Help make that work.

- Be patient with technology and with people who are new to it.
- Turn on captions if anyone needs them, and speak clearly.
- Don’t comment on people’s homes, backgrounds, clothing or interruptions from children and pets.
- If someone must keep their camera off, respect that without question.

## Common difficulties

- **Lag and echo:** mute when not speaking; leaders can pause after each cue to let everyone catch up.
- **Distractions at home:** put a sign on the door, and arrange the time with your household in advance.
- **Feeling disconnected:** speak a response aloud now and then, even when muted, and keep your own candle as your focus.

## Privacy

- **Don’t record or screenshot** the rite or members without everyone’s permission.
- **Check what is behind you** on camera if you want to keep your home private, and be aware of who can hear.
- **Don’t share** links, scripts or members’ details outside the coven.
- Remember that **messages in the app** are part of the coven’s private space; treat them with the same confidentiality as anything said in the circle.

> **Your coven:** Your coven will have its own way of running online rites: whether cameras are on, how people speak in turn, and what to have ready. Ask your mentor, and ask to see a script from a previous online rite.

> **Try this:** Before your coven’s next online gathering, set up your space and test your device as described above. Afterwards, write down what worked and what you would change next time.`,
    },
    {
      id: 'core-ritual-coven-writing',
      title: 'Writing a ritual',
      summary:
        'How to write a ritual step by step, from purpose to script, including accessibility and timing, with a complete sample full-moon rite you can adapt.',
      minutes: 30,
      body: `## Why write rituals?

Every tradition has rites handed down, and you will learn your coven’s. But almost every coven also writes new rites, for a festival, a life event, a coven anniversary, a member’s need. Writing a ritual is one of the best ways to understand ritual, and by the end of this module you will write and lead one.

## Writing a ritual, step by step

1. **State the purpose** in one sentence. “To give thanks for the harvest and share the year’s gifts.” “To mark Jo’s new job and bless her new start.” Every choice that follows should serve it.
2. **Know your setting.** Who will be there and how many? Indoors or out, in person or online? How long can it be? Check with your mentor what your coven expects.
3. **Choose your form.** Use your tradition’s ritual form as the frame: its way of purifying, opening, welcoming the powers, and closing. You learned it in your tradition’s ritual lessons. Don’t invent new openings for a coven rite unless your coven allows it.
4. **Plan the heart.** This is where most of your creativity goes. What single main action expresses the purpose? Telling a story, sharing gifts, a guided meditation, a blessing, a spell, a song, a procession, a divination, offerings.
5. **Choose the powers.** Which gods, spirits, ancestors or elements are honoured, and why? Make sure they fit the purpose and your tradition.
6. **Plan the sharing.** What food and drink? Offer non-alcoholic and allergy-friendly options.
7. **Assign roles,** if more than one person is involved. Give everyone something to do, if they want it.
8. **Write the script.** Write out every part, with what is said and what is done. Mark who says or does each part. Keep spoken parts short; people listen better to short speeches.
9. **Time it.** Read it aloud and time it. Add time for silences and actions. Cut what isn’t needed.
10. **Check accessibility.** Can everyone take part? Think of people who can’t stand for long, kneel, see in dim light, hear well, read small print, or are sensitive to smoke or scent. Offer alternatives: chairs, larger print, smoke-free cleansing.
11. **Check safety.** Fire, candles, herbs, food allergies, alcohol, weather if outdoors, and emotional safety (rites about grief or trauma need gentle handling and good aftercare).
12. **Get feedback.** Show the script to your mentor before the day.
13. **Prepare the materials list** and send participants what they need to know.

## Writing words for ritual

- **Use plain, strong language.** Ritual words don’t have to be archaic. “We gather tonight under the full moon” is better than awkward “thee” and “thou” you don’t feel.
- **Short lines** are easier to say and to follow.
- **Repetition and call-and-response** let everyone join in: the leader says “Hail and welcome!” and everyone repeats it.
- **Silence is powerful.** Build in pauses.
- **Use your tradition’s traditional words** where they exist (opening phrases, prayers, closings).

## A sample: a simple full-moon rite

This is a short, tradition-neutral rite for three to eight people, about forty minutes, which can be held in person or online. Adapt the opening, welcoming and closing to your tradition’s form.

**Purpose:** to honour the full Moon, give thanks, and send blessing to each person’s intention for the month.

**You will need:** a central candle (or one each, online) in a safe holder; a bowl of water; a small bowl of salt; a plate of biscuits or bread; a jug of juice and cups; a bowl for offerings.

1. **Gathering** (5 minutes). People arrive, settle, and are reminded of the purpose. Phones away.
2. **Purification** (3 minutes). The leader adds three pinches of salt to the water and says: “Salt and water, clear and clean, wash away what lies between.” Each person dips their fingers and touches their forehead (or, online, each does this at home).
3. **Opening** (5 minutes). Open sacred space in your coven’s way.
4. **Statement of purpose.** The leader says: “We meet under the full Moon to give thanks for what this month has brought, and to bless what we hope for.”
5. **Welcoming** (3 minutes). The leader lights the central candle (each person lights their own online) and says: “Moon, bright at the full, lady of tides and of light, we welcome you.” (Adapt to your tradition: a lunar god or goddess, or simply the Moon.) All: “Welcome.”
6. **The heart: thanks** (8 minutes). Going round, each person says one thing they are thankful for this month. After each, all say: “We give thanks.”
7. **The heart: blessing** (8 minutes). Each person in turn says one intention for the coming month, in one sentence. The group raises energy together, with a hum that builds for a slow count of twenty, with hands held out towards that person (or towards the screen), then releases it with a breath out and the words: “So may it be.”
8. **Sharing** (5 minutes). The leader holds up the bread and juice: “The gifts of the earth, shared in thanks.” A portion is put in the offering bowl. Everyone eats and drinks.
9. **Thanks and farewell** (2 minutes). “Moon, bright at the full, thank you for your light. Go if you must, stay if you will. Hail and farewell.” All: “Hail and farewell.”
10. **Closing** (3 minutes). Close sacred space in your coven’s way. The leader says: “The rite is ended.” Candles are put out.
11. **Grounding and aftercare** (as long as needed). Everyone touches the floor, then talks, eats the rest of the food and drinks some water.
12. **Afterwards.** The offerings are put outside on soil or in the garden waste the next day; the salt water is poured down the sink. The leader notes the rite in the coven’s records.

> **Your coven:** Your coven may have rules on who may write and lead rites, and on what may change in its traditional forms. Ask your mentor before writing for the coven.

> **Try this:** Choose a purpose for a short ritual you could lead: a full moon, a coming festival, a blessing. Work through steps 1 to 4 and write them in your Grimoire. You will build it into your capstone ritual.`,
    },
    {
      id: 'core-ritual-coven-leading',
      title: 'Leading a ritual',
      summary:
        'How to lead a ritual well: preparing yourself and others, using your voice and pace, handling the things that go wrong, and caring for everyone present.',
      minutes: 25,
      body: `## The leader’s job

Leading a ritual isn’t a performance. It is **holding the space** so that everyone else can go deep. The leader keeps the rite moving, keeps people safe, and helps everyone feel included. You don’t need to be charismatic or word-perfect; you need to be prepared, calm and attentive.

## Before the day

1. **Know the script well.** Read it aloud several times. You don’t have to memorise it (most leaders hold a card or read from notes), but you should know what comes next without hunting for it.
2. **Rehearse the actions.** Walk through any movement, lighting, pouring or handing round. Find where things will go.
3. **Brief everyone with a role.** Make sure each person knows their part, has their words, and knows their cues.
4. **Check the materials.** Use a checklist. Have spares: matches, a lighter, an extra candle, tissues, water.
5. **Check safety.** Fire safety, a clear floor, ventilation, allergies, seating, a first aid kit nearby, and a plan for anyone who becomes unwell or distressed.
6. **Prepare yourself.** On the day, give yourself time to bathe or wash, dress, eat lightly, and ground and centre before people arrive.

## During the rite

### Voice

- **Speak more slowly and more loudly than feels natural.** In ritual, almost everyone speaks too fast.
- **Breathe** before each section.
- **Pause** after important words and let them land.
- **Use cues** so people know what to do: “Now we will each light our candle,” “Please repeat after me.”

### Pace

- **Watch the people, not just the script.** Are they settling, or restless? Engaged, or drifting? Adjust.
- **Leave room for silence,** but not so much that people grow uncomfortable.
- **Keep sections in proportion.** The heart of the rite deserves the most time.

### Presence

- **Ground and centre yourself** at the start, and again whenever you feel flustered.
- **Be warm.** A smile does a great deal.
- **Include everyone.** Make eye contact round the circle, or round the screens.

## When things go wrong

Every ritual has hiccups. Most are invisible to participants if the leader stays calm.

- **You forget your words.** Pause, breathe, look at your notes, or simply say what you mean in plain words. No one minds.
- **A candle won’t light, or goes out.** Relight it, or carry on without it. If it keeps going out in a draught, move it or accept it.
- **Something falls over or catches fire.** Stop the rite. Deal with it calmly and fully: put the fire out, clear up, make sure everyone is safe. Then decide whether to carry on. Safety always comes before finishing a rite.
- **Someone laughs.** Smile and carry on. Laughter is not disrespect.
- **Someone becomes distressed.** Gently check on them, or ask a helper to. Offer to let them step out with someone, sit down, drink water, and ground. Never force anyone to carry on. Afterwards, check in with them privately.
- **Someone feels faint or unwell.** Stop, help them sit or lie down, give water, open a window. If it’s serious, call emergency services.
- **The online connection fails.** Have a plan: who takes over, or everyone carries on alone and rejoins.
- **Someone behaves inappropriately.** Calmly and firmly stop it. If needed, pause the rite and speak to them privately; involve the High Priestess.

## Starting small

Nobody leads a festival rite for the first time without practice. A good path:

1. **Lead a part** of a coven rite: a quarter call, an offering, a reading.
2. **Lead a short solitary rite** at home, aloud, as if others were there.
3. **Lead a short rite for one or two people,** perhaps with your mentor.
4. **Co-lead** a coven rite with an experienced leader, taking half the parts.
5. **Lead a whole rite,** with an experienced member ready to help.

Each step builds confidence. Nerves are normal and often a sign that you care; ground before you begin and they will settle once you start speaking.

## Leading together

Many rites have more than one leader. If you co-lead, agree beforehand who says what, who watches the time, who keeps an eye on participants’ wellbeing, and who handles any problem. Give each other small signals, such as a nod when a section is done. Never contradict a co-leader during the rite; talk afterwards.

## Endings

Close every rite properly, even if it went wrong or ran short. Do the thanks and the closing, so everyone knows the rite is over, then lead the grounding.

## After the rite

1. **Make sure everyone grounds:** food, drink, conversation.
2. **Check in with anyone who seemed affected.**
3. **Clear up together,** and put out every flame.
4. **Debrief.** With your mentor or the coven, talk about what went well and what to change. Invite honest feedback and receive it gracefully.
5. **Write it down:** the script, what actually happened, how it felt, and the feedback.

> **Your coven:** Your coven may ask trainees to lead small parts of rites (a quarter call, an offering) before leading a whole one. Ask your mentor how you will build up to leading.

> **Try this:** Choose a section of a ritual you know (an opening, a blessing, a farewell). Practise reading it aloud, slowly, in your ritual space, five times. Record yourself on your phone if you like, and listen back for pace and volume.`,
    },
    {
      id: 'core-ritual-coven-aftercare',
      title: 'Aftercare, and bringing it all together',
      summary:
        'How to look after yourself and others after ritual, signs that someone needs more care, and how the capstone of this course works.',
      minutes: 20,
      body: `## After the rite

Ritual can be intense. People often feel strong emotions, deep peace, joy, grief, or a buzzing energy during a rite. Afterwards some people feel wonderful; others feel tired, spacey, tearful, flat, or restless. A few days of low mood after a big ritual or festival is common enough to have a name in many communities: a **ritual drop**. Good aftercare makes all of this easier.

## Common after-effects

- **Spaciness:** feeling light-headed, dreamy, not quite here.
- **Buzzing:** restlessness, difficulty sleeping, racing thoughts.
- **Tiredness:** feeling drained, especially after raising energy.
- **Emotion:** tears, sadness, unexpected memories, or great happiness.
- **Hunger and thirst.**
- **The drop:** a day or two later, a low or flat mood.

None of these means anything has gone wrong. They are normal responses to intense experience. But they need looking after.

## Aftercare, step by step

Right after the rite:

1. **Ground.** Use the methods you learned in Grounding: hands on the floor, feet on the ground, breath, imagining excess energy sinking into the earth.
2. **Eat and drink.** Something with substance: bread, biscuits, fruit, and water. This is why sharing food is part of ritual.
3. **Move.** Stretch, stamp your feet, shake out your hands.
4. **Talk.** Light conversation and laughter bring people back.
5. **Wait before driving** if you feel spacey. Sit a while, eat, and ground until you are fully clear.

Over the next day or two:

1. **Rest.** Sleep well, if you can.
2. **Be gentle with yourself.** Don’t plan anything demanding the morning after a big rite, if you can help it.
3. **Write it down.** Journal about the rite: what you felt, saw, learned.
4. **Reach out.** Message a coven friend or your mentor, especially if you feel low.

## Caring for each other

Look after the people beside you in the circle. Notice who is quiet, who is shaky, who leaves quickly. A simple “How are you doing?” matters. Leaders and helpers should make sure everyone is grounded before they go home.

## Aftercare for leaders

Leaders often give so much attention to others that they forget themselves. After leading, you may feel exhausted, elated, or unable to switch off. Ask someone else to lead the grounding or clear up, so you can eat and sit down. Debrief with someone you trust, and allow a quiet day afterwards if you can. It is normal to replay every mistake; write down two things that went well for every one you would change.

## Integrating the experience

Ritual can bring insights, strong feelings, memories, or a sense of contact with something greater. Integration means letting those experiences settle into everyday life, rather than leaving them in the circle.

1. **Write it down** within a day, while it is fresh.
2. **Ask what it means for your life:** a decision to make, a habit to change, a relationship to tend.
3. **Take one small action** that honours it.
4. **Talk it through** with your mentor if it was significant or puzzling.
5. **Don’t force meaning.** Some rites are simply good evenings with friends, and that is enough.

## When to seek more help

> **Safety:** Ritual is not therapy, and magic is never a substitute for medical or psychological care. If after a ritual you or someone else feel very distressed for more than a few days, have intrusive memories or panic, feel disconnected from reality, or have any thoughts of harming yourself, stop ritual practice for a while, tell your mentor or High Priestess, and contact a doctor, therapist or crisis line. If anyone is in immediate danger, call emergency services. Seeking help is wise and strong, and any good coven will support you.

It is always all right to step back from intense practices for a while. The craft will still be there when you are ready.

## Bringing it all together: the capstone

You have now worked through the whole course: the welcome, energy, grounding, raising energy, sacred space and your tradition’s ritual, the altar and tools, your tradition and its devotions, correspondences, the Moon and timing, divination, spellcraft, the holy days, and now ritual craft and coven life.

The capstone brings it together in three parts:

1. **Write a ritual.** Using everything you have learned, write a complete ritual, about thirty to forty-five minutes long, for a real occasion: a full moon, a festival, a blessing, a coven gathering. Use your tradition’s form for opening and closing. Include purification, a clear purpose, welcoming, a heart, sharing, thanks, closing, and aftercare. Plan safety and accessibility. Share it with your mentor for feedback and revise it.
2. **Lead it.** Lead the ritual, for your coven, a small group of members, or, if your coven agrees, with your mentor present online. You lead; they take part.
3. **Reflect.** Afterwards, write a reflection: how the rite went, what you learned, and how you have changed since you began this course.

There is no perfect capstone. Your mentor is not looking for polish; they are looking for care, understanding, safety, and sincerity.

> **Your coven:** Your High Priestess and mentor will decide when you are ready for the capstone, who will attend, and what form it takes. Some covens hold the capstone at a full moon or festival; others in a quiet session with just the mentor. Ask them.

> **Try this:** Before you start writing your capstone ritual, re-read your journal from the beginning of the course. Note three ways your understanding or practice has changed. You will use them in your reflection.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-core-ritual-coven',
      title: 'Ritual craft and coven life: test',
      intro:
        'Thirteen questions on the anatomy of ritual, roles and etiquette, gathering online, writing and leading a ritual, and aftercare. Choice questions are scored at once; your mentor scores the written answers. You need 80 per cent to pass, and you can retake it.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'Why do most rituals have a clear opening and a clear closing?',
          options: [
            'Because it is required by law',
            'So people can move fully into ritual time and fully out again; leaving a rite “open” often leaves people unsettled',
            'To make the ritual longer',
            'There is no reason; it is only habit',
          ],
          correct: [1],
          points: 1,
          explanation:
            'A clear beginning lets people set the day aside and arrive; a clear end lets them return. Without a closing, people often feel unsettled or spacey.',
        },
        {
          id: 'q2',
          type: 'multi',
          prompt: 'Which of these are common parts of a ritual? Choose all that apply.',
          options: ['Purification', 'Statement of purpose', 'Sharing food and drink', 'Arguing about the script'],
          correct: [0, 1, 2],
          points: 1,
          explanation:
            'Most rituals include purpose, preparation, purification, opening, a statement of purpose, welcoming the powers, the heart, sharing, thanks, closing, grounding and clearing up.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'How does a ritual differ from a spell?',
          options: [
            'They are exactly the same',
            'A ritual is the larger frame and may or may not contain a spell; it is often about relationship, celebration and meaning rather than a result',
            'A spell is always longer than a ritual',
            'Rituals are only for groups and spells only for individuals',
          ],
          correct: [1],
          points: 1,
          explanation:
            'A spell is a working for a purpose. A ritual is the larger frame; many rituals contain no spell at all, such as a seasonal celebration or an offering.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'You are running fifteen minutes late for an in-person rite. What should you do?',
          options: [
            'Arrive quietly and walk straight into the circle',
            'Message the coven as early as you can so they can decide whether to wait, and follow the leader’s guidance when you arrive',
            'Don’t go, and don’t tell anyone',
            'Ask them to start the rite again when you arrive',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Let people know as early as you can. Walking into a circle already cast can disrupt it; the leader will tell you how to join, if you can.',
        },
        {
          id: 'q5',
          type: 'truefalse',
          prompt: 'A good coven member may tell friends outside the coven who the other members are, as long as they mean well.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation:
            'Never share who the members are or what they shared without their permission. Many people have serious reasons to keep their practice private. The only exception is safety: no one should keep secrets about harm or abuse.',
        },
        {
          id: 'q6',
          type: 'multi',
          prompt: 'Which of these are red flags in any group? Choose all that apply.',
          options: [
            'A leader pressures members into sexual activity or uses initiation as leverage for it',
            'Members are discouraged from talking to family and friends',
            'Members share reasonable costs for candles and food',
            'Questions and concerns are punished',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation:
            'Sharing reasonable costs is normal. Sexual pressure, isolation, and punishing questions are serious red flags. Leave and seek help from someone you trust.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'During an online rite at home, what is the best approach to candles?',
          options: [
            'Light them near your laptop so the coven can see',
            'Keep them in safe holders on heat-proof surfaces away from screens, cables, curtains and pets, or use an LED candle if a flame isn’t safe',
            'Leave them burning after the call so the energy continues',
            'Candles aren’t needed online, so there’s nothing to think about',
          ],
          correct: [1],
          points: 1,
          explanation:
            'You are responsible for fire safety at home. Keep flames safe and attended, put them out when the rite ends, and use an LED candle when a flame isn’t safe.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'When writing a ritual, what should you decide first?',
          options: ['Which candles look best', 'The purpose, in one sentence', 'Who will sit where', 'What to wear'],
          correct: [1],
          points: 1,
          explanation:
            'Everything in a ritual serves its purpose. Write it in one sentence first; then choose form, heart, powers, sharing, roles and words to fit.',
        },
        {
          id: 'q9',
          type: 'single',
          prompt: 'While you are leading, a candle tips over and the altar cloth starts to burn. What do you do?',
          options: [
            'Carry on so as not to break the energy',
            'Stop the rite, put the fire out calmly and fully, make sure everyone is safe, and only then decide whether to continue',
            'Ask a quarter caller to deal with it while you keep speaking',
            'End the rite without closing it',
          ],
          correct: [1],
          points: 1,
          explanation:
            'Safety always comes before finishing a rite. Stop, deal with it fully, check everyone, then decide. Whatever you decide, close the rite properly.',
        },
        {
          id: 'q10',
          type: 'multi',
          prompt: 'Which are good aftercare after an intense ritual? Choose all that apply.',
          options: [
            'Eating and drinking something with substance',
            'Grounding and moving your body',
            'Driving home straight away while still feeling spacey',
            'Writing about it and reaching out if you feel low',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation:
            'Ground, eat, drink, move, talk, rest, write, and reach out. Wait until you are fully clear before driving.',
        },
        {
          id: 'q11',
          type: 'truefalse',
          prompt:
            'If someone feels very distressed for several days after a ritual, they should stop intense practice for a while, tell their mentor, and seek help from a doctor, therapist or crisis line.',
          options: ['True', 'False'],
          correct: [0],
          points: 1,
          explanation:
            'Ritual is not therapy, and magic never replaces medical or psychological care. Stepping back and getting help is wise, and any good coven will support it.',
        },
        {
          id: 'q12',
          type: 'short',
          prompt:
            'You are leading a rite and a participant begins to cry and seems overwhelmed. Describe what you would do, during and after the rite.',
          points: 3,
          explanation:
            'Check on them gently or ask a helper to, offer to let them step out with someone, sit, drink water and ground, never force them to continue, and check in privately afterwards.',
          rubric:
            'Full marks (3): checks on them gently, personally or through a helper, without drawing attention (1); offers options such as stepping out with someone, sitting, water, grounding, and makes clear they don’t have to continue (1); checks in privately afterwards and suggests more help, or involves the High Priestess, if needed (1).',
        },
        {
          id: 'q13',
          type: 'long',
          prompt:
            'Outline a short ritual of your own for a real occasion. Give its purpose, then list each part in order (purification, opening, statement of purpose, welcoming, the heart, sharing, thanks, closing, aftercare) with a line on what happens in each. Note your safety and accessibility plans.',
          points: 5,
          explanation:
            'A good ritual outline starts from one purpose, follows a complete shape that fits your tradition, puts most of its creativity into the heart, includes sharing and proper closing, and plans for safety, accessibility and aftercare.',
          rubric:
            'Full marks (5): a clear one-sentence purpose for a real occasion (1); all main parts in a sensible order, using their tradition’s form for opening and closing (1); a heart that clearly expresses the purpose (1); safety measures (fire, allergies, alcohol optional) and at least one accessibility consideration (1); aftercare and grounding planned (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Ritual craft, coven life and the capstone',
      intro:
        'In this final stage you learn how rituals are made and led, how to be a good member of a coven in person and online, and how to care for yourself and others afterwards. Then you bring the whole course together: you write a ritual, lead it, and reflect on how far you have come.',
      min_days: 30,
      passed_by: 'manager',
      tasks: [
        {
          title: 'The anatomy of a ritual',
          kind: 'study',
          instructions:
            '1. Read “The anatomy of a ritual”.\n2. Think of the last coven rite you attended, or the sample rite in your tradition’s lessons.\n3. In the answer box, list each part in order and match it to the parts in the lesson. Note any that were missing or different, and why you think so.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 35,
          docs: ['core-ritual-coven-anatomy'],
        },
        {
          title: 'Your coven’s customs',
          kind: 'reflection',
          instructions:
            '1. Read “Roles and coven etiquette” and “Gathering online”.\n2. Write down your coven’s customs as you understand them: arrival, what to bring and wear, how to leave during a rite, who to tell if someone is unwell, and how online rites work.\n3. In the answer box, write the list. Your mentor will correct or add to it on this step.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['core-ritual-coven-etiquette', 'core-ritual-coven-online'],
        },
        {
          title: 'Take part in coven rites',
          kind: 'attend',
          instructions:
            '1. Attend coven rites, in person or online, during this stage.\n2. Before each, prepare as the lessons describe. If online, set up and test your space beforehand.\n3. Help set up or clear up at least once.\n4. After each, do your aftercare and write a few lines in your journal. Log each rite attended.',
          times: 2,
          response: 'none',
          checked_by: 'mentor',
          minutes: 90,
          docs: ['core-ritual-coven-etiquette', 'core-ritual-coven-online', 'core-ritual-coven-aftercare'],
        },
        {
          title: 'Practise leading a part',
          kind: 'practice',
          instructions:
            '1. Read “Leading a ritual”.\n2. Choose one section of a rite you know (an opening, a welcome, a blessing, a farewell). Practise it aloud in your ritual space, slowly, five times; record yourself if you like.\n3. Ask your mentor if you may lead that part at a coven rite, and do so if they agree.\n4. Log each practice. In the answer box, write what you learned about your voice and pace.',
          times: 5,
          response: 'text',
          checked_by: 'self',
          minutes: 10,
          docs: ['core-ritual-coven-leading'],
        },
        {
          title: 'Capstone: write a ritual',
          kind: 'ritual',
          instructions:
            '1. Read “Writing a ritual” and “Aftercare, and bringing it all together”.\n2. Agree an occasion and setting with your mentor by sending a message on this step.\n3. Write a complete ritual of about 30 to 45 minutes, following the thirteen steps in the lesson and your tradition’s form for opening and closing. Include purification, purpose, welcoming, the heart, sharing, thanks, closing and aftercare, with roles, timings, safety and accessibility.\n4. Paste the full script in the answer box.\n5. Revise it in light of your mentor’s feedback, and paste the final version when it is agreed.',
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 180,
          docs: ['core-ritual-coven-writing', 'core-ritual-coven-aftercare'],
        },
        {
          title: 'Capstone: lead your ritual',
          kind: 'ritual',
          instructions:
            '1. Prepare as “Leading a ritual” describes: know the script, rehearse, brief anyone with a role, check materials and safety, and ground beforehand.\n2. Lead the ritual for your coven, a small group, or with your mentor present, as agreed.\n3. Close it properly and lead the aftercare.\n4. Debrief with your mentor and log it here.',
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 90,
          docs: ['core-ritual-coven-leading', 'core-ritual-coven-aftercare'],
        },
        {
          title: 'Capstone: reflection',
          kind: 'reflection',
          instructions:
            '1. Re-read your journal from the start of the course.\n2. In the answer box, write a reflection of a page or more: how your ritual went and what you would change; what you have learned across the course; three ways your understanding or practice has changed; and what you would like to learn next.\n3. Your mentor and High Priestess will read it, and may talk it through with you on this step.',
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 60,
          docs: ['core-ritual-coven-aftercare'],
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions:
            '1. Re-read any lesson you are unsure of.\n2. Take the Ritual craft and coven life test. Choice questions are scored at once; your mentor scores the written answers.\n3. You need 80 per cent to pass. If you don’t pass, look at the questions you missed, revisit the lessons and take it again.',
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          quiz: 'quiz-core-ritual-coven',
        },
      ],
    },
  ],
} satisfies CourseModule;

export default ritualCoven;
