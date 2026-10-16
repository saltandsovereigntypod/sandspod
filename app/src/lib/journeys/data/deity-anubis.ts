import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-anubis',
  kind: 'deity',
  paths: ['egyptian'],
  deityRef: 'traditional/deity/anubis',
  title: 'Anubis: He Who Is Upon His Mountain',
  summary:
    'A month with Anpu, the black jackal of the necropolis, embalmer of Osiris, guardian of tombs and of everyone in transition. Study his titles and myths, how Egypt cared for its dead, and how he is honoured today, keep ten quiet nights of remembrance, and decide whether to dedicate.',
  welcome: `This journey spends about a lunar month with Anubis, the Egyptian god of embalming, cemeteries and the safe passage of the dead. He suits people who are grieving, people who care for the dying or work with the dead, people who love dogs, and anyone who wants a calmer, more honest relationship with death.

You will learn who he was in Egypt, his many titles, the Imiut and the jackal on the shrine, the difference between him and his neighbour Wepwawet, how the embalmers worked in his name, and how people honour him now. For ten nights you will keep a short, quiet rite of remembrance. At the end you may dedicate yourself to him, or not.

This is a self-dedication. It is not an initiation into Kemetic Orthodoxy or any other temple or group, and it does not replace one. It is also not spirit work or necromancy. Anubis guarded the dead; he did not summon them. If you are grieving hard, this journey can sit beside you, but please also lean on living people, and on grief support or a counsellor if you need it.`,
  about: `Anubis (Egyptian Inpu or Anpu) was the god of embalming and of the cemetery, the guardian who prepared the dead and watched over their tombs. He appears as a black canine lying on a shrine, or as a man with a canine head. Egyptologists call the animal a jackal; genetic work in 2015 showed that the Egyptian "jackal" is in fact the African golden wolf. He is black not because he is sinister but because black was the colour of the fertile Nile mud that gave Egypt, Kemet ("the black land"), its name, and of rebirth. He is one of the oldest Egyptian gods: before Osiris rose to prominence in the later Old Kingdom, Anubis was the god most often named in offering prayers for the dead. In myth he embalmed Osiris, making the first mummy, and he stands at the scale in the judgement of the dead. Greeks and Romans honoured him as Hermanubis and saw him as a guide of souls. Today he is honoured in Kemetic religion, by reconstructionists and in Kemetic Orthodoxy, and by many modern Pagans, deathcare workers and dog lovers.`,
  notes: [
    'Anubis and Wepwawet are different gods. Both are canine, and they were often linked and sometimes confused even in antiquity, but Wepwawet, "Opener of the Ways", had his own city (Asyut) and roles.',
    'This journey is devotional and protective. It does not include contacting the dead, curses or spirit summoning; Egyptian practice toward the dead was offering, remembrance and care.',
    'Millions of dogs and puppies were mummified as offerings in his catacombs at Saqqara. Do not buy animal mummies, human remains or other antiquities; replicas and photographs are better.',
    'Funerary symbols are real religion to many people, ancient and modern. Treat them with respect rather than as gothic decoration.',
    'Safety: burn resin on charcoal only with good ventilation and a heatproof dish of sand; keep smoke away from birds, small pets and anyone with asthma. Remove food offerings before they spoil.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'At the Edge of the Desert',
      intro:
        'Begin by learning who Anubis is and making him a quiet shrine. The threshold ends with a short introduction rite: you greet him, give water, bread and incense, and speak the names of your dead.',
      days: 3,
      lessons: [
        {
          id: 'anubis-who',
          title: 'Inpu and His Titles',
          summary: 'His name, his animal and colour, his great titles, his family, and how he differs from Wepwawet.',
          minutes: 8,
          sections: [
            {
              heading: 'The dog on the cliffs',
              body: `Egyptian cemeteries lay at the edge of the desert, on the dry ground beyond the farmland, usually on the west bank where the sun sets. Wild canines prowled there at night, and they dug at shallow graves. One very old idea is that Egyptians turned the danger into a guardian: the canine who haunts the cemetery became the god who protects it.

His Egyptian name was Inpu, which Greeks wrote as Anoubis. What it means is not certain. His animal, which Egyptologists call a jackal, has turned out to be the African golden wolf, a separate species identified by a 2015 genetic study; the word "jackal" has stuck. Like the Egyptian name, the animal is a reminder that much of what we "know" is a convenient label.

He is painted black. Black (kem) was the colour of the rich silt the flood left on the fields, the colour of the land itself, Kemet, and of rebirth. It may also recall the dark resins that blackened mummies. It was not the colour of evil.`,
            },
            {
              heading: 'His titles',
              body: `Anubis has some of the oldest and most beautiful titles in Egyptian religion. Learn a few; Egyptians addressed gods by their titles.

Tepy-dju-ef, "he who is upon his mountain", for the canine on the cliff watching over the cemetery below. Neb-ta-djeser, "lord of the sacred land", the necropolis. Imy-ut, "he who is in the place of embalming". Khenty-seh-netjer, "foremost of the divine booth", the tent where bodies were prepared. And Khenty-imentiu, "foremost of the westerners", the westerners being the dead. That last title belonged originally to a canine god of Abydos and was later given to Osiris, but it is used of Anubis too.

In the oldest offering prayers, from the Old Kingdom, Anubis is the god who receives the prayer on behalf of the dead: an offering which the king gives, and Anubis, upon his mountain, in the place of embalming, lord of the sacred land (a plain modern rendering). From the Fifth Dynasty onward Osiris joins him and gradually takes the first place.`,
            },
            {
              heading: 'His family',
              body: `Egyptian sources give Anubis several sets of parents. In early texts he can be a son of Ra, or of the cow goddess Hesat or of Bastet. In the version that became best known, through Plutarch, he is the son of Osiris and Nephthys, born of a single night when Osiris mistook Nephthys for her sister Isis. Plutarch says Nephthys hid the baby for fear of Set, and Isis searched for him with the help of dogs. In F. C. Babbitt's translation (1936): "it was brought up and became her guardian and attendant, receiving the name of Anubis, and it is said to protect the gods just as dogs protect men."

His wife was Anput, a female form of his name, and his daughter was Kebechet, goddess of cool, purifying water, who refreshed the dead. Keep Kebechet in mind; a cup of cool water is one of the oldest and best gifts at his shrine.`,
            },
            {
              heading: 'Not Wepwawet',
              body: `Anubis's neighbour Wepwawet, "Opener of the Ways", is also a canine god, and the two are easily mixed up. Wepwawet is usually shown standing on a standard, often grey or white rather than black, and his city was Asyut, which the Greeks called Lycopolis, "Wolf Town". He was a god of the king in battle, who went before the army and opened the roads, and at Abydos he led the great procession of Osiris. A Middle Kingdom official, Ikhernofret, describes on his stela how he arranged "the procession of Wepwawet" at the start of the Osiris mysteries.

Anubis lies down on a shrine; Wepwawet strides out on a standard. Anubis prepares and guards; Wepwawet goes ahead and opens. The two can appear together, and later Egyptians sometimes blended them, but they had different cults and different temples. If you find yourself drawn to the road-opener rather than the embalmer, it may be Wepwawet you are meeting.`,
            },
          ],
          knowAndDont: {
            known:
              'The titles Tepy-dju-ef, Neb-ta-djeser, Imy-ut and Khenty-seh-netjer, Anubis’s place in early offering formulas, his black colour, his family as given by Plutarch (On Isis and Osiris 14), and the distinct cult of Wepwawet at Asyut and Abydos are well attested.',
            unknown:
              'The meaning of the name Inpu is uncertain. His parentage varies by text and period, with no "correct" version. How Khenty-imentiu related to Anubis before both were overshadowed by Osiris is debated.',
          },
          inPractice:
            'Choose a name (Anubis, Anpu or Inpu) and an image: the recumbent black jackal on a shrine is the most traditional. Learn two titles by heart, such as "upon his mountain" and "lord of the sacred land". Decide where his shrine will go: somewhere quiet, uncluttered and, if you can, facing or on the west side of the room.',
          reflect: [
            'Who are your dead? Make a list of names you would like to speak before him.',
            'What do you feel when you think about death: fear, grief, curiosity, calm? Write it down honestly.',
          ],
          further: [
            'Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt (2003), entries on Anubis and Wepwawet',
            'Plutarch, On Isis and Osiris §14, trans. F. C. Babbitt (Loeb, 1936; public domain, at LacusCurtius)',
          ],
          library: ['traditional/deity/anubis', 'traditional/deity/osiris', 'traditional/deity/isis', 'traditional/candle/black'],
        },
      ],
      practices: [
        {
          id: 'anubis-shrine',
          title: 'Set up a quiet shrine',
          instructions: `Choose a shelf or small table in a quiet place, on the west side of a room if you can. Clean it with water that has a pinch of salt and baking soda in it (a modern stand-in for natron).

Lay a clean white or black cloth; white linen was what the embalmers wrapped with. Set his image at the back: the jackal lying on a shrine is the classic form. In front, place a cup for cool water, a dish for bread, an incense burner on a heatproof tile, and a black, white or gold candle. You may add photographs or keepsakes of your dead to one side, so that he watches over them.

Keep it uncluttered and clean. The Library entry says it well: a quiet space, kept with care, honours a god whose work was care.`,
          times: 1,
          prompt: 'What did you place on his shrine, and whose pictures or names, if any?',
        },
      ],
      rite: {
        title: 'Introduction to Anubis',
        summary: 'A short first visit: purify, greet him by his titles, offer cool water, bread and incense, and speak the names of your dead.',
        minutes: 20,
        ingredients: [
          { name: 'Anubis', ref: 'traditional/deity/anubis' },
          { name: 'A cup of cool fresh water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A bowl of water with a pinch of salt and a pinch of baking soda (natron substitute)', ref: 'traditional/vessel/bowl' },
          { name: 'A piece of bread', ref: 'traditional/vessel/dish' },
          { name: 'Myrrh or frankincense, with charcoal and a dish of sand, or a stick of resin incense', ref: 'traditional/herb/myrrh' },
          { name: 'A black, white or gold candle', ref: 'traditional/candle/white' },
          { name: 'A written list of the names of your dead, if you wish' },
        ],
        preparation:
          'Wash your hands and face and rinse your mouth. Wear clean clothes. Put away your phone. Open a window a little if you will burn resin.',
        steps: [
          {
            title: 'Purify',
            instructions: 'Light the candle and the incense. Touch the natron water to your lips and hands, and pass your hands through the smoke.',
            light: true,
            spoken: 'I am pure. My hands are clean and my mouth is clean. I come quietly before the lord of the sacred land.',
          },
          {
            title: 'Greet him',
            instructions: 'Raise both hands, palms toward his image, at face height. Speak slowly.',
            spoken: 'Homage to you, Anubis, upon your mountain, in the place of embalming, lord of the sacred land, guardian of those who rest. I greet you.',
          },
          {
            title: 'Offer',
            instructions: 'Lift the water, then the bread, toward him and set them down.',
            spoken: 'Hetep-di-nesu. An offering for Anubis: cool water, bread and sweet smoke. May they please you.',
          },
          {
            title: 'Speak the names',
            instructions:
              'If you wish, read the names of your dead aloud, one by one, slowly. Egyptians believed that to speak a name was to make it live. If you have no one to name, ask him to watch over all who are dying tonight.',
            minutes: 5,
            spoken: 'Watch over them, Anubis. Let their names live.',
          },
          {
            title: 'Sit',
            instructions: 'Sit quietly for a few minutes. You do not need to feel anything in particular.',
            minutes: 4,
          },
          {
            title: 'Close',
            instructions: 'Thank him, bow, and snuff the candle.',
            snuff: true,
            spoken: 'Thank you, Anubis. Keep watch. I will come again.',
          },
        ],
        closing:
          'Take the bread away and eat it, or crumble it outdoors; this is the reversion of offerings. Pour the water on a plant. Write the names you spoke in your journal.',
        safety:
          'Burn resin on charcoal only in a ventilated room, on a heatproof dish filled with sand, and never leave candle or charcoal unattended. Hold charcoal with tongs; it stays hot for hours. Keep smoke away from birds, small pets and anyone with asthma. If grief overwhelms you, stop the rite gently and reach out to someone.',
      },
    },
    {
      kind: 'study',
      title: 'The Place of Embalming',
      intro:
        'Three lessons: his myths; the embalmers and the cult of the dead; and the Imiut, the masks and the animal catacombs. Keep a few minutes at his shrine before each day’s reading.',
      days: 11,
      lessons: [
        {
          id: 'anubis-myths',
          title: 'Embalmer of Osiris, Keeper of the Scale',
          summary: 'The first mummy, the weighing of the heart, Anubis against Set, and the guide of souls.',
          minutes: 8,
          sections: [
            {
              heading: 'The first mummy',
              body: `The central myth of Egyptian funerary religion is the death of Osiris. Set killed his brother and, in the later versions, cut his body into pieces and scattered them. Isis and Nephthys searched for him, mourning, and gathered the pieces. Anubis put them together, wrapped them in linen, anointed them with oils and resins, and performed the rites that let Osiris live again as king of the dead.

So Osiris was the first mummy, and Anubis was the first embalmer. Every Egyptian burial repeated what was done for Osiris: the dead person became "an Osiris", and the embalmers, acting as Anubis, cared for the body as he had cared for his father. Diodorus, writing in the first century BCE, explains the dog-headed image as a sign of loyalty. In C. H. Oldfather's translation (1933), they "represent the god whom they call Anubis with a dog's head, showing in this way that he was the bodyguard of Osiris and Isis."`,
            },
            {
              heading: 'At the scale',
              body: `The most famous image of Anubis is the judgement scene from the Book of the Dead, chapter 125. The heart of the dead person is laid on one pan of a great balance, and the feather of Ma'at, truth and right order, on the other. Anubis kneels by the scale, steadying it and checking the plumb line. Thoth stands ready to write the verdict. Beside the scale crouches Ammit, the devourer, part crocodile, part lion, part hippopotamus, waiting for a heart that fails.

Anubis often also leads the dead person by the hand into the hall. In this scene he is not a judge. He is the attendant who makes sure the weighing is fair and that the newly dead do not walk in alone. That is why so many modern devotees come to him as a calm companion in fear rather than a figure of fear.`,
            },
            {
              heading: 'Anubis against Set',
              body: `A late temple book from Middle Egypt, the Papyrus Jumilhac, written in the Ptolemaic period and now in the Louvre, collects local myths about Anubis. In one, Set tries to get at the body of Osiris by disguising himself as a leopard. Anubis catches him, and brands his skin all over with a hot iron, which is why the leopard has spots. Then he flays him and wears the skin. The papyrus uses this to explain why priests wore leopard skins.

Other stories in the papyrus show Anubis hunting down Set's followers and protecting the remains of Osiris through the night. They are not gentle tales. They show that his care for the dead came with teeth: the guardian who keeps watch is also the one who stops whoever comes to do harm.`,
            },
            {
              heading: 'The guide of souls',
              body: `When Greeks settled in Egypt, they matched Anubis with Hermes, who in Greek religion led the souls of the dead to the underworld. The combined god Hermanubis appears in Roman Egypt, a canine-headed figure with Hermes's staff. In the Roman cult of Isis, which spread across the empire, Anubis walked at the head of her processions, and Roman writers describe priests wearing his mask.

So the modern image of Anubis as a guide of souls, a psychopomp, is real, but much of it comes from this later Greek and Roman layer. In older Egyptian sources his main jobs are embalming, guarding the tomb and attending the judgement. Both layers are part of his history. It is just worth knowing which is which when you read a modern book or a meme about him.`,
            },
          ],
          knowAndDont: {
            known:
              'Anubis’s embalming of Osiris, his role at the scale in Book of the Dead chapter 125 vignettes, the Papyrus Jumilhac myths, Diodorus 1.87 and the Greco-Roman Hermanubis and Isis processions are documented.',
            unknown:
              'No complete Egyptian narrative of the Osiris myth survives from early periods; the full story is pieced together from allusions and from Plutarch. The Jumilhac myths are local and late, and how widely they were known is unclear.',
          },
          inPractice:
            'Read Book of the Dead chapter 125 in a good translation, or study a photograph of a judgement scene (the Papyrus of Ani in the British Museum is the classic one). At his shrine this week, name one thing in your life you want weighed fairly, and ask him to steady the scale.',
          reflect: [
            'If your heart were weighed tonight, what would you want to be true of it?',
            'Which Anubis are you drawn to: the embalmer, the guardian with teeth, the attendant at the scale, or the Roman guide of souls?',
          ],
          further: [
            'Raymond O. Faulkner (trans.), The Egyptian Book of the Dead: The Book of Going Forth by Day (1994), with the Papyrus of Ani',
            'Jacques Vandier, Le Papyrus Jumilhac (1961), for the Jumilhac myths',
            'Diodorus Siculus, Library of History 1.87, trans. C. H. Oldfather (Loeb, 1933; public domain, at LacusCurtius)',
          ],
          library: ['traditional/deity/anubis', 'traditional/deity/osiris', 'traditional/deity/thoth', 'traditional/deity/hermes'],
        },
        {
          id: 'anubis-embalmers',
          title: 'The Embalmers and the Cult of the Dead',
          summary: 'How Egyptians cared for their dead in Anubis’s name: the embalming house, the priest in the mask, the Opening of the Mouth, and the offerings that never stopped.',
          minutes: 8,
          sections: [
            {
              heading: 'The beautiful house',
              body: `Embalming took place in a workshop called the wabet, "pure place", or the per-nefer, "beautiful house", near the cemetery. The full treatment took about seventy days. The brain was removed, the organs of the abdomen and chest taken out (the heart was usually left in place), the body dried for weeks in natron salt, then washed, anointed with oils and resins, packed and wrapped in many layers of linen, with amulets placed between the layers and prayers spoken at each stage.

The chief embalmer acted as Anubis. Diodorus says that embalmers were held in high honour: in Oldfather's translation, they are "considered worthy of every honour and consideration, associating with the priests and even coming and going in the temples without hindrance, as being undefiled." He also notes that the man who made the first cut was ritually chased away, a sign that the work was holy and also dangerous.`,
            },
            {
              heading: 'The priest in the mask',
              body: `Did embalmers really wear Anubis masks? Scenes in tombs show a jackal-headed figure tending the mummy, and we cannot always tell whether the artist meant the god or a priest playing him. But at least one real mask survives: a pottery mask of Anubis's head, now in the Roemer- und Pelizaeus-Museum in Hildesheim, with holes for the wearer to see and breathe through. It dates from the Late Period, roughly between 664 and 332 BCE. Roman writers also describe priests wearing his mask in Isis processions.

At the funeral came the Opening of the Mouth, the rite that restored the dead person's ability to breathe, eat and speak. Priests touched the mouth and eyes of the mummy or statue with special tools. In many tomb paintings the mummy is held upright at the tomb door by a figure of Anubis, while the priests perform the rite.`,
            },
            {
              heading: 'The offerings that continue',
              body: `For Egyptians, burial was not the end of care. The dead needed food, drink and remembrance, and families brought offerings to tomb chapels, especially at festivals like the Wag, early in the year, and the Beautiful Feast of the Valley at Thebes, when families picnicked at the tombs.

Tombs carried an "appeal to the living", asking anyone who passed to speak the offering formula for the dead person, which in plain English runs something like: a thousand of bread, a thousand of beer, a thousand of oxen and fowl, every good and pure thing. The spoken words themselves were believed to feed the dead. And the oldest form of the formula, as you saw in the first lesson, often named Anubis as the god who received it.

This is why speaking the names of your dead at his shrine is not a modern invention bolted on. It is one of the oldest and most Egyptian things you can do in his presence.`,
            },
            {
              heading: 'What this asks of a modern devotee',
              body: `Many people who come to Anubis today work with death: nurses, hospice staff and volunteers, death doulas, funeral directors and embalmers, mortuary technicians, pathologists, cemetery keepers and vets who put animals to sleep. For them he is a patron of hard, holy work, done carefully and with dignity.

Others come in grief, or because they are dying, or caring for someone who is. For them, he is a steady presence at a threshold. The Library entry's advice is wise: "honest grief rather than sensational spirit work". Care for a grave. Write down a family story. Learn how to sit with someone who is dying. These are offerings he would recognise.`,
            },
          ],
          knowAndDont: {
            known:
              'The seventy-day embalming process (Herodotus 2.86 and Egyptian evidence), the wabet and per-nefer, Diodorus 1.91 on embalmers, the Hildesheim mask, the Opening of the Mouth with Anubis supporting the mummy, the Wag and Valley festivals and the appeal to the living are documented.',
            unknown:
              'How often embalmers actually wore masks is unknown; the surviving mask is late. Methods varied greatly by period and by what a family could pay. Exactly what the priests recited at each stage is only partly preserved, in late texts such as the Ritual of Embalming.',
          },
          inPractice:
            'This week, speak the offering formula aloud for one of your dead, by name, as an Egyptian passer-by would for a stranger’s tomb. If you can, visit a grave or memorial and clean it, or give time or money to a hospice or bereavement charity.',
          reflect: [
            'What would good care for your own body after death look like? Have you told anyone?',
            'Who in your life does the work of Anubis, and how could you honour them?',
          ],
          further: [
            'Salima Ikram and Aidan Dodson, The Mummy in Ancient Egypt (1998)',
            'John H. Taylor, Death and the Afterlife in Ancient Egypt (2001)',
            'Diodorus Siculus, Library of History 1.91, trans. C. H. Oldfather (Loeb, 1933; public domain, at LacusCurtius)',
          ],
          library: ['traditional/deity/anubis', 'traditional/deity/osiris', 'traditional/herb/myrrh', 'traditional/herb/cedar'],
          premade: ['hedge-ancestor-candle-evening', 'hedge-letting-go-of-the-dead'],
        },
        {
          id: 'anubis-imiut',
          title: 'The Imiut, the Shrine and the Catacombs',
          summary: 'Strange and sacred objects: the Imiut fetish, Tutankhamun’s Anubis, and the eight million dogs of Saqqara.',
          minutes: 7,
          sections: [
            {
              heading: 'The Imiut',
              body: `One of the oddest Egyptian sacred objects belongs to Anubis. The Imiut is a headless animal skin, often shown as a feline or bovine hide, tied by its tail to a pole that stands in a pot. It appears from the very beginning of Egyptian history and lasted for three thousand years. Two gilded wooden Imiuts were found in Tutankhamun's tomb.

Its name is linked to Anubis's title Imy-ut, "he who is in the place of embalming", and it is often shown beside him or as his emblem. Some scholars think it was once a separate god. What it meant is honestly unknown. Suggestions include a symbol of the hide in which the dead were wrapped in very early burials, an image of rebirth from a skin, or a protective sign for the embalming tent. Modern Kemetics sometimes place a small Imiut image on his shrine; if you do, know that you are honouring a mystery, not a symbol with a settled meaning.`,
            },
            {
              heading: 'The jackal on the chest',
              body: `When Howard Carter first looked into the treasury of Tutankhamun's tomb in 1923 (his team cleared it in 1926 and 1927), its doorway was guarded by a life-sized wooden Anubis, painted black with gilded details, lying on top of a gilded shrine-shaped chest on carrying poles. He had a linen shawl draped over him, and inside the chest were amulets and ritual objects. He faced west into the burial chamber, watching over the king.

That image, the recumbent black jackal on a shrine, alert, ears up, front paws stretched out, is the classic hieroglyph for Anubis and for the title "he who is upon his mountain". It is also the best model for your own shrine image: watchful, still and calm.`,
            },
            {
              heading: 'The dog catacombs',
              body: `At Saqqara, near Memphis, lay the Anubieion, a temple complex of Anubis, with vast underground galleries for animal burials. A survey led by Paul Nicholson of Cardiff University, published in 2015, estimated that the dog catacombs held around eight million animals, mostly dogs, and many of them puppies only hours or days old. As with the cats of Bastet and the ibises of Thoth, pilgrims paid for an animal to be mummified and buried as an offering, carrying their prayer to the god.

The scale suggests puppy farms near the temple. Some adult dogs may have been temple animals that lived long lives. It is hard to read about. A modern devotee can hold it as history and answer it with care for living dogs: rescue, fostering, a donation to an animal shelter, or simply walking your own dog with full attention.`,
            },
          ],
          knowAndDont: {
            known:
              'The Imiut is attested from the Early Dynastic period to the Roman era and two were found with Tutankhamun. Carter’s Anubis shrine (object 261) guarded the treasury. The Saqqara dog catacombs and the 2015 Cardiff estimate are published.',
            unknown:
              'The Imiut’s original meaning, and whether it was ever a separate deity, are unknown. How the puppies for the catacombs were raised, and what pilgrims understood of the process, is not fully known.',
          },
          inPractice:
            'Find a good photograph of Tutankhamun’s Anubis shrine (it is in the Grand Egyptian Museum) and spend a few minutes looking at it. Consider adding a small Imiut picture to his shrine. Give something this week to living dogs.',
          reflect: [
            'What does it mean to you to honour a symbol whose meaning is lost?',
            'How do you respond to the catacombs? What would you like your devotion to do differently?',
          ],
          further: [
            'Nicholas Reeves, The Complete Tutankhamun (1990; new edition 2022)',
            'Paul T. Nicholson et al., "The Catacombs of Anubis at North Saqqara", Antiquity (2015)',
            'Salima Ikram (ed.), Divine Creatures: Animal Mummies in Ancient Egypt (2005)',
          ],
          library: ['traditional/deity/anubis', 'traditional/crystal/obsidian', 'traditional/tool/altar'],
        },
      ],
      practices: [
        {
          id: 'anubis-daily-water',
          title: 'Cool water each day',
          instructions:
            'Each day, give a fresh cup of cool water at his shrine, as Kebechet refreshed the dead. Raise your hands, say one of his titles, and pour yesterday’s water on a plant. Then sit for one minute.',
          times: 11,
          every: 'day',
          prompt: 'One line: what did you notice in the minute of stillness?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Ten Nights of Remembrance',
      intro:
        'For ten nights, one Egyptian ten-day week, you keep a short, quiet rite at his shrine, each with a theme. If you can, begin on the day after the new moon. First read the lesson on honouring him today.',
      days: 10,
      lessons: [
        {
          id: 'anubis-today',
          title: 'Anubis Today: Practice, Days and Care',
          summary: 'Modern communities, how to offer and revert, purity, his days, and the sensitive points.',
          minutes: 8,
          sections: [
            {
              heading: 'Who honours him now',
              body: `Kemetic religion, the modern revival of Egyptian religion, honours Anubis in several ways. Reconstructionists base their practice on temple ritual and Egyptian texts and often keep him at a shrine for the akhu, the blessed dead, alongside Osiris. Kemetic Orthodoxy, a temple founded in the United States in 1988 by Tamara Siuda, includes him in its calendar and devotions; members follow that temple's own customs. Independent Kemetics mix study and personal practice.

Beyond Kemetic religion, Anubis is honoured by many eclectic Pagans and witches as a guardian and psychopomp, often drawing on the Greco-Roman Hermanubis. Deathcare workers of many faiths keep a small image of him. Each practice is its own, and all can be honest about where their ideas come from.`,
            },
            {
              heading: 'How to offer',
              body: `Use the Egyptian shape: purify, light, open, praise, offer, sit, close, revert. Purity matters especially for a god of the "pure place": wash your hands and face, rinse your mouth, wear clean clothes. Many Kemetics keep a short period apart after attending a funeral or handling the dead before approaching other gods; for Anubis, coming from such work is not a bar, but washing first is respectful.

Speak the offering formula: "Hetep-di-nesu. An offering for Anubis, upon his mountain, lord of the sacred land: bread and cool water, incense and linen, every good and pure thing." Then, after closing the shrine, take the food away and eat it or share it. This is the reversion of offerings. In Egypt, food from a god's altar went on to feed the priests, the dead at their tombs and the living; nothing was wasted.

Fitting gifts: cool water, bread, beer for those who drink, myrrh and frankincense, a strip of clean white linen or black cloth, the names of the dead spoken aloud, and acts of care for the dead and dying. Replace water daily and remove food before it spoils; a god of embalming does not want rot on his shrine.`,
            },
            {
              heading: 'His days',
              body: `No great annual festival of Anubis alone is well known from popular sources, and it is honest to say so. He takes part in the festivals of the dead and of Osiris. The Wag festival, on the 18th day of the first month (Thoth), was a feast for the dead named in countless offering formulas. The Khoiak mysteries of Osiris, in the fourth month of Akhet, re-enacted the death, embalming and revival of Osiris, which is Anubis's work. The Beautiful Feast of the Valley at Thebes was a festival of families and their dead.

Modern Kemetics place these feasts according to their chosen calendar, usually counting from Wep Ronpet, the New Year, in late summer. Many also keep a monthly offering for the akhu. In addition, the anniversary of a loved one's death, and any day you attend a funeral, are natural days to come to his shrine.`,
            },
            {
              heading: 'Sensitive points',
              body: `Anubis is not a horror figure, and his shrine is not a place for frightening yourself or anyone else. He is not a god of curses. The Egyptian dead were dangerous only when neglected or disturbed; the answer was offering and respect, not summoning.

Do not try to contact the dead through him. If you sense a loved one near, you can greet them kindly and give them water, as Egyptians did at tombs, but do not chase it. And if grief is overwhelming, if you are thinking about your own death in a way that frightens you, please speak to someone you trust or to a crisis line: 988 in the US, Samaritans on 116 123 in the UK and Ireland, or your local emergency number. That is what he would want: the living looked after too.

Finally, respect human remains. Do not buy bones, mummy parts or "real" skulls for his shrine, and be careful with animal remains, which can be illegal to own or poorly sourced.`,
            },
          ],
          knowAndDont: {
            known:
              'Kemetic Orthodoxy and other Kemetic groups are documented modern movements. The Wag, Khoiak and Valley festivals, the hetep-di-nesu formula, Egyptian purity rules and the reversion of offerings are well attested.',
            unknown:
              'There is little evidence for festivals dedicated to Anubis alone, and modern calendars differ. Whether ordinary Egyptians observed purity rules after funerals at home is unclear. His modern role as a guide for the living through crises is a modern extension of his guardian and Greco-Roman roles.',
          },
          inPractice:
            'Learn the offering formula with his titles by heart. Put the Wag and the anniversaries of your dead in your calendar. Choose one act of care for the dead or the dying to offer him this month.',
          reflect: [
            'Is there a death you have not grieved? What might it need?',
            'What would it mean to make your practice for Anubis a practice of care rather than of mood?',
          ],
          further: [
            'Richard J. Reidy, Eternal Egypt: Ancient Rituals for the Modern World (2010)',
            'Emily Teeter, Religion and Ritual in Ancient Egypt (2011)',
          ],
          library: ['traditional/deity/anubis', 'traditional/herb/frankincense', 'traditional/crystal/smoky_quartz', 'traditional/candle/gold'],
          premade: ['hedge-ancestor-candle-evening'],
        },
      ],
      practices: [
        {
          id: 'anubis-ten-nights',
          title: 'Ten nights of remembrance',
          instructions: `Each night: wash your hands and face, light the candle and incense, raise your hands and greet him by his titles. Say the offering formula and give cool water and bread. Then keep the night's theme for five to ten minutes. Close, thank him, and revert the bread.

Night 1: upon his mountain. Sit and imagine him watching over a cemetery at dusk. Night 2: the names. Speak the names of your dead. Night 3: the first mummy. Read about Osiris's death and revival. Night 4: the scale. Write what you want your heart to hold. Night 5: the guardian with teeth. Name one thing you will protect. Night 6: the beautiful house. Give thanks for someone who cares for the dead or dying. Night 7: Kebechet's water. Give an extra cup of cool water for anyone who has died alone. Night 8: the appeal to the living. Speak the formula for a stranger, a name from a memorial or a grave you have passed. Night 9: your own death. Write calmly what you would want. Night 10: the opened mouth. Say aloud one true thing you have not said.`,
          times: 10,
          every: 'day',
          prompt: 'What was tonight’s theme, and what came to you in the quiet?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Weighing the Heart',
      intro:
        'Take a few days with only the daily water. Read your journal from the beginning. Dedication is one good outcome; so is pausing, stopping, or finding that another god, perhaps Osiris, Wepwawet or Isis, is the one calling you.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'anubis-reread',
          title: 'Read the month back',
          instructions:
            'Read your journal from the first entry, slowly, as Anubis checks the scale: fairly, without rushing, without fear. Then answer the questions below.',
          times: 1,
          prompt: 'What does the month show, honestly weighed?',
        },
      ],
      questions: [
        'Are you drawn to Anubis himself, or mainly to a mood around death? Both are worth knowing about yourself.',
        'Is your interest coming from fresh grief? If so, would it be wiser to keep him close without a vow for now, and decide when the grief has settled?',
        'Can you keep a small, steady practice (cool water, the names of your dead, the festivals of the dead) through a busy year?',
        'Would a Kemetic community, or practical deathcare work or volunteering, serve what you are looking for better than a self-dedication?',
        'If you decide to wait or stop, can you thank him, give a last offering and take down the shrine with care? That is a good ending too.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The Dedication',
      intro:
        'If you choose to go on, this is your self-dedication to Anubis, a promise you write and speak yourself. It is not an initiation into Kemetic Orthodoxy or any other group, and it does not replace one. A new moon, the Wag, or the anniversary of a loved one’s death are all fitting times. Choose a calm evening.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-Dedication to Anubis',
        summary: 'A full rite in the Egyptian shape: purification, opening, praise by his titles, offering with the formula, the names of the dead, the vow, a time of stillness, reversion and closing.',
        minutes: 45,
        ingredients: [
          { name: 'Anubis', ref: 'traditional/deity/anubis' },
          { name: 'A cup of cool fresh water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A bowl of water with a pinch of salt and a pinch of baking soda (natron substitute)', ref: 'traditional/vessel/bowl' },
          { name: 'Bread, and beer or juice', ref: 'traditional/vessel/dish' },
          { name: 'Myrrh resin with charcoal on a dish of sand, or resin incense sticks', ref: 'traditional/herb/myrrh' },
          { name: 'A black, white or gold candle', ref: 'traditional/candle/black' },
          { name: 'A strip of clean white linen or black cloth' },
          { name: 'The names of your dead, written out' },
          { name: 'Your written vow' },
          { name: 'Obsidian or smoky quartz to keep on the shrine', ref: 'traditional/crystal/obsidian', optional: true },
        ],
        preparation: `During the day, write your vow: what you will do (daily water, the names of your dead, the festivals of the dead, an act of care), for how long (a year and a day is common), and what you ask of him. Keep it short and keepable.

Bathe, rinse your mouth, and dress in clean clothes. Clean the shrine. Fold the linen neatly. Open a window a little. Set everything out.`,
        steps: [
          {
            title: 'Purify',
            instructions: 'Light the candle and the incense. Touch the natron water to your forehead, lips and hands, and pass your hands through the smoke.',
            light: true,
            spoken: 'I am pure, I am pure. My hands are clean, my mouth is clean. I come quietly before the lord of the sacred land.',
          },
          {
            title: 'Open the shrine',
            instructions: 'Uncover or open his shrine. Bow.',
            spoken: 'The doors are open. I see your face, Anubis, and I am not afraid.',
          },
          {
            title: 'Praise',
            instructions: 'Raise both hands, palms toward him, and speak the praise slowly.',
            spoken: 'Homage to you, Anubis, upon your mountain, in the place of embalming, foremost of the divine booth, lord of the sacred land. You wrapped Osiris and he lived. You steady the scale and lead the dead by the hand. Guardian of those who rest, I praise you.',
          },
          {
            title: 'Offer',
            instructions: 'Lift the water, the bread and the drink toward him and set them down. Lay the linen before his image.',
            spoken: 'Hetep-di-nesu. An offering for Anubis: cool water and bread, sweet smoke and clean linen, every good and pure thing on which a god lives. May it please you.',
          },
          {
            title: 'The names',
            instructions: 'Read the names of your dead aloud, slowly. After each, pause.',
            minutes: 5,
            spoken: 'Let their names live. Watch over them, Anubis.',
          },
          {
            title: 'Speak the vow',
            instructions: 'Stand and read your vow aloud, clearly. Sign and date it.',
            spoken: 'Anubis, hear me. This is my word, weighed and freely given.',
          },
          {
            title: 'Sit with him',
            instructions: 'Sit quietly. Notice what you feel. If words or images come, write them down afterwards.',
            minutes: 8,
          },
          {
            title: 'Close and revert',
            instructions: 'Thank him. Close or cover the shrine. Snuff the candle. Eat a piece of the bread.',
            snuff: true,
            spoken: 'The offering returns. What you have received, I share. Go in peace, Anubis, and keep watch. I am yours.',
          },
        ],
        closing:
          'Pour the water on a plant. Keep the linen on his shrine as a sign of the vow. Keep the vow with it and reread it at each new moon. Record the rite in your journal. Let the charcoal burn out in its sand before you leave it.',
        safety:
          'Burn resin on charcoal only with ventilation, on a heatproof dish of sand, and never leave candle or charcoal unattended. Keep the linen and cloth well away from the flame. Keep smoke away from birds, small pets and anyone with asthma. If the rite brings up grief you cannot carry, stop gently and reach out to someone.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping Watch',
      intro:
        'After the dedication, the practice is quiet and steady: cool water each day, the dead remembered, the festivals of the dead kept, and a yearly renewal.',
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'anubis-daily',
          title: 'Daily water',
          instructions:
            'Each day, fresh cool water, raised hands, and one of his titles. On hard days, the water and a bow is a full rite.',
          times: 365,
          every: 'day',
        },
        {
          id: 'anubis-month',
          title: 'Monthly offering for the dead',
          instructions:
            'Once a month, at the new moon if you like, give bread, incense and the offering formula for your dead, speak their names, and reread your vow.',
          times: 12,
          every: 'month',
          prompt: 'Whose name did you speak this month, and what do you remember of them?',
        },
        {
          id: 'anubis-holy-days',
          title: 'The festivals of the dead',
          instructions: `Keep the Wag (the 18th day of the first Egyptian month, by your chosen calendar) with a full offering for your dead and his protection. In the Khoiak season, read or retell the death, embalming and revival of Osiris. Keep the anniversaries of your own dead at his shrine. Visit or tend a grave once a year if you can.`,
          times: 1,
          every: 'holy-day',
          prompt: 'How did you keep the festival of the dead this year?',
        },
        {
          id: 'anubis-renewal',
          title: 'Yearly rededication',
          instructions:
            'On the anniversary of your dedication, read the year’s journal, write a new vow, and repeat the dedication rite. Change the promise honestly. If you are ending the dedication, give a last offering, thank him, and take down the shrine with care.',
          times: 1,
          prompt: 'What has a year in his care changed in how you meet death?',
        },
      ],
    },
  ],
  sources: [
    'Plutarch, On Isis and Osiris §14, trans. F. C. Babbitt (Loeb, 1936; public domain), LacusCurtius: "it was brought up and became her guardian and attendant…"',
    'Diodorus Siculus, Library of History 1.87 and 1.91, trans. C. H. Oldfather (Loeb, 1933; public domain), LacusCurtius: "represent the god whom they call Anubis with a dog’s head…", "considered worthy of every honour and consideration…"',
    'Herodotus, Histories 2.86 (on embalming), trans. G. C. Macaulay (1890), Project Gutenberg ebook 2707',
    'Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt (2003); John H. Taylor, Death and the Afterlife in Ancient Egypt (2001); Salima Ikram and Aidan Dodson, The Mummy in Ancient Egypt (1998)',
    'Paul T. Nicholson et al., Antiquity (2015), on the Saqqara dog catacombs; Koepfli et al., Current Biology (2015), on the African golden wolf',
    'Jacques Vandier, Le Papyrus Jumilhac (1961); Nicholas Reeves, The Complete Tutankhamun (1990)',
  ],
};
