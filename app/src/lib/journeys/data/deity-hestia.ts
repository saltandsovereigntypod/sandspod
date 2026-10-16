import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-hestia',
  kind: 'deity',
  paths: ['hellenic', 'roman'],
  deityRef: 'traditional/deity/hestia',
  title: 'Hestia: The Fire at the Centre',
  summary:
    'A lunar month with Hestia, goddess of the hearth: her few myths and great honour, the first and last offering, the household fire, and a daily practice you can keep in any kitchen.',
  welcome: `This is a month of study and daily practice with Hestia, the goddess of the hearth. Of all the Greek gods, she is the one most honoured at home, every day, in small acts. That makes her a quietly perfect goddess for a first dedication, and a lifelong companion for anyone who keeps other gods too.

It is a self-dedication, not an initiation. No order or priesthood stands behind it. In ancient Greece every household honoured Hestia without anyone joining anything, and you are simply picking up that thread.

You will need a safe flame or an electric light, a little olive oil, bread or something from your own table, and a kitchen or table you can call the centre of your home.`,
  about: `Hestia means “hearth,” and she was the hearth: the fire at the centre of every Greek house, and the common fire of every city in its town hall, the prytaneion. She has almost no myths. She was the first child swallowed by Kronos and the last released, so she is called both eldest and youngest. Courted by Poseidon and Apollo, she swore to remain a maiden, and Zeus gave her instead the centre of the house and a share in every sacrifice. Greeks poured the first and last of their offerings to her, and a proverb, “to begin from Hestia,” meant to begin at the proper place. The Roman Vesta was her close cousin, with a famous temple and the Vestal Virgins, but a separate goddess with her own customs. Today Hellenic polytheists keep Hestia at the heart of daily household worship, lighting a lamp or candle for her each morning and evening, and many other Pagans honour her as the keeper of home and hospitality.`,
  notes: [
    'Hestia receives the first and the last portion of every offering in Greek practice, whoever else is being honoured. This journey teaches you how.',
    'The popular story that Hestia gave up her seat on Olympus to Dionysus is modern, from Robert Graves in the 1950s. No ancient source tells it.',
    'Fire safety comes first. Never leave a candle or oil lamp burning unattended. An electric candle or a pilot light is a respectful hearth.',
    'Hestia (Greek) and Vesta (Roman) are related but distinct. The journey covers both and says where they differ.',
  ],
  holyDays: ['noumenia', 'agathos_daimon', 'vestalia', 'deipnon'],
  stages: [
    {
      kind: 'threshold',
      title: 'Lighting the hearth',
      intro:
        'Hestia is approached at the centre of the home, not at its edges. So the journey begins by choosing your hearth: the place where you cook or eat, or a shelf near it. You will light it, greet her and introduce yourself.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'hestia-find-hearth',
          title: 'Choose your hearth',
          instructions:
            'Walk through your home and ask where its centre is. In most homes it is the kitchen or the table where people eat. Find a safe, stable spot there for a lamp or candle, away from curtains, shelves and cupboards, and out of reach of pets and children. If you cannot have a flame, choose an electric candle.',
          times: 1,
          prompt: 'Where is the centre of your home? Is it the place you expected?',
        },
      ],
      rite: {
        title: 'Introduction at the hearth',
        summary:
          'Purify, light the hearth, introduce yourself to Hestia, and give her the first and last of a small offering from your own kitchen.',
        minutes: 15,
        ingredients: [
          { name: 'A bowl of fresh water and a match for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'An oil lamp, candle or electric candle for the hearth' },
          { name: 'A little olive oil' },
          { name: 'A small piece of bread or something from your next meal' },
          { name: 'A dish for the offering', ref: 'traditional/vessel/dish' },
          { name: 'A bay leaf', ref: 'traditional/herb/bay', optional: true },
        ],
        preparation:
          'Clean the hearth spot and wipe the table or counter around it. Set out the lamp, the dish, the bread and the oil. Wash your hands. If you can, do this just before a meal, so the offering comes from food you are about to eat.',
        steps: [
          {
            title: 'Make khernips',
            instructions:
              'Strike the match, plunge it into the water, and wash your hands in it. A few drops on your face as well.',
            spoken: 'Clean hands for a clean hearth.',
          },
          {
            title: 'Light the hearth',
            instructions:
              'Light the lamp or candle. If you are using an oil lamp, add a few drops of olive oil first. Look into the flame for a moment.',
            spoken: 'Hestia, eldest and youngest, fire at the centre: this is your hearth.',
            light: true,
          },
          {
            title: 'Introduce yourself',
            instructions: 'Stand or sit before the flame, hands open. Speak simply, as if to a respected elder of the family.',
            spoken:
              'I am [your name], and this is my home. I want to learn to keep you as the old households did: first and last, morning and evening. Be welcome here.',
            minutes: 2,
          },
          {
            title: 'First and last',
            instructions:
              'Break off the first small piece of the bread and set it on the dish for her. If you have oil, let a drop fall on it. Then eat your meal, or sit a few minutes in quiet. When you finish, give her the last small portion too, beside the first.',
            spoken: 'To you first. And to you last.',
            minutes: 5,
          },
          {
            title: 'Close',
            instructions: 'Thank her and put out the flame, or leave the electric candle on if you keep it as a constant light.',
            spoken: 'Thank you, Hestia. Keep this house.',
            snuff: true,
          },
        ],
        closing:
          'Hestia is not an underworld goddess, and her offerings were never treated as untouchable. The old proverb about her suggests the household kept and ate what was offered at the hearth. Many Hellenists today leave the bread on the shrine for a while and then compost it or put a crumb out for birds; others eat it with the meal. Either is fine; choose one and keep to it. Write a few lines about the place you chose and how it felt to light it.',
        safety:
          'Never leave a flame unattended, and keep it clear of cupboards, curtains, tea towels and cooking. Keep oil lamps on a stable, heatproof surface. Put food offerings out of reach of pets, and do not leave bread out for birds in large amounts.',
      },
    },
    {
      kind: 'study',
      title: 'Learning the hearth',
      intro:
        'Ten days of reading. You will learn who Hestia is in the poems, how the hearth worked in Greek houses and cities, how Rome kept Vesta, and how people honour her today.',
      days: 10,
      lessons: [
        {
          id: 'hestia-who',
          title: 'Eldest, youngest, and the centre of the house',
          summary: 'Hestia’s birth, her oath, her place, and why she has so few stories.',
          minutes: 6,
          sections: [
            {
              heading: 'The firstborn swallowed, the last released',
              body: `Hesiod lists Hestia first among the children of Kronos and Rhea, before Demeter, Hera, Hades, Poseidon and Zeus. Kronos, afraid of being overthrown, swallowed each child at birth. When Zeus forced him to bring them back up, they came out in reverse order, so Hestia, swallowed first, was released last. The Greeks enjoyed the riddle: she is both the eldest and the youngest of the Olympian generation.

That double place matters for her worship. She comes first and last in every offering, just as she came first and last out of Kronos. It is a story that explains a custom.`,
            },
            {
              heading: 'The oath',
              body: `The Homeric Hymn to Aphrodite, from around the seventh century BCE, names three goddesses whose hearts Aphrodite cannot bend: Athena, Artemis and Hestia. Poseidon and Apollo both wanted to marry Hestia, but she refused, touched the head of Zeus and swore a great oath to remain a maiden all her days.

The hymn then says what she got instead: “she has her place in the midst of the house and has the richest portion.” In all the temples she has a share of honour, and among mortals she is “chief of the goddesses.” Her refusal is not an absence. She chose the centre over marriage, and the centre was given to her.`,
            },
            {
              heading: 'A goddess with almost no myths',
              body: `Hestia appears in very few stories. Plato, in the Phaedrus, imagines the gods riding out across the heavens in procession while Hestia alone stays at home in the house of the gods. The Roman poet Ovid tells a comic tale in which the rustic god Priapus tries to approach the sleeping Vesta and is foiled when a donkey brays and wakes everyone, which is why donkeys were garlanded at the Vestalia.

That is almost all. You will read online that Hestia gave up her throne on Olympus to make room for Dionysus. That story comes from Robert Graves’ The Greek Myths (1955); no ancient source tells it. The truth is plainer and more interesting: Hestia does not travel, quarrel or fall in love. She stays, and because she stays, the house is a house.`,
            },
            {
              heading: 'The fire itself',
              body: `Greeks rarely made statues of Hestia. When they did, she was a veiled, seated woman. More often the fire itself was her presence, and the word hestia simply meant the hearth. When you light a lamp for her you are not lighting a candle in front of the goddess; in the old way of seeing, the lit hearth is where she is.`,
            },
          ],
          knowAndDont: {
            known:
              'Hesiod’s Theogony and the Homeric Hymn to Aphrodite give her birth, oath and place. Plato’s Phaedrus has her remaining at home. Images of her are rare, and the hearth itself was treated as her presence.',
            unknown:
              'We know little about what individual Greeks felt toward her, because household religion was rarely written down. The story of her giving her seat to Dionysus is modern. Ovid’s Priapus tale is told of the Roman Vesta, not the Greek Hestia.',
          },
          inPractice:
            'Many Hellenists keep a lamp or candle as the household hearth and treat lighting it as greeting Hestia herself. Some keep a small veiled figure; most keep only the flame.',
          reflect: [
            'What does it mean to you that her honour comes from staying rather than going?',
            'Who or what is the steady centre in your own life?',
          ],
          further: [
            'Homeric Hymn to Aphrodite (V), lines 21–32, trans. H. G. Evelyn-White (1914)',
            'Plato, Phaedrus 247a',
            'Ovid, Fasti 6.249–468, on Vesta',
          ],
          library: ['traditional/deity/hestia', 'traditional/deity/vesta'],
        },
        {
          id: 'hestia-worship',
          title: 'First and last: the hearth in Greek life',
          summary: 'How the household and the city honoured Hestia, and what “first and last” really meant.',
          minutes: 7,
          sections: [
            {
              heading: 'First and last',
              body: `A short Homeric hymn to Hestia (number 29) puts her custom plainly: “For without you mortals hold no banquet,—where one does not duly pour sweet wine in offering to Hestia both first and last.” At a Greek meal or rite, the first drops of wine poured to the gods went to Hestia, and so did the last.

The proverb “to begin from Hestia” (aph’ Hestias archesthai) meant to start at the proper place, as we might say “start at the beginning.” In practice, Hellenic polytheists today still begin every ritual by naming Hestia and giving her a little, and end the same way, whichever other god the rite is for.`,
            },
            {
              heading: 'The household hearth',
              body: `The hearth was where a household became a household. A few days after birth, a baby was carried around the hearth at a run in a ceremony called the Amphidromia, and named. A new bride, or a new member of the household, was welcomed at the hearth with a shower of nuts, dried figs and sweets, the katachysmata. A stranger who sat down at the hearth as a suppliant was under the protection of the gods.

So Hestia guarded belonging. To be received at someone’s hearth was to be received into their care. That is why hospitality is close to her heart, along with Zeus Xenios, protector of guests.`,
            },
            {
              heading: 'The hearth of the city',
              body: `Every Greek city had a common hearth, usually in the prytaneion, the building where the city’s officials met and honoured guests were fed. Its fire was kept burning. When a city sent out colonists, they carried fire from that hearth to light the hearth of the new city, so the daughter city shared its mother’s fire.

In Athens, Hestia was also honoured in the council house as Hestia Boulaia, of the council. At Delphi her hearth in Apollo’s temple was thought of as a common hearth for all Greece: the hymn to Hestia (number 24) pictures her tending “the holy house of the lord Apollo.”`,
            },
            {
              heading: 'What was offered',
              body: `Hestia shared in sacrifices rather than having many of her own, and she received small, everyday things: wine and water poured on the hearth, a little of the meal, incense, olive oil for lamps. Ancient proverb collections and the Byzantine lexicon called the Suda record a saying, “to sacrifice to Hestia,” used of a stingy person who shares nothing, because, they explain, nothing from a sacrifice to Hestia was given away to anyone outside. That tells us something practical: what was offered at her hearth stayed in the house, and was most likely eaten by the household itself. She is the goddess of the ordinary offering made well, every day.`,
            },
          ],
          knowAndDont: {
            known:
              'The first and last libation is stated in the Homeric Hymn to Hestia, and the proverb about beginning from her is well attested. The Amphidromia, katachysmata, the prytaneion fire and colonists carrying fire are described in ancient sources and scholarship.',
            unknown:
              'We do not know the exact words of household prayers to Hestia; few were written down. Details such as the day of the Amphidromia (fifth, seventh or tenth) vary in the sources. Whether every household kept a continuous fire is unlikely; most relit the cooking fire daily.',
          },
          inPractice:
            'At every rite you perform, whoever it is for, begin by lighting a flame and pouring or setting aside a little for Hestia, and end the same way. At home meals, set aside the first bite or the first drops of a drink. Use the app’s Khernips and Libation working for the basic pattern.',
          reflect: [
            'Who has been received at your hearth? Who received you?',
            'What would beginning from Hestia change in how you start your day?',
          ],
          further: [
            'Homeric Hymns XXIV and XXIX to Hestia, trans. H. G. Evelyn-White (1914)',
            'Walter Burkert, Greek Religion (1985), on the hearth',
            'Jon D. Mikalson, Ancient Greek Religion (2010)',
          ],
          library: ['traditional/deity/hestia', 'traditional/deity/hermes', 'traditional/deity/apollo'],
          premade: ['folk-khernips-libation', 'kitchen-family-meal-blessing'],
        },
        {
          id: 'hestia-vesta',
          title: 'Vesta: Rome’s fire',
          summary: 'Rome’s goddess of the hearth, her Vestals and festival, and how she differs from Hestia.',
          minutes: 6,
          sections: [
            {
              heading: 'A cousin, not a copy',
              body: `Rome had its own hearth goddess, Vesta. Her name is probably related to Hestia’s, but her worship grew in its own way. Where Hestia was honoured in every Greek house and town hall, Vesta’s state cult centred on one small round temple in the Roman Forum, where a fire burned that was never meant to go out. It was renewed each year on 1 March, the old Roman new year.

The Romans believed the safety of the city was tied to that fire. If it went out, it was a terrible omen, and the priestess responsible was punished.`,
            },
            {
              heading: 'The Vestal Virgins',
              body: `Six priestesses, the Vestal Virgins, tended Vesta’s fire. They were chosen as girls and served for thirty years, sworn to chastity, with great honours and legal privileges. They made the mola salsa, salted flour, used to sprinkle sacrificial animals across Roman religion.

The Vestals’ discipline was severe. A Vestal found guilty of breaking her vow could be buried alive. That history is real and should be named honestly. It is part of why many modern devotees love Vesta’s faithfulness and also reject the punishment that guarded it.`,
            },
            {
              heading: 'The Vestalia',
              body: `Vesta’s festival, the Vestalia, ran from 7 to 15 June, with its main day on 9 June. Her storehouse was opened to married women, who came barefoot with offerings. Bakers and millers rested, and the donkeys who turned the mill stones were hung with garlands and loaves. At the end, the temple was swept and the sweepings carried to the Tiber.

At home, Romans honoured Vesta at the hearth along with the Lares and Penates, the household spirits, with a little salted meal or a share of the meal thrown on the fire.`,
            },
            {
              heading: 'Keeping them distinct',
              body: `If you honour Hestia, you can also keep the Vestalia, and many people do. It helps to remember which is which. Greek Hestia: every hearth, first and last libation, few rules, no priesthood of virgins. Roman Vesta: the eternal flame of the state, the Vestals, salted meal, June festival. Both are hearth goddesses, and both are about keeping the centre alive.`,
            },
            {
              heading: 'Covering the head, and the exact words',
              body: `If you do keep a Roman rite for Vesta, keep the Roman manners too. Romans prayed with the head covered by a fold of the toga or a scarf, capite velato, and they cared about getting the words right: a prayer stumbled over was begun again. Vesta was named last in many Roman prayers, as Janus was named first, a mirror of Hestia’s first-and-last place in Greek rites.

Greek prayer, by contrast, was usually made bareheaded, with hands raised. Small differences like these are how practitioners show which tradition they are standing in. Neither is wrong; mixing them carelessly can just blur two living traditions into one.`,
            },
          ],
          knowAndDont: {
            known:
              'Ovid’s Fasti book 6 describes the Vestalia and the garlanded donkeys; ancient writers describe the Vestals, the mola salsa and the renewal of the fire on 1 March. The link between the names Hestia and Vesta is widely accepted.',
            unknown:
              'How far Vesta was originally the same goddess as Hestia is debated. We know far more about Vesta’s state cult than about ordinary Roman households’ prayers to her.',
          },
          inPractice:
            'Roman polytheists today honour Vesta at the household shrine with salted flour or a share of the meal and keep the Vestalia in June. Hellenists usually keep Hestia without the Roman forms, though many acknowledge Vesta’s festival.',
          reflect: [
            'What would it mean to tend a fire on behalf of others?',
            'How do you hold the beauty of the Vestals’ devotion alongside the cruelty of their punishment?',
          ],
          further: ['Ovid, Fasti book 6', 'Mary Beard, John North and Simon Price, Religions of Rome (1998)'],
          library: ['traditional/deity/vesta', 'traditional/deity/hestia'],
          premade: ['folk-vestalia-hearth', 'folk-lararium-offering'],
        },
        {
          id: 'hestia-today',
          title: 'Hestia today, and your hearth shrine',
          summary: 'How Hellenic and other Pagans keep Hestia now, how to set up her hearth, and what to call her.',
          minutes: 6,
          sections: [
            {
              heading: 'The daily lamp',
              body: `In modern Hellenic polytheism, Hestia is the most constant presence in household worship. Many people light a lamp or candle for her each morning and say a short prayer, then light it again in the evening, often before any other offering. Some keep an electric flame burning all the time as a perpetual hearth.

Eclectic Pagans and witches honour her too, often as a goddess of home, kitchen witchcraft and hospitality. Both groups agree on the essentials: she is honoured often, simply and at home.`,
            },
            {
              heading: 'Setting up the hearth shrine',
              body: `Place her shrine in the kitchen or wherever the household eats. You need a flame (an oil lamp, a candle in a deep glass, or an electric candle), a small dish for offerings and a little olive oil. That is a complete shrine. Some people add a veiled figure, a small bowl of salt and a sprig of bay.

If you have a main household shrine for several gods, Hestia’s flame usually stands at its centre or at its front, so that you begin with her. Keep it clean. A clean kitchen and a welcoming table are themselves offerings to her.`,
            },
            {
              heading: 'Names to use',
              body: `Hestia has fewer epithets than most gods, and you can call her simply by name. Old titles include Boulaia, of the council; Prytaneia, of the town hall; and the hymns’ descriptions: eldest, “chief of the goddesses,” “worshipful and dear.” Many people add their own: keeper of the house, fire at the centre.

The hymn to Hestia (29) also pairs her with Hermes, asking them both to dwell in the house together, because Hestia keeps the centre and Hermes guards the comings and goings. Some modern households honour them as a pair.`,
            },
            {
              heading: 'Offering well',
              body: `The manner matters more than the thing. Offer before you eat, not after you are full. Give the first, not the leftovers, except for the last portion, which is also hers. Say her name. If you are honouring other gods, give her the first drops, then theirs, then hers again to close.`,
            },
            {
              heading: 'Hospitality as worship',
              body: `The Greeks called the bond between host and guest xenia, and broke it at their peril: the whole Trojan War began when Paris abused the hospitality of Menelaus. Zeus guarded the guest, and Hestia was the place where the guest was received.

So a modern devotion to Hestia often reaches beyond the shrine. Feeding a friend, making space at the table for someone who has nowhere to go at a holiday, keeping a spare blanket and a kettle ready: all of these honour her. You do not need a big house. A cup of tea given with full attention is hearth-work.`,
            },
          ],
          knowAndDont: {
            known:
              'Her epithets Boulaia and Prytaneia are attested in Athenian contexts. The pairing with Hermes is in Homeric Hymn 29. Daily household worship was central to Greek religion.',
            unknown:
              'Modern Hellenic practices such as morning and evening lamp-lighting are reconstructions, reasonable but not proven to have been universal. Colour and crystal correspondences for her are modern.',
          },
          inPractice:
            'Set up your hearth shrine this week: flame, dish, oil. Begin lighting it morning and evening. When you cook, set the first small portion aside for her.',
          reflect: ['What would make your kitchen feel like a hearth rather than just a room?', 'How do you welcome guests, and how would you like to?'],
          further: [
            'Homeric Hymn XXIX to Hestia and Hermes',
            'Drew Campbell, Old Stones, New Temples (2000)',
            'Christos Pandion Panopoulos and others of the Labrys community, Hellenic Polytheism: Household Worship (2014)',
          ],
          library: ['traditional/deity/hestia', 'traditional/herb/bay', 'traditional/crystal/carnelian'],
          premade: ['kitchen-hearth-blessing', 'kitchen-housewarming-blessing'],
        },
      ],
      practices: [
        {
          id: 'hestia-study-first-last',
          title: 'First and last at the table',
          instructions:
            'At one meal each day of this stage, set aside the first bite and the last for Hestia, with a word of thanks.',
          times: 10,
          every: 'day',
          prompt: 'What changed in how you ate, knowing the first and last were hers?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine days of the lamp',
      intro:
        'Hestia is honoured daily, so this stage asks for nine days of morning and evening lighting. Then a lesson on her days, offerings, and the questions people struggle with.',
      days: 11,
      lessons: [
        {
          id: 'hestia-days-offerings',
          title: 'Her days, her offerings, and the quiet questions',
          summary: 'The monthly days she shares, what to give, fire safety, and the honest difficulties of a domestic goddess.',
          minutes: 7,
          sections: [
            {
              heading: 'A goddess of every day',
              body: `Hestia had no great Athenian festival of her own. Her worship ran through everything else. Still, the monthly days of the Greek calendar suit her well. The Deipnon at the month’s end is a day for cleaning the house; the Noumenia, the first day of the new month, is when the household gods are honoured and the hearth can be relit with prayer; modern Hellenists keep the second day for the Agathos Daimon, the good spirit of the house.

Many Hellenists clean the hearth shrine on the Deipnon, replace the oil or candle, and relight it on the Noumenia. That gives a monthly renewal to a daily practice. The Roman Vestalia in June is the nearest thing to a yearly festival, and many Hestia devotees keep it.`,
            },
            {
              heading: 'What to give',
              body: `Traditional offerings are simple: olive oil, wine, water, bread, incense, and the first and last of any meal. Fruit and honey are fine. Since she shares in every offering, you do not need to buy anything special. A little of what you cook is exactly right.

What happens to the food afterwards differs among modern practitioners. Many leave it on the shrine for a while, then put it outside or in the compost. Others share bread offered to Hestia at the family table, which fits the ancient proverb that nothing from her sacrifice left the house. Choose one way and keep it consistently.`,
            },
            {
              heading: 'Fire safety is devotion',
              body: `A goddess of the hearth is not honoured by a house fire. Never leave a flame burning when you leave the room or go to sleep. Use deep glass holders, stable lamps and a heatproof surface, away from curtains, shelves and tea towels. Keep cats, who love warm places, and children well away. An electric candle or a pilot light on the stove is a perfectly good hearth. Many devotees keep a real flame only while they are praying and an electric one the rest of the time.`,
            },
            {
              heading: 'The quiet questions',
              body: `Some people find Hestia hard to love at first. She has no adventures. She can look like a symbol of women kept at home. It is worth knowing that in ancient Greece her hearth belonged to the whole household and to the whole city, men and women, citizens and guests, and that the city’s fire was kept by its officials.

Her virginity, too, was about independence: she chose not to belong to a husband’s household, and so she belonged at the centre of every household. Today people living alone, in shared flats or in families of every shape honour her. The centre is wherever you make it.`,
            },
          ],
          knowAndDont: {
            known:
              'The Deipnon and Noumenia are attested for Athens; a fixed second-day observance for the Agathos Daimon is a modern Hellenic convention built on his ancient household cult. Hestia’s share in all sacrifices and her lack of a great Athenian festival are well established.',
            unknown:
              'Relighting the hearth on the Noumenia is a modern Hellenic custom built on ancient patterns, not a rule we can trace. The proverb “to sacrifice to Hestia” implies her offerings stayed in, and were eaten by, the household, but practice probably varied.',
          },
          inPractice:
            'Mark the Deipnon and Noumenia in your calendar. On the Deipnon, clean the hearth shrine. On the Noumenia, relight it with a short prayer and a drop of oil. If June comes during your journey, keep the Vestalia with the premade working.',
          reflect: ['What does the centre of your life look like now? Is it the centre you would choose?', 'How do you feel about honouring a goddess of the ordinary?'],
          further: ['Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year (1975)'],
          library: ['traditional/deity/hestia', 'traditional/deity/vesta'],
          premade: ['folk-noumenia-blessing', 'folk-vestalia-hearth', 'kitchen-sweeping-out-the-old'],
        },
      ],
      practices: [
        {
          id: 'hestia-nine-days',
          title: 'Nine days of the lamp',
          instructions:
            'For nine days, light Hestia’s flame each morning before anything else, say her name and one sentence of greeting, and let a drop of oil or water fall on her dish. In the evening, light it again, tell her one thing about the day in the house, and put it out with thanks. Keep it to a few minutes; steadiness matters more than length.',
          times: 9,
          every: 'day',
          prompt: 'How did the day go differently when it began and ended at the hearth?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Sitting by the fire',
      intro: `Take a few days to sit with what this month has been. Hestia’s devotion is small and daily, and its question is simple: is this something you want to keep doing for a long time?

Stopping here is a good outcome. So is honouring her as part of a wider household practice without a dedication, or turning to another god or path. Every Greek household honoured Hestia without dedicating to her. You can too.`,
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'hestia-discern-sit',
          title: 'An evening by the flame',
          instructions:
            'One evening, sit with Hestia’s flame for fifteen minutes without your phone. Ask yourself the questions below and let the answers come slowly.',
          times: 1,
          prompt: 'What did the quiet show you?',
        },
      ],
      questions: [
        'Did the daily lamp feel like a gift or a chore by the end of the nine days?',
        'Can I keep a safe flame or light in my home, given who and what I live with?',
        'Do I want Hestia as my central goddess, or as the first and last of a wider practice?',
        'Am I drawn to her for herself, or because she seems an easy place to start? Both are fine, but which is it?',
        'What would I lose, and what would I keep, if I simply went on lighting the lamp without a formal dedication?',
      ],
    },
    {
      kind: 'dedication',
      title: 'Dedication at the hearth',
      intro: `If you have chosen to go on, make your dedication on a Noumenia, the first evening of a new lunar month, or at a household meal you cook yourself. This is a self-dedication: your own promise, in your own home. It is not an initiation and makes you no priestess. Traditions with priesthoods or initiations keep their own rites, and this does not stand in for them.

Ancient Greeks honoured many gods, and Hestia in particular is honoured alongside all of them. Dedicating to her does not close any other door.`,
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Hestia',
        summary:
          'Clean and purify the home, relight the hearth, cook or prepare a small meal, make your promise before the flame and give her the first and last.',
        minutes: 45,
        ingredients: [
          { name: 'A bowl of fresh water and a match for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A new candle or fresh oil and wick for the hearth lamp' },
          { name: 'Olive oil' },
          { name: 'A small meal you have prepared, with bread' },
          { name: 'A cup of wine, juice or water' },
          { name: 'A pinch of salt', optional: true },
          { name: 'Frankincense or a bay leaf to burn', ref: 'traditional/herb/frankincense', optional: true },
          { name: 'Your written promise' },
        ],
        preparation:
          'During the day, clean the kitchen and the hearth shrine thoroughly. Put in a new candle or fresh oil. Write a short promise: for example, to light her flame each day, to give her first and last, to keep a welcoming home, to renew the hearth each Noumenia. Prepare a simple meal. Wash and dress in clean clothes.',
        steps: [
          {
            title: 'Purify the house',
            instructions:
              'Make khernips by quenching the match in the water. Wash your hands, then walk through the main room sprinkling a few drops in each corner.',
            spoken: 'Clean water for a clean house. Be gone, all that is unclean.',
          },
          {
            title: 'Relight the hearth',
            instructions: 'Light the new flame. Let a drop of oil fall on the dish. If you have incense, add it now.',
            spoken: 'Hestia, eldest and youngest, chief of the goddesses, worshipful and dear: your fire is lit again.',
            light: true,
          },
          {
            title: 'The first portion',
            instructions: 'Pour the first drops of the cup onto her dish and set the first piece of bread beside it.',
            spoken: 'To you first, as always.',
          },
          {
            title: 'Make your promise',
            instructions: 'Stand before the flame with open hands and read your promise aloud.',
            spoken: 'Before your fire I make this promise freely. Keep the centre of this house, and keep me steady at it.',
            minutes: 2,
          },
          {
            title: 'Eat at her hearth',
            instructions: 'Sit and eat your meal by the flame, slowly. This is a shared table; let it be warm.',
            minutes: 15,
          },
          {
            title: 'The last portion',
            instructions: 'Give her the last drops and the last piece of bread, and thank her.',
            spoken: 'To you last, as always. Thank you, Hestia.',
            snuff: true,
          },
        ],
        closing:
          'Leave the offerings on the shrine overnight if it is safe, then put them outside or in the compost. Keep your promise by the hearth. Write in your journal what you promised and how the meal felt.',
        safety:
          'Never leave the flame unattended; put it out before bed. Keep candles and incense away from cooking, curtains and tea towels, and from pets and children. Use a little incense only, with a window open.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the fire',
      intro: `Your devotion now lives in the day and the month. Light her flame morning and evening, or as often as you can. Give her the first and the last. On the Deipnon, clean the hearth; on the Noumenia, relight it. Keep the Vestalia in June if you like, as many do.

Once a year, on the Noumenia nearest your dedication, cook a meal, read your promise again and renew it, change it or set it down with thanks. If you lapse for days or months, simply light the flame and say her name. The hearth is always there to come back to.`,
      days: 30,
      lessons: [],
      practices: [
        {
          id: 'hestia-ongoing-daily',
          title: 'Morning and evening lamp',
          instructions: 'Light her flame, say her name and a sentence of greeting, morning and evening.',
          times: 30,
          every: 'day',
        },
        {
          id: 'hestia-ongoing-noumenia',
          title: 'Renew the hearth each month',
          instructions: 'Clean the hearth on the Deipnon and relight it on the Noumenia with oil and a short prayer.',
          times: 12,
          every: 'month',
          premade: 'folk-noumenia-blessing',
          prompt: 'What did the house hold this month?',
        },
        {
          id: 'hestia-ongoing-rededicate',
          title: 'Yearly rededication',
          instructions: 'On the Noumenia nearest your dedication date, repeat the dedication meal with a renewed promise.',
          times: 1,
          every: 'month',
          prompt: 'How has the centre of your home changed this year?',
        },
      ],
    },
  ],
  sources: [
    'Homeric Hymn XXIX to Hestia, trans. H. G. Evelyn-White (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (quoted: “For without you mortals hold no banquet,—where one does not duly pour sweet wine in offering to Hestia both first and last”)',
    'Homeric Hymn V to Aphrodite, lines 21–32, trans. H. G. Evelyn-White (1914), Project Gutenberg #348 (quoted: “she has her place in the midst of the house and has the richest portion”; “chief of the goddesses”)',
    'Homeric Hymn XXIV to Hestia, trans. H. G. Evelyn-White (1914), Project Gutenberg #348 (quoted: “the holy house of the lord Apollo”)',
    'Hesiod, Theogony 453–500',
    'Plato, Phaedrus 247a',
    'Ovid, Fasti books 3 and 6',
    'Zenobius 4.44 and the Suda, s.v. “Histia,” on the proverb “to sacrifice to Hestia”',
    'Walter Burkert, Greek Religion (1985)',
    'Jon D. Mikalson, Ancient Greek Religion (2010)',
    'Robert Graves, The Greek Myths (1955), as the source of the modern Dionysus seat story',
  ],
};
