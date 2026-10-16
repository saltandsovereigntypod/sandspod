import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-dagda',
  kind: 'deity',
  paths: ['celtic', 'wheel'],
  deityRef: 'traditional/deity/dagda',
  title: 'The Dagda: The Good God',
  summary:
    'A month with the Dagda, the great father of the Tuatha Dé Danann: his names and his house on the Boyne, the porridge pit and the Samhain meeting in Cath Maige Tuired, the cauldron, club and harp, and a self-dedication made over a shared pot.',
  welcome:
    'This journey takes about a lunar month. You will read five lessons, set up a shrine with a pot at its heart, keep nine nights of porridge and music, and decide whether to dedicate yourself to the Dagda.\n\nIt is a self-dedication, not an initiation, and it does not make you a member of any group or order. The Dagda is one of the best-drawn gods in Irish literature, but everything we have was written down by Christian scholars centuries after the conversion, and there is almost no record of how he was worshipped. This journey says where the evidence is and where it stops. You can pause whenever you need to.',
  about:
    'The Dagda (Old Irish in Dagda, “the good god”) is the great father of the Tuatha Dé Danann, the divine race of Irish myth. He is also called Eochaid Ollathair, “Eochaid the great father”, and Ruad Rofhessa, “the red one of great knowledge”. He is huge, rough, greedy, strong and wise: in Cath Maige Tuired, the Second Battle of Mag Tuired, he eats a pit full of porridge to satisfy a Fomorian joke, meets the Morrígan by a river at Samhain, drags a club so heavy it leaves a ditch behind it, and calls his stolen harp off a wall so that it plays the seasons and the three strains of sorrow, laughter and sleep. His cauldron, one of the four treasures of the Tuatha Dé, sends no company away unsatisfied. He is the father of Brigid and of Aengus, the lover of the river Boann, and the first owner of Brú na Bóinne, the great passage tombs of the Boyne. The name means good at everything, not morally good: he is capable, generous and formidable, and the tales laugh at him and with him in the same breath. Gaelic polytheists, Druids and other Pagans honour him today with porridge, bread, ale, music and hospitality, especially at Samhain.',
  notes: [
    'The Dagda’s tales survive in medieval Irish manuscripts written by Christian monks and scholars, mostly from the ninth to the twelfth centuries. They are literature, not scripture, and they tell us very little about how he was worshipped before Christianity.',
    'The tales are earthy. The Dagda eats enormously, has sex with the Morrígan and with a Fomorian king’s daughter, and is mocked for his short tunic. Some modern books cut this out; this journey does not, but keeps it to what the texts say.',
    'Do not reduce him to a jolly Santa or a drunken stage Irishman. He is comic and mighty at once, and the respect owed to him includes respect for the Irish culture his stories come from.',
    '“Ollathair”, all-father or great father, is an Irish epithet. It is not a sign that he is the same god as Odin, who is also called All-Father in Old Norse.',
    'Brú na Bóinne (Newgrange, Knowth and Dowth) was built around 3200 BC, thousands of years before any text names the Dagda. The medieval Irish linked the monuments to him and Aengus; the builders’ own beliefs are unknown. Visit respectfully and leave nothing behind.',
    'If you live in the southern hemisphere, Samhain falls around 1 May; many people there keep it then.',
  ],
  holyDays: ['samhain_gaelic', 'samhain', 'bealtaine', 'la_fheile_bride'],
  stages: [
    {
      kind: 'threshold',
      title: 'At the edge of the pot',
      intro:
        'Begin by making a place for the Dagda and introducing yourself, the way a guest is welcomed into an Irish house: with food, a fire and a name. You need a pot, a candle and something good to eat.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'dagda-shrine',
          title: 'Set up a shrine with a pot at its heart',
          instructions:
            'Choose a shelf or table, ideally near the kitchen or where people eat together. Lay down a brown, green or undyed wool or linen cloth. At the centre put a pot, cauldron or deep bowl: an iron pot is ideal, but any sturdy bowl will do, and it should be one you use. Add a candle in a safe holder on a heatproof dish, a cup for ale or milk, and a small plate. Then add something for each of his treasures: a stick, walking staff or wooden spoon for the club, a small harp or any instrument (a whistle, a bodhrán, even a music box) for the harp. Oak leaves or an acorn, a few ears of barley or a bowl of oats, and a stone such as moss agate finish it. Keep the shrine generous rather than precious: it should look like a table that expects company.',
          times: 1,
          prompt: 'What did you put at the heart of the shrine, and what does the pot mean to you?',
        },
      ],
      rite: {
        title: 'Introduction to the Dagda',
        summary:
          'Light a candle, fill a bowl with porridge, give the first spoonful to the good god, and introduce yourself as a guest at his table.',
        minutes: 25,
        ingredients: [
          { name: 'A brown or green candle in a safe holder', ref: 'traditional/candle/brown' },
          { name: 'A small pot of porridge made with oats, milk or water, a pinch of salt and a knob of butter' },
          { name: 'A cup of ale, stout, milk or apple juice' },
          { name: 'A pot, cauldron or deep bowl', ref: 'traditional/tool/cauldron' },
          { name: 'An oak leaf or an acorn', ref: 'traditional/herb/oak', optional: true },
          { name: 'Any instrument, or a song you know', optional: true },
        ],
        preparation:
          'Make the porridge yourself, slowly, stirring sunwise (clockwise), the way Scottish and Irish households traditionally stirred it. Taste it: it should be good enough to serve a guest. Wash your hands and face. Set the porridge in its pot or bowl on the shrine with the cup beside it.',
        steps: [
          {
            title: 'Stand at the table',
            instructions:
              'Stand before the shrine. Take a breath and feel your feet. In early Ireland a guest was welcomed with food before anything else was asked of them; you are coming to him as a guest.',
            spoken: 'Dagda, good god, great father, Ruad Rofhessa, red one of great knowledge, I come to your table.',
          },
          {
            title: 'Light the fire',
            instructions: 'Light the candle.',
            spoken: 'I light this fire for the Dagda, whose cauldron sends no one away hungry.',
            light: true,
          },
          {
            title: 'Give the first spoonful',
            instructions:
              'Take a spoonful of porridge and put it on the small plate before the candle. Pour a little of the drink into his cup. Then eat a spoonful yourself, so that you have shared a meal.',
            spoken: 'Here is the first of the pot, for you. I eat with you, and I am glad of it.',
          },
          {
            title: 'Say who you are',
            instructions:
              'Tell him your name, who your people are (family, friends, the household you feed or that feeds you), and why you have come. Keep it simple and honest, as you would to the head of a house you had just entered.',
          },
          {
            title: 'Give him a tune',
            instructions:
              'Play an instrument, hum, or sing a song you know. Anything will do: a lullaby, a folk song, a tune you whistle. In the tale his harp plays three kinds of music; give him whichever you have.',
            minutes: 3,
          },
          {
            title: 'Sit at his hearth',
            instructions:
              'Sit quietly with the candle and finish your porridge. Notice what you feel: warmth, awkwardness, nothing at all. All of it is worth writing down.',
            minutes: 5,
          },
          {
            title: 'Close',
            instructions: 'Thank him and snuff the candle.',
            spoken: 'Dagda, thank you for your welcome. I will come to your table again.',
            snuff: true,
          },
        ],
        closing:
          'Leave his spoonful and his cup overnight. In the morning, put the porridge out for the birds in small amounts or compost it, and pour the drink onto the earth. Wash his plate and cup and put them back on the shrine. Write down what you said and how it felt.',
        safety:
          'Keep the candle on a heatproof dish, away from cloth and dried plants, and never leave it unattended. Porridge left out is fine for garden birds in small amounts but do not leave salted, buttery food where dogs or cats can gorge on it, and pour alcohol away from pets and children.',
      },
    },
    {
      kind: 'study',
      title: 'Learning who he is',
      intro:
        'Four lessons on the Dagda: his names, family and house; the great tales in Cath Maige Tuired; his cauldron, club and harp; and how he is honoured today. Read one every day or two, with a bowl of something warm.',
      days: 8,
      lessons: [
        {
          id: 'dagda-who',
          title: 'The good god: names, family and the house on the Boyne',
          summary: 'What “Dagda” means, his other names, his children and lovers, and why Newgrange is called his house.',
          minutes: 7,
          sections: [
            {
              heading: 'Good at everything',
              body:
                'The name Dagda comes from Old Irish dag, “good”, and día, “god”. It does not mean good in the moral sense, kind or righteous. It means good at things: capable, effective, the god who can do whatever is needed.\n\nCath Maige Tuired explains the name in a scene that is half heroic and half joke. Before the battle, Lugh asks each of the Tuatha Dé what they will contribute. The smith, the physician, the druids and the warriors all make great boasts. Then, in Lady Gregory’s retelling, “the Dagda said: ‘Those great things you are boasting you will do, I will do them all with only myself.’ ‘It is you are the good god!’ said they, and they all gave a great shout of laughter.” He is named for his boast, and the boast is both true and funny. That double note runs through everything about him.',
            },
            {
              heading: 'His other names',
              body:
                'The Dagda has several titles. Eochaid Ollathair means “Eochaid the great father” or “all-father”: Eochaid is a common Irish name, possibly connected with horses, and Ollathair marks him as the father of his people. Ruad Rofhessa means “the red one of great knowledge”. Cormac’s Glossary, compiled around 900, lists it simply: “Ruad-rofhessa (‘Lord of great knowledge’) i.e. nomen for the Dagdae.” Lady Gregory calls him “the Red Man of all Knowledge”.\n\nSo he is wise as well as strong. The tales show him as a druid as well as a fighter and a builder, and a medieval list of his names, which he recites to a Fomorian woman in the tale, runs on for lines in a deliberately comic way. Devotees today use Dagda, Eochaid Ollathair and Ruad Rofhessa in prayer. In modern Irish he is an Daghda, said roughly “un DAI-ga” or “un DAG-da”; either is used in English.',
            },
            {
              heading: 'Family',
              body:
                'The Dagda’s family is large. Cormac’s Glossary makes Brigit, the goddess of poets, his daughter, with her sisters Brigit of healing and Brigit of smithcraft. With Boann, the goddess of the river Boyne, he fathered Aengus (Óengus), the young god of love; in the Wooing of Étaín he holds the sun still for nine months so that Aengus is conceived and born in what seems a single day. Other children include Bodb Derg, later king of the Tuatha Dé, and Cermait Honey-Mouth; Lady Gregory, following some medieval sources, also makes Ériu, Banba and Fódla, the three goddesses whose names became names for Ireland, his daughters, though other texts give them a different father.\n\nHe is also bound to the Morrígan, the great queen of battle and sovereignty, whom he meets at Samhain before the second battle. None of these relationships is tidy, and the texts do not agree on every detail. They agree that he is a father in the fullest sense: the source of many lines.',
            },
            {
              heading: 'The house on the Boyne',
              body:
                'Medieval Irish writers placed the Dagda’s home at Brú na Bóinne, the bend of the Boyne in County Meath, where the passage tombs of Newgrange, Knowth and Dowth stand. Gregory’s retelling lists the wonders there: the Bed of the Dagda, the Hall of the Morrígan, the Birthplace of Cermait. In another tale, Aengus asks his father for the Brú “for a day and a night” and then keeps it for ever, since all time is made of days and nights. The Dagda gives way without revenge.\n\nThe monuments themselves were built around 3200 BC, older than Stonehenge and the pyramids of Giza. At Newgrange the rising sun shines down the passage into the chamber for a few days around the winter solstice. That alignment is real and astonishing, but the link between the builders and the Dagda is a medieval one. We do not know whom the builders honoured there.',
            },
          ],
          knowAndDont: {
            known:
              'The name means “good god”. Cath Maige Tuired explains it with his boast. Cormac’s Glossary (c. 900) gives Ruad Rofhessa as one of his names and makes Brigit his daughter. Medieval tales place his house at Brú na Bóinne and make him the father of Aengus with Boann. The Newgrange solstice alignment is an archaeological fact.',
            unknown:
              'We do not know how old these stories are, how widely he was worshipped, or whether “the Dagda” was once a title for a god with another name. There is no evidence that the Neolithic builders of Newgrange knew any god called the Dagda. Family details vary between texts.',
          },
          inPractice:
            'Devotees often address him by several names at once, as in the rites here, and many honour Brigid, Aengus or Boann alongside him as his family. Some visit the Boyne valley or watch the Newgrange solstice broadcast in December as an act of devotion, while being clear that the monument’s builders had their own gods.',
          reflect: [
            'What does it mean to you that “good” here means capable rather than kind? Is there a kind of goodness you have been overlooking in yourself?',
            'Who is a great father or mother to your people, in the broad sense of the one who feeds and holds things together?',
          ],
          further: [
            'Lady Gregory, Gods and Fighting Men (1904), Part I Book IV ch. II, “The Dagda” (public domain, Project Gutenberg).',
            'Cormac’s Glossary, trans. John O’Donovan, ed. Whitley Stokes (1868), s.v. Brigit and Ruad-rofhessa (public domain, archive.org).',
            'Geraldine Stout, Newgrange and the Bend of the Boyne (2002).',
          ],
          library: ['traditional/deity/dagda', 'traditional/deity/brigid', 'traditional/deity/morrigan'],
        },
        {
          id: 'dagda-tales',
          title: 'The porridge pit and the river: the Dagda in Cath Maige Tuired',
          summary: 'His labour under Bres, the porridge the Fomorians served him, the Samhain meeting with the Morrígan, and what the comic scenes are doing.',
          minutes: 8,
          sections: [
            {
              heading: 'Under a mean king',
              body:
                'Cath Maige Tuired opens with the Tuatha Dé ruled by Bres, a half-Fomorian king whose great fault is stinginess. In Gregory’s retelling, there was “no smell of ale” on the breath of guests leaving his house, and no music, poets or games. The Dagda is reduced to digging ditches and building forts for him. A sharp-tongued blind man, Cridenbel, bullies him every night into handing over “the three best bits” of his food, and the Dagda grows weak.\n\nHis son Aengus gives him three gold pieces to hide in the food. Cridenbel swallows them and dies, the Dagda is accused of poisoning, and he proves his innocence when the body is opened and the gold found. For his wages he asks only for a black heifer, which seems foolish; after the battle her lowing calls home all the cattle the Fomorians had taken. The story is about a mean king and a god who is patient, clever and finally just.',
            },
            {
              heading: 'The porridge pit',
              body:
                'Before the battle, Lugh sends the Dagda to delay the Fomorians. To mock him, knowing his love of porridge, they fill the king’s cauldron with eighty gallons of new milk and the same of meal and fat, add goats, sheep and pigs, boil it all and pour it into a hole in the ground. He must eat it all or die.\n\nHe does. His ladle is big enough for a man and woman to lie in. In Gregory’s words, “‘If the broth tastes as well as the bits taste, this is good food,’ he said,” and when the hole was empty he scraped up the last of it from the gravel. Then he falls asleep, belly the size of a cauldron, and waddles home in a tunic too short for him, dragging his huge club so that its track was “deep enough for the boundary ditch of a province.” The Fomorians laugh at him. So does the audience. And he has done exactly what he was sent to do: bought time.',
            },
            {
              heading: 'At the river at Samhain',
              body:
                'On that journey, at Samhain, the Dagda meets the Morrígan at the river Unshin in County Sligo. She is washing, one foot on each bank, her hair in nine loosened locks. They lie together, and the place is called the Bed of the Couple. She promises to take the heart’s blood of the Fomorian king Indech for the Tuatha Dé. Gregory’s retelling leaves out the union; the original text and modern translations keep it.\n\nIn another episode he meets the daughter of Indech, who first throws him to the ground and mocks him, then sleeps with him and agrees to work against her own father’s army. The scene is bawdy and ridiculous, and some scholars think it is a deliberate parody of the solemn sovereignty union at the river. Both stories put the Dagda in the role of the god who wins allies and victory through union, appetite and good humour.',
            },
            {
              heading: 'What the comedy is doing',
              body:
                'It is tempting to treat the comic scenes as late additions that make fun of an old god. Some scholars have argued exactly that. Others read the Dagda’s comedy as part of who he is: the god of abundance is also the god of appetite, and a father who can be laughed at is still the father.\n\nThe point for a devotee is that you do not have to choose. The Dagda is mighty and absurd, wise and greedy, and he does not mind being laughed at. Approach him with respect and with humour. A devotee who cannot laugh in his presence has probably not understood him.',
            },
          ],
          knowAndDont: {
            known:
              'Cath Maige Tuired, in a manuscript of the sixteenth century copying older material, tells of Bres’s stinginess, Cridenbel, the porridge pit, the Samhain union with the Morrígan and the episode with Indech’s daughter. Lady Gregory’s 1904 retelling follows it closely but omits the sexual scenes.',
            unknown:
              'Scholars disagree about how old the tale’s parts are and whether the comic scenes are original or later parody. We do not know whether any of these episodes was ever acted out in ritual. Reading the Samhain union as a seasonal or sovereignty rite is interpretation, though a widely held one.',
          },
          inPractice:
            'Many devotees retell the porridge pit story at Samhain over a pot of porridge, and keep Samhain night for the Dagda and the Morrígan together. Some read Elizabeth Gray’s translation aloud each year. Feeding people generously and refusing to be mean with food are the practical lessons most often drawn from the Bres story.',
          reflect: [
            'Where have you been patient under a “mean king”, a situation that starved you of something you needed? What did the patience cost, and what did it buy?',
            'Can you hold respect and laughter for the same being at once? Where else in your life do you do that?',
          ],
          further: [
            'Cath Maige Tuired: The Second Battle of Mag Tuired, ed. and trans. Elizabeth A. Gray (Irish Texts Society, 1982); also online at CELT, University College Cork.',
            'Lady Gregory, Gods and Fighting Men (1904), Part I Book II ch. III, “The Great Battle of Magh Tuireadh” (public domain).',
            'Whitley Stokes, “The Second Battle of Moytura”, Revue Celtique 12 (1891) (public domain).',
          ],
          library: ['traditional/deity/dagda', 'traditional/deity/morrigan', 'traditional/deity/lugh'],
        },
        {
          id: 'dagda-treasures',
          title: 'Cauldron, club and harp',
          summary: 'The three treasures of the Dagda, what they do in the tales, and how early Irish hospitality gives them meaning.',
          minutes: 7,
          sections: [
            {
              heading: 'The cauldron',
              body:
                'When the Tuatha Dé came to Ireland, the tales say, they brought four treasures from four northern cities: the Stone of Fál that cried out under a true king, the spear of Lugh, the sword of Nuada, and the Dagda’s cauldron. Gregory renders it “the Cauldron that no company ever went away from unsatisfied.”\n\nIt is a pot that feeds everyone according to their worth, and it never runs dry. It stands at the heart of his devotion because early Irish society put hospitality at the heart of honour. The law texts describe the briugu, a hospitaller who kept an open house at a crossroads with a cauldron always on the fire, and whose rank depended on never refusing a guest. A stingy king, like Bres, could be satirised out of office. The Dagda’s cauldron is that ideal made divine.',
            },
            {
              heading: 'The club',
              body:
                'The Dagda carries a huge club or staff. In Cath Maige Tuired it is so heavy it must be dragged on wheels, and it gouges a ditch behind him; Gregory calls it “a wheeled fork it would take eight men to carry”. A later tradition adds that one end of it kills and the other brings the dead back to life.\n\nIt is a picture of power over life and death held in one hand. Devotees often read it as the father’s responsibility: the strength to protect, which can harm, and the strength to restore, which must be chosen. Many keep a staff, a stout stick or a wooden spoon on his shrine for it. A wooden spoon is a good, homely choice: it stirs the cauldron, and every cook knows it can also be brandished.',
            },
            {
              heading: 'The harp',
              body:
                'After the battle, the Fomorians steal the Dagda’s harp. He, Lugh and Ogma find it hanging on the wall of a Fomorian feasting-hall. In Gregory’s words, “it was in that harp the Dagda had bound the music, so that it would not sound till he would call to it. And sometimes it was called Dur-da-Bla, the Oak of Two Blossoms, and sometimes Coir-cethar-chuin, the Four-Angled Music.” He calls: “Come summer, come winter, from the mouth of harps and bags and pipes.” The harp leaps from the wall to his hand.\n\nThen “he played for them the three things harpers understand, the sleepy tune, and the laughing tune, and the crying tune.” The women weep, the children laugh, the host falls asleep, and the three gods walk out unharmed. The Irish names for these strains, the goltraí, geantraí and suantraí, are still known to Irish musicians. The harp orders the seasons and moves the heart. It is the reason music is an offering to him.',
            },
            {
              heading: 'Abundance with obligations',
              body:
                'Taken together, the treasures describe a god of abundance who is not soft. Food is plentiful, but it comes with the duty to share. Power is great, but it can kill or heal. Music is sweet, but it can make you weep or put an army to sleep.\n\nThat is the shape of a devotion to him. People ask the Dagda for plenty, protection and the right ordering of the year, and in return they are expected to feed others, protect those in their care and bring joy to the table. A full larder hoarded is not his kind of abundance. A pot shared is.',
            },
          ],
          knowAndDont: {
            known:
              'The four treasures of the Tuatha Dé, including the Dagda’s cauldron, appear in Cath Maige Tuired and the Lebor Gabála Érenn. The tale describes his heavy club and the recovery of his harp with its names and three strains. The early Irish law texts describe the briugu and the honour of hospitality.',
            unknown:
              'The club that kills and revives comes from a later text than Cath Maige Tuired. We do not know whether the treasures had cult objects behind them, such as real cauldrons used in feasts for him, though Iron Age cauldrons have been found in Irish and British bogs. Reading the treasures as a unified symbolism is modern.',
          },
          inPractice:
            'Devotees keep a cauldron or pot, a staff or spoon and an instrument on his shrine, cook for others in his name, and play or sing as offerings. Some learn the three strains on an instrument, or simply pick three songs: one sad, one merry, one a lullaby.',
          reflect: [
            'Which of the three treasures do you most need in your life right now: plenty, strength or music?',
            'Who could you feed this month, and what would it cost you?',
          ],
          further: [
            'Lady Gregory, Gods and Fighting Men (1904), Part I Book I ch. I (the four treasures) and Book II ch. III (the club and the harp) (public domain).',
            'Fergus Kelly, A Guide to Early Irish Law (1988), on the briugu and hospitality.',
            'Ann Buckley, “Music in Ireland to c. 1500”, in A New History of Ireland vol. I (2005).',
          ],
          library: ['traditional/deity/dagda', 'traditional/tool/cauldron', 'traditional/herb/oak'],
          premade: ['kitchen-family-meal-blessing'],
        },
        {
          id: 'dagda-today',
          title: 'Honouring the Dagda today',
          summary: 'Who honours him now, what they do, where the communities differ, and the mistakes to avoid.',
          minutes: 7,
          sections: [
            {
              heading: 'Who honours him',
              body:
                'The Dagda is honoured by Gaelic polytheists and Celtic Reconstructionists, who work from the Irish texts, folklore and language; by Druids in groups such as the Order of Bards, Ovates and Druids and Ár nDraíocht Féin, who may call on him as a father of the gods; and by Wiccans and other Pagans, who sometimes see him as one face of the God of the Wheel of the Year.\n\nThese communities differ in method. A reconstructionist will keep to Irish names, Irish festival dates and offerings attested in Irish custom, and will be cautious about borrowing from other cultures. An eclectic Pagan may honour him alongside gods from other traditions and draw on modern correspondences. Both can be sincere. It helps to know which you are doing, and to say so honestly when you share it.',
            },
            {
              heading: 'Hospitality as devotion',
              body:
                'The centre of his modern devotion is hospitality. Cook for people. Have friends round and feed them well. Bring soup to a neighbour who is ill. Volunteer at a food bank or a community kitchen. Keep something in the house you can offer a visitor.\n\nMany devotees set aside the first spoonful or the first slice of every special meal for him, and some do it at every meal. Others keep a special pot that they use only for cooking for others. None of this needs to be lavish. The Dagda in the tales eats porridge, not banquets, and the point of his cauldron is that it is enough for everyone.',
            },
            {
              heading: 'The father and protector',
              body:
                'He is a father-god, and people come to him for fatherly things: protection of the household, wisdom in hard decisions, steadiness, a sense of being provided for. People with difficult fathers sometimes find him healing; others find him uncomfortable, and that is worth noticing rather than forcing.\n\nThe protection he gives is earthy and practical. Devotees ask him to watch over a home, a farm or a family, and they back that up by doing the work: mending the roof, paying the bills, standing up for the vulnerable. A father who only blesses and never builds is not much like the Dagda, who spent his time under Bres digging ditches.',
            },
            {
              heading: 'What to avoid',
              body:
                'A few things are worth avoiding. Do not make him a joke figure only, all belly and no wisdom; the tales never forget that he is Ruad Rofhessa. Do not make him a heavy drinker for your own excuse; he loves food and ale, but the tales do not make him a drunk, and turning him into one leans on old anti-Irish stereotypes.\n\nDo not treat “all-father” as proof that every father-god is one god, or swap Norse lore into Irish practice without saying so. And do not be stingy with him or with others. If you offer, offer something you would want to eat yourself. A spoonful of burnt porridge is a poor gift; a spoonful of good porridge, honestly given, is a fine one.',
            },
          ],
          knowAndDont: {
            known:
              'Gaelic polytheists, Druids and other Pagans honour the Dagda today. Early Irish law and literature make hospitality a central virtue and stinginess a disgrace. The Irish texts give him the roles of father, builder, druid and warrior.',
            unknown:
              'There is no surviving record of personal devotion to the Dagda before Christianity, and no prayer or hymn to him. Modern practices, such as the first spoonful or a weekly offering, are built from the tales and from Irish folk custom, not from any recorded cult.',
          },
          inPractice:
            'A typical devotee keeps a shrine with a pot or cauldron, offers porridge, bread or ale weekly, cooks for others, plays or sings for him, and keeps Samhain in his honour. Many also tend the land in some way, as the builder of raths and the owner of the black heifer.',
          reflect: [
            'Who do you feed, and who feeds you? Is that balance where you want it?',
            'Which part of the Dagda is hardest for you: his appetite, his authority, or his comedy?',
          ],
          further: [
            'Erynn Rowan Laurie and others, The CR FAQ (2007), on Celtic Reconstructionist practice.',
            'Mark Williams, Ireland’s Immortals: A History of the Gods of Irish Myth (2016).',
            'Proinsias Mac Cana, Celtic Mythology (1970).',
          ],
          library: ['traditional/deity/dagda', 'traditional/crystal/moss_agate', 'traditional/herb/thyme'],
          premade: ['kitchen-hearth-blessing', 'kitchen-healing-broth'],
        },
      ],
      practices: [
        {
          id: 'dagda-study-pot',
          title: 'Read beside the pot',
          instructions:
            'Before each lesson, light his candle and say, “Dagda, good god, I sit at your table.” Read with a bowl of something warm. Afterwards, write down one thing that surprised you.',
          times: 4,
          every: 'day',
          prompt: 'What surprised you in today’s lesson?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights at the cauldron',
      intro:
        'Now you put what you have learned into practice. For nine nights you will make a small offering of porridge or bread and give him a tune, and on at least one night you will feed someone else. Start with the lesson on his days, offerings and the shape of a rite.',
      days: 10,
      lessons: [
        {
          id: 'dagda-offerings',
          title: 'Porridge, ale and music: days, offerings and the shape of a rite',
          summary: 'When to honour the Dagda, how to make his porridge, what to give and how, the shape of a simple rite, and keeping his shrine.',
          minutes: 7,
          sections: [
            {
              heading: 'His days',
              body:
                'Samhain, on the night of 31 October into 1 November, is the Dagda’s great night in the tales: it is when he meets the Morrígan at the river before the battle. Gaelic polytheists keep it with a feast for the living and the dead, and many keep a place at the table for him.\n\nBealtaine, on 1 May, is the other great turning of the Gaelic year, the start of summer, when cattle went out to the summer pastures; it suits a god of herds and plenty. Many also honour him at Lá Fhéile Bríde, 1 February, as the father of Brigid. For regular devotion, choose a day and keep it. Many devotees pick Thursday or Sunday for a family meal; this is a modern choice. Choose one you can keep.',
            },
            {
              heading: 'Making his porridge',
              body:
                'Porridge is the Dagda’s food in the tales, and it is also the plain daily food of Ireland and Scotland for centuries. Make it properly. Use rolled or pinhead oats, a pinch of salt, and milk or water; cook it slowly and stir it sunwise, clockwise, as many households did for luck. Finish with a knob of butter. Honey or cream are luxuries he would enjoy.\n\nIf you cannot eat oats, barley porridge, a hearty soup or stew, or good bread with butter all suit him. The rule of thumb is simple: something warm, filling and generous, made with care. Ale, stout, milk and buttermilk are traditional drinks; apple juice or water are fine. Mead and whiskey are often given today.',
            },
            {
              heading: 'How to offer',
              body:
                'Give him the first and the best: the first spoonful from the pot, the first slice of the loaf, the first pour of the drink. Set it before his candle and say what it is. Then eat yourself, so that the meal is shared. Sharing is in the spirit of the tales; he is a god of feasts, not of food left untouched.\n\nLeave his portion overnight. In the morning, put plain food out for the birds in small amounts, or compost it, and pour the drink onto the earth. Do not leave large amounts out where they will attract rats or be eaten by dogs. Music can be offered on its own: play or sing, and say who it is for. Cooking for another person in his name is an offering too, and many devotees think it the best kind.',
            },
            {
              heading: 'The shape of a simple rite',
              body:
                'A rite for the Dagda has five parts. First, come to the table: stand before the shrine and greet him by his names. Second, light his fire. Third, give the first of the food and drink, and eat with him. Fourth, give him music, a song, a tune or the three strains in miniature: something sad, something merry, something soothing. Fifth, ask for what you need, plenty, protection, wisdom, thank him and close.\n\nAt Samhain you can expand this: make a full meal, set a place for him and for your dead, tell the story of the porridge pit and the river, and sit up late with music. Keep it warm and full of people if you can.',
            },
            {
              heading: 'Keeping his shrine',
              body:
                'A Dagda shrine should look used. Keep the pot clean and in service; cook in it now and then. Change the oak leaves or barley with the seasons: green oak in summer, acorns in autumn, a sheaf of barley after harvest, evergreens in winter. Dust it, and do not let old offerings sit and spoil.\n\nIf your household shares the space, let it be part of family life rather than hidden away. A pot on a kitchen shelf with a candle beside it, where someone sets aside the first spoonful of dinner, is as good a shrine to him as any carved altar.',
            },
          ],
          knowAndDont: {
            known:
              'Samhain is the setting of his meeting with the Morrígan in Cath Maige Tuired. Porridge, milk, butter, ale and bread were staple foods in early Ireland. Stirring sunwise (deiseal) for luck is recorded in Irish and Scottish folk custom.',
            unknown:
              'No source tells us what was offered to the Dagda or how. Weekly days, the five-part rite and the first-spoonful custom are modern practice drawn from the tales and from folk custom. Whiskey and mead as offerings are modern choices.',
          },
          inPractice:
            'Many devotees make porridge for him every Samhain and on their weekly day, give the first spoonful, and play music at the shrine. Others keep a big family meal each month in his name.',
          reflect: [
            'What do you cook best? Could that be your main offering to him?',
            'Which three songs would you choose for the sad, merry and sleepy strains?',
          ],
          further: [
            'Kevin Danaher, The Year in Ireland (1972), on Samhain and Bealtaine customs.',
            'F. Marian McNeill, The Scots Kitchen (1929), on porridge and its customs.',
          ],
          library: ['traditional/deity/dagda', 'traditional/herb/oak', 'traditional/vessel/offering_bowl'],
          premade: ['kitchen-prosperity-bread', 'wicca-samhain-dumb-supper'],
        },
      ],
      practices: [
        {
          id: 'dagda-nine-nights',
          title: 'Nine nights of porridge and music',
          instructions:
            'For nine nights, light his candle and set out a spoonful of porridge (or bread and butter) and a splash of drink. Say: “Dagda, good god, here is the first of my pot. Eat with me.” Eat a little yourself. Then give him a tune: play, hum or sing for at least a few minutes. Tell him one thing you are grateful for and one thing you need. Snuff the candle. In the morning, give the food to the birds or the compost and the drink to the earth. On at least one of the nine nights, cook for someone else, a friend, a neighbour or a food bank, and dedicate it to him.',
          times: 9,
          every: 'day',
          prompt: 'What did you offer and play tonight? Did anything shift in how you feel about him?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Taking stock of the pot',
      intro:
        'Before any dedication, look back over the month. A dedication to the Dagda is a promise to feed, protect and bring joy to those in your care. Stopping, waiting, or choosing another god or path are all good outcomes; his cauldron will still be full.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'dagda-discern',
          title: 'Cook and think',
          instructions:
            'Make a big pot of something, more than you need, and while it cooks, think through the questions below. Share the food with someone. Write your answers afterwards.',
          times: 1,
          prompt: 'Your honest answers to the discernment questions.',
        },
      ],
      questions: [
        'Did you keep most of the nine nights? What does that tell you about the promise you might make?',
        'Did you feed someone else? How did it feel, and could you keep doing it?',
        'Are you comfortable with the earthy, comic and sexual sides of his tales, or would you rather they were not there?',
        'Is your relationship to fathers and father-figures something you can bring to him honestly, or does it need other care first?',
        'Are you drawn to the Dagda himself, or to a general idea of abundance? Both are fine; only one needs a dedication.',
        'Is another deity or path calling you more strongly? Choosing them, or pausing, is a good and honest outcome.',
      ],
    },
    {
      kind: 'dedication',
      title: 'Dedication at the cauldron',
      intro:
        'If you choose to go on, this is a self-dedication to the Dagda, made before him in your own words. It is not an initiation into any group, order or tradition, and it does not replace one where they have their own. Samhain is the fitting time, but any day you are ready will do.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to the Dagda',
        summary:
          'Cook a pot, invite him by his names, give the first portion, play the three strains, make your promise and share the food.',
        minutes: 50,
        ingredients: [
          { name: 'A brown, green or gold candle in a safe holder', ref: 'traditional/candle/brown' },
          { name: 'A pot of porridge, soup or stew you have made yourself' },
          { name: 'Bread and butter', optional: true },
          { name: 'Ale, stout, milk or apple juice' },
          { name: 'An oak sprig, acorns or ears of barley', ref: 'traditional/herb/oak', optional: true },
          { name: 'A stone for the shrine, such as moss agate', ref: 'traditional/crystal/moss_agate', optional: true },
          { name: 'An instrument or three songs' },
          { name: 'Your written promise' },
        ],
        preparation:
          'Write your promise over several days: how you will honour him (a weekly offering, Samhain each year), whom you will feed and how often, and what you will protect. Make it a year’s promise. Choose three songs or tunes: one sad, one merry, one a lullaby. On the day, cook the pot slowly, stirring sunwise. Wash and dress as for a feast. If you can, invite a friend or family member to eat with you afterwards.',
        steps: [
          {
            title: 'Come to the table',
            instructions: 'Stand before the shrine with the pot in front of you.',
            spoken: 'Dagda, good god, Eochaid Ollathair, Ruad Rofhessa, I come to your table of my own free will.',
          },
          {
            title: 'Light the fire',
            instructions: 'Light the candle. Lay the oak or barley beside the pot.',
            spoken: 'I light this fire for you, father of the Tuatha Dé, whose cauldron sends no company away unsatisfied.',
            light: true,
          },
          {
            title: 'Give the first portion',
            instructions:
              'Serve the first and best portion into his bowl and set it before the candle. Pour his drink. Eat a little yourself.',
            spoken: 'Here is the first of the pot, the best I have made. Eat with me.',
          },
          {
            title: 'Play the three strains',
            instructions:
              'Play or sing your three pieces in turn: the sad one, the merry one, and the lullaby. Let yourself feel each one.',
            minutes: 10,
          },
          {
            title: 'Make your promise',
            instructions:
              'Read your promise aloud. Say plainly that this is a self-dedication, made in good faith, and that you will keep it as best you can.',
            spoken: 'This is my word, given at your table. I will feed and protect those in my care, and I will come to your cauldron again.',
          },
          {
            title: 'Sit at his hearth',
            instructions:
              'Sit in silence with the candle and the pot. Imagine the great hall at the Brú, warm and full of people, and a place made for you.',
            minutes: 10,
          },
          {
            title: 'Close',
            instructions: 'Thank him and snuff the candle.',
            spoken: 'Dagda, thank you. I go out to feed and to build.',
            snuff: true,
          },
        ],
        closing:
          'Share the rest of the pot with whoever you invited, or take some to a neighbour. Leave his portion overnight and give it to the birds or the compost. Within a week, cook for someone else in his name.',
        safety:
          'Keep the candle on a heatproof dish away from the hob and cloths, and never leave it or a cooking pot unattended. Do not leave salted, buttery or onion-based leftovers where dogs and cats can reach them, since onion and garlic are toxic to them. Pour alcohol away from pets and children.',
      },
    },
    {
      kind: 'ongoing',
      title: 'The pot that never empties',
      intro:
        'The relationship lives at the table. Here is a rhythm: a weekly offering and tune, Samhain and Bealtaine each year, regular hospitality, and a yearly renewal.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'dagda-weekly',
          title: 'Weekly first spoonful',
          instructions:
            'Once a week, on your chosen day, light his candle, give the first spoonful or slice of a meal, and play or sing something. Tell him how the household is.',
          times: 52,
          every: 'week',
          prompt: 'What did you offer, and how is the household?',
          premade: 'kitchen-family-meal-blessing',
        },
        {
          id: 'dagda-feed',
          title: 'Feed someone each month',
          instructions:
            'Once a month, cook for someone outside your household, or give time or food to a community kitchen or food bank, and dedicate it to him.',
          times: 12,
          every: 'month',
          prompt: 'Whom did you feed this month?',
        },
        {
          id: 'dagda-samhain',
          title: 'Samhain at the cauldron',
          instructions:
            'On Samhain night (31 October, or around 1 May in the southern hemisphere), make a pot of porridge or stew, set a place for the Dagda and for your dead, retell the porridge pit and the meeting at the river, and play music late.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did you remember and celebrate this Samhain?',
        },
        {
          id: 'dagda-renew',
          title: 'Yearly renewal',
          instructions:
            'At Samhain or on the anniversary of your dedication, read your promise. Say honestly what you kept. Make a new promise for the next year, or release the old one with thanks.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did you build and whom did you feed this year?',
        },
      ],
    },
  ],
  sources: [
    'Lady Augusta Gregory, Gods and Fighting Men (1904), Part I Book I ch. I (the four treasures), Book II ch. III (the boast, the battle, the porridge pit, the harp) and Book IV ch. II (“The Dagda”, the house at the Brú), Project Gutenberg: https://www.gutenberg.org/ebooks/14465 (quoted: “It is you are the good god!”; the porridge; “a wheeled fork it would take eight men to carry”; “deep enough for the boundary ditch of a province”; “the Cauldron that no company ever went away from unsatisfied”; the harp’s names, its call and the three tunes).',
    'Cormac’s Glossary, trans. John O’Donovan, ed. Whitley Stokes (Calcutta, 1868), s.v. Ruad-rofhessa, archive.org: https://archive.org/details/cu31924071173474',
    'Cath Maige Tuired: The Second Battle of Mag Tuired, ed. and trans. Elizabeth A. Gray (Irish Texts Society, 1982).',
    'Fergus Kelly, A Guide to Early Irish Law (Dublin Institute for Advanced Studies, 1988).',
    'Mark Williams, Ireland’s Immortals: A History of the Gods of Irish Myth (Princeton, 2016).',
    'Kevin Danaher, The Year in Ireland (1972).',
  ],
};
