// Norse tradition: what Heathenry is and is not. The peoples and languages
// (the Norse, and the wider Germanic world of the English and the continental
// Saxons), the conversion; the sources and their limits (the Poetic Edda,
// skaldic verse, the sagas, runestones, archaeology, outsiders, folklore);
// Snorri Sturluson and his biases; the modern revival, from the Romantic and
// völkisch movements to Ásatrúarfélagið, The Troth and Forn Sed, with
// reconstruction told apart from modern practice; and the misuse of Heathen
// symbols by the far right, folkish ideology and why this coven rejects it
// (Declaration 127). Modern practice marked as modern. British spelling.

import type { CourseModule } from '../types';
import { closed, coven, deity, holy, journey, page, ritual, spread } from '../linkHelpers.ts';

export default {
  id: 'norse-tradition',
  title: 'The Heathen tradition: peoples, sources and the modern revival',
  docs: [
    {
      id: 'norse-tradition-peoples-and-languages',
      title: 'Who were the Norse? Peoples, languages and the conversion',
      summary: 'Who the heathen Norse and the wider Germanic peoples were, the languages they spoke, what “Viking” really means, how and when each land became Christian, and why that matters for anyone practising today.',
      minutes: 14,
      links: [journey('path-norse'), page('library'), deity('odin'), holy('norse/midsummer'), page('calendar')],
      body: `## Norse and Germanic

The gods most Heathens honour are known best from Scandinavia and Iceland, in the language we call **Old Norse.** But the Norse were one branch of a much larger family: the peoples who spoke **Germanic** languages.

- **North Germanic** gave Old Norse, and from it modern Icelandic, Faroese, Norwegian, Swedish and Danish.
- **West Germanic** gave Old English, Old Saxon and Old High German, and from them English, German, Dutch and Frisian.
- **East Germanic** included Gothic, now long dead, known from a fourth-century Bible translation.

The same gods appear across this family under related names. Odin is Old English **Woden** and Old High German **Wodan;** Thor is **Thunor** and **Donar;** Tyr is **Tiw** and **Ziu;** Frigg is **Frige** and **Frija.** English still keeps them in its weekdays: Tuesday, Wednesday, Thursday and Friday.

So this course speaks of the **Norse** sources first, because they are by far the richest, and of the **Anglo-Saxon** and **continental** sources beside them, because they show us the same gods from other angles. Some Heathens work mainly from the English sources, and call their practice Fyrnsidu or Anglo-Saxon Heathenry.

> **Your coven:** Ask your mentor whether your coven works mainly from the Norse sources, the Anglo-Saxon ones, or both, and which names it uses for the gods.

## What "Viking" means

In Old Norse a **víkingr** was someone who went raiding by sea, and **fara í víking** meant to go on such a raid. It was an activity, not a people. Most Scandinavians of the Viking age, roughly from the raid on Lindisfarne in 793 to the middle of the eleventh century, were farmers, fishers, traders and craftspeople, and most never went raiding.

The Viking age was also a time of trade and settlement across a huge area: Scandinavians settled in Iceland, Greenland, the British Isles, Normandy and along the rivers of what is now Russia and Ukraine, and traded as far as Constantinople and Baghdad. They met, married and mixed with many peoples. The popular image of horned helmets comes from nineteenth-century opera costumes; no Viking-age helmet with horns has ever been found.

## A world of farms and assemblies

Heathen religion lived in a world of farms, halls and kin. The household was the centre of daily life, and the head of a household often led its offerings. Larger rites were held by chieftains for their districts. Free men met at regular assemblies, called **things,** to make law and settle disputes; Iceland's **Althing,** founded about 930, met at Þingvellir each June. Religion, law, family and politics were not separate things.

Women held real authority in the household: the keys of the house, worn at the belt, were the sign of the mistress's charge, and the sagas show women as hostesses, seeresses, landowners and avengers. Enslaved people, too, were part of this world, captured in raids and traded; the Viking age was not a golden age for everyone, and honest Heathens do not pretend it was.

That matters today because Heathenry is less about private spiritual experience and more about relationship and obligation: to household, community, land and gods.

## How each land became Christian

Conversion was slow and uneven, and often driven by kings.

- **England:** the Anglo-Saxon kingdoms converted during the seventh century, so the English sources for heathen religion are scant and early.
- **The continental Saxons** were forcibly converted by Charlemagne in wars between 772 and 804; in 772 his army destroyed the Irminsul, a great pillar or tree they held sacred.
- **Denmark:** King Harald Bluetooth declared on the Jelling stone, about 965, that he "made the Danes Christian".
- **Norway:** kings such as Olaf Tryggvason and Olaf Haraldsson pressed conversion, sometimes violently, around 995 to 1030.
- **Iceland** accepted Christianity by a decision of the Althing in 999 or 1000, with heathen practice allowed in private for a time.
- **Sweden** converted more slowly, with heathen worship at Uppsala recorded into the late eleventh century.

So when the Icelanders began writing down their old poems and stories, in the late twelfth and thirteenth centuries, their country had been Christian for two hundred years. Everything we read in the Eddas and sagas passed through that gap.

## Why this matters

Three things follow for practice:

1. **There was never one Heathen religion.** Practice varied by place and time, between Denmark and Iceland, between farm and royal hall, between the fifth century and the tenth. When someone says "the Vikings believed", ask which ones, where and when.
2. **The sources come from many places and centuries.** A Roman account of first-century Germans, an Old English charm and a thirteenth-century Icelandic saga can all be useful, but they are not describing the same people.
3. **No one owns this heritage by blood.** The Germanic peoples themselves mixed with many others, and modern Heathenry was rebuilt from books and archaeology that anyone can read. That is part of why this coven treats Heathenry as open to all.

> **Try this:** Find out which Germanic language is spoken nearest to you, or in a place you care about, and learn how to say "hail" or "good health" in it, and the local name for one of the weekdays named after a god.

## What's old and what's modern

- **Old:** the gods' names across the Germanic languages, the farms, halls and assemblies, and the long, uneven conversion.
- **Modern:** the word "Heathenry" for a religion of today, and the habit of treating "the Vikings" as one people with one faith.`,
    },
    {
      id: 'norse-tradition-sources-and-their-limits',
      title: 'The sources and their limits',
      summary: 'The kinds of evidence for heathen religion: the Poetic Edda, skaldic verse, the sagas, runic inscriptions, archaeology, outsiders’ accounts and later folklore, with who wrote each, when and why, and what each can and cannot tell us.',
      minutes: 16,
      links: [ritual('folk-havamal-reflection'), holy('norse/disablot'), holy('norse/vetrnaetur'), deity('norns'), page('library')],
      body: `## Why the sources matter

Every Heathen practice today is built on sources, and every source has a voice of its own: who wrote it, when, where and why. Learning to ask those four questions is the most useful skill this course can give you. It protects you from the most common mistake in modern Heathenry, which is treating a late or unusual source as if it described everyone.

## The Poetic Edda

The **Poetic Edda** is a collection of anonymous poems about the gods and heroes. Most survive in one manuscript, the **Codex Regius,** written in Iceland around 1270. The poems themselves are older, some perhaps by centuries, but dating them is hard and scholars disagree. Among them:

- **Völuspá,** "the prophecy of the seeress": the making of the world, the gods' history and the doom of the gods. It may have been composed around the year 1000, as Christianity arrived, and some see Christian influence in it.
- **Hávamál,** "the sayings of the High One" (Odin): practical advice on hospitality, friendship and good sense, and the story of Odin winning the runes. It is a composite of several poems put together.
- **Grímnismál, Vafþrúðnismál, Lokasenna, Þrymskviða** and others: dialogues, contests and comedies about the gods.

The Eddic poems are the closest we have to heathen religious poetry. They are still not scripture: they were recorded by Christians, they were partly entertainment, and they don't tell us how rites were done.

## Skaldic verse

The **skalds** were court poets who composed intricate praise poems for kings and chieftains. Some were heathens composing in heathen times, in the ninth and tenth centuries, and their verses are full of references to myths. Because skaldic verse has strict metre and rhyme, it was hard to change, so verses quoted in later sagas are often genuinely old. It is our best evidence that many myths were known in heathen times. It is also hard to read without help.

## The sagas

**Sagas** are prose stories written in Iceland mostly in the thirteenth and fourteenth centuries.

- **Kings' sagas,** such as Snorri Sturluson's **Heimskringla,** tell the history of Norway's kings, including descriptions of heathen feasts.
- **Sagas of Icelanders,** such as **Egils saga, Gísla saga** and **Eyrbyggja saga,** tell of the settlers and their feuds, with glimpses of heathen practice.
- **Legendary sagas** are fantastic adventures of an older, more distant past.

Sagas are literature written by Christians about their heathen ancestors. Some descriptions of rites are vivid and may keep real memories; others may be imagined, borrowed from the Bible or classical writers, or shaped to make the old ways look grand or sinister.

## Runic inscriptions

**Runes** were carved from at least the second century onwards. Most surviving inscriptions are short: names, memorials, makers' marks. The great Viking-age **runestones,** mostly from the late tenth and eleventh centuries, are memorials to the dead, and many are Christian, with crosses and prayers. A few invoke Thor, such as "may Thor hallow these runes". Runic inscriptions are precious because they were made in their own time, by the people themselves.

## Archaeology

Archaeology gives us what people did rather than what they wrote. Halls with special buildings for cult at places such as **Uppåkra** in Sweden and **Hofstaðir** in Iceland; great burials such as the **Oseberg** ship; weapons and goods offered in lakes and bogs; small figures that may be gods; amulets such as Thor's hammers. Archaeology can show that something was done, where and when. It rarely tells us why, or what words were said.

## Outsiders

People who were not heathen Germanic people also wrote about them, usually with an agenda:

- **Tacitus,** a Roman, wrote the **Germania** in 98, about first-century Germans: their gods, sacred groves and the casting of lots. He was also using them to criticise Rome.
- **Ibn Fadlan,** an envoy from Baghdad, described a Rus chieftain's funeral on the Volga in 921 to 922: vivid, disturbing and from an outsider.
- **Adam of Bremen,** a German churchman writing around 1075, described a temple at Uppsala with images of Thor, Wodan and Fricco, and a great sacrifice every nine years. He never went there, and wanted Sweden converted.
- **Bede,** an English monk, wrote in 725 of the old English months and of Mōdraniht, "mothers' night", at midwinter.
- **Saxo Grammaticus,** a Danish cleric, wrote the **Gesta Danorum** around 1200 in Latin, treating the gods as human sorcerers.

## Folklore

Later Scandinavian, English and German country people kept many customs and beliefs: house spirits, the Yule goat, the last sheaf left for Odin's horse, the Wild Hunt. Collectors such as **Jacob Grimm,** whose German Mythology appeared in 1835, gathered them and argued they were heathen survivals. Some may be; others grew up later; and Grimm's work was bound up with the nationalism of his day. Folklore shows us how people lived with these beings; it does not prove that a custom is pre-Christian.

## Putting it together

No single source is enough. Good practice weighs them together: if an Eddic poem, a skaldic verse, a runestone and an archaeological find all point the same way, you are on firm ground. If something appears only in one late saga or one modern book, hold it lightly.

> **Try this:** Open the app's page for Winter Nights and read its sources. For each, write who wrote it, roughly when, and what kind of source it is. Which statement on the page rests on the firmest ground?

## What's old and what's modern

- **Old:** the poems, verses, inscriptions, objects and accounts themselves.
- **Modern:** the way we weigh them together, and every practice built on them today.`,
    },
    {
      id: 'norse-tradition-snorri',
      title: 'Snorri Sturluson and his Edda: reading a brilliant, biased source',
      summary: 'Who Snorri was, what the Prose Edda is for, the ways his Christian learning and his love of order shape the myths, how his version of Baldr’s death compares with Saxo’s, and how to read him with gratitude and care.',
      minutes: 15,
      links: [deity('baldur'), journey('deity-baldur'), deity('odin'), deity('loki'), ritual('folk-havamal-reflection'), page('library')],
      body: `## Who Snorri was

**Snorri Sturluson** (1179 to 1241) was one of the most powerful men in Iceland: a wealthy chieftain, a lawspeaker of the Althing, a poet, a historian and a politician deeply involved with the Norwegian court. He was a Christian, writing two centuries after Iceland's conversion. He was killed at his farm at Reykholt in 1241, on the orders of the Norwegian king.

He wrote, or is believed to have written, two of the most important works for Heathens: **Heimskringla,** the history of the kings of Norway, and the **Prose Edda,** also called **Snorri's Edda,** written around 1220. Without Snorri we would know far less about the gods. Many of the stories Heathens love best, such as Thor's journey to Útgarða-Loki, Baldr's death and the full story of Ragnarök, are told fully only by him.

## What the Prose Edda is for

The Prose Edda is not a book of religion. It is a **handbook for poets.** Skaldic poetry used **kennings,** poetic names that depend on myths: gold might be called "Sif's hair" or "Freyja's tears". By Snorri's time young poets no longer knew the stories behind these, so he wrote them down. It has four parts:

- a **Prologue,** explaining the gods in Christian terms;
- **Gylfaginning,** "the tricking of Gylfi", in which a Swedish king questions three mysterious figures about the gods and the world;
- **Skáldskaparmál,** "the language of poetry", with kennings and more stories;
- **Háttatal,** a long poem showing off the metres.

## His biases

Reading Snorri well means knowing his habits. Scholars point to several.

**A Christian frame.** The Prologue begins with the Creation and the Flood, and explains the old gods as people who forgot the true God and worshipped nature. In Heimskringla, Odin is a human king who came north from Asia, from near Troy, and was worshipped after his death. This idea, that pagan gods were once great people, is called **euhemerism,** and it was a normal way for medieval Christians to explain other religions.

**A frame story with a twist.** In Gylfaginning the whole account is told to Gylfi by figures called High, Just-as-high and Third, and at the end the hall vanishes: Gylfi has been deceived. Snorri keeps a careful distance between himself and what is told.

**A love of system.** Snorri tidies. He gives neat lists of twelve gods and their halls, maps the worlds, and puts events in order from creation to doom. The older poems are messier and sometimes contradict each other. Much of the tidy "Norse cosmology" in modern books, such as nine worlds neatly arranged on Yggdrasil, is more systematic than any single old poem.

**Learned influence.** Snorri knew Latin learning, and some details may echo classical or Christian stories. Scholars debate how much: some think his account of Ragnarök, or of Hel as a place of the dishonoured dead, owes something to Christian ideas of the end and of hell.

**Gaps filled.** Where his sources ran out, Snorri may have filled the gap with his own invention, as a good storyteller would. We often cannot tell where.

## A test case: the death of Baldr

Compare two medieval tellings of Baldr's death.

In **Snorri,** Baldr dreams of his death. His mother Frigg makes everything swear not to harm him, except the mistletoe, which seems too young. The gods amuse themselves throwing things at him. Loki gives the mistletoe to the blind god Höðr, who throws it and kills Baldr. Hermóðr rides to Hel to ask for Baldr's return; Hel agrees if everything weeps for him, and all do except one giantess, who is perhaps Loki in disguise. Baldr stays with Hel until after Ragnarök.

In **Saxo Grammaticus,** writing in Latin about the same time, **Hotherus** (Höðr) is a human hero and Balderus his rival in love for a woman named Nanna. Hotherus kills Balderus with a magic sword. There is no mistletoe, no weeping and no Loki.

The Eddic poems give only glimpses: Völuspá mentions the mistletoe and Baldr's brother avenging him; Baldrs draumar has Odin asking a dead seeress about Baldr's fate. So the beautiful, complete story most people know is Snorri's, built from older pieces and his own art.

## How to read him

None of this means Snorri is useless. He had access to poems now lost, he quotes many genuine skaldic verses, and his love for the old stories is clear. Heathens read him with gratitude. But read him as you would any brilliant historian with a point of view:

1. **Check the poems.** Where an Eddic or skaldic poem tells the same story, read it and see what Snorri added.
2. **Notice when he is alone.** If a detail appears only in Snorri, say so when you teach it.
3. **Don't build doctrine on tidiness.** If your practice needs nine neat worlds, fine, but know where that neatness comes from.
4. **Remember the frame.** The Prose Edda is a book of stories for poets, told by deceivers in a vanishing hall. It is not a catechism.

> **Try this:** Read the story of Thor's fishing for the Midgard Serpent in Snorri's Gylfaginning, then read the Eddic poem Hymiskviða, which tells it too. Write down three things Snorri tells you that the poem does not.

> **Note:** You will also meet the opposite mistake: people who say that because Snorri was Christian, nothing he wrote is any use. That goes too far. The honest position is careful, grateful reading.

## What's old and what's modern

- **Old:** the stories Snorri drew on, and the skaldic verses he quotes.
- **Modern:** the study of his biases, and the scholarly debate over how much of his Edda is his own.`,
    },
    {
      id: 'norse-tradition-modern-heathenry',
      title: 'Modern Heathenry: the revival, its groups and its ways',
      summary: 'How Heathenry was revived: the Romantic and völkisch movements and their dark legacy, the new start from the 1970s (Ásatrúarfélagið, The Troth, Forn Sed and others), reconstruction and modern practice told apart, and the inclusive, tribal and folkish stances.',
      minutes: 15,
      links: [journey('path-norse'), closed(), closed('sami'), page('closed-guide'), page('community-rituals'), page('journeys')],
      body: `## Before the revival

Interest in the old Germanic gods grew in the nineteenth century with **Romanticism:** poets, painters and scholars such as Jacob Grimm looked to the past for the soul of their nations, and Richard Wagner put the gods on the opera stage. Much of this was beautiful, and some of it was learned. It was also bound up with nationalism.

In Germany and Austria around 1900 this turned into the **völkisch** movement, which mixed Germanic myth with ideas of racial purity. **Guido von List** invented "Armanen" runes and a secret priesthood; groups such as Ludwig Fahrenkrog's **Germanische Glaubens-Gemeinschaft,** which took that name in 1913 (its roots go back to about 1907), tried to make a Germanic religion. These ideas fed into Nazism. The Nazis took up runes and Germanic imagery for their own ends, and some leaders, especially Heinrich Himmler, were drawn to an invented Germanic mysticism. It is important to know this history, because its symbols and ideas still circulate, and because it shows what happens when a religion is made to serve a theory of race.

## A new start

The Heathenry practised today mostly begins in the **early 1970s,** in several places at once and largely independently:

- In **Iceland,** the farmer and poet **Sveinbjörn Beinteinsson** and others founded **Ásatrúarfélagið** in 1972; it was recognised as a religion by the state in 1973. It is now one of Iceland's larger religious bodies and is building a temple in Reykjavík.
- In **Britain,** the **Odinic Rite** and other groups formed in the 1970s.
- In **North America,** **Else Christensen** founded the Odinist Fellowship in 1969, and **Stephen McNallen** founded what became the Asatru Free Assembly in the 1970s. Both strands had folkish views from the start.
- **The Troth,** first called the Ring of Troth, was founded in the United States in 1987 and is now firmly inclusive.
- **Theodish belief,** founded by Garman Lord in 1976, rebuilds early English religion around the bonds of a lord and his people.
- In **Scandinavia,** groups such as **Forn Siðr** in Denmark and **Samfälligheten för Nordisk Sed** in Sweden formed in the 1990s.

Today there are Heathens on every continent, in organised groups, small kindreds and solitary practice.

## Reconstruction and modern practice

Most Heathens describe their religion as **reconstructionist** in some degree: they build on the evidence, study the sources, and try to understand the old world-view before adding to it. But no Heathen today practises exactly as anyone did in the year 900, and no one should claim to. In practice, Heathenry mixes:

- **reconstruction:** customs with good evidence, such as toasts at feasts, offerings for a good year, the seasonal feasts, honouring the dísir and the land;
- **re-creation:** modern forms that fill gaps in the spirit of the evidence, such as the shape of a modern blót or the three rounds of sumbel;
- **innovation:** things that are new, such as the hammer hallowing, the Nine Noble Virtues, rune divination systems, and oracular seiðr as practised now.

Heathens also speak of **UPG,** "unverified personal gnosis": what a person believes they have learned from the gods directly, which is not in the sources. UPG is honest and normal; it should simply be named as such and not presented as lore.

## Words you will hear

Modern Heathens use many Old Norse and Old English words, some old in meaning and some given new meanings:

- **kindred** or **hearth:** a local group;
- **gothi** and **gythia:** a man and a woman who lead rites (in Iceland a goði was a chieftain with a temple duty and a seat at the assembly; the modern role is mostly religious);
- **frith:** peace and good order among kin and friends, a much-loved modern word built on an old one;
- **innangarðs** and **útangarðs:** "inside the fence" and "outside the fence", used today for those within and outside a community's bonds;
- **troth:** faithfulness, loyalty, keeping one's word;
- **wyrd** and **ørlög:** what has been laid down, the working of fate and deeds.

These words are useful, but some modern uses go further than the sources. "Innangarðs" in particular has been used by folkish groups to mean a racial in-group; in its honest sense it is about bonds of choice and obligation.

## Witches and Heathens

Some people honour the Norse gods within witchcraft or Wicca, casting a circle and calling quarters. That is a legitimate modern practice, but it is a different one, and many Heathens are wary of being mixed up with it. A Norse-flavoured eclectic witch and a reconstructionist Heathen can learn from each other, as long as each is honest about what they are doing.

## The three stances

Heathens often describe three broad positions on who belongs:

- **Inclusive or universalist:** anyone called to the gods may honour them, of any ancestry. This is the stance of most organised Heathenry today, including Ásatrúarfélagið, The Troth and many Scandinavian groups, and of this coven.
- **Tribal:** the focus is on a particular group, its bonds and its oaths, with membership open by choice and commitment rather than by birth.
- **Folkish:** the religion is said to belong to people of northern European descent. At its edges this shades into open white supremacy.

The next lesson explains why the folkish stance is rejected here, and how to recognise it.

> **Your coven:** Ask your mentor which groups your coven has links with, and where it stands. A good coven answers that question plainly.

> **Try this:** In your book, make three columns: reconstruction, re-creation and innovation. Over the coming weeks, put each practice you meet in this course into one of them, and note where you are unsure.

## What's old and what's modern

- **Old:** the gods, the feasts and customs that the evidence supports.
- **Modern:** every Heathen group and almost every ritual form now in use, and the nineteenth-century revival with its dark legacy.`,
    },
    {
      id: 'norse-tradition-symbols-and-misuse',
      title: 'The gods belong to everyone: misuse, symbols and Declaration 127',
      summary: 'Why Heathenry attracts racists and why their claims fail on the evidence; the symbols they have stolen and how to recognise them; what Declaration 127 was; and how a member or a coven can respond calmly when hate appears.',
      minutes: 15,
      links: [closed(), deity('thor'), deity('odin'), deity('tyr'), journey('path-norse'), ritual('folk-havamal-reflection'), coven('standing')],
      body: `## Why this lesson exists

This is not a lecture. It is practical knowledge that every Heathen needs, because sooner or later you will meet someone using the gods, runes or the word "folk" to mean something hateful. Knowing the history and the signs lets you recognise it quickly, avoid being drawn in, and help others.

## Why racists are drawn to Heathenry

The far right has been drawn to Norse imagery since the völkisch movement and the Nazis, for reasons that have little to do with the gods: a fantasy of a pure, warlike, white past. In prisons and online, some white-supremacist groups use Odin and the runes as a banner. And some Heathen groups, calling themselves **folkish,** teach that the religion belongs only to people of northern European descent, sometimes with the idea that the gods are carried in the blood.

## Why those claims fail

The folkish claim does not stand up to the evidence:

- **The old sources do not tie the gods to a race.** The idea of race used by folkish groups was invented in the eighteenth and nineteenth centuries. The heathen Norse cared about kin, household and oaths, not skin colour.
- **The Norse were never isolated.** They traded with Baghdad and Byzantium, settled among the Irish, the English, the Sámi and the Slavs, married across those lines, and brought people home. DNA studies of Viking-age graves show a mixed population.
- **People joined by choice.** In the sagas, people move between households, are adopted, foster children, swear into a lord's following. Belonging was made by oath and gift, not given by blood.
- **The modern religion was rebuilt from books.** Every Heathen today, of whatever ancestry, learned the gods from translations, scholarship and practice. No one inherited an unbroken faith.

So this coven, like most of organised Heathenry, holds that the gods call whom they will. Heathenry is open to people of every ancestry, colour, gender and sexuality. Honouring your own ancestors, whoever they were, is part of the religion; using ancestry to exclude others is not.

## Declaration 127

In 2016 the **Asatru Folk Assembly,** an American folkish organisation, published a statement affirming that its membership was based on ancestry and opposing same-sex and transgender identities. In response, Heathen groups published **Declaration 127,** stating that they would not associate with that organisation. Many groups from around the world signed it.

It is named after verse 127 of the **Hávamál,** in which Odin advises, in one common translation: "where you recognise evil, speak out against it, and give no truce to your enemies." The declaration became a public sign of where much of Heathenry stands. Civil-rights monitors have since listed the Asatru Folk Assembly as a hate group: the Southern Poverty Law Center has done so since its count for 2017.

## Symbols to recognise

Most Norse symbols are entirely innocent and widely worn. A few have been taken by the far right, and some are now used almost only by it. Know them:

- **The "Black Sun"** (a wheel of twelve jagged rays): this is **not** an ancient Norse symbol. It comes from a floor mosaic in Wewelsburg castle, made for the SS. It is a hate symbol.
- **Double sowilo runes** in the jagged style of the SS badge, the **othala rune with wings or feet** as on Nazi uniforms, and the **Wolfsangel** in its Nazi forms: hate symbols in those exact styles.
- **Runes combined with numbers** such as 14 or 88, which are white-supremacist codes.
- **Valknut and Mjölnir** (Thor's hammer): ordinary Heathen symbols, worn by countless Heathens. Racists use them too, so context matters: the same hammer on a necklace at a blót and on a banner beside a swastika mean different things.
- **The algiz and othala runes** in their plain forms are ordinary runes, used in divination and in the app's own rune draws. Only particular styles and combinations signal hate.

Two other symbols are often called Viking but are not: the **Vegvísir** and the **Helm of Awe** (ægishjálmur) come from Icelandic magical manuscripts of the seventeenth to nineteenth centuries. They are not hate symbols; they are simply not Viking.

## When hate appears

You do not need to win an argument. Some calm, practical steps:

1. **In your own coven:** if someone uses racist language or symbols, tell your mentor or the coven's head. A good coven acts on it, through its agreements and its way of handling complaints.
2. **In a wider group or online:** you can say plainly that you don't share that view, decline to take part, and leave. You do not owe anyone a debate.
3. **When choosing a group:** ask where it stands on ancestry and membership. Be wary of talk of "the folk", "our blood", "metagenetics" or "ancestral memory" used to exclude.
4. **For yourself:** if you are new and have picked up folkish ideas from books or the internet, that is common. Read the evidence, talk to your mentor, and decide for yourself. People change their minds.

> **Your coven:** Your coven's agreements in the app say how it handles behaviour that harms others. Ask your mentor how your coven would respond to racist language at a rite.

> **Try this:** Read verse 127 of the Hávamál in a translation of your choice, and the verses around it. Write a few lines on what it might ask of you, in ordinary life.

## What's old and what's modern

- **Old:** the Hávamál and its advice, and the runes and the hammer as Viking-age signs.
- **Modern:** the racist misuse of these symbols, from the völkisch movement on; the Black Sun, which was invented for the SS; the folkish and inclusive stances; and Declaration 127.`,
    },
  ],
  quizzes: [
    {
      id: 'quiz-norse-tradition',
      title: 'The Heathen tradition: test',
      intro: 'Thirteen questions on the peoples, the sources and their limits, Snorri, the modern revival and the misuse of Heathen symbols. Most are scored at once; your mentor reads the two written answers. You need 80% to pass, and you can try again.',
      passPercent: 80,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'What did “víkingr” mean in Old Norse?',
          options: ['Any Scandinavian person', 'Someone who went raiding by sea', 'A priest of Odin', 'A farmer'],
          correct: [1],
          points: 1,
          explanation: 'It was an activity, not a people. Most Scandinavians of the Viking age were farmers, traders and craftspeople.',
        },
        {
          id: 'q2',
          type: 'multi',
          prompt: 'Which pairs name the same god in different Germanic languages? Choose all that apply.',
          options: ['Odin and Woden', 'Thor and Thunor', 'Tyr and Tiw', 'Freyr and Wotan'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Odin is Woden or Wodan, Thor is Thunor or Donar, Tyr is Tiw or Ziu. Wotan is Odin, not Freyr.',
        },
        {
          id: 'q3',
          type: 'single',
          prompt: 'When was the Codex Regius of the Poetic Edda written?',
          options: ['Around 800, in Norway', 'Around 1270, in Iceland', 'Around 1835, by Jacob Grimm', 'Around 98, by Tacitus'],
          correct: [1],
          points: 1,
          explanation: 'Around 1270 in Iceland, about two and a half centuries after Iceland’s conversion, though the poems are older.',
        },
        {
          id: 'q4',
          type: 'single',
          prompt: 'Which kind of source is often our best evidence that a myth was known in heathen times?',
          options: ['Legendary sagas', 'Skaldic verse composed by heathen poets', 'Nineteenth-century opera', 'Modern rune books'],
          correct: [1],
          points: 1,
          explanation: 'Skaldic verse was composed in heathen times and its strict form made it hard to change.',
        },
        {
          id: 'q5',
          type: 'multi',
          prompt: 'Which of these are biases or habits to keep in mind when reading Snorri’s Edda? Choose all that apply.',
          options: ['A Christian frame, with the gods explained as people', 'A love of tidy systems the older poems lack', 'The whole account is told by deceivers in a vanishing hall', 'He was a heathen priest writing in the Viking age'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'Snorri was a thirteenth-century Christian chieftain, writing a handbook for poets with a Christian frame and a love of order.',
        },
        {
          id: 'q6',
          type: 'single',
          prompt: 'In Saxo Grammaticus’s version of Baldr’s death, how is Balderus killed?',
          options: ['By mistletoe thrown by the blind Höðr', 'By the human hero Hotherus with a magic sword, as rivals in love', 'By Loki with a spear', 'By a giantess’s refusal to weep'],
          correct: [1],
          points: 1,
          explanation: 'Saxo has no mistletoe and no Loki: the story most people know is Snorri’s.',
        },
        {
          id: 'q7',
          type: 'truefalse',
          prompt: 'Adam of Bremen visited the temple at Uppsala and described it from what he saw himself.',
          options: ['True', 'False'],
          correct: [1],
          points: 1,
          explanation: 'False. He wrote from reports, as a churchman who wanted Sweden converted.',
        },
        {
          id: 'q8',
          type: 'single',
          prompt: 'Which of these is a modern innovation, not reconstruction?',
          options: ['Toasts at feasts for a good year and peace', 'The Nine Noble Virtues', 'Honouring the dísir', 'Seasonal feasts at the start of winter'],
          correct: [1],
          points: 1,
          explanation: 'The Nine Noble Virtues were drawn up in the 1970s. The others rest on old evidence.',
        },
        {
          id: 'q9',
          type: 'single',
          prompt: 'Where does the “Black Sun” symbol come from?',
          options: ['A Viking-age runestone', 'A floor mosaic made for the SS at Wewelsburg castle', 'The Poetic Edda', 'An Icelandic magical manuscript'],
          correct: [1],
          points: 1,
          explanation: 'It is not ancient. It was made for the SS and is a hate symbol.',
        },
        {
          id: 'q10',
          type: 'multi',
          prompt: 'Which statements about the folkish claim are supported by the evidence? Choose all that apply.',
          options: ['The Norse traded and settled widely and mixed with many peoples', 'Belonging in the sagas was often made by oath, fostering and gift', 'Modern Heathenry was rebuilt from books anyone can read', 'The old sources restrict the gods to people of one race'],
          correct: [0, 1, 2],
          points: 1,
          explanation: 'The old sources do not tie the gods to a race; the modern idea of race is far later.',
        },
        {
          id: 'q11',
          type: 'single',
          prompt: 'Verse 127 of the Hávamál, which named Declaration 127, advises what?',
          options: ['To drink no more than three horns', 'To speak out against evil where you recognise it', 'To keep your ancestry pure', 'To never travel without a weapon'],
          correct: [1],
          points: 1,
          explanation: 'Where you recognise evil, speak out against it. The declaration took that as its name.',
        },
        {
          id: 'q12',
          type: 'short',
          prompt: 'Choose one primary source you read for this module. Say who wrote or recorded it, roughly when, and one thing it can and one thing it cannot tell us about heathen religion.',
          points: 3,
          explanation: 'Asking who, when, where and why is the core skill of honest Heathen study.',
          rubric: 'Full marks (3): names a real primary source and accurately gives its author or recorder and rough date (1); names something it can reasonably tell us (1); names a real limit, such as Christian authorship, distance in time, outsider bias, or being literature (1).',
        },
        {
          id: 'q13',
          type: 'short',
          prompt: 'Someone at a gathering wears a symbol you recognise as a hate symbol and talks about Heathenry being “for our folk only”. What would you do, and why?',
          points: 2,
          explanation: 'You do not need to win an argument; you do need to know where you stand and what to do.',
          rubric: 'Full marks (2): describes a calm, safe and practical response, such as declining to engage, saying plainly they disagree, leaving, or telling the coven’s head or mentor (1); grounds it in the lesson, for example the evidence against the folkish claim, the coven’s inclusive stance or Declaration 127 (1). Mentor: an answer that sympathises with the folkish view should lead to an open, kind conversation before the test is passed.',
        },
      ],
    },
  ],
  stages: [
    {
      title: 'The Heathen tradition',
      intro: 'Here you learn what Heathenry is and is not: the peoples and languages, the kinds of source and their limits, Snorri and his biases, the modern revival and its groups, and why the gods belong to everyone. Take your time over the sources; they are the ground everything else stands on.',
      passed_by: 'mentor',
      tasks: [
        {
          title: 'Who were the Norse?',
          kind: 'study',
          instructions: `1. Read "Who were the Norse? Peoples, languages and the conversion".
2. Do the "Try this": find the Germanic language nearest to you, and learn "hail" and one weekday named after a god.
3. In the answer box, write what you found, and whether your coven works mainly from the Norse or the Anglo-Saxon sources.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['norse-tradition-peoples-and-languages'],
          links: [page('library')],
        },
        {
          title: 'Reading the sources',
          kind: 'study',
          instructions: `1. Read "The sources and their limits".
2. Open the app's page for Winter Nights and do the "Try this": name the kind of source behind each statement.
3. Read one short primary source in translation: the first twenty verses of Völuspá, the first part of the Hávamál, or the chapter of Hákonar saga góða in Heimskringla that describes a sacrificial feast.
4. In the answer box, write who wrote or recorded it, when and why, and one thing it can and cannot tell you.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['norse-tradition-sources-and-their-limits'],
          links: [holy('norse/vetrnaetur'), ritual('folk-havamal-reflection')],
        },
        {
          title: 'Reading Snorri',
          kind: 'study',
          instructions: `1. Read "Snorri Sturluson and his Edda".
2. Do the "Try this": compare Snorri's telling of Thor's fishing with the poem Hymiskviða.
3. In the answer box, list three things Snorri adds, and one thing you will now say differently when you tell a myth.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 60,
          docs: ['norse-tradition-snorri'],
          links: [deity('thor'), deity('baldur')],
        },
        {
          title: 'The modern revival',
          kind: 'study',
          instructions: `1. Read "Modern Heathenry: the revival, its groups and its ways".
2. Start the three-column page in your book (reconstruction, re-creation, innovation).
3. Mark this task done when you have.`,
          times: 1,
          response: 'none',
          checked_by: 'self',
          minutes: 40,
          docs: ['norse-tradition-modern-heathenry'],
          links: [journey('path-norse'), page('grimoire')],
        },
        {
          title: 'The gods belong to everyone',
          kind: 'reflection',
          instructions: `1. Read "The gods belong to everyone: misuse, symbols and Declaration 127".
2. Read verse 127 of the Hávamál and the verses around it.
3. In the answer box, write in your own words why the folkish claim fails, which symbols you now know to recognise, and what you would do if you met hate at a gathering.`,
          times: 1,
          response: 'text',
          checked_by: 'mentor',
          minutes: 40,
          docs: ['norse-tradition-symbols-and-misuse'],
          links: [coven('standing'), closed()],
        },
        {
          title: 'Talk it over',
          kind: 'meeting',
          instructions: `1. Meet your mentor, in person or by message on this step.
2. Talk about your coven's approach: which sources it leans on, which groups it has links with, where it stands, and how it marks modern practice.
3. Bring one question about the sources you could not answer yourself.`,
          times: 1,
          response: 'none',
          checked_by: 'mentor',
          minutes: 45,
          docs: ['norse-tradition-modern-heathenry'],
          links: [coven('book')],
          solitary: 'Write a page in your book describing your own approach: which sources you trust most, which gods, where you stand on who may honour them, and how you will mark what is modern. If you can, share it with an experienced inclusive Heathen at a moot or in an online group and ask for their view.',
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
          minutes: 30,
          quiz: 'quiz-norse-tradition',
          links: [journey('path-norse'), spread('nine-worlds')],
        },
      ],
    },
  ],
} satisfies CourseModule;
