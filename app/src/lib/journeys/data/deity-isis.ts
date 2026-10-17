import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-isis',
  kind: 'deity',
  paths: ['egyptian', 'roman', 'wheel'],
  deityRef: 'traditional/deity/isis',
  title: 'Isis: Great of Magic',
  summary:
    'A month with Aset, the throne-goddess of Egypt who gathered what was scattered, and with the Isis of the Roman mysteries she later became. Study, a ten-night offering, and a self-dedication.',
  welcome: `This journey spends about a lunar month with Isis. You will meet her twice: first as Aset, an Egyptian goddess whose temples stood for three thousand years, and then as the Isis of the Greek and Roman world, whose mysteries spread from Alexandria to Britain. The two are related, and they are not the same thing, and much of the honesty of this path lies in keeping them apart.

You will set up a small shrine, learn her myths from the Egyptian texts and from Plutarch's later retelling, learn how she was actually served, and keep a ten-night offering, one Egyptian "week". At the end you may dedicate yourself to her, or decide not to. Either is a good ending.

This is a self-dedication. It is not an initiation into Kemetic Orthodoxy, the Fellowship of Isis or any other group, and it does not replace one.`,
  about: `Isis (Egyptian Aset or Iset, written with the hieroglyph of a throne) was daughter of the earth god Geb and the sky goddess Nut, sister and wife of Osiris, sister of Nephthys and Set, and mother of Horus. In Egypt she was above all the protector: the throne the king sat on, the widow who searched for her murdered husband and restored him, the mother who hid her child in the marshes and healed him of scorpion stings. She was called Weret-hekau, "great of magic", because her words worked. Her worship grew in the Late Period and under the Ptolemies, and her temple at Philae was among the last places in Egypt where the old religion was kept, into the fifth or sixth century CE. Meanwhile Greeks and Romans took her up as a universal goddess "of many names", with initiations, processions and daily temple services from Delos to Pompeii to London. Today she is honoured in Kemetic religion (reconstructionist groups and Kemetic Orthodoxy), by the Fellowship of Isis, and widely in Wicca and eclectic Paganism, where she often stands for the Goddess herself.`,
  notes: [
    'Egyptian Isis and Graeco-Roman Isis are different layers. The famous story of the chest at Byblos and the fourteen pieces comes from Plutarch, a Greek priest at Delphi writing around 100 CE, not from Egyptian texts.',
    'Lucius Apuleius’ account of the Isis mysteries (The Golden Ass, book XI) is a novel. It is precious evidence, but it is a Roman writer describing a Roman cult.',
    'Isis was not a "moon goddess" in Egypt; that link is Greek and later. Many modern associations (moonstone, the moon, the Goddess with a capital G) are modern and fine to use if you know they are modern.',
    'Kemetic religion is a living practice. Kemetic Orthodoxy and reconstructionist groups have their own rites and some keep purity customs strictly. Ask before you join their spaces, and do not present this journey’s rites as theirs.',
    'Egypt’s heritage belongs first to Egyptians, most of whom today are Muslim or Coptic Christian. Do not buy ancient artefacts without a documented legal history; museum reproductions are better offerings than looted amulets.',
    'Pet safety: lilies are deadly to cats (use lotus pictures, not real lilies), and grapes, raisins and wine are dangerous for dogs. Keep incense away from pet birds.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'At the Throne',
      intro:
        'Begin by learning who she is and making a clean place for her. The threshold ends with a short introduction rite: you tell her your name and why you have come, and you make your first offering of water and incense.',
      days: 3,
      lessons: [
        {
          id: 'isis-who',
          title: 'Aset, the Throne',
          summary: 'Her name, her family, how she was pictured and what she was called.',
          minutes: 6,
          sections: [
            {
              heading: 'A name that is a seat',
              body: `Her Egyptian name was Aset (often written Iset or Ast). It is spelled with a single sign, a high-backed throne, and that throne is what she wears on her head in the oldest images. Egyptologists still argue about what the name means, but the picture says something plain: Isis is the seat of kingship. The living king was "son of Isis" because he sat on her, in a sense, the way a child sits on its mother's lap. Statues of Isis nursing the infant Horus on her knee show the same idea in a softer form.

"Isis" is the Greek form of the name, and it is the one most people use today. Kemetic practitioners often prefer Aset, and either is respectful.`,
            },
            {
              heading: 'Her family',
              body: `In the theology of Heliopolis she was one of nine great gods, the Ennead: Atum the creator, his children Shu and Tefnut (air and moisture), their children Geb and Nut (earth and sky), and Geb and Nut's four children, Osiris, Isis, Set and Nephthys. Calendar texts and Plutarch say these four, with Horus the Elder, were born on the five extra days at the end of the Egyptian year, Isis on the fourth.

Osiris was her brother and husband, a pairing that sounds strange now but echoed the marriages of Egyptian royalty. Nephthys was her sister and constant companion in mourning. Set, their brother, murdered Osiris. Horus, her son by Osiris, grew up to avenge his father and take the throne. Almost everything Isis does in myth turns on these relationships: she is wife, widow, sister and mother, and in every role she protects.`,
            },
            {
              heading: 'How she was pictured',
              body: `The usual form is a woman in a close sheath dress with the throne sign on her head. From the New Kingdom on she often wears the cow horns and sun disc that belonged first to Hathor, so the two goddesses can be hard to tell apart without the inscription. She is shown with wide wings stretched out to protect, sometimes kneeling at the foot of a coffin. In funerals she and Nephthys were the two kites, the birds of prey whose thin cries sounded like women keening; two women played their parts and mourned over the dead.

Her amulet was the tyet, a knotted cloth sometimes called the "knot of Isis" or the "blood of Isis". The Book of the Dead (chapter 156) directs that it be made of red jasper or carnelian and placed on the dead. In the Roman world her priestesses wore a fringed mantle tied in a knot between the breasts, and carried the sistrum, a bronze rattle, and a situla, a small bucket for Nile water.`,
            },
            {
              heading: 'What she was called',
              body: `Her titles are a short course in who she is. Weret-hekau, "great of magic". Mut-netjer, "mother of the god". Lady of Heaven. Lady of Philae. The one "effective of speech", whose words do not fail. Heka, the Egyptian word usually translated "magic", was not something set against religion: it was a divine power by which the creator made the world and by which gods and people could heal, protect and change things. Isis was its great mistress, and she used it to bring back the dead and to heal the sick.

In Greek she became myrionymos, "of ten thousand names", the goddess who is called by every other goddess's name. That universal Isis is real, and she belongs mostly to the Graeco-Roman layer you will meet later in this journey.`,
            },
          ],
          knowAndDont: {
            known:
              'Her name, iconography, family and main titles are well attested in Egyptian texts from the Pyramid Texts (around 2350 BCE) onward, and in temples, amulets and funerary art. Her importance grew greatly in the first millennium BCE.',
            unknown:
              'The etymology of "Aset" is uncertain. We do not know how prominent she was in the earliest periods compared with later ones; she appears in the Pyramid Texts mostly in relation to Osiris and the king. Her link with the moon is Graeco-Roman, not Egyptian.',
          },
          inPractice:
            'Learn to say "Aset" and "Weret-hekau" aloud, and choose which name you will use at your shrine. Find an image you can live with: a statue reproduction, a museum photograph of Isis nursing Horus, or a winged Isis from a coffin or shrine. Many devotees also wear or keep a tyet amulet in red stone or glass.',
          reflect: [
            'What does it mean to you that her name is a seat, a place where someone else is held up?',
            'Which of her roles (wife, widow, sister, mother, magician) draws you, and which unsettles you?',
          ],
          further: [
            'Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt (2003), entry on Isis',
            'Geraldine Pinch, Egyptian Mythology: A Guide to the Gods, Goddesses, and Traditions of Ancient Egypt (Oxford, 2004; first published 2002 as Handbook of Egyptian Mythology)',
          ],
          library: ['traditional/deity/isis', 'traditional/deity/osiris', 'traditional/deity/hathor', 'traditional/crystal/carnelian'],
        },
      ],
      practices: [
        {
          id: 'isis-shrine',
          title: 'Set up her shrine',
          instructions: `Choose a shelf or small table that you can keep clean, ideally at or above waist height. Wipe it down with water that has a pinch of salt or natron (washing soda or baking soda will do) dissolved in it; Egyptian ritual began with purity, and cleaning the place is the first offering.

Lay a clean white or blue cloth, preferably linen or cotton. Set her image at the back, facing you. In front of it place a bowl for water, a small dish for food, an incense burner on a heatproof tile, and a candle or oil lamp. Add, if you like, a tyet, a sistrum or a small rattle, lapis lazuli or carnelian, and a picture of a lotus.

Egyptian shrines were closed boxes with doors. If you can, use a cabinet or a box with a lid, or drape a cloth over the image when you are not with her, and "open" her shrine when you come.`,
          times: 1,
          prompt: 'How did it feel to make a place for her? What did you choose and why?',
        },
      ],
      rite: {
        title: 'Introduction to Isis',
        summary: 'A short first visit: purify, open the shrine, greet her by name, offer water and incense, and tell her why you have come.',
        minutes: 20,
        ingredients: [
          { name: 'Isis', ref: 'traditional/deity/isis' },
          { name: 'An offering bowl of fresh, cool water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A pinch of natron, washing soda or salt in a cup of water, for washing' },
          { name: 'Myrrh or frankincense on charcoal, or a resin incense stick', ref: 'traditional/herb/myrrh' },
          { name: 'An incense burner on a heatproof tile', ref: 'traditional/tool/incense_burner' },
          { name: 'A white or blue candle', ref: 'traditional/candle/blue' },
          { name: 'A rattle, sistrum or small bell', optional: true },
        ],
        preparation:
          'Wash your hands and face and rinse your mouth with the natron or salt water (spit it out; do not swallow it). Put on clean clothes. Make sure the shrine is clean and closed or covered. Turn off your phone.',
        steps: [
          {
            title: 'Light and purify',
            instructions:
              'Light the candle, then the incense. Pass your hands through the smoke and touch a drop of water to your lips and forehead.',
            light: true,
            spoken: 'I am pure. I have washed my hands and my mouth. I come to the house of Aset clean.',
          },
          {
            title: 'Open the shrine',
            instructions:
              'Open the doors or lift the cloth from her image. In the temples this was the moment the god "showed the face". Shake the rattle or ring the bell softly a few times.',
            spoken: 'The doors of heaven are opened. Your face is uncovered, Aset. Awake in peace.',
          },
          {
            title: 'Adore',
            instructions:
              'Raise both hands, palms toward her, at the height of your face. This is the Egyptian gesture of praise, the one carved on countless stelae. Hold it while you speak.',
            spoken: 'Homage to you, Aset, great of magic, mother of the god, lady of heaven. You who sought and found, you who gathered and made whole: I greet you.',
          },
          {
            title: 'Offer water and incense',
            instructions:
              'Lift the water bowl toward her, then set it before the image. Hold the incense up for a moment.',
            spoken: 'Take this cool water, Aset. Take this sweet smoke. I give them to you freely.',
          },
          {
            title: 'Say why you have come',
            instructions:
              'Speak plainly, in your own words: your name, what drew you to her, and that you will spend a month learning about her before you decide anything. Then sit quietly for a few minutes.',
            minutes: 5,
          },
          {
            title: 'Close and withdraw',
            instructions:
              'Thank her. Close or cover the shrine. Snuff the candle. Egyptian priests walked backward out of the sanctuary, sweeping away their footprints; you can simply step back before turning away.',
            snuff: true,
            spoken: 'Go in peace, Aset. I will come again.',
          },
        ],
        closing:
          'Leave the water until the next morning, then pour it on a plant or the earth outside rather than down the sink. Write in your journal what you said and anything you noticed.',
        safety:
          'Burn charcoal and incense only on a heatproof dish with a tile beneath, in a ventilated room, away from curtains, children, pets and especially pet birds. Never leave a flame unattended. Natron and washing soda irritate eyes; rinse your mouth with a very weak solution and do not swallow it.',
      },
    },
    {
      kind: 'study',
      title: 'The Story and the Service',
      intro:
        'Three lessons: her myths and where we get them, how Egyptians actually served her, and how she became the Isis of Rome. Read one every few days and keep visiting the shrine with water in between.',
      days: 11,
      lessons: [
        {
          id: 'isis-myths',
          title: 'The Search, the Marsh and the Secret Name',
          summary: 'The myths of Isis, told from the Egyptian sources first, then from Plutarch.',
          minutes: 8,
          sections: [
            {
              heading: 'The search for Osiris',
              body: `Egyptian texts never tell the whole Osiris story in one place. They allude to it, in hymns, spells and temple inscriptions, as something everyone already knew. Put together, the outline is this: Set killed his brother Osiris, and Isis, with Nephthys, searched for the body, found it, mourned over it, and by her magic made Osiris live again, long enough for her to conceive their son.

The fullest Egyptian telling is a hymn on the stela of an official named Amenmose, from the Eighteenth Dynasty, now in the Louvre. In E. A. Wallis Budge's translation (1899) it says: "The glorious Isis was perfect in command and in speech, and she avenged her brother. She sought him without ceasing, she wandered round and round the earth uttering cries of pain". And then: "She overshadowed him with her feathers, she made air (or wind) with her wings". The wings that fan breath back into the dead are why so many coffins show her with arms spread wide.`,
            },
            {
              heading: 'Plutarch’s version',
              body: `The story most people know comes from Plutarch's essay On Isis and Osiris, written in Greek around 100 CE for a priestess at Delphi named Clea. In it Set (whom Plutarch calls Typhon) tricks Osiris into a beautiful chest at a banquet, nails it shut and throws it into the Nile. The chest drifts to Byblos on the Lebanese coast, where a tamarisk grows around it and the king makes the trunk a pillar of his palace. Isis, disguised, becomes nurse to the queen's baby and burns away his mortality in the fire each night, until the queen screams and breaks the spell. Isis recovers the chest, Set finds it again, tears the body into fourteen pieces and scatters them, and Isis searches the land and buries each piece where she finds it, which is why so many towns claimed a tomb of Osiris.

Plutarch was a serious priest and read Egyptian informants, and some of his details match Egyptian sources. But Byblos, the burning baby and the chest belong to his Greek-era telling, and he interprets the whole thing through Greek philosophy. Use him as a late witness, not as the Egyptian original.`,
            },
            {
              heading: 'In the marshes of Chemmis',
              body: `After Horus was born, Isis hid him in the papyrus thickets of the Delta, at a place the Greeks called Chemmis, to keep him from Set. Many of the most loved stories of Isis come from this time and from healing texts. On the Metternich Stela, a magical stone from the fourth century BCE now in the Metropolitan Museum, Isis walks out guarded by seven scorpions. A rich woman shuts her door on them; one scorpion slips under it and stings the woman's son. Isis, who holds no grudge against the child, lays her hands on him and names each scorpion's poison and commands it out, and he lives.

Healers repeated those words over people who had been stung. Stelae of the child Horus standing on crocodiles were set up in houses and temples, and water poured over their carved spells was drunk as medicine. This is Isis at her most practical: magic as first aid, a mother's words lent to every mother.`,
            },
            {
              heading: 'The secret name of Ra',
              body: `A New Kingdom papyrus in Turin tells how Isis, wanting the power of the old sun god, made a snake from his own spittle mixed with earth and left it on his path. It bit him, and none of the gods could heal him. Isis offered to, if he would tell her his true name. He listed his deeds instead. In Budge's translation (1914): "I open my eyes, and there is light; I shut my eyes, and there is darkness." Isis was not fooled, and at last the name passed from his body into hers, and she drew the poison out.

The story was itself a healing spell against snakebite. It also says something about Isis that later admirers liked to forget: she is clever, ambitious and willing to wound in order to heal. She is no gentle, passive mother.`,
            },
          ],
          knowAndDont: {
            known:
              'The search and lament are attested in the Pyramid Texts, the Great Hymn to Osiris (stela of Amenmose, Louvre C 286), the Lamentations of Isis and Nephthys (Bremner-Rhind papyrus), the Metternich Stela and the Turin papyrus. Plutarch gives the only continuous narrative.',
            unknown:
              'No Egyptian source tells the myth from start to finish, and versions differed by place and period: some towns had the body whole, others in pieces (fourteen, sixteen or forty-two). The Byblos episode and the chest are known only from Plutarch and may reflect Graeco-Phoenician influence. How literally Egyptians took any of these stories is beyond our reach.',
          },
          inPractice:
            'Read the Great Hymn to Osiris and the Metternich Stela story in full (both are in Budge’s public-domain books, and in better modern translations). When you tell her story at your shrine, say which version you are telling. Many devotees keep a small cup of water before her image when someone in the house is ill, as a nod to the healing stelae, alongside proper medical care.',
          reflect: [
            'Isis searches without ceasing. What have you searched for that way?',
            'How do you feel about the Isis who poisons Ra to learn his name?',
          ],
          further: [
            'Plutarch, On Isis and Osiris, trans. F. C. Babbitt (Loeb, 1936; public domain, at LacusCurtius)',
            'E. A. Wallis Budge, Legends of the Gods (1912), Project Gutenberg',
            'Geraldine Pinch, Magic in Ancient Egypt (1994)',
          ],
          library: ['traditional/deity/osiris', 'traditional/deity/ra'],
        },
        {
          id: 'isis-worship',
          title: 'How Egypt Served Her',
          summary: 'Temples, the daily rite, the offering formula, purity and the reversion of offerings.',
          minutes: 7,
          sections: [
            {
              heading: 'Her houses',
              body: `For most of Egyptian history Isis was honoured in the temples of other gods, especially Osiris, and in funerary religion. Great temples of her own came later. The Iseum at Behbeit el-Hagar in the Delta, now a field of fallen granite blocks, was begun by the last native kings in the fourth century BCE and finished under the Ptolemies. Her most famous temple stands at Philae, an island near Aswan, built mostly under the Ptolemies and Romans. When the Aswan dam threatened it, the whole temple was taken apart and rebuilt on the neighbouring island of Agilkia between 1972 and 1980.

Philae kept the old rites late. The last known hieroglyphic inscription anywhere was carved there in 394 CE, and the last demotic one in the 450s. Pilgrims from Nubia came to it long after the rest of Egypt had become Christian; the temple was closed under the emperor Justinian, traditionally in the 530s.`,
            },
            {
              heading: 'The daily rite',
              body: `In every Egyptian temple the god lived in a statue inside a closed shrine, in a dark inner room only the priests entered. At dawn a priest who had washed and purified himself broke the clay seal on the shrine doors, opened them, and "saw the god". He bowed, sang hymns, censed the statue, anointed and dressed it in fresh linen, and laid out a meal of bread, beer, meat, vegetables and flowers. Then he closed the shrine, sealed it again, and walked out backward, sweeping away his footprints.

Ordinary people never saw this. Their worship was at the temple gate, at festivals when the god came out in procession in a portable boat-shrine, at household shrines, and through amulets and spells. Your home shrine sits somewhere between the two: you are both the priest who opens the doors and the person who comes to the gate.`,
            },
            {
              heading: 'The offering formula',
              body: `The most common sentence in Egyptian religion is the offering formula, carved on thousands of tombs and stelae. It begins "hetep di nesu", "an offering which the king gives", and goes on to name a god, often Osiris or Anubis, and ask that the dead person receive "bread and beer, oxen and fowl, alabaster and linen, and every good and pure thing on which a god lives". The king, as chief priest, gives to the god; the god gives in turn to the dead.

Tomb inscriptions often ask passers-by simply to say the formula, because speaking it was itself an offering, the "going forth of the voice". That is the most useful single thing to take from this lesson: in Egyptian thought, words said with care are real gifts. When you have nothing else to give Isis, you can give her a spoken offering.`,
            },
            {
              heading: 'Purity, and what happens to the food',
              body: `Priests were called wab, "pure ones". Greek visitors such as Herodotus say they shaved their bodies, washed in cold water twice a day and twice a night, wore linen and papyrus sandals, and kept away from certain foods and from sex before service. These rules were for priests on duty in temples, but the idea behind them is simple to keep at home: come to the shrine washed, in clean clothes, with a clean mouth.

After the god had received the offering, the food was not thrown away. Texts call it the "reversion of offerings": it passed from the god's altar to other shrines, to the statues of the dead, and finally to the priests and temple staff, who ate it. Nothing was wasted. At home that means you may eat the bread you offered, or share it, once she has had it, usually after the rite or the next morning. Liquids that cannot be drunk go to the earth.`,
            },
          ],
          knowAndDont: {
            known:
              'The daily temple ritual is known in detail from New Kingdom temple walls (especially Abydos) and papyri; the offering formula from thousands of monuments; the reversion of offerings from temple texts and administrative records. Philae’s late inscriptions are dated.',
            unknown:
              'Much of what we "know" about priestly purity comes from Greek writers like Herodotus and Plutarch, and rules varied by temple and period. We know far less about what ordinary people did at home than about temple liturgy. The exact date and manner of Philae’s closure is debated by historians.',
          },
          inPractice:
            'Make purity a habit, not a fuss: wash hands and face and rinse your mouth before each visit. Use the shape of the daily rite (purify, open, adore, offer, close, withdraw) for your own visits. Learn a short version of the offering formula in your own words and say it when you offer. Eat or share the bread afterwards, and give liquids to a plant or the ground.',
          reflect: [
            'What would it change if you treated the words you say to her as gifts in themselves?',
            'Which purity customs feel meaningful to you, and which feel like a burden?',
          ],
          further: [
            'Emily Teeter, Religion and Ritual in Ancient Egypt (2011)',
            'Byron E. Shafer (ed.), Temples of Ancient Egypt (1997)',
          ],
          library: ['traditional/vessel/offering_bowl', 'traditional/herb/frankincense', 'traditional/herb/myrrh'],
          premade: ['folk-thoth-offering'],
        },
        {
          id: 'isis-rome',
          title: 'Isis of Many Names: the Roman Mysteries',
          summary: 'How Isis spread across the Mediterranean, what her mysteries involved, and why it matters which Isis you are honouring.',
          minutes: 8,
          sections: [
            {
              heading: 'Out of Egypt',
              body: `After Alexander's conquest the Greek Ptolemies ruled Egypt from Alexandria, and they promoted Isis alongside a new god, Serapis, a blend of Osiris and the Apis bull in Greek dress. Sailors and merchants carried her cult out along the sea routes. By the second century BCE there were Isis temples on Delos; by the first century CE she was worshipped in Rome itself, in a great temple on the Campus Martius, as well as in Pompeii, where her small temple survived the eruption of 79 CE almost whole, with paintings of priests and rites still on the walls. An inscribed jug from London mentions a temple of Isis there.

In this world she became a universal goddess. Greek hymns called aretalogies have her list her own deeds: she separated earth from sky, gave laws and language, invented sailing and marriage. These are Greek compositions, with no clear Egyptian original, though they draw on Egyptian ideas of her power.`,
            },
            {
              heading: 'Apuleius and the goddess of the sea',
              body: `Our best witness is a novel. In the second century CE Lucius Apuleius wrote the Metamorphoses, better known as The Golden Ass, about a young man turned into a donkey by bungled magic. In book XI, at the end of his misery, he prays on a beach under the full moon, and the goddess rises from the sea. In William Adlington's translation of 1566 she tells him that "my name, my divinity is adored throughout all the world in divers manners, in variable customes and in many names", and that "the Aegyptians which are excellent in all kind of ancient doctrine, and by their proper ceremonies accustome to worship mee, doe call mee Queene Isis."

She tells him to come to her festival the next day, the Navigium Isidis or "Ship of Isis", held on 5 March to open the sailing season. Apuleius describes it lovingly: people in costume, women scattering flowers, initiates in white linen shaking sistra, priests with shaved heads carrying sacred objects, and a new ship, its sail painted with prayers, launched loaded with offerings into the sea. Lucius eats roses from a priest's garland and becomes a man again.`,
            },
            {
              heading: 'The initiation',
              body: `Lucius then joins her service and, after waiting for her call in dreams, is initiated. He is bathed, told secrets he may not repeat, and fasts for ten days from meat and wine. At night, in a linen robe, he is taken into the inner temple. He will say only this: "Thou shalt understand that I approached neere unto Hell, even to the gates of Proserpina, and after that, I was ravished throughout all the Element, I returned to my proper place: About midnight I saw the Sun shine". In the morning he is shown to the people dressed as the sun, with a torch and a crown of palm.

The Isiac temples also kept daily services that echo Egypt's: the shrine opened at dawn with hymns and water drawn from a sacred vessel, and closed at evening. Each autumn, in late October and early November, the Isia re-enacted Isis's grief and search for Osiris, ending in a joyful cry that he was found.`,
            },
            {
              heading: 'Why the distinction matters',
              body: `The Roman mysteries were not the Egyptian cult with a Latin accent. Egyptian religion had no initiation that promised an individual salvation of this kind; the Roman Isis offered something new, a personal bond with a saviour goddess. Both are real ways people have loved her. But when someone tells you Isis "is" the moon, or that Egyptians held secret Isis initiations, they are usually blending the layers.

Many people also claim the Virgin Mary's iconography was copied from Isis nursing Horus. The images are similar and Isis statues were known in early Christian Egypt, but scholars disagree about how direct any borrowing was. Treat it as an open question, not a fact.`,
            },
          ],
          knowAndDont: {
            known:
              'Isis temples at Delos, Pompeii, Rome and elsewhere are excavated; the Navigium Isidis on 5 March and the Isia in autumn appear in Roman calendars (the Calendar of 354) and in Apuleius. Apuleius gives the only first-person account of an Isis initiation.',
            unknown:
              'Apuleius wrote fiction, and how closely book XI follows real practice is debated, though most scholars think he knew the cult well. The secret core of the initiation was never written down. The relationship between Isis imagery and Christian Madonna imagery is contested.',
          },
          inPractice:
            'Decide which Isis you are approaching: the Egyptian Aset, the Graeco-Roman Isis Myrionymos, or the Goddess of modern Paganism, or a conscious blend. Read book XI of The Golden Ass (it is short and free on Project Gutenberg). If you honour the Roman Isis, the Navigium on 5 March is a lovely festival to keep: a paper or wooden boat, flowers, and a wish for safe journeys, set on water or kept on the shrine.',
          reflect: [
            'Which Isis are you actually drawn to, the Egyptian protector or the universal saviour of the mysteries?',
            'Lucius waited for a call in dreams before his initiation. How do you know when it is time to commit?',
          ],
          further: [
            'Apuleius, The Golden Ass, book XI, trans. William Adlington (1566), Project Gutenberg',
            'R. E. Witt, Isis in the Ancient World (1971)',
            'Sharon Kelly Heyob, The Cult of Isis among Women in the Graeco-Roman World (1975)',
          ],
          library: ['traditional/herb/rose', 'traditional/deity/venus', 'traditional/deity/ceres'],
        },
      ],
      practices: [
        {
          id: 'isis-water',
          title: 'Fresh water at the shrine',
          instructions:
            'Each morning, wash your hands and face, open her shrine, pour fresh cool water into her bowl, raise your hands in greeting and say a sentence of praise. Pour yesterday’s water on a plant. Close the shrine. Two minutes is enough.',
          times: 11,
          every: 'day',
          prompt: 'One line: what was in your mind as you poured the water?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'The Ten Nights',
      intro:
        'The Egyptian month was divided into three "weeks" of ten days. For one of them, you will visit Isis each night with an offering, a reading and a question. Before you start, read the lesson on how people honour her today.',
      days: 10,
      lessons: [
        {
          id: 'isis-today',
          title: 'Isis Today: Communities, Days and Offerings',
          summary: 'Who honours her now and how, what to offer, which days to keep, and the sensitive points.',
          minutes: 8,
          sections: [
            {
              heading: 'The communities',
              body: `Kemetic religion is the modern revival of Egyptian religion. Reconstructionists work from Egyptological sources, adapting temple and household practice and keeping closely to what is attested. Kemetic Orthodoxy, founded in 1988 by Tamara Siuda and based in Illinois, is an organised temple with its own priesthood, led by Siuda as its spiritual head (its Nisut), with beginners' classes and a divination rite that identifies each member's "parent" deities; it keeps its own purity rules and daily rite. Many Kemetics belong to neither and practise independently. There are also Afrocentric and diaspora groups who approach Kemet as African heritage.

The Fellowship of Isis was founded in 1976 at Huntington Castle in Clonegal, Ireland, by Olivia Robertson with her brother and his wife. It is goddess-centred and open to any faith, with its own liturgies and many local centres. Wiccans and eclectic Pagans often call on Isis as the Great Mother or as the Goddess of magic, a habit going back through Dion Fortune's novels and the Golden Dawn's "Rites of Isis" in 1890s Paris. These are all honest ways of honouring her. They are also different ways, and they are worth not mixing up.`,
            },
            {
              heading: 'What to offer and how',
              body: `Egyptian offerings were food and drink, linen, incense and flowers. For Isis, water is the first and simplest. Bread and beer were the staples of every Egyptian table and every offering list, so a piece of good bread and a small glass of beer are entirely traditional. Milk suits her, through her motherhood and her link with Hathor's cow. Wine, dates, figs, honey cakes and fresh flowers are all fitting. Myrrh and frankincense were the great temple resins. The Roman Isis loved roses, as Apuleius shows.

Offer with both hands, lifted toward the image, then set the gift down. Say what it is. Leave food for a while, during the rite or overnight, then eat or share it; that is the reversion of offerings, and it is the opposite of disrespect. Do not let things rot on the shrine.`,
            },
            {
              heading: 'Her days',
              body: `There is no single modern calendar. The Egyptian civil year had twelve months of thirty days and five extra days at the end, the epagomenal days, which were the birthdays of Osiris, Horus, Set, Isis and Nephthys. Isis's birthday is the fourth of them. The new year, Wep Ronpet, ideally fell when Sirius (the star goddess Sopdet, often identified with Isis) rose before dawn, in July in antiquity; modern Kemetics place it variously, often late July or August, depending on how they reckon. The Osiris mysteries in the month of Khoiak, late autumn in many modern calendars, are Isis's season of mourning and restoration too.

From the Roman calendar come the Navigium Isidis on 5 March and the Isia in late October and early November. Pick the calendar that fits the Isis you serve, and keep a few days well rather than many badly.`,
            },
            {
              heading: 'Sensitive points',
              body: `She is great, and some people find that intimidating. In Egypt she was approached as a powerful queen as much as a mother, with proper words and clean hands. Come politely, and do not treat her as a vending machine for spells; she was the mistress of magic, which is all the more reason to ask honestly.

Be careful with heritage. Egyptian religion is the inheritance of Egypt and of Africa, and many people of African descent find it a source of pride; respect that, and do not treat it as a costume. Avoid unprovenanced antiquities. And be honest with yourself about which layer you are working in: there is no shame in being a Wiccan who loves Isis, only in claiming that Wicca is what Egyptians did.`,
            },
          ],
          knowAndDont: {
            known:
              'Kemetic Orthodoxy, the Fellowship of Isis and the Golden Dawn’s Isis rites are documented modern movements. Traditional Egyptian offerings and the epagomenal birthdays are well attested.',
            unknown:
              'There is no agreed modern Kemetic calendar, and ancient festival dates drifted against the seasons because the civil year had no leap day. Modern associations of Isis with the moon, moonstone, or the colour blue are modern and Graeco-Roman, not Egyptian.',
          },
          inPractice:
            'Choose your community stance (independent Kemetic, eclectic, Fellowship of Isis or another), and if you want a group, contact them directly and follow their rules. Build a short offering list: water daily, bread and beer or milk weekly, incense and flowers on her days. Mark her birthday, and one or more of the Roman festivals if they speak to you.',
          reflect: [
            'Which community, if any, do you want to learn from, and what would you need to ask them?',
            'How will you keep her days without overloading your year?',
          ],
          further: [
            'Richard J. Reidy, Eternal Egypt: Ancient Rituals for the Modern World (2010)',
            'Lesley Jackson, Isis: The Eternal Goddess of Egypt and Rome (2016)',
          ],
          library: ['traditional/deity/isis', 'traditional/crystal/lapis_lazuli', 'traditional/crystal/turquoise'],
          premade: ['folk-build-your-own-ritual'],
        },
      ],
      practices: [
        {
          id: 'isis-ten-nights',
          title: 'Ten nights with Isis',
          instructions: `Each evening, wash, open the shrine, light the candle and incense, raise your hands and greet her by name. Offer water and one other thing (bread, milk, a flower, a drop of beer or wine), lifting it toward her and saying what it is. Then speak or read the night's theme, sit for five minutes, and journal. Close the shrine and snuff the flame. Eat or share the food tomorrow.

Night 1: her name and throne. Night 2: Osiris and the search. Night 3: Nephthys, her sister in mourning. Night 4: the wings that bring breath. Night 5: Horus in the marshes. Night 6: the seven scorpions and the child she healed. Night 7: the secret name of Ra. Night 8: Philae and her last temple. Night 9: the goddess of many names. Night 10: what you would ask her, and what you would offer back.

If you miss a night, pick up where you left off. A fire-safe alternative is a battery candle.`,
          times: 10,
          every: 'day',
          prompt: 'What did tonight’s theme stir in you? Did you sense anything at the shrine, or nothing at all? Both are worth writing down.',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Weighing It',
      intro:
        'Take a few days without new rites, keeping only the morning water. Read back through your journal. Dedication is a choice, not a reward for finishing; pausing, stopping, or turning to a different goddess are all good outcomes of honest discernment.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'isis-reread',
          title: 'Reread your journal',
          instructions:
            'Read everything you have written since the threshold in one sitting. Mark the moments that felt alive and the ones that felt forced. Then write a page answering the questions below.',
          times: 1,
          prompt: 'If you imagine a year of keeping her shrine, what do you feel: relief, joy, dread, indifference?',
        },
      ],
      questions: [
        'Do you want a lasting relationship with Isis herself, or were you drawn to an idea of the Goddess that may belong elsewhere?',
        'Which Isis is yours: Egyptian Aset, the Roman Isis of the mysteries, or the Isis of modern Paganism? Can you say so honestly at the shrine?',
        'Can you keep a simple practice (water, words, her days) for a year, in the life you actually have?',
        'Is there a community you should learn from first, such as a Kemetic group or the Fellowship of Isis, whose initiation or training you might want instead?',
        'If you decide to wait, or to stop, can you thank her and close the shrine with a clear heart? That is a good ending too.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The Dedication',
      intro:
        'If you have chosen to go on, this is your self-dedication: a promise you make to Isis yourself. It is not an initiation into any Kemetic, Isiac or Wiccan group, and it does not replace one. Choose an evening when you have an hour undisturbed; her birthday, the Navigium on 5 March, a full moon if you honour her Roman form, or simply a quiet night all suit.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-Dedication to Isis',
        summary: 'A full rite in the shape of the Egyptian daily service: purification, opening, adoration, offering, the vow, the reversion of offerings and closing.',
        minutes: 45,
        ingredients: [
          { name: 'Isis', ref: 'traditional/deity/isis' },
          { name: 'An offering bowl of fresh water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A cup of natron, washing soda or salt water for washing' },
          { name: 'Bread, and beer, milk or wine', ref: 'traditional/vessel/dish' },
          { name: 'Myrrh or frankincense and an incense burner', ref: 'traditional/herb/myrrh' },
          { name: 'A white, blue or gold candle', ref: 'traditional/candle/gold' },
          { name: 'Fresh flowers (roses suit the Roman Isis; no lilies if you have cats)' },
          { name: 'A tyet amulet, or a red cord to knot', ref: 'traditional/crystal/carnelian', optional: true },
          { name: 'A sistrum, rattle or bell', optional: true },
          { name: 'Your vow, written by hand on clean paper' },
        ],
        preparation: `During the day, write your vow. Keep it short and keepable: what you will do (for example, fresh water each morning, her days kept, honest study), for how long (a year and a day is common), and what you hope for. Do not promise what you cannot give.

Bathe or shower before the rite, rinse your mouth with natron or salt water, and dress in clean, preferably white or linen clothes. Clean the shrine and set everything out. Have the shrine closed or covered as you begin.`,
        steps: [
          {
            title: 'Purify',
            instructions:
              'Stand before the closed shrine. Light the candle and incense. Wash your hands in the natron water, touch it to your lips, and pass your hands through the smoke.',
            light: true,
            spoken: 'I am pure, I am pure. I have washed in the water, I have passed through the smoke. I come to Aset with clean hands and a clean mouth.',
          },
          {
            title: 'Open the shrine',
            instructions: 'Open the doors or uncover her image. Shake the sistrum or ring the bell four times.',
            spoken: 'The bolts are drawn back, the doors of heaven are opened. Aset, great of magic, show your face. Awake in peace.',
          },
          {
            title: 'Adore',
            instructions:
              'Raise both hands, palms toward her. Speak the praise slowly. You may add any titles or hymns of your own.',
            spoken: 'Homage to you, Aset, lady of heaven, mother of the god, throne of the king. You who sought without ceasing, who spread your wings and gave breath, who healed the child and spoke the word that does not fail: I praise you.',
          },
          {
            title: 'Offer',
            instructions:
              'Lift each offering toward her with both hands, then set it down: water, bread, drink, flowers. Then say a spoken offering in the old pattern.',
            spoken: 'An offering for Aset: cool water, bread and drink, flowers and sweet incense, every good and pure thing on which a goddess lives. May it please you.',
          },
          {
            title: 'Speak your vow',
            instructions:
              'Read your written vow aloud, slowly. If you have a tyet or red cord, tie a single knot in the cord as you finish, or hold the amulet to your heart.',
            spoken: 'This is my word, given freely and clean. I will keep it as well as I am able. Hear me, Aset.',
          },
          {
            title: 'Listen',
            instructions:
              'Sit before her in silence. Do not hunt for signs; simply be present with her.',
            minutes: 10,
          },
          {
            title: 'Reversion of offerings',
            instructions:
              'Thank her. Tell her that you will share what she has received. Break off a piece of the bread and eat it, and drink a sip if your drink is one you can take. The rest you will eat, share or return to the earth.',
            spoken: 'What you have taken, I share. Your bread is in my mouth; your blessing is in my house.',
          },
          {
            title: 'Close and withdraw',
            instructions:
              'Lay your written vow at the foot of her image or inside the shrine. Close or cover the shrine. Snuff the candle. Step back before you turn away.',
            snuff: true,
            spoken: 'Go in peace, Aset, and come in peace. I am yours, and I will return.',
          },
        ],
        closing:
          'Write the date and what happened in your journal. Wear the tyet or knotted cord in the days after if you like. Water the earth with the remaining water the next morning, and put the flowers out when they fade.',
        safety:
          'Keep the candle and incense on heatproof surfaces in a ventilated room and never leave them burning unattended. Keep smoke away from pet birds. Lilies are fatal to cats and grapes, raisins and wine are toxic to dogs; keep offerings out of reach. Do not drink alcohol if you should not; water and milk are fully traditional.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping Her House',
      intro:
        'A dedication is a beginning. This stage is the life afterwards: a small daily habit, her days through the year, and a yearly renewal of your vow.',
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'isis-daily',
          title: 'Morning water',
          instructions:
            'Open the shrine, give fresh water, raise your hands, speak a line of praise or the spoken offering, close the shrine. On busy days a single sentence is enough.',
          times: 365,
          every: 'day',
        },
        {
          id: 'isis-weekly',
          title: 'A weekly meal for Isis',
          instructions:
            'Once a week (or once in every ten days, the Egyptian week), give bread and beer, milk or wine, with incense, and eat the bread afterwards. Read a hymn or a passage you are studying.',
          times: 52,
          every: 'week',
          prompt: 'What are you learning about her this month?',
        },
        {
          id: 'isis-holy-days',
          title: 'Her holy days',
          instructions: `Keep the days that belong to the Isis you serve. Egyptian: her birthday on the fourth epagomenal day, Wep Ronpet (new year), and the Khoiak mysteries of Osiris in late autumn, when she mourns and restores. Roman: the Navigium Isidis on 5 March, with a boat, flowers and prayers for safe journeys; the Isia in late October to early November, mourning followed by the joyful cry that Osiris is found.

On each, give a fuller offering, tell part of her story aloud, and do one act of protection or healing for someone else.`,
          times: 4,
          every: 'holy-day',
          prompt: 'How did you keep the day, and what did it mean this year?',
        },
        {
          id: 'isis-renewal',
          title: 'Yearly rededication',
          instructions:
            'On the anniversary of your dedication, read your old vow, write a new one for the coming year, and repeat the dedication rite. Change the vow honestly: more if you can give more, less if life is harder. If you have decided to end the dedication, thank her, give a last offering and close the shrine with care.',
          times: 1,
          prompt: 'What has the year with her been like? What will you promise now?',
        },
      ],
    },
  ],
  sources: [
    'Apuleius, The Golden Ass, book XI, trans. William Adlington (1566), Project Gutenberg ebook 1666: quotations "my name, my divinity is adored…", "the Aegyptians which are excellent…", and "Thou shalt understand that I approached neere unto Hell…"',
    'Great Hymn to Osiris (stela of Amenmose, Louvre C 286), trans. E. A. Wallis Budge, Egyptian Ideas of the Future Life (1899), Project Gutenberg ebook 11277: "The glorious Isis was perfect in command…" and "She overshadowed him with her feathers…"',
    'The Legend of Ra and Isis (Turin papyrus), trans. E. A. Wallis Budge, The Literature of the Ancient Egyptians (1914), Project Gutenberg ebook 15932: "I open my eyes, and there is light…"',
    'Plutarch, On Isis and Osiris, trans. F. C. Babbitt (Loeb, 1936; public domain), LacusCurtius; and the version in Budge, Legends of the Gods (1912), Project Gutenberg ebook 9411',
    'Herodotus, Histories II.37, on Egyptian priestly purity',
    'The Calendar of 354 (Chronograph of Philocalus), for the Navigium Isidis and Isia',
    'R. E. Witt, Isis in the Ancient World (1971); Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt (2003); Geraldine Pinch, Egyptian Mythology (2002); Emily Teeter, Religion and Ritual in Ancient Egypt (2011)',
    'Jitse Dijkstra, Philae and the End of Ancient Egyptian Religion (2008), on the late history of Philae',
  ],
};
