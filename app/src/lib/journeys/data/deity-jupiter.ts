import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-jupiter',
  kind: 'deity',
  paths: ['roman'],
  deityRef: 'traditional/deity/jupiter',
  title: 'Jupiter Optimus Maximus',
  summary:
    'A month with the Best and Greatest: the sky-father of Rome, keeper of oaths and right order, learned through Roman prayer, the Ides and a promise you actually keep.',
  welcome:
    'This journey runs about a lunar month. You will learn who Jupiter was to the Romans, how they prayed to him, what they gave him and when, and how people honour him today. You will keep a nine-night practice built on a single kept promise, and at the end you may make a self-dedication.\n\nThis is a self-dedication, not an initiation. The Romans had priests of Jupiter, above all the Flamen Dialis, and nobody can make you one from an app. What you can do is take up the household and personal side of his worship, which Romans also did, and do it carefully. Pause whenever you need to. Nothing here can be failed.',
  about:
    'Jupiter Optimus Maximus, "Best and Greatest", was the chief god of the Roman state: god of the bright sky, thunder and lightning, of treaties, oaths and good faith, and of the order that lets a people live together. His great temple on the Capitoline Hill, shared with Juno and Minerva, was the religious centre of Rome, where consuls made their first vows and triumphal processions ended. Most of the stories people know about him, the seductions and transformations, are Greek stories of Zeus, retold in Latin by poets such as Ovid. The Roman Jupiter has few myths of his own; he is known through cult, through calendars, prayers and vows. Today he is honoured by Roman polytheists (people practising the Religio Romana) with incense, wine and white offerings on the Ides of each month, and in the September games that were his.',
  notes: [
    'Jupiter is a god of oaths. Do not swear by him casually, and do not promise him anything you will not do. A broken vow to Jupiter was, for the Romans, a real offence against the gods and against good faith (fides).',
    'Roman ritual cares about exact words, a covered head and the right order of gods. This journey teaches these forms. They are not decoration; they are how Roman piety (pietas) worked.',
    'Much of what is written about Jupiter online is Greek myth about Zeus. Those stories belong to Hellenic religion and Latin literature, not to Roman cult. The journey says which is which.',
    'Roman religion included animal sacrifice. Modern Roman polytheists overwhelmingly do not practise it, and nothing here asks you to. Incense, wine, cakes and a kept word are fully traditional offerings.',
    'Modern Roman polytheism is small and varied: groups like Nova Roma, Italian associations, and many solitary practitioners. A few Italian "Traditionalist" circles have drawn on the fascist-era writer Julius Evola. This app is inclusive: the gods of Rome belong to anyone who approaches them with respect, whatever their ancestry.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'Under the open sky',
      intro:
        'Before study, a greeting. Romans did not walk up to a god and start talking: they purified, covered their heads, called Janus first and then spoke to the god by his proper names. This short rite introduces you to Jupiter in that manner, outdoors or at an open window.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'jupiter-sky-watch',
          title: 'Look up',
          instructions:
            'On each of the two days, spend five minutes looking at the sky: weather, clouds, the light. Jupiter is the god of the sky itself (his name shares a root with the word for "day" and the bright heavens). Notice it without trying to read omens into it.',
          times: 2,
          every: 'day',
          prompt: 'What was the sky doing? What did it feel like to give it your attention as something holy?',
        },
      ],
      rite: {
        title: 'Greeting Jupiter',
        summary: 'A short Roman-form introduction: washed hands, covered head, Janus first, then Jupiter with incense and wine.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A scarf, shawl or fold of cloth to cover your head' },
          { name: 'Frankincense, a few grains', ref: 'traditional/herb/frankincense' },
          { name: 'An incense burner or a heatproof dish with sand', ref: 'traditional/tool/incense_burner' },
          { name: 'A small cup of wine (or grape juice)', ref: 'traditional/tool/chalice' },
          { name: 'A shallow offering dish', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A white candle', ref: 'traditional/candle/white', optional: true },
        ],
        preparation:
          'Choose a place where you can see the sky: a balcony, a garden, an open window. Set the burner, the dish and the cup on a small table or a cloth. Have your head covering ready. Read the words through once so you can say them without stumbling: in Roman practice a stumble was taken seriously enough that the prayer would be begun again.',
        steps: [
          {
            title: 'Wash',
            instructions: 'Wash your hands in the clean water and dry them. Romans came to the gods clean in body and clothes. Then draw the cloth over the back of your head, as a Roman drew a fold of the toga up over the head to pray.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the candle if you are using one. Drop a few grains of incense on the burner. Janus, god of doors, is called first in Roman prayer so that the way to the other gods is open.',
            spoken: 'Father Janus, opener of the way,\nreceive this incense, and carry my words through.',
            light: true,
          },
          {
            title: 'Call Jupiter by his names',
            instructions: 'Turn to face the sky. Add more incense, and raise your hands with palms up, the Roman gesture of prayer.',
            spoken: 'Jupiter Optimus Maximus, Best and Greatest,\nfather of the bright sky, keeper of oaths,\nor by whatever name you rightly wish to be called:\nI come to learn who you are.\nBe honoured by this incense.',
          },
          {
            title: 'Wine',
            instructions: 'Pour a little of the wine into the offering dish.',
            spoken: 'Jupiter, be honoured by this wine. I ask nothing tonight but to be known to you,\nand to come to know you rightly.',
          },
          {
            title: 'Stand in silence',
            instructions: 'Stand quietly for a few minutes with your eyes on the sky. Do not fill the silence. The Romans asked for "favourable silence" at rites: say well, or say nothing.',
            minutes: 3,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'Romans ended prayer with Vesta, goddess of the hearth. Say her line, then turn round to your right, a full turn, which was how a Roman closed a prayer. Uncover your head.',
            spoken: 'Vesta, keeper of the hearth, be honoured, last as always.',
            snuff: true,
          },
        ],
        closing:
          'Leave the wine out until evening, then pour it onto earth or into a plant pot (not one a pet chews), or down the sink with a word of thanks if you have no earth. Write down the date: you have begun.',
        safety:
          'Burn incense on a heatproof surface, away from curtains, and never leave it or a candle unattended. Keep incense smoke away from birds and anyone with asthma. Grapes, raisins and wine are toxic to dogs and cats; do not leave the dish where they can reach it. Grape juice is a fine substitute for wine.',
      },
    },
    {
      kind: 'study',
      title: 'Learning the Best and Greatest',
      intro:
        'Five lessons, about two days each. They build from who Jupiter is, to his place in the city and its calendar, to the exact shape of Roman prayer and offering, to how people keep him today, to the honest difficulties.',
      days: 10,
      lessons: [
        {
          id: 'jupiter-who',
          title: 'Who Jupiter is',
          summary: 'The sky-father, his names and forms, and what made him different from Zeus.',
          minutes: 6,
          sections: [
            {
              heading: 'The god of the bright sky',
              body:
                'Jupiter is an old god, older than Rome. His Latin name, Iuppiter, comes from an ancient compound meaning roughly "sky-father", and the same root gives Greek Zeus and Sanskrit Dyaus Pitar. Linguists are confident about that family tree. What it tells us is that the peoples who spoke these languages inherited the idea of a father-god of the shining day sky.\n\nIn Rome he became much more than weather. Jupiter was the god under whom the Roman people lived as a people: the guarantor of treaties, the witness of oaths, the power that made authority legitimate. Magistrates took the auspices, watching birds and lightning, to learn whether Jupiter approved of public business. Lightning on the left was favourable; a thunderstorm could stop an assembly.',
            },
            {
              heading: 'His many names',
              body:
                'Romans addressed Jupiter by the title that fitted the need. Optimus Maximus, "Best and Greatest", was the Jupiter of the Capitol and the state. Jupiter Stator, "the Stayer", was said to have stopped the Roman line from fleeing in Romulus\'s war with the Sabines. Jupiter Feretrius was the oldest cult on the Capitol, where a general who killed an enemy commander in single combat dedicated the spoils, and where a sacred flint stone was kept for swearing treaties. Jupiter Tonans was the Thunderer. Summanus, sometimes treated as a separate god, owned the lightning of the night.\n\nThere were rustic forms too. Jupiter Dapalis, "of the feast", received a farmer\'s banquet before sowing. Jupiter Latiaris was honoured by all the Latin towns together on the Alban Mount. Learning which name to use is part of Roman piety: you address the god in the aspect you are approaching.',
            },
            {
              heading: 'Not quite Zeus',
              body:
                'From the third century BC Romans read Greek literature and matched their gods to Greek ones. Scholars call this interpretatio graeca, "Greek interpretation". Jupiter became Zeus in poetry: he gained a father Saturn (matched to Kronos), the war against the Titans, the eagle that carried Ganymede, and the long list of seductions in Ovid\'s Metamorphoses.\n\nThose stories are real parts of Latin literature, and they shaped how later Europe imagined him. But they were not how Romans worshipped him. Roman Jupiter is a god of contracts and good faith, of public order and the sky, with very little personal biography. Some modern Roman polytheists use the Greek myths as poetry; others set them aside entirely. Both positions are held in good faith. What is not accurate is to treat Jupiter as Zeus with a Latin label.',
            },
            {
              heading: 'His signs',
              body:
                'The eagle was his bird and the standard of the legions. The oak was his tree, and an oak-leaf crown, the corona civica, was given for saving a citizen\'s life. White was his colour: white animals for the gods above, white clothing at his festivals. The thunderbolt, the sceptre and the throne complete his image. Places struck by lightning were treated as his, walled off and left alone.',
            },
          ],
          knowAndDont: {
            known:
              'Jupiter\'s name and its relation to Zeus and Dyaus are secure. His titles (Optimus Maximus, Stator, Feretrius, Tonans, Dapalis, Latiaris) are well attested in inscriptions, Livy and the calendars, as is his role in auspices, treaties and oaths.',
            unknown:
              'We know little about how ordinary Romans felt about Jupiter personally, and very few distinctively Roman myths about him survive; scholars debate whether Rome ever had much of a mythology of its own. Modern devotional relationships with him, of the kind this journey invites, are a modern development built on ancient forms.',
          },
          inPractice:
            'Write his main titles on a card and keep it by your shrine. When you pray, pick the one that fits: Optimus Maximus for the big things, Stator when you need to hold your ground, Dapalis at a meal.',
          reflect: [
            'What does "right order" look like in your own life: in your work, home or friendships?',
            'How do you feel about a god known more through law and promises than through stories?',
          ],
          further: [
            'Mary Beard, John North and Simon Price, Religions of Rome (1998), vol. 1, on the Capitol and the state cult',
            'John Scheid, An Introduction to Roman Religion (2003)',
          ],
          library: ['traditional/deity/jupiter', 'traditional/herb/oak'],
        },
        {
          id: 'jupiter-city',
          title: 'The Capitol, the triad and the Roman year',
          summary: 'Where and when Jupiter was worshipped: the Capitoline temple, the Ides, the games and the wine festivals.',
          minutes: 7,
          sections: [
            {
              heading: 'The temple on the Capitol',
              body:
                'Rome\'s greatest temple stood on the Capitoline Hill, dedicated by tradition in 509 BC, the first year of the Republic. It housed three gods side by side: Jupiter Optimus Maximus in the centre, Juno Regina on one side and Minerva on the other. This is the Capitoline triad, and towns across the empire built their own capitolia to copy it.\n\nAn older grouping, Jupiter, Mars and Quirinus, is sometimes called the Archaic triad. It had its own major priests, the three great flamens. The Capitoline triad, with its Etruscan-style temple, became the face of Roman state religion.\n\nNew consuls went up to the Capitol on taking office to sacrifice and make vows for the safety of the state. A general celebrating a triumph rode through the city in a chariot, dressed in purple and gold, and ended at Jupiter\'s temple, where he laid his laurel before the god.',
            },
            {
              heading: 'The Ides',
              body:
                'The Roman month had three marker days: the Kalends (the 1st), the Nones (the 5th, or the 7th in March, May, July and October) and the Ides (the 13th, or the 15th in those same four months). The Ides fell near the full moon, and every Ides belonged to Jupiter. On those days the Flamen Dialis, his priest, led a white sheep up to the Capitol.\n\nThis is the simplest rhythm for a modern devotee: a monthly offering to Jupiter on the Ides. The Kalends go to Juno and Janus, and the Ides to Jupiter.',
            },
            {
              heading: 'The festivals',
              body:
                'The Ludi Romani, the Roman Games, ran in September (by the late Republic from the 4th to the 19th) in Jupiter\'s honour, with a procession, chariot races and plays. On the Ides of September, the anniversary of the Capitoline temple, came the Epulum Iovis, the Feast of Jupiter: the images of the gods were set out on couches and chairs and served a banquet, with Jupiter reclining and Juno and Minerva seated. A second Epulum fell on the Ides of November during the Plebeian Games.\n\nTwo wine festivals were his. At the Vinalia of 23 April the new wine was opened and a first libation poured to Jupiter. At the Vinalia Rustica of 19 August, before the grape harvest, his priest cut the first grapes. The Meditrinalia of 11 October tasted the new must.',
            },
            {
              heading: 'His priest',
              body:
                'The Flamen Dialis lived a life hedged with rules. He wore a cap with an olive-wood spike, could not swear an oath, could not see an army drawn up, could not touch a horse, ivy, raw meat or beans, could not sleep away from his own bed for more than a couple of nights, and his wife the Flaminica served with him. No one is sure why every rule existed. Together they made him a living image of the god\'s purity and steadiness. Modern devotees are not flamens and should not imitate the office; it is useful to know it existed and how demanding it was.',
            },
          ],
          knowAndDont: {
            known:
              'The Capitoline temple and triad, the Ides as Jupiter\'s days, the Ludi Romani, the Epulum Iovis and both Vinalia are attested in surviving calendars (fasti), Livy and the antiquarians Varro and Aulus Gellius, who lists the Flamen Dialis\'s rules.',
            unknown:
              'The 509 BC dedication date is the Romans\' own tradition and may be tidied. The exact dates of the games shifted over time. Why the Flamen had his particular taboos is not recorded; ancient writers were guessing too.',
          },
          inPractice:
            'Put the Ides of the next twelve months in your calendar (the 13th, or the 15th in March, May, July and October). If you want one big yearly observance, choose the Ides of September for a home Epulum Iovis: a good meal, with a place set for the god.',
          reflect: [
            'Jupiter\'s worship was public and civic. What would it mean to honour him through your civic life: voting, jury service, keeping agreements?',
            'Which of his festivals feels most alive to you, and why?',
          ],
          further: [
            'Aulus Gellius, Attic Nights 10.15, on the Flamen Dialis (public-domain translation by J. C. Rolfe is on LacusCurtius)',
            'Livy, History of Rome, book 1 (public-domain translations on Gutenberg)',
          ],
          library: ['traditional/deity/juno', 'traditional/deity/minerva', 'traditional/deity/mars'],
          premade: ['cosmic-thursday-jupiter-prosperity'],
        },
        {
          id: 'jupiter-prayer',
          title: 'How Romans prayed and offered',
          summary: 'The exact shape of a Roman prayer, with Cato\'s own words to Jupiter, and the manner of offering.',
          minutes: 8,
          sections: [
            {
              heading: 'Words that must be right',
              body:
                'Roman prayer was precise. Pliny the Elder wrote that a sacrifice without prayer was useless, and that at public rites one person read the words out from a text, another watched to make sure nothing was skipped, and a flute-player played to cover any ill-omened noise. If a word was wrong, the rite could be repeated.\n\nThis sounds legalistic, and in a way it was. Romans saw the relationship with the gods as a matter of good faith on both sides: you said clearly what you were giving and what you asked, and the god, if willing, answered. Ovid tells a story of King Numa bargaining with Jupiter over how to expiate lightning. Jupiter asked for a head; Numa said "of an onion". Jupiter said "a man\'s"; Numa offered "hair". Jupiter asked for a life; Numa said "a fish\'s". Jupiter laughed and accepted (Fasti 3.339–342). The point of the story is that words bind, and that the god enjoyed a careful speaker.',
            },
            {
              heading: 'Cato\'s prayer',
              body:
                'The most complete household prayers to survive are in Cato the Elder\'s farming manual, written around 160 BC. Before the harvest, the farmer offered cakes to Janus and Jupiter. To Jupiter he said:\n\n"Iuppiter, te hoc ferto obmovendo bonas preces precor uti sies volens propitius mihi liberisque meis domo familiaeque meae." (Cato, On Agriculture 134.)\n\nIn plain English: "Jupiter, in offering you this cake, I pray good prayers, that you may be willing and favourable to me and my children, my house and my household." Notice the shape: the god\'s name, the gift named exactly, the request that he be "willing and favourable" (volens propitius), and the people covered by the prayer. Then, offering wine: "be honoured by this wine" (macte vino esto). The word macte means roughly "be increased, be honoured".',
            },
            {
              heading: 'The order of a rite',
              body:
                'Put together from Cato, Livy and the art, a Roman offering usually ran like this. Wash your hands. Cover your head with a fold of cloth (capite velato, "with the head veiled"); Ovid pictures Numa praying with his head veiled in a snow-white cloak. Begin with incense and wine to Janus, and often to Jupiter, as a preface (praefatio). Name the god you are addressing, with titles, sometimes adding "or by whatever name you wish to be called" in case you have it wrong. Name the gift. Make the request, or give thanks. Offer the gift with "macte esto". At the end turn to the right, and in later practice touch the altar.\n\nVesta, goddess of the hearth, closes the prayer: Cicero says that all prayer and sacrifice ends with her. (Ovid, confusingly, says she is addressed first; modern practitioners mostly follow Cicero, with Janus first and Vesta last.)',
            },
            {
              heading: 'What Jupiter receives',
              body:
                'Jupiter, as a god of the sky, received white offerings: white animals in public cult, white cakes, wine and frankincense. Cato\'s farmer offered him a cup of wine (Jupiter Dapalis) and cakes. The god\'s portion went into the fire or was poured out; the rest of a feast was shared and eaten by the household, which was entirely proper. At home, that means a pinch of incense, a pour of wine, mola salsa (salted flour) or a small cake, and then a meal you eat with gratitude.\n\nThe other great offering was the vow, the votum: "if you grant this, I will give that." When it came true the Roman paid, and inscriptions end with the letters V S L M, votum solvit libens merito, "paid the vow willingly and deservedly". With Jupiter especially, never vow what you cannot pay.',
            },
          ],
          knowAndDont: {
            known:
              'Cato\'s prayers survive word for word (On Agriculture 132, 134, 141). Pliny (Natural History 28.10–11) describes the reader, the checker and the flute-player. Livy 8.9 records a pontiff instructing a consul to pray with veiled head and lists the gods in order, beginning with Janus and Jupiter. Cicero (On the Nature of the Gods 2.67) says Vesta comes last. Votive inscriptions with V S L M number in the thousands.',
            unknown:
              'We do not have a full household ritual handbook, so the modern "standard Roman rite" is reconstructed from these pieces. Rules varied by god, place and period; the Greek-rite exceptions (Saturn and Hercules at the Ara Maxima, honoured with bare heads) show that not everything was uniform.',
          },
          inPractice:
            'Practise the form until it is easy: wash, cover your head, incense to Janus, name Jupiter, name the gift, ask "willing and favourable", give with "be honoured", Vesta last, turn right. Write your own prayer to Jupiter in this shape and read it from the page, as Romans did.',
          reflect: [
            'How does it feel to pray from a written text, rather than speaking spontaneously?',
            'What do you think you could vow to Jupiter and be certain of paying?',
          ],
          further: [
            'Cato, On Agriculture 132–134 and 141 (Latin text at The Latin Library; Loeb translation by W. D. Hooper and H. B. Ash on LacusCurtius)',
            'Ovid, Fasti 3.285–392, Numa and Jupiter',
          ],
          library: ['traditional/herb/frankincense', 'traditional/tool/incense_burner', 'traditional/deity/janus', 'traditional/deity/vesta'],
          premade: ['folk-lararium-offering'],
        },
        {
          id: 'jupiter-today',
          title: 'Honouring Jupiter today',
          summary: 'Modern Roman polytheism, the household Jupiter, and how to set up his shrine.',
          minutes: 6,
          sections: [
            {
              heading: 'Who keeps him now',
              body:
                'Modern Roman polytheism, sometimes called the Religio Romana or Cultus Deorum, began to take shape in the late twentieth century. Some practitioners are in Italy, where small associations hold public rites at ancient sites; others are scattered across the world and practise mostly alone or online. Nova Roma, founded in 1998, is one of the better-known international organisations, with its own calendar and priesthoods. Many practitioners belong to no group at all.\n\nThe common ground is reconstruction: using the ancient sources to recover the forms of prayer and offering, and adapting them for a world without public temples. Practitioners differ on how strict to be, whether to use Greek myth, and how far to blend Roman practice with other paths. Eclectic witches and pagans also call on Jupiter, often through planetary magic on Thursday, his day (dies Iovis, giving Italian giovedì). That is a different, astrological tradition, useful in its own right.',
            },
            {
              heading: 'Jupiter at home',
              body:
                'Roman household religion centred on the lararium, the shrine of the household gods, and on the hearth. Jupiter appears there less often than the Lares, but he was not absent: Cato\'s farmer feasts Jupiter Dapalis at home, small bronze Jupiters turn up in house shrines, and every Roman prayed to him at need.\n\nA household Jupiter is honoured in three ways. With regular offerings on the Ides. With a feast at sowing or at the start of a big undertaking, after Jupiter Dapalis. And, most of all, with conduct: keeping your word, dealing fairly, standing by your agreements. The Romans called that good faith fides, and the goddess Fides had her temple right beside his on the Capitol.',
            },
            {
              heading: 'Setting up a shrine',
              body:
                'Choose a high place if you can: a shelf rather than the floor, near a window that shows the sky. Lay a white cloth. You need an image or symbol (a small statue, an eagle, an oak leaf, a lightning bolt, or a coin with his head), an incense burner, an offering dish and a cup. A white or gold candle or an oil lamp is traditional light. Add a jar of mola salsa, a small sealed pot of flour mixed with salt.\n\nPut a written statement on the shrine: a promise you are keeping, or the values you hold yourself to. Romans fixed written vows and dedications to temple walls; your paper is a household version of that. Keep the shrine clean, and dust it before each Ides. A neglected shrine was, to a Roman, a small failure of pietas.',
            },
          ],
          knowAndDont: {
            known:
              'Cato attests the household feast to Jupiter Dapalis; archaeology from Pompeii and elsewhere shows statuettes of Jupiter among household gods. Modern groups, Nova Roma among them, are documented and public about their practice.',
            unknown:
              'Ancient household cult varied hugely, and the evidence is skewed to wealthy houses and Campania. The modern monthly cycle of Ides offerings is a sensible revival of a public practice in private homes rather than a documented ancient household custom.',
          },
          inPractice:
            'Build the shrine this week. Make your first Ides offering on the next 13th or 15th, using the prayer you wrote in the last lesson.',
          reflect: [
            'Where in your home is "high" and open to the sky?',
            'What promise could live on his shrine for the next month?',
          ],
          further: [
            'Harriet I. Flower, The Dancing Lares and the Serpent in the Garden (2017), on Roman household religion',
            'Nova Roma\'s published calendar and religious guides (novaroma.org)',
          ],
          library: ['traditional/tool/altar', 'traditional/vessel/offering_bowl', 'traditional/candle/white', 'traditional/crystal/lapis_lazuli'],
          premade: ['folk-lararium-offering', 'cosmic-thursday-jupiter-prosperity'],
        },
        {
          id: 'jupiter-hard',
          title: 'Oaths, power and the hard parts',
          summary: 'Swearing by Jupiter, the god of a conquering state, and the Greek stories of a god who takes.',
          minutes: 6,
          sections: [
            {
              heading: 'Swearing by the stone',
              body:
                'The most solemn Roman oath was sworn "by Jupiter the Stone", Iuppiter Lapis. The fetial priests, who handled treaties, struck a sacrificial pig with a flint from the shrine of Jupiter Feretrius and called on Jupiter to strike the Roman people likewise if they broke faith. In ordinary speech people swore "me dius fidius", by the god of good faith, a Jovian figure.\n\nThat is the heart of this god: he takes promises with deadly seriousness. For a modern devotee the practical rule is simple. Do not swear by Jupiter at all unless you mean it as an oath. Do not dedicate an intention to him that you will drop when it becomes inconvenient. Small promises, kept, are better than large ones broken.',
            },
            {
              heading: 'The god of an empire',
              body:
                'Jupiter Optimus Maximus was the god in whose name Rome conquered. Triumphs ended at his temple, loot was dedicated to him, and the cult of the Capitol was carried into provinces where it stood for Roman rule. It is honest to say so. Many modern Roman polytheists hold that the gods are not the same as the state that once worshipped them, and that what Jupiter stands for at his best (order with justice, faith kept, the common good) does not require empire.\n\nBe wary of anyone who uses him to glorify Rome\'s conquests or to claim a people\'s superiority. That is politics wearing a god\'s name.',
            },
            {
              heading: 'The Greek stories',
              body:
                'In Greek myth, and in Ovid\'s Latin retellings, Zeus/Jupiter abducts and assaults women and boys: Europa, Io, Leda, Callisto, Ganymede. These stories are disturbing, and pretending otherwise does nobody any favours. They come from Greek tradition and literary invention, and they were not part of Roman temple worship.\n\nModern devotees handle them in different ways. Some read them as poetic myth about the sky\'s power over the earth; some reject them as belonging to another religion; some simply refuse to honour that side of the figure. Whatever you decide, you are not required to admire or excuse it.',
            },
            {
              heading: 'What not to do',
              body:
                'A few customs to respect. Do not invoke him casually or as a curse; Roman tradition did not ask Jupiter for private harm, and this app does not either. Do not treat lightning-struck ground or a storm as a toy. Do not come to him for a love spell or a quick win: he is approached formally, for things that matter, and for order in your life. And keep the forms. If you mispronounce a name or lose your place, stop, and begin the prayer again.',
            },
          ],
          knowAndDont: {
            known:
              'Livy 1.24 describes the fetial oath with the flint, and Polybius (3.25) mentions the oath by Jupiter Lapis in treaties with Carthage. The Greek myths of Zeus\'s abductions are amply attested in Greek literature and Ovid\'s Metamorphoses.',
            unknown:
              'How far ordinary Romans connected the poets\' Jupiter with the god of the Capitol is unclear; Roman writers themselves sometimes mocked the myths (Varro distinguished "the gods of the poets" from those of the city). Modern ethical readings of the myths are modern.',
          },
          inPractice:
            'Write down every promise you have currently made to yourself or others. Pick one you have been neglecting and either keep it this week or honestly release it. That is good preparation for Jupiter.',
          reflect: [
            'What do you do with a god whose old stories you cannot admire?',
            'Where in your life do you keep faith, and where do you let it slip?',
          ],
          further: [
            'Livy 1.24, the fetial treaty with Alba Longa',
            'Ovid, Metamorphoses (public-domain translations on Gutenberg), read critically',
          ],
          library: ['traditional/deity/jupiter'],
        },
      ],
      practices: [
        {
          id: 'jupiter-promise-record',
          title: 'Keep a promise log',
          instructions:
            'Through the study stage, note each day one promise you made and whether you kept it, however small: replying to a message, turning up on time, doing the washing up.',
          times: 10,
          every: 'day',
          prompt: 'What did I promise today, and did I keep it? What got in the way?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights of the kept word',
      intro:
        'Nine nights of short offerings built around one promise. Nine was a meaningful number in Roman religion: a nine-day rite (novendiale) was held to expiate prodigies, and the ninth day closed a period of mourning. Here it frames a practice, not a claim about ancient custom.',
      days: 9,
      lessons: [],
      practices: [
        {
          id: 'jupiter-nine-nights',
          title: 'Nightly offering to Jupiter',
          instructions:
            'Before the first night, choose one promise you will keep for nine days: a daily task, an honesty, a kindness you owe. Write it on a card and set it on the shrine.\n\nEach night: wash your hands, cover your head, give a grain of incense to Janus, then speak to Jupiter in the Roman form ("Jupiter Optimus Maximus… be willing and favourable to me and my household"). Say aloud whether you kept the promise that day. Pour a little wine or water, or sprinkle a pinch of mola salsa, with "macte esto, be honoured". Name Vesta last, turn to the right, uncover.\n\nIf you break the promise one day, say so plainly and begin again the next. Honesty about a failure is closer to fides than pretending.',
          times: 9,
          every: 'day',
          prompt: 'Did I keep my word today? What did it cost, and what did it give me? Did the sky or the shrine feel different?',
        },
        {
          id: 'jupiter-dapalis-meal',
          title: 'A feast for Jupiter Dapalis',
          instructions:
            'Once in the nine nights, cook a simple meal, ideally with bread. Before eating, set aside a cup of wine or juice and a little bread. Following Cato, say: "Jupiter Dapalis, as is fitting for you in my house and household, be honoured by this feast." Pour a little of the cup out, and put a morsel of bread aside for him. Cato adds: "give to Vesta, if you wish", so set a crumb by the stove too. Then eat the rest with company if you can. The god\'s portion goes to earth or compost afterwards.',
          times: 1,
          prompt: 'What did it feel like to share a meal with a god, and then eat it?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Weighing it honestly',
      intro:
        'A few days to stop and decide. Jupiter is not every person\'s god, and a relationship built on oaths should not be entered lightly. Stopping, pausing, or choosing another god or path is a good outcome. It is exactly the kind of honest judgement he respects.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'jupiter-discern-write',
          title: 'Write it out',
          instructions: 'Answer the questions below in your journal, one sitting each day. Read back your promise log and nine-night notes before you start.',
          times: 3,
          every: 'day',
          prompt: 'What am I actually drawn to here: the god, the order, the forms, or the idea of a powerful patron?',
        },
      ],
      questions: [
        'Did the formal Roman manner of prayer feel like respect, or like a costume? Either answer is useful.',
        'Can I keep a regular monthly offering on the Ides for a year?',
        'Am I prepared to treat promises as sacred in daily life, not just at the shrine?',
        'How do I feel about his place as a god of Roman power and conquest, and about the Greek stories?',
        'Am I drawn to Jupiter himself, or to another god of the Roman house, Janus, Vesta, Juno, Minerva, who might fit better?',
        'Would I rather keep learning without dedicating for now? That is a perfectly good choice.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication',
      intro:
        'If you have decided to go ahead, this is a self-dedication in Roman form. It is not an initiation and does not make you a priest or flamen; the old priesthoods were public offices, and modern groups that keep priesthoods have their own processes. What you make here is a personal commitment, stated precisely, with a vow small enough to keep.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Jupiter Optimus Maximus',
        summary: 'Purification, Janus first, a formal prayer, a written vow placed on the shrine, offerings of incense, wine and cake, and Vesta last.',
        minutes: 40,
        ingredients: [
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A head covering: scarf, shawl or fold of cloth' },
          { name: 'Clean clothes, white or pale if you have them' },
          { name: 'Frankincense', ref: 'traditional/herb/frankincense' },
          { name: 'An incense burner', ref: 'traditional/tool/incense_burner' },
          { name: 'Wine or grape juice in a cup', ref: 'traditional/tool/chalice' },
          { name: 'An offering dish', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A libum or small cake (see preparation), or bread' },
          { name: 'Mola salsa: plain flour with a pinch of salt' },
          { name: 'Your written dedication and vow, on good paper' },
          { name: 'A white or gold candle', ref: 'traditional/candle/white' },
          { name: 'An oak leaf or bay leaf', ref: 'traditional/herb/oak', optional: true },
        ],
        preparation:
          'If you can, hold the rite on the Ides. Bake a libum the day before, after Cato\'s recipe (On Agriculture 75): mash about 250 g of ricotta, mix in 100 g of plain flour and one beaten egg, shape into a round, set it on a few bay leaves on a baking tray and bake at 200°C for 35–40 minutes until golden. Drizzle with honey if you like (bay leaves are for the tray, not for eating).\n\nWrite your dedication. State who you are, that you are dedicating yourself to Jupiter Optimus Maximus as a devotee, for what period (a year is wise), what you will do (offerings on the Ides, a kept promise, a value you will uphold), and close with "willing and favourable". Read it aloud twice to practise. Clean the shrine and bathe.',
        steps: [
          {
            title: 'Purify and veil',
            instructions: 'Wash your hands and face in the clean water. Put on clean clothes. Draw the covering over your head. Light the candle.',
            light: true,
          },
          {
            title: 'Janus first',
            instructions: 'Incense and a drop of wine to Janus, so the door is open.',
            spoken: 'Father Janus, first of the gods in every prayer:\nbe honoured by this incense and this wine,\nand open the way to Jupiter.',
          },
          {
            title: 'The invocation',
            instructions: 'Face the sky or the window. Raise your hands, palms up. Add incense.',
            spoken: 'Jupiter Optimus Maximus, Best and Greatest,\nfather of the bright sky, god of the Capitol,\nwitness of oaths, keeper of good faith,\nor by whatever name it is right to call you:\nI offer you this incense, and I pray good prayers,\nthat you may be willing and favourable\nto me, my house and my household.',
          },
          {
            title: 'Read the dedication',
            instructions: 'Read your written dedication aloud, clearly and in full. If you stumble on a word, stop, breathe, and begin the dedication again from the start.',
            minutes: 5,
          },
          {
            title: 'Offer',
            instructions: 'Break a piece from the libum and set it in the dish, sprinkled with mola salsa. Pour wine over or beside it.',
            spoken: 'Jupiter, be honoured by this cake.\nBe honoured by this wine.\nAs I have spoken, so I will do.',
          },
          {
            title: 'Place the vow',
            instructions: 'Lay the written dedication on the shrine, under the oak or bay leaf if you have one. It stays there for the year.',
          },
          {
            title: 'Silence',
            instructions: 'Stand quietly. Watch the flame and the sky.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'Name Vesta, turn to your right, and uncover your head. Snuff the candle.',
            spoken: 'Vesta, keeper of the hearth, be honoured. It is done.',
            snuff: true,
          },
        ],
        closing:
          'Eat the rest of the libum yourself, ideally shared with someone, as Romans ate the feast after the god\'s portion was given. Leave the god\'s portion until the next day, then put it in the earth or compost. Note the date: your rededication falls a year from today, or on the next Ides of September.',
        safety:
          'Never leave the candle or incense unattended; use a heatproof dish. The libum contains dairy, egg and gluten. Wine, grapes and raisins are toxic to dogs and cats, and salt in quantity is harmful to pets: keep the offering dish out of their reach and dispose of it where they cannot get it.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping faith through the year',
      intro:
        'Jupiter\'s worship is rhythmic and public-facing: monthly on the Ides, yearly at the games, and daily in how you keep your word. This stage sets you up for the year after.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'jupiter-ides',
          title: 'The Ides offering',
          instructions:
            'On every Ides (the 13th, or the 15th in March, May, July and October): wash, cover your head, Janus first, then incense and wine to Jupiter with your prayer in the Roman form. Check the promise on his shrine. Name Vesta last and turn right.',
          times: 12,
          every: 'month',
          prompt: 'Did I keep faith this month? What order did I bring, and where did I let things slide?',
          premade: 'folk-lararium-offering',
        },
        {
          id: 'jupiter-year',
          title: 'The yearly round',
          instructions:
            'Mark these in your calendar: the Vinalia on 23 April (pour the first of a new bottle to Jupiter), the Vinalia Rustica on 19 August, the Ludi Romani in September with a home Epulum Iovis on the Ides of September (a good meal, a place set for the god, his portion given first), and the Ides of November. Rededicate yearly, on your dedication anniversary or the Ides of September: reread your vow, report honestly on how you kept it, and make the next year\'s promise.',
          times: 1,
          prompt: 'What changed in me this year because of the promises I kept?',
        },
      ],
    },
  ],
  sources: [
    'Cato the Elder, On Agriculture 75, 132, 134, 141 and 143 (Latin text, The Latin Library: https://www.thelatinlibrary.com/cato/cato.agri.html)',
    'Ovid, Fasti 3.339–342 and 3.363 (Latin text, The Latin Library: https://www.thelatinlibrary.com/ovid/ovid.fasti3.shtml); English renderings in this journey are original',
    'Livy, History of Rome 1.24 and 8.9 (Latin text, The Latin Library: https://www.thelatinlibrary.com/livy/liv.8.shtml)',
    'Pliny the Elder, Natural History 28.10–11, on the reading and checking of prayers (paraphrased)',
    'Cicero, On the Nature of the Gods 2.67, Vesta last in prayer (paraphrased)',
    'Aulus Gellius, Attic Nights 10.15, the rules of the Flamen Dialis (paraphrased)',
    'Mary Beard, John North and Simon Price, Religions of Rome (Cambridge, 1998)',
    'John Scheid, An Introduction to Roman Religion (Edinburgh, 2003)',
    'Harriet I. Flower, The Dancing Lares and the Serpent in the Garden (Princeton, 2017)',
  ],
};
