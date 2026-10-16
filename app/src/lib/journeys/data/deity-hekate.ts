import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-hekate',
  kind: 'deity',
  paths: ['hellenic', 'roman', 'wheel'],
  deityRef: 'traditional/deity/hekate',
  title: 'Hekate: Torch at the Threshold',
  summary:
    'A lunar month with Hekate, from one Deipnon to the next: who she was in Greek cult, how she became the goddess of witches, and how to keep her supper, her doorway and her days.',
  welcome: `This is a month of study and devotion with Hekate, the torch-bearing goddess of thresholds, crossroads and the night. It works best if you begin just after a new moon and let it carry you to the dark of the moon, so that your dedication can fall on her Deipnon, the supper left for her at the month’s end.

It is a self-dedication, not an initiation. No ancient source describes a solitary person dedicating themselves to Hekate in this way, and no modern order needs to recognise it. What it offers is a month of learning who she actually was, keeping her customs carefully, and deciding at the end, with your eyes open, whether to keep going.

You do not need to be a witch, a Hellenic polytheist or anything else to begin. You need a doorway, a small lamp or candle, a bowl of water and the willingness to read slowly.`,
  about: `Hekate was a Greek goddess long before she was the queen of witches. The poet Hesiod, around 700 BCE, praised her as a goddess Zeus honoured above all, with a share in earth, sea and sky, who stood beside kings, soldiers, athletes, fishermen and herders and nursed the young. Ordinary Athenians kept a small shrine to her at the front door and left her a supper at the crossroads at the end of each lunar month. Over the following centuries she became the goddess of the three-way crossroads with three faces, the patron of sorceresses like Medea, a great power in the magical papyri of Roman Egypt, and, in the philosophical Chaldean Oracles, the cosmic soul who stands between the divine mind and the world. Today she is honoured by Hellenic polytheists, who keep her Deipnon much as Athenians did, and by a great many modern witches, who see her as their patron. Both are real, and they are not the same: this journey will tell you which is which.`,
  notes: [
    'The “triple goddess” Hekate, and Hekate as the crone of a maiden-mother-crone trio, are later developments. Her triple image appears in Athens in the late fifth century BCE; the crone is a twentieth-century idea. Ancient art shows her as a young woman.',
    'Food given to Hekate at the Deipnon is not eaten by the household. It is left and walked away from. Keep that custom even if you change everything else.',
    'Modern lists of “Hekate’s herbs” and the popular “Hekate’s wheel” design are mostly modern. The journey explains what is old and what is new.',
    'Ancient curse tablets and necromantic spells sometimes invoked her. This journey describes that honestly and offers only devotional and protective work.',
    'If you leave food outdoors, never use garlic, onion, chocolate, grapes or raisins where dogs, cats or wildlife can reach them.',
    'If you go out to a crossroads after dark, choose a lit, safe spot near home or simply use your own doorstep. If Hekate’s link with the dead brings up grief that feels too heavy, talk to someone you trust or a bereavement service such as Cruse (UK) or a local grief line; devotion is not a substitute for support.',
  ],
  holyDays: ['deipnon', 'noumenia', 'samhain'],
  stages: [
    {
      kind: 'threshold',
      title: 'Standing at the door',
      intro:
        'Hekate belongs to the edges of things: the doorway, the place where roads meet, the night between one month and the next. So the journey begins at your own front door, with a lamp, a little clean water and an introduction. Nothing is promised yet.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'hekate-threshold-look',
          title: 'Learn your doorway',
          instructions:
            'Before the opening rite, spend a few minutes at your front door, the threshold of your flat or the gate of your house. Notice where the light falls, what the door sees, where the nearest place is that two or three roads or paths meet. In ancient Athens a small shrine to Hekate stood just here. Decide where a candle or lamp could safely stand for a few minutes each night.',
          times: 1,
          prompt: 'What do you feel at your own threshold? What crosses it every day?',
        },
      ],
      rite: {
        title: 'An introduction at the door',
        summary:
          'A short Greek-style introduction: purify your hands, light a lamp at the threshold, greet Hestia, then introduce yourself to Hekate by her old titles and pour a little water or wine for her.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of fresh water for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A match, or a sprig of bay or rosemary to quench in it', ref: 'traditional/herb/bay' },
          { name: 'A tealight, oil lamp or electric candle' },
          { name: 'A small cup of water, wine or milk with honey for the libation' },
          { name: 'A dish or bowl to pour into, or a patch of earth outside', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A key you use every day', ref: 'traditional/tool/key', optional: true },
          { name: 'A little frankincense on a heatproof burner', ref: 'traditional/herb/frankincense', optional: true },
        ],
        preparation:
          'Do this after dark if you can. Tidy the area just inside your door and set the lamp, the cup and the pouring dish on a small table or the floor beside it. Wash your face and hands in ordinary water first. If you have a key, lay it beside the lamp: Hekate was called Kleidouchos, the key-holder.',
        steps: [
          {
            title: 'Make khernips',
            instructions:
              'Light the match or the tip of the bay sprig and plunge it into the bowl of water, saying the words. This is khernips, the lustral water of Greek ritual. Wash your hands in it and sprinkle a few drops on your face.',
            spoken: 'Be gone, all that is unclean. With clean hands I come to the door.',
          },
          {
            title: 'Begin with Hestia',
            instructions:
              'Light the lamp. In Greek custom every rite begins with Hestia, goddess of the hearth. Pour a drop of your libation into the dish for her.',
            spoken: 'Hestia, first and last, keeper of this house: I begin with you.',
            light: true,
          },
          {
            title: 'Call Hekate',
            instructions:
              'Face the door, or open it a little if that is safe. Raise your hands, palms open. If you are using incense, add a few grains now. Speak slowly. You are introducing yourself, not asking for anything.',
            spoken:
              'Hekate, torch-bearer, you who stand before the gate, key-holder, guardian of the roads: I am [your name]. I have heard of you in Hesiod’s song and in the stories of the dark month. I come to your threshold to learn who you are. Be kind to me as I learn.',
            minutes: 2,
          },
          {
            title: 'Pour for her',
            instructions:
              'Pour most of the libation into the dish or onto the earth outside the door. Do not drink from it after. Sit quietly in the doorway for a few minutes with the lamp. Notice what comes, and let nothing come if nothing does.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions:
              'Pour the last drop for Hestia. Thank both goddesses. Close the door.',
            spoken: 'Hestia, last as you were first, thank you. Hekate, thank you for your light.',
            snuff: true,
          },
        ],
        closing:
          'Pour the dish of libation outside onto earth or down an outside drain, not back into a cup. Pour the khernips away outside too. Write a few lines about how it felt to stand at your own door and call her.',
        safety:
          'Never leave a flame unattended, and keep it away from coats, curtains and draughts from the open door. Quench the khernips match fully and do this away from smoke alarms if possible. Frankincense smoke can trouble people with asthma and small pets; use a little or skip it.',
      },
    },
    {
      kind: 'study',
      title: 'Learning who she is',
      intro:
        'Ten days of reading, one lesson every two or three days. You will meet the oldest Hekate, the goddess of Hesiod and the household shrine, then follow how she grew into the three-formed queen of magic, then learn how she was actually worshipped and how people honour her now.',
      days: 10,
      lessons: [
        {
          id: 'hekate-earliest',
          title: 'The oldest Hekate',
          summary: 'Who Hekate was in the earliest Greek sources, before the witch and the crone.',
          minutes: 6,
          sections: [
            {
              heading: 'Hesiod’s great goddess',
              body: `The first long account of Hekate is a surprise to most modern readers. In Hesiod’s Theogony, a poem about the birth of the gods composed around 700 BCE, she is not a goddess of witches at all. She is the daughter of the Titans Perses and Asteria, and Hesiod gives her more lines of praise than almost any other deity. He calls her “Hecate whom Zeus the son of Cronos honoured above all.”

In his telling, Zeus did not take away her old honours when he defeated the Titans. She keeps a share in earth, in sea and in starry heaven. She sits beside kings when they judge, stands near soldiers in battle and athletes at the games, helps fishermen and horsemen, and increases or shrinks herds of cattle and flocks of sheep “if she will.” Zeus also made her kourotrophos, a nurse of the young. Hesiod even says that whenever anyone sacrifices and prays according to custom, they call upon Hekate.`,
            },
            {
              heading: 'The torch in the Demeter hymn',
              body: `The second early source is the Homeric Hymn to Demeter, from the seventh or sixth century BCE. When Hades carries Persephone away, only two beings hear her cry: the sun, and “tender-hearted Hecate, bright-coiffed,” listening from her cave. On the tenth day of Demeter’s search, Hekate meets her “with a torch in her hands” and tells her what she heard.

At the end of the hymn, when Persephone returns, Hekate embraces her, and from then on is her “minister and companion.” This is where two of her most lasting images come from: the torches, and her role as a guide between the upper world and the world below. She is gentle here, and she is a witness. She hears what others miss.`,
            },
            {
              heading: 'Where she came from',
              body: `Nobody knows for certain where Hekate began. Her name may come from the Greek hekatos, “far-off” or “working from afar,” an epithet also used for Apollo, but this is debated. One of the oldest dedications to her is a sixth-century BCE inscription from Miletus on the coast of Asia Minor, and her greatest sanctuary in later times was at Lagina in Caria, in what is now south-west Turkey. Many scholars think she came into Greek religion from Caria or nearby, though others see her as Greek from the start.

What is clear is that by the fifth century BCE she was everywhere in Greek domestic life. She was one of the gods of the household’s edges, honoured with a small shrine at the door, rather than a great goddess of temples and civic festivals. That is a good place to begin your own relationship: at the door, modestly, every month.`,
            },
            {
              heading: 'How she looked',
              body: `Early images show Hekate as a young woman in a long robe, holding a torch in each hand, sometimes with a dog. She is not old, and she is not threefold. Vase painters put her beside Demeter and Persephone, lighting the way. When you picture her this month, let this be the first picture: a young goddess with two torches, standing where the light of the house meets the dark of the road.`,
            },
          ],
          knowAndDont: {
            known:
              'Hesiod’s Theogony (lines 411–452) and the Homeric Hymn to Demeter are our earliest literary sources, and both present Hekate as a powerful, kindly goddess with torches, close to Demeter and Persephone. Early art shows her single and young. A sixth-century dedication from Miletus and the great Hellenistic sanctuary at Lagina show strong roots in Asia Minor.',
            unknown:
              'Her origin and the meaning of her name are uncertain. Some scholars think Hesiod’s long praise reflects a local cult his family brought from Asia Minor, rather than how most Greeks saw her. We do not know how widely Hesiod’s grand, all-ruling Hekate was worshipped outside poetry.',
          },
          inPractice:
            'Hellenic polytheists often read the Hesiod passage aloud as part of Hekate’s rites, and many begin their devotion with the kindly torch-bearer of the Demeter hymn rather than the later sorceress. Try reading the Theogony passage once aloud this week, in any public-domain translation.',
          reflect: [
            'Which picture of Hekate did you arrive with? How does Hesiod’s goddess sit beside it?',
            'Hekate hears Persephone when no one else does. What have you heard that others missed?',
          ],
          further: [
            'Hesiod, Theogony 411–452, trans. H. G. Evelyn-White (1914), free on Project Gutenberg',
            'Homeric Hymn to Demeter, trans. H. G. Evelyn-White (1914)',
            'Sarah Iles Johnston, Hekate Soteira (1990)',
          ],
          library: ['traditional/deity/hekate', 'traditional/deity/persephone', 'traditional/deity/demeter'],
        },
        {
          id: 'hekate-forms',
          title: 'Three faces, the witch and the world soul',
          summary:
            'How Hekate became three-formed, the patron of sorceresses and a cosmic power, and what is modern about the crone and the wheel.',
          minutes: 8,
          sections: [
            {
              heading: 'The three-formed goddess',
              body: `Hekate’s three faces are old, but not as old as she is. The travel writer Pausanias, in the second century CE, gives his opinion that the sculptor Alkamenes was the first to make three images of Hekate joined together. That statue, which Athenians called Hekate Epipyrgidia, “on the tower,” stood at the entrance to the Acropolis beside the little temple of Athena Nike, and Alkamenes was working in the later fifth century BCE. After that the triple Hekate, three women back to back facing three ways, became common, especially at three-way crossroads.

Her epithet Trioditis, “of the three ways,” and the Roman name Trivia say the same thing. The faces watch each road. Small triple pillars called hekataia stood at doorways and crossroads all over the Greek world. So the triple form grew out of her place, the meeting of roads, not out of a theory about the stages of a woman’s life.`,
            },
            {
              heading: 'Medea, Simaetha and the magical papyri',
              body: `Hekate’s link with witchcraft is ancient too, but it grows over time. In Euripides’ Medea (431 BCE), the sorceress swears by Hekate, the goddess she honours above all, who lives in the innermost part of her hearth, and in Apollonius’ Argonautica (third century BCE) Medea is her priestess, gathering herbs and calling her up at night. In Theocritus’ second Idyll, a young woman called Simaetha works a love spell by moonlight and calls on Selene and Hekate together.

In the Greek Magical Papyri, spells written in Roman Egypt between roughly the second century BCE and the fifth century CE, Hekate merges with Selene, Artemis and Persephone, and even with the Mesopotamian Ereshkigal. She becomes a great moon goddess and queen of ghosts. Some curse tablets of the classical period, lead sheets buried in graves, also name her as an underworld power. The Hekate of the night, the moon and magic is real and ancient, but it is one side of her, and a late-developing one.`,
            },
            {
              heading: 'The Hekate of the Chaldean Oracles',
              body: `A very different Hekate appears in the Chaldean Oracles, a collection of oracular verses attributed to Julian the Chaldean and his son Julian the Theurgist in the second century CE. Only fragments survive, quoted by later Neoplatonist philosophers. Here Hekate is Soteira, the saviour, a cosmic soul who stands between the Father’s divine mind and the material world, a kind of membrane through whom life flows into everything.

The Oracles also mention the iynx and the strophalos, devices spun on a cord in theurgic ritual. The eleventh-century writer Michael Psellus describes Hekate’s strophalos as a golden sphere with a sapphire in its centre, turned by a leather thong and marked with characters. That is the ancient root of the name “Hekate’s wheel.”`,
            },
            {
              heading: 'The crone and the modern wheel',
              body: `Two images that many people meet first are modern. The idea of Hekate as the crone in a trio of maiden, mother and crone comes from twentieth-century writers, above all Robert Graves in The White Goddess (1948), and spread through Wicca and the goddess movement. No ancient text calls her old.

The maze-like “Hekate’s wheel” sold on altar cloths and jewellery, a circle with a winding serpent pattern inside, is a modern design. It does not appear in that form in ancient art, and its exact origin in late-twentieth-century Pagan circles is hard to pin down. Many devotees use it with real love. There is nothing wrong with that, as long as you know it is a modern emblem honouring an ancient idea, not a recovered relic.`,
            },
          ],
          knowAndDont: {
            known:
              'Pausanias (2.30.2) credits Alkamenes, a sculptor of the later fifth century BCE, with the first triple Hekate. Euripides, Apollonius and Theocritus tie her to sorceresses. The Greek Magical Papyri and some curse tablets invoke her. Fragments of the Chaldean Oracles make her a cosmic saviour, and Psellus describes the strophalos.',
            unknown:
              'Pausanias offers the Alkamenes attribution as his own opinion, five centuries later; an earlier triple image cannot be ruled out, and the exact date of the statue is not known. We do not know exactly how the strophalos worked or what the theurgists saw in it, and the Oracles survive only in pieces. The crone Hekate is a twentieth-century creation. The modern wheel design has no confirmed ancient source, and claims about who drew it first conflict.',
          },
          inPractice:
            'Modern devotees tend to lean toward one or two of these Hekates: the household goddess of the Deipnon, the queen of witches, or the Chaldean world soul. You do not have to choose, but it helps to know which one you are speaking to on a given night. Many people keep a triple image or a strophalos on the shrine and a key and torch beside it, honouring both the old and the new.',
          reflect: [
            'Which of these faces draws you most: the torch-bearer, the sorceress’s goddess or the cosmic soul? Why?',
            'How do you feel learning that the crone and the wheel are modern? Does it change how you will use them?',
          ],
          further: [
            'Pausanias, Description of Greece 2.30.2, trans. W. H. S. Jones (1918)',
            'Euripides, Medea; Apollonius of Rhodes, Argonautica book 3; Theocritus, Idyll 2',
            'Sarah Iles Johnston, Restless Dead (1999)',
            'Hans Dieter Betz (ed.), The Greek Magical Papyri in Translation (1986)',
          ],
          library: ['traditional/deity/hekate', 'traditional/deity/selene', 'traditional/deity/artemis', 'traditional/deity/diana'],
        },
        {
          id: 'hekate-worship',
          title: 'Door, crossroads and supper: how Hekate was worshipped',
          summary: 'The household shrine, the Deipnon, purification, and the rules of offering to her.',
          minutes: 7,
          sections: [
            {
              heading: 'The shrine at the front door',
              body: `In classical Athens many houses had a hekataion, a small image or pillar of Hekate, at the front door. Her epithet Propylaia means “before the gate,” and she was a guardian of the entrance, keeping out harm and unwanted spirits. Aristophanes’ comedies mention these little doorway shrines in passing, as an ordinary part of the street, much as you might mention a doorbell.

So the oldest daily Hekate is not glamorous. She stands by the door. People greeted her as they went out, and offered small things there. If you take one practice from this journey, take this: a place by your door where you acknowledge her.`,
            },
            {
              heading: 'The Deipnon, her supper',
              body: `At the end of every lunar month, on the day the Athenians called hene kai nea, “the old and the new,” people left a meal for Hekate at a crossroads. This was her deipnon, her supper. Sources mention cakes, often with small torches or candles, along with bread, eggs, cheese and small fish such as red mullet. Writers sometimes joke that the poor and hungry would eat Hekate’s suppers: Aristophanes’ Wealth says as much.

The Deipnon was also a cleansing of the house. The household swept up and carried out the remnants of the month’s purifications, the oxythymia, to the crossroads with the meal. Then they turned and walked home without looking back. The supper was given away entirely. It was not shared, tasted or brought back.`,
            },
            {
              heading: 'Chthonic rules',
              body: `Greeks divided their worship roughly between the gods of the sky, the ouranioi, and the gods of the earth and the dead, the chthonioi. Sky gods received burnt offerings on raised altars, and the worshippers usually shared the meat. Chthonic offerings were often poured into the ground or burnt whole, and the worshippers did not eat from them.

Hekate stands with a foot in each world, but her suppers were treated in the chthonic way. That is why modern Hellenists insist the Deipnon food is not eaten. Palms are turned downward when praying to earth powers, and the eyes may be lowered. These are small gestures, but they are how the tradition marks the difference.`,
            },
            {
              heading: 'Torches, keys and dogs',
              body: `Her emblems in cult were torches, keys and dogs. At Lagina in Caria, inscriptions of the Hellenistic and Roman periods record a yearly Kleidos Agoge, the procession of the key, which linked her sanctuary with the nearby city of Stratonikeia. No surviving source says what the key was meant to do. Her title Kleidouchos, “key-holder,” made her a goddess who opens and shuts the ways.

Dogs were her companions, and their barking at night was said to announce her. Dogs were also sometimes sacrificed to her. Pausanias says the people of Colophon offered a black female puppy at night to Enodia, the goddess of the road, usually taken to be Hekate, and Plutarch mentions Greeks sacrificing dogs to Hekate. That is part of the honest record and nothing anyone does today. Modern devotees honour the dog instead by caring for living dogs: a donation to a shelter is a common offering.`,
            },
          ],
          knowAndDont: {
            known:
              'Doorway hekataia and crossroad suppers are well attested in Athenian literature, including Aristophanes and Theophrastus’ portrait of the superstitious man, and later lexicographers explain the oxythymia. The ouranic and chthonic distinction is real, though scholars now stress it was a spectrum, not a rule.',
            unknown:
              'We do not have a full ancient description of a Deipnon rite. We know the outline (meal, crossroads, purification, no return) but not the words said, if any, or how widely every household kept it. Whether the Deipnon also honoured the restless dead, as many modern people practise, is suggested but not certain.',
          },
          inPractice:
            'A modern Deipnon in an apartment usually means: clean the house during the day, take out the rubbish, make a small plate of bread, an egg and honey cake, light a candle at the threshold, pray, then leave the plate outside the door or at the nearest crossroads and walk away. The next morning it is composted or binned, never eaten. The app’s premade Deipnon walks you through this.',
          reflect: [
            'What would it mean for you to give something away completely, not to be tasted or returned?',
            'What does your household need swept out each month?',
          ],
          further: [
            'Aristophanes, Wealth (Plutus) 594–597',
            'Theophrastus, Characters 16, “The Superstitious Man”',
            'Jon D. Mikalson, Ancient Greek Religion (2nd ed., 2010)',
          ],
          library: ['traditional/deity/hekate', 'traditional/tool/key', 'traditional/vessel/offering_bowl'],
          premade: ['folk-hekate-deipnon', 'folk-khernips-libation'],
        },
        {
          id: 'hekate-today',
          title: 'Hekate today, and a shrine of your own',
          summary: 'The communities that honour her now, the names to use in prayer, and how to set up her shrine.',
          minutes: 7,
          sections: [
            {
              heading: 'Who honours her now',
              body: `Hekate may be the most widely honoured Greek goddess today, and among very different groups. Hellenic polytheists, sometimes called Hellenismos, try to reconstruct ancient Greek religion from the evidence. They keep her Deipnon at the month’s end, honour her at the door, and mostly see her as one of many household gods. Groups like YSEE in Greece and Hellenion in the United States keep this approach.

Eclectic Hellenic Pagans and a great many witches take a looser path. For them Hekate is often a patron goddess of witchcraft, honoured at the dark moon and Samhain, called on for protection, crossroads magic and spirit work. Some groups devote themselves to her alone; the Covenant of Hekate, founded by Sorita d’Este in 2010, is one international example. Others draw on the Chaldean Oracles and treat her as a cosmic saviour in a more philosophical way. You will meet all of these online, often in disagreement.`,
            },
            {
              heading: 'Names to call her by',
              body: `Greek prayer piles up epithets, the god’s titles, because each one names a power you are calling. For Hekate the old ones are: Phosphoros, light-bringer; Propolos, the attendant or guide; Kleidouchos, key-holder; Propylaia, before the gate; Enodia, of the road; Trioditis, of the three ways; Kourotrophos, nurse of the young; Chthonia, of the earth; and, from the Oracles, Soteira, saviour.

A simple prayer names her, reminds her of any past offerings, and then asks. It is courteous to use two or three titles that fit what you are asking. You might call her Propylaia when you ask for the house to be guarded, and Phosphoros when you ask for clarity in a hard decision.`,
            },
            {
              heading: 'Setting up her shrine',
              body: `Put Hekate’s shrine by your front door if you can, or on a shelf facing it. It need not be large. A small lamp or candle holder, a key, an image of her (single with torches, or triple), a dish for offerings and a small bowl for khernips are enough. Many people add a dog figurine. Black, deep red and silver are modern colour choices; ancient sources do not set colours for her.

Keep the shrine clean and keep food off it except on the night you take it out. Hellenic practice keeps chthonic and household things a little apart, so if you have a main household shrine for Hestia and other gods, Hekate’s usually sits at the threshold rather than in the middle of it.`,
            },
            {
              heading: 'Plants and stones',
              body: `Ancient sources connect her with very few plants. Garlic turns up in connection with crossroads offerings, though the evidence is thin. Aconite and other poisonous plants appear in later stories linking her with Medea, and a late poem, the Orphic Argonautica, describes a walled garden of hers full of such plants. Most of the herb and crystal correspondences you will see online, from mugwort to labradorite, are modern. That does not make them wrong to use. It means you should treat them as a modern language for honouring her, not as ancient rules.`,
            },
          ],
          knowAndDont: {
            known:
              'Hellenic reconstructionist practice of the Deipnon draws directly on ancient sources. Her epithets above are all attested in Greek literature, inscriptions or the Chaldean Oracles. Doorway shrines are ancient.',
            unknown:
              'Colour, crystal and most herb correspondences are modern. Many popular titles online, such as “Queen of Witches,” are modern too, though rooted in ancient themes. Claims that a particular modern ritual is “how the ancients honoured her” should be treated with care.',
          },
          inPractice:
            'Choose three epithets to use this month and write them on a card for the shrine. Set the shrine up near your door with a lamp, a key and a dish. If you live with others, a shelf just inside the door is enough, and it can look like an ordinary arrangement of a candle and a key.',
          reflect: [
            'Which community’s approach feels closest to yours, and which feels furthest away?',
            'Which three of her names will you use, and why those?',
          ],
          further: [
            'Sorita d’Este (ed.), Hekate: Her Sacred Fires (2010), an anthology of modern devotees',
            'Drew Campbell, Old Stones, New Temples (2000), on Hellenic reconstructionism',
            'Ruth Majercik, The Chaldean Oracles: Text, Translation and Commentary (1989)',
          ],
          library: ['traditional/deity/hekate', 'traditional/tool/key', 'traditional/herb/garlic', 'traditional/herb/mugwort'],
          premade: ['hedge-crossroads-choice', 'kitchen-threshold-salt-blessing'],
        },
      ],
      practices: [
        {
          id: 'hekate-study-read',
          title: 'Read her hymns aloud',
          instructions:
            'Once in this stage, read Hesiod’s passage on Hekate (Theogony 411–452) and the opening and close of the Homeric Hymn to Demeter aloud, by your doorway lamp. Ancient hymns were sung or spoken, not read silently.',
          times: 1,
          prompt: 'Which line stayed with you? Write it down and say why.',
        },
        {
          id: 'hekate-study-shrine',
          title: 'Build the threshold shrine',
          instructions:
            'After the fourth lesson, set up a small shrine near your front door: lamp, key, dish, image if you have one, and a card with three epithets.',
          times: 1,
          prompt: 'What did you put on the shrine, and what did you leave off?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights at the door',
      intro:
        'Nine nights of a short, steady practice at the threshold, then a lesson on her days and offerings. In ancient practice Hekate’s food came once a month, at the Deipnon, not every day. So the nightly practice is a greeting with light and a few words, and food waits for her supper.',
      days: 12,
      lessons: [
        {
          id: 'hekate-days-offerings',
          title: 'Her days, her offerings, and the hard parts',
          summary:
            'The monthly calendar, what to give and how, which dates are modern, and how to handle the darker material honestly.',
          minutes: 8,
          sections: [
            {
              heading: 'The month: Deipnon and Noumenia',
              body: `The Greek month followed the moon. Its last day, the dark of the moon, belonged to Hekate’s Deipnon. The next day, when the first thin crescent could be seen at sunset, was the Noumenia, the new month, given to the household gods and to Apollo Noumenios. Modern Hellenists keep the day after that for the Agathos Daimon, the good spirit of the house. Together these three days make a small cycle: clear out, begin again, bless the house.

So the most traditional rhythm for honouring Hekate is monthly. Clean on the Deipnon, leave her supper, and greet the new month the next evening. The app marks all three days in your calendar.`,
            },
            {
              heading: 'Dates that are modern',
              body: `You will often read that 16 November is the “Night of Hekate,” or that 13 August is her feast. Neither has any ancient evidence. Nobody has traced where the November date began; it circulates in modern Pagan calendars without a source. 13 August is the Ides of August, the day of the Roman Nemoralia of Diana at Nemi, and Hekate was linked to it later through Diana and Trivia. Samhain, the Gaelic festival at the start of November, has nothing to do with Hekate historically, though many witches now honour her then because it is a festival of the dead.

You are free to keep any of these. Just keep them as modern devotional dates, chosen because they mean something to the community now.`,
            },
            {
              heading: 'What to give, and how',
              body: `For the Deipnon, the attested foods are cakes, bread, eggs, cheese and small fish, often with a little light. Honey, wine, milk and water make good libations. Garlic is mentioned too, but never leave garlic, onion, chocolate, grapes or raisins where dogs, cats or wildlife can eat them; they are poisonous to them. A plain honey cake, a boiled egg and a little bread are safe and traditional.

Give the offering, pray, and walk away without looking back. Do not eat it the next morning. If you cannot leave food outside, set it on a plate by the door overnight and put it in the compost or outdoor bin the next day. If you cannot give food at all, light and words are enough. Many modern devotees also give time or money to people in need, to dog shelters or to those who work with the dying, all part of her ancient care for the vulnerable and the young.`,
            },
            {
              heading: 'The darker material',
              body: `Some ancient people asked Hekate to bind or harm their enemies, and some modern books still teach curses in her name. This journey does not. Her old titles are mostly protective: guardian of the door, guide of the lost, nurse of children, saviour. When you ask her for help against harm, ask her to guard, to bar the door and to light the way out. Defensive work is in keeping with her oldest worship.

You will also find online warnings that Hekate punishes those who stop honouring her, or that she “claims” people. There is no ancient basis for that kind of fear. Approach her with respect and steadiness, and leave if you need to. Ancient Greeks honoured many gods and moved between them freely.`,
            },
          ],
          knowAndDont: {
            known:
              'The Deipnon fell on the last day of the lunar month and the Noumenia on the first; both are well attested for Athens. Cakes, eggs, cheese, bread and small fish are named as foods for Hekate in ancient comedy and later scholarship.',
            unknown:
              'Whether every Greek city kept the Deipnon, or kept it the same way, is unknown. Setting the second day of the month apart for the Agathos Daimon is a modern Hellenic convention; the Agathos Daimon was honoured with wine after meals in antiquity, but a fixed monthly day is hard to trace. The November and August feast dates have no ancient basis. Exactly what was said over the supper is lost; modern prayers fill the gap.',
          },
          inPractice:
            'Mark the next Deipnon in your calendar now. Plan a cleaning task for that day, a simple plate (honey cake, egg, bread) and a place to leave it. On the Noumenia after, give the household gods a little incense and water. Use the premade Deipnon and Noumenia workings if you want a guided version.',
          reflect: [
            'How does a monthly rhythm feel, compared with daily devotion or yearly festivals?',
            'What do you need guarding from this month, and how could you ask her to guard rather than to harm?',
          ],
          further: [
            'Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year (1975)',
            'Sarah Iles Johnston, Hekate Soteira (1990)',
          ],
          library: ['traditional/deity/hekate', 'traditional/deity/diana'],
          premade: ['folk-hekate-deipnon', 'folk-noumenia-blessing', 'kitchen-sweeping-out-the-old'],
        },
      ],
      practices: [
        {
          id: 'hekate-nine-nights',
          title: 'Nine nights at the threshold',
          instructions:
            'For nine nights, at about the same time after dark, go to your threshold shrine. Wash your hands in khernips or plain water. Light the lamp and say a word to Hestia. Then greet Hekate by one of your three epithets and say one true thing about your day: something you crossed, something you are standing in front of. Add a pinch of incense or pour a few drops of water into the dish. Sit for three minutes. Thank her, put out the light and pour the water away outside. Keep food for the Deipnon.',
          times: 9,
          every: 'day',
          prompt: 'What threshold were you standing at today? Did anything shift when you named it to her?',
        },
        {
          id: 'hekate-practice-deipnon',
          title: 'Keep a Deipnon',
          instructions:
            'If a dark moon falls during this stage, keep the Deipnon: clean, take out the rubbish, leave her supper and walk away without looking back. If it does not, keep it as your dedication night.',
          times: 1,
          every: 'month',
          premade: 'folk-hekate-deipnon',
          prompt: 'What did you carry out of the house? How did it feel to walk away without looking back?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'At the crossroads',
      intro: `Now you stand where Hekate stands: at the meeting of roads. Take a few days to look honestly at the month. A dedication is a promise to keep showing up, and it is only worth making if you mean it.

Stopping here is a good outcome. So is pausing for a season, or realising that another god, another path or no dedication at all is right for you. Hekate guided Demeter to the truth, not to the answer she wanted. Let her do the same for you.`,
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'hekate-discern-walk',
          title: 'A crossroads walk',
          instructions:
            'Walk to a place where three roads or paths meet. Stand there for a few minutes. Think about each road as a choice: dedicate, wait, or turn elsewhere. Notice which one your body leans toward. Walk home without looking back.',
          times: 1,
          premade: 'hedge-crossroads-choice',
          prompt: 'Which road did you lean toward? What made you lean?',
        },
      ],
      questions: [
        'Have I kept the nine nights and her supper because I wanted to, or because I felt I had to?',
        'Do I feel drawn to Hekate herself, or mainly to the image of a powerful witch goddess? Is that enough for me?',
        'Can I keep a monthly Deipnon, in my home and life as they are now, for at least a year?',
        'Do I understand which parts of what I believe about her are ancient and which are modern, and am I at peace with that?',
        'Is anyone in my life, or any part of me, pushing me to dedicate before I am ready?',
        'Would I be relieved or disappointed if I decided to wait? What does that tell me?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication at her supper',
      intro: `If you have chosen to go on, make your dedication on the night of the Deipnon, the dark of the moon. This is a self-dedication: a promise you make on your own behalf. It is not an initiation and does not make you a priestess or a member of any order. Groups that do initiate, such as some Hekatean covens and orders, have their own rites, and this does not replace them.

Ancient Greeks rarely dedicated themselves to a single god. Your promise can sit happily alongside honouring others.`,
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Hekate on the Deipnon',
        summary:
          'Clean the house, purify, begin with Hestia, call Hekate by her titles, make your promise at the threshold, give her supper away at the crossroads and walk home without looking back.',
        minutes: 60,
        ingredients: [
          { name: 'A bowl of fresh water and a match or bay sprig for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A lamp, tealight or electric candle' },
          { name: 'A small plate: a honey cake or bread, a boiled egg, a little cheese', ref: 'traditional/vessel/dish' },
          { name: 'A cup of wine, milk with honey, or water for the libation' },
          { name: 'Your key from the shrine', ref: 'traditional/tool/key' },
          { name: 'A little frankincense or myrrh', ref: 'traditional/herb/myrrh', optional: true },
          { name: 'Your written promise on a card' },
        ],
        preparation:
          'During the day, clean the house properly: sweep, wipe the threshold, take the rubbish out. Write your promise in your own words. Keep it simple and doable, for example: to keep her Deipnon each month for a year, to greet her at the door, to study her honestly and to guard the vulnerable as she does. Prepare the plate. Wash and dress in clean clothes.',
        steps: [
          {
            title: 'Purify',
            instructions:
              'Make khernips by quenching the flame in the water. Wash your hands and sprinkle your face, then sprinkle a few drops at the threshold.',
            spoken: 'Be gone, all that is unclean. The house is swept and my hands are clean.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the lamp at the threshold shrine. Pour a drop of the libation for Hestia.',
            spoken: 'Hestia, first and last, I begin with you.',
            light: true,
          },
          {
            title: 'Call Hekate',
            instructions:
              'Face the door. Add incense if you are using it. Hold the key in your open hands. Speak her titles slowly.',
            spoken:
              'Hekate Phosphoros, light-bringer; Propylaia, before the gate; Kleidouchos, key-holder; Enodia of the road; Kourotrophos, nurse of the young: hear me. For this month I have kept your door and your nights and learned your old stories. Now I come to your supper to make a promise.',
            minutes: 2,
          },
          {
            title: 'Make your promise',
            instructions:
              'Read your promise aloud. Then pour most of the libation into the dish for her. Place the key back on the shrine: it is now a sign of your promise.',
            spoken: 'This is my promise, made freely. Light my way as I keep it.',
          },
          {
            title: 'Sit with her',
            instructions: 'Sit by the lamp in silence for a while. Let whatever comes come.',
            minutes: 7,
            timed: true,
          },
          {
            title: 'Carry out her supper',
            instructions:
              'Take the plate and the dish of libation to a crossroads, or set them just outside your door. Leave the supper. Pour the libation onto earth or into an outside drain. Turn and walk home without looking back.',
            spoken: 'Hekate, your supper. I give it and leave it.',
          },
          {
            title: 'Close with Hestia',
            instructions: 'Back inside, pour the last drop for Hestia. Thank both goddesses and put out the lamp.',
            spoken: 'Hestia, last as you were first. It is done.',
            snuff: true,
          },
        ],
        closing:
          'Wash your hands. Write in your journal what you promised and what you felt. In the morning, put any food left outside into the compost or outdoor bin; never bring it back in to eat. Keep your written promise near the shrine and read it at each Deipnon.',
        safety:
          'Never leave a flame unattended or burning while you walk to the crossroads; put it out first if no one is home. Keep candles away from the open door and coats. Do not leave garlic, onion, chocolate, grapes or raisins outdoors where animals can eat them, and choose a place where food will not attract trouble for neighbours. Incense smoke can affect asthma and pets.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the door',
      intro: `Your relationship with Hekate now lives in the month. Keep the Deipnon at each dark moon: clean, carry out, give, walk away. Greet the household gods at the Noumenia. Pass her shrine at the door with a word or a nod.

Once a year, on the Deipnon nearest the date of your dedication, read your promise again and renew it, change it, or set it down with thanks. Many people also honour her at the Deipnon closest to Samhain as a modern custom. If life gets in the way, light the lamp at the next dark moon and begin again; she is a goddess of thresholds, and there is always another one.`,
      days: 30,
      lessons: [],
      practices: [
        {
          id: 'hekate-ongoing-deipnon',
          title: 'Monthly Deipnon',
          instructions:
            'Each dark moon: clean the house, take out the rubbish, leave her supper and walk away without looking back.',
          times: 12,
          every: 'month',
          premade: 'folk-hekate-deipnon',
          prompt: 'What did this month bring to the threshold? What are you sweeping out?',
        },
        {
          id: 'hekate-ongoing-noumenia',
          title: 'Greet the new month',
          instructions:
            'The evening after the Deipnon, or when you see the first crescent, give incense and water to the household gods and ask a blessing on the month.',
          times: 12,
          every: 'month',
          premade: 'folk-noumenia-blessing',
        },
        {
          id: 'hekate-ongoing-rededicate',
          title: 'Yearly rededication',
          instructions:
            'On the Deipnon nearest your dedication date, repeat the dedication rite with your promise rewritten for the coming year.',
          times: 1,
          every: 'month',
          prompt: 'What has a year with Hekate taught you? What will you promise now?',
        },
      ],
    },
  ],
  sources: [
    'Hesiod, Theogony 411–452, trans. H. G. Evelyn-White, Hesiod, the Homeric Hymns and Homerica (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (quoted: “Hecate whom Zeus the son of Cronos honoured above all”)',
    'Homeric Hymn to Demeter (the closing lines are 438–440), trans. H. G. Evelyn-White (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (quoted: “tender-hearted Hecate, bright-coiffed”; “with a torch in her hands”; “minister and companion to Persephone”)',
    'Pausanias, Description of Greece 2.30.2, on Alkamenes’ triple Hekate; 3.14.9, on the Colophonian puppy offering to Enodia',
    'Plutarch, Roman Questions 52 and 68, on dogs offered to Hekate',
    'Hellenistic and Roman inscriptions from Lagina and Stratonikeia on the Kleidos Agoge (key procession)',
    'Aristophanes, Wealth 594–597; Theophrastus, Characters 16',
    'Euripides, Medea; Apollonius of Rhodes, Argonautica 3; Theocritus, Idyll 2',
    'Michael Psellus on the strophalos, in Ruth Majercik, The Chaldean Oracles (1989)',
    'Sarah Iles Johnston, Hekate Soteira (1990) and Restless Dead (1999)',
    'Jon D. Mikalson, Ancient Greek Religion (2010)',
    'Robert Graves, The White Goddess (1948), as the source of the modern crone image',
  ],
};
