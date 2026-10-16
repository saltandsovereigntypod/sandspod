import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-freyr',
  kind: 'deity',
  paths: ['norse'],
  deityRef: 'traditional/deity/freyr',
  title: 'Freyr, Lord of Good Seasons',
  summary:
    'A lunar month with Yngvi-Freyr, the Vanir god of rain and sun, harvest, peace and plenty: his love story, his Yule boar, his old cult at Uppsala, and how to honour him with ale, bread and frith.',
  welcome: `This journey spends about a month with Freyr: the stories, the evidence for one of the best-attested cults of the Norse world, his ties to Yule and the harvest, and how Heathens honour him now. You will set up a shrine, keep nine nights of offering and thanks, and decide at the end whether to dedicate yourself.

It is a self-dedication, not an initiation, and it does not replace the rites of any Heathen group. Freyr is often reduced to a fertility god. He is that, and also the god of peace, of good rule, of a community that has enough and shares it. You do not need a farm. A windowsill of herbs, a loaf of bread and a decent relationship with your neighbours will do.`,
  about: `Freyr (Old Norse “Lord”), also called Yngvi-Freyr and Ingunar-Freyr, is a god of the Vanir, son of the sea god Njörðr and twin brother of Freyja. Snorri says he rules rain and sunshine and the fruits of the earth, and that it is good to call on him for harvests and peace. He owns the golden boar Gullinbursti and the ship Skíðblaðnir, which folds into a pouch, and the gods gave him Álfheimr, the elves’ world, as a tooth-gift. He gave away his sword for love of the giantess Gerðr and will fight at Ragnarök with an antler. The Swedes honoured him as divine ancestor of their Yngling kings; Adam of Bremen describes his image at Uppsala, and the sagas tell of priests (Freysgoðar), sacred fields, horses and oxen dedicated to him, and of the sacred boar on which vows were sworn at Yule. Today Heathens honour him at the harvest, at Winter Nights and above all at Yule, with ale, bread, grain, first fruits and pork, and ask him for good seasons, plenty, peace and the well-being of the whole community.`,
  notes: [
    'Freyr was worshipped with images that were openly phallic, and the sources speak frankly of fertility and desire. This journey treats that matter-of-factly, without making it the whole of him.',
    'Skírnismál, his central myth, includes threats and curses made on his behalf to win Gerðr. This journey discusses that honestly and does not use the curses; rites here are devotional only.',
    'Freyr’s old cult included the sacrifice of horses, oxen and boars. Modern devotion offers food and drink, not animals.',
    'This app is inclusive. Freyr is honoured as god of peace and plenty for everyone, of any ancestry, gender or orientation; groups that make the gods a matter of race are not the tradition taught here. The Ingwaz rune has occasionally appeared in racist iconography; it is mainly an ordinary rune, but know its context.',
    'Yule pork and other rich offerings attract pets and pests. Clear them promptly, and keep onion, garlic, grapes and cooked bones away from dogs and cats.',
  ],
  holyDays: ['jol', 'haustblot', 'vetrnaetur', 'midsummer', 'sigrblot'],
  stages: [
    {
      kind: 'threshold',
      title: 'First Fruits',
      intro:
        'Freyr gives the good seasons; the oldest way to honour him is to give back the first of what they bring. These first days are about making a place for him and offering the first bite.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'freyr-shrine',
          title: 'Set up a shrine',
          instructions: `Choose a place with some daylight, ideally near where you cook or grow things: a kitchen shelf, a windowsill by a pot of herbs. Lay down a green, gold or brown cloth, or a piece of undyed linen. Add a cup or horn, a dish for grain or bread, and one candle in a holder.

For images: a boar (a small figure, a drawing, a picture of the boar-crested helmets of Anglo-Saxon England), a sheaf of barley or wheat, a small model boat for Skíðblaðnir, an antler. A pot of living herbs or a jar of seeds suits a god of growth.

Keep a little bowl of grain, barley, oats or wheat, on the shrine all month. You will use it in the rites.`,
          times: 1,
          prompt: 'What on your shrine is alive, or came from the earth?',
        },
        {
          id: 'freyr-first-bite',
          title: 'The first bite',
          instructions:
            'For three days, set aside the first bite or sip of one meal for Freyr before you eat. Say: “Freyr, the first is yours.” Put it on the shrine and give it to the earth later.',
          times: 3,
          every: 'day',
          prompt: 'What did you set aside? Did it change how you ate the rest?',
        },
      ],
      rite: {
        title: 'Greeting the Lord of the Harvest',
        summary:
          'A short first greeting: hallow the space, offer ale and bread and a handful of grain, tell Freyr why you have come, and share the cup.',
        minutes: 20,
        ingredients: [
          { name: 'A cup of ale, beer, mead or apple juice' },
          { name: 'A slice of bread, ideally barley, rye or wholemeal' },
          { name: 'A handful of barley, oats or wheat' },
          { name: 'A candle in a safe holder', ref: 'traditional/candle/green', optional: true },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
        ],
        preparation: 'Wash your hands. Tidy the shrine. Pour the ale, set out the bread and the grain.',
        steps: [
          {
            title: 'Hallow the space',
            instructions: 'Light the candle. Walk sunwise around the room and name it holy.',
            spoken: 'I hallow this place in frith, in peace. Let no quarrel and no weapon stand here while the cup is full.',
            light: true,
          },
          {
            title: 'Greet him',
            instructions: 'Stand before the shrine and lift the cup.',
            spoken:
              'Freyr, Lord, Yngvi, son of Njörðr, brother of Freyja. Ruler of the rain and the sunshine and the fruits of the earth, lord of Álfheimr, rider of the golden boar. I bring you ale and bread and grain. Hear me.',
          },
          {
            title: 'Say why you have come',
            instructions:
              'Tell him plainly why you are here: thanks for what you have, a hope for growth, a wish for peace in your home or community, a longing like his for Gerðr. Speak for a few minutes.',
            minutes: 5,
          },
          {
            title: 'Share and scatter',
            instructions:
              'Drink a sip and eat a bite of bread. Then take the grain and scatter a pinch into the offering bowl.',
            spoken: 'I share with you, and give you the first. Hail Freyr!',
          },
          {
            title: 'Sit a while',
            instructions: 'Sit quietly. Notice the light in the room, the smell of the bread, your own body fed.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Thank him. Snuff the candle. Later the same day, pour the ale and lay the bread and grain on the earth outside, in a garden bed, a park verge or at the foot of a tree.',
            spoken: 'Thank you, Freyr. I will come back.',
            snuff: true,
          },
        ],
        closing: 'Write down what you said, and something you are grateful for that came from the earth.',
        safety:
          'Never leave a candle burning unattended. Pour drink offerings outside or down a drain, not into houseplants. Clear bread and grain the same day so they do not draw mice. Keep offerings away from pets.',
      },
    },
    {
      kind: 'study',
      title: 'The Lord and the Giant’s Daughter',
      intro:
        'Twelve days of reading: who Freyr is, the love story at the centre of his myths, and the remarkable evidence of how the Swedes, Norwegians and Icelanders worshipped him.',
      days: 12,
      lessons: [
        {
          id: 'freyr-who',
          title: 'Rain, Sun and the Fruits of the Earth',
          summary: 'Freyr’s family, names, treasures and character as the sources give them.',
          minutes: 6,
          sections: [
            {
              heading: 'The best of the gods',
              body: `Freyr comes to the Æsir as a hostage after the war between the two families of gods, with his father Njörðr and his sister Freyja. Snorri introduces him warmly, in Rasmus Anderson’s 1880 translation: “Frey is the most famous of the asas. He rules over rain and sunshine, and over the fruits of the earth. It is good to call on him for harvests and peace. He also sways the wealth of men.”

In Lokasenna, where Loki insults every god in the hall, the war god Týr defends Freyr:

“Of the heroes brave is Freyr the best / Here in the home of the gods; / He harms not maids nor the wives of men, / And the bound from their fetters he frees.” (Henry Adams Bellows’ 1923 translation, stanza 37)

He is gentle, generous, and on the side of the captive. That is worth remembering when people call him “just” a fertility god.`,
            },
            {
              heading: 'Lord, Yngvi, and the elves',
              body: `Freyr means simply “Lord,” as Freyja means “Lady.” His other name is Yngvi, or Ingunar-Freyr. The Swedish royal house, the Ynglings, claimed descent from him; the Old English Rune Poem names a hero Ing first seen among the East Danes; and the Roman writer Tacitus mentions the Ingaevones, a group of Germanic peoples by the North Sea, perhaps “the people of Ing.” The rune Ingwaz, shaped like a diamond or two crossed X’s, carries his name.

In Grímnismál, Odin lists the gods’ halls: “And Alfheim the gods to Freyr once gave / As a tooth-gift in ancient times” (Bellows, stanza 5). A tooth-gift was a present given to a child when its first tooth came through. So Freyr is lord of the álfar, the elves, beings closely linked with ancestors, mounds and the fertility of the land.`,
            },
            {
              heading: 'His treasures and servants',
              body: `The dwarves made Freyr two great gifts. Gullinbursti, “golden bristles,” is a boar whose mane shines in the dark and who runs over sea and sky faster than any horse; Freyr rode him to Baldr’s funeral. Skíðblaðnir is a ship big enough for all the gods, which always has a fair wind and folds up small enough to carry in a pouch.

His servant is Skírnir, the “shining one.” Two lesser servants, Byggvir and Beyla, appear in Lokasenna; Byggvir’s name is connected with barley (bygg), and he boasts of how quickly he grinds grain for the gods. Freyr’s household is a farm.`,
            },
          ],
          knowAndDont: {
            known:
              'Snorri’s Gylfaginning and Skáldskaparmál describe Freyr’s rule over weather and harvest, his treasures and Álfheimr. Lokasenna and Grímnismál are Eddic poems. The Ynglings’ descent from Yngvi-Freyr is in Ynglinga saga and the older poem Ynglingatal.',
            unknown:
              'Whether Ing, the Ingaevones and Yngvi were all the same god as Freyr is a reasonable theory, not a certainty. The álfar’s nature is debated; the sources link them with the dead, with mounds and with the gods, but never fully describe them. Byggvir and Beyla appear only in Lokasenna.',
          },
          inPractice:
            'Many Heathens call on Freyr as Yngvi at Yule and as Freyr at harvest, and honour the álfar alongside him at Winter Nights, often by leaving an offering at a mound, a tree or a quiet corner of a garden.',
          reflect: [
            'Týr praises Freyr for freeing the bound. What is bound in your life, or in your community, that needs freeing?',
            'What would it mean to honour a god for peace and plenty, not only for desire?',
          ],
          further: [
            'Gylfaginning ch. 24 in Rasmus B. Anderson, The Younger Edda (1880), public domain.',
            'Lokasenna and Grímnismál in Henry Adams Bellows, The Poetic Edda (1923), public domain.',
            'Alaric Hall, Elves in Anglo-Saxon England (2007), on the álfar and their kin.',
          ],
          library: ['traditional/deity/freyr', 'traditional/deity/freyja', 'traditional/crystal/moss_agate'],
        },
        {
          id: 'freyr-myths',
          title: 'Skírnismál: The Sword Given for Love',
          summary: 'The central Freyr myth, its troubling threats, and what it means for the god who fights the last battle without a sword.',
          minutes: 7,
          sections: [
            {
              heading: 'Seen from the high seat',
              body: `Skírnismál, one of the most vivid Eddic poems, opens with Freyr doing something forbidden: he sits on Hliðskjálf, Odin’s high seat, and looks out over all the worlds. In the land of the giants he sees a young woman, Gerðr, crossing a courtyard, and her arms shine so that sea and sky are lit by them. He falls into a lovesick misery and will not eat, drink or speak.

His servant Skírnir agrees to woo her for him, in exchange for Freyr’s horse and his sword, which fights by itself. Freyr gives the sword. That gift will cost him at the end of the world.`,
            },
            {
              heading: 'The wooing',
              body: `Skírnir rides through flickering fire to Gerðr’s hall. He offers her eleven golden apples and the ring Draupnir. She refuses. He threatens to cut off her head and her father’s. She refuses. Then he speaks a long, terrifying curse, carving runes against her: she will be sent to the giants’ realm, wither like a thistle, have no joy, marry a three-headed giant. Only then does Gerðr agree to meet Freyr in nine nights’ time in the grove of Barri.

Skírnir returns, and Freyr’s reply is one of the most human lines in the Edda: “Long is one night, longer are two; / How then shall I bear three? / Often to me has a month seemed less / Than now half a night of desire.” (Bellows, stanza 43)`,
            },
            {
              heading: 'How to read it',
              body: `Some scholars, following the Norwegian Magnus Olsen in 1909, read the poem as a sacred-marriage myth: the god of fertility (Freyr) marries the frozen earth (Gerðr, from garðr, “enclosure” or “field”), and the land wakes into spring after a waiting time, like a seed in the ground. Others read it as a poem about the meeting of gods and giants, or about kingship, or simply as a love story. These readings can all be true at once.

What should not be glossed over is the coercion. Gerðr agrees only after threats and a curse. Some modern Heathens find this unbearable and see Skírnir, not Freyr, as the one who crossed a line; others think the poem shows a world where desire and power were not yet separate. Either way, it is a story to read with open eyes, not a model for how to win love. This journey does not use the curse.`,
            },
            {
              heading: 'The antler and the end',
              body: `Snorri says that, without his sword, Freyr once killed the giant Beli with a stag’s antler. At Ragnarök, Freyr meets Surtr, the fire giant, and falls, because he has no sword. Völuspá describes it simply: “Beli’s fair slayer” goes to meet Surtr.

Heathens often read this as Freyr’s nobility. The god of peace gave up his weapon, for love, and fought anyway when the end came. Peace has a price, and he paid it. For a devotee, that is an invitation to think about what you would lay down for something you love, and what you would still stand up for without it.`,
            },
          ],
          knowAndDont: {
            known:
              'Skírnismál is in the Codex Regius of the Poetic Edda. Snorri retells it in Gylfaginning and adds the antler and Beli. Völuspá refers to Freyr’s death at Surtr’s hands.',
            unknown:
              'The sacred-marriage reading is a modern scholarly theory, influential but unproven. The grove Barri’s meaning is uncertain (perhaps “barley” or “leafy”). We do not know whether Skírnismál was ever performed in a rite, as some have suggested.',
          },
          inPractice:
            'Some Heathens keep a nine-night vigil before a wedding or a planting, echoing Gerðr’s nine nights, and some lay down a knife or other blade at Freyr’s shrine as a sign of frith.',
          reflect: [
            'What have you given up for love? Was it worth it?',
            'How do you hold a sacred story that contains something you find wrong?',
          ],
          further: [
            'Skírnismál in Bellows (1923).',
            'Gylfaginning ch. 37 in Anderson (1880).',
            'Carolyne Larrington, trans., The Poetic Edda (Oxford World’s Classics, rev. 2014), introduction to Skírnismál.',
          ],
          library: ['traditional/deity/freyr', 'traditional/deity/odin', 'traditional/herb/oak'],
        },
        {
          id: 'freyr-worship',
          title: 'Uppsala, Sacred Fields and Freyr’s Priests',
          summary: 'One of the richest bodies of evidence for any Norse god: temples, statues, sagas and the royal cult of the Swedes.',
          minutes: 7,
          sections: [
            {
              heading: 'At Uppsala',
              body: `Adam of Bremen, writing around 1075, describes the temple at Uppsala in Sweden with three images: Thor in the centre, Wodan beside him, and Fricco, a god who, Adam says, gives mortals peace and pleasure, and whose image had an immense phallus. Fricco is almost certainly Freyr. Sacrifices were made to him at weddings.

A small bronze figure found at Rällinge in Södermanland, from around 1000, shows a seated, bearded man with a large erect phallus, holding his beard; it is usually identified as Freyr. Gold-foil figures (guldgubber) from many Scandinavian halls, from around 550–800, show a man and a woman embracing; some scholars connect them with Freyr and Gerðr and with royal marriage to the land.`,
            },
            {
              heading: 'The Ynglings’ god',
              body: `Snorri’s Ynglinga saga makes Freyr an early king of the Swedes at Uppsala. In his reign there were such good seasons and such peace (the “Peace of Fróði”) that the Swedes believed he caused them. When he died, his priests secretly laid him in a great mound and kept paying the tribute in through a window, gold, silver and copper, for three years, and the good seasons continued. When the Swedes found out, they decided he must still be alive in some sense, and worshipped him as the god of the world ever after. Snorri is rationalising, but he is preserving a tradition of Freyr as divine ancestor of kings, buried in the land and keeping it fertile.

In the Saga of Hákon the Good, after Odin’s cup at the feast at Hlaðir came the cups of Njörðr and Freyr, “til árs ok friðar,” for a good year and peace. (Samuel Laing’s 1844 translation renders the second name as “Freyja,” but the Old Norse says Freyr.) That phrase, for a good year and peace, is still the most common Heathen toast to him.`,
            },
            {
              heading: 'Fields, horses and priests',
              body: `Icelandic sagas tell of individual worshippers. Hrafnkels saga’s hero, Hrafnkell Freysgoði, “Freyr’s priest,” built Freyr a temple and dedicated to him his best stallion, Freyfaxi, swearing to kill anyone who rode it without leave. Víga-Glúms saga tells of a field called Vitazgjafi, “the certain giver,” that never failed, belonging to Freyr; bloodshed on it angered the god, and an enemy sacrificed an ox to Freyr asking him to drive Glúmr out. Gísla saga tells of a Freyr-worshipper whose mound stayed green and unfrozen all winter, because Freyr would not let frost come between them.

A comic and hostile tale, Gunnars þáttr helmings, says the Swedes carried an image of Freyr around the countryside in a wagon each winter, with a young priestess called his wife, to bless the year. A Norwegian fugitive takes the god’s place and fathers a child; the Swedes are delighted. It is a mocking Christian story, but it sounds like the wagon processions Tacitus described for the goddess Nerthus a thousand years earlier, a goddess whose name matches Njörðr, Freyr’s father.`,
            },
          ],
          knowAndDont: {
            known:
              'Adam of Bremen’s Fricco, the Rällinge figure, the guldgubber, Ynglinga saga, Hákonar saga góða, Hrafnkels saga, Víga-Glúms saga, Gísla saga and Gunnars þáttr helmings all exist and are discussed in the scholarship. The phrase “til árs ok friðar” is in the Old Norse of Hákonar saga and in law texts.',
            unknown:
              'Adam never visited Uppsala. The sagas were written in the 1200s and 1300s and use pagan details for storytelling, sometimes mockingly. The Rällinge figure and the guldgubber are identified as Freyr by interpretation, not by inscription. How Freyr’s cult related to Nerthus’s is speculative.',
          },
          inPractice:
            'Heathens today raise Freyr’s cup “til árs ok friðar,” for a good year and peace, at nearly every seasonal blót. Some keep a small patch of garden or a pot of herbs dedicated to him, not picked from except for offerings.',
          reflect: [
            'Freyr’s field would not tolerate bloodshed. Where in your life could you keep a space entirely free of conflict?',
            'What would a good year and peace look like for your household? For your street?',
          ],
          further: [
            'Ynglinga saga ch. 10–12 and Hákonar saga góða ch. 16, in Laing’s Heimskringla (1844), public domain.',
            'Hrafnkel’s Saga and Other Icelandic Stories, trans. Hermann Pálsson (Penguin, 1971).',
            'Frands Herschend and others on guldgubber; Neil Price, Children of Ash and Elm (2020).',
          ],
          library: ['traditional/deity/freyr', 'traditional/deity/thor', 'traditional/deity/odin'],
        },
      ],
      practices: [
        {
          id: 'freyr-grow',
          title: 'Grow something',
          instructions:
            'Plant a few seeds, cress, barley, basil, in a pot on the windowsill. Water it each day, and greet Freyr when you do. Watch it come up over the twelve days.',
          times: 12,
          every: 'day',
          prompt: 'How is the seed doing? What did you notice about waiting?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine Nights of Frith',
      intro:
        'Gerðr asked Freyr to wait nine nights. In this stage you learn Freyr’s place at Yule and in modern Heathenry, his tides and offerings, and keep nine nights of offering and peace-making.',
      days: 9,
      lessons: [
        {
          id: 'freyr-yule',
          title: 'Yngvi, the Yule Boar and the Living Tradition',
          summary: 'Freyr at midwinter, the sacred boar and oath-swearing, the álfar at Winter Nights, and how Heathens honour him today.',
          minutes: 7,
          sections: [
            {
              heading: 'The boar on which vows were sworn',
              body: `The boar belongs to Freyr: Gullinbursti, the boar crests on Anglo-Saxon and Swedish helmets, and the name Sýr, “sow,” of his sister. At Yule, the sources say, a sacred boar was brought into the hall, and men swore vows on it. The prose of the Eddic poem Helgakviða Hjörvarðssonar says that one Yule-eve “the great vows were taken; the sacred boar was brought in, the men laid their hands thereon, and took their vows at the king’s toast” (Bellows’ 1923 translation). Hervarar saga describes a “sónargöltr,” an atonement boar, offered to Freyr at Yule for a good year, on which the king’s men swore.

Bellows’ own note calls it “a boar consecrated to Freyr, an integral part of the Yule rites.” That is a scholar’s interpretation, though a well-grounded one. The story in Helgakviða is also a warning: the hero Heðinn vows at the boar to take his brother’s beloved, and is struck with grief at what he has said.`,
            },
            {
              heading: 'Yule and Freyr now',
              body: `Many modern Heathens give Freyr a central place at Yule, alongside Odin as Jólnir. The Yule ham of Scandinavia (julskinka), the boar’s head brought in at Queen’s College, Oxford, every Christmas since at least the 1600s, and boar-shaped Yule breads are often said to descend from Freyr’s boar. That is possible and not proven; pork was also simply the meat of midwinter, when pigs were slaughtered.

A modern Yule blót for Freyr often includes a boar (a joint of pork, a boar-shaped loaf or a carved figure) on which people lay their hands to make their vows for the coming year. Toasts go “til árs ok friðar,” for a good year and peace. Vegetarian and vegan Heathens use a bread boar or a figure.`,
            },
            {
              heading: 'The álfar and Winter Nights',
              body: `Freyr is lord of Álfheimr. Kormáks saga describes an álfablót, an offering to the elves, in which a bull was killed and its blood poured on a hill where the álfar lived, and its meat made into a feast for them, to heal a wound. The skald Sigvatr, travelling in Sweden around 1020, was turned away from farms because an álfablót was being held at Winter Nights and strangers were not welcome.

Modern Heathens often keep an álfablót at Winter Nights, honouring the elves, the ancestral dead and Freyr together, usually privately at home, with ale, bread and butter left out. It is a quiet, family rite; the old one was closed to outsiders, and the modern one usually is too.`,
            },
            {
              heading: 'Freyr in modern Heathenry',
              body: `Freyr is honoured today across inclusive Heathenry, in Iceland’s Ásatrúarfélagið and in The Troth and countless kindreds, as god of harvest and plenty, of frith (the peace and goodwill that holds a community together), of sexuality and fertility, and of good leadership. Gardeners, brewers, bakers, farmers and people working for their communities often feel close to him. Some Heathens associate him with the giving of food: a donation to a food bank or a meal for a neighbour is a common modern offering.

Folkish groups have sometimes used Ingwaz, Freyr’s rune, alongside other symbols. It is mainly an ordinary rune of the futhark and is used innocently by most rune-workers; know its context. This app stands with the inclusive tradition: the god of peace and plenty is for everyone.`,
            },
          ],
          knowAndDont: {
            known:
              'The vow-boar appears in the Helgakviða Hjörvarðssonar prose and in Hervarar saga; the álfablót in Kormáks saga and Sigvatr’s Austrfararvísur. The Queen’s College boar’s head custom is documented from the 1600s.',
            unknown:
              'That the Yule boar was specifically Freyr’s is scholarly inference, though strong. Links between modern Christmas pork and Freyr are possible but unproven. Modern álfablót practice is reconstructed from a few saga passages.',
          },
          inPractice:
            'A common Yule custom: on one of the twelve nights, a boar (a pork roast, a bread boar or a small figure) is set on the table, everyone lays a hand on it and makes one modest vow for the year, and Freyr’s cup is raised for a good year and peace.',
          reflect: [
            'If you laid your hand on Freyr’s boar this Yule, what one vow would you make, knowing it should be kept?',
            'Who or what are the “elves” of your land: the dead, the spirits of the place, the old families? How could you honour them?',
          ],
          further: [
            'Helgakviða Hjörvarðssonar in Bellows (1923), with his notes.',
            'Terry Gunnell, “The Season of the Dísir: The Winter Nights, and the Dísablót in Early Medieval Scandinavian Belief” (2000).',
          ],
          library: ['traditional/deity/freyr', 'traditional/herb/mistletoe', 'traditional/crystal/amber'],
          premade: ['folk-simple-blot', 'hedge-house-spirit-offering', 'folk-jol-rune-casting'],
        },
        {
          id: 'freyr-days',
          title: 'Harvest, Yule and the Manner of Offering',
          summary: 'Freyr’s tides through the year, the offerings that suit him, how to give them and what to avoid.',
          minutes: 6,
          sections: [
            {
              heading: 'His tides',
              body: `Freyr has no weekday in the sources; no day of the week is named for him. Some Heathens honour him on Fridays with his sister, others on any day they cook or garden. His real calendar is the year itself.

At Yule (Jól), he is honoured with the boar and the vow. At Sigrblót, the first day of summer in April, many ask for good growth as the sowing begins. Midsummer, the height of the sun he rules, suits him. Haustblót at the autumn equinox is his harvest-home, when the first fruits and the last sheaf are offered. At Winter Nights in late October, the old blót “for a good year” and the álfablót both belong to him.`,
            },
            {
              heading: 'What to offer',
              body: `Ale and beer are especially fitting, brewed from barley, his servant Byggvir’s grain. Mead is welcome. Bread, porridge, butter, grain and the first fruits of anything you grow or buy fresh in season are traditional. At Yule, pork is the classic offering; a bread boar works for anyone who does not eat meat.

Some offerings are acts: a garden tended, a plant grown and given away, a meal cooked for others, a donation to a food bank, a quarrel made up. Freyr is god of frith; making peace is an offering.

The Hávamál’s rule applies: “gifts with gifts requite” (Bellows, stanza 42). Freyr is generous, and the relationship is mutual. Give regularly, within your means.`,
            },
            {
              heading: 'How to offer',
              body: `Stand at the shrine, lift the cup, name him and what you give. Share a sip and a bite. Leave his portion, then take it out and give it to the earth: pour the ale onto soil, bury or scatter grain and bread in a garden or on a verge. Returning food to the land is especially fitting for him. Do not eat what has been offered.

The old toast is the best words: “Til árs ok friðar,” for a good year and peace. Pronounce it roughly “til OWRS ok FRITH-ar.”`,
            },
            {
              heading: 'What not to do',
              body: `Keep his shrine free of weapons and quarrels, after Freyr’s field that would not bear bloodshed and the hall at the start of the rite. Don’t argue in front of it. If you keep blades in the kitchen, don’t store them on his shelf.

Don’t swear rashly on his boar at Yule; remember Heðinn. Don’t give him spoiled or leftover food; he gets the first, not the last. Don’t treat him as a sex god only; he is just as much a god of bread, peace and good government. And don’t sacrifice animals; the old cult did, but modern Heathenry gives food and drink.`,
            },
          ],
          knowAndDont: {
            known:
              '“Til árs ok friðar” is attested in Old Norse sources. The seasonal blóts and the Yule boar are attested; ale and grain were the staple offerings of farm religion.',
            unknown:
              'There is no record of a specific weekday for Freyr. Modern harvest customs for him are largely reconstructed, drawing on later Scandinavian folk customs of the last sheaf, whose pagan roots are debated.',
          },
          inPractice:
            'Many devotees save the first produce of the year, a strawberry, a handful of peas, the first loaf of new flour, for Freyr, and keep a horn of ale for him at every Haustblót and Yule.',
          reflect: [
            'What is your harvest this year, in the widest sense? What could you give back?',
            'Is there a quarrel you could make up as an offering to Freyr?',
          ],
          further: ['Hávamál in Bellows (1923).', 'The Troth, Our Troth, vol. 2, on the seasonal blóts.'],
          library: ['traditional/deity/freyr', 'traditional/candle/green', 'traditional/crystal/green_aventurine'],
          premade: ['kitchen-prosperity-bread', 'folk-simple-blot'],
        },
      ],
      practices: [
        {
          id: 'freyr-nine-nights',
          title: 'Nine nights of frith',
          instructions: `For nine nights, at the shrine, light the candle. Offer a little ale or juice and a pinch of grain into the bowl. Say his name and “til árs ok friðar.” Then tell him one thing you did that day to make or keep peace, or to share plenty: a kind word, a meal shared, a bill paid for someone, a disagreement let go.

Sit for five minutes. Snuff the candle. Give the grain and drink to the earth before bed or in the morning.

On the ninth night, bake or buy a loaf and share it with someone, giving him the first slice.`,
          times: 9,
          every: 'day',
          prompt: 'What peace did you make or keep today, and what plenty did you share?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Waiting in the Grove',
      intro:
        'Freyr waited nine nights for Gerðr. Take a few days to look back over your journal. Pausing, stopping, honouring Freyr without a vow, or turning toward another god are all good outcomes.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'freyr-reread',
          title: 'Read your record',
          instructions: 'Read everything you have written since the first rite, and look at the seeds you planted.',
          times: 1,
          prompt: 'What has grown this month, on the windowsill and in you?',
        },
      ],
      questions: [
        'Did the offerings feel like a meeting with Freyr, or like gardening with extra steps? Both are honest.',
        'Are you drawn to the whole god, peace, plenty, rule, love and the land, or only to one side?',
        'How do you feel about Skírnismál, now that you have read it closely?',
        'What offering and act of frith can you keep for a year?',
        'Would it be better to honour Freyr at Yule and harvest with the community, without a personal vow, for now?',
        'If you stop here, what will you keep from this month?',
      ],
    },
    {
      kind: 'dedication',
      title: 'Hand on the Boar',
      intro: `If you have chosen to go on, this is the dedication: a blót, a vow written in advance and sworn with your hand on a boar, and a token to keep. It is a self-dedication between you and Freyr. It is not an initiation into any group, and it does not replace a group’s own rites. Remember Heðinn: make the vow modest and true.`,
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'freyr-write-vow',
          title: 'Write the vow',
          instructions:
            'A day before, write your vow: the offering you will keep (for example, the first bite at Sunday dinner, or ale at each holy tide), the frith you will keep (for example, a monthly act of sharing or peace-making), how long (a year and a day is common), and what you ask (a good year and peace, growth, plenty to share).',
          times: 1,
          prompt: 'Write the final vow here.',
        },
      ],
      rite: {
        title: 'Dedication to Freyr',
        summary:
          'A blót of ale and bread in which you hallow the space in frith, hail Freyr, swear your vow with a hand on a boar, and offer the first of everything.',
        minutes: 40,
        ingredients: [
          { name: 'A horn or cup of ale (or non-alcoholic beer or apple juice)' },
          { name: 'A loaf of bread, ideally baked yourself' },
          { name: 'A boar: a small figure, a boar-shaped loaf, or a piece of pork' },
          { name: 'A bowl of barley, oats or wheat' },
          { name: 'A candle in a safe holder', ref: 'traditional/candle/gold' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A token: an ear of grain, an amber bead, a small boar charm', ref: 'traditional/crystal/amber', optional: true },
          { name: 'Your written vow' },
        ],
        preparation:
          'Clean the shrine and room. Remove any blades from the shrine area. Set out the boar, the bread, the grain and the cup. Lay your token on the shrine. Yule, Haustblót, Winter Nights or the day after your ninth night are good times.',
        steps: [
          {
            title: 'Hallow in frith',
            instructions: 'Light the candle. Walk sunwise around the room and name it holy.',
            spoken: 'I hallow this place in frith. Let no weapon, no quarrel and no ill will stand here. Let it be as Freyr’s field.',
            light: true,
          },
          {
            title: 'Hail him',
            instructions: 'Raise the cup and call him by his names.',
            spoken:
              'Freyr, Lord, Yngvi, Ingunar-Freyr. Son of Njörðr, brother of Freyja, husband of Gerðr. Lord of Álfheimr, rider of Gullinbursti, master of Skíðblaðnir. You who rule the rain and the sunshine and the fruits of the earth, who gave your sword for love: hear me.',
          },
          {
            title: 'Share and give the first',
            instructions:
              'Break the bread. Put the first and best piece into the offering bowl with a pinch of grain. Then eat a piece and drink a sip.',
            spoken: 'The first is yours. I share the rest with you. Til árs ok friðar, for a good year and peace! Hail Freyr!',
          },
          {
            title: 'Swear on the boar',
            instructions:
              'Lay your right hand on the boar. Read your vow aloud, once, clearly. Then take a sip from the cup to seal it.',
            spoken: 'With my hand on the boar, before Freyr, I make this vow. Let it hold as long as I keep it.',
          },
          {
            title: 'Hallow the token',
            instructions:
              'Hold the token over the bowl of grain, then pass it over the candle at a safe height. Keep it on you or on the shrine.',
            spoken: 'Let this be a sign of my troth to Freyr. When I see it, let me remember the first fruits and the frith.',
          },
          {
            title: 'Pour his share',
            instructions: 'Pour the rest of the cup into the offering bowl.',
            spoken: 'Gift for gift. This is yours, given gladly. Give me in return good seasons and peace, and plenty to share.',
          },
          {
            title: 'Close',
            instructions:
              'Thank him. Sit a few minutes. Snuff the candle. Take the bowl outside and give it to the earth in a garden bed or at a tree. Share the rest of the bread with someone.',
            spoken: 'Hail Freyr, and thanks. The vow is made.',
            snuff: true,
          },
        ],
        closing:
          'Write the date and your vow in your journal, and keep the paper copy for your rededication. If you used pork, cook and share it; feasting together is part of the old Yule.',
        safety:
          'Keep the candle away from the bread, grain and cloth, and never leave it burning. If you use raw pork, keep it refrigerated until the rite and cook it thoroughly afterwards; do not leave raw meat out. Keep cooked bones, onion and garlic away from pets. Pour offerings outside or down a drain, not into houseplants.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Good Year and Peace',
      intro: `Keep the offering and the frith you vowed. Hail Freyr with the boar and the vow at Yule, ask for growth at Sigrblót, honour the sun at Midsummer, give him the first fruits at Haustblót, and keep the álfablót at Winter Nights. Each year, read your vow, say how you kept it, and renew it.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'freyr-weekly',
          title: 'The weekly first bite',
          instructions:
            'Once a week, at a meal, set aside the first bite or sip for Freyr and say “til árs ok friðar.” Give it to the earth after.',
          times: 52,
          every: 'week',
          prompt: 'What peace or plenty did you share this week?',
        },
        {
          id: 'freyr-tides',
          title: 'Keep the holy tides',
          instructions:
            'At Yule, Sigrblót, Midsummer, Haustblót and Winter Nights, hold a blót with Freyr hailed. At Yule, lay hands on a boar and make one vow for the year.',
          times: 5,
          every: 'holy-day',
          prompt: 'What did you offer at this tide, and what did you vow?',
          premade: 'folk-simple-blot',
        },
        {
          id: 'freyr-rededicate',
          title: 'Yearly rededication',
          instructions:
            'At Yule or on the anniversary of your dedication, repeat the rite. Read last year’s vow first and say how you kept it. Make the new one fit your life.',
          times: 1,
          prompt: 'How did last year’s vow go, and what will this year’s be?',
        },
      ],
    },
  ],
  sources: [
    'Henry Adams Bellows, trans., The Poetic Edda (1923), public domain: Lokasenna 37, Grímnismál 5, Skírnismál 43, Hávamál 42, and the prose and note to Helgakviða Hjörvarðssonar quoted from Project Gutenberg ebook #73533 (https://www.gutenberg.org/ebooks/73533).',
    'Rasmus B. Anderson, trans., The Younger Edda (1880), public domain: Gylfaginning ch. 24 (“He rules over rain and sunshine…”) quoted from Project Gutenberg ebook #18947 (https://www.gutenberg.org/ebooks/18947).',
    'Samuel Laing, trans., Heimskringla (1844), Project Gutenberg #598: Hákonar saga góða ch. 16 (checked; Laing renders the second cup as Freyja’s where the Old Norse has Freyr) and Ynglinga saga (paraphrased).',
    'Adam of Bremen, Gesta IV.26–27; Hrafnkels saga; Víga-Glúms saga; Gísla saga; Gunnars þáttr helmings; Hervarar saga; Kormáks saga; Sigvatr Þórðarson, Austrfararvísur; Tacitus, Germania 2 and 40 (all paraphrased).',
    'Archaeology: the Rällinge statuette; guldgubber gold-foil figures. Scholarship: Magnus Olsen (1909) on Skírnismál; Terry Gunnell (2000); Neil Price (2020); Rudolf Simek (1993).',
  ],
};
