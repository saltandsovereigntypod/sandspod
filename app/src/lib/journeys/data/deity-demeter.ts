import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-demeter',
  kind: 'deity',
  paths: ['hellenic', 'roman', 'wheel'],
  deityRef: 'traditional/deity/demeter',
  title: 'Demeter: The Grain and the Grief',
  summary:
    'A lunar month with Demeter, the goddess of grain: her great Homeric hymn, what we know and do not know of Eleusis, the women’s festivals of the Thesmophoria and Haloa, and a daily practice of bread, barley and gratitude.',
  welcome: `This is a month of study and devotion with Demeter, the Greek goddess of grain, the harvest and the bond between mother and child. She is the goddess of the bread on your table and of the grief that makes the fields go bare. People come to her in gratitude, in hard work, and very often in loss.

It is a self-dedication, not an initiation. That matters more with Demeter than with almost any other god, because her most famous rites, the Eleusinian Mysteries, were an initiation, and a secret one. Nobody alive knows what happened inside the hall at Eleusis, and nothing in this journey pretends to. What we can do is read the hymn the initiates knew, learn the festivals that were public or are well described, and keep the plain, old customs of giving her the first of the grain.

You will need a loaf of bread or some barley, a small lamp or candle, a bowl of water, and a little time each day. A kitchen is the right place for a lot of this.`,
  about: `Demeter was one of the great goddesses of ancient Greece: daughter of Kronos and Rhea, sister of Zeus, and mother of Persephone. Her name is often read as “Earth Mother” or “Grain Mother,” though the first part is uncertain. Her story is told in the Homeric Hymn to Demeter, composed around the seventh or sixth century BCE: Hades carries off her daughter, Demeter searches the earth with torches, sits grieving at Eleusis disguised as an old woman, and finally withholds the grain until Zeus gives way. Persephone returns for two parts of the year, and Demeter teaches her mysteries to the kings of Eleusis. For around a thousand years, people from all over the Greek and then Roman world went to Eleusis to be initiated, and they said they came away with “better hope” for life and death. At home and in the villages, she was the goddess of the threshing floor, the seed corn and the women’s autumn festival, the Thesmophoria. The Romans honoured her as Ceres. Today Hellenic polytheists keep her festivals as best the evidence allows, and modern Pagans honour her at the harvest festivals of Lughnasadh and the autumn equinox. This journey keeps those two apart, and keeps the secret of Eleusis a secret.`,
  notes: [
    'The inner rites of the Eleusinian Mysteries are unknown. Anyone who claims to teach or restore them is offering a modern creation. This journey describes only what ancient writers let slip and what modern scholars infer.',
    'Do not recreate the ancient kykeon drink with pennyroyal. Pennyroyal is toxic and dangerous in pregnancy, and has caused deaths. Barley water with garden mint is a safe modern nod to it.',
    'The Thesmophoria was kept by citizen women in ancient Athens. Modern Hellenic groups differ on whether to keep it as a women’s rite; this journey offers a home version anyone can keep, and says so.',
    'The Hymn begins with an abduction. If that story touches your own experience, go gently, and skip any part you need to.',
    'If you leave grain, bread or fruit outside, keep grapes, raisins, onion, garlic and chocolate away from places animals can reach. Poppy seeds are fine for people; poppy pods and plants are not for eating.',
  ],
  holyDays: ['thesmophoria', 'eleusinia', 'haloa', 'skira', 'noumenia', 'lammas', 'mabon'],
  stages: [
    {
      kind: 'threshold',
      title: 'Bread on the table',
      intro:
        'Demeter is honoured where food is. So the journey begins at your table or kitchen counter, with a piece of bread, a lamp and a few words of introduction. You are only saying who you are, and that you would like to learn.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'demeter-threshold-bread',
          title: 'Trace your bread',
          instructions:
            'Before the opening rite, take one slice of bread or a handful of rice, oats or barley you have in the house. Spend ten minutes finding out where it came from: what grain, what country or region, roughly how many hands it passed through. Read the packet, look it up. Demeter’s first gift was that people stopped having to wander for food. Start by noticing how much work is in one mouthful.',
          times: 1,
          prompt: 'Whose work is in the food I ate today? Which of those people have I never thought about?',
        },
      ],
      rite: {
        title: 'An introduction at the table',
        summary:
          'A short Greek-style introduction: purify your hands, light a lamp, begin with Hestia, then set aside the first piece of bread for Demeter and introduce yourself.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of fresh water for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A match, or a sprig of bay or rosemary to quench in it', ref: 'traditional/herb/bay' },
          { name: 'A tealight, oil lamp or electric candle' },
          { name: 'A small loaf, a roll, or a few barley cakes or oatcakes' },
          { name: 'A small dish for her portion', ref: 'traditional/vessel/dish' },
          { name: 'A cup of water, milk, or water with a little honey for the libation' },
          { name: 'A few ears of wheat or a sprig of dried grass', optional: true },
        ],
        preparation:
          'Clear and wipe your table or a corner of the kitchen counter. Set the lamp, the bread on a plate, the empty dish and the cup there. Wash your face and hands in ordinary water first. This rite can be done at any hour, but the evening meal is a natural time.',
        steps: [
          {
            title: 'Make khernips',
            instructions:
              'Light the match or the tip of the bay sprig and plunge it into the bowl of water. This is khernips, the purified water of Greek ritual. Wash your hands in it and touch a few drops to your face.',
            spoken: 'With clean hands I come to the table.',
          },
          {
            title: 'Begin with Hestia',
            instructions:
              'Light the lamp. Every Greek rite begins with Hestia, the goddess of the hearth. Pour a drop of your libation into the dish for her.',
            spoken: 'Hestia, first and last, keeper of this house, I begin with you.',
            light: true,
          },
          {
            title: 'Call Demeter',
            instructions:
              'Stand or sit before the bread. Raise your hands with palms up. Speak slowly. Use her old name Deo if you like; the hymn uses it.',
            spoken:
              'Demeter, Deo, lady of the grain, bringer of seasons and giver of good gifts: I am [your name]. I eat your bread every day and I have hardly thanked you. I would like to learn who you are. Be gracious to me as I learn.',
            minutes: 2,
          },
          {
            title: 'Give the first portion',
            instructions:
              'Break the bread. Put the first piece, the best-looking piece, on her dish. Pour most of the libation beside it. Ancient Greeks called this aparche, the first fruits: the god’s share comes before yours. Then sit quietly for a few minutes.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Eat with thanks',
            instructions:
              'Now eat a piece of the bread yourself, slowly. This is a shared, everyday offering: her portion is hers, and the loaf is yours. Pour the last drop for Hestia and thank both goddesses.',
            spoken: 'Hestia, last as you were first. Demeter, thank you for the bread.',
            snuff: true,
          },
        ],
        closing:
          'Leave Demeter’s portion on the shrine or table until morning, then crumble it onto garden soil, into a planter or into the compost. Do not eat it. Pour the khernips away outside or down the sink with a word of thanks. Write a few lines about how it felt to give away the first piece.',
        safety:
          'Never leave a flame unattended, and keep it away from tea towels, packaging and curtains. Quench the khernips match fully. If you crumble bread outdoors, put out only small amounts so it does not draw rats, and keep it away from ponds where it harms water birds.',
      },
    },
    {
      kind: 'study',
      title: 'The hymn, the hall and the women’s rites',
      intro:
        'About ten days of reading, one lesson every two or three days. First the goddess and her great hymn, then Eleusis, honestly, then the festivals kept in Athenian homes and fields. Read the Homeric Hymn to Demeter in full once during this stage; it takes about forty minutes.',
      days: 10,
      lessons: [
        {
          id: 'demeter-who',
          title: 'Who Demeter is',
          summary: 'Her family, her names, her emblems, and how she sat in Greek life.',
          minutes: 6,
          sections: [
            {
              heading: 'The goddess of the grain',
              body: `Demeter is the goddess of cultivated grain: wheat and especially barley, the staple of ancient Greece. She is not the wild earth, which belonged to Gaia, but the ploughed field, the seed corn and the threshing floor. The poet Hesiod, around 700 BCE, tells farmers to “pray to Zeus of the Earth and to pure Demeter” as they start to plough, so that the grain grows full.

She was a daughter of Kronos and Rhea, one of the six children Kronos swallowed and Zeus rescued. She is sister to Zeus, Hades, Poseidon, Hera and Hestia. With Zeus she had Persephone, whom the Greeks often simply called Kore, “the Girl.” In art the two goddesses are so often shown together that inscriptions call them “the Two Goddesses” and leave it at that.`,
            },
            {
              heading: 'Her names',
              body: `Greek prayer calls a god by titles that name the power you need, and Demeter has many. Deo is a short, affectionate form of her name used in the hymn. Thesmophoros, “bringer of law” or “of the things laid down,” is her title at the Thesmophoria; settled farming was seen as the root of settled law. Karpophoros means fruit-bearer, Chloe “the green shoot,” and Kourotrophos “nurse of the young.” Anesidora, “she who sends up gifts,” describes the grain rising from below.

Some of her local titles are much darker. In Arcadia she was worshipped as Demeter Erinys, the Fury, and at Phigalia as Melaina, the Black Demeter, shown with a horse’s head and dressed in black for her grief and rage. Pausanias, the second-century travel writer, tells these stories. They are a reminder that the gentle harvest mother of greeting cards is only half of her.`,
            },
            {
              heading: 'Emblems, animals and plants',
              body: `Her emblems are the sheaf or ears of grain, the torch she carried while searching, the poppy that grows in grain fields, and the kalathos, a tall basket. The pig was her sacrificial animal: piglets were cheap, fertile and sacred to her, and initiates at Eleusis each brought one. Snakes, which live in the earth and the granary, appear with her and her daughter. Crane and turtledove are sometimes named too, but less clearly.

Her plants are wheat, barley and the poppy, and garden mint, because of the minty barley drink she asks for in the hymn. Her places are Eleusis, a town about twenty kilometres west of Athens; the Rharian plain beside it, where the first grain was said to be sown; and every threshing floor in Greece.`,
            },
            {
              heading: 'What she asks of people',
              body: `Demeter’s values are easy to see and hard to keep: work, gratitude, and care for those who depend on you. She brought settled farming and with it the possibility of a stable household and city. In return she asked for the first fruits of every harvest, a share of what you grew before you took your own.

She is also the goddess of a mother’s unbending love, and of what happens when the powerful ignore a grieving woman. In the hymn, the gods do not take her seriously until the earth stops giving food. Many people today come to her exactly here, in grief, in caring for children or parents, and in the slow, unglamorous work of keeping a family fed.`,
            },
          ],
          knowAndDont: {
            known:
              'Her family, her principal titles and her emblems are well attested in Hesiod, the Homeric Hymn, vase painting, inscriptions and Pausanias. The pig, the grain and the torch are everywhere in her cult. Her Roman counterpart Ceres shares most of her myth.',
            unknown:
              'The meaning of her name is uncertain: “De-” may mean earth, or a word for grain, or something else. Whether the dark Arcadian Demeter is an older form of the goddess or a local development is debated. Modern lists of her crystals and colours are modern.',
          },
          inPractice:
            'Hellenic polytheists often keep a small image or a few ears of grain for Demeter on the household shrine, and give her the first of new bread, new flour or the first fruits of a harvest. Choose two of her titles to use this month. Thesmophoros and Karpophoros are a good pair to begin with.',
          reflect: [
            'Which side of Demeter did you arrive knowing: the harvest mother or the grieving, furious one?',
            'Who depends on you for food or care? Who did you depend on?',
          ],
          further: [
            'Homeric Hymn to Demeter, trans. H. G. Evelyn-White (1914), free on Project Gutenberg',
            'Hesiod, Works and Days 465–469',
            'Pausanias, Description of Greece 8.25 and 8.42, on Demeter Erinys and Melaina',
            'Walter Burkert, Greek Religion (1985), section on Demeter',
          ],
          library: ['traditional/deity/demeter', 'traditional/deity/persephone', 'traditional/deity/ceres', 'traditional/herb/mint'],
        },
        {
          id: 'demeter-hymn',
          title: 'The Homeric Hymn: loss, search and return',
          summary: 'The story at the heart of her cult, scene by scene, and what it teaches about grief.',
          minutes: 8,
          sections: [
            {
              heading: 'The flower and the chariot',
              body: `The Homeric Hymn to Demeter is about five hundred lines long and was composed somewhere between 650 and 550 BCE. It opens with Persephone picking flowers in a meadow with the daughters of Ocean: roses, crocuses, violets, irises and hyacinths. Earth has grown a marvellous narcissus with a hundred blooms, “to be a snare for the bloom-like girl.” As she reaches for it, the ground opens and Hades rides out in his golden chariot and carries her off. Zeus had agreed to it. Her mother had not.

Only two beings hear her cry: Hekate in her cave and Helios the sun. Demeter hears the echo. She tears her veil and, as the hymn says, for nine days “queenly Deo wandered over the earth with flaming torches in her hands,” without eating, drinking or bathing. On the tenth day Hekate meets her, and the sun tells her the truth.`,
            },
            {
              heading: 'The old woman at the well',
              body: `Demeter does not go back to Olympus. She disguises herself as an old woman and sits by the Maiden Well at Eleusis, where the daughters of King Keleos find her and bring her home as a nurse for their baby brother Demophon. She will not sit on the fine couch. A servant woman called Iambe sets a plain stool with a fleece over it, and makes her laugh with jokes, the first time she has smiled since her daughter vanished. Offered red wine, she refuses and asks instead for barley meal mixed with water and soft mint. This drink is the kykeon.

At night Demeter secretly lays the baby in the fire to burn away his mortality. His mother Metaneira sees, screams, and breaks the spell. Demeter reveals herself in her full height and radiance, demands a temple, and promises to teach her rites. Then she sits in the temple and grieves, and for a whole year no seed comes up anywhere on earth.`,
            },
            {
              heading: 'The pomegranate and the thirds of the year',
              body: `Humanity is starving and the gods are getting no offerings, so Zeus finally sends Hermes to bring Persephone back. Hades lets her go, but first he “secretly gave her sweet pomegranate seed to eat.” Having eaten food of the underworld, she cannot leave it entirely. The agreement is that she will spend “a third part of the circling year” below, and two parts with her mother and the gods.

When mother and daughter meet, Demeter runs to her “as does a Maenad down some thick-wooded mountain.” Then the grain comes back, and Demeter teaches her rites to the leaders of Eleusis: Triptolemos, Eumolpos, Keleos and others. The hymn ends with the famous line about the Mysteries: “Happy is he among men upon earth who has seen these mysteries.”`,
            },
            {
              heading: 'What the story holds',
              body: `Many readers see a nature myth here, the grain dying and returning. That is part of it. But the hymn is just as much about grief: a mother who will not be comforted, who refuses the honours offered to her, who will not pretend things are fine. Iambe’s jokes, the stool and the barley drink are small human kindnesses that let her eat again, and they became parts of her ritual.

It is also a story about the limits of power. Zeus can give away a daughter, but he cannot make the corn grow. Demeter wins by withholding the one thing everyone needs. For people in grief, the hymn gives permission not to be fine on anyone else’s timetable. For people supporting the grieving, it suggests the gentle, ordinary things that help: a seat, a joke, a drink, a meal.`,
            },
          ],
          knowAndDont: {
            known:
              'The hymn survives in a single manuscript found in Moscow in 1777, with some gaps. Its plot, its Eleusinian setting and its references to the kykeon, the fast and the jesting match ritual details described by other ancient sources, so scholars agree it reflects Eleusinian cult.',
            unknown:
              'Its exact date and author are unknown. Which third of the year Persephone spends below is not stated: many scholars argue it was the dry Greek summer, when seed grain lay stored underground, rather than the northern European winter of modern retellings. Some lines are lost in the gaps of the manuscript.',
          },
          inPractice:
            'Read the hymn aloud over two or three evenings this week, by your lamp, with a small cup of barley water or plain water beside you. Ancient hymns were heard, not read silently. Many Hellenic polytheists read its opening and closing lines at every rite for the Two Goddesses.',
          reflect: [
            'Where in your life have you refused to be comforted, or needed someone to bring you a stool and a joke?',
            'Which line of the hymn will you carry this month?',
          ],
          further: [
            'Homeric Hymn to Demeter, trans. H. G. Evelyn-White (1914), Project Gutenberg #348',
            'Helene P. Foley (ed.), The Homeric Hymn to Demeter (1994), translation with essays',
          ],
          library: ['traditional/deity/demeter', 'traditional/deity/persephone', 'traditional/deity/hades', 'traditional/deity/hekate', 'traditional/herb/mint'],
        },
        {
          id: 'demeter-eleusis',
          title: 'Eleusis: what we know of a secret',
          summary: 'The Lesser and Greater Mysteries, the public parts of the festival, the hints the ancients let slip, and why the secret held.',
          minutes: 8,
          sections: [
            {
              heading: 'A thousand years of initiation',
              body: `The Mysteries of Eleusis were celebrated from at least the seventh century BCE until the end of the fourth century CE, when Christian emperors banned pagan cult and Alaric’s Goths sacked the sanctuary around 395 CE. Men and women, citizens, foreigners and enslaved people could all be initiated, as long as they spoke Greek and had no blood on their hands. The great Roman orator Cicero was initiated, and so were several emperors.

There were two stages. The Lesser Mysteries were held in early spring at Agrai, just outside Athens, as a preparation. The Greater Mysteries came in the autumn month of Boedromion, roughly September, and initiation into them made you a mystes. A further grade, epopteia, “having seen,” could be reached a year later.`,
            },
            {
              heading: 'The public days',
              body: `Much of the Greater Mysteries was public, and those days are fairly well described. On the 14th of Boedromion the sacred objects, the hiera, were carried in closed baskets from Eleusis to Athens. On the 15th the initiates gathered and the herald proclaimed who was excluded. On the 16th came the cry “To the sea, initiates!”, and each one bathed in the sea with a piglet, which was then sacrificed. Further sacrifices followed.

On the 19th thousands walked the Sacred Way from Athens to Eleusis, about twenty kilometres, carrying torches and myrtle and singing to Iakchos, a god of the procession. On the way, at a bridge, masked figures shouted jokes and insults at them, echoing Iambe. They arrived after dark and fasted, breaking the fast with the kykeon.`,
            },
            {
              heading: 'Inside the hall',
              body: `Then the initiates went into the Telesterion, a great square hall with tiers of steps and a small stone chamber, the Anaktoron, at its centre. Ancient writers say only that there were things done, things said and things shown: dromena, legomena and deiknymena. A burst of light is mentioned, and a sense of terror turning to joy. A Christian bishop, Hippolytus, writing in hostile mood centuries later, claimed that an ear of grain reaped in silence was shown. Clement of Alexandria preserved a password-like formula about fasting, drinking the kykeon and moving objects between a basket and a chest. Both may be garbled or deliberately insulting.

On the last day two special vessels were overturned, one to the east and one to the west, with the cry “hye, kye,” usually translated “rain, conceive.” And then people went home. What they took with them, by their own account, was hope. The hymn says the uninitiated have no share in “like good things” after death. Cicero, centuries later, wrote that the Mysteries taught people to live with joy and to die with better hope.`,
            },
            {
              heading: 'Why the secret held',
              body: `Revealing the Mysteries was a crime punishable by death. In 415 BCE the Athenian general Alkibiades was accused of mocking them at a private party, and it helped drive him into exile. The poet Aeschylus was said to have been accused of betraying them in a play. Tens of thousands of people over a thousand years kept the secret well enough that we still do not know it.

That should shape how we approach it now. When a modern book or group offers “the Eleusinian rite,” it is offering something new, perhaps beautiful, but new. The respectful course is to honour the public parts, the fast, the torches, the barley, the joking and the hope, and to leave the hall itself dark.`,
            },
          ],
          knowAndDont: {
            known:
              'The festival calendar, the procession, the bathing with piglets, the exclusion proclamation, the Telesterion’s architecture and the kykeon are attested by inscriptions, excavation and many ancient authors. The plemochoai and “hye, kye” are reported by Proclus and Hippolytus. The penalties for revealing the secret are well documented.',
            unknown:
              'What was said, done and shown in the Telesterion is unknown. Theories range from a sacred drama of Persephone’s return to a psychoactive kykeon made from ergot of barley; the ergot theory is popular but has no direct evidence. The Christian reports are late and hostile, and may not be accurate.',
          },
          inPractice:
            'Many Hellenic polytheists mark the Eleusinia in Boedromion with a fast during the day, a torch or candle procession around the house or neighbourhood, a meal that begins with barley water and mint, and readings from the hymn. They do not claim to perform the Mysteries. The app marks the Eleusinia in your calendar.',
          reflect: [
            'How do you feel about a religion whose central rite is unknowable? Does it frustrate you, or move you?',
            'What would “better hope” about life and death mean for you?',
          ],
          further: [
            'George E. Mylonas, Eleusis and the Eleusinian Mysteries (1961)',
            'Walter Burkert, Ancient Mystery Cults (1987)',
            'Michael B. Cosmopoulos, Bronze Age Eleusis and the Origins of the Eleusinian Mysteries (2015)',
          ],
          library: ['traditional/deity/demeter', 'traditional/deity/persephone', 'traditional/deity/dionysus'],
        },
        {
          id: 'demeter-festivals',
          title: 'Thesmophoria, Haloa and the farming year',
          summary: 'The women’s festivals of Demeter, the seasons of her worship, and how to keep them at home today.',
          minutes: 7,
          sections: [
            {
              heading: 'The Thesmophoria',
              body: `The Thesmophoria was the most widespread festival in the Greek world, kept in dozens of cities. In Athens it fell in the autumn month of Pyanepsion, around October, just before sowing, and it lasted three days. It was kept by married citizen women, and men were excluded. Aristophanes wrote a comedy, the Thesmophoriazusae, about a man who sneaks in disguised as a woman and is caught.

The first day was the Anodos, the “going up” to the sanctuary. The second was the Nesteia, the fast, when the women sat on the ground on mats of chaste-tree branches, mourning as Demeter mourned. There was joking and obscene banter, as Iambe joked. The third day was the Kalligeneia, “fair birth,” a feast for good offspring and good crops.`,
            },
            {
              heading: 'The pits and the piglets',
              body: `One custom of the Thesmophoria sounds strange now. Earlier in the year, piglets were thrown into underground pits called megara, along with dough models of snakes and other things. At the festival, women called “bailers” went down into the pits, brought up the rotted remains and laid them on the altars. People mixed them with the seed corn to make the next harvest fertile. Our main source for this is a later commentary on the satirist Lucian, so some details are uncertain.

This is a good example of chthonic, earth-facing ritual: something given down into the ground, left there, and returned only as fertility for the fields, not as food for people. It is also why modern devotees often bury an offering for Demeter in the autumn, or mix a little of it into the soil of a planter before sowing.`,
            },
            {
              heading: 'The Haloa and the Skira',
              body: `The Haloa was a winter festival at Eleusis in the month of Poseideon, around December, named after the threshing floor (halos). It honoured Demeter, Kore and Dionysus. Again women held their own feast, with food of every kind except a few forbidden things such as pomegranates and certain fish, cakes shaped like genitals, and much ribald joking, while officials of the cult urged them on. It celebrated fertility in the middle of winter, when the young grain was just coming up.

The Skira, at midsummer, was another women’s festival of Demeter and Persephone before threshing. Less is known about it. Together with the Thesmophoria and Haloa, it shows that Demeter’s year was largely in women’s hands, outside the great civic sacrifices that men ran.`,
            },
            {
              heading: 'Keeping them today',
              body: `Modern Hellenic polytheists keep these festivals in different ways. Some groups hold the Thesmophoria as a women’s rite, with all women welcome, including trans women; some open it to everyone; some solitary devotees keep it alone at home. No modern group can claim to do exactly what Athenian women did, because no complete description survives.

A simple home Thesmophoria looks like this: on the first day, clean and set up the shrine; on the second, fast from morning until evening if your health allows, sit on the floor for a while, and read the Iambe scene aloud; on the third, feast, give her a share of good bread, and bury a little grain or bread in a pot of soil. A home Haloa can be a cheerful midwinter meal with friends, with a toast to Demeter, Kore and Dionysus and permission to laugh loudly.`,
            },
          ],
          knowAndDont: {
            known:
              'The Thesmophoria’s three days, its exclusion of men, the fasting, the jesting and the chaste-tree mats are attested in Aristophanes, Plutarch and later scholars. The Haloa is described in a scholion on Lucian and mentioned by Demosthenes. Megara pits have been found at several Demeter sanctuaries.',
            unknown:
              'Much depends on the Lucian scholion, which is late and confusing about which piglets went into the pits and when. What the women said during their rites is not recorded. The Skira is very poorly understood. Modern inclusive practice is a modern choice.',
          },
          inPractice:
            'Mark the Thesmophoria and Haloa in the app calendar now and decide how you will keep each this year: alone or with others, with a fast or without. If you fast, do it only if you are well, and never if you are pregnant, diabetic, recovering from an eating disorder or advised against it. A simpler meal or a day without treats is a fine substitute.',
          reflect: [
            'What would it be like to keep a festival in which laughter and crude joking are sacred?',
            'What could you put into the earth this autumn, and leave there?',
          ],
          further: [
            'Aristophanes, Thesmophoriazusae (Women at the Thesmophoria)',
            'Allaire Chandor Brumfield, The Attic Festivals of Demeter and Their Relation to the Agricultural Year (1981)',
            'H. W. Parke, Festivals of the Athenians (1977)',
          ],
          library: ['traditional/deity/demeter', 'traditional/deity/persephone', 'traditional/deity/dionysus'],
          premade: ['green-seed-blessing-before-sowing', 'wicca-lammas-bread-offering'],
        },
      ],
      practices: [
        {
          id: 'demeter-study-hymn',
          title: 'Read the hymn aloud',
          instructions:
            'Over two or three evenings, read the whole Homeric Hymn to Demeter aloud by your lamp. Mark the places where the story became a ritual: the torches, the fast, the stool and fleece, the jokes, the barley drink.',
          times: 1,
          prompt: 'Which moment in the hymn moved you most, and why?',
        },
        {
          id: 'demeter-study-shrine',
          title: 'Set up her shrine',
          instructions:
            'After the fourth lesson, set up a small shrine in or near the kitchen. You need: a lamp or candle holder, a small dish for her portion, a cup for libations, and something of grain, such as a few ears of wheat, a small jar of barley or a sheaf of dried grass. Add an image of her or of the Two Goddesses if you have one, a poppy if you like, and seasonal produce. Keep it clean and refresh the produce before it spoils. If Persephone is also on your shrine, give her a place beside her mother.',
          times: 1,
          prompt: 'What did you choose for her shrine, and what did you leave off?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine days of first portions',
      intro:
        'Demeter searched for nine days before the truth came on the tenth. So this stage is nine days of a short daily practice at mealtimes, followed by a lesson on her offerings and her harder sides. Unlike the underworld gods, Demeter shares the table: her portion is hers, and the rest of the meal is yours.',
      days: 12,
      lessons: [
        {
          id: 'demeter-offerings',
          title: 'Offerings, the kykeon, and the hard parts',
          summary:
            'What to give Demeter and how, the safe way to honour the kykeon, the difference between her shared and buried offerings, and how to approach her in grief.',
          minutes: 7,
          sections: [
            {
              heading: 'First fruits and bloodless gifts',
              body: `The heart of Demeter’s worship was the aparche, the first fruits. Athens ordered every farmer in its territory to send a share of the barley and wheat harvest to Eleusis, and invited all Greeks to do the same. A share of the first loaf from new flour, the first apples of the year, the first produce from a balcony pot: these are the oldest kind of offering to her.

Other traditional offerings were bloodless: pelanos, a thick paste or cake of meal and honey; barley groats sprinkled over the altar; honey, milk and fruit; poppy-seed cakes; and wool. Animal sacrifice, especially of pigs, was central in antiquity, and nobody does it in modern home practice. Bread, barley, honey, milk, fruit and a little olive oil are all thoroughly traditional.`,
            },
            {
              heading: 'Shared and buried',
              body: `Greek religion distinguished, loosely, between gods of the sky and gods of the earth. Sky gods usually received burnt offerings, and the worshippers ate the rest of the meal. Earth gods often received offerings poured or placed into the ground, which nobody ate. Demeter stands with a foot in each. At the harvest and the family table, she shares the meal like an Olympian. At the Thesmophoria, in the pits and in her mourning, her gifts go down into the earth and stay there.

A good modern rule follows from this. Everyday offerings at the table are a share set aside; you eat the rest. Offerings for her grieving, earth-facing side, and anything you bury, are left and not eaten. Never eat what you have put on her dish, even an everyday portion: it goes to the soil or the compost the next day.`,
            },
            {
              heading: 'The kykeon, safely',
              body: `In the hymn Demeter asks for barley meal with water and soft mint, and initiates drank this kykeon to break their fast. The mint was probably glechon, pennyroyal. Pennyroyal is toxic: its oil has killed people, and even the tea is dangerous in pregnancy and for anyone with liver or kidney problems. Please do not recreate the ancient recipe.

A safe modern nod is barley water: simmer a handful of pearl barley in water for half an hour, strain, cool, and add a few leaves of ordinary garden mint and a little honey if you like. It is not the sacred drink of Eleusis and should not be called that. It is a drink Demeter asked for in her grief, and a kind thing to drink while reading her story.`,
            },
            {
              heading: 'Grief, rage and care',
              body: `People come to Demeter in grief, and that is right. But her grief in the hymn is fierce. She stops the world. Her Arcadian forms are Fury and Black Demeter. If you are grieving, you are allowed to bring her anger too, and she will not ask you to be gentle about it.

Two cautions. First, she is not a substitute for help. If grief is crushing you, or a child is in danger, or you are struggling to eat, talk to a doctor, a counsellor or a bereavement service; offering to Demeter can sit beside that, not instead of it. Second, she is often called simply “the Mother,” but not everyone is a mother or wants to be, and not every mother is good. Her care is for the young and the hungry of every kind. Feeding people, giving to a food bank, or supporting a local farm are offerings she has always understood.`,
            },
          ],
          knowAndDont: {
            known:
              'The Athenian first-fruits decree for Eleusis survives on an inscription of the fifth century BCE. Pelanos, barley groats, honey and piglets are well attested in her cult. The hymn describes the kykeon as barley, water and mint, and ancient medical writers record that glechon was pennyroyal.',
            unknown:
              'Exact recipes for her cakes are rarely preserved. How far ordinary households set aside a daily share for Demeter, as opposed to Hestia, is not clear; the daily table offering is a modern Hellenic practice built from ancient principles.',
          },
          inPractice:
            'This week, set aside the first bite of one meal a day for her. Once in the stage, make barley water with mint and drink it while reading the Iambe scene. Consider a small regular gift to a food bank as part of your devotion, and tell her about it at the shrine.',
          reflect: [
            'What would it mean to always give the first and best portion away?',
            'What grief, or what anger, would you bring to Demeter if you were honest?',
          ],
          further: [
            'Jon D. Mikalson, Ancient Greek Religion (2nd ed., 2010)',
            'Kevin Clinton, Myth and Cult: The Iconography of the Eleusinian Mysteries (1992)',
          ],
          library: ['traditional/deity/demeter', 'traditional/herb/mint', 'traditional/vessel/offering_bowl'],
          premade: ['folk-khernips-libation', 'kitchen-prosperity-bread', 'kitchen-family-meal-blessing'],
        },
      ],
      practices: [
        {
          id: 'demeter-nine-days',
          title: 'Nine days of the first portion',
          instructions:
            'For nine days, at one meal a day, do this. Wash your hands. Light the shrine lamp. Say a word to Hestia. Then set the first bite of your food, or a piece of bread, on Demeter’s dish and name one person whose work brought that food to you, or one thing you are grateful for or grieving today. Pour a few drops of water or milk. Eat your meal with attention. Put out the light afterwards, and in the morning return yesterday’s portion to the soil or compost.',
          times: 9,
          every: 'day',
          prompt: 'Whose work did I name today? What did I feel as I gave the first portion away?',
        },
        {
          id: 'demeter-practice-bake',
          title: 'Bake or buy a loaf for her',
          instructions:
            'Once in this stage, bake a simple loaf or barley cakes, or buy a good loaf from a local baker. Give her the first slice with a libation, then share the rest with someone if you can.',
          times: 1,
          premade: 'kitchen-prosperity-bread',
          prompt: 'How did it feel to make or choose bread as a gift rather than just as food?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'At the Maiden Well',
      intro: `Demeter sat by the well at Eleusis in disguise for a while before she showed who she was. Take a few days to sit with what this month has been. A dedication is a promise to keep showing up, so it is only worth making if you mean it.

Stopping here is a good outcome. So is pausing until the harvest comes round, or deciding that another goddess, another path, or no dedication at all is right for you. Demeter herself refused honours that did not fit her grief. You are allowed to refuse too.`,
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'demeter-discern-walk',
          title: 'Walk to where food grows',
          instructions:
            'Visit a field, allotment, community garden, farm shop or even a park with fruit trees. Stand there for a few minutes. Ask yourself whether you want Demeter as a lasting part of your life, or whether this month was enough. Notice what your body does when you imagine each answer.',
          times: 1,
          prompt: 'What did I feel standing where food grows? Which answer felt true?',
        },
      ],
      questions: [
        'Did I keep the nine days because I wanted to, or because I felt I should?',
        'Am I drawn to Demeter herself, or mainly to the idea of the Mysteries? Can I be content not knowing their secret?',
        'Can I keep a simple first-portion practice and her autumn festival, in my life as it is now, for a year?',
        'If I came to her in grief, is devotion helping me, or am I using it to avoid support I need?',
        'Do I understand which of my ideas about her are ancient, and which are modern, and am I at peace with that?',
        'Would I be relieved or disappointed if I chose to wait? What does that tell me?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication at the threshing floor',
      intro: `If you have chosen to go on, make your dedication on a day that suits her: the Noumenia, a harvest day, or the day you first bake for her. This is a self-dedication, a promise you make for yourself. It is not an initiation, and it does not make you a mystes of Eleusis or a priestess of anything. The Mysteries were the great initiation of Demeter, and nobody can give them now. Modern groups that hold their own Demeter rites have their own ways of welcoming people, and this does not replace them.

Ancient Greeks rarely dedicated themselves to one god alone. Your promise can sit beside honouring Persephone, Hestia and others.`,
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Demeter',
        summary:
          'A fast until evening, a procession of light through the house, purification, Hestia first, a prayer to Demeter by her titles, the first portion of a new loaf, your promise, a gift of grain into the earth, and a shared meal.',
        minutes: 60,
        ingredients: [
          { name: 'A bowl of fresh water and a match or bay sprig for khernips', ref: 'traditional/vessel/bowl' },
          { name: 'A lamp, tealight or electric candle, and a second one to carry' },
          { name: 'A fresh loaf, ideally one you baked' },
          { name: 'A small dish for her portion', ref: 'traditional/vessel/dish' },
          { name: 'A cup of barley water with garden mint, or milk with honey' },
          { name: 'A handful of barley or wheat grain' },
          { name: 'A pot of soil, a planter or a patch of garden' },
          { name: 'Your written promise on a card' },
          { name: 'A little frankincense on a heatproof burner', ref: 'traditional/herb/frankincense', optional: true },
        ],
        preparation:
          'If your health allows, eat lightly or fast during the day, as the women did at the Thesmophoria and the initiates before the kykeon; skip this if you are pregnant, diabetic, unwell or have a history of disordered eating. Make the barley water the day before. Write your promise in your own words: simple and doable, for example to give her the first portion of bread each week, to keep the Thesmophoria, to read her hymn each autumn, and to feed others when you can. Clean the shrine and the table.',
        steps: [
          {
            title: 'Carry the light',
            instructions:
              'At dusk, light the carrying candle or lamp and walk slowly through every room of your home, as Demeter walked the earth with torches looking for her daughter. Think of what you have been searching for this month. End at the shrine.',
            minutes: 3,
            light: true,
          },
          {
            title: 'Purify',
            instructions:
              'Make khernips by quenching the match in the water. Wash your hands and touch your face. Sprinkle a few drops over the bread and the grain.',
            spoken: 'With clean hands I come to the table of the Grain Mother.',
          },
          {
            title: 'Begin with Hestia',
            instructions: 'Light the shrine lamp from the carried flame. Pour a drop of the libation for Hestia.',
            spoken: 'Hestia, first and last, I begin with you.',
          },
          {
            title: 'Call Demeter',
            instructions:
              'Stand with your palms raised. Add incense if you are using it. Speak her titles slowly.',
            spoken:
              'Demeter, Deo, Thesmophoros, bringer of laws; Karpophoros, bearer of fruit; Kourotrophos, nurse of the young; bringer of seasons and giver of good gifts: hear me. This month I have read your story and set aside the first of my bread for you. Now I come to make a promise.',
            minutes: 2,
          },
          {
            title: 'Make your promise',
            instructions:
              'Read your promise aloud. Then break the loaf and set the first and best piece on her dish. Pour most of the libation beside it.',
            spoken: 'This is my promise, made freely. Let it grow like grain in good soil.',
          },
          {
            title: 'Give grain to the earth',
            instructions:
              'Take the handful of grain and press it into the pot of soil or the garden. This is for her earth-facing side, the side that grieves and waits underground; it is not coming back up as food for you. If it sprouts, let it.',
            spoken: 'Into the earth, for the Mother and the Maiden.',
          },
          {
            title: 'Break your fast',
            instructions:
              'Sit and drink a little barley water, as Demeter did at Eleusis, then eat bread from the loaf. If someone can share it with you, share it. Tell her one thing that made you laugh this month, for Iambe’s sake.',
            minutes: 7,
            timed: true,
          },
          {
            title: 'Close with Hestia',
            instructions: 'Pour the last drop for Hestia. Thank both goddesses and put out the lamp.',
            spoken: 'Hestia, last as you were first. Demeter, it is done.',
            snuff: true,
          },
        ],
        closing:
          'The next day, return her bread portion to the soil or compost. Keep your written promise on the shrine and read it at each Thesmophoria. Write in your journal what you promised and how it felt to break your fast at her table.',
        safety:
          'Never leave a flame unattended, and take care carrying a candle through the house: use a lamp or candle with a holder and a drip guard, keep it away from curtains and clothing, or use an electric candle. Fast only if you are well. Frankincense smoke can trouble people with asthma and small pets; use a little or skip it.',
      },
    },
    {
      kind: 'ongoing',
      title: 'The turning year',
      intro: `Your relationship with Demeter now lives in the year and in the kitchen. Give her the first of your bread, the first of new flour or fruit, and a word at the shrine. Keep her festivals: the Eleusinia and Thesmophoria in autumn, the Haloa in midwinter, the Skira at midsummer. If you follow the Wheel of the Year too, Lughnasadh and the autumn equinox are natural modern times to honour her.

Once a year, at the Thesmophoria or on the anniversary of your dedication, read your promise again and renew it, change it, or set it down with thanks. When life gets in the way, start again with one slice of bread. Demeter waited a whole year for the grain to return; she understands long gaps.`,
      days: 30,
      lessons: [],
      practices: [
        {
          id: 'demeter-ongoing-portion',
          title: 'Weekly first portion',
          instructions:
            'Once a week, at a meal, set aside the first bite or a piece of bread for Demeter with a word of thanks. Return it to the soil the next day.',
          times: 52,
          every: 'week',
          prompt: 'What did I harvest this week, in food or in work?',
        },
        {
          id: 'demeter-ongoing-noumenia',
          title: 'Greet the new month',
          instructions:
            'At each Noumenia, the first crescent, give incense and water to the household gods, including a little barley for Demeter, and ask a blessing on the month’s food and work.',
          times: 12,
          every: 'month',
          premade: 'folk-noumenia-blessing',
        },
        {
          id: 'demeter-ongoing-festivals',
          title: 'Keep her festivals',
          instructions:
            'Keep the Eleusinia, Thesmophoria and Haloa as the app calendar marks them, in the home versions from the lessons or with a group. At the Thesmophoria, bury a little grain or bread in soil.',
          times: 3,
          every: 'holy-day',
          prompt: 'What did this festival ask of me this year?',
        },
        {
          id: 'demeter-ongoing-rededicate',
          title: 'Yearly rededication',
          instructions:
            'At the Thesmophoria or on your dedication anniversary, repeat the dedication rite with your promise rewritten for the coming year.',
          times: 1,
          every: 'holy-day',
          prompt: 'What has a year with Demeter grown in me? What will I promise now?',
        },
      ],
    },
  ],
  sources: [
    'Homeric Hymn to Demeter, trans. H. G. Evelyn-White, Hesiod, the Homeric Hymns and Homerica (1914), Project Gutenberg #348: https://www.gutenberg.org/ebooks/348 (quoted: “to be a snare for the bloom-like girl”; “queenly Deo wandered over the earth with flaming torches in her hands”; “secretly gave her sweet pomegranate seed to eat”; “a third part of the circling year”; “as does a Maenad down some thick-wooded mountain”; “Happy is he among men upon earth who has seen these mysteries”; “like good things”; “bringer of seasons and giver of good gifts”)',
    'Hesiod, Works and Days 465–469, trans. H. G. Evelyn-White (1914), Project Gutenberg #348 (paraphrased: prayer to Zeus of the earth and pure Demeter at ploughing)',
    'Pausanias, Description of Greece 8.25 and 8.42 (Demeter Erinys and Melaina)',
    'Aristophanes, Thesmophoriazusae; scholion on Lucian, Dialogues of the Courtesans 2.1 and 7.4 (Thesmophoria and Haloa)',
    'Cicero, De Legibus 2.36 (paraphrased, on the Mysteries and better hope)',
    'Clement of Alexandria, Protrepticus 2.21; Hippolytus, Refutation of All Heresies 5.8; Proclus on the plemochoai',
    'IG I³ 78, the Athenian first-fruits decree for Eleusis',
    'George E. Mylonas, Eleusis and the Eleusinian Mysteries (1961); Walter Burkert, Greek Religion (1985) and Ancient Mystery Cults (1987)',
    'Helene P. Foley (ed.), The Homeric Hymn to Demeter (1994)',
    'H. W. Parke, Festivals of the Athenians (1977); Allaire Chandor Brumfield, The Attic Festivals of Demeter (1981)',
  ],
};
