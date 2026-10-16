import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-dionysus',
  kind: 'deity',
  paths: ['hellenic', 'roman'],
  deityRef: 'traditional/deity/dionysus',
  title: 'Dionysus: The Loosener',
  summary:
    'A lunar month with Dionysus, god of wine, theatre, ecstasy and release: the twice-born god and his maenads, the Anthesteria and the Dionysia, what is and is not known of his mysteries, and a nine-night practice of music, dance and the cup, with a sober option all the way through.',
  welcome: `This is a month of study and devotion with Dionysus, the Greek god of wine and the vine, of theatre and masks, of ecstasy, madness and liberation. He is the god who arrives from outside, breaks open what is rigid, and sets people free, sometimes joyfully and sometimes terribly.

It is a self-dedication, not an initiation. Dionysus had mystery cults whose initiations were secret, and no one can restore them. What this journey gives you is his myths, his festivals, his real customs, and a practice that is honest about both his gifts and his dangers.

You do not need to drink alcohol at any point. Every rite here works with grape juice or water, and ecstasy in his worship came as much from music, dance and the mask as from the cup. If you are in recovery or struggling with alcohol, please choose the sober option throughout, and know that this is entirely within his tradition. You will need a cup, a lamp or candle, some music you love, and a little room to move.`,
  about: `Dionysus is one of the oldest Greek gods: his name appears on clay tablets from Bronze Age Pylos around 1200 BCE. In myth he is the son of Zeus and the mortal princess Semele, “twice-born” because Zeus sewed the unborn child into his thigh after Semele was burnt up by his divine fire. He wanders the world with satyrs and maenads, bringing the vine, punishing those who refuse him, like King Pentheus in Euripides’ Bacchae, and rescuing Ariadne on Naxos. In Athens he was honoured with some of the city’s greatest festivals: the Anthesteria, when new wine was opened and the dead walked; the Lenaia; and the City Dionysia, where tragedy and comedy were born. His women followers, the maenads or bacchae, went up the mountains in winter to dance for him. He also had mystery cults, Bacchic and Orphic, that promised a blessed afterlife; their rites were secret. The Romans called him Bacchus or Liber, and in 186 BCE the Senate cracked down on his Bacchanalia. Today Hellenic polytheists keep his festivals, theatre-makers and musicians honour him as their god, and many people come to him as a liberator: of the body, of grief, of gender and of fixed ways of being.`,
  notes: [
    'Alcohol is never required. Grape juice, water, milk and honey, music, dance and theatre are all fitting offerings. If you are in recovery, use the sober option every time; that is a full and proper devotion.',
    'The inner rites of the Bacchic and Orphic mysteries are unknown. Modern “mystery” rites are modern creations, however sincere.',
    'Ecstatic practice can be intense. Do not combine dance or trance with alcohol, drugs, fasting or isolation. Keep your feet on the ground and a friend informed.',
    'The myths include madness and violence, including the tearing apart of Pentheus. The journey describes these honestly; its rites are joyful and devotional.',
    'Ivy is mildly toxic if eaten, and grapes and raisins are poisonous to dogs and cats. Keep both away from pets and children.',
  ],
  holyDays: ['anthesteria', 'lenaia', 'dionysia', 'haloa', 'agathos_daimon'],
  stages: [
    {
      kind: 'threshold',
      title: 'The stranger at the door',
      intro:
        'Dionysus always arrives as a stranger, from somewhere else. So the journey begins with a welcome: you open the door to him, offer him a cup, and play music. You are introducing yourself, not promising anything.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'dionysus-threshold-song',
          title: 'Choose his song',
          instructions:
            'Before the opening rite, choose one piece of music that makes you want to move, one that loosens something in you. It can be anything: a drumming track, a pop song, a folk tune. This will be his song for the month. Listen to it once with your eyes closed.',
          times: 1,
          prompt: 'What did the music loosen in me? Where in my body did I feel it?',
        },
      ],
      rite: {
        title: 'Welcoming the stranger',
        summary:
          'A short Greek-style welcome: purify, begin with Hestia, open the door to Dionysus, pour a libation of wine or juice for him, and dance to his song.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of fresh water for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A match, or a sprig of bay or rosemary to quench in it', ref: 'traditional/herb/bay' },
          { name: 'A tealight, oil lamp or electric candle' },
          { name: 'A cup or wine glass', ref: 'traditional/tool/chalice' },
          { name: 'Red grape juice, or wine mixed with water, or plain water' },
          { name: 'A small dish to pour into', ref: 'traditional/vessel/offering_bowl' },
          { name: 'His song, ready to play' },
          { name: 'A pine cone or a sprig of ivy, kept out of reach of pets', optional: true },
        ],
        preparation:
          'Clear a little space to move. Set the lamp, cup and dish on a table. Wash your face and hands in ordinary water first. Have your music ready. In Greek custom wine was always mixed with water; drinking it unmixed was thought barbaric. If you use wine, add at least an equal amount of water.',
        steps: [
          {
            title: 'Make khernips',
            instructions:
              'Light the match or the tip of the bay sprig and plunge it into the bowl of water. Wash your hands in it and touch a few drops to your face.',
            spoken: 'With clean hands I open the door.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the lamp. Pour a drop from the cup into the dish for Hestia.',
            spoken: 'Hestia, first and last, keeper of this house, I begin with you.',
            light: true,
          },
          {
            title: 'Open the door',
            instructions:
              'Go to your front door, or a window, and open it. Dionysus is the god who comes from elsewhere, and his festivals welcomed him into the city. Stand there with the cup.',
            spoken:
              'Dionysus, son of Semele, twice-born, ivy-crowned, loud-crying god: I am [your name]. You are welcome in this house. Come in, and let me learn who you are.',
            minutes: 2,
          },
          {
            title: 'Pour for him',
            instructions:
              'Close the door and return to the table. Pour a good portion of the cup into the dish for him. Then, if you wish, drink a little yourself: Dionysus is a god who shares the cup. Juice or water is just as good.',
          },
          {
            title: 'Dance',
            instructions:
              'Play his song and move to it, however you like: sway, stamp, spin slowly, clap. You do not need to be good at it. This is your first offering of the body.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Catch your breath. Pour the last drop for Hestia. Thank them both and put out the lamp.',
            spoken: 'Hestia, last as you were first. Dionysus, thank you for coming in.',
            snuff: true,
          },
        ],
        closing:
          'Pour the dish of libation outside onto earth or at the foot of a tree or plant. Pour the khernips away. Write a few lines about how it felt to open the door and dance.',
        safety:
          'Never leave a flame unattended, and clear the space so you do not knock the lamp while dancing. Keep ivy and grapes away from pets and small children. If you drink wine, keep it to a sip, mixed with water, and never drive afterwards.',
      },
    },
    {
      kind: 'study',
      title: 'The god who arrives',
      intro:
        'About ten days of reading, one lesson every two or three days. First who he is and where he came from, then his myths and what they mean, then his festivals and theatre, and finally his followers and mysteries.',
      days: 10,
      lessons: [
        {
          id: 'dionysus-who',
          title: 'Twice-born: who Dionysus is',
          summary: 'His birth, his oldest traces, his names, his emblems and his many sides.',
          minutes: 7,
          sections: [
            {
              heading: 'An old god who always seems new',
              body: `The Greeks often told stories of Dionysus as a newcomer: a foreign god from Thrace or Phrygia or the east, arriving in Greece and demanding to be recognised. For a long time scholars believed them. Then, in the 1950s, his name was read on Linear B clay tablets from Pylos, written around 1200 BCE, as di-wo-nu-so. He had been in Greece for centuries before Homer.

So the “foreignness” is part of who he is, not his history. Dionysus is the god who comes from outside, who is always arriving, always disrupting the settled order. He is the stranger at the gate, and the god of the moment when ordinary life breaks open.`,
            },
            {
              heading: 'The twice-born',
              body: `His most famous myth is his birth. Zeus loved Semele, daughter of King Kadmos of Thebes. Jealous Hera, disguised, persuaded her to ask Zeus to appear in his true form. He had sworn to grant her wish, and his lightning burnt her up. Zeus rescued the unborn child and sewed him into his own thigh, and Dionysus was born a second time from his father. That is why he is called Dimetor, “of two mothers,” and twice-born.

Later, Dionysus went down to the underworld and brought Semele back to Olympus as a goddess. So even his birth tells of death and return. He is a god of the vine, which is cut back to bare stumps every winter and bursts into leaf in spring.`,
            },
            {
              heading: 'His names',
              body: `He has many names. Bakkhos or Bakkheios is the god of the Bacchic frenzy, and his followers were bacchants. Bromios means “the roarer” or “thunderer.” Lyaios and Eleutherios both mean “loosener” or “liberator.” Lenaios is the god of the wine-press, and Dendrites the god of trees. Iakchos, a god of the Eleusinian procession, was often identified with him. In Rome he was Bacchus, and also Liber, “the free one,” an old Italian god merged with him.

The Homeric Hymns call him “loud-crying Dionysus” and “ivy-crowned.” In prayer, choose the names that fit your need: Eleutherios for freedom, Lyaios for release from care, Bromios for joy and noise.`,
            },
            {
              heading: 'Emblems, animals and plants',
              body: `His emblems are the thyrsos, a fennel stalk topped with a pine cone and wound with ivy; the kantharos, a deep two-handled drinking cup; the mask; and grape clusters. His plants are the vine, ivy, the pine and the fig. Ivy was his because it stays green in winter when the vine is bare.

His animals are the panther or leopard, which pulls his chariot; the bull, whose form he could take; the goat, sacrificed to him and linked to the satyrs and perhaps to the word “tragedy,” goat-song; the snake, which maenads were said to handle; and dolphins, from the story of the pirates. His places are Thebes, his birthplace; Naxos, where he found Ariadne; Delphi, where he shared the sanctuary with Apollo in winter; and Athens, with its theatre at the foot of the Acropolis.`,
            },
          ],
          knowAndDont: {
            known:
              'The Linear B tablets from Pylos (around 1200 BCE) name di-wo-nu-so. The twice-born story is told by Euripides and many later authors. His epithets, emblems and animals are well attested in literature, inscriptions and vase painting.',
            unknown:
              'What the Bronze Age Dionysus was like is unknown; the tablets give only his name. The origin of the word “tragedy” in goat-song is old but debated. Whether his foreign origin stories preserve any memory of cult spreading from Thrace or Asia Minor is still argued.',
          },
          inPractice:
            'Hellenic polytheists honour Dionysus at his festivals and in the household with libations, ivy and music, and many theatre people keep a small image of him or a mask in the dressing room. Choose two of his names to use this month. Eleutherios and Bromios make a good pair.',
          reflect: [
            'What is rigid in your life right now, that a loosener might break open?',
            'Which name of his speaks to you most, and why?',
          ],
          further: [
            'Walter F. Otto, Dionysus: Myth and Cult (1933, English 1965)',
            'Richard Seaford, Dionysos (2006), a short introduction',
            'Homeric Hymns to Dionysus (1, 7 and 26), trans. H. G. Evelyn-White (1914)',
          ],
          library: ['traditional/deity/dionysus', 'traditional/crystal/amethyst', 'traditional/tool/chalice'],
        },
        {
          id: 'dionysus-myths',
          title: 'Pirates, Pentheus and Ariadne',
          summary: 'Three of his great myths, and what they teach about freedom, refusal and love.',
          minutes: 8,
          sections: [
            {
              heading: 'The pirates',
              body: `The seventh Homeric Hymn tells how pirates saw a young man on a headland, with dark hair and a purple robe, and seized him, thinking he was a prince they could ransom. They tried to tie him up, but the ropes would not hold, “and he sat with a smile in his dark eyes.” The helmsman understood and cried out, “What god is this whom you have taken and bind, strong that he is?” The captain ignored him.

Then wine began to flow through the ship, a vine spread along the sail, ivy twined around the mast, and the god became a lion. The pirates leapt into the sea and became dolphins. Only the helmsman, who had recognised him, was spared and blessed. The god cannot be bound. Those who try are undone; those who recognise him are rewarded.`,
            },
            {
              heading: 'Pentheus and the Bacchae',
              body: `The darkest myth of Dionysus is told in Euripides’ tragedy the Bacchae, first performed in 405 BCE, after the poet’s death. Dionysus comes to Thebes disguised as a soft-haired stranger, to be recognised in his mother’s city. The young king Pentheus refuses him, mocks his rites and imprisons him. The women of Thebes, maddened by the god, have gone up Mount Kithairon to dance.

Dionysus lures Pentheus, dressed as a woman, to spy on them. The maenads, led by Pentheus’s own mother Agave, see him as a lion and tear him apart with their bare hands. Agave carries his head home in triumph before she comes to her senses. It is one of the most terrible endings in Greek drama. Its lesson is not that Dionysus is cruel for fun. It is that refusing the wild, the irrational and the joyful part of life does not make it go away. It returns, and it returns as madness.`,
            },
            {
              heading: 'Ariadne',
              body: `The gentlest myth is his love for Ariadne. The Cretan princess helped Theseus escape the Labyrinth and left with him, but he abandoned her asleep on the island of Naxos. Dionysus found her there, grieving, and married her. In some versions he set her bridal crown in the sky as the constellation Corona Borealis. On Naxos and elsewhere Ariadne had her own festivals, some joyful and some mournful.

Dionysus is one of the few Greek gods who is faithful to his wife. He is a god who finds people at their lowest, abandoned and grieving, and lifts them up. Many modern devotees love this story above all the others.`,
            },
            {
              heading: 'Zagreus and the Titans',
              body: `There is one more story you will meet: the Orphic myth of Dionysus Zagreus. In this version Dionysus is the child of Zeus and Persephone. The Titans lure the baby with toys, tear him apart and eat him; Zeus blasts them with lightning, and from their ashes humans are made, so that we have a Titanic, wicked part and a Dionysian, divine part. Dionysus is reborn.

Be careful with this one. The full story is pieced together mainly from late sources, some from the Roman period and later, and scholars disagree about how old it is and how many ancient people believed it. Some argue that the neat “original sin” version is largely a modern reconstruction. It is a powerful myth, and parts of it are genuinely ancient, but it is not the core of Dionysus for most Greeks.`,
            },
          ],
          knowAndDont: {
            known:
              'The pirate story is in Homeric Hymn 7, Pentheus in Euripides’ Bacchae, and Ariadne in Hesiod, Catullus, Ovid and others. The dismemberment of the child Dionysus is mentioned by several ancient sources, and Orphic poems about it existed.',
            unknown:
              'How old the Zagreus myth is, and whether the idea of humans made from Titan ashes was widespread or late, is strongly debated (see Radcliffe Edmonds). Whether the Bacchae reflects actual maenadic practice or is mostly dramatic imagination is unclear.',
          },
          inPractice:
            'Many devotees read the pirate hymn aloud at the start of the sailing season or before any new venture, and the end of the Bacchae as a warning to themselves. This week, read Hymn 7 aloud. If you can, read or watch a production of the Bacchae; it is his own play.',
          reflect: [
            'In the pirate story, the helmsman is saved because he recognises the god. What would it mean to recognise Dionysus in your life?',
            'What part of yourself have you refused, like Pentheus? How has it come back?',
          ],
          further: [
            'Euripides, Bacchae (any modern translation)',
            'Homeric Hymn 7, To Dionysus, trans. H. G. Evelyn-White (1914), Project Gutenberg #348',
            'Radcliffe G. Edmonds III, Redefining Ancient Orphism (2013)',
          ],
          library: ['traditional/deity/dionysus', 'traditional/deity/persephone'],
        },
        {
          id: 'dionysus-festivals',
          title: 'New wine, the dead and the theatre',
          summary: 'The Anthesteria, Lenaia, City Dionysia and Rural Dionysia: how Athens honoured him, and how to keep them now.',
          minutes: 8,
          sections: [
            {
              heading: 'The Anthesteria',
              body: `The Anthesteria, the festival of flowers, came in early spring in the month of Anthesterion, around February. It lasted three days. On the first, Pithoigia, “jar-opening,” the jars of the new wine were opened and the first of it offered to the god. On the second, Choes, “jugs,” everyone over the age of about three, including enslaved people, drank from their own jug of wine. There was a drinking contest held in silence, each person at a separate table, remembering a story of the polluted Orestes being welcomed but kept apart. Small children were given little jugs and wreaths of flowers. The wife of the city’s religious official was married to the god in a secret rite.

The third day, Chytroi, “pots,” belonged to the dead. Pots of mixed grains were cooked for Hermes of the underworld, and nobody else ate them. The spirits of the dead were believed to walk the city, and people chewed buckthorn and smeared pitch on their doors to protect themselves. At the end of the day the spirits were sent away with an old saying, which runs roughly: “Out the door, you spirits; it is no longer the Anthesteria.”`,
            },
            {
              heading: 'The Lenaia and the City Dionysia',
              body: `The Lenaia, in the winter month of Gamelion, around January, was a festival of Dionysus Lenaios with dramatic contests, especially comedy. The City or Great Dionysia, in Elaphebolion, around March, was Athens’ great festival. The old wooden image of Dionysus Eleutherios was carried in from outside the city, as if he were arriving again, and installed in his theatre. A huge procession followed, with sacrifices, and with large wooden phalloi carried in honour of the god’s fertility.

Then came several days of plays: tragedies, satyr plays and comedies, performed in competition. Aeschylus, Sophocles, Euripides and Aristophanes all wrote for this festival. Theatre was worship. The priest of Dionysus sat in the best seat in the front row, and the audience watched gods and heroes walk through their own city.`,
            },
            {
              heading: 'The countryside',
              body: `The Rural Dionysia were held in the villages of Attica in the winter month of Poseideon, with processions carrying a phallos, rustic plays and games such as balancing on a greased wineskin. Aristophanes gives a little comic picture of one in his play the Acharnians. Dionysus was also honoured at the Haloa with Demeter and Kore at the threshing floor in midwinter.

Elsewhere in Greece there were other festivals: the Agrionia in Boeotia, with mock pursuits of women by the priest; the winter rites at Delphi; and many local celebrations of the vintage. In Rome, the Liberalia on 17 March honoured Liber, and boys took the toga of manhood on that day.`,
            },
            {
              heading: 'Keeping them now',
              body: `Modern Hellenic polytheists keep these festivals in their own ways. For the Anthesteria many open a bottle of new wine or grape juice and offer the first of it, give children flowers and a little cup, spend the third day in remembrance of the dead, cook a pot of mixed grains or beans as an offering that is not eaten, and say a sending-away at the door at dusk.

For the Dionysia and Lenaia, the most fitting devotion is theatre: go to a play, read one, watch one, or put on something yourself, even a reading with friends. Many devotees dedicate a performance or a piece of writing to him. The app marks the Anthesteria, Lenaia and Dionysia in your calendar.`,
            },
          ],
          knowAndDont: {
            known:
              'The three days of the Anthesteria, the silent drinking, the Chytroi pots for Hermes Chthonios and the sending-away of the spirits are attested in Aristophanes, Plutarch, Athenaeus and later lexicographers. The structure of the City Dionysia, its procession and its contests are well documented in inscriptions and literature.',
            unknown:
              'The sacred marriage of the god to the wife of the archon basileus was secret and its form is unknown. Whether the spirits sent away at the Anthesteria were the dead or other beings (the Greek word keres is ambiguous) is debated. How plays were chosen in the earliest years is unclear.',
          },
          inPractice:
            'Put the Anthesteria, Lenaia and Dionysia in your calendar now. For each, plan one thing: a first pour of new wine or juice at the Anthesteria, with a pot of grains for the dead that you do not eat; a play read, watched or performed at the Lenaia and Dionysia.',
          reflect: [
            'What would it mean to treat watching or making theatre as an act of worship?',
            'How do you feel about a festival of joy that also welcomes the dead?',
          ],
          further: [
            'H. W. Parke, Festivals of the Athenians (1977)',
            'Erika Simon, Festivals of Attica (1983)',
            'Aristophanes, Acharnians and Frogs',
          ],
          library: ['traditional/deity/dionysus', 'traditional/deity/hermes', 'traditional/deity/demeter'],
          premade: ['hedge-ancestor-candle-evening'],
        },
        {
          id: 'dionysus-followers',
          title: 'Maenads, mysteries and Dionysus today',
          summary: 'The real and imagined maenads, the Bacchic mysteries, the Roman crackdown, and the communities that honour him now.',
          minutes: 7,
          sections: [
            {
              heading: 'The maenads',
              body: `Maenads, “raving women,” are everywhere in Greek art: women in fawnskins with snakes in their hair, carrying the thyrsos, dancing with heads thrown back. In myth they tear animals apart with their hands and eat the flesh raw. In real life, there were organised groups of women who worshipped Dionysus on mountains. At Delphi, a group called the Thyiades went up Mount Parnassus every other winter for nocturnal rites. Plutarch, who was a priest at Delphi, tells how once they got lost in a snowstorm and had to be rescued.

Inscriptions from Asia Minor and elsewhere name women’s thiasoi, Bacchic societies, with priestesses and officials. What they actually did is uncertain. The wilder parts of the myth, tearing and eating raw flesh, may be imagination, or exaggeration of a ritual act. What is clear is that Dionysus gave women a sacred role outside the house, which most Greek religion did not.`,
            },
            {
              heading: 'The mysteries',
              body: `Dionysus also had mystery cults, initiations that promised the initiated a better fate after death. The gold tablets found in some graves, addressed partly to Persephone, mention Bacchic initiates, and one from Hipponion says the initiates walk a holy road. A bone tablet from Olbia on the Black Sea reads, in part, “life, death, life,” with the name Dionysus. A famous fresco in the Villa of the Mysteries at Pompeii seems to show an initiation, with a whipping, a revealed object and a woman dancing.

All of this was secret, and we do not know the rites. Anyone offering a restored Bacchic initiation today is offering something new. What we can honestly say is that for many ancient people Dionysus was not only the god of the party, but a god who had gone down to the dead and come back, and who could take them with him.`,
            },
            {
              heading: 'Liberation and its limits',
              body: `In 186 BCE the Roman Senate cracked down on the Bacchanalia, a mystery cult that had spread through Italy. The historian Livy describes rumours of night-time orgies, crime and conspiracy; thousands were said to have been executed. An inscribed copy of the decree survives. It did not ban Bacchus altogether but strictly limited his groups. Whatever the truth of the rumours, the episode shows how threatening a god of liberation could seem to people in power.

That tension runs through his worship. Dionysus frees: slaves drank alongside citizens at the Anthesteria, women ran the mountains, actors became gods for a day. But he also warns. The Greeks mixed their wine with water and thought unmixed wine dangerous. His ecstasy is a gift in its proper time and place, held by community and festival, not a licence for harm.`,
            },
            {
              heading: 'Who honours him now',
              body: `Today Dionysus is honoured by Hellenic polytheists, who keep his festivals and offer wine, ivy and music; by Dionysian groups and thiasoi that hold ecstatic rites with drumming and dance; by theatre-makers, musicians and dancers who see him as their patron; and by many queer and trans people, who love him for his soft hair, his “womanly” appearance in the Bacchae and his breaking of fixed roles. People in recovery from addiction have also written movingly about honouring him soberly, as the god who loosens chains rather than the god of drinking.

You will also meet the idea of the “Dionysian” versus the “Apollonian,” from the philosopher Nietzsche’s The Birth of Tragedy in 1872. It is a modern philosophical pair, not an ancient religious one. In Delphi the two gods shared the sanctuary peacefully.`,
            },
          ],
          knowAndDont: {
            known:
              'Plutarch describes the Thyiades at Delphi. Inscriptions name women’s Bacchic groups. The gold tablets, the Olbia bone tablets and the Pompeii fresco attest Bacchic mysteries. Livy (book 39) and the surviving inscription record the Senate’s decree of 186 BCE.',
            unknown:
              'The rites of the mysteries are unknown, and the Pompeii fresco is interpreted in many ways. How much of Livy’s account is rumour or propaganda is debated. The extent of real maenadic violence to animals is uncertain and may be largely mythical.',
          },
          inPractice:
            'Set up his shrine now: a cup or kantharos, a lamp, a mask, a pine cone or thyrsos, grapes or a vine leaf, and ivy kept out of reach of pets. Many devotees keep a small speaker or instrument by it. If you are drawn to group ecstatic worship, look for a group with clear safety practices, and avoid any that push alcohol or drugs.',
          reflect: [
            'What has Dionysus freed people from, in the stories? What might he free you from?',
            'Where is the line, for you, between liberating ecstasy and harm?',
          ],
          further: [
            'Albert Henrichs, “Changing Dionysiac Identities” (1982), on maenads real and imagined',
            'Livy, History of Rome 39.8–19, on the Bacchanalia',
            'Friedrich Nietzsche, The Birth of Tragedy (1872), for the modern Apollonian and Dionysian idea',
          ],
          library: ['traditional/deity/dionysus', 'traditional/deity/apollo', 'traditional/deity/persephone'],
        },
      ],
      practices: [
        {
          id: 'dionysus-study-hymns',
          title: 'Read his hymns aloud',
          instructions:
            'Once in this stage, read Homeric Hymns 7 and 26 to Dionysus aloud, with his song playing softly afterwards. They are short.',
          times: 1,
          prompt: 'Which image from the hymns stayed with me?',
        },
        {
          id: 'dionysus-study-theatre',
          title: 'Go to the theatre',
          instructions:
            'Once in this stage, watch, read or perform a play, ideally a Greek tragedy or comedy, and dedicate it to him before you begin.',
          times: 1,
          prompt: 'What did the play show me that ordinary life does not?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights of the cup and the dance',
      intro:
        'Nine nights of a short practice with music, movement and a libation, then a lesson on his days and offerings. Dionysus is a god who shares: unlike the underworld gods, his cup is drunk together. The sober option is always available.',
      days: 12,
      lessons: [
        {
          id: 'dionysus-offerings',
          title: 'The cup, the krater and the sober way',
          summary:
            'How to offer to Dionysus, mixing wine and water, his holy days, sober devotion, and safe ecstatic practice.',
          minutes: 7,
          sections: [
            {
              heading: 'Mixing the wine',
              body: `Greeks did not usually drink wine neat. At a symposium, the drinking party, wine was mixed with water in a large bowl called a krater, often two or three parts water to one of wine. Drinking unmixed wine was thought to lead to madness, and was something only barbarians did. The first cup of unmixed wine was poured as a libation to the Agathos Daimon, the good spirit of the house, and then everyone drank wine mixed with water.

At the start of a symposium, libations were poured, a hymn sung, and the drinking began with a prayer. This is a good model for a modern rite. Mix your wine with water, or use juice; pour the first portion for the god; then drink a little with him.`,
            },
            {
              heading: 'What to offer',
              body: `Traditional offerings for Dionysus are wine, grapes, figs, honey, bread and cakes, ivy and pine, and the first of the new wine at the Anthesteria. But he is also honoured with things that are not food. Music, especially drums, pipes and the aulos; dance; masks and theatre; poetry and storytelling; laughter. A play you perform, a song you sing or an evening of dancing with friends is as good as a cup.

Most offerings to Dionysus are shared, Olympian-style: pour his portion, and the rest is for you and the company. The exception is anything given at the Chytroi for the dead, or to him as a god of the underworld. That is poured into the earth or left, and not eaten.`,
            },
            {
              heading: 'The sober way',
              body: `You never need alcohol to honour Dionysus. Grape juice is the fruit of the vine. Water, milk and honey were poured to many gods. The maenads in the Bacchae drew milk, honey and wine from the earth, and ecstasy came from the dance on the mountain, not from the cup.

If you are in recovery, or alcohol harms you, honour him without it every time. Many devotees in recovery see him as Lyaios, the loosener, the god who frees people from what binds them, including addiction. Pour him juice, play him music and tell him about your freedom. If you are struggling with drinking, please reach out to a doctor or a support service in your country; that, too, is an offering to the god of liberation.`,
            },
            {
              heading: 'Safe ecstasy',
              body: `Ecstatic practice, losing yourself in dance or drumming, can be wonderful and powerful. It can also be intense. A few simple rules help: do not combine it with alcohol or drugs; eat something first; keep water nearby; clear the space so you cannot fall onto anything; and stop if you feel dizzy, faint or frightened. If you have a heart condition, epilepsy or a history of dissociation, go gently and talk to your doctor if you are unsure.

Finish every ecstatic practice by grounding: sit down, drink water, eat a little bread, put your hands on the floor. Dionysus returns people to their ordinary lives after the festival. So should you.`,
            },
          ],
          knowAndDont: {
            known:
              'The krater, mixing wine with water, the first libation to the Agathos Daimon and the order of the symposium are well attested. Music, dance and theatre were central to his cult. The Bacchae describes maenads drawing milk, honey and wine from the earth.',
            unknown:
              'Exact mixing ratios varied and are argued over. Sober devotion is a modern practice, though rooted in his wider worship. How ancient ecstatic states were achieved, beyond music and dance, is uncertain.',
          },
          inPractice:
            'Keep the nine nights below. Mix your cup each night: wine and water, or juice, or water alone. On the Agathos Daimon day, the second of the lunar month, pour a little for the good spirit of the house too.',
          reflect: [
            'What does the habit of mixing, never taking it neat, suggest about how to live with Dionysus?',
            'What could you offer him besides a drink?',
          ],
          further: [
            'Oswyn Murray (ed.), Sympotica (1990), on the symposium',
            'Thomas H. Carpenter and Christopher A. Faraone (eds.), Masks of Dionysus (1993)',
          ],
          library: ['traditional/deity/dionysus', 'traditional/tool/chalice', 'traditional/vessel/offering_bowl'],
          premade: ['folk-khernips-libation', 'folk-gratitude-ritual'],
        },
      ],
      practices: [
        {
          id: 'dionysus-nine-nights',
          title: 'Nine nights of the cup and the dance',
          instructions:
            'For nine nights, at about the same time after dark, go to his shrine. Wash your hands. Light the lamp and speak Hestia’s name. Mix your cup: wine with at least as much water, or juice, or water. Call Dionysus by one of your two names and tell him one thing you want to loosen or be freed from. Pour a portion into his dish. Then play his song and move for its length. Afterwards sit down, drink a little from the cup, and put your hands on the floor. Put out the light and pour his portion onto earth outside.',
          times: 9,
          every: 'day',
          prompt: 'What did I ask to be loosened tonight? What moved when I danced?',
        },
        {
          id: 'dionysus-practice-company',
          title: 'Share the cup',
          instructions:
            'Once in this stage, honour him with others: a meal, a party, a music night, a play reading. Pour his portion first, quietly if you like, and let the evening be his.',
          times: 1,
          prompt: 'How did he show up in the company of others?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'After the festival',
      intro: `Every Dionysian festival ended, and people went back to their ordinary lives. Take a few days to look back on the month with a clear head. A dedication is a promise to keep showing up, and it is only worth making if you mean it.

Stopping here is a good outcome. So is pausing, or realising that another god, another path or no dedication at all is right for you. The helmsman in the hymn was saved because he saw clearly. See clearly now.`,
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'dionysus-discern-still',
          title: 'A still evening',
          instructions:
            'Spend one evening with no music, no drink and no dancing. Sit quietly by the lamp and ask whether you want Dionysus in your life for the long term. Notice what you miss, and what you do not.',
          times: 1,
          prompt: 'In the stillness, what did I want? Was it him, or the feeling?',
        },
      ],
      questions: [
        'Did I keep the nine nights because I wanted to, or because they were fun? Both are allowed, but which was it?',
        'Am I drawn to Dionysus himself, or mainly to the idea of wildness and release? Is that enough?',
        'Has this month affected my relationship with alcohol, for better or worse? Do I need to choose the sober way?',
        'Can I keep his festivals and a regular practice for a year, in my life as it is now?',
        'Do I understand which parts of what I believe about him are ancient and which are modern?',
        'Would I be relieved or disappointed if I decided to wait? What does that tell me?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication of the cup',
      intro: `If you have chosen to go on, make your dedication on a night that suits him: one of his festivals, the Noumenia, or a night when you can have music and space. This is a self-dedication, a promise you make on your own behalf. It is not an initiation, and it does not make you a bacchant, a mystes or a member of any thiasos. Groups that initiate have their own rites, and this does not replace them.

Ancient Greeks rarely dedicated themselves to a single god. Your promise can sit beside honouring others.`,
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Dionysus',
        summary:
          'Open the door to the god, purify, begin with Hestia, call him by his names, mix the cup, make your promise, pour and share the cup, dance, ground yourself and close.',
        minutes: 50,
        ingredients: [
          { name: 'A bowl of fresh water and a match or bay sprig for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A lamp, tealight or electric candle' },
          { name: 'A cup or kantharos', ref: 'traditional/tool/chalice' },
          { name: 'Wine and water to mix, or red grape juice, or water' },
          { name: 'A dish to pour into', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Bread or figs, and a glass of water for grounding' },
          { name: 'His song, ready to play' },
          { name: 'A mask, or a crown of ivy or vine leaves', optional: true },
          { name: 'Your written promise on a card' },
        ],
        preparation:
          'Write your promise in your own words, simple and doable: for example, to keep his festivals, to make or go to theatre in his honour, to dance for him, and to seek freedom in my life without harming myself or others. If alcohol is a struggle, write the sober way into your promise. Eat something light beforehand. Clean the shrine and clear a space to move.',
        steps: [
          {
            title: 'Open the door',
            instructions:
              'Open your front door or a window for a moment, as Athens welcomed the god into the city at the Dionysia.',
            spoken: 'Dionysus, come in. This house is open to you.',
          },
          {
            title: 'Purify',
            instructions: 'Make khernips by quenching the flame in the water. Wash your hands and touch your face.',
            spoken: 'With clean hands I come to the god of the vine.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the lamp. Pour a drop for Hestia.',
            spoken: 'Hestia, first and last, I begin with you.',
            light: true,
          },
          {
            title: 'Call Dionysus',
            instructions:
              'Put on the mask or crown if you have one. Raise your hands with palms up. Speak his names with energy.',
            spoken:
              'Dionysus, twice-born, son of Semele; Bromios, the roarer; Eleutherios, liberator; Lyaios, loosener of cares; ivy-crowned, loud-crying god: hear me. This month I have opened my door to you, read your stories and danced for you. Now I come to make a promise.',
            minutes: 2,
          },
          {
            title: 'Mix the cup and make your promise',
            instructions:
              'Mix the cup now, as a krater was mixed, or pour the juice. Hold it up. Read your promise aloud. Then pour a generous portion into his dish.',
            spoken: 'This is my promise, made freely. Let it be mixed well, like good wine.',
          },
          {
            title: 'Share the cup',
            instructions: 'Drink a little from the cup yourself. Dionysus is a god who drinks with his people.',
          },
          {
            title: 'Dance',
            instructions: 'Play his song and dance for him. Let yourself be loosened.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Ground',
            instructions:
              'Sit down. Put your hands on the floor. Eat the bread or figs and drink the water. Feel yourself come back.',
            minutes: 3,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Pour the last drop for Hestia. Thank them both and put out the lamp.',
            spoken: 'Hestia, last as you were first. Dionysus, it is done.',
            snuff: true,
          },
        ],
        closing:
          'Pour his portion onto earth outside, or at the foot of a tree or vine. Keep your written promise on the shrine and read it at each Anthesteria. Write in your journal what you promised and how it felt.',
        safety:
          'Never leave a flame unattended, and keep the lamp clear of where you dance. If you use wine, keep it to a little, mixed with water, and do not drive. Keep ivy and grapes away from pets and children. Stop dancing if you feel faint, and ground yourself before you stand up.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Coming again rejoicing',
      intro: `The Homeric Hymn 26 ends with a prayer to Dionysus: “Grant that we may come again rejoicing to this season, and from that season onwards for many a year.” That is the shape of an ongoing relationship with him. Keep his festivals each year, the Lenaia in winter, the Anthesteria and Dionysia in spring, the Haloa with Demeter, and come back to them gladly.

Between festivals, pour for him now and then, dance, go to the theatre, make something. Once a year, at the Anthesteria or on your dedication anniversary, read your promise again and renew it, change it, or set it down with thanks. If you drift away, open the door and play his song. He is always the god who arrives.`,
      days: 30,
      lessons: [],
      practices: [
        {
          id: 'dionysus-ongoing-monthly',
          title: 'Monthly cup',
          instructions:
            'Once a month, on the Agathos Daimon day or any night, pour for Dionysus with mixed wine or juice, play his song and dance.',
          times: 12,
          every: 'month',
          prompt: 'What did he loosen this month?',
        },
        {
          id: 'dionysus-ongoing-festivals',
          title: 'Keep his festivals',
          instructions:
            'Keep the Anthesteria, Lenaia and Dionysia each year: first pour of new wine or juice, the day of the dead with its uneaten pot, and theatre.',
          times: 3,
          every: 'holy-day',
          prompt: 'How did I keep his festival this year?',
        },
        {
          id: 'dionysus-ongoing-rededicate',
          title: 'Yearly rededication',
          instructions:
            'At the Anthesteria or on your dedication anniversary, repeat the dedication rite with your promise rewritten for the coming year.',
          times: 1,
          every: 'holy-day',
          prompt: 'What has a year with Dionysus freed in me? What will I promise now?',
        },
      ],
    },
  ],
  sources: [
    'Homeric Hymn 7, To Dionysus, trans. H. G. Evelyn-White, Hesiod, the Homeric Hymns and Homerica (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (quoted: “and he sat with a smile in his dark eyes”; “What god is this whom you have taken and bind, strong that he is?”; “loud-crying Dionysus”)',
    'Homeric Hymn 26, To Dionysus, trans. H. G. Evelyn-White (1914), Project Gutenberg #348 (quoted: “ivy-crowned”; “Grant that we may come again rejoicing to this season, and from that season onwards for many a year”)',
    'Linear B tablets from Pylos (PY Xa 102, Xb 1419) naming di-wo-nu-so',
    'Euripides, Bacchae (405 BCE)',
    'Plutarch, On the Principle of Cold 18 (the Thyiades caught in snow on Parnassus), On the Bravery of Women 13 and Isis and Osiris 35 (the Thyiades at Delphi)',
    'Livy, History of Rome 39.8–19, and the Senatus Consultum de Bacchanalibus (186 BCE)',
    'Aristophanes, Acharnians; Athenaeus and Photius on the Anthesteria',
    'H. W. Parke, Festivals of the Athenians (1977); Walter Burkert, Greek Religion (1985) and Homo Necans (1983)',
    'Radcliffe G. Edmonds III, Redefining Ancient Orphism (2013), on the Zagreus myth',
    'Fritz Graf and Sarah Iles Johnston, Ritual Texts for the Afterlife (2013), on the Bacchic gold tablets',
  ],
};
