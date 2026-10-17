import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-osiris',
  kind: 'deity',
  paths: ['egyptian'],
  deityRef: 'traditional/deity/osiris',
  title: 'Osiris: Foremost of the Westerners',
  summary:
    'A month with Wesir, the murdered king who became lord of the dead and the green life that returns. Study his myth, Abydos and the Khoiak mysteries, care for your own dead, grow an Osiris garden, and decide whether to dedicate.',
  welcome: `This journey spends about a lunar month with Osiris, the god Egyptians hoped to become when they died. He is solemn company: a god of death, judgement and grief, and also of grain, the flood and everything that comes back. People are often drawn to him after a loss. If that is you, go gently; this path can sit beside grief, but it does not replace friends, counsellors or doctors.

You will learn his myth from the Egyptian texts and from Plutarch's later retelling, the mysteries at Abydos and in the month of Khoiak, and how Egyptians cared for their dead. For ten nights you will tend a small garden of barley shaped like the god, as Egyptians did. At the end you may dedicate yourself, or not.

This is a self-dedication. It is not an initiation into Kemetic Orthodoxy or any other group, and it does not replace one.`,
  about: `Osiris (Egyptian Wesir, often written Asar or Usir) was the eldest child of Geb and Nut, a king who ruled Egypt and was murdered by his brother Set. His sister and wife Isis found him and, with Nephthys, Anubis and Thoth, restored him; he fathered Horus, then went to rule the world of the dead, while Horus took the living throne. From the late Old Kingdom on, every Egyptian who could afford it hoped to become "an Osiris" at death, to be judged worthy in his hall and to live again as he did. His great cult centres were Busiris (Djedu) in the Delta and Abydos (Abdju) in Upper Egypt, where pilgrims came for his mysteries for two thousand years. He is also the grain that is buried and sprouts, and the Nile flood that returns each year. Today he is honoured in Kemetic religion, reconstructionist and Kemetic Orthodox alike, and by many modern Pagans as a god of death and rebirth.`,
  notes: [
    'The continuous story (the chest, Byblos, the fourteen pieces) comes from Plutarch, a Greek writer of about 100 CE. Egyptian texts allude to the myth but never tell it whole, and differ among themselves.',
    'Osiris is often called a "dying-and-rising god" alongside figures like Adonis or Christ. That category comes from James Frazer’s The Golden Bough and is now widely doubted; Osiris does not come back to rule the living. Compare carefully if at all.',
    'Set, his murderer, was also a protector of the sun god and was honoured in his own right for much of Egyptian history. Some Kemetics honour Set; be courteous about that even if you do not.',
    'The mysteries of Abydos and Khoiak were temple rites. What follows are modern home practices built on what is known about them, not the rites themselves.',
    'Grief: honouring Osiris and your dead can comfort, and it can also stir things up. Reach out to people and professionals when you need them.',
    'Pet safety: onions (offered to Osiris-Sokar in antiquity) are toxic to cats and dogs; leave them off the shrine if you have pets. Malachite should never go in water.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'At the Western Gate',
      intro:
        'Begin by learning who he is, and by making a quiet shrine where your dead can be remembered too. The threshold ends with a short rite of introduction.',
      days: 3,
      lessons: [
        {
          id: 'osiris-who',
          title: 'Wesir, the Good Being',
          summary: 'His names, his look, his places, and what he meant to Egyptians.',
          minutes: 6,
          sections: [
            {
              heading: 'A god wrapped like the dead',
              body: `Osiris is almost always shown the same way: a man wrapped tight in white like a mummy, his hands free and crossed on his chest holding the crook and the flail, the royal sceptres. On his head is the atef, a tall white crown flanked by two ostrich plumes. His skin is often green, the colour of new plants, or black, the colour of the Nile's fertile silt (Egyptians called their country Kemet, "the black land"). Both colours mean life, not decay.

His sign is the djed pillar, a column with four bars at the top, which Egyptians read as his backbone and as "stability" or "endurance". A djed amulet was laid on the throat of the mummy so the dead person could stand up again.`,
            },
            {
              heading: 'His names',
              body: `His Egyptian name was Wesir. Its meaning is uncertain, and Egyptologists have proposed several explanations; none is agreed. His favourite title was Wennefer (Greek Onnophris), "he who is continually good" or "the perfect one". He was Khentyimentyu, "foremost of the Westerners", the Westerners being the dead, who lived where the sun sets; that title had first belonged to an older jackal god of Abydos whom Osiris absorbed. He was Lord of Djedu (Busiris), Lord of Abdju (Abydos), Lord of Eternity, Ruler of the Living, which is to say the blessed dead.

Kemetic practitioners variously say Wesir, Asar or Ausar, and the Greek Osiris is fine too. Wennefer is a beautiful name to use in prayer.`,
            },
            {
              heading: 'Where he came from',
              body: `Osiris appears in writing first in the Fifth Dynasty, around 2400 BCE, and becomes prominent in the Pyramid Texts carved in the burial chambers of kings from about 2350 BCE. There, the dead king is identified with Osiris and rises from death as he did. Over the next centuries that hope spread from kings to officials and then to anyone who could afford a coffin and a few spells. By the Middle Kingdom a dead woman or man was called "the Osiris" followed by their name.

His oldest home may have been Busiris in the Delta, where an older god called Andjety wore a similar crown and held the same sceptres. Abydos became his greatest centre, because the tombs of Egypt's first kings were there, and in time one of them, the tomb of King Djer, was believed to be the tomb of Osiris himself.`,
            },
            {
              heading: 'What he was for',
              body: `Osiris made death survivable. He had been killed, and yet through the care of his family and the right words and rites he lived again, not back on earth but as king of the dead. What had been done for him could be done for anyone: the embalming, the mourning, the offerings, the speaking of the right words. That is why funerals re-enacted his myth, with women playing Isis and Nephthys and the priest playing Horus.

He was also the land's fertility. The Nile flood rose each year "from" him, and grain buried in the earth sprouted as he did. Egyptians did not see these as separate jobs. The dead, the seed and the flood all went down into darkness and came back.`,
            },
          ],
          knowAndDont: {
            known:
              'His iconography, titles and funerary role are attested from the Pyramid Texts onward; the use of "the Osiris N" for the dead is standard from the Middle Kingdom. The identification of Djer’s tomb with Osiris’s tomb is shown by Middle and New Kingdom offerings there.',
            unknown:
              'The meaning of the name Wesir and his origins before the Fifth Dynasty are unknown. Whether he began as a god of grain, of the dead king, or something else is debated; theories from the nineteenth and early twentieth centuries were often shaped by ideas about "dying gods" that are now doubted.',
          },
          inPractice:
            'Choose a name to use (Wesir, Asar, Osiris, or Wennefer in prayer) and an image: a museum photograph or statue reproduction of the mummiform Osiris, or a djed pillar. Many devotees wear a djed amulet. If you have lost someone, decide whether their photograph will sit on his shrine or on a separate shelf beside it.',
          reflect: [
            'What does it mean to you that green and black, in Egypt, were both colours of life?',
            'Is there a death in your life that brought you here? What do you hope Osiris can hold?',
          ],
          further: [
            'Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt (2003), entry on Osiris',
            'Bojana Mojsov, Osiris: Death and Afterlife of a God (2005)',
          ],
          library: ['traditional/deity/osiris', 'traditional/deity/isis', 'traditional/deity/anubis'],
        },
      ],
      practices: [
        {
          id: 'osiris-shrine',
          title: 'Set up his shrine',
          instructions: `Choose a quiet shelf, ideally on a west-facing wall, since the dead lived in the west. Wipe it with water that has a pinch of natron, washing soda or salt in it. Lay a white cloth (linen if you can; it was the cloth of mummies and of temples) and set his image at the back.

In front, place a water bowl, a dish for bread, an incense burner on a heatproof tile, and a candle or lamp. Add a djed pillar, green stones such as green aventurine, and a small pot or tray for sprouting grain later in the journey. Keep cedar, myrrh or frankincense to burn.

If you will remember your dead here, give them their own corner or a shelf just below, with photographs and a small cup. Egyptian shrines were closed when not in use; cover his image with a cloth between visits if you can.`,
          times: 1,
          prompt: 'Who, if anyone, did you place near his shrine, and how did it feel?',
        },
      ],
      rite: {
        title: 'Introduction to Osiris',
        summary: 'A short first visit: purify, open the shrine, greet Wennefer, offer water and incense, and tell him who you are.',
        minutes: 20,
        ingredients: [
          { name: 'Osiris', ref: 'traditional/deity/osiris' },
          { name: 'An offering bowl of cool water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Natron, washing soda or salt dissolved in a cup of water' },
          { name: 'Cedar, myrrh or frankincense incense', ref: 'traditional/herb/cedar' },
          { name: 'An incense burner on a heatproof tile', ref: 'traditional/tool/incense_burner' },
          { name: 'A white or green candle', ref: 'traditional/candle/green' },
          { name: 'A piece of bread' },
        ],
        preparation:
          'Wash your hands and face and rinse your mouth with the natron or salt water, spitting it out. Wear clean clothes. Have the shrine clean and covered. Come in the evening if you can, when the sun is in the west.',
        steps: [
          {
            title: 'Light and purify',
            instructions: 'Light the candle and incense. Touch the natron water to your lips and pass your hands through the smoke.',
            light: true,
            spoken: 'I am pure. My hands are washed, my mouth is clean. I come before the lord of the West.',
          },
          {
            title: 'Open the shrine',
            instructions: 'Uncover his image slowly.',
            spoken: 'Your face is uncovered, Wennefer. Awake in peace, lord of Abydos.',
          },
          {
            title: 'Adore',
            instructions: 'Raise both hands, palms toward him, at face height, and speak.',
            spoken: 'Homage to you, Wesir, foremost of the Westerners, lord of eternity. You who were lost and found, who were broken and made whole, who went down and lives: I greet you.',
          },
          {
            title: 'Offer',
            instructions: 'Lift the water, then the bread, toward him, and set them down. Say the spoken offering.',
            spoken: 'An offering for Wesir: cool water and bread, sweet incense, every good and pure thing. May it be pleasing to you.',
          },
          {
            title: 'Tell him who you are',
            instructions:
              'Speak in your own words: your name, why you have come, and, if you wish, the name of someone you have lost. Say that you will spend a month learning before you decide anything. Sit quietly.',
            minutes: 5,
          },
          {
            title: 'Close',
            instructions: 'Thank him, cover the shrine and snuff the candle. Step back before you turn away.',
            snuff: true,
            spoken: 'Rest in peace, Wennefer. I will come again.',
          },
        ],
        closing:
          'Eat the bread later or the next morning; that is the reversion of offerings. Pour the water on the earth. Write a few lines in your journal.',
        safety:
          'Keep candle and incense on a heatproof surface in a ventilated room, away from children, pets and pet birds, and never leave them burning unattended. Do not swallow the natron water.',
      },
    },
    {
      kind: 'study',
      title: 'The Story, the Mysteries and the Dead',
      intro:
        'Three lessons: his myth and the judgement of the dead; the mysteries of Abydos and Khoiak; and how Egyptians cared for their dead, the akhu. Keep the evening water at his shrine in between.',
      days: 11,
      lessons: [
        {
          id: 'osiris-myth',
          title: 'Murder, Restoration and the Hall of Judgement',
          summary: 'The Osiris myth from Egyptian sources and from Plutarch, and what it meant for the dead.',
          minutes: 8,
          sections: [
            {
              heading: 'What the Egyptian texts say',
              body: `The Pyramid Texts already know the story, but only in glimpses: Set struck Osiris down "at Nedyt" on a riverbank; Isis and Nephthys found him and wept; Horus avenged him, and Thoth helped. Later texts add that Isis, in the form of a kite, fanned breath back into him and conceived Horus. The great hymn on the stela of Amenmose, from the Eighteenth Dynasty, opens, in Budge's translation (1912): "Homage to thee, Osiris, Lord of eternity, King of the gods, whose names are manifold, whose transformations are sublime".

A long New Kingdom tale, the Contendings of Horus and Set, tells of the eighty-year lawsuit before the gods over who should inherit Osiris's throne. It is surprisingly funny and rude. In the end the court, guided by Thoth and a letter from Osiris himself in the underworld, gives the throne to Horus.`,
            },
            {
              heading: 'Plutarch’s telling',
              body: `The full version most people know is from Plutarch's On Isis and Osiris, written in Greek around 100 CE: the beautiful chest made to Osiris's measure, the banquet, the coffin thrown into the Nile, the tamarisk at Byblos, Isis's search, and Set tearing the body into fourteen pieces. Egyptian sources do sometimes speak of the body being divided, with relics kept in many towns, but the numbers vary and the chest and Byblos are known only from him.

Plutarch also gives precious details about ritual. He says that in the month Hathor, when the Nile falls and nights lengthen, "the priests celebrate doleful rites, and they exhibit as a suitable representation of the grief of Isis a gilded ox covered with a fine black linen cloth." Use Plutarch as a learned late witness, writing for Greeks, and always say when a detail is his.`,
            },
            {
              heading: 'The weighing of the heart',
              body: `For the dead, the story ends in a hall. The Book of the Dead, a collection of spells copied on papyrus for burials from about 1550 BCE, describes the dead person coming before Osiris. Their heart is weighed on a balance against the feather of Ma'at, truth and right order. Anubis checks the scales and Thoth writes the result. A monster called Ammit, part crocodile, lion and hippopotamus, waits to eat the hearts that fail. Osiris sits enthroned, with Isis and Nephthys behind him.

Before the weighing, the dead person declares their innocence before forty-two judges, each named. In the Papyrus of Nu, as Budge translated it (1899), the list includes "I have not uttered falsehood" and "I have not made another person to weep." That second line is one of the most quietly moving things in Egyptian religion.`,
            },
            {
              heading: 'What it meant',
              body: `The judgement was not a test of belief. It asked how you had lived: honestly, fairly, without cruelty or greed, with care for the hungry and the weak. That is ma'at, the order of the world kept in small daily acts. Egyptians also used spells to help them through, including one that tells the heart not to testify against its owner. They were practical people, and they hedged.

What was done for Osiris, everyone hoped would be done for them. That is the centre of his religion: a god who has been through death and comes out on the other side, and who lets the rest of us follow.`,
            },
          ],
          knowAndDont: {
            known:
              'The murder, mourning and restoration are attested from the Pyramid Texts; the judgement scene and the declarations of innocence from Book of the Dead chapter 125 in many papyri; the Contendings from Papyrus Chester Beatty I. Plutarch gives the only continuous narrative.',
            unknown:
              'There was never one official version. Different towns had different relics and stories, and how literally people took the myth is beyond our reach. The chest, Byblos and the exact fourteen pieces come only from Plutarch. The declarations of innocence varied between papyri.',
          },
          inPractice:
            'Read Book of the Dead chapter 125 in a translation you trust, and make your own short list of declarations, honest ones you could actually say. Many devotees keep a feather on the shrine as a reminder of ma’at. When you tell his story aloud, say which parts are Egyptian and which are Plutarch.',
          reflect: [
            'Which declaration of innocence could you say truthfully today? Which could you not, yet?',
            'What would it mean to you to be "made whole" after something has broken you?',
          ],
          further: [
            'The Egyptian Book of the Dead, trans. Raymond O. Faulkner, ed. Carol Andrews (1985)',
            'Plutarch, On Isis and Osiris, trans. F. C. Babbitt (Loeb, 1936; public domain, at LacusCurtius)',
            'Miriam Lichtheim, Ancient Egyptian Literature, vol. 2, for the Contendings and the Great Hymn',
          ],
          library: ['traditional/deity/thoth', 'traditional/deity/anubis', 'traditional/deity/isis'],
        },
        {
          id: 'osiris-mysteries',
          title: 'Abydos, Khoiak and the Corn-Osiris',
          summary: 'How Egyptians re-enacted his death and return each year, and the barley figures they made.',
          minutes: 8,
          sections: [
            {
              heading: 'The mysteries at Abydos',
              body: `Abydos was where Egyptians most wanted to be near Osiris. From the Middle Kingdom, people who could not be buried there set up memorial stones on "the terrace of the great god" so that they could share in his festival forever. Pilgrims left so many offering pots at the old royal cemetery that it is called Umm el-Qa'ab, "mother of pots", today.

The best account of the festival is the stela of Ikhernofret, a treasurer of King Senusret III, around 1850 BCE, now in Berlin. He was sent to refurbish the god's image and his boat-shrine, the Neshmet barque, and he describes the procession: Wepwawet, the jackal "opener of the ways", goes first; the god sails out in his barque; mock enemies attack and are driven off; Osiris goes to his tomb at a place called Peqer; and then he comes back in triumph to his temple. Some parts were public, some secret.`,
            },
            {
              heading: 'The month of Khoiak',
              body: `In the fourth month of the inundation season, Khoiak, temples across Egypt held the Osiris mysteries. Our fullest source is a set of texts carved in the small Osiris chapels on the roof of the temple of Dendera, from the Ptolemaic and Roman periods. They describe making two sacred figures. One, of Osiris as Khentyimentyu, was made from barley and sand or earth packed into a gold mould and watered daily so that it sprouted. The other, of Sokar, a Memphite god merged with Osiris, was made from earth, dates, aromatics and precious materials. The work ran from around the twelfth of the month to its end.

The figures lay in state, were taken out in processions, and at the end of the month were buried, while last year's were taken up. On the 26th came the festival of Sokar, when people wore garlands of onions. On the 30th the djed pillar was raised upright, his backbone restored, and the next day Horus was crowned.`,
            },
            {
              heading: 'Osiris beds and corn-mummies',
              body: `The idea reached homes and tombs too. Several New Kingdom tombs held an "Osiris bed": a wooden frame in the shape of the god, lined with linen, filled with earth and grain and watered so that it sprouted in the dark. Tutankhamun's tomb had one. From the Late and Ptolemaic periods come corn-mummies: small Osiris figures of earth and grain, wrapped in linen like a body and given a mask, often buried in little falcon-headed coffins. Museums from Cairo to Manchester have them.

The meaning is plain. The god's body is the earth, the seed in it is his life, and the green shoots are his return. Whoever made one was taking part in his resurrection with their own hands.`,
            },
            {
              heading: 'When is Khoiak now?',
              body: `The Egyptian civil year had 365 days and no leap day, so its months slowly slid through the seasons. Modern Kemetics place Khoiak in different ways. Calendars that start the year with the rising of Sirius in July or August put Khoiak in late October to November, which suits the sowing season. The Coptic calendar, still used by the Coptic Church and Egyptian farmers, keeps the old month names; its month Koiak runs from about 10 December to 8 January.

Neither is "the" right answer. Pick one, say why, and keep it from year to year.`,
            },
          ],
          knowAndDont: {
            known:
              'The Ikhernofret stela (Berlin 1204) and the Dendera Khoiak texts are the main sources; Osiris beds (including Tutankhamun’s) and many corn-mummies survive. The Sokar festival is shown in reliefs at Medinet Habu, and festival texts link its day with garlands of onions.',
            unknown:
              'The secret parts of the Abydos mysteries were never written down. The Dendera texts are late (Ptolemaic and Roman) and may not describe earlier practice exactly. Exact day numbers vary between sources and scholars. There is no agreed way to fix Khoiak in the modern year.',
          },
          inPractice:
            'Grow your own Osiris garden during the ten nights ahead (see the practice stage). Decide which calendar you will keep his mysteries by, and mark Khoiak in your diary. If you have pets, skip the onion garland and use a green cord or a garland of leaves instead.',
          reflect: [
            'What would it mean to make the god’s body with your own hands and watch it grow?',
            'What in your life is buried right now, and might yet sprout?',
          ],
          further: [
            'Sylvie Cauville, Le temple de Dendara: Les chapelles osiriennes (1997), for the Khoiak texts (French)',
            'Maria Centrone, Egyptian Corn-mummies (2009)',
            'Miriam Lichtheim, Ancient Egyptian Literature, vol. 1, for the Ikhernofret stela',
          ],
          library: ['traditional/deity/osiris', 'traditional/herb/cedar'],
        },
        {
          id: 'osiris-akhu',
          title: 'The Akhu: Caring for the Dead',
          summary: 'Ka, ba and akh, the offering formula, letters to the dead, and how to keep your own ancestors.',
          minutes: 7,
          sections: [
            {
              heading: 'Ka, ba and akh',
              body: `Egyptians thought of a person as several parts. The ka was the life force, which went on needing food and drink after death; offerings were made "for the ka of" someone. The ba was the personality that could move, shown as a bird with a human head that flew out of the tomb by day and back at night. The akh was what a person became when everything went right: a transfigured, effective spirit, shining and able to act. The blessed dead were the akhu.

The akhu were not distant. They could help or harm the living, they could be asked for things, and they expected to be remembered. Osiris was their king, and his care for them made it possible.`,
            },
            {
              heading: 'The offering formula',
              body: `Almost every tomb and memorial stone carries the offering formula. It begins "an offering which the king gives to Osiris, Lord of Djedu, great god, Lord of Abydos", and asks that the dead receive "an invocation offering" of bread and beer, oxen and fowl, alabaster and linen, and every good and pure thing, for their ka. The phrase for the invocation offering means "the going forth of the voice": what is spoken is given.

So many tombs add an appeal to the living. Its gist is: you who pass by, if you love life, say "a thousand of bread and beer" for me. It costs nothing but breath. Saying the formula aloud for your own dead, with their names, is one of the most traditional things you can do in an Osiris practice.`,
            },
            {
              heading: 'Letters to the dead',
              body: `When things went wrong, Egyptians sometimes wrote to their dead. Around twenty such letters survive, from the Old Kingdom to the New Kingdom, often written on a bowl that was left at the tomb with food in it. People asked a dead parent to settle a family quarrel, to help a sick child, to stand up for them in the court of the dead. In a famous New Kingdom letter in Leiden, a widower writes to his dead wife, Ankhiry, asking why she troubles him when he was always good to her.

At Deir el-Medina, the village of the royal tomb-builders, families kept small stelae to an "excellent spirit of Ra" and painted busts of their ancestors in their houses, with offerings set before them. Ancestor care was household religion, not only a temple affair.`,
            },
            {
              heading: 'Festivals of the dead',
              body: `The Wag festival, around the 18th of the first month (Thoth), was a great feast of the dead, with offerings at tombs. At Thebes, the Beautiful Festival of the Valley brought the god Amun across the river to the western cemeteries each year, and families followed to feast at their relatives' tomb chapels with music, flowers and wine. The dead were invited to the party.

That tone matters. Egyptian care of the dead was solemn but not gloomy. It was about keeping a relationship going: names spoken, food shared, news told.`,
            },
          ],
          knowAndDont: {
            known:
              'Ka, ba and akh are well documented in funerary texts. The offering formula and appeals to the living appear on thousands of monuments. Letters to the dead, Deir el-Medina ancestor stelae and busts, the Wag festival and the Beautiful Festival of the Valley are all attested.',
            unknown:
              'Egyptian ideas of the soul shifted over three thousand years and were never fully systematic; modern summaries smooth them out. We know elite practice far better than that of poor households. The exact date of the Wag festival varied between calendars.',
          },
          inPractice:
            'Make a list of your own dead whom you want to remember. Write the offering formula in your own words with their names, and say it at Osiris’s shrine. Consider writing a letter to one of them, leaving it with a small bowl of food for a night, then burying or burning it safely. Remember the dead you choose; you do not owe this to anyone who harmed you.',
          reflect: [
            'Whose names do you want spoken after you are gone? Whose names do you speak now?',
            'What would you write in a letter to one of your dead?',
          ],
          further: [
            'John H. Taylor, Death and the Afterlife in Ancient Egypt (2001)',
            'Alan H. Gardiner and Kurt Sethe, Egyptian Letters to the Dead (1928)',
            'Leonard H. Lesko (ed.), Pharaoh’s Workers: The Villagers of Deir el Medina (1994)',
          ],
          library: ['traditional/deity/osiris', 'traditional/vessel/bowl'],
          premade: ['hedge-ancestor-candle-evening'],
        },
      ],
      practices: [
        {
          id: 'osiris-evening-water',
          title: 'Evening water',
          instructions:
            'Each evening, wash your hands, uncover his image, pour fresh water into his bowl, raise your hands, and say one line of praise or the spoken offering. Pour out the old water on the earth. Cover the shrine.',
          times: 11,
          every: 'day',
          prompt: 'One line: what did the day leave you carrying?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'The Osiris Garden',
      intro:
        'For ten nights, one Egyptian "week", you will tend a small Osiris bed of sprouting barley, with an offering and a remembrance each night. Read the lesson on honouring him today before you begin.',
      days: 10,
      lessons: [
        {
          id: 'osiris-today',
          title: 'Osiris Today: Practice, Days and Care',
          summary: 'Modern communities, his offerings and days, how to keep a shrine, and the sensitive points.',
          minutes: 7,
          sections: [
            {
              heading: 'Who honours him now',
              body: `Kemetic religion, the modern revival of Egyptian religion, honours Osiris as one of its central gods. Reconstructionists work closely from the sources, often keeping a Khoiak observance with grain gardens and an ancestor practice built on the offering formula. Kemetic Orthodoxy, an organised temple founded in 1988 by Tamara Siuda, holds its own Osiris festivals in its calendar and keeps purity customs. Many people practise independently.

Outside Kemetic religion, Wiccans and other Pagans often honour Osiris as a god of death and rebirth, sometimes paired with Isis as God and Goddess. That is a modern pairing with its own logic. If that is your path, honour him there, and know that Egyptian practice is different.`,
            },
            {
              heading: 'What to give him',
              body: `Bread and beer were the offerings of the formula itself, so they are the most traditional gifts. Cool water, called qebehu, was poured for Osiris and for the dead; it was thought to come from his own body, the flood. Grain, especially barley, suits him, raw or as bread. Incense of cedar, myrrh or frankincense; flowers, especially fresh green things; linen. Speech: the offering formula, a hymn, the names of the dead.

Present each thing with both hands, say what it is, leave it a while, then eat or share the food (the reversion of offerings). Water goes on the earth. Do not leave food to rot; that is neglect, not devotion.`,
            },
            {
              heading: 'His days',
              body: `His birthday is the first of the five epagomenal days at the end of the Egyptian year, just before Wep Ronpet, the new year. Khoiak is his great season, with the corn-Osiris, the Sokar festival on the 26th and the raising of the djed on the 30th. The Wag festival of the dead falls around the 18th of the first month. Plutarch gives the 17th of the month Hathor as the day of his death. Egyptian calendars of lucky and unlucky days, such as the Cairo Calendar, tie many days to episodes of his myth, and devotees often keep such days quietly.

Modern calendars differ, so choose one and keep it. Many people also honour Osiris on the anniversaries of their own dead.`,
            },
            {
              heading: 'Sensitive points',
              body: `His myth includes a murder, a dismembered body and, in Plutarch, a lost phallus that Isis replaced. Egyptian sources are more reticent. Be matter-of-fact about it; it is about restoration, not gore.

Grief is the big one. Osiris is a god for the bereaved, but working with death can open old wounds. Keep rites short when you are raw, and ask for help from people when you need it. Never use his practice to avoid medical or psychological care. If grief becomes too heavy, talk to your doctor or a bereavement service; if you are in crisis, call your local emergency number or a crisis line (988 in the US, Samaritans on 116 123 in the UK and Ireland).

And go easy on comparisons. Osiris is often lined up with Jesus, Dionysus or Adonis as a "dying-and-rising god". He does not rise to walk among the living again; he becomes king of the dead. Respect what makes him himself.`,
            },
          ],
          knowAndDont: {
            known:
              'Water libations, bread and beer, the epagomenal birthdays and the Khoiak festivals are well attested. Calendars of lucky and unlucky days (such as Papyrus Cairo 86637) survive.',
            unknown:
              'There is no single modern Kemetic calendar, and ancient dates drifted against the seasons. Modern pairings of Osiris with Isis as Wiccan God and Goddess are modern. Scholars disagree about how far Osiris fits any wider category of "dying gods".',
          },
          inPractice:
            'Fix your offering habit: water most evenings, bread and beer weekly, a fuller offering and the names of your dead on his days. Mark his birthday, Khoiak and the Wag festival in your calendar. Keep grief rites short and gentle, and pair them with real-world support.',
          reflect: [
            'Which of his days will you keep, and how will you mark them?',
            'How will you know if this practice is helping your grief, or keeping you stuck in it?',
          ],
          further: [
            'Richard J. Reidy, Eternal Egypt: Ancient Rituals for the Modern World (2010)',
            'Jonathan Z. Smith, "Dying and Rising Gods", in the Encyclopedia of Religion (1987)',
          ],
          library: ['traditional/deity/osiris', 'traditional/crystal/green_aventurine', 'traditional/crystal/malachite'],
          premade: ['hedge-letting-go-of-the-dead'],
        },
      ],
      practices: [
        {
          id: 'osiris-garden',
          title: 'Ten nights of the Osiris garden',
          instructions: `On the first night, take a shallow tray or dish. Draw or cut a simple Osiris outline (a mummy shape is enough) from cardboard or make the shape from a ring of string, and fill it with a thin layer of damp potting compost or a folded paper towel. Scatter barley (or wheat, or any sprouting seed) thickly over it and press it in. Set it near the shrine, out of direct sun.

Each night: wash, uncover the shrine, light the candle and incense, and raise your hands to Osiris. Water the garden lightly with the offering water, saying "Your water for you, Wesir". Offer bread, and speak the offering formula for one of your dead, by name. Then journal.

Night 1: sowing. Night 2: the murder at Nedyt. Night 3: Isis and Nephthys weeping. Night 4: the first shoots. Night 5: Anubis and the embalming. Night 6: Thoth and Horus. Night 7: the hall of judgement. Night 8: the akhu, your dead. Night 9: the djed raised. Night 10: the green god; what has grown in you?

On the last night, thank him. Later you can lay the sprouted garden in the earth, as the Egyptians buried their corn-Osiris.`,
          times: 10,
          every: 'day',
          prompt: 'How is the garden growing? What did tonight’s theme bring up, and whose name did you speak?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Weighing the Heart',
      intro:
        'Take a few quiet days, keeping only the evening water. Reread your journal. Discernment is not a test you pass; deciding to wait, to stop, or to honour another god instead is a good and honest outcome.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'osiris-reread',
          title: 'Reread and weigh',
          instructions:
            'Read your journal from the start. Put a feather or a light object on one side of you and your journal on the other, as a reminder of the scales, and answer the questions below honestly.',
          times: 1,
          prompt: 'What did this month with Osiris actually give you, and what did it cost?',
        },
      ],
      questions: [
        'Are you drawn to Osiris himself, or mainly to what he offers in a time of grief? Both are honest, but they may lead to different choices.',
        'Can you keep a practice with a god of the dead without it darkening your days? What would keep it balanced?',
        'Will you honour him in an Egyptian frame, a Wiccan or eclectic one, or a conscious mix, and can you say which at his shrine?',
        'Is there a Kemetic community you would rather learn from or join first, whose rites and training would serve you better than a self-dedication?',
        'If you choose to pause or stop, can you thank him, bury the garden and close the shrine without guilt? That is a good ending too.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The Dedication',
      intro:
        'If you choose to go on, this is your self-dedication: a promise you make yourself to Osiris. It is not an initiation into any Kemetic or other group, and does not replace one. An evening is best, when the sun is in the west; his birthday, a night in Khoiak, or the anniversary of a death you carry are all fitting.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-Dedication to Osiris',
        summary: 'A full evening rite in the Egyptian shape: purification, opening, adoration, the offering formula for god and dead, the vow, the raising of the djed, the reversion and closing.',
        minutes: 45,
        ingredients: [
          { name: 'Osiris', ref: 'traditional/deity/osiris' },
          { name: 'An offering bowl of cool water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Natron, washing soda or salt in a cup of water' },
          { name: 'Bread, and beer or another drink', ref: 'traditional/vessel/dish' },
          { name: 'Cedar, myrrh or frankincense and an incense burner', ref: 'traditional/herb/myrrh' },
          { name: 'A green or white candle', ref: 'traditional/candle/white' },
          { name: 'Your sprouted Osiris garden, or a handful of barley' },
          { name: 'A djed pillar image or amulet, lying down at the start', optional: true },
          { name: 'Names or photographs of your dead', optional: true },
          { name: 'Your vow, written by hand' },
        ],
        preparation: `Write your vow during the day: what you will do (evening water, the offering formula for your dead, his festivals, honest living by ma'at), for how long (a year and a day is common), and what you hope for. Keep it small enough to keep.

Bathe, rinse your mouth with natron or salt water, and dress in clean white or linen. Clean the shrine and set it out, with the djed image lying flat before the god. Cover his image.`,
        steps: [
          {
            title: 'Purify',
            instructions: 'Light the candle and incense. Wash your hands in the natron water, touch it to your lips, and pass your hands through the smoke.',
            light: true,
            spoken: 'I am pure, I am pure. I have washed, I have passed through the smoke. I come to the lord of the West with clean hands.',
          },
          {
            title: 'Open the shrine',
            instructions: 'Uncover his image slowly.',
            spoken: 'The doors are opened. Your face is uncovered, Wennefer, lord of Abydos. Awake in peace.',
          },
          {
            title: 'Adore',
            instructions: 'Raise both hands, palms toward him, and speak the praise.',
            spoken: 'Homage to you, Wesir, foremost of the Westerners, lord of eternity, ruler of the living. Green one, black one, lord of the flood and the grain. You who went down and lives: I praise you.',
          },
          {
            title: 'The offering formula',
            instructions:
              'Lift the water, bread and drink toward him and set them down. Say the offering for him, then for each of your dead by name.',
            spoken: 'An offering for Wesir, lord of Djedu, great god, lord of Abydos: water and bread, drink and incense, every good and pure thing. And may he give a voice-offering of bread and beer, of every good thing, for the ka of [name].',
          },
          {
            title: 'Speak your vow',
            instructions: 'Read your written vow aloud, slowly and clearly.',
            spoken: 'This is my word, spoken in truth before the lord of ma’at. Hear me, Wennefer.',
          },
          {
            title: 'Raise the djed',
            instructions:
              'Take up the djed image or amulet and stand it upright before him, or hold the sprouted garden up toward him. This is the last act of the Khoiak mysteries: the god made whole and standing.',
            spoken: 'Your backbone is raised, your limbs are gathered. Stand, Wesir. You are stable, you endure, and I stand with you.',
          },
          {
            title: 'Sit with him',
            instructions: 'Sit in silence before him. If you wish, sit also with the memory of your dead.',
            minutes: 10,
          },
          {
            title: 'Reversion and closing',
            instructions:
              'Thank him. Eat a piece of the bread. Lay your vow inside the shrine or under the djed. Cover his image and snuff the candle. Step back before you turn.',
            snuff: true,
            spoken: 'What you have received, I share. Rest in peace, Wennefer. I am yours, and I will return.',
          },
        ],
        closing:
          'Pour the water on the earth the next morning. Bury the sprouted garden in a pot or in the ground, as the corn-Osiris was buried. Record the rite in your journal.',
        safety:
          'Keep flame and incense on heatproof surfaces in a ventilated room, away from children, pets and pet birds, and never unattended. Mouldy compost can trigger allergies; use fresh compost or paper towel and discard any garden that grows mould. Do not eat sprouts grown in soil. Keep onions and alcohol away from pets.',
      },
    },
    {
      kind: 'ongoing',
      title: 'The Green Year',
      intro:
        'After the dedication comes the long, quiet part: evening water, the names of the dead, his festivals through the year, and a yearly renewal of your vow.',
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'osiris-daily',
          title: 'Evening water and a name',
          instructions:
            'Most evenings, give him fresh water and speak a line of praise. Once a week, say the offering formula for one of your dead.',
          times: 365,
          every: 'day',
        },
        {
          id: 'osiris-holy-days',
          title: 'His holy days',
          instructions: `Keep his birthday on the first epagomenal day; the Wag festival of the dead around the 18th of the first month, with offerings for your akhu; and the Khoiak mysteries. For Khoiak, sow a new Osiris garden early in the month, tend it daily, keep a quiet day of mourning, mark the Sokar festival on the 26th with a green garland, raise the djed on the 30th, and bury the garden at the month's end.

Use the calendar you chose in the study stage, and keep it year to year.`,
          times: 3,
          every: 'holy-day',
          prompt: 'How did you keep the day, and who did you remember?',
        },
        {
          id: 'osiris-renewal',
          title: 'Yearly rededication',
          instructions:
            'On the anniversary of your dedication, or at the end of Khoiak, reread your vow, write a new one, and repeat the dedication rite. Change the promise honestly. If you are ending the dedication, thank him, give a final offering and close the shrine with care.',
          times: 1,
          prompt: 'What has a year with Osiris grown in you?',
        },
      ],
    },
  ],
  sources: [
    'Great Hymn to Osiris (stela of Amenmose, Louvre C 286), trans. E. A. Wallis Budge, Legends of the Gods (1912), Project Gutenberg ebook 9411: "Homage to thee, Osiris, Lord of eternity…"',
    'Plutarch, On Isis and Osiris §39, in the translation printed in Budge, Legends of the Gods (1912), Project Gutenberg ebook 9411: "the priests celebrate doleful rites…"',
    'Book of the Dead ch. 125 (Papyrus of Nu), trans. E. A. Wallis Budge, Egyptian Ideas of the Future Life (1899), Project Gutenberg ebook 11277: "I have not uttered falsehood", "I have not made another person to weep"',
    'Stela of Ikhernofret (Berlin 1204); the Dendera Khoiak texts; Papyrus Chester Beatty I (Contendings of Horus and Set)',
    'Plutarch, On Isis and Osiris, trans. F. C. Babbitt (Loeb, 1936; public domain), LacusCurtius',
    'John H. Taylor, Death and the Afterlife in Ancient Egypt (2001); Bojana Mojsov, Osiris (2005); Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt (2003)',
    'Alan H. Gardiner and Kurt Sethe, Egyptian Letters to the Dead (1928)',
    'Jonathan Z. Smith, "Dying and Rising Gods", Encyclopedia of Religion (1987)',
  ],
};
