import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-epona',
  kind: 'deity',
  paths: ['celtic', 'roman'],
  deityRef: 'traditional/deity/epona',
  title: 'Epona: The Horse Goddess',
  summary:
    'A month with Epona, the Gaulish goddess of horses, mules and donkeys who rode with the Roman cavalry from Britain to the Danube: her images and inscriptions, her stable shrines garlanded with roses, her feast on 18 December, and a self-dedication made through real care for animals.',
  welcome:
    'This journey takes about a lunar month. You will read five lessons, set up a small shrine in the old stable style, keep nine days of offering and practical care for animals, and decide whether to dedicate yourself to Epona.\n\nIt is a self-dedication, not an initiation, and it does not make you a member of any group or order. Epona is one of the best-attested goddesses of the Celtic world: hundreds of carvings and dozens of inscriptions survive. But not a single myth about her does. This journey is honest about both. You do not need to own or ride a horse to honour her. You can pause whenever you need to.',
  about:
    'Epona is a goddess of horses, mules and donkeys from Gaul, roughly modern France, Belgium and the Rhineland. Her name is Gaulish: epos, “horse”, with the ending -ona often used for divine names, so “the horse goddess” or “she of the horses”. Between the first and fourth centuries AD she was carved, painted and named in inscriptions across the Roman Empire, from the Antonine Wall in Scotland to the Danube, North Africa and Rome itself, where the emperor’s horse guards made dedications to her. She is usually shown seated sideways on a mare, sometimes with a foal, or enthroned between two horses or ponies, often holding a dish, a cornucopia, a basket of fruit or grain, or a key. Her images stood in niches in stables, where the Roman writer Apuleius describes one “garnished and decked round about with faire and fresh roses”, and a Roman calendar from northern Italy gives her a feast on 18 December. She was a goddess of the working animals that carried an empire, of the grooms and soldiers who cared for them, and of plenty. No story of her survives. Celtic and Roman polytheists honour her today, as do many horse people, with oats, apples, water, roses and, above all, good care of animals.',
  notes: [
    'Epona is honoured through real care for animals. Never put a horse, or any animal, at risk for a ritual, and never feed someone else’s animal without asking its owner.',
    'No myths of Epona survive. Stories you may read about her, including identifying her with the Welsh Rhiannon or the Irish Macha, are modern or scholarly interpretation, not ancient tradition. This journey flags them as such.',
    'The Uffington White Horse in Oxfordshire is a Bronze Age figure about 3,000 years old. It is often linked with Epona online, but there is no evidence for that.',
    'Her known feast, 18 December, falls during the Roman Saturnalia, and the app lists it with that festival. Her cult was Gallo-Roman: Gaulish in origin, spread and recorded by the Roman army and empire. Both Celtic and Roman polytheists honour her, in different styles.',
    'If you work with real horses, safety comes first: approach from the side where they can see you, never stand directly behind them, and wear proper footwear and a helmet when riding.',
  ],
  holyDays: ['saturnalia'],
  stages: [
    {
      kind: 'threshold',
      title: 'At the stable door',
      intro:
        'Begin by making a place for Epona the way Romans and Gauls did: a small image in a niche, decked with flowers, near where animals are kept or where you set out on journeys. Then introduce yourself to her with grain, water and an honest word.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'epona-shrine',
          title: 'Set up a stable-style shrine',
          instructions:
            'Choose a small shelf, a windowsill or an alcove, ideally near your front door, where you keep pet things or where you set out each day. Her ancient shrines were small niches in stables, so a little space is right. Put in a horse figure or picture: a statue, a postcard, a child’s toy horse, a print of one of her ancient carvings. Add a small dish for grain (oats are ideal), a cup of fresh water, and a candle in a safe holder on a heatproof dish, or a battery candle if pets are around. Add something of plenty: a few apples, an ear of wheat, a small horn or basket. Fresh roses or a garland of greenery, as in Apuleius’s stable, finish it. If you keep animals, a photo of them, or a clean old horseshoe, collar tag or brush, belongs here too.',
          times: 1,
          prompt: 'What did you put in her shrine, and which animals is it for?',
        },
      ],
      rite: {
        title: 'Introduction to Epona',
        summary:
          'Garland her image, offer oats and water, introduce yourself and the animals in your life, and promise one act of care.',
        minutes: 20,
        ingredients: [
          { name: 'A white or brown candle in a safe holder, or a battery candle', ref: 'traditional/candle/white' },
          { name: 'A horse image or figure' },
          { name: 'A small dish of rolled oats', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A cup of fresh water' },
          { name: 'A rose, or a little garland of greenery', ref: 'traditional/herb/rose' },
          { name: 'An apple', optional: true },
        ],
        preparation:
          'Wash your hands. Fill the cup with fresh, cold water. Think of the animals in your life, past and present: pets, a horse you once rode, a working dog, a donkey on a holiday beach, the animals that carried your food. Decide on one small, practical act of care you will do for an animal this week.',
        steps: [
          {
            title: 'Garland her image',
            instructions:
              'Lay the rose or garland around or before the horse image, as stable grooms did in Roman times.',
            spoken: 'Epona, lady of horses, I deck your image with flowers.',
          },
          {
            title: 'Light the lamp',
            instructions: 'Light the candle, or switch on the battery candle.',
            spoken: 'I light this lamp for Epona, who keeps the stable and the road.',
            light: true,
          },
          {
            title: 'Offer grain and water',
            instructions:
              'Set the dish of oats and the cup of water before her. Add the apple if you have one.',
            spoken: 'Here are oats and clean water, the food of your horses, freely given.',
          },
          {
            title: 'Say who you are',
            instructions:
              'Tell her your name and why you have come. Then name the animals you are thinking of, one by one, living and dead, and say a word about each.',
          },
          {
            title: 'Promise one act of care',
            instructions:
              'Tell her the one practical thing you will do for an animal this week: a walk, a vet appointment kept, a donation to a rescue, fresh water put out for birds.',
            spoken: 'This I will do in your name, Epona.',
          },
          {
            title: 'Sit with her',
            instructions:
              'Sit quietly. Imagine the warm, grassy smell of a clean stable at night, and a lamp in a niche. Notice what you feel.',
            minutes: 5,
          },
          {
            title: 'Close',
            instructions: 'Thank her and snuff the candle.',
            spoken: 'Epona, thank you. Keep the animals in my care, and keep me on the road.',
            snuff: true,
          },
        ],
        closing:
          'Leave the offerings overnight. In the morning, scatter a small amount of the oats for birds, and pour the water onto a plant or the earth. Keep the rose until it fades, then compost it. Do the act of care you promised.',
        safety:
          'Keep the candle on a heatproof dish away from flowers and paper, and use a battery candle if cats, dogs or other pets could knock it over. Lilies are dangerous to cats; use roses or greenery instead. Never put an animal near the flame, and do not feed oats or apples to someone else’s horse without asking.',
      },
    },
    {
      kind: 'study',
      title: 'Learning who she is',
      intro:
        'Four lessons on Epona: her name, images and homeland; how the Roman army carried her across the empire; her stable shrines, roses and feast day; and how she is honoured today. Read one every day or two.',
      days: 8,
      lessons: [
        {
          id: 'epona-who',
          title: 'The horse goddess: name, images and homeland',
          summary: 'What “Epona” means, how she was pictured, where her monuments are found, and why we have images but no stories.',
          minutes: 7,
          sections: [
            {
              heading: 'Her name',
              body:
                'Epona’s name is one of the few Gaulish words most people can learn at once. Gaulish epos means “horse”, from the same ancient root as Latin equus and Old Irish ech. The ending -ona appears in many Celtic divine names, such as Sirona and Matrona, and probably marks a goddess or a divine power. So Epona is “the horse goddess”, “the divine horse” or “she of the horses”.\n\nThat is all the name tells us, and it is a lot. She is the goddess of the animal that mattered most to the Gauls after cattle: for war, for travel, for farm work, for wealth and status. Mules and donkeys belonged to her too, and her worshippers included muleteers and carters as well as cavalrymen.',
            },
            {
              heading: 'How she was pictured',
              body:
                'More than three hundred images of Epona are known, most of them small stone reliefs and statuettes. There are two main types. In the first, she rides a mare, sitting sideways with both feet on one side, calm and upright, sometimes with a foal beneath the mare or walking beside her. This type is most common in Gaul itself. In the second, she sits enthroned between two horses or ponies, or among several, who turn towards her. This type is more common along the Rhine and the Danube frontier.\n\nShe often holds something. A patera, the shallow dish used for pouring offerings. A cornucopia, the horn of plenty. A basket or lap full of fruit, grain or bread, sometimes being fed to the horses. In some carvings she holds a key, which may stand for the stable door, or for something more, such as the gate of the otherworld; no one knows. She is never shown as a horse herself. She is a woman, a mistress of horses.',
            },
            {
              heading: 'Where she is found',
              body:
                'Her heartland was eastern Gaul: Burgundy, Lorraine, the Moselle valley and the Rhineland, where her images are most common. At Alesia, the hillfort in Burgundy where Caesar defeated Vercingetorix, many have been found. From there her cult spread with the Roman army and the traffic of the roads, along the Rhine and Danube frontiers, into Britain, Italy and as far as North Africa.\n\nInscriptions call her Epona Augusta, linking her to the emperor, and Epona Regina, “queen”. Some address her with the Mothers, the Matres or Matronae, goddesses of plenty and family widely worshipped in the same regions. Her images turn up in stables, at roadside shrines, at springs and, in a few cases, in graves.',
            },
            {
              heading: 'Images but no stories',
              body:
                'Here is the honest gap. For all those carvings, not one myth of Epona survives. The only story connected to her name is a strange late Greek tale, preserved in a collection attributed to Plutarch, saying she was born of a man and a mare. Most scholars treat it as a learned curiosity rather than a Gaulish myth.\n\nSo we know a great deal about how people pictured her, where they put her, what they called her and who worshipped her, and almost nothing about what they believed she did beyond keeping their animals and giving plenty. Anything more, such as a role guiding the dead or granting sovereignty, is interpretation built on the images, on comparison with other goddesses, and on modern experience. That does not make it worthless. It makes it modern, and it is worth saying so.',
            },
          ],
          knowAndDont: {
            known:
              'The name comes from Gaulish epos, “horse”. Several hundred images and dozens of inscriptions survive, mostly from the first to fourth centuries AD, showing her riding sidesaddle or enthroned between horses with dish, cornucopia, fruit, grain or key. Her heartland was eastern Gaul and the Rhineland. Inscriptions call her Augusta and Regina.',
            unknown:
              'No myth survives. We do not know what her worshippers believed about her beyond what the images show, how she was worshipped before Roman times, what the key means, or whether she had a role with the dead. The Pseudo-Plutarch birth story is late and of doubtful value.',
          },
          inPractice:
            'Devotees often keep a copy of one of her ancient images, such as a photograph of a relief or statuette from a museum collection, rather than a modern fantasy picture. Many address her as Epona Regina, and some honour the Matronae alongside her.',
          reflect: [
            'Which of her two images draws you more: riding the mare, or enthroned among the horses? What does that tell you?',
            'How do you feel about honouring a goddess whose stories are lost? Is that freeing or difficult?',
          ],
          further: [
            'Katheryn M. Linduff, “Epona: A Celt among the Romans”, Latomus 38 (1979).',
            'Miranda Green, Celtic Goddesses: Warriors, Virgins and Mothers (1995).',
            'Epona.net, a scholarly resource cataloguing her inscriptions and images.',
          ],
          library: ['traditional/deity/epona', 'traditional/deity/rhiannon'],
        },
        {
          id: 'epona-cavalry',
          title: 'Riding with the legions: Epona and the Roman army',
          summary: 'How the cavalry carried her across the empire, her dedications in Britain and Rome, and what Romans wrote about her.',
          minutes: 7,
          sections: [
            {
              heading: 'The cavalry goddess',
              body:
                'Rome’s armies relied on cavalry raised in Gaul, Germany and other Celtic regions. These auxiliary horsemen took their goddess with them. Epona became the goddess of the cavalry, of the army’s mules and baggage trains, and of the grooms, farriers and veterinarians who kept them going.\n\nThat is how a regional Gaulish goddess came to be honoured on the edge of the empire. Soldiers set up altars to her at forts, kept her image in the stables and swore by her. When they retired, they took her home or settled with her near the frontier.',
            },
            {
              heading: 'In Britain and in Rome',
              body:
                'The most northerly dedication to Epona comes from Auchendavy, a fort on the Antonine Wall in central Scotland. A centurion of the Second Legion, Marcus Cocceius Firmus, set up an altar there in the second century AD to a group of gods including Mars, Minerva, Hercules, Victory and Epona. It is now in the Hunterian Museum in Glasgow. A handful of other images and dedications are known from Roman Britain.\n\nIn Rome itself, the equites singulares Augusti, the emperor’s mounted bodyguard, recruited largely from the Rhineland and Pannonia, made a series of dedications in the 130s AD to their gods, Epona among them. She is one of very few Celtic deities known to have been worshipped in the city of Rome.',
            },
            {
              heading: 'What Romans wrote',
              body:
                'Roman writers mention her rarely, and not always kindly. The satirist Juvenal, around 120 AD, mocks a Roman aristocrat so obsessed with horses that he swears only by Epona and the gods painted on stinking stable walls. The joke tells us two things: that Romans knew her as the stable goddess, and that her images were painted in stables.\n\nApuleius, in the second-century novel known as The Golden Ass, gives the most vivid picture. His hero, turned into a donkey, is shut in a stable. In William Adlington’s Tudor translation, he spies “in the middle of a pillar sustaining the rafters of the stable the image of the goddesse Hippone, which was garnished and decked round about with faire and fresh roses.” (Adlington’s “Hippone” is his rendering of Epona.) Hoping the roses will turn him back into a man, he tries to eat them, and is beaten for spoiling the images of the gods.',
            },
            {
              heading: 'Christian mockery',
              body:
                'Early Christian writers also knew her. Tertullian and Minucius Felix, around 200 AD, jeered that pagans worshipped beasts of burden along with Epona, turning back on them the slander that Christians worshipped a donkey. It is a hostile witness, but it shows that she was familiar enough, as far away as Carthage, to be a byword.\n\nPut together, these sources show a goddess who was everywhere in the ordinary working world: in stables, on roads, at forts, in the oaths of horse-mad young men. She was not a grand civic goddess with a temple on the Capitol. She was a goddess of daily work and the animals that did it.',
            },
          ],
          knowAndDont: {
            known:
              'Dedications by cavalry, legionaries and the equites singulares Augusti survive from Britain, the Rhine and Danube frontiers and Rome. The Auchendavy altar names her with Mars, Minerva, Hercules and Victory. Juvenal (Satire 8) and Apuleius (Metamorphoses 3.27) mention her images in stables. Tertullian and Minucius Felix mock her worship.',
            unknown:
              'We do not know what rites the soldiers performed for her, or whether her army cult differed much from her worship in Gaul. The meaning of her link with the emperor (Augusta) is debated.',
          },
          inPractice:
            'Many devotees honour her as the patron of anyone who cares for animals professionally, such as vets, farriers, grooms, rescue workers and police and military horse handlers, and pray for them. Some keep a small image in a car or a tack room as soldiers kept her in the stables.',
          reflect: [
            'Who does the unseen work of caring for animals in your world: vets, farmers, rescue volunteers? How might you honour them?',
            'Epona travelled with people far from home. Where in your life do you need a goddess who comes with you?',
          ],
          further: [
            'Apuleius, The Golden Ass, trans. William Adlington (1566), book 3 (public domain, Project Gutenberg).',
            'Juvenal, Satire 8, trans. G. G. Ramsay (Loeb, 1918) (public domain).',
            'Michael P. Speidel, Riding for Caesar: The Roman Emperors’ Horse Guards (1994).',
          ],
          library: ['traditional/deity/epona', 'traditional/deity/mars', 'traditional/deity/minerva'],
        },
        {
          id: 'epona-stable',
          title: 'Roses in the stable: shrines, offerings and the 18 December feast',
          summary: 'What her shrines looked like, what was offered, her one known feast day, and the debated idea that she guided the dead.',
          minutes: 7,
          sections: [
            {
              heading: 'Shrines in the stable',
              body:
                'Most of Epona’s worship was small and domestic. Her images were set in niches or on pillars in stables, as Apuleius describes, or painted on stable walls, as Juvenal mocks. Many surviving reliefs are small enough to sit in a niche, and some have holes or ledges for fixing them in place. Grooms and carters would pass them every day.\n\nShe also had grander sites. Gallo-Roman sanctuaries at springs and on roads in Gaul included her among their gods, and her images have been found at healing springs and crossroads. But the basic unit of her cult was a stable with a goddess in it, and that is easy to reproduce today.',
            },
            {
              heading: 'Flowers and plenty',
              body:
                'Apuleius tells us her image was decked with fresh roses. Other evidence suggests garlands and flowers were common, as they were for many Roman household gods. Her own images show what she gives: grain, fruit, bread and plenty, held in her lap or her horn, sometimes being fed to her horses.\n\nIt is reasonable, and in the spirit of the sources, to offer her the things she holds and the things her animals need: oats, barley, apples, bread, fresh water, roses and garlands. Roman practice also offered incense and wine to most gods, and Roman polytheists today often do so for her. There is no record of animal sacrifice to her, and her devotees today would think it wrong.',
            },
            {
              heading: 'The feast on 18 December',
              body:
                'A rustic calendar carved in stone, found at Guidizzolo near Mantua in northern Italy, lists a feast of Epona on the fifteenth day before the Kalends of January, that is, 18 December. It is our only ancient feast date for her. It may have been a local custom, and we know nothing about how it was kept.\n\nIt falls during the Saturnalia, the week of feasting that began on 17 December, when even slaves were given time off. Some modern devotees link the two, imagining working animals rested and given extra food in her honour at the dead of the year. That is a lovely idea, and a modern one. Roman polytheists keep 18 December as her day with roses, garlands and a feast for the animals; Celtic polytheists often keep it too.',
            },
            {
              heading: 'Did she guide the dead?',
              body:
                'A few images of Epona come from graves, and horses were widely linked with journeys to the otherworld in the ancient world. On this basis some scholars have suggested that she guided the dead on their last journey, as she guarded the living on the road. The key she holds in some images is sometimes read as a key to the otherworld.\n\nThis is a theory, not a fact. The grave finds are few, and the key could as easily be a stable key. Many modern devotees do pray to her for animals who have died, and for safe passage for their own dead; that is a sincere and gentle practice. Just be clear that it is a modern reading of the evidence.',
            },
          ],
          knowAndDont: {
            known:
              'Apuleius describes her image in a stable decked with roses. Juvenal mentions painted stable images. The Guidizzolo calendar gives a feast of Epona on 18 December. Her iconography shows fruit, grain, bread, dish and cornucopia. Some images come from shrines at springs and from graves.',
            unknown:
              'We do not know how her feast was kept, whether it was observed widely, or what offerings were usual. The idea that she guided the dead rests on a few grave finds and comparison; the meaning of her key is unknown. The link between her feast and the Saturnalia is a modern one.',
          },
          inPractice:
            'Many devotees keep 18 December with roses or evergreen garlands, a feast of oats and apples for animals, a donation to an animal charity, and prayers for animals who have died that year. Some keep a small stable-niche shrine all year.',
          reflect: [
            'What would a feast for the animals in your life look like on 18 December?',
            'How do you want to remember animals you have loved and lost?',
          ],
          further: [
            'Apuleius, The Golden Ass, book 3 (public domain).',
            'Gian Luca Gregori and Ilaria Melmeluzzi, on the Guidizzolo calendar and the cult of Epona (2021).',
            'Simone Deyts, Images des dieux de la Gaule (1992).',
          ],
          library: ['traditional/deity/epona', 'traditional/herb/rose'],
          premade: ['hedge-letting-go-of-the-dead'],
        },
        {
          id: 'epona-today',
          title: 'Honouring Epona today: care as worship',
          summary: 'Who honours her now, how practical animal care works as devotion, where Celtic and Roman styles differ, and what to be wary of.',
          minutes: 7,
          sections: [
            {
              heading: 'Who honours her',
              body:
                'Epona is honoured by Gaulish and Celtic polytheists, who see her as a Gaulish goddess and may address her in reconstructed Gaulish; by Roman polytheists, who honour her as a goddess of the Roman army and stable, often with Roman ritual forms; by Druids and Wheel of the Year Pagans; and by many horse riders, grooms and animal lovers with no fixed tradition at all.\n\nA Roman-style devotee might offer incense, wine and garlands, cover their head with a fold of cloth while praying, and keep 18 December. A Celtic-style devotee might offer oats, water and apples at a stable, and keep the old Celtic quarter days alongside her feast. Both forms are rooted in real evidence, since she belonged to both worlds.',
            },
            {
              heading: 'Care as worship',
              body:
                'The heart of a modern devotion to Epona is practical. The best offering is good care of animals, done well and in her name. Groom a horse properly. Muck out a stable. Volunteer at a horse or donkey sanctuary. Walk dogs at a shelter. Donate to a charity that protects working animals in poorer countries, where mules, donkeys and horses still carry loads and people’s livelihoods. Keep your own pets healthy, exercised and kindly treated.\n\nIf you ride or keep horses, your daily work with them can become devotion: a word to her as you open the stable, a moment of thanks as you check hooves and water. Many horse people already do something like this without calling it religion.',
            },
            {
              heading: 'Safe passage on the road',
              body:
                'Epona was a goddess of travel as well as stables, because horses and mules were how people travelled. Many devotees ask her for safe journeys today, by car, bus, bike or on foot, and keep a small horse image or a horseshoe charm in the car or on a keyring.\n\nThat is a natural extension of her role, and it fits the evidence of roadside shrines. Back it up with the practical side: rest when you are tired, check your tyres, give horses on the road room and slow down for them. Epona of all goddesses would want you to pass a horse wide and slow.',
            },
            {
              heading: 'What to be wary of',
              body:
                'Be wary of books and websites that tell you her myths. There are none. Identifications with Rhiannon, who rides an uncatchable horse in the Welsh Mabinogi, and with Macha, who races horses in an Irish tale, are comparisons made by modern scholars and Pagans, interesting but not evidence that they are one goddess. Be wary too of claims that she is the goddess of the Uffington White Horse, or that she had a festival on any date besides 18 December.\n\nAbove all, never let ritual put an animal at risk. Do not take a horse to a fire, or a crowded ritual, or feed it unfamiliar things. Do not release animals or leave food that harms wildlife. If there is a choice between a beautiful rite and an animal’s welfare, the animal wins every time. That is what she is for.',
            },
          ],
          knowAndDont: {
            known:
              'Celtic, Gaulish and Roman polytheists, Druids, Pagans and horse people honour Epona today. Her ancient worship took place in stables, at roadside shrines and at forts, among soldiers, grooms and carters. Both Gaulish and Roman ritual forms are attested for her in different contexts.',
            unknown:
              'There is no ancient record of individual devotion to her in the modern sense, no prayer to her survives, and the modern emphasis on animal welfare as worship is a sincere development rather than an ancient rule.',
          },
          inPractice:
            'A typical devotee keeps a small horse image in a niche with roses or greenery, offers oats, apples and water weekly, volunteers or gives to an animal charity, asks her for safe journeys, and keeps 18 December as her feast.',
          reflect: [
            'Which practical act of animal care could you commit to for a year?',
            'Do you feel more at home with a Roman or a Celtic style of honouring her, or a mix? Why?',
          ],
          further: [
            'The Brooke and The Donkey Sanctuary publish information on working animal welfare worldwide.',
            'Miranda Aldhouse-Green, Dictionary of Celtic Myth and Legend (1992), s.v. Epona.',
          ],
          library: ['traditional/deity/epona', 'traditional/crystal/moss_agate', 'traditional/crystal/red_jasper'],
          premade: ['sea-safe-passage-blessing', 'folk-iron-threshold'],
        },
      ],
      practices: [
        {
          id: 'epona-study-water',
          title: 'Fresh water before reading',
          instructions:
            'Before each lesson, change the water in her cup for fresh, cold water and say, “Epona, keep the stable and the road.” Afterwards, give some fresh water to a living thing: a pet, a houseplant, the birds.',
          times: 4,
          every: 'day',
          prompt: 'What did you learn about her today?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine days in the stable',
      intro:
        'Now you put what you have learned into practice. For nine days you will make a small offering at her shrine and do one act of practical care for an animal. Start with the lesson on offerings, safety and the shape of a rite.',
      days: 10,
      lessons: [
        {
          id: 'epona-offerings',
          title: 'Oats, apples and water: offerings, safety and the shape of a rite',
          summary: 'What to give Epona and how, how to feed real animals safely, a simple rite in Celtic or Roman style, and keeping her shrine.',
          minutes: 7,
          sections: [
            {
              heading: 'What to offer',
              body:
                'Her own images tell you: grain, fruit, bread, and the horn of plenty. Oats and barley are the classic horse grains. Apples, carrots and pears are what horse people still give as treats. Fresh, clean water is the most important thing any animal needs, and many devotees treat it as her first offering. Roses and garlands come straight from Apuleius.\n\nIn Roman style, add a little incense (frankincense is the classic Roman choice) and a splash of wine poured from a dish. In Celtic style, a little milk, mead or ale. And as always, care for animals counts as an offering: an hour volunteering or a donation to a rescue is worth more than a bag of oats on a shelf.',
            },
            {
              heading: 'Feeding real animals safely',
              body:
                'If you want to give oats or apples to a real horse, ask the owner first, every time. Some horses have laminitis, metabolic problems or allergies, and a well-meant treat can make them seriously ill. Cut apples and carrots lengthways into slices, never in round chunks that can choke a horse. Offer treats on a flat palm, fingers together.\n\nNever feed horses grass clippings, which can cause colic, and never give them yew, ragwort, acorns, privet or garden waste, all of which can be toxic. For pets at home, keep grapes and raisins, chocolate, onion, garlic and lilies away from dogs and cats; lilies are deadly to cats, even their pollen. If you put grain out for birds, keep it small and clean so it does not attract rats.',
            },
            {
              heading: 'How to offer',
              body:
                'Set the offering before her image and say what it is and who it is for. Lift the water cup or dish briefly before setting it down. In Roman style, you might pray with a fold of cloth or a scarf drawn over the back of your head, as Romans did, and speak her name and titles clearly: Epona Augusta, Epona Regina. In Celtic style, you might simply speak to her plainly, as to a respected lady of the house.\n\nLeave food offerings overnight, or for a day. Then scatter grain thinly for birds, compost fruit, and pour water onto plants or the earth. Never leave food offerings in a field where horses graze; you do not know what they can eat.',
            },
            {
              heading: 'The shape of a simple rite',
              body:
                'A rite for Epona has five parts. First, prepare: wash your hands and change her water. Second, garland her image with a flower or greenery and light her lamp. Third, offer: grain, fruit, water, and incense or wine if you follow a Roman style. Fourth, pray: name the animals in your care, any that are ill, and any journeys ahead, and ask her to keep them. Fifth, promise and close: name one act of care you will do, thank her and snuff the lamp.\n\nOn 18 December you can expand this: deck her shrine with roses or evergreens, give the animals in your life a special meal (safe for them), donate to an animal charity, and remember animals who have died during the year.',
            },
            {
              heading: 'Keeping her shrine',
              body:
                'Keep her shrine clean and fresh, the way a good stable is kept. Change the water daily if you can, or at least weekly. Replace flowers before they rot. Throw out grain that has gone stale or been visited by insects. A dirty stable is a sign of a poor groom, and a dirty shrine says the same.\n\nAdd things over time: a photo of a horse you rode as a child, a pet’s old collar, a horseshoe from a farrier, a stone from a bridleway. Let it become a record of the animals who have mattered to you.',
            },
          ],
          knowAndDont: {
            known:
              'Her images show grain, fruit and cornucopia; Apuleius describes roses. Roman ritual generally used incense, wine and garlands, and prayer with the head covered. The feeding and toxicity advice follows current veterinary guidance.',
            unknown:
              'No source tells us exactly what was offered to Epona. The five-part rite, daily water and weekly offerings are modern practice in the spirit of the evidence.',
          },
          inPractice:
            'Many devotees keep a daily water offering and a weekly grain or fruit offering, pray for the animals in their care, and give time or money to animal welfare in her name.',
          reflect: [
            'Which offering feels most like her to you: grain, fruit, water, flowers or work?',
            'Which animals will you name in your prayers this week?',
          ],
          further: [
            'British Horse Society advice on feeding treats and poisonous plants.',
            'Jörg Rüpke, The Religion of the Romans (2007), on household and stable cult.',
          ],
          library: ['traditional/deity/epona', 'traditional/herb/frankincense', 'traditional/herb/rose'],
          premade: ['folk-lararium-offering'],
        },
      ],
      practices: [
        {
          id: 'epona-nine-days',
          title: 'Nine days of offering and care',
          instructions:
            'For nine days, change her water, light her lamp, and offer a small dish of oats or a slice of apple. Say: “Epona, lady of horses, keep the animals and keep the road.” Name any animals you are thinking of. Then do one practical act of care for an animal that day: walk or groom your own animal, put out fresh water for birds, spend time at a stable or sanctuary, give to an animal charity, or learn something about animal welfare. Write it down. Snuff the lamp. Scatter the oats thinly for birds or compost the apple the next day. On one of the nine days, give at least an hour of real work to animals if you can.',
          times: 9,
          every: 'day',
          prompt: 'What did you offer, and what did you do for an animal today?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Taking stock in the stable',
      intro:
        'Before any dedication, look back over the month. A dedication to Epona is a promise to care for animals and to honour her in daily work. Stopping, waiting, or choosing another goddess or path are all good outcomes; the stable door will stay open.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'epona-discern',
          title: 'Visit animals',
          instructions:
            'Visit a stable, a farm park, a donkey sanctuary, a riding school or simply a field with horses in it, and watch them for a while from a safe place without disturbing them. Think through the questions below. Write your answers when you get home.',
          times: 1,
          prompt: 'Your honest answers to the discernment questions.',
        },
      ],
      questions: [
        'Did you manage an act of care most days? What does that tell you about the promise you might make?',
        'Are you drawn to Epona herself, or mainly to horses? Both are good; only one needs a dedication.',
        'Can you honour a goddess with no surviving stories, building your relationship from images, inscriptions and practice?',
        'Are you more at home with a Celtic or a Roman way of honouring her, and does that matter to you?',
        'Can you keep a small, regular devotion and 18 December without it becoming a burden?',
        'Is another deity or path calling you more strongly? Choosing them, or pausing, is a good and honest outcome.',
      ],
    },
    {
      kind: 'dedication',
      title: 'Dedication at the stable door',
      intro:
        'If you choose to go on, this is a self-dedication to Epona, made before her in your own words. It is not an initiation into any group, order or tradition, and it does not replace one where they have their own. Her feast on 18 December is the fitting time, but any day you are ready will do.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Epona',
        summary:
          'Garland her image with roses, offer grain, fruit and water, name the animals you will care for, make your promise and go out to do it.',
        minutes: 40,
        ingredients: [
          { name: 'A white, brown or gold candle in a safe holder, or a battery candle', ref: 'traditional/candle/white' },
          { name: 'Her image, garlanded with roses or evergreens', ref: 'traditional/herb/rose' },
          { name: 'A dish of oats or barley', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Apples or pears, sliced' },
          { name: 'A cup of fresh water' },
          { name: 'Frankincense and a little wine, for a Roman-style rite', ref: 'traditional/herb/frankincense', optional: true },
          { name: 'A scarf or fold of cloth to cover your head, for a Roman-style rite', optional: true },
          { name: 'Your written promise' },
        ],
        preparation:
          'Write your promise over several days: how you will honour her (daily water, a weekly offering, 18 December each year), which animals you will care for, and one larger act of care for the year ahead, such as regular volunteering or a monthly donation. Make it a year’s promise. On the day, clean her shrine thoroughly, as if mucking out a stable. Wash your hands and face. Garland her image.',
        steps: [
          {
            title: 'Open the stable door',
            instructions:
              'Stand before the shrine. If you are following a Roman style, draw the fold of cloth over the back of your head.',
            spoken: 'Epona, Epona Regina, lady of horses, mules and donkeys, I come to you of my own free will.',
          },
          {
            title: 'Light the lamp',
            instructions: 'Light the candle. If you use incense, light a little frankincense now.',
            spoken: 'I light this lamp for you, who keeps the stable and the road.',
            light: true,
          },
          {
            title: 'Make the offering',
            instructions:
              'Set the oats, apples and water before her image. If you use wine, pour a little from a dish into a bowl before her.',
            spoken: 'Here are grain, fruit and clean water, the gifts in your own hands, given back to you.',
          },
          {
            title: 'Name the animals',
            instructions:
              'Name each animal in your care, and any you have loved and lost. Ask her to keep the living and to carry the dead gently.',
          },
          {
            title: 'Make your promise',
            instructions:
              'Read your promise aloud. Say plainly that this is a self-dedication, made in good faith, and that you will keep it as best you can.',
            spoken: 'This is my word, given before your image. I will care for the animals in my keeping and honour you in my work.',
          },
          {
            title: 'Sit in the stable',
            instructions:
              'Sit quietly with the lamp. Imagine a warm stable at night, horses shifting and breathing, a lamp in a niche with roses around it, and yourself as one of those who keeps it.',
            minutes: 10,
          },
          {
            title: 'Close',
            instructions: 'Thank her and snuff the candle and incense.',
            spoken: 'Epona, thank you. I go out to tend and to travel well.',
            snuff: true,
          },
        ],
        closing:
          'Leave the offerings for a day. Scatter the grain thinly for birds, compost the fruit, and give the water to a plant. Within three days, do the first act of care in your promise.',
        safety:
          'Keep the candle and incense on a heatproof dish away from the garland, and never leave them unattended. Use a battery candle and skip incense if pets, especially birds, share the room, since smoke harms their lungs. Keep lilies, grapes, chocolate, onion and garlic away from pets, and pour wine away from them and from children.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the stable',
      intro:
        'The relationship lives in daily care. Here is a rhythm: fresh water and a word, a weekly offering, monthly work for animals, her feast on 18 December, and a yearly renewal.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'epona-weekly',
          title: 'Weekly offering',
          instructions:
            'Once a week, clean her shrine, change the water, light her lamp, and offer oats or fruit. Name the animals in your care and any journeys ahead.',
          times: 52,
          every: 'week',
          prompt: 'How are the animals in your care?',
        },
        {
          id: 'epona-monthly-care',
          title: 'Monthly work for animals',
          instructions:
            'Once a month, give time or money to animal welfare in her name: volunteer at a sanctuary or shelter, donate to a working-animal charity, or help a neighbour with their animals.',
          times: 12,
          every: 'month',
          prompt: 'What did you do for animals this month?',
        },
        {
          id: 'epona-feast',
          title: 'Her feast on 18 December',
          instructions:
            'On 18 December, deck her shrine with roses or evergreens, give the animals in your life a special (safe) meal, remember animals who have died this year, and make a donation to an animal charity.',
          times: 1,
          every: 'holy-day',
          prompt: 'Which animals did you remember and celebrate?',
        },
        {
          id: 'epona-renew',
          title: 'Yearly renewal',
          instructions:
            'On 18 December or the anniversary of your dedication, read your promise. Say honestly what you kept. Make a new promise for the next year, or release the old one with thanks.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did you do for animals this year?',
        },
      ],
    },
  ],
  sources: [
    'Apuleius, The Golden Asse, trans. William Adlington (1566), book 3, Project Gutenberg: https://www.gutenberg.org/ebooks/1666 (quoted: “in the middle of a pillar sustaining the rafters of the stable the image of the goddesse Hippone, which was garnished and decked round about with faire and fresh roses”).',
    'Juvenal, Satire 8, lines 155–157, on swearing by Epona and the painted stable gods (paraphrased).',
    'Epona.net, a scholarly catalogue of her inscriptions and images, including the Auchendavy altar, the equites singulares dedications and the Guidizzolo calendar: https://epona.net/inscriptions.html',
    'G. L. Gregori and I. Melmeluzzi, on the Guidizzolo calendar and the feast of Epona (Sapienza University of Rome, 2021): https://iris.uniroma1.it/handle/11573/1608806',
    'Katheryn M. Linduff, “Epona: A Celt among the Romans”, Latomus 38 (1979).',
    'Miranda Green, Celtic Goddesses (1995).',
    'Michael P. Speidel, Riding for Caesar (1994).',
  ],
};
