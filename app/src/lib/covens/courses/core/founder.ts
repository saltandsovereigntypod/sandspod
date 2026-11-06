// core-founder: the founder's training ("Leading a coven: the founder's
// training"). Seven short modules for anyone about to found a coven that
// strangers can find and join: holding space and consent; safeguarding and
// boundaries; running rites and meetings in the app; conflict and endings;
// cultural respect and closed traditions; mental health and crisis
// signposting; and the legal-ish basics (age, privacy, money). Each has a
// lesson, a private reflection and a short test. Required before a coven is
// listed in Find a coven (lib/covens/founding.ts), optional for a coven kept
// to invitations. Tradition-neutral. It does not replace the elders' and
// High Priestess's modules (core-elder-*, core-hp-*), which go deeper into
// teaching, governance and leading an established coven; it is the floor a
// new leader stands on.

import type { CourseModule } from '../types';
import { FOUNDER_REFLECTIONS } from '../../founding.ts';

const holdingSpace = `## What "holding space" means

People in covens talk about **holding space**. It sounds mystical, and it can feel that way, but it is mostly practical. To hold space is to take responsibility for the conditions a group meets in, so that everyone inside them can attend to the work instead of to their own safety. When you found a coven you become the person who holds that space first, until others share the work with you.

The conditions are simple to list and hard to keep:

- **Predictability.** People know when you meet, roughly what will happen, how long it lasts and how to leave.
- **Attention.** Someone is watching the whole circle, not only the altar or the script: who has gone quiet, who is crying, who has stepped out.
- **Pace.** Nobody is hurried into something they did not expect. Silence is allowed.
- **Fairness.** The same rules apply to the founder's friends as to a stranger who joined last week.
- **A way out.** Anyone may stop, sit down, step back or leave, at any time, without explaining.

## Consent is the centre of it

In a coven, **consent** means a person freely and knowingly agrees to each thing that is done with them or asked of them, and can change their mind. It has three parts worth naming:

1. **Informed.** They know what is going to happen before it happens. "We'll do a trance journey with drumming, about twenty minutes, and you can open your eyes at any point" is informed. "Just trust the process" is not.
2. **Specific.** Agreeing to one thing is not agreeing to another. Agreeing to hold hands in the circle is not agreeing to be anointed on the forehead, hugged, or touched by someone else.
3. **Reversible.** Yes can become no in the middle. Nobody owes you an explanation, and the rite carries on without them, or pauses.

Ritual makes consent harder, not easier. People are in altered states, often in the dark, often moved, sometimes wanting to please the leader, and sometimes new enough that they don't know what is normal. A newcomer may not know that they *can* say no. So you say it for them, every time, out loud.

> **Try this:** Before your next rite, write the "consent words" you will say at the start: what will happen, what will involve touch or sharing, how to opt out of any part, and that sitting out is welcome. Say them even if everyone has heard them before.

## Touch, sharing and the body

Some traditions use touch: holding hands, an embrace at the end, anointing, a hand on the shoulder in a blessing. Some modern traditions have practised ritual nudity ("skyclad"). In an online coven you will rarely meet these directly, but members may gather in person, and your coven's culture starts with you.

The floor in this community is this:

- **Ask first, every time,** before any touch, and offer a no-touch alternative that is genuinely equal ("you may hold hands or hold your own hands at your heart").
- **No one is ever asked to undress,** share photographs of their body, or do anything sexual as part of training, initiation or membership. The Salt & Sovereignty guidelines forbid it, and you should state it plainly in your coven's rules.
- **Sharing is invited, never required.** A circle where everyone speaks in turn should let people pass.

> **Safety:** "Sex magic" and "initiation requires trust" have both been used to groom and abuse people in pagan communities. If anyone in your coven proposes anything sexual, private or secret as part of training, stop it, and tell the moderators.

## The leader's own state

You cannot hold space while you are flooded. Before a rite, take five minutes to ground yourself; if you are ill, grieving, drunk or furious, hand the rite to someone else or postpone. A good leader is not the most powerful person in the circle. A good leader is the steadiest.

## Your coven

> **Your coven:** Write down, in two or three sentences, what anyone may expect at every gathering of your coven: how it opens, how to opt out, how it closes. Put it in your coven's rules in Manage so every member reads it before they join.`;

const safeguarding = `## Why safeguarding is the founder's job

**Safeguarding** is everything a group does to protect people from harm, especially people who are more at risk. In a coven, harm is rarely dramatic at first. It looks like a member being asked for a little money, a leader who messages one young member late every night, an "advanced" rite only some are invited to, or someone who has started to depend on the group for everything. As founder, you are the person who must notice, and the person who must act, even when the one causing harm is a friend.

## Who may be vulnerable

Anyone can be vulnerable at some time. In covens, look out especially for people who are:

- **New to the craft,** who don't know what is normal and may take any claim on trust.
- **Grieving, lonely, recently separated or isolated,** who may come to depend on the coven for belonging.
- **Living with mental illness, addiction or trauma,** for whom some practices (long trance, fasting, shadow work, intense emotional sharing) carry real risk.
- **Young adults,** recently eighteen, away from home for the first time.
- **In money trouble,** who may be pressured or may offer what they can't afford.
- **Living with someone who controls them,** whose messages may be read.

Vulnerability is not a reason to keep someone out. It is a reason to pay attention, to go gently, and to make the safe choice the easy one.

> **Safety:** Covens on Salt & Sovereignty are for adults only. If you learn that a member is under 18, remove them from the coven kindly, and tell the moderators through a report so the account can be checked. Never continue to train a minor privately.

## Boundaries a leader keeps

A **boundary** is a line you hold so that the relationship stays safe and fair. Strong leaders keep more boundaries than members, not fewer, because they hold more power.

- **Time and contact.** Agree when you are and are not available. Use the coven's own chat and conversations, not private channels outside the app, so there is a record and the moderators can help if something goes wrong.
- **One-to-one work.** Mentoring is good. Secret mentoring is not. Let another leader know who you are mentoring, and never ask a member to keep your conversations from others.
- **No dual relationships you can't manage.** Dating a member, employing a member, lending to or borrowing from a member all blur your role. If it happens, declare it, step back from deciding anything about that person, and let someone else hold that part.
- **Gifts and money.** Small, freely given gifts are fine. Anything that feels like payment for advancement is not.
- **Their life is theirs.** You may set rules for the circle. You may not tell anyone whom to love, whether to take their medication, whether to see their family, or how to vote.

## Abuse of power

**Abuse of power** is using the trust and authority of a role to get something for yourself, or to control someone. It is the most common serious harm in spiritual groups, and it is usually done by people who believe they are doing good. Warning signs, in yourself or in another leader:

- "Only I can teach you this." Secrets kept from the rest of the coven.
- Advancement tied to favours, money, flattery or closeness to the leader.
- Doubt treated as disloyalty; questions treated as attacks.
- Members cut off from friends outside the coven, or from other covens.
- The rules changing to suit the leader.
- People leaving quietly, and nobody asking why.

> **Note:** Every leader feels the pull of being admired. The protection is structure, not good intentions: shared decisions, written rules, more than one person who can hear a complaint, and a way for any member to go above you to the moderators.

## When to refer to professionals

You are a spiritual leader. You are not a therapist, doctor, lawyer, social worker or police officer, and you must not try to be. Refer, and help the person find the help, when:

- someone tells you they are being abused, or are in danger at home;
- someone describes symptoms of illness, physical or mental, or stops eating or sleeping;
- someone talks about harming themselves or someone else (see the module on crisis signposting);
- a crime may have been committed;
- someone wants advice on a legal, medical or money matter.

Listen first. Believe them. Don't promise secrecy you can't keep: if someone is in danger, you may need to tell someone. Then point them, kindly and clearly, to people trained for it.

## Your coven

> **Your coven:** Decide who, besides you, any member can go to with a concern about you. Name them in your rules. If there is no one yet, name the Salt & Sovereignty moderators and show members how to report.`;

const ritesInApp = `## What the app gives a new coven

A coven on Salt & Sovereignty has, from its first day, the tools to gather, practise, teach and keep its records. Learning them before you have members saves a great deal of muddle later. This module walks you through the parts a founder uses in the first months. You can try every part on your own coven before anyone joins.

## Its shape: positions and agreements

When you found a coven, the app makes its first **positions** (Seeker to your own title as leader) and four **documents**: a creed, rules, what you ask of members and a member agreement. Rewrite them in **Manage** in your own words before you invite anyone. The member agreement is signed by everyone who joins; when you change it, members are asked to sign the new version.

- Give each position only the powers it needs. Reviewing applications and moderating chat are powers; share them with people you trust, not with everyone.
- Decide how people join (by application, open, or not yet) and keep the coven **unlisted** while you settle in. Unlisted covens are found only by invitation.

## Gatherings: planning a rite

Plan a rite from the coven's **Rituals** tab with the ritual builder. A plan has sections (opening, the work, closing), steps, and roles: who calls a quarter, who reads, who lights the candle. Choose a time, and the app tells members and asks them whether they will come. You can start from a ready-made template and change it.

When the time comes, open the gathering and run it live: the steps show to everyone, people take their turns, and things are set on the coven's altar as the steps say. When you end it, the app keeps a record: who was present, which steps were done, and any notes you add. That record is what the **members' record** reads, so attendance builds up without anyone keeping a register by hand.

## Rituals together

For something smaller and quicker, start a **ritual together**: everyone's screen follows the step the leader is on, there is a shared candle to light together, a list of who's here, and short reactions. You can pass the lead to someone else for a step (a reading, a quarter call) and take it back. Begun from a coven gathering, it marks everyone who took part as present when you end it.

> **Try this:** Plan a short rite for a new moon with three steps, then start it together with yourself alone. Move through the steps, pass the lead to no one, and end it. Look at what the members' record would show.

## Meetings

A **meeting** is a gathering of the business kind: an agenda, motions and votes, actions carried forward, and minutes saved to the coven's Book. Use meetings for decisions the coven shares, so that decisions are written down and nobody depends on your memory.

## Talking, teaching and keeping

- **Messages:** the coven's chat, group conversations and one-to-one messages. Set the chat's rules; leaders with the moderating power can hide messages and mute people.
- **Initiation & training:** ready-made programs from the courses, mentors, lessons and tests. You assign them; members work through them at their own pace.
- **The Book:** the coven's Book of Shadows, where its rites, lore and minutes are kept, with who can read and edit each part.
- **Altars:** shared altars that everyone tends. Gatherings can leave the altar untouched for some hours after a rite.

## Safety tools

Every coven sits inside the Salt & Sovereignty community, and the moderators can see and act on every coven. Members can report a message, a member or the coven itself. Leaders can remove members, and members can block people. Learn where these are before you need them, and tell members about them in your first gathering.

> **Your coven:** Before you invite your first member, rewrite the four documents, set your positions' powers, and plan your first gathering. Then invite one trusted friend and run it together, so you learn the app with someone kind.`;

const conflictEndings = `## Conflict is normal

Every group that lasts has conflict. People disagree about how to do a rite, who should advance, what the coven is for, and whose turn it is. Conflict handled well makes a coven stronger and more honest. Conflict handled badly, or avoided, splits it. Your job as founder is not to stop disagreement; it is to make it safe to disagree.

## A simple way through a disagreement

When two members are in conflict, or a member is in conflict with you:

1. **Slow it down.** Move it out of the coven chat into a conversation with the people involved. Public arguments harden positions.
2. **Listen to each person separately first.** Ask what happened, what they need, and what they are afraid of. Write down what they say.
3. **Separate the person from the problem.** "We disagree about whether the rite should be public" is a problem you can solve. "She is controlling" is a judgement that can't be.
4. **Find the rule, or make one.** Often the conflict exists because the coven never decided something. Decide it together, write it in the rules, and apply it to everyone.
5. **Agree what happens next,** and check in a week later.

> **Note:** If you are one of the people in conflict, you cannot also be the judge. Ask another leader, or an elder from a mother coven, to hear it. If no one can, the moderators can advise.

## When someone breaks the rules

Most rule-breaking is careless, not cruel. Begin with a private, calm word: what you saw, which rule it touches, and what you need instead. Give people a chance to put it right. Keep a short note of what was said and when.

Some things need more at once: harassment, threats, pressure for money or sex, sharing private things outside the coven, or bringing someone under 18 into it. For these, protect the person harmed first (mute, remove, block), report to the moderators, and don't hold a private trial.

## Endings

Covens end and members leave. Both are natural, and both can be done with care.

**When a member leaves,** thank them, wish them well, and let them go. Don't pursue, guilt or warn them. Don't speak badly of them to the coven. If they want to come back later, the door can stay open. Remember that leaving is a sign the coven was free.

**When you must ask someone to leave,** do it plainly and kindly, in private, with the reason. Remove them in the app so they lose access to the coven's private things, and tell the coven only what it needs to know ("Rowan has left the coven"), never the details.

**When the coven itself ends,** whether you are tired, moving on, or the group has grown apart:

- tell members in good time, and say why honestly;
- offer to help them find other covens, or another leader who could carry it on (the app can hand the coven to a successor);
- decide what happens to the Book and the coven's shared things;
- hold a closing rite if you can: thanks, release, and blessing;
- archive the coven rather than vanish.

> **Try this:** Write the two or three sentences you would say if you had to close your coven tomorrow. Keep them. Knowing how you would end makes it easier to lead well now.

## Your coven

> **Your coven:** Add a short section to your coven's rules called "If there's a problem": who to speak to, what will happen, and that anyone may report to the moderators at any time.`;

const culturalRespect = `## Why this matters for a founder

A coven teaches. Whatever your coven practises, members will learn from you what is acceptable to borrow, how to speak about other people's gods and practices, and how to tell history from modern invention. A careless founder can, in good faith, teach a whole group to take what isn't theirs. A careful one teaches respect that members carry into everything else.

## Closed, living and open

The Sanctuary's guide to closed and living traditions explains these in detail. In short:

- A **closed** tradition is practised only by people born into it or properly initiated by its own community. Many Indigenous ceremonies are closed. So are some initiatory lineages, including traditional initiatory Wicca, whose oath-bound material is shared only within its covens.
- A **living** tradition is practised today by real communities, who have their own authorities, teachers and ways of joining: for example, Hinduism, Vodou, Santería (Lukumí), Shinto and the many living Indigenous religions. You may learn about them and, where they welcome it, from them, but they are not raw material for an eclectic rite.
- An **open** practice is one anyone may take up, such as much of modern eclectic witchcraft, folk magic of your own heritage, or reconstructed paths with public sources.

> **Safety:** If your coven's materials include a practice, a sacred object, or a deity from a closed or living tradition, check the guide, and if in doubt, leave it out or ask that community's own teachers.

## Common problems, and better choices

- **Smudging with white sage.** Burning white sage in a sacred way belongs to certain Indigenous ceremonies, and the plant is over-harvested. Better: name what you are doing ("cleansing with smoke"), use herbs of your own region or heritage, or use sound, water or salt.
- **"Spirit animals" and "totems".** These are specific beliefs of specific peoples. Better: "an animal I feel drawn to", "a familiar", or the terms of your own tradition.
- **Deities without context.** Gods have homes, stories and worshippers. If your coven honours a deity from a living religion, learn how its own people honour them, and be honest that you are outsiders.
- **"Ancient" claims.** Much of modern witchcraft is twentieth century. That is fine and worth being proud of. Say what is modern; don't invent an unbroken ancient line.

## History, honestly

Teach your members to ask of any claim: *who says so, and how do they know?* Mark what is historical, what is folk custom recorded later, and what is modern. Members trust a coven more, not less, when its founder says "we don't know" or "this is our own practice, not an ancient one".

## Welcoming people well

Respect also faces inward. Your coven will include people of different backgrounds, faiths, genders, bodies and abilities. Use the names and pronouns people give you. Offer roles that don't depend on standing, seeing or hearing. Avoid assuming that every member's family background is Christian, European or the same as yours. Leader titles in this app can be High Priestess, High Priest, Leader or anything else your coven chooses; choose one that welcomes.

## Your coven

> **Your coven:** Read through your creed and your first rite. Mark anything borrowed from a tradition not your own, and check each one against the closed and living traditions guide.`;

const crisisSignposting = `## What signposting means

**Signposting** is pointing someone to the help they need, clearly and quickly, and staying kind while you do it. In a crisis you are not expected to fix anything. You are expected to notice, to stay calm, and to help the person reach people who can help. Every coven leader will meet this at some point, and the first time is easier if you have thought about it beforehand.

## Spiritual practice and mental health

Ritual, trance, meditation, fasting, shadow work and divination can stir up strong feelings. Usually that is part of the work. Sometimes it isn't. Be gentle with:

- intense practices for people who are newly bereaved, in a mental-health crisis, or who have a history of psychosis, dissociation or trauma;
- readings or trance work that seem to "confirm" someone's fears, or that they start to depend on for every decision;
- anyone who reports seeing, hearing or being told things by spirits that frighten them, direct them to harm, or don't stop.

Never tell someone that their distress is spiritual instead of medical, or that a spell or the gods will replace their treatment, medication or therapy. Spiritual support can go alongside professional care; it must never replace it.

## Signs someone may be in crisis

- Talking about wanting to die, being a burden, or there being no way out.
- Saying goodbye, giving things away, or a sudden calm after deep distress.
- Talking about harming someone else.
- Not eating, not sleeping, or being unable to function for days.
- Being in danger from someone at home.

## What to do

1. **Take it seriously.** Ask directly and calmly: "Are you thinking about ending your life?" Asking does not put the idea in someone's head. It tells them you can hear the answer.
2. **Listen without judging.** Don't argue, lecture or promise secrecy.
3. **Point to help now.** If they are in immediate danger, they (or you, if you know where they are) should call the local emergency number: 999 in the UK, 911 in the US and Canada, 112 across the European Union. For support, the Sanctuary's **Support** page lists crisis lines by country: for example Samaritans (116 123 in the UK and Ireland) and the 988 Suicide & Crisis Lifeline in the US.
4. **Stay with them,** in the conversation, until they have contacted help or someone is with them.
5. **Look after yourself afterwards.** Talk to someone you trust; you may also call a crisis line for yourself.
6. **Tell the moderators** through a report if someone in the community is at risk and you are worried, or if you can't stay with them.

> **Safety:** Never try to handle a risk to someone's life through ritual, prayer or the coven alone. Pray if you like, and call for help as well.

## Making the coven a safe place to say "I'm not well"

- Put the Support page in your coven's welcome, so members know where it is before they need it.
- Say at gatherings that people may sit out any practice, without giving a reason.
- Check in privately with members who go quiet.
- Don't make members' struggles into coven gossip or "lessons".

## Your coven

> **Your coven:** Add the Support page and the line "If you're struggling, tell a leader or use the Support page; you'll never be asked to explain" to your coven's welcome or rules.`;

const legalBasics = `## Not legal advice, but the basics a founder needs

This module is not legal advice, and laws differ between countries and states. It covers the ground most new founders need, so that you know what to think about and when to ask someone qualified.

## Age

Covens on Salt & Sovereignty are for **adults, 18 and over**. Everyone confirms their age when they make a community profile, and your member agreement asks again. If you learn or suspect that a member is under 18, remove them from the coven kindly and report it to the moderators so the account can be checked. Don't make exceptions "with a parent's permission", and don't continue to teach a minor privately. Adults working with young people need proper safeguarding checks and training, which a coven can't provide.

## Privacy

Members trust you with their real names, their beliefs, their faces at gatherings, and sometimes their struggles. In some places, being known as a witch or pagan can still cost someone their job, family or safety.

- **Keep the coven's things in the coven.** Don't share members' names, messages, photographs or their membership outside it without their permission. Ask your members to agree the same in the member agreement.
- **Collect only what you need.** The app holds what a coven needs. Don't ask for home addresses, birth dates or legal names unless there is a real reason, and keep them only as long as you need them.
- **Photographs and recordings** of rites need everyone's agreement first. Many covens simply don't take them.
- **If you meet in person,** choose public or neutral places to begin with, and never give out a member's address.
- In the UK and EU, data protection law (the GDPR and the UK GDPR) may apply to some groups that keep records about people. If your coven becomes formal (a charity, a company, a registered group), ask a qualified adviser.

## Money and dues

Money is where many good covens go wrong. The floor in this community: **no one may be pressured for money, gifts or favours**, and advancement must never depend on paying.

If your coven shares costs (a room, candles, a website):

- say in writing what the money is for, how much, and that paying is voluntary or how hardship is handled;
- keep a simple record of money in and out, and show it to members when they ask, or regularly;
- have two people look after it, not one;
- don't mix the coven's money with your own;
- never lend to or borrow from members.

Paid classes or readings outside the coven are your own business, but keep them separate from the coven, and never make them a condition of membership or advancement.

## Duty of care, in plain words

You don't need to be a lawyer to lead well. You do owe your members reasonable care: not leading rites while unfit to, not putting people in danger (fire, unsafe places, unsafe substances), stopping what is harmful when you see it, and passing on concerns to people who can act. Fire is the commonest real danger in ritual: never leave a candle burning unattended, and keep water nearby.

## Your coven

> **Your coven:** Add one line about money to your rules ("We don't charge dues", or exactly what you share and how it is accounted for), and one about privacy ("What is shared in this coven stays in it; no photographs or recordings without everyone's agreement").`;

// ─── Tests: five questions each, all choices, pass at 80% ────────────────

const quizHoldingSpace = {
  id: 'quiz-core-founder-holding-space',
  title: 'Holding space and consent',
  intro: 'Five questions on consent, touch and the leader’s part in a safe circle.',
  passPercent: 80,
  questions: [
    {
      id: 'q1',
      type: 'single' as const,
      prompt: 'Which of these is informed consent before a trance journey?',
      options: ['“Just trust the process.”', '“We’ll journey with drumming for about twenty minutes; you can open your eyes or stop at any time.”', '“Everyone does this; you’ll be fine.”', 'Saying nothing, so as not to spoil the surprise.'],
      correct: [1],
      points: 1,
      explanation: 'Informed consent means people know what will happen, for how long, and how to stop, before it happens.',
    },
    {
      id: 'q2',
      type: 'truefalse' as const,
      prompt: 'Once someone has agreed to take part in a rite, they have agreed to every part of it.',
      options: ['True', 'False'],
      correct: [1],
      points: 1,
      explanation: 'Consent is specific and reversible: agreeing to one thing is not agreeing to another, and yes can become no at any point.',
    },
    {
      id: 'q3',
      type: 'single' as const,
      prompt: 'A rite includes holding hands. What should you offer?',
      options: ['Nothing; hand-holding is harmless.', 'An equal no-touch alternative, such as hands held at one’s own heart, and ask first.', 'Let people opt out only if they explain why.', 'Ask only the newest members.'],
      correct: [1],
      points: 1,
      explanation: 'Ask before any touch, every time, and offer a genuinely equal alternative so opting out doesn’t single anyone out.',
    },
    {
      id: 'q4',
      type: 'multi' as const,
      prompt: 'Which are never part of training, initiation or membership in a Salt & Sovereignty coven? Choose all that apply.',
      options: ['Being asked to undress', 'Sending photographs of one’s body', 'Anything sexual', 'Sitting out a practice'],
      correct: [0, 1, 2],
      points: 1,
      explanation: 'Undressing, private photographs and anything sexual are never part of coven membership or advancement. Sitting out is always welcome.',
    },
    {
      id: 'q5',
      type: 'single' as const,
      prompt: 'You are furious after an argument an hour before you’re due to lead a rite. What is the best choice?',
      options: ['Lead anyway; the rite will calm you.', 'Ground yourself, and if you are still not steady, hand the rite to someone else or postpone.', 'Lead it with extra intensity.', 'Cancel the coven.'],
      correct: [1],
      points: 1,
      explanation: 'The leader holds the space by being the steadiest person in it. If you can’t be, hand it on or postpone.',
    },
  ],
};

const quizSafeguarding = {
  id: 'quiz-core-founder-safeguarding',
  title: 'Safeguarding and boundaries',
  intro: 'Five questions on vulnerable members, boundaries, abuse of power and when to refer.',
  passPercent: 80,
  questions: [
    {
      id: 'q1',
      type: 'single' as const,
      prompt: 'You discover a member is 16. What do you do?',
      options: ['Let them stay if a parent agrees.', 'Teach them privately instead.', 'Remove them from the coven kindly and report it to the moderators.', 'Ignore it; they seem mature.'],
      correct: [2],
      points: 1,
      explanation: 'Covens are for adults only. Remove them kindly, report so the account can be checked, and never continue privately.',
    },
    {
      id: 'q2',
      type: 'multi' as const,
      prompt: 'Which are warning signs of abuse of power? Choose all that apply.',
      options: ['“Only I can teach you this; don’t tell the others.”', 'Advancement tied to favours or money', 'Questions treated as disloyalty', 'Rules written down and shared with everyone'],
      correct: [0, 1, 2],
      points: 1,
      explanation: 'Secrecy, advancement for favours and punishing questions are classic signs. Written, shared rules are a protection.',
    },
    {
      id: 'q3',
      type: 'single' as const,
      prompt: 'Why keep coven conversations inside the app rather than on private channels elsewhere?',
      options: ['It’s faster.', 'There is a record, and the moderators can help if something goes wrong.', 'Other apps are banned.', 'So the leader can read everything.'],
      correct: [1],
      points: 1,
      explanation: 'Conversations in the app leave a record and keep the community’s safety tools within reach.',
    },
    {
      id: 'q4',
      type: 'truefalse' as const,
      prompt: 'If a member tells you they are being abused at home, you should promise to keep it secret no matter what.',
      options: ['True', 'False'],
      correct: [1],
      points: 1,
      explanation: 'Listen and believe them, but don’t promise secrecy you can’t keep: if someone is in danger, help may mean telling someone.',
    },
    {
      id: 'q5',
      type: 'single' as const,
      prompt: 'You start dating a member of your coven. What is the right step?',
      options: ['Keep it secret.', 'Declare it, and step back from any decision about that person.', 'Promote them.', 'Nothing; private life is private.'],
      correct: [1],
      points: 1,
      explanation: 'A dual relationship blurs your role. Declare it and let someone else hold decisions about that person.',
    },
  ],
};

const quizRitesInApp = {
  id: 'quiz-core-founder-rites-in-app',
  title: 'Running rites and meetings in the app',
  intro: 'Five questions on the tools a founder uses first.',
  passPercent: 80,
  questions: [
    {
      id: 'q1',
      type: 'single' as const,
      prompt: 'What should you do with the coven’s creed, rules, requirements and member agreement before inviting anyone?',
      options: ['Leave them as they are.', 'Rewrite them in your own words in Manage.', 'Delete them.', 'Ask the first member to write them.'],
      correct: [1],
      points: 1,
      explanation: 'The app makes starter documents; rewrite them so they say what your coven actually is and asks.',
    },
    {
      id: 'q2',
      type: 'single' as const,
      prompt: 'How does attendance reach the members’ record?',
      options: ['You type a register after each rite.', 'From the record the app keeps when a gathering (or a ritual together begun from one) ends.', 'Members mark themselves later.', 'It doesn’t; attendance isn’t kept.'],
      correct: [1],
      points: 1,
      explanation: 'When a gathering ends, its record keeps who was present; a ritual together begun from a gathering marks those who took part.',
    },
    {
      id: 'q3',
      type: 'single' as const,
      prompt: 'In a ritual together, a member is to read the charge. What can the leader do?',
      options: ['Read it for them.', 'Pass the lead to them for that step, and take it back afterwards.', 'End the ritual and start a new one.', 'Nothing.'],
      correct: [1],
      points: 1,
      explanation: 'The lead can be passed to anyone in the ritual for a step, and the host can take it back.',
    },
    {
      id: 'q4',
      type: 'single' as const,
      prompt: 'What is a coven meeting for?',
      options: ['Rites only.', 'Decisions the coven shares: an agenda, motions, votes, actions and minutes.', 'Private chats.', 'Training tests.'],
      correct: [1],
      points: 1,
      explanation: 'Meetings write decisions down, so nobody depends on the leader’s memory.',
    },
    {
      id: 'q5',
      type: 'truefalse' as const,
      prompt: 'An unlisted coven can still be joined by people you invite.',
      options: ['True', 'False'],
      correct: [0],
      points: 1,
      explanation: 'Unlisted covens aren’t shown in Find a coven, but invitations and invite links work as usual.',
    },
  ],
};

const quizConflict = {
  id: 'quiz-core-founder-conflict-endings',
  title: 'Conflict and endings',
  intro: 'Five questions on disagreements, rule-breaking and ending well.',
  passPercent: 80,
  questions: [
    {
      id: 'q1',
      type: 'single' as const,
      prompt: 'An argument flares in the coven chat. What is a good first step?',
      options: ['Let it run its course.', 'Move it into a conversation with those involved, and slow it down.', 'Take a side quickly.', 'Close the chat for good.'],
      correct: [1],
      points: 1,
      explanation: 'Public arguments harden positions. Slow it down and move it somewhere quieter.',
    },
    {
      id: 'q2',
      type: 'single' as const,
      prompt: 'A member is in conflict with you. Who should hear it?',
      options: ['You, as leader.', 'Another leader, an elder from a mother coven, or the moderators.', 'Nobody.', 'The whole coven, by vote.'],
      correct: [1],
      points: 1,
      explanation: 'You can’t be both a party and the judge.',
    },
    {
      id: 'q3',
      type: 'multi' as const,
      prompt: 'Which call for protecting the person harmed and reporting to the moderators, rather than a quiet word? Choose all that apply.',
      options: ['Pressure for money or sex', 'Threats or harassment', 'Arriving late', 'Bringing someone under 18 into the coven'],
      correct: [0, 1, 3],
      points: 1,
      explanation: 'Serious harm needs protection and a report, not a private trial. Lateness needs a quiet word at most.',
    },
    {
      id: 'q4',
      type: 'single' as const,
      prompt: 'A member leaves. What should you do?',
      options: ['Warn the coven about them.', 'Ask them to explain.', 'Thank them, wish them well, and let them go.', 'Message them until they come back.'],
      correct: [2],
      points: 1,
      explanation: 'Leaving freely is a sign the coven was free. Don’t pursue, guilt or speak badly of them.',
    },
    {
      id: 'q5',
      type: 'multi' as const,
      prompt: 'Closing a coven well includes which of these? Choose all that apply.',
      options: ['Telling members in good time, honestly', 'Helping them find other covens or a successor', 'Deciding what happens to the Book', 'Vanishing without a word'],
      correct: [0, 1, 2],
      points: 1,
      explanation: 'Tell people, help them onward, decide about shared things, and archive rather than vanish.',
    },
  ],
};

const quizCultural = {
  id: 'quiz-core-founder-cultural-respect',
  title: 'Cultural respect and closed traditions',
  intro: 'Five questions on closed, living and open traditions, and honest history.',
  passPercent: 80,
  questions: [
    {
      id: 'q1',
      type: 'single' as const,
      prompt: 'What is a closed tradition?',
      options: ['One with no members left.', 'One practised only by people born into it or initiated by its own community.', 'Any tradition with secrets.', 'One that meets indoors.'],
      correct: [1],
      points: 1,
      explanation: 'Closed traditions belong to their communities; outsiders learn about them, not take them up.',
    },
    {
      id: 'q2',
      type: 'single' as const,
      prompt: 'A member wants to “smudge with white sage” at every rite. What is a better choice?',
      options: ['Keep it; everyone does it.', 'Name it as cleansing with smoke and use herbs of your own region or heritage, or sound, water or salt.', 'Buy more sage.', 'Ban cleansing.'],
      correct: [1],
      points: 1,
      explanation: 'Smudging belongs to particular Indigenous ceremonies and white sage is over-harvested; there are many good alternatives.',
    },
    {
      id: 'q3',
      type: 'truefalse' as const,
      prompt: 'It’s better to claim your coven’s practices are ancient, so members take them seriously.',
      options: ['True', 'False'],
      correct: [1],
      points: 1,
      explanation: 'Say what is modern and what is historical. Honesty builds trust.',
    },
    {
      id: 'q4',
      type: 'single' as const,
      prompt: 'Your coven wants to honour a deity from a living religion. What should you do first?',
      options: ['Write your own myth for them.', 'Learn how that deity’s own people honour them, and be honest that you are outsiders.', 'Use whatever offerings you like.', 'Avoid mentioning where they come from.'],
      correct: [1],
      points: 1,
      explanation: 'Gods have homes and worshippers. Learn from them and be honest about where you stand.',
    },
    {
      id: 'q5',
      type: 'single' as const,
      prompt: 'Where can you check whether a practice belongs to a closed or living tradition?',
      options: ['The Sanctuary’s closed and living traditions guide, and that community’s own teachers.', 'A shop label.', 'A random video.', 'Nowhere; just guess.'],
      correct: [0],
      points: 1,
      explanation: 'Use the guide and, when in doubt, ask the tradition’s own teachers or leave it out.',
    },
  ],
};

const quizCrisis = {
  id: 'quiz-core-founder-crisis-signposting',
  title: 'Mental health and crisis signposting',
  intro: 'Five questions on noticing, responding and pointing to help.',
  passPercent: 80,
  questions: [
    {
      id: 'q1',
      type: 'truefalse' as const,
      prompt: 'Asking someone directly whether they are thinking about ending their life can put the idea in their head.',
      options: ['True', 'False'],
      correct: [1],
      points: 1,
      explanation: 'Asking directly does not plant the idea; it tells the person you can hear the answer.',
    },
    {
      id: 'q2',
      type: 'single' as const,
      prompt: 'Someone is in immediate danger. What comes first?',
      options: ['A protection spell.', 'Calling the local emergency number (999, 911, 112).', 'A coven vote.', 'Waiting to see if it passes.'],
      correct: [1],
      points: 1,
      explanation: 'Immediate danger needs emergency services. Pray if you like, and call for help as well.',
    },
    {
      id: 'q3',
      type: 'single' as const,
      prompt: 'A member says spirits are telling them to stop their medication. What do you say?',
      options: ['Follow the spirits.', 'Don’t stop without your doctor; spiritual practice goes alongside care, never instead of it.', 'Try a stronger ritual.', 'That’s between you and the gods.'],
      correct: [1],
      points: 1,
      explanation: 'Never let spiritual practice replace treatment, and encourage them to speak to their doctor.',
    },
    {
      id: 'q4',
      type: 'multi' as const,
      prompt: 'Which can be signs of crisis? Choose all that apply.',
      options: ['Talking about being a burden', 'Giving possessions away', 'A sudden calm after deep distress', 'Asking a question about the moon'],
      correct: [0, 1, 2],
      points: 1,
      explanation: 'These are recognised warning signs. Take them seriously and ask.',
    },
    {
      id: 'q5',
      type: 'single' as const,
      prompt: 'Where are crisis lines listed for your members?',
      options: ['On the Sanctuary’s Support page, by country.', 'Nowhere.', 'Only in the coven chat.', 'In the coven’s Book, if you write them.'],
      correct: [0],
      points: 1,
      explanation: 'The Support page lists crisis, grief and other lines; put it in your coven’s welcome.',
    },
  ],
};

const quizLegal = {
  id: 'quiz-core-founder-legal-basics',
  title: 'Age, privacy and money',
  intro: 'Five questions on the legal-ish basics every founder needs.',
  passPercent: 80,
  questions: [
    {
      id: 'q1',
      type: 'single' as const,
      prompt: 'How old must coven members be?',
      options: ['16', '18 or over', 'Any age with a parent’s permission', 'Whatever the leader decides'],
      correct: [1],
      points: 1,
      explanation: 'Covens here are for adults only, 18 and over, with no exceptions.',
    },
    {
      id: 'q2',
      type: 'multi' as const,
      prompt: 'Which are good privacy practice? Choose all that apply.',
      options: ['Keeping members’ names and messages within the coven', 'Collecting only what you need', 'Photographing rites only with everyone’s agreement', 'Sharing the member list on social media'],
      correct: [0, 1, 2],
      points: 1,
      explanation: 'Being known as a witch can still cost people dearly. Keep things in the coven and collect little.',
    },
    {
      id: 'q3',
      type: 'single' as const,
      prompt: 'Your coven shares the cost of a room. What should you do?',
      options: ['Keep it in your own account and say nothing.', 'Say in writing what it is for and how much, keep a record, have two people look after it, and show it to members.', 'Charge more for advancement.', 'Lend the spare to a member.'],
      correct: [1],
      points: 1,
      explanation: 'Money handled openly, separately and by two people keeps trust.',
    },
    {
      id: 'q4',
      type: 'truefalse' as const,
      prompt: 'It is acceptable to require a paid class before a member can advance.',
      options: ['True', 'False'],
      correct: [1],
      points: 1,
      explanation: 'Advancement must never depend on paying. Paid work outside the coven stays separate.',
    },
    {
      id: 'q5',
      type: 'single' as const,
      prompt: 'What is the commonest real physical danger in ritual?',
      options: ['Fire', 'Crystals', 'Incense smell', 'Moonlight'],
      correct: [0],
      points: 1,
      explanation: 'Never leave a candle burning unattended, and keep water nearby.',
    },
  ],
};

const task = (slug: string, title: string, quiz: string, minutes: number, reflection: string, links: CourseModule['stages'][number]['tasks'][number]['links']) => ({
  title,
  kind: 'study' as const,
  instructions: `1. Read the lesson "${title}".\n2. Write your reflection (it stays private to you): ${reflection}\n3. Take the short test. The pass mark is 80%; you may take it again.`,
  times: 1,
  response: 'text' as const,
  checked_by: 'self' as const,
  minutes,
  docs: [`core-founder-${slug}`],
  quiz,
  links,
});

const module: CourseModule = {
  id: 'core-founder',
  title: 'Leading a coven: the founder’s training',
  docs: [
    {
      id: 'core-founder-holding-space',
      title: 'Holding space and consent',
      summary: 'What holding space means in practice, consent that is informed, specific and reversible, touch and sharing, and the leader’s own state.',
      minutes: 15,
      body: holdingSpace,
      links: [{ kind: 'page', id: 'support' }],
    },
    {
      id: 'core-founder-safeguarding',
      title: 'Safeguarding and boundaries',
      summary: 'Who may be vulnerable, the boundaries a leader keeps, how abuse of power begins, and when to refer someone to professionals.',
      minutes: 18,
      body: safeguarding,
      links: [{ kind: 'page', id: 'support' }],
    },
    {
      id: 'core-founder-rites-in-app',
      title: 'Running rites and meetings in the app',
      summary: 'Positions and agreements, planning and running gatherings, rituals together, meetings, messages, training, the Book, altars and the safety tools.',
      minutes: 15,
      body: ritesInApp,
      links: [
        { kind: 'page', id: 'together' },
        { kind: 'page', id: 'planner' },
        { kind: 'page', id: 'premade' },
      ],
    },
    {
      id: 'core-founder-conflict-endings',
      title: 'Conflict and endings',
      summary: 'A simple way through disagreements, what to do when rules are broken, and how members leave and covens close with care.',
      minutes: 14,
      body: conflictEndings,
      links: [{ kind: 'page', id: 'journal' }],
    },
    {
      id: 'core-founder-cultural-respect',
      title: 'Cultural respect and closed traditions',
      summary: 'Closed, living and open traditions, common borrowings and better choices, honest history, and welcoming people well.',
      minutes: 14,
      body: culturalRespect,
      links: [
        { kind: 'closed', id: '' },
        { kind: 'page', id: 'library' },
      ],
    },
    {
      id: 'core-founder-crisis-signposting',
      title: 'Mental health and crisis signposting',
      summary: 'Spiritual practice and mental health, the signs of crisis, what to do and where to point people for help.',
      minutes: 14,
      body: crisisSignposting,
      links: [{ kind: 'page', id: 'support' }],
    },
    {
      id: 'core-founder-legal-basics',
      title: 'Age, privacy and money',
      summary: 'The legal-ish basics: adults only, keeping members’ privacy, open handling of shared money, and a plain duty of care.',
      minutes: 13,
      body: legalBasics,
      links: [{ kind: 'page', id: 'support' }],
    },
  ],
  quizzes: [quizHoldingSpace, quizSafeguarding, quizRitesInApp, quizConflict, quizCultural, quizCrisis, quizLegal],
  stages: [
    {
      title: 'The founder’s training',
      intro:
        'Seven short modules for anyone founding a coven that strangers can find and join. Each has a lesson, a private reflection and a short test. Finish them all before you apply for your coven to be listed in Find a coven.',
      min_days: null,
      passed_by: 'self',
      tasks: [
        task('holding-space', 'Holding space and consent', quizHoldingSpace.id, 25, FOUNDER_REFLECTIONS['holding-space'], [{ kind: 'page', id: 'support' }]),
        task('safeguarding', 'Safeguarding and boundaries', quizSafeguarding.id, 30, FOUNDER_REFLECTIONS.safeguarding, [{ kind: 'page', id: 'support' }]),
        task('rites-in-app', 'Running rites and meetings in the app', quizRitesInApp.id, 30, FOUNDER_REFLECTIONS['rites-in-app'], [{ kind: 'page', id: 'together' }]),
        task('conflict-endings', 'Conflict and endings', quizConflict.id, 25, FOUNDER_REFLECTIONS['conflict-endings'], [{ kind: 'page', id: 'journal' }]),
        task('cultural-respect', 'Cultural respect and closed traditions', quizCultural.id, 25, FOUNDER_REFLECTIONS['cultural-respect'], [{ kind: 'closed', id: '' }]),
        task('crisis-signposting', 'Mental health and crisis signposting', quizCrisis.id, 25, FOUNDER_REFLECTIONS['crisis-signposting'], [{ kind: 'page', id: 'support' }]),
        task('legal-basics', 'Age, privacy and money', quizLegal.id, 20, FOUNDER_REFLECTIONS['legal-basics'], [{ kind: 'page', id: 'support' }]),
      ],
    },
  ],
};

export default module;
