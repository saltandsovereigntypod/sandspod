import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-frigg',
  kind: 'deity',
  paths: ['norse'],
  deityRef: 'traditional/deity/frigg',
  title: 'Frigg, Who Knows and Keeps Silent',
  summary:
    'A lunar month with Odin’s queen, the mother of Baldr, who knows all fates and does not speak them: her myths, her handmaidens, the honest Freyja question, and a household devotion you can actually keep.',
  welcome: `This journey spends about a month with Frigg, the queen of Asgard. You will read what the sources say about her (less than you might hope, and more interesting than most books admit), set up a household shrine, learn which customs are old and which are modern, keep nine nights of offering, and decide at the end whether to dedicate yourself to her.

It is a self-dedication, not an initiation, and it does not replace the rites of any Heathen group. You do not need to be married, a mother or a homemaker to come to Frigg. Anyone who keeps a home, cares for others, holds a confidence or worries about someone they love is already on her ground.`,
  about: `Frigg (Old Norse, perhaps “beloved”; Old English Frīg, Old High German Frija, Lombard Frea) is Odin’s wife, the foremost of the Æsir goddesses, and the mother of Baldr. She lives in the hall Fensalir, “fen halls,” sits beside Odin on his high seat Hliðskjálf to look over the worlds, and, in the words of Lokasenna, knows the fate of all though she does not say it herself. Snorri gives her a household of goddesses and handmaidens: Fulla, who carries her chest and knows her secrets, Hlín, who protects those Frigg wishes to save, and Gná, her messenger. The great story of her grief is the death of Baldr, which she tried to prevent by taking oaths from every living thing. She was known across the Germanic world, and Friday may be named for her. Little survives of her historical worship, so most modern devotion, with its spindles, keys and household care, is a careful reconstruction. Heathens today honour her at Mothers’ Night on the first night of Yule, on Fridays and at home, for protection of the household, wise counsel, marriage and the safe return of those who travel.`,
  notes: [
    'Frigg and Freyja may or may not share an origin. The Norse sources keep them separate, but they have striking parallels. This journey sets out the evidence honestly.',
    'Much of what modern books say about Frigg’s keys, spinning and constellation comes from thin or late evidence. Each lesson says what is old and what is modern.',
    'This app is inclusive. Frigg is honoured as a guardian of every kind of household, chosen family included, by people of any ancestry, gender or orientation.',
    'Frigg knows fate and does not tell it. Devotion to her does not need divination, and pressing her, or anyone, for predictions about your loved ones is not the spirit of her worship.',
    'If your household is unsafe, a goddess of the home is not a substitute for real help. Contact local domestic-abuse or child-protection services; that, too, is keeping the home.',
  ],
  holyDays: ['jol', 'disablot', 'vetrnaetur'],
  stages: [
    {
      kind: 'threshold',
      title: 'The Hall in the Fens',
      intro:
        'Frigg’s worship belongs at home. These first days are about making a quiet place for her near the heart of your household, and greeting her as a guest who is also a queen.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'frigg-shrine',
          title: 'Set up a household shrine',
          instructions: `Choose a place near the centre of household life: the kitchen, a shelf by the front door, the mantel. Frigg is not a goddess for the back of a cupboard. Lay a clean white or blue cloth. Add a small cup, a dish for bread or milk, and one candle in a holder.

For images and tokens: a spindle, a drop spindle or simply a ball of wool or linen thread; a key, perhaps an old door key; a falcon feather or image; a sprig of birch. Many devotees add photographs of family, by blood or by choice, so Frigg can see who is in her keeping.

Keep it tidy. A clean shrine in a cared-for room is itself an offering to a household goddess.`,
          times: 1,
          prompt: 'Where did you put the shrine, and who is “under your roof” in the sense that matters?',
        },
        {
          id: 'frigg-tending',
          title: 'One tending a day',
          instructions:
            'For three days, do one small act of household care with full attention, and dedicate it to her aloud: wipe the table, mend a button, fold the washing, cook a meal. Say: “Frigg, I keep this house.”',
          times: 3,
          every: 'day',
          prompt: 'What did you tend, and how did it feel to do it for her?',
        },
      ],
      rite: {
        title: 'Welcoming the Queen',
        summary:
          'A quiet first greeting at the household shrine: hallow the room, offer milk and bread, name the people in your keeping, and ask Frigg to watch over them.',
        minutes: 20,
        ingredients: [
          { name: 'A cup of milk, mead or apple juice' },
          { name: 'A slice of fresh bread' },
          { name: 'A candle in a safe holder', ref: 'traditional/candle/white', optional: true },
          { name: 'A ball of wool or linen thread' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
        ],
        preparation:
          'Tidy the room. Wash your hands. Pour the drink, slice the bread, and set the thread on the shrine.',
        steps: [
          {
            title: 'Hallow the room',
            instructions: 'Light the candle. Walk once around the room sunwise and name it holy.',
            spoken: 'I hallow this house for the gods and for all who live here in peace.',
            light: true,
          },
          {
            title: 'Greet her',
            instructions: 'Stand before the shrine and lift the cup gently.',
            spoken:
              'Frigg, queen of Asgard, Odin’s wife, Baldr’s mother. You who sit in Fensalir and look over all the worlds, who know all fates and keep your counsel. I bring you milk and bread from my house. Hear me.',
          },
          {
            title: 'Name your household',
            instructions:
              'Hold the ball of thread. Say aloud the names of the people (and animals) in your keeping, winding a turn of thread for each. Say what you hope for them. If there is a worry, speak it plainly.',
            minutes: 5,
          },
          {
            title: 'Share the cup',
            instructions: 'Drink a sip and eat a bite of bread. Set the thread back on the shrine.',
            spoken: 'I share this with you. Hail Frigg!',
          },
          {
            title: 'Sit quietly',
            instructions: 'Sit a few minutes in silence. Frigg is the goddess who listens; listen too.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Thank her. Snuff the candle. Later the same day, pour the drink and lay the bread on the earth outside, at a birch or any tree.',
            spoken: 'Thank you, Frigg. I will come back.',
            snuff: true,
          },
        ],
        closing: 'Write the names you wound into the thread in your journal. Keep the ball of thread on the shrine; you will use it again.',
        safety:
          'Never leave a candle burning unattended, and keep it away from the thread. Milk spoils fast; clear it within a few hours. Pour offerings outside or down a drain, not into houseplants, and keep bread and dairy away from pets.',
      },
    },
    {
      kind: 'study',
      title: 'What the Queen Knows',
      intro:
        'Twelve days of reading: who Frigg is, the stories that show her, and the honest question of where she came from and how she relates to Freyja.',
      days: 12,
      lessons: [
        {
          id: 'frigg-who',
          title: 'Queen of Asgard and Her Household',
          summary: 'Frigg’s place among the gods, her hall, her seat beside Odin and the goddesses who serve her.',
          minutes: 6,
          sections: [
            {
              heading: 'First of the goddesses',
              body: `When Snorri lists the goddesses in the Prose Edda, Frigg comes first. In Rasmus Anderson’s 1880 translation: “Frigg is the first; she possesses the right lordly dwelling which is called Fensaler.” Fensalir, the fen halls or marsh halls, may recall the bogs and wetlands where offerings were sunk in the Iron Age, though that is a guess.

Frigg is Odin’s wife and sits beside him on Hliðskjálf, his high seat, from which they look out over all the worlds. Snorri says she is the daughter of Fjörgyn, a name connected with the earth. Her son is Baldr, the bright and beloved god. Some sources make Höðr, Baldr’s blind brother, her son too.`,
            },
            {
              heading: 'She knows and does not say',
              body: `Her most famous attribute is foreknowledge. In Lokasenna, when Loki starts dragging up Frigg’s past, Freyja warns him:

“Mad art thou, Loki, that known thou makest / The wrong and shame thou hast wrought; / The fate of all does Frigg know well, / Though herself she says it not.” (Henry Adams Bellows’ 1923 translation, stanza 29)

Frigg knows, and keeps silent. That is a rare and difficult kind of wisdom: holding what you know about people without using it against them or burdening them with it. Earlier in the same poem, when Odin and Loki trade insults about the past, Frigg tells them both: “Whate’er ye have done in days gone by, / Old tales should ne’er be told” (stanza 25). She is the one trying to keep the peace at the table.`,
            },
            {
              heading: 'Her handmaidens',
              body: `Frigg runs a household of her own. Snorri names Fulla, a maiden with flowing hair and a gold band, who “carries Frigg’s chest, takes care of her shoes and knows her secrets”; Hlín, “who guards those men whom Frigg wants to protect from any danger”; and Gná, “whom Frigg sends on her errands into various worlds,” riding the horse Hófvarpnir through air and sea (all Anderson’s translation). Völuspá calls Frigg herself Hlín in one stanza, so Hlín may be a name for Frigg’s protecting side.

Snorri also lists goddesses like Sága, Eir the healer, Vár who hears oaths, and Snotra the wise. Modern Heathens sometimes treat these as Frigg’s handmaidens, a teaching popularised in the 20th century. Snorri does not quite say that; he lists them among the goddesses.`,
            },
            {
              heading: 'Her names and signs',
              body: `In poetry Frigg is called Odin’s wife, Baldr’s mother, Fjörgyn’s daughter, queen of the Æsir, and mistress of Fensalir and of the falcon shape: Snorri says Loki once borrowed Frigg’s falcon cloak, as he did Freyja’s. Modern Heathens add signs from folklore and reconstruction: the distaff and spindle, keys at the belt, the spinning wheel, birch and flax. Some of these have old roots, some do not; lesson four sorts them out.`,
            },
          ],
          knowAndDont: {
            known:
              'Frigg as Odin’s wife, Baldr’s mother, mistress of Fensalir and the one who knows fate are attested in the Poetic Edda and Snorri. Fulla, Hlín and Gná are described by Snorri in Gylfaginning ch. 35. Fulla also appears in the Grímnismál prose.',
            unknown:
              'The meaning of Fensalir is uncertain. Whether the list of goddesses Snorri gives were once separate goddesses, names of Frigg, or his own classification is unclear. The handmaidens as a group of twelve under Frigg is a modern framing.',
          },
          inPractice:
            'Heathens often call on Hlín for protection of a loved one, Fulla for help with secrets and household matters, and Gná when sending a message, a letter or a prayer for someone far away.',
          reflect: [
            'Frigg knows and keeps silent. What do you know about someone that is not yours to tell?',
            'Who are the Fullas, Hlíns and Gnás in your life, the ones who keep, guard and carry?',
          ],
          further: [
            'Gylfaginning ch. 35 in Rasmus B. Anderson, The Younger Edda (1880), public domain.',
            'Lokasenna in Henry Adams Bellows, The Poetic Edda (1923), public domain.',
          ],
          library: ['traditional/deity/frigg', 'traditional/deity/odin', 'traditional/deity/baldur'],
        },
        {
          id: 'frigg-myths',
          title: 'Oaths, Wagers and a Mother’s Grief',
          summary: 'The stories that show Frigg: her farewell to Odin, her wager over the foster-sons, the Lombard tale, and Baldr’s death.',
          minutes: 7,
          sections: [
            {
              heading: 'Counsel and a blessing',
              body: `Vafþrúðnismál opens with Odin asking Frigg’s advice: he wants to go and match wisdom with the giant Vafþrúðnir. She advises against it; no one, she says, is his equal in knowledge. When he insists, she gives him a blessing that Heathens still use for travellers:

“Safe mayst thou go, safe come again, / And safe be the way thou wendest! / Father of men, let thy mind be keen / When speech with the giant thou seekest.” (Bellows, stanza 4)

This is Frigg in a nutshell. She gives honest counsel, and when it is not taken she blesses the road anyway.`,
            },
            {
              heading: 'The wager and the Lombards',
              body: `In the prose that frames Grímnismál, Frigg and Odin each foster a young prince, Agnar and Geirröðr. Geirröðr becomes king; Odin boasts of him. Frigg retorts that Geirröðr is so stingy he tortures guests. To prove it, she sends Fulla ahead to warn the king of a dangerous wizard coming, and when Odin arrives in disguise, the king seizes him. Frigg wins the argument, and the story ends with Agnar on the throne.

A similar contest appears in a much older source. The 7th-century Origo Gentis Langobardorum, retold by Paul the Deacon around 790, says the Winnili people asked Frea, Godan’s wife, for victory. Godan had promised victory to whomever he saw first at sunrise. Frea told the Winnili women to tie their hair across their faces like beards, and turned Godan’s bed to face them. Waking, he asked who these long-beards were, and so the tribe got their new name, Langobards, and the victory with it. Frigg, in both stories, is the clever one.`,
            },
            {
              heading: 'Baldr',
              body: `Baldr dreamed of his own death. Snorri tells how Frigg went to fire and water, iron and every metal, stones, earth, trees, illnesses, animals, birds, poisons and serpents, and took an oath from each not to harm him. Only the mistletoe, which seemed too young to ask, was left out. The gods made a game of throwing things at Baldr, and nothing hurt him. Loki, disguised as an old woman, learned the secret from Frigg, made a dart of mistletoe and put it in the hand of Baldr’s blind brother Höðr. Baldr fell dead.

Frigg asked who would ride to Hel to ransom him. Hermóðr went, and Hel agreed to release Baldr if everything in the world would weep for him. Everything did, except one giantess in a cave, who was probably Loki. Völuspá gives Frigg’s grief in two lines: “But in Fensalir did Frigg weep sore / For Valhall’s need” (Bellows, stanza 34).`,
            },
            {
              heading: 'What the stories teach',
              body: `Frigg does everything a parent can. She gathers oaths from the whole world. It is not enough. That is the hardest thing her story says: love and care and foreknowledge cannot keep every harm away.

Many people come to Frigg out of worry for someone they love: a sick child, an ageing parent, a partner far away. Her story does not promise that the worst won’t happen. It says she knows that fear from the inside, that she did everything she could, and that she wept. Devotees often find that more comforting than any guarantee.

Lokasenna also has Loki accuse her of sleeping with Odin’s brothers Vili and Vé while Odin was away, a story Ynglinga saga tells as well. The insult was meant to wound; it tells us people told stories about her that the Eddas did not tidy away.`,
            },
          ],
          knowAndDont: {
            known:
              'Vafþrúðnismál, Grímnismál and Völuspá are Eddic poems; Baldr’s death in full is in Snorri’s Gylfaginning; the Frea and Godan story in the Origo Gentis Langobardorum (7th c.) and Paul the Deacon’s History of the Lombards I.8.',
            unknown:
              'Snorri’s account of Baldr may draw on Christian themes. The giantess Þökk being Loki is Snorri’s claim. How much the Lombard Frea resembled Norse Frigg is unknown beyond the name and marriage.',
          },
          inPractice:
            'Many devotees say Frigg’s blessing from Vafþrúðnismál over loved ones leaving on a journey, or write it on a card tucked into a bag. Others tie a thread for each family member around a spindle or bobbin on Frigg’s shrine.',
          reflect: [
            'Frigg gave counsel and then blessed the road anyway. When have you had to let someone go against your advice?',
            'What harm are you trying to prevent that you cannot fully prevent? What would it mean to give that to Frigg?',
          ],
          further: [
            'Vafþrúðnismál, Grímnismál and Völuspá in Bellows (1923).',
            'Gylfaginning ch. 49 in Anderson, The Younger Edda (1880).',
            'Paul the Deacon, History of the Lombards, trans. W. D. Foulke (1907), public domain, book I ch. 8.',
          ],
          library: ['traditional/deity/frigg', 'traditional/deity/baldur', 'traditional/deity/loki', 'traditional/herb/mistletoe'],
        },
        {
          id: 'frigg-frija',
          title: 'Frija of the Germans, and the Freyja Question',
          summary: 'Frigg beyond Scandinavia, Friday, the Merseburg charm, and the honest uncertainty about whether she and Freyja were once one.',
          minutes: 6,
          sections: [
            {
              heading: 'A goddess across the Germanic world',
              body: `Frigg is older and more widespread than Freyja. The Anglo-Saxons knew Frīg, and named Frīgedæg, Friday, for her, translating the Roman day of Venus. Old High German Frija gives Freitag. The Lombards knew Frea as Wodan’s wife.

One of only two pagan spells to survive in Old High German, the Second Merseburg Charm (copied in the 900s), names her. It tells how Wodan and others rode to the woods and a horse sprained its foot. Several goddesses sang charms over it, among them Frija and her sister Volla, before Wodan healed it with his own words, “bone to bone, blood to blood.” Volla is surely Fulla, Frigg’s handmaiden in the Norse sources. So the pairing of Frigg and Fulla, and Frigg as a healer who sings charms, goes back a long way.`,
            },
            {
              heading: 'Two goddesses, or one?',
              body: `In the Norse sources, Frigg and Freyja are two people. They speak to each other in Lokasenna. They have different families: Frigg is of the Æsir and married to Odin, Freyja is of the Vanir, Njörðr’s daughter, married to Óðr. Snorri lists them separately.

But they share a lot. Both have falcon cloaks. Both weep for a lost loved one. Freyja’s husband Óðr and Frigg’s husband Óðinn carry the same root word. And outside Scandinavia, there is only Frija. Some scholars argue that a single early goddess, *Frijjō, split in the north into two: Frigg the queen and wife, Freyja the lover and sorceress. Henry Adams Bellows already noted the possibility in 1923. Others argue that the Norse evidence, including place names that distinguish them, shows two separate cults whatever the deep origins.

Nobody knows. The evidence supports both readings, and careful scholars hold each.`,
            },
            {
              heading: 'What this means for practice',
              body: `Most modern Heathens honour Frigg and Freyja as two goddesses, because that is how the Norse sources and living tradition present them. Some see them as sisters or two faces of one power. Either is a defensible choice, as long as you know which one you are making.

Practically: when you pray to Frigg, call her by her own names and stories, Odin’s wife, Baldr’s mother, mistress of Fensalir, rather than Freyja’s. Many books blend them, giving Frigg Freyja’s cats or Freyja Frigg’s spinning. Keep them clear in your own mind, and you can hold the “we don’t know” without it unsettling your devotion.`,
            },
          ],
          knowAndDont: {
            known:
              'Frīg, Frija and Frea are attested in Old English, Old High German and Lombard sources. Friday’s name comes from her in English and German. The Second Merseburg Charm names Frija and Volla. The Norse sources treat Frigg and Freyja as distinct.',
            unknown:
              'Whether Frigg and Freyja share an origin is unresolved. The Old Norse Frjádagr (Friday) may be a borrowing from West Germanic and could be linked to either goddess. The exact meaning of the Merseburg Charm’s other goddess names, Sinthgunt and Sunna, is debated.',
          },
          inPractice:
            'Some Heathens honour Frigg and Freyja side by side on Fridays, each with her own candle, and keep Mothers’ Night for Frigg and the Dísablót for Freyja.',
          reflect: [
            'Do you feel Frigg and Freyja as two, one, or something in between? What in your experience suggests that?',
            'Frija is a healer who sings over a hurt horse. What hurt in your household could you sing over?',
          ],
          further: [
            'Rudolf Simek, A Dictionary of Northern Mythology (1993), entries on Frigg, Frija and the Merseburg Charms.',
            'Stephan Grundy, “Freyja and Frigg” (1996).',
          ],
          library: ['traditional/deity/frigg', 'traditional/deity/freyja', 'traditional/deity/odin'],
        },
      ],
      practices: [
        {
          id: 'frigg-silence',
          title: 'A keeping silence',
          instructions:
            'Each day, keep one thing to yourself that you might have said: a criticism, a piece of gossip, a prediction about how something will turn out. Dedicate the silence to Frigg.',
          times: 12,
          every: 'day',
          prompt: 'What did you hold back today, and what did holding it back do?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine Nights at the Hearth',
      intro:
        'In this stage you learn how Frigg was and is honoured, sort the old customs from the new, and keep nine nights of household offering and care.',
      days: 9,
      lessons: [
        {
          id: 'frigg-worship',
          title: 'Spindles, Keys and Mothers’ Night',
          summary: 'What survives of Frigg’s worship, what is folklore or modern practice, and how Heathens honour her today.',
          minutes: 7,
          sections: [
            {
              heading: 'What survives',
              body: `Frigg’s historical worship is thinly recorded. There are a few place names in Sweden, such as Friggeråker (“Frigg’s field”) in Västergötland, and Friday’s name across Germanic languages. Adam of Bremen does not name her at Uppsala. The Merseburg Charm shows Frija as a goddess who sang healing over a hurt horse. Beyond that, we have to infer.

That is not a reason to give up. It is a reason to be honest. A modern Frigg devotion is built from the stories, from the values they show, and from household customs that may or may not be connected to her. Say which is which, and it can be deeply rooted.`,
            },
            {
              heading: 'Spindles and keys',
              body: `Spinning is everywhere in Norse women’s lives and graves; spindle whorls are among the commonest finds. Snorri does not say Frigg spins, but Swedish folk tradition recorded in the 1800s called the three stars of Orion’s belt Friggerock or Frejerock, “Frigg’s distaff,” and the image of Frigg at her spinning has become central to modern devotion. It is folklore, recorded late, and lovely.

Keys at the belt marked the woman of the house in the Viking Age; women were buried with them. In Þrymskviða, when Thor is dressed as a bride, he is given keys to hang at his waist. That does not tie keys to Frigg directly, but it shows they meant household authority, which makes them a fitting modern sign of a household queen.`,
            },
            {
              heading: 'Mothers’ Night',
              body: `The monk Bede, writing around 725 about the pagan English calendar, says the year began on what is now Christmas Eve, a night they called Modranecht, “mothers’ night,” for the ceremonies they performed. He says nothing more. Modern Heathens connect it with the Matronae, the triple mother goddesses worshipped by Germanic soldiers on the Rhine in the Roman period, and with the dísir, the guardian women of the family.

Many Heathens now keep Mothers’ Night as the first night of Yule, honouring Frigg, the dísir and their own ancestral mothers together. The tie to Frigg is a modern one, but it is a natural fit: the queen who knows the fates of all, honoured with the women who kept every household before yours.`,
            },
            {
              heading: 'Frigg today',
              body: `Modern devotees honour Frigg for the protection of the household and family, for marriage and partnership, for children and pregnancy, for the safe return of travellers, for counsel in hard decisions, and for the strength to care for others without disappearing. Many caregivers, nurses, parents, foster carers and people looking after ageing relatives feel close to her.

Frigg is the guardian of whatever your household is: a family, a couple, housemates, a person and a cat. Inclusive Heathen groups honour her that way, and so does this journey.`,
            },
          ],
          knowAndDont: {
            known:
              'Bede’s De temporum ratione ch. 15 mentions Modranecht. Spindle whorls and keys are common in Norse women’s graves. Þrymskviða has Thor wear keys as a bride. Friggeråker is a real Swedish place name.',
            unknown:
              'No source ties Frigg to Mothers’ Night, spinning or keys; these are modern connections. “Friggerock” for Orion’s belt is recorded in 19th-century Swedish folk astronomy and its age is unknown. What Bede’s ceremonies were is unknown.',
          },
          inPractice:
            'A common Frigg practice is a household blessing each Friday or at Mothers’ Night: a candle lit, bread and milk offered, the names of everyone under the roof said aloud, and a thread wound for each on her spindle.',
          reflect: [
            'Who cares for you the way you care for others? Have you thanked them?',
            'Which of Frigg’s modern customs feel right to you, knowing they are modern?',
          ],
          further: [
            'Bede, The Reckoning of Time, trans. Faith Wallis (1999), ch. 15.',
            'Judith Jesch, Women in the Viking Age (1991).',
          ],
          library: ['traditional/deity/frigg', 'traditional/herb/birch', 'traditional/tool/key'],
          premade: ['kitchen-hearth-blessing', 'kitchen-family-meal-blessing'],
        },
        {
          id: 'frigg-days',
          title: 'Fridays, Bread and Milk, and What Not to Ask',
          summary: 'Frigg’s days and tides, the offerings that suit her, how to give them, and the courtesy of not demanding to know the future.',
          minutes: 6,
          sections: [
            {
              heading: 'Her days and tides',
              body: `Friday carries her name in English and German, and many devotees keep a short Friday rite for her: candle, bread or milk, the household’s names. Mothers’ Night, the first night of Yule, is her great tide in modern practice. Many also honour her at the Dísablót in February with the ancestral mothers, and at Winter Nights in October as the household turns inward for the dark half of the year.`,
            },
            {
              heading: 'Offerings',
              body: `Bread, milk, butter and mead suit a household goddess: the things a household makes and shares. A portion of the family meal, set aside before anyone eats, is an old and natural offering. Spun yarn, a woven or knitted piece, linen, or a mended garment are good gifts; so is an hour spent on real care, sitting with someone sick, helping a parent with paperwork, keeping a difficult promise.

Herbs associated with her in modern practice include lady’s mantle and flax; birch is often given her. These are modern, not ancient, choices.

The Hávamál’s rule holds for her too: “gifts with gifts requite” (Bellows, stanza 42). Give regularly and gladly, and within your means.`,
            },
            {
              heading: 'How to offer',
              body: `Stand or sit at the shrine. Lift the offering, name her, and say what you give and why. Share a taste yourself, as at any blót. Leave her portion a while, then give it to the earth outside, or compost it. Milk and food should not sit out for long. Do not eat what has been given.

Speak to her plainly. In Vafþrúðnismál she hears Odin out and gives honest counsel; in Lokasenna she tries to calm a quarrel. Bring her honest worries rather than grand speeches.`,
            },
            {
              heading: 'What not to ask',
              body: `Frigg knows the fate of all and does not say it. It is a courtesy not to keep demanding that she tell you. Ask her to protect, to give counsel, to help you bear what comes. Don’t treat her rite as a fortune-telling session about your loved ones, and be cautious about readings that claim to give you her predictions.

Don’t ask her to make someone stay in a relationship or a household against their will. Her husband went to the giant against her advice, and she blessed his road. And don’t use her worship to pressure anyone, yourself included, into a traditional role you do not want. She keeps a household; she does not keep anyone captive in one.`,
            },
          ],
          knowAndDont: {
            known:
              'Friday’s name in English and German; the gift-exchange principle in the Hávamál; Frigg’s foreknowledge and silence in Lokasenna.',
            unknown:
              'Which offerings were given to Frigg in the Viking Age is not recorded. Herb and colour associations are modern. Friday as specifically Frigg’s rather than Freyja’s day in Scandinavia is uncertain.',
          },
          inPractice:
            'Many devotees set aside the first portion of the Friday evening meal for Frigg, and say the names of the household before eating.',
          reflect: [
            'What do you want to know about the future that you could, instead, give to Frigg to hold?',
            'What household task could become an offering if you did it for her?',
          ],
          further: ['Hávamál and Lokasenna in Bellows (1923).'],
          library: ['traditional/deity/frigg', 'traditional/crystal/moonstone', 'traditional/candle/blue'],
          premade: ['kitchen-family-meal-blessing'],
        },
      ],
      practices: [
        {
          id: 'frigg-nine-nights',
          title: 'Nine nights of keeping',
          instructions: `For nine nights, at the household shrine, light the candle. Offer a little milk, mead or bread. Wind one turn of thread on your ball or spindle for each person in your keeping, saying their names. Then tell Frigg one act of care you did that day.

Sit in silence for five minutes. Snuff the candle. Give the offering to the earth before bed or in the morning.

On the ninth night, give something made by your hands: a knitted square, a mended garment, a loaf, a written blessing for your household.`,
          times: 9,
          every: 'day',
          prompt: 'Who did you name tonight, and what care did you give or receive today?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Sitting in Fensalir',
      intro:
        'Look back over your journal quietly and honestly. Pausing, stopping, honouring Frigg without a vow, or finding that another goddess is calling you are all good outcomes.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'frigg-reread',
          title: 'Read your record',
          instructions: 'Read everything you have written since the first rite. Notice what you kept returning to.',
          times: 1,
          prompt: 'What do you notice in your record?',
        },
      ],
      questions: [
        'Did the nine nights feel like keeping company with Frigg, or like a chore?',
        'Are you drawn to Frigg herself, or to a role you feel you ought to fill?',
        'Can you honour a goddess whose historical worship is so thinly known, and be honest about what is modern?',
        'Is a worry about someone pushing you toward a vow? Would it be better to give that worry to her without one?',
        'What weekly offering and household care can you keep for a year?',
        'Would honouring her at Mothers’ Night and at blót, without a personal vow, be enough for now?',
        'If you stop here, what will you keep from this month?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The Keys',
      intro: `If you have chosen to go on, this is the dedication: a household blót, a vow written in advance, and a key or thread token to keep. It is a self-dedication between you and Frigg. It is not an initiation into any group, and it does not replace a group’s own rites. Keep the vow modest and specific.`,
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'frigg-write-vow',
          title: 'Write the vow',
          instructions:
            'A day before, write your vow: the offering you will keep (for example, bread or milk on Fridays), the care you will give (for example, one act of household care or service each week), how long, and what you ask (protection for your household, patience, counsel).',
          times: 1,
          prompt: 'Write the final vow here.',
        },
      ],
      rite: {
        title: 'Dedication to Frigg',
        summary:
          'A quiet household blót in which you hallow the home, hail Frigg, name your household, speak a written vow, and hallow a key or thread to keep.',
        minutes: 35,
        ingredients: [
          { name: 'A cup of mead or milk (or apple juice)' },
          { name: 'A loaf of bread, ideally baked yourself' },
          { name: 'A candle in a safe holder', ref: 'traditional/candle/white' },
          { name: 'The ball of thread from your nine nights' },
          { name: 'A key on a cord or ring', ref: 'traditional/tool/key' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Your written vow' },
        ],
        preparation:
          'Clean the room, set the shrine, pour the drink and set out the bread. Lay the thread and key on the shrine. A Friday, Mothers’ Night or the day after your ninth night are good times.',
        steps: [
          {
            title: 'Hallow the house',
            instructions: 'Light the candle. Carry it (or point with your hand) to the front door, then around the home sunwise, and back to the shrine.',
            spoken: 'I hallow this house, door to hearth. Let it be a frith-stead, a place of peace, under Frigg’s keeping.',
            light: true,
          },
          {
            title: 'Hail her',
            instructions: 'Lift the cup and call her by her names.',
            spoken:
              'Frigg, queen of the Æsir, Odin’s wife, Baldr’s mother, Fjörgyn’s daughter, mistress of Fensalir. You who know all fates and say them not, who blessed the road you could not close. With Fulla, Hlín and Gná, hear me.',
          },
          {
            title: 'Name the household',
            instructions:
              'Hold the thread. Say the name of each person in your keeping, winding a last turn for each. Then tie the end.',
            minutes: 4,
          },
          {
            title: 'Share bread and cup',
            instructions: 'Break the bread. Eat a piece and drink a sip. Set the first and best piece in the offering bowl for Frigg.',
            spoken: 'I share this with you, Lady of the house. Hail Frigg!',
          },
          {
            title: 'Speak the vow',
            instructions: 'Hold the cup and read your vow aloud once. Take a sip to seal it.',
            spoken: 'These words I give you, Frigg, as the oaths were given for Baldr. Witness them, and hold me to them.',
          },
          {
            title: 'Hallow the key',
            instructions:
              'Take the key in your hand. Wind a length of the thread around it. Pass it over the candle at a safe height, and hang it at your belt, around your neck or by the door.',
            spoken: 'Let this key be a sign of my troth. Keep this house, and let me keep it well.',
          },
          {
            title: 'Give her share',
            instructions: 'Pour the rest of the cup into the bowl with the bread.',
            spoken: 'Gift for gift. This is yours, given gladly. Give me in return a watchful heart and a quiet strength.',
          },
          {
            title: 'Close',
            instructions:
              'Thank her. Sit a few minutes in silence. Snuff the candle. Take the bowl outside and give it to the earth, at a birch if you can.',
            spoken: 'Hail Frigg, and thanks. The vow is made.',
            snuff: true,
          },
        ],
        closing:
          'Write the date and your vow in your journal. Keep the paper vow with the thread on her shrine, for your rededication next year.',
        safety:
          'Keep the candle away from thread, sleeves and hair, and never leave it burning or carry it near curtains. Milk spoils quickly; clear offerings within a few hours. Pour offerings outside or down a drain, not into houseplants, and keep food away from pets.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the House',
      intro: `Keep the Friday offering and the care you vowed. Honour Frigg with the ancestral mothers at Mothers’ Night, the first night of Yule, and at the Dísablót; bless the household as it turns inward at Winter Nights. Say her travel blessing over anyone leaving on a journey. Each year, read your vow, say how you kept it, and renew it.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'frigg-weekly',
          title: 'Friday household blessing',
          instructions: 'Each Friday, light a candle, offer bread or milk, and say the names of everyone in your keeping.',
          times: 52,
          every: 'week',
          prompt: 'Who needs Frigg’s keeping this week?',
          premade: 'kitchen-family-meal-blessing',
        },
        {
          id: 'frigg-tides',
          title: 'Keep the holy tides',
          instructions:
            'At Mothers’ Night on the first night of Yule, light a candle for Frigg and one for each ancestral mother you remember. At the Dísablót and Winter Nights, hold a household blót with Frigg hailed.',
          times: 3,
          every: 'holy-day',
          prompt: 'Whom did you remember at this tide?',
          premade: 'folk-simple-blot',
        },
        {
          id: 'frigg-rededicate',
          title: 'Yearly rededication',
          instructions:
            'On the anniversary of your dedication or at Mothers’ Night, repeat the rite. Read last year’s vow and say how you kept it, then make a new one that fits your household now.',
          times: 1,
          prompt: 'How did last year’s vow go, and what will this year’s be?',
        },
      ],
    },
  ],
  sources: [
    'Henry Adams Bellows, trans., The Poetic Edda (1923), public domain: Lokasenna 25 and 29, Vafþrúðnismál 4, Völuspá 34 and Hávamál 42 quoted from Project Gutenberg ebook #73533 (https://www.gutenberg.org/ebooks/73533).',
    'Rasmus B. Anderson, trans., The Younger Edda (1880), public domain: Gylfaginning ch. 35 (“Frigg is the first…”, Fulla, Hlín, Gná) quoted from Project Gutenberg ebook #18947 (https://www.gutenberg.org/ebooks/18947); Baldr’s death, ch. 49, paraphrased.',
    'Origo Gentis Langobardorum (7th c.) and Paul the Deacon, History of the Lombards I.8; the Second Merseburg Charm (10th-c. manuscript); Bede, De temporum ratione ch. 15 (all paraphrased).',
    'Rudolf Simek, A Dictionary of Northern Mythology (1993); Stephan Grundy, “Freyja and Frigg” (1996); Judith Jesch, Women in the Viking Age (1991).',
  ],
};
