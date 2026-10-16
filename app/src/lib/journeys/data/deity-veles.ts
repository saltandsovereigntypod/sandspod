import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-veles',
  kind: 'deity',
  paths: ['slavic'],
  deityRef: 'traditional/deity/veles',
  title: 'Veles, Lord of Herds',
  summary: 'A lunar month with Veles or Volos, god of cattle and wealth, of the dead, of poets and cunning: what the treaties and folklore say, what is reconstruction, and how to honour him low and close to the earth.',
  welcome: `This is a month-long self-dedication to Veles, also called Volos, the Slavic god of herds and wealth, linked with the underworld, waters, magic and poetry. You will learn the scattered evidence, the famous storm myth and how it was rebuilt, his folk customs from the harvest field to the cattle shed, and you will keep nine nights of offering at a low shrine before deciding whether to dedicate yourself.

It is a dedication, not an initiation. It joins you to no group and makes you no volkhv, no priest or sorcerer. It is a bond you choose and keep yourself.

Veles is earthy and clever, and he has a reputation as a trickster. Come to him honestly, with respect and a little caution, and he is generous.`,
  about: `Volos is named twice in the Russian Primary Chronicle as “the god of cattle,” sworn by alongside Perun in the treaties of 907 and 971; his idol is not among those Vladimir set on the hill in 980, and a later tradition places it in the lower town by the river instead. As Veles he appears in the twelfth-century Lay of Igor, where the poet Boyan is called “Veles’s grandson,” in a Rostov saint’s life, and in Czech sayings that use his name for a devil. Cognate words in Lithuanian mean the souls of the dead, which supports his long-standing link with the underworld. Whether Volos and Veles were one god or two is still debated. His famous role as Perun’s serpent adversary, who steals cattle or waters and is struck by lightning, is a reconstruction by Ivanov and Toporov from folklore and comparison. In folk Christianity St Blaise (Vlasiy) took over his care of cattle, and the last ears of the harvest were tied as “Volos’s beard.” Today Veles is one of the most popular gods in Rodnovery, honoured with grain, milk, honey and the dead in winter.`,
  notes: [
    'Veles is linked with the dead and the underworld. Ancestor work with him is gentle and devotional here; this journey does not call up spirits.',
    'The Book of Veles (Velesova kniga), named after him and widely quoted online, is a twentieth-century forgery. So is the Prav–Yav–Nav cosmology as usually presented, which comes from that book.',
    'His trickster side is a modern emphasis built on folklore of the devil and on comparison with other gods. Approach him with honesty; cunning is not a licence for dishonesty.',
    'Rodnovery includes inclusive and nationalist groups. This journey is inclusive: Veles is not a bloodline god.',
    'Many of his offerings involve dairy and animals. If you are vegan, grain, water, bread made without dairy, and care for animals are just as fitting.',
  ],
  holyDays: ['koliada', 'dziady'],
  stages: [
    {
      kind: 'threshold',
      title: 'At the roots',
      intro: 'You begin low, close to the floor and the earth. A dark candle, a little milk or water, the last bite of your supper, and your name. Veles is not met on the hilltop; he is met where things are kept and where they rest.',
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'veles-threshold-journal',
          title: 'What I already have',
          instructions: 'After the opening rite, list what you already have that you are grateful for: food, a roof, animals, people, skills, memories of the dead. Veles is a god of wealth, and old wealth was counted in livestock and stores, not wishes.',
          times: 1,
          prompt: 'What wealth do I already have that I rarely count?',
        },
      ],
      rite: {
        title: 'Introduction at the threshold',
        summary: 'Sitting low, offering the last bite, and speaking your name to the god of the depths.',
        minutes: 20,
        ingredients: [
          { name: 'A black, brown or dark green candle in a sturdy holder', ref: 'traditional/candle/brown' },
          { name: 'A small cup of milk, or water if you avoid dairy' },
          { name: 'The last bite of your supper, set aside on a small plate', ref: 'traditional/vessel/dish' },
          { name: 'A little wool or a few strands of your own hair, combed out', optional: true },
        ],
        preparation: 'Do this in the evening, after supper. Set aside the last bite of what you ate before you finish. Find a place low down: the floor beside your front door, a low shelf, the corner of a room. Sit on the floor or a low stool.',
        steps: [
          {
            title: 'Sit low',
            instructions: 'Sit on the floor or a low seat. Put your palms on the floor and feel the building and the ground beneath it. Breathe slowly.',
            minutes: 2,
          },
          {
            title: 'Light',
            instructions: 'Light the dark candle and set it on the floor or low shelf in front of you.',
            light: true,
          },
          {
            title: 'Call him',
            instructions: 'Speak to him in a low, steady voice.',
            spoken: 'Veles, Volos, lord of the herds,\nkeeper of what is stored and what lies under,\nI greet you from my own floor.',
          },
          {
            title: 'Name yourself',
            instructions: 'Tell him your name, where you live, and why you have come, in your own words. Be honest about what you want; he is said to prefer a plain bargain to a pretty speech.',
            minutes: 3,
          },
          {
            title: 'Give the last bite',
            instructions: 'Set the last bite of your supper and the cup of milk before the candle. If you brought wool or hair, lay it beside them.',
            spoken: 'The last of my table is yours,\nand the first thanks for what I have.',
          },
          {
            title: 'Listen in the dark',
            instructions: 'Sit quietly for a few minutes with the candle. Let your eyes rest on the shadows rather than the flame.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions: 'Thank him and snuff the candle.',
            spoken: 'Thank you, Veles. I will come again.',
            snuff: true,
          },
        ],
        closing: 'In the morning, take the bite and the milk outside and leave them at the foot of a tree, by water, or bury them in soil. Do not eat or drink them. If you cannot go out, put them in compost.',
        safety: 'A candle on the floor is easy to knock over: use a deep, stable holder, keep it away from curtains and clothing, and never leave it with pets or children. Milk left out sours quickly; dispose of it within a day.',
      },
    },
    {
      kind: 'study',
      title: 'Learning the Lord of Herds',
      intro: 'Ten days of reading, a lesson every two days. You will learn what the sources say about Volos and Veles, the storm myth from his side, his folk customs, and how he is honoured now.',
      days: 10,
      lessons: [
        {
          id: 'veles-who',
          title: 'Who Veles is',
          summary: 'Two names, a handful of mentions, and why the dead keep appearing in his story.',
          minutes: 7,
          sections: [
            {
              heading: 'The god of cattle in the treaties',
              body: `The first time we meet him is in the Russian Primary Chronicle, in the treaty of 907 between Prince Oleg and the Byzantine emperors. Oleg’s men, it says, “swore by their weapons and by their god Perun, as well as by Volos, the god of cattle, and thus confirmed the treaty.” In 971 Prince Svyatoslav calls a curse on himself if he breaks his treaty: may he be “accursed of the God in whom we believe, namely, of Perun and Volos, the god of flocks.”

Two things stand out. He is sworn by side by side with Perun, not against him. And he is defined by cattle. In a world where wealth walked on four legs, a god of cattle was a god of wealth, and the Old Russian word for cattle, skot, also meant money.`,
            },
            {
              heading: 'Missing from the hill',
              body: `When Vladimir set up his idols on the hill outside his hall in 980, the chronicle names Perun, Khors, Dazhbog, Stribog, Simargl and Mokosh. Volos is not there. A later Kievan tradition says his image stood instead down in the Podil, the lower trading town by the river, and that Vladimir had it thrown into the Pochaina river at the conversion.

If that is right, it fits him beautifully: Perun on the height by the prince’s hall, Volos below among the merchants, the herds and the water. In Rostov, a saint’s life tells how St Abraham destroyed a stone idol of Veles that the people of the town’s Finnic quarter still honoured.`,
            },
            {
              heading: 'Veles the poet’s grandfather',
              body: `The form Veles appears in the Lay of Igor’s Campaign, a poem about a disastrous raid of 1185. The poet calls on Boyan, a legendary singer of the past, as “Veles’s grandson,” wise and prophetic. So Veles is also, at least in this poem, the ancestor of poets and of inspired speech.

In Czech, later sources use veles for a devil or demon, and an old curse sends someone “to Veles beyond the sea.” In Lithuanian, the related word vėlės means the souls of the dead, and velnias is the devil. Put together, these suggest a god of the land beneath and beyond, the dead, magic and words, whom Christian writers easily turned into a demon.`,
            },
            {
              heading: 'One god or two?',
              body: `Scholars still argue whether Volos and Veles were the same god. The names are close, and the Lay of Igor uses Veles where the treaties have Volos, but they could be regional forms, a merging of two figures, or two different gods. Most modern Rodnovers treat them as one.

What you can say confidently is that a god of cattle named Volos was honoured by the Rus in the tenth century, that a god named Veles was remembered as grandfather of poets and as a devil-like figure, and that both names connect to the dead, wealth and the lower world. The rest, his horns, his bear shape, his serpent form, his marriages, is drawn from folklore and comparison.`,
            },
          ],
          knowAndDont: {
            known: 'Volos, “god of cattle” or “of flocks,” is sworn by with Perun in the treaties of 907 and 971. He is absent from Vladimir’s hilltop pantheon of 980. Veles appears in the Lay of Igor as Boyan’s grandfather, in the Life of Abraham of Rostov as an idol destroyed, and in Czech sources as a devil-name. Related Baltic words refer to the dead and the devil.',
            unknown: 'Whether Volos and Veles are one god is debated. The tradition of his idol in the Podil is late. His appearance, family, myths and the details of his worship are not recorded in any pagan source.',
          },
          inPractice: 'Most Rodnovers call him Veles, and some Volos; a few use both together. He is honoured low down, near water or the ground, often at dusk or in winter. Write his firm facts on the first page of your notebook, and keep folklore and modern belief on later pages, labelled.',
          reflect: [
            'Why might a god of cattle also become a god of the dead, of poets and of magic?',
            'How does it feel to honour a god whom the Church turned into a devil?',
          ],
          further: [
            'The Russian Primary Chronicle, trans. Samuel H. Cross (1930), entries for 907 and 971',
            'The Tale of the Armament of Igor, trans. Leonard A. Magnus (1915)',
            'Judith Kalik and Alexander Uchitel, Slavic Gods and Heroes (2019), on Volos and Veles',
          ],
          library: ['traditional/deity/veles', 'traditional/deity/perun'],
        },
        {
          id: 'veles-storm-myth',
          title: 'The serpent under the oak',
          summary: 'The storm myth from Veles’s side, what it is built from, and why he is not the devil.',
          minutes: 7,
          sections: [
            {
              heading: 'The story as rebuilt',
              body: `In the reconstruction most Rodnovers use, the world is a great tree. Perun sits at the top. At the roots, in the wet dark, lies Veles in the shape of a serpent or dragon, or as a shaggy horned beast. Veles climbs up and steals Perun’s cattle, or his wife, or his son, or the waters of the world. Perun hunts him with lightning. Veles hides in trees, stones, animals and people, changing shape, until he is driven back down to the roots and the waters are released as rain.

In many Rodnover versions, this happens every year. Veles is not destroyed, only returned to his place. The world needs both of them: the god above who brings order and the god below who keeps wealth and the dead.`,
            },
            {
              heading: 'Where it comes from',
              body: `This story is the work of two Soviet scholars, Vyacheslav Ivanov and Vladimir Toporov, in the 1970s. They built it from folk songs and charms in which a thunderer chases a hiding devil, from place names that pair a Perun’s height with a Veles-sounding low ground, from Baltic songs of Perkūnas and Velnias, and from other Indo-European myths: Indra and the serpent Vṛtra, Thor and the world serpent.

Not every scholar accepts it. No medieval text calls Veles Perun’s enemy, and in the treaties they stand together. Some think the folk devil who hides from the thunder is simply the Christian devil, and that linking him with Veles is a scholarly leap. W. R. S. Ralston reported in 1872 that the great folklorist Afanasyev thought Volos was originally just a title of Perun himself, as the herdsman of the cloud-cattle. Every generation of scholars has had its own Veles.`,
            },
            {
              heading: 'The dead, and the cattle of the sky',
              body: `Still, two threads run steadily through the evidence. One is cattle and wealth. The other is the dead. The Baltic vėlės are souls; Slavic folk belief speaks of the dead as navi; and many cultures picture the underworld as a green pasture where the dead graze their herds. A god who guards cattle and a god who guards the dead may well be the same god.

That explains much of his modern character. He is the keeper of what is below: stores, roots, the dead, the hidden knowledge of sorcerers and the deep well of poetry. He is not evil. He is the other half of the world.`,
            },
            {
              heading: 'Prav, Yav and Nav',
              body: `You will often read that Slavs divided the world into Prav (the realm of the gods and right order), Yav (the visible world) and Nav (the world of the dead), with Perun ruling Prav and Veles Nav. This triad comes from the Book of Veles, a text that surfaced in the 1950s claiming to be written on ancient wooden boards. The boards were never produced and the language is a modern pastiche; scholars agree it is a forgery.

The words themselves are older: pravda means truth and justice, yav means waking reality, and navi was an Old Russian word for the dead. Many Rodnovers find the three-world picture meaningful and use it knowing its source. If you use it, say it is a modern framework.`,
            },
          ],
          knowAndDont: {
            known: 'The Perun–Veles battle as usually told was reconstructed by Ivanov and Toporov in the 1970s from folklore, place names and comparison. Folk legends of a thunderer chasing a hiding devil are recorded. Baltic cognates link Veles’s name with the dead. The Prav–Yav–Nav triad comes from the forged Book of Veles.',
            unknown: 'Whether pagan Slavs saw Veles as Perun’s adversary is unknown. Whether he was a serpent, a bear, horned, or any shape is unknown. The idea that the reconstruction reflects a single early Slavic myth is plausible but unproven.',
          },
          inPractice: 'Rodnovers who honour both gods usually keep them in separate places: Perun high, with fire; Veles low, by water or earth. Many tell the storm myth at the first spring thunder, when Veles is driven down and the rain comes, and turn to Veles in the dark half of the year, when the dead come close.',
          reflect: [
            'What in my life belongs to the roots: kept, hidden, stored or grieved?',
            'Can I honour a god of shadows without making him a villain or a hero?',
          ],
          further: [
            'V. V. Ivanov and V. N. Toporov, Issledovanija v oblasti slavjanskih drevnostej (1974) (Russian)',
            'Radoslav Katičić, Božanski boj (2008) (Croatian)',
            'W. R. S. Ralston, The Songs of the Russian People (1872), pp. 251–3',
          ],
          library: ['traditional/deity/perun', 'traditional/herb/oak', 'traditional/herb/willow'],
        },
        {
          id: 'veles-folk',
          title: 'The beard of Volos and the cattle saint',
          summary: 'The harvest, the herd, the stars and the winter masks: where Veles lived on in folk custom.',
          minutes: 7,
          sections: [
            {
              heading: 'The last sheaf',
              body: `Across Russia and Ukraine, reapers left the last few ears of grain standing in the field, tied together and decorated, sometimes with bread and salt placed on the ground beside them. Ralston, writing in 1872, describes it exactly: “These ears are eventually knotted together, and the ceremony is called ‘the plaiting of the beard of Volos,’ and it is supposed that after it has been performed no wizard or other evilly-disposed person will be able to hurt the produce of the fields.”

The patch was taboo: whoever cut it, it was said, would shrivel and twist like the ears. Other districts left the same patch for the Prophet Elijah or for St Nicholas. The custom was still kept in the twentieth century, and it is one of the strongest pieces of evidence that Volos was remembered as a god of the harvest and its protection.`,
            },
            {
              heading: 'St Vlasiy and the cattle',
              body: `In Christian times the protection of cattle passed to St Blaise, Vlasiy in Russian, whose name sounds like Volos. On his day, 11 February in the old calendar and 24 February in the new, cattle were blessed, icons of the saint were hung in cow sheds, and butter or ghee was brought to church. Ralston notes that the honours paid to Volos were transferred to his “namesake, St. Vlas.”

St George, Yurii, also guarded herds, especially against wolves, and drove the cattle out to pasture for the first time in spring. Rodnovers sometimes see Veles in both saints, and in the folk spirit of the wild, the leshii, though these are modern links.`,
            },
            {
              heading: 'Hair, wool and stars',
              body: `His name sounds like volos, the Russian word for hair, and wool and hair keep turning up around him: shaggy coats, beards of grain, fleeces. The Pleiades were called Volosyni or Volosozhary in Russian folk speech, a name scholars have long linked to him, so that the god of herds also had a cluster of stars.

In the winter festivals, young men went from house to house dressed as goats, bears and bulls, with turned-out sheepskin coats and horned masks, singing koliadki for gifts. These mummers are a real and lively tradition. Many Rodnovers see Veles in them; the evidence for that link is suggestive but not direct.`,
            },
            {
              heading: 'The dead come home',
              body: `The East Slavic year had several days for the dead, called Dziady (grandfathers) in Belarus and Poland, Radonitsa and the Saturdays of the Dead in Russia. Families cleaned their houses, cooked kutia and pancakes, opened the doors, and set food out for the ancestors.

None of these customs names Veles. But because his name ties him to the dead, Rodnovers often honour him at Dziady and through the dark half of the year from autumn to Koliada. If you do this, honour your ancestors first, as the folk custom does, and Veles as the keeper of their pasture.`,
            },
          ],
          knowAndDont: {
            known: 'The custom of the “beard of Volos” at harvest is documented in the nineteenth century, including by Ralston. St Vlasiy was a cattle saint with blessings of livestock on his day. The Pleiades bore a folk name related to Volos. Winter mummers in animal masks and the feasts of the dead are widely recorded.',
            unknown: 'Whether the mummers, the leshii, St George or the feasts of the dead had anything to do with Veles in pagan times is not known; these are modern connections. Volos’s link with St Vlasiy may be a pun on the name more than a real continuity.',
          },
          inPractice: 'Many Rodnovers make a small “beard of Veles” at harvest time from a few ears of wheat or rye tied with red thread and keep it on the shrine through winter. Others bless pets or farm animals on 24 February, or volunteer at a farm or animal shelter in his name.',
          reflect: [
            'What do I leave standing, uncut, for something larger than myself?',
            'Who are the dead I would want to see grazing in his green pasture?',
          ],
          further: [
            'W. R. S. Ralston, The Songs of the Russian People (1872), pp. 251–3',
            'Linda J. Ivanits, Russian Folk Belief (1989), on the leshii and calendar customs',
            'W. F. Ryan, The Bathhouse at Midnight (1999), on Russian magic and divination',
          ],
          library: ['traditional/herb/wormwood', 'traditional/herb/mugwort'],
          premade: ['folk-dziady-meal', 'hedge-ancestor-candle-evening'],
        },
        {
          id: 'veles-today',
          title: 'Veles today',
          summary: 'Wizards, poets and herdsmen: how he is honoured now, where people differ, and where this journey stands.',
          minutes: 6,
          sections: [
            {
              heading: 'A favourite of the Native Faith',
              body: `In modern Rodnovery, Veles is one of the most beloved gods. He is the patron of the volkhvy, the priests and sorcerers whose name the chronicles used for pagan wise men, and of poets, musicians and storytellers. People ask him for wealth, healthy animals, wisdom, inspiration and the peace of the dead.

Groups honour him most in the winter half of the year. Many hold Velesova noch or Veles’s days in late December around Koliada, and again in February around St Vlasiy’s day, and at the feasts of the dead. Offerings go to fire, earth or water: bread, grain, honey, milk, beer, and the last sheaf.`,
            },
            {
              heading: 'Trickster, or keeper?',
              body: `You will find two modern characters for him. One is the trickster: clever, shape-shifting, a little dangerous, more like Loki or Hermes. The other is the steady keeper: the old herdsman, the guardian of stores, the grandfather of the dead. Both draw on real fragments, the devil-shaped folklore and the cattle-god of the treaties.

Be careful with the trickster image. A god of cunning is not a god of cheating. In the treaties he witnessed oaths, and a cattle god cares above all that the herd is honestly counted. People who come to him for sly advantage often find their bargains go sour.`,
            },
            {
              heading: 'Communities and their divides',
              body: `Rodnovery runs from careful reconstructionism to freely inventive movements with their own scriptures, and Veles, because of the Book of Veles named after him, is at the centre of many inventive ones. Some groups use that book as scripture; reconstructionists reject it.

There is also the political divide. Some Rodnover groups are nationalist or racialist, and some build Slavic paganism into a story of ethnic purity that the history does not support. Other groups are open and anti-racist. Veles was worshipped in a world of traders where Slavs, Norse, Finns, Balts, Khazars and Greeks met in the same markets.`,
            },
            {
              heading: 'Veles and money',
              body: `Because skot meant both cattle and money, many people today come to Veles for help with finances. That is fair, and it can be done honestly. Rodnovers often keep a coin or a little dish of grain on his shrine as a sign of the household’s stores, and thank him on payday.

The best devotion here is practical. Count what you have, as a herdsman counts the herd. Pay debts on time. Do not lend what you cannot lose. Give something to people who have less. A god of wealth who witnessed treaties will look more kindly on an honest budget than on a request for a windfall.`,
            },
            {
              heading: 'Where this journey stands',
              body: `This journey is inclusive. Veles does not belong to a bloodline. Anyone who comes to him with honesty, care for living things and respect for the dead is welcome.

Many people keep a devotion to Veles alone, at home, through ordinary acts: feeding birds in winter, caring for a pet, handling money honestly, telling stories, remembering the dead. These are not lesser forms. They are, if anything, closer to what the scanty evidence actually shows than a grand modern rite.`,
            },
          ],
          knowAndDont: {
            known: 'Veles is widely honoured in modern Rodnovery as patron of volkhvy, poets, wealth, animals and the dead, mainly in winter. Volkhvy are mentioned in the chronicles as pagan wise men. The Book of Veles is a forgery; groups differ on using it. Some Rodnover groups are nationalist.',
            unknown: 'Whether the medieval volkhvy were particularly connected with Veles is not recorded. His dates in the modern Rodnover calendar are modern, mostly built on Koliada, the feasts of the dead and St Vlasiy.',
          },
          inPractice: 'A solitary devotion to Veles is usually simple: a low shrine, a weekly offering of bread, milk or honey, care for animals, honest dealing with money, and remembering the dead in the dark half of the year.',
          reflect: [
            'Am I drawn to the trickster or to the keeper? Why?',
            'How do I deal with money, and what would honesty with it look like?',
          ],
          further: [
            'Kaarina Aitamurto, Paganism, Traditionalism, Nationalism: Narratives of Russian Rodnoverie (2016)',
            'Kaarina Aitamurto and Scott Simpson (eds.), Modern Pagan and Native Faith Movements in Central and Eastern Europe (2013)',
          ],
          library: ['traditional/deity/veles', 'traditional/deity/loki', 'traditional/deity/hermes'],
        },
      ],
      practices: [
        {
          id: 'veles-animal-care',
          title: 'Care for an animal',
          instructions: 'Once during the study stage, do something real for an animal: feed birds properly (seed, not bread), help at a shelter, donate to a farm sanctuary, or give your own pet an hour of real attention. Tell Veles about it that evening.',
          times: 1,
          prompt: 'What do animals ask of the people who keep them?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights of the last bite',
      intro: 'Now you build his shrine and keep nine nights of offering: the last bite of your supper, a little milk or honey, and one name of the dead or one thing you are grateful for.',
      days: 9,
      lessons: [
        {
          id: 'veles-shrine-offerings',
          title: 'Shrine, days and offerings',
          summary: 'A low shrine, the right gifts, the manner of giving, and what to avoid.',
          minutes: 6,
          sections: [
            {
              heading: 'A shrine near the floor',
              body: `Perun’s shrine goes high; Veles’s goes low. A low shelf, a stool, the floor by the door, or a corner near a window where you can see a tree are all good places. If you have a garden, a spot near water or at the roots of a willow is ideal.

On it, set a bowl of water, a dark candle (black, brown or dark green), a little dish for offerings, and something of wool, fleece or horn. A small sheaf of wheat or rye tied with red thread, a “beard of Veles,” is lovely. A stone from a river, smoky quartz or jet suit him. Some people add photographs or names of their ancestors, since he keeps their pasture; if you do, give the ancestors their own small space beside his rather than heaping everything together.`,
            },
            {
              heading: 'What to give',
              body: `His best-grounded offerings are those of the harvest and the herd: bread, grain, milk, butter, cheese, honey, beer and the last sheaf. The last bite of a meal, set aside before you finish, is a simple everyday gift that echoes the uncut ears of the field.

Wool, fleece and hair are fitting too. So are acts: feeding animals, supporting a farmer, paying a debt on time, telling a story well, remembering the dead by name. If you avoid animal products, use bread, grain, oat milk, beer or water, and care for animals.`,
            },
            {
              heading: 'The manner of giving',
              body: `Sit low or kneel to give to him, near the floor or the ground. Light the candle, call him in a low voice, and say plainly what you give and what you ask. Folk custom treated the god’s share as taboo: the uncut ears were not to be touched. So once you give something to Veles, it is his. Do not eat it afterwards.

Offerings go outside within a day: into water (only biodegradable food, in small amounts), at the roots of a tree, or into the earth. Bury rather than scatter if there are dogs about. Keep Perun’s and Veles’s offerings in separate places if you honour both.`,
            },
            {
              heading: 'What to avoid',
              body: `Do not make him bargains you do not mean to keep. A cattle god was a god of honest counting, and the treaty oaths called him as a witness. Do not use his name for tricking or cheating others.

Do not try to call up the dead or work necromancy in his name; that is not what this journey is for, and it is unwise without a teacher and a tradition. Do not go to rivers or ponds at night alone to make offerings, and do not throw anything into water that does not belong there: no plastic, foil, candles or coins.`,
            },
          ],
          knowAndDont: {
            known: 'Harvest offerings of uncut ears, bread and salt in the field, butter for St Vlasiy, and food set out for the dead are documented in folk custom. The taboo on touching the god’s share is recorded with the “beard of Volos.”',
            unknown: 'How pagan Slavs made offerings to Volos is not recorded. The low shrine and the separate placement of Perun and Veles are modern practice drawn from the storm-myth reconstruction.',
          },
          inPractice: 'Set his low shrine today. On each of the next nine nights, give the last bite of your supper and a little milk or honey, name one ancestor or one thing you are grateful for, sit for a few minutes, and take the offering out next morning.',
          reflect: [
            'Where in my home is low, quiet and close to the earth?',
            'What is my “last bite,” the thing I could give that costs a little?',
          ],
          library: ['traditional/crystal/smoky_quartz', 'traditional/crystal/jet', 'traditional/candle/black', 'traditional/vessel/offering_bowl', 'traditional/herb/willow'],
          premade: ['hedge-house-spirit-offering', 'kitchen-housewarming-blessing'],
        },
      ],
      practices: [
        {
          id: 'veles-nine-nights',
          title: 'Nine nights of the last bite',
          instructions: 'On each of nine nights, set aside the last bite of your supper. Sit low at his shrine, light the dark candle, and give the bite with a little milk, honey or water. Speak one name of your dead, or if you do not know any, one thing you are grateful to own. Sit for five minutes in the candlelight. Snuff the candle. Take the offering to a tree, water or soil next morning. On the ninth night, also lay a few ears of grain or a tuft of wool on the shrine to stay.',
          times: 9,
          every: 'day',
          prompt: 'Whom did I name, or what did I count, and what came to mind as I sat?',
        },
        {
          id: 'veles-story',
          title: 'Tell a story',
          instructions: 'Veles is the grandfather of poets. During the nine nights, tell a story aloud, to a friend, a child, or just to his shrine: a family story, a folk tale, or one you make up. Or write a short poem and read it to him.',
          times: 1,
          prompt: 'What story did I tell, and why that one?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Counting honestly',
      intro: 'Before you dedicate, stop and weigh it. Answer the questions over several days. Choosing to continue without a formal dedication, pausing, or turning to another god are all good outcomes; Veles respects an honest count.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'veles-discernment-write',
          title: 'Write it out',
          instructions: 'Answer the questions below in your journal across a few days. Reread your threshold list of what you already have. Then write in one sentence what you would promise him for a year.',
          times: 1,
          prompt: 'What is a fair bargain between me and the god of herds?',
        },
      ],
      questions: [
        'Did honouring Veles make me more grateful, more honest and more caring toward animals and the dead, or did it mostly feed a taste for the dark and mysterious?',
        'Am I comfortable with how much of his popular image is reconstruction, and with the forged Book of Veles that shadows him?',
        'Am I drawn to him for advantage or wealth more than for relationship? Is that a fair bargain to offer?',
        'Is the work with the dead stirring grief I need human support for as well?',
        'Can I keep a weekly offering and one real act of care for a year?',
        'Would it be enough, for now, to keep honouring him without a formal dedication?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The pact at the roots',
      intro: 'If you choose to go ahead, this is your dedication. It is a self-dedication, a promise between you and Veles. It is not an initiation into any group or into the role of volkhv, and it does not replace one if you join a community with its own rites. Stopping before this, or choosing another god, is a good outcome too.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Dedication to Veles',
        summary: 'A low rite at a tree or the shrine: grain, milk and honey, the beard of Veles tied, your dead remembered, and one honest promise.',
        minutes: 40,
        ingredients: [
          { name: 'A dark candle: black, brown or dark green', ref: 'traditional/candle/black' },
          { name: 'Bread and a small dish of honey' },
          { name: 'Milk, beer or water in a cup' },
          { name: 'A few ears of wheat, rye or oats, or dried grasses', optional: true },
          { name: 'A length of red wool or cotton thread' },
          { name: 'The names or photographs of your dead', optional: true },
          { name: 'A river stone or smoky quartz to keep', ref: 'traditional/crystal/smoky_quartz', optional: true },
        ],
        preparation: 'Choose an evening in the dark half of the year if you can, or any evening near the new moon. If you have access to a tree near water, a willow ideally, go at dusk with a friend or let someone know where you are; otherwise work at your low shrine. Write your promise in one sentence: “I will care for one animal’s needs,” “I will deal honestly with money,” “I will remember my dead each month.”',
        steps: [
          {
            title: 'Make the low place',
            instructions: 'Kneel or sit on the ground at the tree’s roots, or on the floor at his shrine. Lay out the bread, honey, cup, grain and thread on a cloth. Set the candle in front.',
          },
          {
            title: 'Light',
            instructions: 'Light the candle.',
            light: true,
          },
          {
            title: 'Call him',
            instructions: 'Speak low and steadily.',
            spoken: 'Veles, Volos, herdsman of the world below,\ngrandfather of singers, keeper of the stores and of the dead,\nI come down to the roots to meet you.',
          },
          {
            title: 'Remember the dead',
            instructions: 'Name your dead, as many as you know, and then all whose names are lost. If you know none, name the dead of the place where you live.',
            spoken: 'For those I knew and those I never knew:\nmay they graze in a green pasture,\nand may their herds be many.',
            minutes: 3,
          },
          {
            title: 'Give from the table and the herd',
            instructions: 'Set the bread and honey on the ground or offering dish, and pour a share from the cup onto the earth.',
            spoken: 'Bread from the field, honey from the hive,\nand the first of the cup.\nThese are yours, and I will not take them back.',
          },
          {
            title: 'Tie the beard',
            instructions: 'Gather the ears of grain into a small bundle and bind them with the red thread, knotting it three times. If you have no grain, bind a few grasses or a twist of wool. As you tie the last knot, speak your promise once, then the words below.',
            spoken: 'This I promise for a year and a day.\nI give myself to your honour, Veles,\nto count my wealth honestly,\nto care for the living creatures in my keeping,\nand to remember those who have gone below.',
          },
          {
            title: 'Sit in the dusk',
            instructions: 'Sit quietly with the candle for several minutes. Let your eyes go to the shadows and the ground.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions: 'Thank him. Pick up the tied beard and the stone if you brought one; they go on his shrine. Snuff the candle.',
            spoken: 'Thank you, Veles. The pact is made.',
            snuff: true,
          },
        ],
        closing: 'Leave the bread and honey at the tree, or take them out next morning and bury them. Keep the beard of Veles on his shrine through the year. Note the date for your renewal.',
        safety: 'Do not go to water alone after dark; stay well back from riverbanks and ice. Keep the candle in a deep holder away from dry grass, and put it out completely. Honey must never be given to babies under one. Do not leave food where pets will eat it.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the herd',
      intro: 'A dedication begins a year of practice. Here is a rhythm: a weekly offering, his winter feasts, the dead, and a yearly renewal.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'veles-weekly',
          title: 'Weekly last bite',
          instructions: 'Once a week, at the same supper, set aside the last bite for Veles and give it at his shrine with a few words. Many people use Sunday evening or the eve of the market day of their week.',
          times: 52,
          every: 'week',
          prompt: 'What did I count this week, and was I honest?',
        },
        {
          id: 'veles-feasts',
          title: 'His winter',
          instructions: 'At Dziady, keep the ancestor supper and give Veles a share. At Koliada, honour him with honey and grain, and if you can, go to see the mummers or tell a winter story. On or near 24 February, bless or care for animals. At harvest time, tie a new beard of Veles and burn or bury the old one.',
          times: 1,
          every: 'holy-day',
          prompt: 'How did the dark half of the year feel with him beside me?',
          premade: 'folk-dziady-meal',
        },
        {
          id: 'veles-rededication',
          title: 'Renew the pact',
          instructions: 'A year and a day after your dedication, return to the roots or the shrine. Read your promise and say honestly how you kept it. Tie a new thread with a new promise, or bury the old beard with thanks and release the promise.',
          times: 1,
          prompt: 'What is my next honest bargain, or what do I lay down?',
        },
      ],
    },
  ],
  sources: [
    'The Russian Primary Chronicle, trans. Samuel H. Cross (1930), entries for 907, 971 and 980, quoted: https://archive.org/details/doncarlosthemeha0000fred',
    'W. R. S. Ralston, The Songs of the Russian People (1872), pp. 251–3, quoted on the beard of Volos and St Vlas: https://archive.org/details/songsofrussianpe00ralsuoft',
    'The Tale of the Armament of Igor, ed. and trans. Leonard A. Magnus (1915): https://archive.org/details/taleofarmamentof00magnuoft',
    'V. V. Ivanov and V. N. Toporov, Issledovanija v oblasti slavjanskih drevnostej (1974)',
    'Radoslav Katičić, Božanski boj (2008)',
    'Judith Kalik and Alexander Uchitel, Slavic Gods and Heroes (2019)',
    'Linda J. Ivanits, Russian Folk Belief (1989)',
    'Kaarina Aitamurto, Paganism, Traditionalism, Nationalism: Narratives of Russian Rodnoverie (2016)',
  ],
};
