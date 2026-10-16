import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-thor',
  kind: 'deity',
  paths: ['norse'],
  deityRef: 'traditional/deity/thor',
  title: 'Thor, Friend of the Folk',
  summary:
    'A lunar month with the thunderer: the hammer that hallows and defends, the god farmers and fishermen trusted most, and how to honour him with ale, bread and real acts of protection.',
  welcome: `This journey spends about a month with Thor: his stories, his hammer, the way he was worshipped by ordinary people, and how Heathens keep faith with him today. You will set up a shrine, learn the hammer sign, keep nine nights of offering and service, and decide at the end whether to dedicate yourself to him.

It is a self-dedication, not an initiation, and it does not replace the rites of any Heathen group you may later join. Thor is famously approachable. You do not need to be strong, male, Scandinavian or brave to come to him. You do need to be willing to stand up for someone.`,
  about: `Thor (Old Norse Þórr, Old English Þunor, Old High German Donar) is the Norse god of thunder, the strongest of the Æsir and the defender of gods and people against the giants. He rides a chariot drawn by two goats, wields the hammer Mjölnir, and is married to golden-haired Sif. In the Viking Age he was probably the most widely worshipped god in Scandinavia and Iceland: his name is the most common god-name in personal names (Thorstein, Thorgerd, Thorkell), he stood at the centre of the Uppsala temple, and people wore small hammer pendants by the thousand. He was the god of farmers, fishermen and travellers, called on for rain, good weather, safe voyages and the hallowing of weddings and graves. Today Heathens honour him with ale and bread, wear his hammer as a sign of faith and protection, and make the hammer sign over food and rites. His stories are rowdy and often funny, but at their heart he is a protector who shows up.`,
  notes: [
    'The Thor of the sources is very different from the Marvel character, and more interesting. This journey works from the Eddas, the sagas and archaeology.',
    'Thor’s hammer is a mainstream religious symbol, approved in 2013 as an emblem of belief on US veterans’ headstones. A few hate groups also use it, usually alongside other symbols. Wearing it is not a statement of politics; the company you keep is.',
    'This app is inclusive. Heathen groups that make the gods a matter of race are not the tradition this journey teaches. Thor protected thralls and farmers’ children; he did not check anyone’s ancestry.',
    'Thor’s protection is protection, not domination. If you are drawn to him because of anger, that is honest, and his stories show anger turning to settlement as often as to violence. Rites here are devotional and defensive only.',
    'In a thunderstorm, honour him from indoors. Do not go out under trees or onto open ground to “meet” the storm.',
  ],
  holyDays: ['midsummer', 'haustblot', 'vetrnaetur', 'jol', 'thorrablot'],
  stages: [
    {
      kind: 'threshold',
      title: 'The Hammer Raised',
      intro:
        'Thor’s hammer hallows as well as strikes: it blessed brides, revived goats and consecrated a funeral pyre. These first days are about making a place for him and greeting him plainly, as farmers did.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'thor-shrine',
          title: 'Set up a shrine',
          instructions: `Pick a sturdy surface: a shelf, a side table, a windowsill facing the weather. Lay down a plain or red cloth. Add a cup, mug or horn for ale, a small plate or bowl for bread, and one candle in a holder (red, brown or gold are common modern choices).

For an image, a hammer is best: a pendant laid flat, a small carved or printed Mjölnir, or a picture of the Viking Age amulets. Oak leaves or an acorn, a sprig of rowan, a goat image or a stone from somewhere you walked all suit him. Many Heathens keep a working tool on Thor’s shrine, a hammer or a wrench, as a sign that work is part of worship.

Keep it practical and clean. Thor is not fussy, but a shrine left dusty with old bread on it is not a welcome.`,
          times: 1,
          prompt: 'What did you put on the shrine? Is there anything on it you use with your hands?',
        },
        {
          id: 'thor-hammer-sign',
          title: 'Learn the hammer sign',
          instructions: `The sagas tell of people making the sign of Thor’s hammer over a drinking horn. Modern Heathens trace it with the right hand or a fist: a downward stroke, then a short crossbar at the bottom (an upside-down T, like the amulets) or at the top. Some knock the table once. Practise it over your meal each day for three days, with a short word: “Thor hallow this.”`,
          times: 3,
          every: 'day',
          prompt: 'How did it feel to bless ordinary food? Did anyone notice?',
        },
      ],
      rite: {
        title: 'Greeting the Thunderer',
        summary:
          'A short, hearty welcome: hallow the room with the hammer sign, call Thor by name, share ale and bread, and tell him who you are and why you have come.',
        minutes: 20,
        ingredients: [
          { name: 'A cup or horn of ale, beer, mead or apple juice' },
          { name: 'A piece of hearty bread, oatcake or a bannock' },
          { name: 'A candle in a safe holder', ref: 'traditional/candle/red', optional: true },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A sprig of oak or rowan', ref: 'traditional/herb/oak', optional: true },
        ],
        preparation:
          'Wash your hands and face. Clear and wipe the shrine. Pour the ale into the cup, put the bread in the bowl, and set the sprig beside them. Stand with your feet planted.',
        steps: [
          {
            title: 'Hallow with the hammer',
            instructions:
              'Light the candle. Face each direction in turn, starting north, and make the hammer sign toward it. Then make it once over the shrine.',
            spoken: 'Hammer, hallow this place. Hammer, hold it. Let nothing that means harm cross here.',
            light: true,
          },
          {
            title: 'Call him',
            instructions: 'Raise the cup. Call plainly and warmly; Thor is the god you can speak to like a neighbour.',
            spoken:
              'Thor, son of Earth, Odin’s son, driver of the goats, friend of farmers and seafarers. Hlórriði, Véurr, warder of the holy places. I bring you ale and bread. Hear me.',
          },
          {
            title: 'Say who you are',
            instructions:
              'Tell him your name, what you do with your days, who you look after, and why you have come to him. Be plain. If you are frightened of something, say so.',
            minutes: 5,
          },
          {
            title: 'Share the meal',
            instructions:
              'Make the hammer sign over the cup and bread. Drink a sip and eat a bite. Then put the cup back with most of the ale still in it.',
            spoken: 'I share this with you. Hail Thor!',
          },
          {
            title: 'Stand a while',
            instructions:
              'Stand or sit for a few minutes. Listen to the room, the weather outside, your own heartbeat.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Thank him. Snuff the candle. Later the same day, take the ale and bread outside and give them to the earth, at the foot of an oak if one is near.',
            spoken: 'Thank you, Thor. I will come back with more.',
            snuff: true,
          },
        ],
        closing: 'Write down what you said. Note the weather, as Heathens often do on Thor’s days.',
        safety:
          'Do not leave a candle burning unattended, and keep it clear of curtains and pets. If you cannot pour outside, pour the drink down the sink with thanks; do not pour alcohol into houseplants. Take food offerings away the same day so they do not attract pests, and keep grapes, raisins, onion and garlic (common in hearty food) away from dogs and cats.',
      },
    },
    {
      kind: 'study',
      title: 'Tales from the Road',
      intro:
        'Twelve days with the sources: who Thor is, the great stories of his journeys against the giants, and the remarkable evidence of how ordinary people worshipped him.',
      days: 12,
      lessons: [
        {
          id: 'thor-who',
          title: 'The Strongest of Gods and Men',
          summary: 'Thor’s family, names, treasures and character, and why he was the god of the many.',
          minutes: 6,
          sections: [
            {
              heading: 'Thunder across the north',
              body: `Thor’s name simply means thunder. The same god appears as Þunor among the Anglo-Saxons, giving us Thursday (Þunresdæg), and as Donar among the continental Germans, who gave German Donnerstag. Roman writers equated him with Hercules, the strong club-bearer, and later with Jupiter, the sky god of thunder. Place names from Torslunda in Sweden to Thundersley in Essex mark where people worshipped him.

Snorri introduces him like this, in Rasmus Anderson’s 1880 translation of the Prose Edda: “He is the strongest of all gods and men, and rules over the realm which is called Thrudvang. His hall is called Bilskirner.” Bilskírnir, the lightning-flash hall, has five hundred and forty rooms, the largest house ever built.`,
            },
            {
              heading: 'His household and his gear',
              body: `Thor is the son of Odin and of Jörð, the Earth herself, a giantess. His wife is Sif, whose golden hair Loki once cut off; the dwarves made her new hair of real gold. His sons are Magni (Strength) and Móði (Courage), and his daughter is Þrúðr (Might). Two farm children, Þjálfi and his sister Röskva, travel with him as servants.

He drives a chariot pulled by two goats, Tanngnjóstr and Tanngrisnir (Teeth-grinder and Teeth-barer); the rumble of its wheels is thunder. His three treasures, Snorri says, are the hammer Mjölnir, “which the frost-giants and mountain-giants well know when it is raised,” the belt Megingjörð that doubles his strength, and iron gloves to grip the hammer’s short haft. Mjölnir was forged by the dwarves Brokkr and Eitri; its handle is short because Loki, as a fly, bit Brokkr’s eyelid during the forging.`,
            },
            {
              heading: 'Names you can call him',
              body: `Heathens address him by several heiti (poetic names). Ása-Þórr, Thor of the Æsir. Ökuþórr, Driving-Thor, for his chariot. Hlórriði, often read as the Loud Rider. Vingþórr, perhaps Hallowing-Thor or Swinging-Thor. Véurr, the warder of the holy places, a name that sums up his role in cult. Ragnarök poems call him Midgard’s warder, the protector of the human world, and the Midgard Serpent’s bane.`,
            },
            {
              heading: 'The god of the thralls',
              body: `In Hárbarðsljóð, Odin, in disguise as a ferryman, taunts Thor: “The noble who fall in the fight hath Othin, / And Thor hath the race of the thralls” (Henry Adams Bellows’ 1923 translation). It is meant as an insult. Heathens have long heard it as praise. Odin takes the kings and heroes; Thor takes everyone else.

That is the Thor of ordinary faith: the god of farmers who needed rain, of fishermen who needed calm seas, of travellers, households and the people with the least power. He is quick to anger and quick to forgive, eats and drinks enormously, is not clever, and keeps his word. When he is wronged he raises the hammer, and then, as often as not, accepts a settlement. He is the most trusting of the gods, and the one who comes when he is called.`,
            },
          ],
          knowAndDont: {
            known:
              'Thor is attested across the Germanic world in place names, weekday names and Roman and Christian accounts. Snorri and the Eddic poems give his family, goats, hammer, belt and gloves in detail. Thor- names are the most common theophoric names in Viking Age Scandinavia and Iceland.',
            unknown:
              'Much of the family detail comes mainly from Snorri, though skaldic kennings also know Þrúðr and Þjálfi. The meanings of names such as Vingþórr and Hlórriði are uncertain. How closely continental Donar and Anglo-Saxon Þunor matched Norse Thor is not known; we have very few of their stories.',
          },
          inPractice:
            'Many Heathens greet Thor when they hear thunder, with a raised cup or simply a “Hail Thor!”, and keep Thursday for him with a short offering or an act of service.',
          reflect: [
            'Thor is the god of the thralls. Who in your life has the least power, and what do they need from you?',
            'Thor is quick to anger and quick to settle. Which of those do you find harder?',
          ],
          further: [
            'Gylfaginning ch. 21 and Hárbarðsljóð, in Rasmus B. Anderson, The Younger Edda (1880), and Henry Adams Bellows, The Poetic Edda (1923), both public domain.',
            'John Lindow, Norse Mythology: A Guide (2001), on Thor.',
          ],
          library: ['traditional/deity/thor', 'traditional/deity/odin', 'traditional/deity/loki'],
        },
        {
          id: 'thor-myths',
          title: 'Hammer, Goats and Giants',
          summary: 'The great Thor stories, from the stolen hammer to the fishing trip, and what they teach about strength.',
          minutes: 7,
          sections: [
            {
              heading: 'The theft of the hammer',
              body: `In Þrymskviða, Thor wakes to find Mjölnir gone. The giant Þrymr has hidden it eight miles underground and will return it only if Freyja marries him. Freyja refuses so furiously that her necklace bursts. So Thor, grumbling that the gods will call him unmanly, is dressed as the bride, veiled, with keys at his belt, and Loki goes along as his maid. At the wedding feast the “bride” eats an ox, eight salmon and all the women’s dainties, and drinks three casks of mead; Loki explains that Freyja has not eaten for eight nights out of longing.

Then the giant calls for the hammer to bless the marriage: “Bring in the hammer to hallow the bride; / On the maiden’s knees let Mjollnir lie” (Bellows, stanza 30). Thor’s heart laughs in his breast, he takes it up, and the wedding party ends badly for the giants. It is a comic poem, but it tells us something real: the hammer was laid in a bride’s lap to hallow a marriage.`,
            },
            {
              heading: 'The goats and the farmer’s son',
              body: `Snorri tells how Thor, travelling with Loki, stayed the night with a poor farmer. He killed his goats for supper, invited the household to share, and told them to throw the bones onto the goatskins. The farmer’s son Þjálfi split a thigh bone for the marrow. In the morning Thor, in Anderson’s translation, “took the hammer Mjolner, lifted it and hallowed the goat-skins. Then the goats arose, but one of them limped on one of its hind legs.”

Thor’s rage was terrible to see. The family begged for mercy. And Thor, seeing their fear, calmed down and took the two children, Þjálfi and Röskva, into his service as settlement. They were with him ever after. The hammer that kills giants also brings the dead back to life, and Thor’s fury is followed by a deal.`,
            },
            {
              heading: 'Fishing for the World Serpent',
              body: `In Hymiskviða and in Snorri, Thor goes fishing with the giant Hymir, baits his hook with an ox head, and hooks Jörmungandr, the serpent that circles the world. He braces so hard his feet go through the bottom of the boat, and is about to strike when the terrified giant cuts the line. This story was clearly popular: it is carved on the Altuna runestone in Sweden, the Hørdum stone in Denmark and the Gosforth fishing stone in Cumbria, England, all from around the 900s to 1000s.

Thor also wrestles an old woman who turns out to be Old Age, tries to drain a horn whose end is in the sea, and lifts a cat that is really the World Serpent, all at the hall of Útgarða-Loki, a giant who tricks him with illusions. He loses every contest and still does better than anyone thought possible. Strength, in these stories, includes losing and coming back.`,
            },
            {
              heading: 'At the end',
              body: `At Ragnarök, the Völuspá says, Thor meets the World Serpent at last. He kills it, walks nine steps, and falls dead from its venom. His sons inherit his hammer in the world that rises afterwards.

He dies protecting the world, knowing the fight will kill him. Heathens often take this as the core of his example: you defend what needs defending, not because you are sure of winning, but because it needs doing and you are the one there.`,
            },
          ],
          knowAndDont: {
            known:
              'Þrymskviða, Hymiskviða, Hárbarðsljóð and Völuspá are in the Poetic Edda; the goats and Útgarða-Loki tales are in Snorri’s Gylfaginning. The fishing story is carved on at least four stones from the Viking Age, so it predates Christian writing.',
            unknown:
              'Þrymskviða may be a late, deliberately comic poem, perhaps even from the 1200s; scholars disagree. We do not know whether hammers were really laid in brides’ laps at weddings, though the detail fits the amulets and the hallowing role. Útgarða-Loki is a different figure from Loki, despite the name.',
          },
          inPractice:
            'Some Heathens include a hammer blessing in handfastings and weddings, laying a hammer on the couple’s joined hands or in the bride’s lap, and hallow new homes or graves with the hammer sign, following the stories.',
          reflect: [
            'Thor loses every contest at Útgarða-Loki’s hall and still impresses everyone. When have you lost well?',
            'What in your life needs defending even if you are not sure you will win?',
          ],
          further: [
            'Þrymskviða and Hymiskviða in Bellows (1923).',
            'Gylfaginning ch. 44–48 in Anderson (1880) or Faulkes, Edda (Everyman).',
          ],
          library: ['traditional/deity/thor', 'traditional/deity/freyja', 'traditional/deity/loki'],
        },
        {
          id: 'thor-worship',
          title: 'Amulets, Oaks and Four Loaves a Day',
          summary: 'The evidence for how Thor was worshipped, from hammer pendants and high-seat pillars to the great temple at Uppsala.',
          minutes: 7,
          sections: [
            {
              heading: 'The hammers people wore',
              body: `More than a thousand Thor’s hammer pendants survive from the Viking world, from Iceland to Russia, most from the 900s and 1000s. They are made of silver, bronze, iron and amber, some plain, some with eyes and beards on the head. Many were found in women’s graves. Older still are the iron rings hung with tiny hammers, found in hundreds in eastern Sweden from the 700s on, often laid with cremations.

The pendants became common at just the time Christian crosses were spreading north, and a soapstone mould from Trendgården in Denmark has spaces to cast both a cross and a hammer side by side. It looks as though wearing the hammer became a way of saying “I keep the old faith,” and also, perhaps, a way of hedging bets. The Kvinneby amulet, a small copper plate from Öland in the 1000s, has a runic prayer for protection asking Thor to guard its owner with his hammer.`,
            },
            {
              heading: 'In the temples and the halls',
              body: `Adam of Bremen describes the great temple at Uppsala in the 1070s with Thor in the central seat, between Odin and Freyr. Thor, he says, rules the air, the thunder and lightning, the winds and rains, fair weather and crops, and the people sacrificed to him in times of plague and famine.

Icelandic settlers brought him with them. Landnámabók tells of Þórólfr Mostrarskegg, who threw his high-seat pillars, carved with Thor, overboard off Iceland and settled where they washed up, calling the place Þórsnes. Another settler, Helgi the Lean, is remembered as a man of mixed faith, who believed in Christ but called on Thor for sea voyages and hard matters. In Gudbrandsdal in Norway, Snorri’s Saga of Olaf the Saint has a farmer’s son describe their god to the Christian king: “he bore the likeness of Thor; had a hammer in his hand… and every day he receives four cakes of bread, besides meat” (Laing’s translation). It is a hostile story about destroying that image, but its detail about daily bread offerings rings true.`,
            },
            {
              heading: 'Oaks and the hammer sign',
              body: `On the continent, Donar was worshipped at sacred oaks. In 723 the missionary Boniface cut down a great oak at Geismar in Hesse, known as Jupiter’s (that is, Donar’s) oak, and built a chapel from its wood. In the north, Snorri says the rowan was called Thor’s rescue, because Thor saved himself from a flooding river by grabbing a rowan bush.

At the feast at Hlaðir, Earl Sigurd covered for the Christian king who made the cross over his horn by telling the farmers he “is blessing the full goblet in the name of Thor, by making the sign of his hammer over it before he drinks it” (Laing’s translation of the Saga of Hákon the Good). However garbled, the story shows that a hand-gesture blessing in Thor’s name was something everyone recognised.`,
            },
            {
              heading: 'Runestones and graves',
              body: `Several Danish and Swedish runestones end with the words “Þórr vígi,” “may Thor hallow,” sometimes carved with a hammer: the Glavendrup stone on Funen, from the 900s, and the Virring stone are examples. They ask Thor to bless the stone and the grave and keep them safe from desecration. A Christian stone of the same age would ask God to help the soul.

The picture is of a god in daily use: worn at the neck, carved on the pillars, fed with bread, called on for weather and the sea, asked to guard the dead.`,
            },
          ],
          knowAndDont: {
            known:
              'The hammer pendants, hammer rings, the Trendgården mould, the Kvinneby amulet and the “Þórr vígi” runestones are archaeological finds. Adam of Bremen, Landnámabók and Heimskringla describe Thor’s worship, and Willibald’s Life of Boniface records the felling of the oak at Geismar.',
            unknown:
              'Adam never saw Uppsala himself. Landnámabók and the sagas were written in the 1100s–1200s and some stories, like the Gudbrandsdal idol, are conversion tales shaped to show Christianity’s victory. The Kvinneby amulet’s reading is debated. Whether the hammer amulet was really a response to the cross is a scholarly theory, though a widely held one.',
          },
          inPractice:
            'Heathens today make or buy a hammer pendant, hallow it at a blót and wear it daily. Some carve “Thor hallow” in runes on things they want protected, or mark their door with the hammer sign when they move in.',
          reflect: [
            'If you wore a sign of your faith every day, what would you want it to say to others? To you?',
            'The old farmers gave Thor bread every day. What small daily offering could you keep?',
          ],
          further: [
            'Saga of Hákon the Good ch. 18 and Saga of Olaf Haraldson, in Samuel Laing’s Heimskringla (1844), public domain.',
            'Neil Price, Children of Ash and Elm: A History of the Vikings (2020), on amulets and everyday religion.',
            'Hermann Pálsson and Paul Edwards, trans., The Book of Settlements: Landnámabók (1972).',
          ],
          library: ['traditional/deity/thor', 'traditional/herb/oak', 'traditional/herb/rowan', 'traditional/crystal/amber'],
          premade: ['folk-rowan-red-thread', 'folk-iron-threshold'],
        },
      ],
      practices: [
        {
          id: 'thor-weather',
          title: 'Watch the weather',
          instructions:
            'Each day, step outside or open a window for a minute and notice the sky, the wind and the temperature. When it rains or thunders, greet Thor. Farmers who prayed to him lived by the weather; let it teach you.',
          times: 12,
          every: 'day',
          prompt: 'What was the weather today, and how did it change what you did?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine Nights of Holding Fast',
      intro:
        'Thor walks nine steps at the end. In this stage you learn how he is honoured today and which days and offerings are his, and keep nine nights of offering paired with nine acts of protection or service.',
      days: 9,
      lessons: [
        {
          id: 'thor-today',
          title: 'Protector of the People Today',
          summary: 'How modern Heathens honour Thor, what his protection means in practice, and the hammer’s place among symbols that get misused.',
          minutes: 6,
          sections: [
            {
              heading: 'A god for the hall and the kitchen',
              body: `In modern Heathenry, Thor is often the first god people approach and the one most often hailed at public blót. Iceland’s Ásatrúarfélagið, The Troth and countless small kindreds call on him to hallow their rites. His hammer is the most common Heathen symbol, worn the way a Christian wears a cross.

His worship is practical. People pour ale to him at blót, eat with him in mind, make the hammer sign over meals, ask him for safety on the road and in storms, and dedicate physical work to him: building, repairing, lifting, cooking for a crowd. Many Heathens who work in trades, emergency services, care work or the military feel close to him.`,
            },
            {
              heading: 'What protection means',
              body: `Thor fights the giants because they threaten Midgard, the human world, and Asgard, the gods’ home. He does not go out to conquer. In the stories he protects travellers, farmers’ children and the household he is staying in, and he makes settlements when he could destroy.

So devotion to Thor asks something of you. Stand between someone vulnerable and the thing that would hurt them, in whatever way you safely can: speaking up when someone is harassed, helping a neighbour, volunteering, checking on the person who lives alone. Protecting your household includes protecting it from yourself: keeping your temper, keeping your word, not using strength to frighten people who depend on you. The god who settles with the frightened farmer is a model for that.`,
            },
            {
              heading: 'The hammer and the people who misuse it',
              body: `Some white-supremacist groups use Norse imagery, and the hammer sometimes appears in their insignia, usually combined with other symbols or slogans. On its own the hammer is not a hate symbol; hate-symbol databases say so explicitly, and in 2013 it was approved as an emblem of belief for US military headstones. Symbols more often adopted by racist groups include Othala with “wings” or feet, the Wolfsangel, double sowilo runes (the SS lightning bolts) and the so-called black sun.

Inclusive Heathens have spent decades reclaiming the hammer, and many groups say so openly: in 2016 well over a hundred groups signed Declaration 127, refusing to associate with a large folkish organisation over its racial policies. This app stands with them. Thor’s protection is for anyone who asks. If a group you meet treats his hammer as a badge of race, leave.`,
            },
            {
              heading: 'Hallowing in daily life',
              body: `The simplest Thor practice is the hammer sign. Make it over your food before a meal. Make it over your threshold when you move house, over a car before a long drive, over a gift before you give it, over a newborn’s cot. Say “Thor hallow” or “Hammer, hold this safe.”

The runestones that end “Þórr vígi” are a lovely model. Some Heathens write the words in runes on a slip of paper and tuck it above a door or into a wallet. It costs nothing and keeps him in mind every day.`,
            },
          ],
          knowAndDont: {
            known:
              'Thor is central in modern Heathen organisations and the hammer is the most widely used Heathen emblem. The US Department of Veterans Affairs added Mjölnir to its emblems of belief in 2013. Hate-symbol databases document racist use of Norse symbols and the importance of context.',
            unknown:
              'Modern ideas of Thor as patron of particular professions, and the ethics drawn from his stories, are interpretations, not old doctrine. The sources give little direct teaching on what Thor asked of worshippers beyond offerings.',
          },
          inPractice:
            'A common devotional pairing: a small offering of ale or bread on Thursday, and one act of practical protection or service in the same week, dedicated to him.',
          reflect: [
            'Who could you protect this week, in a way that is safe for you?',
            'Is there a way your strength frightens someone who depends on you? What would settlement look like?',
          ],
          further: [
            'Mattias Gardell, Gods of the Blood: The Pagan Revival and White Separatism (2003), for the history of racist misuse.',
            'The Troth, Our Troth, vol. 1 (2006), on Thor and the other gods.',
          ],
          library: ['traditional/deity/thor', 'traditional/crystal/hematite', 'traditional/herb/nettle'],
          premade: ['folk-simple-blot', 'kitchen-threshold-salt-blessing'],
        },
        {
          id: 'thor-days',
          title: 'Thursdays, Thunder and Hearty Offerings',
          summary: 'Thor’s days in the week and the year, what to give him, how to give it, and what to avoid.',
          minutes: 6,
          sections: [
            {
              heading: 'His day and his tides',
              body: `Thursday is Thor’s day in English, German (Donnerstag), the Scandinavian languages (torsdag) and Old Norse (Þórsdagr). In parts of Scandinavia, Thursday evening was kept free of certain kinds of work, spinning especially, into the 1800s; folklorists have connected this with old respect for Thor’s day, though the link is uncertain.

Of the year’s tides, Midsummer and the season of summer thunder suit him, and Heathens often hail him at Haustblót, the autumn harvest feast, for the crops his rain helped grow. At Winter Nights and Yule he is asked to guard the household through the dark. Þorrablót, Iceland’s midwinter feast, is a 19th-century revival named for the old month Þorri, first held by Icelandic students in Copenhagen in 1873. Its link to Thor is a folk etymology, but that first feast already included a poem called Full Þórs, “Thor’s Cup,” and many Heathens raise a horn to him there still, and it is a hearty feast in his spirit.`,
            },
            {
              heading: 'What he likes',
              body: `Thor eats and drinks hugely in the stories: a whole ox at Þrymr’s feast, three casks of mead, a horn whose end was the sea. Ale and beer are his most traditional drinks, and mead is welcome. Bread is the best food offering, following the Gudbrandsdal farmers’ four loaves a day: oatcakes, rye bread, a bannock or a loaf you baked. Goat is the meat most associated with him; few people cook it, and any good home-cooked dish is fine. Non-alcoholic beer or juice is a perfectly good offering.

Rowan, oak and acorns, and good iron tools belong on his shrine. Modern devotees add red or brown candles and stones like hematite. But Thor’s favourite offering, many Heathens say, is work: a fence mended, a meal cooked for someone else, an hour of hard exercise offered to him.`,
            },
            {
              heading: 'How to offer',
              body: `Stand, hold up the cup, make the hammer sign over it and say his name and what you are giving. Drink a share; this is a meal with the god. Then pour the rest into a bowl and take it outside to the earth, at a tree or onto soil. Lay food on the ground, or compost it. In the gift-for-gift way of Heathen worship, the offering is a gift between friends, not a payment; the Hávamál says friends should “gifts with gifts requite” (Bellows, stanza 42).

For Thor, keep it plain. No elaborate words are needed. He was, after all, the god people spoke to when the boat was going over.`,
            },
            {
              heading: 'What not to do',
              body: `Don’t ask Thor to hurt someone. His hammer is for defence, and this journey keeps to that. Ask him to guard, to strengthen, to make you brave; leave vengeance out of it.

Don’t treat his rowdiness as permission to be drunk at rites. A sip is a share; a hangover is not an offering. Don’t make promises in his name you will not keep. Don’t mock the rain. And in a real thunderstorm, stay indoors and hail him from a window; his stories are about protecting people, not testing your luck.`,
            },
          ],
          knowAndDont: {
            known:
              'Thursday’s name in many languages; ale and bread offerings and the god’s great appetites in the sources; the Gudbrandsdal daily bread in Heimskringla. The first recorded modern Þorrablót was held by Icelandic students in Copenhagen in 1873, with Reykjavík societies following from 1880; the buffet of traditional þorramatur that most Icelanders now know was popularised from the late 1950s.',
            unknown:
              'There is no evidence that Þorri was Thor. The Thursday-evening work taboos are recorded late and their origin is debated. The exact dates of any Thor festivals in the Viking Age are unknown.',
          },
          inPractice:
            'Many Heathens keep a cup for Thor at every family meal on Thursday, and pour it out after dinner. Others give him the first slice of a home-baked loaf each week.',
          reflect: [
            'What hard practical task could you dedicate to Thor this month?',
            'What would your shrine look like if it showed how you actually live?',
          ],
          further: [
            'Saga of Olaf Haraldson in Laing’s Heimskringla (1844).',
            'Terry Gunnell’s articles on Icelandic calendar customs, for the history of Þorrablót.',
          ],
          library: ['traditional/deity/thor', 'traditional/herb/oak', 'traditional/candle/red'],
          premade: ['kitchen-prosperity-bread', 'kitchen-hearth-blessing'],
        },
      ],
      practices: [
        {
          id: 'thor-nine-nights',
          title: 'Nine nights of bread and service',
          instructions: `For nine nights, at the shrine, light the candle, make the hammer sign over a small cup of ale or juice and a piece of bread, and say his name. Then tell him one act of protection, help or hard work you did that day, however small: carried a neighbour’s shopping, fixed a drawer, stopped a cruel joke, went for a long run.

Sit a few minutes. Snuff the candle. Give the bread and drink to the earth before bed or the next morning.

On the ninth night, bake or buy a whole loaf, offer the first slice, and share the rest with someone.`,
          times: 9,
          every: 'day',
          prompt: 'What did you do for someone today, and did it feel like an offering?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Weighing the Hammer',
      intro:
        'Take a few days to look back honestly. Not everyone who likes Thor’s stories is called to dedicate to him, and pausing, stopping, or honouring him simply as a guest at blót is a good outcome.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'thor-reread',
          title: 'Read your record',
          instructions: 'Read your journal from the start. Note the moments that felt like a real meeting, and the days you went through the motions.',
          times: 1,
          prompt: 'What does your record show you about this relationship?',
        },
      ],
      questions: [
        'Did the offerings and the service feel like a relationship, or like a list?',
        'Are you drawn to Thor himself, or to the comic-book version? Which one did you meet this month?',
        'Can you dedicate to a protector without making anger or violence the centre of it?',
        'What weekly offering and practical service can you really keep for a year?',
        'How do you feel about wearing his hammer, and the conversations it may start?',
        'Would it be better to honour him at the holy tides without a personal vow, for now?',
        'If you stop here, what will you keep from this month?',
      ],
    },
    {
      kind: 'dedication',
      title: 'Under the Hammer',
      intro: `If you have chosen to go on, this is the dedication: a blót, a vow written in advance, and the hallowing of a hammer pendant or other token. It is a self-dedication between you and Thor. It is not an initiation into any group, and it does not replace a group’s own rites. Keep the vow modest and specific; a year and a day is a good length.`,
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'thor-write-vow',
          title: 'Write the vow',
          instructions:
            'A day before, write your vow: the offering you will keep (for example, ale or bread on Thursdays), the service you will do (for example, one act of protection or help each week), how long, and what you ask (courage, strength, safety for your household).',
          times: 1,
          prompt: 'Write the final vow here.',
        },
      ],
      rite: {
        title: 'Dedication to Thor',
        summary:
          'A blót of ale and bread in which you hallow the space with the hammer sign, hail Thor, swear a written vow over the cup, and hallow a hammer pendant to wear.',
        minutes: 35,
        ingredients: [
          { name: 'A horn or cup of good ale, beer or mead (or non-alcoholic)' },
          { name: 'A loaf of bread, ideally baked yourself' },
          { name: 'A candle in a safe holder', ref: 'traditional/candle/red' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A hammer pendant or other token to wear' },
          { name: 'Your written vow' },
          { name: 'A sprig of oak or rowan', ref: 'traditional/herb/rowan', optional: true },
        ],
        preparation:
          'Clean the shrine and the room. Wash and dress in clean clothes. Lay the pendant on the shrine. Fill the cup, set the loaf on a board and the bowl beside it. A Thursday, Midsummer or Haustblót are good days, or the day after your ninth night.',
        steps: [
          {
            title: 'Hallow',
            instructions:
              'Light the candle. Make the hammer sign to the north, east, south and west, then above and below, and finally over the shrine.',
            spoken: 'Hammer in the north, hammer in the east, hammer in the south, hammer in the west. Hammer above and below. Thor, hallow and hold this stead.',
            light: true,
          },
          {
            title: 'Hail him',
            instructions: 'Raise the cup and call him.',
            spoken:
              'Thor, son of Earth, Odin’s son, husband of Sif, father of Magni and Móði. Midgard’s warder, giant’s bane, friend of the folk. I have come to you for nine nights with bread and ale. I come again now, to give myself to your friendship.',
          },
          {
            title: 'Share the cup and bread',
            instructions:
              'Make the hammer sign over the cup and loaf. Break the loaf, eat a piece and drink a sip. Set the first and best piece aside in the offering bowl for Thor.',
            spoken: 'I eat with you and drink with you. Hail Thor!',
          },
          {
            title: 'Swear over the cup',
            instructions:
              'Hold the cup and read your vow aloud once, clearly. Take one sip to seal it. Speak only what you will keep.',
            spoken: 'This I swear over the cup, with Thor as witness. Let it stand as long as I keep it.',
          },
          {
            title: 'Hallow the hammer',
            instructions:
              'Take the pendant in your right hand. Pass it slowly over the candle at a safe height and through the steam or scent of the cup. Make the hammer sign over it. Put it on.',
            spoken: 'Hammer, be a sign of my troth to Thor. Guard me, remind me, and let me be a guard to others.',
          },
          {
            title: 'Pour the god’s share',
            instructions:
              'Pour the rest of the ale into the bowl beside the bread. This share is wholly his.',
            spoken: 'Gift for gift. This is yours, Thor, given gladly. Give me in return a brave heart and steady hands.',
          },
          {
            title: 'Close',
            instructions:
              'Thank him. Snuff the candle. Take the bowl outside and pour it out with the bread at the foot of a tree, an oak if you can. Share the rest of the loaf with someone.',
            spoken: 'Hail Thor, and thanks. The vow is made.',
            snuff: true,
          },
        ],
        closing:
          'Write the date and the vow in your journal. Keep the paper vow somewhere safe for your rededication next year.',
        safety:
          'Keep the candle away from hair, sleeves and the pendant’s cord, and never leave it burning. A sip is enough; there is no need to drink more. Pour offerings outside or down a drain, not into houseplants, and keep bread and ale away from pets. If you wear the pendant on a cord, take it off for sleep and contact sports.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping Troth',
      intro: `Thor is the god of the long haul: the weekly loaf, the yearly harvest, the neighbour you keep checking on. Keep your Thursday offering and your service. Hail him at Midsummer and at Haustblót, ask his guard at Winter Nights and Yule, and raise a horn at Þorrablót if you keep it. Once a year, read your vow aloud, say honestly how you kept it, and renew it.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'thor-weekly',
          title: 'Thursday offering and service',
          instructions:
            'Each Thursday, make the hammer sign over a cup and bread, say his name, and tell him the week’s act of service. Pour out the cup after.',
          times: 52,
          every: 'week',
          prompt: 'What did you protect, fix or carry this week?',
        },
        {
          id: 'thor-tides',
          title: 'Keep the holy tides',
          instructions:
            'Hold a blót with Thor hailed at Midsummer, Haustblót, Winter Nights and Yule. Hallow each rite with the hammer sign, and in a sumbel round boast of something you did to protect or help.',
          times: 4,
          every: 'holy-day',
          prompt: 'What did you boast of or vow at this tide?',
          premade: 'folk-simple-blot',
        },
        {
          id: 'thor-rededicate',
          title: 'Yearly rededication',
          instructions:
            'On the anniversary of your dedication, repeat the rite. Read last year’s vow first and say how you kept it. Re-hallow your hammer and make a new vow that fits your life now.',
          times: 1,
          prompt: 'How did last year’s vow go, and what is this year’s?',
        },
      ],
    },
  ],
  sources: [
    'Henry Adams Bellows, trans., The Poetic Edda (1923), public domain: Þrymskviða 30, Hárbarðsljóð 24 and Hávamál 42 quoted from Project Gutenberg ebook #73533 (https://www.gutenberg.org/ebooks/73533).',
    'Rasmus B. Anderson, trans., The Younger Edda (1880), public domain: Gylfaginning ch. 21 (“strongest of all gods and men”, the three treasures) and ch. 44 (the hallowing of the goat-skins) quoted from Project Gutenberg ebook #18947 (https://www.gutenberg.org/ebooks/18947).',
    'Samuel Laing, trans., Heimskringla (1844), public domain: Saga of Hákon the Good (the hammer sign over the goblet) and Saga of Olaf Haraldson (the Gudbrandsdal image) quoted from Project Gutenberg ebook #598 (https://www.gutenberg.org/ebooks/598).',
    'Adam of Bremen, Gesta IV.26–27 (c. 1075); Landnámabók; Willibald, Life of Boniface ch. 6 (paraphrased).',
    'Archaeology: Viking Age Thor’s hammer pendants and hammer rings; the Trendgården mould; the Kvinneby amulet; the Glavendrup and Virring “Þórr vígi” runestones; the Altuna, Hørdum and Gosforth fishing stones.',
    'Neil Price, Children of Ash and Elm (2020); John Lindow, Norse Mythology (2001); Mattias Gardell, Gods of the Blood (2003); US Department of Veterans Affairs, Available Emblems of Belief (Mjölnir added 2013).',
  ],
};
