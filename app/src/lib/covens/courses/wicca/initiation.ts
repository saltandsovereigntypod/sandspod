// The Wiccan path to initiation: what initiation means in Wicca (lineage,
// "only a witch can make a witch", the degrees in public terms, and what an
// initiation in this coven does and does not confer), the year and a day of
// study and service, the oath and its limits, and preparing for initiation
// with consent and aftercare. The rite itself stays with the coven; nothing
// here describes an initiation rite or teaches oathbound material. British
// spelling.

import type { CourseModule } from '../types';
import { closed, coven, holy, page, ritual } from '../linkHelpers.ts';

export default {
  id: 'wicca-initiation',
  title: 'The Wiccan path to initiation',
  docs: [
    {
      id: 'wicca-initiation-what-initiation-means',
      title: 'What initiation means in Wicca',
      summary: 'Initiation as Wicca understands it: a mystery, entry into the priesthood, and in initiatory lines entry into a lineage; the degrees in public terms; what an initiation in this coven does and does not confer; and why some people choose not to seek it.',
      minutes: 16,
      links: [closed('initiatory-wicca'), coven('standing'), coven('lineage'), page('grimoire')],
      body: `## A mystery religion

Wicca has always described itself as a **mystery religion**: one whose deepest truths are not taught in words but experienced, through rites that change the person who undergoes them. The ancient world had such religions, the Mysteries of Eleusis being the most famous, whose initiates kept their secret so well that we still do not know exactly what happened. Wicca took this idea as its model. Initiation is the door into its mysteries.

## What initiation is in Wicca

In Wicca, initiation has several meanings at once:

- **A transformation.** A rite that marks, and is meant to bring about, a real change in the person: a death to an old way of being and a birth into a new one.
- **Entry into the priesthood.** In Wicca every initiate is a priestess or priest, able to stand before the gods directly and, in time, to lead others.
- **Membership of the coven.** In many covens, initiation makes you a full member of the inner coven, with its responsibilities and its confidences.
- **Entry into a lineage,** in initiatory Wicca: you become part of the line of initiates going back to the founders, and receive the tradition's oathbound teachings and Book of Shadows.

## "Only a witch can make a witch"

In British Traditional Wicca (Gardnerian and Alexandrian), initiation must be given by a priestess or priest of that tradition who has the standing to initiate. The phrase often quoted is "only a witch can make a witch". This is why lineage matters so much in those traditions: it is the line of real people, each initiated by another, through which the tradition is passed on. A Gardnerian can tell you who initiated them, who initiated that person, and so on back to Gardner's covens.

Solitary and eclectic Wiccans often see things differently: that the gods themselves are the true initiators, and that a sincere self-dedication can bring a real spiritual change. Both views are held honestly. What matters is not to confuse them.

## What initiation in this coven confers

Be clear with yourself, and ask your High Priestess, what your coven's initiation is:

- **If your coven belongs to an initiatory lineage,** initiation will make you a member of that lineage, and you will receive its teachings in its own way. This course does not give those teachings; it prepares you with the public foundations.
- **If your coven is an open or eclectic Wiccan coven,** initiation makes you a priestess or priest of your coven and its tradition. It is real, and serious. It does not make you a Gardnerian or Alexandrian, and you should not claim that it does.

Many covens fall between these: an eclectic coven founded by someone with BTW training, or an initiatory coven that runs an open outer court. Ask.

## The degrees, in public terms

Many Wiccan traditions use three degrees. What follows is what initiates and scholars have publicly described; the content of each degree belongs to each tradition.

- **First degree** is initiation itself: entry into the priesthood and the coven.
- **Second degree** usually follows at least a year and a day later, after further training. It brings deeper teachings, and often the ability to lead rites and, in some traditions, to initiate others under the guidance of the coven's leaders. It is often described as an encounter with the darker, deeper side of the mysteries.
- **Third degree** is the fullest standing in the tradition, usually needed to lead a coven independently and to hive off a daughter coven.

Not every Wiccan coven uses degrees, and open covens may use different stages. In this Sanctuary, your coven describes its own positions, and the programs raise you to them.

## Why some choose not to seek initiation

Initiation is not the only good outcome of the path. Some people:

- find that their path is solitary, and keep a self-dedication for life;
- love the coven but do not want the responsibilities of the priesthood;
- discover, during the year and a day, that another tradition fits them better;
- need to wait for a better time in their lives.

All of these are honourable. A good coven will never pressure anyone towards initiation, and will welcome you as you are.

## Why it takes time

Initiation in Wicca is not given on request. Traditionally it follows at least a year and a day of training, and often longer. The time lets you:

- keep the full Wheel and many moons;
- learn the coven's rites and the craft of magic;
- come to know the coven's people, and they you;
- discern, honestly, whether this is your path.

It also protects you. A coven that initiates people quickly, or for money, is not to be trusted.

## What you can know beforehand

Initiation rites keep some things secret, so that the experience is a true mystery. But you always have the right to know beforehand anything that touches your **consent**: whether you will be expected to be unclothed, blindfolded, bound, touched, or to consume anything; how long the rite will be; and who will be there. You may say no to any of these, and a genuine coven will either adapt the rite or tell you honestly that it cannot, so you can choose. The welcome lessons' red flags all apply: no genuine initiation involves sex, payment, or secrecy that would hide harm.

> **Your coven:** Ask your High Priestess plainly: what does initiation in this coven make me? Is it into a lineage? Does the coven use degrees? What will I be told beforehand?

> **Try this:** Write a page in your Book of Shadows: why you want to be initiated, what you hope will change, and what you are afraid of. Keep it to reread at the end of your year and a day.

## What's old and what's modern

- **Old:** mystery religions and their initiations, such as at Eleusis; initiatory societies.
- **Modern:** Wiccan initiation, lineage and the three degrees (1950s onwards), shaped by Freemasonry and ceremonial magic.`,
    },
    {
      id: 'wicca-initiation-study-and-service',
      title: 'A year and a day of study and service',
      summary: 'What the year and a day asks: keeping the whole Wheel and the moons, learning the coven’s rite by heart, a reading plan of honest sources on Wicca, keeping your Book of Shadows, service to the coven and beyond, and reviewing your progress with your mentor.',
      minutes: 16,
      links: [page('grimoire'), coven('book'), page('calendar'), holy('moon-full'), page('community-rituals'), page('library')],
      body: `## The shape of the year

The year and a day before initiation is a year of steady, faithful practice. It is not meant to be crammed. It asks you to keep the rhythm of Wiccan life through a whole turn of the Wheel, to study honestly, and to give your time to others. By the end, the practice should be yours: not something you look up, but something you live.

## Keeping the Wheel and the moons

Through the year you will:

- **keep all eight sabbats,** with the coven or alone, as the lore module teaches;
- **keep the full moons,** with an esbat, at least most months: twelve or thirteen in the year;
- **keep your daily devotion,** most days;
- **write each rite** in your Book of Shadows.

## Learning the coven's rite

By initiation, you should be able to take any part in your coven's usual rite: sweep and bless, cast, call any quarter, invite the Goddess or God, bless cakes and ale, release and open. Learn the words by heart if your coven uses set words. Ask to take each role at least once during the year.

## A reading plan

Wicca values knowledge as well as experience. With your mentor, make a reading plan for the year: about one serious book or set of sources each quarter. A good starting list, all public and widely available:

- **History:** Ronald Hutton, The Triumph of the Moon (1999), the standard history; Philip Heselton's books on Gardner's origins; Ethan Doyle White, Wicca: History, Belief and Community in Modern Pagan Witchcraft (2016), a clear overview.
- **The founders in their own words:** Gerald Gardner, Witchcraft Today (1954); Doreen Valiente, The Rebirth of Witchcraft (1989) and Witchcraft for Tomorrow (1978).
- **Traditional practice as published:** Janet and Stewart Farrar, Eight Sabbats for Witches (1981) and The Witches' Way (1984), published with Valiente's help.
- **Open and solitary Wicca:** Scott Cunningham, Wicca: A Guide for the Solitary Practitioner (1988).
- **Wider movements:** Starhawk, The Spiral Dance (1979); Margot Adler, Drawing Down the Moon (1979).

For each, write notes: what it teaches, what surprised you, what you question, how it changes your practice. Read critically: older books contain claims about history that are now known to be wrong, and you should be able to spot them.

## Keeping your Book of Shadows

By now your Book of Shadows should be a real working book. Through the year, add:

- your rites and their words;
- the sabbats and esbats as you kept them;
- correspondences you have tested;
- workings, with their purpose and results;
- divination readings and what came of them;
- reading notes;
- your reflections.

Near the end of the year, you may be asked to write a page for the coven's shared Book: something you have learned that would help others.

## Service

Wiccan priesthood is service. Through the year:

- **Serve the coven:** help set up and clear away rites, prepare food, welcome newcomers, keep the altar, look after a role.
- **Serve beyond the coven:** a food bank, a conservation group, a hospice, a community garden, a pagan moot. Choose something real that you can sustain.
- **Serve the land:** litter picks, tree planting, wildlife surveys, care for a local green space.

Service is not about earning initiation. It is practice for the priesthood: learning to give your time and care freely.

## Deepening the craft

Alongside the Wiccan lessons, the year and a day takes you through the deeper craft in the core lessons of this program: correspondences, the moon and magical timing, divination, spellcraft, and ritual craft and coven life. Use them in a Wiccan way: cast your circle for divination and spellwork, ask the Goddess and God's blessing on your workings, and keep the Rede in mind. By the end of the year you should be able to:

- plan and write a complete Wiccan rite for a sabbat or esbat;
- choose correspondences for a working and explain your choices;
- time a working by the moon, and know when timing does not matter;
- read for yourself with a divination system you have practised;
- raise, direct and ground power safely, alone and with others;
- say honestly where each of your practices comes from.

## Learning from other Wiccans

If you can, meet Wiccans outside your coven during the year: at a pagan moot, an open sabbat, a conference or a reputable online group. You will see how differently Wicca is practised, and you will learn to hold your coven's ways with both love and perspective. Be courteous, and never press initiates of other traditions about what they keep secret.

## Reviewing the year

At about six months, read back through your Book of Shadows, your logs and your notes. Write a short review: what has gone well, what has been hard, what has changed in you, and what you want from the second half. Meet your mentor to talk it through. Do the same at the end.

## When things get in the way

A year is long. Illness, work, family, grief and doubt happen. If you fall behind, tell your mentor; the year can be paused or extended. A year and a day is a minimum, not a deadline.

> **Note:** The year and a day is a minimum. Many covens take longer, and some people need longer. Taking more time is never a failure.

> **Your coven:** Ask your mentor what your coven expects in the year and a day: which sabbats and moons you must keep with the coven, which roles to learn, and what reading it recommends.

> **Try this:** Draw up your reading plan with your mentor this month. Write it in your Book of Shadows and on this step.

## What's old and what's modern

- **Old:** the period of training before initiation, in many religions.
- **Modern:** the Wiccan year and a day, and its reading list.`,
    },
    {
      id: 'wicca-initiation-the-oath',
      title: 'The oath',
      summary: 'What Wiccan oaths are, what an oath of secrecy may and may not cover, why oaths about other people’s secrets matter (including respecting other traditions’ oathbound material), and how to write the promises you will make at initiation with your High Priestess.',
      minutes: 15,
      links: [closed('initiatory-wicca'), coven('standing'), page('grimoire'), coven('book')],
      body: `## Why Wicca uses oaths

Oaths are solemn promises made before the gods and witnesses. Wicca uses them at initiation for several reasons:

- **To mark the seriousness** of the step: initiation is a commitment, not a trial membership.
- **To protect the mysteries:** some rites lose their power to change people if they are described in advance or treated as entertainment.
- **To protect the coven:** members trust one another with personal matters, and in some places and times, being known as a witch has cost people jobs, homes and custody of children.
- **To bind the initiate to the gods and the tradition:** an oath is also a relationship.

## What an oath of secrecy may cover

A Wiccan oath of secrecy may properly cover:

- **the tradition's rites and teachings,** especially those of initiation;
- **the coven's Book of Shadows,** in initiatory traditions;
- **the identities of members,** who may not be open about their religion at work or at home;
- **what members share in confidence** in the circle.

## What an oath may never cover

No oath, of any kind, may require you to keep secret:

- **harm done to anyone:** abuse, assault, exploitation, coercion;
- **crimes,** or anything that would need hiding from the law;
- **danger to a child** or a vulnerable adult;
- **what happens to you** if you are mistreated.

An oath that claims to cover these is not a religious oath; it is a tool of abuse, and it does not bind you. Speaking out about harm is not oath-breaking. Every genuine Wiccan elder will agree.

## Oaths and other traditions

If you take an oath, you will understand from the inside why others' oaths matter. Respect them:

- do not seek out or read leaked oathbound material from initiatory traditions;
- do not press initiates of any tradition to tell you what they have sworn to keep;
- do not claim to teach or possess material you have not been given properly.

This course follows the same rule: it teaches only what is public.

## What else you may promise

Beyond secrecy, initiation oaths often include promises to:

- honour the Goddess and the God;
- keep the sabbats and esbats;
- live by the Rede and the coven's ethics;
- support and care for your coven-mates;
- continue to learn;
- use the Craft's knowledge for good;
- never use your position to harm or exploit others.

## Writing your promises

Many covens have a core oath, spoken by every initiate, which you will learn beforehand or at the rite. Many also invite the initiate to add their own promises. Write yours in the same careful way you wrote your words of dedication:

1. **Witnesses.** Whom you speak before: the Goddess and God, the Mighty Dead, your coven.
2. **The core promises,** as your coven gives them.
3. **Your own promise:** something particular to you, such as a service you will keep, a fault you will work on, a god you will honour.
4. **The bond:** what you understand will follow if you break your oath. Many Wiccan oaths leave this to the gods, or speak only of the loss of trust. Avoid self-curses: they are not needed and can weigh heavily on people who struggle with anxiety.
5. **Closing:** "So mote it be."

### Testing each promise

- Can I keep this for years, not only now?
- Do I understand exactly what it covers?
- Is anything in it something I should never promise (secrecy about harm, obedience to a person, money, sex)?
- Read it aloud, wait a week, read it again.

## Confidentiality in practice

Keeping an oath of secrecy is mostly a matter of everyday habits:

- don't name coven members to others without their permission, even other pagans;
- don't post photographs from rites, or descriptions of what happens in them, online;
- keep your Book of Shadows where others in your household won't read it by accident, and protect it with a lock or a passcode if it is digital;
- when friends ask about Wicca, talk about what is public (the sabbats, the Goddess and God, the ethics, the history) and simply say "that part is kept within the coven" about the rest;
- if you are unsure whether something may be shared, ask your High Priestess first.

None of this means being secretive about being Wiccan, if you choose to be open about your religion. Many Wiccans are. It means keeping other people's confidences and the tradition's mysteries.

## Breaking and ending

People sometimes leave a coven or a tradition after initiation. An oath of secrecy about a tradition's rites usually continues after you leave: you still don't publish them. Other promises (to attend, to serve) naturally end when you leave, if you leave honourably. If you ever feel you cannot keep your oath, talk to your High Priestess, or another elder you trust.

> **Your coven:** Ask to see your coven's core oath, if it has one, well before your initiation, and ask what it covers. You have the right to know what you will swear before you swear it.

> **Try this:** Draft your own promises using the steps above. Read them aloud at your altar at three full moons in a row, revising after each.

## What's old and what's modern

- **Old:** oaths before the gods, in nearly every ancient religion; oaths of secrecy in the ancient mysteries and in Freemasonry.
- **Modern:** Wiccan initiation oaths and their limits as they are understood today.`,
    },
    {
      id: 'wicca-initiation-preparing-for-initiation',
      title: 'Preparing for initiation',
      summary: 'Getting ready for your coven’s initiation: the final conversation about readiness, practical and health matters, what you may and may not be told, the week before and the day itself, and aftercare in the weeks that follow.',
      minutes: 15,
      links: [page('journal'), ritual('kitchen-solitary-grounding-centering'), coven('standing'), coven('gathering')],
      body: `## Readiness

Initiation happens when both you and the coven's leaders agree you are ready. Readiness is not about perfection. It usually means that:

- you have kept the year and a day faithfully, or something close to it;
- you know the coven's rite and can take part in it fully;
- you have studied honestly and can tell the history from the myths;
- you know the coven's people and trust them, and they you;
- you understand what the initiation will make you, and what it will not;
- you want this for yourself, freely;
- the timing in your life is right.

A final conversation with your mentor and High Priestess will cover all this. Be honest. If you have doubts, say so; they can be talked through, and waiting is always an option.

## Practicalities to ask about

Three or four weeks before, talk with your High Priestess or High Priest about:

- **where and when** the rite will be, and how long it will take;
- **what to bring:** often your oath, your tools, a robe or particular clothes, a gift for the coven, food for the feast;
- **what you will be told beforehand,** and what will be kept as mystery;
- **anything touching your consent:** clothing or nudity, blindfolds, cords, touch, anything to eat or drink. You have the right to know these and to say no;
- **health needs:** mobility, standing for long periods, allergies, medication, anxiety, past trauma, pregnancy. Tell them; a good coven will adapt;
- **who will be present;**
- **what happens afterwards:** the feast, getting home, your first days.

## The week before

1. **Keep your daily devotion,** morning and evening.
2. **Read your oath** aloud each day.
3. **Clean your home and altar.**
4. **Spend time outside,** with the land and sky.
5. **Rest.** Sleep well, eat well, avoid alcohol and anything that would leave you unwell.
6. **Reflect.** Reread your Book of Shadows from the year, and the page you wrote at the start about why you wanted to be initiated.
7. **Tell someone you trust,** outside the coven if possible, where you will be and when you expect to be home. This is good practice for any rite away from home.

## The day

- **Keep your morning devotion.**
- **Take a ritual bath** or shower with attention: you are preparing to be made new.
- **Eat lightly,** unless your coven has asked you to fast; if you have a health condition, never fast without medical advice.
- **Arrive in good time,** calm, with what you were asked to bring.

You may feel nervous. That is normal and right: you are taking a serious step. You can stop at any point, and saying "I need a moment" is always allowed.

## What the rite will be

This course does not describe your coven's initiation rite: it belongs to the coven, and in initiatory traditions it is oathbound. What can be said publicly is that Wiccan initiations generally include a challenge or questions, the initiate's oath, a blessing and consecration, the presentation of the new initiate to the gods and the quarters, and a welcome into the coven. Everything else is for you to experience.

## Aftercare

Initiation can be a profound experience, and people react very differently. In the days and weeks after:

1. **Eat, rest and sleep.**
2. **Ground yourself:** walk, garden, cook, touch the earth.
3. **Keep your daily devotion,** even briefly.
4. **Write** what you can of the experience in your Book of Shadows, keeping private what the coven keeps private.
5. **Talk** with your mentor or High Priestess. Many covens check in at a week and at a month.
6. **Be gentle** with yourself. Some people feel elated for weeks; some feel flat or tearful; some feel little at first and find meaning later. All are normal.

If low mood, anxiety or unsettling experiences last more than two weeks, tell your mentor, and see a doctor. A good coven will support you to get help.

## If you decide not to go ahead

Sometimes, in the last weeks, a person realises they are not ready, or that initiation is not for them. That is a brave and honest thing to recognise. Tell your High Priestess as soon as you know; it is far better than going through a rite you do not mean. A good coven will thank you for your honesty, help you decide what comes next, and leave the door open if you want to return to the question later.

## After initiation

You are now a priestess or priest of your tradition. Things will change: you may attend the coven's inner rites, take larger roles, keep more confidences, and, in time, begin to train for the next degree or to mentor newcomers. Above all, keep your daily practice. Initiation opens a door; it is walking through it day by day that makes a Wiccan.

> **Safety:** If anything said or done before, during or after your initiation feels like pressure, coercion, or harm, you may stop, leave and speak about it. No oath covers harm.

> **Your coven:** Your High Priestess will tell you what your coven's initiation requires. Ask anything you need to feel safe and ready.

> **Try this:** After your initiation, reread the page you wrote at the start of the year. Write a reply to the person who wrote it.

## What's old and what's modern

- **Old:** preparing for initiation with purification, fasting and vigil, in the ancient mysteries and many religions.
- **Modern:** Wiccan initiation preparation and aftercare as covens practise them today.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wicca-initiation',
      title: 'The Wiccan path to initiation: test',
      intro: 'Twelve questions on what initiation means in Wicca, the year and a day, the oath and preparing for initiation. Most are scored at once; your mentor scores the written answers. You need 80% to pass.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'What does "only a witch can make a witch" mean in British Traditional Wicca?',
          options: [
            'Anyone can initiate themselves',
            'Initiation must be given by a priestess or priest of the tradition who has the standing to initiate, so each initiate belongs to a lineage',
            'Witches are born, not made',
            'Only women can initiate',
          ],
          correct: [1],
          points: 1,
          explanation: 'In BTW, initiation passes through a line of real people back to the founders. Solitary Wiccans often hold that the gods are the true initiators; both views are held honestly.',
        },
        {
          id: 'q2',
          type: 'truefalse',
          prompt: 'An initiation in an open, eclectic Wiccan coven makes the initiate a Gardnerian.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. It makes them a priestess or priest of their coven and its tradition, which is real and serious, but not a member of a lineage they were not initiated into.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'In public descriptions, what does the third degree usually allow?',
          options: ['Attending esbats', 'Leading a coven independently and hiving off a daughter coven', 'Reading the Charge', 'Joining the outer court'],
          correct: [1],
          points: 1,
          explanation: 'The first degree is initiation, the second usually brings deeper teaching and leading under guidance, and the third the fullest standing, needed to lead a coven and hive.',
        },
        {
          id: 'q4',
          type: 'multi',
          prompt: 'Before initiation, which things do you always have the right to know? Choose all that apply.',
          options: [
            'Whether you will be expected to be unclothed',
            'Whether you will be blindfolded, bound or touched',
            'Every secret word of the rite',
            'Whether you will be asked to eat or drink anything',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Some of the rite may be kept as mystery, but anything that touches your consent must be known beforehand, and you may say no.',
        },
        {
          id: 'q5',
          type: 'multi',
          prompt: 'Which may a Wiccan oath of secrecy properly cover? Choose all that apply.',
          options: ['The tradition’s rites and teachings', 'The identities of members', 'Abuse of a member by a leader', 'What members share in confidence in the circle'],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'No oath may cover harm to anyone. Speaking out about harm is not oath-breaking.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'Someone offers you a leaked copy of a Gardnerian Book of Shadows. What does respect for oaths suggest?',
          options: ['Read it to get ahead', 'Decline: it is oathbound material not given to you properly', 'Publish it to make it free', 'Use it to claim a lineage'],
          correct: [1],
          points: 1,
          explanation: 'Respect other traditions’ oaths as you would want yours respected. Reading text is not initiation in any case.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'Which is the best-known modern history of Wicca to read during your year and a day?',
          options: ['Margaret Murray, The Witch-Cult in Western Europe', 'Ronald Hutton, The Triumph of the Moon', 'Charles Leland, Aradia', 'A website claiming Wicca is from the Stone Age'],
          correct: [1],
          points: 1,
          explanation: 'Hutton’s 1999 history is the standard. Murray and Leland are sources for Wicca, to be read critically, not histories of it.',
        },
        {
          id: 'q8',
          type: 'truefalse',
          prompt: 'The year and a day is a deadline: if you have not finished in time, you have failed.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. It is a minimum. Illness, work and life happen; tell your mentor, and the year can be paused or extended.',
        },
        {
          id: 'q9',
          type: 'multi',
          prompt: 'Which are wise in the week before initiation? Choose all that apply.',
          options: ['Reading your oath aloud each day', 'Telling someone you trust where you will be', 'Fasting for days without medical advice', 'Resting and keeping your devotion'],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Prepare body and mind with rest, devotion and reflection. Never fast without medical advice if you have a health condition.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'Three weeks after initiation you still feel low and unsettled. What should you do?',
          options: ['Hide it: it means you failed', 'Tell your mentor and see a doctor', 'Do more intense rituals alone', 'Leave the coven at once'],
          correct: [1],
          points: 1,
          explanation: 'Reactions vary, but low mood lasting more than two weeks deserves care from your mentor and a doctor.',
        },
        {
          id: 'q11',
          type: 'long',
          prompt: 'Write the promises you intend to make at initiation (as much as you are willing to share), and explain how you tested them and what they do and do not cover.',
          points: 4,
          explanation: 'A good oath is one you can keep for years, that you understand fully, and that contains nothing an oath should never contain.',
          rubric: 'Full marks (4): promises are clear and specific (1); includes a personal promise of their own (1); explains at least one test they applied and a revision made (1); states that the oath does not cover harm, crime or obedience to a person, or shows this clearly (1).',
        },
        {
          id: 'q12',
          type: 'short',
          prompt: 'What will initiation in your coven make you, and what will it not? Explain in your own words, after talking with your High Priestess.',
          points: 3,
          explanation: 'Knowing exactly what an initiation confers is part of honesty in Wicca.',
          rubric: 'Full marks (3): states correctly whether the coven is in an initiatory lineage (1); describes what the initiation confers in this coven, such as priesthood and membership (1); states what it does not confer, such as membership of a lineage they are not entering (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Study and service',
      intro: 'A year and a day of faithful practice, study and service: you keep the moons and the Wheel, learn the coven’s rite by heart, read honest sources on Wicca, keep your Book of Shadows, and give your time to the coven and beyond. This stage lasts at least a year and a day, and your High Priestess may adapt it.',
      min_days: 366,
      passed_by: 'mentor',
      tasks: [
        {
          title: 'What initiation means',
          kind: 'reflection',
          instructions: `1. Read "What initiation means in Wicca".
2. Ask your High Priestess what initiation in your coven makes you, and whether it is into a lineage.
3. Do the "Try this": write a page on why you want to be initiated, what you hope will change, and what you are afraid of. Keep it to reread at the end of the year.
4. In the answer box, write as much as you're willing to share, and what you learned about your coven's initiation.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 45,
          docs: ['wicca-initiation-what-initiation-means'],
          links: [coven('standing')],
        },
        {
          title: 'Your reading plan',
          kind: 'study',
          instructions: `1. Read "A year and a day of study and service".
2. Make a reading plan for the year with your mentor, starting from the list in the lesson.
3. In the answer box, write your plan: what you'll read and roughly when.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wicca-initiation-study-and-service'],
          links: [page('library')],
        },
        {
          title: 'Reading notes',
          kind: 'study',
          instructions: `1. Each quarter, finish one book or set of sources from your plan.
2. Write your notes: what it teaches, what surprised you, what you question, and how it changes your practice.
3. In the answer box, share your notes for that source. Log four in the year.`,
          times: 4,
          response: 'text',
          checked_by: 'mentor',
          minutes: 120,
          docs: ['wicca-initiation-study-and-service'],
          links: [page('grimoire')],
        },
        {
          title: 'Thirteen moons',
          kind: 'ritual',
          instructions: `1. Keep the full moon with an esbat every month of the year, with the coven or at home.
2. Log each one. If you miss a month, carry on the next; tell your mentor if you miss several.`,
          times: 12,
          response: 'none',
          checked_by: 'self',
          minutes: 45,
          docs: ['wicca-initiation-study-and-service'],
          links: [ritual('wicca-full-moon-esbat'), holy('moon-full')],
        },
        {
          title: 'Learn the coven’s rite',
          kind: 'practice',
          instructions: `1. Over the year, take each role in your coven's usual rite at least once: sweeping and blessing, casting, calling a quarter, inviting the Goddess or God, blessing cakes and ale, releasing and opening.
2. Log each role you take, with a note of which it was and how it went.`,
          times: 6,
          response: 'none',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['wicca-initiation-study-and-service'],
          links: [coven('rituals')],
          solitary: 'Keep a full esbat or sabbat alone six times over the year, each time giving particular care to one part of the rite (cleansing, casting, the quarters, the Goddess and God, cakes and ale, closing), and writing what you learned of it.',
        },
        {
          title: 'Keep your book',
          kind: 'book',
          instructions: `1. Keep your Book of Shadows through the year, in the app's Grimoire or on paper: rites, words, sabbats, esbats, workings, readings and reading notes.
2. Near the end of the year, write one page for the coven's shared Book on something you have learned, and send it to your High Priestess for approval.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 60,
          docs: ['wicca-initiation-study-and-service'],
          links: [coven('book')],
          solitary: 'Write the page for your own Book of Shadows instead, as if for someone just starting the path, and ask a trusted friend or teacher on the path to read it if you can.',
        },
        {
          title: 'Serve the coven',
          kind: 'service',
          instructions: `1. Help at four coven rites over the year: setting up, cooking, keeping the altar, welcoming newcomers, clearing away.
2. Log each one, with a note of what you did.`,
          times: 4,
          response: 'none',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['wicca-initiation-study-and-service'],
          links: [coven('gathering')],
          solitary: 'Offer your help four times over the year to a pagan moot, open sabbat or community event near you or online, or host a sabbat meal for friends; log each time.',
        },
        {
          title: 'Serve beyond the coven',
          kind: 'service',
          instructions: `1. Do regular service for people or the land beyond the coven: a food bank, a conservation group, a community garden, a hospice.
2. In the answer box, write what you did, how often, and to whom (if anyone) you dedicated it.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 240,
          docs: ['wicca-initiation-study-and-service'],
          links: [page('community-rituals')],
        },
        {
          title: 'Half-year review',
          kind: 'meeting',
          instructions: `1. At about six months, read back through your Book of Shadows and your logs.
2. Write a short review: what has gone well, what has been hard, what has changed, what you want next.
3. Meet your mentor to talk it through. Send them your review as a message on this step beforehand.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['wicca-initiation-study-and-service'],
          links: [page('journal')],
          solitary: 'Write your review in your Book of Shadows, then reread the page you wrote at the start of the year and write a letter to yourself for the end of the year.',
        },
      ],
    },
    {
      title: 'The oath',
      intro: 'Here you learn what Wiccan oaths are, what an oath of secrecy may and may never cover, and write the promises you will make at initiation, together with your High Priestess or High Priest. Take your time: an oath should be one you can keep for years.',
      passed_by: 'manager',
      tasks: [
        {
          title: 'Draft your promises',
          kind: 'oath',
          instructions: `1. Read "The oath".
2. Ask to see your coven's core oath, if it has one, and ask what it covers.
3. Write your own promises step by step as the lesson describes, test each one, read them aloud, wait a week, and revise.
4. Write your draft in the answer box for your High Priestess or High Priest.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 90,
          docs: ['wicca-initiation-the-oath'],
          links: [coven('standing')],
        },
        {
          title: 'Talk it through',
          kind: 'meeting',
          instructions: `1. Meet your High Priestess or High Priest to talk through your oath.
2. Agree the final wording together.
3. Read the final oath aloud at your altar, and keep a copy in your Book of Shadows.`,
          times: 1,
          response: 'none',
          checked_by: 'manager',
          minutes: 45,
          docs: ['wicca-initiation-the-oath'],
          links: [page('grimoire')],
          solitary: 'Read your promises aloud at your altar at three full moons in a row, revising after each, before you swear them.',
        },
      ],
    },
    {
      title: 'Preparing for initiation',
      intro: 'The end of the path. You and the coven’s leaders decide together that you are ready; you prepare body, mind and home, take your coven’s initiation, and care for yourself in the weeks after. You may stop at any point.',
      passed_by: 'manager',
      tasks: [
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Re-read the lessons of this module.
2. Take the test. The choice questions are scored at once; your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed, talk to your mentor, and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          quiz: 'quiz-wicca-initiation',
          links: [closed('initiatory-wicca')],
        },
        {
          title: 'A final conversation',
          kind: 'meeting',
          instructions: `1. Reread the page you wrote at the start of the year.
2. Meet your mentor and High Priestess to look back on the year (the Wheel, the moons, your study, your service, your book) and to talk honestly about whether you are ready.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['wicca-initiation-what-initiation-means', 'wicca-initiation-preparing-for-initiation'],
          links: [coven('standing')],
          solitary: 'Reread everything from the year, and write an honest letter on whether you are ready to make a lifelong commitment to this path; wait at least a moon before deciding.',
        },
        {
          title: 'Prepare',
          kind: 'practice',
          instructions: `1. Read "Preparing for initiation".
2. Three or four weeks before, talk with your High Priestess about practicalities, consent, health needs and any concerns.
3. In the week before, read your oath daily, clean your home and altar, spend time outside, reflect and rest, and tell someone you trust where you will be.
4. Log each day of preparation.`,
          times: 7,
          response: 'none',
          checked_by: 'self',
          minutes: 20,
          docs: ['wicca-initiation-preparing-for-initiation'],
          links: [ritual('kitchen-solitary-grounding-centering')],
        },
        {
          title: 'Initiation',
          kind: 'ritual',
          instructions: `Your initiation, held by your coven's leaders in the coven's own way. Bring your oath and anything you have been asked to bring. You may stop at any point.`,
          times: 1,
          response: 'none',
          checked_by: 'manager',
          docs: ['wicca-initiation-preparing-for-initiation'],
          links: [coven('rituals')],
          solitary: 'A solitary Wiccan makes a self-dedication of the deeper kind rather than an initiation into a coven or lineage: swear your promises at your altar at a sabbat, before the Goddess and God and, if you can, a trusted witness, knowing it is a lifelong commitment to the path, not entry into a lineage.',
        },
        {
          title: 'Aftercare',
          kind: 'reflection',
          instructions: `1. In the days after, eat, rest, ground yourself, go outside and keep your daily devotion.
2. Within a week, write in the answer box how you are, what you can share of your experience (keeping private what the coven keeps private), and anything you would like to talk about.
3. Your mentor will reply on this step. If low mood or unease lasts more than two weeks, please tell them and see a doctor.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wicca-initiation-preparing-for-initiation'],
          links: [page('journal')],
        },
      ],
    },
  ],
} satisfies CourseModule;
