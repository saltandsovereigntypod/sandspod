import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-shiva',
  kind: 'deity',
  paths: ['hindu'],
  deityRef: 'traditional/deity/shiva',
  title: 'Shiva: The Auspicious One',
  summary:
    'A devotional month with Shiva, Mahadeva, the great god. Learn his names and forms, from Vedic Rudra to the Lord of the Dance, the stories of the Shiva Purana, the saints who sang to him, how Mondays, Pradosh and Maha Shivaratri are kept, and how to offer water and bilva leaves at home, then decide whether to make a personal vow of devotion.',
  welcome: `This journey spends about a lunar month learning about Shiva and offering him simple devotion (bhakti) at home. For hundreds of millions of Hindus he is Mahadeva, the great god, and for Shaiva Hindus he is the Supreme God himself, worshipped in homes and in temples from Kashmir to Sri Lanka, from Kathmandu to Mauritius, and wherever Hindus have settled.

You will learn his names and his many forms, the stories told of him in the Puranas, the poet-saints and teachers who loved him, how his days and his great night, Maha Shivaratri, are kept, and how to make a small home puja with his own offerings: water, bilva leaves and white flowers. For eight days you will sit with one of his forms each day, ending with a short night's vigil. At the end you may make a personal vow of devotion, or not.

Please read this plainly. This is not an initiation. Formal initiation (dīkṣā) and mantras traditionally given by a guru are not offered here and cannot be given by an app. Nothing here is "magic" or a spell; it is devotion. The best thing this journey can do is send you to a Shiva temple, a Maha Shivaratri vigil or a Hindu friend's home, to learn from the people whose religion this is.`,
  about: `Shiva (Śiva, "auspicious, kind") is one of the principal deities of Hinduism, called Mahadeva ("great god"), Shankara ("maker of peace"), Shambhu, Mahesha and, with affection, Bholenath ("the simple lord"). He grew from the Vedic Rudra, a fierce god of storms and healing, into the Supreme God of the Shvetashvatara Upanishad, the Puranas and the Shaiva traditions. He is pictured as an ascetic yogi with matted hair holding the river Ganga and a crescent moon, a third eye, a blue throat, a serpent at his neck and ash on his body, carrying a trident and a small drum, with his bull Nandi; and as Nataraja, lord of the dance, in a ring of fire. In temples he is worshipped above all as the linga, a smooth rounded pillar that devotees understand as the sign of the formless divine. He is the husband of Parvati and father of Ganesha and Kartikeya. His devotees range from householders who pour water on the linga each Monday to great philosophical schools, Tamil poet-saints, the Lingayats of Karnataka and the ascetics of the Kumbh Mela.`,
  notes: [
    'Hinduism is a living religion. Shiva belongs first to the Hindu families, temples and teachers who worship him. This journey is a respectful introduction and an invitation to learn from them, not a replacement.',
    'Dīkṣā (formal initiation) and mantras traditionally given by a guru are not offered here. Where Hindu prayers are mentioned, the app gives its own English words. Learn Sanskrit prayers, and their pronunciation and proper use, from a priest, teacher or family.',
    'This is devotion, not magic. Please do not use Shiva, his image, the linga or his names in spells, or treat his image as décor or as a symbol of "destruction" for its own sake.',
    'The linga is the most sacred form of Shiva for his devotees. Speak of it with the reverence they do; older Western accounts that reduced it to a crude sexual symbol caused, and still cause, real offence. The lesson on the linga explains it honestly.',
    'Offerings are vegetarian: no meat, fish, eggs or alcohol. Tulsi (holy basil) and ketaki flowers are traditionally not offered to Shiva, and many families do not put turmeric or kumkum on the linga.',
    'Datura flowers and fruit, offered to Shiva in some temples, are highly poisonous; do not pick, handle or take them. Bhang (cannabis) is drunk by some at Maha Shivaratri and Holi; it is no part of devotion, is illegal in many places, and has no place in this journey.',
    'The app can show the Hindu lunar calendar (panchang): tick it under "Also show" in "Calendar & holidays". It marks Maha Shivaratri and Amavasya, and Pradosh if you choose "Mark Pradosh" there. The monthly Shivaratri, the fourteenth of each dark fortnight, you will find in a printed panchang. Panchangs, regions and countries can differ by a day; confirm with your local temple.',
    'Safety: fasting is never required. If you are pregnant, diabetic, unwell, on medication or have a history of disordered eating, do not fast. Keep lamps, camphor and incense on heatproof plates and attended.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'At Nandi’s Side',
      intro:
        'Begin by learning who Shiva is, set up a small clean shrine, and offer a first simple puja: a lamp, water poured with care, three bilva leaves or a white flower, and a few minutes of stillness.',
      days: 3,
      lessons: [
        {
          id: 'shiva-who',
          title: 'Mahadeva',
          summary: 'His names, his image and what it shows, and his place in Hindu religion.',
          minutes: 7,
          sections: [
            {
              heading: 'His names',
              body: `Shiva means "auspicious", "kind", "gracious". The name was first an epithet of the Vedic god Rudra, a way of speaking well of a fierce god, and it became his own. Mahadeva means "great god"; Shankara, "maker of peace" or "maker of good"; Shambhu, "source of happiness". Mahesha and Maheshvara mean "great lord"; Ishvara, simply "the Lord". In North India people call him Bholenath, "the simple, innocent lord", because he is easily pleased by a sincere heart.

Many names come from his image and his stories: Nilakantha ("blue throat"), Gangadhara ("bearer of the Ganga"), Chandrashekhara ("crowned with the moon"), Nataraja ("king of dancers"), Pashupati ("lord of creatures"), Tryambaka ("three-eyed"), Ardhanarishvara ("the lord who is half woman"). Lists of 108 and 1,008 names are recited by devotees.`,
            },
            {
              heading: 'Reading his image',
              body: `Shiva is usually pictured as a yogi. He sits on a tiger skin in the snows of Mount Kailash, his body smeared with sacred ash (vibhuti), his matted hair piled up, with the river Ganga flowing from it and a crescent moon tucked into it. He has a third eye on his forehead, a serpent around his neck and a blue-dark throat. He holds a trident (trishula) and a small hourglass drum (damaru). Beside him lies or stands Nandi, the white bull, who is also his devoted doorkeeper. Often Parvati sits with him, and their sons Ganesha and Kartikeya.

Devotees and teachers read these details richly: the ash as the end of all things and freedom from vanity, the third eye as the eye of wisdom that burns desire, the serpent as mastered fear, the trident as the three qualities of nature or the three times. Some of these readings are old and some modern; all are taught with love.`,
            },
            {
              heading: 'Supreme God, and one of three',
              body: `You may read that Hinduism has a "trinity": Brahma who creates, Vishnu who sustains and Shiva who destroys. This idea (the trimurti) is real, but it is a simplification. For Shaiva Hindus, Shiva is the Supreme God who does all five of God's acts: creating, sustaining, dissolving, concealing and revealing by grace. For Vaishnava Hindus Vishnu is supreme, and for Shaktas the Goddess. Many Hindus worship all of them and see them as faces of one divine reality.

The word often translated "destroyer" is better understood as "dissolver". Shiva ends what has run its course, so that it can begin again, and he destroys ignorance and ego rather than the world for its own sake.`,
            },
            {
              heading: 'Starting in the right place',
              body: `Shiva's image is popular far beyond Hinduism, on posters, tattoos and yoga studio walls, and it is easy to meet him first as an aesthetic: the cool ascetic, the dancer, the "destroyer". For Hindus he is God, worshipped with love every day. That should shape how you come to him: learn first, ask before you join in, and treat his image, and above all the linga, as you would treat something holy of your own.

Shiva temples are usually welcoming to respectful visitors, and Maha Shivaratri, with its night of chanting and worship, is a good time to see devotion to him at its fullest.`,
            },
          ],
          knowAndDont: {
            known:
              'His names, his ascetic iconography with Ganga, moon, third eye, serpent, trident, drum and Nandi, his family, and the Shaiva view of him as Supreme God performing five acts are standard in Hindu texts and living practice. The trimurti appears in the Puranas.',
            unknown:
              'Many explanations of his symbols vary by teacher and tradition. The trimurti was never the main way most Hindus worshipped, and its importance is easily overstated in Western books.',
          },
          inPractice:
            'Find an image of Shiva you can treat with care: a framed print of Shiva with Parvati, or a small murti (sacred image) from a Hindu shop or temple store. Learn to say his name: SHIV, or SHI-vuh with a short final vowel. Find out where your nearest Shiva temple is; many Hindu temples have a shrine to him.',
          reflect: [
            'What in your life has had to end so that something better could begin?',
            'What do you already assume about Shiva that you might need to unlearn?',
          ],
          further: [
            'Gavin Flood, An Introduction to Hinduism (1996), ch. 7',
            'Stella Kramrisch, The Presence of Śiva (1981)',
          ],
          library: ['traditional/deity/shiva', 'traditional/deity/ganesha', 'traditional/deity/durga'],
        },
      ],
      practices: [
        {
          id: 'shiva-shrine',
          title: 'Set up a small, clean shrine',
          instructions: `Choose a raised place: a shelf or small table, never the floor, and never a bathroom. Many families keep the shrine in the north-east of the home; do this if you can. Clean it and lay a fresh white or saffron cloth.

Set his image at the back. Most families keep a picture or murti of Shiva, often with Parvati and their children. Some keep a small stone linga; families commonly say a linga at home should be small and must be worshipped every day, so ask a priest before you bring one home, and start with an image. In front, place a small diya (oil lamp) on a heatproof plate, an incense holder, a small brass or steel pot (lota) of clean water with a plate or bowl to catch it, a dish for leaves and flowers, and a little vibhuti (sacred ash) if you have it. A small bell is customary.

Keep it simple and keep it clean. Take your shoes off before you approach it.`,
          times: 1,
          prompt: 'Where did you place his shrine, and what is the room like when it is quiet?',
        },
      ],
      rite: {
        title: 'First Water for Shiva',
        summary: 'A first short puja: wash, light the lamp, pour water with care, offer bilva leaves or a white flower, greet him, and sit in stillness.',
        minutes: 15,
        ingredients: [
          { name: 'Shiva’s image', ref: 'traditional/deity/shiva' },
          { name: 'A diya (small oil lamp) with ghee or sesame oil and a cotton wick, on a heatproof plate' },
          { name: 'A small pot (lota) of clean water, and a bowl or plate to catch it', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Three bilva (bael) leaves, each with three leaflets, or a white flower such as jasmine', ref: 'traditional/herb/jasmine' },
          { name: 'Sandalwood incense and a holder', ref: 'traditional/herb/sandalwood', optional: true },
          { name: 'A small bell', ref: 'traditional/tool/bell', optional: true },
        ],
        preparation:
          'Bathe or wash your hands, feet and face, and put on clean clothes. Remove your shoes. Clean the shrine. Do not eat meat or drink alcohol beforehand. If you have bilva leaves, wash them and check each has its three leaflets whole. Sit on a mat or cushion before the image.',
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
            title: 'Pour water',
            instructions:
              'Hold the pot in both hands and pour a thin, steady stream of water into the bowl before his image (or over the linga, if you keep one), slowly, without splashing. Water poured in this way, abhisheka, is his most loved offering.',
            spoken: 'Shiva, auspicious one,\nMahadeva, I bow to you.\nAccept this water.',
            minutes: 2,
          },
          {
            title: 'Leaves and flower',
            instructions:
              'Offer the bilva leaves one at a time, stems toward you, leaflets toward him, or the white flower. Flowers are offered whole and unsmelled.',
          },
          {
            title: 'Greet him',
            instructions: 'Tell him simply who you are and why you have come: to learn, and to be still.',
            minutes: 3,
          },
          {
            title: 'Be still',
            instructions: 'Close your eyes and sit in silence. Let your breath slow. When thoughts come, let them pass like water.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Bow with joined palms. Touch a little vibhuti to your forehead if you have it. Let the lamp burn while you are present, then put it out gently by covering it rather than blowing it out.',
            snuff: true,
            spoken: 'Thank you, Shiva. I will come again.',
          },
        ],
        closing:
          'Pour the offered water onto a plant or the earth, not down a drain. Return the leaves or flower to a garden or plant pot when they wilt. Write a few lines in your journal.',
        safety:
          'Set the diya and incense on a heatproof plate away from curtains, cloth and paper, and never leave them unattended. Keep flame and smoke away from pets and children.',
      },
    },
    {
      kind: 'study',
      title: 'Rudra, the Linga and the Dance',
      intro:
        'Three lessons: where his worship came from and what the linga means; the great stories of the Puranas; and the saints, teachers and holy places of Shaiva devotion. Pour water and offer a leaf before you study each day.',
      days: 12,
      lessons: [
        {
          id: 'shiva-history',
          title: 'From Rudra to the Linga',
          summary: 'The Vedic Rudra, the Shri Rudram, the Upanishad that names him God, and the linga honestly explained.',
          minutes: 8,
          sections: [
            {
              heading: 'Rudra',
              body: `In the Rig Veda, the oldest Hindu scripture, Rudra is a fierce, unpredictable god of storms and wild places, a great archer whose arrows bring sickness, and also a healer. A hymn to him (Book 2, Hymn 33) calls him the best physician among physicians and asks him to spare the worshipper's children and cattle. People feared him and prayed to him for kindness. Shiva, "the kind one", was one of the names they used.

In the Yajur Veda, the Shatarudriya or Shri Rudram, a long litany saluting Rudra in all his forms, is still chanted in Shiva temples every day. It contains the words "namaḥ śivāya", "reverence to the auspicious one", the root of the five-syllable prayer "Om Namah Shivaya".`,
            },
            {
              heading: 'The Upanishad and the Puranas',
              body: `The Shvetashvatara Upanishad, composed some centuries BCE, is the first text to praise Rudra-Shiva as the one supreme God, the lord who is both the source of the world and the ground of liberation, known through meditation and grace. It is short, and readable in translation; it is a good place to start.

The Puranas, composed and gathered over many centuries in the first millennium CE and after, tell his stories at length. The Shiva Purana and Linga Purana are wholly devoted to him; the Skanda Purana, the largest of the Puranas, is full of his holy places. Devotees read them as sacred history; scholars read them as layered texts; both readings can help.`,
            },
            {
              heading: 'The linga',
              body: `In almost every Shiva temple the central image is not a figure but the linga: a smooth, rounded upright stone set in a base (the pitha or yoni) with a spout to let offered water run off. Linga means "mark" or "sign". For devotees it is the sign of Shiva without form, the infinite that no image can contain, and it is bathed, garlanded and worshipped with deep love. Some lingas are natural stones, such as the bana lingas from the Narmada river; the ice linga at Amarnath forms each year in a cave in Kashmir.

The Shiva Purana explains it with a story. Brahma and Vishnu were arguing over which of them was greater when an endless pillar of fire appeared between them. Vishnu became a boar and dug down to find its base; Brahma became a swan and flew up to find its top. Neither could. Shiva appeared from the pillar, and the linga is that pillar of light. Shiva temples show this scene as Lingodbhava, "the appearance of the linga".`,
            },
            {
              heading: 'An honest note',
              body: `The linga also has a history of being misunderstood. Some old Puranic stories link it with Shiva's body, and many scholars connect its form with fertility and creative power. Nineteenth-century missionaries and colonial writers seized on this to mock Hindu worship as crude, and some later Western books repeated them. Hindus have long objected to that reduction.

The fair thing is to hold both: the linga can carry meanings of creation and fertility, as many sacred symbols do, and for devotees it is above all a sign of the formless God. Speak of it as they do, with reverence. A very early example, the Gudimallam linga in Andhra Pradesh, perhaps from the second or first century BCE, has a figure of Shiva carved on it, standing on a dwarf.`,
            },
          ],
          knowAndDont: {
            known:
              'Rudra’s Rig Veda hymns (including 2.33 calling him the best physician), the Shatarudriya in the Yajur Veda with namaḥ śivāya, the Shvetashvatara Upanishad’s praise of Rudra-Shiva as supreme, the Shiva and Linga Puranas, the Lingodbhava story, and the Gudimallam linga are documented.',
            unknown:
              'How the Vedic Rudra became the Shiva of the Upanishad and Puranas is reconstructed from scattered evidence. A seal from the Indus Valley civilisation has been called "proto-Shiva", but that reading is widely disputed. The dates of the Upanishad and Puranas are uncertain, and the meaning of the linga is understood differently by devotees and by many scholars.',
          },
          inPractice:
            'Read the Shvetashvatara Upanishad in translation this week, a chapter a day, sitting before his lamp. You are reading to learn, not reciting; formal recitation of the Rudram and the Upanishads has its own rules and is learned from a teacher. Write down one line each day that stays with you.',
          reflect: [
            'Neither Brahma nor Vishnu could find the end of the pillar of light. What in your life is bigger than you can measure?',
            'How do you feel about a God first prayed to in fear, and then known as the kind one?',
          ],
          further: [
            'Ralph T. H. Griffith, trans., The Hymns of the Rigveda (1889–92; public domain), Book 2, Hymn 33',
            'Patrick Olivelle, trans., Upaniṣads (Oxford World’s Classics, 1996), the Śvetāśvatara',
            'Gavin Flood, ed., The Blackwell Companion to Hinduism (2003)',
          ],
          library: ['traditional/deity/shiva'],
        },
        {
          id: 'shiva-stories',
          title: 'The Blue Throat and the River',
          summary: 'The poison he drank, the river he caught, Sati and Parvati, the dance, and the half-woman lord.',
          minutes: 8,
          sections: [
            {
              heading: 'Nilakantha',
              body: `When the gods and asuras churned the ocean of milk for the nectar of immortality, the first thing to rise was not nectar but halahala, a poison so terrible that it began to burn the worlds. Everyone fled to Shiva. Out of compassion he gathered the poison in his hand and drank it. Parvati, in many tellings, pressed his throat so it would not go down, and it stayed there, turning his throat blue. So he is Nilakantha, "blue throat". The story is told in the Bhagavata Purana (Book 8) and elsewhere.

Devotees love this story because it shows who he is: the one who takes on what no one else can bear, for everyone's sake, and is not destroyed by it.`,
            },
            {
              heading: 'The descent of the Ganga',
              body: `King Bhagiratha practised long austerities to bring the heavenly river Ganga down to earth, so that her waters could free the souls of his ancestors. But the force of her fall would have shattered the earth. Shiva agreed to receive her. He stood beneath the sky and caught the river in his matted hair, and let her flow out gently in streams. That is why the Ganga flows from his hair, and why he is Gangadhara.

The story is told in the Ramayana (Bala Kanda) and the Puranas. "Bhagiratha's effort" is still a Hindu phrase for an enormous, patient labour.`,
            },
            {
              heading: 'Sati and Parvati',
              body: `Shiva's first wife was Sati, daughter of Daksha. Daksha despised his ascetic son-in-law and held a great sacrifice to which Shiva was not invited. Sati went anyway, was insulted, and gave up her life there. In grief and fury Shiva destroyed the sacrifice and wandered the world carrying her body; in the Shakta tradition, the places where parts of her body fell became the Shakti Pithas, the seats of the Goddess.

Sati was reborn as Parvati, daughter of the mountain Himalaya. Shiva was lost in meditation and would not look at her. When the god of love, Kama, shot him with an arrow of desire, Shiva burned Kama to ash with his third eye. Parvati then won him not by beauty but by her own austerities, until he came to her in disguise to test her and then revealed himself. Kalidasa's great poem Kumarasambhava ("the birth of the war god"), from about the fifth century, tells this story.`,
            },
            {
              heading: 'The dance and the half-woman lord',
              body: `As Nataraja, king of dancers, Shiva dances in a ring of flame. In the classic South Indian bronzes of the Chola period (tenth to twelfth centuries), one hand holds the drum whose beat begins creation, one holds the fire that dissolves it, one is raised in the gesture "do not fear", and one points to his raised foot, the refuge of devotees. He stands on a small figure, Apasmara, ignorance. The great temple of the dancing Shiva is at Chidambaram in Tamil Nadu.

As Ardhanarishvara, "the lord who is half woman", he is shown with the right half of his body male and the left half Parvati: Shiva and Shakti, the divine and its power, never apart. As Dakshinamurti he is the silent teacher sitting under a banyan tree, teaching sages by stillness alone.`,
            },
          ],
          knowAndDont: {
            known:
              'The Nilakantha story in the Bhagavata Purana, the descent of the Ganga in the Ramayana and Puranas, the stories of Sati, Daksha and Parvati, Kalidasa’s Kumarasambhava, the Chola Nataraja bronzes and Chidambaram, and the Ardhanarishvara and Dakshinamurti forms are documented.',
            unknown:
              'The stories exist in many versions and the Puranas are hard to date. The popular symbolic reading of every detail of the Nataraja owes much to the twentieth-century writer Ananda Coomaraswamy as well as to Tamil Shaiva texts. Which details are oldest is debated.',
          },
          inPractice:
            'Each day of this study stage, tell one of his stories aloud in your own words before his shrine. Note which text it comes from. If you can, look closely at a Chola bronze of Nataraja, in a museum or a good photograph, and find each detail in it.',
          reflect: [
            'Shiva drank the poison so others would not have to. Who has done that for you, and when have you done it?',
            'Parvati won Shiva through her own discipline, not her beauty. What have you won through patience?',
          ],
          further: [
            'Ananda K. Coomaraswamy, The Dance of Śiva (1918)',
            'David Smith, The Dance of Siva: Religion, Art and Poetry in South India (1996)',
          ],
          library: ['traditional/deity/shiva', 'traditional/deity/lakshmi', 'traditional/deity/durga'],
        },
        {
          id: 'shiva-devotees',
          title: 'Saints, Schools and Holy Places',
          summary: 'The Tamil Nayanars, Basava and the Lingayats, Kashmir Shaivism, Varanasi and the Jyotirlingas.',
          minutes: 7,
          sections: [
            {
              heading: 'The Nayanars',
              body: `In Tamil Nadu, from about the sixth to the ninth century, poet-saints called the Nayanars wandered from temple to temple singing to Shiva. Sixty-three are honoured, men and women of every caste. The hymns of three of them, Appar, Sambandar and Sundarar, gathered as the Tevaram, are sung in Tamil Shiva temples today. Manikkavacakar's Tiruvacakam, full of longing and tenderness, is another treasured collection.

Their stories are told with love. Kannappa was a hunter who knew nothing of rituals. He offered Shiva meat from his hunt and water carried in his mouth; when he saw the linga's eye bleeding, he offered his own eye, and was about to give the second when Shiva stopped him. The story is told to say that love, not correct ritual, is what Shiva sees. It is honoured as a story of the heart, not as a model for offerings.`,
            },
            {
              heading: 'Basava and the Lingayats',
              body: `In twelfth-century Karnataka, Basava (Basavanna), a minister at the court of Kalyana, led a movement of devotion that rejected caste, temple ritual and priestly control. His followers, the Lingayats or Virashaivas, each wear a small linga, the ishtalinga, on the body, and worship it themselves daily. Basava, Allama Prabhu and the woman saint Akka Mahadevi wrote vachanas, short, direct poems in Kannada, which are still widely read.

The Lingayats are a large and living community today, with their own teachers and questions about their relationship to Hinduism, which they discuss among themselves.`,
            },
            {
              heading: 'Schools of thought',
              body: `Shaivism has some of the richest philosophy in India. Shaiva Siddhanta, strong in Tamil Nadu, teaches that souls are bound and are freed by Shiva's grace through devotion, ritual and knowledge. In Kashmir, teachers such as Abhinavagupta (about 950–1016) developed a philosophy, often called Kashmir Shaivism, in which everything is the play of one consciousness, Shiva, and his power, Shakti. The Pashupatas and other ascetic orders kept stricter paths.

Today Shiva is worshipped by householders and by sannyasis (renunciants), including the ash-smeared Naga sadhus seen at the Kumbh Mela. Most devotees, though, are ordinary families pouring water on the linga on Mondays.`,
            },
            {
              heading: 'Holy places',
              body: `Varanasi (Kashi) is Shiva's own city, where the Kashi Vishwanath temple stands on the Ganga; many Hindus hope to die there. Twelve Jyotirlingas, "lingas of light", are especially holy, among them Somnath in Gujarat, Mahakaleshwar in Ujjain, Kedarnath in the Himalaya, Kashi Vishwanath, Rameshwaram in Tamil Nadu and Trimbakeshwar near Nashik; the locations of one or two are disputed between sites. Mount Kailash in Tibet is his mountain home, and Pashupatinath in Kathmandu his great temple in Nepal. In Tamil Nadu, the Brihadishvara temple at Thanjavur, built by Rajaraja Chola around 1010, and Arunachaleshvara at Tiruvannamalai, where the hill itself is the linga of fire, draw huge crowds.

In a Shiva temple, greet Nandi, who faces the shrine, before you go in; many people look at the linga between his horns. Many devotees walk only half-way round the shrine and turn back, so as not to step over the channel carrying the linga's offered water.`,
            },
          ],
          knowAndDont: {
            known:
              'The Nayanars and the Tevaram, Manikkavacakar, the Kannappa story, Basava and the Lingayat vachanas, Shaiva Siddhanta, Abhinavagupta, the Jyotirlinga tradition, and the temples named are documented, and the temple customs described are widely observed.',
            unknown:
              'Dates of many saints are traditional. The lists of Jyotirlingas agree on most sites but not all. Whether Lingayats are a part of Hinduism is a live question within that community, not one for an outsider to settle.',
          },
          inPractice:
            'Visit a Shiva temple, or the Shiva shrine of a Hindu temple, if you can, on a Monday evening. Greet Nandi first, watch how people offer water and leaves, and notice how they walk around the shrine. Read a few vachanas of Basava or Akka Mahadevi in translation.',
          reflect: [
            'Kannappa knew no rules, only love. Where do you lean too hard on getting things right?',
            'Which of these saints or teachers would you most like to learn from, and why?',
          ],
          further: [
            'A. K. Ramanujan, trans., Speaking of Śiva (Penguin, 1973), vachanas of the Lingayat saints',
            'Indira Viswanathan Peterson, Poems to Śiva: The Hymns of the Tamil Saints (1989)',
            'Diana L. Eck, Banaras: City of Light (1982)',
          ],
          library: ['traditional/deity/shiva', 'traditional/tool/bell'],
        },
      ],
      practices: [
        {
          id: 'shiva-daily-water',
          title: 'Water and a leaf each day',
          instructions:
            'Each day, wash, light the diya, pour a little water before him and offer a bilva leaf or a white flower. Sit in stillness for five minutes before you study.',
          times: 12,
          every: 'day',
          prompt: 'One line: what did stillness show you today?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Eight Days and a Night',
      intro:
        'For eight days you will offer water and leaves each morning or evening and sit with one of Shiva’s forms, ending on the eighth evening with a short vigil into the night. If you can, end on a Monday, a Pradosh or the monthly Shivaratri, the fourteenth of the dark fortnight; or keep these days before Maha Shivaratri itself. First read the lesson on honouring him at home.',
      days: 8,
      lessons: [
        {
          id: 'shiva-today',
          title: 'Honouring Him at Home Today',
          summary: 'His offerings and how to prepare them, his days and his great night, words and mantras, customs of respect.',
          minutes: 8,
          sections: [
            {
              heading: 'Water, bilva and white flowers',
              body: `Shiva is called easy to please. His chief offering is water poured over the linga or before his image, in a thin steady stream; milk, curd, honey and ghee are also poured in temple abhisheka, followed by water. The leaf of the bilva or bael tree (Aegle marmelos), with its three leaflets, is especially his: devotees offer it whole, often in threes, with the smooth side up. Indian grocers and temples often have them, especially in the month of Shravan; if you cannot find bilva, white flowers and clean water are enough.

His flowers are white: jasmine, white oleander, white lotus. Sandalwood paste and vibhuti (sacred ash) are offered and worn. Tulsi and ketaki flowers are not offered to him; a version of the pillar of fire story says the ketaki flower falsely backed Brahma's claim to have seen the top of the pillar, and was banned from his worship. Food offerings are simple and vegetarian: fruit, milk sweets, and on fast days fruit and milk alone.`,
            },
            {
              heading: 'His days and his great night',
              body: `Monday (Somvar, the moon's day) is his day; many devotees fast until evening and visit the temple. In the monsoon month of Shravan, every Monday is kept, and pilgrims called kanwariyas walk long distances carrying Ganga water to pour on the linga. Pradosh, the thirteenth day of each lunar fortnight at dusk, is a twilight time for his worship. The fourteenth of each dark fortnight is the monthly Shivaratri, "Shiva's night".

Maha Shivaratri, "the great night of Shiva", falls on the dark fourteenth of Magha or Phalguna (the month name depends on the reckoning), in February or March. Devotees fast, worship the linga through the four watches of the night with water, milk and bilva, chant his names, and keep awake until dawn. In Tamil Nadu, Karthigai Deepam lights a great flame on the hill at Tiruvannamalai each November or December, for the pillar of fire.`,
            },
            {
              heading: 'Words and mantras',
              body: `Hindus pray to Shiva in their own words, in bhajans and aratis, in stotras such as the Shiva Tandava Stotram and the Shiva Panchakshara Stotram, and with mantras. The five syllables "na-maḥ śi-vā-ya", usually with Om before them, are chanted openly in temples and homes, and many teachers say anyone may say them with devotion; other traditions hold that the mantra should be received from a guru. Other mantras of Shiva are traditionally given with initiation and instruction. None is given here as a practice.

You can pray freely in your own language and say his names: Shiva, Mahadeva, Shankara, Shambhu, Nilakantha. If you want to chant in Sanskrit, ask a priest or teacher what is right for you to say, and how; most will be glad you asked.`,
            },
            {
              heading: 'Customs of respect',
              body: `Remove your shoes. Offer with the right hand or both hands, food untasted and flowers unsmelled. Keep meat, eggs and alcohol away from the shrine. Keep his image raised and clean. Do not pose with or climb on lingas or Nandi statues at temples or historic sites, or treat them as photo props. Do not take water or offerings from a linga's spout, and do not step over it.

Some customs vary. Some families do not perform puja during menstruation or after a death in the family; others reject these restrictions. Ask about the custom of a temple or family you are visiting, and follow it there. And remember the ascetic image is one side of him: Shiva is also a husband and father, and the god of householders. Above all, go to a temple, or to a Maha Shivaratri vigil, and learn from people.`,
            },
          ],
          knowAndDont: {
            known:
              'Water, milk and bilva as his offerings, the avoidance of tulsi and ketaki, Monday and Shravan devotion, the kanwar pilgrimage, Pradosh, monthly and Maha Shivaratri with fasting and night vigil, Karthigai Deepam, and the public chanting of the five-syllable prayer are widely attested.',
            unknown:
              'There is no single correct home puja; customs differ by family, region and sampradaya. Views on who may chant which mantras, and on menstruation and worship, vary and are debated within Hinduism.',
          },
          inPractice:
            'Look for bilva leaves at an Indian grocer or temple; if you cannot find them, use white flowers. Plan which evening will be your eighth, and clear it so you can stay up. Fast lightly that day only if your health allows; if you are pregnant, diabetic, unwell, on medication or have a history of disordered eating, do not fast at all.',
          reflect: [
            'Shiva is easy to please with water and a leaf. What does that say to you about devotion?',
            'What would it mean to stay awake for God for one night?',
          ],
          further: [
            'C. J. Fuller, The Camphor Flame: Popular Hinduism and Society in India (1992; revised 2004)',
            'Diana L. Eck, Darśan: Seeing the Divine Image in India (1981)',
          ],
          library: ['traditional/deity/shiva', 'traditional/herb/jasmine', 'traditional/herb/sandalwood'],
          premade: ['folk-diya-gayatri'],
        },
      ],
      practices: [
        {
          id: 'shiva-eight-days',
          title: 'Eight days and a night',
          instructions: `Each day: wash, ring the bell, light the diya and incense, pour water slowly before his image, and offer a bilva leaf or white flower. Then sit in stillness for ten minutes with the day's form, and write.

Day 1, the pillar of light: what in your life is greater than you can measure? Day 2, Nilakantha, the blue throat: what you carry for others. Day 3, Gangadhara, who caught the river: receiving something great gently. Day 4, Nataraja, the dancer: the rhythm of beginnings and endings. Day 5, Dakshinamurti, the silent teacher: keep an hour of silence today. Day 6, Ardhanarishvara, half Shiva, half Parvati: the two sides of yourself. Day 7, Bholenath and Kannappa: love without correct ritual.

Day 8, the night: in the evening, offer water, bilva and a white flower, then keep a short vigil. Sit, read his stories or a translation of the Shvetashvatara Upanishad, sing or listen to bhajans, and return to stillness, for as much of the night as is safe and kind to your body; until midnight is enough. Pour water once more before you sleep.`,
          times: 8,
          every: 'day',
          prompt: 'Which form did you sit with today, and what did the stillness show you?',
          premade: 'folk-diya-gayatri',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'After the Vigil',
      intro:
        'Take a few days with only the daily water and leaf. Reread your journal. A vow of devotion is one good outcome; so is pausing, learning more at a temple first, or finding that your path lies elsewhere. Shiva is said to be easily pleased by sincerity; an honest answer is that.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'shiva-reread',
          title: 'Read your journal back',
          instructions:
            'Read your journal from the first water. Note what drew you, what surprised you, and what you learned from people rather than from screens. Then answer the questions below.',
          times: 1,
          prompt: 'What has this month taught you about Shiva, and about stillness?',
        },
      ],
      questions: [
        'Are you drawn to Shiva himself, as Hindus worship him, or to an image of a cool ascetic or a "destroyer"? Be honest; only the first is what this vow is for.',
        'Can you keep a small, clean daily practice (water, a leaf, a few minutes of stillness) and the customs of respect through an ordinary year?',
        'Have you visited a Shiva temple or a Maha Shivaratri vigil, or spoken with Hindu devotees? If not, would it be better to do that before any vow?',
        'Would learning from a Hindu teacher or community, in time, serve your devotion better than a self-made vow? A vow now does not stop you doing that later.',
        'If you decide to wait, or stop, can you pour him a last cup of water with thanks? That is a good ending too.',
      ],
    },
    {
      kind: 'dedication',
      title: 'A Vow of Devotion',
      intro:
        'If you choose to go on, this is a personal vow of devotion to Shiva, made in a simple puja. It is not dīkṣā, not an initiation into any Hindu tradition or lineage, and does not replace one; it does not make you a member of a sampradaya or give you anything a guru gives. It is your own promise of bhakti. A Monday, a Pradosh, a monthly Shivaratri or Maha Shivaratri itself are fitting days.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Vow of Devotion to Shiva',
        summary: 'A full home puja with water poured in abhisheka, bilva leaves and white flowers, honouring Ganesha first, your own vow (sankalpa) of devotion, arati and the sharing of prasad.',
        minutes: 45,
        ingredients: [
          { name: 'Shiva’s image, cleaned', ref: 'traditional/deity/shiva' },
          { name: 'A fresh white or saffron cloth for the shrine' },
          { name: 'A diya with ghee and a cotton wick, on a heatproof plate' },
          { name: 'A plate for the arati lamp' },
          { name: 'A pot (lota) of clean water, with a bowl to catch it, and a little milk if you wish', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Bilva leaves, eleven if you can, washed, or white flowers', ref: 'traditional/herb/jasmine' },
          { name: 'Sandalwood paste or a little sandalwood oil', ref: 'traditional/herb/sandalwood' },
          { name: 'Incense and a holder', ref: 'traditional/tool/incense_burner' },
          { name: 'Fruit and a simple milk sweet', ref: 'traditional/vessel/dish' },
          { name: 'A little vibhuti (sacred ash)', optional: true },
          { name: 'A small bell', ref: 'traditional/tool/bell', optional: true },
          { name: 'Your vow, written on clean paper' },
        ],
        preparation: `During the day, write your vow. Keep it honest and keepable: what you will do (daily water and stillness, his Mondays, the monthly Shivaratri, a temple visit, Maha Shivaratri each year), for how long (a year is common), and what you ask of him. Many people include a promise to let go of something: a grudge, a habit, a pride.

Bathe, dress in clean clothes (white if you like), and remove your shoes. Clean the shrine and lay the fresh cloth. If your health allows, eat lightly during the day. Prepare the food without tasting it.`,
        steps: [
          {
            title: 'Begin with Ganesha',
            instructions: 'Sit before the shrine. Join your palms and breathe. Ring the bell. Many Hindus honour Ganesha, Shiva’s son, first at the start of any puja; offer him a flower and a bow.',
            spoken: 'Ganesha, remover of obstacles, I bow to you first.',
          },
          {
            title: 'Light and fragrance',
            instructions: 'Light the diya and the incense. Touch a little sandalwood paste to the base of his image or its frame.',
            light: true,
          },
          {
            title: 'Abhisheka',
            instructions:
              'Pour water slowly before his image, or over the linga if you keep one, in a thin steady stream. If you use milk, pour it, then water after it. Say his names as you pour.',
            spoken: 'Shiva. Mahadeva. Shankara. Shambhu. Nilakantha. Gangadhara…',
            minutes: 5,
          },
          {
            title: 'Bilva and flowers',
            instructions: 'Offer the bilva leaves one by one, or the white flowers, with both hands.',
            spoken: 'Auspicious one, three-eyed lord,\nyou who drank the poison for the world,\naccept these leaves.',
          },
          {
            title: 'Food',
            instructions: 'Set the fruit and sweet before him. Sprinkle a few drops of water around the food.',
            spoken: 'This food is yours, Mahadeva. Accept it, and let it come back to us as your grace.',
          },
          {
            title: 'The vow',
            instructions:
              'Take a little water in your right palm. Read your vow aloud, slowly. Let the water fall onto the plate beneath him, as a sign that the intention is made. Place the paper at his feet.',
            minutes: 5,
          },
          {
            title: 'Arati',
            instructions:
              'Light the arati lamp from the diya. Wave it slowly in clockwise circles before him while you sing or hum. Then pass your hands over the flame and touch them to your eyes and the top of your head.',
            minutes: 3,
          },
          {
            title: 'Stillness',
            instructions: 'Sit in silence before him for a while. Let your breath slow.',
            minutes: 10,
            timed: true,
          },
          {
            title: 'Close and share prasad',
            instructions:
              'Bow with joined palms. Touch a little vibhuti to your forehead if you have it. Take some fruit as prasad and share the rest today. Let the lamp burn while you are present, then cover it gently.',
            snuff: true,
            spoken: 'Thank you, Shiva. I will keep my word.',
          },
        ],
        closing:
          'Keep your vow folded near his shrine and read it each Maha Shivaratri. Pour the offered water and milk onto a plant or the earth. Return the leaves and flowers to the earth. Share the prasad. Write the date in your journal. If you can, visit a Shiva temple in the coming week, greet Nandi and pour water there.',
        safety:
          'Keep the diya, arati lamp and incense on heatproof plates, away from cloth, hair and loose sleeves, and never leave them unattended. If you use camphor for arati, burn only a small piece on a metal plate, keep it from children and pets, and never eat it. Never use datura. If you have fasted, break the fast gently.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Mondays and the Great Night',
      intro:
        'After the vow, devotion is daily and yearly: water and stillness, his Mondays, the monthly Shivaratri, Maha Shivaratri, temple visits, and a yearly renewal of your vow.',
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'shiva-daily',
          title: 'Daily water and stillness',
          instructions: 'Each day, wash, light the lamp, pour a little water before him, offer a leaf or flower, and sit in stillness for a few minutes.',
          times: 365,
          every: 'day',
        },
        {
          id: 'shiva-monthly',
          title: 'The monthly Shivaratri',
          instructions:
            'On the fourteenth of each dark fortnight (check a panchang), or a Pradosh evening, offer a fuller puja with water, bilva and white flowers, read one of his stories, and sit up a little later than usual with his lamp. A Monday visit to a temple is good too.',
          times: 12,
          every: 'month',
          prompt: 'What have you let go of this month?',
        },
        {
          id: 'shiva-maha-shivaratri',
          title: 'Maha Shivaratri',
          instructions: `Each year in February or March, keep Maha Shivaratri: fast lightly if your health allows, worship him with water, milk and bilva in the evening and, if you can, at each watch of the night, and keep a vigil with his names, songs and stories. Better still, join a temple's all-night worship.`,
          times: 1,
          every: 'holy-day',
          prompt: 'What did the great night, and the people you kept it with, show you this year?',
        },
        {
          id: 'shiva-renewal',
          title: 'Yearly renewal',
          instructions:
            'On the anniversary of your vow, or at Maha Shivaratri, reread it, write it anew, and repeat the vow puja. Change it honestly. If you are ending it, pour a last cup of water with thanks, take down the shrine with care, and give the image, or any linga you have kept, to a temple.',
          times: 1,
          prompt: 'What has a year with Shiva changed in you?',
        },
      ],
    },
  ],
  sources: [
    'Ralph T. H. Griffith, trans., The Hymns of the Rigveda (Benares, 1889–92; public domain), Book II, Hymn XXXIII, to Rudra, paraphrased',
    'Shatarudriya (Shri Rudram), Taittiriya Samhita 4.5, for namaḥ śivāya; Patrick Olivelle, trans., Upaniṣads (1996), the Śvetāśvatara Upaniṣad',
    'Shiva Purana (Vidyeshvara and Rudra Samhitas) for the pillar of fire and the stories of Sati and Parvati; Bhagavata Purana, Book 8, for the churning; Valmiki Ramayana, Bala Kanda, for the descent of the Ganga; all paraphrased',
    'Stella Kramrisch, The Presence of Śiva (1981); Gavin Flood, An Introduction to Hinduism (1996); Gavin Flood, ed., The Blackwell Companion to Hinduism (2003)',
    'A. K. Ramanujan, Speaking of Śiva (1973); Indira Viswanathan Peterson, Poems to Śiva (1989); David Smith, The Dance of Siva (1996); Ananda K. Coomaraswamy, The Dance of Śiva (1918)',
    'Diana L. Eck, Banaras: City of Light (1982) and Darśan (1981); C. J. Fuller, The Camphor Flame (1992)',
  ],
};
