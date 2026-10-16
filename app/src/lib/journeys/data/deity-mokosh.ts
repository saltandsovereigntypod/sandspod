import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-mokosh',
  kind: 'deity',
  paths: ['slavic'],
  deityRef: 'traditional/deity/mokosh',
  title: 'Mokosh, the Spinner',
  summary: 'A lunar month with the only goddess in Prince Vladimir’s pantheon: thread and fate, damp earth, Friday and St Paraskeva, and a quiet devotion of handwork and care.',
  welcome: `This is a month-long self-dedication to Mokosh, the Slavic goddess of spinning, women’s work, moisture and the fertile earth. You will learn how little the old sources actually say and how much folk custom remembers, build a small shrine, keep nine nights of thread and water, and decide at the end whether to dedicate yourself to her.

It is a dedication, not an initiation. It joins you to no group and makes you no priestess. It is a promise between you and her, kept with your hands.

You do not need Slavic ancestry, and you do not need to be a woman. Mokosh was the patron of women’s work in villages where spinning was women’s work; today anyone who spins, sews, mends, gardens or keeps a household can come to her.`,
  about: `Mokosh is the one goddess named among the idols Prince Vladimir set up in Kiev in 980, at the end of a row headed by Perun. After that she appears only in a few Church sermons and penitential questions that scold people, mostly women, for still praying to her. Her name is usually linked to the Slavic root for wet or moist (mokryi), though this is debated. Folk custom fills in more: in the Russian north a spirit called Mokosha was said to spin and shear sheep at night, and across the East Slavic lands the Friday saint, Paraskeva Pyatnitsa, took over her care of spinning, women, wells and marriage, with strict taboos on spinning and washing on Fridays. Her modern portrait as the great Earth Mother and wife of Perun is largely reconstruction. Today she is honoured in Rodnovery and by many folk practitioners with handwork, bread, grain, water poured on the earth, and Friday rest.`,
  notes: [
    'Almost nothing about Mokosh survives from pagan times. Her name, her place in Vladimir’s pantheon, and Church complaints about her worship are close to all we have. Be wary of confident accounts of her myths.',
    'Her Christian successor, St Paraskeva Pyatnitsa, is still honoured by Orthodox women. Those customs belong to a living Christian folk practice; learn from them respectfully and do not present them as secretly pagan.',
    'The traditional Friday taboo is against spinning, sewing and washing, so on Fridays you honour her by resting from that work, not by doing it.',
    'This journey is inclusive. Mokosh was a goddess of women’s work, and women’s circles honour her today, but she is not closed to men, trans or non-binary people. Nor is she a bloodline possession: some modern Rodnover groups carry nationalist politics, and this app does not.',
    'Fertility and childbirth were among the things women asked of her. If you are working with those hopes or griefs, ritual can accompany medical and emotional care but never replace it.',
  ],
  holyDays: ['dziady', 'koliada', 'kupala'],
  stages: [
    {
      kind: 'threshold',
      title: 'The first thread',
      intro: 'You begin with a small, homely rite: a bowl of water, a piece of bread, and a single length of thread, with your name given honestly. Mokosh is approached through the hands and the home, so this opening is quiet and practical.',
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'mokosh-threshold-journal',
          title: 'What my hands know',
          instructions: 'After the opening rite, write about the handwork in your life, or in your family’s. Who taught you to sew, knit, cook, garden or mend, if anyone? What did your grandmothers or great-grandmothers make? If you know nothing, write that too; you might ask a relative this month.',
          times: 1,
          prompt: 'What is the oldest piece of handwork I have touched, and whose hands made it?',
        },
      ],
      rite: {
        title: 'Introduction with water and thread',
        summary: 'Water poured, bread set down, one thread tied, and your name spoken to her.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of clean water, ideally from a spring or left to stand overnight', ref: 'traditional/vessel/bowl' },
          { name: 'A small piece of bread' },
          { name: 'A length of undyed wool, linen or cotton thread, about an arm’s length' },
          { name: 'A brown, green or white candle in a holder', ref: 'traditional/candle/brown', optional: true },
          { name: 'A pot of soil or a houseplant', optional: true },
        ],
        preparation: 'Choose any day but a Friday for this first meeting, so you can tie the thread. Tidy one small surface; a kitchen table is ideal, since Mokosh belongs to the working house. Wash your hands. Set out the water, bread and thread.',
        steps: [
          {
            title: 'Settle',
            instructions: 'Sit at the table. Put both hands flat on it and breathe slowly. Feel the weight of your arms and the work they have done.',
            minutes: 2,
          },
          {
            title: 'Light, if you wish',
            instructions: 'If you are using a candle, light it now.',
            light: true,
          },
          {
            title: 'Greet her',
            instructions: 'Speak to her quietly, as to an older woman of the house.',
            spoken: 'Mokosh, spinner, mother of the damp earth,\nI greet you at my table, with my hands open.',
          },
          {
            title: 'Name yourself',
            instructions: 'Say your name, where you live, and in a sentence or two why you have come. Be plain. You need not ask anything yet.',
            minutes: 3,
          },
          {
            title: 'Pour and give',
            instructions: 'Dip your fingers in the water and sprinkle a few drops on the soil or plant, or on the table. Set the bread beside the bowl.',
            spoken: 'Water for the earth, bread from the earth.\nThis is my small gift.',
          },
          {
            title: 'Tie the first knot',
            instructions: 'Take the thread and tie one knot near one end, pulling it snug. This is the first knot of a cord you will add to through the month.',
            spoken: 'One knot for my coming.\nLet what I make here be well made.',
          },
          {
            title: 'Sit a while',
            instructions: 'Sit quietly with the bread, water and thread for a few minutes. Let your mind wander to the people who worked with their hands before you.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions: 'Thank her and snuff the candle if lit. Keep the thread in a small dish where her shrine will be.',
            spoken: 'Thank you, Mokosh. I will come again.',
            snuff: true,
          },
        ],
        closing: 'Pour the rest of the water onto a plant or into the earth outside. Put the bread out for birds or into the soil. Keep the knotted thread.',
        safety: 'Keep a lit candle away from thread, wool and cloth, and never leave it unattended. Bread put out for birds should be in small amounts; do not leave it where pets or vermin will gorge on it.',
      },
    },
    {
      kind: 'study',
      title: 'Learning the Spinner',
      intro: 'Ten days of reading, one lesson every two days or so. You will learn what the sources say, what thread and damp earth meant, how St Paraskeva carried her customs, and how people honour Mokosh today.',
      days: 10,
      lessons: [
        {
          id: 'mokosh-who',
          title: 'Who Mokosh is',
          summary: 'One line in a chronicle, a handful of sermons, and a name that smells of rain.',
          minutes: 6,
          sections: [
            {
              heading: 'The one goddess on the hill',
              body: `In the year 980, says the Russian Primary Chronicle, Prince Vladimir set up idols on the hill outside his hall in Kiev: “one of Perun, made of wood with a head of silver and a mouth of gold, and others of Khors, Dazhbog, Stribog, Simargl, and Mokosh.” She is last in the list, and she is the only goddess.

That is almost all the chronicle gives us. Eight years later Vladimir was baptized and the idols were destroyed. Mokosh’s name does not appear in the treaties, where men swore by Perun and Volos, and no medieval writer describes her image or her rites.`,
            },
            {
              heading: 'The scolding sermons',
              body: `What we have next is the Church complaining. Old Russian sermons from the eleventh to fourteenth centuries, such as the Sermon of a Certain Christ-Lover, list the gods people still pray to in secret, and Mokosh is often among them, next to Perun, Khors and the Rod and Rozhanitsy, the spirits of birth and fate. Sixteenth-century guides for priests hearing confession go further. One question asks the penitent whether they have gone about with impious women and prayed to the vilas, to Rod and the Rozhanitsy, to Perun, Khors and Mokosh, and eaten and drunk in their honour. Another, in a small village rulebook, asks simply, “Did you go to Mokusha?”

That last question is less clear than it looks. Many scholars think mokusha there means a wise woman or sorceress, someone you visited for a charm, rather than the goddess herself. Either way, the picture is of people, and especially women, still keeping company with the old powers long after conversion, in ways the Church could name but not stop.`,
            },
            {
              heading: 'Her name',
              body: `Most scholars connect her name to the Slavic root mok-, wet or moist: the word for wet in Russian is mokryi, and to soak is moknut. That fits her later link with damp earth, rain, wells and springs. Another theory ties it to an old word for spinning, and a third to the Finnic Moksha people of the Volga, since Vladimir’s Kiev was full of neighbours. None is proven.

Place names across the Slavic world keep her: Mokošica near Dubrovnik in Croatia, and other small villages and hills in Czech, Slovene and Russian lands. That suggests she was known far beyond Kiev, not just a court goddess.`,
            },
            {
              heading: 'What not to believe',
              body: `Because so little survives, Mokosh has been made into almost anything. Nineteenth-century writers compared her to Astarte and Aphrodite. W. R. S. Ralston, writing in 1872, reported that “Mokosh has been taken to be a female deity, and has been likened to Astarte,” and answered plainly: “But these are the wildest of conjectures.” He went too far in doubting even that she was female, but his caution is a good model.

Today you will read that she is Perun’s wife, the Great Mother of all Slavs, a moon goddess, or the same as Mother Damp Earth. Each of those is a modern reading. Some are thoughtful; none is attested. You can honour her fully while saying: this is what we know, and this is what people now believe.`,
            },
          ],
          knowAndDont: {
            known: 'Mokosh was the only goddess among Vladimir’s idols in 980. Church sermons from the eleventh to fourteenth centuries name her among the gods still worshipped, and sixteenth-century confession questions still list her among the old gods people prayed to. Place names keep her name in several Slavic countries.',
            unknown: 'We have no description of her image, myths, festivals or prayers. Her name’s meaning is debated. Whether the sixteenth-century question “Did you go to Mokusha?” means the goddess or a village wise woman is disputed. That she was Perun’s wife, a mother goddess, an earth goddess or the same as Mother Damp Earth are all modern interpretations.',
          },
          inPractice: 'Most practitioners today speak to Mokosh simply and familiarly, as to a grandmother of the house, without elaborate titles. Write her few firm facts on the first page of your notebook, and keep the beliefs you meet later on separate pages, marked as modern.',
          reflect: [
            'What does it feel like to honour a goddess known mostly from those who tried to stop her worship?',
            'Why might women in particular have kept going to Mokosh?',
          ],
          further: [
            'The Russian Primary Chronicle, trans. Samuel H. Cross (1930), entry for 980',
            'Linda J. Ivanits, Russian Folk Belief (1989), on Mokosh and Paraskeva Pyatnitsa',
            'W. R. S. Ralston, The Songs of the Russian People (1872), pp. 102–103',
          ],
          library: ['traditional/deity/mokosh', 'traditional/deity/perun'],
        },
        {
          id: 'mokosh-thread-earth',
          title: 'Thread, fate and the damp earth',
          summary: 'What spinning meant in a Slavic village, the women who spin fate, and the Mother Damp Earth.',
          minutes: 7,
          sections: [
            {
              heading: 'Long winters at the spindle',
              body: `For most of history, every thread in a village was spun by hand, almost always by women and girls. Flax and hemp were grown, retted in ponds, beaten, combed, and spun on a drop spindle or distaff through the long dark half of the year. In Russia and Ukraine girls gathered in one house on winter evenings for spinning bees, called posidelki or vechornytsi, with songs, stories, courting and the work never stopping.

So spinning was not a hobby. It was clothing, bedding, dowry, shrouds and trade. A goddess of spinning was a goddess of whether a family was warm, whether a girl could marry, and whether the dead were decently buried.`,
            },
            {
              heading: 'The spinners of fate',
              body: `Across Europe, thread and fate go together: the Greek Moirai, the Norse Norns. Slavic folk belief has its own fate-women. The South Slavs tell of the Sudženice or Rođenice, three women who come to a newborn on the third night and pronounce its destiny. The East Slavs paired Rod and the Rozhanitsy, spirits of birth and lineage, who received offerings of bread, cheese and honey, much to the Church’s annoyance.

Mokosh is never called a fate-spinner in any source. But modern writers often link her to these figures because spinning, birth and women’s fortune all sit in the same corner of village life. Treat that link as a reasonable modern association, not as ancient myth.`,
            },
            {
              heading: 'Mokosha in the north',
              body: `The most direct folk memory comes from the Russian north. In the 1880s the ethnographer Elpidifor Barsov recorded, in the Olonets region, a spirit called Mokusha who went about among people during Great Lent, spinning wool at night and shearing the sheep. When the sheep rubbed off loose wool in spring, people said, “Mokusha has sheared the sheep.” When a spindle whirred in the dark, Mokusha was spinning. Her small offering was a tuft of wool left in the shears overnight.

This is not a grand goddess. It is a household power with sharp eyes, close kin to the kikimora, the spinning house-spirit who in other villages was said to tangle the work of a careless or Friday-working spinner. It shows how deeply spinning, sheep and night-work stayed bound up with her name.`,
            },
            {
              heading: 'Mother Damp Earth',
              body: `Russian folk belief also honours Mat’ Syra Zemlya, Mother Damp Earth. Peasants kissed the ground before swearing, confessed sins to the earth when no priest was near, and in some places would not strike or plough the earth on certain feast days because she was “resting” or pregnant.

Many modern writers treat Mokosh and Mother Damp Earth as one. The sources do not say so, and they may be separate ideas that grew up side by side: a named goddess of women’s work and wetness, and an unnamed holy mother underfoot. In practice, Rodnovers who honour Mokosh nearly always pour water and grain onto the earth for her, so in living devotion the two have met.`,
            },
          ],
          knowAndDont: {
            known: 'The central place of spinning in Slavic village life and the winter spinning bees are well documented. South and East Slavic folk beliefs in fate-women and Rod and the Rozhanitsy are recorded by Church writers and ethnographers. A spinning, sheep-shearing spirit called Mokusha, given a tuft of wool in the shears, was recorded by Barsov in the Olonets region in the 1880s. Mother Damp Earth is a well-attested folk concept.',
            unknown: 'Whether the pagan Mokosh was a fate-goddess, an earth goddess, or neither is not known. The link between Mokosh and Mother Damp Earth is a modern equation. The northern Mokusha may be a faded memory of the goddess or a separate household spirit who shares her name.',
          },
          inPractice: 'Rodnovers and folk practitioners honour Mokosh through work: spinning, weaving, embroidery, mending, baking. Many begin a piece of handwork with a few words to her and finish it the same way. Pouring a little water and grain onto the earth, or into a plant pot, is the commonest offering.',
          reflect: [
            'What work in my life is unseen but holds things together?',
            'Do I believe in fate? How does the image of a thread being spun sit with me?',
          ],
          further: [
            'Elizabeth Wayland Barber, Women’s Work: The First 20,000 Years (1994), on spinning and weaving in early Europe',
            'Joanna Hubbs, Mother Russia: The Feminine Myth in Russian Culture (1988), thoughtful but speculative in places',
          ],
          library: ['traditional/crystal/moss_agate', 'traditional/herb/mugwort'],
          premade: ['folk-nine-knots'],
        },
        {
          id: 'mokosh-paraskeva',
          title: 'Friday and St Paraskeva',
          summary: 'How the Friday saint carried Mokosh’s care of women, wells and spinning, and the rules she kept.',
          minutes: 7,
          sections: [
            {
              heading: 'Paraskeva Pyatnitsa',
              body: `Paraskeva is an early Christian martyr, said to have been born to parents who kept Friday holy, and her Greek name means Friday, the day of preparation. In the East Slavic lands she became Paraskeva Pyatnitsa, Paraskeva Friday, and around her grew a whole women’s cult that the Church never quite controlled.

She was the patron of spinning, weaving and women’s work, of brides and marriage, of trade and markets (often held on Fridays), and of wells and springs. Her icons hung in little wooden chapels over wells and at crossroads. Her feast is on 28 October in the old calendar, 10 November in the new, and many villages also kept nine or twelve special Fridays through the year in her honour.`,
            },
            {
              heading: 'The Friday rules',
              body: `What made Pyatnitsa remarkable was her prohibitions. On Fridays, and above all on her feast, women were not to spin, weave, sew, wash clothes, wash their hair, or in some places even comb it, bake, or have sex. Some would not plough. A popular legend said Pyatnitsa had appeared to a woman, her body pierced all over with needles and spindles, and told her these were the wounds of every woman who had worked on her day.

Women brought her offerings of flax, yarn, wool and small coins, tying them to her icon or dropping them into her well. The Moscow Church council of 1551, the Stoglav, complained of wandering men and women who claimed to have seen St Pyatnitsa in visions and told people which days to keep, and Church writers grumbled for centuries that Friday was being kept more strictly than Sunday.`,
            },
            {
              heading: 'Is Paraskeva Mokosh?',
              body: `Many scholars of the twentieth century, Toporov and Rybakov among them, thought Paraskeva Pyatnitsa took over much of Mokosh’s role, because the two share spinning, women, water and fertility, and because the Friday taboos look like an older women’s observance wearing a saint’s name.

But it is not proven, and more recent scholars, including Eve Levin, argue that Paraskeva’s spinning, water and Friday all have Christian roots: Friday was the day of the Passion and of fasting, and the bans on women’s work grew from that. Say it with care. Paraskeva is a Christian saint with her own history and her own living devotees. For Orthodox women who keep her Fridays today, she is not a disguised goddess. If you borrow her customs, do it knowing they come from a Christian folk practice.`,
            },
            {
              heading: 'Using the Friday wisely',
              body: `Modern Rodnovers who honour Mokosh have mostly adopted Friday as her day, because of Paraskeva. This creates a lovely paradox. The way to honour her on Friday is to rest: put down the needle, leave the laundry, let your hands be still. You do her work the other six days.

If you have to work on Fridays, as most people do, keep the taboo where you can: no sewing, mending or laundry in the evening, a clean cloth on her shrine, a cup of water poured out for her. It turns Friday from a chore day into a small rest, which is exactly what those village women claimed for themselves.`,
            },
          ],
          knowAndDont: {
            known: 'St Paraskeva Pyatnitsa was widely honoured in Russia, Ukraine and Belarus as a patron of spinning, women, marriage, markets and wells, with strict taboos against women’s work on Fridays and offerings of flax and yarn. The Stoglav council of 1551 condemned self-appointed prophets of Pyatnitsa, and Church writers objected to excessive Friday observance. Her feast is 28 October (Julian) or 10 November (Gregorian).',
            unknown: 'Whether Paraskeva’s cult directly continues the worship of Mokosh is an older, still popular scholarly hypothesis that several recent scholars reject; it is not a proven fact. Whether the pagan Mokosh had any link to Friday is unknown; the week itself came to the Slavs with Christianity.',
          },
          inPractice: 'Keep Friday evenings as her rest: no sewing, mending or washing, a fresh cloth on the shrine, a cup of water poured for her. On or near 10 November, some Rodnovers hold a Mokosh feast with bread, grain and offerings of thread; others hold it at the last Friday of October after the harvest.',
          reflect: [
            'What would it mean for me to keep one evening a week free of chores?',
            'How do I feel about learning from Christian customs for a pagan devotion?',
          ],
          further: [
            'Linda J. Ivanits, Russian Folk Belief (1989), chapter on Paraskeva Pyatnitsa',
            'Eve Levin, “Dvoeverie and Popular Religion,” in Seeking God (1993), on the idea of “double faith”',
          ],
          library: ['traditional/deity/mokosh'],
        },
        {
          id: 'mokosh-today',
          title: 'Mokosh today',
          summary: 'How Rodnovers and folk practitioners honour her now, and how to do it inclusively.',
          minutes: 6,
          sections: [
            {
              heading: 'In the Native Faith',
              body: `In modern Rodnovery, Mokosh is one of the most loved deities, especially among women. Groups in Poland, Ukraine, Russia, Czechia and elsewhere hold rites for her in autumn after the harvest and on Fridays near Paraskeva’s day. Offerings go to the fire or the earth: bread, grain, flax, wool, embroidered cloth, and water poured on the ground. Women’s circles spin or embroider together, sometimes in the old spinning-bee manner, with songs.

You will often see her honoured with embroidered towels, the rushnyk of Ukraine and the rushnik of Belarus and Russia, whose red-and-white patterns of women, birds and trees are read by modern writers as images of a goddess. Some of those readings are old ethnographic guesses, some newer; the embroidery itself is a living, beautiful folk art.`,
            },
            {
              heading: 'How the modern picture differs',
              body: `In many Rodnover theologies, Mokosh is Perun’s wife and the great mother of the earth, sometimes with Veles as her other partner or abductor, following the storm-myth reconstruction. Others see her more modestly, as the goddess of women’s work and of luck in the home. A few connect her to the moon, which has no Slavic basis at all.

You do not have to choose a theology. You can honour her as the source sees her, a goddess who mattered enough to stand on Vladimir’s hill and be secretly visited for centuries, and add the modern pictures that speak to you, marked as such.`,
            },
            {
              heading: 'For everyone',
              body: `She was a women’s goddess in a world where spinning was women’s work, and women’s circles do valuable work honouring her. But her gifts, of patience, practical skill, steady care and the dignity of daily labour, belong to anyone. Men spin. Trans women and non-binary people keep households. People of every background mend.

This journey is open to all of them. Some Rodnover groups treat the goddesses as guardians of an ethnic “mother line,” and some prescribe narrow roles for women. That is not the stance here. Mokosh is a goddess of good work, not of who you are born as.`,
            },
            {
              heading: 'A devotion of hands',
              body: `The simplest and most honest way to honour Mokosh is to make something, mend something, or care for something living, and say so to her. Knit a scarf for someone who is cold. Sew a button back on. Grow herbs on a windowsill. Teach a child to plait. Each is an offering if you dedicate it.

Keep the work humble and real. Store-bought cloth is fine; what matters is the hours and care you add. If you have never done handwork, start with the smallest thing: a cord twisted from two threads, a knotted bracelet, a darned sock. She was the goddess of beginners too, every girl at her first distaff.`,
            },
          ],
          knowAndDont: {
            known: 'Mokosh is widely honoured in modern Rodnovery and folk practice with autumn and Friday rites, offerings of bread, grain, thread and water, and women’s circles of handwork. Slavic embroidery traditions are old and well documented.',
            unknown: 'Readings of embroidery motifs as images of Mokosh are interpretations, not documented meanings. Her marriage to Perun, her role in the storm myth, and her identity as the earth mother are modern constructions.',
          },
          inPractice: 'Dedicate one small piece of handwork to her this week, any day but Friday: say a few words as you begin and as you finish, and put the finished piece on her shrine for a night before you use or give it.',
          reflect: [
            'What can I make or mend for her this month?',
            'Whose unseen work do I depend on, and how could I honour it?',
          ],
          further: [
            'Kaarina Aitamurto and Scott Simpson (eds.), Modern Pagan and Native Faith Movements in Central and Eastern Europe (2013)',
            'Mary B. Kelly, Goddess Embroideries of Eastern Europe (1989), an enthusiast’s study; read critically',
          ],
          library: ['traditional/deity/mokosh', 'traditional/crystal/garnet'],
          premade: ['folk-rowan-red-thread'],
        },
      ],
      practices: [
        {
          id: 'mokosh-ask-elder',
          title: 'Ask someone who remembers',
          instructions: 'Ask an older relative, neighbour or friend what handwork they learned and from whom, and what customs they remember around it: lucky and unlucky days, things you must never do, what was made for weddings and funerals. Write down what they say in their words.',
          times: 1,
          prompt: 'What did they remember that no book told me?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights of thread and water',
      intro: 'Now you set up her shrine and keep nine nights of offering. Each night you add a knot to the cord you began at the threshold, except on Friday, when you rest your hands.',
      days: 9,
      lessons: [
        {
          id: 'mokosh-shrine-offerings',
          title: 'Shrine, days and offerings',
          summary: 'Where her shrine goes, what to give her, how to give it, and what to avoid.',
          minutes: 6,
          sections: [
            {
              heading: 'A shrine near the work',
              body: `Mokosh belongs where the work happens: the kitchen, the sewing basket, the windowsill where the herbs grow. A shelf or a corner of a table near your workspace is better than a grand altar in a room you never use.

On it, put a bowl of water and a small dish of grain or flour. Add something of thread or fibre: a spindle if you have one, a ball of wool, a skein of linen, the knotted cord from your threshold rite. A brown, green, red or white candle suits her, and moss agate or garnet if you like stones. An embroidered cloth underneath is traditional in feeling. A little pot of earth or a living plant reminds you of the damp ground she was linked with.`,
            },
            {
              heading: 'What to give',
              body: `The offerings with the best grounding come from Paraskeva’s customs and from Rod and the Rozhanitsy: flax, yarn, wool, bread, grain, honey, cheese, and water. Modern devotion adds embroidered cloth and finished handwork. Keep it humble and homemade where you can; she is not a goddess of shop-bought luxury.

Water poured on the earth or into a plant is her simplest offering. Grain scattered for birds, or sown, is another. Thread is given by tying it: to her shrine, to a branch near a well or spring, or around a tree, using only natural fibres so nothing harms a bird.`,
            },
            {
              heading: 'The manner of giving',
              body: `Sit or stand at your work table. Wash your hands first; the women who served her worked with clean hands. Speak to her quietly, as you would to an older relative you respect. Say what you are giving and what you are making, and if you ask something, ask once and plainly.

Offerings of food go out within a day, to the earth or the birds. Water goes onto a plant or the ground. Thread and cloth can stay on the shrine for a season and then be given to a tree, buried, or burned in a safe fire. Do not eat her bread or drink her water once you have given it.`,
            },
            {
              heading: 'What to avoid',
              body: `Do not spin, sew, knit, mend or do laundry on Friday evenings in her name; that is the one thing every source agrees she, or her saint, disliked. Do not leave work sloppily unfinished on her shrine; northern house-spirits of the spindle were said to tangle a careless spinner’s work.

Do not use her for magic aimed at controlling someone’s fertility, marriage or fate. Spinning someone else’s thread for them is not a gift. Be careful with plastic or acrylic yarn as an offering outdoors; birds and animals can be trapped or poisoned by it. And do not treat Paraskeva’s Orthodox devotees as secret pagans or her icons as goddess images to collect.`,
            },
          ],
          knowAndDont: {
            known: 'Offerings of flax, yarn, wool and coins to St Paraskeva, and of bread, cheese and honey to Rod and the Rozhanitsy, are documented. The Friday taboo is widely recorded. Water and earth offerings to Mokosh are standard in modern Rodnovery.',
            unknown: 'What pagan Slavs actually gave Mokosh is unknown. The shrine setup here is modern, built from folk practice and the household’s holy corner.',
          },
          inPractice: 'Set her shrine near your work today. Over nine nights, keep it with water, grain, a crumb of bread, and the cord. Each night but Friday, tie one knot. On Friday, change her cloth and water and rest your hands.',
          reflect: [
            'Where is the real centre of work in my home?',
            'What is the most honest, humble thing I could give her?',
          ],
          library: ['traditional/crystal/moss_agate', 'traditional/candle/brown', 'traditional/candle/green', 'traditional/vessel/bowl', 'traditional/herb/chamomile'],
          premade: ['hedge-house-spirit-offering', 'kitchen-prosperity-bread'],
        },
      ],
      practices: [
        {
          id: 'mokosh-nine-nights',
          title: 'Nine nights of thread and water',
          instructions: 'On each of nine nights, sit at her shrine, wash your hands, pour a little water onto a plant or into a dish, and set out a pinch of grain. Speak to her for a few minutes about the work of your hands that day. Then tie one more knot in your cord, saying a word for what you wish to be well made in your life. On Friday, tie no knot: change the cloth and water, and simply sit with her. On the ninth night, tie the last knot and lay the finished cord on her shrine.',
          times: 9,
          every: 'day',
          prompt: 'What did I make, mend or tend today, and what knot did I tie for it?',
          premade: 'folk-nine-knots',
        },
        {
          id: 'mokosh-make-something',
          title: 'Make one thing for her',
          instructions: 'During the nine nights, make or mend one small thing with your hands and dedicate it: a darned sock, a short embroidered line on a cloth, a loaf of bread, a twisted cord. It does not have to be good. It has to be yours.',
          times: 1,
          prompt: 'How did it feel to give work, rather than buy a gift?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Weighing the thread',
      intro: 'Before dedicating, pause. Read these questions over several days and answer honestly. Choosing to keep honouring her without a formal dedication, pausing, or turning to another god are all good outcomes.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'mokosh-discernment-write',
          title: 'Write it out',
          instructions: 'Answer the questions below in your journal across a few days. Reread your threshold entry. Then write, in one sentence, the kind of work or care you would promise her for a year.',
          times: 1,
          prompt: 'What could I offer her with my hands, every week, in a bad year as well as a good one?',
        },
      ],
      questions: [
        'Did honouring Mokosh make my daily work feel more meaningful, or more burdensome?',
        'Am I drawn to her as she appears in the sources, a goddess of work and water, or mainly to a modern image of the Great Mother? Am I at peace with the difference?',
        'Can I keep a simple weekly practice, such as Friday rest and a cup of water, for a year?',
        'Have I thought about how I relate to St Paraskeva’s Christian devotees and their customs?',
        'If I came to her with hopes about fertility or family, am I also getting the practical and medical support I need?',
        'Would it be enough, for now, to keep honouring her without a formal dedication?',
      ],
    },
    {
      kind: 'dedication',
      title: 'Binding the cord',
      intro: 'If you have decided to go ahead, this is your dedication. It is a self-dedication, a promise between you and Mokosh. It is not an initiation into any group or priesthood and does not replace one if you later join a community with its own rites. Stopping before this, or choosing another path, would have been a good outcome too.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Dedication to Mokosh',
        summary: 'Water to the earth, bread and grain, a piece of handwork laid down, and the nine-knot cord bound with a promise.',
        minutes: 40,
        ingredients: [
          { name: 'A bowl of spring water or water left to stand overnight', ref: 'traditional/vessel/bowl' },
          { name: 'A round loaf or a piece of good bread' },
          { name: 'A small dish of grain: wheat, rye, barley or oats' },
          { name: 'Your nine-knot cord from the practice stage' },
          { name: 'A piece of handwork you made or mended' },
          { name: 'A brown, green or white candle', ref: 'traditional/candle/green' },
          { name: 'A pot of soil or a living plant, or a patch of earth outdoors' },
          { name: 'A moss agate or garnet to keep', ref: 'traditional/crystal/moss_agate', optional: true },
        ],
        preparation: 'Choose a day that is not a Friday, since you will be binding thread. A day near the new moon or in autumn after harvest suits her well, but any quiet day will do. Clean your work table and lay a fresh cloth. Wash your hands. Write in one sentence what you promise her for a year: “I will mend rather than throw away,” “I will keep Friday evenings as rest,” “I will teach someone what I know.”',
        steps: [
          {
            title: 'Set the table',
            instructions: 'Lay the bread, grain, water, cord and handwork on the cloth, with the candle at the back and the soil or plant at the front.',
          },
          {
            title: 'Light',
            instructions: 'Light the candle and sit or stand quietly before it.',
            light: true,
          },
          {
            title: 'Call her',
            instructions: 'Speak to her warmly, as to the eldest woman of the house.',
            spoken: 'Mokosh, spinner, keeper of the work of hands,\nmother of the wet earth and the full well,\nI come to your table as one who works.\nSit with me.',
          },
          {
            title: 'Water to the earth',
            instructions: 'Pour some of the water slowly onto the soil, plant or ground. Watch it soak in.',
            spoken: 'Water to the earth, as rain comes to the field.\nDrink, mother, and be glad.',
          },
          {
            title: 'Bread and grain',
            instructions: 'Break the bread and set the first piece by the soil. Scatter a pinch of grain on top.',
            spoken: 'Bread from the field and grain for the next field.\nThis is the first of my table.',
          },
          {
            title: 'Lay down the work',
            instructions: 'Put your hands on the piece of handwork. Tell her in your own words what it is, how you made it, and what you want your hands to do in her service.',
            minutes: 3,
          },
          {
            title: 'Bind the cord',
            instructions: 'Take your nine-knot cord. Join its two ends with a final knot, making a ring. As you pull the knot tight, speak your promise once, then the words below.',
            spoken: 'This I promise for a year and a day.\nI give myself to your honour, Mokosh,\nto do my work well and not despise it,\nto mend, to tend and to share,\nand to rest on the day that is yours.',
          },
          {
            title: 'Sit in quiet',
            instructions: 'Sit with the ring of cord in your hands for a few minutes. Let the stillness of your hands be part of the offering.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions: 'Thank her. Lay the cord on her shrine, with the stone if you brought one. Snuff the candle.',
            spoken: 'Thank you, Mokosh. Your thread is in my hands.',
            snuff: true,
          },
        ],
        closing: 'Take the bread and grain outside for the birds or bury them in the earth. Pour the last of the water on a plant. Keep the cord on her shrine for the year; you may wear it as a bracelet on her days. Note the date for your renewal.',
        safety: 'Keep candles away from cloth, wool and the cord, and never leave a flame unattended. Scatter only small amounts of bread and grain outside. Use natural fibres for anything left outdoors.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the thread',
      intro: 'Your dedication begins a year of practice. Here is a rhythm: Friday rest, the feasts of the autumn and winter, and a yearly renewal.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'mokosh-friday',
          title: 'Friday rest',
          instructions: 'Each Friday evening, put down needle and laundry. Change the water on her shrine, pour the old onto a plant, and sit with her for a few minutes.',
          times: 52,
          every: 'week',
          prompt: 'What did my hands do this week, and what did resting give me?',
        },
        {
          id: 'mokosh-feasts',
          title: 'Her seasons',
          instructions: 'Hold a fuller offering for her in autumn, on or near 10 November (Paraskeva’s day) or at the last Friday of October, with bread, grain and a skein of thread. At Dziady, remember the women of your line who worked with their hands. At Koliada, start a new piece of winter handwork with a word to her. At Kupala, gather herbs with thanks.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did the year’s work make?',
        },
        {
          id: 'mokosh-rededication',
          title: 'Renew the cord',
          instructions: 'A year and a day after your dedication, return to her table. Read your promise aloud and say how you kept it. Untie the ring and tie it again with a new promise, or give the cord to a tree or a safe fire with thanks and release the promise.',
          times: 1,
          prompt: 'What do I promise now, or what do I lay down with thanks?',
        },
      ],
    },
  ],
  sources: [
    'The Russian Primary Chronicle, trans. Samuel H. Cross, in Harvard Studies and Notes in Philology and Literature vol. XII (1930; public domain in the US since 2026), entry for 980, quoted and checked against the scan of that volume (catalogued on archive.org under its companion study, The Don Carlos Theme): https://archive.org/details/doncarlosthemeha0000fred',
    'Sixteenth-century confession questions and the Olonets Mokusha (E. V. Barsov, 1887; N. M. Gal’kovskii, 1916), as summarised in Ivanits (1989) and later surveys; paraphrased and quoted in translation only in short phrases',
    'W. R. S. Ralston, The Songs of the Russian People (1872), p. 102, quoted on Mokosh and Astarte: https://archive.org/details/songsofrussianpe00ralsuoft',
    'Linda J. Ivanits, Russian Folk Belief (1989), on Mokosh, Mokosha and Paraskeva Pyatnitsa',
    'Judith Kalik and Alexander Uchitel, Slavic Gods and Heroes (2019)',
    'Elizabeth Wayland Barber, Women’s Work: The First 20,000 Years (1994)',
    'Eve Levin, “Dvoeverie and Popular Religion,” in S. K. Batalden (ed.), Seeking God (1993)',
    'Kaarina Aitamurto and Scott Simpson (eds.), Modern Pagan and Native Faith Movements in Central and Eastern Europe (2013)',
  ],
};
