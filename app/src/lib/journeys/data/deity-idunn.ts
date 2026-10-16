import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-idunn',
  kind: 'deity',
  paths: ['norse'],
  deityRef: 'traditional/deity/idunn',
  title: 'Idunn, Keeper of the Apples',
  summary:
    'A lunar month with Iðunn, who keeps the fruit the gods eat to stay young: her one great story, the very slim sources behind her, what her “apples” may really have been, and a gentle practice of renewal, care for the body and tending growing things.',
  welcome: `This journey spends about a month with Iðunn. You will read everything the old sources say about her, which takes less time than you might think, look closely at her famous apples, learn how Heathens honour her now, set up a fresh green shrine, keep nine days of renewal, and decide at the end whether to dedicate yourself to her.

It is a self-dedication, not an initiation, and it does not replace the rites of any Heathen group. Iðunn is known only from poetry: there is no evidence that she was ever worshipped, and every devotional practice here is modern. That does not make it less sincere. It means we start with the stories and build honestly. Prayers for vitality support, but never replace, proper medical care.`,
  about: `Iðunn (also Idun or Idunn) is the wife of Bragi, god of poetry, and the keeper of the fruit, usually called apples, that the gods eat when they grow old to become young again. Her name probably means something like “the renewing one” or “ever-young.” Almost everything we know of her comes from one story, told in the skaldic poem Haustlöng by Þjóðólfr of Hvinir around 900 and retold by Snorri in the 1220s: the giant Þjazi forced Loki to lure her out of Asgard, carried her off in eagle form, and the gods grew grey and old until Loki, in Freyja’s falcon shape, brought her back as a nut, and Þjazi was killed. Beyond that she appears in Lokasenna, defending her husband and calming a quarrel, and in Snorri’s lists of goddesses. No temple, place name, festival or offering for her is known. The Old Norse word epli could mean any round fruit, so her apples may not have been apples as we know them. Today Heathens honour her with apples, cider, seeds and spring flowers, at the sowing in spring and the harvest in autumn, and ask her for health, vitality, renewal and strength restored after hardship.`,
  notes: [
    'No evidence survives for any ancient worship of Iðunn. She is known only from poetry and Snorri. All devotional practice to her is modern; this journey says so throughout.',
    'Prayers and offerings for health and vitality support, but never replace, medical care. If you are ill, see a doctor.',
    'Apple seeds contain amygdalin, which releases cyanide when crushed or chewed. A few swallowed by accident are harmless to people, but do not eat or grind them on purpose, and keep apple cores and seeds away from dogs, cats, horses and other pets.',
    'Modern “golden apple” imagery of Iðunn owes a good deal to Victorian art and to Greek myths of the Hesperides. It is lovely, and it is not in the Norse sources, which never call her apples golden.',
    'This app is inclusive. Renewal and care for the body belong to everyone, of any ancestry, gender, age, shape or ability. Folkish groups that make the gods a matter of race are not the tradition taught here. Iðunn’s renewal is not about staying young or looking a certain way, but about vitality at every age.',
  ],
  holyDays: ['sigrblot', 'haustblot', 'midsummer', 'jol'],
  stages: [
    {
      kind: 'threshold',
      title: 'The Ash-Wood Box',
      intro:
        'Snorri says Iðunn keeps her fruit in a box, an eski, made of ash wood. These first days are about making a fresh, green place for her, and sharing an apple.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'idunn-shrine',
          title: 'Set up a green shrine',
          instructions: `Choose a place with fresh air and some daylight: a kitchen windowsill, a shelf near plants, a corner where you keep fruit. Lay down a green, pale gold or rose-pink cloth, or a piece of plain linen. Add a small dish or basket for fruit, a cup for juice or cider, and one candle in a holder.

For images: a small wooden box (any small box will do; ash wood if you can find it), a bowl of fresh apples, apple blossom in spring, a pot of something growing, green aventurine or rose quartz. A falcon or a nut, from her rescue, are good signs of her story.

Keep the fruit fresh. Replace it before it softens. A shrine to the goddess of renewal should never smell of rot.`,
          times: 1,
          prompt: 'What on your shrine is fresh, or alive, or growing?',
        },
        {
          id: 'idunn-half-apple',
          title: 'Half an apple',
          instructions:
            'For three days, cut an apple in half. Eat one half slowly and mindfully, noticing taste and texture. Leave the other half on the shrine for Iðunn and give it to the earth the next morning.',
          times: 3,
          every: 'day',
          prompt: 'What did you notice when you ate slowly? How does your body feel today?',
        },
      ],
      rite: {
        title: 'Greeting the Keeper',
        summary:
          'A short first greeting: hallow the space, offer an apple and cider, tell Iðunn why you have come, and share the fruit.',
        minutes: 20,
        ingredients: [
          { name: 'A fresh apple' },
          { name: 'A cup of apple juice or cider' },
          { name: 'A small knife and a plate' },
          { name: 'A green or gold candle in a safe holder', ref: 'traditional/candle/green' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A few fresh flowers or a sprig of green', optional: true },
        ],
        preparation:
          'Wash your hands and the apple. Tidy the shrine. Open a window for fresh air. Morning is a good time, or any time you feel tired and want to begin again.',
        steps: [
          {
            title: 'Hallow the space',
            instructions: 'Light the candle. Walk once sunwise around the room and name it holy.',
            spoken: 'I hallow this place. Let it be fresh and green, a place of renewal.',
            light: true,
          },
          {
            title: 'Greet her',
            instructions: 'Hold the apple in both hands before the shrine.',
            spoken:
              'Iðunn, wife of Bragi, keeper of the fruit in the ash-wood box. You whose gift keeps the gods young until the end of the world, who was carried off and brought home again. I bring you an apple and sweet drink. Hear me.',
          },
          {
            title: 'Say why you have come',
            instructions:
              'Tell her plainly why you are here: tiredness, recovery after illness or hardship, a love of growing things, a wish to care for your body better. Speak for a few minutes.',
            minutes: 4,
          },
          {
            title: 'Share the fruit',
            instructions:
              'Cut the apple across its middle, so the seeds show a five-pointed star. Put one half in the offering bowl. Eat a bite of the other and take a sip of the drink.',
            spoken: 'I share with you. Gift for gift. Hail Iðunn!',
          },
          {
            title: 'Sit and breathe',
            instructions: 'Sit with the fresh air and the candle. Breathe slowly. Notice where your body feels tired, and where it feels well.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Thank her. Snuff the candle. Later, give her half of the apple and the rest of the drink to the earth outside, under a tree if you can, ideally an apple tree.',
            spoken: 'Thank you, Iðunn. I will come back.',
            snuff: true,
          },
        ],
        closing: 'Write down what you said, and one small thing you will do for your body this week.',
        safety:
          'Never leave a candle burning unattended, and keep it away from flowers, cloth and curtains. Take care with the knife. Keep apple cores and seeds away from pets. Pour drink outside or down a drain, not into houseplants.',
      },
    },
    {
      kind: 'study',
      title: 'Carried Off and Brought Home',
      intro:
        'Twelve days of reading: everything the sources say about Iðunn, her one great story, and what her “apples” may really have been. It is not much, and that is part of the lesson.',
      days: 12,
      lessons: [
        {
          id: 'idunn-who',
          title: 'Bragi’s Wife and the Fruit of Youth',
          summary: 'Every mention of Iðunn in the old sources, what her name means, and why her evidence is so slim.',
          minutes: 6,
          sections: [
            {
              heading: 'Snorri’s few lines',
              body: `Snorri Sturluson introduces Iðunn in Gylfaginning, in the entry on her husband Bragi, the god of poetry. In Rasmus Anderson’s 1880 translation: “His wife is Idun. She keeps in a box those apples of which the gods eat when they grow old, and then they become young again, and so it will be until Ragnarok.” The questioner says it must be of great importance to the gods that she keeps them “with care and honesty,” and the god answering laughs: they ran a great risk once, he says, and he might tell of it.

That is nearly all. Elsewhere Snorri lists Iðunn among the goddesses and gives poets kennings for her: “wife of Bragi,” “keeper of the apples,” and for the apples “the medicine to bar old age” (Anderson’s wording for the Old Norse ellilyf).`,
            },
            {
              heading: 'In Lokasenna',
              body: `Iðunn is named in only one Eddic poem, Lokasenna. When Loki insults her husband Bragi as a coward, she steps in: “Well, prithee, Bragi, his kinship weigh, / Since chosen as wish-son he was; / And speak not to Loki such words of spite / Here within Ægir’s hall.” Loki turns on her with a sneer about her taking her brother’s killer to bed, and she answers: “To Loki I speak not with spiteful words / Here within Ægir’s hall; / And Bragi I calm, who is hot with beer, / For I wish not that fierce they should fight.” (Henry Adams Bellows’ 1923 translation, stanzas 16–18.)

It is a small scene, but it shows a character: a peacemaker who will not trade insults, who calms her husband, and who reminds everyone of the bonds between them. We know nothing about the brother or his killer; that story is lost.`,
            },
            {
              heading: 'Her name',
              body: `Her name is usually explained as built on ið-, “again, renewed” (as in iðgrœnn, “evergreen, green again”), with a feminine ending: the renewing one, the ever-young, she who rejuvenates. That fits her role perfectly, which may be a sign that her role came from her name, or her name from her role. Either way, this meaning is widely accepted, though, as with most old names, not certain.`,
            },
            {
              heading: 'How slim the sources are',
              body: `Put it all together and Iðunn appears in one skaldic poem (Haustlöng), one Eddic poem (Lokasenna), and Snorri. There are no place names, inscriptions, images or saga accounts of worship. Some have connected her with the Germanic idisi or with the Irish and Greek apples of immortality, but these are comparisons, not evidence.

This matters for your practice. Everything you do for Iðunn is built on a story and a character, not on an ancient cult. That is honest and it is enough. It also means you should be wary of any book that tells you confidently what the Norse “always” offered her.`,
            },
          ],
          knowAndDont: {
            known:
              'Gylfaginning ch. 26 introduces Iðunn and her apples; Skáldskaparmál tells her abduction and lists her kennings; Lokasenna 16–18 gives her words; Haustlöng (c. 900) is the earliest source for her story.',
            unknown:
              'Whether she was ever worshipped is unknown, and there is no evidence that she was. The story of her brother and his killer is lost. Her connection to other apple-goddesses in Europe is speculation.',
          },
          inPractice:
            'Many devotees honour Iðunn together with Bragi, with a toast to the poet and an apple for the keeper, and some recite or write a short poem as their offering to both.',
          reflect: [
            'Iðunn keeps the fruit “with care and honesty.” What do you keep in that way?',
            'In Lokasenna she calms a quarrel instead of joining it. When have you done that, or wished you had?',
          ],
          further: [
            'Gylfaginning ch. 26 and Skáldskaparmál in Rasmus B. Anderson, The Younger Edda (1880), public domain.',
            'Lokasenna in Henry Adams Bellows, The Poetic Edda (1923), public domain.',
            'John Lindow, Norse Mythology (2001), “Iðunn” and “Haustlöng.”',
          ],
          library: ['traditional/deity/idunn', 'traditional/deity/loki', 'traditional/crystal/green_aventurine'],
        },
        {
          id: 'idunn-story',
          title: 'Þjazi, the Nut and the Falcon',
          summary: 'Iðunn’s great story told in full, from the ox that would not cook to the fire on Asgard’s walls, and what it says about renewal and its loss.',
          minutes: 7,
          sections: [
            {
              heading: 'The ox that would not cook',
              body: `Odin, Loki and Hœnir were travelling when they came down into a valley, killed an ox and tried to cook it in an earth oven. It would not cook. An eagle in a tree above them said it was his doing, and that the meat would cook if he could have his share. They agreed, and the eagle swooped down and took the best parts. Loki, furious, struck at it with a pole. The pole stuck to the eagle and Loki stuck to the pole, and the eagle dragged him over stones and trees until he thought his arms would be torn off.

The eagle was the giant Þjazi. He would let Loki go only if Loki swore to bring Iðunn and her apples out of Asgard. Loki swore.`,
            },
            {
              heading: 'The gods grow old',
              body: `At the agreed time, Snorri says in Anderson’s translation, “Loke coaxed Idun out of Asgard into a forest, saying that he had found apples that she would think very nice, and he requested her to take with her her own apples in order to compare them. Then came the giant Thjasse in the guise of an eagle, seized Idun and flew away with her to his home in Thrymheim. The asas were ill at ease on account of the disappearance of Idun,—they became gray-haired and old.”

This is the heart of the story. Without Iðunn, the gods, who are not immortal by nature, simply age. Renewal is not automatic, even for gods. It has to be kept, and it can be stolen.`,
            },
            {
              heading: 'The rescue',
              body: `The gods held a council, found that Iðunn was last seen leaving with Loki, and threatened him with death. He promised to bring her back if Freyja would lend him her falcon shape. He flew to Þrymheimr while Þjazi was out at sea, turned Iðunn into a nut, and flew home with her in his claws. Þjazi came after them as an eagle. The gods, watching from the walls, piled up wood shavings, and as the falcon dropped inside, they set them alight. The eagle could not stop, his feathers caught fire, and the gods killed him within the gates.

Þjazi’s daughter Skaði came to Asgard armed for vengeance soon after, and was given a settlement. The Iðunn story and the Skaði story are one story.`,
            },
            {
              heading: 'The oldest telling',
              body: `Snorri’s version is based on Haustlöng, “Autumn-long,” a poem by the Norwegian skald Þjóðólfr of Hvinir, composed around 900. It describes scenes painted on a shield, and it is the oldest source we have for Iðunn. In it she is called, in a kenning, the maiden who knew the gods’ cure for old age, and the gods grow grey and old in her absence, though the apples themselves are not clearly named. The poem was made while the old religion was still alive, so we know her story is genuinely pre-Christian, even if we know nothing of her worship.`,
            },
            {
              heading: 'What it means',
              body: `Some scholars read the story as a seasonal myth: the goddess of youth carried off to the mountains in autumn (Haustlöng is, after all, “autumn-long”), the world grows old, and she is brought back in spring. Others read it more simply as a story about what the gods depend on and how easily it can be lost through carelessness and a bad bargain.

For a devotee, it is a story about the things that keep us young in the widest sense, rest, food, love, growing things, and how they can be stolen by exhaustion, illness, grief or our own bad bargains, and then, with effort, brought home.`,
            },
          ],
          knowAndDont: {
            known:
              'Snorri tells the story in Skáldskaparmál, explicitly drawing on Þjóðólfr’s Haustlöng, which he quotes. Hárbarðsljóð 19 and Lokasenna refer to Þjazi’s death. The link to Skaði’s arrival is in Snorri.',
            unknown:
              'The seasonal reading is a modern theory. Haustlöng is hard to translate and the exact role of the apples in it is uncertain. Whether the story had any ritual use is unknown.',
          },
          inPractice:
            'Some devotees keep a hazelnut or other nut on Iðunn’s shrine to remember her rescue, and give thanks to her when they recover from an illness or a hard season, as the gods did when she came home.',
          reflect: [
            'What keeps you young, in the widest sense? What has stolen it from you in the past?',
            'What bad bargain have you made, as Loki did, that cost you or others something precious? How was it put right?',
          ],
          further: [
            'Skáldskaparmál ch. 1–2 (Bragaræður) in Anderson (1880).',
            'Richard North, The Haustlöng of Þjóðólfr of Hvinir (1997), for the poem and commentary.',
          ],
          library: ['traditional/deity/idunn', 'traditional/deity/skadi', 'traditional/deity/freyja', 'traditional/deity/odin'],
        },
        {
          id: 'idunn-apples',
          title: 'Not Necessarily Apples',
          summary: 'What the Old Norse word epli meant, what fruit the Norse actually had, apples in graves and stories, and where the golden apples came from.',
          minutes: 7,
          sections: [
            {
              heading: 'The word epli',
              body: `Snorri calls Iðunn’s fruit epli, which translators render as “apples.” But in Old Norse, as in Old English æppel, the word was used broadly for round fruit, and sometimes for things that were not fruit at all: the apple of the eye, the apple of a sword. Medieval writers used compounds like “earth-apple” and “sea-apple” for other things. Iðunn’s epli could have been apples, or could have been understood as a magical fruit with no earthly equivalent.

Some modern writers suggest nuts, especially hazelnuts, which were a major wild food in the north and appear in the story when Iðunn herself is turned into a nut. That is a speculation, but an interesting one.`,
            },
            {
              heading: 'What fruit the Norse had',
              body: `Wild crab apples (Malus sylvestris) are native to Scandinavia and have been eaten there since the Stone Age. They are small, hard and sour, better cooked or dried than eaten raw. Cultivated sweet apples came north slowly, mostly with monasteries in the Middle Ages.

The Oseberg ship burial in Norway, from 834, contained a bucket full of wild apples, alongside other food for the two women buried there. Whatever the apples meant, they were thought worth sending with the dead.`,
            },
            {
              heading: 'Apples in other stories',
              body: `Apples turn up elsewhere in the Norse sources with a sense of life and fertility. In Skírnismál, Freyr’s servant offers the giantess Gerðr “Eleven apples, all of gold” to win her for Freyr (Bellows, stanza 19); Bellows’ note calls the apple “the symbol of fruitfulness, and also of eternal youth.” Some scholars have wondered whether these are Iðunn’s apples. In Völsunga saga, a childless king receives an apple sent by Frigg through a crow, and when his wife eats it she conceives the hero Völsungr.

These stories suggest that apples had a real meaning of life, fertility and renewal in Norse imagination. They do not prove anything about Iðunn herself.`,
            },
            {
              heading: 'Golden apples, late and lovely',
              body: `The image most people have of Iðunn, a fair-haired young woman with a basket of glowing golden apples, comes mainly from the nineteenth century: from romantic retellings, from painters like James Doyle Penrose, whose “Idun and the Apples” was painted in 1890, and from blending her with the golden apples of the Greek Hesperides. The Norse sources never call her apples golden.

There is also a late poem, Hrafnagaldr Óðins, in which Iðunn falls from the World Tree and lies grieving below it. It was once thought medieval but is now generally dated to the 1600s. It is a beautiful and strange poem; it is not ancient evidence.`,
            },
          ],
          knowAndDont: {
            known:
              'Snorri uses the word epli. Wild crab apples are native to Scandinavia; Oseberg contained wild apples. Skírnismál 19 and Völsunga saga contain the apple episodes described. Penrose’s painting is dated 1890. Hrafnagaldr Óðins is generally dated to the seventeenth century.',
            unknown:
              'What kind of fruit, if any, the original tellers of Iðunn’s story imagined is unknown. The link between Gerðr’s apples and Iðunn’s is speculation. The meaning of the Oseberg apples is unknown.',
          },
          inPractice:
            'Most modern devotees use apples anyway, because the tradition has made them hers, while some offer crab apples, hazelnuts or northern berries to stay closer to what the Norse actually ate.',
          reflect: [
            'Does it matter to you whether her fruit was “really” an apple? What is it about the fruit that matters?',
            'What in your life is a “fruit of youth,” something that renews you every time?',
          ],
          further: [
            'Skírnismál in Bellows (1923), with his note to stanza 19.',
            'H. R. Ellis Davidson, Gods and Myths of Northern Europe (1964), on apples and fertility.',
            'The Saga of the Volsungs, trans. Jesse Byock (1990).',
          ],
          library: ['traditional/deity/idunn', 'traditional/deity/freyr', 'traditional/deity/frigg', 'traditional/crystal/peridot'],
        },
      ],
      practices: [
        {
          id: 'idunn-grow',
          title: 'Tend something growing',
          instructions:
            'Plant a few apple seeds, or any seeds, in a pot, or adopt a houseplant for Iðunn. Water and tend it each day of this stage, and greet her when you do.',
          times: 12,
          every: 'day',
          prompt: 'How is your plant? What did you notice about tending something each day?',
          premade: 'green-seed-blessing-before-sowing',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine Days of Renewal',
      intro:
        'Without Iðunn the gods grew grey; with her they were young again. In this stage you learn how Iðunn is honoured today, her seasons and offerings, and keep nine days of small renewals.',
      days: 9,
      lessons: [
        {
          id: 'idunn-today',
          title: 'Renewal, Health and Care: Iðunn Today',
          summary: 'How modern Heathens honour Iðunn, what renewal means beyond youth, care for the body and for elders, and honest limits.',
          minutes: 6,
          sections: [
            {
              heading: 'A modern devotion, sincerely kept',
              body: `Iðunn has many modern devotees, though there is no ancient cult to reconstruct. People come to her when they are recovering from illness or burnout, when they are caring for an ageing parent, when they garden or keep orchards, or simply because she is one of the gentlest figures in Norse myth. Heathens in many communities honour her with apples, cider and spring flowers, often together with Bragi.

Everything they do is built on the story. That is a perfectly good foundation, as long as it is named honestly.`,
            },
            {
              heading: 'Renewal, not youth',
              body: `It is easy to read Iðunn as a goddess of looking young, and modern culture would love that. But in the story the gods do not want smooth skin. They want their strength back, their minds clear, their ability to do their work. Renewal is the point, not youth for its own sake.

Many devotees honour her by caring for their bodies kindly at every age: rest when tired, good food, movement that feels good, medical check-ups, recovering properly after illness. Others honour her by caring for elders: visiting an older neighbour, helping a parent, volunteering in a care home. Both are fitting offerings.`,
            },
            {
              heading: 'Gardens and orchards',
              body: `Iðunn is close to people who grow things. Some plant an apple tree for her, or adopt one in a community orchard. Some keep a pot of herbs or a window box. Composting, saving seeds and tending soil are all fitting acts of renewal.

English wassailing, singing to apple trees in midwinter to wake them for the year, is often borrowed for Iðunn. It is a lovely custom from the cider country of south-west England, recorded from the late 1500s on; it is not Norse, and it is good to say so if you use it.`,
            },
            {
              heading: 'Honest limits',
              body: `Prayers for vitality and offerings for health support medical care; they never replace it. If you are unwell, see a doctor. If you are struggling with exhaustion, depression or chronic illness, Iðunn’s story is not a promise that devotion will cure you. It is a reminder that renewal is worth fighting for, that it often needs help from others, and that when it comes back it is worth celebrating.`,
            },
          ],
          knowAndDont: {
            known:
              'Modern devotion to Iðunn is documented in Heathen writing and community practice. Wassailing is recorded in England from the sixteenth century.',
            unknown:
              'No ancient worship of Iðunn is known; all of these practices are modern. Associations of her with healing and with elders are modern readings of her role in the story.',
          },
          inPractice:
            'A common pattern: a fresh apple on the shrine each week; a spring rite at the sowing with seeds and blossom; a harvest rite with the first apples and cider; acts of care for the body and for elders dedicated to her.',
          reflect: [
            'What would renewal, not youth, look like for you right now?',
            'Is there an elder in your life who would welcome a visit or a call?',
          ],
          further: [
            'The Troth, Our Troth, vol. 1 (2006), on Iðunn and Bragi.',
            'Ronald Hutton, The Stations of the Sun (1996), on wassailing.',
          ],
          library: ['traditional/deity/idunn', 'traditional/crystal/rose_quartz', 'traditional/herb/elder', 'traditional/herb/calendula'],
          premade: ['kitchen-healing-broth', 'green-tree-befriending-offering'],
        },
        {
          id: 'idunn-days',
          title: 'Spring, Harvest, Offerings and What Not to Do',
          summary: 'Iðunn’s tides through the year, her offerings and how to give them, and the cautions that keep the practice sound.',
          minutes: 6,
          sections: [
            {
              heading: 'Her tides',
              body: `No festival or weekday is recorded for Iðunn. Modern devotees follow the life of the apple tree. Sigrblót, the first day of summer in the Icelandic calendar in late April, falls near apple blossom time in much of the north and is the most common time to honour her renewal. Midsummer, with fruit setting on the trees, suits her too. Haustblót at the autumn equinox, the harvest, is apple time: the first fruit and the first cider go to her. At Yule (Jól), some devotees keep an apple for her on the feast table, as a promise of the year’s return.

Some devotees honour her whenever they recover from illness, or on a birthday as a thanks for another year.`,
            },
            {
              heading: 'What to offer',
              body: `Fresh apples, of course, or crab apples, apple cake, apple juice, cider or apple brandy. Hazelnuts and northern berries suit her as well. Spring flowers and apple blossom in season; a seedling or a planted tree. Honey cakes, which pair her with Bragi’s mead of poetry.

Acts are offerings too: a healthy habit kept, a rest taken when you need it, a visit to an elder, a tree planted, a garden tended. The Hávamál’s rule holds: “gifts with gifts requite” (Bellows, stanza 42). Give regularly and within your means.`,
            },
            {
              heading: 'How to offer',
              body: `Cut an apple across the middle to show the star of seeds. Put half on the shrine for her and eat the other half yourself, slowly. Pour her a little cider or juice. Speak simply. The next morning, give her half to the earth under a tree, or compost it, which is itself a kind of renewal.

Many devotees give her the first apple of the season, before anyone else eats from the tree or the bag.`,
            },
            {
              heading: 'What not to do',
              body: `Don’t eat, grind or brew apple seeds; they release cyanide when crushed. Keep cores away from pets. Don’t let fruit on her shrine rot; replace it while it is fresh. Don’t use her as a goddess of anti-ageing products or diets; renewal is not about fitting anyone’s idea of youth. Don’t replace medical care with prayer. And don’t claim ancient customs for her that do not exist; tell people plainly that her devotion is modern and built on her story.`,
            },
          ],
          knowAndDont: {
            known:
              'Sigrblót (the summer-opening feast) and Yule are attested Norse seasonal feasts; Midsummer customs are richly recorded in later Scandinavian folk tradition; Haustblót as an equinox harvest blót is modern. Hávamál 42 gives the gift-for-gift principle. Apple seeds contain amygdalin.',
            unknown:
              'None of these tides is connected with Iðunn in the old sources. Her colours, stones and flowers are modern associations.',
          },
          inPractice:
            'Many devotees keep a bowl of apples on Iðunn’s shrine all autumn and winter, replacing them weekly, and plant something in spring at Sigrblót in her name.',
          reflect: [
            'Which season do you most need renewal in? How could you prepare for it with Iðunn’s help?',
            'What healthy habit could be your offering this year?',
          ],
          further: ['Hávamál in Bellows (1923).'],
          library: ['traditional/deity/idunn', 'traditional/candle/green', 'traditional/crystal/carnelian'],
          premade: ['folk-simple-blot', 'green-harvesting-herbs-with-thanks'],
        },
      ],
      practices: [
        {
          id: 'idunn-nine-days',
          title: 'Nine days of renewal',
          instructions: `For nine days, choose one small act of renewal each morning and dedicate it to Iðunn: an early night, a walk, a proper meal, a glass of water, an hour without screens, a call to an elder, a stretch.

Each evening at the shrine, light the candle, set out a slice of apple, and tell her what you did and how your body feels. Snuff the candle and give the apple to the earth or the compost in the morning.

On the ninth day, give someone an apple or apple cake, and give her the first slice.`,
          times: 9,
          every: 'day',
          prompt: 'What did you do for renewal today, and how does your body feel?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Home Again',
      intro:
        'When Iðunn came home, the gods grew young again. Take a few days to read your journal and see what has come home to you this month. Pausing, stopping, honouring Iðunn at spring and harvest without a vow, or turning to another god are all good outcomes.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'idunn-reread',
          title: 'Read your record',
          instructions: 'Read everything you have written since the first rite, and look at what you planted.',
          times: 1,
          prompt: 'What has been renewed in you this month?',
        },
      ],
      questions: [
        'Did this feel like meeting Iðunn, or like looking after yourself better? Both are honest, and the second is valuable whatever you decide.',
        'How do you feel about honouring a goddess with no recorded worship at all, known only from a story?',
        'Are you drawn to renewal, or to youth? Be honest; they are not the same.',
        'If you are unwell, is your care for your health in good hands apart from this devotion?',
        'What offering and act of renewal can you keep for a year?',
        'If you stop here, what will you keep from this month?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The First Fruit',
      intro: `If you have chosen to go on, this is the dedication: a blót of apples and cider, a vow written in advance, and a token kept in a small box, after Iðunn’s eski. It is a self-dedication between you and Iðunn. It is not an initiation into any group, and it does not replace a group’s own rites. Make the vow gentle and keepable.`,
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'idunn-write-vow',
          title: 'Write the vow',
          instructions:
            'A day before, write your vow: the offering you will keep (for example, a fresh apple on the shrine each week), the act of renewal you will keep (for example, a weekly rest day, or a monthly visit to an elder, or tending a tree), how long (a year and a day, or from one harvest to the next, are common), and what you ask (vitality, recovery, renewal after hardship).',
          times: 1,
          prompt: 'Write the final vow here.',
        },
      ],
      rite: {
        title: 'Dedication to Iðunn',
        summary:
          'A blót of apples and cider: hallow the space, hail Iðunn, share the fruit, swear your vow, and hallow a token kept in a small box.',
        minutes: 35,
        ingredients: [
          { name: 'Three fresh apples, or crab apples' },
          { name: 'A horn or cup of cider or apple juice' },
          { name: 'A small knife and a plate' },
          { name: 'A small wooden box' },
          { name: 'A green or gold candle in a safe holder', ref: 'traditional/candle/green' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A token: a piece of green aventurine or rose quartz, a dried apple slice, or a hazelnut', ref: 'traditional/crystal/green_aventurine' },
          { name: 'Fresh flowers or blossom', optional: true },
          { name: 'Your written vow' },
        ],
        preparation:
          'Clean the shrine and set out fresh flowers. Wash the apples. Put the token in the box and set it on the shrine. Sigrblót, Haustblót, a morning after recovering from illness, or the day after your ninth day are good times.',
        steps: [
          {
            title: 'Hallow the space',
            instructions: 'Light the candle. Open a window. Walk once sunwise around the room and name it holy.',
            spoken: 'I hallow this place. Let it be fresh and green, and let what is tired here be made new.',
            light: true,
          },
          {
            title: 'Hail her',
            instructions: 'Hold up one apple in both hands.',
            spoken:
              'Iðunn, the renewing one, wife of Bragi, keeper of the fruit in the ash-wood box. You keep the gods’ remedy against old age with care and honesty; when you were stolen, they grew grey, and when you came home, they were young again. I come to give myself to your renewal. Hear me.',
          },
          {
            title: 'Share the fruit',
            instructions:
              'Cut the apple across its middle to show the star. Put one half in the offering bowl. Eat a bite of the other and drink a sip.',
            spoken: 'The first is yours. I share the rest with you. Hail Iðunn!',
          },
          {
            title: 'Swear the vow',
            instructions: 'Lay your hand on the box. Read your vow aloud, once, clearly.',
            spoken: 'Before Iðunn I make this vow. Let it hold as long as I keep it.',
          },
          {
            title: 'Hallow the token',
            instructions:
              'Open the box and take out the token. Hold it up to the open window, then pass it over the candle at a safe height. Put it back in the box, and keep the box on the shrine.',
            spoken: 'Let this be a sign of my troth to Iðunn. When I open this box, let me remember to renew what is tired, and to keep what renews me with care.',
          },
          {
            title: 'Pour her share',
            instructions: 'Pour the rest of the cup into the bowl, and add the other two apples to the shrine.',
            spoken: 'Gift for gift. These are yours. Give me vitality, and the strength to come home to myself.',
          },
          {
            title: 'Close',
            instructions:
              'Sit a few minutes in the fresh air. Thank her. Snuff the candle. Take the bowl outside and give it to the earth under a tree. Share one of the apples with someone, and keep the third on the shrine.',
            spoken: 'Hail Iðunn, and thanks. The vow is made.',
            snuff: true,
          },
        ],
        closing:
          'Write the date and your vow in your journal and keep the paper copy in the box for your rededication.',
        safety:
          'Keep the candle away from flowers, cloth and curtains, and never leave it burning. Take care with the knife. Do not eat apple seeds on purpose, and keep cores and seeds away from pets. If you use cider, keep alcohol away from pets. Pour drink outside or down a drain, not into houseplants.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Until Ragnarök',
      intro: `Snorri says Iðunn’s fruit keeps the gods young until the end of the world. Keep the offering and the renewal you vowed. Honour Iðunn at Sigrblót with seeds and blossom, at Midsummer as the fruit sets, at Haustblót with the first apples and cider, and at Yule with an apple on the table. Each year, read your vow, say how you kept it, and renew it.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'idunn-weekly',
          title: 'The weekly apple',
          instructions:
            'Once a week, put a fresh apple on the shrine and give last week’s to the earth or compost. Tell Iðunn one thing you did for renewal that week.',
          times: 52,
          every: 'week',
          prompt: 'What did you do for renewal this week?',
        },
        {
          id: 'idunn-tides',
          title: 'Keep the tides of the tree',
          instructions:
            'At Sigrblót, Midsummer, Haustblót and Yule, hold a blót with Iðunn hailed. At Haustblót, give her the first apple of the harvest; at Sigrblót, plant something.',
          times: 4,
          every: 'holy-day',
          prompt: 'What did you offer at this tide, and what is growing?',
          premade: 'folk-simple-blot',
        },
        {
          id: 'idunn-rededicate',
          title: 'Yearly rededication',
          instructions:
            'At Haustblót or the anniversary of your dedication, repeat the rite. Read last year’s vow from the box first and say how you kept it.',
          times: 1,
          prompt: 'How did last year’s vow go, and what will this year’s be?',
        },
      ],
    },
  ],
  sources: [
    'Rasmus B. Anderson, trans., The Younger Edda (1880), public domain: Gylfaginning ch. 26 (“His wife is Idun. She keeps in a box those apples…”, “with care and honesty”) and Skáldskaparmál (“Loke coaxed Idun out of Asgard into a forest…”, “the medicine to bar old age”), quoted from Project Gutenberg ebook #18947 (https://www.gutenberg.org/ebooks/18947).',
    'Henry Adams Bellows, trans., The Poetic Edda (1923), public domain: Lokasenna 16 and 18, Skírnismál 19 and its note, Hávamál 42, quoted from Project Gutenberg ebook #73533 (https://www.gutenberg.org/ebooks/73533).',
    'Þjóðólfr of Hvinir, Haustlöng (c. 900); Völsunga saga ch. 1–2; Hrafnagaldr Óðins: paraphrased.',
    'Archaeology: the Oseberg ship burial (834). Art: James Doyle Penrose, Idun and the Apples (1890). Scholarship: Richard North (1997); H. R. Ellis Davidson (1964); John Lindow (2001); Rudolf Simek (1993); Ronald Hutton (1996).',
  ],
};
