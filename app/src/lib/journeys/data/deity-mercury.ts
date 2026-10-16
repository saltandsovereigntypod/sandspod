import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-mercury',
  kind: 'deity',
  paths: ['roman', 'celtic'],
  deityRef: 'traditional/deity/mercury',
  title: 'Mercury of the Marketplace',
  summary:
    'A month with Mercury, god of merchants, messages and roads: his temple facing the Circus, the Mercuralia of 15 May and the spring by the Porta Capena, the great Mercury of Gaul, the guide of souls, and how to keep his worship honest.',
  welcome:
    'This journey runs about a lunar month. You will learn who Mercury was to the Romans, how merchants kept his feast on the Ides of May by sprinkling their goods with water from his spring, how he became the greatest god of Gaul, how he leads the dead, and how people honour him today. There is a nine-day practice of honest dealing and clear words, a Roman-style opening rite and, at the end, a self-dedication.\n\nIt is a self-dedication, not an initiation. It gives no membership of a Hermetic order, a Gaulish revival group or any other tradition that has its own initiations. It is a promise between you and the god of fair exchange, made in the Roman manner.',
  about:
    'Mercury is the Roman god of trade, profit, messages and travel. The Romans connected his name with merx, merchandise, and he had a temple on the slope of the Aventine overlooking the Circus Maximus, dedicated on the Ides of May in 495 BC, when a guild of merchants was founded around his cult. Romans matched him with the Greek Hermes, so he took on Hermes\'s winged hat and sandals, his herald\'s staff, the caduceus, his quick wit and his role as messenger of the gods and guide of the dead. To these the Romans added a purse, his most Roman sign. On the Mercuralia merchants drew water from his spring near the Porta Capena and sprinkled their goods with laurel. In Gaul and Britain, Julius Caesar said, Mercury was the most honoured god of all, a Roman name laid over a great Celtic deity often shown with the goddess Rosmerta. Today he is honoured by Roman polytheists and by many who work in trade, writing, travel and communication.',
  notes: [
    'This journey uses the Roman form throughout: clean hands, head covered (capite velato), exact words read from a page, Janus first. It follows the common modern pattern of Janus first and Vesta last in prayer, with the first share of food set aside for Vesta. The ancient sources disagree on Vesta: Cicero says prayer ends with her, while Ovid (Fasti 6.303–304) says she is addressed first. Choose one and keep to it.',
    'Mercury is also a trickster and a god of thieves. Ovid\'s merchant asks him to wash away his lies; this journey asks him for honest profit instead.',
    'The Gaulish "Mercury" was a Celtic god given a Roman name. Learn him on his own terms if you follow a Celtic path; the Roman name tells us little about his native one.',
    'The astrologer\'s Mercury (and Mercury retrograde) and the Hermes Trismegistus of Hermeticism are later traditions, related but distinct. They are labelled where they appear.',
    'No curses here, though Mercury received many curse tablets in Roman Britain. Ask him to return what is yours and to guard your dealings.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'At the crossroads',
      intro:
        'Begin where Mercury lives: on the road and at the point of exchange. Before the rite, notice your own exchanges for two days: what you buy, sell, send and promise. Then greet him in the Roman way.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'mercury-notice',
          title: 'Notice your exchanges',
          instructions:
            'For two days, notice every exchange you make: a purchase, a message, a favour, a promise. At the end of each day, write down one that was fair and one that could have been fairer.',
          times: 2,
          every: 'day',
          prompt: 'Where in my dealings was I honest, and where did I cut a corner?',
        },
      ],
      rite: {
        title: 'Greeting Mercury',
        summary: 'Wash and veil, Janus first, an orange or yellow flame for Mercury, incense, a coin and a little milk, and Vesta last.',
        minutes: 25,
        ingredients: [
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A head covering' },
          { name: 'An orange or yellow candle in a stable holder', ref: 'traditional/candle/orange' },
          { name: 'Frankincense and a burner', ref: 'traditional/herb/frankincense' },
          { name: 'A coin', },
          { name: 'A little milk in a small cup, or a honey cake on a dish', ref: 'traditional/vessel/dish' },
          { name: 'A sprig of bay (laurel)', ref: 'traditional/herb/bay' },
          { name: 'Your words on a card' },
        ],
        preparation:
          'Set a small space near your desk or front door. Read the words until you can say them without stumbling: Roman prayers were read exactly, and if you trip you begin again. If you use the honey cake, set a crumb aside on a saucer for Vesta, the first share of food.',
        steps: [
          {
            title: 'Wash and veil',
            instructions: 'Wash your hands and dry them. Cover your head with a fold of cloth.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the incense and give a few grains to Janus, the god of doors and beginnings.',
            spoken: 'Father Janus, opener of the way,\nbe honoured by this incense,\nand open the way to Mercury.',
          },
          {
            title: 'Light his flame',
            instructions: 'Light the candle. Lay the laurel beside it.',
            spoken: 'Mercury, grandson of Atlas, messenger of the gods,\ngod of merchants and of roads,\nor by whatever name it pleases you to be called:\nI greet you with this light.',
            light: true,
          },
          {
            title: 'Offer',
            instructions: 'Give more incense, as Ovid says merchants did. Set down the coin and the milk or cake. Name each gift.',
            spoken: 'Mercury, be honoured by this incense,\nby this coin and this milk.\nBe willing and favourable to me and my household.\nI have come to learn your ways.',
          },
          {
            title: 'Listen',
            instructions: 'Sit quietly for a few minutes. Mercury is a god of messages; notice what comes to mind.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'A word or pinch of incense for Vesta. Turn to your right, uncover your head and put out the flame.',
            spoken: 'Vesta, last as always: be honoured.',
            snuff: true,
          },
        ],
        closing:
          'Pour the milk onto soil outside the next day. Keep the coin on his shrine; when several have gathered, give them to someone who needs them, or to a charity, as his gift passed on.',
        safety:
          'Never leave the candle unattended, and keep it away from papers on your desk. Keep incense smoke away from birds and anyone with asthma. Do not leave milk out where pets will drink it; many cats are lactose intolerant. Keep coins away from small children and pets, who can swallow them.',
      },
    },
    {
      kind: 'study',
      title: 'Purse, staff and winged feet',
      intro:
        'Five lessons, about two days each: who Mercury is; the Mercuralia and the spring by the Porta Capena; Mercury in Gaul and Britain, and as guide of souls; honouring him today, with his shrine; and the trickster, the curse tablets and the later Mercuries.',
      days: 11,
      lessons: [
        {
          id: 'mercury-who',
          title: 'Who Mercury is',
          summary: 'The god of merchandise, his temple by the Circus, and what he took from Hermes.',
          minutes: 6,
          sections: [
            {
              heading: 'The god of merchandise',
              body:
                'The Romans derived Mercury\'s name from merx, merchandise, and mercari, to trade. Modern scholars think they were probably right. Unlike Jupiter or Mars, he does not seem to be one of the oldest gods of Rome; he arrives with trade, possibly by way of Greek and Etruscan contact, as Rome became a city of markets.\n\nLivy says his temple was dedicated on the Ides of May in 495 BC (2.21). The two consuls quarrelled over which of them should have the honour, and the people gave it instead to a senior centurion, Marcus Laetorius, who was also put in charge of the grain supply and of founding a guild of merchants (2.27). The temple stood on the slope of the Aventine looking down on the Circus Maximus, near the river port and the cattle and vegetable markets: exactly where the traders were.',
            },
            {
              heading: 'What came from Hermes',
              body:
                'Romans soon identified Mercury with the Greek Hermes and took over his stories and appearance. He became the son of Jupiter and Maia, daughter of Atlas; the herald of the gods, carrying the caduceus, a staff entwined with two snakes; a youth in a winged travelling hat (the petasus) and winged sandals. Horace\'s hymn to him begins "Mercuri, facunde nepos Atlantis", "Mercury, eloquent grandson of Atlas", who shaped the wild ways of the first humans with speech and with the graceful custom of the wrestling-school (Odes 1.10).\n\nHorace tells the stories too: how as a baby Mercury stole Apollo\'s cattle, and while Apollo was threatening him, stole his quiver as well, so that Apollo burst out laughing; and how he invented the lyre. A god who can make Apollo laugh at being robbed is a god of wit as much as of trade.',
            },
            {
              heading: 'The purse',
              body:
                'Roman images of Mercury add something Greek Hermes rarely carries: a fat money-bag (marsupium) in his hand. Statuettes of Mercury with his purse turn up in houses, shops and household shrines all over the Roman world. This is the most Roman thing about him. Romans asked him plainly for profit, and they kept his image where money changed hands.',
            },
            {
              heading: 'His signs',
              body:
                'His symbols are the caduceus, the winged hat and sandals, and the purse. His animals are the cockerel (who announces the day), the ram and the goat, and the tortoise from whose shell he made the first lyre. His plant is the laurel, used at his spring. His offerings were incense above all, with wine, milk, cakes and coins. His day in the later planetary week is Wednesday, dies Mercurii (French mercredi, Italian mercoledì). His colours today are orange, yellow and silver.',
            },
          ],
          knowAndDont: {
            known:
              'Livy 2.21 and 2.27 (verified in Latin and paraphrased) on the temple and the merchants\' guild. Horace, Odes 1.10 (verified in Latin) for the eloquent Mercury, the cattle theft and the lyre. Purse-carrying statuettes of Mercury are common archaeological finds.',
            unknown:
              'Whether Mercury had any native Italian roots before Greek and Etruscan influence is uncertain (the Etruscan Turms was similar). Exactly how the merchants\' guild worked is not known.',
          },
          inPractice:
            'Find or print a small image of Mercury with his purse and put it near where you work or handle money. Greet him when you start a working day.',
          reflect: [
            'What does it mean to me to have a god of profit and trade?',
            'Where in my life do I most need clear words?',
          ],
          further: [
            'Horace, Odes 1.10 (Latin at The Latin Library; public-domain translations on Gutenberg)',
            'Livy 2.21 and 2.27 (public-domain translations on Gutenberg)',
          ],
          library: ['traditional/deity/mercury', 'traditional/deity/hermes', 'traditional/herb/bay'],
        },
        {
          id: 'mercury-mercuralia',
          title: 'The Mercuralia and the spring',
          summary: 'The Ides of May, the water by the Porta Capena, the laurel sprinkling, the merchant\'s cheeky prayer, and how to keep 15 May.',
          minutes: 7,
          sections: [
            {
              heading: 'The Ides of May',
              body:
                'Ovid\'s Fasti gives the festival. He calls on Mercury, "clare nepos Atlantis", "famous grandson of Atlas", "pacis et armorum superis imisque deorum / arbiter", "go-between in peace and war for the gods above and below", and says: "templa tibi posuere patres spectantia Circum / Idibus; ex illo est haec tibi festa dies", "the fathers built you a temple facing the Circus on the Ides; from then on this has been your feast day" (Fasti 5.663–670). Macrobius adds that on this day merchants offered to Maia, Mercury\'s mother, as well as to him.\n\nThen: "te, quicumque suas profitentur vendere merces, / ture dato tribuas ut sibi lucra rogant", "all who make it their business to sell their goods give you incense and ask you to grant them profit" (5.671–672).',
            },
            {
              heading: 'The water by the Capena gate',
              body:
                '"est aqua Mercurii portae vicina Capenae; / si iuvat expertis credere, numen habet", "there is a water of Mercury near the Capena gate; if you trust those who have tried it, it has divine power" (5.673–674). The Porta Capena was the gate in the old city wall where the Appian Way left Rome for the south, a place of travellers.\n\nOvid describes the merchant coming, his tunic belted up, purified, carrying a jar that has been cleansed with smoke, and drawing the water. He dips a laurel branch in it and sprinkles everything that is going to new owners, and then sprinkles his own hair with the dripping laurel (5.675–679).',
            },
            {
              heading: 'The merchant\'s prayer',
              body:
                'And then the joke. The merchant prays, in a voice used to deceiving: "ablue praeteriti periuria temporis", "wash away the false oaths of time past", and the lying words of the day before. If I called you as a witness falsely, he says, or swore by Jupiter\'s name thinking he would not hear, let the winds carry the wicked words away. Let me lie again tomorrow, and the gods not care. "da modo lucra mihi, da facto gaudia lucro", "only give me profit, and give me joy in the profit made", and let me enjoy cheating the buyer. And Mercury, Ovid says, laughs at him from on high, remembering the cattle he stole himself (5.681–692).\n\nOvid is being funny. But the joke tells you something true: Romans knew Mercury was the god of the clever dealer as well as the fair one. A devotee has to choose which kind of dealer to be.',
            },
            {
              heading: 'Keeping 15 May today',
              body:
                'A modern Mercuralia: draw a jar of fresh water in the morning (from a spring if you have one near you, otherwise the tap), having washed your hands and cleaned the jar. Dip a sprig of bay in it and sprinkle your tools of trade: your laptop bag (not the laptop), your shop counter, your tools, your notebook, your cash box or wallet, and anything you are about to sell. Sprinkle a little on your own head. Give incense to Mercury and ask for honest profit. Then, unlike Ovid\'s merchant, ask him to help you keep your word, not to excuse breaking it. Give to Maia too: a flower or a little milk. Put a coin aside for someone in need.',
            },
          ],
          knowAndDont: {
            known:
              'Ovid, Fasti 5.663–692 (verified in Latin) for the temple, the incense, the spring, the laurel and the merchant\'s prayer. Livy 2.21 dates the temple to the Ides of May. Macrobius (Saturnalia 1.12.19) on merchants honouring Maia and Mercury in May (paraphrased).',
            unknown:
              'The exact location of the aqua Mercurii near the Porta Capena is not certain; several springs have been suggested. How seriously real merchants took the "washing away of lies", and how much is Ovid\'s satire, cannot be known.',
          },
          inPractice:
            'Put 15 May in your calendar. Choose the "tools of trade" you will sprinkle, and find a jar to keep only for his water.',
          reflect: [
            'What would I want washed away from my past dealings, and what would I promise instead?',
            'What, in my working life, is "going to new owners": goods, words, work?',
          ],
          further: [
            'Ovid, Fasti 5.663–692 (Latin at The Latin Library; Riley\'s 1851 prose translation)',
            'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (1981)',
          ],
          library: ['traditional/deity/mercury', 'traditional/herb/bay', 'traditional/vessel/bottle'],
          premade: ['kitchen-cleansing-floor-wash'],
        },
        {
          id: 'mercury-gaul',
          title: 'Mercury of Gaul and the guide of souls',
          summary: 'The greatest god of the Gauls, Rosmerta, the shrine at Uley, Wednesday, and Mercury who leads the dead.',
          minutes: 7,
          sections: [
            {
              heading: 'The god the Gauls honoured most',
              body:
                'Julius Caesar, describing the religion of Gaul in the 50s BC, wrote: "Deum maxime Mercurium colunt. Huius sunt plurima simulacra: hunc omnium inventorem artium ferunt, hunc viarum atque itinerum ducem, hunc ad quaestus pecuniae mercaturasque habere vim maximam arbitrantur", "Of the gods they worship Mercury most. There are very many images of him; they say he invented all the arts, that he is the guide of roads and journeys, and they think he has the greatest power over making money and trade" (Gallic War 6.17).\n\nCaesar was using Roman names for Gaulish gods. Which Gaulish god he meant is debated; many scholars think of Lugus, whose name survives in places like Lugdunum (Lyon), but this is not certain. Hundreds of inscriptions to Mercury with Gaulish surnames show that many local gods were honoured under his name, such as Mercurius Dumias, whose great temple stood on the summit of the Puy de Dôme in central France.',
            },
            {
              heading: 'Mercury and Rosmerta',
              body:
                'In Gaul and Britain, Mercury is often shown with a goddess, Rosmerta, whose name may mean "great provider". She carries a cornucopia, a purse, a ladle or a bucket, and the pair are honoured together for prosperity. She has no Roman equivalent at all; she belongs to the Celtic world. If you are drawn to the Gaulish Mercury, honour Rosmerta beside him.',
            },
            {
              heading: 'Uley and Wednesday',
              body:
                'At Uley in Gloucestershire stood a temple of Mercury where archaeologists found well over a hundred lead tablets. Most ask Mercury to find a thief and return stolen property: a cow, a ring, a cloak, some tools. They offer him part of the value if he succeeds. They show ordinary people in Roman Britain turning to Mercury as a god of justice in exchange. (This journey has no curses; you can ask him to help recover what is yours and leave the thief to the law.)\n\nThe Roman historian Tacitus says the Germans, too, honoured Mercury above all gods (Germania 9), probably meaning the god later called Woden or Odin. That is why the day of Mercury, dies Mercurii, became Woden\'s day, Wednesday, in English.',
            },
            {
              heading: 'The guide of souls',
              body:
                'Like Hermes, Mercury leads the dead to the underworld. Horace ends his hymn: "Tu pias laetis animas reponis / sedibus virgaque levem coerces / aurea turbam, superis deorum / gratus et imis", "you set the souls of the good in happy dwellings, and with your golden wand you herd the weightless crowd, dear to the gods above and those below" (Odes 1.10.17–20). Ovid tells how Mercury led the nymph Lara down to the shades, and that she bore him twins, the Lares of the crossroads (Fasti 2.583–616). So the god of the marketplace is also the god at the last crossing, gentle with the dead.',
            },
          ],
          knowAndDont: {
            known:
              'Caesar, Gallic War 6.17 (verified in Latin). Horace, Odes 1.10.17–20 (verified in Latin). The Uley tablets are published (Tomlin and others) and in the British Museum. Mercury-Rosmerta reliefs and the Puy de Dôme temple are well documented.',
            unknown:
              'Which native god or gods Caesar meant by "Mercury" in Gaul is unknown; Lugus is a common guess. Rosmerta\'s meaning and myths are lost. Tacitus\'s German Mercury is usually taken as Woden, but the identification is Roman, not German.',
          },
          inPractice:
            'If someone close to you has died, ask Mercury to guide them gently, with a little incense and their name spoken aloud. If grief is heavy, do not carry it alone: talk to someone you trust, your doctor, or a bereavement service (in the UK, Cruse Bereavement Support; elsewhere, your local hospice or GP can point you to one). If you follow a Celtic path, read about Rosmerta before deciding how to honour the pair.',
          reflect: [
            'What do I make of a god who is both a dealer and a guide of the dead?',
            'What did I lose that I would like returned, and can I ask for it without wishing harm?',
          ],
          further: [
            'Caesar, Gallic War 6.13–18 (Latin at The Latin Library; public-domain translations on Gutenberg)',
            'Miranda Green, Dictionary of Celtic Myth and Legend (1992), on Mercury and Rosmerta',
            'R. S. O. Tomlin, "The Inscribed Lead Tablets", in A. Woodward and P. Leach, The Uley Shrines (1993)',
          ],
          library: ['traditional/deity/mercury', 'traditional/deity/lugh', 'traditional/deity/odin'],
          premade: ['hedge-ancestor-candle-evening'],
        },
        {
          id: 'mercury-today',
          title: 'Honouring Mercury today',
          summary: 'The Roman manner, his offerings, first earnings and fair dealing, travel blessings, and his shrine.',
          minutes: 7,
          sections: [
            {
              heading: 'The Roman manner',
              body:
                'Mercury is approached like every Roman god. Wash your hands. Cover your head (capite velato). Give incense or wine first to Janus. Name Mercury with a title: "Mercury, grandson of Atlas", "Mercury, god of merchants", "Mercury, guide of roads". Add "or by whatever name it pleases you to be called." Name each gift, and ask him to be "willing and favourable" (volens propitius) to you and your household. Make your request plainly and specifically. Give with "be honoured by this" (macte esto). End with Vesta, turn to your right and uncover.\n\nRead your prayer from a page, exactly; Pliny says Romans did so that no word was missed. A god of contracts appreciates precision. This journey follows the common modern pattern of Janus first and Vesta last in prayer, with the first share of food set aside for Vesta. The ancient sources disagree, so choose and keep to it.',
            },
            {
              heading: 'What to give',
              body:
                'Incense is his oldest offering. Milk, wine, honey cakes and coins suit him. Many devotees give him the first earnings of a new job or venture: a small part of the first payment, given to charity or set on his shrine and then passed on. Coins left on his shrine should not just pile up; Mercury is the god of circulation. Give them away.\n\nAnd give him your fair dealing. Pay invoices on time. Write clearly. Keep your word in contracts. Give honest reviews and honest change. These are the offerings a god of exchange values most.',
            },
            {
              heading: 'Roads and messages',
              body:
                'Before a journey, give Mercury a pinch of incense or a word at the door and ask for a safe road and a safe return. When you get back, thank him. Before an important message, an interview, an exam, a sales call, a hard conversation, ask him for clear and honest words. Some devotees keep a small Mercury figure or a caduceus in their car, bag or on their desk.\n\nThe community: Roman polytheists honour Mercury in the reconstructed manner, especially on 15 May. Gaulish and Celtic reconstructionists honour the Gaulish god under his native names. Hellenic polytheists honour Hermes, with stones added to roadside herms. Modern witches often work with Mercury on Wednesdays for communication and study. Keep each in its own setting.',
            },
            {
              heading: 'Setting up his shrine',
              body:
                'Put it near your desk, your shop counter or your front door: places of work and travel. You need an orange or yellow candle, an incense burner, a small cup for milk or wine, a dish, and an image of Mercury, a caduceus, a winged sandal or a small purse. A jar for his spring water and a sprig of bay belong there too. Keep a little box for coins to pass on. Agate or citrine are modern additions if you like stones.',
            },
          ],
          knowAndDont: {
            known:
              'Incense from merchants and the prayer for profit are in Ovid, Fasti 5.671–672. Purse-carrying household statuettes show private devotion. The Roman prayer form is attested by Cato, Livy and Pliny (Natural History 28.10–11).',
            unknown:
              'How individual Roman traders prayed to Mercury day to day is mostly unrecorded. First-earnings offerings and travel blessings are modern customs, built on ancient habits of first-fruits and vows for safe journeys.',
          },
          inPractice:
            'Set up his shrine. Write a short prayer for your working day in the Roman shape, and say it when you begin work.',
          reflect: [
            'What would my working life look like if every exchange were one I would be glad to show Mercury?',
            'What journeys or messages in the coming month do I want to ask him to guard?',
          ],
          further: [
            'John Scheid, An Introduction to Roman Religion (2003)',
            'Mary Beard, John North and Simon Price, Religions of Rome (1998)',
          ],
          library: ['traditional/deity/mercury', 'traditional/tool/altar', 'traditional/candle/orange', 'traditional/crystal/citrine'],
          premade: ['cosmic-wednesday-mercury-study', 'folk-lararium-offering'],
        },
        {
          id: 'mercury-hard',
          title: 'Trickster, thief and later Mercuries',
          summary: 'The god of thieves, curse tablets, Hermes Trismegistus and astrology\'s Mercury, and what not to do in his name.',
          minutes: 6,
          sections: [
            {
              heading: 'God of thieves',
              body:
                'Mercury was god of thieves as well as merchants, and Romans did not find that contradictory: both are about things changing hands, quickly and cleverly. His myths are full of theft and trickery, and Ovid\'s merchant prays to have his lies washed away. A modern devotee need not pretend this side is not there. But you can choose. Ask him for wit and quickness, and spend them on fair dealing. Cleverness that cheats people is the worst kind of offering to bring to a god of exchange; it breaks the very thing he governs.',
            },
            {
              heading: 'The curse tablets',
              body:
                'Many of the tablets at Uley, and others across Roman Britain, are what scholars call prayers for justice: they ask the god to punish a thief, sometimes in grim bodily terms, until the stolen thing is returned. It is real Roman religion, and it is honest to know it. This app does not write curses. If you have been robbed or cheated, report it, ask Mercury to help the truth come out and the thing come back, and leave punishment to the proper authorities.',
            },
            {
              heading: 'Hermes Trismegistus',
              body:
                'In Roman Egypt, Greek-speaking writers merged Hermes with the Egyptian Thoth and produced Hermes Trismegistus, "thrice-great Hermes", the legendary author of the Hermetic writings on philosophy, astrology and alchemy, mostly from the first to third centuries AD. Renaissance magicians revived these, and they shaped Western esotericism and modern magic. Hermes Trismegistus is a fascinating figure, but he is not the Roman Mercury of the marketplace. If you work with both, keep them distinct.',
            },
            {
              heading: 'The planet, and what not to do',
              body:
                'In astrology, Mercury rules communication, travel and trade, and "Mercury retrograde" is blamed for crossed wires. That is a modern astrological idea built on the planet\'s apparent backward motion; it is not Roman religion. You can use it, but call it what it is.\n\nWhat not to do: do not ask Mercury to help you deceive, to excuse broken promises, or to harm a rival. Do not let coins pile up on his shrine as though he were a savings jar; pass them on. Do not ignore the Gaulish and Germanic peoples whose gods were given his name: learn them in their own right.',
            },
          ],
          knowAndDont: {
            known:
              'Ovid, Fasti 5.681–692, on the merchant\'s prayer. The Uley tablets are published. The Hermetic writings date mainly to the first to third centuries AD. Mercury retrograde is a feature of astrological, not Roman religious, practice.',
            unknown:
              'How the Roman trickster god and the patron of honest trade fitted together in the minds of ordinary worshippers is not recorded. The age and origins of the Hermetic texts are still debated in detail.',
          },
          inPractice:
            'Write down one "trick" in your working life you will stop using, and offer its stopping to Mercury as a gift.',
          reflect: [
            'Where is the line, for me, between wit and deception?',
            'What would I want from Mercury if I had been cheated, and what would I not ask?',
          ],
          further: [
            'Brian Copenhaver, Hermetica (1992), on Hermes Trismegistus',
            'H. S. Versnel, "Beyond Cursing: The Appeal to Justice in Judicial Prayers", in C. A. Faraone and D. Obbink (eds), Magika Hiera (1991), where the term "prayers for justice" comes from',
            'R. S. O. Tomlin, "The Inscribed Lead Tablets", in A. Woodward and P. Leach, The Uley Shrines (1993), the Mercury tablets themselves',
          ],
          library: ['traditional/deity/mercury', 'traditional/deity/thoth', 'traditional/deity/hermes'],
          premade: ['cosmic-mercury-retrograde-steadying'],
        },
      ],
      practices: [
        {
          id: 'mercury-workday',
          title: 'A word before work',
          instructions:
            'Through the study stage, each working day, say before you begin: "Mercury, be willing and favourable to my work. Give me clear and honest words."',
          times: 11,
          every: 'day',
          prompt: 'Did I remember? What did I learn about Mercury today?',
          premade: 'cosmic-wednesday-mercury-study',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine days of fair exchange',
      intro:
        'Nine days of honest dealing and clear words, offered to Mercury each evening with incense. Roman religion knew nine-day rites (the novendiale), but this nine-day frame is a modern devotional form.',
      days: 9,
      lessons: [],
      practices: [
        {
          id: 'mercury-nine-days',
          title: 'Evening account',
          instructions:
            'Each day, do one act of fair exchange deliberately: pay something owed, answer a message you have been avoiding, give an honest review, return a borrowed thing, correct a mistake in someone\'s favour.\n\nEach evening: wash your hands, cover your head, incense to Janus. Light Mercury\'s candle and say your prayer. Give him incense, as the merchants did, and a little milk or a coin. Tell him the day\'s exchange, as if giving an account. Sit for a few minutes and listen. Name Vesta last, turn to your right, uncover and put out the flame.',
          times: 9,
          every: 'day',
          prompt: 'What exchange did I make fairly today, and what did it cost or give me?',
          premade: 'cosmic-wednesday-mercury-study',
        },
        {
          id: 'mercury-sprinkle',
          title: 'A small Mercuralia',
          instructions:
            'Once in the nine days, draw a jar of fresh water, dip a sprig of bay and sprinkle your tools of work, your bag and your doorway, asking Mercury for honest profit and safe roads.',
          times: 1,
          prompt: 'What tools of trade did I bless, and what do I hope for from them?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Is he your god?',
      intro:
        'A few days to weigh it honestly. Mercury is quick and light; he does not ask for heavy vows, but he notices broken bargains. Stopping, pausing, or choosing another god or path is a good outcome.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'mercury-discern',
          title: 'Three evenings at the shrine',
          instructions: 'Light his candle and answer the questions below in your journal, a few each evening.',
          times: 3,
          every: 'day',
          prompt: 'What did nine days of fair exchange show me?',
        },
      ],
      questions: [
        'Am I drawn to Mercury for himself, or mainly for luck with money? Be honest.',
        'Can I keep my dealings fair enough to bring them to a god of exchange, even when cheating would be easier?',
        'Which Mercury is mine: the Roman god of merchants, the Gaulish great god, the guide of souls, or the astrological planet? Can I keep them distinct?',
        'Can I keep a regular practice for a year: a word before work, monthly offerings, 15 May?',
        'Does the formal Roman manner feel right, or would I rather honour Hermes in the Greek way?',
        'Would I rather keep a friendly, occasional relationship with him without a dedication? That suits him well.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication',
      intro:
        'If you go ahead, hold this on 15 May, a Wednesday, or the day you start a new job or venture. It is a self-dedication, not an initiation, and makes you a member of no group. It takes the Roman shape of a vow (votum): a clear contract with the god of contracts, which you will keep.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Mercury',
        summary: 'Water drawn and sprinkled with laurel, Janus first, a vow read exactly like a contract, offerings of incense, milk, honey cake and a coin, and Vesta last.',
        minutes: 40,
        ingredients: [
          { name: 'A clean jar of fresh water', ref: 'traditional/vessel/bottle' },
          { name: 'A sprig of bay (laurel)', ref: 'traditional/herb/bay' },
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A head covering' },
          { name: 'A new orange or yellow candle', ref: 'traditional/candle/yellow' },
          { name: 'Frankincense and a burner', ref: 'traditional/herb/frankincense' },
          { name: 'A little milk or wine in a cup', ref: 'traditional/tool/chalice' },
          { name: 'A honey cake on a clean dish', ref: 'traditional/vessel/dish' },
          { name: 'A coin, ideally from your first earnings of something' },
          { name: 'Your vow, written out and signed like a contract' },
        ],
        preparation:
          'In the morning, wash the jar and draw fresh water. Write your vow like a short contract: your name; that you dedicate yourself to Mercury as his devotee; for how long (a year is wise); and exactly what you will do, such as a word before work, monthly offerings, keeping 15 May, giving a share of first earnings, and dealing fairly. Sign and date it. Read it until it flows. Set aside a crumb of the cake for Vesta.',
        steps: [
          {
            title: 'Purify and veil',
            instructions: 'Wash your hands and face, put on clean clothes and cover your head.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the incense and give a few grains to Janus.',
            spoken: 'Father Janus, first in every prayer,\nopen the way to Mercury.',
          },
          {
            title: 'Sprinkle',
            instructions: 'Dip the bay in the jar of water. Sprinkle your tools of work, your bag, your doorway, and then your own head, as the merchants did at the Porta Capena.',
            minutes: 4,
          },
          {
            title: 'Light the new flame',
            instructions: 'Light the new candle at the shrine.',
            spoken: 'Mercury, eloquent grandson of Atlas,\nmessenger of the gods, guide of roads and of souls,\ngod of merchants and of fair exchange,\nor by whatever name it pleases you to be called:\nI come to make a bargain with you.',
            light: true,
          },
          {
            title: 'Read the vow',
            instructions: 'Read your vow aloud, exactly, like a contract. If you stumble, stop and begin again from the beginning.',
            minutes: 4,
          },
          {
            title: 'Offer',
            instructions: 'Give more incense. Set down the milk or wine, the honey cake and the coin. Name each gift.',
            spoken: 'Mercury, be honoured by this incense,\nby this milk, this honey cake and this coin.\nBe willing and favourable to me and my household, my work and my roads.\nAs I have written and spoken, so I will do.',
          },
          {
            title: 'Listen',
            instructions: 'Sit in silence for a few minutes. Notice what words come.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'A pinch of incense to Vesta. Turn to your right, uncover your head and put out the flame.',
            spoken: 'Vesta, last as always: be honoured.',
            snuff: true,
          },
        ],
        closing:
          'Pour the milk or wine onto soil and give the cake to the birds or the compost the next day. Keep the signed vow on his shrine. Give the coin to someone who needs it within the week. Romans who fulfilled a vow set up an altar marked V.S.L.M., votum solvit libens merito, "paid the vow willingly, as was deserved"; at the end of your year, write those letters on the vow and renew it on 15 May.',
        safety:
          'Never leave the candle unattended, and keep it away from papers. Keep incense smoke away from birds and anyone with asthma. Do not sprinkle water on electronics. Wine and grapes are toxic to dogs and cats; milk upsets many cats. Honey is not for infants under one.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the bargain',
      intro:
        'His ongoing practice is light and steady: a word before work, a monthly offering, his feast on the Ides of May, and fair dealing every day. Rededicate each year on 15 May.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'mercury-weekly',
          title: 'Wednesday word',
          instructions: 'Once a week, often on Wednesday, give Mercury incense and a word of thanks, and review your week\'s dealings with him.',
          times: 52,
          every: 'week',
          prompt: 'Were my dealings this week ones I would show him?',
          premade: 'cosmic-wednesday-mercury-study',
        },
        {
          id: 'mercury-monthly',
          title: 'Monthly offering',
          instructions:
            'Once a month, on the Kalends or the Ides: wash and veil, Janus first, light his candle, offer incense, milk and a coin, and read your prayer. Pass on the coins that have gathered. Vesta last, turn right.',
          times: 12,
          every: 'month',
          prompt: 'What did I pass on this month?',
          premade: 'folk-lararium-offering',
        },
        {
          id: 'mercury-mercuralia-yearly',
          title: 'The Mercuralia',
          instructions:
            'On 15 May: draw fresh water, sprinkle your tools of trade and your head with bay, give incense to Mercury and something to Maia, ask for honest profit, and rededicate by reading your vow again.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did a year of fair exchange bring me?',
        },
      ],
    },
  ],
  sources: [
    'Ovid, Fasti 5.663–692 (Latin, The Latin Library: https://www.thelatinlibrary.com/ovid/ovid.fasti5.shtml); translations original',
    'Horace, Odes 1.10.1 and 17–20 (Latin, The Latin Library: https://www.thelatinlibrary.com/horace/carm1.shtml); translations original',
    'Caesar, Gallic War 6.17 (Latin, The Latin Library: https://www.thelatinlibrary.com/caesar/gall6.shtml); translation original',
    'Ovid, Fasti 6.303–304, Vesta addressed first; Cicero, On the Nature of the Gods 2.67, Vesta last (paraphrased)',
    'Livy 2.21, 2.27; Macrobius, Saturnalia 1.12.19; Tacitus, Germania 9; Ovid, Fasti 2.583–616; Pliny, Natural History 28.10–11 (paraphrased)',
    'R. S. O. Tomlin, the Uley lead tablets, in A. Woodward and P. Leach, The Uley Shrines (English Heritage, 1993)',
    'Miranda Green, Dictionary of Celtic Myth and Legend (1992)',
    'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (1981)',
  ],
};
