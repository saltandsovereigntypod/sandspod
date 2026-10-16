import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'path-norse',
  kind: 'path',
  paths: ['norse'],
  title: 'The Heathen Way',
  summary: `Thirteen weeks with the gods, wights and ancestors of the North: the Eddas and sagas, the gift cycle and frith, blót and sumbel, the holy tides and the runes, ending in a self-dedication over the horn.`,
  welcome: `This is a season-long walk into Heathenry, the modern revival of the pre-Christian religion of the Norse and other Germanic peoples. You will read the sources, meet the gods and the spirits of land and home, learn to give a blót and hold a sumbel, and keep the tides of the year. At the end, if it is right for you, you dedicate yourself to the way in a rite of your own.

It is a self-dedication, not an initiation. Most Heathenry has no initiation in the Wiccan sense, but kindreds and organisations have their own ways of welcoming people, and nothing here replaces them. The journey is for anyone who feels the pull, whatever your ancestry. The gods of the North do not check bloodlines, and neither do we.`,
  about: `Heathenry (also called Ásatrú, Forn Sed or the Northern Tradition) is a living polytheist religion rebuilt over the last fifty years from medieval Icelandic texts, older poetry, runic inscriptions and archaeology. Its heart is relationship: with the gods (the Æsir and Vanir), with the wights of land and house, and with the ancestors, kept up by gifts given and returned. Its main rites are the blót, an offering, and the sumbel, a ritual round of drinking and speech. Nearly everything we know was written down by Christians two or more centuries after conversion, so honest Heathens hold the sources with both love and caution. Modern Heathenry is split between inclusive groups and a "folkish" minority who tie the religion to race. This app stands with the inclusive majority, without reservation.`,
  notes: [
    `The surviving myths come mostly from 13th-century Iceland, written by Christians. They are precious and they are not scripture; Heathens read them as poetry and memory, not dogma.`,
    `The app is inclusive and anti-racist. The gods of the North belong to everyone who honours them. "Folkish" groups that restrict Heathenry by ancestry are named in this journey, and so are the symbols racists have stolen, so you can recognise them.`,
    `The Nine Noble Virtues, rune divination systems, the blank rune and most modern seiðr are modern creations. They can be meaningful; they are not ancient, and the journey says so where they come up.`,
    `Oaths matter in Heathenry. Words spoken over the horn are meant to be kept, so the journey teaches you to swear small and keep it, or to make a declaration rather than an oath.`,
    `Loki is honoured by some Heathens and banned from the horn by many kindreds. That is a real disagreement, and you will meet both views.`,
    `Offerings go onto soil, never into drains or waterways, and only foods that are safe for animals that might find them.`,
  ],
  holyDays: ['thorrablot', 'disablot', 'sigrblot', 'midsummer', 'haustblot', 'vetrnaetur', 'jol'],
  stages: [
    {
      kind: 'threshold',
      title: 'At the Door of the Hall',
      intro: `Before you read anything, introduce yourself. Heathenry begins where you live: the land under your building, the spirits of your home, and the gods you hope to know. This week you set up a simple place for offering, greet the land, and make your first small gift.`,
      days: 7,
      lessons: [],
      practices: [
        {
          id: 'norse-morning-hail',
          title: 'A morning hail',
          instructions: `Each morning for a week, stand at a window or your door, raise your hands palms up, and greet the day, the night that has passed, the gods and the earth in your own words, or with Sigrdrífa's hail from the opening rite. It takes a minute. Note anything you notice about the light, the weather, the land.`,
          times: 7,
          every: 'day',
          prompt: `What did the land look like this morning? Did anything in the greeting feel true, or awkward?`,
        },
        {
          id: 'norse-threshold-journal',
          title: 'Why the North?',
          instructions: `Write a page on what drew you to Heathenry: a god, a saga, a feeling, a family story, a show. Be honest, including about the parts that come from films or games. Many good Heathens started with a Marvel film or a Viking series; what matters is where you go next.`,
          times: 1,
          prompt: `What do I hope to find here, and what am I unsure about?`,
        },
      ],
      rite: {
        title: 'Greeting the Land and the House',
        summary: `A first offering to the spirits of the place you live, and a word to the gods that you have come to learn.`,
        minutes: 20,
        ingredients: [
          { name: 'A cup or small horn', ref: 'traditional/tool/chalice' },
          { name: 'Mead, ale, cider, milk or apple juice' },
          { name: 'A small bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A piece of bread or a spoon of porridge with butter' },
          { name: 'A sprig of evergreen (juniper, fir or pine)', ref: 'traditional/herb/juniper', optional: true },
          { name: 'A candle', optional: true },
        ],
        preparation: `Wash your hands and face. Clear a shelf or a corner of a table: this will be your stalli, your offering place, for the journey. Set the cup and bowl on it. If you can get outside to a patch of earth, a tree or a planter, plan to finish there; if not, a balcony pot or windowsill plant will do.`,
        steps: [
          {
            title: 'Stand and settle',
            instructions: `Stand before your offering place. Light the candle if you are using one. Take a few slow breaths and feel your feet on the floor, and below the floor the building, and below that the land, which was here long before any house.`,
            light: true,
            minutes: 2,
          },
          {
            title: 'Hail the day and the gods',
            instructions: `Raise your arms, palms up, and speak the hail that the valkyrie Sigrdrífa gives on waking in the Poetic Edda. It is the oldest Heathen greeting we have.`,
            spoken: `Hail, day! Hail, sons of day!
And night and her daughter now!
Look on us here with loving eyes,
That waiting we victory win.
Hail to the gods! Ye goddesses, hail,
And all the generous earth!`,
          },
          {
            title: 'Name yourself',
            instructions: `Say who you are, where you live, and why you are here, plainly. You are a guest in this tradition and on this land, and a guest announces themselves.`,
            spoken: `I am [your name], who lives in this place.
I have come to learn the old ways of gift and frith.
I ask the wights of this land and this house to know me,
and I ask the holy gods to see me as I begin.`,
          },
          {
            title: 'Give the first gift',
            instructions: `Fill the cup. Hold it up, drink one small sip, then pour the rest into the bowl and put the bread or porridge beside it. A sip is your share; the rest is theirs. This is the gift cycle in its simplest form.`,
            spoken: `A gift for a gift. This is given freely.`,
          },
          {
            title: 'Carry it out',
            instructions: `Take the bowl outside and pour it onto the soil at the foot of a tree or into a planter, and set the bread down. If you cannot go outside, leave it on the sill overnight and put it out in the morning. Stand for a moment and listen.`,
            minutes: 3,
          },
          {
            title: 'Close',
            instructions: `Come back in, thank the wights and the gods, and snuff the candle. Wash the cup and bowl. Write a few lines in your journal.`,
            snuff: true,
          },
        ],
        closing: `The rite is ended. Leave your offering place set up; you will use it all journey.`,
        safety: `Never leave a candle unattended, and keep it away from curtains, pets and the evergreen. If you drink alcohol, a sip is plenty; juice and milk are just as good. Pour offerings on soil, not into drains or rivers, and don't leave food with onion, chocolate or grapes where dogs or cats can reach it. Butter and bread in small amounts are fine.`,
      },
    },
    {
      kind: 'study',
      title: 'The Lore and the Holy Powers',
      intro: `Six weeks with the sources and the beings they describe: who wrote the myths and why that matters, the gods, the wights, the ancestors, the ethic of the gift, the modern Nine Noble Virtues, and the runes. Read a lesson or two a week and keep up your weekly gift to the land.`,
      days: 42,
      lessons: [
        {
          id: 'norse-sources',
          title: 'What Survives, and Who Wrote It',
          summary: `The Eddas, sagas, runestones and digs: what each can tell you, and the Christian hands they passed through.`,
          minutes: 7,
          sections: [
            {
              heading: 'Two Eddas and a stack of sagas',
              body: `Almost everything people call "Norse mythology" comes from Iceland in the 1200s. The Poetic Edda is a collection of anonymous poems about gods and heroes, best known from a single manuscript, the Codex Regius, written around 1270. Some of its poems are probably much older than the book, carried by memory for generations; how much older is argued over poem by poem.

The Prose Edda was written around 1220 by Snorri Sturluson, an Icelandic chieftain, lawyer and poet. It is a handbook for young poets, explaining the myths behind the kennings, the riddling poetic names like "Freyja's tears" for gold. Snorri also wrote Heimskringla, a history of the kings of Norway, which holds our best descriptions of blót. Then there are the sagas of Icelanders, prose stories of farming families written in the 13th and 14th centuries about people who lived in the 10th and 11th.`,
            },
            {
              heading: 'Snorri the Christian',
              body: `Iceland voted to become Christian at its assembly, the Althing, in about the year 1000. Snorri wrote more than two centuries later, as a Christian, for Christian readers. He opens his Edda by explaining the gods as ancient human kings from Troy whom people later mistook for gods. He tidies the myths into a neat system, and in places he seems to fill gaps with his own invention or with ideas borrowed from Christian learning.

That does not make him worthless. Snorri quotes old poems we would otherwise not have, and he clearly loved the tradition. But when a modern book says "the Norse believed", it often means "Snorri wrote". The poems are usually older and stranger, and where Snorri and the poems disagree, Heathens and scholars tend to trust the poems.`,
            },
            {
              heading: 'Outsiders, stones and soil',
              body: `Other sources come from outside. The Roman Tacitus wrote about the Germanic tribes in AD 98, and Adam of Bremen, a German churchman, described a great temple at Uppsala around 1075, with nine of every kind of male creature offered every ninth year. The Arab traveller Ibn Fadlan watched a Rus funeral on the Volga in 922. Each had his own agenda, and none was a believer.

Then there is evidence that never passed through a writer at all. Runestones carry real Viking Age words, and a few, like the Glavendrup stone in Denmark, ask Thor to hallow the runes. Archaeology has found feasting halls and cult houses, like the one at Uppåkra in Sweden, tiny gold-foil figures (guldgubber) left at holy sites, weapons and jewellery sunk in bogs and lakes, and the cattle-skull feasts at Hofstaðir in Iceland. These show us what people did, even when they cannot tell us what they thought.`,
            },
            {
              heading: 'Reading like a Heathen',
              body: `So how do you use all this? Most Heathens treat the lore as the starting point, not a rulebook. You read the poems for the gods' characters and the values they show. You read the sagas for how ordinary people kept house, feast and feud. You read the archaeology for what was actually offered. And you are honest about the gaps, filling them with careful modern practice, which Heathens often call "UPG" (unverified personal gnosis) when it comes from personal experience rather than sources.

A good habit from day one: when you read a claim about the old religion, ask "says who, and when?" It will save you from a lot of internet nonsense.`,
            },
          ],
          knowAndDont: {
            known: `The Poetic Edda survives mainly in the Codex Regius (c. 1270); Snorri wrote the Prose Edda around 1220 and Heimskringla around 1230; Iceland converted around 1000. Runestones, cult sites, hoards and bog offerings give direct evidence of Viking Age and earlier practice.`,
            unknown: `How old most Eddic poems are, how much Snorri invented, and how far Icelandic sources reflect religion in Norway, Sweden, Denmark or among the Anglo-Saxons and continental Germans. Pre-Christian religion also varied by region and century; there was never one "Norse religion" with a creed.`,
          },
          inPractice: `Get a translation of the Poetic Edda and start reading the Hávamál and the Völuspá. Keep a page in your journal headed "Says who?" and note, as you go, which ideas come from the poems, which from Snorri, and which from modern books.`,
          reflect: [
            `Does it trouble you that the myths came through Christian hands? What does it change about how you read them?`,
            `Which kind of evidence speaks to you most: poems, sagas, or objects in the ground?`,
          ],
          further: [
            `The Poetic Edda, trans. Henry Adams Bellows (1923, public domain), or Carolyne Larrington's translation (Oxford)`,
            `Snorri Sturluson, The Prose Edda, trans. Anthony Faulkes or Jesse Byock`,
            `Neil Price, Children of Ash and Elm: A History of the Vikings (2020)`,
            `John Lindow, Norse Mythology: A Guide to the Gods, Heroes, Rituals, and Beliefs (2001)`,
          ],
          premade: ['folk-havamal-reflection'],
        },
        {
          id: 'norse-gods',
          title: 'Æsir, Vanir and the Giants',
          summary: `The two families of gods, the beings beyond the walls, and how to begin with one god without ignoring the rest.`,
          minutes: 8,
          sections: [
            {
              heading: 'Two families who made peace',
              body: `The gods in the sources come in two families. The Æsir include Odin, the wandering seeker of wisdom and lord of poetry and the slain; his wife Frigg, who knows all fates and keeps silent; Thor, protector of gods and people, whose hammer hallows and defends; Tyr, the one-handed god of justice and the binding of oaths; Baldur the bright, whose death begins the end of the world; Heimdall the watchman; and Iðunn, keeper of the apples of youth.

The Vanir are gods of fertility, wealth and the sea: Njörðr of ships and harbours, and his children Freyr and Freyja. Freyr brings good harvests, peace and prosperity; Freyja is a goddess of love and longing, of gold, of battle (she takes half the slain) and of seiðr, a kind of magic. The Völuspá tells of a war between the two families, and Snorri describes the peace that followed: they exchanged hostages, and the Vanir came to live among the Æsir. In practice, Heathens honour both together.`,
            },
            {
              heading: 'Beyond the walls',
              body: `Outside the gods' enclosure live the jötnar, usually translated "giants". They are not simply monsters. Many are wise and ancient, and they are kin to the gods: Odin's mother Bestla is a giantess, and Skaði, Gerðr and Loki's family all marry or move among the gods. They stand for the wild, untamed forces of frost, fire, sea and mountain.

Loki is the hardest case. He is Odin's blood-brother, a clever shape-shifter who gets the gods out of trouble he often got them into, and in the end he brings about Baldur's death and fights against the gods at Ragnarök. Some modern Heathens honour him as a god of change and wit. Many kindreds will not hail him at sumbel, out of respect for the other gods and because of his role in the myths. A few Heathens also honour the jötnar more broadly. Neither stance is "the real one"; when you join a group, ask its custom and follow it in their hall.`,
            },
            {
              heading: 'Gods with many faces',
              body: `The old gods were not fixed characters in a novel. Odin has more than 150 names in the poems, from Grímnir, "the masked one", to Alföðr, "all-father". Thor was the most popular god in much of Viking Age Scandinavia, judging by place names and hammer pendants, while Freyr was central at Uppsala. Some gods may have merged or split over time; whether Freyja and Frigg were once a single goddess is an open question, since their names, roles and the myths around them overlap in suggestive ways.

The Anglo-Saxons and continental Germans had related gods with their own names: Woden, Thunor, Tiw, Frige. Their days still sit in the English week, as Wednesday, Thursday, Tuesday and Friday.`,
            },
            {
              heading: 'Starting with one',
              body: `You do not have to pick a "patron". Many Heathens honour the gods as a household, giving to all at the big tides and to one or two in daily life. Begin by reading the god's myths in the Eddas, learning a few of their names, and giving simple gifts: mead or beer for Odin and Thor, a share of bread and the first fruits for Freyr, honey and flowers for Freyja, a well-kept home and a quiet moment for Frigg. Watch what happens in your life and your dreams, and be patient. Relationships with gods grow like friendships, by turning up.`,
            },
          ],
          knowAndDont: {
            known: `The Eddas name the Æsir and Vanir and describe a war and truce between them. Place names, amulets and runestones show Thor and Freyr were widely honoured in the Viking Age; Odin is prominent among poets and kings.`,
            unknown: `Whether the Æsir and Vanir were really two distinct groups in living religion or a later literary scheme; whether Freyja and Frigg were once one goddess; and whether Loki was ever worshipped at all. There is no evidence of a cult of Loki in the Viking Age; modern devotion to him is new.`,
          },
          inPractice: `Choose one god or goddess to read about this week. Find their main myths, write down three of their names and what they mean, and give a small gift at your offering place with a few words of greeting. Note how it felt.`,
          reflect: [
            `Which of the gods are you drawn to, and which make you uneasy? Why?`,
            `What do you think of the debate around Loki? What would you do as a guest in a hall that bans his name?`,
          ],
          further: [
            `Völuspá and Grímnismál in the Poetic Edda (the god-names list is in Grímnismál)`,
            `H. R. Ellis Davidson, Gods and Myths of Northern Europe (1964)`,
          ],
          library: ['traditional/deity/odin', 'traditional/deity/thor', 'traditional/deity/frigg', 'traditional/deity/freyja', 'traditional/deity/freyr', 'traditional/deity/tyr', 'traditional/deity/loki', 'traditional/deity/skadi', 'traditional/deity/baldur', 'traditional/deity/idunn'],
        },
        {
          id: 'norse-wights',
          title: 'Wights of Land and House',
          summary: `The landvættir, the álfar and the house spirit: the nearest holy powers, and how to give to them.`,
          minutes: 7,
          sections: [
            {
              heading: 'The land has its own people',
              body: `A "wight" (Old Norse vættr) is simply a being. The landvættir are the spirits of a place: a hill, a stream, a stand of trees, a whole country. Icelandic tradition, recorded in Landnámabók (the Book of Settlements), says that the old pagan law told sailors to take the carved dragon heads off their ships before coming in sight of land, so as not to frighten the land-spirits. Snorri tells of four great guardians of Iceland, a dragon, a great bird, a bull and a giant, and they stand on Iceland's coat of arms to this day.

For most of the people in the sagas, the land-spirits mattered more from day to day than the high gods. They brought luck to farms and fishing, and could take it away if offended. Modern Heathens often start here, because you live on some land, whoever you are, and its wights are your nearest neighbours in the unseen world.`,
            },
            {
              heading: 'Elves and the mound',
              body: `The álfar, or elves, are harder to pin down. In the poems they are paired with the gods, "Æsir and álfar", as if they were a class of holy power. The skald Sigvatr, travelling in Sweden around 1019, was turned away from a farm because the household was holding an álfablót, an elf-offering, and did not want strangers in. Some evidence ties the elves to the dead, especially to ancestors in their burial mounds; a dead Norwegian king was even remembered as Ólafr Geirstaðaálfr, "the elf of Geirstaðir".

These are not the tiny winged fairies of Victorian picture books, and many Heathens keep a respectful distance from the álfar, giving to them at Winter Nights and otherwise leaving them be.`,
            },
            {
              heading: 'The one by the stove',
              body: `Scandinavian folklore, recorded mostly from the 1700s to the 1900s, is full of house and farm spirits: the Swedish tomte, the Norwegian and Danish nisse. They look after the animals and the household if treated well, and make mischief if insulted. The best-known custom is a bowl of porridge with a lump of butter left out on Christmas Eve; forget the butter, the stories warn, and you will regret it. These customs are Christian-era folk practice, not Viking Age religion, but they carry on the old idea of a spirit who shares the home and expects a share of its plenty.`,
            },
            {
              heading: 'How to give to wights',
              body: `Keep it simple, regular and outdoors where you can. Choose a spot: a tree, a corner of a park, a balcony planter. Go once a week, greet the spirits of the place, and leave something small and harmless: a splash of milk or beer, a bit of bread, oats, a little honey. Pick up litter while you are there; it is the most welcome gift in many places. At home, choose a spot by the stove or the heart of the house, and leave a small portion of a special meal there now and then, especially at Jól.

Don't make big promises to wights or demand things of them. You are building neighbourliness, not a contract.`,
            },
          ],
          knowAndDont: {
            known: `Landnámabók records the dragon-head law and the landvættir are named in Heimskringla; Sigvatr's verses mention an álfablót; house-spirit customs like the tomte's porridge are well documented in later Scandinavian folklore.`,
            unknown: `What the álfar were in Viking Age belief, how far they overlap with the dead, and how much the later tomte and nisse continue pre-Christian belief rather than developing on their own. How to honour the land-spirits of places outside Scandinavia is entirely a modern question, answered differently by different Heathens.`,
          },
          inPractice: `Find your outdoor spot this week and begin a weekly gift there. Indoors, choose a place by the stove or the hearth of the home for the house wight and give it a small bowl of porridge or bread with butter on your next free evening.`,
          reflect: [
            `What do you know about the land where you live: its rivers, its trees, its earlier peoples? What could you learn?`,
            `What would it mean to treat your home as shared?`,
          ],
          further: [
            `Landnámabók (The Book of Settlements), trans. Hermann Pálsson and Paul Edwards`,
            `Alaric Hall, Elves in Anglo-Saxon England (2007), for the elves`,
          ],
          premade: ['hedge-house-spirit-offering', 'hedge-hearing-the-land-walk'],
          library: ['traditional/vessel/offering_bowl'],
        },
        {
          id: 'norse-ancestors',
          title: 'The Dísir and the Honoured Dead',
          summary: `Ancestors, the guardian women called dísir, the fylgja and luck, and how to keep an ancestor shelf.`,
          minutes: 7,
          sections: [
            {
              heading: 'The dead stay near',
              body: `In the sagas the dead are rarely far away. They live in their mounds on the family land, they appear in dreams, and the very good and the very bad can walk. Graves were placed near farms, and a family's mound could be a place of offering and even of judgement. Odin's hall Valhalla and Freyja's field Fólkvangr receive some of the battle-dead; Hel's hall receives many others. The picture is not one tidy afterlife, and the sources disagree.

What is consistent is that kinship did not end at death. The honoured dead could bring luck to their descendants, and the living owed them memory. At the great blót described in Heimskringla, after the cups for the gods, people drank the minni, a cup in memory of dead kin.`,
            },
            {
              heading: 'The dísir',
              body: `The dísir are female spirits connected to a family or a person, often understood as ancestral mothers and guardians. The sagas mention a dísablót, an offering to them, held in some places at Winter Nights; at Uppsala there was a great gathering called the Dísting in late winter, and a market called Distingen is still held in Uppsala at that time of year. The Anglo-Saxon monk Bede, writing around 725, says the pagan English kept a "Mothers' Night" (Modranecht) on the eve of what became Christmas, which many Heathens connect with the dísir.

Related ideas include the fylgja, a following spirit sometimes seen as an animal or a woman, and hamingja, a family's luck, which could be lent or inherited. Modern Heathens use these words in different ways, and it is fine to hold them lightly while you learn.`,
            },
            {
              heading: 'Choosing your honoured dead',
              body: `You do not need a perfect family to honour ancestors. Many people's families include cruelty, and you are not obliged to invite anyone onto your shelf. You can honour those you loved, those who did good, ancestors so far back they are only names or none at all, and also the dead of your craft, your city, or your chosen family. Heathens often speak of "ancestors of blood, of heart and of spirit".

This is also where the app is firm: honouring your forebears has nothing to do with racial pride. Every human has ancestors, and Heathen practice is open to every human.`,
            },
            {
              heading: 'An ancestor shelf',
              body: `Set aside a shelf, separate from your gods' place if you can. Put photographs, a keepsake, a written list of names, maybe a little earth from a place they lived. Give them what they liked: coffee, a biscuit, a splash of whisky, a pinch of tobacco on the soil outside, a sprig of something from the garden. Speak to them, tell them your news, and thank them. Clear old food after a day.

Many Heathens give to the dead at Winter Nights, at Jól's first night and at Dísablót, and on the anniversaries of their deaths.`,
            },
          ],
          knowAndDont: {
            known: `The sagas describe mound burials near farms, haunting dead, and a memorial cup (minni) at feasts; dísablót is named in several sagas and Heimskringla; Bede records Modranecht among the pagan English.`,
            unknown: `What exactly the dísir were, whether Modranecht was for the same beings, and how widely ancestor offering was organised. The neat idea that the dísir are "the female ancestors" is a reasonable modern synthesis, not something any source spells out.`,
          },
          inPractice: `Make a small ancestor shelf this week. Write the names you want to honour, place one photo or object, and give a small drink and a few words. Plan to visit it once a week through the journey.`,
          reflect: [
            `Whom do you want to honour, and whom do you choose not to? How does it feel to make that choice?`,
            `Are there ancestors of heart or spirit, not blood, who belong on your shelf?`,
          ],
          further: [
            `The Saga of Egil Skallagrimsson and Víga-Glúms saga (both mention a dísablót)`,
            `Bede, The Reckoning of Time (De temporum ratione), chapter 15, on the old English months`,
          ],
          premade: ['hedge-ancestor-candle-evening'],
          library: ['traditional/deity/hel', 'traditional/crystal/jet'],
        },
        {
          id: 'norse-gift-frith',
          title: 'A Gift for a Gift: Frith, Luck and Wyrd',
          summary: `The ethics at the heart of Heathenry: reciprocity, frith, hospitality, reputation and the web of fate.`,
          minutes: 8,
          sections: [
            {
              heading: 'Gifts with gifts requite',
              body: `If Heathenry has one rule, it is this: a gift calls for a gift. The Hávamál, the "Sayings of the High One", a long poem of Odin's advice in the Poetic Edda, puts it this way in Bellows' 1923 translation:

"To his friend a man a friend shall prove, / And gifts with gifts requite."

The same poem warns against overdoing it. "Better no prayer than too big an offering, / By thy getting measure thy gift." Gifts make bonds, between people and between people and gods. You give to the gods not to buy favours but to keep the friendship flowing both ways. A huge, desperate offering is as off as a stingy one; what matters is regularity and fit.`,
            },
            {
              heading: 'Frith',
              body: `Frith (Old Norse friðr) is usually translated "peace", but it means more: the safe, trusting, loyal state that holds among kin, friends and guests who keep faith with one another. Inside frith, people protect each other and settle quarrels with words and compensation rather than blood. The holy places and the assemblies (the things) were under frith; to break it there was a serious crime.

In modern practice, frith is the reason kindreds take guest rules seriously: no fighting at the feast, no weapons drawn, no insulting someone's gods in their hall. It is also a good word for what you are building with your household, your friends and your gods.`,
            },
            {
              heading: 'The guest and the name',
              body: `The Hávamál begins at the door: "Hail to the giver! a guest has come; / Where shall the stranger sit?" Hospitality was sacred, because in a cold land a turned-away traveller could die, and Odin himself goes about as a wanderer testing it. Heathens still hold that guests should be fed and warmed, and that guests should behave.

The other value the poem praises is a good name. "Cattle die, and kinsmen die, / And so one dies one's self; / One thing I know that never dies, / The fame of a dead man's deeds." Reputation was what outlived you. For modern Heathens it means: your deeds are your religion, and people should be able to trust your word.`,
            },
            {
              heading: 'Wyrd, luck and the Well',
              body: `The Völuspá tells of three maidens who live by Urth's well beneath the world-tree Yggdrasil: Urth, Verthandi and Skuld, the Norns. "Laws they made there, and life allotted / To the sons of men, and set their fates." Old Norse ørlög and Old English wyrd name that laid-down fate. It is less a fixed script than the weight of everything already done, by you and by those before you, which shapes what can happen next.

Many modern Heathens, following the scholar Paul Bauschatz's book The Well and the Tree (1982), picture deeds and oaths being "laid into the Well". That image is modern, but it explains why Heathens take their words over the horn so seriously.`,
            },
          ],
          knowAndDont: {
            known: `Hávamál stanzas 42 and 146 (Bellows' numbering) teach gift-for-gift and moderation in offering; the poem opens with hospitality; Völuspá names the three Norns at Urth's well. Frith, compensation and assembly-peace are well attested in law codes and sagas.`,
            unknown: `How far Hávamál, a compilation of different poems, reflects common values rather than one poet's view, and how "wyrd" was understood in everyday belief. The image of deeds laid in the Well is a modern interpretation built on the poems, not an ancient teaching.`,
          },
          inPractice: `This week, practise gift-for-gift in ordinary life: return a favour you've let slide, host someone, keep a small promise exactly. At your offering place, give a modest, regular gift and say what you are thankful for, rather than asking for anything.`,
          reflect: [
            `Where in your life do gifts flow well, and where are they stuck or one-sided?`,
            `What would it look like for your word to be fully trustworthy?`,
          ],
          further: [
            `Hávamál, in the Poetic Edda, trans. Bellows (1923)`,
            `Paul C. Bauschatz, The Well and the Tree: World and Time in Early Germanic Culture (1982)`,
            `William Ian Miller, Bloodtaking and Peacemaking (1990), on feud and settlement in saga Iceland`,
          ],
          premade: ['folk-havamal-reflection', 'folk-gratitude-ritual'],
        },
        {
          id: 'norse-virtues',
          title: 'The Nine Noble Virtues and Other Measures',
          summary: `Where the Nine Noble Virtues came from (the 1970s), how Heathens use or replace them, and what the sources actually praise.`,
          minutes: 6,
          sections: [
            {
              heading: 'A modern list',
              body: `Many books and websites present the Nine Noble Virtues as the Heathen code: Courage, Truth, Honour, Fidelity, Discipline, Hospitality, Industriousness, Self-Reliance and Perseverance. You will see them on posters and tattoos. They are useful, and they are not ancient.

The list was drawn up in Britain in the early 1970s, usually credited to members of the Odinic Rite, and it spread through North American groups later that decade. No Viking Age or medieval source contains it. Its authors drew on the spirit of the Hávamál and the sagas, and on their own ideas of manliness and duty.`,
            },
            {
              heading: 'Why some Heathens set it aside',
              body: `Some Heathens find the list a helpful starting point and use it happily. Others prefer not to, for three reasons. First, it presents a modern summary as if it were tradition. Second, it leaves things out that the sources care about a great deal: generosity, kinship, frith, wisdom, moderation and the reciprocity of the gift. Third, the groups that first spread it included people with racial ideas about the religion, and some inclusive Heathens would rather not carry that baggage.

None of this means the virtues are bad. Courage and truth are worth having. It means you are free to treat them as one modern attempt among several, not as commandments.`,
            },
            {
              heading: 'What the poems praise',
              body: `If you read the Hávamál itself, a different flavour comes through. It praises moderation: "Shun not the mead, but drink in measure; / Speak to the point or be still." It praises being a good guest and a good host, keeping friends, being cautious with strangers, preparing for trouble, learning, and having a good name. It is practical, wry and sometimes cynical, more a farmer's and traveller's wisdom than a knight's code.

The sagas, too, admire people who keep their word, protect their household, stay calm under pressure and deal fairly, and they show without flinching what happens when pride and revenge run away with people.`,
            },
            {
              heading: 'Writing your own measure',
              body: `A good exercise, and one many kindreds do, is to read the Hávamál slowly and write down the values you find, in your own words. You might end up with something like: give and receive well; keep frith with your people; speak truly; be moderate; learn; honour the gods and the dead; protect the vulnerable; build a name worth leaving. That list is yours, and you can test it against your life and change it.

There is an older test, too, the saga way. Imagine your deeds told aloud at your funeral ale, by people who knew you well and owe you nothing. Would the story make your kin proud? Would your word be remembered as good? That is the measure the Hávamál points at when it says the fame of a dead man's deeds never dies, and it asks more of you than any poster.`,
            },
          ],
          knowAndDont: {
            known: `The Nine Noble Virtues date from the early 1970s in Britain and are generally credited to the Odinic Rite; they appear in no ancient or medieval source. The Hávamál's advice on moderation, hospitality, friendship and reputation is in the poem itself.`,
            unknown: `Who exactly first wrote the list down is told differently in different accounts. Whether any one ethical summary is "the Heathen ethic" is a matter of modern opinion; ancient people had no single code.`,
          },
          inPractice: `Read twenty stanzas of the Hávamál this week. Write down every value you notice, then draft your own short list of what you want to live by. Put it near your offering place.`,
          reflect: [
            `Which of the Nine Noble Virtues do you find useful, and which do you question?`,
            `What does your own list include that the Nine leave out?`,
          ],
          further: [
            `Hávamál, in the Poetic Edda (Bellows or Larrington)`,
            `Jenny Blain, Nine Worlds of Seid-Magic (2002), for an anthropologist's view of modern Heathen communities`,
          ],
          premade: ['folk-havamal-reflection'],
        },
        {
          id: 'norse-runes',
          title: 'The Runes: Letters, Lots and Modern Use',
          summary: `The Elder Futhark and its history, the rune poems, what Tacitus actually says about lots, and why most rune divination is modern.`,
          minutes: 8,
          sections: [
            {
              heading: 'An alphabet first',
              body: `Runes are letters. The oldest set, the Elder Futhark, named for its first six letters (f, u, þ, a, r, k), was in use from around AD 150 to 800 across the Germanic world. It has 24 runes, often divided into three groups of eight called ættir. In the Viking Age, Scandinavians used a shorter Younger Futhark of 16 runes, and the Anglo-Saxons expanded theirs into the Futhorc of up to 33.

Most surviving runic inscriptions are practical or memorial: names on brooches, "X made this", "Y raised this stone in memory of Z, his father". Some are charms, and a few, like the word alu that turns up on amulets, seem to have holy or protective meaning. In the Hávamál, Odin wins the runes by hanging nine nights on the windy tree, "offered... myself to myself", and they are counted as holy wisdom, not just letters.`,
            },
            {
              heading: 'The rune poems and the names',
              body: `The meanings people attach to the runes today come mostly from three medieval rune poems: an Old English one (known from a 1705 printed copy, since the manuscript burned in 1731), an Old Norwegian one (13th century) and an Old Icelandic one (15th century). Each gives a short verse for each rune's name: fé, cattle or wealth; úr, drizzle or the aurochs; þurs, giant; and so on. The poems cover the Younger Futhark or the Anglo-Saxon row, not the Elder Futhark; the Elder rune names are reconstructed by scholars from these later ones.`,
            },
            {
              heading: 'Lots and divination: the honest picture',
              body: `Tacitus, writing in AD 98, describes Germanic divination: "They cut a twig from a fruit-tree, and divide it into small pieces, which, distinguished by certain marks, are thrown promiscuously upon a white garment." The head of the family, after praying to the gods, picks up three pieces and reads them. He does not say the marks were runes, and runes as far as we know did not yet exist. No later source clearly describes casting runes to tell the future.

Most rune divination today comes from the 20th century. Guido von List invented his own "Armanen" runes in Austria in the early 1900s; his ideas fed directly into Nazi occultism, and that row is best avoided. Ralph Blum's The Book of Runes (1982) popularised rune-casting in the New Age world and added a "blank rune" that has no historical basis at all. Later Heathen writers built more careful systems on the rune poems.

Divining with runes can still be a meaningful modern practice, the way tarot is. Just know it as modern.`,
            },
            {
              heading: 'Using them well',
              body: `If you want to work with runes, learn them first as letters: write your name, a blessing, a date. Then learn each rune's name and its rune-poem verse. Make a set yourself on wood, stone or card, and keep them in a cloth bag. To draw, do as Tacitus describes: pray, scatter, and pick up three without looking. Read them as prompts to think with, not verdicts.

And learn which runes have been stolen. The SS used a doubled sowilo as its badge and a winged othala on uniforms; the algiz rune was used as a Nazi "life rune". In ordinary Heathen use these runes are fine, but tattoos or flags with those exact Nazi styles signal racism, not religion.`,
            },
          ],
          knowAndDont: {
            known: `The Elder Futhark was used c. 150–800; the Younger Futhark in the Viking Age; three medieval rune poems survive; Tacitus describes marked lots on a white cloth; Hávamál tells of Odin winning the runes.`,
            unknown: `Whether runes were ever used for divination in the old religion; what the Elder rune names exactly were; and what the ættir meant. The meanings in most rune books are modern interpretations, and the blank rune is a 1982 invention.`,
          },
          inPractice: `Write your name in the Elder Futhark this week. Learn the first ætt's eight names and their rune-poem verses. If you like, make a set from wooden discs or slips of card and try a three-rune draw at your offering place, journaling what it prompts you to think about.`,
          reflect: [
            `What changes when you know rune-casting is modern? Does it matter to you?`,
            `Which rune's poem-verse stays with you, and why?`,
          ],
          further: [
            `R. I. Page, Runes (British Museum Press, 1987), the best short history`,
            `The Old English, Norwegian and Icelandic rune poems, in Bruce Dickins, Runic and Heroic Poems (1915, public domain)`,
            `Tacitus, Germania, chapter 10`,
          ],
          premade: ['folk-jol-rune-casting'],
          library: ['traditional/deity/odin', 'traditional/herb/birch'],
        },
      ],
      practices: [
        {
          id: 'norse-weekly-land-gift',
          title: 'Weekly gift to the land',
          instructions: `Once a week, visit your outdoor spot (or balcony plant), greet the landvættir in your own words, leave a little milk, beer, oats or bread, and pick up any litter. Stay a few minutes and notice what has changed.`,
          times: 6,
          every: 'week',
          prompt: `What did I notice at my spot this week? How does the place feel to me now?`,
        },
        {
          id: 'norse-havamal-weekly',
          title: 'A few stanzas of the Hávamál',
          instructions: `Once a week, read five to ten stanzas of the Hávamál by candlelight and write a few lines on how they meet your life now.`,
          times: 6,
          every: 'week',
          premade: 'folk-havamal-reflection',
          prompt: `Which stanza did I disagree with, and which did I need?`,
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Blót, Sumbel and the Year',
      intro: `Five weeks of doing. You learn the two great Heathen rites, the blót and the sumbel, by doing them; you learn the holy tides and set up a proper stalli; and you meet the most contested corners of Heathen practice, seiðr and spá, with honesty.`,
      days: 35,
      lessons: [
        {
          id: 'norse-blot',
          title: 'How to Give a Blót',
          summary: `What the sagas describe, what modern Heathens do, and the shape of a blót you can hold at home.`,
          minutes: 8,
          sections: [
            {
              heading: 'The old blót',
              body: `Blót means "offering" or "sacrifice". The fullest description comes from Snorri's Heimskringla, telling of the earl Sigurd at Hlaðir in Norway in the 900s. The farmers came to the temple bringing ale, and animals, including horses, were slaughtered. Their blood was called hlaut; it was caught in hlaut-bowls and sprinkled on the altars, the walls and the people with twigs like sprinkling brushes, while the meat was boiled for the feast. The chieftain blessed the cups and the food. In Laing's old translation, "first Odin's goblet was emptied for victory and power to his king"; then came the cups of Njörðr and Freyr (Laing wrote Freyja, but the Old Norse names Freyr) "for peace and a good season", and a cup for the remembered dead.

So a blót was a feast. The gods received their share, often the blood and the life, and the people ate the rest together. It created a bond between the community and the gods, and within the community.`,
            },
            {
              heading: 'The modern blót',
              body: `Modern Heathens almost never kill animals for blót. A few rural groups slaughter livestock they would have slaughtered anyway, and eat it; that is rare and has to be done legally and humanely. Most offer mead, beer, cider, juice, milk, bread or food from the table. The shape remains: a holy space is set apart, the beings are called, the offering is blessed, shared, and given.

You'll often see a hammer sign made over the drink. That comes from Thor's hammer hallowing things in the myths (the goats he eats and raises again, Baldur's funeral pyre, the bride in Þrymskviða) and from runestones that ask Thor to hallow them. Using it at blót is modern, but well rooted.`,
            },
            {
              heading: 'The shape step by step',
              body: `1. Hallow the space: walk around it sunwise (clockwise) with a fire or a sprig of evergreen, and say it is set apart.
2. Call the beings: hail the gods, the wights or the ancestors you are giving to, by name. Say why.
3. Hallow the offering: hold up the horn or bowl, make the hammer sign or say a blessing over it.
4. Share it: drink a sip yourself. In a group, the horn goes round and each person drinks and speaks briefly.
5. Give it: pour the rest into the offering bowl (the hlautbolli). Dip the evergreen sprig (the hlautteinn) and sprinkle yourself and the space.
6. Return it: carry the bowl out and pour it on the earth, at a tree or a stone. Say the blót is ended.
7. Feast: eat together afterwards if you can. The feast is part of the blót, not an add-on.`,
            },
            {
              heading: 'What not to do',
              body: `Don't pour the offering back into the bottle or drink it after it has been given; it belongs to the gods. Don't pour it down the drain; if you live in a flat with no soil, keep a big planter for this purpose, or take it to a park. Don't bargain ("I'll give you this if you give me that"); give, then wait. Don't offer anything you wouldn't want to receive, such as cheap drink bought grudgingly. And don't feel you need to sound like a saga. Plain heartfelt words are more Heathen than fake Old Norse.`,
            },
          ],
          knowAndDont: {
            known: `Hákonar saga góða in Heimskringla describes blood (hlaut), sprinkling twigs, blessed cups to Odin, Njörðr and Freyr, a memorial cup, and a communal feast. Archaeology confirms feasting and animal offerings at cult sites like Hofstaðir and Uppsala.`,
            unknown: `Snorri wrote two centuries after the events and may have built his description partly from other sources. We do not know the words spoken, whether every blót looked like this, or how household blóts differed from great chieftains' feasts. The modern hammer sign and the precise ritual order are modern reconstructions.`,
          },
          inPractice: `Hold your first full blót this week using the Simple Blót working, for the gods broadly or for one god you have been reading about. Afterwards, eat a meal in their honour.`,
          reflect: [
            `What did it feel like to pour away the drink you had blessed?`,
            `What would you change next time to make it more yours?`,
          ],
          further: [
            `Heimskringla, Saga of Hákon the Good, ch. 16 (Laing trans., public domain)`,
            `Ryan Smith, The Way of Fire and Ice: The Living Tradition of Norse Paganism (2019)`,
          ],
          premade: ['folk-simple-blot'],
          library: ['traditional/tool/chalice', 'traditional/vessel/offering_bowl', 'traditional/herb/juniper', 'traditional/deity/thor'],
        },
        {
          id: 'norse-sumbel',
          title: 'Sumbel: the Holy Round',
          summary: `The ritual drinking rounds of the hall, the lady with the cup, boasts and oaths, and how to keep a sumbel alone.`,
          minutes: 7,
          sections: [
            {
              heading: 'In the hall',
              body: `Where blót gives to the gods, sumbel is about speech: a formal round of drinking in which each person speaks over the horn. The word appears in Old Norse and Old English poetry, and the clearest picture comes from Beowulf, where Queen Wealhþeow carries the cup around Heorot, offering it first to the king, then to the warriors in order, speaking words of welcome and binding as she goes. In the Norse poems, valkyries and noble women play this role of cup-bearer.

Words spoken in sumbel were serious. Heimskringla tells of the bragarfull, the "chief's cup" at a funeral ale, over which an heir swore a great vow before taking his father's high seat. In the hall, a boast was a promise, and your name rode on keeping it.`,
            },
            {
              heading: 'The modern rounds',
              body: `Modern sumbel usually has three rounds. The first round hails the gods: each person raises the horn and toasts a god or goddess, saying a word about why, then drinks. The second round hails heroes and ancestors: people of the lore, of history or of the family who are worth remembering. The third round is open: a thanks, a story, a boast of something you have done, or an oath of something you will do.

Someone acts as the cup-bearer, carrying the horn and refilling it, and often a "thyle" keeps order and can challenge a reckless boast. Many groups pour the last of the horn into the offering bowl at the end, so the gods share in the words.`,
            },
            {
              heading: 'Rules of the horn',
              body: `Speak only when the horn is in your hands. Don't boast what you can't do. Don't speak ill of anyone's gods or ancestors. Don't swear an oath on a whim; an oath at sumbel is witnessed and is meant to be kept. If you don't drink alcohol, use juice, water or tea, or touch the horn to your lips; nobody worth sharing a hall with will mind. And follow the hall's custom on Loki: in many kindreds his name is not raised at sumbel.`,
            },
            {
              heading: 'A sumbel of one',
              body: `Alone, you can keep sumbel at your offering place. Set out your horn and the offering bowl, and light a candle. Fill the horn. For the first round, hail one god aloud and drink. For the second, hail an ancestor or hero and tell their story briefly. For the third, speak a thanks or a small boast: something real you did this week. Then pour the rest of the horn into the bowl, and take it outside. It sounds odd at first to speak to an empty room, but the gods and dead are the audience, and soon it feels natural.`,
            },
          ],
          knowAndDont: {
            known: `Beowulf describes a cup-bearing queen in the hall; Old Norse and Old English both use the word sumbel/sumbl for a feast; Heimskringla describes vows over the bragarfull at an heir's funeral ale.`,
            unknown: `Whether there was ever a fixed "three rounds" structure, or a distinct sumbel separate from feasting in general. The modern sumbel, its rounds and its thyle are largely a 20th-century reconstruction, developed in American Heathen groups and influenced by Paul Bauschatz's work.`,
          },
          inPractice: `Keep a sumbel of one this week, with three rounds: a god, an ancestor or hero, and a true small boast or thanks. If you have a friend who's curious, invite them and take turns.`,
          reflect: [
            `What did you choose to boast, and how did it feel to say it aloud?`,
            `Is there an oath you might one day make? What would make you sure you could keep it?`,
          ],
          further: [
            `Beowulf, lines 612–641, on Wealhþeow's cup (Gummere's translation of 1910 is public domain)`,
            `Heimskringla, Ynglinga saga, the chapters on King Ingjald (his vow at the funeral ale)`,
          ],
          library: ['traditional/tool/chalice'],
        },
        {
          id: 'norse-tides',
          title: 'The Holy Tides',
          summary: `The old two-season year, the three great blóts of the sagas, and how modern Heathens keep Winter Nights, Jól, Dísablót, Sigrblót and Midsummer.`,
          minutes: 8,
          sections: [
            {
              heading: 'A year of two halves',
              body: `The old Icelandic calendar split the year into two seasons, winter and summer, each of 26 weeks, starting on fixed weekdays in October and April. Months had names like Þorri and Góa in late winter and Gormánuður, "slaughter month", in autumn. Snorri writes in Ynglinga saga that Odin set three great blóts: at the beginning of winter for a good year, at midwinter for growth, and at the start of summer for victory. Other sagas mention the same three: autumn, midwinter, summer.

Modern Heathens keep these three and often add others. Dates vary by group, so think of the ones below as the app's calendar, not the only right one.`,
            },
            {
              heading: 'Winter Nights and Jól',
              body: `Winter Nights (Vetrnætur), in mid to late October, open the winter half. The sagas place blóts "for a good year" here, as well as dísablót and álfablót in some places. Modern Heathens give thanks for the harvest, honour the dísir, elves and the dead, and draw in for the dark. It is a natural time for an ancestor feast.

Jól (Yule) is the great midwinter feast. Heimskringla says that before King Hákon moved it to Christmas, it began on "the night of mid-winter" and lasted three nights; the drinking of Jól was itself a holy act. Today Heathens usually start at the winter solstice and keep twelve nights, a custom borrowed back from Christmas, with feasting, toasts for a good year and peace, the house-spirit's porridge, and often the swearing of New Year oaths. Many also keep Mothers' Night for the dísir on the eve.`,
            },
            {
              heading: 'Late winter and summer\'s start',
              body: `Þorrablót, in late January, is an Icelandic midwinter feast revived in the 1800s with traditional foods (dried fish, sour ram, fermented shark) and toasts. Dísablót falls in February or March in the app, after the great Dísting at Uppsala, though some keep it at Winter Nights; give to the guardian mothers of your line and to the women who shaped you.

Sigrblót, the victory blót, marks the beginning of summer. In Iceland the first day of summer, Sumardagurinn fyrsti, is still a public holiday on the Thursday between 19 and 25 April. Heathens give for success in the season's undertakings, often to Odin, Thor or Tyr.`,
            },
            {
              heading: 'Midsummer and harvest',
              body: `Midsummer, at the solstice, is well loved in Scandinavia, with maypoles and bonfires on St John's Eve, but there is no clear record of a Viking Age midsummer blót. It was, though, the season when the assemblies met, including Iceland's Althing. Modern Heathens feast outdoors, honour Baldur or Sunna (the sun) and the land, and stay up for the light.

Haustblót at the autumn equinox is a modern harvest thanksgiving; many Heathens fold it into Winter Nights instead. Whatever you keep, keep it the same way each year. Tradition is made by repetition.`,
            },
          ],
          knowAndDont: {
            known: `Snorri names three blóts, at winter's start, midwinter and summer's start; Heimskringla describes Jól beginning at "mid-winter" and moved by Hákon to Christmas; the old Icelandic two-season calendar is well documented; Sumardagurinn fyrsti is a living Icelandic holiday.`,
            unknown: `The exact old dates (lunar, solar or by weekday) are argued over; there is no clear evidence for Viking Age solstice or equinox blóts as such. Twelve-night Jól, Haustblót and most modern names and dates are modern conventions, and Þorrablót in its present form is a 19th-century revival.`,
          },
          inPractice: `Look up the next holy tide in the app's calendar. Plan a blót for it now: whom you'll honour, what you'll offer, what you'll eat afterwards. If Winter Nights or Jól are near, plan an ancestor feast too.`,
          reflect: [
            `Which tide do you look forward to most? Which feels least like yours, and why?`,
            `How might the year of two halves change the way you see the seasons where you live?`,
          ],
          further: [
            `Heimskringla, Saga of Hákon the Good, ch. 15–16, and Saga of Olaf the Saint (Laing trans., public domain)`,
            `Terry Gunnell, articles on Norse ritual and the calendar (University of Iceland)`,
          ],
          premade: ['folk-simple-blot', 'folk-jol-rune-casting', 'hedge-ancestor-candle-evening'],
        },
        {
          id: 'norse-stalli',
          title: 'Stalli, Hörgr and Daily Practice',
          summary: `The old words for holy places, how to set up a home stalli, and a daily rhythm that holds through busy weeks.`,
          minutes: 6,
          sections: [
            {
              heading: 'Holy places in the old words',
              body: `Old Norse has several words for sacred places. A hof was a hall where feasts and blóts were held, often a chieftain's farmhouse rather than a separate temple. A hörgr was probably an outdoor heap of stones, an altar under the sky. A vé was a holy enclosure, and the word survives in place names like Odense (Odin's vé). A stalli was a stand or altar inside, on which, say the sagas, a ring was kept for swearing oaths.

Most Heathen worship happened outdoors or in ordinary halls, not purpose-built temples. That is good news for a modern Heathen in a flat: your kitchen table is very close to the old pattern.`,
            },
            {
              heading: 'Setting up your stalli',
              body: `Choose a shelf, a cabinet top or a small table. On it:
– A horn or a cup used only for offerings.
– An offering bowl, the hlautbolli, wood or pottery.
– A candle or a small lamp.
– A sprig of evergreen for sprinkling: juniper, fir, pine or yew (don't eat yew; it is very poisonous).
– Images or symbols of your gods: a hammer for Thor, a boar for Freyr, a cat or a necklace for Freyja, a spindle or keys for Frigg, a spear or ravens for Odin. A simple carved figure or a postcard is fine.
– Optionally, a ring to swear on, amber, and a cloth.

Keep it clean. Dust it, change the water and flowers, and never leave old offerings to go mouldy. A neglected stalli says something about the friendship.`,
            },
            {
              heading: 'A daily rhythm',
              body: `Heathenry has no required daily prayer, but a little every day keeps the bonds warm. A good pattern: in the morning, a short hail at the stalli; in the evening, a minute of thanks or a sip of something poured for the gods or the house wight. Once a week, a gift to the land. Once a month, a fuller blót. At the tides, a feast. That is enough to make a living practice, and you can do it with a job and a family.`,
            },
            {
              heading: 'Outdoors and on the move',
              body: `If you have access to a garden or a park, a small stone or a ring of pebbles under a tree makes a fine hörgr. Give there in all weathers. When you travel, greet the land-spirits of the new place, and pour a little at the base of a tree. A small travel kit of a cup, a stone and a few runes on a card fits in any bag.

When your outdoor spot changes, because you move or the park is built over, thank the wights there, give a last gift, and say goodbye. Then greet the new place properly. Heathenry is a religion of relationships, and relationships deserve a proper beginning and end.`,
            },
          ],
          knowAndDont: {
            known: `Hof, hörgr, vé and stalli are attested words; place names show widespread holy sites; sagas mention oath-rings kept on altars. Archaeology shows many cult activities took place in halls and outdoor sites.`,
            unknown: `The exact meaning of hörgr and the appearance of altars; how household worship looked from day to day. The modern home stalli is an adaptation, not a reconstruction of a known object.`,
          },
          inPractice: `Turn your threshold offering place into a full stalli with a horn, bowl, light, evergreen and a symbol of each god you've been getting to know. Begin the daily rhythm: a morning hail and an evening thanks.`,
          reflect: [
            `What does your stalli look like now, and what do you want it to say?`,
            `Which part of the daily rhythm is easiest to keep, and which slips?`,
          ],
          library: ['traditional/tool/altar', 'traditional/vessel/offering_bowl', 'traditional/herb/yew', 'traditional/crystal/amber', 'traditional/deity/freyja', 'traditional/deity/frigg'],
        },
        {
          id: 'norse-seidr',
          title: 'Seiðr, Spá and Galdr, Honestly',
          summary: `What the sagas say about the seeress and her art, what modern oracular seiðr is, and how to approach trance safely.`,
          minutes: 8,
          sections: [
            {
              heading: 'The seeress in Greenland',
              body: `The most detailed description of a seeress in the sources is in the Saga of Erik the Red. In a hard year in Greenland, a woman called Þorbjörg, the "little völva", is invited to a farm to tell the future. She wears a blue cloak set with stones, a necklace of glass beads, a black lambskin hood lined with white catskin, catskin gloves, and calfskin shoes, and carries a staff with a brass knob. She is given a high seat with a cushion of hen feathers and a meal of porridge and animal hearts. The next day she sits on a platform, and a young Christian woman, Guðríðr, sings the spirit-calling songs (varðlokkur) she had learned from her foster-mother. Spirits gather, and Þorbjörg foretells the end of the famine and Guðríðr's future.

The Völuspá itself is framed as the words of a völva, a seeress, whom Odin raises to tell of the world's beginning and end. Spá is the old word for this kind of prophecy.`,
            },
            {
              heading: 'Seiðr and its shadows',
              body: `Seiðr is a kind of magic linked with trance, prophecy and influencing minds and fortune. Snorri says Freyja taught it to the Æsir, and that it was thought shameful (ergi) for men to practise it, though Odin did. In the sagas, seiðr is sometimes used to see and help, and often to harm. The sources are a mix of respect and fear, written by Christians far from the practice.

Galdr is different: sung or chanted charms, like the ones Odin lists in the Hávamál. The Old High German Merseburg charms, written down in the 10th century, are the nearest survivors of Germanic spoken charms, one to free prisoners, one to heal a horse's foot.`,
            },
            {
              heading: 'Modern seiðr',
              body: `Modern oracular seiðr was developed largely in the 1980s and 90s, notably by Diana Paxson and the Hrafnar group in California, who rebuilt a group rite from Erik the Red's saga, the Völuspá, and techniques from modern "core shamanism". A seer sits on a high seat, the group sings, a guide leads a journey down the world-tree to Hel's realm, and then people ask the seer questions. It can be powerful, and it is honestly a modern creation. Other Heathens do útiseta, "sitting out" at night in a lonely place to seek insight, which has a thin basis in the sagas and law codes.`,
            },
            {
              heading: 'Approach with care',
              body: `Trance work is not for your first year, and not alone. It can unsettle people with a history of dissociation, psychosis or severe anxiety, and if that is you, it is wise to skip it. If you want to explore, find an experienced, accountable group, ask how they ground and care for people afterwards, and never go into trance under alcohol or drugs. For now, a gentle beginning is enough: sing or hum a rune's name slowly in the evening, sit in silence by a candle, and write what comes. And as always, no harmful seiðr: the app's workings are for seeing and blessing, not for binding other people.`,
            },
          ],
          knowAndDont: {
            known: `Erik the Red's saga gives a detailed account of a seeress, her costume and ritual; Völuspá is framed as a völva's prophecy; Ynglinga saga links seiðr with Freyja and calls it ergi for men; the Merseburg charms are genuine 10th-century spoken charms.`,
            unknown: `Erik the Red's saga was written in the 13th century about events c. 1000 and may be partly literary. We do not know how seiðr was actually done, what its songs were, or how common seeresses were. Modern oracular seiðr, journeying to Hel and most of its techniques are 20th-century reconstructions drawing on non-Norse shamanic methods.`,
          },
          inPractice: `Read the seeress episode in Erik the Red's saga, chapter 4. If you feel drawn, spend one evening humming a rune name slowly for ten minutes by candlelight and journal afterwards. Leave deeper trance for later, with a group.`,
          reflect: [
            `What draws you to seiðr, if anything? What do you hope it would give you?`,
            `How do you know when a spiritual practice is good for you, and when it isn't?`,
          ],
          further: [
            `The Saga of Erik the Red, ch. 4, in The Vinland Sagas (Penguin)`,
            `Diana L. Paxson, Trance-Portation (2008) and Essential Asatru (2006), and Jenny Blain, Nine Worlds of Seid-Magic (2002)`,
          ],
          premade: ['hedge-warding-before-spirit-work'],
          library: ['traditional/deity/freyja', 'traditional/herb/mugwort'],
        },
      ],
      practices: [
        {
          id: 'norse-weekly-blot',
          title: 'A blót each week',
          instructions: `Hold a simple blót once a week: to the gods, to the land-spirits, to your ancestors, and to a god of your choice. Follow the Simple Blót working, eat something after in their honour, and pour the offering on the earth.`,
          times: 4,
          every: 'week',
          premade: 'folk-simple-blot',
          prompt: `Whom did I give to, and what changed in me, or in the week after?`,
        },
        {
          id: 'norse-solo-sumbel',
          title: 'A sumbel of one',
          instructions: `Keep a three-round sumbel at your stalli: a god, an ancestor or hero, and a true thanks or small boast. Pour the last of the horn as an offering.`,
          times: 1,
          prompt: `What did I say in the third round? Did saying it aloud change anything?`,
        },
        {
          id: 'norse-house-wight',
          title: 'Porridge for the house wight',
          instructions: `Once a week, on a quiet evening, leave a small bowl of porridge or bread with a pat of butter by the stove or heart of the home for the house spirit. Clear it in the morning and put it outside or compost it.`,
          times: 4,
          every: 'week',
          premade: 'hedge-house-spirit-offering',
          prompt: `How does the house feel? Have I noticed anything?`,
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Weighing It at the Well',
      intro: `A week to stop and think. You learn how Heathen communities differ, including the divide over race, and where you might belong. Then you sit with honest questions. Stopping, pausing, or deciding the Heathen way isn't yours are good outcomes. The gods prefer an honest no to a hollow yes.`,
      days: 7,
      lessons: [
        {
          id: 'norse-communities',
          title: 'Heathen Communities and the Folkish Divide',
          summary: `The main kinds of Heathen group, the inclusive and folkish split, the symbols racists misuse, and how to find a good kindred.`,
          minutes: 8,
          sections: [
            {
              heading: 'A young, varied religion',
              body: `Modern Heathenry began in the early 1970s, almost at once in several countries. In Iceland, the farmer-poet Sveinbjörn Beinteinsson founded Ásatrúarfélagið in 1972; it was recognised by the state in 1973 and is now one of the country's larger religious bodies, open to all, with a hof being built in Reykjavík. In Britain, the Odinic Rite and others formed; in the United States, Stephen McNallen's Asatru Free Assembly. The Troth, founded in 1987 in the US, is now one of the largest international Heathen organisations and explicitly inclusive. In Sweden, Samfundet Forn Sed Sverige and others keep a Scandinavian "old custom" practice.

Locally, Heathens gather in kindreds, hearths or garths: small groups that blót and feast together. Some focus on Anglo-Saxon practice (often called Fyrnsidu or Theodism), some on Scandinavian or continental sources, some are broad.`,
            },
            {
              heading: 'Folkish and inclusive',
              body: `From the start, a minority of Heathens claimed the religion belongs only to people of northern European descent. They call themselves "folkish". At the far end are openly white-supremacist groups, some in prisons, who use the gods as a banner for racism. The Asatru Folk Assembly, which restricts membership by ancestry, is listed as a hate group by the Southern Poverty Law Center. In 2016, well over a hundred Heathen organisations from around the world signed Declaration 127, publicly cutting ties with it.

Most Heathens today are inclusive (some say "universalist", though the word is used loosely). They hold that the gods call whom they will. The lore backs them: the gods themselves marry giants and take in the Vanir as family, and the Viking Age was a world of trade, travel and mixed households from Dublin to Baghdad.

The app stands firmly on the inclusive side. Heathenry is open to people of every ancestry, colour, gender and sexuality. Racism has no place at the horn.`,
            },
            {
              heading: 'Stolen symbols',
              body: `Because racists have used Norse imagery, you should know the signs. The "Black Sun" (a wheel of twelve sowilo runes, from the floor of the SS castle at Wewelsburg) has no ancient origin; avoid it. The SS double sowilo, the winged or serifed othala, and the Wolfsangel in Nazi form are hate symbols. Codes like 14 and 88 tied to runes are racist slogans. The valknut and Thor's hammer are used innocently by most Heathens, but they also appear on racist badges, so look at the company they keep.

When you choose jewellery, tattoos or flags, ask what a stranger would read in them. And if a group's talk turns to "blood and soil", race or "our folk" meaning white people, leave.`,
            },
            {
              heading: 'Finding your people',
              body: `Look for groups that state their inclusivity openly, have clear codes of conduct, welcome questions about the sources, and don't demand oaths from newcomers. A good kindred will let you come to a few blóts as a guest before asking anything of you. It's also fine to stay solitary; many Heathens do, and keep in touch online or at larger gatherings.`,
            },
          ],
          knowAndDont: {
            known: `Ásatrúarfélagið was founded in 1972 and recognised in 1973; The Troth was founded in 1987; the SPLC lists the Asatru Folk Assembly as a hate group; Declaration 127 was signed in 2016 by many Heathen groups. The Black Sun design dates to the Nazi period, and the SS adopted runic badges.`,
            unknown: `How many Heathens there are, and what proportion are folkish, is hard to measure; surveys suggest a clear inclusive majority. "Folkish" covers a range of views, not all openly supremacist. No ancient source supports restricting the gods to a race.`,
          },
          inPractice: `Look up two or three Heathen organisations or kindreds near you or online. Read their statements on inclusion and their codes of conduct. Note any warning signs, and any that feel welcoming.`,
          reflect: [
            `What do you want from a community: learning, friendship, ritual, accountability?`,
            `What would you do if someone at a gathering used a hate symbol or racist language?`,
          ],
          further: [
            `The Troth, Our Troth (vols. 1–3), the organisation's own guide to Heathen practice`,
            `Declaration 127 (2016), published online by its signatories`,
            `Mattias Gardell, Gods of the Blood: The Pagan Revival and White Separatism (2003), a study of racist Heathenry`,
          ],
        },
      ],
      practices: [
        {
          id: 'norse-discern-sit',
          title: 'Sit with the questions',
          instructions: `Each evening this week, take one or two of the discernment questions to your stalli. Light the candle, read the question aloud, sit in silence for five minutes, and then write what you honestly think.`,
          times: 7,
          every: 'day',
          prompt: `What did I learn about myself from tonight's question?`,
        },
      ],
      questions: [
        `Do I feel a real relationship forming with the gods, wights or ancestors, or am I mostly drawn to the aesthetic?`,
        `Am I comfortable with how little we know, and with modern practice filling the gaps?`,
        `Can I hold the reciprocity of the gift, giving regularly without bargaining?`,
        `Am I ready to keep my word as seriously as Heathenry asks, or should I wait before making an oath?`,
        `Where do I stand on the inclusive/folkish divide, and am I ready to speak up against racism in the name of these gods?`,
        `Do I want to dedicate to the Heathen way generally, to one god, or not yet?`,
        `Would another path, or a pause, serve me better right now? Saying so is a good and honest outcome.`,
      ],
    },
    {
      kind: 'dedication',
      title: 'Over the Horn',
      intro: `If you have decided to go on, this is your self-dedication: a blót and a sumbel in which you declare yourself a Heathen, or make a small, keepable oath. It is a self-dedication, not an initiation. Heathenry has no single initiation, and kindreds and organisations may have their own ways of welcoming members; this does not replace them. If you are not ready, it is fine to wait, or to declare an intention rather than swear an oath.`,
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'norse-dedication-words',
          title: 'Write your words',
          instructions: `In the days before, write what you will say. Decide whether you are making a declaration ("I take up the Heathen way") or an oath. If an oath, keep it small, specific and time-bound, such as "for one year I will give a blót at every holy tide and keep my word to my household". Read it aloud a few times; it should be something you are sure you can keep.`,
          times: 1,
          prompt: `What exactly am I promising, and why do I know I can keep it?`,
        },
      ],
      rite: {
        title: 'Taking Up the Way: Blót and Oath',
        summary: `A blót to the gods, wights and ancestors, then a sumbel round in which you declare yourself, or swear a keepable oath, and give a gift to seal it.`,
        minutes: 45,
        ingredients: [
          { name: 'Your horn or cup', ref: 'traditional/tool/chalice' },
          { name: 'Mead, ale, cider or juice' },
          { name: 'The offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A sprig of juniper or other evergreen', ref: 'traditional/herb/juniper' },
          { name: 'A candle' },
          { name: 'A ring, arm-ring or piece of jewellery to swear on and wear', optional: true },
          { name: 'A gift for the gods: good bread, a special drink, a crafted thing', optional: true },
          { name: 'Your written words' },
          { name: 'A festive meal for afterwards' },
        ],
        preparation: `Choose a day: a holy tide is good, or a day that matters to you. Clean the stalli and the space. Bathe and dress in clean clothes. Prepare the meal so you can eat right after. If you have a Heathen friend or two, invite them to witness; in Heathenry, oaths are often witnessed. If you are alone, the gods and your ancestors witness.`,
        steps: [
          {
            title: 'Hallow the space',
            instructions: `Light the candle. Walk sunwise around your space with the evergreen sprig, saying that it is set apart and under frith for the rite.`,
            light: true,
            spoken: `I hallow this place for the holy powers.
Here is frith; let nothing ill come near.`,
          },
          {
            title: 'Hail the holy powers',
            instructions: `Raise your arms and speak Sigrdrífa's hail, then name the gods you honour, the wights of the land and house, and your honoured dead.`,
            spoken: `Hail, day! Hail, sons of day!
And night and her daughter now!
Look on us here with loving eyes,
That waiting we victory win.
Hail to the gods! Ye goddesses, hail,
And all the generous earth!

Hail to [names of gods], hail to the wights of this land and this house,
hail to my honoured dead.`,
          },
          {
            title: 'The blót',
            instructions: `Fill the horn and hold it up. Make the hammer sign or bless it in your words. Drink a sip, then pour the rest into the bowl. Place your gift beside it. Sprinkle yourself and the space with the evergreen dipped in the bowl.`,
            spoken: `A gift for a gift. Take this, holy ones, freely given.`,
          },
          {
            title: 'The first two rounds',
            instructions: `Refill the horn. For the first round, toast the god or gods closest to you and say what they have meant to you on this journey; drink. For the second, toast an ancestor or hero, and tell briefly why you honour them; drink.`,
            minutes: 8,
          },
          {
            title: 'The third round: your words',
            instructions: `Refill the horn. Hold it (and the ring, if you have one) and speak your declaration or oath from your written words. Speak slowly and clearly. Then drink, and put on the ring if you have one.`,
            spoken: `Before the gods, the wights and my kin, I, [name], take up the Heathen way.
I will give and receive in good faith, keep frith with my household,
honour the holy powers at the tides, and keep my word.
[If an oath: For one year from this day, I will ...]
Let it be laid in the Well.`,
          },
          {
            title: 'Give the last share',
            instructions: `Pour the last of the horn into the offering bowl, so the gods share your words. Take the bowl outside and pour it on the earth at your tree or planter.`,
            minutes: 3,
          },
          {
            title: 'Feast',
            instructions: `Close the rite and eat your festive meal, setting aside a small portion for the gods and the house wight. Celebrate; this is a joyful thing.`,
            snuff: true,
          },
        ],
        closing: `Thank the gods, wights and ancestors, and say that the rite is ended and the frith is lifted. Write your words and the date in your journal. If you swore an oath, set a reminder for its end, and keep it.`,
        safety: `Keep the candle well away from the evergreen and fabric, and never leave it burning unattended. Drink only a mouthful of alcohol in each round, or use juice. Pour offerings on soil, not into drains. If pets are about, clear food offerings promptly, especially anything with onion, chocolate, grapes or raisins.`,
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the Hall Warm',
      intro: `The relationship goes on. Keep the holy tides through the year, give to the land each week and the gods each month, renew your dedication every year at the same tide, and keep reading. Gifts kept up over years are what make a Heathen.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'norse-tide-blots',
          title: 'Blót at each holy tide',
          instructions: `At each holy tide in the app's Norse calendar (Winter Nights, Jól, Þorrablót, Dísablót, Sigrblót, Midsummer, Haustblót), hold a blót and a feast. At Winter Nights and Dísablót, include the dísir and your ancestors; at Jól, include the house wight and swear only oaths you can keep.`,
          times: 7,
          every: 'holy-day',
          premade: 'folk-simple-blot',
          prompt: `What does this tide mean to me this year?`,
        },
        {
          id: 'norse-monthly-ancestors',
          title: 'A monthly gift to the dead',
          instructions: `Once a month, sit with your ancestor shelf, give a drink or a food they liked, tell them your news and thank them.`,
          times: 12,
          every: 'month',
          premade: 'hedge-ancestor-candle-evening',
          prompt: `Whom did I remember, and what did they teach me?`,
        },
        {
          id: 'norse-yearly-rededication',
          title: 'Yearly rededication',
          instructions: `Each year, at the tide on which you dedicated, repeat the third round of your dedication rite. Look back at the year, report on any oath you swore, and decide whether to renew, change or end it.`,
          times: 1,
          prompt: `How has the Heathen way shaped my year? What do I commit to next?`,
        },
        {
          id: 'norse-keep-reading',
          title: 'Read the lore through',
          instructions: `Over the year, read the whole Poetic Edda, Snorri's Edda and at least two sagas (Egil's saga, Laxdæla saga or the Saga of the People of Eyri are good choices). Note what surprises you.`,
          times: 12,
          every: 'month',
          prompt: `What did I read this month, and what did I learn about the gods or the old ways?`,
        },
      ],
    },
  ],
  sources: [
    `The Poetic Edda, trans. Henry Adams Bellows (American-Scandinavian Foundation, 1923; public domain): Hávamál 2, 19, 42, 78, 139, 146; Völuspá 19–20; Sigrdrífumál 2–3 (Bellows' numbering). Verified at https://www.gutenberg.org/ebooks/73533`,
    `Snorri Sturluson, Heimskringla, trans. Samuel Laing (1844; public domain): Saga of Hákon the Good, ch. 15–16; Saga of Olaf the Saint. Verified at https://www.gutenberg.org/ebooks/598`,
    `Tacitus, Germania, ch. 10, in The Germany and the Agricola of Tacitus (Oxford translation, revised; public domain). Verified at https://www.gutenberg.org/ebooks/7524`,
    `Snorri Sturluson, The Prose Edda (Gylfaginning, Skáldskaparmál), trans. Rasmus B. Anderson (1880; public domain), https://www.gutenberg.org/ebooks/18947`,
    `The Saga of Erik the Red, ch. 4; Landnámabók; Ynglinga saga, on the Vanir hostages, seiðr, Odin's three blóts and Ingjald's funeral ale (summarised, not quoted)`,
    `Bede, De temporum ratione, ch. 15, on Modranecht (summarised)`,
    `R. I. Page, Runes (1987); Neil Price, Children of Ash and Elm (2020); John Lindow, Norse Mythology (2001); H. R. Ellis Davidson, Gods and Myths of Northern Europe (1964)`,
    `Paul C. Bauschatz, The Well and the Tree (1982); Jenny Blain, Nine Worlds of Seid-Magic (2002); Mattias Gardell, Gods of the Blood (2003)`,
    `Southern Poverty Law Center listing of the Asatru Folk Assembly; Declaration 127 (2016)`,
  ],
};
