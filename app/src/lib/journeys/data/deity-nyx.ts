import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-nyx',
  kind: 'deity',
  paths: ['hellenic', 'wheel'],
  deityRef: 'traditional/deity/nyx',
  title: 'Nyx: Mother Night',
  summary:
    'A lunar month with Nyx, primordial Night, one of the first beings in Greek cosmology: her place in Hesiod and the Orphic theogonies, the honest truth that she had almost no cult, how people honour her now, and nine nights of sitting in the dark.',
  welcome: `This is a month with Nyx, the Greek goddess who is Night itself. She is older than the Olympians and older than the Titans, one of the first beings to come out of Chaos. Even Zeus, Homer says, was afraid to anger her. She is the mother of Sleep and Death, of Dreams and the Fates, and her house stands at the edge of the world.

Here is the honest part, up front. Nyx was honoured in poetry and philosophy far more than in worship. We know of one oracle, one statue in a temple, a hymn, and very little else. Almost everything people do for her today is modern, built on a few old texts and on the experience of the night itself. This journey tells you exactly where the old ends and the new begins.

It is a self-dedication, not an initiation. It is best begun near a new moon, when the nights are darkest. You need a room you can make properly dark, a small lamp, a bowl of water, a blanket, and the willingness to sit in the dark and do very little.`,
  about: `In Hesiod’s Theogony, from around 700 BCE, the world begins with Chaos, the yawning gap; then Earth, Tartarus and Eros; and “from Chaos came forth Erebus and black Night.” Night joins with Erebus, the darkness below, and gives birth to Aether, the bright upper air, and to Day. Alone she bears a long list of powers: Doom, Fate and Death, Sleep and the tribe of Dreams, Blame and Woe, the Hesperides, the Fates, Nemesis, Deceit, Friendship, Old Age and Strife. Her house is at the edge of the world near Tartarus, where Night and Day greet each other at a bronze threshold as one goes in and the other comes out. In the Iliad, Zeus himself holds back his anger rather than displease her. In the Orphic poems she becomes greater still: a primeval mother who gives oracles from her cave, advises Zeus, and in some versions lays the cosmic egg from which Love was born. But her cult was tiny: an oracle of Night at Megara, a statue in the temple of Artemis at Ephesus, an Orphic hymn with torches. Today a small number of Hellenic polytheists, witches and night-lovers honour her with darkness, silence, rest and stargazing. That devotion is real and largely modern, and it is gentle: Nyx is the goddess of the rest you need and the mystery you cannot see past.`,
  notes: [
    'Evidence for actual worship of Nyx is very slim. Most devotional practice is modern and says so.',
    'The Orphic theogonies survive in fragments and late sources. Their picture of Night as an oracle and first mother is ancient but specialised, not mainstream Greek belief.',
    'Sitting in darkness is restful for most people, but if you have panic attacks, PTSD, or feel unsafe in the dark, keep a dim light on, sit near the door, and stop whenever you need to.',
    'Night practice is not treatment for insomnia, depression or anxiety. If sleeplessness or low mood persist, please see a doctor.',
    'The poppy belongs to her son Hypnos as a symbol. Do not eat or brew poppy plants or pods; they can be dangerous.',
  ],
  holyDays: ['deipnon', 'noumenia', 'yule'],
  stages: [
    {
      kind: 'threshold',
      title: 'When the lights go out',
      intro:
        'The Orphic hymn to Night was sung with torches. So the journey begins after dark with a small light, which you then put out, and an introduction spoken into the dark. You are introducing yourself, not promising anything.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'nyx-threshold-dark',
          title: 'Make a dark room',
          instructions:
            'Before the opening rite, find out how dark you can make one room. Turn off every light, cover glowing standby lights with tape or a cloth, close curtains, and put your phone in another room. Sit for two minutes and notice what light remains: streetlights, a crack under the door, the sky. You do not need perfect darkness, only less light than usual.',
          times: 1,
          prompt: 'How dark could I make it? What did I notice when the lights went out?',
        },
      ],
      rite: {
        title: 'An introduction in the dark',
        summary:
          'A short rite after dark: purify, begin with Hestia, light two small lights for the Orphic hymn’s torches, greet Nyx, pour a little water and honey in silence, then put out the lights and sit in the dark.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of fresh water for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A match, or a sprig of bay or rosemary to quench in it', ref: 'traditional/herb/bay' },
          { name: 'Two tealights or small lamps, or electric candles' },
          { name: 'A small cup of water with a little honey stirred in' },
          { name: 'A dark bowl or dish to pour into', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A blanket or shawl' },
          { name: 'A dark cloth for the table', optional: true },
        ],
        preparation:
          'Choose a time well after sunset. Prepare your dark room. Set the two lights side by side on a dark cloth, with the cup and bowl in front. Wash your face and hands in ordinary water. Wrap yourself in the blanket.',
        steps: [
          {
            title: 'Make khernips',
            instructions:
              'Light the match or the tip of the bay sprig and plunge it into the bowl of water. Wash your hands in it and touch a few drops to your face.',
            spoken: 'With clean hands I come to the night.',
          },
          {
            title: 'Begin with Hestia',
            instructions:
              'Light the first light for Hestia, whose fire makes the house safe in the dark.',
            spoken: 'Hestia, first and last, keeper of this house, I begin with you.',
            light: true,
          },
          {
            title: 'Light the torch for Night',
            instructions:
              'Light the second light from the first. The Orphic Hymn to Night was offered with torches, an odd and lovely thing: light given to the darkness.',
            spoken:
              'Nyx, Night, mother of Sleep and Dreams, first-born out of Chaos, you whom even Zeus would not displease: I am [your name]. I light this small light for you, and then I will give you the dark.',
            minutes: 2,
          },
          {
            title: 'Pour in silence',
            instructions:
              'Pour the honey-water into the bowl without speaking. Many modern devotees honour Night in silence.',
          },
          {
            title: 'Give her the dark',
            instructions:
              'Put out both lights, or turn off the electric candles. Sit wrapped in the blanket in the dark. Breathe slowly. Do nothing. Let your eyes adjust.',
            minutes: 5,
            timed: true,
            snuff: true,
          },
          {
            title: 'Close',
            instructions:
              'When you are ready, say quietly that you are leaving. Turn on one small light, not a bright one, and speak Hestia’s name.',
            spoken: 'Night, thank you for your quiet. Hestia, last as you were first.',
          },
        ],
        closing:
          'Leave the bowl until morning, then pour it outside onto earth. Pour the khernips away. Go to bed without looking at a screen if you can. In the morning, write a few lines about what the dark was like, and anything you dreamed.',
        safety:
          'Never leave a flame unattended, and put candles out fully before sitting in the dark; use electric candles if you are worried about knocking one over. Clear a path to the light switch and the door before you begin. If the dark becomes frightening, turn on a light at once; that is fine.',
      },
    },
    {
      kind: 'study',
      title: 'Before the gods',
      intro:
        'About ten days of reading, one lesson every two or three days, each read in the evening if you can. First Night in Hesiod and Homer, then in the Orphic poems, then the very little we know of her worship and how people honour her now.',
      days: 10,
      lessons: [
        {
          id: 'nyx-hesiod',
          title: 'Night in Hesiod and Homer',
          summary: 'Her birth from Chaos, her children, her house at the edge of the world, and the night Zeus held back.',
          minutes: 7,
          sections: [
            {
              heading: 'Out of Chaos',
              body: `Hesiod’s Theogony is the oldest Greek account of how the gods came to be, composed around 700 BCE. It begins: “Verily at the first Chaos came to be.” Chaos here does not mean disorder. It means a yawning gap, an open space. Next came Earth, Tartarus and Eros. Then, Hesiod says, “from Chaos came forth Erebus and black Night; but of Night were born Aether and Day, whom she conceived and bare from union in love with Erebus.”

So Night is among the very first beings. She is older than the sky god Ouranos, older than the Titans, much older than Zeus. And she is the mother of light: the bright upper air and the day itself are her children. In Greek thought, darkness does not oppose light. It gives birth to it.`,
            },
            {
              heading: 'Her children',
              body: `Hesiod gives Nyx a remarkable family. “And Night bare hateful Doom and black Fate and Death, and she bare Sleep and the tribe of Dreams.” Alone, without a partner, she also bore Blame and Woe, the Hesperides who guard the golden apples at the edge of the world, the Fates Clotho, Lachesis and Atropos, Nemesis, Deceit, Friendship, Old Age and Strife.

It is a strange mixture, and that is the point. Night holds everything that comes upon us unseen: sleep and dreams, death and fate, love and quarrels, old age, the sense that something must be paid for. None of these can be seen coming. They arrive, like night, whether we are ready or not. To honour Nyx is to accept that much of life happens in the dark.`,
            },
            {
              heading: 'The house of Night',
              body: `Later in the Theogony, Hesiod describes the edge of the world, near Tartarus. “There stands the awful home of murky Night wrapped in dark clouds.” In front of it, Atlas holds up the sky, “where Night and Day draw near and greet one another as they pass the great threshold of bronze: and while the one is about to go down into the house, the other comes out at the door.” The house never holds them both. One always travels over the earth while the other waits at home.

Night, Hesiod says, “holds in her arms Sleep the brother of Death.” Sleep and Death live there too. Sleep wanders the earth gently and is kind to people; Death has a heart of iron. It is one of the most beautiful passages in early Greek poetry, and many devotees read it aloud at dusk.`,
            },
            {
              heading: 'The goddess Zeus feared',
              body: `In Homer’s Iliad, there is a revealing moment. Hera asks Sleep to put Zeus to sleep so she can help the Greeks behind his back. Sleep refuses at first, because he did it once before and Zeus woke furious, hurling gods around the palace. Sleep says Zeus would have thrown him into the sea, “had not Night who cows both men and gods protected me. I fled to her and Jove left off looking for me in spite of his being so angry, for he did not dare do anything to displease Night.” (The translator Samuel Butler used Jove for Zeus.)

It is a rare moment in Homer: the king of the gods backs down out of respect for another power. Nyx is a power even the king of the gods will not cross. That is worth keeping in mind. She is gentle, as sleep is gentle, but she is not small.`,
            },
          ],
          knowAndDont: {
            known:
              'Hesiod’s Theogony (116–125, 211–225, 744–766) gives Nyx’s birth, children and house. Homer’s Iliad (14.256–261) shows Zeus refusing to displease her. These are among the oldest Greek texts we have.',
            unknown:
              'We do not know how many ordinary Greeks thought of Night as a goddess to be prayed to, rather than a cosmic power in poetry. Hesiod’s list of her children may combine several older traditions.',
          },
          inPractice:
            'Many devotees read Hesiod’s passage on the house of Night aloud at dusk, when Night and Day meet at their threshold. Try this once this week, standing at a window as the light goes.',
          reflect: [
            'What does it mean to you that, for the Greeks, Night gave birth to Day?',
            'Which of Night’s children has come to you most strongly in your life?',
          ],
          further: [
            'Hesiod, Theogony, trans. H. G. Evelyn-White (1914), free on Project Gutenberg',
            'Homer, Iliad book 14, trans. Samuel Butler (1898), free on Project Gutenberg',
            'M. L. West (ed.), Hesiod: Theogony (1966), the standard commentary',
          ],
          library: ['traditional/deity/nyx', 'traditional/deity/hades'],
        },
        {
          id: 'nyx-orphic',
          title: 'Night in the Orphic poems',
          summary: 'The oracle in the cave, the egg of Night, the Derveni papyrus, and the Orphic hymn with torches.',
          minutes: 7,
          sections: [
            {
              heading: 'What the Orphic poems were',
              body: `Alongside Hesiod, the Greeks had other stories of how the world began. Some were attributed to Orpheus, the legendary singer who went down to the underworld. These Orphic poems were used by small religious groups, often with mystery rites, and they gave Night a much larger role than Hesiod did. Most survive only in fragments quoted by later writers, especially Neoplatonist philosophers of the fifth and sixth centuries CE.

That means care is needed. The Orphic tradition is real and ancient, but it was the belief of particular groups, not of most Greeks. And it changed over time: there were several Orphic theogonies, not one.`,
            },
            {
              heading: 'The Derveni papyrus',
              body: `In 1962, at Derveni in northern Greece, archaeologists found a charred papyrus roll in the remains of a funeral pyre from around 340 BCE. It is the oldest surviving Greek book. It contains a philosophical commentary on an Orphic poem about the origin of the gods, and that poem was clearly older still, perhaps from the fifth century BCE or earlier.

In it, Night has an adyton, an inner shrine, from which she gives oracles. Zeus goes to her to learn how to rule. She is honoured there as a nurse of the gods, and she prophesies what he must do. So in this old Orphic tradition, Night is a source of wisdom and prophecy, a counsellor to the king of the gods.`,
            },
            {
              heading: 'The egg and the cave',
              body: `In later Orphic poems, the Rhapsodies, Night is the daughter, partner or successor of Phanes, the first-born god of light. She rules the world after him, gives oracles from her cave, and hands power to Ouranos. Zeus asks her how all things can be one and yet each separate, and she answers him.

Another version is preserved, half in jest, in Aristophanes’ comedy the Birds of 414 BCE. The birds claim that in the beginning black-winged Night laid a wind-egg in the depths of Erebus, and from it hatched Eros, golden-winged Love. Aristophanes was parodying an Orphic-style cosmogony, which means his audience recognised the idea. Night as the first mother who lays the egg of the world was already familiar in Athens.`,
            },
            {
              heading: 'The hymn with torches',
              body: `The collection known as the Orphic Hymns, probably composed in Asia Minor in the Roman period, includes a hymn to Night. Thomas Taylor’s 1792 translation begins: “Night, parent goddess, source of sweet repose, from whom at first both Gods and men arose.” The hymn calls her the friend of dreams and rest, who dissolves anxious cares, and asks her to be present and kind, dispelling the fears of the dark.

Each Orphic hymn names the incense to burn with it, and for Night the instruction is torches. It is the oddest and most moving detail: the hymn to darkness was sung by firelight. This hymn is the closest thing we have to an ancient prayer to Nyx, and modern devotees use it more than any other text.`,
            },
          ],
          knowAndDont: {
            known:
              'The Derveni papyrus (c. 340 BCE, quoting an older poem) shows Night giving oracles to Zeus. Aristophanes, Birds 693–702, parodies the egg of Night. Fragments of the Orphic Rhapsodies are preserved by Proclus and Damascius. The Orphic Hymn to Night survives with its torch instruction.',
            unknown:
              'The Derveni text is damaged and much debated. The Rhapsodies are known only in late quotations, and their date is uncertain. We do not know who sang the Orphic Hymns, or how often Night’s hymn was used.',
          },
          inPractice:
            'Modern devotees often read the Orphic Hymn to Night by the light of two small candles, then put them out. Read it once this week in a public-domain translation, ideally Taylor’s, and notice how gentle it is.',
          reflect: [
            'What does it mean that Night, in these poems, gives wisdom even to Zeus?',
            'How do you feel about honouring a goddess mainly known through philosophy and poetry?',
          ],
          further: [
            'Thomas Taylor (trans.), The Hymns of Orpheus (1792), the hymn to Night',
            'Gábor Betegh, The Derveni Papyrus: Cosmology, Theology and Interpretation (2004)',
            'M. L. West, The Orphic Poems (1983)',
            'Aristophanes, Birds 693–702',
          ],
          library: ['traditional/deity/nyx', 'traditional/deity/dionysus', 'traditional/deity/persephone'],
        },
        {
          id: 'nyx-cult',
          title: 'Almost no cult: the honest record',
          summary: 'The oracle at Megara, the statue at Ephesus, the chest of Kypselos, and what all that silence means.',
          minutes: 6,
          sections: [
            {
              heading: 'Three traces',
              body: `If you look for temples, festivals or priestesses of Nyx in ancient Greece, you will find almost nothing. Here is nearly all of it. Pausanias, the travel writer of the second century CE, says that on the acropolis of Megara, near Athens, there was an oracle of Night. He gives no details of how it worked. He also says that at Ephesus, in the sanctuary of Artemis, a statue of a woman by Rhoikos, an early sculptor of the sixth century BCE, stood on a wall above an altar, and that the Ephesians called it Night. He found it older and rougher in workmanship than anything he had just described.

And at Olympia Pausanias saw the chest of Kypselos, an ancient carved and inlaid cedar chest, on which a woman was shown holding a white child asleep on her right arm and a black child who seemed to be asleep on her left, each with his feet turned different ways. The inscriptions, Pausanias says, named them Death and Sleep, with Night the nurse of both. That is a picture, not a cult, but it shows how she was imagined.`,
            },
            {
              heading: 'Why so little',
              body: `Why was such a great power so little worshipped? Partly because the primordial beings in general, Chaos, Earth, Night, Ouranos, were seen as belonging to the deep past. They had been there before the order of Zeus, and they did not take part in the ordinary give and take of sacrifice. Gaia, Earth, was the exception, and even she had a modest cult.

Partly, too, because Night was everywhere. Every Greek lived with her every evening. She did not need a temple to be present. Nyx may have been honoured in ways too ordinary to be recorded: a word at nightfall, a prayer for safe sleep, the hush of a house going to bed. We cannot know. Honesty means not inventing what we lack.`,
            },
            {
              heading: 'The Romans',
              body: `The Romans called her Nox. Like the Greeks, they gave her a place in poetry rather than in public cult. Virgil describes black sheep sacrificed to Night, the mother of the Furies, in the Aeneid when the Sibyl leads Aeneas into the underworld. In that passage Night is grouped with the underworld powers, Hekate and Proserpina among them. That is a literary scene, but it suggests that when Romans did make offerings to Night, they treated her as a power of the dark below.

There is also Nyx’s role in philosophy. The philosopher Parmenides, in the fifth century BCE, describes a journey to the gates of Night and Day, where a goddess teaches him the truth. Night became an image of the threshold of knowledge, the place you must pass through to learn what is really so.`,
            },
            {
              heading: 'What this means for you',
              body: `It means that if you honour Nyx, you are mostly creating your own practice, guided by the old texts and by the night itself. That is not a weakness. It is a reason to be humble and honest, to call your practice what it is, and not to claim ancient authority for it.

It also means that the most traditional things you can do are the simplest: honour her at night, in quiet, with a little light given and then taken away; read Hesiod and the Orphic hymn; ask for safe sleep and true dreams; and treat her with the respect that even Zeus showed.`,
            },
          ],
          knowAndDont: {
            known:
              'Pausanias mentions the oracle of Night on the acropolis of Megara (1.40.6), the statue by Rhoikos that the Ephesians called Night (10.38.6–7) and the chest of Kypselos (5.18.1). Virgil, Aeneid 6.249–251, has a black lamb sacrificed to the mother of the Eumenides. Parmenides’ proem describes the gates of Night and Day.',
            unknown:
              'How the Megara oracle worked, who used it and when are all unknown. We do not know whether ordinary Greeks prayed to Nyx at night. Any claim of an ancient Nyx festival or ritual should be treated with suspicion.',
          },
          inPractice:
            'Hellenic polytheists who honour Nyx mostly do so with very simple night rites: a hymn, incense or torches, a libation in silence. Set up her shrine this week, keeping it as simple and dark as the evidence.',
          reflect: [
            'How do you feel about building a devotion where so little is known?',
            'What ordinary night-time acts might have been prayers that nobody wrote down?',
          ],
          further: [
            'Pausanias, Description of Greece 1.40.6, 5.18.1 and 10.38.6–7, trans. W. H. S. Jones (1918–1935), free at theoi.com',
            'Virgil, Aeneid book 6',
            'Parmenides, fragment 1 (the proem)',
          ],
          library: ['traditional/deity/nyx', 'traditional/deity/hekate', 'traditional/deity/artemis'],
        },
        {
          id: 'nyx-today',
          title: 'Nyx today: rest, mystery and the dark sky',
          summary: 'Who honours her now, what is modern, rest as devotion, the vanishing night, and her shrine.',
          minutes: 7,
          sections: [
            {
              heading: 'Who honours her now',
              body: `Nyx has a small but devoted modern following. Some Hellenic polytheists include her in their household cult, honouring her at night with the Orphic hymn. Many witches and Pagans see her as a goddess of the night and of mystery, often honouring her at the dark moon or the winter solstice. Some practitioners work with her for dreams, divination and meditation. She also appears in novels, games and comics, which has brought a new generation to her name.

Almost all of this is modern. The dark-moon and solstice dates, the colours of black and deep blue, the crystals such as obsidian and labradorite, the owl as her animal: these are modern choices, made because they suit the night. They are fine to use. Just do not pass them on as ancient.`,
            },
            {
              heading: 'Rest as an offering',
              body: `The most practical way to honour Nyx is to let night be night. Many of us barely meet her. We fill the evening with screens, bright lights and noise, and go to bed late and wired. Simply switching things off, sitting in the dark for a while, and going to bed at a sensible hour is a real offering to the mother of Sleep.

If you work nights, care for small children or have a body that keeps strange hours, you can still honour her: a few minutes of darkness when you can get them, a blackout blind, a quiet word before sleep. And if sleep will not come for weeks, please see a doctor. The Orphic hymn calls her the one who dissolves anxious care; she would not want you to suffer alone.`,
            },
            {
              heading: 'The vanishing night',
              body: `Most people alive today have never seen a truly dark sky. Light pollution has hidden the Milky Way from most of the world’s population. For a goddess who is Night, this matters. Many devotees honour Nyx by protecting the dark: turning off unnecessary outdoor lights, choosing warm, shielded bulbs, supporting dark-sky parks and campaigns, and travelling once in a while to a place where the stars come back.

Stargazing is a natural devotion. Her children, in some traditions, include the stars; in any case they are hers to show. Go out on a clear, moonless night, let your eyes adjust for twenty minutes, and look up. It is very hard to feel important under a truly dark sky, and very easy to feel at home.`,
            },
            {
              heading: 'Her shrine',
              body: `Keep Nyx’s shrine simple. A dark cloth, perhaps with stars on it. A small lamp or two tealights, for the torches of the Orphic hymn. A dark bowl for water or libations. An image of the night sky, or of her veiled and winged. A poppy seed head as a dried decoration for Hypnos, never to be eaten. Your dream journal beside it.

Place it in your bedroom if you can, so that it is the last thing you see before sleep. Black, deep blue and dark purple, and stones such as obsidian, labradorite or lapis lazuli, are modern choices that suit her well. Lavender, which many people find calming at bedtime, is a gentle modern addition; use the dried flowers rather than essential oil if you live with cats, and never diffuse oils around pets.`,
            },
          ],
          knowAndDont: {
            known:
              'Modern devotion to Nyx is documented in Hellenic and Pagan communities. The effects of light pollution on the visibility of the night sky are well measured. Evening light exposure is known to affect sleep.',
            unknown:
              'Modern colours, crystals, animals and dates for Nyx have no ancient basis. Whether she was linked with stars in ancient cult, rather than poetry, is unknown.',
          },
          inPractice:
            'Set up her shrine, ideally in your bedroom. Choose one change to protect the dark this month: an outdoor light switched off, screens off an hour before bed, or a trip to see the stars. The app’s stargazing working pairs well with her.',
          reflect: [
            'How often do you actually meet the night? What gets in the way?',
            'What would it mean to treat rest as an offering rather than a reward?',
          ],
          further: [
            'Paul Bogard, The End of Night (2013), on light pollution',
            'DarkSky International, on protecting night skies',
          ],
          library: ['traditional/deity/nyx', 'traditional/crystal/obsidian', 'traditional/crystal/labradorite', 'traditional/herb/lavender', 'traditional/candle/indigo'],
          premade: ['cosmic-stargazing-name-your-star', 'hedge-dream-pillow'],
        },
      ],
      practices: [
        {
          id: 'nyx-study-read',
          title: 'Read her at dusk',
          instructions:
            'Once in this stage, at dusk, read Hesiod’s house of Night (Theogony 744–766) aloud at a window as the light goes. On another night, read the Orphic Hymn to Night by two small lights, then put them out.',
          times: 1,
          prompt: 'What did it feel like to read about Night as she arrived?',
        },
        {
          id: 'nyx-study-shrine',
          title: 'Set up her shrine',
          instructions:
            'After the fourth lesson, set up a small dark shrine, ideally in your bedroom: dark cloth, two small lights, a dark bowl, an image of the night sky, and your dream journal.',
          times: 1,
          prompt: 'What did I put on her shrine? What did I leave off?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights in the dark',
      intro:
        'Nine nights of sitting in the dark, then a lesson on offerings and care. This is the heart of the journey. It is very simple: light, a word, silence, darkness, sleep. Time it so the nights fall as the moon wanes, ending near the new moon.',
      days: 11,
      lessons: [
        {
          id: 'nyx-offerings',
          title: 'Offering to Night, and keeping safe in the dark',
          summary:
            'What to give Nyx, how to treat her offerings, the place of silence, and how to keep night practice safe and kind.',
          minutes: 6,
          sections: [
            {
              heading: 'What to give',
              body: `Because so little is known of her cult, offerings to Nyx are mostly chosen by analogy. The Orphic hymn asks for torches, so a small light, given and then put out, is the most grounded offering. Libations of water, honey-water, milk or dark wine or juice suit any Greek god. Incense such as myrrh or frankincense is common in modern practice. Poems, silence and darkness itself are fitting gifts.

The most meaningful offerings may not be things at all. An evening with the screens off. A whole night of good sleep. An hour under the stars. A dream written down. These are gifts she can actually receive.`,
            },
            {
              heading: 'Kept or given away?',
              body: `There is no ancient rule about whether offerings to Nyx were shared or left, because we have no description of them. In the Aeneid, offerings to Night are made with the underworld powers, and in Hesiod her house is by Tartarus. For that reason many modern devotees treat her offerings as Greeks treated offerings to the powers below: poured out, left, and not eaten or drunk afterwards.

That is a cautious modern choice, and this journey follows it. Pour her libations into a dark bowl, leave them overnight, and pour them onto earth in the morning. Do not drink them. If you give food, give a little and compost it the next day.`,
            },
            {
              heading: 'Silence',
              body: `Many devotees honour Nyx in silence, and the old texts make that feel right. She is the mother of Sleep, and the house of Night is the place where Day falls quiet. Speak to her briefly at the start, if you like, and then stop speaking. Let the silence be the prayer.

Silence in the dark can bring things up. Thoughts you have been avoiding may arrive. That is normal and often healing. Notice them, breathe, and let them pass. If something feels too big to sit with alone, turn on a light, write it down, and talk to someone you trust the next day.`,
            },
            {
              heading: 'Keeping safe and kind',
              body: `Night practice should be restful, not frightening. Before you begin each night, clear a path to the door and the light switch. Put candles out before you sit in the dark, or use electric ones. Keep a small torch beside you. If you have panic attacks, PTSD, or simply do not feel safe in the dark, keep a dim light on, sit near a door, or sit with someone you trust. Nyx protected Sleep from Zeus; she is not a goddess who wants you afraid.

If you go outside at night to stargaze, tell someone where you are going, choose safe places, dress warmly and take a light for the walk. And go to bed afterwards. The point of honouring Night is to rest in her, not to stay up all night proving your devotion.`,
            },
          ],
          knowAndDont: {
            known:
              'The Orphic Hymn to Night names torches as its offering. Virgil groups offerings to Night with those to the underworld powers. Hesiod places her house beside Tartarus.',
            unknown:
              'No ancient source tells us what individuals offered Nyx, or whether offerings were shared. The non-sharing custom here is a modern, cautious choice based on her associations with the world below.',
          },
          inPractice:
            'In the nine nights below, light a small light, speak briefly, pour a little in silence, put the light out and sit in the dark for five to ten minutes. Then go to bed and keep your dream journal by the shrine.',
          reflect: [
            'What came up in the silence this week?',
            'What does it feel like to give an offering you will never take back?',
          ],
          further: [
            'Thomas Taylor (trans.), The Hymns of Orpheus (1792)',
            'Jon D. Mikalson, Ancient Greek Religion (2nd ed., 2010), on offerings',
          ],
          library: ['traditional/deity/nyx', 'traditional/herb/myrrh', 'traditional/vessel/offering_bowl'],
          premade: ['cosmic-dark-moon-rest-shadow', 'hedge-dusk-rite'],
        },
      ],
      practices: [
        {
          id: 'nyx-nine-nights',
          title: 'Nine nights in the dark',
          instructions:
            'For nine nights, about an hour before bed, go to her shrine. Put your phone in another room. Wash your hands. Light one small light for Hestia and one for Night. Say one sentence to Nyx: her name, and one thing you are carrying into the night. Pour a little water or honey-water into her bowl in silence. Put out both lights and sit in the dark for five to ten minutes. Then go to bed without screens. In the morning, pour her bowl onto earth and write down any dreams.',
          times: 9,
          every: 'day',
          prompt: 'What did I carry into the night? What did the dark, or my dreams, give back?',
        },
        {
          id: 'nyx-practice-stars',
          title: 'A night under the stars',
          instructions:
            'Once in this stage, on a clear night, go somewhere as dark as you can safely reach. Let your eyes adjust for twenty minutes without looking at your phone. Look up. Greet Night silently.',
          times: 1,
          premade: 'cosmic-stargazing-name-your-star',
          prompt: 'What did I see when my eyes adjusted? How did it feel to be under her sky?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'At the bronze threshold',
      intro: `In Hesiod, Night and Day meet at a bronze threshold and greet each other as one goes in and the other comes out. You are at a threshold too. Take a few days, in daylight as well as at night, to look at the month honestly.

Stopping here is a good outcome. So is pausing, or deciding that Night is a presence you will honour quietly without a formal dedication, or turning to Selene, Hekate, another god, another path, or none. Choosing to rest is very much in her spirit.`,
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'nyx-discern-dusk',
          title: 'Watch the threshold',
          instructions:
            'One evening, watch the whole of dusk at a window or outside, from the sun going down until the first stars. Ask whether you want Nyx as a lasting part of your life. Notice how you feel as the dark arrives.',
          times: 1,
          prompt: 'As Night came in, what did I feel? Which answer felt true?',
        },
      ],
      questions: [
        'Did I keep the nine nights because I wanted to, or because I felt I should?',
        'Am I drawn to Nyx herself, or to an image of darkness and mystery? Is that enough for me?',
        'Am I at peace knowing that almost all my practice with her will be modern?',
        'Has sitting in the dark left me more rested, or more anxious? What does that tell me?',
        'Can I keep a simple night practice and a monthly dark-moon rite for a year, in my life as it is now?',
        'Would I be relieved or disappointed if I chose to wait? What does that tell me?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication in the dark',
      intro: `If you have chosen to go on, make your dedication on the night of the new moon, the darkest night of the month, or on the longest night of the year. If you keep Hekate’s Deipnon, you can keep it first and come to Nyx later that night.

This is a self-dedication, a promise you make on your own behalf. It is not an initiation, and it does not make you a priestess, an Orphic initiate or a member of any group. Groups that initiate have their own rites, and this does not replace them. Almost no one in the ancient world dedicated themselves to Nyx. You are doing something new, in an old and quiet spirit.`,
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Nyx',
        summary:
          'Purify, begin with Hestia, light the torches of the Orphic hymn, read Night’s hymn, make your promise, pour in silence, put out the lights, sit in the dark, and go to sleep.',
        minutes: 40,
        ingredients: [
          { name: 'A bowl of fresh water and a match or bay sprig for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'Two tealights or small lamps, or electric candles' },
          { name: 'A cup of honey-water, milk, or dark grape juice' },
          { name: 'Her dark bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A blanket or shawl' },
          { name: 'The Orphic Hymn to Night, printed or written out' },
          { name: 'Your written promise on a card' },
          { name: 'A little myrrh on a heatproof burner', ref: 'traditional/herb/myrrh', optional: true },
        ],
        preparation:
          'Write your promise in your own words, simple and doable: for example, to honour Night at each new moon, to protect my rest and the dark, to keep a dream journal, and to approach the unknown with respect rather than fear. Make your room as dark as you can. Clear a path to the door. Put your phone away. Wash and put on comfortable clothes for sleep.',
        steps: [
          {
            title: 'Purify',
            instructions:
              'Make khernips by quenching the flame in the water. Wash your hands and touch your face.',
            spoken: 'With clean hands I come to the night.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the first light, for Hestia.',
            spoken: 'Hestia, first and last, keeper of this house, I begin with you.',
            light: true,
          },
          {
            title: 'The torch for Night',
            instructions:
              'Light the second light from the first, as the Orphic hymn was offered with torches. Add a little myrrh if you are using it.',
          },
          {
            title: 'Read her hymn',
            instructions:
              'Read the Orphic Hymn to Night aloud, slowly, by the two lights. Then call her by the old names.',
            spoken:
              'Nyx, black Night, first-born out of Chaos, mother of Day and of the bright air, mother of Sleep and the tribe of Dreams, you whom even Zeus would not displease: hear me. This month I have sat in your dark. Now I come to make a promise.',
            minutes: 3,
          },
          {
            title: 'Make your promise',
            instructions: 'Read your promise aloud. Then pour the libation into her bowl without speaking.',
            spoken: 'This is my promise, made freely. Keep it in your quiet.',
          },
          {
            title: 'Give her the dark',
            instructions:
              'Put out both lights. Wrap yourself in the blanket. Sit in the dark in silence for as long as feels right, at least ten minutes.',
            minutes: 10,
            timed: true,
            snuff: true,
          },
          {
            title: 'Go to sleep',
            instructions:
              'When you are ready, say goodnight to her quietly and go to bed without turning on bright lights or screens. Sleep is the last part of this rite.',
            spoken: 'Goodnight, Mother Night. Hestia, last as you were first.',
          },
        ],
        closing:
          'In the morning, pour her bowl onto earth outside; do not drink it. Write down any dreams, and what you promised. Keep your written promise on her shrine and read it at each new moon.',
        safety:
          'Never leave a flame unattended, and put candles out fully before sitting in the dark or going to sleep; use electric candles if you might drift off. Keep a small torch beside you and a clear path to the door. Myrrh smoke can affect asthma and pets; let the room air before you sleep.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Every night',
      intro: `Your relationship with Nyx now lives in the night itself, which comes every day. Greet her at dusk now and then. Keep a few minutes of darkness before bed. Honour her more fully at the new moon, and on the longest night of the year if you follow the Wheel. Protect your rest and the dark sky where you can.

Once a year, on the new moon nearest your dedication or on the winter solstice, read your promise again and renew it, change it, or set it down with thanks. If you drift away, simply turn out the lights one evening and sit with her. Night always comes back.`,
      days: 30,
      lessons: [],
      practices: [
        {
          id: 'nyx-ongoing-newmoon',
          title: 'New moon in the dark',
          instructions:
            'At each new moon, light two small lights, read the Orphic hymn, pour for her in silence, put the lights out and sit in the dark.',
          times: 12,
          every: 'month',
          prompt: 'What did the dark hold this month?',
        },
        {
          id: 'nyx-ongoing-rest',
          title: 'A weekly night of rest',
          instructions:
            'Once a week, switch off screens an hour before bed, sit for a few minutes in the dark, and go to bed early, as an offering to the mother of Sleep.',
          times: 52,
          every: 'week',
          prompt: 'How did I sleep? What did I dream?',
        },
        {
          id: 'nyx-ongoing-rededicate',
          title: 'Yearly rededication',
          instructions:
            'On the new moon nearest your dedication anniversary, or the longest night of the year, repeat the dedication rite with your promise rewritten for the year ahead.',
          times: 1,
          every: 'holy-day',
          prompt: 'What has a year with Night taught me about rest and the unknown?',
        },
      ],
    },
  ],
  sources: [
    'Hesiod, Theogony, trans. H. G. Evelyn-White, Hesiod, the Homeric Hymns and Homerica (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (quoted: 116, “Verily at the first Chaos came to be”; 123–125, “from Chaos came forth Erebus and black Night; but of Night were born Aether and Day, whom she conceived and bare from union in love with Erebus”; 211–212, “And Night bare hateful Doom and black Fate and Death, and she bare Sleep and the tribe of Dreams”; 744–750, “There stands the awful home of murky Night wrapped in dark clouds”, “where Night and Day draw near and greet one another as they pass the great threshold of bronze: and while the one is about to go down into the house, the other comes out at the door”; 756, “holds in her arms Sleep the brother of Death”)',
    'Homer, Iliad 14.256–261, trans. Samuel Butler (1898), Project Gutenberg #2199: https://www.gutenberg.org/ebooks/2199 (quoted: “had not Night who cows both men and gods protected me. I fled to her and Jove left off looking for me in spite of his being so angry, for he did not dare do anything to displease Night”)',
    'Orphic Hymn 3 (II in Taylor’s numbering), To Night, “The Fumigation with Torches”, trans. Thomas Taylor, The Hymns of Orpheus (London, 1792), checked against the archive.org scan: https://archive.org/details/dli.ministry.28841 (quoted, with the long s modernised: “Night, parent goddess, source of sweet repose, / From whom at first both Gods and men arose”; paraphrased: “Dissolving anxious care”, “Dispel the fears of Twilight’s dreadful shade”); same text in the 1787 first edition: https://archive.org/details/b28775430',
    'Aristophanes, Birds 693–702 (paraphrased)',
    'The Derveni papyrus, col. 11 and following; Gábor Betegh, The Derveni Papyrus (2004)',
    'Pausanias, Description of Greece 1.40.6, 5.18.1 and 10.38.6–7, trans. W. H. S. Jones, checked at https://www.theoi.com/Text/Pausanias1C.html, https://www.theoi.com/Text/Pausanias5B.html and https://www.theoi.com/Text/Pausanias10C.html',
    'Virgil, Aeneid 6.249–251; Parmenides, fragment 1',
    'M. L. West, The Orphic Poems (1983) and Hesiod: Theogony (1966)',
  ],
};
