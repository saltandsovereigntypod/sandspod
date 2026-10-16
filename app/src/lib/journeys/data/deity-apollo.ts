import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-apollo',
  kind: 'deity',
  paths: ['hellenic', 'roman'],
  deityRef: 'traditional/deity/apollo',
  title: 'Apollo: Bow and Lyre',
  summary:
    'A lunar month with Apollo: his birth on Delos, the oracle at Delphi, purification and healing, the plague-bringing archer and his harder myths, and how to honour him on the seventh day with laurel, song and clean hands.',
  welcome: `This is a month of study and devotion with Apollo, god of the lyre and the bow, of prophecy, healing, purification and the young. He is one of the most widely worshipped Greek gods and one of the most demanding. He likes order, honesty, music and clean hands, and his myths are not all gentle.

It is a self-dedication, not an initiation. No priesthood or oracle stands behind it, and it does not replace any group’s initiation. Hellenic religion did not usually ask anyone to dedicate to one god; you are choosing a closer relationship with one of many.

You will need a bowl of water for purification, a little laurel (bay), incense and a willingness to practise something, whether music, writing or truthfulness, a little every day. His sacred number is seven, so his daily practice here runs for seven days.`,
  about: `Apollo was born on the island of Delos, son of Zeus and Leto and twin of Artemis. He killed the serpent Python at Delphi and made it the seat of the most famous oracle in the ancient world, where the Pythia spoke his words and the temple bore the maxims “Know yourself” and “Nothing in excess.” He was Phoibos, the bright and pure one; Paian, the healer, father of Asklepios; Mousagetes, leader of the Muses; and Hekatebolos, the far-shooter, whose arrows brought plague as well as ending it. Greeks honoured him on the seventh day of every month, at harvest festivals like the Pyanepsia and Thargelia, and with a stone pillar at the door of many houses. His identification with the sun is mostly later; the older sun god was Helios. Today Hellenic polytheists honour him with hymns, laurel and purification, and Roman polytheists honour him as healer and patron of the arts.`,
  notes: [
    'Apollo as the sun god is a later identification. Early Greeks kept Helios as the sun; the two merged gradually from the fifth century BCE and fully in Roman times. Both views appear today.',
    'His myths include violence and pursuit: the flaying of Marsyas, the killing of Niobe’s children, Daphne’s flight. The journey looks at them honestly.',
    'Apollo is a god of healing, but devotion never replaces medical care. Pray and see the doctor.',
    'Purification matters in his worship. The journey teaches khernips, the simple Greek hand-washing that comes first in every rite.',
  ],
  holyDays: ['noumenia', 'thargelia', 'pyanepsia'],
  stages: [
    {
      kind: 'threshold',
      title: 'Clean hands',
      intro:
        'Apollo is approached in purity and in order. So the journey begins with a clean space, washed hands, a sprig of laurel and an introduction. If you can, start on the Noumenia, the new crescent, which was also sacred to him as Apollo Noumenios.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'apollo-threshold-order',
          title: 'Set something in order',
          instructions:
            'Before the rite, put one corner of your home in order: clear a desk, tidy a shelf, wash the window that lets in the most light. Choose the place where his shrine will go.',
          times: 1,
          prompt: 'What did it feel like to make one place clean and ordered?',
        },
      ],
      rite: {
        title: 'Introduction with laurel and song',
        summary: 'Make khernips with a burning bay leaf, begin with Hestia, greet Apollo with incense and a few spoken or sung lines, and pour a libation.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of fresh water', ref: 'traditional/vessel/bowl' },
          { name: 'A dry bay leaf to burn and quench', ref: 'traditional/herb/bay' },
          { name: 'A white or gold candle' },
          { name: 'Frankincense', ref: 'traditional/herb/frankincense' },
          { name: 'A cup of wine, water, or milk with honey' },
          { name: 'A dish for the libation', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A sprig of fresh bay laurel', ref: 'traditional/herb/bay', optional: true },
        ],
        preparation:
          'Clean the shrine place. Wash and dress in clean clothes. Set the bowl of water, the candle, incense, libation and dish in order. Choose a few lines to say or sing: one of the Homeric hymns to Apollo, or a short song of your own.',
        steps: [
          {
            title: 'Make khernips',
            instructions:
              'Light the tip of the dry bay leaf and plunge it into the water. Wash your hands and sprinkle your face. Then sprinkle a few drops around the shrine.',
            spoken: 'Be gone, all that is unclean. Clean hands, clean place.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the candle and pour a drop for Hestia.',
            spoken: 'Hestia, first and last: I begin with you.',
            light: true,
          },
          {
            title: 'Call Apollo',
            instructions: 'Light the incense. Stand, raise your hands, palms up, and face the light if there is a window.',
            spoken:
              'Phoibos Apollo, son of Leto, far-shooter, Paian the healer, lord of the lyre: I am [your name]. I have not yet given you anything, so I give you this first, and ask only that you hear me. I have come to learn who you are.',
            minutes: 2,
          },
          {
            title: 'Song and libation',
            instructions:
              'Say or sing your chosen lines. Then pour most of the libation into the dish and lay the fresh bay sprig beside it. Stand quietly for a few minutes.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Pour the last drop for Hestia, thank them both, and put out the flame.',
            spoken: 'Hestia, last as you were first. Apollo, thank you.',
            snuff: true,
          },
        ],
        closing:
          'Pour the libation outside on earth and the khernips away outside or down the drain. Leave the bay sprig on the shrine. Write down how it felt to begin with purification.',
        safety:
          'Burn the bay leaf over the bowl and quench it fully; dry bay flares quickly. Never leave candle or incense unattended. Keep incense light near pets and anyone with asthma.',
      },
    },
    {
      kind: 'study',
      title: 'Learning the bright god',
      intro:
        'Ten days of reading: his birth and many powers, Delphi and prophecy, purification, healing and plague, and his harder myths.',
      days: 10,
      lessons: [
        {
          id: 'apollo-who',
          title: 'Born on Delos: the many-sided god',
          summary: 'Apollo’s birth, his origins, and the many powers the Greeks gave him.',
          minutes: 7,
          sections: [
            {
              heading: 'The birth',
              body: `The Homeric Hymn to Apollo, probably from the seventh or sixth century BCE, tells how Leto, pregnant by Zeus, wandered the whole Greek world looking for a place to give birth. Every land refused her, afraid of the mighty god she carried. Only the small rocky island of Delos accepted, and there, holding a palm tree, she gave birth to Apollo. His twin sister Artemis was born too.

As soon as the infant god was free of his swaddling bands, he spoke: “The lyre and the curved bow shall ever be dear to me, and I will declare to men the unfailing will of Zeus.” Music, archery and prophecy: those are his three first gifts, in his own words.`,
            },
            {
              heading: 'The god the gods rise for',
              body: `The same hymn opens with a striking image. When Apollo walks through the house of Zeus, “the gods tremble before him and all spring up from their seats when he draws near, as he bends his bright bow.” Only his mother Leto stays calm. She unstrings his bow, closes his quiver and hangs them on a golden peg, and Zeus gives him nectar.

That is Apollo in miniature: so powerful that the gods rise, and calmed by a mother’s hands. He is not a soft god. He is also not a cruel one. He is a power that needs to be met with respect and order.`,
            },
            {
              heading: 'Where he came from',
              body: `Apollo’s origins are uncertain. His name does not appear clearly in the earliest Greek writing, Linear B, though some scholars read a related name there. Some link him to Apaliunas, a god named in a Hittite treaty with Wilusa, which may be Troy. Others connect his name with the Dorian word apellai, assemblies at which young men were admitted into adult society. He may well be a blend of several gods.

What is certain is that by the archaic period he was everywhere: at Delos and Delphi, at Didyma and Claros in Asia Minor, as guardian of colonies, as protector of young men coming of age, who dedicated locks of their hair to him, and as a god of herds and wolves.`,
            },
            {
              heading: 'Not (at first) the sun',
              body: `Apollo is now often called the sun god, but early Greeks did not see him that way. The sun was Helios, who drove the sun’s chariot and saw everything. From the fifth century BCE some thinkers began to identify Apollo with the sun, perhaps because of his title Phoibos, bright. By Roman times the identification was common.

Both views are honoured today. Many Hellenic polytheists keep Apollo and Helios distinct; many modern Pagans honour Apollo as the sun. Know that the older Apollo is a god of light in the sense of clarity and purity, not of the sun’s disc.`,
            },
          ],
          knowAndDont: {
            known:
              'The Homeric Hymn to Apollo gives the Delos birth and his first words. His cult was widespread by the archaic period, with Delos, Delphi, Didyma and Claros as great centres. Hair dedications by young men are well attested. Helios was the sun in early Greek religion.',
            unknown:
              'Apollo’s origins and the meaning of his name are debated. The Hittite Apaliunas link is possible but unproven. When exactly ordinary worshippers began to think of him as the sun is unclear.',
          },
          inPractice:
            'Many devotees begin by reading the Homeric Hymn to Apollo aloud, all or in part, and keep a small palm frond or image of Delos on the shrine in memory of the birth.',
          reflect: [
            'Which of his three first gifts, lyre, bow or prophecy, draws you most?',
            'What do you make of a god the gods stand up for?',
          ],
          further: [
            'Homeric Hymn III to Apollo, trans. H. G. Evelyn-White (1914)',
            'Fritz Graf, Apollo (2009)',
            'Walter Burkert, Greek Religion (1985)',
          ],
          library: ['traditional/deity/apollo', 'traditional/deity/artemis'],
        },
        {
          id: 'apollo-delphi',
          title: 'Delphi: the oracle and the maxims',
          summary: 'The serpent Python, the Pythia, how people consulted the oracle, and the sayings on the temple.',
          minutes: 7,
          sections: [
            {
              heading: 'The serpent and the shrine',
              body: `The hymn tells how Apollo came to Delphi, below Mount Parnassus, and killed a great she-serpent who lived by a spring there. The place took its name Pytho from the rotting (pythein) of her body, and Apollo became Pythios. In later stories the serpent is Python, a male guardian of an older oracle of Earth or Themis.

So Delphi began with a killing. Afterwards, the stories say, Apollo had to be purified himself, and went to the Vale of Tempe to be cleansed, returning crowned with laurel. Every eight years Delphi re-enacted the slaying and the purification in a festival called the Septerion.`,
            },
            {
              heading: 'The Pythia',
              body: `Apollo’s words at Delphi came through a woman, the Pythia. In the classical period she was an older woman of Delphi who lived a pure life. On consultation days she bathed in the Castalian spring, burned laurel and barley, and took her seat on a tripod in the inner part of the temple. Those who came to ask paid a fee, offered a cake called the pelanos and sacrificed a goat, which was first sprinkled with cold water: if it shivered, the god was willing.

At first she prophesied only on Apollo’s birthday, the seventh of the month Bysios, in spring; later, on the seventh of most months. Her answers could be plain or famously ambiguous. Apollo was called Loxias, often explained as “the oblique one.”`,
            },
            {
              heading: 'Know yourself, nothing in excess',
              body: `On the temple at Delphi were carved short sayings: gnōthi seauton, “know yourself,” and mēden agan, “nothing in excess.” A third was a single letter E, whose meaning puzzled even Plutarch, who served as a priest at Delphi and wrote a whole essay on it.

Later a longer list of around 147 Delphic maxims circulated, preserved by the anthologist Stobaeus and found inscribed as far away as Ai Khanoum in Afghanistan. They are short practical sayings, two or three words each in Greek: follow god, honour the gods, respect your parents, be kind to friends, keep a hold on pleasure. Many Hellenic polytheists use them as an ethical guide today. Translations vary, so it is worth reading a few versions of the list side by side.`,
            },
            {
              heading: 'Divination for you',
              body: `There is no Pythia today, and no one can speak for Apollo with her authority. Modern devotees use simpler forms of divination they feel he oversees: drawing lots, reading a passage at random, or the astragaloi, knucklebones once thrown at some of his sanctuaries. The key thing, and it is very Delphic, is to ask a clear question, to accept that answers can be oblique, and to remember that “know yourself” comes before any prophecy.`,
            },
          ],
          knowAndDont: {
            known:
              'The Homeric Hymn to Pythian Apollo tells the serpent story. Plutarch, a priest at Delphi, describes the Pythia’s procedure and the maxims, and Pausanias mentions the sayings on the temple. The longer maxim list survives in Stobaeus and an inscription at Ai Khanoum.',
            unknown:
              'How the Pythia actually entered her state is debated; the famous story of intoxicating vapours from a chasm has been argued for and against by geologists. The original meaning of the Delphic E is unknown. We cannot know which surviving oracles were really given and which were invented later.',
          },
          inPractice:
            'Choose three Delphic maxims and write them on a card for his shrine. Many devotees read one each morning. If you use divination, ask Apollo first with khernips and incense, ask one clear question, and write the answer down before interpreting it.',
          reflect: [
            'Which Delphic maxim do you most need? Which do you resist?',
            'Why might a god of truth answer obliquely?',
          ],
          further: [
            'Plutarch, On the E at Delphi and The Oracles at Delphi No Longer Given in Verse',
            'Michael Scott, Delphi: A History of the Center of the Ancient World (2014)',
            'Homeric Hymn III, the Pythian section',
          ],
          library: ['traditional/deity/apollo', 'traditional/herb/bay'],
        },
        {
          id: 'apollo-healing',
          title: 'Purifier, healer and plague-bringer',
          summary: 'Miasma and purification, Paian the healer, the arrows of plague, and how to pray in the Greek way.',
          minutes: 8,
          sections: [
            {
              heading: 'Miasma and the clean hand',
              body: `Greeks believed some things left a kind of pollution, miasma, on a person: contact with death or birth, and above all the shedding of blood. Miasma was not sin; it was more like dirt that kept you from approaching the gods until it was washed away. Apollo, himself purified after killing Python, became the great god of purification, katharsis.

In Aeschylus’ Eumenides, Apollo purifies Orestes after he kills his mother. In everyday religion, purification was much simpler: before any offering, Greeks washed their hands in khernips, water made holy by quenching a burning brand from the altar fire in it. That is what you did at the threshold rite, and you will do it every time.`,
            },
            {
              heading: 'Paian the healer',
              body: `Apollo was Paian, healer of gods and men, and the song of thanks and healing called the paean was sung to him. After the plague in the first book of the Iliad ends, the Greek youths “worshipped the god with song, hymning him and chaunting the joyous paean, and the god took pleasure in their voices.”

He was father of Asklepios, the great healing god, whose sanctuaries at Epidauros and elsewhere received the sick. In Athens Apollo was also Alexikakos, averter of evil, a title said to date from the great plague of 430 BCE. And at Rome, the first temple to Apollo was vowed as Apollo Medicus in 433 BCE during a plague.`,
            },
            {
              heading: 'The arrows of plague',
              body: `The same god sends plague. The Iliad opens with Apollo’s priest Chryses, whose daughter has been taken by Agamemnon, praying by the sea. In Samuel Butler’s translation he says: “If I have ever decked your temple with garlands, or burned your thigh-bones in fat of bulls or goats, grant my prayer, and let your arrows avenge these my tears upon the Danaans.” Apollo comes down from Olympus and sits apart from the ships “with a face as dark as night,” and for nine days his arrows bring disease on the Greek camp.

The Greeks understood that the power to heal and the power to harm are one power. Apollo is Smintheus, perhaps “lord of mice,” which carried disease. To call him healer is to ask that power to turn toward healing.`,
            },
            {
              heading: 'How to pray in his way',
              body: `Chryses’ prayer is also a perfect lesson in the shape of a Greek prayer. He calls the god by name and titles (“god of the silver bow,” “thou of Sminthe”) and names his places. He reminds the god of past offerings: “if I have ever…” Then he asks.

Scholars sometimes call this pattern “I give that you may give,” but it is less a bargain than a reminder of an ongoing relationship. Use the same pattern: name and titles, what you have given or done in the past, then what you ask. In your first prayers, when you have not yet given, say so honestly and offer first.`,
            },
          ],
          knowAndDont: {
            known:
              'Miasma and purification by khernips are well documented. The Iliad’s opening book shows both plague and paean. Apollo Medicus at Rome (Livy 4.25) and Apollo Alexikakos at Athens (Pausanias 1.3.4) are attested. Asklepios was widely worshipped as his son.',
            unknown:
              'The meaning of Smintheus is uncertain (mice, or a place called Sminthe). How strictly ordinary people observed rules of miasma likely varied. Whether the Alexikakos title really dates from 430 BCE is Pausanias’ report.',
          },
          inPractice:
            'Make khernips before every devotion to Apollo. When you ask for healing, use the old shape of prayer, then do your part: rest, see a doctor, take your medicine. Many devotees dedicate their medical care and recovery to him as Paian.',
          reflect: [
            'What feels like miasma in your life, something you want washed off before you come to the gods?',
            'How do you feel about a god whose healing and harming are one power?',
          ],
          further: [
            'Homer, Iliad book 1, trans. Samuel Butler (1898), free on Project Gutenberg',
            'Robert Parker, Miasma: Pollution and Purification in Early Greek Religion (1983)',
            'Aeschylus, Eumenides',
          ],
          library: ['traditional/deity/apollo', 'traditional/herb/bay', 'traditional/vessel/bowl'],
          premade: ['folk-khernips-libation', 'kitchen-healing-broth'],
        },
        {
          id: 'apollo-dark',
          title: 'The harder myths',
          summary: 'Marsyas, Niobe, Koronis, Daphne, Cassandra and Hyakinthos, and how devotees hold them.',
          minutes: 7,
          sections: [
            {
              heading: 'Marsyas and Niobe',
              body: `The satyr Marsyas found a pipe that the goddess Athena had thrown away, learned to play it beautifully and challenged Apollo to a contest. Apollo won, partly by playing his lyre upside down, which the pipe could not do, and then had Marsyas flayed alive. The story was depicted again and again in ancient art.

Niobe, queen of Thebes, boasted that she had more children than Leto, who had only two. Apollo and Artemis shot down all of Niobe’s children. Niobe wept until she turned to stone. These are stories about hubris, pride that oversteps human limits, and they show how seriously Greeks took the gap between gods and mortals. They are also brutal, and many people struggle with them.`,
            },
            {
              heading: 'Koronis, Daphne and Cassandra',
              body: `Apollo’s loves often end badly. Koronis, pregnant with his son Asklepios, took a mortal lover; Apollo, or Artemis on his behalf, killed her, and he snatched the baby from her funeral pyre. Cassandra, a Trojan princess, was given prophecy by Apollo and then refused him; he cursed her so that no one would believe her.

The best-known story, of the nymph Daphne fleeing Apollo and being turned into a laurel tree, is told most fully by the Roman poet Ovid. It explains why the laurel is his, and it is a story of pursuit and escape. Read honestly, it is uncomfortable. The god of laurel crowns wears the tree of a woman who did not want him.`,
            },
            {
              heading: 'Hyakinthos and grief',
              body: `Not every story is of violence. Apollo loved the Spartan youth Hyakinthos, and while they were throwing the discus together the discus struck and killed him; in some versions the jealous wind Zephyros turned it. From his blood sprang a flower. Sparta held the Hyakinthia festival every year, beginning in mourning and ending in celebration. Kyparissos, another youth he loved, grieved so much for a pet stag he had killed by accident that he became the cypress.

Apollo grieves too. His myths of love between men were openly told and honoured in Greek religion.`,
            },
            {
              heading: 'Holding the myths',
              body: `Ancient Greeks themselves argued about these stories. Plato wanted many of them banned from his ideal city because they showed the gods behaving badly. Others read them as allegories. Many Hellenic polytheists today say the myths are not scripture: they are poetry about the gods, and cult, the honour actually given, is the heart of the religion.

You do not have to excuse Apollo, and you do not have to pretend the stories do not exist. Many devotees find it honest to say: this god is a vast power, not a moral example, and I approach him with respect and clear eyes. If the stories make it impossible for you to love him, that is a good thing to know before you dedicate.`,
            },
          ],
          knowAndDont: {
            known:
              'Marsyas, Niobe, Koronis, Cassandra and Hyakinthos are told in Greek sources (Homer, Pindar, Aeschylus, Herodotus, Euripides, and the later handbook of Apollodorus). Kyparissos is known mainly from Ovid’s Metamorphoses 10. Daphne’s story is fullest in Ovid’s Metamorphoses 1. Plato criticises such myths in the Republic.',
            unknown:
              'We cannot know how ordinary worshippers felt about these myths when they prayed. Ovid’s version of Daphne is a Roman literary retelling; earlier Greek versions differ and are fragmentary.',
          },
          inPractice:
            'Many modern devotees honour Hyakinthos and Kyparissos alongside Apollo, especially queer devotees. Some honour Marsyas or Cassandra in a small way as a reminder of the cost of his power.',
          reflect: [
            'Which of these stories troubles you most? Why?',
            'Can you approach a god as a power rather than a moral model? Do you want to?',
          ],
          further: ['Ovid, Metamorphoses books 1, 6 and 10', 'Plato, Republic books 2–3', 'Fritz Graf, Apollo (2009)'],
          library: ['traditional/deity/apollo', 'traditional/deity/artemis', 'traditional/herb/bay', 'traditional/herb/cypress'],
        },
      ],
      practices: [
        {
          id: 'apollo-study-maxims',
          title: 'A maxim a day',
          instructions:
            'Each day of this stage, read one Delphic maxim in the morning and notice it during the day. Start with “know yourself” and “nothing in excess.”',
          times: 10,
          every: 'day',
          prompt: 'Where did today’s maxim show up?',
        },
        {
          id: 'apollo-study-shrine',
          title: 'Set up his shrine',
          instructions:
            'Set up a clean, ordered shrine with a candle, a bowl for khernips, bay, incense, a lyre or other musical image, and a card of maxims.',
          times: 1,
          prompt: 'What does order on the shrine help you notice?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Seven days of practice',
      intro:
        'Seven is Apollo’s number: he was born on the seventh, and the seventh of every month was his. So this stage asks for seven days of practice and song, then a lesson on his days and offerings.',
      days: 10,
      lessons: [
        {
          id: 'apollo-days-offerings',
          title: 'His days, offerings and shrine today',
          summary: 'The seventh day, the Thargelia and Pyanepsia, what to give, his titles for prayer, and the modern communities.',
          minutes: 7,
          sections: [
            {
              heading: 'The seventh, and the new moon',
              body: `The seventh day of every month was Apollo’s birthday in the Athenian calendar, and he was called Hebdomagetes, “leader of the seventh.” The Noumenia, the new crescent, was also his as Apollo Noumenios. Modern Hellenists count the seventh from the Noumenia and give him incense, laurel and a hymn on that day.

His yearly festivals in Athens included the Thargelia in late spring, for Apollo and Artemis on their birthdays, with first fruits; and the Pyanepsia in autumn. The Thargelia also had a darker side: in some cities, one or two people chosen as pharmakoi, scapegoats, were led out of the city to carry away its pollution. Whether they were ever killed is debated; most likely they were driven out. Modern devotees keep the first fruits and leave the scapegoat in history.`,
            },
            {
              heading: 'The Pyanepsia',
              body: `At the Pyanepsia, on the seventh of the month Pyanepsion, in mid-autumn, Athenians cooked a pot of mixed beans and grains, the pyanion, and carried the eiresione, an olive branch hung with wool, figs, small loaves and jars of honey and oil, singing from door to door. The branch was hung above the door for the year, as a blessing against hunger.

This is one of the easiest ancient festivals to keep at home. Make a bean soup or stew. Tie wool and a few dried figs onto a branch or a sprig and hang it by your door, replacing last year’s.`,
            },
            {
              heading: 'What to give, and the pillar at the door',
              body: `Traditional offerings to Apollo include laurel, frankincense, honey cakes, first fruits of the harvest, wine poured as libation, and above all song and music. Young people dedicated locks of hair. As an Olympian, his offerings were burnt on a raised altar and the meat shared; modern devotees often eat the cake or fruit afterwards in celebration.

Many Greek houses had a conical pillar of Apollo Agyieus, “of the streets,” at the front door, alongside Hekate’s shrine. Some modern devotees set a small cone-shaped stone by their door in his honour, and anoint it with oil now and then.`,
            },
            {
              heading: 'Names and communities',
              body: `Good titles for prayer are Phoibos, bright; Paian, healer; Pythios, of Delphi; Delios, of Delos; Lykeios, of the wolf; Delphinios, of the dolphin, protector of sailors; Mousagetes, leader of the Muses; Hekatebolos, far-shooter; Alexikakos, averter of evil; and Agyieus.

Hellenic polytheists, such as the communities of YSEE in Greece and Hellenion in the United States, honour him with hymns, khernips and the monthly seventh. Roman polytheists honour him as healer and patron of the arts and keep the Ludi Apollinares in July. Eclectic Pagans often honour him as a sun god at midsummer. All of these are living practices.`,
            },
          ],
          knowAndDont: {
            known:
              'The seventh as his day, the Noumenia, Thargelia and Pyanepsia are well attested in Athenian sources. Plutarch describes the eiresione. The pharmakos ritual is described by several ancient authors. Agyieus pillars appear in Aristophanes and on vases.',
            unknown:
              'Details of the pharmakos rite, including whether anyone was ever killed, are debated. Modern hair dedications and cone-stone shrines are revivals of ancient practices rather than continuous customs.',
          },
          inPractice:
            'Mark the next Noumenia and count seven days to his monthly day. Plan the Pyanepsia or Thargelia if one falls in the next months. Keep a small branch for the eiresione.',
          reflect: ['Which of his titles fits how you have come to him?', 'What first fruits could you offer from your own work?'],
          further: [
            'Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year (1975)',
            'Robert Parker, Polytheism and Society at Athens (2005)',
          ],
          library: ['traditional/deity/apollo', 'traditional/herb/bay', 'traditional/herb/frankincense', 'traditional/crystal/citrine'],
          premade: ['folk-noumenia-blessing', 'cosmic-sunday-sun-success'],
        },
      ],
      practices: [
        {
          id: 'apollo-seven-days',
          title: 'Seven days of practice and song',
          instructions:
            'For seven days, begin each day with khernips, a candle and a pinch of incense at his shrine. Read or sing a few lines to him. Then practise something for at least fifteen minutes in his name: an instrument, singing, writing, drawing, or a health habit such as a walk. Before bed, write one true sentence about the day, even if it is uncomfortable.',
          times: 7,
          every: 'day',
          prompt: 'What did you practise? What true thing did you write?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Know yourself',
      intro: `Before any vow, Delphi’s first maxim: know yourself. Take a few days to look clearly at the month.

Stopping here is a good outcome. So is honouring Apollo on his seventh day without a dedication, or turning to another god, perhaps his sister Artemis or the Muses. A clear no is more Apollonian than an unclear yes.`,
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'apollo-discern-lot',
          title: 'Ask and listen',
          instructions:
            'Make khernips and light incense. Ask Apollo, aloud, one clear question about whether to dedicate. Then sit in silence for ten minutes and write whatever comes. Do not treat it as a command; treat it as one voice in your discernment.',
          times: 1,
          prompt: 'What did you hear, from him or from yourself?',
        },
      ],
      questions: [
        'Have I met all of Apollo, including the archer of plague and the god of the harder myths? Do I still want to go on?',
        'Am I drawn to him, or to an image of perfect golden harmony? Is that enough?',
        'Can I keep his seventh day and his purification each month for a year?',
        'Does his love of order and truth feel like a support or a pressure?',
        'If I waited, would I feel relief or loss? What does that tell me?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication on the seventh',
      intro: `If you have chosen to go on, make your dedication on the seventh day of a lunar month, counted from the Noumenia. This is a self-dedication: your own promise. It is not an initiation and does not make you a priest. Traditions with priesthoods or initiations have their own rites, and this does not replace them.

Greek youths dedicated a lock of hair to Apollo when they came of age. If it feels right, you can offer a small lock too; it is entirely optional.`,
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Apollo',
        summary: 'Purify carefully, begin with Hestia, call Apollo by his titles, sing or recite, make your promise with laurel, and close in order.',
        minutes: 45,
        ingredients: [
          { name: 'A bowl of fresh water and a dry bay leaf for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A white or gold candle' },
          { name: 'Frankincense', ref: 'traditional/herb/frankincense' },
          { name: 'Wine or water with honey for the libation' },
          { name: 'A honey cake or fruit', ref: 'traditional/vessel/dish' },
          { name: 'A sprig or small wreath of bay laurel', ref: 'traditional/herb/bay' },
          { name: 'A small lock of hair, if you wish', optional: true },
          { name: 'Your written promise and a hymn or song to perform' },
        ],
        preparation:
          'Clean the shrine and room carefully. Bathe and dress in clean clothes. Write a promise: for example, to keep his seventh day, to purify before coming to the gods, to practise your art, to seek truth and to care for your health. Prepare a hymn, poem or song, your own or a public-domain one, and practise it.',
        steps: [
          {
            title: 'Purify',
            instructions: 'Light the bay leaf, quench it in the water, wash your hands and face, and sprinkle the shrine.',
            spoken: 'Be gone, all that is unclean. Clean hands, clean place, clean heart.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the candle and pour a drop for Hestia.',
            spoken: 'Hestia, first and last: I begin with you.',
            light: true,
          },
          {
            title: 'Call Apollo',
            instructions: 'Light the incense. Stand, raise your hands, palms up.',
            spoken:
              'Phoibos Apollo, Paian, Pythios, Delios, Mousagetes, far-shooter, son of Leto: hear me. If ever I have made you a song, poured you a libation or kept your seventh day, hear me now. I come to make a promise.',
            minutes: 2,
          },
          {
            title: 'Offer song',
            instructions: 'Perform your hymn, poem or song. Do it fully; it does not need to be perfect.',
            minutes: 5,
          },
          {
            title: 'Make your promise',
            instructions:
              'Read your promise aloud. Pour most of the libation, set the cake before him, lay the laurel on the shrine. If you are offering hair, place it there too.',
            spoken: 'This I promise freely. May I keep it with clean hands and an honest tongue.',
          },
          {
            title: 'Close with Hestia',
            instructions: 'Pour the last drop for Hestia, thank them both and put out the flame.',
            spoken: 'Hestia, last as you were first. Apollo, thank you.',
            snuff: true,
          },
        ],
        closing:
          'You may eat part of the cake in celebration, as Greeks shared the feast of the Olympians. Pour the libation outside. Keep the laurel on the shrine until it dries, then burn a leaf of it in next month’s khernips. Bury or keep any hair you offered. Write down your promise and what you felt.',
        safety:
          'Quench the burning bay fully over the water. Never leave candle or incense unattended. If you cut hair, use clean scissors and a tiny lock.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping his day',
      intro: `Your devotion now lives in the month. Purify before each devotion. Keep the seventh day with incense, laurel and song. Greet him at the Noumenia. Keep the Pyanepsia in autumn and the Thargelia in spring if you can.

Once a year, on the seventh nearest your dedication, renew your promise, revise it or set it down with thanks. If you drift, wash your hands, light a candle and sing him something. That is always a good place to begin again.`,
      days: 30,
      lessons: [],
      practices: [
        {
          id: 'apollo-ongoing-seventh',
          title: 'His monthly seventh',
          instructions: 'On the seventh day of each lunar month, purify, give incense and laurel, and offer a song or a piece of your practice.',
          times: 12,
          every: 'month',
          prompt: 'What did you practise this month? What truth did you face?',
        },
        {
          id: 'apollo-ongoing-festivals',
          title: 'Pyanepsia and Thargelia',
          instructions: 'Keep the Pyanepsia with bean soup and an eiresione branch, and the Thargelia with first fruits.',
          times: 2,
          every: 'holy-day',
        },
        {
          id: 'apollo-ongoing-rededicate',
          title: 'Yearly rededication',
          instructions: 'Repeat the dedication rite on the seventh nearest your dedication date.',
          times: 1,
          every: 'month',
          prompt: 'How has a year with Apollo changed you?',
        },
      ],
    },
  ],
  sources: [
    'Homeric Hymn III to Apollo, trans. H. G. Evelyn-White (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (quoted: “The lyre and the curved bow shall ever be dear to me, and I will declare to men the unfailing will of Zeus”; “the gods tremble before him and all spring up from their seats when he draws near, as he bends his bright bow”)',
    'Homer, Iliad book 1, trans. Samuel Butler (1898), Project Gutenberg #2199: https://www.gutenberg.org/ebooks/2199 (quoted: Chryses’ prayer; “with a face as dark as night”; “worshipped the god with song, hymning him and chaunting the joyous paean, and the god took pleasure in their voices”)',
    'Plutarch, On the E at Delphi; The Oracles at Delphi No Longer Given in Verse; Greek Questions 9 (the Pythia on the seventh of Bysios)',
    'Stobaeus, Anthology 3.1.173, the list of Delphic maxims attributed to Sosiades',
    'Pausanias, Description of Greece 1.3.4, 10.24.1; Livy 4.25',
    'Aeschylus, Eumenides; Ovid, Metamorphoses 1, 6, 10; Plato, Republic 2–3',
    'Fritz Graf, Apollo (2009)',
    'Robert Parker, Miasma (1983) and Polytheism and Society at Athens (2005)',
    'Michael Scott, Delphi (2014)',
    'Walter Burkert, Greek Religion (1985)',
  ],
};
