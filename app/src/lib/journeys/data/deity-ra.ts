import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-ra',
  kind: 'deity',
  paths: ['egyptian'],
  deityRef: 'traditional/deity/ra',
  title: 'Ra: Lord of the Two Horizons',
  summary:
    'A month with Ra, the sun who rises as Khepri, rules at noon and sets as Atum, and sails the twelve hours of the night to be born again. Study his forms and his barque, greet ten dawns, and decide whether to dedicate.',
  welcome: `This journey spends about a lunar month with Ra, the Egyptian sun and creator. It asks something simple and demanding of you: to notice the sun. You will learn when he rises and sets where you live, and for ten mornings you will get up to greet him, as Egyptian priests did every dawn for three thousand years.

You will learn his many forms and the gods he merged with, the boat he sails by day and by night, the hours of the night described in the Amduat, and how he was served in temples. At the end you may dedicate yourself to him, or not. Both are good endings.

This is a self-dedication. It is not an initiation into Kemetic Orthodoxy or any other group, and it does not replace one. One rule from the start: never look straight at the sun, in devotion or otherwise.`,
  about: `Ra (also written Re) was the sun and, in the theology of Heliopolis, the creator who rose from the waters of Nun at the beginning of time. He was the king of the gods and the father of the king: from the Fourth Dynasty, around 2550 BCE, every pharaoh was called "son of Ra". He was seen in many forms through the day, as the scarab Khepri at dawn, as Ra at noon and as old Atum at evening, and in the falcon-headed Ra-Horakhty, "Ra-Horus of the two horizons". He merged with other great gods, above all with Amun of Thebes as Amun-Ra. Every evening he entered the underworld in his night boat and sailed through twelve hours of darkness, fighting off the serpent Apep, uniting with Osiris and being reborn in the east at dawn. His great city was Iunu, Greek Heliopolis, now under the suburbs of north-east Cairo. Today he is honoured in Kemetic religion, both by reconstructionists and in Kemetic Orthodoxy, often with a hymn at sunrise.`,
  notes: [
    'Ra was not one fixed figure. Egyptians combined gods freely (Amun-Ra, Ra-Horakhty, Atum-Ra, Sobek-Ra, Khnum-Ra), and these combined forms had their own temples and theology. Do not flatten them all into "Ra".',
    'The Aten, the sun disc worshipped by Akhenaten, grew out of Ra-Horakhty but was a distinct cult, imposed and then abandoned within about twenty years.',
    'Modern Western uses of the name (Thelema’s Ra-Hoor-Khuit, New Age channelled "Ra" material) are separate from Egyptian religion.',
    'Ancient sun religion was bound up with kingship. In modern practice, his kingship becomes responsibility and right order (ma’at) in your own life, not power over others.',
    'Never look directly at the sun, even at sunrise. Greet it with your eyes lowered or on the light around it.',
    'Pet safety: cats are sacred to Ra, but lilies, onions and chocolate are not for them; keep incense smoke away from pet birds.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'The Eastern Horizon',
      intro:
        'Begin by learning who Ra is, finding where the sun rises from your home, and making an east-facing shrine. The threshold ends with a short sunrise rite of introduction.',
      days: 3,
      lessons: [
        {
          id: 'ra-who',
          title: 'The Sun of Heliopolis',
          summary: 'His name, his forms through the day, his city, and why every king was his son.',
          minutes: 6,
          sections: [
            {
              heading: 'A god you can see',
              body: `The Egyptian word ra simply means "sun". Ra is the one god Egyptians saw every day, and they watched him closely. They saw him as a disc, often with a cobra, the uraeus, coiled around it to spit fire at his enemies. They saw him as a falcon soaring, so he is often a falcon-headed man crowned with the disc. And they saw him change through the day.

In the morning he was Khepri, the scarab beetle, because the dung beetle rolls its ball as the sun is rolled up into the sky, and young beetles seem to emerge from nothing. At noon he was Ra in full strength. In the evening he was Atum, an old man, the creator returning to rest. A New Kingdom papyrus in Turin has him say, in Budge's translation (1914): "I am Khepera in the morning, Rā at noon, and Temu in the evening."`,
            },
            {
              heading: 'Iunu, the city of the sun',
              body: `His cult centre was Iunu, the Greeks' Heliopolis, now buried under the north-eastern suburbs of Cairo. Almost nothing of its great temple survives above ground, but one obelisk of King Senusret I, about 3,900 years old, still stands in the district of al-Matariya. The obelisk was a sun symbol: a tall shaft topped by a small pyramid, the benben, which recalled the first mound of earth to rise from the waters at creation, where the sun first shone. The pyramids themselves may echo the same shape.

The priests of Heliopolis taught that Atum, the creator, came into being alone on that mound and made the first gods, Shu and Tefnut; from them came Geb and Nut, and from them Osiris, Isis, Set and Nephthys. These nine are the Ennead, and Ra-Atum stands at their head.`,
            },
            {
              heading: 'Son of Ra',
              body: `Ra was bound up with kingship from early on. From the Fourth Dynasty the king took a title, sa Ra, "son of Ra", written before his birth name in every royal inscription for the rest of Egyptian history. Kings of the Fifth Dynasty built open-air sun temples near Abusir with a great squat obelisk in the courtyard; one, of King Niuserre at Abu Gurab, can still be visited.

The king was meant to do on earth what Ra did in heaven: keep ma'at, the right order of things, against isfet, chaos. Ra "rests upon ma'at", as the hymns say, and the goddess Ma'at was called his daughter.`,
            },
            {
              heading: 'His creatures and things',
              body: `The falcon belongs to Ra and to Horus, with whom he merges. The scarab is his morning form. The cobra on his brow is his fiery Eye. The cat was his too: in Book of the Dead chapter 17, a great cat at Heliopolis cuts the serpent of chaos apart under a sacred tree, and that cat is Ra himself. The lotus, which closes at night and opens its petals with the sun, was the flower from which, in one creation story, the young sun was born.

Gold was the flesh of the gods and especially of the sun. Gold, yellow and red belong to him, and the light of dawn.`,
            },
          ],
          knowAndDont: {
            known:
              'The forms Khepri, Ra and Atum, the title "son of Ra" from the Fourth Dynasty, the Heliopolitan Ennead, the sun temples of the Fifth Dynasty and the Senusret I obelisk are all securely attested.',
            unknown:
              'Heliopolis itself is largely lost under modern Cairo, so we know its theology mainly from texts written elsewhere. How the sun cult began before the Old Kingdom, and how far the pyramids were solar symbols, is debated.',
          },
          inPractice:
            'Look up sunrise and sunset times for where you live, and find the direction of sunrise from your home (it moves along the horizon through the year). Choose an image: a disc with a cobra, a falcon-headed Ra-Horakhty, or a scarab. A figure of a cat or a lotus suits his shrine too.',
          reflect: [
            'When did you last watch the sun rise? What did it feel like?',
            'Which of his three daily forms (young, strong, old) feels closest to where you are in life?',
          ],
          further: [
            'Stephen Quirke, The Cult of Ra: Sun-Worship in Ancient Egypt (2001)',
            'Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt (2003), entries on Ra, Khepri and Atum',
          ],
          library: ['traditional/deity/ra', 'traditional/deity/bastet', 'traditional/crystal/sunstone'],
        },
      ],
      practices: [
        {
          id: 'ra-shrine',
          title: 'Set up an east-facing shrine',
          instructions: `Choose a shelf where you stand facing east, ideally near a window that catches the morning light. Clean it with water that has a pinch of natron, washing soda or salt in it.

Lay a clean white, gold or yellow cloth. Set his image at the back. In front, place a water bowl, a dish for bread, an incense burner on a heatproof tile, and a gold, yellow or white candle. Add a scarab, a sunstone or citrine, a cat figure or a lotus picture if you like.

Egyptian shrines were closed boxes. Cover his image with a cloth at night and uncover it at dawn, so that the opening of the shrine and the rising of the sun go together.`,
          times: 1,
          prompt: 'Where does the sun rise from your home? How did it feel to orient a shrine to it?',
        },
      ],
      rite: {
        title: 'Introduction to Ra at Sunrise',
        summary: 'A short dawn rite: purify, uncover the shrine as the sun rises, adore him with raised hands, offer water and incense, and introduce yourself.',
        minutes: 20,
        ingredients: [
          { name: 'Ra', ref: 'traditional/deity/ra' },
          { name: 'An offering bowl of fresh water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Natron, washing soda or salt dissolved in a cup of water' },
          { name: 'Frankincense, or another resin incense', ref: 'traditional/herb/frankincense' },
          { name: 'An incense burner on a heatproof tile', ref: 'traditional/tool/incense_burner' },
          { name: 'A gold or yellow candle', ref: 'traditional/candle/gold' },
          { name: 'Sunrise time for your location' },
        ],
        preparation:
          'Get up a little before sunrise. Wash your hands and face and rinse your mouth with the natron or salt water, spitting it out. Dress in clean clothes. Have the shrine covered.',
        steps: [
          {
            title: 'Purify in the half-light',
            instructions: 'Light the candle and the incense before the sun is up. Touch the natron water to your lips and pass your hands through the smoke.',
            light: true,
            spoken: 'I am pure. I have washed my hands and mouth. I wait for Ra in the eastern horizon.',
          },
          {
            title: 'Open as he rises',
            instructions:
              'At sunrise (or when the sky brightens), uncover his image. If you can, open a curtain or window to the east too. Keep your eyes lowered; never look straight at the sun.',
            spoken: 'The doors of heaven are opened. Rise, Ra, in the eastern horizon. Awake in peace.',
          },
          {
            title: 'Adore',
            instructions: 'Raise both hands, palms out toward the light, at face height, the gesture of the sun hymns. Speak the praise.',
            spoken: 'Homage to you, Ra, Khepri in the morning, Ra at noon, Atum in the evening. You have crossed the night and come again. I greet you.',
          },
          {
            title: 'Offer water and incense',
            instructions: 'Lift the water bowl toward the east, then set it before his image. Hold the incense up for a moment.',
            spoken: 'Take this cool water, Ra. Take this sweet smoke. I give them to you freely.',
          },
          {
            title: 'Introduce yourself',
            instructions:
              'In your own words, tell him your name, why you have come, and that you will spend a month learning before you decide anything. Then stand quietly in the morning light.',
            minutes: 5,
          },
          {
            title: 'Close',
            instructions: 'Thank him. Snuff the candle. You may leave his image uncovered through the day, as the sun is up.',
            snuff: true,
            spoken: 'Go in peace across the sky, Ra. I will greet you again.',
          },
        ],
        closing:
          'Pour the water on a plant or the earth later in the day. Note the time of sunrise and anything you noticed in your journal.',
        safety:
          'Never look directly at the sun, even at dawn or through a window; it can damage your eyes permanently. Keep candle and incense on a heatproof surface, away from open curtains, children, pets and pet birds, and never leave them unattended.',
      },
    },
    {
      kind: 'study',
      title: 'Forms, Barque and Night',
      intro:
        'Three lessons: how Ra merged with other gods; his boat and the twelve hours of the night; and his myths and how he was served. Keep greeting the morning in between.',
      days: 11,
      lessons: [
        {
          id: 'ra-syncretism',
          title: 'Amun-Ra, Ra-Horakhty and the Gods Within Gods',
          summary: 'How Egyptians combined their gods, the main combined forms of Ra, and the Aten.',
          minutes: 7,
          sections: [
            {
              heading: 'How gods combine',
              body: `Egyptians did not keep their gods in tidy boxes. A god could "dwell in" another, so that two names were joined into one: Amun-Ra, Atum-Ra, Sobek-Ra, Khnum-Ra, Montu-Ra. The Egyptologist Erik Hornung, whose work shaped modern understanding here, argued that this did not erase either god. Amun stayed Amun, Ra stayed Ra, and Amun-Ra was a third thing, a meeting of the two in which Amun's hiddenness and Ra's visible power were held together.

Ra was the god most often joined to others, because almost every great god wanted a share of the sun's kingship. A local crocodile god, Sobek, became Sobek-Ra, a creator; a ram-headed potter god, Khnum, became Khnum-Ra.`,
            },
            {
              heading: 'Ra-Horakhty',
              body: `Ra-Horakhty means "Ra, who is Horus of the two horizons", the falcon of the eastern and western edges of the sky. He is the most common image of the sun god: a falcon-headed man with the disc and cobra on his head. In hymns he is greeted as Harmachis ("Horus in the horizon") at dawn. In the Book of the Dead, the scribe Ani praises him, in Budge's translation (1899), as the one who rises on the horizon and sheds his beams on "the lands of the North and of the South, thou art beautiful, yea beautiful, and all the gods rejoice when they behold thee, the king of heaven."

At Abu Simbel, Ramesses II carved a temple into a cliff so that, twice a year, around 22 February and 22 October, the rising sun shines down the whole length of the temple and lights the statues of Ra-Horakhty, Amun-Ra and the king himself in the sanctuary, while Ptah, a god of the underworld, stays in shadow.`,
            },
            {
              heading: 'Amun-Ra, king of the gods',
              body: `Amun was the god of Thebes, his name meaning "the hidden one". When Theban kings reunited Egypt in the Middle Kingdom and again at the start of the New Kingdom, their god rose with them, and as Amun-Ra he became "king of the gods". His temple at Karnak grew over two thousand years into one of the largest religious complexes ever built.

A hymn from the Papyrus of Hunefer, in Budge's translation, praises him: "Homage to thee, O Amen-Ra, who dost rest upon Maat; thou passest over heaven and every face seeth thee." The hidden god and the visible sun, in one name.`,
            },
            {
              heading: 'The Aten',
              body: `In the fourteenth century BCE King Amenhotep IV changed his name to Akhenaten and made the Aten, the sun disc with rays ending in little hands, the one god of the state. He closed the temples of Amun, built a new capital at Amarna, and wrote or sponsored the Great Hymn to the Aten. The Aten grew out of the cult of Ra-Horakhty, but it was something new and exclusive. After his death the old gods were restored and his name was struck from the records.

For a Ra devotee, the Aten is part of the story but not the same god. Many Kemetics honour the Aten as one aspect of the sun without accepting Akhenaten's exclusivity.`,
            },
          ],
          knowAndDont: {
            known:
              'Combined forms like Amun-Ra and Ra-Horakhty are attested in thousands of inscriptions; the Abu Simbel alignment is still observed (shifted by about a day since the temple was moved in the 1960s); the Amarna period is well documented.',
            unknown:
              'How ordinary Egyptians understood syncretism is hard to know; most of our evidence comes from priests. Scholars still debate what Akhenaten intended and how widely his religion was practised outside the court.',
          },
          inPractice:
            'Decide which form or forms of Ra you are approaching, and use their names: Ra at noon, Ra-Horakhty at dawn, Atum at dusk, Amun-Ra if you are drawn to the Theban god. Respect that Amun-Ra had a vast cult of his own. If you honour the Aten too, say so honestly.',
          reflect: [
            'What does it mean to you that a god can live in another god without either disappearing?',
            'Is the Ra you are drawn to the visible sun, the hidden creator, or both?',
          ],
          further: [
            'Erik Hornung, Conceptions of God in Ancient Egypt: The One and the Many (1982)',
            'Jan Assmann, Egyptian Solar Religion in the New Kingdom (1995)',
          ],
          library: ['traditional/deity/ra', 'traditional/deity/hathor'],
        },
        {
          id: 'ra-night',
          title: 'The Barque and the Twelve Hours of the Night',
          summary: 'His day and night boats, the crew, the serpent Apep, and the journey of the Amduat.',
          minutes: 8,
          sections: [
            {
              heading: 'Two boats',
              body: `Egyptians travelled by river, so their sun travelled by boat. By day Ra sailed across the sky in the Mandjet, the "boat of millions of years". At sunset he passed into his night boat, the Mesektet, and sailed through the Duat, the underworld, back to the east. (Older books, including Budge's, sometimes swap the names or spell them Atet and Sektet.)

He did not sail alone. Thoth stood in the bow, Ma'at was with him, and two powers named Hu (the creative word) and Sia (perception) were part of the crew, with Horus at the steering oar. A Book of the Dead hymn to Ra-Horakhty, from the Papyrus of Hunefer, opens in Budge's translation (1899): "Homage to thee, O thou who art Ra when thou risest and Temu when thou settest. Thou risest, thou risest, thou shinest, thou shinest, O thou who art crowned king of the gods."`,
            },
            {
              heading: 'Apep',
              body: `Every night and every dawn the boat was attacked by Apep (Greek Apophis), a vast serpent of chaos who tried to swallow the sun or drink the water from under the boat. Apep was not a god to be honoured; he was the opposite of creation, and he could never be destroyed for good, only defeated again and again. Eclipses and storms were his attacks.

The gods fought him with spells and spears. In some texts and images it is Set, later a villain, who stands in the prow and spears the serpent. In the temples priests recited the Book of Overthrowing Apep, which survives in a Ptolemaic papyrus in the British Museum (the Bremner-Rhind papyrus), and destroyed wax figures of the serpent each day, so that the sun would rise. Note that this was aimed at cosmic chaos, not at any human being.`,
            },
            {
              heading: 'The Amduat',
              body: `The Amduat, "what is in the underworld", is a guidebook to the twelve hours of the night. Its earliest complete copies are painted on the walls of the tombs of Eighteenth Dynasty kings such as Thutmose III. Each hour is a region with its own gate, guardians and inhabitants. In the first hour the sun enters the west and the dead greet him. In the fourth and fifth he crosses the desert of Sokar, where his boat becomes a serpent to slide over the sand. In the sixth, the deepest point of the night, his soul unites with his own body, imagined as Osiris: the sun and the god of the dead become one.

In the seventh hour Apep lies in wait, and Isis and the Eldest Magician stop him with spells while he is bound and cut. In the twelfth, the boat is pulled through the body of a giant serpent, tail to mouth, and the sun comes out reborn as the scarab Khepri, ready to rise.`,
            },
            {
              heading: 'Why it matters',
              body: `The Amduat was not only about the sun. The dead king hoped to travel in Ra's boat and be reborn with him every morning, and in time ordinary people hoped for the same. Each dawn proved that rebirth was possible.

Other books describe the night journey too: the Book of Gates, the Book of Caverns, the Litany of Ra with its seventy-five names of the sun. All share the same shape. Things go down into the dark, are tested, are joined with what they lost, and come back new.`,
            },
          ],
          knowAndDont: {
            known:
              'The Amduat, Book of Gates and other underworld books survive in royal tombs of the New Kingdom; the Book of Overthrowing Apep survives in the Bremner-Rhind papyrus; the day and night boats and their crews are well attested in hymns and images.',
            unknown:
              'These were royal and priestly texts; how much ordinary people knew of them is unclear. Details differ between the books and between copies. How Egyptians related this mythical journey to their knowledge of the actual sun is a matter for scholarly interpretation.',
          },
          inPractice:
            'Look at photographs of the Amduat in the tomb of Thutmose III (KV34), online or in a good book. At sunset, say a short farewell to Ra as he enters the night boat, and at dawn a greeting as Khepri. Some Kemetics say a short protective prayer at night for the boat’s safe passage; keep it about chaos and protection, never about people.',
          reflect: [
            'What would it mean to see each night you sleep through as a journey and each morning as a rebirth?',
            'What is your Apep, the chaos you have to face down again and again rather than once?',
          ],
          further: [
            'Erik Hornung, The Ancient Egyptian Books of the Afterlife (1999)',
            'Erik Hornung and Theodor Abt, The Egyptian Amduat: The Book of the Hidden Chamber (2007)',
          ],
          library: ['traditional/deity/ra', 'traditional/deity/osiris', 'traditional/deity/isis', 'traditional/deity/thoth'],
        },
        {
          id: 'ra-myths-worship',
          title: 'The Eye, the Cow and the Daily Hymns',
          summary: 'The myths of Ra’s old age, and how he was praised at dawn, noon and dusk.',
          minutes: 8,
          sections: [
            {
              heading: 'The Eye of Ra',
              body: `Ra's Eye was a goddess in her own right, his fierce daughter, called Hathor, Sekhmet, Tefnut or Wadjet in different stories. In the Book of the Heavenly Cow, painted on a gilded shrine of Tutankhamun and in several royal tombs, Ra grows old and humans plot against him. He sends his Eye to punish them, and she becomes Sekhmet, killing without stopping. Ra relents and has seven thousand jars of beer dyed red with ochre and poured over the fields. She drinks it, thinking it blood, becomes drunk and gentle, and comes home as Hathor.

Weary, Ra leaves the earth and rises into the sky on the back of the sky goddess Nut as a great cow. That is why the gods now live above and humans below. The red beer story was remembered in festivals of drunkenness for Hathor.`,
            },
            {
              heading: 'Old Ra and the secret name',
              body: `In another story, preserved in a Turin papyrus, the elderly Ra is bitten by a snake made by Isis, who will cure him only if he tells her his secret name. He lists his deeds instead: "I open my eyes, and there is light; I shut my eyes, and there is darkness." In the end he gives up the name, and she heals him.

These tales of an ageing, vulnerable Ra may surprise people expecting a mighty sun king. Egyptians were comfortable with a creator who grows old each evening, can be hurt, and needs help. His rebirth each morning means more because of it.`,
            },
            {
              heading: 'Praise through the day',
              body: `In the temples the sun was praised at dawn as he rose, and in later temples at every hour of the day and night. Hymns at sunrise and sunset fill the Book of the Dead and were carved on the doorways of tombs, often with the owner shown with hands raised. Plutarch, writing around 100 CE, says Egyptian priests matched their incense to the sun's course. In F. C. Babbitt's translation (1936): "Very appropriately, therefore, they burn resin and myrrh in the daytime, for these are simple substances and have their origin from the sun; but the cyphi, since it is compounded of ingredients of all sorts of qualities, they offer at nightfall." Resin was burned at rising and myrrh at noon.

Kyphi, a blend of resins, honey, wine, raisins and spices, is described by Plutarch and in Egyptian temple laboratory inscriptions at Edfu and Philae.`,
            },
            {
              heading: 'Offerings and manners',
              body: `Ra received what every Egyptian god received: bread and beer, water, meat and fowl, fruit and flowers, incense, and above all the figure of Ma'at, a small statue of the goddess, which the king or priest held up as the greatest offering of all: right order given back to its source.

Purity, the offering formula and the reversion of offerings all apply. Come washed, with a clean mouth. Speak the offering, since words are gifts. Afterwards, eat the bread yourself or share it; nothing offered should be wasted. For Ra in particular, the time matters: offerings at sunrise, praise at noon and dusk.`,
            },
          ],
          knowAndDont: {
            known:
              'The Book of the Heavenly Cow and the Turin papyrus are New Kingdom; the presentation of Ma’at, the sunrise and sunset hymns and the hourly temple liturgies are well attested. Plutarch and the Edfu and Philae inscriptions describe kyphi.',
            unknown:
              'Kyphi recipes differ between sources and some ingredients are not securely identified. Plutarch’s schedule of incense may reflect the temples of his own day rather than earlier practice. The Eye goddess stories exist in several versions that do not fully agree.',
          },
          inPractice:
            'Try the three-fold rhythm for a week: frankincense or a resin at dawn, a sentence of praise at noon (a raised hand at your desk is enough), and a farewell at dusk. Offer a small image or written word "Ma’at" on your shrine as the gift of keeping your own life in order. If you make a kyphi-style blend, burn it in the evening.',
          reflect: [
            'What would it change to pause three times a day for the sun?',
            'What does it mean that the greatest offering was right order itself?',
          ],
          further: [
            'Plutarch, On Isis and Osiris §§79–80, trans. F. C. Babbitt (Loeb, 1936; public domain, at LacusCurtius)',
            'Erik Hornung, The Ancient Egyptian Books of the Afterlife (1999), on the Book of the Heavenly Cow',
            'Emily Teeter, The Presentation of Maat (1997)',
          ],
          library: ['traditional/deity/sekhmet', 'traditional/deity/hathor', 'traditional/herb/frankincense', 'traditional/herb/myrrh'],
        },
      ],
      practices: [
        {
          id: 'ra-noon',
          title: 'Morning greeting and noon praise',
          instructions:
            'Each morning, uncover his shrine and give fresh water with a line of greeting. At noon, wherever you are, pause, raise a hand slightly, and say his name silently. At night, cover the shrine.',
          times: 11,
          every: 'day',
          prompt: 'Did you remember at noon? What were you doing when you did?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Ten Dawns',
      intro:
        'For ten mornings, one Egyptian "week" of ten days, you will rise to greet the sun. Before you start, read the lesson on honouring Ra today.',
      days: 10,
      lessons: [
        {
          id: 'ra-today',
          title: 'Ra Today: Dawn Practice, Days and Care',
          summary: 'Modern communities, how to set a dawn practice, his offerings and days, and the sensitive points.',
          minutes: 7,
          sections: [
            {
              heading: 'Who honours him now',
              body: `Ra is central to Kemetic religion, the modern revival of Egyptian religion. Reconstructionists build morning rites on the temple liturgy and the sun hymns, often reciting a translated hymn at dawn. Kemetic Orthodoxy, an organised temple founded in the late 1980s by Tamara Siuda and based in Illinois, includes Ra in its daily devotions and festival calendar. Many people practise independently, sometimes simply by greeting the sunrise.

Ra also appears in modern Western occultism, especially in Thelema, whose Book of the Law (1904) speaks of Ra-Hoor-Khuit, and in New Age writing that uses his name. Those are separate traditions with their own logic. They are not Egyptian religion, and it helps to keep them apart.`,
            },
            {
              heading: 'A dawn practice that lasts',
              body: `The heart of Ra devotion is being there when the sun rises. That means knowing the sunrise time, which changes daily, and being honest about your life. Some people rise for true sunrise. Others greet him when they wake, facing east, and that is fine; the sun is up somewhere.

Keep it short so you keep it: wash, uncover the shrine, raise your hands, say a line of praise, offer water. On weekends or holy days add incense, bread and a longer hymn. In the evening say farewell as he goes into his night boat, and cover the shrine.`,
            },
            {
              heading: 'His offerings and days',
              body: `Water, bread and beer, fruit (dates and figs), honey, flowers, especially lotus imagery or yellow and gold blooms, and resin incense. Frankincense at dawn suits him particularly. Light itself is a gift: a candle lit at sunrise. So is ma'at, an act of order or fairness offered in his name.

His great day is Wep Ronpet, the "opening of the year", tied to the dawn rising of Sirius, which ancient texts sometimes call the birth of Ra. Modern Kemetics place it variously, often late July or August. The five epagomenal days before it are dangerous and holy, the days when the year is reborn. Some modern practitioners also mark the solstices and equinoxes for Ra; the Egyptians noticed the solstices in temple alignments, but they did not hold the four-season festivals of the modern Wheel of the Year. Saying so keeps your practice honest.`,
            },
            {
              heading: 'Sensitive points',
              body: `Your eyes come first. Never gaze at the sun, even a red rising one; "sungazing" practices promoted online can cause permanent damage. Greet the light, not the disc.

Kingship is the other point. Ra was the god of kings, and in the modern world sun-god imagery has sometimes been pulled into ideas of racial or national superiority. That has nothing to do with Egyptian religion. In your practice, let his kingship mean responsibility: keeping your word, being fair, holding order in your own small part of the world.

Finally, honour Egypt. Its temples, its tombs and its modern people are not a backdrop. Visit respectfully, buy reproductions, not antiquities.`,
            },
          ],
          knowAndDont: {
            known:
              'Kemetic Orthodoxy and Thelema are documented modern movements. Sun hymns at dawn, Wep Ronpet and the epagomenal days are well attested in ancient sources; temple alignments to solstice sunrise are argued for some sites, such as Karnak.',
            unknown:
              'There is no single modern Kemetic calendar. The ancient Sirius rising fell in July at Memphis, but the civil year drifted, and modern practitioners fix Wep Ronpet differently. Whether particular temples were deliberately aligned to the solstice is debated.',
          },
          inPractice:
            'Set a realistic dawn habit: true sunrise on some days, or a greeting when you wake. Put Wep Ronpet and the epagomenal days in your calendar. Keep an "act of ma’at" as a weekly offering: one fair, orderly or honest thing done in his name.',
          reflect: [
            'What dawn practice could you actually keep for a year?',
            'What would offering ma’at look like in your work or your home this week?',
          ],
          further: [
            'Richard J. Reidy, Eternal Egypt: Ancient Rituals for the Modern World (2010)',
            'Stephen Quirke, The Cult of Ra (2001)',
          ],
          library: ['traditional/deity/ra', 'traditional/crystal/citrine', 'traditional/crystal/amber'],
          premade: ['kitchen-solitary-morning-practice'],
        },
      ],
      practices: [
        {
          id: 'ra-ten-dawns',
          title: 'Ten dawns with Ra',
          instructions: `Each morning, rise in time for sunrise if you can. Wash, rinse your mouth, uncover his shrine and light the candle and incense. Face east, eyes lowered from the sun, raise your hands, and greet him. Offer water and one thing more (bread, a date, a flower). Read or say the morning's theme, stand or sit in the light for five minutes, then journal. Snuff the candle before you leave.

Dawn 1: Khepri, the scarab rising. Dawn 2: the first mound and the benben. Dawn 3: son of Ra, and your own responsibilities. Dawn 4: Ra-Horakhty, the falcon of the horizons. Dawn 5: Amun-Ra, the hidden one. Dawn 6: the day boat and its crew. Dawn 7: Apep, and the chaos you face. Dawn 8: the Eye, fierce and gentle. Dawn 9: midnight union with Osiris. Dawn 10: rebirth; what in you is rising?

If clouds hide the sun, greet him anyway. He rose.`,
          times: 10,
          every: 'day',
          prompt: 'What time did the sun rise today, and what did you notice? What did the theme bring up?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Midday Reckoning',
      intro:
        'Take a few days with only the simple morning greeting. Reread your journal. Choosing to dedicate is one good outcome; so is pausing, stopping, or realising that another god is calling you.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'ra-reread',
          title: 'Reread your journal at noon',
          instructions:
            'At midday, when the sun is highest, read your journal through. Then answer the questions below in writing.',
          times: 1,
          prompt: 'What did ten dawns actually do to your days?',
        },
      ],
      questions: [
        'Do you want a lasting relationship with Ra, or did you mostly enjoy the discipline of rising early? Both are worth knowing.',
        'Which Ra is yours: the visible sun, Amun-Ra the hidden king, Ra-Horakhty of the horizons, or the whole family of forms? Can you name it?',
        'Can you keep a dawn or morning practice through dark winter months as well as summer ones?',
        'Would you be better served by learning with a Kemetic community first, whose calendar and rites you could join?',
        'If you choose to wait or stop, can you thank him at one last sunrise and close the shrine with a clear heart? That is a good ending too.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The Dedication at Sunrise',
      intro:
        'If you choose to go on, this is your self-dedication to Ra, a promise you make yourself. It is not an initiation into any Kemetic or other group and does not replace one. Hold it at sunrise; Wep Ronpet, a clear morning after the epagomenal days, or simply the first fine dawn when you are ready, all suit.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-Dedication to Ra',
        summary: 'A full dawn rite in the shape of the temple morning service: purification in the dark, opening at sunrise, adoration, offering, presentation of Ma’at, the vow, reversion and closing.',
        minutes: 45,
        ingredients: [
          { name: 'Ra', ref: 'traditional/deity/ra' },
          { name: 'An offering bowl of fresh water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Natron, washing soda or salt in a cup of water' },
          { name: 'Bread, dates or figs, and beer or another drink', ref: 'traditional/vessel/dish' },
          { name: 'Frankincense and an incense burner', ref: 'traditional/herb/frankincense' },
          { name: 'A gold candle', ref: 'traditional/candle/gold' },
          { name: 'A feather, or a card with the word "Ma’at", to present' },
          { name: 'Flowers, yellow or gold', optional: true },
          { name: 'Your vow, written by hand' },
        ],
        preparation: `The day before, write your vow: what you will do (a daily greeting, his festivals, acts of ma'at, study), for how long (a year and a day is common), and what you hope for. Keep it keepable. Look up the sunrise time.

Rise in the dark. Bathe, rinse your mouth with natron or salt water, and dress in clean white or gold. Set everything out on the shrine, with his image covered.`,
        steps: [
          {
            title: 'Purify in the dark',
            instructions: 'Before sunrise, light the candle and the incense. Wash your hands in the natron water, touch it to your lips, and pass your hands through the smoke.',
            light: true,
            spoken: 'I am pure, I am pure. I have washed, I have passed through the smoke. I wait in the night for the lord of the horizon.',
          },
          {
            title: 'Open at sunrise',
            instructions:
              'As the sun rises or the sky brightens, uncover his image and open a curtain to the east. Keep your eyes lowered from the sun.',
            spoken: 'The doors of heaven are opened. The night boat has come to harbour. Rise, Ra, as Khepri in the east. Awake in peace.',
          },
          {
            title: 'Adore',
            instructions: 'Raise both hands, palms toward the light, and speak the praise. Add any hymn of your own.',
            spoken: 'Homage to you, Ra, lord of the two horizons, king of the gods. You have crossed the twelve hours of the night, you have thrown down Apep, you are born again. Your beauty is upon every face. I praise you.',
          },
          {
            title: 'Offer',
            instructions: 'Lift the water, bread and drink toward the east, then set them before his image. Say the spoken offering.',
            spoken: 'An offering for Ra: cool water and bread, drink and flowers and sweet incense, every good and pure thing on which a god lives. May it please you.',
          },
          {
            title: 'Present Ma’at',
            instructions:
              'Hold the feather or the Ma’at card up before him in both hands, the greatest offering of the temples, then lay it on the shrine.',
            spoken: 'I give you Ma’at, your daughter, the order you rest upon. I will keep her in my hands and in my life.',
          },
          {
            title: 'Speak your vow',
            instructions: 'Read your written vow aloud in the morning light.',
            spoken: 'This is my word, spoken in the light. Hear me, Ra.',
          },
          {
            title: 'Stand in the light',
            instructions: 'Stand or sit quietly in the morning light before him.',
            minutes: 10,
          },
          {
            title: 'Reversion and closing',
            instructions:
              'Thank him. Eat a piece of the bread or a date. Lay your vow beneath the Ma’at feather. Snuff the candle. Leave his image uncovered for the day.',
            snuff: true,
            spoken: 'What you have received, I share. Go in peace across the sky, Ra. I am yours, and I will greet you again.',
          },
        ],
        closing:
          'Pour the water on the earth at noon. Say farewell at sunset that evening, and cover the shrine. Record the rite in your journal.',
        safety:
          'Never look directly at the sun. Keep candle and incense on heatproof surfaces, away from curtains you open to the east, children, pets and pet birds, and never leave them unattended. Keep dates, grapes and alcohol away from dogs.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Every Morning',
      intro:
        'Ra comes back every day, and the practice after dedication is the same: a daily greeting, his festivals, and a yearly renewal.',
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'ra-daily',
          title: 'The daily greeting',
          instructions:
            'Each morning, uncover his shrine, face east, raise your hands and say a line of praise, and give water. At sunset, a word of farewell and cover the shrine.',
          times: 365,
          every: 'day',
        },
        {
          id: 'ra-weekly',
          title: 'A weekly offering and an act of ma’at',
          instructions:
            'Once a week, or once every ten days, give bread and incense at dawn and read a sun hymn. Choose one fair, orderly or honest act for the week and offer it to him.',
          times: 52,
          every: 'week',
          prompt: 'What act of ma’at did you offer this week?',
        },
        {
          id: 'ra-holy-days',
          title: 'His holy days',
          instructions: `Keep Wep Ronpet, the opening of the year, at dawn with a full offering and fresh water from a new bottle; the five epagomenal days before it as quiet, careful days; and, if you choose, the solstices as modern markers of the sun's turning (be honest that these are modern). If you honour Amun-Ra, mark the Opet festival or Beautiful Festival of the Valley as well.

On each, rise for the true sunrise, give a fuller offering, and read a hymn aloud.`,
          times: 3,
          every: 'holy-day',
          prompt: 'How did you keep the day, and what did the dawn look like?',
        },
        {
          id: 'ra-renewal',
          title: 'Yearly rededication',
          instructions:
            'On the anniversary of your dedication, or at Wep Ronpet, reread your vow, write a new one, and repeat the dedication rite at sunrise. Change the promise honestly. If you are ending the dedication, give thanks at one last sunrise and close the shrine with care.',
          times: 1,
          prompt: 'How many dawns did you greet this year, and what did they give you?',
        },
      ],
    },
  ],
  sources: [
    'Hymns to Ra from the Papyrus of Hunefer and the Papyrus of Ani, trans. E. A. Wallis Budge, Egyptian Ideas of the Future Life (1899), Project Gutenberg ebook 11277: "Homage to thee, O thou who art Ra when thou risest…", "Homage to thee, O Amen-Ra…", "the lands of the North and of the South…" (Budge’s R[=a] spelled Ra here)',
    'The Legend of Ra and Isis (Turin papyrus), trans. E. A. Wallis Budge, The Literature of the Ancient Egyptians (1914), Project Gutenberg ebook 15932: "I am Khepera in the morning…", "I open my eyes, and there is light…"',
    'Plutarch, On Isis and Osiris §80, trans. F. C. Babbitt (Loeb, 1936; public domain), LacusCurtius: "Very appropriately, therefore, they burn resin and myrrh…"',
    'The Amduat, Book of Gates, Book of the Heavenly Cow and Bremner-Rhind papyrus (Book of Overthrowing Apep)',
    'Erik Hornung, Conceptions of God in Ancient Egypt (1982) and The Ancient Egyptian Books of the Afterlife (1999); Stephen Quirke, The Cult of Ra (2001); Jan Assmann, Egyptian Solar Religion in the New Kingdom (1995)',
    'Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt (2003)',
  ],
};
