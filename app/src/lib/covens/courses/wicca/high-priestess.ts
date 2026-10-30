// Wiccan high priesthood: the High Priestess and High Priest in Wicca (the
// third degree in public terms, authority and its limits), lineage, hiving
// and daughter covens, keeping the coven's Book of Shadows (what goes in it,
// oathbound material and privacy, credit and copyright), and leading the full
// Wiccan year with its rites of passage. Public material only. British
// spelling.

import type { CourseModule } from '../types';
import { closed, coven, page, ritual, spread } from '../linkHelpers.ts';

export default {
  id: 'wicca-high-priestess',
  title: 'Wiccan high priesthood',
  docs: [
    {
      id: 'wicca-high-priestess-the-high-priestess',
      title: 'The High Priestess and High Priest in Wicca',
      summary: 'What it means to lead a Wiccan coven: the High Priestess’s place in Wicca, the High Priest beside her, the third degree in public terms, representing the Goddess and God without claiming their authority, accountability, and the limits every coven leader must keep.',
      minutes: 16,
      links: [coven('manage'), coven('standing'), closed('initiatory-wicca'), page('patron')],
      body: `## A religion led by priestesses

From its beginning, Wicca has given women the leading place. In Gardner's covens, and in the traditions that grew from them, the **High Priestess** is the head of the coven: she leads its rites, decides who is trained and initiated, and holds the final word in the circle. The **High Priest** works beside her, as partner and support. In the 1950s this was remarkable; it remains one of Wicca's distinctive features.

Today, covens are led in many ways: by a High Priestess and High Priest together, by two priestesses or two priests, by one leader, or by a small group. In this Sanctuary the coven's leading position is whatever your coven calls it. This module speaks of the High Priestess and High Priest because those are Wicca's traditional titles, and you can read them as your coven's own.

## The third degree, in public terms

In the initiatory traditions, coven leadership usually requires the **third degree**: the fullest standing in the tradition. What happens in a third-degree rite is oathbound and is not described here. What has been publicly said is that it marks full priesthood, completes the initiate's training in the tradition's mysteries, and gives the standing to lead a coven independently and to found daughter covens.

In open and eclectic covens, leaders may have no degrees, or may use their coven's own stages. What matters is not the title but the training, experience and character behind it, and honesty about what that training was.

## Representing the Goddess and God

In Wicca, the High Priestess represents the Goddess in the circle, and the High Priest the God. At drawing down, the High Priestess may become, for a time, a vessel through which the Goddess speaks. This is a great honour and a great responsibility.

It is also the point at which coven leadership can go wrong. A High Priestess **represents** the Goddess in ritual; she is not the Goddess outside it. A High Priest stands for the God in the circle; he does not command members in daily life. Leaders who blur this, who expect members to treat them as divine, to obey them in personal matters, or to accept "the Goddess wills it" as the end of a discussion, have lost the meaning of the role. Teach your coven to tell the difference, and live by it yourself.

## Authority and its limits

A High Priestess's authority covers the coven's religious life:

- leading and planning its rites;
- deciding, with others where the coven's agreements say so, who is trained, dedicated and initiated;
- teaching, and keeping the tradition;
- keeping the coven's Book and confidences;
- upholding the coven's agreements.

It does not cover members' lives outside the coven: their relationships, jobs, money, medical choices, politics or friendships. And it never includes:

- **sex** with members as part of any rite or as a condition of anything;
- **money** beyond fair shared costs;
- **secrecy about harm;**
- **cutting members off** from family, friends or outside help.

## Accountability

Good Wiccan leaders are accountable:

- **to the gods,** in their own conscience;
- **to their coven,** through its agreements, open decisions, and members' freedom to raise concerns and to leave;
- **to their own teachers and elders,** in initiatory lines, who can be consulted when something is wrong;
- **to the wider community,** whose trust in Wicca depends on leaders behaving well;
- **to the law,** which applies inside the circle as outside it.

Build accountability into your coven: a written set of agreements, an elder or two who can speak frankly to you, a way for members to raise concerns about you with someone other than you, and the humility to listen.

## The High Priest

The High Priest's role in traditional Wicca is to support, partner and balance the High Priestess: to invoke the Goddess into her at drawing down, to lead the God's part in the sabbats, to share the teaching and care of the coven, and to speak honestly to her when she needs it. In some traditions, the High Priest has particular responsibility for the coven's men, or for its practical life. He is a priest in his own right, not a deputy.

## The Witch Queen

In some initiatory traditions, a High Priestess from whose coven daughter covens have hived off is honoured with the informal title **Witch Queen**. It is a mark of respect for a teacher of teachers, not a rank of command over other covens, which in most Wicca are independent.

## Leading without burning out

Leading a coven is demanding. The core lessons on leading a coven covered burnout and sustainability. In Wicca specifically: share the leading of rites, train your Maiden and Summoner to take parts, take a sabbat off now and then, and keep your own daily devotion, so that you meet the gods for yourself and not only on others' behalf.

> **Your coven:** Talk with your current High Priestess about how leadership will pass or be shared, what titles your coven uses, and what accountability your coven has in place.

> **Try this:** Write a page in your Book of Shadows: what the title High Priestess (or your coven's name for it) will mean for you, what you will never do with it, and who you will ask to hold you to that.

## What's old and what's modern

- **Old:** priestesses leading worship in many ancient religions; priestesses speaking for a goddess.
- **Modern:** the Wiccan High Priestess and High Priest, the third degree and the Witch Queen, from the 1950s onwards.`,
    },
    {
      id: 'wicca-high-priestess-lineage-and-hiving',
      title: 'Lineage, hiving and daughter covens',
      summary: 'How lineage works in Wicca and how to keep it honestly, hiving off a daughter coven (when, how, and the relationship afterwards), the autonomy of covens, and what an open coven can say truthfully about where its teaching comes from.',
      minutes: 15,
      links: [coven('lineage'), coven('book'), closed('initiatory-wicca'), coven('manage')],
      body: `## Lineage

In initiatory Wicca, **lineage** is the line of initiators that runs from each initiate back to the founders: "I was initiated by A, who was initiated by B, who was initiated by C..." back to Gerald Gardner's or Alex Sanders's covens. Lineage is how initiatory Wiccans recognise one another, and how a seeker can check that a coven is what it says it is.

Open and eclectic covens may have no lineage in this sense, or may trace a line of teachers. Both are honourable; the only dishonour is in claiming a lineage you do not have.

## Keeping lineage honestly

As a coven leader, you are responsible for the coven's lineage record:

- **Record initiations** accurately: who was initiated, by whom, when, and into which degree.
- **Keep the record safely,** and private where members' identities need protecting.
- **Answer honestly** when serious seekers or other initiates ask about your lineage, within the bounds of your tradition's customs.
- **Never invent or inflate** a lineage: no hereditary lines you cannot trace, no initiations you did not receive.
- **If you are an open coven,** say so plainly: "We're an eclectic Wiccan coven; our founder trained with X, and we draw on published sources."

## Hiving

When a coven grows large, or when an experienced member is ready to lead, the coven may **hive off**: a new, daughter coven is founded, led by someone trained in the mother coven. The word comes from bees, who swarm to form a new hive when the old one is full.

### When to hive

A coven might hive when:

- it has grown beyond the size where everyone can know and trust each other (often around ten to thirteen);
- a member has the training, experience and standing to lead, and the wish to;
- members live far apart and a second coven would serve them better;
- a member's calling differs from the coven's in a way that is best served by a new coven, with goodwill.

Hiving should never be a way to push someone out, and a split in anger is not a hive, though even that can, with time and care, be healed.

### How to hive well

1. **Talk early and openly** with the member who will lead, and with the coven.
2. **Make sure the new leader is ready:** training, degree (in initiatory traditions), experience leading rites, and good character.
3. **Agree who goes:** members choose freely which coven to join.
4. **Agree what goes:** the new coven's Book of Shadows, its tools, and what it may teach.
5. **Mark the hiving** with a rite: a blessing of the new coven and its leaders, often with a gift.
6. **Set up the new coven** in the app as a daughter coven, so the line between them is kept.

## Preparing the new leader

Before a hiving, the person who will lead the daughter coven needs more than the right degree. In the months before, give them real practice:

- let them lead whole sabbats and esbats in the mother coven, with you present but not leading;
- let them mentor a newcomer through a program, with your support;
- talk through hard situations they may meet: a member in crisis, a conflict, a request they should refuse;
- help them write their coven's agreements and plan their first year;
- agree how they can reach you for advice, and how often you will meet in the first year.

A daughter coven that begins with a confident, well-supported leader is far more likely to flourish.

## Autonomy

In most Wicca, each coven is **autonomous**: it governs itself. A mother coven does not command its daughters. The relationship is more like that of a parent and an adult child: respect, friendship, advice when asked, and perhaps shared rites at the great sabbats. Some initiatory traditions keep more formal ties, with the Witch Queen or elders consulted on serious matters. Agree the relationship at the time of hiving, and revisit it as the years pass.

## When a daughter coven goes wrong

Sometimes a daughter coven develops problems: a leader who abuses their position, teaching that departs badly from the tradition, harm to members. Because covens are autonomous, the mother coven usually cannot simply step in. But it can:

- speak frankly to the daughter coven's leaders;
- offer support and a safe place to members who leave;
- in initiatory traditions, make clear that the daughter coven no longer represents the line, if things are serious;
- encourage anyone harmed to seek help from the authorities where harm is a crime.

## Working with other covens

Beyond your own line, you will meet covens of other traditions. Good relations help everyone:

- join open sabbats, pagan federations and moots;
- share teaching and support with neighbouring covens;
- respect each tradition's own customs and oaths;
- warn others, carefully and fairly, about genuine dangers, such as a person known to have harmed members, and never spread gossip.

> **Your coven:** Ask your High Priestess about the coven's lineage or line of teachers, how it records initiations, and how it has hived, or would hive, in the past.

> **Try this:** Write your coven's line, as far as you know it and may share it, in your Book of Shadows. If you don't know it, ask.

## What's old and what's modern

- **Old:** chains of teachers and initiators in many religions and esoteric orders.
- **Modern:** Wiccan lineage and hiving, from the 1950s and 1960s onwards.`,
    },
    {
      id: 'wicca-high-priestess-the-coven-book',
      title: 'Keeping the coven’s Book of Shadows',
      summary: 'The coven’s Book of Shadows as the coven’s memory: what goes in it, how it grows and is revised, what belongs only on paper (oathbound material and an online book), who may read what, crediting authors and respecting copyright, and handing it on.',
      minutes: 15,
      links: [coven('book'), page('grimoire'), coven('record'), closed('initiatory-wicca')],
      body: `## The coven's memory

Every Wiccan coven keeps a **Book of Shadows**: the book of its rites, teachings and history. In initiatory traditions, the core of it is copied by hand from initiator to initiate, and each coven adds its own pages. In open covens, it is the coven's own creation. Either way, the High Priestess is its keeper.

The origin of the name is uncertain. Gardner's early manuscript was titled Ye Bok of ye Art Magical; the name "Book of Shadows" appeared in the 1950s, perhaps from a magazine article Gardner read. It now means any Wiccan's or coven's book of the Craft.

## What goes in it

A coven's Book usually holds:

- **the coven's rites:** the shape and words of its circle, quarters, sabbats, esbats, dedications and other rites, as the coven keeps them;
- **teachings:** the coven's understanding of the Goddess and God, its ethics, its customs;
- **liturgy:** the Charge, invocations, chants, poems, with their authors;
- **craft knowledge:** tested correspondences, recipes for incense and oils, herb lore, with safety notes;
- **the coven's history:** its founding, its leaders, its hivings, its great rites;
- **its agreements:** the coven's rules and what members have agreed.

It does not usually hold members' personal confidences, which belong in private records if anywhere.

## Growing and revising

A living coven's Book grows. As High Priestess:

- **date every page,** and note who wrote it;
- **keep old versions** when you revise a rite, so the coven's history is not lost;
- **invite contributions:** members write pages, which you review before adding;
- **correct errors openly,** especially historical ones: "We used to teach that this was ancient; we now know it dates from the 1970s."

In initiatory traditions, the core material is kept as received, and changes are made in additional pages, not by editing what was handed down.

## Paper and the app

The coven's Book in this app lives online, and its leaders decide which members can read which pages. This makes it easy to share, search and keep safe from fire or loss. But think about what belongs there:

- **Open material** (your coven's own rites, public teachings, recipes, history) is well suited to the app.
- **Oathbound material** from an initiatory tradition may have its own rules: many traditions require it to be copied by hand and kept on paper, and not stored online at all. Follow your tradition's rules. If in doubt, keep it on paper.
- **Members' identities and confidences** need the most care. Keep them out of the Book, and use the members' record only for what the coven truly needs.

Whatever you keep online, remember that anything stored on a server can, in principle, be exposed. Write as though a page might one day be read by someone outside the coven, and keep the truly secret on paper.

## Your own book and the coven's

Each member keeps their own Book of Shadows as well as reading the coven's. Encourage it. A member's own book is theirs: their experiences, workings, dreams and doubts. The coven's Book is shared: its rites and teaching. When a member copies coven material into their own book, remind them that the coven's confidentiality still applies to those pages, and that their own reflections belong to them alone. A High Priestess never asks to read a member's private book.

## Who may read what

Many covens have levels: pages for everyone, pages for dedicants, pages for initiates, pages for each degree. Decide this deliberately, record it, and review it when people's standing changes. When someone leaves the coven, remove their access with courtesy, and remind them gently of what they agreed to keep private.

## Crediting authors and respecting copyright

Much Wiccan liturgy has authors: Doreen Valiente's Charge and many of her poems, the Farrars' rites, Starhawk's chants, and many more. Good practice:

- **credit the author** on every page that uses their work;
- **respect copyright:** copying a published text into a private coven book for worship is common practice, but republishing it in public (on a website, in a printed booklet for sale) usually needs permission;
- **write your own:** a coven that writes its own liturgy alongside the classics has a living tradition.

## Safety in the Book

Craft knowledge passed down in books has sometimes included dangerous advice: herbs taken internally that are toxic, oils used undiluted on skin, fire practices that are unsafe indoors. As keeper, review recipes and practices for safety, add clear warnings, and remove or correct anything that could hurt someone. A coven's Book should never be the reason a member was harmed.

## Handing it on

A Book of Shadows outlives its keepers. Plan for it:

- name who will keep the Book if you step down or die;
- when a daughter coven hives, agree what it takes;
- if the coven closes, decide what happens to the Book: given to a trusted coven, kept by a member, or, for oathbound material, destroyed according to the tradition's custom.

> **Your coven:** Ask your High Priestess what is kept in the coven's Book, what is kept on paper only, who may read which pages, and who will keep it after her.

> **Try this:** Choose one rite the coven keeps often. Write it up properly for the coven's Book: date, author, sources and credits, safety notes, and the words. Ask your High Priestess to review it.

## What's old and what's modern

- **Old:** handwritten books of magic, the grimoires, from the Middle Ages onwards.
- **Modern:** the Wiccan Book of Shadows (1950s onwards), and keeping it online (now).`,
    },
    {
      id: 'wicca-high-priestess-leading-the-year',
      title: 'Leading the Wiccan year and its rites of passage',
      summary: 'Holding the whole Wiccan year for a coven: planning the sabbats and esbats, drawing down and divination as the coven’s leader, and the rites of passage a High Priestess is asked to lead (Wiccanings, handfastings, croning and saging, and rites for the dead), with the ethics of leading worship.',
      minutes: 17,
      links: [page('calendar'), coven('ritual-builder'), spread('year-ahead'), spread('patron-deity'), ritual('kitchen-solitary-rite-of-passage'), page('divination')],
      body: `## The whole year

As High Priestess, you hold the Wiccan year for your coven: eight sabbats, twelve or thirteen esbats, training, dedications and initiations, and the rites that mark members' lives. Holding it well means planning ahead, sharing the work, and keeping the gods, not the calendar, at the centre.

## Planning the year

At Samhain, the Wiccan new year, many High Priestesses sit down with their High Priest and elders to plan:

1. **The sabbats:** dates, places (indoors or out), who leads, which are open to guests, which story each will tell.
2. **The esbats:** dates, the coven's workings, who will draw down, if your coven does.
3. **Training:** who is on which program, who mentors whom, when dedications and initiations might fall.
4. **Rites of passage** already known: handfastings, Wiccanings, rites for elders.
5. **Rest:** months with fewer demands, a sabbat the leaders will attend without leading.

Put it in the coven's calendar in the app, so everyone can plan. Review it at each sabbat.

## Drawing down as leader

If your coven practises drawing down, the High Priestess is usually the one in whom the Goddess is invoked. This asks particular care:

- **keep your own practice** deep, so you come to the rite grounded;
- **have a trusted watcher,** every time;
- **hold inspired words lightly,** as the elder lessons taught: never use them to direct members' lives, and never let anyone treat them as commands;
- **be honest** with yourself and your coven when a drawing down was strong and when it was mostly the Charge spoken well. Both are fine.

## Divination as leader

Covens often look to their High Priestess for divination: for the coven's year, for members, for decisions. Divination can be a fine servant of discernment. As leader:

- **read for the coven openly,** sharing the cards or runes, not only your interpretation;
- **never make a decision** about a member's training or standing by divination alone;
- **ask consent** before reading for any member, and keep their readings confidential;
- **say what you don't know.**

## Rites of passage

Members will ask you to mark the great moments of their lives. These rites are among the most meaningful a High Priestess leads. Your coven may have its own forms; these are the common ones in public Wiccan practice.

### Wiccaning

A **Wiccaning** (or naming) welcomes a baby or child to the community and asks the Goddess and God's blessing on them. It is not an initiation: Wiccans traditionally hold that a child should choose their own religion when grown. A simple form: the circle cast, the child presented to the quarters and the gods, a name given, blessings and gifts from those present, and a promise from the parents and community to love and support the child.

### Handfasting

A **handfasting** is a Wiccan wedding, in which the couple's hands are bound with a cord. It may be "for a year and a day", "for life" or "for as long as love shall last". Check whether a handfasting can be a legal marriage where you live, and if so, whether you are authorised to perform one; if not, couples will need a civil ceremony too. Marry only couples who choose each other freely. A **handparting** is the Wiccan rite for a couple who separate, releasing each other with goodwill.

### Croning and saging

Many Wiccan covens mark the passage into elderhood with a **croning** (for women) or **saging** (for men), and some now with rites for anyone, often at around fifty or sixty, or at menopause or retirement. It honours wisdom and the Crone or Sage aspect of the gods. Let the person choose whether and when.

### Rites for the dead

When a member dies, the coven may hold a **requiem**: a rite of farewell, in which the dead member is remembered, their journey to the Summerland is blessed, and the coven comforts one another. Respect the family's wishes, and the member's own, which it helps to ask about in life. Many Wiccans now write down their wishes for their funeral.

## The ethics of leading worship

Some principles for every High Priestess:

- **The gods first.** The rite is for them and the coven, not for your reputation.
- **Consent always.** In every rite, every member can say no.
- **Honesty.** Teach what is old as old and what is new as new; never claim more than you know.
- **Inclusion.** Make room in the circle for everyone the coven welcomes.
- **Care.** Watch over people before, during and after rites.
- **Humility.** You will make mistakes. Own them.

> **Safety:** Rites of passage often involve families, children and guests who don't know Wiccan ways. Explain what will happen beforehand, keep fire safe around children, provide seats, and keep alcohol optional.

> **Your coven:** Ask your High Priestess how the coven plans its year, who draws down, and what rites of passage it has held and how.

> **Try this:** Plan the coven's next full year in outline, from Samhain to Samhain, in the coven's calendar or your Book of Shadows, and ask your High Priestess to review it.

## What's old and what's modern

- **Old:** naming, marriage, elder and funeral rites in every culture; the binding of hands in some old marriage customs.
- **Modern:** Wiccanings, handfastings, handpartings, croning and saging, and the requiem as Wiccan rites, from the 1960s onwards.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wicca-high-priestess',
      title: 'Wiccan high priesthood: test',
      intro: 'Eleven questions on the High Priestess and High Priest, lineage and hiving, the coven’s Book of Shadows, and leading the Wiccan year and its rites of passage. Most are scored at once; the written answers are scored against a rubric. You need 80% to pass.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'What is the right understanding of a High Priestess representing the Goddess?',
          options: [
            'She is the Goddess, in and out of the circle, and must be obeyed',
            'She represents the Goddess in ritual, but holds no divine authority over members’ lives',
            'She may speak for the Goddess on members’ personal decisions',
            'Representation means nothing at all',
          ],
          correct: [1],
          points: 1,
          explanation: 'Representing the Goddess in the circle is an honour and a responsibility. Leaders who expect to be treated as divine outside it have lost the meaning of the role.',
        },
        {
          id: 'q2',
          type: 'multi',
          prompt: 'Which lie outside a High Priestess’s authority? Choose all that apply.',
          options: ['Members’ relationships and jobs', 'Planning and leading the coven’s rites', 'Members’ medical choices', 'Asking members for sex as part of a rite'],
          correct: [0, 2, 3],
          points: 1,
          explanation: 'Her authority covers the coven’s religious life, never members’ private lives, and never sex, money beyond fair costs, or secrecy about harm.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'What is "hiving" in Wicca?',
          options: [
            'Expelling a member',
            'Founding a daughter coven, led by someone trained in the mother coven',
            'Keeping bees for mead',
            'Merging two covens',
          ],
          correct: [1],
          points: 1,
          explanation: 'As bees swarm from a full hive, a coven may hive off a daughter coven when it grows or a member is ready to lead.',
        },
        {
          id: 'q4',
          type: 'truefalse',
          prompt: 'In most Wicca, a mother coven commands its daughter covens.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. Covens are usually autonomous; the relationship is one of respect and friendship, agreed at the hiving.',
        },
        {
          id: 'q5',
          type: 'single',
          prompt: 'An open, eclectic coven is asked about its lineage. What is the honest answer?',
          options: [
            'Claim descent from Gardner to sound credible',
            'Say plainly that it is eclectic, and where its teaching comes from',
            'Refuse to discuss it',
            'Invent a hereditary line',
          ],
          correct: [1],
          points: 1,
          explanation: 'Open covens have nothing to hide. The only dishonour is in claiming a lineage you do not have.',
        },
        {
          id: 'q6',
          type: 'multi',
          prompt: 'Which are good practice for the coven’s Book of Shadows? Choose all that apply.',
          options: [
            'Dating pages and noting who wrote them',
            'Crediting authors such as Doreen Valiente',
            'Storing a tradition’s oathbound material online against its rules',
            'Correcting historical errors openly',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'Follow your tradition’s rules for oathbound material, which often require it to be kept on paper. Credit authors and correct errors openly.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'What is a Wiccaning?',
          options: [
            'The initiation of a child into Wicca',
            'A welcome and blessing of a child, not an initiation; the child may choose their own religion when grown',
            'A Wiccan wedding',
            'A funeral',
          ],
          correct: [1],
          points: 1,
          explanation: 'Wiccans traditionally hold that a child should choose their own path when grown; a Wiccaning welcomes and blesses them.',
        },
        {
          id: 'q8',
          type: 'truefalse',
          prompt: 'A handfasting is always a legal marriage.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. It depends on the law where you live and whether the celebrant is authorised; otherwise couples need a civil ceremony too.',
        },
        {
          id: 'q9',
          type: 'single',
          prompt: 'How should a High Priestess use divination about a member’s readiness for initiation?',
          options: ['Decide by the cards alone', 'As one aid to discernment, never the sole basis, with consent and confidentiality', 'Never for anything at all', 'Publicly, for the whole coven to discuss'],
          correct: [1],
          points: 1,
          explanation: 'Divination can serve discernment, but decisions about people rest on their practice, conversation and the coven’s agreements.',
        },
        {
          id: 'q10',
          type: 'long',
          prompt: 'Describe the accountability you would put in place as High Priestess (or your coven’s leading position): to whom you would answer, how members could raise concerns about you, and what you would never do with the role.',
          points: 4,
          explanation: 'Good leaders build accountability into their covens and know the limits of their authority.',
          rubric: 'Full marks (4): names at least two forms of accountability, such as written agreements, elders, outside teachers, the law (1); describes a way for members to raise concerns about the leader with someone other than the leader (1); names clear limits, including sex, money and secrecy about harm (1); shows humility and understanding of representing the gods without claiming their authority (1).',
        },
        {
          id: 'q11',
          type: 'short',
          prompt: 'Outline your plan for the coven’s next year, from Samhain to Samhain: the sabbats, esbats, training and rest.',
          points: 3,
          explanation: 'A good plan holds the whole year, shares the work and leaves room to rest.',
          rubric: 'Full marks (3): includes all eight sabbats and regular esbats (1); shares leading among members and includes training milestones (1); includes rest or reduced demands for the leaders (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'Wiccan high priesthood',
      intro: 'Here you prepare to lead a Wiccan coven: what the High Priestess and High Priest are and are not, lineage and hiving, keeping the coven’s Book of Shadows, and holding the whole Wiccan year with its rites of passage. You work closely with your current High Priestess, and plan the coven’s year.',
      passed_by: 'manager',
      tasks: [
        {
          title: 'What your title means',
          kind: 'reflection',
          instructions: `1. Read "The High Priestess and High Priest in Wicca".
2. Do the "Try this": write what the title will mean for you, what you will never do with it, and who will hold you to that.
3. In the answer box, share it with your High Priestess.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 45,
          docs: ['wicca-high-priestess-the-high-priestess'],
          links: [coven('standing')],
        },
        {
          title: 'The coven’s line',
          kind: 'meeting',
          instructions: `1. Read "Lineage, hiving and daughter covens".
2. Meet your High Priestess to talk through the coven's lineage or line of teachers, how it records initiations, and how it would hive.
3. Write the line in your Book of Shadows, as far as you may.`,
          times: 1,
          response: 'none',
          checked_by: 'manager',
          minutes: 60,
          docs: ['wicca-high-priestess-lineage-and-hiving'],
          links: [coven('lineage')],
          solitary: 'Write the honest story of where your own Wicca comes from: your teachers, books and influences, in order, and what you would say to a seeker who asked about your training.',
        },
        {
          title: 'Write up a rite for the Book',
          kind: 'book',
          instructions: `1. Read "Keeping the coven's Book of Shadows".
2. Write up one of the coven's regular rites properly for its Book: date, author, sources and credits, safety notes, and the words.
3. Send it to your High Priestess for review, and note in the answer box what you decided belongs on paper only.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 90,
          docs: ['wicca-high-priestess-the-coven-book'],
          links: [coven('book')],
          solitary: 'Write up one rite you keep often for your own Book of Shadows in the same careful way, with sources, credits and safety notes.',
        },
        {
          title: 'Plan the year',
          kind: 'ritual',
          instructions: `1. Read "Leading the Wiccan year and its rites of passage".
2. Plan the coven's next year from Samhain to Samhain: sabbats, esbats, training, rites of passage you know of, and rest.
3. In the answer box, give an outline, and ask your High Priestess to review it.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 120,
          docs: ['wicca-high-priestess-leading-the-year'],
          links: [page('calendar'), coven('ritual-builder')],
          solitary: 'Plan your own Wiccan year from Samhain to Samhain in the same way, including any open rites you might lead for a moot or friends.',
        },
        {
          title: 'Lead a rite of passage',
          kind: 'ritual',
          optional: true,
          instructions: `1. If a member asks for a rite of passage (a Wiccaning, handfasting, croning or saging, or a requiem), plan and lead it with your High Priestess.
2. In the answer box, write how you prepared, how you explained it to guests, and what you learned.`,
          times: 1,
          response: 'text',
          checked_by: 'manager',
          minutes: 180,
          docs: ['wicca-high-priestess-leading-the-year'],
          links: [ritual('kitchen-solitary-rite-of-passage')],
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Re-read any lesson you're unsure of.
2. Take the test. The choice questions are scored at once; your High Priestess scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 30,
          quiz: 'quiz-wicca-high-priestess',
          links: [coven('manage')],
        },
      ],
    },
  ],
} satisfies CourseModule;
