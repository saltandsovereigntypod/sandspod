import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-poseidon',
  kind: 'deity',
  paths: ['hellenic', 'roman'],
  deityRef: 'traditional/deity/poseidon',
  title: 'Poseidon: Earth-Shaker, Saviour of Ships',
  summary:
    'A lunar month with Poseidon, lord of the sea, the earthquake and the horse: his Mycenaean roots at Pylos, his wrath in the Odyssey, Sounion, Isthmia and the eighth of the month, and a practice of libations, respect for water and care for the sea.',
  welcome: `This is a month of study and devotion with Poseidon, the Greek god of the sea, of earthquakes and of horses. He is one of the oldest and most powerful of the Greek gods, and one of the most feared. People come to him for safe passage over water, for steady ground, for the strength of horses, and out of awe at the sea itself.

It is a self-dedication, not an initiation. Poseidon had priests at his sanctuaries, and some modern Hellenic groups have their own; nothing here makes you one. What it offers is a month of learning who he actually was in Greek religion, keeping his customs carefully, and deciding at the end whether to go on.

You will need a bowl of fresh water, a little salt, a small lamp or candle, a cup for libations, and respect for the water near you. You do not need to live by the sea. The water in your tap and the ground under your feet are his too.`,
  about: `Poseidon was the Greek god of the sea, of earthquakes and of horses, called Ennosigaios, the Earth-Shaker, and Gaieochos, Holder of the Earth. He is one of the oldest Greek gods we can name: on the clay tablets of Mycenaean Pylos, around 1200 BCE, he receives more offerings than any other god. In Homer he is the brother of Zeus and Hades, who drew the sea as his share of the world, and the great enemy of Odysseus, whose son the Cyclops he was. His sanctuaries stood on headlands and isthmuses: the white temple at Cape Sounion, the Isthmus of Corinth where the Isthmian Games were held in his honour, and many harbours. He made the first horse, and was honoured as Hippios with horse races and chariots. His anger was felt in storms and earthquakes, and in 373 BCE the whole city of Helike was swallowed by an earthquake and wave that Greeks put down to his wrath. Athenians gave him the eighth day of every month and a winter month, Poseideon. The Romans matched him with Neptune. Today Hellenic polytheists pour him libations on the eighth, ask him for safe voyages and steady ground, and honour him by caring for the sea.`,
  notes: [
    'Never throw offerings into the sea, rivers or lakes, where they become litter and harm wildlife. Ancient Greeks did; modern devotees pour libations onto the shore or into a dish, and give the sea their care instead.',
    'Respect water. Do not perform any part of this journey alone on rocks, cliffs, piers or tidelines, in rough weather, or in the water. Learn the basics of tides, currents and cold-water shock for any coast you visit.',
    'Several myths of Poseidon are stories of rape: Demeter, Medusa, Caenis and others. Hellenic polytheists read them in different ways, and devotion to him does not require excusing them.',
    'Ancient worship of Poseidon included the sacrifice of bulls and, in some places, horses drowned in his honour. Nothing here revives any of it. Libations, barley, incense and care for the sea are fully fitting.',
    'If you live where earthquakes happen, know your local safety advice. Poseidon Asphaleios, the securer, was asked for steady ground; that never replaces preparation.',
  ],
  holyDays: ['neptunalia'],
  stages: [
    {
      kind: 'threshold',
      title: 'Salt and fresh water',
      intro:
        'Poseidon rules both the salt sea and the springs; he was said to have struck a salt spring from the rock of the Athenian Acropolis. So the journey begins with two bowls, one of fresh water and one with salt, a lamp and a libation. You are only introducing yourself. Nothing is promised yet.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'poseidon-threshold-ground',
          title: 'Feel the ground and the water',
          instructions:
            'On each of the two days, stand still for a few minutes with your feet flat on the ground, outdoors if you can, and feel how steady it is. Then find the nearest water: a river, the sea, a canal, a pond, even rain. Look at it for a few minutes. Poseidon was the holder of the earth and the lord of the waters. Notice both, and how much you take them for granted.',
          times: 2,
          every: 'day',
          prompt: 'How did the ground feel? What was the water doing?',
        },
      ],
      rite: {
        title: 'An introduction at the water’s edge',
        summary:
          'A short Greek-style introduction: purify your hands, begin with Hestia, then greet Poseidon by his old titles over a bowl of salt water and pour a libation for him.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of fresh water for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A match, or a sprig of bay to quench in it', ref: 'traditional/herb/bay' },
          { name: 'A second bowl of water with a pinch of salt stirred in' },
          { name: 'A tealight, oil lamp or electric candle' },
          { name: 'A cup of wine mixed with water, or plain water', ref: 'traditional/tool/chalice' },
          { name: 'A dish to pour into, or a patch of earth outside', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A pinch of barley', optional: true },
          { name: 'A pine sprig or a shell gathered where it is allowed', ref: 'traditional/herb/pine', optional: true },
        ],
        preparation:
          'If you live near the sea or a river, you may hold this on the shore at a safe distance from the water, with someone nearby. Otherwise, hold it by a window, ideally facing the nearest water. Set the two bowls, the lamp, the cup and the dish in front of you. Wash your face and hands in ordinary water first.',
        steps: [
          {
            title: 'Make khernips',
            instructions:
              'Light the match or the tip of the bay sprig and plunge it into the bowl of fresh water. This is khernips, the purified water of Greek ritual. Wash your hands in it and touch a few drops to your face.',
            spoken: 'With clean hands I come to the lord of the waters.',
          },
          {
            title: 'Begin with Hestia',
            instructions:
              'Light the lamp. In Greek custom every rite begins with Hestia, goddess of the hearth. Pour a drop of your libation into the dish for her.',
            spoken: 'Hestia, first and last, keeper of this house: I begin with you.',
            light: true,
          },
          {
            title: 'Call Poseidon',
            instructions:
              'Set your hands on either side of the bowl of salt water. Then raise them, palms up, toward the sea or the nearest water. If you have barley, scatter a few grains. Speak slowly. You are introducing yourself, not asking for anything.',
            spoken:
              'Poseidon, great god, mover of the earth and of the sea, Gaieochos who holds the earth, dark-haired lord, tamer of horses and saviour of ships: I am [your name]. I have heard of you in Homer and in the stories of the sea. I come to learn who you are. Be kindly to me as I learn.',
            minutes: 2,
          },
          {
            title: 'Pour for him',
            instructions:
              'Pour most of the libation into the dish or onto the earth. Then sit quietly for a few minutes and listen: to the water if you are near it, to the wind, to your own breathing like waves.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Pour the last drop for Hestia. Thank them both and put out the lamp.',
            spoken: 'Hestia, last as you were first, thank you. Poseidon, thank you for the sea and the steady ground.',
            snuff: true,
          },
        ],
        closing:
          'Pour the libation dish onto earth, not into water. Pour the salt water down the sink, not onto plants, which salt harms. Pour the khernips away outside with thanks. Write a few lines about how it felt to greet the sea.',
        safety:
          'If you are on a shore, stay well back from the water’s edge, check the tide, and do not go alone. Never leave a flame unattended. Salt water harms plants and soil; pour it away indoors. Grapes, raisins and wine are toxic to dogs and cats.',
      },
    },
    {
      kind: 'study',
      title: 'The lord of the deep',
      intro:
        'Ten days of reading, one lesson every two or three days. You will meet Poseidon at Pylos and in Homer, then learn his powers over sea, earthquake and horse, then visit his sanctuaries, then see how he is honoured today. Read the short Homeric Hymn to Poseidon aloud once during this stage.',
      days: 10,
      lessons: [
        {
          id: 'poseidon-who',
          title: 'Who Poseidon is',
          summary: 'The great god of Mycenaean Pylos, the brother who drew the sea, and the Poseidon of Homer.',
          minutes: 7,
          sections: [
            {
              heading: 'The god of Pylos',
              body: `Poseidon is one of the oldest Greek gods. On the clay tablets in the Linear B script from the palace of Pylos, written around 1200 BCE, the name po-se-da-o appears more often than any other god’s, receiving grain, wine, oil, cattle and even gold. There was a sanctuary called the Posidaion, and a goddess, po-si-da-e-ja, who seems to be his female counterpart. At Pylos, at least, he may have been the greatest god of all.

His name is old and hard to read. One common theory makes it “husband” or “lord” (posis) of Da, perhaps the earth; others disagree. Either way, this was a god of the land and its foundations as well as of the sea, and a very powerful one, long before Homer.`,
            },
            {
              heading: 'The share of the sea',
              body: `In Hesiod he is a son of Kronos and Rhea, swallowed and freed with his brothers and sisters. In the Iliad he explains how the world was divided: the three brothers drew lots, and Zeus won the sky, Hades the misty darkness below, and Poseidon the grey sea to dwell in for ever, while the earth and Olympus were left common to all (15.187–193). He insists he is Zeus’s equal in honour, though he yields to him in the end.

Homer describes him crossing the sea from his palace beneath the waves at Aigai: he harnesses his bronze-hoofed horses with golden manes, drives over the waves, and the sea creatures come up from the deep to play around him, knowing their lord, and the sea parts for joy (13.17–31).`,
            },
            {
              heading: 'The enemy of Odysseus',
              body: `The Odyssey is, among other things, the story of Poseidon’s anger. Odysseus blinds the Cyclops Polyphemus, Poseidon’s son, and Polyphemus prays to his father to stop Odysseus reaching home, or, if he must, to let him come late, alone, in a stranger’s ship, to find trouble in his house (9.528–535). Every storm and shipwreck that follows is Poseidon’s doing.

The prophet Tiresias tells Odysseus how to end it. After he has set his house in order, he must take an oar on his shoulder and walk inland until he meets people who know nothing of the sea, who mistake the oar for a winnowing fan. There he must plant the oar in the ground and sacrifice to Poseidon, and then go home and honour all the gods (11.119–134). It is a strange, beautiful image: making peace with the sea by carrying it to the people who have never seen it.`,
            },
            {
              heading: 'His signs',
              body: `His signs are the trident, the three-pronged fishing spear, and the horse, the bull and the dolphin. His tree is the pine, whose crown was given at the Isthmian Games. He was shown as a powerful bearded man, like Zeus but often with wilder, darker hair, Homer’s kyanochaites, “dark-haired”. His wife is the sea goddess Amphitrite, and his son Triton, half man and half fish, blows a conch shell. His colours, in modern practice, are blue, sea green and white.`,
            },
          ],
          knowAndDont: {
            known:
              'Poseidon’s prominence in the Pylos tablets is well established. Iliad 15.187–193 gives the division of the world, and 13.17–31 his journey over the sea. Odyssey 9.528–535 and 11.119–134 give Polyphemus’s curse and Tiresias’s instructions.',
            unknown:
              'The meaning of his name is debated. Why he was so important at Pylos, and whether the Mycenaean Poseidon was more a god of earth than of sea, is uncertain. What happened to Odysseus after the oar is not told in the Odyssey.',
          },
          inPractice:
            'Hellenic polytheists often begin a rite with a short hymn. Learn the Homeric Hymn to Poseidon (Hymn 22); it is only a few lines. Choose two of his titles to use this month: Asphaleios, the securer, and Soter, the saviour, are a good pair for someone beginning.',
          reflect: [
            'Which Poseidon did you arrive knowing: the sea king, the earthquake, the angry father of the Cyclops?',
            'Tiresias tells Odysseus to carry the oar until no one knows what it is. What part of your life would you carry so far that it meant nothing, to make peace with it?',
          ],
          further: [
            'Homeric Hymn 22, To Poseidon, trans. H. G. Evelyn-White (1914), free on Project Gutenberg',
            'Homer, Odyssey 9 and 11, trans. Samuel Butler, free on Project Gutenberg',
            'Walter Burkert, Greek Religion (1985), section on Poseidon',
          ],
          library: ['traditional/deity/poseidon', 'traditional/deity/zeus', 'traditional/deity/hades', 'traditional/herb/pine'],
        },
        {
          id: 'poseidon-powers',
          title: 'Sea, earthquake and horse',
          summary: 'The three powers of Poseidon: Pontios of the sea, the Earth-Shaker and Asphaleios, and Hippios of the horses.',
          minutes: 7,
          sections: [
            {
              heading: 'The sea',
              body: `As Pontios and Pelagios, of the sea and the open water, Poseidon was the god every Greek sailor and fisher depended on. Greece is a land of islands and coasts, and most long journeys went by ship. Sailors prayed to him before sailing and poured libations, and survivors of shipwrecks thanked him.

Herodotus tells how, in 480 BCE, a great storm wrecked part of the Persian fleet off the coast of Magnesia, and the Greeks prayed and poured libations to Poseidon Soter, Poseidon the Saviour, and from then on called him by that name (7.192). The Homeric Hymn sums up his double nature: the gods gave him a twofold honour, to be a tamer of horses and a saviour of ships.`,
            },
            {
              heading: 'The Earth-Shaker',
              body: `Poseidon was also the god of earthquakes, which Greece knows well. His oldest titles, Ennosigaios and Enosichthon, mean “earth-shaker”, and Gaieochos means “earth-holder”. The same god who could shake the ground could hold it steady: as Asphaleios, “the securer”, he was asked to keep buildings and cities safe.

Xenophon tells that when an earthquake struck a Spartan army on campaign, the soldiers began to sing the paean to Poseidon (Hellenica 4.7.4). And in 373 BCE an earthquake and a great wave destroyed the city of Helike on the Gulf of Corinth overnight; its ruins lay under the water for centuries. Ancient writers blamed Poseidon’s anger at the people of Helike for violating suppliants at his altar (Pausanias 7.24.6, 7.25.1).`,
            },
            {
              heading: 'The horse',
              body: `Poseidon Hippios was the god of horses. In one Athenian story he made the first horse by striking a rock; in Arcadia it was told that he fathered the horse Arion on Demeter. Horse races and chariot races were held in his honour, and horses were dedicated to him.

The Homeric Hymn to Apollo describes a strange custom at his sanctuary at Onchestos in Boeotia: a young colt drawing an empty chariot was let go into the sacred grove, and if the chariot crashed among the trees, it was left there for the god (229–238). The scholar Walter Burkert suggested that the horse and the sea belong together in his worship because both are wild power that people learned, carefully, to ride.`,
            },
            {
              heading: 'Fresh water',
              body: `Although he is the god of the salt sea, Poseidon is also linked with springs. In Athens he contested Athena for the patronage of the city and struck a salt spring from the rock of the Acropolis, which visitors still saw centuries later; Herodotus mentions the “sea” in the Erechtheion (8.55). At Argos, the myth said, he dried up the rivers in anger after losing the land to Hera, and then, for love of Amymone, revealed the spring of Lerna. In a dry country, a god who gave and withheld water was a god to treat with care.`,
            },
          ],
          knowAndDont: {
            known:
              'The titles Ennosigaios, Gaieochos, Asphaleios, Soter, Pontios and Hippios are well attested. Herodotus 7.192 and 8.55, Xenophon Hellenica 4.7.4, the Homeric Hymn to Apollo 229–238 and Pausanias on Helike are the sources cited here. Helike’s destruction in 373 BCE is attested by several ancient writers, and its site has been found.',
            unknown:
              'What the Onchestos colt rite meant is unclear, and the passage is hard to interpret. Whether Greeks thought every earthquake was Poseidon acting, or spoke of him more loosely, is debated.',
          },
          inPractice:
            'Find out the earthquake and flood risks where you live, and the safety advice. Learn the tide times and dangers of the nearest coast or river. That is the most practical respect you can pay the Earth-Shaker.',
          reflect: [
            'Which of his three powers, sea, earthquake or horse, do you feel closest to, and why?',
            'Where in your life have you learned to ride something wild?',
          ],
          further: [
            'Herodotus, Histories 7.192 and 8.55 (public-domain translations on Project Gutenberg)',
            'Homeric Hymn to Apollo 229–238, trans. H. G. Evelyn-White (1914)',
          ],
          library: ['traditional/deity/poseidon', 'traditional/deity/athena', 'traditional/deity/demeter', 'traditional/crystal/aquamarine'],
          premade: ['sea-safe-passage-blessing'],
        },
        {
          id: 'poseidon-places',
          title: 'Sounion, Isthmia and the eighth of the month',
          summary: 'His sanctuaries on headlands and isthmuses, the Isthmian Games, and his days in the Athenian calendar.',
          minutes: 7,
          sections: [
            {
              heading: 'Sounion',
              body: `At the southern tip of Attica, on a cliff above the Aegean, stands the temple of Poseidon at Sounion, built around 440 BCE. Its white marble columns are still a landmark for ships. In the Odyssey, Sounion is “the sacred cape of Athens”, where Menelaus’s helmsman died at the steering oar (3.278–285). Herodotus mentions a four-yearly festival at Sounion to which Athenians sailed (6.87).

Sanctuaries like this, on headlands and promontories, were places where sailors could see the god’s house as they passed, and pray to him as they rounded dangerous capes.`,
            },
            {
              heading: 'Isthmia',
              body: `On the Isthmus of Corinth, the narrow neck of land between two seas, stood one of Poseidon’s greatest sanctuaries. The Isthmian Games, one of the four great Panhellenic festivals with the Olympic, Pythian and Nemean, were held there every two years in his honour. The victors’ crown was of pine, and at some periods of wild celery.

The Isthmus was also a place of truce and gathering. A sanctuary at Kalaureia, the island now called Poros, was the centre of an old league of cities that met in his honour. Wherever Greeks met by sea, Poseidon was often their host.`,
            },
            {
              heading: 'The Athenian calendar',
              body: `In Athens, the eighth day of every lunar month belonged to Poseidon, shared with the hero Theseus, who was said to be his son. This is one of the oldest and simplest rhythms for honouring him today: a libation on the eighth day after the new crescent.

The winter month of Poseideon, around December and January, was named after him. Little is known of its festivals for him in Athens, but the name shows his place in the year: the stormy season, when ships stayed in harbour and the sea was his.`,
            },
            {
              heading: 'The salt spring and the olive',
              body: `The Athenians told how Poseidon and Athena competed to be patron of their city. Poseidon struck the rock of the Acropolis with his trident and a salt spring welled up; Athena planted the first olive tree. The Athenians chose Athena. But they did not forget Poseidon: in the Erechtheion on the Acropolis he was worshipped as Poseidon Erechtheus, and the marks of his trident were shown in the rock.

It is a story of a god who lost and was still honoured, side by side with the winner. Many modern devotees find something useful in it.`,
            },
          ],
          knowAndDont: {
            known:
              'The temple at Sounion and its date are well established, as is the Isthmian sanctuary and its games. The eighth day as Poseidon’s in Athens is attested (Mikalson). Herodotus 8.55 and Pausanias describe the salt spring and the trident marks on the Acropolis.',
            unknown:
              'How the eighth day was kept in ordinary Athenian households is not recorded. The festivals of the month Poseideon in Athens are poorly known. The crown at Isthmia changed between pine and celery over time, and the sources disagree about when.',
          },
          inPractice:
            'Work out the eighth day of the coming lunar month, counting from the first crescent, and mark it in your calendar. If you can visit a headland or a harbour this month, do, and pour a little water or wine on the ground there for him.',
          reflect: [
            'Poseidon lost Athens and was still honoured there. What have you lost and still honour?',
            'Where is the nearest place to you where people meet by water?',
          ],
          further: [
            'Pausanias, Description of Greece 1.26.5 and 2.1–2, trans. W. H. S. Jones (1918)',
            'Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year (1975)',
          ],
          library: ['traditional/deity/poseidon', 'traditional/deity/athena', 'traditional/herb/pine'],
        },
        {
          id: 'poseidon-today',
          title: 'Poseidon today, and a shrine of your own',
          summary: 'Hellenic polytheism, the sea as an offering, Neptune and Poseidon, and how to set up his shrine.',
          minutes: 6,
          sections: [
            {
              heading: 'Who honours him now',
              body: `Poseidon is honoured today mainly by Hellenic polytheists, sometimes called Hellenismos, who try to reconstruct ancient Greek religion from the evidence. They pour him libations on the eighth of each lunar month, ask him for safe journeys and steady ground, and honour him in Poseideon. Groups like YSEE in Greece and Hellenion in the United States, and many solitary practitioners, keep these customs. Sailors, fishers, surfers and swimmers are often among his devotees.

Many modern devotees also make the care of the sea part of their worship: beach clean-ups, support for sea rescue services such as the RNLI, reducing plastic, campaigning for clean rivers. None of that is ancient, but it follows naturally from honouring the lord of the waters.`,
            },
            {
              heading: 'Poseidon and Neptune',
              body: `The Romans matched Poseidon with their own Neptune, an old Italian god of water whose festival, the Neptunalia, fell in the July drought, with shelters of leafy branches. If you are drawn to the Roman forms, the app has a separate journey for Neptune. Many people honour both, keeping the eighth of the month for Poseidon and the Neptunalia for Neptune, and that is why the Neptunalia appears in this journey’s calendar.`,
            },
            {
              heading: 'Setting up his shrine',
              body: `A Hellenic household shrine usually honours several gods, with Hestia at the hearth. Poseidon can be given a place facing the sea or the nearest water, or a small shrine of his own. You need a lamp or candle, a cup for libations, a dish, a bowl for khernips, and a bowl of salt water, refreshed each week. For his image, use a statue, a trident, a horse or dolphin, a picture of Sounion, or shells and sea-glass gathered where taking them is allowed. Blue and sea green are modern colours for him; aquamarine, larimar and chrysocolla are modern stones.

Keep a card on the shrine for vows made before journeys over water, and mark them paid when you come home.`,
            },
          ],
          knowAndDont: {
            known:
              'Modern Hellenic groups and their monthly observances are documented. The Roman Neptunalia is in the calendars and described by Festus and Horace.',
            unknown:
              'Ancient household cult of Poseidon is poorly documented; he was honoured mostly at public sanctuaries and by sailors. His modern colours and stones are modern.',
          },
          inPractice:
            'Set up his place on your shrine this week, with a bowl of salt water. Find a beach or river clean-up, or a sea rescue charity, to support during the practice stage.',
          reflect: [
            'What would it mean to treat the sea itself as an offering you care for, rather than a place you throw things?',
            'Do you feel drawn to Poseidon, Neptune, or both?',
          ],
          further: [
            'Drew Campbell, Old Stones, New Temples (2000), on Hellenic reconstructionism',
            'Robert Parker, On Greek Religion (2011)',
          ],
          library: ['traditional/tool/altar', 'traditional/deity/neptune', 'traditional/crystal/larimar', 'traditional/crystal/chrysocolla', 'traditional/candle/blue'],
          premade: ['folk-khernips-libation', 'sea-safe-passage-blessing'],
        },
      ],
      practices: [
        {
          id: 'poseidon-study-hymn',
          title: 'Read his hymns aloud',
          instructions:
            'Once in this stage, read the Homeric Hymn to Poseidon (Hymn 22) and Homer’s picture of him crossing the sea (Iliad 13.17–31) aloud, standing, facing the nearest water.',
          times: 1,
          prompt: 'Which line stayed with you? Write it down and say why.',
        },
        {
          id: 'poseidon-study-safety',
          title: 'Learn the water',
          instructions:
            'Once in this stage, learn the water safety basics for the coast, river or lake you are most likely to visit: tide times, rip currents, cold-water shock, and the emergency number for the coastguard. Write them on a card for his shrine.',
          times: 1,
          prompt: 'What did I not know about the water near me?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine days of the sea and the steady ground',
      intro:
        'Nine days of a short libation and one act of care for water, then a lesson on offerings and the hard parts of his myths and worship. Poseidon is a god of awe; the practice is to pay him attention and respect, daily, without fear.',
      days: 12,
      lessons: [
        {
          id: 'poseidon-offerings',
          title: 'Offerings, wrath, and the hard parts',
          summary:
            'What to give Poseidon and how, why nothing goes into the water now, the myths of force, and a god feared as well as loved.',
          minutes: 8,
          sections: [
            {
              heading: 'What he received',
              body: `Poseidon received bulls above all: in the Odyssey, Nestor’s people at Pylos sacrifice black bulls to him on the shore, eighty-one of them (3.5–8). He also received rams and boars, as Tiresias tells Odysseus. Sailors poured libations of wine into the sea, and threw in other offerings. At Argos, Pausanias says, bridled horses were once thrown into a spring for him (8.7.2).

Modern home practice keeps none of the blood and none of the throwing. Libations of wine mixed with water, or of fresh water; barley; incense; a pine sprig; and, above all, the care of water itself. Poseidon is an Olympian, and his offerings are shared like the Olympians’: the libation is his, and the rest of the cup is yours.`,
            },
            {
              heading: 'Nothing into the water',
              body: `It can feel natural to give a sea god something by throwing it into the sea. Please do not. Flowers, food, coins, candles and ribbons all become litter, and some harm birds, fish and seals. The sea now holds enough of what people have thrown into it.

Pour libations onto the sand above the tideline, onto earth, or into a dish you empty later. If you want to give something to the sea itself, take something out: an hour picking up plastic from a beach or riverbank is an offering ancient Greeks could not have imagined, and one a god of the sea is likely to understand.`,
            },
            {
              heading: 'The stories of force',
              body: `Several myths of Poseidon are stories of rape. In Arcadia it was told that Demeter, grieving, took the shape of a mare to escape him, and he took the shape of a stallion and forced her; she was then honoured there as Demeter Erinys, the Fury (Pausanias 8.25.5). Hesiod says he lay with Medusa in a meadow; Ovid makes it a violation in Athena’s temple, for which Medusa, not Poseidon, was punished (Metamorphoses 4.798–803). Ovid also tells of the girl Caenis, whom he raped and then turned into a man at her request (12.189–209).

These stories are disturbing, and they are part of the record. Hellenic polytheists read them in different ways; you are not required to admire or excuse them. Many devotees honour the god of sailors, earthquakes and horses while setting these stories firmly aside.`,
            },
            {
              heading: 'A god to be feared',
              body: `Greeks feared Poseidon. His anger kept Odysseus from home for ten years; his earthquake and wave destroyed Helike in a night. He was not a comfortable god, and the ancient sources do not pretend otherwise.

That fear was a form of respect, and it is a healthy one to keep: respect for the sea, which drowns strong swimmers, and for the ground, which can move. Do not test him: no swimming to prove devotion, no rites on rocks in a storm. Ask him, as the ancients did, for safe passage, steady ground and calm, and treat the sea and the land with care.`,
            },
          ],
          knowAndDont: {
            known:
              'Odyssey 3.5–8 describes the sacrifice of bulls at Pylos. Pausanias 8.7.2 and 8.25.5 report the Argive horses and the Arcadian myth of Demeter. Hesiod (Theogony 278–279) and Ovid (Metamorphoses 4.798–803 and 12.189–209) give Medusa and Caenis.',
            unknown:
              'How often, and how widely, the drowning of horses was practised is unknown; Pausanias speaks of it as an old custom. How ordinary Greeks squared the myths of force with their prayers to Poseidon Soter is a matter of interpretation.',
          },
          inPractice:
            'This week, spend an hour picking up litter beside water, or give to a sea rescue or clean-water charity, and tell Poseidon about it at the shrine. Decide what you will do with the myths of force.',
          reflect: [
            'What is the difference between fear and respect, and which do you feel for the sea?',
            'How do you hold a god whose stories you cannot admire, beside a god who brings sailors home?',
          ],
          further: [
            'Pausanias, Description of Greece 8.7 and 8.25, trans. W. H. S. Jones (1918)',
            'Jon D. Mikalson, Ancient Greek Religion (2nd ed., 2010)',
          ],
          library: ['traditional/deity/poseidon', 'traditional/deity/demeter', 'traditional/vessel/offering_bowl'],
          premade: ['folk-khernips-libation'],
        },
      ],
      practices: [
        {
          id: 'poseidon-nine-days',
          title: 'Nine days of libation and care',
          instructions:
            'For nine days, at about the same time, do this. Wash your hands. Light the lamp and say a word to Hestia. Stand, raise your hands toward the nearest water, and greet Poseidon by one of your titles. Pour a little wine mixed with water, or fresh water, into his dish. Then name one thing you did that day for water or the sea: saved water, avoided plastic, picked up litter, checked the tide before a walk, or simply looked at the water with attention. Sit for a few minutes. Put out the light, and pour the dish onto earth in the morning. Refresh his bowl of salt water on the first and last days.',
          times: 9,
          every: 'day',
          prompt: 'What did I do for the water today? What did I notice about the ground beneath me?',
          premade: 'folk-khernips-libation',
        },
        {
          id: 'poseidon-practice-oar',
          title: 'Carry the oar',
          instructions:
            'Once in this stage, in the spirit of Tiresias’s instruction, take the sea to someone who does not know it: tell a child about the tides, take a friend to the coast, share what you have learned about water safety, or give to a charity that teaches swimming. Then pour a libation to Poseidon when you get home.',
          times: 1,
          prompt: 'Who did I carry the sea to, and what did they make of it?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Rounding the cape',
      intro: `Ships passing Sounion saw the god’s temple and prayed as they rounded the cape. Take a few days to look honestly at this month. A dedication is a promise to keep showing up, and it is only worth making if you mean it.

Stopping here is a good outcome. So is pausing, or deciding that another god, another path or no dedication at all is right for you. Poseidon lost Athens to Athena and was still honoured there.`,
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'poseidon-discern-walk',
          title: 'A walk by the water',
          instructions:
            'Walk beside water, at a safe distance from the edge, or, if you are far from it, stand still on solid ground for a long while. Think about each road: dedicate, wait, or turn elsewhere. Notice which way your body leans.',
          times: 1,
          prompt: 'Which way did I lean, and what made me lean?',
        },
      ],
      questions: [
        'Have I kept the nine days because I wanted to, or because I felt I had to?',
        'Am I drawn to Poseidon himself, or mainly to the sea? Is that enough for me?',
        'Can I keep a monthly libation on the eighth, his shrine and some care for water, for a year?',
        'Am I at peace with how I hold the myths of force, and with a god who is feared as well as loved?',
        'Do I understand which parts of what I believe about him are ancient and which are modern?',
        'Would I be relieved or disappointed if I decided to wait? What does that tell me?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication on the eighth',
      intro: `If you have chosen to go on, make your dedication on the eighth day of a lunar month, Poseidon’s day, or after coming home safely from a journey over water. This is a self-dedication, a promise you make on your own behalf. It is not an initiation, and it does not make you a priest of Poseidon or a member of any group.

Ancient Greeks rarely dedicated themselves to one god alone. Your promise can sit beside honouring Athena, Demeter, Zeus and others.`,
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Poseidon',
        summary:
          'Purification with fresh and salt water, Hestia first, Poseidon called by his titles with the Homeric Hymn, your promise, a libation and barley, a pine sprig on the shrine, and silence listening to the water.',
        minutes: 60,
        ingredients: [
          { name: 'A bowl of fresh water and a match or bay sprig for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A bowl of water with a pinch of salt' },
          { name: 'A lamp, tealight or electric candle' },
          { name: 'A cup of wine mixed with water, or fresh water', ref: 'traditional/tool/chalice' },
          { name: 'A dish to pour into', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A handful of barley grains' },
          { name: 'A pine sprig', ref: 'traditional/herb/pine' },
          { name: 'A little myrrh or frankincense on a heatproof burner', ref: 'traditional/herb/myrrh', optional: true },
          { name: 'An aquamarine or a piece of sea glass', ref: 'traditional/crystal/aquamarine', optional: true },
          { name: 'Your written promise on a card' },
        ],
        preparation:
          'During the day, if you can, spend time by water or do something for it: a beach or river clean-up, a donation to sea rescue. Clean his shrine and refresh the salt water. Write your promise in your own words: simple and doable, for example to pour him a libation on the eighth of each month, to pray before journeys over water and pay my vows, to treat the sea with respect, and to do something each season for clean water. Wash and dress in clean clothes.',
        steps: [
          {
            title: 'Purify',
            instructions:
              'Make khernips by quenching the flame in the fresh water. Wash your hands and touch your face. Then touch a drop of the salt water to your forehead.',
            spoken: 'With clean hands I come to the lord of the sea and the steady earth.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the lamp. Pour a drop of the libation for Hestia.',
            spoken: 'Hestia, first and last, I begin with you.',
            light: true,
          },
          {
            title: 'Call Poseidon',
            instructions:
              'Face the sea or the nearest water. Raise your hands, palms up. Add incense if you are using it, and scatter a few grains of barley. Speak the hymn slowly.',
            spoken:
              'I begin to sing of Poseidon, the great god, mover of the earth and of the fruitless sea, lord of Helikon and wide Aigai. A twofold honour the gods gave you, Earth-Shaker: to be a tamer of horses and a saviour of ships. Hail, Poseidon, holder of the earth, dark-haired lord. Blessed one, be kindly in heart, and help those who voyage in ships. This month I have learned your story and cared for your waters. Now I come to make a promise.',
            minutes: 2,
          },
          {
            title: 'Make your promise',
            instructions:
              'Read your promise aloud. Then pour most of the libation into the dish, and lay the pine sprig on the shrine with your written promise beneath it.',
            spoken: 'This is my promise, made freely. Hold the ground steady beneath me as I keep it.',
          },
          {
            title: 'Listen to the water',
            instructions:
              'Sit quietly. If you are near water, listen to it; if not, hold the bowl of salt water in your hands and listen to your breathing.',
            minutes: 7,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Pour the last drop for Hestia. Thank them both and put out the lamp.',
            spoken: 'Hestia, last as you were first. Poseidon, it is done.',
            snuff: true,
          },
        ],
        closing:
          'Drink the rest of the cup yourself, with thanks. Pour the libation dish onto earth, never into water. Pour the salt water down the sink, not on plants. Keep the pine sprig and your written promise on his shrine, and read the promise on the eighth of each month. Write in your journal what you promised and how it felt.',
        safety:
          'If you hold the rite near water, stay well back from the edge, check the tide and weather, and do not go alone. Never leave a flame unattended. Myrrh smoke can trouble people with asthma and small pets. Grapes, raisins and wine are toxic to dogs and cats; salt water harms plants.',
      },
    },
    {
      kind: 'ongoing',
      title: 'The eighth of every month',
      intro: `Your relationship with Poseidon now lives in the month and in the water. On the eighth day of each lunar month, pour him a libation and read your promise. Before any journey over water, pray for safe passage and make a small vow; when you come home, pay it. Keep his bowl of salt water fresh, and do something for the sea each season.

Once a year, on the anniversary of your dedication or in the month of Poseideon, read your promise again and renew it, change it, or set it down with thanks. If you also honour Neptune, keep the Neptunalia in July.`,
      days: 30,
      lessons: [],
      practices: [
        {
          id: 'poseidon-ongoing-eighth',
          title: 'The eighth of the month',
          instructions:
            'On the eighth day of each lunar month, counting from the first crescent, wash, light the lamp, begin with Hestia, and pour a libation to Poseidon with the Homeric Hymn. Refresh his salt water and read your promise.',
          times: 12,
          every: 'month',
          prompt: 'What did the sea or the ground ask of me this month?',
          premade: 'folk-khernips-libation',
        },
        {
          id: 'poseidon-ongoing-passage',
          title: 'Before and after a journey over water',
          instructions:
            'Before any journey over water, pray to Poseidon Soter for a safe passage and return for you and your companions, and vow a small, definite gift. When you are home, pay it, and mark it paid on the shrine card.',
          times: 1,
          prompt: 'Where did I travel, what did I vow, and have I paid it?',
          premade: 'sea-safe-passage-blessing',
        },
        {
          id: 'poseidon-ongoing-rededicate',
          title: 'Yearly rededication',
          instructions:
            'On your dedication anniversary or in Poseideon, spend time by water or do something for it, then repeat the dedication rite with your promise rewritten for the coming year.',
          times: 1,
          every: 'month',
          prompt: 'What has a year with Poseidon taught me about respect? What will I promise now?',
        },
      ],
    },
  ],
  sources: [
    'Homeric Hymn 22, To Poseidon, trans. H. G. Evelyn-White, Hesiod, the Homeric Hymns and Homerica (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (the dedication prayer follows it closely; quoted: “a tamer of horses and a saviour of ships”; “be kindly in heart and help those who voyage in ships”)',
    'Homer, Iliad 13.17–31 and 15.187–193; Odyssey 3.5–8, 3.278–285, 9.528–535 and 11.119–134, trans. Samuel Butler, Project Gutenberg (paraphrased)',
    'Homeric Hymn to Apollo 229–238, the colt at Onchestos, trans. H. G. Evelyn-White (1914) (paraphrased)',
    'Herodotus, Histories 6.87, 7.192 and 8.55 (paraphrased)',
    'Xenophon, Hellenica 4.7.4 (paraphrased)',
    'Pausanias, Description of Greece 7.24.6–7.25.1, 8.7.2 and 8.25.5, trans. W. H. S. Jones (1918) (paraphrased)',
    'Hesiod, Theogony 278–279; Ovid, Metamorphoses 4.798–803 and 12.189–209 (paraphrased)',
    'Linear B tablets from Pylos naming po-se-da-o, the Posidaion and po-si-da-e-ja (e.g. PY Tn 316, Es series)',
    'Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year (1975), on the eighth day',
    'Walter Burkert, Greek Religion (1985); Robert Parker, On Greek Religion (2011)',
  ],
};
