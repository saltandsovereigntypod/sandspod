// Wicca: the tradition itself. What Wicca is, its history told honestly
// (Leland, Murray, Gardner, Valiente and the Charge of the Goddess, the
// Sanders, Buckland, Cunningham and the eclectic turn), the lineages and what
// is oathbound, the Goddess and the God and the many ways Wiccans understand
// them, Wiccan ethics (the Rede and the Threefold Law as later and variously
// held), and what a Wiccan coven does. Public material only; nothing here is
// from an oathbound Book of Shadows. The Wheel's own history is taught in
// wheel-tradition and linked, not repeated. British spelling.

import type { CourseModule } from '../types';
import { closed, coven, deity, holy, journey, page, ritual } from '../linkHelpers.ts';

export default {
  id: 'wicca-tradition',
  title: 'The Wiccan tradition',
  docs: [
    {
      id: 'wicca-tradition-what-wicca-is',
      title: 'What Wicca is',
      summary: 'Wicca as a religion: its shape (the Goddess and God, the sabbats and esbats, the circle, magic and priesthood), the words you will meet, how Wicca relates to witchcraft and to wider paganism, and how this course’s core skills fit it.',
      minutes: 16,
      links: [journey('path-wicca'), deity('wiccan_goddess'), deity('horned_god'), page('calendar'), page('library')],
      body: `## A religion, not only a craft

Wicca is a modern pagan religion. That word, religion, matters. Many people today call themselves witches and practise magic without any particular gods or worship; that is witchcraft as a craft, and it is a fine thing. Wicca is something more specific: a religion of witchcraft, in which magic is practised within a relationship of worship with a Goddess and a God, in a sacred circle, through a cycle of seasonal and lunar rites.

So a Wiccan is a witch, in Wicca's own understanding, but not every witch is a Wiccan. You will meet witches who are Heathens, Hellenic polytheists, Christians, atheists or simply eclectic. Being clear about this saves a great deal of confusion.

## The shape of the religion

Most forms of Wicca have these features in common.

### The Goddess and the God

Wicca sees the divine as having two great faces, a Goddess and a God, whose relationship is the life of the world. The Goddess is often linked with the moon, the earth, the sea, birth and the mysteries of the body; the God with the sun, the horned beasts and the wild, the grain that is cut and grows again, and the journey through death to rebirth. Behind them, some Wiccans speak of a single source of all, beyond names. A later lesson in this module explores the many ways Wiccans understand them.

### The turning year

Wiccans keep eight festivals, the sabbats: Samhain, Yule, Imbolc, the spring equinox, Beltane, Midsummer, Lammas and the autumn equinox. In Wicca these are not only seasonal markers but the chapters of a sacred story: the God born at midwinter, growing with the light, joining with the Goddess in spring, ripening in summer, giving his life in the harvest and passing into the dark to be reborn. The lore module tells this story festival by festival.

### The moon

Wiccans meet at the full moon, and some at the new or dark moon, for rites called esbats. The esbat is especially the Goddess's rite, and the usual time for magic.

### The circle

Wiccan rites take place in a circle cast for the purpose: a space made sacred, set apart from ordinary time and place, often described as "between the worlds". The four directions and the elements (air, fire, water, earth) are called at its edges. The circle both protects and contains: it keeps out what is not wanted and holds in the power raised inside until it is sent out.

### Magic

Wicca includes magic as part of religious life: healing, protection, blessing and the work of changing oneself and the world for the better. It is usually done in the circle, with the gods' blessing, alongside ordinary action, never instead of it.

### Priesthood

In Wicca, every initiate is regarded as a priestess or priest: there is no lay congregation watching a professional clergy. Even in open, eclectic Wicca, each person is expected to meet the gods directly. Covens are led by a High Priestess, often with a High Priest, but leading is a service, not a barrier between members and the divine.

## The vocabulary

You will meet these words often. Each is taught in depth later.

- **Coven:** a small group of Wiccans who work together, traditionally no more than thirteen.
- **Sabbat:** one of the eight seasonal festivals.
- **Esbat:** a rite at the full moon (or another phase).
- **Circle:** the sacred space cast for a rite.
- **Quarters:** the four directions and their elements, called at the circle's edge.
- **Athame** (a-THAH-may or ATH-a-may): the ritual knife, used to cast the circle and direct power, not to cut.
- **Book of Shadows:** a Wiccan's book of rites and teachings. In initiatory Wicca, the coven's book is oathbound and copied by hand; in open Wicca, it is each person's own record.
- **Blessed be:** a common Wiccan blessing, greeting and farewell.
- **Deosil** (JESH-il) and **widdershins:** sunwise (clockwise) and against the sun (anticlockwise).
- **Skyclad:** working naked, as some traditional covens do. Never required of a newcomer.

## Wicca and wider paganism

Wicca is one of the largest and most influential modern pagan religions, and many things that are now common across paganism, including the circle, the calling of quarters, the eight sabbats and the word esbat, spread outwards from it. Your coven may share festivals and friendships with Druids, Heathens and eclectic pagans. Wicca is not the parent of all of these, nor the only true form of witchcraft; it is one tradition among several, with its own particular shape.

The Wheel of the Year, in particular, grew up alongside Wicca, and many eclectic pagans keep it without being Wiccan. If you want the history of the eight festivals themselves, this course links you to the Wheel of the Year lessons rather than repeat them.

## How the core skills fit

The core lessons of this course (energy, grounding, raising and directing power, sacred space, the altar and tools, correspondences, the moon, divination and spellcraft) are tradition-neutral. In Wicca they all have a home:

- **Grounding and centring** come before and after every rite.
- **Sacred space** is, for Wiccans, the cast circle with its quarters, taught in the ritual module.
- **Raising power** is done in the circle, often by chanting and dancing deosil, and sent out at the height of the rite.
- **The altar and tools** have particular Wiccan forms and meanings: the athame, wand, chalice, pentacle and censer.
- **The moon** shapes the esbats; **the seasons** shape the sabbats.

> **Your coven:** Your coven will have its own way of doing almost everything in this module. Where this course describes "most Wiccans", ask your mentor how your coven does it.

> **Try this:** In your Grimoire, start a page called "Words of the Craft". Add each new term as you meet it, with its meaning in your own words.

## What's old and what's modern

- **Old:** many of the materials Wicca was built from, such as ceremonial magic, folk custom and the ancient gods it honours.
- **Modern:** Wicca as a religion, its theology of the Goddess and God, and its rites, from the 1940s onwards.`,
    },
    {
      id: 'wicca-tradition-history',
      title: 'How Wicca began: an honest history',
      summary: 'Where Wicca came from, as historians now understand it: Leland’s Aradia and Murray’s witch-cult theory, Gerald Gardner and the New Forest story, Doreen Valiente and the Charge of the Goddess, and how Wicca spread through the Sanders, Buckland and the books of the 1970s and 1980s.',
      minutes: 20,
      links: [closed('initiatory-wicca'), journey('path-wicca'), deity('aradia'), deity('diana'), page('library')],
      body: `## Why honest history matters

Older books often tell Wicca's story as the secret survival of a Stone Age religion, hidden through the witch trials and handed down in families. Historians, and most Wiccans today, now agree that this is not what happened. The real story is more interesting, and it frees you to love Wicca for what it is: a religion made by gifted, imperfect people in the twentieth century, from older materials, which has since become real in the lives of many thousands. The best book on this history is Ronald Hutton's The Triumph of the Moon (1999).

## The materials

Several things came together before Wicca existed.

- **Ceremonial magic.** The Hermetic Order of the Golden Dawn (founded 1888) and the magician Aleister Crowley developed rituals with a cast circle, the four elements at the quarters, tools tied to the elements, and invocations of gods. The Wiccan circle owes them a great deal.
- **Freemasonry and its offshoots.** The idea of a secret society with degrees of initiation, oaths and a ritual book came from this world. Gardner himself was a Co-Mason.
- **Charles Godfrey Leland.** In 1899 this American folklorist published Aradia, or the Gospel of the Witches, which he said came from an Italian witch called Maddalena. It tells of Aradia, daughter of the goddess Diana, sent to teach witchcraft to the poor, and has the witches meet at the full moon, naked, to worship Diana and share cakes and wine. Whether Maddalena's material was genuine folk tradition, her own invention or Leland's is still debated, but several of its images passed into Wicca.
- **Margaret Murray.** In The Witch-Cult in Western Europe (1921) and The God of the Witches (1931), this Egyptologist argued that the people accused at the witch trials belonged to an organised pagan fertility religion, worshipping a horned god in covens of thirteen at four great sabbats. Historians have shown that the trial records do not support this, and that she read them selectively. But her picture of the witches shaped Wicca's coven, its sabbats and its Horned God, and she wrote a friendly foreword to Gardner's Witchcraft Today.
- **Romantic paganism and folklore.** Poets and writers such as Robert Graves (The White Goddess, 1948) and Rudyard Kipling, and the folklore of the English countryside, supplied images of the Goddess and the old gods of the land.

## Gerald Gardner

Gerald Brosseau Gardner (1884 to 1964) was a retired civil servant who had spent most of his working life in Malaya and became an enthusiastic amateur folklorist. Settling in the New Forest in the late 1930s, he joined a group of occultists linked with the Rosicrucian Order Crotona Fellowship. Gardner said that through some of them he was initiated in 1939 into a surviving witch coven.

Historians disagree about how much of this is true. Some, such as Philip Heselton, have found evidence that there was a real group of people Gardner worked with; others, such as Hutton, think that whatever Gardner found, the religion he later made public was largely his own work, assembled from the materials above. What is clear is that by the late 1940s Gardner had a coven of his own, meeting near St Albans, and a working book of rites drawing heavily on Crowley, Leland and Masonic ritual.

After the Witchcraft Act of 1735 was repealed in 1951, Gardner went public. He published Witchcraft Today in 1954 and The Meaning of Witchcraft in 1959, and earlier, in 1949, a novel, High Magic's Aid, that showed some of the practices in fictional form. He called the religion "the Wica" (with one c). He sought publicity, and the newspapers obliged, not always kindly.

## Doreen Valiente and the Charge of the Goddess

Doreen Valiente (1922 to 1999) was initiated by Gardner in 1953 and became his High Priestess. She recognised much of Crowley's writing in Gardner's book and, being a gifted poet, set about rewriting it. A great deal of the Wiccan liturgy known today is hers.

Her best-known work is the **Charge of the Goddess**, the words in which the Goddess speaks to her worshippers. Gardner's earlier version had stitched together passages from Leland's Aradia and from Crowley. Valiente rewrote it, first in verse and then in the prose version that became famous, keeping a few of the borrowed lines but making most of it new. The Charge is now read in Wiccan circles around the world, and many people who have never heard of Valiente know its words. Knowing that it was written by a twentieth-century woman, drawing on a nineteenth-century folklorist and an Edwardian magician, does not lessen it. It is honest to say who wrote it.

Valiente left Gardner's coven in 1957 after disagreements, including over Gardner's appetite for publicity and a set of "Laws" he produced as though they were ancient. She went on writing and teaching for the rest of her life, and in later books, such as Witchcraft for Tomorrow (1978), she offered rites of her own for anyone to use, helping make Wicca available outside the initiatory covens.

## How Wicca spread

- **The Alexandrian line.** In the 1960s Alex Sanders and Maxine Sanders, in Manchester and then London, built a tradition on Gardnerian material with more ceremonial magic added. Their students Janet and Stewart Farrar later published much traditional material, with Valiente's help, in Eight Sabbats for Witches (1981) and The Witches' Way (1984).
- **To America.** Raymond and Rosemary Buckland were initiated in Britain in 1963 and brought Gardnerian Wicca to the United States. Raymond Buckland later founded Seax-Wica (1973), an open tradition with its own published book.
- **The 1970s and 1980s.** New traditions grew: Dianic Wicca, centred on the Goddess, through Zsuzsanna Budapest; the Reclaiming tradition, which joined Wicca with political and ecological activism, through Starhawk, whose The Spiral Dance (1979) was hugely influential. Margot Adler's Drawing Down the Moon (1979) described the whole pagan scene for a wide readership.
- **Solitary and eclectic Wicca.** Scott Cunningham's Wicca: A Guide for the Solitary Practitioner (1988) told readers that they could practise Wicca alone, without initiation, and gave them the means. It was followed by a flood of books, and later by websites. Most people who call themselves Wiccan today learned this way.

## What this means for you

1. Wicca is a modern religion from older materials. Ask of any practice: how old is this, and where does it come from?
2. The founders were real people, with gifts and faults. You can honour Gardner's vision and Valiente's poetry without believing every claim either made.
3. Wicca has always grown by people adding to it. Your coven is part of that history.

> **Note:** You will still read that nine million people died in the witch trials, and that they were all pagans. Both are wrong. Estimates of executions in Europe are about 40,000 to 60,000, and almost all of the accused were Christians. Honest history honours them better.

> **Try this:** Choose one Wiccan practice you have met so far (the circle, the Charge, the sabbats, the athame). Write in your Grimoire what you now know of where it came from.

## What's old and what's modern

- **Old:** ceremonial magic's roots, folk custom, the ancient gods and the seasons.
- **Modern:** Leland (1899), Murray (1921), Gardner's Wica (1940s and 1950s), Valiente's Charge (1950s), and every tradition since.`,
    },
    {
      id: 'wicca-tradition-lineages',
      title: 'Lineages: initiatory, eclectic and other Wiccas',
      summary: 'The difference between British Traditional Wicca (Gardnerian and Alexandrian), the open and eclectic Wicca of the books, and other lineages; what is oathbound and why; what this course does and does not teach; and how to recognise a genuine initiatory coven, or a false claim to be one.',
      minutes: 16,
      links: [closed('initiatory-wicca'), closed(), journey('path-wicca'), coven('standing'), page('community-rituals')],
      body: `## Why this matters

The word Wicca covers several quite different things. Knowing which is which protects you from confusion, from false claims, and from accidentally treating someone else's sacred secrets carelessly. It also lets you be honest about what you are learning.

## British Traditional Wicca

**British Traditional Wicca**, often shortened to BTW, is the name usually given to the initiatory lines that descend from Gerald Gardner's covens: the **Gardnerian** tradition, and the **Alexandrian** tradition founded by Alex and Maxine Sanders. Some other closely related lines, such as Algard (a blend of the two), are often included. Despite the name, BTW covens now exist around the world.

What marks BTW is this:

- **Initiation.** You become a Gardnerian or Alexandrian only by being initiated by a priestess or priest of that line who has the standing to initiate. The phrase often used is "only a witch can make a witch".
- **Lineage.** Each initiate can trace their line of initiators back to the founders. Lineage is taken seriously and can be checked.
- **Oaths.** At initiation, people swear to keep the tradition's secrets.
- **An oathbound Book of Shadows.** The coven's Book of Shadows, holding its rites, the names it uses and its inner teachings, is copied by hand by each initiate from their initiator's copy. Its contents are not shared with outsiders.
- **Coven practice.** BTW is practised in covens, in a priestess-and-priest working partnership, usually with three degrees.
- **No charge for teaching.** Traditional covens do not charge for training or initiation.

Some early material from the Gardnerian Book of Shadows has been published over the years, by Gardner's critics and later, with Doreen Valiente's support, by Janet and Stewart Farrar. But reading published text is not the same as being initiated, and BTW initiates hold that the tradition lives in the relationship between initiator and initiate, not in a text.

## What this course does not teach

This course does **not** teach, reproduce or claim to reproduce the oathbound material of any initiatory tradition: not its secret names of the gods, its initiation rites, its inner teachings or its Book of Shadows. Where it describes things that BTW covens do, such as drawing down the moon or the three degrees, it does so only as they have been publicly described by initiates and historians. Completing this course does not make anyone a Gardnerian or Alexandrian, and no app or book can.

The Sanctuary's closed and living traditions guide has an entry on initiatory Wicca explaining this in more detail.

## Open and eclectic Wicca

**Open Wicca** is Wicca that anyone may learn. Its sources are published books and teachers who share openly. It grew from the 1970s onwards, through writers such as Raymond Buckland (whose Seax-Wica was openly published), Doreen Valiente's later books, Starhawk, and above all Scott Cunningham, whose Wicca: A Guide for the Solitary Practitioner (1988) taught that a person could practise Wicca alone and dedicate themselves without initiation.

**Eclectic Wicca** means drawing on many sources, choosing what speaks to you within the broad shape of Wicca. **Solitary Wicca** means practising alone. Many people are both.

Open Wicca keeps the public shape of the religion: the Goddess and God, the sabbats and esbats, the cast circle and quarters, the tools, cakes and ale, the Rede. It writes its own words for its rites. This course teaches open Wicca, and your coven may be an open Wiccan coven, or an initiatory coven using these lessons for its public, outer teaching.

## Other lineages

Between BTW and solitary eclecticism lie many organised traditions, some initiatory, some open:

- **Seax-Wica,** Buckland's Saxon-flavoured open tradition (1973).
- **Dianic Wicca,** centred on the Goddess; some Dianic groups are for women only.
- **Reclaiming,** founded in San Francisco by Starhawk and others, joining Wicca-derived ritual with activism, and teaching openly.
- **Correllian, Georgian, Blue Star** and many more American traditions, each with its own history and degree of openness.
- **Feri,** from Victor and Cora Anderson, is related to Wicca but is usually counted as a separate witchcraft tradition, and is initiatory.

Each tradition decides what it shares. Respect that.

## Who may call themselves Wiccan

This is a live question, held in good faith on all sides. Some BTW initiates feel that "Wicca" should mean only the initiatory lines, and that others are "Wiccan-inspired" or simply "witches". Many eclectic Wiccans feel the word has grown beyond its first meaning, as words do. Some people solve it by speaking of "traditional Wicca" and "eclectic Wicca". Whatever you call yourself, be accurate about your training: say "I practise eclectic Wicca" or "I was trained in an open Wiccan coven", and never claim an initiation or lineage you do not have.

## Recognising a genuine initiatory coven, and false claims

If one day you seek initiation into a BTW line, these signs help:

- They are open about their lineage when you are serious, and others in that tradition know them.
- They usually meet seekers first through public events, study groups or an outer court, and take time, often a year and a day, before initiating.
- They do not charge for training or initiation.
- They never make sex, nudity, money or cutting off your friends a condition of being taught.

Be wary of anyone who claims a hereditary or ancient secret line they cannot explain, sells "initiations" online, or uses secrecy to discourage questions about how they treat people. A real oath of secrecy covers a tradition's rites, never harm done to a person.

> **Your coven:** Your High Priestess or mentor can tell you where your coven stands: initiatory and in which line, open, or a mixture with an outer court. Ask.

> **Try this:** Open the closed and living traditions guide and read its entry on initiatory Wicca. In the answer box for this module's reading task, describe in your own words what is open to you and what is not.

## What's old and what's modern

- **Modern, all of it:** BTW from the 1950s and 1960s, open Wicca from the 1970s, and the debate about the word from the 1980s onwards.`,
    },
    {
      id: 'wicca-tradition-the-goddess-and-god',
      title: 'The Goddess and the God',
      summary: 'Wiccan theology: the Goddess and the God and the polarity between them, the Triple Goddess and the Horned God, the many ways Wiccans understand them (duotheism, soft and hard polytheism, a Goddess-centred view, the One behind all), and how to approach named gods respectfully.',
      minutes: 18,
      links: [deity('wiccan_goddess'), deity('horned_god'), deity('aradia'), deity('cernunnos'), deity('diana'), deity('pan'), journey('deity-cernunnos'), journey('deity-diana'), page('patron')],
      body: `## The heart of Wicca

Wicca is, at its heart, the worship of a Goddess and a God. Everything else (the circle, the tools, the sabbats, the magic) serves that relationship. This lesson introduces them, and the many honest ways in which Wiccans understand them. You do not need to settle your own view now; it will grow with practice.

## The Goddess

The Wiccan Goddess is often called simply the Goddess or the Lady. She is seen in the moon, waxing, full and waning; in the earth that bears and receives all life; in the sea; and in the turning of birth, love, motherhood, age and death. In the Charge of the Goddess, she speaks as the one who has been with her worshippers from the beginning, and who asks to be worshipped with joy, beauty, strength, mirth and reverence.

Many Wiccans honour her as a **Triple Goddess**: Maiden, Mother and Crone, mirroring the waxing, full and waning moon and the stages of a woman's life. This threefold image is modern. It owes most to Robert Graves's book The White Goddess (1948), a poetic, not a historical, work. Ancient religions did have triple goddesses (Hekate was shown with three bodies), but not the Maiden, Mother and Crone as Graves described them. Many find the image rich and true to experience; others find it limiting, especially for anyone whose life does not fit those three stages. Both are fair responses.

## The God

The Wiccan God, often called the Lord, is frequently pictured as the **Horned God**: lord of the wild, of animals and the hunt, of the woods and of death and what lies beyond. This image owes a good deal to Margaret Murray's theory of a witches' horned god, and to figures such as the Gaulish Cernunnos (known from a few images and one inscription) and the Greek Pan. He is also seen as the **sun**, born at midwinter and at his height at midsummer, and as the **grain**, cut down at harvest and sown again. In the sabbats, he lives, loves, dies and is reborn each year, while the Goddess endures and transforms.

Some covens tell part of the God's year through the story of the **Oak King and the Holly King**, twin rulers of the waxing and waning year, a modern image popularised by Janet and Stewart Farrar from the writings of Robert Graves and James Frazer.

## Polarity

In much traditional Wicca, the relationship between Goddess and God is reflected in the relationship between priestess and priest, and between female and male. This is called **polarity**: the idea that power and life arise from the meeting of complementary forces. Rites are often led by a priestess and a priest together, and cakes and ale is a symbol of their union.

Polarity has been rethought by many Wiccans. Same-sex, transgender and non-binary Wiccans have always been part of the religion, and many covens now understand polarity as something that can arise between any two people, or within each person, rather than tying it to sex or gender. Some traditions work without gendered roles at all. The elder module discusses this further.

## Many ways of understanding them

Wiccans hold a wide range of theologies. Here are the most common, and honest Wiccans hold every one of them:

- **Duotheism.** There is one Goddess and one God. All the goddesses of the world's religions are names and faces of the Goddess, and all the gods of the God. Dion Fortune's line, "All the gods are one god, and all the goddesses are one goddess, and there is one initiator", from her novel The Sea Priestess (1938), is often quoted. This is the classic Wiccan view.
- **Soft polytheism.** The many gods are real, and are also, in some way, aspects of the Goddess and God.
- **Hard polytheism.** The gods are many and distinct persons, and the Wiccan Goddess and God are particular deities, or a convenient way of speaking about the gods a coven honours. Some Wiccan covens honour named gods, such as Diana and Cernunnos, as themselves.
- **A Goddess-centred view.** Some traditions, such as Dianic Wicca, honour the Goddess as the source of all, with the God present as her son or consort, or not at all.
- **The One behind all.** Some Wiccans speak of an unknowable source beyond both the Goddess and God, sometimes called the Dryghtyn or simply the One.
- **Archetypal or naturalistic.** For some, the Goddess and God are powerful symbols of nature and the psyche, worshipped as such, without claims about persons beyond.

You may find your view changes over the years. That is normal.

## Names

In open Wicca, people call the Goddess and God by many names: the Lady and the Lord, the Mother and the Horned One, or the names of particular gods from the ancient world. In initiatory Wicca, each tradition has its own names for them, which are part of its oathbound material and are not taught here.

## Approaching named gods respectfully

If you come to honour a particular god, such as Brigid, Cernunnos, Diana or Hekate, learn about them as their own peoples knew them. Read the Library entries and, where the Sanctuary has one, try the dedication journey. Remember that some gods belong to living, closed traditions (the closed and living traditions guide explains which), and treat them with the respect their own people ask for. Do not fold gods from living religions into "the Goddess" without care.

> **Your coven:** Ask your mentor how your coven speaks of the Goddess and God, which names it uses in the circle, and whether it honours particular deities.

> **Try this:** For a week, at your candle greeting, speak to the Goddess and God by the simplest names: the Lady and the Lord. In the second week, try a particular name that draws you. Write what changed, if anything.

## What's old and what's modern

- **Old:** the ancient gods themselves, such as Diana, Pan and Cernunnos, and the honouring of moon, sun and earth.
- **Modern:** the Wiccan Goddess and God as a pair, the Triple Goddess (Graves, 1948), the Horned God of the witches (Murray, 1931), the Oak and Holly Kings, and every theology described here.`,
    },
    {
      id: 'wicca-tradition-ethics',
      title: 'Wiccan ethics: the Rede, the Threefold Law and beyond',
      summary: 'The Wiccan Rede and where it came from, the Threefold Law and how variously it is held, what Wiccan ethics actually asks (responsibility, consent, honour, care for the earth), and what the ethics means for magic and for coven life.',
      minutes: 16,
      links: [closed(), page('spell'), journey('path-wicca'), coven('standing')],
      body: `## Ethics, not commandments

Wicca has no book of commandments. Its ethics is a matter of freedom and responsibility: you are free, and you are answerable for what you do with your freedom. This lesson looks at the two sayings most often quoted, where they come from, how differently Wiccans understand them, and the wider values that sit around them.

## The Wiccan Rede

The **Wiccan Rede** is usually given as: "An it harm none, do what ye will." "Rede" is an old word for advice or counsel; "an" means "if". In plain modern English: if it harms no one, do as you will.

### Where it came from

The Rede in this form first appears in public in 1964, in a speech by Doreen Valiente, who called it "eight words the Wiccan Rede fulfil". Gerald Gardner had written something similar in The Meaning of Witchcraft (1959), comparing the witches' morality to that of "the good King Pausol" in a French novel, who said, in effect, "do what you like, so long as you harm no one." The idea also echoes Aleister Crowley's "Do what thou wilt shall be the whole of the Law", though its spirit is different.

A much longer poem, often called "The Rede of the Wiccae", with many couplets of advice, was published in 1975 by Gwen Thompson, who attributed it to her grandmother, Adriana Porter. Whether it is that old is uncertain. Many Wiccans love it; it is a later addition, not the source of the short Rede.

### What it means

Wiccans read the Rede in several ways:

- **As permission:** whatever harms no one is allowed. Wicca does not forbid harmless pleasures.
- **As an ideal:** harm none, as far as you can. Since almost every action harms something (we eat, we compete, we say no), many Wiccans read it as "cause the least harm you can, and take responsibility for the harm you do cause".
- **As counsel, not law:** "rede" means advice. It is wisdom to weigh, not a rule to obey blindly.
- **As including yourself:** "none" includes you. Self-harm, burnout and letting others harm you are not what the Rede asks.

It does not mean that a Wiccan may never defend themselves, say no, or act firmly. It asks that you think before you act and own what follows.

## The Threefold Law

The **Threefold Law**, or Law of Return, says that whatever you send out, for good or ill, comes back to you three times over.

### Where it came from

A version appears in Gardner's novel High Magic's Aid (1949), in a scene where an initiate is told that good received must be returned threefold. In the form most people know today, as a universal law of magical consequences, it spread through American books of the late 1960s and 1970s, notably those of Raymond Buckland, and became one of the most quoted ideas in eclectic Wicca.

### How variously it is held

Wiccans hold the Threefold Law in very different ways:

- some believe it literally, as a law of the universe;
- some treat it as a vivid way of saying that what you do shapes who you become and how others treat you;
- some hold a broader idea of return without the number three;
- some initiatory Wiccans regard it as a modern addition, not part of their tradition;
- some reject it, pointing out that good people suffer and harmful people often prosper, and that ethics should not rest on fear of punishment.

It is honest to say that it is relatively recent and not universal. It is also fair to notice its wisdom: magic done in anger tends to keep the one doing it angry.

## The wider values

Around the Rede, most Wiccan covens hold values like these:

- **Responsibility.** You answer for what you do, magically and otherwise.
- **Consent.** No magic is done on or for another person without their consent, including healing. Ask first; if you cannot ask, offer it to the gods "for their highest good, if they would welcome it", or not at all.
- **Honour and truthfulness.** Keep your word; do not claim titles or lineage you do not have; keep confidences.
- **Perfect love and perfect trust.** A phrase widely used in Wicca for the spirit in which members enter the circle together. It is an ideal of how a coven should be, not a demand that you trust anyone blindly. Trust is earned.
- **Care for the earth.** The Goddess is seen in nature, so harming the earth carelessly is seen as a failure of worship.
- **Freedom and joy.** The Charge of the Goddess asks for mirth as well as reverence. Pleasure is not sinful in Wicca.

## Ethics and magic

Most Wiccan covens forbid curses and harmful magic, and many forbid "binding" anyone except, in rare cases, to stop serious harm, and then only after much thought and with the coven's leaders. The core spellcraft lessons discuss this in detail. Wicca's ethics also ask you to do the ordinary things: see the doctor, call the police, apply for the job. Magic works alongside action, never instead of it.

## Ethics and coven life

The same ethics applies to coven leaders. No one may use the Rede, perfect love and perfect trust, or oaths of secrecy to pressure you into anything harmful, sexual or financial. An oath never covers abuse. If anything in your coven feels wrong, speak to someone you trust, inside or outside it.

> **Your coven:** Ask your mentor what your coven's own ethical agreements are, and how it understands the Rede and the Threefold Law.

> **Try this:** Think of a decision you face. Write how the Rede would guide it if read as permission, as an ideal and as counsel. Which reading helps most?

## What's old and what's modern

- **Old:** the wish to do no harm, which appears in many ethical traditions.
- **Modern:** the Rede in its eight words (1964), the long Rede (1975), the Threefold Law as a universal law (1960s and 1970s), and "perfect love and perfect trust" as a Wiccan phrase.`,
    },
    {
      id: 'wicca-tradition-the-wiccan-coven',
      title: 'What a Wiccan coven does',
      summary: 'Coven life in Wicca: the sabbats and esbats, training, the High Priestess and High Priest, degrees described in public terms, robes and skyclad working, outer courts, and how the app holds the coven’s rites, Book of Shadows and conversations.',
      minutes: 15,
      links: [coven('rituals'), coven('ritual-builder'), coven('book'), coven('altar'), coven('gathering'), page('calendar'), holy('moon-full'), holy('wheel/samhain')],
      body: `## A small, close group

The coven is the classic unit of Wicca. Traditionally it has no more than thirteen members, a number that comes from Margaret Murray's theory and has stuck, though many covens are smaller. A coven is small on purpose: people who work magic and worship together need to know and trust one another, and that takes time and closeness.

## What a coven does through the year

### The sabbats

The coven gathers for the eight sabbats, often on the nearest weekend. A sabbat is festive: the circle is cast, the season's story is enacted or told, the season's custom is kept, cakes and ale are shared, and there is a feast. Some covens open certain sabbats to guests.

### The esbats

The coven meets at the full moon, or as near as possible, for the esbat. The esbat is more inward than the sabbat: worship of the Goddess, often with the Charge, and the coven's magical work, such as healing for those who have asked for it. Some covens also meet at the new or dark moon.

### Training

Covens train newcomers. In initiatory covens this often happens first in an **outer court** or study group that is not yet part of the coven proper; in open covens, through programs like this one. Training covers the coven's ritual, the craft of magic, devotion, history and ethics.

### Magic and service

Covens do healing work, protection and blessings for members and those who ask, and often service to the wider community or the land. Consent comes first.

### Fellowship

Covens are also friendships. Members eat together, support one another through hard times and celebrate births, handfastings (Wiccan weddings) and lives at their ending.

## Who leads

Most Wiccan covens are led by a **High Priestess**, often with a **High Priest**. In traditional Wicca the High Priestess has the final word in the circle: Wicca has always given women leadership. The High Priest works alongside her. Many covens now have two priestesses, two priests, or leaders of any gender. Leading is a service: planning rites, teaching, caring for members, and holding the coven to its own ethics.

## Degrees, in public terms

Many Wiccan traditions, especially the initiatory ones, use **three degrees**. What follows is only what has been publicly described; the rites and teachings of each degree belong to each tradition.

- **First degree.** Initiation itself: the person becomes a witch and a priestess or priest of the tradition, and a member of the coven.
- **Second degree.** After further training, often a year or more: deeper teachings, and often the ability to initiate others and lead rites under the guidance of the coven's leaders.
- **Third degree.** The fullest standing in the tradition, usually needed to lead a coven independently and to "hive off", that is, found a daughter coven.

Open covens may use degrees, may use only a dedication and an initiation, or may have no degrees at all. In this Sanctuary, covens describe their own positions, such as Dedicant, Initiate, Elder and High Priestess, and the programs raise people to them.

## Robes and skyclad

Some traditional covens work **skyclad**, naked, as Gardner described and as Leland's Aradia had pictured. Those who do it say it removes distinctions of wealth and status and makes everyone equal before the gods. Many other covens wear robes, often black or plain, with a cord at the waist. Others wear ordinary clean clothes. Whatever a coven does, nudity is never required of a newcomer or guest and must never be a condition of being taught. If a coven works skyclad, it should tell you before you are asked to decide anything, and you may choose a coven that robes.

## The coven's Book of Shadows

Every coven keeps its own Book of Shadows: its rites, words, recipes, history and teachings. In initiatory covens it is oathbound and copied by hand. In this Sanctuary, your coven's Book lives in the app, and its leaders decide what is shared with whom. Your own Book of Shadows, your personal record, lives in the Grimoire.

> **Note:** Secrecy in Wicca protects a tradition's rites from being treated carelessly. It never protects harm. Anything that is done to a person against their will, or that would need hiding from the law, is not a coven secret.

## How the app helps

- **The coven's rituals and ritual builder** hold the rites the coven plans, with dates, roles and words.
- **The calendar** shows the sabbats, the moons and the coven's own dates.
- **The coven's Book** holds its shared teaching.
- **The altars** let members tend a shared altar together.
- **The coven's messages** keep members in touch between rites, and online rites let distant members join.

## Your first year

In your first year you will usually keep all eight sabbats and most full moons with the coven, keep a daily practice, study, and slowly take small roles in the circle: calling a quarter, carrying the incense, reading a part. By the end you will know the coven's rite by heart.

> **Your coven:** Ask your mentor how your coven organises its year: which sabbats are open, how often it meets for esbats, whether it has an outer court, and whether it uses degrees.

> **Try this:** Look in the app at the coven's rituals and its Book. Find one rite that has already been planned and read it through.

## What's old and what's modern

- **Old:** the image of witches meeting in small groups, from folklore and the trial records, though not as Murray read them.
- **Modern:** the Wiccan coven as it exists today, with its degrees, outer courts and High Priestess, from the 1950s onwards.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-wicca-tradition',
      title: 'The Wiccan tradition: test',
      intro: 'Thirteen questions on what Wicca is, its history, its lineages, the Goddess and God, its ethics and coven life. Most are scored at once; your mentor scores the written answers. You need 80% to pass.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'How does Wicca relate to witchcraft?',
          options: [
            'They are exactly the same thing',
            'Wicca is a religion of witchcraft; every Wiccan is a witch in Wicca’s understanding, but not every witch is Wiccan',
            'Wicca forbids witchcraft',
            'Witchcraft is a branch of Wicca',
          ],
          correct: [1],
          points: 1,
          explanation: 'Wicca practises magic within worship of the Goddess and God. Many witches follow other paths, or no religion at all.',
        },
        {
          id: 'q2',
          type: 'single',
          prompt: 'Who wrote the best-known prose version of the Charge of the Goddess?',
          options: ['Margaret Murray', 'Doreen Valiente, drawing in part on Leland and Crowley', 'An unknown ancient priestess', 'Scott Cunningham'],
          correct: [1],
          points: 1,
          explanation: 'Gardner’s earlier version drew on Leland’s Aradia and on Crowley. Doreen Valiente rewrote it in the 1950s, first in verse and then in the famous prose version.',
        },
        {
          id: 'q3',
          type: 'multi',
          prompt: 'Which of these shaped early Wicca? Choose all that apply.',
          options: ['Ceremonial magic such as the Golden Dawn and Crowley', 'Margaret Murray’s witch-cult theory', 'Leland’s Aradia', 'Freemasonry and Co-Masonry', 'An unbroken Stone Age priesthood'],
          correct: [0, 1, 2, 3],
          points: 1,
          explanation: 'Wicca was built in the twentieth century from these older materials. Historians find no evidence of an unbroken ancient priesthood.',
        },
        {
          id: 'q4',
          type: 'truefalse',
          prompt: 'Historians now accept Margaret Murray’s theory that the people accused at the witch trials belonged to an organised pagan religion.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. The trial records do not support it, and Murray read them selectively. Her picture nevertheless shaped Wicca’s covens, sabbats and Horned God.',
        },
        {
          id: 'q5',
          type: 'multi',
          prompt: 'Which are marks of British Traditional Wicca (Gardnerian and Alexandrian)? Choose all that apply.',
          options: ['Initiation by someone in the lineage', 'An oathbound Book of Shadows copied by hand', 'Training and initiation sold for a fee', 'Practice in covens, usually with three degrees'],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'BTW is initiatory, lineaged and oathbound, and practised in covens with degrees. Traditional covens do not charge for training or initiation.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'Whose 1988 book did most to make solitary, self-taught Wicca widespread?',
          options: ['Gerald Gardner', 'Scott Cunningham', 'Charles Leland', 'Margaret Murray'],
          correct: [1],
          points: 1,
          explanation: 'Cunningham’s Wicca: A Guide for the Solitary Practitioner taught that a person could practise Wicca alone and dedicate themselves without initiation.',
        },
        {
          id: 'q7',
          type: 'single',
          prompt: 'What is duotheism, in Wicca?',
          options: [
            'Belief in two opposing gods of good and evil',
            'Seeing the divine as a Goddess and a God, with all goddesses as faces of the one Goddess and all gods of the one God',
            'Worship of two named Greek gods only',
            'The belief that there are no gods',
          ],
          correct: [1],
          points: 1,
          explanation: 'Duotheism is the classic Wiccan view. Wiccans also hold soft and hard polytheist, Goddess-centred and other theologies.',
        },
        {
          id: 'q8',
          type: 'truefalse',
          prompt: 'The Maiden, Mother and Crone as Wicca knows them come mostly from Robert Graves’s The White Goddess (1948), not from ancient religion.',
          options: ['True', 'False'],
          correct: [0],
          points: 1,
          explanation: 'True. Ancient religions had triple goddesses, but the Maiden, Mother and Crone image is modern. Many still find it rich and true to experience.',
        },
        {
          id: 'q9',
          type: 'multi',
          prompt: 'Which statements about the Rede and the Threefold Law are honest? Choose all that apply.',
          options: [
            'The eight-word Rede first appears in public in a 1964 speech by Doreen Valiente',
            'The Threefold Law as a universal law spread mainly through books of the 1960s and 1970s',
            'All Wiccans believe the Threefold Law literally',
            '"Rede" means counsel or advice',
          ],
          correct: [0, 1, 3],
          points: 1,
          explanation: 'The Rede is counsel, made public in 1964. The Threefold Law is held in many ways, from literal law to metaphor to rejection; it is not universal.',
        },
        {
          id: 'q10',
          type: 'single',
          prompt: 'What does an oath of secrecy in a Wiccan coven cover?',
          options: ['Anything the leaders say it covers, including how members are treated', 'The tradition’s rites and teachings, never harm done to a person', 'Members’ medical history', 'Nothing at all'],
          correct: [1],
          points: 1,
          explanation: 'Secrecy protects a tradition’s rites from careless treatment. It never protects abuse or anything that would need hiding from the law.',
        },
        {
          id: 'q11',
          type: 'truefalse',
          prompt: 'Working skyclad may be required of a newcomer before they can be taught.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. Some traditional covens work skyclad, but it is never required of a newcomer and must never be a condition of being taught.',
        },
        {
          id: 'q12',
          type: 'long',
          prompt: 'Explain the difference between British Traditional Wicca and open, eclectic Wicca, what this course does and does not teach, and how you would describe your own training honestly.',
          points: 4,
          explanation: 'BTW is initiatory, lineaged and oathbound; open Wicca is learned from public sources. This course teaches the public shape of Wicca and never claims to make anyone a Gardnerian or Alexandrian.',
          rubric: 'Full marks (4): describes BTW as initiatory, lineaged and oathbound with a hand-copied Book of Shadows (1); describes open or eclectic Wicca as learned from public sources by anyone, alone or in a coven (1); states that this course does not teach oathbound material or confer lineage (1); gives an honest description of their own training, such as "eclectic Wicca, trained in an open coven" (1).',
        },
        {
          id: 'q13',
          type: 'short',
          prompt: 'In your own words, what does the Wiccan Rede ask of you, and how do you understand the Threefold Law?',
          points: 3,
          explanation: 'The Rede asks for freedom with responsibility; the Threefold Law is held in many ways. A thoughtful personal view is what matters.',
          rubric: 'Full marks (3): explains the Rede as freedom with responsibility for harm, or as an ideal of least harm, not a ban on all action (1); notes that the Threefold Law is later and variously held (1); gives their own honest, reasoned view of either (1).',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'The Wiccan tradition',
      intro: 'Here you learn what Wicca is, where it really came from, how its lineages differ and what is kept secret, the Goddess and God and how Wiccans understand them, the ethics of the Rede, and what a Wiccan coven does. Read at your own pace, write as you go, and bring your questions to your mentor.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'What Wicca is',
          kind: 'study',
          instructions: `1. Read "What Wicca is".
2. Start your "Words of the Craft" page in your Grimoire, as the lesson suggests.
3. In the answer box, write in a few sentences how Wicca differs from witchcraft in general, and which of its features draws you most.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wicca-tradition-what-wicca-is'],
          links: [page('grimoire')],
        },
        {
          title: 'The history',
          kind: 'study',
          instructions: `1. Read "How Wicca began: an honest history". If you want the history of the eight festivals, read "How the Wheel was assembled" from the Wheel of the Year course too.
2. Do the "Try this": trace one practice back to its sources.
3. In the answer box, write what you traced, and one thing in the history that surprised you.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 45,
          docs: ['wicca-tradition-history', 'wheel-tradition-how-the-wheel-was-made'],
        },
        {
          title: 'Lineages and what is open',
          kind: 'study',
          instructions: `1. Read "Lineages: initiatory, eclectic and other Wiccas".
2. Open the closed and living traditions guide and read its entry on initiatory Wicca.
3. In the answer box, describe what is open to you and what is not, and ask your mentor where your coven stands.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['wicca-tradition-lineages'],
          links: [closed('initiatory-wicca')],
        },
        {
          title: 'The Goddess and the God',
          kind: 'practice',
          instructions: `1. Read "The Goddess and the God".
2. For two weeks, greet the Lady and the Lord at your daily candle, the first week by those simple names and the second by a particular name that draws you.
3. Log each week. In the answer box after the second, write which theology in the lesson is closest to your experience so far, and why.`,
          times: 2,
          response: 'text',
          checked_by: 'mentor',
          minutes: 20,
          docs: ['wicca-tradition-the-goddess-and-god'],
          links: [ritual('wicca-daily-devotion'), page('patron')],
        },
        {
          title: 'Ethics',
          kind: 'reflection',
          instructions: `1. Read "Wiccan ethics: the Rede, the Threefold Law and beyond".
2. Do the "Try this" with a real decision you face.
3. In the answer box, write what you found, and ask your mentor about your coven's own ethical agreements.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 30,
          docs: ['wicca-tradition-ethics'],
          links: [coven('standing')],
        },
        {
          title: 'Coven life',
          kind: 'study',
          instructions: `1. Read "What a Wiccan coven does".
2. In the app, look at the coven's rituals, its Book and its altars, and read one planned rite.
3. Send your mentor a message on this step with your questions about how your coven organises its year, its degrees or its dress.`,
          times: 1,
          response: 'none',
          checked_by: 'self',
          minutes: 30,
          docs: ['wicca-tradition-the-wiccan-coven'],
          links: [coven('rituals'), coven('book')],
          solitary: 'Read the lesson, then look at the Community Rituals and find one open Wiccan rite or sabbat shared there. Read it through and note how it compares with what the lesson describes.',
        },
        {
          title: 'Take the test',
          kind: 'study',
          instructions: `1. Re-read any lesson you're unsure of.
2. Take the test. The choice questions are scored at once; your mentor scores the written answers.
3. You need 80% to pass. If you don't pass, look at the questions you missed, talk to your mentor, and try again.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 35,
          quiz: 'quiz-wicca-tradition',
          links: [closed('initiatory-wicca')],
        },
      ],
    },
  ],
} satisfies CourseModule;
