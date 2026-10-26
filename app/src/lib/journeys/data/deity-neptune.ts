import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-neptune',
  kind: 'deity',
  paths: ['roman'],
  deityRef: 'traditional/deity/neptune',
  title: 'Neptune of the Waters',
  summary:
    'A month with Neptune, the Roman god of water before he was lord of the sea: the leafy shelters of the Neptunalia in the summer drought, sailors’ vows and votive tablets, the storm he calms in the Aeneid, and a practice of giving thanks for every cup of water.',
  welcome: `This journey runs about a lunar month. You will learn who Neptune was to the Romans, why his festival fell in the hottest, driest days of the year, how sailors prayed to him and paid their vows, and how people honour him today. There is a nine-day practice of water and thanks, and at the end you may make a self-dedication.

It is a self-dedication, not an initiation. Neptune had a flamen of his own in Rome, the flamen Neptunalis, a public office nobody can give you from an app; modern groups that keep priesthoods have their own processes. What remains open to everyone is what most Romans did: give thanks for water, keep his festival in the shade, and make and keep a vow before a journey over the sea.

The best time to walk it is early summer, so that the dedication can fall on the Neptunalia, 23 July. Any time of year will do.`,
  about: `Neptune is one of the oldest gods of Rome. Before he was matched with the Greek Poseidon and given the sea, he seems to have been an Italian god of water in general, and of the fresh water a farming people needed most. His festival, the Neptunalia, fell on 23 July, in the fiercest heat of the Roman summer, when springs and streams ran low; people built shelters of leafy branches, called umbrae, “shades”, and feasted in them. He had his own flamen, a temple near the Circus Flaminius, and a partner goddess, Salacia, of the salt water. As Rome took to the sea, he became the god sailors prayed to before a voyage and thanked after it, with vows paid on the shore and votive tablets hung in his temples. Virgil gave him the great scene in the first book of the Aeneid, where he rises from the deep and calms a storm. Under the name of Poseidon he gathered Greek myths of horses, earthquakes and many unions. Today Roman polytheists keep the Neptunalia, give thanks for water, and ask his protection before travel by sea.`,
  notes: [
    'Never throw offerings into rivers, lakes or the sea. Romans did, and modern water is already full of litter. Pour libations onto the ground or into a dish, and give the water itself your care instead.',
    'Respect water. Do not perform any part of this journey alone on rocks, piers, riverbanks or tidelines, at night, in rough weather, or in the water itself. The shore of your own sink is a perfectly good place to begin.',
    'Neptune was matched with the Greek Poseidon, and the myths most people know, the trident, the sea-horses, the many unions, come from there. The journey teaches the Roman god and says which is which.',
    'Roman cult offered Neptune bulls, and sailors threw the entrails into the sea. Nobody does this now, and nothing here asks you to. Wine, water, incense and a vow kept are fully traditional.',
    'Modern Roman polytheism is small and varied. The gods of Rome belong to anyone who approaches them with respect, whatever their ancestry.',
  ],
  holyDays: ['neptunalia'],
  stages: [
    {
      kind: 'threshold',
      title: 'A cup of water',
      intro:
        'Before study, a greeting. Neptune was first the god of the water people drink and farm with, so this first rite begins with the most ordinary thing in your house: a cup of clean water. It follows the Roman form, with the head covered, Janus called first and Vesta last.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'neptune-threshold-water',
          title: 'Trace your water',
          instructions:
            'On each of the two days, find out one thing about where your water comes from: the reservoir, river, aquifer or spring that feeds your tap, or the river your drains run to. Rome was famous for its aqueducts, and Romans knew the names of their springs. Learn the name of yours.',
          times: 2,
          every: 'day',
          prompt: 'Where does my water come from, and where does it go? How often do I think about it?',
        },
      ],
      rite: {
        title: 'Greeting Neptune',
        summary: 'A short Roman-form introduction: washed hands, covered head, Janus first, then a cup of fresh water and a little wine poured for Neptune.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A scarf or fold of cloth to cover your head' },
          { name: 'A glass or cup of fresh, cold water' },
          { name: 'A small cup of wine (or grape juice)', ref: 'traditional/tool/chalice' },
          { name: 'A shallow offering dish', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Frankincense, a few grains, and a burner', ref: 'traditional/tool/incense_burner' },
          { name: 'A blue or sea-green candle', ref: 'traditional/candle/blue', optional: true },
          { name: 'A sprig of pine or any leafy branch', ref: 'traditional/herb/pine', optional: true },
        ],
        preparation:
          'Choose a place near water if you can: by the kitchen sink, beside a window with a view of a river or the sea, or in a garden by a water butt. Set out the cup of water, the wine, the dish and the burner. Read the words through until you can say them without stumbling; Roman prayer took its words seriously.',
        steps: [
          {
            title: 'Wash and veil',
            instructions: 'Wash your hands in the clean water and dry them. Draw the cloth over the back of your head, as a Roman drew a fold of the toga up to pray.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the candle if you are using one, and drop a few grains of incense on the burner. Janus, god of doors, is called first in Roman prayer so that the way to the other gods is open.',
            spoken: 'Father Janus, opener of the way,\nreceive this incense, and carry my words through.',
            light: true,
          },
          {
            title: 'Call Neptune',
            instructions: 'Lift the cup of fresh water with both hands. Raise it a little, then set it before you.',
            spoken: 'Father Neptune, lord of the waters,\nof the spring, the river and the sea,\nor by whatever name you rightly wish to be called:\nI come to learn who you are.\nThis water is yours before it is mine.',
          },
          {
            title: 'Pour',
            instructions: 'Pour a little of the wine into the offering dish, then a little of the fresh water beside it.',
            spoken: 'Neptune, be honoured by this wine and this water.\nI ask nothing today but to be known to you,\nand to learn what I owe the waters.',
          },
          {
            title: 'Drink',
            instructions: 'Drink the rest of the fresh water slowly, paying attention to it: its cold, its taste, the fact that it is clean. Then stand quietly for a few minutes.',
            minutes: 3,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'Name Vesta last, as Roman prayer ended with her. Turn round to your right, uncover your head, and put out the flame.',
            spoken: 'Vesta, keeper of the hearth, be honoured, last as always.',
            snuff: true,
          },
        ],
        closing:
          'Leave the dish until evening, then pour it onto earth or into a plant pot, not into a drain that runs to a river. Write down the date and the name of your water’s source: you have begun.',
        safety:
          'Never leave a candle or incense unattended; use a heatproof surface. Keep incense smoke away from birds and anyone with asthma. Grapes, raisins and wine are toxic to dogs and cats, so keep the dish out of their reach.',
      },
    },
    {
      kind: 'study',
      title: 'Spring, river and sea',
      intro:
        'Five lessons, about two days each. They go from the old Italian god of water, to his festival in the summer heat, to the sailors’ vows and Virgil’s storm, to how he is honoured today, and finally to the hard parts: the Greek myths, a festival with a dark founding story, and a god even an emperor quarrelled with.',
      days: 10,
      lessons: [
        {
          id: 'neptune-who',
          title: 'Who Neptune is',
          summary: 'An old Italian god of water, his name, his partner goddesses and his place among the gods of Rome.',
          minutes: 6,
          sections: [
            {
              heading: 'A god of water before the sea',
              body: `Most people meet Neptune as a sea god with a trident, the Roman twin of Poseidon. That is how he ended up, but it is probably not how he began. The Romans were a farming people on a river, the Tiber, for centuries before they had a navy, and the evidence suggests that their Neptune was first a god of water in general: springs, streams and the moisture the fields needed.

The strongest clue is his festival. The Neptunalia fell on 23 July, in the hottest and driest weeks of the Italian summer, when water was scarce. A sea god would have little reason to be honoured then; a god of fresh water would have every reason. Many scholars read the festival as a plea for water in the drought.`,
            },
            {
              heading: 'His name',
              body: `Romans guessed at the meaning of his name. Varro, the great antiquarian of the first century BC, thought it came from a word for covering, because the sea covers the land as clouds cover the sky (On the Latin Language 5.72). Modern linguists are not sure. Some connect it with an old root for moisture or cloud; others note the Etruscan god Nethuns, who appears among the gods named on a bronze model of a sheep’s liver used for divination, found near Piacenza. Whether the Etruscans took him from the Latins or the other way round is unknown.

What is clear is that he was old. He had one of Rome’s fifteen flamens, the flamen Neptunalis, a sign of an early place in the city’s worship.`,
            },
            {
              heading: 'Salacia and Venilia',
              body: `Old Roman priestly books paired gods with goddesses who were their companions or powers. Aulus Gellius, quoting those books, names Salacia as Neptune’s (Attic Nights 13.23.2). Varro explains her name from salum, the open sea, and names a second goddess with her, Venilia, from the waves that come in (venire) to the shore (On the Latin Language 5.72). Later writers made Salacia his wife, matched with the Greek Amphitrite.

These goddesses are hardly more than names now. They are a reminder that Roman religion liked to give each power a partner, and that the sea, once it mattered to Rome, needed goddesses of its own movement.`,
            },
            {
              heading: 'His signs',
              body: `His signs are the trident, the dolphin and the horse, along with ships, shells and the colours of water. The trident and dolphin came to him with Poseidon; the horse may be older, through his link with the god Consus (lesson five). His festival sign is the umbra, the shelter of leafy branches. In public cult his animal was the bull, as Virgil says when Anchises sacrifices “a bull to Neptune, a bull to you, fair Apollo” (Aeneid 3.119). In the Georgics Virgil calls on him as the god for whom the earth, struck by his trident, first poured out the horse (Georgics 1.12–14). His tree is usually given as the pine, the wood of ships.`,
            },
          ],
          knowAndDont: {
            known:
              'The Neptunalia on 23 July is in the surviving calendars. The flamen Neptunalis is attested by Varro and Ennius. Gellius (13.23.2) and Varro (On the Latin Language 5.72) name Salacia and Venilia. The Etruscan Nethuns is on the Piacenza liver.',
            unknown:
              'The meaning of his name and his earliest character are inferred, not recorded; the “god of fresh water” reading rests mostly on the date of his festival, and some scholars doubt it. What the flamen Neptunalis did is unknown.',
          },
          inPractice:
            'Put a small glass of fresh water on your shrine or windowsill this month as his sign, and change it every day. Pour the old water onto a plant rather than down the drain.',
          reflect: [
            'Which do you think of first when you hear his name: the sea, or the water from your tap? Why?',
            'Where in your life is there drought just now, and where is there plenty?',
          ],
          further: [
            'John Scheid, An Introduction to Roman Religion (2003)',
            'Varro, On the Latin Language 5.72 (Latin at The Latin Library; Kent’s 1938 Loeb translation on archive.org)',
          ],
          library: ['traditional/deity/neptune', 'traditional/deity/poseidon', 'traditional/herb/pine'],
        },
        {
          id: 'neptune-neptunalia',
          title: 'The Neptunalia: shade in the drought',
          summary: 'His festival on 23 July, the leafy shelters, Horace’s wine and song, his temple and the banquet of the gods.',
          minutes: 7,
          sections: [
            {
              heading: 'Shelters of leaves',
              body: `On 23 July, the Neptunalia, Romans built umbrae: shelters of leafy branches, like bowers or huts, and feasted in their shade. The lexicographer Festus explains the word: at the Neptunalia, he says, the leafy huts put up in place of tents were called “shades”. It is a lovely, simple custom, and it fits the season. In the white heat of late July, a god of water was honoured with green shade, drink and company.

Very little else of the festival’s ritual is recorded. It was a public holiday, marked in the calendars, and there were presumably public sacrifices. The umbrae are what everyone remembered.`,
            },
            {
              heading: 'Horace keeps the day',
              body: `One poem shows a Roman actually keeping the Neptunalia. In Odes 3.28 Horace asks, “What better could I do on Neptune’s feast day?” and answers himself: bring out the good Caecuban wine, hidden away in the store, and sing. He and his companion Lyde will sing in turn, he of Neptune and the green-haired Nereids, she of Latona and Diana, and then of Venus, and then a song for the night.

It is a small, domestic picture: a friend, a good bottle opened for the god’s day, songs to the sea and its nymphs in the summer evening. It is also a perfectly good model for a modern Neptunalia.`,
            },
            {
              heading: 'His temple and the banquet of the gods',
              body: `Neptune had a temple in the Campus Martius near the Circus Flaminius; Livy mentions it in 206 BC, when it was among the places where prodigies were reported (28.11.4). One surviving calendar marks its anniversary on 1 December. Later, Augustus’s admiral Agrippa built a great colonnade for Neptune, the Porticus Argonautarum, celebrating naval victories.

In 217 BC, after the disaster at Lake Trasimene, Rome held a lectisternium, a banquet for the gods, with twelve gods set in pairs on six couches. Livy lists them: Jupiter and Juno, Neptune and Minerva, Mars and Venus, Apollo and Diana, Vulcan and Vesta, Mercury and Ceres (22.10.9). Neptune sat among the twelve great gods of the city.`,
            },
            {
              heading: 'Springs and the Fontinalia',
              body: `Romans also honoured the springs themselves. On 13 October came the Fontinalia, the festival of Fons, god of springs, when, Varro says, people threw garlands into springs and set them on wells (On the Latin Language 6.22). That was Fons’s day, not Neptune’s, but it belongs to the same Roman care for fresh water. A modern devotee of Neptune can honour it too, with a garland laid beside, not in, a well or fountain, and a word of thanks for the springs.`,
            },
          ],
          knowAndDont: {
            known:
              'The date of the Neptunalia is in the calendars; Festus describes the umbrae; Horace, Odes 3.28, is a poem for the day. Livy 22.10.9 lists Neptune at the lectisternium of 217 BC, and 28.11.4 mentions his temple. Varro (On the Latin Language 6.19 and 6.22) names the Neptunalia and the Fontinalia.',
            unknown:
              'The public rites of the Neptunalia are not described. The temple’s founding date and the 1 December anniversary rest on thin evidence. Whether the umbrae had a religious meaning beyond shade and feasting is unknown.',
          },
          inPractice:
            'Put 23 July in your calendar. Decide where you could make an umbra: a garden, a balcony with a few branches or potted plants, a shady tree in a park. Choose the bottle you will open for him.',
          reflect: [
            'What would it mean to honour a god by making shade?',
            'Horace kept Neptune’s day with a friend, wine and song. Who would you keep it with?',
          ],
          further: [
            'Horace, Odes 3.28 (public-domain translations on Project Gutenberg)',
            'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (1981), on the Neptunalia and Fontinalia',
          ],
          library: ['traditional/deity/neptune', 'traditional/deity/minerva', 'traditional/herb/willow'],
          premade: ['green-water-rainwater-wash'],
        },
        {
          id: 'neptune-sailors',
          title: 'Vows on the shore: sailors and the storm',
          summary: 'How Romans prayed before a voyage, paid their vows after, and how Virgil’s Neptune calms the sea.',
          minutes: 8,
          sections: [
            {
              heading: 'Scipio’s prayer',
              body: `As Rome became a sea power, Neptune became the god of those who crossed the water. The fullest Roman prayer before a voyage is in Livy. In 204 BC, as his fleet set sail for Africa, Scipio stood on the flagship’s stern and prayed to “gods and goddesses who dwell in the seas and the lands” that the voyage would go well for him, the Roman people and their allies, and that they might come home safe and victorious. Then he threw the raw entrails of the victim into the sea, as was the custom, and the trumpet sounded (29.27.1–5).

Notice the shape: the gods addressed broadly, the request exact, the people covered by the prayer named, and the offering given to the element itself. Notice too that Scipio did not name Neptune alone. Roman sailors spread their prayers wide, to every power of the sea.`,
            },
            {
              heading: 'A vow paid',
              body: `Sailors made vows: “if I come safely to land, I will give you this.” Virgil shows one in the boat race of Aeneid 5. Cloanthus, about to lose, stretches his hands to the sea and vows to the gods who rule it a white bull on the shore, and wine and entrails cast into the waves, if they give him the victory. They hear him, and Portunus, god of harbours, pushes his boat home with his great hand (5.235–243).

When the vow came true, it was paid. People who survived shipwreck hung up votive tablets in temples of the sea gods, painted with the scene, and sometimes the clothes they had been wearing. Horace, in a famous image, says he has escaped a dangerous love as a sailor escapes a wreck: the temple wall, with its votive tablet, shows that he has hung up his wet clothes “to the god who rules the sea” (Odes 1.5.13–16).`,
            },
            {
              heading: 'The storm and the statesman',
              body: `The most famous Neptune in Latin literature rises in the first book of the Aeneid. Juno has bribed the winds to wreck the Trojan fleet. Neptune feels the sea churned up without his leave, lifts his calm head above the waves, and rebukes the winds: “Quos ego—”, “Whom I—!”, breaking off his threat unfinished (1.135). Then he smooths the swell, scatters the clouds and brings back the sun.

Virgil compares him to a respected man who stands up when a riot is breaking out, and the crowd falls silent and listens while his words calm their anger (1.148–153). It is one of the great images of Roman ideals: power used not to rage, but to restore order. That is the Neptune Romans hoped for when they put to sea.`,
            },
            {
              heading: 'Before a journey today',
              body: `Modern devotees ask Neptune for safe passage before any journey over water: a ferry, a flight over the sea, a sailing trip, a swim. A simple form follows Scipio: wash, cover your head, name the god and the other powers of the water, ask clearly for a safe journey and a safe return for yourself and your companions, and vow a small, definite gift if you come home safe. Then pay it.

The gift can be a libation on your return, a donation to a sea rescue service such as the RNLI or a coastguard charity, or an hour spent cleaning a beach or riverbank. A written note of the vow, kept on the shrine until it is paid, is a household version of the votive tablet.`,
            },
          ],
          knowAndDont: {
            known:
              'Livy 29.27.1–5 gives Scipio’s prayer and the entrails cast into the sea. Virgil, Aeneid 5.235–243, gives Cloanthus’ vow, and Aeneid 1.124–156 Neptune’s calming of the storm. Votive tablets for rescue at sea are mentioned by Horace (Odes 1.5) and others, and votive offerings by sailors survive in archaeology.',
            unknown:
              'How ordinary sailors worded their prayers is mostly unrecorded; Scipio’s is a general’s public prayer as Livy chose to write it. Virgil’s scenes are poetry, not ritual instruction, though they draw on real practice.',
          },
          inPractice:
            'Write a short prayer for safe passage in the Roman form and keep it in your wallet or phone. Next time you travel over water, say it before you set out, vow a small gift, and pay it when you return.',
          reflect: [
            'What journeys over water have you made, and did you ever feel afraid on one?',
            'Neptune in Virgil calms rather than rages. Where in your life could you be the calm that settles a storm?',
          ],
          further: [
            'Virgil, Aeneid 1 and 5 (public-domain translations on Project Gutenberg)',
            'Livy, History of Rome 29.27 (public-domain translations on Project Gutenberg)',
          ],
          library: ['traditional/deity/neptune', 'traditional/deity/juno', 'traditional/crystal/aquamarine'],
          premade: ['sea-safe-passage-blessing'],
        },
        {
          id: 'neptune-today',
          title: 'Honouring Neptune today',
          summary: 'Roman polytheists, the household Neptune through the year, water as an offering, and how to set up his shrine.',
          minutes: 6,
          sections: [
            {
              heading: 'Who keeps him now',
              body: `Neptune is honoured today mainly by Roman polytheists, people practising the Religio Romana or Cultus Deorum, a small reconstructed religion with groups in Italy, organisations such as Nova Roma, and many solitary practitioners. They keep the Neptunalia, pray to him before journeys over water, and give thanks for water in times of drought.

You will also meet Neptune in modern astrology, as the planet discovered in 1846 and named after him, given meanings of dreams, illusion and the boundless. That is a modern astrological tradition with nothing to do with Roman cult. Eclectic Pagans and witches often honour him as a general sea god, close to Poseidon. All of these can be done with care, as long as you know which you are doing.`,
            },
            {
              heading: 'Neptune through the year',
              body: `A household Neptune has a few natural moments. In summer, especially in heat and drought, the Neptunalia and thanks for water. Before and after any journey over water, a prayer and a vow paid. On the Fontinalia in October, thanks for springs and wells. And whenever you are by the sea, a lake or a river, a quiet word of respect.

Many devotees also make water itself the offering, in the modern sense: saving water in a dry summer, mending a dripping tap, keeping fats and wipes out of the drains, joining a river or beach clean-up. None of this is ancient, but it follows from honouring the god whose festival begged for water in the drought.`,
            },
            {
              heading: 'Setting up his shrine',
              body: `Put Neptune’s shrine near water if you can: by the kitchen sink, a window facing a river or the sea, or in a garden. You need a glass or bowl of fresh water, changed daily, a shallow offering dish, a cup, an incense burner and a candle. For his image, use a small statue, a trident, a dolphin or horse, a picture of the sea, or a shell gathered responsibly from a beach where taking shells is allowed. Blue and sea-green are modern colours for him, and aquamarine and larimar modern stones.

Keep a small card on the shrine for vows: when you vow something before a journey, write it down; when you pay it, mark it paid. The Romans wrote V S L M, votum solvit libens merito, “paid the vow willingly and deservedly”.`,
            },
          ],
          knowAndDont: {
            known:
              'Modern Roman polytheist groups publish their calendars, including the Neptunalia. The planet Neptune was discovered in 1846, and its astrological meanings are modern. V S L M is common on Roman votive inscriptions.',
            unknown:
              'There is little evidence for household cult of Neptune in antiquity, apart from sailors’ vows. The everyday practices here are modern, built on his festival, his sailors’ cult and his character as god of water.',
          },
          inPractice:
            'Set up his shrine this week, with a glass of water you change every day. Find out whether there is a river, canal or beach clean-up near you, and put the next one in your calendar.',
          reflect: [
            'Which water in your life deserves thanks that you have never given it?',
            'What would change if you treated water at home as something holy?',
          ],
          further: [
            'Nova Roma’s published calendar and religious guides (novaroma.org)',
            'Mary Beard, John North and Simon Price, Religions of Rome (1998), vol. 2, for sources in translation',
          ],
          library: ['traditional/tool/altar', 'traditional/crystal/larimar', 'traditional/crystal/blue_lace_agate', 'traditional/candle/blue', 'traditional/vessel/bowl'],
          premade: ['folk-lararium-offering', 'sea-safe-passage-blessing'],
        },
        {
          id: 'neptune-hard',
          title: 'Greek myths, a stolen bride and an angry emperor',
          summary: 'The Poseidon stories in Ovid, the Consualia and the Sabine women, and Augustus’s quarrel with the god.',
          minutes: 6,
          sections: [
            {
              heading: 'The Greek stories',
              body: `As Neptune was matched with Poseidon, he took on Poseidon’s myths in Latin poetry: the contest with Minerva for Athens, the building of the walls of Troy, the father of monsters and heroes. Ovid also tells, in a few lines, that he violated Medusa in Minerva’s temple, and that Minerva turned Medusa’s hair to snakes (Metamorphoses 4.798–803), and that he raped the girl Caenis and then granted her wish to become a man, Caeneus, who could not be wounded (12.189–209). Arachne’s tapestry lists his disguises in other seductions (6.115–120).

These stories are disturbing, and they come from Greek myth and Ovid’s retelling, not from Roman temple cult. Some modern devotees read them as myths of the sea’s violence; some set them aside as belonging to another religion. You are not required to admire or excuse them.`,
            },
            {
              heading: 'The Consualia and the Sabine women',
              body: `Livy tells that Romulus, needing wives for his new city, announced games for Neptunus Equester, “Neptune of the horses”, and called them the Consualia. The neighbouring Sabines came with their families to watch, and at a signal the young Romans seized the unmarried women and carried them off (1.9.6–12). Consus was a god of the stored harvest with an underground altar in the Circus Maximus, honoured with horse and mule races; Romans identified him with Neptune of the horses.

This is Rome’s own founding story, and it begins with abduction at a god’s festival. It is worth knowing honestly. Livy himself has the women make peace between their fathers and husbands later in the story, but nothing makes the first act right.`,
            },
            {
              heading: 'An emperor’s quarrel',
              body: `Neptune was a god powerful people tried to claim. In the civil wars after Caesar’s death, Sextus Pompeius, who controlled the seas, styled himself son of Neptune and wore a sea-blue cloak. When Octavian, the future Augustus, lost a fleet in a storm, he is said to have declared that he would win even against Neptune’s will, and to have removed the god’s image from the procession at the next circus games (Suetonius, Augustus 16.2).

He won, and he later honoured Neptune at the site of his victory at Actium. The story is a reminder that the Romans saw the sea as a power to respect, not to own, and that even an emperor’s defiance was remembered as a dangerous thing.`,
            },
            {
              heading: 'What not to do',
              body: `Do not throw offerings, coins, flowers, food or anything else into the water. Do not perform rites alone on rocks or tidelines, or in the water, or near it in bad weather. Do not swim to prove your devotion. Do not ask Neptune to wreck anyone; Roman prayer asked him for safe passage and calm. And do not vow what you cannot pay: a sailor who forgot a vow made in a storm was, in Roman eyes, asking for trouble the next time.`,
            },
          ],
          knowAndDont: {
            known:
              'Ovid, Metamorphoses 4.798–803, 6.115–120 and 12.189–209, gives the Medusa, Arachne and Caenis passages. Livy 1.9 gives the Consualia and the Sabine women, with games for Neptunus Equester. Suetonius, Augustus 16, gives Octavian’s quarrel with Neptune; Cassius Dio and Appian describe Sextus Pompeius as “son of Neptune”.',
            unknown:
              'How early and how firmly Consus was identified with Neptune is debated. The Sabine story is legend, not history. How Romans in the street related the poets’ myths to the god of the Neptunalia is unknown.',
          },
          inPractice:
            'Learn the water safety basics for any coast or river you visit: tides, currents, cold water shock. Decide now whether the Greek myths of Poseidon have any place on your shrine.',
          reflect: [
            'How do you hold a god whose old stories include acts you cannot admire?',
            'What powers in your life do you respect without trying to own?',
          ],
          further: [
            'Livy, History of Rome 1.9 (public-domain translations on Project Gutenberg)',
            'Suetonius, The Twelve Caesars, Augustus 16 (public-domain translations on Project Gutenberg)',
          ],
          library: ['traditional/deity/neptune', 'traditional/deity/poseidon', 'traditional/deity/minerva'],
        },
      ],
      practices: [
        {
          id: 'neptune-study-water',
          title: 'Notice the water',
          instructions:
            'Through the study stage, note each day one moment when water mattered: a drink when you were thirsty, rain on the window, a river you crossed, a shower, a tap left running. Say a word of thanks each time you notice.',
          times: 10,
          every: 'day',
          prompt: 'Where did water meet me today, and did I notice it at the time?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine days of water and thanks',
      intro:
        'Nine days of a short daily offering of fresh water, with one small act of care for water each day. Nine-day periods were used in Roman religion for other rites; here nine frames a practice, not a claim about ancient custom.',
      days: 9,
      lessons: [],
      practices: [
        {
          id: 'neptune-nine-days',
          title: 'The daily cup',
          instructions:
            'Each day: wash your hands and cover your head. Give a grain of incense or a word to Janus. Pour the old water from Neptune’s glass onto a plant, refill it with fresh water, and pour a few drops into his dish, saying: “Father Neptune, be honoured by this water. As it is given to me, I give it back.” Then name aloud one thing you did that day to care for water: saved it, kept something out of the drain, picked up litter near a stream, mended a leak, or simply drank it with attention. Name Vesta last, turn to your right, and uncover.\n\nIf one day you did nothing for water, say so plainly, and do something the next.',
          times: 9,
          every: 'day',
          prompt: 'What did I do for water today? What did I take for granted?',
        },
        {
          id: 'neptune-umbra',
          title: 'An afternoon in the shade',
          instructions:
            'Once in the nine days, make a small umbra in the spirit of the Neptunalia: sit under a tree, or put up a shelter of branches, an old sheet or a garden umbrella with leafy boughs fixed to it. Bring cool water and a little wine or juice. Pour some for Neptune, bare-handed onto the ground, saying: “Neptune, be honoured in the shade.” Then drink, talk and rest. Invite someone if you can, as Horace did.',
          times: 1,
          prompt: 'What did it feel like to rest in the shade as a religious act?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'At the water’s edge',
      intro:
        'A few days to stop and decide. Neptune asks for respect and gratitude more than daily ritual, and a dedication to him is a promise to treat water as holy and to keep the vows you make on it. Stopping, pausing, or choosing another god or path is a good outcome.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'neptune-discern-walk',
          title: 'A walk by water',
          instructions:
            'On one of the three days, walk beside water: a river, canal, lake, the sea, or a public fountain. Keep a safe distance from the edge. Stand still for a few minutes and ask yourself the questions below.',
          times: 1,
          prompt: 'What did the water seem to say, and what did I answer?',
        },
      ],
      questions: [
        'Did the nine days of water feel like devotion, or like a chore with a glass attached? Either answer is useful.',
        'Can I keep the Neptunalia each July, and his glass of water fresh through the year?',
        'Am I comfortable with the formal Roman manner of prayer, and with making vows I must keep?',
        'How do I feel about the Greek myths and the Consualia story, and about a god powerful people tried to claim?',
        'Am I drawn to Neptune himself, or to the sea in general, or to another god, Poseidon, Janus or Fons, who might fit better?',
        'Would I rather keep giving thanks for water without dedicating? That is a perfectly good choice.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication',
      intro:
        'If you have decided to go ahead, hold this near water, ideally in the shade on 23 July, the Neptunalia, or after you come home safely from a journey over water. It is a self-dedication, not an initiation, and it does not make you a flamen or priest. You are dedicating yourself as a devotee who gives thanks for water, cares for it, and keeps the vows made on it.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Neptune',
        summary: 'Hands washed and head covered, Janus first, a prayer to Neptune with fresh water, wine and incense, a written dedication and vow, a leafy branch, and Vesta last.',
        minutes: 40,
        ingredients: [
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'Clean clothes, blue or white if you have them' },
          { name: 'A head covering' },
          { name: 'A jug of fresh, cold water and a glass' },
          { name: 'Wine or grape juice in a cup', ref: 'traditional/tool/chalice' },
          { name: 'A shallow offering dish', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Frankincense', ref: 'traditional/herb/frankincense' },
          { name: 'An incense burner', ref: 'traditional/tool/incense_burner' },
          { name: 'A blue or sea-green candle', ref: 'traditional/candle/blue' },
          { name: 'A leafy branch or pine sprig', ref: 'traditional/herb/pine' },
          { name: 'A small honey cake or piece of bread' },
          { name: 'Your written dedication and vow' },
        ],
        preparation:
          'If you can, hold the rite outdoors in shade, or set leafy branches around your shrine to make a small umbra. Write your dedication: who you are, that you dedicate yourself to Neptune as a devotee, for how long (a year is wise), and what you will do: keep the Neptunalia, keep his water fresh, pray before journeys over water and pay those vows, and one definite act of care for water through the year. Add one small vow, something you will give or do when the year is up. Read it aloud until it flows.',
        steps: [
          {
            title: 'Purify and veil',
            instructions: 'Wash your hands and face in the clean water. Put on clean clothes. Draw the covering over your head. Light the candle.',
            light: true,
          },
          {
            title: 'Janus first',
            instructions: 'Give incense and a drop of wine to Janus, so the way is open.',
            spoken: 'Father Janus, first of the gods in every prayer:\nbe honoured by this incense and this wine,\nand open the way to Neptune.',
          },
          {
            title: 'The invocation',
            instructions: 'Face the water, or the direction of the nearest river or sea. Raise your hands, palms up. Add incense.',
            spoken: 'Father Neptune, lord of the waters,\nof the spring in the drought and the sea under the keel,\nyou who calm the storm and bring the traveller home,\nor by whatever name it is right to call you:\nI offer you this incense, and I pray good prayers,\nthat you may be willing and favourable\nto me, my house and my household,\nand to all who travel on the waters.',
          },
          {
            title: 'Read the dedication',
            instructions: 'Read your dedication and vow aloud, clearly and in full. If you stumble on a word, stop and begin it again from the start.',
            minutes: 5,
          },
          {
            title: 'Offer',
            instructions: 'Fill the glass with fresh water and pour some into the dish. Pour wine beside it, and set the cake or bread there.',
            spoken: 'Neptune, be honoured by this water, this wine and this cake.\nAs I have spoken, so I will do.',
          },
          {
            title: 'The branch',
            instructions: 'Lay the leafy branch on the shrine with your written dedication beneath it. It stands for the shade of his festival and stays there until it dries; then replace it with a fresh one.',
          },
          {
            title: 'Silence',
            instructions: 'Sit quietly in the shade. If you are near water, listen to it.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'Name Vesta, turn to your right, uncover your head and put out the candle.',
            spoken: 'Vesta, keeper of the hearth, be honoured. It is done.',
            snuff: true,
          },
        ],
        closing:
          'Drink a glass of the fresh water yourself, slowly. Share the rest of the cake with someone if you can. Leave the god’s portion until evening, then pour the dish onto earth and put the cake in the compost; never into a river or the sea. Note the date for your rededication, or keep it at each Neptunalia.',
        safety:
          'If you hold the rite near water, stay well back from the edge, never go alone near deep, fast or tidal water, and do not enter the water. Never leave the candle or incense unattended, and keep them away from dry branches. Grapes, raisins and wine are toxic to dogs and cats; keep the dish out of their reach.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping faith with the waters',
      intro:
        'Neptune’s ongoing worship is steady and seasonal: fresh water on his shrine, prayers and vows before journeys over water, care for water in daily life, and the Neptunalia every July.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'neptune-ongoing-water',
          title: 'Fresh water for Neptune',
          instructions:
            'Once a week, or every day if you like, pour the old water from his glass onto a plant and refill it, with a word of thanks. Once a month, do one thing for water: a clean-up, a donation to a water charity or sea rescue service, a habit changed.',
          times: 12,
          every: 'month',
          prompt: 'What did I do for water this month?',
          premade: 'folk-lararium-offering',
        },
        {
          id: 'neptune-ongoing-passage',
          title: 'Before and after a journey over water',
          instructions:
            'Before any journey over water, pray in the Roman form for a safe passage and return for yourself and your companions, and vow a small, definite gift. When you are home, pay it, and mark it paid on the shrine card.',
          times: 1,
          prompt: 'Where did I travel, what did I vow, and have I paid it?',
          premade: 'sea-safe-passage-blessing',
        },
        {
          id: 'neptune-ongoing-neptunalia',
          title: 'The Neptunalia',
          instructions:
            'On 23 July, make an umbra of leafy branches, or sit in the shade of a tree. Make an offering of fresh water, wine and incense in the Roman form. Open a good bottle, as Horace did, share it with friends, and sing or read something about the sea. On 13 October, the Fontinalia, lay a garland beside a spring, well or fountain. Rededicate at the Neptunalia, reading your dedication and saying honestly how you kept it.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did the year’s water give me, and what did I give back?',
        },
      ],
    },
  ],
  sources: [
    'Livy, History of Rome 1.9, 22.10.9, 28.11.4 and 29.27.1–5 (Latin, The Latin Library: https://www.thelatinlibrary.com/liv.html); translations and paraphrases original',
    'Virgil, Aeneid 1.124–156, 3.119 and 5.235–243; Georgics 1.12–14 (Latin, The Latin Library: https://www.thelatinlibrary.com/verg.html); “Quos ego” is Aeneid 1.135',
    'Horace, Odes 1.5 and 3.28 (Latin, The Latin Library: https://www.thelatinlibrary.com/horace.html)',
    'Varro, On the Latin Language 5.72, 6.19 and 6.22 (Latin, The Latin Library: https://www.thelatinlibrary.com/varro.html; paraphrased)',
    'Festus, On the Meaning of Words, s.v. umbrae, on the leafy huts of the Neptunalia (paraphrased)',
    'Aulus Gellius, Attic Nights 13.23.2, Salacia Neptuni (paraphrased)',
    'Suetonius, Augustus 16.2 (paraphrased); Cassius Dio 48.48 and Appian, Civil Wars 5.100, on Sextus Pompeius (paraphrased)',
    'Ovid, Metamorphoses 4.798–803, 6.115–120 and 12.189–209 (paraphrased)',
    'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (London, 1981)',
    'John Scheid, An Introduction to Roman Religion (Edinburgh, 2003)',
    'Mary Beard, John North and Simon Price, Religions of Rome (Cambridge, 1998)',
  ],
};
