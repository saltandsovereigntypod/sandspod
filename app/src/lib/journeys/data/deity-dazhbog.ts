import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-dazhbog',
  kind: 'deity',
  paths: ['slavic'],
  deityRef: 'traditional/deity/dazhbog',
  title: 'Dazhbog, the Giving God',
  summary: 'A lunar month with the Slavic sun god whose name means giving: three short mentions in medieval texts, the folk year of the sun from Koliada to Kupala, and a warm devotion of sunrise and generosity.',
  welcome: `This is a month-long self-dedication to Dazhbog, the Slavic god of the sun, light and good fortune, whose name is usually read as “the giving god.” You will learn how little the sources say, how the sun lived in Slavic folk custom, why his name has been pulled into politics, and you will keep nine sunrises of greeting and giving before deciding whether to dedicate yourself to him.

It is a dedication, not an initiation. It joins you to no group and no faith organisation. It is a promise between you and the sun, kept mostly by giving.

You do not need Slavic ancestry. The sun shines on everyone, and his old name is about giving, not belonging.`,
  about: `Dazhbog is one of the six gods whose idols Prince Vladimir set up in Kiev in 980. A gloss in the Hypatian Chronicle, added to a translation of a Byzantine world history, calls the sun “Dazhbog,” son of Svarog, the Slavic smith-god set beside Hephaestus. The twelfth-century Lay of Igor twice calls the people of Rus “Dazhbog’s grandson.” That is almost all. His name joins the verb dati, to give, with bog, which in Slavic meant both god and a share of good fortune, so he is the giver of wealth, the god who deals out the good share. Scholars argue whether he and Khors, also on Vladimir’s hill, were two names for one sun. Serbian folklore remembers a Dabog who has become an earthly or devilish figure. Everything else, his chariot, his family, his solar wheel symbol, is modern. Today he is central to Rodnovery, greeted at sunrise and the solstices with fire, bread and honey; one Ukrainian movement, RUNVira, worships him as the only God. His name and sun symbols have also been taken up by nationalist groups, which this journey rejects.`,
  notes: [
    'Dazhbog’s attestation is very slim: one list, one chronicle gloss, two lines of poetry. Be wary of confident myths about him.',
    'The phrase “Dazhbog’s grandchildren” has been used by some modern groups to mean an ethnic people. This journey uses it, if at all, to mean anyone who lives by the gift of the sun.',
    'The eight-armed “kolovrat” sun wheel is a twentieth-century design widely used by neo-Nazi and far-right groups. This journey recommends a simple circle or rayed sun instead.',
    'Never look directly at the sun, including at sunrise. Look at the light on the horizon or on the land.',
    'Sunflowers are often offered to him today. They are a New World plant that reached Eastern Europe only a few centuries ago: a lovely modern offering, not an ancient one.',
  ],
  holyDays: ['koliada', 'kupala'],
  stages: [
    {
      kind: 'threshold',
      title: 'First light',
      intro: 'You begin at sunrise, or as near to it as your life allows. A candle, a piece of bread, a little honey, and your name spoken to the light coming over the edge of the world.',
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'dazhbog-threshold-journal',
          title: 'What I have been given',
          instructions: 'After the opening rite, list ten things you have been given in your life that you did not earn: by family, strangers, luck, the land, the sun itself. Then note what you already believe about Dazhbog and where you learned it.',
          times: 1,
          prompt: 'What have I been given, and what have I given in return?',
        },
      ],
      rite: {
        title: 'Introduction at sunrise',
        summary: 'Facing east as the light comes, with bread, honey and a single flame, to give your name to the sun.',
        minutes: 20,
        ingredients: [
          { name: 'A gold, yellow or orange candle', ref: 'traditional/candle/gold' },
          { name: 'A small round piece of bread' },
          { name: 'A little honey' },
          { name: 'A cup of water or mead', ref: 'traditional/tool/chalice' },
          { name: 'A view of the east, a window or a doorway' },
        ],
        preparation: 'Look up the sunrise time. Rise a little before it. Wash your face in cold water, an old Slavic morning custom. Set the bread, honey and cup on a sill or small table facing east.',
        steps: [
          {
            title: 'Face the east',
            instructions: 'Stand at the window or door facing where the sun will rise. Do not look straight at the sun; watch the sky brighten on the horizon and on the buildings or trees.',
            minutes: 3,
          },
          {
            title: 'Light',
            instructions: 'Light the candle as the sky brightens, a small fire to answer the great one.',
            light: true,
          },
          {
            title: 'Bow and greet',
            instructions: 'Bow from the waist, as East Slavic villagers bowed to the rising sun, and greet him.',
            spoken: 'Dazhbog, giver, sun of the morning,\nI greet you as you come over the edge of the world.',
          },
          {
            title: 'Name yourself',
            instructions: 'Tell him your name, where you live, and why you have come, in your own words. Thank him for one thing he gives you every day.',
            minutes: 3,
          },
          {
            title: 'Give bread and honey',
            instructions: 'Spread a little honey on the bread, set it in the light on the sill, and pour a little of the drink beside it. Sip the rest.',
            spoken: 'Bread that your light ripened, honey your warmth made.\nThe first of the day is yours.',
          },
          {
            title: 'Stand in the light',
            instructions: 'Stand quietly as the light reaches you. Feel it on your face and hands.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions: 'Thank him and snuff the candle.',
            spoken: 'Thank you, Dazhbog. I will greet you again.',
            snuff: true,
          },
        ],
        closing: 'Later that day, put the bread out for the birds or into the earth. Give something away before sunset: a coin, a meal, a kind word, your time.',
        safety: 'Never look directly at the sun. Do not leave a candle on a sunny sill near curtains, or unattended. Do not give honey to babies under one; use water instead of mead if you avoid alcohol.',
      },
    },
    {
      kind: 'study',
      title: 'Learning the Giving God',
      intro: 'Ten days of reading. You will learn what the medieval texts say, what his name means, how the sun lived in folk custom and the solstice feasts, and how he is honoured, and misused, today.',
      days: 10,
      lessons: [
        {
          id: 'dazhbog-who',
          title: 'Who Dazhbog is',
          summary: 'Three slim sources, a name about giving, and the riddle of Khors.',
          minutes: 6,
          sections: [
            {
              heading: 'On Vladimir’s hill',
              body: `In 980, the Russian Primary Chronicle says, Prince Vladimir set up idols on the hill outside his hall in Kiev: “one of Perun, made of wood with a head of silver and a mouth of gold, and others of Khors, Dazhbog, Stribog, Simargl, and Mokosh.” Dazhbog is third. The chronicle says nothing more about him, and eight years later his idol was thrown down with the others.`,
            },
            {
              heading: 'The sun, son of Svarog',
              body: `The second source is stranger. The Hypatian Chronicle, under the year 1114, contains a passage translated from the Byzantine world history of John Malalas, in which the Greek gods are retold as ancient kings. The Slavic translator glossed the names: Hephaestus is called Svarog, and Svarog’s son Helios, the Sun, is the king “whom they call Dazhbog.” Here, in a learned Christian aside, we get the clearest statement that Dazhbog was the sun, and that he was thought of as Svarog’s son.

That gloss is the root of the Rodnover family in which Svarog is the heavenly smith and father, and his sons, the Svarozhichi, are the sun and the fire. Notice how thin that root is: one translator’s note on a Greek chronicle.`,
            },
            {
              heading: 'Dazhbog’s grandsons',
              body: `The third source is poetry. The Lay of Igor’s Campaign, about a failed raid of 1185, twice speaks of the people of Rus as “Dazhbog’s grandson”: once lamenting that his substance was wasted while the princes feuded, and once when “contumely arose in the forces of Dazbog’s descendant,” as Leonard Magnus translated it in 1915. The poet, who also calls Boyan “Veles’s grandson” and the winds “Stribog’s grandsons,” uses the old gods as poetic ancestors.

Some read this as evidence that the Rus saw themselves as the sun’s descendants. Others think the poet was playing with half-remembered names. Either way, it gives Dazhbog an ancestral role that modern devotees treasure, and that nationalists have misused.`,
            },
            {
              heading: 'The giving god, and Khors',
              body: `His name is usually split into dazh-, from dati, to give, and bog. In Slavic, bog meant god but also wealth or a good share: bogatyi is rich, ubogii is poor, literally “without a share.” So Dazhbog is the giving god, or the god who gives the good share. That is a lovely, solid fact to hold.

Khors, named just before him in 980, seems also to have been a sun god; his name may be Iranian, from a word for the shining sun. Ralston reported in 1872 that “Khors and Dazhbog are supposed ... to have been two forms of one deity, the Sun-god.” Some scholars still think so; others see Khors as the sun’s disk and Dazhbog as its gift. In Serbian folklore a figure called Dabog or Daba survives as an earthly king or a devilish adversary of God, which may be a much-changed memory of the same name.`,
            },
          ],
          knowAndDont: {
            known: 'Dazhbog was among Vladimir’s idols in 980. The Hypatian Chronicle (s.a. 1114) glosses the Sun as Dazhbog, son of Svarog. The Lay of Igor twice calls the Rus “Dazhbog’s grandson.” His name means “giving god” or “god of the good share.” Khors, also a sun god, stood beside him.',
            unknown: 'No myth, prayer, image or festival of Dazhbog survives. Whether he and Khors were the same god, and whether the Serbian Dabog is connected, are debated. His chariot, family, symbols and festivals in modern practice are reconstruction.',
          },
          inPractice: 'Most Rodnovers greet him simply as Dazhbog, sometimes as Dazhdbog, and some call him Svarozhich, son of Svarog. Write his three sources on the first page of your notebook; they fit on half a page, which is itself worth knowing.',
          reflect: [
            'What does it mean to me that his name is about giving rather than ruling?',
            'How do I feel about calling myself a grandchild of the sun?',
          ],
          further: [
            'The Russian Primary Chronicle, trans. Samuel H. Cross (1930), entry for 980',
            'The Tale of the Armament of Igor, trans. Leonard A. Magnus (1915), with notes on Dazhbog',
            'Judith Kalik and Alexander Uchitel, Slavic Gods and Heroes (2019), on Dazhbog and Khors',
          ],
          library: ['traditional/deity/dazhbog', 'traditional/deity/ra', 'traditional/deity/apollo'],
        },
        {
          id: 'dazhbog-folk-sun',
          title: 'The sun in Slavic folk belief',
          summary: 'Bowing to the sunrise, the sun that dances, the share of fortune, and the sun’s many faces.',
          minutes: 6,
          sections: [
            {
              heading: 'Bowing to the morning',
              body: `The pagan Dazhbog left little trace, but the sun itself was everywhere in Slavic village life. Church sermons complained that people bowed to the sun. Well into the nineteenth century, East Slavic peasants crossed themselves and bowed to the rising sun, washed their faces at dawn, and would not turn their backs or spit toward the sun. Russian spoken charms very often open the same way: the speaker rises, blesses themself, goes out through the door and the gate into the open field, and turns toward the east.

These customs belong to Christian villagers, and the God they were praying to was the Christian one. But they show an old reverence for sunrise as the moment of blessing, and that is the shape modern Dazhbog devotion takes.`,
            },
            {
              heading: 'The sun that plays',
              body: `On Easter morning, and in many places on the morning of Kupala, people climbed hills or went out early to watch the sun “play”: to dance, shimmer and change colour as it rose. Russian, Ukrainian and Belarusian sources all record it. Some said you could see it leap three times. Children were woken to see it.

Around midwinter, songs and stories tell of the sun turning back toward summer, and some regions said the sun “put on its holiday clothes and went to summer.” The sun in folk song is sometimes a woman, sometimes a man, sometimes a fair maiden with a brother the moon. There is no single Slavic sun myth, and Dazhbog is not named in any of these songs.`,
            },
            {
              heading: 'The good share',
              body: `The idea in his name, bog as a share of fortune, runs deep in Slavic belief. Fortune was called dolia or srecha, a portion dealt out at birth, which could be good or bad. Folk tales tell of people who go looking for their dolia, find her asleep or idle, and must wake or court her. The good share was something given, and could be shared on.

That is why generosity sits at the heart of modern Dazhbog devotion. If the sun is the great giver, honouring him means giving too. Rodnovers often say the right offering to Dazhbog is a gift to another person.`,
            },
            {
              heading: 'Fire and the sun',
              body: `In Slavic belief, as in many cultures, earthly fire was the sun’s kin. Fire was respected in the house: not spat into, not stamped on, fed with bread crumbs and salt, and in many places the house fire was not allowed to go out. New fire was kindled by friction at certain festivals, especially at Kupala, when bonfires were lit from a “living fire” made by rubbing wood together.

Modern Rodnovers who honour Dazhbog nearly always do so with fire, and many see fire as Svarozhich, the son of Svarog, closely linked to the sun. That link comes from the 1114 gloss and from folk reverence for the hearth.`,
            },
          ],
          knowAndDont: {
            known: 'East Slavic peasants bowed to the rising sun, washed at dawn, began charms by going toward the east, watched the sun “play” on Easter and Kupala mornings, and respected fire as holy. Beliefs about dolia, the share of fortune dealt at birth, are widely recorded.',
            unknown: 'None of these folk customs names Dazhbog, and they were kept by Christian villagers. Whether they continue his pagan worship is a reasonable hypothesis, not a proven fact.',
          },
          inPractice: 'Greeting the sunrise with a bow, washing your face in cold water, and giving something away during the day are the commonest daily devotions to Dazhbog. Fire, a candle or a hearth, is his usual altar.',
          reflect: [
            'When did I last watch a sunrise, and what did I feel?',
            'What is my share in life, and how could I share it on?',
          ],
          further: [
            'Linda J. Ivanits, Russian Folk Belief (1989), on charms and the calendar',
            'W. F. Ryan, The Bathhouse at Midnight (1999), on charms and divination',
          ],
          library: ['traditional/crystal/sunstone', 'traditional/herb/calendula'],
          premade: ['kitchen-solitary-morning-practice'],
        },
        {
          id: 'dazhbog-solstices',
          title: 'Koliada and Kupala',
          summary: 'The winter and summer turnings of the sun, their real customs, and their modern Dazhbog meaning.',
          minutes: 7,
          sections: [
            {
              heading: 'Koliada, the midwinter carols',
              body: `Koliada is the Slavic midwinter festival, kept in Christian times from Christmas Eve to Epiphany. Its word comes from the Latin calendae, the first day of the month, which tells you it is old but also borrowed. Its heart is carolling. Groups of young people went from house to house with a star on a pole, singing koliadki that wished the household wealth, health and a good harvest, and were paid with sausage, pies, coins and sweets. Mummers came too, dressed as goats, bears and old men.

In Ukraine, a sheaf called the didukh, the grandfather, stood in the corner of the house, holding the spirits of the ancestors for the holy days. The Christmas Eve supper had twelve meatless dishes, beginning with kutia, wheat with honey and poppy seed.`,
            },
            {
              heading: 'Koliada for Dazhbog',
              body: `Modern Rodnovers keep Koliada at the winter solstice as the rebirth of the sun, and many honour Dazhbog then, as the young sun or the sun returning. Some call the newborn sun Koliada himself, a figure first sketched by nineteenth-century scholars. This is reconstruction, but it fits the season: the longest night, the turn, the carollers going round with a star and wishing everyone the good share.

The giving is the custom that matters most. Carollers sang blessings and were given food; the household gave and was blessed. If you keep Koliada for Dazhbog, give generously: to carollers, to neighbours, to people with less.`,
            },
            {
              heading: 'Kupala, the midsummer fires',
              body: `Kupala Night, around 23–24 June (or 6–7 July in the old calendar), is the great summer festival of the East Slavs and Poles, joined to the feast of St John the Baptist. Bonfires were lit, often from new fire, and young people jumped over them in pairs. Girls floated wreaths on the rivers to read their fortunes. People bathed at dawn, rolled in the dew, gathered herbs at their most potent, and searched the forest for the legendary fern flower. The sun was watched as it rose and played.

Modern Rodnovers keep Kupala at the summer solstice, honouring the sun at its height. For many, Dazhbog is at the centre of it, though Kupala itself is also treated as a deity, and Perun and Lada are honoured too.`,
            },
            {
              heading: 'Keeping both turnings',
              body: `A simple year with Dazhbog moves between these two: the sun reborn in the dark of Koliada, the sun in its glory at Kupala. At Koliada you keep a light through the long night, give gifts, and greet the first sunrise after the solstice. At Kupala you keep a fire, stay up late or rise early, and watch the sun come up on the shortest night.

Both festivals are living traditions with Christian and folk layers. Enjoy them, learn their songs and foods, and know that putting Dazhbog at their centre is a modern choice.`,
            },
          ],
          knowAndDont: {
            known: 'Koliada carolling, mummers, the didukh, and the twelve-dish Christmas Eve supper are well recorded. Kupala bonfires, wreaths, dew, herbs and the fern flower are documented from the nineteenth century and earlier. Both festivals were joined to Christian feasts.',
            unknown: 'Whether either festival was a pagan feast of Dazhbog is unknown. A god called Koliada and the sun-rebirth framing are nineteenth-century and modern reconstructions.',
          },
          inPractice: 'Rodnovers honour Dazhbog at the winter solstice with a vigil light, kutia, carols and gifts, and at the summer solstice with bonfires, wreaths and watching the sunrise. Many greet the first sunrise after each solstice as his.',
          reflect: [
            'What would it mean to keep a light through the longest night?',
            'Who could I carol to, in my own way, this winter?',
          ],
          further: [
            'W. R. S. Ralston, The Songs of the Russian People (1872), on koliadki and Kupala',
            'Ronald Hutton, The Stations of the Sun (1996), for comparison with western solstice customs',
          ],
          library: ['traditional/herb/st_johns_wort', 'traditional/herb/oak'],
          premade: ['folk-kupala-wreath', 'folk-gratitude-ritual'],
        },
        {
          id: 'dazhbog-today',
          title: 'Dazhbog today, and his name misused',
          summary: 'Rodnovery, RUNVira’s one God, the forged texts, the kolovrat, and where this journey stands.',
          minutes: 7,
          sections: [
            {
              heading: 'In the Native Faith',
              body: `In most Rodnover groups, Dazhbog is honoured as the sun, the giver of light, warmth, harvest and good fortune, and often as an ancestor of the people. He is greeted at sunrise, honoured with fire, bread, honey, mead and grain, and celebrated at both solstices. Some groups pair him with Khors, some with Svarog as father, some with Mokosh or Lada.

A Ukrainian movement goes much further. RUNVira, the Native Ukrainian National Faith, was founded in 1966 by Lev Sylenko among the diaspora in North America and later spread to Ukraine. It worships Dazhbog as the one God and has its own scripture, Maha Vira. It is a monotheistic, national religion, quite different from other Rodnover groups.`,
            },
            {
              heading: 'The forged scripture',
              body: `Much of what you read online about Dazhbog’s grandchildren and their ancient wanderings comes from the Book of Veles (Velesova kniga). It surfaced in the 1950s, claiming to be copied from wooden boards found in 1919 and since lost. Linguists agree it is a forgery: its language is a modern mixture that no medieval Slav wrote.

Some Rodnover groups, and RUNVira in its early years, used it as scripture. Reconstructionist groups do not. If a description of Dazhbog quotes it, treat it as modern writing.`,
            },
            {
              heading: 'The sun wheel and the far right',
              body: `Sun symbols are a real part of Slavic folk art: rosettes, rayed circles, crosses in circles, carved on houses, painted on eggs and embroidered on cloth. But the eight-armed hooked sun wheel called the kolovrat is not one of them. It was first drawn in 1923 by the Polish artist Stanisław Jakubowski, in a book of imagined proto-Slavic designs, and in recent decades it has become one of the most common symbols of neo-Nazi and far-right groups in Russia, Ukraine and Poland, often alongside other hooked crosses.

Some peaceful Rodnovers use it without any such meaning, and some groups have tried to reclaim it. But a newcomer cannot know who will read it how. This journey recommends a simple circle, a rayed sun, or a folk rosette instead.`,
            },
            {
              heading: 'Whose grandchildren?',
              body: `The Lay of Igor’s line about “Dazhbog’s grandsons” has been used by some groups to describe an ethnic people descended from the sun, and to exclude others. The poem itself says nothing about race; it is a lament for princes who wasted their inheritance in feuds.

This journey is inclusive. If you take Dazhbog as your god, you are a grandchild of the sun because you live by his light, as every person does. His name is giving; a devotion that shuts people out has forgotten what his name means.`,
            },
          ],
          knowAndDont: {
            known: 'Dazhbog is honoured in many Rodnover groups as a sun and ancestral god, and as the one God in RUNVira, founded by Lev Sylenko in 1966. The Book of Veles is a twentieth-century forgery. The kolovrat was designed in 1923 and is widely used by the far right.',
            unknown: 'Whether the Rus of the Lay of Igor really thought of themselves as descended from Dazhbog, or whether it was a poetic figure, is unknown.',
          },
          inPractice: 'Choose your symbols with care: a rayed sun, a circle, a sunflower or a folk rosette. If you look for a group, ask what they think of outsiders, other faiths and ethnic purity, and avoid any that answer uneasily.',
          reflect: [
            'How will I keep my devotion to him generous and open?',
            'What would I say to someone who used his name to exclude others?',
          ],
          further: [
            'Adrian Ivakhiv, “The Revival of Ukrainian Native Faith,” in Modern Paganism in World Cultures (2005)',
            'Kaarina Aitamurto and Scott Simpson (eds.), Modern Pagan and Native Faith Movements in Central and Eastern Europe (2013)',
          ],
          library: ['traditional/deity/dazhbog', 'traditional/deity/veles'],
        },
      ],
      practices: [
        {
          id: 'dazhbog-watch-sunrise',
          title: 'Watch a whole sunrise',
          instructions: 'Once during the study stage, go somewhere with a view of the east and watch from first grey light until the sun is clear of the horizon. Do not look straight at the sun. Watch the colours, the birds, the light on the land.',
          times: 1,
          prompt: 'What changed in the world, and in me, as the light came?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine sunrises of giving',
      intro: 'Now you set up his shrine and keep nine mornings of greeting, each followed by a gift given away during the day.',
      days: 9,
      lessons: [
        {
          id: 'dazhbog-shrine-offerings',
          title: 'Shrine, days and offerings',
          summary: 'A bright shrine facing east, the right gifts, the manner of giving, and what to avoid.',
          minutes: 6,
          sections: [
            {
              heading: 'A shrine facing east',
              body: `Put Dazhbog’s shrine where the morning light reaches, on an east-facing sill or shelf if you have one. If your home faces the wrong way, any bright spot will do, and you can turn toward the east as you greet him.

On it, set a gold, yellow or orange candle, a small round loaf or a bread roll, a dish for honey, and a cup. A bright cloth, gold or yellow, or embroidered with red, suits him. Sunstone, amber, citrine or carnelian if you like stones. A simple sun disc, a rayed circle, or a folk rosette drawn on card. Ears of wheat or rye, and in summer, flowers like calendula or sunflowers, which are modern but well loved. Keep the shrine bright and clean; he is a god of open light.`,
            },
            {
              heading: 'What to give',
              body: `His offerings are the gifts of the sun: bread, especially round loaves (the Ukrainian korovai and kolach are round and sun-shaped), grain, honey, mead, and fire itself. Kutia at Koliada. Fresh herbs gathered at Kupala.

Above all, he is given gifts given to others. Share food with someone who is hungry, give to a food bank, buy a stranger’s coffee, give your time. Rodnovers say this is the offering he loves most, and it follows from his name.`,
            },
            {
              heading: 'The manner of giving',
              body: `Greet him at sunrise if you can, or first thing in the morning. Wash your face in cold water. Face east, bow, light his candle, and speak to him plainly. Give him the first of the day: the first bite of bread, the first sip of drink.

His bread goes outside within a day, for the birds or into the soil. If you have a safe outdoor fire, crumbling bread and grain into it is the oldest form of offering. The gift you give to another person is best given without fuss or credit; you might simply say, inwardly, “in Dazhbog’s name.”`,
            },
            {
              heading: 'The round loaf',
              body: `Round breads are the most fitting thing to bake for him, and Slavic kitchens are full of them. The korovai is the great wedding loaf of Ukraine, Belarus and Russia; the kolach is a braided ring bread for Christmas and harvest, with a candle set in the centre on Ukrainian Christmas Eve tables. Smaller round buns and flatbreads were baked for many feasts.

You do not need to be a baker. A plain bread dough shaped into a round, slashed across the top with a simple cross or rays before baking, is a perfectly good offering. Brush it with a little honey as it comes out of the oven. Give the first slice to his shrine, share the rest, and if you can, give a whole loaf away to someone who would welcome it.`,
            },
            {
              heading: 'What to avoid',
              body: `Never look directly at the sun, even at dawn. Do not use the kolovrat or other symbols you cannot vouch for. Do not use his name or the “grandchildren” line to divide people.

Do not hoard in his name. A prosperity devotion that only ever asks is the opposite of a giving god. And do not treat his ancient mythology as settled; tell people honestly how little survives. That honesty is a kind of light too.`,
            },
          ],
          knowAndDont: {
            known: 'Bread, grain, honey and fire offerings, round festive loaves, and bowing to the sunrise are well documented in Slavic folk practice. Generosity at Koliada is central to the recorded carolling custom.',
            unknown: 'How pagan Slavs honoured Dazhbog is not recorded. The shrine and the emphasis on giving to others are modern, built from his name and folk custom.',
          },
          inPractice: 'Set his shrine in the light today. For nine mornings, greet the sun, give him the first bite and sip, and give one thing away to someone else before sunset.',
          reflect: [
            'What could I give away tomorrow that would cost me a little?',
            'Where in my home does the morning light fall first?',
          ],
          library: ['traditional/crystal/sunstone', 'traditional/crystal/amber', 'traditional/crystal/citrine', 'traditional/candle/yellow', 'traditional/herb/calendula'],
          premade: ['cosmic-sunday-sun-success', 'kitchen-prosperity-bread'],
        },
      ],
      practices: [
        {
          id: 'dazhbog-nine-sunrises',
          title: 'Nine sunrises of giving',
          instructions: 'On each of nine mornings, as near sunrise as you can, wash your face in cold water, face east, bow, and light his candle. Give him the first bite of bread with honey and the first sip of your drink. Speak to him for a minute or two. Then, before sunset, give something away to another person: food, money, time, help, a sincere compliment. On the ninth morning, offer a whole small round loaf and give a larger gift that day.',
          times: 9,
          every: 'day',
          prompt: 'What did I give today, to whom, and how did it feel?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'In the clear light',
      intro: 'Before dedicating, pause and weigh it. Answer the questions honestly over several days. Choosing to keep greeting the sun without a formal dedication, pausing, or turning to another god are all good outcomes.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'dazhbog-discernment-write',
          title: 'Write it out',
          instructions: 'Answer the questions below in your journal over a few days. Reread your threshold list of what you have been given. Then write in one sentence what you would promise him for a year.',
          times: 1,
          prompt: 'What could I give, regularly, in the giving god’s name?',
        },
      ],
      questions: [
        'Did these mornings make me more generous, or did I mostly want his blessings of prosperity?',
        'Am I at peace with how little is known of him, and with how much is modern?',
        'Have I thought through the politics attached to his name and symbols, and am I ready to keep my devotion open to all?',
        'Can I keep a weekly greeting and a weekly gift for a year, including in the dark of winter?',
        'Is it the sun I am drawn to, or a story about ancestry? What do I want from that story?',
        'Would it be enough, for now, to keep honouring him without a formal dedication?',
      ],
    },
    {
      kind: 'dedication',
      title: 'Giving at dawn',
      intro: 'If you choose to go ahead, this is your dedication. It is a self-dedication, a promise between you and Dazhbog. It is not an initiation into any group, nor into RUNVira or any other faith organisation, and it does not replace one if you later join a community with its own rites. Stopping before this, or choosing another path, would have been a good outcome too.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Dedication to Dazhbog',
        summary: 'A sunrise rite: fire, a round loaf shared, honey and mead, a sun token, and a promise of giving.',
        minutes: 45,
        ingredients: [
          { name: 'A gold or yellow candle, or a small fire where fires are allowed', ref: 'traditional/candle/gold' },
          { name: 'A round loaf of bread' },
          { name: 'Honey and mead, or juice or water', ref: 'traditional/tool/chalice' },
          { name: 'A few ears of wheat or a handful of grain' },
          { name: 'A sun token: a sunstone, amber, or a disc you have made', ref: 'traditional/crystal/sunstone' },
          { name: 'A gift to give away later that day' },
        ],
        preparation: 'Choose a sunrise near a solstice if you can, or any clear morning. Find a place with a view of the east: a hill, a park, a balcony or a window. Go with a friend, or tell someone where you are, if you are out at dawn. Write your promise in one sentence: “I will give something away every week,” “I will greet the sun every morning I can,” “I will share my table.” Prepare the gift you will give later.',
        steps: [
          {
            title: 'Arrive before the light',
            instructions: 'Arrive while it is still grey. Wash your face and hands in cold water. Set out the loaf, honey, cup, grain and token on a cloth facing east.',
            minutes: 5,
          },
          {
            title: 'Kindle the flame',
            instructions: 'Light the candle or the small fire as the sky brightens.',
            light: true,
            spoken: 'Little fire, child of the sun,\ncall your father up over the edge of the world.',
          },
          {
            title: 'Bow and call',
            instructions: 'As the sun appears, bow from the waist, three times, and greet him. Do not look straight at the sun; look at the light on the land.',
            spoken: 'Dazhbog! Dazhbog! Dazhbog!\nGiving god, sun of the morning,\nyou who deal out the good share to all,\nI stand in your light to give myself to you.',
          },
          {
            title: 'Give the first of the bread',
            instructions: 'Break the round loaf. Put the first piece, spread with honey, by the flame or into the fire, and scatter a little grain.',
            spoken: 'The first of the loaf your light ripened,\nand grain for the next field.',
          },
          {
            title: 'Pour the cup',
            instructions: 'Pour a share from the cup onto the earth, then drink.',
          },
          {
            title: 'Make the promise',
            instructions: 'Hold the sun token in both hands, in the light. Read your promise aloud once, then speak the words below.',
            spoken: 'This I promise for a year and a day.\nI give myself to your honour, Dazhbog,\nto give as you give, without asking who deserves it,\nto greet the light and be glad of it,\nand to keep the good share moving from hand to hand.',
          },
          {
            title: 'Stand in the light',
            instructions: 'Stand quietly as the sun rises and its warmth reaches you.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Share and close',
            instructions: 'Eat a piece of the loaf yourself and, if a friend is with you, share it. Thank him. Put out the flame fully.',
            spoken: 'Thank you, giving god. I go to give.',
            snuff: true,
          },
        ],
        closing: 'Leave his portion of bread for the birds. Keep the sun token on his shrine. Before sunset, give away the gift you prepared, and give away the rest of the loaf if you can. Note the date for your renewal.',
        safety: 'Never look directly at the sun. Only light fires where legal and safe, with water to hand, and put them out completely. Take care outdoors at dawn: go with someone, wear warm clothes, and watch your footing. Do not give honey to babies under one; avoid alcohol if needed and use juice or water.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the light',
      intro: 'A dedication begins a year of practice. Here is a rhythm: a weekly sunrise and gift, the solstices, and a yearly renewal.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'dazhbog-weekly',
          title: 'Weekly sunrise and gift',
          instructions: 'Once a week, often on Sunday in modern practice, greet him at sunrise or first thing, give him bread and honey, and give something away that day.',
          times: 52,
          every: 'week',
          prompt: 'What did I give this week?',
        },
        {
          id: 'dazhbog-solstices',
          title: 'The two turnings',
          instructions: 'At Koliada, keep a light through the longest night, give gifts, and greet the first sunrise after the solstice. At Kupala, keep a fire, rise early or stay up, and greet the sunrise on the shortest night.',
          times: 1,
          every: 'holy-day',
          prompt: 'What has his light grown in my life since the last turning?',
        },
        {
          id: 'dazhbog-rededication',
          title: 'Renew the promise',
          instructions: 'A year and a day after your dedication, greet the sunrise again. Read your promise and say honestly how you kept it. Make a new promise for the year, or thank him and release it.',
          times: 1,
          prompt: 'What will I give in the year ahead?',
        },
      ],
    },
  ],
  sources: [
    'The Russian Primary Chronicle, trans. Samuel H. Cross (1930), entry for 980, quoted: https://archive.org/details/doncarlosthemeha0000fred',
    'W. R. S. Ralston, The Songs of the Russian People (1872), p. 102, quoted on Khors and Dazhbog: https://archive.org/details/songsofrussianpe00ralsuoft',
    'The Tale of the Armament of Igor, ed. and trans. Leonard A. Magnus (1915), with notes on Dazhbog and the Hypatian gloss of 1114: https://archive.org/details/taleofarmamentof00magnuoft',
    'Hypatian Chronicle, s.a. 1114, gloss on the Slavonic Malalas (paraphrased)',
    'Judith Kalik and Alexander Uchitel, Slavic Gods and Heroes (2019)',
    'Linda J. Ivanits, Russian Folk Belief (1989)',
    'Adrian Ivakhiv, “The Revival of Ukrainian Native Faith,” in M. Strmiska (ed.), Modern Paganism in World Cultures (2005)',
  ],
};
