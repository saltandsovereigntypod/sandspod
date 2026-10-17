import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-vesta',
  kind: 'deity',
  paths: ['roman'],
  deityRef: 'traditional/deity/vesta',
  title: 'Vesta of the Hearth',
  summary:
    'A month with Vesta, the living flame at the centre of Rome and of every Roman house: the hearth, the Vestals, mola salsa, the Vestalia, and the quiet daily care that was her worship.',
  welcome:
    'This journey runs about a lunar month and happens mostly in your kitchen. You will learn who Vesta was, how the Vestal Virgins kept her fire and made the city\'s sacred salted flour, how households honoured her at the hearth, and how people keep her today. There is a nine-night practice of tending, and at the end a self-dedication.\n\nIt is a self-dedication, not an initiation, and it does not make you a Vestal. The Vestals were a public priesthood of six chosen women; no one has held the office since the late fourth century, and modern groups that revive priesthoods have their own processes. What remains open to everyone is the household hearth, which is where most Romans met Vesta anyway.',
  about:
    'Vesta is the Roman goddess of the hearth and its fire. In her round temple in the Forum there was no statue: the fire itself was the goddess, tended day and night by the Vestal Virgins, and the Romans believed the city\'s safety depended on it never going out. In every house the hearth was hers too, swept clean, garlanded on holy days, and given a share of the meal. She has almost no mythology; the Greeks matched her with Hestia, who is similarly quiet. Her worship is care: cleanliness, continuity, a fire tended and not neglected. Modern Roman polytheists keep a lamp or candle for her, give her a portion of food and the last word in prayer, and celebrate the Vestalia in June.',
  notes: [
    'Never leave a flame burning unattended to imitate the "eternal fire". Vesta\'s fire was sacred because it was tended. Relight a lamp each day, or use a safe electric light between prayers.',
    'The Vestals were punished brutally if they let the fire go out or were accused of breaking their vow of chastity, including being buried alive. The journey explains this honestly; it is part of the history, not something to romanticise.',
    'The Roman sources disagree about Vesta\'s place in prayer: Cicero says every prayer ends with her, while Ovid says Romans address her first, in the opening. Janus is also called first. Greek practice gave Hestia the first and last share. The journey explains each, and lets you choose.',
    'Modern Roman polytheism is small and varied. This app is inclusive: you do not need to be a woman, unmarried or celibate to honour Vesta at your own hearth.',
  ],
  holyDays: ['vestalia'],
  stages: [
    {
      kind: 'threshold',
      title: 'Lighting the hearth',
      intro:
        'Begin by cleaning your hearth (for most of us, the stove) and lighting a small flame beside it. This opening rite follows the Roman form and Cato\'s advice to the farm housekeeper: a clean hearth, swept round, and a garland on holy days.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'vesta-sweep',
          title: 'Sweep around the hearth',
          instructions:
            'Each night of these two days, before bed, wipe the stovetop and sweep the floor around it. Cato told the farm housekeeper to keep the hearth clean and swept all round every day before she went to bed (On Agriculture 143).',
          times: 2,
          every: 'day',
          prompt: 'How did it feel to treat a household chore as devotion?',
        },
      ],
      rite: {
        title: 'Greeting Vesta',
        summary: 'Clean the hearth, light a lamp beside it, Janus first, then incense, mola salsa and a few words to Vesta.',
        minutes: 25,
        ingredients: [
          { name: 'Cleaning cloth, warm water and a pinch of salt' },
          { name: 'A bowl of clean water and a towel for your hands', ref: 'traditional/vessel/bowl' },
          { name: 'A head covering' },
          { name: 'An oil lamp or white candle in a stable holder', ref: 'traditional/candle/white' },
          { name: 'Mola salsa: a spoonful of plain or spelt flour mixed with a pinch of salt, in a small dish', ref: 'traditional/vessel/dish' },
          { name: 'Frankincense, a few grains', ref: 'traditional/herb/frankincense' },
          { name: 'An incense burner', ref: 'traditional/tool/incense_burner' },
          { name: 'A sprig of bay', ref: 'traditional/herb/bay', optional: true },
        ],
        preparation:
          'Clear and clean the stove or hearth properly. Set a heatproof tile beside it (not on a hot burner) for the lamp. Make the mola salsa. Read the words through until you can say them without stumbling.',
        steps: [
          {
            title: 'Clean',
            instructions: 'Wipe the hearth with warm salted water. Take your time. This is the first offering.',
            minutes: 5,
          },
          {
            title: 'Wash and veil',
            instructions: 'Wash your hands in clean water and dry them. Cover your head with a fold of cloth, as Romans did to pray.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the incense and give a few grains to Janus, the god called first.',
            spoken: 'Father Janus, opener of the way,\nbe honoured by this incense.',
          },
          {
            title: 'Light Vesta\'s flame',
            instructions: 'Light the lamp or candle by the hearth. Lay the bay beside it.',
            spoken: 'Vesta, living flame, fire of the hearth,\nor by whatever name it is right to call you:\nyou are here, in this light.\nBe honoured by this incense.',
            light: true,
          },
          {
            title: 'Mola salsa',
            instructions: 'Sprinkle a pinch of mola salsa onto a small clean dish beside the flame (not into the flame itself).',
            spoken: 'Vesta, be honoured by this salted grain.\nKeep this house warm, fed and whole.',
          },
          {
            title: 'Keep company',
            instructions: 'Sit by the flame for a few minutes in silence. Vesta\'s worship is mostly quiet attendance.',
            minutes: 4,
          },
          {
            title: 'Close',
            instructions: 'Name Vesta once more, last, as Roman prayer ended with her. Turn to your right, uncover your head, and put out the flame.',
            spoken: 'Vesta, last as always: thank you.',
            snuff: true,
          },
        ],
        closing: 'Leave the mola salsa on its dish until the next day, then sprinkle it outdoors or put it in the compost. Keep the dish just for her.',
        safety:
          'Never leave the lamp or candle unattended, and never place it on or next to a lit burner, under cupboards, or near tea towels and curtains. Use a heatproof tile. Keep incense smoke away from birds and anyone with asthma. Salt is harmful to pets in quantity; keep the dish out of reach.',
      },
    },
    {
      kind: 'study',
      title: 'The living flame',
      intro:
        'Five lessons, about two days each: who Vesta is; the temple and the Vestals; mola salsa, the Vestalia and the Roman year; the household hearth and how to keep her today; and the hard parts.',
      days: 10,
      lessons: [
        {
          id: 'vesta-who',
          title: 'Who Vesta is',
          summary: 'A goddess with no statue and almost no myths, whose image was the fire itself.',
          minutes: 6,
          sections: [
            {
              heading: 'The fire is the goddess',
              body:
                'Ovid, writing about Vesta\'s festival, admits he once thought her temple held a statue. Then he learned there was none: "effigiem nullam Vesta nec ignis habet", "Vesta has no image, nor does fire" (Fasti 6.298). A few lines earlier he puts it plainly: "nec tu aliud Vestam quam vivam intellege flammam", "understand Vesta to be nothing other than the living flame" (Fasti 6.291).\n\nThat is the heart of her. Statues of Vesta did exist, seated and veiled, in other places and in the Vestals\' house next door. But in her own temple she was present as fire. To honour her you do not need an image at all: a lamp, a candle, the flame of your stove.',
            },
            {
              heading: 'A quiet goddess',
              body:
                'Vesta has almost no stories. Greek writers matched her with Hestia, the hearth goddess who, in Greek myth, stayed home on Olympus while the other gods travelled and quarrelled. The match is good: both are virgin goddesses of the hearth, both receive a share of every offering, and neither has much of a mythology.\n\nThe one well-known Roman tale is Ovid\'s: at a feast of the gods, the god Priapus crept up on Vesta as she slept, meaning to assault her, and the braying of a donkey woke her in time (Fasti 6.319–348). For that reason donkeys were garlanded at her festival. The story is about a goddess who is not to be violated; you can know it without dwelling on it.',
            },
            {
              heading: 'What she stands for',
              body:
                'Romans thought of Vesta as the centre: the fire at the middle of the house that made it a home, and the fire at the middle of the city that made Rome Rome. Ovid connects her name, fancifully, with standing by her own power (vi stando). Cicero says her power concerns altars and hearths, and that she is the guardian of the innermost things, which is why, he says, every prayer and sacrifice ends with her (On the Nature of the Gods 2.67).\n\nIn practice she stands for continuity, warmth, a clean and cared-for home, and the daily faithfulness that keeps a household going. Many people find her the easiest of the Roman gods to live with, because her worship fits into ordinary days.',
            },
            {
              heading: 'Her signs',
              body:
                'Her image is the flame, the lamp and the round hearth. Her animal is the donkey, which turned the mills that ground her grain. Her plants are spelt (the ancient wheat used for mola salsa) and laurel: fresh laurel was hung on her hearth each new year. Her offering is salted flour, with clean water, oil and a share of food. White is her colour, from the Vestals\' white robes.',
            },
          ],
          knowAndDont: {
            known:
              'Ovid\'s lines on the imageless temple (Fasti 6.291–298) are explicit, as is Cicero\'s statement that she comes last in prayer (On the Nature of the Gods 2.67), though Ovid elsewhere says she is addressed first. The temple, the Vestals and their house are well attested by literature, coins and archaeology in the Forum.',
            unknown:
              'Ovid\'s etymologies are guesses; the real origin of "Vesta" is uncertain, though it may share a root with Greek Hestia. How individual Romans experienced the hearth goddess day to day is mostly unrecorded.',
          },
          inPractice:
            'Decide what your hearth is: the stove, a fireplace, or, if you have only an electric hob, a lamp in the kitchen. That is where Vesta lives in your home.',
          reflect: [
            'What, for you, is the "centre" of your home?',
            'What does it mean to honour a god through chores and continuity rather than stories?',
          ],
          further: [
            'Ovid, Fasti 6.249–468 (Latin at The Latin Library; Riley\'s 1851 prose translation is public domain)',
            'Robin Lorsch Wildfang, Rome\'s Vestal Virgins (2006)',
          ],
          library: ['traditional/deity/vesta', 'traditional/deity/hestia', 'traditional/herb/bay'],
        },
        {
          id: 'vesta-vestals',
          title: 'The temple and the Vestals',
          summary: 'The round temple, the six priestesses, their privileges and duties, and the new fire of March.',
          minutes: 7,
          sections: [
            {
              heading: 'The round temple',
              body:
                'The temple of Vesta stood at the edge of the Roman Forum, round like the huts of early Latium. Beside it lay the Atrium Vestae, the Vestals\' house, whose ruins and statues of senior Vestals still stand. Inside the temple burned the fire, and behind a screen lay the penus, an inner store of sacred objects. Romans said it held the Palladium, an ancient image of Minerva brought from Troy, on which the safety of the city depended. Only the Vestals entered.\n\nOn the Kalends of March, the old Roman new year, the fire was made new: Ovid says a new fire is kindled in the secret shrine and the flame gathers strength, and fresh laurel replaces the old on her hearth (Fasti 3.141–144). Plutarch says that if the fire went out it had to be relit from the sun, using a burning-mirror, not from an ordinary flame.',
            },
            {
              heading: 'The six',
              body:
                'There were six Vestal Virgins. They were chosen as girls aged between six and ten, from families with both parents living, and taken by the chief priest, the pontifex maximus, with a formula of "taking". They served for thirty years: ten learning, ten performing the rites, ten teaching. After that they could leave and marry, though few did.\n\nTheir duties were the fire, the water and the grain. They tended the flame in shifts. They fetched water from a sacred spring, carrying it in vessels that could not be set down. They made the mola salsa and other sacred preparations used across Roman state religion. They guarded wills and treaties deposited with them.',
            },
            {
              heading: 'Their privileges',
              body:
                'A Vestal was freed from her father\'s legal authority, could own property and make a will, rode in a carriage and was preceded by a lictor, an official attendant. She had a reserved seat at the games. If a condemned man met a Vestal by chance on the way to execution, he was pardoned. Their influence was real: Vestals interceded for people in political trouble, including, the story goes, the young Julius Caesar.\n\nModern people sometimes picture the Vestals as either saints or prisoners. They were neither, quite: they were powerful religious officials whose power rested on strict conditions.',
            },
            {
              heading: 'The end',
              body:
                'The fire burned, with brief interruptions, for about a thousand years. In the late fourth century Christian emperors withdrew public funding from the old cults, and around AD 394 the fire was put out and the order dissolved. One of the last chief Vestals known by name is Coelia Concordia. The ruins of the temple you can see in the Forum today are a partial reconstruction of its last rebuilding.',
            },
          ],
          knowAndDont: {
            known:
              'Aulus Gellius (Attic Nights 1.12) gives the rules for choosing Vestals. Plutarch\'s Life of Numa (9–10) describes the thirty years of service, the relighting of the fire and the Vestals\' privileges. Ovid gives the March new fire. Archaeology confirms the temple and house.',
            unknown:
              'Whether the Palladium really existed in the penus is unknowable; Romans themselves told conflicting stories. Details of the Vestals\' daily routine and inner rites were secret and are lost.',
          },
          inPractice:
            'On the next 1 March (or, for now, the next Kalends), clean your hearth thoroughly, put fresh bay on it, and light a new candle for Vesta from a fresh match: a household version of the new fire.',
          reflect: [
            'What would it mean to keep something going faithfully for thirty years?',
            'What "new fire" do you want to kindle in your home?',
          ],
          further: [
            'Plutarch, Life of Numa 9–11 (public-domain Dryden or Perrin translations; Perrin on LacusCurtius)',
            'Ariadne Staples, From Good Goddess to Vestal Virgins (1998)',
          ],
          library: ['traditional/deity/vesta', 'traditional/deity/minerva', 'traditional/herb/bay'],
        },
        {
          id: 'vesta-mola',
          title: 'Mola salsa and the Vestalia',
          summary: 'The sacred salted flour, the June festival, the donkeys and the cleaning of the temple.',
          minutes: 7,
          sections: [
            {
              heading: 'Salted flour',
              body:
                'Mola salsa, "salted meal", was the most ordinary and most important offering in Roman religion. It was sprinkled on the heads of sacrificial animals and on altars, and the Romans\' own word for sacrificing, immolare, means literally "to put the mola on". The Vestals made it from ears of spelt they harvested themselves in May, roasted and ground, mixed with a salt brine (muries) that they prepared by pounding salt, baking it in a jar and dissolving it.\n\nYou can make a simple household mola salsa: a spoonful of spelt or plain flour, toasted lightly in a dry pan if you like, mixed with a pinch of salt. Keep it in a small jar on the shrine. A pinch is the standard offering to any Roman god, and to Vesta above all.',
            },
            {
              heading: 'The Vestalia',
              body:
                'From 7 to 15 June the penus of Vesta stood open, the only time anyone but the Vestals could enter, and only women. Matrons walked to the temple barefoot, carrying food offerings. The Vestalia proper fell on 9 June. Ovid describes it: "fert missos Vestae pura patella cibos", "a clean little dish carries food sent to Vesta" (Fasti 6.310), and "ecce coronatis panis dependet asellis", "see, bread hangs from garlanded donkeys" (6.311), with flowers draped over the millstones. Millers and bakers kept holiday, and donkeys rested.\n\nThe festival period ended on 15 June, when the temple was cleaned and its sweepings carried down to the Tiber. Calendars mark that day "Q.St.D.F.", quando stercus delatum fas: business is lawful once the dirt has been carried out.',
            },
            {
              heading: 'A time of waiting',
              body:
                'The first half of June was an unlucky, cautious time. Ovid reports the Flaminica Dialis, wife of Jupiter\'s priest, telling him she could not comb her hair, cut her nails or sleep with her husband until the sweepings of Vesta\'s temple had gone down to the river, and that it was not a good time for weddings (Fasti 6.219–234). The house of Rome was, as it were, being cleaned before it could carry on.',
            },
            {
              heading: 'A modern Vestalia',
              body:
                'Today devotees keep 7–15 June as a time for deep-cleaning the kitchen, baking bread, and honouring Vesta daily. On 9 June bake a loaf or simple cakes, give her the first piece on a clean little dish, garland your hearth with flowers or bay, and if you can, give to a food bank or bakery workers\' fund. On 15 June take out the rubbish and clean thoroughly, the household version of carrying the temple\'s dirt to the Tiber.',
            },
          ],
          knowAndDont: {
            known:
              'The Vestals\' making of mola salsa and muries is described by Servius (on Vergil, Eclogues 8.82) and Festus. The Vestalia, the open penus, the barefoot matrons, the donkeys and the 15 June cleaning are described by Ovid (Fasti 6) and marked in surviving calendars.',
            unknown:
              'The exact May harvest days are given differently by different sources. What the matrons brought and did inside the penus is not recorded in detail. The mola salsa recipe above is a household simplification.',
          },
          inPractice:
            'Make a jar of mola salsa this week. Put the Vestalia (7–15 June) in your calendar with the 9th and the 15th marked.',
          reflect: [
            'What would a "cleaning before carrying on" look like in your life right now?',
            'Who are the bakers and millers, the people who feed you, whom you could honour?',
          ],
          further: [
            'Ovid, Fasti 6.249–468 and 6.713–714 (Latin at The Latin Library)',
            'Mary Beard, John North and Simon Price, Religions of Rome (1998), on the Vestals and the calendar',
          ],
          library: ['traditional/deity/vesta', 'traditional/vessel/dish'],
          premade: ['folk-vestalia-hearth'],
        },
        {
          id: 'vesta-home',
          title: 'Vesta at home, then and now',
          summary: 'The household hearth, the share of the meal, Vesta last in prayer, and how to set up her shrine.',
          minutes: 7,
          sections: [
            {
              heading: 'The Roman house',
              body:
                'In early Roman houses the family ate near the hearth, and the hearth (focus) was where the household gods lived: Vesta in the fire, the Lares and Penates beside it. Cato tells the farm housekeeper to keep the hearth clean and swept round every night, and on the Kalends, Nones and Ides and feast days to put a garland on the hearth and pray to the household Lar (On Agriculture 143). At a farmer\'s feast for Jupiter, Cato adds: "Vestae, si voles, dato", "give to Vesta, if you wish" (132).\n\nA small share of food was put on a clean little dish and given to the fire. Ovid says that people once sat on benches before the hearth and believed the gods were at table, and that from that old custom comes the clean little dish of food sent to Vesta (Fasti 6.305–310). It is the simplest Roman devotion there is.',
            },
            {
              heading: 'Last in every prayer',
              body:
                'Roman prayer had an order. Janus came first, as the door. Cicero says that every prayer and every sacrifice ends with Vesta, as the hearth at the centre. But Ovid, half a century later, says the opposite: "inde precando / praefamur Vestam, quae loca prima tenet", "so in praying we address Vesta first, who holds the first place" (Fasti 6.303–304). Practice may have differed by rite or period, or both men may be right about different parts of a ceremony: the opening words and the final offering.\n\nGreek practice gave Hestia the first and the last of every sacrifice, and the Homeric Hymn to Hestia praises her for that honour. Many modern devotees give Vesta both: the first bite of a meal, and the last line of every prayer. This journey follows the common modern Roman pattern of Janus first and Vesta last in prayer, with the first share of food to Vesta at the hearth. Whatever you choose, be consistent.',
            },
            {
              heading: 'Keeping the flame safely',
              body:
                'Modern devotees speak of "keeping Vesta\'s flame", and some talk as though a candle should never go out. Do not do this. The Vestals worked in shifts, awake, beside a hearth built for fire; you are not. A flame left alone in a flat is a danger to you and your neighbours.\n\nInstead, keep continuity the safe way. Light her lamp each day when you are in the kitchen and put it out when you leave. If you want a sense of an unbroken flame, light each day\'s candle from a taper lit at the last one before you put it out, or keep a small electric light on her shrine between prayers. What made the Vestals\' fire holy was attention, and you can keep that.',
            },
            {
              heading: 'Setting up her shrine',
              body:
                'Put it in the kitchen, near the stove but not on it: a shelf, a windowsill, a tile on the counter. You need an oil lamp or candle in a stable holder, a small clean dish for her share of food, a jar of mola salsa, a cup of clean water, and a sprig of bay. A small veiled figure of Vesta, a round dish or a picture of her temple is optional, since she needs no image. Keep it scrupulously clean. Dust and old food on Vesta\'s shrine are worse than having none.',
            },
          ],
          knowAndDont: {
            known:
              'Cato (On Agriculture 132, 143) and Ovid (Fasti 6.305–310) attest the household hearth cult and the food offering. Cicero (On the Nature of the Gods 2.67) puts Vesta last in prayer and Ovid (Fasti 6.303–304) puts her first. The Greek first-and-last custom for Hestia is attested in the Homeric Hymns.',
            unknown:
              'Household practice varied widely across Italy and the empire; in many later houses the kitchen was a slaves\' room and the lararium stood elsewhere, so "the hearth at the centre" is partly an old ideal. Modern flame-keeping customs are modern.',
          },
          inPractice:
            'Set up her shrine this week. From now on, put a small morsel of each main meal on her dish before you eat, and end every prayer to any god with "Vesta, be honoured."',
          reflect: [
            'Where is the centre of your kitchen, and is it clean?',
            'What would change if you gave the first bite of each meal to the hearth?',
          ],
          further: [
            'Cato, On Agriculture 143 (Latin at The Latin Library; Loeb translation on LacusCurtius)',
            'Harriet I. Flower, The Dancing Lares and the Serpent in the Garden (2017)',
          ],
          library: ['traditional/deity/vesta', 'traditional/deity/hestia', 'traditional/tool/altar', 'traditional/candle/white', 'traditional/crystal/carnelian'],
          premade: ['kitchen-hearth-blessing', 'kitchen-family-meal-blessing', 'folk-lararium-offering'],
        },
        {
          id: 'vesta-hard',
          title: 'Purity, punishment and the hard history',
          summary: 'What happened to Vestals who failed, why, and how modern devotees think about chastity and purity.',
          minutes: 6,
          sections: [
            {
              heading: 'The fire going out',
              body:
                'If the fire went out, Romans took it as a terrible omen. The Vestal on duty was flogged by the pontifex maximus, and the fire was rekindled in a special ritual. That is a hard thing to read, and it should be. It tells you how seriously the city took the fire, and how much was laid on the shoulders of a few women.',
            },
            {
              heading: 'Buried alive',
              body:
                'A Vestal accused of breaking her vow of chastity (the charge was called incestum) was condemned to be buried alive in an underground chamber near the Colline Gate, with a lamp and a little food, so that no one would technically kill her. Her alleged lover was beaten to death. Ancient historians record a number of these cases, and they cluster in times of military disaster and panic, such as after the defeat at Cannae in 216 BC.\n\nMany historians read this as scapegoating: when the city felt that its relationship with the gods had broken, someone had to be found responsible, and the women whose bodies stood for Rome\'s purity were the target. Some of the accused were very probably innocent. It is honest to name this cruelty and not to explain it away.',
            },
            {
              heading: 'Purity today',
              body:
                'Vesta herself is a virgin goddess, and her priestesses were virgins. That does not mean her devotees must be. Roman households of every kind honoured her: married women, fathers, children, enslaved cooks. Modern devotees generally understand her "purity" as cleanliness, integrity and wholeness: a clean hearth, honest dealings, a home that is safe for those in it.\n\nIf you are drawn to celibacy for religious reasons, that is your choice to make freely. It is not required, and no one should pressure you about your body in Vesta\'s name.',
            },
            {
              heading: 'What not to do',
              body:
                'Do not leave flames burning unattended. Do not let her shrine get dirty or her dish grow mould: neglect is the one real failing in her worship. Do not throw mola salsa or food into a candle flame; put it on a dish beside it, or into a real fireplace fire. Do not call yourself a Vestal; it was an office, not a feeling. And do not use her name to shame anyone about sex or housekeeping. Her hearth is warmth, not judgement.',
            },
          ],
          knowAndDont: {
            known:
              'Plutarch (Numa 10) and Dionysius of Halicarnassus describe the punishments. Livy (22.57) records the Vestal cases after Cannae. Ancient sources name a number of condemned Vestals across the Republic and empire.',
            unknown:
              'How many accusations were true is unknowable. Scholars debate how to read the Vestals\' sexual status: Mary Beard\'s classic article argued they stood between the categories of maiden and matron. Modern understandings of "purity" in Vesta\'s cult are modern interpretations.',
          },
          inPractice:
            'Look honestly at the "neglect" in your home: the corner, the drawer, the cluttered counter. Choose one to clear this week and offer it to Vesta.',
          reflect: [
            'How do I feel about the Vestals\' story, and can I honour the goddess while grieving what was done in her name?',
            'What does "purity" mean to me, separated from shame?',
          ],
          further: [
            'Mary Beard, "The Sexual Status of Vestal Virgins", Journal of Roman Studies 70 (1980)',
            'Livy 22.57 (public-domain translations on Gutenberg)',
          ],
          library: ['traditional/deity/vesta'],
        },
      ],
      practices: [
        {
          id: 'vesta-first-bite',
          title: 'The share of the meal',
          instructions:
            'Throughout the study stage, before your main meal each day, put a small morsel on a clean little dish by Vesta\'s lamp and say "Vesta, be honoured." Clear it away the next morning, into compost or the bin with thanks.',
          times: 10,
          every: 'day',
          prompt: 'Did I remember? How did it change the meal?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights of tending',
      intro:
        'Nine nights of keeping her flame: clean, light, offer, sit, put out. Roman religion used nine-day periods (a novendiale rite expiated prodigies), but the nine-night frame here is modern. The aim is a habit, the core of her worship.',
      days: 9,
      lessons: [],
      practices: [
        {
          id: 'vesta-nine-nights',
          title: 'Nightly tending',
          instructions:
            'Each night: clean the stovetop and sweep around the hearth (Cato\'s instruction). Wash your hands and cover your head. A grain of incense to Janus. Light Vesta\'s lamp, from the same taper or match box each night if you like the sense of continuity. Sprinkle a pinch of mola salsa on her dish and say a few words of your own, or: "Vesta, living flame, be honoured. Keep this house warm, fed and whole." Sit with the flame for five minutes. Turn to your right and put the flame out.\n\nOn one of the nine nights, garland the hearth with flowers or bay, as Cato advised for holy days.',
          times: 9,
          every: 'day',
          prompt: 'What did I notice tending the flame tonight? What in my home needs care?',
          premade: 'kitchen-hearth-blessing',
        },
        {
          id: 'vesta-bread',
          title: 'Bake for Vesta',
          instructions:
            'Once in the nine nights, bake bread or simple salted flatbreads. Give her the first piece on her clean dish, and share the rest. If you are near June, this can be your Vestalia.',
          times: 1,
          prompt: 'What does it mean to feed a household?',
          premade: 'folk-vestalia-hearth',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Is she your goddess?',
      intro:
        'A few days to weigh it honestly. Vesta asks for steadiness above everything; if you are not ready for a daily or near-daily practice, that is worth knowing. Stopping, pausing, or choosing another goddess or path is a good outcome.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'vesta-discern',
          title: 'Three evenings by the lamp',
          instructions: 'Light her lamp and, beside it, answer the questions below in your journal, a few each evening.',
          times: 3,
          every: 'day',
          prompt: 'What have the nine nights shown me about my own steadiness?',
        },
      ],
      questions: [
        'Can I keep a small, regular practice at the hearth, most days, for a year?',
        'Is my home a place I can make safe for a flame, and if not, am I happy with a lamp I light and put out?',
        'How do I feel about the history of the Vestals, and can I honour Vesta with that knowledge?',
        'Am I drawn to Vesta herself, or to the Greek Hestia, or to a general hearth practice? They overlap but are not identical.',
        'Does the formal Roman manner (veiled head, exact words, Janus first and Vesta last) feel right to me?',
        'Would I prefer to keep tending without a dedication? That is entirely fitting for her.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication',
      intro:
        'If you go ahead, hold this at your hearth, ideally on a Kalends, on 1 March, or on the Vestalia (9 June). It is a self-dedication, not an initiation, and it does not make you a Vestal or a priest. You are dedicating yourself as a devotee who keeps her household hearth.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Vesta',
        summary: 'A cleaned hearth, a new flame, Janus first, a spoken dedication, offerings of mola salsa, bread, oil and water, and Vesta named last.',
        minutes: 45,
        ingredients: [
          { name: 'Cleaning cloths, warm water and salt' },
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A head covering' },
          { name: 'A new white candle or a filled oil lamp', ref: 'traditional/candle/white' },
          { name: 'Fresh bay leaves', ref: 'traditional/herb/bay' },
          { name: 'Mola salsa', ref: 'traditional/vessel/dish' },
          { name: 'A small loaf or salted flatbread you baked' },
          { name: 'A little olive oil in a small dish' },
          { name: 'A cup of clean water' },
          { name: 'Frankincense and an incense burner', ref: 'traditional/tool/incense_burner' },
          { name: 'Your written dedication' },
        ],
        preparation:
          'Clean your kitchen properly, as for the Vestalia: hob, oven, counters, floor. Take the rubbish out. Bake a small loaf or flatbreads (250 g flour, 1 tsp salt, about 150 ml water, baked at 200°C for 20–30 minutes). Write your dedication: who you are, that you dedicate yourself to Vesta as a keeper of your household hearth, for how long (a year is wise), and what you will do (a daily share of food, regular tending, the Vestalia, a clean and safe home). Read it aloud until it flows.',
        steps: [
          {
            title: 'Purify and veil',
            instructions: 'Wash your hands and face. Put on clean clothes. Cover your head.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the incense and give a few grains to Janus.',
            spoken: 'Father Janus, first in every prayer,\nopen the way to the hearth.',
          },
          {
            title: 'The new flame',
            instructions: 'Lay fresh bay around the base of the holder, as new laurel was laid on Vesta\'s hearth each new year. Light the new candle or lamp with a fresh match.',
            spoken: 'Vesta, living flame, fire at the centre,\nguardian of the innermost things,\nor by whatever name it is right to call you:\nthis is your new fire in this house.\nBe honoured by this incense.',
            light: true,
          },
          {
            title: 'Speak the dedication',
            instructions: 'Read your dedication aloud, clearly. If you stumble, stop and begin again from the start.',
            minutes: 5,
          },
          {
            title: 'Offer',
            instructions: 'On her clean dish, place the first piece of the bread, sprinkle it with mola salsa, and pour a few drops of oil beside it. Set the cup of water by the flame.',
            spoken: 'Vesta, be honoured by this salted grain,\nthis bread, this oil, this clean water.\nAs I have spoken, so I will do.\nKeep this house warm, fed and whole.',
          },
          {
            title: 'Sit by the fire',
            instructions: 'Sit with the flame in silence.',
            minutes: 7,
            timed: true,
          },
          {
            title: 'Vesta last',
            instructions: 'Speak to her once more, last, turn to your right, and uncover your head. Put out the flame, or leave it burning only while you remain in the room.',
            spoken: 'Vesta, last as always, and first in this house: thank you.',
            snuff: true,
          },
        ],
        closing:
          'Eat the rest of the bread with your household or a friend. Leave her portion until morning, then give it to the birds or the compost. Keep your written dedication beside her shrine. Mark the date for your rededication, or keep it at each Vestalia.',
        safety:
          'Never leave the flame unattended. Do not place it on or next to a lit hob, under cupboards or near cloths. Use oven gloves with the bread. Keep incense smoke away from birds and people with asthma. Salt and oil spills are harmful to pets; keep dishes out of reach. The bread contains gluten.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the hearth',
      intro:
        'Vesta\'s ongoing practice is the simplest and the most demanding: a little every day. Add the monthly marker days and the Vestalia, and rededicate once a year.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'vesta-daily',
          title: 'Daily hearth',
          instructions:
            'Each day: a morsel of your main meal on her dish, a light for her while you cook, and "Vesta, be honoured" to close any prayer. Sweep around the hearth before bed when you can.',
          times: 30,
          every: 'day',
          prompt: 'Did the hearth feel tended today?',
          premade: 'kitchen-family-meal-blessing',
        },
        {
          id: 'vesta-garland',
          title: 'Garland on the marker days',
          instructions:
            'On the Kalends, Nones and Ides of each month (the 1st; the 5th or 7th; the 13th or 15th), put a garland or fresh bay on the hearth and make a full offering of incense and mola salsa, as Cato advised.',
          times: 12,
          every: 'month',
          prompt: 'What does this home need this month?',
          premade: 'folk-lararium-offering',
        },
        {
          id: 'vesta-year',
          title: 'The yearly round',
          instructions:
            'Keep 1 March as the new fire: deep-clean the hearth, lay fresh bay, light a new candle. Keep the Vestalia, 7–15 June: bake on the 9th and give her the first piece; clean and take the rubbish out on the 15th. Rededicate each year at the Vestalia or on your anniversary.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did keeping the hearth this year give my household?',
          premade: 'folk-vestalia-hearth',
        },
      ],
    },
  ],
  sources: [
    'Ovid, Fasti 6.291, 6.298, 6.310–311 and 3.141–144 (Latin, The Latin Library: https://www.thelatinlibrary.com/ovid/ovid.fasti6.shtml and https://www.thelatinlibrary.com/ovid/ovid.fasti3.shtml); translations original',
    'Cato, On Agriculture 132 ("Vestae, si voles, dato") and 143 (Latin, The Latin Library: https://www.thelatinlibrary.com/cato/cato.agri.html)',
    'Cicero, On the Nature of the Gods 2.67, Vesta last in prayer (paraphrased); Ovid, Fasti 6.303–304, Vesta first ("praefamur Vestam, quae loca prima tenet")',
    'Plutarch, Life of Numa 9–11; Aulus Gellius, Attic Nights 1.12; Livy 22.57 (paraphrased)',
    'Servius on Vergil, Eclogues 8.82, on mola salsa (paraphrased)',
    'Robin Lorsch Wildfang, Rome\'s Vestal Virgins (Routledge, 2006)',
    'Ariadne Staples, From Good Goddess to Vestal Virgins (Routledge, 1998)',
    'Mary Beard, "The Sexual Status of Vestal Virgins", Journal of Roman Studies 70 (1980)',
  ],
};
