import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-skadi',
  kind: 'deity',
  paths: ['norse'],
  deityRef: 'traditional/deity/skadi',
  title: 'Skadi, Lady of the Snowshoes',
  summary:
    'A lunar month with Skaði, the giantess of winter, mountains and the hunt who came to Asgard armed for justice: her father’s death, her ill-matched marriage to Njörðr, her shrines and fields, the ski-god Ullr, and a practice of cold air, wild places and standing your ground.',
  welcome: `This journey spends about a month with Skaði. You will read her stories closely, look at the scattered evidence that she once had shrines of her own, learn how Heathens honour her now, set up a plain shrine, keep nine days of time in the cold air, and decide at the end whether to dedicate yourself to her.

It is a self-dedication, not an initiation, and it does not replace the rites of any Heathen group. You do not need mountains, skis or a bow. A walk on a cold morning, a bowl of clean water and an honest look at what you are owed will do. Dress warmly, and never put yourself at risk in bad weather to prove a point to a goddess who, by all accounts, values good sense.`,
  about: `Skaði is a giantess, daughter of the giant Þjazi, who lived in the mountain hall Þrymheimr. When the gods killed her father, she put on helmet and mail and came to Asgard for redress; they offered her a husband of her choosing, chosen by his feet alone, and she picked Njörðr, the sea god, hoping for Baldr. They took turns, nine nights in the mountains and then a stay at Nóatún by the sea, and could not bear each other’s homes, so she went back to the hills. Snorri says she goes on skis with her bow and shoots wild beasts, and calls her the ski-goddess (öndurdís). In Lokasenna she speaks of her own “dwellings and fields,” and a few Swedish place names may preserve shrines to her; a poem says she bore sons to Odin, and the jarls of Hlaðir in Norway counted her among their ancestors. Scholars have long noticed her likeness to Ullr, the archer and ski-god. Today Heathens honour her in winter as a goddess of the mountains, the hunt, endurance, independence and just redress, with offerings left in the snow or the wild, clean water, game and strong drink, and with time spent outside in the cold.`,
  notes: [
    'Skaði is a giantess (jötunn) who joined the gods. Heathen communities welcome her almost universally, but some honour the giants more cautiously than the Æsir and Vanir. Follow a group’s customs at its rites.',
    'The evidence for her worship is thin: a line of Lokasenna, a few place names and a royal genealogy. Most of what devotees do today is modern, and this journey says which is which.',
    'Cold-weather practice must be safe. Dress for the weather, tell someone where you are going, stay off ice you are not sure of, and never go into the mountains alone or unprepared. Cold-water plunges are not part of this journey; if you swim in winter, do it only with training and company. An open window and a cold morning are enough.',
    'Hunting is part of her lore. If you hunt, follow the law and hunt ethically; if you do not, there is no need to start. Vegetarian and vegan offerings are fine.',
    'Do not leave food for wild animals. Take offerings of food away again, or give them to the earth where they will not habituate wildlife. Clean water and acts of care for wild places are always welcome.',
    'This app is inclusive. Skaði, who crossed from the giants to the gods and chose her own way of living, is for everyone, of any ancestry, gender or orientation. Folkish groups that make the gods a matter of race are not the tradition taught here.',
  ],
  holyDays: ['vetrnaetur', 'jol', 'thorrablot', 'disablot'],
  stages: [
    {
      kind: 'threshold',
      title: 'The Mountain Door',
      intro:
        'Skaði came to Asgard on her own two feet, armed and asking for what was owed. These first days are about making a cold, clear place for her, stepping outside, and greeting her plainly.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'skadi-shrine',
          title: 'Set up a shrine',
          instructions: `Choose a place near a window, ideally one that faces north or catches the winter light: a sill, a shelf, a cold corner of the hall. Lay down a white, pale grey or pale blue cloth, or a piece of birch bark or plain wood. Add a bowl of clean water, a cup for drink and one white candle in a holder.

For images: a mountain stone or a stone from a high place you have walked; a sprig of pine, spruce or juniper; an arrow or a small bow; a ski or snowshoe charm; a wolf figure; a piece of clear quartz. Keep it uncluttered, like snow.

In winter, some devotees bring in a bowl of fresh snow and let it melt on the shrine; that water becomes her offering.`,
          times: 1,
          prompt: 'What on your shrine came from a wild or high place?',
        },
        {
          id: 'skadi-cold-air',
          title: 'Breathe the cold',
          instructions:
            'For three mornings, step outside or open a window wide for five minutes. Breathe the cold air slowly. Notice your body adjusting. Say: “Skaði, this is for you.” Then close the window and warm up.',
          times: 3,
          every: 'day',
          prompt: 'How did your body meet the cold? What did you notice that you usually miss?',
        },
      ],
      rite: {
        title: 'Greeting at the Mountain Door',
        summary:
          'A short first greeting: hallow the space with cold water, offer water and strong drink, tell Skaði why you have come, and stand a moment at an open window or door.',
        minutes: 20,
        ingredients: [
          { name: 'A bowl of clean, cold water, or melted snow' },
          { name: 'A small cup of aquavit, mead or a sharp berry juice (lingonberry, cranberry)' },
          { name: 'A sprig of pine, spruce or juniper', ref: 'traditional/herb/juniper', optional: true },
          { name: 'A white candle in a safe holder', ref: 'traditional/candle/white' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
        ],
        preparation:
          'Wash your hands in cold water. Tidy the shrine. Set out the water and drink. Dress so you can stand at an open window or door for a few minutes. Dawn or a clear cold evening are good times.',
        steps: [
          {
            title: 'Hallow the space',
            instructions:
              'Light the candle. Dip the evergreen sprig, or your fingers, in the cold water and sprinkle a few drops at each side of the room, walking sunwise.',
            spoken: 'I hallow this place with cold water from the high places. Let it be clear.',
            light: true,
          },
          {
            title: 'Open the door',
            instructions: 'Open a window or the door, so the outside air comes in. Stand facing it.',
          },
          {
            title: 'Greet her',
            instructions: 'Lift the cup.',
            spoken:
              'Skaði, daughter of Þjazi, lady of Þrymheimr. Ski-goddess, bow-bearer, hunter of the high snows. You who came to Asgard armed and were given your due. I bring you water and strong drink. Hear me.',
          },
          {
            title: 'Say why you have come',
            instructions:
              'Tell her plainly why you are here: a love of winter or wild places, a need for endurance, a sense that something is owed to you, a wish to stand on your own. Keep it short. She is said to prefer plain words.',
            minutes: 4,
          },
          {
            title: 'Give her share',
            instructions: 'Take one sip. Pour the rest, and a little of the cold water, into the offering bowl.',
            spoken: 'Gift for gift. This is yours. Hail Skaði!',
          },
          {
            title: 'Stand in the cold',
            instructions: 'Stand at the open window or door and breathe the outside air for a few minutes, in silence.',
            minutes: 3,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Close the window. Thank her. Snuff the candle. Later, take the bowl outside and pour it onto snow, soil or stone, ideally under an evergreen.',
            spoken: 'Thank you, Skaði. I will come back.',
            snuff: true,
          },
        ],
        closing: 'Write down what you said and how the cold felt. Warm up properly with a hot drink.',
        safety:
          'Never leave a candle burning unattended or near an open window where curtains can blow into it. Do not stand in the cold long enough to become chilled, especially if you have heart or circulation problems. Pour drink outside or down a drain, not into houseplants, and keep alcohol away from pets. Juniper berries and pine needles are not safe for pets to eat.',
      },
    },
    {
      kind: 'study',
      title: 'Helmet, Mail and Snowshoes',
      intro:
        'Twelve days of reading: who Skaði is, the stories of her father, her redress and her marriage, and the thin but real evidence that she was once worshipped.',
      days: 12,
      lessons: [
        {
          id: 'skadi-who',
          title: 'The Giant’s Daughter of Þrymheimr',
          summary: 'Skaði’s family, home, skis and bow as the sources give them, and what her name may mean.',
          minutes: 6,
          sections: [
            {
              heading: 'A giantess among the gods',
              body: `Skaði is a jötunn, one of the giants, the old and powerful beings of the wild places who are often at odds with the gods. Her father is Þjazi, a giant of great wealth and magic who could take the shape of an eagle. Her home is Þrymheimr, “thunder-home” or “noise-home,” high in the mountains.

In the Eddic poem Grímnismál, Odin lists the gods’ halls: “The sixth is Thrymheim, where Thjazi dwelt, / The giant of marvelous might; / Now Skathi abides, the god’s fair bride, / In the home that her father had.” (Henry Adams Bellows’ 1923 translation, stanza 11.) Her hall is listed alongside those of Odin, Baldr and Freyja. She belongs among the gods while remaining in the giants’ country.`,
            },
            {
              heading: 'On skis with her bow',
              body: `Snorri gives the picture that has defined her ever since. In Rasmus Anderson’s 1880 translation: “Then went Skade up on the mountain, and dwelt in Thrymheim. She often goes on skees (snow-shoes), with her bow, and shoots wild beasts. She is called skee-goddess or skee-dis.”

Skiing is very old in Scandinavia; rock carvings at Rødøy in Norway show a skier perhaps 4,000 years old, and skis have been found preserved in bogs. In the Viking Age, skiing and archery together meant winter hunting in the mountains and forests, a way of life especially associated with the Sámi, the Indigenous people of the far north. Some scholars have suggested Skaði carries something of Norse ideas about the Sámi or about the uplands generally; others see her simply as the spirit of winter wilderness. Both are theories.`,
            },
            {
              heading: 'Her name',
              body: `The Old Norse word skaði means “harm” or “damage,” and some connect it to an old Germanic word for shadow. Neither tells us much about how her worshippers thought of her. An older theory, still repeated, links her name to Scandinavia itself, through a form like *Skaðin-awjō, “Skaði’s island.” Linguists are divided; it is possible, not proven.

Grammatically her name looks masculine in form, and she does things the sources usually give to men: she arms herself, demands compensation, hunts. Modern devotees, including many women and gender-nonconforming Heathens, often find that meaningful. The sources simply call her a bride of the gods and a giantess who chose her own way.`,
            },
            {
              heading: 'Not softened',
              body: `Many modern devotees say Skaði dislikes being prettified into a snow princess. The stories give her grief and anger, a sense of humour (she can be made to laugh), a clear idea of what she wants, and the self-respect to leave a marriage that does not suit her. She is cold the way a clear winter morning is cold: bracing, honest and beautiful, and not to be taken lightly.`,
            },
          ],
          knowAndDont: {
            known:
              'Grímnismál 11 names her hall. Snorri’s Gylfaginning (ch. 23) and Skáldskaparmál give her family, her skis and bow and the title öndurdís. Ancient skis and rock carvings of skiers are well documented in Scandinavia.',
            unknown:
              'What her name originally meant, and whether Scandinavia is named after her, are unsettled. The links scholars draw between Skaði and the Sámi are interpretation. We do not know how old her stories are beyond the poems that preserve them.',
          },
          inPractice:
            'Many devotees honour Skaði on the first snow of winter, by going out in it, and keep a winter shrine with evergreens, a stone and cold water through the dark months.',
          reflect: [
            'Skaði keeps her father’s mountain home after his death. What have you inherited that you keep, even when it would be easier to let go?',
            'Where in your life have you been softened, or softened yourself, when you would rather be plain?',
          ],
          further: [
            'Gylfaginning ch. 23 in Rasmus B. Anderson, The Younger Edda (1880), public domain.',
            'Grímnismál in Henry Adams Bellows, The Poetic Edda (1923), public domain.',
            'John Lindow, Norse Mythology (2001), “Skaði.”',
          ],
          library: ['traditional/deity/skadi', 'traditional/herb/juniper', 'traditional/crystal/clear_quartz'],
        },
        {
          id: 'skadi-myths',
          title: 'Redress, Feet and Two Songs',
          summary: 'Skaði’s great story: her father’s death, her armed arrival in Asgard, the choosing by feet, the laughter, and the marriage that could not hold.',
          minutes: 7,
          sections: [
            {
              heading: 'Þjazi and Iðunn',
              body: `Skaði’s story begins with her father. Þjazi, in eagle form, forced Loki to lure the goddess Iðunn and her apples of youth out of Asgard, and carried her off to Þrymheimr. Without the apples the gods grew grey and old. They made Loki fetch her back; he flew to Þrymheimr in Freyja’s falcon shape, turned Iðunn into a nut and carried her home, and when Þjazi chased them as an eagle, the gods lit a fire of wood shavings on Asgard’s walls. His feathers caught, he fell, and the gods killed him inside the gates.

From the gods’ side, this is a victory. From Skaði’s side, her father has been killed.`,
            },
            {
              heading: 'She comes armed',
              body: `Snorri tells it in Skáldskaparmál: “Skade, the daughter of the giant Thjasse, donned her helmet, and byrnie, and all her war-gear, and betook herself to Asgard to avenge her father’s death. The asas offered her ransom and atonement” (Anderson’s translation).

This is how Norse law handled a killing: the injured family could take revenge, or accept compensation from the killers. Skaði comes ready for either, and the gods choose to settle. She asks for three things. A husband from among the gods. That they make her laugh, which she thinks impossible in her grief. And Odin adds a third: he takes Þjazi’s eyes and throws them into the sky as two stars.`,
            },
            {
              heading: 'Chosen by the feet',
              body: `The gods set a condition: she must choose her husband by his feet alone. She sees one pair of beautiful feet and says, “This one I choose! On Balder there are few blemishes.” But the feet belong to Njörðr, the god of the sea, whose feet are washed clean by the waves.

Then Loki ties one end of a cord to a goat’s beard and the other to his own groin (Anderson’s translation politely says “around his own body”), and the two pull back and forth, shrieking, until Loki falls into Skaði’s lap and she laughs. It is a crude, strange scene, and it works: grief broken by absurdity. Then the settlement is complete.`,
            },
            {
              heading: 'Nine nights and nine nights',
              body: `Skaði wanted to live in her father’s mountains; Njörðr in his harbour at Nóatún. In Gylfaginning they agree to take turns: in Anderson’s text, “to pass nine nights in Thrymheim and three in Noatun”; other manuscripts give nine and nine. It goes badly. Njörðr sings: “Weary am I of the mountains, / Not long was I there, / Only nine nights. / The howl of the wolves / Methought sounded ill / To the song of the swans.” And Skaði answers: “Sleep I could not / On my sea-strand couch, / For the scream of the sea-fowl. / There wakes me, / As he comes from the sea, / Every morning the mew.” (Anderson’s translation.)

So she goes back to the mountains. There is no villain here. Two people who cannot live in each other’s worlds part ways. The Heimskringla’s Ynglinga saga adds that she later married Odin and had many sons with him.`,
            },
            {
              heading: 'The serpent over Loki',
              body: `Skaði has one more part in the myths. When the gods finally bind Loki after Baldr’s death, it is Skaði who fastens a venomous serpent above his face. In Lokasenna, Loki taunts her that he was “first and last at the deadly fight / There where Thjazi we caught,” and she answers: “From my dwellings and fields shall ever come forth / A counsel cold for thee.” (Bellows, stanzas 50–51.)

She does not forget a wrong, and she takes part in the gods’ justice when it comes. This journey honours that sense of redress, and it contains no curses; her “cold counsel” is something to understand, not to use against anyone.`,
            },
          ],
          knowAndDont: {
            known:
              'Snorri tells the Þjazi story and Skaði’s redress in Skáldskaparmál, drawing on the skaldic poem Haustlöng (c. 900). The marriage and the two songs are in Gylfaginning ch. 23. Lokasenna 49–52 and its prose give her part in Loki’s binding. Ynglinga saga mentions her marriage to Odin.',
            unknown:
              'The verses of Njörðr and Skaði may be older than Snorri or may be his own. The meaning of the feet test is unknown: some see a ritual marriage custom behind it, others a joke. The manuscripts differ on how long they stayed by the sea.',
          },
          inPractice:
            'Some devotees keep a “compensation night” for Skaði each year, when they name what they are owed and what they owe, and act to settle one debt either way.',
          reflect: [
            'Skaði came ready to fight and accepted a fair settlement. Is there something you are owed? What would a fair settlement look like?',
            'Have you ever left a place or a relationship because you could not live in it? How do you feel about that now?',
          ],
          further: [
            'Skáldskaparmál ch. 1–3 and Gylfaginning ch. 23 in Anderson (1880).',
            'Lokasenna in Bellows (1923).',
            'Carolyne Larrington, The Norse Myths: A Guide to the Gods and Heroes (2017).',
          ],
          library: ['traditional/deity/skadi', 'traditional/deity/idunn', 'traditional/deity/loki', 'traditional/deity/baldur'],
        },
        {
          id: 'skadi-worship',
          title: 'Shrines, Fields, a Royal Line and Ullr',
          summary: 'The thin but real evidence for Skaði’s worship: Lokasenna’s “dwellings and fields,” Swedish place names, the jarls of Hlaðir, and her likeness to the ski-god Ullr.',
          minutes: 7,
          sections: [
            {
              heading: 'Her dwellings and fields',
              body: `When Skaði speaks of her “dwellings and fields” in Lokasenna, the Old Norse words are véum ok vöngum. A vé is a sacred enclosure or shrine; a vangr is a meadow or field, and the pair are a set phrase for holy places. Many scholars read the line as the poet’s acknowledgement that Skaði had cult places of her own. It is a single line, but it is a line in a poem made while the old religion was still remembered.

Some Swedish place names have been read as preserving it: Skedevi in Östergötland, for example, may mean “Skaði’s vé.” Place-name scholars disagree about several of these, since skeið (a race-course) and other words can produce similar forms. Treat them as possible, not proven.`,
            },
            {
              heading: 'Mother of jarls',
              body: `In Ynglinga saga, Snorri says that after leaving Njörðr, Skaði married Odin and bore him many sons, one of them Sæmingr. He quotes a verse by the tenth-century skald Eyvindr skáldaspillir, from his poem Háleygjatal, which praised the jarls of Hlaðir, a family from Hålogaland in the far north of Norway. In the translation printed with Anderson’s edition: “To Asason Queen Skade bore / Saming, who dyed his shield in gore,— / The giant queen of rock and snow / Who loves to dwell on earth below.”

The powerful Jarl Hákon, one of the last great pagan rulers of Norway, traced his family back to Sæmingr, and so to Skaði and Odin. A royal family claiming a goddess as ancestress suggests she was respected, not merely a figure of story.`,
            },
            {
              heading: 'Ullr, the other ski-god',
              body: `Snorri describes another god on skis. Ullr, son of Sif and stepson of Thor, “is so good an archer, and so fast on his skees, that no one can contend with him” (Anderson). Ullr’s name appears in dozens of place names across Norway and Sweden, such as Ullevål and Ullensaker, many of them pointing to old cult sites; the Eddic poem Atlakviða mentions oaths sworn “by the ring of Ull.” Yet almost no myth about him survives.

The two make an obvious pair: skis, bows, winter, mountains. Some scholars have suggested that in an older layer of tradition Skaði and Ullr belonged together, perhaps as a divine couple, or that their cults overlapped in the same regions. Saxo Grammaticus, writing in Denmark around 1200, tells of a figure called Ollerus who crossed the sea on a bone carved with spells, which some read as a memory of skis. Nothing in the sources marries them, and modern Heathens who honour them together are making a reasonable, modern choice.`,
            },
            {
              heading: 'What we can say',
              body: `Put together: a line of an Eddic poem giving her shrines and fields, some possible place names, a royal genealogy in a tenth-century poem, and a likeness to a widely worshipped god. That is more than we have for many goddesses, and far less than we have for Freyr or Thor. We do not know any prayer, offering or festival that was hers. Every modern rite to Skaði, including the ones in this journey, is built on her stories and her character rather than on a recorded cult.`,
            },
          ],
          knowAndDont: {
            known:
              'Lokasenna 51 uses the phrase véum ok vöngum. Ynglinga saga quotes Háleygjatal on Skaði and Sæmingr. Gylfaginning describes Ullr; Atlakviða mentions Ullr’s ring. Ullr place names are numerous and well studied.',
            unknown:
              'Which place names really contain Skaði’s name is disputed. Any original link between Skaði and Ullr is a scholarly hypothesis. No ritual, festival or offering for Skaði is recorded.',
          },
          inPractice:
            'Many Heathens honour Skaði and Ullr together in winter, at the first snowfall or at Þorrablót, with a toast to each and a winter walk; skiers in some places joke about, or seriously keep, an Ullr medal or toast for good snow.',
          reflect: [
            'Skaði is remembered through a handful of fragments. What does it feel like to honour a goddess whose worship is mostly lost?',
            'Is there a companion, human or divine, who shares your wild places with you?',
          ],
          further: [
            'Ynglinga saga ch. 8–9 in Samuel Laing, Heimskringla (1844), public domain.',
            'Rudolf Simek, A Dictionary of Northern Mythology (1993), “Skaði” and “Ullr.”',
            'Neil Price, The Children of Ash and Elm (2020), on the north and the Sámi.',
          ],
          library: ['traditional/deity/skadi', 'traditional/deity/odin', 'traditional/herb/yew'],
          premade: ['hedge-hearing-the-land-walk'],
        },
      ],
      practices: [
        {
          id: 'skadi-walk',
          title: 'Walk in the weather',
          instructions:
            'Twice a week during this stage, take a walk outside whatever the weather, properly dressed, for at least twenty minutes. Leave your phone in your pocket. Notice the cold, the wind, the light and any animals. Pick up one piece of litter as an offering.',
          times: 4,
          every: 'week',
          prompt: 'What did you notice on your walk, and what did your body tell you about endurance?',
          premade: 'hedge-hearing-the-land-walk',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine Days in Þrymheimr',
      intro:
        'Njörðr lasted nine nights in the mountains. In this stage you learn how Skaði is honoured today, her seasons and offerings, the sea god she married, and keep nine days of cold air and standing your ground.',
      days: 9,
      lessons: [
        {
          id: 'skadi-today',
          title: 'Winter, the Hunt and Wild Places Today',
          summary: 'How modern Heathens honour Skaði: winter devotion, hunting ethics, care for wilderness, independence, and her marriage to Njörðr seen fairly.',
          minutes: 7,
          sections: [
            {
              heading: 'A winter goddess',
              body: `Most modern devotion to Skaði is seasonal. People greet her at the first snow, honour her through the dark months, and thank her as winter turns. Offerings are often left outside in snow or on a high place: a pour of aquavit, a piece of meat or bread, a handful of berries, or simply clean water. Many keep a winter shrine of evergreens and stones that comes down when the thaw arrives.

She is also a favourite of skiers, climbers, mountain rescue volunteers, winter swimmers and anyone who works outdoors in hard weather. Some devotees ask her for safety before a winter trip and pour her a share on their return.`,
            },
            {
              heading: 'The hunt',
              body: `Skaði hunts. Some modern Heathens hunt, and honour her and Ullr before the season and when they take an animal, with a portion offered back to the land and thanks spoken. Those customs are modern, drawing on wider hunting traditions of respect for the animal.

If you hunt, do it legally and ethically, and waste nothing. If you do not, the hunt can be honoured in other ways: learning to track and identify animals, archery at a club, supporting conservation of wolves and lynx, buying meat from people who raise or hunt it well. Vegetarian and vegan devotees are entirely welcome; she is also simply a goddess of the wild.`,
            },
            {
              heading: 'Care for the wild',
              body: `Many devotees see care for wild places as the most natural offering to Skaði: litter picked up on a trail, a day volunteering on a nature reserve, donations to mountain rescue or wilderness charities, learning the leave-no-trace principles and keeping them. Her mountains are not a backdrop. They are her home.

That care extends to offerings. Food left in the wild teaches animals to come close to people, which often ends badly for the animals. Leave water, or leave food only where it will quickly be gone into soil or snow, and take the rest home.`,
            },
            {
              heading: 'Njörðr, fairly',
              body: `Some devotees treat Skaði’s marriage to Njörðr as a failure or a joke. It is better read as honest. Two powers from different worlds made a lawful match, tried in good faith to share their homes, and parted when it did not work, without anyone being cast as a villain. Many Heathens honour them both, together at a toast and apart at their own seasons: Njörðr by the sea in summer, Skaði in the mountains in winter.

For devotees this is a story about knowing your own needs. Independence is one of the things people most often ask of Skaði: the strength to live on your own terms, to leave what is wrong for you, to ask for what you are owed without apology.`,
            },
          ],
          knowAndDont: {
            known:
              'Modern Heathen devotion to Skaði is widespread and mostly seasonal, as practitioners describe it. Her character in these practices rests on Snorri, Lokasenna and Grímnismál. Hunting customs among modern Heathens are documented in community writing.',
            unknown:
              'None of these practices is recorded in the Viking Age. The link between Skaði and winter festivals such as Þorrablót is modern; Þorri himself is a figure of late saga tradition. Offerings left in snow are modern devotion inspired by her stories.',
          },
          inPractice:
            'A common pattern: a winter shrine from the first snow to the thaw; a pour of aquavit or berry juice on the first snowfall; a walk or ski dedicated to her each week in winter; a donation to mountain rescue at Yule.',
          reflect: [
            'What wild place could you care for this winter?',
            'Where do you need more independence, and what would it cost you to take it?',
          ],
          further: [
            'The Troth, Our Troth, vol. 1 (2006), on Skaði, Njörðr and Ullr.',
            'Diana L. Paxson, Essential Asatru (2006), for a short modern overview.',
          ],
          library: ['traditional/deity/skadi', 'traditional/deity/freyr', 'traditional/crystal/labradorite'],
          premade: ['green-wildflower-walk-gathering-ethics', 'sea-safe-passage-blessing'],
        },
        {
          id: 'skadi-days',
          title: 'Her Seasons, Her Offerings and What Not to Do',
          summary: 'When to honour Skaði through the year, what to give her and how, and the customs and cautions that keep the relationship sound.',
          minutes: 6,
          sections: [
            {
              heading: 'Her tides',
              body: `No festival of Skaði is recorded, and no weekday is hers. Modern devotees follow winter. Winter Nights (Vetrnætur) in late October opens the season: a good time to set up a winter shrine and greet her. Yule (Jól), the twelve nights of midwinter, is the heart of it. Þorrablót, the Icelandic midwinter feast at the start of the month of Þorri in late January, with its hard, preserved winter foods, suits her well, and many Heathens hail her and Ullr then. Dísablót in February, as winter begins to loosen, is a natural time to thank her.

Some devotees take the first snowfall as her day each year, whenever it comes.`,
            },
            {
              heading: 'What to offer',
              body: `Clean cold water, or snowmelt, is the simplest offering. Strong drink, aquavit, schnapps or mead, is common, as are tart northern berries: lingonberries, cranberries, crowberries. Game, venison, reindeer or elk, or any meat, is traditional in modern practice, as is dark rye bread. Evergreen sprigs and stones from high places suit her shrine.

Acts count as offerings too: a winter walk in all weathers, a day on the hills, care for a wild place, a debt settled, a hard conversation in which you stood your ground. The Hávamál’s principle holds for her as for any Norse power: “gifts with gifts requite” (Bellows, stanza 42). Give regularly and within your means.`,
            },
            {
              heading: 'How to offer',
              body: `Indoors, stand at the shrine, ideally by an open window. Name her and what you bring. Take a sip, pour her share into the bowl, then take it outside and pour it onto snow, stone or soil, under an evergreen if you can. Outdoors, on a walk or a high place, pour a little straight onto the ground, say a few plain words, and go on. Pack out anything that is not drink or a small piece of bread.`,
            },
            {
              heading: 'What not to do',
              body: `Don’t take risks in the cold to impress her. Hypothermia and frostbite are not devotion. Don’t feed wildlife. Don’t leave plastic, glass or candles burning outdoors. Don’t make her sweet and decorative; she is many things, but not that. Don’t ask her to harm anyone who has wronged you; this journey has no curses, and redress in her story was a fair settlement, not destruction.

And don’t forget the laughter. Skaði could be made to laugh in her grief. A little humour is welcome at her shrine.`,
            },
          ],
          knowAndDont: {
            known:
              'Winter Nights, Yule and Dísablót are attested seasonal feasts. Þorrablót as a midwinter feast is attested in late sagas and revived in nineteenth-century Iceland. Hávamál 42 gives the gift-for-gift principle.',
            unknown:
              'No source connects Skaði with any of these feasts; all her tides are modern. Her offerings, colours, stones and plants are modern associations drawn from her stories and northern foodways.',
          },
          inPractice:
            'Many devotees keep a bottle of aquavit or a jar of lingonberry jam on hand all winter for Skaði, and pour her a share on the first snow, at Yule and at Þorrablót.',
          reflect: [
            'What does winter take from you, and what does it give? How could you honour both?',
            'When did a joke last break a hard moment for you? Could that be an offering?',
          ],
          further: ['Hávamál in Bellows (1923).', 'Terry Gunnell, “The Season of the Dísir” (2000), on the winter calendar.'],
          library: ['traditional/deity/skadi', 'traditional/candle/silver', 'traditional/crystal/hematite', 'traditional/herb/juniper'],
          premade: ['folk-simple-blot', 'green-land-spirit-garden-offering'],
        },
      ],
      practices: [
        {
          id: 'skadi-nine-days',
          title: 'Nine days in the cold',
          instructions: `For nine days, go outside each morning, or open a window wide, for at least five minutes. Breathe the cold. Say her name. On the way back in, name one thing you will stand your ground on that day, however small: a boundary at work, a refusal, finishing what you started.

Each evening at the shrine, light the candle, pour a little cold water into the bowl, and tell her plainly how it went. Snuff the candle and pour the water outside.

On the ninth day, take a longer walk, an hour if you can, somewhere as wild as you can safely reach, and pour her a share of strong drink or berry juice at the farthest point.`,
          times: 9,
          every: 'day',
          prompt: 'Where did you stand your ground today, and how did the cold feel?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Mountains or Sea',
      intro:
        'Skaði and Njörðr each tried the other’s home and chose honestly. Take a few days to read your journal and choose as honestly. Pausing, stopping, honouring Skaði in winter without a vow, or turning to another god are all good outcomes.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'skadi-reread',
          title: 'Read your record',
          instructions: 'Read everything you have written since the first rite, and the notes from your walks.',
          times: 1,
          prompt: 'What has a month with Skaði taught you about cold, endurance and what you are owed?',
        },
      ],
      questions: [
        'Did this feel like meeting Skaði, or like enjoying winter? Both are honest, and the second is a fine reason to keep going on your own terms.',
        'Are you drawn to the whole of her, grief, redress, laughter, independence, the hunt, or only to the snow and the bow?',
        'Can you keep a devotion to her through the summer, or is she a goddess for your winters only? Either can work.',
        'How do you feel about honouring a giantess, and a goddess with so little recorded cult?',
        'What offering and act of care for the wild can you keep for a year?',
        'If you stop here, what will you keep from this month?',
      ],
    },
    {
      kind: 'dedication',
      title: 'Choosing the Mountain',
      intro: `If you have chosen to go on, this is the dedication: a blót at an open window or outdoors, a vow written in advance, and a token from a high place. It is a self-dedication between you and Skaði. It is not an initiation into any group, and it does not replace a group’s own rites. Make the vow plain and keepable.`,
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'skadi-write-vow',
          title: 'Write the vow',
          instructions:
            'A day before, write your vow: the offering you will keep (for example, cold water and a walk each week in winter), the act you will keep (for example, a monthly act of care for a wild place), how long (a year and a day, or one full winter, are common), and what you ask (endurance, independence, safe passage in the cold, a clear head).',
          times: 1,
          prompt: 'Write the final vow here.',
        },
      ],
      rite: {
        title: 'Dedication to Skaði',
        summary:
          'A cold blót in which you hallow the space with snow or cold water, hail Skaði at an open window or outdoors, swear your vow, and hallow a stone from a high place.',
        minutes: 35,
        ingredients: [
          { name: 'A bowl of fresh snow or cold clean water' },
          { name: 'A horn or cup of aquavit, mead or lingonberry juice' },
          { name: 'A piece of dark rye bread or a little cooked game', optional: true },
          { name: 'A sprig of pine, spruce or juniper', ref: 'traditional/herb/juniper' },
          { name: 'A white candle in a safe holder', ref: 'traditional/candle/white' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A token: a small stone from a hill or mountain, or a piece of labradorite', ref: 'traditional/crystal/labradorite' },
          { name: 'Your written vow' },
        ],
        preparation:
          'Clean the shrine. Set out the snow or water, drink, bread and token. Dress warmly. Winter Nights, the first snowfall, Yule or the day after your ninth day are good times. If you hold it outdoors, choose a safe, familiar place and tell someone where you are.',
        steps: [
          {
            title: 'Hallow with cold',
            instructions:
              'Light the candle. Dip the evergreen in the snow or water and sprinkle the four sides of the space, walking sunwise.',
            spoken: 'I hallow this place with cold from the high places. Let it be clear as snow and honest as winter.',
            light: true,
          },
          {
            title: 'Open to the outside',
            instructions: 'Open the window or door wide, or turn to face the hills if you are outdoors.',
          },
          {
            title: 'Hail her',
            instructions: 'Raise the horn.',
            spoken:
              'Skaði, daughter of Þjazi, lady of Þrymheimr. Ski-goddess, bow-bearer, giant queen of rock and snow. You who came to Asgard in helmet and mail and were given your due; who chose your mountains over the sea and kept your father’s hall. I come to choose you. Hear me.',
          },
          {
            title: 'Share the horn',
            instructions: 'Drink one sip. If you brought bread or game, break off a piece for the bowl.',
            spoken: 'I share with you. Hail Skaði!',
          },
          {
            title: 'Swear the vow',
            instructions: 'Stand facing the open air. Read your vow aloud, once, plainly.',
            spoken: 'Before Skaði, in the cold air, I make this vow. Let it hold as long as I keep it.',
          },
          {
            title: 'Hallow the token',
            instructions:
              'Hold the stone in the snow or cold water for a moment, then hold it up to the open air. Keep it on the shrine or carry it in winter.',
            spoken: 'Let this stone from the high places be a sign of my troth to Skaði. When I hold it, let me remember the mountain and stand my ground.',
          },
          {
            title: 'Pour her share',
            instructions: 'Pour the rest of the horn and the melted snow or water into the offering bowl.',
            spoken: 'Gift for gift. This is yours. Give me endurance, and a clear eye, and safe paths through the snow.',
          },
          {
            title: 'Close',
            instructions:
              'Stand a minute in the cold air. Close the window. Thank her. Snuff the candle. Take the bowl outside and pour it onto snow, stone or soil under an evergreen.',
            spoken: 'Hail Skaði, and thanks. The vow is made.',
            snuff: true,
          },
        ],
        closing:
          'Write the date and your vow in your journal and keep the paper copy for your rededication. Warm up with something hot, and if you can, share a meal with someone afterwards.',
        safety:
          'Keep the candle well away from open windows, curtains and evergreens, and never leave it burning; do not take a lit candle outdoors in wind. Do not get chilled: keep the outdoor part short if it is very cold. If you hold the rite outdoors, choose a safe, familiar place, tell someone where you are and take nothing that will be left behind. Keep alcohol, juniper and pine away from pets.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Every Winter',
      intro: `Keep the offering and the acts you vowed. Greet Skaði at Winter Nights and the first snow, honour her through Yule and Þorrablót, and thank her at Dísablót as winter loosens. In summer, visit a high place if you can. Each year, read your vow, say how you kept it, and renew it.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'skadi-weekly',
          title: 'The weekly walk',
          instructions:
            'Once a week, take a walk in whatever weather there is, dedicated to Skaði. Pick up litter as you go. On returning, pour a little cold water at the shrine.',
          times: 52,
          every: 'week',
          prompt: 'What was the weather this week, and what did you notice?',
        },
        {
          id: 'skadi-tides',
          title: 'Keep the winter tides',
          instructions:
            'At Winter Nights, Yule, Þorrablót and Dísablót, hold a blót with Skaði hailed, with a pour of strong drink or berry juice outside on snow or stone.',
          times: 4,
          every: 'holy-day',
          prompt: 'What did you offer at this tide, and what did winter bring?',
          premade: 'folk-simple-blot',
        },
        {
          id: 'skadi-rededicate',
          title: 'Yearly rededication',
          instructions:
            'On the first snow of winter, or the anniversary of your dedication, repeat the rite. Read last year’s vow first and say how you kept it.',
          times: 1,
          prompt: 'How did last year’s vow go, and what will this winter’s be?',
        },
      ],
    },
  ],
  sources: [
    'Rasmus B. Anderson, trans., The Younger Edda (1880), public domain: Gylfaginning ch. 23 (“Then went Skade up on the mountain…”, Njörðr’s and Skaði’s songs), ch. 31 on Ullr (“so good an archer…”), Skáldskaparmál (“Skade, the daughter of the giant Thjasse, donned her helmet…”, “This one I choose! On Balder there are few blemishes”), and the Ynglinga saga verse from Háleygjatal (“To Asason Queen Skade bore…”) in Laing’s translation as reprinted there, quoted from Project Gutenberg ebook #18947 (https://www.gutenberg.org/ebooks/18947).',
    'Henry Adams Bellows, trans., The Poetic Edda (1923), public domain: Grímnismál 11, Lokasenna 50–51, Hávamál 42, quoted from Project Gutenberg ebook #73533 (https://www.gutenberg.org/ebooks/73533); Atlakviða (“the ring of Ull”) referred to.',
    'Haustlöng (Þjóðólfr of Hvinir); Saxo Grammaticus, Gesta Danorum book 3 (Ollerus): paraphrased.',
    'Scholarship: Rudolf Simek (1993); John Lindow (2001); Neil Price (2020); Terry Gunnell (2000). Place names: discussions of Skedevi and Ullr names in Simek and in Scandinavian place-name scholarship.',
  ],
};
