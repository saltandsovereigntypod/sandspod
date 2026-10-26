import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-ganesha',
  kind: 'deity',
  paths: ['hindu'],
  deityRef: 'traditional/deity/ganesha',
  title: 'Ganesha: Lord of Beginnings',
  summary:
    'A devotional month with Ganesha, honoured first at every beginning. Learn his stories in their many versions, his history and temples, how Ganesh Chaturthi and visarjan are kept, and how to offer durva grass, modak and a simple home puja, then decide whether to make a personal vow of devotion.',
  welcome: `This journey spends about a lunar month learning about Ganesha and offering him simple devotion (bhakti) at home. He is one of the most loved deities in the world, worshipped daily by Hindus everywhere, and also honoured by Jains and Buddhists. Before any puja, wedding, journey, exam or new business, Hindus honour him first.

You will learn his names and image, his stories (which come in many versions), where his worship came from, how his great festival is kept, and how to make a small home puja with his own offerings: durva grass, red flowers and modak. For ten days, the length of his festival, you will offer to him each day. At the end you may make a personal vow of devotion, or not.

Please read this plainly. This is not an initiation. Formal initiation (dīkṣā) and mantras traditionally given by a guru are not offered here and cannot be given by an app. Nothing here is "magic", a lucky charm or a spell; it is devotion. The best thing this journey can do is send you to a temple, a Ganesh Chaturthi celebration or a Hindu friend's home, to learn from the people whose religion this is.`,
  about: `Ganesha (Gaṇeśa, "lord of the ganas", the attendants of Shiva), also called Ganapati, Vinayaka, Vighneshvara ("lord of obstacles"), Pillaiyar in Tamil and Ganpati Bappa in Marathi, is the elephant-headed son of Parvati and Shiva. He removes obstacles, and sometimes places them, so he is honoured first at every beginning. He is pictured with a round belly, a broken tusk, four arms holding an axe, a noose, a sweet modak and a gesture of blessing, and he rides a mouse or rat, Mushika. His worship as a major god appears clearly in the Gupta period, around the fourth and fifth centuries CE, and grows through the Puranas, the Ganesha Purana and Mudgala Purana, and the Ganapatya tradition that worships him as the supreme god. Today his great festival, Ganesh Chaturthi, is celebrated across India and the diaspora, above all in Maharashtra, where clay images are brought home or into public pandals for up to ten days and then immersed in water.`,
  notes: [
    'Hinduism is a living religion. Ganesha belongs first to the Hindu families, temples and teachers who worship him. This journey is a respectful introduction and an invitation to learn from them, not a replacement.',
    'Dīkṣā (formal initiation) and mantras traditionally given by a guru are not offered here. Where Hindu prayers are mentioned, the app gives its own English words. Learn Sanskrit prayers, and their pronunciation and proper use, from a priest, teacher or family.',
    'This is devotion, not magic. Ganesha is not a good-luck charm. Please do not use him, his image or his names in spells, or treat his image as décor.',
    'His stories have many versions in different texts and regions. This journey gives the main variants and says where each comes from; none is the "one true" story.',
    'Offerings are vegetarian: no meat, fish, eggs or alcohol. Most families do not offer tulsi (holy basil) to Ganesha.',
    'Do not put his image on shoes, floor mats, bathroom items or anything you sit on; it gives real offence.',
    'The app can show the Hindu lunar calendar (panchang): tick it under "Also show" in "Calendar & holidays". It marks Ganesh Chaturthi and the monthly Vinayaka and Sankashti Chaturthis. Panchangs, regions and countries can differ by a day; confirm with your local temple.',
    'Safety: Plaster of Paris images with chemical paints pollute water; choose natural clay and immerse at home. Keep lamps and camphor attended. Modak and laddoos are sweets for people, not pets.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'First at the Door',
      intro:
        'Begin by learning who Ganesha is, set up a small clean shrine near your door or work, and offer a first simple puja: a lamp, a red flower, a few blades of durva grass and a sweet.',
      days: 3,
      lessons: [
        {
          id: 'ganesha-who',
          title: 'The Elephant-Headed Lord',
          summary: 'His names, his image and what it is said to mean, and why he comes first.',
          minutes: 7,
          sections: [
            {
              heading: 'His names',
              body: `Ganesha means "lord of the ganas", the crowd of attendants who follow Shiva; Ganapati means the same. Vinayaka means "the leader" or "the one who removes". Vighneshvara and Vighnaharta mean "lord of obstacles" and "remover of obstacles". In Tamil Nadu he is Pillaiyar, "the noble child", and in Maharashtra people call him Ganpati Bappa, "Father Ganpati", with real affection.

He has many more names: Ekadanta ("one tusk"), Lambodara ("big belly"), Gajanana ("elephant face"), Vakratunda ("curved trunk"), Siddhivinayaka ("the leader who grants success"). Lists of 12, 21, 108 and 1,008 names are recited by devotees. Each name points to a story or a quality.`,
            },
            {
              heading: 'Reading his image',
              body: `Ganesha's image is full of things to look at. He has an elephant's head with large ears and a trunk, usually curving to his left. One tusk is broken. His belly is round. He usually has four arms: one holds an axe or goad, one a noose, one a modak (a sweet dumpling) or a bowl of sweets, and one is raised in blessing. At his feet is a mouse or rat, his vahana (vehicle), often nibbling a sweet.

Modern teachers often read these as symbols: big ears to listen more, a small mouth to speak less, a big belly to digest whatever life brings, the axe to cut attachment, the noose to draw the devotee close, the mouse as desire held under control. These readings are popular and helpful, and many come from modern sermons and books rather than old texts. The old texts mostly explain his features by stories, as you will see.`,
            },
            {
              heading: 'Why he comes first',
              body: `In almost every Hindu puja Ganesha is worshipped first, before the main deity, so that the rite will go without obstacles. Weddings, housewarmings and new businesses begin with him. Many people write "Shri Ganeshaya Namah", "reverence to Shri Ganesha", at the top of a notebook, a letter or an account book. His image watches over doorways, shop counters and car dashboards.

The Puranas give stories for this. In one, the gods race around the universe to decide who should be honoured first; Ganesha simply walks around his parents, Shiva and Parvati, saying they are his whole world, and wins. In another, Shiva grants it as a boon after restoring his son to life. You will read these in the next stage.`,
            },
            {
              heading: 'Starting in the right place',
              body: `Ganesha is not a mascot. His image is everywhere, including in Western shops, and it is easy to treat him as a cute or exotic decoration. For Hindus he is God, worshipped with love every day. That should shape how you come to him: learn first, ask before you join in, and treat his image as you would treat something holy of your own.

Hindu communities are often warm toward respectful newcomers, and Ganesha's festival in particular is a public, joyful celebration that welcomes everyone. If you can, go and see one.`,
            },
          ],
          knowAndDont: {
            known:
              'His names, his standard four-armed image with axe, noose, modak and blessing gesture, his mouse vehicle, and his place as the deity honoured first in Hindu worship are universal in living practice and well attested in the Puranas.',
            unknown:
              'Many popular explanations of his features (the big ears, small mouth and so on) are modern teaching, not ancient doctrine. Why an elephant-headed god arose at all is debated; scholars have suggested links with older elephant cults and yakshas (nature spirits), but the evidence is thin.',
          },
          inPractice:
            'Find an image of Ganesha you can treat with care: a framed print or a small murti (sacred image) from a Hindu shop or temple store. Learn to say his name: ga-NAY-sha. Write "Shri Ganeshaya Namah", or simply "Ganesha first", at the top of your journal.',
          reflect: [
            'What beginning in your life right now would you most like to start well?',
            'What do you already assume about Ganesha that you might need to unlearn?',
          ],
          further: [
            'Paul B. Courtright, Gaṇeśa: Lord of Obstacles, Lord of Beginnings (1985); see the note on it in the last lesson',
            'Robert L. Brown, ed., Ganesh: Studies of an Asian God (1991)',
          ],
          library: ['traditional/deity/ganesha', 'traditional/deity/durga'],
        },
      ],
      practices: [
        {
          id: 'ganesha-shrine',
          title: 'Set up a small, clean shrine',
          instructions: `Choose a raised place: a shelf or small table, never the floor, and never a bathroom. Many families keep Ganesha near the entrance, at a work desk, or in the north-east of the home. Clean it and lay a fresh red or yellow cloth.

Set his image at the back. In front, place a small diya (oil lamp) with ghee or sesame oil on a heatproof plate, an incense holder, a small dish for flowers and durva grass, a small plate for sweets, and a cup of clean water. A small bell is customary to ring as you begin.

Keep it simple and keep it clean: remove old flowers each day, wipe the lamp, change the water. Take your shoes off before you approach it.`,
          times: 1,
          prompt: 'Where did you place his shrine, and why there?',
        },
      ],
      rite: {
        title: 'First Greeting to Ganesha',
        summary: 'A first short puja: wash, ring the bell, light the lamp, offer a red flower, durva grass and a sweet, greet him in your own words, and share the sweet.',
        minutes: 15,
        ingredients: [
          { name: 'Ganesha’s image', ref: 'traditional/deity/ganesha' },
          { name: 'A diya (small oil lamp) with ghee or sesame oil and a cotton wick, on a heatproof plate' },
          { name: 'One fresh red flower, such as a hibiscus or a red rose', ref: 'traditional/herb/rose' },
          { name: 'Three blades of durva grass (Bermuda grass), washed' },
          { name: 'A small sweet: a modak, laddoo or a piece of jaggery', ref: 'traditional/vessel/dish' },
          { name: 'A cup of clean water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Sandalwood incense and a holder', ref: 'traditional/herb/sandalwood', optional: true },
          { name: 'A small bell', ref: 'traditional/tool/bell', optional: true },
        ],
        preparation:
          'Bathe or wash your hands, feet and face, and put on clean clothes. Remove your shoes. Clean the shrine. Do not eat meat or drink alcohol beforehand. Prepare or unwrap the sweet without tasting it. Sit on a mat or cushion before the image.',
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
              'Offer water by holding the cup up a little and setting it down. Place the red flower at his feet, then the three blades of durva grass, then the sweet. Flowers are offered whole and unsmelled.',
            spoken: 'Ganesha, lord of beginnings,\nremover of obstacles,\nI bow to you first.\nAccept this water, this flower, this grass and this sweet.',
          },
          {
            title: 'Greet him',
            instructions: 'Tell him simply who you are and why you have come: to learn, and to begin this month well.',
            minutes: 3,
          },
          {
            title: 'Sit',
            instructions: 'Look at his image in the lamplight, then close your eyes for a few minutes.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Bow with joined palms. Let the lamp burn while you are present, then put it out gently by covering it rather than blowing it out. Take the sweet as prasad.',
            snuff: true,
            spoken: 'Thank you, Ganesha. I will come again.',
          },
        ],
        closing:
          'Eat the sweet, or share it: what has been offered comes back as prasad, his grace. Return the flower and grass to a plant pot or garden when they wilt. Pour the water onto a plant. Write a few lines in your journal.',
        safety:
          'Set the diya and incense on a heatproof plate away from curtains, cloth and paper, and never leave them unattended. Keep flame, smoke and sweets away from pets and children.',
      },
    },
    {
      kind: 'study',
      title: 'Stories and Temples',
      intro:
        'Three lessons: his stories and their variants; where his worship came from and where it is kept; and Ganesh Chaturthi and visarjan. Offer a lamp and a blade of durva before you study each day.',
      days: 12,
      lessons: [
        {
          id: 'ganesha-stories',
          title: 'His Stories, Honestly Told',
          summary: 'His birth, the elephant head, the broken tusk, the moon, and the race around the world, with their variants.',
          minutes: 8,
          sections: [
            {
              heading: 'Born to guard the door',
              body: `The best-known story comes from the Shiva Purana. Parvati wants a guard of her own while she bathes. She makes a boy from the turmeric paste and unguents of her body, gives him life, and sets him at her door. Shiva comes home, and the boy, not knowing him, refuses to let him in. They fight, and Shiva's attendants and finally Shiva himself cut off the boy's head.

Parvati's grief and fury are so great that the world is in danger. To calm her, Shiva sends his attendants north to bring the head of the first creature they find. They return with an elephant's head. Shiva sets it on the boy's body, brings him back to life, accepts him as his son, and makes him lord of the ganas, to be worshipped first of all.`,
            },
            {
              heading: 'Other versions',
              body: `The Brahmavaivarta Purana tells it differently. Ganesha is born to Parvati and Shiva after a vow, and all the gods come to see the baby. The planet-god Shani, whose gaze is cursed to destroy, keeps his eyes down, but Parvati insists he look, and the baby's head falls. Vishnu brings an elephant's head to restore him. Other texts and regions have other versions again, including ones in which Ganesha is born with an elephant's head.

These are not mistakes to be corrected. Hindu storytelling holds many versions side by side, often told in different ages of the world, and devotees are usually comfortable with that. A good habit is to say which text a story comes from.`,
            },
            {
              heading: 'The broken tusk',
              body: `There are several stories of the tusk. In one popular story he breaks it off to use as a pen. The opening chapter of the Mahabharata, in some versions, tells how the sage Vyasa needed a scribe and called on Ganesha. In K. M. Ganguli's public-domain translation, Ganesha replies: "I will become the writer of thy work, provided my pen do not for a moment cease writing." Vyasa agrees on condition that Ganesha understand every verse before writing it, and so composes hard verses to win time to think.

Ganguli's passage does not mention the tusk; the broken-tusk pen is a later, beloved detail. The scholarly critical edition of the Mahabharata leaves the whole scribe passage out, as a later addition. Other stories say he lost the tusk fighting Parashurama, who was guarding Shiva's door, or that he broke it off and threw it at the Moon.`,
            },
            {
              heading: 'The Moon, and the race',
              body: `One night Ganesha, full of sweets after a feast, was riding home on his mouse. The mouse stumbled at a snake, Ganesha fell, and his belly burst open; he tied it back up with the snake. The Moon laughed at him. Ganesha cursed the Moon, and though the curse was softened, many people still avoid looking at the moon on the night of Ganesh Chaturthi; a story about Krishna and a stolen jewel, the Syamantaka, is told of someone who did.

In the race story, Shiva and Parvati tell their sons that whoever goes round the world first will win a prize, often a special fruit or the right to be worshipped first. Kartikeya sets off on his peacock. Ganesha walks around his parents, saying that they are his whole world. In the south, Kartikeya, as Murugan, goes away hurt to the hill of Palani. Ganesha is also said in the north to have two wives, Riddhi and Siddhi ("prosperity" and "success"), while in much of the south he is a bachelor. Both are traditional.`,
            },
          ],
          knowAndDont: {
            known:
              'The Shiva Purana’s door-guard birth, the Brahmavaivarta Purana’s Shani version, the scribe passage in the vulgate Mahabharata (Adi Parva, Ganguli’s translation), the moon curse and Chaturthi custom, and the regional differences over his marriage are all documented.',
            unknown:
              'The stories took shape over many centuries and the Puranas are hard to date closely. The broken-tusk-as-pen detail is later than the scribe passage, and the scribe passage itself is absent from the critical edition. There is no single orthodox version.',
          },
          inPractice:
            'Each day of this study stage, tell one of his stories aloud in your own words before his shrine. Note where you heard or read it. If you have a Hindu friend, ask which version their family tells; you may learn one that is in no book.',
          reflect: [
            'Ganesha won by walking round his parents. Who or what is your "whole world"?',
            'How do you feel about holding several versions of a story at once, without needing one to be the only true one?',
          ],
          further: [
            'K. M. Ganguli, trans., The Mahabharata, Adi Parva, Section I (1883–96; public domain), Project Gutenberg ebook 15474',
            'John A. Grimes, Ganapati: Song of the Self (1995)',
          ],
          library: ['traditional/deity/ganesha', 'traditional/deity/durga'],
        },
        {
          id: 'ganesha-history',
          title: 'From Obstacle-Maker to Remover',
          summary: 'How his worship grew, the Ganapatya tradition, his great temples, and Ganesha beyond Hinduism.',
          minutes: 7,
          sections: [
            {
              heading: 'Early traces',
              body: `Ganesha is not clearly found in the Vedas. A famous Rig Veda verse, Book 2, Hymn 23, begins, in Ralph Griffith's 1889 translation: "We call thee, lord and leader of the heavenly hosts, the wise among the wise, the famousest of all." It is addressed to Brahmanaspati, the lord of prayer, and its Sanskrit opening, gaṇānāṃ tvā gaṇapatiṃ, uses the title Ganapati. Priests now recite it at the start of Ganesha worship, and it is a good example of how a tradition reads its old scriptures in new ways.

In late Vedic household manuals, beings called vinayakas are troublesome spirits who cause obstacles and must be appeased. Over time they seem to have merged into a single Vinayaka, a lord of obstacles who could both cause and remove them. By the Gupta period, the fourth and fifth centuries CE, clear images of the elephant-headed god appear, for example at Udayagiri in Madhya Pradesh.`,
            },
            {
              heading: 'Puranas and the Ganapatyas',
              body: `In the Puranas Ganesha becomes the son of Shiva and Parvati and takes on his familiar stories. Two late Puranas, the Ganesha Purana and the Mudgala Purana, are wholly about him. The Ganapatya tradition worships him as the supreme god, of whom all others are forms. A short Sanskrit text, the Ganapati Atharvashirsha, which praises him as the ultimate reality, is recited widely; scholars generally date it late, often to the sixteenth or seventeenth century, though devotees hold it to be Vedic.

The Ganapatyas were strongest in Maharashtra, where the saint Morya Gosavi settled at Chinchwad near Pune; his dates are disputed, with estimates running from the fourteenth to the seventeenth century. Morya's name is in the festival cry "Ganpati Bappa Morya!"`,
            },
            {
              heading: 'Temples',
              body: `In Maharashtra, the Ashtavinayaka, "eight Vinayakas", are a pilgrimage circuit of eight temples around Pune, beginning and ending at Morgaon. In Mumbai the Siddhivinayak temple, built in 1801, is visited by huge crowds, especially on Tuesdays. In Tamil Nadu, Ganesha shrines are everywhere, often under a pipal tree at a crossroads; the Uchchi Pillaiyar temple sits on top of the Rock Fort at Tiruchirappalli, and Pillaiyarpatti has an early rock-cut image.

Temple custom is simple to follow. Remove your shoes. Ring the bell as you enter. Offer flowers, durva or sweets through the priest, who will return some as prasad. In some southern temples devotees cross their arms, hold their earlobes and bob up and down a few times before Ganesha (thoppukaranam), a gesture of humility.`,
            },
            {
              heading: 'Beyond Hinduism',
              body: `Ganesha travelled. Jains honour him, and he appears in Buddhist art across Asia. In Japan, Kangiten, a Buddhist deity who is a pair of embracing elephant-headed figures, derives from Ganapati and is honoured in esoteric Shingon temples. In Thailand he is Phra Phikanet, patron of the arts and of beginnings, and his image stands at the gates of universities and businesses. In Indonesia, Ganesha appears on old temple sites in Java and Bali.

Each of these is its own tradition. They show that Ganesha has long been loved beyond his first home. They do not make him a generic "universal" figure detached from Hinduism, where he remains central and living.`,
            },
          ],
          knowAndDont: {
            known:
              'The Rig Veda 2.23.1 verse addressed to Brahmanaspati (Griffith, 1889), its modern liturgical use for Ganesha, the vinayakas of the household manuals, Gupta-period images, the Ganesha and Mudgala Puranas, Morya Gosavi, the Ashtavinayaka and Siddhivinayak temples, and Ganesha in Jain, Buddhist and Southeast Asian art are documented.',
            unknown:
              'How the vinayakas became one god, and when, is reconstructed from scattered evidence. Dates for the Ganapati Atharvashirsha and the Ganesha-focused Puranas are disputed. Possible pre-Gupta elephant-headed images are debated.',
          },
          inPractice:
            'Find the nearest temple with a Ganesha shrine; most Hindu temples have one, often at the entrance. Visit if you can, on a Tuesday or a Chaturthi, and notice how people greet him before going on to the main shrine.',
          reflect: [
            'Ganesha was once an obstacle-maker and became the remover of obstacles. What obstacle in your life has also taught you something?',
            'What does it mean to you that a scripture can be read in new ways by later generations?',
          ],
          further: [
            'Ralph T. H. Griffith, trans., The Hymns of the Rigveda (Benares, 1889–92; public domain), Book 2, Hymn 23',
            'Anita Raina Thapan, Understanding Gaṇapati: Insights into the Dynamics of a Cult (1997)',
          ],
          library: ['traditional/deity/ganesha', 'traditional/tool/bell'],
        },
        {
          id: 'ganesha-chaturthi',
          title: 'Ganesh Chaturthi and Visarjan',
          summary: 'His great festival: bringing him home, the days of worship, his farewell in water, and how to keep it gently.',
          minutes: 8,
          sections: [
            {
              heading: 'His birthday',
              body: `Ganesh Chaturthi falls on the fourth day (chaturthi) of the bright half of the lunar month Bhadrapada, in August or September. It is celebrated across India and the diaspora, and above all in Maharashtra, Goa, Karnataka, Telangana and Andhra Pradesh.

At home, families bring in a new clay image of Ganesha, often carried in from the market with drums and the cry "Ganpati Bappa Morya!" On the first day a priest or family elder performs the installation (prana pratishtha), inviting Ganesha to be present in the image. He is then worshipped as a guest for one and a half, three, five, seven or ten days, depending on family custom, with morning and evening arati, flowers, durva and sweets.`,
            },
            {
              heading: 'A public festival',
              body: `Ganesh Chaturthi was a household festival for centuries. In 1893 the nationalist leader Bal Gangadhar Tilak promoted it in Pune as a great public festival (sarvajanik), partly to bring people together across caste lines under colonial rule; a Pune contemporary, Bhausaheb Rangari, is also credited with the first public image a year earlier. Since then public pandals have become huge. Mumbai's Lalbaugcha Raja, whose mandal was founded in 1934, draws queues that last a whole day.

The Marathi arati "Sukhakarta Dukhaharta", attributed to the seventeenth-century saint Samarth Ramdas, is sung at nearly every Ganesha arati in Maharashtra. You will hear it at any festival, and it is worth learning the tune from people who sing it.`,
            },
            {
              heading: 'Visarjan',
              body: `At the end of the festival comes visarjan, immersion. The image is worshipped one last time, given curd rice or sweets for the journey, and carried in procession to the sea, a river, a lake or a tank, with drums, dancing and the cry "Ganpati Bappa Morya, pudhchya varshi lavkar ya!" ("Father Ganpati, come again early next year!"). Then it is immersed. Ten-day festivals end on Anant Chaturdashi.

The immersion teaches something many devotees feel deeply: the form comes and goes, and the god remains. Ganesha is welcomed, loved, and let go of, and he will come again.`,
            },
            {
              heading: 'Gentle on the water',
              body: `Many modern images are made of Plaster of Paris with chemical paints, which do not dissolve well and pollute rivers, lakes and the sea. Courts and pollution boards in India have repeatedly called for change, and many families and communities have returned to the older practice of shadu mati, a natural river clay, coloured with natural paints, or use images small enough to immerse at home.

To keep the festival gently: choose a small image of unbaked natural clay, unpainted or naturally painted. Or make one yourself from clay; it need not be perfect, as many families' homemade Ganpatis are not. At the end, immerse it with love in a bucket or tub of water at home. When the clay has dissolved, pour the water and clay onto your garden or plant pots. Some families plant a seed in the clay; "seed Ganesha" images have become popular for this.`,
            },
          ],
          knowAndDont: {
            known:
              'The date in Bhadrapada, the household installation and immersion, the variable festival lengths, Tilak’s promotion of the public festival in 1893, Lalbaugcha Raja (from 1934), the Sukhakarta Dukhaharta arati attributed to Samarth Ramdas, and the environmental problems with Plaster of Paris images are documented.',
            unknown:
              'How old household Ganesh Chaturthi is, and how it was kept before the nineteenth century, is less clear. Who started the first public festival is disputed between Tilak and Bhausaheb Rangari’s supporters. Customs on how many days and how to immerse differ by family.',
          },
          inPractice:
            'Mark the next Ganesh Chaturthi from a panchang or a temple website. If you live near a Hindu or Marathi community, look for a public pandal or temple celebration and go. If you want to keep it at home, get or make a small natural clay image now.',
          reflect: [
            'What would it be like to welcome a guest you love for a short time, knowing you will let them go?',
            'Why do you think the farewell in water matters so much to devotees?',
          ],
          further: [
            'Raminder Kaur, Performative Politics and the Cultures of Hinduism: Public Uses of Religion in Western India (2003)',
          ],
          library: ['traditional/deity/ganesha', 'traditional/vessel/bowl'],
          premade: ['folk-lakshmi-diwali'],
        },
      ],
      practices: [
        {
          id: 'ganesha-daily-durva',
          title: 'Lamp and durva each day',
          instructions:
            'Each day, wash, remove old flowers, light the diya and offer a blade or three blades of durva grass and a cup of water. Bow before you begin your work or study.',
          times: 12,
          every: 'day',
          prompt: 'One line: what are you beginning today?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Ten Days with Ganesha',
      intro:
        'For ten days, the length of the longest Ganesh Chaturthi, you will welcome Ganesha each day with durva, flowers and a sweet, and end with a small, gentle farewell in water. If you can, keep these days during Ganesh Chaturthi itself; otherwise begin on a Chaturthi, the fourth day of a bright lunar fortnight. First read the lesson on honouring him at home.',
      days: 10,
      lessons: [
        {
          id: 'ganesha-today',
          title: 'Honouring Him at Home Today',
          summary: 'His offerings and how to prepare them, his days, words and mantras, customs of respect, and the sensitive points.',
          minutes: 8,
          sections: [
            {
              heading: 'Durva, red flowers and modak',
              body: `Ganesha's own offering is durva grass, Cynodon dactylon, the ordinary Bermuda grass of lawns and verges. Pick young shoots with three or five blades, wash them, and offer them in bundles; 21 is the traditional number for a full offering. A Purana story says durva cooled the burning in his belly after he swallowed a fire demon, Analasura.

Red flowers please him: red hibiscus (jaswand in Marathi) above all, and also marigolds and the white flowers of the arka plant. His sweet is the modak, a dumpling of rice flour around a filling of fresh coconut and jaggery, steamed (ukadiche modak) or fried. Twenty-one modaks are offered on his festival. Laddoos, bananas, coconut and jaggery are also traditional. Most families do not offer tulsi (holy basil) to Ganesha; a folk story tells of a quarrel between him and Tulsi, and some allow it only on Chaturthi.`,
            },
            {
              heading: 'His days',
              body: `Each lunar month has two Chaturthis, fourth days. Vinayaka Chaturthi falls in the bright fortnight and is a day for his puja. Sankashti Chaturthi, "deliverance from trouble", falls in the dark fortnight; many devotees fast until moonrise, then worship Ganesha, look at the moon, and break the fast. When Sankashti falls on a Tuesday it is called Angaraki and is especially observed. Tuesday is his day at many temples, including Siddhivinayak.

And every beginning is his. Before a journey, an exam, a job interview, signing a lease or starting a project, many people simply bow to him, touch his image or offer a sweet.`,
            },
            {
              heading: 'Words and mantras',
              body: `Hindus pray to Ganesha in their own words, in bhajans and aratis, in stotras (hymns) such as lists of his names, and with mantras. Short name-mantras of Ganesha are widely heard, and the Ganapati Atharvashirsha is recited in many homes. Some mantras, though, are traditionally given by a guru, with instruction in how and when to say them. Those are not given here.

You can pray freely in your own language and say his names: Ganesha, Vinayaka, Vighnaharta, Ekadanta, Gajanana. If you want to recite in Sanskrit or Marathi, ask a priest, teacher or Hindu friend; pronunciation matters, and so does knowing what is appropriate for you. Most will be glad you asked.`,
            },
            {
              heading: 'Customs of respect, and sensitive points',
              body: `Remove your shoes before his shrine. Offer with the right hand or both hands, food untasted and flowers unsmelled. Keep meat, eggs and alcohol away from the shrine. Keep his image raised, clean, and out of bathrooms. Do not use it on shoes, mats, bags you put on the floor, or toilet seats. Images of Ganesha on such things in Western shops have caused real hurt and protests.

Scholarship can hurt too. In 2003 and 2004 there were angry protests in India and the diaspora over a 1985 academic book on Ganesha that offered psychoanalytic readings of his stories, which many devotees found offensive. Read scholars with an open mind, but remember that what you are studying is someone's living God, and give at least as much weight to how devotees understand him. Above all, go to a temple, or to a festival, and learn from people.`,
            },
          ],
          knowAndDont: {
            known:
              'Durva grass, red flowers and modak as his offerings, the number 21, the avoidance of tulsi, Vinayaka and Sankashti Chaturthi, Angaraki, Tuesday devotion, and the customs of respect are widespread in living practice. The protests over Courtright’s book (2003–04) are documented.',
            unknown:
              'Stories explaining his offerings (Analasura and durva, the tulsi quarrel) come in several versions and are hard to date. Customs differ by family, region and tradition, and there is no single correct home puja.',
          },
          inPractice:
            'Find a patch of clean, unsprayed grass, or grow a pot of durva from a cutting; it grows easily. Make or buy modak for the last day of the practice stage. Learn the date of the next Sankashti Chaturthi.',
          reflect: [
            'Ganesha’s favourite offering is the most ordinary grass. What does that say to you about devotion?',
            'Where have you seen his image used carelessly, and how did it feel to notice it?',
          ],
          further: [
            'C. J. Fuller, The Camphor Flame: Popular Hinduism and Society in India (1992; revised 2004)',
            'Diana L. Eck, Darśan: Seeing the Divine Image in India (1981)',
          ],
          library: ['traditional/deity/ganesha', 'traditional/herb/sandalwood', 'traditional/candle/yellow'],
          premade: ['folk-diya-gayatri'],
        },
      ],
      practices: [
        {
          id: 'ganesha-ten-days',
          title: 'Ten days of welcome',
          instructions: `On the first day, if you can, set a small natural clay image of Ganesha on a clean plate in front of his shrine image; you can make one yourself. Greet him as a guest who has come to stay.

Each morning and evening: wash, ring the bell, light the diya and incense, offer water, durva and a red flower, and a small sweet or fruit. Wave the lamp three times clockwise before him. Then sit with the day's theme for ten minutes and write.

Day 1: welcome, and what you are beginning. Day 2: the door-guard; your duties. Day 3: the elephant head; what you lost and what replaced it. Day 4: the scribe; your work. Day 5: the broken tusk; what you gave up for something greater. Day 6: the mouse; what carries you. Day 7: the Moon; laughter and humility. Day 8: the race; your whole world. Day 9: obstacles you are asking him to remove, and ones you are asking him to help you learn from. Day 10: farewell.

On day 10, offer modak (21 if you can, or one), sing or say a goodbye, and immerse the clay image in a bucket of water at home. When it has dissolved, pour the water onto plants.`,
          times: 10,
          every: 'day',
          prompt: 'What did today’s theme show you about the beginning you are making?',
          premade: 'folk-diya-gayatri',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'After the Farewell',
      intro:
        'Take a few days with only the daily lamp and durva. Reread your journal. A vow of devotion is one good outcome; so is pausing, learning more at a temple first, or finding that your path lies elsewhere. Every one of those is a good beginning.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'ganesha-reread',
          title: 'Read your journal back',
          instructions:
            'Read your journal from the first greeting. Note what drew you, what surprised you, and what you learned from people rather than from screens. Then answer the questions below.',
          times: 1,
          prompt: 'What has this month taught you about Ganesha, and about beginnings?',
        },
      ],
      questions: [
        'Are you drawn to Ganesha himself, as Hindus worship him, or to the idea of a lucky charm for success? Be honest; only the first is what this vow is for.',
        'Can you keep a small, clean daily practice (lamp, durva, water) and the customs of respect through an ordinary year?',
        'Have you visited a temple or a Ganesh Chaturthi celebration, or spoken with Hindu devotees? If not, would it be better to do that before any vow?',
        'Would learning from a Hindu teacher or community, in time, serve your devotion better than a self-made vow? A vow now does not stop you doing that later.',
        'If you decide to wait, or stop, can you offer him a last sweet with thanks? That is a good ending, and he is the lord of new beginnings too.',
      ],
    },
    {
      kind: 'dedication',
      title: 'A Vow of Devotion',
      intro:
        'If you choose to go on, this is a personal vow of devotion to Ganesha, made in a simple puja. It is not dīkṣā, not an initiation into any Hindu tradition or lineage, and does not replace one; it does not make you a member of a sampradaya or give you anything a guru gives. It is your own promise of bhakti. A Tuesday, a Vinayaka Chaturthi, or Ganesh Chaturthi itself are fitting days.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Vow of Devotion to Ganesha',
        summary: 'A full home puja with durva, red flowers and modak, your own vow (sankalpa) of devotion, arati and the sharing of prasad.',
        minutes: 45,
        ingredients: [
          { name: 'Ganesha’s image, cleaned', ref: 'traditional/deity/ganesha' },
          { name: 'A fresh red or yellow cloth for the shrine' },
          { name: 'A diya with ghee and a cotton wick, on a heatproof plate' },
          { name: 'A second small diya, or a plate for the arati lamp' },
          { name: '21 blades or bundles of durva grass, washed' },
          { name: 'Red flowers, such as hibiscus, roses or marigolds', ref: 'traditional/herb/rose' },
          { name: 'Sandalwood paste or a little sandalwood oil', ref: 'traditional/herb/sandalwood' },
          { name: 'Incense and a holder', ref: 'traditional/tool/incense_burner' },
          { name: 'Modak (21 if you can, or one), or laddoos, with bananas or a coconut', ref: 'traditional/vessel/dish' },
          { name: 'A cup of clean water', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A small bell', ref: 'traditional/tool/bell', optional: true },
          { name: 'Your vow, written on clean paper' },
        ],
        preparation: `During the day, write your vow. Keep it honest and keepable: what you will do (a daily lamp and durva, honouring him before beginnings, his Chaturthis, a temple visit, a yearly festival), for how long (a year is common), and what you ask of him. Many people include a promise of service, such as helping someone begin something.

Bathe, dress in clean clothes, and remove your shoes. Clean the shrine and lay the fresh cloth. Prepare the modak without tasting them.`,
        steps: [
          {
            title: 'Begin',
            instructions: 'Sit before him. Join your palms and breathe. Ring the bell.',
            minutes: 2,
          },
          {
            title: 'Light and fragrance',
            instructions: 'Light the diya and incense. Touch a little sandalwood paste to the base of his image or its frame.',
            light: true,
          },
          {
            title: 'Durva and flowers',
            instructions:
              'Offer the durva blades or bundles one at a time, saying one of his names with each, or simply "Ganesha" each time. Then offer the red flowers.',
            spoken: 'Ganesha. Vinayaka. Vighnaharta. Ekadanta. Gajanana. Lambodara…',
            minutes: 5,
          },
          {
            title: 'Food and water',
            instructions: 'Set the modak and fruit before him, with the cup of water. Sprinkle a few drops of water around the food.',
            spoken: 'Lord of beginnings, these sweets are yours.\nAccept them, and let them come back to us as your grace.',
          },
          {
            title: 'The vow',
            instructions:
              'Take a little water in your right palm. Read your vow aloud, slowly. Let the water fall onto the plate beneath him, as a sign that the intention is made. Place the paper at his feet.',
            minutes: 5,
          },
          {
            title: 'Ask for help with obstacles',
            instructions: 'Name honestly the obstacles you face. Ask him to remove those that should go, and to help you learn from those that should stay.',
            spoken: 'Ganesha, lord of obstacles,\nclear my way where it should be cleared,\nand stand by me where the way is hard.',
          },
          {
            title: 'Arati',
            instructions:
              'Light the arati lamp from the diya. Wave it slowly in clockwise circles before him while you sing or hum. Then pass your hands over the flame and touch them to your eyes and the top of your head.',
            minutes: 3,
          },
          {
            title: 'Sit with him',
            instructions: 'Sit in silence before him for a while.',
            minutes: 8,
          },
          {
            title: 'Close and share prasad',
            instructions:
              'Bow with joined palms. Take a modak as prasad and share the rest with others today. Let the lamp burn while you are present, then cover it gently.',
            snuff: true,
            spoken: 'Thank you, Ganesha. You come first in my house. I will keep my word.',
          },
        ],
        closing:
          'Keep your vow folded near his shrine and read it each Ganesh Chaturthi. Share the modak; generosity is part of his worship. Return durva and flowers to the earth. Write the date in your journal, under "Ganesha first". If you can, visit a temple in the coming week.',
        safety:
          'Keep diyas, the arati lamp and incense on heatproof plates, away from cloth, paper, hair and loose sleeves, and never leave them unattended. If you use camphor for arati, burn only a small piece on a metal plate, keep it from children and pets, and never eat it. Keep sweets, especially any with chocolate, raisins or xylitol, away from dogs and cats.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Every Beginning',
      intro:
        'After the vow, devotion is daily and yearly: a lamp and durva, honouring him before every beginning, his monthly Chaturthis, his great festival, temple visits, and a yearly renewal of your vow.',
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'ganesha-daily',
          title: 'Daily lamp and durva',
          instructions: 'Each morning, wash, light the lamp, offer durva and water, and bow before you begin the day’s work.',
          times: 365,
          every: 'day',
        },
        {
          id: 'ganesha-chaturthis',
          title: 'The monthly Chaturthis',
          instructions:
            'On Vinayaka Chaturthi (the bright fourth day) offer a fuller puja with red flowers and a sweet. On Sankashti Chaturthi (the dark fourth day), fast lightly until moonrise if your health allows, then offer to him and look at the moon before you eat. Check dates in a panchang.',
          times: 12,
          every: 'month',
          prompt: 'What did you begin, or get through, this month?',
        },
        {
          id: 'ganesha-festival',
          title: 'Ganesh Chaturthi',
          instructions: `Each year in Bhadrapada (August or September), keep his festival: bring home or make a small natural clay image, worship him for the days your household chooses, visit a public pandal or temple if you can, and immerse the image at home in water that you then give to your garden. Avoid looking at the moon on the night of Chaturthi, as many devotees do.`,
          times: 1,
          every: 'holy-day',
          prompt: 'What did the festival, and the farewell, mean to you this year?',
        },
        {
          id: 'ganesha-renewal',
          title: 'Yearly renewal',
          instructions:
            'On the anniversary of your vow, or at Ganesh Chaturthi, reread it, write it anew, and repeat the vow puja. Change it honestly. If you are ending it, offer a last modak with thanks, take down the shrine with care, and give the image to a temple or immerse a clay image respectfully.',
          times: 1,
          prompt: 'What has a year of beginning with Ganesha changed in you?',
        },
      ],
    },
  ],
  sources: [
    'K. M. Ganguli, trans., The Mahabharata of Krishna-Dwaipayana Vyasa, vol. 1, Adi Parva, Section I (1883–96; public domain), Project Gutenberg ebook 15474, https://www.gutenberg.org/ebooks/15474: "I will become the writer of thy work, provided my pen do not for a moment cease writing."',
    'Ralph T. H. Griffith, trans., The Hymns of the Rigveda (Benares, 1889–92; public domain; preface dated 1889), Book II, Hymn XXIII, archive.org item hymnsrigveda02grifgoog, https://archive.org/details/hymnsrigveda02grifgoog: "We call thee, lord and leader of the heavenly hosts, the wise among the wise, the famousest of all."',
    'Shiva Purana (Rudra Samhita, Kumara Khanda) and Brahmavaivarta Purana (Ganapati Khanda) for the birth stories, paraphrased',
    'Paul B. Courtright, Gaṇeśa: Lord of Obstacles, Lord of Beginnings (1985); Robert L. Brown, ed., Ganesh: Studies of an Asian God (1991); Anita Raina Thapan, Understanding Gaṇapati (1997); John A. Grimes, Ganapati: Song of the Self (1995)',
    'Raminder Kaur, Performative Politics and the Cultures of Hinduism (2003), on the public Ganeshotsav; C. J. Fuller, The Camphor Flame (1992)',
  ],
};
