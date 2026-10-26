import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-zeus',
  kind: 'deity',
  paths: ['hellenic', 'roman'],
  deityRef: 'traditional/deity/zeus',
  title: 'Zeus: Guest-Friend and King',
  summary:
    'A lunar month with Zeus, father of gods and men: the sky-god of Hesiod and Homer, Zeus of the guest, the oath and the household jar, Olympia and the oak of Dodona, and a practice of libations and real hospitality.',
  welcome: `This is a month of study and devotion with Zeus, the Greek god of the sky and the weather, of kingship and justice, of oaths, guests and suppliants, and of the household’s stores. People come to him for order, fairness and protection, and very often through the simple, demanding virtue the Greeks put at the centre of his worship: treating strangers well.

It is a self-dedication, not an initiation. Zeus had priests at his great sanctuaries, and some modern Hellenic groups have their own priesthoods; nothing here makes you one. What it offers is a month of learning who he actually was in Greek religion, keeping his household customs carefully, and deciding at the end whether to go on.

You will need a cup for libations, a bowl of water, a small lamp or candle, a jar with a lid, and the willingness to open your door, literally or otherwise, to someone.`,
  about: `Zeus was the chief god of the Greeks. His name goes back to an ancient word for the bright sky, the same root as the Roman Jupiter and the Vedic Dyaus, and it is already written on clay tablets from Mycenaean Pylos and Knossos, over three thousand years ago. In Hesiod’s Theogony he is the youngest son of Kronos and Rhea, hidden as a baby on Crete, who overthrows his father and the Titans and shares out the world among the gods. Homer calls him “father of gods and men”. He was the god of the sky, the storm and the thunderbolt; the guardian of guests, strangers and suppliants; the witness of oaths; the protector of the household’s goods; and the power behind just rule. His greatest sanctuaries were at Olympia, where the games were held in his honour and Phidias’s gold and ivory statue sat in his temple, and at Dodona, where his oracle spoke through an oak. Today Hellenic polytheists pour him a libation at almost every rite, keep a jar for Zeus Ktesios in the pantry, and honour him at festivals such as the Diasia. This journey teaches the god of cult as well as the god of myth, and is honest about both.`,
  notes: [
    'Many myths of Zeus are stories of deception or force: Europa, Leda, Io, Ganymede and others. Hellenic polytheists read them in different ways, and devotion to him does not require excusing them. The journey says so plainly.',
    'Zeus Horkios is the god of oaths. Do not swear by him casually, and do not promise him what you will not do.',
    'Ancient worship of Zeus involved animal sacrifice, and some of his cults had dark rumours attached. Modern home practice uses libations, barley, cakes and incense, and nothing here asks for more.',
    'Hospitality is his oldest demand, but it never means putting yourself in danger. Kindness to strangers can be a meal shared, a donation, a welcome at work or a seat on the bus. Use judgement about who you let into your home.',
    'Greek religion was never one tradition. Practices here are drawn mainly from Athens and Homer, with other places named. Modern groups differ, and that is normal.',
  ],
  holyDays: ['noumenia'],
  stages: [
    {
      kind: 'threshold',
      title: 'A libation under the sky',
      intro:
        'Zeus is the god of the open sky, and he receives the first pour of wine at a Greek meal. So the journey begins outdoors or at an open window, with clean hands, a lamp and a libation. You are only introducing yourself. Nothing is promised yet.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'zeus-threshold-sky',
          title: 'Watch the weather',
          instructions:
            'On each of the two days, spend five minutes outdoors or at a window watching the sky: the clouds, the wind, the light, any rain. Zeus was Nephelegeretes, the cloud-gatherer, and Ombrios, the rain-giver. Notice the weather as something alive, without trying to read signs into it.',
          times: 2,
          every: 'day',
          prompt: 'What was the sky doing? How did it change while I watched?',
        },
      ],
      rite: {
        title: 'An introduction under the sky',
        summary:
          'A short Greek-style introduction: purify your hands, begin with Hestia, then raise your hands to the sky, introduce yourself to Zeus by his old titles, and pour a libation for him.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of fresh water for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A match, or a sprig of bay to quench in it', ref: 'traditional/herb/bay' },
          { name: 'A tealight, oil lamp or electric candle' },
          { name: 'A cup of wine mixed with a little water, or grape juice', ref: 'traditional/tool/chalice' },
          { name: 'A dish to pour into, or a patch of earth outside', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A pinch of barley grains', optional: true },
          { name: 'A little frankincense on a heatproof burner', ref: 'traditional/herb/frankincense', optional: true },
        ],
        preparation:
          'Choose a place under the open sky, or by a window you can open: a garden, a balcony, a yard. Set the lamp, the cup and the pouring dish on a small table or the ground. Wash your face and hands in ordinary water first. Greek prayers to the gods of the sky were said standing, with the hands raised and the palms up.',
        steps: [
          {
            title: 'Make khernips',
            instructions:
              'Light the match or the tip of the bay sprig and plunge it into the bowl of water. This is khernips, the purified water of Greek ritual. Wash your hands in it and touch a few drops to your face.',
            spoken: 'With clean hands I come before the sky.',
          },
          {
            title: 'Begin with Hestia',
            instructions:
              'Light the lamp. In Greek custom every rite begins with Hestia, goddess of the hearth. Pour a drop of your libation into the dish for her.',
            spoken: 'Hestia, first and last, keeper of this house: I begin with you.',
            light: true,
          },
          {
            title: 'Call Zeus',
            instructions:
              'Face the open sky. Raise your hands, palms up. If you have barley, scatter a few grains; if you have incense, add a few grains now. Speak slowly. You are introducing yourself, not asking for anything.',
            spoken:
              'Zeus, father of gods and men, cloud-gatherer, giver of rain, Xenios who watches over guests, Horkios who hears oaths: I am [your name]. I have heard of you in Homer and Hesiod and in the stories of the sky. I come to learn who you are. Be gracious to me as I learn.',
            minutes: 2,
          },
          {
            title: 'Pour for him',
            instructions:
              'Pour most of the libation into the dish or onto the earth. Then stand quietly under the sky for a few minutes. Notice the wind, the light, the clouds. Let nothing come if nothing does.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Pour the last drop for Hestia. Thank them both, and put out the lamp.',
            spoken: 'Hestia, last as you were first, thank you. Zeus, thank you for the sky.',
            snuff: true,
          },
        ],
        closing:
          'Pour the dish onto earth or a plant pot, not back into a cup. Pour the khernips away outside or down the sink with a word of thanks. Write a few lines about how it felt to raise your hands to the sky and say your name.',
        safety:
          'Never leave a flame unattended, and keep it out of the wind and away from curtains. Quench the khernips match fully. If there is lightning, do this indoors at a closed window: Zeus’s thunderbolt was honoured, not approached. Grapes, raisins and wine are toxic to dogs and cats.',
      },
    },
    {
      kind: 'study',
      title: 'The father of gods and men',
      intro:
        'Ten days of reading, one lesson every two or three days. You will meet Zeus in Hesiod and Homer, then learn his many titles and the household Zeus, then visit his great sanctuaries, then see how he is honoured today. Read the short Homeric Hymn to Zeus aloud once during this stage.',
      days: 10,
      lessons: [
        {
          id: 'zeus-who',
          title: 'Who Zeus is',
          summary: 'His name, his birth on Crete, his rise to kingship in Hesiod, and the Zeus of Homer’s two jars.',
          minutes: 7,
          sections: [
            {
              heading: 'The bright sky',
              body: `Zeus is one of the oldest gods we can name. His name comes from an ancient word for the bright sky or day, the same root that gives the Roman Jupiter (from an older “sky-father”) and the Vedic Dyaus Pita. Linguists are confident about this family. It means the peoples who spoke these languages inherited a father-god of the shining sky long before there were Greeks or Romans.

He is already there in the oldest Greek writing. Clay tablets in the Linear B script from Pylos and Knossos, written between about 1400 and 1200 BCE, record offerings to Zeus, and even mention a shrine of Zeus at Pylos. Whatever he meant to those Mycenaean scribes, his name has been spoken in Greece for well over three thousand years.`,
            },
            {
              heading: 'The hidden child',
              body: `In Hesiod’s Theogony, composed around 700 BCE, Zeus is the youngest child of the Titans Kronos and Rhea. Kronos, warned that a son would overthrow him, swallows each child at birth. When Zeus is born, Rhea hides him in a cave on Crete and gives Kronos a stone wrapped in swaddling clothes, which he swallows instead (Theogony 453–506). Grown, Zeus forces his father to vomit up his brothers and sisters, and with them and the hundred-handed giants he wins a ten-year war against the Titans.

Then, unlike his father and grandfather, he does not simply rule. Hesiod says he shares out the honours fairly among the gods, keeping the old rights of those, like Hekate and Styx, who sided with him. That is the heart of Hesiod’s Zeus: not just the strongest, but the one who orders the world justly and keeps his word.`,
            },
            {
              heading: 'Homer’s Zeus',
              body: `In the Iliad and Odyssey, Zeus is “father of gods and men”, the cloud-gatherer and thunderer, who sits on Olympus and weighs the fates of armies in golden scales. He is powerful but not all-powerful; he can be argued with, tricked by Hera, and grieved by the death of his own son Sarpedon, whom he lets die because fate requires it.

At the end of the Iliad, Achilles tells the grieving Priam that two jars stand on Zeus’s threshold, one of evils and one of blessings. To some people Zeus gives a mixture, to some only evils, but to no one only blessings (24.527–533). It is one of the most honest pictures of a god in any literature: the giver of everything, good and bad, whose reasons we do not see.`,
            },
            {
              heading: 'His signs',
              body: `His signs are the thunderbolt, the sceptre, the eagle and the oak. The eagle was his messenger and bird of omen; the oak was his tree, above all at Dodona. The bull appears in his myths, most famously carrying Europa. He was shown as a mature, bearded man, standing to hurl the thunderbolt or seated as a king. Places struck by lightning were his, and in some cities they were fenced off as sacred to Zeus Kataibates, “who comes down”.`,
            },
          ],
          knowAndDont: {
            known:
              'The linguistic link between Zeus, Jupiter and Dyaus is secure. Zeus appears in Linear B tablets from Pylos and Knossos. Hesiod’s Theogony and the Homeric poems are our earliest full sources for his myth, and the two jars are in Iliad 24.527–533.',
            unknown:
              'What the Mycenaeans believed about Zeus is almost unknown; the tablets are lists of offerings. The Cretan birth story probably preserves older local traditions about a divine child, but how they relate to the Olympian Zeus is debated.',
          },
          inPractice:
            'Hellenic polytheists often begin a rite with a short hymn or a few lines of Homer or Hesiod. Read the passage on the two jars aloud this week, and the short Homeric Hymn to Zeus (Hymn 23), which takes less than a minute.',
          reflect: [
            'Which picture of Zeus did you arrive with: the thunderer, the king, the seducer, or the just ruler of Hesiod?',
            'What do you make of a god who gives from two jars, and never only good?',
          ],
          further: [
            'Hesiod, Theogony 453–506 and 881–885, trans. H. G. Evelyn-White (1914), free on Project Gutenberg',
            'Homer, Iliad 24.527–533, trans. Samuel Butler or A. T. Murray, free on Project Gutenberg',
            'Walter Burkert, Greek Religion (1985), section on Zeus',
          ],
          library: ['traditional/deity/zeus', 'traditional/deity/jupiter', 'traditional/herb/oak'],
        },
        {
          id: 'zeus-names',
          title: 'Zeus of the guest, the oath and the jar',
          summary: 'His titles, Xenios, Horkios, Ktesios, Herkeios and Meilichios, and how each was honoured in ordinary life.',
          minutes: 8,
          sections: [
            {
              heading: 'Many Zeuses',
              body: `Greeks did not worship one generic Zeus. They worshipped Zeus under a title that named the power they needed, and often at a separate altar for each. An Athenian household might honour Zeus Herkeios at the altar in its courtyard, Zeus Ktesios in its storeroom and Zeus Meilichios at a festival outside the city, and swear by Zeus Horkios in court. Learning these titles is the beginning of real devotion to him.`,
            },
            {
              heading: 'Xenios and Hikesios: strangers and suppliants',
              body: `The most important of all, for daily life, is Zeus Xenios, protector of guests and strangers, with Zeus Hikesios, protector of suppliants, those who come begging for help. In the Odyssey, the princess Nausicaa tells her frightened maids that “all strangers and beggars are from Zeus” (6.207–208), and Odysseus warns the Cyclops that Zeus avenges suppliants and strangers (9.270–271). The Cyclops, who eats his guests, is the poem’s picture of the worst kind of being.

Xenia, the guest-friendship Zeus guarded, was a sacred bond. A host gave food, shelter and a bath before even asking a stranger’s name; the guest owed respect and, later, the same in return. Breaking it was among the gravest wrongs. The Trojan War itself began, in the myth, when Paris broke his host’s trust.`,
            },
            {
              heading: 'Horkios: the oath',
              body: `Zeus Horkios, Zeus of oaths, was the witness of every sworn word. Pausanias describes a statue of Zeus Horkios at Olympia, holding a thunderbolt in each hand, before which athletes, their fathers and brothers and their trainers swore over the cut pieces of a boar that they would not cheat (5.24.9–10). Oath-breakers were believed to bring ruin on themselves and their families.

For a modern devotee the rule is simple: do not swear by Zeus unless you mean it as an oath, and keep it.`,
            },
            {
              heading: 'Ktesios, Herkeios and Meilichios: the household and the earth',
              body: `Zeus Herkeios, “of the fence” or courtyard, had an altar in the courtyard of the house, and to have one was a sign of being a full member of a household and a citizen. Zeus Ktesios, “of acquisitions”, guarded the storeroom and the household’s goods. He was honoured with a kadiskos, a jar. A writer quoted by Athenaeus explains how to set one up: a new two-handled jar with a lid, its handles wreathed in white wool, a yellow thread from the right shoulder, filled with pure water, olive oil and all kinds of fruits and seeds, which he calls “ambrosia” (Athenaeus 11.473b–c). Zeus Ktesios was sometimes pictured as a snake, the guardian of the storeroom.

Zeus Meilichios, “the gentle” or “easily appeased”, was a Zeus of the earth, also shown as a great snake. His festival, the Diasia, was in late winter outside Athens; Thucydides calls it the greatest festival of Zeus, at which many people offered not animals but local offerings, cakes shaped like animals (1.126.6). Here the sky-king faces the earth, and is approached for purification and mercy.`,
            },
          ],
          knowAndDont: {
            known:
              'The titles Xenios, Hikesios, Horkios, Herkeios, Ktesios and Meilichios are well attested in literature and inscriptions. The Odyssey passages on strangers are 6.207–208 and 9.270–271. Pausanias (5.24.9–10) describes Zeus Horkios at Olympia. Athenaeus (11.473b–c) preserves instructions for the kadiskos; Thucydides (1.126.6) describes the Diasia. Snake reliefs of Zeus Meilichios survive from Piraeus.',
            unknown:
              'The kadiskos instructions come from a lost handbook quoted centuries later, and the text is difficult; modern recipes vary. How many households kept one is unknown. The relation between Zeus Ktesios and other household snake-guardians is debated.',
          },
          inPractice:
            'Choose two or three of his titles to use this month, for example Xenios, Horkios and Ktesios, and write them on a card for the shrine. Find a jar with a lid for a kadiskos; you will set it up in the practice stage.',
          reflect: [
            'Who is a stranger to you this month, and what would treating them as “from Zeus” look like?',
            'What do you keep in your own storeroom, and what are you grateful to have?',
          ],
          further: [
            'Homer, Odyssey 6 and 9, trans. Samuel Butler (free on Project Gutenberg)',
            'Jon D. Mikalson, Ancient Greek Religion (2nd ed., 2010)',
            'A. B. Cook, Zeus: A Study in Ancient Religion (1914–40), for the titles in great detail',
          ],
          library: ['traditional/deity/zeus', 'traditional/deity/hestia', 'traditional/vessel/bowl'],
          premade: ['kitchen-housewarming-blessing'],
        },
        {
          id: 'zeus-sanctuaries',
          title: 'Olympia, Dodona and the mountain tops',
          summary: 'The games and the great statue, the oak and the lead tablets, Crete, and the dark rumours of Mount Lykaion.',
          minutes: 7,
          sections: [
            {
              heading: 'Olympia',
              body: `Olympia, in the western Peloponnese, was the greatest sanctuary of Zeus. The games held there every four years, traditionally from 776 BCE, were religious festivals in his honour, with a great sacrifice of a hundred oxen at his altar, which was built up over centuries from the ash of sacrifices. A sacred truce let athletes and spectators travel safely to the festival.

In the fifth century BCE the sculptor Phidias made the cult statue for the new temple of Zeus: a seated figure about twelve metres high, of gold and ivory over a wooden frame, holding a small Victory in one hand and a sceptre in the other. It was counted among the Seven Wonders of the World. Pausanias describes it at length (5.11). Phidias’s workshop has been found, with tools and a cup scratched with his name.`,
            },
            {
              heading: 'Dodona',
              body: `Dodona, in the mountains of Epirus in the north-west, was Zeus’s oldest oracle. In the Iliad, Achilles prays to “Zeus of Dodona”, whose priests, the Selloi, sleep on the ground with unwashed feet (16.233–235). Zeus answered through the rustling of a sacred oak, and later through bronze vessels that rang when struck, and doves were said to have founded the shrine.

The most moving finds from Dodona are thousands of small lead tablets on which ordinary people scratched their questions. Should I marry? Is the child mine? Should I take up sheep farming? Will I do better if I move to another city? They show Zeus not only as a king of the world, but as someone a shepherd or a worried parent could ask for help.`,
            },
            {
              heading: 'Crete and the Divine Child',
              body: `Crete had its own Zeus, the hidden child of the cave. Caves on Mount Ida and Mount Dikte were honoured as his birthplace, and the Cretans even showed a tomb of Zeus, which scandalised other Greeks. A hymn inscribed at Palaikastro in eastern Crete calls on the “greatest Kouros”, the divine youth, to come at the turning of the year and leap for the flocks, the fields and the cities.

This young, dying-and-returning Cretan Zeus is very different from the bearded king of Olympia. Greek religion held both.`,
            },
            {
              heading: 'Mount Lykaion',
              body: `Not all of his mountain shrines were gentle. On Mount Lykaion in Arcadia, Zeus Lykaios had an altar of heaped earth on the summit, and ancient writers whispered that human sacrifice was performed there, and that whoever tasted the human flesh became a wolf. Plato mentions the story (Republic 565d), and Pausanias, visiting, says he preferred not to pry into the secret sacrifice (8.38.7).

Excavators found a human burial in the ash altar in 2016, which made headlines; whether it is evidence of sacrifice is far from clear. It is honest to know the rumours existed, and that the sanctuary was old and strange. Nothing about it is part of modern practice.`,
            },
          ],
          knowAndDont: {
            known:
              'The Olympic festival, the ash altar and Phidias’s statue are described by Pausanias (book 5) and confirmed by excavation. Iliad 16.233–235 describes the Selloi. The Dodona lead tablets are published in great numbers. The Palaikastro hymn survives on stone. Plato and Pausanias report the Lykaion stories.',
            unknown:
              'The 776 BCE date for the first games is traditional and probably too precise. How the oracle at Dodona worked in detail is uncertain. Whether human sacrifice was ever performed on Mount Lykaion is unproven.',
          },
          inPractice:
            'Write a question to Zeus as the people of Dodona did: one plain question about your own life, on a slip of paper. Keep it on your shrine through the practice stage. You will not get a voice from an oak; see what the month answers.',
          reflect: [
            'Which of these Zeuses, the king of Olympia, the oak of Dodona, or the child of Crete, feels closest to you?',
            'What question would you scratch on a lead tablet, if you could ask only one?',
          ],
          further: [
            'Pausanias, Description of Greece 5.10–5.15 and 8.38, trans. W. H. S. Jones (1918)',
            'Esther Eidinow, Oracles, Curses, and Risk among the Ancient Greeks (2007), on the Dodona tablets',
          ],
          library: ['traditional/deity/zeus', 'traditional/herb/oak', 'traditional/deity/hera'],
        },
        {
          id: 'zeus-today',
          title: 'Zeus today, and a shrine of your own',
          summary: 'Hellenic polytheism, the philosophers’ Zeus, the household practice, and how to set up his shrine.',
          minutes: 6,
          sections: [
            {
              heading: 'Who honours him now',
              body: `Zeus is honoured today mainly by Hellenic polytheists, sometimes called Hellenismos, who try to reconstruct ancient Greek religion from the evidence. Groups like YSEE in Greece and Hellenion in the United States, and many solitary practitioners, give him the first libation at a meal or rite, keep a jar for Zeus Ktesios, honour Zeus Herkeios at the household shrine, and keep festivals such as the Diasia.

Eclectic Pagans also call on Zeus, often as a god of the sky and storms. In planetary magic Jupiter’s day, Thursday, is used for prosperity and success, and Zeus is sometimes called on there too; that is an astrological tradition, not Greek cult.`,
            },
            {
              heading: 'The philosophers’ Zeus',
              body: `Greek philosophers made Zeus the name for the reason that orders the whole world. The Stoic Cleanthes, in the third century BCE, wrote a Hymn to Zeus praising him as the many-named, all-ruling one whose law runs through everything, and asking him to free people from ignorance. The poet Aratus began his poem on the stars with “From Zeus let us begin”, and a line of it, “for we are also his offspring”, is quoted in the New Testament (Acts 17:28).

Some modern devotees, especially those drawn to philosophy, relate to Zeus in this way: as the order and reason of the world, as much as a king on a mountain. Both are genuinely Greek.`,
            },
            {
              heading: 'Setting up his shrine',
              body: `A Hellenic household shrine usually honours several gods, with Hestia at the hearth. Zeus can be given a place on it, ideally high, or a small shrine of his own. You need a cup for libations, a dish to pour into, a lamp or candle, an incense burner and a small bowl for khernips. For his image, use a statue, an eagle, an oak leaf or acorn, a thunderbolt, or a picture of Olympia. White and gold are modern colours for him; lapis lazuli is a modern stone.

Set your kadiskos, the jar for Zeus Ktesios, in your kitchen cupboard or pantry rather than on the shrine: that is where the household’s goods are. Keep a card on the shrine with any oath or promise you have made under his name.`,
            },
          ],
          knowAndDont: {
            known:
              'Modern Hellenic groups and their practices are documented. Cleanthes’ Hymn to Zeus survives complete; Aratus’s Phenomena opens “Ek Dios archomestha”, and Acts 17:28 quotes its fifth line.',
            unknown:
              'How ordinary Greeks related the philosophers’ Zeus to the gods they offered to is hard to know. Modern colours and stones for him are modern. The modern placing of the kadiskos varies from household to household.',
          },
          inPractice:
            'Set up his place on your shrine this week, and prepare a clean jar with a lid for the kadiskos. Read Cleanthes’ Hymn to Zeus aloud once, in any public-domain translation.',
          reflect: [
            'Do you come to Zeus as a king, as a host, or as the reason in things?',
            'Where in your home is “high”, and where are the stores kept?',
          ],
          further: [
            'Cleanthes, Hymn to Zeus (public-domain translations online; Johan C. Thom, Cleanthes’ Hymn to Zeus, 2005)',
            'Drew Campbell, Old Stones, New Temples (2000), on Hellenic reconstructionism',
          ],
          library: ['traditional/tool/altar', 'traditional/crystal/lapis_lazuli', 'traditional/candle/white', 'traditional/deity/athena'],
          premade: ['folk-khernips-libation', 'cosmic-thursday-jupiter-prosperity'],
        },
      ],
      practices: [
        {
          id: 'zeus-study-hymn',
          title: 'Read his hymns aloud',
          instructions:
            'Once in this stage, read the Homeric Hymn to Zeus (Hymn 23), Hesiod’s account of his birth (Theogony 453–506) and the two jars (Iliad 24.527–533) aloud, standing, by your lamp or under the sky.',
          times: 1,
          prompt: 'Which line stayed with you? Write it down and say why.',
        },
        {
          id: 'zeus-study-stranger',
          title: 'A kindness to a stranger',
          instructions:
            'Twice in this stage, do something real for someone you do not know: buy a meal for someone, give directions with care, welcome a new person at work or in a group, give to a refugee or homelessness charity. Do it in Zeus Xenios’s name, quietly.',
          times: 2,
          prompt: 'Who was the stranger, and what did I do? How did it feel?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine days of the open hand',
      intro:
        'Nine days of a short morning libation and a kept word, then a lesson on offerings and the hard parts of his myths. Zeus is a god of the sky, and his offerings are shared: the libation is his, and the rest of the cup and the meal is yours.',
      days: 12,
      lessons: [
        {
          id: 'zeus-offerings',
          title: 'Libations, the jar, and the hard parts',
          summary:
            'How to pour for Zeus, how to set up and keep a kadiskos, the order of libations at a meal, and how to face the stories of force and the god of kings.',
          minutes: 8,
          sections: [
            {
              heading: 'Pouring for Zeus',
              body: `The libation, sponde, was the most common Greek offering. Wine, usually mixed with water as Greeks drank it, was poured from a cup onto the ground or the altar with a prayer, and the rest was drunk. At a symposium, the drinking party after dinner, the first bowl of mixed wine was often dedicated to Zeus Olympios and the Olympians, the second to the heroes, and the third to Zeus Soter, Zeus the Saviour. To “pour the third for the Saviour” became a proverb for finishing well.

Zeus, as a sky god, is approached standing, with the hands raised and the palms up. Burnt offerings went up to him in smoke from a raised altar, and the worshippers shared the meat. In modern home practice that means: a libation of wine or water, a pinch of barley, a grain of incense, and then a meal or a cup you share with gratitude.`,
            },
            {
              heading: 'Setting up the kadiskos',
              body: `Many modern Hellenists keep a kadiskos for Zeus Ktesios, following the instructions in Athenaeus as best they can. A common version: take a clean jar with a lid, ideally with two handles. Tie a white woollen thread around the handles and a yellow thread from its right side. Put in clean water and a little olive oil, and a mixture of seeds, grains, dried beans and fruit from your own stores. Close it and keep it in the pantry or kitchen cupboard.

From then on, add a little of what comes into the house from time to time, with a word to Zeus Ktesios, and refresh the jar once a year, emptying the old contents onto earth or compost. Recipes differ, and no one knows exactly how the ancient jar was kept. What matters is the meaning: thanks for having enough, and care for the household’s stores.`,
            },
            {
              heading: 'The stories of force',
              body: `Many of the best-known myths of Zeus are stories of rape and deception. He comes to Europa as a bull and carries her off to Crete; to Leda as a swan; to Danae as golden rain; he seizes the boy Ganymede; he pursues Io, and Hera torments her. These stories were told across Greek literature and art and retold by Ovid. They are part of the record, and it does no one any good to pretend otherwise.

Hellenic polytheists handle them in different ways. Some read them as myths about the founding of noble families, who all wanted Zeus as an ancestor. Some read them as the sky’s power over the earth. Some set them aside as poetry rather than theology, as several ancient philosophers did; Plato wanted such stories kept from the young. Whatever you decide, you do not have to admire or excuse them, and honouring Zeus Xenios and Horkios does not require it.`,
            },
            {
              heading: 'The god of kings',
              body: `Zeus was the god of kingship, and he punished defiance hard: Prometheus chained to a rock for giving fire to humanity, the Titans locked in Tartarus. Kings and tyrants claimed his favour. Some people come to him longing for a strong ruler who will put everything right, in their life or in the world.

The best of the Greek tradition points another way. Hesiod’s Zeus rules by sharing honours fairly and keeping his word; Homer’s Zeus is grieved by death and cannot override fate; Zeus Xenios is on the side of the stranger and the beggar, not the powerful host. Be wary of anyone who uses him to glorify domination. The god of the guest stands with the one at the door.`,
            },
          ],
          knowAndDont: {
            known:
              'The order of libations at the symposium, with the third bowl to Zeus Soter, is attested in Greek literature and its scholia. Athenaeus 11.473b–c gives the kadiskos. The myths of Europa, Leda, Danae, Ganymede and Io are told in Hesiod’s fragments, the tragedians, Apollodorus and Ovid. Plato criticises such stories in the Republic, books 2 and 3.',
            unknown:
              'Exactly how the kadiskos was kept and refreshed is unknown; modern versions are reconstructions. How ordinary Greeks squared the myths with their worship of a just Zeus is a matter of interpretation.',
          },
          inPractice:
            'Set up your kadiskos this week, using whatever you have. Each day of the nine, pour a libation before you drink your first cup of the day. Decide what you will do with the myths: keep them, set them aside, or hold them at arm’s length.',
          reflect: [
            'What does it mean to you to have “enough” in the house? Who does not?',
            'How do you hold a god whose stories you cannot admire, beside a god who protects the stranger?',
          ],
          further: [
            'Plato, Republic books 2–3 (free on Project Gutenberg)',
            'Robert Parker, On Greek Religion (2011)',
          ],
          library: ['traditional/deity/zeus', 'traditional/vessel/offering_bowl', 'traditional/tool/chalice'],
          premade: ['folk-khernips-libation', 'kitchen-family-meal-blessing'],
        },
      ],
      practices: [
        {
          id: 'zeus-nine-days',
          title: 'Nine mornings of the libation',
          instructions:
            'For nine days, before your first drink of the day, do this. Wash your hands. Light the lamp and say a word to Hestia. Then stand, raise your hands, and greet Zeus by one of your titles. Pour a little from your cup, water, tea, wine at evening, into his dish, and say one promise you will keep today, however small, and one thing you will do for someone outside your household. Drink the rest of your cup. In the evening, before bed, say aloud whether you kept the promise. Pour the dish onto earth each morning.',
          times: 9,
          every: 'day',
          prompt: 'What did I promise today, and did I keep it? Who did I treat as a guest?',
          premade: 'folk-khernips-libation',
        },
        {
          id: 'zeus-practice-meal',
          title: 'A meal for a guest',
          instructions:
            'Once in this stage, host someone: a friend, a neighbour you hardly know, a new colleague, or someone a local charity connects you with. Cook or buy a meal, give them the best seat, and before eating, pour a little wine or water for Zeus Xenios. If you cannot host, take a meal to someone, or give a meal through a food bank.',
          times: 1,
          prompt: 'Who did I host, and what did I learn about them? What did it cost, and what did it give?',
          premade: 'kitchen-family-meal-blessing',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Weighed in the scales',
      intro: `In the Iliad, Zeus weighs the fates in golden scales. Take a few days to weigh this month honestly. A dedication is a promise, and Zeus is the god of promises; it is only worth making if you mean it.

Stopping here is a good outcome. So is pausing, or realising that another god, another path, or no dedication at all is right for you. Zeus shared out the honours among many gods; you are not short-changing him by honouring someone else.`,
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'zeus-discern-question',
          title: 'Read your Dodona question',
          instructions:
            'Take out the question you wrote for Zeus during the study stage. Read it aloud under the sky. Then write what the month has shown you about it, and answer the questions below.',
          times: 1,
          prompt: 'What answer, if any, did the month give to my question?',
        },
      ],
      questions: [
        'Have I kept the nine mornings and my promises because I wanted to, or because I felt I had to?',
        'Am I drawn to Zeus himself, or mainly to the idea of a powerful king of the gods? Is that enough for me?',
        'Can I keep a libation practice, the kadiskos and regular hospitality, in my life as it is now, for a year?',
        'Am I at peace with how I hold the myths of force and the god of kings?',
        'Do I understand which parts of what I believe about him are ancient and which are modern?',
        'Would I be relieved or disappointed if I decided to wait? What does that tell me?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication with an open door',
      intro: `If you have chosen to go on, make your dedication on a clear day under the sky, ideally at a Noumenia, the first crescent of the month, or on a day when you have someone to host. This is a self-dedication, a promise you make on your own behalf. It is not an initiation, and it does not make you a priest of Zeus or a member of any group.

Ancient Greeks rarely dedicated themselves to one god alone. Your promise can sit beside honouring Hestia, Hera, Athena and others.`,
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Zeus',
        summary:
          'Purification, Hestia first, Zeus called by his titles under the open sky, a promise sworn before Zeus Horkios, a libation and barley, an offering to the kadiskos, and a shared meal with the door open.',
        minutes: 60,
        ingredients: [
          { name: 'A bowl of fresh water and a match or bay sprig for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A lamp, tealight or electric candle' },
          { name: 'A cup of wine mixed with water, or grape juice', ref: 'traditional/tool/chalice' },
          { name: 'A dish to pour into', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A handful of barley grains' },
          { name: 'A honey cake or a piece of good bread' },
          { name: 'A little frankincense on a heatproof burner', ref: 'traditional/herb/frankincense' },
          { name: 'An oak leaf or acorn', ref: 'traditional/herb/oak', optional: true },
          { name: 'Your kadiskos and a little of something new for it' },
          { name: 'Your written promise on a card' },
        ],
        preparation:
          'During the day, clean your shrine and your kitchen. Write your promise in your own words: simple, true and doable, for example to pour him a libation each day or week, to keep the kadiskos, to keep my word, and to treat strangers as sent by Zeus. Keep it small enough to keep: you will say it before Zeus Horkios. If you can, invite someone to share a meal afterwards. Wash and dress in clean clothes.',
        steps: [
          {
            title: 'Purify',
            instructions:
              'Make khernips by quenching the flame in the water. Wash your hands and touch your face, and sprinkle a few drops over the cup and the barley.',
            spoken: 'With clean hands I come before Zeus.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the lamp. Pour a drop of the libation for Hestia.',
            spoken: 'Hestia, first and last, I begin with you.',
            light: true,
          },
          {
            title: 'Call Zeus',
            instructions:
              'Go to the open sky or an open window. Stand with your hands raised, palms up. Add incense and scatter a few grains of barley. Speak his titles slowly.',
            spoken:
              'Zeus, chiefest of the gods and greatest, all-seeing, lord of all, father of gods and men; Xenios, friend of the stranger; Horkios, witness of oaths; Ktesios, keeper of the house’s goods: hear me. This month I have poured for you, kept my word as best I could and opened my door. Now I come to make a promise.',
            minutes: 2,
          },
          {
            title: 'Make your promise',
            instructions:
              'Read your promise aloud. Then pour most of the libation into the dish, and set the cake or bread beside it.',
            spoken: 'This is my promise, made freely, before Zeus Horkios. As I have spoken, so I will do.',
          },
          {
            title: 'The jar',
            instructions:
              'Bring your kadiskos to the shrine. Open it, add a little of something new from your stores, a few seeds, a spoon of oil, a pinch of grain, and close it.',
            spoken: 'Zeus Ktesios, guard what this house has, and let it always be enough to share.',
          },
          {
            title: 'Stand under the sky',
            instructions: 'Stand quietly under the sky for a while. Watch the clouds and the light.',
            minutes: 6,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Pour the last drop for Hestia. Thank them both and put out the lamp. Return the kadiskos to the pantry.',
            spoken: 'Hestia, last as you were first. Zeus, it is done.',
            snuff: true,
          },
        ],
        closing:
          'Share a meal, ideally with a guest, and drink the rest of the wine with them. Leave the god’s dish until evening, then pour it onto earth and put the cake in the compost. Keep your written promise on the shrine and read it at each Noumenia. Write in your journal what you promised and how it felt to say it before the god of oaths.',
        safety:
          'Never leave a flame unattended, and keep it out of the wind. If there is a thunderstorm, hold the rite indoors. Frankincense smoke can trouble people with asthma and small pets. Grapes, raisins and wine are toxic to dogs and cats. Use judgement about whom you invite into your home.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping faith under the sky',
      intro: `Your relationship with Zeus now lives in small daily acts: the first pour of the cup, a promise kept, a stranger treated well, a jar in the pantry. Greet the new month at each Noumenia with the household gods, and give him the first libation at any rite.

Once a year, on the anniversary of your dedication, read your promise again and renew it, change it, or set it down with thanks. If you break a promise, say so plainly at the shrine and make it right. That is what Zeus Horkios asks: not perfection, but good faith.`,
      days: 30,
      lessons: [],
      practices: [
        {
          id: 'zeus-ongoing-libation',
          title: 'Weekly libation',
          instructions:
            'At least once a week, pour a libation to Zeus by one of his titles before a meal or a drink, and name one promise you kept and one stranger you treated well.',
          times: 52,
          every: 'week',
          prompt: 'What promise did I keep this week? Who did I welcome?',
          premade: 'folk-khernips-libation',
        },
        {
          id: 'zeus-ongoing-noumenia',
          title: 'Greet the new month',
          instructions:
            'At each Noumenia, the first crescent, give incense and a libation to the household gods, including Zeus Ktesios and Herkeios, and add a little of something new to the kadiskos.',
          times: 12,
          every: 'month',
          premade: 'folk-noumenia-blessing',
        },
        {
          id: 'zeus-ongoing-rededicate',
          title: 'Yearly rededication',
          instructions:
            'On the anniversary of your dedication, refresh the kadiskos (empty the old contents onto earth and refill it), and repeat the dedication rite with your promise rewritten for the coming year.',
          times: 1,
          every: 'month',
          prompt: 'What has a year with Zeus taught me about keeping my word? What will I promise now?',
        },
      ],
    },
  ],
  sources: [
    'Hesiod, Theogony 453–506 and 881–885, trans. H. G. Evelyn-White, Hesiod, the Homeric Hymns and Homerica (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (paraphrased)',
    'Homeric Hymn 23, To the Son of Kronos, Most High, trans. H. G. Evelyn-White (1914), Project Gutenberg #348 (the dedication prayer echoes “chiefest among the gods and greatest, all-seeing, the lord of all”)',
    'Homer, Iliad 16.233–235 and 24.527–533; Odyssey 6.207–208 and 9.270–271, trans. Samuel Butler, Project Gutenberg (paraphrased; “all strangers and beggars are from Zeus” after Butler)',
    'Pausanias, Description of Greece 5.11, 5.24.9–10 and 8.38.7, trans. W. H. S. Jones (1918)',
    'Athenaeus, Deipnosophists 11.473b–c, on the kadiskos of Zeus Ktesios (paraphrased)',
    'Thucydides 1.126.6, on the Diasia (paraphrased)',
    'Plato, Republic 565d and books 2–3 (paraphrased)',
    'Cleanthes, Hymn to Zeus; Aratus, Phaenomena 1–5; Acts 17:28',
    'The Palaikastro Hymn to the Greatest Kouros (paraphrased)',
    'Walter Burkert, Greek Religion (1985); Jon D. Mikalson, Ancient Greek Religion (2010); Robert Parker, On Greek Religion (2011)',
    'A. B. Cook, Zeus: A Study in Ancient Religion (Cambridge, 1914–40)',
    'Esther Eidinow, Oracles, Curses, and Risk among the Ancient Greeks (Oxford, 2007)',
  ],
};
