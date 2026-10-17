import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-hel',
  kind: 'deity',
  paths: ['norse'],
  deityRef: 'traditional/deity/hel',
  title: 'Hel, Keeper of the Dead',
  summary:
    'A lunar month with Hel, the Norse ruler of the realm of the dead: what the sources actually say about her and her hall, the difference between Hel the place and Hel the goddess, and a quiet modern practice built on remembering your own dead.',
  welcome: `This journey spends about a month with Hel. You will read what the Eddas say about her, learn how the Norse world thought about death and the dead, set up a still and simple shrine, keep nine nights of remembrance, and decide at the end whether to dedicate yourself to her.

It is a self-dedication, not an initiation, and it does not replace the rites of any Heathen group. Most of what we know of Hel as a person comes from one writer, Snorri Sturluson, in the 1220s; almost nothing survives of any ancient worship of her. This journey says so plainly, and builds its practice on something the old sources do describe in detail: care for the dead.

If you are newly bereaved, be gentle with yourself. This work can hold grief, but it is not a substitute for people. Lean on friends, and reach out to a grief counsellor or support line if the weight becomes too much.`,
  about: `Hel is the daughter of Loki and the giantess Angrboða, sister of the wolf Fenrir and the Midgard Serpent. Snorri says Odin cast her into Niflheim and gave her power over the dead who die of sickness or old age; her hall is Éljúðnir, and she is half dark and half flesh-coloured, stern and grim to look on. The older poems use the word hel mostly for the place itself, the shadowed home of the dead reached by the Hel-way, guarded by the hound Garmr and the maiden Móðguðr at the Gjallarbrú, the echoing bridge. Baldr goes there when he dies, and is seated with honour and served mead; it is a place of rest and of waiting, not of punishment. There is no clear evidence of a cult of Hel in the Viking Age. What is richly attested is care for the dead: grave goods, mounds, Hel-shoes tied to the feet of the dead, feasts of inheritance, offerings at Winter Nights. Modern Heathens who honour Hel usually do so through that work, asking her to keep their dead well, and sometimes as a stern, fair presence who helps the living accept death. Others in Heathenry do not honour her at all, because she is Loki’s kin and a power of Ragnarök. Both positions are held in good faith.`,
  notes: [
    'Hel is not a Norse Satan, and her realm is not a Christian hell. The English word hell does come from the same root, which is part of why the two get confused.',
    'Almost all we know of Hel as a goddess is from Snorri’s Prose Edda (c. 1220s). Treat devotion to her as largely modern, and say so when you speak about it.',
    'Some Heathen groups do not hail Hel, Loki or his children at their rites. If you join a group, follow its customs at its gatherings; honour her privately if you wish.',
    'This journey is devotional and defensive only. It contains no curses, no rites for harming anyone and no attempts to contact the dead for answers. Necromancy appears in the myths (Odin raises a seeress); it is not taught here.',
    'Grief can be heavy. If remembrance work brings up more than you can carry, pause the journey and talk to a friend, a counsellor or a bereavement service. That is not failure.',
    'This app is inclusive. Hel keeps all the dead, of every people; the gods are not a matter of race or ancestry, and this journey has no place for folkish ideas about blood. Your ancestors include those of the heart and of your craft, not only of the body.',
    'Keep pets away from offerings, especially bread with raisins, chocolate, onion and garlic, and away from yew, which is highly toxic to people and animals in every part except the flesh of the berry, whose seed is toxic too.',
  ],
  holyDays: ['vetrnaetur', 'disablot', 'jol'],
  stages: [
    {
      kind: 'threshold',
      title: 'At the Gate',
      intro:
        'Hermóðr rode nine nights through dark valleys before he came to Hel’s gate. These first days are about making a quiet place for the dead and for the goddess who keeps them, and greeting her plainly.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'hel-shrine',
          title: 'Set up a still shrine',
          instructions: `Choose a low, quiet place: a shelf near the floor, the top of a chest, a corner of a bookcase. Many keep Hel and the dead apart from the other gods, so if you already have a Heathen shrine, make this a separate one.

Lay down a cloth that is half black and half white, or two cloths side by side, or a plain dark-grey cloth. Add one black and one white candle, or a single unscented candle, a small bowl for offerings and a cup for water or drink. If you have photographs of your own dead, place one or two here. A stone, a piece of jet or obsidian, an antler or a naturally shed bone suit her, as do a sprig of rosemary for remembrance and a handful of soil from somewhere that matters to you.

Leave space. Hel’s shrine should feel calm and uncluttered, half light and half shade. Nothing frightening is needed, and nothing dramatic.`,
          times: 1,
          prompt: 'Who is on your shrine? Who did you leave off, and why?',
        },
        {
          id: 'hel-names',
          title: 'Speak the names',
          instructions:
            'For three evenings, sit at the shrine and say aloud the names of three of your dead: family, friends, teachers, even beloved animals. If you do not know names, say “the ones who came before me, whose names are lost.” Pour a little water into the bowl for them.',
          times: 3,
          every: 'day',
          prompt: 'Which name was hardest to say? Which brought a memory you had forgotten?',
          premade: 'hedge-ancestor-candle-evening',
        },
      ],
      rite: {
        title: 'Greeting at the Gate',
        summary:
          'A short, quiet first greeting: hallow the space, pour water and dark ale for the dead and for Hel, tell her why you have come, and sit in stillness.',
        minutes: 20,
        ingredients: [
          { name: 'A cup of cold water' },
          { name: 'A small cup of dark beer, stout or mead, or blackcurrant juice' },
          { name: 'A piece of dark bread, rye or pumpernickel' },
          { name: 'A black candle and a white candle in safe holders', ref: 'traditional/candle/black' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A sprig of rosemary', ref: 'traditional/herb/rosemary', optional: true },
        ],
        preparation:
          'Wash your hands and face. Tidy the shrine. Set out the water, drink and bread. Turn off screens and dim the room. Evening is the usual time.',
        steps: [
          {
            title: 'Hallow the space',
            instructions:
              'Light the white candle, then the black. Walk once around the room sunwise (clockwise) and name it holy. Some carry a bowl of water and sprinkle a few drops at each corner.',
            spoken: 'I hallow this place for the dead and for their keeper. Let it be still. Let it be safe.',
            light: true,
          },
          {
            title: 'Greet the dead first',
            instructions: 'Pour a little water into the bowl for your dead, and say their names, or the words below.',
            spoken: 'To my dead, known and unknown, the ones whose lives made mine: this water is for you. You are remembered here.',
          },
          {
            title: 'Greet Hel',
            instructions: 'Stand or kneel before the shrine. Lift the cup of dark drink.',
            spoken:
              'Hel, daughter of Angrboða, lady of Éljúðnir, keeper of the hall below the roots. Half in shadow, half in light, you take in all who die of sickness and of age, and you keep them. I come to you with water, ale and bread. I come quietly. Hear me.',
          },
          {
            title: 'Say why you have come',
            instructions:
              'Tell her honestly why you are here. Perhaps it is grief, or fear of death, or a wish that your dead are well kept, or a sense that she has been near. Speak simply, for a few minutes. You do not need fine words.',
            minutes: 5,
          },
          {
            title: 'Give her share',
            instructions:
              'Pour most of the drink into the bowl and lay the bread beside it. Do not drink or eat first: offerings to the dead and their keeper are given whole, not shared.',
            spoken: 'This is given to you whole. A gift calls for a gift; I ask only that you keep my dead well.',
          },
          {
            title: 'Sit in stillness',
            instructions: 'Sit quietly with the candles. Notice the half-light. Let any feeling come and go.',
            minutes: 5,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Thank her and your dead. Snuff the black candle, then the white. Later that night or in the morning, take the bowl outside and pour the drink onto the earth and lay the bread at the foot of a tree or in a garden bed.',
            spoken: 'Thank you, Hel. Thank you, my dead. I will come back.',
            snuff: true,
          },
        ],
        closing:
          'Write down what you said and anything you noticed. Wash the cup and bowl before you use them again. If the rite brought up grief, have something warm to drink and speak to someone you trust.',
        safety:
          'Never leave candles burning unattended, and keep them away from photographs, cloth and dried herbs. Pour drink offerings outside or down a drain, not into houseplants. Clear bread the same day so it does not draw mice, and keep it away from pets. If grief feels overwhelming, stop, and reach out for support.',
      },
    },
    {
      kind: 'study',
      title: 'The Road Downward and Northward',
      intro:
        'Twelve days of reading: who Hel is in the sources, how her realm differs from the woman Snorri describes, and how the Norse world actually treated its dead.',
      days: 12,
      lessons: [
        {
          id: 'hel-who',
          title: 'Loki’s Daughter in Niflheim',
          summary: 'What Snorri tells us about Hel herself, her family, her hall and her appearance, and how much rests on him alone.',
          minutes: 6,
          sections: [
            {
              heading: 'Three children in Jötunheim',
              body: `Snorri Sturluson, the Icelandic chieftain and scholar who wrote the Prose Edda in the 1220s, is our main source for Hel as a person. In Gylfaginning he tells how Loki had three children with the giantess Angrboða, “she who brings grief”: the wolf Fenrir, the Midgard Serpent, and Hel. The gods heard prophecies that great harm would come from them, so Odin sent for the children. He threw the serpent into the sea, the gods raised the wolf and later bound him, and, in Rasmus Anderson’s 1880 translation, “Hel he cast into Niflheim, and gave her power over nine worlds, that she should appoint abodes to them that are sent to her, namely, those who die from sickness or old age.”

So Hel is not a rebel or a fallen power. She is given her work by Odin himself. She is the one who finds a place for every ordinary death.`,
            },
            {
              heading: 'Her hall and household',
              body: `Snorri goes on to describe her house in a string of grim names. Her hall is Éljúðnir, perhaps “damp with sleet.” The walls are very high and the gates huge. Her plate is called Hunger and her knife Famine; her servants are Ganglati and Ganglöt, both meaning something like “slow-walker”; her threshold is Stumbling-block, her bed Sick-bed, and its hangings Gleaming Bale.

These are kennings and wordplay more than a description of furniture: they name what it is like to die slowly, of illness and age. And then the famous image: “One-half of her is blue, and the other half is of the hue of flesh; hence she is easily known. Her looks are very stern and grim.” The Old Norse word blár covers a range from dark blue to black, the colour of a bruise or of a body after death. Modern devotees often picture her as half living and half dead, or half in light and half in shadow.`,
            },
            {
              heading: 'Stern, not cruel',
              body: `It is easy to read Hel as monstrous, and some medieval Christian readers surely did. But look at what she does in the stories. When the god Baldr dies, she takes him in and seats him in honour. When the gods beg for his return, she does not simply refuse; she sets a fair test, that every thing in the world, living and dead, must weep for him. She keeps her word. When the test fails because one giantess will not weep, it is not Hel who is blamed but Loki.

That is the character most modern devotees meet: grave, unflinching, fair, and not to be bargained with lightly. She does not lie about death. That honesty is the heart of her.`,
            },
            {
              heading: 'Her place in the end of the world',
              body: `At Ragnarök, the poem Völuspá says, a ship sails against the gods with Loki at the helm. In Bellows’ translation it carries “the people of Hel”; the manuscripts actually say the people of Muspell, the fire-realm, and Bellows changed it, so even this link is uncertain. Fenrir breaks free and Garmr howls before his cave. Hel herself does not fight in any surviving source; it is her people and her kin who go to war.

Some Heathens find this reason enough not to honour her. Others note that the dead of Hel rising at the end is part of the turning of the world, not a sign of malice, and that after the fire a green earth rises and Baldr comes back from her hall. You will meet both views in the community, and both are honest readings of a few cryptic lines.`,
            },
          ],
          knowAndDont: {
            known:
              'Snorri’s Gylfaginning (ch. 34 and 49–53, Anderson’s numbering) gives Hel’s parentage, appointment, hall, household and appearance, and the story of Baldr in her hall. Völuspá describes Loki steering a ship at Ragnarök and the hound Garmr howling, and Baldrs draumar describes Odin riding to Hel’s high house.',
            unknown:
              'We cannot tell how much of Snorri’s Hel is older tradition and how much is his own learned elaboration, possibly shaped by Christian pictures of death personified. The meanings of Éljúðnir and several household names are uncertain. No source describes prayers or offerings to her.',
          },
          inPractice:
            'Modern devotees often describe Hel in exactly Snorri’s terms, half light and half dark, and build their shrines to match. Many speak to her as the keeper of their own dead first, and as a goddess in her own right only slowly, over time.',
          reflect: [
            'Snorri says Hel takes those who die of sickness and old age, the ordinary deaths. What does it mean to you that there is a goddess for ordinary death?',
            'Where in your own life have you met someone stern but fair? How did they earn your trust?',
          ],
          further: [
            'Gylfaginning ch. 34 and 49–53 in Rasmus B. Anderson, The Younger Edda (1880), public domain.',
            'John Lindow, Norse Mythology: A Guide to the Gods, Heroes, Rituals, and Beliefs (2001), entries “Hel” and “Baldr.”',
            'Rudolf Simek, A Dictionary of Northern Mythology (1993), “Hel.”',
          ],
          library: ['traditional/deity/hel', 'traditional/deity/loki', 'traditional/deity/odin'],
        },
        {
          id: 'hel-realm',
          title: 'Hel the Place, Hel the Goddess',
          summary: 'How the older poems use “hel” for the realm and the grave, the roads and guardians of the dead, and why it is not a place of punishment.',
          minutes: 7,
          sections: [
            {
              heading: 'A word before a woman',
              body: `In the Eddic poems, which are mostly older than Snorri, hel is above all a place. The poets speak of the Hel-way, of men falling “to Hel,” of the gates of Hel. To “go to Hel” is simply to die. The word is related to Old English hell and to an old Germanic root meaning “to cover” or “to hide”: the hidden place, the covered place, perhaps the grave itself.

Many scholars think Hel the goddess grew out of Hel the place, as the realm was personified into its ruler; others think both are old. We simply cannot be sure. For your practice it means this: when you honour Hel, you are honouring both the hidden home of the dead and the one who keeps it, and the old poets did not always separate them.`,
            },
            {
              heading: 'The road there',
              body: `Snorri tells the clearest journey. When Baldr dies, his brother Hermóðr rides Odin’s horse Sleipnir to fetch him back. “He rode nine nights through deep and dark valleys, and did not see light until he came to the Gjallar-river and rode on the Gjallar-bridge, which is thatched with shining gold.” The maiden guarding the bridge, Móðguðr, tells him that five companies of dead men crossed the day before, yet the bridge shook less under them than under him, because he does not have “the hue of dead men.” The way to Hel, she says, lies “downward and northward.”

In the poem Baldrs draumar, Odin rides down to Niflhel and meets a hound, bloody on its breast, that howls at him; in Völuspá the hound Garmr howls before the cave Gnipahellir. These guardians do not judge. They mark the boundary between the living and the dead.`,
            },
            {
              heading: 'Not a place of punishment',
              body: `When Odin reaches Hel’s house in Baldrs draumar, he finds benches bright with rings and platforms decked with gold, and a seeress tells him: “Here for Baldr the mead is brewed, the shining drink” (Henry Adams Bellows’ 1923 translation). The dead are expected, seated and served. When Hermóðr arrives, Baldr is in the high seat.

There are darker places in Norse cosmology. Völuspá describes a hall on Nástrǫnd, the Corpse-Strand, where oath-breakers and murderers wade in venom, and Snorri says the wicked go to Niflhel. Scholars have long suspected Christian influence in these passages, which come late in the tradition. For most of the old sources, Hel is neither heaven nor hell, but the ordinary home of the dead.`,
            },
            {
              heading: 'Valhöll, Fólkvangr, Hel, and the mounds',
              body: `Popular culture often says warriors go to Valhöll and everyone else to Hel. The sources are messier. Odin takes half the battle-slain and Freyja the other half to Fólkvangr; drowned sailors go to the sea-goddess Rán; in the sagas, families believe their dead live on in a holy mountain such as Helgafell in Iceland, or in their own grave mounds, where they can be seen sitting merrily in the firelight. Different families and regions surely believed different things.

Many modern Heathens hold these ideas loosely and do not insist on a map. What matters for a devotee of Hel is that the dead are somewhere, kept, and still part of the family’s story.`,
            },
          ],
          knowAndDont: {
            known:
              'The Eddic poems use hel for the realm of the dead and the Hel-way for the road there. Snorri gives Hermóðr’s ride, Móðguðr and the Gjallarbrú. Baldrs draumar and Völuspá describe the hound, Hel’s house and the mead brewed for Baldr. Eyrbyggja saga tells of the dead living in Helgafell.',
            unknown:
              'Whether the goddess or the place came first is unknown. The punishing halls of Nástrǫnd and Niflhel may reflect Christian influence. There was probably never one agreed Norse map of the afterlife.',
          },
          inPractice:
            'Some Heathens picture a road and a bridge when they remember the dead, and speak to Móðguðr and Garmr with respect as guardians of the threshold. Others simply say “may you be well kept in Hel’s hall” as a blessing at funerals and on memorial days.',
          reflect: [
            'What do you actually believe happens after death? Write it down honestly, even if it is “I don’t know.”',
            'The dead in Baldrs draumar are expected and served. How would you like your own dead to be received?',
          ],
          further: [
            'Baldrs draumar and Völuspá in Henry Adams Bellows, The Poetic Edda (1923), public domain.',
            'Gylfaginning ch. 52 in Anderson (1880).',
            'H. R. Ellis Davidson, The Road to Hel: A Study of the Conception of the Dead in Old Norse Literature (1943).',
          ],
          library: ['traditional/deity/hel', 'traditional/deity/baldur', 'traditional/herb/yew'],
        },
        {
          id: 'hel-dead',
          title: 'How the Norse Kept Their Dead',
          summary: 'Graves, ships and mounds, Hel-shoes, the inheritance feast and Winter Nights: the real, well-attested customs on which modern Hel devotion is built.',
          minutes: 7,
          sections: [
            {
              heading: 'Graves and goods',
              body: `If we know little about Hel’s worship, we know a great deal about how the dead were treated, from archaeology and from the sagas. People were burned or buried, sometimes in boats or ship-shaped settings of stones, with the things they would need: clothes, tools, weapons, jewellery, food, drink, animals. The Oseberg ship burial in Norway, from 834, held two women with beds, sledges, a wagon, textiles, buckets of wild apples and cereal. Ordinary graves held a knife, a comb, a few beads.

Snorri’s Ynglinga saga, in Laing’s translation, has Odin decree that “all dead men should be burned, and their property laid with them upon the pile,” so that each would come to the afterlife with the riches he had. That is a later author explaining an old custom, but the custom itself is everywhere in the ground.`,
            },
            {
              heading: 'Hel-shoes and the road',
              body: `Gísla saga, written in the 1200s about events in the 900s, describes tying helskór, Hel-shoes, onto the feet of a dead man so that he could walk the road to Valhöll or to Hel. It is one of the few saga passages that names a funeral custom outright, and modern Heathens sometimes echo it by placing a pair of soft shoes or slippers with an ancestor’s photograph, or by putting good walking shoes in a coffin.

The image matters. The dead have a road to walk, and the living help them on their way. Honouring Hel begins there: by helping the dead go, and then remembering them.`,
            },
            {
              heading: 'The inheritance feast and the mounds',
              body: `In the Viking Age a family did not simply bury its dead. An heir held an erfi, a funeral or inheritance ale, sometimes days or weeks later. Toasts were drunk to the dead, oaths might be made at the cup, and only then did the heir take the high seat. The best-known description, King Sveinn’s funeral ale for his father where the Jómsvikings made their famous vows, is in Snorri’s saga of Olaf Tryggvason, but the custom appears across the sagas and law codes.

Mounds and graves were visited, and some families sat out on the mound at night. The law codes of Christian Norway still had to forbid sitting out to “wake up trolls,” and offerings to mounds lasted in folk custom into modern times: the bowl of porridge or ale left on the haugr, the farm mound, at Christmas.`,
            },
            {
              heading: 'Winter Nights and the dísir',
              body: `The sagas speak of a sacrifice at the start of winter, around mid-October, “for a good year,” and of offerings to the álfar and the dísir, beings closely linked with the ancestors of a family. Modern Heathens keep this as Winter Nights (Vetrnætur), the most natural time of year for honouring Hel and the dead. Dísablót in late winter honours the ancestral mothers, and Yule was also a time when the dead were thought to travel and visit.

Notice that none of this names Hel. It is ancestor work, family work, the care of graves and memory. For a modern devotee, it is the most solid ground there is. Hel is the keeper; your work is to remember.`,
            },
          ],
          knowAndDont: {
            known:
              'Burials with goods, ship burials (Oseberg, Gokstad), mounds and cremations are richly attested in archaeology. Gísla saga describes Hel-shoes; the sagas and laws describe the erfi feast and sitting out on mounds; Winter Nights sacrifices, álfablót and dísablót appear in the sagas and skaldic poetry.',
            unknown:
              'How widely Hel-shoes were used is unknown; Gísla saga is our one clear source. Beliefs about where the dead went surely varied. No source links these funeral customs to worship of Hel as a goddess; that link is modern.',
          },
          inPractice:
            'Common modern practices: tending graves, keeping an ancestor shelf, a family meal with a place set for the dead at Winter Nights, toasting the dead by name at sumbel, and writing down family stories so they are not lost.',
          reflect: [
            'Whose grave could you visit or tend this month? If there is none you can reach, what could stand in for it?',
            'What stories of your dead have not yet been written down?',
          ],
          further: [
            'Neil Price, The Children of Ash and Elm (2020), chapters on death and burial.',
            'Gísla saga, trans. Martin S. Regal, in The Sagas of Icelanders (Penguin, 2000).',
            'Terry Gunnell, “The Season of the Dísir” (2000), on Winter Nights.',
          ],
          library: ['traditional/deity/hel', 'traditional/herb/rosemary', 'traditional/crystal/jet'],
          premade: ['hedge-ancestor-candle-evening', 'hedge-house-spirit-offering'],
        },
      ],
      practices: [
        {
          id: 'hel-stories',
          title: 'Write one story of the dead',
          instructions:
            'Every few days, write down one story about someone who has died: a joke they told, a recipe, a hard lesson, how they walked into a room. Twelve days, four stories. Read one aloud at the shrine.',
          times: 4,
          prompt: 'Whose story did you write today, and what did you learn by writing it?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine Nights on the Hel-Way',
      intro:
        'Hermóðr rode nine nights to reach Hel’s gate. In this stage you learn how Hel is honoured today, her tides and offerings, the hard questions around her, and keep nine nights of remembrance.',
      days: 9,
      lessons: [
        {
          id: 'hel-today',
          title: 'Hel in Modern Heathenry',
          summary: 'Who honours Hel today and how, the disagreements around her, ancestor work as the foundation, and grief.',
          minutes: 7,
          sections: [
            {
              heading: 'A goddess honoured mostly now',
              body: `Hel has more devotees today than she has evidence of worship in the past. People come to her through grief, through work with the dying (hospice nurses, funeral directors, those who wash and dress the dead), through a lifelong comfort with mortality, or because she was there when someone they loved died. Many describe her as stern, quiet and protective of the dead, and as having little patience for theatre.

That is a real and serious modern devotion. It deserves the same honesty as any other: it is built on Snorri’s portrait, on the old customs of the dead, and on personal experience, and it does not need to pretend to be older than it is.`,
            },
            {
              heading: 'Where Heathens disagree',
              body: `Heathenry is a living religion with many communities, and they do not agree about Hel. Some groups, especially in parts of American Ásatrú, will not hail Loki or his children at their rites, and see Hel as a power to be respected from a distance rather than invited in. Others, including many inclusive kindreds and the community sometimes called Rökkatru (honouring giants and the “darker” powers), give her an honoured place. Many simply honour her at Winter Nights and funerals and leave it there.

If you are part of a group, follow its customs at its rites. Do not bring Hel to a sumbel where she is not welcome, and do not be offended if others keep their distance. Your private shrine is your own.`,
            },
            {
              heading: 'Begin with your own dead',
              body: `Nearly every experienced devotee gives the same advice: start with your ancestors and your own dead. Speak their names, keep their photos, tend their graves, tell their stories, cook their recipes. Ancestors here means all of them: blood family, adoptive and chosen family, teachers, friends, the people of the land where you live, the ones whose names are lost.

This keeps the relationship grounded. Hel is the keeper of the dead; the dead are what she keeps. If you love and remember them well, you are already doing what she cares about. A devotion that skips the dead to get to the goddess tends to drift into fantasy.`,
            },
            {
              heading: 'Grief, and what this is not',
              body: `This work can hold grief. Many people find that speaking to Hel about their dead loosens something that has been stuck. It can also bring grief up that was buried. Go slowly. If you find yourself unable to sleep, eat or work, or thinking of joining the dead yourself, stop the journey and reach out to a doctor, a counsellor or a crisis line today. Hel is not in a hurry for anyone.

This journey does not teach necromancy, spirit summoning or asking the dead for oracles. Those appear in the myths and in some modern practice, but they are not needed to honour Hel and they are easy to do badly. Remembrance is the core.`,
            },
          ],
          knowAndDont: {
            known:
              'Devotion to Hel is widespread in modern Heathenry and Norse-inspired paganism. Ancestor veneration is attested in the old sources and is central to most modern Heathen practice. Heathen communities differ openly about whether to honour Loki and his children.',
            unknown:
              'There is no evidence that Hel was worshipped this way in the Viking Age; modern devotion is reconstruction and personal experience. Descriptions of her character today come from practitioners’ experience, not from ancient texts.',
          },
          inPractice:
            'A common pattern: a separate ancestor shelf with Hel honoured at one side; water or a little drink poured for the dead weekly; a Winter Nights meal with a place set for them; quiet offerings to Hel at funerals and anniversaries of deaths.',
          reflect: [
            'Who are your ancestors of the heart, the ones who shaped you without sharing your blood?',
            'How does your grief feel today, and what does it need?',
          ],
          further: [
            'Galina Krasskova, Exploring the Northern Tradition (2005), for one modern devotional voice (read alongside others).',
            'The Troth, Our Troth, vol. 1 (2006), on the goddesses and the dead.',
          ],
          library: ['traditional/deity/hel', 'traditional/deity/frigg', 'traditional/crystal/smoky_quartz'],
          premade: ['hedge-letting-go-of-the-dead', 'hedge-ancestor-candle-evening'],
        },
        {
          id: 'hel-days',
          title: 'Her Tides, Her Offerings, and What Not to Do',
          summary: 'When to honour Hel through the year, what to give her and how, and the customs that keep the relationship sound.',
          minutes: 6,
          sections: [
            {
              heading: 'Her tides',
              body: `No source gives Hel a festival or a weekday. Modern devotees honour her at the times the old calendar gives to the dead. Winter Nights (Vetrnætur), at the start of winter in late October, is the main one: the old sacrifice “for a good year” and the álfablót, now a night for ancestors. Dísablót in late winter honours the ancestral mothers, and many include Hel quietly. Yule (Jól), the twelve nights of midwinter, was a time when the dead rode abroad and were welcomed with food left out; some keep Mother Night, the first night, for the dead.

Many also honour her on the anniversaries of deaths in their own family, at funerals, and at the dark moon. Some choose a weekday, often Saturday, for a small weekly offering; that is personal practice.`,
            },
            {
              heading: 'What to give',
              body: `Keep it plain. Cold water is the simplest and most common offering. Dark beer, stout, mead or red wine suit her, and dark bread, rye, porridge and butter, the foods of an ordinary farm. Soil, stones, a sprig of rosemary or yew (yew handled with care, hands washed afterwards, kept from children and pets, never burned), and candles in black and white are traditional in modern practice.

Some of the best offerings are acts: tending a neglected grave, giving to a hospice, volunteering with the dying, attending a funeral for someone with few mourners, learning a dead relative’s language or craft. Hel is often said to value such work over any gift on the shelf.`,
            },
            {
              heading: 'How to give',
              body: `Offerings to the dead and to Hel are usually given whole: pour her share first and do not drink from her cup or eat her bread afterwards. This is a modern custom, borrowed in part from the wider practice of not sharing food with the dead, rather than a rule from the sources, but it is widely kept and suits her.

The Hávamál’s rule still applies: “gifts with gifts requite” (Bellows, stanza 42). A gift creates a bond and calls for a gift in return; that is how Norse relationships with gods and with people worked. Give regularly and modestly. The same poem warns, “Better no prayer than too big an offering, By thy getting measure thy gift.” Do not overpromise to Hel.

After the rite, take food and drink outside and give them to the earth, at the foot of a tree, in a garden bed, or on a grave where that is allowed. Do not leave food in cemeteries that forbid it.`,
            },
            {
              heading: 'What not to do',
              body: `Don’t treat her as a horror-film figure or a dark aesthetic. Don’t perform for her. Don’t make rash vows about death, yours or anyone else’s. Don’t ask her to harm anyone; this journey has no curses, and devotees widely say she has no interest in them. Don’t disturb real graves, take bones from them, or trespass in burial grounds; naturally shed antlers or bones bought ethically are fine on a shrine.

Don’t put your dead on the same shelf as Thor’s hammer and Freyja’s flowers if you can avoid it; many keep the dead and Hel apart. And don’t let this work isolate you. Hel keeps the dead; the living need the living.`,
            },
          ],
          knowAndDont: {
            known:
              'Winter Nights, dísablót and Yule are attested seasonal feasts linked with the álfar, the dísir and the dead. Hávamál 42 and 146 give the principle of balanced gift-giving. Offerings to mounds and the dead persisted in Scandinavian folk custom.',
            unknown:
              'No source names Hel at any of these feasts, and no offerings to her are recorded. Her colours, stones and plants are modern associations. The custom of not sharing her offerings is modern.',
          },
          inPractice:
            'Many devotees give Hel a cup of cold water and a candle once a week, pour dark ale for her at Winter Nights, and mark each family death-day with a small offering and the dead person’s favourite food set out for them.',
          reflect: [
            'Which of your family’s death-days do you know? Which would you like to learn?',
            'What act of care for the dying or the dead could you offer this year?',
          ],
          further: ['Hávamál in Bellows (1923).', 'Jenny Blain, Nine Worlds of Seid-Magic (2002), on modern practice and the dead.'],
          library: ['traditional/deity/hel', 'traditional/candle/black', 'traditional/crystal/obsidian', 'traditional/herb/elder'],
          premade: ['folk-simple-blot', 'hedge-dusk-rite'],
        },
      ],
      practices: [
        {
          id: 'hel-nine-nights',
          title: 'Nine nights of remembrance',
          instructions: `For nine nights, at the shrine, light the candles. Pour a little cold water into the bowl. Say Hel’s name, then the name of one of your dead, a different one each night where you can. Tell her one thing about that person, and ask her to keep them well.

Sit for five minutes in the half-light. Snuff the candles. Pour the water onto the earth before bed or in the morning.

On the ninth night, cook or buy something one of your dead loved, eat some in their memory, and set a portion on the shrine for them and for Hel. Give it to the earth the next day.`,
          times: 9,
          every: 'day',
          prompt: 'Whose name did you speak tonight, and what did you tell Hel about them?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'At the Gjallarbrú',
      intro:
        'Móðguðr asks every traveller who they are and why they ride. Take a few days to read your journal and ask yourself the same. Pausing, stopping, honouring Hel at Winter Nights without a vow, or turning to another god are all good outcomes.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'hel-reread',
          title: 'Read your record',
          instructions: 'Read everything you have written since the first rite, and the stories of the dead you wrote down.',
          times: 1,
          prompt: 'What has this month with Hel and your dead changed?',
        },
      ],
      questions: [
        'Did this work feel like meeting Hel, or like remembering your dead? Both are good, and the second may be all that is needed.',
        'Are you drawn to Hel herself, or to a dark aesthetic? Be honest; the aesthetic fades.',
        'How is your grief? Is a dedication the right step now, or would it be better to wait until the loss is less raw?',
        'How do you feel about honouring a goddess whose worship is almost entirely modern?',
        'If you belong to a Heathen group, how will you hold your devotion alongside its customs?',
        'What offering and act of remembrance can you keep for a year?',
        'If you stop here, what will you keep: the shrine for your dead, the stories, the names?',
      ],
    },
    {
      kind: 'dedication',
      title: 'Before the High Seat',
      intro: `If you have chosen to go on, this is the dedication: a quiet rite in which you honour your dead, give Hel her gift, and speak a vow you have written in advance. It is a self-dedication between you and Hel. It is not an initiation into any group, and it does not replace a group’s own rites. Keep the vow modest and true: Hel keeps her word, and asks the same.`,
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'hel-write-vow',
          title: 'Write the vow',
          instructions:
            'A day before, write your vow: the offering you will keep (for example, cold water and a candle each week), the remembrance you will keep (the death-days of your family, a grave to tend, stories to write), how long (a year and a day is common), and what you ask (that your dead are well kept, and help to face death honestly).',
          times: 1,
          prompt: 'Write the final vow here.',
        },
      ],
      rite: {
        title: 'Dedication to Hel',
        summary:
          'A quiet blót for the dead and their keeper: hallow the space, speak the names of your dead, give Hel water, ale and bread whole, swear your vow, and hallow a token.',
        minutes: 40,
        ingredients: [
          { name: 'A cup of cold water' },
          { name: 'A horn or cup of dark ale, stout or mead (or blackcurrant juice)' },
          { name: 'A piece of dark bread or a small bowl of porridge with butter' },
          { name: 'A black candle and a white candle in safe holders', ref: 'traditional/candle/white' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A list of the names of your dead' },
          { name: 'A token: a piece of jet or obsidian, a small stone from a meaningful place, or a black-and-white bead', ref: 'traditional/crystal/jet', optional: true },
          { name: 'Your written vow' },
        ],
        preparation:
          'Clean the shrine and room. Set out the water, drink and bread, the list of names, the token and the vow. Winter Nights, a family death-day or the night after your ninth night are good times. Dim the lights.',
        steps: [
          {
            title: 'Hallow the space',
            instructions: 'Light the white candle, then the black. Walk once around the room sunwise and name it holy.',
            spoken: 'I hallow this place for the dead and for their keeper. Let it be still, let it be safe, let only truth be spoken here.',
            light: true,
          },
          {
            title: 'Speak the names',
            instructions:
              'Read the names of your dead slowly, one by one. After each, pour a drop of water into the bowl. End with those whose names are lost.',
            spoken: 'And all the ones before them, whose names are lost to me but not to Hel. You are remembered.',
          },
          {
            title: 'Hail her',
            instructions: 'Lift the cup of dark drink and call her by her names.',
            spoken:
              'Hel, daughter of Loki and Angrboða, sister of the wolf and the serpent. Lady of Éljúðnir, keeper of the high house below the roots, where the benches are bright with rings and the mead is brewed for those who come. Half in shadow and half in light, you take in every ordinary death and find each one a place. I come before your seat. Hear me.',
          },
          {
            title: 'Give her gift',
            instructions: 'Pour the drink into the bowl and lay the bread beside it. Do not drink or eat from them.',
            spoken: 'This is given to you whole. Gift for gift: keep my dead well, and teach me to face death without lies.',
          },
          {
            title: 'Swear the vow',
            instructions: 'Stand or kneel. Read your vow aloud, once, clearly. Then touch the bowl or lay your hand on the shrine to seal it.',
            spoken: 'Before Hel and before my dead, I make this vow. Let it hold as long as I keep it.',
          },
          {
            title: 'Hallow the token',
            instructions:
              'Hold the token in the half-light between the two candles, at a safe distance from the flames. Keep it on the shrine or carry it.',
            spoken: 'Let this be a sign of my troth to Hel. When I see it, let me remember the dead and the road that we all walk.',
          },
          {
            title: 'Sit with the dead',
            instructions: 'Sit quietly for several minutes. Let memories come. Let the stillness be enough.',
            minutes: 7,
            timed: true,
          },
          {
            title: 'Close',
            instructions:
              'Thank Hel and your dead. Snuff the black candle, then the white. Take the bowl outside and give it to the earth, at the foot of a tree or in a garden bed.',
            spoken: 'Hail Hel, and thanks. Hail my dead. The vow is made.',
            snuff: true,
          },
        ],
        closing:
          'Write the date and your vow in your journal and keep the paper copy for your rededication. Eat something warm afterwards and, if you can, call or visit someone living whom you love.',
        safety:
          'Keep candles away from cloth, paper and photographs, and never leave them burning. Do not burn yew or other plants indoors; yew is toxic. Pour drink outside or down a drain, not into houseplants. Clear food offerings the same day and keep them away from pets. If grief or dark thoughts become overwhelming, stop and reach out to someone, or a crisis line, straight away.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping Faith with the Dead',
      intro: `Keep the offering and the remembrance you vowed. Honour Hel and your dead at Winter Nights, at Dísablót and on Mother Night at Yule, and on your family’s death-days. Tend the graves you can reach and the stories you can save. Each year, read your vow, say how you kept it, and renew it.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'hel-weekly',
          title: 'The weekly cup',
          instructions:
            'Once a week, light a candle at the shrine, pour cold water for your dead and for Hel, say one name, and sit a few minutes. Pour the water onto the earth after.',
          times: 52,
          every: 'week',
          prompt: 'Whose name did you speak this week?',
        },
        {
          id: 'hel-tides',
          title: 'Keep the tides of the dead',
          instructions:
            'At Winter Nights, Dísablót and Yule, hold a blót for the ancestors with Hel honoured. At Winter Nights, set a place at the table for the dead and leave it until morning.',
          times: 3,
          every: 'holy-day',
          prompt: 'Who did you remember at this tide, and what did you give?',
          premade: 'folk-simple-blot',
        },
        {
          id: 'hel-rededicate',
          title: 'Yearly rededication',
          instructions:
            'At Winter Nights or on the anniversary of your dedication, repeat the rite. Read last year’s vow first and say how you kept it. Add the names of anyone who died this year.',
          times: 1,
          prompt: 'How did last year’s vow go, and what will this year’s be?',
        },
      ],
    },
  ],
  sources: [
    'Rasmus B. Anderson, trans., The Younger Edda (1880), public domain: Gylfaginning ch. 34 (“Hel he cast into Niflheim…”, “One-half of her is blue…”) and ch. 52 (“He rode nine nights through deep and dark valleys…”, “the hue of dead men”, “downward and northward”), quoted from Project Gutenberg ebook #18947 (https://www.gutenberg.org/ebooks/18947); Ynglinga saga ch. 8 (“all dead men should be burned…”) from the Laing translation reproduced in the same edition.',
    'Henry Adams Bellows, trans., The Poetic Edda (1923), public domain: Baldrs draumar 7 (“Here for Baldr the mead is brewed, the shining drink”), Hávamál 42 and 146, quoted from Project Gutenberg ebook #73533 (https://www.gutenberg.org/ebooks/73533); Völuspá 51 (“the people of Hel”, with Bellows’ note that the manuscripts read “people of Muspell”) and Völuspá 44 paraphrased.',
    'Gísla saga (Hel-shoes), Eyrbyggja saga (Helgafell), Óláfs saga Tryggvasonar (the erfi), the Norwegian Christian law codes on sitting out: paraphrased.',
    'Archaeology: the Oseberg ship burial (834). Scholarship: H. R. Ellis Davidson, The Road to Hel (1943); John Lindow (2001); Rudolf Simek (1993); Terry Gunnell (2000); Neil Price (2020).',
  ],
};
