import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-persephone',
  kind: 'deity',
  paths: ['hellenic', 'roman', 'wheel'],
  deityRef: 'traditional/deity/persephone',
  title: 'Persephone: Maiden and Queen',
  summary:
    'A lunar month with Persephone, the Kore of spring and the dread queen of the dead: her hymn and its hard beginning, her two faces in Greek cult, the honest truth about the modern “dark goddess,” and a nine-night practice of pomegranate and flowers.',
  welcome: `This is a month of study and devotion with Persephone, daughter of Demeter, the girl of the spring meadow and the queen of the underworld. The ancient Greeks held both of these at once. She is the flower coming up through the soil and the grave queen who receives the dead, and her worshippers did not feel they had to choose.

It is a self-dedication, not an initiation. Persephone was at the centre of the Eleusinian Mysteries, the most famous initiation of the ancient world, and those rites were secret and are lost. Nothing here reconstructs them. What you will find is her hymn, her real cult, a clear account of what is modern in how she is pictured now, and a practice you can keep.

Her story begins with an abduction. If that touches your own life, go gently, take breaks, and skip any section you need to. You will need a small lamp or candle, a bowl of water, a pomegranate if you can find one, and some fresh flowers.`,
  about: `Persephone, called Kore, “the Maiden,” and in Athens often Pherephatta, was the daughter of Demeter and Zeus. In the Homeric Hymn to Demeter, Hades carries her off from a flowering meadow with Zeus’s consent; her mother’s grief stops the grain from growing until Zeus relents, but because Persephone has eaten a pomegranate seed she must spend a third of each year below. Yet in Homer, which is older still, she is simply the “dread” queen of the dead, ruling beside Hades, with no abduction mentioned. In cult she was honoured with her mother at Eleusis and at the women’s Thesmophoria, and as a goddess of brides and the dead at Locri in southern Italy. Arcadia had a close cousin of hers, Despoina, “the Mistress,” a daughter of Demeter whose true name was secret. The Orphic gold tablets placed in graves address her as the queen the soul must meet. The Romans knew her as Proserpina. Today Hellenic polytheists honour her with Demeter and Hades, modern Pagans mark her descent and return at the equinoxes, and many people have taken her up as a “dark goddess” of shadow work and self-reclamation. That last image is modern, and this journey will say so, kindly and plainly.`,
  notes: [
    'The Eleusinian Mysteries were secret and are not reconstructed here. Anyone claiming to teach them is offering a modern creation.',
    'The Hymn tells of an abduction, using words like “against my will.” Modern retellings in which Persephone chooses Hades are modern. Both can be meaningful, but they are not the same story.',
    'The “dark goddess” and “shadow work” Persephone is a twentieth- and twenty-first-century framing. It draws on her real role as queen of the dead, but it is not how ancient people spoke of her.',
    'Offerings to her as queen of the dead are chthonic: they are poured into the earth or left, and not eaten. Offerings to her as Kore with her mother may be shared.',
    'Narcissus, lilies and many spring bulbs are poisonous to cats and dogs, and lilies can kill cats. Keep flower offerings well away from pets. Pomegranate is safe for people but keep the seeds from dogs.',
  ],
  holyDays: ['eleusinia', 'thesmophoria', 'anthesteria', 'haloa', 'skira', 'ostara', 'mabon'],
  stages: [
    {
      kind: 'threshold',
      title: 'At the edge of the meadow',
      intro:
        'Persephone stands between two worlds, the meadow and the hall below. So the journey begins at an in-between time, dusk, with flowers on one side of your lamp and a dish of earth on the other. You are introducing yourself to her and nothing more.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'persephone-threshold-two',
          title: 'Two kinds of offering',
          instructions:
            'Before the opening rite, gather two small things: a few fresh flowers or a green sprig from outside, and a small dish of soil from a garden, a park bed or a houseplant pot. Sit with both for a few minutes. One belongs to the girl in the meadow, the other to the queen below. Notice which one you reach for first.',
          times: 1,
          prompt: 'Which did I reach for first, the flowers or the earth? What does that tell me about why I have come?',
        },
      ],
      rite: {
        title: 'An introduction at dusk',
        summary:
          'A short Greek-style introduction at twilight: purify, begin with Hestia, greet Persephone as Kore and as Queen, and pour a little water onto the earth for her.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of fresh water for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A match, or a sprig of bay or rosemary to quench in it', ref: 'traditional/herb/bay' },
          { name: 'A tealight, oil lamp or electric candle' },
          { name: 'A few fresh flowers or a green sprig in a small vase' },
          { name: 'A small dish of soil', ref: 'traditional/vessel/dish' },
          { name: 'A small cup of water, or milk with honey, for the libation' },
          { name: 'A sprig of fresh mint', ref: 'traditional/herb/mint', optional: true },
        ],
        preparation:
          'Choose a time at dusk. Set the lamp in the middle of a small table, the flowers on the left, the dish of soil on the right, and the cup in front. Wash your face and hands in ordinary water first.',
        steps: [
          {
            title: 'Make khernips',
            instructions:
              'Light the match or the tip of the bay sprig and plunge it into the bowl of water. This is khernips, the purified water of Greek ritual. Wash your hands in it and touch a few drops to your face.',
            spoken: 'With clean hands I come to the edge of the meadow.',
          },
          {
            title: 'Begin with Hestia',
            instructions:
              'Light the lamp. Every Greek rite begins with Hestia. Pour a drop of your libation onto the floor of the dish beside the lamp for her, or simply speak her name.',
            spoken: 'Hestia, first and last, I begin with you.',
            light: true,
          },
          {
            title: 'Greet the Maiden',
            instructions: 'Turn to the flowers. Raise your hands with palms up, as Greeks prayed to the gods above.',
            spoken:
              'Kore, daughter of Demeter, girl of the meadow, you who gathered roses and crocuses and violets: I am [your name]. I have come to learn who you are.',
          },
          {
            title: 'Greet the Queen',
            instructions:
              'Turn to the dish of soil. Lower your hands with palms down, toward the earth, as Greeks did for the powers below. Speak more quietly.',
            spoken:
              'Persephone, queen below, wife of the Host of Many, you who receive the dead: I greet you with respect. Be gentle with me as I learn.',
            minutes: 2,
          },
          {
            title: 'Pour for her',
            instructions:
              'Pour most of the libation slowly onto the soil in the dish. Do not drink from it after. Sit quietly with the lamp for a few minutes, between the flowers and the earth.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Speak Hestia’s name again and thank both goddesses. Put out the lamp.',
            spoken: 'Hestia, last as you were first. Persephone, thank you.',
            snuff: true,
          },
        ],
        closing:
          'Take the dish of soil outside and tip it onto earth, or into a plant pot. Pour the khernips away outside or down the sink. Keep the flowers until they fade, then compost them. Write a few lines about what it felt like to speak to her two ways.',
        safety:
          'Never leave a flame unattended. Keep flowers, especially lilies, narcissus and other spring bulbs, out of reach of cats and dogs; lily pollen can kill a cat. Quench the khernips match fully.',
      },
    },
    {
      kind: 'study',
      title: 'Two names, one goddess',
      intro:
        'About ten days of reading, one lesson every two or three days. First who she was in Greek religion, then her story read closely and honestly, then her cult and the modern ways she is honoured.',
      days: 10,
      lessons: [
        {
          id: 'persephone-who',
          title: 'Kore and the dread queen',
          summary: 'Her names, her two faces, her symbols, and how she appears in Homer before the abduction story.',
          minutes: 6,
          sections: [
            {
              heading: 'The Girl',
              body: `Greeks often did not use Persephone’s name at all. They called her Kore, which simply means “girl” or “maiden,” the way you might say “the Daughter.” Inscriptions speak of “the Two Goddesses,” Demeter and Kore, so often that the phrase needed no explanation. As Kore she belongs with her mother, with the spring flowers and the young grain, and with brides, because in Greek life a girl became a woman by marrying and leaving her mother’s house.

Her own name was felt to be awesome and a little dangerous. Its forms vary a great deal: Persephone, Persephassa, Pherephatta in Athens, Proserpina in Rome. Its meaning is unknown. Ancient writers linked it with words for “bringing death” or “destroying light,” but these are guesses, possibly made because of her later role.`,
            },
            {
              heading: 'The queen in Homer',
              body: `Here is a surprise. In Homer’s epics, which are older than the Hymn to Demeter, Persephone is already queen of the dead, and there is no story about how she got there. In the Odyssey, Circe tells Odysseus he must go “to the house of Hades and of dread Proserpine” to consult the dead prophet Teiresias. It is Persephone who sends up the ghosts of famous women for him to see, and Odysseus fears she will send up a Gorgon’s head.

In the Iliad, a grieving mother called Althaia beats the earth with her hands and calls on Hades and Persephone to punish her son. So the earliest Persephone is not a girl taken unwillingly. She is a powerful, frightening queen, wife of Hades, who answers prayers made with hands on the ground.`,
            },
            {
              heading: 'Her titles',
              body: `Her titles show both sides. As Kore she is Hagne, “the pure” or “holy.” In Homer she is epaine, “dread,” and in the Orphic hymn to her she is Praxidike, “exacter of justice.” She is called Chthonia, “of the earth,” and simply Anassa, “Queen.” Despoina, “the Mistress,” was used of her and of other great goddesses as a respectful title.

Be careful with one famous Despoina. At Lykosoura in Arcadia, the Despoina worshipped in a great sanctuary was, Pausanias says, a daughter of Demeter by Poseidon, not by Zeus, and her real name was kept from the uninitiated; he will not write it, though he does write Persephone’s. She is a sister or local double of Kore rather than Kore herself. Many modern devotees also call Persephone Queen of the Dead or Iron Queen. These are good modern titles drawn from old ideas. When you pray, use whichever names fit what you are asking: Kore or Hagne for spring and new growth, Persephone, Anassa or Praxidike for matters of death and justice.`,
            },
            {
              heading: 'Symbols, plants and animals',
              body: `Her symbols are the pomegranate, which ties her to the underworld; the torch, carried by her and her mother in art; ears of grain; and spring flowers, especially the narcissus that lured her. She is often shown crowned and enthroned beside Hades, or holding a sceptre. Mint is linked to her through a late story in which she turned the nymph Minthe, a lover of Hades, into the plant. Poplars and willows grow in her grove at the edge of the underworld in the Odyssey.

Animals are less clear. Snakes, which live in the ground, appear with her and Demeter. Modern lists often add bats and deer; these are modern associations rather than ancient ones. Her places are Eleusis, the Plutonion cave beside the Eleusinian sanctuary, Lykosoura in Arcadia, Locri in southern Italy, and Sicily, which claimed the meadow of her abduction near Enna.`,
            },
          ],
          knowAndDont: {
            known:
              'Homer’s Odyssey (books 10–11) and Iliad (book 9) show her as queen of the dead without telling the abduction story. Her titles Hagne, epaine and Praxidike are attested in literature, inscriptions and the Orphic hymns. Pausanias (8.37.9) makes the Lykosoura Despoina a daughter of Demeter and Poseidon, distinct from Kore. The pomegranate, torch, grain and flowers are her emblems in art.',
            unknown:
              'Her name’s meaning and origin are unknown. Some scholars think the Maiden of the grain and the Queen of the dead were once separate goddesses who merged; others think they were always one. The Minthe story is late, and modern animal lists are mostly modern.',
          },
          inPractice:
            'Many Hellenic polytheists keep Persephone on the shrine beside her mother as Kore and honour her separately, at night and with chthonic offerings, as queen. Choose two names to use this month, one for each face. Kore and Anassa are a good pair.',
          reflect: [
            'Which Persephone came to you first, the maiden or the queen? Did you know the queen was older in the sources?',
            'Where in your own life do you hold two roles that seem not to fit together?',
          ],
          further: [
            'Homer, Odyssey books 10–11, trans. Samuel Butler (1900), free on Project Gutenberg',
            'Pausanias, Description of Greece 8.37, on Despoina at Lykosoura, a goddess close to Kore but not the same',
            'Walter Burkert, Greek Religion (1985), section on Demeter and Persephone',
          ],
          library: ['traditional/deity/persephone', 'traditional/deity/demeter', 'traditional/deity/hades', 'traditional/herb/mint'],
        },
        {
          id: 'persephone-hymn',
          title: 'The meadow, the seed and the throne',
          summary: 'The Homeric Hymn read from Persephone’s side, honestly, including the parts modern retellings change.',
          minutes: 8,
          sections: [
            {
              heading: 'Taken from the meadow',
              body: `The Homeric Hymn to Demeter, from around the seventh or sixth century BCE, is the main ancient telling of Persephone’s story. It opens with her gathering flowers with the daughters of Ocean. Earth has grown a marvellous narcissus with a hundred blooms, “to be a snare for the bloom-like girl.” When she reaches for it, the ground opens and Hades drives out in his golden chariot. The hymn says he caught her up “reluctant” and bore her away “lamenting,” and that she cried out to her father, Zeus. Zeus had agreed to the marriage without asking her or her mother.

This is an abduction, and the hymn does not soften it. Greek marriages were arranged between a father and a husband, and brides often grieved at leaving home, but the hymn’s language goes further. It says she was taken “all unwilling.”`,
            },
            {
              heading: 'The seed',
              body: `Persephone is in the underworld for most of the hymn, and we hear nothing from her. When Zeus finally sends Hermes to bring her back, Hades speaks to her kindly for the first time. He tells her that while she is below, “you shall rule all that lives and moves and shall have the greatest rights among the deathless gods,” and that those who fail to honour her with offerings will be punished for evermore. Then he secretly gives her a pomegranate seed to eat.

When she reunites with Demeter, she tells her mother that Hermes came and “I sprang up at once for joy,” but that Hades “secretly put in my mouth sweet food, a pomegranate seed, and forced me to taste against my will.” Because she has eaten in the underworld, she must spend a third of the year there. The rest she spends with her mother and the gods.`,
            },
            {
              heading: 'What changed in the retellings',
              body: `Many modern versions, in novels, comics, poems and devotional writing, tell the story differently: Persephone chooses Hades, eats the seed knowingly, and goes down to claim her throne. Some of these are lovely, and they have helped many people, especially survivors, find a story of power in a myth of being taken. But they are modern. The ancient hymn says she ate “against my will.”

Later ancient writers also changed details. Ovid, writing in Latin around 8 CE, says she ate seven seeds in an underworld orchard and was betrayed by Ascalaphus, who saw her do it. Other writers set the meadow in Sicily. There was never one fixed version. The honest way to hold this is to know which version you are telling, and not to claim that a modern meaning is the ancient one.`,
            },
            {
              heading: 'The queen who stays',
              body: `Whatever you make of the beginning, the end of the hymn matters. Persephone becomes something more than a daughter. Hades’s promise of great honours is kept: she rules the dead, and those who die must reckon with her. Hekate embraces her and from then on is her “minister and companion,” and she goes back and forth between the worlds every year.

That is why ancient people could honour her in two ways without contradiction. She is the girl whose return means the grain will grow, and she is the queen who receives the dead with justice and, for the initiated, kindness. Her story moves from being taken to holding power. For many devotees, that movement, not any romance, is the heart of her.`,
            },
          ],
          knowAndDont: {
            known:
              'The Homeric Hymn to Demeter clearly describes an abduction approved by Zeus, Hades’s promise of honours, the secret pomegranate seed and the thirds of the year. Ovid (Metamorphoses 5, Fasti 4) gives later variations. Modern “Persephone chose” retellings are well documented as recent works.',
            unknown:
              'We do not know how ancient listeners felt about the abduction, or whether initiates at Eleusis understood the story differently. Which third of the year she spends below is not stated in the hymn; many scholars think it was the Greek summer, when seed grain was stored underground.',
          },
          inPractice:
            'Read the hymn this week with a pomegranate beside you. Many devotees open the pomegranate after reading, offer some seeds to her, and eat a few themselves while thinking about what they have taken in that changed them. Seeds you eat are your own; seeds you give her are left for her.',
          reflect: [
            'Which version of her story do you find yourself telling? What do you need it to say?',
            'Have you ever been changed by something you did not choose? What power did you find there?',
          ],
          further: [
            'Homeric Hymn to Demeter, trans. H. G. Evelyn-White (1914), Project Gutenberg #348',
            'Ovid, Metamorphoses book 5, on Proserpina',
            'Helene P. Foley (ed.), The Homeric Hymn to Demeter (1994)',
          ],
          library: ['traditional/deity/persephone', 'traditional/deity/hades', 'traditional/deity/demeter', 'traditional/deity/hekate'],
        },
        {
          id: 'persephone-cult',
          title: 'How she was worshipped',
          summary: 'Eleusis, the Thesmophoria, Locri’s brides, the Orphic gold tablets, and the manner of chthonic offering.',
          minutes: 7,
          sections: [
            {
              heading: 'With her mother',
              body: `Most of Persephone’s worship was shared with Demeter. At Eleusis the Mysteries were for both goddesses, and the story of her loss and return was at their centre, though what initiates saw inside the hall remains secret. The Lesser Mysteries at Agrai each spring were associated especially with Kore. At the women’s Thesmophoria in autumn, mother and daughter were honoured together, and the third day, Kalligeneia, “fair birth,” prayed for good children and good crops; ancient writers were unsure which goddess the name Kalligeneia belonged to.

At Eleusis there was also a small cave sanctuary, the Plutonion, built into the rock beside the great hall, sacred to Hades and Persephone as rulers of the dead. It was a doorway to the underworld in stone. Many Greek towns had places like this, caves and chasms where people believed the queen below could be reached.`,
            },
            {
              heading: 'Brides and the dead at Locri',
              body: `At Locri Epizephyrii, a Greek city on the toe of Italy, Persephone had one of her most important temples. Archaeologists found thousands of small clay plaques, the pinakes, from the fifth century BCE. They show her abduction, her enthroned with Hades, and girls bringing offerings of clothes, mirrors and boxes, probably before their own weddings.

So at Locri Persephone was the goddess of girls becoming wives, of the passage from one home to another, as well as of the dead. The Greeks often compared marriage and death: both were journeys away from home, and the wedding torches and the funeral torches looked alike. A girl who died unmarried was sometimes called a “bride of Hades.”`,
            },
            {
              heading: 'The gold tablets',
              body: `Some of the most moving evidence for Persephone comes from graves. From the fifth century BCE onward, a few people in southern Italy, Crete, Thessaly and elsewhere were buried with thin sheets of gold inscribed with instructions for the soul. These are often called Orphic or Bacchic gold tablets. They tell the dead person what to say in the underworld.

Several are addressed to Persephone. The dead person says they come pure, from the pure, to the Queen of those below, and asks to be sent to the dwelling place of the blessed. One tablet tells the dead to say they have paid the penalty for unjust deeds. Persephone here is the judge and the welcomer of souls, a queen to be addressed with care and hope. These tablets were for a small group of initiates, not for ordinary Greeks.`,
            },
            {
              heading: 'The manner of offering',
              body: `When Persephone was approached as queen of the dead, the rules of chthonic worship applied. Prayers were made with hands lowered or palms on the ground; Althaia in the Iliad beats the earth to call her. Libations were poured into a pit or straight onto the soil. Offerings to the powers below were usually not shared or eaten by the worshippers. They were given away completely, often at night.

As Kore, at the festivals with her mother, she was honoured more like the gods above, with garlands, hymns, processions and feasts. A simple modern rule: offerings to Kore, such as flowers and spring water, may be set on the shrine with the rest of the household’s gifts, and food for her may be part of a shared meal. Offerings to the Queen are poured or placed into the earth, and left.`,
            },
          ],
          knowAndDont: {
            known:
              'Persephone’s place at Eleusis and the Thesmophoria, the Locri pinakes, the Plutonion at Eleusis and the gold tablets are all well attested by archaeology and texts. The gestures of chthonic prayer and libation into the earth are described in Homer and later authors.',
            unknown:
              'What the Eleusinian initiates learned about her is unknown. The gold tablets belonged to small mystery groups whose beliefs we only partly understand, and scholars disagree about how “Orphic” they are. Exactly what the Locri girls did at her temple is inferred from images.',
          },
          inPractice:
            'Set up her shrine now. Many devotees keep two small spaces, or two halves of one: a bright side for Kore with flowers and spring water, and a darker side for the Queen with a dish of earth, a pomegranate and a small lamp. You will pour for the Queen into the earth and never eat from her dish.',
          reflect: [
            'What do you think the dead person meant by coming “pure” to the queen below?',
            'Which side of her shrine do you expect to spend more time at?',
          ],
          further: [
            'Fritz Graf and Sarah Iles Johnston, Ritual Texts for the Afterlife: Orpheus and the Bacchic Gold Tablets (2nd ed., 2013)',
            'Christiane Sourvinou-Inwood, “Reading” Greek Culture (1991), on the Locri pinakes',
            'George E. Mylonas, Eleusis and the Eleusinian Mysteries (1961)',
          ],
          library: ['traditional/deity/persephone', 'traditional/deity/demeter', 'traditional/deity/hades', 'traditional/vessel/offering_bowl'],
          premade: ['folk-khernips-libation'],
        },
        {
          id: 'persephone-today',
          title: 'Persephone today, and the dark goddess',
          summary: 'The communities that honour her now, the equinox custom, the modern “dark goddess” framing, and a shrine of your own.',
          minutes: 7,
          sections: [
            {
              heading: 'Who honours her now',
              body: `Hellenic polytheists, who try to reconstruct ancient Greek religion from the evidence, honour Persephone with Demeter at the Eleusinia, Thesmophoria and Haloa, and with Hades as queen of the dead. They are careful with chthonic custom and tend to approach her as one of many gods. Groups such as Hellenion in the United States and YSEE in Greece follow this approach, though their practices differ.

Eclectic Pagans and Wiccans often honour her through the Wheel of the Year: she goes down at the autumn equinox and returns at the spring equinox, or at Samhain and Imbolc in some groups. This seasonal pattern is modern and based on the northern European calendar. It is a sincere and lovely way to keep her, but it is not the ancient Greek timing.`,
            },
            {
              heading: 'The dark goddess',
              body: `Over the last fifty years, Persephone has become one of the best-loved “dark goddesses” of modern spirituality, alongside Hekate, Lilith and the Morrigan. In this framing she is the guide of shadow work: going down into grief, trauma or the hidden self, and coming back up with authority. Jungian psychology, the goddess movement and many self-help books shaped this picture.

It is worth being honest about this. The ancient Persephone was dread and powerful, and she did go down and come back. But no ancient source treats her as a guide to personal psychological descent, or calls her a “dark goddess.” That is a modern meaning laid over an ancient figure. It can be deeply helpful. It works best when you know it is modern and do not mistake it for what the Greeks believed, and when you remember she is also the girl of the flowers.`,
            },
            {
              heading: 'Grief and the dead',
              body: `The other way many people come to her is through death. Persephone receives the dead, and the gold tablets show people trusting her to be kind to them. People who have lost someone often pray to her to welcome their dead, and to Kore to bring them back to life in themselves.

This is good and old. But if you are drawn to her because you are thinking about your own death, or feel pulled toward the underworld in a way that frightens you, please talk to someone you trust today, or to a crisis line: 988 in the US, Samaritans on 116 123 in the UK and Ireland, or your local emergency number. Grief that will not lift is also worth taking to a doctor or a bereavement service. Persephone’s story ends with her coming back up into the light every year. The descent is only half of it.`,
            },
            {
              heading: 'A shrine of your own',
              body: `A Persephone shrine can be small. You need a lamp or candle holder, a dish for earth or chthonic libations, a small vase for flowers, and something of the pomegranate: the fruit itself in season, a dried one, or a picture. Add an image of her, a sheaf of grain, a sprig of mint, a crown or circlet if you like. Black, white and green are modern colour choices, as are garnet and obsidian; ancient sources do not set colours or stones for her.

Let the shrine change with the seasons. Many devotees keep it bright with flowers in spring and summer and darker, with a pomegranate and dried leaves, in autumn and winter. If you also honour Demeter, place them side by side. If you honour Hades, keep his things near the Queen’s side.`,
            },
          ],
          knowAndDont: {
            known:
              'Hellenic reconstructionist practice draws on ancient festivals and chthonic custom. The equinox descent and return pattern is documented as a modern Pagan practice. The “dark goddess” framing can be traced through twentieth-century goddess spirituality and Jungian writing.',
            unknown:
              'There is no ancient evidence for Persephone as a guide of personal shadow work, or for her association with particular colours and crystals. How modern seasonal timing relates to the ancient one is unclear, because the hymn does not say which part of the year she spends below.',
          },
          inPractice:
            'Decide how you will mark her year: the Greek festivals, the equinoxes, or both. Put the next one in your calendar. Arrange the shrine with a bright side and a dark side, and choose one place outdoors, a tree root, a garden bed, a planter, where you can pour her libations into the earth.',
          reflect: [
            'What draws you to Persephone: spring, death, power, or the descent and return?',
            'If the dark goddess image is modern, does it still hold meaning for you? How will you hold both?',
          ],
          further: [
            'Christine Downing, The Long Journey Home: Re-visioning the Myth of Demeter and Persephone for Our Time (1994), an example of the modern framing',
            'Drew Campbell, Old Stones, New Temples (2000), on Hellenic reconstructionism',
            'Jennifer Larson, Ancient Greek Cults (2007)',
          ],
          library: ['traditional/deity/persephone', 'traditional/deity/demeter', 'traditional/deity/hekate', 'traditional/crystal/garnet', 'traditional/crystal/obsidian'],
          premade: ['wicca-ostara-seed-and-egg', 'wicca-mabon-thanks-and-balance'],
        },
      ],
      practices: [
        {
          id: 'persephone-study-hymn',
          title: 'Read the hymn with a pomegranate',
          instructions:
            'Over two or three evenings, read the Homeric Hymn to Demeter aloud. Pay attention to the few lines where Persephone herself speaks. If you have a pomegranate, open it on the last evening.',
          times: 1,
          prompt: 'What does Persephone say in her own voice? What do I hear in it?',
        },
        {
          id: 'persephone-study-shrine',
          title: 'Build a two-sided shrine',
          instructions:
            'After the third lesson, set up her shrine with a bright side for Kore (flowers, spring water) and a dark side for the Queen (a dish of earth, a pomegranate, a small lamp). Choose your outdoor pouring place.',
          times: 1,
          prompt: 'What did I put on each side, and how does each side feel?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights between the worlds',
      intro:
        'Nine nights of a short practice, then a lesson on her days and offerings. The nights alternate: on odd nights greet Kore with flowers or water, on even nights greet the Queen with a libation poured into the earth. The ninth night is for both.',
      days: 12,
      lessons: [
        {
          id: 'persephone-days-offerings',
          title: 'Her days, her offerings, and what not to do',
          summary:
            'The festivals and seasons for Persephone, what to give her in each face, the rules of the chthonic pour, and the hard parts.',
          minutes: 7,
          sections: [
            {
              heading: 'Her days',
              body: `Persephone’s festivals are mostly her mother’s too. In autumn come the Eleusinia, in the month of Boedromion, and the Thesmophoria in Pyanepsion. In midwinter the Haloa honoured Demeter, Kore and Dionysus at the threshing floor. In early spring the Lesser Mysteries at Agrai were especially hers, and the Anthesteria, Dionysus’s flower festival, ended with a day for the dead, when her realm came close. At midsummer the Skira honoured both goddesses.

If you also keep the Wheel of the Year, the spring and autumn equinoxes are the modern dates for her return and descent. You can keep both calendars. Just know which is which, and do not tell anyone the equinox is the ancient date.`,
            },
            {
              heading: 'Offerings to Kore',
              body: `For Kore, offer fresh flowers, especially the ones in her meadow: roses, crocuses, violets, irises and hyacinths, and the narcissus with care. Offer spring water, milk and honey, young green shoots, ears of grain, and a small garland or circlet of flowers. Hymns, poems and songs suit her. These can sit on the shrine with your other household gifts, and if you give food as part of a festival meal shared with her mother, the household may eat the rest.

Remember pets. Lilies, narcissus, hyacinths and many bulbs are poisonous to cats and dogs, and lilies can kill a cat. If you share your home with animals, choose roses, violets or herbs, or use flowers that are well out of reach.`,
            },
            {
              heading: 'Offerings to the Queen',
              body: `For the Queen, the traditional chthonic libations are honey mixed with milk, then wine, then water, the order Circe gives Odysseus in the Odyssey for offerings to the dead. Pomegranate seeds, dark bread, barley and a little incense are also fitting. Pour libations onto bare earth, into a planter, or into a dish of soil you will later tip outside. If you live with no earth at all, pour into a bowl and take it outside to a drain or a patch of ground afterwards.

These offerings are not eaten, by you or anyone. Pour with your hand turned downwards, toward the ground. Offer at night if you can. Do not take back what you have given, and do not put her chthonic dish back in the kitchen cupboard with ordinary plates; keep it for her.`,
            },
            {
              heading: 'What not to do',
              body: `Do not make her a love goddess for summoning a partner. Some modern spells use Persephone and Hades as a model romance; the ancient story is about a marriage arranged without her consent, and asking her to bind someone to you is a poor fit for her and has no place in this journey. Ask her instead for courage in change, for the safe rest of your dead, for justice, and for the return of life after hard seasons.

Do not invoke her in anger against people who hurt you. Praxidike exacts justice in her own way. Bring her your grief and your anger, honestly, and ask for protection and healing. Leave the punishing to her.`,
            },
          ],
          knowAndDont: {
            known:
              'Her festivals with Demeter and Dionysus are attested in the Athenian calendar. Honey-milk, wine and water as offerings to the dead appear in Odyssey 10 and 11. Pomegranates in her cult and imagery are well attested, and pomegranates were forbidden food at the Haloa and Thesmophoria according to some sources.',
            unknown:
              'We do not know exactly which offerings were made to Persephone alone, apart from Demeter, in most places. Many popular offerings online, such as dark chocolate, are modern. The equinox calendar is modern.',
          },
          inPractice:
            'Keep the nine nights below. On the Queen’s nights, use honey and milk, then water, poured onto earth with your palm down. On Kore’s nights, set out fresh flowers and spring water and speak or sing to her. On the ninth, do both and open a pomegranate if you have one.',
          reflect: [
            'How did the two kinds of night feel different?',
            'What are you asking her for, and is it something that fits who she is?',
          ],
          further: [
            'Homer, Odyssey 10.516–520, trans. Samuel Butler (1900)',
            'Jon D. Mikalson, Ancient Greek Religion (2nd ed., 2010), on chthonic offerings',
          ],
          library: ['traditional/deity/persephone', 'traditional/deity/hades', 'traditional/herb/rose', 'traditional/herb/mint', 'traditional/vessel/offering_bowl'],
          premade: ['folk-khernips-libation', 'hedge-ancestor-candle-evening'],
        },
      ],
      practices: [
        {
          id: 'persephone-nine-nights',
          title: 'Nine nights between the worlds',
          instructions:
            'For nine nights, at about the same time after dark, go to her shrine. Wash your hands. Light the lamp and speak Hestia’s name. On nights one, three, five and seven, turn to Kore’s side: refresh the flowers or water, palms up, and tell her one thing that is growing in you. On nights two, four, six and eight, turn to the Queen’s side: palms down, pour a little honey-milk or water onto the dish of earth, and tell her one thing you are grieving or letting go. On the ninth night, do both, and offer a few pomegranate seeds to the Queen. Sit for three minutes each night. Put out the light. Tip the earth dish outside every few days, and never eat from it.',
          times: 9,
          every: 'day',
          prompt: 'Tonight was a Kore night or a Queen night. What came up, and what did I give?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Before the seed',
      intro: `Persephone’s story turns on a single seed: once eaten, it bound her to a place. A dedication is something like that, a promise you take into yourself. So take a few days before you decide.

Stopping here is a good outcome. So is pausing for a season, or realising that Demeter, another god, another path, or no dedication at all is right for you. Unlike Persephone in the hymn, you have every choice. Use it.`,
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'persephone-discern-seed',
          title: 'Hold the seed',
          instructions:
            'Take a single pomegranate seed or any seed, and hold it in your palm for a few minutes. Do not eat it. Ask yourself whether you want to take this promise into your life. Then plant it in a pot, or give it to the earth outside.',
          times: 1,
          prompt: 'What did I feel holding the seed? Do I want to take this in?',
        },
      ],
      questions: [
        'Have I kept the nine nights because I wanted to, or because I felt I had to?',
        'Am I drawn to Persephone herself, or mainly to the dark goddess image, or to the romance in modern retellings? Is that enough?',
        'Is part of my pull toward her about grief or death that I need support with, not only devotion?',
        'Can I keep her two faces, the flowers and the earth, and her festivals for a year in my life as it is?',
        'Do I understand which parts of what I believe about her are ancient and which are modern, and am I at peace with that?',
        'Would I be relieved or disappointed if I chose to wait? What does that tell me?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication of the two thrones',
      intro: `If you have chosen to go on, make your dedication at dusk on a day that suits her: an equinox, the start of the Eleusinia or Thesmophoria, or the Noumenia. This is a self-dedication: a promise you make on your own behalf. It is not an initiation. It does not make you an initiate of Eleusis or of any Orphic or Bacchic group, and it does not replace the rites of any community that initiates.

Ancient Greeks rarely dedicated themselves to a single god. Your promise can sit beside honouring Demeter, Hades, Hekate and others.`,
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Persephone',
        summary:
          'Purify, begin with Hestia, honour Kore with flowers and the Queen with a libation into the earth, make your promise between them, eat one seed of your own choosing, and close.',
        minutes: 50,
        ingredients: [
          { name: 'A bowl of fresh water and a match or bay sprig for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A lamp, tealight or electric candle' },
          { name: 'Fresh flowers in a small vase, pet-safe if you have animals' },
          { name: 'A dish of soil, or access to earth outside', ref: 'traditional/vessel/dish' },
          { name: 'A pomegranate, or a few pomegranate seeds' },
          { name: 'A cup of honey mixed with milk, and a cup of water' },
          { name: 'Your written promise on a card' },
          { name: 'A little myrrh or frankincense on a heatproof burner', ref: 'traditional/herb/myrrh', optional: true },
        ],
        preparation:
          'Write your promise in your own words, simple and doable: for example, to keep her shrine through the seasons, to pour for her at each of her festivals, to honour the dead, and to learn her story honestly. Clean the shrine. Bathe or wash and put on clean clothes. Set the flowers on the left of the lamp and the earth on the right, with the pomegranate in front.',
        steps: [
          {
            title: 'Purify',
            instructions:
              'Make khernips by quenching the flame in the water. Wash your hands and touch your face. Sprinkle a few drops on the flowers and the earth.',
            spoken: 'With clean hands I come between the meadow and the hall below.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the lamp and speak Hestia’s name. Add incense if you are using it.',
            spoken: 'Hestia, first and last, I begin with you.',
            light: true,
          },
          {
            title: 'Honour Kore',
            instructions: 'Turn to the flowers, palms up. Touch them gently.',
            spoken:
              'Kore, Hagne, holy girl of the meadow, daughter of Demeter, you who return with the flowers: I honour you.',
          },
          {
            title: 'Honour the Queen',
            instructions:
              'Turn to the earth, palms down. Pour the honey-milk slowly onto the soil, then the water.',
            spoken:
              'Persephone, Anassa, dread Queen, wife of the Host of Many, you who rule all that lives and moves below and receive the dead with justice: I honour you, and I give this to you and take nothing back.',
            minutes: 2,
          },
          {
            title: 'Make your promise',
            instructions:
              'Stand between the two sides, facing the lamp. Read your promise aloud.',
            spoken: 'This is my promise, made freely and by my own choice. Queen and Maiden, witness it.',
          },
          {
            title: 'The seed of your choosing',
            instructions:
              'Open the pomegranate if it is whole. Place a few seeds on the earth for the Queen; these are hers and are left. Then, if you wish, eat one seed yourself, freely and knowingly, as a sign that you take this promise in by choice. If you prefer not to, hold one in your hand instead and plant it later.',
          },
          {
            title: 'Sit with her',
            instructions: 'Sit in silence for a while with the lamp, between the flowers and the earth.',
            minutes: 7,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Speak Hestia’s name. Thank Persephone in both her faces. Put out the lamp.',
            spoken: 'Hestia, last as you were first. It is done.',
            snuff: true,
          },
        ],
        closing:
          'Take the dish of earth with its libation and seeds outside and give it to the ground, or leave it on the shrine overnight and do this in the morning. Do not eat any of it. Keep your written promise on the shrine and read it at each equinox or festival. Write in your journal what you promised and what the seed meant to you.',
        safety:
          'Never leave a flame unattended. Keep flowers and pomegranate seeds out of reach of cats and dogs; lilies, narcissus and spring bulbs are dangerous to pets. Incense smoke can affect asthma and small animals; use a little or skip it.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Down and up again',
      intro: `Your relationship with Persephone now lives in the turning year. Keep her festivals with her mother, the Eleusinia and Thesmophoria in autumn, the Haloa in winter, the Anthesteria in spring, and the equinoxes if you follow the Wheel. Let the shrine change with the seasons. Pour for the Queen into the earth now and then, especially when you remember your dead.

Once a year, at her descent or her return, read your promise again and renew it, change it, or set it down with thanks. If you drift away, come back with a single flower or a single pour into the earth. She goes away and comes back every year; she will not mind that you did too.`,
      days: 30,
      lessons: [],
      practices: [
        {
          id: 'persephone-ongoing-monthly',
          title: 'Monthly pour for the Queen',
          instructions:
            'Once a month, at the dark of the moon or on the Noumenia, pour honey-milk or water onto the earth for Persephone as Queen, with your palm down, and name your dead.',
          times: 12,
          every: 'month',
          prompt: 'Who did I name this month? What is the Queen holding for me?',
        },
        {
          id: 'persephone-ongoing-seasons',
          title: 'Turn the shrine with the seasons',
          instructions:
            'At each equinox and solstice, change the shrine: flowers and green in spring and summer, pomegranate, dried leaves and grain in autumn and winter.',
          times: 4,
          every: 'sabbat',
          prompt: 'Is she coming up or going down? Where am I?',
        },
        {
          id: 'persephone-ongoing-festivals',
          title: 'Keep her festivals',
          instructions:
            'Keep the Eleusinia, Thesmophoria, Haloa and Anthesteria as the app calendar marks them, alone or with others.',
          times: 4,
          every: 'holy-day',
        },
        {
          id: 'persephone-ongoing-rededicate',
          title: 'Yearly rededication',
          instructions:
            'At the equinox or festival nearest your dedication, repeat the dedication rite with your promise rewritten for the year ahead.',
          times: 1,
          every: 'holy-day',
          prompt: 'What has a year with Persephone taught me about going down and coming back?',
        },
      ],
    },
  ],
  sources: [
    'Homeric Hymn to Demeter, trans. H. G. Evelyn-White, Hesiod, the Homeric Hymns and Homerica (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (quoted: “to be a snare for the bloom-like girl”; “reluctant”; “lamenting”; “all unwilling”; “you shall rule all that lives and moves and shall have the greatest rights among the deathless gods”; “I sprang up at once for joy”; “secretly put in my mouth sweet food, a pomegranate seed, and forced me to taste against my will”; “minister and companion”)',
    'Homer, Odyssey, trans. Samuel Butler (1900), Project Gutenberg #1727: https://www.gutenberg.org/ebooks/1727 (quoted: “to the house of Hades and of dread Proserpine”; paraphrased: honey mixed with milk, wine and water, 10.516–520; Proserpine sending up the Gorgon’s head, book 11; her groves of poplars and willows, book 10)',
    'Homer, Iliad 9, trans. Samuel Butler (1898), Project Gutenberg #2199: https://www.gutenberg.org/ebooks/2199 (Althaia “beat the earth with her hands, calling upon Hades and on awful Proserpine”, paraphrased)',
    'Orphic Hymn 29, To Persephone (Praxidike as her title)',
    'Pausanias, Description of Greece 8.37.9 (Despoina at Lykosoura, daughter of Demeter and Poseidon, her name kept secret), trans. W. H. S. Jones, checked at https://www.theoi.com/Text/Pausanias8C.html',
    'Ovid, Metamorphoses 5 and Fasti 4 (later versions of the myth)',
    'Fritz Graf and Sarah Iles Johnston, Ritual Texts for the Afterlife (2013), on the gold tablets',
    'Christiane Sourvinou-Inwood on the Locri pinakes',
    'Helene P. Foley (ed.), The Homeric Hymn to Demeter (1994); Walter Burkert, Greek Religion (1985); Jennifer Larson, Ancient Greek Cults (2007)',
  ],
};
