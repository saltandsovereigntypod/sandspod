import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-krishna',
  kind: 'deity',
  paths: ['hindu'],
  deityRef: 'traditional/deity/krishna',
  title: 'Krishna: The Flute in Vrindavan',
  summary:
    'A devotional month with Krishna, the butter thief of Vrindavan and the teacher of the Bhagavad Gita. Learn his stories in the Bhagavata Purana and the Mahabharata, the saints who sang to him, how Janmashtami, Holi and the Ekadashis are kept, and how to offer tulsi, butter and song at a simple home puja, then decide whether to make a personal vow of devotion.',
  welcome: `This journey spends about a lunar month learning about Krishna and offering him simple devotion (bhakti) at home. He is one of the most loved forms of God in the world: worshipped as the eighth avatar of Vishnu, and by many Vaishnava Hindus as God himself, in temples from Vrindavan to Udupi, from Puri to Pandharpur, in countless homes, and in Vaishnava communities on every continent.

You will learn his names and image, his childhood and youth in Vrindavan as the Bhagavata Purana tells them, his teaching in the Bhagavad Gita, the poet-saints who loved him, how his festivals are kept, and how to make a small home puja with tulsi leaves, butter or milk sweets, a lamp and a song. For eight days, ending at midnight as on his birthday, you will sit with one of his stories each day. At the end you may make a personal vow of devotion, or not.

Please read this plainly. This is not an initiation. Formal initiation (dīkṣā) and mantras traditionally given by a guru are not offered here and cannot be given by an app. Nothing here is "magic", a love charm or a spell; it is devotion. The best thing this journey can do is send you to a temple, a kirtan or a Hindu friend's home, to learn from the people whose religion this is.`,
  about: `Krishna (Kṛṣṇa, "the dark one", "the all-attractive") is one of the most widely worshipped deities of Hinduism. He is honoured as the eighth avatar of Vishnu, and in many Vaishnava traditions, such as the Gaudiya Vaishnavas of Bengal and the Pushtimarg of Vallabha, as the Supreme God himself, the source of all avatars. His story is told in the Mahabharata, where he is the friend and charioteer of the warrior Arjuna and speaks the Bhagavad Gita, and in the Harivamsha, the Vishnu Purana and above all the tenth book of the Bhagavata Purana, which tells of his birth in a prison in Mathura, his childhood among the cowherds of Gokul and Vrindavan, the butter he stole, the serpent Kaliya he subdued, the mountain Govardhan he lifted, and the love of the gopis (cowherd women) and of Radha. He is pictured dark blue, with a peacock feather in his hair, a yellow garment and a flute, often with Radha, or as a crawling child with a ball of butter. Poet-saints from Andal and Jayadeva to Mirabai, Surdas, Chaitanya and Tukaram sang to him, and his devotees today keep Janmashtami, his midnight birth, Holi in Braj, Govardhan Puja, and the fortnightly Ekadashi fasts.`,
  notes: [
    'Hinduism is a living religion. Krishna belongs first to the Hindu families, temples and teachers who worship him, in many Vaishnava traditions. This journey is a respectful introduction and an invitation to learn from them, not a replacement.',
    'Dīkṣā (formal initiation) and mantras traditionally given by a guru are not offered here. Where Hindu prayers are mentioned, the app gives its own English words. Learn Sanskrit prayers, and their pronunciation and proper use, from a priest, teacher or family; songs sung openly at kirtan you may learn by joining in.',
    'This is devotion, not magic. Krishna is not a love charm, and the love of Radha and the gopis is understood by his devotees as the soul’s love for God. Please do not use him, his image or his names in spells, "attraction" rituals or as décor.',
    'Offerings are vegetarian: no meat, fish, eggs or alcohol. Many Vaishnava households also leave out onion and garlic from food offered to Krishna; this journey follows that custom. A tulsi (holy basil) leaf is placed on food offered to him.',
    'Treat his image with care: keep it raised, clean and out of bathrooms; do not put it on shoes, floor mats or anything you sit on. Some temples, including the Jagannath temple at Puri and the Guruvayur temple in Kerala, admit only Hindus; respect that, and look for the many temples that welcome visitors.',
    'The app can show the Hindu lunar calendar (panchang): tick it under "Also show" in "Calendar & holidays". It marks the Ekadashis, Purnima, Diwali and Holi. Janmashtami, Govardhan Puja and Gita Jayanti you will find in a printed panchang; Janmashtami is often kept on two days, by different communities. Panchangs, regions and countries can differ by a day; confirm with your local temple.',
    'Safety: fasting is never required. If you are pregnant, diabetic, unwell, on medication or have a history of disordered eating, do not fast. Keep lamps and incense on heatproof plates and attended. Butter and milk sweets go off quickly in warm weather; offer small amounts and eat or share them the same day.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'The Dark Child',
      intro:
        'Begin by learning who Krishna is, set up a small clean shrine, and offer a first simple puja: a lamp, a tulsi leaf or flower, a little butter or a sweet, and a few minutes of listening.',
      days: 3,
      lessons: [
        {
          id: 'krishna-who',
          title: 'The All-Attractive',
          summary: 'His names, his image and what it shows, and his place in Hindu religion.',
          minutes: 7,
          sections: [
            {
              heading: 'His names',
              body: `Kṛṣṇa means "dark", "black" or "dark blue", and devotees also explain it as "the all-attractive", the one who draws every heart. Many of his names come from his childhood and youth in the cowherd country of Braj: Gopala and Govinda, "protector of cows"; Makhan Chor, "butter thief"; Murali or Venugopala, "flute player"; Mohan, "the enchanting"; Shyam or Shyamsundar, "the beautiful dark one"; Banke Bihari, "the one who plays, bent in three places".

Others come from his later life and from his divinity: Vasudeva, "son of Vasudeva"; Madhava; Keshava, "of the beautiful hair"; Hari, a name of Vishnu; Parthasarathi, "charioteer of Arjuna"; Dwarkadhish, "lord of Dwarka". In Maharashtra he is Vitthal or Vithoba at Pandharpur, and at Puri he is Jagannath, "lord of the world".`,
            },
            {
              heading: 'Reading his image',
              body: `Krishna is usually shown dark blue or dark, a young cowherd standing with one leg crossed in front of the other, bent gracefully at neck, waist and knee, playing a flute. He wears a peacock feather in his crown, a yellow garment (pitambara), and a garland of forest flowers; often cows stand near him, and Radha beside him. As a child (Bal Gopal or Laddu Gopal) he crawls on hands and knees with a ball of butter in one hand.

Other forms are his too: the charioteer on the battlefield with Arjuna; the child lifting the mountain Govardhan on one finger; the standing Vitthal with hands on his hips; the great round-eyed wooden Jagannath of Puri with his brother Balabhadra and sister Subhadra. Devotees read his dark colour as the boundless sky, and his flute as the call of God to every soul.`,
            },
            {
              heading: 'Avatar, and God himself',
              body: `For many Hindus Krishna is the eighth of Vishnu's ten avatars, the forms God takes to restore dharma when it fails. In the Gita he says so himself: whenever right order declines, he comes, age after age, to protect the good. For many Vaishnava traditions, Krishna is more than an avatar: he is the Supreme God, Bhagavan, from whom Vishnu and all the avatars come. The Bhagavata Purana says it in a famous line: the others are portions, but Krishna is God himself.

Many Hindus also see Krishna, Vishnu, Shiva and the Goddess as faces of one divine reality, and worship them all. You do not need to settle these questions to begin; you will meet them as you learn.`,
            },
            {
              heading: 'Starting in the right place',
              body: `In the West many people first meet Krishna through the chanting of the Hare Krishna movement, through yoga classes that quote the Gita, or as a romantic blue-skinned flute player. Each of these touches something real, and none is the whole. For Hindus he is God, loved as a child, a friend, a beloved and a teacher, worshipped with care every day in homes and temples.

That should shape how you come to him: learn first, ask before you join in, and treat his image as you would treat something holy of your own. Krishna devotees are often among the most welcoming of Hindu communities: most temples hold kirtan, feasts and festivals open to all. If you can, go to one.`,
            },
          ],
          knowAndDont: {
            known:
              'His names, his iconography with flute, peacock feather, yellow garment and cows, his forms as Bal Gopal, Parthasarathi, Govardhandhari, Vitthal and Jagannath, his place as avatar of Vishnu, and the Bhagavata Purana’s verse that Krishna is Bhagavan himself (1.3.28) are standard in Hindu texts and living practice.',
            unknown:
              'How the hero Vasudeva-Krishna of the Mahabharata, the cowherd child of Braj and the Supreme God of later Vaishnavism came together is reconstructed by scholars from scattered evidence. Whether Vitthal and Jagannath were first other deities later identified with Krishna is debated.',
          },
          inPractice:
            'Find an image of Krishna you can treat with care: a framed print of Radha and Krishna, or a small murti (sacred image) of Bal Gopal from a Hindu shop or temple store. Learn to say his name: KRISH-nuh, with a short final vowel. Find out where your nearest Krishna or Vishnu temple is, and when it holds kirtan.',
          reflect: [
            'Krishna is loved as child, friend, beloved and teacher. Which of these draws you most, and why?',
            'What do you already assume about Krishna that you might need to unlearn?',
          ],
          further: [
            'Edwin F. Bryant, ed., Krishna: A Sourcebook (2007)',
            'John Stratton Hawley, Krishna, the Butter Thief (1983)',
          ],
          library: ['traditional/deity/krishna', 'traditional/deity/lakshmi'],
        },
      ],
      practices: [
        {
          id: 'krishna-shrine',
          title: 'Set up a small, clean shrine',
          instructions: `Choose a raised place: a shelf or small table, never the floor, and never a bathroom. Many families keep the shrine in the north-east of the home; do this if you can. Clean it and lay a fresh yellow cloth.

Set his image at the back. Families who keep a small murti of Bal Gopal often give him a little cushion or cradle, as one would a child. In front, place a small diya (oil lamp) with ghee on a heatproof plate, an incense holder, a dish for flowers and tulsi leaves, a small plate for food offerings and a cup of clean water. A small bell is customary to ring as you begin. If you can, keep a tulsi (holy basil) plant in a pot on a sunny windowsill; many Krishna devotees grow one and water it each morning.

Keep it simple and keep it clean. Take your shoes off before you approach it.`,
          times: 1,
          prompt: 'Where did you place his shrine, and what did you set before him?',
        },
      ],
      rite: {
        title: 'First Offering to Krishna',
        summary: 'A first short puja: wash, light the lamp, offer water, a tulsi leaf or flower and a little butter or sweet, greet him in your own words, and sit and listen.',
        minutes: 15,
        ingredients: [
          { name: 'Krishna’s image', ref: 'traditional/deity/krishna' },
          { name: 'A diya (small oil lamp) with ghee and a cotton wick, on a heatproof plate' },
          { name: 'A few tulsi (holy basil) leaves, or a fresh flower', ref: 'traditional/herb/basil' },
          { name: 'A little butter with a pinch of sugar (makhan-mishri), or a milk sweet', ref: 'traditional/vessel/dish' },
          { name: 'A cup of clean water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Sandalwood incense and a holder', ref: 'traditional/herb/sandalwood', optional: true },
          { name: 'A small bell', ref: 'traditional/tool/bell', optional: true },
        ],
        preparation:
          'Bathe or wash your hands, feet and face, and put on clean clothes. Remove your shoes. Clean the shrine. Do not eat meat or drink alcohol beforehand. If you have a tulsi plant, pick a few leaves in daylight, gently, the day before or that morning. Prepare the butter and sugar on a small clean dish without tasting it. Sit on a mat or cushion before the image.',
        steps: [
          {
            title: 'Settle',
            instructions: 'Sit quietly before him. Join your palms at your chest and take a few slow breaths.',
            minutes: 2,
          },
          {
            title: 'Ring and light',
            instructions: 'Ring the bell gently. Light the diya, then the incense.',
            light: true,
          },
          {
            title: 'Offer',
            instructions:
              'Offer water by holding the cup up a little and setting it down. Place a tulsi leaf on the butter or sweet and set it before him, then a flower or another leaf at his feet. Flowers are offered whole and unsmelled; food is offered untasted.',
            spoken: 'Krishna, dark one, Govinda,\nI bow to you.\nAccept this water, this leaf and this butter,\nas you accept whatever is given with love.',
          },
          {
            title: 'Greet him',
            instructions: 'Tell him simply who you are and why you have come: to learn, and to listen for the flute.',
            minutes: 3,
          },
          {
            title: 'Listen',
            instructions: 'Close your eyes. Listen to the sounds around you for a few minutes, as the gopis listened for his flute.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Bow with joined palms. Let the lamp burn while you are present, then put it out gently by covering it rather than blowing it out. Take the butter or sweet as prasad.',
            snuff: true,
            spoken: 'Thank you, Krishna. I will come again.',
          },
        ],
        closing:
          'Eat the offered food, or share it: what has been offered comes back as prasad, his grace. Return the leaf and flower to a plant pot or garden when they wilt; tulsi leaves are never thrown in the bin. Pour the water onto your tulsi plant or another plant. Write a few lines in your journal.',
        safety:
          'Set the diya and incense on a heatproof plate away from curtains, cloth and paper, and never leave them unattended. Keep flame, smoke and food away from pets and children.',
      },
    },
    {
      kind: 'study',
      title: 'Vrindavan and Kurukshetra',
      intro:
        'Three lessons: his childhood and youth in Braj as the Bhagavata Purana tells them; the Bhagavad Gita on the field of Kurukshetra; and the saints, temples and traditions of Krishna devotion. Light the lamp and offer a tulsi leaf before you study each day.',
      days: 12,
      lessons: [
        {
          id: 'krishna-vrindavan',
          title: 'The Butter Thief',
          summary: 'His birth at midnight, the cowherd village, Kaliya, Govardhan, the flute, the gopis and Radha.',
          minutes: 8,
          sections: [
            {
              heading: 'Born at midnight',
              body: `The tenth book of the Bhagavata Purana tells the story most devotees know. Kamsa, the tyrant king of Mathura, hears a prophecy that the eighth child of his sister Devaki will kill him. He imprisons Devaki and her husband Vasudeva and kills each child as it is born. The eighth is Krishna, born at midnight on the eighth day of the dark fortnight, in the prison. The guards fall asleep, the chains fall open, and Vasudeva carries the baby through the storm across the flooded Yamuna, the serpent Shesha sheltering him, to the cowherd village of Gokul. There he leaves him with Nanda and his wife Yashoda, and takes their newborn daughter back in his place.

So the God of the universe grows up as a cowherd's child, loved by a mother who does not know who he is. Devotees treasure that hiddenness.`,
            },
            {
              heading: 'The child of Gokul',
              body: `Krishna is a mischievous, irresistible child. He steals butter from the neighbours' pots and feeds it to the monkeys; the women complain to Yashoda and secretly adore him. When Yashoda ties him to a mortar to keep him out of trouble, the rope is always two fingers too short, until he lets himself be bound; so he is Damodara, "rope round the belly". When she looks into his mouth, thinking he has eaten dirt, she sees the whole universe there, and then forgets it again, because she is his mother.

Demons sent by Kamsa come for him and are defeated. In the river Yamuna he subdues the poisonous serpent Kaliya, dancing on its many heads until it yields, and sends it away rather than killing it. When the villagers stop their offerings to the rain god Indra and Indra sends a storm, Krishna lifts the hill Govardhan on one finger and shelters everyone beneath it for seven days.`,
            },
            {
              heading: 'The flute and the gopis',
              body: `As a youth in Vrindavan Krishna herds the cows in the forest and plays his flute, and the gopis, the cowherd women, leave everything to go to him. On an autumn full-moon night he dances the rasa lila with them in a circle, multiplying himself so that each one has him beside her. When they grow proud, he vanishes, and they search the forest for him in longing. The Bhagavata Purana tells this in five chapters (10.29–33), and they are among the most loved passages in Hindu scripture.

Devotees understand the gopis' love as the highest form of devotion: love for God that leaves behind every other concern, reputation and rule. Teachers say plainly that reading these stories as ordinary romance misses them entirely.`,
            },
            {
              heading: 'Radha',
              body: `Radha, the dearest of the gopis, is not named in the Bhagavata Purana, which speaks only of one gopi he takes with him. She is at the centre of later poetry: Jayadeva's Sanskrit Gita Govinda (twelfth century), still sung at the Jagannath temple in Puri, tells of their separation and reunion. For the Gaudiya Vaishnavas of Bengal, Radha is Krishna's own power of love, inseparable from him; the saint Chaitanya is held to be Radha and Krishna in one. At Barsana, her village in Braj, she is worshipped as a goddess in her own right.

Then Krishna leaves Vrindavan for Mathura, kills Kamsa, and never returns to Braj. The gopis' longing for him in his absence (viraha) is one of the great themes of Hindu devotional poetry.`,
            },
          ],
          knowAndDont: {
            known:
              'The birth in Mathura, the crossing of the Yamuna, the childhood in Gokul, the binding by Yashoda, Kaliya, Govardhan, the rasa lila (Bhagavata Purana 10.29–33), Jayadeva’s Gita Govinda, and Radha’s place in Gaudiya Vaishnavism are documented in the texts and in living practice.',
            unknown:
              'The Bhagavata Purana is usually dated to around the ninth or tenth century CE, but the date is debated; earlier versions of the childhood stories are in the Harivamsha and Vishnu Purana. How and when Radha entered the tradition is not clear. Details vary between texts and regions.',
          },
          inPractice:
            'Each day of this study stage, tell one of his childhood stories aloud in your own words before his shrine. Note which text it comes from. If you can, read the tenth book of the Bhagavata Purana in a translation, a few chapters a day; or, if you have a Hindu friend, ask which stories of Krishna their grandmother told.',
          reflect: [
            'Yashoda saw the universe in her child’s mouth, and forgot, because love mattered more. What do you love more than you need to understand?',
            'Krishna lifted the mountain to shelter everyone. Who has sheltered you, and whom do you shelter?',
          ],
          further: [
            'Edwin F. Bryant, trans., Krishna: The Beautiful Legend of God (Śrīmad Bhāgavata Purāṇa Book X) (Penguin, 2003)',
            'Barbara Stoler Miller, trans., Love Song of the Dark Lord: Jayadeva’s Gītagovinda (1977)',
          ],
          library: ['traditional/deity/krishna'],
        },
        {
          id: 'krishna-gita',
          title: 'The Song of God',
          summary: 'The Bhagavad Gita: the battlefield, action without attachment, devotion, and surrender.',
          minutes: 8,
          sections: [
            {
              heading: 'On the battlefield',
              body: `The Bhagavad Gita, "the song of the Lord", is a poem of about 700 verses in eighteen chapters, set within the Bhishma Parva of the Mahabharata. Two great armies of cousins, the Pandavas and the Kauravas, face each other on the field of Kurukshetra. The Pandava warrior Arjuna, seeing his teachers, uncles and cousins on the other side, drops his bow and refuses to fight. Krishna, who has chosen to be his unarmed charioteer, answers him.

The Gita is probably the best-known Hindu scripture in the world. It has been commented on by the great teachers Shankara, Ramanuja and Madhva, translated into Marathi verse by the saint Dnyaneshwar in the thirteenth century, and carried by Mahatma Gandhi, who called it his mother. Its date is uncertain; many scholars place it in the last centuries BCE.`,
            },
            {
              heading: 'Action without attachment',
              body: `Krishna's first answer is about duty and action. The self (atman) is never born and never dies; but Arjuna still has his part to play in the world. The most quoted verse (2.47) says, in the app's paraphrase: you have a right to your work, but never to its fruits; do not act for the reward, and do not cling to doing nothing either.

This is karma yoga, the discipline of action: doing what is right, as well as you can, and offering the results to God. Many Hindus who have never read the whole Gita know this teaching, and try to live it in ordinary work.`,
            },
            {
              heading: 'A leaf, a flower, a fruit, water',
              body: `The Gita also teaches knowledge (jnana) and meditation, and above all devotion (bhakti). In chapter 9 Krishna says (9.26, paraphrased) that whoever offers him with love a leaf, a flower, a fruit or a little water, he accepts that offering of love. It is one of the reasons Krishna devotees offer simple things, and believe that the love, not the gift, is what matters.

In chapter 11 Arjuna asks to see Krishna's universal form, and sees all the worlds and all of time within him, and is terrified; then he asks to see his friend's familiar face again. The Gita ends (18.66) with Krishna asking Arjuna to give up every other duty and take refuge in him alone, and promising to free him from all harm. Many devotees call it the heart of the whole book.`,
            },
            {
              heading: 'Reading the Gita well',
              body: `The Gita is read in many ways at once: as a guide to doing one's duty, as a book of philosophy, as a manual of meditation, as a love letter from God to the soul. Hindu teachers disagree about some of its meaning, and have done for over a thousand years. Its setting on a battlefield has also been read as an inner battle, as Gandhi read it, and as a real war, with real questions about violence.

The best way to read it is slowly, with a good translation and, if you can, with a teacher or a study group. Many temples and Vedanta and Vaishnava centres hold Gita classes open to all.`,
            },
          ],
          knowAndDont: {
            known:
              'The Gita’s place in the Bhishma Parva of the Mahabharata, its eighteen chapters, the teachings of verses 2.47, 9.26 and 18.66, the commentaries of Shankara, Ramanuja and Madhva, the Dnyaneshwari, and Gandhi’s devotion to it are documented.',
            unknown:
              'The Gita’s date and whether it was composed with the Mahabharata or added to it are debated. Its meaning, and the relation between action, knowledge and devotion in it, is understood differently by different Hindu schools.',
          },
          inPractice:
            'Read the Bhagavad Gita this week, two or three chapters a day, in a respected translation, sitting before his lamp: Edwin Arnold’s public-domain verse translation, The Song Celestial (1885), or a modern one such as Eknath Easwaran’s or Laurie Patton’s. You are reading to learn, not reciting; Sanskrit recitation of the Gita has its own rules and is learned from a teacher. Write down one verse each day that stays with you.',
          reflect: [
            'What work in your life could you do well without needing the reward?',
            'What does it mean to you that God accepts a leaf, given with love?',
          ],
          further: [
            'Edwin Arnold, trans., The Song Celestial, or Bhagavad-Gîtâ (1885; public domain)',
            'Laurie L. Patton, trans., The Bhagavad Gita (Penguin Classics, 2008)',
            'Richard H. Davis, The Bhagavad Gita: A Biography (2015)',
          ],
          library: ['traditional/deity/krishna'],
        },
        {
          id: 'krishna-saints',
          title: 'Saints, Temples and the Sound of His Name',
          summary: 'The poet-saints of Krishna, his great temples and pilgrimages, and Vaishnava traditions today.',
          minutes: 8,
          sections: [
            {
              heading: 'The poet-saints',
              body: `Krishna has drawn more poetry than perhaps any other form of God. In Tamil Nadu, the Alvars sang of Vishnu and Krishna; the woman saint Andal, perhaps of the eighth century, wrote the Tiruppavai, thirty verses sung every morning in the month of Margazhi (December to January). Jayadeva wrote the Gita Govinda in twelfth-century Bengal or Odisha. In the sixteenth century the Rajput princess Mirabai left her royal life for Krishna, and her songs of longing are sung across India; the blind poet Surdas sang of the child Krishna and of the gopis in Braj Bhasha. In Gujarat Narsinh Mehta, of the fifteenth century, wrote "Vaishnav Jan To", the song Gandhi loved.

In Maharashtra the Varkari saints, from Dnyaneshwar to Namdev and Tukaram (seventeenth century), sang to Vitthal of Pandharpur, whom they knew as Krishna.`,
            },
            {
              heading: 'Teachers and traditions',
              body: `Several great Vaishnava traditions centre on Krishna. Madhva (thirteenth century) installed the Krishna image at Udupi in Karnataka. Vallabha (1479–1531) founded the Pushtimarg, the "path of grace", which serves Krishna as a child with tender daily care; its great image, Shrinathji, has been worshipped at Nathdwara in Rajasthan since the seventeenth century. Chaitanya (1486–1534) of Bengal taught love of Radha and Krishna through sankirtana, the joyful public singing of God's names, and his followers, the Gaudiya Vaishnavas, rediscovered the holy places of Vrindavan.

In 1966 A. C. Bhaktivedanta Swami Prabhupada, a Gaudiya Vaishnava teacher, founded the International Society for Krishna Consciousness (ISKCON) in New York, and the chanting of "Hare Krishna" spread around the world. ISKCON is one tradition among many; most Krishna devotees worldwide belong to others, or simply to their family's practice.`,
            },
            {
              heading: 'Temples and pilgrimage',
              body: `Braj, the country of his childhood around Mathura and Vrindavan, is full of temples, among them Banke Bihari in Vrindavan; pilgrims walk round the hill of Govardhan barefoot. Dwarka in Gujarat is his kingdom by the sea. At Puri in Odisha he is Jagannath, and each summer at Rath Yatra the deities are pulled through the streets on huge wooden chariots, as they are now in cities around the world. At Guruvayur in Kerala he is worshipped as a child, and at Udupi a famous window, Kanakana Kindi, recalls the low-caste devotee Kanakadasa, for whom, it is said, the image turned around to give him sight of it when he was kept outside.

At Pandharpur in Maharashtra, hundreds of thousands of Varkari pilgrims walk for weeks, carrying the sandals of Dnyaneshwar and Tukaram in palanquins, to reach Vitthal on Ashadhi Ekadashi, in June or July.`,
            },
            {
              heading: 'The holy name',
              body: `For many Krishna devotees the simplest and highest worship is the name of God, sung together in kirtan or bhajan, or repeated quietly on a string of tulsi beads (japa). Chaitanya taught that in this age the name is enough, and that it belongs to everyone.

Kirtan, call-and-response singing with drums and hand cymbals, is open to all in most Krishna temples; you are welcome to sit and sing along with what everyone sings. Japa on beads, and the vows that go with it, are usually taken up with a teacher, and in some traditions with initiation. Join the singing; ask about the rest.`,
            },
          ],
          knowAndDont: {
            known:
              'The Alvars and Andal’s Tiruppavai, Jayadeva, Mirabai, Surdas, Narsinh Mehta, the Varkari saints and the Pandharpur wari, Madhva at Udupi, Vallabha and Shrinathji at Nathdwara, Chaitanya and the Gaudiya Vaishnavas, ISKCON’s founding in 1966, Rath Yatra at Puri, and Guruvayur are documented.',
            unknown:
              'Dates and life stories of many saints, including Andal and Mirabai, are traditional, and many songs attributed to Mirabai and Surdas were composed by later singers in their names. The Kanakadasa story is a beloved tradition rather than a recorded event.',
          },
          inPractice:
            'Visit a Krishna or Vishnu temple, or an ISKCON or other Vaishnava centre, if you can, for an evening arati or a Sunday kirtan and feast. Sit, listen, sing along when you are ready, and accept the prasad. Listen to a song of Mirabai or Surdas this week, and read its words in translation.',
          reflect: [
            'Mirabai left everything for Krishna. What would you find hardest to leave for love?',
            'Kanakadasa was kept outside, and God turned to face him. When have you been kept outside, and what turned toward you?',
          ],
          further: [
            'John Stratton Hawley and Mark Juergensmeyer, Songs of the Saints of India (1988)',
            'Graham M. Schweig, Dance of Divine Love: The Rāsa Līlā of Krishna from the Bhāgavata Purāṇa (2005)',
          ],
          library: ['traditional/deity/krishna', 'traditional/tool/bell'],
        },
      ],
      practices: [
        {
          id: 'krishna-daily-tulsi',
          title: 'Lamp, tulsi and a verse each day',
          instructions:
            'Each day, wash, light the diya and offer a tulsi leaf or flower and a cup of water. Water your tulsi plant if you have one. Read one verse of the Gita, or say his name a few times, before you study.',
          times: 12,
          every: 'day',
          prompt: 'One line: what did you learn about him today?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Eight Days to Midnight',
      intro:
        'For eight days, as Krishna was the eighth child born on an eighth day, you will offer a simple puja and sit with one of his stories each day, ending on the eighth evening with a vigil until midnight, the hour of his birth. If you can, keep these days ending on Janmashtami itself; otherwise end on an Ekadashi or any evening you can stay up. First read the lesson on honouring him at home.',
      days: 8,
      lessons: [
        {
          id: 'krishna-today',
          title: 'Honouring Him at Home Today',
          summary: 'His offerings and how to prepare them, his days and festivals, words and mantras, customs of respect.',
          minutes: 8,
          sections: [
            {
              heading: 'Tulsi, butter and the kitchen',
              body: `Tulsi, holy basil, is Krishna's own plant: worshipped as a goddess and as his beloved, grown in a pot in the courtyard or on a windowsill, watered and circled each morning. A tulsi leaf is placed on every food offering to him, and devotees wear necklaces and use beads of tulsi wood. Many families do not pick tulsi after dark or on Ekadashi, so leaves are gathered the day before.

His foods are those of a cowherd's child: butter, butter with sugar (makhan-mishri), milk, curd, kheer, milk sweets such as peda, and fruit. Panchamrit, a mixture of milk, curd, ghee, honey and sugar, is offered on festivals. Food cooked for him is made cleanly and with love, without tasting, and without meat, eggs, onion or garlic in many households. Once offered, it becomes prasad, and sharing it is part of the worship.`,
            },
            {
              heading: 'His days and festivals',
              body: `Janmashtami, his birthday, falls on the eighth day of the dark fortnight of Bhadrapada (by the reckoning that counts months from full moon to full moon), in August or September. Devotees fast, decorate a cradle, sing through the evening, and at midnight bathe the image of the child Krishna, rock the cradle and break the fast. The next day in Maharashtra teams form human pyramids to break high-hung pots of curd in Dahi Handi.

Ekadashi, the eleventh day of each fortnight, is a fast day for many Vaishnavas, without grains and beans. Holi is kept with special joy in Braj, with Lathmar Holi at Barsana and Nandgaon. Govardhan Puja, the day after Diwali, offers him a mountain of food (Annakut). Sharad Purnima recalls the rasa lila; Radhashtami honours Radha; and Gita Jayanti, on an Ekadashi in Margashirsha, honours the Gita. In Maharashtra many devotees keep Wednesday for Vitthal.`,
            },
            {
              heading: 'Words and mantras',
              body: `Hindus pray to Krishna in their own words, in bhajans and kirtans, in aratis such as "Aarti Kunj Bihari Ki", in stotras such as the Madhurashtakam ("everything about the lord of sweetness is sweet"), and with mantras. Names and songs sung openly at kirtan, including "Hare Krishna", are offered to everyone who comes, and you may sing them there. Mantras traditionally given by a guru at initiation, with instruction about how and when to say them, are not given here.

You can pray freely in your own language and say his names: Krishna, Govinda, Gopala, Madhava, Keshava, Hari, Shyam. If you want to recite in Sanskrit or sing in Hindi, Bengali or Marathi, ask a priest, teacher or Hindu friend; most will be glad you asked.`,
            },
            {
              heading: 'Customs of respect, and sensitive points',
              body: `Remove your shoes. Offer with the right hand or both hands, food untasted and flowers unsmelled. Keep meat, eggs, alcohol and tobacco away from the shrine, and keep onion and garlic out of his offerings. Keep his image raised, clean and out of bathrooms. If you keep a murti of the child Krishna, care for it gently and regularly, as devotees do, and do not leave it neglected.

Two sensitive points matter. First, the love stories: reading Krishna as a "playboy god" or the gopis' devotion as mere romance gives real offence, and misses what devotees see in them. Second, temple customs: some temples admit only Hindus, and some have their own dress codes. Respect them. Above all, go to a temple, a kirtan or a Janmashtami celebration, and learn from people.`,
            },
          ],
          knowAndDont: {
            known:
              'Tulsi, butter and milk sweets as his offerings, the avoidance of onion and garlic in many Vaishnava kitchens, Janmashtami at midnight, Dahi Handi, the Ekadashi fasts, Holi in Braj, Govardhan Puja and Annakut, Gita Jayanti, and the open singing of his names at kirtan are widespread in living practice.',
            unknown:
              'There is no single correct home puja; customs differ by family, region and sampradaya, and Janmashtami is often kept on different days by different communities. Views on who may chant which mantras, and on initiation, vary between Vaishnava traditions.',
          },
          inPractice:
            'Buy or grow a tulsi plant if you can. Gather butter, sugar and a few milk sweets, and plan a simple meal without onion or garlic for the eighth day. Clear the eighth evening so you can stay up until midnight. Fast lightly that day only if your health allows; if you are pregnant, diabetic, unwell, on medication or have a history of disordered eating, do not fast at all.',
          reflect: [
            'Krishna is offered the food of a cowherd’s child. What simple thing could you give with love today?',
            'Where have you seen his image or his stories used carelessly, and how did it feel to notice it?',
          ],
          further: [
            'C. J. Fuller, The Camphor Flame: Popular Hinduism and Society in India (1992; revised 2004)',
            'Diana L. Eck, Darśan: Seeing the Divine Image in India (1981)',
          ],
          library: ['traditional/deity/krishna', 'traditional/herb/basil', 'traditional/candle/blue'],
          premade: ['folk-diya-gayatri'],
        },
      ],
      practices: [
        {
          id: 'krishna-eight-days',
          title: 'Eight days to midnight',
          instructions: `Each day: wash, ring the bell, light the diya and incense, and offer water, a tulsi leaf or flower, and a little butter, milk sweet or fruit with a tulsi leaf on it. Sing or listen to one bhajan. Then sit with the day's story for ten minutes, and write.

Day 1, the birth in the prison: light that comes where it is least expected. Day 2, Yashoda and the rope: love that binds God, and what binds you. Day 3, the butter thief: joy, play and the sweetness you forget to enjoy. Day 4, Kaliya: the poison in your own waters, and how to send it away without hatred. Day 5, Govardhan: shelter, and the people you could shelter. Day 6, the flute: what calls you. Day 7, Kurukshetra: the duty you are avoiding, and how to do it without clinging to the result.

Day 8, midnight: in the evening, cook a simple meal without onion or garlic, offer it with a tulsi leaf, and eat it as prasad. Decorate his shrine with flowers. Sing, read his birth story or the Gita, and keep the lamp burning until midnight if you safely can. At midnight, bathe a small image of him gently with a few drops of water or milk, or simply offer a flower and a sweet, ring the bell, and welcome him.`,
          times: 8,
          every: 'day',
          prompt: 'Which story did you sit with today, and what did it show you?',
          premade: 'folk-diya-gayatri',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'After Midnight',
      intro:
        'Take a few days with only the daily lamp and tulsi leaf. Reread your journal. A vow of devotion is one good outcome; so is pausing, learning more at a temple first, or finding that your path lies elsewhere. Krishna accepts a leaf given with love; an honest answer is that kind of gift.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'krishna-reread',
          title: 'Read your journal back',
          instructions:
            'Read your journal from the first offering. Note what drew you, what surprised you, and what you learned from people rather than from screens. Then answer the questions below.',
          times: 1,
          prompt: 'What has this month taught you about Krishna, and about love?',
        },
      ],
      questions: [
        'Are you drawn to Krishna himself, as Hindus worship him, or to an idea of a romantic flute player or a source of wise quotations? Be honest; only the first is what this vow is for.',
        'Can you keep a small, clean daily practice (a lamp, a tulsi leaf, a verse or a song) and the customs of respect through an ordinary year?',
        'Have you visited a temple, a kirtan or a Janmashtami celebration, or spoken with Hindu devotees? If not, would it be better to do that before any vow?',
        'Would learning from a Hindu teacher or community, in time, serve your devotion better than a self-made vow? A vow now does not stop you doing that later.',
        'If you decide to wait, or stop, can you offer him a last leaf with thanks? That is a good ending too.',
      ],
    },
    {
      kind: 'dedication',
      title: 'A Vow of Devotion',
      intro:
        'If you choose to go on, this is a personal vow of devotion to Krishna, made in a simple puja. It is not dīkṣā, not an initiation into any Hindu tradition or lineage, and does not replace one; it does not make you a member of a sampradaya or give you anything a guru gives. It is your own promise of bhakti. An Ekadashi, a Purnima, Janmashtami or Gita Jayanti are fitting days.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Vow of Devotion to Krishna',
        summary: 'A full home puja with tulsi, flowers, butter and sweets, honouring Ganesha first, your own vow (sankalpa) of devotion, a song of his names, arati and the sharing of prasad.',
        minutes: 45,
        ingredients: [
          { name: 'Krishna’s image, cleaned and garlanded if you can', ref: 'traditional/deity/krishna' },
          { name: 'A fresh yellow cloth for the shrine' },
          { name: 'A diya with ghee and a cotton wick, on a heatproof plate' },
          { name: 'A plate for the arati lamp' },
          { name: 'Tulsi leaves, picked in daylight', ref: 'traditional/herb/basil' },
          { name: 'Fresh flowers or a small garland', ref: 'traditional/herb/jasmine' },
          { name: 'Sandalwood paste or a little sandalwood oil', ref: 'traditional/herb/sandalwood' },
          { name: 'Incense and a holder', ref: 'traditional/tool/incense_burner' },
          { name: 'Butter with sugar, a milk sweet or kheer, and fruit', ref: 'traditional/vessel/dish' },
          { name: 'A cup of clean water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A small bell', ref: 'traditional/tool/bell', optional: true },
          { name: 'Your vow, written on clean paper' },
        ],
        preparation: `During the day, write your vow. Keep it honest and keepable: what you will do (a daily lamp and tulsi leaf, reading the Gita, his Ekadashis, a temple visit or kirtan, Janmashtami each year), for how long (a year is common), and what you ask of him. Many people include a promise of service, such as feeding someone, or doing one task each day without wanting the reward.

Bathe, dress in clean clothes (yellow if you like), and remove your shoes. Clean the shrine and lay the fresh cloth. Prepare the food without tasting it, and without onion or garlic.`,
        steps: [
          {
            title: 'Begin with Ganesha',
            instructions: 'Sit before the shrine. Join your palms and breathe. Ring the bell. Many Hindus honour Ganesha first at the start of any puja; offer him a flower and a bow.',
            spoken: 'Ganesha, remover of obstacles, I bow to you first.',
          },
          {
            title: 'Light and fragrance',
            instructions: 'Light the diya and the incense. Touch a little sandalwood paste to the base of his image or its frame.',
            light: true,
          },
          {
            title: 'Tulsi and flowers',
            instructions: 'Offer the tulsi leaves and flowers one at a time, saying one of his names with each.',
            spoken: 'Krishna. Govinda. Gopala. Madhava. Keshava. Hari. Shyamsundar…',
            minutes: 5,
          },
          {
            title: 'Food and water',
            instructions:
              'Set the butter, sweets and fruit before him, each with a tulsi leaf on it, with the cup of water. Sprinkle a few drops of water around the food.',
            spoken: 'A leaf, a flower, a fruit, a little water:\nthis is what I have, Krishna.\nAccept it with my love,\nand let it come back to us as your grace.',
          },
          {
            title: 'The vow',
            instructions:
              'Take a little water in your right palm. Read your vow aloud, slowly. Let the water fall onto the plate beneath him, as a sign that the intention is made. Place the paper at his feet.',
            minutes: 5,
          },
          {
            title: 'Sing his names',
            instructions: 'Sing or say his names, or a bhajan you have learned, for a few minutes, as at kirtan.',
            minutes: 5,
          },
          {
            title: 'Arati',
            instructions:
              'Light the arati lamp from the diya. Wave it slowly in clockwise circles before him, from his feet to his face, while you sing or hum. Then pass your hands over the flame and touch them to your eyes and the top of your head.',
            minutes: 3,
          },
          {
            title: 'Sit with him',
            instructions: 'Sit in silence before him for a while, and listen.',
            minutes: 8,
            timed: true,
          },
          {
            title: 'Close and share prasad',
            instructions:
              'Bow fully, or with joined palms. Take a little of the food as prasad and share the rest with others today. Let the lamp burn while you are present, then cover it gently.',
            snuff: true,
            spoken: 'Thank you, Krishna. I am yours. I will keep my word.',
          },
        ],
        closing:
          'Keep your vow folded near his shrine and read it each Janmashtami. Share the prasad; feeding others is part of his worship. Return the flowers and tulsi to the earth. Write the date in your journal. If you can, go to a kirtan or a temple in the coming week.',
        safety:
          'Keep the diya, arati lamp and incense on heatproof plates, away from cloth, garlands, hair and loose sleeves, and never leave them unattended. If you use camphor for arati, burn only a small piece on a metal plate, keep it from children and pets, and never eat it. Keep sweets with chocolate, raisins or xylitol away from dogs and cats.',
      },
    },
    {
      kind: 'ongoing',
      title: 'The Year of the Cowherd',
      intro:
        'After the vow, devotion is daily and yearly: a lamp and tulsi leaf, a verse or a song, his Ekadashis, Janmashtami and his other festivals, temple visits and kirtan, and a yearly renewal of your vow.',
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'krishna-daily',
          title: 'Daily lamp and tulsi',
          instructions: 'Each morning, wash, water your tulsi plant, light the lamp, offer a tulsi leaf and water, and read a verse of the Gita or sing his name.',
          times: 365,
          every: 'day',
        },
        {
          id: 'krishna-ekadashi',
          title: 'Ekadashi each month',
          instructions:
            'On an Ekadashi each month (the app’s Hindu calendar shows them), offer a fuller puja with tulsi, flowers and a sweet, read a chapter of the Gita or a story of his childhood, and go to a kirtan if you can. Fast from grains and beans only if your health allows.',
          times: 12,
          every: 'month',
          prompt: 'What did you give this month without wanting the reward?',
        },
        {
          id: 'krishna-festivals',
          title: 'Janmashtami and Holi',
          instructions: `Each year, keep Janmashtami in August or September: fast lightly if your health allows, decorate a cradle or his shrine, sing until midnight, and welcome his birth, at home or at a temple. In spring, keep Holi with joy, and if you can, with a Krishna community. If you wish, add Govardhan Puja after Diwali, with a small "mountain" of food shared afterwards.`,
          times: 2,
          every: 'holy-day',
          prompt: 'What did his festival, and the people you kept it with, show you this year?',
        },
        {
          id: 'krishna-renewal',
          title: 'Yearly renewal',
          instructions:
            'On the anniversary of your vow, or at Janmashtami, reread it, write it anew, and repeat the vow puja. Change it honestly. If you are ending it, offer a last tulsi leaf and sweet with thanks, take down the shrine with care, and give the image to a temple.',
          times: 1,
          prompt: 'What has a year with Krishna changed in you?',
        },
      ],
    },
  ],
  sources: [
    'Bhagavata Purana, Book 10, for the birth, childhood and youth of Krishna, and 1.3.28, paraphrased; translated in Edwin F. Bryant, Krishna: The Beautiful Legend of God (2003)',
    'Bhagavad Gita 2.47, 4.7–8, 9.26 and 18.66, paraphrased; Edwin Arnold, trans., The Song Celestial (London, 1885; public domain); Laurie L. Patton, trans., The Bhagavad Gita (2008)',
    'Barbara Stoler Miller, trans., Love Song of the Dark Lord: Jayadeva’s Gītagovinda (1977); Graham M. Schweig, Dance of Divine Love (2005)',
    'Edwin F. Bryant, ed., Krishna: A Sourcebook (2007); John Stratton Hawley, Krishna, the Butter Thief (1983); David R. Kinsley, The Sword and the Flute (1975)',
    'John Stratton Hawley and Mark Juergensmeyer, Songs of the Saints of India (1988); Richard H. Davis, The Bhagavad Gita: A Biography (2015)',
    'C. J. Fuller, The Camphor Flame (1992); Diana L. Eck, Darśan (1981) and India: A Sacred Geography (2012)',
  ],
};
