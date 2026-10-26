import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-flora',
  kind: 'deity',
  paths: ['roman', 'wheel'],
  deityRef: 'traditional/deity/flora',
  title: 'Flora of the Blossom',
  summary:
    'A month with Flora, the Roman goddess on whose blossom the harvest depends: her old flamen and her temple by the Circus, Ovid’s Flora who was once Chloris, the bright and bawdy Floralia, and a practice of noticing, tending and giving flowers.',
  welcome: `This journey runs about a lunar month and is best walked in spring or early summer, when there is blossom to look at, though it can be done at any time. You will learn who Flora was to the Romans, how her festival grew, what Ovid has her say about herself, and how people honour her today. There is a nine-day practice of noticing and tending what flowers, and at the end you may make a self-dedication.

It is a self-dedication, not an initiation. Flora had her own priest in Rome, the flamen Floralis, a public office nobody can give you from an app; modern groups that keep priesthoods have their own processes. What anyone can do is take up the household side of her worship: flowers, garlands, attention to the season, and care for what grows.`,
  about: `Flora is the Roman goddess of flowering: of the blossom on fruit trees, vines and olives, and the flowering of the grain, on which the whole year’s harvest depends. She is old in Italy. She had one of Rome’s fifteen flamens, a priest of her own; Varro lists her among the gods whose altars the Sabine king Titus Tatius set up; and an Oscan inscription from Samnium names her too. Her temple near the Circus Maximus was built in the third century BC on the advice of the Sibylline books, “so that everything might flower well”, and her festival, the Floralia, ran from 28 April to 3 May with games, plays and much licence. People wore bright colours instead of white, hares and goats were let loose in the circus, and food was thrown to the crowd. In Ovid’s Fasti she speaks for herself as a Greek nymph, Chloris, wife of the west wind. Today Roman polytheists keep the Floralia, and many modern Pagans honour her at Beltane, which falls at its end.`,
  notes: [
    'Flora was a serious agricultural goddess as well as a goddess of pleasure. The Floralia’s bawdy plays are famous, but the festival existed because Romans feared for the year’s blossom. The journey keeps both in view.',
    'Ovid’s story of Flora as the nymph Chloris is a poet’s Greek-flavoured account, not Roman temple tradition. It is the best ancient source we have for her, and the journey says where it stops.',
    'Choose flowers with pets and allergies in mind. Lilies are deadly to cats, and many garden plants are toxic to animals or children. Never pick wild flowers where it is illegal or where they are scarce.',
    'The often-repeated idea that May Day customs descend directly from the Floralia is a guess, not a proven link.',
    'Modern Roman polytheism is small and varied. The gods of Rome belong to anyone who approaches them with respect, whatever their ancestry.',
  ],
  holyDays: ['floralia', 'beltane'],
  stages: [
    {
      kind: 'threshold',
      title: 'The first flower',
      intro:
        'Before study, a greeting, and a flower. This short rite follows the Roman form, with the head covered and Janus called first, and introduces you to Flora with blossom, honey and a few honest words.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'flora-threshold-look',
          title: 'Find what is flowering',
          instructions:
            'On each of the two days, find one thing that is flowering near where you live: a tree, a weed in a pavement crack, a pot on a windowsill, a hedge. Spend five minutes really looking at it. Do not pick it. If it is winter and nothing flowers, look at a bud.',
          times: 2,
          every: 'day',
          prompt: 'What was flowering? What did I notice when I looked properly?',
        },
      ],
      rite: {
        title: 'Greeting Flora',
        summary: 'A short Roman-form introduction: washed hands, covered head, Janus first, then a fresh flower, honey and milk for Flora.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A scarf or fold of cloth to cover your head' },
          { name: 'A few fresh flowers in a small vase or jar of water', ref: 'traditional/herb/rose' },
          { name: 'A little honey on a small dish', ref: 'traditional/vessel/dish' },
          { name: 'A small cup of milk or water' },
          { name: 'Frankincense, a few grains, and a burner', ref: 'traditional/tool/incense_burner', optional: true },
          { name: 'A green or pink candle', ref: 'traditional/candle/green', optional: true },
        ],
        preparation:
          'Choose a place with daylight: a windowsill, a table by the window, or outside. Buy or gather a few flowers you have every right to pick, and put them in water. If you can, wear something brightly coloured: at the Floralia Romans set aside white for many colours. Read the words through so you can say them without stumbling.',
        steps: [
          {
            title: 'Wash and veil',
            instructions: 'Wash your hands and dry them. Draw the cloth over the back of your head, as a Roman did to pray.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the candle or a few grains of incense if you are using them. Janus, god of doors, is called first in Roman prayer.',
            spoken: 'Father Janus, opener of the way,\nbe honoured, and carry my words through.',
            light: true,
          },
          {
            title: 'Call Flora',
            instructions: 'Set the flowers before you. Raise your hands, palms up.',
            spoken: 'Flora, mother of flowers,\nyou who make the grain, the vine and the olive blossom,\nor by whatever name you rightly wish to be called:\nI come to learn who you are.\nBe honoured by these flowers.',
          },
          {
            title: 'Honey and milk',
            instructions: 'Set the honey beside the flowers and pour a little milk or water into the dish.',
            spoken: 'Flora, be honoured by this honey and this milk.\nI ask nothing today but to be known to you,\nand to notice what you give.',
          },
          {
            title: 'Look',
            instructions: 'Spend a few minutes looking closely at one of the flowers: its colour, its shape, where it joins the stem. That attention is part of the offering.',
            minutes: 3,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'Name Vesta last, as Roman prayer ended with her. Turn round to your right, uncover your head, and put out any flame.',
            spoken: 'Vesta, keeper of the hearth, be honoured, last as always.',
            snuff: true,
          },
        ],
        closing:
          'Keep the flowers on the windowsill as long as they last, changing the water. When they wilt, return them to the earth or the compost rather than the bin. Pour the milk onto soil. Write down the date: you have begun.',
        safety:
          'Check that your flowers are safe for any pets: lilies are deadly to cats, and many common flowers are toxic to dogs. Keep honey from babies under a year old. Never leave a candle or incense unattended.',
      },
    },
    {
      kind: 'study',
      title: 'The flowering of everything',
      intro:
        'Five lessons, about two days each. They go from who Flora was in old Italy, to Ovid’s account of her in her own voice, to the Floralia in detail, to how she is honoured today, and finally to the hard parts: the bawdy games, a hostile Christian story, and a goddess who can be neglected.',
      days: 10,
      lessons: [
        {
          id: 'flora-who',
          title: 'Who Flora is',
          summary: 'An old Italian goddess of blossom, with her own priest and a share in every harvest.',
          minutes: 6,
          sections: [
            {
              heading: 'The goddess of flowering',
              body:
                'Flora is the goddess of flowering. Her name comes from flos, “flower”, and she governs the moment a plant blooms. To a farmer that moment was everything. If the blossom on the olive, the vine, the fruit trees or the grain was ruined by frost, wind or rain, there would be no harvest. So Flora was not only a goddess of pretty things. She held the promise of the whole year.\n\nRomans also connected her with youth and pleasure, the springtime of a human life. Both meanings sit together in her: the delight of the blossom and the anxiety about whether it will set fruit.',
            },
            {
              heading: 'An old goddess',
              body:
                'Flora is not a late invention. She was one of the fifteen gods in Rome with a flamen, a personal priest; hers was one of the twelve “lesser” flamens, which were among the oldest priesthoods in the city. Varro says she was one of the gods to whom the Sabine king Titus Tatius vowed altars (On the Latin Language 5.74). And a bronze tablet from Agnone in Samnium, written in Oscan, the language of the Samnites, lists offerings to a goddess called Flusa, connected with Ceres: Flora under another name.\n\nThat puts her among the gods shared by many peoples of ancient Italy, not just Rome.',
            },
            {
              heading: 'Her temples',
              body:
                'Flora’s main temple stood near the Circus Maximus, at the foot of the Aventine. Pliny the Elder says it was founded in 238 BC on the advice of the Sibylline books, “ut omnia bene deflorescerent”, “so that everything might flower well” (Natural History 18.286). Tacitus records that it was restored and rededicated under the emperor Tiberius (Annals 2.49). She also had a shrine on the Quirinal Hill.\n\nThe Sibylline books were consulted in times of crisis, so the founding tells you something: there had been fear for the crops, and Flora was the goddess the Romans turned to.',
            },
            {
              heading: 'Her signs',
              body:
                'Her signs are flowers of every kind, garlands and flower crowns, and blossoming branches. Her festival colours were many, not white. Hares and goats were let loose at her games, and seeds and beans were part of her festival. Roses are the flower most often linked with her today; violets, honeysuckle and lilac belong to the modern list. She is pictured as a young woman crowned with flowers, often scattering them from her lap or a basket.',
            },
          ],
          knowAndDont: {
            known:
              'Her flamen is attested by Varro and Ennius; Varro (On the Latin Language 5.74) names her among Titus Tatius’ gods; the Agnone tablet names her in Oscan. Pliny (Natural History 18.286) gives the founding of the Circus temple and its purpose, and Tacitus (Annals 2.49) its restoration.',
            unknown:
              'What her flamen did, and when, is not recorded. Ancient dates for the temple and games differ slightly between sources. Modern flower and crystal lists for her are modern.',
          },
          inPractice:
            'Start a simple list in your journal: what is flowering near you, and when. Keep it all year. It is the oldest kind of attention to Flora: noticing whether the blossom has come, and whether it has set.',
          reflect: [
            'What in your life is in blossom now, full of promise but not yet fruit?',
            'How does it change your idea of Flora to know that she was a goddess farmers feared to neglect?',
          ],
          further: [
            'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (1981), on the Floralia',
            'Pliny the Elder, Natural History 18.286 (public-domain translation by Bostock and Riley on Perseus)',
          ],
          library: ['traditional/deity/flora', 'traditional/deity/ceres', 'traditional/herb/rose'],
        },
        {
          id: 'flora-ovid',
          title: 'Flora in her own voice',
          summary: 'Ovid’s Fasti, where Flora tells the poet who she is: Chloris, the west wind, the garden, and a share in every field.',
          minutes: 7,
          sections: [
            {
              heading: '“I was Chloris”',
              body:
                'The longest ancient account of Flora is in Ovid’s Fasti, his poem on the Roman calendar, written around the turn of the eras. When he reaches her festival, the poet does what he often does: he asks the goddess herself to explain, and she answers (Fasti 5.183–378).\n\nShe begins: “Chloris eram, quae Flora vocor”, “I who am called Flora was Chloris” (5.195). Chloris is a Greek name meaning roughly “the green one”. She tells how she was a nymph of the fields, how Zephyrus, the gentle west wind of spring, fell for her and carried her off, and how he then made her his wife and gave her a garden full of flowers. She says the Roman tongue changed her Greek name into Flora.',
            },
            {
              heading: 'More than garlands',
              body:
                'Flora insists she is not just a goddess of decorations. Ovid has her say, in effect: perhaps you think I am queen only of garlands, but my power also touches the fields (5.261–262). If the grain flowers well, the threshing floor will be full; if the vine flowers well, there will be wine; if the olive flowers well, the year will shine with oil. Honey, she says, is her gift too, because the bees need flowers.\n\nShe also claims a part in a story about Juno. Hurt that Jupiter had produced Minerva from his own head without her, Juno came to Flora for help, and Flora gave her a flower that let her conceive Mars alone (5.229–260). This tale appears only in Ovid and may be his own invention, but it shows how he pictured her: a powerful goddess whose gifts even the queen of heaven needed.',
            },
            {
              heading: 'Why the Floralia began',
              body:
                'Ovid also tells how her games began. Two aediles, the brothers Publicius, used fines taken from people grazing their flocks illegally on public land to build a road up the Aventine and to found games for Flora. The games then lapsed. Flora tells the poet that when she was neglected she did not punish anyone, but she simply stopped caring for the fields, and frost, rain and wind ruined the blossom. The Senate vowed to restore her festival every year, and the blossom returned (5.279–330).\n\nIt is a quiet, telling story. Flora’s anger is not thunder. It is absence: the flowers fail to set when nobody pays attention.',
            },
            {
              heading: 'What Ovid does and does not tell us',
              body:
                'Ovid is a brilliant, playful poet, and he writes in a Greek mythological manner that Roman temple cult did not use. The Chloris story is his, built on Greek ideas about the west wind and the nymphs. It became enormously influential: Botticelli’s Primavera, painted in Florence around 1480, shows Zephyrus seizing Chloris and Chloris turning into Flora.\n\nFor devotion, the most useful parts of Ovid are the ones that match other sources: her power over the blossom of crops, the bright colours, the animals and the games. The Chloris story can be enjoyed as poetry, and the abduction in it noticed honestly.',
            },
          ],
          knowAndDont: {
            known:
              'Ovid, Fasti 5.183–378, is the main literary source for Flora and the Floralia; it includes her speech, the Publicius story and the customs of the festival. The Publicii are known from other sources as aediles of the third century BC.',
            unknown:
              'The Chloris identification and the Juno story appear only in Ovid and may be his own. Ovid’s date for when the games became annual (173 BC) depends on his account alone. How Romans outside literary circles pictured Flora is unknown.',
          },
          inPractice:
            'Read Fasti 5.183–378 aloud over two evenings, in any translation, with a flower in front of you. Mark the lines about the fields and the blossom, and copy one onto a card for her shrine.',
          reflect: [
            'Flora’s anger in Ovid is absence: the blossom fails when she is neglected. Where in your life has neglect, rather than harm, been the damage?',
            'How do you read a goddess whose story begins with being carried off by the wind?',
          ],
          further: [
            'Ovid, Fasti 5.183–378 (Latin at The Latin Library; Frazer’s Loeb translation on LacusCurtius)',
            'Ovid, Fasti, trans. A. J. Boyle and R. D. Woodard (Penguin, 2000), with notes on Book 5',
          ],
          library: ['traditional/deity/flora', 'traditional/deity/juno', 'traditional/deity/mars'],
        },
        {
          id: 'flora-floralia',
          title: 'The Floralia',
          summary: 'Six days of games and plays from 28 April: bright colours, lamps at night, hares and goats in the circus, food thrown to the crowd.',
          minutes: 7,
          sections: [
            {
              heading: 'Games for the blossom',
              body:
                'The Floralia ran from 28 April, the anniversary of her Circus temple, to 3 May. Like most big Roman festivals by the late Republic, it was a set of ludi, public games, paid for by magistrates who used them to win popularity: theatrical shows on most days and circus events at the end. It was a festival of the whole city, and especially of the common people.\n\nThe timing matters. Late April and early May is when the blossom of vines, olives and grain is most vulnerable to a late frost or a storm. In Ovid, Flora herself ties her festival to the flowering of the crops.',
            },
            {
              heading: 'Colours, lamps and animals',
              body:
                'Ovid asks the goddess three questions about her festival, and her answers give us its customs. Why do people wear many colours, when at the festival of Ceres they wear white? Because the fields are bright with every kind of flower in spring (5.355–360). Why are there lamps and torches at night? Because the fields glow with purple flowers, or because the night suits revelry (5.361–368). And why are timid hares and goats let loose in the circus, rather than fierce lions? Because her care is for gardens and fields, not for woods and wild beasts (5.371–374).\n\nPeople went garlanded, drank, and celebrated late. It was a festival of colour and light in the first warm nights of the year.',
            },
            {
              heading: 'Seeds for the crowd',
              body:
                'At the Floralia, food was scattered to the crowd. The satirist Persius pictures a magistrate throwing chickpeas to a jostling crowd so that old men sunning themselves would remember his Floralia (Satires 5.177–179), and other writers mention beans and lupins. Seeds and pulses were signs of fertility and plenty, and throwing them was a show of generosity.\n\nThis is a custom that is easy to keep: a handful of seeds planted or given away, or beans shared, at the festival.',
            },
            {
              heading: 'A modern Floralia',
              body:
                'Roman polytheists today keep the Floralia from 28 April to 3 May, usually with a formal offering to Flora at the start, flowers in the house throughout, bright clothes, a meal with friends, and sowing seeds for pollinators. Many Pagans who follow the Wheel of the Year honour her at Beltane on 1 May, with flower crowns and garlands.\n\nA simple home Floralia: on 28 April, wear something bright, make an offering of flowers, honey and milk, and plant some seeds; through the six days, keep flowers in the house and light a lamp in the evening; on 3 May, make a last offering and give away flowers or seeds to someone.',
            },
          ],
          knowAndDont: {
            known:
              'The dates are given by the calendars and Ovid. Ovid (Fasti 5.331–378) gives the colours, lamps and animals. Persius (5.177–179) mentions the scattered food; Horace and later writers mention beans and lupins at games. The Floralia’s character as popular ludi is well attested.',
            unknown:
              'What ritual, as distinct from games, was performed for Flora at the festival, and by whom, is not described. Whether the Floralia had a particular rite for the blossom in the fields is unknown. Modern Floralia customs are modern.',
          },
          inPractice:
            'Mark 28 April to 3 May in your calendar now. Buy a packet of seeds for bee-friendly flowers to sow or give away during the festival.',
          reflect: [
            'What would it feel like to wear colour on purpose, as a religious act?',
            'What could you scatter or give away in a season of plenty?',
          ],
          further: [
            'Ovid, Fasti 5.331–378 (Latin at The Latin Library)',
            'Persius, Satires 5 (public-domain translations on Project Gutenberg)',
          ],
          library: ['traditional/deity/flora', 'traditional/herb/violet', 'traditional/herb/honeysuckle', 'traditional/herb/lilac'],
          premade: ['green-seed-blessing-before-sowing', 'wicca-beltane-flower-crown'],
        },
        {
          id: 'flora-today',
          title: 'Honouring Flora today',
          summary: 'Roman polytheists and Wheel of the Year Pagans, the household Flora through the seasons, and how to set up her shrine.',
          minutes: 6,
          sections: [
            {
              heading: 'Who honours her now',
              body:
                'Flora is honoured today by Roman polytheists, who keep the Floralia and give her flowers at the household shrine, and by many modern Pagans and witches, who love her as a goddess of spring and often honour her at Beltane. Gardeners of every faith and none sometimes keep a small image of her among the flowers.\n\nThe Roman approach treats her as one of the gods of the Roman year, honoured in the Roman manner with covered head and exact words. The eclectic Pagan approach treats her more freely, as a spirit of the season. Both can be done with care. It helps to know which you are doing.',
            },
            {
              heading: 'Flora through the year',
              body:
                'Flora’s great season is spring, but she can be honoured all year. In spring, blossom and the first flowers. In summer, the flowering of crops, herbs and roses. In autumn, the last flowers and the seeds they leave. In winter, bulbs in pots and buds on bare branches. A devotee watches the flowering year and marks its moments with small offerings.\n\nShe is also a goddess of youth and pleasure. Enjoying something beautiful while it lasts, without guilt, is in her spirit.',
            },
            {
              heading: 'Setting up her shrine',
              body:
                'Put Flora’s shrine where there is light: a windowsill, a sunny shelf, or a corner of a garden or balcony. You need a small vase or jar for fresh flowers, a dish for honey or seeds, a cup for milk, and a candle or lamp. An image of her, a flower crown, a picture of blossom or a small packet of seeds will do as her sign. Pink, green and yellow are modern colours for her; rose quartz and moss agate are modern stones.\n\nThe one rule is freshness. Change the water, remove wilted flowers, and return them to the earth. A vase of dead flowers is the opposite of an offering.',
            },
          ],
          knowAndDont: {
            known:
              'Modern Roman polytheist groups publish their calendars, including the Floralia. Modern Pagan Beltane customs with flowers are well documented, and so is their modern origin.',
            unknown:
              'There is little evidence for how ordinary Roman households honoured Flora at home. Her colours and stones are modern. The idea that the Floralia is the source of May Day is a long-standing guess without direct evidence.',
          },
          inPractice:
            'Set up her shrine by a window this week. Keep fresh flowers there, even a single stem from a supermarket or a sprig from the garden, and change them before they wilt.',
          reflect: [
            'Which window or corner in your home gets the best light? What is there now?',
            'Do you feel drawn to the Roman Flora, the Pagan spirit of spring, or both?',
          ],
          further: [
            'Ronald Hutton, The Stations of the Sun (1996), on May Day customs and their history',
            'Nova Roma’s published calendar and religious guides (novaroma.org)',
          ],
          library: ['traditional/tool/altar', 'traditional/crystal/rose_quartz', 'traditional/crystal/moss_agate', 'traditional/candle/pink'],
          premade: ['folk-lararium-offering', 'green-pressing-flowers-grimoire'],
        },
        {
          id: 'flora-hard',
          title: 'The bawdy games and the honest edges',
          summary: 'The stripping actresses of the Floralia, the Christian slander of Flora, and how to pick flowers without harm.',
          minutes: 6,
          sections: [
            {
              heading: 'The plays',
              body:
                'The theatrical shows of the Floralia were famously indecent. They were mimes, in which actresses performed, and at a certain point the crowd called for them to undress. Valerius Maximus tells how Cato the Younger, a famously stern man, once attended the Floralia, and the people were too embarrassed to call for the stripping while he watched; when he heard, he left the theatre so the show could go on as usual (Memorable Deeds and Sayings 2.10.8). Juvenal and Martial also mention it.\n\nThe actresses were usually of low status, and some were sex workers. It is worth being honest that the women who made the festival merry were among the least protected people in Rome. A modern Floralia can enjoy pleasure and play without using anyone.',
            },
            {
              heading: 'A hostile story',
              body:
                'The Christian writer Lactantius, around AD 300, claimed that Flora was not a goddess at all but a rich courtesan who left her fortune to the Roman people, and that the Senate, ashamed, invented a goddess to cover the scandal (Divine Institutes 1.20). This story is polemic, meant to mock pagan worship, and it is contradicted by everything older: Flora’s ancient flamen, her place among the Sabine gods, and her Oscan name.\n\nYou will still find it repeated online as fact. It is worth knowing so that you can recognise it.',
            },
            {
              heading: 'Flowers without harm',
              body:
                'A goddess of flowers is badly served by stripped hedgerows. In many countries it is illegal to dig up wild plants, and some wild flowers are protected. Even where picking is legal, take only from plentiful plants, a few stems from many, never the last ones. Better still, grow flowers or buy them from local growers.\n\nThink, too, about cut flowers flown across the world, about pesticides that harm bees, and about plastic in florists’ wrapping. None of this is ancient, but care for what grows is close to the heart of Flora’s story: she withdraws when she is neglected, and the blossom fails.',
            },
            {
              heading: 'What not to do',
              body:
                'Do not leave dead flowers or mouldy offerings on her shrine. Do not use flowers that are toxic to pets or children in a house where they could be eaten. Do not take wild flowers from places where they are scarce. And do not use her festival as a reason to pressure anyone about sex; pleasure in her name is freely chosen or it is not hers.',
            },
          ],
          knowAndDont: {
            known:
              'Valerius Maximus 2.10.8 and Seneca (Letters 97.8) tell the Cato story; Juvenal (6.249–250) and Martial mention the Floralia’s character. Lactantius (Divine Institutes 1.20) gives the courtesan story.',
            unknown:
              'How the Floralia plays related to any religious meaning is debated; some scholars link their sexual character to fertility, others see ordinary Roman popular entertainment. Modern ethical readings are modern.',
          },
          inPractice:
            'Learn which wild flowers near you are protected, and which garden flowers are toxic to the pets or children in your home. Choose your offering flowers accordingly for the rest of this journey.',
          reflect: [
            'How do you hold pleasure and care together in your own life?',
            'What would it mean to honour a flower goddess through what you do not pick?',
          ],
          further: [
            'Valerius Maximus, Memorable Deeds and Sayings 2.10.8',
            'Lactantius, Divine Institutes 1.20 (public-domain translation in the Ante-Nicene Fathers)',
          ],
          library: ['traditional/deity/flora'],
          premade: ['green-wildflower-walk-gathering-ethics'],
        },
      ],
      practices: [
        {
          id: 'flora-study-calendar',
          title: 'The flowering calendar',
          instructions:
            'Through the study stage, add one line a day to your flowering list: what you saw in flower, where, and how far it had come. Note bees and other insects on it too.',
          times: 10,
          every: 'day',
          prompt: 'What was flowering today, and what was visiting it?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine days of blossom',
      intro:
        'Nine days of short offerings of flowers and attention. The Floralia lasted six days; nine here frames a practice, not a claim about ancient custom. The aim is a habit of noticing and tending, which is what Ovid’s Flora asks for.',
      days: 9,
      lessons: [],
      practices: [
        {
          id: 'flora-nine-days',
          title: 'A daily flower',
          instructions:
            'Each day: wash your hands and cover your head. Give a word to Janus. Set a fresh flower, a petal, or a sprig in water on Flora’s shrine, or tend the ones already there by changing the water and taking out what has wilted. Add a drop of honey to her dish or a little milk to her cup, and say: “Flora, be honoured by this flower. Let what is blossoming set well.” Name one thing in your life that is in blossom. Name Vesta last, turn to your right, and uncover.\n\nOn at least three of the nine days, also do something for living flowers: water a plant, sow seeds, weed a corner, or pick up litter from a verge.',
          times: 9,
          every: 'day',
          prompt: 'What did I offer and tend today? What in my life is in blossom, and what would help it set?',
        },
        {
          id: 'flora-seeds',
          title: 'Sow for the bees',
          instructions:
            'Once in the nine days, sow seeds of a bee-friendly flower in a pot, a window box or a garden, or give a packet of seeds to someone who will. Before you sow, scatter a pinch on her shrine and ask Flora to let them flower well.',
          times: 1,
          prompt: 'What did I sow, and where? What do I hope it becomes?',
          premade: 'green-seed-blessing-before-sowing',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Before the fruit sets',
      intro:
        'A few days to decide. Flora asks for steady attention more than grand ritual, and a dedication to her is a promise to keep noticing and tending. Stopping, pausing, or choosing another god or path is a good outcome.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'flora-discern-walk',
          title: 'A flower walk',
          instructions:
            'On one of the three days, walk somewhere with flowers, a park, a garden, a field edge, and ask yourself the questions below as you go. Take nothing home but notes.',
          times: 1,
          prompt: 'Which answer felt true as I walked among the flowers?',
          premade: 'green-wildflower-walk-gathering-ethics',
        },
      ],
      questions: [
        'Did the nine days feel like delight, or like another task? Either answer is useful.',
        'Can I keep fresh flowers or living plants on her shrine, and keep it clean, for a year?',
        'Do I want to honour her in the Roman manner, or as a spirit of the season, or both?',
        'How do I feel about the Floralia’s bawdy side, and about the women who performed it?',
        'Am I drawn to Flora herself, or to another goddess of growing things, Ceres, Venus or Pomona, who might fit better?',
        'Would I rather keep noticing the blossom without dedicating? That is a perfectly good choice.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication',
      intro:
        'If you have decided to go ahead, hold this in daylight, ideally on 28 April, the first day of the Floralia, on Beltane, or on any day when something you love is in flower. It is a self-dedication, not an initiation, and it does not make you a flamen or priestess. You are dedicating yourself as a devotee who tends what flowers.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Flora',
        summary: 'Bright clothes, covered head, Janus first, a crown or garland, a spoken dedication, offerings of flowers, honey, milk and seeds, a seed sown, and Vesta last.',
        minutes: 40,
        ingredients: [
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'Brightly coloured clothes' },
          { name: 'A head covering' },
          { name: 'Fresh flowers, enough for a vase and a small garland or crown', ref: 'traditional/herb/rose' },
          { name: 'Honey and milk, each in a small dish', ref: 'traditional/vessel/dish' },
          { name: 'A packet of flower seeds and a pot of soil' },
          { name: 'A green, pink or yellow candle', ref: 'traditional/candle/pink' },
          { name: 'Frankincense and a burner', ref: 'traditional/tool/incense_burner', optional: true },
          { name: 'Your written dedication' },
        ],
        preparation:
          'The day before, make a simple garland or flower crown, or tie a few flowers into a small bunch with string. Clean her shrine and put fresh water in the vase. Write your dedication: who you are, that you dedicate yourself to Flora as a devotee, for how long (a year is wise), and what you will do: keep the Floralia, keep fresh flowers on her shrine, sow for the bees, and pick and buy flowers with care. Read it aloud until it flows.',
        steps: [
          {
            title: 'Wash, dress and veil',
            instructions: 'Wash your hands and face. Put on your bright clothes. Cover your head.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the candle and give a little incense, or a word, to Janus.',
            spoken: 'Father Janus, first in every prayer,\nopen the way to Flora.',
            light: true,
          },
          {
            title: 'The invocation',
            instructions: 'Lay the garland or crown before her shrine. Raise your hands, palms up.',
            spoken: 'Flora, mother of flowers,\nyou who make the grain and the vine and the olive blossom,\nwhose games are bright with every colour,\nor by whatever name it is right to call you:\nI offer you these flowers, and I pray good prayers,\nthat you may be willing and favourable\nto me, my house and my household,\nand to all that grows in my care.',
          },
          {
            title: 'Read the dedication',
            instructions: 'Read your dedication aloud, clearly and in full. If you stumble, stop and begin again from the start.',
            minutes: 5,
          },
          {
            title: 'Offer',
            instructions: 'Set the honey and milk before the flowers. Scatter a few of the seeds on her dish.',
            spoken: 'Flora, be honoured by these flowers, this honey, this milk and these seeds.\nAs I have spoken, so I will do.',
          },
          {
            title: 'Sow',
            instructions: 'Press a few seeds into the pot of soil, cover them lightly and water them.',
            spoken: 'Let this flower well.',
          },
          {
            title: 'Sit with the flowers',
            instructions: 'Sit quietly and look at the flowers. If you made a crown, wear it now.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'Name Vesta, turn to your right, uncover your head, and put out the candle.',
            spoken: 'Vesta, keeper of the hearth, be honoured. It is done.',
            snuff: true,
          },
        ],
        closing:
          'Keep the pot of seeds on her shrine or windowsill and tend it; when it flowers, that is the first fruit of your dedication. Leave the honey and milk until evening, then pour the milk onto soil and put the honey in the compost. Give away the rest of the seeds. Note the date for your rededication, or keep it at each Floralia.',
        safety:
          'Never leave the candle unattended, and keep flowers and garlands away from the flame. Check that your flowers are safe for pets and children. Keep honey from babies under a year old. If you have pollen allergies, choose low-pollen flowers or use a single stem.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Tending the flowering year',
      intro:
        'Flora’s ongoing worship follows the seasons: fresh flowers on her shrine, attention to what is blossoming, and the Floralia each spring. Rededicate once a year.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'flora-ongoing-flowers',
          title: 'Fresh flowers on the Kalends',
          instructions:
            'On the 1st of each month, put fresh flowers or a living plant on her shrine with a little honey or milk, and a short prayer in the Roman form. Note in your flowering calendar what is in bloom.',
          times: 12,
          every: 'month',
          prompt: 'What is flowering this month, in the world and in my life?',
          premade: 'folk-lararium-offering',
        },
        {
          id: 'flora-ongoing-floralia',
          title: 'The Floralia',
          instructions:
            'Keep 28 April to 3 May: bright clothes, flowers in the house, lamps in the evening, an offering at the start and the end, seeds sown or given away. Honour her at Beltane if you keep the Wheel of the Year. Rededicate on 28 April, reading your dedication and saying honestly how you kept it.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did I tend this year, and what flowered?',
          premade: 'wicca-beltane-flower-crown',
        },
      ],
    },
  ],
  sources: [
    'Ovid, Fasti 5.183–378, Flora’s speech and the Floralia (Latin, The Latin Library: https://www.thelatinlibrary.com/ovid/ovid.fasti5.shtml); “Chloris eram, quae Flora vocor” (5.195); translations original',
    'Pliny the Elder, Natural History 18.286, the founding of the Floralia “ut omnia bene deflorescerent” (Latin, The Latin Library: https://www.thelatinlibrary.com/pliny.nh18.html)',
    'Varro, On the Latin Language 5.74 and 7.45, on Titus Tatius’ gods and the flamen Floralis (paraphrased)',
    'The Agnone tablet (Tabula Agnonensis), an Oscan inscription naming Flora among Ceres’ circle (paraphrased; see Scullard)',
    'Tacitus, Annals 2.49, the restoration of her temple (paraphrased)',
    'Persius, Satires 5.177–179; Valerius Maximus 2.10.8; Seneca, Letters 97.8; Juvenal 6.249–250 (paraphrased)',
    'Lactantius, Divine Institutes 1.20, the courtesan story (paraphrased)',
    'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (London, 1981)',
    'Mary Beard, John North and Simon Price, Religions of Rome (Cambridge, 1998)',
    'Ronald Hutton, The Stations of the Sun (Oxford, 1996)',
  ],
};
